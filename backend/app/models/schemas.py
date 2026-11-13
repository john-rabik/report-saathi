from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# SOURCE-EXTRACTED FACTS SCHEMA (Deterministic OCR/PDF extraction)
# -------------------------------------------------------------
class ExtractedParameter(BaseModel):
    name: str
    observed_value: Optional[str] = None
    unit: Optional[str] = None
    reference_interval: Optional[str] = None  # None if missing in report - NEVER INVENT
    status: Optional[str] = Field(
        default="unspecified",
        description="'normal', 'low', 'high', or 'unspecified'"
    )
    what_it_is: Optional[str] = None
    what_it_means: Optional[str] = None
    note: Optional[str] = None

# -------------------------------------------------------------
# GEMINI AI STRUCTURED OUTPUT SCHEMA (Educational Interpretation)
# -------------------------------------------------------------
class GeminiExtractedItem(BaseModel):
    # Source-extracted facts as identified by Gemini from the document text
    test_name: str = Field(description="Name of the test as written in the report")
    extracted_value: Optional[str] = Field(
        default=None, 
        description="Exact observed numeric or qualitative value from the report, or null if missing. NEVER invent."
    )
    unit: Optional[str] = Field(
        default=None, 
        description="Exact unit of measurement as stated in the report, or null if missing. NEVER invent."
    )
    reference_range: Optional[str] = Field(
        default=None, 
        description="Exact reference range stated in the report. MUST BE null if not explicitly present in the document. NEVER invent a range."
    )
    status: Optional[str] = Field(
        default="unspecified", 
        description="'normal', 'low', 'high', or 'unspecified' if reference range is absent or unclear"
    )
    
    # AI-generated explanations clearly distinguished
    simple_explanation: str = Field(
        description="Everyday plain-language educational explanation of what this marker generally does in the human body. Do not diagnose or prescribe."
    )
    notes_and_clarity: Optional[str] = Field(
        default=None, 
        description="Explicit note if values, units, or reference intervals are missing, blurry, or ambiguous."
    )

class GeminiAnalysisResponse(BaseModel):
    is_report_clear: bool = Field(
        default=True,
        description="True if the report text was legible and coherent; False if incomplete, blurry, or missing key data."
    )
    clinical_consult_notice: str = Field(
        default="Please consult a licensed medical clinician to interpret these findings in the context of your complete medical history.",
        description="Mandatory notice advising consultation with a healthcare professional."
    )
    summary: str = Field(
        description="High-level educational summary of the analyzed report in plain language without diagnosing or claiming clinical certainty."
    )
    items: List[GeminiExtractedItem] = Field(
        default=[],
        description="Structured list of extracted test items"
    )
    questions_for_doctor: List[str] = Field(
        default=[],
        description="3-4 practical questions the user can take to their physician."
    )
    missing_or_unclear_notes: Optional[str] = Field(
        default=None,
        description="Global note highlighting any missing reference ranges, truncated sections, or ambiguous lines."
    )

# -------------------------------------------------------------
# COMPLETE API RESPONSE SCHEMA
# -------------------------------------------------------------
class ReportAnalyzeResponse(BaseModel):
    status: str = Field(description="'success' or 'error'")
    filename: str
    file_type: str
    file_size_bytes: int
    extraction_method: str = Field(description="'pdf_digital_text', 'pdf_scanned_ocr', or 'image_tesseract_ocr'")
    page_count: int = 1
    
    # Source-extracted facts (Deterministic)
    raw_text: str
    sanitized_text: str
    source_extracted_facts: List[ExtractedParameter] = []
    
    # Gemini AI Analysis (Structured & Validated)
    ai_analysis: Optional[GeminiAnalysisResponse] = None
    ai_provider: str = Field(default="gemini-2.5-flash", description="AI model or fallback provider")
    ai_status: str = Field(default="success", description="'success', 'key_missing', or 'api_error_fallback'")
    
    processing_notes: List[str] = []
    is_anonymized: bool = True
    
    # Educational disclaimer
    disclaimer: str = (
        "ReportSaathi is an educational health literacy tool and does not provide medical diagnoses, "
        "treatment plans, or prescriptions. Always consult a licensed healthcare professional to discuss your lab findings."
    )

# -------------------------------------------------------------
# HEALTH CHECK & LEGACY MODELS
# -------------------------------------------------------------
class HealthCheckResponse(BaseModel):
    status: str
    version: str
    ocrAvailable: bool
    geminiConfigured: bool
    supabaseConfigured: bool
