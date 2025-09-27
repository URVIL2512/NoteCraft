export interface AIService {
    generateSummary(content: string): Promise<string>;
    suggestTags(content: string): Promise<string[]>;
    checkGrammar(content: string): Promise<string[]>;
    generateGlossary(content: string): Promise<{ [key: string]: string }>;
  }
  
  class MockAIService implements AIService {
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    private extractTextContent(htmlContent: string): string {
      return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  
    async generateSummary(content: string): Promise<string> {
      await this.delay(1500);
      
      const textContent = this.extractTextContent(content);
      const sentences = textContent.split('.').filter(s => s.trim().length > 10);
      
      if (sentences.length === 0) {
        return "This note appears to be empty or contains minimal content.";
      }
      
      if (sentences.length === 1) {
        return sentences[0].trim() + ".";
      }
      
      const keyTerms = textContent.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const termFreq: { [key: string]: number } = {};
      keyTerms.forEach(term => {
        termFreq[term] = (termFreq[term] || 0) + 1;
      });
      
      const importantTerms = Object.entries(termFreq)
        .filter(([, freq]) => freq > 1)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([term]) => term);
      
      const firstSentence = sentences[0].trim();
      const lastSentence = sentences[sentences.length - 1].trim();
      
      if (importantTerms.length > 0) {
        return `${firstSentence}. Key topics include: ${importantTerms.join(', ')}.`;
      }
      
      return `${firstSentence}. ${lastSentence}.`;
    }
  
    async suggestTags(content: string): Promise<string[]> {
      await this.delay(1200);
      
      const textContent = this.extractTextContent(content).toLowerCase();
      const allTags: string[] = [];
      
      const techTerms = ['javascript', 'python', 'react', 'nodejs', 'html', 'css', 'api', 'database', 'frontend', 'backend'];
      const businessTerms = ['meeting', 'project', 'deadline', 'client', 'budget', 'strategy', 'marketing', 'sales', 'planning'];
      const personalTerms = ['idea', 'todo', 'reminder', 'goal', 'habit', 'learning', 'book', 'research', 'notes'];
      const academicTerms = ['study', 'research', 'paper', 'analysis', 'theory', 'method', 'data', 'experiment', 'conclusion'];
      
      [...techTerms, ...businessTerms, ...personalTerms, ...academicTerms].forEach(term => {
        if (textContent.includes(term)) {
          allTags.push(term);
        }
      });
      
      const words = textContent.split(/\s+/).filter(word => word.length > 3);
      const wordFreq: { [key: string]: number } = {};
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        if (cleanWord.length > 3) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });
      
      const frequentWords = Object.entries(wordFreq)
        .filter(([word, freq]) => freq > 1 && !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said'].includes(word))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([word]) => word);
      
      allTags.push(...frequentWords);
      
      if (allTags.length === 0) {
        if (textContent.includes('todo') || textContent.includes('task')) allTags.push('tasks');
        if (textContent.includes('meeting') || textContent.includes('call')) allTags.push('meetings');
        if (textContent.includes('idea') || textContent.includes('thought')) allTags.push('ideas');
        if (textContent.includes('plan') || textContent.includes('goal')) allTags.push('planning');
        if (textContent.includes('learn') || textContent.includes('study')) allTags.push('learning');
      }
      
      return Array.from(new Set(allTags)).slice(0, 5);
    }
  
    async checkGrammar(content: string): Promise<string[]> {
      await this.delay(1000);
      
      const textContent = this.extractTextContent(content);
      const issues: string[] = [];
      
      if (textContent.length < 10) {
        return [];
      }
      
      if (/\bi\b(?!\s+am|'m)/gi.test(textContent)) {
        issues.push("Consider capitalizing 'I' when used as a pronoun");
      }
      
      if (/\b(there|their|they're)\b/gi.test(textContent)) {
        const matches = textContent.match(/\b(there|their|they're)\b/gi) || [];
        if (matches.length > 1) {
          issues.push("Double-check usage of 'there', 'their', and 'they're'");
        }
      }
      
      if (/\b(your|you're)\b/gi.test(textContent)) {
        const matches = textContent.match(/\b(your|you're)\b/gi) || [];
        if (matches.length > 1) {
          issues.push("Verify correct usage of 'your' vs 'you're'");
        }
      }
      
      if (/[.!?]\s*[a-z]/.test(textContent)) {
        issues.push("Some sentences may not start with a capital letter");
      }
      
      if (/\w{50,}/.test(textContent)) {
        issues.push("Some sentences are quite long - consider breaking them up");
      }
      
      textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const repeatedWords = textContent.toLowerCase().match(/\b(\w+)\s+\1\b/g);
      if (repeatedWords && repeatedWords.length > 0) {
        issues.push("Found repeated words - check for unnecessary duplicates");
      }
      
      if (issues.length === 0 && Math.random() > 0.7) {
        issues.push("Great job! Your writing looks clean and well-structured.");
      }
      
      return issues.slice(0, 3);
    }
  
    async generateGlossary(content: string): Promise<{ [key: string]: string }> {
      await this.delay(800);
      
      const textContent = this.extractTextContent(content).toLowerCase();
      const glossary: { [key: string]: string } = {};
      
      const technicalTerms = {
        'api': 'Application Programming Interface - a set of protocols for building software applications',
        'database': 'A structured collection of data stored and accessed electronically',
        'frontend': 'The client-side part of a web application that users interact with directly',
        'backend': 'The server-side part of a web application that handles data and logic',
        'javascript': 'A programming language commonly used for web development',
        'react': 'A JavaScript library for building user interfaces',
        'nodejs': 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        'html': 'HyperText Markup Language - the standard markup language for web pages',
        'css': 'Cascading Style Sheets - used for styling web documents',
        'algorithm': 'A step-by-step procedure for solving a problem or completing a task',
        'framework': 'A pre-written code structure that provides a foundation for applications',
        'library': 'A collection of pre-written code that developers can use to optimize tasks'
      };
      
      const businessTerms = {
        'roi': 'Return on Investment - a measure of the efficiency of an investment',
        'kpi': 'Key Performance Indicator - a measurable value that demonstrates effectiveness',
        'strategy': 'A plan of action designed to achieve a long-term goal',
        'stakeholder': 'A person with an interest or concern in something',
        'milestone': 'A significant stage or event in the development of something',
        'deliverable': 'A tangible or intangible good or service produced as a result of a project',
        'agile': 'A project management methodology emphasizing iterative development',
        'scrum': 'An agile framework for managing product development'
      };
      
      const academicTerms = {
        'hypothesis': 'A proposed explanation for a phenomenon, made as a starting point for investigation',
        'methodology': 'A system of methods used in a particular area of study or activity',
        'analysis': 'Detailed examination of the elements or structure of something',
        'synthesis': 'The combination of ideas to form a theory or system',
        'paradigm': 'A typical example or pattern of something; a model',
        'empirical': 'Based on, concerned with, or verifiable by observation or experience',
        'theoretical': 'Concerned with or involving the theory of a subject rather than its practical application'
      };
      
      const allTerms = { ...technicalTerms, ...businessTerms, ...academicTerms };
      
      Object.entries(allTerms).forEach(([term, definition]) => {
        if (textContent.includes(term)) {
          glossary[term.charAt(0).toUpperCase() + term.slice(1)] = definition;
        }
      });
      
      const words = textContent.split(/\s+/);
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (cleanWord.length > 7 && !glossary[cleanWord]) {
          if (['information', 'development', 'implementation', 'organization', 'management'].includes(cleanWord)) {
            const definitions = {
              'information': 'Facts provided or learned about something or someone',
              'development': 'The process of developing or being developed',
              'implementation': 'The process of putting a decision or plan into effect',
              'organization': 'An organized group of people with a particular purpose',
              'management': 'The process of dealing with or controlling things or people'
            };
            if (cleanWord in definitions) {
              glossary[cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)] = definitions[cleanWord as keyof typeof definitions];
            }
          }
        }
      });
      
      return glossary;
    }
  }
  
  export const aiService = new MockAIService();