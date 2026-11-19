# Giao ảnh — thiết kế luồng v1.1

> Trạng thái: **thiết kế, chưa code.** Áp dụng cho FotoBro iOS v1.1.
> Cơ sở: app v1 (`APP_VERSION = '1.0'`, `www/index.html`) đã có pipeline 8 bước,
> link Drive theo job, mẫu tin nhắn/email giao ảnh và nhắc thu nốt — nhưng **chưa có
> trạng thái chọn ảnh / hậu kỳ theo từng tấm, chưa theo dõi khách đã tải hay chưa**.
> Luồng này nối vào các bước pipeline đã có, không tạo pipeline mới.

## 1. Luồng 6 bước (từ góc nhìn photographer)

| # | Bước | Trong app v1 | Cần thêm ở v1.1 |
|---|------|--------------|-----------------|
| 1 | **Chọn ảnh — đăng ảnh xem trước** | Chưa có. Chỉ có ô dán `driveLink` chung cho cả job | Thư mục xem trước riêng + ghi ngày gửi link chọn ảnh |
| 2 | **Khách chọn ảnh** | Nửa có: mẫu tin nhắn "Nhắc khách chọn ảnh" (khách gửi lại mã ảnh bằng tin nhắn/email), nhưng app không lưu danh sách đã chọn | Lưu mã/số ảnh khách đã chọn + hạn chọn |
| 3 | **Hậu kỳ theo danh sách đã chọn** | Có bước "Hậu kỳ" ở mức job, không có danh sách từng tấm | Checklist từng tấm + tính phí retouch thêm tự động |
| 4 | **Giao qua Drive link** | Có: `driveLink` theo job, mẫu email "Giao ảnh" (`{drive}`), sang bước "Đã giao" thì gợi ý email | Tách link xem trước / link giao chính thức; ghi ngày giao |
| 5 | **Khách tải ảnh** | Chưa có — app không biết khách đã tải hay chưa | Xác nhận "khách đã tải" do photographer tick tay (xem §4, không tự đo được) |
| 6 | **Nhắc thu nốt** | Có: sang "Đã giao" còn thiếu tiền thì toast nhắc; sang "Xong" còn thiếu thì cảnh báo + xác nhận; mẫu email "Nhắc thanh toán" (`balance`) | Nhắc tự động sau N ngày chưa thu đủ (xem §5) |

Chi tiết từng bước:

### Bước 1 — Đăng ảnh xem trước
- Photographer chép ảnh xem trước (nên là ảnh nhỏ / có watermark — xem câu hỏi §7)
  vào **thư mục con "Xem trước"** trong thư mục Drive của job, tách khỏi thư mục
  ảnh giao chính thức. Lý do: khách không tải nhầm ảnh chưa hậu kỳ, không chia sẻ
  nhầm link giao.
- App ghi `previewSentAt` (ngày gửi link chọn ảnh) và `pickDeadline`
  (mặc định = ngày gửi + 3 ngày; cho sửa trong chi tiết job).
- Gửi cho khách bằng mẫu tin nhắn đã có: "Nhắc khách chọn ảnh" (link + nhờ gửi lại
  mã ảnh). Không cần mẫu mới.

### Bước 2 — Khách chọn ảnh
- Khách trả lời bằng mã ảnh qua tin nhắn/email như hiện tại (không bắt khách
  cài thêm app hay đăng nhập gì — đây là cách đơn giản nhất, phù hợp v1.1).
- Photographer nhập vào app trong chi tiết job, ở bước "Chọn ảnh":
  `pickedCodes` (danh sách mã ảnh, nhập nhanh cách nhau bằng dấu phẩy),
  `pickCount` tự đếm, `pickedAt` tự ghi ngày nhập.
- App đối chiếu `pickCount` với số ảnh đã bao gồm trong gói (xem §6 — cần thêm
  trường này, v1 chưa có) và báo ngay: "đã chọn 32/30 tấm — 2 tấm tính thêm
  phí retouch".

### Bước 3 — Hậu kỳ
- Từ `pickedCodes`, app tạo checklist từng mã ảnh với 3 trạng thái:
  `chưa làm → đang làm → xong`. Chạm 1 lần để chuyển trạng thái, có đếm
  "đã xong 18/32".
- Ảnh retouch thêm ngoài gói: mỗi tấm tính `cfg.retouch` (đã có trong Cài đặt
  v1, "Retouch / ảnh") và cộng vào "còn thiếu" của job, hiện rõ trước khi giao.
- Khi checklist xong hết, app gợi ý sang bước "Hậu kỳ" → "Đã giao".

### Bước 4 — Giao qua Drive link
- Photographer chép ảnh đã hậu kỳ vào **thư mục giao chính thức** (khác thư mục
  xem trước), dán/cập nhật link vào ô Drive của job (đã có trong v1).
- Chạm "Đã giao": app ghi `deliveredAt`, gửi gợi ý email mẫu "Giao ảnh"
  (`{drive}` + `{owe}` — đã có trong v1, hiện qua `suggestEmail(j, 'deliver')`
  sau 2,6 giây), và nhắc thu nốt ngay nếu còn thiếu tiền (đã có trong v1).
- Giữ nguyên quy tắc v1: ảnh gốc của khách giữ ít nhất 1 năm trong thư mục
  Drive riêng của từng job.

### Bước 5 — Khách tải ảnh
- **Giới hạn thật, phải nói rõ:** app không tự biết khách đã tải ảnh hay chưa.
  Link Drive mở bằng trình duyệt/ứng dụng Drive ngoài app; Google Drive API
  mà app đang dùng chỉ có quyền `drive.metadata.readonly` (xem tên thư mục),
  không có sự kiện "ai đã tải file nào".
- Cách làm ở v1.1: photographer tick tay ô "Khách đã tải" trong chi tiết job
  (sau khi khách báo đã tải, hoặc sau khi gửi link được 2 ngày mà khách không
  báo lỗi). App ghi `downloadedAt` + `downloadedNote` (vd "khách nhắn đã tải
  đủ qua Zalo"). Không tự động suy ra từ Drive.
- Không làm ở v1.1: link tải có hạn / đếm lượt tải (cần backend hoặc dịch vụ
  giao ảnh riêng, ngoài phạm vi local-first của FotoBro).

### Bước 6 — Nhắc thu nốt
- Đã có trong v1 (thủ công): toast nhắc khi sang "Đã giao", cảnh báo khi sang
  "Xong" còn thiếu tiền, mẫu email "Nhắc thanh toán" với tổng / đã nhận /
  còn lại, hạng mục thu "Tiền sau khi giao ảnh".
- Thêm ở v1.1 (tự động, theo lịch đã có trong app): nếu sau **3 ngày** kể từ
  `deliveredAt` mà `jobOwe(j) > 0`, hiện nhắc trên màn "Hôm nay" và gợi ý gửi
  email "Nhắc thanh toán" (1 lần/ngày, không spam). Sau 7 ngày chưa đủ thì
  nhắc lại kèm cảnh báo "job kẹt ở bước Đã giao" (dùng sẵn cơ chế job kẹt của v1).
- "Xong" vẫn giữ quy tắc v1: còn thiếu tiền thì phải xác nhận "Vẫn xong,
  thiếu sau" mới được xong; không cho xong lặng lẽ.

## 2. Cái gì đã có trong v1 (dùng lại, không viết lại)

- Pipeline 8 bước: `Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh →
  Hậu kỳ → Đã giao → Xong` (`STAGES`, dòng 781), nhảy thẳng tới bước bất kỳ,
  `stageSince`, job kẹt/quá hạn giao (dòng 1015–1024, 1159–1168).
- Hạn giao tự điền: `deadline = shootDate + cfg.deliverDays` (mặc định 14 ngày).
- `driveLink` theo job: ô dán link trong form job + chi tiết job, nút
  "Mở thư mục Drive", chọn thư mục từ Google Drive (cần bật `gFeat.drive`).
- Mẫu tin nhắn "Nhắc khách chọn ảnh" và "Giao ảnh & xin cảm nhận" (`TPLS`).
- Mẫu email `deliver` (link `{drive}`, phần còn thiếu `{owePart2}`) và
  `balance` (tổng / đã nhận / còn lại) — sửa được trong Cài đặt, có khôi phục gốc.
- Tiền gắn bước: sang "Đã giao" nhắc thu nốt; sang "Xong" còn thiếu thì cảnh báo.
- Hạng mục thu/chi đã có: "Tiền sau khi giao ảnh", "Thêm ảnh retouch",
  "Lấy file gốc", "Album thêm"; máy tính giá đã tính retouch/ảnh + album.

## 3. Cái gì cần thêm ở v1.1 (danh sách việc)

| Việc | Loại | Ghi chú |
|------|------|---------|
| Trường job mới: `previewSentAt`, `pickDeadline`, `pickedCodes[]`, `pickedAt`, `deliveredAt`, `downloadedAt`, `downloadedNote`, `includedPhotos` | Dữ liệu | Thêm vào `cleanJob` + sao lưu JSON; đọc được file sao lưu v1 cũ (thiếu trường thì mặc định trống) |
| Mục "Chọn ảnh" trong chi tiết job: nhập mã ảnh, đếm số đã chọn, đối chiếu số ảnh trong gói | Giao diện | Chỉ hiện khi job ở bước "Chọn ảnh" trở đi |
| Checklist hậu kỳ từng mã ảnh (3 trạng thái + đếm xong/tổng) | Giao diện | Dùng `pickedCodes` làm nguồn; không lưu ảnh trong app |
| Tách link "Xem trước" / "Giao chính thức" (2 ô Drive thay vì 1 ô chung) | Giao diện + dữ liệu | Giữ `driveLink` cũ làm link giao để file sao lưu cũ không hỏng; thêm `previewLink` |
| Tick "Khách đã tải" + ghi chú | Giao diện | Thủ công, xem §4 |
| Nhắc thu nốt tự động sau 3 ngày kể từ `deliveredAt` (1 lần/ngày) | Logic | Dùng sẵn nhắc "Hôm nay" + local notification nếu đã có |
| Cài đặt: số ảnh bao gồm theo gói (mặc định theo loại job), số ngày hạn chọn ảnh (mặc định 3), số ngày nhắc thu nốt (mặc định 3) | Cài đặt | Thêm vào mục "Cọc & giao ảnh" trong Cài đặt |
| Cập nhật `TESTFLIGHT-CHECKLIST.md`: thêm ca test giao ảnh 6 bước | Kiểm chứng | Sau khi code xong |

## 4. Giới hạn và rủi ro (đã kiểm chứng bằng code v1)

1. **Không đo được khách đã tải ảnh.** Drive link mở ngoài app; API chỉ đọc
   metadata. V1.1 dùng xác nhận tay, không giả vờ đo được.
2. **Khách chọn ảnh vẫn là thủ công.** Khách gửi mã ảnh bằng tin nhắn/email;
   app không có trang chọn ảnh cho khách (cần backend/link công khai — ngoài
   phạm vi v1.1, chỉ làm nếu Việt quyết làm "trang chọn ảnh" riêng).
3. **Ảnh không nằm trong app.** App chỉ lưu link + mã ảnh; ảnh gốc ở Drive.
   Mất link Drive hoặc mất quyền xem thư mục thì app không khôi phục được ảnh.
   Nhắc photographer giữ ảnh gốc ≥ 1 năm (quy tắc đã có trong Phòng Đèn).
4. **File sao lưu v1 cũ** không có các trường mới — khi mở lại, các trường
   mặc định trống, job cũ vẫn hiện đúng bước pipeline, không mất dữ liệu.

## 5. Tiêu chí chấp nhận (kiểm chứng sau khi code)

1. Tạo 1 job Wedding, đi hết 6 bước: gửi link xem trước → nhập 32 mã ảnh
   (gói gồm 30) → app báo 2 tấm tính thêm phí → checklist hậu kỳ xong 32/32
   → giao link chính thức, `deliveredAt` được ghi → tick "khách đã tải" →
   nhắc thu nốt xuất hiện sau 3 ngày nếu còn thiếu → xong job khi đã thu đủ.
2. Mở file sao lưu v1 cũ trong app v1.1: job cũ vẫn mở được, các trường mới
   trống, không lỗi, không mất tiền/job.
3. Tắt mạng: toàn bộ 6 bước vẫn làm được ngoại trừ mở link Drive (cần mạng) —
   đúng tính local-first của app.
4. `node --check` + test jsdom của v1.1 đạt; grep `pickedCodes`/`deliveredAt`
   có mặt trong code và trong file sao lưu.

## 6. Câu hỏi chờ Việt chốt (trước khi code v1.1)

1. **Số ảnh bao gồm trong mỗi gói là bao nhiêu?** (vd Portrait 10, Couple 20,
   Wedding 50 — hay để mỗi photographer tự điền trong Cài đặt, mặc định 0 =
   không giới hạn?) Đề xuất: tự điền, mặc định 0.
2. **Ảnh xem trước có watermark / ảnh nhỏ không?** Đề xuất v1.1: chỉ ghi chú
   "đăng ảnh nhỏ" trong hướng dẫn, không tự đóng watermark (cần xử lý ảnh,
   nặng cho app).
3. **Khách chọn ảnh bằng mã qua tin nhắn như hiện tại, hay làm trang chọn
   ảnh riêng?** Đề xuất: giữ cách nhắn mã ở v1.1; trang chọn ảnh để sau
   (cần backend).
