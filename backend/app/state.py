"""
InsightIQ
Shared application state

This module stores the currently uploaded dataset and
its generated summary so that different routers/services
can access the same workspace data.

NOTE:
This is suitable for the current single-user/local deployment
architecture.

For a production multi-user SaaS deployment, this should later
be replaced with persistent storage and user/session-based
dataset isolation.
"""

from typing import Any, Optional

import pandas as pd


# =========================================================
# CURRENT DATASET
# =========================================================

current_dataset: Optional[pd.DataFrame] = None


# =========================================================
# CURRENT DATASET SUMMARY
# =========================================================

current_summary: Optional[dict[str, Any]] = None


# =========================================================
# CURRENT DATASET NAME
# =========================================================

current_dataset_name: Optional[str] = None


# =========================================================
# SET DATASET
# =========================================================

def set_dataset(
    dataframe: pd.DataFrame,
    summary: Optional[dict[str, Any]] = None,
    dataset_name: Optional[str] = None,
) -> None:
    """
    Store the currently uploaded dataset.

    Parameters
    ----------
    dataframe:
        Pandas DataFrame containing the uploaded data.

    summary:
        Optional generated dataset summary.

    dataset_name:
        Original uploaded filename.
    """

    global current_dataset
    global current_summary
    global current_dataset_name

    current_dataset = dataframe
    current_summary = summary
    current_dataset_name = dataset_name


# =========================================================
# SET SUMMARY
# =========================================================

def set_summary(
    summary: Optional[dict[str, Any]]
) -> None:
    """
    Update the current dataset summary.
    """

    global current_summary

    current_summary = summary


# =========================================================
# GET DATASET
# =========================================================

def get_dataset() -> Optional[pd.DataFrame]:
    """
    Return the currently uploaded dataset.
    """

    return current_dataset


# =========================================================
# GET SUMMARY
# =========================================================

def get_summary() -> Optional[dict[str, Any]]:
    """
    Return the current dataset summary.
    """

    return current_summary


# =========================================================
# GET DATASET NAME
# =========================================================

def get_dataset_name() -> Optional[str]:
    """
    Return the currently uploaded dataset filename.
    """

    return current_dataset_name


# =========================================================
# CLEAR DATASET
# =========================================================

def clear_dataset() -> None:
    """
    Clear the current workspace dataset.
    """

    global current_dataset
    global current_summary
    global current_dataset_name

    current_dataset = None
    current_summary = None
    current_dataset_name = None