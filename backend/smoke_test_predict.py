import os
import cv2
import numpy as np
from app.ai.material_classifier import MaterialClassifier

# Create a synthetic RGB image (224x224) and write via OpenCV to ensure
# the image can be read reliably by the TensorFlow/OpenCV predictor.
img = np.full((224, 224, 3), 200, dtype=np.uint8)
img_path = os.path.join(os.getcwd(), "smoke_test.png")
cv2.imwrite(img_path, img)

print("Wrote", img_path)

classifier = MaterialClassifier()
print("Model status:", classifier.model_status)

result = classifier.classify(img_path)
print("Classification result:\n", result)

# cleanup
try:
    os.remove(img_path)
except Exception:
    pass
