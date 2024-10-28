import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

async function setup() {
  console.log('Starting Chrome setup process...');
  
  try {
    // Create necessary directories
    await fs.mkdir('./chrome-data', { recursive: true });
    
    console.log('Installing Chrome via Puppeteer...');
    
    // Force download the browser
    const browserFetcher = puppeteer.createBrowserFetcher({
      path: path.join(process.cwd(), '.local-chromium')
    });
    
    console.log('Downloading Chrome (this may take a few minutes)...');
    const revisionInfo = await browserFetcher.download('121.0.6167.85', (downloadedBytes, totalBytes) => {
      if (totalBytes) {
        const progress = (downloadedBytes / totalBytes) * 100;
        process.stdout.write(`Download progress: ${progress.toFixed(2)}%\r`);
      }
    });
    
    if (!revisionInfo?.executablePath) {
      throw new Error('Chrome download failed');
    }
    
    console.log('\nChrome downloaded successfully!');
    console.log('Testing browser launch...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: revisionInfo.executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userDataDir: './chrome-data'
    });
    
    await browser.close();
    console.log('Chrome setup completed successfully! ✅');
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    console.log('\nTrying alternative installation method...');
    
    try {
      await installChromeDirect();
      console.log('Alternative installation completed successfully! ✅');
    } catch (altError) {
      console.error('All installation methods failed.');
      console.error('Please ensure you have sufficient disk space and network connectivity.');
      process.exit(1);
    }
  }
}

async function installChromeDirect() {
  const chromium = require('@puppeteer/browsers');
  await chromium.install({
    browser: 'chrome',
    buildId: '121.0.6167.85'
  });
}

setup();