# DTrader Iframe Integration

## Overview
DTrader is integrated into the bot using a simple iframe approach. This avoids all the complexity of direct imports, webpack conflicts, and SCSS infrastructure issues.

## How It Works

### 1. **Simple Iframe Embedding**
- DTrader loads in an iframe at `https://localhost:8443/dtrader`
- No webpack module conflicts
- No SCSS preprocessing needed
- Clean separation between bot and DTrader code

### 2. **Authentication Passing**
The bot automatically passes authentication to DTrader via URL parameters:

```typescript
https://localhost:8443/dtrader?app_id=68848&token1=YOUR_TOKEN&acct1=YOUR_ACCOUNT
```

**Parameters:**
- `app_id`: Bot's app ID (68848 for production)
- `token1`: User's authentication token from localStorage
- `acct1`: Active account login ID

### 3. **Automatic Authentication Flow**
1. Bot authenticates with Deriv API
2. Tokens stored in localStorage
3. DTrader component reads tokens
4. Builds iframe URL with authentication parameters
5. DTrader iframe loads and auto-authenticates

## File Structure

### Main Files
- **`src/pages/dtrader.tsx`** - DTrader iframe component
- **`src/pages/dtrader.scss`** - Iframe container styling
- **`dtrader/packages/core/build/webpack.config.js`** - DTrader webpack config (port 8443)

### Key Code
```tsx
// src/pages/dtrader.tsx
const DTrader: React.FC = observer(() => {
    // Builds URL with authentication
    const url = `https://localhost:8443/dtrader?app_id=${appId}&token1=${token}&acct1=${accountId}`;
    
    return (
        <iframe
            src={url}
            sandbox='allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals'
            allow='clipboard-read; clipboard-write; payment; usb'
        />
    );
});
```

## Running DTrader

### Port Configuration
- **Bot**: Automatically uses port 8444 (8443 if available)
- **DTrader**: Port 8443
- **Iframe**: Points from bot (8444) to DTrader (8443)

### Commands

**Terminal 1 - DTrader (MUST START FIRST):**
```powershell
npm run dtrader:serve:core
```
This will start DTrader on port 8443.

**Terminal 2 - Bot:**
```powershell
npm start
```
This will start the bot on port 8444 (since 8443 is taken by DTrader).

**Important:** Start DTrader first, then start the bot. This ensures DTrader gets port 8443 and the bot automatically uses 8444.

## Benefits

✅ **No Import Complexity** - No direct imports, no module resolution issues
✅ **No SCSS Infrastructure** - No need for shared SCSS, no preprocessing
✅ **No Webpack Conflicts** - Completely isolated builds
✅ **Shared Authentication** - Tokens passed via URL
✅ **Same Origin** - Both on localhost:8443, no CORS issues
✅ **Easy Maintenance** - Simple iframe, easy to debug

## Authentication Security

- Tokens passed via HTTPS URL parameters
- Iframe sandbox restricts capabilities
- Same origin policy applies
- Tokens only passed on localhost (development)
- Production would use proper token exchange mechanism

## Troubleshooting

### DTrader Not Loading
1. Check if DTrader is running: `npm run dtrader:serve:core`
2. Verify it's on port 8443
3. Check console for authentication errors
4. Ensure bot is authenticated before switching to DTrader tab

### Authentication Not Working
1. Check localStorage for `accountsList` and `active_loginid`
2. Verify bot is authenticated (`api_base.is_authorized`)
3. Check console logs for URL being built
4. Verify tokens are being passed in URL

### Port Conflicts
If you need to run on different ports:
1. Change bot port in `rsbuild.config.ts` (port: 8443)
2. Change DTrader port in `dtrader/packages/core/build/webpack.config.js` (port: 8443)
3. Update iframe URL in `src/pages/dtrader.tsx`

## Future Enhancements

- [ ] PostMessage API for better iframe communication
- [ ] Hide DTrader header via CSS injection or PostMessage
- [ ] Sync state between bot and DTrader
- [ ] Error recovery and retry mechanisms
- [ ] Production deployment with proper authentication
