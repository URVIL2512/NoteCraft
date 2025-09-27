# Deploy NoteCraft to Vercel

This guide shows you how to deploy your NoteCraft application to Vercel.

## 🎯 **Deployment Strategy**

We'll deploy the **frontend to Vercel** and the **backend to Heroku** (or another service), then connect them.

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Backend Deployed**: Your Python backend should be deployed somewhere (Heroku, Railway, etc.)

## 🚀 **Step 1: Deploy Backend First**

### Option A: Deploy to Heroku
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create your-notecraft-backend

# 4. Set environment variables
heroku config:set GOOGLE_API_KEY=your_google_api_key

# 5. Deploy backend
git subtree push --prefix backend heroku main
```

### Option B: Deploy to Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy backend
cd backend
railway deploy
```

## 🎨 **Step 2: Deploy Frontend to Vercel**

### Method 1: Using Vercel CLI
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
vercel

# 4. Follow the prompts:
#    - Set up and deploy? Yes
#    - Which scope? (select your account)
#    - Link to existing project? No
#    - Project name? notecraft-frontend
#    - Directory? ./frontend
#    - Override settings? No
```

### Method 2: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## ⚙️ **Step 3: Configure Environment Variables**

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   VITE_API_URL = https://your-backend-url.herokuapp.com
   ```

## 🔧 **Step 4: Update Configuration**

Update `vercel.json` with your actual backend URL:

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
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-actual-backend-url.herokuapp.com/api/$1"
    },
    {
      "src": "/shared/(.*)",
      "dest": "https://your-actual-backend-url.herokuapp.com/shared/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

## 🎯 **Step 5: Deploy**

```bash
# Commit your changes
git add .
git commit -m "Configure for Vercel deployment"

# Deploy to Vercel
vercel --prod
```

## ✅ **Step 6: Test Your Deployment**

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints
3. **Features**: Test AI features, sharing, etc.

## 🔄 **Alternative: Full-Stack Vercel Deployment**

If you want to deploy everything to Vercel:

### 1. Create API Routes
Create `api/` folder in your project root:

```
api/
├── ai/
│   ├── summary.py
│   ├── tags.py
│   ├── grammar.py
│   └── glossary.py
└── notes/
    └── share.py
```

### 2. Convert Flask Routes to Vercel Functions
Each Flask route becomes a separate Python file in the `api/` folder.

### 3. Update vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
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

## 🎉 **Benefits of Vercel Deployment**

- ✅ **Fast Global CDN**: Your app loads quickly worldwide
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Custom Domains**: Easy to add your own domain
- ✅ **Preview Deployments**: Every PR gets a preview URL
- ✅ **Analytics**: Built-in performance monitoring
- ✅ **Zero Configuration**: Works out of the box

## 🆘 **Troubleshooting**

### Common Issues:

1. **Build Fails**: Check your `package.json` scripts
2. **API Calls Fail**: Verify `VITE_API_URL` environment variable
3. **CORS Errors**: Ensure backend allows your Vercel domain
4. **Environment Variables**: Make sure they're set in Vercel dashboard

### Debug Steps:
1. Check Vercel build logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

**Your NoteCraft app will be live at: `https://your-project.vercel.app`** 🚀
