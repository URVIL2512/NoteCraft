from flask import Flask, request, jsonify
import os
import google.generativeai as genai

app = Flask(__name__)

# Configure Google AI
api_key = os.getenv('GOOGLE_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

def handler(request):
    if request.method == 'OPTIONS':
        return ('', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
    
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No content provided'}), 400
        
        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if not model:
            return jsonify({'error': 'AI service not configured'}), 501
        
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
        
        return jsonify({'terms': terms}), 200, {
            'Access-Control-Allow-Origin': '*'
        }
    except Exception as e:
        print(f"Error in glossary endpoint: {e}")
        return jsonify({'error': 'Failed to generate glossary'}), 500, {
            'Access-Control-Allow-Origin': '*'
        }