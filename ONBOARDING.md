# Onboarding FotoBro v1 — 3 màn chào, 30 giây

> Trạng thái: THIẾT KẾ, chưa code. File này chỉ mô tả, không sửa app.
> Mục tiêu: người mới mở app lần đầu hiểu trong 30 giây, tối đa 3 chạm là vào được màn Hôm nay.
> Nguyên tắc v1: tối giản, kiểu Apple Music (Large Title, SF Pro, nền trắng sạch + dark mode đen, 1 màu nhấn đỏ `#FA2D48`, thẻ bo góc lớn, tab bar mờ). Không dạy dài, không bắt điền bắt buộc.

## Khi nào hiện

- Chỉ hiện **lần đầu mở app** (chưa có dữ liệu: chưa có job nào + chưa hoàn thành onboarding).
- Lưu cờ `cfg.onboarded = true` vào local khi người dùng bấm **Bắt đầu** ở màn cuối, hoặc bấm **Bỏ qua** ở bất kỳ màn nào.
- Sau đó không hiện lại. Có nút xem lại trong Cài đặt → Giới thiệu (không bắt buộc ở v1, ghi chú ở mục 6).
- Người dùng cũ (đã có job trong `troLyXeo.v1`) **không** thấy onboarding.

## Khung chung 3 màn

| Thành phần | Quy định |
|---|---|
| Tiêu đề | Large Title, 1 dòng, SF Pro Bold, tối đa 6 chữ |
| Câu giải thích | 1 câu duy nhất, tối đa 20 chữ, màu xám phụ, cỡ 17 |
| Hình minh hoạ | 1 hình lớn giữa màn, mô tả bằng chữ ở từng màn dưới đây (dùng SF Symbols / hình vẽ phẳng, không dùng ảnh thật của Xèo, không dùng ảnh mẫu base64) |
| Chấm trang | 3 chấm dưới hình, chấm hiện tại màu nhấn, còn lại xám nhạt |
| Nút chính | 1 nút to, bo tròn, nền màu nhấn, chữ trắng: **Tiếp** (màn 1–2), **Bắt đầu** (màn 3, xem mục 4) |
| Nút phụ | Chữ **Bỏ qua** ở góc trên phải, màu xám, bấm là vào thẳng Hôm nay và đánh dấu đã onboarding |
| Vuốt | Vuốt trái/phải để chuyển màn, giống vuốt trang trong Apple Music |

## Màn 1 — Hôm nay là gì

- **Tiêu đề:** `Hôm nay của bạn`
- **Câu (1 câu duy nhất):** `Mở app là thấy buổi chụp, tiền cần thu và việc cần làm hôm nay.`
- **Bản tiếng Anh:** `Open the app and see today's shoots, money to collect, and what to do.`
- **Hình minh hoạ (mô tả):** Thẻ lớn kiểu Apple Music: 1 ảnh buổi chụp (placeholder màu xám nhạt, icon máy ảnh trắng ở giữa), bên dưới là tên khách đậm + giờ chụp + số tiền cần thu đậm bên phải. Dưới thẻ là 2 dòng nhỏ: 1 buổi chụp sắp tới, 1 khoản tiền chưa thu.
- **Nút:** `Tiếp` → màn 2. `Bỏ qua` → Hôm nay.

## Màn 2 — Job chạy qua 8 bước thế nào

- **Tiêu đề:** `Một job, 8 bước`
- **Câu (1 câu duy nhất):** `Mỗi job đi từ Tư vấn tới Xong, chạm vào bước nào cũng nhảy thẳng tới đó.`
- **Bản tiếng Anh:** `Every job goes from Enquiry to Done — tap any step to jump straight to it.`
- **Hình minh hoạ (mô tả):** Hàng ngang 8 chấm nối nhau bằng 1 đường mảnh (kiểu thanh tiến độ tối giản), chấm hiện tại to màu nhấn, chấm đã qua đầy màu, chấm chưa tới viền xám. Dưới hàng chấm là 3 nhãn bước mẫu, từ trái sang phải: `Tư vấn` → `Đã chụp` → `Đã giao`, nhãn giữa đậm hơn. Không vẽ cả 8 tên bước lên hình (chật, khó đọc).
- **8 bước thật trong app (không đổi tên):** Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.
- **Nút:** `Tiếp` → màn 3. `Bỏ qua` → Hôm nay.

## Màn 3 — Tiền + nhắc lịch

- **Tiêu đề:** `Tiền và lịch, rõ ràng`
- **Câu (1 câu duy nhất):** `Ghi cọc lúc chốt, thu nốt lúc giao, app nhắc trước buổi chụp 12 tiếng.`
- **Bản tiếng Anh:** `Record the deposit when you confirm, collect the rest on delivery — the app reminds you 12 hours before each shoot.`
- **Hình minh hoạ (mô tả):** 2 thẻ xếp dọc kiểu Apple Music. Thẻ trên: dòng `Còn thiếu 5.000.000 đ` đậm, dưới là thanh tiến độ mảnh đã đầy 2/3 màu nhấn. Thẻ dưới: icon chuông + dòng `Nhắc chụp: Mai Anh & Tuấn Kiệt — 08:00 mai`, giờ đậm.
- **Nút:** `Tiếp` → màn form cuối (mục 4), **không** vào thẳng Hôm nay. `Bỏ qua` → Hôm nay.

## Màn cuối — Form nhập nhanh (không bắt buộc)

Sau màn 3 mới hiện form, không gộp vào màn 3 để không dài.

- **Tiêu đề:** `Cho app biết về bạn`
- **Câu:** `Điền hay để trống đều được, sửa lại sau trong Cài đặt.`
- **Các ô (tất cả đều không bắt buộc, để trống được):**
  1. `Tên gọi của bạn` — text, ví dụ `Minh Anh`. Để trống thì app chào là `bạn`.
  2. `Tên studio` — text, ví dụ `Minh Anh Studio`. Để trống thì email/chữ ký không có tên studio.
  3. `Bảng giá — Digital (đ)` — 5 ô số, 1 ô cho mỗi loại: Portrait, Couple, Wedding, Lookbook, Event. Mặc định `0` = chưa đặt, giống `prices:{ Portrait:0, Couple:0, Wedding:0, Lookbook:0, Event:0 }` trong app hiện tại. Người dùng chỉ điền giá nào mình có, bỏ trống các ô còn lại.
  4. `Bảng giá — Film (đ)` — 5 ô số tương tự, mặc định `0` = chưa đặt. Film là lựa chọn cho mọi gói (Digital / Film / Cả hai), giá film do người dùng tự điền.
- **Nút:** `Bắt đầu` (màu nhấn, to) → lưu các ô đã điền vào `cfg` (tên, studio, `prices`, giá film), đặt `cfg.onboarded = true`, vào màn Hôm nay.
- **Nút phụ:** `Để sau` (chữ xám dưới nút Bắt đầu) → không lưu gì, đặt `cfg.onboarded = true`, vào màn Hôm nay.
- **Không** bắt nhập email, số điện thoại, mật khẩu, hay đăng nhập Google ở onboarding. Đăng nhập Google và nhập Lịch iPhone nằm trong Cài đặt, làm sau khi vào app.

## Những gì KHÔNG làm ở onboarding v1

- Không hỏi quyền (Lịch, Ảnh, Micro, Thông báo) ngay lúc chào — hỏi quyền khi người dùng bấm tính năng cần quyền lần đầu (nhập Lịch iPhone, thêm ảnh, giọng nói, nhắc lịch).
- Không giới thiệu E.L.F. / Super Junior, không ảnh mẫu, không job mẫu (đã bỏ khỏi v1).
- Không giới thiệu CloudKit / thu phí Nấc 2/3 ở onboarding — chỉ nhắc trong Cài đặt sau.
- Không video, không animation nặng, không quá 3 màn + 1 form.

## Kiểm chứng (chấp nhận khi đủ)

1. Mở app lần đầu (xoá dữ liệu): thấy đúng 3 màn + form, mỗi màn đúng 1 câu như trên, không thừa chữ.
2. Bấm `Bỏ qua` ở màn 1: vào Hôm nay ngay, mở lại app không thấy onboarding nữa.
3. Đi hết 3 màn, để trống toàn bộ form, bấm `Bắt đầu`: vào Hôm nay, tên chào là `bạn`, giá các gói vẫn `0`.
4. Đi hết 3 màn, điền tên + studio + 1 giá Portrait, bấm `Bắt đầu`: màn Hôm nay chào đúng tên, tạo job Portrait mới tự điền đúng giá đó.
5. Sáng + tối đều đọc được, chữ không tràn trên iPhone SE (màn nhỏ nhất v1 hỗ trợ).
6. Vuốt trái/phải chuyển màn được, chấm trang đổi đúng.

## Ghi chú cho agent code sau này

- Copy trong file này là bản chốt cho v1; bản tiếng Anh là bản dịch trực tiếp, không cần dịch lại.
- Hình minh hoạ: dùng SF Symbols (`camera.fill`, `bell.fill`, `creditcard.fill`) + hình vẽ phẳng bằng SwiftUI/CSS, không dùng ảnh thật.
- Cờ onboarding: dùng chung key `cfg` đã có trong app (`troLyXeo.v1`), thêm field `onboarded`, không tạo key lưu trữ mới.
