from app.services.material_service import MaterialClassifier
from app.services.damage_service import DamageDetector
from app.services.quality_analysis import QualityAnalyzer
from app.services.recommendation_service import RecommendationService
from app.services.sustainability_service import SustainabilityService
from app.services.environmental_service import EnvironmentalService
from app.services.waste_scoring_service import WasteScoringService
from app.services.circular_economy_service import CircularEconomyService
from app.services.benchmark_service import BenchmarkService

class AnalysisService:

    def __init__(self):
        self.material_classifier = MaterialClassifier()
        self.damage_detector = DamageDetector()
        self.quality_analyzer = QualityAnalyzer()
        self.recommendation_service = RecommendationService()
        self.sustainability_service = SustainabilityService()
        self.environmental_service = EnvironmentalService()
        self.waste_scoring_service = WasteScoringService()
        self.circular_service = CircularEconomyService()
        self.benchmark_service = BenchmarkService()

    def analyze(self, image_path):

        material = self.material_classifier.predict(image_path)

        damage = self.damage_detector.predict(image_path)

        quality = self.quality_analyzer.analyze(image_path)

        
        recommendation = self.recommendation_service.recommend(
                material,
                damage,
                quality
            )
        sustainability = self.sustainability_service.calculate(
                    material,
                    recommendation
                )
        environmental = self.environmental_service.generate(
                sustainability
            )

        waste_scoring = self.waste_scoring_service.calculate(
                material=material,
                damage=damage,
                quality=quality,
                recommendation=recommendation,
                sustainability=sustainability
            )
        circular_economy = self.circular_service.generate(
            recommendation=recommendation,
            sustainability=sustainability,
            waste_scoring=waste_scoring
        )
        benchmark = self.benchmark_service.generate(
            sustainability=sustainability,
            waste_scoring=waste_scoring,
            circular_economy=circular_economy
        )

        print(recommendation)
        return {
            "material": material,
            "damage": damage,
            "quality": quality,
            "recommendation": recommendation,
            "sustainability": sustainability,
            "environmental_analytics": environmental,
            "waste_scoring": waste_scoring,
            "circular_economy": circular_economy,
            "benchmark": benchmark

        }