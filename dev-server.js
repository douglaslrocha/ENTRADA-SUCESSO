import { spawn } from 'child_process';
import * as path from 'path';

console.log('[DevServer] Starting Full-Stack Development Server...');

// 1. Spawn backend on port 5000
const backendEnv = {
  ...process.env,
  PORT: '5000',
  HOST: '0.0.0.0',
  NODE_ENV: 'development'
};

console.log('[DevServer] Spawning Fastify Backend on port 5000...');
const backend = spawn('node', ['backend/dist/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: backendEnv
});

// 2. Spawn Vite frontend on port 3000
console.log('[DevServer] Spawning Vite Frontend on port 3000 (proxied to backend on port 5000)...');
const frontend = spawn('npx', ['vite', '--port', '3000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// 3. Handle process exits
backend.on('exit', (code, signal) => {
  console.log(`[DevServer] Backend process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

frontend.on('exit', (code, signal) => {
  console.log(`[DevServer] Frontend process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('[DevServer] Stopping services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[DevServer] Terminating services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
