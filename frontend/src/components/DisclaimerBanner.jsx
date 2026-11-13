import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="glass-card rounded-xl p-3 border-l-4 border-amber-500 flex items-center justify-between gap-3 text-xs text-amber-200/90 shadow-md">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span>
            <strong className="text-amber-300">Educational Use Only:</strong> ReportSaathi explains lab terminology. It does not provide medical diagnoses or prescriptions. Always consult your doctor.
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Zero Data Stored
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 text-amber-100 shadow-xl relative overflow-hidden">
      <div className="flex items-start gap-3 sm:gap-4 relative z-10">
        <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 space-y-1.5 text-xs sm:text-sm">
          <h4 className="font-bold text-amber-300 text-sm sm:text-base">
            Important Medical Educational Disclaimer
          </h4>
          <p className="text-amber-200/80 leading-relaxed">
            ReportSaathi is strictly an educational tool to help you understand terminology and standard reference intervals. 
            <strong className="text-amber-100"> It is not a physician and does not make clinical diagnoses, evaluate disease risk, or recommend medication.</strong>
          </p>
          <p className="text-amber-200/70 text-[11px] sm:text-xs pt-1">
            Laboratory reference intervals vary across clinical analyzers and regional populations. Always discuss your findings directly with your healthcare professional. If you are experiencing emergency symptoms, call local emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
