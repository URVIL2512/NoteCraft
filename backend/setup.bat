@echo off
echo Setting up NoteCraft Backend with Google Gemini...

echo.
echo 1. Installing dependencies...
npm install

echo.
echo 2. Setting Google Cloud credentials...
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\urvil solanki\OneDrive\Desktop\PlayPower\notesummarize-ce339c680839.json

echo.
echo 3. Starting server...
echo Backend server will run on port 5173
echo Press Ctrl+C to stop the server
echo.
npm run dev
