@echo off
echo Starting NoteCraft Backend with Python...

echo.
echo Setting Google Cloud Credentials...
set GOOGLE_APPLICATION_CREDENTIALS="C:\Users\urvil solanki\OneDrive\Desktop\PlayPower\notesummarize-ce339c680839.json"

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Python Flask server...
python app.py
