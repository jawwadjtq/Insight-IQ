from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.upload import router as upload_router
from app.routers.ai import router as ai_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title="InsightIQ API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://insight-iq-six.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(ai_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to InsightIQ API 🚀"
    }