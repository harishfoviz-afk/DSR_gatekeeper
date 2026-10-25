import React, { useState } from 'react';
import { KeyRound, Check, X, Search, Sparkles, Volume2, DoorOpen } from 'lucide-react';
import { playChime, speakAlert } from '../../services/soundAndVoice';

export default function OtpQuickVerify({ visitors = [], onPassInside, language = 'bilingual' }) {
  const [otpInput, setOtpInput] = useState('');
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (codeToTest) => {
    const code = (codeToTest || otpInput).trim();
    if (!code) return;

    setHasSearched(true);
    const found = visitors.find(v => v.otp === code);

    if (found) {
      setMatchedVisitor(found);
      playChime('approved');
      speakAlert(found, language, false);
    } else {
      setMatchedVisitor(null);
      playChime('denied');
    }
  };

  const handleDigitTap = (digit) => {
    if (otpInput.length < 4) {
      const next = otpInput + digit;
      setOtpInput(next);
      if (next.length === 4) {
        handleVerify(next);
      }
    }
  };

  const handleClear = () => {
    setOtpInput('');
    setMatchedVisitor(null);
    setHasSearched(false);
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Quick OTP Passcode Check / ओटीपी सत्यापन
            </h3>
            <p className="text-xs text-slate-400">
              For Amazon/Swiggy delivery or pre-approved guests with 4-digit codes
            </p>
          </div>
        </div>

        {otpInput && (
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Clear / साफ करें
          </button>
        )}
      </div>

      {/* 4-Digit Display Box */}
      <div className="flex items-center justify-center gap-3 my-3">
        {[0, 1, 2, 3].map(idx => (
          <div
            key={idx}
            className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl font-mono font-black shadow-inner transition ${
              otpInput[idx]
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            {otpInput[idx] || '—'}
          </div>
        ))}
      </div>

      {/* Numeric Touch Keypad for Guards */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-2xl mx-auto my-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(digit => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitTap(digit)}
            className="py-3 bg-slate-950 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-extrabold text-slate-100 transition shadow"
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Match Result Banner */}
      {hasSearched && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          {matchedVisitor ? (
            <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <img
                  src={matchedVisitor.photoUrl}
                  alt={matchedVisitor.visitorName}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400 shrink-0"
                />
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>OTP MATCH CONFIRMED / कोड सही है</span>
                  </div>
                  <div className="text-lg font-black text-white">{matchedVisitor.visitorName}</div>
                  <div className="text-xs text-slate-300">
                    Flat: <strong className="text-emerald-400 font-mono text-sm">{matchedVisitor.flatNumber}</strong> • {matchedVisitor.purposeLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakAlert(matchedVisitor, language, false)}
                  className="p-3 bg-slate-950 hover:bg-black text-emerald-400 rounded-xl border border-emerald-500/40 text-xs font-bold"
                  title="Speak"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPassInside(matchedVisitor.id);
                    handleClear();
                  }}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <DoorOpen className="w-5 h-5" />
                  <span>PASS INSIDE / अंदर भेजें</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-500/20 border-2 border-rose-500/80 rounded-2xl text-center text-rose-300 font-bold text-sm flex items-center justify-center gap-2">
              <X className="w-5 h-5 text-rose-400 stroke-[3]" />
              <span>INVALID PASSCODE: No visitor found with OTP {otpInput}. Please check with resident.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
