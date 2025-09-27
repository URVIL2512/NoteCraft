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
        
        prompt = f"Check the grammar and spelling of the following text and provide the corrected version. If no changes are needed, return the original text:\n\n{text}"
        corrected_text = model.generate_content(prompt)
        
        return jsonify({'corrected': corrected_text.text}), 200, {
            'Access-Control-Allow-Origin': '*'
        }
    except Exception as e:
        print(f"Error in grammar endpoint: {e}")
        return jsonify({'error': 'Failed to check grammar'}), 500, {
            'Access-Control-Allow-Origin': '*'
        }