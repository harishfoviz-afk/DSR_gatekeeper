import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  XCircle,
  Clock,
  DoorOpen,
  Filter,
  Flame,
  Radio,
  Sparkles,
  Inbox,
  Check
} from 'lucide-react';
import GuardAlertCard from './GuardAlertCard';
import OtpQuickVerify from './OtpQuickVerify';
import { updateVisitorStatus } from '../../services/db';
import { speakAlert, playChime, stopSpeaking } from '../../services/soundAndVoice';
import { LANGUAGE_OPTIONS } from '../../services/mockData';

export default function GuardDashboard({
  visitors = [],
  language = 'bilingual-te',
  setLanguage,
  autoAnnounce = true,
  setAutoAnnounce,
  societyConfig = {}
}) {
  const [filterTab, setFilterTab] = useState('active');
  const previousStatusMap = useRef(new Map());

  useEffect(() => {
    if (!autoAnnounce) return;

    visitors.forEach(v => {
      const prevStatus = previousStatusMap.current.get(v.id);
      if (prevStatus && prevStatus !== v.status) {
        if (v.status === 'APPROVED' || v.status === 'DENIED') {
          speakAlert(v, language, true);
        }
      }
      previousStatusMap.current.set(v.id, v.status);
    });
  }, [visitors, autoAnnounce, language]);

  const handlePassInside = async (visitorId) => {
    await updateVisitorStatus(visitorId, 'INSIDE');
  };

  const handleRecordExit = async (visitorId) => {
    await updateVisitorStatus(visitorId, 'EXITED');
  };

  const approvedList = visitors.filter(v => v.status === 'APPROVED');
  const deniedList = visitors.filter(v => v.status === 'DENIED');
  const pendingList = visitors.filter(v => v.status === 'PENDING');
  const insideList = visitors.filter(v => v.status === 'INSIDE');

  const filteredVisitors = visitors.filter(v => {
    if (filterTab === 'active') return v.status === 'APPROVED' || v.status === 'DENIED' || v.status === 'PENDING';
    if (filterTab === 'approved') return v.status === 'APPROVED';
    if (filterTab === 'denied') return v.status === 'DENIED';
    if (filterTab === 'pending') return v.status === 'PENDING';
    if (filterTab === 'inside') return v.status === 'INSIDE';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Accessible Guard Control Banner */}
      <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-2xl mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
              <Shield className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {societyConfig.gateName || 'Main Security Gate'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Live Sync
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ✓ Post-Approval: Direct Green Light (No OTP)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Security Guard Command Desk
              </h2>
              <p className="text-xs text-slate-400">
                High-Contrast Audio-Visual Assistive Interface
              </p>
            </div>
          </div>

          {/* Quick Voice & Language Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoAnnounce(!autoAnnounce)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                autoAnnounce
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {autoAnnounce ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{autoAnnounce ? 'Voice: ON' : 'Voice: OFF'}</span>
            </button>

            <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {LANGUAGE_OPTIONS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setLanguage(item.id)}
                  className={`px-2 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    language === item.id
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={item.sub}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big Visual Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setFilterTab('approved')}
            className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center justify-between ${
              filterTab === 'approved'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
                : 'bg-slate-950/70 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black">{approvedList.length}</div>
              <div className="text-xs font-extrabold uppercase tracking-wider">APPROVED (GREEN)</div>
              <div className="text-[10px] opacity-90 font-semibold">Direct Entry Allowed</div>
            </div>
            <CheckCircle2 className="w-8 h-8 opacity-80 shrink-0" />
          </button>

          <button
            onClick={() => setFilterTab('denied')}
            className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center justify-between ${
              filterTab === 'denied'
                ? 'bg-rose-500/25 border-rose-400 text-rose-300 ring-2 ring-rose-400/40'
                : 'bg-slate-950/70 border-rose-500/30 text-rose-400 hover:border-rose-500/60'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black">{deniedList.length}</div>
              <div className="text-xs font-extrabold uppercase tracking-wider">STOP / DENIED</div>
              <div className="text-[10px] opacity-90 font-semibold">Do Not Let Inside</div>
            </div>
            <XCircle className="w-8 h-8 opacity-80 shrink-0" />
          </button>

          <button
            onClick={() => setFilterTab('pending')}
            className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center justify-between ${
              filterTab === 'pending'
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-950/70 border-amber-500/30 text-amber-400 hover:border-amber-500/60'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black">{pendingList.length}</div>
              <div className="text-xs font-extrabold uppercase tracking-wider">WAITING</div>
              <div className="text-[10px] opacity-90 font-semibold">Keep Waiting at Gate</div>
            </div>
            <Clock className="w-8 h-8 opacity-80 shrink-0" />
          </button>

          <button
            onClick={() => setFilterTab('inside')}
            className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center justify-between ${
              filterTab === 'inside'
                ? 'bg-blue-500/25 border-blue-400 text-blue-300 ring-2 ring-blue-400/40'
                : 'bg-slate-950/70 border-blue-500/30 text-blue-400 hover:border-blue-500/60'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black">{insideList.length}</div>
              <div className="text-xs font-extrabold uppercase tracking-wider">ON PREMISES</div>
              <div className="text-[10px] opacity-90 font-semibold">Currently Inside</div>
            </div>
            <DoorOpen className="w-8 h-8 opacity-80 shrink-0" />
          </button>
        </div>
      </div>

      <OtpQuickVerify
        visitors={visitors}
        onPassInside={handlePassInside}
        language={language}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'active' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Gate Alerts ({approvedList.length + deniedList.length + pendingList.length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Activity Log ({visitors.length})
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredVisitors.length}</strong> visitor entries
        </div>
      </div>

      {filteredVisitors.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Visitors in this Filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Switch filter tabs above or submit a new visitor entry from the Visitor Kiosk tablet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVisitors.map(visitor => (
            <GuardAlertCard
              key={visitor.id}
              visitor={visitor}
              language={language}
              onPassInside={handlePassInside}
              onRecordExit={handleRecordExit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
