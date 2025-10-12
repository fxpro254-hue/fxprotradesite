# Deriv Trader Integration

This project includes the [derivatives-trader](https://github.com/deriv-com/derivatives-trader) repository integrated as a subdirectory under `/dtrader`.

## Directory Structure

```
bot/
├── src/           # Your bot project files
├── dtrader/       # Deriv Trader repository (git clone)
└── ...
```

## Available Scripts

The following npm scripts have been added to the root `package.json` to manage the dtrader project:

### Install Dependencies
```bash
npm run dtrader:install
```
Installs all dependencies for the derivatives-trader project (equivalent to `npm run bootstrap` in the dtrader directory).

### Start Development Server
```bash
npm run dtrader:serve
```
Starts the development server for the derivatives-trader project. You may need to specify which package to serve.

### Build All Packages
```bash
npm run dtrader:build
```
Builds all packages in the derivatives-trader monorepo.

### Run Tests
```bash
npm run dtrader:test
```
Runs all tests for the derivatives-trader project.

## Working with Dtrader

### Direct Commands

You can also navigate to the dtrader directory and run commands directly:

```powershell
cd dtrader
npm run serve trader  # Serve the trader package
npm run build:all     # Build all packages
npm test             # Run tests
```

### Workspace Structure

The derivatives-trader repository is a monorepo with multiple packages in the `packages/` directory:
- `@deriv/api`
- `@deriv/components`
- `@deriv/core`
- `@deriv/reports`
- `@deriv/shared`
- `@deriv/stores`
- `@deriv/trader`
- `@deriv/utils`

### Serving Specific Packages

To serve a specific package:

```bash
npm run serve trader    # Serves @deriv/trader
npm run serve reports   # Serves @deriv/reports
npm run serve core      # Serves @deriv/core
```

## Important Notes

### Node Version
- **Your bot project**: Requires Node 22.x
- **Dtrader project**: Requires Node 20.x

You may see engine warnings when installing dtrader dependencies because you're using Node 22.x. These are warnings, not errors, and the installation should still work.

If you need to use different Node versions:
1. Install [nvm-windows](https://github.com/coreybutler/nvm-windows)
2. Install Node 20: `nvm install 20`
3. Switch versions as needed:
   ```powershell
   nvm use 22  # For your bot project
   nvm use 20  # For dtrader project
   ```

### Git Management

The dtrader directory is a complete git repository. You have two options:

#### Option 1: Keep as Separate Repository (Recommended)
The dtrader directory maintains its own git history. Changes should be committed in the dtrader repo separately.

#### Option 2: Use Git Submodule
If you want to track the dtrader version in your bot repository:

```powershell
# Remove the cloned directory
rm -r dtrader

# Add as submodule
git submodule add https://github.com/deriv-com/derivatives-trader.git dtrader
git commit -m "Add derivatives-trader as submodule"
```

## Updating Dtrader

To update the dtrader repository to the latest version:

```powershell
cd dtrader
git pull origin main
npm run bootstrap  # Reinstall dependencies
```

## Integration with Your Bot

To use components or utilities from dtrader in your bot project, you can:

1. Import directly from the built packages
2. Set up path aliases in your build configuration
3. Create symlinks to specific packages

Example integration in your `rsbuild.config.ts`:

```typescript
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  source: {
    alias: {
      '@deriv/components': path.resolve(__dirname, 'dtrader/packages/components/src'),
      '@deriv/shared': path.resolve(__dirname, 'dtrader/packages/shared/src'),
      // Add more aliases as needed
    },
  },
});
```

## Troubleshooting

### Install Issues
If you encounter installation issues:
```powershell
cd dtrader
rm -r node_modules
npm run bootstrap
```

### Build Issues
Make sure to build dependencies in order:
```powershell
cd dtrader
npm run build --workspace=@deriv/components
npm run build --workspace=@deriv/shared
npm run build:all
```

### Port Conflicts
If the dev server fails to start due to port conflicts, check what ports are in use and configure accordingly.

## Resources

- [Deriv Trader GitHub](https://github.com/deriv-com/derivatives-trader)
- [Deriv Trader Documentation](https://github.com/deriv-com/derivatives-trader#readme)
