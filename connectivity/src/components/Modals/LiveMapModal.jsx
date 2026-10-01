import React, { useState } from 'react';
import { MapPin, Navigation, Shield, Truck, PhoneCall, AlertTriangle, Layers, X, Compass } from 'lucide-react';

export default function LiveMapModal({ onClose, defaultView = 'dispatch' }) {
  const [activeTab, setActiveTab] = useState(defaultView); // 'dispatch' or 'hazard'

  const responders = [
    { name: 'NDRF Rescue Unit 04', distance: '1.4 km', type: 'Disaster Team', status: 'En-route', phone: '1070' },
    { name: 'Police Control Room PCR #12', distance: '850 meters', type: 'Police Patrol', status: 'Patrolling', phone: '112' },
    { name: 'SMS Hospital Trauma Center', distance: '2.1 km', type: 'Emergency Hospital', status: 'Open 24/7', phone: '108' }
  ];

  const hazards = [
    { title: 'Submerged Underpass (3ft Water)', location: 'MI Road Circle', level: 'Severe', time: '10m ago' },
    { title: 'Fallen High-Voltage Cable', location: 'Station Road', level: 'Critical', time: '18m ago' },
    { title: 'Traffic Gridlock (Green Corridor Active)', location: 'Ajmer Flyover', level: 'Moderate', time: '5m ago' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[88vh] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Live Dispatcher & Hazard Map</h3>
              <p className="text-[10px] text-emerald-400 font-bold">Vector Map Pre-cached • Responders Live GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'dispatch'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Nearby Responders</span>
          </button>
          <button
            onClick={() => setActiveTab('hazard')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'hazard'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Crowdsourced Hazards</span>
          </button>
        </div>

        {/* Simulated Map View Container */}
        <div className="relative w-full h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden mb-3 flex items-center justify-center">
          {/* Map Grid Pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* Simulated Map Road lines */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="3">
            <line x1="20%" y1="0%" x2="80%" y2="100%" />
            <line x1="0%" y1="40%" x2="100%" y2="60%" />
            <line x1="60%" y1="0%" x2="40%" y2="100%" />
          </svg>

          {/* User Location Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </div>
              <div className="absolute -inset-2 rounded-full border border-red-500 animate-ping"></div>
            </div>
            <span className="text-[9px] font-extrabold text-white bg-red-950 px-1.5 py-0.5 rounded border border-red-500/50 mt-1">
              YOU (26.91°N)
            </span>
          </div>

          {/* Responder Pins */}
          <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
            <div className="p-1 rounded-full bg-emerald-600 text-white shadow-md">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] bg-slate-900 text-emerald-300 px-1 rounded">NDRF (1.4km)</span>
          </div>

          <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
            <div className="p-1 rounded-full bg-blue-600 text-white shadow-md">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] bg-slate-900 text-blue-300 px-1 rounded">PCR (850m)</span>
          </div>

          {/* Top Controls Overlay */}
          <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Vector Maps: Offline</span>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {activeTab === 'dispatch' ? (
            responders.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{res.name}</h4>
                  <p className="text-[10px] text-slate-400">{res.type} • {res.distance}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    {res.status}
                  </span>
                  <a
                    href={`tel:${res.phone}`}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            hazards.map((haz, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {haz.level} Hazard
                  </span>
                  <span className="text-[9px] text-slate-400">{haz.time}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{haz.title}</h4>
                <p className="text-[10px] text-slate-400">{haz.location}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Updated via P2P Mesh 1 minute ago
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
