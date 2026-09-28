import * as SMS from 'expo-sms';
import { TrustedContact, GeoLocation } from '../types';
import { formatLocationLink } from './location';

export interface SmsDispatchResult {
  success: boolean;
  recipientCount: number;
  message: string;
}

export function buildSosSmsMessage(location: GeoLocation | null, customNote?: string): string {
  const locUrl = location
    ? formatLocationLink(location.latitude, location.longitude)
    : 'Location GPS acquiring...';

  const notePart = customNote ? `\nNote: ${customNote}` : '';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `EMERGENCY ALERT [OneHelp ${timestamp}]!\nI need immediate assistance. My coordinates: ${locUrl}${notePart}\nPlease notify local emergency dispatch (112).`;
}

export async function sendEmergencySms(
  contacts: TrustedContact[],
  location: GeoLocation | null,
  customNote?: string
): Promise<SmsDispatchResult> {
  if (!contacts || contacts.length === 0) {
    return {
      success: false,
      recipientCount: 0,
      message: 'No trusted contacts configured for emergency SMS.',
    };
  }

  const phoneNumbers = contacts.map((c) => c.phone.trim()).filter((p) => p.length > 0);
  if (phoneNumbers.length === 0) {
    return {
      success: false,
      recipientCount: 0,
      message: 'No valid phone numbers found among trusted contacts.',
    };
  }

  const messageText = buildSosSmsMessage(location, customNote);

  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        recipientCount: phoneNumbers.length,
        message: 'SMS service is not available on this device (No SIM or unsupported hardware).',
      };
    }

    const { result } = await SMS.sendSMSAsync(phoneNumbers, messageText);

    if (result === 'sent' || result === 'unknown') {
      return {
        success: true,
        recipientCount: phoneNumbers.length,
        message: `Emergency SMS dispatched to ${phoneNumbers.length} contacts.`,
      };
    }

    return {
      success: false,
      recipientCount: phoneNumbers.length,
      message: `SMS action closed with status: ${result}`,
    };
  } catch (err: any) {
    console.warn('[SMS] Emergency SMS delivery failed:', err);
    return {
      success: false,
      recipientCount: phoneNumbers.length,
      message: err.message || 'SMS transmission failed',
    };
  }
}
