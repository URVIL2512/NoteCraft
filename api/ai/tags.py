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
        max_tags = data.get('max', 10)
        
        prompt = f"Suggest up to {max_tags} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n{text}"
        response = model.generate_content(prompt)
        tags = [tag.strip() for tag in response.text.split(',') if tag.strip()]
        
        return (json.dumps({'tags': tags}), 200, headers)
    except Exception as e:
        return (json.dumps({'error': 'Failed to suggest tags'}), 500, headers)
