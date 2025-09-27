from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Import shared_notes from the share endpoint
# In production, this should be a proper database
shared_notes = {}

def handler(request):
    if request.method == 'OPTIONS':
        return ('', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
    
    if request.method != 'GET':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        # Extract share_id from the path
        path_parts = request.path.split('/')
        share_id = path_parts[-1] if path_parts else ''
        
        if not share_id or share_id not in shared_notes:
            return jsonify({'error': 'Shared note not found'}), 404, {
                'Access-Control-Allow-Origin': '*'
            }
        
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
        
        return html_content, 200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        }
    except Exception as e:
        print(f"Error in shared note endpoint: {e}")
        return jsonify({'error': 'Failed to load shared note'}), 500, {
            'Access-Control-Allow-Origin': '*'
        }