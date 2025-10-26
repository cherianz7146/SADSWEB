import os
import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models


def get_dataloaders(data_dir: str, batch_size: int = 16):
	train_transforms = transforms.Compose([
		transforms.Resize((224, 224)),
		transforms.RandomHorizontalFlip(),
		transforms.ToTensor(),
		transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
	])
	test_transforms = transforms.Compose([
		transforms.Resize((224, 224)),
		transforms.ToTensor(),
		transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
	])

	train_dir = os.path.join(data_dir, 'train')
	val_dir = os.path.join(data_dir, 'val')

	train_ds = datasets.ImageFolder(train_dir, transform=train_transforms)
	val_ds = datasets.ImageFolder(val_dir, transform=test_transforms)

	train_loader = torch.utils.data.DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
	val_loader = torch.utils.data.DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)
	return train_loader, val_loader, train_ds.classes


def build_model(num_classes: int):
	model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
	for p in model.parameters():
		p.requires_grad = False
	in_features = model.classifier[3].in_features
	model.classifier[3] = nn.Linear(in_features, num_classes)
	return model


def train(model, loaders, epochs: int, lr: float, device: str, out_path: str):
	train_loader, val_loader, classes = loaders
	criterion = nn.CrossEntropyLoss()
	optimizer = optim.Adam(model.classifier[3].parameters(), lr=lr)
	model.to(device)

	best_acc = 0.0
	for epoch in range(epochs):
		model.train()
		train_loss = 0.0
		for images, labels in train_loader:
			images, labels = images.to(device), labels.to(device)
			optimizer.zero_grad()
			outputs = model(images)
			loss = criterion(outputs, labels)
			loss.backward()
			optimizer.step()
			train_loss += loss.item() * images.size(0)

		model.eval()
		correct, total = 0, 0
		with torch.no_grad():
			for images, labels in val_loader:
				images, labels = images.to(device), labels.to(device)
				outputs = model(images)
				_, preds = torch.max(outputs, 1)
				correct += (preds == labels).sum().item()
				total += labels.size(0)
		val_acc = correct / total if total else 0
		print(f"Epoch {epoch+1}/{epochs} - val_acc: {val_acc:.4f}")
		if val_acc > best_acc:
			best_acc = val_acc
			os.makedirs(os.path.dirname(out_path), exist_ok=True)
			torch.save({'state_dict': model.state_dict(), 'classes': classes}, out_path)
	print(f"Best val_acc: {best_acc:.4f}")


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--data_dir', required=True, help='Root folder with train/ and val/ subfolders')
	parser.add_argument('--epochs', type=int, default=5)
	parser.add_argument('--batch_size', type=int, default=16)
	parser.add_argument('--lr', type=float, default=1e-3)
	parser.add_argument('--out', type=str, default='ml/models/elephant_tiger.pth')
	args = parser.parse_args()

	device = 'cuda' if torch.cuda.is_available() else 'cpu'
	loaders = get_dataloaders(args.data_dir, args.batch_size)
	_, _, classes = loaders
	assert set(classes) == {'elephant', 'tiger'}, "Datasets must have classes 'elephant' and 'tiger'"

	model = build_model(num_classes=len(classes))
	train(model, loaders, args.epochs, args.lr, device, args.out)


if __name__ == '__main__':
	main()
