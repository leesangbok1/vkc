# iMessage MCP Server (staged)

This folder contains a clean, working replacement for your iMessage command server. It's designed to be copied over the live file at:

- /Users/bk/imessage-mcp/server.js

What’s included:
- AppleScript polling for Messages chat with your phone number
- SQLite chat.db fallback with 3-tier query (requires Full Disk Access for node under launchd)
- Chunked message sending to avoid iMessage length issues
- Directory commands with persistent working directory:
  - pwd/cwd, ls [path], cd <path>, tree [path] [depth]
- HTTP endpoints: / (status page), /health, /run?cmd=..., /send?text=...

## Replace safely

1) Backup current file
   cp -v /Users/bk/imessage-mcp/server.js /Users/bk/imessage-mcp/server.js.bak.$(date +%Y%m%d%H%M%S)

2) Copy the clean server
   cp -v \
     /Users/bk/Desktop/poi-main/scripts/imessage-mcp/server.js \
     /Users/bk/imessage-mcp/server.js

3) Reload the LaunchAgent
   launchctl unload ~/Library/LaunchAgents/com.bk.imessage-mcp.plist || true
   launchctl load ~/Library/LaunchAgents/com.bk.imessage-mcp.plist

4) Verify
- Open http://localhost:3333/health and confirm:
  - ok: true
  - sqlite3 path is detected (or null if missing)
  - currentDir shows your persisted working directory
- Send iMessage: `cmd: pwd`, `cmd: ls`, `cmd: cd ~/Desktop`, `cmd: tree 2`

If anything fails:
- Check logs: tail -f /Users/bk/imessage-mcp/launchd.err /Users/bk/imessage-mcp/launchd.out
- Restore backup: cp -v /Users/bk/imessage-mcp/server.js.bak.* /Users/bk/imessage-mcp/server.js && launchctl unload/load again

Notes:
- This file is CommonJS (require/module.exports) to avoid ESM friction under launchd.
- The server auto-detects sqlite3 at /usr/bin/sqlite3, /opt/homebrew/bin/sqlite3, etc.
- Make sure node has Full Disk Access so SQLite fallback can read ~/Library/Messages/chat.db.
