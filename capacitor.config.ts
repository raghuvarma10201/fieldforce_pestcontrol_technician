import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fieldforce.technician.app',
  appName: 'Fieldforce Technician App',
  webDir: 'dist',
  server: {
    cleartext: true,
    hostname: 'https://rpwebapps.us/',
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
