import requests
import json

# Test all AI features
base_url = 'http://localhost:5173/api/ai'
test_text = "Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities such as burning fossil fuels, deforestation, and industrial processes."

print("🧪 Testing All AI Features...")
print("=" * 50)

# Test Summary
try:
    print("📝 Testing Summary Generation...")
    response = requests.post(f'{base_url}/summary', json={'text': test_text})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Summary: {data.get('summary', 'No summary')}")
    else:
        print(f"❌ Summary failed: {response.text}")
except Exception as e:
    print(f"❌ Summary error: {e}")

print()

# Test Tags
try:
    print("🏷️ Testing Tag Suggestions...")
    response = requests.post(f'{base_url}/tags', json={'text': test_text, 'max': 5})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Tags: {data.get('tags', [])}")
    else:
        print(f"❌ Tags failed: {response.text}")
except Exception as e:
    print(f"❌ Tags error: {e}")

print()

# Test Grammar
try:
    print("✅ Testing Grammar Check...")
    response = requests.post(f'{base_url}/grammar', json={'text': test_text})
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Grammar: {data.get('corrected', 'No correction')[:100]}...")
    else:
        print(f"❌ Grammar failed: {response.text}")
except Exception as e:
    print(f"❌ Grammar error: {e}")

print()

# Test Glossary
try:
    print("📚 Testing Auto Glossary...")
    response = requests.post(f'{base_url}/glossary', json={'text': test_text, 'maxTerms': 3})
    if response.status_code == 200:
        data = response.json()
        terms = data.get('terms', [])
        print(f"✅ Glossary: {len(terms)} terms found")
        for term in terms[:2]:  # Show first 2 terms
            print(f"   - {term.get('term', '')}: {term.get('definition', '')[:50]}...")
    else:
        print(f"❌ Glossary failed: {response.text}")
except Exception as e:
    print(f"❌ Glossary error: {e}")

print()
print("🎉 All tests completed!")
