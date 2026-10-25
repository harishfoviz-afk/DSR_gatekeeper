import React, { useState, useEffect } from 'react';
import {
  Package,
  Users,
  Car,
  Wrench,
  Check,
  Send,
  Building,
  Phone,
  User,
  ShieldAlert,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Volume2,
  DoorOpen,
  RotateCcw,
  ShieldCheck,
  Award,
  MessageSquare,
  Copy,
  ExternalLink
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import { PURPOSE_CONFIG } from '../../services/mockData';
import { addVisitor, updateVisitorStatus } from '../../services/db';
import { playChime, speakAlert } from '../../services/soundAndVoice';
import { generateWhatsAppLink, getFlatApprovers } from '../../utils/whatsapp';

export default function VisitorKiosk({ onVisitorCreated, visitors = [], societyConfig = {}, language = 'bilingual-te' }) {
  const flatsDirectory = societyConfig.flats || [];

  // Derive available blocks strictly from societyConfig.blocks or flats directory (no fake blocks)
  const configuredBlocks = societyConfig.blocks && societyConfig.blocks.length > 0
    ? societyConfig.blocks
    : Array.from(new Set(flatsDirectory.map(f => f.block || (f.number?.includes('-') ? f.number.split('-')[0] : 'General')))).filter(Boolean);

  const blocks = configuredBlocks.length > 0 ? configuredBlocks : ['Block DSR'];

  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('delivery');
  const [selectedBlock, setSelectedBlock] = useState(blocks[0] || 'Block DSR');
  const [selectedFlatNum, setSelectedFlatNum] = useState('');
  const [customFlat, setCustomFlat] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVisitorId, setSubmittedVisitorId] = useState(null);
  const [copiedWAIdx, setCopiedWAIdx] = useState(null);

  // Helper to normalize block strings (e.g. "Block DSR" -> "DSR")
  const normalizeBlock = (b) => (b || '').replace(/^block\s+/i, '').trim().toUpperCase();

  // Keep selectedBlock in sync if blocks change
  useEffect(() => {
    if (blocks.length > 0 && !blocks.includes(selectedBlock)) {
      setSelectedBlock(blocks[0]);
    }
  }, [blocks, selectedBlock]);

  // Filter flats strictly for selected block
  const blockFlats = flatsDirectory.filter(f => {
    const fBlock = normalizeBlock(f.block || (f.number?.includes('-') ? f.number.split('-')[0] : ''));
    const curBlock = normalizeBlock(selectedBlock);
    return fBlock === curBlock || f.block === selectedBlock;
  });

  // Map only registered flats without any fake hardcoded fallback numbers!
  const displayFlats = blockFlats.map(f => {
    const parts = f.number.split('-');
    const shortNum = parts.length > 1 ? parts.slice(1).join('-') : f.number;
    return {
      fullNumber: f.number,
      shortNum: shortNum || f.number,
      residentName: f.residentName,
      residentName2: f.residentName2,
      rawFlat: f
    };
  });

  // Active selected flat from registered list
  const activeFlat = displayFlats.find(d => d.shortNum === selectedFlatNum || d.fullNumber === selectedFlatNum) || displayFlats[0];

  // Calculated flat number for submission
  const flatNumber = customFlat
    ? customFlat.trim().toUpperCase()
    : (activeFlat ? activeFlat.fullNumber : `${selectedBlock}-${selectedFlatNum || ''}`);

  // Find live updated status of the submitted visitor
  const liveVisitor = submittedVisitorId
    ? visitors.find(v => v.id === submittedVisitorId)
    : null;

  // Auto-announce with speech synthesis (including Telugu voice) when status changes
  useEffect(() => {
    if (liveVisitor && liveVisitor.status === 'APPROVED') {
      playChime('approved');
      speakAlert(liveVisitor, language, false);
    } else if (liveVisitor && liveVisitor.status === 'DENIED') {
      playChime('denied');
      speakAlert(liveVisitor, language, false);
    }
  }, [liveVisitor?.status, language]);

  // Find mapped resident and approvers for WhatsApp dispatch
  const mappedResident = liveVisitor
    ? (flatsDirectory.find(f => f.number === liveVisitor.flatNumber || f.number.endsWith(liveVisitor.flatNumber) || liveVisitor.flatNumber.endsWith(f.number)) || { number: liveVisitor.flatNumber })
    : (flatsDirectory.find(f => f.number === flatNumber) || activeFlat?.rawFlat);

  const flatApprovers = getFlatApprovers(mappedResident);

  const handleCopyWhatsApp = (msg, idx) => {
    if (msg) {
      navigator.clipboard?.writeText(msg);
      setCopiedWAIdx(idx);
      setTimeout(() => setCopiedWAIdx(null), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      alert("Please enter visitor full name");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const newVisitor = await addVisitor({
        visitorName: visitorName.trim(),
        phone: phone.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        purpose,
        purposeLabel: PURPOSE_CONFIG[purpose]?.label || 'Visit',
        flatNumber,
        photoUrl: photoUrl || '',
        status: 'PENDING',
        otp: generatedOtp,
      });

      playChime('arrival');
      setSubmittedVisitorId(newVisitor.id);
      if (onVisitorCreated) onVisitorCreated(newVisitor);

      // DIRECT POST-SUBMISSION: Dispatch WhatsApp message to owner directly
      const targetResident = flatsDirectory.find(f => f.number === flatNumber) ||
        flatsDirectory.find(f => normalizeBlock(f.block) === normalizeBlock(selectedBlock) && (f.number.endsWith(selectedFlatNum) || f.number === selectedFlatNum));
      const approvers = getFlatApprovers(targetResident);
      if (approvers.length > 0) {
        const wa = generateWhatsAppLink(approvers[0].phone, newVisitor, societyConfig.publicAppUrl);
        if (wa?.url) {
          // Open WhatsApp Web / App directly to primary flat owner
          window.open(wa.url, '_blank');
        }
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to record entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedVisitorId(null);
    setVisitorName('');
    setPhone('');
    setVehicleNumber('');
    setPhotoUrl('');
    setCustomFlat('');
    setSelectedFlatNum('');
  };

  const handlePassGate = async () => {
    if (liveVisitor) {
      await updateVisitorStatus(liveVisitor.id, 'INSIDE');
      playChime('inside');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* If a visitor has submitted a request, display the High-Contrast Mobile-Friendly Digital Approval Pass / Note */}
      {liveVisitor ? (
        <div className="max-w-xl mx-auto animate-fadeIn">
          {/* DIGITAL APPROVAL NOTE (SHOWN TO GATE SECURITY GUARD) */}
          <div className={`rounded-3xl sm:rounded-[36px] border-2 sm:border-4 p-4 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE'
              ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-500 shadow-emerald-500/30 ring-4 sm:ring-8 ring-emerald-500/20'
              : liveVisitor.status === 'DENIED'
              ? 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500 shadow-rose-500/30 ring-4 sm:ring-8 ring-rose-500/20'
              : 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500/70 shadow-amber-500/20'
          }`}>

            {/* Guard Instruction Header Banner */}
            <div className={`text-center py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 ${
              liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE'
                ? 'bg-emerald-500 text-slate-950'
                : liveVisitor.status === 'DENIED'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-500 text-slate-950'
            }`}>
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="truncate">
                {liveVisitor.status === 'APPROVED' && 'SHOW THIS PASS TO GATE SECURITY'}
                {liveVisitor.status === 'INSIDE' && 'ENTRY RECORDED • VISITOR ON PREMISES'}
                {liveVisitor.status === 'DENIED' && 'ENTRY STOPPED BY RESIDENT'}
                {liveVisitor.status === 'PENDING' && 'PLEASE WAIT • REQUEST SENT TO RESIDENT'}
              </span>
            </div>

            {/* Central Decision Indicator */}
            <div className="text-center mb-4 sm:mb-6">
              {liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE' ? (
                <div className="inline-flex p-3 sm:p-4 bg-emerald-500/20 border-3 border-emerald-400 rounded-full text-emerald-400 glow-approved mb-2 sm:mb-3">
                  <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
                </div>
              ) : liveVisitor.status === 'DENIED' ? (
                <div className="inline-flex p-3 sm:p-4 bg-rose-500/20 border-3 border-rose-500 rounded-full text-rose-400 glow-denied mb-2 sm:mb-3">
                  <XCircle className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
                </div>
              ) : (
                <div className="inline-flex p-3 sm:p-4 bg-amber-500/20 border-3 border-amber-400 rounded-full text-amber-400 glow-pending mb-2 sm:mb-3 animate-spin" style={{ animationDuration: '6s' }}>
                  <Clock className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
                </div>
              )}

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {liveVisitor.status === 'APPROVED' && 'ENTRY PERMITTED!'}
                {liveVisitor.status === 'INSIDE' && 'PASSED INSIDE'}
                {liveVisitor.status === 'DENIED' && 'STOP! ENTRY DENIED'}
                {liveVisitor.status === 'PENDING' && 'WAITING APPROVAL'}
              </h2>

              <p className="text-xs sm:text-sm font-bold mt-1 text-emerald-400">
                {liveVisitor.status === 'APPROVED' && 'Entry Approved • Direct Gate Access (No OTP Needed)'}
                {liveVisitor.status === 'INSIDE' && 'Visitor recorded inside premises'}
                {liveVisitor.status === 'DENIED' && 'Resident denied entry • Do not proceed inside'}
                {liveVisitor.status === 'PENDING' && 'Waiting for resident to tap approve on their phone...'}
              </p>
            </div>

            {/* WHATSAPP DIRECT DISPATCH NOTIFICATION (WITH MULTI-APPROVER SUPPORT) */}
            {liveVisitor.status === 'PENDING' && (
              <div className="mb-4 sm:mb-6 p-3.5 sm:p-5 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl sm:rounded-3xl shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <span>WhatsApp Approval Dispatch</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">100% Free wa.me</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {flatApprovers.length > 1
                          ? `Send alert to ${flatApprovers.length} registered flat approvers`
                          : 'Send alert directly to registered flat owner'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    {flatApprovers.length > 1 ? `${flatApprovers.length} Approvers` : 'Auto-Sent'}
                  </span>
                </div>

                {flatApprovers.length > 0 ? (
                  <div className="space-y-2.5">
                    {flatApprovers.map((approver, idx) => {
                      const wa = generateWhatsAppLink(approver.phone, liveVisitor, societyConfig.publicAppUrl);
                      const isCopied = copiedWAIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                {idx === 0 ? 'Primary' : 'Co-Approver'}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-white truncate">
                                {approver.name || `Approver ${idx + 1}`}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              📞 {approver.phone}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => wa.url && window.open(wa.url, '_blank')}
                              className="flex-1 sm:flex-initial py-2.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>📲 Send WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsApp(wa.message, idx)}
                              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1"
                              title="Copy WhatsApp Message"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/80 rounded-2xl border border-amber-500/30 text-amber-300 text-xs text-center">
                    No phone number configured for {liveVisitor.flatNumber}. You can add residents in Admin Panel.
                  </div>
                )}
              </div>
            )}

            {/* Voice Audio Guidance Button for Guards */}
            <div className="mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => speakAlert(liveVisitor, language, true)}
                className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-slate-950 hover:bg-black border-2 border-emerald-400/80 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl active:scale-98 transition group"
              >
                <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 group-hover:scale-110 transition shrink-0">
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                    Voice Guidance for Security Guard
                  </div>
                  <div className="text-sm sm:text-base font-black text-white">
                    🔊 PLAY VOICE APPROVAL
                  </div>
                </div>
              </button>
            </div>

            {/* Destination Flat Badge - Giant Display for Guard Readability */}
            <div className="bg-slate-950/90 border-2 border-slate-700/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 mb-4 sm:mb-5 shadow-inner text-center">
              <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
                DESTINATION APARTMENT
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
                <span className="text-emerald-400 px-3 sm:px-4 py-1 rounded-xl sm:rounded-2xl bg-slate-900 border-2 border-emerald-500/50">
                  {liveVisitor.flatNumber}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2 font-medium">
                {societyConfig.societyName || 'Divi Sri Residency'} • {societyConfig.gateName || 'Gate 1'}
              </div>
            </div>

            {/* Visitor Details Pill */}
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-800/70 p-3 sm:p-4 rounded-2xl border border-slate-700 mb-4 sm:mb-6">
              {liveVisitor.photoUrl ? (
                <img
                  src={liveVisitor.photoUrl}
                  alt={liveVisitor.visitorName}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-600 shrink-0 shadow"
                />
              ) : (
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shrink-0 shadow flex items-center justify-center text-emerald-400 font-black text-xl sm:text-2xl">
                  {liveVisitor.visitorName ? liveVisitor.visitorName[0].toUpperCase() : 'V'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-xl font-black text-white truncate">
                  {liveVisitor.visitorName}
                </div>
                <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 font-bold border border-slate-700 text-[11px] sm:text-xs">
                    {liveVisitor.purposeLabel}
                  </span>
                  {liveVisitor.vehicleNumber && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 font-mono font-bold text-slate-200 border border-slate-700 text-[11px] sm:text-xs">
                      🚗 {liveVisitor.vehicleNumber}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Checked in: {new Date(liveVisitor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Guard Quick Action: Allow Pass or Next Visitor */}
            <div className="space-y-2.5 sm:space-y-3">
              {liveVisitor.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={handlePassGate}
                  className="w-full py-3.5 sm:py-4 px-4 sm:px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transform active:scale-98 transition"
                >
                  <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  <span>GUARD: PASS INSIDE (ENTRY RECORDED)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Next Visitor Check-In</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD KIOSK SELF CHECK-IN FORM (FULLY MOBILE FRIENDLY) */
        <>
          {/* Kiosk Mode Tablet Banner */}
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-block mb-1">
                Gate Tablet View • {societyConfig.gateName || 'Main Entrance'}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Visitor Self Check-In
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Enter details, snap photo, and select flat to request resident approval note.
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premises</div>
                <div className="text-xs sm:text-sm font-black text-white">{societyConfig.societyName || 'Divi Sri Residency'}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Step 1: Purpose of Visit */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl">
              <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                  <span>Select Purpose of Visit</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">Tap to choose</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { id: 'delivery', label: 'Delivery', subtitle: 'Amazon, Swiggy, Parcels', icon: Package, color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
                  { id: 'guest', label: 'Guest / Friend', subtitle: 'Family & Visitors', icon: Users, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                  { id: 'service', label: 'Cab / Ride', subtitle: 'Uber, Ola, Taxi', icon: Car, color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                  { id: 'maintenance', label: 'Repair & Service', subtitle: 'Electrician, Plumber, AC', icon: Wrench, color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = purpose === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPurpose(item.id)}
                      className={`p-3 sm:p-4 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative ${
                        isSelected
                          ? `${item.color} shadow-lg shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-400/50`
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                      <div className="font-bold text-xs sm:text-base leading-tight text-white">{item.label}</div>
                      <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-clamp-1">{item.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Destination Flat Selection (SHOW ONLY REGISTERED FLATS IN ADMIN) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl">
              <label className="block text-sm font-bold text-slate-200 mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
                  <span>Select Destination Flat</span>
                </span>
                <span className="text-emerald-400 font-extrabold text-xs sm:text-base bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 font-mono">
                  Target: {flatNumber || 'Select Flat'}
                </span>
              </label>

              {/* Block Selection */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 font-semibold mb-1.5">Tower / Block:</div>
                <div className="flex flex-wrap gap-2">
                  {blocks.map(block => (
                    <button
                      key={block}
                      type="button"
                      onClick={() => {
                        setSelectedBlock(block);
                        setSelectedFlatNum('');
                      }}
                      className={`px-3.5 py-2 rounded-xl border font-black text-xs sm:text-sm transition ${
                        selectedBlock === block
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {block.toUpperCase().startsWith('BLOCK') ? block : `Block ${block}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat Grid: STRICTLY REGISTERED FLATS ONLY */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Registered Flats in {selectedBlock}:</span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {displayFlats.length} {displayFlats.length === 1 ? 'flat registered' : 'flats registered'}
                  </span>
                </div>

                {displayFlats.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                    {displayFlats.map(item => {
                      const isSelected = selectedFlatNum === item.shortNum || (!selectedFlatNum && item === displayFlats[0] && !customFlat);
                      const hasCoApprover = !!item.residentName2;
                      return (
                        <button
                          key={item.fullNumber}
                          type="button"
                          onClick={() => {
                            setSelectedFlatNum(item.shortNum);
                            setCustomFlat('');
                          }}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 shadow-md scale-[1.02]'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="font-mono font-black text-base sm:text-lg">
                            {item.shortNum}
                          </div>
                          <div className="text-[11px] font-sans text-slate-300 truncate max-w-full font-medium">
                            {item.residentName || 'Resident'}
                          </div>
                          {hasCoApprover && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              2 Approvers
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 bg-slate-950/70 border border-dashed border-slate-800 rounded-2xl text-center">
                    <Building className="w-7 h-7 text-slate-500 mx-auto mb-1.5" />
                    <p className="text-xs sm:text-sm font-bold text-slate-300">
                      No flats registered under {selectedBlock} yet.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Add flats for this block in the Admin Panel or type a custom flat number below.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Flat Input (Optional Override) */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Or type custom flat code (e.g. Villa-12, Penthouse-1)"
                  value={customFlat}
                  onChange={(e) => setCustomFlat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Step 3: Visitor Details & Camera Capture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4">
                <label className="block text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
                  <span>Visitor Details</span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Visitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar, Swiggy Rider"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TS 09 AB 1234 / Auto / None"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <CameraCapture
                  photoUrl={photoUrl}
                  onPhotoCaptured={(url) => setPhotoUrl(url)}
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 sm:gap-3 transform active:scale-[0.99] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting Request to Resident...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Seek Approvals</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
