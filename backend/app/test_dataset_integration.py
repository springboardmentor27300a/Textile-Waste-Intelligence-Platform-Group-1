from app.ml.pipeline.dataset_loader import (
    get_dataset_summary,
    load_dataset,
    validate_image_files,
)


def main():
    print("=" * 55)
    print("TEXTILE DATASET INTEGRATION TEST")
    print("=" * 55)

    dataset = load_dataset()

    summary = get_dataset_summary(dataset)

    validation = validate_image_files(dataset)

    print(f"Dataset records : {summary['total_records']}")
    print(
        "Classes         : "
        + ", ".join(summary["material_classes"])
    )

    print("\nMaterial distribution:")

    for material, count in summary["material_counts"].items():
        print(f"  {material:<12}: {count}")

    print("\nImage validation:")
    print(
        f"Expected images : "
        f"{validation['expected_images']}"
    )
    print(
        f"Existing images : "
        f"{validation['existing_images']}"
    )
    print(
        f"Missing images  : "
        f"{validation['missing_images']}"
    )

    print("\nSample normalized records:")

    print(
        dataset[
            [
                "image_path",
                "material",
                "material_group",
                "source",
                "condition",
            ]
        ].head()
    )

    print("=" * 55)
    print("DATASET PIPELINE FOUNDATION: PASS")
    print("=" * 55)


if __name__ == "__main__":
    main()