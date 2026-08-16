import os
import sys
import time
import json
import shutil
import unittest
from pathlib import Path
from PIL import Image

# Ensure the root backend dir is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.model_service import ModelService
from app.ai.inference_service import inference_service
from app.image_processing.processor import ImageProcessor
from app.database.session import SessionLocal
from app.models.prediction import Prediction
from app.predictions.service import PredictionService

class TestAIIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.image_dir = Path("test_images")
        cls.image_dir.mkdir(exist_ok=True)
        cls.towel_image = cls.image_dir / "towel.jpeg"
        
        # Ensure a clean test image exists
        if not cls.towel_image.exists():
            img = Image.new("RGB", (300, 300), color="white")
            img.save(cls.towel_image)
            
        cls.processor = ImageProcessor(upload_dir="test_uploads")
        cls.db = SessionLocal()

        # Run database migrations for predictions table
        from app.database.session import engine
        from sqlalchemy import text
        try:
            with engine.connect() as conn:
                if "postgresql" in str(engine.url):
                    res_mv = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='predictions' AND column_name='model_version'"))
                    if not res_mv.scalar():
                        conn.execute(text("ALTER TABLE predictions ADD COLUMN model_version VARCHAR(50)"))
                        conn.commit()
                    res_pt = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='predictions' AND column_name='processing_time'"))
                    if not res_pt.scalar():
                        conn.execute(text("ALTER TABLE predictions ADD COLUMN processing_time INTEGER"))
                        conn.commit()
                else:
                    res_p = conn.execute(text("PRAGMA table_info(predictions)")).fetchall()
                    p_cols = [r[1] for r in res_p]
                    if "model_version" not in p_cols:
                        conn.execute(text("ALTER TABLE predictions ADD COLUMN model_version VARCHAR(50)"))
                    if "processing_time" not in p_cols:
                        conn.execute(text("ALTER TABLE predictions ADD COLUMN processing_time INTEGER"))
        except Exception as e:
            print(f"Migration inside test setup failed: {e}")

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        # Clean test uploads
        if os.path.exists("test_uploads"):
            shutil.rmtree("test_uploads")

    def test_image_validation(self):
        print("\nTesting Image Validation & Corruption...")
        # 1. Valid image
        with open(self.towel_image, "rb") as f:
            data = f.read()
        res = self.processor.validate_image("test.jpg", len(data), "image/jpeg", data)
        self.assertTrue(res["valid"])

        # 2. Reject unsupported extension (webp)
        res = self.processor.validate_image("test.webp", 100, "image/webp", b"dummy")
        self.assertFalse(res["valid"])
        self.assertIn("Unsupported format", res["error"])

        # 3. Reject empty files
        res = self.processor.validate_image("test.png", 0, "image/png", b"")
        self.assertFalse(res["valid"])
        self.assertEqual("Empty file uploaded", res["error"])

        # 4. Reject corrupted image
        res = self.processor.validate_image("test.png", 20, "image/png", b"corrupted bytes here")
        self.assertFalse(res["valid"])
        self.assertIn("Corrupted or invalid image", res["error"])
        print("✅ Image validation tests passed.")

    def test_model_service_inference(self):
        print("\nTesting Model Service Inference...")
        model_service = ModelService()
        self.assertIsNotNone(model_service._model)
        self.assertIsNotNone(model_service._class_names)
        self.assertIn("Cotton", model_service._class_names)

        # Run prediction
        features = {
            "image_path": str(self.towel_image),
            "dominant_colors": ["White"],
            "file_hash": "dummyhash",
        }
        res = model_service.predict_material(features)
        self.assertIn("material", res)
        self.assertIn("confidence", res)
        self.assertIn("top_predictions", res)
        self.assertEqual(len(res["top_predictions"]), 3)
        print(f"✅ Predicted material: {res['material']} ({res['confidence']}%)")

    def test_inference_service_full_pipeline(self):
        print("\nTesting Inference Service Full Pipeline...")
        features = {
            "image_path": str(self.towel_image),
            "dominant_colors": ["White"],
            "file_hash": "dummyhash",
            "visible_damage": False,
            "tear_detected": False,
        }
        res = inference_service.run_full_pipeline(features)
        self.assertEqual(res["status"], "Success")
        self.assertEqual(res["model_version"], "v1.0.0")
        self.assertGreater(res["processing_time_ms"], 0)
        self.assertIn("material", res)
        self.assertIn("waste_category", res)
        self.assertIn("recyclability", res)
        print(f"✅ Full pipeline execution completed in {res['processing_time_ms']} ms.")

    def test_database_operations(self):
        print("\nTesting Database Save, Retrieve, Delete...")
        # Mock pipeline result
        pipeline_result = {
            "material": "Cotton",
            "confidence": 95.0,
            "waste_category": "Recyclable",
            "overall_confidence": 94.0,
            "status": "Success",
            "model_version": "v1.0.0",
            "processing_time_ms": 120,
            "material_details": {
                "probabilities": {"Cotton": 95.0, "Wool": 5.0},
                "fiber_composition": {"Cotton": 98.0, "Elastane": 2.0},
                "properties": {"origin": "Natural"},
                "fabric_category": "Natural Cellulosic",
                "detected_color": "White",
                "texture_description": "Soft plain-weave",
            },
            "waste_details": {
                "confidence": 93.0,
                "reason": "Recyclable composition",
                "material_quality": "Good",
                "severity_level": "Low",
                "description": "Cotton waste",
                "status_badge": "RECYCLABLE",
            },
            "recyclability_details": {
                "recyclability_score": 90.0,
                "reuse_potential": 85.0,
                "recovery_difficulty": "Easy",
                "material_recovery_score": 92.0,
                "overall_rating": "Excellent",
                "recovery_indicator": "Easy Recovery",
            },
            "image_features": {
                "visible_damage": False,
                "contamination_detected": False,
            }
        }
        
        # 1. Create a dummy uploaded image record first
        from app.models.user import User
        admin_user = self.db.query(User).first()
        if not admin_user:
            print("Skipping DB test because database has no seeded users.")
            return

        from app.models.prediction import UploadedImage
        img_rec = UploadedImage(
            filename="towel.jpeg",
            original_path=str(self.towel_image),
            uploader_id=admin_user.id
        )
        self.db.add(img_rec)
        self.db.commit()
        self.db.refresh(img_rec)

        # 2. Save prediction
        pred = PredictionService.save_full_prediction(
            db=self.db,
            user_id=admin_user.id,
            image_id=img_rec.id,
            pipeline_result=pipeline_result
        )
        self.assertIsNotNone(pred.id)
        self.assertEqual(pred.material, "Cotton")
        self.assertEqual(pred.model_version, "v1.0.0")
        self.assertEqual(pred.processing_time, 120)

        # Verify report is created
        self.assertIsNotNone(pred.report)
        self.assertEqual(pred.report.status, "Generated")

        # 3. Delete prediction
        prediction_id = pred.id
        success = PredictionService.delete_prediction(self.db, prediction_id)
        self.assertTrue(success)

        # Confirm deleted
        deleted_pred = PredictionService.get_prediction_by_id(self.db, prediction_id)
        self.assertIsNone(deleted_pred)
        print("✅ DB CRUD operations verified successfully.")

if __name__ == "__main__":
    unittest.main()
