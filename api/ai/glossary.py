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
            
            max_terms = data.get('maxTerms', 20)
            prompt = f"Extract up to {max_terms} key terms and concise definitions from this text. Format as: Term: Definition (one per line):\n\n{text}"
            response = model.generate_content(prompt)
            lines = [line.strip() for line in response.text.split('\n') if line.strip()]
            terms = []
            for line in lines:
                parts = line.split(':', 1)
                if len(parts) == 2:
                    term = parts[0].strip()
                    definition = parts[1].strip()
                    if term and definition:
                        terms.append({'term': term, 'definition': definition})
            
            response_data = {'terms': terms}
            self.send_success_response(response_data)
            
        except Exception as e:
            print(f"Error in glossary endpoint: {e}")
            self.send_error_response('Failed to generate glossary', 500)
    
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