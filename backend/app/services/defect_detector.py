import cv2
import numpy as np


class DefectDetector:

    @staticmethod
    def detect(image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        defects = []

        # ---------------------------------------
        # Edge Analysis
        # ---------------------------------------

        edges = cv2.Canny(
            gray,
            100,
            200,
        )

        edge_density = (
            np.count_nonzero(edges)
            / edges.size
        )

        # ---------------------------------------
        # Blur (Wrinkles / Damage)
        # ---------------------------------------

        laplacian = cv2.Laplacian(
            gray,
            cv2.CV_64F,
        ).var()

        # ---------------------------------------
        # Dark Regions
        # ---------------------------------------

        _, dark = cv2.threshold(
            gray,
            40,
            255,
            cv2.THRESH_BINARY_INV,
        )

        dark_area = (
            np.count_nonzero(dark)
            / dark.size
        )

        # ---------------------------------------
        # Bright Regions
        # ---------------------------------------

        _, bright = cv2.threshold(
            gray,
            220,
            255,
            cv2.THRESH_BINARY,
        )

        bright_area = (
            np.count_nonzero(bright)
            / bright.size
        )

        # ---------------------------------------
        # Rule-Based Detection
        # ---------------------------------------

        if dark_area > 0.08:
            defects.append("Stain")

        if bright_area > 0.06:
            defects.append("Discoloration")

        if edge_density > 0.30:
            defects.append("Frayed Edge")

        if laplacian < 80:
            defects.append("Wrinkle")

        if edge_density > 0.40:
            defects.append("Loose Thread")

        # ---------------------------------------
        # Damage Level
        # ---------------------------------------

        count = len(defects)

        if count == 0:
            damage = "None"

        elif count <= 2:
            damage = "Minor"

        elif count <= 4:
            damage = "Moderate"

        else:
            damage = "Severe"

        return {

            "defects": defects,

            "damage_level": damage,

            "defect_count": count,

            "edge_density": round(
                edge_density,
                4,
            ),

            "laplacian_variance": round(
                laplacian,
                2,
            ),

            "dark_area_ratio": round(
                dark_area,
                4,
            ),

            "bright_area_ratio": round(
                bright_area,
                4,
            ),

        }