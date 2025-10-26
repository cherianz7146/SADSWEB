import os
import cv2
from pathlib import Path

# Usage:
#   python ml/capture_images.py
# Keys:
#   e - save current frame as elephant
#   t - save current frame as tiger
#   q - quit
# Images are saved under ml/manual_dataset/raw/{elephant|tiger}/img_XXXX.jpg

RAW_ROOT = Path('ml/manual_dataset/raw')


def ensure_dirs():
	(RAW_ROOT / 'elephant').mkdir(parents=True, exist_ok=True)
	(RAW_ROOT / 'tiger').mkdir(parents=True, exist_ok=True)


def next_index(dir_path: Path) -> int:
	existing = list(dir_path.glob('img_*.jpg'))
	return len(existing)


def main():
	ensure_dirs()
	cap = cv2.VideoCapture(0)
	if not cap.isOpened():
		raise RuntimeError('Could not open webcam')
	print('Press e to save ELEPHANT frame, t for TIGER, q to quit')
	while True:
		ok, frame = cap.read()
		if not ok:
			break
		cv2.imshow('Capture Elephant/Tiger Dataset', frame)
		key = cv2.waitKey(1) & 0xFF
		if key == ord('e'):
			idx = next_index(RAW_ROOT / 'elephant')
			out = (RAW_ROOT / 'elephant' / f'img_{idx:04d}.jpg')
			cv2.imwrite(str(out), frame)
			print(f'Saved {out}')
		elif key == ord('t'):
			idx = next_index(RAW_ROOT / 'tiger')
			out = (RAW_ROOT / 'tiger' / f'img_{idx:04d}.jpg')
			cv2.imwrite(str(out), frame)
			print(f'Saved {out}')
		elif key == ord('q'):
			break
	cap.release()
	cv2.destroyAllWindows()

if __name__ == '__main__':
	main()








