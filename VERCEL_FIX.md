# Quick Fix for Empty Vercel Deployment

## The Issue
Your site is empty because Vercel isn't serving the built files correctly.

## Solution

### 1. Update vercel.json (Already done)
The `vercel.json` now has:
- `outputDirectory: "dist"` - tells Vercel where your built files are
- `buildCommand: "npm run build"` - tells Vercel how to build

### 2. Verify Build Locally
Test that the build works:
```bash
npm run build
```

Check that `dist/` folder contains:
- `index.html`
- `static/` folder with JS/CSS files

### 3. Push to Git and Redeploy
```bash
git add .
git commit -m "fix: configure Vercel to serve dist folder correctly"
git push origin main
```

### 4. Check Vercel Build Logs

Go to: https://vercel.com/[your-username]/bot/deployments

Click on the latest deployment and check:
- ✅ Build succeeded
- ✅ Output shows "dist" folder
- ✅ No errors in build logs

### 5. Environment Variables in Vercel

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=your_postgres_url
PRISMA_DATABASE_URL=your_prisma_accelerate_url
NODE_ENV=production
```

## Common Issues

### Build Fails
- Check Node.js version (should be 22.x)
- Check build logs for errors
- Try building locally first

### Site Still Empty
- Verify `dist/` folder has files
- Check `outputDirectory` in vercel.json matches your build output
- Look at Vercel deployment preview URL

### API Not Working
- Check environment variables are set
- Verify `/api` folder exists with `index.js`
- Test API endpoint: `https://fxprotrades.site/api/health`

## Manual Deployment (if auto-deploy fails)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Verify Deployment

1. Visit: https://fxprotrades.site
2. Should see your app (not empty)
3. Open Console (F12) - check for errors
4. Test API: https://fxprotrades.site/api/health

## If Still Empty

The issue might be the framework detection. Try adding to `vercel.json`:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

This tells Vercel to use custom build settings instead of auto-detecting.
