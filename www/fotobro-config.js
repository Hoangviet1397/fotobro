/* FotoBro iOS v2.0 — cấu hình dùng chung, 1 file duy nhất.
 * googleClientId: Client ID OAuth CHUNG của FotoBro (loại iOS + Web, PKCE).
 *   ĐÃ ĐIỀN Client ID iOS thật ngày 20/11/2026 (project FotoBro, tạo trên
 *   Google Cloud Console). Không có Client ID thì nút "Đăng nhập Google"
 *   báo chưa sẵn sàng, app vẫn chạy bình thường.
 *   TUYỆT ĐỐI không điền client_secret vào app (public client dùng PKCE).
 *   Redirect native KHÔNG cần điền tay: code tự suy ra reversed client ID
 *   (com.googleusercontent.apps.<Client-ID-phần-đầu>:/oauth2redirect) từ
 *   Client ID này — xem GOOGLE-SETUP.md §2c. Chỉ khi chưa có Client ID thật
 *   thì googleRedirectScheme dưới mới là scheme tạm 'com.fotobro.app'.
 *   Khi đã dán Client ID thật, nhớ đăng ký scheme reversed đó trong
 *   ios/App/App/Info.plist (CFBundleURLTypes) — đã làm 20/11/2026, scheme
 *   'com.googleusercontent.apps.613244728921-utl1gi6qiu7ombgh4tmf4v96h17ks4sp'.
 * cloudKitContainer: container CloudKit Nấc 2 — trạng thái not-configured
 *   cho tới khi Việt tạo container iCloud.com.fotobro.app trên App ID.
 * supportEmail: supportfotobro@gmail.com — Gmail hỗ trợ đã tạo xong 20/11/2026,
 *   dùng làm email liên hệ trong app + màn hình xin quyền Google (tạm dùng
 *   vietvuthom@gmail.com trên màn hình xin quyền vì Google chỉ cho chọn email
 *   của chính chủ project).
 */
window.FOTOBRO_CONFIG = {
  googleClientId: '613244728921-utl1gi6qiu7ombgh4tmf4v96h17ks4sp.apps.googleusercontent.com',
  googleRedirectScheme: 'com.fotobro.app', // scheme TẠM khi chưa có Client ID thật; có Client ID rồi thì code tự dùng reversed client ID
  cloudKitContainer: 'iCloud.com.fotobro.app',
  supportEmail: 'supportfotobro@gmail.com'
};
