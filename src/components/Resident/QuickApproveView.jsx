import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building,
  User,
  Phone,
  Car,
  Package,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateVisitorStatus } from '../../services/db';
import { playChime } from '../../services/soundAndVoice';
import { PURPOSE_CONFIG } from '../../services/mockData';

export default function QuickApproveView({ visitors = [], onNavigateToApp }) {
  const [visitorId, setVisitorId] = useState('');
  const [requestedAction, setRequestedAction] = useState('');
  const [processed, setProcessed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse parameters from hash or search
  useEffect(() => {
    try {
      let queryString = '';
      if (window.location.hash.includes('?')) {
        queryString = window.location.hash.split('?')[1];
      } else if (window.location.search) {
        queryString = window.location.search.substring(1);
      }

      const params = new URLSearchParams(queryString);
      const id = params.get('id') || '';
      const action = (params.get('action') || '').toUpperCase();

      setVisitorId(id);
      setRequestedAction(action);
    } catch (e) {
      console.warn("Failed to parse quick-approve params:", e);
    }
  }, []);

  // Find the visitor record
  const visitor = visitors.find(v => v.id === visitorId);

  // Execute automatic one-click update when parameters are loaded
  useEffect(() => {
    if (!visitorId || !requestedAction || processed) return;

    const executeAction = async () => {
      setIsUpdating(true);
      try {
        const targetStatus = requestedAction === 'DENIED' ? 'DENIED' : 'APPROVED';

        // Update database (Firestore or LocalStorage + BroadcastChannel)
        await updateVisitorStatus(visitorId, targetStatus, {
          decidedVia: 'whatsapp_quick_link',
          decidedAt: new Date().toISOString()
        });

        // Trigger celebratory effects
        if (targetStatus === 'APPROVED') {
          playChime('approved');
          try {
            confetti({
              particleCount: 65,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#3b82f6', '#f59e0b']
            });
          } catch (err) {
            // ignore
          }
        } else {
          playChime('denied');
        }

        setProcessed(true);
      } catch (err) {
        console.error("Quick approve error:", err);
      } finally {
        setIsUpdating(false);
      }
    };

    executeAction();
  }, [visitorId, requestedAction, processed]);

  const currentStatus = visitor?.status || requestedAction || 'APPROVED';
  const isApproved = currentStatus === 'APPROVED';
  const isDenied = currentStatus === 'DENIED';

  const purposeCfg = visitor ? (PURPOSE_CONFIG[visitor.purpose] || PURPOSE_CONFIG.guest) : PURPOSE_CONFIG.guest;

  const handleToggleDecision = async (newAction) => {
    if (!visitorId) return;
    setIsUpdating(true);
    await updateVisitorStatus(visitorId, newAction, {
      decidedVia: 'whatsapp_quick_link_manual',
      decidedAt: new Date().toISOString()
    });
    setRequestedAction(newAction);
    if (newAction === 'APPROVED') {
      playChime('approved');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      playChime('denied');
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border-2 rounded-[36px] p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 border-slate-800">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">GateKeeper AI</div>
              <div className="text-[10px] text-slate-400">WhatsApp Instant Resident Response</div>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Verified Pass
          </span>
        </div>

        {/* Central Visual Decision State */}
        <div className="text-center mb-6">
          {isApproved ? (
            <div className="inline-flex p-4 bg-emerald-500/20 border-3 border-emerald-400 rounded-full text-emerald-400 glow-approved mb-3 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
            </div>
          ) : isDenied ? (
            <div className="inline-flex p-4 bg-rose-500/20 border-3 border-rose-500 rounded-full text-rose-400 glow-denied mb-3 animate-fadeIn">
              <XCircle className="w-16 h-16 stroke-[2.5]" />
            </div>
          ) : (
            <div className="inline-flex p-4 bg-amber-500/20 border-3 border-amber-400 rounded-full text-amber-400 glow-pending mb-3 animate-spin" style={{ animationDuration: '6s' }}>
              <Clock className="w-16 h-16 stroke-[2.5]" />
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isApproved && 'Entry Approved!'}
            {isDenied && 'Entry Denied!'}
            {!isApproved && !isDenied && 'Processing Action...'}
          </h2>

          <p className="text-xs sm:text-sm font-semibold mt-1.5 text-slate-300">
            {isApproved && 'Gate security has received instant green-light clearance.'}
            {isDenied && 'Gate security has been instructed to stop visitor at gate.'}
            {!isApproved && !isDenied && 'Updating live visitor gate pass...'}
          </p>
        </div>

        {/* Visitor Card Summary */}
        {visitor ? (
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 shadow-inner">
            <div className="flex items-center gap-3.5 mb-3">
              <img
                src={visitor.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
                alt={visitor.visitorName}
                className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-black text-white truncate">{visitor.visitorName}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-emerald-400 font-mono">Flat {visitor.flatNumber}</span>
                  <span>•</span>
                  <span>{visitor.purposeLabel || 'Visitor'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/80">
              {visitor.phone && (
                <div className="text-slate-400 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{visitor.phone}</span>
                </div>
              )}
              {visitor.vehicleNumber && (
                <div className="text-slate-400 flex items-center gap-1 font-mono">
                  <Car className="w-3 h-3 text-slate-500" />
                  <span>{visitor.vehicleNumber}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 text-center text-xs text-slate-400">
            Visitor ID: <span className="font-mono text-emerald-400">{visitorId || 'Direct Link'}</span>
          </div>
        )}

        {/* Reversal / Toggle Buttons */}
        <div className="space-y-2 mb-4">
          {isApproved ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleToggleDecision('DENIED')}
              className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Change Mind: Deny Entry</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleToggleDecision('APPROVED')}
              className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Change Mind: Approve Entry</span>
            </button>
          )}

          {onNavigateToApp && (
            <button
              type="button"
              onClick={() => onNavigateToApp('resident')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Open Full Resident Portal</span>
            </button>
          )}
        </div>

        <div className="text-[10px] text-center text-slate-500">
          Decided securely via GateKeeper WhatsApp Web Deep Link
        </div>
      </div>
    </div>
  );
}
