import google.generativeai as genai

# Configure with your API key
api_key = 'AIzaSyCVnfhlcfFFVrRtA4tEHgCqACZX3-9QjjU'
genai.configure(api_key=api_key)

# List available models
try:
    models = genai.list_models()
    print("Available models:")
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"- {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
