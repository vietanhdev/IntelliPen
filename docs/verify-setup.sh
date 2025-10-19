#!/bin/bash

# IntelliPen Hugo Documentation Verification Script

echo "🔍 Verifying IntelliPen Hugo documentation setup..."
echo ""

# Check Hugo
echo "1. Checking Hugo..."
if command -v hugo &> /dev/null; then
    HUGO_VERSION=$(hugo version)
    if echo "$HUGO_VERSION" | grep -q "extended"; then
        echo "   ✅ Hugo Extended found: $HUGO_VERSION"
    else
        echo "   ❌ Hugo Extended required (found regular Hugo)"
        exit 1
    fi
else
    echo "   ❌ Hugo not found"
    exit 1
fi

# Check Go
echo "2. Checking Go..."
if command -v go &> /dev/null; then
    echo "   ✅ Go found: $(go version)"
else
    echo "   ❌ Go not found"
    exit 1
fi

# Check Node.js
echo "3. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js found: $(node --version)"
else
    echo "   ❌ Node.js not found"
    exit 1
fi

# Check npm
echo "4. Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm found: $(npm --version)"
else
    echo "   ❌ npm not found"
    exit 1
fi

# Check Hugo modules
echo "5. Checking Hugo modules..."
if [ -f "go.mod" ]; then
    echo "   ✅ go.mod found"
else
    echo "   ❌ go.mod not found"
    exit 1
fi

# Check Node modules
echo "6. Checking Node modules..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules found"
else
    echo "   ⚠️  node_modules not found (run: npm install)"
fi

# Check content structure
echo "7. Checking content structure..."
if [ -d "content/en/docs" ]; then
    DOC_COUNT=$(find content/en/docs -name "*.md" | wc -l)
    echo "   ✅ Documentation pages: $DOC_COUNT"
else
    echo "   ❌ content/en/docs not found"
    exit 1
fi

# Check configuration
echo "8. Checking configuration..."
if [ -f "hugo.toml" ]; then
    echo "   ✅ hugo.toml found"
else
    echo "   ❌ hugo.toml not found"
    exit 1
fi

# Try building
echo "9. Testing build..."
if hugo --gc --minify > /tmp/hugo-build.log 2>&1; then
    echo "   ✅ Build successful"
    
    # Check output
    if [ -d "public" ]; then
        PAGE_COUNT=$(find public -name "*.html" | wc -l)
        echo "   ✅ Generated pages: $PAGE_COUNT"
    fi
else
    echo "   ❌ Build failed (check /tmp/hugo-build.log)"
    cat /tmp/hugo-build.log
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "  - Start dev server: hugo server"
echo "  - Build for production: hugo --gc --minify"
echo "  - Visit: http://localhost:1313/"
echo ""
