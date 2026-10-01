import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Radio, Shield, Truck, Star, Sparkles } from 'lucide-react';

export default function AdvancedProtection({ onOpenFeature }) {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      id: 'ai_stress',
      title: 'On-Device AI Voice Stress Analyzer',
      desc: 'Local speech & emotion neural net (0% cloud)',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      tag: '< 10MB Model'
    },
    {
      id: 'mesh_network',
      title: 'Bluetooth Mesh Relay Network',
      desc: 'P2P BLE multi-hop messaging when cellular fails',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      tag: '14 Active Nodes'
    },
    {
      id: 'hazard_map',
      title: 'Crowdsourced Live Hazard Map',
      desc: 'Real-time user reports of floods, landslides & fires',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
      tag: 'Verified'
    },
    {
      id: 'green_corridor',
      title: 'Ambulance Green Corridor Alert',
      desc: 'Automated signal clearing for emergency vehicles',
      icon: <Truck className="w-4 h-4 text-red-400" />,
      tag: 'ERSS Sync'
    },
    {
      id: 'feedback_rating',
      title: 'Post-Emergency Feedback & Rating',
      desc: 'Transparent responder response-time audit log',
      icon: <Star className="w-4 h-4 text-yellow-400" />,
      tag: 'Audit Log'
    }
  ];

  return (
    <div className="w-full px-4 py-3 bg-slate-950 border-t border-slate-800/80">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
      >
        <div className="flex items-center gap-2 text-left">
          <div className="p-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Advanced Protection & AI Systems
            </h3>
            <p className="text-[10px] text-slate-400">
              Mesh Relay, AI Voice Analysis & Satellite Bridge (Tap to {isOpen ? 'collapse' : 'expand'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
            5 Tech Features
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content List */}
      {isOpen && (
        <div className="mt-2.5 space-y-2 animate-fadeIn">
          {features.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onOpenFeature(feat.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 cursor-pointer transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">{feat.desc}</p>
                </div>
              </div>

              <span className="text-[9px] font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700 shrink-0">
                {feat.tag}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
