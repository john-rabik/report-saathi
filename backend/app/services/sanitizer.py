import re

PATTERNS_TO_REDACT = [
    # Phone numbers
    (r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '[REDACTED_PHONE]'),
    (r'\b[6-9]\d{9}\b', '[REDACTED_PHONE]'), # Indian 10-digit mobile
    
    # Emails
    (r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]'),
    
    # Patient Name identifiers
    (r'(?i)(patient\s*name\s*[:\-])\s*[A-Za-z\s.]+', r'\1 [REDACTED_NAME]'),
    (r'(?i)(name\s*[:\-])\s*[A-Za-z\s.]+', r'\1 [REDACTED_NAME]'),
    
    # Age/Sex can be kept or partially anonymized, but let's redact addresses
    (r'(?i)(address\s*[:\-])\s*[^,\n]+(,[^,\n]+)*', r'\1 [REDACTED_ADDRESS]'),
    (r'(?i)(referred\s*by\s*[:\-])\s*[A-Za-z\s.]+', r'\1 [REDACTED_DOCTOR]'),
    (r'(?i)(doctor\s*name\s*[:\-])\s*[A-Za-z\s.]+', r'\1 [REDACTED_DOCTOR]'),
]

def sanitize_text(text: str) -> str:
    """
    Strips Protected Health Information (PHI) and Personal Identifiable Information (PII)
    from extracted OCR/PDF text before sending it to language models.
    """
    if not text:
        return ""
    
    sanitized = text
    for pattern, replacement in PATTERNS_TO_REDACT:
        sanitized = re.sub(pattern, replacement, sanitized)
    
    return sanitized
