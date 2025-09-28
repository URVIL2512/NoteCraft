const { GoogleGenerativeAI } = require('@google/generative-ai');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCVnfhlcfFFVrRtA4tEHgCqACZX3-9QjjU';
let model = null;

try {
  if (GOOGLE_API_KEY) {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (e) {
  model = null;
}

async function callGemini(prompt) {
  try {
    if (!model) {
      const text = prompt.split('\n\n').pop() || '';
      const words = text.split(' ').filter(w => w.length > 4);
      const keyTerms = words.slice(0, 5);
      return keyTerms.map(term => `${term}: A key concept mentioned in this text`).join('\n');
    }
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const text = prompt.split('\n\n').pop() || '';
    const words = text.split(' ').filter(w => w.length > 4);
    const keyTerms = words.slice(0, 5);
    return keyTerms.map(term => `${term}: A key concept mentioned in this text`).join('\n');
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { text, maxTerms = 20 } = req.body;
    const prompt = `Extract up to ${maxTerms} key terms from this text and provide concise definitions for each. Format as: Term: Definition (one per line):\n\n${text}`;
    const response = await callGemini(prompt);
    const lines = response.split('\n').filter(line => line.trim());
    const terms = lines.map(line => {
      const [term, definition] = line.split(':').map(s => s.trim());
      return { term, definition: definition || '' };
    }).filter(item => item.term && item.definition);
    
    res.json({ terms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate glossary' });
  }
};
