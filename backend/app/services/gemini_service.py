import json
import logging
import os
from typing import List, Tuple, Optional
from pydantic import ValidationError
from app.core.config import settings
from app.models.schemas import (
    GeminiAnalysisResponse, 
    GeminiExtractedItem, 
    ExtractedParameter
)

logger = logging.getLogger(__name__)

GEMINI_SYSTEM_INSTRUCTION = """
You are ReportSaathi AI, an educational health literacy assistant explaining laboratory medical reports in plain, simple language for patients.

MANDATORY RULES & CONSTRAINTS:
1. NON-DIAGNOSTIC: Never say "You have anemia", "You are diabetic", or "You have infection". Instead, use tentative, educational framing such as "This test measures oxygen-carrying proteins...", "When this value sits below standard intervals, doctors often investigate nutritional or physiological factors...".
2. NO PRESCRIPTIONS: Never suggest medication names, dosages, supplements, or specific treatment regimens.
3. NO CLAIMS OF CERTAINTY: Medical interpretations always require clinical correlation. Use words like "may indicate", "is commonly evaluated alongside", "your physician will review".
4. NEVER INVENT SOURCE FACTS:
   - Do NOT invent or guess test values. If missing or illegible in the text, return null.
   - Do NOT invent units. If missing, return null.
   - Do NOT invent reference ranges. If the report text does NOT explicitly state a reference range for a test, return null for reference_range. Do not supply standard reference ranges from your general knowledge.
5. EXPLICITLY NOTE UNCLEAR OR MISSING DETAILS:
   - If values, units, or reference intervals are missing, truncated, or blurred, explicitly set notes_and_clarity to describe what is missing or unclear.
   - If the report is incomplete, blurry, or contradictory, set is_report_clear to false and note this clearly in missing_or_unclear_notes.
6. MANDATORY CLINICAL CONSULT NOTICE: Always remind the patient to consult a qualified clinician.

REQUIRED OUTPUT STRUCTURE:
Return strictly valid JSON conforming to the GeminiAnalysisResponse schema:
{
  "is_report_clear": true | false,
  "clinical_consult_notice": "Please consult a qualified clinician to interpret these findings in the context of your complete health history.",
  "summary": "1-2 paragraphs plain-English educational summary",
  "items": [
    {
      "test_name": "Test Name from report",
      "extracted_value": "10.8",
      "unit": "g/dL",
      "reference_range": "12.0 - 15.5 g/dL" or null,
      "status": "normal" | "low" | "high" | "unspecified",
      "simple_explanation": "Plain language explanation of what this marker generally does in the body. No diagnosis.",
      "notes_and_clarity": "Note if reference range or units were missing, or null"
    }
  ],
  "questions_for_doctor": [
    "Specific question 1 for doctor",
    "Specific question 2 for doctor",
    "Specific question 3 for doctor"
  ],
  "missing_or_unclear_notes": "Note describing any missing or unclear parts of the report, or null"
}
"""

def generate_fallback_analysis(
    sanitized_text: str, 
    source_facts: List[ExtractedParameter],
    reason: str = "Fallback mode"
) -> GeminiAnalysisResponse:
    """
    Generates a deterministic educational analysis when GEMINI_API_KEY is not configured
    or when API invocation fails. Strictly respects all safety and non-invention rules.
    """
    items: List[GeminiExtractedItem] = []
    has_unclear = False
    unclear_reasons: List[str] = []

    for fact in source_facts:
        notes = fact.note
        if not fact.reference_interval:
            has_unclear = True
            notes = "Reference interval not stated in the report document — not invented per safety rules."
            unclear_reasons.append(f"{fact.name}: reference interval was not stated in report")

        explanation = fact.what_it_is or f"{fact.name} is a standard diagnostic test marker."
        if fact.status == "normal":
            explanation += " Your observed level sits within the reported reference boundary."
        elif fact.status in ["low", "high"]:
            explanation += f" Your observed level sits {fact.status}er than the reported reference limit, an ideal topic to discuss with your doctor."
        else:
            explanation += " Awaiting clinical evaluation of reference boundaries with your physician."

        items.append(GeminiExtractedItem(
            test_name=fact.name,
            extracted_value=fact.observed_value,
            unit=fact.unit or None,
            reference_range=fact.reference_interval,
            status=fact.status or "unspecified",
            simple_explanation=explanation,
            notes_and_clarity=notes
        ))

    # Doctor questions tailored to extracted items
    flagged = [it for it in items if it.status in ["low", "high"]]
    questions = []
    if flagged:
        for f in flagged[:2]:
            questions.append(
                f"My {f.test_name} is reported as {f.extracted_value} {f.unit or ''} ({f.status}). What clinical or lifestyle factors might explain this?"
            )
        questions.append("Would you recommend repeating this test in a few weeks to monitor any changes?")
    else:
        questions.append("Are there any preventive diet or lifestyle habits I should maintain based on these results?")
        questions.append("When should I schedule my next routine checkup?")

    questions.append("How do these numbers fit into my overall symptoms and medical background?")

    summary_text = (
        f"This document contains {len(items)} identified laboratory marker(s). "
    )
    if flagged:
        flagged_str = ", ".join([f"{f.test_name} ({f.status})" for f in flagged])
        summary_text += (
            f"{len(flagged)} item(s) sit outside the reported reference boundaries: {flagged_str}. "
            "Isolated out-of-range readings are very common and should never be viewed as self-diagnoses; "
            "they are best evaluated in clinical context by your doctor."
        )
    else:
        summary_text += "Extracted values with reported reference intervals appear within their respective limits."

    missing_note = None
    if unclear_reasons:
        missing_note = "Note: " + "; ".join(unclear_reasons) + "."

    return GeminiAnalysisResponse(
        is_report_clear=True,
        clinical_consult_notice=(
            "Please consult a licensed medical clinician to interpret these findings in the context of your complete medical history."
        ),
        summary=summary_text,
        items=items,
        questions_for_doctor=questions,
        missing_or_unclear_notes=missing_note
    )

def analyze_with_gemini(
    sanitized_text: str, 
    source_facts: List[ExtractedParameter]
) -> Tuple[GeminiAnalysisResponse, str, str]:
    """
    Sends sanitized report text to the Gemini API using the google-genai SDK.
    Validates output with Pydantic.
    Returns: (GeminiAnalysisResponse, ai_provider, ai_status)
    """
    # 1. Read API key from server-side environment variable
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY

    if not api_key or len(api_key.strip()) < 10:
        logger.info("GEMINI_API_KEY is not set in server environment. Using deterministic educational fallback.")
        fallback = generate_fallback_analysis(sanitized_text, source_facts, reason="GEMINI_API_KEY not configured")
        return fallback, "heuristic_fallback", "key_missing"

    # 2. Call Gemini API
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key.strip())
        
        prompt = f"""
        Please examine this sanitized medical laboratory report text and generate a structured educational interpretation.
        
        REPORT TEXT:
        \"\"\"{sanitized_text}\"\"\"
        
        REMEMBER:
        - NEVER invent values, units, or reference ranges. If not explicitly in the text, use null.
        - NEVER diagnose or prescribe.
        - If text is ambiguous or missing parts, state so in notes_and_clarity.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.1,  # Low temperature for strict factual accuracy
            )
        )

        if not response or not response.text:
            raise ValueError("Gemini API returned an empty response.")

        # 3. Validate Gemini output against Pydantic schema
        validated_analysis = GeminiAnalysisResponse.model_validate_json(response.text)

        # 4. Enforce safety post-check: verify reference ranges are not hallucinated
        # If an item has reference_range, verify it or part of it appeared in sanitized_text
        for item in validated_analysis.items:
            if item.reference_range:
                # Basic check: do any digits of the range exist in the text?
                has_any_match = any(num in sanitized_text for num in item.reference_range.split() if num.replace('.', '').isdigit())
                if not has_any_match:
                    # Strip hallucinated reference range per strict safety rules
                    item.reference_range = None
                    item.status = "unspecified"
                    item.notes_and_clarity = (
                        "Reference range omitted because it was not explicitly confirmed in source text."
                    )

        return validated_analysis, "gemini-2.5-flash", "success"

    except (ValidationError, json.JSONDecodeError) as val_err:
        logger.warning(f"Gemini output validation failed ({val_err}). Engaging safe fallback.")
        fallback = generate_fallback_analysis(sanitized_text, source_facts, reason="Gemini response validation failed")
        return fallback, "heuristic_fallback", "api_error_fallback"

    except Exception as e:
        logger.warning(f"Gemini API call failed: {str(e)}. Engaging safe fallback.")
        fallback = generate_fallback_analysis(sanitized_text, source_facts, reason=f"Gemini API error: {str(e)[:60]}")
        return fallback, "heuristic_fallback", "api_error_fallback"
