import React from 'react';
import { Navigation, Users, PhoneCall, Mic, ShieldAlert } from 'lucide-react';

export default function QuickActionRow({ onActionClick }) {
  const actions = [
    {
      id: 'gps_share',
      label: 'Live GPS Share',
      subtext: 'Share active path',
      icon: <Navigation className="w-5 h-5 text-blue-400" />,
      badge: 'Active',
      color: 'border-blue-500/30 hover:border-blue-400 bg-slate-900/90'
    },
    {
      id: 'alert_contacts',
      label: 'Alert Family',
      subtext: '5 contacts preset',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      badge: 'SMS/Mesh',
      color: 'border-emerald-500/30 hover:border-emerald-400 bg-slate-900/90'
    },
    {
      id: 'call_helpline',
      label: '112 Helpline',
      subtext: 'Police / NDRF',
      icon: <PhoneCall className="w-5 h-5 text-red-400" />,
      badge: 'Direct',
      color: 'border-red-500/30 hover:border-red-400 bg-slate-900/90'
    },
    {
      id: 'audio_recorder',
      label: 'Audio Evidence',
      subtext: 'Encrypted mic rec',
      icon: <Mic className="w-5 h-5 text-amber-400" />,
      badge: 'BlackBox',
      color: 'border-amber-500/30 hover:border-amber-400 bg-slate-900/90'
    },
    {
      id: 'geofence_map',
      label: 'Danger Zone',
      subtext: 'Geofence warning',
      icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
      badge: '1.2km Near',
      color: 'border-purple-500/30 hover:border-purple-400 bg-slate-900/90'
    }
  ];

  return (
    <div className="w-full px-4 py-3 bg-slate-950 border-y border-slate-800/80">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Emergency Quick Actions
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Scroll &rarr;</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onActionClick(act.id)}
            className={`flex flex-col justify-between w-32 h-24 p-2.5 rounded-xl border text-left shrink-0 transition-all transform active:scale-95 shadow-md ${act.color}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                {act.icon}
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {act.badge}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-100 leading-tight">{act.label}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{act.subtext}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
