import React from 'react';
import { X, Volume2, Bell, AlertTriangle, CheckCircle2, Shield, Languages } from 'lucide-react';
import { playChime, speakAlert, stopSpeaking } from '../../services/soundAndVoice';
import { LANGUAGE_OPTIONS } from '../../services/mockData';

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  language,
  setLanguage,
  autoAnnounce,
  setAutoAnnounce
}) {
  if (!isOpen) return null;

  const testVisitorApproved = {
    visitorName: 'Venkata Rao',
    flatNumber: 'A-101',
    purpose: 'delivery',
    status: 'APPROVED',
  };

  const testVisitorDenied = {
    visitorName: 'Unknown Person',
    flatNumber: 'B-204',
    purpose: 'service',
    status: 'DENIED',
    deniedReason: 'Wrong Flat',
  };

  const testVisitorPending = {
    visitorName: 'Ananya Sharma',
    flatNumber: 'A-101',
    purpose: 'guest',
    status: 'PENDING',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Voice Engine & Tone Settings</h3>
            <p className="text-xs text-slate-400">Multi-language voice guidance for security guard assistance</p>
          </div>
        </div>

        {/* Guard Voice Language Selector */}
        <div className="mb-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
            <Languages className="w-4 h-4 text-emerald-400" />
            Voice Guidance Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGE_OPTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center ${
                  language === item.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{item.flag}</span>
                  <span className="text-xs font-bold text-white">{item.label}</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auto Announce Switch */}
        <div className="mb-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-200">Auto-Announce New Events</div>
            <div className="text-xs text-slate-400">Automatically speak approvals/denials aloud hands-free</div>
          </div>
          <button
            type="button"
            onClick={() => setAutoAnnounce(!autoAnnounce)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              autoAnnounce ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                autoAnnounce ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Test Chimes and Voice Prompts */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Test Speech in {language.toUpperCase()}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playChime('approved');
                speakAlert(testVisitorApproved, language, false);
              }}
              className="flex items-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Test Approval Voice (Green)</span>
            </button>

            <button
              onClick={() => {
                playChime('denied');
                speakAlert(testVisitorDenied, language, false);
              }}
              className="flex items-center gap-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Test Denied Voice (Red)</span>
            </button>

            <button
              onClick={() => {
                playChime('arrival');
                speakAlert(testVisitorPending, language, false);
              }}
              className="flex items-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition"
            >
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Test Pending Voice (Yellow)</span>
            </button>

            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Stop / Cancel Speech</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
