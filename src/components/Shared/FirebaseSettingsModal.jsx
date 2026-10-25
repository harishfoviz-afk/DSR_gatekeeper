import React, { useState } from 'react';
import { X, Flame, HardDrive, Check, RefreshCw, Key, Shield } from 'lucide-react';
import { getActiveFirebaseConfig, saveCustomFirebaseConfig, clearCustomFirebaseConfig } from '../../services/db';

export default function FirebaseSettingsModal({ isOpen, onClose, currentSyncMode }) {
  const active = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(active?.config?.apiKey || '');
  const [projectId, setProjectId] = useState(active?.config?.projectId || '');
  const [authDomain, setAuthDomain] = useState(active?.config?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(active?.config?.storageBucket || '');
  const [appId, setAppId] = useState(active?.config?.appId || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      alert("Please provide at least Firebase API Key and Project ID.");
      return;
    }
    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      appId: appId.trim() || '1:123456789:web:abcdef',
    });
  };

  const handleResetToLocal = () => {
    if (confirm("Switch to Local / BroadcastChannel Mode? Custom Firebase settings will be cleared.")) {
      clearCustomFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Cloud Sync & Database Settings</h3>
            <p className="text-xs text-slate-400">Configure Firebase Firestore or use Offline Multi-Tab mode</p>
          </div>
        </div>

        {/* Current Status banner */}
        <div className={`p-3.5 rounded-xl border mb-5 flex items-center gap-3 ${
          currentSyncMode === 'firebase'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        }`}>
          {currentSyncMode === 'firebase' ? (
            <Flame className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <HardDrive className="w-5 h-5 shrink-0 text-blue-400" />
          )}
          <div className="text-sm">
            <div className="font-semibold">
              {currentSyncMode === 'firebase' ? 'Active: Firebase Firestore' : 'Active: LocalStorage + BroadcastChannel'}
            </div>
            <div className="text-xs opacity-85">
              {currentSyncMode === 'firebase'
                ? 'Multi-device real-time sync across computers, phones, and tablets.'
                : 'Zero setup required! Instant sync across tabs & browser windows via BroadcastChannel.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Firebase API Key</label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Firebase Project ID</label>
            <input
              type="text"
              placeholder="my-gatekeeper-app"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auth Domain (Optional)</label>
              <input
                type="text"
                placeholder="project.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">App ID (Optional)</label>
              <input
                type="text"
                placeholder="1:123456:web:abcd"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetToLocal}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Reset to Local Mode
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-lg shadow-amber-400/20"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
