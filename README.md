# Hotstar WiWiWi

A browser extension that patches Hotstar for improved functionality.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build extension
bun run build

# Create zip files for distribution
bun run zip
```

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and releases.

### Creating a changeset

When making changes, create a changeset to document what has changed:

```bash
bun run changeset
```

This will:
1. Ask what type of change you made (major, minor, patch)
2. Ask for a description of the change
3. Create a markdown file in the `.changeset` directory

### Publishing a new version

When you're ready to release:

1. Commit your changes and push to master
2. The GitHub Action will create a "Version Packages" PR
3. Merge the PR to update the version
4. The release will be tagged, and a GitHub Release will be created with extension ZIP files

## Manual Release

To manually release a new version:

1. Create and add your changesets
2. Run `bun run version` to update versions
3. Commit and push the changes
4. Tag the release: `git tag v1.0.0`
5. Push the tag: `git push --tags`
6. The release workflow will automatically build, zip, and create a GitHub Release 