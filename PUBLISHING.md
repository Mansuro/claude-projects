# Publishing to npm

## Prerequisites

1. You need an npm account. Create one at https://www.npmjs.com/signup
2. Login to npm from the command line:
   ```bash
   npm login
   ```

## Publishing Steps

### 1. Ensure everything is ready

```bash
# Make sure all tests pass and code is built
npm run build

# Check what will be published
npm pack --dry-run

# This shows all files that will be included in the package
```

### 2. Update version

```bash
# For patch releases (bug fixes): 0.2.0 -> 0.2.1
npm version patch

# For minor releases (new features): 0.2.0 -> 0.3.0
npm version minor

# For major releases (breaking changes): 0.2.0 -> 1.0.0
npm version major
```

This will:
- Update package.json version
- Create a git commit
- Create a git tag

### 3. Publish to npm

```bash
# Publish to npm registry
npm publish

# For first-time publish, you might need:
npm publish --access public
```

### 4. Push to GitHub

```bash
# Push the version commit and tags
git push origin main --tags
```

## Versioning Guide

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Incompatible API changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Before Publishing Checklist

- [ ] All changes committed to git
- [ ] README.md is up to date
- [ ] Version number is appropriate
- [ ] Build succeeds (`npm run build`)
- [ ] Package installs correctly (`npm pack && npm install -g ./claude-projects-*.tgz`)
- [ ] CLI works as expected
- [ ] CHANGELOG.md updated (if you create one)

## After Publishing

1. Verify package on npm: https://www.npmjs.com/package/claude-projects
2. Test installation: `npm install -g claude-projects`
3. Create GitHub release with release notes
4. Announce on relevant channels

## Unpublishing (Emergency Only)

```bash
# Only works within 72 hours of publishing
npm unpublish claude-projects@<version>

# Better alternative: deprecate instead
npm deprecate claude-projects@<version> "Reason for deprecation"
```

## Testing Before Publishing

```bash
# Install locally to test
npm pack
npm install -g ./claude-projects-0.2.0.tgz

# Test the installation
ccode --version
ccode init

# When done testing, uninstall
npm uninstall -g claude-projects
```
