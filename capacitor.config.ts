import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.diwan.app',
  appName: 'الديوان',
  webDir: 'src',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2600,
      launchAutoHide: true,
      backgroundColor: '#000000ff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};
export default config;
