# Trang trạng thái (Status Page) — FotoBro

> **Trạng thái tài liệu:** THIẾT KẾ — chưa code, chưa deploy.
> Đây là bản thiết kế trang trạng thái cho FotoBro iOS v1. Chưa có file code nào được tạo theo thiết kế này.

## 1. Mục đích

- Cho người dùng biết nhanh: app có đang gặp sự cố không, sự cố ở đâu.
- Giảm email hỏi hỗ trợ (support@fotobro.app — lưu ý: email này hiện là **placeholder, chưa có thật**, domain chưa mua).
- Vì FotoBro v1 là **local-first** (dữ liệu trên máy người dùng, không có server riêng), nên hầu hết sự cố sẽ **không phải do server FotoBro**, mà do phía **Google** (Calendar / Gmail / Drive) hoặc **Apple** (CloudKit, TestFlight, App Store). Trang trạng thái phải nói rõ điều này để người dùng không hiểu lầm là app hỏng.

## 2. Nơi host

- Host trên **GitHub Pages cùng repo `Hoangviet1397/fotobro`** (không lập repo riêng, không dùng dịch vụ status page trả phí ở v1).
- URL dự kiến: `https://hoangviet1397.github.io/fotobro/status/` (quyết định cuối khi code: để ở `/status/` hoặc `/status.html` — chọn 1, không làm cả hai).
- Trang tĩnh (HTML + 1 file dữ liệu), không cần back-end, không cần tài khoản dịch vụ ngoài.

## 3. Các thành phần theo dõi

| Thành phần | Mô tả | Ghi chú |
|---|---|---|
| App iOS (FotoBro) | App chạy trên máy người dùng | Local-first: lỗi thường do máy / iOS / cập nhật app, không phải server |
| Google Calendar | Đồng bộ lịch qua Google | Phụ thuộc Google; lỗi phía Google thì ghi rõ |
| Gmail | Gửi/nhận mail khách trong app | Phụ thuộc Google |
| Google Drive | Sao lưu / đính kèm qua Drive | Phụ thuộc Google |
| CloudKit (Nấc 2) | Đồng bộ / sao lưu mã hoá | Chỉ áp dụng từ Nấc 2 trở đi; v1 (Nấc 1) chưa có — hiển thị "Chưa áp dụng" thay vì "Bình thường" |
| TestFlight | Bản thử nghiệm trước khi lên App Store | Chỉ liên quan người dùng beta; khi không có bản beta thì hiển thị "Không có bản beta đang chạy" |
| App Store | Tải / cập nhật app từ App Store | Phụ thuộc Apple |

Không theo dõi thành phần nào khác ở v1. Không thêm "server FotoBro" — vì không có server.

## 4. Ba mức trạng thái

| Mức | Nhãn hiển thị | Màu | Khi nào dùng |
|---|---|---|---|
| 1 | **Bình thường** | Xanh lá | Mọi thứ hoạt động như kỳ vọng |
| 2 | **Sự cố một phần** | Vàng | Một tính năng / một nhóm người dùng bị ảnh hưởng, phần còn lại vẫn chạy (ví dụ: chỉ Gmail lỗi, Calendar vẫn chạy) |
| 3 | **Ngừng hoạt động** | Đỏ | Thành phần không dùng được hoàn toàn (ví dụ: Google Calendar sập toàn cầu, hoặc App Store không tải được app) |

Quy tắc:
- Trạng thái tổng của trang = mức tệ nhất trong các thành phần đang áp dụng.
- Thành phần "Chưa áp dụng" / "Không có bản beta" không tính vào trạng thái tổng.
- Mỗi mức phải kèm 1 câu mô tả ngắn bằng tiếng Việt, ghi rõ **ai bị ảnh hưởng** và **có cách tạm thay thế không** (ví dụ: "Gmail lỗi — vẫn xem lịch và job bình thường, gửi mail khách bằng app Mail trên máy").

## 5. Cách cập nhật trạng thái (bằng tay)

Không dùng hệ thống tự động ở v1. Cập nhật bằng tay, chỉ 2 bước:

1. **Sửa 1 file duy nhất:** `status.json` (đặt cùng thư mục trang trạng thái trong repo). File này chứa: trạng thái từng thành phần (1 trong 3 mức trên), câu mô tả ngắn, thời gian cập nhật.
   - Chỉ sửa file này, không sửa code HTML mỗi lần có sự cố.
   - Nếu sau này thấy JSON bất tiện, có thể đổi sang 1 file Markdown (`status.md`) — nhưng chỉ chọn 1 định dạng, không duy trì cả hai.
2. **Commit + push lên nhánh `main`** của repo `Hoangviet1397/fotobro`. GitHub Pages tự build lại, trang trạng thái cập nhật trong vài phút.

Ai được cập nhật: chỉ người có quyền push repo (Việt / người duy trì app). Không cho người dùng ngoài sửa.

Khi sự cố kết thúc: sửa `status.json` về "Bình thường", đồng thời ghi 1 dòng vào lịch sử sự cố (mục 6).

## 6. Lịch sử sự cố

- Mỗi sự cố đã xử lý xong được ghi 1 mục trong phần "Lịch sử sự cố" trên cùng trang trạng thái.
- Mỗi mục gồm: ngày, thành phần bị ảnh hưởng, mức nặng nhất, mô tả 1–2 câu, thời gian bắt đầu — kết thúc, nguyên nhân (nếu biết, ghi rõ là phía Google / Apple / app).
- Giữ tối đa **10 sự cố gần nhất**; sự cố cũ hơn được gom vào 1 file lưu trữ (`status/archive.md`) hoặc xoá khỏi trang chính — quyết định khi code.
- Không ghi sự cố của riêng 1 người dùng (lỗi trên 1 máy) vào lịch sử chung; chỉ ghi sự cố ảnh hưởng nhiều người dùng.

## 7. Link trang trạng thái đặt ở đâu

| Vị trí | Dạng |
|---|---|
| Trong app: màn hình **Cài đặt → Trợ giúp & Hỗ trợ** | 1 dòng "Trạng thái dịch vụ" mở link trang trạng thái bằng trình duyệt trong app |
| Trong app: màn hình **Cài đặt → Trợ giúp & Hỗ trợ** | Khi có sự cố đang diễn ra, hiện thêm 1 banner ngắn trên màn hình Hôm nay, bấm vào mở trang trạng thái (banner chỉ hiện khi `status.json` có sự cố mức 2 hoặc 3 — cần code đọc file này, làm ở bước code, không phải bước thiết kế này) |
| Trang hỗ trợ (web) | Link "Trạng thái dịch vụ" ở chân trang / đầu trang hỗ trợ |
| Email hỗ trợ | Chữ ký / thư trả lời tự động dẫn link trang trạng thái khi có sự cố đang diễn ra (áp dụng sau khi email support@fotobro.app có thật) |

Không đặt link trang trạng thái ở màn hình Hôm nay khi không có sự cố — tránh làm rối màn hình chính (màn hình Hôm nay là ưu tiên số 1 của app).

## 8. Những gì KHÔNG làm ở v1

- Không có hệ thống tự động phát hiện sự cố (không ping, không uptime monitor tự động).
- Không có đăng ký nhận thông báo sự cố qua email/SMS.
- Không có trang trạng thái riêng cho từng người dùng / từng studio (Nấc 3 làm sau nếu cần).
- Không dùng dịch vụ status page trả phí (Atlassian Statuspage, Instatus…).
- Không ghi dữ liệu người dùng nào lên trang trạng thái.

## 9. Điều kiện để chuyển sang bước code

- Việt duyệt thiết kế này (đặc biệt: URL `/status/`, dùng `status.json`, giữ 10 sự cố gần nhất).
- Repo `Hoangviet1397/fotobro` đã có GitHub Pages bật (app chính cũng host ở đó).
- Email support@fotobro.app có thật hay chưa — không chặn bước code trang trạng thái, nhưng phải sửa ghi chú placeholder trong tài liệu khi email có thật.
