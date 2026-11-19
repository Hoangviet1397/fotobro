# FotoBro iOS v1 — Release Checklist (Go / No-Go trước khi Submit for Review)

- **App:** FotoBro — trợ lý studio ảnh cho nhiếp ảnh gia tự do
- **Bundle ID:** `com.fotobro.app` · **Version:** 1.0 (build 1) · **Repo:** `Hoangviet1397/fotobro`
- **Ngày lập checklist:** 20/11/2026 ~00:21 (+07)
- **Nguồn đã đọc:** `QA-REPORT.md` (kiểm chứng 00:03–00:04 20/11/2026), `APP-STORE-READY.md`,
  `PUSH-READY.md`, `CHANGELOG-v1.0.md` — cộng kiểm tra chỉ-đọc thêm vài file hiện tại
  (`package.json`, `capacitor.config.ts`, `ios/App/App/Info.plist`,
  `.github/workflows/ios-build.yml`, `www/index.html`, `www/fotobro-config.js`)
  để khỏi ghi sai những mục agent chính đã sửa sau giờ QA.
- **Quy tắc:** chỉ cần **1 mục NO-GO còn mở là KHÔNG bấm Submit for Review**.
  Mục ghi `ĐẠT` chỉ có nghĩa là đạt ở file đã kiểm — vẫn phải kiểm lại nếu file đó
  bị sửa sau giờ ghi trong checklist này.

## Kết luận tổng: ⛔ NO-GO — CHƯA ĐƯỢC SUBMIT

Chưa có bản `.ipa` nào, chưa lên TestFlight lần nào, chưa chụp screenshot nào,
chưa có App ID / CloudKit container / Google Client ID / secret nào được xác nhận,
Privacy Policy chưa có URL thật. Các mục chặn lớn nhất:

1. Chưa build xanh trên GitHub Actions lần nào, chưa có build 1.0 (1) trên TestFlight.
2. Test jsdom vẫn lỗi thời (còn expect `APP_VERSION '2.6'` và 5 job mẫu) — chưa đạt 103/103.
3. `ios/App/App/public/index.html` vẫn là bản web v2.4 cũ (728.223 byte, 16 lần "Trợ lý Xèo") — chưa chạy `npx cap sync ios`.
4. Google Client ID còn trống (`googleClientId: ''`), chưa xác minh Google — trong khi mô tả đang hứa "đăng nhập Google 1 chạm".
5. Privacy Policy URL và Support URL thật đều chưa có; icon vẫn là logo sen/ống kính cũ của Trợ lý Xèo, logo FotoBro v2 trong `assets/logo-v2/` đang chờ Việt duyệt.
6. `Info.plist` có quyền Lịch nhưng **không có `NSFaceIDUsageDescription`** dù app vẫn ghi khoá Face ID — cần xác minh/bổ sung trước khi submit.

> Lưu ý về độ tươi của nguồn: `QA-REPORT.md` và `PUSH-READY.md` là ảnh chụp lúc
> 00:03–00:05 20/11/2026. Sau giờ đó agent chính đã sửa được vài mục — checklist
> này đã cập nhật theo file hiện tại lúc ~00:21: workflow đã lên **Xcode 26.5**,
> đã thêm **`@capacitor/calendar ^1.0.1`** + `NSCalendarsUsageDescription`,
> đã gỡ plugin giọng nói khỏi `package.json`, đã xoá `sampleNote`,
> `capacitor.config.ts` đã đổi nền `#FBF5EA` → `#FFFFFF`, `package.json`
> đã là `name: fotobro`, `version: 1.0.0`. Những mục đó ghi rõ "đã sửa sau QA,
> còn chờ kiểm chứng thật" — không ghi là xong hẳn khi chưa chạy/build/test thật.

---

## A. Code & build

| ☐ | Mục | Tiêu chí đạt | Trạng thái thật / Ghi chú |
|---|---|---|---|
| ☐ | A1. Cú pháp script | `node --check` đạt 13/13 script inline trong `www/index.html`, chạy trên đúng file hiện tại | **NO-GO — cần chạy lại.** QA lúc 00:03 đạt 13/13, nhưng `www/index.html` đã đổi sau đó (343.363 → 341.754 byte, mtime 17:19 UTC 19/11). Chưa có kết quả check lại. |
| ☐ | A2. Test jsdom đạt đủ | `test-fotobro-v1.js` đạt 103/103 (hoặc số mới nếu thêm test cho tính năng mới) | **NO-GO.** QA đạt 101/103; 2 lỗi là test lỗi thời và **vẫn còn nguyên lúc ~00:21**: dòng 47 vẫn expect `APP_VERSION '2.6'` (app đã là `'1.0'`), dòng 128 vẫn expect 5 job mẫu (app đã bỏ job mẫu, mặc định `jobs: []`). Sửa test theo spec v1 rồi chạy lại. Test hiện cũng chưa cover tính năng mới (nhảy bước, huỷ/khôi phục, cảnh báo kẹt, gắn tiền vào bước, màu/logo/ngôn ngữ/tiền tệ, Google auto, Lịch native) — chỉ mới kiểm bằng grep. |
| ☐ | A3. Đã bỏ hết cá nhân hoá Xèo trong `www/` | Grep `www/index.html` = 0 cho E.L.F. / Super Junior / Pearl Sapphire / xeonong / Sadako / Xèo / "Trợ lý Xèo"; không còn ảnh mẫu base64, không còn job mẫu | **ĐẠT ở `www/` (kiểm lại ~00:21: 0 lần).** `data:image` duy nhất còn lại là 1 icon SVG nhỏ, không phải ảnh mẫu. Lưu ý: key lưu trữ cũ `troLyXeo.v1` / `troLyXeoPhotos` được giữ có chủ đích để dữ liệu Xèo không mất — không phải lỗi. |
| ☐ | A4. `ios/` đã đồng bộ bản mới | Sau `npx cap sync ios`: `md5sum www/index.html` = `md5sum ios/App/App/public/index.html`, grep "Trợ lý Xèo" trong `public/` = 0 | **NO-GO.** `ios/App/App/public/index.html` vẫn là bản cũ 728.223 byte (mtime 05:17 19/11), chứa 16 lần "Trợ lý Xèo". Chưa chạy/kiểm tra sync. Workflow có bước sync, nhưng phải kiểm log sync lúc chạy build thật. |
| ☐ | A5. Bundle ID + version/build đúng | `com.fotobro.app` đúng ở `capacitor.config.ts`, `ios/App/App/capacitor.config.json`, `project.pbxproj`, workflow, redirect scheme; `MARKETING_VERSION = 1.0`, `APP_VERSION = '1.0'`, build 1 | **ĐẠT ở code (kiểm ~00:21).** `package.json` cũng đã sửa thành `name: fotobro`, `version: 1.0.0`. Chưa có build thật trên App Store Connect để đối chiếu build number. |
| ☐ | A6. Workflow build đủ chuẩn submit | Workflow `.github/workflows/ios-build.yml`: runner + Xcode 26 trở lên, tên repo/archive là FotoBro, parse được YAML, chạy xanh trên GitHub Actions | **ĐÃ SỬA, CHƯA CHẠY — NO-GO cho tới khi xanh.** Lúc QA workflow còn ghim Xcode 16.4 + tên `TroLyXeo`; lúc ~00:21 đã là **Xcode 26.5**, repo `Hoangviet1397/fotobro`, archive `build/FotoBro.xcarchive`, artifact `FotoBro-ipa`. Nhưng **chưa chạy lần nào** — chỉ khi Actions xanh mới tính là đạt. |
| ☐ | A7. Lịch iPhone native chạy thật | Plugin lịch có trong `package.json`, `NSCalendarsUsageDescription` có trong `Info.plist`, `npm ci` + `npx cap sync ios` xong, nhập 30 ngày tới thành job trên iPhone thật qua TestFlight | **ĐÃ CÓ CODE/QUYỀN, CHƯA KIỂM THẬT — NO-GO.** Lúc QA chưa có plugin/quyền nào; lúc ~00:21 đã có **`@capacitor/calendar ^1.0.1`** trong `package.json` và `NSCalendarsUsageDescription` trong `Info.plist` (có cả `node_modules/@capacitor/calendar`). Chưa có `node_modules` đầy đủ để khẳng định sync xong, chưa thử nhập lịch trên máy thật. |
| ☐ | A8. Mic giọng nói: đã chốt dời v1.1 và dọn sạch | Plugin `@capacitor-community/speech-recognition` đã gỡ khỏi `package.json`; nút mic trong app hiện "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha"; không còn nhắc giọng nói trong mô tả/screenshot/quyền | **QUYẾT ĐỊNH ĐÃ CHỐT (theo `CHANGELOG-v1.0.md`: đã thử 2 cách sửa SPM, không kiểm chứng được trên macOS nên dời v1.1).** Lúc ~00:21 `package.json` đã không còn plugin giọng nói, `Info.plist` đã không còn quyền micro/speech, code có toast v1.1 (dòng ~2177). **Còn phải kiểm trên TestFlight:** bấm mic phải ra đúng thông báo, không được hiện mic "chết", và mô tả + screenshot không được hứa giọng nói. Gõ tay vẫn chạy đủ 8 lệnh. |
| ☐ | A9. Quyền Face ID khớp với tính năng khoá | Nếu app có khoá Face ID thì `Info.plist` phải có `NSFaceIDUsageDescription`; nếu không dùng Face ID thì bỏ mọi câu chữ Face ID khỏi app/mô tả | **NO-GO — cần xác minh.** `CHANGELOG-v1.0.md` ghi app giữ khoá Face ID/PIN, nhưng lúc ~00:21 `Info.plist` có **0 lần `NSFaceIDUsageDescription`** (chỉ còn Camera + Photo Library). Thiếu quyền này có thể làm khoá Face ID lỗi hoặc bị Apple hỏi. Bổ sung quyền hoặc bỏ Face ID khỏi v1 trước khi submit. |
| ☐ | A10. UI đúng hướng Apple Music mới | Nền trắng sạch + dark mode đen, không còn màu kem vintage `#FBF5EA` ở bất cứ config nào còn hiệu lực sau sync | **ĐÃ SỬA MỘT NỬA — NO-GO tới khi sync xong.** `capacitor.config.ts` đã là `#FFFFFF`; nhưng `ios/App/App/capacitor.config.json` vẫn còn `#FBF5EA` (3 chỗ) — sẽ hết khi `cap sync` ghi đè (xem A4). Chưa được xem màn hình thật/screenshot nên chưa xác minh được Large Title / tab bar mờ bằng mắt. |
| ☐ | A11. Không có secret trong code/repo | `www/fotobro-config.js` còn placeholder trống; grep `.p12` / `.key` / `.p8` / `.mobileprovision` / `client_secret` trong thư mục (trừ `node_modules`) = 0; `.gitignore` chặn secret | **ĐẠT Ở MỨC KIỂM ĐƯỢC (~00:21):** `googleClientId: ''`, `supportEmail: ''` đều trống; `.gitignore` đã chặn `node_modules/`, `*.p12`, `*.key`, `*.mobileprovision`, `AuthKey_*.p8`. **Phải kiểm lại ngay trước lúc commit/push đầu tiên** vì thư mục chưa phải git repo (xem C6). |
| ☐ | A12. Có bản build TestFlight | Build 1.0 (1) đã lên App Store Connect → TestFlight, trạng thái sẵn sàng cho Internal Testing | **NO-GO.** Chưa build `.ipa` thật lần nào, chưa lên TestFlight. Đây là điều kiện tiên quyết cho mọi kiểm chứng ở mục E. |

---

## B. App Store (App Store Connect)

| ☐ | Mục | Tiêu chí đạt | Trạng thái thật / Ghi chú |
|---|---|---|---|
| ☐ | B1. Metadata cơ bản | Tên `FotoBro` (7 ký tự), Subtitle `Trợ lý studio ảnh` (17/30 ký tự), SKU `fotobro-001`, ngôn ngữ chính Vietnamese, Bundle ID `com.fotobro.app`, Primary Category Business, Secondary Photo & Video, Price Free | **NO-GO — mới là bản nháp, Việt chưa duyệt.** Toàn bộ lấy từ `APP-STORE-READY.md` §3 (bản rà soát 20/11/2026, chưa nhập vào App Store Connect). Category phụ Photo & Video cũng chưa chốt hẳn (Productivity là phương án dự phòng). Chỉ nhập sau khi Việt gật. |
| ☐ | B2. Keywords | Chuỗi keywords ≤ 100 ký tự, cách nhau bằng dấu phẩy, không khoảng trắng, không nhồi tên app khác, đếm lại bằng lệnh trước khi nhập | **NO-GO — chưa chốt.** Chuỗi hiện có 94/100 ký tự (`fotobro,foto bro,studio anh,chup anh,quan ly job,thu chi,nhac lich,chup cuoi,lookbook,portrait`); đề xuất thêm `,event` thành đúng 100 — mới là đề xuất trong `APP-STORE-READY.md` §5, chưa được Việt duyệt, chưa đếm lại bằng lệnh. |
| ☐ | B3. Mô tả VI + EN khớp build gửi đi | Mô tả VI + EN đã dán khớp đúng tính năng có trong build đó: đoạn Google chỉ giữ nếu Google kịp v1; **không nhắc giọng nói** (mic đã dời v1.1); không nhắc Xèo/Sadako/E.L.F./dữ liệu mẫu thật | **NO-GO.** Mô tả đã soạn sẵn trong `APP-STORE-READY.md` §6 (VI + EN), Việt chưa duyệt. Đoạn "ĐĂNG NHẬP GOOGLE 1 CHẠM…" hiện **không khớp thực tế** vì Google chưa chạy được (xem C3) — nếu submit khi Google chưa kịp thì phải sửa mô tả theo phương án dự phòng (§12 mục 7 trong file đó). |
| ☐ | B4. Screenshots — 6 tấm/bộ, 2 bộ | 6 ảnh/bộ, đúng thứ tự §9 `APP-STORE-READY.md` (1 Hôm nay, 2 Pipeline 8 bước, 3 Sổ tiền/báo cáo, 4 Google 1 chạm hoặc Lịch iPhone, 5 Thêm job mới, 6 Cài đặt/Khoá app); 2 bộ bắt buộc: 6.7" 1290×2796 và 6.5" 1242×2688; chụp bằng iPhone thật qua TestFlight, dữ liệu mẫu hư cấu, không có tên/email/số thật, không màn lỗi/màn trống, không màn cảnh báo "Google chưa xác minh" | **NO-GO.** Chưa chụp tấm nào — chỉ chụp được khi có bản TestFlight chạy được (xem A12). iPad không bắt buộc (app chỉ làm cho iPhone portrait). App Preview video 15–30 giây là tùy chọn, làm sau, không chặn lần gửi đầu. |
| ☐ | B5. App Icon 1024×1024 | File `AppIcon-1024.png` 1024×1024, RGB, không alpha, đúng logo sẽ dùng khi phát hành, đã tải lên App Information | **NO-GO — chờ Việt chốt logo.** File `AppIcon-1024.png` có sẵn và `APP-STORE-READY.md` ghi đã kiểm chứng đúng chuẩn, **nhưng icon hiện tại vẫn là hoa sen + ống kính cũ của Trợ lý Xèo**. Logo FotoBro mới (chữ F đậm trong vòng ống kính đỏ) đã có trong `assets/logo-v2/` (`fotobro-icon-1024.png`, chờ duyệt). Nếu đổi logo thì phải render lại `AppIcon-1024.png` + icon/splash trong `ios/` **trước build cuối**, không đổi icon sau khi đã gửi Apple duyệt. |
| ☐ | B6. Privacy Policy URL | URL mở được trên điện thoại, là link web (không phải file đính kèm), nội dung khớp app v1 (repo `fotobro`, Google auto 1 chạm — không còn chữ "Google mặc định TẮT") | **NO-GO.** File `PRIVACY.html` đã viết trong gói nhưng **chưa host** — chưa có URL thật. Đề xuất `https://hoangviet1397.github.io/fotobro/PRIVACY.html` (cần thêm file vào repo `fotobro` + bật GitHub Pages + mở thử trên điện thoại). `PRIVACY.md` lúc ~00:21 đã sạch chữ `tro-ly-xeo` / "Google mặc định TẮT" / `v2.6`, nhưng vẫn phải đối chiếu lại nội dung + ngày trong file trước khi host. Không có URL này thì không tạo được app trong App Store Connect. |
| ☐ | B7. Support URL | Là link web (không phải email), mở được, có hướng dẫn/hộp thư liên hệ thật hoặc repo có hướng dẫn | **NO-GO — mới là phương án tạm, Việt chưa duyệt.** Đề xuất tạm: `https://github.com/Hoangviet1397/fotobro` (repo mới, hiện chỉ có README). File `SUPPORT.html` đã viết nhưng chưa host. Sau này đổi thành `https://fotobro.app/support` khi có domain — domain `fotobro.app` chưa xác minh được trống hay không, `fotobro.com` đã có chủ tới 22/02/2027. Không ghi email nào vào App Store Connect nếu chưa có hộp thư thật. |
| ☐ | B8. App Privacy (Privacy Nutrition Labels) | Khai đúng với build gửi đi: v1 local-first thì khai **"Data Not Collected"**; khai lại nếu Google bật (dữ liệu Google chỉ đọc trên máy) hoặc CloudKit bật thật | **CHƯA KHAI — NO-GO tới khi khai xong và khớp build.** Hiện mới là hướng khai trong `APP-STORE-READY.md` §4/§10, chưa nhập vào App Store Connect. Đặc biệt: không được khai "Data Not Collected" nếu tới lúc submit Google đã bật mà chưa rà lại questionnaire. |

---

## C. Tài khoản & secrets (App ID, CloudKit, Google, 6 secrets)

| ☐ | Mục | Tiêu chí đạt | Trạng thái thật / Ghi chú |
|---|---|---|---|
| ☐ | C1. App ID `com.fotobro.app` | Đã tạo trên Apple Developer (Explicit Bundle ID `com.fotobro.app`, Description `FotoBro`), hiện trong danh sách Identifiers, khớp `PRODUCT_BUNDLE_IDENTIFIER` trong `project.pbxproj` | **NO-GO.** Không có bằng chứng nào trong 4 file nguồn là App ID đã tạo. Việt phải tự làm bằng Apple ID đã đăng ký Developer — Muse không làm thay được. Lưu ý: tạo sai Bundle ID thì phải tạo app mới, không sửa được. |
| ☐ | C2. CloudKit container `iCloud.com.fotobro.app` | Container đã tạo trong Identifiers → iCloud Containers, đã gắn vào App ID (capability iCloud), trạng thái trong `fotobro-config.js` không còn `not-configured` | **NO-GO.** Code hiện chỉ để `cloudKitContainer: 'iCloud.com.fotobro.app'` ở trạng thái `not-configured` — **chưa có container thật, chưa code sync**. Tạo trước ở v1 để khỏi sửa App ID/workflow sau; schema CloudKit Nấc 2 làm sau, không làm ở v1. |
| ☐ | C3. Google Client ID chung + xác minh Google | Có Client ID chung của FotoBro trong `fotobro-config.js` (không còn `''`); redirect iOS đúng `com.googleusercontent.apps.<id>:/oauth2redirect` (code hiện dùng `com.fotobro.app:/oauth2redirect` — phải sửa theo Client ID thật); OAuth mở bằng trình duyệt hệ thống + deep-link (Google cấm OAuth trong WKWebView); xác minh Google xong, không còn cảnh báo "ứng dụng chưa xác minh" | **NO-GO — chặn tính năng Google, và đang lệch với mô tả.** `googleClientId: ''` (trống), nút Google trong app báo "chưa sẵn sàng". Xác minh Google mất **4–10 tuần nếu giữ đủ 6 scope, 2–6 tuần nếu bỏ đọc Gmail (`gmail.readonly`) ở v1**. **Quyết định cần Việt chốt trước submit:** (a) chờ Google kịp rồi mới submit, hoặc (b) tắt Google tạm ở v1 — khi đó phải ẩn nút Google, sửa mô tả (thay đoạn Google 1 chạm bằng nhập lịch `.ics` / Lịch iPhone), sửa screenshot số 4 và App Privacy cho khớp. Không được submit khi reviewer còn thấy màn cảnh báo chưa xác minh. |
| ☐ | C4. Đủ 6 secrets GitHub Actions | Cả 6 secret đã dán đúng tên (khớp từng ký tự) vào repo `Hoangviet1397/fotobro` → Settings → Secrets and variables → Actions; không secret nào nằm trong chat/commit | **NO-GO — chưa secret nào được xác nhận.** 6 secret workflow thực sự đọc: `IOS_DIST_CERT_P12_BASE64`, `IOS_DIST_CERT_PASSWORD`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_KEY_BASE64`, `APPLE_TEAM_ID`. Secret dự phòng `IOS_PROVISIONING_PROFILE_BASE64` workflow hiện **không đọc** — không bắt buộc, chỉ để sẵn. Không dán secret vào chat hay commit lên GitHub. |
| ☐ | C5. Chứng chỉ + profile + API Key + Team ID | Distribution Certificate (.p12 + mật khẩu) đã tạo; Provisioning Profile tên đúng **`FotoBro App Store`** (khớp ExportOptions trong workflow); App Store Connect API Key (.p8, tải 1 lần duy nhất) + Issuer ID + Key ID đã ghi lại; Team ID 10 ký tự đã lấy | **NO-GO.** Chưa có bằng chứng mục nào xong. Làm trên Windows bằng OpenSSL được, không cần Mac (xem `BUILD-GUIDE.md` §3–§4, nhớ thay repo thành `fotobro`). Giữ file `.key` cẩn thận, không đẩy lên GitHub. |
| ☐ | C6. Code đã đẩy lên repo `fotobro` | Thư mục đã `git init`, remote `https://github.com/Hoangviet1397/fotobro.git`, nhánh `main`, commit đầu đã push (đã có phê duyệt push của Việt), kiểm tra trên web thấy đủ `package.json`, `ios/`, `www/`, `.github/workflows/`, `PRIVACY.md`, không có file secret | **NO-GO.** Thư mục `fotobro-ios-v1/` lúc ~00:21 **chưa phải git repo** (`fatal: not a git repository`), chưa có remote. Repo `Hoangviet1397/fotobro` hiện chỉ có README ban đầu. Chỉ đẩy sau khi các mục chặn build ở mục A đã sửa xong và agent chính báo app xong + test đạt. Đẩy toàn bộ thư mục làm repo root (không copy `node_modules/`, không đẩy bản web cũ; repo `tro-ly-xeo` của Xèo không động vào). |
| ☐ | C7. GitHub Pages đã bật (cho Privacy URL) | Repo → Settings → Pages → Deploy from a branch → `main`, `/ (root)`; mở được `https://hoangviet1397.github.io/fotobro/PRIVACY.html` | **NO-GO.** Chưa bật (phụ thuộc C6 + B6). Chỉ làm sau khi code đã push. |

---

## D. Pháp lý & giá (Nấc 2/3 chưa bật IAP)

| ☐ | Mục | Tiêu chí đạt | Trạng thái thật / Ghi chú |
|---|---|---|---|
| ☐ | D1. Privacy Policy (nội dung) | Nội dung `PRIVACY.md`/`PRIVACY.html` đúng app v1: dữ liệu chỉ ở trên máy, không tài khoản/máy chủ/quảng cáo/theo dõi; không còn repo `tro-ly-xeo`, không còn "Google mặc định TẮT", ngày + phiên bản trong file đã cập nhật (không còn ghi v2.6) | **CHƯA XONG HẲN — NO-GO tới khi host + kiểm lại.** File đã viết; grep ~00:21 không còn chữ cũ `tro-ly-xeo` / "Google mặc định TẮT" / `v2.6`. Vẫn phải đọc lại toàn bộ trước khi host và sau khi host phải mở URL trên điện thoại kiểm tra (xem B6). |
| ☐ | D2. Điều khoản / tuyên bố trong app | Mục Cài đặt có Disclaimer/Terms/Privacy khớp với bản đã host; người dùng xoá được toàn bộ dữ liệu trong Cài đặt; gỡ app là sạch dữ liệu | **CHƯA KIỂM CHỨNG — NO-GO tới khi kiểm trên TestFlight.** Hướng đã có (dữ liệu chỉ trên máy, xuất JSON sao lưu, xoá trong Cài đặt), nhưng chưa có lần chạy thật nào để xác nhận các mục này hiện đúng trong app v1. |
| ☐ | D3. Giá Nấc 2/3 — KHÔNG bật IAP ở v1 | Trong App Store Connect: Price = **Free**, **không tạo sản phẩm IAP nào**, không ghi giá Nấc 2/3 vào mô tả/screenshot; Nấc 2 (CloudKit) + Nấc 3 (nhóm/studio) chỉ là placeholder trong code/tài liệu | **ĐÚNG HƯỚNG, CHƯA KIỂM Ở ASC — ghi là ☐ cho tới khi đối chiếu trong App Store Connect.** Quyết định đã chốt 23:43 19/11: Nấc 1 miễn phí, Nấc 2/3 có thu phí **nhưng chưa chốt số tiền + chu kỳ** nên v1 không bật IAP thật. Đừng tạo IAP chỉ vì "để sẵn" — tạo là phải khai giá. |
| ☐ | D4. Rủi ro Guideline 4.8 (Sign in with Apple) | Đã chuẩn bị câu trả lời + phương án dự phòng; không submit trong trạng thái "biết có thể bị bắt bổ sung mà chưa có phương án" | **CHƯA XONG — ghi chú, không tự chặn nếu Việt chấp nhận rủi ro.** Apple có thể yêu cầu app có đăng nhập Google thì phải có Sign in with Apple tương đương. Phương án đã chuẩn bị trong `APP-STORE-READY.md` §12: Google là tùy chọn, không phải tài khoản FotoBro; Sign in with Apple bật cho Nấc 2 CloudKit nếu reviewer yêu cầu. Nếu Apple vẫn bắt buộc thì phải thêm Sign in with Apple rồi gửi lại. |
| ☐ | D5. Export Compliance | Đã khai đúng trong App Store Connect: app không dùng mã hoá tự viết ngoài chuẩn (mã hoá sao lưu dùng AES chuẩn của hệ thống) | **NO-GO — chưa khai.** Mới là hướng dẫn trong `APP-STORE-READY.md` §11C. Nếu dùng mã hoá đầu cuối tự triển khai cho CloudKit thì hỏi lại trước khi khai — ở v1 CloudKit chưa bật nên khai theo chuẩn. |
| ☐ | D6. Không có dữ liệu thật / file thừa trong build gửi đi | Build gửi đi không chứa job/ảnh/tiền thật của Xèo hay khách thật, không chứa secret, không chứa file test/dữ liệu mẫu nhầm | **CHƯA KIỂM — NO-GO tới khi kiểm trước submit.** Kiểm lại A3/A4/A11 + screenshot B4 cùng lúc: dữ liệu mẫu trong screenshot phải là hư cấu (xem `SCREENSHOT-DATA.md`). |

---

## E. TestFlight & thông tin duyệt (làm sau khi có build)

| ☐ | Mục | Tiêu chí đạt | Trạng thái thật / Ghi chú |
|---|---|---|---|
| ☐ | E1. Internal Testing | Build 1.0 (1) thấy trong TestFlight; đã thêm tester nội bộ (Xèo là người dùng đầu tiên) bằng Apple ID; cài được qua app TestFlight trên iPhone | **NO-GO.** Chưa có build (xem A12) nên chưa thêm được tester nào. |
| ☐ | E2. Thử đủ chức năng trên iPhone thật | Mở app → Hôm nay → thêm 1 job Film + 1 job Cả hai → nhảy bước pipeline → ghi cọc → huỷ + khôi phục 1 job → sổ tiền/báo cáo → đăng nhập Google 1 chạm (hoặc xác nhận nút báo "chưa sẵn sàng" nếu Google tắt tạm) → nhập từ Lịch iPhone → đổi màu chủ đề/logo/ngôn ngữ/tiền tệ → sửa mẫu tin nhắn → khoá Face ID/PIN → sao lưu JSON; tắt mạng (máy bay) app vẫn dùng được; Share sheet hoạt động; banner Cập nhật (service worker) không hiện trong app native | **NO-GO.** Chưa chạy lần nào trên iPhone thật: build `.ipa`, TestFlight, Local Notifications, Face ID/passkey, chọn ảnh, Share sheet đều chưa kiểm chứng (theo `CHANGELOG-v1.0.md`). |
| ☐ | E3. Dark mode + light mode, chữ/tab không lỗi | Cả 2 chế độ chữ không bị cắt, tab dưới không bị che (lỗi từng gặp ở bản web trên điện thoại) | **NO-GO.** Chưa kiểm được — trình duyệt cloud không thu hẹp được cỡ điện thoại, chỉ Việt/Xèo trên iPhone thật mới xác nhận được. |
| ☐ | E4. App Review Information | Đã điền tên + email + số điện thoại liên hệ (email Việt kiểm soát được, trả lời được trong 1–3 ngày); Notes cho reviewer đã ghi bằng tiếng Anh (xem `APP-STORE-READY.md` §12); ghi rõ "Không cần tài khoản — mở app là dùng ngay, Google là tùy chọn"; tài khoản Google demo chỉ chuẩn bị khi Apple hỏi, không dùng Gmail thật của Việt/Xèo | **NO-GO.** Chưa điền gì — Việt phải cung cấp thông tin liên hệ (mục 10 trong `APP-STORE-READY.md` §13). |

---

## Quyết định Go / No-Go

| Điều kiện | Trạng thái |
|---|---|
| Tất cả mục A (code & build) đạt, workflow chạy xanh, có build 1.0 (1) trên TestFlight | ⛔ CHƯA — A1, A2, A4, A6, A7, A9, A10, A12 còn mở |
| Tất cả mục B (App Store) đạt, Việt đã duyệt metadata + mô tả + logo, đủ 6 screenshots/bộ | ⛔ CHƯA — B1–B8 đều chưa xong |
| Tất cả mục C (tài khoản & secrets) đạt | ⛔ CHƯA — C1–C7 đều chưa xong |
| Tất cả mục D (pháp lý & giá) đạt, không IAP nào được tạo ở v1 | ⛔ CHƯA — D1, D2, D5, D6 còn mở |
| Tất cả mục E (TestFlight & duyệt) đạt | ⛔ CHƯA — chưa có build để thử |

**Kết luận: NO-GO. Không bấm Submit for Review.**

Thứ tự làm tiếp (theo `PUSH-READY.md` + `APP-STORE-READY.md` §11/§13):
1. Agent chính: sửa test theo spec v1 (A2), chạy lại `node --check` + test jsdom trên file mới nhất (A1–A2), bổ sung `NSFaceIDUsageDescription` hoặc bỏ Face ID (A9).
2. Agent chính + Muse: `npx cap sync ios`, kiểm `public/` khớp `www/` (A4/A10), rồi push code lên repo `fotobro` sau khi Việt phê duyệt push (C6).
3. Việt: tạo App ID, chứng chỉ, profile, API Key, dán đủ 6 secrets (C1, C4–C5); tạo CloudKit container (C2); chốt logo FotoBro mới (B5); chốt Google kịp v1 hay tắt tạm (C3); chốt metadata/mô tả/keywords (B1–B3); cung cấp thông tin liên hệ duyệt app (E4).
4. Chạy workflow GitHub Actions tới khi xanh, build 1.0 (1) lên TestFlight (A6/A12), Việt/Xèo thử đủ trên iPhone thật (E1–E3), chụp 6 screenshots (B4).
5. Host Privacy Policy + bật GitHub Pages, điền Support URL (B6–B7, C7), khai App Privacy + Export Compliance (B8, D5), xác nhận không tạo IAP ở v1 (D3) — rồi mới quay lại checklist này tick đủ và bấm Submit for Review.

*File này chỉ đọc các file nguồn, không sửa code, không tạo tài khoản, không push GitHub.*
