import os
import random
import shutil
from pathlib import Path

RAW_ROOT = Path('ml/manual_dataset/raw')
SPLIT_ROOT = Path('ml/manual_dataset/split')


def split_dataset():
	if SPLIT_ROOT.exists():
		shutil.rmtree(SPLIT_ROOT)
	
	for cls in ['elephant', 'tiger']:
		src_dir = RAW_ROOT / cls
		if not src_dir.exists():
			print(f'No {cls} images found in {src_dir}')
			continue
		
		files = list(src_dir.glob('*.jpg'))
		if not files:
			print(f'No {cls} images found')
			continue
		
		random.shuffle(files)
		k = max(1, int(0.75 * len(files)))  # 75% train, 25% val
		
		train_dir = SPLIT_ROOT / 'dataset' / 'train' / cls
		val_dir = SPLIT_ROOT / 'dataset' / 'val' / cls
		train_dir.mkdir(parents=True, exist_ok=True)
		val_dir.mkdir(parents=True, exist_ok=True)
		
		for i, f in enumerate(files):
			dest = train_dir if i < k else val_dir
			shutil.copy(f, dest)
		
		print(f'{cls}: {len(files)} total, {k} train, {len(files)-k} val')


if __name__ == '__main__':
	split_dataset()
	print(f'Dataset split to {SPLIT_ROOT}/dataset')
	print('Run: python ml/train.py --data_dir ml/manual_dataset/split/dataset --epochs 5 --out ml/models/elephant_tiger_manual.pth')



















