import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function runDiagnostics() {
  console.log('Running Chrome Installation Diagnostics...\n');

  // Check disk space
  try {
    const free = parseInt(execSync('df -k / | tail -1 | awk \'{print $4}\'').toString());
    const freeGB = (free * 1024 / 1000000000).toFixed(2);
    console.log(`Available disk space: ${freeGB} GB`);
    
    if (free < 1000000) { // Less than 1GB
      console.log('⚠️  Warning: Low disk space. Chrome needs at least 1GB free space.');
    }
  } catch (error) {
    console.log('Could not check disk space:', error.message);
  }

  // Check temp directory permissions
  try {
    const tempDir = os.tmpdir();
    await fs.access(tempDir, fs.constants.W_OK);
    console.log('✅ Temp directory is writable:', tempDir);
  } catch {
    console.log('⚠️  Warning: Cannot write to temp directory');
  }

  // Check Chrome download directory
  const chromeDir = path.join(process.cwd(), '.local-chromium');
  try {
    await fs.mkdir(chromeDir, { recursive: true });
    console.log('✅ Chrome directory is created and writable:', chromeDir);
  } catch {
    console.log('⚠️  Warning: Cannot create Chrome directory');
  }

  // Check network connectivity
  try {
    execSync('curl -s https://www.google.com > /dev/null');
    console.log('✅ Network connectivity: OK');
  } catch {
    console.log('⚠️  Warning: Network connectivity issues detected');
  }

  // Memory check
  const totalMem = os.totalmem() / 1024 / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024 / 1024;
  console.log(`Memory - Total: ${totalMem.toFixed(2)}GB, Free: ${freeMem.toFixed(2)}GB`);
  
  if (freeMem < 1) {
    console.log('⚠️  Warning: Low memory. Chrome installation needs at least 1GB free memory');
  }

  // Check for existing Chrome installation
  try {
    const chromePaths = [
      '.local-chromium',
      '.cache/puppeteer',
      'chrome-data'
    ];

    for (const chromePath of chromePaths) {
      try {
        const stats = await fs.stat(chromePath);
        console.log(`${chromePath}: ${stats.isDirectory() ? 'Directory exists' : 'File exists'}`);
      } catch {
        console.log(`${chromePath}: Does not exist`);
      }
    }
  } catch (error) {
    console.log('Error checking Chrome paths:', error.message);
  }
}

runDiagnostics();