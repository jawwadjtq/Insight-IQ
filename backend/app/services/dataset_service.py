import pandas as pd


def analyze_dataset(df: pd.DataFrame, filename: str):
    rows = len(df)
    columns = len(df.columns)

    numeric_columns = len(df.select_dtypes(include=["number"]).columns)
    categorical_columns = columns - numeric_columns

    missing_values = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    memory_usage = round(
        df.memory_usage(deep=True).sum() / (1024 * 1024),
        2
    )

    total_cells = rows * columns if rows and columns else 1

    missing_ratio = missing_values / total_cells
    duplicate_ratio = duplicate_rows / rows if rows else 0

    quality_score = max(
        0,
        100 - int(
            (missing_ratio * 100) +
            (duplicate_ratio * 100)
        )
    )

    numeric_df = df.select_dtypes(include=["number"])

    correlation = {}

    if len(numeric_df.columns) > 1:
        correlation = (
            numeric_df
            .corr()
            .round(2)
            .fillna(0)
            .to_dict()
        )

    preview = (
        df.head(5)
        .fillna("")
        .to_dict(orient="records")
    )

    # NEW
    numeric_data = {}

    for column in numeric_df.columns:
        numeric_data[column] = (
            numeric_df[column]
            .dropna()
            .tolist()
        )

    return {
        "dataset_name": filename,
        "rows": rows,
        "columns": columns,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "memory_usage_mb": memory_usage,
        "quality_score": quality_score,
        "column_names": df.columns.tolist(),
        "preview": preview,
        "correlation": correlation,

        # NEW
        "numeric_data": numeric_data,
    }