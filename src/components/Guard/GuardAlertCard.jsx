import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Volume2,
  DoorOpen,
  LogOut,
  Car,
  Package,
  Users,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  MessageSquare,
  Copy,
  ExternalLink
} from 'lucide-react';
import { speakAlert, playChime } from '../../services/soundAndVoice';
import { PURPOSE_CONFIG } from '../../services/mockData';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export default function GuardAlertCard({
  visitor,
  language = 'bilingual-te',
  onPassInside,
  onRecordExit,
  societyConfig = {}
}) {
  const [copied, setCopied] = useState(false);
  const isApproved = visitor.status === 'APPROVED';
  const isDenied = visitor.status === 'DENIED';
  const isPending = visitor.status === 'PENDING';
  const isInside = visitor.status === 'INSIDE';
  const isExited = visitor.status === 'EXITED';

  const purposeCfg = PURPOSE_CONFIG[visitor.purpose] || PURPOSE_CONFIG.guest;
  const PurposeIcon = purposeCfg.iconName === 'Package' ? Package
    : purposeCfg.iconName === 'Car' ? Car
    : purposeCfg.iconName === 'Wrench' ? Wrench
    : Users;

  // Find resident phone number mapped to this flat from society directory
  const flatsDirectory = societyConfig.flats || [];
  const mappedResident = flatsDirectory.find(f => f.number === visitor.flatNumber);
  const residentPhone = mappedResident?.phone || '';

  const waData = generateWhatsAppLink(residentPhone, visitor);

  const handleSendWhatsApp = () => {
    window.open(waData.url, '_blank');
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard?.writeText(waData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speakAlert(visitor, language, true);
  };

  const handlePassInside = () => {
    playChime('inside');
    speakAlert({ ...visitor, status: 'INSIDE' }, language, false);
    onPassInside(visitor.id);
  };

  const handleExit = () => {
    playChime('exit');
    speakAlert({ ...visitor, status: 'EXITED' }, language, false);
    onRecordExit(visitor.id);
  };

  return (
    <div
      className={`rounded-3xl border-3 transition-all duration-300 shadow-2xl overflow-hidden relative ${
        isApproved
          ? 'bg-gradient-to-b from-emerald-950/90 to-slate-900 border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/30'
          : isDenied
          ? 'bg-gradient-to-b from-rose-950/90 to-slate-900 border-rose-500 shadow-rose-500/30 ring-4 ring-rose-500/40'
          : isPending
          ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-amber-500/70 shadow-amber-500/15'
          : isInside
          ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500/60'
          : 'bg-slate-900 border-slate-800 opacity-70'
      }`}
    >
      {/* Top High-Contrast Visual Decision Bar */}
      <div
        className={`px-5 py-3 flex items-center justify-between text-white font-black tracking-wide ${
          isApproved
            ? 'bg-emerald-600 text-slate-950'
            : isDenied
            ? 'bg-rose-600 text-white animate-pulse-fast'
            : isPending
            ? 'bg-amber-500 text-slate-950'
            : isInside
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 text-base sm:text-lg">
          {isApproved && <CheckCircle2 className="w-7 h-7 stroke-[3]" />}
          {isDenied && <XCircle className="w-7 h-7 stroke-[3]" />}
          {isPending && <Clock className="w-7 h-7 stroke-[3]" />}
          {isInside && <ShieldCheck className="w-7 h-7 stroke-[3]" />}
          {isExited && <LogOut className="w-7 h-7 stroke-[2]" />}

          <div className="leading-none">
            <span className="text-lg sm:text-xl font-black">
              {isApproved && 'GREEN: ALLOW DIRECT ENTRY'}
              {isDenied && 'RED: STOP / DO NOT ENTER'}
              {isPending && 'YELLOW: WAIT AT GATE'}
              {isInside && 'ON PREMISES (INSIDE)'}
              {isExited && 'EXIT COMPLETE'}
            </span>
            <span className="block text-xs font-bold opacity-90 mt-0.5">
              {isApproved && 'Approved • Direct Gate Entry (No OTP Needed)'}
              {isDenied && 'Resident Denied • Do Not Allow Inside'}
              {isPending && 'Awaiting Resident Approval • Keep Waiting'}
              {isInside && 'Currently inside premises'}
              {isExited && 'Exit logged from gate'}
            </span>
          </div>
        </div>

        {/* Audio Listen Button on Every Card */}
        <button
          type="button"
          onClick={handleSpeak}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg border border-white/20 active:scale-95 transition"
          title="Speak audio instruction aloud"
        >
          <Volume2 className="w-5 h-5 text-emerald-400 animate-bounce-subtle" />
          <span>🔊 PLAY AUDIO</span>
        </button>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Visitor Big Photo with Status Border */}
          <div className="relative shrink-0">
            <img
              src={visitor.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'}
              alt={visitor.visitorName}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 shadow-xl ${
                isApproved
                  ? 'border-emerald-500 glow-approved'
                  : isDenied
                  ? 'border-rose-500 glow-denied'
                  : 'border-slate-700'
              }`}
            />
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg ${
              isApproved
                ? 'bg-emerald-500 text-slate-950'
                : isDenied
                ? 'bg-rose-500 text-white'
                : 'bg-amber-500 text-slate-950'
            }`}>
              {isApproved && <Check className="w-6 h-6 stroke-[3]" />}
              {isDenied && <XCircle className="w-6 h-6 stroke-[3]" />}
              {isPending && <Clock className="w-5 h-5 stroke-[2.5]" />}
              {isInside && <ShieldCheck className="w-5 h-5" />}
              {isExited && <LogOut className="w-5 h-5" />}
            </div>
          </div>

          {/* Huge Flat Number & Purpose Information */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                DESTINATION FLAT:
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-center justify-center sm:justify-start gap-3">
                <span className="bg-slate-950/80 px-4 py-1.5 rounded-2xl border-2 border-slate-700 text-emerald-400">
                  {visitor.flatNumber}
                </span>

                {isApproved ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                    ✓ DIRECT ENTRY (NO OTP NEEDED)
                  </span>
                ) : visitor.otp ? (
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                    OTP: <strong>{visitor.otp}</strong>
                  </span>
                ) : null}
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white truncate">
              {visitor.visitorName}
            </h3>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${purposeCfg.bg}`}>
                <PurposeIcon className="w-4 h-4" />
                <span>{purposeCfg.label}</span>
              </span>

              {visitor.vehicleNumber && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-950 border border-slate-700 text-slate-200">
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  <span>{visitor.vehicleNumber}</span>
                </span>
              )}

              {mappedResident?.residentName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-slate-800 text-slate-300 font-medium">
                  Resident: <strong className="text-white">{mappedResident.residentName}</strong>
                </span>
              )}
            </div>

            {isDenied && visitor.deniedReason && (
              <div className="mt-3 bg-rose-500/20 border-2 border-rose-500/60 p-2.5 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Denial Reason: {visitor.deniedReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Prominent WhatsApp Web Deep Link Dispatch Section */}
        {isPending && (
          <div className="p-3 bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>WhatsApp 1-Click Approval</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">100% Free wa.me</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Resident Phone: <strong className="text-emerald-300 font-mono">{residentPhone || 'Not in directory (will prompt in WA)'}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                title="Copy WhatsApp approval message to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 transform active:scale-95"
              >
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                <span>📲 SEND WHATSAPP TO RESIDENT</span>
              </button>
            </div>
          </div>
        )}

        {/* Big Touchable Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80">
          {isApproved && (
            <button
              type="button"
              onClick={handlePassInside}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transform active:scale-98 transition"
            >
              <DoorOpen className="w-7 h-7 stroke-[2.5]" />
              <span>PASS INSIDE (Direct Entry)</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {isInside && (
            <button
              type="button"
              onClick={handleExit}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transform active:scale-98 transition"
            >
              <LogOut className="w-6 h-6" />
              <span>EXIT RECORDED</span>
            </button>
          )}

          {isDenied && (
            <div className="w-full py-3 px-4 bg-rose-950/70 border border-rose-600 text-rose-300 font-black text-center rounded-2xl text-sm flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>ENTRY BLOCKED • DO NOT ALLOW INSIDE</span>
            </div>
          )}

          {isPending && (
            <div className="w-full py-3 px-4 bg-amber-950/60 border border-amber-600/60 text-amber-300 font-bold text-center rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Waiting for Resident Response • Keep Visitor at Gate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
