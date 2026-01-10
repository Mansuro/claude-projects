import * as fs from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { getProject, resolveProjectPath, loadConfig } from './config';

export interface DispatchOptions {
  verbose?: boolean;
  dryRun?: boolean;
}

/**
 * Dispatch a task to a project by running Claude in that directory
 */
export async function dispatchTask(
  projectName: string,
  task: string,
  options: DispatchOptions = {}
): Promise<void> {
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
