# FotoBro iOS v1 — Quy tắc hiển thị tiền VND / USD (CURRENCY-FORMAT)

- File: `~/workspace/fotobro-ios-v1/batch-i18n/CURRENCY-FORMAT.md` (chỉ tài liệu, không sửa code)
- Kiểm tra ngày 20/11/2026 đối chiếu với `www/index.html` (341.754 byte) và `~/workspace/fotobro-ios-v1/I18N-STRINGS.md`
- Nguồn chuẩn trong code: hàm `fmt(n)` ở dòng 964 của `www/index.html` — mọi quy tắc dưới đây giữ nguyên theo hàm này, không đặt quy tắc mới trái code
- Phạm vi: chỉ v1. Ngôn ngữ (`locale`: `vi` / `en`) và tiền tệ (`currency`: `VND` / `USD`) là **hai lựa chọn độc lập** trong Cài đặt — người dùng có thể chọn `vi` + `USD` hoặc `en` + `VND`. Định dạng đầy đủ (`fmt`) đi theo **tiền tệ**, không đi theo ngôn ngữ.

## 0. Nguyên tắc vàng — chỉ đổi hiển thị, KHÔNG quy đổi tỷ giá

- Đổi `VND` ↔ `USD` trong Cài đặt **chỉ đổi ký hiệu và dấu phân cách**, con số gốc lưu trong app **không đổi một đồng nào**.
- App **không có tỷ giá, không nhân/chia, không gọi API tỷ giá**. Số tiền lưu là số nguyên (xem §4); chuyển sang USD không chia cho ~25.000.
- Ví dụ gây hiểu lầm nếu không nhớ nguyên tắc này: một job giá lưu là `15.000.000` — để VND hiện `15.000.000₫`, chuyển sang USD hiện **`$15,000,000`** (cùng 15 triệu, chỉ đổi ký hiệu/dấu), **không phải** `$600`. Người dùng phải tự hiểu con số USD hiển thị là con số gốc, chưa quy đổi.
- Câu ghi trong code (Cài đặt, dòng 2365) phải giữ nguyên ý khi dịch: “Chỉ đổi cách hiển thị ngày và tiền (nhãn chính). Số tiền không quy đổi tỷ giá — tiền USD hiển thị cùng con số gốc.”
- Mã tiền tệ lưu trong cấu hình chỉ nhận `'VND'` / `'USD'` (mặc định `'VND'`); giá trị khác tự rơi về `'VND'` (dòng 839). Không dùng mã khác (EUR, JPY…) ở v1.

## 1. Ký hiệu — dùng ký hiệu nào, ở đâu

| Dạng | VND | USD | Ghi chú |
|---|---|---|---|
| Ký hiệu hiển thị đầy đủ | `₫` (U+20AB, đồng Việt Nam) | `$` (U+0024) | Đây là ký hiệu duy nhất gắn vào số tiền hiển thị |
| Mã tiền tệ (ISO) | `VND` | `USD` | Chỉ dùng ở nút chọn trong Cài đặt và trong dữ liệu/cấu hình, **không** gắn thêm vào sau số tiền đã có ký hiệu |
| Nút chọn trong Cài đặt | `VND (₫)` | `USD ($)` | Đúng dạng trong code (dòng 2364): mã trước, ký hiệu trong ngoặc sau |
| Ký hiệu **không** dùng | `đ`, `VNĐ`, `vnd`, `usd` | `US$`, `USD$` | Không viết `15.000.000đ` hay `15.000.000 VND` ở giao diện hiển thị; `đ` chỉ xuất hiện trong từ `đồng` ở dạng rút gọn (§3) |

### Vị trí ký hiệu (dạng đầy đủ — `fmt`)

| Tiền tệ | Vị trí | Công thức trong code (dòng 964) | Ví dụ |
|---|---|---|---|
| VND | **Sau** số, dính liền, không có khoảng trắng | `v.toLocaleString('vi-VN') + '₫'` | `15.000.000₫` |
| USD | **Trước** số, dính liền, không có khoảng trắng | `'$' + v.toLocaleString('en-US')` | `$15,000,000` |

- Không viết `$ 15,000,000`, `15.000.000 ₫`, `₫15.000.000` hay `15,000,000$`.
- Dấu âm ở dạng đầy đủ: do `toLocaleString` tự thêm dấu trừ chuẩn của locale, ví dụ lỗ `−500.000₫` / `-$500,000` (dấu trừ hiển thị). Ở dạng rút gọn và danh sách lời/lỗ, code tự thêm tiền tố `+` / `−` (U+2212) trước số tuyệt đối — xem §3.

## 2. Dấu phân cách hàng nghìn và số thập phân (dạng đầy đủ)

| Tiền tệ | Dấu phân cách hàng nghìn | Dấu thập phân | Số chữ số thập phân hiển thị |
|---|---|---|---|
| VND | dấu chấm `.` (`vi-VN`) | — (không có) | **0** |
| USD | dấu phẩy `,` (`en-US`) | — (không có) | **0** |

- VND: nhóm 3 chữ số, phân cách bằng `.` — `2.500.000₫`, `15.000.000₫`, `1.234.567₫`.
- USD: nhóm 3 chữ số, phân cách bằng `,` — `$2,500,000`, `$15,000,000`, `$1,234,567`.
- **Không có phần thập phân ở dạng đầy đủ cho cả hai tiền tệ.** Đây là hành vi thật của code: `fmt` làm tròn số nguyên trước rồi mới định dạng, nên không bao giờ ra `$1,000.00` hay `1.000.000,00₫`.
- ⚠️ Lệch với tài liệu: `I18N-STRINGS.md` ghi “USD hiển thị `$1,000.00` (en-US)” — **sai so với code**. Chuẩn theo code là `$1,000` (0 thập phân). Khi nối i18n, sửa dòng đó trong `I18N-STRINGS.md` theo file này, không sửa code để ép ra 2 thập phân.
- Số dưới 1.000 không có dấu phân cách: `500₫` / `$500`, `0₫` / `$0`.
- Số 0: hiển thị `0₫` (VND) / `$0` (USD). Không hiển thị `—`, trống, hay `Chưa có` thay cho số 0 khi số tiền đã được ghi là 0; chỉ dùng chữ `Chưa chốt` / `Chưa đặt` khi giá trị chưa được nhập (giá gói mặc định `0` = chưa đặt — xem §5).

## 3. Dạng rút gọn — chỉ dùng ở ô nhỏ, không dùng thay dạng đầy đủ

Có 2 hàm rút gọn trong code; cả hai **không gắn ký hiệu `₫`/`$`**, chỉ gắn đơn vị chữ. Chỉ dùng ở nơi hẹp (ô thống kê, hàng lời/lỗ từng job, khấu hao/tháng). Không dùng dạng rút gọn trong chi tiết job, báo giá, tin nhắn mẫu, hay màn hình xác nhận thu tiền.

### 3a. `fmtShort` / `fmtParts` (dòng 965–972) — ô thống kê Tiền bạc, lời tháng

Đơn vị và dấu thập phân đi theo **ngôn ngữ** (`loc()`), không theo tiền tệ:

| Khoảng giá trị tuyệt đối | Tiếng Việt (`vi`) | English (`en`) | Số thập phân |
|---|---|---|---|
| ≥ 999.500 | `x,x triệu` (dấu phẩy thập phân) | `x.x M` (dấu chấm thập phân) | 1 chữ số |
| 1.000 – 999.499 | `n nghìn` | `n k` | 0 chữ số (làm tròn nguyên nghìn) |
| < 1.000 | `n đồng` | `n` (không đơn vị) | 0 chữ số |

Ví dụ (cùng một con số, chỉ khác ngôn ngữ):

| Số gốc | `vi` | `en` |
|---|---|---|
| 15.000.000 | `15 triệu` | `15 M` |
| 2.500.000 | `2,5 triệu` | `2.5 M` |
| 1.500.000 | `1,5 triệu` | `1.5 M` |
| 999.500 | `1 triệu` | `1 M` |
| 999.499 | `999 nghìn` | `999 k` |
| 25.000 | `25 nghìn` | `25 k` |
| 750 | `750 đồng` | `750` |

- Ngưỡng là **999.500**, không phải 1.000.000: `999.500` đã lên `1 triệu`, `999.499` vẫn là `999 nghìn`.
- Số âm: thêm tiền tố `−` trước số (`−2,5 triệu`), số 0 không có dấu.
- Ở hàng lời/lỗ, code thêm `+` / `−` trước `fmtShort` của giá trị tuyệt đối: `+2,5 triệu` (lời), `−500 nghìn` (lỗ).

### 3b. `fmtTiny` (dòng 973) — hàng lời từng job, khấu hao/tháng

- Luôn theo kiểu Việt, **bất kể ngôn ngữ/tiền tệ đang chọn**: `≥ 1.000.000` → `x,x tr` (dấu phẩy thập phân, 1 chữ số); `≥ 1.000` → `n k` (làm tròn nguyên nghìn); `< 1.000` → số trần, không đơn vị, không ký hiệu.
- Ví dụ: `1.500.000` → `1,5tr`; `1.000.000` → `1tr`; `850.000` → `850k`; `2.500` → `3k` (làm tròn `2,5` lên `3`); `750` → `750`.
- Dùng kèm hậu tố `/tháng` cho khấu hao: `1,5tr/tháng`. Không tự đổi `tr` thành `M` khi chuyển ngôn ngữ sang `en` — đây là lệch đã biết của code (xem §7), tài liệu ghi đúng hành vi hiện tại, không bịa ra hành vi khác.

## 4. Làm tròn và lưu trữ — số nào được làm tròn, làm tròn tới đâu

- **Lưu trữ:** mọi số tiền nhập vào đều qua `moneyVal` (dòng 1064) — bỏ hết ký tự không phải chữ số, chỉ giữ số nguyên. App **không lưu phần thập phân / xu (cent)** cho cả VND lẫn USD. Nhập `1.234,56` hay `$1,234.56` đều chỉ giữ `123456` (sau khi bỏ dấu).
- **Hiển thị đầy đủ (`fmt`):** `Math.round(n)` — làm tròn tới **1 đồng / $1 gần nhất**, 0 thập phân. Ví dụ số tính toán ra `1.234.567,4` → `1.234.567₫`; `1.234.567,5` → `1.234.568₫`.
- **Cọc (`depositPct`, mặc định 40%):** làm tròn tới **10.000 gần nhất** ở 2 nơi — màn hình xác nhận xong job (dòng 1476, 3535) và máy tính giá (dòng 1960): `Math.round(tổng × % / 100 / 10000) × 10000`. Ví dụ tổng `15.000.000`, cọc 40% = `6.000.000` đúng chẵn; tổng `6.250.000`, cọc 40% = `2.500.000` đúng chẵn; tổng `6.260.000`, cọc 40% = `2.504.000` → làm tròn thành `2.500.000`. “Còn lại sau giao” = tổng − cọc đã làm tròn, không làm tròn lại lần nữa.
- **Khấu hao thiết bị/tháng:** `Math.round(giá mua / (số năm × 12))` (dòng 2555, `depMonthly`) — làm tròn tới 1 đồng/$1, hiển thị bằng `fmt` hoặc `fmtTiny` + `/tháng`.
- **Dạng rút gọn:** triệu/`M`/`tr` giữ 1 thập phân (làm tròn, ví dụ `1.550.000` → `1,6 triệu` / `1.6 M` / `1,6tr`); nghìn/`k` làm tròn nguyên nghìn, 0 thập phân (`2.500` → `3k` ở `fmtTiny`, `2 nghìn` ở `fmtParts` — hai hàm làm tròn khác nhau ở đúng ngưỡng `.5`, giữ nguyên theo code, không thống nhất bằng cách sửa code trong tài liệu này).

## 5. Ví dụ cụ thể theo từng loại

Tất cả ví dụ dưới đây dùng cùng một bộ số gốc minh hoạ (không phải giá mặc định — giá gói mặc định trong code là `0` = chưa đặt, người dùng tự điền trong Cài đặt → Bảng giá / Bảng giá film; `%` cọc mặc định 40%). Cột USD là **cùng con số gốc, chỉ đổi ký hiệu/dấu** (§0).

### 5a. Giá gói (Bảng giá, máy tính giá, form job)

| Loại | Số gốc (minh hoạ) | VND | USD |
|---|---|---|---|
| Portrait (Digital) | 2.500.000 | `2.500.000₫` | `$2,500,000` |
| Couple (Digital) | 4.000.000 | `4.000.000₫` | `$4,000,000` |
| Wedding (Digital) | 15.000.000 | `15.000.000₫` | `$15,000,000` |
| Lookbook (Digital) | 8.000.000 | `8.000.000₫` | `$8,000,000` |
| Event (Digital) | 5.000.000 | `5.000.000₫` | `$5,000,000` |
| Chưa đặt giá | 0 | `Chưa đặt giá` / ô trống (không hiện `0₫`) | `Not set` / blank |

- Trong ô nhập (Cài đặt, form job): chỉ hiện **chữ số đã nhóm, không kèm ký hiệu** — ví dụ ô giá hiện `6.000.000` (placeholder trong code), ô thêm giờ/album/retouch cũng vậy. Ký hiệu chỉ xuất hiện ở văn bản hiển thị/kết quả, không nằm trong ô nhập.
- Máy tính giá — dòng kết quả (đúng mẫu dòng 1961): `Tổng: 15.000.000₫` / `Cọc trước (40%): 6.000.000₫` / `Còn lại sau giao: 9.000.000₫`; bản USD: `Total: $15,000,000` / `Deposit (40%): $6,000,000` / `Balance after delivery: $9,000,000`.
- Giá film: cùng quy tắc, bảng riêng (Bảng giá film); gói nào chưa đặt giá film thì báo chữ, không hiện `0₫` làm giá.

### 5b. Cọc (Chốt cọc, máy tính giá, tin nhắn mẫu)

| Tình huống | Số gốc | VND | USD |
|---|---|---|---|
| Wedding 15.000.000, cọc 40% | 6.000.000 | `Cọc trước (40%): 6.000.000₫` | `Deposit (40%): $6,000,000` |
| Portrait 2.500.000, cọc 40% | 1.000.000 | `Cọc: 1.000.000₫` | `Deposit: $1,000,000` |
| Cọc lẻ cần làm tròn (tổng 6.260.000 × 40%) | 2.500.000 (đã làm tròn 10.000) | `Cọc: 2.500.000₫` | `Deposit: $2,500,000` |
| Chưa ghi cọc | 0 | `Chưa ghi cọc` (không hiện `0₫`) | `No deposit recorded` |

- Nhãn: `Cọc` / `Deposit` (chuỗi `jobs.deposit`, `I18N-STRINGS.md` #25). Không dùng từ `Đặt cọc` / `Tiền cọc` ở nơi khác làm lệch nhãn.

### 5c. Còn thiếu (chi tiết job, Hôm nay, nhắc thu nốt)

| Tình huống | Số gốc | VND | USD |
|---|---|---|---|
| Wedding 15.000.000, đã thu 6.000.000 | 9.000.000 | `Còn thiếu 9.000.000₫` (chữ đỏ) | `Balance due $9,000,000` |
| Portrait 2.500.000, đã thu 1.000.000 | 1.500.000 | `Còn thiếu 1.500.000₫` | `Balance due $1,500,000` |
| Đã thu đủ | 0 | `Đã thu đủ` (không hiện `0₫`) | `Paid in full` |
| Tổng khách còn thiếu (báo cáo) | 9.000.000 | `Khách còn thiếu tổng cộng 9.000.000₫` | `Clients owe $9,000,000 in total` |

- Nhãn: `Còn thiếu` / `Balance due` (chuỗi `jobs.owed`, `I18N-STRINGS.md` #27 — giữ theo code v1, không dùng `Còn nợ` của bản prototype).
- Màn hình xác nhận khi bấm Xong mà còn thiếu: `Vẫn còn thiếu tiền — Khách còn thiếu 9.000.000₫…`, nút `Thu nốt 9.000.000₫ trước`.

### 5d. Thu / chi (Sổ tiền, form ghi khoản, toast)

| Tình huống | Số gốc | VND | USD |
|---|---|---|---|
| Ghi thu — cọc Wedding | 6.000.000 | `+6.000.000₫` | `+$6,000,000` |
| Ghi thu — tiền sau giao ảnh | 9.000.000 | `+9.000.000₫` | `+$9,000,000` |
| Ghi chi — thuê đèn | 800.000 | `−800.000₫` | `-$800,000` |
| Ghi chi — quảng cáo | 500.000 | `−500.000₫` | `-$500,000` |
| Toast sau khi ghi | 6.000.000 | `Đã ghi khoản thu 6.000.000₫` | `Recorded income $6,000,000` |

- Dấu `+` cho thu (xanh), `−` (U+2212) cho chi; số tiền sau dấu vẫn dùng `fmt` đầy đủ. Không viết `Thu +6.000.000₫` thừa dấu khi nhãn đã nói rõ thu/chi — trong danh sách, tiền tố `+`/`−` là đủ.
- Ô nhập số tiền ghi khoản: chỉ chữ số đã nhóm, không ký hiệu trong ô; có hậu tố `₫` cố định bên ngoài ô trong code hiện tại (dòng 1735) — xem lệch đã biết ở §7.

### 5e. Báo cáo tháng (tab Tiền bạc, Trợ lý, tóm tắt)

| Hạng mục | Số gốc (minh hoạ tháng) | VND | USD |
|---|---|---|---|
| Thu tháng này | 21.000.000 | `Thu 21.000.000₫` | `Income $21,000,000` |
| Chi tháng này | 3.300.000 | `Chi 3.300.000₫` | `Expenses $3,300,000` |
| Lời tháng này | 17.700.000 | `Lời 17.700.000₫` | `Profit $17,700,000` |
| Lời tháng này (ô nhỏ) | 17.700.000 | `17,7 triệu` (`vi`) / `17.7 M` (`en`) | như cột `vi`/`en` — dạng rút gọn không gắn ký hiệu tiền tệ |
| Khách còn thiếu (ô nhỏ) | 9.000.000 | `9 triệu` / `9 M` | như trên |
| Khoản chi lớn nhất | 800.000 | `Thuê đèn — 800.000₫` | `Light rental — $800,000` |
| Khấu hao thiết bị/tháng | 1.500.000 | `Khấu hao thiết bị 1.500.000₫/tháng` | `Equipment depreciation $1,500,000/month` |
| Câu tóm tắt (Trợ lý) | — | `Tháng này thu 21.000.000₫, chi 3.300.000₫, lời 17.700.000₫.` | `This month: income $21,000,000, expenses $3,300,000, profit $17,700,000.` |
| Lời âm (lỗ) | −500.000 | `Lời −500.000₫` (chữ đỏ) / ô nhỏ `−500 nghìn` | `Profit -$500,000` / tile `−500 k` |

- Lời = thu − chi, tính trên số gốc rồi mới định dạng; không làm tròn từng khoản trước rồi mới cộng/trừ.
- Dạng đầy đủ dùng trong câu văn và chi tiết; dạng rút gọn (`fmtShort`) chỉ dùng trong 4 ô thống kê đầu tab Tiền bạc; dạng `fmtTiny` chỉ dùng trong hàng lời từng job.

## 6. Những gì KHÔNG đổi khi đổi tiền tệ / ngôn ngữ

- Số tiền đã lưu, % cọc (40% mặc định), số ngày giao ảnh, giá gói/film, khấu hao, tổng thu/chi/lời — tất cả giữ nguyên giá trị số.
- Thứ tự và tên 8 bước pipeline, tên 6 phòng ban (giữ tiếng Việt + chú thích Anh theo `I18N-STRINGS.md` §H), tên loại chụp — không đổi theo tiền tệ.
- Định dạng ngày vẫn đi theo ngôn ngữ, độc lập với tiền tệ.
- Không thêm chữ `VND`/`USD` vào cuối số tiền đã có `₫`/`$`; không thêm `₫` vào sau số USD và ngược lại.
- Không dùng dấu phân cách của ngôn ngữ để định dạng tiền đầy đủ: `en` + `VND` vẫn hiện `15.000.000₫` (dấu chấm), `vi` + `USD` vẫn hiện `$15,000,000` (dấu phẩy) — vì `fmt` chọn locale theo **tiền tệ**, không theo ngôn ngữ.

## 7. Lệch đã biết giữa code và quy tắc chuẩn (ghi để sửa code sau, không sửa trong tài liệu này)

1. `I18N-STRINGS.md` ghi USD là `$1,000.00` — sai so với `fmt` (thực tế `$1,000`, 0 thập phân). Sửa tài liệu đó theo §2, không sửa code.
2. Ô nhập tiền (giá job, giá trong Cài đặt, số tiền ghi khoản) luôn định dạng `vi-VN` (dấu `.`) kể cả khi đang chọn USD (dòng 1055, 1579, 1612, 2310, 2527) — người dùng USD nhập `1,000,000` sẽ bị `moneyVal` bỏ dấu phẩy và vẫn giữ đúng số, nhưng hiển thị trong ô không khớp quy tắc USD.
3. Hậu tố `₫` trong form ghi khoản (dòng 1735, `<span class="cur">₫</span>`) và số `0₫` cứng ở hàng lời bằng 0 (dòng 1805) không đổi theo USD — ở chế độ USD vẫn hiện `₫`.
4. `fmtTiny` luôn dùng `tr`/`k` kiểu Việt (dòng 973) kể cả khi ngôn ngữ là `en` — khác với `fmtParts` vốn đổi `triệu`→`M`, `nghìn`→`k` theo ngôn ngữ.
5. Cọc làm tròn 10.000 ở màn xác nhận xong job và máy tính giá (dòng 1476, 1960, 3535) nhưng **không** làm tròn ở một chỗ tính cọc khác (dòng 3272: `Math.round(price × % / 100)`) — cùng một khoản cọc có thể lệch nhau tối đa 5.000 giữa hai màn hình.
6. `fmtParts`/`fmtShort` đi theo ngôn ngữ còn `fmt` đi theo tiền tệ — cùng một màn hình có thể vừa hiện `$15,000,000` (đầy đủ) vừa hiện `15 triệu` (ô nhỏ) khi chọn `en` + `VND` hoặc `vi` + `USD`. Đây là hành vi hiện tại của code; tài liệu ghi đúng như vậy, việc có thống nhất theo một chiều hay không là quyết định sửa code sau, không thuộc file này.

## 8. Checklist kiểm tra nhanh (đối chiếu khi nối i18n / sửa code)

- [ ] Đổi sang USD: giá Wedding mẫu hiện `$15,000,000` (không phải `$15.000.000`, `$600`, hay `$15,000,000.00`).
- [ ] Đổi về VND: cùng job hiện `15.000.000₫`, con số gốc không đổi sau khi đổi qua lại 2 lần.
- [ ] Cọc 40% của 15.000.000 hiện `6.000.000₫` / `$6,000,000`; còn lại `9.000.000₫` / `$9,000,000`.
- [ ] Báo cáo tháng: thu/chi/lời đều dùng `fmt` đầy đủ trong câu văn; 4 ô nhỏ dùng dạng rút gọn theo ngôn ngữ.
- [ ] Số 0: `0₫` / `$0` ở nơi cần hiện số; `Chưa đặt giá` / `Đã thu đủ` ở nơi giá trị chưa có.
- [ ] Không có chỗ nào hiện đồng thời cả `₫` và `USD`, cả `$` và `VND`, hay `đ` thay cho `₫` ở dạng đầy đủ.
