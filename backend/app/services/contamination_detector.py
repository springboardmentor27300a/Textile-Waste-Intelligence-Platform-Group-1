import cv2
import numpy as np


class ContaminationDetector:

    @staticmethod
    def detect(image):

        hsv = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2HSV,
        )

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        contamination = []

        # ---------------------------------------
        # Oil / Grease (very dark regions)
        # ---------------------------------------

        oil_mask = cv2.inRange(
            hsv,
            (0, 0, 0),
            (180, 80, 60),
        )

        oil_ratio = (
            np.count_nonzero(oil_mask)
            / oil_mask.size
        )

        if oil_ratio > 0.08:
            contamination.append("Oil")

        # ---------------------------------------
        # Mud / Dust (brown regions)
        # ---------------------------------------

        mud_mask = cv2.inRange(
            hsv,
            (5, 40, 20),
            (25, 255, 180),
        )

        mud_ratio = (
            np.count_nonzero(mud_mask)
            / mud_mask.size
        )

        if mud_ratio > 0.06:
            contamination.append("Mud")

        # ---------------------------------------
        # Water (low contrast)
        # ---------------------------------------

        contrast = np.std(gray)

        if contrast < 25:
            contamination.append("Water")

        # ---------------------------------------
        # Paint (high saturation)
        # ---------------------------------------

        saturation = hsv[:, :, 1]

        sat_mean = np.mean(saturation)

        if sat_mean > 180:
            contamination.append("Paint")

        # ---------------------------------------
        # Dust
        # ---------------------------------------

        brightness = np.mean(gray)

        if brightness < 70 and contrast < 35:
            contamination.append("Dust")

        # ---------------------------------------
        # Rust
        # ---------------------------------------

        rust_mask = cv2.inRange(
            hsv,
            (8, 90, 40),
            (20, 255, 170),
        )

        rust_ratio = (
            np.count_nonzero(rust_mask)
            / rust_mask.size
        )

        if rust_ratio > 0.03:
            contamination.append("Rust")

        # ---------------------------------------
        # Chemical
        # ---------------------------------------

        if sat_mean > 210 and contrast > 60:
            contamination.append("Chemical")

        # ---------------------------------------
        # Severity
        # ---------------------------------------

        count = len(contamination)

        if count == 0:
            level = "None"

        elif count <= 2:
            level = "Low"

        elif count <= 4:
            level = "Medium"

        else:
            level = "High"

        return {

            "contamination": contamination,

            "contamination_level": level,

            "contamination_count": count,

            "oil_ratio": round(
                oil_ratio,
                4,
            ),

            "mud_ratio": round(
                mud_ratio,
                4,
            ),

            "rust_ratio": round(
                rust_ratio,
                4,
            ),

            "average_saturation": round(
                float(sat_mean),
                2,
            ),

            "contrast": round(
                float(contrast),
                2,
            ),

        }