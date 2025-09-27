export interface AIService {
    generateSummary(content: string): Promise<string>;
    suggestTags(content: string): Promise<string[]>;
    checkGrammar(content: string): Promise<string>;
    generateGlossary(content: string): Promise<{ term: string; definition: string }[]>;
  }
  
  class RealAIService implements AIService {
    private getBaseURL(): string {
      // Use environment variable for production, fallback to localhost for development
      return process.env.NODE_ENV === 'production' 
        ? '' // Use relative URLs in production (Vercel)
        : 'http://localhost:5000';
    }

    private async callAPI(endpoint: string, data: any): Promise<any> {
      try {
        const baseURL = this.getBaseURL();
        const response = await fetch(`${baseURL}/api/ai/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
      }
    }

    private extractTextContent(htmlContent: string): string {
      return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    async generateSummary(content: string): Promise<string> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return "This note appears to be empty or contains minimal content.";
      }
      
      const data = await this.callAPI('summary', { text: textContent });
      return data.summary || 'Failed to generate summary';
    }

    async suggestTags(content: string): Promise<string[]> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return [];
      }
      
      const data = await this.callAPI('tags', { text: textContent, max: 10 });
      return data.tags || [];
    }

    async checkGrammar(content: string): Promise<string> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return content;
      }
      
      const data = await this.callAPI('grammar', { text: textContent });
      let corrected = data.corrected || content;
      
      // Clean up any extra text that might come from the AI response
      // Remove common prefixes that AI might add
      corrected = corrected.replace(/^(Here's the corrected version:|Corrected text:|Fixed version:)\s*/i, '');
      corrected = corrected.replace(/^\*\*.*?\*\*:\s*/g, ''); // Remove **text**: patterns
      corrected = corrected.replace(/^Original Text:\s*/i, '');
      corrected = corrected.replace(/^Corrected Text:\s*/i, '');
      
      return corrected.trim() || content;
    }

    async generateGlossary(content: string): Promise<{ term: string; definition: string }[]> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return [];
      }
      
      const data = await this.callAPI('glossary', { text: textContent, maxTerms: 20 });
      return data.terms || [];
    }
  }
  
  export const aiService = new RealAIService();