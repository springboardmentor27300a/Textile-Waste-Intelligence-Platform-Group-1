from pathlib import Path

from app.material_classifier.preprocessing import preprocess_image

IMAGE_PATH = Path("test_images") / "towel.jpeg"

print("Current Directory :", Path.cwd())
print("Image Path        :", IMAGE_PATH.resolve())
print("Exists            :", IMAGE_PATH.exists())

image = preprocess_image(IMAGE_PATH)

print("\n✅ Preprocessing Successful")
print("Shape :", image.shape)
print("Type  :", image.dtype)
print("Min   :", image.min())
print("Max   :", image.max())