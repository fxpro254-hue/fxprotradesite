# How to Run Deriv Trader (dtrader)

## Quick Start

The Deriv Trader (derivatives-trader) is now running at:

🌐 **https://localhost:8443/**

## Starting DTrader

### Method 1: Using PowerShell Script (Recommended)
```powershell
.\run-dtrader.ps1 core
```

Or to run the trader package specifically:
```powershell
.\run-dtrader.ps1 trader
```

### Method 2: Using NPM Scripts
```powershell
npm run dtrader:serve:core   # Serve the core package
npm run dtrader:serve:trader # Serve the trader package
```

### Method 3: Direct Commands
```powershell
cd dtrader\packages\core
npx webpack serve --config "./build/webpack.config.js"
```

## Building Packages

Before running dtrader for the first time, you need to build the dependencies:

```powershell
# Build all packages
npm run dtrader:build

# Or build individually
cd dtrader
npm run build --workspace=@deriv/components
npm run build --workspace=@deriv/reports
npm run build --workspace=@deriv/trader
```

## Available Packages

1. **Core** (`@deriv/core`) - Main application package
2. **Trader** (`@deriv/trader`) - Trading functionality
3. **Reports** (`@deriv/reports`) - Reporting features
4. **Components** (`@deriv/components`) - Shared UI components
5. **Shared** (`@deriv/shared`) - Shared utilities
6. **Stores** (`@deriv/stores`) - State management
7. **API** (`@deriv/api`) - API integration
8. **API-V2** (`@deriv/api-v2`) - New API integration
9. **Utils** (`@deriv/utils`) - Utility functions

## Troubleshooting

### SSL Certificate Warning
When you first open `https://localhost:8443/`, your browser will show an SSL certificate warning. This is normal for development. Click "Advanced" and "Proceed to localhost" to continue.

### Environment Variables
The warning "Failed to load ./.env" is normal if you don't have environment variables configured. The app should still work.

### Port Already in Use
If port 8443 is already in use (by your bot project), you can:
1. Stop your bot server first
2. Or modify the webpack config in dtrader to use a different port

### Build Errors
If you see module resolution errors, make sure dependencies are built:
```powershell
cd dtrader\packages\components
npx webpack --config "./build/webpack.config.js"

cd ..\reports
npx webpack --config "./build/webpack.config.js"

cd ..\trader
npx webpack --config "./build/webpack.config.js"
```

## Common Tasks

### Stop the Server
Press `Ctrl+C` in the terminal where dtrader is running

### Update DTrader
```powershell
cd dtrader
git pull origin main
npm run bootstrap
npm run build:all
```

### View in Browser
Open your browser and navigate to:
- **Core App**: https://localhost:8443/
- Accept the SSL certificate warning
- The Deriv trading interface should load

## Development

### Hot Reload
The webpack dev server supports hot module replacement (HMR). Changes you make to source files will automatically reload in the browser.

### Debug Mode
To enable debug mode, check the webpack config in `dtrader/packages/core/build/webpack.config.js`

## Notes

- **Node Version**: DTrader requires Node 20.x but works with Node 22.x (with warnings)
- **SSL**: Development server uses HTTPS with a self-signed certificate
- **Port**: Default port is 8443 (same as your bot project)
- **Dependencies**: Core depends on reports and trader packages being built first
