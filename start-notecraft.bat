@echo off
echo Starting NoteCraft Project...

echo.
echo Setting Google Cloud Credentials (already configured)...
set GOOGLE_APPLICATION_CREDENTIALS="C:\Users\urvil solanki\OneDrive\Desktop\PlayPower\notesummarize-ce339c680839.json"

echo.
echo Starting Backend Server (Python with Service Account)...
start "NoteCraft Backend" cmd /k "cd backend && run-python.bat"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "NoteCraft Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5173 (Python Flask with Google Cloud Service Account)
echo Frontend: http://localhost:3000
echo.
echo Using your existing Google Cloud service account setup!
echo.
echo Press any key to exit this window...
pause > nul
