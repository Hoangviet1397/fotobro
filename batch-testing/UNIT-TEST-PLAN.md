# UNIT-TEST-PLAN — Hàm tính tiền & hàm pipeline (FotoBro iOS v1)

> **Phạm vi:** kế hoạch test đơn vị (unit test) cho **2 nhóm hàm duy nhất** trong
> `www/index.html`: (A) tính tiền — cọc, còn thiếu, thu/chi theo job, tổng tháng;
> (B) pipeline — nhảy bước, huỷ/khôi phục, job kẹt.
> **Chỉ là kế hoạch — không sửa code, không viết test chạy được ở đây.**
> Mọi tên hàm, công thức và hành vi dưới đây đều đọc từ code thật của app v1
> (`www/index.html`, `APP_VERSION = '1.0'`, dòng 3860), đối chiếu
> `QA-REPORT.md` (101/103 test jsdom đạt, 2 expect lỗi thời) và
> `TESTFLIGHT-CHECKLIST.md` (§2 pipeline, §3 tiền).
> Ngày lập: 20/11/2026. Trạng thái app lúc đọc: `www/index.html` 3.901 dòng.

## 0. Sự thật nền (ground truth) — đọc từ code, không suy đoán

- Pipeline 8 bước, thứ tự cố định (dòng 781):
  `STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']`.
- Loại job `TYPES = Portrait, Couple, Wedding, Lookbook, Event, Khác` (dòng 782);
  hình thức `MEDIUMS = Digital, Film, Cả hai` (dòng 783). Mặc định người mới:
  **mọi bảng giá = 0** (`DEFAULT_CFG`, dòng 815–816), sổ trống (`jobs: []`, `txs: []`).
- `% cọc mặc định 40` (`depositPct: 40`, dòng 818), kẹp tối đa 100
  (`mergeCfg` dòng 830–831; Cài đặt dòng 2416 `Math.min(100, v)`).
- Dữ liệu: job `{id, client, type, medium, stage, cancelled, cancelledFrom,
  stageSince, shootDate, shootTime, deadline, price, ...}`; khoản thu/chi
  `tx {id, kind: 'thu'|'chi', category, jobId ('' = khoản chung), amount, date,
  method, note}`. Khoá lưu `troLyXeo.v1` (dòng 904).
- **Hàm trong app là hàm inline trong 1 file HTML duy nhất, không export module.**
  Muốn test đơn vị phải nạp `index.html` bằng jsdom như file test hiện có
  (`www/test-fotobro-v1.js`, xem §1) rồi seed `state.jobs / state.txs / state.cfg`.
- **Vấn đề cố định của ngày tháng:** `dstr(0)` / `thisMonth()` lấy ngày thật của máy
  (`new Date()`). Mọi test dùng tháng/ngày phải seed dữ liệu **tương đối theo
  `dstr(0)`** (vd: tháng này = `thisMonth()`, hôm qua = `dstr(-1)`), hoặc mock
  `Date` trước khi nạp DOM. Không hard-code `'2026-11'` trong expect.

## 1. Cách chạy test (harness — khuyến nghị, chưa viết)

1. Tái dùng khung của `www/test-fotobro-v1.js`: `JSDOM(html, {runScripts:
   'dangerously'})`, chờ `load`, seed `state` qua `W` (window) rồi gọi hàm.
   Lưu ý: các hàm không gắn lên `window` tường minh mà là `var`/`function` trong
   1 script top-level — trong jsdom chúng thành thuộc tính của `window`
   (file test hiện tại đã dùng `W.mergeCfg(...)`, `W.APP_VERSION`, `W.LS_KEY`).
   Nếu hàm nào không với tới được từ `W`, phải test qua UI (click) thay vì gọi
   trực tiếp — ghi rõ trong từng nhóm dưới đây.
2. Nhóm hàm **thuần** (không chạm DOM): `priceFor`, `jobThu`, `jobChi`, `jobOwe`,
   `totalOwe`, `monthTxs`, `sum`, `monthOf`, `thisMonth`, `stuckInfo`, `isStuck`,
   `isLate`, `biggestChiCat`, `cleanNum`, `cleanData`, `mergeCfg`, `debtorsText`
   (trả chuỗi), `sortJobs` — gọi trực tiếp, assert giá trị trả về.
3. Nhóm hàm **có side-effect DOM** (`setStage`, `jumpToStage`, `jobAction`,
   `renderMoney`): test qua jsdom + stub `actionSheet` (ghi lại `title`/`actions`
   rồi bấm chọn 1 action theo kịch bản) và stub `saveLocal`/`renderAll` nếu cần
   cô lập. Không được bỏ qua nhánh `actionSheet` — đó chính là chỗ chặn tiền
   (xem T-PIP-05).
4. Fixture chung (dùng lại cho mọi nhóm, ngày tính theo `dstr(0)` = hôm nay):
   - Job A: Portrait / Digital, `price = 2.500.000`, stage `Tư vấn`,
     `shootDate = dstr(5)`, `deadline = dstr(19)` (shoot + 14 ngày).
   - Job B: Wedding / Digital, `price = 4.000.000`, stage `Chốt cọc`,
     `shootDate = dstr(2)`.
   - Job C: Couple / Film, `price = 0` (chưa đặt giá film), stage `Tư vấn`,
     không có `shootDate`.
   - Tx: A thu `Cọc 1.000.000` ngày hôm nay; B thu `Cọc 1.000.000` ngày hôm nay;
     A chi `Makeup 500.000` ngày hôm nay; 1 khoản thu chung `Thu khác 200.000`
     tháng này (`jobId = ''`); 1 khoản thu tháng trước (`date` tháng trước).
   - `cfg`: `depositPct = 40`, `prices = {Portrait: 2.500.000, Wedding: 4.000.000,
     ...}`, `pricesFilm` toàn 0 (trừ khi test ghi rõ khác).
5. Quy ước tiền: mọi số là **số nguyên VND**. `fmt()` chỉ đổi hiển thị
   (VND `vi-VN` + `₫` / USD `en-US` + `$`, **không quy đổi tỷ giá**) nên test
   số học **không assert chuỗi `fmt()`** trừ nhóm T-FMT.

---

## 2. Nhóm A — Hàm tính tiền

### A.1. `priceFor(type, medium)` — dòng 789–795

```js
// Digital -> prices[type]; Film -> pricesFilm[type];
// 'Cả hai' -> (digital > 0 && film > 0) ? digital + film : 0
```

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-PRI-01 | `('Portrait','Digital')`, prices.Portrait = 2.500.000 | `2.500.000` |
| T-PRI-02 | `('Portrait','Film')`, pricesFilm.Portrait = 0 (mặc định) | `0` — chưa đặt giá film, **không** fallback sang giá digital |
| T-PRI-03 | `('Portrait','Film')`, pricesFilm.Portrait = 3.000.000 | `3.000.000` |
| T-PRI-04 | `('Portrait','Cả hai')`, digital 2.500.000 + film 3.000.000 | `5.500.000` |
| T-PRI-05 | `('Portrait','Cả hai')`, digital 2.500.000 + film 0 | `0` — thiếu 1 bảng thì chưa tính được (báo giá hiện câu "Chưa đặt giá film…", dòng ~1961) |
| T-PRI-06 | `('Portrait','Cả hai')`, digital 0 + film 3.000.000 | `0` |
| T-PRI-07 | `('Khác','Digital')`, prices.Khác = 0 (không có trong bảng mặc định) | `0` |
| T-PRI-08 | medium lạ (`'Super 8'`, `null`, `''`) | Rơi về nhánh digital (`normMedium` dòng 784 ép về `'Digital'` khi gọi qua `jobMedium`; gọi trực tiếp `priceFor` với medium lạ thì đi nhánh `return d` — **khóa hành vi này bằng test, không sửa**) |
| T-PRI-09 | giá âm / chuỗi trong cfg (`prices.Portrait = -100`, `'2500000'`) | `+x \|\| 0` trong `mergeCfg` ép về số; giá âm → `0` sau `cleanNum` ở job, còn `priceFor` đọc trực tiếp `cfg` — assert giá trị thực tế trả về và ghi chú nếu âm lọt qua |

### A.2. Cọc — 3 chỗ tính cọc trong app (KHÔNG giống hệt nhau — test phải khóa cả 3)

| Chỗ | Công thức (đọc từ code) | Ghi chú |
|-----|--------------------------|---------|
| (a) `setStage` → `Chốt cọc`, dòng 1476 | `dep = Math.round(price * pct / 100 / 10000) * 10000` | Làm tròn tới **10.000đ gần nhất**; mở sẵn form ghi cọc sau 400 ms |
| (b) Báo giá (máy tính giá), dòng ~1960 | `coc = Math.round(total * pct / 100 / 10000) * 10000`, `total = priceFor(...) + giờ*extraHour + điểm*extraLoc + ảnh*retouch + album` | `total` gồm phụ phí; `còn lại = total - coc` |
| (c) `matchJob` (gợi ý ghi tiền từ Gmail), dòng ~3272 | `dep = Math.round(price * pct / 100)` | **Không** làm tròn 10.000đ; khớp nếu `|amount - dep| <= dep * 1%` |

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-DEP-01 | price 2.500.000, pct 40 (a) | `1.000.000` (khớp TESTFLIGHT §3.1: cọc 1.000.000) |
| T-DEP-02 | price 4.000.000, pct 40 (a) | `1.600.000` |
| T-DEP-03 | price 2.555.000, pct 40 (a) | `1.020.000` (1.022.000 làm tròn xuống 10.000đ gần nhất) |
| T-DEP-04 | price 2.545.000, pct 40 (a) | `1.020.000` (1.018.000 làm tròn lên) — cặp với T-DEP-03 để khóa chiều làm tròn của `Math.round` |
| T-DEP-05 | price 10.000, pct 40 (a) | `0` — 4.000đ làm tròn về 0 → form cọc mở với amount 0; assert app không crash và không ghi khoản thu 0đ vào sổ (`cleanData` loại amount ≤ 0) |
| T-DEP-06 | price 0 (chưa đặt giá), pct 40 (a) | `0` |
| T-DEP-07 | price 2.500.000, pct 0 (a) | `0` |
| T-DEP-08 | price 2.500.000, pct 100 (a) | `2.500.000` (cọc = toàn bộ giá) |
| T-DEP-09 | pct 150 trong cfg thô → qua `mergeCfg` | Bị kẹp về `100` (dòng 831); cọc = giá job |
| T-DEP-10 | pct âm / chuỗi rác trong cfg thô → qua `mergeCfg` | `cleanNum` → `0`; cọc = `0` |
| T-DEP-11 | (b) Báo giá: Portrait Digital 2.500.000 + 2 giờ thêm × 300.000 + 1 album 500.000, pct 40 | `total = 3.600.000`, `coc = 1.440.000`, `còn lại = 2.160.000` |
| T-DEP-12 | (b) Báo giá: gói Film chưa đặt giá (`priceFor = 0`) | Hiện câu "Chưa đặt giá film…" thay vì tổng 0đ (dòng ~1961); `coc` tính trên total gồm phụ phí vẫn chạy — assert chuỗi hiển thị, không assert `coc = 0` |
| T-DEP-13 | (c) vs (a): price 2.555.000, pct 40 — (a) ra 1.020.000, (c) ra 1.022.000 | **Chênh 2.000đ giữa 2 công thức.** Test khóa đúng chênh này (đừng "sửa cho khớp" trong lúc test); tiền Gmail về đúng 1.022.000 vẫn khớp job nhờ dung sai 1% (1.022.000 ± 10.220), còn 1.020.000 cũng khớp |
| T-DEP-14 | (c) Tiền về 1.000.000 cho job price 2.500.000 pct 40 | Khớp cọc (chênh 0) → `matchJob` cộng 2 điểm |
| T-DEP-15 | (c) Tiền về 990.000 cho job price 2.500.000 pct 40 | Ngoài dung sai 1% (10.000) → **không** cộng điểm cọc |

### A.3. `jobThu(id)` / `jobChi(id)` — dòng 1015–1016

```js
// jobThu: txs.filter(t => t.kind==='thu' && String(t.jobId)===String(id)).reduce((s,t)=>s+t.amount,0)
// jobChi: tương tự với kind==='chi'
```

| ID | Input (fixture §1) | Kỳ vọng |
|----|---------------------|---------|
| T-THU-01 | Job A, 1 khoản thu Cọc 1.000.000 | `jobThu(A) = 1.000.000` |
| T-THU-02 | Thêm thu 1.500.000 cho A (sau giao) | `jobThu(A) = 2.500.000` |
| T-THU-03 | Khoản thu chung `jobId = ''` 200.000 | Không cộng vào bất kỳ job nào (`jobThu(A)` vẫn 1.000.000) |
| T-THU-04 | Khoản thu gắn `jobId` không tồn tại (job đã xoá, còn sót tx) | Không cộng vào job nào; qua `cleanData` thì `jobId` mồ côi bị ép về `''` (dòng ~895) — test cả 2 lớp: dữ liệu thô qua `cleanData` và `jobThu` trên state đã seed tay |
| T-THU-05 | 2 khoản thu cùng job, khác ngày (tháng này + tháng trước) | `jobThu` cộng **cả 2** (không lọc tháng — lọc tháng chỉ có ở `monthTxs`) |
| T-THU-06 | Job không có khoản thu nào | `0` (không `undefined`/`NaN`) |
| T-THU-07 | `jobId` dạng số vs chuỗi (`id: 101` so với `t.jobId: '101'`) | Khớp nhờ `String(...)` 2 phía — test cả 2 chiều |
| T-CHI-01 | Job A chi Makeup 500.000 | `jobChi(A) = 500.000` |
| T-CHI-02 | Thêm chi Thuê studio 1.000.000 cho A | `jobChi(A) = 1.500.000` |
| T-CHI-03 | Khoản chi chung (`jobId = ''`, vd: Quảng cáo 300.000) | Không cộng vào job nào |
| T-CHI-04 | Khoản chi gắn job B | Không cộng vào A |
| T-CHI-05 | Job không có khoản chi | `0` |
| T-EDGE-AMT-01 | Tx amount âm (`-500.000`) lọt vào `state.txs` bằng tay (không qua UI) | `jobThu`/`jobChi` cộng số âm theo đúng phép cộng (ghi nhận hành vi); còn qua `cleanData` thì khoản đó **bị loại khỏi mảng** (`cleanNum(amount) > 0`, dòng ~893) — 2 lớp phải test riêng, không nhập nhằng |
| T-EDGE-AMT-02 | Tx amount = 0 | Qua `cleanData` bị loại; `jobThu` trên state seed tay cộng 0 → không đổi tổng |
| T-EDGE-AMT-03 | Tx amount thập phân (`1.000.000,5` / `1000000.4`) | `cleanNum` làm tròn `Math.round` → `1.000.001` / `1.000.000` |
| T-EDGE-AMT-04 | Tx amount chuỗi số (`'1000000'`) / chuỗi rác (`'abc'`) | `'1000000'` → `1.000.000`; `'abc'` → `+v = NaN` → `cleanNum = 0` → bị loại khỏi `cleanData` |
| T-EDGE-AMT-05 | Tx amount rất lớn (5.000.000.000, đúng ngưỡng form) / vượt ngưỡng | `cleanNum` không chặn trần — assert cộng đúng; chặn `> 5e9` chỉ có ở parser Gmail, không phải ở sổ tiền |

### A.4. `jobOwe(j)` — dòng 1017: `Math.max(0, (j.price||0) - jobThu(j.id))`

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-OWE-01 | A: price 2.500.000, đã thu 1.000.000 | `1.500.000` (khớp TESTFLIGHT §3.2) |
| T-OWE-02 | A: đã thu đủ 2.500.000 | `0` |
| T-OWE-03 | A: đã thu vượt 3.000.000 (khách chuyển thừa) | `0` — **không âm**, nhờ `Math.max(0, ...)`; tiền thừa vẫn nằm trong `jobThu` (lời job tăng, xem A.6) |
| T-OWE-04 | A: chưa thu đồng nào | `2.500.000` (= giá) |
| T-OWE-05 | Job C: price 0 (chưa đặt giá), đã thu 500.000 | `0` — `max(0, 0 - 500.000)`; job chưa có giá thì không bao giờ "thiếu" |
| T-OWE-06 | Job C: price 0, chưa thu | `0` |
| T-OWE-07 | Job price `null`/`undefined` (dữ liệu cũ thiếu trường) | `(j.price\|\|0)` → `0` → owe `0` |
| T-OWE-08 | Job đã chi nhiều nhưng chưa thu (chi 1.500.000, thu 0) | Owe vẫn = giá (`2.500.000`) — **chi không trừ vào số thiếu**; chi chỉ trừ vào lời (A.6) |
| T-OWE-09 | Job đã thu 1.000.000 + chi 1.500.000 | Owe = `1.500.000` (chỉ phụ thuộc thu, không phụ thuộc chi) |

### A.5. `totalOwe()` — dòng 1037: cộng `jobOwe` của job chưa `Xong` và chưa `cancelled`

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-TOT-01 | Fixture: A thiếu 1.500.000 + B thiếu 3.000.000 (price 4.000.000 − thu 1.000.000) | `4.500.000` |
| T-TOT-02 | Thêm job đã `Xong` còn thiếu 500.000 (bấm Xong kèm cảnh báo, xem T-PIP-05) | **Không** cộng — `totalOwe` loại job `Xong` |
| T-TOT-03 | Thêm job `cancelled` còn thiếu 2.000.000 | **Không** cộng — `totalOwe` loại job đã huỷ |
| T-TOT-04 | Tất cả job đã xong / đã huỷ / đủ tiền | `0` |
| T-TOT-05 | Sổ trống (không job nào) | `0` |
| T-TOT-06 | Job `cancelled` nhưng `stage` vẫn là `Xong` | Không cộng (cả 2 điều kiện đều loại) |
| T-TOT-07 | **Lệch với `debtorsText` (dòng 2005–2009):** job `cancelled` còn thiếu | `totalOwe` = 0 phần job đó, nhưng `debtorsText` lọc chỉ `jobOwe > 0 && stage !== 'Xong'` — **không loại `cancelled`** → job đã huỷ vẫn hiện trong câu trả lời "Ai chưa trả tiền?". Test khóa đúng lệch này để agent chính quyết sửa hay giữ; không tự sửa trong test |

### A.6. Lời — `renderMoney` (dòng 1789–1810) & `dailyReportText` (dòng 1980–1988)

Công thức thật: **lời tháng = `sum(monthTxs('thu')) − sum(monthTxs('chi'))`**;
**lời từng job = `jobThu(id) − jobChi(id)`** (dòng ~1803). Lời job **chưa trừ chi
chung** (vận hành, khấu hao, quảng cáo) — MONEY-REPORT.md §0.3 đã ghi rõ.

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-PRO-01 | Fixture tháng này: thu 2.200.000 (1.000.000 A + 1.000.000 B + 200.000 chung), chi 500.000 | Lời tháng = `1.700.000` |
| T-PRO-02 | Job A: thu 1.000.000, chi 500.000 | Lời job A = `500.000` |
| T-PRO-03 | Job B: thu 1.000.000, chi 0 | Lời job B = `1.000.000` |
| T-PRO-04 | Job chi nhiều hơn thu (thu 500.000, chi 1.200.000) | Lời = `−700.000` — hiện đỏ, dấu `−` (dòng ~1806 dùng `fmtShort(Math.abs(p))` + dấu) |
| T-PRO-05 | Job thu = chi | Lời = `0`, hiện `0₫` (nhánh `p === 0`, dòng ~1806) |
| T-PRO-06 | Job chưa có thu/chi | Lời = `0` |
| T-PRO-07 | Khoản chi chung tháng này 300.000 (Quảng cáo, `jobId = ''`) | Trừ vào **lời tháng** nhưng **không** trừ vào lời của bất kỳ job nào |
| T-PRO-08 | Khoản thu tháng trước | Không vào lời tháng này, nhưng vẫn vào lời job (vì `jobThu` không lọc tháng) — cặp T-PRO-08/T-THU-05 khóa đúng khác biệt này |
| T-PRO-09 | Tháng lỗ (chi > thu) | Lời tháng âm; `dailyReportText` vẫn ghi "lời −X" — test chuỗi chứa số âm đúng, không kỳ vọng chữ "lỗ" (app v1 chưa có chữ đó) |
| T-PRO-10 | `renderMoney`: > 6 job, có job đã xong | Job đã xong gom vào nút "Xem thêm N job đã xong" (`pjFold`, dòng ~1800–1801); bấm nút → hiện đủ. Test đếm dòng trước/sau khi bấm |

### A.7. Tổng tháng — `monthOf` / `thisMonth` / `monthTxs(kind)` / `sum(arr)` — dòng 1033–1036

```js
monthOf(s) = s.slice(0,7); thisMonth() = dstr(0).slice(0,7);
monthTxs(kind) = txs.filter(t => t.kind===kind && monthOf(t.date)===thisMonth());
sum(arr) = arr.reduce((s,t)=>s+t.amount, 0);
```

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-MON-01 | Tx thu ngày `dstr(0)` (hôm nay) | Vào `monthTxs('thu')` tháng này |
| T-MON-02 | Tx thu ngày cuối tháng trước | Không vào tháng này |
| T-MON-03 | Tx thu ngày đầu tháng sau | Không vào tháng này |
| T-MON-04 | Tx `date = ''` qua `cleanData` | `date` mặc định về `dstr(0)` (dòng ~897) → vào tháng này |
| T-MON-05 | Tx `date` sai định dạng (`'20/11/2026'`, `'2026-13-40'`) qua `cleanData` | `cleanDate` → `''` → mặc định `dstr(0)` → vào tháng này (khóa hành vi, không giả định là bị loại) |
| T-MON-06 | `sum([])` | `0` |
| T-MON-07 | `monthTxs('thu')` khi `kind` của tx là giá trị lạ (`'Thu'`, `null`) | `cleanData` ép mọi kind khác `'chi'` về `'thu'` (dòng ~894) — test qua `cleanData`, không test `monthTxs` với kind lạ thô |
| T-MON-08 | Tx ngày 31 của tháng có 31 ngày, chạy test vào tháng 2 | `monthOf` chỉ cắt chuỗi nên không vỡ; test này chỉ cần seed đúng chuỗi ngày, không cần mock lịch |
| T-MON-09 | `biggestChiCat()` (dòng 1893–1900): chi tháng này Makeup 500.000 + Thuê studio 1.000.000 + Makeup 200.000 | Trả `{cat: 'Thuê studio / địa điểm', total: 1.000.000}` — gom theo category trước khi so |
| T-MON-10 | `biggestChiCat()` khi không có chi tháng này | Trả `null` (không crash; dòng nhắc "chưa ghi khoản chi nào" hiện thay) |
| T-MON-11 | `biggestChiCat()` hoà 2 hạng mục cùng tổng | Trả 1 trong 2 (mục đầu gặp với `>` nghiêm ngặt) — assert `total` đúng, không assert tên khi hoà |

### A.8. `cleanNum` / `cleanData` (lớp làm sạch — quyết định số nào được cộng)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-CLN-01 | `cleanNum(2500000)` / `cleanNum('2500000')` / `cleanNum(2500000.6)` | `2500000` / `2500000` / `2500001` (`Math.round`) |
| T-CLN-02 | `cleanNum(0)` / `cleanNum(-100)` / `cleanNum(NaN)` / `cleanNum('abc')` / `cleanNum(null)` | Tất cả `0` |
| T-CLN-03 | `cleanNum(Infinity)` | `0` (`isFinite` chặn) |
| T-CLN-04 | `cleanData` với job trùng `id` | Job trùng id sau được cấp id mới (`pending`, dòng ~882–883, ~900); không mất job, không trùng id |
| T-CLN-05 | `cleanData` với job `stage` lạ (`'Done'`, `''`) | Ép về `'Tư vấn'` (dòng 884) |
| T-CLN-06 | `cleanData` với job `type` lạ | Ép về `'Khác'` (dòng 884) |
| T-CLN-07 | `cleanData` với job `price` âm / chuỗi | `price = 0` |
| T-CLN-08 | `cleanData` với tx `jobId` trỏ tới job không có trong file | `jobId = ''` (khoản chung) |
| T-CLN-09 | `cleanData({jobs: null, txs: 'rác'})` | Trả `{jobs: [], txs: []}` — không throw |
| T-CLN-10 | `cleanData` giữ nguyên `category` lạ (không nằm trong `THU_CATS`/`CHI_CATS`) | Giữ nguyên chuỗi (chỉ cắt 80 ký tự) — app không ép category về danh mục chuẩn; `biggestChiCat` vẫn gom đúng theo chuỗi đó |

### A.9. Hiển thị tiền — `fmt` / `fmtParts` / `fmtShort` / `fmtTiny` (dòng 964–973)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-FMT-01 | `fmt(2500000)`, currency VND | `'2.500.000₫'` (`vi-VN`) |
| T-FMT-02 | `fmt(2500000)`, currency USD | `'$2,500,000'` — **chỉ đổi ký hiệu/chuỗi, số giữ nguyên** (không quy đổi tỷ giá; khớp TESTFLIGHT §7.7) |
| T-FMT-03 | `fmt(-700000)`, VND | Số âm giữ dấu trừ, định dạng `vi-VN` |
| T-FMT-04 | `fmtTiny(1500000)` / `fmtTiny(5000)` / `fmtTiny(500)` | `'1,5tr'` / `'5k'` / `'500'` |
| T-FMT-05 | `fmtShort(1500000)` | Số + đơn vị theo `fmtParts` (tr/…); assert khớp đúng 1 định dạng đã khóa, không assert linh hoạt |

---

## 3. Nhóm B — Hàm pipeline

### B.1. `setStage(j, target, opts)` — dòng ~1460–1486 (hàm trung tâm, có side-effect)

Hành vi thật:
- `ti < 0 || ti === cur` → **không làm gì, return im lặng**.
- `target === 'Xong' && jobOwe(j) > 0 && !opts.force` → mở `actionSheet`
  "Vẫn còn thiếu tiền" (2 lựa chọn: "Thu nốt X trước" / "Vẫn xong, thiếu sau"),
  **chưa đổi stage**.
- Đổi stage thành công → `j.stage = target; j.stageSince = dstr(0); saveLocal();
  renderAll(); refreshJobSheet(); toast(...)`.
- `target === 'Chốt cọc'` → sau 400 ms mở form ghi cọc với số tiền ở T-DEP-01…05.
- `target === 'Đã giao'` → nếu còn thiếu thì toast cảnh báo + `suggestEmail(j,
  'deliver')`; luôn `celebrate`.
- `target === 'Xong'` → `celebrate`.

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-PIP-01 | Job A `Tư vấn` → `setStage(A, 'Chốt cọc')` | `stage = 'Chốt cọc'`, `stageSince = dstr(0)`; form cọc mở sau ~400 ms với amount = cọc làm tròn 10.000đ (dùng `sleep`/`await` trong test jsdom) |
| T-PIP-02 | Job A `Tư vấn` → `setStage(A, 'Tư vấn')` (cùng bước) | Không đổi gì, không toast, không mở form |
| T-PIP-03 | `setStage(A, 'Bước lạ')` (không có trong STAGES) | `ti = -1` → return im lặng, stage giữ nguyên |
| T-PIP-04 | Job B `Chốt cọc` (đã thu cọc 1.000.000, còn thiếu 3.000.000) → `setStage(B, 'Đã giao')` (nhảy qua nhiều bước bằng gọi trực tiếp) | Đổi stage thẳng, không hỏi xác nhận (xác nhận nhảy chỉ có ở `jumpToStage`, không có ở `setStage`); toast nhắc còn thiếu 3.000.000; `suggestEmail` được gọi với `'deliver'` |
| T-PIP-05 | Job B còn thiếu 3.000.000 → `setStage(B, 'Xong')` không `force` | **Không đổi stage**; `actionSheet` mở với title "Vẫn còn thiếu tiền" và msg chứa `fmt(3.000.000)` (khớp TESTFLIGHT §3.5) |
| T-PIP-06 | Tiếp T-PIP-05: chọn "Thu nốt 3.000.000 trước" | Mở form thu với `amount = 3.000.000`, `category = 'Tiền sau buổi chụp'`, `note = 'Thu nốt trước khi xong job'`; stage vẫn chưa `Xong` |
| T-PIP-07 | Tiếp T-PIP-05: chọn "Vẫn xong, thiếu sau" | `setStage` chạy lại với `{force: true}` → stage = `Xong`; job vẫn thiếu 3.000.000 nhưng `totalOwe` không còn cộng nó (T-TOT-02) |
| T-PIP-08 | Job đã thu đủ (owe = 0) → `setStage(job, 'Xong')` | Đổi thẳng sang `Xong`, không hiện actionSheet |
| T-PIP-09 | Job price 0 (owe = 0 theo T-OWE-06) → `setStage(job, 'Xong')` | Đổi thẳng, không cảnh báo — vì `jobOwe = 0` nên khoá chặn tiền không kích hoạt với job chưa đặt giá |
| T-PIP-10 | `setStage` tới `Chốt cọc` khi price 0 | Form cọc mở với amount `0` (T-DEP-06); assert form mở và không ghi khoản 0đ |
| T-PIP-11 | `setStage` đổi bước → `stageSince` | Luôn reset về hôm nay, kể cả khi lùi bước |
| T-PIP-12 | `setStage` từ `Xong` lùi về `Đã giao` (gọi trực tiếp) | Đổi được (khoá `Xong` chỉ chặn chiều **vào** `Xong`, không chặn chiều ra); `stageSince` reset |

### B.2. `jumpToStage(id, ti)` — dòng ~1487–1497 (nhảy thẳng, UI `stepsBar`)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-JMP-01 | Job `Tư vấn` (idx 0) → nhảy tới `Sắp chụp` (idx 2, hơn đúng 1 bước kề + 1) | Mở actionSheet "Nhảy qua 1 bước?" — chưa đổi stage cho tới khi bấm xác nhận |
| T-JMP-02 | Tiếp T-JMP-01: bấm "Nhảy tới 'Sắp chụp'" | Stage = `Sắp chụp`, `stageSince` = hôm nay |
| T-JMP-03 | Tiếp T-JMP-01: bấm Huỷ/đóng sheet | Stage giữ `Tư vấn` |
| T-JMP-04 | Job `Tư vấn` → nhảy tới `Chốt cọc` (idx 1, kề ngay) | Đổi thẳng, **không** hỏi (điều kiện hỏi là `ti > cur + 1`) |
| T-JMP-05 | Job `Đã giao` (idx 6) → nhảy lùi tới `Hậu kỳ` (idx 5) | Đổi thẳng, không hỏi (nhảy lùi không qua cửa xác nhận) |
| T-JMP-06 | Job `Đã giao` → nhảy lùi tới `Tư vấn` (idx 0, lùi 6 bước) | Đổi thẳng, không hỏi — khóa hành vi này (nhảy lùi xa không bị chặn) |
| T-JMP-07 | Job `Xong` → nhảy tới `Đã giao` | Đổi được (không có chặn nào ở `jumpToStage` cho job `Xong`) |
| T-JMP-08 | `jumpToStage(id, cur)` (nhảy tới đúng bước đang đứng) | Return im lặng |
| T-JMP-09 | `jumpToStage(id, 99)` / `ti = -1` | `STAGES[ti]` là `undefined` → `setStage` nhận target lạ → return im lặng (T-PIP-03); assert không throw, stage giữ nguyên |
| T-JMP-10 | Job `cancelled` → nhảy tới bất kỳ bước nào | Return ngay dòng đầu (`if (!j || j.cancelled) return`) — stage và `cancelled` giữ nguyên |
| T-JMP-11 | `jumpToStage` với `id` không tồn tại | Return im lặng, không throw |
| T-JMP-12 | Nhảy tới `Chốt cọc` từ xa (vd: `Tư vấn` → `Chốt cọc` là kề; test `Sắp chụp` → `Chốt cọc` là lùi) | Lùi về `Chốt cọc` **không** mở form ghi cọc lại (form cọc chỉ mở khi `setStage` chạy tới `Chốt cọc` — mà lùi về cũng chạy qua `setStage`, nên form **có** mở; assert đúng hành vi thực tế: form mở cả khi lùi về, không chỉ khi tiến lên) |
| T-JMP-13 | Nhảy thẳng tới `Xong` từ `Tư vấn` khi còn thiếu tiền | `jumpToStage` → `setStage('Xong')` → khoá tiền T-PIP-05 kích hoạt (actionSheet "Vẫn còn thiếu tiền"), stage chưa đổi; sau khi chọn "Vẫn xong" thì xong |

### B.3. `jobAction(act, id)` — dòng ~1498–1530 (`next` / `prev` / `cancel` / `restore` / `del`)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-ACT-01 | `next` ở `Tư vấn` | Sang `Chốt cọc` |
| T-ACT-02 | `next` ở `Xong` (bước cuối) | Giữ `Xong` (`i < STAGES.length - 1` chặn) |
| T-ACT-03 | `prev` ở `Chốt cọc` | Về `Tư vấn` |
| T-ACT-04 | `prev` ở `Tư vấn` (bước đầu) | Giữ `Tư vấn` (`k > 0` chặn) |
| T-ACT-05 | `next` ở `Đã giao` khi còn thiếu tiền | `setStage('Xong')` → khoá tiền kích hoạt (T-PIP-05), chưa xong |
| T-ACT-06 | `cancel` → bấm "Huỷ job này" | `cancelled = true`, `cancelledFrom = <stage lúc huỷ>`; job biến mất khỏi pipeline đang chạy (filter `!j.cancelled` ở `renderJobs` dòng ~1373); **tiền và lịch giữ nguyên** (txs không xoá, `gEventId` không xoá); sheet chi tiết đóng |
| T-ACT-07 | `cancel` → bấm Huỷ/đóng sheet xác nhận | `cancelled` vẫn `false`, stage giữ nguyên |
| T-ACT-08 | `cancel` job đã `Xong` | Vẫn huỷ được (không có chặn theo stage); `cancelledFrom = 'Xong'` |
| T-ACT-09 | `cancel` job đã `cancelled` rồi (gọi lại) | Nút Huỷ không còn hiện trong UI khi `cancelled` (dòng ~1434) — test ở tầng gọi trực tiếp: `cancelled` vẫn `true`, `cancelledFrom` giữ giá trị lần huỷ đầu (không ghi đè nếu gọi lại mà không qua sheet) |
| T-ACT-10 | `restore` job đã huỷ ở bước `Hậu kỳ` | `cancelled = false`, `cancelledFrom = ''`, `stage = 'Tư vấn'` (**luôn về Tư vấn, KHÔNG về `cancelledFrom`** — dòng ~1507), `stageSince = dstr(0)`; job quay lại pipeline đang chạy (khớp TESTFLIGHT §2.8) |
| T-ACT-11 | `restore` job chưa huỷ | Hành vi thực tế: code không kiểm `cancelled` trước khi restore — gọi trực tiếp sẽ ép stage về `Tư vấn` và reset `stageSince`. Khóa hành vi này bằng test (UI không cho bấm vì nút chỉ hiện khi `cancelled`) |
| T-ACT-12 | `restore` job đã huỷ nhưng đã thu cọc | Tiền đã thu giữ nguyên; `jobOwe` tính lại như cũ; `totalOwe` cộng lại job đó |
| T-ACT-13 | `del` → xác nhận xoá | Job biến mất khỏi `state.jobs` **và toàn bộ txs của job bị xoá theo** (dòng ~1512–1513); sheet trong msg xác nhận ghi đúng số khoản kèm theo (`n` khoản) |
| T-ACT-14 | `del` job có `gEventId` | `gCalDelete(gEventId)` được gọi (stub để assert); job không có `gEventId` thì không gọi |
| T-ACT-15 | `del` → bấm Huỷ | Job và txs còn nguyên |
| T-ACT-16 | `jobAction` với `id` không tồn tại | Return ngay (`if (!j) return`), không throw |
| T-ACT-17 | `jobAction('next')` trên job `cancelled` | `setStage` không kiểm `cancelled` — gọi trực tiếp sẽ đổi stage của job đã huỷ. Khóa hành vi này (UI chặn vì job huỷ không có nút Next; `jumpToStage` thì có chặn, `jobAction` thì không) |

### B.4. `stuckInfo(j)` / `isStuck(j)` — dòng 1021–1032 (job kẹt, 3 quy tắc theo thứ tự)

```js
// null nếu: !j, j.cancelled, stage === 'Xong'
// since = stageSince || shootDate || ''; days = max(0, round((today - since)/86400000))
// (1) shootDate < today && stage ∈ {Tư vấn, Chốt cọc, Sắp chụp} -> kẹt
// (2) deadline < today && stage ∉ {Đã giao, Xong} -> kẹt
// (3) days >= 7 -> kẹt ('Đã N ngày ở bước X')
// Ngược lại -> null. Thứ tự (1) -> (2) -> (3) quyết định reason trả về.
```

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-STK-01 | Job `Tư vấn`, `shootDate = dstr(-1)` (qua ngày chụp), `stageSince = dstr(-1)` | Kẹt, reason chứa "Đã qua ngày chụp" (quy tắc 1) |
| T-STK-02 | Job `Sắp chụp`, `shootDate = dstr(-3)` | Kẹt (quy tắc 1, bước `Sắp chụp` vẫn tính) |
| T-STK-03 | Job `Đã chụp`, `shootDate = dstr(-3)` | **Không** kẹt theo quy tắc 1 (bước `Đã chụp` không nằm trong 3 bước đầu) — chỉ kẹt nếu dính quy tắc 2/3 |
| T-STK-04 | Job `Hậu kỳ`, `shootDate = dstr(-30)`, `deadline = dstr(10)` (chưa quá hạn), `stageSince = dstr(-1)` | Không kẹt (quy tắc 1 không áp cho `Hậu kỳ`, quy tắc 2 chưa quá hạn, quy tắc 3 mới 1 ngày) |
| T-STK-05 | Job `Hậu kỳ`, `deadline = dstr(-1)` (quá hạn giao), `stageSince = dstr(-1)` | Kẹt, reason chứa "Đã quá hạn giao" (quy tắc 2) |
| T-STK-06 | Job `Đã giao`, `deadline = dstr(-5)` | **Không** kẹt (quy tắc 2 loại `Đã giao`; `stageSince` mới → quy tắc 3 không dính) |
| T-STK-07 | Job `Tư vấn`, `stageSince = dstr(-7)`, không `shootDate`/`deadline` | Kẹt đúng ngưỡng 7 ngày, reason "Đã 7 ngày ở bước Tư vấn" (quy tắc 3, `>= 7`) |
| T-STK-08 | Job `Tư vấn`, `stageSince = dstr(-6)`, không `shootDate`/`deadline` | Không kẹt (6 < 7) |
| T-STK-09 | Job `Tư vấn`, `stageSince = dstr(-30)` | Kẹt, `days = 30` |
| T-STK-10 | Job `Xong`, `stageSince = dstr(-30)`, `deadline` đã qua | `null` — job xong không bao giờ kẹt |
| T-STK-11 | Job `cancelled`, `stageSince = dstr(-30)` | `null` |
| T-STK-12 | Job không có `stageSince` nhưng có `shootDate = dstr(-10)` | `since` fallback sang `shootDate` → `days = 10`; kẹt theo quy tắc 1 nếu stage thuộc 3 bước đầu, hoặc quy tắc 3 nếu stage khác |
| T-STK-13 | Job không có cả `stageSince` lẫn `shootDate`/`deadline` | `days = 0` → `null` (không kẹt) |
| T-STK-14 | Job `stageSince` là ngày tương lai (`dstr(5)`, dữ liệu lệch) | `days = max(0, số âm) = 0` → không kẹt theo quy tắc 3 |
| T-STK-15 | Job dính cả 3 quy tắc (qua ngày chụp + quá hạn giao + 10 ngày 1 bước) | Reason là của **quy tắc 1** (thứ tự ưu tiên trong code) — assert chuỗi reason, không chỉ assert kẹt/không |
| T-STK-16 | Job `shootDate = dstr(0)` (chụp hôm nay), stage `Sắp chụp` | Không kẹt (`shootDate < today` là nghiêm ngặt; hôm nay chưa tính là "đã qua") |
| T-STK-17 | Job `deadline = dstr(0)` (hạn hôm nay), stage `Hậu kỳ` | Không kẹt (quy tắc 2 cũng nghiêm ngặt `< today`) |
| T-STK-18 | `isStuck(j)` | `true` đúng khi `stuckInfo(j) !== null`, `false` khi `null` — test cả 2 chiều, không test riêng lẻ từng quy tắc ở đây nữa |
| T-STK-19 | `stuckInfo(null)` / `stuckInfo(undefined)` | `null`, không throw |
| T-STK-20 | Job kẹt hiện ở `todayItems()` (dòng ~1173–1175) và `stageTag` (dòng ~1040) | Màn Hôm nay có 1 dòng "Job kẹt: …" với đúng `reason`; tag job hiện "Kẹt ở …" — test ở tầng render (jsdom), không chỉ assert `stuckInfo` |

### B.5. `isLate(j)` — dòng 1018 (quá hạn giao, dùng ở `todayItems` + báo cáo ngày)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-LAT-01 | `deadline = dstr(-1)`, stage `Hậu kỳ` | `true` |
| T-LAT-02 | `deadline = dstr(-1)`, stage `Đã giao` | `false` (đã giao thì không tính trễ) |
| T-LAT-03 | `deadline = dstr(-1)`, stage `Xong` | `false` |
| T-LAT-04 | `deadline = dstr(0)` (hạn hôm nay) | `false` (`<` nghiêm ngặt) |
| T-LAT-05 | Không có `deadline` (`''`) | `false` (không throw) |

### B.6. `sortJobs(list)` — dòng 1360–1369 (thứ tự danh sách job)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-SRT-01 | 1 job `Xong` + 1 job đang chạy | Job đang chạy lên trước, `Xong` xuống cuối |
| T-SRT-02 | 2 job đang chạy: shoot `dstr(2)` và `dstr(5)` | `dstr(2)` trước (ngày gần lên trước) |
| T-SRT-03 | 2 job đang chạy: shoot `dstr(-5)` và `dstr(-1)` | `dstr(-1)` trước (ngày quá khứ gần nhất lên trước — nhánh `ad > bd ? -1 : 1`) |
| T-SRT-04 | Job tương lai vs job quá khứ | Tương lai lên trước, quá khứ xuống sau |
| T-SRT-05 | Job không có `shootDate` | Coi như `'9999'` — xếp cuối nhóm tương lai (sau mọi ngày thật) |
| T-SRT-06 | `sortJobs` không mutate mảng gốc | Mảng gốc giữ nguyên thứ tự (`slice()` trước `sort`) |

### B.7. `todayItems()` — nhắc tiền + nhắc kẹt trên màn Hôm nay (dòng 1157–1177)

| ID | Input | Kỳ vọng |
|----|-------|---------|
| T-TOD-01 | Job `Đã giao` còn thiếu 1.500.000 | Có 1 item "còn thiếu 1.500.000" |
| T-TOD-02 | Job `Hậu kỳ` / `Chọn ảnh` còn thiếu | Có item nhắc thiếu (cả 2 bước đều nằm trong danh sách nhắc) |
| T-TOD-03 | Job `Sắp chụp` còn thiếu 1.500.000 | **Không** có item nhắc thiếu (chỉ nhắc ở `Chọn ảnh`/`Hậu kỳ`/`Đã giao`) — khóa đúng danh sách 3 bước này |
| T-TOD-04 | Job `Xong` còn thiếu (đã xong kèm cảnh báo) | Không có item nhắc thiếu (điều kiện nhắc không loại `Xong` tường minh? Đọc kỹ: nhắc thiếu chỉ khi stage ∈ {Đã giao, Hậu kỳ, Chọn ảnh} nên `Xong` tự loại — assert không có item) |
| T-TOD-05 | Job kẹt (T-STK-01) | Có 1 item "Job kẹt: …" với đúng reason |
| T-TOD-06 | Job đã `Xong` có `shootDate` hôm nay | Không có item "Hôm nay chụp" (điều kiện `stage !== 'Xong'`) |
| T-TOD-07 | Job `deadline` hôm nay, stage `Hậu kỳ` | Có item "Hôm nay tới hạn giao ảnh" |
| T-TOD-08 | Job `deadline` hôm nay, stage `Đã giao` | Không có item tới hạn (điều kiện loại `Đã giao`) |

---

## 4. Trường hợp biên tổng hợp (cross-cutting — phải có trong bộ test)

| ID | Tình huống | Hàm liên quan | Kỳ vọng |
|----|-----------|---------------|---------|
| E-01 | Giá 0 (chưa đặt giá) cho mọi loại | `priceFor`, `jobOwe`, `setStage` | Báo giá = 0 / hiện câu chưa đặt giá film; owe = 0; cọc = 0; sang `Xong` không bị chặn tiền |
| E-02 | Tiền âm (nhập tay qua file sao lưu, không qua UI) | `cleanNum`, `cleanData`, `jobThu` | `cleanData` loại khoản âm/0; job price âm → 0 |
| E-03 | Job không có ngày chụp (`shootDate = ''`) | `stuckInfo`, `sortJobs`, `todayItems`, nút Lịch | Không kẹt theo quy tắc 1; xếp cuối nhóm tương lai; không có nhắc "hôm nay/mai chụp"; bấm thêm lịch → toast "Job này chưa có ngày chụp" (dòng ~1446) |
| E-04 | Job không có hạn giao (`deadline = ''`) | `stuckInfo`, `isLate` | Không kẹt/trễ theo quy tắc 2 |
| E-05 | Khách trả thừa (thu > giá) | `jobOwe`, `totalOwe`, `debtorsText` | Owe = 0; không vào danh sách nợ; lời job tăng đúng số thừa |
| E-06 | Cọc vượt giá (cọc 3.000.000 cho job 2.500.000) | `jobOwe`, `setStage` | Owe = 0; sang `Xong` không bị chặn |
| E-07 | `% cọc = 0 / 100 / >100 / âm` | `mergeCfg`, cọc (a) | 0 → cọc 0; 100 → cọc = giá; >100 → kẹp 100; âm → 0 |
| E-08 | Giá lẻ không chia hết cho 10.000 | Cọc (a) vs (c) | Chênh làm tròn đã khóa ở T-DEP-13; còn lại = `total − coc` (b) không âm |
| E-09 | Sổ trống hoàn toàn | `totalOwe`, `monthTxs`, `sum`, `biggestChiCat`, `renderMoney` | Toàn 0 / `null` / dòng trống "Chưa có khoản nào" — không throw, không `NaN` |
| E-10 | Tháng giao nhau (tx cuối tháng trước / đầu tháng này) | `monthTxs` | Chỉ tháng hiện tại được cộng (T-MON-01…03) |
| E-11 | Job huỷ rồi khôi phục, tiền đã thu giữ nguyên | `jobAction`, `jobOwe`, `totalOwe` | Sau restore: owe như trước khi huỷ; `totalOwe` cộng lại |
| E-12 | Xoá job có txs | `jobAction('del')` | Txs của job bị xoá theo; `jobThu`/`totalOwe` của job khác không đổi |
| E-13 | Job `Xong` nhưng vẫn thiếu tiền | `setStage` (force), `totalOwe`, `debtorsText`, `todayItems` | `totalOwe` loại; `debtorsText` **vẫn liệt kê** (chỉ loại `Xong`? Đọc lại: `debtorsText` lọc `jobOwe > 0 && stage !== 'Xong'` nên job `Xong` **không** vào danh sách — khác T-TOT-07; assert đúng: `Xong` + thiếu → không vào `debtorsText`, nhưng vào mục riêng "Đã xong nhưng vẫn thiếu" chỉ là đề xuất v1.1 trong MONEY-REPORT.md, **chưa có ở v1** — test không được expect mục đó) |
| E-14 | Trùng id job/tx khi nhập file sao lưu | `cleanData` | Id trùng được cấp mới, không mất dữ liệu |
| E-15 | Đổi tiền tệ VND → USD giữa chừng | `fmt` | Số gốc không đổi, chỉ chuỗi hiển thị đổi (T-FMT-02) |
| E-16 | `stageSince` tương lai / `shootDate` tương lai xa | `stuckInfo` | `days` kẹp 0, không kẹt theo quy tắc 3 |

## 5. Ngoài phạm vi (không test ở đây — thuộc agent khác)

- Google 1 chạm (Client ID chung, OAuth, Gmail, Google Lịch): cần tài khoản +
  mạng thật, không test đơn vị được ở jsdom.
- Lịch iPhone native (`importFromNativeCalendar`, plugin Calendar): QA-REPORT.md
  §4.2 đã ghi plugin chưa có trong `package.json`, `Info.plist` thiếu
  `NSCalendarsUsageDescription` — test đơn vị không thay được kiểm chứng native.
- Khoá Face ID / PIN, giọng nói, thông báo, sao lưu/khôi phục JSON
  (`fotobro-sao-luu.json`): thuộc test tích hợp / TestFlight, không thuộc
  2 nhóm hàm này. Chỉ ghi nhận: `cleanData` là cửa ngõ của khôi phục JSON nên
  nhóm A.8 đã cover lớp làm sạch của nó.
- UI/UX (Large Title, dark mode, tab bar mờ): kiểm bằng mắt / TestFlight.
- Hiệu năng, bảo mật, App Store: xem `QA-REPORT.md`, `SECURITY-AUDIT.md`,
  `TESTFLIGHT-CHECKLIST.md`.

## 6. Tiêu chí đạt (definition of done cho người viết test)

1. Mọi test ID từ T-PRI-01 tới T-TOD-08 và E-01…E-16 đều có **đúng 1 assert chính
   + input seed tường minh** (không assert gộp nhiều hàm trong 1 test).
2. Chạy lại toàn bộ bằng 1 lệnh jsdom (theo mẫu `www/test-fotobro-v1.js`),
   **không cần iPhone / mạng / tài khoản**.
3. 2 expect lỗi thời trong file test hiện tại phải được sửa trước khi thêm test
   mới (QA-REPORT.md §4.5): `APP_VERSION` expect `'1.0'` (không phải `'2.6'`),
   job mẫu expect `0` (không phải `5`) — nếu không, bộ test mới sẽ chạy trên
   nền đỏ sẵn và không đọc được kết quả.
4. Các lệch đã phát hiện phải được **khóa bằng test đang pass với hành vi hiện
   tại**, kèm ghi chú "cần quyết" (không tự sửa code trong lúc viết test):
   (i) cọc làm tròn 10.000đ ở `setStage`/báo giá nhưng không làm tròn ở
   `matchJob` (T-DEP-13); (ii) `debtorsText` không loại job `cancelled` trong
   khi `totalOwe` có loại (T-TOT-07); (iii) `jobAction('next'/'prev')` không
   chặn job `cancelled` trong khi `jumpToStage` có chặn (T-ACT-17);
   (iv) nhảy lùi xa không cần xác nhận (T-JMP-06); (v) lùi về `Chốt cọc` vẫn
   mở lại form cọc (T-JMP-12).
5. Mọi test ngày/tháng seed tương đối theo `dstr(0)` — chạy ngày nào cũng xanh,
   không hard-code tháng 11/2026.

## 7. Bảng đếm

| Nhóm | Số test |
|------|--------:|
| A.1 `priceFor` | 9 |
| A.2 Cọc (3 công thức) | 15 |
| A.3 `jobThu` / `jobChi` + amount biên | 17 |
| A.4 `jobOwe` | 9 |
| A.5 `totalOwe` | 7 |
| A.6 Lời job / lời tháng | 10 |
| A.7 Tổng tháng + `biggestChiCat` | 11 |
| A.8 `cleanNum` / `cleanData` | 10 |
| A.9 Hiển thị tiền | 5 |
| B.1 `setStage` | 12 |
| B.2 `jumpToStage` | 13 |
| B.3 `jobAction` | 17 |
| B.4 `stuckInfo` / `isStuck` | 20 |
| B.5 `isLate` | 5 |
| B.6 `sortJobs` | 6 |
| B.7 `todayItems` | 8 |
| §4 Biên tổng hợp | 16 |
| **Tổng** | **190** |

> Lưu ý đếm: §4 là các tình huống cross-cutting, phần lớn đã có test chi tiết
> ở §2–§3; khi viết test thật thì §4 nên tái dùng test §2–§3 thay vì viết
> trùng — số test chạy thực tế kỳ vọng ~150–170 sau khi gộp trùng.

---

## 8. Bổ sung kiểm chứng độc lập (20/11/2026, agent song song thứ hai)

File này đã có sẵn khi agent kiểm chứng độc lập bắt đầu đọc code (ghi lúc
00:24:37 +07 20/11/2026, cùng đợt batch với các file khác trong
`batch-testing/`). Agent thứ hai đã đọc lại code thật (`www/index.html`,
3.901 dòng, `APP_VERSION = '1.0'` dòng 3860) và **xác nhận các khẳng định
chính của §0–§7 là đúng**: `STAGES` 8 bước (dòng 781); giá mặc định 0 mọi gói;
`priceFor` trả 0 khi thiếu 1 bảng ở 'Cả hai' (dòng 789–795); cọc làm tròn
10.000đ ở `setStage` (dòng 1476) nhưng `matchJob` (dòng 3272) không làm tròn;
`jobThu`/`jobChi`/`jobOwe = max(0, price − thu)` (dòng 1015–1017);
`totalOwe` loại job `Xong` và `cancelled` (dòng 1037); `setStage` chặn vào
`Xong` khi còn thiếu tiền (dòng ~1462); `jumpToStage` chỉ hỏi xác nhận khi
`ti > cur + 1` (dòng ~1487); huỷ giữ txs, xoá thì xoá cả txs, khôi phục luôn
về `Tư vấn` (dòng ~1499–1530); `stuckInfo` 3 quy tắc theo thứ tự + ngưỡng
`days >= 7` (dòng 1021–1032); `cleanNum` biến âm/0/NaN thành 0 và
`cleanData` loại tx `amount ≤ 0` (dòng ~876, ~893). Các ca bổ sung dưới đây
là những điểm §1–§7 **chưa cover**, thêm vào chứ không sửa nội dung cũ.

| ID | Hàm / chỗ dùng | Input | Kỳ vọng |
|----|---------------|-------|---------|
| B-01 | `moneyVal` (dòng 1064) | Ô nhập `"500k"` | `500` — chỉ giữ chữ số, không hiểu `k` = nghìn. Khóa hành vi, không "sửa" thành 500.000 |
| B-02 | `fmtParts` (dòng 965–969) | `999500` → `{num:'1', unit:'triệu'}`; `999499` → `{num:'999', unit:'nghìn'}`; `1500000` locale `en` → `{num:'1.5', unit:'M'}`; `-1500000` → dấu trừ là `−` (U+2212) | Khóa đúng ngưỡng 999.500 và dấu thập phân theo locale |
| B-03 | `fmt` (dòng 964) | `2500000.6` | Làm tròn trước khi định dạng → `'2.500.001₫'` |
| B-04 | `openTxForm` → `save()` (dòng ~1762–1772) | Lưu với amount `0` | Không thêm tx, toast "Nhập số tiền trước nha", ô tiền rung (`shake`) |
| B-05 | `openTxForm` → `save()` | Lưu thu làm `jobOwe` về đúng `0` | Nhánh `celebrate('<khách> trả đủ rồi!')` chạy |
| B-06 | `openTxForm` → `save()` | Lưu thu category `'Cọc'` | `suggestEmail(job, 'deposit')` được gọi |
| B-07 | `debtorsText` (dòng 2005–2009) | 1 job `cancelled` thiếu 2.000.000 + 1 job đang chạy thiếu 1.500.000 | Danh sách liệt kê **cả 2 job** (filter chỉ loại `stage === 'Xong'`, không loại `cancelled`), nhưng dòng cuối "Tổng cộng còn thiếu" dùng `totalOwe()` = `1.500.000` → **tổng cuối nhỏ hơn tổng các mục liệt kê**. Khóa đúng mâu thuẫn này để agent chính quyết sửa hay giữ; không tự sửa trong test |
| B-08 | `todayItems` (dòng 1157–1183) + `answer()` (dòng ~2010) | Job đã huỷ có `shootDate` = hôm nay; job đã huỷ còn thiếu tiền ở bước `Đã giao` | Probe (chưa có kỳ vọng): cả 2 vòng lặp của `todayItems` và nhánh "Hôm nay chụp gì?" trong `answer()` đều chỉ loại `stage === 'Xong'`, không kiểm `cancelled` — ghi lại hành vi thực tế trước, rồi quyết kỳ vọng |
| B-09 | `setStage` gọi trực tiếp trên job đã huỷ | `setStage(jobĐãHuỷ, 'Hậu kỳ')` | Probe: `setStage` không có guard `cancelled` (chỉ `jumpToStage` có) — ghi lại hành vi thực tế, đối chiếu với T-ACT-17 |
| B-10 | Công thức cọc — chỗ thứ ba làm tròn 10.000đ | `msgFor` (dòng 3535): `dep = Math.round(price * pct / 100 / 10000) * 10000` | Cùng input giá 2.555.000, pct 40 → `1.020.000`, khớp `setStage` (1476) và máy tính giá (1960); chỉ `matchJob` (3272) lệch → `1.022.000`. Bổ sung cho T-DEP-13: khóa cả 3 chỗ làm tròn, không chỉ 2 |

**Tổng sau bổ sung:** ~190 ca (§7) + 10 ca (§8) = **~200 ca** (trước khi gộp trùng theo lưu ý đếm ở §7).
