# FotoBro iOS v1 — Chính sách lưu giữ dữ liệu (Retention Policy)

> Ngày: 20/11/2026 · Áp dụng cho: FotoBro iOS v1 (Bundle ID `com.fotobro.app`)
> Trạng thái: **v1 — local-first, chưa bật CloudKit, chưa bật Nấc 2/3.**
> Căn cứ đã kiểm chứng từ code thật (không ghi theo suy đoán):
> `www/index.html` (341.754 byte, `LS_KEY = 'troLyXeo.v1'`, hàm `wipeAll()`,
> sao lưu, nhập Lịch iPhone, Google OAuth), `www/capacitor-bridge.js`
> (Local Notifications), `PRIVACY.html`, `BACKUP-V2.md` (thiết kế sao lưu v2,
> chưa code), `CLOUDKIT-PLAN.md` (thiết kế Nấc 2/3, chưa code).
> Văn bản này đi cùng `PRIVACY.html` (nói *dữ liệu ở đâu*) và
> `BACKUP-V2.md` / `CLOUDKIT-PLAN.md` (nói *tính năng sau này làm gì*) —
> còn đây nói *giữ bao lâu và xoá khi nào*.

## 0. Nguyên tắc chung — đọc trước

1. **App v1 KHÔNG tự xoá dữ liệu cũ theo thời gian.** Đã rà toàn bộ
   `www/index.html` và `www/capacitor-bridge.js`: không có bộ đếm hạn,
   không có tác vụ dọn dẹp theo ngày/tháng, không có TTL, không có
   `purge`/`prune` nào chạy nền. Job, thu chi, ảnh, cài đặt đều
   **giữ vô thời hạn trên máy cho tới khi người dùng xoá** (xoá tay,
   xoá toàn bộ, hoặc gỡ app). Hai thứ duy nhất "hết hạn" theo thời gian
   trong v1 là **mã đăng nhập Google (~1 giờ)** và **lịch nhắc đã qua giờ**
   (xem §5 và §6) — cả hai đều không phải là dữ liệu người dùng.
2. **Cảnh báo "kẹt" / "quá hạn" không phải là xoá.** Job ở một bước quá
   7 ngày, đã qua ngày chụp, hay đã quá hạn giao ảnh chỉ được gắn cờ
   (`stuckInfo()`, `isLate()` trong `index.html`) để hiện lên màn Hôm nay
   — dữ liệu vẫn còn nguyên, không bị xoá hay lưu trữ lạnh.
3. **Local là bản chính duy nhất ở v1.** Không có máy chủ FotoBro, không
   có tài khoản, không có đồng bộ. Xoá trên máy là mất thật (trừ khi đã
   có file sao lưu JSON do người dùng tự giữ).
4. **Nấc 2 (CloudKit) và Nấc 3 (nhóm/studio) chưa bật ở v1.** Các mục
   §7–§8 dưới đây là chính sách cho thiết kế đã chốt trong
   `CLOUDKIT-PLAN.md`, chưa phải hành vi đang chạy — container
   `iCloud.com.fotobro.app` chưa được tạo, adapter đồng bộ đang ở trạng
   thái `not-configured`, chưa có byte dữ liệu nào rời khỏi máy.

## 1. Bảng lưu giữ theo từng loại dữ liệu (v1 — đang chạy)

| # | Dữ liệu | Giữ ở đâu (v1) | Giữ bao lâu | Xoá khi nào |
|---|---|---|---|---|
| 1.1 | **Job chụp** — khách, loại chụp, ngày giờ, địa điểm, giá, cọc, tiến độ 8 bước, `stageSince`, link FB/Messenger/Drive, ghi chú | `localStorage['troLyXeo.v1'].jobs` (trên máy) | **Vô thời hạn** — kể cả job đã `Xong`, đã huỷ, đã qua ngày chụp/hạn giao nhiều năm | Người dùng xoá từng job trong chi tiết job; hoặc "Xoá toàn bộ dữ liệu"; hoặc gỡ app. Xoá job kéo theo: toàn bộ thu/chi gắn job đó, `checkDone['job:<id>']`, sự kiện Google Lịch của job đó (nếu có `gEventId`), và lịch nhắc của job đó |
| 1.2 | **Thu / chi** — số tiền, loại, ngày, job liên quan | `localStorage['troLyXeo.v1'].txs` | **Vô thời hạn** | Xoá từng khoản trong sổ tiền; hoặc xoá cùng job của nó; hoặc "Xoá toàn bộ dữ liệu"; hoặc gỡ app |
| 1.3 | **Cài đặt** — tên, studio, logo, màu chủ đề, bảng giá digital/film, % cọc, ngày trả ảnh, ngôn ngữ, tiền tệ, mẫu tin nhắn/email, thiết bị & khấu hao, checklist thêm | `localStorage['troLyXeo.v1'].cfg` | **Vô thời hạn** | "Xoá toàn bộ dữ liệu" (trả về cài đặt mặc định); hoặc gỡ app. Riêng "Xoá dữ liệu mẫu" **giữ nguyên** cài đặt giá/cọc/thiết bị. Logo xoá riêng bằng nút "Xoá logo"; mẫu tin khôi phục gốc chỉ xoá phần người dùng đã sửa |
| 1.4 | **Trạng thái checklist** (`checkDone`) và **bộ đếm id** (`uid`) | Trong `localStorage['troLyXeo.v1']` | **Vô thời hạn** | Mục `checkDone` của một job bị xoá cùng job đó; toàn bộ `checkDone` bị **đặt lại rỗng khi khôi phục từ bản sao lưu** (code nhập file: `checkDone = {}`); `uid` không bao giờ giảm — khôi phục chỉ lấy `max(uid hiện tại, uid trong file)`; cả hai mất hẳn khi "Xoá toàn bộ dữ liệu" hoặc gỡ app |
| 1.5 | **Ảnh trang chủ** tự thêm từ máy | IndexedDB `troLyXeoPhotos`, store `photos` (blob đã nén bằng `shrinkPhoto()`), **tối đa 60 ảnh** | **Vô thời hạn** (không có hạn theo ngày) | Xoá từng ảnh trong màn ảnh; hoặc "Xoá toàn bộ dữ liệu" (xoá cả database `indexedDB.deleteDatabase('troLyXeoPhotos')`); hoặc gỡ app. **Lưu ý:** ảnh KHÔNG nằm trong file sao lưu v1 (xem §3) nên đổi máy/gỡ app là mất ảnh dù đã sao lưu |
| 1.6 | **Khoá app** — PIN + Face ID/vân tay | `localStorage['troLyXeo.lock']` | **Vô thời hạn** | Tắt khoá trong Cài đặt; hoặc "Xoá toàn bộ dữ liệu"; hoặc gỡ app |
| 1.7 | **Dữ liệu mẫu** (job + thu chi mẫu lúc mới cài) | Trong `troLyXeo.v1`, cờ `sample` | Tới khi người dùng xoá | Nút "Xoá dữ liệu mẫu" / "Dùng thật" — chỉ xoá job và thu chi mẫu, giữ nguyên cài đặt; hoặc "Xoá toàn bộ dữ liệu" |
| 1.8 | **Dấu lần sao lưu cuối** | `localStorage['troLyXeo.lastBackup']` (dạng ngày `YYYY-MM-DD`) | Tới lần xuất sau (ghi đè) | "Xoá toàn bộ dữ liệu"; hoặc gỡ app. Chỉ ghi khi **xuất thành công**, khôi phục file không cập nhật dấu này |
| 1.9 | **Job đã huỷ** (`cancelled`) | Trong `troLyXeo.v1` như job thường, kèm `cancelledFrom` | **Vô thời hạn** — huỷ không phải là xoá | Khôi phục về bước "Tư vấn" (giữ lại toàn bộ dữ liệu job), hoặc xoá hẳn như job thường (§1.1) |

## 2. Dữ liệu Google — chỉ khi người dùng tự bật

| # | Dữ liệu | Giữ ở đâu | Giữ bao lâu | Xoá khi nào |
|---|---|---|---|---|
| 2.1 | **Mã đăng nhập Google (access token)** | `sessionStorage['troLyXeo.gtoken']` — chỉ trong phiên làm việc, **không lưu refresh token** (code v1 chủ động xoá `troLyXeo.grefresh` / `troLyXeo.ghadRefresh` khi khởi động) | **~1 giờ** — `exp = lúc đăng nhập + expires_in` (mặc định 3600 giây); code coi token là hết hạn trước 60 giây cuối. Hết hạn thì app đăng nhập lại im lặng (`prompt=none`); không được thì hỏi đăng nhập lại | Hết hạn tự nhiên (~1 giờ); hoặc bấm "Ngắt kết nối" — app **thu hồi token tại Google** (`oauth2.googleapis.com/revoke`) rồi mới xoá trên máy; hoặc "Xoá toàn bộ dữ liệu" (cũng thu hồi trước khi xoá) |
| 2.2 | **Lịch Google đã tải** (sự kiện + thời điểm tải) | `localStorage['troLyXeo.gcal']` (`{fetchedAt, cals, events}`) | **Không có hạn** — bản đã tải ở lại máy để xem offline; token hết hạn thì app chỉ hiện dòng "đang xem bản đã lưu" | Bấm "Ngắt kết nối" (xoá khỏi máy); hoặc "Xoá toàn bộ dữ liệu"; hoặc gỡ app |
| 2.3 | **Gmail đã tải** (mail báo tiền về, mail khách hỏi chụp) | `localStorage['troLyXeo.gmail']` | **Không có hạn xoá**; làm mới khi đã quá **15 phút** kể từ lần tải trước và còn token (`Date.now() - gmail.fetchedAt > 15 * 60000` → tải lại) — đây là chu kỳ làm mới, không phải xoá | Như §2.2 |
| 2.4 | **Danh bạ Google đã tải** (tên + email/số điện thoại gợi ý khách) | `localStorage['troLyXeo.gcontacts']` | **Không có hạn** | Như §2.2 |
| 2.5 | **Sự kiện buổi chụp app đã ghi lên Google Lịch** (kèm nhắc trước 12 tiếng, `firstReminderMinutes: 720`) | Trên Google Lịch của người dùng (không còn là dữ liệu trong app) | Theo chính sách của Google / Lịch của người dùng | **Không xoá được từ trong app** sau khi đã ngắt kết nối hoặc xoá toàn bộ — phải xoá trong app Lịch/Google Lịch. Khi job còn trong app và bị xoá, app xoá luôn sự kiện đó (`gCalDelete(gEventId)`) |

## 3. Bản sao lưu JSON (v1 — đang chạy)

- **Nội dung file:** `{jobs, txs, cfg}` — chỉ ba thứ đó. **Không có** ảnh
  trang chủ, `checkDone`, `uid`. Tên file code v1 xuất:
  `fotobro-sao-luu.json`.
- **Giữ ở đâu / bao lâu:** file thuộc về người dùng, nằm ở chỗ người dùng
  tự cất (Files, Drive, mail gửi cho chính mình…). **App không giữ bản
  sao nào, không xoá được file từ trong app, không đặt hạn cho file.**
  File tồn tại tới khi chính người dùng xoá nó ở ngoài app.
- **Khôi phục:** mở file → app hỏi xác nhận → **thay thế toàn bộ** dữ
  liệu hiện tại bằng dữ liệu trong file (job + thu chi thay hẳn, `cfg`
  gộp với mặc định, `checkDone` đặt lại rỗng, `uid` lấy số lớn hơn).
  File sai định dạng (không có `jobs`/`txs` là mảng) bị từ chối, dữ liệu
  hiện tại còn nguyên. Ảnh trang chủ sau khôi phục vẫn trống vì file v1
  không chứa ảnh.
- **Chưa có ở v1:** banner nhắc sao lưu sau 7 ngày **chưa có trong code
  v1** (chỉ có dấu `troLyXeo.lastBackup` ghi ngày xuất cuối). Nhắc 7 ngày,
  mã hoá AES-256-GCM + PBKDF2, tách ảnh khi file > 25 MB, tên file
  `fotobro-backup-YYYYMMDD.json` là **thiết kế trong `BACKUP-V2.md`,
  chưa nối vào app** — khi nối xong, nguyên tắc giữ file vẫn như trên
  (file thuộc người dùng, không hạn), cộng thêm: mất mật khẩu sao lưu mã
  hoá = mất bản sao lưu đó, không có đường khôi phục (chờ Việt chốt).

## 4. Lịch iPhone (nhập native 1 chạm)

- Nhập: app đọc sự kiện **30 ngày tới** từ Lịch iPhone khi người dùng bấm
  nhập và cho phép — các sự kiện được chọn trở thành **job trong app** và
  từ đó giữ theo §1.1 (vô thời hạn trên máy). Bản gốc trong Lịch iPhone
  không bị app sửa hay xoá.
- Xuất: nút "Thêm vào Lịch iPhone" trong chi tiết job tạo một sự kiện
  trong Lịch iPhone — sự kiện đó sống theo Lịch iPhone, app không xoá
  được từ xa; muốn xoá thì xoá trong app Lịch.
- File `.ics` tải về ("Lưu vào app Lịch", nhắc trước 12 tiếng) cũng là
  file của người dùng, app không quản lý hạn của nó.

## 5. Nhắc nhở (Local Notifications — không máy chủ, không push)

| Nhắc | Đặt khi nào | Hết hạn / mất khi nào |
|---|---|---|
| Nhắc buổi chụp | Lúc lưu job có ngày chụp: **trước giờ chụp 60 phút** (`capacitor-bridge.js`: `scheduleReminder`, giờ chụp mặc định 08:00 nếu không nhập giờ) | Chỉ đặt nếu giờ nhắc còn trong tương lai; giờ đã qua thì bỏ qua, không đặt bù. Bị **huỷ** khi job đổi lịch (đặt lại) hoặc bị xoá (`cancelReminder`). Nếu máy tắt nguồn đúng giờ nhắc thì nhắc đó **mất luôn, không bù** sau khi mở máy (giới hạn của local notification) |
| Nhắc hạn giao ảnh | Lúc lưu job có hạn giao: **09:00 ngày trước hạn 1 ngày** (hạn − 24 giờ) | Như trên |
| Nhắc job kẹt / nhắc sao lưu | Thiết kế trong `NOTIFICATIONS.md` / `BACKUP-V2.md` (ID cố định, ghi đè mỗi lần quét) — **chưa có code đặt nhắc này trong app v1** | — |
| Nhắc trên Google Lịch / file .ics | Sự kiện do app tạo có nhắc trước **12 tiếng** | Theo Lịch Google / app Lịch của người dùng; app không thu hồi được sau khi ngắt kết nối (§2.5) |

**Không có nhật ký nhắc nào được lưu.** App không ghi lại nhắc nào đã
hiện, đã bấm hay đã bỏ lỡ; sau khi nhắc hiện xong thì không còn dấu vết
trong dữ liệu app.

## 6. "Xoá toàn bộ dữ liệu" — xoá thật những gì (code `wipeAll()`)

Một nút duy nhất trong Cài đặt, xoá **thật và không hoàn tác được**:

- `localStorage`: `troLyXeo.v1`, `troLyXeo.lock`, `troLyXeo.gtoken`,
  `troLyXeo.gcal`, `troLyXeo.gmail`, `troLyXeo.gseen`,
  `troLyXeo.gcontacts`, `troLyXeo.gstate`, `troLyXeo.grefresh`,
  `troLyXeo.ghadRefresh`, `troLyXeo.heroPin`, `troLyXeo.lastBackup`,
  `troLyXeo.welcomed`, `troLyXeo.installDismissed`.
- Toàn bộ database ảnh `troLyXeoPhotos` (IndexedDB).
- Thu hồi token Google tại Google trước khi xoá (cả access token lẫn
  refresh token cũ nếu còn sót).
- Dữ liệu trong bộ nhớ (`state.jobs`, `state.txs`) về rỗng, cài đặt về
  mặc định, app tải lại trắng như mới.

**Không xoá được từ nút này** (phải tự xoá ở ngoài app): file sao lưu
JSON đã tải về máy; sự kiện đã ghi trên Google Lịch; sự kiện đã thêm
vào Lịch iPhone; file `.ics` đã tải; bất cứ thứ gì người dùng đã gửi
đi (email mẫu, tin nhắn) qua app ngoài.

## 7. Gỡ app khỏi iPhone

Vì toàn bộ dữ liệu v1 chỉ nằm trong sandbox của app (localStorage +
IndexedDB), **gỡ app là xoá toàn bộ dữ liệu trên máy** — job, thu chi,
ảnh, cài đặt, khoá, token và dữ liệu Google đã tải đều mất. Sống sót
sau khi gỡ: file sao lưu JSON người dùng đã tải về; sự kiện trên Google
Lịch / Lịch iPhone; dữ liệu trong tài khoản Google của người dùng.

Lưu ý ngoài tầm kiểm soát của app: nếu người dùng bật **Sao lưu iCloud
của iOS** cho toàn máy, iOS có thể đã sao lưu dữ liệu app theo quy tắc
của Apple — đó là bản sao lưu hệ thống của Apple, app không đọc, không
xoá và không đặt hạn được; xoá dữ liệu trong app không xoá bản sao lưu
iOS đã tạo trước đó (bản sao lưu iOS sau đó sẽ phản ánh trạng thái mới).

## 8. Nấc 2 / Nấc 3 — chính sách cho thiết kế đã chốt (CHƯA chạy ở v1)

Chỉ áp dụng khi các tính năng này được code và bật. Ở v1, mọi dòng dưới
đây đều là **chưa có hiệu lực** vì container chưa tạo và adapter đang ở
`not-configured`.

| # | Dữ liệu | Giữ ở đâu (thiết kế) | Giữ bao lâu (thiết kế) | Xoá khi nào (thiết kế) |
|---|---|---|---|---|
| 8.1 | **Bản sao lưu mã hoá trên CloudKit** (`EncryptedBackup`: ciphertext AES-256-GCM + salt/iv + `counts` + `deviceId` + `createdAt`) | Private database CloudKit, container `iCloud.com.fotobro.app`, zone `FotoBroZone` | Giữ tới khi người dùng xoá trong app hoặc tắt đồng bộ và chọn xoá bản sao trên iCloud; xung đột thì chỉ giữ **1 bản mới nhất**, không gộp | Xoá trong app (xoá cả bản mã hoá trong iCloud); tắt đồng bộ không tự xoá dữ liệu local. Mất mật khẩu sao lưu = không mở được bản mã hoá (coi như mất) |
| 8.2 | **Đồng bộ từng record** (`Job`/`Tx`/`Config`/`PhotoMeta`) | Private database CloudKit, cùng container/zone | Giữ tới khi người dùng xoá; xoá local được **soft delete** (`deleted = 1` + `updatedAt` mới) để máy khác đồng bộ việc xoá — record đánh dấu xoá vẫn tồn tại trên server cho tới khi cơ chế dọn tombstone được quyết (xem §9) | Xoá local → đồng bộ cờ xoá sang các máy; tắt đồng bộ → dữ liệu local còn nguyên, chỉ dừng đồng bộ |
| 8.3 | **Ảnh gốc** | **Không lên CloudKit record** — chỉ `PhotoMeta` (metadata + link), ảnh gốc ở lại máy + trong file sao lưu mã hoá (§8.1) | Theo §1.5 trên máy; metadata theo §8.2 | Như §1.5 / §8.2 |
| 8.4 | **Outbox đồng bộ** (`fotobro.syncState.outbox`) | Trên máy | Tới khi đẩy xong lên CloudKit (đẩy xong thì xoá khỏi outbox); mất mạng thì giữ nguyên, lần sau đẩy tiếp | Đẩy thành công; hoặc "Xoá toàn bộ dữ liệu" |
| 8.5 | **Nhật ký xung đột đồng bộ** (`fotobro.syncState.log`) | Trên máy | **Tối đa 200 dòng mới nhất** (giới hạn theo số dòng, không theo thời gian) — dòng cũ hơn bị cắt khi vượt 200 | Tự cắt khi vượt 200 dòng; hoặc "Xoá toàn bộ dữ liệu" |
| 8.6 | **Nhật ký hoạt động Nấc 3** (`job.create`, `job.stage`, `member.invite`, `member.remove`, `money.edit`, `price.edit`, `workspace.create`) | Workspace (sharedDB CloudKit hoặc Supabase — chưa chốt store cuối) | **Tối đa 500 dòng/workspace, chỉ giữ 500 dòng mới nhất** (giới hạn theo số dòng, không theo thời gian) | Tự cắt dòng cũ nhất khi vượt 500; hoặc xoá workspace. **Không ghi vào log:** số tiền chi tiết, tên khách đầy đủ, nội dung ghi chú job. Chỉ Chủ và Quản lý xem được log |
| 8.7 | **Mã mời workspace** (Nấc 3) | — | **Hết hạn sau 7 ngày** — đây là hạn theo thời gian duy nhất trong thiết kế Nấc 3; hết hạn thì Chủ tạo mã mới | Hết hạn 7 ngày; hoặc Chủ thu hồi; hoặc đã dùng (mã 1 lần) |
| 8.8 | **Thuê bao Nấc 2/3 hết hạn** | — | Dữ liệu local **không bị khoá, không bị xoá** — app quay về Nấc 1, chỉ tắt đồng bộ/team | Hết hạn thuê bao chỉ tắt tính năng, không xoá dữ liệu cũ |

## 9. Những gì chính sách này chưa quyết (cần Việt chốt trước khi code Nấc 2/3)

1. **Tombstone xoá trên CloudKit giữ bao lâu?** Thiết kế hiện chỉ nói
   soft delete (`deleted = 1`), chưa nói khi nào xoá hẳn record khỏi
   server — cần một hạn (ví dụ: xoá hẳn sau 30/90 ngày) để server không
   phình vô hạn.
2. **Bản sao lưu mã hoá `EncryptedBackup` giữ mấy bản?** Thiết kế nói
   "giữ 1 bản mới nhất" khi xung đột, nhưng chưa nói rõ có giữ lịch sử
   nhiều bản hay chỉ 1 bản duy nhất.
3. **Nhật ký 500 dòng (Nấc 3) và log xung đột 200 dòng có cần thêm hạn
   theo thời gian không?** Hiện chỉ giới hạn theo số dòng — với studio
   ít hoạt động, 500 dòng có thể là dữ liệu nhiều năm; với studio đông,
   500 dòng có thể chỉ là vài tuần. Cần chốt có thêm hạn (ví dụ: tối đa
   12 tháng) hay giữ nguyên giới hạn theo số dòng.
4. **Tên file sao lưu v1:** `BACKUP-V2.md` ghi tên cũ là
   `tro-ly-xeo-sao-luu.json`, nhưng code v1 thật xuất
   `fotobro-sao-luu.json` — tài liệu cần thống nhất theo code khi viết
   lại `BACKUP-V2.md`.

## 10. Tóm tắt một dòng cho người dùng

> Dữ liệu của bạn ở trên máy bạn, giữ tới khi bạn xoá — app không tự
> xoá gì theo thời gian; mã Google hết hạn sau ~1 giờ; ảnh tối đa 60
> ảnh và không nằm trong file sao lưu v1; gỡ app là mất hết trên máy
> trừ file sao lưu bạn đã tải về và lịch đã ghi lên Google/Lịch iPhone.

---

*Kèm theo: `PRIVACY.html` (dữ liệu nào, ở đâu) · `BACKUP-V2.md` (sao lưu
v2, thiết kế) · `CLOUDKIT-PLAN.md` (Nấc 2/3, thiết kế). Khi Nấc 2/3
được bật thật, cập nhật lại mục §8 của file này theo code đã chạy và
ghi ngày cập nhật ở đầu trang.*
