import os
from typing import Optional, List
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings
from app.models.schemas import (
    ReportAnalyzeResponse, 
    ExtractedParameter, 
    GeminiAnalysisResponse
)
from app.services.extractor import (
    process_file_with_safe_temp, 
    ExtractionError, 
    EmptyOCRError
)
from app.services.sanitizer import sanitize_text
from app.services.parser import parse_parameters_from_text
from app.services.gemini_service import analyze_with_gemini

router = APIRouter()

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}

class ExplainTextRequest(BaseModel):
    raw_text: str
    report_title: Optional[str] = "Laboratory Findings"

@router.post("/analyze", response_model=ReportAnalyzeResponse)
async def analyze_report(file: UploadFile = File(...)):
    """
    Accepts PDF, JPG, or PNG upload.
    Validates file type and size (<= 10MB).
    Uses safe temporary file handling with guaranteed cleanup.
    Extracts text from PDFs, and uses Tesseract OCR for images or scanned PDFs.
    Sanitizes PII/PHI before AI invocation.
    Integrates Gemini API for structured educational explanations.
    Clearly distinguishes source-extracted facts from AI explanations.
    Never invents missing values or reference ranges.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was provided in the upload request."
        )

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    # 1. Validate File Format
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file format '{ext}'. ReportSaathi only accepts PDF documents (.pdf) "
                "or clear image scans (.jpg, .jpeg, .png)."
            )
        )

    # 2. Read contents & Validate File Size
    contents = await file.read()
    file_size = len(contents)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid document."
        )

    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File size ({(file_size / (1024 * 1024)):.2f} MB) exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB limit. "
                "Please compress the PDF or resize the image."
            )
        )

    # 3. Safe Temporary File Handling & Text Extraction
    try:
        raw_text, extraction_method, page_count = process_file_with_safe_temp(contents, filename)
    except EmptyOCRError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except ExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during document processing: {str(e)}"
        )

    # 4. Sanitize Personal Identifiable Information (PII)
    sanitized_text = sanitize_text(raw_text)

    # 5. Extract Source Facts (Deterministic OCR/regex facts)
    source_facts = parse_parameters_from_text(raw_text)

    # 6. Gemini AI Integration (Structured JSON Explanation)
    ai_analysis, ai_provider, ai_status = analyze_with_gemini(sanitized_text, source_facts)

    notes = [
        f"Document extracted via {extraction_method} ({page_count} page(s)).",
        "Personal identifying data (patient name, phone, address) automatically redacted before AI analysis.",
        f"Deterministic engine identified {len(source_facts)} source parameter(s).",
        f"AI explanation generated via {ai_provider} (Status: {ai_status})."
    ]

    return ReportAnalyzeResponse(
        status="success",
        filename=filename,
        file_type=ext.lstrip('.'),
        file_size_bytes=file_size,
        extraction_method=extraction_method,
        page_count=page_count,
        raw_text=raw_text,
        sanitized_text=sanitized_text,
        source_extracted_facts=source_facts,
        ai_analysis=ai_analysis,
        ai_provider=ai_provider,
        ai_status=ai_status,
        processing_notes=notes,
        is_anonymized=True
    )

@router.post("/explain-text", response_model=ReportAnalyzeResponse)
def explain_raw_text(req: ExplainTextRequest):
    """
    Explains raw laboratory test values pasted directly as text.
    """
    sanitized = sanitize_text(req.raw_text)
    source_facts = parse_parameters_from_text(req.raw_text)
    ai_analysis, ai_provider, ai_status = analyze_with_gemini(sanitized, source_facts)

    return ReportAnalyzeResponse(
        status="success",
        filename=req.report_title or "Pasted_Notes.txt",
        file_type="txt",
        file_size_bytes=len(req.raw_text.encode('utf-8')),
        extraction_method="direct_text_input",
        page_count=1,
        raw_text=req.raw_text,
        sanitized_text=sanitized,
        source_extracted_facts=source_facts,
        ai_analysis=ai_analysis,
        ai_provider=ai_provider,
        ai_status=ai_status,
        processing_notes=["Direct text parsed", "PII sanitized", f"AI processed via {ai_provider}"],
        is_anonymized=True
    )

# Alias for backward compatibility
@router.post("/upload")
async def upload_legacy(file: UploadFile = File(...)):
    """Legacy upload endpoint pointing to /analyze."""
    return await analyze_report(file)
