from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

api_key = os.getenv('GOOGLE_API_KEY', 'AIzaSyCVnfhlcfFFVrRtA4tEHgCqACZX3-9QjjU')
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')

def call_gemini(prompt):
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as error:
        print(f'Gemini API error: {error}')
        return 'AI service temporarily unavailable'

@app.route('/api/ai/summary', methods=['POST'])
def generate_summary():
    data = request.get_json()
    text = data.get('text', '')
    prompt = f"Summarize the following text in 2-4 sentences:\n\n{text}"
    
    try:
        summary = call_gemini(prompt)
        return jsonify({'summary': summary})
    except Exception as error:
        return jsonify({'error': 'Failed to generate summary'}), 500

@app.route('/api/ai/tags', methods=['POST'])
def generate_tags():
    data = request.get_json()
    text = data.get('text', '')
    max_tags = data.get('max', 10)
    prompt = f"Suggest up to {max_tags} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n{text}"
    
    try:
        response = call_gemini(prompt)
        tags = [tag.strip() for tag in response.split(',') if tag.strip()]
        return jsonify({'tags': tags})
    except Exception as error:
        return jsonify({'error': 'Failed to generate tags'}), 500

@app.route('/api/ai/grammar', methods=['POST'])
def check_grammar():
    data = request.get_json()
    text = data.get('text', '')
    prompt = f"Check the grammar and spelling of the following text and provide the corrected version:\n\n{text}"
    
    try:
        corrected = call_gemini(prompt)
        return jsonify({'corrected': corrected})
    except Exception as error:
        return jsonify({'error': 'Failed to check grammar'}), 500

@app.route('/api/ai/glossary', methods=['POST'])
def generate_glossary():
    data = request.get_json()
    text = data.get('text', '')
    max_terms = data.get('maxTerms', 20)
    prompt = f"Extract up to {max_terms} key terms from this text and provide concise definitions for each. Format as: Term: Definition (one per line):\n\n{text}"
    
    try:
        response = call_gemini(prompt)
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        terms = []
        for line in lines:
            if ':' in line:
                term, definition = line.split(':', 1)
                terms.append({
                    'term': term.strip(),
                    'definition': definition.strip()
                })
        return jsonify({'terms': terms})
    except Exception as error:
        return jsonify({'error': 'Failed to generate glossary'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5173))
    print(f'Backend server running on port {port}')
    print('Using Google Cloud service account authentication')
    app.run(host='0.0.0.0', port=port, debug=False)
