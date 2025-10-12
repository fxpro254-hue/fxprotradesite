# Deploying Deriv Trader to Live/Production

## Current Status
✅ Deriv Trader running locally at https://localhost:8443/

## Deployment Options

### Option 1: Build for Production (Recommended)

Build the static files that can be deployed to any hosting service:

```powershell
# Build all packages for production
cd dtrader
npm run build:all

# Or build specific packages
npm run build --workspace=@deriv/core
npm run build --workspace=@deriv/trader
npm run build --workspace=@deriv/reports
```

The built files will be in:
- `dtrader/packages/core/dist/`
- `dtrader/packages/trader/dist/`
- `dtrader/packages/reports/dist/`

### Option 2: Deploy to Vercel

1. **Install Vercel CLI:**
```powershell
npm install -g vercel
```

2. **Deploy from core package:**
```powershell
cd dtrader\packages\core
vercel
```

3. **Follow the prompts:**
   - Link to Vercel project
   - Configure build settings
   - Deploy

### Option 3: Deploy to Netlify

1. **Install Netlify CLI:**
```powershell
npm install -g netlify-cli
```

2. **Build and deploy:**
```powershell
cd dtrader\packages\core
npm run build
netlify deploy --prod --dir=dist
```

### Option 4: Deploy to GitHub Pages

1. **Build the project:**
```powershell
cd dtrader
npm run build:all
```

2. **Create a GitHub Actions workflow:**

Create `.github/workflows/deploy.yml` in the dtrader directory:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm run bootstrap
        
      - name: Build
        run: npm run build:all
        
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: packages/core/dist
          branch: gh-pages
```

### Option 5: Deploy to Your Own Server

1. **Build for production:**
```powershell
cd dtrader
npm run build:all
```

2. **Copy built files to server:**
```powershell
# Example using SCP
scp -r packages/core/dist/* user@yourserver.com:/var/www/html/
```

3. **Configure Nginx or Apache** to serve the static files

**Example Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable HTTPS
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Option 6: Deploy Using Docker

1. **Create Dockerfile in dtrader directory:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/

RUN npm ci --strict-peer-deps
RUN npm run build:all

FROM nginx:alpine
COPY --from=builder /app/packages/core/dist /usr/share/nginx/html
COPY --from=builder /app/packages/trader/dist /usr/share/nginx/html/trader
COPY --from=builder /app/packages/reports/dist /usr/share/nginx/html/reports

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Build and run:**
```powershell
cd dtrader
docker build -t dtrader .
docker run -p 80:80 dtrader
```

### Option 7: Use the Official Deriv Deployment

Since this is the official Deriv Trader repository, you might want to:

1. **Fork the repository** to your own GitHub account
2. **Set up CI/CD** using their existing workflows
3. **Configure your own domain** and API keys
4. **Deploy to your infrastructure**

## Environment Configuration

Before deploying, you'll need to configure environment variables:

1. **Create `.env` file** in `dtrader/packages/core/`:

```env
NODE_ENV=production
API_URL=https://api.deriv.com
WEBSOCKET_URL=wss://ws.derivws.com/websockets/v3
OAUTH_URL=https://oauth.deriv.com
APP_ID=your_app_id_here
```

2. **Get API credentials** from Deriv:
   - Visit https://api.deriv.com/
   - Register your application
   - Get your APP_ID

## Production Checklist

Before going live, ensure:

- [ ] All packages are built successfully
- [ ] Environment variables are configured
- [ ] API keys are set up
- [ ] SSL certificate is installed
- [ ] Domain is configured
- [ ] CORS settings are correct
- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Analytics is configured
- [ ] Performance monitoring is enabled
- [ ] Security headers are set
- [ ] Cache policies are configured

## Quick Production Build

For a quick production build and test:

```powershell
# Build everything
cd dtrader
npm run build:all

# Serve locally to test production build
npm install -g serve
cd packages\core\dist
serve -s . -p 3000
```

Then open http://localhost:3000 to test the production build locally.

## Custom Domain

After deploying, you can:

1. **Purchase a domain** (e.g., GoDaddy, Namecheap)
2. **Configure DNS** to point to your server/hosting
3. **Set up SSL** using Let's Encrypt or your hosting provider
4. **Update CORS** settings in your API configuration

## Monitoring

Consider adding monitoring services:

- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Google Analytics, Vercel Analytics
- **Errors**: Sentry, Rollbar
- **Logs**: LogRocket, Datadog

## Cost Estimates

- **Vercel/Netlify**: Free tier available, ~$20-50/month for pro
- **VPS (DigitalOcean, Linode)**: ~$5-10/month
- **AWS/Google Cloud**: Variable, ~$10-50/month
- **GitHub Pages**: Free for public repos

## Next Steps

1. Choose your deployment method
2. Build the production files
3. Configure environment variables
4. Set up your domain
5. Deploy and test
6. Monitor and maintain

Would you like help with any specific deployment method?
