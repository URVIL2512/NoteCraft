const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleAI() {
  try {
    const apiKey = 'AIzaSyCVnfhlcfFFVrRtA4tEHgCqACZX3-9QjjU';
    console.log('API Key:', apiKey.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Testing Google AI...');
    const result = await model.generateContent("Hello, how are you?");
    const response = await result.response;
    const text = response.text();
    
    console.log('Google AI Response:', text);
  } catch (error) {
    console.error('Google AI Error:', error.message);
    console.error('Full error:', error);
  }
}

testGoogleAI();
