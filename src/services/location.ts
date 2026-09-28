import * as Location from 'expo-location';
import { GeoLocation } from '../types';

let cachedLastLocation: GeoLocation | null = null;

export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      return false;
    }
    // Attempt background permission if needed, but don't fail if denied
    try {
      await Location.requestBackgroundPermissionsAsync();
    } catch {
      // Background permission can fail on certain android devices or simulator without crashing
    }
    return true;
  } catch (err) {
    console.warn('[Location] Failed requesting location permissions:', err);
    return false;
  }
}

export async function getCurrentOrLastKnownLocation(): Promise<GeoLocation | null> {
  try {
    // Check permission
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return cachedLastLocation;
    }

    // Try current position with balanced accuracy and 4s timeout for emergency responsiveness
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 4000,
      });

      let address = '';
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          const r = reverse[0];
          address = [r.name, r.street, r.subregion, r.city].filter(Boolean).join(', ');
        }
      } catch {
        // Reverse geocoding fails offline, which is expected
      }

      const geo: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        address: address || undefined,
      };

      cachedLastLocation = geo;
      return geo;
    } catch (locErr) {
      console.warn('[Location] getCurrentPosition failed, falling back to last known position:', locErr);
    }

    // Fallback to last known position from device cache
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) {
      const geo: GeoLocation = {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        accuracy: lastKnown.coords.accuracy,
        altitude: lastKnown.coords.altitude,
        timestamp: lastKnown.timestamp,
      };
      cachedLastLocation = geo;
      return geo;
    }
  } catch (err) {
    console.warn('[Location] Location error:', err);
  }

  return cachedLastLocation;
}

export function formatLocationLink(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}
