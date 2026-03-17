#!/bin/bash
# SADS Backend Server Startup Script
# This script ensures dependencies are installed before starting the server

echo "========================================"
echo "SADS Backend Server Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/3] Checking Node.js version..."
node --version
echo ""

echo "[2/3] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[WARNING] node_modules not found!"
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
else
    echo "Running dependency check..."
    node check-dependencies.js
    if [ $? -ne 0 ]; then
        echo "[WARNING] Some dependencies are missing!"
        echo "Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo "[ERROR] Failed to install dependencies"
            exit 1
        fi
    fi
fi
echo ""

echo "[3/3] Starting server..."
echo ""
node server.js
