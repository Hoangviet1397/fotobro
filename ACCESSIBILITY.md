# FotoBro iOS v1 — Rà soát trợ năng (Accessibility)

- File rà: `~/workspace/fotobro-ios-v1/www/index.html` — 337.803 byte, 3.860 dòng, kiểm tra lúc 00:13 ngày 20/11/2026 (bản v1 đang làm dở, agent chính vẫn đang sửa).
- Phạm vi: chỉ đọc file, không sửa code. Chuẩn đối chiếu: WCAG 2.2 AA + Apple HIG (vùng chạm tối thiểu 44×44pt, Dynamic Type, VoiceOver).
- Kết quả chung: nền tảng tốt (đã có `lang="vi"`, `:focus-visible`, `role="status"`/`aria-live` cho toast, `prefers-reduced-motion`, dark mode riêng), nhưng còn **4 lỗi cần sửa trước khi nộp** (chặn người dùng khiếm thị / chữ lớn) và **5 điểm nên sửa**.

## 1. Tương phản chữ/nền — đo bằng công thức WCAG (AA chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1)

| Cặp màu | Tỉ lệ | Kết luận |
|---|---|---|
| Trắng `#FFFFFF` trên nhấn `#FA2D48` (nút chính, nút Gửi, bong bóng chat) | 3.79:1 | **Không đạt AA chữ thường** — chỉ đạt mức chữ lớn |
| Đỏ `#FF375F` trên trắng (số tiền còn thiếu, cảnh báo) | 3.52:1 | **Không đạt** |
| Xanh lá `#30D158` trên trắng (trạng thái "Đã thu đủ") | 2.02:1 | **Không đạt** |
| Cam `#FF9F0A` trên trắng (nhắc thu nốt) | 2.06:1 | **Không đạt** |
| Xanh dương `#0A84FF` trên trắng (link) | 3.65:1 | **Không đạt chữ thường** |
| Xám nhạt `#8E8E93` trên trắng (chữ phụ, nhãn tab) | 3.26:1 | **Không đạt** |
| Xám `#636366` trên nền tối `#1C1C1E` (chữ phụ dark mode) | 2.84:1 | **Không đạt** |
| Đạt: đen trên trắng 21:1, trắng trên đen 21:1, `#6B6B70` trên trắng 5.30:1, `#AEAEB2` trên tối 7.69:1, đỏ `#FF375F` trên đen 5.96:1, xanh lá trên đen 10.39:1 |

Lưu ý: các màu trạng thái (đỏ/xanh/cam) **chỉ hỏng ở chế độ sáng**, dark mode vẫn đạt. Hướng sửa: chữ trạng thái dùng màu đậm hơn ở sáng (ví dụ đỏ `#D70015`, xanh lá `#248A3D`, cam `#C93400`, xám phụ `#6B6B70` trở lên), hoặc thêm chữ/biểu tượng đi kèm (đã có một phần, xem mục 4).

## 2. Lỗi CẦN SỬA (chặn trước khi nộp)

### 2.1 Không cho phóng to bằng hai ngón tay — viewport khoá zoom
- Dòng 25: `maximum-scale=1, user-scalable=no`. Người thị lực kém không pinch-zoom được. Vi phạm WCAG 1.4.4.
- Sửa: bỏ `maximum-scale=1, user-scalable=no`, giữ `width=device-width, initial-scale=1, viewport-fit=cover`.

### 2.2 Cỡ chữ không theo cài đặt "Chữ lớn" của iPhone (Dynamic Type)
- Toàn bộ 95 chỗ `font-size` dùng `px` (12–42px), **0 chỗ dùng `rem`**. Bật Cài đặt iOS → Trợ năng → Chữ lớn thì app không to ra.
- Sửa: đổi `font-size` sang `rem` (gốc 16px) hoặc dùng font hệ thống theo Dynamic Type; kiểm tra ở mức chữ lớn nhất (AX5) không tràn layout, đặc biệt màn hình SE.

### 2.3 Nút chính trắng trên đỏ chỉ 3.79:1 (xem bảng mục 1)
- Nút `.btn.fill`, nút Gửi, bong bóng chat của trợ lý đều trắng trên `#FA2D48`.
- Sửa: đậm màu nhấn cho nền nút (ví dụ `#D70015`, tỉ lệ ~5.9:1) hoặc chữ nút dùng đen trên nền nhấn nhạt. Chỉ sửa màu, không đổi thương hiệu đỏ.

### 2.4 Vùng chạm quá nhỏ ở thanh tiến độ pipeline + chip lọc
- Nút nhảy bước `.steps.jump button`: cao **28px**, chữ 12px — dưới chuẩn Apple HIG 44pt (WCAG 2.5.8 tối thiểu 24px thì vẫn qua, nhưng người lớn tuổi / tay run khó chạm trúng, 8 nút nằm sát nhau).
- `.pill` lọc: cao 32–36px; nhãn tab dưới: chữ **10.5px** (dòng 328), icon 26px, tổng chiều cao tab 50px (`--tabh:50px`) — chạm được nhưng chữ nhỏ, VoiceOver đọc tên tab thì ổn, mắt thường khó đọc.
- Sửa: nút nhảy bước cao tối thiểu 44px (giữ số bước bên trong), `.pill` tối thiểu 44px, nhãn tab tối thiểu 11–12px. Các `.row` (cao 50px), `.nav-btn` (44×44px), nút chính (tối thiểu 44–57px) hiện đã đạt.

## 3. Điểm NÊN SỬA

### 3.1 Trạng thái chỉ báo bằng màu (một phần)
- Thanh tiến độ `.steps i` (dạng không chạm được, dòng 1045): chỉ là các vạch 4px tô màu nhấn / xám, không có chữ hay `aria-label` — VoiceOver không đọc được "đang ở bước mấy / 8".
- Chế độ nhảy bước đã tốt hơn: mỗi nút có `aria-label="Nhảy tới bước …"` + số thứ tự bên trong.
- Sửa: thêm `role="img"` + `aria-label="Bước 3 trên 8: Sắp chụp"` cho dạng chỉ xem; màu trạng thái luôn kèm chữ (đã có ở "Còn thiếu …", "Đã thu đủ", "trễ … ngày", "Job kẹt: …" — giữ nguyên cách này).

### 3.2 Nút chỉ có icon — VoiceOver đọc trống (7 nút)
- Đã kiểm: 137 nút `<button>`, chỉ 6 nút có `aria-label` trong HTML tĩnh. Các nút icon-only (mic ở trang chủ, nút đóng/mở gợi ý, nút sao chép) dựa vào icon SVG không có tên đọc được.
- Sửa: thêm `aria-label` tiếng Việt cho mọi nút chỉ có icon (ví dụ "Bấm để nói với trợ lý" đã có ở 1 chỗ — nhân rộng cho tất cả). Nút "Sao chép"/"Chia sẻ" báo cáo đã được JS gán chữ (dòng 1989–1992) nên không tính là lỗi.

### 3.3 Công tắc (switch) không báo trạng thái rõ
- 4 checkbox tạo kiểu `.switch` (51×31px, đạt kích thước) nhưng không có `role="switch"` / `aria-checked`. VoiceOver đọc như checkbox thường trong `<label class="row">` có chữ — dùng được nhưng người dùng không nghe rõ "đang bật/tắt".
- Sửa: thêm `role="switch"` + cập nhật `aria-checked` khi đổi, hoặc dùng checkbox gốc của iOS.

### 3.4 Chữ nhỏ 12–13px ở nhiều chỗ phụ
- Chữ 12px xuất hiện ở: chú thích ảnh, số tiền nhỏ trong `.job-val .owe` (13px), nhãn tab (10.5px), số thứ tự bước nhảy. Đọc được với mắt thường ở cỡ này, nhưng ở mức chữ lớn hệ thống vẫn không to lên (xem 2.2).
- Sửa cùng 2.2: chuyển sang `rem`, tối thiểu 12px chỉ dùng cho chữ thực sự phụ.

### 3.5 Chữ trên ảnh và trên nền kính mờ (glass) — cần kiểm bằng mắt thật
- Caption ảnh hero: chữ trắng trên gradient `rgba(20,12,6,.68)` — gradient đủ đậm, nhưng ảnh nền sáng có thể làm chữ mờ; kiểm lại với ảnh thật của người dùng, không chỉ ảnh mẫu.
- Tab bar / thanh điều hướng dùng `backdrop-filter: blur(20px)` trên nền trong suốt — chữ xám `#8E8E93` 10.5px trên nền mờ biến đổi theo nội dung phía sau, tỉ lệ tương phản không ổn định.
- Sửa: tăng độ đậm nền tab bar ở chế độ sáng, hoặc dùng chữ tab đậm hơn (`#6B6B70` trở lên).

## 4. Điểm ĐÃ TỐT (không cần sửa)

- `lang="vi"`, `<title>FotoBro</title>`, cấu trúc heading có 5 `<h1>` / 22 `<h2>` (SPA nhiều màn ẩn — chấp nhận được, mỗi màn hiện 1 tiêu đề lớn).
- `:focus-visible` có viền 3px màu nhấn + `outline-offset:2px` (dòng 81) — bàn phím ngoài / Switch Control thấy được vị trí focus.
- Toast dùng `role="status"` + `aria-live="polite"` (dòng 712); sheet/modal được JS gán `role="dialog"` + `aria-modal="true"` + `aria-label` (dòng 1070).
- `prefers-reduced-motion: reduce` tắt hết animation/transition (dòng 505–507) + JS kiểm tra trước khi chạy hiệu ứng hoa bay (dòng 2557, 2672); hiệu ứng hoa bay đã bỏ ở v1.
- Form dùng `frow()` bọc `<input>` trong `<label>` có chữ (dòng 1559) nên VoiceOver đọc được nhãn — 21 input không có `aria-label` riêng **không phải lỗi**.
- Ảnh trang trí có `alt=""` (3 ảnh, đúng chuẩn bỏ qua); ảnh nội dung có alt tiếng Việt ("Cặp đôi áo dài trong khu vườn — ảnh bạn chụp").
- Dark mode có bảng màu riêng, không dùng chung màu sáng; chữ chính trắng trên đen 21:1.
- `.row` cao tối thiểu 50px, `.nav-btn` 44×44px, ô PIN cao 50px — vùng chạm chính đã đạt.

## 5. Checklist kiểm lại trên iPhone thật (sau khi sửa mục 2–3)

1. Bật VoiceOver, đi hết 5 tab + tạo 1 job + nhảy pipeline: mọi nút đều đọc được tên + trạng thái.
2. Bật Cài đặt → Trợ năng → Chữ lớn mức lớn nhất: không tràn chữ, không che nút, màn SE vẫn dùng được.
3. Pinch-zoom được ở màn chi tiết job và báo cáo.
4. Bật "Giảm chuyển động": không còn animation nào chạy.
5. Kiểm tra sáng + tối: số tiền còn thiếu, "Đã thu đủ", nhắc thu nốt đều đọc rõ.
6. Dùng Switch Control (điều khiển bằng công tắc): tới được nút nhảy bước 28px sau khi sửa lên 44px.

---

## Báo cáo 7 mục (Quy trình Vibe Coding)

**1. Mục tiêu:** Rà soát trợ năng v1 của app iOS FotoBro (VoiceOver, cỡ chữ lớn, tương phản sáng + tối, vùng chạm, không dùng chỉ màu để báo trạng thái).

**2. Đã thực hiện:** Đọc toàn bộ `~/workspace/fotobro-ios-v1/www/index.html` (337.803 byte, 3.860 dòng) bằng grep/python: đếm `aria-label` (18), nút (137), input (46), `font-size` px (95, 0 rem), tính tỉ lệ tương phản WCAG cho 14 cặp màu, đo vùng chạm (tab 50px, nút nhảy bước 28px, pill 32–36px, row 50px), kiểm tra `role="dialog"` (JS gán, dòng 1070), `frow()` bọc label (dòng 1559), `prefers-reduced-motion` (dòng 505–507). Chỉ viết file mới duy nhất `ACCESSIBILITY.md`, không sửa bất kỳ file nào khác.

**3. Kết quả kiểm tra:** Nền tảng tốt (lang, focus-visible, toast aria-live, reduced-motion, dark mode riêng, form có label). Tìm được **4 lỗi cần sửa** (khoá zoom, font px không theo Dynamic Type, trắng trên đỏ 3.79:1, nút nhảy bước 28px) và **5 điểm nên sửa** (vạch tiến độ chỉ xem không có nhãn, 7 nút icon-only thiếu aria-label, switch thiếu role, chữ 12px, chữ trên ảnh/nền mờ). Không phát hiện lỗi chặn VoiceOver ở form (label bọc input) hay sheet (đã có role=dialog).

**4. Vấn đề còn tồn tại:** 4 lỗi mục 2 chưa sửa (cần agent chính sửa code); tương phản chữ trạng thái chỉ hỏng ở chế độ sáng; chưa kiểm được bằng mắt/VoiceOver trên iPhone thật — mọi kết luận là đo từ code, cần chạy lại checklist mục 5 trên TestFlight.

**5. Điều kiện chuyển bước:** Agent chính sửa xong 4 lỗi mục 2 (đặc biệt viewport + rem + màu nút chính), rồi QA chạy lại checklist mục 5 trên iPhone thật trước khi nộp App Store.

**6. Bước tiếp theo:** Sửa 4 lỗi cần sửa → kiểm tra VoiceOver + chữ lớn nhất trên TestFlight → sửa 5 điểm nên sửa nếu còn thời gian trước khi nộp.

**7. Trạng thái:** Hoàn thành phần rà soát và viết file. Chưa sửa code, chưa kiểm trên máy thật.
