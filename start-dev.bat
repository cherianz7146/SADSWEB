@echo off
REM SADS Project - Start Development Servers (Batch file)
REM Usage: Double-click or run "start-dev.bat"

echo.
echo ========================================
echo  Starting SADS Development Servers
echo ========================================
echo.

REM Start YOLO API in new window (Required for detection)
echo Starting YOLO API Service...
start "SADS YOLO API (Port 5001)" cmd /k "cd /d %~dp0ml && python yolo_api.py"

REM Wait 3 seconds
timeout /t 3 /nobreak > nul

REM Start Backend in new window
echo Starting Backend Server...
start "SADS Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

REM Wait 3 seconds
timeout /t 3 /nobreak > nul

REM Start Frontend in new window
echo Starting Frontend Server...
start "SADS Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  Servers are starting!
echo ========================================
echo.
echo YOLO API: http://localhost:5001 (REQUIRED for detection)
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop
echo Or run: stop-dev.bat
echo.
echo Happy coding! 🚀
echo.
pause






