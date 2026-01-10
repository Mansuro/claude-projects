import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BackgroundTask, TaskStatus } from './types';

const TASKS_DIR = path.join(os.homedir(), '.claude-projects');
const TASKS_FILE = path.join(TASKS_DIR, 'tasks.json');
const LOGS_DIR = path.join(TASKS_DIR, 'logs');

/**
 * Ensure necessary directories exist
 */
function ensureDirectories(): void {
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Load all background tasks
 */
export function loadTasks(): BackgroundTask[] {
  ensureDirectories();

  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

/**
 * Save background tasks
 */
export function saveTasks(tasks: BackgroundTask[]): void {
  ensureDirectories();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

/**
 * Generate a unique task ID
 */
export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get log file path for a task
 */
export function getLogFilePath(taskId: string): string {
  ensureDirectories();
  return path.join(LOGS_DIR, `${taskId}.log`);
}

/**
 * Add a new background task
 */
export function addTask(task: BackgroundTask): void {
  const tasks = loadTasks();
  tasks.push(task);
  saveTasks(tasks);
}

/**
 * Update a task's status
 */
export function updateTask(
  taskId: string,
  updates: Partial<BackgroundTask>
): void {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks(tasks);
  }
}

/**
 * Get a task by ID
 */
export function getTask(taskId: string): BackgroundTask | undefined {
  const tasks = loadTasks();
  return tasks.find((t) => t.id === taskId);
}

/**
 * Get all tasks, optionally filtered by status
 */
export function getTasks(status?: TaskStatus): BackgroundTask[] {
  const tasks = loadTasks();

  if (status) {
    return tasks.filter((t) => t.status === status);
  }

  return tasks;
}

/**
 * Check if a process is still running
 */
export function isProcessRunning(pid: number): boolean {
  try {
    // Sending signal 0 checks if process exists without killing it
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update running tasks based on actual process status
 */
export function updateTaskStatuses(): void {
  const tasks = loadTasks();
  let updated = false;

  tasks.forEach((task) => {
    if (task.status === 'running' && !isProcessRunning(task.pid)) {
      // Process is no longer running, update status
      task.status = 'completed';
      task.endedAt = new Date().toISOString();
      updated = true;
    }
  });

  if (updated) {
    saveTasks(tasks);
  }
}

/**
 * Kill a running task
 */
export function killTask(taskId: string): boolean {
  const task = getTask(taskId);

  if (!task) {
    return false;
  }

  if (task.status !== 'running') {
    return false;
  }

  try {
    process.kill(task.pid, 'SIGTERM');
    updateTask(taskId, {
      status: 'killed',
      endedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clean up old completed tasks (older than 7 days)
 */
export function cleanupOldTasks(): void {
  const tasks = loadTasks();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const activeTasks = tasks.filter((task) => {
    if (task.status === 'running') {
      return true;
    }

    const taskDate = new Date(task.startedAt).getTime();
    return taskDate > sevenDaysAgo;
  });

  // Remove old log files
  tasks.forEach((task) => {
    if (!activeTasks.find((t) => t.id === task.id)) {
      try {
        if (fs.existsSync(task.logFile)) {
          fs.unlinkSync(task.logFile);
        }
      } catch (error) {
        // Ignore errors when cleaning up
      }
    }
  });

  saveTasks(activeTasks);
}
