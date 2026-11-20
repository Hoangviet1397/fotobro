# FotoBro v2.3 — Sửa viền trắng safe area + gợi ý lỗi Apple 1000

Ngày: 20/11/2026. Từ v2.2 (build 2.2 (13) đã lên TestFlight 17:07 20/11).

## Việt báo trên iPhone thật, build 2.2 (13), 17:29–17:31 20/11

1. **Chỗ đen chỗ trắng** — nội dung app tối nhưng viền TRẮNG lộ ở vùng status
   bar (trên cùng) và dưới tab bar (vùng home indicator), thấy trên cả 3 màn
   (Cài đặt → Tài khoản, Buổi chụp checklist, Buổi chụp → Lịch).
2. **Đăng nhập Apple vẫn lỗi 1000** — giờ hiện rõ mã nhờ appleLastError (v2.2):
   "Lỗi gần nhất: 1000 — The operation couldn't be completed.
   (com.apple.AuthenticationServices.AuthorizationError error 1000.)"

## 1. Sửa viền trắng (nguyên nhân đã tìm ra)

`capacitor.config.ts` đá nhau với CSS:

- Config cũ: `backgroundColor: '#FFFFFF'`, `StatusBar { style: 'DEFAULT',
  backgroundColor: '#FFFFFF', overlaysWebView: false }`,
  `ios.contentInset: 'always'`.
- `overlaysWebView: false` + `contentInset: 'always'` làm webview bị inset
  khỏi safe area — vùng inset lộ nền trắng của native — trong khi CSS đã tự
  xử safe area bằng `env(safe-area-inset-*)` ở `.nav`, `.wrap`, `.tabbar`,
  `.sheet-body` (nên `env()` về 0, padding safe-area mất tác dụng).

Sửa:

- `capacitor.config.ts`: `StatusBar.overlaysWebView: true` (webview phủ full
  màn, chui dưới status bar), bỏ `backgroundColor: '#FFFFFF'` của StatusBar,
  `backgroundColor` top-level → `'#000000'`, `ios.contentInset: 'never'`
  (để CSS `env()` nhận inset thật). `SplashScreen.backgroundColor` giữ
  nguyên `'#FFFFFF'` (không phải lỗi đang báo).
- `www/index.html`: `html` cũng có `background: var(--bg)` như `body`
  (trước đây chỉ `body` có nền nên vùng ngoài body — rubber-band
  overscroll, mép webview — lộ nền trắng của WKWebView trong theme tối).
- `www/capacitor-bridge.js` §9 mới `window.__fotobroStatusBarStyle(isDark)`:
  gọi `StatusBar.setStyle({ style: 'LIGHT' })` khi theme tối (chữ trắng),
  `'DARK'` khi theme sáng (chữ đen); không có plugin (bản web) thì bỏ qua
  im lặng. `applyTheme()` trong index.html gọi hàm này mỗi khi đổi theme;
  bridge tự đồng bộ một lần lúc nạp (vì bridge nạp sau script chính).
  Nút chọn theme trong Cài đặt gọi `applyTheme()` trực tiếp để chữ đổi
  ngay, không chờ render lại.

## 2. Lỗi Apple 1000 — điều tra xong, KHÔNG phải do ký/quyền

Đã chứng minh bằng file `.ipa` thật của build #13 (tải từ GitHub run #13,
giải nén, đọc entitlements DER trong chữ ký của binary `App`):

- Binary có `com.apple.developer.applesignin = "Default"`,
  `application-identifier = A64C927S45.com.fotobro.app`.
- `embedded.mobileprovision` trong `.ipa` cũng có `applesignin ['Default']`,
  profile "FotoBro App Store".
- `project.pbxproj` có `CODE_SIGN_ENTITLEMENTS` ở cả Debug + Release.
  Bundle ID khớp. Plugin `@capawesome/capacitor-apple-sign-in` đang ở
  0.1.5 = bản mới nhất trên npm (không có bản nâng cấp).

Nguyên nhân còn lại nhiều khả năng nhất: phía thiết bị — Apple ID chưa bật
Xác thực hai yếu tố (Sign in with Apple bắt buộc 2FA) hoặc chưa đăng nhập
iCloud/Keychain; hoặc lỗi nhất thời phía Apple.

Sửa duy nhất cho lỗi này: trong Cài đặt → Tài khoản, ngay dưới dòng
"Lỗi gần nhất: ...", khi mã lỗi là `1000` thì hiện thêm gợi ý kiểm tra
2FA/iCloud trên iPhone. Các mã lỗi khác không hiện dòng này. Giữ nguyên
toast và `appleLastError`. Không sửa phần ký, không đổi nonce/scopes.

## Test

- jsdom: toàn bộ suite đạt (683 test cũ + section [34] mới).
- Render 375px / iPhone 14 Pro Max (430×932), theme tối + sáng: vùng trên
  cùng (status bar) và vùng dưới cùng (home indicator) là màu nền của
  theme, không còn trắng. Lưu ý: `env(safe-area-inset-*)` trên trình giả
  lập trả 0 nên phần inset thật trên máy vẫn cần Việt kiểm chứng trên
  iPhone thật (xem LOG.md trong fotofix-v23/).

## Chưa làm

- Google không đụng tới (Google Lịch đang chạy tốt).
- Storage key `troLyXeo.v1` / `troLyXeoPhotos` không đổi.
