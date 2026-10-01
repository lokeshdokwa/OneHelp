import React from 'react';
import { MapPin, Mic, Lock, MessageSquare, BookOpen, FileText, ChevronRight } from 'lucide-react';

export default function SmartToolsGrid({ onOpenTool }) {
  const tools = [
    {
      id: 'dispatcher_map',
      title: 'Live Dispatcher Map',
      description: 'NDRF, SDRF & police proximity',
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      badge: '3 Units Near',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'voice_command',
      title: 'Offline Voice Command',
      description: '"Help", "Bachao" trigger AI',
      icon: <Mic className="w-5 h-5 text-blue-400" />,
      badge: 'On-Device AI',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/40'
    },
    {
      id: 'duress_pin',
      title: 'Silent Duress PIN',
      description: 'Coercion protection / Fake UI',
      icon: <Lock className="w-5 h-5 text-amber-400" />,
      badge: 'PIN: ****',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40'
    },
    {
      id: 'whatsapp_blast',
      title: 'WhatsApp Emergency Blast',
      description: 'One-tap broadcast to circles',
      icon: <MessageSquare className="w-5 h-5 text-green-400" />,
      badge: '1-Tap Template',
      badgeColor: 'bg-green-950 text-green-300 border-green-500/40'
    },
    {
      id: 'survival_guides',
      title: 'Offline First-Aid Guides',
      description: 'CPR, Floods, Earthquakes',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      badge: '100% Offline',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'medical_dossier',
      title: 'Encrypted Medical Dossier',
      description: 'Blood O+, Allergies & ICE',
      icon: <FileText className="w-5 h-5 text-rose-400" />,
      badge: 'Encrypted',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/40'
    }
  ];

  return (
    <div className="w-full px-4 py-4 bg-slate-950">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Smart Emergency Tools
          </h3>
          <p className="text-[11px] text-slate-400">High-priority tools optimized for adult emergency scenarios</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            className="flex flex-col justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all text-left group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 group-hover:bg-slate-700/80 transition">
                  {tool.icon}
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors leading-snug">
                {tool.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-semibold text-slate-400 group-hover:text-slate-200">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
