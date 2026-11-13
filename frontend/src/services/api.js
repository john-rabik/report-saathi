const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend not reachable:', err);
    return null;
  }
}

export function normalizeReportData(apiResponse) {
  // If response already matches legacy structure
  if (apiResponse.metrics && !apiResponse.ai_analysis) {
    return apiResponse;
  }

  const ai = apiResponse.ai_analysis || {};
  const aiItems = ai.items || [];
  const sourceFacts = apiResponse.source_extracted_facts || [];

  // Determine items to display: prioritize Gemini AI items, fallback to source facts
  let metrics = [];

  if (aiItems.length > 0) {
    metrics = aiItems.map((item, idx) => {
      let position = 50;
      if (item.status === 'low') position = 25;
      if (item.status === 'high') position = 80;

      return {
        id: `ai-item-${idx}`,
        name: item.test_name,
        category: "Laboratory Marker",
        // SOURCE-EXTRACTED FACT
        value: item.extracted_value || "Detected in document",
        unit: item.unit || "",
        referenceRangeStr: item.reference_range || "Not specified in report",
        status: item.status || "unspecified",
        rangePositionPercent: position,
        // AI-GENERATED EXPLANATION (Clearly distinguished)
        whatItIs: item.simple_explanation || `Educational parameter: ${item.test_name}`,
        whatItMeans: item.status === 'unspecified'
          ? "No reference boundary was provided in the report. Your clinician will interpret this number."
          : `Observed level is ${item.extracted_value} ${item.unit || ''} (${item.status}).`,
        notesAndClarity: item.notes_and_clarity,
        isSourceFact: Boolean(item.extracted_value),
        hasExplicitRange: Boolean(item.reference_range)
      };
    });
  } else if (sourceFacts.length > 0) {
    metrics = sourceFacts.map((p, idx) => {
      let position = 50;
      if (p.status === 'low') position = 25;
      if (p.status === 'high') position = 80;

      return {
        id: `source-fact-${idx}`,
        name: p.name,
        category: "Extracted Marker",
        value: p.observed_value || "Detected",
        unit: p.unit || "",
        referenceRangeStr: p.reference_interval || "Not specified in report",
        status: p.status || "unspecified",
        rangePositionPercent: position,
        whatItIs: p.what_it_is || `Laboratory parameter: ${p.name}`,
        whatItMeans: p.what_it_means || `Observed value is ${p.observed_value} ${p.unit}.`,
        notesAndClarity: p.note,
        isSourceFact: true,
        hasExplicitRange: Boolean(p.reference_interval)
      };
    });
  }

  const flaggedCount = metrics.filter(m => m.status === 'low' || m.status === 'high').length;

  return {
    id: `rep-${Date.now()}`,
    title: apiResponse.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
    type: `${(apiResponse.file_type || 'PDF').toUpperCase()} Analysis (${apiResponse.extraction_method || 'OCR'})`,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    laboratory: "Uploaded Clinical Document",
    sourceFile: apiResponse.filename,
    summary: ai.summary || "Extracted laboratory document successfully sanitized and analyzed.",
    overallStatus: flaggedCount > 0 ? "Attention Needed" : "Within Reported Boundaries",
    metrics: metrics,
    keyTakeaways: apiResponse.processing_notes || [
      `Extracted via ${apiResponse.extraction_method}`,
      `PII data sanitized before analysis`,
      `AI Provider: ${apiResponse.ai_provider || 'Gemini'}`
    ],
    doctorQuestions: ai.questions_for_doctor && ai.questions_for_doctor.length > 0
      ? ai.questions_for_doctor
      : [
          "How do these findings correlate with my physical health?",
          "When would you recommend a follow-up test?"
        ],
    lifestyleNote: ai.clinical_consult_notice || "Please consult a qualified medical professional for diagnosis.",
    rawText: apiResponse.raw_text,
    sanitizedText: apiResponse.sanitized_text,
    extractionMethod: apiResponse.extraction_method,
    pageCount: apiResponse.page_count,
    isReportClear: ai.is_report_clear !== false,
    missingOrUnclearNotes: ai.missing_or_unclear_notes,
    aiProvider: apiResponse.ai_provider,
    aiStatus: apiResponse.ai_status,
    disclaimer: apiResponse.disclaimer,
    isRealBackendData: true
  };
}

export async function uploadReportToBackend(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/reports/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status code ${res.status}`);
  }

  const rawJson = await res.json();
  return normalizeReportData(rawJson);
}
