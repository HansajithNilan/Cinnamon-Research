from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.ml_service import analyze_leaf_image
from app.services.chat_service import get_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/message")
async def chat_message(request: ChatRequest):
    """ Endpoint to get a chat response from the AI Assistant. """
    try:
        response = get_chat_response(request.message)
        return {
            "status": "success",
            "reply": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-leaf")
async def chat_analyze_leaf(file: UploadFile = File(...)):
    """ 
    Endpoint for leaf analysis within the chat interface. 
    Kept if needed by the chat UI to process images.
    """
    try:
        image_bytes = await file.read()
        analysis_result = analyze_leaf_image(image_bytes)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
            
        return {
            "status": "success",
            "data": analysis_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))