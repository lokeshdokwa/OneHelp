import React from 'react';
import { Home, Map, Users, History, User } from 'lucide-react';

export default function BottomNavBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'Map', icon: <Map className="w-5 h-5" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur border-t border-slate-800 sticky bottom-0 z-30 px-3 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-red-400 font-bold bg-red-950/40 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-red-500 rounded-full absolute -bottom-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
