import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import DisclaimerBanner from './DisclaimerBanner';
import { uploadReportToBackend } from '../services/api';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export default function UploadView({ onProcessReport, onLoadSample, sampleReports, onBack }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [simulateError, setSimulateError] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    { label: "Verifying document readability & sanitizing personal identifiers...", duration: 900 },
    { label: "Extracting lab markers, numerical values & reference intervals...", duration: 1100 },
    { label: "Synthesizing conversational plain-language explanations...", duration: 1000 },
  ];

  const validateFile = (file) => {
    setErrorMsg(null);
    if (!file) return false;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB limit. Please upload a smaller scan or PDF.`);
      return false;
    }

    const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.includes(`.${fileExtension}`);
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type) || hasValidExt;

    if (!hasValidExt && !hasValidMime) {
      setErrorMsg(`Unsupported file type (.${fileExtension || 'unknown'}). Please upload a PDF or clear image (JPG, PNG).`);
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedFile) return;

    if (simulateError) {
      setIsProcessing(true);
      setProcessingStep(0);
      setTimeout(() => {
        setIsProcessing(false);
        setErrorMsg("Simulated OCR Extraction Failure: The document image is blurry or has poor lighting. Please upload a flat, high-contrast scan.");
      }, 1200);
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      // Send real file to FastAPI backend
      const result = await uploadReportToBackend(selectedFile);
      clearInterval(stepInterval);
      setIsProcessing(false);
      onProcessReport(result);
    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMsg(err.message || "Document processing failed. Please verify the file is legible and try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Disclaimer Notification */}
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Upload Medical Report
          </h1>
          <p className="text-xs text-slate-400">
            Accepts PDF lab documents, PNG, and JPG scans up to 10 MB.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      </div>

      {/* Upload Glass Container */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Glowing ambient light behind dropzone */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Loading Overlay */}
        {isProcessing ? (
          <div className="py-12 px-4 text-center space-y-6 relative z-10">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                Processing Lab Report...
              </h3>
              <p className="text-xs sm:text-sm text-cyan-300 font-medium animate-pulse">
                {steps[processingStep]?.label}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === processingStep
                      ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                      : idx < processingStep
                      ? 'w-2 bg-emerald-400'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 max-w-sm mx-auto text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Personal identifiers (name, address) are automatically redacted.</span>
            </div>
          </div>
        ) : (
          <>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99] shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                  : selectedFile
                  ? 'border-emerald-400/50 bg-emerald-500/5'
                  : 'border-white/15 hover:border-cyan-500/50 hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  selectedFile 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                }`}>
                  {selectedFile ? (
                    <FileCheck className="w-8 h-8" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {selectedFile ? 'File Selected (Click to change)' : 'Click to select or drag and drop your report'}
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, JPG, or PNG (maximum 10 MB)
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-white/10">PDF</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-white/10">JPG</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-white/10">PNG</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Upload Error</h4>
                  <p className="text-rose-300 text-xs mt-0.5">{errorMsg}</p>
                </div>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selected File Card */}
            {selectedFile && !errorMsg && (
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg flex-shrink-0 border border-cyan-500/20">
                    {selectedFile.type.includes('pdf') ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for educational analysis
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions & Simulator */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  id="simulate-error-dark"
                  type="checkbox"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 h-3.5 w-3.5"
                />
                <label htmlFor="simulate-error-dark" className="cursor-pointer select-none">
                  Simulate blurry OCR extraction error
                </label>
              </div>

              <button
                disabled={!selectedFile}
                onClick={handleStartProcessing}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedFile
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Analyze & Explain Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Pre-loaded Sample Reports */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              No local file right now? Try pre-loaded realistic data
            </h3>
            <p className="text-[11px] text-slate-400">
              Select one of the sample panels below to test the full analysis view.
            </p>
          </div>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
            Demo Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {sampleReports.map((report) => (
            <button
              key={report.id}
              onClick={() => onLoadSample(report)}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-blue-600/10 border border-white/5 hover:border-cyan-500/30 text-left transition-all group"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors">
                  {report.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {report.type} • {report.metrics.length} metrics
                </div>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  report.overallStatus.includes('Attention')
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  {report.overallStatus}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
