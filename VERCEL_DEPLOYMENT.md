# Vercel Deployment Guide for fxprotrades.site

## Prerequisites

1. Vercel account connected to your GitHub repository
2. Prisma Accelerate database URL

## Step 1: Configure Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
DATABASE_URL=your_postgres_direct_connection_string
PRISMA_DATABASE_URL=your_prisma_accelerate_url
NODE_ENV=production
```

## Step 2: Deploy to Vercel

### Option 1: Deploy via Git (Recommended)

1. Commit and push your changes:
```bash
git add .
git commit -m "feat: add Vercel serverless API support"
git push origin main
```

2. Vercel will automatically deploy

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment

1. Check API health:
```
https://fxprotrades.site/api/health
```

Should return:
```json
{"status":"ok","message":"Community API is running"}
```

2. Test user registration:
```bash
curl -X POST https://fxprotrades.site/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"loginId":"test123","fullName":"Test User"}'
```

## Project Structure for Vercel

```
bot/
├── api/
│   └── index.js          # Serverless API (replaces server/index.js)
├── dist/                 # Built frontend files
├── src/                  # React source code
├── vercel.json          # Vercel configuration
└── package.json
```

## How It Works

1. **Frontend**: Served as static files from `/dist`
2. **API**: Runs as Vercel Serverless Functions at `/api/*`
3. **Database**: Uses Prisma Accelerate for connection pooling

## Environment Variables

Set these in Vercel Dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Direct PostgreSQL connection | `postgres://user:pass@host/db` |
| `PRISMA_DATABASE_URL` | Prisma Accelerate URL | `prisma+postgres://accelerate...` |
| `NODE_ENV` | Environment | `production` |

## Troubleshooting

### API Returns 405 Method Not Allowed

- Check if environment variables are set in Vercel
- Verify vercel.json configuration
- Check Vercel deployment logs

### Database Connection Errors

- Ensure Prisma Accelerate URL is correct
- Verify Prisma client is generated during build
- Check if `npx prisma generate` runs in build command

### CORS Errors

- Update CORS origins in `api/index.js`
- Add your domain to the allowed origins list

## Updating the Application

1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-deploys from main branch

Or use Vercel CLI:
```bash
vercel --prod
```

## Monitoring

- View logs in Vercel Dashboard
- Check function performance
- Monitor database queries in Prisma Accelerate dashboard
