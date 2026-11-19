/* FotoBro iOS v2.0 — cấu hình dùng chung, 1 file duy nhất.
 * googleClientId: Client ID OAuth CHUNG của FotoBro (loại iOS + Web, PKCE).
 *   ĐANG ĐỂ TRỐNG (placeholder) — Việt tạo 1 lần trên Google Cloud rồi dán
 *   vào đây, KHÔNG phải từng người dùng tự tạo. Không có Client ID thì nút
 *   "Đăng nhập Google" báo chưa sẵn sàng, app vẫn chạy bình thường.
 *   TUYỆT ĐỐI không điền client_secret vào app (public client dùng PKCE).
 *   Redirect native KHÔNG cần điền tay: code tự suy ra reversed client ID
 *   (com.googleusercontent.apps.<Client-ID-phần-đầu>:/oauth2redirect) từ
 *   Client ID này — xem GOOGLE-SETUP.md §2c. Chỉ khi chưa có Client ID thật
 *   thì googleRedirectScheme dưới mới là scheme tạm 'com.fotobro.app'.
 *   Khi đã dán Client ID thật, nhớ đăng ký scheme reversed đó trong
 *   ios/App/App/Info.plist (CFBundleURLTypes) THAY cho placeholder
 *   'com.googleusercontent.apps.CHUA-CO-CLIENT-ID' hiện tại (L1), nếu không
 *   Google trả lỗi redirect_uri_mismatch.
 * cloudKitContainer: container CloudKit Nấc 2 — trạng thái not-configured
 *   cho tới khi Việt tạo container iCloud.com.fotobro.app trên App ID.
 * supportEmail: chưa có — cần mua domain fotobro.app trước (xem EMAIL-SETUP.md).
 */
window.FOTOBRO_CONFIG = {
  googleClientId: '',
  googleRedirectScheme: 'com.fotobro.app', // scheme TẠM khi chưa có Client ID thật; có Client ID rồi thì code tự dùng reversed client ID
  cloudKitContainer: 'iCloud.com.fotobro.app',
  supportEmail: ''
};
