import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.diwan.andalus',
  appName: 'ديوان الأندلس',
  webDir: 'dist/public',
  android: {
    backgroundColor: '#0a0e27',
  },
  ios: {
    backgroundColor: '#0a0e27',
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#0a0e27',
      androidSplashResourceName: 'splash',
      useDialog: false,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#00000000',
      overlaysWebView: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#c9a22a',
    },
  },
};

export default config;
