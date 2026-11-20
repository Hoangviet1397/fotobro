import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fotobro.app',
  appName: 'FotoBro',
  webDir: 'www',
  backgroundColor: '#000000',
  ios: {
    // Nội dung web chạy trên capacitor://localhost — KHÔNG phải https://,
    // nên service worker và Google OAuth kiểu web đều không chạy như cũ.
    // Xem RISKS.md mục 1, 2 và BUILD-GUIDE.md.
    // v2.3: contentInset 'never' + StatusBar overlaysWebView:true — webview
    // phủ FULL màn (chui dưới status bar + home indicator), CSS tự xử
    // safe area bằng env(safe-area-inset-*). Trước đây 'always' + overlay
    // false làm webview bị inset, vùng inset lộ nền trắng của native trong
    // khi nội dung app tối (Việt báo 17:29 20/11: viền trắng trên + dưới).
    // backgroundColor '#000000' chỉ còn lộ khi rubber-band overscroll,
    // và CSS html đã có background var(--bg) che (xem www/index.html).
    contentInset: 'never',
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
      // v2.3: overlaysWebView:true — webview chui dưới status bar, chữ trên
      // status bar đổi theo theme bằng bridge §9 (__fotobroStatusBarStyle),
      // gọi mỗi khi applyTheme() chạy + lúc bridge nạp. style 'DEFAULT' ở
      // đây chỉ là giá trị ban đầu trước khi JS chạy (theme mặc định Ấm =
      // sáng nên chữ đen là đúng). Bỏ backgroundColor trắng cũ: khi
      // overlay thì status bar không có nền riêng nữa.
      style: 'DEFAULT',
      overlaysWebView: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#FA2D48',
    },
  },
};

export default config;
