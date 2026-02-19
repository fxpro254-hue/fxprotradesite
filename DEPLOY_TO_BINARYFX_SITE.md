# Deploy DTrader to fxprotrades.site

## Quick Setup Guide

Your bot is already deployed on Vercel at `fxprotrades.site`. Here's how to add dtrader to the same domain.

## Option A: Deploy as Path (fxprotrades.site/dtrader)

### Step 1: Build DTrader for Production

```powershell
cd dtrader
npm run build:all
```

### Step 2: Copy Built Files to Your Bot's Dist

```powershell
# Copy dtrader core to bot's public directory
mkdir ..\public\dtrader
xcopy /E /I packages\core\dist ..\public\dtrader\core

# Copy trader package
xcopy /E /I packages\trader\dist ..\public\dtrader\trader

# Copy reports package
xcopy /E /I packages\reports\dist ..\public\dtrader\reports
```

### Step 3: Update Your Bot's Build Configuration

The files will be automatically included when you build your bot project.

### Step 4: Deploy to Vercel

```powershell
cd ..
git add .
git commit -m "Add dtrader to production"
git push origin main
```

Vercel will automatically deploy. Access at:
- **DTrader Core**: https://fxprotrades.site/dtrader/core
- **DTrader Trader**: https://fxprotrades.site/dtrader/trader
- **DTrader Reports**: https://fxprotrades.site/dtrader/reports

---

## Option B: Deploy as Separate Vercel Project (Recommended)

This keeps dtrader separate with its own deployment.

### Step 1: Create New Vercel Project for DTrader

```powershell
cd dtrader
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Link to existing project**: No (create new)
- **Project name**: dtrader-binaryfx (or your choice)
- **Directory**: `./` (current directory)
- **Override settings**: Yes
  - **Build Command**: `npm run build:all`
  - **Output Directory**: `packages/core/dist`
  - **Install Command**: `npm run bootstrap`

### Step 2: Configure Custom Domain

After deployment:

1. Go to your Vercel dashboard
2. Select the dtrader project
3. Go to **Settings** → **Domains**
4. Add custom domain: `dtrader.binaryfx.site`
5. Follow DNS configuration instructions

### Step 3: Update DNS (at your domain provider)

Add a CNAME record:
```
Type: CNAME
Name: dtrader
Value: cname.vercel-dns.com
TTL: Auto
```

Wait 5-10 minutes for DNS propagation.

### Step 4: Access Your Live DTrader

Visit: **https://dtrader.binaryfx.site**

---

## Option C: Integrate into Bot Build Process

Create a unified build that includes both bot and dtrader.

### Step 1: Update Bot's Package.json

Add build scripts:

```json
"scripts": {
  "build": "npm run build:dtrader && rsbuild build",
  "build:dtrader": "cd dtrader && npm run build:all && cd ..",
  "postbuild": "npm run copy:dtrader",
  "copy:dtrader": "xcopy /E /I /Y dtrader\\packages\\core\\dist dist\\dtrader"
}
```

### Step 2: Update vercel.json

Make sure dtrader routes are handled:

```json
{
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "rewrites": [
    {
      "source": "/dtrader/(.*)",
      "destination": "/dtrader/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Deploy

```powershell
git add .
git commit -m "Integrate dtrader into bot build"
git push origin main
```

Access at: **https://fxprotrades.site/dtrader**

---

## Recommended: Option B (Separate Project)

**Advantages:**
- ✅ Independent deployments
- ✅ Separate build processes
- ✅ Better performance
- ✅ Cleaner architecture
- ✅ Own subdomain

**Steps:**
1. Run `cd dtrader && vercel`
2. Configure subdomain `dtrader.binaryfx.site`
3. Update DNS with CNAME record

---

## Environment Variables for Production

Create `.env.production` in `dtrader/packages/core/`:

```env
NODE_ENV=production
API_URL=https://api.deriv.com
WEBSOCKET_URL=wss://ws.derivws.com/websockets/v3
OAUTH_URL=https://oauth.deriv.com
APP_ID=your_deriv_app_id
VERCEL=1
```

Get your Deriv APP_ID from: https://api.deriv.com/app-registration

---

## Quick Command Summary

**Option B (Recommended):**
```powershell
# Build production version
cd dtrader
npm run build:all

# Deploy to Vercel
vercel --prod

# Or if first time
vercel
```

**Option A (Integrated):**
```powershell
# Build dtrader
cd dtrader
npm run build:all
cd ..

# Copy to bot's public folder
mkdir public\dtrader
xcopy /E /I /Y dtrader\packages\core\dist public\dtrader

# Deploy via git push
git add .
git commit -m "Add dtrader"
git push origin main
```

Which option would you like to proceed with?
