import React, { useState, useRef } from 'react';
import { AlertOctagon, Smartphone, ShieldAlert, Zap } from 'lucide-react';

export default function HeroSOS({ onTriggerSOS, onTriggerShake }) {
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const startPress = () => {
    setIsPressing(true);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 5;
      setPressProgress(current);
      if (current >= 100) {
        clearInterval(intervalRef.current);
        setIsPressing(false);
        setPressProgress(0);
        onTriggerSOS('hold_completed');
      }
    }, 50); // 100% over 1s (fast responsive hold) or tap
  };

  const endPress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pressProgress < 100 && isPressing) {
      // If user tapped quickly, still open SOS trigger with high responsiveness
      onTriggerSOS('tap');
    }
    setIsPressing(false);
    setPressProgress(0);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-5 pb-6 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
      {/* Background Subtle Radar Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* Primary Hero Heading / User Safety Greeting */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4 px-1">
        <div>
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Emergency Distress Dispatch</h2>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <span>Aman Choudhary</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] text-emerald-400 font-normal">(Safe • Active Monitoring)</span>
          </p>
        </div>
        
        {/* Shake Trigger Test Pill */}
        <button
          onClick={onTriggerShake}
          className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30 transition shadow-sm"
          title="Simulate shaking device 3 times"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span>Shake Test</span>
        </button>
      </div>

      {/* Main SOS Circular Button */}
      <div className="relative my-2 flex items-center justify-center">
        {/* Outer Animated Pulse Rings */}
        <div className="absolute w-56 h-56 rounded-full bg-red-600/15 animate-sos-pulse pointer-events-none"></div>
        <div className="absolute w-44 h-44 rounded-full bg-red-500/20 animate-ping pointer-events-none duration-1000"></div>

        {/* Progress Ring SVG */}
        <svg className="absolute w-48 h-48 -rotate-90 pointer-events-none">
          <circle
            cx="96"
            cy="96"
            r="88"
            className="stroke-red-950"
            strokeWidth="8"
            fill="transparent"
          />
          {isPressing && (
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-red-500 transition-all duration-75"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="552.92"
              strokeDashoffset={552.92 - (552.92 * pressProgress) / 100}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Core SOS Button */}
        <button
          onMouseDown={startPress}
          onMouseUp={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          className={`w-40 h-40 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-4 border-red-400/80 shadow-[0_0_40px_rgba(220,38,38,0.65)] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer z-10 group`}
        >
          <AlertOctagon className="w-10 h-10 text-white mb-1 drop-shadow-md group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-black text-white tracking-widest drop-shadow-lg">SOS</span>
          <span className="text-[10px] uppercase font-bold text-red-100/90 tracking-wider mt-0.5">
            {isPressing ? `HOLDING (${Math.round(pressProgress)}%)` : 'EMERGENCY'}
          </span>
        </button>
      </div>

      {/* Sub-label instruction */}
      <div className="mt-3 text-center">
        <p className="text-sm font-bold text-slate-100 tracking-wide flex items-center justify-center gap-1.5">
          <Zap className="w-4 h-4 text-red-400 animate-pulse" />
          Press or Shake to Alert
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
          Direct dispatch to <strong>112 ERSS</strong> & family circle • Works offline via <strong>SMS & P2P Mesh</strong>
        </p>
      </div>
    </div>
  );
}
