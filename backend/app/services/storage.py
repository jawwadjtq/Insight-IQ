"""
InsightIQ application storage.

This module keeps the currently uploaded dataset and its
analysis available to the API during the current backend session.

NOTE:
This is in-memory storage. It is suitable for the current
single-user/local development workflow. For production SaaS,
this should eventually be replaced with persistent/session-based
storage.
"""

from typing import Any

import pandas as pd


# =========================================================
# CURRENT DATASET
# =========================================================

current_dataset: pd.DataFrame | None = None


# =========================================================
# CURRENT DATASET SUMMARY
# =========================================================

current_summary: dict[str, Any] | None = None


# =========================================================
# CURRENT FILE INFORMATION
# =========================================================

current_filename: str | None = None
current_file_type: str | None = None


# =========================================================
# LAST GENERATED REPORT
# =========================================================

current_report: dict[str, Any] | None = None


# =========================================================
# STORAGE HELPERS
# =========================================================

def store_dataset(
    df: pd.DataFrame,
    summary: dict[str, Any],
    filename: str,
    file_type: str = "dataset",
) -> None:
    """
    Store the currently uploaded dataset and its analysis.
    """

    global current_dataset
    global current_summary
    global current_filename
    global current_file_type

    current_dataset = df
    current_summary = summary
    current_filename = filename
    current_file_type = file_type


def store_report(
    report: dict[str, Any],
) -> None:
    """
    Store the most recently generated report.
    """

    global current_report

    current_report = report


def clear_storage() -> None:
    """
    Clear the current dataset, summary, file information,
    and generated report.
    """

    global current_dataset
    global current_summary
    global current_filename
    global current_file_type
    global current_report

    current_dataset = None
    current_summary = None
    current_filename = None
    current_file_type = None
    current_report = None