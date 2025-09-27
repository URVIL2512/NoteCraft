# Deploy NoteCraft to Heroku

## Prerequisites
1. Heroku CLI installed
2. Git repository initialized
3. Google AI Studio API key

## Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

## Step 2: Login to Heroku
```bash
heroku login
```

## Step 3: Create Heroku App
```bash
heroku create your-notecraft-app-name
```

## Step 4: Set Environment Variables
```bash
heroku config:set GOOGLE_API_KEY=your-google-api-key-here
```

## Step 5: Deploy to Heroku
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Step 6: Open Your App
```bash
heroku open
```

## Important Notes

### Backend Configuration
- Backend runs on Heroku's assigned PORT
- API key is set via environment variables
- CORS is configured for frontend

### Frontend Configuration
- Frontend builds during deployment
- Static files served by Heroku
- API calls go to Heroku backend

### Environment Variables
- `GOOGLE_API_KEY`: Your Google AI Studio API key
- `PORT`: Automatically set by Heroku

## Troubleshooting

### Check Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Check Config
```bash
heroku config
```

## Your App Will Be Available At:
`https://your-notecraft-app-name.herokuapp.com`

## Features Deployed:
- ✅ AI Summary Generation
- ✅ Tag Suggestions
- ✅ Grammar Check
- ✅ Auto Glossary
- ✅ Note Management
- ✅ Text Editor with Full Space Usage
