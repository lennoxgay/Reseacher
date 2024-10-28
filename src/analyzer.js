import OpenAI from 'openai';

export class ContentAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeContent(scrapedData) {
    try {
      // Filter out failed scrapes
      const validData = scrapedData.filter(data => data.status === 'success' && data.content);
      
      if (validData.length === 0) {
        throw new Error('No valid content to analyze');
      }

      const prompt = this.createAnalysisPrompt(validData);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a dairy market analyst expert. Analyze the provided market data and:
1. Identify key market trends
2. Evaluate supply and demand factors
3. Predict specific price impacts on milk
4. Provide confidence levels for predictions
5. List key risk factors`
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1500
      });

      return {
        summary: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
        sourcesAnalyzed: validData.length,
        status: 'success'
      };

    } catch (error) {
      console.error('Analysis error:', error.message);
      return {
        summary: 'Analysis failed: ' + error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  createAnalysisPrompt(validData) {
    return validData.map(data => (
      `Source: ${data.url}\n\nContent: ${data.content}\n\n---\n\n`
    )).join('');
  }
}