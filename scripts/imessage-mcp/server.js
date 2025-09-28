#!/usr/bin/env node

// Clean, CommonJS version to avoid ESM friction under launchd
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const os = require('os');
const path = require('path');

const execAsync = promisify(exec);

const CONFIG = {
  phoneNumber: process.env.MONITOR_PHONE || '+821099773918',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3333,
  checkInterval: process.env.CHECK_INTERVAL ? parseInt(process.env.CHECK_INTERVAL, 10) : 2000,
  logFile: path.join(process.env.HOME || os.homedir(), 'imessage-mcp', 'commands.log')
};

let SQLITE3_BIN = null;
const STATE_FILE = path.join(process.env.HOME || os.homedir(), 'imessage-mcp', 'state.json');
let CURRENT_DIR = process.cwd();
const lastProcessedMessages = new Set();

async function runAppleScript(script) {
  const tmp = path.join(os.tmpdir(), `imsg-${Date.now()}-${Math.random().toString(36).slice(2)}.scpt`);
  await fsp.writeFile(tmp, script, 'utf8');
  try {
    const { stdout } = await execAsync(`osascript "${tmp}"`, { timeout: 8000 });
    return (stdout || '').trim();
  } finally {
    await fsp.unlink(tmp).catch(() => {});
  }
}

async function checkMessages() {
  try {
    const e164 = CONFIG.phoneNumber;
    const local = e164.startsWith('+82') ? '0' + e164.slice(3) : e164;
    const plain = e164.startsWith('+') ? e164.slice(1) : e164;
    const localPlain = local.replace(/[^0-9]/g, '');

    const script = `
      tell application "Messages"
        set targetPhone to "${e164}"
        set altPhone1 to "${local}"
        set altPhone2 to "${plain}"
        set altPhone3 to "${localPlain}"
        set foundIndex to 0
        set chatCount to (count of chats)
        repeat with i from 1 to chatCount
          set cid to ""
          try
            set cid to id of chat i
          end try
          set matched to false
          if cid contains targetPhone or cid contains altPhone1 or cid contains altPhone2 or cid contains altPhone3 then
            set matched to true
          else
            try
              repeat with p in (participants of chat i)
                set h to ""
                try
                  set h to id of handle of p
                end try
                if h contains targetPhone or h contains altPhone1 or h contains altPhone2 or h contains altPhone3 then
                  set matched to true
                  exit repeat
                end if
              end repeat
            end try
          end if
          if matched then
            set foundIndex to i
            exit repeat
          end if
        end repeat
        if foundIndex > 0 then
          set msgs to messages of chat foundIndex
          set n to count of msgs
          set startIndex to n - 30
          if startIndex < 1 then set startIndex to 1
          set output to ""
          repeat with j from startIndex to n
            set m to item j of msgs
            set messageText to ""
            try
              set messageText to text of m
            end try
            if messageText is missing value or messageText is "" then
              try
                set messageText to content of m
              end try
            end if
            set messageID to id of m
            set output to output & messageID & "|" & messageText & linefeed
          end repeat
          return output
        else
          return ""
        end if
      end tell
    `;

    const stdout = await runAppleScript(script);
    const newMessages = [];
    const lines = stdout.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const idx = line.indexOf('|');
      if (idx === -1) continue;
      const id = line.slice(0, idx);
      const text = line.slice(idx + 1).trim();
      if (id && text && !lastProcessedMessages.has(id)) {
        const m = text.match(/^cmd[:\s]+(.+)/i);
        if (m && m[1]) {
          newMessages.push(m[1].trim());
          lastProcessedMessages.add(id);
        }
      }
    }

    if (newMessages.length === 0) {
      const dbCmds = await checkMessagesViaDB(e164, local, plain, localPlain).catch(() => []);
      for (const item of dbCmds) {
        const key = `db:${item.id}`;
        if (!lastProcessedMessages.has(key)) {
          newMessages.push(item.cmd);
          lastProcessedMessages.add(key);
        }
      }
    }

    return newMessages;
  } catch (error) {
    console.error('메시지 확인 오류:', error.message);
    return [];
  }
}

async function checkMessagesViaDB(e164, local, plain, localPlain) {
  const dbPath = path.join(process.env.HOME, 'Library', 'Messages', 'chat.db');
  if (!SQLITE3_BIN) return [];
  const likeTargets = [e164, local, plain, localPlain].filter(Boolean).map(v => v.replace(/\"/g, ''));

  const likeClauses1 = likeTargets
    .map(v => `lower(coalesce(h.id,'')) LIKE lower('%${v}%') OR lower(coalesce(c.chat_identifier,'')) LIKE lower('%${v}%') OR lower(coalesce(c.guid,'')) LIKE lower('%${v}%')`)
    .join(' OR ');
  const sql1 = `SELECT m.ROWID as id, coalesce(m.text,'') as text
                FROM message m
                JOIN chat_message_join cmj ON cmj.message_id = m.ROWID
                JOIN chat c ON c.ROWID = cmj.chat_id
                LEFT JOIN chat_handle_join chj ON chj.chat_id = c.ROWID
                LEFT JOIN handle h ON h.ROWID = chj.handle_id
                WHERE (${likeClauses1})
                ORDER BY m.ROWID DESC LIMIT 60;`;
  const cmd1 = `${SQLITE3_BIN} -readonly -separator '|' "${dbPath}" "${sql1.replace(/\n/g, ' ')}"`;
  try {
    const { stdout } = await execAsync(cmd1, { timeout: 4000 });
    const lines = stdout.split('\n').filter(Boolean);
    const out = [];
    for (const line of lines) {
      const idx = line.indexOf('|');
      if (idx === -1) continue;
      const id = line.slice(0, idx);
      const text = line.slice(idx + 1).trim();
      const m = text.match(/^cmd[:\s]+(.+)/i);
      if (m && m[1]) out.push({ id, cmd: m[1].trim() });
    }
    if (out.length > 0) return out.reverse();
  } catch (e1) {}

  try {
    const sql2 = `SELECT m.ROWID as id, coalesce(m.text,'') as text
          FROM message m
          WHERE m.is_from_me = 0 AND (lower(m.text) LIKE 'cmd:%' OR lower(m.text) LIKE 'cmd %')
          ORDER BY m.ROWID DESC LIMIT 40;`;
    const cmd2 = `${SQLITE3_BIN} -readonly -separator '|' "${dbPath}" "${sql2.replace(/\n/g, ' ')}"`;
    const { stdout: stdout2 } = await execAsync(cmd2, { timeout: 4000 });
    const lines2 = stdout2.split('\n').filter(Boolean);
    const out2 = [];
    for (const line of lines2) {
      const idx = line.indexOf('|');
      if (idx === -1) continue;
      const id = line.slice(0, idx);
      const text = line.slice(idx + 1).trim();
      const m = text.match(/^cmd[:\s]+(.+)/i);
      if (m && m[1]) out2.push({ id, cmd: m[1].trim() });
    }
    if (out2.length > 0) return out2.reverse();
  } catch (e2) {}

  try {
    const sql3 = `SELECT m.ROWID as id, coalesce(m.text,'') as text
                  FROM message m
                  WHERE (lower(m.text) LIKE 'cmd:%' OR lower(m.text) LIKE 'cmd %')
                  ORDER BY m.ROWID DESC LIMIT 60;`;
    const cmd3 = `${SQLITE3_BIN} -readonly -separator '|' "${dbPath}" "${sql3.replace(/\n/g, ' ')}"`;
    const { stdout: stdout3 } = await execAsync(cmd3, { timeout: 4000 });
    const lines3 = stdout3.split('\n').filter(Boolean);
    const out3 = [];
    for (const line of lines3) {
      const idx = line.indexOf('|');
      if (idx === -1) continue;
      const id = line.slice(0, idx);
      const text = line.slice(idx + 1).trim();
      const m = text.match(/^cmd[:\s]+(.+)/i);
      if (m && m[1]) out3.push({ id, cmd: m[1].trim() });
    }
    return out3.reverse();
  } catch (e3) {
    return [];
  }
}

async function sendMessage(message, status = 'info') {
  const emoji = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }[status] || '';
  const prefix = `${emoji} `;
  const chunks = splitIntoChunks(message, 450);

  try {
    const e164 = CONFIG.phoneNumber;
    const local = e164.startsWith('+82') ? '0' + e164.slice(3) : e164;
    const plain = e164.startsWith('+') ? e164.slice(1) : e164;
    const localPlain = local.replace(/[^0-9]/g, '');

    const findScript = `
      tell application "Messages"
        set targetPhone to "${e164}"
        set altPhone1 to "${local}"
        set altPhone2 to "${plain}"
        set altPhone3 to "${localPlain}"
        set foundIndex to 0
        set chatCount to (count of chats)
        repeat with i from 1 to chatCount
          set cid to ""
          try
            set cid to id of chat i
          end try
          set matched to false
          if cid contains targetPhone or cid contains altPhone1 or cid contains altPhone2 or cid contains altPhone3 then
            set matched to true
          else
            try
              repeat with p in (participants of chat i)
                set h to ""
                try
                  set h to id of handle of p
                end try
                if h contains targetPhone or h contains altPhone1 or h contains altPhone2 or h contains altPhone3 then
                  set matched to true
                  exit repeat
                end if
              end repeat
            end try
          end if
          if matched then
            set foundIndex to i
            exit repeat
          end if
        end repeat
        if foundIndex > 0 then
          return "found"
        else
          return "chat not found"
        end if
      end tell
    `;

    const stdout = await runAppleScript(findScript);
    if (!stdout.includes('found')) return false;

    let okAll = true;
    const total = chunks.length;
    for (let i = 0; i < total; i++) {
      const label = total > 1 ? `(${i + 1}/${total}) ` : '';
      const part = `${prefix}${label}${chunks[i]}`
        .replace(/\"/g, '\\\"')
        .replace(/\n/g, '\\n');
      const sendScript = `
        tell application "Messages"
          set targetPhone to "${e164}"
          set altPhone1 to "${local}"
          set altPhone2 to "${plain}"
          set altPhone3 to "${localPlain}"
          set foundIndex to 0
          set chatCount to (count of chats)
          repeat with i from 1 to chatCount
            set cid to ""
            try
              set cid to id of chat i
            end try
            set matched to false
            if cid contains targetPhone or cid contains altPhone1 or cid contains altPhone2 or cid contains altPhone3 then
              set matched to true
            else
              try
                repeat with p in (participants of chat i)
                  set h to ""
                  try
                    set h to id of handle of p
                  end try
                  if h contains targetPhone or h contains altPhone1 or h contains altPhone2 or h contains altPhone3 then
                    set matched to true
                    exit repeat
                  end if
                end repeat
              end try
            end if
            if matched then
              set foundIndex to i
              exit repeat
            end if
          end repeat
          if foundIndex > 0 then
            send "${part}" to chat foundIndex
            return "sent"
          else
            return "chat not found"
          end if
        end tell
      `;
      const out = await runAppleScript(sendScript);
      const ok = out.includes('sent');
      okAll = okAll && ok;
      await waitMs(150);
    }
    return okAll;
  } catch (error) {
    return false;
  }
}

async function executeCommand(command) {
  const logEntry = `${new Date().toISOString()} | ${command}\n`;
  await fsp.appendFile(CONFIG.logFile, logEntry).catch(() => {});

  try {
    const handlers = {
      status: async () => {
        const branch = await execAsync('git branch --show-current 2>/dev/null', { cwd: CURRENT_DIR }).catch(() => ({ stdout: 'none' }));
        const status = await execAsync('git status -s 2>/dev/null', { cwd: CURRENT_DIR }).catch(() => ({ stdout: '' }));
        return `📍 위치: ${CURRENT_DIR}\n🌿 브랜치: ${branch.stdout.trim()}\n📝 변경: ${status.stdout ? status.stdout.split('\n').filter(Boolean).length + ' files' : 'clean'}\n⏰ ${new Date().toLocaleTimeString()}`;
      },
      help: async () => {
        return `📱 사용 가능한 명령:\n• status\n• test\n• build\n• git [명령]\n• claude [지시]\n• pwd|cwd\n• ls [경로]\n• cd <경로>\n• tree [경로] [깊이]`;
      },
      test: async () => {
        const result = await execAsync('npm test 2>&1', { cwd: CURRENT_DIR }).catch(e => e);
        return `테스트 결과:\n${result.stdout || result.stderr || '테스트 없음'}`;
      },
      build: async () => {
        const result = await execAsync('npm run build 2>&1', { cwd: CURRENT_DIR }).catch(e => e);
        return `빌드 결과:\n${result.stdout || result.stderr || '빌드 스크립트 없음'}`;
      },
      pwd: async () => `현재 디렉토리: ${CURRENT_DIR}`,
      cwd: async () => `현재 디렉토리: ${CURRENT_DIR}`,
      ls: async (args) => {
        const target = (args || '').trim();
        const dir = target ? resolvePath(CURRENT_DIR, target) : CURRENT_DIR;
        const result = await execAsync('ls -la', { cwd: dir }).catch(e => e);
        const out = result.stdout || result.stderr || '';
        const head = out.split('\n').slice(0, 200).join('\n');
        return `📂 목록 (${dir})\n${head}`;
      },
      cd: async (args) => {
        const target = (args || '').trim();
        if (!target) return '사용법: cd <경로>';
        const resolved = resolvePath(CURRENT_DIR, target);
        try {
          const st = await fsp.stat(resolved);
          if (!st.isDirectory()) return `디렉토리가 아님: ${resolved}`;
          CURRENT_DIR = resolved;
          await persistState();
          return `이동 완료: ${CURRENT_DIR}`;
        } catch (e) {
          return `경로 접근 실패: ${resolved}\n${e.message}`;
        }
      },
      tree: async (args) => {
        const parts = (args || '').trim().split(/\s+/).filter(Boolean);
        let depth = 2;
        let base = CURRENT_DIR;
        if (parts.length === 1) {
          if (/^\d+$/.test(parts[0])) depth = parseInt(parts[0], 10);
          else base = resolvePath(CURRENT_DIR, parts[0]);
        } else if (parts.length >= 2) {
          base = resolvePath(CURRENT_DIR, parts[0]);
          if (/^\d+$/.test(parts[1])) depth = parseInt(parts[1], 10);
        }
        const txt = await buildTree(base, { maxDepth: depth, maxLines: 400 });
        return `📁 트리 (${base}, depth=${depth})\n${txt}`;
      }
    };

    if (command.startsWith('git ')) {
      const result = await execAsync(command + ' 2>&1', { cwd: CURRENT_DIR }).catch(e => e);
      await sendMessage(result.stdout || result.stderr || '완료', result.stderr ? 'error' : 'success');
      return;
    }

    if (command.startsWith('claude ')) {
      const instruction = command.slice(7);
      const claudeFile = {
        timestamp: new Date().toISOString(),
        from: 'iPhone',
        instruction,
        context: await handlers.status()
      };
      await fsp.writeFile(
        path.join(process.env.HOME || os.homedir(), 'imessage-mcp', 'claude-instruction.json'),
        JSON.stringify(claudeFile, null, 2)
      );
      await sendMessage(`Claude에게 전달됨: "${instruction}"`, 'success');
      return;
    }

    const [baseCommand, ...rest] = command.split(' ');
    if (handlers[baseCommand]) {
      const result = await handlers[baseCommand](rest.join(' '));
      await sendMessage(result, 'info');
      return;
    }

    await sendMessage(`알 수 없는 명령: ${command}\n'help'로 명령 목록 확인`, 'warning');
  } catch (error) {
    await sendMessage(`오류: ${error.message}`, 'error');
  }
}

function startHttpServer() {
  const server = http.createServer(async (req, res) => {
    const urlObj = new URL(req.url || '/', `http://localhost:${CONFIG.port}`);
    if (urlObj.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>iMessage MCP Server</title>
          <style>
            body { font-family: -apple-system, system-ui; padding: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            h1 { color: #333; }
            .status { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .command { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
            button { background: #007aff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 iMessage MCP Server</h1>
            <div class="status">
              <strong>상태:</strong> 🟢 실행 중<br>
              <strong>모니터링:</strong> ${CONFIG.phoneNumber}<br>
              <strong>체크 간격:</strong> ${CONFIG.checkInterval}ms<br>
              <strong>작업 디렉토리:</strong> ${CURRENT_DIR}<br>
              <strong>시작 시간:</strong> ${new Date().toLocaleTimeString()}
            </div>
            <h2>테스트 명령:</h2>
            <div class="command">cmd: status</div>
            <div class="command">cmd: help</div>
            <div class="command">cmd: pwd</div>
            <button onclick="location.reload()">새로고침</button>
          </div>
        </body>
        </html>
      `);
    } else if (urlObj.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, phone: CONFIG.phoneNumber, interval: CONFIG.checkInterval, sqlite3: SQLITE3_BIN || null, currentDir: CURRENT_DIR }));
    } else if (urlObj.pathname === '/run') {
      const cmd = (urlObj.searchParams.get('cmd') || '').trim();
      if (!cmd) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'missing cmd' }));
        return;
      }
      try {
        await executeCommand(cmd);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    } else if (urlObj.pathname === '/send') {
      const text = (urlObj.searchParams.get('text') || '').trim();
      if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'missing text' }));
        return;
      }
      const ok = await sendMessage(text, 'info');
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(CONFIG.port, () => {
    console.log(`🌐 상태 페이지: http://localhost:${CONFIG.port}`);
  });
}

async function resolveSqlite3Bin() {
  if (process.env.SQLITE3_PATH) return process.env.SQLITE3_PATH;
  try {
    const { stdout } = await execAsync('command -v sqlite3');
    const bin = stdout.trim();
    if (bin) return bin;
  } catch {}
  const candidates = [
    '/usr/bin/sqlite3',
    '/opt/homebrew/bin/sqlite3',
    '/usr/local/bin/sqlite3',
    path.join(process.env.HOME || '', 'anaconda3', 'bin', 'sqlite3')
  ];
  for (const c of candidates) {
    try { await fsp.access(c); return c; } catch {}
  }
  return null;
}

function splitIntoChunks(text, maxLen) {
  const t = String(text || '');
  if (t.length <= maxLen) return [t];
  const chunks = [];
  let i = 0;
  while (i < t.length) { chunks.push(t.slice(i, i + maxLen)); i += maxLen; }
  return chunks;
}
function waitMs(ms) { return new Promise(res => setTimeout(res, ms)); }
function resolvePath(base, p) {
  if (!p) return base;
  if (p.startsWith('~')) return path.resolve(os.homedir(), p.slice(1));
  if (path.isAbsolute(p)) return path.resolve(p);
  return path.resolve(base, p);
}
async function persistState() {
  const state = { currentDir: CURRENT_DIR };
  try {
    await fsp.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {}
}
async function restoreState() {
  try {
    const data = await fsp.readFile(STATE_FILE, 'utf8');
    const st = JSON.parse(data);
    if (st && typeof st.currentDir === 'string' && st.currentDir) {
      CURRENT_DIR = st.currentDir;
    }
  } catch {}
}
async function buildTree(root, opts = {}) {
  const { maxDepth = 2, maxLines = 400 } = opts;
  const lines = [];
  const ignore = new Set(['.git', 'node_modules', '.DS_Store']);
  async function walk(dir, depth, prefix) {
    if (lines.length >= maxLines) return;
    if (depth > maxDepth) return;
    let entries;
    try { entries = await fsp.readdir(dir, { withFileTypes: true }); }
    catch (e) { lines.push(`${prefix}[접근불가] ${dir}`); return; }
    entries.sort((a,b)=> a.name.localeCompare(b.name));
    for (let i = 0; i < entries.length; i++) {
      if (lines.length >= maxLines) return;
      const ent = entries[i];
      if (ignore.has(ent.name)) continue;
      const isLast = i === entries.length - 1;
      const branch = isLast ? '└─' : '├─';
      const p = path.join(dir, ent.name);
      lines.push(`${prefix}${branch} ${ent.name}${ent.isDirectory() ? '/' : ''}`);
      if (ent.isDirectory()) {
        await walk(p, depth + 1, prefix + (isLast ? '  ' : '│ '));
      }
    }
  }
  await walk(root, 1, '');
  return lines.join('\n');
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   📱 iMessage Command Server 시작됨    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 모니터링 번호: ${CONFIG.phoneNumber}`);
  console.log(`⏱  체크 간격: ${CONFIG.checkInterval}ms`);
  console.log(`📝 로그 파일: ${CONFIG.logFile}`);
  console.log('');
  await fsp.mkdir(path.join(process.env.HOME || os.homedir(), 'imessage-mcp'), { recursive: true }).catch(() => {});
  SQLITE3_BIN = await resolveSqlite3Bin();
  console.log(`🧩 sqlite3 경로: ${SQLITE3_BIN || 'Not found'}`);
  await restoreState();
  console.log(`📂 작업 디렉토리: ${CURRENT_DIR}`);
  startHttpServer();
  await checkMessages();
  setInterval(async () => {
    const messages = await checkMessages();
    for (const command of messages) {
      await sendMessage(`명령 수신: ${command}`, 'info');
      await executeCommand(command);
    }
  }, CONFIG.checkInterval);
  console.log('✅ 준비 완료!');
}

main().catch(console.error);

process.on('SIGINT', () => {
  console.log('\n👋 서버 종료 중...');
  process.exit(0);
});
