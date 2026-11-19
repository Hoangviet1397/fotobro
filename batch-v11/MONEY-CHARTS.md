# FotoBro — Spec code biểu đồ tiền bạc (v1.1)

> Phạm vi: **spec code cho v1.1, KHÔNG làm ở v1**. Chỉ viết file này, không
> sửa bất kỳ file nào khác, không thêm dependency, không push GitHub.
> Thiết kế tổng thể (vị trí, thứ tự làm, nhắc, xuất file) nằm ở
> `~/workspace/fotobro-ios-v1/MONEY-REPORT.md` — file này chỉ quyết phần
> **vẽ biểu đồ**: vẽ cái gì, dữ liệu nào, tính ra sao, vẽ bằng gì, hiển thị
> ra sao, nhanh ra sao, kiểm chứng thế nào.
>
> Nguồn dữ liệu đã có trong v1 (đọc từ `www/index.html`, 20/11/2026):
> `txs[]` (`id, kind 'thu'/'chi', category, jobId, amount` nguyên VND,
> `date 'YYYY-MM-DD', method, note, src`), `jobs[]` (`id, client, type,
> medium, stage, cancelled, shootDate, deadline, price, ...`),
> `jobThu(id)`, `jobChi(id)`, `jobOwe(j) = max(0, price − jobThu)`,
> `totalOwe()`, `monthOf(s) = s.slice(0,7)`, `monthTxs(kind)` (chỉ tháng
> hiện tại), `fmt()` / `fmtParts` / `fmtShort` / `fmtTiny` (VND `vi-VN` /
> USD `en-US`, **chỉ đổi hiển thị, không quy đổi tỷ giá**).
> V1 chưa có biểu đồ nào (`chart`/`canvas` cho biểu đồ = 0).

## 0. Nguyên tắc chung (áp cho mọi biểu đồ)

1. **Local-first, không gọi mạng.** Mọi biểu đồ tính từ `jobs`/`txs` trong
   bộ nhớ, không gọi API biểu đồ online, không gửi dữ liệu ra ngoài.
2. **Không thêm dependency nặng.** Vẽ tay bằng **SVG thuần** (xem §5) —
   không thêm Chart.js, ECharts hay bất kỳ thư viện biểu đồ nào vào
   `package.json` (hiện chỉ có Capacitor 8 + TypeScript, không có thư viện
   biểu đồ). SVG đủ cho 3 biểu đồ dưới đây; canvas chỉ dùng nếu sau này cần
   vẽ > 500 cột (không phải trường hợp của v1.1).
3. **Không thêm trường dữ liệu.** Chỉ thêm 1 cài đặt hiển thị duy nhất vào
   `cfg`: `reportRange: 'month' | '6m' | '12m' | 'year'` (mặc định
   `'month'`, theo MONEY-REPORT §1) — mở lại app vẫn nhớ kỳ đang xem.
   Mọi số liệu đều tính được từ dữ liệu đã có.
4. **Một kỳ xem chung.** Cả 3 biểu đồ dùng cùng kỳ đang chọn ở đầu tab
   Tiền bạc (Tháng / 6 tháng / 12 tháng / Năm nay). Đổi kỳ ở đâu thì cả 3
   biểu đồ đổi theo — không có kỳ riêng lẻ.
5. **Lời = lời trực tiếp, không phải lãi ròng.** Mọi chỗ hiện "lời" đều là
   `thu − chi trực tiếp của job` (`jobThu − jobChi`), **chưa trừ chi chung**
   (vận hành, khấu hao, quảng cáo). Biểu đồ nào cũng kèm chú thích này ở
   ngay dưới (xem §1–§3). Không được ghi "lãi ròng" ở bất kỳ đâu.
6. **Số tiền hiển thị:** nhãn trục dùng `fmtShort()` (vd: `12tr`),
   số chi tiết khi chạm dùng `fmt()` đầy đủ. Tôn trọng `currency`
   VND/USD trong `cfg` — chỉ đổi định dạng hiển thị, **không quy đổi tỷ giá**,
   không nhân hệ số nào khi chuyển VND ↔ USD.
7. **Chạm để xem chi tiết.** Chạm vào 1 cột / 1 thanh / 1 dòng thì hiện số
   đầy đủ (`fmt()`) của mục đó và lọc danh sách khoản bên dưới theo đúng
   tháng / loại job / job đó. Chạm lần nữa hoặc chạm chỗ trống thì bỏ lọc.

---

## 1. Biểu đồ thu/chi theo tháng (Chart A — bắt buộc)

**Mục đích:** nhìn 1 giây biết tháng nào thu nhiều, tháng nào chi lấn, lời
tháng này so với các tháng trước ra sao.

**Vị trí:** đầu tab Tiền bạc, ngay dưới 4 ô Thu / Chi / Lời / Còn thiếu
(giữ 4 ô, không thay). Dưới biểu đồ là mục "Cần thu nốt" theo MONEY-REPORT
§3, rồi mới tới Chart B (§2) và Chart C (§3).

### 1.1. Loại biểu đồ

| Thành phần | Dạng vẽ | Màu (light mode) |
|---|---|---|
| Thu / tháng | Cột đứng | Xanh lá (màu nhấn của app) |
| Chi / tháng | Cột đứng, nhóm cạnh cột thu | Đỏ |
| Lời / tháng (`thu − chi`) | Đường nối các điểm (kèm chấm tròn) | Xám đậm; đoạn âm → đỏ |
| Trục thời gian | Ngang, nhãn `MM/YY` (vd: `06/26`) | Chữ phụ |

- Mặc định hiện **6 tháng gần nhất** (kỳ `'6m'`). Kỳ `'month'`: chỉ 1 tháng
  → vẽ 1 nhóm cột + hiện thêm 2 dòng số lớn Thu/Chi/Lời tháng đó ngay dưới
  (không vẽ đường lời 1 điểm). Kỳ `'12m'`: 12 nhóm cột. Kỳ `'year'`: các
  tháng từ tháng 1 tới tháng hiện tại của năm nay.
- Nút "Xem thêm" dưới biểu đồ: 6m → 12m → Năm nay (xoay vòng), không cần
  cuộn ngang — màn hình điện thoại hẹp, cuộn ngang làm mất so sánh.

### 1.2. Dữ liệu đầu vào

- `txs[]` toàn bộ: `date` → `monthOf(date)` (`'YYYY-MM'`), `kind`,
  `amount`. Không lọc theo `jobId` (cả khoản chung `jobId = ''` cũng tính,
  vì chi chung vẫn là chi thật của tháng).
- Không dùng `jobs[].price` ở đây — chỉ tiền đã thu/chi thật (`txs`), không
  dùng giá hẹn.

### 1.3. Cách tính

```
months = danh sách tháng liên tục từ tháng đầu kỳ tới tháng cuối kỳ
         (VD: kỳ 6m tháng 11/2026 → ['2026-06' … '2026-11'])
         — trục phải liên tục, tháng không có khoản nào vẫn hiện cột 0.
cho mỗi tháng m:
  thu[m] = sum(amount của tx có monthOf(date) = m và kind = 'thu')
  chi[m] = sum(amount của tx có monthOf(date) = m và kind = 'chi')
  loi[m] = thu[m] − chi[m]        // có thể âm
```

- Gom 1 lần duyệt `txs` (O(n), xem §6), không gọi `monthTxs()` từng tháng.
- Tháng lời âm: điểm đường lời màu đỏ, nhãn hiện `lỗ X` (dùng `fmtShort`),
  không ghi "lời âm".
- Tỷ lệ trục dọc: giá trị lớn nhất = `max(thu, chi)` của các tháng trong kỳ;
  làm tròn lên tới `fmtShort` đẹp (vd: 12.400.000 → 13tr). Cột lời (đường)
  dùng cùng trục — không vẽ trục thứ hai.

### 1.4. Trường hợp biên

- Sổ trống / kỳ không có khoản nào: không vẽ trục rỗng — hiện khung trống
  với dòng "Chưa có khoản nào — ghi khoản đầu tiên" + nút "Ghi thu/chi".
- Chỉ có thu, không có chi (hoặc ngược lại): cột còn lại = 0, đường lời
  trùng cột thu (hoặc âm bằng chi), vẫn vẽ bình thường.
- Tháng hiện tại chưa hết: cột tháng này vẫn tính theo số đã có, thêm dấu
  `*` nhỏ ở nhãn tháng ("tháng đang diễn ra").

---

## 2. Top loại job theo lợi nhuận trực tiếp (Chart B — bắt buộc)

**Mục đích:** biết gói nào nuôi studio (Wedding lãi cao dù ít job,
Portrait lãi thấp nhưng đều) để quyết định báo giá và nhận job.

**Vị trí:** mục "Loại job nào lãi nhất" trong tab Tiền bạc, dưới Chart A,
trên danh sách lời từng job.

### 2.1. Loại biểu đồ

- **Thanh ngang** (horizontal bar), mỗi loại job = 1 thanh, độ dài ∝ lời
  trực tiếp. Sắp xếp giảm dần theo lời trực tiếp (dòng đầu = lãi cao nhất).
- Thanh lãi dương: xanh lá. Thanh lỗ (lời âm): đỏ, dài sang trái từ vạch 0
  (trục 0 ở giữa khi có cả dương và âm; nếu tất cả đều dương thì trục 0 ở
  trái). Thanh có nhãn số `fmtShort()` ở đầu thanh.
- Tối đa 6 loại (`Portrait, Couple, Wedding, Lookbook, Event, Khác`) — vừa
  màn hình, không cần cuộn.
- Nút chuyển 2 chế độ xem (tùy chọn ở v1.1, mặc định "Lời tổng"):
  **Lời tổng** ↔ **Lời trung bình / job**. Đổi chế độ thì độ dài thanh và
  thứ tự xếp hạng đổi theo, tiêu đề mục đổi theo ("Lời tổng" / "Lời TB/job").

### 2.2. Dữ liệu đầu vào

- `jobs[]` toàn bộ (kể cả `cancelled` và job chưa có khoản nào — lời = 0
  hoặc âm nếu đã chi), `jobThu(id)`, `jobChi(id)` đã có.
- Kỳ tính: **theo kỳ đang chọn ở Chart A** (mặc định). Nghĩa là: chỉ tính
  các khoản `txs` có `date` nằm trong kỳ đang chọn. Nếu kỳ = `'month'` thì
  chỉ tính thu/chi tháng đó; kỳ `'6m'`/`'12m'`/`'year'` tương tự.
  - Lưu ý kỹ thuật: `jobThu(id)`/`jobChi(id)` hiện tại tính toàn bộ lịch
    sử, **không có tham số kỳ**. V1.1 cần thêm 2 hàm mới `jobThuIn(id,
    from, to)` / `jobChiIn(id, from, to)` (lọc `txs` theo `jobId` + khoảng
    ngày) — không sửa hàm cũ, để không vỡ chỗ khác đang dùng.

### 2.3. Cách tính (theo từng loại `type`)

```
cho mỗi loại T có ≥ 1 job:
  n[T]        = số job loại T (kể cả cancelled, kể cả chưa có khoản)
  thu[T]      = Σ jobThuIn(job, kỳ) của các job loại T
  chi[T]      = Σ jobChiIn(job, kỳ) của các job loại T
  loi[T]      = thu[T] − chi[T]                 // lời trực tiếp
  loiTB[T]    = n[T] > 0 ? loi[T] / n[T] : 0    // làm tròn số nguyên VND
  gop[T]      = loi[T] / Σ loi[loại có loi > 0] // % đóng góp, chỉ tính trên loại lãi
xếp hạng: giảm dần theo loi[T] (chế độ "Lời tổng")
            hoặc giảm dần theo loiTB[T] (chế độ "Lời TB/job")
```

- Mỗi dòng hiện: tên loại, số job (`n`), tổng thu, tổng chi trực tiếp,
  **lời trực tiếp** (đậm), lời TB/job, % đóng góp (chế độ "Lời tổng").
- Bắt buộc có dòng chú thích ngay dưới bảng: "Lời ở đây là thu − chi trực
  tiếp của job, chưa trừ chi chung (vận hành, khấu hao, quảng cáo). Xem
  lãi ròng ở mục tổng tháng." — không được bỏ dòng này.
- % đóng góp: nếu tổng lời của các loại lãi = 0 (tất cả đều lỗ hoặc bằng 0)
  thì cột % hiện `—`, không chia cho 0.

### 2.4. Trường hợp biên

- Loại chỉ có 1 job lãi rất cao: hiện đúng, cột "lời TB" = lời tổng — không
  cảnh báo đặc biệt, người dùng tự đọc số job.
- Tất cả các loại đều lỗ: bảng vẫn hiện đầy đủ, dòng đầu là "lỗ ít nhất",
  không giấu số âm; thanh đỏ dài sang trái.
- Loại chưa có job nào: không hiện dòng đó.
- Kỳ đang chọn không có khoản nào: hiện bảng trống với dòng "Kỳ này chưa có
  khoản thu/chi nào cho job".

---

## 3. Job còn nợ nhiều nhất (Chart C — bắt buộc)

**Mục đích:** "to-do thu tiền" — biết ngay phải đòi ai, bao nhiêu, gấp tới
mức nào. Đây là biểu đồ hành động, không phải biểu đồ thống kê.

**Vị trí:** mục "Cần thu nốt" trong tab Tiền bạc, đặt ngay dưới 4 ô đầu
(trước cả Chart A), vì đây là việc cần làm hôm nay. (Thứ tự hiển thị trên
màn hình: 4 ô → Chart C → Chart A → Chart B. Thứ tự làm code vẫn theo
MONEY-REPORT §6.)

### 3.1. Loại biểu đồ

- **Danh sách thanh ngang** (top 5 job còn thiếu nhiều nhất), mỗi dòng là
  1 thanh: độ dài ∝ số còn thiếu (`jobOwe`), tối đa 5 dòng + nút "Xem tất
  cả" mở danh sách đầy đủ (danh sách đầy đủ là dạng bảng, không phải biểu
  đồ — xem MONEY-REPORT §3).
- Mỗi dòng: tên khách, loại job + bước hiện tại (`stage`), số còn thiếu
  (`jobOwe`, đỏ, đậm, `fmt()`), hạn giao (`deadline` — quá hạn thì đỏ
  "trễ X ngày"). Thanh màu đỏ, càng thiếu nhiều càng dài; job quá hạn giao
  thì viền thanh đậm hơn.
- Sắp xếp mặc định: **số còn thiếu giảm dần**. Nút chuyển sang sắp theo
  "hạn giao gần nhất" (job sắp quá hạn lên trước) — đổi sắp xếp thì thứ tự
  thanh đổi theo.
- 2 nút nhanh trên mỗi dòng (đã có sẵn ở v1, chỉ nối vào): "Nhắc khách"
  (mở mẫu tin nhắn nhắc khéo) và "Ghi thu nốt" (mở form thu với số tiền =
  đúng số còn thiếu).
- Cuối danh sách: 1 dòng tổng "Tổng còn thiếu: X — Y khách" (dùng
  `totalOwe()` đã có).

### 3.2. Dữ liệu đầu vào

- `jobs[]` + `jobOwe(j)`, `stage`, `deadline`, `shootDate`, `client`,
  `type` — toàn bộ đã có, không cần thêm trường.
- Chỉ hiện job chưa `Xong`, chưa `cancelled`, `jobOwe > 0`.
- Job đã `Xong` mà vẫn thiếu tiền: **không** vào top 5 này — đưa vào 1 mục
  riêng cuối danh sách "Đã xong nhưng vẫn thiếu" (MONEY-REPORT §3).

### 3.3. Cách tính

```
no = jobs.filter(j => !j.cancelled && j.stage !== 'Xong' && jobOwe(j) > 0)
no.sort((a, b) => jobOwe(b) − jobOwe(a))   // mặc định: thiếu nhiều trước
top5 = no.slice(0, 5)
tỷ lệ thanh: độ dài = jobOwe(j) / jobOwe(top5[0]) * 100%
// sắp theo hạn giao: job có deadline gần nhất (chưa qua) lên trước;
// job không có deadline xếp sau cùng; job quá hạn xếp đầu (trễ nhiều nhất trước).
```

- `jobOwe` đã là `max(0, price − jobThu)` — không tính lại, dùng đúng hàm
  đã có để số khớp với chi tiết job và tab Tiền bạc.
- Không phụ thuộc kỳ xem (`reportRange`): nợ là nợ tới hôm nay, không phải
  nợ của 1 tháng. Đổi kỳ ở Chart A không làm Chart C đổi.

### 3.4. Trường hợp biên

- Không còn job nào thiếu tiền: hiện khung trống "Không còn ai thiếu tiền
  🎉" (không vẽ thanh rỗng).
- Job chưa chốt giá (`price = 0`): `jobOwe = 0` → không vào danh sách
  (đúng, vì chưa biết thiếu bao nhiêu).
- Khách trả 1 phần: `jobOwe` giảm → thanh ngắn lại ngay khi mở lại tab,
  không cần nhập lại.

---

## 4. Tổng hợp 3 biểu đồ

| # | Biểu đồ | Loại | Dữ liệu chính | Tính toán chính | Kỳ xem |
|---|---|---|---|---|---|
| A | Thu/chi theo tháng | Cột nhóm + đường lời | `txs[].date/kind/amount` | Gom theo `monthOf()`, `loi = thu − chi` | Theo `reportRange` |
| B | Top loại job theo lời trực tiếp | Thanh ngang | `jobs[].type` + `jobThuIn`/`jobChiIn` | `loi = Σ(jobThu − jobChi)`, `loiTB = loi / n` | Theo `reportRange` |
| C | Job còn nợ nhiều nhất | Thanh ngang top 5 | `jobs[]` + `jobOwe()` | Sắp xếp theo `jobOwe` giảm dần | Không theo kỳ (nợ tới hôm nay) |

- Thứ tự hiển thị trên màn hình: **C → A → B** (C cần hành động hôm nay
  nên lên đầu; A cho bức tranh tháng; B cho quyết định báo giá).
- Thứ tự làm code: theo MONEY-REPORT §6 — C (§3) → nhắc trong app (§5
  Tầng A) → A (§1) → B (§2) → CSV (§4). Chart C làm trước vì dùng toàn bộ
  dữ liệu + form đã có, không cần hàm mới.
- Hàm mới cần viết (tất cả đều thuần tính toán, không thêm trường dữ liệu):
  1. `monthlyTotals(from, to)` — gom `txs` thành `{month, thu, chi, loi}[]`
     theo trục tháng liên tục (§1.3).
  2. `jobThuIn(id, from, to)` / `jobChiIn(id, from, to)` — thu/chi của 1
     job trong khoảng ngày (§2.2). Không sửa `jobThu`/`jobChi` cũ.
  3. `topDebtors(limit)` — top job còn thiếu, có tham số sắp xếp
     (`'owe' | 'deadline'`) (§3.3).
  4. `renderCharts()` — vẽ cả 3 biểu đồ SVG, gọi lại khi đổi kỳ, đổi
     `currency`/`locale`, hoặc khi `txs`/`jobs` thay đổi.
- Không cần: xem theo tuần (MONEY-REPORT §6 đã loại), lãi ròng có trừ chi
  chung (để v1.2, cần quyết cách phân bổ chi chung trước).

---

## 5. Vẽ bằng gì: SVG thuần, không thêm thư viện

**Quyết định: vẽ bằng SVG thuần, không thêm dependency.**

| Phương án | Kết luận |
|---|---|
| SVG thuần (tự viết hàm vẽ) | ✅ **Chọn.** 3 biểu đồ đều là cột/thanh/đường đơn giản, tổng < 200 dòng code vẽ. Không thêm byte nào vào app, không cần học API thư viện, chạy offline hoàn toàn, style khớp 100% với app. |
| Canvas thuần | ❌ Không chọn. Canvas khó làm chữ sắc nét trên màn Retina (phải nhân `devicePixelRatio`), khó bắt chạm chính xác từng cột, khó hỗ trợ VoiceOver. Chỉ cân nhắc nếu sau này có > 500 cột. |
| Chart.js / ECharts / thư viện khác | ❌ **Không thêm.** Thư viện nặng (Chart.js ~200KB, ECharts ~1MB), tăng kích thước app, phải kiểm tra tương thích iOS/Capacitor, và thừa tính năng so với 3 biểu đồ đơn giản. App v1 đã tối giản — không thêm dependency nặng nếu vẽ tay được. |
| API biểu đồ online | ❌ **Cấm.** App local-first, v1 đã bỏ offline; gọi API ngoài là vi phạm mô hình. |

**Cách vẽ SVG (quy ước cho lúc code):**

- 1 hàm chung `svgEl(tag, attrs)` tạo phần tử SVG; 3 hàm vẽ riêng
  `drawMonthlyChart(data)`, `drawTypeBars(data)`, `drawDebtorBars(data)`.
- Kích thước: `viewBox` theo chiều rộng thực của khung chứa
  (`clientWidth`), chiều cao cố định theo biểu đồ (A: 220px, B/C: 44px/dòng).
  Dùng `width: 100%`, không hard-code pixel màn hình.
- Chạm: mỗi cột/thanh là 1 phần tử SVG có `data-*` (tháng / loại / jobId);
  1 listener `click` duy nhất trên thẻ `<svg>` (event delegation), không
  gắn listener từng cột. Chạm → hiện tooltip số đầy đủ + lọc danh sách
  bên dưới (xem §0.7).
- Tooltip: 1 thẻ `<div>` tuyệt đối trong khung biểu đồ (không dùng
  `title`), hiện `fmt()` đầy đủ + nhãn (tháng / loại / tên khách). Ẩn khi
  chạm chỗ trống.
- Trục và lưới: chỉ vẽ 3 đường lưới ngang mờ + nhãn `fmtShort()`; không vẽ
  lưới dọc (rối trên màn hẹp). Nhãn trục tháng `MM/YY`, nhãn trục tiền
  `fmtShort()`.
- Không dùng `<canvas>` cho biểu đồ. (3 lần `canvas` trong code v1 là cho
  ảnh, không liên quan.)

---

## 6. Dark mode

- Màu biểu đồ **không hard-code** mã hex cố định. Dùng biến CSS đã có trong
  app (phong cách Apple Music: nền trắng sạch + dark mode đen, 1 màu nhấn):
  - Nền biểu đồ: trong suốt (lấy nền thẻ của app).
  - Chữ / nhãn trục: `var(--text)` / `var(--text-dim)` của app.
  - Lưới: `var(--border)` mờ.
  - Cột thu / thanh lãi: màu nhấn của app (xanh lá — cùng màu với nút chính).
  - Cột chi / thanh lỗ / số còn thiếu: đỏ (`var(--danger)` nếu app đã có,
    nếu chưa thì 1 đỏ duy nhất dùng chung cả 2 mode).
  - Đường lời: xám đậm ở light mode, xám sáng ở dark mode
    (`var(--text-dim)`); đoạn âm → đỏ.
- Quy tắc kiểm tra: cùng 1 biểu đồ, chụp màn hình ở cả 2 mode — mọi chữ
  phải đọc được (tương phản ≥ 4.5:1), không có chữ đen trên nền đen, không
  có cột chìm vào nền.
- Khi người dùng đổi mode trong Cài đặt: vẽ lại biểu đồ ngay (gọi lại
  `renderCharts()`), không cần tải lại app.
- Màu nhấn / màu đỏ **giữ nguyên cả 2 mode** (chỉ đổi độ sáng nền và chữ) để
  người dùng nhận ra "xanh = thu, đỏ = chi" dù ở mode nào.

---

## 7. Hiển thị VND/USD — chỉ đổi định dạng, không quy đổi tỷ giá

- Mọi số tiền trên biểu đồ (nhãn trục, tooltip, số trên thanh) đều qua
  `fmt()` / `fmtShort()` đã có, tôn trọng `cfg.currency` (`VND`/`USD`) và
  `cfg.locale` (`vi`/`en`).
- **Không quy đổi tỷ giá:** số VND 12.000.000 hiển thị USD vẫn là
  12.000.000 với định dạng `en-US` (12,000,000) — không chia cho tỷ giá,
  không nhân hệ số. Đây là quyết định đã chốt từ v1, giữ nguyên ở v1.1.
- Nhãn trục tiền dùng `fmtShort()` (vd: VND `12tr`, USD `12M`) — hàm này
  đã xử lý 2 locale, không viết lại.
- Khi đổi tiền tệ trong Cài đặt: vẽ lại biểu đồ ngay (`renderCharts()`),
  không cần tải lại app. Kiểm chứng: cùng 1 tháng, đổi VND → USD, số
  lượng giữ nguyên, chỉ đổi dấu phân cách / ký hiệu.
- Trong file xuất CSV (MONEY-REPORT §4): số tiền là số nguyên VND, không
  dùng `fmt()` — biểu đồ và CSV dùng 2 đường định dạng riêng, không lẫn.

---

## 8. Hiệu năng (nhiều job / nhiều khoản)

- **Gom 1 lần, vẽ 1 lần.** `monthlyTotals()` duyệt `txs` 1 lần cho Chart A;
  Chart B duyệt `jobs` 1 lần + gom `txs` theo `jobId` 1 lần (dùng `Map`,
  không gọi `jobThuIn` từng job rồi quét lại toàn bộ `txs` — đó là O(jobs
  × txs)). Chart C sắp xếp `jobs` 1 lần. Tổng: O(txs + jobs) mỗi lần vẽ.
- **Không tính lại khi không cần.** Chỉ gọi `renderCharts()` khi: đổi kỳ
  xem, đổi `currency`/`locale`/dark mode, thêm/sửa/xóa job hoặc khoản thu
  chi, mở tab Tiền bạc lần đầu sau khi dữ liệu đổi. Không vẽ lại khi cuộn
  trang, không vẽ lại khi chạm vào cột (chỉ cập nhật tooltip + bộ lọc).
- **Giới hạn số phần tử SVG.** Chart A tối đa 12 tháng × 3 phần tử
  (2 cột + 1 điểm đường) ≈ 36 phần tử + lưới. Chart B tối đa 6 thanh.
  Chart C tối đa 5 thanh. Tổng < 60 phần tử SVG — nhẹ, không cần ảo hóa
  hay phân trang biểu đồ.
- **Ngưỡng tham chiếu:** 1.000 job + 10.000 khoản thu/chi vẫn phải vẽ xong
  trong < 200ms trên iPhone (đo bằng `performance.now()` quanh
  `renderCharts()`). Nếu vượt: gom theo `Map` đã đủ; không cần Web Worker
  (dữ liệu local nhỏ, không đáng).
- **Không lưu cache số liệu biểu đồ vào `localStorage`.** Tính lại từ
  `jobs`/`txs` mỗi lần vẽ — tránh lệch số khi dữ liệu đổi mà cache chưa đổi.
  (Chỉ lưu `reportRange` vào `cfg`.)
- **Không chặn UI.** Nếu `txs` > 10.000 (hiếm), vẫn tính đồng bộ 1 lần khi
  mở tab — O(n) với n = 10.000 là < 10ms, không cần chia nhỏ.

---

## 9. Tiêu chí kiểm chứng (làm xong mới gọi là xong)

1. **Chart A:** sổ có ≥ 3 tháng dữ liệu thử (nhập tay, không dùng dữ liệu
   mẫu — v1 đã bỏ job/tiền mẫu): biểu đồ 6 tháng hiện đủ tháng, tháng
   trống hiện cột 0, trục tháng liên tục không nhảy tháng; tháng lời âm
   hiện "lỗ" màu đỏ.
2. **Chart A — chạm:** chạm 1 cột hiện đúng số `fmt()` tháng đó; danh sách
   khoản bên dưới lọc đúng theo tháng đó; chạm chỗ trống bỏ lọc.
3. **Chart B:** cộng tay 1 loại (vd: Wedding) khớp số trên màn hình; dòng
   chú thích "chưa trừ chi chung" hiện đúng dưới bảng; đổi chế độ "Lời
   tổng" ↔ "Lời TB/job" thì thứ tự và số đổi đúng.
4. **Chart B — số âm:** tất cả các loại đều lỗ thì bảng vẫn hiện, dòng đầu
   là "lỗ ít nhất", thanh đỏ dài sang trái, cột % hiện `—`.
5. **Chart C:** sắp xếp theo số thiếu giảm dần đúng; job đã `Xong` nhưng
   thiếu tiền nằm ở mục riêng, không vào top 5; bấm "Ghi thu nốt" mở form
   với đúng số còn thiếu; đổi sắp xếp sang "hạn giao gần nhất" thì thứ tự
   đổi đúng.
6. **Không thư viện mới:** `package.json` không thêm dependency nào;
   `grep -i 'chart.js\|echarts\|d3' www/index.html package.json` = 0.
7. **Dark mode:** cùng 1 biểu đồ chụp ở cả 2 mode, mọi chữ đọc được, không
   có cột chìm vào nền; đổi mode vẽ lại ngay không cần tải lại app.
8. **VND/USD:** đổi VND → USD, số lượng giữ nguyên (chỉ đổi định dạng);
   nhãn trục `fmtShort()` đổi theo locale (`12tr` ↔ `12M`).
9. **Hiệu năng:** 1.000 job + 10.000 tx thử, `renderCharts()` < 200ms trên
   iPhone (đo `performance.now()`); cuộn tab Tiền bạc không vẽ lại biểu đồ.
10. **Sổ trống:** cả 3 biểu đồ hiện khung trống + dòng hướng dẫn, không hiện
    trục rỗng, không lỗi console.
11. **Không vỡ v1:** chạy lại test jsdom của app vẫn đạt; 4 ô Thu/Chi/Lời/
    Còn thiếu và danh sách khoản cũ không đổi số; `jobThu`/`jobChi` cũ
    không bị sửa (chỉ thêm `jobThuIn`/`jobChiIn` mới).

---

## 10. Thứ tự đã chốt (nhắc lại từ MONEY-REPORT §6)

- **CSV trước, Excel `.xlsx` sau.** v1.1 chỉ làm CSV (UTF-8 có BOM, mở được
  bằng Excel/Google Sheets). `.xlsx` để v1.2 — cần thêm thư viện (vd:
  SheetJS), tăng kích thước app, phải kiểm chứng riêng trên iOS.
- **Nhắc trong app trước, nhắc đẩy (push) sau.** v1.1 chỉ làm Tầng A —
  thẻ nhắc trên màn hình Hôm nay + mục "Cần thu nốt" (tối đa 1 lần/job/
  ngày, dùng 2 trường mới `lastRemindedAt`/`remindCount`). Nhắc đẩy cần
  plugin Capacitor Local Notifications + quyền thông báo + kiểm chứng trên
  iPhone thật — để sau v1.1, không gộp vào.
- **Không làm ở v1.1:** xem theo tuần; lãi ròng có trừ chi chung; quy đổi
  tỷ giá VND/USD; đổi định dạng sao lưu JSON.

---

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Viết spec code biểu đồ tiền cho FotoBro v1.1 (thu/chi theo
   tháng, top loại job theo lợi nhuận trực tiếp, job còn nợ nhiều nhất),
   dựa đúng thiết kế trong `MONEY-REPORT.md` — chỉ viết 1 file spec, không
   code, không sửa file nào khác.
2. **Đã thực hiện:** Đọc kỹ `MONEY-REPORT.md` (5 mục thiết kế + thứ tự làm
   §6 + tiêu chí kiểm chứng §7); xác nhận trong code thật: dữ liệu
   `jobThu`/`jobChi`/`jobOwe`/`monthOf`/`fmtShort` có sẵn, 0 thư viện biểu
   đồ trong `package.json` (chỉ Capacitor 8 + TypeScript); viết file mới
   duy nhất `~/workspace/fotobro-ios-v1/batch-v11/MONEY-CHARTS.md`.
3. **Kết quả kiểm tra:** File spec đã viết xong: 3 biểu đồ đều có loại biểu
   đồ + dữ liệu đầu vào + cách tính + trường hợp biên; quyết vẽ bằng SVG
   thuần, không thêm dependency (Chart.js/ECharts bị loại rõ lý do);
   dark mode dùng biến CSS của app; VND/USD chỉ đổi định dạng, không quy
   đổi tỷ giá; hiệu năng O(txs + jobs), < 60 phần tử SVG, ngưỡng < 200ms;
   11 tiêu chí kiểm chứng.
4. **Vấn đề còn tồn tại:** (a) `jobThu`/`jobChi` hiện tại không có tham số
   kỳ — Chart B cần thêm `jobThuIn`/`jobChiIn` mới lúc code (đã ghi trong
   spec §2.2, không sửa hàm cũ); (b) Chưa có dữ liệu thử ≥ 3 tháng để kiểm
   chứng Chart A — phải nhập tay lúc code (v1 đã bỏ dữ liệu mẫu);
   (c) Kiểm chứng hiệu năng < 200ms và dark mode cần iPhone thật, không
   kiểm được trên Linux.
5. **Điều kiện chuyển bước:** Việt duyệt spec này (đặc biệt: vẽ SVG thuần
   không thêm thư viện; thứ tự CSV trước Excel, nhắc trong app trước
   push) — xong mới code v1.1 theo thứ tự MONEY-REPORT §6.
6. **Bước tiếp theo:** Code v1.1 theo thứ tự: Chart C (§3) → nhắc trong
   app Tầng A → Chart A (§1) → Chart B (§2) → CSV (§4), kiểm chứng theo
   §9 của file này + §7 của MONEY-REPORT, rồi mới tính nhắc đẩy + `.xlsx`.
7. **Trạng thái:** Spec xong, chưa phải code chạy được. Chỉ viết 1 file
   mới, không sửa bất kỳ file nào khác, không tạo tài khoản, không push
   GitHub.
