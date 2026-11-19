# FotoBro iOS v1 — Thiết kế nhắc nhở (Notifications)

> Trạng thái: **thiết kế, chưa code thêm**. Plugin đã có sẵn, bridge đã có
> nhắc cơ bản — file này chốt hành vi v1 để agent làm app nối vào, không
> tự ý đổi mặc định.
>
> Nguyên tắc: **local notification, không server, không push**.
> Mọi nhắc đều do chính máy người dùng đặt lịch và phát, dữ liệu job
> không rời khỏi máy. Tắt app vẫn nhắc được; gỡ app thì mất hết lịch nhắc.

## 1. Hiện trạng đã có (đừng viết lại)

| Hạng mục | Hiện trạng (đã kiểm chứng bằng đọc code, 20/11/2026) |
|---|---|
| Plugin | `@capacitor/local-notifications` `^8.0.0` đã có trong `package.json` và `node_modules/` |
| Cấu hình | `capacitor.config.ts` → `LocalNotifications: { smallIcon: 'ic_stat_icon', iconColor: '#FA2D48' }` |
| Bridge | `www/capacitor-bridge.js` §2: `scheduleReminder(job)` + `cancelReminder(jobId)`, expose `window.__trolyxeoScheduleReminder` / `window.__trolyxeoCancelReminder` |
| Nhắc chụp | Trước giờ chụp **60 phút** (mặc định hiện tại — xem §2, v1 đổi thành 12 tiếng) |
| Nhắc hạn giao | Trước hạn giao **24 tiếng**, phát lúc 09:00 ngày hôm trước |
| ID nhắc | Hàm `notifId(prefix, jobId)` — hash số từ `prefix:jobId`, dùng để hủy / ghi đè khi job đổi lịch |
| Quyền | `LN.requestPermissions()`, chỉ đặt lịch khi `perm.display === 'granted'`; lỗi thì im lặng, app vẫn chạy |
| Nhắc ngoài app | Google Lịch: VALARM `-PT12H` trong file `.ics` xuất ra + `reminders: 720/60 phút` khi ghi vào Google Lịch (chỉ là bổ sung, không thay nhắc trong app) |

## 2. Bốn loại nhắc của v1

### 2.1 Nhắc trước buổi chụp (quan trọng nhất)

- **Mặc định v1: trước giờ chụp 12 tiếng.** (Bridge hiện tại đang là 60 phút —
  phải đổi mặc định thành 720 phút khi nối thiết kế này.)
- **Cho chọn trong Cài đặt → Nhắc nhở:** `1 giờ` / `12 giờ` (mặc định) / `24 giờ`.
  Lưu vào `cfg.remindBeforeShoot` (phút): `60` / `720` / `1440`. Đổi lựa chọn
  thì đặt lại lịch nhắc cho mọi job chưa chụp xong (job ở bước Tư vấn /
  Chốt cọc / Sắp chụp).
- **Thời điểm phát:** `giờ chụp − remindBeforeShoot`. Job không có giờ chụp
  thì mặc định 08:00. Job không có ngày chụp → không đặt nhắc này.
- **Nội dung:**
  - Tiêu đề: `Hôm nay có lịch chụp 📷` (nếu nhắc trước 24h: `Mai có lịch chụp 📷`;
    nếu nhắc trước 1h: `Sắp tới giờ chụp 📷` — tiêu đề đổi theo khoảng cách,
    body giữ nguyên).
  - Body: `{Tên khách} — {Loại job} lúc {giờ chụp}{, tại {địa điểm} nếu có}`.
  - Ví dụ: `Mai Anh & Tuấn Kiệt — Wedding lúc 08:00, tại Đà Lạt`.
- **ID:** `notifId('shoot', job.id)`. Đổi ngày/giờ/khách/loại job → đặt lại
  (ghi đè cùng ID). Xóa job / chuyển sang trạng thái Huỷ → `cancelReminder`.

### 2.2 Nhắc hạn giao ảnh

- **Trước hạn giao 1 ngày, phát lúc 09:00** — đúng hành vi bridge hiện tại,
  giữ nguyên, không thêm lựa chọn ở v1.
- **Điều kiện:** chỉ đặt khi job có `deadline` và job chưa ở bước `Đã giao` /
  `Xong` / Huỷ. Sang bước `Đã giao` thì hủy nhắc này (đã giao rồi, không nhắc nữa).
- **Nội dung:**
  - Tiêu đề: `Sắp tới hạn giao ảnh`
  - Body: `{Tên khách} — hạn giao {ngày/tháng}`.
- **ID:** `notifId('dl', job.id)`.

### 2.3 Nhắc job kẹt

- **Định nghĩa "kẹt" (khớp quyết định pipeline v1):** job nằm yên ở cùng
  1 bước **quá 7 ngày** mà chưa tới bước tiếp theo, và job chưa `Xong` / Huỷ.
  (Ngày đếm từ `updatedAt` của job; nếu không có `updatedAt` thì dùng ngày tạo.)
- **Cách đặt (quan trọng — local notification không tự đánh giá điều kiện):**
  không đặt sẵn nhắc "kẹt" từ lúc tạo job, vì lúc đó chưa biết job có kẹt không.
  Thay vào đó, **mỗi lần mở app** (và mỗi lần lưu job), app quét các job đang
  chạy: job nào đã kẹt thì đặt **1 nhắc tổng hợp duy nhất** cho sáng hôm sau
  09:00, liệt kê tối đa 3 job kẹt đầu tiên.
  - Tiêu đề: `Có job đang kẹt ⏳`
  - Body: `{Tên khách 1} kẹt ở bước {Bước} đã {N} ngày` (+ `, và {M} job khác`
    nếu còn).
  - ID cố định: `notifId('stuck', 'summary')` — mỗi lần quét ghi đè, không
    nhân bản.
- **Tần suất:** tối đa 1 nhắc/ngày. Hôm sau mở app mà job vẫn kẹt thì đặt
  lại cho ngày kế; job hết kẹt (đã chuyển bước) thì hủy nhắc tổng hợp.

### 2.4 Nhắc sao lưu (7 ngày)

- **Điều kiện:** nhắc khi **quá 7 ngày kể từ lần sao lưu gần nhất**
  (xuất file JSON sao lưu thành công). Lần sao lưu đầu tiên: nhắc sau 7 ngày
  kể từ ngày cài app / ngày tạo job đầu tiên.
- **Cách đặt:** giống §2.3 — không đặt nhắc lặp cố định (vì không biết user
  đã sao lưu chưa). Mỗi lần mở app: nếu `hôm nay − lastBackupAt > 7 ngày`
  thì đặt **1 nhắc một lần** cho 20:00 tối hôm đó; nếu user sao lưu thì hủy
  nhắc và tính lại mốc 7 ngày từ lần sao lưu mới.
  - Tiêu đề: `Chưa sao lưu 7 ngày rồi 💾`
  - Body: `Sao lưu ngay để mất máy vẫn còn job và sổ tiền.`
  - ID cố định: `notifId('backup', 'summary')`.
- **V1 không dùng nhắc lặp hàng tuần** (`every: 'week'`): nhắc lặp không tắt
  được theo điều kiện "đã sao lưu rồi", sẽ spam user ngay cả khi vừa sao lưu.

## 3. Quyền trên iOS — xin khi nào, xin như thế nào

- **Không xin quyền ngay lần mở app đầu tiên.** Xin đúng lúc user thấy giá trị:
  lần đầu tạo job có ngày chụp (ngay trước khi đặt nhắc chụp đầu tiên).
- **Luồng xin:**
  1. Hiện sheet giải thích 1 câu trong app: `Cho FotoBro nhắc trước buổi chụp
     và hạn giao ảnh nhé?` → nút `Cho phép nhắc` / `Để sau`.
  2. Bấm `Cho phép nhắc` → gọi `LocalNotifications.requestPermissions()`.
     iOS hiện hộp thoại hệ thống **1 lần duy nhất** (người dùng chọn Cho phép /
     Không cho phép).
  3. Bấm `Để sau` → không gọi API hệ thống, không đặt nhắc, không hỏi lại
     cho tới lần tạo job tiếp theo.
- **Nếu user từ chối:** không hỏi lại bằng hộp thoại hệ thống (iOS không cho
  hiện lại). Trong app chỉ hiện banner nhẹ ở màn hình Hôm nay:
  `Đang tắt nhắc lịch — bật trong Cài đặt iPhone → FotoBro → Thông báo`,
  kèm nút mở Cài đặt hệ thống (dùng URL scheme `app-settings:`, cần kiểm chứng
  lúc code — chưa chắc chắn API này chạy qua Capacitor, không được giả vờ
  là đã có).
- **Không cần khai báo gì thêm trong `Info.plist`** cho local notification
  (không dùng push — không cần `aps-environment`, không cần chứng chỉ push).
  Quyền Lịch iPhone (`NSCalendarsUsageDescription`) là quyền riêng, xem
  `IOS-SETUP-NOTE.md`, không lẫn với quyền Thông báo.
- **Cài đặt trong app** (mục mới `Cài đặt → Nhắc nhở`):
  - Bật/tắt từng loại: nhắc chụp, nhắc hạn giao, nhắc job kẹt, nhắc sao lưu.
  - Nhắc trước buổi chụp: chọn `1 giờ` / `12 giờ` / `24 giờ`.
  - Nút `Kiểm tra nhắc đã đặt` (chỉ để debug): hiện số nhắc đang chờ
    (`LocalNotifications.getPending()`).

## 4. Chạm vào thông báo thì mở gì

- Mỗi nhắc mang theo `extra: { kind: 'shoot'|'deadline'|'stuck'|'backup', jobId }`.
- Chạm vào nhắc chụp / hạn giao → mở **chi tiết job đó** (nếu job còn tồn tại).
  Job đã xóa / đã huỷ → mở màn hình Hôm nay.
- Chạm vào nhắc job kẹt → mở tab Job, lọc các job đang kẹt.
- Chạm vào nhắc sao lưu → mở màn hình sao lưu (Cài đặt → Sao lưu).
- Nếu app đang mở sẵn khi nhắc tới: không hiện banner trong app, chỉ cập nhật
  màn hình Hôm nay (tránh nhắc trùng 2 lần).

## 5. Giới hạn và trường hợp KHÔNG nhắc được (nói thật với user)

| Trường hợp | Kết quả | Ghi chú |
|---|---|---|
| Chưa cấp quyền Thông báo (từ chối, hoặc chưa hỏi) | Không có nhắc nào | Banner trong app nhắc bật lại; không tự xin lại |
| Tắt Thông báo trong Cài đặt iPhone → FotoBro | Không có nhắc nào | App không phát hiện được lý do chi tiết, chỉ biết `display !== 'granted'` |
| Chế độ Tập trung / Không làm phiền (Focus / DND) | Nhắc bị giữ lại, chỉ hiện trong Trung tâm thông báo, không kêu / không hiện màn hình khóa | Hành vi của iOS, app không vượt được; user có thể cho FotoBro vào ngoại lệ "Cho phép thông báo" trong Focus |
| Máy tắt nguồn đúng giờ nhắc | Nhắc đó **mất luôn**, không bù sau khi mở máy | Giới hạn của local notification |
| Máy hết pin / khởi động lại | Nhắc đã đặt vẫn còn (iOS lưu lịch), sẽ phát đúng giờ sau khi mở máy | — |
| Gỡ app | Toàn bộ lịch nhắc bị xóa | Sao lưu JSON không chứa lịch nhắc |
| Quá 64 nhắc đang chờ (giới hạn iOS) | Nhắc vượt quá 64 sẽ **không được đặt** | V1 đặt tối đa ~2 nhắc/job (chụp + hạn giao) + 2 nhắc tổng hợp → 30 job đang chạy là chạm giới hạn. Cách xử lý: chỉ đặt nhắc cho job trong 30 ngày tới, job xa hơn thì đặt lại khi mở app |
| Đổi múi giờ khi đi chụp xa | Giờ nhắc tính theo giờ địa phương của máy tại thời điểm đặt | Mở app lại sau khi đổi múi giờ để đặt lại lịch nhắc |
| Job tạo trên máy khác (đồng bộ CloudKit, Nấc 2) | Nhắc chỉ có trên máy đã mở app và đồng bộ | Mỗi máy tự đặt nhắc của mình; không đồng bộ lịch nhắc qua CloudKit |
| App chưa từng mở sau khi tạo job | Nhắc vẫn phát, vì đã đặt lúc lưu job | Trừ nhắc job kẹt / sao lưu (§2.3–2.4) — 2 loại này chỉ đặt khi mở app |

## 6. Quy tắc đặt / hủy / đặt lại (để code không sai)

1. **Mọi thay đổi job đều đặt lại nhắc:** tạo job, sửa ngày/giờ/khách/loại,
   chuyển bước, đổi lựa chọn nhắc trước trong Cài đặt → gọi
   `scheduleReminder(job)` lại (ghi đè cùng ID, không tạo ID mới).
2. **Xóa job / Huỷ job → gọi `cancelReminder(jobId)` ngay**, hủy cả nhắc
   chụp và nhắc hạn giao của job đó.
3. **Chỉ đặt nhắc trong tương lai:** thời điểm phát ≤ hiện tại thì bỏ qua
   (đã có trong bridge: `filter(at > Date.now())`).
4. **Không đặt nhắc trùng:** cùng 1 job, cùng 1 loại → 1 ID duy nhất; đặt lại
   là ghi đè, không cộng dồn.
5. **Lỗi thì im lặng:** nhắc là tính năng phụ — lỗi đặt lịch không được làm
   hỏng việc lưu job (đã có `try/catch` trong bridge, giữ nguyên).
6. **Đổi tên hàm khi nối v1:** `__trolyxeoScheduleReminder` /
   `__trolyxeoCancelReminder` là tên cũ từ Trợ lý Xèo — khi code v1 nên
   đổi thành `__fotobroScheduleReminder` / `__fotobroCancelReminder`
   (giữ alias cũ 1 bản để không gãy code gọi hàm cũ, xóa alias ở v1.1).

## 7. Việc còn lại cho agent làm app (checklist)

- [ ] Đổi mặc định nhắc chụp trong bridge từ 60 phút → **720 phút (12 tiếng)**.
- [ ] Thêm `cfg.remindBeforeShoot` (60/720/1440, mặc định 720) +
      `cfg.remindShoot / remindDeadline / remindStuck / remindBackup`
      (mặc định bật hết) vào Cài đặt → mục `Nhắc nhở`.
- [ ] Thêm quét job kẹt + nhắc sao lưu 7 ngày khi mở app (§2.3–2.4).
- [ ] Thêm sheet xin quyền lần đầu tạo job có ngày chụp + banner khi bị từ chối.
- [ ] Thêm `extra { kind, jobId }` vào mỗi nhắc + xử lý chạm để mở đúng màn hình.
- [ ] Đổi tên hàm bridge sang `__fotobro…` (giữ alias cũ 1 bản).
- [ ] Kiểm chứng trên iPhone thật qua TestFlight: tắt app → nhắc vẫn tới;
      từ chối quyền → không nhắc + có banner; bật Focus → nhắc vào Trung tâm
      thông báo. Không kiểm chứng được trên Linux / máy ảo.

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Thiết kế nhắc nhở v1 cho FotoBro iOS — local notification,
   không server: nhắc chụp (12h, chọn 1h/12h/24h), nhắc hạn giao (1 ngày),
   nhắc job kẹt, nhắc sao lưu 7 ngày; ghi rõ quyền iOS và trường hợp không
   nhắc được.
2. **Đã thực hiện:** Chỉ đọc code hiện có (`package.json`, `capacitor.config.ts`,
   `www/capacitor-bridge.js` §2, `www/index.html` phần nhắc/Giờ chụp/hạn giao),
   xác nhận plugin `@capacitor/local-notifications` 8.0.0 đã có sẵn và bridge
   đã đặt nhắc chụp 60 phút + hạn giao 24h. Viết 1 file mới duy nhất:
   `~/workspace/fotobro-ios-v1/NOTIFICATIONS.md`. Không sửa bất kỳ file nào khác.
3. **Kết quả kiểm tra:** File đã viết, đọc được. Các con số trong file đều
   lấy từ code thật: plugin 8.0.0, `iconColor #FA2D48`, ID nhắc hash
   `prefix:jobId`, VALARM `-PT12H` trong `.ics`, nhắc Google Lịch 720/60 phút.
   Không chạy test (chỉ là file thiết kế, không code).
4. **Vấn đề còn tồn tại:** Mặc định bridge hiện tại (nhắc chụp 60 phút) lệch
   với thiết kế v1 (12 tiếng) — cần agent làm app đổi. Nhắc job kẹt và nhắc
   sao lưu chưa có code, phải đặt lúc mở app vì local notification không tự
   đánh giá điều kiện. Chưa có cách chắc chắn để mở Cài đặt hệ thống từ
   Capacitor (`app-settings:` cần kiểm chứng lúc code). Giới hạn 64 nhắc
   đang chờ của iOS — v1 chỉ đặt nhắc cho job trong 30 ngày tới.
5. **Điều kiện chuyển bước:** Agent làm app nối thiết kế này vào bridge +
   Cài đặt theo checklist §7, rồi kiểm chứng trên iPhone thật qua TestFlight
   (tắt app, từ chối quyền, bật Focus). Việt không cần quyết gì thêm cho
   phần này — mặc định 12 tiếng và các lựa chọn đã chốt trong brief.
6. **Bước tiếp theo:** Sau khi code xong, QA chạy lại: đếm nhắc đang chờ
   (`getPending()`), thử đủ 4 loại nhắc trên máy thật, xác nhận không nhắc
   trùng và hủy đúng khi xóa/huỷ job.
7. **Trạng thái:** Thiết kế xong, chưa phải code chạy được. Không tạo tài
   khoản, không mua gì, không sửa file nào khác ngoài file thiết kế mới.
