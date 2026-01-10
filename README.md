# Claude Projects

**Multi-project manager for Claude Code** - Dispatch tasks across multiple projects from a central location.

## Problem

When working with multiple projects using Claude Code, you typically need to:
1. Navigate to each project directory
2. Start a Claude session
3. Give your instructions
4. Repeat for each project

This gets tedious when managing multiple projects simultaneously.

## Solution

`claude-projects` lets you manage all your projects from a central config file and dispatch tasks to any project from anywhere:

```bash
ccode skillsdoor "implement dark mode"
ccode another-project "run tests and fix failures"
ccode my-app "refactor the authentication module"
```

## Installation

### From Source (Current)

```bash
cd ~/workspace/claude-projects
npm install
npm run build
npm link
```

### From npm (Coming Soon)

```bash
npm install -g claude-projects
```

## Quick Start

### 1. Initialize Configuration

```bash
ccode init
```

This creates `~/.claude-projects.yaml` with sample projects.

### 2. Edit Your Configuration

Open `~/.claude-projects.yaml` and add your projects:

```yaml
projects:
  skillsdoor:
    path: ~/workspace/skillsdoor
    description: Career management platform

  my-app:
    path: ~/workspace/my-app
    description: My awesome application
    defaultArgs:
      - --continue  # Optional: always continue last session

settings:
  claudePath: claude      # Path to claude executable
  timeout: 300000        # 5 minutes timeout
```

### 3. List Your Projects

```bash
ccode list
```

### 4. Dispatch Tasks

```bash
# Basic usage
ccode skillsdoor "add user authentication"

# Dry run (see what would execute)
ccode my-app "refactor components" --dry-run

# Verbose output
ccode my-app "run tests" --verbose
```

## Features

### ✅ Current Features (v0.2.0)

- **Project Registry**: Manage multiple projects in one YAML config
- **Quick Project Add**: Add projects with a simple command (like `npm install`)
- **Task Dispatch**: Run Claude commands in any project from anywhere
- **Background Execution**: Run tasks in the background with `--background` flag
- **Batch Processing**: Execute multiple tasks from a YAML file
- **Task Management**: Track, monitor, and control background tasks
- **Task Logs**: View detailed logs for each background task
- **Path Resolution**: Handles `~` and relative paths automatically
- **Dry Run Mode**: Preview commands before execution
- **Project Descriptions**: Document what each project does
- **Default Arguments**: Set per-project Claude arguments

### 🚧 Planned Features

- **Interactive Project Picker**: TUI menu to browse and select projects
- **Session Management**: Track and resume sessions per project
- **Parallel Execution**: Run same task across multiple projects
- **Project Templates**: Initialize new projects with common configs
- **Context Sharing**: Define shared knowledge between related projects
- **Alias Support**: Create shortcuts for common tasks
- **Git Integration**: Auto-detect git repos and their status

## Commands

### `ccode init`

Create a sample config file at `~/.claude-projects.yaml`

```bash
ccode init
```

### `ccode list`

List all configured projects

```bash
ccode list
```

### `ccode add <name> [path]`

Add a new project to the config. Similar to `npm install` for dependencies.

```bash
# Add current directory as a project
ccode add my-project

# Add a specific directory
ccode add my-project ~/workspace/my-project

# Add with description
ccode add my-project ~/workspace/my-project -d "My awesome project"
ccode add my-project ~/workspace/my-project --description "My awesome project"
```

**Arguments:**
- `name` (required) - Name for the project
- `path` (optional) - Path to project directory (defaults to current directory)

**Options:**
- `-d, --description <desc>` - Project description

### `ccode remove <name>`

Remove a project from the config. Alias: `rm`

```bash
ccode remove my-project
ccode rm my-project  # Short form
```

### `ccode <project> <task>`

Execute a task in a specific project

```bash
# Basic (foreground)
ccode skillsdoor "list all TypeScript files"

# Background execution
ccode skillsdoor "implement dark mode" --background
ccode skillsdoor "implement dark mode" -b  # Short form

# With dry-run
ccode skillsdoor "implement feature X" --dry-run

# With verbose output
ccode skillsdoor "run tests" --verbose
```

**Options:**
- `-b, --background` - Run task in background
- `-v, --verbose` - Show verbose output
- `--dry-run` - Show what would be executed without running

### `ccode batch <file>`

Execute multiple tasks from a YAML file. All tasks run in background by default.

```bash
# Run tasks from file
ccode batch tasks.yaml

# Run tasks in foreground (not recommended)
ccode batch tasks.yaml --no-background
```

**File format (YAML):**
```yaml
project-name: "task description"
another-project: "another task"
my-app: |
  Multi-line task description
  with multiple lines
```

See `example-tasks.yaml` for a complete example.

### `ccode status`

Show status of background tasks

```bash
# Show running and recent tasks (last 24 hours)
ccode status

# Show all tasks
ccode status --all
```

### `ccode logs <task-id>`

View logs for a background task

```bash
# View logs
ccode logs task-1234567890-abc123

# Follow logs (like tail -f)
ccode logs task-1234567890-abc123 --follow
ccode logs task-1234567890-abc123 -f  # Short form
```

### `ccode kill <task-id>`

Stop a running background task

```bash
ccode kill task-1234567890-abc123
```

### `ccode cleanup`

Remove old completed tasks (older than 7 days)

```bash
ccode cleanup
```

## Configuration

### Config File Location

`~/.claude-projects.yaml`

### Config Structure

```yaml
projects:
  project-name:
    path: ~/path/to/project       # Required: project directory
    description: Description here  # Optional: project description
    defaultArgs:                   # Optional: default Claude arguments
      - --continue
      - --another-flag

settings:
  claudePath: claude    # Optional: path to Claude executable (default: 'claude')
  timeout: 300000      # Optional: timeout in ms (default: 300000)
```

### Path Resolution

Paths in the config can use:
- **Tilde expansion**: `~/workspace/my-project`
- **Absolute paths**: `/Users/username/projects/my-project`
- **Relative paths**: `workspace/my-project` (relative to home directory)

## Use Cases

### Quick Project Setup

```bash
# Navigate to a project directory
cd ~/workspace/my-new-project

# Add it to claude-projects
ccode add my-new-project -d "My new side project"

# Now you can run tasks from anywhere
ccode my-new-project "analyze the codebase structure"
```

### Managing Multiple Client Projects

```bash
# Run tasks in background
ccode client-a "update the landing page" -b
ccode client-b "fix the authentication bug" -b
ccode client-c "add new payment method" -b

# Check status of all tasks
ccode status
```

### Batch Processing Multiple Projects

```bash
# Create a tasks file
cat > daily-tasks.yaml <<EOF
client-a: "run tests and fix any failures"
client-b: "update dependencies and run security audit"
client-c: "generate weekly analytics report"
EOF

# Execute all tasks in background
ccode batch daily-tasks.yaml

# Monitor progress
ccode status
```

### Monorepo Management

```bash
# Run tasks across different parts of the monorepo
ccode frontend "update the header component" -b
ccode backend "add new API endpoint" -b
ccode mobile "sync with latest API changes" -b

# View logs for specific task
ccode logs task-1234567890-abc123 --follow
```

### Parallel Development

```bash
# Work on multiple features simultaneously
ccode app-feature-auth "implement OAuth" -b
ccode app-feature-payments "integrate Stripe" -b
ccode app-bugfix "fix memory leak in worker" -b

# Check which tasks completed
ccode status --all
```

## How It Works

### Foreground Execution

1. **Config Loading**: Reads `~/.claude-projects.yaml` to get project definitions
2. **Path Resolution**: Resolves project path (handles `~`, relative paths)
3. **Directory Validation**: Ensures the project directory exists
4. **Command Execution**: Spawns Claude in the project directory with your task as input
5. **Output Streaming**: Shows Claude's output in real-time

### Background Execution

1. **Task Creation**: Generates unique task ID and creates log file
2. **Process Spawning**: Launches Claude as a detached background process
3. **Log Recording**: All output is written to `~/.claude-projects/logs/<task-id>.log`
4. **Task Tracking**: Stores task metadata in `~/.claude-projects/tasks.json`
5. **Process Monitoring**: Automatically updates task status when process completes

**Background Task Lifecycle:**
- `running` → Task is actively executing
- `completed` → Task finished successfully (exit code 0)
- `failed` → Task finished with error (non-zero exit code)
- `killed` → Task was manually stopped with `ccode kill`

## Requirements

- **Node.js**: 18.0.0 or higher
- **Claude Code**: Must be installed and accessible via `claude` command
- **Operating System**: macOS, Linux, or Windows (WSL)

## Development

### Build from Source

```bash
git clone https://github.com/yourusername/claude-projects.git
cd claude-projects
npm install
npm run build
```

### Development Mode

```bash
npm run dev  # Watch mode - auto-rebuild on changes
```

### Local Testing

```bash
npm link  # Install globally from local build
```

### Project Structure

```
claude-projects/
├── src/
│   ├── cli.ts           # CLI entry point (commander setup)
│   ├── config.ts        # Config file loading and validation
│   ├── dispatcher.ts    # Task execution logic
│   ├── types.ts         # TypeScript interfaces
│   └── index.ts         # Main exports
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "Config file not found"

Run `ccode init` to create the config file, then edit `~/.claude-projects.yaml`.

### "Project directory does not exist"

Check that the path in your config file is correct. Paths are resolved relative to your home directory unless absolute.

### "Failed to start Claude"

Ensure Claude Code is installed and the `claude` command is in your PATH. You can specify a custom path in the config:

```yaml
settings:
  claudePath: /custom/path/to/claude
```

### Command not found: ccode

If you installed from source, make sure you ran `npm link`. Check that npm's global bin directory is in your PATH:

```bash
npm bin -g  # Should show the directory containing ccode
```

## Contributing

Contributions are welcome! This tool was created to solve a real problem and can grow based on community needs.

### Ideas for Contributions

- Interactive project picker using `inquirer` or `blessed`
- Session history tracking
- Project statistics and analytics
- VS Code extension
- Better error messages
- Test coverage
- Windows native support (non-WSL)

## License

MIT

## Author

Created to solve the multi-project management problem when working with Claude Code.

## Roadmap

- [ ] Publish to npm registry
- [ ] Add interactive project picker
- [ ] Session management and history
- [ ] Parallel task execution
- [ ] Project templates
- [ ] VS Code extension
- [ ] Shell completion (bash/zsh)
- [ ] Configuration validation and linting
- [ ] Project aliases and shortcuts
- [ ] Integration tests

---

**Found a bug?** [Open an issue](https://github.com/yourusername/claude-projects/issues)

**Have an idea?** [Start a discussion](https://github.com/yourusername/claude-projects/discussions)
