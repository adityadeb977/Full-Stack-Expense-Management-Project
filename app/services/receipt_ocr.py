import re


def extract_receipt_details(file_path, content_type):
    """Best-effort OCR. Requires optional Pillow, pytesseract, and Tesseract installed."""
    if not content_type.startswith("image/"):
        return {"available": False, "reason": "OCR is currently available for receipt images only."}
    try:
        from PIL import Image
        import pytesseract
    except ImportError:
        return {"available": False, "reason": "OCR is not configured on this server."}

    text = pytesseract.image_to_string(Image.open(file_path))
    amounts = re.findall(r"(?:total|amount|grand total)\D{0,12}(\d+(?:[,.]\d{2})?)", text, re.IGNORECASE)
    return {"available": True, "text": text[:4000], "suggested_amount": float(amounts[-1].replace(",", "")) if amounts else None}
