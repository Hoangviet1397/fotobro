# Onboarding FotoBro v1 — Mô tả hình minh hoạ (chỉ bằng chữ)

> Trạng thái: MÔ TẢ, chưa vẽ. File này chỉ mô tả bằng chữ cho người vẽ / agent vẽ hình sau này.
> Không tạo ảnh, không dùng ảnh thật, không dùng ảnh mẫu của Xèo.
> Nguồn copy chốt: `../ONBOARDING.md` (tiêu đề + 1 câu giải thích mỗi màn là bản chốt, không đổi).
> Phong cách chung v1: kiểu Apple Music — Large Title, SF Pro, nền trắng sạch + dark mode đen, **1 màu nhấn duy nhất đỏ `#FA2D48`**, thẻ bo góc lớn, tab bar mờ. Hình vẽ phẳng (flat illustration) bằng SwiftUI/CSS + SF Symbols, không ảnh thật, không gradient cầu kỳ, không animation nặng.

## Quy định chung cho cả 3 hình

| Hạng mục | Quy định |
|---|---|
| Khung hình | Hình lớn nằm giữa màn, dưới tiêu đề Large Title + câu giải thích, trên chấm trang (3 chấm). Tỉ lệ khoảng 4:3, chiều rộng bằng chiều rộng nội dung màn (lề 20pt hai bên). |
| Bảng màu | Nền trắng `#FFFFFF` (light) / đen `#000000` (dark). Thẻ: trắng / xám đậm `#1C1C1E` (dark). Chữ chính đen / trắng. Chữ phụ xám `#8E8E93`. Màu nhấn duy nhất `#FA2D48`. Không thêm màu khác ngoài các màu xám trung tính (`#F2F2F7` nền thẻ phụ light, `#E5E5EA` viền mảnh light, `#3A3A3C` viền dark). |
| Kiểu vẽ | Phẳng, tối giản, đường nét sạch, không đổ bóng nặng (chỉ bóng mờ rất nhẹ dưới thẻ, opacity ~8%). Bo góc lớn: thẻ 20–24pt, ảnh/thumbnail trong thẻ 16pt. |
| SF Symbols | Dùng đúng symbol đã chốt trong `ONBOARDING.md`: `camera.fill`, `bell.fill`, `creditcard.fill`. Symbol màu trắng trên nền xám, hoặc màu nhấn `#FA2D48` khi cần nhấn (xem từng hình). |
| Người trong hình | Không vẽ khuôn mặt thật, không vẽ ảnh mẫu của Xèo. Nếu cần gợi ý "khách chụp", chỉ dùng avatar tròn placeholder màu xám nhạt với icon người (`person.fill`) trắng, không vẽ mặt. |
| Chữ trong hình | Chỉ dùng chữ mẫu đã chốt dưới đây (tên khách mẫu, số tiền mẫu). Chữ trong hình dùng SF Pro, cùng cỡ chữ hệ thống của app. Không thêm slogan, không thêm chữ trang trí. |
| Dark mode | Mọi hình phải đọc được cả light và dark: nền thẻ đổi sang `#1C1C1E`, chữ đổi trắng, màu nhấn giữ nguyên `#FA2D48`, vùng placeholder xám nhạt đổi thành xám đậm `#48484A` với icon trắng. |
| Kích thước nhỏ nhất | Phải rõ trên iPhone SE (màn nhỏ nhất v1 hỗ trợ): chi tiết nhỏ nhất không dưới 12pt, không vẽ chi tiết li ti. |

---

## Hình 1 — "Hôm nay của bạn"

**Đi kèm:** Tiêu đề `Hôm nay của bạn` · Câu: `Mở app là thấy buổi chụp, tiền cần thu và việc cần làm hôm nay.`

### Bố cục
- Một thẻ lớn duy nhất chiếm gần hết khung hình, xếp dọc 3 tầng: (1) ảnh buổi chụp placeholder ở trên, (2) dòng thông tin job ở giữa, (3) 2 dòng nhỏ liệt kê ở dưới, cách nhau bằng đường kẻ mảnh.
- Thẻ bo góc 24pt, nền trắng (light) / `#1C1C1E` (dark), bóng mờ nhẹ.

### Tầng 1 — Ảnh buổi chụp (placeholder)
- Hình chữ nhật ngang, bo góc 16pt, nền xám nhạt `#E5E5EA` (light) / `#48484A` (dark).
- Chính giữa là icon `camera.fill` màu trắng, cỡ lớn (~44pt), đặt trên một vòng tròn xám đậm hơn một chút để icon nổi lên.
- Không vẽ máy ảnh thật, không vẽ người mẫu, không vẽ phong cảnh — chỉ placeholder + icon.

### Tầng 2 — Thông tin job
- Một dòng ngang, chia 2 phía:
  - Trái: tên khách đậm (SF Pro Semibold, 17pt), ví dụ `Mai Anh & Tuấn Kiệt`; ngay dưới là giờ chụp màu xám phụ, ví dụ `08:00 · Hôm nay`.
  - Phải: số tiền cần thu đậm, màu nhấn `#FA2D48`, ví dụ `5.000.000 đ`, căn phải, cùng hàng với tên khách.
- Khoảng cách giữa tên khách và số tiền đủ rộng để không chạm nhau trên màn SE.

### Tầng 3 — 2 dòng nhỏ liệt kê
- 2 dòng, mỗi dòng 1 icon nhỏ (16pt) + 1 dòng chữ xám phụ (15pt), căn trái:
  - Dòng 1: icon `calendar` + `1 buổi chụp sắp tới — 14:00, Lookbook`.
  - Dòng 2: icon `creditcard.fill` màu nhấn + `1 khoản tiền chưa thu — 2.500.000 đ`.
- 2 dòng cách nhau 8pt, ngăn với tầng 2 bằng đường kẻ mảnh `#E5E5EA` / `#3A3A3C`.

### Màu sắc
- Nền thẻ trắng / `#1C1C1E`; placeholder xám nhạt; icon trắng; chữ chính đen / trắng; chữ phụ xám `#8E8E93`; chỉ một điểm nhấn đỏ `#FA2D48` duy nhất là số tiền cần thu (và icon tiền ở dòng 2).

### Yếu tố chính
- Thẻ job hôm nay: ảnh placeholder + tên khách + giờ + tiền cần thu. Thông điệp: mở app là thấy ngay việc hôm nay, không cần tìm.

### Ghi chú cho người vẽ
- Đừng vẽ thêm job thứ hai, đừng thêm nút bấm hay tab bar vào hình — hình chỉ minh hoạ nội dung, không phải ảnh chụp màn hình app.
- Tên khách và số tiền là chữ mẫu, khi vẽ xong phải thay được bằng dữ liệu thật mà không vỡ bố cục (tên dài tới ~20 ký tự, tiền tới 8 chữ số vẫn vừa 1 dòng).
- Kiểm tra dark mode: placeholder không được quá sáng chói, icon trắng vẫn nổi trên nền xám đậm.

---

## Hình 2 — "Một job, 8 bước"

**Đi kèm:** Tiêu đề `Một job, 8 bước` · Câu: `Mỗi job đi từ Tư vấn tới Xong, chạm vào bước nào cũng nhảy thẳng tới đó.`

### Bố cục
- Khung hình chia 2 tầng, căn giữa theo chiều dọc:
  - Tầng trên (chiếm ~60% chiều cao hình): hàng ngang 8 chấm nối nhau bằng 1 đường mảnh.
  - Tầng dưới: 3 nhãn bước mẫu xếp ngang, thẳng hàng với 3 chấm tương ứng (chấm đầu, chấm giữa, chấm cuối).
- Toàn bộ hàng chấm nằm trên một thẻ nền phẳng bo góc 24pt, nền `#F2F2F7` (light) / `#1C1C1E` (dark), để hình có "đất" đứng, không trôi trên nền trắng.

### Tầng trên — Hàng 8 chấm + đường nối
- 1 đường ngang mảnh (2pt), màu `#E5E5EA` (light) / `#3A3A3C` (dark), chạy suốt chiều ngang thẻ, cách đều 2 đầu.
- 8 chấm tròn nằm trên đường, cách đều nhau, từ trái sang phải:
  - Chấm 1–3 (đã qua): tròn đầy, đường kính 12pt, màu nhấn `#FA2D48`.
  - Chấm 4 (hiện tại): tròn to nhất, đường kính 20pt, màu nhấn `#FA2D48`, có vòng ngoài mờ cùng màu (opacity ~20%, đường kính 28pt) để gợi ý "đang ở đây". Đây là điểm nhấn duy nhất của hình.
  - Chấm 5–8 (chưa tới): tròn rỗng, đường kính 12pt, viền xám `#C7C7CC` (light) / `#636366` (dark) dày 2pt, ruột trong suốt (cùng màu nền thẻ).
- Không vẽ số thứ tự trong chấm, không vẽ icon trong chấm.

### Tầng dưới — 3 nhãn bước mẫu
- Chỉ 3 nhãn, không vẽ cả 8 tên bước (chật, khó đọc — theo `ONBOARDING.md`):
  - Trái, thẳng dưới chấm 1: `Tư vấn` — xám phụ, 15pt.
  - Giữa, thẳng dưới chấm 4 (chấm hiện tại): `Đã chụp` — đậm (SF Pro Semibold), 17pt, màu chữ chính, to hơn 2 nhãn còn lại.
  - Phải, thẳng dưới chấm 8: `Đã giao` — xám phụ, 15pt.
- Giữa các nhãn có thể thêm dấu `→` nhỏ màu xám nhạt để gợi ý chiều đi, không bắt buộc.

### Màu sắc
- Nền thẻ `#F2F2F7` / `#1C1C1E`; đường nối và chấm chưa tới màu xám; chấm đã qua + chấm hiện tại màu nhấn `#FA2D48`; nhãn giữa đen / trắng đậm, 2 nhãn còn lại xám `#8E8E93`.

### Yếu tố chính
- Thanh tiến độ 8 chấm với 1 chấm hiện tại to, đỏ, có vòng mờ. Thông điệp: job đi theo một đường thẳng rõ ràng, biết mình đang ở bước nào.

### Ghi chú cho người vẽ
- 8 chấm phải cách đều tuyệt đối, đường nối phải thẳng — dùng lưới, không vẽ tay lệch.
- Chấm hiện tại là chấm 4 (`Đã chụp`) trong bản mẫu; khi vẽ, giữ đúng vị trí này để nhãn giữa thẳng hàng với chấm to.
- Đừng vẽ mũi tên to, đừng vẽ hình máy ảnh hay tiền ở hình này — hình 2 chỉ nói về "tiến trình", không nói về tiền hay lịch.
- Kiểm tra màn SE: 8 chấm + khoảng cách vẫn vừa trong chiều rộng thẻ, không tràn, không chồng lên nhau.

---

## Hình 3 — "Tiền và lịch, rõ ràng"

**Đi kèm:** Tiêu đề `Tiền và lịch, rõ ràng` · Câu: `Ghi cọc lúc chốt, thu nốt lúc giao, app nhắc trước buổi chụp 12 tiếng.`

### Bố cục
- 2 thẻ xếp dọc, cùng chiều rộng, cách nhau 12pt, cả hai bo góc 20pt:
  - Thẻ trên: tiền còn thiếu + thanh tiến độ.
  - Thẻ dưới: nhắc lịch buổi chụp.
- 2 thẻ cùng nằm trên nền màn, không thêm thẻ nền lớn bao ngoài.

### Thẻ trên — Tiền còn thiếu
- Nền trắng (light) / `#1C1C1E` (dark), bóng mờ nhẹ.
- Dòng 1, trên cùng bên trái: nhãn nhỏ xám phụ (13pt, chữ hoa nhẹ hoặc thường đều được, giữ 1 kiểu): `Còn thiếu`.
- Dòng 2: số tiền đậm lớn (SF Pro Bold, 28pt), màu chữ chính, ví dụ `5.000.000 đ`; ngay sau số tiền, bên phải, một nhãn nhỏ màu nhấn `#FA2D48` (13pt): `chưa thu`.
- Dòng 3, dưới cùng: thanh tiến độ mảnh (cao 6pt, bo tròn 2 đầu), nền xám `#E5E5EA` / `#3A3A3C`, phần đã đầy 2/3 chiều dài màu nhấn `#FA2D48`. Bên phải thanh, chữ nhỏ xám phụ (13pt): `đã thu 2/3`.
- Icon `creditcard.fill` nhỏ (20pt) màu nhấn đặt ở góc trên phải của thẻ, ngang hàng với nhãn `Còn thiếu`.

### Thẻ dưới — Nhắc lịch
- Nền trắng (light) / `#1C1C1E` (dark), bóng mờ nhẹ.
- Bố cục ngang: icon chuông bên trái + 2 dòng chữ bên phải.
  - Trái: icon `bell.fill` màu nhấn `#FA2D48` (~28pt) đặt trong vòng tròn nền đỏ nhạt (màu nhấn opacity ~12%, đường kính 48pt).
  - Phải, dòng 1: nhãn nhỏ xám phụ (13pt): `Nhắc chụp`.
  - Phải, dòng 2: tên khách + giờ, đậm (SF Pro Semibold, 17pt), ví dụ `Mai Anh & Tuấn Kiệt — 08:00 mai`, giờ `08:00 mai` đậm hơn phần tên một chút (hoặc cùng đậm, không dùng màu khác).
- Không vẽ thêm nút tắt/bật nhắc, không vẽ lịch tháng.

### Màu sắc
- Nền 2 thẻ trắng / `#1C1C1E`; chữ chính đen / trắng; chữ phụ xám `#8E8E93`; màu nhấn `#FA2D48` xuất hiện đúng 3 chỗ: icon thẻ + phần đầy của thanh tiến độ + nhãn `chưa thu`, và icon chuông thẻ dưới (tổng cộng vẫn chỉ 1 màu nhấn, không thêm màu xanh/vàng cho "đã thu" hay "nhắc").

### Yếu tố chính
- Thẻ tiền: số tiền còn thiếu lớn + thanh tiến độ 2/3. Thẻ nhắc: chuông đỏ + tên khách + giờ chụp. Thông điệp: tiền và lịch đều rõ ràng trong 2 thẻ.

### Ghi chú cho người vẽ
- Số tiền mẫu `5.000.000 đ` phải vừa 1 dòng ở cỡ 28pt trên màn SE; nếu dài hơn (ví dụ 8 chữ số) thì cho phép co cỡ chữ xuống 24pt, không được xuống 2 dòng.
- Thanh tiến độ đúng 2/3, không vẽ đầy hẳn hay nửa vời — tỉ lệ 2/3 là một phần của thông điệp ("đã thu 2/3").
- Tên khách ở thẻ dưới dùng cùng tên mẫu với hình 1 (`Mai Anh & Tuấn Kiệt`) để 3 hình kể cùng một câu chuyện.
- Kiểm tra dark mode: vòng tròn nền đỏ nhạt quanh chuông không được quá chói; thanh tiến độ nền xám vẫn thấy rõ phần đỏ đã đầy.

---

## Checklist trước khi bàn giao hình cho agent code

1. Cả 3 hình chỉ dùng: trắng/đen, xám trung tính, và đỏ `#FA2D48` — không có màu thứ hai.
2. Cả 3 hình đọc được cả light mode và dark mode, không có chữ xám quá mờ trên nền đen.
3. Không có ảnh thật, không có khuôn mặt thật, không có ảnh mẫu của Xèo, không có yếu tố E.L.F. / Super Junior.
4. Chữ trong hình đúng copy chốt trong `ONBOARDING.md` (tên khách, số tiền, tên bước đều là chữ mẫu, thay được bằng dữ liệu thật).
5. Hình 2 chỉ có 3 nhãn bước (`Tư vấn`, `Đã chụp`, `Đã giao`), không vẽ đủ 8 tên.
6. Hình 3 thanh tiến độ đúng 2/3, số tiền 1 dòng trên màn SE.
7. Cả 3 hình vẽ phẳng bằng SwiftUI/CSS + SF Symbols, không animation nặng, không video.
