@echo off
REM SADS YOLO API Startup Script for Windows
REM This script ensures Python dependencies are installed before starting

echo ========================================
echo  Starting SADS YOLO Detection API
echo ========================================
echo.

REM Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Checking Python version...
python --version
echo.

REM Activate Python virtual environment if it exists
if exist ..\venv\Scripts\activate.bat (
    echo [2/4] Activating Python virtual environment...
    call ..\venv\Scripts\activate.bat
) else if exist venv\Scripts\activate.bat (
    echo [2/4] Activating local virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo [2/4] No virtual environment found, using system Python
)

echo.
echo [3/4] Checking Python dependencies...
python -c "import flask" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Flask not found! Installing dependencies...
    if exist requirements.txt (
        python -m pip install -r requirements.txt
    ) else if exist yolo_requirements.txt (
        python -m pip install -r yolo_requirements.txt
    ) else (
        echo Installing core dependencies...
        python -m pip install flask flask-cors ultralytics opencv-python
    )
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies check passed
)
echo.

REM Set environment variables (using absolute paths)
set YOLO_CONFIDENCE=0.5
set YOLO_PORT=5001

echo [4/4] Configuration:
echo   Confidence: %YOLO_CONFIDENCE%
echo   Port: %YOLO_PORT%
echo   Model: Will be auto-detected from runs/detect directory
echo.

REM Start the API
echo Starting Flask server...
python yolo_api.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] YOLO API failed to start
    echo Check the error messages above for details
    pause
    exit /b 1
)

pause







