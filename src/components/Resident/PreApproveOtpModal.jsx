import React, { useState } from 'react';
import { X, Key, ShieldCheck, Copy, Check, Send, Sparkles } from 'lucide-react';
import { addVisitor } from '../../services/db';
import { playChime } from '../../services/soundAndVoice';

export default function PreApproveOtpModal({ isOpen, onClose, residentFlat }) {
  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose] = useState('delivery');
  const [phone, setPhone] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      alert("Please enter expected guest or delivery person name");
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);

    // Save as PRE-APPROVED visitor
    await addVisitor({
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      flatNumber: residentFlat,
      purpose,
      purposeLabel: purpose === 'delivery' ? 'Pre-Approved Delivery' : 'Pre-Approved Guest',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      status: 'APPROVED', // Immediately approved with this OTP!
      otp: otp,
      notes: `Pre-approved by resident of Flat ${residentFlat}`,
    });

    playChime('approved');
  };

  const handleCopy = () => {
    const text = `GateKeeper Pass for Greenwood Heights, Flat ${residentFlat}. Pre-approved OTP: ${generatedOtp}. Show this to gate guard.`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedOtp('');
    setVisitorName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Generate Pre-Approved Pass</h3>
            <p className="text-xs text-slate-400">Flat: <strong className="text-emerald-400 font-mono">{residentFlat}</strong></p>
          </div>
        </div>

        {!generatedOtp ? (
          <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Guest or Delivery Service Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Swiggy / Flipkart / Uncle John"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'delivery', label: 'Delivery / Parcel' },
                  { id: 'guest', label: 'Guest / Friend' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurpose(item.id)}
                    className={`py-2 px-3 rounded-lg border font-semibold transition ${
                      purpose === item.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+91 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Instant 4-Digit Pass</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-2 space-y-4">
            <div className="inline-flex p-3 bg-emerald-500/20 border border-emerald-400 rounded-full text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                Authorized Gate Passcode
              </div>
              <div className="text-5xl font-mono font-black text-amber-400 tracking-wider">
                {generatedOtp}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Pre-approved for <strong className="text-white">{visitorName}</strong> to Flat <strong className="text-emerald-400 font-mono">{residentFlat}</strong>.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Passcode Copied!' : 'Copy Pass Message'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
