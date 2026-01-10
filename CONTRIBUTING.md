# Contributing to Claude Projects

Thank you for your interest in contributing! This project was created to solve a real problem when working with multiple projects in Claude Code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/claude-projects.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Link for local testing: `npm link`

## Development Workflow

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes in the `src/` directory
3. Build and test: `npm run build && ccode --help`
4. Commit your changes: `git commit -m "Description of changes"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

### Testing

Currently, the project relies on manual testing. Automated tests are a great contribution opportunity!

To test manually:
```bash
npm run build
ccode init
ccode list
ccode <project> "test task" --dry-run
```

## Ideas for Contributions

### High Priority

- [ ] Automated tests (Jest/Mocha)
- [ ] Interactive project picker (inquirer/blessed)
- [ ] Session history tracking
- [ ] Better error handling and messages
- [ ] Input validation for config file

### Medium Priority

- [ ] Shell completion (bash/zsh)
- [ ] Project templates feature
- [ ] Parallel execution of tasks
- [ ] Project aliases
- [ ] Config file validation with JSON schema

### Nice to Have

- [ ] VS Code extension
- [ ] GitHub Actions for CI/CD
- [ ] Performance optimizations
- [ ] Windows native support (non-WSL)
- [ ] Progress indicators for long-running tasks

## Pull Request Guidelines

1. **Keep PRs focused**: One feature or fix per PR
2. **Update documentation**: Update README.md if adding features
3. **Test your changes**: Ensure the tool works with your changes
4. **Describe your changes**: Explain what and why in the PR description
5. **Follow existing patterns**: Match the code style and architecture

## Reporting Issues

When reporting issues, please include:

- Your OS and version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Config file (without sensitive data)

## Feature Requests

Have an idea? Open an issue with the "enhancement" label and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered
- Examples of how it would be used

## Questions?

Feel free to open an issue with the "question" label.

## Code of Conduct

Be respectful and constructive. This is a community project built to help developers work more efficiently.

---

**Thank you for contributing!**
