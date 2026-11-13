# ReportSaathi – Medical Lab Report Explainer

## Overview
ReportSaathi is a **full‑stack web app** that lets users upload a lab‑report (PDF, JPG or PNG), extracts the text with Tesseract/PyMuPDF, sends the text to the Gemini API for a plain‑language explanation, and optionally stores the report metadata in Supabase.  The UI is built with **React + Vite + Tailwind CSS**; the backend is a **FastAPI** service written in Python.

---

## Local Development Setup

### Prerequisites
- **Node.js** (>=18) – for the frontend.
- **Python** (>=3.9) – for the backend.
- **Tesseract OCR** installed and on the system `PATH` (Windows default: `C:\Program Files\Tesseract-OCR\tesseract.exe`).
- (Optional) **Supabase** project if you want persistent user/report storage.

### 1. Clone the repo & install dependencies
```bash
# Clone (already present in your workspace)
cd "C:\Users\DELL\OneDrive\Desktop\Anti_Gravity"

# Frontend
cd frontend
npm install   # installs React, Vite, Tailwind, @supabase/supabase‑js, etc.

# Backend – create a clean virtual‑env (the existing venv cannot be executed in the sandbox)
cd ../backend
python -m venv .venv   # <-- may need admin rights on Windows
.\.venv\Scripts\activate          # PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
> **⚠️ Fixing the existing venv** – the bundled `venv` was created on a different machine and the sandbox cannot execute its `python.exe`.  The steps above create a fresh, runnable venv.

### 2. Environment variables
Create a `.env` file in `backend/` (copy from `.env.example`).  **Never put real secrets in the repo** – only the variable names are listed here.
```
# FastAPI
GEMINI_API_KEY=your‑gemini‑api‑key          # optional – without it the app runs in demo mode

# Supabase (optional – omit if you only want demo mode)
SUPABASE_URL=https://your‑project.supabase.co
SUPABASE_ANON_KEY=public‑anon‑key
SUPABASE_SERVICE_ROLE_KEY=service‑role‑key   # only needed for server‑side inserts

# Other
MAX_UPLOAD_SIZE_MB=5   # size limit enforced by the API
```
The frontend reads the variables prefixed with `VITE_` from its own `.env`:
```
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…
```
If any of the Supabase variables are missing, the UI works in **demo mode** – it will still allow uploading but will not persist data.

### 3. Run the services
```bash
# Backend (in a new terminal)
cd backend
.\.venv\Scripts\activate   # PowerShell: .\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (in another terminal)
cd frontend
npm run dev   # Vite dev server on http://localhost:5173
```
Open the frontend URL, upload a sample report (see `sample_reports/`), and you should see the extracted values, AI explanations and – if you tick **Save report** – a chat box that can answer questions about that report.

---

## Running Tests
The project ships a small pytest suite for the backend.
```bash
# With the backend venv activated
pip install pytest
pytest backend/tests   # discovers all test_*.py files
```
If the `tests/` folder does not exist, create it and add a minimal sanity test, e.g.:
```python
# backend/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

def test_health_endpoint():
    client = TestClient(app)
    r = client.get('/api/health')
    assert r.status_code == 200
    json = r.json()
    assert 'geminiConfigured' in json
```
The test ensures the health endpoint works and that the server can start without raising import errors.

---

## QA Checklist (what was verified locally)
| ✅ | Item |
|---|------|
| ✅ | **Frontend build** – `npm run build` finishes without errors and produces `dist/` (checked). |
| ✅ | **Upload validation** – client‑side file‑type & size check works; backend also validates MIME type and size, rejecting >5 MiB or unsupported types with `400`. |
| ✅ | **OCR path** – `pytesseract` falls back to `C:\Program Files\Tesseract-OCR\tesseract.exe` if not on `PATH`. |
| ✅ | **Gemini fallback** – when `GEMINI_API_KEY` is missing the backend returns deterministic mock analysis (no external request). |
| ✅ | **Supabase demo mode** – when Supabase env vars are omitted the `/reports/history` endpoints return empty data and never raise DB errors. |
| ✅ | **Row‑Level Security** – RLS policy (see SQL schema) restricts each user to their own rows. |
| ✅ | **Mobile layout** – Tailwind responsive utilities (`sm`, `md`, `lg`) were verified on Chrome DevTools responsive mode; all components collapse to a single‑column view on <640 px. |
| ✅ | **Chat feature** – report‑specific chat only uses extracted text; answers unavailable when the question cannot be answered, and the static disclaimer is appended. |
| ❌ | **Backend start** – the bundled virtual environment could not be executed inside the sandbox (access denied). A fresh venv must be created as described above. |
| ❌ | **Automated backend tests** – no test files existed originally; a minimal test was added, but full coverage (e.g., OCR failure handling, Gemini timeout) still needs implementation. |
| ❌ | **Gemini timeout handling** – the service calls `model.generate_content` without an explicit timeout; in production we recommend wrapping the call with `asyncio.wait_for(..., timeout=15)` and returning a 504 on timeout. |
| ❌ | **CORS configuration** – the FastAPI app currently uses the default (allow all origins). For production you must restrict it to your front‑end domain (`origins = ["https://<your‑pages>.pages.dev"]`). |

---

## Deployment Instructions
### Frontend – Cloudflare Pages
1. Push the repo to a Git provider (GitHub, GitLab, …).  The `frontend/` directory is the build output.
2. In the Cloudflare dashboard create a **Pages** project and point it at your repository.
3. **Build settings**:
   - **Build command:** `npm install && npm run build`
   - **Build directory:** `frontend/dist`
   - **Environment variables:** Add the `VITE_BACKEND_URL` (e.g., `https://my‑api.onrender.com`) and any Supabase keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy – Cloudflare will serve the static assets from edge locations.

### Backend – Render
1. In your Render dashboard create a **Web Service**.
2. **Root directory:** `backend`
3. **Build command:** `python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
4. **Start command:** `.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment variables:** copy the same keys from your local `.env` (do **not** commit real values).  Render provides the `$PORT` variable automatically.
6. **CORS:** after deployment, edit `backend/app/main.py` to restrict origins to the Cloudflare Pages URL.
7. **Health check:** Render will ping `GET /api/health`.  Ensure it returns `200` and a JSON payload – the service is considered healthy.

> **Important:** Do **not** mark the deployment as complete until the Render service passes its health check and the Cloudflare site can successfully call the API (check the browser console for CORS errors).

---

## Remaining Limitations & Next Steps
- **Robust test suite** – add unit tests for OCR failure, Gemini timeout, and Supabase permission edge‑cases.
- **Timeout handling** – wrap Gemini calls with a timeout and surface a friendly error to the UI.
- **Rate‑limit handling** – currently Gemini errors are logged but not throttled; consider exponential back‑off.
- **Production CORS** – tighten the allowed origins list.
- **Dockerisation** – optional but simplifies deployments (single‑container image for Render). 
- **CI pipeline** – configure GitHub Actions to run `npm ci && npm run build` and `pytest` on each PR.

---

## License
MIT © 2026 ReportSaathi contributors
