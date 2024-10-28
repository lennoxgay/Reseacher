import puppeteer from 'puppeteer';

export class WebScraper {
  async scrapeWebsites(urls) {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
      headless: 'new',
      channel: 'chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--window-size=1920,1080'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      userDataDir: './chrome-data'
    });
    const results = [];

    try {
      for (const url of urls) {
        console.log(`Scraping ${url}...`);
        const result = await this.scrapeSingleSite(browser, url);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } finally {
      await browser.close();
    }

    return results;
  }

  async scrapeSingleSite(browser, url) {
    const page = await browser.newPage();
    try {
      // Set Opera browser user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0');
      
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });

      // Set headers to mimic Opera browser
      await page.setExtraHTTPHeaders({
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Opera";v="106", "Chromium";v="120", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'upgrade-insecure-requests': '1'
      });

      await page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 60000 
      });

      await page.waitForTimeout(3000);

      const content = await page.evaluate(() => {
        const removeSelectors = [
          'nav',
          'header',
          'footer',
          '.ads',
          '.navigation',
          '.menu',
          '.sidebar',
          'script',
          'style',
          '.cookie-notice',
          '.popup',
          '#cookie-banner'
        ];
        removeSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });

        const contentSelectors = [
          'article',
          '.content',
          '.main-content',
          '.post-content',
          'main',
          '.article-body',
          '#main-content',
          '.entry-content',
          '[role="main"]',
          '.page-content'
        ];

        let content = '';
        for (const selector of contentSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            content = Array.from(elements)
              .map(el => el.textContent)
              .join('\n');
            break;
          }
        }

        if (!content) {
          content = document.body.innerText;
        }

        return content
          .replace(/\s+/g, ' ')
          .replace(/\b(Accept|Cookie|Privacy Policy)\b.*$/gm, '')
          .trim();
      });

      return {
        url,
        content,
        timestamp: new Date().toISOString(),
        status: 'success'
      };

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return {
        url,
        content: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      };
    } finally {
      await page.close();
    }
  }
}