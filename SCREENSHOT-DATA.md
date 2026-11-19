# FotoBro v1 — Dữ liệu mẫu hư cấu cho 6 screenshot App Store

> **Trạng thái:** Bản chuẩn bị trước khi chụp, để Việt duyệt.
> **Ngày viết:** 20/11/2026.
> **Nguồn:** bám đúng danh sách 6 màn trong `APP-STORE-READY.md` §9
> (thứ tự 1 → 6, đúng nội dung phải thấy của từng màn).
> **Quy tắc bắt buộc:**
> - Tất cả tên khách, tên studio, địa điểm, số điện thoại, email trong
>   file này đều là **hư cấu**, đặt ra chỉ để chụp ảnh.
> - **Không dùng** tên, ảnh, job hay tiền thật của Xèo, của Sadako
>   Photography, hay của bất kỳ khách thật nào. Không dùng tên trong
>   job mẫu cũ của app (ví dụ: Mai Anh & Tuấn Kiệt, Ngọc Trâm, Khánh
>   Linh & Đức Anh, Phương Thảo, Shop Áo Dài Lụa Là).
> - Ngày chụp ghi theo dạng tương đối (**Hôm nay, +2 ngày, +5 ngày…**)
>   để lúc nào chụp cũng còn đúng; khi nhập vào app thì lấy ngày thật
>   theo lịch chụp hôm đó.
> - Trước khi chụp: nhập đủ 6 bộ dữ liệu dưới đây vào bản TestFlight,
>   đặt 1 ảnh trang chủ đẹp (ảnh chung, không phải ảnh khách thật),
>   tắt thông báo lạ, để điện thoại ở **light mode** cho bộ chính.
> - Không chụp màn có tên/email/số điện thoại thật, màn lỗi, màn trống.
> - Studio mẫu trong các screenshot: tên hư cấu **"An Studio"**,
>   người dùng mẫu tên **"An"** — không phải tên thật của ai.

---

## Bộ 0 — Dữ liệu chung (nhập 1 lần trước khi chụp)

Dùng cho mọi màn, để các con số ở các screenshot khớp nhau.

| Trường | Nhập vào Cài đặt |
|---|---|
| Tên gọi trong app | An |
| Tên studio | An Studio |
| Instagram | (để trống — không dùng tài khoản thật) |
| Tiền tệ | VND |
| Ngôn ngữ | Tiếng Việt |
| Màu chủ đề | Ấm (preset mặc định) |
| Logo studio | Logo FotoBro mẫu (không dùng logo thật của studio nào) |
| Ảnh trang chủ | 1 ảnh phong cảnh/chân dung chung, không phải ảnh khách thật |

**Bảng giá mẫu (nhập trong Cài đặt → Bảng giá):**

| Loại job | Digital | Film |
|---|---|---|
| Portrait | 2.500.000đ | 3.500.000đ |
| Couple | 4.000.000đ | 5.500.000đ |
| Wedding | 15.000.000đ | 20.000.000đ |
| Lookbook | 8.000.000đ | 10.000.000đ |
| Event | 5.000.000đ | 7.000.000đ |

---

## Screenshot 1 — Màn hình "Hôm nay"

**Màn hình:** Tab Hôm nay (màn đầu tiên người ta thấy trên App Store).

**Nội dung phải thấy rõ:** Tiêu đề lớn "Hôm nay" kiểu Apple Music,
lịch chụp hôm nay (2 buổi), tiền hôm nay (đã thu + còn thiếu),
ảnh trang chủ đẹp.

**Dữ liệu mẫu cần nhập:**

| Buổi chụp | Khách (hư cấu) | Loại | Giờ | Địa điểm (hư cấu) | Trạng thái |
|---|---|---|---|---|---|
| 1 | Thu Hằng | Portrait | 09:00 | Công viên Lê Văn Tám (hư cấu — chỉ là tên địa điểm ví dụ) | Sắp chụp |
| 2 | Minh Quân & Lan Chi | Couple | 16:00 | Bờ sông Sài Gòn | Sắp chụp |

**Con số phải thấy rõ trên màn:**
- Tiền hôm nay: **đã thu 2.000.000đ, còn thiếu 1.500.000đ**
- Cách tạo ra 2 con số này — "đã thu hôm nay" chỉ tính tiền thu
  trong ngày hôm nay: cọc Portrait 2.000.000đ thu hôm nay. "Còn
  thiếu" là tổng còn thiếu của 2 buổi hôm nay: Portrait giá
  2.500.000đ − đã thu 2.000.000đ = còn thiếu 500.000đ; Couple giá
  4.000.000đ, đã thu cọc 3.000.000đ **từ tuần trước** (nên không tính
  vào tiền hôm nay) = còn thiếu 1.000.000đ. Cộng lại: còn thiếu
  500.000đ + 1.000.000đ = **1.500.000đ**.
- Job kẹt (nếu có): không để job kẹt hiện ở màn này — màn 1 phải gọn,
  chỉ 2 buổi hôm nay + tiền hôm nay.

**Kiểm trước khi chụp:** 2 buổi đều ở ngày "Hôm nay", không có buổi
nào ở ngày khác lọt vào; không có tên thật, không có thông báo lạ.

---

## Screenshot 2 — Pipeline job 8 bước

**Màn hình:** Chi tiết 1 job, phần Tiến độ 8 bước.

**Nội dung phải thấy rõ:** Job đang ở giữa pipeline, thấy rõ bước đã
xong / đang làm / sắp tới, nút nhảy thẳng tới bước bất kỳ.

**Dữ liệu mẫu cần nhập:**

| Trường | Giá trị (hư cấu) |
|---|---|
| Khách | Minh Quân & Lan Chi |
| Loại job | Wedding |
| Chụp bằng | Digital |
| Ngày chụp | +5 ngày (sau hôm chụp màn 1) |
| Giờ chụp | 08:00 |
| Địa điểm | Nhà hàng Hoa Sen, Quận 1 (tên hư cấu) |
| Hạn giao ảnh | +12 ngày |
| Giá job | **15.000.000đ** |
| Đã thu cọc | **5.000.000đ** (ghi ở bước Chốt cọc) |
| Còn thiếu | **10.000.000đ** |
| Đang ở bước | **Hậu kỳ — bước 6/8** |

**Tiến độ phải thấy rõ:**
- Đã xong: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh
  (5 bước đầu tô đậm/đã xong).
- Đang làm: **Hậu kỳ (bước 6/8)** — hiện tên bước to + "Bước 6/8".
- Sắp tới: Đã giao → Xong (mờ/chưa xong).
- Nút "Xong bước này → Đã giao" thấy được, và chạm vào 1 bước bất
  kỳ thì nhảy thẳng tới đó.

**Kiểm trước khi chụp:** giá 15.000.000đ và đã thu 5.000.000đ khớp
nhau ở cả màn chi tiết job và Sổ tiền; không hiện cảnh báo thiếu
tiền ở màn này (cảnh báo chỉ hiện khi bấm Xong mà còn thiếu).

---

## Screenshot 3 — Sổ tiền / Báo cáo tuần

**Màn hình:** Tab Sổ tiền, xem Báo cáo tuần.

**Nội dung phải thấy rõ:** Báo cáo tuần, thu–chi rõ ràng, số dư rõ,
còn thiếu bao nhiêu.

**Dữ liệu mẫu cần nhập (cùng tuần với màn 1 và 2):**

| Khoản | Loại | Số tiền | Ghi chú |
|---|---|---|---|
| Thu cọc Wedding Minh Quân & Lan Chi | Thu — theo job | 5.000.000đ | Đã thu ở bước Chốt cọc |
| Thu cọc Portrait Thu Hằng | Thu — theo job | 2.000.000đ | Đã thu hôm nay |
| Thu cọc Couple Minh Quân & Lan Chi | Thu — theo job | 0đ | Chưa thu (để màn 1 còn thiếu 1.500.000đ) |
| Thu thêm: chụp thêm giờ (Wedding) | Thu — phát sinh | 5.500.000đ | Phát sinh thêm giờ |
| Chi: thuê đèn | Chi — thiết bị | 800.000đ | Thuê đèn buổi Wedding |
| Chi: xăng xe đi chụp | Chi — vận hành tháng | 400.000đ | Xăng xe tuần này |

**Con số phải thấy rõ trên màn:**
- Tuần này: **thu 12.500.000đ** (5.000.000 + 2.000.000 + 5.500.000),
  **chi 1.200.000đ** (800.000 + 400.000),
  **còn thiếu 3.000.000đ** (xem cách tính dưới).
- "Còn thiếu 3.000.000đ" ở đây là tổng các khoản **tới hạn trong
  tuần này**: Portrait còn thiếu 500.000đ + Couple còn thiếu
  1.000.000đ + Wedding đợt 2 (1.500.000đ, tới hạn trong tuần này,
  chưa thu). Cọc Couple 3.000.000đ thu từ tuần trước nên **không**
  tính vào thu tuần này — thu tuần này vẫn là 12.500.000đ.
  **Kiểm lại trong app trước khi chụp: nếu app tính "còn thiếu"
  theo cách khác (ví dụ tổng còn thiếu của mọi job = 11.500.000đ)
  thì lấy đúng số app hiện, rồi sửa lại dòng này cho khớp với ảnh
  thật — không cố giữ số 3.000.000đ nếu app tính khác.**
- Số dư tuần = thu − chi = 11.300.000đ (12.500.000 − 1.200.000).

**Kiểm trước khi chụp:** các khoản trên đều nằm trong cùng 1 tuần
đang xem; không có khoản tiền thật nào lẫn vào; số đã thu ở màn 3
khớp với màn 1 (2.000.000đ hôm nay nằm trong 12.500.000đ tuần này).

---

## Screenshot 4 — Đăng nhập Google 1 chạm

**Màn hình:** Màn trong app sau khi bấm "Đăng nhập Google"
(chỉ chụp màn trong app, **không chụp màn đăng nhập của Google**,
không chụp màn cảnh báo "ứng dụng chưa xác minh" nếu có).

**Nội dung phải thấy rõ:** Nút "Đăng nhập Google" + sau khi đăng
nhập thấy Lịch, Gmail gợi ý tiền về / khách hỏi chụp.

**Dữ liệu mẫu cần có trong tài khoản Google test (hư cấu):**

| Nguồn | Nội dung mẫu (hư cấu) | Hiện trong app ra sao |
|---|---|---|
| Google Lịch | Sự kiện "Chụp Portrait — Thu Hằng", hôm nay 09:00 | Hiện trong tab Buổi chụp → Lịch, có nhãn "Google" |
| Gmail — tiền về | Email ngân hàng mẫu: "Tài khoản của bạn vừa nhận 2.000.000đ" (tài khoản test, không phải ngân hàng thật) | Hiện ở mục "Tiền về từ Gmail", gợi ý "Ghi vào sổ…" |
| Gmail — khách hỏi | Email mẫu từ "khach.mau@example.com": "Chào An, mình muốn hỏi lịch chụp Couple tháng sau, báo giá giúp mình nhé" | Hiện ở mục "Khách hỏi qua Gmail", gợi ý "Tạo buổi chụp (Tư vấn)…" |

**Con số phải thấy rõ trên màn:** 1 gợi ý tiền về **2.000.000đ**
(khớp với cọc Portrait ở màn 1) và 1 khách hỏi chụp Couple.

**Nếu Google chưa kịp v1:** thay màn này bằng màn **Nhập từ Lịch
iPhone** (native, 1 chạm — không phải nhập file .ics cũ, chức năng
nhập file cũ đã bỏ): nút "Nhập từ Lịch iPhone", sau khi cấp quyền
thấy danh sách sự kiện 30 ngày tới đã tích chọn sẵn, nút "Nạp buổi
chụp". Dữ liệu mẫu dùng chung sự kiện Lịch ở bảng trên.

**Kiểm trước khi chụp:** dùng tài khoản Google **test riêng**, không
dùng Gmail thật của Việt/Xèo; không để lộ địa chỉ email thật trên màn;
không chụp màn cảnh báo xác minh của Google.

---

## Screenshot 5 — Thêm job mới

**Màn hình:** Form thêm job mới (bấm nút "+" / "Thêm job").

**Nội dung phải thấy rõ:** Form gọn — khách / loại chụp /
Digital-Film / ngày giờ / giá tự điền theo loại.

**Dữ liệu mẫu cần nhập vào form (chưa bấm Lưu khi chụp, hoặc chụp
ngay sau khi lưu thấy job mới hiện trong danh sách):**

| Trường trong form | Giá trị (hư cấu) |
|---|---|
| Khách | Quán Cà Phê Mộc (tên quán hư cấu) |
| Loại job | Lookbook |
| Chụp bằng | Digital |
| Ngày chụp | +7 ngày (tuần sau) |
| Giờ chụp | 09:00 |
| Địa điểm | Quán Cà Phê Mộc, Quận 3 (hư cấu) |
| Giá | **8.000.000đ** (tự điền theo bảng giá Lookbook Digital) |
| Đang ở bước | Tư vấn (mặc định khi tạo job mới) |

**Con số phải thấy rõ trên màn:** giá **8.000.000đ** đã tự điền sẵn
khi chọn Lookbook + Digital, không phải gõ tay.

**Kiểm trước khi chụp:** form không còn dữ liệu thật nào; ngày chụp
là tuần sau, không trùng ngày hôm nay; sau khi chụp xong thì **xoá
job mẫu này hoặc để lại** tuỳ ý — nếu để lại thì nó sẽ hiện trong
danh sách job ở các màn khác, phải kiểm lại màn 1–3 không bị lệch
số vì job này (job mới ở bước Tư vấn, chưa thu tiền nên không làm
lệch tiền hôm nay/tuần này).

---

## Screenshot 6 — Cài đặt / Khoá app

**Màn hình:** Tab Cài đặt — phần khoá app + phần cá nhân hoá.

**Nội dung phải thấy rõ:** Khoá Face ID + PIN đang bật, và phần cá
nhân hoá (màu chủ đề, logo studio) — chứng minh app riêng tư, dữ
liệu ở trên máy.

**Dữ liệu mẫu cần nhập:**

| Mục trong Cài đặt | Giá trị mẫu |
|---|---|
| Tên gọi | An |
| Tên studio | An Studio |
| Khoá app | Face ID: **Bật**; PIN: **Bật** (không hiện số PIN thật trên màn — chụp màn công tắc Bật, không chụp màn nhập PIN) |
| Màu chủ đề | Ấm (preset đang chọn, tô đậm) — thấy được 3 preset: Ấm / Tối giản / Tối |
| Logo studio | Logo FotoBro mẫu đã thêm (hiện thu nhỏ trong Cài đặt) |
| Ngôn ngữ | Tiếng Việt |
| Tiền tệ | VND |
| Mẫu tin nhắn | Hiện 1 mẫu đã sửa theo giọng mẫu (xem dưới) |

**Mẫu tin nhắn mẫu (đã sửa, hư cấu):**
> "Chào bạn, ảnh buổi chụp của bạn đã xong rồi nè. Bạn xem và tải
> ảnh ở đây nhé. Cảm ơn bạn đã tin tưởng An Studio!"

**Không chụp:** màn có Client ID, secret, email thật, số điện thoại
thật, mật khẩu, mã PIN, hay bất kỳ thông tin đăng nhập nào.

**Kiểm trước khi chụp:** công tắc Face ID + PIN đều ở trạng thái
Bật; không có thông tin thật nào trên màn; logo hiện đúng là logo
mẫu, không phải logo thật của studio nào.

---

## Checklist khớp số giữa 6 màn (kiểm 1 lần trước khi chụp)

| Con số | Màn 1 | Màn 2 | Màn 3 | Ghi chú |
|---|---|---|---|---|
| Đã thu hôm nay | 2.000.000đ | — | nằm trong thu tuần 12.500.000đ | Portrait cọc 2.000.000đ |
| Còn thiếu hôm nay | 1.500.000đ | — | — | 500.000đ Portrait + 1.000.000đ Couple |
| Giá Wedding | — | 15.000.000đ | — | Cọc đã thu 5.000.000đ |
| Thu tuần | — | — | 12.500.000đ | 5.000.000 + 2.000.000 + 5.500.000 |
| Chi tuần | — | — | 1.200.000đ | 800.000 + 400.000 |
| Giá Lookbook mới | — | — | — | Màn 5: 8.000.000đ, Digital |

**Nguyên tắc cuối:** nếu số app hiện khác số trong file này (do
cách app tính còn thiếu/tuần), thì **lấy số app hiện làm chuẩn** và
sửa lại file này cho khớp với ảnh thật — không chỉnh ảnh cho khớp
với file. Sau khi chụp xong, **xoá hết 6 bộ dữ liệu mẫu** khỏi bản
TestFlight trước khi gửi Apple duyệt, hoặc giữ lại với ghi chú rõ
"đây là dữ liệu mẫu" trong Notes cho reviewer.
