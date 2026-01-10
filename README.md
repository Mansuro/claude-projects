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

### ✅ Current Features (v0.1.0)

- **Project Registry**: Manage multiple projects in one YAML config
- **Task Dispatch**: Run Claude commands in any project from anywhere
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

### `ccode <project> <task>`

Execute a task in a specific project

```bash
# Basic
ccode skillsdoor "list all TypeScript files"

# With dry-run
ccode skillsdoor "implement feature X" --dry-run

# With verbose output
ccode skillsdoor "run tests" --verbose
```

**Options:**
- `-v, --verbose` - Show verbose output
- `--dry-run` - Show what would be executed without running

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

### Managing Multiple Client Projects

```bash
ccode client-a "update the landing page"
ccode client-b "fix the authentication bug"
ccode client-c "add new payment method"
```

### Monorepo Management

```bash
ccode frontend "update the header component"
ccode backend "add new API endpoint"
ccode mobile "sync with latest API changes"
```

### Parallel Development

```bash
# Work on multiple features simultaneously
ccode app-feature-auth "implement OAuth"
ccode app-feature-payments "integrate Stripe"
ccode app-bugfix "fix memory leak in worker"
```

## How It Works

1. **Config Loading**: Reads `~/.claude-projects.yaml` to get project definitions
2. **Path Resolution**: Resolves project path (handles `~`, relative paths)
3. **Directory Validation**: Ensures the project directory exists
4. **Command Execution**: Spawns Claude in the project directory with your task as input
5. **Output Streaming**: Shows Claude's output in real-time

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
