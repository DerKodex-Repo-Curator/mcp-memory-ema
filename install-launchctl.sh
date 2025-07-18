#!/bin/bash
# install-launchctl.sh - Install EMA as a launchctl service

set -e

PLIST_NAME="com.mcp.memory-ema"
PLIST_FILE="$PLIST_NAME.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PROJECT_DIR="$(pwd)"

echo "🚀 Installing EMA MCP Server as launchctl service..."

# Create logs directory
mkdir -p "$HOME/.ema/logs"

# Ensure project is built
echo "📦 Building project..."
npm run build

# Update paths in plist file
echo "🔧 Configuring service..."
sed -i '' "s|/Users/bard|$HOME|g" "$PLIST_FILE"
sed -i '' "s|/usr/local/bin/node|$(which node)|g" "$PLIST_FILE"

# Copy plist to LaunchAgents
echo "📝 Installing service configuration..."
cp "$PLIST_FILE" "$LAUNCH_AGENTS_DIR/"

# Load the service
echo "⚡ Loading service..."
launchctl load "$LAUNCH_AGENTS_DIR/$PLIST_FILE"

# Check status
echo "✅ Service installed! Checking status..."
launchctl list | grep "$PLIST_NAME" || echo "Service may take a moment to appear"

echo ""
echo "📌 Service Management Commands:"
echo "  Start:   launchctl start $PLIST_NAME"
echo "  Stop:    launchctl stop $PLIST_NAME"
echo "  Status:  launchctl list | grep $PLIST_NAME"
echo "  Logs:    tail -f ~/.ema/logs/ema-*.log"
echo "  Unload:  launchctl unload ~/Library/LaunchAgents/$PLIST_FILE"
echo ""
echo "🎉 EMA MCP server is now running as a system service!"