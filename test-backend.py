import requests
import json

# Test the backend API
try:
    response = requests.post(
        'http://localhost:5173/api/ai/summary',
        headers={'Content-Type': 'application/json'},
        json={'text': 'This is a test note about climate change and global warming.'}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
