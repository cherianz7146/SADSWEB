"""
SADS YOLO Detection API
Flask-based API for high-accuracy elephant and tiger detection using YOLOv8
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2
import uuid
from collections import Counter
import tempfile
import logging
from datetime import datetime
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Configuration
# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Try to use custom-trained model first (supports tiger and elephant)
# Fall back to COCO model if custom model not available
CUSTOM_MODEL_PATH = os.path.join(SCRIPT_DIR, 'elephant_tiger_custom.pt')
COCO_MODEL_PATH = os.path.join(SCRIPT_DIR, 'yolov8s.pt')

# Check if custom model exists, otherwise use COCO
if os.path.exists(CUSTOM_MODEL_PATH):
    MODEL_PATH = os.environ.get('YOLO_MODEL_PATH', CUSTOM_MODEL_PATH)
    USING_CUSTOM_MODEL = True
else:
    MODEL_PATH = os.environ.get('YOLO_MODEL_PATH', COCO_MODEL_PATH)
    USING_CUSTOM_MODEL = False
OUTPUT_DIR = os.environ.get('YOLO_OUTPUT_DIR', os.path.join(SCRIPT_DIR, 'runs', 'detect', 'api'))
CONFIDENCE_THRESHOLD = float(os.environ.get('YOLO_CONFIDENCE', '0.25'))  # 25% confidence threshold (lowered for better detection)
PORT = int(os.environ.get('YOLO_PORT', '5001'))

# Load model once at startup
model = None

# Ensure OUTPUT_DIR exists
try:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    logger.info(f"Output directory ready: {OUTPUT_DIR}")
except Exception as e:
    logger.warning(f"⚠️  Could not create output directory {OUTPUT_DIR}: {e}")

# Load YOLO model (custom-trained or COCO)
logger.info(f"Loading YOLO model from {MODEL_PATH}...")
if not os.path.exists(MODEL_PATH):
    logger.warning(f"⚠️  Model not found at {MODEL_PATH}")
    if USING_CUSTOM_MODEL:
        logger.warning("   Custom model not found. Falling back to COCO model...")
        logger.warning("   To train custom model, run: python train_yolo_custom.py")
        MODEL_PATH = COCO_MODEL_PATH
        USING_CUSTOM_MODEL = False
    else:
        logger.info("   YOLO will download COCO model automatically on first use...")
try:
    model = YOLO(MODEL_PATH)
    logger.info("✅ YOLO model loaded successfully!")
    if USING_CUSTOM_MODEL:
        # Check if it's a classification or detection model
        is_classification = hasattr(model, 'task') and model.task == 'classify'
        if not is_classification:
            # Also check model path for classification indicators
            is_classification = 'cls' in MODEL_PATH.lower() or '-cls' in MODEL_PATH.lower()
        if is_classification:
            logger.info("   Using CUSTOM-TRAINED CLASSIFICATION model (elephant_tiger_custom.pt)")
            logger.info("   Supports: elephant, tiger (trained on your dataset)")
            logger.info("   Mode: Image classification (identifies entire image as elephant or tiger)")
        else:
            logger.info("   Using CUSTOM-TRAINED DETECTION model (elephant_tiger_custom.pt)")
            logger.info("   Supports: elephant, tiger (trained on your dataset)")
            logger.info("   Mode: Object detection (finds and locates animals in image)")
    else:
        logger.info("   Using standard YOLOv8s model (COCO dataset)")
        logger.warning("   ⚠️  WARNING: COCO model does NOT support 'tiger' class!")
        logger.warning("   ⚠️  Tiger images may be detected as 'person' or 'cat'")
        logger.info("   Supports: elephant, bear, zebra, giraffe, horse, cow, sheep, dog, cat, bird, lion, leopard, and more")
        logger.info("   To enable tiger detection, train custom model: python train_yolo_custom.py")
except Exception as e:
    logger.error(f"❌ Failed to load YOLO model: {e}")
    logger.error("   No model available! Detection will not work.")
    logger.error("   Please ensure YOLO dependencies are installed: pip install ultralytics")
    model = None

# Target animals for SADS (all supported by COCO pre-trained model)
TARGET_ANIMALS = ['elephant', 'tiger', 'bear', 'zebra', 'giraffe', 'horse', 'cow', 'sheep', 'dog', 'cat', 'bird', 'lion', 'leopard', 'wild boar', 'deer', 'wolf']


def detect_image(source_path, imgsz=640, conf=CONFIDENCE_THRESHOLD, save_images=True):
    """
    Run YOLO detection on an image and return detailed results.
    Supports both object detection and classification models.
    
    Args:
        source_path: Path to image file
        imgsz: Input image size (default 640)
        conf: Confidence threshold (default from env)
        save_images: Whether to save annotated images
        
    Returns:
        dict with detection results including counts, bboxes, and annotated images
    """
    if model is None:
        raise RuntimeError("YOLO model not loaded")
    
    if save_images:
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load original image
    img = cv2.imread(source_path)
    if img is None:
        raise FileNotFoundError(f"Input image not found: {source_path}")
    
    img_height, img_width = img.shape[:2]

    # Check if model is classification or detection
    is_classification = hasattr(model, 'task') and model.task == 'classify'
    if not is_classification:
        # Try to detect from model path
        is_classification = 'cls' in MODEL_PATH.lower() or '-cls' in MODEL_PATH.lower()

    # Run YOLO prediction
    logger.info(f"Running {'classification' if is_classification else 'detection'} on {source_path} with conf={conf}, imgsz={imgsz}")
    
    if is_classification:
        # Classification model - classify entire image
        results = model.predict(source=source_path, imgsz=224, verbose=False)  # Classification uses 224
        res = results[0]
        
        # Get class names
        class_names = model.names if hasattr(model, 'names') else {}
        
        # Log available class names for debugging
        if not hasattr(detect_image, '_logged_class_names'):
            logger.info(f"Classification model class names: {list(class_names.values())}")
            detect_image._logged_class_names = True
        
        # Extract classification results
        detected_info = []
        if hasattr(res, 'probs') and res.probs is not None:
            # Get top prediction
            top1_idx = int(res.probs.top1)
            top1_conf = float(res.probs.top1conf)
            top1_name = class_names.get(top1_idx, f"class_{top1_idx}")
            
            # Normalize class name (handle case variations)
            # Map common variations to standard names
            top1_name_lower = top1_name.lower()
            if 'elephant' in top1_name_lower:
                top1_name = 'elephant'
            elif 'tiger' in top1_name_lower:
                top1_name = 'tiger'
            elif 'cat' in top1_name_lower and 'tiger' not in top1_name_lower:
                # Only map to 'tiger' if it's not already 'tiger'
                # For classification models trained on elephant/tiger, 'cat' might be tiger
                if 'tiger' in str(class_names.values()).lower():
                    top1_name = 'tiger'
            
            # Always include classification result (threshold filtering happens later)
            # This ensures we capture all potential detections
            detected_info.append({
                'name': top1_name,
                'class_id': top1_idx,
                'confidence': round(top1_conf * 100, 2),
                'conf': round(top1_conf, 4),
                'bbox': [0, 0, img_width, img_height]  # Full image
            })
            logger.info(f"  → Classification: {top1_name} (confidence: {top1_conf*100:.2f}%, threshold: {conf*100:.2f}%)")
            
            # Also log top 3 predictions for debugging
            if hasattr(res.probs, 'top5'):
                top5_indices = res.probs.top5.cpu().numpy() if hasattr(res.probs.top5, 'cpu') else res.probs.top5
                top5_confs = res.probs.top5conf.cpu().numpy() if hasattr(res.probs.top5conf, 'cpu') else res.probs.top5conf
                logger.info(f"  → Top 3 predictions:")
                for i, (idx, conf_val) in enumerate(zip(top5_indices[:3], top5_confs[:3])):
                    name = class_names.get(int(idx), f"class_{idx}")
                    logger.info(f"     {i+1}. {name}: {conf_val*100:.2f}%")
        else:
            logger.warning("  ⚠️  No classification results found")
    else:
        # Detection model - find objects with bounding boxes
        results = model.predict(source=source_path, imgsz=imgsz, conf=conf, verbose=False)
        res = results[0]
        logger.info(f"YOLO prediction completed. Found {len(res.boxes)} detection boxes (after confidence threshold {conf})")

        # Get class names
        class_names = model.names if hasattr(model, 'names') else {}
        
        # Log available class names for debugging (first time only)
        if not hasattr(detect_image, '_logged_classes'):
            logger.info(f"YOLO model class names (first 20): {list(class_names.values())[:20]}")
            logger.info(f"Looking for 'tiger' in class names: {'tiger' in [n.lower() for n in class_names.values()]}")
            detect_image._logged_classes = True
        
        # Extract detection information
        detected_info = []
        logger.info(f"Processing {len(res.boxes)} detection boxes from YOLO")
        for det in res.boxes:
            cls_id = int(det.cls[0]) if hasattr(det, 'cls') else int(det[5])
            name = class_names.get(cls_id, str(cls_id)) if isinstance(class_names, dict) else class_names[cls_id]
            score = float(det.conf[0]) if hasattr(det, 'conf') else float(det[4])
            xyxy = det.xyxy[0].tolist() if hasattr(det, 'xyxy') else [float(det[0]), float(det[1]), float(det[2]), float(det[3])]
            
            # Log each detection for debugging
            logger.info(f"  → Detection: {name} (class_id: {cls_id}, confidence: {score:.4f}, threshold used: {conf})")
            
            detected_info.append({
                'name': name,
                'class_id': cls_id,
                'confidence': round(score * 100, 2),  # Convert to percentage
                'conf': round(score, 4),
                'bbox': [int(x) for x in xyxy]
            })

    # Count detections by class
    name_counts = Counter([d['name'] for d in detected_info])
    
    # Log all detections for debugging
    if len(detected_info) > 0:
        detection_names = [f"{d['name']} ({d['confidence']}%)" for d in detected_info]
        logger.info(f"✅ All detections found: {detection_names}")
        logger.info(f"   Detection confidences: {[d['confidence'] for d in detected_info]}")
    else:
        logger.warning(f"⚠️ No detections found with confidence threshold {conf}")
        logger.warning(f"   This could mean:")
        logger.warning(f"   1. No objects in the image")
        logger.warning(f"   2. Confidence threshold ({conf}) is too high")
        logger.warning(f"   3. Image quality is too low")
        logger.warning(f"   Try lowering the confidence threshold or improving image quality")
    
    # Filter for target animals with minimum confidence requirements
    # For classification models, accept all detections (they're already trained for elephant/tiger)
    # For detection models, filter by TARGET_ANIMALS
    MIN_CONFIDENCE_FOR_ANIMALS = 0.5 if is_classification else 0.6  # Increased to reduce false positives (50-60% minimum)
    
    if is_classification:
        # Classification models are trained specifically for elephant/tiger
        # Accept all detections that meet confidence threshold
        animal_detections = [
            d for d in detected_info 
            if d['conf'] >= MIN_CONFIDENCE_FOR_ANIMALS
        ]
        logger.info(f"Classification model: Accepting all {len(animal_detections)} detections above {MIN_CONFIDENCE_FOR_ANIMALS*100:.1f}% threshold")
    else:
        # Detection models: filter by target animals
        animal_detections = [
            d for d in detected_info 
            if d['name'].lower() in [a.lower() for a in TARGET_ANIMALS] 
            and d['conf'] >= MIN_CONFIDENCE_FOR_ANIMALS
        ]
        logger.info(f"Detection model: Found {len(animal_detections)} animal detections from {len(detected_info)} total")
    
    # Count specific animals (use lower threshold for counting)
    COUNT_THRESHOLD = 0.25  # Even lower threshold for counting
    elephant_count = sum(1 for d in detected_info if 'elephant' in d['name'].lower() and d['conf'] >= COUNT_THRESHOLD)
    tiger_count = sum(1 for d in detected_info if ('tiger' in d['name'].lower() or 'cat' in d['name'].lower()) and d['conf'] >= COUNT_THRESHOLD)
    
    # Log tiger-specific detection
    if tiger_count > 0:
        logger.info(f"✅ TIGER DETECTED! Count: {tiger_count}")
        tigers = [d for d in detected_info if 'tiger' in d['name'].lower()]
        for tiger in tigers:
            logger.info(f"   Tiger confidence: {tiger['confidence']}%")
    
    # Create annotated images
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    
    # 1. All detections image (blue boxes)
    img_all = img.copy()
    for d in detected_info:
        x1, y1, x2, y2 = d['bbox']
        label = f"{d['name']}:{d['conf']:.2f}"
        cv2.rectangle(img_all, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img_all, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    annotated_all_path = None
    annotated_all_base64 = None
    if save_images:
        annotated_all_path = os.path.join(OUTPUT_DIR, f"all_{timestamp}_{unique_id}.jpg")
        cv2.imwrite(annotated_all_path, img_all)
        # Convert to base64 for easy transmission
        _, buffer = cv2.imencode('.jpg', img_all)
        annotated_all_base64 = base64.b64encode(buffer).decode('utf-8')

    # 2. Elephant-only image (green boxes)
    img_ele = img.copy()
    for d in detected_info:
        if 'elephant' in d['name'].lower():
            x1, y1, x2, y2 = d['bbox']
            label = f"ELEPHANT:{d['conf']:.2f}"
            cv2.rectangle(img_ele, (x1, y1), (x2, y2), (0, 255, 0), 3)
            cv2.putText(img_ele, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    annotated_elephant_path = None
    annotated_elephant_base64 = None
    if save_images and elephant_count > 0:
        annotated_elephant_path = os.path.join(OUTPUT_DIR, f"elephant_{timestamp}_{unique_id}.jpg")
        cv2.imwrite(annotated_elephant_path, img_ele)
        _, buffer = cv2.imencode('.jpg', img_ele)
        annotated_elephant_base64 = base64.b64encode(buffer).decode('utf-8')

    # 3. Tiger/Cat-only image (red boxes)
    img_tiger = img.copy()
    for d in detected_info:
        if 'tiger' in d['name'].lower() or 'cat' in d['name'].lower():
            x1, y1, x2, y2 = d['bbox']
            label = f"TIGER/CAT:{d['conf']:.2f}"
            cv2.rectangle(img_tiger, (x1, y1), (x2, y2), (0, 0, 255), 3)
            cv2.putText(img_tiger, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    annotated_tiger_path = None
    annotated_tiger_base64 = None
    if save_images and tiger_count > 0:
        annotated_tiger_path = os.path.join(OUTPUT_DIR, f"tiger_{timestamp}_{unique_id}.jpg")
        cv2.imwrite(annotated_tiger_path, img_tiger)
        _, buffer = cv2.imencode('.jpg', img_tiger)
        annotated_tiger_base64 = base64.b64encode(buffer).decode('utf-8')

    logger.info(f"Detection complete: {len(detected_info)} objects, {len(animal_detections)} animal detections, {elephant_count} elephants, {tiger_count} tigers/cats")
    
    # Always return all detections in 'detections' array (frontend expects this)
    # 'animal_detections' contains filtered results for target animals
    # This ensures frontend always gets results even if filtering is strict
    return {
        'success': True,
        'timestamp': timestamp,
        'total_detections': len(detected_info),
        'counts': dict(name_counts),
        'detections': detected_info,  # All detections (for frontend display)
        'animal_detections': animal_detections,  # Filtered for target animals only
        'elephant_count': elephant_count,
        'tiger_count': tiger_count,
        'annotated_all': annotated_all_path,
        'annotated_elephant': annotated_elephant_path,
        'annotated_tiger': annotated_tiger_path,
        'images': {
            'all': annotated_all_base64,
            'elephant': annotated_elephant_base64,
            'tiger': annotated_tiger_base64
        }
    }


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'confidence_threshold': CONFIDENCE_THRESHOLD,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/detect', methods=['POST'])
def detect_endpoint():
    """
    Main detection endpoint.
    Accepts multipart/form-data with 'image' field.
    Query params:
        - save: true/false (default true) - save annotated images
        - conf: float (default env) - confidence threshold
    """
    if model is None:
        return jsonify({'success': False, 'error': 'YOLO model not loaded'}), 500

    # Check for image file
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided. Use form field "image"'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400

    # Get query parameters
    save_param = request.args.get('save', 'true').lower()
    save_images = save_param not in ('0', 'false', 'no')
    
    conf = float(request.args.get('conf', CONFIDENCE_THRESHOLD))
    if not (0.0 <= conf <= 1.0):
        return jsonify({'success': False, 'error': 'Confidence must be between 0 and 1'}), 400

    # Save uploaded file to temporary location
    tmp_dir = tempfile.gettempdir()
    tmp_name = os.path.join(tmp_dir, f"sads_upload_{uuid.uuid4().hex}_{file.filename}")
    
    try:
        file.save(tmp_name)
        logger.info(f"Saved uploaded file to {tmp_name}")
        
        # Run detection
        result = detect_image(tmp_name, conf=conf, save_images=save_images)
        
        # Clean up temp file
        os.remove(tmp_name)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Detection error: {e}")
        # Clean up temp file on error
        if os.path.exists(tmp_name):
            os.remove(tmp_name)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/detect/base64', methods=['POST'])
def detect_base64():
    """
    Detection endpoint that accepts base64 encoded images.
    Useful for browser integration.
    
    Request body (JSON):
    {
        "image": "base64_encoded_image_string",
        "conf": 0.5  // optional
    }
    """
    if model is None:
        return jsonify({'success': False, 'error': 'YOLO model not loaded'}), 500

    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'No image data provided'}), 400

        # Decode base64 image
        image_data = data['image']
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Save to temp file
        tmp_dir = tempfile.gettempdir()
        tmp_name = os.path.join(tmp_dir, f"sads_b64_{uuid.uuid4().hex}.jpg")
        
        with open(tmp_name, 'wb') as f:
            f.write(image_bytes)
        
        # Get confidence
        conf = float(data.get('conf', CONFIDENCE_THRESHOLD))
        
        # Run detection
        result = detect_image(tmp_name, conf=conf, save_images=True)
        
        # Clean up
        os.remove(tmp_name)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Base64 detection error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/image/<path:filename>', methods=['GET'])
def get_image(filename):
    """Serve annotated images"""
    try:
        image_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(image_path):
            return send_file(image_path, mimetype='image/jpeg')
        else:
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/stats', methods=['GET'])
def stats():
    """Get API statistics"""
    try:
        # Count saved images
        total_images = 0
        if os.path.exists(OUTPUT_DIR):
            total_images = len([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.jpg')])
        
        return jsonify({
            'total_saved_images': total_images,
            'output_directory': OUTPUT_DIR,
            'model_loaded': model is not None,
            'target_animals': TARGET_ANIMALS
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logger.info(f"Starting SADS YOLO API on port {PORT}")
    logger.info(f"Model: {MODEL_PATH}")
    logger.info(f"Confidence threshold: {CONFIDENCE_THRESHOLD}")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,  # Set to False for production
        threaded=True  # Handle multiple requests
    )







