import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class ReportGenerator {
  async generateReport(scrapedData, analysis) {
    const doc = new PDFDocument();
    const outputPath = 'report.pdf';

    try {
      doc.pipe(fs.createWriteStream(outputPath));

      // Header
      this.addHeader(doc);
      
      // Executive Summary
      this.addExecutiveSummary(doc, analysis);
      
      // Market Analysis
      this.addMarketAnalysis(doc, analysis);
      
      // Source Data
      this.addSourceData(doc, scrapedData);
      
      // Footer
      this.addFooter(doc);

      doc.end();
      return { status: 'success', path: outputPath };

    } catch (error) {
      console.error('Report generation error:', error.message);
      doc.end();
      return { status: 'error', error: error.message };
    }
  }

  addHeader(doc) {
    doc.fontSize(24)
       .text('Dairy Market Analysis Report', { align: 'center' })
       .fontSize(12)
       .text(`Generated on: ${new Date().toLocaleString()}`)
       .moveDown(2);
  }

  addExecutiveSummary(doc, analysis) {
    doc.fontSize(16)
       .text('Executive Summary', { underline: true })
       .moveDown()
       .fontSize(12)
       .text(analysis.summary.split('\n')[0] || 'No summary available')
       .moveDown(2);
  }

  addMarketAnalysis(doc, analysis) {
    doc.fontSize(16)
       .text('Detailed Market Analysis', { underline: true })
       .moveDown()
       .fontSize(12)
       .text(analysis.summary)
       .moveDown(2);
  }

  addSourceData(doc, scrapedData) {
    doc.fontSize(16)
       .text('Source Data', { underline: true })
       .moveDown();

    scrapedData.forEach(data => {
      doc.fontSize(14)
         .text(`Source: ${data.url}`)
         .fontSize(12)
         .text(`Status: ${data.status}`)
         .moveDown();

      if (data.status === 'success') {
        doc.text(data.content)
           .moveDown();
      } else {
        doc.text(`Error: ${data.error}`)
           .moveDown();
      }
      
      doc.text('---')
         .moveDown();
    });
  }

  addFooter(doc) {
    doc.fontSize(10)
       .text('This report is generated automatically and should be used for informational purposes only.', {
         align: 'center',
         bottom: 30
       });
  }
}