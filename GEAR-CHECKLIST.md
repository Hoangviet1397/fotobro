# FotoBro — Checklist đồ nghề theo từng loại job (thiết kế v1.1)

> **Trạng thái: CHỈ LÀ THIẾT KẾ, CHƯA CODE.** Không sửa code app, không thay đổi hành vi v1.
> File này viết cho agent code v1.1 nối tiếp. Mọi dữ kiện "đã có trong v1" đều kiểm chứng
> từ `~/workspace/fotobro-ios-v1/www/index.html` (đọc ngày 20/11/2026).

## 1. Vấn đề v1 đang có gì — và còn thiếu gì

### 1.1. Cơ chế checklist đã có sẵn trong v1 (dùng lại, không viết lại)

| Thành phần | Vị trí trong code v1 | Hành vi hiện tại |
|---|---|---|
| Mẫu checklist theo loại | `CHECKLISTS` (dòng ~1623) | 4 loại: Portrait, Couple, Wedding, Lookbook |
| Tick theo job | `checkDone['job:<id>']` | Mỗi job có tick riêng; job mới tự có danh sách mới, không phải bỏ tick |
| Tick theo loại (danh sách chung) | `checkDone['type:<Loại>']` | Dùng khi chưa chọn job cụ thể |
| Lưu trữ | `checkDone` trong `saveLocal()`, key `troLyXeo.v1` | Tick lưu theo **tên món** (chuỗi), không theo số thứ tự — xem §4.2 |
| Thêm món riêng | `state.cfg.checkExtra[type]` | Người dùng thêm/xoá món cho từng loại |
| Tiến độ | `renderChecklist()` | Thanh tiến độ `nDone/tổng`, thông báo khi tick đủ hết |
| Tự chọn job gần nhất | `checkContext()` / `upcomingShoots()` | Mặc định mở checklist của buổi chụp sắp tới (stage ≤ "Đã chụp") |
| Xoá job | dòng ~1512 | Xoá job thì xoá luôn tick `job:<id>` của nó |

### 1.2. Danh sách mẫu v1 hiện có (giữ nguyên làm gốc)

- **Portrait (8 món):** sạc pin + pin dự phòng · thẻ nhớ đã format + thẻ dự phòng · lens chân dung (85mm/50mm) · lau sensor, kiểm tra máy · trang phục & phụ kiện đã hẹn · địa điểm + giờ ánh sáng đẹp · hoa/đạo cụ theo concept · cọc đã nhận.
- **Couple (8 món):** pin + pin dự phòng · thẻ nhớ dự phòng · lens 35mm + 85mm · trang phục cặp đôi · địa điểm + tuyến di chuyển · đạo cụ (hoa, ô trong, bóng bay) · timeline hoàng hôn · cọc đã nhận.
- **Wedding (9 món):** 2 thân máy + pin sạc đầy · thẻ nhớ nhiều + đã format · đèn flash + pin đèn · lens 24-70 + 85mm · timeline ngày cưới + danh sách người nhà · hợp đồng + SĐT phù rể/người điều phối · đồ dự phòng (kim chỉ, băng keo, sạc) · cọc đã nhận · thỏa thuận giờ ăn/nghỉ ê-kíp.
- **Lookbook (8 món):** shot list · mẫu + makeup xác nhận giờ · phông nền/studio đã đặt · đèn studio + tản sáng · sản phẩm ủi phẳng, đánh số · bàn là hơi/cây lăn bụi · thỏa thuận số ảnh giao + hạn giao · cọc đã nhận.

### 1.3. Thiếu sót cần v1.1 khắc phục (đã kiểm chứng bằng code)

1. **Chưa có loại Event.** `listType(t)` rơi về `'Portrait'` khi job là Event — photographer chụp sự kiện đang tick nhầm danh sách chân dung.
2. **Thiếu chân máy/tripod và đèn ở Portrait/Couple.** Không món nào nhắc chân máy, monopod, đèn LED/flash rời ở 2 loại này; Wedding có flash nhưng không có chân máy.
3. **Không có mục "kiểm tra trước giờ chụp".** Không món nào nhắc test máy/lens/đèn ngay trước buổi chụp, sao lưu thẻ cũ, dọn dung lượng.
4. **Không phân biệt Film/Digital.** Job `medium = 'Film'` / `'Cả hai'` vẫn tick cùng danh sách Digital — thiếu cuộn film, máy film, lab tráng/scan.
5. **Không có cảnh báo khi sắp chụp mà đồ chưa đủ.** Checklist chỉ nằm trong 1 tab riêng; màn Hôm nay và chi tiết job không hiện "còn thiếu X món".
6. **Không có mục đồ nghề gắn với thiết bị của người dùng.** `cfg.equipment[]` (thiết bị + khấu hao) đã có trong Cài đặt nhưng checklist không gợi ý món nào theo máy/lens người dùng thật sự có.

## 2. Thiết kế v1.1 — nguyên tắc

1. **Dùng lại 100% cơ chế v1** (`CHECKLISTS`, `checkDone['job:<id>']`, `cfg.checkExtra`, `renderChecklist()`). Chỉ thay nội dung mẫu + thêm 1 loại mới.
2. **Mỗi loại 10 món, chia 5 nhóm** (mỗi nhóm 2 món) để mắt quét nhanh: (A) Máy & lens · (B) Pin & thẻ · (C) Đèn & chân máy · (D) Đạo cụ & hậu cần · (E) Hành chính & tiền.
3. **Giữ nguyên câu chữ món đã có** (chỉ thêm món mới, không sửa câu cũ) — vì tick lưu theo tên món, sửa câu = mất tick cũ (xem §4.2).
4. **Tối giản, không thêm màn hình mới.** Checklist vẫn ở đúng tab hiện tại; chỉ thêm 1 dòng tóm tắt "còn thiếu X/10 món" ở chi tiết job và màn Hôm nay.
5. **Film là món cộng thêm, không phải danh sách riêng.** Job Film/Cả hai được cộng thêm 2 món film vào cuối danh sách của loại đó (tổng 12 món), thay vì nhân đôi 5 danh sách.

## 3. Danh sách mẫu v1.1 (đề xuất đầy đủ — agent code copy đúng câu chữ này vào `CHECKLISTS`)

Ký hiệu: `●` = món đã có trong v1 (giữ nguyên câu) · `＋` = món mới thêm ở v1.1.

### 3.1. Portrait — 10 món

| Nhóm | # | Món |
|---|---|---|
| A. Máy & lens | 1 | ● Lens chân dung (85mm / 50mm) |
| A. Máy & lens | 2 | ● Máy đã lau sensor, kiểm tra nhanh |
| B. Pin & thẻ | 3 | ● Sạc đầy pin + mang pin dự phòng |
| B. Pin & thẻ | 4 | ● Thẻ nhớ đã format, mang thẻ dự phòng |
| C. Đèn & chân máy | 5 | ＋ Đèn LED/flash rời + pin đèn, đã test sáng |
| C. Đèn & chân máy | 6 | ＋ Chân máy / monopod (nếu chụp phơi sáng hoặc quay) |
| D. Đạo cụ & hậu cần | 7 | ● Trang phục & phụ kiện đã hẹn với khách |
| D. Đạo cụ & hậu cần | 8 | ● Địa điểm + giờ ánh sáng đẹp đã chốt |
| D. Đạo cụ & hậu cần | 9 | ● Hoa / đạo cụ theo concept (sen, lồng đèn…) |
| E. Hành chính & tiền | 10 | ● Cọc đã nhận — kiểm tra trong tab Tiền bạc |

### 3.2. Couple — 10 món

| Nhóm | # | Món |
|---|---|---|
| A. Máy & lens | 1 | ● Lens 35mm + 85mm |
| A. Máy & lens | 2 | ＋ Máy đã lau sensor, kiểm tra nhanh |
| B. Pin & thẻ | 3 | ● Sạc đầy pin + pin dự phòng |
| B. Pin & thẻ | 4 | ● Thẻ nhớ dự phòng |
| C. Đèn & chân máy | 5 | ＋ Đèn flash/LED + pin đèn, đã test sáng |
| C. Đèn & chân máy | 6 | ＋ Chân máy nhẹ (chụp hoàng hôn / phơi sáng) |
| D. Đạo cụ & hậu cần | 7 | ● Trang phục cặp đôi đã thống nhất |
| D. Đạo cụ & hậu cần | 8 | ● Địa điểm + tuyến di chuyển |
| D. Đạo cụ & hậu cần | 9 | ● Đạo cụ: hoa, ô trong, bóng bay… |
| E. Hành chính & tiền | 10 | ● Timeline hoàng hôn đã tính giờ |
| — | — | ● Cọc đã nhận — kiểm tra trong tab Tiền bạc *(món 11 nếu giữ đủ: xem ghi chú dưới)* |

> **Ghi chú Couple:** v1 có 8 món, cộng 3 món mới (2, 5, 6) = 11 món. Để đúng 10 món, agent code
> **gộp món 8 + 10** thành một món: "Địa điểm + tuyến di chuyển, timeline hoàng hôn đã tính giờ".
> Ưu tiên giữ đúng 10 món hơn giữ đủ câu chữ — món gộp này là món mới nên không mất tick cũ.

### 3.3. Wedding — 10 món

| Nhóm | # | Món |
|---|---|---|
| A. Máy & lens | 1 | ● 2 thân máy sẵn sàng, pin sạc đầy hết |
| A. Máy & lens | 2 | ● Lens 24-70 + 85mm |
| B. Pin & thẻ | 3 | ● Thẻ nhớ nhiều + đã format |
| B. Pin & thẻ | 4 | ＋ Thẻ nhớ đã sao lưu buổi trước, còn trống đủ |
| C. Đèn & chân máy | 5 | ● Đèn flash + pin đèn |
| C. Đèn & chân máy | 6 | ＋ Chân máy / monopod cho lễ + tiệc tối |
| D. Đạo cụ & hậu cần | 7 | ● Timeline ngày cưới + danh sách người nhà cần chụp |
| D. Đạo cụ & hậu cần | 8 | ● Đồ dự phòng: kim chỉ, băng keo, sạc dự phòng |
| E. Hành chính & tiền | 9 | ● Hợp đồng + số điện thoại phù rể / người điều phối |
| E. Hành chính & tiền | 10 | ● Cọc đã nhận — kiểm tra trong tab Tiền bạc |
| — | — | ● Thỏa thuận giờ ăn / nghỉ của ê-kíp *(món v1, gộp vào món 7 nếu cần đúng 10 — xem ghi chú)* |

> **Ghi chú Wedding:** v1 có 9 món, cộng 2 món mới (4, 6) = 11 món. Để đúng 10 món, agent code
> **gộp món 7 + món thỏa thuận giờ ăn/nghỉ** thành: "Timeline ngày cưới + danh sách người nhà, giờ ăn/nghỉ ê-kíp đã thỏa thuận".

### 3.4. Lookbook — 10 món

| Nhóm | # | Món |
|---|---|---|
| A. Máy & lens | 1 | ＋ Máy + lens đã test (thường 50mm / 85mm) |
| A. Máy & lens | 2 | ＋ Thẻ nhớ đã format, pin sạc đầy |
| B. Pin & thẻ | 3 | ● Phông nền / studio đã đặt *(chuyển sang nhóm C nếu agent code muốn đúng nhóm — giữ câu)* |
| C. Đèn & chân máy | 4 | ● Đèn studio + tản sáng |
| C. Đèn & chân máy | 5 | ＋ Chân máy (chụp sản phẩm góc cố định) |
| D. Đạo cụ & hậu cần | 6 | ● Shot list từ shop đã in / lưu sẵn |
| D. Đạo cụ & hậu cần | 7 | ● Mẫu + makeup đã xác nhận giờ |
| D. Đạo cụ & hậu cần | 8 | ● Sản phẩm đã ủi phẳng, đánh số thứ tự |
| D. Đạo cụ & hậu cần | 9 | ● Bàn là hơi / cây lăn bụi |
| E. Hành chính & tiền | 10 | ● Thỏa thuận số ảnh giao + hạn giao |
| — | — | ● Cọc đã nhận — kiểm tra trong tab Tiền bạc *(món 11 nếu giữ đủ — xem ghi chú)* |

> **Ghi chú Lookbook:** v1 có 8 món, cộng 3 món mới (1, 2, 5) = 11 món. Để đúng 10 món, agent code
> **gộp món 8 + 9** thành: "Sản phẩm đã ủi phẳng, đánh số — bàn là hơi / cây lăn bụi sẵn sàng".
> Nhóm trong bảng trên chỉ là gợi ý hiển thị; thứ tự món trong mảng `CHECKLISTS` giữ theo nhóm
> A → E để tiến độ tick đi theo trình tự chuẩn bị thật.

### 3.5. Event (MỚI — v1 chưa có) — 10 món

| Nhóm | # | Món |
|---|---|---|
| A. Máy & lens | 1 | 2 thân máy sẵn sàng (1 máy chính + 1 máy dự phòng) |
| A. Máy & lens | 2 | Lens 24-70 + 70-200 (bao quát sân khấu + cận cảnh) |
| B. Pin & thẻ | 3 | Pin sạc đầy hết + pin dự phòng cho cả 2 máy |
| B. Pin & thẻ | 4 | Thẻ nhớ nhiều + đã format, thẻ dự phòng |
| C. Đèn & chân máy | 5 | Đèn flash + pin đèn, đã test sáng |
| C. Đèn & chân máy | 6 | Monopod / chân máy (chụp sân khấu, quay) |
| D. Đạo cụ & hậu cần | 7 | Lịch trình sự kiện + danh sách tiết mục / người phát biểu |
| D. Đạo cụ & hậu cần | 8 | Vị trí đứng đã khảo sát (sân khấu, lối đi, ánh sáng) |
| D. Đạo cụ & hậu cần | 9 | Thẻ đeo / giấy vào khu vực hạn chế (nếu có) |
| E. Hành chính & tiền | 10 | Hợp đồng + SĐT điều phối sự kiện, cọc đã nhận |

### 3.6. Món cộng thêm cho job Film / Cả hai (+2 món, áp dụng cho mọi loại)

Chỉ cộng thêm khi `job.medium === 'Film'` hoặc `'Cả hai'` (trường `medium` đã có trong dữ liệu job v1):

| # | Món |
|---|---|
| F1 | Cuộn film đủ số lượng + đã kiểm tra hạn dùng, ISO đúng |
| F2 | Máy film đã test màn trập + pin, lab tráng/scan đã hẹn |

- Tổng món job Film/Cả hai: **12 món** (10 món loại + 2 món film).
- Tick của 2 món film lưu cùng key `checkDone['job:<id>']` như món thường — không tạo key riêng.
- Job Digital không thấy 2 món này.

## 4. Dữ liệu & lưu trữ (dùng lại cơ chế v1, chỉ thêm 2 điểm)

### 4.1. Mô hình dữ liệu — không đổi cấu trúc

```js
// Mẫu theo loại (mở rộng CHECKLISTS, thêm 'Event', thêm món film riêng)
CHECKLISTS = { Portrait: [...10 món], Couple: [...10 món], Wedding: [...10 món],
               Lookbook: [...10 món], Event: [...10 món] };
FILM_EXTRA = ['Cuộn film đủ số lượng + đã kiểm tra hạn dùng, ISO đúng',
              'Máy film đã test màn trập + pin, lab tráng/scan đã hẹn'];

// Tick theo job (đã có): checkDone['job:<id>'] = { '<tên món>': true/false, ... }
// Tick theo loại (đã có): checkDone['type:<Loại>'] = { ... }
// Món tự thêm (đã có): state.cfg.checkExtra[type] = ['...']
```

- `checkItems(type, job)` mới: `CHECKLISTS[type]` + `cfg.checkExtra[type]` + (`job.medium` là Film/Cả hai thì + `FILM_EXTRA`).
- `listType(t)`: trả về `t` nếu có trong `CHECKLISTS`, còn không thì `'Portrait'` — giữ nguyên, giờ Event đã có trong map nên không còn rơi về Portrait nữa.
- Xoá job: giữ nguyên hành vi v1 — xoá luôn `checkDone['job:<id>']`.

### 4.2. Quy tắc vàng: tick lưu theo tên món — hậu quả khi đổi câu chữ

- Tick lưu theo **tên món** (chuỗi), không theo vị trí. Đổi câu chữ một món = món cũ mất tick, món mới bắt đầu chưa tick.
- Vì vậy §3 giữ nguyên câu chữ món v1; chỉ **thêm món mới** và **gộp món** ở 3 chỗ đã ghi chú (Couple, Wedding, Lookbook). Món gộp là món mới → người dùng tick lại 1 lần, chấp nhận được; ghi rõ trong changelog v1.1 để Việt biết.
- Không được đổi thứ tự món đã có trong mảng (thứ tự không ảnh hưởng tick, nhưng đổi thứ tự làm người dùng quen tay bị loạn).
- Món tự thêm của người dùng (`cfg.checkExtra`) giữ nguyên, hiển thị sau món mẫu như v1.

### 4.3. Hiển thị — thay đổi tối thiểu

1. **Tab checklist hiện tại (giữ nguyên):** thêm tiêu đề nhóm (A–E) làm dòng phân cách, không tách thành 5 tab con. Thanh tiến độ hiện `nDone/tổng` như v1; thêm dòng phụ "Máy & lens 2/2 · Pin & thẻ 1/2…" (tóm tắt theo nhóm, tính từ cùng `checkDone`).
2. **Chi tiết job (mới, 1 dòng):** dưới thanh tiến độ 8 bước, thêm dòng "Đồ nghề: còn thiếu X/10 món" (hoặc "Đủ đồ rồi ✓" khi đủ). Chạm vào dòng → mở tab checklist của job đó (`checkSel = 'job:<id>'`).
3. **Màn Hôm nay (mới, 1 dòng):** job sắp chụp trong 24h tới mà còn thiếu món thì hiện 1 dòng nhắc "Mai chụp [tên khách] — còn thiếu 3 món đồ" trong khu vực việc cần làm. Không tạo loại nhắc mới; dùng chung khu vực nhắc hiện có.
4. **Khi tick đủ hết:** giữ nguyên hành vi v1 (thông báo "Đủ đồ rồi, diễn thôi!"). Không thêm âm thanh hay hiệu ứng mới.

## 5. Luồng người dùng v1.1 (không thêm bước nào)

1. Tạo job → chọn loại (Portrait/Couple/Wedding/Lookbook/Event) + chất liệu (Digital/Film/Cả hai) như v1.
2. Mở tab checklist → mặc định thấy checklist của buổi chụp gần nhất (như v1); job Film/Cả hai thấy thêm 2 món film ở cuối.
3. Tick từng món khi đã chuẩn bị xong; tiến độ cập nhật ngay, lưu local ngay (`saveLocal()` như v1).
4. Trước giờ chụp < 24h: màn Hôm nay nhắc job nào còn thiếu món.
5. Muốn thêm món riêng: nút "Thêm món" có sẵn của v1 (lưu vào `cfg.checkExtra[type]`, áp dụng cho mọi job cùng loại).
6. Muốn làm mới: nút "Làm mới" có sẵn của v1 (bỏ tick hết của job/loại đang xem).

## 6. Kiểm chứng (agent code v1.1 phải chạy trước khi báo xong)

- [ ] `node --check` các script inline trong `www/index.html` vẫn đạt.
- [ ] Chạy lại test jsdom hiện có (bản v1) — số đạt không giảm; cập nhật test nếu test cũ expect đúng 8 món Portrait / không có Event.
- [ ] Đếm món: mỗi loại đúng 10 món (Film/Cả hai: 12); `Object.keys(CHECKLISTS)` = 5 loại.
- [ ] Tạo job Event mới → checklist hiện đúng 10 món Event, không phải Portrait.
- [ ] Tạo job Wedding Film → 12 món (10 + 2 film); đổi job sang Digital → về 10 món, tick 2 món film không hiện (không xoá dữ liệu tick cũ).
- [ ] Tick 1 món của job A → mở job B cùng loại, tick của B không bị ảnh hưởng (key `job:<id>` riêng).
- [ ] Đổi tên 1 món mẫu cũ trong code (test cố tình) → xác nhận tick cũ mất (chứng minh §4.2), rồi hoàn tác — không đưa bản test đó vào code chính.
- [ ] Job chụp trong 24h còn thiếu món → màn Hôm nay hiện dòng nhắc; job đủ món → không hiện.
- [ ] Thêm món tự thêm → chỉ hiện ở loại đó; xoá job → `checkDone['job:<id>']` bị xoá.

## 7. Ngoài phạm vi v1.1 (không làm)

- Không gợi ý món theo thiết bị thật trong `cfg.equipment[]` (để v1.2 — cần map máy/lens người dùng có với món cần).
- Không nhắc đẩy (local notification) riêng cho checklist — dùng dòng nhắc trên màn Hôm nay (§4.3.3); nhắc đẩy đã có thiết kế riêng trong `NOTIFICATIONS.md`.
- Không đồng bộ checklist lên CloudKit — checklist là dữ liệu local, theo job; đồng bộ theo job sẽ đi kèm khi Nấc 2 sync job (xem `CLOUDKIT-PLAN.md`), không làm riêng.
- Không cho sửa mẫu mặc định của từng loại (chỉ thêm món riêng qua `checkExtra` như v1); sửa mẫu mặc định để v1.2.
- Không checklist theo bước pipeline (đã chốt không làm ở v1 — xem `MONEY-REPORT.md`/`VOICE-COMMANDS.md` cùng thư mục về các mục dời sang v1.1/v1.2).

## 8. Ghi chú cho agent code

- File duy nhất cần sửa (dự kiến): `www/index.html` — hàm `CHECKLISTS`, `checkItems()`, `renderChecklist()`, chi tiết job, màn Hôm nay. Không tạo file mới, không đổi key lưu trữ.
- Thứ tự làm đề xuất: (1) thêm Event + món mới vào `CHECKLISTS`, (2) cộng `FILM_EXTRA`, (3) tiêu đề nhóm + tóm tắt theo nhóm, (4) dòng "còn thiếu" ở chi tiết job + Hôm nay, (5) cập nhật test.
- Nếu món gộp ở Couple/Wedding/Lookbook (§3.2–3.4) gây tranh cãi: phương án dự phòng là giữ 11 món cho 3 loại đó (không gộp), ghi rõ trong báo cáo vì sao không đúng 10 — đừng tự ý bỏ món v1 nào để ép đủ 10.
