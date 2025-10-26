import os
import shutil
import random
from pathlib import Path

def organize_dataset():
    """Organize raw images into train/val split"""
    raw_dir = Path("ml/training_dataset/raw")
    split_dir = Path("ml/training_dataset/split/dataset")
    
    # Get all images from each class
    tiger_images = list((raw_dir / "tiger").glob("*.jpg")) + list((raw_dir / "tiger").glob("*.png"))
    elephant_images = list((raw_dir / "elephant").glob("*.jpg")) + list((raw_dir / "elephant").glob("*.png"))
    
    print(f"Found {len(tiger_images)} tiger images")
    print(f"Found {len(elephant_images)} elephant images")
    
    if len(tiger_images) == 0 or len(elephant_images) == 0:
        print("❌ Error: Need images in both tiger and elephant folders!")
        print("Put your images in:")
        print("- ml/training_dataset/raw/tiger/")
        print("- ml/training_dataset/raw/elephant/")
        return False
    
    # Shuffle images
    random.shuffle(tiger_images)
    random.shuffle(elephant_images)
    
    # Split 80% train, 20% val
    tiger_train = tiger_images[:int(len(tiger_images) * 0.8)]
    tiger_val = tiger_images[int(len(tiger_images) * 0.8):]
    
    elephant_train = elephant_images[:int(len(elephant_images) * 0.8)]
    elephant_val = elephant_images[int(len(elephant_images) * 0.8):]
    
    print(f"Tiger: {len(tiger_train)} train, {len(tiger_val)} val")
    print(f"Elephant: {len(elephant_train)} train, {len(elephant_val)} val")
    
    # Copy images to train/val directories
    for img in tiger_train:
        shutil.copy2(img, split_dir / "train" / "tiger" / img.name)
    
    for img in tiger_val:
        shutil.copy2(img, split_dir / "val" / "tiger" / img.name)
    
    for img in elephant_train:
        shutil.copy2(img, split_dir / "train" / "elephant" / img.name)
    
    for img in elephant_val:
        shutil.copy2(img, split_dir / "val" / "elephant" / img.name)
    
    print("Dataset organized successfully!")
    print(f"Training data ready in: {split_dir}")
    return True

if __name__ == "__main__":
    organize_dataset()
