@echo off
REM SADS Backend Server Startup Script
REM This script ensures dependencies are installed before starting the server

echo ========================================
echo SADS Backend Server Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Checking Node.js version...
node --version
echo.

echo [2/3] Checking dependencies...
REM Check for workspace setup (dependencies in root)
if exist "..\node_modules" (
    echo Using workspace setup - dependencies in root node_modules
) else if not exist "node_modules" (
    echo [WARNING] node_modules not found!
    echo Installing dependencies from root (workspace setup)...
    cd ..
    call npm install
    cd backend
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run dependency check
echo Running dependency check...
node check-dependencies.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some dependencies are missing!
    echo Installing dependencies from root...
    cd ..
    call npm install
    cd backend
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)
echo.

echo [3/3] Starting server...
echo.
node server.js

pause
