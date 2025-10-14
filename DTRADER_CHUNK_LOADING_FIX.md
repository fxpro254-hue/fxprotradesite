# DTrader Chunk Loading Error - Fix Guide

## 🔴 Current Error

```
ChunkLoadError: Loading chunk traders-app failed.
(missing: https://localhost:8443/trader/js/trader.trader-app.xxx.js)
```

## 🔍 Root Cause

DTrader has **two separate webpack builds**:

1. **Core Package** (`@deriv/core`) - Built with `publicPath: '/dtrader/'` ✅
2. **Trader Package** (`@deriv/trader`) - Built with `publicPath: '/trader/'` ❌

When the core package lazy-loads the trader module, it tries to load chunks from `/trader/js/...` but they should be at `/dtrader/trader/js/...`.

## 📊 File Structure

```
public/dtrader/
├── index.html              ← Core package HTML
├── js/
│   └── core.*.js          ← Core scripts (✅ loads from /dtrader/js/)
├── css/
│   └── core.*.css         ← Core styles
└── trader/
    ├── js/
    │   └── trader.*.js    ← Trader scripts (❌ tries /trader/js/ instead of /dtrader/trader/js/)
    └── css/
        └── trader.*.css   ← Trader styles
```

## 💡 Solutions

### **Solution 1: Serve `/trader` as a Separate Route** (QUICKEST)

Since the trader package expects `/trader/` as its base path, we can configure the server to serve it there.

**Update `rsbuild.config.ts`:**

```typescript
export default defineConfig({
    // ... existing config ...
    
    output: {
        copy: [
            // ... existing copies ...
            
            // Copy DTrader core to /dtrader
            ...(hasDTraderBuild ? [{
                from: dtraderDistPath,
                to: 'dtrader',
                globOptions: {
                    ignore: ['**/js/smartcharts/**', '**/trader/**'],  // Exclude trader
                },
            }] : []),
            
            // Copy DTrader trader package to /trader (its expected path)
            ...(hasDTraderBuild && fs.existsSync(path.join(dtraderDistPath, 'trader')) ? [{
                from: path.join(dtraderDistPath, 'trader'),
                to: 'trader',
            }] : []),
        ],
    },
    
    server: {
        port: 8443,
        compress: true,
        historyApiFallback: {
            rewrites: [
                // Serve DTrader's index.html for /dtrader routes
                { from: /^\/dtrader/, to: '/dtrader/index.html' },
                // Allow /trader to serve static files (no rewrite needed)
                // Default fallback for bot routes
                { from: /./, to: '/index.html' },
            ],
        },
    },
});
```

**For Public Folder (Dev Mode):**

```powershell
# Copy trader package to /trader path
Copy-Item -Path "dtrader\packages\core\dist\trader" -Destination "public\trader" -Recurse -Force
```

---

### **Solution 2: Rebuild Trader with Correct PublicPath** (PROPER FIX)

Rebuild the trader package with the correct publicPath so it loads chunks from `/dtrader/trader/`.

**Find trader webpack config** (likely in `dtrader/packages/trader/build/webpack.config.js`):

```javascript
// Change this:
const base = '/trader/';

// To this:
const base = '/dtrader/trader/';
```

**Then rebuild:**

```powershell
cd dtrader\packages\trader
npm run build

cd ..\..\..
npm run dtrader:build:core
```

---

### **Solution 3: Use Nginx/Proxy Rewrite** (PRODUCTION)

Configure your web server to rewrite `/trader/*` requests to `/dtrader/trader/*`.

**Nginx example:**

```nginx
location /trader/ {
    rewrite ^/trader/(.*) /dtrader/trader/$1 last;
}
```

---

## 🚀 Recommended Immediate Fix (Solution 1)

This is the quickest fix that requires no rebuild:

**Step 1: Update Public Folder**

```powershell
# Ensure dtrader is copied correctly
if (Test-Path "public\dtrader") { Remove-Item "public\dtrader" -Recurse -Force }
New-Item -Path "public\dtrader" -ItemType Directory -Force | Out-Null
Copy-Item -Path "dtrader\packages\core\dist\*" -Destination "public\dtrader" -Recurse -Force

# Copy trader to its expected path
if (Test-Path "public\trader") { Remove-Item "public\trader" -Recurse -Force }
Copy-Item -Path "dtrader\packages\core\dist\trader" -Destination "public\trader" -Recurse -Force
```

**Step 2: Update `rsbuild.config.ts`**

Add the trader copy configuration as shown in Solution 1 above.

**Step 3: Restart Dev Server**

```powershell
npm start
```

**Step 4: Test**

Navigate to: `https://localhost:8443/dtrader`

---

## ✅ Verification

After applying the fix, verify:

1. ✅ `/dtrader` loads without chunk errors
2. ✅ Trader modules load correctly
3. ✅ No 404 errors in browser console
4. ✅ DTrader UI renders completely

---

## 📝 Why This Happens

DTrader is a **monorepo** with multiple packages:

- `@deriv/core` - Main entry point
- `@deriv/trader` - Trading interface (lazy-loaded)
- `@deriv/reports` - Reports module
- `@deriv/components` - Shared components

Each package can have its own webpack configuration and publicPath. When packages are lazy-loaded, they use their configured publicPath, which may not match the parent's path.

---

## 🔧 Long-term Solution

**Unified Build Configuration:**

Create a unified build script that:
1. Builds all packages with a consistent base path
2. Ensures lazy-loaded chunks use correct paths
3. Consolidates all assets into a single dist folder

This requires modifying the DTrader monorepo build process.

---

## 📋 Summary

| Solution | Speed | Complexity | Dev Mode | Production |
|----------|-------|------------|----------|------------|
| **Solution 1: Separate Route** | ⚡ Fast | 🟢 Low | ✅ Works | ✅ Works |
| **Solution 2: Rebuild** | 🐌 Slow | 🟡 Medium | ✅ Works | ✅ Works |
| **Solution 3: Proxy** | ⚡ Fast | 🟡 Medium | ❌ No | ✅ Works |

**Recommended**: Use **Solution 1** for immediate fix, then migrate to **Solution 2** for a proper long-term solution.
