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
      return text;
    }
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const text = prompt.split('\n\n').pop() || '';
    return text;
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
    const prompt = `Check the grammar and spelling of the following text and provide the corrected version:\n\n${text}`;
    const corrected = await callGemini(prompt);
    res.json({ corrected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check grammar' });
  }
};
