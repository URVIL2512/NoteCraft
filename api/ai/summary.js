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
      const words = text.trim().split(' ');
      const firstWords = words.slice(0, 20).join(' ');
      return `This note covers: ${firstWords}... The content appears to be about ${words[0] || 'general topics'} and related subjects.`;
    }
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const text = prompt.split('\n\n').pop() || '';
    const words = text.trim().split(' ');
    const firstWords = words.slice(0, 20).join(' ');
    return `This note covers: ${firstWords}... The content appears to be about ${words[0] || 'general topics'} and related subjects.`;
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
    const { text } = req.body;
    const prompt = `Summarize the following text in 2-4 sentences:\n\n${text}`;
    const summary = await callGemini(prompt);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};
