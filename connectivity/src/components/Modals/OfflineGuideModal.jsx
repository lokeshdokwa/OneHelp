import React, { useState } from 'react';
import { BookOpen, HeartPulse, Flame, Waves, AlertTriangle, CheckCircle, X, ChevronRight } from 'lucide-react';

export default function OfflineGuideModal({ onClose }) {
  const [activeGuide, setActiveGuide] = useState('cpr');

  const guides = [
    {
      id: 'cpr',
      title: 'Adult CPR (Cardiopulmonary Resuscitation)',
      category: 'Medical Life Support',
      icon: <HeartPulse className="w-5 h-5 text-red-400" />,
      steps: [
        'Place hands centered on chest between nipples.',
        'Push hard and fast: 100 to 120 compressions per minute.',
        'Allow chest to recoil completely between compressions.',
        'If trained, give 2 rescue breaths after every 30 compressions.',
        'Continue until emergency responders or AED arrives.'
      ]
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding & Tourniquet Control',
      category: 'Trauma First Aid',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      steps: [
        'Apply direct firm pressure to wound using clean cloth or gauze.',
        'Elevate injured limb above heart level if no fracture suspected.',
        'If arterial spurting persists, apply tourniquet 2-3 inches above wound.',
        'Tighten tourniquet until bleeding stops; note exact time applied on forehead.'
      ]
    },
    {
      id: 'earthquake',
      title: 'Earthquake Survival Protocol',
      category: 'Natural Disaster',
      icon: <Flame className="w-5 h-5 text-cyan-400" />,
      steps: [
        'DROP to hands and knees immediately.',
        'COVER your head and neck under a sturdy table or desk.',
        'HOLD ON until shaking stops completely.',
        'Avoid elevators, glass windows, and unreinforced masonry walls.'
      ]
    },
    {
      id: 'flood',
      title: 'Severe Flood & Submersion Escape',
      category: 'Disaster Protocol',
      icon: <Waves className="w-5 h-5 text-blue-400" />,
      steps: [
        'Move to higher ground immediately; do NOT walk through moving water.',
        '6 inches of moving water can knock an adult down.',
        'Avoid contact with floodwater (risk of electrical charge & pathogens).',
        'Signal emergency rescuers from rooftop using bright cloth or flashlight Morse SOS.'
      ]
    }
  ];

  const selected = guides.find((g) => g.id === activeGuide) || guides[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Offline Survival & First-Aid</h3>
              <p className="text-[10px] text-cyan-400 font-bold">100% Pre-Cached • Zero Internet Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Category Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 border-b border-slate-800 shrink-0">
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGuide(g.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                activeGuide === g.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {g.icon}
              <span>{g.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Guide Details */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {selected.category}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Verified Medical Step-by-Step
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-100">{selected.title}</h4>
          </div>

          <div className="space-y-2">
            {selected.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800/90"
              >
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Offline DB v4.2 Ready
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
