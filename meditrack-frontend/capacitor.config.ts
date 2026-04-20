import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meditrack.pro',
  appName: 'Meditrack Pro',
  webDir: 'dist',
  // When running in APK, point API calls to your backend server IP
  // Change this IP to your PC's local IP when testing on real device
  server: {
    // Remove this block when building production APK
    // androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#f4f6ff',
  }
};

export default config;
