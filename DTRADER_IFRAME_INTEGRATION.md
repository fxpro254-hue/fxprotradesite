# DTrader Iframe Integration - FINAL

## Overview
DTrader is integrated into the bot using a simple iframe approach with URL-based authentication.

## Architecture

### URL Structure
**Local Development:**
- Bot: `https://localhost:8444/`
- DTrader: `https://localhost:8443/dtrader`
- Iframe URL: `https://localhost:8443/dtrader?app_id=36300&token1=TOKEN&acct1=ACCOUNT`

**Production:**
- Bot: `https://bot.binaryfx.site/`
- DTrader: `https://bot.binaryfx.site/dtrader`  
- Iframe URL: `https://bot.binaryfx.site/dtrader?app_id=68848&token1=TOKEN&acct1=ACCOUNT`

### How It Works
1. Bot detects environment (localhost vs production)
2. Builds appropriate DTrader URL with authentication parameters
3. Passes `app_id`, `token1`, and `acct1` via query string
4. DTrader iframe loads and auto-authenticates with provided tokens

## File Structure

### Main Files
- **`src/pages/dtrader.tsx`** - DTrader iframe component (~120 lines)
- **`src/pages/dtrader.scss`** - Iframe container styling  
- **`dtrader/packages/core/build/webpack.config.js`** - DTrader webpack config
- **`dtrader/packages/core/src/index.tsx`** - DTrader entry with debug logs
- **`dtrader/packages/core/src/App/initStore.js`** - Store initialization with logs
- **`dtrader/packages/core/src/Stores/client-store.js`** - Authentication with logs

### Key Code

**Bot - Dynamic URL Building (`src/pages/dtrader.tsx`):**
```typescript
// Automatically detects environment
const protocol = window.location.protocol;
const hostname = window.location.hostname;
const isLocal = /localhost/i.test(hostname);

// Builds appropriate URL
const baseUrl = isLocal 
    ? `${protocol}//localhost:8443/dtrader`     // Local: specific port + path
    : `${protocol}//${hostname}/dtrader`;        // Production: same domain + path

// Add authentication parameters
const params = new URLSearchParams();
params.append('app_id', appId);
params.append('token1', activeAccount.token);
params.append('acct1', activeLoginId);

const url = `${baseUrl}?${params.toString()}`;
```

**DTrader - Webpack Config (`dtrader/packages/core/build/webpack.config.js`):**
```javascript
module.exports = function (env) {
    const base = '/dtrader/';  // Serve from /dtrader path
    
    return {
        devServer: {
            port: 8443,
            server: 'https',
            historyApiFallback: true,
        },
        output: {
            publicPath: base,  // All assets load from /dtrader/
        },
    };
};
```

## Running DTrader

### Development Setup

**Step 1 - Start DTrader (Terminal 1):**
```powershell
npm run dtrader:serve:core
```
This starts DTrader on `https://localhost:8443/dtrader`

**Step 2 - Start Bot (Terminal 2):**
```powershell
npm start  
```
Bot automatically uses port 8444 (since 8443 is taken)

**Step 3 - Access:**
- Open browser to: `https://localhost:8444/`
- Log in to bot
- Click "DTrader" tab
- DTrader loads in iframe with authentication

### Important Notes
1. **Start DTrader FIRST** - It needs port 8443
2. **Bot auto-switches** to port 8444
3. **Accept SSL warnings** for both (self-signed certs in dev)

## Debug Logs

### Bot Console (`https://localhost:8444/`)
```
🔍 Environment - App ID: 36300
🔍 Hostname: localhost
🔍 Is Local: true
🔍 Base URL: https://localhost:8443/dtrader
🔍 Accounts List: Found
🔍 Active Login ID: CR4071525
🔍 Parsed Accounts: Array with 1 items
🔍 Active Account: Found
   - Login ID: CR4071525
   - Has Token: true
✅ DTrader URL built with authentication
🔗 URL: https://localhost:8443/dtrader?app_id=36300&token1=TOKEN_HIDDEN&acct1=CR4071525
```

### DTrader Iframe Console (`https://localhost:8443/dtrader`)
```
🎯 DTrader Init - URL Parameters:
   - app_id: 36300
   - token1: PRESENT
   - acct1: CR4071525
   - Full URL: https://localhost:8443/dtrader?app_id=36300&token1=...&acct1=CR4071525
✅ DTrader mounting to DOM...

🏪 initStore - Starting initialization
   - Accounts passed: NO
   - URL params: [["app_id","36300"],["token1","..."],["acct1","CR4071525"]]
🏗️ Creating RootStore...
👤 Initializing client store...

🔐 client-store.init() - Starting authentication...
   - Search params: ?app_id=36300&token1=...&acct1=CR4071525
   - app_id: 36300
   - token1: PRESENT
   - acct1: CR4071525
   - One-time token from URL: PRESENT
   - Existing session token: MISSING

🔑 Authenticating with token from URL...
📞 Exchanging one-time token for session token...
✅ Session token received, storing...
📞 Authorizing with session token...
✅ Authorization successful!
   - Login ID: CR4071525
   - Currency: USD
   - Balance: 10000.00
```

## Benefits

✅ **Environment-Aware** - Works in both local and production
✅ **No Import Complexity** - No module resolution, no SCSS infrastructure
✅ **No Webpack Conflicts** - Completely isolated builds
✅ **Path Separation** - Bot: `/`, DTrader: `/dtrader` (no conflicts)
✅ **Shared Authentication** - Tokens passed via URL
✅ **Easy Debugging** - Comprehensive console logs at every step
✅ **Production Ready** - Same code works locally and in production

## Production Deployment

### Requirements
1. Both bot and DTrader must be on same domain
2. Configure reverse proxy or routing:
   - `/` → Bot application
   - `/dtrader` → DTrader application
3. Ensure HTTPS is configured properly
4. Both services must be running

### Nginx Example
```nginx
server {
    listen 443 ssl;
    server_name bot.binaryfx.site;

    # Bot (root path)
    location / {
        proxy_pass http://bot-service:8444;
    }

    # DTrader (sub path)
    location /dtrader {
        proxy_pass http://dtrader-service:8443;
    }
}
```

## Troubleshooting

### DTrader Not Loading
1. Check both servers are running
2. Verify DTrader on: `https://localhost:8443/dtrader`
3. Check browser console for errors
4. Ensure SSL certificate accepted for both

### Authentication Not Working  
1. Check bot console logs for token presence
2. Verify `accountsList` in localStorage
3. Check DTrader console for authentication flow
4. Ensure tokens are being passed in URL

### 404 Errors
1. Verify DTrader webpack is using `/dtrader/` base path
2. Check if DTrader server is running on correct port
3. Ensure bot iframe URL includes `/dtrader` path

### Port Conflicts
1. Kill all node processes: `Get-Process node | Stop-Process -Force`
2. Start DTrader first (port 8443)
3. Then start bot (auto-switches to 8444)

## Future Enhancements

- [ ] PostMessage API for better iframe communication
- [ ] Hide/customize DTrader header via CSS or PostMessage
- [ ] Sync state between bot and DTrader
- [ ] Error recovery and retry mechanisms
- [ ] Remove debug logs in production build
