from pathlib import Path

import cv2
import pytesseract

from config import get_settings

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def _load_image(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Could not read uploaded image.")
    return image


def _make_variants(image):
    """
    Create OCR-friendly variants from one image region.
    """
    # upscale for small timetable text
    image = cv2.resize(image, None, fx=2.6, fy=2.6, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)

    adaptive = cv2.adaptiveThreshold(
        blur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )

    _, otsu = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return [gray, adaptive, otsu]


def _get_regions(image):
    """
    OCR the full image + 3 vertical timetable sections.
    This helps for compact table layouts.
    """
    h, w = image.shape[:2]

    regions = [image]  # full image first

    # 3 vertical chunks
    left = image[:, : w // 3]
    middle = image[:, w // 3 : 2 * w // 3]
    right = image[:, 2 * w // 3 :]

    regions.extend([left, middle, right])
    return regions


def _ocr_region_variants(region):
    settings = get_settings()
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

    whitelist = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()-/ &"
    configs = [
        f'--oem 3 --psm 4 -c tessedit_char_whitelist="{whitelist}"',
        f'--oem 3 --psm 6 -c tessedit_char_whitelist="{whitelist}"',
        f'--oem 3 --psm 11 -c tessedit_char_whitelist="{whitelist}"',
    ]

    all_texts = []

    for variant in _make_variants(region):
        for config in configs:
            text = pytesseract.image_to_string(variant, config=config)
            if text:
                all_texts.append(text)

            data = pytesseract.image_to_data(
                variant,
                config=config,
                output_type=pytesseract.Output.DICT,
            )

            words = []
            n = len(data["text"])
            for i in range(n):
                token = data["text"][i].strip()
                conf = data["conf"][i]

                try:
                    conf_value = float(conf)
                except Exception:
                    conf_value = -1

                if token and conf_value >= 15:
                    words.append(token)

            if words:
                all_texts.append(" ".join(words))

    return "\n".join(all_texts)


def extract_text_from_image(image_path: str) -> str:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError("Uploaded file not found on disk.")

    extension = path.suffix.lower()
    if extension not in IMAGE_EXTENSIONS:
        raise ValueError("OCR currently supports image files only (.png, .jpg, .jpeg, .webp).")

    image = _load_image(str(path))
    regions = _get_regions(image)

    texts = []
    for region in regions:
        region_text = _ocr_region_variants(region)
        if region_text:
            texts.append(region_text)

    return "\n".join(texts).strip()