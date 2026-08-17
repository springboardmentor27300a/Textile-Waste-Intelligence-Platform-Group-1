"""
==========================================================
WeaveCycle - Model Loader
==========================================================

Loads the trained EfficientNet model and class names only once.
This module provides a singleton instance of the model.

Author: WeaveCycle
"""

from pathlib import Path
import json

import tensorflow as tf
from tensorflow.keras.models import model_from_json


# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

ARCHITECTURE_PATH = BASE_DIR / "ml_models" / "model_architecture.json"
WEIGHTS_PATH = BASE_DIR / "ml_models" / "model.weights.h5"
CLASS_PATH = BASE_DIR / "ml_models" / "class_names.json"


# ==========================================================
# Singleton Loader
# ==========================================================

class ModelLoader:
    """
    Singleton class responsible for loading
    the trained model and class names.
    """

    _instance = None
    _model = None
    _class_names = None

    def __new__(cls):

        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)

        return cls._instance

    def load(self):
        """
        Load model and class names if not already loaded.
        """

        if self._model is None:

            print("Loading model architecture...")

            with open(ARCHITECTURE_PATH, "r") as f:
                model_data = json.load(f)

            def clean_dict(d):
                if isinstance(d, dict):
                    d.pop("quantization_config", None)
                    for k, v in list(d.items()):
                        clean_dict(v)
                elif isinstance(d, list):
                    for item in d:
                        clean_dict(item)

            clean_dict(model_data)
            self._model = model_from_json(json.dumps(model_data))

            print("Loading model weights...")

            self._model.load_weights(WEIGHTS_PATH)

            print("✅ Model loaded successfully.")

        if self._class_names is None:

            print("Loading class names...")

            with open(CLASS_PATH, "r") as f:
                self._class_names = json.load(f)

            print(f"✅ Loaded {len(self._class_names)} classes.")

    @property
    def model(self):

        if self._model is None:
            self.load()

        return self._model

    @property
    def class_names(self):

        if self._class_names is None:
            self.load()

        return self._class_names


# ==========================================================
# Global Singleton
# ==========================================================

model_loader = ModelLoader()