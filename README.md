# FotoBro iOS v2.0 — gói chuẩn bị local (chưa push)

> Cập nhật 20/11/2026 — **FotoBro iOS v2.0** (base web FotoBro v2.6 đã kiểm
> chứng 103/103, tối giản + Google auto + Lịch iPhone native + 4 cá nhân
> hoá + 4 cải tiến pipeline + UI Apple Music). Test v2.0: **120/120**
> (xem "Kiểm chứng"). Google TẮT ở bản TestFlight v2.0 (chưa có Client ID). Gói này nằm ở
> `~/workspace/fotobro-ios-v1/` — **không push lên GitHub trong nhiệm vụ
> này**, chỉ chuẩn bị sẵn để đẩy lên repo `Hoangviet1397/fotobro`
> (public, nhánh `main`, hiện chỉ có README) khi Việt duyệt.
>
> Hướng build: **Capacitor 8 + GitHub Actions (macOS runner, Xcode 26)**
> vì Việt dùng Windows + iPhone, không có Mac.

## Có gì trong gói

| File / thư mục | Để làm gì | Trạng thái |
|---|---|---|
| `package.json` + `package-lock.json` | Project Capacitor 8.6.2, version **2.0.0**, 10 plugin (`@capacitor/calendar` 1.0.1 + `@capacitor/browser` mới; đã gỡ `@capacitor-community/speech-recognition`) | ✅ xong, `npm install` lại trên Linux 20/11 |
| `capacitor.config.ts` | appId `com.fotobro.app`, tên `FotoBro`, webDir `www`, nền/splash/status bar **trắng #FFFFFF** (đổi từ kem vintage #FBF5EA), StatusBar `DEFAULT` | ✅ xong |
| `www/index.html` | **FotoBro v2.0** (~343 KB): tối giản (bỏ E.L.F./Super Junior, ảnh + job mẫu), Google auto 1 chạm (PKCE, trình duyệt hệ thống, redirect reversed client ID), Lịch iPhone native 1 chạm, 4 cá nhân hoá (màu/logo/mẫu tin/ngôn ngữ+tiền tệ), 4 cải tiến pipeline (nhảy bước, tiền gắn bước, Huỷ/khôi phục, job kẹt), UI Apple Music (trắng sạch + dark mode đen, 1 màu nhấn đỏ #FA2D48), nhắc chụp 12 tiếng + sheet giải thích quyền Thông báo, Haptics qua 1 cổng chung | ✅ xong, test jsdom **120/120** |
| `www/fotobro-config.js` | Cấu hình dùng chung, 1 file: `googleClientId: ''` (**placeholder trống** — chờ Việt tạo Client ID chung), `cloudKitContainer: 'iCloud.com.fotobro.app'` (not-configured), `supportEmail: ''` | ✅ xong, không có secret thật |
| `www/capacitor-bridge.js` | OAuth deep-link (`appUrlOpen` → event `fotobro-oauth`), nhắc lịch local **12 tiếng trước giờ chụp** (đổi từ 60 phút cho khớp NOTIFICATIONS.md), rung chạm, Share sheet, chọn ảnh thư viện, kiểm tra plugin Lịch | ✅ viết lại 20/11 (đã gỡ hết code giọng nói native — mic dời v2.1) |
| `test-fotobro-v2.js` (repo root) | Test jsdom theo spec v2.0: 103 ca gốc (APP_VERSION '2.0', 0 job mẫu) + 17 ca mới §13 (nhảy bước, form cọc 6.000.000, xong-thiếu-tiền, huỷ/khôi phục, sổ trống) — đã dời ra khỏi `www/` để không vào gói build | ✅ **120/120** |
| `ios/` | Xcode project (`npx cap add ios` trên Linux), Bundle ID `com.fotobro.app`, iOS 15.0, MARKETING_VERSION **2.0**, signing thống nhất **Manual** (Release: iPhone Distribution + profile "FotoBro App Store"), `PrivacyInfo.xcprivacy` đã thêm vào target | ✅ xong (build .ipa cần macOS runner) |
| `ios/App/App/Info.plist` | Usage descriptions: Lịch iPhone (đọc/ghi/viết), thư viện ảnh, máy ảnh, **Face ID** (mở khoá app); **đã gỡ** micro + nhận dạng giọng nói (mic v2.1); `CFBundleURLTypes` cho scheme `com.fotobro.app` + chỗ chờ reversed client ID Google | ✅ xong, parse được (26 keys) |
| `ios/App/App/public/` | Đã đồng bộ lại bằng `npx cap sync ios` trên Linux 20/11 → khớp `www/` bản **v2.0** (md5 `index.html` khớp, "Trợ lý Xèo" = 0, không còn file test trong gói) | ✅ xong |
| `AppIcon-1024.png` | Icon App Store 1024×1024, RGB, không alpha (đã kiểm chứng) — **lưu ý: vẫn là icon sen + ống kính cũ**, chưa có logo FotoBro mới | ⚠️ dùng tạm, đổi logo thì render lại trước build cuối |
| `assets/icon.png`, `assets/splash.png` | Nguồn `@capacitor/assets` tạo icon/splash trong `ios/` | ✅ xong |
| `PRIVACY.md` | Chính sách riêng tư (VI + tóm tắt EN) làm Privacy Policy URL | ✅ bản nháp — **chưa host, chưa có URL thật** |
| `APP-STORE-LISTING.md` | Tên, subtitle **17/30 ký tự**, mô tả VI/EN, keywords **100/100**, category Business + Photo & Video, 4+, screenshots | ✅ bản nháp chờ duyệt |
| `BUILD-GUIDE.md` | Build .ipa qua GitHub Actions + từng bước Việt làm trên Apple Developer / App Store Connect + bảng 6 secrets | ✅ xong |
| `.github/workflows/ios-build.yml` | Workflow: **macos-15 + Xcode 26.3** (Apple từ chối Xcode dưới 26 từ 28/04/2026), 16 steps: kiểm tra 6 secret đầu tiên, xác minh Xcode 26, test jsdom, `cap sync`, tự tăng build number (run_number), signing Manual, tên profile theo secret `IOS_PROVISIONING_PROFILE_NAME`, archive `FotoBro.xcarchive`, artifact `FotoBro-ipa` → TestFlight | ✅ mẫu — **chưa từng chạy** |
| `IOS-SETUP-NOTE.md` | Ghi chú `cap add ios` / `cap sync ios` trên Linux + phiên bản đã cài | ✅ xong |
| `RISKS.md` | Rủi ro đã thấy (Google, mic v2.1, passkey, chuyển dữ liệu, Guideline 4.2/4.8, Xcode 27 từ 04/2027) + checklist TestFlight | ✅ xong |
| `GOOGLE-SETUP.md` | Hướng dẫn tạo project + 2 OAuth client + xác minh Google (1 lần) | ✅ xong |
| `PUSH-READY.md`, `QA-REPORT.md`, `APP-STORE-READY.md` | Checklist đẩy repo / QA độc lập / rà App Store (20/11) | ✅ tham khảo |

## Tính năng v2.0 — có / chưa có

**Có ở v1:** Hôm nay, thêm job, pipeline 8 bước (nhảy thẳng tới bước bất
kỳ, tiền gắn bước, Huỷ/khôi phục, job kẹt tự báo), sổ tiền + báo cáo,
nhắc lịch local, mẫu tin nhắn/email (sửa được + khôi phục gốc), máy tính
giá + bảng giá digital/film, khoá Face ID/PIN, nhập Lịch iPhone native
1 chạm, đăng nhập Google auto 1 chạm (khi đã có Client ID chung),
xuất lịch "Thêm vào Lịch iPhone", cá nhân hoá (3 màu chủ đề, logo
studio, VI/EN, VND/USD chỉ đổi hiển thị), sao lưu JSON.
**Chưa có ở v2.0:** giọng nói (mic → **v2.1**), đồng bộ CloudKit (chỉ
placeholder `not-configured`), thu phí IAP (chỉ placeholder, không bật),
nhập lịch bằng file (đã **bỏ hẳn** 20/11 — chỉ còn Lịch iPhone native +
Google), checklist theo bước, Kanban kéo thả.

## Cái nào xong thật, cái nào chưa kiểm chứng được trên Linux

**Xong thật (đã chạy lệnh / đo / đọc code, 20/11/2026):**
- `node --check` cho 13/13 script inline trong `www/index.html` +
  `fotobro-config.js` + `capacitor-bridge.js` — đều pass.
- Test jsdom `test-fotobro-v2.js` (repo root): **120/120 đạt** (103 ca gốc
  theo spec v2.0 + 17 ca mới §13 — xem "Kiểm chứng" dưới).
- Grep `www/index.html` = 0 cho: `E.L.F.`, `Super Junior`, `Pearl
  Sapphire`, `xeonong`, `Sadako`, `parseICS`, `unzipIcs`, `Chọn file
  lịch`, `.zip`, `gClientId`, `sampleNote`; 0 ảnh mẫu base64.
- `npm install` (109 packages) + `npx cap sync ios` chạy được trên
  Linux; `ios/App/App/public/index.html` khớp `www/index.html`.
- Workflow YAML parse được: `macos-15`, Xcode `26.3`, 16 steps (kiểm tra
  secret, xác minh Xcode 26, test jsdom, tăng build number, signing Manual).
- `Info.plist` parse được (plistlib), đủ quyền Lịch + URL schemes.
- `package.json` version 2.0.0; lockfile name `fotobro`; có
  `@capacitor/calendar` 1.0.1 + `@capacitor/browser`; không còn
  speech-recognition.

**Chưa kiểm chứng được trên Linux — phải test trên iPhone thật qua TestFlight:**
- Build `.ipa` (cần macOS runner / Xcode 26 — workflow chưa từng chạy).
- Đăng nhập Google thật (cần Client ID chung + redirect reversed
  client ID + scheme trong Info.plist — chưa có Client ID thật).
- Nhập Lịch iPhone native, Local Notifications, Face ID/passkey trong
  WKWebView, chọn ảnh, Share sheet, Haptics.
- Nhập JSON sao lưu trong app native (đường AirDrop → Files → nhập).
- Dark mode + light mode trên màn hình thật (đã đổi CSS theo 2 chế độ
  nhưng chưa xem bằng mắt trên iPhone).

**Còn thiếu (cần làm trước khi submit):**
1. Client ID Google chung (1 lần, xem GOOGLE-SETUP.md) + đăng ký
   scheme reversed client ID trong Info.plist + xác minh Google.
   → Google TẮT ở bản TestFlight v2.0: trong app đã ghi rõ "Google chưa
   sẵn sàng ở bản v2.0", không khai thu thập dữ liệu Google ở bản này.
2. App ID `com.fotobro.app` + CloudKit container `iCloud.com.fotobro.app`
   + app trong App Store Connect (SKU `fotobro-001`) + API key "FotoBro CI"
   — **Việt đã tự tạo xong 00:26–00:37 20/11** (Team ID A64C927S45). ⚠️ Key
   đầu `857QQB9JSB` đã bị thu hồi, key mới là **`Q522F2AD5V`** (Issuer ID
   không đổi); file `.p8` mới `AuthKey_Q522F2AD5V.p8` chưa tải xong — đang
   chờ Việt bấm tải + sao lưu. Còn thiếu: **Distribution certificate +
   provisioning profile** (chưa tạo).
3. Dán 6 secrets GitHub Actions vào repo `fotobro` (BUILD-GUIDE.md §5)
   + secret tuỳ chọn thứ 7 `IOS_PROVISIONING_PROFILE_NAME` (mặc định
   "FotoBro App Store").
4. Host PRIVACY.md để có Privacy Policy URL thật
   (`https://hoangviet1397.github.io/fotobro/PRIVACY.html`).
5. Screenshots 6.7" + 6.5" — chỉ chụp được khi có bản TestFlight.
6. Logo FotoBro mới (nếu Việt chốt đổi — icon hiện vẫn là sen + ống
   kính cũ; đổi thì render lại AppIcon + splash trước build cuối).

## Việc cần Việt chốt (đã chốt phần lớn)

1. **Bundle ID — ĐÃ CHỐT: `com.fotobro.app`** (đổi sau khi tạo App ID
   là không được).
2. **Google — ĐÃ CHỐT: auto 1 chạm, BẬT ở v2.0** (23:52 19/11) — nhưng chỉ
   bật thật khi Client ID chung + xác minh Google xong. **Ở bản TestFlight
   v2.0 Google đang TẮT** (chưa có Client ID): trong app + PRIVACY đã ghi
   rõ, không khai thu thập dữ liệu Google ở bản này (xem RISKS.md §1).
3. **Giọng nói — ĐÃ CHỐT: mic dời sang v2.1** (20/11 — plugin
   speech-recognition không có Package.swift, đã gỡ khỏi package.json;
   nút mic hiện báo "Giọng nói sẽ có ở bản v1.1").
4. **Nhập lịch file — ĐÃ CHỐT: bỏ hẳn** (00:06 20/11 — chỉ còn Lịch
   iPhone native + Google).
5. **CloudKit — ĐÃ CHỐT: làm chính cho Nấc 2; thu phí Nấc 2/3, Nấc 1
   miễn phí** (23:43 19/11) — v2.0 chỉ placeholder, chưa chốt giá/chu kỳ.
6. **App Store listing** — Việt duyệt mô tả VI/EN, keywords 100/100,
   subtitle 17 ký tự trong APP-STORE-LISTING.md; category phụ giữ
   **Photo & Video** (đề xuất) hay đổi **Productivity**; Support URL tạm
   là link GitHub repo `fotobro`.

## Bước tiếp theo sau khi Việt duyệt

1. Đẩy gói này làm repo root của `Hoangviet1397/fotobro` (cần phê duyệt
   push riêng — không tự đẩy trong nhiệm vụ này; xem PUSH-READY.md §3),
   bật GitHub Pages (main/root) để host `PRIVACY.html`.
2. Việt làm cert/profile (App ID + app + API key đã xong 20/11) +
   6 secrets (BUILD-GUIDE.md §1–§5).
3. Chạy workflow → TestFlight → Xèo (người dùng đầu tiên) thử theo
   checklist RISKS.md §10 → sửa lỗi → Submit for Review.
