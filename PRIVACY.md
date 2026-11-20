# Chính sách riêng tư — FotoBro

> **Dùng làm Privacy Policy URL cho App Store.**
> Host tại repo `Hoangviet1397/fotobro`, file `PRIVACY.html`, URL GitHub Pages
> `https://hoangviet1397.github.io/fotobro/PRIVACY.html` (bật Pages trên repo
> `fotobro` rồi mới có URL này — hiện chưa host). Bản `.md` này và `PRIVACY.html`
> viết cùng một nội dung, đồng bộ ngày 20/11/2026 (FotoBro iOS v2.0).
> Liên hệ: supportfotobro@gmail.com.
>
> **English summary is at the bottom of this file.**

## Tóm tắt ngắn (đọc 30 giây là đủ)

- FotoBro là app **cho nhiếp ảnh gia tự do** để quản lý job chụp, thu chi và nhắc lịch.
  Mỗi người dùng tự điền tên và studio của mình trong Cài đặt; app không có tài khoản
  chung và không chia sẻ dữ liệu giữa các người dùng.
- **Mọi dữ liệu của bạn chỉ nằm trên điện thoại của bạn.** App không có
  máy chủ riêng, không gửi dữ liệu của bạn lên bất kỳ máy chủ nào của
  chúng tôi, không bán dữ liệu, không quảng cáo, không theo dõi bạn
  (không tracking, không analytics, không SDK quảng cáo).
- Chỉ khi **bạn tự bấm "Đăng nhập Google"** và cho phép, app mới đọc Lịch /
  Gmail / Danh bạ / Drive của bạn — và chỉ đọc những gì bạn đã cho phép,
  ngay trên máy bạn. Google **mặc định TẮT** cho tới khi bạn đăng nhập.
- Bạn có thể **xoá toàn bộ dữ liệu** bất cứ lúc nào trong app (Cài đặt →
  Xoá dữ liệu), và xuất bản sao lưu JSON về máy của bạn.

## 1. Dữ liệu app lưu — và lưu ở đâu

App lưu các thứ sau **chỉ trên điện thoại của bạn** (bộ nhớ trong của app,
không đồng bộ lên đám mây nào ở v2.0):

| Dữ liệu | Dùng để làm gì |
|---|---|
| Job chụp (khách, loại chụp, ngày giờ, địa điểm, giá, cọc, tiến độ) | Quản lý pipeline 8 giai đoạn, nhắc lịch, báo cáo |
| Thu / chi (số tiền, loại, ngày, job liên quan) | Sổ tiền, báo cáo ngày / tuần / tháng |
| Cài đặt (tên, studio, logo, màu chủ đề, bảng giá, % cọc, ngày trả ảnh, chi cố định, ngôn ngữ, tiền tệ, mẫu tin nhắn) | App chạy theo cách bạn đã chốt |
| Ảnh trang chủ bạn tự chọn từ máy (tối đa 60) | Ảnh nền màn hình Hôm nay, đổi mỗi ngày nếu bạn muốn |
| Mã khoá app (PIN + khoá Face ID / vân tay nếu bạn bật) | Khoá app khi mở lại |

App **không** thu thập: tên đầy đủ / CCCD / số điện thoại của khách ngoài
những gì bạn tự gõ vào job; vị trí GPS; danh bạ điện thoại (trừ khi bạn
bật tính năng Google Danh bạ — xem mục 2); giọng nói (mic dời sang v2.1,
xem mục 3).

**Lưu ý về bảo mật lưu trữ (v2.0):** dữ liệu trên máy được lưu dạng thường
trong vùng nhớ riêng của app (sandbox iOS) và được bảo vệ bằng mật mã iPhone
+ sandbox của iOS — app v2.0 chưa mã hoá riêng dữ liệu lúc lưu. Khoá Face ID /
PIN trong app chỉ ẩn giao diện khi mở lại app. Mất máy mà không có mật mã
iPhone thì coi như mất dữ liệu. Mã hoá dữ liệu lúc lưu dự kiến ở v2.1.

## 2. Kết nối Google — chỉ khi bạn tự bật

Tính năng Google (Lịch, Gmail, Drive, Danh bạ) **mặc định TẮT**. Chỉ khi
bạn vào app bấm **"Đăng nhập Google"** một lần và cho phép, app mới kết nối
bằng tài khoản Google của chính bạn — bạn không cần tự tạo Google Cloud
project hay dán Client ID, app dùng Client ID chung của FotoBro. Khi đăng
nhập, app xin đủ các quyền sau **trong 1 lần** (không xin lẻ từng tính năng):

- Lịch: đọc lịch để hiện lịch chụp; ghi sự kiện buổi chụp vào Google Lịch.
- Gmail: đọc mail báo tiền về và mail khách hỏi chụp (để gợi ý ghi sổ — app
  không tự ghi, bạn bấm đồng ý mới ghi); gửi email cho khách bằng mẫu có sẵn.
- Danh bạ: đọc tên + email / số điện thoại để gợi ý khách.
- Drive: chỉ đọc tên + link thư mục ảnh của job.

Cơ chế: app dùng OAuth 2.0 của Google (PKCE, mở bằng trình duyệt hệ thống).
Để bạn không phải đăng nhập lại, app **giữ đăng nhập**: mã đăng nhập (access
token, hết hạn sau khoảng 1 giờ) và mã làm mới (refresh token) chỉ lưu trong
vùng nhớ riêng của app trên máy bạn; app tự dùng mã làm mới để lấy mã mới,
không gửi mã này cho chúng tôi hay ai khác.
Bạn bấm "Ngắt kết nối" là mã đăng nhập được thu hồi tại Google và toàn bộ
dữ liệu Google đã tải (lịch, email gợi ý, danh bạ) bị xoá khỏi máy. Sự kiện
đã ghi trên Google Lịch vẫn còn — xoá trong app Lịch nếu muốn. Dữ liệu Google
của bạn chỉ được xử lý trên máy bạn — app không có máy chủ trung gian, không
gửi dữ liệu Google của bạn cho chúng tôi hay bên thứ ba nào.

App không gửi dữ liệu cho Facebook, Messenger hay bất kỳ bên thứ ba nào
khác. Các nút mở Facebook / Messenger / Gmail / Drive chỉ là **đường
dẫn mở app ngoài** — bạn bấm mới mở, app không tự gửi gì đi.

## 3. Lịch iPhone, đồng bộ CloudKit và giọng nói

- **Lịch iPhone:** chỉ khi bạn bấm "Nhập từ Lịch iPhone" và cho phép quyền
  truy cập Lịch, app mới đọc các sự kiện trong 30 ngày tới để tạo buổi chụp.
  App không đọc lịch khi bạn không bấm nhập. Khi bạn chưa đăng nhập Google,
  buổi chụp có ngày chụp được tự lưu vào Lịch iPhone (iPhone hỏi quyền Lịch lần
  đầu) để có nhắc trước 1 ngày; sửa, huỷ hay xoá buổi chụp thì sự kiện đó được
  sửa / xoá theo. App chỉ ghi / xoá sự kiện do chính app tạo. Đã đăng nhập Google
  thì lưu vào Google Lịch thay vì Lịch iPhone.
- **CloudKit (đồng bộ / sao lưu, Nấc 2, có thu phí):** ở v2.0 chưa bật
  (trạng thái not-configured, container `iCloud.com.fotobro.app` chưa được
  tạo). Chỉ khi bạn đăng nhập bằng Apple ID và bật đồng bộ, dữ liệu mới được
  mã hoá đầu cuối (AES-256-GCM) rồi lưu vào iCloud cá nhân của bạn. Chúng tôi
  không đọc được nội dung đã mã hoá, và không dùng dữ liệu này cho mục đích
  nào khác. Bạn tắt đồng bộ bất cứ lúc nào; dữ liệu trên máy bạn vẫn giữ nguyên.
- **Đăng nhập bằng Apple (v2.1):** tuỳ chọn, không bắt buộc. Khi bạn đăng nhập bằng
  Apple ID, app chỉ lưu mã định danh Apple, tên và email (nếu bạn cho phép, có thể
  là email ẩn của Apple) **trên máy này**, không gửi lên máy chủ FotoBro (chúng tôi
  không có máy chủ lưu tài khoản). Đăng xuất sẽ xoá các thông tin này khỏi máy.
- **Giọng nói:** mic **chưa có ở v2.0** (dời sang v2.1). Ở v2.0 bạn gõ tay câu
  lệnh / câu hỏi trong app; app không ghi âm, không lưu file ghi âm.

## 4. Thông báo

App có thể gửi thông báo nhắc lịch chụp (trước giờ chụp **1 ngày**) và nhắc
hạn giao ảnh (trước 1 ngày) — chỉ từ dữ liệu job trên máy bạn, không qua
máy chủ. Thông báo hiện tên khách + giờ chụp trên màn hình khoá nếu iPhone
của bạn đang bật hiện nội dung thông báo. Bạn tắt được trong Cài đặt iPhone
→ Thông báo → FotoBro.

## 5. Trẻ em

App dành cho người lớn (chủ studio) và không hướng tới trẻ em dưới 13
tuổi. App không cố ý thu thập dữ liệu của trẻ em.

## 6. Xoá dữ liệu

- Trong app: Cài đặt → Xoá dữ liệu đã lưu → **xoá toàn bộ**: job, thu chi,
  ảnh trang chủ, cài đặt (giá, logo, mẫu tin), khoá app, token Google và dữ
  liệu Google đã tải. Sau đó app tải lại trắng như mới.
- File sao lưu JSON bạn tự tải về máy **không** xoá được từ trong app — tự
  xoá trong Files. Sự kiện đã ghi trên Google Lịch cũng vẫn còn.
- Gỡ app khỏi iPhone cũng xoá toàn bộ dữ liệu (vì dữ liệu chỉ ở trên máy).
- Bản sao lưu JSON bạn tự tải về máy là của bạn — app không giữ bản sao
  nào trên máy chủ (vì không có máy chủ).
- Nếu bạn đã bật đồng bộ CloudKit (Nấc 2), bạn có thể xoá cả bản sao lưu đã
  mã hoá trong iCloud từ trong app.

## 7. Thay đổi chính sách

Nếu chính sách này thay đổi, bản mới sẽ được cập nhật tại chính URL này
và ghi ngày cập nhật ở đầu trang. Vì app không có tài khoản người dùng
nên chúng tôi không gửi thông báo riêng — bạn xem lại URL này khi cần.

## 8. Liên hệ

Mọi thắc mắc về dữ liệu trong app, liên hệ: supportfotobro@gmail.com.

---

## English summary

**FotoBro** is an app for freelance photographers to manage photo jobs,
income/expenses and reminders. Each photographer fills in their own name and
studio in Settings; there is no shared account and no data sharing between users.

- **All your data stays on your device.** The app has no server of its
  own, sends your data to no server, sells no data, shows no ads, and
  uses no tracking or analytics SDKs. Data is stored unencrypted inside
  the app's iOS sandbox and protected by your iPhone passcode; per-file
  encryption is planned for v2.1.
- Google Calendar / Gmail / Contacts / Drive are **off by default** and
  only connect when you tap "Sign in with Google" once and grant
  permission; the app requests all six scopes at once and only reads what
  you allowed, on your device. Sign-in uses Google OAuth 2.0 (PKCE, system
  browser). To keep you signed in, the access token (about 1 hour) and a
  refresh token are stored only in the app's private storage on your device
  and are never sent to us or anyone else. Tapping "Disconnect" revokes the token at Google and deletes
  downloaded Google data from the device.
- iPhone Calendar import only runs when you tap "Import from iPhone
  Calendar" and grant Calendar access. CloudKit sync/backup (Tier 2, paid)
  is not configured in v2.0 and stores only end-to-end encrypted data
  (AES-256-GCM) in your own iCloud container (`iCloud.com.fotobro.app`)
  when enabled.
- Voice input is **not in v2.0** (moved to v2.1); v2.0 uses typed commands only,
  no audio is recorded.
- Reminders fire 1 day before a shoot and 1 day before a delivery
  deadline; the lock-screen notification shows the client's name and shoot
  time. You can turn notifications off in iPhone Settings → Notifications
  → FotoBro.
- You can delete all data at any time inside the app (Settings → Delete
  saved data) — jobs, income/expenses, home photos, settings, app lock,
  Google tokens and downloaded Google data; uninstalling the app deletes
  everything as well. Backup files you downloaded and events already
  written to Google Calendar are not deleted from inside the app.
- Contact: supportfotobro@gmail.com.
