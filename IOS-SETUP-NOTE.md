# Ghi chú tạo thư mục ios/ — đã làm được trên Linux

Ngày: 19/11/2026 — cập nhật 20/11/2026 cho iOS v2.0. Máy làm: VM Linux của Muse (Node 24.22.1, npm 10.9.4).

## Kết quả: `npx cap add ios` CHẠY ĐƯỢC trên Linux ✅

Lệnh `npx cap add ios` chỉ scaffold file (tạo Xcode project, copy www/),
không cần Xcode hay CocoaPods nên chạy được trên Linux. Đã chạy thành công
sau khi bổ sung `@capacitor/ios` (lần đầu lỗi vì thiếu package này):

```
[error] Could not find the ios platform.
        You must install it in your project first, e.g. w/ npm install @capacitor/ios
```

Sau `npm install --save @capacitor/ios@^8.0.0`:

```
✔ Adding native Xcode project in ios
✔ Copying web assets from www to ios/App/App/public
✔ Creating capacitor.config.json in ios/App/App
[warn] @capacitor-community/speech-recognition does not have a Package.swift
[warn] Some installed Capacitor plugins are not compatible with SPM
✔ update ios in 29.67ms
[success] ios platform added!
```

## Phiên bản đã cài (khóa trong package-lock.json)

| Package | Phiên bản đã cài |
|---|---|
| @capacitor/core / cli / ios | 8.6.2 |
| @capacitor/app | 8.1.2 |
| @capacitor/camera | 8.2.6 |
| @capacitor/haptics | 8.0.2 |
| @capacitor/local-notifications | 8.3.1 |
| @capacitor/preferences | 8.0.1 |
| @capacitor/share | 8.0.3 |
| @capacitor/splash-screen | 8.0.2 |
| @capacitor/status-bar | 8.0.4 |
| @capacitor/calendar | 1.0.1 |
| @capacitor/browser | 8.0.5 |
| ~~@capacitor-community/speech-recognition~~ | ~~7.0.1~~ — **đã gỡ 20/11, mic dời v2.1** (không có Package.swift cho SPM) |
| typescript (dev) | 5.x |

## Đã xác minh trong ios/ tạo ra

- `ios/App/App.xcodeproj/project.pbxproj`: `PRODUCT_BUNDLE_IDENTIFIER =
  com.fotobro.app`, `IPHONEOS_DEPLOYMENT_TARGET = 15.0`,
  `MARKETING_VERSION = 2.0` (đổi từ 1.0 ngày 20/11 theo chỉ đạo của Việt;
  key lưu trữ `troLyXeo.v1` giữ nguyên). Signing Release thống nhất Manual
  (iPhone Distribution + profile "FotoBro App Store").
- `ios/App/App/public/`: bản copy của www/ (index.html + capacitor-bridge.js
  + icon PNG/SVG + manifest). Mỗi lần sửa www/ phải chạy `npx cap sync ios`
  (trên Mac / trong workflow) để copy lại.
- `ios/App/App/capacitor.config.json`: đã sinh từ capacitor.config.ts,
  `packageClassList` có đủ 10 plugin (browser + calendar đã có sau
  `npx cap sync ios` 20/11; không còn SpeechRecognition).
- `Info.plist`: usage description hiện tại (26 keys, parse được): Lịch
  iPhone (đọc/ghi/viết), thư viện ảnh (xem + thêm), máy ảnh, **Face ID**
  (thêm 20/11). Micro + nhận dạng giọng nói đã **gỡ** (mic v2.1).
- Icon: `@capacitor/assets@4.0.0` đã tạo AppIcon 1024 universal
  (`AppIcon-512@2x.png` 1024×1024) + splash 2732×2732. Lần chạy đầu lỗi
  quyền npm cache (`EPERM chown` do cache có file root-owned); chạy lại
  với `npm_config_cache=/tmp/npm-cache-19nov npx --yes @capacitor/assets@4.0.0
  generate` thì được. Nguồn: `assets/icon.png` (= AppIcon-1024.png),
  `assets/splash.png` (nền kem + icon sen ở giữa, tự tạo bằng PIL).

## Chưa làm được trên Linux (cần Mac / GitHub Actions)

- `npx cap open ios` / mở Xcode — không có Xcode trên Linux.
- `xcodebuild archive` / build .ipa — chỉ chạy trên macOS.
- Kiểm chứng runtime: giọng nói native, Local Notifications, WebAuthn
  passkey trong WKWebView, Google OAuth — tất cả phải test trên iPhone
  thật qua TestFlight (xem RISKS.md).
- Lệnh chạy trên Mac sau khi clone gói này về (xem BUILD-GUIDE.md mục 6):
  `npm ci && npx cap sync ios && npx cap open ios`.

## Cảnh báo duy nhất khi add ios

`@capacitor-community/speech-recognition does not have a Package.swift` —
plugin chỉ có `.podspec` (CocoaPods), Capacitor 8 build iOS bằng SPM nên
plugin này KHÔNG có trong `ios/App/CapApp-SPM/Package.swift`. Đây là rủi
ro lớn nhất của gói này — xem RISKS.md mục 4 để xử lý trước khi build.
