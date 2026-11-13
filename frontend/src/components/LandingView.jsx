import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  BarChart2, 
  Eye, 
  Users, 
  Lock 
} from 'lucide-react';
import DisclaimerBanner from './DisclaimerBanner';

export default function LandingView({ onStartUpload, onLoadSample, sampleReports }) {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Top Educational Banner */}
      <DisclaimerBanner compact />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs sm:text-sm font-medium">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Patient-First Health Literacy Tool</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Understand Your Lab Reports in <span className="text-brand-600 underline decoration-brand-300 decoration-wavy decoration-2">Plain Language</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          No medical degree required. Upload your routine blood work, urine tests, or pathology reports to get clear explanations, visual indicators, and meaningful questions for your doctor.
        </p>

        {/* Hero Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-base font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-5 h-5" />
            Upload Your Lab Report
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onLoadSample(sampleReports[0])}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-base font-medium shadow-sm hover:border-slate-400 transition-all"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Try with Sample CBC Report
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto border-t border-slate-200">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Free & Open</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 text-brand-600" />
            <span>Private & Anonymized</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Strictly Non-Diagnostic</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How ReportSaathi Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            From raw diagnostic printouts to calm, informed conversations with your physician in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Upload or Snap a Photo</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload a digital PDF from your diagnostic lab or take a photo of your printed report with your mobile phone camera.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              Supports PDF, PNG, and JPG files up to 10MB
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Extraction & Anonymization</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our extraction engine extracts test metrics and normal reference ranges while removing sensitive personal identifying details.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Tesseract OCR & layout-aware parsing
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clear Educational Insights</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Receive visual gauges of your levels, layman explanations of what each marker does, and tailored questions to ask during your consultation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              Empowers you for your doctor visit
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sample Selector */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-brand-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 bg-brand-800/60 px-3 py-1 rounded-full border border-brand-700">
              Interactive Demo Reports
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              See How ReportSaathi Explains Complex Results
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Try our pre-loaded sample lab panels right now to experience how medical jargon transforms into accessible, reassuring explanations.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {sampleReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => onLoadSample(report)}
                  className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all backdrop-blur-sm group"
                >
                  <div className="p-2 rounded-lg bg-brand-500 text-white group-hover:scale-105 transition-transform">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{report.title}</div>
                    <div className="text-xs text-brand-200">{report.metrics.length} metrics analyzed • {report.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full Educational Disclaimer Card */}
      <section className="max-w-4xl mx-auto px-4">
        <DisclaimerBanner />
      </section>
    </div>
  );
}
