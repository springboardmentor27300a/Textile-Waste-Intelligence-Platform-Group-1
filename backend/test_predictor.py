from pathlib import Path

from app.material_classifier.predictor import predict_material

IMAGE = Path("test_images") / "towel.jpeg"

result = predict_material(IMAGE)

print("\nPrediction Result")
print("=" * 60)

print(f"Predicted Material : {result['material']}")
print(f"Confidence         : {result['confidence']} %")

print("\nTop Predictions")

for prediction in result["top_predictions"]:

    print(
        f"{prediction['class']:20}"
        f"{prediction['confidence']:6.2f}%"
    )