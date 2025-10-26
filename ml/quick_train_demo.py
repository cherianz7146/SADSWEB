import os
import shutil
import tarfile
from pathlib import Path
import urllib.request

import torch
from torchvision import datasets, transforms
from train import build_model, train, get_dataloaders

DATA_URL = os.getenv('ML_DEMO_DATA_URL', '')
DEFAULT_OUT = 'ml/models/elephant_tiger_demo.pth'

# For demo purposes, user can provide a prepared tar.gz with structure:
# dataset/train/elephant, dataset/train/tiger, dataset/val/elephant, dataset/val/tiger

def download_and_extract(url: str, dest_dir: str):
	os.makedirs(dest_dir, exist_ok=True)
	tar_path = Path(dest_dir) / 'dataset.tar.gz'
	print(f'Downloading dataset from {url} ...')
	urllib.request.urlretrieve(url, tar_path)
	print('Extracting...')
	with tarfile.open(tar_path, 'r:gz') as tar:
		tar.extractall(dest_dir)
	os.remove(tar_path)
	print('Dataset ready')


def main():
	out = os.getenv('ML_OUT', DEFAULT_OUT)
	data_dir_env = os.getenv('ML_DATA_DIR', '')

	if DATA_URL:
		data_root = 'ml/demo_data'
		if os.path.exists(data_root):
			shutil.rmtree(data_root)
		download_and_extract(DATA_URL, data_root)
		data_dir = str(Path(data_root) / 'dataset')
	elif data_dir_env:
		data_dir = data_dir_env
	else:
		raise SystemExit('Set ML_DEMO_DATA_URL or ML_DATA_DIR to proceed')

	loaders = get_dataloaders(data_dir, batch_size=16)
	_, _, classes = loaders
	assert set(classes) == {'elephant', 'tiger'}, 'Dataset must contain elephant and tiger classes'

	device = 'cuda' if torch.cuda.is_available() else 'cpu'
	model = build_model(num_classes=2)
	train(model, loaders, epochs=5, lr=1e-3, device=device, out_path=out)
	print(f'Demo training completed. Model saved to {out}')

if __name__ == '__main__':
	main()








