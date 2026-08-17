from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.upload import router as upload_router
from app.routers.ai import router as ai_router
from app.routers.dashboard import router as dashboard_router


# =========================================================
# APPLICATION
# =========================================================

api = FastAPI(
    title="InsightIQ API",
    version="1.0.0",
)


# =========================================================
# ROUTERS
# =========================================================

api.include_router(upload_router)
api.include_router(ai_router)
api.include_router(dashboard_router)


# =========================================================
# ROOT
# =========================================================

@api.get("/")
def home():
    return {
        "message": "Welcome to InsightIQ API 🚀",
        "status": "online",
    }


# =========================================================
# CORS
# =========================================================
#
# CORS is applied around the ENTIRE application.
# This ensures CORS headers are also returned when
# an endpoint produces an error.
#
# Local development:
#   http://localhost:5173
#
# Production frontend:
#   https://insight-iq-six.vercel.app
#
# =========================================================

app = CORSMiddleware(
    app=api,
    allow_origins=[
        "http://localhost:5173",
        "https://insight-iq-six.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)