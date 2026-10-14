import { spawn, exec, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect directories
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const BACKEND_PORT = 5001;
const FRONTEND_PORT = 5173;

// Terminal colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const magenta = '\x1b[35m';
const red = '\x1b[31m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

console.log(`\n${bold}${cyan}====================================================================${reset}`);
console.log(`${bold}${cyan}   🎓  ALL INDIA SCHOLARSHIP & SCHEME ELIGIBILITY PORTAL  🎓${reset}`);
console.log(`${bold}${cyan}====================================================================${reset}\n`);

// 1. Kill stale processes on ports 5001 and 5173 on Windows to prevent EADDRINUSE
function freePort(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`) && parts[3] === 'LISTENING') {
          const pid = parts[4];
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              console.log(`${yellow}⚡ Released port ${port} (terminated previous process ${pid})${reset}`);
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      // Port was free
    }
  }
}

freePort(BACKEND_PORT);
freePort(FRONTEND_PORT);

// 2. Ensure dependencies exist
if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
  console.log(`${yellow}📦 Installing backend dependencies...${reset}`);
  execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
}

if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
  console.log(`${yellow}📦 Installing frontend dependencies...${reset}`);
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
}

// 3. Helper to wait for HTTP endpoint
function waitForServer(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      http.get(url, (res) => {
        clearInterval(interval);
        resolve(true);
      }).on('error', () => {
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          resolve(false);
        }
      });
    }, 400);
  });
}

// 4. Start Backend Server
console.log(`${cyan}🚀 Starting Backend Server (Express + SQLite)...${reset}`);

const backendProcess = spawn(process.execPath, ['server.js'], {
  cwd: backendDir,
  shell: false,
  stdio: ['pipe', 'pipe', 'pipe']
});

backendProcess.stdout.on('data', (data) => {
  const text = data.toString();
  for (const line of text.split('\n')) {
    if (line.trim()) {
      console.log(`${cyan}[Backend]${reset} ${line.trim()}`);
    }
  }
});

backendProcess.stderr.on('data', (data) => {
  const text = data.toString();
  for (const line of text.split('\n')) {
    if (line.trim()) {
      console.error(`${red}[Backend Error]${reset} ${line.trim()}`);
    }
  }
});

// 5. Wait for backend and start Frontend
let browserOpened = false;
let fallbackTimer = null;

function openBrowserUrl(targetUrl) {
  if (browserOpened) return;
  browserOpened = true;
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  console.log(`\n${bold}${green}🌐 Opening Scholarship Portal in Google Chrome: ${targetUrl}${reset}\n`);
  if (process.platform === 'win32') {
    // Explicitly launch Chrome so Edge (system default) is not used.
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    ];
    // fs is already imported at the top of this file
    let chromePath = chromePaths.find(p => fs.existsSync(p));
    if (chromePath) {
      exec(`"${chromePath}" "${targetUrl}"`);
    } else {
      // Chrome not found — fall back to system default browser
      console.log(`${yellow}⚠️  Chrome not found. Opening in default browser...${reset}`);
      exec(`start "" "${targetUrl}"`);
    }
  } else if (process.platform === 'darwin') {
    exec(`open -a "Google Chrome" "${targetUrl}" || open "${targetUrl}"`);
  } else {
    exec(`google-chrome "${targetUrl}" || xdg-open "${targetUrl}"`);
  }
}

async function startFrontend() {
  console.log(`${yellow}⏳ Checking backend health on port ${BACKEND_PORT}...${reset}`);
  const backendReady = await waitForServer(`http://127.0.0.1:${BACKEND_PORT}/api/schemes`, 10000);

  if (backendReady) {
    console.log(`${bold}${green}✅ Backend & Database Connected! (http://localhost:${BACKEND_PORT})${reset}`);
  } else {
    console.log(`${yellow}⚠️ Backend initialized, launching frontend...${reset}`);
  }

  console.log(`${magenta}🚀 Starting Frontend Dev Server (Vite)...${reset}`);

  const frontendCmd = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const frontendArgs = process.platform === 'win32' ? ['/c', 'npm run dev'] : ['run', 'dev'];

  const frontendProcess = spawn(frontendCmd, frontendArgs, {
    cwd: frontendDir,
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  frontendProcess.stdout.on('data', (data) => {
    const text = data.toString();
    for (const line of text.split('\n')) {
      if (line.trim()) {
        console.log(`${magenta}[Frontend]${reset} ${line.trim()}`);
        if (!browserOpened && (line.includes('Local:') || line.includes('localhost:5173'))) {
          openBrowserUrl(`http://localhost:${FRONTEND_PORT}`);
        }
      }
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    const text = data.toString();
    for (const line of text.split('\n')) {
      if (line.trim()) {
        console.error(`${yellow}[Frontend Info]${reset} ${line.trim()}`);
      }
    }
  });

  // Fallback timer to open browser in case stdout line pattern didn't match
  fallbackTimer = setTimeout(() => {
    openBrowserUrl(`http://localhost:${FRONTEND_PORT}`);
  }, 4000);

  // Clean shutdown on Ctrl+C
  const cleanup = () => {
    console.log(`\n${yellow}🛑 Shutting down backend and frontend services...${reset}`);
    try {
      if (process.platform === 'win32') {
        if (backendProcess && backendProcess.pid) execSync(`taskkill /F /T /PID ${backendProcess.pid}`, { stdio: 'ignore' });
        if (frontendProcess && frontendProcess.pid) execSync(`taskkill /F /T /PID ${frontendProcess.pid}`, { stdio: 'ignore' });
      } else {
        if (backendProcess) backendProcess.kill();
        if (frontendProcess) frontendProcess.kill();
      }
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startFrontend();
