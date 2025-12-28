import crypto from 'crypto';

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

export function hashDeviceInfo(deviceInfo: DeviceInfo): string {
  // Use only user agent for consistent fingerprint per browser
  // This means same browser will always generate same fingerprint
  const deviceString = deviceInfo.userAgent;
  
  return crypto.createHash('sha256').update(deviceString).digest('hex');
}

// Generate a unique device fingerprint for first-time login
export function generateDeviceFingerprint(): string {
  // Create a random fingerprint for storing in browser
  const randomString = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return crypto.createHash('sha256').update(randomString).digest('hex');
}

export function validateDeviceInfo(deviceInfo: any): deviceInfo is DeviceInfo {
  return (
    typeof deviceInfo === 'object' &&
    typeof deviceInfo.userAgent === 'string' &&
    typeof deviceInfo.platform === 'string' &&
    typeof deviceInfo.screenResolution === 'string' &&
    typeof deviceInfo.timezone === 'string'
  );
}
