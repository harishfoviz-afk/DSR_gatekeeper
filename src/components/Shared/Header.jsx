import React from 'react';
import {
  Shield,
  Smartphone,
  Tablet,
  Volume2,
  Settings,
  Flame,
  HardDrive,
  RotateCcw,
  Languages,
  Sparkles,
  Building2,
  FileCheck2
} from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../../services/mockData';

export default function Header({
  activeView,
  setActiveView,
  visitors = [],
  societyConfig = {},
  syncMode,
  language,
  setLanguage,
  onOpenFirebaseModal,
  onOpenVoiceModal,
  onResetData,
}) {
  const pendingCount = visitors.filter(v => v.status === 'PENDING').length;
  const approvedCount = visitors.filter(v => v.status === 'APPROVED').length;

  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.id === language) || LANGUAGE_OPTIONS[0];

  const handleNextLanguage = () => {
    const idx = LANGUAGE_OPTIONS.findIndex(l => l.id === language);
    const nextIdx = (idx + 1) % LANGUAGE_OPTIONS.length;
    setLanguage(LANGUAGE_OPTIONS[nextIdx].id);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                GateKeeper <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>{societyConfig?.societyName || 'Divi Sri Residency'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button
                onClick={onOpenFirebaseModal}
                className="hover:text-slate-200 transition flex items-center gap-1"
                title="Click to configure Cloud Sync"
              >
                {syncMode === 'firebase' ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-amber-400 font-semibold">Firebase Live</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400 font-semibold">Local Multi-Tab Sync</span>
                  </>
                )}
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-300 font-medium">
                {societyConfig?.gateName || 'Main Gate 1'}
              </span>
            </div>
          </div>
        </div>

        {/* Core Navigation Switcher (Kiosk & Gate Pass, Resident App, Admin Panel) */}
        <nav className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner flex-wrap gap-1">
          <button
            onClick={() => setActiveView('kiosk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeView === 'kiosk'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Kiosk & Gate Pass</span>
          </button>

          <button
            onClick={() => setActiveView('resident')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeView === 'resident'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Resident App</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                activeView === 'resident' ? 'bg-slate-950 text-emerald-400' : 'bg-amber-500 text-slate-950 animate-pulse'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeView === 'admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Utility Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Language Toggle */}
          <button
            onClick={handleNextLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            title="Cycle Voice Guidance Language"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentLangObj.label}</span>
          </button>

          {/* Sound & Voice Settings */}
          <button
            onClick={onOpenVoiceModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Audio & TTS Voice Settings"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Firebase Settings */}
          <button
            onClick={onOpenFirebaseModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Database & Cloud Sync Settings"
          >
            <Settings className="w-4 h-4 text-amber-400" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
            title="Reset to Initial Demo Visitors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-medium">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
