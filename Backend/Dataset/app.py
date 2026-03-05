from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np

BUNDLE_PATH = "smartcinnamon_bundle.joblib"

# Load bundle once at startup
bundle = joblib.load(BUNDLE_PATH)
models = bundle["models"]
le_stage = bundle["le_stage"]
le_soil = bundle["le_soil"]
FEATURES = bundle["features"]
PLANTS_PER_PERCH = bundle.get("plants_per_perch", 17)

app = FastAPI(title="SmartCinnamon Fertilizer Recommendation API", version="1.0.0")

# If you know your frontend domain, replace "*" with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    N: float = Field(..., description="Nitrogen")
    P: float = Field(..., description="Phosphorus")
    K: float = Field(..., description="Potassium")
    pH: float = Field(..., description="Soil pH")
    EC: float = Field(..., description="Electrical Conductivity")
    Moisture: float
    Temperature: float
    Organic_Matter: float
    Soil_Quality: str = Field(..., description="Example: Poor/Moderate/Good (must match training labels)")
    Stage: str = Field(..., description="Example: Young/Mature (must match training labels)")

class RecommendResponse(BaseModel):
    per_plant: dict
    per_perch: dict
    meta: dict

def safe_encode(label_encoder, value: str, field_name: str) -> int:
    try:
        return int(label_encoder.transform([value])[0])
    except Exception:
        allowed = list(map(str, label_encoder.classes_))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}='{value}'. Allowed: {allowed}"
        )

def build_feature_row(req: RecommendRequest) -> pd.DataFrame:
    st = safe_encode(le_stage, req.Stage, "Stage")
    sq = safe_encode(le_soil, req.Soil_Quality, "Soil_Quality")

    N = req.N
    P = req.P
    K = req.K
    pH = req.pH

    # Feature engineering must match Colab
    N_P_Ratio = N / (P + 0.1)
    N_K_Ratio = N / (K + 0.1)
    P_K_Ratio = P / (K + 0.1)
    NPK_Total = N + P + K
    pH_Ideal = 1 if (pH >= 5.5 and pH <= 6.5) else 0

    row = {
        "N": N,
        "P": P,
        "K": K,
        "pH": pH,
        "EC": req.EC,
        "Moisture": req.Moisture,
        "Temperature": req.Temperature,
        "Organic_Matter": req.Organic_Matter,
        "Stage_Encoded": st,
        "Soil_Quality_Encoded": sq,
        "N_P_Ratio": N_P_Ratio,
        "N_K_Ratio": N_K_Ratio,
        "P_K_Ratio": P_K_Ratio,
        "NPK_Total": NPK_Total,
        "pH_Ideal": pH_Ideal,
    }

    # Ensure exact column order the model expects
    df = pd.DataFrame([[row.get(col) for col in FEATURES]], columns=FEATURES)
    return df

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    input_df = build_feature_row(req)

    # Predict per plant
    urea = float(np.clip(models["Urea_g"].predict(input_df)[0], 0, 250))
    tsp  = float(np.clip(models["TSP_g"].predict(input_df)[0], 0, 200))
    mop  = float(np.clip(models["MOP_g"].predict(input_df)[0], 0, 150))
    comp = float(np.clip(models["Compost_kg"].predict(input_df)[0], 0, 8))

    per_plant = {
        "Urea_g": round(urea, 2),
        "TSP_g": round(tsp, 2),
        "MOP_g": round(mop, 2),
        "Compost_kg": round(comp, 2),
    }

    per_perch = {
        "Urea_kg": round((urea * PLANTS_PER_PERCH) / 1000.0, 3),
        "TSP_kg": round((tsp  * PLANTS_PER_PERCH) / 1000.0, 3),
        "MOP_kg": round((mop  * PLANTS_PER_PERCH) / 1000.0, 3),
        "Compost_kg": round(comp * PLANTS_PER_PERCH, 3),
        "plants_per_perch": PLANTS_PER_PERCH
    }

    meta = {
        "stage": req.Stage,
        "soil_quality": req.Soil_Quality
    }

    return {"per_plant": per_plant, "per_perch": per_perch, "meta": meta}
