import React, { useState } from 'react';
import { Lock, Shield, EyeOff, Check, X, ShieldAlert } from 'lucide-react';

export default function DuressPinModal({ onClose, onTriggerFakeMode }) {
  const [pin, setPin] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === '9999') {
          // Duress PIN entered!
          setStatusMsg('Duress Mode Activated! Stealth distress signal sent. Switching to fake normal UI...');
          setTimeout(() => {
            onTriggerFakeMode();
          }, 1500);
        } else {
          // Standard PIN entered
          setStatusMsg('Normal Security PIN verified.');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setStatusMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-3 rounded-full bg-amber-950 border border-amber-500/40 text-amber-400 mb-3">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-base font-extrabold text-slate-100 mb-1">Silent Duress PIN Entry</h3>
        <p className="text-xs text-slate-400 text-center mb-4 px-2">
          Entering <strong>9999</strong> triggers <strong>Silent Fake Mode</strong> while covertly alerting authorities with live GPS.
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'border-slate-700 bg-slate-950'
              }`}
            ></div>
          ))}
        </div>

        {statusMsg && (
          <p className="text-xs font-bold text-amber-400 text-center bg-amber-950/60 p-2 rounded-lg border border-amber-500/30 mb-3">
            {statusMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg border border-slate-700 transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-800/60 text-slate-400 text-xs font-bold border border-slate-800 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg border border-slate-700 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={() => handleKeyPress('9999')}
            className="h-12 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 text-[10px] font-extrabold border border-amber-500/40 flex items-center justify-center leading-tight p-1 text-center"
            title="Quick demo fill duress 9999"
          >
            Demo 9999
          </button>
        </div>

        <div className="w-full text-center text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
          <span>Coerced by attacker? Type 9999 to show fake weather app.</span>
        </div>
      </div>
    </div>
  );
}
