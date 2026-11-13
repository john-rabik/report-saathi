import React, { useState } from 'react';
import SidebarDock from './components/SidebarDock';
import DashboardView from './components/DashboardView';
import UploadView from './components/UploadView';
import ResultsView from './components/ResultsView';
import LandingView from './components/LandingView';
import { SAMPLE_REPORTS } from './data/sampleReports';
import { 
  X, 
  ShieldAlert, 
  LayoutGrid, 
  UploadCloud, 
  Activity, 
  Home, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeReport, setActiveReport] = useState(SAMPLE_REPORTS[0]);
  const [isDark, setIsDark] = useState(true);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const handleStartUpload = () => {
    setCurrentView('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSample = (sample) => {
    setActiveReport(sample);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProcessReport = (processedReport) => {
    setActiveReport(processedReport);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReport = (report) => {
    setActiveReport(report);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#070b14] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Ambient Glow Lights matching Pinterest Inspiration */}
      {isDark && (
        <>
          {/* Subtle warm amber/orange aura on the right side */}
          <div className="fixed top-1/4 -right-24 w-[420px] h-[520px] bg-gradient-to-b from-orange-600/10 via-amber-600/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
          {/* Cyan/blue ethereal glow on the top-left */}
          <div className="fixed -top-20 left-1/4 w-[500px] h-[400px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none z-0" />
          {/* Subtle violet/indigo glow near the bottom */}
          <div className="fixed -bottom-24 left-1/3 w-[450px] h-[350px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
        </>
      )}

      {/* Slim Left Navigation Dock (Desktop) */}
      <SidebarDock
        currentView={currentView}
        setView={setCurrentView}
        isDark={isDark}
        setIsDark={setIsDark}
        activeReport={activeReport}
        onOpenDisclaimer={() => setIsDisclaimerModalOpen(true)}
      />

      {/* Mobile Top Header (Phones) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_12px_rgba(59,130,246,0.5)]">
            RS
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Report<span className="text-cyan-400">Saathi</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-300"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCurrentView('upload')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold"
          >
            Upload
          </button>
        </div>
      </header>

      {/* Main Content Stage (Offset by Left Dock on Desktop) */}
      <div className="md:pl-20 min-h-screen flex flex-col relative z-10">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {currentView === 'dashboard' && (
            <DashboardView
              onGoToUpload={handleStartUpload}
              onViewReport={handleViewReport}
              sampleReports={SAMPLE_REPORTS}
              activeReport={activeReport}
              onSelectSample={handleLoadSample}
              onOpenDisclaimer={() => setIsDisclaimerModalOpen(true)}
            />
          )}

          {currentView === 'upload' && (
            <UploadView
              onProcessReport={handleProcessReport}
              onLoadSample={handleLoadSample}
              sampleReports={SAMPLE_REPORTS}
              onBack={handleBackToDashboard}
            />
          )}

          {currentView === 'results' && (
            <ResultsView
              report={activeReport}
              onBackToDashboard={handleBackToDashboard}
              onSelectSample={handleLoadSample}
              sampleReports={SAMPLE_REPORTS}
            />
          )}

          {currentView === 'landing' && (
            <LandingView
              onStartUpload={handleStartUpload}
              onLoadSample={handleLoadSample}
              sampleReports={SAMPLE_REPORTS}
            />
          )}
        </main>

        {/* Minimal Dark Glass Footer */}
        <footer className="mt-auto py-6 border-t border-white/5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} ReportSaathi • Educational Health Literacy Platform</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDisclaimerModalOpen(true)}
                className="hover:text-amber-400 transition-colors"
              >
                Medical Safety Policy
              </button>
              <span>•</span>
              <span className="text-slate-600">Zero Retention Architecture</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Dock (Phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1120]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentView === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          Dashboard
        </button>

        <button
          onClick={() => setCurrentView('upload')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentView === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          Upload
        </button>

        <button
          onClick={() => setCurrentView('results')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentView === 'results' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Activity className="w-5 h-5" />
          Results
        </button>

        <button
          onClick={() => setCurrentView('landing')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            currentView === 'landing' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          Guide
        </button>
      </nav>

      {/* Medical Safety Disclaimer Modal */}
      {isDisclaimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-card bg-[#0b1120]/95 border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsDisclaimerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Medical Safety & Educational Policy
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong className="text-white">1. Strictly Non-Diagnostic:</strong> ReportSaathi is an educational health-literacy web application. It does not provide medical diagnoses, clinical treatment plans, emergency triage, or pharmaceutical prescriptions.
              </p>
              <p>
                <strong className="text-white">2. Variation in Reference Intervals:</strong> Different diagnostic facilities use varying equipment, reagent batches, and demographic reference baselines. A value marked as out of range by one laboratory might be standard under another assay.
              </p>
              <p>
                <strong className="text-white">3. Consult Licensed Physicians:</strong> Blood markers must always be contextualized with your medical history, symptoms, and physical examination by a doctor.
              </p>
              <p>
                <strong className="text-white">4. Medical Emergencies:</strong> If you or someone you know is experiencing acute severe symptoms (chest pressure, severe shortness of breath, loss of consciousness), immediately contact local emergency services.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                I Understand & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
