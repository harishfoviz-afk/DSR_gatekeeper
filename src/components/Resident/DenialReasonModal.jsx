import React, { useState } from 'react';
import { X, AlertTriangle, ShieldX, Check } from 'lucide-react';

const REASONS = [
  'Wrong Flat / गलत फ्लैट',
  'Not Expecting Anyone / कोई उम्मीद नहीं',
  'Spam / Unsolicited Marketing',
  'Leave Package at Gate Security',
  'Visitor Unknown / पहचान नहीं है'
];

export default function DenialReasonModal({ isOpen, visitor, onClose, onConfirmDenial }) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !visitor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = customReason.trim() || selectedReason;
    onConfirmDenial(visitor.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <ShieldX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Deny Entry Request</h3>
            <p className="text-xs text-slate-400">Visitor: <strong className="text-white">{visitor.visitorName}</strong></p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Select a reason for denying entry so the gate security guard can take appropriate action:
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            {REASONS.map((reason) => (
              <label
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                  selectedReason === reason && !customReason
                    ? 'bg-rose-500/15 border-rose-500 text-rose-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{reason}</span>
                {selectedReason === reason && !customReason && (
                  <Check className="w-4 h-4 text-rose-400" />
                )}
              </label>
            ))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Or write custom reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Confirm Deny</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
