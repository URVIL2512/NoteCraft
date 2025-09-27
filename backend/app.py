from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import uuid
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage for shared notes (in production, use a database)
shared_notes = {}

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

@app.route('/api/notes/share', methods=['POST'])
def share_note():
    try:
        print("Share endpoint called")
        data = request.get_json()
        print(f"Received data: {data}")
        
        note_id = data.get('noteId')
        title = data.get('title', 'Untitled Note')
        content = data.get('content', '')
        tags = data.get('tags', [])
        
        # Generate unique share ID
        share_id = str(uuid.uuid4())[:8]  # Short ID for URL
        
        # Store shared note
        shared_notes[share_id] = {
            'id': note_id,
            'title': title,
            'content': content,
            'tags': tags,
            'sharedAt': datetime.now().isoformat(),
            'shareId': share_id
        }
        
        # Generate share URL
        base_url = request.host_url.rstrip('/')
        share_url = f"{base_url}/shared/{share_id}"
        
        print(f"Generated share URL: {share_url}")
        
        return jsonify({
            'shareId': share_id,
            'shareUrl': share_url,
            'success': True
        })
    except Exception as e:
        print(f"Error in share_note: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/shared/<share_id>', methods=['GET'])
def get_shared_note(share_id):
    if share_id not in shared_notes:
        return jsonify({'error': 'Shared note not found'}), 404
    
    note = shared_notes[share_id]
    return jsonify({
        'note': note,
        'success': True
    })

@app.route('/shared/<share_id>')
def view_shared_note(share_id):
    # This will serve the shared note page
    return f'''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shared Note - NoteCraft</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div id="loading" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Loading shared note...</p>
                </div>
                <div id="note-content" class="hidden">
                    <h1 id="note-title" class="text-2xl font-bold mb-4"></h1>
                    <div id="note-tags" class="mb-4"></div>
                    <div id="note-body" class="prose max-w-none"></div>
                    <div class="mt-6 pt-4 border-t">
                        <p class="text-sm text-gray-500">Shared via NoteCraft</p>
                    </div>
                </div>
                <div id="error" class="hidden text-center py-8">
                    <p class="text-red-600">Note not found or has been removed.</p>
                </div>
            </div>
        </div>
        
        <script>
            async function loadSharedNote() {{
                try {{
                    const response = await fetch('/api/notes/shared/{share_id}');
                    const data = await response.json();
                    
                    if (data.success) {{
                        const note = data.note;
                        document.getElementById('note-title').textContent = note.title;
                        document.getElementById('note-body').innerHTML = note.content.replace(/\\n/g, '<br>');
                        
                        if (note.tags && note.tags.length > 0) {{
                            const tagsHtml = note.tags.map(tag => 
                                `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">${{tag}}</span>`
                            ).join('');
                            document.getElementById('note-tags').innerHTML = tagsHtml;
                        }}
                        
                        document.getElementById('loading').classList.add('hidden');
                        document.getElementById('note-content').classList.remove('hidden');
                    }} else {{
                        throw new Error(data.error);
                    }}
                }} catch (error) {{
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('error').classList.remove('hidden');
                }}
            }}
            
            loadSharedNote();
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5173))
    print(f'Backend server running on port {port}')
    print('Using Google Cloud service account authentication')
    app.run(host='0.0.0.0', port=port, debug=False)
