# FotoBro iOS v1 — Kế hoạch test trợ năng (A11Y Test Plan)

- Nguồn lỗi: `~/workspace/fotobro-ios-v1/ACCESSIBILITY.md` (rà soát lúc 00:13 ngày 20/11/2026 trên `www/index.html`, 3.860 dòng).
- Phạm vi file này: **chỉ kế hoạch test, không sửa code**. Chạy sau khi agent chính sửa xong 4 lỗi chặn ở mục 2 của `ACCESSIBILITY.md` (viewport khoá zoom, font px, nút trắng trên đỏ 3.79:1, nút pipeline 28px) — xem "Điều kiện tiên quyết" bên dưới.
- Chuẩn đối chiếu: WCAG 2.2 AA + Apple HIG (vùng chạm tối thiểu 44×44pt, Dynamic Type, VoiceOver).
- Thiết bị test: **iPhone thật** (bản TestFlight), ưu tiên 2 máy: 1 máy màn nhỏ (iPhone SE) + 1 máy màn lớn. Không dùng giả lập cho các mục VoiceOver / chữ lớn / tương phản — giả lập chỉ dùng để chuẩn bị.
- Cách ghi kết quả: mỗi ca test ghi `ĐẠT / KHÔNG ĐẠT / KHÔNG ÁP DỤNG` + ghi chú (màn hình, chế độ sáng/tối, cỡ chữ). Ca nào KHÔNG ĐẠT thì ghi rõ bước tái hiện và ảnh chụp màn hình.

## Điều kiện tiên quyết (kiểm trước khi bắt đầu)

| # | Điều kiện | Cách kiểm nhanh |
|---|---|---|
| P0 | Viewport đã bỏ khoá zoom | Mở `www/index.html`, meta viewport chỉ còn `width=device-width, initial-scale=1, viewport-fit=cover`, không còn `maximum-scale=1, user-scalable=no` |
| P1 | Font đã chuyển sang `rem` / Dynamic Type | Tìm `font-size` trong file: không còn 95 chỗ dùng `px` (12–42px) như trước |
| P2 | Màu nút chính đã đậm hơn | Nút `.btn.fill` / nút Gửi / bong bóng chat không còn trắng trên `#FA2D48` (3.79:1) — tỉ lệ mới ≥ 4.5:1 |
| P3 | Nút nhảy bước pipeline ≥ 44px | `.steps.jump button` không còn cao 28px; `.pill` ≥ 44px; nhãn tab ≥ 11–12px |

Nếu P0–P3 chưa xong thì các ca VO-01, DT-01, CT-01, TT-01 dưới đây dự kiến KHÔNG ĐẠT — vẫn chạy để ghi bằng chứng, không bỏ qua.

## Quy ước chung cho mọi ca test

- Trước mỗi nhóm test: tắt VoiceOver / trả cỡ chữ về mặc định / tắt Giảm chuyển động, trừ khi ca test yêu cầu bật.
- Đi hết luồng chính: 5 tab dưới → tạo 1 job mới → nhảy pipeline 8 bước → xem báo cáo tiền → mở Cài đặt.
- Chế độ sáng và tối đều phải kiểm riêng ở nhóm tương phản (mục 3); các nhóm khác kiểm ở chế độ sáng, rồi lặp lại nhanh ở chế độ tối nếu có nghi ngờ.

---

## 1. VoiceOver — đọc đủ nút chính, đúng thứ tự đọc

Bật: Cài đặt → Trợ năng → VoiceOver → Bật. Điều hướng bằng vuốt phải (mục tiếp theo), vuốt trái (quay lại), chạm đúp (kích hoạt). Tắt bằng cách bấm nút Side 3 lần (nếu đã gán phím tắt Trợ năng) hoặc Siri "Tắt VoiceOver".

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| VO-01 | Đọc đủ 5 tab dưới | Bật VoiceOver, vuốt phải từ đầu màn Hôm nay xuống tab bar. Nghe tên từng tab. | Đọc đủ 5 tên tab, đúng thứ tự hiển thị trên màn hình; không có tab nào đọc trống hoặc đọc tên file ảnh |
| VO-02 | Thứ tự đọc màn Hôm nay | Vuốt phải liên tục từ tiêu đề lớn xuống hết màn Hôm nay (job hôm nay, nhắc thu tiền, gợi ý). | Thứ tự đọc = thứ tự nhìn thấy từ trên xuống dưới, trái sang phải; không nhảy lung tung sang vùng ẩn |
| VO-03 | Tạo 1 job bằng VoiceOver | Từ màn Hôm nay, dùng VoiceOver tìm nút tạo job, chạm đúp, điền từng ô (tên khách, loại job, ngày chụp, tiền cọc) rồi lưu. | Mọi ô nhập đều đọc được nhãn (form dùng `<label>` bọc `<input>` nên phải đọc được tên ô); nút Lưu đọc được tên và bấm được; sau khi lưu, VoiceOver đọc được thông báo/toast xác nhận |
| VO-04 | Nhảy pipeline 8 bước | Mở chi tiết job, vuốt tới thanh pipeline, vuốt qua 8 nút nhảy bước (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong). | Mỗi nút đọc dạng "Nhảy tới bước …" + số thứ tự; bước hiện tại đọc thêm trạng thái (đang ở bước này); chạm đúp nhảy đúng bước |
| VO-05 | Vạch tiến độ chỉ xem (không chạm được) | Ở chi tiết job, tìm vạch tiến độ `.steps i` (dạng chỉ xem, không phải nút nhảy). | VoiceOver đọc được "Bước X trên 8: <tên bước>" (cần `role="img"` + `aria-label`); KHÔNG được im lặng hoặc chỉ đọc "hình ảnh" chung chung |
| VO-06 | Nút chỉ có icon phải có tên | Vuốt qua toàn bộ các nút chỉ có icon: mic ở trang chủ, nút đóng/mở gợi ý, nút sao chép. | Mỗi nút đọc được tên tiếng Việt có nghĩa (ví dụ "Bấm để nói với trợ lý"); không nút nào đọc trống, đọc "nút" trơ, hoặc đọc tên file SVG |
| VO-07 | Công tắc (switch) báo bật/tắt | Vào Cài đặt, vuốt qua 4 công tắc `.switch` (51×31px). Bật rồi tắt từng cái. | Đọc được tên công tắc + trạng thái "đang bật / đang tắt" rõ ràng sau mỗi lần đổi (cần `role="switch"` + `aria-checked`); không đọc như checkbox thường gây nhầm |
| VO-08 | Sheet / modal | Mở 1 sheet (ví dụ chi tiết job hoặc mẫu tin nhắn). Vuốt phải tới cuối sheet rồi vuốt tiếp. | Focus bị giữ trong sheet (`role="dialog"` + `aria-modal="true"`); không lọt ra nội dung phía sau; nút đóng đọc được tên và đóng được |
| VO-09 | Toast / thông báo | Làm 1 thao tác có toast (ví dụ lưu job, sao chép nội dung). | Toast đọc tự động qua `role="status"` + `aria-live="polite"`, không cần vuốt tới; nội dung toast đọc đúng |
| VO-10 | Ảnh có nội dung vs ảnh trang trí | Vuốt qua ảnh hero trang chủ và ảnh nội dung (ví dụ ảnh mẫu "Cặp đôi áo dài trong khu vườn"). | Ảnh nội dung đọc được alt tiếng Việt có nghĩa; ảnh trang trí (`alt=""`) bị VoiceOver bỏ qua, không đọc |
| VO-11 | Focus nhìn thấy được | Cắm bàn phím ngoài (hoặc bật Switch Control, xem mục 6) và di chuyển focus qua các nút. | Viền focus 3px màu nhấn + `outline-offset:2px` nhìn thấy rõ ở mọi nút; không có nút nào mất focus |

**Tiêu chí đạt nhóm 1:** VO-01 → VO-09 đều ĐẠT. VO-10, VO-11 là kiểm bổ sung (đã tốt theo rà soát, chỉ xác nhận lại trên máy thật).

---

## 2. Chữ lớn nhất của iOS (Dynamic Type, mức AX5)

Bật: Cài đặt → Trợ năng → Màn hình & Cỡ chữ → Chữ lớn hơn → kéo hết cỡ sang phải (mức lớn nhất, AX5). Kiểm lại ở cả 2 máy (SE + màn lớn).

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| DT-01 | Chữ to lên theo hệ thống | Bật chữ lớn nhất, mở app, so với lúc để cỡ mặc định. | Toàn bộ chữ trong app to lên rõ rệt (đã chuyển `font-size` từ `px` sang `rem` / font hệ thống); không còn chỗ nào giữ nguyên cỡ cũ |
| DT-02 | Không tràn / không che nút — màn Hôm nay | Ở chữ lớn nhất, cuộn hết màn Hôm nay. | Không chữ nào tràn khỏi thẻ, không chữ nào đè lên nút hoặc che mất nút bấm; mọi nút vẫn bấm được |
| DT-03 | Không tràn — chi tiết job + pipeline | Ở chữ lớn nhất, mở chi tiết job, xem 8 nút nhảy bước pipeline và số tiền (cọc / còn thiếu). | 8 nút nhảy bước vẫn nằm gọn trong hàng (xuống dòng gọn gàng nếu cần), không đè nhau; số tiền không bị cắt |
| DT-04 | Không tràn — báo cáo tiền | Ở chữ lớn nhất, mở báo cáo ngày/tuần/tháng. | Bảng/số liệu không tràn viền, nút "Sao chép"/"Chia sẻ" vẫn nhìn và bấm được |
| DT-05 | Không tràn — màn SE | Lặp lại DT-02 → DT-04 trên iPhone SE ở chữ lớn nhất. | SE vẫn dùng được: không có màn nào kẹt (không cuộn được tới nút Lưu / nút đóng); đây là ca dễ hỏng nhất |
| DT-06 | Chữ phụ 12–13px | Ở chữ lớn nhất, kiểm chú thích ảnh, số tiền nhỏ `.job-val .owe` (13px), nhãn tab (10.5px). | Chữ phụ cũng to lên theo hệ thống; nhãn tab tối thiểu 11–12px ở cỡ mặc định và to lên ở AX5; không còn chữ 10.5px |
| DT-07 | Trả về cỡ mặc định | Tắt Chữ lớn hơn (kéo về giữa), mở lại app. | Layout trở về bình thường, không còn dấu vết tràn hay lệch từ lần chữ lớn |

**Tiêu chí đạt nhóm 2:** DT-01 → DT-05 đều ĐẠT. DT-06, DT-07 là kiểm bổ sung.

---

## 3. Tương phản sáng / tối

Kiểm bằng mắt thật trên iPhone (sáng + tối riêng), ở cỡ chữ mặc định. Ngưỡng: chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1 (WCAG 2.2 AA). Các cặp màu dưới đây là các cặp **đã đo hỏng** trong rà soát — kiểm lại sau khi sửa màu.

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| CT-01 | Nút chính trắng trên đỏ | Chế độ sáng: nhìn nút chính `.btn.fill`, nút Gửi, bong bóng chat của trợ lý. | Chữ trắng trên nền nút đọc rõ, không nhòe; tỉ lệ mới ≥ 4.5:1 (trước sửa: trắng trên `#FA2D48` = 3.79:1) |
| CT-02 | Số tiền còn thiếu (đỏ) | Chế độ sáng: mở job còn thiếu tiền, nhìn dòng "Còn thiếu …". | Chữ đỏ đọc rõ trên nền trắng; tỉ lệ ≥ 4.5:1 (trước sửa: `#FF375F` trên trắng = 3.52:1) |
| CT-03 | "Đã thu đủ" (xanh lá) | Chế độ sáng: mở job đã thu đủ tiền. | Chữ xanh lá đọc rõ trên nền trắng; tỉ lệ ≥ 4.5:1 (trước sửa: `#30D158` trên trắng = 2.02:1) |
| CT-04 | Nhắc thu nốt (cam) | Chế độ sáng: xem nhắc thu nốt trên màn Hôm nay. | Chữ cam đọc rõ trên nền trắng; tỉ lệ ≥ 4.5:1 (trước sửa: `#FF9F0A` trên trắng = 2.06:1) |
| CT-05 | Link xanh dương | Chế độ sáng: tìm link trong app. | Link đọc rõ, phân biệt được với chữ thường; tỉ lệ ≥ 4.5:1 (trước sửa: `#0A84FF` trên trắng = 3.65:1) |
| CT-06 | Chữ phụ xám nhạt | Chế độ sáng: nhìn chữ phụ, nhãn tab dưới. | Chữ phụ đọc được, không mờ; tỉ lệ ≥ 4.5:1 (trước sửa: `#8E8E93` trên trắng = 3.26:1; nhãn tab 10.5px càng khó đọc) |
| CT-07 | Chữ phụ ở dark mode | Chế độ tối: nhìn chữ phụ trên nền tối. | Chữ phụ đọc rõ trên nền tối; tỉ lệ ≥ 4.5:1 (trước sửa: `#636366` trên `#1C1C1E` = 2.84:1) |
| CT-08 | Trạng thái không chỉ báo bằng màu | Chế độ sáng: xem "Còn thiếu …", "Đã thu đủ", "trễ … ngày", "Job kẹt: …". | Mọi trạng thái đều có chữ/biểu tượng đi kèm, không chỉ khác màu; người mù màu vẫn phân biệt được |
| CT-09 | Chữ trên ảnh hero + nền kính mờ | Chế độ sáng và tối: nhìn caption ảnh hero (chữ trắng trên gradient tối) và tab bar (`backdrop-filter: blur(20px)`). | Caption đọc rõ cả với ảnh nền sáng (ảnh thật của người dùng, không chỉ ảnh mẫu); chữ tab bar không bị nền phía sau làm mờ |
| CT-10 | Kiểm lại các cặp đã đạt | Chế độ sáng + tối: chữ chính đen trên trắng / trắng trên đen. | Vẫn đọc rõ như trước (21:1); việc sửa màu ở CT-01 → CT-07 không làm hỏng các cặp đang đạt (`#6B6B70` trên trắng 5.30:1, `#AEAEB2` trên tối 7.69:1) |

**Tiêu chí đạt nhóm 3:** CT-01 → CT-08 đều ĐẠT ở cả sáng và tối. CT-09, CT-10 là kiểm bổ sung.

---

## 4. Vùng chạm tối thiểu 44pt

Đo bằng mắt + thao tác thật: dùng ngón tay cái bấm thử (không dùng đầu ngón tay út hay móng tay). Chuẩn Apple HIG: tối thiểu 44×44pt. WCAG 2.5.8 tối thiểu 24px — ca nào chỉ đạt 24px mà chưa tới 44pt thì ghi "ĐẠT MỨC TỐI THIỂU, CHƯA ĐẠT HIG" chứ không ghi ĐẠT.

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| TT-01 | Nút nhảy bước pipeline | Mở chi tiết job, bấm thử từng nút trong 8 nút nhảy bước bằng ngón cái. | Mỗi nút cao ≥ 44px, bấm trúng ngay lần đầu, không bấm nhầm nút bên cạnh (trước sửa: cao 28px, chữ 12px, 8 nút sát nhau) |
| TT-02 | Chip lọc `.pill` | Ở danh sách job, bấm thử từng chip lọc. | Mỗi chip cao ≥ 44px, bấm trúng ngay lần đầu (trước sửa: 32–36px) |
| TT-03 | Tab dưới | Bấm thử 5 tab dưới bằng ngón cái. | Tab bấm trúng dễ dàng; nhãn tab đọc được (≥ 11–12px); tổng chiều cao tab 50px vẫn giữ được |
| TT-04 | Nút chính + nút điều hướng | Bấm thử nút chính (tối thiểu 44–57px), `.nav-btn` (44×44px), ô PIN (50px), `.row` (50px). | Tất cả đã đạt theo rà soát — chỉ xác nhận lại, không có nút nào nhỏ đi sau khi sửa |
| TT-05 | Nút icon-only | Bấm thử mic trang chủ, nút đóng/mở gợi ý, nút sao chép. | Vùng chạm ≥ 44×44pt kể cả khi icon nhỏ hơn (vùng chạm tính theo nút, không tính theo icon) |
| TT-06 | Người tay run / lớn tuổi | Nhờ 1 người lớn tuổi (hoặc bấm bằng tay không thuận) bấm thử 8 nút nhảy bước + chip lọc 3 lần. | Bấm trúng ≥ 9/10 lần; không có lần nào bấm nhầm sang nút kế bên |

**Tiêu chí đạt nhóm 4:** TT-01 → TT-03 đều ĐẠT (≥ 44pt). TT-04 → TT-06 là kiểm bổ sung.

---

## 5. Giảm chuyển động (Reduce Motion)

Bật: Cài đặt → Trợ năng → Chuyển động → Bật "Giảm chuyển động".

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| RM-01 | Không còn animation | Bật Giảm chuyển động, mở app, chuyển tab, mở/đóng sheet, tạo job. | Không còn hiệu ứng bay, trượt, nảy, mờ dần nào chạy; màn hình chuyển trạng thái ngay, không có chuyển động thừa |
| RM-02 | Hiệu ứng hoa bay đã bỏ | Tìm lại chỗ trước đây có hiệu ứng hoa bay. | Không còn hoa bay ở bất kỳ màn nào (đã bỏ ở v1; JS kiểm tra `prefers-reduced-motion` trước khi chạy hiệu ứng) |
| RM-03 | Tắt Giảm chuyển động | Tắt cài đặt, mở lại app. | Animation bình thường trở lại (nếu có); app không kẹt ở trạng thái không-animation |

**Tiêu chí đạt nhóm 5:** RM-01, RM-02 đều ĐẠT.

---

## 6. Pinch-zoom + Switch Control (kiểm bổ sung, sau 5 nhóm trên)

| Mã | Ca test | Cách test trên iPhone thật | Kết quả kỳ vọng |
|---|---|---|---|
| PZ-01 | Pinch-zoom màn chi tiết job | Dùng 2 ngón tay chụm rồi mở ra trên màn chi tiết job. | Nội dung phóng to được (đã bỏ `maximum-scale=1, user-scalable=no` khỏi viewport); chữ phóng to vẫn đọc được, cuộn được |
| PZ-02 | Pinch-zoom màn báo cáo | Lặp lại PZ-01 ở màn báo cáo tiền. | Phóng to được; bảng số liệu không vỡ layout khi zoom |
| SC-01 | Switch Control tới nút nhảy bước | Bật Cài đặt → Trợ năng → Điều khiển bằng công tắc (Switch Control), dùng 1 công tắc quét tới 8 nút nhảy bước. | Tới được từng nút nhảy bước sau khi sửa lên 44px; focus quét đúng thứ tự, không bỏ nút nào |
| SC-02 | Switch Control tạo job | Dùng Switch Control đi hết form tạo job rồi lưu. | Tới được mọi ô nhập và nút Lưu; không có ô nào bị quét bỏ qua |

**Tiêu chí đạt nhóm 6:** PZ-01, PZ-02, SC-01 đều ĐẠT. SC-02 là kiểm bổ sung.

---

## Bảng tổng hợp (điền sau khi chạy)

| Nhóm | Số ca | Đạt | Không đạt | Ghi chú |
|---|---|---|---|---|
| 1. VoiceOver (VO-01 → VO-11) | 11 | | | |
| 2. Chữ lớn nhất (DT-01 → DT-07) | 7 | | | |
| 3. Tương phản sáng/tối (CT-01 → CT-10) | 10 | | | |
| 4. Vùng chạm 44pt (TT-01 → TT-06) | 6 | | | |
| 5. Giảm chuyển động (RM-01 → RM-03) | 3 | | | |
| 6. Pinch-zoom + Switch Control (PZ-01 → SC-02) | 4 | | | |
| **Tổng** | **41** | | | |

**Điều kiện qua:** tất cả ca bắt buộc (VO-01 → VO-09, DT-01 → DT-05, CT-01 → CT-08, TT-01 → TT-03, RM-01 → RM-02, PZ-01 → PZ-02, SC-01) đều ĐẠT. Ca bổ sung KHÔNG ĐẠT thì ghi vào backlog, không chặn nộp trừ khi là lỗi chặn người dùng (ví dụ VoiceOver đọc trống nút Lưu).

---

## Báo cáo 7 mục (Quy trình Vibe Coding)

**1. Mục tiêu:** Viết kế hoạch test trợ năng cho FotoBro iOS v1, bám đúng 4 lỗi chặn + 5 điểm nên sửa trong `ACCESSIBILITY.md`: VoiceOver (đọc đủ nút chính, thứ tự đọc), chữ lớn nhất iOS, tương phản sáng/tối, vùng chạm tối thiểu 44pt, giảm chuyển động — mỗi mục ghi cách test trên iPhone thật + kết quả kỳ vọng.

**2. Đã thực hiện:** Đọc `ACCESSIBILITY.md` (4 lỗi cần sửa: viewport khoá zoom, font px không theo Dynamic Type, trắng trên đỏ 3.79:1, nút pipeline 28px; 5 điểm nên sửa: vạch tiến độ không nhãn, 7 nút icon-only thiếu aria-label, switch thiếu role, chữ 12px, chữ trên ảnh/nền mờ) và kiểm lại nhanh `www/index.html` (meta viewport vẫn còn `maximum-scale=1, user-scalable=no` lúc 00:21 20/11 — đúng như rà soát ghi, chưa sửa). Chỉ viết file mới duy nhất `batch-testing/A11Y-TEST-PLAN.md`, không sửa bất kỳ file nào trong `~/workspace/fotobro-ios-v1/`.

**3. Kết quả kiểm tra:** File kế hoạch gồm 41 ca test chia 6 nhóm: VoiceOver 11 ca (VO-01 → VO-11), chữ lớn nhất 7 ca (DT-01 → DT-07), tương phản 10 ca (CT-01 → CT-10, kèm tỉ lệ WCAG trước/sau sửa), vùng chạm 6 ca (TT-01 → TT-06), giảm chuyển động 3 ca (RM-01 → RM-03), pinch-zoom + Switch Control 4 ca (PZ-01 → SC-02). Mỗi ca có cách test trên iPhone thật + kết quả kỳ vọng + tiêu chí đạt theo nhóm. Có điều kiện tiên quyết P0–P3 và bảng tổng hợp kết quả.

**4. Vấn đề còn tồn tại:** Chưa chạy test trên iPhone thật — mọi kết quả kỳ vọng trong file là kỳ vọng sau khi sửa code, chưa có kết quả thực tế nào. Meta viewport vẫn khoá zoom lúc kiểm (00:21 20/11), nên PZ-01/PZ-02 dự kiến KHÔNG ĐẠT cho tới khi agent chính sửa xong. Chưa rõ ai sẽ là người chạy test trên máy thật (cần iPhone SE + 1 máy màn lớn) và chưa có TestFlight build chứa bản sửa.

**5. Điều kiện chuyển bước:** Agent chính sửa xong 4 lỗi mục 2 của `ACCESSIBILITY.md` (P0–P3 trong file này), có build TestFlight mới, rồi QA chạy 41 ca trên iPhone thật theo file này.

**6. Bước tiếp theo:** Sửa 4 lỗi chặn → build TestFlight → chạy 41 ca test, điền bảng tổng hợp → ca nào KHÔNG ĐẠT thì trả lại agent chính sửa, chạy lại ca đó.

**7. Trạng thái:** Hoàn thành file kế hoạch. Chưa sửa code, chưa test trên máy thật, chưa push GitHub.
