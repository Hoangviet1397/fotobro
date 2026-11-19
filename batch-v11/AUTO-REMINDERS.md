# FotoBro — Spec nhắc thu nốt tự động (v1.1, Tầng A: nhắc trong app)

> Phạm vi: **thiết kế cho v1.1, KHÔNG làm ở v1**. Chỉ viết file thiết kế,
> không sửa code, không tạo tài khoản, không push GitHub.
> Nguồn chính: `MONEY-REPORT.md` §5 (nhắc thu nốt tự động) + §3 (mục
> "Cần thu nốt"), đọc kèm code v1 thật trong `www/index.html`
> (`jobOwe`, `stuckInfo`, `isLate`, `stageSince`, `cleanData`,
> `mergeCfg`, `DEFAULT_CFG`) và `NOTIFICATIONS.md` (quy tắc nhắc chung).
>
> Quyết định đã chốt, không hỏi lại:
> - **Nhắc trong app trước, nhắc đẩy (push / local notification) sau.**
>   V1.1 chỉ làm Tầng A. Tầng B (local notification, cần quyền hệ thống,
>   plugin `@capacitor/local-notifications`) là việc riêng sau v1.1,
>   chỉ nhắc lại đúng các quy tắc dưới đây, không thêm quy tắc mới.
> - Thứ tự làm v1.1 theo `MONEY-REPORT.md` §6: §3 "Cần thu nốt" trước,
>   rồi tới spec này (§5 Tầng A). Spec này giả định mục "Cần thu nốt"
>   đã có (danh sách + nút "Nhắc khách" / "Ghi thu nốt").

## 0. Hiện trạng v1 đã có (đọc từ code thật, 20/11/2026)

| Hạng mục | Hiện trạng | Ghi chú |
|---|---|---|
| Còn thiếu từng job | `jobOwe(j) = max(0, price − jobThu(id))` (dòng 1017) | Dùng cho mọi quy tắc dưới đây, không tính lại |
| Tổng còn thiếu | `totalOwe()` (dòng 1037) | Chỉ cộng job chưa `Xong`, chưa `cancelled` |
| 8 bước pipeline | `STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']` (dòng 781) | `stageSince` được cập nhật mỗi lần chuyển bước (dòng 1473, 1595) |
| Vào "Đã giao" | Toast "Còn thiếu … — nhắc khách thu nốt nha" + `suggestEmail(j, 'deliver', 2600)` (dòng 1480–1482) | Thủ công, 1 lần lúc chuyển bước, không lặp lại |
| Bấm "Xong" khi còn thiếu | Cảnh báo + nút "Thu nốt … trước" (dòng 1466–1468) | Người dùng vẫn có thể bấm "Xong" kèm cảnh báo |
| Job kẹt | `stuckInfo(j)` (dòng 1021): ở 1 bước ≥ 7 ngày, hoặc đã qua ngày chụp mà còn ở bước trước "Đã chụp", hoặc đã quá hạn giao mà chưa tới "Đã giao" | Dùng lại nguyên hàm, không định nghĩa lại "kẹt" |
| Quá hạn giao | `isLate(j)` (dòng 1020): `deadline < hôm nay` và chưa "Đã giao"/"Xong" | Dùng lại nguyên hàm |
| Mẫu nhắc thu nốt | Mẫu `balance` / `deliver` trong `MAIL_TPLS` (`{owePart}`, `{owePart2}` chỉ hiện khi còn thiếu, dòng 3540–3561); mẫu Z5 trong `MESSAGE-TEMPLATES.md` | Nút "Nhắn khách" mở đúng mẫu này, không viết mẫu mới |
| Form thu nốt | `openTxForm({ jobId, kind:'thu', amount: jobOwe(j) })` đã có | Nút "Đã thu nốt" mở form với đúng số còn thiếu |
| Nhắc tự động | **Chưa có**: 0 lần `Notification` trong code; không có trường `lastRemindedAt` / `remindCount`, không có hẹn giờ nhắc trong Cài đặt | Đây là phần spec này thêm vào |
| Lưu trữ | `saveLocal()` / `loadLocal()`, khóa `troLyXeo.v1`, JSON `{jobs, txs, cfg}` | 2 trường + 2 cài đặt mới đi theo đúng 2 chỗ này, không đổi định dạng sao lưu |

## 1. Mô hình dữ liệu

### 1.1. Hai trường mới trên mỗi job

| Trường | Kiểu | Mặc định (job cũ + job mới) | Làm sạch trong `cleanData()` | Ý nghĩa |
|---|---|---|---|---|
| `lastRemindedAt` | Chuỗi `'YYYY-MM-DD'` hoặc `''` | `''` (chưa từng nhắc) | `cleanDate(j.lastRemindedAt)` — sai định dạng → `''`, đúng mẫu đã có cho `stageSince` / `deadline` (dòng 884) | Ngày gần nhất thẻ nhắc đã **hiện** (tính là 1 lần nhắc) **hoặc** người dùng đã bấm "Để sau" (xem §5.3 — cùng 1 mốc, 2 ý nghĩa, cố ý dùng chung để không cần thêm trường thứ 3) |
| `remindCount` | Số nguyên ≥ 0 | `0` | `cleanNum` rồi kẹp `0..99` (số lạ / âm / chuỗi → `0`) | Số lần nhắc tự động **đã đếm** cho khoản nợ hiện tại của job này (xem §1.3). Chỉ tăng khi thẻ nhắc hiện lần đầu trong ngày hoặc khi người dùng bấm "Nhắn khách" vào ngày chưa nhắc (§5.2) |

Ghi vào đúng object job trong `cleanData()` (cạnh `stageSince`, dòng 884),
không tạo bảng riêng. File sao lưu JSON `fotobro-sao-luu.json` chứa
`jobs[]` nên 2 trường tự đi theo, không cần đổi định dạng sao lưu, không
cần đổi khóa localStorage.

### 1.2. Hai cài đặt mới trong `cfg`

| Cài đặt | Kiểu | Mặc định | Làm sạch trong `mergeCfg()` | Vị trí UI |
|---|---|---|---|---|
| `remindEnabled` | Boolean | `true` (bật) | Kiểu `o.remindEnabled !== false` (mẫu đã có cho `glass`, `gFeat.cal`) — thiếu trường ở dữ liệu cũ → bật | Cài đặt → Nhắc nhở → mục "Thu nốt tiền" (xem §4) |
| `remindDays` | `3 \| 7 \| 14` (ngày) | `7` | Chỉ nhận 3/7/14, giá trị khác → `7` | Cùng mục trên, dạng chọn 3 nút (segmented), không cho nhập số tự do |

Thêm vào `DEFAULT_CFG` (cạnh `deliverDays: 14`, dòng 818). `mergeCfg()`
phải giữ 2 giá trị này khi đọc dữ liệu cũ (hiện `mergeCfg` copy mọi key
của `DEFAULT_CFG` nên chỉ cần thêm key vào `DEFAULT_CFG` là đủ, không
đổi logic copy).

### 1.3. `remindCount` đếm theo "khoản nợ", không đếm theo "job" hay "bước"

- `remindCount` gắn với **khoản nợ đang còn** (`jobOwe > 0`), không gắn
  với bước. Job bị nhắc 2 lần khi kẹt ở "Hậu kỳ", rồi sang "Đã giao",
  thì sang "Đã giao" **không reset** về 0 — còn 1 lần nhắc nữa là hết
  (xem §2.4). Lý do: khách đã bị nhắc 2 lần rồi, nhắc thêm 3 lần nữa
  sau giao ảnh là spam khách.
- Khi `jobOwe` về 0 (thu đủ, kể cả thu 1 lần hay thu nhiều lần):
  thẻ nhắc biến mất vĩnh viễn cho khoản nợ đó, và `remindCount` reset
  về `0`, `lastRemindedAt` reset về `''` — để nếu sau này giá job tăng
  lên (sửa `price`) sinh ra khoản nợ mới thì đó là một "khoản nợ" mới,
  được nhắc lại từ đầu. Reset này làm lúc ghi khoản thu thành công
  (chỗ đã có `celebrate(... 'trả đủ rồi!')`, dòng 1762).
- Khách trả **1 phần**: `jobOwe` giảm, thẻ nhắc cập nhật số mới ngay,
  `remindCount` / `lastRemindedAt` **giữ nguyên** (không reset, không
  tăng) — không cần nhập lại, không nhắc bù.
- Job `cancelled`: không nhắc, 2 trường đóng băng nguyên giá trị.
  Khôi phục job (`restore` về "Tư vấn", dòng 1507): giữ nguyên
  `remindCount` (không reset), mốc tính lại từ `stageSince` mới.

### 1.4. Mốc neo (anchor) — ngày bắt đầu đếm chu kỳ nhắc

Mốc neo là ngày bắt đầu của "khoản nợ đang nhắc", lấy theo bước hiện tại:

| Bước / trạng thái | Mốc neo |
|---|---|
| "Đã giao" (quy tắc R1) | `stageSince` (ngày vào bước "Đã giao", v1 đã cập nhật sẵn) |
| "Xong" nhưng còn thiếu (quy tắc R4) | `stageSince` (ngày bấm "Xong") |
| Quá hạn giao, chưa "Đã giao" (quy tắc R2) | `deadline` (ngày quá hạn đầu tiên) |
| Kẹt ở 1 bước (quy tắc R3) | `stageSince` (ngày vào bước đang kẹt) |

Fallback khi mốc trống (dữ liệu cũ thiếu `stageSince`): dùng `shootDate`,
rồi tới `deadline`, cuối cùng là hôm nay (nhắc ngay hôm nay 1 lần, không
tính bù các ngày đã qua — **không backfill** `remindCount`, xem §5.4).

## 2. Quy tắc khi nào nhắc

### 2.1. Cổng điều kiện chung (áp cho mọi quy tắc — job nào trượt 1 điều là không nhắc)

1. `remindEnabled === true` (người dùng chưa tắt nhắc).
2. `jobOwe(j) > 0` — **chỉ nhắc khi còn nợ**. `price = 0` (chưa chốt giá)
   thì `jobOwe = 0` nên không nhắc, đúng như `MONEY-REPORT.md` §3.
3. Job chưa `cancelled`.
4. `remindCount < 3` — tối đa **3 lần nhắc tự động / khoản nợ** (xem §2.4).
5. Hôm nay đã tới ngày nhắc tiếp theo (xem §2.2) và hôm nay chưa nhắc
   rồi (`lastRemindedAt !== hôm nay`, xem §5).

### 2.2. Chu kỳ nhắc sau giao ảnh (quy tắc chính R1)

- Lần 1: **ngay ngày vào bước "Đã giao"** (ngày giao ảnh = ngày nhắc đầu
  tiên). Đây là lúc khách vừa nhận ảnh, dễ trả nhất
  (`MESSAGE-TEMPLATES.md`: "Nhắc thu nốt đi kèm giao ảnh, không tách riêng").
- Lần 2: sau `remindDays` ngày kể từ mốc neo. Lần 3: sau `2 × remindDays` ngày.
- Với mặc định `remindDays = 7`: nhắc vào ngày giao, ngày +7, ngày +14.
  Đổi `remindDays = 3`: ngày giao, +3, +6. Đổi `14`: ngày giao, +14, +28.
- Công thức (để code không phải hỏi lại): ngày nhắc thứ `n`
  (`n = 0, 1, 2`, tương ứng `remindCount` hiện tại) là
  `mốc neo + n × remindDays`. Hôm nay tới ngày đó thì đủ điều kiện nhắc.
  Đổi `remindDays` giữa chừng (xem §4.2) thì tính lại ngày nhắc tiếp theo
  từ `remindCount` hiện tại với số ngày mới — ngày đó mà đã qua thì nhắc
  ngay lần mở app tiếp theo, không đợi thêm 1 chu kỳ mới.
- Hết lần 3 mà vẫn thiếu: **dừng nhắc tự động hẳn**. Job vẫn nằm trong
  mục "Cần thu nốt" (`MONEY-REPORT.md` §3) với dòng "Đã nhắc 3 lần —
  tự nhắn khách", người dùng vẫn nhắc thủ công bằng nút "Nhắn khách"
  bất cứ lúc nào. Dừng là để không spam khách và không spam chính
  người dùng.

### 2.3. Các quy tắc còn lại (theo `MONEY-REPORT.md` §5, giữ nguyên ý, siết lại tần suất)

| # | Quy tắc | Khi nào | Tần suất thực tế (đã siết so với bản nháp) |
|---|---|---|---|
| R1 | Đã giao + còn thiếu | Vào "Đã giao" (xem §2.2) | 3 lần theo chu kỳ `remindDays` |
| R2 | Quá hạn giao + chưa "Đã giao" + còn thiếu | `deadline` đã qua (`isLate(j)`) | **Thẻ nhắc hiện mỗi ngày** trên màn hình Hôm nay cho tới khi giao ảnh hoặc thu đủ (để người dùng thấy việc cần làm hôm nay), nhưng **chỉ đếm** theo chu kỳ `remindDays` kể từ `deadline` (lần 1 ngày quá hạn, lần 2 +`remindDays`, lần 3 +`2×remindDays`), tối đa 3 lần đếm. Các ngày hiện thẻ ở giữa không tăng `remindCount` và không đổi `lastRemindedAt` — đó là cùng 1 thẻ còn hiển thị, không phải 1 lần nhắc mới. Đây là điểm siết lại so với câu "nhắc mỗi ngày 1 lần" trong `MONEY-REPORT.md` §5: hiện mỗi ngày thì giữ, đếm mỗi ngày thì bỏ (đếm mỗi ngày sẽ đốt hết 3 lần trong 3 ngày, rồi im luôn dù khách chưa trả). |
| R3 | Kẹt ở 1 bước ≥ 7 ngày + còn thiếu | `stuckInfo(j)` khác null (hàm v1 đã có) | 1 lần khi **vừa bị đánh dấu kẹt** (ngày đầu tiên `stuckInfo` khác null), tính là 1 lần trong 3 lần của §2.2 (mốc neo = `stageSince`). Các ngày kẹt tiếp theo thẻ vẫn hiện trên Hôm nay (cùng thẻ kẹt đã có của v1) nhưng không đếm thêm. |
| R4 | Đã "Xong" nhưng vẫn thiếu tiền | Sau `remindDays` ngày kể từ ngày bấm "Xong" (`stageSince` của bước "Xong") | 1 lần duy nhất sau "Xong" (nếu `remindCount` còn dưới 3 mới nhắc; nếu đã đủ 3 lần từ trước thì không nhắc nữa — job chỉ còn nằm ở mục riêng "Đã xong nhưng vẫn thiếu" trong "Cần thu nốt"). Không nhắc ngay ngày bấm "Xong" (ngày đó đã có cảnh báo + nút "Thu nốt" của v1). |

### 2.4. Tối đa mấy lần — chốt

- **Tối đa 3 lần nhắc tự động cho 1 khoản nợ** (`remindCount` tối đa 3),
  tính gộp qua mọi quy tắc R1–R4 (không phải 3 lần / quy tắc).
- Nhiều quy tắc trùng nhau 1 ngày (vd: job vừa "Đã giao" vừa kẹt):
  chỉ hiện **1 thẻ duy nhất** và chỉ đếm **1 lần** (xem §5.1).
- Nhắc thủ công (người dùng tự bấm "Nhắn khách" trong chi tiết job hay
  trong "Cần thu nốt" vào ngày không có thẻ nhắc) **không bị giới hạn
  3 lần** — đó là quyết định của người dùng, app không chặn. Nhưng lần
  bấm đó vẫn ghi `lastRemindedAt = hôm nay` (để thẻ tự động không hiện
  trùng ngay hôm đó) và chỉ tăng `remindCount` nếu hôm đó chưa đếm lần
  nào (xem §5.2).

### 2.5. Thứ tự ưu tiên khi nhiều quy tắc cùng đúng (1 job — 1 thẻ)

Ưu tiên từ cao xuống thấp, thẻ hiện tiêu đề + lý do của quy tắc cao nhất:

1. R1 "Đã giao" — `Đã giao ảnh — còn thiếu {số tiền}`
2. R2 "Quá hạn giao" — `Quá hạn giao {X} ngày — còn thiếu {số tiền}`
3. R3 "Kẹt" — `Kẹt ở bước {bước} {N} ngày — còn thiếu {số tiền}`
4. R4 "Đã xong nhưng thiếu" — `Đã xong {N} ngày mà còn thiếu {số tiền}`

Ví dụ: job "Đã giao" 5 ngày trước, `remindDays = 7`, hôm nay chưa tới
ngày nhắc lần 2 → không có thẻ nhắc thu nốt (dù job có kẹt hay không —
đã giao rồi thì `stuckInfo` cũng không tính nữa vì đã qua bước kẹt).
Job quá hạn giao đồng thời kẹt ở "Hậu kỳ" → chỉ hiện thẻ R2, không hiện
thêm thẻ R3.

## 3. Nhắc trong app trước (Tầng A) — hình thức nhắc ở v1.1

- **Nơi nhắc:** thẻ nhắc cố định trên màn hình **Hôm nay**
  (nằm trong `todayItems()`, trên cùng, trước các mục khác), tồn tại
  cho tới khi thu đủ, người dùng bấm "Để sau" (ẩn tới ngày mai, §5.3),
  hoặc hết 3 lần. Đồng thời dòng tương ứng trong mục "Cần thu nốt"
  (tab Tiền bạc, `MONEY-REPORT.md` §3) đổi trạng thái: "Đã nhắc hôm nay"
  / "Nhắc lần {n} vào {ngày}" / "Đã nhắc 3 lần".
- **Thời điểm hiện:** khi mở app (không có giờ nhắc cố định ở v1.1,
  đúng `MONEY-REPORT.md` §5: "nhắc hiện khi mở app, không hẹn giờ").
  Mở app nhiều lần trong ngày thì thẻ vẫn hiện (để người dùng bấm nút),
  nhưng chỉ **đếm 1 lần / ngày** (xem §5).
- **Không xin quyền hệ thống ở v1.1:** không `Notification`, không
  `LocalNotifications`, không banner hệ thống, không âm thanh. Tắt app
  thì không nhắc — đó là giới hạn đã biết của Tầng A, chấp nhận ở v1.1.
- **Nút trên mỗi thẻ (3 nút, giống v1):**
  - "Nhắn khách" — mở mẫu tin nhắn nhắc (`balance` / `deliver`, đã có
    trong `MAIL_TPLS`; Z5 trong `MESSAGE-TEMPLATES.md`), điền sẵn tên
    khách + số còn thiếu. Bấm xong = đã nhắc (ghi `lastRemindedAt`,
    xem §5.2).
  - "Đã thu nốt" — mở form thu với số tiền = đúng số còn thiếu
    (như nút "Thu nốt" đã có ở bước "Xong").
  - "Để sau" — ẩn thẻ tới ngày hôm sau (xem §5.3), không xóa nợ.
- **Tầng B (sau v1.1, không làm ở đây):** khi có local notification,
  nhắc đẩy chỉ nhắc lại đúng quy tắc R1–R4 + giới hạn 3 lần này, với
  nội dung theo §3.1 (không tên khách, không số tiền). Không thêm quy
  tắc mới lúc làm Tầng B. Lịch nhắc đẩy không đồng bộ qua CloudKit
  (mỗi máy tự đặt nhắc của mình — khớp `NOTIFICATIONS.md` §5).

### 3.1. Nội dung thông báo — phân biệt trong app và màn hình khóa

**Trong app (thẻ nhắc trên Hôm nay + mục "Cần thu nốt") — ĐƯỢC hiện
đầy đủ**, vì người dùng đã mở khóa máy và đang trong app:

- Tiêu đề: `Còn thiếu {số tiền} — {tên khách}` (số tiền dùng `fmt()`,
  tôn trọng `currency` VND/USD như v1 — chỉ đổi hiển thị, không quy đổi).
- Dòng phụ: `{Loại job} · {bước hiện tại} · Đã nhắc {n}/3 lần`
  (vd: `Wedding · Đã giao · Đã nhắc 1/3 lần`).
- Dòng lý do (theo quy tắc cao nhất, §2.5): vd `Giao ảnh 7 ngày trước`,
  `Quá hạn giao 3 ngày`, `Kẹt ở Hậu kỳ 9 ngày`.
- Song ngữ (vi/en, theo `locale` đã có): en: `Still owed {amount} —
  {client}` / `{Type} · {stage} · Reminded {n}/3`.

**Trên màn hình khóa / thông báo đẩy (chỉ áp cho Tầng B sau này, v1.1
chưa có — nhưng chốt câu chữ ngay từ bây giờ để lúc làm Tầng B không
phải hỏi lại):**

- Tiêu đề: `FotoBro: Có khoản cần thu nốt` (en: `FotoBro: Payment to follow up`).
- Nội dung: `Mở app để xem danh sách thu nốt hôm nay.`
  (en: `Open the app to see today's follow-ups.`)
- **Tuyệt đối không có trong thông báo đẩy:** tên khách, số tiền còn
  thiếu, loại job, ngày chụp, ngày giao. Lý do: màn hình khóa ai cũng
  đọc được (người bên cạnh, khách mượn máy xem ảnh), lộ tên + số tiền
  là lộ quan hệ tiền bạc với khách. Cả khi iPhone đặt "Hiện bản xem
  trước: Khi được mở khóa" thì nội dung vẫn giữ nguyên câu chung chung
  này — không dựa vào cài đặt xem trước của máy để lộ thêm.
- Không dùng số tiền làm số badge, không đưa số tiền vào `extra` /
  payload của nhắc đẩy (chỉ đưa `jobId` + `kind: 'balance'`, theo mẫu
  `extra { kind, jobId }` của `NOTIFICATIONS.md` §4). Chạm vào nhắc
  đẩy → mở chi tiết job đó (nếu còn tồn tại), job đã xóa/huỷ → mở
  màn hình Hôm nay.

## 4. Cài đặt bật/tắt + đổi số ngày

Vị trí: **Cài đặt → Nhắc nhở → mục "Thu nốt tiền"** (chung mục Nhắc nhở
đã có trong `NOTIFICATIONS.md` §3 — nhắc chụp / hạn giao / kẹt / sao lưu
— thêm 1 mục nữa vào cùng chỗ, không tạo mục Cài đặt mới).

| Điều khiển | Hành vi |
|---|---|
| Công tắc "Nhắc thu nốt tự động" (`remindEnabled`, mặc định **bật**) | Tắt → mọi thẻ nhắc thu nốt biến mất ngay, không đếm thêm, không ghi `lastRemindedAt` nữa. **Mục "Cần thu nốt" vẫn hiện** (tắt nhắc không có nghĩa là xóa nợ — khớp `MONEY-REPORT.md` §5). Bật lại → các thẻ đủ điều kiện hiện lại từ lần mở app tiếp theo, tính từ `remindCount` / `lastRemindedAt` đã lưu (không reset, không nhắc bù ồ ạt — mỗi job tối đa 1 lần trong ngày bật lại). Nhắc thủ công (nút "Nhắn khách" trong chi tiết job / "Cần thu nốt") vẫn dùng được khi tắt. |
| Chọn số ngày (`remindDays`, mặc định **7**): 3 / 7 / 14 ngày | Dạng 3 nút chọn, không nhập số tự do (tránh nhập 0 / 1 ngày gây spam, tránh nhập 365 ngày làm tính năng chết). Đổi số ngày → áp dụng cho lần nhắc **tiếp theo** trở đi, không reset `remindCount`, không đổi `lastRemindedAt`. Ví dụ: đang `remindDays = 7`, đã nhắc 1 lần ngày giao ảnh, đổi sang 3 → lần 2 nhắc vào ngày giao + 3 (đã qua thì nhắc ngay lần mở app sau). Đổi sang 14 → lần 2 nhắc vào ngày giao + 14. |
| (Không có ở v1.1) | Không có chọn giờ nhắc, không có bật/tắt theo từng quy tắc R1–R4 (1 công tắc chung cho cả 4 quy tắc — đơn giản, đúng chỉ đạo "giữ app cơ bản nhất"). Không có "nhắc tối đa mấy lần" cho người dùng đổi — con số 3 lần là cố định trong spec này. |

Ghi chú cho lúc code: đổi `remindDays` / tắt-bật `remindEnabled` đều
gọi `saveLocal()` ngay (mẫu đã có cho các cài đặt khác) và vẽ lại màn
hình Hôm nay để thẻ nhắc cập nhật tức thì, không cần mở app lại.

## 5. Cách tránh nhắc trùng

### 5.1. Một job — một thẻ — một lần đếm / ngày

- Tính danh sách nhắc **1 lần mỗi lần mở app** (lúc vẽ màn hình Hôm nay /
  `todayItems()`), không tính lại mỗi lần render. Kết quả tính là danh
  sách thẻ của ngày hôm đó.
- Mỗi job tối đa 1 thẻ nhắc thu nốt, lấy quy tắc ưu tiên cao nhất (§2.5).
  Job đã có thẻ nhắc chụp / hạn giao / kẹt của `NOTIFICATIONS.md` thì thẻ
  thu nốt là thẻ riêng (khác lý do, khác nút bấm) — không gộp, không hủy
  thẻ kia. Nhưng 2 thẻ không được đếm trùng vào cùng 1 `remindCount`:
  thẻ kẹt của `NOTIFICATIONS.md` không tăng `remindCount` (nó không phải
  nhắc thu nốt), chỉ thẻ thu nốt mới tăng.
- Mở app nhiều lần trong ngày: thẻ vẫn hiện (để bấm nút), nhưng
  `remindCount` không tăng thêm (chặn bằng §5.2).

### 5.2. Chặn bằng `lastRemindedAt` + `remindCount` (cơ chế duy nhất, dùng đúng 2 trường mới)

Pseudo-code (để code không sai; dùng hàm v1 đã có: `jobOwe`,
`stuckInfo`, `isLate`, `dstr(0)`):

```
dueJobs(): với mỗi job thỏa cổng §2.1 (còn nợ, chưa huỷ, remindEnabled, remindCount < 3):
  anchor = mốc neo theo §1.4 (theo bước cao nhất trong §2.5)
  nextDue = anchor + remindCount * remindDays   // ngày nhắc tiếp theo
  nếu hôm nay >= nextDue VÀ lastRemindedAt != hôm nay:
      → đưa job vào danh sách nhắc hôm nay
      → lastRemindedAt = hôm nay; remindCount += 1; saveLocal()
      // ghi ngay lúc thẻ hiện lần đầu trong ngày, không đợi người dùng bấm nút
```

- Ghi `lastRemindedAt` / `remindCount` **ngay khi thẻ hiện**, không đợi
  bấm "Nhắn khách" — vì "nhắc" ở Tầng A là việc app hiện thẻ cho người
  dùng thấy, người dùng có bấm nhắn khách hay không là bước sau.
- Bấm "Nhắn khách": nếu `lastRemindedAt != hôm nay` (vd: bấm từ mục
  "Cần thu nốt" vào ngày không có thẻ) thì ghi `lastRemindedAt = hôm nay`
  và `remindCount += 1` (nếu còn dưới 3); nếu đã ghi hôm nay rồi thì
  không ghi thêm — không bao giờ tăng 2 lần trong 1 ngày.
- Bấm "Đã thu nốt" rồi ghi thu đủ (`jobOwe` về 0): reset 2 trường về
  `''` / `0` (§1.3). Ghi thu 1 phần: không đụng tới 2 trường.
- Chuyển bước (vd: "Đã giao" → "Xong"): `stageSince` đổi (v1 đã làm),
  mốc neo đổi theo (§1.4), `remindCount` giữ nguyên (§1.3).

### 5.3. Nút "Để sau" (snooze) — không cần thêm trường

- Bấm "Để sau": ẩn thẻ đó tới hết hôm nay. Cách làm với đúng 2 trường
  đã có: ghi `lastRemindedAt = hôm nay` mà **không tăng** `remindCount`.
  - Cùng ngày mở app lại: `lastRemindedAt == hôm nay` nên thẻ không
    hiện lại (§5.2) — đúng ý "để sau".
  - Ngày mai mở app: `lastRemindedAt != hôm nay`, ngày nhắc tiếp theo
    (`anchor + remindCount × remindDays`) vẫn còn nguyên vì `remindCount`
    không đổi → thẻ hiện lại bình thường, không mất lượt nhắc.
  - Không dùng `sessionStorage` hay trường mới cho snooze: tắt app mở
    lại trong ngày vẫn nhớ đã "Để sau" (vì đã lưu vào `lastRemindedAt`
    qua `saveLocal()`).
- "Để sau" không phải là "đã nhắc khách": người dùng bấm "Để sau" rồi
  tự nhắn khách ngoài app thì lần nhắc đó không được đếm — chấp nhận,
  vì app không biết người dùng đã nhắn ngoài app.

### 5.4. Chống nhắc dồn khi lên v1.1 / đổi cài đặt (anti-flood)

- **Lần đầu mở app sau khi lên v1.1:** mọi job cũ đã "Đã giao" từ lâu
  và còn thiếu đều đủ điều kiện nhắc (mốc neo đã qua, `remindCount = 0`).
  Mỗi job chỉ hiện 1 thẻ và chỉ đếm 1 lần trong ngày hôm đó (§5.2) —
  không có chuyện 1 job hiện 3 thẻ bù cho 3 lần đã qua. `remindCount`
  **không backfill** (không tự điền 1/2/3 theo số ngày đã qua).
- Đổi `remindDays` từ 14 xuống 3: nhiều job cùng tới hạn 1 lúc → vẫn
  tối đa 1 lần / job / ngày, và màn hình Hôm nay gom các thẻ lại (tối
  đa hiện 3 thẻ nhắc thu nốt, còn lại gom vào dòng "+ {M} job khác cần
  thu nốt — xem tab Tiền bạc", theo mẫu gom nhắc kẹt tối đa 3 job trong
  `NOTIFICATIONS.md` §2.3).
- Bật lại `remindEnabled` sau thời gian tắt: như trên, tối đa 1 lần /
  job / ngày, không nhắc bù các ngày đã tắt.
- Hết 3 lần: không hiện thẻ nữa, không ghi thêm gì — im lặng, chỉ còn
  mục "Cần thu nốt" (§2.2).

## 6. Trường hợp biên

| Trường hợp | Hành vi |
|---|---|
| Job chưa chốt giá (`price = 0`) | `jobOwe = 0` → không nhắc, không vào "Cần thu nốt" |
| Job đã thu đủ rồi (`jobOwe = 0`) | Không nhắc; 2 trường reset về `''` / `0` (§1.3) |
| Job `cancelled` / đã xóa | Không nhắc; xóa job thì 2 trường mất theo job (không có nhắc nào trỏ tới job đã xóa) |
| Job không có `deadline` | R2 không áp dụng; R1/R3/R4 vẫn chạy bình thường theo `stageSince` |
| Job không có `stageSince` (dữ liệu cũ) | Fallback §1.4 (shootDate → deadline → hôm nay), nhắc ngay 1 lần, không backfill |
| Người dùng tắt nhắc (`remindEnabled = false`) | Thẻ biến mất; "Cần thu nốt" vẫn hiện; nhắc thủ công vẫn dùng được (§4) |
| Người dùng đổi `remindDays` giữa chừng | Tính lại ngày nhắc tiếp theo, không reset số lần (§4) |
| Khách trả 1 phần | Số thiếu trên thẻ cập nhật ngay; số lần nhắc giữ nguyên (§1.3) |
| Job vừa "Đã giao" vừa quá hạn giao | 1 thẻ duy nhất, ưu tiên R1 (§2.5) |
| Job "Xong" khi đã nhắc đủ 3 lần | Không nhắc thêm sau "Xong"; nằm ở mục riêng "Đã xong nhưng vẫn thiếu" (§2.3 R4) |
| Mở app khi không có mạng | Nhắc trong app chạy bình thường (local-first, không cần mạng — khớp v1 bỏ offline, app cần mạng mới mở được nhưng nhắc không gọi API nào) |
| Đồng bộ CloudKit (Nấc 2, sau này) | 2 trường nằm trong `jobs[]` nên sẽ đồng bộ theo job; nhưng mỗi máy tự đếm nhắc của mình (mở app trên máy nào thì máy đó đếm) — không đồng bộ `remindCount` theo thời gian thực, chấp nhận lệch 1 lần nhắc giữa 2 máy |
| i18n | Thẻ + Cài đặt có đủ vi/en; số tiền dùng `fmt()` theo `currency` đã chọn |

## 7. Tiêu chí kiểm chứng (làm xong mới gọi là xong)

Dữ liệu thử: tự nhập tay (v1 đã bỏ job/tiền mẫu — **không dùng dữ liệu
mẫu**), ít nhất 3 job còn thiếu ở 3 trạng thái khác nhau (1 "Đã giao",
1 quá hạn giao, 1 "Xong" nhưng thiếu). Đổi ngày hệ thống trên iPhone
thật (hoặc sửa `stageSince` / `deadline` trong dữ liệu thử) để kiểm tra
chu kỳ ngày — không kiểm được chu kỳ nhiều ngày trên Linux.

1. **Dữ liệu cũ mở được:** file sao lưu JSON v1 (không có
   `lastRemindedAt` / `remindCount`, không có `remindDays` /
   `remindEnabled`) mở bình thường; job cũ nhận mặc định `''` / `0`,
   cài đặt nhận `7` / bật. Không mất job, không mất khoản thu chi.
2. **Nhắc ngày giao ảnh (R1):** job vào "Đã giao" còn thiếu → thẻ nhắc
   hiện ngay hôm đó, `remindCount = 1`, `lastRemindedAt = hôm nay`.
   Mở app lần 2 trong ngày: thẻ vẫn hiện, `remindCount` vẫn 1.
3. **Chu kỳ nhắc:** với `remindDays = 3` (đổi trong Cài đặt để kiểm
   nhanh): ngày giao +3 → thẻ hiện, `remindCount = 2`; ngày giao +6 →
   `remindCount = 3`; ngày giao +9 → **không còn thẻ nhắc tự động**,
   job vẫn nằm trong "Cần thu nốt" với dòng "Đã nhắc 3 lần".
4. **"Để sau":** bấm "Để sau" → thẻ ẩn hết ngày hôm đó (tắt app mở lại
   vẫn ẩn), `remindCount` không tăng; ngày mai mở app → thẻ hiện lại.
5. **Trả 1 phần / trả đủ:** ghi thu 1 phần → số thiếu trên thẻ đổi
   ngay, `remindCount` giữ nguyên. Ghi thu đủ → thẻ biến mất,
   `remindCount` về 0, `lastRemindedAt` về `''`.
6. **Không nhắc trùng:** job vừa "Đã giao" vừa kẹt → chỉ 1 thẻ, chỉ
   tăng 1 lần. Job quá hạn giao: thẻ hiện mỗi ngày nhưng `remindCount`
   chỉ tăng vào ngày tới chu kỳ (ngày quá hạn, +7, +14 với mặc định).
7. **"Xong" nhưng thiếu (R4):** bấm "Xong" kèm cảnh báo khi còn thiếu →
   ngày hôm đó không có thẻ nhắc mới; sau `remindDays` ngày → có 1 thẻ
   nhắc (nếu chưa đủ 3 lần); job nằm ở mục riêng "Đã xong nhưng vẫn thiếu".
8. **Tắt nhắc:** tắt công tắc → thẻ biến mất ngay; mục "Cần thu nốt"
   vẫn hiện đủ job + số thiếu; bật lại → thẻ đủ điều kiện hiện lại,
   mỗi job tối đa 1 lần trong ngày bật lại, không nhắc bù ồ ạt.
9. **Đổi số ngày:** đổi `remindDays` 7 → 14 sau lần nhắc 1 → lần nhắc
   2 dời sang ngày giao +14 (không nhắc sớm, không reset về lần 1).
10. **Không nhắc sai đối tượng:** job `cancelled`, job `price = 0`,
    job đã thu đủ → không có thẻ trong mọi trường hợp.
11. **Màn hình khóa (chuẩn bị cho Tầng B):** v1.1 không có nhắc đẩy nên
    không có gì trên màn hình khóa. Kiểm tra bằng grep: code v1.1
    không dùng `Notification` / `LocalNotifications` cho nhắc thu nốt;
    câu chữ đẩy đã chốt ở §3.1 không chứa tên khách / số tiền (kiểm
    tra lúc làm Tầng B).
12. **Không thêm quyền, không hỏng test cũ:** chạy lại test jsdom của
    app vẫn đạt; không xin thêm quyền hệ thống nào ở v1.1 (Tầng B chưa
    làm nên không xin quyền Thông báo cho tính năng này).

## 8. Thứ tự làm (gợi ý cho agent code v1.1)

1. `cleanData()` + `mergeCfg()` + `DEFAULT_CFG`: thêm 2 trường + 2 cài đặt (§1).
2. Hàm tính danh sách nhắc hôm nay (`dueJobs()` theo §5.2) + thẻ nhắc
   trên Hôm nay (3 nút: Nhắn khách / Đã thu nốt / Để sau).
3. Dòng trạng thái nhắc trong mục "Cần thu nốt" (`MONEY-REPORT.md` §3).
4. Cài đặt → Nhắc nhở → mục "Thu nốt tiền" (công tắc + chọn 3/7/14 ngày, §4).
5. Reset 2 trường khi thu đủ (§1.3) + ghi `lastRemindedAt` khi bấm
   "Nhắn khách" thủ công (§5.2).
6. Kiểm chứng theo §7 trên iPhone thật (đổi ngày hệ thống để kiểm chu kỳ).

**Không làm ở v1.1:** nhắc đẩy / local notification (Tầng B); chọn giờ
nhắc; bật/tắt theo từng quy tắc R1–R4; cho người dùng đổi số lần tối đa
(3 lần cố định); đồng bộ lịch nhắc qua CloudKit.

---

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Viết spec nhắc thu nốt tự động cho FotoBro v1.1 (Tầng A:
   nhắc trong app) theo `MONEY-REPORT.md` §5 — 2 trường job mới
   (`lastRemindedAt`, `remindCount`) + 2 cài đặt (`remindDays`,
   `remindEnabled`), quy tắc nhắc, nội dung thông báo, cài đặt, chống
   nhắc trùng, tiêu chí kiểm chứng.
2. **Đã thực hiện:** Đọc kỹ `MONEY-REPORT.md` (đặc biệt §5 + §3 + §6 +
   §7), `NOTIFICATIONS.md` (quy tắc nhắc chung, giới hạn local
   notification), `MESSAGE-TEMPLATES.md` (mẫu `balance`/`deliver`/Z5),
   và code v1 thật (`jobOwe`, `stuckInfo`, `isLate`, `stageSince`,
   `cleanData`, `mergeCfg`, `DEFAULT_CFG`, `suggestEmail`); viết 1 file
   mới duy nhất `~/workspace/fotobro-ios-v1/batch-v11/AUTO-REMINDERS.md`.
   Không sửa bất kỳ file nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** File đã viết xong. Mọi con số / tên hàm / tên
   trường đều lấy từ file và code thật đã đọc (vd: `STAGES` 8 bước,
   `deliverDays` mặc định 14, `stuckInfo` kẹt ≥ 7 ngày). Spec chốt được:
   nhắc ngày giao + chu kỳ `remindDays` (mặc định 7), tối đa 3 lần /
   khoản nợ, "Để sau" dùng chung `lastRemindedAt` không cần trường thứ 3,
   nội dung đẩy không tên khách / không số tiền.
4. **Vấn đề còn tồn tại:** (a) Một điểm siết lại so với `MONEY-REPORT.md`
   §5: quy tắc quá hạn giao (R2) — bản nháp nói "nhắc mỗi ngày 1 lần",
   spec này giữ thẻ hiện mỗi ngày nhưng chỉ **đếm** theo chu kỳ
   `remindDays` (đếm mỗi ngày sẽ đốt hết 3 lần trong 3 ngày) — cần Việt /
   agent code xác nhận cách siết này; (b) Tầng B (nhắc đẩy) chưa có thiết
   kế chi tiết, chỉ chốt trước câu chữ đẩy; (c) Chu kỳ nhiều ngày chỉ
   kiểm được trên iPhone thật bằng cách đổi ngày hệ thống, không kiểm
   được trên Linux.
5. **Điều kiện chuyển bước:** Việt duyệt spec này — đặc biệt 3 điểm:
   tối đa 3 lần / khoản nợ, R2 chỉ đếm theo chu kỳ (không đếm mỗi ngày),
   và "Để sau" ghi `lastRemindedAt` không tăng `remindCount` — xong mới
   code v1.1 theo §8.
6. **Bước tiếp theo:** Code v1.1 theo §8 (trường + cài đặt → hàm tính
   nhắc → thẻ Hôm nay → trạng thái trong "Cần thu nốt" → Cài đặt →
   reset khi thu đủ), kiểm chứng theo §7 trên iPhone thật, rồi mới tính
   Tầng B (nhắc đẩy).
7. **Trạng thái:** Thiết kế xong, chưa phải code chạy được. Chỉ viết 1
   file mới, không sửa file nào khác, không tạo tài khoản, không thêm
   quyền hệ thống.
