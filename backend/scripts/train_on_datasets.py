"""Train the dataset-backed models: AITEX defect detection, Fashion-MNIST garments.

Usage
-----
    # inspect what you actually downloaded before training anything
    python scripts/train_on_datasets.py inspect --aitex data --fashion data

    # AITEX -> defect detection (real pixel-mask labels)
    python scripts/train_on_datasets.py defect  --aitex data --limit-clean 1200

    # Fashion-MNIST -> garment category recognition
    python scripts/train_on_datasets.py garment --fashion data --limit 20000

    # both
    python scripts/train_on_datasets.py all --aitex data --fashion data
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ml.datasets import aitex_summary, load_fashion_mnist  # noqa: E402
from app.ml.defect import train_defect_detector                # noqa: E402
from app.ml.garment import train_garment_classifier            # noqa: E402


def inspect(args) -> None:
    if args.aitex:
        summary = aitex_summary(Path(args.aitex))
        print("\nAITEX Fabric Image Database")
        print(f"  Defect images    : {summary['defect_images']}")
        print(f"  No-defect images : {summary['nodefect_images']}")
        print(f"  Masks            : {summary['masks']}")
        print(f"  Fabric codes     : {', '.join(summary['fabric_codes']) or 'none parsed'}")
        unmasked = summary.get("defects_without_mask") or []
        if unmasked:
            print(f"  Defects without a mask : {len(unmasked)} "
                  f"({', '.join(unmasked[:3])}{'…' if len(unmasked) > 3 else ''})")
            print("    Those fall back to the whole-image label, which is weaker but usable.")
        if summary["defect_images"] and not summary["masks"]:
            print("  ! No masks found. Patch labels will fall back to the whole-image "
                  "label, which is weaker. Check the Mask_images folder.")
    if args.fashion:
        for split in ("train", "test"):
            try:
                images, labels = load_fashion_mnist(Path(args.fashion), split, limit=5)
                print(f"\nFashion-MNIST {split}: shape {images.shape[1:]}, "
                      f"labels seen {sorted(set(labels.tolist()))}")
            except SystemExit as exc:
                print(f"\nFashion-MNIST {split}: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("task", choices=["inspect", "defect", "garment", "all"])
    parser.add_argument("--aitex", default=None, help="Folder holding Defect_images/ etc.")
    parser.add_argument("--fashion", default=None, help="Folder holding the Fashion-MNIST files")
    parser.add_argument("--patch", type=int, default=128,
                        help="AITEX patch size. 128 localises small defects far better "
                             "than 256: average precision 0.92 vs 0.39 on real data.")
    parser.add_argument("--defect-threshold", type=float, default=0.005,
                        help="Mask fraction above which a patch counts as defective")
    parser.add_argument("--limit-clean", type=int, default=1500,
                        help="Cap clean AITEX patches to keep the classes balanced")
    parser.add_argument("--limit", type=int, default=0, help="Cap Fashion-MNIST training rows")
    args = parser.parse_args()

    if args.task == "inspect":
        inspect(args)
        return

    if args.task in ("defect", "all"):
        if not args.aitex:
            raise SystemExit("--aitex is required for defect training")
        print("Training defect detector on AITEX…")
        m = train_defect_detector(Path(args.aitex), patch=args.patch,
                                  limit_clean=args.limit_clean,
                                  defect_pixel_threshold=args.defect_threshold)
        print(f"  patches        : {m['patches']} ({m['defective_patches']} defective) "
              f"from {m['source_images']} source images")
        print(f"  holdout AUC    : {m['holdout_auc']}   avg precision: {m['average_precision']}")
        print(f"  decision thr   : {m['decision_threshold']} (from out-of-fold, targeting recall)")
        print(f"  defect recall  : {m['defect_recall']}   precision: {m['defect_precision']}")
        print(f"  split          : {m['split']}")

    if args.task in ("garment", "all"):
        if not args.fashion:
            raise SystemExit("--fashion is required for garment training")
        print("\nTraining garment classifier on Fashion-MNIST…")
        m = train_garment_classifier(Path(args.fashion), limit=args.limit)
        print(f"  train / test   : {m['train_samples']} / {m['test_samples']}")
        print(f"  test accuracy  : {m['test_accuracy']}")
        print(f"  classes        : {len(m['classes'])}")

    print("\nRestart the API (or POST /api/models/reload as an administrator) to serve them.")


if __name__ == "__main__":
    main()
