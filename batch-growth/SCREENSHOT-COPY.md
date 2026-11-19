# FotoBro v1 — Câu chữ trên 6 ảnh chụp màn hình App Store

> **Trạng thái:** Bản nháp để Việt duyệt, chưa dùng để chụp hay nhập vào App Store Connect.
> **Ngày viết:** 20/11/2026.
> **Nguồn bám theo:** `APP-STORE-READY.md` §9 (thứ tự và nội dung phải thấy của 6 màn)
> và `SCREENSHOT-DATA.md` (dữ liệu mẫu hư cấu, studio mẫu "An Studio", người dùng mẫu "An").
> **Phạm vi:** chỉ câu chữ phủ lên ảnh (overlay). Không sửa app, không đổi thứ tự 6 ảnh,
> không tạo tài khoản, không push GitHub.

## Quy tắc đã áp dụng khi viết

- Mỗi ảnh: **1 tiêu đề lớn + 1 dòng phụ**, cả tiếng Việt và tiếng Anh.
- Ngắn gọn, đọc được trong **2 giây**: tiêu đề là ý chính, dòng phụ chỉ thêm 1 ý.
- Chỉ viết tính năng **đã có ở v1** theo `APP-STORE-READY.md` §1 và §6:
  Hôm nay, pipeline 8 bước, sổ tiền/báo cáo, Google 1 chạm, nhập Lịch iPhone,
  giá Digital/Film tự điền, khoá Face ID/PIN, cá nhân hoá (màu/logo/mẫu tin/ngôn ngữ/tiền tệ),
  dữ liệu chỉ ở trên máy.
- **Không bịa số liệu:** câu chữ phủ lên ảnh không ghi số tiền, số job hay tỉ lệ nào.
  Mọi con số người xem thấy là số **trong màn hình app**, lấy đúng theo `SCREENSHOT-DATA.md`
  (ví dụ màn 1: đã thu 2.000.000đ, còn thiếu 1.500.000đ; màn 2: Wedding 15.000.000đ,
  cọc 5.000.000đ, bước 6/8 Hậu kỳ; màn 3: thu tuần 12.500.000đ, chi 1.200.000đ).
  Nếu số app hiện khác số trong `SCREENSHOT-DATA.md` thì lấy số app làm chuẩn,
  không sửa ảnh cho khớp file.
- **Không nhắc giọng nói / mic** ở bất kỳ ảnh nào: mic chưa chốt kịp v1 hay dời v1.1
  (`APP-STORE-READY.md` §12 mục 6).
- **Không nhắc tên thật:** không Xèo, không Sadako, không E.L.F. / Super Junior,
  không tên khách thật. Tên trong ảnh chỉ là dữ liệu mẫu hư cấu trong `SCREENSHOT-DATA.md`.
- **Không nhắc giá Nấc 2/3, không nhắc IAP:** v1 miễn phí, chưa chốt giá, chưa bật IAP thật.
- Ảnh 4 có 2 phương án (xem bên dưới): dùng phương án Google chỉ khi Client ID chung
  + xác minh Google đã xong trước lúc submit; nếu chưa xong thì dùng phương án dự phòng
  Nhập từ Lịch iPhone, và sửa mô tả cho khớp.

---

## Ảnh 1 — Màn hình "Hôm nay"

**Màn hình:** Tab Hôm nay. Phải thấy: tiêu đề lớn "Hôm nay", 2 buổi chụp hôm nay
(Thu Hằng — Portrait 09:00; Minh Quân & Lan Chi — Couple 16:00), tiền hôm nay,
ảnh trang chủ đẹp.

- **Tiêu đề (VI):** Một màn hình, cả ngày chụp
- **Dòng phụ (VI):** Ai chụp, mấy giờ, ở đâu, thu bao nhiêu — đủ hết.
- **Headline (EN):** Your whole shoot day, on one screen.
- **Subline (EN):** Who, when, where, and what to collect — all here.

**Không viết:** số tiền cụ thể trong câu phủ; "không bao giờ trễ hẹn" hay hứa hẹn tuyệt đối.

---

## Ảnh 2 — Pipeline job 8 bước

**Màn hình:** Chi tiết 1 job, phần Tiến độ 8 bước. Phải thấy: job Wedding
"Minh Quân & Lan Chi" đang ở bước Hậu kỳ (bước 6/8), 5 bước đầu đã xong,
2 bước cuối chưa xong, nút nhảy bước.

- **Tiêu đề (VI):** Job đi đúng 8 bước, không sót việc
- **Dòng phụ (VI):** Chạm bước nào, nhảy thẳng tới đó.
- **Headline (EN):** Every job, in 8 clear steps.
- **Subline (EN):** Tap any step to jump straight to it.

**Không viết:** tên bước sai thứ tự. Thứ tự đúng: Tư vấn → Chốt cọc → Sắp chụp →
Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.

---

## Ảnh 3 — Sổ tiền / Báo cáo tuần

**Màn hình:** Tab Sổ tiền, xem Báo cáo tuần. Phải thấy: thu–chi tuần rõ ràng,
số dư rõ, còn thiếu bao nhiêu.

- **Tiêu đề (VI):** Thu–chi rõ từng khoản
- **Dòng phụ (VI):** Báo cáo tuần tự tính, còn thiếu bao nhiêu cũng thấy.
- **Headline (EN):** Money, down to every item.
- **Subline (EN):** Weekly reports calculated for you — including what's still owed.

**Không viết:** số thu/chi cụ thể trong câu phủ; từ "kế toán" hay "thuế"
(app không làm kế toán/thuế). Lưu ý ở `SCREENSHOT-DATA.md`: cách app tính
"còn thiếu" tuần này phải kiểm lại trên ảnh thật trước khi chụp, lấy số app làm chuẩn.

---

## Ảnh 4 — Đăng nhập Google 1 chạm + Nhập từ Lịch iPhone

**Màn hình (phương án chính):** Màn trong app sau khi đăng nhập Google.
Phải thấy: Lịch, Gmail gợi ý tiền về / khách hỏi chụp.
Chỉ chụp màn trong app — **không chụp màn đăng nhập của Google,
không chụp màn cảnh báo "ứng dụng chưa xác minh"** (nếu có thì chưa được chụp/submit).

- **Tiêu đề (VI):** Đăng nhập Google một lần, có hết
- **Dòng phụ (VI):** Lịch, Gmail và Danh bạ — ngay trong app.
- **Headline (EN):** Sign in with Google once — and you're done.
- **Subline (EN):** Calendar, Gmail and Contacts, right in the app.

### Phương án dự phòng — chỉ dùng khi Google chưa kịp v1

**Màn hình:** Nhập từ Lịch iPhone (native, 1 chạm). Phải thấy: nút
"Nhập từ Lịch iPhone", danh sách sự kiện 30 ngày tới, nút "Nạp buổi chụp".
Không dùng nhập file .ics cũ — chức năng đó đã bỏ.

- **Tiêu đề (VI):** Nhập buổi chụp từ Lịch iPhone
- **Dòng phụ (VI):** Một chạm, nạp hết 30 ngày tới.
- **Headline (EN):** Import shoots from iPhone Calendar.
- **Subline (EN):** One tap, the next 30 days loaded.

**Không viết ở cả 2 phương án:** "tự động đồng bộ" (v1 là nhập theo thao tác của
người dùng, không phải đồng bộ nền liên tục); địa chỉ email thật nào.

---

## Ảnh 5 — Thêm job mới (kèm bảng giá Digital / Film)

**Màn hình:** Form thêm job mới. Phải thấy: khách / loại chụp / Digital–Film /
ngày giờ / giá tự điền theo loại. Dữ liệu mẫu: Quán Cà Phê Mộc — Lookbook,
Digital, 8.000.000đ, ngày chụp tuần sau, bước mặc định Tư vấn.

- **Tiêu đề (VI):** Thêm job mới trong 10 giây
- **Dòng phụ (VI):** Chọn loại chụp, giá Digital hay Film tự điền sẵn.
- **Headline (EN):** Add a new job in 10 seconds.
- **Subline (EN):** Pick the shoot type — the Digital or Film price fills itself in.

**Không viết:** giá film cụ thể trong câu phủ (giá film do người dùng tự điền
trong Cài đặt → Bảng giá, mặc định 0 = chưa đặt); "báo giá tự động gửi cho khách"
(app không tự gửi báo giá).

---

## Ảnh 6 — Cài đặt / Khoá app

**Màn hình:** Tab Cài đặt — phần khoá app + phần cá nhân hoá. Phải thấy:
công tắc Face ID + PIN đang Bật, 3 preset màu chủ đề, logo studio mẫu,
ngôn ngữ Tiếng Việt, tiền tệ VND.

- **Tiêu đề (VI):** App của bạn, theo cách của bạn
- **Dòng phụ (VI):** Khoá Face ID, màu riêng, logo riêng — dữ liệu chỉ ở trên máy.
- **Headline (EN):** Your app, your way.
- **Subline (EN):** Face ID lock, your theme and logo — data stays on your device.

**Không viết:** số PIN, mật khẩu, Client ID, secret hay email thật.
Chỉ chụp màn công tắc Bật, **không chụp màn nhập PIN**.
Nếu mic kịp v1 thì ảnh này vẫn giữ nguyên (màn giọng nói, nếu có, thay ảnh 4
theo `APP-STORE-READY.md` §9 — không dồn vào ảnh 6).

---

## Checklist trước khi đưa câu chữ này đi chụp

- [ ] Việt duyệt 6 cặp VI/EN trên và chốt dùng phương án chính hay dự phòng ở ảnh 4.
- [ ] Chụp bằng iPhone thật qua TestFlight, 2 bộ 6.7" (1290×2796) và 6.5" (1242×2688),
  light mode cho bộ chính, đúng thứ tự 1 → 6.
- [ ] Dữ liệu trong ảnh khớp `SCREENSHOT-DATA.md`; số nào app hiện khác thì lấy số app,
  không sửa ảnh.
- [ ] Không có tên/email/số điện thoại thật, không màn lỗi, không màn trống,
  không màn cảnh báo Google chưa xác minh trong bất kỳ ảnh nào.
- [ ] Sau khi chụp xong, xoá hết dữ liệu mẫu khỏi bản TestFlight trước khi gửi Apple duyệt
  (hoặc giữ lại với ghi chú rõ "đây là dữ liệu mẫu" trong Notes cho reviewer).
