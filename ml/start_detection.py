#!/usr/bin/env python3
"""
SADS Animal Detection - Easy Starter Script
This script helps you start the animal detection system with minimal setup.
"""

import os
import sys

def print_banner():
    print("=" * 60)
    print("SADS - Smart Animal Deterrent System")
    print("Animal Detection Starter")
    print("=" * 60)
    print()

def check_requirements():
    """Check if required packages are installed"""
    required_packages = ['cv2', 'torch', 'torchvision', 'requests', 'numpy']
    missing = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                __import__('cv2')
            else:
                __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print("❌ Missing required packages:")
        for pkg in missing:
            pkg_name = 'opencv-python' if pkg == 'cv2' else pkg
            print(f"   - {pkg_name}")
        print("\nPlease install them:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def check_backend():
    """Check if backend is running"""
    import requests
    backend_url = os.getenv('ML_BACKEND_URL', 'http://localhost:5000')
    
    try:
        response = requests.get(f"{backend_url}/api/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend is running at {backend_url}")
            return True
        else:
            print(f"⚠️  Backend responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend is not accessible at {backend_url}")
        print(f"   Error: {e}")
        print("\n   Please start the backend server first:")
        print("   cd backend && node server.js")
        return False

def check_token():
    """Check if auth token is set"""
    token = os.getenv('ML_AUTH_TOKEN', '')
    
    if token:
        print(f"✅ Auth token is set ({token[:10]}...)")
        return True
    else:
        print("⚠️  No auth token set (ML_AUTH_TOKEN)")
        print("\n   To get your token:")
        print("   1. Open http://localhost:5173 in browser")
        print("   2. Log in to your account")
        print("   3. Open Developer Tools (F12)")
        print("   4. Go to Application → Local Storage")
        print("   5. Find 'sads_token' and copy the value")
        print("\n   Then set it:")
        print("   $env:ML_AUTH_TOKEN=\"YOUR_TOKEN_HERE\"  (PowerShell)")
        print()
        
        user_input = input("Do you want to continue anyway? (y/n): ").lower()
        return user_input == 'y'

def check_model():
    """Check if model file exists"""
    model_path = os.getenv('ML_MODEL', 'models/elephant_tiger_manual.pth')
    
    # Try multiple possible paths
    possible_paths = [
        model_path,
        f'ml/{model_path}',
        'models/elephant_tiger_manual.pth',
        'models/custom_elephant_tiger.pth',
        '../models/elephant_tiger_manual.pth',
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"✅ Model found at: {path}")
            os.environ['ML_MODEL'] = path
            return True
    
    print("⚠️  No trained model found")
    print("   Will use ImageNet fallback (less accurate)")
    print("\n   Searched in:")
    for path in possible_paths:
        print(f"   - {path}")
    return True  # Continue with fallback

def check_webcam():
    """Check if webcam is accessible"""
    import cv2
    
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        print("✅ Webcam is accessible")
        cap.release()
        return True
    else:
        print("❌ Cannot access webcam")
        print("\n   Possible solutions:")
        print("   - Check if webcam is connected")
        print("   - Close other apps using webcam (Zoom, Teams, etc.)")
        print("   - Try different camera index (set ML_CAMERA_INDEX)")
        return False

def show_config():
    """Display current configuration"""
    print("\n" + "=" * 60)
    print("Configuration:")
    print("=" * 60)
    print(f"Backend URL:     {os.getenv('ML_BACKEND_URL', 'http://localhost:5000')}")
    print(f"Auth Token:      {'Set' if os.getenv('ML_AUTH_TOKEN') else 'Not set'}")
    print(f"Property ID:     {os.getenv('ML_PROPERTY_ID', 'Not set')}")
    print(f"Threshold:       {os.getenv('ML_THRESHOLD', '0.80')} (80%)")
    print(f"Model Path:      {os.getenv('ML_MODEL', 'models/elephant_tiger_manual.pth')}")
    print(f"Cooldown:        5 seconds between detections")
    print("=" * 60)
    print()

def main():
    print_banner()
    
    # Run all checks
    checks_passed = True
    
    print("Running system checks...\n")
    
    if not check_requirements():
        checks_passed = False
    
    if not check_backend():
        checks_passed = False
    
    if not check_token():
        checks_passed = False
    
    check_model()  # This doesn't fail, just warns
    
    if not check_webcam():
        checks_passed = False
    
    if not checks_passed:
        print("\n❌ Some checks failed. Please fix the issues above.")
        print("   Or continue anyway at your own risk.")
        user_input = input("\nContinue anyway? (y/n): ").lower()
        if user_input != 'y':
            return
    
    show_config()
    
    print("🚀 Starting animal detection system...")
    print("   Press 'q' in the video window to quit")
    print("   Press Ctrl+C here to force quit")
    print()
    
    # Import and run the main webcam client
    try:
        from webcam_client import main as run_detection
        run_detection()
    except KeyboardInterrupt:
        print("\n\n⏹️  Detection stopped by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()







