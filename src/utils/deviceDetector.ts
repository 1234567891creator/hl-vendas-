import { DeviceInfo } from '../types';

export function detectCurrentDevice(userEmail?: string): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Desktop',
      browser: 'Browser',
      os: 'Desconhecido',
      screenSize: '1920x1080',
      ipSimulated: '192.168.1.100',
      userAgent: 'Unknown',
      timestamp: new Date().toISOString(),
      loggedUserEmail: userEmail
    };
  }

  const ua = navigator.userAgent;
  let deviceType = 'Desktop';
  let os = 'Windows / Linux';
  let browser = 'Chrome';

  // Device detection
  if (/Android/i.test(ua)) {
    deviceType = 'Celular Android';
    os = 'Android';
  } else if (/iPhone/i.test(ua)) {
    deviceType = 'Apple iPhone';
    os = 'iOS (iPhone)';
  } else if (/iPad/i.test(ua)) {
    deviceType = 'Apple iPad';
    os = 'iPadOS';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = 'MacBook / Mac';
    os = 'macOS';
  } else if (/Windows/i.test(ua)) {
    deviceType = 'PC / Notebook';
    os = 'Windows 11/10';
  }

  // Browser detection
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
  }

  // Generate consistent pseudo IP based on hostname & browser
  const simulatedIp = `177.${Math.abs((ua.length * 13) % 200) + 10}.${Math.abs((window.screen.width * 7) % 250) + 5}.${Math.abs((window.screen.height * 3) % 250) + 1}`;

  return {
    deviceType,
    browser,
    os,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    ipSimulated: simulatedIp,
    userAgent: ua,
    timestamp: new Date().toISOString(),
    loggedUserEmail: userEmail
  };
}
