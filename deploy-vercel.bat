@echo off
echo Deploying NoteCraft to Vercel...

echo.
echo 1. Installing Vercel CLI (if not already installed)...
npm install -g vercel

echo.
echo 2. Logging in to Vercel...
vercel login

echo.
echo 3. Deploying to Vercel...
echo    This will ask you several questions:
echo    - Set up and deploy? Answer: Yes
echo    - Which scope? Select your account
echo    - Link to existing project? Answer: No
echo    - Project name? Answer: notecraft-frontend
echo    - Directory? Answer: ./frontend
echo    - Override settings? Answer: No
echo.
vercel

echo.
echo 4. Setting up environment variables...
echo    You need to manually add this in Vercel dashboard:
echo    VITE_API_URL = https://your-backend-url.herokuapp.com
echo.
echo 5. Deploying to production...
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 📍 Your app will be available at: https://your-project.vercel.app
echo.
echo ⚠️  Remember to:
echo    1. Deploy your backend to Heroku/Railway first
echo    2. Update VITE_API_URL in Vercel dashboard
echo    3. Update vercel.json with your actual backend URL
echo.
echo Press any key to exit...
pause > nul
