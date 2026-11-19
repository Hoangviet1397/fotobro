# FotoBro iOS v1 — Thiết kế sao lưu v2

> Ngày: 20/11/2026. Trạng thái: **thiết kế, chưa code vào app.**
> Nguồn duy nhất: prototype scale `~/workspace/fotobro-scale/`
> (`SCALE-PLAN.md`, `src/fotobro-scale.js` — test 13/13 đạt, 19/11/2026).
> Không sửa bất kỳ file nào khác. Không tạo tài khoản cloud.
> Nấc 1 local-first, miễn phí. Sao lưu v2 là tính năng Nấc 1,
> không cần CloudKit hay Supabase mới dùng được.

## Báo cáo theo mẫu 7 mục (Quy trình Vibe Coding)

1. **Mục tiêu:** Thiết kế sao lưu v2 cho FotoBro iOS v1: một file
   sao lưu chứa đủ dữ liệu để khôi phục máy mới (jobs, txs, cfg,
   checkDone, uid, **cả ảnh trang chủ**), mã hoá tuỳ chọn bằng mật
   khẩu do người dùng đặt, đọc được cả file v1 cũ, nhắc sao lưu sau
   7 ngày, và không vỡ khi file quá nặng (> 25 MB thì tách ảnh riêng).
2. **Đã thực hiện:** Đọc kỹ prototype scale và viết file này
   (`BACKUP-V2.md`) — định dạng file, quy tắc mã hoá, quy tắc tách
   ảnh, luồng xuất/nhập/khôi phục, nhắc sao lưu, các trường hợp lỗi
   và checklist nối vào app. Chưa viết code vào app.
3. **Kết quả kiểm tra:** Thiết kế này bám đúng code prototype đã
   kiểm chứng: `buildBackup` / `parseBackup` / `encryptBackup` /
   `decryptBackup` / `backupStatus` trong `fotobro-scale.js`
   (test 13/13 đạt, gồm: build v2 có ảnh + parse tròn, file v1 cũ
   vẫn đọc được, file rác bị từ chối, nhắc sau 7 ngày, mã hoá sai
   mật khẩu báo lỗi). Chưa kiểm chứng trên app iOS v1 thật — cần
   chạy lại test sau khi nối vào app.
4. **Vấn đề còn tồn tại:** (a) chưa code nối vào app iOS v1;
   (b) phần tách ảnh > 25 MB chưa có code trong prototype — phải
   viết mới khi nối (xem §5); (c) chưa chốt có cho khôi phục mật
   khẩu sao lưu bằng Apple ID không (mặc định: không, xem §4);
   (d) `support@fotobro.app` trong prototype chỉ là placeholder,
   chưa có hộp mail thật — không liên quan trực tiếp tới sao lưu,
   nhưng đừng ghi địa chỉ này vào file sao lưu.
5. **Điều kiện chuyển bước:** Việt chốt §4 (mật khẩu mất thì mất,
   không khôi phục) và §5 (ngưỡng tách ảnh 25 MB) → agent iOS nối
   module theo checklist §8 → chạy test trên app thật → mới giao.
6. **Bước tiếp theo:** Nối vào app iOS v1 theo §8, ưu tiên bản sao
   lưu mã hoá nguyên file trước (rủi ro thấp nhất, cũng là bước
   đầu của Nấc 2 CloudKit: cùng một file mã hoá này có thể đẩy
   lên `EncryptedBackup` sau này, xem CLOUDKIT-PLAN.md).
7. **Trạng thái:** **Thiết kế xong, chưa phải tính năng chạy được.**

---

## 1. Vấn đề của sao lưu v1 (đang có)

| Hạng mục | v1 (cũ) |
|---|---|
| Nội dung | Chỉ `{jobs, txs, cfg}` |
| Ảnh trang chủ | **Không có** — ảnh sống riêng trong IndexedDB `troLyXeoPhotos`, tối đa 60 ảnh; đổi máy / xoá app là mất ảnh dù đã sao lưu |
| `checkDone`, `uid` | Không có — khôi phục xong mất trạng thái đã check và bộ đếm id |
| Mã hoá | Không có — file JSON đọc được luôn, ai cầm file là đọc được tên khách + số tiền |
| Tên file | `tro-ly-xeo-sao-luu.json` (tên cũ) |
| Đọc ngược | Import đọc được file cũ, nhưng không khôi phục ảnh |

Nguồn dữ liệu local (giữ nguyên, không đổi key — đổi key là mất dữ
liệu người dùng cũ, đặc biệt là Xèo):

- `localStorage['troLyXeo.v1']`: `{jobs, txs, sample, uid, checkDone, cfg}`
- `IndexedDB 'troLyXeoPhotos'`, store `photos` (keyPath `id`), tối đa 60 ảnh
- `localStorage['fotobro.lastBackupAt']` (mới, prototype đã đặt tên):
  thời điểm sao lưu thành công gần nhất, dạng ISO

## 2. Định dạng file sao lưu v2

### 2.1 Envelope v2 (không mã hoá)

Lấy nguyên từ prototype (`buildBackup`, đã test):

```json
{
  "format": "fotobro-backup",
  "version": 2,
  "app": "FotoBro",
  "appVersion": "1.0",
  "exportedAt": "2026-11-20T00:00:00.000Z",
  "counts": { "jobs": 12, "txs": 40, "photos": 6 },
  "jobs": [ /* như trong localStorage, giữ nguyên id */ ],
  "txs": [ /* như trong localStorage */ ],
  "cfg": { /* như trong localStorage */ },
  "checkDone": {},
  "uid": 123,
  "photos": [
    { "id": "p1", "dataUrl": "data:image/jpeg;base64,/9j/...", "addedAt": "2026-11-19T00:00:00.000Z" }
  ]
}
```

Quy tắc:

- `format` phải đúng `"fotobro-backup"`, `version` phải đúng `2`.
  Sai một trong hai → từ chối, báo lỗi
  "File này không giống bản sao lưu của FotoBro."
- `counts` chỉ để hiển thị trước khi khôi phục ("12 job, 40 khoản
  thu chi, 6 ảnh") và để kiểm tra đủ dữ liệu sau khi khôi phục.
  Nếu số lượng thực tế lệch `counts` → cảnh báo, không im lặng.
- `photos[].dataUrl` là ảnh đã nén (xem §5.1). Mỗi ảnh giữ `id`
  gốc trong IndexedDB để khi khôi phục không tạo id mới, job nào
  trỏ tới ảnh nào vẫn đúng.
- Tên file: `fotobro-backup-YYYYMMDD.json`
  (ví dụ `fotobro-backup-20261120.json`). Không dùng tên cũ
  `tro-ly-xeo-sao-luu.json`.
- `appVersion` ghi phiên bản app lúc xuất (v1 là `"1.0"`), để sau
  này biết file này từ bản nào.

### 2.2 Envelope v2 mã hoá (khi người dùng bật mã hoá)

Lấy nguyên từ prototype (`encryptBackup`, đã test). Toàn bộ JSON
v2 ở §2.1 được mã hoá thành một envelope khác, **trước khi** ghi
ra file hay đẩy lên đâu:

```json
{
  "format": "fotobro-encrypted-backup",
  "version": 1,
  "kdf": "PBKDF2-SHA256-100k",
  "salt": "<base64, 16 byte>",
  "iv": "<base64, 12 byte>",
  "ciphertext": "<base64, AES-256-GCM của toàn bộ JSON v2>"
}
```

Quy tắc: xem §4.

### 2.3 Tóm tắt các phiên bản file

| File | Nhận dạng | Đọc được? |
|---|---|---|
| v2 thường | `format=fotobro-backup`, `version=2` | Có — đủ dữ liệu |
| v2 mã hoá | `format=fotobro-encrypted-backup`, `version=1` | Có — sau khi nhập đúng mật khẩu |
| v1 cũ | `{jobs, txs, cfg}` (không có `format`) | Có — xem §6, nhưng **không có ảnh** |
| File khác / JSON hỏng | — | Không — từ chối, không ghi đè dữ liệu hiện tại |

## 3. Luồng xuất (tạo sao lưu)

1. Người dùng vào Cài đặt → Sao lưu → "Tải bản sao lưu".
2. App đọc `localStorage['troLyXeo.v1']` + toàn bộ ảnh trong
   IndexedDB `troLyXeoPhotos`.
3. Nén ảnh trước khi đưa vào file (xem §5.1) — **bắt buộc**,
   không đưa ảnh gốc chưa nén vào backup.
4. Tính kích thước file dự kiến:
   - ≤ 25 MB → xuất 1 file duy nhất theo §2.1 (hoặc §2.2 nếu
     bật mã hoá). Tên file theo §2.1.
   - \> 25 MB → tách ảnh riêng theo §5.2, không cố nhét hết
     vào 1 file.
5. Nếu bật mã hoá: hỏi mật khẩu (nhập 2 lần khi đặt mới), mã hoá
   theo §4, xuất file envelope mã hoá. Tên file thêm hậu tố
   `-encrypted` (ví dụ `fotobro-backup-20261120-encrypted.json`).
6. Chỉ khi xuất file thành công mới ghi
   `localStorage['fotobro.lastBackupAt'] = <thời điểm xuất>`.
   Xuất thất bại giữa chừng thì không cập nhật — lần sau vẫn nhắc.
7. Hiện xác nhận: "Đã sao lưu xong — 12 job, 40 khoản thu chi,
   6 ảnh" (hoặc "…không kèm ảnh, xem file ảnh riêng" khi tách).

Không tự động tải file nền, không tự gửi file đi đâu. Người dùng
chủ động bấm tải và tự cất file (Files, Drive, gửi cho chính mình).

## 4. Mã hoá — AES-256-GCM + PBKDF2 (dùng lại prototype)

Lấy nguyên từ prototype (`encryptBackup` / `decryptBackup`,
WebCrypto, đã test):

- **KDF:** PBKDF2-SHA256, **100.000 vòng**, salt ngẫu nhiên 16 byte
  (mỗi lần mã hoá một salt mới).
- **Mã hoá:** AES-256-GCM, iv ngẫu nhiên 12 byte (mỗi lần một iv mới).
- **Định dạng:** envelope §2.2, `salt` / `iv` / `ciphertext` đều base64.
- **Mật khẩu:** do người dùng đặt, nhập khi xuất và khi khôi phục.
  Mật khẩu **không lưu** trong app, không lưu trong file sao lưu,
  không lưu trên server. Salt/iv trong envelope là đủ để giải mã
  khi có đúng mật khẩu — không cần lưu thêm gì.
- **Sai mật khẩu:** giải mã thất bại → báo đúng một câu
  "Sai mật khẩu sao lưu." Không gợi ý mật khẩu, không thử lại tự
  động quá 5 lần liên tiếp (chống đoán mò — sau 5 lần sai, khoá
  60 giây rồi mới cho thử tiếp).
- **Mật khẩu yếu:** yêu cầu tối thiểu 8 ký tự. Dưới 8 ký tự thì
  không cho bật mã hoá, báo rõ lý do. Không ép kiểu ký tự phức tạp.
- **Không có "quên mật khẩu":** mất mật khẩu = mất bản sao lưu
  mã hoá đó, không có đường khôi phục. Đây là quyết định cần Việt
  chốt (xem §7, câu 1). Phương án thay thế (chưa chốt): cho khôi
  phục bằng Apple ID — kém an toàn hơn, chỉ làm nếu Việt yêu cầu
  rõ, và phải ghi rõ trong Privacy Policy.
- **Bản không mã hoá vẫn được phép:** mặc định tắt mã hoá (đỡ rào
  cản người mới). Khi bật lần đầu, giải thích 1 dòng: "Bật mã hoá
  thì chỉ người có mật khẩu mới mở được file này."

Quan hệ với Nấc 2 CloudKit: cùng một envelope mã hoá này sau này
có thể đẩy nguyên file lên record `EncryptedBackup` (xem
CLOUDKIT-PLAN.md §5). Server (Apple) chỉ thấy ciphertext, không
đọc được tên khách hay số tiền. Không cần thiết kế mã hoá thứ hai.

## 5. Ảnh trong sao lưu — ngưỡng 25 MB

### 5.1 Nén ảnh trước khi đưa vào backup (bắt buộc)

- Ảnh trang chủ trong app đã có hàm nén `shrinkPhoto()` trong base
  (theo SCALE-PLAN.md §Nấc 1). Dùng lại hàm đó, **không viết hàm
  nén mới** khi nối.
- Mục tiêu sau nén: mỗi ảnh tối đa ~200 KB (JPEG chất lượng vừa,
  cạnh dài tối đa 1600px). 60 ảnh tối đa ≈ 12 MB — vừa trong 1 file.
- Nếu sau nén vẫn > 25 MB (ảnh nhiều hoặc nén không xuống được)
  → chuyển sang §5.2, không cố nhét.

### 5.2 File > 25 MB thì tách ảnh riêng

Ngưỡng 25 MB là ngưỡng của thiết kế này (theo brief). Lý do: file
JSON quá nặng dễ làm iPhone đơ khi mở, dễ lỗi khi gửi qua mail /
chat, và nhiều dịch vụ chặn file đính kèm lớn.

Luật tách:

1. Xuất **2 file** cùng lúc, cùng ngày, cùng tiền tố tên:
   - `fotobro-backup-YYYYMMDD.json` — đủ jobs/txs/cfg/checkDone/
     uid, nhưng `photos: []` và thêm trường
     `"photosSplit": true` + `"photosFile": "fotobro-photos-YYYYMMDD.json"`.
   - `fotobro-photos-YYYYMMDD.json` — chỉ chứa ảnh:
     `{ "format": "fotobro-photos", "version": 1, "exportedAt": "...",
     "photos": [ {id, dataUrl, addedAt} ] }`.
   - Nếu bật mã hoá: mã hoá cả hai file bằng **cùng một mật khẩu**
     (người dùng chỉ nhập mật khẩu một lần khi xuất, một lần khi
     khôi phục).
2. Hiện cảnh báo rõ trước khi tải: "Bản sao lưu này nặng hơn
   25 MB nên tách ảnh ra file riêng. Cần giữ cả 2 file mới khôi
   phục đủ ảnh."
3. Khôi phục: chọn file JSON chính trước, app thấy
   `photosSplit: true` thì hỏi tiếp file ảnh. Có file ảnh → khôi
   phục đủ. Không có file ảnh → vẫn khôi phục được jobs/txs/cfg,
   nhưng báo rõ "Đã khôi phục job và tiền, thiếu 6 ảnh (chưa chọn
   file ảnh riêng)" — không im lặng, không báo thành công giả.
4. File ảnh đứng một mình (không có file JSON chính đi kèm) thì
   không khôi phục được — báo "Đây chỉ là file ảnh kèm theo, cần
   chọn file sao lưu chính trước."

### 5.3 Giới hạn ảnh

- Tối đa 60 ảnh trong app (giữ nguyên giới hạn cũ). Vượt 60 thì
  app đã không cho thêm từ trước — sao lưu không phải nơi để
  nới giới hạn này.
- Ảnh đã xoá trong app thì không đưa vào backup (chỉ sao lưu ảnh
  đang còn).

## 6. Luồng nhập (khôi phục) — đọc được cả file v1 cũ

1. Người dùng vào Cài đặt → Sao lưu → "Mở bản sao lưu", chọn file.
2. Đọc file:
   - JSON hỏng / không phải JSON → từ chối: "File này không giống
     bản sao lưu của FotoBro." Không ghi đè gì.
   - Envelope mã hoá (§2.2) → hỏi mật khẩu, giải mã theo §4.
     Sai mật khẩu → báo "Sai mật khẩu sao lưu." Dừng, không ghi
     đè dữ liệu hiện tại.
   - Envelope v2 thường (§2.1) → dùng `parseBackup` của prototype.
   - File v1 cũ `{jobs, txs, cfg}` → đọc được, trả về dạng
     `{kind: 'v1-legacy', photos: [], checkDone: {}, uid: 0}`.
     Báo rõ trước khi khôi phục: "Đây là bản sao lưu cũ, không
     có ảnh. Khôi phục xong ảnh trang chủ vẫn trống."
   - File ảnh riêng (§5.2) được chọn một mình → báo như §5.2
     mục 4, không khôi phục.
3. Hiện bản xem trước: số job, số khoản thu chi, số ảnh, ngày xuất
   (`exportedAt`), phiên bản app lúc xuất. Người dùng xác nhận
   mới khôi phục.
4. **Khôi phục là thay thế hay gộp?** Mặc định: **thay thế toàn bộ**
   dữ liệu hiện tại bằng dữ liệu trong file (jobs/txs/cfg/checkDone/
   uid/photos). Lý do: sao lưu là "bản chụp" tại một thời điểm, gộp
   hai bản dễ sinh trùng id và sai tiền. Trước khi thay thế, app
   **tự tạo một bản sao lưu an toàn** của dữ liệu hiện tại (ghi đè
   vào bộ nhớ tạm trong app, không cần người dùng làm gì) để nếu
   khôi phục nhầm thì còn đường quay lại. Báo rõ: "Khôi phục sẽ
   thay thế toàn bộ dữ liệu hiện tại. Đã lưu bản dự phòng."
   - Ngoại lệ duy nhất: file v1 cũ không có `uid`/`checkDone` →
     giữ `uid`/`checkDone` hiện tại, không ghi đè bằng 0/rỗng.
5. Ghi ảnh vào IndexedDB `troLyXeoPhotos` (ghi đè ảnh cùng `id`,
   thêm ảnh mới). Ảnh trong file tách riêng thì làm sau bước 4
   theo §5.2 mục 3.
6. Hiện xác nhận: "Đã khôi phục xong — 12 job, 40 khoản thu chi,
   6 ảnh" (hoặc ghi rõ số ảnh thiếu nếu có).
7. Cập nhật `fotobro.lastBackupAt` = thời điểm khôi phục? **Không.**
   `lastBackupAt` chỉ ghi lúc **xuất** sao lưu thành công (§3 mục 6).
   Khôi phục xong nên nhắc người dùng xuất một bản mới ngay để có
   bản sao lưu của trạng thái vừa khôi phục.

An toàn dữ liệu: mọi lỗi ở bước 2–3 đều dừng **trước khi** ghi đè.
Không bao giờ xoá dữ liệu hiện tại chỉ vì đọc file lỗi.

## 7. Nhắc sao lưu 7 ngày

Lấy nguyên từ prototype (`backupStatus`, `BACKUP_REMIND_DAYS = 7`,
đã test):

- Chưa từng sao lưu (`fotobro.lastBackupAt` trống) → nhắc luôn:
  "Bạn chưa sao lưu lần nào, tải một bản cho chắc nhé."
- Đã sao lưu, quá 7 ngày → nhắc: "Bạn chưa sao lưu {số ngày}
  ngày rồi, tải một bản cho chắc nhé."
- Chưa quá 7 ngày → không nhắc.
- Chỉ hiện banner / dòng nhắc trên màn Hôm nay, **không chặn**
  người dùng, không bắt buộc sao lưu mới cho dùng tiếp.
- Bấm "Sao lưu ngay" từ banner → vào thẳng màn xuất (§3).
  Bấm đóng banner → ẩn tới lần nhắc sau (không tắt vĩnh viễn
  trong v1 — người dùng quên sao lưu là mất dữ liệu, nên đừng
  cho tắt hẳn).

## 8. Checklist nối vào app iOS v1 (cho agent iOS)

Dùng lại module prototype `fotobro-scale.js` (đã test 13/13), không
viết lại logic backup/crypto từ đầu:

- [ ] Nối `buildBackup` / `parseBackup` / `backupFileName` /
      `backupStatus` / `encryptBackup` / `decryptBackup` vào app
      theo `fotobro-scale/docs/WIRING.md` (phần Nấc 1).
- [ ] Đọc ảnh từ IndexedDB `troLyXeoPhotos`, nén bằng
      `shrinkPhoto()` đã có trong base trước khi đưa vào backup.
- [ ] Viết mới phần tách ảnh > 25 MB theo §5.2 (prototype chưa
      có code phần này) + trường `photosSplit` / `photosFile`.
- [ ] Màn Cài đặt → Sao lưu: nút xuất, nút nhập, bật/tắt mã hoá
      (nhập mật khẩu 2 lần khi bật), banner nhắc 7 ngày trên Hôm nay.
- [ ] Khôi phục thay thế toàn bộ + tự lưu bản dự phòng trước khi
      ghi đè (xem §6 mục 4). File v1 cũ giữ `uid`/`checkDone` hiện tại.
- [ ] Cập nhật `fotobro.lastBackupAt` chỉ khi xuất thành công.
- [ ] Test lại trên app thật: (1) xuất v2 không mã hoá → nhập lại
      tròn; (2) xuất v2 mã hoá → sai mật khẩu báo lỗi, đúng mật khẩu
      mở được; (3) file v1 cũ `{jobs,txs,cfg}` đọc được, báo thiếu
      ảnh; (4) file rác bị từ chối, dữ liệu hiện tại còn nguyên;
      (5) file > 25 MB tách 2 file, khôi phục thiếu file ảnh thì
      báo rõ; (6) banner nhắc sau 7 ngày / chưa từng sao lưu.
- [ ] Ghi `appVersion: "1.0"` trong envelope v2 (không ghi "2.6" —
      đó là số phiên bản web cũ, prototype để mặc định "2.6").

## 9. Câu hỏi chờ Việt chốt

1. **Mất mật khẩu sao lưu mã hoá thì sao?** Mặc định đề xuất:
   mất là mất, không khôi phục. Có chấp nhận không, hay muốn cho
   khôi phục bằng Apple ID (kém an toàn hơn)?
2. **Ngưỡng tách ảnh 25 MB có giữ không?** Đề xuất giữ. Muốn đổi
   (ví dụ 10 MB cho nhẹ, hay 50 MB cho đỡ tách) thì nói.
3. **Khôi phục thay thế toàn bộ (mặc định §6) hay cho chọn gộp?**
   Đề xuất thay thế + tự lưu bản dự phòng. Gộp chỉ làm nếu Việt
   yêu cầu rõ (dễ trùng id, sai tiền).
