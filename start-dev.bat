@echo off
REM SADS Project - Start Development Servers (Batch file)
REM Usage: Double-click or run "start-dev.bat"

echo.
echo ========================================
echo  Starting SADS Development Servers
echo ========================================
echo.

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
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop
echo Or run: stop-dev.bat
echo.
echo Happy coding! 🚀
echo.
pause




