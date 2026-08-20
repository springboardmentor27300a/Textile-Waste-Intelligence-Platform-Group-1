import cv2
import numpy as np


class TextureDetector:

    @staticmethod
    def detect(image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        edges = cv2.Canny(
            gray,
            100,
            200,
        )

        edge_density = (
            np.count_nonzero(edges)
            / edges.size
        )

        variance = float(
            np.var(gray)
        )

        texture = TextureDetector.get_texture(
            edge_density,
            variance,
        )

        return {

            "texture": texture,

            "edge_density": round(
                edge_density,
                4,
            ),

            "texture_variance": round(
                variance,
                2,
            ),

        }

    @staticmethod
    def get_texture(
        edge_density,
        variance,
    ):

        if edge_density < 0.03:

            return "Silky"

        elif edge_density < 0.05:

            return "Smooth"

        elif edge_density < 0.08:

            return "Soft"

        elif edge_density < 0.12:

            return "Knit"

        elif edge_density < 0.16:

            return "Woven"

        elif edge_density < 0.22:

            return "Denim"

        elif edge_density < 0.28:

            return "Canvas"

        elif edge_density < 0.35:

            return "Fleece"

        return "Rough"