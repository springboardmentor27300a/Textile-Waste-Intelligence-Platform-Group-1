from pathlib import Path

import pandas as pd

from app.ml.material_taxonomy import (
    MATERIAL_CLASSES,
    get_material_group,
    normalize_material,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DEFAULT_DATASET_FILE = (
    BASE_DIR / "data" / "raw" / "textile_materials.csv"
)

DEFAULT_IMAGE_DIR = (
    BASE_DIR / "data" / "raw" / "images"
)


REQUIRED_COLUMNS = {
    "image_path",
    "material",
    "source",
    "condition",
    "recyclable",
}


class DatasetValidationError(Exception):
    pass


def load_dataset(
    csv_path: Path = DEFAULT_DATASET_FILE,
) -> pd.DataFrame:

    if not csv_path.exists():
        raise DatasetValidationError(
            f"Dataset file not found: {csv_path}"
        )

    dataframe = pd.read_csv(csv_path)

    missing_columns = (
        REQUIRED_COLUMNS - set(dataframe.columns)
    )

    if missing_columns:
        raise DatasetValidationError(
            "Dataset missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    if dataframe.empty:
        raise DatasetValidationError(
            "Dataset contains no records."
        )

    dataframe["material"] = (
        dataframe["material"]
        .astype(str)
        .apply(normalize_material)
    )

    dataframe["material_group"] = (
        dataframe["material"]
        .apply(get_material_group)
    )

    dataframe["source"] = (
        dataframe["source"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    dataframe["condition"] = (
        dataframe["condition"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    return dataframe


def get_dataset_summary(
    dataframe: pd.DataFrame,
) -> dict:

    material_counts = (
        dataframe["material"]
        .value_counts()
        .sort_index()
        .to_dict()
    )

    return {
        "total_records": len(dataframe),
        "material_classes": sorted(
            dataframe["material"].unique().tolist()
        ),
        "material_counts": material_counts,
        "supported_classes": MATERIAL_CLASSES,
    }


def validate_image_files(
    dataframe: pd.DataFrame,
    image_dir: Path = DEFAULT_IMAGE_DIR,
) -> dict:

    missing = []
    existing = []

    for filename in dataframe["image_path"]:
        path = image_dir / str(filename)

        if path.exists():
            existing.append(str(filename))
        else:
            missing.append(str(filename))

    return {
        "expected_images": len(dataframe),
        "existing_images": len(existing),
        "missing_images": len(missing),
        "missing_files": missing,
    }