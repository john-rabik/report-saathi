import shutil
from fastapi import APIRouter
import pytesseract
from app.core.config import settings
from app.models.schemas import HealthCheckResponse

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    # Verify Tesseract OCR engine
    ocr_ok = False
    try:
        ver = pytesseract.get_tesseract_version()
        ocr_ok = bool(ver)
    except Exception:
        ocr_ok = bool(shutil.which("tesseract"))

    return HealthCheckResponse(
        status="healthy",
        version=settings.VERSION,
        ocrAvailable=ocr_ok,
        geminiConfigured=bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10),
        supabaseConfigured=bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    )
