"""Loaders for the two real datasets the project ships against.

Neither dataset carries fibre labels, so neither can train the Cotton/Polyester/
Wool classifier. What they *do* carry is genuinely useful, and each is wired to
the specification module it actually supports:

AITEX Fabric Image Database
    7 fabric structures photographed as 4096x256 greyscale strips, split into
    defect / no-defect, with pixel masks marking each defect.
    -> Damage Detection and Contamination Detection (spec module 3)
    -> Fabric structure recognition (spec module 4, "fabric category recognition")

Fashion-MNIST
    70,000 28x28 greyscale garment images across 10 clothing categories.
    -> Clothing classification / image-classification baseline, which is exactly
       the purpose the specification lists for it.
"""
from __future__ import annotations

import gzip
import re
import struct
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}

FASHION_CLASSES = [
    "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
    "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot",
]

# Garment category -> the fibres it is most often made from. Used to turn a
# Fashion-MNIST prediction into a usable prior, never a hard claim.
GARMENT_FIBRE_PRIOR = {
    "T-shirt/top": ["Cotton", "Polyester"],
    "Trouser": ["Denim", "Cotton", "Polyester"],
    "Pullover": ["Wool", "Acrylic", "Cotton"],
    "Dress": ["Polyester", "Rayon", "Silk"],
    "Coat": ["Wool", "Polyester", "Nylon"],
    "Sandal": ["Mixed Fabrics"],
    "Shirt": ["Cotton", "Linen", "Polyester"],
    "Sneaker": ["Mixed Fabrics", "Nylon"],
    "Bag": ["Nylon", "Polyester", "Mixed Fabrics"],
    "Ankle boot": ["Mixed Fabrics"],
}


# --------------------------------------------------------------------- AITEX

@dataclass
class AitexPatch:
    image: np.ndarray      # BGR patch
    is_defective: bool
    defect_fraction: float  # share of patch pixels marked in the mask
    fabric_code: str
    source: str


def _read_grey(path: Path) -> np.ndarray | None:
    image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    return image


def parse_aitex_name(path: Path) -> tuple[str, str]:
    """AITEX names files `<id>_<defectcode>_<fabriccode>.png`.

    Returns (defect_code, fabric_code); empty strings when the name doesn't match,
    so an unexpected file never crashes a training run.
    """
    stem = path.stem
    if "_mask" in stem:                       # 0044_019_04_mask2 -> 0044_019_04
        stem = stem.split("_mask")[0]
    parts = stem.split("_")
    if len(parts) >= 3:
        return parts[1], parts[2]
    return "", ""


def find_masks(masks_dir: Path, image_path: Path) -> list[Path]:
    """All masks belonging to one image.

    AITEX ships more than one mask for images with more than one defect, named
    `<stem>1_mask.png`, `<stem>2_mask.png`. An exact-name lookup silently misses
    those and mislabels every defect in the image, so match the prefix instead.
    """
    if not masks_dir.is_dir():
        return []
    stem = image_path.stem
    # Single defect  -> 0001_002_00_mask.png
    # Several defects -> 0044_019_04_mask1.png, 0044_019_04_mask2.png
    pattern = re.compile(rf"^{re.escape(stem)}_mask\d*$")
    found = [p for p in masks_dir.iterdir()
             if p.suffix.lower() in IMAGE_SUFFIXES and pattern.match(p.stem)]
    return sorted(found)


def load_combined_mask(masks_dir: Path, image_path: Path,
                       shape: tuple[int, int]) -> np.ndarray | None:
    """Union of every mask for an image, resized to match it."""
    paths = find_masks(masks_dir, image_path)
    if not paths:
        return None
    combined = np.zeros(shape, np.uint8)
    for path in paths:
        mask = _read_grey(path)
        if mask is None:
            continue
        if mask.shape != shape:
            mask = cv2.resize(mask, (shape[1], shape[0]), interpolation=cv2.INTER_NEAREST)
        combined = np.maximum(combined, mask)
    return combined


BLANK_PATCH_STD = 3.0


def _is_blank(tile: np.ndarray) -> bool:
    """AITEX strips are padded with flat white (255) at the ends.

    Those regions are not fabric. Left in, they made up 10% of the clean class —
    trivially separable filler that teaches the model nothing and flatters every
    metric computed over the clean patches.
    """
    return float(tile.std()) < BLANK_PATCH_STD


def iter_aitex_patches(root: Path, patch: int = 256, stride: int | None = None,
                       defect_pixel_threshold: float = 0.0015, quiet: bool = False,
                       drop_blank: bool = True):
    """Yield square patches from the AITEX strips.

    The source images are 4096x256, far too wide to classify whole. Cutting them
    into square patches and labelling each one from its mask is what turns this
    into a usable supervised set: a patch counts as defective when the mask marks
    more than `defect_pixel_threshold` of its pixels.
    """
    stride = stride or patch
    skipped_no_mask: list[str] = []
    defect_dir = root / "Defect_images"
    nodefect_dir = root / "NODefect_images"
    mask_dir = root / "Mask_images"

    if defect_dir.is_dir():
        for image_path in sorted(defect_dir.rglob("*")):
            if image_path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            grey = _read_grey(image_path)
            if grey is None:
                continue
            _, fabric_code = parse_aitex_name(image_path)
            mask = load_combined_mask(mask_dir, image_path, grey.shape)
            if mask is None:
                # Without a mask there is no way to say which patch holds the
                # defect. Labelling them all defective would poison the training
                # set, so skip the image and let the caller report it.
                skipped_no_mask.append(image_path.name)
                continue

            for y in range(0, max(1, grey.shape[0] - patch + 1), stride):
                for x in range(0, max(1, grey.shape[1] - patch + 1), stride):
                    tile = grey[y:y + patch, x:x + patch]
                    if tile.shape[0] < patch or tile.shape[1] < patch:
                        continue
                    if drop_blank and _is_blank(tile):
                        continue
                    mtile = mask[y:y + patch, x:x + patch]
                    fraction = float((mtile > 127).mean())
                    yield AitexPatch(cv2.cvtColor(tile, cv2.COLOR_GRAY2BGR),
                                     fraction > defect_pixel_threshold, fraction,
                                     fabric_code, str(image_path))

    if skipped_no_mask and not quiet:
        # The caller may sweep the generator more than once (e.g. to count first);
        # `quiet` stops the same note being printed on every pass.
        print(f"  note: skipped {len(skipped_no_mask)} defect image(s) with no mask: "
              f"{', '.join(skipped_no_mask[:4])}")

    if nodefect_dir.is_dir():
        for image_path in sorted(nodefect_dir.rglob("*")):
            if image_path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            grey = _read_grey(image_path)
            if grey is None:
                continue
            # NODefect images sit in per-fabric sub-folders; the folder name is
            # the fabric identifier.
            fabric_code = image_path.parent.name
            _, parsed = parse_aitex_name(image_path)
            fabric_code = parsed or fabric_code
            for y in range(0, max(1, grey.shape[0] - patch + 1), stride):
                for x in range(0, max(1, grey.shape[1] - patch + 1), stride):
                    tile = grey[y:y + patch, x:x + patch]
                    if tile.shape[0] < patch or tile.shape[1] < patch:
                        continue
                    if drop_blank and _is_blank(tile):
                        continue
                    yield AitexPatch(cv2.cvtColor(tile, cv2.COLOR_GRAY2BGR),
                                     False, 0.0, fabric_code, str(image_path))


def aitex_summary(root: Path) -> dict:
    counts = {"defect_images": 0, "nodefect_images": 0, "masks": 0, "fabric_codes": set()}
    for name, key in (("Defect_images", "defect_images"), ("NODefect_images", "nodefect_images"),
                      ("Mask_images", "masks")):
        folder = root / name
        if folder.is_dir():
            files = [p for p in folder.rglob("*") if p.suffix.lower() in IMAGE_SUFFIXES]
            counts[key] = len(files)
            if key != "masks":
                for f in files:
                    _, code = parse_aitex_name(f)
                    counts["fabric_codes"].add(code or f.parent.name)

    defect_dir = root / "Defect_images"
    if defect_dir.is_dir():
        unmasked = [p.name for p in sorted(defect_dir.rglob("*"))
                    if p.suffix.lower() in IMAGE_SUFFIXES
                    and not find_masks(root / "Mask_images", p)]
        counts["defects_without_mask"] = unmasked
    counts["fabric_codes"] = sorted(c for c in counts["fabric_codes"] if c)

    defect_dir = root / "Defect_images"
    if defect_dir.is_dir():
        unmasked = [p.name for p in sorted(defect_dir.rglob("*"))
                    if p.suffix.lower() in IMAGE_SUFFIXES
                    and not find_masks(root / "Mask_images", p)]
        counts["defects_without_mask"] = unmasked
    return counts


# ------------------------------------------------------------- Fashion-MNIST

def _read_idx(path: Path) -> np.ndarray:
    opener = gzip.open if path.suffix == ".gz" else open
    with opener(path, "rb") as handle:
        magic, count = struct.unpack(">II", handle.read(8))
        if magic == 2051:                     # images
            rows, cols = struct.unpack(">II", handle.read(8))
            data = np.frombuffer(handle.read(), dtype=np.uint8)
            return data.reshape(count, rows, cols)
        if magic == 2049:                     # labels
            return np.frombuffer(handle.read(), dtype=np.uint8)
    raise ValueError(f"{path} is not an IDX file")


def load_fashion_mnist(root: Path, split: str = "train", limit: int = 0):
    """Load Fashion-MNIST from whichever form is on disk.

    Kaggle ships CSVs; the official site ships IDX (`*-ubyte`, optionally gzipped).
    Both appear in the same folder often enough that trying each in turn is
    friendlier than making the user say which they have.
    """
    csv_names = {"train": ["fashion-mnist_train.csv", "fashion_mnist_train.csv"],
                 "test": ["fashion-mnist_test.csv", "fashion_mnist_test.csv"]}
    for name in csv_names[split]:
        csv_path = root / name
        if csv_path.exists():
            import pandas as pd
            frame = pd.read_csv(csv_path, nrows=limit or None)
            labels = frame.iloc[:, 0].to_numpy(dtype=np.uint8)
            images = frame.iloc[:, 1:].to_numpy(dtype=np.uint8).reshape(-1, 28, 28)
            return images, labels

    prefix = "train" if split == "train" else "t10k"
    for image_name, label_name in (
        (f"{prefix}-images-idx3-ubyte", f"{prefix}-labels-idx1-ubyte"),
        (f"{prefix}-images-idx3-ubyte.gz", f"{prefix}-labels-idx1-ubyte.gz"),
    ):
        image_path, label_path = root / image_name, root / label_name
        if image_path.exists() and label_path.exists():
            images, labels = _read_idx(image_path), _read_idx(label_path)
            if limit:
                images, labels = images[:limit], labels[:limit]
            return images, labels

    raise SystemExit(
        f"No Fashion-MNIST {split} split under {root}. Expected either "
        f"fashion-mnist_{split}.csv or {prefix}-images-idx3-ubyte."
    )
