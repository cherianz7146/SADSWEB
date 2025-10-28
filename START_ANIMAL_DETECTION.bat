@echo off
echo ========================================
echo SADS Animal Detection System
echo ========================================
echo.
echo This will start the animal detection system.
echo Make sure the backend server is running!
echo.
pause

REM Set default environment variables
set ML_BACKEND_URL=http://localhost:5000
set ML_THRESHOLD=0.80
set ML_MODEL=ml/models/elephant_tiger_manual.pth

echo.
echo ========================================
echo IMPORTANT: You need an authentication token
echo ========================================
echo.
echo To get your token:
echo 1. Open http://localhost:5173 in your browser
echo 2. Log in to your account
echo 3. Press F12 to open Developer Tools
echo 4. Go to Application -^> Local Storage
echo 5. Find 'sads_token' and copy the value
echo.
echo.

REM Prompt for token
set /p TOKEN="Enter your authentication token (or press Enter to skip): "

if not "%TOKEN%"=="" (
    set ML_AUTH_TOKEN=%TOKEN%
    echo Token set successfully!
) else (
    echo Warning: No token provided. Detection may not work properly.
)

echo.
echo Starting detection system...
echo.

cd ml
python start_detection.py

pause







