# Bật "Đăng nhập bằng Facebook" cho FotoBro

FotoBro chỉ xin **tên, email và ảnh đại diện** để làm thẻ danh thiếp studio. Hai quyền này (`public_profile`, `email`) Facebook cấp sẵn, **không cần Meta xét duyệt app**.
Code trong app đã viết xong. Nút Facebook tự ẩn cho tới khi có mã thật, nên các bản build hiện tại không bị ảnh hưởng.

## Bước 1 — Tạo app trên Meta (Việt làm, khoảng 10 phút)

Tên nút trên trang Meta có thể khác một chút tuỳ thời điểm.

1. Vào **developers.facebook.com** và đăng nhập Facebook.
   - Lần đầu, Meta bắt đăng ký tài khoản nhà phát triển và xác minh số điện thoại.
2. **My Apps → Create App**.
   - Mục đích: chọn **"Authenticate and request data from users with Facebook Login"**.
   - Tên app: `FotoBro`. Email liên hệ: `supportfotobro@gmail.com`.
3. **Use cases → Facebook Login → Customize → Permissions**: bấm **Add** cho `email`. `public_profile` có sẵn rồi.
4. **App settings → Basic**:
   - **Privacy Policy URL**: `https://hoangviet1397.github.io/fotobro/PRIVACY.html`
   - **User data deletion**: chọn "Data deletion instructions URL", dán `https://hoangviet1397.github.io/fotobro/PRIVACY.html`. Mục 5 trong trang đó hướng dẫn xoá tài khoản.
   - **Category**: Photography (hoặc Utilities). **App icon**: ảnh 1024×1024 của FotoBro.
   - Kéo xuống **Add platform → iOS**: Bundle ID `com.fotobro.app`.
   - Chép **App ID** (dãy số ở đầu trang).
5. **App settings → Advanced → Security**: chép **Client token**.
6. Chuyển app sang **Live**: công tắc App Mode ở đầu trang, hoặc mục Publish.
   - Chưa Live thì chỉ tài khoản của chính bạn đăng nhập được.

Gửi lại cho Claude **App ID** và **Client token**.
**KHÔNG gửi App Secret.** App không dùng App Secret, và không được đưa nó vào app.

## Bước 2 — Gắn vào app (Claude làm)

```bash
node scripts/enable-facebook.js <APP_ID> <CLIENT_TOKEN>
npx cap sync ios
node test-fotobro-v2.js
```

Script tự làm 4 việc:
1. Cài plugin `@capacitor-community/facebook-login@8.1.0`. Plugin này hợp với SPM.
2. Sửa `Info.plist`: thêm App ID, Client Token, URL scheme `fb<APP_ID>`, LSApplicationQueriesSchemes.
3. Sửa `AppDelegate.swift` và `SceneDelegate.swift`: khởi tạo SDK và nhận URL quay về.
4. Điền `facebookAppId` vào `www/fotobro-config.js`.

## Bước 3 — Build (Muse)

Build iOS từ main như mọi lần. Lần này có thêm gói native Facebook (SDK 18.x qua Swift Package Manager), nên lần build đầu sẽ lâu hơn.
Nếu Xcode báo `No such module 'FBSDKCoreKit'` ở AppDelegate, thêm product **FacebookCore** (gói `facebook-ios-sdk`) vào target App.

## Trong app sẽ có

- Nút **"Đăng nhập bằng Facebook"** ở màn đăng nhập, ở bước cuối Thiết lập nhanh, và trong Cài đặt → Tài khoản & kết nối.
- Đăng nhập xong: tên tự điền (nếu chưa có), email vào hồ sơ, **ảnh đại diện Facebook** lên thẻ danh thiếp studio.
- iPhone dùng chế độ **Limited Login** của Facebook: không theo dõi người dùng, không cần hỏi quyền theo dõi (ATT).
- **Đăng xuất Facebook**, hoặc **Xoá tài khoản & toàn bộ dữ liệu**: xoá thông tin Facebook khỏi máy.

## Không lấy được (Meta không cho nếu không xét duyệt app + có máy chủ)

- Ảnh trong album / bài đăng Facebook.
- Link trang cá nhân.
- Ảnh Instagram.
