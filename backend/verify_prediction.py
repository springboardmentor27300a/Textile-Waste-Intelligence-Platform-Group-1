import sys
sys.path.append('.')
from app.ai.material_classifier import MaterialClassifier
from app.ai.recommendation import RecommendationEngine

classifier = MaterialClassifier()

class StubPredictor:
    def predict(self, image_path):
        return {
            'class_index': 0,
            'material': 'Cotton',
            'confidence': 0.24,
            'top_predictions': [
                {'class_index': 0, 'material': 'Cotton', 'confidence': 24.0},
                {'class_index': 4, 'material': 'Linen', 'confidence': 22.0},
                {'class_index': 7, 'material': 'Rayon', 'confidence': 18.0},
            ],
        }

classifier.predictor = StubPredictor()
result = classifier.classify('sample.png')
print(result['material'], result['confidence'], result['confidence_level'], result['requires_manual_verification'])
print(result['top_predictions'])
engine = RecommendationEngine()
print(engine.generate('Cotton', confidence=0.24, confidence_level='Low', requires_manual_verification=True)['recommendation'])
