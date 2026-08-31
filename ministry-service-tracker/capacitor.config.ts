import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tkp1972.ministryservicetracker',
  appName: 'Ministry Service Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
