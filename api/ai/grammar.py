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
        
        prompt = f"Check the grammar and spelling of the following text and provide the corrected version. If no changes are needed, return the original text:\n\n{text}"
        corrected_text = model.generate_content(prompt)
        
        return (json.dumps({'corrected': corrected_text.text}), 200, headers)
    except Exception as e:
        return (json.dumps({'error': 'Failed to check grammar'}), 500, headers)
