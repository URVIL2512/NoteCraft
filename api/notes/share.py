import json
import uuid
from datetime import datetime
import os

# In-memory storage (use database in production)
shared_notes = {}

def handler(request):
    # Handle CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if request.method == 'OPTIONS':
        return ('', 200, headers)
    
    if request.method == 'POST':
        # Create shareable link
        try:
            data = request.get_json()
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
            base_url = request.url_root.rstrip('/')
            share_url = f"{base_url}/shared/{share_id}"
            
            return (json.dumps({
                'shareId': share_id,
                'shareUrl': share_url,
                'success': True
            }), 200, headers)
        except Exception as e:
            return (json.dumps({'error': 'Failed to create share link'}), 500, headers)
    
    elif request.method == 'GET':
        # Get shared note
        try:
            share_id = request.args.get('id')
            if share_id not in shared_notes:
                return (json.dumps({'error': 'Shared note not found'}), 404, headers)
            
            return (json.dumps({
                'note': shared_notes[share_id],
                'success': True
            }), 200, headers)
        except Exception as e:
            return (json.dumps({'error': 'Failed to get shared note'}), 500, headers)
    
    return (json.dumps({'error': 'Method not allowed'}), 405, headers)
