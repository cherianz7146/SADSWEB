@echo off
REM SADS Project - Stop Development Servers (Batch file)
REM Usage: Double-click or run "stop-dev.bat"

echo.
echo ========================================
echo  Stopping SADS Development Servers
echo ========================================
echo.

REM Kill processes on port 5000 (Backend)
echo Stopping Backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Backend stopped
    )
)

REM Kill processes on port 5173 (Frontend)
echo Stopping Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Frontend stopped
    )
)

REM Kill processes on port 5174 (Alternative Frontend)
echo Checking port 5174...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Frontend (5174) stopped
    )
)

echo.
echo ========================================
echo  All servers stopped!
echo ========================================
echo.
echo To start again, run: start-dev.bat
echo.
pause




