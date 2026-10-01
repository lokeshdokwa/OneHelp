import React, { useState, useEffect } from 'react';
import StatusBar from './components/StatusBar';
import HeroSOS from './components/HeroSOS';
import QuickActionRow from './components/QuickActionRow';
import SmartToolsGrid from './components/SmartToolsGrid';
import AdvancedProtection from './components/AdvancedProtection';
import BottomNavBar from './components/BottomNavBar';

// Modals
import SOSCountdownModal from './components/Modals/SOSCountdownModal';
import DuressPinModal from './components/Modals/DuressPinModal';
import OfflineGuideModal from './components/Modals/OfflineGuideModal';
import MedicalDossierModal from './components/Modals/MedicalDossierModal';
import MeshNetworkModal from './components/Modals/MeshNetworkModal';
import VoiceCommandModal from './components/Modals/VoiceCommandModal';
import LiveMapModal from './components/Modals/LiveMapModal';

import { connectivityDetector } from './services/connectivityDetector.js';
import { Smartphone, Monitor, ShieldCheck, Sun, Cloud, CloudRain, CheckCircle, RefreshCw, AlertOctagon, Heart, Users, MapPin } from 'lucide-react';

export default function App() {
  const [connectionState, setConnectionStateInternal] = useState('mesh'); // 'online' | 'offline' | 'mesh'

  const setConnectionState = (newState) => {
    setConnectionStateInternal(newState);
    connectivityDetector.setForcedState(newState);
  };

  useEffect(() => {
    connectivityDetector.setForcedState(connectionState);
  }, []);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isFakeMode, setIsFakeMode] = useState(false);

  // Active Modals state
  const [activeModal, setActiveModal] = useState(null); // 'sos' | 'duress' | 'guide' | 'medical' | 'mesh' | 'voice' | 'map'
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQuickAction = (id) => {
    switch (id) {
      case 'gps_share':
        showToast('Live GPS link generated & broadcasted via SMS/Mesh to 5 contacts!');
        break;
      case 'alert_contacts':
        showToast('Family Circle alerted via high-priority SMS & P2P Mesh!');
        break;
      case 'call_helpline':
        showToast('Dialing 112 ERSS National Helpline Direct Hotline...');
        break;
      case 'audio_recorder':
        showToast('Encrypted background 60s audio recorder started.');
        break;
      case 'geofence_map':
        setActiveModal('map');
        break;
      default:
        break;
    }
  };

  const handleOpenSmartTool = (id) => {
    switch (id) {
      case 'dispatcher_map':
        setActiveModal('map');
        break;
      case 'voice_command':
        setActiveModal('voice');
        break;
      case 'duress_pin':
        setActiveModal('duress');
        break;
      case 'whatsapp_blast':
        showToast('WhatsApp Emergency Blast template launched to contacts!');
        break;
      case 'survival_guides':
        setActiveModal('guide');
        break;
      case 'medical_dossier':
        setActiveModal('medical');
        break;
      default:
        break;
    }
  };

  const handleOpenAdvancedFeature = (id) => {
    switch (id) {
      case 'mesh_network':
        setActiveModal('mesh');
        break;
      case 'ai_stress':
        showToast('On-Device AI Stress Analyzer Active: Ambient noise calm (Level 1/10)');
        break;
      case 'hazard_map':
        setActiveModal('map');
        break;
      case 'green_corridor':
        showToast('Ambulance Green Corridor Signal Alert sent to ERSS Traffic Control!');
        break;
      case 'feedback_rating':
        showToast('Response Audit Log opened: ERSS response time target <4.5 minutes.');
        break;
      default:
        break;
    }
  };

  // Render Fake Normal UI when Silent Duress PIN (9999) is triggered
  if (isFakeMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-sm w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
            <span>City Weather App</span>
            <button
              onClick={() => setIsFakeMode(false)}
              className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
            >
              Exit Demo
            </button>
          </div>
          <Sun className="w-16 h-16 text-amber-400 mx-auto mb-2 animate-spin-slow" />
          <h2 className="text-3xl font-extrabold text-slate-100">28°C</h2>
          <p className="text-sm font-bold text-slate-300">Partly Cloudy • Jaipur</p>
          <div className="my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 text-left space-y-2 text-xs text-slate-300">
            <p><strong>Humidity:</strong> 42%</p>
            <p><strong>Air Quality:</strong> 64 Good</p>
            <p><strong>Wind:</strong> 12 km/h NW</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
            [Covert Alert Status: Stealth SOS active • GPS transmitting to 112]
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-red-500 selection:text-white">
      
      {/* Top Demo Bar Controls for Judges / Reviewers */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-3 px-2 text-xs text-slate-400 font-semibold">
        <div className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>OneHelp Mobile UI • Adult Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-200 transition"
          >
            {isMobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{isMobileFrame ? 'Full View' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Mobile Screen Viewport */}
      <div
        className={`w-full max-w-sm bg-slate-950 text-slate-100 flex flex-col relative transition-all duration-300 overflow-hidden ${
          isMobileFrame
            ? 'sm:rounded-[40px] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_0_60px_rgba(15,23,42,0.9)] sm:min-h-[812px]'
            : 'min-h-screen border-0 rounded-none'
        }`}
      >
        {/* Custom Status Bar */}
        <StatusBar
          connectionState={connectionState}
          setConnectionState={setConnectionState}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="bg-red-600 text-white font-bold text-xs px-4 py-2 text-center animate-fadeIn shadow-lg z-40 sticky top-14">
            {toastMessage}
          </div>
        )}

        {/* Dynamic Tab Body Content */}
        <div className="flex-1 overflow-y-auto pb-4">
          {activeTab === 'home' && (
            <>
              {/* Hero SOS Button Zone */}
              <HeroSOS
                onTriggerSOS={() => setActiveModal('sos')}
                onTriggerShake={() => {
                  showToast('Shake detected! Launching Emergency SOS...');
                  setActiveModal('sos');
                }}
              />

              {/* Quick-Action Horizontally Scrollable Row */}
              <QuickActionRow onActionClick={handleQuickAction} />

              {/* Smart Tools 2x3 Grid */}
              <SmartToolsGrid onOpenTool={handleOpenSmartTool} />

              {/* Collapsible Advanced Protection Section */}
              <AdvancedProtection onOpenFeature={handleOpenAdvancedFeature} />
            </>
          )}

          {activeTab === 'map' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-100">Emergency Dispatch Map</h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  Offline Vectors Cached
                </span>
              </div>
              <button
                onClick={() => setActiveModal('map')}
                className="w-full py-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2 group transition"
              >
                <MapPin className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform animate-bounce" />
                <span className="text-sm font-bold text-slate-100">Tap to Expand Full Interactive Dispatch Map</span>
                <span className="text-xs text-slate-400">View 3 nearby NDRF units & crowdsourced hazards</span>
              </button>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="p-4 space-y-3">
              <h3 className="text-base font-extrabold text-slate-100">Family Safety Circle & Helplines</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Rajesh Sharma (Spouse)</h4>
                    <p className="text-xs text-slate-400">+91 98765 43210 • Primary ICE</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                    Live Synced
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">112 ERSS National Control</h4>
                    <p className="text-xs text-slate-400">Police, Ambulance, Fire & NDRF</p>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-950 px-2.5 py-1 rounded-lg border border-red-500/40">
                    Direct Toll-Free
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 space-y-3">
              <h3 className="text-base font-extrabold text-slate-100">Incident Logs & Stress History</h3>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                  <span>2026-09-13 08:45 AM</span>
                  <span className="text-emerald-400">System Self-Test Passed</span>
                </div>
                <p className="font-bold text-slate-200">Bluetooth Mesh P2P connection verified with 14 nodes.</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-4 space-y-3">
              <h3 className="text-base font-extrabold text-slate-100">Adult Profile & Health Dossier</h3>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="text-sm font-bold text-slate-100">Aman Choudhary</p>
                <p className="text-xs text-slate-400">Blood Group: O+ • Allergies: Penicillin</p>
                <button
                  onClick={() => setActiveModal('medical')}
                  className="w-full mt-2 py-2 bg-rose-950 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40"
                >
                  View Encrypted Medical Dossier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Render Active Modals */}
      {activeModal === 'sos' && (
        <SOSCountdownModal
          onClose={() => setActiveModal(null)}
          onOpenDuress={() => setActiveModal('duress')}
          connectionState={connectionState}
        />
      )}

      {activeModal === 'duress' && (
        <DuressPinModal
          onClose={() => setActiveModal(null)}
          onTriggerFakeMode={() => {
            setActiveModal(null);
            setIsFakeMode(true);
          }}
        />
      )}

      {activeModal === 'guide' && (
        <OfflineGuideModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'medical' && (
        <MedicalDossierModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'mesh' && (
        <MeshNetworkModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'voice' && (
        <VoiceCommandModal
          onClose={() => setActiveModal(null)}
          selectedLanguage={selectedLanguage}
        />
      )}

      {activeModal === 'map' && (
        <LiveMapModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
