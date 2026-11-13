import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Printer, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import GlowWave from './GlowWave';
import CircularRing from './CircularRing';
import DisclaimerBanner from './DisclaimerBanner';

export default function DashboardView({ 
  onGoToUpload, 
  onViewReport, 
  sampleReports, 
  activeReport,
  onSelectSample,
  onOpenDisclaimer 
}) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const report = activeReport || sampleReports[0];
  const normalCount = report.metrics.filter(m => m.status === 'normal').length;
  const flaggedCount = report.metrics.filter(m => m.status !== 'normal').length;
  const balancePercentage = Math.round((normalCount / report.metrics.length) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Disclaimer Notification */}
      <DisclaimerBanner compact />

      {/* Main Grid matching Pinterest Reference Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 1. Top Left Greeting Card (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">
                Welcome to ReportSaathi,
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Health Companion
              </h1>
              <p className="text-xs text-slate-400 max-w-sm pt-0.5">
                Translating laboratory terminology into plain educational insights.
              </p>
            </div>
            
            {/* Time Pill Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-cyan-300 font-mono text-xs sm:text-sm font-semibold shadow-inner">
              {currentTime || "11:50 AM"}
            </div>
          </div>

          {/* Biometric Neon Wave Graphic */}
          <div className="pt-4">
            <GlowWave height={46} />
          </div>
        </div>

        {/* 2. Top Right Report Status Card (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[190px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">
                Active Medical File
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {report.date}
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              report.overallStatus.includes('Attention')
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}>
              {report.overallStatus}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400">{report.type}</div>
                <div className="text-sm font-semibold text-slate-200">{report.title}</div>
              </div>
            </div>

            <button
              onClick={() => onViewReport(report)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 transition-all"
            >
              Inspect <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Report Balance Ring Widget (7 Cols, Left Column) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Report Balance Overview
            </h3>
            <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              {report.title.split('(')[0].trim()}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {balancePercentage}%
                </div>
                <p className="text-xs text-emerald-400 font-medium">
                  {normalCount} of {report.metrics.length} Markers In Range
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-400">
                <div>
                  <span className="block font-bold text-white text-base">{normalCount}</span>
                  Normal Tests
                </div>
                <div className="border-l border-white/10 pl-6">
                  <span className="block font-bold text-amber-400 text-base">{flaggedCount}</span>
                  Needs Attention
                </div>
              </div>
            </div>

            {/* Glowing Ring */}
            <div className="relative">
              <CircularRing
                percentage={balancePercentage}
                size={135}
                strokeWidth={11}
                gradientStart="#06b6d4"
                gradientEnd="#8b5cf6"
                id="healthBalanceRing"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold text-white">{balancePercentage}%</span>
                <span className="text-[10px] text-slate-400">Balanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Diagnostic Focus Widget (5 Cols, Right Column - Focus Timer style) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col items-center justify-between text-center relative">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Diagnostic Panel</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Demo Mode</span>
          </div>

          {/* Glowing Orange-to-Amber Ring */}
          <div className="relative my-2">
            <CircularRing
              percentage={82}
              size={130}
              strokeWidth={9}
              gradientStart="#f97316"
              gradientEnd="#facc15"
              id="focusRing"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-white">
                {report.metrics.length} Tests
              </span>
              <span className="text-[10px] text-slate-400">Extracted</span>
            </div>
          </div>

          <button
            onClick={() => onViewReport(report)}
            className="w-full mt-2 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-orange-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          >
            <Play className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            Explore Full Breakdown
          </button>
        </div>

        {/* 5. Extracted Test Indicators Checklist (7 Cols - Tasks style) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Extracted Test Metrics</h3>
            <button
              onClick={onGoToUpload}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              + Upload New
            </button>
          </div>

          <div className="space-y-2.5">
            {report.metrics.slice(0, 4).map((m) => {
              const isNormal = m.status === 'normal';
              return (
                <div
                  key={m.id}
                  onClick={() => onViewReport(report)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isNormal 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {isNormal ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        {m.value} {m.unit}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    isNormal 
                      ? 'text-emerald-400 bg-emerald-950/50' 
                      : 'text-amber-400 bg-amber-950/50'
                  }`}>
                    {isNormal ? 'In Range' : 'Attention'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Current State & PII Protection (5 Cols - Current Mood style) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-white mb-1">Privacy & Safety Status</div>
            <div className="text-sm font-semibold text-cyan-400">100% Anonymized</div>
          </div>

          {/* Smooth glowing sine curve */}
          <div className="my-2">
            <GlowWave height={32} />
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <span className="text-slate-400">Data Retention:</span>
            <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Storage
            </span>
          </div>
        </div>

        {/* 7. Marker Level Variance (7 Cols - Weekly Activity Bar Chart style) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Marker Range Positions</h3>
              <p className="text-[11px] text-slate-400">Relative observed level across reference limits</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Relative %</span>
          </div>

          {/* Glowing vertical bars */}
          <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
            {report.metrics.slice(0, 7).map((m, idx) => {
              const height = Math.min(Math.max(m.rangePositionPercent || 50, 20), 100);
              const isFlagged = m.status !== 'normal';
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap pointer-events-none">
                    {m.value} {m.unit}
                  </div>

                  <div className="w-full max-w-[28px] h-24 bg-slate-800/50 rounded-t-lg flex items-end justify-center overflow-hidden">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isFlagged
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[42px] text-center">
                    {m.id.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. Quick Shortcuts Grid (5 Cols - Shortcuts 6-Icon Grid style) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Quick Shortcuts</h3>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={onGoToUpload}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/20 border border-white/5 hover:border-cyan-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <UploadCloud className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">Upload</span>
            </button>

            <button
              onClick={() => onSelectSample(sampleReports[0])}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/20 border border-white/5 hover:border-cyan-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">CBC Demo</span>
            </button>

            <button
              onClick={() => onSelectSample(sampleReports[1])}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/20 border border-white/5 hover:border-cyan-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <Activity className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">Lipid Demo</span>
            </button>

            <button
              onClick={() => onViewReport(report)}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/20 border border-white/5 hover:border-cyan-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">Questions</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-blue-600/20 border border-white/5 hover:border-cyan-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <Printer className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">Print PDF</span>
            </button>

            <button
              onClick={onOpenDisclaimer}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/40 text-center flex flex-col items-center gap-1.5 transition-all group"
            >
              <ShieldAlert className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">Safety</span>
            </button>
          </div>
        </div>

        {/* 9. Overall System & Health Status (Full 12 Cols - System Status style) */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <CircularRing
                percentage={92}
                size={85}
                strokeWidth={7}
                gradientStart="#38bdf8"
                gradientEnd="#3b82f6"
                id="systemStatusRing"
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                92%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Extraction Reliability & Safety</h4>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  FastAPI :8000 Online
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md pt-0.5">
                Hybrid OCR layout extraction active. Numerical ranges and units are cross-verified with standard diagnostic thresholds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button
              onClick={onGoToUpload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
