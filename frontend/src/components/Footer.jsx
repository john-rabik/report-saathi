import React from 'react';
import { ShieldCheck, Heart, Info, BookOpen } from 'lucide-react';

export default function Footer({ onOpenDisclaimer }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900">
                Report<span className="text-brand-600">Saathi</span>
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
              Empowering individuals with health literacy. ReportSaathi breaks down complex medical jargon, reference ranges, and lab markers into clear, conversational language.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Storage Architecture: We do not store or sell your medical records.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Safety & Ethics
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={onOpenDisclaimer}
                  className="text-slate-600 hover:text-brand-700 flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Medical Disclaimer
                </button>
              </li>
              <li>
                <span className="text-slate-500">Non-Diagnostic Guarantee</span>
              </li>
              <li>
                <span className="text-slate-500">Patient PII Anonymization</span>
              </li>
              <li>
                <span className="text-slate-500">Doctor Consultation Checklist</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Supported Panels
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Complete Blood Count (CBC)</li>
              <li>Lipid Profile & Cholesterol</li>
              <li>Liver Function Tests (LFT)</li>
              <li>Thyroid Panel (TSH, T3, T4)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ReportSaathi. Built for educational health literacy.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for accessible patient education.
          </p>
        </div>
      </div>
    </footer>
  );
}
