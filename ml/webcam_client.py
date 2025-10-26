import os
import time
import json
from dataclasses import dataclass
from typing import List

import cv2
import numpy as np
import torch
from torchvision import transforms, models
import requests

BACKEND_URL = os.getenv('ML_BACKEND_URL', 'http://localhost:5000')
AUTH_TOKEN = os.getenv('ML_AUTH_TOKEN', '')
PROPERTY_ID = os.getenv('ML_PROPERTY_ID', '')
THRESHOLD = float(os.getenv('ML_THRESHOLD', '0.80'))
MODEL_PATH = os.getenv('ML_MODEL', 'ml/models/elephant_tiger.pth')
USE_IMAGENET_FALLBACK = os.getenv('ML_IMAGENET_FALLBACK', '1') == '1'

@dataclass
class Detection:
	label: str
	probability: float

def load_model(model_path: str):
    if os.path.exists(model_path):
        ckpt = torch.load(model_path, map_location='cpu')
        classes: List[str] = ckpt['classes']
        model = models.mobilenet_v3_small(weights=None)
        in_features = model.classifier[3].in_features
        model.classifier[3] = torch.nn.Linear(in_features, len(classes))
        model.load_state_dict(ckpt['state_dict'])
        model.eval()
        return model, classes, False
    # Fallback to ImageNet weights (no local dataset needed)
    weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = models.mobilenet_v3_small(weights=weights)
    model.eval()
    classes: List[str] = list(weights.meta.get('categories', []))
    return model, classes, True


def predict(model, x: np.ndarray, classes: List[str], imagenet_mode: bool) -> Detection:
	transform = transforms.Compose([
		transforms.ToTensor(),
		transforms.Resize((224, 224)),
		transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
	])
	t = transform(x).unsqueeze(0)
	with torch.no_grad():
		logits = model(t)
		probs = torch.softmax(logits, dim=1).squeeze(0).numpy()

		if imagenet_mode:
			# Restrict to elephant/tiger indices found in ImageNet categories
			tiger_idxs = [i for i, c in enumerate(classes) if 'tiger' in c.lower()]
			elephant_idxs = [i for i, c in enumerate(classes) if 'elephant' in c.lower() or 'tusker' in c.lower()]
			keep = tiger_idxs + elephant_idxs
			if not keep:
				i = int(np.argmax(probs))
				return Detection(label=classes[i], probability=float(probs[i]))
			sub = probs[keep]
			j = int(np.argmax(sub))
			i = keep[j]
			# Map label to canonical 'tiger' or 'elephant'
			label_lower = classes[i].lower()
			canonical = 'tiger' if 'tiger' in label_lower else 'elephant'
			return Detection(label=canonical, probability=float(probs[i]))
		else:
			i = int(np.argmax(probs))
			return Detection(label=classes[i], probability=float(probs[i]))


def post_detection(d: Detection):
	headers = {'Authorization': f'Bearer {AUTH_TOKEN}', 'Content-Type': 'application/json'}
	payload = {
		'label': d.label,
		'probability': d.probability,
		'source': 'video',
		'propertyId': PROPERTY_ID,
		'detectedAt': int(time.time()*1000)
	}
	r = requests.post(f"{BACKEND_URL}/api/detections", headers=headers, data=json.dumps(payload), timeout=10)
	r.raise_for_status()
	return r.json()


def main():
	model, classes, imagenet_mode = load_model(MODEL_PATH)
	if not imagenet_mode:
		assert set(classes) == {'elephant', 'tiger'}, 'Model classes must be elephant and tiger'
	cap = cv2.VideoCapture(0)
	if not cap.isOpened():
		raise RuntimeError('Could not open webcam')
	print('Webcam opened. Press q to quit.')

	last_post = 0
	cooldown = 5.0  # seconds between posts
	while True:
		ret, frame = cap.read()
		if not ret:
			break
		# BGR to RGB
		rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
		d = predict(model, rgb, classes, imagenet_mode)
		label_text = f"{d.label} {d.probability:.2f}"
		color = (0, 0, 255) if d.label == 'tiger' else (255, 0, 0)
		cv2.putText(frame, label_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
		cv2.imshow('SADS Animal Detection', frame)
		
		if d.probability >= THRESHOLD and (time.time() - last_post) > cooldown:
			try:
				resp = post_detection(d)
				print('Posted detection:', resp)
				last_post = time.time()
			except Exception as e:
				print('Failed to post detection:', e)

		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

	cap.release()
	cv2.destroyAllWindows()

if __name__ == '__main__':
	main()
