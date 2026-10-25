import React from 'react';
import {
  Check,
  X,
  Clock,
  Car,
  Package,
  Users,
  Wrench,
  ShieldAlert,
  Phone,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StatusBadge from '../Shared/StatusBadge';
import { PURPOSE_CONFIG } from '../../services/mockData';
import { playChime } from '../../services/soundAndVoice';

export default function ArrivingVisitorCard({
  visitor,
  onApprove,
  onOpenDenyModal,
  isResidentFlat = true
}) {
  const purposeCfg = PURPOSE_CONFIG[visitor.purpose] || PURPOSE_CONFIG.guest;

  const handleApprove = () => {
    // Fire festive approval confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6']
      });
    } catch (e) {
      // ignore
    }
    playChime('approved');
    onApprove(visitor.id);
  };

  const timeAgo = (isoString) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      return `${Math.floor(diff / 3600)} hr ago`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`rounded-2xl border transition shadow-xl overflow-hidden ${
      visitor.status === 'PENDING'
        ? 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/20'
        : visitor.status === 'APPROVED'
        ? 'bg-slate-900/90 border-emerald-500/30'
        : visitor.status === 'DENIED'
        ? 'bg-slate-900/90 border-rose-500/30'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      {/* Top Status Bar */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={visitor.status} size="sm" />
          <span className="text-xs font-mono font-bold text-slate-300">
            Flat {visitor.flatNumber}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(visitor.timestamp)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex gap-4">
        {/* Visitor Photo with large thumbnail */}
        <div className="relative shrink-0">
          <img
            src={visitor.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
            alt={visitor.visitorName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-700 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded-md text-[10px] font-mono font-bold text-amber-400">
            #{visitor.otp || 'PASS'}
          </div>
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base sm:text-lg font-black text-white truncate">
              {visitor.visitorName}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 my-1.5">
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${purposeCfg.bg}`}>
              {visitor.purposeLabel || purposeCfg.label}
            </span>
            {visitor.vehicleNumber && (
              <span className="text-[11px] px-2 py-0.5 rounded-md font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                <Car className="w-3 h-3" />
                {visitor.vehicleNumber}
              </span>
            )}
          </div>

          {visitor.phone && (
            <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{visitor.phone}</span>
            </div>
          )}

          {visitor.deniedReason && (
            <div className="text-[11px] text-rose-400 mt-1 font-medium bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
              Reason: {visitor.deniedReason}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Only for PENDING status) */}
      {visitor.status === 'PENDING' && (
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenDenyModal(visitor)}
            className="w-full py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>DENY / मना करें</span>
          </button>

          <button
            type="button"
            onClick={handleApprove}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transform active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>APPROVE / आने दें</span>
          </button>
        </div>
      )}
    </div>
  );
}
