@echo off
REM SADS YOLO API Startup Script for Windows

echo ========================================
echo  Starting SADS YOLO Detection API
echo ========================================
echo.

REM Activate Python virtual environment if it exists
if exist ..\venv\Scripts\activate.bat (
    echo Activating Python virtual environment...
    call ..\venv\Scripts\activate.bat
) else if exist venv\Scripts\activate.bat (
    echo Activating local virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No virtual environment found, using system Python
)

REM Set environment variables
set YOLO_MODEL_PATH=yolov8s.pt
set YOLO_OUTPUT_DIR=runs/detect/api
set YOLO_CONFIDENCE=0.5
set YOLO_PORT=5001

echo.
echo Configuration:
echo   Model: %YOLO_MODEL_PATH%
echo   Output Dir: %YOLO_OUTPUT_DIR%
echo   Confidence: %YOLO_CONFIDENCE%
echo   Port: %YOLO_PORT%
echo.

REM Check if model exists
if not exist %YOLO_MODEL_PATH% (
    echo YOLOv8 model not found. It will be downloaded automatically on first run.
    echo This may take a few minutes...
    echo.
)

REM Start the API
echo Starting Flask server...
python yolo_api.py

pause







