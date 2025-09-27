from http.server import BaseHTTPRequestHandler
import json
import os

# Import shared_notes from the share endpoint
# In production, this should be a proper database
shared_notes = {}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        try:
            # Extract share_id from the path
            path_parts = self.path.split('/')
            share_id = path_parts[-1] if path_parts else ''
            
            if not share_id or share_id not in shared_notes:
                self.send_error_response('Shared note not found', 404)
                return
            
            note = shared_notes[share_id]
            
            html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{note['title']} - NoteCraft</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold mb-4">{note['title']}</h1>
            <div class="prose max-w-none">
                {note['content'].replace(chr(10), '<br>')}
            </div>
            <div class="mt-6 pt-4 border-t">
                <p class="text-sm text-gray-500">Shared via NoteCraft</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
            
        except Exception as e:
            print(f"Error in shared note endpoint: {e}")
            self.send_error_response('Failed to load shared note', 500)
    
    def send_error_response(self, message, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))