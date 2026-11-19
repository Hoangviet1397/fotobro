# PUSH-READY — FotoBro iOS v1: checklist đẩy repo + build + TestFlight

> File này do agent chuẩn bị song song viết, chỉ đọc file hiện có trong
> `~/workspace/fotobro-ios-v1/` và kiểm tra bằng lệnh chỉ đọc.
> **KHÔNG đẩy gì lên GitHub, không tạo tài khoản, không nhập secret thật.**
> Ngày kiểm tra: 20/11/2026 ~00:05 (rạng sáng sau 19/11/2026).
> Agent chính vẫn đang làm app trong cùng thư mục — **CHƯA đẩy được ngay**,
> phải đợi agent chính báo xong + sửa xong các mục "Chặn" ở §1 rồi mới đẩy.

## 0. Bối cảnh đã chốt (đừng hỏi lại)

- App: **FotoBro** (Foto + Bro), trợ lý studio ảnh cho nhiếp ảnh gia tự do.
- Bundle ID: `com.fotobro.app` — đã chốt, đổi sau khi tạo App ID là không được.
- Repo GitHub mới: **Hoangviet1397/fotobro** (public, nhánh `main`, hiện chỉ
  có README ban đầu, chưa push code). Repo cũ `tro-ly-xeo` là app Xèo
  đang dùng, **không động vào**.
- Gói iOS: Capacitor 8.6.2, iOS 15.0, MARKETING_VERSION 1.0 (build 1),
  `package.json` name `fotobro` version 2.6.0.
- Hướng mới (19/11 tối): **dừng bản web, làm app iOS luôn**; tối giản
  (bỏ E.L.F./Super Junior, ảnh mẫu + job mẫu Xèo); Google **auto 1 chạm**
  (không dán Client ID); Lịch iPhone native 1 chạm; 4 cá nhân hoá chung;
  4 cải tiến pipeline; UI kiểu Apple Music tối giản.

## 1. Kết quả kiểm tra chỉ đọc (đã chạy, ngày 20/11/2026 ~00:05)

| Kiểm tra | Kết quả |
|---|---|
| Git local trong `fotobro-ios-v1/` | **Chưa phải git repo** (`fatal: not a git repository`), chưa có remote. Cần `git init` + remote tới `Hoangviet1397/fotobro` lúc đẩy (§3). |
| Workflow `.github/workflows/ios-build.yml` parse YAML | ✅ Parse được. Name: `Build FotoBro iOS`, `runs-on: macos-15`, 12 steps. |
| Bundle ID trong code | ✅ `com.fotobro.app` đúng ở `capacitor.config.ts`, workflow (2 chỗ), `project.pbxproj` (2 chỗ), `capacitor.config.json`, `www/index.html` (redirect scheme `com.fotobro.app:/oauth2redirect`). Không còn `vn.sadako.trolyxeo` ở đâu. |
| Secrets workflow thực sự đọc | ✅ Đúng 6 secret: `IOS_DIST_CERT_P12_BASE64`, `IOS_DIST_CERT_PASSWORD`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_KEY_BASE64`, `APPLE_TEAM_ID`. `IOS_PROVISIONING_PROFILE_BASE64` **không được workflow đọc** — chỉ là dự phòng (§7). |
| `www/index.html` (agent chính đang sửa) | 336.652 byte, sửa lần cuối 00:01. Grep = 0 cho `E.L.F.`, `Super Junior`, `Trợ lý Xèo`. Có `<script src="fotobro-config.js">` (dòng 514). |
| `www/fotobro-config.js` (mới) | ✅ Có sẵn: `googleClientId: ''` (placeholder trống), `googleRedirectScheme: 'com.fotobro.app'`, `cloudKitContainer: 'iCloud.com.fotobro.app'`, `supportEmail: ''`. Chưa có giá trị thật nào. |
| `ios/App/App/public/index.html` | ⚠️ **Còn bản cũ 728.223 byte, chứa 16 lần "Trợ lý Xèo"** — là bản web v2.4 cũ. Sẽ bị `npx cap sync ios` ghi đè trong workflow (step "Sync Capacitor" chạy trước archive), nhưng **phải kiểm tra log sync lúc chạy** (§8). |
| Calendar plugin trong `package.json` | ⚠️ **Chưa có** — `package.json` chỉ có 9 plugin cũ, không có plugin lịch nào. Agent chính đang làm phần Lịch iPhone native; đừng đẩy khi chưa thấy plugin lịch trong `package.json` + quyền lịch trong `Info.plist`. |
| `Info.plist` usage descriptions | Có 5 mô tả (máy ảnh, micro, thư viện ảnh xem + thêm, nhận dạng giọng nói). **Chưa có `NSCalendarsUsageDescription`** — bắt buộc phải thêm trước khi xin quyền Lịch iPhone, nếu không iOS từ chối. |
| `node_modules/` trong `fotobro-ios-v1/` | Không có (bản sao này không copy `node_modules`, tốt — workflow chạy `npm ci`). `.gitignore` đã chặn `node_modules/`, `*.p12`, `*.key`, `*.mobileprovision`, `AuthKey_*.p8`. |
| `test-fotobro-v1.js` trong `www/` | Có sẵn (16.041 byte, tạo 23:59). Lưu ý tên file trong comment đầu file vẫn ghi `test-fotobro.js` cũ — chỉ là chữ trong comment, không ảnh hưởng chạy test. |

### 1a. ⛔ CHẶN — phải sửa trước khi chạy build (agent chính hoặc Việt chốt)

1. **Workflow dùng Xcode 16.4 trên macos-15 — Apple sẽ từ chối.**
   Workflow hiện ghi `runs-on: macos-15` + `xcode-select: 16.4`.
   Theo ghi chú đã lưu: Capacitor 8 cần tối thiểu Xcode 26, Xcode 26
   cần macOS 15.6+, và từ 28/04/2026 App Store Connect từ chối app build
   bằng Xcode dưới 26. **Phải cập nhật workflow lên runner + Xcode 26
   (vd `macos-26` / Xcode 26.x) trước khi chạy.** File workflow KHÔNG
   được sửa trong lần chuẩn bị này — ghi vào đây để agent chính sửa.
2. **Tên archive/artifact còn tên cũ:** workflow đặt tên
   `build/TroLyXeo.xcarchive` và artifact `TroLyXeo-ipa`. Build vẫn chạy
   được nhưng nên đổi thành `FotoBro` cho sạch trước khi đẩy.
3. **Plugin giọng nói SPM:** `@capacitor-community/speech-recognition`
   7.0.1 không có `Package.swift` (xem RISKS.md §4). Agent chính đang
   thử sửa tối đa 2 lần, không được thì dời mic sang v1.1. **Đừng chạy
   build lần đầu khi chưa biết mic ở trạng thái nào** — nếu mic đã dời
   v1.1 thì workflow phải chạy được khi plugin đã gỡ.

### 1b. ⚠️ Tài liệu cũ — còn trỏ repo `tro-ly-xeo`, phải sửa chữ trước khi đẩy

Các file này **không chặn build**, nhưng nếu đẩy nguyên văn sẽ gây nhầm
(và Support/Privacy URL sẽ sai repo). Agent chính sửa, hoặc sửa tay
trước lúc đẩy:

| File | Chỗ sai / cũ | Sửa thành |
|---|---|---|
| `BUILD-GUIDE.md` | §0 bước 5, §5 tiêu đề, §6 mục 1+3, §7: repo `tro-ly-xeo`; §2 SKU `tro-ly-xeo-001` | Repo `Hoangviet1397/fotobro`; SKU `fotobro-001` (khớp APP-STORE-LISTING.md); §6 "copy vào repo tro-ly-xeo" **đã lỗi thời** — nay đẩy thẳng gói này làm repo root (xem §3) |
| `README.md` | Nguồn "bản web v2.4 commit 8008ec79", repo `tro-ly-xeo`, "Google ở v1: TẮT hay GIỮ?" | Nguồn FotoBro v2.6 / iOS v1; repo `fotobro`; Google đã chốt **auto 1 chạm** (23:52 19/11), không còn câu hỏi TẮT/GIỮ |
| `APP-STORE-LISTING.md` | "Repo GitHub vẫn tên tro-ly-xeo"; Support URL `github.com/Hoangviet1397/tro-ly-xeo`; Privacy URL `hoangviet1397.github.io/tro-ly-xeo/PRIVACY.html`; "app chỉ có tiếng Việt" | Repo + URL `fotobro`; app v1 có thêm tiếng Anh (cá nhân hoá §4) |
| `PRIVACY.md` | Host ở repo `tro-ly-xeo`, URL `.../tro-ly-xeo/PRIVACY.html`; "Google mặc định TẮT" | Host ở repo `fotobro`; Google auto 1 chạm (đăng nhập 1 lần, xin đủ quyền) |
| `package-lock.json` | `name: "tro-ly-xeo"` (2 chỗ) | `fotobro` (chạy `npm install` lại sau khi sửa `package.json` nếu cần; đừng sửa tay lockfile) |
| `.gitignore` comment | "Khi đẩy lên repo tro-ly-xeo…" | `fotobro` (chỉ là comment, không chặn) |
| `ios/App/App/public/index.html` | Bản cũ v2.4 (16 lần "Trợ lý Xèo", backup `tro-ly-xeo-sao-luu.json`) | Sẽ bị `cap sync` ghi đè — kiểm tra sau sync, không sửa tay |

## 2. Quyết định cấu trúc repo (cần chốt trước lúc đẩy)

**Đề xuất: đẩy toàn bộ thư mục `fotobro-ios-v1/` làm repo root của
`Hoangviet1397/fotobro`.** Tức repo root có sẵn: `package.json`,
`capacitor.config.ts`, `ios/`, `www/`, `.github/workflows/ios-build.yml`,
`PRIVACY.md`, `APP-STORE-LISTING.md`, `BUILD-GUIDE.md`, `README.md`,
`AppIcon-1024.png`, `assets/`.

- Vì sao: workflow chạy `npm ci` + `npx cap sync ios` ở root, và
  GitHub Pages host `PRIVACY.html` ở root. Không cần thư mục con.
- Không copy `node_modules/` (đã có `.gitignore`), không copy file
  secret (`.p12`, `.key`, `.cer`, `.p8`, `.mobileprovision` — cũng đã
  có `.gitignore` chặn).
- `www/test-fotobro-v1.js` có thể giữ trong repo (làm bằng chứng test),
  hoặc bỏ ra khỏi `www/` nếu không muốn nó vào app — `cap sync` chỉ
  copy file, không chạy test, nên giữ cũng vô hại.
- Không đẩy bản web cũ vào repo này. Repo `tro-ly-xeo` giữ nguyên làm
  app Xèo đang dùng.

## 3. Checklist đẩy code lên GitHub (Muse làm, cần Việt phê duyệt push)

> Chưa làm bước nào trong mục này. Chỉ làm sau khi §1a xong và agent
> chính báo app xong + test đạt.

- [ ] **A1. Đồng bộ lần cuối:** `www/index.html` là bản iOS v1 mới nhất
  của agent chính; chạy `npx cap sync ios` (trên Linux chạy được — chỉ
  scaffold/copy, không cần Xcode) để `ios/App/App/public/` khớp `www/`.
  Kiểm tra: `md5sum www/index.html ios/App/App/public/index.html`
  phải giống nhau, và grep `Trợ lý Xèo` trong `public/` = 0.
- [ ] **A2. Kiểm tra không có secret trong thư mục:** grep `.p12`, `.key`,
  `.p8`, `.mobileprovision`, `client_secret` trong toàn bộ thư mục
  (trừ `node_modules`). `fotobro-config.js` phải còn
  `googleClientId: ''` (trống). Nếu có secret thật lọt vào thì xoá
  ngay, **không commit**.
- [ ] **A3. Khởi tạo git + remote (Muse, 1 lần):**
  `git init`, `git remote add origin https://github.com/Hoangviet1397/fotobro.git`,
  nhánh `main`.
- [ ] **A4. Commit đầu tiên (Muse, cần Việt phê duyệt push):**
  `git add -A` (trừ `node_modules/`, secret — đã có `.gitignore`),
  commit "FotoBro iOS v1: Capacitor 8, com.fotobro.app, base web v2.6
  tối giản + Google auto + Lịch iPhone native", `git push -u origin main`.
  Nếu push bị từ chối vì repo đã có README: `git pull --rebase origin main`
  rồi push lại.
- [ ] **A5. Kiểm tra trên GitHub web:** repo `Hoangviet1397/fotobro`
  hiện đủ `package.json`, `ios/`, `www/`, `.github/workflows/`,
  `PRIVACY.md`. Không có file secret nào.

## 4. GitHub Pages + Privacy Policy URL (Muse làm sau A5, Việt kiểm tra)

App Store Connect bắt buộc có **Privacy Policy URL** (link web, không
phải file đính kèm) và **Support URL** (link web, không phải email).

- [ ] **B1. Tạo `PRIVACY.html` ở repo root** từ `PRIVACY.md` (render
  markdown → HTML đơn giản, giữ nguyên nội dung, sửa repo/URL thành
  `fotobro`). Đây là file duy nhất cần thêm ngoài gói hiện có.
- [ ] **B2. Bật GitHub Pages:** repo → Settings → Pages → Source:
  Deploy from a branch → Branch `main`, thư mục `/ (root)` → Save.
- [ ] **B3. Kiểm tra URL sống:** mở
  `https://hoangviet1397.github.io/fotobro/PRIVACY.html` — phải hiện
  trang chính sách. Dùng URL này làm Privacy Policy URL.
- [ ] **B4. Support URL:** dùng `https://github.com/Hoangviet1397/fotobro`
  tạm (README có hướng dẫn). Sau này có domain `fotobro.app` thì đổi
  thành `https://fotobro.app/support` (trang có nút
  `mailto:support@fotobro.app`) — xem `~/workspace/fotobro-scale/docs/EMAIL-SETUP.md`.

## 5. Tạo App ID `com.fotobro.app` (Việt tự làm — Apple Developer)

- [ ] **C1.** Đăng nhập https://developer.apple.com/account bằng đúng
  Apple ID đã đăng ký Apple Developer Program.
- [ ] **C2.** Certificates, Identifiers & Profiles → Identifiers → `+`
  → App IDs → App → Description `FotoBro` → Bundle ID **Explicit**
  `com.fotobro.app` → Register.
- [ ] **C3. Capabilities — v1:** bật **iCloud** (cho Nấc 2 CloudKit sau
  này; xem §6) + **Sign in with Apple** (cho đồng bộ Nấc 2). **Không**
  bật Push Notifications (nhắc lịch dùng Local Notifications trên máy).
  Nếu App ID đã tạo trước đó mà chưa tick iCloud thì vào sửa App ID
  để thêm capability — làm được sau, không cần tạo lại.
- [ ] **C4. Kiểm tra:** App ID `com.fotobro.app` hiện trong danh sách,
  khớp `PRODUCT_BUNDLE_IDENTIFIER` trong `project.pbxproj`.

## 6. CloudKit container `iCloud.com.fotobro.app` (Việt tự làm — 1 lần)

Nấc 2 đồng bộ mã hoá đã chốt dùng **CloudKit làm chính** (23:43 19/11).
Ở v1 code chỉ để trạng thái `not-configured` (`fotobro-config.js`:
`cloudKitContainer: 'iCloud.com.fotobro.app'`), **chưa đồng bộ thật** —
nhưng tạo container trước để khỏi sửa App ID/workflow sau.

- [ ] **D1.** Trong Apple Developer → Identifiers → iCloud Containers
  → `+` → Identifier `iCloud.com.fotobro.app` → Register.
- [ ] **D2.** Gắn container vào App ID `com.fotobro.app` (mục iCloud
  capability → chọn container vừa tạo).
- [ ] **D3.** (Sau này, Nấc 2) Tạo CloudKit schema theo
  `~/workspace/fotobro-scale/src/cloudkit-schema.json` — **không làm ở v1**.

## 7. Chứng chỉ + Provisioning Profile + API Key (Việt tự làm — Windows được)

Chi tiết từng lệnh OpenSSL xem `BUILD-GUIDE.md` §3–§4 (chỉ sửa repo
thành `fotobro` theo §1b).

- [ ] **E1. CSR trên Windows:** cài OpenSSL → tạo `fotobro.key` +
  `fotobro.csr`. **Giữ `fotobro.key` cẩn thận, không đẩy lên GitHub.**
- [ ] **E2. Distribution Certificate:** Developer → Certificates → `+`
  → Apple Distribution → tải `.csr` lên → tải `.cer` về → đổi thành
  `.p12` (đặt mật khẩu, ghi nhớ — mật khẩu này là secret
  `IOS_DIST_CERT_PASSWORD`).
- [ ] **E3. Provisioning Profile:** Profiles → `+` → App Store Connect
  → App ID `com.fotobro.app` → cert vừa tạo → **Profile Name đúng
  `FotoBro App Store`** (workflow đang ghi đúng tên này trong
  ExportOptions.plist — đặt tên khác thì phải sửa workflow cho khớp).
  Tải `.mobileprovision` về.
- [ ] **E4. App Store Connect API Key:** App Store Connect → Users and
  Access → Integrations → Generate API Key → Name `FotoBro CI`,
  Access **App Manager** → tải file `.p8` về **ngay** (chỉ tải 1 lần).
  Ghi lại **Issuer ID** (UUID) + **Key ID** (vd `ABCDE12345`).
- [ ] **E5. Team ID:** Developer → Membership → Team ID (10 ký tự).
- [ ] ⚠️ **Không đẩy `.p12` / `.key` / `.cer` / `.p8` / `.mobileprovision`
  lên GitHub, không gửi qua chat.** Chỉ dán base64 vào secrets (§8).

## 8. Tạo app trong App Store Connect + 6 secrets (Việt tự làm)

- [ ] **F1. Tạo app:** https://appstoreconnect.apple.com → My Apps →
  `+` → New App → Platform **iOS**, Name `FotoBro`, Primary Language
  **Vietnamese**, Bundle ID `com.fotobro.app`, SKU **`fotobro-001`**
  (không dùng `tro-ly-xeo-001` cũ), User Access Full Access → Create.
  App ở trạng thái Prepare for Submission.
- [ ] **F2. App Information:** tải App Icon 1024×1024 — file
  `AppIcon-1024.png` trong gói (đã kiểm chứng 1024×1024, RGB, không alpha).
- [ ] **F3. Pricing and Availability:** Price = **Free**, không tạo IAP
  (v1 miễn phí; thu phí Nấc 2/3 là việc sau, chỉ placeholder trong code).
- [ ] **F4. App Privacy:** khai **Data Not Collected** (khớp PRIVACY.md).
  Privacy Policy URL: dán URL ở §4-B3.
  Support URL: dán URL ở §4-B4.
- [ ] **F5. Secrets — repo `Hoangviet1397/fotobro` → Settings → Secrets
  and variables → Actions → New repository secret.** Tạo đủ 6 secret
  workflow thực sự đọc (tên khớp từng ký tự):

| Secret | Lấy ở đâu | Cách tạo giá trị |
|---|---|---|
| `IOS_DIST_CERT_P12_BASE64` | §7-E2, file `fotobro.p12` | PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("fotobro.p12"))` |
| `IOS_DIST_CERT_PASSWORD` | §7-E2, mật khẩu Việt đặt cho .p12 | Dán đúng mật khẩu đó |
| `APP_STORE_CONNECT_API_KEY_ID` | §7-E4, Key ID | Dán chuỗi Key ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | §7-E4, Issuer ID | Dán UUID Issuer ID |
| `APP_STORE_CONNECT_API_KEY_BASE64` | §7-E4, file `.p8` | base64 của file .p8 (giữ nguyên cả dòng BEGIN/END khi base64) |
| `APPLE_TEAM_ID` | §7-E5 | Dán Team ID 10 ký tự |

  Secret dự phòng (không bắt buộc, workflow hiện không đọc):
  `IOS_PROVISIONING_PROFILE_BASE64` — base64 của file `.mobileprovision`
  (§7-E3), để sẵn phòng khi Apple đổi quyền API tải profile.

## 9. Chạy build iOS qua GitHub Actions (Muse bấm chạy / Việt bấm chạy)

- [ ] **G1. Điều kiện chạy:** §1a đã sửa xong (Xcode 26), §3 đã push,
  §8 đã đủ 6 secrets, App ID + profile + API key đã có.
- [ ] **G2.** Repo → Actions → **"Build FotoBro iOS"** → Run workflow →
  chọn "Đẩy lên TestFlight luôn: **true**" (lần đầu nên để `true`).
- [ ] **G3.** Chờ 10–20 phút (lần đầu tải Xcode, npm, archive). Đọc log
  theo thứ tự: `npm ci` → `npx cap sync ios` (kiểm tra `public/` đã
  đồng bộ bản mới chưa) → import cert → tải profile → archive →
  export .ipa → upload TestFlight.
- [ ] **G4. Lỗi hay gặp nhất:** bước Archive lỗi
  `No such module 'CapacitorCommunitySpeechRecognition'` = plugin giọng
  nói SPM (RISKS.md §4) → xử lý theo quyết định mic của agent chính
  (đã sửa / đã dời v1.1), không cố chạy lại y nguyên.
- [ ] **G5. Build xong:** App Store Connect → TestFlight → thấy build
  1.0 (1) → Internal Testing → thêm Xèo (Apple ID của Xèo) làm
  Internal Tester → Xèo mở app **TestFlight** trên iPhone → cài bản
  test.

## 10. Checklist TestFlight trước khi Submit (Việt + Xèo thử trên iPhone thật)

Lấy từ RISKS.md §10, cộng thêm các mục mới của v1:

- [ ] Mở app lần đầu: màn Hôm nay hiện, không màn hình trắng (cả sáng + tối).
- [ ] Nhập JSON sao lưu từ bản web → đủ job + thu chi (ảnh trang chủ phải chọn lại — không chuyển được, xem RISKS.md §5).
- [ ] Đăng nhập Google 1 chạm → Lịch/Gmail/Danh bạ/Drive hiện (nếu Client ID chung đã có; nếu chưa có thì nút báo "chưa sẵn sàng" và app vẫn chạy).
- [ ] Nhập từ Lịch iPhone → sự kiện 30 ngày tới thành job.
- [ ] Nút mic (nếu còn ở v1): nói "thêm job…" → hiện khung xác nhận → job mới trong pipeline.
- [ ] Nhắc lịch: job chụp ngày mai → khoá app → tới giờ nhắc → thông báo hiện.
- [ ] Khoá app: Face ID + PIN → tắt app → mở lại.
- [ ] Pipeline: nhảy thẳng tới bước bất kỳ; Chốt cọc ghi cọc; Đã giao nhắc thu nốt; Xong khi còn thiếu tiền phải cảnh báo; huỷ job rồi khôi phục được; job kẹt hiện cảnh báo.
- [ ] Cá nhân hoá: đổi màu chủ đề / logo / ngôn ngữ Việt–Anh / tiền tệ VND–USD → tắt app mở lại vẫn giữ.
- [ ] Tắt mạng (chế độ máy bay) → app vẫn mở và dùng được.
- [ ] Nút Cập nhật (banner SW): không hiện trong app native.
- [ ] Chia sẻ báo cáo / sao lưu bằng Share sheet iOS.
- [ ] Khi TestFlight ổn: App Store Connect → App Store → Prepare for
  Submission → nhập mô tả/screenshots theo APP-STORE-LISTING.md →
  Submit for Review (Apple duyệt thường 1–3 ngày).

## 11. Còn chờ (không chặn đẩy + build, chặn Submit / chặn tính năng)

| Việc | Trạng thái | Ai làm |
|---|---|---|
| Client ID Google chung cho FotoBro + xác minh Google (sensitive scopes: Gmail, Calendar, Drive) | ⏳ Chưa có — `fotobro-config.js` đang để trống. Không có thì nút Google báo "chưa sẵn sàng", app vẫn chạy. | Việt/Muse làm 1 lần trên Google Cloud; xác minh Google mất vài tuần, cần Privacy Policy URL + video demo |
| Email hỗ trợ `support@fotobro.app` | ⏳ Chưa có. `fotobro.com` đã có chủ (2008–2027); `fotobro.app` chưa xác minh trống hay không; dự phòng `fotobroapp.com`, `getfotobro.com` còn trống. Đề xuất iCloud+ Custom Domain ~$20/năm. | Việt mua domain (cần phê duyệt giá), rồi tạo mail trên iPhone |
| Screenshots 6.7" (1290×2796) + 6.5" (1242×2688) | ⏳ Chỉ chụp được khi có bản TestFlight chạy được | Việt/Xèo chụp trên iPhone thật |
| Quyết định mic v1 (giữ hay dời v1.1) | ⏳ Agent chính đang thử sửa SPM tối đa 2 lần | Agent chính báo kết quả |
| Thu phí Nấc 2/3 (CloudKit sync / team) | ⏳ Chưa có giá, chưa có chu kỳ — chỉ placeholder trong code, không bật IAP | Việt chốt giá + chu kỳ sau v1 |
| Category phụ Photo & Video hay Productivity | ⏳ APP-STORE-LISTING.md đề xuất Photo & Video, chưa chốt | Việt chốt lúc tạo app (§8-F1) |
