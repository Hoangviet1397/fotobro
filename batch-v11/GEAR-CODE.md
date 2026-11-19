# FotoBro — Spec code checklist đồ nghề (v1.1)

> **Trạng thái: CHỈ LÀ SPEC, CHƯA CODE.** File này viết cho agent code v1.1.
> Không sửa code app, không đổi hành vi v1. Mọi dữ kiện "đã có trong v1" đều kiểm
> chứng từ `www/index.html` (đọc ngày 20/11/2026) và test jsdom
> `www/test-fotobro-v1.js` (chạy baseline: **101/103 đạt**, xem §9.1).
> Thiết kế gốc: `GEAR-CHECKLIST.md` (cùng thư mục gốc). File này là bản spec
> code chi tiết của thiết kế đó — agent code làm theo file này, không cần đọc
> lại thiết kế gốc trừ khi có mâu thuẫn (mâu thuẫn đã liệt kê ở §2.5).

## 1. Mô hình dữ liệu v1 — dùng lại 100%, chỉ thêm nội dung

### 1.1. Các điểm neo trong code v1 (dòng theo `www/index.html` hiện tại)

| Thành phần | Vị trí | Hành vi đã kiểm chứng |
|---|---|---|
| `CHECKLISTS` | dòng ~1626–1634 | 4 loại: Portrait (8), Couple (8), Wedding (9), Lookbook (8). Xem §3.1–3.4 cột "v1" |
| `listType(t)` | dòng ~1635 | `CHECKLISTS[t] ? t : 'Portrait'` — giữ nguyên, không sửa |
| `checkItems(t)` | dòng ~1636 | `CHECKLISTS[t].concat(cfg.checkExtra[t] || [])` — **đổi chữ ký thành `checkItems(t, job)`**, xem §5.1 |
| `checkDone` | dòng ~905, ~909, ~920 | Lưu trong `saveLocal()`, key `troLyXeo.v1`. Tick là object `{ '<tên món>': true }` |
| Tick theo job | `checkDone['job:<id>']` | Mỗi job có tick riêng; job mới tự có danh sách mới |
| Tick theo loại | `checkDone['type:<Loại>']` | Danh sách chung khi chưa chọn job cụ thể |
| `cfg.checkExtra[type]` | dòng ~819, ~848–850 | Món người dùng tự thêm/xoá cho từng loại; hiển thị sau món mẫu |
| `migrateChecks()` | dòng ~1642–1650 | Đổi tick cũ lưu theo số thứ tự sang lưu theo tên món; chạy đầu `renderChecklist()`. Không sửa |
| `checkContext()` | dòng ~1651–1660 | Tự chọn buổi chụp gần nhất (`upcomingShoots()`); `checkSel` = `'job:<id>'` hoặc `'type:<Loại>'` |
| `upcomingShoots()` | dòng ~1637–1641 | Job có `shootDate >= hôm nay` và `STAGES.indexOf(stage) <= 3` (tức tới bước "Đã chụp"), lấy tối đa 5, xếp theo ngày |
| `renderChecklist()` | dòng ~1661–1714 | Thanh tiến độ `nDone/tổng`, `checkCount` = `nDone + '/' + items.length`, đủ hết thì `celebrate('Đủ đồ rồi, diễn thôi!', 'party')` |
| Nút "Thêm món" | dòng ~1700–1711 | Chặn trùng bằng `checkItems(c.type).indexOf(v) >= 0` — sau khi đổi chữ ký phải truyền thêm `c.job` (xem §5.1) |
| Nút "Làm mới" | dòng ~1716–1721 | `delete checkDone[c.key]` — bỏ tick hết của job/loại đang xem |
| Xoá job | dòng ~1515 | `delete checkDone['job:' + id]` + reset `checkSel` nếu đang xem job đó — giữ nguyên |
| Reset toàn bộ | dòng ~2611 | Xoá mọi key `job:*` trong `checkDone` — giữ nguyên |
| `TYPES` | dòng ~782 | `['Portrait','Couple','Wedding','Lookbook','Event','Khác']` — **Event đã có trong TYPES** |
| `MEDIUMS` / `normMedium` | dòng ~783–784 | `['Digital','Film','Cả hai']`; giá trị lạ → `'Digital'` |
| `jobMedium(j)` | dòng ~785 | `normMedium(j.medium)` — dùng để nhận diện job Film/Cả hai |
| `priceFor(type, medium)` | dòng ~789–792 | Đã xử lý Film/Cả hai — không liên quan checklist, chỉ để biết `medium` đã là dữ liệu thật |
| Tab checklist (HTML) | dòng ~606–616 | **Không phải tab riêng**: là mục "Chuẩn bị đồ" trong view `jobs` (tab "Buổi chụp"), gồm `#checkTypeChips`, `#checkTitle`, `#checkCount`, `#checkBar`, `#checkList`, `#checkHint`, `#checkReset` |
| `todayItems()` | dòng ~1159–1183 | Màn Hôm nay. Đã có sẵn 2 mục đúng chỗ cần gắn cảnh báo: "Hôm nay chụp …" (`shootDate === dstr(0)`) và "Mai chụp …" (`shootDate === dstr(1)`) |
| `jobDetailHTML(j)` | dòng ~1391–1459 | Chi tiết job: các mục Tiến độ → Lịch → Ghi chú → Tiền → Liên lạc → Lịch & nhắc việc → Google Drive. **Chưa có dòng đồ nghề nào** (đã grep: không có chuỗi "Đồ nghề"/"còn thiếu … món") |
| `jobAction(act, id)` | dòng ~1498 | Switch xử lý `data-act` trong chi tiết job — thêm nhánh `act === 'gear'` (xem §6.2) |
| `go(view)` | dòng ~1143 | Chuyển view; tabbar chỉ có 5 view: `home`, `jobs`, `money`, `depts`, `ask` — **không có view `check`** |

### 1.2. Mô hình dữ liệu v1.1 — không đổi cấu trúc, chỉ thêm 2 hằng + 1 helper

```js
// Mẫu theo loại: thêm 'Event', mỗi loại đúng 10 món (câu chữ đầy đủ ở §3)
CHECKLISTS = { Portrait: [...10 món], Couple: [...10 món], Wedding: [...10 món],
               Lookbook: [...10 món], Event: [...10 món] };

// Món cộng thêm cho job Film / Cả hai (câu chữ đầy đủ ở §4)
FILM_EXTRA = ['Cuộn film đủ số lượng + đã kiểm tra hạn dùng, ISO đúng',
              'Máy film đã test màn trập + pin, lab tráng/scan đã hẹn'];

// Nhóm hiển thị A–F, mảng song song với CHECKLISTS (xem §5.3). Không lưu vào localStorage.
GEAR_GROUPS = { Portrait: ['A','A','B','B','C','C','D','D','D','E'],
                Couple:   ['A','A','B','B','C','C','D','D','D','E'],
                Wedding:  ['A','A','B','B','C','C','D','D','E','E'],
                Lookbook: ['A','B','C','C','C','D','D','D','E','E'],
                Event:    ['A','A','B','B','C','C','D','D','D','E'] };
GEAR_GROUP_LABEL = { A: 'Máy & lens', B: 'Pin & thẻ', C: 'Đèn & chân máy',
                     D: 'Đạo cụ & hậu cần', E: 'Hành chính & tiền', F: 'Film' };

// Tick: KHÔNG đổi key, KHÔNG đổi định dạng.
//   checkDone['job:<id>']  = { '<tên món>': true, ... }   (gồm cả 2 món film khi có)
//   checkDone['type:<Loại>'] = { ... }                    (không bao giờ có món film)
//   state.cfg.checkExtra[type] = ['<món tự thêm>', ...]   (hiển thị sau món mẫu)
```

- **Không tạo key lưu trữ mới, không đổi `LS_KEY`, không đổi định dạng JSON sao lưu.**
- `checkItems(t)` cũ chỉ có 2 nơi gọi (dòng ~1663 trong `renderChecklist()`, dòng ~1708 trong
  kiểm tra trùng khi thêm món). Cả 2 đều có `c.job` trong tầm tay — đổi cả 2 sang
  `checkItems(c.type, c.job)` (xem §5.1). Không còn nơi nào khác gọi `checkItems`.
- `migrateChecks()` không cần sửa: nó lặp `Object.keys(CHECKLISTS)` nên tự bao gồm
  `'Event'` (không có dữ liệu cũ nào mang key `'Event'` nên vòng lặp đó là no-op).

### 1.3. Quy tắc vàng: tick lưu theo TÊN MÓN — hậu quả khi đổi câu chữ

- Tick lưu theo **tên món (chuỗi)**, không theo vị trí. Đổi câu chữ một món = món cũ
  mất tick, món mới bắt đầu chưa tick. Đã chứng minh bằng `migrateChecks()`: bản cũ
  lưu theo số thứ tự phải viết riêng hàm đổi sang tên món.
- **Vì vậy: toàn bộ câu chữ món v1 trong §3 phải copy đúng từng ký tự từ code v1**
  (đã đối chiếu từng chuỗi với `CHECKLISTS` dòng ~1626–1634 — xem Phụ lục A).
  Chỉ được tạo câu mới cho: món mới thêm (§3, đánh dấu ＋), món gộp (§3.2–3.4),
  món Event (§3.5), món film (§4). Món mới/gộp chưa từng có tick nên không mất dữ liệu.
- **Đổi thứ tự thì KHÔNG mất tick** (tick theo tên; `data-ci` trong `renderChecklist()`
  được giải quyết lại theo mảng `items` lúc render, dòng ~1685). Thứ tự chỉ ảnh hưởng
  thói quen tay của người dùng. Xem mâu thuẫn D1 ở §2.5 về việc §3 sắp lại thứ tự.

## 2. Danh sách món mới cần thêm — tóm tắt

| Loại | v1 | Món mới thêm (＋) | Món gộp | Tổng v1.1 |
|---|---|---|---|---|
| Portrait | 8 | 2: đèn LED/flash rời · chân máy/monopod | — | **10** |
| Couple | 8 | 3: lau sensor · đèn flash/LED · chân máy nhẹ | 1: địa điểm + timeline hoàng hôn | **10** |
| Wedding | 9 | 2: sao lưu thẻ buổi trước · chân máy/monopod | 1: timeline + giờ ăn/nghỉ ê-kíp | **10** |
| Lookbook | 8 | 3: máy+lens test · thẻ+pin · chân máy | 1: ủi phẳng + bàn là/lăn bụi | **10** |
| Event | 0 (rơi về Portrait) | 10 món mới hoàn toàn (§3.5) | — | **10** |
| Film / Cả hai | 0 | +2 món film (§4), cộng vào cuối danh sách của loại đó | — | **12** (10 + 2) |

### 2.1. Phương án gộp món (đã chốt — dùng phương án này)

Ba loại Couple/Wedding/Lookbook nếu chỉ cộng món mới sẽ thành 11 món. Thiết kế chốt
**gộp 2 món cũ thành 1 món mới** để đúng 10 món/loại (món gộp là câu mới nên người dùng
tick lại 1 lần — chấp nhận được, ghi rõ trong changelog v1.1 để Việt biết):

- **Couple:** gộp "Địa điểm + tuyến di chuyển" + "Timeline hoàng hôn đã tính giờ"
  → `"Địa điểm + tuyến di chuyển, timeline hoàng hôn đã tính giờ"`.
- **Wedding:** gộp "Timeline ngày cưới + danh sách người nhà cần chụp" + "Thỏa thuận giờ
  ăn / nghỉ của ê-kíp"
  → `"Timeline ngày cưới + danh sách người nhà, giờ ăn/nghỉ ê-kíp đã thỏa thuận"`.
- **Lookbook:** gộp "Sản phẩm đã ủi phẳng, đánh số thứ tự" + "Bàn là hơi / cây lăn bụi"
  → `"Sản phẩm đã ủi phẳng, đánh số — bàn là hơi / cây lăn bụi sẵn sàng"`.

### 2.2. Phương án dự phòng: giữ 11 món (chỉ dùng khi Việt/agent code phản đối gộp)

- Giữ nguyên cả 11 món ở 3 loại Couple/Wedding/Lookbook (không gộp, không bỏ món v1 nào).
- Khi đó: `CHECKLISTS` có 3 loại 11 món, 2 loại 10 món; tổng job Film/Cả hai ở 3 loại
  đó là 13 món. Mọi chỗ hiển thị "X/10 món" phải dùng `items.length` làm mẫu số
  (đã là yêu cầu bắt buộc ở §6 — không hard-code 10).
- Nếu chọn phương án này, ghi rõ lý do vào báo cáo bàn giao, cập nhật §3.2–3.4 và
  tiêu chí đếm món ở §9. **Tuyệt đối không tự ý bỏ một món v1 nào để ép đủ 10.**

### 2.3. Việc "thiếu chân máy/đèn ở Portrait/Couple" được khắc phục ra sao

- Portrait ＋ đèn (§3.1 món 5) ＋ chân máy (§3.1 món 6).
- Couple ＋ đèn (§3.2 món 5) ＋ chân máy (§3.2 món 6).
- Wedding đã có flash, ＋ chân máy (§3.3 món 6) ＋ sao lưu thẻ (§3.3 món 4 — khắc phục
  luôn thiếu sót "không có mục kiểm tra trước giờ chụp", GEAR-CHECKLIST §1.3.3).
- Lookbook ＋ máy+lens test (§3.4 món 1) ＋ thẻ+pin (§3.4 món 2) ＋ chân máy (§3.4 món 5).

### 2.4. Ngoài phạm vi (không làm ở v1.1)

- Không gợi ý món theo thiết bị thật trong `cfg.equipment[]` (để v1.2).
- Không nhắc đẩy riêng cho checklist; chỉ dùng dòng nhắc trên màn Hôm nay (§6.3).
- Không đồng bộ checklist lên CloudKit (đi kèm sync job ở Nấc 2).
- Không cho sửa mẫu mặc định từng loại (chỉ thêm món riêng qua `checkExtra` như v1).
- Không checklist theo bước pipeline (đã chốt không làm ở v1).

### 2.5. Mâu thuẫn / lệch đã phát hiện khi đối chiếu thiết kế với code thật

| # | Vấn đề | Quyết định cho agent code |
|---|---|---|
| D1 | GEAR-CHECKLIST §3 sắp lại thứ tự món cũ theo nhóm A→E (VD Portrait v1: pin, thẻ, lens, sensor… → §3.1: lens, sensor, pin, thẻ…), trong khi §4.2 của chính file đó viết "Không được đổi thứ tự món đã có". | **Làm theo §3** (thứ tự theo nhóm A→E). Đổi thứ tự không mất tick (§1.3), chỉ đổi thói quen tay. Ghi rõ trong changelog là "đã sắp lại thứ tự món cũ theo nhóm". Phương án dự phòng nếu Việt không thích: giữ nguyên thứ tự tương đối của món v1, chỉ chèn món mới vào đúng vị trí nhóm (VD Portrait: pin, thẻ, lens, sensor, đèn, chân máy, trang phục, địa điểm, hoa, cọc). |
| D2 | GEAR-CHECKLIST §1.2 diễn đạt lại món v1 ("lau sensor, kiểm tra máy") khác câu chữ thật trong code (`'Máy đã lau sensor, kiểm tra nhanh'`). | **Lấy code làm chuẩn.** Mọi câu món cũ trong §3 dưới đây đã đối chiếu từng ký tự với `CHECKLISTS` (Phụ lục A). Không dùng câu diễn đạt lại. |
| D3 | GEAR-CHECKLIST §4.3.2 viết "mở tab checklist" — nhưng **không có tab checklist riêng**: checklist là mục "Chuẩn bị đồ" trong view `jobs` (dòng ~606–616), tabbar chỉ có 5 view `home/jobs/money/depts/ask`. | Dòng ở chi tiết job điều hướng: đóng sheet job → `go('jobs')` → `checkSel='job:<id>'`, `checkPinned=true` → `renderChecklist()` → cuộn tới `#checkTypeChips` (xem §6.2). Không tạo view/tab mới. |
| D4 | GEAR-CHECKLIST §3.4 gán nhầm nhóm: món 2 "Thẻ nhớ đã format, pin sạc đầy" ghi nhóm A (Máy & lens), món 3 "Phông nền / studio đã đặt" ghi nhóm B (Pin & thẻ). | Dùng bảng nhóm chuẩn ở §5.3: Lookbook món 2 → nhóm B, món 3–5 → nhóm C. Giữ nguyên câu chữ, chỉ sửa nhãn nhóm. |
| D5 | GEAR-CHECKLIST §6 viết "`node --check` các script inline" — `www/index.html` không có file `.js` riêng, script nằm inline trong HTML nên không `node --check` trực tiếp được. | Cách kiểm chứng thực tế: trích các khối `<script>` ra file tạm trong `/tmp` rồi `node --check`, hoặc tương đương: test jsdom [0] "trang tải không lỗi jsdom" đạt với 0 lỗi (xem §9). |

## 3. Danh sách mẫu v1.1 đầy đủ — agent code copy đúng câu chữ này vào `CHECKLISTS`

Ký hiệu: `●` = món đã có trong v1 (giữ nguyên câu, đã đối chiếu code) ·
`＋` = món mới thêm ở v1.1 · `⨁` = món gộp (câu mới, gồm 2 món v1).

### 3.1. Portrait — 10 món

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| 1 | A | ● `Lens chân dung (85mm / 50mm)` |
| 2 | A | ● `Máy đã lau sensor, kiểm tra nhanh` |
| 3 | B | ● `Sạc đầy pin + mang pin dự phòng` |
| 4 | B | ● `Thẻ nhớ đã format, mang thẻ dự phòng` |
| 5 | C | ＋ `Đèn LED/flash rời + pin đèn, đã test sáng` |
| 6 | C | ＋ `Chân máy / monopod (nếu chụp phơi sáng hoặc quay)` |
| 7 | D | ● `Trang phục & phụ kiện đã hẹn với khách` |
| 8 | D | ● `Địa điểm + giờ ánh sáng đẹp đã chốt` |
| 9 | D | ● `Hoa / đạo cụ theo concept (sen, lồng đèn…)` |
| 10 | E | ● `Cọc đã nhận — kiểm tra trong tab Tiền bạc` |

### 3.2. Couple — 10 món (gộp món 8)

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| 1 | A | ● `Lens 35mm + 85mm` |
| 2 | A | ＋ `Máy đã lau sensor, kiểm tra nhanh` |
| 3 | B | ● `Sạc đầy pin + pin dự phòng` |
| 4 | B | ● `Thẻ nhớ dự phòng` |
| 5 | C | ＋ `Đèn flash/LED + pin đèn, đã test sáng` |
| 6 | C | ＋ `Chân máy nhẹ (chụp hoàng hôn / phơi sáng)` |
| 7 | D | ● `Trang phục cặp đôi đã thống nhất` |
| 8 | D | ⨁ `Địa điểm + tuyến di chuyển, timeline hoàng hôn đã tính giờ` |
| 9 | D | ● `Đạo cụ: hoa, ô trong, bóng bay…` |
| 10 | E | ● `Cọc đã nhận — kiểm tra trong tab Tiền bạc` |

### 3.3. Wedding — 10 món (gộp món 7)

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| 1 | A | ● `2 thân máy sẵn sàng, pin sạc đầy hết` |
| 2 | A | ● `Lens 24-70 + 85mm` |
| 3 | B | ● `Thẻ nhớ nhiều + đã format` |
| 4 | B | ＋ `Thẻ nhớ đã sao lưu buổi trước, còn trống đủ` |
| 5 | C | ● `Đèn flash + pin đèn` |
| 6 | C | ＋ `Chân máy / monopod cho lễ + tiệc tối` |
| 7 | D | ⨁ `Timeline ngày cưới + danh sách người nhà, giờ ăn/nghỉ ê-kíp đã thỏa thuận` |
| 8 | D | ● `Đồ dự phòng: kim chỉ, băng keo, sạc dự phòng` |
| 9 | E | ● `Hợp đồng + số điện thoại phù rể / người điều phối` |
| 10 | E | ● `Cọc đã nhận — kiểm tra trong tab Tiền bạc` |

### 3.4. Lookbook — 10 món (gộp món 8)

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| 1 | A | ＋ `Máy + lens đã test (thường 50mm / 85mm)` |
| 2 | B | ＋ `Thẻ nhớ đã format, pin sạc đầy` |
| 3 | C | ● `Phông nền / studio đã đặt` |
| 4 | C | ● `Đèn studio + tản sáng` |
| 5 | C | ＋ `Chân máy (chụp sản phẩm góc cố định)` |
| 6 | D | ● `Shot list từ shop đã in / lưu sẵn` |
| 7 | D | ● `Mẫu + makeup đã xác nhận giờ` |
| 8 | D | ⨁ `Sản phẩm đã ủi phẳng, đánh số — bàn là hơi / cây lăn bụi sẵn sàng` |
| 9 | E | ● `Thỏa thuận số ảnh giao + hạn giao` |
| 10 | E | ● `Cọc đã nhận — kiểm tra trong tab Tiền bạc` |

### 3.5. Event (MỚI — v1 chưa có) — 10 món

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| 1 | A | `2 thân máy sẵn sàng (1 máy chính + 1 máy dự phòng)` |
| 2 | A | `Lens 24-70 + 70-200 (bao quát sân khấu + cận cảnh)` |
| 3 | B | `Pin sạc đầy hết + pin dự phòng cho cả 2 máy` |
| 4 | B | `Thẻ nhớ nhiều + đã format, thẻ dự phòng` |
| 5 | C | `Đèn flash + pin đèn, đã test sáng` |
| 6 | C | `Monopod / chân máy (chụp sân khấu, quay)` |
| 7 | D | `Lịch trình sự kiện + danh sách tiết mục / người phát biểu` |
| 8 | D | `Vị trí đứng đã khảo sát (sân khấu, lối đi, ánh sáng)` |
| 9 | D | `Thẻ đeo / giấy vào khu vực hạn chế (nếu có)` |
| 10 | E | `Hợp đồng + SĐT điều phối sự kiện, cọc đã nhận` |

> Lưu ý Event: `TYPES` đã có `'Event'` (dòng ~782), bảng giá đã có `prices.Event`
> và `pricesFilm.Event` (test [2]/[12] đã kiểm chứng), chỉ `CHECKLISTS` là thiếu nên
> `listType('Event')` đang rơi về `'Portrait'`. Thêm `'Event'` vào `CHECKLISTS` là
> đủ sửa lỗi này — không cần đụng `TYPES`, form job hay bảng giá. Job loại `'Khác'`
> vẫn rơi về Portrait như v1 (ngoài phạm vi).

## 4. Món film cho job Film / Cả hai (+2 món, áp dụng cho mọi loại)

Chỉ cộng thêm khi `jobMedium(job)` là `'Film'` hoặc `'Cả hai'` (`jobMedium` đã có,
dòng ~785; dùng nó thay vì đọc thẳng `job.medium` để job cũ thiếu `medium` vẫn ra
`'Digital'` qua `normMedium`):

| # | Nhóm | Món (copy đúng câu) |
|---|---|---|
| F1 | F | `Cuộn film đủ số lượng + đã kiểm tra hạn dùng, ISO đúng` |
| F2 | F | `Máy film đã test màn trập + pin, lab tráng/scan đã hẹn` |

- Tổng món job Film/Cả hai: **12 món** (10 món loại + 2 món film; cộng thêm món tự
  thêm trong `checkExtra` nếu có).
- Tick của 2 món film lưu cùng key `checkDone['job:<id>']` như món thường — **không
  tạo key riêng, không tạo loại riêng**.
- Job Digital không thấy 2 món này. Danh sách chung `'type:<Loại>'` (không gắn job)
  **không bao giờ** hiện món film vì không có `medium` để xét.
- **Đổi medium không xoá tick:** job Film → Digital thì 2 món film chỉ ẩn đi, tick
  của chúng vẫn nằm trong `checkDone['job:<id>']`; đổi lại sang Film/Cả hai thì tick
  cũ hiện lại. Không được `delete` key film khi ẩn.
- **Đổi loại job cũng không xoá tick:** job Portrait → Event thì tick Portrait cũ vẫn
  nằm trong cùng key `job:<id>` dưới dạng key thừa (bị bỏ qua khi đếm); đổi lại
  Portrait thì tick cũ hiện lại. Hành vi này là hệ quả tự nhiên của lưu theo tên —
  không viết code dọn dẹp key thừa.

## 5. Hàm và luồng code

### 5.1. `checkItems(t, job)` — đổi chữ ký, thêm film

```js
// v1 (dòng ~1636):  function checkItems(t){ return CHECKLISTS[t].concat((state.cfg.checkExtra && state.cfg.checkExtra[t]) || []); }
// v1.1:
function checkItems(t, job){
  var base = CHECKLISTS[listType(t)] || CHECKLISTS['Portrait'];
  var items = base.concat((state.cfg.checkExtra && state.cfg.checkExtra[t]) || []);
  if (job && (jobMedium(job) === 'Film' || jobMedium(job) === 'Cả hai'))
    items = items.concat(FILM_EXTRA);
  return items;
}
```

- Dùng `listType(t)` bên trong để job loại `'Khác'` vẫn về Portrait (giữ hành vi v1).
- Món film **đặt sau món tự thêm** hay trước? Chốt: **sau món mẫu, trước món tự
  thêm** — tức thứ tự: mẫu (10) → film (2) → `checkExtra`. Lý do: món tự thêm là
  của người dùng, luôn ở cuối như v1; món film là món mẫu hệ thống nên đứng cùng
  khối mẫu. (Nếu code theo thứ tự mẫu → extra → film thì vẫn đúng chức năng nhưng
  sai spec này — test đếm tổng không phân biệt, test thứ tự ở §9.3 có kiểm tra.)
- Cập nhật cả 2 nơi gọi: `renderChecklist()` (dòng ~1663) → `checkItems(c.type, c.job)`;
  kiểm tra trùng khi thêm món (dòng ~1708) → `checkItems(c.type, c.job)`. Nhờ đó
  người dùng không thêm món trùng tên món film khi đang xem job Film.
- `checkItems(t)` gọi không có `job` (vd từ console/test) vẫn chạy: trả về danh sách
  Digital (không film) — giữ tương thích ngược.

### 5.2. `gearStatus(j)` — helper mới, dùng chung cho cả 3 nơi hiển thị + test

```js
// Hàm mới, đặt ngay sau checkItems(). Khai báo top-level như các hàm khác
// để test jsdom gọi được qua W.gearStatus (xem §9.3).
function gearStatus(j){
  if (!j) return null;
  var items = checkItems(listType(j.type), j);
  var done = checkDone['job:' + j.id] || {};
  var nDone = items.filter(function(it){ return done[it]; }).length;
  return { items: items, total: items.length, done: nDone, missing: items.length - nDone };
}
```

- `missing` là số món chưa tick; `total` là mẫu số hiển thị — **không hard-code 10
  hay 12 ở bất kỳ chỗ nào** (phòng khi dùng phương án 11 món ở §2.2 hoặc người dùng
  có `checkExtra`).
- Key thừa trong `checkDone` (món cũ đã gộp, món film khi job đang Digital, tick của
  loại cũ sau khi đổi loại) không được đếm vào `done` — chỉ đếm món đang có trong
  `items`. Đây là hành vi đúng, không phải lỗi.

### 5.3. Nhóm hiển thị A–F trong tab checklist

- Nhóm chỉ là **cách hiển thị**, không tách thành 5 tab con, không đổi cấu trúc lưu trữ.
- Trong `renderChecklist()`, khi render `#checkList`, chèn dòng phân cách tiêu đề nhóm
  trước món đầu tiên của mỗi nhóm (vd `<div class="sec-s">Máy & lens</div>` hoặc kiểu
  row phân cách sẵn có trong app — dùng lại class hiện có, không thêm CSS mới nếu
  không cần). Nhóm của món mẫu lấy từ `GEAR_GROUPS[c.type]` theo vị trí; 2 món film
  thuộc nhóm F (`'Film'`); món tự thêm thuộc nhóm riêng, tiêu đề `'Món riêng'` (hoặc
  không có tiêu đề, giữ như v1 — chốt: **có tiêu đề `'Món riêng'`** khi có ít nhất
  1 món tự thêm, để phân biệt với món mẫu).
- Dưới thanh tiến độ (cạnh `#checkCount`), thêm dòng tóm tắt theo nhóm, tính từ cùng
  `checkDone`, dạng: `Máy & lens 2/2 · Pin & thẻ 1/2 · Đèn & chân máy 0/2 · Đạo cụ & hậu cần 1/3 · Hành chính & tiền 0/1`
  (chỉ hiện nhóm nào có món trong danh sách đang xem; job Film thêm `· Film 0/2`;
  nhóm Món riêng không đưa vào tóm tắt này). Đặt dòng này trong cùng khối chứa
  `#checkBar`/`#checkCount` (dòng ~609–613), không tạo section mới.
- Thứ tự nhóm hiển thị luôn A → B → C → D → E → F → Món riêng, khớp thứ tự món
  trong mảng `CHECKLISTS` (§3) — không cần sắp xếp lại mảng khi render.
- Khi tick đủ hết: giữ nguyên hành vi v1 (`celebrate('Đủ đồ rồi, diễn thôi!', 'party')`,
  `#checkHint` = `'Xong hết rồi — xách máy đi thôi bạn!'`). Không thêm âm thanh/hiệu ứng.

### 5.4. Không đổi

- `CHECKLISTS` vẫn là object literal với key là tên loại; `Object.keys(CHECKLISTS)`
  sau v1.1 = 5 loại (`Portrait, Couple, Wedding, Lookbook, Event`) — pill danh sách
  chung trong `renderChecklist()` (dòng ~1666) tự có thêm pill `'Event'`, không cần
  sửa code pill.
- `checkContext()`, `upcomingShoots()`, `migrateChecks()`, `saveLocal()`/`loadLocal()`,
  xoá job, "Thêm món", "Làm mới": không đổi logic, chỉ hưởng lợi từ `CHECKLISTS` mới
  và `checkItems(t, job)` mới.

## 6. Luồng hiển thị + cảnh báo "còn thiếu"

### 6.1. Tab checklist (view `jobs`, mục "Chuẩn bị đồ") — thay đổi ở §5.3

Không thêm màn hình mới. Người dùng vẫn mở tab "Buổi chụp", kéo xuống mục "Chuẩn bị
đồ", thấy checklist của buổi chụp gần nhất như v1; job Film/Cả hai thấy thêm 2 món
film ở cuối khối mẫu (nhóm F); tick từng món, tiến độ cập nhật ngay, lưu local ngay
(`saveLocal()` như v1).

### 6.2. Chi tiết job — thêm 1 dòng duy nhất (mới)

- **Vị trí:** trong `jobDetailHTML(j)` (dòng ~1391–1459), ngay sau khối Tiến độ
  (sau `stepsBar` + nút "Xong bước này", trước mục `<p class="sec-s">Lịch</p>`).
  Dạng một dòng bấm được (`.row act` như nút "Ghi khoản thu / chi cho job này" ở
  mục Tiền), dùng `data-act="gear"` để `jobAction` xử lý.
- **Nội dung theo trạng thái** (lấy từ `gearStatus(j)`; `T` = total, `M` = missing):
  - Job chưa xong, chưa huỷ, còn thiếu (`M > 0`): `Đồ nghề: còn thiếu M/T món — bấm để xem`
    (hiển thị dạng cảnh báo nhẹ, vd icon `cam` + chữ màu đỏ/cam như `infoRow(..., 'red')`
    đã dùng cho "Còn thiếu" tiền ở dòng ~1412).
  - Job chưa xong, chưa huỷ, đủ đồ (`M = 0`): `Đồ nghề: đủ hết rồi ✓` (màu xanh như
    `infoRow(..., 'green')` đã dùng cho "Đã thu đủ").
  - Job đã ở bước "Đã chụp" trở đi (index ≥ 3) nhưng chưa "Xong": vẫn hiện dòng trên
    với cùng công thức (người dùng có thể còn tick nốt sau buổi chụp, vd sao lưu thẻ).
  - Job đã huỷ (`j.cancelled`) hoặc đã "Xong": **không hiện dòng** (job huỷ/xong không
    cần chuẩn bị đồ nữa).
- **Chạm vào dòng** → thêm nhánh trong `jobAction(act, id)` (dòng ~1498):
  ```js
  if (act === 'gear'){
    if (jobSheet) jobSheet.close();
    checkSel = 'job:' + id; checkPinned = true;
    go('jobs'); renderChecklist();
    var el = document.getElementById('checkTypeChips');
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
  ```
  (Sửa D3: không có view `check`; đích đến là view `jobs` + cuộn tới `#checkTypeChips`.
  `renderChecklist()` phải gọi sau `go('jobs')` để view đã hiển thị. `jobSheet.close()`
  trước để sheet chi tiết không che view jobs. Không dùng `refreshJobSheet()` ở đây
  vì đã rời khỏi sheet.)
- Dòng này **không chặn** chuyển bước pipeline (khác với 5 khóa an toàn tiền/MAP…):
  chỉ nhắc, không cấm bấm "Xong bước này" khi đồ chưa đủ. Chốt theo thiết kế: cảnh
  báo, không khóa.

### 6.3. Màn Hôm nay — làm giàu mục đã có, không tạo mục nhắc mới

- **Không push thêm item nhắc mới** vào `todayItems()` (dòng ~1159–1183) để tránh 1 job
  hiện 2 dòng. Thay vào đó, **sửa `desc` của 2 mục đã có** theo trạng thái đồ nghề:
  - Mục `"Hôm nay chụp …"` (`shootDate === dstr(0)`): nếu `gearStatus(j).missing > 0`
    thì `desc` thêm ` · Còn thiếu M/T món đồ — bấm vào job để xem.`; nếu đủ thì thêm
    ` · Đủ đồ rồi, diễn thôi!`.
  - Mục `"Mai chụp …"` (`shootDate === dstr(1)`): tương tự; `desc` gốc
    `"Tối nay xem qua danh sách chuẩn bị đồ là yên tâm ngủ ngon."` giữ nguyên rồi nối
    thêm ` Còn thiếu M/T món đồ.` khi thiếu, hoặc ` Đủ đồ rồi.` khi đủ.
- **Điều kiện áp dụng hậu tố:** chỉ với job thỏa cả 3 điều kiện: `shootDate` là hôm nay
  hoặc ngày mai; `STAGES.indexOf(j.stage) <= 2` (tức Tư vấn / Chốt cọc / Sắp chụp —
  chưa chụp; chặt hơn `upcomingShoots()` vốn lấy tới index 3, vì job đã "Đã chụp"
  thì nhắc chuẩn bị đồ là vô nghĩa); job không bị huỷ (`!j.cancelled`). Job không
  thỏa điều kiện thì mục Hôm nay giữ nguyên `desc` gốc, không thêm hậu tố.
- Tile "Cần nhớ" (`items.length`) tự tăng/giảm theo — không cần sửa `renderHome()`
  ngoài việc `todayItems()` đã đổi.
- Bấm vào mục Hôm nay vẫn mở chi tiết job như v1 (`bindRows` → `openJob`, dòng ~1234):
  từ đó người dùng thấy dòng đồ nghề ở §6.2 và chạm để sang checklist. Tổng cộng
  tối đa 2 chạm từ Hôm nay tới checklist — đúng giới hạn 3 chạm của app, không cần
  đường tắt thẳng Hôm nay → checklist.

### 6.4. Luồng người dùng v1.1 (không thêm bước nào)

1. Tạo job → chọn loại (Portrait/Couple/Wedding/Lookbook/Event) + chất liệu
   (Digital/Film/Cả hai) như v1.
2. Mở tab "Buổi chụp" → mục "Chuẩn bị đồ" mặc định thấy checklist buổi chụp gần
   nhất (như v1); job Film/Cả hai thấy thêm 2 món film cuối khối mẫu.
3. Tick từng món khi chuẩn bị xong; tiến độ + tóm tắt theo nhóm cập nhật ngay, lưu
   local ngay (`saveLocal()` như v1).
4. Trước giờ chụp (hôm nay/ngày mai): màn Hôm nay nhắc job nào còn thiếu món (§6.3);
   chi tiết job có dòng "Đồ nghề: còn thiếu M/T món" (§6.2).
5. Muốn thêm món riêng: nút "Thêm món" có sẵn của v1 (lưu `cfg.checkExtra[type]`,
   áp dụng cho mọi job cùng loại).
6. Muốn làm mới: nút "Làm mới" có sẵn của v1 (bỏ tick hết của job/loại đang xem).

## 7. Thứ tự code (§8 trong GEAR-CHECKLIST.md — giữ nguyên, đã gắn neo file)

File duy nhất cần sửa (dự kiến): `www/index.html`. Không tạo file mới, không đổi key
lưu trữ, không đổi `APP_VERSION` trong cùng commit này trừ khi quy trình bump version
của repo yêu cầu (bump version là việc riêng, không thuộc spec gear).

1. **Thêm Event + món mới vào `CHECKLISTS`** (dòng ~1626–1634): thay toàn bộ 4 mảng
   theo §3.1–§3.4, thêm mảng `'Event'` theo §3.5. Thêm `FILM_EXTRA` + `GEAR_GROUPS` +
   `GEAR_GROUP_LABEL` ngay sau `CHECKLISTS`.
2. **Cộng `FILM_EXTRA`**: đổi `checkItems(t)` → `checkItems(t, job)` (§5.1), thêm
   `gearStatus(j)` (§5.2), cập nhật 2 nơi gọi (dòng ~1663, ~1708).
3. **Tiêu đề nhóm + tóm tắt theo nhóm** trong `renderChecklist()` (§5.3): render
   `#checkList` có dòng phân cách nhóm; thêm dòng tóm tắt cạnh `#checkCount`.
4. **Dòng "còn thiếu" ở chi tiết job + Hôm nay** (§6.2, §6.3): 1 dòng trong
   `jobDetailHTML()` + nhánh `act === 'gear'` trong `jobAction()`; sửa `desc` 2 mục
   trong `todayItems()`.
5. **Cập nhật test** (`www/test-fotobro-v1.js`): thêm mục `[13]` theo §9.3; chạy lại
   toàn bộ test, số đạt không giảm so với baseline §9.1.

## 8. Tiêu chí kiểm chứng (agent code v1.1 phải chạy trước khi báo xong)

### 8.1. Baseline đã đo ngày 20/11/2026 (trước khi code v1.1)

Chạy `cd www && NODE_PATH=/tmp/film-verify/node_modules node test-fotobro-v1.js`:
**101 đạt / 103**, 2 lỗi có sẵn KHÔNG liên quan gear, không được tính là hồi quy:

- `APP_VERSION 2.6` — code đang là `'1.0'` (dòng ~3860), test expect `'2.6'`.
- `mẫu có 5 job` — số job mẫu hiện tại khác 5.

Sau v1.1, tổng số đạt phải ≥ 101 và 2 lỗi trên vẫn là đúng 2 lỗi đó (hoặc đã sửa
riêng ngoài spec này thì ghi rõ). Test mới ở §9.3 cộng thêm vào tổng.

### 8.2. Kiểm tra tĩnh

- [ ] Trích các khối `<script>` trong `www/index.html` ra file tạm `/tmp` rồi
  `node --check` đạt (xem D5 — không `node --check` trực tiếp lên file `.html`).
- [ ] `Object.keys(CHECKLISTS)` = 5 loại (`Portrait, Couple, Wedding, Lookbook, Event`).
- [ ] Đếm món: mỗi loại đúng 10 món mẫu (Digital); job Film/Cả hai: 12 món
  (10 + 2 film). Đếm bằng `CHECKLISTS[t].length` và `checkItems(t, jobFilm).length`.
- [ ] Không có món mẫu cũ nào bị đổi câu: diff mảng v1 với mảng v1.1, mọi chuỗi cũ
  (trừ 3 món đã gộp ở §2.1) đều còn nguyên, đúng từng ký tự (kể cả `…`, `—`, `&`).
  3 chuỗi cũ biến mất hợp lệ duy nhất: `'Địa điểm + tuyến di chuyển'`,
  `'Timeline hoàng hôn đã tính giờ'` (Couple); `'Timeline ngày cưới + danh sách
  người nhà cần chụp'`, `'Thỏa thuận giờ ăn / nghỉ của ê-kíp'` (Wedding);
  `'Sản phẩm đã ủi phẳng, đánh số thứ tự'`, `'Bàn là hơi / cây lăn bụi'` (Lookbook)
  — 6 chuỗi này được thay bằng 3 chuỗi gộp mới ở §2.1.

### 8.3. Kiểm tra hành vi (thêm mục `[13]` vào `www/test-fotobro-v1.js`, dùng jsdom như các mục sẵn có)

```js
// Gợi ý assert — agent code viết đầy đủ theo mẫu các mục [0]–[12] trong file test.
// Giả định W = window jsdom, đã loadDom() như đầu file test.
console.log('\n[13] Checklist đồ nghề v1.1');
t('đủ 5 loại checklist', Object.keys(W.CHECKLISTS).length === 5);
['Portrait','Couple','Wedding','Lookbook','Event'].forEach(function(ty){
  eq('CHECKLISTS.' + ty + ' đúng 10 món', W.CHECKLISTS[ty].length, 10);
});
eq('Event không rơi về Portrait', W.listType('Event'), 'Event');
eq('loại lạ vẫn về Portrait', W.listType('Khác'), 'Portrait');
// Job Event mới -> checklist Event, không phải Portrait
// (tạo job qua state.jobs.unshift({...}) rồi gọi W.checkItems('Event', job) / W.gearStatus(job))
// Job Wedding Film -> 12 món; đổi sang Digital -> 10 món, tick film còn trong checkDone
// Tick 1 món của job A -> job B cùng loại không bị ảnh hưởng (key 'job:<id>' riêng)
// Đổi medium Film -> Digital -> Film: tick 2 món film hiện lại (không bị xoá)
// checkItems('Portrait') không job -> 10 món, không có món film
// gearStatus(job) trả về {total, done, missing} đúng; missing = total - done
// Job chụp ngày mai còn thiếu món -> todayItems() có mục chứa 'còn thiếu' (so sánh chuỗi
//   'Còn thiếu' trong desc); job đủ món -> không có hậu tố 'còn thiếu'
// Job chụp ngày mai đã 'Đã chụp' -> không gắn hậu tố gear (stage index > 2)
// Xoá job -> checkDone['job:<id>'] bị xoá (hành vi v1, kiểm tra không hồi quy)
```

- [ ] Tạo job Event mới → checklist hiện đúng 10 món Event, không phải Portrait
  (kiểm tra cả qua `gearStatus` lẫn render thật: `checkTitle` chứa `Event`).
- [ ] Tạo job Wedding Film → 12 món (10 + 2 film); đổi job sang Digital → về 10 món,
  tick 2 món film không hiện nhưng vẫn còn trong `checkDone['job:<id>']`; đổi lại
  Film → tick film hiện lại.
- [ ] Tick 1 món của job A → mở job B cùng loại, tick của B không bị ảnh hưởng
  (key `job:<id>` riêng).
- [ ] Đổi tên 1 món mẫu cũ trong code (test cố tình) → xác nhận tick cũ mất (chứng
  minh §1.3), rồi hoàn tác — **không đưa bản test đó vào code chính**.
- [ ] Job chụp trong 24h (hôm nay/ngày mai, stage ≤ "Sắp chụp") còn thiếu món → màn
  Hôm nay hiện hậu tố "còn thiếu M/T món đồ"; job đủ món → hậu tố "Đủ đồ rồi";
  job đã "Đã chụp" → không gắn hậu tố.
- [ ] Chi tiết job: job thiếu món hiện `Đồ nghề: còn thiếu M/T món`; job đủ món hiện
  `Đồ nghề: đủ hết rồi ✓`; job huỷ/Xong không hiện dòng; bấm dòng → sang view jobs,
  checklist đang chọn đúng `job:<id>` đó.
- [ ] Thêm món tự thêm → chỉ hiện ở loại đó, sau món mẫu (và sau món film nếu là job
  Film — kiểm tra thứ tự ở §5.1); xoá job → `checkDone['job:<id>']` bị xoá.
- [ ] Chạy lại toàn bộ test jsdom: số đạt không giảm so với baseline §9.1 (≥ 101 đạt
  trước khi cộng test mới; sau khi cộng mục [13] thì tổng tăng đúng bằng số assert
  mới, không có FAIL mới).

## Phụ lục A — Câu chữ món v1 đã đối chiếu với code (nguồn duy nhất cho cột ●)

`CHECKLISTS` trong `www/index.html`, dòng ~1626–1634 (đọc 20/11/2026):

- **Portrait (8):** `Sạc đầy pin + mang pin dự phòng` · `Thẻ nhớ đã format, mang thẻ dự phòng` ·
  `Lens chân dung (85mm / 50mm)` · `Máy đã lau sensor, kiểm tra nhanh` ·
  `Trang phục & phụ kiện đã hẹn với khách` · `Địa điểm + giờ ánh sáng đẹp đã chốt` ·
  `Hoa / đạo cụ theo concept (sen, lồng đèn…)` · `Cọc đã nhận — kiểm tra trong tab Tiền bạc`
- **Couple (8):** `Sạc đầy pin + pin dự phòng` · `Thẻ nhớ dự phòng` · `Lens 35mm + 85mm` ·
  `Trang phục cặp đôi đã thống nhất` · `Địa điểm + tuyến di chuyển` ·
  `Đạo cụ: hoa, ô trong, bóng bay…` · `Timeline hoàng hôn đã tính giờ` ·
  `Cọc đã nhận — kiểm tra trong tab Tiền bạc`
- **Wedding (9):** `2 thân máy sẵn sàng, pin sạc đầy hết` · `Thẻ nhớ nhiều + đã format` ·
  `Đèn flash + pin đèn` · `Lens 24-70 + 85mm` ·
  `Timeline ngày cưới + danh sách người nhà cần chụp` ·
  `Hợp đồng + số điện thoại phù rể / người điều phối` ·
  `Đồ dự phòng: kim chỉ, băng keo, sạc dự phòng` ·
  `Cọc đã nhận — kiểm tra trong tab Tiền bạc` · `Thỏa thuận giờ ăn / nghỉ của ê-kíp`
- **Lookbook (8):** `Shot list từ shop đã in / lưu sẵn` · `Mẫu + makeup đã xác nhận giờ` ·
  `Phông nền / studio đã đặt` · `Đèn studio + tản sáng` ·
  `Sản phẩm đã ủi phẳng, đánh số thứ tự` · `Bàn là hơi / cây lăn bụi` ·
  `Thỏa thuận số ảnh giao + hạn giao` · `Cọc đã nhận — kiểm tra trong tab Tiền bạc`

Lưu ý: thứ tự trong Phụ lục A là thứ tự thật trong code v1 (khác thứ tự theo nhóm
A→E ở §3 — xem D1). Khi code §3, agent code dùng đúng câu chữ ở đây, xếp theo thứ
tự ở §3.
