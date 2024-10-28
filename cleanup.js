import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

async function cleanup() {
  console.log('Cleaning up previous Chrome installations...');

  const dirsToClean = [
    '.local-chromium',
    '.cache/puppeteer',
    'chrome-data'
  ];

  for (const dir of dirsToClean) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      console.log(`✅ Cleaned ${dir}`);
    } catch (error) {
      console.log(`Could not clean ${dir}:`, error.message);
    }
  }

  // Clear npm cache
  try {
    execSync('npm cache clean --force');
    console.log('✅ Cleaned npm cache');
  } catch (error) {
    console.log('Could not clean npm cache:', error.message);
  }

  console.log('\nCleanup completed. You can now try reinstalling Chrome.');
}

cleanup();