import React, { useState } from 'react';
import {
  Bell,
  Key,
  Shield,
  Smartphone,
  CheckCircle2,
  Filter,
  UserCheck,
  Building,
  RefreshCw,
  Sparkles,
  Inbox
} from 'lucide-react';
import ArrivingVisitorCard from './ArrivingVisitorCard';
import DenialReasonModal from './DenialReasonModal';
import PreApproveOtpModal from './PreApproveOtpModal';
import { updateVisitorStatus } from '../../services/db';
import { playChime } from '../../services/soundAndVoice';

export default function ResidentPortal({ visitors = [], societyConfig = {} }) {
  const flatsDirectory = societyConfig.flats || [];
  const defaultFlat = flatsDirectory[0]?.number || 'A-101';

  const [currentFlat, setCurrentFlat] = useState(defaultFlat);
  const [filterMode, setFilterMode] = useState('all-for-flat');
  const [denialTarget, setDenialTarget] = useState(null);
  const [isPreApproveOpen, setIsPreApproveOpen] = useState(false);
  const [phoneFrame, setPhoneFrame] = useState(true);

  // Active resident details
  const activeResident = flatsDirectory.find(f => f.number === currentFlat);

  // Filter visitors
  const flatVisitors = visitors.filter(v => {
    if (filterMode === 'all-flats') return true;
    return v.flatNumber === currentFlat;
  });

  const pendingFlatVisitors = flatVisitors.filter(v => v.status === 'PENDING');
  const approvedFlatVisitors = flatVisitors.filter(v => v.status === 'APPROVED' || v.status === 'INSIDE');
  const historyFlatVisitors = flatVisitors.filter(v => v.status === 'DENIED' || v.status === 'EXITED');

  const handleApprove = async (visitorId) => {
    await updateVisitorStatus(visitorId, 'APPROVED');
  };

  const handleConfirmDenial = async (visitorId, reason) => {
    playChime('denied');
    await updateVisitorStatus(visitorId, 'DENIED', { deniedReason: reason });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* View Options & Phone Shell Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Resident Approval Mobile App
            </div>
            <div className="text-sm text-slate-300">
              Logged in: <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded-lg ml-1">{currentFlat}</strong>
              {activeResident && <span className="text-xs text-slate-400 ml-1.5">({activeResident.residentName})</span>}
            </div>
          </div>
        </div>

        {/* Flat Selector Dropdown for Testing Different Flats */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Switch Apartment:</label>
          <select
            value={currentFlat}
            onChange={(e) => setCurrentFlat(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
          >
            {flatsDirectory.length > 0 ? (
              flatsDirectory.map(f => (
                <option key={f.id || f.number} value={f.number}>
                  Flat {f.number} {f.residentName ? `(${f.residentName})` : ''}
                </option>
              ))
            ) : (
              ['A-101', 'A-102', 'B-201', 'B-204', 'C-302'].map(flat => (
                <option key={flat} value={flat}>Flat {flat}</option>
              ))
            )}
          </select>

          <button
            onClick={() => setPhoneFrame(!phoneFrame)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Toggle Smartphone Frame Preview"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{phoneFrame ? 'Full Width' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Container - Responsive or Mobile Phone Frame */}
      <div className={`mx-auto transition-all duration-300 ${phoneFrame ? 'max-w-md' : 'max-w-3xl'}`}>
        <div className={`bg-slate-950 rounded-[36px] border ${phoneFrame ? 'border-4 border-slate-800 shadow-2xl overflow-hidden' : 'border-slate-800 rounded-2xl'}`}>

          {/* Phone Top Notch */}
          {phoneFrame && (
            <div className="bg-slate-900 px-6 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono font-bold">9:41 AM</span>
              <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>5G</span>
              </div>
            </div>
          )}

          {/* App Header Inside Phone */}
          <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-black text-white">{societyConfig.societyName || 'Divi Sri Residency'}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Flat: <strong className="text-emerald-400 font-mono">{currentFlat}</strong></span>
                </div>
              </div>

              {/* Send Pre-Approved OTP Button */}
              <button
                type="button"
                onClick={() => setIsPreApproveOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
              >
                <Key className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>SEND PASS</span>
              </button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className={`p-2.5 rounded-2xl border text-center transition ${
                  pendingFlatVisitors.length > 0
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-lg font-black">{pendingFlatVisitors.length}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider">Arriving</div>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('all-for-flat')}
                className={`p-2.5 rounded-2xl border text-center transition ${
                  filterMode === 'all-for-flat'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-lg font-black">{approvedFlatVisitors.length}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider">Approved</div>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('all-flats')}
                className={`p-2.5 rounded-2xl border text-center transition ${
                  filterMode === 'all-flats'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-lg font-black">{visitors.length}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider">All Tower</div>
              </button>
            </div>
          </div>

          {/* Arriving Feed Section */}
          <div className="p-4 space-y-4 min-h-[420px] max-h-[580px] overflow-y-auto">
            {pendingFlatVisitors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Immediate Action Required ({pendingFlatVisitors.length})</span>
                </div>
                <div className="space-y-3">
                  {pendingFlatVisitors.map(visitor => (
                    <ArrivingVisitorCard
                      key={visitor.id}
                      visitor={visitor}
                      onApprove={handleApprove}
                      onOpenDenyModal={setDenialTarget}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Approved & Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {filterMode === 'all-flats' ? 'All Recent Tower Visitors' : `Activity for Flat ${currentFlat}`}
                </span>
                <span className="text-[11px] text-slate-500">
                  {flatVisitors.length} total records
                </span>
              </div>

              {flatVisitors.filter(v => v.status !== 'PENDING').length === 0 && pendingFlatVisitors.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-300">No Arriving Visitors</div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    New visitor requests for Flat <strong className="text-slate-300">{currentFlat}</strong> will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flatVisitors
                    .filter(v => v.status !== 'PENDING')
                    .map(visitor => (
                      <ArrivingVisitorCard
                        key={visitor.id}
                        visitor={visitor}
                        onApprove={handleApprove}
                        onOpenDenyModal={setDenialTarget}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Denial Reason Modal */}
      <DenialReasonModal
        isOpen={Boolean(denialTarget)}
        visitor={denialTarget}
        onClose={() => setDenialTarget(null)}
        onConfirmDenial={handleConfirmDenial}
      />

      {/* Pre-Approve OTP Modal */}
      <PreApproveOtpModal
        isOpen={isPreApproveOpen}
        residentFlat={currentFlat}
        onClose={() => setIsPreApproveOpen(false)}
      />
    </div>
  );
}
