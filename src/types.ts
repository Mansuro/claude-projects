/**
 * Project definition in the config file
 */
export interface Project {
  /** Project name (key in config) */
  name: string;
  /** Absolute or relative path to project directory */
  path: string;
  /** Optional description of the project */
  description?: string;
  /** Optional default Claude command arguments */
  defaultArgs?: string[];
}

/**
 * Main configuration structure
 */
export interface Config {
  /** Map of project names to project configs */
  projects: Record<string, Omit<Project, 'name'>>;
  /** Optional default settings */
  settings?: {
    /** Path to claude executable (defaults to 'claude') */
    claudePath?: string;
    /** Default timeout for commands in ms */
    timeout?: number;
  };
}

/**
 * Background task status
 */
export type TaskStatus = 'running' | 'completed' | 'failed' | 'killed';

/**
 * Background task information
 */
export interface BackgroundTask {
  /** Unique task ID */
  id: string;
  /** Project name */
  project: string;
  /** Task description */
  task: string;
  /** Process ID */
  pid: number;
  /** Task status */
  status: TaskStatus;
  /** Start time */
  startedAt: string;
  /** End time (if completed) */
  endedAt?: string;
  /** Log file path */
  logFile: string;
  /** Exit code (if completed) */
  exitCode?: number;
}
