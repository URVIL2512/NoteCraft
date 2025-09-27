from flask import Flask, request, jsonify
import uuid
from datetime import datetime
import os

app = Flask(__name__)

# In-memory storage (use database in production)
shared_notes = {}

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
        
        note_id = data.get('noteId')
        title = data.get('title', 'Untitled Note')
        content = data.get('content', '')
        tags = data.get('tags', [])
        
        share_id = str(uuid.uuid4())[:8]
        shared_notes[share_id] = {
            'id': note_id,
            'title': title,
            'content': content,
            'tags': tags,
            'sharedAt': datetime.now().isoformat(),
            'shareId': share_id
        }
        
        # Get the base URL from the request
        base_url = request.host_url.rstrip('/')
        share_url = f"{base_url}/shared/{share_id}"
        
        return jsonify({
            'shareId': share_id,
            'shareUrl': share_url,
            'url': share_url,  # For compatibility with frontend
            'success': True
        }), 200, {
            'Access-Control-Allow-Origin': '*'
        }
    except Exception as e:
        print(f"Error in share endpoint: {e}")
        return jsonify({'error': 'Failed to create share link'}), 500, {
            'Access-Control-Allow-Origin': '*'
        }