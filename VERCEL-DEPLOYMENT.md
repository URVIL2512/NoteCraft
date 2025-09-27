# Vercel Deployment Guide for NoteCraft

This guide will help you deploy NoteCraft to Vercel using their web interface.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
- Ensure all files are committed and pushed to your GitHub repository
- The project is already configured for Vercel deployment

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your NoteCraft repository
4. Vercel will automatically detect the configuration

### 3. Environment Variables
You need to set up the following environment variable in Vercel:

**Required Environment Variable:**
- `GOOGLE_API_KEY` - Your Google Generative AI API key

**How to set environment variables in Vercel:**
1. In your Vercel project dashboard, go to "Settings"
2. Click on "Environment Variables"
3. Add the following:
   - **Name:** `GOOGLE_API_KEY`
   - **Value:** Your Google API key (starts with `AIza...`)
   - **Environment:** Production, Preview, Development (select all)

### 4. Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at your Vercel URL

## 📁 Project Structure for Vercel

```
notecraft/
├── api/                    # Serverless functions
│   ├── ai/
│   │   ├── summary.py     # AI summary endpoint
│   │   ├── grammar.py     # AI grammar check endpoint
│   │   ├── tags.py        # AI tags endpoint
│   │   └── glossary.py    # AI glossary endpoint
│   ├── notes/
│   │   └── share.py       # Note sharing endpoint
│   ├── shared/
│   │   └── [id].py        # Shared note viewer
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   ├── dist/             # Built frontend (generated)
│   ├── package.json
│   └── vite.config.ts
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## 🔧 Configuration Files

### vercel.json
The project includes a `vercel.json` file that configures:
- Build settings for frontend and API
- Routing rules for API endpoints
- Environment variable references

### API Endpoints
All API endpoints are configured as serverless functions:
- `/api/ai/summary` - Generate AI summaries
- `/api/ai/grammar` - Check grammar and spelling
- `/api/ai/tags` - Generate AI tags
- `/api/ai/glossary` - Generate AI glossary
- `/api/notes/share` - Share notes
- `/shared/[id]` - View shared notes

## 🌐 Environment Configuration

### Development vs Production
- **Development:** Uses `http://localhost:5000` for API calls
- **Production:** Uses relative URLs (Vercel handles routing)

### Environment Variables
- `NODE_ENV` - Automatically set by Vercel
- `GOOGLE_API_KEY` - Must be set manually in Vercel dashboard

## 🚨 Important Notes

1. **Google API Key:** Make sure to set your `GOOGLE_API_KEY` environment variable in Vercel
2. **Build Process:** Vercel will automatically build the frontend and deploy API functions
3. **Shared Notes:** Shared notes are stored in memory and will reset on serverless function restarts
4. **CORS:** All API endpoints include CORS headers for cross-origin requests

## 🔍 Troubleshooting

### Common Issues:
1. **API not working:** Check if `GOOGLE_API_KEY` is set correctly
2. **Build failures:** Ensure all dependencies are in package.json files
3. **CORS errors:** API endpoints include proper CORS headers

### Checking Logs:
1. Go to your Vercel project dashboard
2. Click on "Functions" tab
3. View logs for any API function errors

## 📝 Post-Deployment

After successful deployment:
1. Test all AI features (summary, grammar, tags, glossary)
2. Test note sharing functionality
3. Verify that shared notes are accessible via generated URLs
4. Check that the frontend loads correctly

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Vercel will automatically trigger a new deployment
3. Environment variables persist across deployments

---

**Need Help?** Check the Vercel documentation or create an issue in your repository.
