import os
import random
import shutil
from pathlib import Path

import requests

import torch
from train import get_dataloaders, build_model, train

# Small curated set of public-domain/CC images (direct file URLs). Replace or extend as needed.
ELEPHANT_URLS = [
	'https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/6/63/African_elephant_warning_raised_trunk.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/6/6b/Elephant_Kruger.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/3/3a/Asian_elephant_-_Melbourne_Zoo.jpg',
]

TIGER_URLS = [
	'https://upload.wikimedia.org/wikipedia/commons/5/56/Tiger.50.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/3/36/Tiger_in_Ranthambhore.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/2/2f/Siberian_Tiger_%28Panthera_tigris_altaica%29.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/6/6e/Male_Bengal_tiger_%28Panthera_tigris_tigris%29.jpg',
]

ROOT = Path('ml/auto_dataset')
OUT = Path('ml/models/elephant_tiger_auto.pth')


HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.9",
}


def download_images(urls, dest_dir: Path):
	dest_dir.mkdir(parents=True, exist_ok=True)
	for i, url in enumerate(urls):
		fname = dest_dir / f"img_{i}.jpg"
		try:
			r = requests.get(url, timeout=30, headers=HEADERS, allow_redirects=True)
			r.raise_for_status()
			with open(fname, 'wb') as f:
				f.write(r.content)
			print(f"Downloaded {url}")
		except Exception as e:
			print(f"Failed {url}: {e}")


def build_dataset():
	if ROOT.exists():
		shutil.rmtree(ROOT)
	train_e = ROOT / 'dataset' / 'train' / 'elephant'
	train_t = ROOT / 'dataset' / 'train' / 'tiger'
	val_e = ROOT / 'dataset' / 'val' / 'elephant'
	val_t = ROOT / 'dataset' / 'val' / 'tiger'
	for p in [train_e, train_t, val_e, val_t]:
		p.mkdir(parents=True, exist_ok=True)

	# Download to temporary folder and then split 75/25
	tmp_e = ROOT / 'tmp' / 'elephant'
	tmp_t = ROOT / 'tmp' / 'tiger'
	download_images(ELEPHANT_URLS, tmp_e)
	download_images(TIGER_URLS, tmp_t)

	def split_move(tmp_dir: Path, train_dir: Path, val_dir: Path):
		files = list(tmp_dir.glob('*.jpg'))
		random.shuffle(files)
		k = max(1, int(0.75 * len(files)))
		for i, fp in enumerate(files):
			shutil.copy(fp, train_dir if i < k else val_dir)

	split_move(tmp_e, train_e, val_e)
	split_move(tmp_t, train_t, val_t)



def main():
	build_dataset()
	data_dir = str(ROOT / 'dataset')
	# Validate that we actually have images
	train_e = list((ROOT / 'dataset' / 'train' / 'elephant').glob('*.jpg'))
	train_t = list((ROOT / 'dataset' / 'train' / 'tiger').glob('*.jpg'))
	val_e = list((ROOT / 'dataset' / 'val' / 'elephant').glob('*.jpg'))
	val_t = list((ROOT / 'dataset' / 'val' / 'tiger').glob('*.jpg'))
	if len(train_e) == 0 or len(train_t) == 0 or len(val_e) == 0 or len(val_t) == 0:
		raise SystemExit('Auto-download failed to fetch images (403/blocked). Please rerun, or use the webcam fallback (no training) by running ml/webcam_client.py with ML_IMAGENET_FALLBACK=1.')
	loaders = get_dataloaders(data_dir, batch_size=8)
	device = 'cuda' if torch.cuda.is_available() else 'cpu'
	model = build_model(num_classes=2)
	train(model, loaders, epochs=3, lr=1e-3, device=device, out_path=str(OUT))
	print(f"Auto training complete. Model saved to {OUT}")


if __name__ == '__main__':
	main()
