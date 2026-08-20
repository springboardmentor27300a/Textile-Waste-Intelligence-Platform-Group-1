from pathlib import Path
import json

from app.AI.dataset import load_dataset
from app.AI.model import build_model

MODEL_DIR = Path("app/AI/models")

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

MODEL_PATH = MODEL_DIR / "textile_model.keras"
CLASS_PATH = MODEL_DIR / "class_names.json"


def train():

    train_ds, val_ds, class_names = load_dataset()

    model = build_model(
        len(class_names)
    )

    model.summary()

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=20,
    )

    model.save(MODEL_PATH)

    with open(
        CLASS_PATH,
        "w",
    ) as file:

        json.dump(
            class_names,
            file,
            indent=4,
        )

    print("=" * 60)
    print("Training Completed")
    print(f"Model saved : {MODEL_PATH}")
    print(f"Classes saved : {CLASS_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    train()