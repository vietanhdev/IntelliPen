#!/bin/bash

# IntelliPen E2E Test Runner
# This script builds the extension and runs E2E tests

set -e  # Exit on error

echo "🚀 IntelliPen E2E Test Runner"
echo "=============================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "🔨 Building extension..."
    npm run build
    echo ""
else
    echo "✅ Extension already built (dist/ exists)"
    echo "   To rebuild, run: npm run build"
    echo ""
fi

# Check Chrome version
if command -v google-chrome &> /dev/null; then
    CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
    echo "🌐 Chrome version: $CHROME_VERSION"
elif command -v chromium &> /dev/null; then
    CHROME_VERSION=$(chromium --version | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
    echo "🌐 Chromium version: $CHROME_VERSION"
else
    echo "⚠️  Chrome/Chromium not found in PATH"
fi
echo ""

# Run tests
echo "🧪 Running E2E tests..."
echo ""

if [ "$1" == "--watch" ]; then
    npm run test:e2e:watch
elif [ "$1" == "--verbose" ]; then
    npm run test:e2e:verbose
else
    npm run test:e2e
fi

echo ""
echo "✨ Tests complete!"
