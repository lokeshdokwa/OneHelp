import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

type ShakeCallback = () => void;

let subscription: { remove: () => void } | null = null;
let lastShakeTime = 0;

const SENSITIVITY_THRESHOLDS = {
  high: 1.5,   // Easier to trigger (smaller acceleration needed)
  medium: 2.2, // Standard shake
  low: 3.0,    // Requires violent shake
};

export function startShakeDetection(
  sensitivity: 'low' | 'medium' | 'high',
  onShake: ShakeCallback
): void {
  stopShakeDetection();

  const threshold = SENSITIVITY_THRESHOLDS[sensitivity] || 2.2;
  Accelerometer.setUpdateInterval(100);

  subscription = Accelerometer.addListener(({ x, y, z }) => {
    // Total acceleration magnitude in Gs
    const totalG = Math.sqrt(x * x + y * y + z * z);

    if (totalG > threshold) {
      const now = Date.now();
      // Debounce shakes: require 2.5s between triggers
      if (now - lastShakeTime > 2500) {
        lastShakeTime = now;
        console.log(`[ShakeDetector] Shake detected with force: ${totalG.toFixed(2)}G`);
        onShake();
      }
    }
  });
}

export function stopShakeDetection(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
