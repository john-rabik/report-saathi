import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  UploadCloud, 
  FileText, 
  TrendingUp, 
  Folder, 
  ShieldAlert, 
  Sun, 
  Moon, 
  ChevronRight,
  Activity,
  Sparkles
} from 'lucide-react';

export default function SidebarDock({ 
  currentView, 
  setView, 
  isDark, 
  setIsDark, 
  activeReport,
  onOpenDisclaimer 
}) {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'upload', icon: UploadCloud, label: 'Upload' },
    { id: 'results', icon: Activity, label: 'Lab Results' },
    { id: 'landing', icon: Home, label: 'About & Guide' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-20 hidden md:flex flex-col items-center justify-between py-6 px-3 glass-dock border-r border-white/10 select-none">
      {/* Top Logo / App Icon */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setView('dashboard')}
          className="relative group p-3 rounded-2xl bg-gradient-to-br from-blue-600/80 to-cyan-500/80 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/30 hover:scale-105 transition-all"
          title="ReportSaathi Home"
        >
          <Activity className="w-6 h-6 stroke-[2.5]" />
          <span className="sr-only">ReportSaathi</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative group p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {item.id === 'results' && activeReport && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-white border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Medical Disclaimer Quick Button */}
          <button
            onClick={onOpenDisclaimer}
            className="relative group p-3 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/30"
            title="Medical Disclaimer"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-amber-200 border border-amber-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
              Medical Disclaimer
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Controls: Theme Toggle & User Avatar */}
      <div className="flex flex-col items-center gap-4">
        {/* Dark/Light Switch */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-medium"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* User / Patient Profile Pill */}
        <div 
          onClick={() => setView('dashboard')}
          className="flex flex-col items-center gap-1 cursor-pointer group"
          title="Guest Session (Zero Retention)"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 group-hover:text-white flex items-center">
            Guest <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </aside>
  );
}
