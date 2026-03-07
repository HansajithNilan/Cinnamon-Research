from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze_route import router as analyze_router
from app.api.chat_route import router as chat_router

app = FastAPI(title="Cinnamon Smart Care API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "Cinnamon API is running successfully!"}