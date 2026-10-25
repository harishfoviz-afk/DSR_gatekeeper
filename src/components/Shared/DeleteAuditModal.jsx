import React, { useState } from 'react';
import { Trash2, X, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DeleteAuditModal({ isOpen, onClose, onConfirm, isBulk = false, recordName = '' }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Master Deletion Passcode: DSRKUNTA (case-insensitive, no hint displayed)
    if (passcode.trim().toUpperCase() === 'DSRKUNTA') {
      setPasscode('');
      setError('');
      onConfirm();
    } else {
      setError('Incorrect authorization passcode. Action rejected.');
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
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
            <Trash2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              {isBulk ? 'Purge Visitor Audit Logs' : 'Delete Visitor Record'}
            </h3>
            <p className="text-xs text-slate-400">Master authorization required</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          {isBulk
            ? 'You are about to permanently delete all visitor activity records. This action cannot be reversed.'
            : `Permanently delete record for ${recordName || 'this visitor'}?`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Enter Master Deletion Passcode</span>
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
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-center text-lg font-mono text-white tracking-widest focus:outline-none transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
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
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-600/30 transition transform active:scale-95"
            >
              {isBulk ? 'Confirm Purge' : 'Confirm Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
