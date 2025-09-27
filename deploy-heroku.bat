@echo off
echo Deploying NoteCraft to Heroku...

echo.
echo Step 1: Adding all files to git...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Deploy to Heroku"

echo.
echo Step 3: Pushing to Heroku...
git push heroku main

echo.
echo Step 4: Opening your app...
heroku open

echo.
echo Deployment complete!
echo Your app should be available at: https://your-notecraft-app-name.herokuapp.com
echo.
echo Press any key to exit...
pause > nul
