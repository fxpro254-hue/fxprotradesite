# 🚀 Deploy Bot + DTrader Integration to bot.binaryfx.site

## ✨ What's New

Your project now has:
- **D-Bot** button in the header → Opens your bot trading platform
- **D-Trader** button in the header → Opens manual trading platform
- Both run under **one domain**: bot.binaryfx.site

## 📋 Quick Deployment

### Step 1: Build Both Projects

```powershell
# This builds both D-Bot and D-Trader in one command
npm run build
```

This will:
1. Build D-Trader packages (components, reports, trader, core)
2. Build your D-Bot project
3. Copy D-Trader files to `dist/dtrader/`

### Step 2: Deploy to Vercel

```powershell
# Commit changes
git add .
git commit -m "Integrate D-Trader with navigation buttons"
git push origin main
```

Vercel will automatically deploy. Your site will be available at:
- **D-Bot**: https://bot.binaryfx.site/
- **D-Trader**: https://bot.binaryfx.site/dtrader

## 🎯 How It Works

### Navigation
- Click **"D-Bot"** button → Navigates to `/` (your bot platform)
- Click **"D-Trader"** button → Navigates to `/dtrader` (manual trading)

### Active State
The navigation buttons show which platform you're currently on:
- Active button has a purple gradient background
- Inactive buttons have a subtle grey background

### Responsive Design
- **Desktop**: Shows both icon and text
- **Mobile**: Shows only icons to save space

## 🛠️ Local Development

### Run D-Bot Only
```powershell
npm start
```
Access at: https://localhost:8443/

### Run D-Trader Only
```powershell
.\run-dtrader.ps1 core
```
Access at: https://localhost:8443/

**Note**: Both can't run simultaneously on port 8443. Stop one before starting the other.

### Test Full Integration Locally

```powershell
# Build everything
npm run build

# Serve the built files
npm run serve
```
Access at: http://localhost:8443/

## 📂 Project Structure

```
bot/
├── src/
│   ├── components/layout/header/
│   │   ├── header.tsx          # ✅ Added D-Bot & D-Trader buttons
│   │   └── header.scss         # ✅ Added button styles
│   ├── pages/
│   │   └── dtrader.tsx         # ✅ New: D-Trader redirect component
│   └── app/
│       └── App.tsx             # ✅ Added /dtrader route
├── dtrader/                     # D-Trader repository
│   └── packages/
│       ├── core/
│       ├── trader/
│       ├── reports/
│       └── components/
├── dist/                        # Build output
│   ├── index.html              # D-Bot app
│   ├── dtrader/                # D-Trader app
│   │   └── index.html
│   └── ...
├── package.json                # ✅ Updated build scripts
├── vercel.json                 # ✅ Added /dtrader routing
└── rsbuild.config.ts           # ✅ Copy dtrader files
```

## 🎨 Navigation Button Features

### Visual States
1. **Normal**: Grey background
2. **Hover**: Lighter grey + purple border + slight lift
3. **Active**: Purple gradient (current page)
4. **Click**: Slight press animation

### Icons
- **D-Bot**: Stacked layers icon (represents automated trading)
- **D-Trader**: Chart/graph icon (represents manual trading)

## 🔧 Configuration Files Updated

### 1. `rsbuild.config.ts`
- Added copy command for dtrader build files
- Copies from `dtrader/packages/core/dist` to `dist/dtrader`

### 2. `vercel.json`
- Added rewrite rules for `/dtrader` path
- Ensures `/dtrader` serves dtrader's index.html
- Other paths serve bot's index.html

### 3. `package.json`
- Updated `build` script to build both projects
- Added `build:bot` for building only bot
- Added `build:dtrader` for building only dtrader

## 🚨 Important Notes

### Before First Deployment

1. **Build D-Trader first**:
```powershell
npm run dtrader:build
```

2. **Verify build files exist**:
```powershell
# Check if dtrader build exists
ls dtrader\packages\core\dist
```

3. **Then build everything**:
```powershell
npm run build
```

### Troubleshooting

#### D-Trader button not working
- Check if `/dtrader/index.html` exists in dist folder
- Run `npm run build` again
- Clear browser cache

#### D-Trader shows 404
- Verify `vercel.json` has correct rewrites
- Check if dtrader files are in `dist/dtrader/`
- Redeploy to Vercel

#### Navigation buttons not styled correctly
- Clear browser cache (Ctrl+Shift+R)
- Check if `header.scss` changes are included
- Inspect browser console for CSS errors

#### Build fails
```powershell
# Clean and rebuild
rm -r dist
rm -r dtrader\packages\core\dist
npm run dtrader:build
npm run build
```

## 📱 Testing Checklist

Before deploying, test:

- [ ] D-Bot button navigates to `/`
- [ ] D-Trader button navigates to `/dtrader`
- [ ] Active state shows on correct button
- [ ] Both buttons visible on desktop
- [ ] Only icons visible on mobile
- [ ] Hover effects work
- [ ] Both platforms load correctly
- [ ] Can switch between platforms seamlessly

## 🌐 Live URLs

After deployment:
- **Home (D-Bot)**: https://bot.binaryfx.site/
- **D-Trader**: https://bot.binaryfx.site/dtrader

## 💡 Pro Tips

1. **Fast Development**: Run `npm start` for D-Bot, it's faster than building
2. **Test Production Build**: Use `npm run serve` after building
3. **Update D-Trader**: `cd dtrader && git pull && npm run build:all`
4. **Check Build Time**: D-Trader build takes 2-3 minutes
5. **Optimize**: D-Trader files are ~20MB, ensure good hosting

## 🆘 Need Help?

Common commands:
```powershell
# Full build (both projects)
npm run build

# Build only bot
npm run build:bot

# Build only dtrader
npm run build:dtrader

# Start dev server (bot)
npm start

# Start dev server (dtrader)
.\run-dtrader.ps1 core

# Deploy to Vercel
git push origin main
```

---

**Ready to deploy?** Run:
```powershell
npm run build
git add .
git commit -m "Add D-Bot and D-Trader navigation"
git push origin main
```

🎉 Your integrated bot+trader platform will be live at **bot.binaryfx.site**!
