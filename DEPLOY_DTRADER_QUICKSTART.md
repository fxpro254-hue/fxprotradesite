# 🚀 Deploy DTrader to bot.binaryfx.site - Quick Start

## ⚡ Fastest Way (Recommended)

```powershell
# Option 1: Deploy as separate Vercel project with subdomain
npm run dtrader:deploy
```

**Result:** DTrader at `https://dtrader.binaryfx.site`

---

## 📋 All Deployment Options

### Option 1: Separate Vercel Project (RECOMMENDED)
```powershell
npm run dtrader:deploy
```
- ✅ Own subdomain: `dtrader.binaryfx.site`
- ✅ Independent deployments
- ✅ Faster builds
- ✅ Better performance

**After running:**
1. Go to https://vercel.com/dashboard
2. Find your dtrader project
3. Go to **Settings → Domains**
4. Add custom domain: `dtrader.binaryfx.site`
5. Add CNAME record to your DNS:
   ```
   Type: CNAME
   Name: dtrader
   Value: cname.vercel-dns.com
   ```

### Option 2: Integrated (Same Deployment)
```powershell
npm run dtrader:deploy:integrated
git add .
git commit -m "Deploy dtrader"
git push origin main
```
- ✅ Same deployment as bot
- ✅ Access at: `bot.binaryfx.site/dtrader`
- ✅ No DNS changes needed

### Option 3: Manual Deployment
```powershell
# Build
cd dtrader
npm run build:all

# Deploy with Vercel CLI
vercel --prod
```

---

## 🎯 After Deployment

### For Separate Project (Option 1):
1. **Configure custom domain** in Vercel dashboard
2. **Update DNS** with CNAME record
3. **Wait 5-10 minutes** for DNS propagation
4. **Access:** https://dtrader.binaryfx.site

### For Integrated (Option 2):
1. **Wait for Vercel** to auto-deploy (2-3 minutes)
2. **Access:** https://bot.binaryfx.site/dtrader

---

## 🔧 Configuration Needed

### Get Deriv API Credentials

1. Visit: https://api.deriv.com/app-registration
2. Register your app
3. Get your **APP_ID**

### Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select dtrader project
3. Go to **Settings → Environment Variables**
4. Add these variables:

```
NODE_ENV=production
API_URL=https://api.deriv.com
WEBSOCKET_URL=wss://ws.derivws.com/websockets/v3
OAUTH_URL=https://oauth.deriv.com
APP_ID=<your_app_id_here>
```

---

## 📊 DNS Configuration

If using separate project (subdomain):

**At your DNS provider (e.g., Cloudflare, Namecheap):**

| Type  | Name    | Value                   | TTL  |
|-------|---------|-------------------------|------|
| CNAME | dtrader | cname.vercel-dns.com    | Auto |

---

## ✅ Verification Checklist

- [ ] DTrader built successfully
- [ ] Deployed to Vercel
- [ ] Custom domain added (if Option 1)
- [ ] DNS configured (if Option 1)
- [ ] Environment variables set
- [ ] Deriv API credentials configured
- [ ] Site is accessible
- [ ] SSL certificate active
- [ ] All pages load correctly

---

## 🐛 Troubleshooting

### Build Fails
```powershell
cd dtrader
npm run bootstrap
npm run build:all
```

### Deployment Fails
```powershell
# Check Vercel CLI
vercel --version

# Reinstall if needed
npm install -g vercel

# Login
vercel login
```

### DNS Not Working
- Wait 10-30 minutes for propagation
- Check DNS: https://dnschecker.org
- Verify CNAME record is correct

### Site Shows 404
- Check output directory is correct
- Verify vercel.json configuration
- Check deployment logs in Vercel dashboard

---

## 📱 URLs After Deployment

### Option 1 (Separate):
- **DTrader:** https://dtrader.binaryfx.site
- **Your Bot:** https://bot.binaryfx.site

### Option 2 (Integrated):
- **DTrader:** https://bot.binaryfx.site/dtrader
- **Your Bot:** https://bot.binaryfx.site

---

## 🔄 Update After Deployment

```powershell
# Pull latest changes
cd dtrader
git pull origin main

# Rebuild and redeploy
npm run build:all
vercel --prod
```

---

## 💡 Pro Tips

1. **Use separate project** for better performance
2. **Set up auto-deploy** by linking GitHub repo in Vercel
3. **Monitor deployments** in Vercel dashboard
4. **Enable analytics** in Vercel for insights
5. **Set up custom error pages** for better UX

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Deriv API Docs:** https://api.deriv.com/docs
- **Check logs:** `vercel logs <deployment-url>`

---

**Ready to deploy?** Run: `npm run dtrader:deploy`
