import React from 'react';
import { FileText, ShieldCheck, Heart, UserCheck, AlertCircle, Phone, Lock, X } from 'lucide-react';

export default function MedicalDossierModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Encrypted Medical Dossier</h3>
              <p className="text-[10px] text-rose-400 font-bold">On-Device AES-256 Encrypted • Responders Access</p>
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
          {/* Patient Card */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Adult Holder</span>
              <h4 className="text-base font-extrabold text-slate-100">Aman Choudhary (Age 28)</h4>
              <p className="text-xs text-slate-400">ID: IND-8892-SIH2026</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500/60 text-rose-300">
              <span className="text-xs block font-bold uppercase text-rose-400">Blood Group</span>
              <span className="text-2xl font-black">O+</span>
            </div>
          </div>

          {/* Critical Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Known Allergies</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">Penicillin, Peanuts</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mb-1">
                <Heart className="w-4 h-4" />
                <span>Medical Conditions</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">Mild Asthma (Inhaler)</p>
            </div>
          </div>

          {/* Emergency Contacts (ICE) */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <h5 className="text-xs font-bold uppercase text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Trusted Family Contacts (ICE)
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-100">Rajesh Sharma (Spouse)</p>
                  <p className="text-[10px] text-slate-400">+91 98765 43210 • Emergency SMS Enabled</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Primary
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-100">Sunita Sharma (Mother)</p>
                  <p className="text-[10px] text-slate-400">+91 98123 67890 • Emergency SMS Enabled</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Secondary
                </span>
              </div>
            </div>
          </div>

          {/* Security & Privacy Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This dossier is stored strictly locally using SQLite + SQLCipher on your device. First responders can unlock it via emergency NFC or offline PIN during rescue operations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Cloud Privacy Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
