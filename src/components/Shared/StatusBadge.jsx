import React from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, LogOut } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showHindi = false }) {
  const configs = {
    APPROVED: {
      label: 'APPROVED',
      hindi: 'मंजूर (जाने दें)',
      bg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      icon: CheckCircle2,
      dot: 'bg-emerald-400',
    },
    DENIED: {
      label: 'DENIED / STOP',
      hindi: 'मना किया (रोकें)',
      bg: 'bg-rose-500/25 border-rose-500/60 text-rose-300',
      icon: XCircle,
      dot: 'bg-rose-400',
    },
    PENDING: {
      label: 'WAITING APPROVAL',
      hindi: 'इंतज़ार करें',
      bg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
      icon: Clock,
      dot: 'bg-amber-400 animate-pulse',
    },
    INSIDE: {
      label: 'INSIDE PREMISES',
      hindi: 'अंदर मौजूद',
      bg: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
      icon: ShieldCheck,
      dot: 'bg-blue-400',
    },
    EXITED: {
      label: 'EXITED GATE',
      hindi: 'बाहर गए',
      bg: 'bg-slate-700/40 border-slate-600/50 text-slate-300',
      icon: LogOut,
      dot: 'bg-slate-400',
    },
  };

  const current = configs[status] || configs.PENDING;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-bold tracking-wide',
    xl: 'text-lg px-6 py-3.5 gap-3 font-extrabold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${current.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <Icon className={size === 'xl' ? 'w-6 h-6' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{current.label}</span>
      {showHindi && <span className="opacity-90 font-normal text-xs ml-1 border-l border-white/20 pl-2">({current.hindi})</span>}
    </span>
  );
}
