# FotoBro v2.2 — Changelog

## Màn đăng nhập lúc vào app
- Mở app lần đầu (chưa liên kết tài khoản nào) hiện màn đăng nhập toàn màn hình: nút "Đăng nhập bằng Apple" (đen, đúng HIG) và "Đăng nhập bằng Google", kèm "Dùng thử không cần tài khoản".
- Đăng nhập thành công thì tự vào app chính; bấm Huỷ ở sheet Apple/Google thì ở yên màn đăng nhập, không toast lỗi.
- Mục Tài khoản trong Cài đặt giữ nguyên (đăng xuất / đổi tài khoản vẫn ở đó). Không bắt buộc đăng nhập để dùng app.

## Apple sign-in hiện rõ lỗi thật
- Bridge coi cả code `1001` (raw ASAuthorizationError.canceled) là Huỷ, im lặng như trước.
- Lỗi thật được lưu vào `cfg.appleLastError` và hiện 1 dòng trong mục Tài khoản ở Cài đặt ("Lỗi gần nhất: <code> — <message>") để lần test sau biết chính xác lỗi gì. Đăng nhập thành công thì xoá lỗi cũ.

## Khoá Face ID dùng sinh trắc native
- Plugin mới `@capgo/capacitor-native-biometric` 8.9.3 (Capacitor 8, có Package.swift): khoá/mở khoá bằng Face ID native thay cho WebAuthn trong WKWebView (nguyên nhân lỗi "Chưa bật được" ở build 2.1).
- Máy chưa cài Face ID / vân tay thì báo rõ trước khi mở form. PIN dự phòng giữ nguyên (SHA-256 + salt, key `troLyXeo.lock` không đổi). Bản web giữ nguyên WebAuthn.

## Mẫu tin nhắn / email thiết kế lại
- Mỗi mẫu là 1 card gọn với bản xem trước đã điền số liệu mẫu (Mai Anh, Portrait, Thứ Bảy 22/11/2026...) — không còn hiện `{tên} {loại}...` thô trong giao diện.
- Bấm card mở sheet soạn: ô Tiêu đề + Nội dung tự cao theo nội dung, hàng chip bấm để chèn chỗ trống vào vị trí con trỏ, nút Xem trước / Soạn mẫu, nút Khôi phục mẫu gốc. Sửa xong tự lưu như cũ.
- Bỏ dòng "xem README" lọt vào Cài đặt.

## Khác
- Phiên bản 2.2 (APP_VERSION, MARKETING_VERSION, package 2.2.0). Test jsdom: 635 cũ + test mới cho 4 việc trên.
