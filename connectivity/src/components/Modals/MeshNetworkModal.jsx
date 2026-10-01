import React from 'react';
import { Radio, Cpu, Share2, Wifi, Zap, X, CheckCircle2 } from 'lucide-react';

export default function MeshNetworkModal({ onClose }) {
  const nodes = [
    { id: 'N-1', label: 'Node #881 (Samsung S23)', distance: '12 meters', hops: '1 Hop', rssi: '-54 dBm', status: 'Active Relay' },
    { id: 'N-2', label: 'Node #402 (OnePlus 11)', distance: '45 meters', hops: '2 Hops', rssi: '-68 dBm', status: 'Active Relay' },
    { id: 'N-3', label: 'Node #915 (iPhone 14)', distance: '110 meters', hops: '3 Hops', rssi: '-82 dBm', status: 'Active Relay' },
    { id: 'N-4', label: 'NDRF Gateway Van (Satellite Bridge)', distance: '240 meters', hops: '4 Hops', rssi: '-91 dBm', status: 'Bridge Gateway' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Bluetooth Mesh Relay Network</h3>
              <p className="text-[10px] text-cyan-400 font-bold">Infrastructure-Less P2P BLE Emergency Mesh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* Status summary banner */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Mesh Topology State</span>
              <h4 className="text-sm font-extrabold text-cyan-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                14 Devices Connected (250m Radius)
              </h4>
              <p className="text-[11px] text-slate-400">Auto-routes distress signals via multi-hop P2P</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                0% Cell Needed
              </span>
            </div>
          </div>

          {/* Network Visual Graph Representation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-around relative z-10 py-2">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  You
                </div>
                <span className="text-[9px] text-slate-300 font-bold mt-1">Origin</span>
              </div>

              <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-cyan-500 animate-pulse"></div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  Node 1
                </div>
                <span className="text-[9px] text-slate-400 mt-1">12m • Hop 1</span>
              </div>

              <div className="h-0.5 w-12 bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse"></div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-300 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  NDRF
                </div>
                <span className="text-[9px] text-emerald-400 font-bold mt-1">Gateway</span>
              </div>
            </div>
          </div>

          {/* Node List */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase text-slate-300">Active Proximity Relays</h5>
            {nodes.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">{n.label}</p>
                    <p className="text-[10px] text-slate-400">{n.distance} • {n.rssi}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {n.hops}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            BLE Mesh Active (Low Energy)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
          >
            Close Topology
          </button>
        </div>
      </div>
    </div>
  );
}
