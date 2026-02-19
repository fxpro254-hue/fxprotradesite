#!/bin/bash

echo "🚀 Bot.FxProTrades Deployment Checker"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js version..."
node --version

# Check PM2
echo "✓ Checking PM2..."
pm2 --version

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file exists"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✓ node_modules installed"
else
    echo "⚠ Running npm install..."
    npm install
fi

# Check if dist exists
if [ -d dist ]; then
    echo "✓ Build directory exists"
else
    echo "⚠ Building application..."
    npm run build
fi

# Check API health (if running)
echo "✓ Checking API server..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$response" == "200" ]; then
    echo "✓ API server is running (port 3001)"
else
    echo "❌ API server not responding on port 3001"
    echo "  Start it with: pm2 start ecosystem.config.js"
fi

# Check nginx
echo "✓ Checking nginx..."
if command -v nginx &> /dev/null; then
    nginx -t 2>&1 | grep -q "successful"
    if [ $? -eq 0 ]; then
        echo "✓ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration has errors"
    fi
else
    echo "⚠ Nginx not installed"
fi

# Check PM2 processes
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "=================================="
echo "✅ Deployment check complete!"
echo ""
echo "Next steps:"
echo "1. Start services: npm run pm2:start"
echo "2. View logs: npm run pm2:logs"
echo "3. Test API: curl https://bot.binaryfx.site/api/health"
