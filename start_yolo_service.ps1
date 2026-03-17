# Start YOLO API Service for SADS
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting SADS YOLO Detection API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to ml directory
Set-Location -Path "ml"

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
Write-Host "Checking required packages..." -ForegroundColor Yellow
try {
    python -c "import flask, ultralytics, cv2" 2>&1 | Out-Null
    Write-Host "All required packages are installed" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Some packages may be missing. Installing..." -ForegroundColor Yellow
    pip install -r yolo_requirements.txt
}

# Set environment variables
$env:YOLO_MODEL_PATH = "yolov8s.pt"
$env:YOLO_OUTPUT_DIR = "runs/detect/api"
$env:YOLO_CONFIDENCE = "0.5"
$env:YOLO_PORT = "5001"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Model: $env:YOLO_MODEL_PATH"
Write-Host "  Output Dir: $env:YOLO_OUTPUT_DIR"
Write-Host "  Confidence: $env:YOLO_CONFIDENCE"
Write-Host "  Port: $env:YOLO_PORT"
Write-Host ""

# Check if model exists
if (-not (Test-Path $env:YOLO_MODEL_PATH)) {
    Write-Host "YOLOv8 model not found. It will be downloaded automatically on first run." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
}

# Start the API
Write-Host "Starting Flask server on port $env:YOLO_PORT..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python yolo_api.py





