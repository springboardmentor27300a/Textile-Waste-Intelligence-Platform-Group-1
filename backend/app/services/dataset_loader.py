from pathlib import Path

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


class DatasetLoader:

    def __init__(self):
        self.dataset_path = (
            Path(__file__)
            .resolve()
            .parents[2]
            / "datasets"
            / "fabric_dataset"
        )

    def dataset_exists(self):
        return self.dataset_path.exists()

    def get_classes(self):

        if not self.dataset_exists():
            return []

        return sorted(
            [
                folder.name
                for folder in self.dataset_path.iterdir()
                if folder.is_dir()
            ]
        )

    def count_images(self):

        total = 0

        for folder in self.get_classes():

            class_path = self.dataset_path / folder

            total += len(
                [
                    file
                    for file in class_path.iterdir()
                    if file.suffix.lower() in IMAGE_EXTENSIONS
                ]
            )

        return total

    def class_distribution(self):

        distribution = {}

        for folder in self.get_classes():

            class_path = self.dataset_path / folder

            distribution[folder] = len(
                [
                    file
                    for file in class_path.iterdir()
                    if file.suffix.lower() in IMAGE_EXTENSIONS
                ]
            )

        return distribution

    def summary(self):

        return {
            "dataset_available": self.dataset_exists(),
            "dataset_path": str(self.dataset_path),
            "total_classes": len(
                self.get_classes()
            ),
            "total_images": self.count_images(),
            "classes": self.get_classes(),
            "distribution": self.class_distribution(),
        }


dataset_loader = DatasetLoader()