# SADS - ML Animal Detection Setup Guide

## Overview
Your SADS system has a complete ML-based animal detection system that uses your webcam to detect elephants and tigers in real-time.

## Why Camera Is Not Detecting Animals

The camera detection system needs to be **manually started** - it doesn't run automatically. The notification pages show mock/demo data until you start the ML detection client.

## How to Start Animal Detection

### Prerequisites
1. Python environment with required packages
2. Trained ML model (you already have this at `ml/models/elephant_tiger_manual.pth`)
3. Webcam/camera access
4. Backend server running (on port 5000)
5. Authentication token from a logged-in user

### Step-by-Step Instructions

#### Step 1: Install Python Dependencies
```bash
cd ml
pip install -r requirements.txt
```

#### Step 2: Get Your Authentication Token
1. Open your browser and go to `http://localhost:5173`
2. Log in to your account
3. Open browser Developer Tools (F12)
4. Go to **Application** tab → **Local Storage** → `http://localhost:5173`
5. Find `sads_token` and copy the token value

#### Step 3: Set Environment Variables

**On Windows PowerShell:**
```powershell
$env:ML_BACKEND_URL="http://localhost:5000"
$env:ML_AUTH_TOKEN="YOUR_TOKEN_HERE"  # Replace with your actual token
$env:ML_THRESHOLD="0.80"  # Detection confidence threshold (80%)
$env:ML_MODEL="ml/models/elephant_tiger_manual.pth"  # Your trained model
```

**On Windows CMD:**
```cmd
set ML_BACKEND_URL=http://localhost:5000
set ML_AUTH_TOKEN=YOUR_TOKEN_HERE
set ML_THRESHOLD=0.80
set ML_MODEL=ml/models/elephant_tiger_manual.pth
```

**On Linux/Mac:**
```bash
export ML_BACKEND_URL="http://localhost:5000"
export ML_AUTH_TOKEN="YOUR_TOKEN_HERE"
export ML_THRESHOLD="0.80"
export ML_MODEL="ml/models/elephant_tiger_manual.pth"
```

#### Step 4: Run the Webcam Detection Client
```bash
cd ml
python webcam_client.py
```

### What Happens When Running

1. **Webcam Opens**: A window shows your webcam feed
2. **Real-time Detection**: The system analyzes each frame for elephants/tigers
3. **Visual Feedback**: Detected animals are labeled on the video with confidence scores
4. **Auto-Post to Backend**: When confidence ≥ 80%, detection is sent to backend
5. **5-Second Cooldown**: Prevents spam (only posts once every 5 seconds)
6. **Notifications Appear**: Detections show up in your notification pages
7. **Emails Sent**: Managers and admins receive email notifications

### How to Stop Detection
Press `q` key in the webcam window to quit

## Verification

After starting the webcam client:

1. **Check Console**: Should see "Webcam opened. Press q to quit."
2. **Check Detection Window**: Should see live video feed
3. **Test with Images**: Show elephant/tiger images to your webcam
4. **Check Notifications**: Go to `/dashboard/notifications` to see detections
5. **Check Email**: Managers should receive email notifications

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ML_BACKEND_URL` | `http://localhost:5000` | Backend API URL |
| `ML_AUTH_TOKEN` | (empty) | Your JWT authentication token |
| `ML_PROPERTY_ID` | (empty) | Optional property ID to link detections |
| `ML_THRESHOLD` | `0.80` | Minimum confidence to post (0.0-1.0) |
| `ML_MODEL` | `ml/models/elephant_tiger.pth` | Path to trained model |
| `ML_IMAGENET_FALLBACK` | `1` | Use ImageNet if model not found |

### Adjusting Detection Sensitivity

**More Sensitive** (detects more, but may have false positives):
```bash
$env:ML_THRESHOLD="0.60"  # 60% confidence
```

**Less Sensitive** (fewer detections, but more accurate):
```bash
$env:ML_THRESHOLD="0.90"  # 90% confidence
```

## Troubleshooting

### Issue: "Could not open webcam"
**Solution**: 
- Check if webcam is connected
- Close other applications using webcam (Zoom, Teams, etc.)
- Try different camera index: modify `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)` in webcam_client.py

### Issue: "Failed to post detection: 401"
**Solution**:
- Your token expired (tokens expire after 1 hour)
- Get a new token from browser Local Storage
- Update `ML_AUTH_TOKEN` environment variable

### Issue: "Model not found"
**Solution**:
- Check if model file exists at specified path
- System will auto-fallback to ImageNet model
- To use your trained model, ensure path is correct:
  ```bash
  ls ml/models/elephant_tiger_manual.pth
  ```

### Issue: "No detections appearing"
**Solution**:
- Check confidence threshold (try lowering to 0.60)
- Verify backend is running (`http://localhost:5000`)
- Check if token is valid
- Look at console for error messages

## Model Information

Your system has 2 trained models:
1. `elephant_tiger_manual.pth` - Trained on your manual dataset (better accuracy)
2. `custom_elephant_tiger.pth` - Alternative model

Both models can detect:
- **Elephants** 🐘
- **Tigers** 🐅

## Testing Without Animals

If you don't have real elephants/tigers to test:

1. **Use Images**: Open elephant/tiger images on your phone/screen and show to webcam
2. **Use Training Dataset**: Navigate to `ml/manual_dataset/raw/` for test images
3. **Lower Threshold**: Set to 0.5 for easier testing

## Production Deployment

For production use:

1. **Use IP Camera**: Replace `cv2.VideoCapture(0)` with camera IP
2. **Run as Service**: Create systemd service (Linux) or Windows Service
3. **Multiple Cameras**: Run multiple instances with different camera IDs
4. **Cloud Deployment**: Deploy on edge device near camera location

## Quick Start Command

```bash
# One-line command to start detection
cd ml && python webcam_client.py
```

Remember to set environment variables first!

## Support

If you continue to have issues:
1. Check backend logs for errors
2. Verify database connection
3. Ensure email service is configured
4. Check browser console for notification errors






