"""Prepare the Kaggle Fabric Image Dataset for training.

The platform recognises ten materials. Public fabric datasets use their own class
names, so this script maps whatever folders it finds onto our labels, reports what
matched and what didn't, and writes a clean training tree.

Usage
-----
    # 1. download (needs a Kaggle account + ~/.kaggle/kaggle.json)
    pip install kaggle
    kaggle datasets download -d nguyenbaduong/fabric-image-dataset -p data/raw --unzip

    # 2. map it onto our label set
    python scripts/prepare_fabric_dataset.py data/raw --out data/fabric

    # 3. train on the real images
    python -m app.ml.train --images data/fabric

Any dataset laid out as <class_name>/*.jpg works — DeepFashion, TIPS, or your own
photographs. Add unrecognised folder names to ALIASES below.
"""
from __future__ import annotations

import argparse
import shutil
from collections import Counter
from pathlib import Path

MATERIALS = [
    "Cotton", "Polyester", "Wool", "Silk", "Linen",
    "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics",
]

# Folder name (lowercased, punctuation stripped) -> platform material.
ALIASES: dict[str, str] = {
    "cotton": "Cotton", "cottonfabric": "Cotton", "jersey": "Cotton", "terry": "Cotton",
    "polyester": "Polyester", "poly": "Polyester", "microfiber": "Polyester",
    "wool": "Wool", "woolen": "Wool", "felt": "Wool", "cashmere": "Wool", "tweed": "Wool",
    "silk": "Silk", "satin": "Silk", "chiffon": "Silk",
    "linen": "Linen", "flax": "Linen",
    "denim": "Denim", "jean": "Denim", "jeans": "Denim", "chambray": "Denim",
    "nylon": "Nylon", "polyamide": "Nylon", "spandex": "Nylon", "elastane": "Nylon",
    "rayon": "Rayon", "viscose": "Rayon", "modal": "Rayon", "lyocell": "Rayon",
    "acrylic": "Acrylic", "fleece": "Acrylic",
    "blend": "Mixed Fabrics", "mixed": "Mixed Fabrics", "mixedfabrics": "Mixed Fabrics",
    "cottonpolyester": "Mixed Fabrics", "polycotton": "Mixed Fabrics", "other": "Mixed Fabrics",
}

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def normalise(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def resolve(folder_name: str) -> str | None:
    key = normalise(folder_name)
    if key in ALIASES:
        return ALIASES[key]
    for material in MATERIALS:              # exact-ish match on our own names
        if normalise(material) == key:
            return material
    for alias, material in ALIASES.items():  # substring fallback: "100_cotton_plain"
        if alias in key:
            return material
    return None


def find_class_folders(root: Path) -> list[Path]:
    """Locate the level of the tree that actually holds the class folders."""
    candidates = [p for p in root.rglob("*") if p.is_dir()
                  and any(f.suffix.lower() in IMAGE_SUFFIXES for f in p.iterdir() if f.is_file())]
    return sorted(candidates)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="Folder the dataset was unzipped into")
    parser.add_argument("--out", type=Path, default=Path("data/fabric"),
                        help="Where to write the mapped training tree")
    parser.add_argument("--copy", action="store_true",
                        help="Copy files instead of hard-linking (slower, uses more disk)")
    parser.add_argument("--limit", type=int, default=0,
                        help="Cap images per material, useful for a fast first run")
    args = parser.parse_args()

    if not args.source.is_dir():
        raise SystemExit(f"{args.source} is not a folder. Download the dataset first.")

    folders = find_class_folders(args.source)
    if not folders:
        raise SystemExit(f"No image folders found under {args.source}.")

    args.out.mkdir(parents=True, exist_ok=True)
    counts: Counter[str] = Counter()
    skipped: Counter[str] = Counter()

    for folder in folders:
        material = resolve(folder.name)
        if material is None:
            skipped[folder.name] += sum(1 for f in folder.iterdir()
                                        if f.suffix.lower() in IMAGE_SUFFIXES)
            continue

        target = args.out / material
        target.mkdir(parents=True, exist_ok=True)
        for image in sorted(folder.iterdir()):
            if image.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            if args.limit and counts[material] >= args.limit:
                break
            destination = target / f"{folder.name}_{image.name}"
            if destination.exists():
                continue
            if args.copy:
                shutil.copy2(image, destination)
            else:
                try:
                    destination.hardlink_to(image)
                except OSError:
                    shutil.copy2(image, destination)
            counts[material] += 1

    print(f"\nWrote {sum(counts.values())} images to {args.out}\n")
    for material in MATERIALS:
        bar = "#" * min(40, counts[material] // 25)
        print(f"  {material:16} {counts[material]:6}  {bar}")

    missing = [m for m in MATERIALS if counts[m] == 0]
    if missing:
        print(f"\n  No images for: {', '.join(missing)}")
        print("  Those classes will be dropped from training. That is fine — the platform")
        print("  reports only the classes it was actually trained on.")

    if skipped:
        print("\n  Unmapped folders (add them to ALIASES to include):")
        for name, n in skipped.most_common(12):
            print(f"    {name:28} {n} images")

    print(f"\nNext:  python -m app.ml.train --images {args.out}")


if __name__ == "__main__":
    main()
