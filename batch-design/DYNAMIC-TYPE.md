# FotoBro iOS v1 — Kế hoạch sửa cỡ chữ theo Dynamic Type

> **Đây là KẾ HOẠCH, chưa code.** File này chỉ mô tả việc cần làm; chưa sửa bất kỳ dòng nào trong `www/index.html`. Agent chính sửa code theo thứ tự ở mục 3, rồi kiểm lại theo tiêu chí mục 4.
>
> Nguồn rà soát: `~/workspace/fotobro-ios-v1/ACCESSIBILITY.md` (mục 2.1, 2.2, 2.4, 3.4) — file app `~/workspace/fotobro-ios-v1/www/index.html` (3.860 dòng, kiểm tra 20/11/2026).
>
> Vấn đề gốc: **95–96 chỗ `font-size` dùng `px` (12–42px), 0 chỗ dùng `rem`**; viewport khoá zoom (`maximum-scale=1, user-scalable=no`, dòng 25). Bật Cài đặt iOS → Trợ năng → Chữ lớn thì app không to ra; người thị lực kém cũng không pinch-zoom được. Vi phạm WCAG 1.4.4.

## 1. Nguyên tắc

- **Gốc quy đổi: 1rem = 16px** (mặc định của trình duyệt). `rem = px / 16`. Không đặt `font-size` cố định bằng `px` cho thẻ `html` — để `html { font-size: 100% }` (hoặc không khai báo), nếu không `rem` sẽ không theo hệ thống.
- Đổi **mọi** `font-size: …px` sang `rem`, kể cả `font-size` viết inline trong JS (dòng 1375, 1944, 3135 — các chuỗi `style="font-size:19px"`…).
- Giữ nguyên `line-height` dạng không đơn vị (1.15, 1.2, 1.38…) đã có sẵn — chữ to lên thì giãn dòng tự theo.
- Chỗ nào đang `white-space: nowrap` (`.nav-t`, `.tagp`, nút pill…) thì kiểm tra riêng ở cỡ chữ lớn nhất: chữ dài sẽ tràn hoặc bị cắt — ưu tiên cho xuống dòng hoặc thu gọn bằng ellipsis có `title`/`aria-label` đầy đủ.
- Không đổi màu chữ, không đổi layout trong đợt này (màu tương phản là lỗi riêng, mục 2.3 của ACCESSIBILITY.md).

## 2. Bảng quy đổi px → rem

Đếm thực tế trong `index.html`: 15px ×23, 13px ×17, 17px ×16, 16px ×10, 14px ×7, 12px ×6, 26px ×3, 19px ×3, 28px ×2, 22px ×2, 21px ×2, 42px ×1, 34px ×1, 31px ×1, 24px ×1, 10.5px ×1.

### 2.1 Tiêu đề

| Vai trò | Ví dụ trong code | px hiện tại | rem sau khi đổi |
|---|---|---|---|
| Tiêu đề lớn (Large Title) | `.lt h1` (dòng 110) | 34px | **2.125rem** |
| Tiêu đề màn chào | `.welcome h1` (dòng 434) | 31px | **1.9375rem** |
| Tiêu đề phụ màn chào / số lớn trong tile | `.welcome h2` (436), `.tile .tv` (169) | 28px | **1.75rem** |
| Tiêu đề màn khoá / đơn vị tiền | `.lk-in h2` (493), `.amount .cur` (277) | 26px | **1.625rem** |
| Tiêu đề chi tiết job | `.jd-head h2` (dòng 250) | 24px | **1.5rem** |
| Tiêu đề mục | `.sec-h h2` (dòng 116), ô nhập PIN `#lkPinForm input` (496) | 22px | **1.375rem** |
| Chú thích ảnh hero | `.hero .hero-cap b`, `.hero figcaption b` (206, 209) | 21px | **1.3125rem** |
| Nút action sheet / tiêu đề trạng thái trống | `.ag button` (358), `.b` trong empty-state (1375, 3135) | 19px | **1.1875rem** |

### 2.2 Nội dung

| Vai trò | Ví dụ trong code | px hiện tại | rem sau khi đổi |
|---|---|---|---|
| Nội dung chính (body) — cỡ gốc của app | `body` (dòng 73), `.nav-t` (100), `.row .t1` (132), nút `.btn` (174), nhãn + ô nhập `.frow` (260–261, 269) | 17px | **1.0625rem** |
| Nội dung thứ cấp | `.row .val` (135), `.note-txt` (256), `.tpl b` (286), `.dept-lines li` (289), `.q-txt` (387) | 16px | **1rem** |
| Nội dung nhỏ / chữ trong hàng | các chỗ 15px (×23 — nhóm đông nhất, gồm chữ phụ trong empty-state dòng 1375) | 15px | **0.9375rem** |
| Chữ phụ trong form / ghi chú | các chỗ 14px (×7) | 14px | **0.875rem** |
| Chữ phụ nhỏ | các chỗ 13px (×17 — gồm `.job-val .owe` số tiền nhỏ) | 13px | **0.8125rem** |

### 2.3 Chữ phụ, nhãn, số liệu

| Vai trò | Ví dụ trong code | px hiện tại | rem sau khi đổi | Ghi chú |
|---|---|---|---|---|
| Chữ rất phụ (tag, caption, ngày, chân trang) | `.tagp` (150), `.moments .shot span` (222), `.chat-day` (300), `.q-lbl` (386), `.foot` (499) | 12px | **0.75rem** | Chỉ dùng cho chữ thực sự phụ, không dùng cho nội dung chính |
| Số thứ tự bước nhảy pipeline | `.steps.jump button` (231) | 12px | **0.75rem** | Kèm sửa chiều cao ở mục 3 bước 4 (28px → tối thiểu 44px) |
| **Nhãn tab dưới** | `.tabbar button` (dòng 328) | 10.5px | **0.6875rem (11px)** | **Nâng sàn lên 11px** theo ACCESSIBILITY.md mục 2.4 (tối thiểu 11–12px), không giữ 10.5px |
| Số tiền lớn nhất | `.amount` (dòng 276) | 42px | **2.625rem** | Số tiền to, kiểm tra tràn ở cỡ AX5 (dãy số dài + đơn vị tiền) |

### 2.4 Những chỗ KHÔNG đổi sang rem

- `letter-spacing` (`.3em`, `-.02em`…) đã là đơn vị tương đối — giữ nguyên.
- `line-height` không đơn vị — giữ nguyên.
- Kích thước icon SVG, `border-radius`, `padding` bằng px — không thuộc phạm vi đợt này, trừ khi gây kẹt layout ở cỡ chữ lớn (xem mục 3 bước 4).

## 3. Thứ tự sửa

Làm đúng thứ tự — bước trước là điều kiện của bước sau. Không gộp bước 1–2 với bước 3.

### Bước 1 — Mở zoom ở viewport (làm trước, 1 dòng)
- Dòng 25, từ:
  `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`
  thành:
  `width=device-width, initial-scale=1, viewport-fit=cover`
- Chỉ bỏ `maximum-scale=1, user-scalable=no`, giữ nguyên phần còn lại.
- Kiểm ngay sau bước này: pinch-zoom được ở màn chi tiết job và báo cáo (không cần đợi đổi rem xong).

### Bước 2 — Đặt gốc rem (làm ngay sau bước 1)
- Bảo đảm `html` không có `font-size` cố định bằng px; nếu có thì đổi thành `font-size: 100%`.
- Kiểm tra không còn `font-size` nào đặt trực tiếp trên `html`/`body` bằng px (body hiện 17px ở dòng 73 sẽ đổi sang rem ở bước 3).

### Bước 3 — Đổi px → rem theo nhóm (phần việc chính, ~95 chỗ)
Thứ tự nhóm, mỗi nhóm xong thì kiểm tra nhanh rồi mới sang nhóm sau:
1. **Tiêu đề** (bảng 2.1) — 34/31/28/26/24/22/21/19px.
2. **Nội dung** (bảng 2.2) — 17/16/15/14/13px, gồm cả `font-size` inline trong JS (dòng 1375, 1944, 3135).
3. **Chữ phụ + nhãn tab** (bảng 2.3) — 12px và nhãn tab 10.5px → 11px.
4. **Số liệu lớn** — 42px (`.amount`), 28px (`.tile .tv`), 26px (`.amount .cur`), 22px (ô PIN).
- Sau mỗi nhóm: chạy tìm `font-size:[^;}]*px` — số lượng phải giảm dần về 0. Hết bước 3, toàn file phải **0 chỗ `font-size` dùng px**.

### Bước 4 — Sửa các chiều cao cố định gây kẹt khi chữ to lên
Chữ to ra nhưng khung cố định bằng px thì chữ sẽ tràn/kẹt. Đổi sang `min-height` + padding:
- `.steps.jump button` (dòng 231): cao 28px → **`min-height: 44px`** (chuẩn chạm Apple HIG; cũng là lỗi 2.4 của ACCESSIBILITY.md).
- `.tabbar` (`--tabh: 50px`, dòng 328): giữ 50px làm tối thiểu, cho phép cao thêm khi nhãn tab to lên (đổi sang `min-height` nếu đang là `height` cố định).
- `.pill` lọc: cao 32–36px → **`min-height: 44px`**.
- Các `.row` (50px), `.nav-btn` (44×44px), nút chính (44–57px), ô PIN (50px) hiện đã đạt — chỉ kiểm tra lại, không sửa nếu không tràn.
- Rà các chỗ `height` cố định khác chứa chữ: nếu chữ ở cỡ AX5 bị cắt thì đổi thành `min-height`.

### Bước 5 — Kiểm tra layout vỡ ở cỡ chữ lớn nhất (AX5)
- Bật Cài đặt iOS → Trợ năng → Chữ lớn → kéo lên mức lớn nhất (AX5).
- Đi hết 5 tab + tạo 1 job + nhảy pipeline + mở chi tiết job + báo cáo, trên **iPhone SE** (màn hẹp nhất) và một iPhone màn thường.
- Ghi lại từng chỗ vỡ (tràn, che, cắt) kèm tên màn + tên class, sửa rồi kiểm lại đúng chỗ đó ở AX5 — không sửa mò ở cỡ chữ thường.
- **Lưu ý kỹ thuật (cần xác nhận khi kiểm):** `rem` trong WKWebView (Capacitor) chỉ theo "Chữ lớn" của iOS khi web view tôn trọng cỡ chữ hệ thống. Nếu kiểm trên máy thật thấy bật Chữ lớn mà app vẫn không to ra dù đã đổi hết sang rem, phương án dự phòng là dùng font hệ thống `font: -apple-system-body` cho nội dung chính (hoặc đọc cỡ chữ hệ thống qua plugin Capacitor rồi đặt lại `font-size` gốc trên `html`). Quyết định phương án dự phòng sau khi kiểm máy thật, không làm trước.

## 4. Tiêu chí chấp nhận

Kiểm ở **cỡ chữ lớn nhất (AX5)** trên iPhone thật (ưu tiên iPhone SE). Đạt khi tất cả các điểm sau đều đúng:

1. **Không tràn chữ:** không có chữ nào bị cắt nửa, tràn khỏi thẻ/khung, hoặc đè lên chữ/nút khác — ở cả 5 tab, màn tạo job, chi tiết job, báo cáo, cài đặt.
2. **Không mất nút:** mọi nút (nhất là nút chính, nút Gửi, nút nhảy bước pipeline, nút "Thêm vào Lịch iPhone") vẫn nhìn thấy đầy đủ và bấm được; không nút nào bị đẩy ra ngoài màn hình hay bị chữ khác che.
3. **Không cuộn ngang:** không xuất hiện thanh cuộn ngang ở bất kỳ màn nào.
4. **Nhãn tab đọc được:** 5 nhãn tab dưới vẫn đọc rõ, không cắt, không chồng lên nhau.
5. **Số tiền không vỡ:** số tiền lớn (42px → 2.625rem) và số tiền còn thiếu không tràn khỏi thẻ, vẫn hiện đủ số + đơn vị.
6. **Zoom tay hoạt động:** pinch-zoom được ở màn chi tiết job và báo cáo (kiểm bước 1).
7. **Cỡ chữ thường không đổi:** ở mức chữ mặc định của iOS, giao diện nhìn như trước khi sửa (rem với gốc 16px cho cùng kích thước hiển thị) — không lệch layout, không vỡ ở mức mặc định.
8. **0 `font-size` px còn lại:** tìm `font-size:[^;}]*px` trong `index.html` trả về 0 kết quả.

Chưa đạt nếu còn bất kỳ điểm nào trên đây sai — sửa đúng chỗ sai rồi kiểm lại ở AX5, không "đạt gần đủ".

## 5. Ngoài phạm vi đợt này (không làm chung)

- Màu tương phản (trắng trên đỏ 3.79:1, đỏ/xanh/cam trên trắng…) — lỗi riêng, sửa theo ACCESSIBILITY.md mục 1 + 2.3.
- `aria-label` cho nút icon-only, `role="switch"` — mục 3.2, 3.3 của ACCESSIBILITY.md.
- Vạch tiến độ `.steps i` chỉ xem thiếu nhãn VoiceOver — mục 3.1.
- Kiểm VoiceOver toàn app — checklist mục 5 của ACCESSIBILITY.md (chỉ mục 2 trong checklist đó thuộc đợt này).

---

## Báo cáo 7 mục (Quy trình Vibe Coding)

**1. Mục tiêu:** Viết kế hoạch sửa cỡ chữ theo Dynamic Type iOS cho FotoBro iOS v1 (bảng quy đổi px→rem, thứ tự sửa, tiêu chí chấp nhận), chỉ viết file kế hoạch, không sửa code.

**2. Đã thực hiện:** Đọc `ACCESSIBILITY.md` (mục 2.1, 2.2, 2.4, 3.4) và đếm/grep trực tiếp trong `www/index.html`: phân bố `font-size` px (15px ×23, 13px ×17, 17px ×16, 16px ×10, 14px ×7, 12px ×6, 26px ×3, 19px ×3, 28px ×2, 22px ×2, 21px ×2, 42px ×1, 34px ×1, 31px ×1, 24px ×1, 10.5px ×1), xác nhận viewport dòng 25 khoá zoom, xác nhận 0 `font-size` dùng rem; tra ngữ cảnh từng cỡ (dòng 73, 110, 169, 206, 231, 250, 276–277, 328, 358, 434, 436, 493, 496, 1375, 1944, 3135) để gán vai trò. Chỉ viết file mới duy nhất `batch-design/DYNAMIC-TYPE.md`, không sửa bất kỳ file nào.

**3. Kết quả kiểm tra:** Bảng quy đổi đầy đủ 4 nhóm (tiêu đề lớn 34px→2.125rem, tiêu đề màn 31–19px, nội dung 17–13px, chữ phụ/nhãn tab 12px + 10.5px→11px, số tiền 42px→2.625rem); thứ tự 5 bước (viewport → gốc rem → đổi rem theo nhóm → sửa chiều cao cố định → kiểm AX5 trên iPhone SE); 8 tiêu chí chấp nhận, trong đó chốt cứng: 0 `font-size` px còn lại, không tràn chữ, không mất nút ở AX5. Đếm grep ra 96 lượt `font-size…px` so với 95 chỗ ACCESSIBILITY.md ghi — chênh 1 lượt do cách đếm (có thể 1 chỗ trùng/khác mẫu), cần agent chính đếm lại sau khi đổi xong theo tiêu chí số 8.

**4. Vấn đề còn tồn tại:** Chưa sửa code — viewport vẫn khoá zoom, toàn bộ font vẫn px; chưa biết `rem` có tự theo "Chữ lớn" trong WKWebView/Capacitor hay không, phải kiểm trên iPhone thật mới kết luận (đã ghi phương án dự phòng `-apple-system-body` trong kế hoạch, chưa chọn); chưa kiểm layout vỡ ở AX5 vì chưa có code mới để kiểm.

**5. Điều kiện chuyển bước:** Agent chính sửa xong theo đúng thứ tự mục 3 (viewport trước, rem sau), đạt đủ 8 tiêu chí mục 4, rồi QA kiểm lại checklist trên iPhone thật trước khi nộp App Store.

**6. Bước tiếp theo:** Agent chính sửa viewport (1 dòng) → đặt gốc rem → đổi rem theo nhóm → sửa chiều cao cố định (nút nhảy bước 28px→44px, pill, tab bar) → kiểm AX5 trên iPhone SE + iPhone thường.

**7. Trạng thái:** Hoàn thành file kế hoạch. Chưa code, chưa sửa file nào, chưa kiểm trên máy thật.
