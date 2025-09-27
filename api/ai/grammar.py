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
            
            prompt = f"Check the grammar and spelling of the following text and provide ONLY the corrected version without any explanations or additional text:\n\n{text}"
            corrected_text = model.generate_content(prompt)
            
            # Clean up any extra text that might come from the AI response
            import re
            corrected = corrected_text.text
            corrected = re.sub(r'^(Here\'s the corrected version:|Corrected text:|Fixed version:)\s*', '', corrected, flags=re.IGNORECASE)
            corrected = re.sub(r'^\*\*.*?\*\*:\s*', '', corrected)  # Remove **text**: patterns
            corrected = re.sub(r'^Original Text:\s*', '', corrected, flags=re.IGNORECASE)
            corrected = re.sub(r'^Corrected Text:\s*', '', corrected, flags=re.IGNORECASE)
            corrected = corrected.strip()
            
            response_data = {'corrected': corrected or text}
            self.send_success_response(response_data)
            
        except Exception as e:
            print(f"Error in grammar endpoint: {e}")
            self.send_error_response('Failed to check grammar', 500)
    
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