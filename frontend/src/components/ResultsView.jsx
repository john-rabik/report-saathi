import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp, 
  HelpCircle, 
  MessageSquare, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Activity
} from 'lucide-react';
import DisclaimerBanner from './DisclaimerBanner';

export default function ResultsView({ 
  report, 
  onBackToDashboard, 
  onSelectSample, 
  sampleReports 
}) {
  const [filter, setFilter] = useState('all');
  const [expandedMetricId, setExpandedMetricId] = useState(null);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState({});

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl glass-card text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Active Report Selected</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please upload a report or choose one of our pre-configured sample lab tests.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {sampleReports.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              Open {s.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const flaggedMetrics = report.metrics.filter((m) => m.status !== 'normal');
  const normalMetrics = report.metrics.filter((m) => m.status === 'normal');

  const filteredMetrics =
    filter === 'flagged'
      ? flaggedMetrics
      : filter === 'normal'
      ? normalMetrics
      : report.metrics;

  const handleCopyQuestions = () => {
    const text = report.doctorQuestions
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n');
    navigator.clipboard.writeText(
      `Questions for My Doctor regarding my ${report.title} (${report.date}):\n\n${text}\n\nGenerated for educational purposes via ReportSaathi.`
    );
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const toggleQuestionCheck = (idx) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleExpand = (id) => {
    setExpandedMetricId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sample Demo Data</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 hidden md:inline">Sample:</span>
            {sampleReports.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSample(s)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition-all ${
                  s.id === report.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {s.title.includes('CBC') ? 'CBC Panel' : 'Lipid Panel'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-slate-200 rounded-lg text-xs font-medium transition-all"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Prominent Educational Disclaimer */}
      <DisclaimerBanner />

      {/* Report Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                {report.type}
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                report.overallStatus.includes('Attention')
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {report.overallStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {report.title}
            </h1>
          </div>

          <div className="text-xs text-slate-400 space-y-1 sm:text-right bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto border sm:border-0 border-white/5">
            <div className="flex items-center sm:justify-end gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Date: <strong className="text-slate-200">{report.date}</strong></span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Lab: {report.laboratory}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Source: {report.sourceFile}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Plain Language Interpretation
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/5">
            {report.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        {report.keyTakeaways && (
          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Key Observations & Processing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Sanitized Text Drawer */}
        {report.sanitizedText && (
          <div className="pt-3 border-t border-white/10">
            <details className="text-xs group">
              <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 select-none">
                <span>View Raw Extracted & Redacted Text</span>
                <span className="text-[10px] text-slate-500 font-normal">(Click to inspect OCR & PII redaction)</span>
              </summary>
              <pre className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {report.sanitizedText}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Extracted Metrics Section */}
      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Extracted Laboratory Values</h2>
            <p className="text-xs text-slate-400">
              Observed patient numbers mapped against standard laboratory reference intervals.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-blue-600/40 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tests ({report.metrics.length})
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'flagged'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attention ({flaggedMetrics.length})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal ({normalMetrics.length})
            </button>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3">
          {filteredMetrics.map((metric) => {
            const isExpanded = expandedMetricId === metric.id;
            const isNormal = metric.status === 'normal';
            const isLow = metric.status === 'low';
            const isHigh = metric.status === 'high';

            return (
              <div
                key={metric.id}
                className={`glass-card rounded-2xl border transition-all ${
                  isNormal
                    ? 'border-white/10 hover:border-white/20'
                    : isLow
                    ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50'
                    : 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(metric.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="space-y-1 min-w-[220px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {metric.category}
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {metric.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Reference: <span className="text-slate-300 font-medium">{metric.referenceRangeStr}</span>
                    </p>
                  </div>

                  {/* Middle Range Bar */}
                  <div className="w-full md:w-60 space-y-1.5 py-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>Low</span>
                      <span className="text-emerald-400">Healthy Zone</span>
                      <span>High</span>
                    </div>

                    <div className="relative h-2.5 rounded-full bg-slate-800 border border-white/10 overflow-visible flex">
                      <div className="w-1/4 h-full bg-amber-500/30 rounded-l-full"></div>
                      <div className="w-2/4 h-full bg-emerald-500/40"></div>
                      <div className="w-1/4 h-full bg-rose-500/30 rounded-r-full"></div>

                      <div
                        style={{ left: `${Math.min(Math.max(metric.rangePositionPercent, 4), 96)}%` }}
                        className="absolute -top-1 -bottom-1 w-2 -ml-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        title={`Observed value: ${metric.value} ${metric.unit}`}
                      />
                    </div>
                    <div className="text-[10px] text-center text-slate-400 font-mono">
                      Observed: {metric.value} {metric.unit}
                    </div>
                  </div>

                  {/* Right: Observed & Status */}
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    <div className="text-right">
                      <div className="font-extrabold text-white text-base sm:text-lg">
                        {metric.value} <span className="text-xs font-normal text-slate-400">{metric.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isNormal
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {isNormal && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isLow && <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
                        {isHigh && <ArrowUp className="w-3.5 h-3.5 text-rose-400" />}
                        {isNormal ? 'Normal' : isLow ? 'Lower' : 'Higher'}
                      </span>

                      <button className="p-1 text-slate-400 hover:text-white" aria-label="Toggle details">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Explanations Card */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-slate-900/50 rounded-b-2xl space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          What is {metric.name.split('(')[0].trim()}?
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {metric.whatItIs}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-teal-400" />
                          What does this level mean?
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {metric.whatItMeans}
                        </p>
                      </div>
                    </div>

                    {metric.note && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                        ℹ️ {metric.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions for Your Doctor Checklist */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Questions to Ask Your Doctor
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Interactive consultation checklist. Check items off as you discuss them.
            </p>
          </div>

          <button
            onClick={handleCopyQuestions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            {copiedQuestions ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                Copy Questions
              </>
            )}
          </button>
        </div>

        <div className="space-y-2.5 pt-2">
          {report.doctorQuestions.map((question, idx) => {
            const isChecked = !!checkedQuestions[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleQuestionCheck(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs sm:text-sm ${
                  isChecked
                    ? 'bg-white/[0.01] border-white/5 text-slate-500 line-through'
                    : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30 text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
                <span className="flex-1 leading-relaxed">{question}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wellness & Nutrition Note */}
      {report.lifestyleNote && (
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10 space-y-2">
          <h4 className="font-bold text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Educational Wellness Notes
          </h4>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            {report.lifestyleNote}
          </p>
        </div>
      )}
    </div>
  );
}
