import * as Network from 'expo-network';
import { ConnectivityStatus } from '../types';

let cachedStatus: ConnectivityStatus = 'ONLINE';

export async function checkConnectivity(): Promise<ConnectivityStatus> {
  try {
    const netState = await Network.getNetworkStateAsync();

    if (!netState.isConnected) {
      cachedStatus = 'OFFLINE';
      return 'OFFLINE';
    }

    if (netState.isInternetReachable === false) {
      // Device is on a cellular or local network without actual internet access
      cachedStatus = 'SMS_ONLY';
      return 'SMS_ONLY';
    }

    cachedStatus = 'ONLINE';
    return 'ONLINE';
  } catch (err) {
    console.warn('[Network] Check failed, assuming OFFLINE:', err);
    return 'OFFLINE';
  }
}

export function getCachedConnectivity(): ConnectivityStatus {
  return cachedStatus;
}
