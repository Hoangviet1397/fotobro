/* FotoBro — cầu nối Capacitor (iOS) — iOS v1.0
 * ---------------------------------------------------------------------------
 * MỤC ĐÍCH: cho app bọc Capacitor những tính năng native mà bản web không có,
 * để qua được App Store Review Guideline 4.2 (không chỉ là một webview):
 *  - Google OAuth qua trình duyệt hệ thống + deep-link trở về app
 *    (Google CẤM OAuth trong WKWebView — xem GOOGLE-SETUP.md §4).
 *  - Nhắc lịch chụp / hạn giao ảnh bằng Local Notifications (chạy cả khi app đóng).
 *  - Chạm có rung nhẹ (Haptics), chia sẻ hệ thống (Share), chọn ảnh trang chủ
 *    từ thư viện bằng Camera plugin (thay input file).
 *  - Splash screen + Status Bar nền trắng #FFFFFF theo UI Apple Music
 *    (cấu hình trong capacitor.config.ts, không cần code ở đây).
 *
 * MIC ĐÃ DỜI SANG v2.1 (20/11/2026): plugin @capacitor-community/speech-
 * recognition@7.0.1 đã GỠ khỏi package.json vì không có Package.swift (SPM)
 * nên build Capacitor 8 gãy. Toàn bộ code giọng nói native đã xoá khỏi file
 * này; nút mic trong app hiện báo "Giọng nói sẽ có ở bản v2.1". Đừng thêm
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
 *    @capacitor/preferences.
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
        notes.push({ id: notifId('shoot', job.id), title: 'Hôm nay có lịch chụp 📷',
          body: (job.client || 'Khách') + ' — ' + (job.type || 'chụp') + (job.shootTime ? ' lúc ' + job.shootTime : ''),
          schedule: { at: new Date(d.getTime() - 12 * 3600000) } });
      }
      if (job.deadline) {
        var dl = new Date(job.deadline + 'T09:00:00');
        notes.push({ id: notifId('dl', job.id), title: 'Sắp tới hạn giao ảnh',
          body: (job.client || 'Khách') + ' — hạn giao ' + job.deadline,
          schedule: { at: new Date(dl.getTime() - 24 * 3600000) } });
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

  void isIOS;
})();
