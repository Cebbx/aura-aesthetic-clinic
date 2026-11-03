import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Path to Cloudflared in Laravel Herd
const herdCloudflared = 'C:\\Users\\Acer\\.config\\herd\\bin\\cloudflared.exe';
const cloudflaredBin = fs.existsSync(herdCloudflared) ? herdCloudflared : 'cloudflared';

console.clear();
console.log('====================================================================');
console.log('           AURA AESTHETIC CLINIC - LAUNCHER SYSTEM                  ');
console.log('====================================================================');
console.log(' [1/3] Starting Vite Web Server with Real-Time Database Sync...');

// 1. Start Vite
const vite = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe']
});

vite.stdout.on('data', (data) => {
  // Silent or monitor
});

vite.stderr.on('data', (data) => {
  // console.error(data.toString());
});

console.log(' [2/3] Connecting Cloudflare Tunnel via Herd...');

// 2. Start Cloudflare Tunnel
const tunnel = spawn(cloudflaredBin, ['tunnel', '--url', 'http://localhost:5173'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelUrlFound = false;
const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;

function onTunnelOutput(chunk) {
  const text = chunk.toString();
  const match = text.match(urlRegex);
  if (match && !tunnelUrlFound) {
    tunnelUrlFound = true;
    const publicUrl = match[0];
    
    // Save to file for quick reference
    try {
      fs.writeFileSync(path.resolve(projectRoot, 'tunnel-url.txt'), publicUrl, 'utf-8');
      fs.writeFileSync('C:\\Users\\Acer\\Desktop\\AURA_CLINIC_PHONE_LINK.txt', `AURA AESTHETIC CLINIC - LIVE PHONE LINK\n\nOpen this link on any mobile phone or browser:\n${publicUrl}\n\nKeep the CMD window open to maintain access.\n`, 'utf-8');
    } catch (e) {}

    console.clear();
    console.log('====================================================================');
    console.log('               AURA AESTHETIC CLINIC IS LIVE ONLINE!                ');
    console.log('====================================================================\n');
    console.log('   STATUS:              ONLINE & SYNCED');
    console.log('   DATABASE SYNC:       ACTIVE (data/aura-database.json)\n');
    console.log('   ----------------------------------------------------------------');
    console.log('   LAPTOP LOCAL ACCESS:');
    console.log('   >> http://localhost:5173');
    console.log('   ----------------------------------------------------------------\n');
    console.log('   PHONE & MOBILE ACCESS LINK (Copy to Any Mobile Phone):');
    console.log(`   >> \x1b[32m\x1b[1m${publicUrl}\x1b[0m`);
    console.log('   ----------------------------------------------------------------\n');
    console.log('   NOTE:');
    console.log('   - Keep this CMD window open while using the clinic.');
    console.log('   - Any appointment booked from phone syncs to laptop in real-time!');
    console.log('   - Saved link file on Desktop: AURA_CLINIC_PHONE_LINK.txt\n');
    console.log('====================================================================');
    console.log(' Press Ctrl+C at any time to safely stop the server and tunnel.\n');

    // Automatically open browser with the public tunnel URL
    try {
      execSync(`start ${publicUrl}`);
    } catch (e) {
      try {
        execSync('start http://localhost:5173');
      } catch (err) {}
    }
  }
}

tunnel.stdout.on('data', onTunnelOutput);
tunnel.stderr.on('data', onTunnelOutput);

// Cleanup on exit
function cleanExit() {
  console.log('\nStopping Aura Aesthetic Clinic services...');
  try { vite.kill(); } catch (e) {}
  try { tunnel.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
