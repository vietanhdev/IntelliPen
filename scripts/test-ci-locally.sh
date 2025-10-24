#!/bin/bash

# Script to simulate GitHub Actions CI environment locally
# This helps catch CI issues before pushing

set -e  # Exit on error

echo "🚀 Simulating GitHub Actions CI environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies (npm ci)...${NC}"
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Install Chrome for Testing
echo -e "${BLUE}🌐 Step 2: Installing Chrome for Testing...${NC}"
npm run test:install-chrome
echo -e "${GREEN}✅ Chrome for Testing installed${NC}"
echo ""

# Step 3: Build extension
echo -e "${BLUE}🔨 Step 3: Building extension...${NC}"
npm run build
echo -e "${GREEN}✅ Extension built${NC}"
echo ""

# Step 4: Verify build output
echo -e "${BLUE}🔍 Step 4: Verifying build output...${NC}"
if [ ! -f "dist/manifest.json" ]; then
    echo -e "${RED}❌ dist/manifest.json not found${NC}"
    exit 1
fi
if [ ! -f "dist/background.js" ]; then
    echo -e "${RED}❌ dist/background.js not found${NC}"
    exit 1
fi
if [ ! -d "dist/sidepanel" ]; then
    echo -e "${RED}❌ dist/sidepanel directory not found${NC}"
    exit 1
fi
if [ ! -d "dist/popup" ]; then
    echo -e "${RED}❌ dist/popup directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All required files present${NC}"
echo ""

# Step 5: Run linter
echo -e "${BLUE}🔍 Step 5: Running ESLint...${NC}"
npm run lint || echo -e "${RED}⚠️  Linting issues found (continuing anyway)${NC}"
echo ""

# Step 6: Run tests in headless mode
echo -e "${BLUE}🧪 Step 6: Running tests in headless mode...${NC}"
npm run test:headless
echo -e "${GREEN}✅ All tests passed${NC}"
echo ""

# Success
echo -e "${GREEN}🎉 CI simulation completed successfully!${NC}"
echo -e "${GREEN}Your code is ready to push to GitHub.${NC}"
