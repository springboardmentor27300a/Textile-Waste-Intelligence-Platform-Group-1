import cv2
import numpy as np


class PatternDetector:

    @staticmethod
    def detect(image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        edges = cv2.Canny(
            gray,
            50,
            150,
        )

        edge_density = (
            np.count_nonzero(edges)
            / edges.size
        )

        lines = cv2.HoughLinesP(
            edges,
            1,
            np.pi / 180,
            80,
            minLineLength=40,
            maxLineGap=10,
        )

        horizontal = 0
        vertical = 0
        diagonal = 0

        if lines is not None:

            for line in lines:

                try:
                    # Handle different OpenCV output formats
                    line = np.array(line).flatten()

                    if len(line) != 4:
                        continue

                    x1, y1, x2, y2 = map(int, line)

                    angle = abs(
                        np.degrees(
                            np.arctan2(
                                y2 - y1,
                                x2 - x1,
                            )
                        )
                    )

                    if angle < 15 or angle > 165:
                        horizontal += 1

                    elif 75 <= angle <= 105:
                        vertical += 1

                    else:
                        diagonal += 1

                except Exception:
                    # Skip malformed lines instead of crashing
                    continue

        pattern = PatternDetector.get_pattern(
            edge_density,
            horizontal,
            vertical,
            diagonal,
        )

        confidence = PatternDetector.get_confidence(
            horizontal,
            vertical,
            diagonal,
        )

        return {

            "pattern": pattern,

            "pattern_confidence": confidence,

            "horizontal_lines": horizontal,

            "vertical_lines": vertical,

            "diagonal_lines": diagonal,

        }

    @staticmethod
    def get_pattern(
        edge_density,
        horizontal,
        vertical,
        diagonal,
    ):

        if edge_density < 0.02:
            return "Plain"

        if horizontal > 20 and vertical < 10:
            return "Stripes"

        if vertical > 20 and horizontal < 10:
            return "Stripes"

        if horizontal > 15 and vertical > 15:
            return "Checks"

        if diagonal > 35:
            return "Chevron"

        if edge_density > 0.30:
            return "Printed"

        if edge_density > 0.22:
            return "Geometric"

        if edge_density > 0.16:
            return "Abstract"

        return "Plain"

    @staticmethod
    def get_confidence(
        horizontal,
        vertical,
        diagonal,
    ):

        total = (
            horizontal
            + vertical
            + diagonal
        )

        if total == 0:
            return 50.0

        dominant = max(
            horizontal,
            vertical,
            diagonal,
        )

        return round(
            (dominant / total) * 100,
            2,
        )