# FotoBro — Spec migration dữ liệu V1 → V2

> Ngày: 20/11/2026. Trạng thái: **thiết kế, chưa code vào app.**
> Phạm vi: chỉ file này là mới. Không sửa bất kỳ file nào khác trong
> `~/workspace/fotobro-ios-v1/`, không tạo tài khoản, không push GitHub.
> Nguồn sự thật (đã đọc, không suy đoán):
>
> - Định dạng cũ (V1): `www/index.html` — `LS_KEY = 'troLyXeo.v1'`,
>   `cleanData()` / `mergeCfg()` / `DEFAULT_CFG` / `seed()` (dòng ~781–900),
>   IndexedDB `troLyXeoPhotos` (dòng ~3722–3790), `checkDone` (dòng ~905,
>   1645–1719), import sao lưu v1 (dòng ~2238).
> - Định dạng mới (V2): `BACKUP-V2.md` (envelope file sao lưu v2),
>   `CLOUDKIT-PLAN.md` §2–§4 (record types CloudKit Nấc 2),
>   prototype `~/workspace/fotobro-scale/src/fotobro-scale.js`
>   (`buildBackup` / `parseBackup` / outbox / `resolveConflict`, test 13/13)
>   và `~/workspace/fotobro-scale/src/cloudkit-schema.json` (schema mẫu).
>
> Quy ước tên trong file này:
>
> - **V1** = định dạng hiện tại trên máy: `localStorage['troLyXeo.v1']`
>   + IndexedDB `troLyXeoPhotos` (app FotoBro iOS v1, kế thừa từ
>   Trợ lý Xèo web v2.5). Đây là **nguồn thật (source of truth)**.
> - **V2** = hai đích mới, cùng một lần migration nhưng hai định dạng:
>   - **V2-file**: file sao lưu `fotobro-backup` version 2
>     (`BACKUP-V2.md` §2.1, có/không mã hoá §2.2).
>   - **V2-cloud**: record CloudKit trong zone `FotoBroZone`,
>     container `iCloud.com.fotobro.app`, privateDB
>     (`CLOUDKIT-PLAN.md` §2.3): `Job`, `Tx`, `Config`, `PhotoMeta`,
>     `EncryptedBackup`.
> - **Không có V2-local**: migration này **không đổi key localStorage**,
>   không tạo key `fotobro.v2`, không đổi tên IndexedDB. App V2 vẫn đọc
>   và ghi `troLyXeo.v1` / `troLyXeoPhotos` như cũ. Đổi key là mất dữ
>   liệu Xèo — cấm.

## Báo cáo theo mẫu 7 mục (Quy trình Vibe Coding)

1. **Mục tiêu:** Spec đầy đủ để chuyển dữ liệu V1 sang V2 mà không mất
   một job, một khoản tiền, một ảnh nào của Xèo: bảng đổi tên/thêm/bỏ
   từng trường, mặc định cho dữ liệu cũ, quy tắc làm sạch, tương thích
   ngược, và rollback.
2. **Đã thực hiện:** Đọc code thật của app (`cleanData`, `mergeCfg`,
   `DEFAULT_CFG`, schema ảnh, `checkDone`, import v1) và đối chiếu với
   `BACKUP-V2.md`, `CLOUDKIT-PLAN.md`, prototype scale và
   `cloudkit-schema.json`; ghi lại mọi chỗ hai nguồn mới lệch nhau
   (§8) thay vì tự chọn lặng lẽ. Chỉ viết file này.
3. **Kết quả kiểm tra:** Bảng mapping §2–§5 bao phủ 100% trường V1
   (Job 20 trường, Tx 8 trường, Config ~30 trường, Photo 3 trường,
   envelope + 14 key localStorage phụ). Chưa có code migration nên chưa
   chạy test — checklist test ở §7.
4. **Vấn đề còn tồn tại:** 5 điểm lệch giữa các nguồn thiết kế (§8)
   cần chốt trước khi code, nổi bật: tên field ngày của Tx
   (`txDate` hay `date`), ảnh CloudKit chỉ metadata (`PhotoMeta`) hay
   cả file gốc (`PhotoRef.asset`), và import v1 trong app hiện tại
   xoá `checkDone` trong khi `BACKUP-V2.md` §6 yêu cầu giữ lại.
5. **Điều kiện chuyển bước:** Việt (hoặc agent iOS) chốt §8 → code
   migration theo §6 → chạy checklist §7 trên app thật → mới giao.
6. **Bước tiếp theo:** Chốt 5 câu §8, rồi nối module migration theo
   thứ tự §6.4 (V2-file trước, V2-cloud sau — đúng thứ tự
   `CLOUDKIT-PLAN.md` §2.2).
7. **Trạng thái:** **Spec xong, chưa code.**

---

## 1. Nguyên tắc migration (bắt buộc, không thương lượng)

| # | Nguyên tắc | Hệ quả cụ thể |
|---|---|---|
| M1 | **V1 là nguồn thật, chỉ đọc.** | Migration chỉ đọc `troLyXeo.v1` + `troLyXeoPhotos`. Không ghi đè, không xoá, không đổi tên key trong lúc migrate. |
| M2 | **Không mất dữ liệu im lặng.** | Trường nào V2 không chứa thì phải vào đúng 1 trong 3 nhóm: giữ local (§2.5/§3.5/§4.5), nhét vào `note`/JSON chuỗi, hoặc ghi vào log migration để user soi. Không được bỏ lặng lẽ. |
| M3 | **Migrate là sao chép, không phải chuyển nhà.** | Sau migration, V1 vẫn đầy đủ trên máy và app vẫn chạy được bằng V1 thuần (tắt Nấc 2 là về local, `CLOUDKIT-PLAN.md` §1.5). |
| M4 | **Idempotent (chạy lại được).** | Chạy migration 2 lần cho cùng dữ liệu V1 phải cho cùng kết quả V2, không nhân đôi job/tx/ảnh. Khoá chống trùng là `localId` (§6.2). |
| M5 | **Làm sạch trước, migrate sau.** | Mọi dữ liệu V1 đều qua `cleanData()` / `mergeCfg()` đã có trong app trước khi map sang V2. Không viết hàm làm sạch thứ hai. Dữ liệu bẩn (kiểu sai, ngày sai, id trùng) được sửa theo §6.1, không bị loại lặng lẽ. |
| M6 | **V2-file trước, V2-cloud sau.** | Đúng thứ tự `CLOUDKIT-PLAN.md` §2.2: sao lưu mã hoá nguyên file (rủi ro thấp) chạy ổn rồi mới sync từng record. |
| M7 | **Mọi thay đổi có dấu vết.** | Migration ghi 1 bản ghi vào log (`fotobro.migrationLog`, tối đa 200 dòng, theo mẫu `fotobro.syncState.log`): thời gian, số job/tx/photo/cfg đã map, số trường bị bỏ, số bản ghi sửa mặc định. |

---

## 2. Job — V1 → V2

### 2.1 Nguồn V1 (sau `cleanData()`, `www/index.html` ~dòng 879–895)

Một job V1 có 20 trường. `id` là số nguyên, bắt đầu từ 100
(`uid = 100`, `nid()` tăng dần). `stage` là 1 trong 8 bước
`STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']`.
`type` là 1 trong 6 loại `TYPES = ['Portrait','Couple','Wedding','Lookbook','Event','Khác']`.
`medium` là 1 trong 3 `MEDIUMS = ['Digital','Film','Cả hai']`, mặc định `'Digital'`.

### 2.2 Bảng mapping

| Trường V1 | V2-file (backup JSON) | V2-cloud (`Job` record) | Ghi chú |
|---|---|---|---|
| `id` (Int) | giữ nguyên `id` | → `localId` (Int64) | Khoá nối hai chiều. `recordName` đề xuất: `job-<localId>` (§6.2). |
| `client` | giữ nguyên | → `client` (String, **mã hoá tầng app** trước khi ghi, `CLOUDKIT-PLAN.md` §3) | Tên khách là dữ liệu nhạy cảm. |
| `type` | giữ nguyên | → `type` (String) | Giá trị lạ → `'Khác'` (đã có trong `cleanData`). |
| `stage` | giữ nguyên | → `stage` (String) | Giá trị lạ → `'Tư vấn'`. |
| `medium` | giữ nguyên | → `medium` (String) | Giá trị lạ → `'Digital'` (`normMedium`). |
| `shootDate` (`YYYY-MM-DD` hoặc `''`) | giữ nguyên | → `shootDate` (Date/Time) | `''` → **không set field** (không ghi ngày giả). Xem §6.3. |
| `shootTime` (`HH:MM` hoặc `''`) | giữ nguyên | → `shootTime` (String) | `''` → không set field. |
| `location` | giữ nguyên | → `location` (String) | |
| `deadline` (`YYYY-MM-DD` hoặc `''`) | giữ nguyên | → `deadline` (Date/Time) | `''` → không set field. |
| `price` (Int ≥ 0, VND) | giữ nguyên | → `price` (Int64) | `price = 0` nghĩa là "chưa tính được" (Film chưa đặt giá, hoặc Cả hai thiếu một bảng — `priceFor()`), **không** nghĩa là miễn phí. Giữ 0, không đổi thành null. |
| `phone` (chỉ số/`+`) | giữ nguyên | **KHÔNG sync** | Giữ local-only (`CLOUDKIT-PLAN.md` §2.3: không lưu vào `Job`). |
| `email` | giữ nguyên | **KHÔNG sync** | Giữ local-only, cùng lý do. |
| `fbLink` (URL đã qua `safeUrl`) | giữ nguyên | **KHÔNG sync** | Giữ local-only. |
| `msLink` | giữ nguyên | **KHÔNG sync** | Giữ local-only. |
| `driveLink` | giữ nguyên | **KHÔNG sync** | Giữ local-only. |
| `note` (tối đa 3000 ký tự) | giữ nguyên | → `note` (String) | |
| `calUid` | giữ nguyên | **KHÔNG sync** | ID lịch local, vô nghĩa trên máy khác. |
| `gEventId` | giữ nguyên | **KHÔNG sync** | ID event Google Calendar, vô nghĩa trên máy khác. |
| `cancelled` (bool) | giữ nguyên | → `deleted` (Int64) | `cancelled=true` → `deleted=1`; `false` → `0`. **Nhưng** V1 còn giữ job đã huỷ để khôi phục (`cancelledFrom`); V2-cloud chỉ có soft-delete. Xem §2.4. |
| `cancelledFrom` (tên bước trước khi huỷ, hoặc `''`) | giữ nguyên | **KHÔNG sync — gộp vào `note`** | Khi `cancelled=true` và `cancelledFrom` khác rỗng, append vào cuối `note` V2-cloud: `"\n[Đã huỷ khi đang ở bước <cancelledFrom>]"`. Để khi về lại local, `cancelledFrom` không phục hồi được từ cloud — xem §2.4. |
| — (không có ở V1) | — | `+ workspaceId` (String) | **Thêm mới.** Mặc định `''` = dữ liệu cá nhân (Nấc 2). Nấc 3 mới có giá trị. |
| — (không có ở V1) | — | `+ updatedAt` (Date/Time) | **Thêm mới.** V1 không lưu thời gian sửa. Mặc định = thời điểm migration (§6.3). Là gốc so xung đột last-write-wins. |
| — (không có ở V1) | — | `+ stageSince`? **KHÔNG thêm** | V1 có `stageSince` nội bộ để tính job kẹt (`stuckInfo()`), nhưng đó là trường suy ra (đặt = ngày đổi bước). CloudKit không cần; máy khác tự tính lại từ lần sync đầu. Không sync. |

### 2.3 Mặc định cho dữ liệu cũ (job)

| Tình huống V1 | Mặc định V2 |
|---|---|
| Thiếu `id`, hoặc `id` trùng, hoặc `id` không phải số | Cấp id mới = `maxId + 1` tăng dần (đúng logic `pending` trong `cleanData()`). Ghi log số job được cấp lại id. |
| `client` rỗng | `'Khách chưa đặt tên'` (đã có trong `cleanData`). |
| `type` / `stage` / `medium` lạ hoặc thiếu | `'Khác'` / `'Tư vấn'` / `'Digital'`. |
| `shootDate` / `deadline` sai định dạng hoặc ngày không tồn tại | `''` ở V2-file; không set field ở V2-cloud. Không tự đoán ngày. |
| `price` âm, chuỗi, hoặc NaN | `0` (`cleanNum`). |
| `phone` chứa chữ | Chỉ giữ số và `+`, còn lại bỏ (`cleanData`). |
| `fbLink`/`msLink`/`driveLink` là `javascript:`/`data:` hoặc scheme lạ | `''` (`safeUrl` chặn). |
| Job có `stage='Xong'` nhưng `deadline` đã qua | Giữ nguyên, không đổi stage. Migration không sửa logic nghiệp vụ. |
| Job `cancelled=true` | V2-file giữ nguyên cả `cancelled` + `cancelledFrom`. V2-cloud: `deleted=1`, `cancelledFrom` gộp vào `note` (§2.2). |

### 2.4 Tương thích ngược — job đã huỷ (điểm mất mát duy nhất, phải nói rõ)

- V1 phân biệt **huỷ** (`cancelled=true`, khôi phục được về `'Tư vấn'`,
  nhớ `cancelledFrom`) với **xoá hẳn** (xoá khỏi mảng `jobs`, mất luôn).
- V2-cloud chỉ có `deleted` (0/1): job `cancelled` lên cloud thành
  `deleted=1`. Khi máy khác kéo về, nó chỉ biết "đã xoá", **không**
  khôi phục được `cancelledFrom` (dù đã gộp vào `note`, đó chỉ là chữ
  để người đọc, app không parse lại).
- **Quy tắc:** job đã huỷ **không được coi là đã đồng bộ xong** chỉ vì
  lên cloud. Nguồn thật của job huỷ vẫn là V1 local + file V2-file
  (giữ đủ `cancelled`/`cancelledFrom`). Nếu user xoá hẳn job huỷ ở
  local thì mới soft-delete thật. Không tự xoá record cloud khi user
  chỉ bấm "Huỷ job" — phải đợi user xác nhận xoá hẳn hoặc hết thời
  gian giữ (đề xuất: giữ record `deleted=1` tối thiểu 30 ngày trước
  khi dọn, xem §7 mục 9).
- V2-file **không mất gì**: giữ nguyên 20 trường.

### 2.5 Trường V1 không lên V2-cloud — tóm tắt

`phone`, `email`, `fbLink`, `msLink`, `driveLink`, `calUid`,
`gEventId` ở lại local-only. Lý do: liên hệ/link riêng tư + ID lịch
chỉ có nghĩa trên máy gốc (`CLOUDKIT-PLAN.md` §2.3). Hệ quả phải nói
với user: **đăng nhập máy mới, đồng bộ cloud xong vẫn thiếu số điện
thoại/email/link của khách** — muốn đủ phải khôi phục từ file V2-file
(đủ 20 trường) chứ không phải từ cloud. Nếu Việt muốn sync cả liên
hệ thì phải thêm field mã hoá ở bản sau, không thêm lặng lẽ.

---

## 3. Tx (giao dịch thu/chi) — V1 → V2

### 3.1 Nguồn V1 (sau `cleanData()`)

Một tx V1 có 8 trường: `id`, `kind` (`'thu'` | `'chi'`, lạ → `'thu'`),
`category`, `jobId` (số id job, hoặc `''` = chi vận hành không gắn
job), `amount` (Int > 0 — tx `amount ≤ 0` bị **loại khỏi mảng** ngay
trong `cleanData()`), `date` (`YYYY-MM-DD`, sai → hôm nay),
`method` (mặc định `'Chuyển khoản'`), `note` (tối đa 500 ký tự),
`src` (tối đa 80 ký tự, nguồn ghi: `'gm:<gmailId>'` khi ghi từ Gmail,
hoặc rỗng).

### 3.2 Bảng mapping

| Trường V1 | V2-file | V2-cloud (`Tx` record) | Ghi chú |
|---|---|---|---|
| `id` (Int) | giữ nguyên `id` | → `localId` (Int64) | `recordName` đề xuất: `tx-<localId>`. |
| `kind` | giữ nguyên | → `kind` (String) | Chỉ `'thu'`/`'chi'`. |
| `category` | giữ nguyên | → `category` (String) | V1 không chuẩn hoá category lạ (chỉ mặc định khi rỗng). V2-cloud giữ nguyên chuỗi, không ép vào danh mục. |
| `jobId` (Int hoặc `''`) | giữ nguyên | → `jobLocalId` (Int64) | `''` → `0` = không gắn job. **Chỉ map khi job đó còn tồn tại** sau khi map Job (§2); tx trỏ tới job đã bị xoá hẳn → `jobLocalId=0` + ghi log (không xoá tx). |
| `amount` (Int > 0) | giữ nguyên | → `amount` (Int64) | VND, số nguyên. Không quy đổi theo `currency` (V2-cloud lưu VND; `currency='USD'` ở Config chỉ đổi hiển thị — `CLOUDKIT-PLAN.md` §2.3). |
| `date` | giữ nguyên | → `txDate` (Date/Time) | Đổi tên `date` → `txDate` (xem §8.1: prototype scale ghi `date`, `CLOUDKIT-PLAN.md` ghi `txDate` — spec này chốt `txDate`). |
| `method` | giữ nguyên | **KHÔNG sync** | Phương thức thanh toán ở lại local-only (không có field tương ứng; cũng không nhét vào `note` vì dễ làm sai báo cáo khi parse lại). |
| `note` | giữ nguyên | → `note` (String) | Mã hoá tầng app nếu chứa thông tin nhạy cảm (theo §3 `CLOUDKIT-PLAN.md`). |
| `src` | giữ nguyên | **KHÔNG sync** | ID nguồn (`'gm:…'`) chỉ có nghĩa trên máy gốc. |
| — | — | `+ workspaceId` (String) | Thêm mới, mặc định `''`. |
| — | — | `+ updatedAt` (Date/Time) | Thêm mới, mặc định = thời điểm migration. |
| — | — | `+ deleted` (Int64) | Thêm mới, mặc định `0`. V1 không có khái niệm xoá mềm tx — tx chỉ bị xoá hẳn khỏi mảng. |

### 3.3 Mặc định cho dữ liệu cũ (tx)

| Tình huống V1 | Mặc định V2 |
|---|---|
| `amount ≤ 0`, NaN, chuỗi không số | **Loại khỏi migration** (đúng `cleanData()` — tx không có tiền thì không phải giao dịch). Ghi log số tx bị loại + tổng số tiền liên quan (= 0). |
| `date` sai định dạng | Ngày hôm nay (`dstr(0)`, đúng `cleanData()`). Ghi log nếu số lượng lớn (> 5% tổng tx) vì có thể là lỗi nhập hàng loạt. |
| `jobId` trỏ tới job không tồn tại | `jobLocalId = 0`, giữ tx (tiền vẫn là tiền). Ghi log. |
| `kind` khác `'thu'`/`'chi'` | `'thu'`. |
| `category` rỗng | `'Thu khác'` (kind thu) / `'Phát sinh khác'` (kind chi). |
| `method` rỗng | `'Chuyển khoản'` ở V2-file; V2-cloud không có field này. |
| `id` trùng/thiếu | Cấp lại như Job (§2.3). **Lưu ý:** cấp lại id tx phải xong trước khi map `jobId` (không liên quan) nhưng sau khi map Job (để kiểm tra `jobId` còn tồn tại). Thứ tự: Job → Tx. |

### 3.4 Điểm mất mát: tx khấu hao và tx tự sinh

- Tx khấu hao thiết bị (`category='Khấu hao thiết bị'`, `method='Khấu hao'`,
  tự sinh mỗi lần mở báo cáo) và tx chi cố định tháng **không có gì
  đặc biệt ở V2** — chúng là tx thường, migrate như tx thường. Nhưng
  vì `method` không lên cloud, máy khác kéo về sẽ thấy tx khấu hao
  mà không biết nó là tx tự sinh (không phân biệt được với tx chi
  người dùng tự ghi). **Quy tắc:** không tự sinh lại tx khấu hao trên
  máy khác từ dữ liệu cloud (tránh nhân đôi). Việc tự sinh khấu hao
  chỉ chạy trên dữ liệu local. Ghi chú này vào log migration nếu có
  tx khấu hao trong dữ liệu.
- Tx `src='gm:<id>'` (ghi từ Gmail): `src` không lên cloud nên máy
  khác không biết tx này đã nối với email nào — chấp nhận được, vì
  Gmail cũng là local-only (token không sync).

### 3.5 Tương thích ngược

- V2-file giữ đủ 8 trường → khôi phục từ file là tròn 100%.
- V2-cloud thiếu `method` + `src`: máy mới đồng bộ từ cloud rồi
  **xuất file V2-file từ máy mới sẽ thiếu 2 trường này** (method về
  mặc định `'Chuyển khoản'`, src về `''`). Đây là mất mát một chiều,
  phải ghi trong màn Đồng bộ: "Đồng bộ cloud không mang theo phương
  thức thanh toán và nguồn ghi."

---

## 4. Config (cài đặt) — V1 → V2

### 4.1 Nguồn V1 (`DEFAULT_CFG` + `mergeCfg()`)

Config V1 có ~30 trường (xem `DEFAULT_CFG`, dòng ~813–820). Một số
có giá trị mặc định quan trọng: `depositPct: 40`, `deliverDays: 14`,
`theme: 'warm'`, `locale: 'vi'`, `currency: 'VND'`, `glass: true`,
`gFeat: {cal:true, bank:false, leads:false, contacts:false,
drive:false, calw:false, send:false}`, `prices`/`pricesFilm` mặc định
0 cho cả 5 loại, `tagline: 'portrait | lookbook | wedding'`.

### 4.2 Bảng mapping

| Trường V1 | V2-file | V2-cloud (`Config` record, `recordName='config'`) | Ghi chú |
|---|---|---|---|
| `name` | giữ nguyên | → `ownerName` (String) | **Đổi tên.** |
| `studio` | giữ nguyên | → `studioName` (String) | **Đổi tên.** |
| `instagram` | giữ nguyên | **KHÔNG sync** | Không có field tương ứng. Giữ local. |
| `tagline` | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `prices` (object 5 loại) | giữ nguyên | → `prices` (String = **chuỗi JSON**) | CloudKit không có kiểu JSON (`CLOUDKIT-PLAN.md` §2.3). `JSON.stringify` khi lên, `JSON.parse` khi xuống. Loại lạ ngoài 5 loại thì bỏ (đúng `mergeCfg`). |
| `pricesFilm` (object 5 loại) | giữ nguyên | → `pricesFilm` (String = chuỗi JSON) | Như trên. Giá film `0` = chưa đặt — giữ 0. |
| `extraHour` / `extraLoc` / `retouch` / `album` (phí phát sinh) | giữ nguyên | **KHÔNG sync** | Không có field tương ứng. Giữ local. |
| `depositPct` | giữ nguyên | → `depositPct` (Int64) | Kẹp 0–100 (`mergeCfg`). |
| `deliverDays` | giữ nguyên | → `deliverDays` (Int64) | Kẹp 1–365. |
| `equipment[]` (`{id, name, price, years}`) | giữ nguyên | **KHÔNG sync** | Giữ local. Id thiết bị dùng dải riêng từ 900000 (`mergeCfg` `cid()`). |
| `fixed[]` (`{id, name, category, amount}`) | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `checkExtra` (checklist thêm theo loại job) | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `theme` (`warm`/`minimal`/`dark`) | giữ nguyên | **KHÔNG sync** | Giao diện máy nào máy nấy. Lạ → `'warm'`. |
| `petals` (bool) | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `gCals[]` (tối đa 30 lịch Google) | giữ nguyên | **KHÔNG sync** | ID lịch Google, local-only. |
| `gFeat` (6 cờ tính năng Google) | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `glass` (bool) | giữ nguyên | **KHÔNG sync** | Giữ local. |
| `locale` (`vi`/`en`) | giữ nguyên | → `locale` (String) | Lạ → `'vi'`. |
| `currency` (`VND`/`USD`) | giữ nguyên | → `currency` (String) | Chỉ đổi hiển thị, không quy đổi tỷ giá. Lạ → `'VND'`. |
| `logo` (data URL/base64, tối đa 300000 ký tự) | giữ nguyên | **KHÔNG sync** | File local, không sync ở v1 (`CLOUDKIT-PLAN.md` §2.3). |
| `mailTpls` (`{confirm, deposit, remind, deliver, balance: {s, b}}`) | giữ nguyên | **KHÔNG sync** | Giữ local. Key lạ ngoài 5 mẫu thì bỏ (`mergeCfg`). |
| — | — | `+ updatedAt` (Date/Time) | Thêm mới, mặc định = thời điểm migration. |
| — | — | `+ currency` lưu ý | Xem §4.3: `currency` không đổi giá trị tiền. |

### 4.3 Mặc định cho dữ liệu cũ (config)

- Config cũ thiếu trường → lấy `DEFAULT_CFG` (đúng `mergeCfg()`).
  Không tự đoán: ví dụ máy cũ chưa có `pricesFilm` (thêm ở bản film
  v2.5) thì `pricesFilm` = 5 loại đều `0` = chưa đặt giá film.
- Config cũ có trường lạ (do sửa tay file sao lưu) → `mergeCfg()`
  bỏ qua. Ghi log số field lạ bị bỏ.
- `prices`/`pricesFilm` có loại job lạ (không trong 5 loại) → bỏ
  loại đó, giữ 5 loại chuẩn.
- `equipment`/`fixed` trùng id → cấp lại từ 900001 trở lên (đúng
  `mergeCfg` `cid()`).
- **Xung đột Config giữa 2 máy:** Config là 1 record duy nhất nên
  last-write-wins áp cho **cả record**, không gộp từng trường
  (`CLOUDKIT-PLAN.md` §4.3). Máy A đổi giá Wedding, máy B đổi
  `depositPct`, máy B sync sau → giá Wedding của máy A mất. Đây là
  hành vi đã chốt trong thiết kế; spec này chỉ yêu cầu **ghi log**
  và hiện cảnh báo khi Config bị ghi đè bởi bản mới hơn ("Cài đặt
  trên máy này đã bị thay bằng cài đặt từ máy khác lúc <giờ>").

### 4.4 Tương thích ngược

- V2-file giữ đủ Config → khôi phục từ file là tròn.
- V2-cloud chỉ mang 8 field (`ownerName`, `studioName`, `locale`,
  `currency`, `prices`, `pricesFilm`, `depositPct`, `deliverDays`).
  Máy mới đồng bộ từ cloud: các field còn lại về mặc định
  `DEFAULT_CFG` (theme warm, tagline mặc định, `gFeat` mặc định…).
  **Phải báo trước cho user** trong màn Đồng bộ lần đầu: "Đồng bộ
  lần đầu sẽ đặt lại giao diện, mẫu tin nhắn và bảng phí phát sinh
  về mặc định trên máy này — giá chụp và % cọc thì giữ nguyên."

---

## 5. Ảnh + `checkDone` + `uid` + key phụ — V1 → V2

### 5.1 Ảnh trang chủ (IndexedDB `troLyXeoPhotos`)

| Hạng mục | V1 (thật trong code) | V2-file | V2-cloud |
|---|---|---|---|
| DB / store | DB `troLyXeoPhotos` v1, store `photos`, `keyPath: 'id'` | — | — |
| 1 bản ghi | `{ id: string, blob: Blob (JPEG đã nén bởi `shrinkPhoto()`, cạnh dài ≤ 1400px, chất lượng 0.85), added: number (ms epoch) }` | `{ id, dataUrl, addedAt }` | `PhotoMeta`: `{ localId, jobLocalId, fileName, addedAt, updatedAt, deleted }` — **chỉ metadata, không ảnh gốc** |
| `id` | Chuỗi `Date.now().toString(36) + '-' + i + '-' + random` | giữ nguyên `id` | → `localId` (String) |
| `blob` | Blob JPEG | → `dataUrl`: `data:image/jpeg;base64,…` (đọc Blob bằng FileReader, **không** nén lại — ảnh đã nén lúc thêm). Xem §5.2. | **KHÔNG sync gốc.** Chỉ metadata. Ảnh gốc ở lại máy + trong file V2-file mã hoá. |
| `added` (ms) | số ms epoch | → `addedAt`: ISO string (`new Date(added).toISOString()`) | → `addedAt` (Date/Time) |
| `jobLocalId` | Không có ở V1 (ảnh trang chủ không gắn job) | Không có | `0` = ảnh trang chủ không gắn job. Thêm mới, mặc định `0`. |
| `fileName` | Không có ở V1 (tên file gốc không được lưu) | Không có | Thêm mới, mặc định `''` (không bịa tên file). |
| Giới hạn | Tối đa 60 ảnh (`MAX_PHOTOS`) | Giữ 60. Vượt thì backup không nới giới hạn (`BACKUP-V2.md` §5.3). | Giữ 60. |

#### 5.2 ⚠️ Lệch giữa code thật và `BACKUP-V2.md` — phải xử lý khi code

- `BACKUP-V2.md` §2.1 viết photo backup là
  `{ id, dataUrl, addedAt }`, nhưng **code thật lưu `{ id, blob,
  added }`** (Blob, không phải dataUrl; `added` là số ms, không
  phải ISO). Migration V2-file **bắt buộc** có bước chuyển:
  `blob → dataUrl` (FileReader → base64) và `added → addedAt`
  (ISO). Không được giả định backup đọc thẳng được từ IndexedDB.
- Chiều ngược lại (khôi phục file V2 → IndexedDB): `dataUrl → Blob`
  (fetch dataUrl → blob) và `addedAt → added` (ms). Ảnh khôi phục
  giữ nguyên `id` gốc để `heroPin` (ghim ảnh hôm nay) không gãy.
- `troLyXeo.heroPin` (`{ date, id }`, chỉ có hiệu lực đúng ngày):
  không đưa vào V2-file lẫn V2-cloud. Máy khác khôi phục xong thì
  ảnh ghim hôm nay mất (về chế độ xoay tự động theo ngày). Chấp nhận
  được — ghim chỉ có nghĩa trong ngày.

### 5.3 `checkDone` (trạng thái checklist đồ chụp)

- V1: object trong `troLyXeo.v1`, key `'job:<id>'` hoặc
  `'type:<loại job>'`, value là map tên món đồ → `true/false`.
  Key `'job:<id>'` bị xoá khi job bị xoá (dòng ~1515, 2611); key
  cũ dạng `'type:<t>'` được migrate nội bộ sang `'type:' + t`
  (dòng ~1645–1648).
- V2-file: giữ nguyên `checkDone` verbatim trong envelope
  (`BACKUP-V2.md` §2.1). Khôi phục file v2 → ghi đè `checkDone`.
- V2-cloud: **không sync**. Không có record nào chứa checklist.
  Máy mới đồng bộ từ cloud thì checklist về rỗng.
- ⚠️ **Lệch cần sửa khi code** (§8.4): code import sao lưu hiện tại
  (dòng ~2238) làm `checkDone = {}` khi khôi phục file v1, trong khi
  `BACKUP-V2.md` §6.4 yêu cầu file v1 cũ thì **giữ** `checkDone`/`uid`
  hiện tại. Migration phải sửa điểm này: file v1 (không có
  `checkDone`/`uid`) → giữ nguyên của máy; file v2 (có đủ) → ghi đè.

### 5.4 `uid` (bộ đếm id)

- V1: số nguyên, bắt đầu 100, tăng mỗi lần tạo job/tx (`nid()`).
  Lưu trong `troLyXeo.v1` cùng `jobs`/`txs`.
- V2-file: giữ nguyên `uid` trong envelope. Khôi phục: `uid` mới =
  `max(uid trong file, maxId trong dữ liệu, cfgMaxId)` — không bao
  giờ để `uid` đi lùi (đi lùi là trùng id, trùng tiền).
- V2-cloud: không có field `uid`. `localId` trên cloud là id đã cấp
  ở local. Máy mới kéo cloud về phải đặt `uid` local =
  `max(localId job, localId tx, 100)` để id mới không đè id cũ.
- File v1 cũ không có `uid` → giữ `uid` hiện tại của máy
  (`BACKUP-V2.md` §6.4), không ghi 0.

### 5.5 Các key localStorage khác — không migrate

| Key | Nội dung | Xử lý |
|---|---|---|
| `troLyXeo.v1` | Dữ liệu chính | **Nguồn migration. Không đổi tên, không xoá.** |
| `troLyXeo.lock` | Khoá app (PIN/Face ID) | Không migrate, không sync. Khoá là của máy. |
| `troLyXeo.gtoken` / `troLyXeo.grefresh` / `troLyXeo.ghadRefresh` | Token Google cũ | **Đã bị code v1 tự xoá** (dòng ~938). Không migrate. Access token chỉ ở sessionStorage. |
| `troLyXeo.gcal` / `troLyXeo.gmail` / `troLyXeo.gseen` / `troLyXeo.gcontacts` / `troLyXeo.gstate` | Cache Google (lịch, mail, liên hệ) | Không migrate, không sync. Máy mới đăng nhập Google lại. |
| `troLyXeo.heroPin` | Ảnh ghim hôm nay | Không migrate (§5.2). |
| `troLyXeo.lastBackup` | Ngày sao lưu cũ (dạng `YYYY-MM-DD`?) | Không migrate. Thay bằng `fotobro.lastBackupAt` (ISO) ở V2-file (`BACKUP-V2.md` §1). |
| `troLyXeo.welcomed` / `troLyXeo.installDismissed` | Cờ onboarding | Không migrate. |
| `fotobro.lastBackupAt` (mới) | Thời điểm sao lưu V2 thành công (ISO) | Chỉ ghi khi **xuất** thành công, không ghi khi khôi phục (`BACKUP-V2.md` §3.6, §6.7). |
| `fotobro.syncState` (mới, Nấc 2) | `{ enabled, provider, lastSyncAt, outbox[], log[], deviceId }` (prototype `fotobro-scale.js` ~dòng 303) | Tạo mới khi bật Nấc 2, mặc định `enabled:false`. Không nhập từ V1. |
| `fotobro.migrationLog` (mới, spec này) | Log migration, tối đa 200 dòng | Tạo mới khi chạy migration lần đầu. |

### 5.6 `sample` (cờ dữ liệu mẫu)

- V1: `sample` trong `troLyXeo.v1`. iOS v1 `seed()` đặt `sample=false`,
  jobs/txs rỗng (không còn job mẫu). Nếu file V1 cũ nào còn
  `sample=true` (từ bản web cũ) thì migration **không** mang cờ này
  sang V2-cloud (không có field). V2-file giữ nguyên `sample` để
  khôi phục đúng. Khuyến nghị: khi migrate, nếu `sample=true` thì
  hỏi user trước ("Dữ liệu này có job mẫu, có mang sang không?"),
  mặc định **không mang job mẫu** sang cloud.

---

## 6. Quy trình migration

### 6.1 Bước 0 — Làm sạch (dùng lại code cũ, không viết mới)

1. Đọc `troLyXeo.v1` → `JSON.parse`. Hỏng → dừng, báo
   "Không đọc được dữ liệu trên máy này", không ghi gì.
2. Chạy `cleanData(d)` cho jobs/txs và `mergeCfg(d.cfg)` cho config
   — đúng hàm đã có trong app. Mọi mặc định §2.3/§3.3/§4.3 đều là
   mặc định của hai hàm này; spec này chỉ ghi lại để kiểm chứng,
   không đặt mặc định mới.
3. Đếm và ghi log: số job/tx/config-field bị sửa mặc định, số tx
   bị loại (`amount ≤ 0`), số id cấp lại, số `jobId` mồ côi.

### 6.2 Bước 1 — Cấp định danh V2 (quyết định của spec này)

- `Job` record: `recordName = 'job-' + localId`.
- `Tx` record: `recordName = 'tx-' + localId`.
- `Config` record: `recordName = 'config'` (1 record/user).
- `PhotoMeta` record: `recordName = 'photo-' + localId`
  (localId ảnh là chuỗi, vd `photo-mk…-0-abc12`).
- `EncryptedBackup` record: `recordName = 'backup-latest'`
  (1 record/user, ghi đè mỗi lần sao lưu — theo `CLOUDKIT-PLAN.md`
  §2.3; xung đột thì giữ bản mới nhất, không gộp).
- `localId` trùng giữa Job và Tx không xung đột vì khác record type
  và khác tiền tố `recordName`. Nhưng **không** dùng chung `uid`
  cho cả Job lẫn Tx trên cloud — `localId` của Job và của Tx đều lấy
  từ cùng bộ đếm `uid` local nên không trùng nhau trong thực tế;
  nếu dữ liệu cũ có trùng (do cấp lại id thủ công) thì migration
  cấp lại trước (§6.1).

### 6.3 Bước 2 — Chuyển kiểu dữ liệu

| V1 | V2 | Quy tắc |
|---|---|---|
| Ngày `YYYY-MM-DD` (`shootDate`, `deadline`, tx `date`) | CloudKit Date/Time | `new Date('YYYY-MM-DD' + 'T00:00:00+07:00')` — **giờ Việt Nam**, không dùng UTC nửa đêm (dùng UTC sẽ lệch sang hôm trước khi hiển thị ở múi giờ +07). Chiều về: lấy phần `YYYY-MM-DD` theo giờ +07. |
| Ngày rỗng `''` | — | Không set field (không ghi `1970-01-01`, không ghi ngày migration). |
| Tiền Int (VND) | Int64 | Giữ nguyên số. Không nhân/chia, không làm tròn thêm (đã là số nguyên). |
| `prices`/`pricesFilm` object | Chuỗi JSON | `JSON.stringify` với đúng 5 key chuẩn, theo thứ tự `Portrait, Couple, Wedding, Lookbook, Event`. Parse lỗi chiều về → về `DEFAULT_CFG` (0 hết) + ghi log. |
| Ảnh `blob` | `dataUrl` (V2-file) | FileReader → base64, giữ MIME `image/jpeg`. Ảnh nào đọc lỗi → bỏ khỏi backup **nhưng báo rõ** ("thiếu 1 ảnh, đọc lỗi") — không báo thành công giả. |
| Ảnh `added` (ms) | `addedAt` (ISO) | `new Date(added).toISOString()`. `added` sai (NaN, âm) → `Date.now()` lúc migration + ghi log. |
| Thiếu `updatedAt` (mọi record) | `updatedAt` | Mặc định = thời điểm migration. Hệ quả: máy migrate sau sẽ thắng máy migrate trước nếu cùng sửa 1 record trong lúc chưa sync — chấp nhận được cho lần đầu; từ lần sau, `updatedAt` được cập nhật mỗi lần sửa local. |
| Bool V1 (`cancelled`) | Int64 (`deleted`) | `true → 1`, `false → 0`. |

### 6.4 Bước 3 — Thứ tự chạy

1. **Snapshot an toàn (bắt buộc trước mọi ghi):** xuất 1 file
   V2-file (không mã hoá cũng được, mã hoá càng tốt) của dữ liệu
   V1 hiện tại, lưu vào Files/máy user + giữ 1 bản trong app
   (bộ nhớ tạm). Snapshot này là đường rollback §6.6.
2. **V2-file:** build envelope theo `BACKUP-V2.md` §2.1
   (`buildBackup` prototype). Kiểm tra `counts` khớp số thực tế.
   File > 25 MB → tách ảnh theo §5.2.
3. **V2-cloud Bước 1 (EncryptedBackup):** mã hoá file V2-file
   (AES-256-GCM + PBKDF2 100k, `BACKUP-V2.md` §4) rồi đẩy lên
   record `EncryptedBackup`. Chỉ khi Bước 1 chạy ổn mới sang Bước 2.
4. **V2-cloud Bước 2 (sync từng record):** map Job → Tx → Config
   → PhotoMeta theo §2–§5, đẩy qua outbox (`fotobro.syncState.outbox`),
   last-write-wins theo `updatedAt`.
5. **Kiểm chứng (§7)** rồi mới hiện "Migration xong" cho user.
   Chưa kiểm chứng xong thì không báo xong.

### 6.5 Xung đột (chỉ V2-cloud)

- Cùng `localId`, `updatedAt` khác nhau → giữ bản mới hơn
  (last-write-wins), ghi log vào `fotobro.syncState.log`
  (tối đa 200 dòng). **Không gộp từng trường** (job/tx nhỏ, gộp
  dễ sai tiền — `CLOUDKIT-PLAN.md` §4.3).
- `updatedAt` bằng nhau (cùng giây) → bản local thắng (máy đang
  migrate là máy user đang cầm), ghi log.
- Config xung đột → cả record thắng/thua theo §4.3, hiện cảnh báo.
- Ảnh: `PhotoMeta` xung đột → giữ bản mới hơn; ảnh gốc chỉ có
  trong file V2-file nên không xung đột ở tầng record.

### 6.6 Rollback (quay lại V1)

Rollback **không cần code đặc biệt**, vì V1 không bị động tới:

| Tình huống | Cách về | Mất gì |
|---|---|---|
| Migration V2-file lỗi giữa chừng | Xoá file lỗi, chạy lại từ V1. V1 còn nguyên. | Không mất gì. |
| Migration V2-cloud lỗi / sync sai | Tắt Nấc 2 (Cài đặt → Đồng bộ → Tắt). App quay về local thuần, dữ liệu V1 còn nguyên. Xoá outbox chưa đẩy. | Dữ liệu cloud dở dang (không ảnh hưởng local). |
| Đã sync sai lên cloud (số liệu sai) | 1) Tắt Nấc 2. 2) Khôi phục từ file snapshot Bước 3.1 (V2-file hoặc file v1 cũ) — khôi phục là **thay thế toàn bộ** (`BACKUP-V2.md` §6.4). 3) Bật lại Nấc 2, sync lại từ đầu. | Mọi thay đổi local sau thời điểm snapshot (phải báo user trước khi khôi phục). |
| Khôi phục nhầm file (user chọn sai file) | App đã tự lưu bản dự phòng trước khi ghi đè (`BACKUP-V2.md` §6.4). Khôi phục lại từ bản dự phòng đó. | Không mất gì nếu làm đúng §6.4. |
| Mất mật khẩu file mã hoá | **Không rollback được file đó.** Mất là mất (`BACKUP-V2.md` §4). Chỉ còn đường: dữ liệu V1 trên máy (nếu máy còn) hoặc file không mã hoá khác. | File mã hoá đó. |
| Đã xoá hẳn job huỷ ở local rồi mới thấy cần | Không lấy lại được từ cloud (`deleted=1` không chứa `cancelledFrom`). Chỉ lấy lại từ file V2-file snapshot (giữ đủ 20 trường). | Chỉ lấy lại được nếu còn file snapshot. |

- **Cấm:** không có thao tác nào trong migration được xoá
  `troLyXeo.v1`, `troLyXeoPhotos`, hay bất kỳ key nào ở §5.5.
  Nút "Xoá toàn bộ dữ liệu" (`wipeAll`) không phải là rollback
  và không được gọi trong migration.
- Thời gian giữ snapshot: giữ file snapshot tối thiểu **30 ngày**
  sau migration (user tự giữ file; app giữ bản dự phòng trong bộ
  nhớ tạm tới lần khôi phục tiếp theo).

### 6.7 Sau migration — dữ liệu nào là thật?

- Local (`troLyXeo.v1`) vẫn là nguồn thật cho máy này.
- Cloud chỉ là bản sao. Tắt Nấc 2 → local vẫn đủ dùng.
- File V2-file là bản sao lưu đầy đủ nhất (đủ 20 trường job, đủ
  `method`/`src`, đủ ảnh gốc, đủ `checkDone`/`uid`) — đầy đủ hơn
  cloud. Khi cần chuyển máy, **khôi phục từ file, không phải từ
  cloud**.

---

## 7. Checklist kiểm tra (chạy trên app thật, không chỉ đọc)

### 7.1 Tương thích ngược (đọc được cái cũ)

- [ ] 1. File sao lưu v1 `{jobs, txs, cfg}` đọc được, báo rõ
      "bản cũ, không có ảnh", giữ `uid`/`checkDone` hiện tại
      (sửa hành vi dòng ~2238 — xem §8.4).
- [ ] 2. File JSON hỏng / file không phải backup → từ chối, dữ liệu
      hiện tại còn nguyên 100%.
- [ ] 3. File v2 mã hoá: sai mật khẩu báo "Sai mật khẩu sao lưu.",
      đúng mật khẩu mở được; quá 5 lần sai liên tiếp khoá 60 giây.
- [ ] 4. App V2 mở được dữ liệu V1 của Xèo mà **không cần migrate
      gì**: tắt Nấc 2, dữ liệu hiện đủ job/tx/tiền/ảnh như cũ.

### 7.2 Migration tròn (đi và về)

- [ ] 5. Job: migrate V1 → V2-file → khôi phục lại → so từng trường
      (§2.2): 20/20 khớp, kể cả job huỷ (`cancelled`/`cancelledFrom`),
      job Film/Cả hai, job giá 0.
- [ ] 6. Tx: migrate → khôi phục → khớp 8/8 trường, tổng tiền thu/chi
      theo tháng **khớp tới đồng** trước/sau. Tx `amount ≤ 0` bị loại
      có ghi log.
- [ ] 7. Config: migrate → khôi phục → `prices`/`pricesFilm` khớp
      từng loại; `depositPct`/`deliverDays` khớp; các field local-only
      (theme, mailTpls, equipment…) còn nguyên trên máy gốc.
- [ ] 8. Ảnh: migrate → khôi phục → đủ số ảnh, đúng `id` (ghim ảnh
      hôm nay không gãy), ảnh mở được. Ảnh lỗi đọc được báo rõ số
      ảnh thiếu, không báo thành công giả.
- [ ] 9. `uid` không đi lùi sau khôi phục: tạo job mới sau khôi phục
      không trùng id cũ. `checkDone` còn nguyên sau khôi phục file v2.
- [ ] 10. Ngày tháng: job ngày `2026-11-20` migrate lên cloud rồi
      kéo về vẫn là `2026-11-20` (không lệch sang 19/11 do UTC —
      kiểm tra ở múi giờ +07).

### 7.3 Cloud + xung đột + rollback

- [ ] 11. Sync lần đầu: số Job/Tx/Config/PhotoMeta trên cloud khớp
      `counts` trong file V2-file.
- [ ] 12. Máy mới đồng bộ từ cloud: job/tx đủ số lượng, tổng tiền
      khớp; các field local-only (phone/email/link/method/src) **được
      báo là thiếu** chứ không im lặng.
- [ ] 13. Xung đột: sửa cùng job trên 2 máy, máy sửa sau thắng,
      log ghi đủ 2 `updatedAt` + người thắng.
- [ ] 14. Mất mạng giữa chừng: outbox còn nguyên, có mạng đẩy tiếp,
      không nhân đôi record (chạy migration/sync 2 lần vẫn 1 bản).
- [ ] 15. Rollback: tắt Nấc 2 → app chạy local bình thường; khôi phục
      từ snapshot → dữ liệu về đúng thời điểm snapshot.
- [ ] 16. File > 25 MB: tách 2 file, khôi phục thiếu file ảnh thì báo
      rõ số ảnh thiếu.
- [ ] 17. Job huỷ: huỷ trên máy A → máy B thấy `deleted=1`; khôi phục
      từ file V2-file vẫn khôi phục được `cancelledFrom`.

---

## 8. Điểm lệch giữa các nguồn — cần chốt trước khi code

| # | Lệch | Các nguồn | Đề xuất của spec này |
|---|---|---|---|
| 8.1 | Tên field ngày của Tx trên cloud: `txDate` hay `date`? | `CLOUDKIT-PLAN.md` §2.3 ghi `txDate`; prototype `fotobro-scale.js` dòng 334 ghi `date` | **Chốt `txDate`** (theo `CLOUDKIT-PLAN.md`, là kế hoạch Nấc 2 chính thức). Sửa prototype cho khớp khi nối code. |
| 8.2 | Ảnh CloudKit: chỉ metadata (`PhotoMeta`) hay cả file gốc (`PhotoRef.asset` = CKAsset)? | `CLOUDKIT-PLAN.md` §2.3–§2.4: chỉ metadata, không ảnh gốc. Prototype `cloudkit-schema.json`: `PhotoRef` có `asset` CKAsset | **Chốt `PhotoMeta` metadata-only** (theo `CLOUDKIT-PLAN.md` §2.4, đã nêu lý do dung lượng/thời gian sync). Ảnh gốc chỉ đi theo file V2-file mã hoá. Nếu Việt muốn sync ảnh gốc giữa các máy thì đổi thiết kế trước khi code, không đổi lặng lẽ lúc code. |
| 8.3 | `appVersion` ghi trong envelope v2 là `"1.0"` hay `"2.6"`? | `BACKUP-V2.md` §8: ghi `"1.0"`. Prototype `buildBackup` mặc định `"2.6"` | **Chốt `"1.0"`** (số phiên bản FotoBro iOS v1; `"2.6"` là số bản web cũ). |
| 8.4 | Khôi phục file v1 cũ: giữ hay xoá `checkDone`? | Code app hiện tại (dòng ~2238): `checkDone = {}` (xoá). `BACKUP-V2.md` §6.4: giữ `checkDone`/`uid` hiện tại | **Chốt giữ** (theo `BACKUP-V2.md`). Sửa dòng ~2238 khi nối migration: chỉ ghi đè `checkDone`/`uid` khi file có 2 trường đó (file v2). |
| 8.5 | Ảnh backup: `{id, dataUrl, addedAt}` hay `{id, blob, added}`? | `BACKUP-V2.md` §2.1 + prototype: `dataUrl`/`addedAt`. Code thật: `blob`/`added` (ms) | Không phải lệch thiết kế mà là **bước chuyển bắt buộc** (§5.2): migration phải convert `blob → dataUrl`, `added → addedAt` khi xuất và ngược lại khi nhập. Ghi rõ trong code, không giả định đọc thẳng được. |

## 9. Câu hỏi chờ Việt chốt

1. **§8.1–8.5:** 5 điểm trên có chốt theo đề xuất không? (Đặc biệt
   §8.2: ảnh gốc có sync giữa các máy không — đổi là đổi dung lượng
   CloudKit + thời gian sync.)
2. **Job đã huỷ giữ bao lâu trên cloud?** Đề xuất giữ record
   `deleted=1` tối thiểu 30 ngày trước khi dọn (§2.4). Đồng ý không?
3. **Đồng bộ lần đầu đặt lại theme/mẫu tin nhắn/phí phát sinh về mặc
   định trên máy mới (§4.4):** có chấp nhận không, hay muốn mang cả
   các field đó lên cloud (thêm field mã hoá)?
4. **Khôi phục mặc định thay thế toàn bộ (§6.6):** giữ nguyên
   (theo `BACKUP-V2.md` §6.4) hay cho chọn gộp?
5. **Mất mật khẩu file mã hoá:** giữ "mất là mất" (`BACKUP-V2.md` §4)
   hay cho khôi phục bằng Apple ID?

---

## Phụ lục A. Toàn cảnh key lưu trữ sau migration

| Nơi lưu | Key / tên | Đổi không? |
|---|---|---|
| localStorage | `troLyXeo.v1` | **Không** — nguồn thật, giữ nguyên |
| localStorage | `troLyXeo.lock`, `troLyXeo.gcal`, `troLyXeo.gmail`, `troLyXeo.gseen`, `troLyXeo.gcontacts`, `troLyXeo.gstate`, `troLyXeo.heroPin`, `troLyXeo.lastBackup`, `troLyXeo.welcomed`, `troLyXeo.installDismissed` | Không — local-only, không migrate (§5.5) |
| localStorage | `fotobro.lastBackupAt` | Mới (V2-file) |
| localStorage | `fotobro.syncState` | Mới (Nấc 2) |
| localStorage | `fotobro.migrationLog` | Mới (spec này) |
| IndexedDB | `troLyXeoPhotos` / store `photos` | **Không** — giữ nguyên tên DB/store |
| File sao lưu | `fotobro-backup-YYYYMMDD.json` (v2) / `tro-ly-xeo-sao-luu.json` (v1 cũ, vẫn đọc được) | Tên file mới cho v2; file v1 cũ vẫn đọc |
| CloudKit | Zone `FotoBroZone`, record `Job`/`Tx`/`Config`/`PhotoMeta`/`EncryptedBackup` | Mới (Nấc 2) |

## Phụ lục B. Từ điển thuật ngữ

- **V1**: định dạng local hiện tại (`troLyXeo.v1` + `troLyXeoPhotos`).
- **V2-file**: file sao lưu `fotobro-backup` version 2.
- **V2-cloud**: record CloudKit Nấc 2.
- **localId**: id số trong app local, khoá nối V1 ↔ V2-cloud.
- **Soft delete**: xoá bằng cờ `deleted=1`, không xoá record thật.
- **Last-write-wins**: xung đột thì bản `updatedAt` mới hơn thắng.
- **Outbox**: hàng đợi thay đổi local chưa đẩy lên cloud.
