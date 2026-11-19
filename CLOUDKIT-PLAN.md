# FotoBro — Kế hoạch Nấc 2 CloudKit + Nấc 3 nhóm/studio (iOS v1)

> Ngày: 20/11/2026. Trạng thái: **THIẾT KẾ ONLY — chưa code, chưa tạo
> container thật, chưa bật IAP, chưa có tài khoản cloud thật.**
> File này chỉ là kế hoạch, đặt cạnh app iOS v1 trong
> `~/workspace/fotobro-ios-v1/`. Nó KHÔNG sửa code app và KHÔNG thay
> thế prototype scale ở `~/workspace/fotobro-scale/` (SCALE-PLAN.md,
> `src/fotobro-scale.js` đã kiểm chứng 13/13, SQL Supabase 01_/02_).
> Đọc cùng: `IOS-SETUP-NOTE.md`, `BUILD-GUIDE.md`, `RISKS.md`.

## 0. Quyết định đã chốt (không hỏi lại)

| Hạng mục | Quyết định |
|---|---|
| Nấc 2 đồng bộ làm chính | **CloudKit** (Apple), container `iCloud.com.fotobro.app` |
| Đăng nhập Nấc 2 | **Sign in with Apple** — không tài khoản FotoBro riêng |
| Nấc 1 (local-first) | **Miễn phí**, đầy đủ lõi: Hôm nay, job pipeline 8 bước, sổ tiền/báo cáo, nhắc lịch, mẫu tin nhắn, máy tính giá, bảng giá digital/film, giọng nói, khoá |
| Nấc 2/3 | **Có thu phí** — giá và chu kỳ CHƯA chốt, để placeholder, IAP chưa bật thật |
| Supabase | Chỉ là phương án dự phòng đa nền tảng (web/Android sau này), chưa quyết dùng hay không |
| Ảnh gốc | **KHÔNG lưu ảnh gốc vào CloudKit record** — chỉ metadata + link (xem §2.4). Ảnh gốc ở lại máy + trong file sao lưu mã hoá |

## 1. Nguyên tắc xuyên suốt

1. **Offline-first:** không mạng vẫn dùng đủ mọi tính năng Nấc 1. Mất mạng thì thay đổi xếp vào outbox, có mạng mới đẩy.
2. **Local là nguồn thật:** dữ liệu trên máy (`localStorage troLyXeo.v1` + IndexedDB `troLyXeoPhotos`, giữ nguyên key) là bản chính. CloudKit chỉ là bản sao để đồng bộ/sao lưu.
3. **Mã hoá trước khi đẩy:** Apple (CloudKit) chỉ thấy ciphertext đối với bản sao lưu mã hoá. Với sync từng record, các trường nhạy cảm (tên khách, số tiền) được mã hoá ở tầng app trước khi ghi record — xem §3. Mật khẩu sao lưu do user đặt, không lưu trên server; mất mật khẩu = mất bản sao lưu mã hoá (không có "quên mật khẩu").
4. **Không tài khoản riêng:** dùng Apple ID qua Sign in with Apple. FotoBro không lưu mật khẩu user.
5. **Bật sau, tắt được:** Nấc 2 mặc định TẮT. User bật thủ công trong Cài đặt → Đồng bộ. Tắt thì app quay về local thuần, dữ liệu local không bị xoá.

## 2. Nấc 2 — CloudKit (iOS v1)

### 2.1 Container, database, zone

| Hạng mục | Giá trị |
|---|---|
| Container | `iCloud.com.fotobro.app` (chưa tạo — xem §6) |
| Database | **privateDB** — mỗi user chỉ thấy dữ liệu của mình. Không dùng publicDB, không dùng sharedDB ở Nấc 2 |
| Zone | `FotoBroZone` (custom zone) — tất cả record của user nằm trong 1 zone để đồng bộ theo zone (`CKFetchRecordZoneChangesOperation` + `serverChangeToken`) |
| Auth | Sign in with Apple (`ASAuthorizationAppleIDProvider`). CloudKit dùng đúng Apple ID đó |
| Client | CloudKit JS (web) / CloudKit native qua Capacitor bridge (iOS) — chọn lúc code, không chọn trong file này. Adapter mẫu trong prototype (`fotobro-scale.js`: `cloudKitSync()`) hiện trả `not-configured` khi chưa có container, `not-implemented` khi đã có cấu hình — đó là trạng thái đúng cho tới khi viết code gọi thật |

### 2.2 Thứ tự triển khai (rủi ro thấp trước)

1. **Bước 1 — Sao lưu mã hoá nguyên file (làm trước):** đẩy 1 bản sao lưu JSON v2 đã mã hoá (xem §3) lên 1 record `EncryptedBackup`. Đơn giản, rủi ro thấp, không cần xử lý xung đột từng record.
2. **Bước 2 — Sync từng record (làm sau, khi Bước 1 chạy ổn):** đồng bộ `Job` / `Tx` / `Config` / `PhotoMeta` theo zone, có outbox + last-write-wins (xem §4).
3. Không làm ngược thứ tự: sync từng record trước khi backup mã hoá chạy ổn sẽ khó gỡ lỗi xung đột.

### 2.3 Record types

Quy ước chung mọi record: `localId` = id số trong app local (khớp `troLyXeo.v1`), `updatedAt` = Date/Time (gốc so xung đột), `deleted` = Int64 0/1 (soft delete — xoá local thì đánh dấu, không xoá record ngay, để máy khác đồng bộ việc xoá), `workspaceId` = String, rỗng = dữ liệu cá nhân (Nấc 3 mới có giá trị).

#### `Job` — 1 job = 1 record

| Field | Kiểu CloudKit | Ghi chú |
|---|---|---|
| `localId` | Int64 | Khóa nối với job local |
| `client` | String | Tên khách — mã hoá ở tầng app trước khi ghi (xem §3) |
| `type` | String | Portrait / Couple / Wedding / Lookbook / Event / Khác |
| `stage` | String | 1 trong 8 bước: Tư vấn, Chốt cọc, Sắp chụp, Đã chụp, Chọn ảnh, Hậu kỳ, Đã giao, Xong |
| `shootDate` | Date/Time | |
| `shootTime` | String | |
| `location` | String | |
| `deadline` | Date/Time | Hạn giao ảnh |
| `price` | Int64 | VND, số nguyên |
| `medium` | String | Digital / Film / Cả hai |
| `note` | String | |
| `workspaceId` | String | Rỗng ở Nấc 2 |
| `updatedAt` | Date/Time | |
| `deleted` | Int64 (0/1) | |

Không lưu vào `Job`: link Facebook/Messenger/Drive của job, email khách (giữ local; nếu cần sync thì thêm field mã hoá ở bản sau, không thêm lặng lẽ).

#### `Tx` — 1 giao dịch thu/chi = 1 record

| Field | Kiểu CloudKit | Ghi chú |
|---|---|---|
| `localId` | Int64 | |
| `kind` | String | `thu` / `chi` |
| `category` | String | |
| `jobLocalId` | Int64 | Nối về `Job.localId`, 0 = chi vận hành không gắn job |
| `amount` | Int64 | VND, số nguyên |
| `txDate` | Date/Time | |
| `note` | String | |
| `workspaceId` | String | Rỗng ở Nấc 2 |
| `updatedAt` | Date/Time | |
| `deleted` | Int64 (0/1) | |

#### `Config` — 1 record duy nhất / user (`recordName = 'config'`)

| Field | Kiểu CloudKit | Ghi chú |
|---|---|---|
| `ownerName` | String | Tên user |
| `studioName` | String | Tên studio |
| `locale` | String | `vi` / `en` |
| `currency` | String | `VND` / `USD` (chỉ đổi hiển thị, không quy đổi tỷ giá) |
| `prices` | String | JSON chuỗi: bảng giá digital (CloudKit không có kiểu JSON) |
| `pricesFilm` | String | JSON chuỗi: bảng giá film |
| `depositPct` | Int64 | % cọc mặc định |
| `deliverDays` | Int64 | Số ngày giao ảnh mặc định |
| `updatedAt` | Date/Time | |

Không lưu vào `Config`: Client ID Google, token Google/Apple, mật khẩu sao lưu, logo ảnh (logo là file local, không sync ở v1).

#### `PhotoMeta` — metadata ảnh, KHÔNG ảnh gốc

> Khác với schema mẫu trong prototype (`src/cloudkit-schema.json`,
> `PhotoRef.asset` = CKAsset chứa ảnh gốc): **thiết kế này CHỈ lưu
> metadata + link, không lưu ảnh gốc vào CloudKit record.** Lý do:
> ảnh trang chủ tối đa 60 ảnh, ảnh gốc lớn sẽ đội dung lượng
> CloudKit + thời gian sync; ảnh gốc đã có trong file sao lưu mã hoá
> (Bước 1, §2.2) và ở lại trên máy. Nếu sau này cần sync ảnh gốc
> giữa các máy thì thêm CKAsset sau, không đổi thiết kế này lặng lẽ.

| Field | Kiểu CloudKit | Ghi chú |
|---|---|---|
| `localId` | String | id ảnh trong IndexedDB `troLyXeoPhotos` |
| `jobLocalId` | Int64 | 0 = ảnh trang chủ không gắn job |
| `fileName` | String | Tên file gốc (nếu có) |
| `addedAt` | Date/Time | |
| `updatedAt` | Date/Time | |
| `deleted` | Int64 (0/1) | |

Không có field nào chứa base64 hay CKAsset trong `PhotoMeta` ở thiết kế này.

#### `EncryptedBackup` — bản sao lưu mã hoá nguyên file

| Field | Kiểu CloudKit | Ghi chú |
|---|---|---|
| `ciphertext` | String (base64) | Toàn bộ file backup JSON v2 đã mã hoá AES-256-GCM — Apple cũng không đọc được |
| `salt` | String (base64) | PBKDF2 |
| `iv` | String (base64) | AES-GCM |
| `kdf` | String | `PBKDF2-SHA256-100k` |
| `counts` | String | JSON chuỗi `{jobs, txs, photos}` — chỉ số lượng, không nội dung |
| `deviceId` | String | Máy nào đẩy bản này lên |
| `createdAt` | Date/Time | |

Đây là record của Bước 1 (§2.2). Xung đột ở đây thì giữ nguyên 1 bản mới nhất, không gộp (không gộp được file mã hoá).

### 2.4 Ảnh: ở đâu, cái gì được sync

| Loại ảnh | Ở máy (local) | Lên CloudKit |
|---|---|---|
| Ảnh trang chủ (tối đa 60, IndexedDB) | Gốc, đầy đủ | Chỉ `PhotoMeta` (metadata). Gốc KHÔNG lên record |
| Ảnh gốc của job (nếu có sau này) | Gốc, đầy đủ | Chưa sync ở v1 |
| Logo studio (1 ảnh, local) | Gốc, đầy đủ | Không sync ở v1 |
| Ảnh trong file sao lưu mã hoá | Nằm trong file JSON v2 (đã nén bằng `shrinkPhoto()` của app) | Có, nhưng chỉ dưới dạng ciphertext trong `EncryptedBackup` — Apple không đọc được |

Giới hạn phải nói thật: file sao lưu có ảnh có thể nặng (vài chục MB nếu 60 ảnh lớn). Nếu file > 25 MB thì tách ảnh ra file riêng và chỉ xuất JSON không ảnh kèm cảnh báo — phần tách này chưa code, nằm ở bước nối module vào app, không nằm trong file kế hoạch này.

### 2.5 Sao lưu thủ công + nhắc sao lưu 7 ngày

- **Sao lưu thủ công:** nút "Tải bản sao lưu" trong Cài đặt → xuất file `fotobro-backup-YYYYMMDD.json` (định dạng v2: `{jobs, txs, cfg, checkDone, uid, photos}`; đọc được cả file v1 cũ `{jobs, txs, cfg}` của Trợ lý Xèo). Khôi phục bằng "Mở bản sao lưu" — đọc file, kiểm tra định dạng, hỏi xác nhận trước khi ghi đè dữ liệu local.
- **Nhắc sau 7 ngày:** nếu từ lần sao lưu cuối (`fotobro.lastBackupAt`) đã quá 7 ngày, hoặc chưa từng sao lưu, app hiện banner nhắc — chỉ nhắc, không chặn user. Logic đã có sẵn trong prototype (`backupStatus()`, `BACKUP_REMIND_DAYS = 7`, test đạt).
- **Sao lưu mã hoá lên CloudKit (khi bật Nấc 2):** cùng file v2 trên, mã hoá bằng mật khẩu user đặt rồi đẩy lên record `EncryptedBackup`. Mật khẩu không lưu trên server, không lưu trong app.

## 3. Mã hoá (dùng lại prototype đã kiểm chứng)

Lấy nguyên từ `src/fotobro-scale.js` (đã test 13/13, gồm test mã hoá/giải mã):

- **KDF:** PBKDF2-SHA256, 100.000 vòng, salt ngẫu nhiên 16 byte.
- **Cipher:** AES-256-GCM, IV ngẫu nhiên 12 byte, qua WebCrypto (`crypto.subtle`).
- **Hàm:** `encryptBackup(passphrase, plaintext)` → envelope `{format:'fotobro-encrypted-backup', version:1, kdf:'PBKDF2-SHA256-100k', salt, iv, ciphertext}` (base64); `decryptBackup()` sai mật khẩu báo lỗi `wrong-password`, không trả dữ liệu rác.
- **Nguyên tắc:** mã hoá TRÊN MÁY trước khi đẩy lên bất kỳ server nào. Server (Apple) chỉ thấy ciphertext + salt/iv + số lượng.
- **Áp dụng:**
  - File sao lưu mã hoá: mã hoá toàn bộ file JSON v2 (Bước 1).
  - Sync từng record (Bước 2): trường nhạy cảm (`Job.client`, `Tx.note`, số tiền trong ngữ cảnh cần) mã hoá ở tầng app trước khi ghi record; các trường cần lọc/sắp xếp ở server (`stage`, `shootDate`, `kind`, `amount` phục vụ báo cáo tổng — cân nhắc kỹ: nếu mã hoá `amount` thì không tổng hợp được ở server, nhưng FotoBro tính báo cáo ở local nên chấp nhận mã hoá).
  - Không mã hoá: `localId`, `updatedAt`, `deleted`, `workspaceId`, `stage`, `shootDate` — cần cho đồng bộ/xung đột.
- **Mật khẩu:** user tự đặt và tự nhớ. Mất mật khẩu = mất bản sao lưu mã hoá. Không có khôi phục bằng Apple ID ở v1 (kém an toàn hơn — nếu Việt muốn thì quyết riêng sau).

## 4. Đồng bộ: outbox + xung đột last-write-wins

Luồng (đã có sẵn dạng code trong prototype: `createSyncState()`, `queueChange()`, `resolveConflict()`, `applySyncLog()`):

1. Thay đổi local (thêm/sửa/xoá job, tx, cfg) → ghi vào **outbox** (`fotobro.syncState.outbox`), app vẫn dùng bình thường, không chờ mạng.
2. Có mạng → đẩy outbox lên CloudKit, kéo thay đổi mới từ server bằng `serverChangeToken` đã lưu trong `FotoBroZone`.
3. Xung đột (cùng `localId`, `updatedAt` khác nhau) → **giữ bản mới nhất** (so `updatedAt`, bản mới hơn thắng), ghi log vào `fotobro.syncState.log` (tối đa 200 dòng) để user soi lại. **Không tự gộp từng trường** — job/tx là bản ghi nhỏ, gộp từng trường dễ sai tiền.
4. Lưu `serverChangeToken` mới + `lastSyncAt`, xoá outbox đã đẩy xong. Mất mạng giữa chừng thì outbox còn nguyên, lần sau đẩy tiếp.
5. Xoá: soft delete (`deleted = 1`) + `updatedAt` mới, để máy khác đồng bộ việc xoá. Không xoá record ngay.
6. Trạng thái hiển thị trong app: "Chưa bật đồng bộ" / "Đang đồng bộ" / "Đồng bộ lần cuối: …" / "Đang ngoại tuyến, sẽ đồng bộ khi có mạng" / "Có xung đột, đã giữ bản mới nhất".

## 5. Nấc 3 — Nhóm/studio (thiết kế gọn, CHƯA code, CHƯA bật)

> Chỉ thiết kế. Cần Nấc 2 chạy ổn trước. Không có UI chọn workspace, màn
> mời thành viên hay code gọi CloudKit cho team ở v1.

### 5.1 Mô hình

- 1 workspace = 1 studio. Job/tx có `workspaceId` thì thuộc studio, không có thì là job cá nhân.
- Workspace ở Nấc 3 dùng **sharedDB của CloudKit** (khác privateDB của Nấc 2) hoặc — nếu dùng Supabase dự phòng — bảng `workspaces` / `workspace_members` trong `sql/02_supabase_team.sql`. Quyết định store cuối cùng khi code Nấc 3, không quyết trong file này.
- Tạo workspace: chủ studio tạo, đặt tên studio, tự động là Chủ.
- Mời bằng mã mời 1 lần, hết hạn 7 ngày (hết hạn thì chủ tạo mã mới).

### 5.2 4 vai trò

Theo chốt của Việt cho thiết kế này: **Chủ, Quản lý, Photographer, Xem**.
(Bản prototype dùng bộ khác: owner / photographer / editor / accountant —
xem `PERMISSIONS` trong `fotobro-scale.js` và SQL 02_. Nếu Việt muốn giữ
bộ của prototype thì đổi bảng dưới đây thành bộ đó trước khi code; đừng
code 2 bộ cùng lúc.)

| Quyền | Chủ | Quản lý | Photographer | Xem |
|---|:-:|:-:|:-:|:-:|
| Quản lý workspace / mời / xoá thành viên / đổi vai trò | ✅ | — | — | — |
| Tạo / sửa job | ✅ | ✅ | ✅ | — |
| Đổi giai đoạn job | ✅ | ✅ | ✅ | — |
| Xoá job | ✅ | — | — | — |
| Xem tiền (thu/chi/báo cáo) | ✅ | ✅ | ✅ | ✅ |
| Sửa tiền / sửa bảng giá | ✅ | ✅ | — | — |
| Xuất sao lưu | ✅ | ✅ | — | — |
| Xem nhật ký hoạt động | ✅ | ✅ | — | — |

Quy tắc: quyền kiểm tra ở cả tầng app (hàm `can(role, action)` kiểu prototype) và tầng server (CloudKit sharedDB / RLS nếu dùng Supabase). Thành viên chỉ thấy job/tx của workspace mình là thành viên.

### 5.3 Nhật ký hoạt động

- Ghi: ai làm gì, khi nào — `job.create`, `job.stage`, `member.invite`, `member.remove`, `money.edit`, `price.edit`, `workspace.create`. Giữ tối đa 500 dòng/workspace (kiểu prototype: `logActivity()`, cắt 500 dòng mới nhất).
- **Không ghi vào log:** số tiền chi tiết, tên khách đầy đủ, nội dung ghi chú job.
- Chủ và Quản lý xem được log; Photographer và Xem không xem log.

### 5.4 Những gì KHÔNG có ở Nấc 3 v1

- Không có chat trong app, không giao việc qua app, không chấm công.
- Không có nhiều workspace cho 1 user ở v1 (1 user = 1 workspace + dữ liệu cá nhân).
- Không tự động chia tiền theo % cho thành viên — tính tiền vẫn làm ở sổ tiền chung của studio.

## 6. Mô hình thu phí (giá là PLACEHOLDER — chưa chốt)

> **Chưa có số tiền, chưa có chu kỳ, IAP chưa bật thật.** Bảng dưới chỉ
> nói Nấc nào gồm cái gì. Việt phải chốt giá + chu kỳ trước khi bật IAP
> (xem §8). Đừng ghi giá bịa vào code hay vào App Store Listing.

| Nấc | Giá | Gồm |
|---|---|---|
| **Nấc 1 — Cá nhân** | **Miễn phí** | Toàn bộ lõi local: Hôm nay, job pipeline 8 bước, sổ tiền/báo cáo ngày/tuần/tháng, nhắc lịch, mẫu tin nhắn/email, máy tính giá, bảng giá digital/film, giọng nói, khoá Face ID/PIN, sao lưu JSON thủ công + nhắc 7 ngày, cá nhân hoá (màu chủ đề, logo, ngôn ngữ Việt/Anh, tiền tệ VND/USD) |
| **Nấc 2 — Đồng bộ** | **Thu phí — `TBD`** | Tất cả Nấc 1 + sao lưu mã hoá lên CloudKit + đồng bộ giữa các máy của cùng 1 user (iPhone ↔ iPad) + khôi phục từ bản sao lưu mã hoá |
| **Nấc 3 — Studio** | **Thu phí — `TBD`** (cao hơn Nấc 2) | Tất cả Nấc 2 + workspace studio + 4 vai trò + nhật ký hoạt động + mời thành viên |

Ghi chú thu phí:

- Thu phí **theo user** (Nấc 2) và **theo workspace** (Nấc 3), không thu theo job hay theo dung lượng ảnh ở v1.
- Dùng **StoreKit / IAP của Apple** (auto-renewable subscription hoặc 1 lần mua — quyết sau khi Việt chốt chu kỳ). Không tự làm cổng thanh toán riêng trong app (vi phạm guideline App Store).
- Nấc 2/3 hết hạn thì app quay về Nấc 1: dữ liệu local còn nguyên, chỉ tắt đồng bộ/team, không khoá dữ liệu cũ.
- Chi phí phía Apple: CloudKit miễn phí tới hạn mức lớn của Apple (đủ cho app nhỏ; vượt hạn mức mới tính theo mức dùng — kiểm tra lại bảng giá Apple lúc bật). Không có server riêng nên không có phí server cho Nấc 2. Supabase (nếu dùng dự phòng) free tier ~500 MB DB, 1 GB storage, 50.000 user/tháng (con số lúc viết — kiểm tra lại lúc đăng ký); Pro ~$25/tháng.
- App Store đã trả $99/năm (Apple Developer) — không liên quan phí Nấc 2/3.

## 7. Các bước Việt phải tự làm trên Apple Developer

> Muse không có quyền Apple Developer của Việt nên không làm thay được
> các bước này. Thứ tự: làm sau khi app iOS v1 lên TestFlight lần đầu
> (không cần làm trước khi build), trừ App ID thì cần trước khi build
> có CloudKit thật.

### 7.1 Tạo App ID `com.fotobro.app` (cần trước khi build bản có CloudKit)

1. Vào [Apple Developer → Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list) → dấu `+` → **App IDs** → **App** → Continue.
2. Description: `FotoBro`; Bundle ID: chọn **Explicit** và nhập `com.fotobro.app` (không đổi được sau khi tạo).
3. Capabilities — tích chọn:
   - **iCloud** → chọn **CloudKit** (bỏ chọn Cloud Documents nếu không cần).
   - **Sign in with Apple**.
   - (Giữ nguyên các capability khác của app nếu đã có: Push Notifications chỉ khi cần nhắc từ server — Nấc 1 dùng Local Notifications nên chưa cần.)
4. Continue → Register.

### 7.2 Tạo CloudKit container `iCloud.com.fotobro.app`

1. Trong App ID vừa tạo → mục **iCloud** → **Edit** → dấu `+` tạo container mới.
2. Container ID: `iCloud.com.fotobro.app` → Create.
3. (Hoặc) Vào [CloudKit Console](https://icloud.developer.apple.com/dashboard/) → chọn container → kiểm tra thấy `FotoBroZone` chưa có là bình thường — zone do app tự tạo lúc chạy lần đầu, không tạo tay trong console.
4. Trong Xcode (lúc build): target App → **Signing & Capabilities** → **+ Capability** → **iCloud** → tích **CloudKit** → chọn container `iCloud.com.fotobro.app`; thêm **Sign in with Apple**. Kiểm tra file `.entitlements` có `com.apple.developer.icloud-container-identifiers` chứa container này thì mới đúng.

### 7.3 Bật trong app (sau khi container có thật)

1. Dán container ID vào cấu hình đồng bộ của app (1 chỗ duy nhất, không hard-code rải rác). Trước lúc đó adapter phải ở trạng thái `not-configured` — không gọi mạng lén.
2. Chạy trên iPhone thật qua TestFlight: đăng nhập Apple ID → bật Đồng bộ trong Cài đặt → tạo 1 job thử → kiểm tra job xuất hiện trong CloudKit Console (privateDB → `FotoBroZone` → `Job`).
3. Thử mất mạng → sửa job → có mạng lại → kiểm tra outbox đẩy hết + `lastSyncAt` cập nhật.
4. Thử xung đột: sửa cùng job trên 2 máy → kiểm tra bản mới nhất thắng + log xung đột có ghi.

### 7.4 Nấc 3 (sau này, khi Nấc 2 chạy ổn)

- Bật **sharedDB** cho container (trong CloudKit Console / capability) nếu chọn CloudKit cho team, hoặc tạo project Supabase + chạy `sql/02_supabase_team.sql` nếu chọn Supabase cho team.
- Không bật sharedDB khi chưa có thiết kế quyền hoàn chỉnh (§5.2).

## 8. Những gì còn chờ Việt quyết

| # | Cần Việt quyết | Vì sao chưa làm được |
|---|---|---|
| 1 | **Giá + chu kỳ Nấc 2/3** (vd: bao nhiêu/tháng hay bao nhiêu/năm, hay mua 1 lần) | Không có giá thì không cấu hình IAP / StoreKit được, không ghi được vào App Store Listing |
| 2 | **Có dùng Supabase làm dự phòng không?** (chỉ CloudKit, hay CloudKit chính + Supabase cho web/Android sau này) | Quyết định này đổi store của Nấc 3 (sharedDB vs Postgres) và đổi việc cần làm (§7.4) |
| 3 | **Bộ vai trò Nấc 3:** giữ bộ mới (Chủ / Quản lý / Photographer / Xem) hay giữ bộ của prototype (Chủ / Photographer / Hậu kỳ / Kế toán)? | Code quyền + UI mời thành viên phụ thuộc bộ này |
| 4 | **Mật khẩu sao lưu:** user tự đặt + tự nhớ (mất là mất) hay cho khôi phục bằng Apple ID (kém an toàn hơn)? | Đổi luồng khôi phục + thông báo trong app |
| 5 | **Ảnh gốc có sync giữa các máy không?** Thiết kế này nói KHÔNG (chỉ metadata). Nếu Việt muốn CÓ thì đổi `PhotoMeta` thành CKAsset (như schema mẫu của prototype) trước khi code | Đổi dung lượng CloudKit + thời gian sync |
| 6 | **Tạo App ID + container (§7.1–7.2)** — Việt tự làm trên Apple Developer | Muse không có quyền Apple Developer của Việt |

## 9. Cái nào thật, cái nào chưa (đọc trước khi tin)

| Hạng mục | Trạng thái thật |
|---|---|
| Prototype scale (`fotobro-scale.js`): i18n, backup v2, nhắc 7 ngày, mã hoá AES-GCM + PBKDF2, outbox, last-write-wins, 4 vai trò mẫu, workspace, nhật ký | Code thật, test 13/13 đạt (19/11/2026) |
| Schema CloudKit mẫu (`cloudkit-schema.json`): container, zone, 5 record types | Thiết kế mẫu, chưa có container thật |
| SQL Supabase 01_ (Nấc 2) + 02_ (Nấc 3) | SQL mẫu, chưa chạy trên Supabase thật |
| Kế hoạch này (`CLOUDKIT-PLAN.md`) | Thiết kế only, chưa code |
| Container `iCloud.com.fotobro.app` | **Chưa tạo** — cần Việt làm §7.1–7.2 |
| App ID `com.fotobro.app` | **Chưa tạo** (đã chốt Bundle ID, chưa tạo trên Apple Developer) |
| Sign in with Apple trong app | Chưa code (capability chưa bật) |
| Sync CloudKit thật (Bước 1 + Bước 2) | Chưa code — adapter mẫu trả `not-configured` |
| IAP / StoreKit, giá Nấc 2/3 | Chưa có gì — giá là `TBD`, IAP chưa bật |
| Nấc 3 team (workspace, mời, nhật ký) | Chỉ thiết kế §5, chưa code, chưa có UI |

## 10. Tài liệu tham khảo

- Prototype + kiểm chứng: `~/workspace/fotobro-scale/SCALE-PLAN.md`, `src/fotobro-scale.js`, `src/cloudkit-schema.json`, `sql/01_supabase_sync.sql`, `sql/02_supabase_team.sql`, `docs/WIRING.md`.
- Gói iOS: `~/workspace/fotobro-ios-v1/IOS-SETUP-NOTE.md` (cap add ios, plugin), `BUILD-GUIDE.md` (6 secrets, workflow), `RISKS.md`, `README.md`.
- Quyết định đã lưu: CloudKit làm chính Nấc 2, thu phí Nấc 2/3, Nấc 1 miễn phí, container `iCloud.com.fotobro.app`, Sign in with Apple (19/11/2026).
