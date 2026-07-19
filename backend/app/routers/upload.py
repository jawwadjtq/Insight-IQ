from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    try:

        # CSV
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)

        # Excel
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file.file)

        else:
            raise HTTPException(
                status_code=400,
                detail="Only CSV and Excel files are allowed."
            )

        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "preview": df.head().fillna("").to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )