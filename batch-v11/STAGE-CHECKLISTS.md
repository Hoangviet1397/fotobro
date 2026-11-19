# FotoBro — Checklist theo từng bước pipeline (thiết kế v1.1)

> **Trạng thái: CHỈ LÀ THIẾT KẾ, CHƯA CODE.** Không sửa code app, không thay đổi hành vi v1.
> Việt đã chốt **KHÔNG làm checklist theo bước ở v1** (giữ nguyên 8 bước, chỉ làm
> nhảy bước / tiền gắn bước / Huỷ-khôi phục / job kẹt). File này viết cho agent
> code v1.1 nối tiếp. Mọi dữ kiện "đã có trong v1" đều kiểm chứng từ
> `~/workspace/fotobro-ios-v1/www/index.html` (đọc ngày 20/11/2026).
>
> Thiết kế song song với `GEAR-CHECKLIST.md` (checklist đồ nghề theo loại job,
> cũng là thiết kế v1.1). Hai checklist **khác nhau, không gộp, không đồng bộ
> tick** — xem §1.3 để biết ranh giới và cách tránh xung đột.

## 1. Vấn đề — và ranh giới với checklist đồ nghề

### 1.1. Pipeline v1 hiện có gì (dùng lại, không viết lại)

| Thành phần | Vị trí trong code v1 | Hành vi hiện tại |
|---|---|---|
| 8 bước pipeline | `STAGES` (dòng ~781) | Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong |
| Chuyển bước | `setStage(j, target)` (dòng ~1460) | Nút "Xong bước này", nút "Lùi về…", chạm số bước để nhảy thẳng |
| Nhảy bước | `jumpToStage()` (dòng ~1486) | Nhảy qua > 1 bước thì hỏi xác nhận trước ("bỏ qua các bước giữa chưa xong") |
| Tiền gắn bước | `setStage()` | Chốt cọc → tự mở form ghi cọc (mặc định 40% — `cfg.depositPct`); Đã giao → nhắc thu nốt (`jobOwe()`); Xong mà còn thiếu tiền → **chặn bằng actionSheet xác nhận** (đây là khóa duy nhất đã có, giữ nguyên) |
| Huỷ / khôi phục | `jobAction('cancel'/'restore')` (dòng ~1503) | Huỷ giữ nguyên tiền + lịch, nhớ `cancelledFrom`; khôi phục về "Tư vấn" |
| Job kẹt | `stuckInfo()` (dòng ~1021) | Ở 1 bước ≥ 7 ngày, hoặc qua ngày chụp mà chưa tới "Đã chụp", hoặc quá hạn giao mà chưa tới "Đã giao" → báo đỏ ở chi tiết job + màn Hôm nay |
| Chi tiết job | `jobDetailHTML(j)` (dòng ~1391) | Mục Tiến độ (thanh 8 bước + nút chuyển bước), Lịch, Tiền, Liên lạc, Drive |
| Màn Hôm nay | `todayItems()` (dòng ~1160) | Nhắc chụp hôm nay / mai, hạn giao, khách còn thiếu tiền, job kẹt — mỗi mục bấm vào mở đúng job đó |
| Hạn giao / Drive | trường job `deadline`, `driveLink` | Đã có sẵn; checklist theo bước được phép nhắc tới, không tạo trường mới |

### 1.2. Thiếu sót cần v1.1 khắc phục

1. **Không có "việc cần làm" ở từng bước.** Photographer chỉ thấy mình đang ở bước nào,
   không thấy bước đó còn việc gì chưa xong — phải nhớ trong đầu (hỏi khách chọn ảnh chưa?
   gửi link chọn ảnh chưa? retouch xong chưa? thu nốt tiền chưa?).
2. **Nhảy bước bỏ qua việc âm thầm.** `jumpToStage()` chỉ hỏi chung chung "bỏ qua các
   bước giữa", không liệt kê việc nào của các bước đó còn dở dang.
3. **Việc dở dang không hiện ở màn Hôm nay.** `todayItems()` nhắc hạn giao / tiền thiếu /
   job kẹt, nhưng không nhắc "job X đang ở bước Chọn ảnh mà chưa gửi link cho khách".

### 1.3. Ranh giới với checklist đồ nghề — KHÔNG XUNG ĐỘT

| | Checklist đồ nghề (`GEAR-CHECKLIST.md`) | Checklist theo bước (file này) |
|---|---|---|
| Hỏi | **Mang gì đi chụp?** (đồ vật) | **Làm gì ở bước này?** (việc) |
| Theo | Loại job (Portrait/Couple/Wedding/Lookbook/Event) + Film/Digital | Bước pipeline (8 bước), giống nhau cho mọi loại job |
| Khi dùng | Chủ yếu trước buổi chụp | Suốt vòng đời job, từ Tư vấn tới Xong |
| Key lưu trữ | `checkDone['job:<id>']` — tick lưu theo **tên món** (chuỗi) | `stageDone['job:<id>']` — key **mới, riêng hoàn toàn** (xem §3) |
| Tick | Tick món đồ | Tick việc — **không tự tick chéo, không đồng bộ** |

**Quy tắc tránh xung đột (bắt buộc với agent code):**

1. **Không đụng vào `checkDone`, `CHECKLISTS`, `checkItems()`, `renderChecklist()`.**
   Checklist theo bước là module mới, hàm render mới, key lưu trữ mới.
2. **Không trùng câu chữ với món đồ nghề.** Hai chỗ duy nhất gần nhau là tiền cọc:
   đồ nghề có "Cọc đã nhận — kiểm tra trong tab Tiền bạc", bước Chốt cọc có
   "Đã nhận cọc — ghi vào sổ Tiền bạc" (§2.2). Câu khác nhau, key khác nhau, tick
   riêng — tick bên này **không** tự tick bên kia. Ghi rõ trong UI bằng chữ "ghi vào sổ"
   (hành động) khác với "kiểm tra" (đối chiếu) để người dùng không lẫn.
3. **Bước "Sắp chụp" không liệt kê lại đồ nghề.** Thay vào đó chỉ có 1 việc trỏ sang
   checklist đồ nghề: "Soạn đồ theo checklist đồ nghề" + dòng đếm "còn thiếu X món"
   (đọc từ `checkDone`, chỉ đọc, không ghi). Mọi món đồ vẫn chỉ nằm ở checklist đồ nghề.
4. **Xoá job:** xoá cả hai key — `checkDone['job:<id>']` (đã có, dòng ~1515) và
   `stageDone['job:<id>']` (mới). Huỷ job: **giữ nguyên** tick cả hai (khôi phục về
   "Tư vấn" thì việc đã tick vẫn còn, như tiền và lịch được giữ nguyên theo hành vi huỷ v1).
5. **Sao lưu / khôi phục JSON:** `saveLocal()` đã lưu `checkDone` (dòng ~909); thêm
   `stageDone` vào cùng payload. Khôi phục bản sao lưu phải mang `stageDone` theo
   (hiện tại khôi phục đặt `checkDone = {}` — dòng ~2238 — agent code thêm
   `stageDone = {}` / nạp từ bản sao lưu tương tự, không để lệch nhau).

## 2. Danh sách việc theo từng bước (đề xuất đầy đủ — agent code copy đúng câu chữ này)

Ký hiệu: `ID` = mã việc ổn định (xem §3.2 — tick lưu theo ID, không theo câu chữ).
Mỗi bước 3–5 việc, câu ngắn (≤ 12 chữ), động từ đầu câu, đúng nghề chụp ảnh.
Tổng: **33 việc** (8 bước).

### 2.1. Bước 1 — Tư vấn (4 việc)

| ID | Việc |
|---|---|
| `s1-1` | Nghe nhu cầu khách: loại job, số người, phong cách |
| `s1-2` | Báo giá + gửi bảng giá / ảnh mẫu cho khách |
| `s1-3` | Chốt ngày, giờ, địa điểm chụp |
| `s1-4` | Ghi chú concept / yêu cầu đặc biệt của khách |

### 2.2. Bước 2 — Chốt cọc (4 việc)

| ID | Việc |
|---|---|
| `s2-1` | Gửi thỏa thuận: giá, số ảnh giao, hạn giao |
| `s2-2` | Đã nhận cọc — ghi vào sổ Tiền bạc |
| `s2-3` | Thêm lịch chụp vào Lịch iPhone / Google Lịch |
| `s2-4` | Nhắn khách xác nhận đã giữ lịch |

> Ghi chú: `s2-2` là việc, không phải món đồ — xem §1.3.2. Form ghi cọc tự mở khi
> vào bước này (hành vi v1) chính là lúc tick việc này. `s2-3` dùng Lịch iPhone
> native 1 chạm / nút "Thêm vào Lịch iPhone" đã có trong chi tiết job.

### 2.3. Bước 3 — Sắp chụp (5 việc)

| ID | Việc |
|---|---|
| `s3-1` | Soạn đồ theo checklist đồ nghề (còn thiếu X món) |
| `s3-2` | Sạc pin, format thẻ, test máy / lens / đèn |
| `s3-3` | Xác nhận lại giờ + địa điểm + trang phục với khách |
| `s3-4` | Xem thời tiết / ánh sáng, chuẩn bị phương án dự phòng |
| `s3-5` | Chuẩn bị shot list / đạo cụ / hợp đồng giấy (nếu có) |

> Ghi chú: `s3-1` là **cầu nối duy nhất** sang checklist đồ nghề — chỉ hiện dòng đếm
> "còn thiếu X món" đọc từ `checkDone`, chạm vào mở tab checklist của job đó
> (dùng `checkSel = 'job:<id>'` như `GEAR-CHECKLIST.md` §4.3.2). Không liệt kê món đồ ở đây.

### 2.4. Bước 4 — Đã chụp (4 việc)

| ID | Việc |
|---|---|
| `s4-1` | Sao lưu thẻ nhớ ngay, giữ 2 bản (máy + ổ / Drive) |
| `s4-2` | Kiểm tra nhanh: đủ số lượng, không lỗi nét / sáng |
| `s4-3` | Nhắn khách đã chụp xong, hẹn ngày gửi ảnh chọn |
| `s4-4` | Ghi chi phát sinh trong buổi (đi lại, đạo cụ, makeup) |

> Việc cộng thêm cho job Film / Cả hai (`job.medium === 'Film'` hoặc `'Cả hai'`,
> theo đúng mẫu `FILM_EXTRA` của checklist đồ nghề):
>
> | ID | Việc (chỉ hiện khi job Film / Cả hai) |
> |---|---|
> | `s4-F1` | Gửi film đi tráng / scan, ghi ngày hẹn trả |
>
> Job Digital không thấy `s4-F1`. Tick của nó lưu cùng key `stageDone['job:<id>']`.

### 2.5. Bước 5 — Chọn ảnh (4 việc)

| ID | Việc |
|---|---|
| `s5-1` | Lọc ảnh lỗi (mờ, nhắm mắt), chọn ảnh tốt nhất |
| `s5-2` | Gửi link / Drive ảnh cho khách chọn |
| `s5-3` | Nhắn khách hạn chọn ảnh |
| `s5-4` | Ghi lại số ảnh khách đã chọn |

### 2.6. Bước 6 — Hậu kỳ (5 việc)

| ID | Việc |
|---|---|
| `s6-1` | Retouch theo phong cách đã hẹn với khách |
| `s6-2` | Đồng bộ màu / ánh sáng cả bộ |
| `s6-3` | Xuất file đúng cỡ (in / web), đặt tên file rõ ràng |
| `s6-4` | Sao lưu file gốc + file đã sửa |
| `s6-5` | Mở thử trên điện thoại, kiểm tra lần cuối trước khi giao |

### 2.7. Bước 7 — Đã giao (4 việc)

| ID | Việc |
|---|---|
| `s7-1` | Gửi link / Drive ảnh thành phẩm cho khách |
| `s7-2` | Nhắn khách kiểm tra + hướng dẫn tải / lưu ảnh |
| `s7-3` | Thu nốt tiền còn thiếu (xem sổ Tiền bạc) |
| `s7-4` | Xin phép đăng ảnh / xin đánh giá (nếu khách đồng ý) |

> Ghi chú: `s7-3` trỏ tới `jobOwe()` đã có — nếu còn thiếu 0đ thì việc này tự
> coi là xong (hiện tick sẵn, mờ đi, không cần bấm). Hành vi v1 khi vào bước
> "Đã giao" đã nhắc thu nốt; việc này chỉ ghi lại việc đó thành tick được.

### 2.8. Bước 8 — Xong (3 việc)

| ID | Việc |
|---|---|
| `s8-1` | Xác nhận khách đã nhận đủ ảnh, hài lòng |
| `s8-2` | Kiểm tra sổ: đã thu đủ tiền (còn thiếu 0đ) |
| `s8-3` | Ghi chú rút kinh nghiệm cho lần sau |

> Ghi chú: `s8-2` cũng tự xong khi `jobOwe() === 0` (như `s7-3`). Khóa tiền ở bước
> Xong của v1 (chặn bằng actionSheet khi còn thiếu tiền) **giữ nguyên, không thay
> bằng checklist** — checklist chỉ nhắc, khóa tiền vẫn là khóa riêng đã có.

### 2.9. Không làm ở v1.1 (ghi rõ để khỏi lan man)

- **Không thêm việc riêng theo loại job** (Portrait/Couple/Wedding/Lookbook/Event dùng
  chung 33 việc). Việc riêng theo loại để v1.2 nếu Việt thấy cần — riêng Wedding
  (timeline ngày cưới, danh sách người nhà) đã có trong checklist đồ nghề, không lặp lại đây.
- **Không cho người dùng sửa mẫu việc mặc định** (chỉ tick / bỏ tick). Sửa mẫu để v1.2,
  theo đúng quyết định của checklist đồ nghề.
- **Không thêm việc tự động từ dữ liệu** (VD: tự tick `s2-2` khi có khoản thu Cọc).
  Ngoại lệ duy nhất là `s7-3` / `s8-2` tự xong khi `jobOwe() === 0` — vì đó là số liệu
  sổ tiền đã có, không phải suy đoán. Mọi việc khác đều tick tay.
- **Không checklist cho job Đã huỷ.** Job huỷ ẩn checklist (như chi tiết job huỷ chỉ
  còn nút Khôi phục / Xoá); khôi phục về "Tư vấn" thì checklist hiện lại với tick cũ.

## 3. Mô hình dữ liệu (mới, không chạm cơ chế cũ)

### 3.1. Hằng số mẫu việc

```js
// Mẫu việc theo bước — key là tên bước trong STAGES, value là mảng việc {id, text}
var STAGE_CHECKLISTS = {
  'Tư vấn':   [{id:'s1-1', text:'Nghe nhu cầu khách: loại job, số người, phong cách'},
                {id:'s1-2', text:'Báo giá + gửi bảng giá / ảnh mẫu cho khách'},
                {id:'s1-3', text:'Chốt ngày, giờ, địa điểm chụp'},
                {id:'s1-4', text:'Ghi chú concept / yêu cầu đặc biệt của khách'}],
  'Chốt cọc': [{id:'s2-1', text:'Gửi thỏa thuận: giá, số ảnh giao, hạn giao'},
                {id:'s2-2', text:'Đã nhận cọc — ghi vào sổ Tiền bạc'},
                {id:'s2-3', text:'Thêm lịch chụp vào Lịch iPhone / Google Lịch'},
                {id:'s2-4', text:'Nhắn khách xác nhận đã giữ lịch'}],
  'Sắp chụp': [{id:'s3-1', text:'Soạn đồ theo checklist đồ nghề'},
                {id:'s3-2', text:'Sạc pin, format thẻ, test máy / lens / đèn'},
                {id:'s3-3', text:'Xác nhận lại giờ + địa điểm + trang phục với khách'},
                {id:'s3-4', text:'Xem thời tiết / ánh sáng, chuẩn bị phương án dự phòng'},
                {id:'s3-5', text:'Chuẩn bị shot list / đạo cụ / hợp đồng giấy (nếu có)'}],
  'Đã chụp':  [{id:'s4-1', text:'Sao lưu thẻ nhớ ngay, giữ 2 bản (máy + ổ / Drive)'},
                {id:'s4-2', text:'Kiểm tra nhanh: đủ số lượng, không lỗi nét / sáng'},
                {id:'s4-3', text:'Nhắn khách đã chụp xong, hẹn ngày gửi ảnh chọn'},
                {id:'s4-4', text:'Ghi chi phát sinh trong buổi (đi lại, đạo cụ, makeup)'}],
  'Chọn ảnh': [{id:'s5-1', text:'Lọc ảnh lỗi (mờ, nhắm mắt), chọn ảnh tốt nhất'},
                {id:'s5-2', text:'Gửi link / Drive ảnh cho khách chọn'},
                {id:'s5-3', text:'Nhắn khách hạn chọn ảnh'},
                {id:'s5-4', text:'Ghi lại số ảnh khách đã chọn'}],
  'Hậu kỳ':   [{id:'s6-1', text:'Retouch theo phong cách đã hẹn với khách'},
                {id:'s6-2', text:'Đồng bộ màu / ánh sáng cả bộ'},
                {id:'s6-3', text:'Xuất file đúng cỡ (in / web), đặt tên file rõ ràng'},
                {id:'s6-4', text:'Sao lưu file gốc + file đã sửa'},
                {id:'s6-5', text:'Mở thử trên điện thoại, kiểm tra lần cuối trước khi giao'}],
  'Đã giao':  [{id:'s7-1', text:'Gửi link / Drive ảnh thành phẩm cho khách'},
                {id:'s7-2', text:'Nhắn khách kiểm tra + hướng dẫn tải / lưu ảnh'},
                {id:'s7-3', text:'Thu nốt tiền còn thiếu (xem sổ Tiền bạc)'},
                {id:'s7-4', text:'Xin phép đăng ảnh / xin đánh giá (nếu khách đồng ý)'}],
  'Xong':     [{id:'s8-1', text:'Xác nhận khách đã nhận đủ ảnh, hài lòng'},
                {id:'s8-2', text:'Kiểm tra sổ: đã thu đủ tiền (còn thiếu 0đ)'},
                {id:'s8-3', text:'Ghi chú rút kinh nghiệm cho lần sau'}]
};
// Việc cộng thêm cho job Film / Cả hai, chỉ ở bước 'Đã chụp'
var STAGE_FILM_EXTRA = [{id:'s4-F1', text:'Gửi film đi tráng / scan, ghi ngày hẹn trả'}];
```

- `stageItems(stage, job)`: `STAGE_CHECKLISTS[stage]` + (`stage === 'Đã chụp'`
  và `job.medium` là Film/Cả hai thì + `STAGE_FILM_EXTRA`). Job Digital: bước
  "Đã chụp" đúng 4 việc; job Film/Cả hai: 5 việc.
- Tổng việc toàn pipeline: **33 việc** (4+4+5+4+4+5+4+3), job Film/Cả hai: **34 việc**.

### 3.2. Tick lưu theo ID việc — rút kinh nghiệm từ checklist đồ nghề

- Checklist đồ nghề lưu tick theo **tên món** (chuỗi) nên đổi câu chữ = mất tick
  (`GEAR-CHECKLIST.md` §4.2). Checklist theo bước **không lặp lại lỗi đó**:
  tick lưu theo **ID ổn định** (`s1-1`…`s8-3`, `s4-F1`).
- Đổi câu chữ việc sau này (sửa chính tả, dịch EN) **không mất tick**.
  Chỉ khi xoá hẳn một việc khỏi mẫu thì tick của ID đó mới bị bỏ (không hiện nữa).
- ID đặt theo bước (`s<chỉ số bước>-<số thứ tự>`), không dùng lại ID đã xoá cho việc khác.

```js
// Tick theo job + bước — key MỚI, riêng hoàn toàn với checkDone
var stageDone = {}; // stageDone['job:<id>'] = { 's1-1': true, 's1-2': false, ... }
//   - key ngoài: 'job:<id>' (giống quy ước checkDone, nhưng object khác nên không đụng)
//   - key trong: ID việc (s1-1...), KHÔNG phải câu chữ việc
//   - job chưa tick việc nào: không có key (không tạo object rỗng sẵn)
// Lưu trữ: thêm stageDone vào payload saveLocal() cùng checkDone (key 'troLyXeo.v1').
// Xoá job: delete stageDone['job:' + id] (cùng chỗ delete checkDone, dòng ~1515).
// Huỷ job: giữ nguyên stageDone. Khôi phục: hiện lại tick cũ.
// Sao lưu JSON: xuất stageDone theo job; khôi phục: nạp stageDone như checkDone.
```

### 3.3. Việc tự xong theo sổ tiền (chỉ 2 việc)

- `s7-3` (Đã giao) và `s8-2` (Xong): hiển thị tick sẵn + mờ đi khi `jobOwe(job) === 0`,
  không cho bấm bỏ tick tay (vì đó là số liệu sổ tiền, không phải việc nhớ tay).
  Khi `jobOwe() > 0`: hiện chưa tick, bấm vào mở form ghi thu nốt
  (dùng `openTxForm({jobId, kind:'thu', ...})` như `setStage()` đã làm).
- Mọi việc khác: tick tay, lưu ngay bằng `saveLocal()` như checklist đồ nghề.

## 4. Hiển thị ở đâu

### 4.1. Chi tiết job — vị trí chính (bắt buộc)

- Thêm mục **"Việc cần làm"** trong `jobDetailHTML(j)`, ngay dưới mục **Tiến độ**
  (thanh 8 bước + nút "Xong bước này"), trước mục Lịch.
- Nội dung mục này theo §5 (chỉ hiện việc của bước hiện tại + tóm tắt các bước khác).
- Tick / bỏ tick ngay trong chi tiết job, không cần mở màn hình khác.
  Sau mỗi lần tick: lưu ngay + vẽ lại mục (giữ vị trí cuộn như `refreshJobSheet()` đã làm).
- Job Đã huỷ: **không hiện** mục này. Job Xong: hiện đủ 8 bước ở dạng tóm tắt
  (xem §5.3) để đối chiếu, không cần tick thêm.

### 4.2. Màn Hôm nay — chỉ nhắc, không hiện full danh sách

- Thêm tối đa **1 dòng nhắc cho mỗi job** vào `todayItems()`, dùng chung khu vực
  "Cần nhớ" hiện có, không tạo loại nhắc mới:
  - Job ở bước bất kỳ (trừ Xong / Đã huỷ) mà **còn ≥ 2 việc chưa tick ở bước hiện tại**
    và job đó **có hẹn trong 7 ngày tới** (ngày chụp `shootDate` hoặc hạn giao
    `deadline` trong 7 ngày) → 1 dòng: `"[Tên khách] — bước [X] còn Y việc chưa xong"`,
    bấm vào mở chi tiết job đó (đúng `id` như các mục Hôm nay khác).
  - Ngưỡng ≥ 2 việc để màn Hôm nay không bị ngập khi job nào cũng thiếu 1 việc lặt vặt;
    việc lẻ 1 cái chỉ thấy khi mở chi tiết job.
  - Job kẹt (`stuckInfo()`) đã có dòng nhắc riêng — không tạo thêm dòng checklist
    trùng job kẹt đó (tránh 2 dòng cho cùng 1 job trong 1 ngày).
- Không hiện checklist theo bước ở tab checklist đồ nghề (tab đó chỉ có đồ nghề).

### 4.3. Không thêm màn hình / tab mới

- Không thêm tab, không thêm màn hình riêng cho checklist theo bước.
- Chỉ 2 điểm chạm: mục "Việc cần làm" trong chi tiết job (§4.1) + 1 dòng nhắc
  ở màn Hôm nay (§4.2). Đúng tinh thần tối giản của v1 ("tối đa 3 chạm").

## 5. Khi nào hiện / ẩn việc

**Nguyên tắc: chỉ hiện việc của bước hiện tại; các bước khác chỉ hiện tóm tắt.**

| Nhóm việc | Hiện khi nào | Dạng hiển thị |
|---|---|---|
| Việc của **bước hiện tại** | Luôn hiện, đầy đủ (3–5 việc + `s4-F1` nếu job Film ở bước Đã chụp) | Danh sách tick, bấm tick ngay được; đầu mục có tiến độ `n/m` (VD: "Chốt cọc · 2/4") |
| Việc của **bước đã qua** | Ẩn mặc định; hiện khi bấm "Xem các bước trước" | 1 dòng tóm tắt mỗi bước: `"Tư vấn · 4/4 ✓"` hoặc `"Chốt cọc · 3/4 — còn 1 việc"`. Bấm vào 1 dòng → mở rộng xem việc nào chưa tick, tick bù được |
| Việc của **bước chưa tới** | Ẩn hoàn toàn | Không hiện tên việc, chỉ hiện 1 dòng mờ: `"Chọn ảnh · Hậu kỳ · Đã giao · Xong — tới bước đó sẽ hiện"` (để người dùng biết còn việc phía trước mà không bị ngập) |
| Việc `s7-3` / `s8-2` tự xong | Theo `jobOwe()` (§3.3) | Tick sẵn + mờ khi đã thu đủ; chưa thu đủ thì hiện như việc thường |

**Các trường hợp đặc biệt:**

1. **Nhảy bước qua nhiều bước** (`jumpToStage`): các bước bị nhảy qua chuyển sang
   nhóm "bước đã qua" — việc chưa tick của chúng **giữ nguyên chưa tick**, hiện trong
   "Xem các bước trước" để tick bù sau. Không tự tick, không tự xoá.
2. **Lùi về bước trước** (nút "Lùi về…"): bước đó trở thành bước hiện tại → hiện đầy
   đủ việc của nó; bước vừa rời khỏi trở thành "bước chưa tới" → ẩn đi (tick đã có
   vẫn giữ, hiện lại khi quay lại bước đó).
3. **Job mới tạo** (bước Tư vấn): hiện 4 việc Tư vấn, các bước khác ẩn theo quy tắc trên.
4. **Job Xong:** hiện tóm tắt cả 8 bước (mỗi bước 1 dòng `n/m`), không hiện danh sách
   tick chi tiết — job đã xong thì chỉ để đối chiếu.
5. **Job Đã huỷ:** ẩn toàn bộ mục "Việc cần làm" (§2.9).

## 6. Có bắt buộc tick hết mới được nhảy bước không?

**Đề xuất (đã chốt trong thiết kế này): KHÔNG bắt buộc — chỉ nhắc.**

| Tình huống | Hành vi đề xuất |
|---|---|
| Bấm "Xong bước này" / nhảy tới bước kế mà **còn việc chưa tick ở bước hiện tại** | Hiện actionSheet liệt kê việc còn lại (tối đa 5 dòng, đúng câu chữ việc): tiêu đề `"Bước [X] còn Y việc chưa xong"`, 2 lựa chọn: (1) `"Để sau, vẫn qua bước"` (chuyển bước bình thường, việc chưa tick giữ lại ở "Xem các bước trước"); (2) `"Ở lại tick nốt"` (đóng bảng, ở lại bước hiện tại). **Mặc định không chọn hộ.** |
| Nhảy qua > 1 bước (đã có xác nhận của v1) | Giữ hộp xác nhận v1, cộng thêm 1 dòng vào nội dung: `"Các bước giữa còn tổng Z việc chưa xong"` (đếm gộp, không liệt kê từng việc để hộp không quá dài). Vẫn chỉ 1 lần xác nhận, không hỏi 2 lần. |
| Bấm "Xong bước này" mà **đã tick hết** | Chuyển bước ngay như v1, không hỏi thêm gì. |
| Bước **Xong** (bước cuối) | Giữ nguyên khóa tiền của v1: còn thiếu tiền thì actionSheet chặn + đề nghị thu nốt. Checklist không thêm khóa mới ở đây — `s8-2` chỉ là nhắc lại khóa đó. |
| Job kẹt / quá hạn | Không khóa gì thêm. `stuckInfo()` đã nhắc; checklist không biến nhắc thành chặn. |

**Vì sao không bắt buộc (lý do để Việt duyệt):**

1. Thực tế chụp ảnh có việc làm ngoài app (nhắn Zalo, gọi điện) — bắt tick hết mới
   cho qua bước sẽ chặn người dùng đúng lúc đang vội trước giờ chụp.
2. V1 đã chốt triết lý "nhảy thẳng tới bước bất kỳ" — bắt buộc tick sẽ phá quyết định đó.
3. Việc quan trọng nhất (thu đủ tiền trước khi Xong) **đã có khóa riêng** trong v1;
   không cần thêm khóa thứ hai bằng checklist.

## 7. Kiểm chứng (agent code v1.1 phải chạy trước khi báo xong)

- [ ] `node --check` các script inline trong `www/index.html` vẫn đạt.
- [ ] Chạy lại test jsdom hiện có (bản v1 + test checklist đồ nghề v1.1) — số đạt
      không giảm; cập nhật test nếu test cũ expect đúng số mục trong chi tiết job.
- [ ] Đếm việc: mỗi bước đúng số việc §2 (Tư vấn 4, Chốt cọc 4, Sắp chụp 5, Đã chụp 4,
      Chọn ảnh 4, Hậu kỳ 5, Đã giao 4, Xong 3); tổng 33; `Object.keys(STAGE_CHECKLISTS)` = 8 bước = `STAGES`.
- [ ] Job Film/Cả hai ở bước Đã chụp → 5 việc (4 + `s4-F1`); đổi job sang Digital
      → về 4 việc, tick `s4-F1` không hiện (không xoá dữ liệu tick cũ).
- [ ] Tick 1 việc của job A → mở job B, việc của B không bị ảnh hưởng (key `job:<id>` riêng).
- [ ] Tick việc của bước hiện tại → chuyển bước → quay lại bước cũ → tick vẫn còn
      (không reset khi chuyển bước).
- [ ] Nhảy từ Tư vấn thẳng tới Hậu kỳ → hộp xác nhận v1 vẫn hiện + có dòng đếm việc
      chưa xong của các bước giữa; sau khi nhảy, việc chưa tick nằm trong "Xem các bước trước".
- [ ] Bấm "Xong bước này" khi còn việc chưa tick → actionSheet liệt kê việc còn lại,
      chọn "Để sau" thì qua bước được; chọn "Ở lại" thì ở lại.
- [ ] Bấm "Xong bước này" khi đã tick hết → qua bước ngay, không hỏi thêm.
- [ ] Khóa tiền ở bước Xong giữ nguyên: job còn thiếu tiền → actionSheet chặn như v1
      (checklist không thay hành vi này, không thêm khóa mới).
- [ ] Job còn ≥ 2 việc chưa tick ở bước hiện tại + có hẹn trong 7 ngày → màn Hôm nay
      hiện 1 dòng nhắc; job đủ việc hoặc không có hẹn gần → không hiện; job kẹt không
      bị nhắc trùng 2 dòng.
- [ ] Xoá job → cả `checkDone['job:<id>']` và `stageDone['job:<id>']` đều bị xoá.
      Huỷ job → mục "Việc cần làm" ẩn; khôi phục về Tư vấn → tick cũ hiện lại.
- [ ] Checklist đồ nghề không đổi hành vi: tick món đồ không tick việc theo bước
      và ngược lại (đặc biệt cặp `s2-2` / "Cọc đã nhận" — tick riêng).
- [ ] Đổi câu chữ 1 việc trong `STAGE_CHECKLISTS` (test cố tình) → xác nhận tick cũ
      vẫn còn (chứng minh lưu theo ID, §3.2), rồi hoàn tác — không đưa bản test đó vào code chính.
- [ ] Sao lưu JSON rồi khôi phục → `stageDone` đi kèm đủ, tick không mất;
      khôi phục bản sao lưu cũ (không có `stageDone`) → app không lỗi, checklist bắt đầu trống.

## 8. Ngoài phạm vi v1.1 (không làm)

- Không việc riêng theo loại job; không cho sửa mẫu việc mặc định (xem §2.9).
- Không tự tick việc từ dữ liệu (trừ `s7-3`/`s8-2` theo `jobOwe()`, §3.3).
- Không nhắc đẩy (local notification) riêng cho checklist theo bước — chỉ dòng nhắc
  trên màn Hôm nay (§4.2); nhắc đẩy đã có thiết kế riêng trong `NOTIFICATIONS.md`.
- Không đồng bộ `stageDone` lên CloudKit riêng — theo job, đi kèm khi Nấc 2 sync job
  (xem `CLOUDKIT-PLAN.md`), như checklist đồ nghề.
- Không checklist Kanban kéo thả (đã chốt không làm ở v1, để v1.2 nếu Việt yêu cầu).

## 9. Ghi chú cho agent code

- File duy nhất cần sửa (dự kiến): `www/index.html` — thêm `STAGE_CHECKLISTS`,
  `STAGE_FILM_EXTRA`, `stageDone`, `stageItems()`, `renderStageChecklist()` (mới),
  mục "Việc cần làm" trong `jobDetailHTML()`, 1 nhánh nhắc trong `todayItems()`,
  1 nhánh nhắc trong `setStage()`/`jumpToStage()` (§6), `saveLocal()` + xoá job +
  sao lưu/khôi phục (§3.2, §1.3.4–5). Không tạo file mới, không đổi key `checkDone`.
- Thứ tự làm đề xuất: (1) hằng số + `stageDone` + lưu trữ, (2) mục "Việc cần làm"
  trong chi tiết job (chỉ bước hiện tại + tóm tắt), (3) nhắc khi chuyển bước (§6),
  (4) dòng nhắc màn Hôm nay, (5) `s7-3`/`s8-2` tự xong theo `jobOwe()`, (6) cập nhật test.
- Câu chữ việc trong §2 là câu chuẩn tiếng Việt; bản EN dịch 1–1 sang
  `I18N-STRINGS.md` khi code (mỗi việc 1 key `stage.s1-1`…), không dịch tự do trong code.
- Nếu Việt muốn bắt buộc tick ở một bước nào đó sau này (VD: bắt buộc `s4-1` sao lưu
  trước khi qua Chọn ảnh): chỉ thêm khóa ở đúng bước đó, không đổi nguyên tắc chung §6 —
  báo lại Việt trước khi làm vì đó là thay đổi quyết định trong file này.
