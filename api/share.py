from http.server import BaseHTTPRequestHandler
import json
import uuid
from datetime import datetime

shared_notes = {}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No content provided'}).encode())
                return
                
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            title = data.get('title', 'Untitled Note')
            content = data.get('content', '')
            
            if not content:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Content is required'}).encode())
                return
            
            share_id = str(uuid.uuid4())[:8]
            
            note_data = {
                'title': title,
                'content': content,
                'sharedAt': datetime.now().isoformat(),
                'shareId': share_id
            }
            
            shared_notes[share_id] = note_data
            
            host = self.headers.get('Host', 'localhost:3000')
            share_url = f"https://{host}/shared/{share_id}"
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'shareId': share_id,
                'url': share_url,
                'success': True
            }).encode())
        except Exception as e:
            print(f"Error in share endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Failed to create share link'}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()