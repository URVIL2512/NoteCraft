@echo off
echo Starting NoteCraft Project...

echo.
echo 1. Starting Backend Server (Python Flask)...
start "NoteCraft Backend" cmd /k "cd backend && python app.py"

echo.
echo 2. Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 3. Starting Frontend Server (React + Vite)...
start "NoteCraft Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📍 URLs:
echo    Backend:  http://localhost:5173
echo    Frontend: http://localhost:3000
echo.
echo 🚀 Your NoteCraft app will be available at: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
