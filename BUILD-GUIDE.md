# Hướng dẫn build .ipa FotoBro — qua GitHub Actions (không cần Mac)

> Mục tiêu: từ gói local này → bản TestFlight cho Xèo thử trên iPhone thật.
> Việt dùng Windows + iPhone, không có Mac, nên **mọi bước build đều chạy
> trên GitHub Actions (macOS runner)**. Việt chỉ làm các bước 1–4 bằng tay
> trên web (Apple Developer / App Store Connect / GitHub), còn lại máy làm.
> Ngày soạn: 19/11/2026, cập nhật 20/11/2026 (FotoBro iOS v2.0). Bundle ID: `com.fotobro.app`. Repo: `Hoangviet1397/fotobro` (mới, public, nhánh `main`).

## 0. Toàn cảnh 6 bước

```
[1] Việt:  tạo App ID (Bundle ID)        → Apple Developer
[2] Việt:  tạo app trong App Store Connect + tải icon 1024
[3] Việt:  tạo Distribution Certificate + Provisioning Profile
[4] Việt:  tạo App Store Connect API Key (.p8)
[5] Việt:  dán 6 secrets vào repo GitHub fotobro
[6] Máy:   chạy workflow .github/workflows/ios-build.yml → .ipa → TestFlight
```

Thứ tự quan trọng: bước 3 cần bước 1 xong (profile gắn với App ID);
bước 5 cần bước 3 + 4 xong (secrets lấy từ đó).

## 1. Tạo App ID — Apple Developer

1. Đăng nhập https://developer.apple.com/account bằng đúng Apple ID đã
   đăng ký Apple Developer Program (19/11/2026).
2. Vào **Certificates, Identifiers & Profiles → Identifiers → +**.
3. Chọn **App IDs → App**, bấm Continue.
4. Description: `FotoBro` (tên gợi nhớ, không hiện cho người dùng).
5. Bundle ID → chọn **Explicit**, nhập đúng: `com.fotobro.app`
   (khớp với `PRODUCT_BUNDLE_IDENTIFIER` trong `ios/App/App.xcodeproj`
   của gói này — sai một ký tự là build không ký được).
6. Capabilities: **không tick thêm gì** ở v1. (Push Notifications KHÔNG
   cần — nhắc lịch dùng Local Notifications, chạy trên máy, không qua
   server Apple. **iCloud + Sign in with Apple** chỉ tick khi Nấc 2
   CloudKit bật thật (v1 chỉ placeholder, xem RISKS.md §11) — sửa được
   App ID sau, không cần tạo lại App ID. Associated Domains KHÔNG cần
   ở v1 — passkey dùng PIN dự phòng, xem RISKS.md mục 3.)
7. Register.

## 2. Tạo app trong App Store Connect

1. Đăng nhập https://appstoreconnect.apple.com → **My Apps → + → New App**.
2. Điền theo APP-STORE-LISTING.md:
   - Platform: **iOS**. Name: `FotoBro`. Primary Language:
     **Vietnamese**. Bundle ID: chọn `com.fotobro.app` (vừa tạo ở
     bước 1). SKU: `fotobro-001`. User Access: Full Access.
3. Bấm Create. App sẽ ở trạng thái **Prepare for Submission**.
4. Vào app → **App Information**: tải **App Icon 1024×1024** — file
   `AppIcon-1024.png` trong gói này (đã render từ `icon.svg`, kiểm chứng
   1024×1024, RGB, không alpha — đúng chuẩn Apple).
5. Vào **Pricing and Availability**: Price = **Free**, không tạo IAP.
6. Vào **App Privacy**: khai **Data Not Collected** (khớp PRIVACY.md).
   Privacy Policy URL: dán URL đã host theo PRIVACY.md — **phải host
   xong mới làm được bước này** (xem PRIVACY.md đầu file).
7. **Agreements, Tax, and Banking** (mục riêng trong App Store Connect):
   vì app miễn phí và không có IAP nên chỉ cần đồng ý **Paid Applications
   Agreement**? Không — app Free không cần điền thuế / ngân hàng. Chỉ cần
   mục Agreements không còn báo đỏ. (Nếu sau này thêm IAP mới cần điền.)

## 3. Distribution Certificate + Provisioning Profile

Làm trên máy Windows của Việt được — không cần Mac, chỉ cần trình duyệt
và một lần tạo file `.p12` (chứa private key). Cách làm không cần Mac:

**3a. Tạo Certificate Signing Request (.certSigningRequest) trên Windows**
- Cách dễ nhất: dùng **OpenSSL cho Windows** (cài 1 lần từ
  https://slproweb.com/products/Win32OpenSSL.html) rồi chạy:
  ```
  openssl req -new -newkey rsa:2048 -nodes -keyout fotobro.key -out fotobro.csr -subj "/emailAddress=<email của Việt>/CN=FotoBro/C=VN"
  ```
  Giữ file `fotobro.key` cẩn thận — mất key này là phải tạo lại cert.
- (Cách khác nếu Việt có iPhone + máy Mac mượn: Keychain Access → Certificate
  Assistant → Request a Certificate — nhưng hướng Windows + OpenSSL là đủ.)

**3b. Tạo Distribution Certificate**
1. Developer → **Certificates → + → Apple Distribution** → Continue.
2. Tải file `fotobro.csr` lên → Download file `.cer` về.
3. Chuyển `.cer` + `.key` thành `.p12` (GitHub Actions cần định dạng này):
   ```
   openssl x509 -in fotobro.cer -inform DER -out fotobro.pem
   openssl pkcs12 -export -inkey fotobro.key -in fotobro.pem -out fotobro.p12
   ```
   Đặt mật khẩu cho .p12 và ghi nhớ — mật khẩu này là secret
   `IOS_DIST_CERT_PASSWORD` ở bước 5.
   ⚠️ **Không đẩy .p12 / .key / .cer lên GitHub, không gửi qua chat.**
   Chỉ dán nội dung base64 của .p12 vào GitHub Secrets (bước 5).

**3c. Tạo Provisioning Profile (App Store)**
1. Developer → **Profiles → + → App Store Connect** (mục Distribution).
2. App ID: chọn `com.fotobro.app`. Certificate: chọn cert vừa tạo.
3. Profile Name: đặt đúng **`FotoBro App Store`** (workflow mẫu
   `ios-build.yml` đang ghi đúng tên này trong ExportOptions.plist — nếu
   đặt tên khác thì sửa lại tên trong file workflow cho khớp).
4. Download file `.mobileprovision` về.

## 4. Tạo App Store Connect API Key (.p8)

Key này để GitHub Actions tự tải profile + tự đẩy .ipa lên TestFlight,
không cần mật khẩu Apple ID của Việt.

1. App Store Connect → **Users and Access → Integrations → App Store
   Connect API → Generate API Key**.
2. Name: `FotoBro CI`. Access: chọn **App Manager** (đủ quyền tải
   profile + đẩy TestFlight; đừng chọn Admin nếu không cần).
3. Bấm Generate → **tải file `.p8` về NGAY** (chỉ tải được 1 lần, mất là
   phải tạo key mới). Ghi lại 3 thứ hiện trên màn hình:
   - **Issuer ID** (dạng UUID),
   - **Key ID** (dạng `ABCDE12345`),
   - file `.p8` (bắt đầu bằng `-----BEGIN PRIVATE KEY-----`).
4. ⚠️ Không đẩy file .p8 lên GitHub. Chỉ dán base64 của nó vào secret.

## 5. Secrets cần dán vào GitHub (repo Hoangviet1397/fotobro)

> **Cập nhật 20/11/2026 (00:26–00:37): Việt đã tự tạo xong App ID
> `com.fotobro.app` (iCloud + CloudKit, Sign in with Apple), app FotoBro
> trên App Store Connect (SKU `fotobro-001`, tiếng Việt, Prepare for
> Submission) và API key "FotoBro CI" (Issuer ID
> `af887d83-2c8b-4321-82c7-dc23b01d4d3f`, Admin). ⚠️ **Key đầu Key ID
> `857QQB9JSB` đã bị thu hồi 00:39–00:43 20/11 (lệnh dừng khôi phục tới
> muộn) — key mới là **`Q522F2AD5V`**, Issuer ID không đổi. File `.p8` mới
> `AuthKey_Q522F2AD5V.p8` chưa tải xong — hộp thoại Download đang mở trên
> trình duyệt, chờ Việt bấm tải và sao lưu ra chỗ an toàn. File `.p8` cũ
> thuộc key đã thu hồi nên KHÔNG dùng được nữa; khi dán secret phải dùng
> key mới `Q522F2AD5V`.
> Còn thiếu: **Distribution certificate + provisioning profile** (bước 3)
> rồi mới dán đủ 6 secret dưới đây.

Vào repo → **Settings → Secrets and variables → Actions → New repository
secret**. Tạo đủ 6 secret bắt buộc sau (tên phải khớp đúng từng ký tự với tên
trong `.github/workflows/ios-build.yml`) + 1 secret tuỳ chọn (`IOS_PROVISIONING_PROFILE_NAME`):

| Secret | Lấy ở đâu | Cách tạo giá trị |
|---|---|---|
| `IOS_DIST_CERT_P12_BASE64` | Bước 3b, file `fotobro.p12` | Trên Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("fotobro.p12"))` rồi copy chuỗi ra. Trên Linux/Mac: `base64 -w0 fotobro.p12`. |
| `IOS_DIST_CERT_P12_PASSWORD` | Bước 3b, mật khẩu Việt đặt cho .p12 | Dán đúng mật khẩu đó. **Lưu ý 20/11: bảng cũ ghi sai tên `IOS_DIST_CERT_PASSWORD` — tên đúng workflow đọc là `IOS_DIST_CERT_P12_PASSWORD`.** |
| `IOS_PROVISIONING_PROFILE_BASE64` | Bước 3c, file `.mobileprovision` | base64 như trên (file này cũng có thể lấy từ workflow khác, nhưng ở đây workflow dùng API key để tải — secret này là **dự phòng**, workflow mẫu hiện tại dùng API key để tải profile nên có thể để trống? KHÔNG — giữ lại để dùng khi API tải lỗi. Xem ghi chú dưới bảng.) |
| `APP_STORE_CONNECT_API_KEY_ID` | Bước 4, Key ID | Dán chuỗi Key ID (vd `ABCDE12345`). |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Bước 4, Issuer ID | Dán UUID Issuer ID. |
| `APP_STORE_CONNECT_API_KEY_BASE64` | Bước 4, file `.p8` | base64 của file .p8 (giữ nguyên cả dòng BEGIN/END khi base64). |
| `APPLE_TEAM_ID` | Developer → Membership (góc trên, "Team ID", 10 ký tự) | Dán Team ID — Việt đã có: `A64C927S45` (tạo 20/11). |
| `IOS_PROVISIONING_PROFILE_NAME` *(tuỳ chọn)* | Bước 3c, tên profile Việt đặt | Tên profile App Store (mặc định `FotoBro App Store` nếu không đặt secret này). Workflow đọc secret này để ghi vào ExportOptions.plist. |

Ghi chú về `IOS_PROVISIONING_PROFILE_BASE64`: workflow mẫu dùng action
`download-provisioning-profiles` (tải bằng API key) nên secret này hiện
không được workflow đọc — nó là **dự phòng** cho trường hợp Apple đổi
quyền API. Không cần tạo cũng chạy được; nhưng nên tạo sẵn để khỏi lúng
túng khi cần. (Nếu Việt muốn workflow dùng đúng file profile này thay vì
tải qua API thì báo lại, mình sửa workflow.)

## 6. Đưa gói này lên repo rồi chạy build

1. Đẩy **toàn bộ thư mục `fotobro-ios-v1/` này làm repo root** của
   `Hoangviet1397/fotobro` — **nhưng KHÔNG copy `node_modules/`** (đã có
   trong .gitignore) và không copy file secret nào (`.p12`, `.key`,
   `.cer`, `.p8`, `.mobileprovision` — cũng đã có trong .gitignore).
   Cấu trúc repo root sẽ là:
   ```
   fotobro/
   ├── package.json, package-lock.json, capacitor.config.ts
   ├── www/                      ← app FotoBro iOS v2.0 (index.html + bridge + config)
   ├── ios/                      ← Xcode project (đã sync)
   ├── PRIVACY.md, APP-STORE-LISTING.md, BUILD-GUIDE.md, RISKS.md
   ├── GOOGLE-SETUP.md, PUSH-READY.md, QA-REPORT.md, APP-STORE-READY.md
   ├── AppIcon-1024.png, assets/
   └── .github/workflows/ios-build.yml   ← macos-26 + Xcode 26.5
   ```
   Workflow chạy `npm ci` + `npx cap sync ios` ở repo root, GitHub Pages
   host `PRIVACY.html` cũng ở root. Không đẩy bản web cũ vào repo này;
   repo `tro-ly-xeo` của Xèo giữ nguyên, không động vào.
   ⚠️ **Chưa đẩy gì lên GitHub trong gói này** (theo yêu cầu: chỉ chuẩn
   bị local để Việt duyệt). Khi Việt duyệt xong, việc đẩy lên repo cần
   một lần phê duyệt push riêng.
2. Chú ý: `www/index.html` là app iOS v2.0 (base web FotoBro v2.6 đã tối
   giản + sửa cho native). Mỗi lần sửa `www/` thì chạy `npx cap sync ios`
   để đồng bộ sang `ios/App/App/public/` trước khi build. Trên Linux
   chạy được lệnh này (chỉ copy file, không cần Xcode).
3. Vào repo → **Actions → "Build FotoBro iOS" → Run workflow** →
   chọn "Đẩy lên TestFlight luôn: true".
4. Chờ workflow chạy (lần đầu 10–20 phút: tải Xcode 26.5, npm,
   archive). Nếu đỏ ở bước Archive, đọc log theo RISKS.md mục 4 và 11
   (lỗi hay gặp: chọn Xcode không có trên runner, thiếu secret, thiếu
   profile). Plugin giọng nói đã gỡ khỏi v1 nên không còn lỗi SPM
   `No such module 'CapacitorCommunitySpeechRecognition'`.
5. Build xong: vào App Store Connect → **TestFlight** → thấy build 1.0
   (1) → thêm **Internal Testing**: thêm Xèo (Apple ID của Xèo) làm
   Internal Tester → Xèo mở app **TestFlight** trên iPhone → cài bản
   test → dùng thử 1 tuần, ghi lại lỗi.
6. Khi TestFlight ổn: App Store Connect → **App Store → Prepare for
   Submission** → nhập mô tả / screenshots theo APP-STORE-LISTING.md →
   **Submit for Review**. Apple duyệt thường 1–3 ngày (lần đầu có thể
   lâu hơn).

## 7. Trên máy Mac (nếu sau này có Mac / mượn Mac)

```
cd fotobro
npm ci
npx cap sync ios
npx cap open ios        # mở Xcode: chọn Team, chạy trên iPhone thật
```
Trong Xcode: **Signing & Capabilities** → chọn Team của Việt, để
"Automatically manage signing" cho bản chạy thử trên máy; bản đẩy
TestFlight qua CI vẫn dùng manual signing như workflow (không đổi).
