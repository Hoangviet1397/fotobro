/* FotoBro — cầu nối Capacitor (iOS) — iOS v1.0
 * ---------------------------------------------------------------------------
 * MỤC ĐÍCH: cho app bọc Capacitor những tính năng native mà bản web không có,
 * để qua được App Store Review Guideline 4.2 (không chỉ là một webview):
 *  - Google OAuth qua trình duyệt hệ thống + deep-link trở về app
 *    (Google CẤM OAuth trong WKWebView — xem GOOGLE-SETUP.md §4).
 *  - Nhắc lịch chụp / hạn giao ảnh bằng Local Notifications (chạy cả khi app đóng).
 *  - Chạm có rung nhẹ (Haptics), chia sẻ hệ thống (Share), chọn ảnh trang chủ
 *    từ thư viện bằng Camera plugin (thay input file).
 *  - Splash screen + Status Bar: v2.3 webview phủ full màn
 *    (overlaysWebView:true, contentInset:'never' trong
 *    capacitor.config.ts) nên chữ status bar đổi theo theme bằng §9
 *    dưới đây, không còn nền trắng #FFFFFF như v2.0–v2.2 nữa.
 *
 * MIC ĐÃ DỜI SANG v2.1 (20/11/2026): plugin @capacitor-community/speech-
 * recognition@7.0.1 đã GỠ khỏi package.json vì không có Package.swift (SPM)
 * nên build Capacitor 8 gãy. Toàn bộ code giọng nói native đã xoá khỏi file
 * này; nút mic trong app hiện báo "Giọng nói sẽ có ở bản sau". Đừng thêm
 * lại plugin này nếu chưa có Package.swift hoặc chưa viết plugin SPM mới.
 *
 * TRẠNG THÁI (20/11/2026): file này VIẾT XONG nhưng CHƯA KIỂM CHỨNG trên iOS
 * thật — chưa có máy Mac / chưa build được .ipa trên Linux (xem
 * IOS-SETUP-NOTE.md). Phải test trên TestFlight trước khi gửi duyệt.
 *
 * CÁCH NỐI VÀO index.html: file này được nhúng bằng
 * <script src="capacitor-bridge.js"> ngay trước </body> trong www/index.html.
 *  - OAuth: gConnect() trong index.html mở trang đăng nhập bằng plugin
 *    @capacitor/browser; Google trả code về scheme đã đăng ký trong
 *    Info.plist (CFBundleURLTypes) → listener appUrlOpen dưới đây phát
 *    event 'fotobro-oauth' → handleGoogleReturnUrl() trong index.html đổi
 *    code lấy token. Không cần móc nối thêm.
 *  - Local Notifications: window.__trolyxeoScheduleReminder(job) /
 *    window.__trolyxeoCancelReminder(jobId) — gọi từ index.html khi job
 *    được lưu / sửa / xoá (xem móc nối trong index.html).
 * Đọc / ghi dữ liệu KHÔNG đổi: vẫn localStorage key `troLyXeo.v1` và
 * IndexedDB `troLyXeoPhotos` (tối đa 60 ảnh). KHÔNG chuyển sang
 * Preferences plugin cho dữ liệu chính — tránh tách dữ liệu làm hai nơi.
 * ---------------------------------------------------------------------------
 * Plugin dùng ở đây — đã khai trong package.json (Capacitor 8):
 *  - @capacitor/app, @capacitor/browser, @capacitor/calendar,
 *    @capacitor/local-notifications, @capacitor/haptics, @capacitor/share,
 *    @capacitor/camera, @capacitor/splash-screen, @capacitor/status-bar,
 *    @capacitor/preferences, @capawesome/capacitor-apple-sign-in (v2.1),
 *    @capgo/capacitor-native-biometric (v2.2 — khoá Face ID native).
 *  Trong WebView, Capacitor tự chèn đối tượng `window.Capacitor` với
 *  `Capacitor.Plugins.*`. Trên bản web (Safari / GitHub Pages) đối tượng
 *  này không có — mọi nhánh dưới đây đều guard, app web chạy y như cũ.
 *  Info.plist cần (xem BUILD-GUIDE.md mục 4): NSCalendarsUsageDescription,
 *  NSCalendarsFullAccessUsageDescription, NSCalendarsWriteOnlyAccessUsageDescription,
 *  NSPhotoLibraryUsageDescription, NSPhotoLibraryAddUsageDescription,
 *  NSCameraUsageDescription, CFBundleURLTypes (com.fotobro.app + scheme
 *  Google reversed client ID).
 */
(function () {
  'use strict';
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return; // bản web: thoát, không làm gì
  var P = Cap.Plugins || {};
  var isIOS = (Cap.getPlatform && Cap.getPlatform() === 'ios');

  /* ---------- 1. Google OAuth: deep-link trở về app ---------- */
  var App = P.App;
  if (App && App.addListener) {
    App.addListener('appStateChange', function (state) {
      // Bản web đã có khóa PIN/passkey khi ẩn app (hiddenAt) — không làm gì thêm.
      void state;
    });
    // Google trả code về redirect scheme (com.googleusercontent.apps.<id>:/oauth2redirect)
    // → Capacitor phát appUrlOpen với ev.url = URL đầy đủ có ?code=...&state=...
    // Phát tiếp thành event 'fotobro-oauth' để handleGoogleReturnUrl() trong
    // index.html xử lý (đổi code lấy token bằng PKCE).
    App.addListener('appUrlOpen', function (ev) {
      if (!ev || !ev.url) return;
      if (typeof window.handleGoogleReturnUrl === 'function') {
        try { window.handleGoogleReturnUrl(ev.url); return; } catch (e) {}
      }
      window.dispatchEvent(new CustomEvent('fotobro-oauth', { detail: { url: ev.url } }));
    });
  }

  /* ---------- 2. Nhắc lịch chụp / hạn giao ảnh (Local Notifications) ---------- */
  var LN = P.LocalNotifications;
  // job: { id, client, type, shootDate 'YYYY-MM-DD', shootTime 'HH:mm', deadline 'YYYY-MM-DD' }
  // Quy ước ID: hash số từ job.id để hủy / ghi đè khi job đổi lịch.
  function notifId(prefix, jobId) {
    var h = 0; var s = String(prefix + ':' + jobId);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return (h % 2000000000) + 1;
  }
  async function scheduleReminder(job) {
    if (!LN || !job) return;
    try {
      var perm = await LN.requestPermissions();
      if (perm && perm.display && perm.display !== 'granted') return;
      var notes = [];
      if (job.shootDate) {
        var d = new Date(job.shootDate + 'T' + (job.shootTime || '08:00') + ':00');
        // Nhắc trước giờ chụp 12 TIẾNG (NOTIFICATIONS.md) — thống nhất với
        // tài liệu và PRIVACY (trước đây code để 60 phút, lệch tài liệu).
        // Lựa chọn 1h/24h trong Cài đặt dời sang v2.1.
        // Job gấp trong ngày: mốc 12 tiếng đã qua thì nhắc 60 phút trước,
        // 60 phút cũng qua rồi thì nhắc ngay sau ~30 giây — không lặng lẽ
        // bỏ nhắc. Chỉ nhắc khi giờ chụp còn ở phía trước.
        // 20/11/2026: đổi sang nhắc trước 1 NGÀY (24 tiếng) theo yêu cầu.
        var at = d.getTime() - 24 * 3600000, ttl = 'Mai có lịch chụp 📷';
        if (at <= Date.now()) { at = d.getTime() - 3600000; ttl = 'Sắp tới lịch chụp 📷'; }
        if (at <= Date.now()) { at = Date.now() + 30000; ttl = 'Sắp tới lịch chụp 📷'; }
        if (d.getTime() > Date.now()) {
          notes.push({ id: notifId('shoot', job.id), title: ttl,
            body: (job.client || 'Khách') + ' — ' + (job.type || 'chụp') + (job.shootTime ? ' lúc ' + job.shootTime : ''),
            schedule: { at: new Date(at) } });
        }
      }
      if (job.deadline) {
        var dl = new Date(job.deadline + 'T09:00:00');
        var atDl = dl.getTime() - 24 * 3600000;
        if (atDl <= Date.now()) atDl = dl.getTime() - 3600000;
        if (atDl <= Date.now()) atDl = Date.now() + 30000;
        if (dl.getTime() > Date.now()) {
          notes.push({ id: notifId('dl', job.id), title: 'Sắp tới hạn giao ảnh',
            body: (job.client || 'Khách') + ' — hạn giao ' + job.deadline,
            schedule: { at: new Date(atDl) } });
        }
      }
      // Chỉ đặt lịch trong tương lai; quá khứ thì bỏ qua.
      notes = notes.filter(function (n) { return n.schedule.at.getTime() > Date.now(); });
      if (!notes.length) return;
      await LN.schedule({ notifications: notes });
    } catch (e) { /* nhắc lịch là tính năng phụ: lỗi thì im lặng, app vẫn chạy */ }
  }
  window.__trolyxeoScheduleReminder = scheduleReminder;
  async function cancelReminder(jobId) {
    if (!LN || !jobId) return;
    try {
      await LN.cancel({ notifications: [
        { id: notifId('shoot', jobId) }, { id: notifId('dl', jobId) } ] });
    } catch (e) {}
  }
  window.__trolyxeoCancelReminder = cancelReminder;

  /* ---------- 3. Haptics: rung nhẹ khi chạm (tôn trọng UX 10 giây) ---------- */
  var Haptics = P.Haptics;
  if (Haptics && Haptics.impact) {
    document.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (t) { try { Haptics.impact({ style: 'LIGHT' }); } catch (e) {} }
    }, true);
  }

  /* ---------- 4. Chia sẻ hệ thống (Share sheet iOS) ---------- */
  var Share = P.Share;
  // Dùng cho: chia sẻ báo cáo ngày / sao lưu JSON / link Drive của job.
  // Fallback: navigator.share (web) rồi copy clipboard — giữ nguyên hành vi web.
  window.__trolyxeoShare = async function (opts) {
    if (Share && Share.share) {
      try { await Share.share(opts || {}); return true; } catch (e) { return false; }
    }
    return false;
  };

  /* ---------- 5. Chọn ảnh trang chủ từ thư viện (Camera plugin) ---------- */
  var Camera = P.Camera;
  // Trả về dataUrl (JPEG) để code ảnh trang chủ hiện có lưu vào IndexedDB
  // troLyXeoPhotos như cũ. Cần móc nối trong index.html tại chỗ xử lý
  // input file ảnh (hàm thêm ảnh từ máy) — xem ghi chú đầu file.
  window.__trolyxeoPickHero = async function () {
    if (!Camera || !Camera.getPhoto) return null;
    try {
      var photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 'DATA_URL', // 'dataUrl' trong bản Capacitor 8 (chuỗi base64 có prefix)
        source: 'PHOTOS',
      });
      return photo && photo.dataUrl ? photo.dataUrl : null;
    } catch (e) { return null; }
  };

  /* ---------- 6. Lịch iPhone native (@capacitor/calendar) ---------- */
  // index.html gọi trực tiếp window.Capacitor.Plugins.Calendar (findEvents /
  // createEventInteractively) trong importFromNativeCalendar(). Móc này chỉ
  // để code web kiểm tra nhanh plugin có sẵn không, không gọi gì khác.
  window.__fotobroNativeCalendar = function () {
    return !!(P.Calendar && P.Calendar.findEvents);
  };

  /* ---------- 7. Đăng nhập bằng Apple (v2.1) ---------- */
  // Plugin @capawesome/capacitor-apple-sign-in 0.1.5 — jsName "AppleSignIn".
  // Chỉ native iOS. Trả về { user, email, givenName, familyName } hoặc null khi
  // người dùng bấm Huỷ (không toast lỗi). Lỗi thật thì throw để index.html toast.
  // idToken / authorizationCode KHÔNG trả về cho index.html (v2.1 không có
  // server để xác thực, giữ lại chỉ thêm rủi ro — xem APPLE-SIGNIN-PLAN.md §5).
  // Không gọi initialize() — chỉ cần cho Android/Web.
  // v2.2: coi cả code '1001' (raw ASAuthorizationError.canceled) là Huỷ —
  // phòng trường hợp CustomError mapping của plugin bị bypass ở bản sau.
  window.__fotobroAppleSignIn = async function () {
    var SIA = P.AppleSignIn;
    if (!SIA || !SIA.signIn) return null; // plugin chưa có (web / build cũ)
    var nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    var r;
    try {
      r = await SIA.signIn({ scopes: ['EMAIL', 'FULL_NAME'], nonce: nonce });
    } catch (e) {
      if (e && (e.code === 'SIGN_IN_CANCELED' || e.code === '1001')) return null; // người dùng bấm Huỷ: im lặng
      throw e;
    }
    r = r || {};
    return { user: r.user || null, email: r.email || null,
             givenName: r.givenName || null, familyName: r.familyName || null };
  };
  window.__fotobroAppleAvailable = function () {
    return !!(P.AppleSignIn && P.AppleSignIn.signIn);
  };

  /* ---------- 8. Sinh trắc native (v2.2) ---------- */
  // Plugin @capgo/capacitor-native-biometric 8.9.3 — jsName "NativeBiometric".
  // Khoá Face ID trong app native DÙNG CÁI NÀY, không dùng WebAuthn nữa:
  // WebAuthn trong WKWebView (origin capacitor://localhost) hay lỗi
  // NotAllowedError nên Việt bấm bật khoá trên máy thật là lỗi (build 2.1).
  // Chỉ xác thực mở khoá, không lưu thêm gì: mã PIN dự phòng vẫn là hash
  // SHA-256 + salt trong localStorage như cũ (LOCK_KEY không đổi).
  window.__fotobroBiometricAvailable = async function () {
    var NB = P.NativeBiometric;
    if (!NB || !NB.isAvailable) return false;
    try { var r = await NB.isAvailable({ useFallback: true }); return !!(r && r.isAvailable); }
    catch (e) { return false; }
  };
  window.__fotobroBiometricVerify = async function (reason) {
    var NB = P.NativeBiometric;
    if (!NB || !NB.verifyIdentity) return false;
    try {
      await NB.verifyIdentity({ reason: reason || 'Mở khoá FotoBro', title: 'FotoBro', useFallback: true, negativeButtonText: 'Huỷ' });
      return true;
    } catch (e) { return false; } // Huỷ / thất bại: im lặng, caller tự dùng PIN
  };

  /* ---------- 9. Status Bar theo theme (v2.3) ---------- */
  // v2.2 lộ viền trắng ở safe area vì capacitor.config.ts đặt
  // overlaysWebView:false + nền trắng; v2.3 cho webview phủ full màn
  // (overlaysWebView:true, contentInset:'never') nên chữ trên status bar
  // phải đổi theo theme, không thì chữ đen chìm trên nền tối (theme Tối)
  // hoặc chữ trắng chìm trên nền sáng (theme Ấm / Tối giản).
  // 'LIGHT' = chữ trắng (theme tối), 'DARK' = chữ đen (theme sáng).
  // Không có plugin (bản web) thì im lặng bỏ qua.
  // Hàm này được applyTheme() trong index.html gọi mỗi khi đổi theme;
  // bridge nạp SAU script chính (thẻ <script> cuối body) nên tự đồng bộ
  // một lần lúc nạp để lần mở app đầu tiên cũng đúng chữ.
  window.__fotobroStatusBarStyle = function (isDark) {
    var SB = P.StatusBar;
    if (!SB || !SB.setStyle) return;
    try { SB.setStyle({ style: isDark ? 'LIGHT' : 'DARK' }); } catch (e) {}
  };
  try {
    var _th = document.documentElement && document.documentElement.getAttribute('data-theme');
    window.__fotobroStatusBarStyle(_th === 'dark');
  } catch (e) {}

  void isIOS;
})();
