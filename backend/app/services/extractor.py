import os
import shutil
import tempfile
import io
from typing import Tuple, List
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import pymupdf
from app.core.config import settings

class ExtractionError(Exception):
    """Custom exception raised when file cannot be read or processed."""
    pass

class EmptyOCRError(Exception):
    """Custom exception raised when OCR or text extraction produces no readable text."""
    pass

# Configure Tesseract path
if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
else:
    tesseract_in_path = shutil.which("tesseract")
    if tesseract_in_path:
        pytesseract.pytesseract.tesseract_cmd = tesseract_in_path
    elif os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Applies image enhancement (grayscale, contrast boosting, and edge sharpening)
    to maximize OCR character recognition on smartphone photos and low-contrast scans.
    """
    # Convert to grayscale
    gray = image.convert('L')
    
    # Boost contrast for clear ink-to-paper separation
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)
    
    # Sharpen character boundaries
    sharpened = enhanced.filter(ImageFilter.SHARPEN)
    return sharpened

def ocr_image_file(file_path: str) -> str:
    """
    Performs Tesseract OCR on an image file path with error handling.
    """
    try:
        with Image.open(file_path) as img:
            processed = preprocess_image(img)
            # PSM 6: Assume a single uniform block of text; fallback to default if short
            text = pytesseract.image_to_string(processed, config=r'--oem 3 --psm 6').strip()
            if len(text) < 20:
                text = pytesseract.image_to_string(img).strip()
            return text
    except Exception as e:
        raise ExtractionError(f"Failed to process image with OCR: {str(e)}")

def extract_from_pdf_file(file_path: str) -> Tuple[str, str, int]:
    """
    Extracts text from a PDF file safely.
    Uses digital text extraction first. If pages are scanned (empty digital text),
    renders the page at 300 DPI and applies Tesseract OCR.
    Returns (extracted_text, method, page_count).
    """
    try:
        doc = pymupdf.open(file_path)
    except Exception as e:
        raise ExtractionError(f"The PDF file could not be opened or is corrupted: {str(e)}")

    page_count = len(doc)
    if page_count == 0:
        raise ExtractionError("The PDF document contains 0 pages.")

    all_pages_text: List[str] = []
    used_ocr = False

    for page_idx in range(page_count):
        page = doc[page_idx]
        digital_text = page.get_text().strip()

        # If digital text exists and has reasonable density, use it
        if len(digital_text) > 30:
            all_pages_text.append(f"--- Page {page_idx + 1} ---\n{digital_text}")
        else:
            # Page appears to be a scanned image: render at 300 DPI for OCR
            used_ocr = True
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            with Image.open(io.BytesIO(img_bytes)) as img:
                processed = preprocess_image(img)
                ocr_text = pytesseract.image_to_string(processed, config=r'--oem 3 --psm 6').strip()
                if len(ocr_text) < 20:
                    ocr_text = pytesseract.image_to_string(img).strip()
                all_pages_text.append(f"--- Page {page_idx + 1} (OCR) ---\n{ocr_text}")

    doc.close()
    combined_text = "\n\n".join(all_pages_text).strip()
    method = "pdf_scanned_ocr" if used_ocr else "pdf_digital_text"
    return combined_text, method, page_count

def process_file_with_safe_temp(file_bytes: bytes, filename: str) -> Tuple[str, str, int]:
    """
    Safely writes incoming bytes to a temporary file, detects document type,
    performs extraction with Tesseract fallback, and guarantees temp file deletion in finally.
    Returns (extracted_text, method, page_count).
    """
    ext = os.path.splitext(filename)[1].lower()
    temp_file = None

    try:
        # Create safe temporary file with correct extension
        temp_file = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
        temp_file.write(file_bytes)
        temp_file.flush()
        temp_file_path = temp_file.name
        temp_file.close()

        if ext == '.pdf':
            text, method, pages = extract_from_pdf_file(temp_file_path)
        elif ext in ['.jpg', '.jpeg', '.png']:
            text = ocr_image_file(temp_file_path)
            method = "image_tesseract_ocr"
            pages = 1
        else:
            raise ExtractionError(f"Unsupported file format '{ext}'. Allowed: .pdf, .jpg, .jpeg, .png")

        # Validate that OCR or extraction did not return blank text
        if not text or len(text.strip()) < 10:
            raise EmptyOCRError(
                "No readable text could be extracted from this document. "
                "Please ensure the report image is clear, well-lit, and not overly compressed or blurred."
            )

        return text, method, pages

    finally:
        # Guarantee safe temporary-file deletion
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception:
                pass
