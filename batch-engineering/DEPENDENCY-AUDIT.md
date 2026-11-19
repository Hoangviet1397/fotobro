# DEPENDENCY AUDIT — FotoBro iOS v1 (Capacitor 8)

- **Phạm vi:** `package.json` trong `~/workspace/fotobro-ios-v1/` (app `com.fotobro.app`, v1.0.0).
- **Ngày kiểm chứng:** 2026-11-20 (giờ VN). Nguồn phiên bản mới nhất: npm registry (`npm view <pkg> version`, ngày 2026-11-20). Phiên bản đã cài: `package-lock.json` + `node_modules/` trên máy này.
- **Kết luận nhanh:** Toàn bộ plugin chính thức đang ở bản mới nhất, tương thích Capacitor 8, đều có `Package.swift` (SPM). Có **01 phát hiện cần sửa trước khi build**: `CapApp-SPM/Package.swift` (file do CLI sinh) đang thiếu `@capacitor/browser` và `@capacitor/calendar`. Plugin giọng nói `@capacitor-community/speech-recognition` **không** dùng được ở v1 — đã kiểm chứng tarball, đúng như quyết định dời mic sang v1.1.

## 1. Bảng rà soát (từng plugin)

| Plugin | Khai báo trong `package.json` | Đã cài (lockfile) | Mới nhất (npm, 2026-11-20) | Tương thích Cap 8 | `Package.swift` | Ghi chú |
|---|---|---|---|---|---|---|
| `@capacitor/core` | `^8.0.0` | 8.6.2 | **8.6.2** | ✅ (gốc) | — (runtime, qua `capacitor-swift-pm` 8.6.2) | Đã ở mới nhất |
| `@capacitor/ios` | `^8.6.2` | 8.6.2 | **8.6.2** | ✅ | — (runtime) | Đã ở mới nhất; peer core `^8.6.0` |
| `@capacitor/cli` (dev) | `^8.0.0` | 8.6.2 | **8.6.2** | ✅ | — (tooling) | Đã ở mới nhất |
| `@capacitor/app` | `^8.0.0` | 8.1.2 | **8.1.2** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/browser` | `^8.0.0` | 8.0.5 | **8.0.5** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất — ⚠️ **vắng mặt trong `CapApp-SPM/Package.swift` (xem §2.1)** |
| `@capacitor/calendar` | `^1.0.1` | 1.0.1 | **1.0.1** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất — ⚠️ **vắng mặt trong `CapApp-SPM/Package.swift` (xem §2.1)**; plugin chính thức còn non (v1.x, xem §2.2) |
| `@capacitor/camera` | `^8.0.0` | 8.2.6 | **8.2.6** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/haptics` | `^8.0.0` | 8.0.2 | **8.0.2** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/local-notifications` | `^8.0.0` | 8.3.1 | **8.3.1** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất; `smallIcon` trong `capacitor.config.ts` chỉ có tác dụng Android, vô hại trên iOS |
| `@capacitor/preferences` | `^8.0.0` | 8.0.1 | **8.0.1** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/share` | `^8.0.0` | 8.0.3 | **8.0.3** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/splash-screen` | `^8.0.0` | 8.0.2 | **8.0.2** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `@capacitor/status-bar` | `^8.0.0` | 8.0.4 | **8.0.4** | ✅ (`peer core >=8.0.0`) | ✅ | Đã ở mới nhất |
| `typescript` (dev) | `^5.6.0` | 5.9.3 | **7.0.2** | — (không phải plugin Cap) | — | ⚠️ **Không nâng lên 7.x** (xem §2.3). 5.9.3 là mới nhất của dòng 5.x; range `^5.6.0` đã chặn đúng 7.x |

Không có dependency nào khác. Không có plugin cộng đồng nào đang được cài (`node_modules/@capacitor-community/` không tồn tại).

## 2. Rủi ro & phát hiện

### 2.1 🔴 Cần sửa trước build: `CapApp-SPM/Package.swift` thiếu Browser + Calendar

- Dự án iOS dùng **Swift Package Manager**: có `ios/App/CapApp-SPM/Package.swift`, **không có `Podfile`**. Đây là dạng mặc định của Capacitor 8.
- File `CapApp-SPM/Package.swift` (do CLI sinh) hiện chỉ liệt kê 8 plugin: App, Camera, Haptics, LocalNotifications, Preferences, Share, SplashScreen, StatusBar.
- **Thiếu `@capacitor/browser` và `@capacitor/calendar`**, dù cả hai đều đã cài, đều có `Package.swift` và thư mục `ios/` native trong `node_modules/` (đã kiểm tra trực tiếp).
- Khả năng cao: file này được sinh ra trước khi hai plugin trên được thêm vào, và `npx cap sync ios` chưa chạy lại sau đó. (Thư mục này không phải git repo nên không đối chiếu được lịch sử commit.)
- **Hậu quả nếu không sửa:** gọi `Browser.open()` hoặc `Calendar.*` trên máy thật sẽ lỗi runtime `plugin is not implemented` — đúng hai tính năng lõi của v1 (mở link ngoài, nhập Lịch iPhone 1 chạm).
- **Cách sửa (trên máy build):** chạy `npx cap sync ios` rồi mở `ios/App/CapApp-SPM/Package.swift` kiểm tra `CapacitorBrowser` và `CapacitorCalendar` đã xuất hiện trong `dependencies` và `targets`. Không sửa file sinh này bằng tay.

### 2.2 🟡 `@capacitor/calendar` 1.0.1 — plugin chính thức còn non

- Đây là plugin chính thức mới (dòng 1.x đầu tiên); API có thể đổi ở các bản minor 1.x. Range `^1.0.1` cho phép trôi lên 1.x mới — nên cân nhắc ghim `~1.0.1` để bản build TestFlight không đổi API bất ngờ.
- Mặt tích cực: `Info.plist` đã có đủ 3 key EventKit (`NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`, `NSCalendarsWriteOnlyAccessUsageDescription`) và 3 key ảnh/máy ảnh (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`) — đúng yêu cầu iOS 17+ (full access / write-only riêng biệt).
- Chưa có key micro/speech nào — nhất quán với việc mic dời v1.1 (không xin quyền thừa).

### 2.3 🟡 TypeScript 7.0.2 là bản mới nhất nhưng KHÔNG được nâng

- `typescript@7.0.2` là dòng viết lại native (TypeScript Native Preview), khác hẳn 5.x, nhiều breaking change. Range `^5.6.0` hiện tại đã chặn đúng. Giữ 5.9.3 cho v1; việc lên TS 7 (nếu có) là quyết định riêng, không làm trong v1.

### 2.4 🔴 `@capacitor-community/speech-recognition` — xác nhận KHÔNG dùng được ở v1 (mic dời v1.1)

- Plugin **chưa được cài** (không có trong `package.json`, không có trong `node_modules`).
- Phiên bản mới nhất trên npm: **7.0.1** (các bản: 5.0.0 → 6.0.1 → 7.0.0 → 7.0.1). Peer dependency `>=7.0.0` với `@capacitor/core` nên về lý thuyết chạy được với core 8 — **nhưng đó không phải là rào cản thật**.
- **Đã kiểm chứng trực tiếp tarball `7.0.1` từ npm:** trong gói chỉ có `CapacitorCommunitySpeechRecognition.podspec` + `ios/Plugin/Plugin.swift`, `Plugin.m`, `Plugin.h`, `Info.plist` — **không có `Package.swift` ở root, không có thư mục `ios/Sources/`**.
- Vì dự án FotoBro dùng SPM (không CocoaPods, §2.1), CLI sẽ bỏ qua plugin này khi sync và cảnh báo `Some installed Capacitor plugins are not compatible with SPM`; lúc chạy sẽ lỗi `plugin is not implemented`. Thêm nữa, plugin còn dùng cầu Obj-C (`Plugin.m`/`Plugin.h`) — SPM không trộn Obj-C + Swift trong một target nên không thể tự chuyển đổi.
- **Kết luận:** quyết định dời mic sang v1.1 là đúng. Hướng xử lý ở v1.1 (tối đa 2 lần thử sửa plugin theo chỉ đạo, không được thì dời tiếp):
  1. Fork plugin, thêm `Package.swift` + chuyển sang `CAPBridgedPlugin` + dời code vào `ios/Sources/` (theo hướng dẫn migrate plugin sang SPM của Capacitor/Capawesome); hoặc
  2. Viết plugin giọng nói riêng dùng `SFSpeechRecognizer` native; hoặc
  3. Bỏ mic native, chỉ giữ nhập tay (Web Speech API không chạy đáng tin trên WKWebView iOS nên không phải phương án dự phòng tốt).
- Lưu ý thời gian: CocoaPods trunk chuyển sang chỉ-đọc từ **02/12/2026** — đường vòng "quay lại CocoaPods để dùng plugin này" sẽ chết sau ngày đó; v1.1 bắt buộc phải đi hướng SPM.

### 2.5 🟢 Các rủi ro đã kiểm tra và KHÔNG còn tồn tại

- **Trôi phiên bản khi cài mới:** các range `^8.0.0` cho phép trôi trong 8.x, nhưng `package-lock.json` đã ghim đúng bản mới nhất (8.6.2/8.1.2/…) và đã commit kèm — build lại từ lockfile sẽ tái lập đúng bộ này. Chỉ cần giữ lockfile đi kèm repo, không xóa.
- **Yêu cầu build Capacitor 8:** Node 22+, Xcode 26, iOS 15+ (deployment target trong `CapApp-SPM` là iOS 15). Node trên máy kiểm tra là v24.22.1 — đạt. Build vẫn phải qua GitHub Actions macOS runner (MacBook 2017 của Việt tối đa Ventura/Xcode 15.x, không build được Xcode 26) — đúng kế hoạch hiện tại.
- **Không có plugin Cordova / dependency lạ** trong `package.json`.

## 3. Hành động đề xuất (theo thứ tự)

1. **Trước build TestFlight:** chạy `npx cap sync ios` trên máy build, xác nhận `CapacitorBrowser` + `CapacitorCalendar` có trong `CapApp-SPM/Package.swift` (§2.1). Nếu sau sync vẫn thiếu, dừng build và điều tra — không build mù.
2. **Tùy chọn, nên làm:** ghim `@capacitor/calendar` thành `~1.0.1` trong `package.json` (§2.2).
3. **Không làm trong v1:** không cài `speech-recognition`, không nâng TypeScript lên 7.x, không quay lại CocoaPods.
4. **v1.1 (mic):** thử tối đa 2 lần hướng fork/SPM ở §2.4; không được thì dời tiếp và giữ nhập tay.

## 4. Phương pháp kiểm chứng

- `npm view <pkg> version` + `peerDependencies` cho từng package (14 package, ngày 2026-11-20).
- Đối chiếu phiên bản đã cài qua `package-lock.json` và `node_modules/<pkg>/package.json`.
- Kiểm tra `Package.swift` trong từng thư mục plugin đã cài (`node_modules/@capacitor/*/`).
- Tải tarball `@capacitor-community/speech-recognition@7.0.1` về `/tmp`, liệt kê nội dung, xác nhận không có `Package.swift` (đã xóa thư mục tạm sau khi kiểm tra).
- Đọc `ios/App/CapApp-SPM/Package.swift` và xác nhận không có `Podfile`; đọc `Info.plist` kiểm tra usage-description keys.
- Xác nhận quy tắc SPM của Capacitor 8 qua tài liệu Capawesome / Capacitor 8 upgrade notes (SPM là mặc định cho project iOS mới; không trộn SPM + CocoaPods; plugin thiếu `Package.swift` sẽ bị bỏ qua khi sync).
