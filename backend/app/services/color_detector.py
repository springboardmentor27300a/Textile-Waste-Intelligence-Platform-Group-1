import cv2
import numpy as np


class ColorDetector:

    @staticmethod
    def detect(image):

        height, width = image.shape[:2]

        rgb = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB,
        )

        hsv = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2HSV,
        )

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY,
        )

        brightness = float(
            np.mean(gray)
        )

        contrast = float(
            np.std(gray)
        )

        # --------------------------------------------------
        # Average RGB
        # --------------------------------------------------

        average = rgb.mean(
            axis=0
        ).mean(axis=0)

        red = int(average[0])
        green = int(average[1])
        blue = int(average[2])

        # --------------------------------------------------
        # Dominant / Secondary Colors
        # --------------------------------------------------

        dominant = ColorDetector.get_color_name(
            red,
            green,
            blue,
        )

        second = ColorDetector.get_secondary_color(
            red,
            green,
            blue,
        )

        # --------------------------------------------------
        # Color Palette
        #
        # ImageProcessor expects:
        #
        # color_data["color_palette"]
        #
        # Return a useful palette rather than only
        # the dominant color.
        # --------------------------------------------------

        color_palette = ColorDetector.get_color_palette(
            rgb
        )

        return {

            "image_width": width,

            "image_height": height,

            "brightness": round(
                brightness,
                2,
            ),

            "contrast": round(
                contrast,
                2,
            ),

            "rgb": f"{red}, {green}, {blue}",

            "dominant_color": dominant,

            "secondary_color": second,

            "color_palette": color_palette,

        }

    # ======================================================
    # COLOR NAME
    # ======================================================

    @staticmethod
    def get_color_name(
        r,
        g,
        b,
    ):

        if max(r, g, b) < 40:
            return "Black"

        if min(r, g, b) > 220:
            return "White"

        if (
            abs(r - g) < 15
            and abs(g - b) < 15
        ):
            return "Gray"

        if (
            r > 180
            and g < 90
            and b < 90
        ):
            return "Red"

        if (
            r > 150
            and g > 80
            and b < 70
        ):
            return "Orange"

        if (
            r > 180
            and g > 180
            and b < 90
        ):
            return "Yellow"

        if (
            g > r
            and g > b
        ):
            return "Green"

        if (
            b > r
            and b > g
        ):
            return "Blue"

        if (
            r > 120
            and b > 120
        ):
            return "Purple"

        if (
            r > 120
            and g > 80
            and b > 60
        ):
            return "Brown"

        if (
            r > 180
            and b > 180
        ):
            return "Pink"

        return "Multicolor"

    # ======================================================
    # SECONDARY COLOR
    # ======================================================

    @staticmethod
    def get_secondary_color(
        r,
        g,
        b,
    ):

        values = {

            "Red": r,

            "Green": g,

            "Blue": b,

        }

        values = sorted(
            values.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        return values[1][0]

    # ======================================================
    # COLOR PALETTE
    # ======================================================

    @staticmethod
    def get_color_palette(
        rgb_image,
        k=5,
    ):
        """
        Extract a compact color palette from the image.

        Returns a list of human-readable color names.

        Example:

        [
            "Blue",
            "Gray",
            "White",
            "Black",
            "Purple"
        ]
        """

        # --------------------------------------------------
        # Resize for faster processing
        # --------------------------------------------------

        small = cv2.resize(
            rgb_image,
            (
                100,
                100,
            ),
            interpolation=cv2.INTER_AREA,
        )

        pixels = small.reshape(
            -1,
            3,
        ).astype(
            np.float32
        )

        # --------------------------------------------------
        # Remove extreme noise
        # --------------------------------------------------

        if len(pixels) == 0:
            return []

        # --------------------------------------------------
        # Simple color quantization
        #
        # We deliberately avoid requiring sklearn.
        # --------------------------------------------------

        criteria = (
            cv2.TERM_CRITERIA_EPS
            + cv2.TERM_CRITERIA_MAX_ITER,
            20,
            1.0,
        )

        attempts = 3

        try:

            _, labels, centers = cv2.kmeans(
                pixels,
                k,
                None,
                criteria,
                attempts,
                cv2.KMEANS_PP_CENTERS,
            )

        except Exception:

            # Safe fallback if k-means cannot run
            average = pixels.mean(
                axis=0
            )

            return [
                ColorDetector.get_color_name(
                    int(average[0]),
                    int(average[1]),
                    int(average[2]),
                )
            ]

        # --------------------------------------------------
        # Count cluster sizes
        # --------------------------------------------------

        labels = labels.flatten()

        counts = np.bincount(
            labels,
            minlength=k,
        )

        # Largest clusters first
        order = np.argsort(
            counts
        )[::-1]

        palette = []

        for index in order:

            if counts[index] <= 0:
                continue

            center = centers[index]

            r = int(
                np.clip(
                    center[0],
                    0,
                    255,
                )
            )

            g = int(
                np.clip(
                    center[1],
                    0,
                    255,
                )
            )

            b = int(
                np.clip(
                    center[2],
                    0,
                    255,
                )
            )

            color_name = ColorDetector.get_color_name(
                r,
                g,
                b,
            )

            if color_name not in palette:

                palette.append(
                    color_name
                )

            if len(palette) >= 5:
                break

        # --------------------------------------------------
        # Guarantee a non-empty result
        # --------------------------------------------------

        if not palette:

            average = pixels.mean(
                axis=0
            )

            palette.append(
                ColorDetector.get_color_name(
                    int(average[0]),
                    int(average[1]),
                    int(average[2]),
                )
            )

        return palette