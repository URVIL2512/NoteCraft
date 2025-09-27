import requests
import json

# Test the share endpoint
url = "http://localhost:5173/api/notes/share"
data = {
    "noteId": "test123",
    "title": "Test Note",
    "content": "This is a test note for sharing",
    "tags": ["test", "sharing"]
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
