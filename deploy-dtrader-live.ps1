# Deploy DTrader to Vercel
# Usage: .\deploy-dtrader-live.ps1 [option]
# Options: integrated, separate, subdomain

param(
    [ValidateSet("integrated", "separate", "subdomain")]
    [string]$deployType = "separate"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying DTrader to bot.binaryfx.site..." -ForegroundColor Green
Write-Host "Deployment Type: $deployType" -ForegroundColor Cyan
Write-Host ""

# Build DTrader
Write-Host "📦 Building DTrader for production..." -ForegroundColor Yellow
Set-Location dtrader

Write-Host "Installing dependencies..." -ForegroundColor Gray
npm run bootstrap

Write-Host "Building all packages..." -ForegroundColor Gray
npm run build:all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Deploy based on selected option
switch ($deployType) {
    "integrated" {
        Write-Host "📂 Copying DTrader files to bot's public directory..." -ForegroundColor Yellow
        Set-Location ..
        
        # Create dtrader directory in public
        if (!(Test-Path "public\dtrader")) {
            New-Item -ItemType Directory -Path "public\dtrader" -Force | Out-Null
        }
        
        # Copy built files
        Write-Host "Copying core package..." -ForegroundColor Gray
        Copy-Item -Path "dtrader\packages\core\dist\*" -Destination "public\dtrader\" -Recurse -Force
        
        Write-Host "✅ Files copied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: git add ." -ForegroundColor White
        Write-Host "2. Run: git commit -m 'Deploy dtrader'" -ForegroundColor White
        Write-Host "3. Run: git push origin main" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 DTrader will be available at:" -ForegroundColor Green
        Write-Host "   https://bot.binaryfx.site/dtrader" -ForegroundColor White
    }
    
    "separate" {
        Write-Host "🚀 Deploying to Vercel as separate project..." -ForegroundColor Yellow
        
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (!$vercelInstalled) {
            Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "Deploying to production..." -ForegroundColor Gray
        vercel --prod
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Deployment completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Go to Vercel dashboard" -ForegroundColor White
        Write-Host "2. Add custom domain: dtrader.binaryfx.site" -ForegroundColor White
        Write-Host "3. Update DNS with CNAME record" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 After DNS setup, DTrader will be available at:" -ForegroundColor Green
        Write-Host "   https://dtrader.binaryfx.site" -ForegroundColor White
    }
    
    "subdomain" {
        Write-Host "🌐 Setting up subdomain deployment..." -ForegroundColor Yellow
        
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (!$vercelInstalled) {
            Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "Deploying to production..." -ForegroundColor Gray
        vercel --prod
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Deployment completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Configure custom domain:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Select your dtrader project" -ForegroundColor White
        Write-Host "3. Go to Settings → Domains" -ForegroundColor White
        Write-Host "4. Add: dtrader.binaryfx.site" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 DNS Configuration:" -ForegroundColor Cyan
        Write-Host "   Type: CNAME" -ForegroundColor White
        Write-Host "   Name: dtrader" -ForegroundColor White
        Write-Host "   Value: cname.vercel-dns.com" -ForegroundColor White
        Write-Host "   TTL: Auto" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✨ Deployment process completed!" -ForegroundColor Green

Set-Location ..
