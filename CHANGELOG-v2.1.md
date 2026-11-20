# FotoBro — Changelog v2.1

- **Phiên bản:** 2.1 (`APP_VERSION` vẫn `'2.0'` cho tới khi Việt chốt số phiên bản v2.1 — xem dưới)
- **Bundle ID:** `com.fotobro.app`
- **Nền tảng:** iOS (Capacitor 8)
- **Ngày phát hành:** _chưa chốt_ (điền khi bản TestFlight v2.1 được duyệt)
- **Repo:** `Hoangviet1397/fotobro`, nhánh `apple-signin` (chưa gộp main, chưa build)
- **Tài liệu thiết kế:** `APPLE-SIGNIN-PLAN.md`

> Ghi chú: bản v2.1 đang làm trong `~/workspace/fotobro-ios-v1/`, nhánh
> `apple-signin`. Chưa build `.ipa`, chưa lên TestFlight, chưa kiểm chứng
> trên iPhone thật. Số phiên bản v2.1 chưa chốt — `APP_VERSION` trong
> `www/index.html` vẫn là `'2.0'` và `MARKETING_VERSION` trong pbxproj vẫn
> là `2.0` cho tới khi Việt duyệt số phiên bản trước lúc build.

## Tính năng mới trong v2.1

### Đăng nhập bằng Apple (tài khoản Google / Apple, không tài khoản riêng)
- Nút **"Đăng nhập bằng Apple"** trong Cài đặt → mục **Tài khoản** mới (đặt trên
  mục Kết nối Google). Chỉ hiện trên app iPhone native; bản web ẩn hẳn.
- Bấm nút mở sheet đăng nhập native của iOS (ASAuthorizationAppleIDProvider).
  Đăng nhập xong Cài đặt hiện tên + email, kèm nút Đăng xuất Apple ID.
- Đăng nhập **không bắt buộc** — app chạy đầy đủ khi chưa đăng nhập.
- Dữ liệu chỉ lưu trên máy (`cfg.apple` trong key `troLyXeo.v1`): mã định danh
  Apple, tên, email (có thể là email ẩn `@privaterelay.appleid.com`), thời điểm
  đăng nhập. **Không lưu** `idToken` / `authorizationCode` (không có server để
  xác thực). Tên/email chỉ Apple trả lần đầu nên được lưu ngay và giữ lại ở
  các lần đăng nhập sau.
- Đăng xuất chỉ xoá tên/email Apple khỏi máy; job, tiền và cài đặt giữ nguyên.
  "Xoá tài khoản" = Đăng xuất + Xoá hết dữ liệu (đã có trong Cài đặt).
- Đóng rủi ro **Guideline 4.8**: app đã có cả đăng nhập Google và Apple.
  App Privacy "Data Not Collected" vẫn đúng (định danh chỉ ở trên máy).

### Sửa kèm khi chạm Cài đặt
- Hàng **Liên hệ** trong Cài đặt dùng email hỗ trợ thật `supportfotobro@gmail.com`
  (lấy từ `FOTOBRO_CONFIG.supportEmail`) thay cho `support@fotobro.app` (hộp thư
  không tồn tại). `PRIVACY.html` / `SUPPORT.html` / `PRIVACY.md` sửa tương tự.

## Kỹ thuật

- Plugin: `@capawesome/capacitor-apple-sign-in@0.1.5` (pin đúng bản).
  **Mini-G0 ĐẠT 20/11/2026:** `Package.swift` của plugin đòi
  `capacitor-swift-pm from: "8.0.0"` → giao với `exact 8.6.2` của app cho ra
  8.6.2; `npx cap sync ios` chạy sạch, không cảnh báo phiên bản.
- Plugin cũ `@capacitor-community/apple-sign-in@7.1.0` **đã loại**: đòi
  `capacitor-swift-pm` 7.x, cổng G0 rớt 12:16 20/11/2026 (xung đột tất định).
- Bridge mới trong `www/capacitor-bridge.js` (mục 7): `__fotobroAppleSignIn()`,
  `__fotobroAppleAvailable()`. Bridge bắt mã lỗi `SIGN_IN_CANCELED` (người dùng
  bấm Huỷ) và trả `null` im lặng; chỉ throw lỗi thật. Không gọi `initialize()`
  trên iOS, không truyền `clientId`/`redirectUrl` (iOS không dùng).
- Xcode: thêm capability Sign in with Apple → file mới
  `ios/App/App/FotoBro.entitlements` (`com.apple.developer.applesignin = Default`),
  `CODE_SIGN_ENTITLEMENTS` trong cả Debug và Release.
- Test jsdom: 120/120 cũ + test mới cho Apple (xem `test-fotobro-v2.js` mục [14]–[15]).

## Lỗi đã biết / việc còn lại

- Chưa kiểm chứng trên iPhone thật (sheet Apple, lần đăng nhập 2, Huỷ, Ẩn email,
  thu hồi quyền) — xem `APPLE-SIGNIN-PLAN.md` §9, checklist 10 mục.
- Chưa kiểm chứng profile "FotoBro App Store" có gồm capability Sign in with Apple
  không — nếu build báo thiếu capability thì tạo lại profile (Việt làm qua trình
  duyệt như lần trước).
- Chưa build trên GitHub Actions (chờ duyệt rồi mới build từ nhánh `apple-signin`).
- `APP_VERSION` / `MARKETING_VERSION` vẫn 2.0 — chốt số phiên bản trước khi build.
