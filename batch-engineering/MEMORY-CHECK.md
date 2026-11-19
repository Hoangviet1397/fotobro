# MEMORY-CHECK — Kiểm tra bộ nhớ với đủ 60 ảnh trang chủ (FotoBro iOS v1)

> Phạm vi: chỉ là kế hoạch kiểm tra, KHÔNG sửa code app.
> Đối tượng kiểm tra: ảnh trang chủ thêm từ máy, tối đa 60 ảnh, IndexedDB `troLyXeoPhotos`,
> ảnh thu nhỏ cạnh dài nhất 1400px, JPEG q0.85.
> File này không tạo tài khoản, không push GitHub.

## 0. Cơ sở code đã đọc (để biết chỗ nào cần đo — `www/index.html`)

| Hạng mục | Code hiện tại |
|---|---|
| DB / giới hạn | `PHOTO_DB = 'troLyXeoPhotos'`, store `photos` (keyPath `id`), `MAX_PHOTOS = 60` |
| Thu nhỏ khi thêm | `shrinkPhoto()`: `createImageBitmap(file)` → scale `min(1, 1400 / max(w, h))` → canvas → `toBlob('image/jpeg', 0.85)`; có `bmp.close()` |
| Nạp khi mở app | `loadMyShots()`: `idbAll()` → `revokeObjectURL` toàn bộ URL cũ → `map` **mọi** row có `blob` thành `URL.createObjectURL(r.blob)` → `myShots` |
| Hiển thị | `renderShots()`: 1 ảnh hero (`#heroLink img`) + lưới `#myShots` render **cả 60 `<img src="blob:…">`** theo thứ tự mới nhất trước; thẻ `<img>` **không có `loading="lazy"`** |
| Thêm ảnh | `#myShotFile` change: `room = 60 - myShots.length`, tối đa **20 ảnh/lần**, shrink + `idbPut` tuần tự từng ảnh, xong gọi lại `loadMyShots()` (tạo lại toàn bộ URL) |
| Xoá ảnh | ActionSheet "Xoá ảnh này" → `idbDel(id)` → xoá `heroPin` nếu ảnh đang được ghim → `loadMyShots()` (thu hồi + tạo lại toàn bộ URL) |
| Mở lại / qua ngày | `visibilitychange` (app quay lại foreground) và `renderHome()` chỉ gọi `renderShots()` — không tạo URL mới |
| URL khác (đối chứng) | Xuất `.ics` / JSON backup: `createObjectURL` rồi `revokeObjectURL` sau 400 ms; reset dữ liệu: thu hồi hết URL trong `myShots` rồi `deleteDatabase` |

**Điểm nghi ngờ số 1 (trọng tâm của file này): `loadMyShots()` tạo object URL cho cả 60 ảnh ngay lúc
mở app, và `renderShots()` gắn cả 60 URL đó vào DOM cùng lúc — dù người dùng chỉ nhìn thấy 1 ảnh
hero + vài ảnh đầu lưới.** Blob vẫn được giữ bởi URL cho tới khi `revokeObjectURL`; ảnh đã gắn vào
`<img>` còn có thể bị trình duyệt giải mã (decoded bitmap) và giữ trong bộ nhớ.

**Ước tính thô (để đối chiếu khi đo, không phải kết quả):** 1 ảnh 1400px JPEG q0.85 thường
~0,2–0,5 MB trên đĩa → 60 ảnh ~12–30 MB blob; nhưng 1 ảnh 1400×~933 giải mã RGBA ~5 MB →
nếu cả 60 ảnh đều bị giải mã cùng lúc có thể lên tới ~300 MB. Đo thực tế mới kết luận được.

## 1. Mục tiêu & tiêu chí đạt / không đạt

Mục tiêu: xác nhận app không crash / không bị iOS kill (jetsam), không reload trắng trang,
không lag rõ rệt khi kho ảnh đầy 60 ảnh, và RAM trở về gần mức ban đầu sau khi xoá ảnh / đóng-mở lại.

| Chỉ số | Cách đo | Ngưỡng đạt (đề xuất — ghi số đo thực tế vào bảng §5) |
|---|---|---|
| RAM lúc mở app, 60 ảnh | Xcode Instruments / Safari Inspector (xem §3) | Không tăng vọt vô hạn; đỉnh < ~250 MB trên máy test và không bị kill trong 5 lần mở liên tiếp |
| RAM sau khi lướt hết lưới 60 ảnh rồi quay về đầu | Cùng công cụ, đo trước/sau | Tăng thêm < 50 MB so với lúc vừa mở; quay về gần mức ban đầu sau 30 giây không chạm |
| RAM sau 5 chu trình thêm 10 → xoá 10 | Cùng công cụ | Sau mỗi chu trình quay về ±20 MB so với chu trình trước; không tăng bậc thang |
| Crash / reload | Quan sát + log jetsam | 0 lần crash, 0 lần WKWebView reload trắng trong toàn bộ kịch bản |
| Lướt lưới | Quan sát + FPS (Instruments) | Không khựng > 500 ms, không thấy ảnh trắng/nhấp nháy hàng loạt khi cuộn nhanh |
| Số object URL sống | Đếm `createObjectURL` / `revokeObjectURL` (xem §4.6) | Số URL sống ≈ số ảnh trong DB (60, không phải 120/180 sau nhiều lần nạp lại); sau xoá 1 ảnh giảm đúng 1 |

Nếu bất kỳ hàng nào không đạt → ghi vào §6, chuyển sang hướng sửa ở §7, không tự sửa code trong đợt này.

## 2. Chuẩn bị

### 2.1 Thiết bị & bản build
- [ ] iPhone thật (ghi rõ model + iOS, ví dụ iPhone … / iOS …), dung lượng trống ≥ 2 GB.
- [ ] Build FotoBro iOS v1 đúng commit đang kiểm tra (ghi commit/build number vào bảng kết quả).
- [ ] Tắt các app nặng khác; tắt Low Power Mode trong lúc đo (ghi lại nếu bật).
- [ ] Chuẩn bị sẵn cách mở Safari Web Inspector / Xcode Instruments trên máy Mac nối với iPhone
      (xem §3 — nếu không có Mac, dùng phương án quan sát §3.3 và ghi rõ hạn chế).

### 2.2 Bộ ảnh test — 60 ảnh
- [ ] 60 ảnh thật từ máy ảnh/điện thoại, đủ loại: chân dung, phong cảnh, tối/sáng, ảnh dọc + ảnh ngang,
      kích thước gốc lớn (≥ 3000px cạnh dài, có cả HEIC/JPG/PNG) để `shrinkPhoto()` phải thu nhỏ thật.
- [ ] Ghi lại: tổng dung lượng 60 ảnh gốc, dung lượng sau khi app thu nhỏ (ước lượng qua
      `IndexedDB → troLyXeoPhotos → photos` trong Inspector, nếu xem được).
- [ ] Đặt tên file theo số thứ tự `01.jpg … 60.jpg` để dễ đối chiếu khi xoá/kiểm đếm.
- [ ] Chuẩn bị thêm 10 ảnh dự phòng cho kịch bản thêm/xoá lặp lại.

### 2.3 Dọn trạng thái trước mỗi kịch bản
- Trước kịch bản A: xoá hết ảnh trong app (hoặc reset DB) → đo baseline 0 ảnh.
- Trước mỗi lần đo: kill app hoàn toàn (vuốt tắt khỏi multitasking) rồi mở lại từ icon,
  chờ trang chủ hiện đủ rồi mới bắt đầu đo — không đo trên app đã chạy nền lâu.

## 3. Cách đo RAM (chọn ít nhất 1 cách chính + 1 cách đối chứng)

### 3.1 Cách chính: Xcode Instruments (khuyên dùng)
1. Nối iPhone với Mac, mở Xcode → Product → Profile (hoặc Instruments → Allocations / VM Tracker).
2. Chọn target là app FotoBro đang chạy (WKWebView process).
3. Ghi: **Physical Memory / Dirty Size / Resident** tại các mốc trong §4 (trước mở, sau mở 10 s,
   sau lướt hết lưới, sau thêm, sau xoá, sau 30 s nghỉ).
4. Bật thêm **Leaks** hoặc xem Allocations → tìm `VM: ImageIO / CoreGraphics / CG image`
   tăng bất thường khi lướt ảnh.

### 3.2 Cách đối chứng: Safari Web Inspector (JS heap)
1. iPhone: Cài đặt → Safari → Nâng cao → bật Web Inspector. Mac: Safari → Develop → [iPhone] → FotoBro.
2. Tab Timelines / Memory: chụp **JS Heap** tại các mốc như §3.1.
3. Lưu ý: JS heap không phản ánh hết bộ nhớ ảnh đã giải mã / bộ nhớ native của WKWebView —
   chỉ dùng để đối chiếu xu hướng, không thay cho Instruments.
4. `performance.memory` **không có** trên iOS Safari/WKWebView — không dùng.

### 3.3 Cách quan sát khi không có Mac (ghi rõ là hạn chế)
- Đếm số lần app bị văng về màn hình chính / reload trắng / ảnh hiện chậm-trắng khi lướt.
- Dùng iPhone: Cài đặt → Quyền riêng tư & Bảo mật → Phân tích & Cải tiến → Dữ liệu Phân tích →
  tìm log `JetsamEvent` có tên FotoBro trong khoảng thời gian test.
- Cách này chỉ kết luận được "có/không bị kill", không đo được MB — ghi rõ vào kết quả.

## 4. Kịch bản kiểm tra

### Kịch bản A — Mở app (baseline → 60 ảnh)
1. Baseline: 0 ảnh. Kill app → mở → chờ 10 s → ghi RAM (A0).
2. Thêm 10 ảnh → kill app → mở → chờ 10 s → ghi RAM (A10).
3. Thêm tiếp tới 30 ảnh → kill app → mở → chờ 10 s → ghi RAM (A30).
4. Thêm tiếp tới đủ 60 ảnh → kill app → mở → chờ 10 s → ghi RAM (A60).
5. Mở lại 5 lần liên tiếp (mỗi lần kill app rồi mở lại, chờ 10 s) với 60 ảnh → ghi RAM mỗi lần.
   - Đạt: RAM 5 lần xấp xỉ nhau, không tăng bậc thang, không crash.
   - Không đạt: RAM tăng dần mỗi lần mở, hoặc có lần bị kill/reload.

### Kịch bản B — Lướt ảnh (lưới 60 ảnh)
1. Từ trạng thái 60 ảnh (sau A60), ghi RAM lúc vừa mở (B0).
2. Cuộn chậm từ đầu lưới xuống cuối, dừng 2 s mỗi ~10 ảnh → ghi RAM ở cuối lưới (B1).
3. Cuộn nhanh lên-xuống hết lưới 3 vòng liên tiếp → ghi RAM ngay sau đó (B2).
4. Để yên 30 s không chạm → ghi RAM (B3, kiểm tra bộ nhớ có tự giải phóng không).
5. Chạm vào 1 ảnh → "Đặt làm ảnh hôm nay" → quay lại trang chủ → ghi RAM (B4).
   - Đạt: B2 − B0 < 50 MB; B3 quay về gần B0; không ảnh trắng hàng loạt, không khựng > 500 ms.

### Kịch bản C — Thêm ảnh (đủ 60, thêm từng đợt)
1. Từ 50 ảnh: thêm 10 ảnh (1 lần, tối đa 20/lần) → ghi RAM trong lúc thêm + sau khi thêm xong 10 s (C1).
2. Thử thêm khi đã đủ 60 ảnh: chọn thêm 5 ảnh → app phải báo "Đã đủ 60 ảnh — xoá bớt rồi thêm nha"
   và **không** tăng RAM, không thêm ảnh mới (C2).
3. Thử thêm 25 ảnh cùng lúc khi còn trống 10 chỗ: app chỉ được thêm tối đa 10 ảnh (giới hạn
   `min(room, 20)`) → kiểm đếm số ảnh sau khi thêm = 60 (C3).
   - Ghi thêm: thời gian thêm xong 10 ảnh, có toast "Đã thêm … ảnh" không, ảnh mới có hiện ở đầu lưới không.

### Kịch bản D — Xoá ảnh
1. Từ 60 ảnh: xoá 1 ảnh đang là ảnh hero hôm nay (đã ghim) → ghi RAM trước/sau, kiểm tra:
   hero có đổi sang ảnh khác không, `heroPin` có bị xoá không, số ảnh còn 59 (D1).
2. Xoá tiếp 9 ảnh (còn 50) → ghi RAM sau mỗi 3 ảnh, kiểm tra RAM có giảm dần không (D2).
3. Xoá hết 60 ảnh → kill app → mở lại → ghi RAM, đối chiếu với baseline A0 (D3).
   - Đạt: sau D3 RAM quay về gần A0 (±20 MB); số ảnh hiển thị = 0; không còn ảnh cũ hiện lại.

### Kịch bản E — Chu trình dài / stress (rò rỉ tích luỹ)
1. Từ 50 ảnh, lặp 5 chu trình: thêm 10 ảnh → lướt hết lưới 1 vòng → xoá 10 ảnh vừa thêm.
   Ghi RAM ở cuối mỗi chu trình (E1…E5).
   - Đạt: E5 ≈ E1 (±20 MB). Không đạt: RAM tăng bậc thang qua các chu trình → rò rỉ.
2. Chuyển app sang nền (Home) 2 phút → mở lại → ghi RAM; lặp 3 lần.
   - Lưu ý: `visibilitychange` chỉ gọi `renderShots()` nên không được tạo URL mới — RAM không được tăng vọt.
3. Đổi ngày (hoặc đợi qua ngày / đổi giờ máy test nếu được): hero phải đổi sang ảnh khác theo vòng xoay
   mà không tạo thêm URL mới ngoài 60 URL hiện có.

## 5. Bảng ghi kết quả (điền khi chạy test)

| Mốc | Số ảnh | RAM (MB) | JS Heap (MB) | Ghi chú / hiện tượng |
|---|---|---|---|---|
| A0 baseline 0 ảnh | 0 | | | |
| A10 | 10 | | | |
| A30 | 30 | | | |
| A60 lần 1 | 60 | | | |
| A60 lần 2–5 (mở lại) | 60 | | | |
| B0 vừa mở, 60 ảnh | 60 | | | |
| B1 cuối lưới (cuộn chậm) | 60 | | | |
| B2 sau 3 vòng cuộn nhanh | 60 | | | |
| B3 nghỉ 30 s | 60 | | | |
| B4 sau "Đặt làm ảnh hôm nay" | 60 | | | |
| C1 sau thêm 50→60 | 60 | | | |
| C2 thêm khi đã đủ 60 | 60 | | | Bị chặn đúng không? |
| C3 thêm 25 khi còn trống 10 | 60 | | | |
| D1 xoá 1 ảnh hero | 59 | | | |
| D2 xoá còn 50 | 50 | | | |
| D3 xoá hết, mở lại | 0 | | | So với A0: |
| E1…E5 (5 chu trình) | 50 | | | |

Thiết bị test: iPhone … / iOS … · Build FotoBro: … · Ngày test: … · Người test: …

## 6. Điểm rò rỉ cần xem (checklist — đánh dấu ĐẠT / KHÔNG ĐẠT từng điểm)

### 6.1 Trọng tâm: tạo object URL cho cả 60 ảnh lúc mở app
- [ ] `loadMyShots()` tạo đúng 60 URL khi đủ 60 ảnh (không tạo trùng, không tạo thừa).
      Kiểm tra bằng cách đếm `createObjectURL`/`revokeObjectURL` trong 1 phiên mở app
      (xem §4.6 — tạm thời chèn log đếm trong bản test, gỡ trước khi release).
- [ ] Khi gọi lại `loadMyShots()` (sau thêm/xoá), URL cũ được `revokeObjectURL` **trước** khi tạo URL mới
      (code hiện tại đã làm đúng thứ tự này — kiểm tra thực tế có đúng không).
- [ ] Sau 5 lần mở app liên tiếp, số URL sống không tăng (không phải 120/180/300).
- [ ] Sau khi xoá 1 ảnh, số URL sống giảm đúng 1 (còn 59), không còn URL trỏ tới blob đã xoá.
- [ ] Sau reset/xoá hết dữ liệu, số URL sống về 0.

### 6.2 Ảnh giải mã & render lưới
- [ ] Lưới `#myShots` render cả 60 `<img>` cùng lúc — kiểm tra RAM tăng bao nhiêu khi cuộn
      (B1/B2) so với lúc vừa mở (B0); nếu tăng lớn → nghi ảnh bị giải mã hàng loạt.
- [ ] Thẻ `<img>` trong lưới không có `loading="lazy"` — ghi nhận là điểm cần cân nhắc sửa (§7).
- [ ] Ảnh hero chỉ dùng 1 URL trong 60 URL (không tạo URL riêng cho hero).

### 6.3 Thêm ảnh — `shrinkPhoto()`
- [ ] `createImageBitmap` + canvas được giải phóng sau mỗi ảnh (`bmp.close()` đã có — kiểm tra
      RAM trong lúc thêm 10–20 ảnh có tăng rồi giảm về không, hay tăng rồi giữ nguyên).
- [ ] Thêm 20 ảnh/lần không làm app đơ/crash giữa chừng; nếu đơ → ghi rõ thêm tới ảnh thứ mấy thì đơ.

### 6.4 Xoá / ghim / mở lại
- [ ] Xoá ảnh đang ghim làm hero: `heroPin` được xoá, hero đổi sang ảnh khác, không còn URL trỏ tới ảnh đã xoá.
- [ ] `renderShots()` khi quay lại foreground không tạo URL mới (chỉ gán lại `src` đã có).
- [ ] `renderHome()` gọi `renderShots()` nhiều lần không nhân bản `<img>` hay URL.

### 6.5 URL ngoài ảnh (đối chứng — phải sạch)
- [ ] Xuất `.ics` / JSON backup: URL bị thu hồi sau 400 ms, không tích luỹ sau nhiều lần xuất.
- [ ] Ảnh xem trước khi thêm (`img.src = URL.createObjectURL(f)` ở khu vực xem trước):
      kiểm tra có được thu hồi khi đóng xem trước / chọn ảnh khác không — nếu không, ghi vào §7.

### 6.6 Cách đếm URL sống (chỉ dùng cho bản test, không đưa vào bản release)
```js
// Chèn tạm ở đầu www/index.html (bản test nội bộ), gỡ trước khi release:
let __urlLive = 0;
const __create = URL.createObjectURL.bind(URL);
const __revoke = URL.revokeObjectURL.bind(URL);
URL.createObjectURL = (b) => { __urlLive++; console.log('[URL] +1 live=', __urlLive); return __create(b); };
URL.revokeObjectURL = (u) => { __urlLive--; console.log('[URL] -1 live=', __urlLive); return __revoke(u); };
```
Đọc `__urlLive` trong Safari Web Inspector Console tại mỗi mốc §5; số này phải ≈ số ảnh trong DB.

## 7. Nếu không đạt — hướng sửa đề xuất (chưa làm trong đợt này)

Chỉ làm khi có ít nhất 1 kịch bản ở §4 không đạt, và Việt duyệt hướng sửa trước khi sửa:

1. **Ưu tiên 1 — lazy URL + lazy ảnh:** chỉ tạo object URL cho ảnh hero + ảnh đang hiển thị
   trong viewport (IntersectionObserver), thu hồi URL khi ảnh cuộn ra khỏi màn hình;
   thêm `loading="lazy"` cho `<img>` trong lưới.
2. **Ưu tiên 2 — thumbnail riêng cho lưới:** lưu thêm 1 bản thumbnail nhỏ (~400–600px) cho lưới,
   giữ bản 1400px chỉ cho ảnh hero; lưới 60 ảnh sẽ nhẹ hơn nhiều.
3. **Ưu tiên 3 — không tạo lại toàn bộ URL sau thêm/xoá:** chỉ tạo URL cho ảnh mới thêm,
   chỉ thu hồi URL của ảnh vừa xoá (thay vì `revoke` + tạo lại cả 60 URL trong `loadMyShots()`).
4. **Ưu tiên 4 — giới hạn giải mã:** nếu Instruments cho thấy `CG image` tăng vọt khi cuộn,
   cân nhắc phân trang lưới (hiện 20 ảnh/lần + nút "Xem thêm") thay vì render cả 60 ảnh cùng lúc.
5. Không giảm giới hạn 60 ảnh và không giảm 1400px khi chưa có số đo thực tế chứng minh cần giảm —
   quyết định dựa trên bảng §5, không dựa trên cảm tính.

## 8. Kết thúc kiểm tra

- [ ] Đã điền đủ bảng §5 (ít nhất các mốc A/B/C/D; E làm nếu có thời gian).
- [ ] Đã đánh dấu checklist §6 (ghi rõ ĐẠT / KHÔNG ĐẠT + số đo).
- [ ] Đã gỡ đoạn đếm URL §6.6 khỏi bản test (nếu có chèn).
- [ ] Kết luận 1 dòng: ĐẠT / KHÔNG ĐẠT + mốc RAM cao nhất ghi được + có/không bị kill.
- [ ] Nếu KHÔNG ĐẠT: ghi rõ kịch bản nào lỗi + hướng sửa ở §7 được chọn để làm tiếp.
