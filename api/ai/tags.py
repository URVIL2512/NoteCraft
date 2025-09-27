from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

# Configure Google AI
api_key = os.getenv('GOOGLE_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

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
            
            text = data.get('text', '')
            if not text:
                self.send_error_response('Text is required', 400)
                return
            
            if not model:
                self.send_error_response('AI service not configured', 501)
                return
            
            max_tags = data.get('max', 10)
            prompt = f"Suggest up to {max_tags} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n{text}"
            response = model.generate_content(prompt)
            tags = [tag.strip() for tag in response.text.split(',') if tag.strip()]
            
            response_data = {'tags': tags}
            self.send_success_response(response_data)
            
        except Exception as e:
            print(f"Error in tags endpoint: {e}")
            self.send_error_response('Failed to suggest tags', 500)
    
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