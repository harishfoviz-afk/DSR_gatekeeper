import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminPasscodeModal({ isOpen, onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Authenticate with Admin Passcode: KUNTA (case-insensitive, no hint shown)
    if (passcode.trim().toUpperCase() === 'KUNTA') {
      try {
        sessionStorage.setItem('gatekeeper_admin_authed', 'true');
      } catch (err) {
        // ignore
      }
      setPasscode('');
      setError('');
      onSuccess();
    } else {
      setError('Invalid administration passcode. Access denied.');
      setPasscode('');
    }
  };

  const handleClose = () => {
    setPasscode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Admin Console Access</h3>
            <p className="text-xs text-slate-400">Security authorization required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enter Security Passcode</span>
            </label>
            <input
              type="password"
              autoFocus
              required
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError('');
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-center text-lg font-mono text-white tracking-widest focus:outline-none transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              Unlock Console
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
