# QA Report — FotoBro iOS v1 (kiểm chứng độc lập)

- **Thời điểm kiểm tra:** 00:03–00:04 ngày 20/11/2026 (+07), tức 17:03–17:04 UTC 19/11/2026.
- **Phạm vi:** chỉ đọc code trong `~/workspace/fotobro-ios-v1/`, không sửa file nào. File kiểm chứng duy nhất được viết là file này.
- **Trạng thái lúc kiểm tra:** `www/index.html` ổn định ở 343.363 byte, mtime 17:03 UTC trong cả hai lần kiểm (lần 1 lúc 17:03, kiểm lại lúc 17:04 — kết quả giống hệt). Agent chính vẫn có thể đang sửa các file khác, nên báo cáo này là **ảnh chụp lúc 17:04 UTC, không phải kết luận cuối cùng cho bản hoàn thiện**.

## 1. Mục tiêu

Kiểm chứng độc lập bản iOS v1 trong `~/workspace/fotobro-ios-v1/` (base web FotoBro v2.6, Capacitor 8, Bundle ID `com.fotobro.app`): cú pháp script, test jsdom, đã bỏ hết cá nhân hoá của Xèo chưa, Bundle ID / config / workflow có đúng không, và các tính năng mới (Google auto, Lịch iPhone native, cá nhân hoá, pipeline, UI Apple Music) có thật trong code hay chỉ là stub.

## 2. Đã thực hiện

- Trích 13 script inline trong `www/index.html` ra file tạm trong `/tmp` (`/tmp/qa-inline-*.js`, `/tmp/qa2-inline-*.js`) và chạy `node --check` từng script, 2 lần.
- Chạy `NODE_PATH=/tmp/film-verify/node_modules node --test test-fotobro-v1.js` trong `www/`, 2 lần.
- Grep: E.L.F. / Super Junior / Pearl Sapphire / xeonong / Sadako / Xèo, `gClientId`, Client ID, Google Cloud, `data:image`, `troLyXeo`, `importFromNativeCalendar`, `isNativeCalendar`, pipeline (`setStage` / `jump` / `cancelled` / `stuck`), cá nhân hoá (`theme` / `logo` / `locale` / `currency`), UI (`prefers-color-scheme` / `backdrop-filter`).
- Đọc `package.json`, `capacitor.config.ts`, `ios/App/App/capacitor.config.json`, `ios/App/App/Info.plist`, `ios/App/App.xcodeproj/project.pbxproj` (Bundle ID + version), `.github/workflows/ios-build.yml` (parse YAML bằng Python).

## 3. Kết quả kiểm tra

### Đạt

| Hạng mục | Kết quả |
|---|---|
| Cú pháp script | **13/13 script inline pass `node --check`**, cả 2 lần kiểm |
| Test jsdom | **101/103 đạt** (xem 2 lỗi dưới — đều là test lỗi thời, không phải app hỏng) |
| Bỏ E.L.F. / Xèo | **0** lần: E.L.F., Super Junior, Pearl Sapphire, xeonong, Sadako, Xèo, “Trợ lý Xèo”, `tro-ly-xeo` |
| Ảnh mẫu base64 | **0** — `data:image` duy nhất còn lại là 1 icon SVG nhỏ (`data:image/svg+xml`, viewBox 10×16), không phải ảnh mẫu |
| Bundle ID | Đúng `com.fotobro.app` ở `capacitor.config.ts`, `ios/App/App/capacitor.config.json`, `project.pbxproj` (2 chỗ), workflow (`bundle-id` + ExportOptions). `MARKETING_VERSION = 1.0` |
| Workflow YAML | Parse được |
| Google auto | Không còn ô nhập Client ID (`gClientId` = 0). `www/fotobro-config.js` có `window.FOTOBRO_CONFIG` với `googleClientId: ''` (placeholder trống, đúng brief), `googleRedirectScheme: 'com.fotobro.app'`, `cloudKitContainer: 'iCloud.com.fotobro.app'`, `supportEmail: ''`. Nút “Đăng nhập Google” có 6 lần nhắc trong code, báo “chưa sẵn sàng” khi chưa có Client ID |
| Storage key cũ | `troLyXeo` còn 25 lần — là key `troLyXeo.v1` / `troLyXeoPhotos` giữ lại có chủ đích để dữ liệu cũ của Xèo không mất (test cũng pass “storage key giữ troLyXeo.v1”). Không phải lỗi |
| Pipeline (code) | Có code: `setStage` 6, `jump` 10, `cancelled` 31, `stuck` 4, nhắc “còn thiếu” tiền khi job ở bước chưa xong. Không còn hàm tên `jumpStage` — dùng `setStage`, nên grep tên cũ sẽ ra 0, đừng kết luận là chưa làm |
| Cá nhân hoá (code) | Có code: `theme` 19, `logo` 29 (`studioLogo` 2), `locale` 9, `currency` 7, VND 5, USD 8 |
| UI tối giản (code) | `prefers-color-scheme` 12, `dark` 17, `backdrop-filter` 22, `blur(` 21, `font-size:34` 1 (cỡ Large Title) |

### 2 lỗi test — test lỗi thời, không phải app hỏng

1. `APP_VERSION 2.6 — got="1.0" want="2.6"`: app đã đổi `APP_VERSION = '1.0'` (đánh số iOS v1), nhưng `test-fotobro-v1.js` dòng 47 vẫn expect `'2.6'` (copy từ test v2.6). Cần sửa test theo spec v1, hoặc quyết lại số version.
2. `mẫu có 5 job — got=0 want=5`: test dòng 128 vẫn expect 5 job mẫu, nhưng app đã bỏ job mẫu theo đúng yêu cầu (mặc định `jobs: []`). Cần sửa test expect 0 job mẫu.

## 4. Vấn đề còn tồn tại

### Chặn build / chặn submit

1. **Workflow ghim Xcode 16.4 trên `macos-15`** (`.github/workflows/ios-build.yml` dòng 29–31: `xcode-version: '16.4'`). Theo ghi nhớ đã lưu, từ 28/04/2026 App Store Connect từ chối app build bằng Xcode dưới 26, và Capacitor 8 cần Xcode 26 (macOS 15.6+). Workflow hiện tại sẽ build được nhưng **không submit được**. Cần nâng lên Xcode 26 + runner tương ứng trước khi chạy build thật.
2. **Lịch iPhone native chỉ là code, chưa đủ để chạy thật.** Code có `importFromNativeCalendar` (2 lần) và `isNativeCalendar()` kiểm tra `window.Capacitor.Plugins.Calendar` (comment ghi plugin `@capawesome/capacitor/calendar 1.0.1`), nhưng:
   - `package.json` **không có** `@capawesome/capacitor-calendar` (cũng không có plugin lịch nào khác);
   - `ios/App/App/Info.plist` **không có** `NSCalendarsUsageDescription` (chỉ có Camera / Microphone / PhotoLibrary / SpeechRecognition);
   - Thư mục `node_modules/` không tồn tại trong `fotobro-ios-v1/` nên không kiểm được plugin đã cài chưa.
   
   Hậu quả: trên máy thật, `isNativeCalendar()` trả `false` và app rơi về fallback chọn file `.ics` — đúng như bản web, **không phải “nhập 1 chạm từ Lịch iPhone”**. Cần thêm plugin + quyền + `npm ci` + `npx cap sync ios` rồi mới kiểm được.
3. **Giọng nói (speech-recognition) chưa xác minh được.** `package.json` vẫn giữ `@capacitor-community/speech-recognition@7.0.1`; workflow tự cảnh báo plugin này chỉ có `.podspec`, không có `Package.swift` (SPM) nên có thể không link được. Không có `node_modules/` để kiểm tra đã sửa SPM chưa. Nếu chưa sửa được thì phải bỏ mic khỏi v1 theo quyết định đã chốt, đừng để build gãy.

### Cần sửa

4. **Workflow còn tên repo cũ:** dòng 5 ghi “Khi đẩy lên repo tro-ly-xeo thì copy file này vào …” — phải sửa thành repo `fotobro`.
5. **Test chưa cập nhật theo spec v1:** sửa 2 expect ở trên (APP_VERSION `1.0`, 0 job mẫu). Ngoài ra test hiện tại **không cover tính năng mới** (nhảy bước pipeline, huỷ/khôi phục job, cảnh báo kẹt, gắn tiền vào bước, màu chủ đề, logo, sửa mẫu tin nhắn, ngôn ngữ/tiền tệ, Google auto, Lịch native) — các tính năng này chỉ được kiểm bằng grep code, chưa có test chạy được.
6. **Xác chết job mẫu:** phần tử `<p id="sampleNote">Đang có vài job mẫu để bạn xem thử — xoá lúc nào cũng được.</p>` vẫn còn trong HTML (2 lần nhắc, kèm `$('#sampleNote').classList.toggle('hidden', !state.sample)`), dù job mẫu đã bỏ (jobs mặc định rỗng). Nên xoá hẳn để khỏi hiện nhầm.
7. **Màu nền Capacitor vẫn là kem vintage:** `capacitor.config.ts` và `ios/App/App/capacitor.config.json` còn `backgroundColor: '#FBF5EA'`, Splash/StatusBar cũng `#FBF5EA` — lệch với hướng UI Apple Music (trắng sạch + dark mode đen). Cần đổi theo preset mặc định mới.

### Góp ý

8. “Client ID” còn 4 lần nhắc, “Google Cloud” 1 lần — kiểm tra rồi, tất cả đều nằm trong comment code và đoạn giải thích trong app (“Client ID dùng chung … bạn chỉ cần bấm Đăng nhập Google”), **không phải ô nhập hay hướng dẫn tự tạo**. Không cần sửa, chỉ ghi lại để khỏi hiểu nhầm.
9. “Large Title” / “Apple Music” không xuất hiện bằng chữ trong code (0 lần) — UI tối giản có hiện diện qua CSS (`prefers-color-scheme`, `backdrop-filter`, font 34px) nhưng **không thể xác minh bằng mắt** ở đây (không có trình duyệt / iPhone thật). Cần xem màn hình thật hoặc screenshot trước khi chốt UI.

## 5. Điều kiện chuyển bước

- Sửa xong mục 1–3 (nâng Xcode lên 26, thêm plugin Lịch + quyền `NSCalendarsUsageDescription`, chốt mic: sửa SPM hoặc bỏ khỏi v1) rồi chạy lại workflow trên GitHub Actions — chỉ lúc đó mới biết build iOS có green không. Không có bước nào trong số này kiểm được trên Linux.
- Sửa test theo spec v1 (mục 5) rồi chạy lại: kỳ vọng **103/103** (hoặc số mới nếu thêm test cho tính năng mới).
- Xoá `sampleNote` (mục 6) và sửa tên repo trong workflow (mục 4) trước khi đẩy lên repo `fotobro`.
- Client ID Google chung + xác minh Google, App ID `com.fotobro.app`, CloudKit container, 6 secrets GitHub Actions vẫn đang chờ Việt (không thuộc phạm vi QA này).

## 6. Bước tiếp theo

1. Agent chính: thêm `@capawesome/capacitor-calendar` (hoặc plugin tương đương) vào `package.json`, thêm `NSCalendarsUsageDescription` vào `Info.plist`, chạy `npm ci` + `npx cap sync ios` (trên macOS runner, không làm được ở đây).
2. Agent chính: nâng workflow lên Xcode 26, sửa tên repo `tro-ly-xeo` → `fotobro`, đổi `backgroundColor` `#FBF5EA` theo UI mới, xoá `sampleNote`.
3. Agent chính: quyết mic (sửa SPM tối đa 2 lần, không được thì bỏ khỏi v1) và cập nhật test cho spec v1 + thêm test cho pipeline/cá nhân hoá mới.
4. QA lại sau khi các mục trên xong: chạy lại `node --check` + test jsdom + grep, rồi mới đẩy lên repo `fotobro` và chạy build.

## 7. Trạng thái

**Chưa đạt để đẩy / build.** Code chính sạch (13/13 script pass, 101/103 test với 2 lỗi do test lỗi thời, đã bỏ hết E.L.F./Xèo/ảnh mẫu), nhưng 3 điểm chặn build/submit còn mở: **Xcode 16.4 trong workflow, plugin Lịch iPhone chưa được cài/quyền chưa khai, plugin giọng nói chưa xác minh SPM**. File này chỉ là ảnh chụp lúc 17:04 UTC 19/11/2026 — agent chính vẫn đang làm, cần QA lại sau khi họ xong.

---

## 8. Phụ lục — cập nhật sau khi agent chính sửa xong (20/11/2026, ~01:00)

> Phần này do agent chính ghi thêm sau khi sửa xong đợt cuối, KHÔNG phải QA
> độc lập mới. QA độc lập (§1–§7) giữ nguyên làm ảnh chụp lúc 17:04 UTC 19/11.

| Hạng mục | Trước (QA 00:03–00:04) | Sau khi sửa (20/11 ~01:00) |
|---|---|---|
| Workflow Xcode | 16.4 trên macos-15 | **26.3 trên macos-15**, + bước xác minh Xcode 26, + kiểm tra 6 secret đầu tiên, + tự tăng build number (run_number), + tên profile theo secret `IOS_PROVISIONING_PROFILE_NAME` (tuỳ chọn), + bước test jsdom, signing thống nhất Manual — YAML parse được, 16 steps |
| Plugin Lịch iPhone | chưa có trong package.json, chưa có quyền | `@capacitor/calendar` **1.0.1** đã cài (`npm install` 109 packages), `NSCalendarsUsageDescription` + FullAccess + WriteOnly đã có trong Info.plist; `npx cap sync ios` xác nhận `CapacitorCalendar` trong `Package.swift` |
| Giọng nói | speech-recognition 7.0.1, SPM thiếu Package.swift | **Đã gỡ khỏi package.json** — mic dời **v2.1**, nút mic báo "Giọng nói sẽ có ở bản v2.1" |
| Test jsdom | 101/103 (2 expect cũ: APP_VERSION 2.6, 5 job mẫu) | **120/120** — file dời ra repo root thành `test-fotobro-v2.js` (đọc `www/index.html`), expect `APP_VERSION '2.0'` + 0 job mẫu, + 17 ca mới §13 (nhảy bước, form cọc 6.000.000, xong-thiếu-tiền, huỷ/khôi phục, sổ trống). Chạy: `NODE_PATH=/tmp/film-verify/node_modules node test-fotobro-v2.js` |
| `cap sync ios` | `public/` còn bản web v2.4 cũ | **Đã chạy 20/11**: md5 `www/index.html` = `ios/App/App/public/index.html`, "Trợ lý Xèo" = 0 trong `public/`, không còn file test trong gói, `Package.swift` đủ 10 plugin (browser 8.0.5 + calendar 1.0.1) |
| Info.plist | thiếu Face ID | **Đã thêm `NSFaceIDUsageDescription`** (26 keys, parse được); `PrivacyInfo.xcprivacy` đã tạo + thêm vào target trong pbxproj |
| Version | MARKETING_VERSION 1.0 | **2.0** khắp nơi (APP_VERSION, package.json/lock 2.0.0, MARKETING_VERSION, CHANGELOG-v2.0.md); key lưu trữ `troLyXeo.v1` giữ nguyên |
| Nhắc chụp | bridge 60 phút, tài liệu 12 tiếng | **Thống nhất 12 tiếng** (bridge 720 phút); sheet giải thích quyền Thông báo + `cfg.notifAsked`; `__trolyxeoScheduleReminder`/`__trolyxeoCancelReminder` đã được gọi từ form job / huỷ / xoá job |

**Lỗi mới tìm thấy trong lúc sửa (đã sửa):** `fitAmount()` gọi `canvas.getContext("2d")`
trả `null` trong jsdom → throw làm chết bind của form ghi thu/chi (số cọc không
điền sẵn). Đã thêm guard `if (!_mc) return;` — trên iPhone thật canvas chạy
bình thường nên đây chỉ là lỗi môi trường test, nhưng guard làm code cứng hơn.

**Còn chặn trước khi đẩy/build (chưa xong):** chưa từng chạy workflow (cần
cert + profile + 6 secrets — Việt đã tự tạo App ID + CloudKit + app App Store
Connect + API key "FotoBro CI" lúc 00:26–00:37 20/11, còn thiếu cert/profile);
chưa build `.ipa` thật, chưa test trên iPhone thật (Google, Lịch native,
Notifications 12h, Face ID/passkey, Haptics).
