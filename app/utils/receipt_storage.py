import os
import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile


MAX_RECEIPT_SIZE = 10 * 1024 * 1024
ALLOWED_RECEIPT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
UPLOAD_DIR = Path(os.getenv("RECEIPT_UPLOAD_DIR", "app/uploads/receipts"))


def validate_receipt(upload: UploadFile):
    if upload.content_type not in ALLOWED_RECEIPT_TYPES:
        raise HTTPException(400, "Receipt must be a JPEG, PNG, or PDF file")


async def save_receipt(upload: UploadFile):
    validate_receipt(upload)
    content = await upload.read(MAX_RECEIPT_SIZE + 1)
    if not content:
        raise HTTPException(400, "Receipt file is empty")
    if len(content) > MAX_RECEIPT_SIZE:
        raise HTTPException(400, "Receipt must not exceed 10 MB")

    extension = Path(upload.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".pdf"}:
        extension = {"image/jpeg": ".jpg", "image/png": ".png", "application/pdf": ".pdf"}[upload.content_type]

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{extension}"
    (UPLOAD_DIR / stored_name).write_bytes(content)
    display_name = re.sub(r"[^A-Za-z0-9._ -]", "_", upload.filename or f"receipt{extension}")
    return {"stored_name": stored_name, "file_name": display_name, "content_type": upload.content_type, "size": len(content)}


def receipt_path(receipt):
    if not receipt or not receipt.get("stored_name"):
        return None
    path = (UPLOAD_DIR / receipt["stored_name"]).resolve()
    if UPLOAD_DIR.resolve() not in path.parents:
        return None
    return path


def remove_receipt(receipt):
    path = receipt_path(receipt)
    if path and path.is_file():
        path.unlink()
