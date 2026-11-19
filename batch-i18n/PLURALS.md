# FotoBro iOS v1 — Quy tắc số nhiều (PLURALS)

- Phạm vi: chỉ app FotoBro iOS v1, 2 ngôn ngữ `vi` / `en` (theo `I18N-STRINGS.md`).
  `locale` chỉ nhận `'vi'` / `'en'`; tiền tệ chỉ đổi hiển thị VND/USD, không quy đổi tỷ giá.
- Nguồn đối chiếu ngày 20/11/2026: `~/workspace/fotobro-ios-v1/I18N-STRINGS.md`
  (80 chuỗi) và `~/workspace/fotobro-ios-v1/www/index.html` (341.754 byte).
- File này chỉ là tài liệu quy tắc — **không sửa code**. Khi nối i18n thì áp dụng
  các quy tắc dưới đây vào đúng chỗ đếm trong code (xem §6).

## 1. Nguyên tắc chung

| | Tiếng Việt (`vi`) | Tiếng Anh (`en`) |
|---|---|---|
| Danh từ có đổi hình thức theo số lượng không? | **Không.** Một hình thức duy nhất cho 0, 1 và nhiều. | **Có.** Dạng số ít chỉ dùng cho đúng 1; mọi số khác dùng dạng số nhiều. |
| Cách đếm | Số + (lượng từ nếu có) + danh từ, danh từ giữ nguyên. | Số + danh từ số ít/số nhiều theo quy tắc §3–§4. |
| Số 0 | Dùng dạng như số nhiều trong tiếng Việt (vốn không đổi); nhưng trong app **ưu tiên câu "Chưa có …"** thay vì "0 …" (xem §5). | Luôn dùng dạng **số nhiều**: `0 jobs`, không bao giờ `0 job`. |
| Số 1 | Danh từ giữ nguyên như số nhiều. | Luôn dùng dạng **số ít**: `1 job`, `1 day`, `1 photo`. |
| Số thập phân / phân số | Danh từ giữ nguyên. | Dạng số nhiều, kể cả nhỏ hơn 1: `0.5 days`, `1.5 jobs`. |
| Số âm | Không gặp trong app v1 (số đếm job/ngày/khoản không âm). Nếu có, tiếng Việt giữ nguyên, tiếng Anh dùng số nhiều trừ đúng −1. | — |

Quy tắc vàng khi dịch một chuỗi có số: **không dịch từng từ rồi giữ nguyên
danh từ tiếng Anh ở dạng số ít** — phải chọn dạng số ít/số nhiều theo con số
thực tế lúc hiển thị. Mọi chuỗi đếm phải là chuỗi động có tham số `{n}`
(hoặc `{count}`), không hard-code một dạng duy nhất.

## 2. Tiếng Việt — không đổi hình thức số nhiều

### 2.1. Cách đếm

Công thức: **`{n}` + [lượng từ] + danh từ** — danh từ không thêm hậu tố,
không đổi dạng, không thêm `s/es`.

- Không có số: dùng `các` / `những` chỉ khi nói chung chung, không có con số
  cụ thể (ví dụ: "các job đang chạy"). **Không dùng `các`/`những` cùng với
  số đếm cụ thể** — sai: "3 các job"; đúng: "3 job".
- Số 0: nói "0 job" được về mặt ngữ pháp, nhưng trong app ưu tiên câu
  không có số 0 (xem §5): "Chưa có job", "Chưa có khoản nào".

### 2.2. Lượng từ (classifier) dùng trong app

Lượng từ không bắt buộc trong mọi câu, nhưng khi đếm thì dùng đúng lượng từ
của từng danh từ — và **chỉ lượng từ đứng sau số, danh từ vẫn giữ nguyên**:

| Danh từ trong app | Đếm đúng (VI) | Ghi chú |
|---|---|---|
| job / buổi chụp | `1 buổi chụp`, `2 buổi chụp`, `3 job đang chạy` | Trong code v1, "job" đã dùng như danh từ chung (vd. `N job đang chạy`, `tile … unit:'job'`). Khi viết tiếng Việt đầy đủ thì dùng "buổi chụp"; khi giữ từ "job" thì vẫn không đổi dạng: `1 job`, `5 job`. |
| ảnh | `1 tấm ảnh`, `2.000 tấm ảnh`, `1 ảnh`, `5 ảnh` | "Tấm" là lượng từ của ảnh in/chụp; "ảnh" đứng một mình cũng đếm được. Trong app: "Thêm ảnh từ máy", "Hạn giao ảnh". |
| ngày | `1 ngày`, `7 ngày`, `30 ngày`, `14 ngày sau` | Không có lượng từ. Code v1: `Đã {n} ngày ở bước …`, `trễ {n} ngày`, `còn {n} ngày`, `Lịch iPhone 30 ngày tới`, hạn giao mặc định 14 ngày (`deliverDays: 14`). |
| khách | `1 khách`, `2 khách`, `3 khách còn thiếu tiền` | Không có lượng từ (nói "1 vị khách" chỉ khi trang trọng — app không dùng). Code v1: `Có {n} khách đang chờ tư vấn`, `{n} khách còn thiếu tiền`. |
| khoản thu / khoản chi | `1 khoản thu`, `2 khoản chi`, `3 khoản thu chi` | "Khoản" chính là lượng từ. Code v1: `Kèm theo {n} khoản thu chi của job này`, `Chưa có khoản nào`, `Ghi khoản thu / chi`. |
| việc (cần nhớ) | `1 việc`, `3 việc` | Code v1: tile Hôm nay `unit:'việc'` với số việc cần nhớ. |
| bước (pipeline) | `bước 1`, `bước 8`, `kẹt ở bước {stage}` | Số thứ tự, không phải số đếm số nhiều — không áp quy tắc số nhiều. |
| món (checklist đồ) | `1 món`, `3 món` | Code v1: `Bỏ tick {n} món …` |
| phòng ban | `6 phòng ban`, `1 phòng ban` | Không đổi dạng. Tên 6 phòng Sen/Nắng/Mây/Lúa/Trăng/Đèn giữ nguyên (xem `I18N-STRINGS.md` §H). |

### 2.3. Ví dụ tiếng Việt (đúng cho mọi số)

- `0 job đang chạy` → ưu tiên: `Chưa có job nào đang chạy`
- `1 job đang chạy` / `2 job đang chạy` / `10 job đang chạy` — cùng một dạng "job"
- `1 buổi chụp`, `3 buổi chụp`
- `1 tấm ảnh`, `2.000 tấm ảnh`
- `Đã 1 ngày ở bước Hậu kỳ` / `Đã 7 ngày ở bước Hậu kỳ` / `Đã 30 ngày ở bước Hậu kỳ`
- `Còn 1 ngày` / `Còn 14 ngày` ; `Trễ 1 ngày` / `Trễ 3 ngày`
- `1 khách còn thiếu tiền` / `5 khách còn thiếu tiền`
- `1 khoản thu` / `2 khoản chi` / `3 khoản thu chi của job này`
- `1 việc cần nhớ` / `4 việc cần nhớ`

## 3. Tiếng Anh — quy tắc thêm s / es (dạng thường)

Mặc định: **số ít + `s`** → số nhiều. Chỉ dùng dạng số ít khi `n == 1`
(đúng bằng 1, kể cả `1.0` hiển thị thành `1`); mọi giá trị khác dùng số nhiều.

| Quy tắc | Điều kiện | Ví dụ trong app |
|---|---|---|
| Thêm `s` | Hầu hết danh từ | `job → jobs`, `day → days`, `client → clients`, `photo → photos`, `shoot → shoots`, `transaction → transactions`, `expense → expenses`, `item → items`, `step → steps`, `event → events` |
| Thêm `es` | Tận cùng bằng `s`, `x`, `z`, `ch`, `sh` | `class → classes`, `box → boxes`, `watch → watches`, `dish → dishes`. Trong app v1 ít gặp; áp dụng khi có danh từ loại này (vd. `address → addresses`). |
| `y` → `ies` | Tận cùng bằng phụ âm + `y` | `city → cities`, `delivery → deliveries` ("delivery deadline" là cụm danh từ, không đếm trực tiếp). Nguyên âm + `y` thì chỉ thêm `s`: `day → days`, `key → keys`. |
| `f` / `fe` → `ves` | Một số ít từ (không theo quy tắc chung) | `life → lives`, `wife → wives`. Không áp dụng máy móc: `roof → roofs`, `chief → chiefs`. Trong app v1 không có danh từ nhóm này. |
| Thêm `s` sau `o` | Hầu hết | `photo → photos`, `studio → studios`. Ngoại lệ `tomato → tomatoes`, `hero → heroes` — không có trong app v1. |

Lưu ý chính tả: không thêm dấu nháy (`job's` là sở hữu cách, không phải
số nhiều); không viết `photo's` khi muốn nói nhiều ảnh.

## 4. Tiếng Anh — trường hợp bất quy tắc và danh từ đặc biệt

Chỉ các từ dưới đây mới lệch khỏi quy tắc §3; mọi danh từ còn lại trong app
đều theo §3.

| Từ (số ít → số nhiều) | Dùng trong app v1 | Ghi chú |
|---|---|---|
| `person → people` | Khách (khi đếm người) | **Quan trọng nhất trong app.** Đếm khách bằng `people`, không dùng `persons` trong giao diện thường: `1 person`, `2 people`, `3 people still owe money`. (Trong văn bản pháp lý mới dùng `persons` — app v1 không dùng.) |
| `child → children` | Không có trong v1 | Ghi để tránh dịch máy sai nếu sau này có chuỗi về trẻ em. |
| `man → men`, `woman → women` | Không có trong v1 | Tương tự. |
| `foot → feet`, `tooth → teeth` | Không có trong v1 | Chỉ liệt kê để đủ bảng bất quy tắc. |
| `staff` | **Không đếm được, không thêm `s`.** | `staff` đã là tập hợp: `3 staff members` nếu cần đếm người, không viết `3 staffs`. Trong app, 6 phòng ban mỗi phòng một người phụ trách — đếm "phòng", không đếm "staff". |
| `money` | **Không đếm được, không thêm `s`.** | Tiền đếm bằng khoản: `3 transactions`, `2 payments` — không viết `3 moneys`. Chuỗi `money.income` / `money.expense` là nhãn, không đếm. |
| `equipment`, `gear` | **Không đếm được.** | Phòng Đèn giữ đồ: đếm `3 items of gear`, không viết `gears`. |
| `information`, `advice` | **Không đếm được.** | Không có trong v1; nếu thêm chuỗi trợ lý thì đếm bằng `pieces of information` / `tips`. |
| `photo` | Theo §3: `photos` | Không phải bất quy tắc — ghi rõ vì hay bị viết nhầm `photoes`. |
| `shoot` | Theo §3: `shoots` | Tab `nav.jobs` = `Shoots`; `1 shoot`, `3 shoots`. |
| `job` | Theo §3: `jobs` | `today.noJobs` = `No jobs yet` (đã đúng dạng số nhiều). |

Từ mượn / tên riêng không đổi dạng số nhiều: `FotoBro`, `Sen`, `Nắng`,
`Mây`, `Lúa`, `Trăng`, `Đèn` (giữ tên Việt + chú thích Anh theo
`I18N-STRINGS.md` §H); loại chụp `Portrait`, `Couple`, `Wedding`,
`Lookbook`, `Event` và chất liệu `Digital`, `Film`, `Both` là nhãn loại,
không đếm bằng số nhiều khi đứng sau số (nói `3 Wedding shoots`, không nói
`3 Weddings` trong app — nếu cần đếm loại thì đếm `shoots`).

## 5. Xử lý số 0 và số 1 — bảng quyết định

Đây là chỗ hay sai nhất. Áp dụng đúng bảng này cho mọi chuỗi đếm.

| `n` | Tiếng Việt | Tiếng Anh | Ví dụ đầy đủ |
|---|---|---|---|
| 0 | Ưu tiên câu không số: `Chưa có …` / `Không có … nào …` ; nếu bắt buộc hiện số thì `0` + danh từ giữ nguyên | **Số nhiều**, không dùng câu số 0 nếu đã có câu "No … yet" | VI: `Chưa có job` (`today.noJobs`); EN: `No jobs yet` — **không** viết `0 jobs yet` khi đã có câu này. VI: `Chưa có khoản nào` (`money.noTx`); EN: `No transactions yet`. |
| 0 (bắt buộc hiện số, vd. ô số liệu) | `0 job đang chạy`, `0 việc`, `0 khoản` | `0 jobs running`, `0 tasks`, `0 transactions` | Ô số liệu Hôm nay: số `0` + nhãn số nhiều trong EN; nhãn VI giữ nguyên. |
| 1 | Danh từ giữ nguyên | **Số ít** | VI: `1 job đang chạy`, `Còn 1 ngày`, `1 khách còn thiếu tiền`; EN: `1 job running`, `1 day left`, `1 client still owes money` / `1 person still owes money`. |
| 2 trở lên | Danh từ giữ nguyên | **Số nhiều** | VI: `3 job đang chạy`, `Còn 14 ngày`, `5 khách còn thiếu tiền`; EN: `3 jobs running`, `14 days left`, `5 clients still owe money`. |
| Số thập phân (vd. 1,5) | Danh từ giữ nguyên | **Số nhiều** | EN: `1.5 days` (không viết `1.5 day`). Trong app v1 số đếm job/ngày/khoản là số nguyên; quy tắc này để phòng khi hiển thị số giờ/ngày lẻ. |
| Không biết số / chưa đếm | Không dùng số; dùng `các` / `những` hoặc câu chung | Dùng dạng số nhiều chung, hoặc câu không số | VI: `Các job đang chạy`; EN: `Running jobs` (không số). |

Các câu "không có" đã có sẵn trong `I18N-STRINGS.md` và code v1 — dùng lại,
không bịa câu mới:

- `today.noJobs`: VI `Chưa có job` / EN `No jobs yet`
- `money.noTx`: VI `Chưa có khoản` / EN `No transactions yet`
- Code v1: `Chưa có buổi chụp nào`, `Chưa có khoản nào`, `Không có job nào
  đang chờ hậu kỳ`, `Không có khách nào đang chờ tư vấn` — khi dịch sang EN,
  các câu này đều dùng dạng số nhiều (`No shoots …`, `No transactions …`,
  `No jobs …`, `No clients …`).

## 6. Đối chiếu với code v1 — những chỗ phải dùng quy tắc này khi nối i18n

Các vị trí dưới đây hiện đang hard-code một dạng duy nhất (hoặc chỉ có
tiếng Việt). Khi nối i18n, mỗi chỗ phải tách thành chuỗi có `{n}` + chọn
dạng số ít/số nhiều theo §3–§5 ở locale `en`, giữ nguyên dạng ở locale `vi`.

| # | Vị trí trong `www/index.html` | Hiện trạng | Áp quy tắc |
|---|---|---|---|
| 1 | Ô số liệu Hôm nay: `tile({… num:active, unit:'job'})` và `tile({… num:items.length, unit:'việc'})` | `unit` cố định `'job'` / `'việc'` cho mọi số — **sai ở EN khi n ≠ 1** (vd. `3 job`) | EN: `n==1 ? 'job' : 'jobs'`; `n==1 ? 'task' : 'tasks'` (dịch "việc" → `task`/`item`; chốt một từ trong bảng i18n). VI: giữ `'job'` / `'việc'` cho mọi n. |
| 2 | `$('#jobsEyebrow').textContent = … + ' job đang chạy'` | VI đúng (không đổi dạng), nhưng chưa có bản EN | EN: `n==1 ? '1 job running' : '{n} jobs running'`. VI: `{n} job đang chạy` cho mọi n. |
| 3 | Job kẹt: `'Đã ' + days + ' ngày ở bước ' + j.stage` | VI đúng cho mọi n | EN: `n==1 ? 'Stuck at {stage} for 1 day' : 'Stuck at {stage} for {n} days'`. Chuỗi `notify.stuck` (`Job kẹt ở bước {stage}` / `Job stuck at {stage}`) cần thêm `{days}` khi gắn số ngày. |
| 4 | Hạn giao: `trễ {n} ngày` / `còn {n} ngày` | VI đúng cho mọi n | EN: `n==1 ? '1 day overdue' / '1 day left' : '{n} days overdue' / '{n} days left'`. |
| 5 | Nhập Lịch iPhone: `Lịch iPhone 30 ngày tới thành job` | VI đúng; số 30 cố định | EN: `iPhone Calendar events from the next 30 days become jobs` — `days` và `jobs` đều số nhiều vì 30 > 1. |
| 6 | Báo cáo phòng ban: `Có {n} khách đang chờ tư vấn`, `{n} khách còn thiếu tiền`, `{n} job vừa chốt cọc`, `Đang hậu kỳ {n} job`, `{n} job đã quá hạn giao` | VI đúng cho mọi n | EN: `… people …` cho khách (bất quy tắc §4: `1 person`, `2 people`); `jobs` cho job (`1 job`, `2 jobs`). |
| 7 | Xoá job: `Kèm theo {n} khoản thu chi của job này` | VI đúng cho mọi n | EN: `n==1 ? 'Including 1 transaction for this job' : 'Including {n} transactions for this job'`. |
| 8 | Checklist: `$('#checkCount').textContent = nDone + '/' + items.length`; `Bỏ tick {n} món …` | Dạng `x/y` không cần chia số ít/số nhiều; câu `Bỏ tick {n} món` VI đúng | EN: `Uncheck {n} item(s)` → viết đủ: `n==1 ? 'Uncheck 1 item' : 'Uncheck {n} items'`. Không dùng dạng viết tắt `item(s)` trong giao diện. |
| 9 | Hạn giao mặc định: `deliverDays: 14` → `Chọn ngày chụp là hạn giao tự điền {n} ngày sau` | VI đúng | EN: `… delivery deadline is auto-filled {n} days later` (`days`, vì 14 > 1; giữ công thức chung cho mọi n). |
| 10 | `money.noTx` / `today.noJobs` (đã có trong `I18N-STRINGS.md`) | Đã đúng cả hai ngôn ngữ | Giữ nguyên; đây là mẫu chuẩn cho trường hợp n = 0 (xem §5). |

## 7. Mẫu triển khai (chỉ để tham khảo khi nối i18n — không phải code v1)

Hàm chọn dạng theo số lượng (ý tưởng, viết lại theo code thật khi nối i18n):

```js
// Tiếng Việt: luôn trả về dạng duy nhất. Tiếng Anh: 1 → số ít, còn lại → số nhiều.
// Dùng Intl.PluralRules khi có thể: 'vi' luôn trả 'other'; 'en' trả 'one' chỉ khi n == 1.
function plural(n, one, other, locale) {
  if (locale === 'vi') return other;          // VI không đổi dạng: dùng chung một dạng
  return n === 1 ? one : other;               // EN: 1 → one, 0 / 2+ / số lẻ → other
}
// Ví dụ: plural(n, 'job', 'jobs', loc) · plural(n, 'day', 'days', loc)
//        plural(n, 'person', 'people', loc)  // bất quy tắc: truyền cả hai dạng
//        plural(n, 'transaction', 'transactions', loc)
```

Quy ước key i18n cho chuỗi đếm (đề xuất, chốt khi nối i18n):

- Dạng đơn giản (chỉ EN đổi dạng): một key với `{n}` + hàm `plural()` ở trên,
  vd. `jobs.running: "{n} job đang chạy" / "{n} job(s) running"` → render bằng
  `plural(n, 'job', 'jobs', loc)`.
- Dạng câu đầy đủ khác nhau giữa 0/1/nhiều: tách 3 key
  `*.zero` / `*.one` / `*.other`, vd. `jobs.running.zero` = `Chưa có job nào
  đang chạy` / `No jobs running`, `.one` = `1 job đang chạy` / `1 job running`,
  `.other` = `{n} job đang chạy` / `{n} jobs running`.
- **Không dùng** dạng viết tắt `job(s)`, `day(s)`, `item(s)` trong giao diện —
  luôn render đủ dạng đúng theo số.

## 8. Những gì KHÔNG thuộc quy tắc này

- Tiền tệ: `1.000.000₫` (vi-VN) / `$1,000.00` (en-US); chỉ đổi hiển thị,
  không quy đổi tỷ giá — đã quy định trong `I18N-STRINGS.md`, không lặp lại ở đây.
- Ngày/giờ: `toLocaleDateString('vi-VN' / 'en-US')` đã có trong code
  (`fmtDate`, `fmtRel` với `Hôm nay`/`Tomorrow`/`Yesterday`); số nhiều chỉ
  áp dụng khi đếm số ngày (`{n} ngày` / `{n} days`), không áp dụng cho tên
  thứ/ngày trong tuần.
- Số thứ tự bước pipeline (`bước 1` … `bước 8`, `stage.0` … `stage.7`):
  giữ nguyên thứ tự và tên bước theo `I18N-STRINGS.md` §E; không chia số ít/số nhiều.
- Tên riêng không dịch: `FotoBro`, tên 6 phòng ban, loại chụp, chất liệu
  (xem §4 và `I18N-STRINGS.md`).
- Nấc 2/3 (đồng bộ, nhóm, sao lưu mã hoá, góp ý): ngoài phạm vi v1, không
  đặt quy tắc số nhiều cho các chuỗi đó trong file này.
