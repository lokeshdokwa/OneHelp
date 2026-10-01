import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall, Radio, CheckCircle2, Lock, X, Server, Send, HardDrive } from 'lucide-react';
import { communicationManager } from '../../services/communicationManager.js';

export default function SOSCountdownModal({ onClose, onOpenDuress, connectionState }) {
  const [countdown, setCountdown] = useState(5);
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('Initiating location triangulation...');
  const [deliveryResult, setDeliveryResult] = useState(null);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !isDispatched) {
      handleDispatch();
    }
    return () => clearTimeout(timer);
  }, [countdown, isDispatched]);

  const handleDispatch = async () => {
    setIsDispatched(true);
    setDispatchStatus('Selecting optimal fallback transport (Internet → SMS → BLE P2P → Local Queue)...');

    const result = await communicationManager.dispatchEmergencySOS({
      emergencyType: 'SOS_PRESS',
      userIdentifier: 'Aman Choudhary'
    });

    setDeliveryResult(result);

    if (result.status === 'DELIVERED') {
      setDispatchStatus(`Distress alert delivered successfully via ${result.transport}!`);
    } else if (result.status === 'RELAYED') {
      setDispatchStatus(`Distress alert relayed to peer node [${result.targetPeer}] over Bluetooth P2P!`);
    } else if (result.status === 'QUEUED') {
      setDispatchStatus(`All network transports offline. Saved to Local Offline Queue (Auto-retry on reconnect).`);
    } else {
      setDispatchStatus(`Dispatch completed: ${result.detail || result.status}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-red-500/50 rounded-3xl max-w-sm w-full p-5 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Top Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>Emergency SOS Triggered</span>
        </div>

        {/* Central Countdown or Dispatched Icon */}
        {!isDispatched ? (
          <div className="my-4 relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-red-600/20 border-4 border-red-500 flex items-center justify-center animate-pulse">
              <span className="text-6xl font-black text-red-500 drop-shadow">{countdown}</span>
            </div>
            <svg className="absolute w-36 h-36 -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="66"
                className="stroke-red-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="414"
                strokeDashoffset={414 - (414 * (5 - countdown)) / 5}
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <div className="my-4 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 border-4 shadow-lg ${
              deliveryResult?.status === 'DELIVERED'
                ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : deliveryResult?.status === 'RELAYED'
                ? 'bg-cyan-950 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                : 'bg-amber-950 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
            }`}>
              {deliveryResult?.status === 'DELIVERED' && <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />}
              {deliveryResult?.status === 'RELAYED' && <Radio className="w-12 h-12 text-cyan-400 animate-pulse" />}
              {deliveryResult?.status === 'QUEUED' && <HardDrive className="w-12 h-12 text-amber-400 animate-pulse" />}
              {!deliveryResult && <Send className="w-12 h-12 text-red-400 animate-spin" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
              {deliveryResult ? `TRANSPORT: ${deliveryResult.transport}` : 'DISPATCHING...'}
            </span>
          </div>
        )}

        <h3 className="text-lg font-extrabold text-slate-100 mb-1">
          {!isDispatched ? 'Dispatching Emergency Alert' : (deliveryResult ? `Status: ${deliveryResult.status}` : 'Routing Distress Packet')}
        </h3>

        <p className="text-xs text-slate-300 mb-4 px-2">
          {dispatchStatus}
        </p>

        {/* Channel Status info */}
        <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 text-left space-y-2 text-xs mb-4">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              112 ERSS Central Control:
            </span>
            <span className="text-emerald-400 font-bold">Auto-Routed</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Primary Network Mode:
            </span>
            <span className="text-cyan-400 font-bold uppercase">{connectionState}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              GPS Coordinates:
            </span>
            <span className="text-slate-200 font-mono">26.9124° N, 75.7873° E</span>
          </div>
          {deliveryResult && (
            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800 font-mono text-[11px]">
              <span>Packet ID:</span>
              <span className="text-amber-300 truncate max-w-[140px]">{deliveryResult.packetId}</span>
            </div>
          )}
        </div>

        {/* Cancel Action buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
          >
            I'm Safe (Cancel Alert)
          </button>
          
          <button
            onClick={() => {
              onClose();
              onOpenDuress();
            }}
            className="w-full py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-1.5 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Enter Silent Duress PIN (Coerced)
          </button>
        </div>
      </div>
    </div>
  );
}
