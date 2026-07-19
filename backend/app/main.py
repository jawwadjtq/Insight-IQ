from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.upload import router as upload_router

app = FastAPI(
    title="InsightIQ API",
    version="1.0.0"
)

# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to InsightIQ API 🚀"
    }