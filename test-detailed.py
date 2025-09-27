import requests
import json

# Test the backend API with detailed error handling
try:
    print("Testing AI Summary...")
    response = requests.post(
        'http://localhost:5173/api/ai/summary',
        headers={'Content-Type': 'application/json'},
        json={'text': 'This is a test note about climate change and global warming.'},
        timeout=10
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Summary: {data.get('summary', 'No summary')}")
    else:
        print(f"Error: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("Error: Cannot connect to backend server")
except requests.exceptions.Timeout:
    print("Error: Request timed out")
except Exception as e:
    print(f"Error: {e}")
