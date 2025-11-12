# PowerShell deployment script for Community Server

Write-Host "Deploying Community Server Updates..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Regenerate Prisma Client
Write-Host "Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Restart community-api server
Write-Host "Restarting community-api server..." -ForegroundColor Yellow
pm2 restart community-api

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to restart server" -ForegroundColor Red
    exit 1
}

Write-Host "Server restarted" -ForegroundColor Green
Write-Host ""

# Wait a moment for restart
Start-Sleep -Seconds 2

# Show server status
Write-Host "Server Status:" -ForegroundColor Cyan
pm2 status community-api

Write-Host ""

# Show recent logs
Write-Host "Recent Server Logs:" -ForegroundColor Cyan
pm2 logs community-api --lines 20 --nostream

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Watch logs: pm2 logs community-api"
Write-Host "  - Check email config: curl https://bot.binaryfx.site/api/email-config"
Write-Host "  - Test email: node test-email.js your-email@example.com"
Write-Host ""
