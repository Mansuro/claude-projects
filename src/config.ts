import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'yaml';
import { Config, Project } from './types';

const CONFIG_FILE_NAME = '.claude-projects.yaml';

/**
 * Get the path to the config file
 */
export function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return fs.existsSync(getConfigPath());
}

/**
 * Load and parse the config file
 */
export function loadConfig(): Config {
  const configPath = getConfigPath();

  if (!configExists()) {
    throw new Error(
      `Config file not found at ${configPath}\n` +
      `Run 'ccode init' to create a sample config file.`
    );
  }

  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.parse(fileContent) as Config;

    if (!config.projects || typeof config.projects !== 'object') {
      throw new Error('Config must have a "projects" section');
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a specific project from config
 */
export function getProject(projectName: string): Project {
  const config = loadConfig();
  const projectConfig = config.projects[projectName];

  if (!projectConfig) {
    const availableProjects = Object.keys(config.projects).join(', ');
    throw new Error(
      `Project "${projectName}" not found in config.\n` +
      `Available projects: ${availableProjects}`
    );
  }

  return {
    name: projectName,
    ...projectConfig,
  };
}

/**
 * List all projects from config
 */
export function listProjects(): Project[] {
  const config = loadConfig();
  return Object.entries(config.projects).map(([name, projectConfig]) => ({
    name,
    ...projectConfig,
  }));
}

/**
 * Resolve project path (handle ~ and relative paths)
 */
export function resolveProjectPath(projectPath: string): string {
  // Handle tilde expansion
  if (projectPath.startsWith('~')) {
    return path.join(os.homedir(), projectPath.slice(1));
  }

  // Handle relative paths (relative to home directory)
  if (!path.isAbsolute(projectPath)) {
    return path.join(os.homedir(), projectPath);
  }

  return projectPath;
}

/**
 * Create a sample config file
 */
export function createSampleConfig(): void {
  const configPath = getConfigPath();

  if (configExists()) {
    throw new Error(`Config file already exists at ${configPath}`);
  }

  const sampleConfig: Config = {
    projects: {
      'example-project': {
        path: '~/workspace/example-project',
        description: 'An example project',
      },
      'another-project': {
        path: '~/workspace/another-project',
        description: 'Another example project',
        defaultArgs: ['--continue'],
      },
    },
    settings: {
      claudePath: 'claude',
      timeout: 300000, // 5 minutes
    },
  };

  const yamlContent = yaml.stringify(sampleConfig);
  fs.writeFileSync(configPath, yamlContent, 'utf-8');
}
