#!/bin/bash

echo "🚀 Deploying Community Server Updates..."
echo "========================================"

# Regenerate Prisma Client
echo "📦 Regenerating Prisma Client..."
npx prisma generate

# Restart community-api server
echo "🔄 Restarting community-api server..."
pm2 restart community-api

# Wait a moment for restart
sleep 2

# Show server status
echo ""
echo "📊 Server Status:"
pm2 status community-api

# Show recent logs
echo ""
echo "📋 Recent Server Logs:"
pm2 logs community-api --lines 20 --nostream

echo ""
echo "✅ Deployment complete!"
echo ""
echo "💡 Tips:"
echo "  - Watch logs: pm2 logs community-api"
echo "  - Check email config: curl https://fxprotrades.site/api/email-config"
echo "  - Test email: node test-email.js your-email@example.com"
