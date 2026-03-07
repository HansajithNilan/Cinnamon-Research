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
    img = decode_image_from_bytes(image_bytes)
    if img is None:
        return {"error": "Invalid image format."}
    
    h, w = img.shape[:2]
    total_pixels = h * w
    
    # 1. Convert to HSV for brown area detection
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 2. Define brown color range (bare soil)
    lower_brown = np.array([10, 50, 50])
    upper_brown = np.array([30, 255, 255])
    mask = cv2.inRange(img_hsv, lower_brown, upper_brown)

    # 3. Morphological operations to clean the mask
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, kernel)

    # 4. Count distinct vacant spots using contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # Filter small contours (noise)
    min_area = 100 
    valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
    vacant_count = len(valid_contours)

    # 5. Count vacant pixels and calculate area
    vacant_pixels = int(cv2.countNonZero(mask))
    pixel_area_sqm = (METERS_PER_PIXEL ** 2)
    vacant_area_sqm = vacant_pixels * pixel_area_sqm

    # 6. Calculate new trees and forecasted yield
    new_trees = int(np.floor(vacant_area_sqm / TREE_AREA_SQM))
    forecast_yield = new_trees * YIELD_PER_TREE_KG
    
    # 7. Calculate vacant percentage
    vacant_percentage = (vacant_pixels / total_pixels) * 100

    # 8. Create visualization overlay (Red mask for vacant areas)
    res_img = img.copy()
    overlay = res_img.copy()
    overlay[mask > 0] = [0, 0, 255]  # Red in BGR (since img is BGR from decode_image_from_bytes)
    res_img = cv2.addWeighted(res_img, 0.7, overlay, 0.3, 0)

    base64_img = encode_image_to_base64(res_img)
    
    return {
        "vacant_count": vacant_count,
        "vacant_pixels": vacant_pixels,
        "vacant_percentage": round(vacant_percentage, 2),
        "vacant_area_sqm": round(vacant_area_sqm, 2),
        "required_plants": new_trees,
        "estimated_cost": round(new_trees * 120, 2),
        "yield_forecast": round(forecast_yield, 2),
        "processed_image_base64": f"data:image/jpeg;base64,{base64_img}"
    }
