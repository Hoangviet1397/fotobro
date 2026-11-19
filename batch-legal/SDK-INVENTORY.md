# FotoBro iOS v1 — SDK Inventory (Danh sách SDK / thư viện bên thứ ba)

- **App:** FotoBro — `com.fotobro.app`, v1.0.0
- **Ngày lập danh sách:** 20/11/2026
- **Phạm vi:** chỉ bản iOS v1 trong thư mục `~/workspace/fotobro-ios-v1/` (base web FotoBro v2.6 tối giản, bọc Capacitor 8)
- **Nguồn đã đọc thật để lập bảng này:**
  `package.json`, `package-lock.json`, `capacitor.config.ts`,
  `ios/App/CapApp-SPM/Package.swift`, `ios/App/App/capacitor.config.json`,
  `ios/App/App/Info.plist`, `ios/App/App/AppDelegate.swift`,
  `www/index.html` (CSP + các lời gọi Google API), `www/capacitor-bridge.js`,
  `www/fotobro-config.js`, và thư mục `node_modules/@capacitor/*/package.json`.
- **Không có file `ios/App/Podfile`:** đúng với Capacitor 8 — native dùng Swift Package
  Manager (SPM), không dùng CocoaPods.

## Kết luận nhanh

Danh sách gần như trống ngoài Capacitor + plugin chính thức của Ionic, đúng như dự
kiến — **nhưng có 2 điểm lệch cần xử lý trước khi build/submit (xem §4):**

1. **Không có analytics, quảng cáo, crash reporting, Firebase, Facebook SDK,
   hay bất kỳ SDK bên thứ ba nào khác.** Đã grep toàn bộ `www/`, `package.json`,
   `capacitor.config.ts`, `Info.plist` — không có chuỗi `analytics / firebase /
   admob / crashlytics / sentry / amplitude / mixpanel`. Không có script CDN
   ngoài nào trong `www/index.html` (`<script src="http…">` = 0 kết quả; CSP
   `script-src 'self' 'unsafe-inline'`).
2. **Google KHÔNG dùng SDK.** Google chỉ được gọi qua `fetch()` HTTPS trực tiếp
   tới REST API (`*.googleapis.com`, `accounts.google.com`) từ code trong
   `www/index.html` — không có Google Sign-In SDK, không có Google API client
   library nào trong `package.json` hay `node_modules`.
3. **Phiên bản ĐÃ xác minh được hết** (trái với dự kiến ban đầu): `node_modules/`
   có sẵn trong repo làm việc nên đã đọc được phiên bản cài đặt thật của từng
   plugin, đối chiếu khớp với `package-lock.json`. Cột "Phiên bản" dưới đây ghi
   cả hai: khai báo trong `package.json` → cài đặt thật.
4. **Chưa có `PrivacyInfo.xcprivacy` ở cấp app** (`ios/App/App/` không có file
   này). Chỉ Capacitor core mới có manifest đi kèm (xem §3).

## 1. Bảng SDK bên thứ ba trong app

"Thu thập dữ liệu" ở đây nghĩa là SDK tự gửi dữ liệu ra khỏi máy tới máy chủ của
nhà cung cấp SDK. Dữ liệu app tự lưu trên máy (localStorage / IndexedDB) hoặc
dữ liệu người dùng chủ động gửi qua Google API thì ghi ở cột "Dữ liệu chạm tới".

| # | SDK / Thư viện | Phiên bản (khai báo → cài đặt) | Mục đích trong FotoBro v1 | Dữ liệu nó chạm tới | Tự thu thập / gửi đi không? | Privacy policy của SDK | Ghi chú Apple privacy manifest |
|---|---|---|---|---|---|---|---|
| 1 | **@capacitor/core** (Capacitor runtime, Ionic) | `^8.0.0` → **8.6.2** | Cầu nối JS ↔ native (WebView `capacitor://localhost`), nạp plugin | Mọi lời gọi plugin đi qua nó; không đọc thêm dữ liệu riêng | **Không** — chỉ chuyển tiếp lời gọi trong app | https://ionic.io/privacy (chính sách của Ionic/Drifty Co., chủ sở hữu Capacitor) | **Có sẵn** `node_modules/@capacitor/ios/Capacitor/Capacitor/PrivacyInfo.xcprivacy`: `NSPrivacyAccessedAPITypes` rỗng, `NSPrivacyCollectedDataTypes` rỗng, `NSPrivacyTracking = false` |
| 2 | **@capacitor/ios** (iOS platform shell, Ionic) | `^8.6.2` → **8.6.2** | Vỏ iOS: WKWebView, `AppDelegate`/`SceneDelegate`, Cordova compat | N/A (hạ tầng) | **Không** | https://ionic.io/privacy | **Có sẵn** `node_modules/@capacitor/ios/CapacitorCordova/CapacitorCordova/PrivacyInfo.xcprivacy`: nội dung tương tự core (rỗng, `NSPrivacyTracking = false`) |
| 3 | **@capacitor/app** | `^8.0.0` → **8.1.2** | Deep-link OAuth trở về app (`appUrlOpen`), `appStateChange` | URL deep-link trả về từ Google (chứa `code` + `state` OAuth) | **Không** — URL chỉ đi từ hệ thống → app, không gửi ra ngoài | https://ionic.io/privacy | Không có manifest riêng trong gói plugin. Dùng chung manifest của core (§3) |
| 4 | **@capacitor/browser** | `^8.0.0` → **8.0.5** | Mở trang đăng nhập Google bằng trình duyệt hệ thống (Google cấm OAuth trong WKWebView) | URL đăng nhập Google; người dùng nhập tài khoản Google trong Safari/ASWebAuthenticationSession | **Không** (plugin chỉ mở trình duyệt; Google xử lý đăng nhập theo chính sách của Google) | https://ionic.io/privacy (plugin) + https://policies.google.com/privacy (trang đăng nhập Google) | Không có manifest riêng. **LƯU Ý LIÊN KẾT: plugin này KHÔNG có trong `ios/App/CapApp-SPM/Package.swift` và không có trong `packageClassList` của `ios/App/App/capacitor.config.json` — xem §4.1** |
| 5 | **@capacitor/calendar** | `^1.0.1` → **1.0.1** | Đọc Lịch iPhone (nhập buổi chụp 30 ngày tới thành job) + ghi buổi chụp vào Lịch iPhone (nút "Thêm vào Lịch iPhone") qua EventKit | **Sự kiện lịch trên máy** (tiêu đề, thời gian buổi chụp) — chỉ khi người dùng bấm nhập/ghi | **Không** — đọc/ghi EventKit trên máy, không gửi lịch đi đâu | https://ionic.io/privacy | Không có manifest riêng. Cần `NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`, `NSCalendarsWriteOnlyAccessUsageDescription` — **đã có đủ trong `Info.plist`**. **LƯU Ý LIÊN KẾT: giống Browser, plugin này KHÔNG có trong `CapApp-SPM/Package.swift` và `packageClassList` — xem §4.1** |
| 6 | **@capacitor/camera** | `^8.0.0` → **8.2.6** | Chọn ảnh trang chủ từ thư viện ảnh (`source: PHOTOS`, trả `dataUrl` JPEG lưu IndexedDB `troLyXeoPhotos`, tối đa 60 ảnh) | **Ảnh người dùng chọn** (ảnh trang chủ) — chỉ ảnh do người dùng tự chọn | **Không** — ảnh ở lại trên máy | https://ionic.io/privacy | Không có manifest riêng. Cần `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription` — **đã có đủ trong `Info.plist`** |
| 7 | **@capacitor/haptics** | `^8.0.0` → **8.0.2** | Rung nhẹ khi bấm nút | Không chạm dữ liệu nào | **Không** | https://ionic.io/privacy | Không có manifest riêng; không dùng API thuộc diện required-reason của Apple |
| 8 | **@capacitor/local-notifications** | `^8.0.0` → **8.3.1** | Nhắc lịch chụp (trước 60 phút) + nhắc hạn giao ảnh (trước 24 giờ), chạy cả khi app đóng | Tên khách + loại job + giờ chụp/hạn giao (nội dung thông báo, tạo trên máy) | **Không** — thông báo local, không qua máy chủ đẩy (không APNs/FCM) | https://ionic.io/privacy | Không có manifest riêng |
| 9 | **@capacitor/preferences** | `^8.0.0` → **8.0.1** | Khai trong `package.json` nhưng **không dùng cho dữ liệu chính**: `capacitor-bridge.js` ghi rõ dữ liệu vẫn ở `localStorage` key `troLyXeo.v1` + IndexedDB, "KHÔNG chuyển sang Preferences plugin … tránh tách dữ liệu làm hai nơi"; grep `www/` không thấy chỗ nào gọi `Preferences` | Không chạm dữ liệu nào trong v1 (plugin chết — dead dependency) | **Không** | https://ionic.io/privacy | Không có manifest riêng. **Cân nhắc gỡ khỏi `package.json` ở v1.1** để danh sách SDK khai báo khớp với code thật. Nếu giữ lại và có dùng UserDefaults thì đó là API thuộc diện required-reason của Apple — xem §3 |
| 10 | **@capacitor/share** | `^8.0.0` → **8.0.3** | Share sheet iOS: chia sẻ báo cáo ngày / sao lưu JSON / link Drive của job | Nội dung người dùng chủ động bấm chia sẻ (báo cáo, file sao lưu) | **Không** — chỉ mở share sheet hệ thống; dữ liệu đi tới app người dùng tự chọn | https://ionic.io/privacy | Không có manifest riêng |
| 11 | **@capacitor/splash-screen** | `^8.0.0` → **8.0.2** | Màn hình chờ khởi động (nền trắng, 800 ms) | Không chạm dữ liệu nào | **Không** | https://ionic.io/privacy | Không có manifest riêng |
| 12 | **@capacitor/status-bar** | `^8.0.0` → **8.0.4** | Thanh trạng thái nền trắng, kiểu DEFAULT | Không chạm dữ liệu nào | **Không** | https://ionic.io/privacy | Không có manifest riêng |
| 13 | **Google APIs — gọi trực tiếp qua HTTPS, KHÔNG SDK** (Google LLC) | Không có SDK nên không có phiên bản SDK. Endpoint: `accounts.google.com/o/oauth2/v2/auth`, `oauth2.googleapis.com/token`, `oauth2.googleapis.com/revoke`, `www.googleapis.com/calendar/v3`, `gmail.googleapis.com/gmail/v1`, `people.googleapis.com/v1`, `www.googleapis.com/drive/v3` | Đăng nhập Google (OAuth 2.0 + PKCE, mở bằng `@capacitor/browser`); đọc Lịch Google, Gmail (tiền về, khách hỏi chụp), Danh bạ, Drive (chỉ đọc metadata); ghi sự kiện Lịch, gửi Gmail | **Dữ liệu Google của người dùng, chỉ khi họ bấm "Đăng nhập Google":** sự kiện lịch, email, danh bạ, tên file Drive; access token lưu ở `sessionStorage` key `troLyXeo.gtoken` (hết hạn theo `expires_in`, **cố tình KHÔNG lưu refresh token** — xem `www/index.html:3011`) | **Có — đây là điểm duy nhất dữ liệu rời khỏi máy:** dữ liệu trên được gửi tới máy chủ Google theo yêu cầu của người dùng, tuân theo chính sách của Google, không qua máy chủ FotoBro nào (không có backend) | https://policies.google.com/privacy | Không phải SDK nên không có manifest. Phạm vi OAuth xin: `calendar.readonly`, `calendar.events`, `gmail.readonly`, `gmail.send`, `contacts.readonly`, `drive.metadata.readonly` (`www/index.html:3199-3202, 3487-3488`). **Client ID chung hiện ĐỂ TRỐNG** (`www/fotobro-config.js`: `googleClientId: ''`) — chưa có thì nút Google báo chưa sẵn sàng, tính năng Google coi như tắt |

### Thư viện chỉ dùng lúc build (không có trong app binary, không chạm dữ liệu người dùng)

| SDK / Thư viện | Phiên bản (khai báo → cài đặt) | Mục đích | Ghi chú |
|---|---|---|---|
| **@capacitor/cli** | `^8.0.0` → **8.6.2** | Lệnh `npx cap sync/open ios`, sinh code native | Chạy trên máy dev. **Lưu ý:** Capacitor CLI có thu thập telemetry ẩn danh (timestamp, tên lệnh, phiên bản, OS — opt-out bằng `npx cap telemetry off`); đây là dữ liệu máy dev, không phải dữ liệu người dùng app. Nguồn: https://capacitorjs.com/docs/next/cli/telemetry |
| **typescript** | `^5.6.0` → **5.9.3** | Biên dịch `capacitor.config.ts` | Chỉ lúc build |

### Đã gỡ — không còn trong v1 (ghi để khỏi khai nhầm trong App Store Connect)

| SDK / Thư viện | Trạng thái |
|---|---|
| **@capacitor-community/speech-recognition 7.0.1** (giọng nói native) | **ĐÃ GỠ khỏi `package.json` ngày 20/11/2026** — plugin không có `Package.swift` (SPM) nên build Capacitor 8 gãy; toàn bộ code giọng nói native đã xoá khỏi `www/capacitor-bridge.js`; nút mic hiện báo "Giọng nói sẽ có ở bản v1.1". Không có trong `node_modules/`. **Không khai trong App Privacy.** |

### Khẳng định "không có" (đã kiểm chứng bằng grep, không phải đoán)

- **Không analytics:** không Google Analytics/Firebase Analytics/PostHog/Amplitude/Mixpanel.
- **Không quảng cáo:** không AdMob hay SDK quảng cáo nào.
- **Không crash reporting:** không Crashlytics/Sentry.
- **Không push từ xa:** chỉ Local Notifications; không APNs/FCM, không đăng ký push token.
- **Không Facebook SDK / SDK mạng xã hội:** link Facebook/Messenger/Instagram/Zalo trong app chỉ là deep link `https://…` mở bằng trình duyệt hệ thống, không phải SDK.
- **Không CloudKit trong v1:** `cloudKitContainer: 'iCloud.com.fotobro.app'` trong `www/fotobro-config.js` ở trạng thái not-configured (chờ tạo container), không có code CloudKit nào chạy.
- **Không có backend/máy chủ FotoBro:** `capacitor.config.ts` ghi rõ không dùng `server.url` ngoài; app chạy offline từ file trong `www/`.

## 2. Dữ liệu rời khỏi máy — tóm tắt cho App Privacy (App Store Connect)

| Loại dữ liệu | Đi đâu | Khi nào | Liên hệ danh tính? |
|---|---|---|---|
| Sự kiện Lịch Google, email Gmail, danh bạ Google, tên file Drive | Máy chủ Google (`*.googleapis.com`) | Chỉ khi người dùng đã đăng nhập Google và bấm đồng bộ/xem | Có — tài khoản Google của người dùng |
| Lịch iPhone (EventKit), ảnh thư viện, thông báo local | Ở lại trên máy | Khi người dùng dùng tính năng tương ứng | Không rời máy |
| Job, sổ tiền, ảnh trang chủ, logo studio | `localStorage` / IndexedDB trên máy | Luôn (dữ liệu chính của app) | Không rời máy |
| Access token Google | `sessionStorage` (xoá khi đóng phiên webview), không lưu refresh token | Khi đăng nhập Google | Token theo phiên |

**Tracking:** không có. Không SDK nào đặt `NSPrivacyTracking = true`; Capacitor
core khai `NSPrivacyTracking = false`; không có tracking domain nào trong manifest
của core. App không cần khai báo App Tracking Transparency (không xin `tracking`
permission) — miễn là không thêm SDK quảng cáo/analytics sau này.

## 3. Apple privacy manifest (`PrivacyInfo.xcprivacy`) — hiện trạng

- **Cấp app: CHƯA CÓ.** Không có file `PrivacyInfo.xcprivacy` trong `ios/App/App/`
  (chỉ có `Info.plist`, `AppDelegate.swift`, `SceneDelegate.swift`, `Assets.xcassets`).
- **Cấp SDK — chỉ Capacitor core có manifest đi kèm, nội dung "trống":**
  - `node_modules/@capacitor/ios/Capacitor/Capacitor/PrivacyInfo.xcprivacy` —
    `NSPrivacyAccessedAPITypes: []`, `NSPrivacyCollectedDataTypes: []`,
    `NSPrivacyTrackingDomains: []`, `NSPrivacyTracking: false`.
  - `node_modules/@capacitor/ios/CapacitorCordova/CapacitorCordova/PrivacyInfo.xcprivacy` —
    nội dung tương tự.
  - **Không plugin nào** (`app / browser / calendar / camera / haptics /
    local-notifications / preferences / share / splash-screen / status-bar`) có
    file `PrivacyInfo.xcprivacy` riêng trong gói npm của nó (đã `find` toàn bộ
    `node_modules/@capacitor/`).
- **Việc cần làm trước khi nộp App Store (chưa làm, xem §4.3):** tạo
  `ios/App/App/PrivacyInfo.xcprivacy` ở cấp app và rà soát xem app/plugin có dùng
  API thuộc danh mục "required reason" của Apple hay không — đáng ngờ nhất là
  **UserDefaults** (nếu `@capacitor/preferences` thực sự được dùng ở đâu đó, hoặc
  Capacitor core dùng) và các API file-system/disk-space. Vì các plugin chính
  thức không tự kèm manifest khai báo, trách nhiệm khai báo dồn về manifest cấp
  app. **Không tự bịa danh sách API — phải kiểm chứng bằng cách build trên Xcode
  và/hoặc chạy `xcrun` kiểm tra, hoặc đối chiếu tài liệu từng plugin trước khi
  ghi manifest.**

## 4. Vấn đề còn tồn tại (phát hiện khi đọc file thật)

### 4.1. Hai plugin có trong `package.json` nhưng KHÔNG được liên kết trong project iOS

- `@capacitor/browser` (8.0.5) và `@capacitor/calendar` (1.0.1) đều có trong
  `package.json` + `package-lock.json` + `node_modules/`, và code có gọi thật:
  `capacitor-bridge.js` dùng `P.App`/`P.Calendar`, `www/index.html` dùng
  `window.Capacitor.Plugins.Calendar` (nhập Lịch iPhone) và `gConnect()` mở
  OAuth bằng Browser.
- Nhưng **cả hai đều vắng mặt** trong:
  - `ios/App/CapApp-SPM/Package.swift` — `dependencies` chỉ có `capacitor-swift-pm`
    8.6.2 + App, Camera, Haptics, LocalNotifications, Preferences, Share,
    SplashScreen, StatusBar (không có Browser, không có Calendar);
  - `ios/App/App/capacitor.config.json` — `packageClassList` chỉ có
    `SpeechRecognition` (plugin đã gỡ!), AppPlugin, CAPCameraPlugin,
    HapticsPlugin, LocalNotificationsPlugin, PreferencesPlugin, SharePlugin,
    SplashScreenPlugin, StatusBarPlugin (không có Browser, không có Calendar).
- Hệ quả: cho tới khi chạy lại `npx cap sync ios`, **nhập Lịch iPhone native và
  đăng nhập Google qua Browser có nguy cơ không chạy được trên bản build hiện
  tại** (plugin không được biên dịch/link vào app). Đây là việc của bước build,
  không sửa trong file này.

### 4.2. File cấu hình iOS đã sinh (`capacitor.config.json`) bị cũ so với `capacitor.config.ts`

- `backgroundColor`: `#FBF5EA` (file đã sinh) vs `#FFFFFF` (config.ts mới, UI Apple Music).
- `StatusBar.style`: `LIGHT` (đã sinh) vs `DEFAULT` (config.ts).
- `packageClassList` còn liệt kê `SpeechRecognition` — plugin đã gỡ ngày 20/11/2026.
- Cả ba lệch đều hết khi chạy lại `npx cap sync ios`.

### 4.3. Chưa có privacy manifest cấp app (xem §3)

- Chưa tạo `ios/App/App/PrivacyInfo.xcprivacy`; chưa rà soát required-reason API.

### 4.4. Google chưa sẵn sàng dùng thật

- `googleClientId: ''` (placeholder) trong `www/fotobro-config.js`; scheme redirect
  trong `Info.plist` vẫn là placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID`
  (theo ghi chú trong `fotobro-config.js`); `supportEmail: ''`; CloudKit
  not-configured. Các mục này thuộc GOOGLE-SETUP.md / EMAIL-SETUP.md, không thuộc
  phạm vi file này — nhưng chúng quyết định hàng 13 trong bảng có "bật" được không.

## 5. Cách cập nhật file này

- Chạy lại inventory này sau mỗi lần: `npx cap sync ios`, thêm/bớt plugin, thêm
  SDK (đặc biệt analytics/quảng cáo/push), hoặc đổi cách gọi Google API.
- Nguồn chân lý về phiên bản là `node_modules/*/package.json` + `package-lock.json`
  (phiên bản cài đặt thật), đối chiếu với `package.json` (khoảng phiên bản khai báo).
- Khi thêm SDK mới: ghi đủ 7 cột trong bảng §1 (tên, phiên bản, mục đích, dữ liệu
  chạm tới, có thu thập không, link privacy policy, ghi chú manifest) và cập nhật
  §2 nếu SDK làm dữ liệu rời khỏi máy.
