from fastapi import APIRouter
from app.services import storage

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def get_dashboard_summary():

    if storage.current_summary is None:
        return {
            "uploaded": False,
            "message": "No dataset uploaded."
        }

    return {
        "uploaded": True,
        "summary": storage.current_summary,
        "numeric_data": storage.current_summary.get("numeric_data", {})
    }