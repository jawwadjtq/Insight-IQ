"""
InsightIQ dataset query router.

This router provides scalable access to the currently uploaded
dataset.

The physical dataset is stored as Parquet and queried through
DuckDB.

IMPORTANT:

The frontend must NEVER receive the complete dataset when
working with large files.

All dataset table access should use server-side pagination.

Supported operations:

- Dataset metadata
- Dataset schema
- Paginated rows
- Column selection
- Sorting
"""

from __future__ import annotations

from typing import Optional

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.services import storage


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/dataset",
    tags=["Dataset"],
)


# =========================================================
# DATASET INFORMATION
# =========================================================

@router.get("/")
def get_dataset_information():
    """
    Return basic information about the currently active
    dataset.

    This endpoint does not return dataset rows.
    """

    try:

        if not storage.has_dataset():

            raise HTTPException(
                status_code=404,
                detail=(
                    "No dataset is currently available."
                ),
            )

        row_count = (
            storage.get_row_count()
        )

        schema = (
            storage.get_schema()
        )

        return {
            "available": True,
            "filename": (
                storage.current_filename
            ),
            "file_type": (
                storage.current_file_type
            ),
            "rows": row_count,
            "columns": len(schema),
            "schema": schema,
        }

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# DATASET SCHEMA
# =========================================================

@router.get("/schema")
def get_dataset_schema():
    """
    Return the schema of the active dataset.

    No dataset rows are returned.
    """

    try:

        if not storage.has_dataset():

            raise HTTPException(
                status_code=404,
                detail=(
                    "No dataset is currently available."
                ),
            )

        schema = (
            storage.get_schema()
        )

        return {
            "columns": schema,
            "count": len(schema),
        }

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# PAGINATED DATA
# =========================================================

@router.get("/data")
def get_dataset_data(
    page: int = Query(
        default=1,
        ge=1,
        description=(
            "1-based page number."
        ),
    ),

    page_size: int = Query(
        default=50,
        ge=1,
        le=500,
        description=(
            "Number of rows returned per page."
        ),
    ),

    columns: Optional[str] = Query(
        default=None,
        description=(
            "Comma-separated list of columns "
            "to return."
        ),
    ),

    order_by: Optional[str] = Query(
        default=None,
        description=(
            "Column used to sort the dataset."
        ),
    ),

    descending: bool = Query(
        default=False,
        description=(
            "Sort descending when true."
        ),
    ),
):
    """
    Return a paginated section of the active dataset.

    Example:

        /dataset/data?page=1&page_size=50

    Optional:

        /dataset/data?
            page=2&
            page_size=100&
            order_by=Sales&
            descending=true

    Columns can be restricted:

        /dataset/data?
            columns=Name,Sales,Region
    """

    try:

        if not storage.has_dataset():

            raise HTTPException(
                status_code=404,
                detail=(
                    "No dataset is currently available."
                ),
            )

        # =================================================
        # PARSE COLUMNS
        # =================================================

        selected_columns = None

        if columns:

            selected_columns = [
                column.strip()
                for column
                in columns.split(",")
                if column.strip()
            ]

            if not selected_columns:

                selected_columns = None

        # =================================================
        # QUERY DATASET
        # =================================================

        result = (
            storage.query_paginated(
                page=page,
                page_size=page_size,
                columns=selected_columns,
                order_by=order_by,
                descending=descending,
            )
        )

        return result

    except HTTPException:

        raise

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# FIRST PAGE
# =========================================================

@router.get("/preview")
def get_dataset_preview(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):
    """
    Return a small preview of the current dataset.

    This endpoint exists for compatibility with existing
    frontend preview components.

    For full table browsing use /dataset/data.
    """

    try:

        if not storage.has_dataset():

            raise HTTPException(
                status_code=404,
                detail=(
                    "No dataset is currently available."
                ),
            )

        data = storage.get_sample(
            limit
        )

        return {
            "data": data,
            "count": len(data),
            "limit": limit,
        }

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )