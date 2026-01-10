import * as fs from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { getProject, resolveProjectPath, loadConfig } from './config';
import {
  generateTaskId,
  getLogFilePath,
  addTask,
  updateTask,
} from './taskManager';
import { BackgroundTask } from './types';

export interface DispatchOptions {
  verbose?: boolean;
  dryRun?: boolean;
  background?: boolean;
}

/**
 * Dispatch a task to a project in the background
 */
export function dispatchTaskBackground(
  projectName: string,
  task: string,
  options: DispatchOptions = {}
): string {
  const project = getProject(projectName);
  const config = loadConfig();
  const claudePath = config.settings?.claudePath || 'claude';

  // Resolve and validate project path
  const resolvedPath = resolveProjectPath(project.path);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Project directory does not exist: ${resolvedPath}\n` +
      `Please check the path in your config file.`
    );
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${resolvedPath}`);
  }

  // Generate task ID and log file
  const taskId = generateTaskId();
  const logFile = getLogFilePath(taskId);

  // Prepare command
  const args: string[] = [...(project.defaultArgs || [])];

  if (options.dryRun) {
    console.log(chalk.yellow('🏃 Dry run - would execute in background:'));
    console.log(chalk.gray(`  Project: ${project.name}`));
    console.log(chalk.gray(`  Task: ${task}`));
    console.log(chalk.gray(`  Log file: ${logFile}`));
    console.log();
    return taskId;
  }

  // Create log file stream
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Log task info
  logStream.write(`Task ID: ${taskId}\n`);
  logStream.write(`Project: ${project.name}\n`);
  logStream.write(`Task: ${task}\n`);
  logStream.write(`Started: ${new Date().toISOString()}\n`);
  logStream.write(`${'='.repeat(60)}\n\n`);

  // Execute Claude in background
  const claude = spawn(claudePath, args, {
    cwd: resolvedPath,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    detached: true,
  });

  // Send the task as input
  claude.stdin.write(task + '\n');
  claude.stdin.end();

  // Pipe output to log file
  claude.stdout.pipe(logStream);
  claude.stderr.pipe(logStream);

  // Create background task record
  const backgroundTask: BackgroundTask = {
    id: taskId,
    project: project.name,
    task,
    pid: claude.pid!,
    status: 'running',
    startedAt: new Date().toISOString(),
    logFile,
  };

  addTask(backgroundTask);

  // Handle process completion
  claude.on('close', (code) => {
    logStream.write(`\n${'='.repeat(60)}\n`);
    logStream.write(`Ended: ${new Date().toISOString()}\n`);
    logStream.write(`Exit code: ${code}\n`);
    logStream.end();

    updateTask(taskId, {
      status: code === 0 ? 'completed' : 'failed',
      endedAt: new Date().toISOString(),
      exitCode: code || undefined,
    });
  });

  claude.on('error', (error) => {
    logStream.write(`\nError: ${error.message}\n`);
    logStream.end();

    updateTask(taskId, {
      status: 'failed',
      endedAt: new Date().toISOString(),
    });
  });

  // Unref the process so the parent doesn't wait for it
  claude.unref();

  return taskId;
}

/**
 * Dispatch a task to a project by running Claude in that directory
 */
export async function dispatchTask(
  projectName: string,
  task: string,
  options: DispatchOptions = {}
): Promise<void> {
  // If background mode, dispatch and return immediately
  if (options.background) {
    const taskId = dispatchTaskBackground(projectName, task, options);

    if (!options.dryRun) {
      console.log(chalk.bold(`\n📦 Project:`), chalk.cyan(projectName));
      console.log(chalk.bold(`💬 Task:`), chalk.white(task));
      console.log(chalk.bold(`🆔 Task ID:`), chalk.yellow(taskId));
      console.log(
        chalk.green('\n✓ Task started in background')
      );
      console.log(
        chalk.gray(`  View logs: ${chalk.white(`ccode logs ${taskId}`)}`)
      );
      console.log(
        chalk.gray(`  Check status: ${chalk.white('ccode status')}`)
      );
      console.log();
    }
    return;
  }

  const project = getProject(projectName);
  const config = loadConfig();
  const claudePath = config.settings?.claudePath || 'claude';

  // Resolve and validate project path
  const resolvedPath = resolveProjectPath(project.path);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Project directory does not exist: ${resolvedPath}\n` +
      `Please check the path in your config file.`
    );
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${resolvedPath}`);
  }

  // Prepare command
  const args: string[] = [...(project.defaultArgs || [])];

  // Display info
  console.log(chalk.bold(`\n📦 Project:`), chalk.cyan(project.name));
  console.log(chalk.bold(`📁 Path:`), chalk.gray(resolvedPath));
  console.log(chalk.bold(`💬 Task:`), chalk.white(task));
  console.log();

  if (options.dryRun) {
    console.log(chalk.yellow('🏃 Dry run - would execute:'));
    console.log(chalk.gray(`  cd ${resolvedPath}`));
    console.log(chalk.gray(`  ${claudePath} ${args.join(' ')}`));
    console.log(chalk.gray(`  (with input: ${task})`));
    console.log();
    return;
  }

  if (options.verbose) {
    console.log(chalk.gray(`Executing: ${claudePath} ${args.join(' ')}`));
    console.log(chalk.gray(`Working directory: ${resolvedPath}`));
    console.log();
  }

  // Execute Claude
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('🚀 Launching Claude...\n'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    const claude = spawn(claudePath, args, {
      cwd: resolvedPath,
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
    });

    // Send the task as input
    claude.stdin.write(task + '\n');
    claude.stdin.end();

    claude.on('error', (error) => {
      reject(
        new Error(
          `Failed to start Claude: ${error.message}\n` +
          `Make sure Claude Code is installed and accessible.`
        )
      );
    });

    claude.on('close', (code) => {
      console.log();
      console.log(chalk.gray('─'.repeat(60)));

      if (code === 0) {
        console.log(chalk.green('\n✓ Task completed successfully'));
        resolve();
      } else {
        reject(new Error(`Claude exited with code ${code}`));
      }
    });
  });
}
