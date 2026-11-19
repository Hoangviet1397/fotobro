# FotoBro v1 — Hướng dẫn chụp 6 ảnh App Store trên iPhone thật

> **Phạm vi:** Chỉ hướng dẫn chụp. Không sửa app, không tạo tài khoản, không push GitHub.
> **Nguồn dữ liệu duy nhất:** `~/workspace/fotobro-ios-v1/SCREENSHOT-DATA.md`
> (dữ liệu mẫu hư cấu, bộ 0–6) và `~/workspace/fotobro-ios-v1/APP-STORE-READY.md` §9
> (danh sách 6 màn, thứ tự 1 → 6) và §11B (chụp trên iPhone thật qua TestFlight).
> **App:** FotoBro v1, Bundle ID `com.fotobro.app`, repo `Hoangviet1397/fotobro`.
> **Ngày viết:** 20/11/2026.

## 0. Quy tắc vàng — đọc trước khi cầm máy

1. **Chụp bằng iPhone thật qua TestFlight, không chụp từ trình duyệt máy tính**
   (màu và chữ sẽ khác — APP-STORE-READY §9).
2. **Chỉ dùng dữ liệu hư cấu trong SCREENSHOT-DATA.md.** Không dùng tên, ảnh,
   job hay tiền thật của Xèo, của Sadako Photography, hay của bất kỳ khách
   thật nào. Không dùng tên trong job mẫu cũ của app (Mai Anh & Tuấn Kiệt,
   Ngọc Trâm, Khánh Linh & Đức Anh, Phương Thảo, Shop Áo Dài Lụa Là).
   Studio mẫu trong mọi ảnh: **"An Studio"**, người dùng mẫu tên **"An"**.
3. **Không chụp:** màn có tên/email/số điện thoại thật, màn lỗi, màn trống
   không có dữ liệu, màn đăng nhập của Google, màn cảnh báo "ứng dụng chưa
   xác minh" của Google, màn nhập PIN (chỉ chụp công tắc Bật — xem màn 6),
   màn có Client ID / secret / mật khẩu.
4. **Nếu số app hiện khác số trong file này** (do cách app tính "còn thiếu" /
   "tuần"), **lấy số app hiện làm chuẩn** và sửa lại SCREENSHOT-DATA.md cho
   khớp với ảnh thật — không chỉnh ảnh cho khớp với file.
5. **Sau khi chụp xong:** xoá hết 6 bộ dữ liệu mẫu khỏi bản TestFlight trước
   khi gửi Apple duyệt, hoặc giữ lại với ghi chú rõ "đây là dữ liệu mẫu"
   trong Notes cho reviewer.

## 1. Kích thước và số lượng ảnh cần chụp

| Bộ | Kích thước ảnh (pixel) | iPhone dùng để chụp | Số ảnh |
|---|---|---|---|
| **6.7"** | **1290 × 2796** | iPhone 14 / 15 / 16 Pro Max | 6 ảnh |
| **6.5"** | **1242 × 2688** | iPhone 11 Pro Max / XS Max | 6 ảnh |

- Tổng cộng **12 file** (6 màn × 2 bộ), đúng thứ tự 1 → 6 trong cả hai bộ.
  Ảnh 1 là ảnh đầu tiên người dùng thấy trên App Store.
- Tối đa 10 ảnh/bộ, tối thiểu 1 ảnh/bộ — làm **6 ảnh/bộ** theo danh sách này.
- iPad: **không bắt buộc** — app chỉ làm cho iPhone (portrait). Khai iPad
  không hỗ trợ thì khỏi chụp iPad.
- Ảnh chụp màn hình iPhone (nút Nguồn + Tăng âm lượng) ra đúng kích thước
  native của máy — **không crop, không resize, không nén lại** trước khi tải
  lên App Store Connect. Kiểm tra kích thước thật trong Ảnh → thông tin ảnh
  trước khi tải lên (xem §5).

### Đặt tên file gợi ý (để khỏi nhầm bộ khi tải lên)

```
fotobro-6.7-01-today.png
fotobro-6.7-02-pipeline.png
fotobro-6.7-03-money.png
fotobro-6.7-04-google.png        (hoặc fotobro-6.7-04-calendar.png nếu dùng màn thay thế, xem màn 4)
fotobro-6.7-05-add-job.png
fotobro-6.7-06-settings.png
fotobro-6.5-01-today.png
… (tương tự, đổi 6.7 thành 6.5)
```

## 2. Trước khi chụp — chuẩn bị (làm đủ rồi mới chụp ảnh 1)

### 2.1. Cài app và nhập dữ liệu mẫu

1. Cài bản FotoBro v1 qua **TestFlight** trên iPhone sẽ chụp (bộ 6.7" chụp
   trước, rồi lặp lại toàn bộ trên máy 6.5" — hoặc nhập lại cùng dữ liệu
   trên máy thứ hai).
2. Nhập **Bộ 0 — dữ liệu chung** (SCREENSHOT-DATA.md) **một lần**, trong
   Cài đặt, trước mọi màn:
   - Tên gọi trong app: **An** — Tên studio: **An Studio**
   - Instagram: **để trống** (không dùng tài khoản thật)
   - Tiền tệ: **VND** — Ngôn ngữ: **Tiếng Việt**
   - Màu chủ đề: **Ấm** (preset mặc định)
   - Logo studio: **logo FotoBro mẫu** (không dùng logo thật của studio nào)
   - Ảnh trang chủ: **1 ảnh phong cảnh/chân dung chung**, đẹp, không phải
     ảnh khách thật.
3. Nhập **bảng giá mẫu** trong Cài đặt → Bảng giá (cả Digital và Film):

   | Loại job | Digital | Film |
   |---|---|---|
   | Portrait | 2.500.000đ | 3.500.000đ |
   | Couple | 4.000.000đ | 5.500.000đ |
   | Wedding | 15.000.000đ | 20.000.000đ |
   | Lookbook | 8.000.000đ | 10.000.000đ |
   | Event | 5.000.000đ | 7.000.000đ |

4. Nhập đủ dữ liệu cho màn 1–3 và màn 5–6 theo từng mục dưới đây **trước
   khi chụp ảnh đầu tiên**, để các con số khớp nhau giữa các ảnh. Riêng
   màn 4 (Google) chuẩn bị tài khoản Google test riêng — xem màn 4.
5. Ngày chụp trong SCREENSHOT-DATA.md ghi theo dạng tương đối (**Hôm nay,
   +2 ngày, +5 ngày…**). Khi nhập vào app thì lấy **ngày thật theo lịch
   chụp hôm đó** — ví dụ chụp vào ngày X thì job "+5 ngày" nhập là ngày
   X+5. Đừng nhập ngày đã qua.

### 2.2. Cài đặt máy trước khi chụp

| Mục | Làm gì | Vì sao |
|---|---|---|
| Chế độ sáng/tối | **Light mode cho bộ chính** (Cài đặt iPhone → Màn hình & Độ sáng → Sáng). Chụp thêm bộ dark mode **chỉ khi còn thời gian** | Bộ chính phải là light mode theo APP-STORE-READY §9 |
| Độ sáng màn hình | Kéo độ sáng lên **khoảng 80–100%**, tắt Độ sáng tự động trong lúc chụp | Ảnh sáng đều, màu chủ đề Ấm hiện đúng, chữ không bị tối |
| Pin | **Sạc đầy (hoặc ≥ 80%) và cắm sạc trong lúc chụp** | Tránh biểu tượng pin đỏ / chế độ nguồn điện thấp làm tối màn hình giữa chừng |
| Thông báo | Bật **Không làm phiền / Focus**; tắt banner thông báo của mọi app khác; đóng hết thông báo đang hiện trên màn hình | Không để thông báo lạ lọt vào ảnh (quy tắc §0) |
| Thanh trạng thái | Để giờ, sóng, pin ở trạng thái bình thường; **không để hiện biểu tượng ghi màn hình, VPN lạ, hay pin đỏ** | Ảnh sạch, giống máy người dùng bình thường |
| Mạng | Bật Wi-Fi / 4G-5G ổn định (vì v2.5.0 trở đi app cần mạng mới mở được — không chụp lúc mất mạng) | Tránh màn lỗi mạng lọt vào ảnh |
| Ứng dụng nền | Đóng các app khác, chỉ để FotoBro chạy | Tránh vô tình vuốt sang app khác khi chuyển màn |
| Dữ liệu thật | Kiểm tra lại: không còn job/tiền/ảnh thật nào trong app trước khi nhập dữ liệu mẫu | Một khoản tiền thật lọt vào là phải chụp lại cả bộ |

### 2.3. Kiểm tra nhanh trước ảnh 1 (checklist 1 phút)

- [ ] Mở app: tab **Hôm nay** hiện đúng 2 buổi hôm nay, không có buổi ngày
      khác lọt vào, không có job kẹt hiện ở màn này.
- [ ] Không có tên thật, email thật, số điện thoại thật ở bất kỳ màn nào.
- [ ] Ảnh trang chủ đã đặt, là ảnh chung, hiển thị đẹp, không vỡ.
- [ ] Light mode đang bật; độ sáng cao; Không làm phiền đang bật; pin ≥ 80%.

---

## 3. Từng bước chụp cho mỗi màn hình

Chụp đúng thứ tự 1 → 6. Chụp xong 1 màn thì xem lại ngay ảnh vừa chụp
(chữ có bị cắt không, số có đúng không) rồi mới sang màn sau — đừng chụp
hết 6 màn rồi mới kiểm tra.

### Màn 1 — Hôm nay (tab Hôm nay)

**Phải thấy rõ:** tiêu đề lớn **"Hôm nay"** kiểu Apple Music, lịch chụp
hôm nay (2 buổi), tiền hôm nay (đã thu + còn thiếu), ảnh trang chủ đẹp.

**Dữ liệu mẫu (đã nhập trước ở §2.1):**

| Buổi chụp | Khách (hư cấu) | Loại | Giờ | Địa điểm (hư cấu) | Trạng thái |
|---|---|---|---|---|---|
| 1 | Thu Hằng | Portrait | 09:00 | Công viên Lê Văn Tám | Sắp chụp |
| 2 | Minh Quân & Lan Chi | Couple | 16:00 | Bờ sông Sài Gòn | Sắp chụp |

**Con số phải thấy:** đã thu **2.000.000đ**, còn thiếu **1.500.000đ**.

Cách tạo ra 2 con số này (để biết vì sao, khỏi nhập sai):
- "Đã thu hôm nay" chỉ tính tiền thu trong ngày hôm nay: cọc Portrait
  2.000.000đ thu hôm nay.
- "Còn thiếu" = Portrait 2.500.000đ − đã thu 2.000.000đ = 500.000đ, cộng
  Couple 4.000.000đ − cọc 3.000.000đ thu **từ tuần trước** (không tính vào
  tiền hôm nay) = 1.000.000đ → tổng **1.500.000đ**.

**Các bước chụp:**
1. Mở app, ở tab **Hôm nay** (màn đầu tiên khi mở app).
2. Cuộn lên đầu màn hình — tiêu đề lớn "Hôm nay" và ảnh trang chủ phải
   hiện trọn, không bị cắt nửa.
3. Kiểm tra: đúng 2 buổi hôm nay (09:00 Portrait, 16:00 Couple), không có
   buổi ngày khác; tiền hôm nay hiện đúng 2.000.000đ / 1.500.000đ.
4. Chụp 1 ảnh. Xem lại ngay: chữ không bị cắt, 2 buổi + 2 con số đều đọc
   được, không có job kẹt chen vào màn này.

### Màn 2 — Pipeline job 8 bước (chi tiết 1 job)

**Phải thấy rõ:** 1 job đang ở giữa pipeline — bước đã xong / đang làm /
sắp tới phân biệt được, nút nhảy thẳng tới bước bất kỳ thấy được.

**Dữ liệu mẫu (job này):**

| Trường | Giá trị (hư cấu) |
|---|---|
| Khách | Minh Quân & Lan Chi |
| Loại job | Wedding |
| Chụp bằng | Digital |
| Ngày chụp | +5 ngày (sau hôm chụp màn 1) |
| Giờ chụp | 08:00 |
| Địa điểm | Nhà hàng Hoa Sen, Quận 1 |
| Hạn giao ảnh | +12 ngày |
| Giá job | **15.000.000đ** |
| Đã thu cọc | **5.000.000đ** (ghi ở bước Chốt cọc) |
| Còn thiếu | **10.000.000đ** |
| Đang ở bước | **Hậu kỳ — bước 6/8** |

**Tiến độ phải thấy:**
- Đã xong: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh (5 bước đầu).
- Đang làm: **Hậu kỳ (bước 6/8)** — hiện tên bước to + "Bước 6/8".
- Sắp tới: Đã giao → Xong (mờ/chưa xong).
- Nút **"Xong bước này → Đã giao"** thấy được.

**Các bước chụp:**
1. Từ danh sách job, mở chi tiết job **Minh Quân & Lan Chi — Wedding**.
2. Cuộn tới phần **Tiến độ 8 bước** sao cho cả 8 bước (hoặc ít nhất bước
   1–6 và nút "Xong bước này → Đã giao") hiện trong một khung hình.
   Nếu app không hiện đủ 8 bước trong một màn, chụp khung có bước đang
   làm (Hậu kỳ, 6/8) ở giữa và thấy được cả bước đã xong lẫn bước sắp tới.
3. Kiểm tra: giá **15.000.000đ** và đã thu **5.000.000đ** hiện đúng;
   **không** hiện cảnh báo thiếu tiền ở màn này (cảnh báo chỉ hiện khi
   bấm Xong mà còn thiếu — đừng bấm Xong khi chụp).
4. **Đừng bấm vào bước khác để thử nhảy bước trong lúc chụp** — chỉ cần
   nút/điểm chạm nhảy bước thấy được trên màn. (Tính năng nhảy bước đã
   được kiểm chứng riêng ở TestFlight, không cần chứng minh bằng ảnh.)
5. Chụp 1 ảnh. Xem lại ngay: "Bước 6/8" và tên bước Hậu kỳ đọc được,
   giá/cọc khớp với màn 3 (xem §5).

### Màn 3 — Sổ tiền / Báo cáo tuần (tab Sổ tiền)

**Phải thấy rõ:** báo cáo tuần, thu–chi rõ ràng, số dư rõ, còn thiếu
bao nhiêu.

**Dữ liệu mẫu (cùng tuần với màn 1 và 2):**

| Khoản | Loại | Số tiền | Ghi chú |
|---|---|---|---|
| Thu cọc Wedding Minh Quân & Lan Chi | Thu — theo job | 5.000.000đ | Đã thu ở bước Chốt cọc |
| Thu cọc Portrait Thu Hằng | Thu — theo job | 2.000.000đ | Đã thu hôm nay |
| Thu cọc Couple Minh Quân & Lan Chi | Thu — theo job | 0đ | Chưa thu (để màn 1 còn thiếu 1.500.000đ) |
| Thu thêm: chụp thêm giờ (Wedding) | Thu — phát sinh | 5.500.000đ | Phát sinh thêm giờ |
| Chi: thuê đèn | Chi — thiết bị | 800.000đ | Thuê đèn buổi Wedding |
| Chi: xăng xe đi chụp | Chi — vận hành tháng | 400.000đ | Xăng xe tuần này |

**Con số phải thấy:** thu tuần **12.500.000đ** (5.000.000 + 2.000.000 +
5.500.000), chi tuần **1.200.000đ** (800.000 + 400.000), số dư tuần
**11.300.000đ** (12.500.000 − 1.200.000), còn thiếu **3.000.000đ**.

- "Còn thiếu 3.000.000đ" là tổng các khoản **tới hạn trong tuần này**:
  Portrait còn thiếu 500.000đ + Couple còn thiếu 1.000.000đ + Wedding
  đợt 2 (1.500.000đ, tới hạn trong tuần này, chưa thu).
- Cọc Couple 3.000.000đ thu từ tuần trước nên **không** tính vào thu tuần
  này — thu tuần này vẫn là 12.500.000đ.
- **Lưu ý quan trọng:** kiểm lại trong app trước khi chụp — nếu app tính
  "còn thiếu" theo cách khác (ví dụ tổng còn thiếu của mọi job =
  11.500.000đ) thì **lấy đúng số app hiện**, rồi sửa lại dòng "còn thiếu"
  trong SCREENSHOT-DATA.md cho khớp với ảnh thật.

**Các bước chụp:**
1. Mở tab **Sổ tiền**, chọn kỳ **Báo cáo tuần** (đúng tuần chứa màn 1 và 2).
2. Cuộn sao cho thu tuần, chi tuần, số dư và còn thiếu hiện trong một
   khung hình (nếu app tách tab, chụp khung có 4 con số tổng).
3. Kiểm tra: mọi khoản trên đều nằm trong cùng 1 tuần đang xem; không có
   khoản tiền thật nào lẫn vào; **2.000.000đ đã thu hôm nay (màn 1) nằm
   trong 12.500.000đ thu tuần này**.
4. Chụp 1 ảnh. Xem lại ngay: 4 con số đọc được, không bị cắt, khớp với
   bảng đối chiếu ở §5.

### Màn 4 — Đăng nhập Google 1 chạm (hoặc màn thay thế: Nhập từ Lịch iPhone)

**Phải thấy rõ (bản chính):** nút **"Đăng nhập Google"** + sau khi đăng
nhập thấy Lịch, Gmail gợi ý tiền về / khách hỏi chụp — **chỉ chụp màn
trong app, không chụp màn đăng nhập của Google**.

**Dữ liệu mẫu cần có trong tài khoản Google test (hư cấu):**

| Nguồn | Nội dung mẫu (hư cấu) | Hiện trong app ra sao |
|---|---|---|
| Google Lịch | Sự kiện "Chụp Portrait — Thu Hằng", hôm nay 09:00 | Hiện trong tab Buổi chụp → Lịch, có nhãn "Google" |
| Gmail — tiền về | Email ngân hàng mẫu: "Tài khoản của bạn vừa nhận 2.000.000đ" (tài khoản test, không phải ngân hàng thật) | Hiện ở mục "Tiền về từ Gmail", gợi ý "Ghi vào sổ…" |
| Gmail — khách hỏi | Email mẫu từ "khach.mau@example.com": "Chào An, mình muốn hỏi lịch chụp Couple tháng sau, báo giá giúp mình nhé" | Hiện ở mục "Khách hỏi qua Gmail", gợi ý "Tạo buổi chụp (Tư vấn)…" |

**Con số phải thấy:** 1 gợi ý tiền về **2.000.000đ** (khớp với cọc
Portrait ở màn 1) và 1 khách hỏi chụp Couple.

**Các bước chụp (bản chính — Google kịp v1):**
1. Dùng **tài khoản Google test riêng** — không dùng Gmail thật của
   Việt/Xèo. Đăng nhập trước trong app, rồi quay lại màn có nút/gợi ý.
2. Mở màn trong app hiện gợi ý tiền về 2.000.000đ + khách hỏi chụp Couple.
   Cuộn sao cho cả hai gợi ý (và nhãn "Google" nếu có) hiện trong một
   khung hình.
3. Kiểm tra: **không để lộ địa chỉ email thật** trên màn; không có màn
   cảnh báo xác minh của Google trong ảnh.
4. Chụp 1 ảnh. Xem lại ngay: 2.000.000đ đọc được, khớp màn 1.

**Màn thay thế — chỉ dùng khi Google chưa kịp v1:**
- Thay màn này bằng màn **Nhập từ Lịch iPhone** (native, 1 chạm — không
  phải nhập file .ics cũ; chức năng nhập file cũ đã bỏ).
- Các bước: bấm nút **"Nhập từ Lịch iPhone"** → cấp quyền Lịch khi iOS
  hỏi → màn hiện danh sách sự kiện **30 ngày tới đã tích chọn sẵn** +
  nút **"Nạp buổi chụp"** → chụp màn này (danh sách + nút Nạp đều thấy).
- Dữ liệu mẫu dùng chung sự kiện Lịch ở bảng trên ("Chụp Portrait —
  Thu Hằng", hôm nay 09:00).
- Đổi tên file ảnh 6.7"/6.5" số 04 thành `…-04-calendar.png` và ghi chú
  rõ trong App Store Connect rằng đây là màn thay thế vì Google chưa kịp
  v1 (đồng thời sửa mô tả §6a theo APP-STORE-READY §12 mục 7).

**Lưu ý mic:** nếu mic (giọng nói) kịp v1 thì ảnh 4 đổi thành màn giọng
nói, màn Google dồn vào ảnh 6 thay cho màn khoá (APP-STORE-READY §9).
Nếu mic dời v1.1 thì giữ danh sách 6 màn trong file này, không nhắc
giọng nói trong ảnh hay mô tả.

### Màn 5 — Thêm job mới (form thêm job)

**Phải thấy rõ:** form gọn — khách / loại chụp / Digital-Film / ngày giờ /
giá tự điền theo loại.

**Dữ liệu mẫu nhập vào form (chưa bấm Lưu khi chụp, hoặc chụp ngay sau
khi lưu thấy job mới hiện trong danh sách):**

| Trường trong form | Giá trị (hư cấu) |
|---|---|
| Khách | Quán Cà Phê Mộc |
| Loại job | Lookbook |
| Chụp bằng | Digital |
| Ngày chụp | +7 ngày (tuần sau) |
| Giờ chụp | 09:00 |
| Địa điểm | Quán Cà Phê Mộc, Quận 3 |
| Giá | **8.000.000đ** (tự điền theo bảng giá Lookbook Digital) |
| Đang ở bước | Tư vấn (mặc định khi tạo job mới) |

**Các bước chụp:**
1. Bấm nút **"+" / "Thêm job"** để mở form trống.
2. Nhập khách **Quán Cà Phê Mộc** → chọn loại **Lookbook** → chọn
   **Digital** → kiểm tra ô giá **tự điền 8.000.000đ** (không gõ tay) →
   nhập ngày **+7 ngày**, giờ **09:00**, địa điểm.
3. **Chụp khi form còn đang mở, chưa bấm Lưu** — để thấy rõ form và giá
   tự điền. (Nếu muốn chụp thêm kiểu "job mới hiện trong danh sách" thì
   chụp 1 ảnh phụ sau khi lưu, nhưng ảnh nộp App Store vẫn ưu tiên ảnh
   form đang mở.)
4. Kiểm tra: ngày chụp là tuần sau, không trùng ngày hôm nay; form không
   còn dữ liệu thật nào.
5. Chụp 1 ảnh. Xem lại ngay: giá **8.000.000đ** đọc được, khớp bảng giá
   màn 6 / §2.1.
6. **Sau khi chụp xong:** xoá job mẫu này hoặc để lại tuỳ ý. Nếu để lại
   thì kiểm lại màn 1–3 không bị lệch số vì job này (job mới ở bước
   Tư vấn, chưa thu tiền nên không làm lệch tiền hôm nay/tuần này).

### Màn 6 — Cài đặt / Khoá app (tab Cài đặt)

**Phải thấy rõ:** khoá **Face ID + PIN đang bật**, và phần cá nhân hoá
(màu chủ đề, logo studio) — chứng minh app riêng tư, dữ liệu ở trên máy.

**Dữ liệu mẫu:**

| Mục trong Cài đặt | Giá trị mẫu |
|---|---|
| Tên gọi | An |
| Tên studio | An Studio |
| Khoá app | Face ID: **Bật**; PIN: **Bật** (chỉ chụp màn công tắc Bật — **không chụp màn nhập PIN**, không hiện số PIN) |
| Màu chủ đề | **Ấm** (preset đang chọn, tô đậm) — thấy được 3 preset: Ấm / Tối giản / Tối |
| Logo studio | Logo FotoBro mẫu đã thêm (hiện thu nhỏ trong Cài đặt) |
| Ngôn ngữ | Tiếng Việt |
| Tiền tệ | VND |
| Mẫu tin nhắn | Hiện 1 mẫu đã sửa theo giọng mẫu: "Chào bạn, ảnh buổi chụp của bạn đã xong rồi nè. Bạn xem và tải ảnh ở đây nhé. Cảm ơn bạn đã tin tưởng An Studio!" |

**Các bước chụp:**
1. Mở tab **Cài đặt**, cuộn tới phần **Khoá app** sao cho công tắc
   Face ID + PIN (cả hai ở trạng thái **Bật**) và phần cá nhân hoá
   (3 preset màu, logo) hiện trong một khung hình. Nếu không vừa một
   màn, **ưu tiên khung có Face ID + PIN Bật + 3 preset màu** — logo và
   mẫu tin nhắn có thể chụp làm ảnh phụ, không thay ảnh chính.
2. Kiểm tra: không có thông tin thật nào trên màn; logo hiện đúng là
   logo mẫu; không có Client ID, secret, email thật, số điện thoại thật.
3. Chụp 1 ảnh. Xem lại ngay: hai công tắc đều hiện "Bật", preset Ấm
   đang được chọn (tô đậm).

---

## 4. Mẹo chụp đẹp

1. **Chụp theo thứ tự 1 → 6, đừng nhảy màn.** Mỗi lần chuyển màn là một
   lần có thể làm lệch số (ví dụ vô tình bấm Xong ở màn 2 rồi mới chụp
   màn 3).
2. **Một màn, một khung hình.** Cuộn cho nội dung chính vào giữa màn,
   đừng để tiêu đề lớn bị cắt nửa trên hay nút quan trọng bị cắt nửa dưới.
   Tab bar dưới phải hiện đủ, không bị che (lỗi từng gặp ở bản web trên
   điện thoại — APP-STORE-READY §11B).
3. **Chữ to, số to là điểm bán.** Màn 1: tiền hôm nay phải đọc được ngay.
   Màn 3: 4 con số tổng phải đọc được ngay. Nếu số bị nhỏ/mờ, phóng to
   chữ trong Cài đặt iPhone → Trợ năng → Cỡ chữ (chỉ trong lúc chụp,
   nhớ trả lại sau).
4. **Ảnh trang chủ quyết định màn 1.** Chọn ảnh phong cảnh/chân dung chung
   sáng, ít chi tiết rối, không phải ảnh khách thật — ảnh tối hoặc rối sẽ
   làm chữ trên màn 1 khó đọc.
5. **Giữ light mode suốt bộ chính.** Đừng đổi sang dark mode giữa chừng
   rồi quên đổi lại — hai ảnh cùng bộ mà một sáng một tối sẽ bị Apple
   coi là không nhất quán.
6. **Chụp dư 2–3 ảnh mỗi màn, chọn 1 ảnh đẹp nhất.** Xoá ảnh thừa ngay
   sau khi chọn, để khỏi tải nhầm ảnh sai số lên App Store Connect.
7. **Không dùng app chỉnh sửa ảnh để sửa số/chữ trong ảnh.** Nếu số sai,
   sửa dữ liệu trong app rồi chụp lại — không photoshop số cho khớp.
8. **Chụp cả hai bộ trong cùng một buổi** (6.7" rồi 6.5", cùng dữ liệu
   mẫu, cùng ngày) để hai bộ không lệch nhau về ngày/giờ/số tiền.

## 5. Kiểm tra lại sau khi chụp

### 5.1. Kiểm tra từng ảnh (xem lại trên máy tính, màn hình lớn)

| Kiểm tra | Đạt khi |
|---|---|
| Kích thước | Bộ 6.7" đúng **1290 × 2796**, bộ 6.5" đúng **1242 × 2688** (xem thông tin ảnh, không đoán) |
| Thứ tự | Ảnh 1 → 6 đúng thứ tự màn 1 → 6 trong cả hai bộ |
| Chữ không bị cắt | Tiêu đề lớn, tên khách, số tiền, nút quan trọng đều hiện trọn — không bị cắt nửa trên/dưới, không bị tab bar che |
| Không có dữ liệu thật | Không tên/email/số điện thoại thật, không màn lỗi, không màn trống, không thông báo lạ, không màn đăng nhập Google, không màn cảnh báo xác minh, không màn nhập PIN |
| Light mode | Cả 6 ảnh bộ chính đều light mode, độ sáng đều nhau |
| Nội dung mỗi màn | Đúng "nội dung phải thấy" ở §3 cho từng màn |

### 5.2. Đối chiếu số tiền khớp nhau giữa các ảnh (bảng bắt buộc)

Lấy ảnh thật làm chuẩn. Đối chiếu 6 ảnh với nhau trước khi tải lên:

| Con số | Màn 1 (Hôm nay) | Màn 2 (Pipeline) | Màn 3 (Sổ tiền) | Màn 4 (Google) | Màn 5 (Thêm job) | Ghi chú |
|---|---|---|---|---|---|---|
| Đã thu hôm nay | **2.000.000đ** | — | nằm trong thu tuần 12.500.000đ | gợi ý tiền về **2.000.000đ** | — | Cọc Portrait Thu Hằng |
| Còn thiếu hôm nay | **1.500.000đ** | — | — | — | — | 500.000đ Portrait + 1.000.000đ Couple |
| Giá Wedding | — | **15.000.000đ** | — | — | — | Cọc đã thu 5.000.000đ |
| Đã thu cọc Wedding | — | **5.000.000đ** | nằm trong thu tuần 12.500.000đ | — | — | Ghi ở bước Chốt cọc |
| Còn thiếu Wedding | — | **10.000.000đ** | — | — | — | 15.000.000 − 5.000.000 |
| Thu tuần | — | — | **12.500.000đ** | — | — | 5.000.000 + 2.000.000 + 5.500.000 |
| Chi tuần | — | — | **1.200.000đ** | — | — | 800.000 + 400.000 |
| Số dư tuần | — | — | **11.300.000đ** | — | — | 12.500.000 − 1.200.000 |
| Còn thiếu (tuần) | — | — | **3.000.000đ** (*) | — | — | Xem lưu ý (*) dưới |
| Giá Lookbook mới | — | — | — | — | **8.000.000đ** (Digital) | Tự điền theo bảng giá |

(*) **"Còn thiếu 3.000.000đ" ở màn 3:** nếu app tính theo cách khác
(ví dụ tổng còn thiếu của mọi job = 11.500.000đ) thì lấy đúng số app
hiện trong ảnh, sửa lại SCREENSHOT-DATA.md cho khớp, và kiểm lại rằng
số đó không mâu thuẫn với màn 1 (còn thiếu hôm nay 1.500.000đ phải là
một phần của số còn thiếu ở màn 3, không được lớn hơn nó một cách vô lý).

**Quy tắc xử lý lệch số:**
- Lệch 1 con số ở 1 màn → sửa dữ liệu trong app, chụp lại **chỉ màn đó**
  (và màn nào dùng chung con số đó).
- Lệch vì nhập sai ngày (job lọt sang tuần khác) → sửa ngày trong app,
  chụp lại màn 1 và màn 3.
- Lệch vì app tính khác file → **không sửa ảnh**, sửa file
  SCREENSHOT-DATA.md cho khớp với ảnh thật.
- Không bao giờ dùng app chỉnh sửa ảnh để sửa số/chữ trong ảnh.

### 5.3. Checklist trước khi tải lên App Store Connect

- [ ] Đủ 12 file (6 màn × 2 bộ), đúng kích thước, đúng thứ tự.
- [ ] Bảng đối chiếu §5.2 đã khớp hết; chỗ nào app tính khác file thì
      SCREENSHOT-DATA.md đã sửa cho khớp ảnh thật.
- [ ] Không còn file ảnh thừa / ảnh chụp thử lẫn trong thư mục tải lên.
- [ ] Đã xoá dữ liệu mẫu khỏi bản TestFlight (hoặc ghi chú rõ "đây là
      dữ liệu mẫu" trong Notes cho reviewer) — xem §0 mục 5.
- [ ] Nếu dùng màn thay thế ở màn 4 (Lịch iPhone thay Google) hoặc mic
      kịp v1 (đổi ảnh 4/6), mô tả App Store (§6a APP-STORE-READY) đã
      sửa cho khớp với ảnh đã nộp.

## 6. Khi nào thì chụp lại (không nộp ảnh lỗi)

- Số tiền ở màn 1 không khớp màn 3 (ví dụ đã thu hôm nay không nằm trong
  thu tuần).
- Màn 2 hiện cảnh báo thiếu tiền (do vô tình bấm Xong) hoặc không còn ở
  bước Hậu kỳ 6/8.
- Màn 4 lộ địa chỉ email thật, hoặc lọt màn đăng nhập / màn cảnh báo
  xác minh của Google vào ảnh.
- Màn 5 giá không tự điền 8.000.000đ (do chưa chọn đúng Lookbook +
  Digital, hoặc bảng giá chưa nhập đủ ở §2.1).
- Màn 6 công tắc Face ID/PIN không ở trạng thái Bật, hoặc lọt thông tin
  thật / Client ID / secret vào ảnh.
- Bất kỳ ảnh nào chữ bị cắt, tab bar bị che, hoặc ảnh tối/mờ do pin yếu
  hay độ sáng tự động giảm giữa chừng.

---

*Nguồn: SCREENSHOT-DATA.md (dữ liệu mẫu hư cấu, bộ 0–6) và
APP-STORE-READY.md §9 (danh sách 6 màn), §11B (TestFlight trên iPhone
thật), §12 (màn thay thế khi Google/mic chưa kịp v1).*
