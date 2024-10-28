// index.js

import puppeteer from 'puppeteer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { WebScraper } from './scraper.js';
import { ContentAnalyzer } from './analyzer.js';
import { ReportGenerator } from './report.js';

dotenv.config();

const websites = [
  'https://www.dairy.com/market-news',
  'https://www.globaldairytrade.info',
  'https://www.clal.it/en',
  'https://www.dairyreporter.com'
];

async function main() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set in .env file');
    }

    console.log('Initializing components...');
    const scraper = new WebScraper();
    const analyzer = new ContentAnalyzer();
    const reporter = new ReportGenerator();

    console.log('Starting data collection...');
    const scrapedData = await scraper.scrapeWebsites(websites);
    
    if (!scrapedData.some(data => data.status === 'success')) {
      throw new Error('No data could be scraped from any source');
    }

    console.log('Analyzing content...');
    const analysis = await analyzer.analyzeContent(scrapedData);
    
    if (analysis.status === 'error') {
      throw new Error(`Analysis failed: ${analysis.summary}`);
    }

    console.log('Generating report...');
    const report = await reporter.generateReport(scrapedData, analysis);
    
    if (report.status === 'error') {
      throw new Error(`Report generation failed: ${report.error}`);
    }

    console.log('Process completed successfully!');
    console.log('Report has been saved as report.pdf');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

main();
