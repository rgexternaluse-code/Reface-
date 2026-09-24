export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: Record<string, any>;
  android?: Record<string, any>;
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.reface.faceswap',
  appName: 'Reface',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    backgroundColor: '#090d16',
  },
};

export default config;
