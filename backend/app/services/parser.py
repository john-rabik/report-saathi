import re
from typing import List, Tuple, Optional
from app.models.schemas import ExtractedParameter

# Dictionary of standard medical parameters with plain-language definitions
# Used ONLY to explain parameters that are ACTUALLY detected in the document.
PARAMETER_KNOWLEDGE = {
    "hemoglobin": {
        "canonical": "Hemoglobin (Hb)",
        "patterns": [r"\bhemoglobin\b", r"\bhb\b", r"\bhgb\b"],
        "what_it_is": "An iron-rich protein in red blood cells that transports oxygen from your lungs to your body's tissues."
    },
    "rbc": {
        "canonical": "Red Blood Cell Count (RBC)",
        "patterns": [r"\bred blood cell[s]?\b", r"\brbc\b", r"\btotal rbc\b"],
        "what_it_is": "The total count of oxygen-carrying red cells circulating in your blood."
    },
    "wbc": {
        "canonical": "White Blood Cell Count (WBC)",
        "patterns": [r"\bwhite blood cell[s]?\b", r"\bwbc\b", r"\btotal wbc\b", r"\btotal leucocyte count\b", r"\btlc\b"],
        "what_it_is": "Primary defensive immune cells responsible for neutralizing bacteria, viruses, and inflammation."
    },
    "platelets": {
        "canonical": "Platelet Count",
        "patterns": [r"\bplatelet[s]?\b", r"\bplatelet count\b", r"\bplt\b"],
        "what_it_is": "Tiny cell fragments vital for clot formation to prevent excessive bleeding after injury."
    },
    "mcv": {
        "canonical": "Mean Corpuscular Volume (MCV)",
        "patterns": [r"\bmcv\b", r"\bmean corpuscular volume\b"],
        "what_it_is": "A measure of the average physical volume/size of individual red blood cells."
    },
    "mch": {
        "canonical": "Mean Corpuscular Hemoglobin (MCH)",
        "patterns": [r"\bmch\b", r"\bmean corpuscular hemoglobin\b"],
        "what_it_is": "The average mass of hemoglobin packed inside each red blood cell."
    },
    "neutrophils": {
        "canonical": "Neutrophils",
        "patterns": [r"\bneutrophil[s]?\b"],
        "what_it_is": "The most abundant white blood cell type, reacting first to acute bacterial infections."
    },
    "lymphocytes": {
        "canonical": "Lymphocytes",
        "patterns": [r"\blymphocyte[s]?\b"],
        "what_it_is": "Immune cells (B and T lymphocytes) that build pathogen memory and produce protective antibodies."
    },
    "total_cholesterol": {
        "canonical": "Total Cholesterol",
        "patterns": [r"total\s*cholesterol", r"total\s*cholesterot", r"cholesterol\s*total", r"\bcholesterol\b"],
        "what_it_is": "The aggregate quantity of circulating lipids and cholesterol carriers in the blood."
    },
    "hdl": {
        "canonical": "HDL Cholesterol ('Good')",
        "patterns": [r"\bhdl\b", r"hdl\s*cholesterol", r"hdl\s*cholesterot", r"high\s*density\s*lipoprotein"],
        "what_it_is": "High-Density Lipoprotein that gathers excess cholesterol from arterial tissues back to the liver for excretion."
    },
    "ldl": {
        "canonical": "LDL Cholesterol ('Bad')",
        "patterns": [r"\bldl\b", r"\blol\b", r"ldl\s*cholesterol", r"ldl\s*cholesterot", r"low\s*density\s*lipoprotein"],
        "what_it_is": "Low-Density Lipoprotein that transports fats to cells. High levels can accumulate in blood vessel walls."
    },
    "triglycerides": {
        "canonical": "Triglycerides",
        "patterns": [r"triglyceride[s]?", r"triglycerides"],
        "what_it_is": "The most common form of stored lipid in circulation, directly reflecting caloric intake and food fats."
    },
    "vldl": {
        "canonical": "VLDL Cholesterol",
        "patterns": [r"\bvldl\b", r"\bvldl cholesterol\b"],
        "what_it_is": "Very-Low-Density Lipoprotein that carries newly formed triglycerides from the liver."
    },
    "glucose": {
        "canonical": "Blood Glucose (Fasting)",
        "patterns": [r"\bglucose\b", r"\bfasting blood sugar\b", r"\bfbs\b", r"\bblood glucose\b"],
        "what_it_is": "The concentration of sugar (energy fuel) circulating in the bloodstream after an overnight fast."
    },
    "creatinine": {
        "canonical": "Serum Creatinine",
        "patterns": [r"\bcreatinine\b", r"\bserum creatinine\b"],
        "what_it_is": "A natural muscle breakdown waste product filtered from blood by the kidneys, indicating renal filtration efficiency."
    },
    "tsh": {
        "canonical": "Thyroid Stimulating Hormone (TSH)",
        "patterns": [r"\btsh\b", r"\bthyroid stimulating hormone\b"],
        "what_it_is": "A pituitary hormone signaling the thyroid gland to produce metabolic regulating hormones."
    }
}

# Regex to find numbers and units
VALUE_UNIT_REGEX = re.compile(
    r'(\b\d{1,6}(?:\.\d{1,3})?)\s*(g/dL|mg/dL|million/mcL|/mcL|fL|pg|%|uIU/mL|ng/dL|mmol/L|U/L)?\b',
    re.IGNORECASE
)

# Regex to detect stated reference intervals
# Matches patterns like: "12.0 - 15.5", "12.0-15.5", "< 200", "> 40", "150000 - 450000", "(Ref < 200)"
INTERVAL_REGEX = re.compile(
    r'(?:[\(\[]?\s*re[ft](?:\.|erence)?\s*(?:range|interval)?\s*[:\-]?)?\s*(?:(\d+(?:\.\d+)?)\s*[-–—to]\s*(\d+(?:\.\d+)?)|([<>]=?)\s*(\d+(?:\.\d+)?))',
    re.IGNORECASE
)

def evaluate_status(val: float, ref_min: Optional[float], ref_max: Optional[float], operator: Optional[str], op_val: Optional[float]) -> str:
    """Evaluates if an observed number is normal, low, or high relative to the stated interval."""
    if operator and op_val is not None:
        if '<' in operator and val > op_val:
            return "high"
        if '>' in operator and val < op_val:
            return "low"
        return "normal"
    
    if ref_min is not None and ref_max is not None:
        if val < ref_min:
            return "low"
        if val > ref_max:
            return "high"
        return "normal"
    
    return "unspecified"

def parse_parameters_from_text(text: str) -> List[ExtractedParameter]:
    """
    Carefully inspects the document text line by line.
    NEVER invents missing report values or reference ranges.
    Only extracts parameters, values, and ranges that explicitly appear in the document.
    """
    if not text:
        return []

    extracted: List[ExtractedParameter] = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Track parameters already captured so we don't duplicate
    seen_params = set()

    for line in lines:
        lower_line = line.lower()

        for key, info in PARAMETER_KNOWLEDGE.items():
            if key in seen_params:
                continue

            # Check if this line mentions the parameter
            matched = False
            for pattern in info["patterns"]:
                if re.search(pattern, lower_line):
                    matched = True
                    break

            if not matched:
                continue

            # Extract numbers on this line
            values = list(VALUE_UNIT_REGEX.finditer(line))
            if not values:
                continue

            # First number is generally the observed value
            obs_match = values[0]
            obs_str = obs_match.group(1)
            unit_str = obs_match.group(2) or ""

            # Check for a stated reference range on this line or neighboring text
            ref_match = INTERVAL_REGEX.search(line)
            reference_interval_str = None
            ref_min = None
            ref_max = None
            operator = None
            op_val = None
            status = "unspecified"
            note = None

            if ref_match:
                if ref_match.group(1) and ref_match.group(2):
                    ref_min = float(ref_match.group(1))
                    ref_max = float(ref_match.group(2))
                    reference_interval_str = f"{ref_min} - {ref_max} {unit_str}".strip()
                elif ref_match.group(3) and ref_match.group(4):
                    operator = ref_match.group(3)
                    op_val = float(ref_match.group(4))
                    reference_interval_str = f"{operator} {op_val} {unit_str}".strip()

                try:
                    num_val = float(obs_str)
                    status = evaluate_status(num_val, ref_min, ref_max, operator, op_val)
                except ValueError:
                    status = "unspecified"
            else:
                # CRITICAL RULE: NEVER INVENT MISSING REFERENCE RANGES
                reference_interval_str = None
                status = "unspecified"
                note = "Reference interval not explicitly stated in this document line; reference range not invented per safety rules."

            what_it_means = None
            if status == "normal":
                what_it_means = f"Within the reported reference interval ({reference_interval_str})."
            elif status == "low":
                what_it_means = f"Observed level ({obs_str} {unit_str}) is below the reported reference limit."
            elif status == "high":
                what_it_means = f"Observed level ({obs_str} {unit_str}) is above the reported reference limit."
            else:
                what_it_means = f"Observed level is {obs_str} {unit_str}. Awaiting reference interval evaluation by your doctor."

            param = ExtractedParameter(
                name=info["canonical"],
                observed_value=obs_str,
                unit=unit_str,
                reference_interval=reference_interval_str,
                status=status,
                what_it_is=info["what_it_is"],
                what_it_means=what_it_means,
                note=note
            )

            extracted.append(param)
            seen_params.add(key)
            break

    return extracted
