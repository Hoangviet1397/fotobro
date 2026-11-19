# FotoBro — Thiết kế mục "Có gì mới"

> Thiết kế, chưa code. Vị trí: **Cài đặt → Có gì mới**.
> Mục đích: người dùng mở app sau khi cập nhật biết ngay bản mới có gì thay đổi, bằng tiếng Việt đơn giản, không thuật ngữ kỹ thuật.

## 1. Nguồn nội dung

- Nguồn duy nhất: `CHANGELOG-v1.0.md` trong cùng thư mục dự án.
- Mỗi phiên bản = 1 mục trong feed. Không tách nhỏ theo tính năng, không gộp nhiều phiên bản vào 1 mục.
- Chỉ lấy từ 2 phần của changelog: **"Tính năng mới"** và **"Đã bỏ"** (chỉ khi việc bỏ ảnh hưởng cách dùng, ví dụ bỏ nhập file `.ics`).
- **Không đưa vào feed:** phần "Lỗi đã biết / chưa làm xong" và phần "Sẽ làm ở v1.1" — feed chỉ nói những gì đã có và dùng được trong bản đó. Không hứa tính năng tương lai.
- Mỗi mục viết lại bằng câu ngắn, dễ hiểu cho photographer, không copy nguyên văn changelog kỹ thuật (ví dụ: không ghi "plugin SPM", "PKCE", "Xcode 26").
- Khi phát hành phiên bản mới: thêm 1 mục mới vào đầu feed, kèm số phiên bản và ngày phát hành (ngày để trống cho tới khi bản đó lên TestFlight/App Store, như v1.0 hiện tại).

## 2. Cách hiển thị

- Đường vào: hàng **"Có gì mới"** trong màn Cài đặt. Mở ra là 1 trang danh sách.
- Thứ tự: **phiên bản mới nhất lên đầu**, cũ dần xuống dưới.
- Mỗi mục gồm:
  - Tiêu đề: số phiên bản (ví dụ "Phiên bản 1.0") + ngày phát hành nếu đã có.
  - **3–5 gạch đầu dòng ngắn**, mỗi gạch tối đa ~1 dòng, 1 ý duy nhất.
  - Nếu bản đó có ít hơn 3 thay đổi đáng nói thì ghi đúng số đó, không bịa thêm cho đủ 3. Nếu nhiều hơn 5 thì gộp ý gần nhau lại, không ghi quá 5 gạch.
- Cuối trang (hoặc cuối mỗi mục mới nhất) có nút **"Đã xem"**. Bấm nút này thì chấm đỏ biến mất (xem §3).
- Ngôn ngữ: theo ngôn ngữ đang chọn trong app (Việt/Anh). Bản tiếng Việt viết trước; bản tiếng Anh dịch sau, chưa có thì tạm hiện tiếng Việt, không để trống.
- Giao diện theo chuẩn chung của app v1: Large Title, SF Pro, nền trắng/dark mode đen, 1 màu nhấn `#FA2D48`.

### Ví dụ mục v1.0 (bản đầu tiên, gộp từ CHANGELOG-v1.0.md)

> **Phiên bản 1.0**
> - App chung cho mọi photographer tự do, không còn riêng Xèo.
> - Job chạy 8 bước, nhảy thẳng tới bước bất kỳ; tới bước Chốt cọc thì ghi cọc, tới bước Đã giao thì nhắc thu nốt.
> - Đăng nhập Google 1 chạm, nhập buổi chụp từ Lịch iPhone, không cần file lịch nữa.
> - Đổi màu chủ đề, gắn logo studio, sửa mẫu tin nhắn theo giọng của mình.
> - Giao diện mới gọn và sáng hơn, theo kiểu Apple Music.

## 3. Khi nào hiện chấm đỏ báo có mới

- Chấm đỏ hiện trên hàng **"Có gì mới"** trong Cài đặt khi **phiên bản app hiện tại mới hơn phiên bản đã xem gần nhất** — tức là lần đầu mở app sau khi cập nhật lên bản mới.
- Chỉ hiện 1 chấm đỏ, không hiện số đếm (không ghi "3 mới").
- Chấm đỏ **chỉ tắt khi người dùng bấm nút "Đã xem"**. Mở trang "Có gì mới" mà chưa bấm thì chấm đỏ vẫn còn.
- Lần đầu cài app (chưa có phiên bản đã xem nào): không hiện chấm đỏ — v1.0 là bản đầu tiên người dùng thấy, không tính là "mới cập nhật".
- Cập nhật mà feed không có mục mới (chỉ sửa lỗi nhỏ, không đổi tính năng): không hiện chấm đỏ.

## 4. Dữ liệu lưu local, không gọi mạng

- Nội dung feed **đóng gói sẵn trong app** (cùng bản phát hành), không tải từ máy chủ, không gọi mạng khi mở trang.
- Chỉ lưu local 1 giá trị duy nhất: **phiên bản mới nhất đã xem** (ví dụ đã xem tới `1.0`).
  - Gợi ý key lưu trữ theo quy ước sẵn có của app (key dữ liệu chính là `troLyXeo.v1`): `fotobro.seenChangelogVersion`.
  - Chỉ lưu số phiên bản (chuỗi ngắn), không lưu tên, ngày giờ hay nội dung feed.
- So sánh đơn giản: mở app → lấy phiên bản app hiện tại so với phiên bản đã xem đã lưu. Nếu hiện tại mới hơn → hiện chấm đỏ. Bấm "Đã xem" → ghi đè giá trị đã lưu bằng phiên bản hiện tại.
- Không gửi dữ liệu này đi đâu, không đồng bộ CloudKit, không cần tài khoản.
- Xoá app / cài lại: giá trị đã lưu mất theo, lần đầu mở lại sau cài mới thì không hiện chấm đỏ (theo §3).

## 5. Ghi chú cho người làm tiếp (khi code)

- Thêm mục feed mới là việc của mỗi lần phát hành: viết mục mới trong feed trước khi đẩy bản lên TestFlight, kiểm tra đủ 3–5 gạch, đúng thứ tự mới nhất lên đầu.
- Kiểm tra tay: (1) cài bản cũ → cập nhật bản mới → mở app thấy chấm đỏ; (2) vào Cài đặt → Có gì mới → bấm "Đã xem" → chấm đỏ tắt; (3) tắt app mở lại → chấm đỏ không hiện lại; (4) bật chế độ máy bay → trang vẫn mở được, nội dung đầy đủ.
