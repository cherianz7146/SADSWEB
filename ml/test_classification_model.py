"""Test the classification model to verify it works"""
from ultralytics import YOLO
import cv2
import os

# Load model
model = YOLO('elephant_tiger_custom.pt')
print(f"Model task: {model.task}")
print(f"Model names: {model.names}")

# Test with a tiger image
test_path = 'manual_dataset/split/dataset/train/tiger/img_0000.jpg'
if os.path.exists(test_path):
    print(f"\nTesting with: {test_path}")
    results = model.predict(test_path, verbose=False)
    r = results[0]
    
    if hasattr(r, 'probs') and r.probs is not None:
        top1_idx = int(r.probs.top1)
        top1_conf = float(r.probs.top1conf)
        top1_name = model.names[top1_idx]
        
        print(f"✅ Classification result:")
        print(f"   Class: {top1_name}")
        print(f"   Confidence: {top1_conf*100:.2f}%")
        print(f"   Class ID: {top1_idx}")
        
        if top1_conf >= 0.5:
            print(f"✅ Confidence above 50% threshold - should be detected!")
        else:
            print(f"⚠️  Confidence below 50% threshold - will be filtered out")
            print(f"   Try lowering confidence threshold to {top1_conf:.2f}")
    else:
        print("❌ No classification results found")
else:
    print(f"⚠️  Test image not found: {test_path}")
