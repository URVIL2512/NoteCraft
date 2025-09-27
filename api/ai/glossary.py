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
        max_terms = data.get('maxTerms', 20)
        
        prompt = f"Extract up to {max_terms} key terms and concise definitions from this text. Format as: Term: Definition (one per line):\n\n{text}"
        response = model.generate_content(prompt)
        lines = [line.strip() for line in response.text.split('\n') if line.strip()]
        terms = []
        for line in lines:
            parts = line.split(':', 1)
            if len(parts) == 2:
                term = parts[0].strip()
                definition = parts[1].strip()
                if term and definition:
                    terms.append({'term': term, 'definition': definition})
        
        return (json.dumps({'terms': terms}), 200, headers)
    except Exception as e:
        return (json.dumps({'error': 'Failed to generate glossary'}), 500, headers)
