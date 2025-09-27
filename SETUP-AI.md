# AI Features Setup Guide

## The Issue
The AI features are failing because we need a Google AI API key.

## Quick Fix

### Step 1: Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the API key

### Step 2: Set the API Key
```bash
set GOOGLE_API_KEY=your-actual-api-key-here
```

### Step 3: Restart Backend
```bash
cd backend
python app.py
```

## Alternative: Use Node.js Backend (Easier)

If you prefer, we can use the Node.js backend instead:

```bash
cd backend
set GOOGLE_API_KEY=your-actual-api-key-here
npm run dev
```

## Test
After setting the API key, the AI features should work:
- Summary Generation
- Tag Suggestions
- Grammar Check
- Auto Glossary

The error "Failed to generate summary" will be fixed once you set the correct API key.
