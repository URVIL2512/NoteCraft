# Deploy NoteCraft to Vercel

This guide shows you how to deploy your NoteCraft application to Vercel using serverless functions.

## 🎯 **Deployment Strategy**

Deploy both frontend and backend to Vercel:
- **Frontend**: React app served as static files
- **Backend**: Python Flask converted to Vercel serverless functions

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Google AI API Key**: Get from [Google AI Studio](https://aistudio.google.com/)

## 🚀 **Step 1: Convert Backend to Serverless Functions**

### Create API Directory Structure
```bash
mkdir api
mkdir api/ai
mkdir api/notes
```

### Convert Flask Routes to Vercel Functions

Create these files in your project root:

#### `api/ai/summary.py`
```python
from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

# Configure Google AI
api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def handler(request):
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    data = request.get_json()
    text = data.get('text', '')
    
    try:
        prompt = f"Summarize the following text in 2-4 sentences:\n\n{text}"
        summary = model.generate_content(prompt)
        return jsonify({'summary': summary.text})
    except Exception as e:
        return jsonify({'error': 'Failed to generate summary'}), 500
```

#### `api/ai/tags.py`
```python
from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def handler(request):
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    data = request.get_json()
    text = data.get('text', '')
    max_tags = data.get('max', 10)
    
    try:
        prompt = f"Suggest up to {max_tags} relevant tags (keywords) for this text. Return only the tags separated by commas:\n\n{text}"
        response = model.generate_content(prompt)
        tags = [tag.strip() for tag in response.text.split(',') if tag.strip()]
        return jsonify({'tags': tags})
    except Exception as e:
        return jsonify({'error': 'Failed to suggest tags'}), 500
```

#### `api/ai/grammar.py`
```python
from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def handler(request):
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    data = request.get_json()
    text = data.get('text', '')
    
    try:
        prompt = f"Check the grammar and spelling of the following text and provide the corrected version. If no changes are needed, return the original text:\n\n{text}"
        corrected_text = model.generate_content(prompt)
        return jsonify({'corrected': corrected_text.text})
    except Exception as e:
        return jsonify({'error': 'Failed to check grammar'}), 500
```

#### `api/ai/glossary.py`
```python
from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def handler(request):
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    data = request.get_json()
    text = data.get('text', '')
    max_terms = data.get('maxTerms', 20)
    
    try:
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
        return jsonify({'terms': terms})
    except Exception as e:
        return jsonify({'error': 'Failed to generate glossary'}), 500
```

#### `api/notes/share.py`
```python
from flask import Flask, request, jsonify
import uuid
from datetime import datetime
import os

app = Flask(__name__)

# In-memory storage (use database in production)
shared_notes = {}

def handler(request):
    if request.method == 'POST':
        # Create shareable link
        data = request.get_json()
        note_id = data.get('noteId')
        title = data.get('title', 'Untitled Note')
        content = data.get('content', '')
        tags = data.get('tags', [])
        
        share_id = str(uuid.uuid4())[:8]
        shared_notes[share_id] = {
            'id': note_id,
            'title': title,
            'content': content,
            'tags': tags,
            'sharedAt': datetime.now().isoformat(),
            'shareId': share_id
        }
        
        base_url = request.host_url.rstrip('/')
        share_url = f"{base_url}/shared/{share_id}"
        
        return jsonify({
            'shareId': share_id,
            'shareUrl': share_url,
            'success': True
        })
    
    elif request.method == 'GET':
        # Get shared note
        share_id = request.args.get('id')
        if share_id not in shared_notes:
            return jsonify({'error': 'Shared note not found'}), 404
        
        return jsonify({
            'note': shared_notes[share_id],
            'success': True
        })
    
    return jsonify({'error': 'Method not allowed'}), 405
```

## 🎨 **Step 2: Update Vercel Configuration**

Update your `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

## ⚙️ **Step 3: Set Environment Variables**

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   GOOGLE_API_KEY = your_google_api_key_here
   ```

## 🚀 **Step 4: Deploy to Vercel**

### Method 1: Using Vercel CLI
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

### Method 2: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`

## ✅ **Step 5: Test Your Deployment**

1. **Frontend**: Visit your Vercel URL
2. **API Endpoints**: Test AI features
3. **Sharing**: Test note sharing functionality

## 🎉 **Benefits of Vercel Deployment**

- ✅ **Single Platform**: Everything in one place
- ✅ **Serverless**: Automatic scaling
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Preview Deployments**: Every PR gets a preview URL
- ✅ **Zero Configuration**: Works out of the box

## 🆘 **Troubleshooting**

### Common Issues:

1. **Build Fails**: Check your `package.json` scripts
2. **API Calls Fail**: Verify `GOOGLE_API_KEY` environment variable
3. **CORS Errors**: Ensure proper headers in API functions
4. **Environment Variables**: Make sure they're set in Vercel dashboard

### Debug Steps:
1. Check Vercel build logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

**Your NoteCraft app will be live at: `https://your-project.vercel.app`** 🚀