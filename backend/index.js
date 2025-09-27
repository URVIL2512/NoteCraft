const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const app = express()
app.use(cors())
app.use(express.json())


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDummyKeyForServiceAccount')
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

async function callGemini(prompt) {
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    return 'AI service temporarily unavailable'
  }
}

app.post('/api/ai/summary', async (req, res) => {
  const text = req.body.text || ''
  const prompt = `Summarize the following text in 2-4 sentences:\n\n${text}`
  
  try {
    const summary = await callGemini(prompt)
    res.json({ summary })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

app.post('/api/ai/tags', async (req, res) => {
  const text = req.body.text || ''
  const maxTags = req.body.max || 10
  const prompt = `Suggest up to ${maxTags} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n${text}`
  
  try {
    const response = await callGemini(prompt)
    const tags = response.split(',').map(tag => tag.trim()).filter(Boolean)
    res.json({ tags })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tags' })
  }
})

app.post('/api/ai/grammar', async (req, res) => {
  const text = req.body.text || ''
  const prompt = `Check the grammar and spelling of the following text and provide the corrected version:\n\n${text}`
  
  try {
    const corrected = await callGemini(prompt)
    res.json({ corrected })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check grammar' })
  }
})

app.post('/api/ai/glossary', async (req, res) => {
  const text = req.body.text || ''
  const maxTerms = req.body.maxTerms || 20
  const prompt = `Extract up to ${maxTerms} key terms from this text and provide concise definitions for each. Format as: Term: Definition (one per line):\n\n${text}`
  
  try {
    const response = await callGemini(prompt)
    const lines = response.split('\n').filter(line => line.trim())
    const terms = lines.map(line => {
      const [term, definition] = line.split(':').map(s => s.trim())
      return { term, definition: definition || '' }
    }).filter(item => item.term && item.definition)
    
    res.json({ terms })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate glossary' })
  }
})

app.listen(5173, () => {
  console.log('Backend server running on port 5173')
})
