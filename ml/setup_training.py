import os
import shutil
from pathlib import Path

def setup_training_directories():
    """Create proper directory structure for training"""
    base_dir = Path("ml/training_dataset")
    
    # Create directories
    directories = [
        "raw/tiger",
        "raw/elephant", 
        "split/dataset/train/tiger",
        "split/dataset/train/elephant",
        "split/dataset/val/tiger",
        "split/dataset/val/elephant"
    ]
    
    for dir_path in directories:
        full_path = base_dir / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"Created: {full_path}")
    
    print(f"\nTraining directories created in: {base_dir}")
    print("\nInstructions:")
    print("1. Put your TIGER images in: ml/training_dataset/raw/tiger/")
    print("2. Put your ELEPHANT images in: ml/training_dataset/raw/elephant/")
    print("3. Run: python ml/organize_dataset.py")
    print("4. Run: python ml/train.py --data_dir ml/training_dataset/split/dataset --epochs 10 --out ml/models/custom_elephant_tiger.pth")
    
    return base_dir

if __name__ == "__main__":
    setup_training_directories()
