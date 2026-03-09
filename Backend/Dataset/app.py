from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

BUNDLE_PATH = "cinnamon_quality_bundle.joblib"

bundle = joblib.load(BUNDLE_PATH)
model = bundle["model"]
scaler = bundle["scaler"]
FEATURES = bundle["features"]
CLASS_MAP = bundle.get("class_map", {0:"Optimal", 1:"High Risk", 2:"Warning"})

app = FastAPI(title="Cinnamon Quality Guard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    temperature_c: float
    humidity_percent: float
    moisture_level: float
    air_quality_adc: float
    co2_ppm: float
    light_level: float
    motion_detected: int
    voc_ppb: float

def explain_rule(req: PredictRequest):
    # same rules as Colab (for readable output)
    temp, hum, moist, airq, co2, light, motion, voc = (
        req.temperature_c, req.humidity_percent, req.moisture_level,
        req.air_quality_adc, req.co2_ppm, req.light_level, req.motion_detected, req.voc_ppb
    )

    if temp > 25:
        return "High Temperature", "Risk of degradation; color may darken.", "Increase ventilation and cooling."
    if hum > 85:
        return "High Humidity", "Risk of mold growth.", "Activate dehumidifiers."
    if moist > 55:
        return "High Moisture Level", "Risk of cinnamon spoilage.", "Investigate leaks and dry the area."
    if co2 > 800 or voc > 400:
        return "Poor Air Quality", "Risk of contamination or poor ventilation.", "Improve airflow and check air filters."
    if light > 150:
        return "Unexpected Light Level", "Risk of bleaching; color may fade.", "Cover stock with opaque sheets."
    if motion == 1:
        return "Motion Detected", "Risk of pests or unauthorized access.", "Inspect the warehouse immediately."

    if temp < 20:
        return "Low Temperature", "Risk of condensation during fluctuation.", "Stabilize temperature and improve insulation."
    if hum < 60:
        return "Low Humidity", "Risk of over-drying and aroma loss.", "Reduce dehumidifier usage."
    if moist < 45:
        return "Low Moisture Level", "Risk of excessive dryness and weight loss.", "Balance humidity levels."
    if light < 20:
        return "Very Low Light Level", "Risk of hidden defects during inspection.", "Enable controlled inspection lighting."

    return "Optimal", "Stable; Color and Aroma preserved.", "No action required."

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    row = {f: getattr(req, f) for f in FEATURES}
    X = pd.DataFrame([row], columns=FEATURES)
    Xs = scaler.transform(X)
    pred = int(model.predict(Xs)[0])

    risk_type, consequence, action_plan = explain_rule(req)

    return {
        "risk_status": pred,
        "risk_label": CLASS_MAP.get(pred, str(pred)),
        "risk_type": risk_type,
        "consequence": consequence,
        "action_plan": action_plan
    }
