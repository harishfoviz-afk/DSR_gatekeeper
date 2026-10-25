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
import { playChime, speakAlert, stopSpeaking } from '../../services/soundAndVoice';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export default function VisitorKiosk({ onVisitorCreated, visitors = [], societyConfig = {}, language = 'bilingual-te' }) {
  const blocks = societyConfig.blocks || ['A', 'B', 'C', 'D'];
  const flatsDirectory = societyConfig.flats || [];

  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('delivery');
  const [selectedBlock, setSelectedBlock] = useState(blocks[0] || 'A');
  const [selectedFlatNum, setSelectedFlatNum] = useState('');
  const [customFlat, setCustomFlat] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVisitorId, setSubmittedVisitorId] = useState(null);
  const [copiedWA, setCopiedWA] = useState(false);

  // Available flats for the selected block
  const blockFlats = flatsDirectory.filter(f => (f.block || f.number.split('-')[0]) === selectedBlock);

  // Fallback flat numbers if no flats in directory
  const displayFlats = blockFlats.length > 0
    ? blockFlats.map(f => f.number.split('-')[1] || f.number)
    : ['101', '102', '103', '201', '202', '204', '301', '302', '401', '501'];

  const flatNumber = customFlat
    ? customFlat.trim().toUpperCase()
    : `${selectedBlock}-${selectedFlatNum || displayFlats[0] || '101'}`;

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

  // Find mapped resident phone for WhatsApp
  const mappedResident = liveVisitor
    ? flatsDirectory.find(f => f.number === liveVisitor.flatNumber)
    : flatsDirectory.find(f => f.number === flatNumber);
  const residentPhone = mappedResident?.phone || '';

  const waData = liveVisitor ? generateWhatsAppLink(residentPhone, liveVisitor, societyConfig.publicAppUrl) : null;

  const handleOpenWhatsApp = () => {
    if (waData?.url) {
      window.open(waData.url, '_blank');
    }
  };

  const handleCopyWhatsApp = () => {
    if (waData?.message) {
      navigator.clipboard?.writeText(waData.message);
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2000);
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
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        status: 'PENDING',
        otp: generatedOtp,
      });

      playChime('arrival');
      setSubmittedVisitorId(newVisitor.id);
      if (onVisitorCreated) onVisitorCreated(newVisitor);

      // DIRECT POST-SUBMISSION: Dispatch WhatsApp message to owner directly
      const targetResident = flatsDirectory.find(f => f.number === flatNumber);
      const ownerPhone = targetResident?.phone || '';
      const wa = generateWhatsAppLink(ownerPhone, newVisitor, societyConfig.publicAppUrl);
      if (wa?.url) {
        // Automatically open WhatsApp Web / App directly to flat owner
        window.open(wa.url, '_blank');
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
  };

  const handlePassGate = async () => {
    if (liveVisitor) {
      await updateVisitorStatus(liveVisitor.id, 'INSIDE');
      playChime('inside');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* If a visitor has submitted a request, display the High-Contrast Digital Approval Pass / Note */}
      {liveVisitor ? (
        <div className="max-w-xl mx-auto animate-fadeIn">
          {/* DIGITAL APPROVAL NOTE (SHOWN TO GATE SECURITY GUARD) */}
          <div className={`rounded-[36px] border-4 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE'
              ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-500 shadow-emerald-500/30 ring-8 ring-emerald-500/20'
              : liveVisitor.status === 'DENIED'
              ? 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500 shadow-rose-500/30 ring-8 ring-rose-500/20'
              : 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500/70 shadow-amber-500/20'
          }`}>

            {/* Guard Instruction Header Banner */}
            <div className={`text-center py-2.5 px-4 rounded-2xl mb-6 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 ${
              liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE'
                ? 'bg-emerald-500 text-slate-950'
                : liveVisitor.status === 'DENIED'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-500 text-slate-950'
            }`}>
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <span>
                {liveVisitor.status === 'APPROVED' && 'SHOW THIS PASS TO GATE SECURITY'}
                {liveVisitor.status === 'INSIDE' && 'ENTRY RECORDED • VISITOR ON PREMISES'}
                {liveVisitor.status === 'DENIED' && 'ENTRY STOPPED BY RESIDENT'}
                {liveVisitor.status === 'PENDING' && 'PLEASE WAIT • REQUEST SENT TO RESIDENT'}
              </span>
            </div>

            {/* Central Decision Indicator */}
            <div className="text-center mb-6">
              {liveVisitor.status === 'APPROVED' || liveVisitor.status === 'INSIDE' ? (
                <div className="inline-flex p-4 bg-emerald-500/20 border-3 border-emerald-400 rounded-full text-emerald-400 glow-approved mb-3">
                  <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
                </div>
              ) : liveVisitor.status === 'DENIED' ? (
                <div className="inline-flex p-4 bg-rose-500/20 border-3 border-rose-500 rounded-full text-rose-400 glow-denied mb-3">
                  <XCircle className="w-16 h-16 stroke-[2.5]" />
                </div>
              ) : (
                <div className="inline-flex p-4 bg-amber-500/20 border-3 border-amber-400 rounded-full text-amber-400 glow-pending mb-3 animate-spin" style={{ animationDuration: '6s' }}>
                  <Clock className="w-16 h-16 stroke-[2.5]" />
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {liveVisitor.status === 'APPROVED' && 'ENTRY PERMITTED!'}
                {liveVisitor.status === 'INSIDE' && 'PASSED INSIDE'}
                {liveVisitor.status === 'DENIED' && 'STOP! ENTRY DENIED'}
                {liveVisitor.status === 'PENDING' && 'WAITING APPROVAL'}
              </h2>

              <p className="text-sm font-bold mt-1 text-emerald-400">
                {liveVisitor.status === 'APPROVED' && 'Entry Approved • Direct Gate Access (No OTP Needed)'}
                {liveVisitor.status === 'INSIDE' && 'Visitor recorded inside premises'}
                {liveVisitor.status === 'DENIED' && 'Resident denied entry • Do not proceed inside'}
                {liveVisitor.status === 'PENDING' && 'Waiting for resident to tap approve on their phone...'}
              </p>
            </div>

            {/* WHATSAPP DIRECT DISPATCH NOTIFICATION (WHILE PENDING) */}
            {liveVisitor.status === 'PENDING' && (
              <div className="mb-6 p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>WhatsApp Alert Dispatched to Owner</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">100% Free wa.me</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Owner: <strong className="text-emerald-300">{mappedResident?.residentName || 'Flat Owner'}</strong> • <span className="font-mono">{residentPhone || 'Directory Phone'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Auto-Sent
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    <span>📲 Re-Send WhatsApp to Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    {copiedWA ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWA ? 'Link Copied!' : 'Copy WhatsApp Message'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Voice Audio Guidance Button for Guards */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => speakAlert(liveVisitor, language, true)}
                className="w-full py-4 px-4 bg-slate-950 hover:bg-black border-2 border-emerald-400/80 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 shadow-xl active:scale-98 transition group"
              >
                <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 group-hover:scale-110 transition">
                  <Volume2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                    Voice Guidance for Security Guard
                  </div>
                  <div className="text-base sm:text-lg font-black text-white">
                    🔊 PLAY VOICE APPROVAL
                  </div>
                </div>
              </button>
            </div>

            {/* Destination Flat Badge - Giant Display for Guard Readability */}
            <div className="bg-slate-950/90 border-2 border-slate-700/80 rounded-3xl p-5 mb-5 shadow-inner text-center">
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
                DESTINATION APARTMENT
              </div>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
                <span className="text-emerald-400 px-4 py-1 rounded-2xl bg-slate-900 border-2 border-emerald-500/50">
                  {liveVisitor.flatNumber}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2 font-medium">
                {societyConfig.societyName || 'Divi Sri Residency'} • {societyConfig.gateName || 'Gate 1'}
              </div>
            </div>

            {/* Visitor Details Pill */}
            <div className="flex items-center gap-4 bg-slate-800/70 p-4 rounded-2xl border border-slate-700 mb-6">
              <img
                src={liveVisitor.photoUrl}
                alt={liveVisitor.visitorName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-600 shrink-0 shadow"
              />
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-black text-white truncate">
                  {liveVisitor.visitorName}
                </div>
                <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 font-bold border border-slate-700">
                    {liveVisitor.purposeLabel}
                  </span>
                  {liveVisitor.vehicleNumber && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 font-mono font-bold text-slate-200 border border-slate-700">
                      🚗 {liveVisitor.vehicleNumber}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Checked in at: {new Date(liveVisitor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Guard Quick Action: Allow Pass or Next Visitor */}
            <div className="space-y-3">
              {liveVisitor.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={handlePassGate}
                  className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transform active:scale-98 transition"
                >
                  <DoorOpen className="w-6 h-6 stroke-[2.5]" />
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
        /* STANDARD KIOSK SELF CHECK-IN FORM */
        <>
          {/* Kiosk Mode Tablet Banner */}
          <div className="mb-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-block mb-1.5">
                Gate Tablet View • {societyConfig.gateName || 'Main Entrance'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Visitor Self Check-In
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter details, snap photo, and select flat to request resident approval note.
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <Building className="w-6 h-6 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premises</div>
                <div className="text-sm font-black text-white">{societyConfig.societyName || 'Divi Sri Residency'}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Purpose of Visit */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
                  <span>Select Purpose of Visit</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">Tap to choose</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      className={`p-4 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center gap-2 relative ${
                        isSelected
                          ? `${item.color} shadow-lg shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-400/50`
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <Icon className="w-8 h-8" />
                      <div className="font-bold text-sm sm:text-base leading-tight text-white">{item.label}</div>
                      <div className="text-[11px] font-medium text-slate-400">{item.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Destination Flat Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
                  <span>Select Destination Flat</span>
                </span>
                <span className="text-emerald-400 font-extrabold text-base bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 font-mono">
                  Target: {flatNumber}
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
                      className={`px-4 py-2.5 rounded-xl border font-black text-sm transition ${
                        selectedBlock === block
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      Block {block}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat Grid */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 font-semibold mb-1.5">Flat Number in Block {selectedBlock}:</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {displayFlats.map(num => {
                    const isSelected = selectedFlatNum === num || (!selectedFlatNum && num === displayFlats[0] && !customFlat);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setSelectedFlatNum(num);
                          setCustomFlat('');
                        }}
                        className={`py-2 rounded-xl border font-mono font-bold text-sm transition ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-extrabold ring-1 ring-emerald-400'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Flat Input (Fallback) */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Or type custom flat code (e.g. Villa-12, Penthouse-1)"
                  value={customFlat}
                  onChange={(e) => setCustomFlat(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Step 3: Visitor Details & Camera Capture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
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
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
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
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
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
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono uppercase"
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
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transform active:scale-[0.99] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting Request to Resident...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>Seek Approvals</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
