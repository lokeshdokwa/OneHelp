import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Radio, Battery, ShieldCheck, Languages } from 'lucide-react';

export default function StatusBar({ connectionState, setConnectionState, selectedLanguage, setSelectedLanguage }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'online':
        return {
          label: 'Online • ERSS 112 Direct',
          dotBg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          textClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'offline':
        return {
          label: 'Offline Mode Active (Zero-Data SMS)',
          dotBg: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          textClass: 'text-amber-300 border-amber-500/30 bg-amber-950/40',
          icon: <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'mesh':
      default:
        return {
          label: 'Mesh Relay Connected (14 Nearby Nodes)',
          dotBg: 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse',
          textClass: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50',
          icon: <Radio className="w-3.5 h-3.5 text-cyan-400" />
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800/80 sticky top-0 z-30 px-4 py-2.5 transition-colors duration-200">
      {/* Top Device Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
        <div className="flex items-center space-x-2">
          <span className="text-slate-200 font-semibold tracking-wide">{time || '09:15 AM'}</span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">SIH 2026</span> SIH26206
          </span>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <button
            onClick={() => {
              const langs = ['EN', 'HI', 'MR', 'TA', 'BN'];
              const nextIdx = (langs.indexOf(selectedLanguage) + 1) % langs.length;
              setSelectedLanguage(langs[nextIdx]);
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-700 transition"
            title="Change language"
          >
            <Languages className="w-3 h-3 text-blue-400" />
            <span>{selectedLanguage}</span>
          </button>

          <div className="flex items-center gap-1 text-emerald-400 text-[11px] bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
            <Battery className="w-3.5 h-3.5" />
            <span>88%</span>
          </div>
        </div>
      </div>

      {/* Main Connection State Pill */}
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${status.textClass} transition-all`}>
          <span className={`w-2 h-2 rounded-full ${status.dotBg}`}></span>
          {status.icon}
          <span className="truncate">{status.label}</span>
        </div>

        {/* Quick Simulator Switcher for Judges / Reviewers */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] shrink-0">
          <button
            onClick={() => setConnectionState('online')}
            className={`px-2 py-0.5 rounded transition ${connectionState === 'online' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Online
          </button>
          <button
            onClick={() => setConnectionState('offline')}
            className={`px-2 py-0.5 rounded transition ${connectionState === 'offline' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Offline
          </button>
          <button
            onClick={() => setConnectionState('mesh')}
            className={`px-2 py-0.5 rounded transition ${connectionState === 'mesh' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Mesh
          </button>
        </div>
      </div>
    </div>
  );
}
