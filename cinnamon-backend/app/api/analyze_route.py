from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ml_service import analyze_leaf_image, analyze_vacant_area

router = APIRouter()


@router.post("/leaf")
async def analyze_leaf(file: UploadFile = File(...)):
    
    print("="*40)
    print(f"✅ App sent! (File: {file.filename})")
    print("⏳ YOLO Model Scan image ...")
    
    try:
        image_bytes = await file.read()
        analysis_result = analyze_leaf_image(image_bytes)
        
        if "error" in analysis_result:
            print("❌ error: Model not working properly.")
            raise HTTPException(status_code=500, detail=analysis_result["error"])
            
        print("🎯 Scan Done! Result  send the App .")
        print("="*40)
        
        return {
            "status": "success",
            "data": analysis_result
        }
    except Exception as e:
        print(f"❌ Error : {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vacant")
async def analyze_vacant(file: UploadFile = File(...)):
    
    print("="*40)
    print(f"✅ App sent Vacant Area image! (File: {file.filename})")
    print("⏳ Vacant Area YOLO Model Scan image ...")
    
    try:
        image_bytes = await file.read()
        analysis_result = analyze_vacant_area(image_bytes)
        
        if "error" in analysis_result:
            print("❌ error: Vacant Model not working properly.")
            raise HTTPException(status_code=500, detail=analysis_result["error"])
            
        print("🎯 Vacant Area Scan Done! Result send to the App.")
        print("="*40)
        
        return {
            "status": "success",
            "data": analysis_result
        }
    except Exception as e:
        print(f"❌ Error : {e}")
        raise HTTPException(status_code=500, detail=str(e))