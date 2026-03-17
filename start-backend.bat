@echo off
REM SADS Backend Server Startup Script (Root Level)
REM This script starts the backend server from the project root

echo ========================================
echo SADS Backend Server Startup
echo ========================================
echo.

cd backend
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not navigate to backend directory
    pause
    exit /b 1
)

call start-server.bat
