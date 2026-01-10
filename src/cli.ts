#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createSampleConfig, configExists, listProjects, getConfigPath } from './config';
import { dispatchTask } from './dispatcher';

const program = new Command();

program
  .name('ccode')
  .description('Multi-project manager for Claude Code')
  .version('0.1.0');

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
 * Dispatch task to project
 */
program
  .argument('<project>', 'Project name from config')
  .argument('<task>', 'Task description for Claude')
  .option('-v, --verbose', 'Show verbose output')
  .option('--dry-run', 'Show what would be executed without running it')
  .description('Run a Claude task in the specified project')
  .action(async (projectName: string, task: string, options) => {
    try {
      await dispatchTask(projectName, task, {
        verbose: options.verbose,
        dryRun: options.dryRun,
      });
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
