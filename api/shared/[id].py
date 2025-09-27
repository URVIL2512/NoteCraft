import json
import os

# In-memory storage (same as in share.py)
shared_notes = {}

def handler(request):
    # Handle CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if request.method == 'OPTIONS':
        return ('', 200, headers)
    
    if request.method == 'GET':
        try:
            # Get share ID from URL path
            share_id = request.path.split('/')[-1]
            
            if share_id not in shared_notes:
                return (json.dumps({'error': 'Shared note not found'}), 404, headers)
            
            return (json.dumps({
                'note': shared_notes[share_id],
                'success': True
            }), 200, headers)
        except Exception as e:
            return (json.dumps({'error': 'Failed to get shared note'}), 500, headers)
    
    return (json.dumps({'error': 'Method not allowed'}), 405, headers)
