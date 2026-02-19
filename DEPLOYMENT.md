# Deployment Guide for fxprotrades.site

## Prerequisites

1. Node.js 22.x installed
2. PM2 installed globally: `npm install -g pm2`
3. Nginx installed
4. SSL certificate (Let's Encrypt recommended)

## Step 1: Setup Environment Variables

Create `.env` file on your production server:

```bash
# Database URLs (from Prisma)
DATABASE_URL="your_postgres_connection_string"
PRISMA_DATABASE_URL="your_prisma_accelerate_url"

# Environment
NODE_ENV=production

# Ports
PORT=3001
```

## Step 2: Install Dependencies

```bash
cd /var/www/fxprotrades.site
npm install
npx prisma generate
```

## Step 3: Build the Application

```bash
npm run build
```

## Step 4: Configure Nginx

```bash
# Copy the nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/fxprotrades.site

# Edit the configuration with your paths
sudo nano /etc/nginx/sites-available/fxprotrades.site

# Create symlink
sudo ln -s /etc/nginx/sites-available/fxprotrades.site /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 5: Start the API Server with PM2

```bash
# Start both frontend and API
npm run pm2:start

# Or start only the API
pm2 start server/index.js --name community-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Step 6: Verify Deployment

1. Check PM2 status:
```bash
pm2 status
```

2. Check API health:
```bash
curl https://fxprotrades.site/api/health
```

3. Check logs:
```bash
npm run pm2:logs
# or
pm2 logs community-api
```

## Troubleshooting

### API not responding (405 error)

1. Check if API server is running:
```bash
pm2 status
```

2. Check API logs:
```bash
pm2 logs community-api
```

3. Test API directly:
```bash
curl http://localhost:3001/api/health
```

4. Verify nginx is proxying correctly:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues

1. Verify environment variables are loaded:
```bash
pm2 env 0  # Replace 0 with your app ID
```

2. Test database connection:
```bash
npx prisma db push
```

3. Check Prisma Accelerate status

### CORS issues

- Verify the CORS configuration in `server/index.js` includes your domain
- Check nginx headers configuration

## Updating the Application

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Build
npm run build

# Restart services
npm run pm2:restart
```

## Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# View specific app logs
pm2 logs community-api
```
