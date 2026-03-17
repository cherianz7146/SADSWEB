"""
Train YOLOv8 model on custom elephant/tiger dataset
This will create a model that can detect both elephant and tiger correctly
"""

import os
from pathlib import Path
from ultralytics import YOLO
import shutil

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Dataset paths - try multiple locations
POSSIBLE_DATASETS = [
    os.path.join(SCRIPT_DIR, 'manual_dataset', 'split', 'dataset'),
    os.path.join(SCRIPT_DIR, 'training_dataset', 'split', 'dataset'),
    os.path.join(SCRIPT_DIR, 'data'),
]

# Find the best dataset (one with most images)
best_dataset = None
max_images = 0

for dataset_path in POSSIBLE_DATASETS:
    train_tiger = os.path.join(dataset_path, 'train', 'tiger')
    train_elephant = os.path.join(dataset_path, 'train', 'elephant')
    
    if os.path.exists(train_tiger) and os.path.exists(train_elephant):
        tiger_count = len([f for f in os.listdir(train_tiger) if f.endswith(('.jpg', '.jpeg', '.png'))])
        elephant_count = len([f for f in os.listdir(train_elephant) if f.endswith(('.jpg', '.jpeg', '.png'))])
        total = tiger_count + elephant_count
        
        if total > max_images:
            max_images = total
            best_dataset = dataset_path
            print(f"Found dataset at {dataset_path}: {tiger_count} tiger images, {elephant_count} elephant images")

if not best_dataset:
    print("❌ ERROR: No suitable dataset found!")
    print("   Please ensure you have a dataset with train/tiger and train/elephant folders")
    print("   Searched in:")
    for path in POSSIBLE_DATASETS:
        print(f"   - {path}")
    exit(1)

print(f"\n✅ Using dataset: {best_dataset}")
print(f"   Total images: {max_images}")

# Check if we need to create YOLO format dataset
# YOLO needs images in images/train and images/val, labels in labels/train and labels/val
yolo_dataset_dir = os.path.join(SCRIPT_DIR, 'yolo_custom_dataset')

# For now, we'll use YOLO's auto-annotation feature if labels don't exist
# Or we can use the classification dataset and let YOLO convert it

# Create YOLO dataset structure
yolo_train_images = os.path.join(yolo_dataset_dir, 'images', 'train')
yolo_val_images = os.path.join(yolo_dataset_dir, 'images', 'val')
yolo_train_labels = os.path.join(yolo_dataset_dir, 'labels', 'train')
yolo_val_labels = os.path.join(yolo_dataset_dir, 'labels', 'val')

for d in [yolo_train_images, yolo_val_images, yolo_train_labels, yolo_val_labels]:
    os.makedirs(d, exist_ok=True)

# Use YOLO's classification training mode (simpler for this use case)
# YOLOv8 supports classification training directly from folder structure
print("\n📁 Using YOLO classification mode (simpler than object detection)...")

# YOLO classification expects: train/elephant/, train/tiger/, val/elephant/, val/tiger/
# Our dataset already has this structure!
dataset_yaml = os.path.join(yolo_dataset_dir, 'dataset.yaml')

# For classification, we can use the existing folder structure
# But YOLO classification needs a different format
# Let's use YOLO's auto-annotation feature instead

print("   Using existing folder structure for classification training...")

# Train YOLO model using classification mode
print("\n🚀 Starting YOLO classification training...")
print("   This may take 10-30 minutes depending on your GPU...")

# Use YOLO classification model (faster training, good for 2-class problem)
model = YOLO('yolov8n-cls.pt')  # Classification model

# Train the model
results = model.train(
    data=best_dataset,  # Direct path to train/val folders
    epochs=50,  # Train for 50 epochs
    imgsz=224,  # Smaller for classification
    batch=16,
    name='elephant_tiger_custom',
    project=os.path.join(SCRIPT_DIR, 'runs', 'classify'),
    patience=10,  # Early stopping if no improvement
    save=True,
    plots=True
)

# Save the best model
# For classification, the model is saved differently
best_model_path = results.save_dir / 'weights' / 'best.pt'
custom_model_path = os.path.join(SCRIPT_DIR, 'elephant_tiger_custom.pt')

if os.path.exists(best_model_path):
    shutil.copy2(best_model_path, custom_model_path)
    print(f"\n✅ Training complete!")
    print(f"   Best model saved to: {custom_model_path}")
    print(f"   You can now use this model in yolo_api.py")
    print(f"\n⚠️  NOTE: This is a CLASSIFICATION model, not object detection.")
    print(f"   For object detection with bounding boxes, you need YOLO format labels.")
    print(f"   But this will correctly identify elephant vs tiger!")
else:
    # Try alternative path for classification models
    alt_path = results.save_dir / 'best.pt'
    if os.path.exists(alt_path):
        shutil.copy2(alt_path, custom_model_path)
        print(f"\n✅ Training complete!")
        print(f"   Best model saved to: {custom_model_path}")
    else:
        print(f"\n⚠️  Training completed but best model not found at expected location")
        print(f"   Check: {results.save_dir}")
