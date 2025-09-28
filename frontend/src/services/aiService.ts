export interface AIService {
    generateSummary(content: string): Promise<string>;
    suggestTags(content: string): Promise<string[]>;
    checkGrammar(content: string): Promise<string>;
    generateGlossary(content: string): Promise<{ term: string; definition: string }[]>;
  }
  
  class RealAIService implements AIService {
  private getBaseURL(): string {
    // Always hit the same origin; vite dev server proxies /api to backend
    return '';
  }

  private async callAPI(endpoint: string, data: any): Promise<any> {
      try {
      const baseURL = this.getBaseURL();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${baseURL}/api/ai/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(data),
        signal: controller.signal
        });
      clearTimeout(timeout);

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

  // Local fallbacks to keep UX functional when AI is unavailable
  private localSummary(text: string): string {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const preview = sentences.slice(0, 3).join(' ');
    return preview || text.slice(0, 200);
  }

  private localTags(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['this','that','with','have','from','would','there','their','about','which','into','your','were','been','also','some','what','when','where','while','will','because','them','these','those','then'].includes(w));
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    return Object.entries(freq)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 8)
      .map(([w]) => w);
  }

  private localGlossary(text: string): { term: string; definition: string }[] {
    const tokens = Array.from(new Set(text.split(/[^A-Za-z0-9]+/).filter(t => t.length > 4))).slice(0, 8);
    return tokens.map(t => ({ term: t, definition: `Key term related to the note: ${t}` }));
  }

    async generateSummary(content: string): Promise<string> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return "This note appears to be empty or contains minimal content.";
      }

    try {
      const data = await this.callAPI('summary', { text: textContent });
      return data.summary || this.localSummary(textContent);
    } catch {
      return this.localSummary(textContent);
    }
    }

    async suggestTags(content: string): Promise<string[]> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return [];
      }
      
    try {
      const data = await this.callAPI('tags', { text: textContent, max: 10 });
      return data.tags || this.localTags(textContent);
    } catch {
      return this.localTags(textContent);
    }
    }

    async checkGrammar(content: string): Promise<string> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return content;
      }
      
    try {
      const data = await this.callAPI('grammar', { text: textContent });
      let corrected = data.corrected || content;
      
      // Clean up any extra text that might come from the AI response
      // Remove common prefixes that AI might add
      corrected = corrected.replace(/^(Here's the corrected version:|Corrected text:|Fixed version:)\s*/i, '');
      corrected = corrected.replace(/^\*\*.*?\*\*:\s*/g, ''); // Remove **text**: patterns
      corrected = corrected.replace(/^Original Text:\s*/i, '');
      corrected = corrected.replace(/^Corrected Text:\s*/i, '');
      
      return corrected.trim() || content;
    } catch {
      // Fallback: return original content
      return content;
    }
    }

    async generateGlossary(content: string): Promise<{ term: string; definition: string }[]> {
      const textContent = this.extractTextContent(content);
      if (!textContent.trim()) {
        return [];
      }
      
    try {
      const data = await this.callAPI('glossary', { text: textContent, maxTerms: 20 });
      return data.terms || this.localGlossary(textContent);
    } catch {
      return this.localGlossary(textContent);
    }
    }
  }
  
  export const aiService = new RealAIService();