#!/bin/bash

# iMessage MCP Server Test Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing iMessage MCP Server...${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"

# Navigate to server directory
cd "$SERVER_DIR"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Run setup.sh first.${NC}"
    exit 1
fi

# Source environment variables
source .env

echo -e "${GREEN}✅ Environment loaded${NC}"
echo -e "${BLUE}📱 Phone: ${PHONE_NUMBER}${NC}"
echo -e "${BLUE}📁 Project: ${PROJECT_ROOT}${NC}"

# Test 1: Check if Messages app is accessible
echo -e "${YELLOW}🧪 Test 1: AppleScript Messages access...${NC}"
if osascript -e 'tell application "Messages" to get name' &> /dev/null; then
    echo -e "${GREEN}✅ Messages app accessible${NC}"
else
    echo -e "${RED}❌ Cannot access Messages app. Check permissions.${NC}"
    exit 1
fi

# Test 2: Check if build works
echo -e "${YELLOW}🧪 Test 2: TypeScript build...${NC}"
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ TypeScript build successful${NC}"
else
    echo -e "${RED}❌ TypeScript build failed${NC}"
    npm run build
    exit 1
fi

# Test 3: Test JWT token generation
echo -e "${YELLOW}🧪 Test 3: JWT authentication...${NC}"
node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const phone = process.env.PHONE_NUMBER;

const token = jwt.sign({ phoneNumber: phone }, secret, { expiresIn: '1h' });
console.log('Generated token:', token.substring(0, 20) + '...');

const decoded = jwt.verify(token, secret);
console.log('Decoded phone:', decoded.phoneNumber);

if (decoded.phoneNumber === phone) {
  console.log('✅ JWT authentication working');
} else {
  console.log('❌ JWT authentication failed');
  process.exit(1);
}
"

# Test 4: Test command parsing
echo -e "${YELLOW}🧪 Test 4: Command parsing...${NC}"
node -e "
const fs = require('fs');
const path = require('path');

// Simple command parsing test
const testMessages = [
  'cmd: status',
  'token:abc123 cmd: git status',
  'cmd: npm test',
  'cmd: claude help me debug'
];

console.log('Testing command formats:');
testMessages.forEach(msg => {
  const cmdMatch = msg.replace(/^token:[a-zA-Z0-9.-_]+\s+/, '').match(/^cmd:\s*(\w+)\s*(.*)$/);
  if (cmdMatch) {
    console.log('✅', msg, '->', { type: cmdMatch[1], payload: cmdMatch[2] });
  } else {
    console.log('❌', msg, '-> No match');
  }
});
"

# Test 5: Test project directory access
echo -e "${YELLOW}🧪 Test 5: Project directory access...${NC}"
if [ -d "$PROJECT_ROOT" ]; then
    echo -e "${GREEN}✅ Project directory accessible: ${PROJECT_ROOT}${NC}"

    # Test git access
    if cd "$PROJECT_ROOT" && git status &> /dev/null; then
        echo -e "${GREEN}✅ Git repository accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ Not a git repository or git not accessible${NC}"
    fi

    # Test npm access
    if cd "$PROJECT_ROOT" && npm --version &> /dev/null; then
        echo -e "${GREEN}✅ npm accessible${NC}"
    else
        echo -e "${RED}❌ npm not accessible${NC}"
    fi
else
    echo -e "${RED}❌ Project directory not accessible: ${PROJECT_ROOT}${NC}"
    exit 1
fi

# Test 6: Test Claude Desktop config
echo -e "${YELLOW}🧪 Test 6: Claude Desktop configuration...${NC}"
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo -e "${GREEN}✅ Claude Desktop config exists${NC}"

    # Check if our MCP server is configured
    if grep -q "imessage-commander" "$CLAUDE_CONFIG"; then
        echo -e "${GREEN}✅ iMessage MCP server configured in Claude Desktop${NC}"
    else
        echo -e "${YELLOW}⚠️ iMessage MCP server not found in Claude Desktop config${NC}"
        echo -e "${BLUE}Run setup.sh to configure Claude Desktop${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Claude Desktop config not found${NC}"
    echo -e "${BLUE}Run setup.sh to create Claude Desktop config${NC}"
fi

# Test 7: Simulate iMessage command processing
echo -e "${YELLOW}🧪 Test 7: Command processing simulation...${NC}"
node -e "
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testCommand() {
  try {
    // Test a simple git command
    const { stdout } = await execAsync('git --version', { cwd: '${PROJECT_ROOT}' });
    console.log('✅ Git command test:', stdout.trim());

    // Test npm command
    const npmResult = await execAsync('npm --version');
    console.log('✅ npm command test:', npmResult.stdout.trim());

    console.log('✅ Command execution working');
  } catch (error) {
    console.log('❌ Command execution failed:', error.message);
  }
}

testCommand();
"

echo ""
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo -e "${BLUE}📋 To start the server:${NC}"
echo "cd $(pwd)"
echo "npm start"
echo ""
echo -e "${BLUE}📱 To test from iPhone:${NC}"
echo "1. Send: register:${PHONE_NUMBER}"
echo "2. Use the token returned in future messages"
echo "3. Send: token:YOUR_TOKEN cmd:status"
echo ""
echo -e "${YELLOW}⚠️ Make sure Claude Desktop is restarted after configuration!${NC}"