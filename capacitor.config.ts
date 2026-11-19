import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fotobro.app',
  appName: 'FotoBro',
  webDir: 'www',
  backgroundColor: '#FFFFFF',
  ios: {
    // Nội dung web chạy trên capacitor://localhost — KHÔNG phải https://,
    // nên service worker và Google OAuth kiểu web đều không chạy như cũ.
    // Xem RISKS.md mục 1, 2 và BUILD-GUIDE.md.
    contentInset: 'always',
  },
  server: {
    // KHÔNG dùng url ngoài: app phải chạy offline từ file trong www/,
    // đúng mô hình zero-server của bản web. Không bật cleartext.
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#FA2D48',
    },
  },
};

export default config;
