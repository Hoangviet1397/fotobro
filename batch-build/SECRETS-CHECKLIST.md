# Secrets Checklist — Build iOS FotoBro v1 qua GitHub Actions

- **App:** FotoBro iOS v1
- **Bundle ID:** `com.fotobro.app`
- **Repo:** `Hoangviet1397/fotobro` (nhánh `main`)
- **Ngày soạn:** 20/11/2026
- **Nguồn tên secret:** `BUILD-GUIDE.md` §5, đối chiếu với file workflow `.github/workflows/ios-build.yml`
  (workflow chạy trên runner `macos-26`, Xcode 26.5)
- **⚠️ Không có giá trị thật nào của secret trong file này.** File này chỉ ghi
  tên, công dụng, cách tạo và cách xoay/thay. Giá trị thật chỉ tồn tại ở hai
  nơi: (1) bản gốc do Việt giữ trên máy của Việt, (2) GitHub Secrets của repo
  (đã mã hoá, không ai xem lại được giá trị sau khi dán).

## 0. Làm rõ con số: 6 hay 7 secret?

`BUILD-GUIDE.md` §5 ghi "6 secrets" nhưng bảng trong đó liệt kê **7 dòng**.
Đối chiếu với workflow thì con số đúng là **6 secret được workflow đọc**:

| # | Secret (đúng từng ký tự) | Workflow đọc ở bước nào |
|---|---|---|
| 1 | `IOS_DIST_CERT_P12_BASE64` | Import Distribution Certificate (.p12) |
| 2 | `IOS_DIST_CERT_PASSWORD` | Import Distribution Certificate (.p12) |
| 3 | `APP_STORE_CONNECT_API_KEY_ID` | Tải Provisioning Profile + Đẩy lên TestFlight |
| 4 | `APP_STORE_CONNECT_API_ISSUER_ID` | Tải Provisioning Profile + Đẩy lên TestFlight |
| 5 | `APP_STORE_CONNECT_API_KEY_BASE64` | Tải Provisioning Profile + Đẩy lên TestFlight |
| 6 | `APPLE_TEAM_ID` | Tạo ExportOptions.plist (bước Export .ipa) |

Secret thứ 7 trong bảng của BUILD-GUIDE — `IOS_PROVISIONING_PROFILE_BASE64`
(base64 của file `.mobileprovision`) — **workflow hiện tại KHÔNG đọc**.
Nó chỉ là dự phòng cho trường hợp Apple đổi quyền API tải profile
(BUILD-GUIDE §5, ghi chú dưới bảng; `PUSH-READY.md` §7 xác nhận điều này).
Xem mục 8 cuối file. Tạo đủ 6 secret trên là đủ để build chạy; secret dự
phòng nên tạo sẵn nhưng thiếu nó **không làm build đỏ**.

## 1. Cách dán secret vào GitHub (chung cho cả 6)

1. Vào repo `Hoangviet1397/fotobro` → **Settings → Secrets and variables
   → Actions → New repository secret**.
2. **Name:** dán đúng tên trong bảng trên, đúng từng ký tự (chữ hoa/thường,
   dấu gạch dưới). Sai một ký tự là workflow đọc ra rỗng.
3. **Secret:** dán đúng giá trị đã tạo theo hướng dẫn ở từng mục dưới.
   Với các secret base64: dán toàn bộ chuỗi một dòng, không thêm khoảng
   trắng/xuống dòng ở đầu/cuối.
4. Bấm **Add secret**. GitHub không cho xem lại giá trị sau khi lưu —
   dán sai chỉ có cách dán lại (Update), không có cách kiểm tra.
5. Tuyệt đối **không** commit/push các file gốc (`.p12`, `.key`, `.csr`,
   `.cer`, `.p8`, `.mobileprovision`) lên repo, không gửi qua chat/email.
   Các file này đã có trong `.gitignore` của gói (BUILD-GUIDE §6).

## 2. Ai giữ cái gì

| Bên | Giữ |
|---|---|
| **Việt (người dùng) — duy nhất** | Toàn bộ bản gốc: file `fotobro.key`, `fotobro.p12` + mật khẩu của nó, file `.p8`, Key ID, Issuer ID, Team ID. Chỉ Việt đăng nhập Apple Developer / App Store Connect để tạo và thu hồi các thứ này. |
| **GitHub Secrets (repo `fotobro`)** | Bản sao đã mã hoá của 6 giá trị trên, chỉ workflow mới đọc được lúc chạy. |
| **Muse / Claude / bất kỳ ai khác** | **Không giữ, không được gửi, không được nhờ giữ** bất kỳ giá trị secret nào, kể cả qua chat, file, hay GitHub Issue/PR. Cần xoay secret thì Việt tự làm theo mục 7, hoặc hướng dẫn bằng lời mà không lộ giá trị. |

> Nguyên tắc: secret chỉ đi theo một chiều — từ máy của Việt → GitHub
> Secrets. Không có chiều ngược lại, không có bản sao thứ ba.

---

## 3. Từng secret

### 3.1 `IOS_DIST_CERT_P12_BASE64`

- **Dùng để làm gì:** Chứa chứng chỉ Distribution của Apple kèm private key,
  ở dạng base64 của file `fotobro.p12`. Workflow dùng nó ở bước
  **Import Distribution Certificate (.p12)**
  (`apple-actions/import-codesign-certs@v3`, tham số `p12-file-base64`)
  để nhập chứng chỉ vào keychain của runner macOS, nhờ đó `xcodebuild
  archive` mới ký được app bằng chứng chỉ Distribution.
- **Ai giữ:** Việt giữ file gốc `fotobro.p12` (và file `fotobro.key` đã
  dùng để tạo ra nó — mất key là phải tạo lại cert từ đầu).
- **Cách tạo:**
  1. Tạo CSR trên Windows bằng OpenSSL (BUILD-GUIDE §3a):
     `openssl req -new -newkey rsa:2048 -nodes -keyout fotobro.key -out fotobro.csr -subj "/emailAddress=<email của Việt>/CN=FotoBro/C=VN"`
  2. Developer → Certificates → **+ → Apple Distribution** → tải CSR lên
     → tải file `.cer` về (BUILD-GUIDE §3b).
  3. Chuyển `.cer` + `.key` thành `.p12`, đặt mật khẩu cho `.p12`
     (mật khẩu này chính là secret 3.2):
     `openssl x509 -in fotobro.cer -inform DER -out fotobro.pem`
     `openssl pkcs12 -export -inkey fotobro.key -in fotobro.pem -out fotobro.p12`
  4. Lấy base64 của file `.p12` để dán vào secret — trên Windows
     (PowerShell):
     `[Convert]::ToBase64String([IO.File]::ReadAllBytes("fotobro.p12"))`;
     trên Linux/Mac: `base64 -w0 fotobro.p12`.
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - **Lộ** (file `.p12`/`.key` hoặc chuỗi base64 lọt ra ngoài): vào
    Developer → Certificates → **Revoke** (thu hồi) chứng chỉ cũ
    **ngay** — chỉ xoá secret trên GitHub là chưa đủ, vì chứng chỉ cũ
    vẫn còn hiệu lực cho tới khi bị thu hồi. Sau đó làm lại từ đầu
    (§3a–3b: CSR mới → cert mới → `.p12` mới), rồi cập nhật secret này
    (và secret 3.2 nếu đặt mật khẩu mới).
  - **Hết hạn / bị thu hồi:** kiểm tra ngày hết hạn trong Developer →
    Certificates; tạo chứng chỉ mới theo các bước trên rồi cập nhật
    secret này. Lưu ý: chứng chỉ mới thì Provisioning Profile cũ gắn
    với cert cũ cũng phải tạo lại/chọn lại cert mới (BUILD-GUIDE §3c).
  - Cập nhật: repo → Settings → Secrets and variables → Actions →
    bấm secret này → **Update**, dán base64 mới. Không tạo secret
    trùng tên.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Bước **Import Distribution Certificate (.p12)** đỏ ngay đầu workflow.
  - Log báo không nhập được chứng chỉ / chuỗi base64 rỗng hoặc không
    hợp lệ (ví dụ secret chưa tạo, dán thiếu ký tự, dính khoảng trắng/
    xuống dòng).
  - Nếu bước này qua nhưng archive/export vẫn lỗi ký (không tìm thấy
    signing certificate / không ký được): cũng nghi ngờ secret này
    trước tiên (kèm secret 3.2).

### 3.2 `IOS_DIST_CERT_PASSWORD`

- **Dùng để làm gì:** Mật khẩu mở file `.p12` ở mục 3.1. Workflow dùng
  nó ở cùng bước Import Distribution Certificate
  (tham số `p12-password`). Không có mật khẩu đúng thì runner không mở
  được `.p12` dù chuỗi base64 đúng.
- **Ai giữ:** Chỉ Việt giữ (mật khẩu do Việt đặt lúc chạy lệnh
  `openssl pkcs12 -export`).
- **Cách tạo:** Đặt lúc xuất file `.p12` (BUILD-GUIDE §3b). Ghi nhớ
  mật khẩu này — quên là phải xuất lại `.p12` mới từ `.cer` + `.key`.
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - **Lộ:** xuất lại `.p12` mới với mật khẩu mới từ `.cer` + `.key`
    còn giữ, rồi cập nhật **cả hai** secret 3.1 (base64 của file `.p12`
    mới) và 3.2 (mật khẩu mới). Chỉ đổi mật khẩu trên GitHub mà không
    xuất lại `.p12` thì hai secret lệch nhau, build vẫn đỏ.
  - **Quên mật khẩu:** không có cách khôi phục — xuất lại `.p12` mới
    (cần còn file `.key`; mất `.key` thì làm lại toàn bộ từ §3a).
  - Secret này **không có hạn sử dụng riêng** — chỉ thay khi lộ/quên/
    xuất lại `.p12`.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Bước **Import Distribution Certificate (.p12)** đỏ, log báo sai
    mật khẩu / không mở được file `.p12` (trong khi base64 có thể vẫn
    đúng). Đây là lỗi hay gặp nhất khi hai secret 3.1 và 3.2 lệch nhau.

### 3.3 `APP_STORE_CONNECT_API_KEY_ID`

- **Dùng để làm gì:** Key ID của App Store Connect API Key — định danh
  key nào được dùng. Workflow dùng nó ở hai bước:
  **Tải Provisioning Profile** (`download-provisioning-profiles`, tham số
  `api-key-id`) và **Đẩy lên TestFlight** (`upload-testflight-build`,
  tham số `api-key-id`). Không có nó, runner không tải được profile và
  không đẩy được `.ipa` lên TestFlight.
- **Ai giữ:** Việt giữ — ghi lại Key ID (dạng `ABCDE12345`, ví dụ trong
  BUILD-GUIDE) lúc tạo key. Key ID vẫn xem lại được trên màn hình sau
  khi tạo (khác với file `.p8` chỉ tải được một lần).
- **Cách tạo:** App Store Connect → **Users and Access → Integrations →
  App Store Connect API → Generate API Key** (BUILD-GUIDE §4). Name:
  `FotoBro CI`, Access: **App Manager** (đủ quyền tải profile + đẩy
  TestFlight; không chọn Admin nếu không cần). Ghi lại Key ID hiện trên
  màn hình, dán nguyên chuỗi vào secret.
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - Key này đi theo **bộ ba** với 3.4 và 3.5 — xoay là xoay cả bộ:
    vào Users and Access → Integrations → **Revoke** key cũ, bấm
    Generate API Key mới, rồi cập nhật cả ba secret 3.3, 3.4, 3.5
    cùng lúc. Chỉ đổi một trong ba thì bộ ba lệch nhau.
  - **Lộ:** thu hồi key cũ ngay rồi tạo key mới như trên.
  - **Hết hạn:** BUILD-GUIDE không ghi hạn cho API key; key chỉ mất
    hiệu lực khi bị thu hồi (hoặc Việt xoá). Nếu Apple báo key không
    còn hiệu lực thì tạo key mới theo cách trên.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Bước **Tải Provisioning Profile** đỏ: không tải được profile,
    lỗi xác thực API / key không hợp lệ.
  - Build/archive có thể vẫn qua (ký bằng cert/profile đã có sẵn
    trên runner — không chắc), nhưng bước **Đẩy lên TestFlight** đỏ:
    không đẩy được `.ipa` dù file `.ipa` đã build xong và đã lưu
    làm artifact.

### 3.4 `APP_STORE_CONNECT_API_ISSUER_ID`

- **Dùng để làm gì:** Issuer ID (dạng UUID) — định danh tổ chức/team phát
  hành key API. Workflow dùng nó cùng bộ ba với 3.3 và 3.5 ở hai bước
  **Tải Provisioning Profile** (`issuer-id`) và **Đẩy lên TestFlight**
  (`issuer-id`). Sai Issuer ID thì API key không được Apple chấp nhận
  dù Key ID và file `.p8` đúng.
- **Ai giữ:** Việt giữ — ghi lại Issuer ID hiện trên màn hình lúc tạo
  key (BUILD-GUIDE §4).
- **Cách tạo:** Tạo cùng lúc với key ở mục 3.3 (cùng màn hình Generate
  API Key). Dán nguyên chuỗi UUID vào secret, không thêm khoảng trắng.
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - Xoay cùng bộ ba với 3.3 và 3.5 (xem mục 3.3). Lưu ý: Issuer ID gắn
    với tài khoản/tổ chức nên khi tạo key mới Issuer ID thường **giữ
    nguyên** — vẫn kiểm tra lại trên màn hình tạo key mới và cập nhật
    nếu thấy khác, đừng giả định.
  - **Lộ:** bản thân Issuer ID không phải là bí mật mạnh như file
    `.p8`, nhưng đã lộ bộ ba thì thu hồi key cũ và tạo bộ mới cho
    chắc.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Giống mục 3.3: bước **Tải Provisioning Profile** đỏ trước, bước
    **Đẩy lên TestFlight** đỏ sau; log lỗi xác thực API. Nếu chỉ sai
    secret này mà 3.3 và 3.5 đúng, lỗi vẫn giống hệt lỗi sai key —
    phải kiểm tra cả ba secret cùng lúc, không đoán mò từng cái.

### 3.5 `APP_STORE_CONNECT_API_KEY_BASE64`

- **Dùng để làm gì:** Nội dung file `.p8` (private key của App Store
  Connect API Key) ở dạng base64. Workflow dùng nó ở hai bước
  **Tải Provisioning Profile** (`api-private-key`) và **Đẩy lên
  TestFlight** (`api-private-key`) để ký các yêu cầu gọi API App Store
  Connect. Đây là secret nhạy cảm nhất trong bộ ba API — ai có nó
  (kèm Key ID + Issuer ID) là có quyền App Manager trên App Store
  Connect của Việt.
- **Ai giữ:** Chỉ Việt giữ file gốc `.p8`. File này **chỉ tải được
  một lần** lúc tạo key (BUILD-GUIDE §4) — mất file mà chưa dán base64
  vào secret thì phải tạo key mới.
- **Cách tạo:**
  1. Tạo key như mục 3.3, **tải file `.p8` về ngay** khi tạo xong.
  2. Lấy base64 của file `.p8` (giữ nguyên cả dòng
     `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` khi
     base64 — BUILD-GUIDE §5): PowerShell
     `[Convert]::ToBase64String([IO.File]::ReadAllBytes("FotoBro_CI.p8"))`
     (thay bằng tên file `.p8` thực tế), hoặc `base64 -w0 <file>.p8`
     trên Linux/Mac.
  3. Dán chuỗi base64 vào secret. **Không đẩy file `.p8` lên GitHub.**
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - Xoay cùng bộ ba với 3.3 và 3.4 (thu hồi key cũ → tạo key mới →
    cập nhật cả ba secret cùng lúc).
  - **Lộ** (file `.p8` hoặc chuỗi base64 lọt ra ngoài): thu hồi key cũ
    **ngay** trong Users and Access → Integrations — chỉ xoá secret
    trên GitHub là chưa đủ, vì key cũ vẫn còn hiệu lực.
  - **Mất file `.p8`:** không khôi phục được — tạo key mới, cập nhật
    cả ba secret.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Bước **Tải Provisioning Profile** đỏ (lỗi xác thực API / private
    key không hợp lệ), và/hoặc bước **Đẩy lên TestFlight** đỏ.
  - Lỗi hay gặp khi dán sai: base64 bị cắt ngắn, dính xuống dòng, hoặc
    base64 của file đã bị sửa (ví dụ bỏ dòng BEGIN/END trước khi
    base64 — phải base64 nguyên file).

### 3.6 `APPLE_TEAM_ID`

- **Dùng để làm gì:** Team ID của Việt trên Apple Developer (10 ký tự,
  ví dụ `A1B2C3D4E5` trong BUILD-GUIDE). Workflow dùng nó ở bước
  **Tạo ExportOptions.plist** để ghi `<key>teamID</key>` cho lệnh
  `xcodebuild -exportArchive` — Apple dùng Team ID này để biết export
  `.ipa` thuộc team nào và đối chiếu với Provisioning Profile
  `FotoBro App Store`.
- **Ai giữ:** Việt giữ — lấy ở Developer → Membership (góc trên, mục
  "Team ID").
- **Cách tạo:** Không cần "tạo" — chỉ cần copy đúng 10 ký tự Team ID
  từ trang Membership và dán vào secret. Đây là secret ít nhạy cảm
  nhất trong 6 (nó là định danh team, không phải khoá bí mật), nhưng
  vẫn chỉ dán vào GitHub Secrets, không ghi vào code/repo.
- **Cách xoay/thay khi lộ hoặc hết hạn:**
  - **Gần như không bao giờ thay:** Team ID chỉ đổi khi Việt đổi
    Apple Developer team/tài khoản. Khi đó cập nhật secret này thành
    Team ID mới (kèm kiểm tra lại cả cert và profile của team mới).
  - **Lộ:** Team ID lộ ra ngoài không gây nguy hiểm trực tiếp như
    `.p12`/`.p8` — không cần thu hồi gì, chỉ cần không công khai nó
    trong code.
  - Secret này **không hết hạn**.
- **Dấu hiệu nhận biết khi thiếu / sai:**
  - Các bước trước (import cert, tải profile, archive) vẫn xanh,
    nhưng bước **Export .ipa** đỏ: `xcodebuild -exportArchive` lỗi —
    Team ID không khớp với profile/cert, hoặc không tìm thấy
    provisioning profile `FotoBro App Store` cho team đó.
  - Nếu Team ID sai mà profile trùng tên tồn tại ở team khác thì lỗi
    có thể báo "no provisioning profile found" — kiểm tra secret này
    trước khi nghi ngờ profile.

---

## 4. Bảng tổng hợp nhanh (để tick khi dán xong)

| # | Secret | Nguồn gốc | Đã dán ☐ |
|---|---|---|---|
| 1 | `IOS_DIST_CERT_P12_BASE64` | File `fotobro.p12` (BUILD-GUIDE §3b) | ☐ |
| 2 | `IOS_DIST_CERT_PASSWORD` | Mật khẩu Việt đặt cho `.p12` | ☐ |
| 3 | `APP_STORE_CONNECT_API_KEY_ID` | Màn hình tạo API Key (BUILD-GUIDE §4) | ☐ |
| 4 | `APP_STORE_CONNECT_API_ISSUER_ID` | Màn hình tạo API Key (BUILD-GUIDE §4) | ☐ |
| 5 | `APP_STORE_CONNECT_API_KEY_BASE64` | File `.p8` (BUILD-GUIDE §4) | ☐ |
| 6 | `APPLE_TEAM_ID` | Developer → Membership → Team ID | ☐ |

Kiểm chứng sau khi dán đủ 6: repo → **Actions → "Build FotoBro iOS" →
Run workflow** → chọn "Đẩy lên TestFlight luôn: true". Build xanh tới
bước TestFlight là 6 secret đã đúng. (Lần chạy đầu mất 10–20 phút.)

## 5. Quy trình xoay/thay secret (áp dụng chung)

1. **Thu hồi cái cũ trước** (nếu lộ/hết hạn): revoke cert trong
   Developer → Certificates (đối với 3.1/3.2) hoặc revoke API key
   trong App Store Connect → Users and Access → Integrations (đối
   với 3.3/3.4/3.5). Chỉ xoá secret trên GitHub là **chưa đủ**.
2. **Tạo cái mới** theo đúng mục tương ứng ở §3 (cert mới thì làm lại
   từ CSR; API key mới thì tạo bộ ba mới).
3. **Cập nhật GitHub Secret:** repo → Settings → Secrets and
   variables → Actions → bấm tên secret → **Update**, dán giá trị mới.
   Cập nhật theo **cặp/bộ**: 3.1 đi với 3.2; 3.3 + 3.4 + 3.5 đi với
   nhau. Đừng cập nhật lẻ một cái trong bộ rồi chạy build.
4. **Chạy lại workflow** để kiểm chứng xanh. Nếu vẫn đỏ, đọc log đúng
   bước đỏ và đối chiếu mục "Dấu hiệu nhận biết" ở §3.
5. **Dọn bản cũ:** xoá file `.p12`/`.p8`/`.mobileprovision` cũ khỏi
   máy nếu không còn cần, và không giữ bản sao secret trong file text,
   ảnh chụp màn hình, hay chat.

## 6. Khi build đỏ — tra nhanh theo bước đỏ

| Bước workflow đỏ | Secret nghi ngờ đầu tiên | Kiểm tra |
|---|---|---|
| Import Distribution Certificate (.p12) | 3.1 `IOS_DIST_CERT_P12_BASE64`, 3.2 `IOS_DIST_CERT_PASSWORD` | Base64 đủ dài/không dính ký tự lạ; mật khẩu khớp file `.p12` hiện tại |
| Tải Provisioning Profile | 3.3 Key ID, 3.4 Issuer ID, 3.5 Key Base64 | Cả ba thuộc cùng một key còn hiệu lực, chưa bị revoke |
| Archive (xcodebuild) | 3.1 (cert) | Cert còn hạn, profile `FotoBro App Store` gắn đúng cert đó |
| Export .ipa | 3.6 `APPLE_TEAM_ID` | Team ID đúng 10 ký tự, khớp team của cert/profile |
| Đẩy lên TestFlight | 3.3, 3.4, 3.5 | Như hàng "Tải Provisioning Profile"; `.ipa` đã build xong nhưng không đẩy được |

Lưu ý: build đỏ còn có thể do nguyên nhân không liên quan secret
(ví dụ chọn Xcode không có trên runner, tên profile trong
ExportOptions.plist khác tên profile thật `FotoBro App Store`, lỗi code).
Nếu 6 secret đã kiểm tra đúng mà vẫn đỏ, đọc log theo `RISKS.md` mục 4
và 11 trước khi nghi ngờ secret.

## 7. Những điều không làm

- Không ghi giá trị thật của bất kỳ secret nào vào file này, vào repo,
  vào Issue/PR, hay vào chat.
- Không gửi file `.p12`, `.key`, `.cer`, `.p8`, `.mobileprovision`
  cho bất kỳ ai, kể cả Muse/Claude.
- Không dùng mật khẩu Apple ID của Việt cho CI — workflow chỉ dùng
  API key (BUILD-GUIDE §4).
- Không tạo tài khoản hay secret nào khác ngoài 6 secret trên cho
  build v1 (Push Notifications, iCloud/CloudKit, Sign in with Apple
  chưa bật ở v1 — xem BUILD-GUIDE §1).

## 8. Phụ lục — secret dự phòng (không tính trong 6)

### `IOS_PROVISIONING_PROFILE_BASE64` (dự phòng, workflow KHÔNG đọc)

- **Dùng để làm gì:** Base64 của file `.mobileprovision`
  (Provisioning Profile App Store tên `FotoBro App Store`, tạo ở
  BUILD-GUIDE §3c). Workflow mẫu hiện tải profile bằng API key nên
  không đọc secret này; nó chỉ để dự phòng khi Apple đổi quyền API
  hoặc khi muốn đổi workflow sang dùng đúng file profile này.
- **Ai giữ / cách tạo:** Việt giữ file `.mobileprovision` tải về từ
  Developer → Profiles; base64 như các secret khác rồi dán vào GitHub
  Secrets với đúng tên trên.
- **Cách xoay/thay:** Khi cert hết hạn/bị thu hồi hoặc App ID đổi,
  tạo profile mới (chọn lại App ID `com.fotobro.app` + cert mới) rồi
  cập nhật secret này. Profile cũng hết hạn theo cert gắn với nó.
- **Dấu hiệu khi thiếu:** **Không có** — thiếu secret này build vẫn
  chạy bình thường. Chỉ khi workflow được sửa để đọc nó mà chưa dán
  thì bước dùng profile mới đỏ.
