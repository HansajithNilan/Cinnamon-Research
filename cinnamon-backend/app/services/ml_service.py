import cv2
import numpy as np
from ultralytics import YOLO
from app.utils.helpers import encode_image_to_base64, decode_image_from_bytes

DISEASE_CONFIG = {
    "Healthy": {"rate": (1.0, 1.0), "display": "Healthy Leaf", "advice": "Plant is healthy. No treatment needed."},
    "Acrocercops": {"rate": (1.1, 1.25), "display": "Acrocercops spp", "advice": "Leaf Miner detected. Prune infected leaves."},
    "Sooty": {"rate": (1.05, 1.15), "display": "Black Sooty Mold", "advice": "Fungal infection. Check for insects and wash leaves."},
    "Colletotrichum": {"rate": (1.3, 1.5), "display": "Colletotrichum gloeosporioides", "advice": "Severe Blight. Apply fungicide immediately."}
}

# Vacant Area Detection Constants
METERS_PER_PIXEL = 0.02
ROW_SPACING_M = 1.2
PLANT_SPACING_M = 0.9
TREE_AREA_SQM = ROW_SPACING_M * PLANT_SPACING_M  # 1.08 sqm
YIELD_PER_TREE_KG = 0.5

try:
    model = YOLO("ml_models/best.pt")
    print("YOLO Model Loaded Successfully!")
except Exception as e:
    print(f"Error Loading YOLO Model: {e}")
    model = None

try:
    vacant_model = YOLO("ml_models/vecant.pt")
    print("Vacant Area Segmentation Model Loaded Successfully!")
except Exception as e:
    print(f"Error Loading Vacant Area YOLO Model: {e}")
    vacant_model = None

def predict_spread(severity, disease_key):
    timeline = {1: 0.0, 3: 0.0, 7: 0.0}
    if disease_key == "Healthy":
        return timeline
    props = DISEASE_CONFIG.get(disease_key, DISEASE_CONFIG["Healthy"])
    avg_rate = (props['rate'][0] + props['rate'][1]) / 2
    r = avg_rate - 1.0
    current_severity = severity
    for day in range(1, 8):
        change = r * current_severity * (1 - (current_severity / 100.0))
        current_severity += change
        current_severity = max(0, min(100, current_severity))
        if day == 1: timeline[1] = current_severity
        elif day == 3: timeline[3] = current_severity
        elif day == 7: timeline[7] = current_severity
    return timeline

def analyze_leaf_image(image_bytes):
    if model is None:
        return {"error": "Model not loaded properly."}
    img = decode_image_from_bytes(image_bytes)
    if img is None:
        return {"error": "Invalid image format."}
    results = model.predict(img, save=False, conf=0.30, verbose=False)
    
    res_img = img.copy()
    h, w = img.shape[:2]
    total_pixels = h * w
    

    overlay = np.zeros_like(img, dtype=np.uint8)
    severity_mask = np.zeros((h, w), dtype=np.uint8)
    
    detected_key = "Healthy"
    max_severity = 0.0
    
    if results and len(results[0].boxes) > 0:
        result = results[0]
        for i, box in enumerate(result.boxes):
            cls_id = int(box.cls[0])
            model_cls_name = model.names[cls_id]
            
            matched_key = "Healthy"
            if "Acrocercops" in model_cls_name: matched_key = "Acrocercops"
            elif "Sooty" in model_cls_name or "Mold" in model_cls_name: matched_key = "Sooty"
            elif "Colletotrichum" in model_cls_name or "Gloeosporioides" in model_cls_name: matched_key = "Colletotrichum"
            
            if matched_key != "Healthy":
                detected_key = matched_key
                
                if result.masks is not None and len(result.masks.xy) > i:
                    mask_pts = result.masks.xy[i]
                    if len(mask_pts) > 0:
                        pts = np.array(mask_pts, np.int32).reshape((-1, 1, 2))
                        cv2.fillPoly(overlay, [pts], (0, 0, 255))
                        cv2.fillPoly(severity_mask, [pts], 255)
                        cv2.polylines(res_img, [pts], True, (0, 0, 255), 1)
                else:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(res_img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.rectangle(severity_mask, (x1, y1), (x2, y2), 255, -1)
                    
   
    if np.any(severity_mask > 0):
        mask_bool = severity_mask > 0
        res_img[mask_bool] = cv2.addWeighted(res_img, 0.7, overlay, 0.3, 0)[mask_bool]
        
    if detected_key != "Healthy":
        infected_pixels = cv2.countNonZero(severity_mask)
        max_severity = (infected_pixels / total_pixels) * 100 if infected_pixels > 0 else 0.0
        
    base64_img = encode_image_to_base64(res_img)
    risk_status = "Safe"
    if detected_key != "Healthy":
        if max_severity <= 10: risk_status = "Low Risk"
        elif max_severity <= 25: risk_status = "High Risk"
        else: risk_status = "Critical Risk"
        
    details = DISEASE_CONFIG.get(detected_key, DISEASE_CONFIG["Healthy"])
    forecast = predict_spread(max_severity, detected_key)
    
    return {
        "disease": details["display"],
        "severity": round(max_severity, 2),
        "risk_status": risk_status,
        "advice": details["advice"],
        "forecast": {"day_1": round(forecast.get(1, 0.0), 2), "day_3": round(forecast.get(3, 0.0), 2), "day_7": round(forecast.get(7, 0.0), 2)},
        "processed_image_base64": f"data:image/jpeg;base64,{base64_img}"
    }

def analyze_vacant_area(image_bytes):
    if vacant_model is None:
        return {
            "status": "error",
            "message": "Vacant model not loaded properly."
        }

    img = decode_image_from_bytes(image_bytes)
    if img is None:
        return {
            "status": "error",
            "message": "Invalid image format."
        }

    h, w = img.shape[:2]
    total_pixels = h * w

    results = vacant_model.predict(img, save=False, conf=0.15, verbose=False)
    r = results[0]

    has_boxes = r.boxes is not None and len(r.boxes) > 0
    has_masks = r.masks is not None and r.masks.data is not None and len(r.masks.data) > 0

    if not has_masks and not has_boxes:
        return {
            "status": "invalid",
            "message": "No vacant land detected in the uploaded image.",
            "data": None
        }

    combined_mask = np.zeros((h, w), dtype=np.uint8)

    if has_masks:
        for mask_tensor in r.masks.data:
            mask = mask_tensor.cpu().numpy()
            mask = (mask > 0.5).astype(np.uint8) * 255
            mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
            combined_mask = np.maximum(combined_mask, mask)

    elif has_boxes:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(combined_mask, (x1, y1), (x2, y2), 255, -1)

    vacant_pixels = int(cv2.countNonZero(combined_mask))

    if vacant_pixels == 0:
        return {
            "status": "invalid",
            "message": "Model prediction did not produce a usable vacant-area mask.",
            "data": None
        }

    pixel_area_sqm = METERS_PER_PIXEL ** 2
    vacant_area_sqm = vacant_pixels * pixel_area_sqm
    required_plants = int(np.floor(vacant_area_sqm / TREE_AREA_SQM))
    yield_forecast = required_plants * YIELD_PER_TREE_KG
    estimated_cost = required_plants * 120
    vacant_percentage = (vacant_pixels / total_pixels) * 100

    # red mask overlay
    res_img = img.copy()
    overlay = img.copy()
    overlay[combined_mask > 0] = [0, 0, 255]  # Red in BGR
    res_img = cv2.addWeighted(res_img, 0.7, overlay, 0.3, 0)

    base64_img = encode_image_to_base64(res_img)

    return {
        "status": "success",
        "message": "Vacant area detected successfully.",
        "data": {
            "vacant_pixels": vacant_pixels,
            "vacant_percentage": round(vacant_percentage, 2),
            "vacant_area_sqm": round(vacant_area_sqm, 2),
            "required_plants": required_plants,
            "estimated_cost": round(estimated_cost, 2),
            "yield_forecast": round(yield_forecast, 2),
            "spacing_m": f"{ROW_SPACING_M}m x {PLANT_SPACING_M}m",
            "tree_area_sqm": round(TREE_AREA_SQM, 2),
            "processed_image_base64": f"data:image/jpeg;base64,{base64_img}"
        }
    }
