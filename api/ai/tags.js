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
      const words = text.toLowerCase().split(' ').filter(w => w.length > 3);
      const commonTags = ['notes', 'writing', 'important', 'personal', 'work', 'ideas', 'reminder', 'tasks'];
      const textTags = [...new Set(words.slice(0, 5))];
      return [...textTags, ...commonTags].slice(0, 8).join(', ');
    }
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const text = prompt.split('\n\n').pop() || '';
    const words = text.toLowerCase().split(' ').filter(w => w.length > 3);
    const commonTags = ['notes', 'writing', 'important', 'personal', 'work', 'ideas', 'reminder', 'tasks'];
    const textTags = [...new Set(words.slice(0, 5))];
    return [...textTags, ...commonTags].slice(0, 8).join(', ');
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
    const { text, max = 10 } = req.body;
    const prompt = `Suggest up to ${max} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n${text}`;
    const response = await callGemini(prompt);
    const tags = response.split(',').map(tag => tag.trim()).filter(Boolean);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tags' });
  }
};
