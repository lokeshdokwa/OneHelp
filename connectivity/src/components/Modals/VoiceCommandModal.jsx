import React, { useState } from 'react';
import { Mic, Volume2, ShieldCheck, Languages, Check, X, Sparkles } from 'lucide-react';

export default function VoiceCommandModal({ onClose, selectedLanguage }) {
  const [isListening, setIsListening] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [actionTriggered, setActionTriggered] = useState('');

  const samplePhrases = [
    { phrase: 'Bachao! Emergency!', lang: 'Hindi (हिन्दी)', action: 'Trigger Full SOS Broadcast' },
    { phrase: 'Help me, track location', lang: 'English', action: 'Share Live GPS with Family' },
    { phrase: 'Madat kara, Police bolva', lang: 'Marathi (मराठी)', action: 'Call 112 Police Helpline' },
    { phrase: 'Khabar Dao, NDRF Team', lang: 'Bengali (বাংলা)', action: 'Alert Rescue Team' }
  ];

  const simulateSpeech = (phrase, action) => {
    setIsListening(true);
    setDetectedText(`Listening... "${phrase}"`);
    setActionTriggered('');

    setTimeout(() => {
      setIsListening(false);
      setDetectedText(`Recognized Phrase: "${phrase}"`);
      setActionTriggered(`AI Match: ${action}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Multi-Language Voice Command</h3>
              <p className="text-[10px] text-blue-400 font-bold">On-Device Offline Speech Model (&lt;10MB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic Listener Visualizer */}
        <div className="my-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
          <button
            onClick={() => simulateSpeech('Bachao! Emergency!', 'Trigger Full SOS Broadcast')}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-blue-600 border-4 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.8)] scale-110'
                : 'bg-blue-950 border-2 border-blue-500/50 hover:bg-blue-900'
            }`}
          >
            <Mic className={`w-8 h-8 ${isListening ? 'text-white animate-bounce' : 'text-blue-400'}`} />
          </button>
          
          <p className="text-xs font-bold text-slate-200 mt-3">
            {isListening ? 'Listening for acoustic distress...' : 'Tap Mic or Say Trigger Phrase Hands-Free'}
          </p>
          
          {detectedText && (
            <p className="text-xs font-mono text-blue-300 mt-1 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {detectedText}
            </p>
          )}

          {actionTriggered && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/40">
              <Check className="w-4 h-4" />
              <span>{actionTriggered}</span>
            </div>
          )}
        </div>

        {/* Sample Trigger Phrases */}
        <div className="space-y-2 mb-3">
          <h5 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Preset Offline Voice Triggers ({selectedLanguage})
          </h5>

          {samplePhrases.map((item, idx) => (
            <button
              key={idx}
              onClick={() => simulateSpeech(item.phrase, item.action)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition text-left"
            >
              <div>
                <p className="text-xs font-bold text-slate-100">"{item.phrase}"</p>
                <p className="text-[10px] text-slate-400">{item.lang}</p>
              </div>
              <span className="text-[10px] font-semibold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                Test Trigger
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-blue-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Audio Cloud Uploads
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
