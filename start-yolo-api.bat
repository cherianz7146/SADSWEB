@echo off
echo Starting YOLO API...
cd /d D:\SADS2\ml
if exist .venv\Scripts\python.exe (
    echo Using virtual environment...
    .venv\Scripts\python.exe yolo_api.py
) else (
    echo Using system Python...
    python yolo_api.py
)
pause
