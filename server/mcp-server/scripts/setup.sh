#!/bin/bash

# iMessage MCP Server Setup Script

set -e

echo "🚀 Setting up iMessage MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$SERVER_DIR")")"

echo -e "${BLUE}📁 Project root: ${PROJECT_ROOT}${NC}"
echo -e "${BLUE}📁 Server directory: ${SERVER_DIR}${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo -e "${GREEN}✅ Node.js version: ${NODE_VERSION}${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm version: ${NPM_VERSION}${NC}"

# Navigate to server directory
cd "$SERVER_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️ Creating .env file...${NC}"
    cp .env.example .env

    # Prompt for phone number
    echo -e "${BLUE}📱 Please enter your iPhone number (e.g., +1234567890):${NC}"
    read -r PHONE_NUMBER

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)

    # Update .env file
    sed -i.bak "s/PHONE_NUMBER=.*/PHONE_NUMBER=${PHONE_NUMBER}/" .env
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
    sed -i.bak "s|PROJECT_ROOT=.*|PROJECT_ROOT=${PROJECT_ROOT}|" .env

    # Remove backup file
    rm .env.bak

    echo -e "${GREEN}✅ .env file created and configured${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Build TypeScript
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm run build

# Create logs directory
mkdir -p logs

# Check Claude Desktop config path
CLAUDE_CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
echo -e "${BLUE}🔍 Checking Claude Desktop configuration...${NC}"

if [ -f "$CLAUDE_CONFIG_PATH" ]; then
    echo -e "${YELLOW}⚠️ Existing Claude Desktop config found. Creating backup...${NC}"
    cp "$CLAUDE_CONFIG_PATH" "$CLAUDE_CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy our config to Claude Desktop
echo -e "${YELLOW}📄 Installing Claude Desktop configuration...${NC}"
mkdir -p "$(dirname "$CLAUDE_CONFIG_PATH")"

# Update phone number and JWT secret in the config
CONFIG_CONTENT=$(cat claude_desktop_config.json)
if [ -f ".env" ]; then
    # Source .env to get variables
    source .env
    CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/\+1234567890/${PHONE_NUMBER}/g")
    CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/your-super-secure-jwt-secret-change-this/${JWT_SECRET}/g")
fi

echo "$CONFIG_CONTENT" > "$CLAUDE_CONFIG_PATH"

# Check AppleScript permissions
echo -e "${BLUE}🔒 Checking AppleScript permissions...${NC}"
if ! osascript -e 'tell application "Messages" to get name' &> /dev/null; then
    echo -e "${YELLOW}⚠️ AppleScript permissions needed for Messages app.${NC}"
    echo -e "${BLUE}Please go to: System Preferences → Security & Privacy → Privacy → Automation${NC}"
    echo -e "${BLUE}And allow Terminal/iTerm to control Messages.${NC}"
    echo ""
    echo -e "${BLUE}Press Enter when you've granted permissions...${NC}"
    read -r
fi

# Test AppleScript
echo -e "${YELLOW}🧪 Testing AppleScript access...${NC}"
if osascript -e 'tell application "Messages" to get name' &> /dev/null; then
    echo -e "${GREEN}✅ AppleScript permissions OK${NC}"
else
    echo -e "${RED}❌ AppleScript permissions still needed${NC}"
    echo -e "${BLUE}Please grant permissions and run this script again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Restart Claude Desktop app"
echo "2. Start the MCP server: npm start"
echo "3. Send a test message from your iPhone: 'register:your-phone'"
echo "4. Use the token in future messages: 'token:YOUR_TOKEN cmd:status'"
echo ""
echo -e "${BLUE}📱 Example iPhone commands:${NC}"
echo "• cmd: status"
echo "• cmd: git status"
echo "• cmd: npm test"
echo "• cmd: build"
echo "• cmd: claude implement new feature"
echo ""
echo -e "${YELLOW}⚠️ Important: Make sure your iPhone and Mac are signed into the same iCloud account!${NC}"