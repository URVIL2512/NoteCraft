import json
import os
import google.generativeai as genai

# Configure Google AI
api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def handler(request):
    # Handle CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if request.method == 'OPTIONS':
        return ('', 200, headers)
    
    if request.method != 'POST':
        return (json.dumps({'error': 'Method not allowed'}), 405, headers)
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        prompt = f"Summarize the following text in 2-4 sentences:\n\n{text}"
        summary = model.generate_content(prompt)
        
        return (json.dumps({'summary': summary.text}), 200, headers)
    except Exception as e:
        return (json.dumps({'error': 'Failed to generate summary'}), 500, headers)
