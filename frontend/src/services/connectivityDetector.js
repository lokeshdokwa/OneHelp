/**
 * OneHelp Emergency Communication Layer
 * Real-Time Connectivity & Capability Detector
 */

class ConnectivityDetector {
  constructor() {
    this.listeners = new Set();
    this.forcedState = null; // Simulation/testing state: 'online' | 'offline' | 'mesh' | 'sms_only' | null
    
    this.isInternetAvailable = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isBluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    this.isSmsAvailable = true;
    this.nearbyPeersCount = 14;

    this.initEventListeners();
  }

  initEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  handleNetworkChange(onlineStatus) {
    this.isInternetAvailable = onlineStatus;
    this.notifyListeners();
  }

  setForcedState(state) {
    this.forcedState = state;
    if (state === 'online') {
      this.isInternetAvailable = true;
    } else if (state === 'offline' || state === 'mesh' || state === 'sms_only') {
      this.isInternetAvailable = false;
    }
    this.notifyListeners();
  }

  getCapabilities() {
    if (this.forcedState === 'online') {
      return {
        internet: true,
        sms: true,
        bluetooth: true,
        peersAvailable: this.nearbyPeersCount > 0,
        mode: 'online'
      };
    }
    if (this.forcedState === 'sms_only') {
      return {
        internet: false,
        sms: true,
        bluetooth: false,
        peersAvailable: false,
        mode: 'sms_only'
      };
    }
    if (this.forcedState === 'mesh') {
      return {
        internet: false,
        sms: false,
        bluetooth: true,
        peersAvailable: this.nearbyPeersCount > 0,
        mode: 'mesh'
      };
    }
    if (this.forcedState === 'offline') {
      return {
        internet: false,
        sms: false,
        bluetooth: false,
        peersAvailable: false,
        mode: 'offline'
      };
    }

    return {
      internet: this.isInternetAvailable,
      sms: this.isSmsAvailable,
      bluetooth: this.isBluetoothSupported,
      peersAvailable: this.nearbyPeersCount > 0,
      mode: this.isInternetAvailable ? 'online' : (this.nearbyPeersCount > 0 ? 'mesh' : 'offline')
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getCapabilities());
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const caps = this.getCapabilities();
    this.listeners.forEach(fn => fn(caps));
  }
}

export const connectivityDetector = new ConnectivityDetector();
export default connectivityDetector;
