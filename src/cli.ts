#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { createSampleConfig, configExists, listProjects, getConfigPath, addProject, removeProject } from './config';
import { dispatchTask } from './dispatcher';
import {
  getTasks,
  getTask,
  killTask,
  updateTaskStatuses,
  cleanupOldTasks,
} from './taskManager';
import { BackgroundTask } from './types';

const program = new Command();

program
  .name('ccode')
  .description('Multi-project manager for Claude Code')
  .version('0.2.3');

/**
 * Initialize config file
 */
program
  .command('init')
  .description('Create a sample config file at ~/.claude-projects.yaml')
  .action(() => {
    try {
      createSampleConfig();
      const configPath = getConfigPath();
      console.log(chalk.green('✓ Created sample config at:'), configPath);
      console.log(chalk.blue('\nEdit this file to add your projects.'));
      console.log(chalk.blue('Then run:'), chalk.bold('ccode list'), chalk.blue('to see your projects'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * List all projects
 */
program
  .command('list')
  .description('List all projects from config')
  .action(() => {
    try {
      const projects = listProjects();

      if (projects.length === 0) {
        console.log(chalk.yellow('No projects configured.'));
        console.log(chalk.blue('Run:'), chalk.bold('ccode init'), chalk.blue('to create a config file.'));
        return;
      }

      console.log(chalk.bold('\nConfigured Projects:\n'));

      projects.forEach((project) => {
        console.log(chalk.cyan(`  ${project.name}`));
        console.log(chalk.gray(`    Path: ${project.path}`));
        if (project.description) {
          console.log(chalk.gray(`    ${project.description}`));
        }
        console.log();
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Add a project
 */
program
  .command('add')
  .argument('<name>', 'Project name')
  .argument('[path]', 'Project path (defaults to current directory)')
  .option('-d, --description <desc>', 'Project description')
  .description('Add a new project to the config')
  .action((name: string, projectPath: string | undefined, options) => {
    try {
      // Use current directory if no path provided
      const finalPath = projectPath || process.cwd();

      // Resolve to absolute path
      const absolutePath = path.resolve(finalPath);

      // Check if directory exists
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Directory does not exist: ${absolutePath}`);
      }

      if (!fs.statSync(absolutePath).isDirectory()) {
        throw new Error(`Path is not a directory: ${absolutePath}`);
      }

      // Add the project
      addProject(name, absolutePath, options.description);

      console.log(chalk.green('\n✓ Project added successfully'));
      console.log(chalk.cyan(`  Name: ${name}`));
      console.log(chalk.gray(`  Path: ${absolutePath}`));
      if (options.description) {
        console.log(chalk.gray(`  Description: ${options.description}`));
      }
      console.log();
      console.log(chalk.blue('Run:'), chalk.bold('ccode list'), chalk.blue('to see all projects'));
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Remove a project
 */
program
  .command('remove')
  .argument('<name>', 'Project name to remove')
  .alias('rm')
  .description('Remove a project from the config')
  .action((name: string) => {
    try {
      removeProject(name);

      console.log(chalk.green('\n✓ Project removed successfully'));
      console.log(chalk.gray(`  Name: ${name}`));
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Dispatch task to project
 */
program
  .argument('<project>', 'Project name from config')
  .argument('<task>', 'Task description for Claude')
  .option('-v, --verbose', 'Show verbose output')
  .option('-b, --background', 'Run task in background')
  .option('--dry-run', 'Show what would be executed without running it')
  .description('Run a Claude task in the specified project')
  .action(async (projectName: string, task: string, options) => {
    try {
      await dispatchTask(projectName, task, {
        verbose: options.verbose,
        dryRun: options.dryRun,
        background: options.background,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Batch execute tasks from a file
 */
program
  .command('batch')
  .argument('<file>', 'YAML file containing project:task pairs')
  .option('-b, --background', 'Run all tasks in background (default: true)', true)
  .description('Execute multiple tasks from a file')
  .action(async (file: string, options) => {
    try {
      if (!fs.existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }

      const content = fs.readFileSync(file, 'utf-8');
      const tasks = yaml.parse(content);

      if (!tasks || typeof tasks !== 'object') {
        throw new Error('Invalid task file format. Expected YAML with project:task pairs');
      }

      console.log(chalk.bold('\n📋 Batch Execution\n'));

      const taskEntries = Object.entries(tasks);
      let successCount = 0;
      let failCount = 0;

      for (const [project, task] of taskEntries) {
        if (typeof task !== 'string') {
          console.log(chalk.yellow(`⚠ Skipping ${project}: task must be a string`));
          failCount++;
          continue;
        }

        try {
          await dispatchTask(project, task, {
            background: options.background,
          });
          successCount++;
        } catch (error) {
          if (error instanceof Error) {
            console.error(chalk.red(`✗ Failed ${project}:`), error.message);
          }
          failCount++;
        }
      }

      console.log();
      console.log(chalk.bold('Summary:'));
      console.log(chalk.green(`  ✓ Started: ${successCount}`));
      if (failCount > 0) {
        console.log(chalk.red(`  ✗ Failed: ${failCount}`));
      }
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Show status of background tasks
 */
program
  .command('status')
  .option('-a, --all', 'Show all tasks (default: only running/recent)')
  .description('Show status of background tasks')
  .action((options) => {
    try {
      // Update statuses first
      updateTaskStatuses();

      const allTasks = getTasks();

      if (allTasks.length === 0) {
        console.log(chalk.yellow('\nNo background tasks found.'));
        console.log(chalk.blue('Run a task with:'), chalk.bold('ccode <project> <task> --background\n'));
        return;
      }

      // Filter tasks if not showing all
      const tasks = options.all
        ? allTasks
        : allTasks.filter(
            (t) =>
              t.status === 'running' ||
              (t.endedAt &&
                new Date(t.endedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)
          );

      if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo recent background tasks.'));
        console.log(chalk.gray('Use --all to show all tasks\n'));
        return;
      }

      console.log(chalk.bold('\n📊 Background Tasks\n'));

      const runningTasks = tasks.filter((t) => t.status === 'running');
      const completedTasks = tasks.filter((t) => t.status === 'completed');
      const failedTasks = tasks.filter((t) => t.status === 'failed');
      const killedTasks = tasks.filter((t) => t.status === 'killed');

      const printTask = (task: BackgroundTask) => {
        const statusIcon: Record<string, string> = {
          running: chalk.blue('●'),
          completed: chalk.green('✓'),
          failed: chalk.red('✗'),
          killed: chalk.gray('⊗'),
        };
        const icon = statusIcon[task.status];

        console.log(
          `${icon} ${chalk.cyan(task.id)} - ${chalk.white(task.project)}`
        );
        console.log(`  ${chalk.gray(task.task)}`);
        console.log(`  ${chalk.gray(`Started: ${new Date(task.startedAt).toLocaleString()}`)}`);
        if (task.endedAt) {
          console.log(`  ${chalk.gray(`Ended: ${new Date(task.endedAt).toLocaleString()}`)}`);
        }
        console.log();
      };

      if (runningTasks.length > 0) {
        console.log(chalk.bold.blue('Running:\n'));
        runningTasks.forEach(printTask);
      }

      if (completedTasks.length > 0) {
        console.log(chalk.bold.green('Completed:\n'));
        completedTasks.forEach(printTask);
      }

      if (failedTasks.length > 0) {
        console.log(chalk.bold.red('Failed:\n'));
        failedTasks.forEach(printTask);
      }

      if (killedTasks.length > 0) {
        console.log(chalk.bold.gray('Killed:\n'));
        killedTasks.forEach(printTask);
      }

      console.log(
        chalk.gray(`Total: ${tasks.length} tasks`)
      );
      if (!options.all) {
        console.log(chalk.gray('Use --all to show all tasks'));
      }
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * View logs for a task
 */
program
  .command('logs')
  .argument('<task-id>', 'Task ID to view logs for')
  .option('-f, --follow', 'Follow log output (tail -f)')
  .description('View logs for a background task')
  .action((taskId: string, options) => {
    try {
      const task = getTask(taskId);

      if (!task) {
        console.error(chalk.red('\nError:'), `Task not found: ${taskId}`);
        console.log(chalk.blue('Run:'), chalk.bold('ccode status'), chalk.blue('to see all tasks\n'));
        process.exit(1);
      }

      if (!fs.existsSync(task.logFile)) {
        console.error(chalk.red('\nError:'), 'Log file not found');
        process.exit(1);
      }

      console.log(chalk.bold('\n📄 Task Logs\n'));
      console.log(chalk.gray(`Task ID: ${task.id}`));
      console.log(chalk.gray(`Project: ${task.project}`));
      console.log(chalk.gray(`Status: ${task.status}`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log();

      if (options.follow) {
        // Use tail -f for following
        const { spawn } = require('child_process');
        const tail = spawn('tail', ['-f', task.logFile], {
          stdio: 'inherit',
        });

        tail.on('error', (error: Error) => {
          console.error(chalk.red('\nError:'), error.message);
          process.exit(1);
        });
      } else {
        // Just output the file
        const logs = fs.readFileSync(task.logFile, 'utf-8');
        console.log(logs);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Kill a running task
 */
program
  .command('kill')
  .argument('<task-id>', 'Task ID to kill')
  .description('Stop a running background task')
  .action((taskId: string) => {
    try {
      const task = getTask(taskId);

      if (!task) {
        console.error(chalk.red('\nError:'), `Task not found: ${taskId}`);
        console.log(chalk.blue('Run:'), chalk.bold('ccode status'), chalk.blue('to see all tasks\n'));
        process.exit(1);
      }

      if (task.status !== 'running') {
        console.log(chalk.yellow('\n⚠ Task is not running (status: ' + task.status + ')\n'));
        return;
      }

      const success = killTask(taskId);

      if (success) {
        console.log(chalk.green('\n✓ Task killed successfully'));
        console.log(chalk.gray(`  Task ID: ${taskId}`));
        console.log(chalk.gray(`  Project: ${task.project}\n`));
      } else {
        console.error(chalk.red('\n✗ Failed to kill task\n'));
        process.exit(1);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Cleanup old tasks
 */
program
  .command('cleanup')
  .description('Remove old completed tasks (older than 7 days)')
  .action(() => {
    try {
      cleanupOldTasks();
      console.log(chalk.green('\n✓ Cleaned up old tasks\n'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('\nError:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Show helpful message if no config exists
 */
if (!configExists()) {
  const command = process.argv[2];
  if (command !== 'init' && command !== '--help' && command !== '-h') {
    console.log(chalk.yellow('⚠ No config file found.'));
    console.log(chalk.blue('Run:'), chalk.bold('ccode init'), chalk.blue('to get started.\n'));
  }
}

program.parse();
