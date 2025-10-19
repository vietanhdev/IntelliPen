#!/bin/bash

# IntelliPen Hugo Documentation Setup Script

echo "🚀 Setting up IntelliPen Hugo documentation..."

# Check if Hugo is installed
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo is not installed. Please install Hugo Extended first:"
    echo ""
    echo "macOS:   brew install hugo"
    echo "Linux:   Download from https://github.com/gohugoio/hugo/releases"
    echo "Windows: choco install hugo-extended"
    echo ""
    exit 1
fi

# Check if Hugo Extended is installed
if ! hugo version | grep -q "extended"; then
    echo "❌ Hugo Extended is required. Please install Hugo Extended."
    exit 1
fi

echo "✅ Hugo Extended found: $(hugo version)"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21 or later:"
    echo ""
    echo "macOS:   brew install go"
    echo "Linux:   sudo apt-get install golang-go"
    echo "Windows: Download from https://golang.org/dl/"
    echo ""
    exit 1
fi

echo "✅ Go found: $(go version)"

# Initialize Hugo modules
echo ""
echo "📦 Initializing Hugo modules..."
hugo mod init github.com/vietanhdev/IntelliPen/docs

# Download dependencies
echo ""
echo "📥 Downloading dependencies..."
hugo mod get

# Tidy modules
echo ""
echo "🧹 Tidying modules..."
hugo mod tidy

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  hugo server"
echo ""
echo "To build the site, run:"
echo "  hugo"
echo ""
echo "The site will be available at http://localhost:1313/"
