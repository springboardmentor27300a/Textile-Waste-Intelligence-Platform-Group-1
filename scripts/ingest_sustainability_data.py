"""
Reads the downloaded Sustainable Fashion Dataset CSV, aggregates a real
sustainability figure per material, and writes it into the database.

Usage:
    python scripts/ingest_sustainability_data.py ./data/raw/sustainable-fashion/<file>.csv
    python scripts/ingest_sustainability_data.py ./data/raw/sustainable-fashion/<file>.csv --grade-map "A=100,B=80,C=60,D=40"
"""
import argparse, os, sys
from datetime import datetime
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.database import SessionLocal, Base, engine  # noqa: E402
from app import models  # noqa: E402

Base.metadata.create_all(bind=engine)

MATERIAL_COLUMN_HINTS = ["material", "fabric", "fibre", "fiber"]
SCORE_COLUMN_HINTS = ["sustain", "score", "rating", "eco", "impact", "index"]
DEFAULT_GRADE_MAP = {"A": 90, "B": 75, "C": 55, "D": 35, "F": 15}
FABRIC_KEYWORDS = {
    "cotton": "cotton", "organic cotton": "cotton", "polyester": "polyester", "recycled polyester": "polyester",
    "wool": "wool", "silk": "silk", "linen": "linen", "denim": "denim", "nylon": "nylon",
    "rayon": "rayon", "viscose": "rayon", "acrylic": "acrylic", "hemp": "mixed_fabrics",
    "tencel": "mixed_fabrics", "bamboo": "mixed_fabrics", "leather": "mixed_fabrics",
}


def guess_column(columns, hints):
    for col in columns:
        if any(hint in col.lower() for hint in hints):
            return col
    return None


def match_fabric_type(label):
    lowered = label.lower()
    for k, v in FABRIC_KEYWORDS.items():
        if k in lowered:
            return v
    return None


def parse_grade_map(raw):
    mapping = {}
    for pair in raw.split(","):
        letter, value = pair.split("=")
        mapping[letter.strip().upper()] = float(value.strip())
    return mapping


def looks_like_letter_grades(series, grade_map):
    uniques = set(str(v).strip().upper() for v in series.dropna().unique())
    return len(uniques) > 0 and uniques.issubset(set(grade_map.keys()))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path")
    parser.add_argument("--material-col", default=None)
    parser.add_argument("--score-col", default=None)
    parser.add_argument("--grade-map", default=None)
    parser.add_argument("--source-name", default="Sustainable Fashion Dataset (Kaggle)")
    args = parser.parse_args()

    grade_map = parse_grade_map(args.grade_map) if args.grade_map else DEFAULT_GRADE_MAP
    df = pd.read_csv(args.csv_path)
    print(f"Loaded {len(df)} real rows from {args.csv_path}")
    print(f"Columns found: {list(df.columns)}")

    material_col = args.material_col or guess_column(df.columns, MATERIAL_COLUMN_HINTS)
    score_col = args.score_col or guess_column(df.columns, SCORE_COLUMN_HINTS)
    if not score_col:
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        score_col = numeric_cols[0] if numeric_cols else None
    if not material_col or not score_col:
        print(f"Couldn't confidently detect columns. material={material_col} score={score_col}"); sys.exit(1)

    print(f"Using material column: '{material_col}'")
    print(f"Using score column:    '{score_col}'")
    working = df[[material_col, score_col]].copy()

    if pd.api.types.is_numeric_dtype(working[score_col]):
        print(f"'{score_col}' is already numeric.")
    elif looks_like_letter_grades(working[score_col], grade_map):
        print(f"'{score_col}' holds letter grades {sorted(working[score_col].dropna().unique())}.")
        print(f"Mapping using: {grade_map}")
        working[score_col] = working[score_col].astype(str).str.strip().str.upper().map(grade_map)
    else:
        extracted = working[score_col].astype(str).str.extract(r"(-?\d+\.?\d*)")[0]
        if extracted.notna().sum() == 0:
            print(f"'{score_col}' isn't numeric or letter-graded."); sys.exit(1)
        working[score_col] = extracted.astype(float)

    working = working.dropna(subset=[score_col])
    grouped = working.groupby(material_col)[score_col].agg(["mean", "count"]).reset_index().rename(columns={"mean": "avg_score", "count": "sample_size"})

    db = SessionLocal()
    try:
        db.query(models.MaterialInsight).filter(models.MaterialInsight.source_dataset == args.source_name).delete()
        written = 0
        for _, row in grouped.iterrows():
            label = str(row[material_col])
            db.add(models.MaterialInsight(material_label=label, matched_fabric_type=match_fabric_type(label),
                                           avg_sustainability_score=round(float(row["avg_score"]), 2),
                                           sample_size=int(row["sample_size"]), source_dataset=args.source_name,
                                           updated_at=datetime.utcnow()))
            written += 1
        db.commit()
        print(f"Wrote {written} material insight rows, computed from your real CSV.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
