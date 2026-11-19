# FotoBro iOS v1 — Định dạng ngày/giờ tiếng Việt & tiếng Anh (DATE-TIME)

- File: `~/workspace/fotobro-ios-v1/batch-i18n/DATE-TIME.md` (chỉ tài liệu, không sửa code)
- Kiểm tra ngày 20/11/2026 đối chiếu với `www/index.html` và `I18N-STRINGS.md`
  trong `~/workspace/fotobro-ios-v1/`; các chuỗi ngày/giờ mẫu đã kiểm chứng
  bằng `Intl.DateTimeFormat` (Node, ICU đầy đủ) với ngày neo **Thứ Bảy,
  21/11/2026**.
- Phạm vi: chỉ v1. Ngôn ngữ chỉ nhận `'vi'` / `'en'` (`loc()` trong code);
  tiền tệ chỉ nhận `'VND'` / `'USD'` — xem `CURRENCY-FORMAT.md`, không nhắc
  lại ở đây.
- Quy tắc vàng: **lưu trữ không đổi, chỉ đổi cách hiển thị.** Ngày lưu
  `YYYY-MM-DD`, giờ lưu `HH:MM` (24 giờ), múi giờ lưu theo giờ địa phương
  của máy. Mọi định dạng hiển thị đều đi qua `Intl.DateTimeFormat` với
  locale + `timeZone` tường minh — không tự nối chuỗi `ngày/tháng` hay
  `tháng/ngày` bằng tay.

## 0. Nguyên tắc chung

| Quy tắc | Nội dung |
|---|---|
| Locale | `vi` → `vi-VN`; `en` → `en-US`. Lấy từ `state.cfg.locale` qua `loc()` (dòng 953). Không đoán locale từ máy — người dùng chọn trong Cài đặt, mặc định `vi`. |
| Múi giờ hiển thị | Luôn truyền `timeZone: 'Asia/Ho_Chi_Minh'` khi format ngày/giờ của job. Không dùng múi giờ mặc định của máy (máy test ở UTC sẽ lệch 7 tiếng). Xem §7. |
| Lưu trữ | Ngày: `YYYY-MM-DD` (`cleanDate`, dòng 869; `dstr()`, dòng 807). Giờ: `HH:MM` 24 giờ (`cleanTime`). Không lưu chuỗi đã format, không lưu timestamp UTC cho ngày chụp — ngày chụp là "ngày theo lịch treo tường", không phải một thời điểm tuyệt đối. |
| Phân tích (parse) | `parseD(s)` (dòng 974) tách `YYYY-MM-DD` thành `new Date(y, m-1, d)` — nửa đêm giờ địa phương. Giữ nguyên; không parse bằng `new Date('2026-11-21')` (chuỗi ISO không giờ sẽ hiểu là UTC, lệch ngày khi máy ở múi giờ âm). |
| Thứ tự ngày/tháng | VI: ngày trước tháng sau (`21/11`). EN (Mỹ): tháng trước ngày sau (`11/21`). Không bao giờ hiển thị `21/11` ở chế độ EN hay `11/21` ở chế độ VI. |
| Giờ | VI: 24 giờ, không SA/CH (`08:00`, `14:30`). EN: 12 giờ + AM/PM (`8:00 AM`, `2:30 PM`). Xem §3. |
| Số 0 ở đầu | Giờ VI giữ 2 chữ số (`08:00`); giờ EN bỏ số 0 ở đầu giờ (`8:00 AM`, không phải `08:00 AM`). Phút luôn 2 chữ số cả hai ngôn ngữ. Ngày/tháng trong dạng ngắn: VI `21/11` (không cần số 0), EN `11/21`. |
| Viết hoa | EN: tên thứ và tên tháng viết hoa chữ đầu (`Saturday, November 21`). VI: `Thứ Bảy` viết hoa chữ T (đầu ra của `Intl` đã đúng — giữ nguyên, không `.toLowerCase()`). `fmtHeaderDate` (dòng 987) đã viết hoa chữ đầu — giữ. |
| Ngày tương đối | Hôm nay / Hôm qua / Ngày mai (EN: Today / Yesterday / Tomorrow) chỉ dùng khi ngày đó đúng là hôm nay/hôm qua/ngày mai theo lịch `Asia/Ho_Chi_Minh`, không theo UTC. Xem §5. |

## 1. Ngày đầy đủ (full date) — có năm, có thứ

Dùng ở: chi tiết job (Ngày chụp, Hạn giao ảnh), báo cáo cuối ngày, thông báo
nhắc hạn giao, xuất lịch (`.ics` / Google Lịch hiển thị cho người đọc).

| Dạng | Tiếng Việt | English |
|---|---|---|
| Đầy đủ | `Thứ Bảy, 21 tháng 11, 2026` | `Saturday, November 21, 2026` |
| Đầy đủ, không thứ | `21 tháng 11, 2026` | `November 21, 2026` |

- API: `toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })`.
- Không có thứ: bỏ `weekday: 'long'`.
- ⚠️ **Hiện trạng code chưa có dạng này.** `fmtDate()` (dòng 975) dùng
  `{ weekday: 'long', day: 'numeric', month: 'numeric' }` — **không có năm**
  và tháng dạng số (`Thứ Bảy, 21/11`). Dạng này vẫn dùng được cho danh sách
  (xem §2), nhưng ở chi tiết job và hạn giao ảnh phải dùng dạng đầy đủ có
  năm ở trên, nếu không job chụp 21/11/2026 và 21/11/2027 hiển thị giống
  hệt nhau.
- Ví dụ khác (cùng công thức, đã kiểm chứng bằng `Intl`):
  - 01/01/2027 (Thứ Sáu): VI `Thứ Sáu, 1 tháng 1, 2027` · EN `Friday, January 1, 2027`
  - 28/11/2026 (Thứ Bảy): VI `Thứ Bảy, 28 tháng 11, 2026` · EN `Saturday, November 28, 2026`
  - 31/12/2026 (Thứ Năm): VI `Thứ Năm, 31 tháng 12, 2026` · EN `Thursday, December 31, 2026`

## 2. Ngày ngắn (short date) — danh sách, tiêu đề nhóm

Dùng ở: danh sách job, nhóm giao dịch sổ tiền (`fmtHeaderDate`, dòng 987),
màn hình Hôm nay, chat trợ lý.

| Dạng | Tiếng Việt | English | API (`toLocaleDateString`) |
|---|---|---|---|
| Ngắn + thứ (mặc định trong danh sách) | `Thứ Bảy, 21/11` | `Saturday, 11/21` | `{ weekday: 'long', day: 'numeric', month: 'numeric' }` — đúng `fmtDate()` hiện tại |
| Ngắn, không thứ | `21/11` | `11/21` | `{ day: 'numeric', month: 'numeric' }` |
| Ngắn + năm | `21/11/2026` | `11/21/2026` | `{ day: '2-digit', month: '2-digit', year: 'numeric' }` |
| Tháng + năm (tiêu đề sổ tiền) | `Tháng 11, 2026` | `November 2026` | `{ month: 'long', year: 'numeric' }` |

- ⚠️ **Lỗi hiện tại:** dòng 1791 ghi tiêu đề sổ tiền bằng nối chuỗi cứng
  `'Tháng ' + (tháng) + ', ' + (năm)` — ở chế độ EN vẫn hiện `Tháng 11, 2026`.
  Phải đổi sang công thức `{ month: 'long', year: 'numeric' }` ở bảng trên.
- Quy tắc chọn dạng: trong cùng một tháng thì dùng "ngắn, không thứ" hoặc
  "ngắn + thứ"; khi danh sách chứa nhiều tháng/năm khác nhau (sổ tiền, báo
  cáo) thì dùng "ngắn + năm" để khỏi nhầm. Không bao giờ hiển thị ngày ngắn
  mà không có cách nào biết năm khi ngữ cảnh không rõ năm.

## 3. Giờ (time) — VI 24 giờ, EN 12 giờ AM/PM

Giờ chụp lưu dạng `HH:MM` 24 giờ (`shootTime`, ví dụ `08:00`). Hiển thị thì
đổi theo ngôn ngữ. **Không lưu lại dạng 12 giờ.**

| Giờ lưu | Tiếng Việt (24h) | English (12h) | Ghi chú |
|---|---|---|---|
| `00:05` | `00:05` | `12:05 AM` | Nửa đêm — EN là 12, không phải 0 |
| `06:00` | `06:00` | `6:00 AM` | Giờ chụp mặc định khi job không có giờ |
| `08:00` | `08:00` | `8:00 AM` | Giờ chụp ví dụ xuyên suốt file này |
| `09:00` | `09:00` | `9:00 AM` | Giờ phát nhắc hạn giao / nhắc job kẹt |
| `12:00` | `12:00` | `12:00 PM` | Trưa — EN là 12 PM, không phải 0 PM |
| `14:30` | `14:30` | `2:30 PM` | Chiều |
| `20:00` | `20:00` | `8:00 PM` | Giờ phát nhắc sao lưu |
| `23:59` | `23:59` | `11:59 PM` | Cuối ngày |

- API VI: `toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })`.
- API EN: `toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Ho_Chi_Minh' })`.
- ⚠️ **Lỗi hiện tại:** code hiển thị `shootTime` nguyên dạng `HH:MM`
  (`' lúc ' + j.shootTime`, dòng 1312, 1551, 1556) — ở chế độ EN vẫn hiện
  `lúc 08:00` thay vì `at 8:00 AM`, và từ nối `lúc` cũng chưa dịch. Phải
  thêm hàm `fmtTime(hhmm)` theo bảng trên + chuỗi nối `lúc` / `at`.
- Nhập giờ: `<input type="time">` của iOS luôn nhập/xuất `HH:MM` 24 giờ
  bất kể ngôn ngữ hiển thị — không đổi kiểu input, chỉ đổi cách hiển thị
  sau khi lưu.
- Không dùng `SA` / `CH` trong tiếng Việt (đầu ra `Intl` cho `vi-VN` với
  `hour12: true` là `8:30 SA` — app v1 không dùng dạng này; VI luôn 24 giờ).
- Giây: không hiển thị giây ở bất cứ đâu trong app. Nhắc lịch, `.ics`,
  Google Lịch có thể lưu giây `00` ở tầng dữ liệu, nhưng giao diện chỉ
  hiện giờ:phút.

### 3.1 Ngày + giờ kết hợp (khi nói một buổi chụp)

| Ngữ cảnh | Tiếng Việt | English |
|---|---|---|
| Chi tiết job | `Thứ Bảy, 21 tháng 11, 2026 lúc 08:00` | `Saturday, November 21, 2026 at 8:00 AM` |
| Danh sách job | `Thứ Bảy, 21/11 · 08:00` | `Saturday, 11/21 · 8:00 AM` |
| Nhắc trước buổi chụp (body) | `Mai Anh & Tuấn Kiệt — Wedding lúc 08:00, tại Đà Lạt` | `Mai Anh & Tuan Kiet — Wedding at 8:00 AM, in Da Lat` |
| Cả ngày (không có giờ) | `Thứ Bảy, 21/11 · cả ngày` | `Saturday, 11/21 · all day` |

- Mẫu nối: VI `{date} lúc {time}` · EN `{date} at {time}`. Dấu `·` phân
  cách ngày/giờ trong danh sách giữ nguyên cả hai ngôn ngữ.
- "Cả ngày" / "all day": dùng khi job có ngày mà không có giờ (xem dòng
  3120 trong code: `' · cả ngày'` — hiện cứng tiếng Việt, cần thêm chuỗi
  EN `all day`).

## 4. Thứ trong tuần (weekday)

| Thứ | VI dài | VI ngắn | EN dài | EN ngắn |
|---|---|---|---|---|
| Chủ nhật | Chủ Nhật | CN | Sunday | Sun |
| Thứ 2 | Thứ Hai | T2 | Monday | Mon |
| Thứ 3 | Thứ Ba | T3 | Tuesday | Tue |
| Thứ 4 | Thứ Tư | T4 | Wednesday | Wed |
| Thứ 5 | Thứ Năm | T5 | Thursday | Thu |
| Thứ 6 | Thứ Sáu | T6 | Friday | Fri |
| Thứ 7 | Thứ Bảy | T7 | Saturday | Sat |

- Dài: `toLocaleDateString(locale, { weekday: 'long' })`. Ngắn:
  `{ weekday: 'short' }` — VI cho ra `Thứ 7` (dạng dài hơn `T7`); nếu cần
  đúng `T2`…`T7` / `CN` thì dùng bảng tra cứu ở trên, không dùng đầu ra
  `short` của `Intl` cho VI.
- ⚠️ **Lỗi hiện tại:** `fmtRel()` (dòng 985) tra thứ bằng mảng cứng tiếng
  Việt `['CN','T2','T3','T4','T5','T6','T7']` — ở chế độ EN vẫn hiện
  `T7, 21/11` thay vì `Sat, 11/21`. Phải đổi sang mảng theo locale:
  VI `['CN','T2','T3','T4','T5','T6','T7']`, EN
  `['Sun','Mon','Tue','Wed','Thu','Fri','Sat']`, và đảo thứ tự ngày/tháng
  theo §2.
- Tuần bắt đầu từ thứ Hai trong cách đếm "tuần này" của báo cáo (theo thói
  quen Việt Nam), không phải Chủ nhật kiểu Mỹ. Báo cáo tuần: VI
  `Tuần 16–22/11` · EN `Week of Nov 16–22` (ghi rõ khoảng ngày để khỏi
  nhầm do khác quy ước đầu tuần).
- Đầu ra `Intl` cho `vi-VN` viết `Chủ Nhật` / `Thứ Hai` (có dấu, viết hoa
  chữ đầu mỗi từ) — giữ nguyên, không tự viết lại thành `Chủ nhật`.

## 5. Ngày tương đối (relative date) — Hôm nay / Ngày mai / Hôm qua

Dùng ở: tiêu đề nhóm sổ tiền, màn hình Hôm nay, chat trợ lý, nhắc lịch.
Đã có trong code: `fmtRel()` (dòng 981) và `fmtHeaderDate()` (dòng 987)
dùng `dayDiff()` (dòng 980, chênh lệch ngày theo lịch địa phương).

| dayDiff | Tiếng Việt | English | Ví dụ (hôm nay = Thứ Sáu, 20/11/2026) |
|---|---|---|---|
| `0` | Hôm nay | Today | Job chụp hôm nay |
| `+1` | Ngày mai | Tomorrow | Job chụp 21/11/2026 |
| `−1` | Hôm qua | Yesterday | Job chụp 19/11/2026 |
| `+2`…`+6` | `T7, 21/11` (thứ ngắn + ngày ngắn) | `Sat, 11/21` | Job chụp 21–26/11/2026 — xem lỗi §4 |
| `−2` trở xuống | `T5, 19/11` (thứ ngắn + ngày ngắn) | `Thu, 11/19` | Job đã qua |
| `+7` trở lên | Ngày đầy đủ §1 | Ngày đầy đủ §1 | Job xa: `Thứ Bảy, 28 tháng 11, 2026` / `Saturday, November 28, 2026` |

- Quy tắc: chỉ dùng từ tương đối cho −1 / 0 / +1. Từ +2 ngày trở đi dùng
  thứ + ngày ngắn; từ +7 ngày trở đi dùng ngày đầy đủ có năm (để phân biệt
  năm sau). Không dùng "3 ngày nữa" / "in 3 days" trong danh sách job —
  dài, khó quét nhanh; chỉ dùng trong câu văn của trợ lý chat khi phù hợp
  (VI `sau 3 ngày nữa`, EN `in 3 days`).
- ⚠️ `fmtRel()` hiện không có nhánh +7 ngày trở lên (rơi về thứ + ngày
  ngắn, thiếu năm) — khi nối i18n thì thêm nhánh ngày đầy đủ như bảng trên.
- "Hôm nay" trong tiêu đề nhóm sổ tiền viết hoa chữ đầu khi đứng đầu câu
  (`Hôm nay` / `Today`); trong câu thì viết thường theo đúng chính tả từng
  ngôn ngữ.

## 6. Nhắc lịch (reminders) — trước 12 giờ / 1 ngày

Hành vi nhắc đã chốt trong `NOTIFICATIONS.md` (4 loại nhắc, local
notification, không server). File này chỉ chốt **cách tính giờ phát và
cách viết ngày/giờ trong nội dung nhắc**. Mọi ví dụ dưới đây lấy job neo:
**Wedding — Mai Anh & Tuấn Kiệt, chụp Thứ Bảy, 21/11/2026 lúc 08:00,
tại Đà Lạt, hạn giao ảnh Thứ Bảy, 28/11/2026.**

### 6.1 Nhắc trước buổi chụp — mặc định 12 tiếng, chọn 1 / 12 / 24 giờ

Công thức: `giờ phát = giờ chụp − remindBeforeShoot`. Job không có giờ
chụp thì mặc định 08:00; không có ngày chụp thì không đặt nhắc.

| Lựa chọn (Cài đặt → Nhắc nhở) | Giờ phát (job neo 21/11 08:00) | Tiêu đề VI | Tiêu đề EN | Body (giờ trong body) |
|---|---|---|---|---|
| 1 giờ (`60` phút) | Thứ Bảy, 21/11/2026 lúc **07:00** | Sắp tới giờ chụp 📷 | Your shoot starts soon 📷 | VI `… lúc 08:00, tại Đà Lạt` · EN `… at 8:00 AM, in Da Lat` |
| 12 giờ (`720` phút, mặc định) | Thứ Sáu, 20/11/2026 lúc **20:00** | Hôm nay có lịch chụp 📷 | You have a shoot today 📷 | như trên |
| 24 giờ (`1440` phút) | Thứ Sáu, 20/11/2026 lúc **08:00** | Mai có lịch chụp 📷 | You have a shoot tomorrow 📷 | như trên |

- ⚠️ Lưu ý khi nhắc 12 giờ: với job chụp sáng 08:00, nhắc 12 tiếng
  **rơi sang tối hôm trước (20:00)**. Tiêu đề phải theo **ngày chụp**,
  không theo ngày phát nhắc: nhắc phát tối 20/11 cho job chụp 21/11 thì
  tiêu đề là `Mai có lịch chụp` / `You have a shoot tomorrow`, không phải
  `Hôm nay có lịch chụp`. Quy tắc trong `NOTIFICATIONS.md` §2.1 ghi tiêu
  đề theo khoảng cách nhắc — khi code phải kiểm tra: nếu ngày chụp là
  ngày mai so với lúc phát nhắc thì dùng tiêu đề "Mai/Tomorrow" bất kể
  lựa chọn 12 giờ hay 24 giờ.
- Body nhắc (đầy đủ, cả hai ngôn ngữ):
  - VI: `Mai Anh & Tuấn Kiệt — Wedding lúc 08:00, tại Đà Lạt`
  - EN: `Mai Anh & Tuan Kiet — Wedding at 8:00 AM, in Da Lat`
- Nếu nhắc phát sau nửa đêm cùng ngày chụp (ví dụ job 14:30, nhắc 12 giờ
  phát 02:30 cùng ngày): tiêu đề `Hôm nay có lịch chụp` / `You have a
  shoot today`. Không đặt nhắc phát lúc 02:30 sáng — xem "vấn đề còn tồn
  tại" ở cuối file (chưa có quy tắc dời giờ nhắc đêm khuya).
- Chỉ đặt nhắc trong tương lai (`giờ phát > bây giờ`); quá giờ thì bỏ qua,
  không bù.

### 6.2 Nhắc hạn giao ảnh — trước 1 ngày, phát lúc 09:00

- Công thức: `09:00 ngày (deadline − 1 ngày)`. Job neo: hạn giao
  28/11/2026 → nhắc phát **Thứ Sáu, 27/11/2026 lúc 09:00**.
- Tiêu đề: VI `Sắp tới hạn giao ảnh` · EN `Photo delivery due soon`.
- Body: VI `Mai Anh & Tuấn Kiệt — hạn giao 28/11` · EN
  `Mai Anh & Tuan Kiet — delivery due 11/28`.
- Body dùng ngày ngắn (§2), không dùng ngày đầy đủ — nhắc chỉ cần biết
  ngày nào, không cần thứ/năm.
- Chỉ đặt khi job có `deadline` và chưa ở bước `Đã giao` / `Xong` / Huỷ.
  Sang bước `Đã giao` thì hủy nhắc.

### 6.3 Nhắc job kẹt — sáng hôm sau 09:00 (1 nhắc tổng hợp)

- Điều kiện: job nằm yên ở cùng 1 bước quá 7 ngày, chưa `Xong` / Huỷ.
  Quét mỗi lần mở app; đặt 1 nhắc duy nhất cho **09:00 sáng hôm sau**.
- Ví dụ: mở app Thứ Sáu, 20/11/2026, thấy job của Lan Anh kẹt ở bước
  Hậu kỳ đã 9 ngày → nhắc phát **Thứ Bảy, 21/11/2026 lúc 09:00**.
- Tiêu đề: VI `Có job đang kẹt ⏳` · EN `A job is stuck ⏳`.
- Body: VI `Lan Anh kẹt ở bước Hậu kỳ đã 9 ngày` · EN
  `Lan Anh has been stuck at Post-production for 9 days`.
  - Số ngày: VI `đã {N} ngày` · EN `for {N} days` (`1 day` khi N = 1 —
    xem `PLURALS.md`, không viết `1 days`).
  - Nhiều job kẹt: VI `, và {M} job khác` · EN `, and {M} more jobs`.
- Tối đa 1 nhắc/ngày; hôm sau mở app mà job vẫn kẹt thì đặt lại cho ngày kế.

### 6.4 Nhắc sao lưu — 20:00 tối hôm đó (khi quá 7 ngày chưa sao lưu)

- Ví dụ: lần sao lưu gần nhất 12/11/2026; mở app 20/11/2026 thấy đã quá
  7 ngày → đặt 1 nhắc cho **20:00 tối 20/11/2026**.
- Tiêu đề: VI `Chưa sao lưu 7 ngày rồi 💾` · EN `No backup for 7 days 💾`.
- Body: VI `Sao lưu ngay để mất máy vẫn còn job và sổ tiền.` · EN
  `Back up now so you don't lose your jobs and money if you lose your phone.`
- "7 ngày" trong tiêu đề là số ngày thực tế đã trôi qua (8, 10, 30… đều
  hiện số thật, không ghi cứng `7 ngày` khi đã quá lâu — ví dụ quá 10 ngày
  thì tiêu đề VI `Chưa sao lưu 10 ngày rồi`).

### 6.5 Lựa chọn nhắc trong Cài đặt (chuỗi cần thêm)

| Key (đề xuất) | Tiếng Việt | English |
|---|---|---|
| `remind.title` | Nhắc nhở | Reminders |
| `remind.beforeShoot` | Nhắc trước buổi chụp | Remind before shoot |
| `remind.1h` | 1 giờ trước | 1 hour before |
| `remind.12h` | 12 giờ trước | 12 hours before |
| `remind.24h` | 24 giờ trước | 24 hours before |
| `remind.deadline` | Nhắc hạn giao ảnh | Delivery deadline reminder |
| `remind.deadlineAt` | 1 ngày trước, lúc 09:00 | 1 day before, at 9:00 AM |
| `remind.stuck` | Nhắc job kẹt | Stuck job reminder |
| `remind.backup` | Nhắc sao lưu | Backup reminder |

- Các key trên chưa có trong `I18N-STRINGS.md` (80 chuỗi) — bổ sung vào
  bảng chuỗi khi nối i18n, cùng với 7 chuỗi MỚI đã liệt kê trong file đó.
- `1 giờ trước` / `1 hour before`: số ít — EN dùng `hour`, không dùng
  `hours` (xem `PLURALS.md`).

## 7. Múi giờ Asia/Ho_Chi_Minh

| Vấn đề | Quyết định v1 |
|---|---|
| Múi giờ chuẩn của app | `Asia/Ho_Chi_Minh` (UTC+07:00). Mọi ngày/giờ của job đều hiểu theo múi giờ này, dù máy đang ở múi giờ nào. |
| Việt Nam có đổi giờ DST không | Không. UTC+07:00 quanh năm — không cần xử lý giờ mùa hè/mùa đông cho job trong nước. |
| Hiển thị | Mọi `toLocaleDateString` / `toLocaleTimeString` cho ngày/giờ job đều truyền `timeZone: 'Asia/Ho_Chi_Minh'` tường minh. |
| Lưu trữ | Ngày `YYYY-MM-DD` + giờ `HH:MM` (giờ địa phương Việt Nam lúc tạo job). Không lưu UTC, không lưu offset. |
| Lấy múi giờ máy | `tzName()` (dòng 3489): `Intl.DateTimeFormat().resolvedOptions().timeZone`, fallback `'Asia/Ho_Chi_Minh'`. Chỉ dùng khi ghi vào Google Lịch (xem dưới). |
| Chụp ở nước ngoài / đổi múi giờ | Giờ nhắc tính theo giờ địa phương của máy tại thời điểm đặt nhắc (giới hạn đã ghi trong `NOTIFICATIONS.md` §5). Đi chụp xa, đổi múi giờ thì mở app lại để đặt lại lịch nhắc. V1 không có chọn múi giờ theo job. |
| `.ics` xuất ra | `DTSTART`/`DTEND` hiện là giờ địa phương "trôi" (floating, không `TZID`, dòng 1315–1327) — Lịch iPhone hiểu là giờ của máy nhập file. Giữ nguyên ở v1; không tự thêm `TZID:Asia/Ho_Chi_Minh` nếu chưa kiểm chứng Lịch iPhone đọc đúng (ghi vào checklist QA §10). |
| Ghi vào Google Lịch | Gửi `dateTime` + `timeZone: tzName()` (dòng 3506–3508). Nếu máy đang ở Việt Nam thì `tzName()` = `Asia/Ho_Chi_Minh`, khớp với giờ job. Nếu máy đang ở múi giờ khác, Google sẽ hiển thị giờ đó theo múi giờ đã gửi — đây là hành vi đúng của API, không phải lỗi. |
| Báo cáo cuối ngày | Dòng tiêu đề báo cáo (dòng 1982) dùng `new Date()` = giờ máy. Khi chạy trên máy ở Việt Nam thì đúng; khi máy ở múi giờ khác, "cuối ngày" tính theo giờ máy, không theo giờ Việt Nam — chấp nhận ở v1, ghi nhận ở §9. |
| "Hôm nay" là ngày nào | Ngày theo lịch `Asia/Ho_Chi_Minh` tại thời điểm mở app. Máy test ở UTC 00:30 ngày 20/11 thì ở Việt Nam đã là 07:30 ngày 20/11 — cùng ngày nên không lệch; nhưng máy ở UTC 18:00 ngày 19/11 thì Việt Nam đã sang 01:00 ngày 20/11 — `dstr(0)` (dòng 807) dùng giờ máy sẽ cho ngày 19/11, sai 1 ngày. Đây là lý do §0 bắt buộc truyền `timeZone` khi format, và là mục QA §10. |

## 8. Nơi dùng trong app — đối chiếu code hiện tại

| Vị trí | Hàm / dòng | Hiện trạng | Theo file này |
|---|---|---|---|
| Dòng ngày màn hình Hôm nay | `#dateLine`, dòng 2282 | `toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })` — **cứng `vi-VN`, bỏ qua locale** | §1 dạng không năm: VI `Thứ Sáu, 20 tháng 11` · EN `Friday, November 20` (truyền locale + `timeZone`) |
| Ngày trong danh sách job | `fmtDate()`, dòng 975 | Đúng cả 2 locale, nhưng thiếu năm | Giữ cho danh sách; thêm dạng đầy đủ §1 cho chi tiết job |
| Ngày tương đối | `fmtRel()`, dòng 981 | Đúng logic, nhưng mảng thứ cứng VI (§4) | Sửa mảng thứ theo locale + thêm nhánh +7 ngày (§5) |
| Tiêu đề nhóm sổ tiền | `fmtHeaderDate()`, dòng 987 | Đúng cả 2 locale | Giữ; thêm nhánh +7 ngày (§5) |
| Tiêu đề tháng sổ tiền | dòng 1791 | Nối chuỗi cứng `'Tháng …'` (§2) | Đổi sang `{ month: 'long', year: 'numeric' }` |
| Giờ chụp trong câu văn | dòng 1312, 1551, 1556 | Hiện `HH:MM` thô + từ `lúc` cứng VI | Thêm `fmtTime()` §3 + chuỗi `lúc` / `at` |
| "Cả ngày" | dòng 3120 | Cứng `' · cả ngày'` | Thêm chuỗi EN `all day` (§3.1) |
| Chào theo buổi | dòng 1202, 1283 | `getHours()`: < 11 sáng, < 18 chiều, còn lại tối | Giữ mốc giờ; chuỗi chào theo buổi cần bản EN (xem `I18N-STRINGS.md` — chưa có trong 80 chuỗi, bổ sung khi nối i18n) |
| Báo cáo cuối ngày | dòng 1982 | `toLocaleDateString('vi-VN', { …, year: 'numeric' })` — **cứng `vi-VN`** | Truyền locale + `timeZone` (§1, §7) |
| Xuất `.ics` | `icsDate()`, dòng 1315 | Giờ địa phương trôi, không `TZID` | Giữ ở v1; kiểm chứng §10 |
| Ghi Google Lịch | dòng 3506–3508 | `timeZone: tzName()` | Giữ; khớp §7 |
| Nhắc chụp / hạn giao | `NOTIFICATIONS.md` §2.1–2.2 | Mặc định bridge 60 phút (lệch thiết kế 12 tiếng) | Giờ phát + câu chữ theo §6.1–6.2; đổi mặc định bridge sang 720 phút |
| Nhắc job kẹt / sao lưu | `NOTIFICATIONS.md` §2.3–2.4 | Chưa có code | Giờ phát + câu chữ theo §6.3–6.4 |

## 9. Mẫu code tham khảo (chưa áp dụng — để agent làm app dùng)

```js
// Chỉ dùng Intl, không tự nối chuỗi ngày/tháng.
function fmtFullDate(s){ // §1 — chi tiết job, hạn giao
  if(!s) return tr('no_date');
  return parseD(s).toLocaleDateString(loc()==='en'?'en-US':'vi-VN',
    {weekday:'long', day:'numeric', month:'long', year:'numeric',
     timeZone:'Asia/Ho_Chi_Minh'});
}
function fmtShortDate(s){ // §2 — danh sách, có năm khi cần
  if(!s) return tr('no_date');
  return parseD(s).toLocaleDateString(loc()==='en'?'en-US':'vi-VN',
    {day:'2-digit', month:'2-digit', year:'numeric',
     timeZone:'Asia/Ho_Chi_Minh'});
}
function fmtTime(hhmm){ // §3 — 'HH:MM' -> VI 24h / EN 12h AM-PM
  if(!hhmm) return '';
  var p = hhmm.split(':'), d = new Date(2026, 0, 1, +p[0], +p[1]);
  return loc()==='en'
    ? d.toLocaleTimeString('en-US',
        {hour:'numeric', minute:'2-digit', hour12:true})
    : d.toLocaleTimeString('vi-VN',
        {hour:'2-digit', minute:'2-digit', hour12:false});
  // Lưu ý: chỉ lấy giờ:phút từ hhmm nên không cần timeZone ở đây;
  // ngày giả 01/01/2026 chỉ là giá đỡ, không hiển thị.
}
function fmtDateTime(s, hhmm){ // §3.1
  if(!s) return tr('no_date');
  var date = fmtFullDate(s);
  return hhmm ? date + (loc()==='en' ? ' at ' : ' lúc ') + fmtTime(hhmm)
               : date + (loc()==='en' ? ' · all day' : ' · cả ngày');
}
```

## 10. Checklist kiểm chứng (QA — chạy trên iPhone thật)

- [ ] Đổi ngôn ngữ sang EN: màn hình Hôm nay hiện `Friday, November 20`
  (không còn tiếng Việt ở dòng ngày — lỗi dòng 2282 đã sửa).
- [ ] Danh sách job EN: `Saturday, 11/21 · 8:00 AM` (tháng trước ngày sau,
  12 giờ AM/PM); VI: `Thứ Bảy, 21/11 · 08:00`.
- [ ] Chi tiết job EN: `Saturday, November 21, 2026 at 8:00 AM` (có năm);
  job 21/11/2026 và 21/11/2027 hiển thị khác nhau.
- [ ] Sổ tiền EN: tiêu đề tháng `November 2026`; nhóm Hôm qua / Hôm nay
  hiện `Yesterday` / `Today`.
- [ ] Job lúc `00:05` hiện EN `12:05 AM`; job lúc `12:00` hiện EN `12:00 PM`.
- [ ] Job không có giờ: EN hiện `all day`, VI hiện `cả ngày`.
- [ ] Nhắc 12 giờ cho job 21/11 08:00 phát tối 20/11 lúc 20:00 với tiêu đề
  `Mai có lịch chụp` / `You have a shoot tomorrow` (không phải "Hôm nay").
- [ ] Nhắc hạn giao cho deadline 28/11 phát 27/11 lúc 09:00, body ghi
  `hạn giao 28/11` / `delivery due 11/28`.
- [ ] Đổi múi giờ máy sang múi giờ khác (ví dụ UTC), mở app lại: ngày Hôm
  nay và giờ nhắc vẫn theo lịch Việt Nam sau khi đặt lại nhắc.
- [ ] Nhập file `.ics` xuất từ app vào Lịch iPhone: giờ chụp hiện đúng
  08:00 (kiểm chứng `TZID` có cần thêm hay không — xem §7).
- [ ] Báo cáo cuối ngày EN: tiêu đề `DAILY REPORT — Saturday, November 21, 2026`
  (không còn cứng `vi-VN` như dòng 1982).

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Chốt định dạng ngày/giờ VI/EN cho FotoBro iOS v1: ngày đầy
   đủ, ngày ngắn, giờ 12h/24h, thứ trong tuần, nhắc lịch (trước 12h/1 ngày),
   múi giờ `Asia/Ho_Chi_Minh`, ví dụ cụ thể từng trường hợp.
2. **Đã thực hiện:** Chỉ đọc `I18N-STRINGS.md` và `www/index.html`
   (đối chiếu `NOTIFICATIONS.md` cho phần nhắc lịch), kiểm chứng mọi chuỗi
   ngày/giờ mẫu bằng `Intl.DateTimeFormat` với ngày neo Thứ Bảy, 21/11/2026.
   Viết 1 file mới duy nhất: `~/workspace/fotobro-ios-v1/batch-i18n/DATE-TIME.md`.
   Không sửa bất kỳ file nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** File đã viết, đọc được. Mọi ví dụ đều lấy từ đầu ra
   `Intl` thật (ví dụ VI `Thứ Bảy, 21 tháng 11, 2026` · EN `Saturday,
   November 21, 2026`; EN `8:00 AM` / `2:30 PM` / `12:05 AM` / `12:00 PM`;
   nhắc 12 giờ cho job 21/11 08:00 phát 20/11 20:00; nhắc hạn giao cho
   deadline 28/11 phát 27/11 09:00). Đối chiếu code thật: `fmtDate()` dòng
   975, `fmtRel()` dòng 981, `fmtHeaderDate()` dòng 987, `tzName()` dòng
   3489, `icsDate()` dòng 1315.
4. **Vấn đề còn tồn tại:** 6 lỗi hiển thị ngày/giờ trong code hiện tại cần
   agent làm app sửa khi nối i18n: (a) dòng 2282 và 1982 cứng `vi-VN`;
   (b) `fmtRel()` mảng thứ cứng VI; (c) giờ chụp hiện `HH:MM` thô + từ
   `lúc` cứng VI; (d) tiêu đề tháng sổ tiền (dòng 1791) nối chuỗi cứng
   `Tháng …`; (e) `fmtDate()` thiếu năm; (f) `.ics` không có `TZID` (chưa
   rõ có cần thêm không). Chưa có quy tắc dời giờ nhắc rơi vào đêm khuya
   (ví dụ nhắc 12 giờ phát lúc 02:30 sáng). 9 key nhắc lịch §6.5 chưa có
   trong bảng 80 chuỗi của `I18N-STRINGS.md`.
5. **Điều kiện chuyển bước:** Agent làm app nối file này + `I18N-STRINGS.md`
   + `NOTIFICATIONS.md` vào code theo §8–§9, rồi chạy checklist QA §10 trên
   iPhone thật (đặc biệt mục đổi múi giờ máy và nhập `.ics`). Việt không cần
   quyết gì thêm — VI 24 giờ / EN 12 giờ AM-PM và múi giờ
   `Asia/Ho_Chi_Minh` đã chốt trong file này.
6. **Bước tiếp theo:** Sau khi code xong, QA chạy checklist §10; bổ sung 9
   key nhắc lịch §6.5 và chuỗi chào theo buổi (EN) vào bảng chuỗi; quyết
   định có thêm `TZID:Asia/Ho_Chi_Minh` vào `.ics` sau khi kiểm chứng trên
   Lịch iPhone thật.
7. **Trạng thái:** Tài liệu xong, chưa phải code chạy được. Không sửa file
   nào khác ngoài file tài liệu mới, không tạo tài khoản, không push GitHub.
