from http.server import BaseHTTPRequestHandler
import json
import uuid
from datetime import datetime
import os

# In-memory storage (use database in production)
shared_notes = {}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
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
            
            # Get the base URL from the request headers
            host = self.headers.get('Host', 'localhost:3000')
            protocol = 'https' if host != 'localhost:3000' else 'http'
            base_url = f"{protocol}://{host}"
            share_url = f"{base_url}/shared/{share_id}"
            
            response_data = {
                'shareId': share_id,
                'shareUrl': share_url,
                'url': share_url,  # For compatibility with frontend
                'success': True
            }
            self.send_success_response(response_data)
            
        except Exception as e:
            print(f"Error in share endpoint: {e}")
            self.send_error_response('Failed to create share link', 500)
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, message, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))