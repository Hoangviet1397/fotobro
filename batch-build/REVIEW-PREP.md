# FotoBro v1 — Chuẩn bị duyệt App Store (REVIEW-PREP)

> **Phạm vi:** app iOS v1, Bundle ID `com.fotobro.app`, version 1.0 (build 1),
> Capacitor 8, repo `Hoangviet1397/fotobro`.
> **Nguồn dữ kiện duy nhất:** `~/workspace/fotobro-ios-v1/APP-STORE-READY.md`
> (rà soát ngày 20/11/2026). File này chỉ chuẩn bị nội dung duyệt — không nộp
> app, không tạo tài khoản, không push GitHub, không sửa code.
> **Quy tắc vàng:** mọi thứ ghi trong Notes cho reviewer, mô tả, screenshot
> và App Privacy **phải khớp đúng build thực tế gửi đi**. Nếu một tính năng
> chưa có trong build thì không được nhắc tới nó ở bất cứ chỗ nào.

---

## 0. Hai nhánh gửi duyệt — chọn MỘT trước khi submit

Quyết định Google và mic chưa chốt dứt điểm ở thời điểm rà soát
(`APP-STORE-READY.md` §1, §12, §13 mục 9), và hai quyết định này đổi toàn bộ
nội dung duyệt. **Không submit khi chưa chọn xong một trong hai nhánh dưới
đây, và không trộn hai nhánh với nhau.**

| | **Nhánh A — Gửi duyệt an toàn (khuyến nghị nếu tới lúc submit Google/mic chưa xong)** | **Nhánh B — Google kịp v1** |
|---|---|---|
| Google | **TẮT / ẩn hẳn nút đăng nhập Google.** Không nhắc Google trong mô tả, screenshot, App Privacy. | BẬT: đăng nhập Google 1 chạm, auto toàn bộ, Client ID chung + xác minh Google đã xong, không còn cảnh báo "ứng dụng chưa xác minh". |
| Mic / giọng nói | **Dời sang v1.1.** Không có nút mic chạy được, không nhắc giọng nói trong mô tả/screenshot, bỏ 2 quyền micro/speech khỏi Info.plist. | Chỉ chọn nhánh này nếu plugin speech-recognition đã sửa xong (tối đa 2 lần thử theo quyết định đã chốt) và đã thử được trên iPhone thật qua TestFlight. |
| CloudKit | Placeholder ở cả hai nhánh (xem §4). | Placeholder ở cả hai nhánh (xem §4). |
| Notes cho reviewer dùng | **Mẫu A (§3.1)** | **Mẫu B (§3.2)** — chỉ khác Mẫu A ở đoạn Google. |

> **Lưu ý về mâu thuẫn cần Việt chốt:** `APP-STORE-READY.md` §2 mục 6 ghi
> hướng đã đổi ngày 23:52 19/11 thành "Google auto 1 chạm, BẬT ở v1 — nhưng
> chỉ bật khi Client ID chung + xác minh Google xong. Nếu tới lúc submit mà
> chưa xong thì phải tắt Google tạm". Nhiệm vụ của file này ghi "Google mặc
> định TẮT" — hiểu đúng là: **ở build gửi duyệt, Google mặc định TẮT cho tới
> khi xác minh xong; không bao giờ gửi duyệt một build có nút Google nhưng
> chưa xác minh xong.** Nếu Việt chốt Google đã sẵn sàng thì dùng Mẫu B, còn
> không thì mặc định dùng Mẫu A. Không ghi "Google BẬT" vào Notes khi build
> thực tế chưa bật.

---

## 1. Tài khoản demo cho reviewer

### 1.1. Nguyên tắc: app không cần tài khoản

FotoBro v1 là **local-first, Nấc 1 miễn phí, không tài khoản, không máy chủ
riêng**. Người dùng mở app là dùng ngay, không có màn đăng nhập bắt buộc.
Đây là điểm phải ghi rõ đầu tiên trong Notes cho reviewer (xem §3), để
reviewer không dừng lại chờ tài khoản.

- **Không tạo tài khoản FotoBro nào** — app không có hệ thống tài khoản riêng.
- **Không dùng tài khoản thật** — tuyệt đối không đưa Gmail, Apple ID hay
  tài khoản Google thật của Việt hay của Xèo (Huỳnh Thanh Phương Anh,
  Sadako Photography) cho Apple.
- **Dữ liệu reviewer thấy là dữ liệu mẫu hư cấu**, không phải job/ảnh/tiền
  thật của Xèo hay của bất kỳ khách thật nào (theo quy tắc screenshot ở
  `APP-STORE-READY.md` §9 — áp dụng y hệt cho dữ liệu demo trong app).

### 1.2. Tài khoản Google test — chỉ chuẩn bị, chỉ đưa khi Apple hỏi

Chuẩn bị **01 tài khoản Google test riêng**, chỉ dùng cho việc duyệt app:

| Mục | Nội dung |
|---|---|
| Mục đích | Để reviewer (nếu muốn) thử đăng nhập Google 1 chạm trong app — xem Lịch, Gmail báo tiền về, khách hỏi chụp, Danh bạ, Drive. |
| Tài khoản | **[ĐIỀN SAU — chưa tạo]** — tạo 1 Gmail test mới, riêng hoàn toàn với Gmail thật của Việt/Xèo. Không dùng lại tài khoản cá nhân. |
| Mật khẩu | **[ĐIỀN SAU — không ghi mật khẩu vào file này, không commit lên GitHub]** — chỉ điền trực tiếp vào trường Demo Account trong App Store Connect khi submit, hoặc cung cấp khi Apple hỏi qua Resolution Center. |
| Nội dung bên trong tài khoản test | Vài sự kiện lịch hư cấu trong 30 ngày tới (buổi chụp portrait/couple/wedding, có giờ + địa điểm hư cấu); 2–3 email mẫu hư cấu (1 email báo tiền về, 1 email khách hỏi chụp); 2–3 liên hệ hư cấu trong Danh bạ. Không có email/tiền/khách thật. |
| Xác minh 2 bước | **TẮT** trên tài khoản test này (hoặc nếu bật thì phải ghi rõ cách lấy mã trong Notes). Reviewer không có điện thoại của Việt để nhận mã. |
| Khi nào đưa cho Apple | **Chỉ điền vào App Review Information khi Google có trong build gửi đi (Nhánh B).** Ở Nhánh A (Google tắt), **không điền tài khoản Google demo** — ghi rõ Google không có trong bản này, reviewer test phần local-first theo §1.3. Nếu Apple hỏi thêm sau đó thì mới cung cấp tài khoản test qua Resolution Center. |

> **Chưa tạo tài khoản nào trong file này.** Việc tạo Gmail test, nạp sự
> kiện/email mẫu và điền mật khẩu vào App Store Connect là việc của Việt
> (hoặc người Việt ủy quyền) trước khi submit — không có sẵn username/
> password nào để điền ở đây, và không được bịa một tài khoản demo.

### 1.3. Nếu Google chưa sẵn sàng ở v1 (Nhánh A) — reviewer test phần local-first thế nào

Đây là kịch bản mặc định nếu tới lúc submit mà Client ID chung + xác minh
Google chưa xong. Ghi đúng các bước này vào Notes (§3.1) để reviewer không
bị kẹt:

1. **Mở app là dùng ngay** — không cần đăng nhập, không cần tài khoản.
   App mở lên màn **Hôm nay** với dữ liệu mẫu có sẵn.
2. **Hôm nay:** thấy lịch chụp hôm nay (giờ, khách, địa điểm), tiền hôm nay
   (đã thu / còn thiếu), ai cần giao ảnh.
3. **Thêm 1 job mới:** chọn loại job (Portrait / Couple / Wedding /
   Lookbook / Event), chọn Digital / Film / Cả hai, ngày giờ, giá tự điền
   theo bảng giá.
4. **Pipeline 8 bước:** Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh
   → Hậu kỳ → Đã giao → Xong. Chạm vào bước bất kỳ để nhảy thẳng tới đó;
   ghi cọc ở bước Chốt cọc; thử Huỷ 1 job rồi khôi phục lại.
5. **Sổ tiền / báo cáo:** xem báo cáo ngày/tuần/tháng tự tính sẵn; thu theo
   đợt/loại/phát sinh, chi theo job/tháng/thiết bị.
6. **Nhập lịch không cần Google:** nhập buổi chụp từ **Lịch iPhone** 1 chạm
   qua EventKit (sau khi cấp quyền Lịch), hoặc nhập bằng file .ics
   (fallback của bản web); nút **"Thêm vào Lịch iPhone"** trong chi tiết job
   để ghi buổi chụp ra Lịch iPhone.
7. **Nhắc lịch:** nhắc trước giờ chụp 60 phút, trước hạn giao ảnh 1 ngày
   (local notification, chỉ từ dữ liệu trên máy).
8. **Cá nhân hoá:** đổi màu chủ đề (1 trong 3 preset), thêm logo studio,
   sửa mẫu tin nhắn/email, đổi ngôn ngữ Việt/Anh, tiền tệ VND/USD
   (chỉ đổi hiển thị, không quy đổi tỷ giá).
9. **Khoá app:** Face ID / PIN — mở khoá ngay trên máy, dữ liệu sinh trắc
   học không rời khỏi máy.
10. **Sao lưu / xoá:** xuất file JSON sao lưu; xoá toàn bộ dữ liệu trong
    Cài đặt; gỡ app là xoá hết (không có bản sao trên máy chủ — vì không
    có máy chủ).

> **Kiểm tra trước khi submit (Nhánh A):** build gửi đi phải mở lên là
> thấy ngay dữ liệu mẫu hư cấu dùng được (không phải màn hình trống, không
> phải màn hình lỗi, không kẹt ở màn đăng nhập). Nếu app mở lên trống trơn
> thì reviewer sẽ đánh fail — phải tạo sẵn dữ liệu mẫu hư cấu trước khi
> build cuối, hoặc hướng dẫn tạo job trong Notes.

### 1.4. Nếu Google kịp v1 (Nhánh B) — reviewer test thêm gì

Ngoài toàn bộ §1.3, reviewer có thể dùng tài khoản Google test ở §1.2 để:

1. Bấm **"Đăng nhập Google"** 1 lần trong app — không cần tự tạo Google
   Cloud project, không dán Client ID.
2. Sau khi đăng nhập: thấy Lịch, Gmail (tiền về, khách hỏi chụp), Danh bạ,
   Drive của tài khoản test — chỉ đọc trên máy theo quyền người dùng.
3. Nhập buổi chụp từ Lịch Google / Lịch iPhone vào job.

> **Điều kiện bắt buộc của Nhánh B:** xác minh Google đã xong, reviewer
> không thấy cảnh báo "Google chưa xác minh ứng dụng này". Nếu còn cảnh báo
> thì **không được submit Nhánh B** — quay về Nhánh A.

---

## 2. App Review Information — điền gì

| Trường trong App Store Connect | Điền |
|---|---|
| Contact first / last name | **[ĐIỀN SAU — tên người Việt chỉ định trả lời Apple]** |
| Phone number | **[ĐIỀN SAU — số điện thoại trả lời được trong 1–3 ngày duyệt]** |
| Email | **[ĐIỀN SAU — email Việt kiểm soát được; chưa có email hỗ trợ `support@fotobro.app` — xem `APP-STORE-READY.md` §7, chưa mua domain, chưa tạo hộp thư nào]** |
| Demo Account — Username | Nhánh A: **để trống**, ghi trong Notes "No account required" (xem §3.1). Nhánh B: username tài khoản Google test ở §1.2. |
| Demo Account — Password | Nhánh B: mật khẩu tài khoản Google test (chỉ điền trong App Store Connect, không ghi vào file/repo/chat). |
| Notes (Reviewer Notes) | Dán **nguyên văn Mẫu A (§3.1) hoặc Mẫu B (§3.2)** bằng tiếng Anh, tùy nhánh đã chọn. Không viết lại theo trí nhớ. |
| Attachment | Không bắt buộc. Chỉ đính kèm khi Apple hỏi (ví dụ video quay màn hình TestFlight nếu reviewer báo không tái hiện được lỗi). |

---

## 3. Ghi chú cho reviewer (Reviewer Notes) — tiếng Anh, dán nguyên văn

### 3.1. Mẫu A — Dùng khi Google TẮT / mic dời v1.1 (nhánh mặc định)

> **FotoBro 1.0 — Reviewer Notes**
>
> FotoBro is a photo studio assistant for freelance photographers.
> Open the app and see Today: who you shoot today, when, where, how much
> to collect, and who to deliver photos to — all on one screen.
>
> NO ACCOUNT REQUIRED. The app works fully offline with local data. Open
> the app and start using it right away with sample data already included.
> There is no FotoBro account, no sign-up, and no server. All jobs and
> money data stay only on the device. Users can export a JSON backup and
> delete all data in Settings. Uninstalling the app deletes everything.
>
> GOOGLE SIGN-IN IS NOT INCLUDED IN THIS BUILD. Google sign-in is turned
> off by default in version 1.0 and the button is hidden. All core
> features work without Google. Reviewers can test the full app without
> any account: add a job, move it through the 8-step pipeline (Consult,
> Deposit, Upcoming shoot, Shot, Select photos, Editing, Delivered,
> Done), record a deposit, view daily/weekly/monthly money reports,
> import shoots from iPhone Calendar in one tap, and lock the app with
> Face ID or PIN.
>
> VOICE COMMANDS ARE NOT INCLUDED IN THIS BUILD. Voice control will come
> in a later version (v1.1). There is no microphone button in this build
> and the app does not request microphone or speech recognition
> permission.
>
> SYNC IS NOT INCLUDED IN THIS BUILD. iCloud/CloudKit sync is planned
> for a later paid tier and is only a placeholder in this version. There
> is no in-app purchase, no subscription, and no account in version 1.0.
> The app is free.
>
> PERMISSIONS (all requested only when the user chooses the feature):
> - Calendar (EventKit): only after the user taps "Import from iPhone
>   Calendar", to create photo jobs from the next 30 days of events.
>   Events stay on the device; nothing is uploaded — we have no server.
> - Photos: only photos the user picks as the home image or studio logo.
> - Face ID: unlocks the app on-device only; biometric data never leaves
>   the device.
> - Notifications: local reminders only, 60 minutes before a shoot and
>   1 day before a delivery deadline, generated from on-device job data.
>   No push notifications, no server.
>
> If you need anything else, please contact us and we will reply within
> 1–3 days.

### 3.2. Mẫu B — Chỉ dùng khi Google kịp v1 (đã xác minh xong, không còn cảnh báo)

> **FotoBro 1.0 — Reviewer Notes (Google enabled build)**
>
> FotoBro is a photo studio assistant for freelance photographers.
> Open the app and see Today: who you shoot today, when, where, how much
> to collect, and who to deliver photos to — all on one screen.
>
> NO ACCOUNT REQUIRED. The app works fully offline with local data. Open
> the app and start using it right away with sample data already included.
> There is no FotoBro account and no sign-up. All jobs and money data stay
> only on the device. Users can export a JSON backup and delete all data
> in Settings. Uninstalling the app deletes everything.
>
> GOOGLE SIGN-IN IS OPTIONAL. Google sign-in is offered once, with one
> tap, only for users who want to see their own Calendar, Gmail money
> alerts and client enquiries, Contacts and Drive. All core features work
> without Google. Google data is only read on the device with the user's
> permission; nothing is sent to our server — we have no server. A test
> Google account is provided in the Demo Account fields above. Two-step
> verification is off on that test account.
>
> VOICE COMMANDS ARE NOT INCLUDED IN THIS BUILD. Voice control will come
> in a later version (v1.1). There is no microphone button in this build
> and the app does not request microphone or speech recognition
> permission.
> *(Nếu mic kịp v1 thì thay đoạn này bằng: "VOICE COMMANDS: tap the
> microphone and speak a command in Vietnamese. Voice is transcribed by
> iOS speech recognition; no audio is stored or sent to us." — và chỉ
> thay khi mic đã thử được trên iPhone thật.)*
>
> SYNC IS NOT INCLUDED IN THIS BUILD. iCloud/CloudKit sync is planned
> for a later paid tier and is only a placeholder in this version. There
> is no in-app purchase, no subscription, and no account in version 1.0.
> The app is free.
>
> PERMISSIONS: same as Mẫu A, plus Google OAuth (PKCE, native redirect
> `com.fotobro.app` scheme) only when the user taps "Sign in with
> Google".
>
> If you need anything else, please contact us and we will reply within
> 1–3 days.

### 3.3. Quy tắc khi dán Notes

- Dán **đúng một mẫu**, đúng nhánh đã chọn. Không dán cả hai mẫu, không
  gộp hai mẫu.
- Sau khi dán, đọc lại từng câu và đối chiếu với build thực tế: câu nào
  nhắc tính năng không có trong build thì xoá câu đó trước khi submit.
- Không nhắc tên Xèo, Sadako, E.L.F., Super Junior hay bất kỳ dữ liệu mẫu
  thật nào của một người dùng cụ thể trong Notes.

---

## 4. CloudKit placeholder — ghi thế nào cho Apple

- **Sự thật ở v1:** Nấc 2 (CloudKit) và Nấc 3 (nhóm/studio) **có thu phí
  theo quyết định 23:43 19/11, nhưng ở v1 chỉ là placeholder trong
  code/tài liệu** — không bật IAP thật, không ghi giá vào mô tả, không
  tạo sản phẩm IAP, chưa chốt số tiền + chu kỳ (xem `APP-STORE-READY.md`
  §4 và `CLOUDKIT-PLAN.md` của agent khác).
- **Trong Notes:** ghi đúng câu đã có ở §3: *"iCloud/CloudKit sync is
  planned for a later paid tier and is only a placeholder in this
  version. There is no in-app purchase, no subscription, and no account
  in version 1.0."*
- **Trong App Store Connect:** Price = Free, **không tạo IAP nào**.
- **Trong App ID:** chỉ tick capability iCloud + Sign in with Apple khi
  Nấc 2 CloudKit bật thật ở v1; nếu Nấc 2 chỉ là placeholder thì
  **không tick thêm gì** (`APP-STORE-READY.md` §11A).
- **Không hứa ngày ra mắt Nấc 2/3, không ghi giá, không mô tả tính năng
  đồng bộ như thể đã có.** Nếu reviewer hỏi về đồng bộ thì trả lời: có
  trong lộ trình, chưa có ở v1.
- **App Privacy:** khai **"Data Not Collected"** — dữ liệu job/tiền chỉ ở
  trên máy, Apple tính là không thu thập. Khai lại nếu trước submit có
  thay đổi: Google bật (dữ liệu Google chỉ đọc trên máy, không gửi về
  máy chủ FotoBro) hoặc CloudKit bật thật (đồng bộ qua iCloud của Apple).

---

## 5. Guideline 4.8 — Sign in with Apple khi có Google sign-in

### 5.1. Khi nào Apple áp dụng 4.8

Guideline 4.8 yêu cầu: app nào cho đăng nhập bằng dịch vụ bên thứ ba
(Google, Facebook…) thì phải cung cấp **Sign in with Apple tương đương**
— trừ khi app thuộc diện miễn trừ. Đây là **nguy cơ lớn nhất ở v1**
theo `APP-STORE-READY.md` §12 mục 2, vì FotoBro v1 có (hoặc dự kiến có)
đăng nhập Google.

### 5.2. Câu trả lời chuẩn bị sẵn (ghi vào Notes nếu dùng Nhánh B, hoặc trả lời qua Resolution Center khi Apple hỏi)

> **Our position on Guideline 4.8:**
>
> 1. FotoBro has no FotoBro account. There is no sign-up and no login
>    required to use the app. All core features work fully offline with
>    local data, without any account.
> 2. Google sign-in is optional and is not a FotoBro login. It only lets
>    users who already have Google data import their own Calendar, Gmail,
>    Contacts and Drive into the app on their device. It does not create
>    a FotoBro account and does not gate any feature behind a login.
> 3. No user data is collected by us, no server is involved, and signing
>    in with Google does not give access to any FotoBro service, because
>    there is no FotoBro service to access.
> 4. For these reasons we believe Sign in with Apple is not required for
>    this optional, data-import-only Google connection. If Apple still
>    requires it, we will add Sign in with Apple before resubmission.
>
> *(Câu 4 là câu "cửa thoát" — nói trước là sẵn sàng bổ sung, để Apple
> không phải reject mà không có hướng sửa.)*

### 5.3. Các phương án nếu Apple vẫn bắt buộc

| Phương án | Khi nào dùng | Hệ quả |
|---|---|---|
| **A. Trả lời + giữ nguyên (Nhánh B)** | Apple chấp nhận lập luận §5.2 (Google chỉ là nhập dữ liệu tùy chọn, app không có tài khoản riêng). | Không sửa gì, duyệt tiếp. |
| **B. Tắt Google tạm, gửi lại Nhánh A** | Apple bắt buộc Sign in with Apple mà chưa kịp làm, hoặc Google chưa xác minh xong. | Ẩn nút Google, sửa mô tả + screenshot + App Privacy cho khớp Nhánh A, gửi lại. Đây là phương án nhanh nhất để qua duyệt. |
| **C. Thêm Sign in with Apple rồi gửi lại** | Việt quyết giữ Google ở v1 bằng mọi giá và Apple bắt buộc. | Phải làm thêm: bật capability Sign in with Apple trên App ID, thêm nút + luồng đăng nhập Apple, thử trên TestFlight, rồi gửi lại. **Không làm trong lần submit đầu** — chỉ làm khi Apple yêu cầu bằng văn bản. |

> **Mâu thuẫn trong nguồn cần Việt chốt:** `APP-STORE-READY.md` §12 mục 2
> ghi "Sign in with Apple đã được bật cho Nấc 2 CloudKit nếu reviewer yêu
> cầu", trong khi §11A ghi chỉ tick capability này khi Nấc 2 bật thật ở v1.
> **Chuẩn dùng cho file này:** ở v1 (Nấc 2 chỉ là placeholder) thì Sign in
> with Apple **chưa bật**; câu trả lời §5.2 là lập luận chính, phương án C
> là dự phòng. Không ghi vào Notes rằng Sign in with Apple "đã bật" khi
> thực tế chưa bật.

### 5.4. Các guideline khác Apple hay hỏi với app kiểu này

| Guideline / chủ đề | Câu trả lời chuẩn bị sẵn |
|---|---|
| **2.1 — App Completeness (app chưa xong / còn placeholder)** | Build gửi đi không còn màn hình trống, nút bấm không chạy, hay chữ "coming soon" không dẫn đi đâu. Placeholder CloudKit chỉ nằm trong tài liệu/lộ trình, không phải nút chết trong app. Nút mic (nếu dời v1.1) phải **ẩn hẳn**, không hiện nút bấm không chạy. |
| **2.3.3 / 4.2 — Screenshot/mô tả không khớp app** | Mô tả VI + EN, screenshot 6 ảnh/bộ và Notes đều đã khớp đúng tính năng trong build (Google có hay không, mic có hay không — kiểm theo §7 mục C). Không chụp màn đăng nhập Google có cảnh báo "ứng dụng chưa xác minh". |
| **5.1.1 — Data Collection / Privacy** | Khai "Data Not Collected"; dữ liệu chỉ ở trên máy; Privacy Policy URL đã host và mở được trên điện thoại trước khi submit (xem §7). Google (nếu bật) chỉ đọc trên máy, không gửi về máy chủ FotoBro — vì không có máy chủ. |
| **5.1.2 — Data Use / Calendar, Photos** | Lịch chỉ đọc sau khi người dùng bấm "Import from iPhone Calendar" và cấp quyền, chỉ để tạo job từ 30 ngày tới; ảnh chỉ là ảnh người dùng tự chọn làm ảnh trang chủ/logo; không đọc hết lịch/ảnh để gửi đi. |
| **4.0 / 5.2.3 — Metadata, tên/mô tả gây hiểu lầm** | Tên FotoBro, subtitle "Trợ lý studio ảnh" (17 ký tự), keywords đủ 100 ký tự (`...portrait,event`), không nhồi tên app đối thủ, không dùng từ "miễn phí" trong keywords. |
| **3.1.1 — In-App Purchase** | v1 không có IAP, không có subscription, giá Free. Nấc 2/3 trả phí chỉ là lộ trình, chưa tạo sản phẩm IAP nào. |
| **Export Compliance** | App không dùng mã hoá tự viết ngoài chuẩn (mã hoá sao lưu dùng AES chuẩn của hệ thống). Khai theo hướng dẫn của Apple; nếu dùng mã hoá đầu cuối tự triển khai cho CloudKit thì hỏi lại trước khi khai. |

---

## 6. Những gì reviewer sẽ thử — kịch bản đi qua app trong 10 phút

Viết theo đúng tính năng v1 đã chốt (`APP-STORE-READY.md` §1, §6, §9).
Dùng kịch bản này để tự thử trên TestFlight trước khi submit; chỗ nào
reviewer làm không được thì sửa app trước, đừng giải thích trong Notes.

1. Mở app → màn **Hôm nay** hiện ngay (không màn đăng nhập chặn).
2. Thấy 1 buổi Couple 16:00 + 1 buổi Portrait 09:00 (dữ liệu mẫu hư cấu),
   tiền hôm nay đã thu / còn thiếu rõ ràng.
3. Mở 1 job "Minh & Lan — Wedding" đang ở bước **Hậu kỳ (6/8)**,
   giá 15.000.000đ, đã thu cọc 5.000.000đ; chạm bước khác để nhảy bước.
4. Thêm job mới "Quán cà phê X — Lookbook", Digital, 8.000.000đ, ngày
   chụp tuần sau → job hiện trong pipeline và trong Hôm nay.
5. Mở **Sổ tiền / báo cáo tuần**: thu 12.500.000đ, chi 1.200.000đ,
   còn thiếu 3.000.000đ (số mẫu hư cấu).
6. Nhập từ **Lịch iPhone** 1 chạm (cấp quyền Lịch) — hoặc, ở Nhánh B,
   đăng nhập Google test rồi nhập từ Lịch Google.
7. Đổi màu chủ đề, đổi ngôn ngữ Việt/Anh, đổi tiền tệ VND/USD trong
   Cài đặt; khoá app bằng Face ID/PIN rồi mở lại.
8. Xoá dữ liệu mẫu / xuất JSON sao lưu trong Cài đặt (thử trên bản
   TestFlight, không thử trên build đã submit).

**Dữ liệu mẫu dùng cho cả kịch bản trên và screenshot:** tên hư cấu,
không tên/email/số điện thoại thật, không ảnh khách thật, để điện thoại
ở light mode cho bộ screenshot chính.

---

## 7. Danh sách kiểm tra trước khi bấm Submit

Làm theo thứ tự A → B → C (theo `APP-STORE-READY.md` §11). Mục nào chưa
xong thì **chưa submit được**. Đánh dấu `[x]` khi xong thật, không đánh
dấu theo trí nhớ.

### A. Trước TestFlight (chuẩn bị)

- [ ] Đã chọn **Nhánh A hay Nhánh B** (§0) và ghi lại quyết định + ngày chốt.
- [ ] App ID `com.fotobro.app` đã tạo trên Apple Developer (capability
      iCloud + Sign in with Apple **chỉ khi** Nấc 2 CloudKit bật thật ở v1;
      nếu chỉ là placeholder thì không tick thêm gì).
- [ ] App đã tạo trong App Store Connect: Name `FotoBro`, ngôn ngữ chính
      Vietnamese, Bundle ID `com.fotobro.app`, SKU `fotobro-001`.
- [ ] Privacy Policy URL đã host và **mở được trên điện thoại**:
      đề xuất `https://hoangviet1397.github.io/fotobro/PRIVACY.html`
      — chưa có URL thật ở thời điểm rà soát, phải thêm `PRIVACY.md` /
      `PRIVACY.html` vào repo `fotobro` + bật GitHub Pages trước khi tạo app.
- [ ] Support URL đã điền — tạm `https://github.com/Hoangviet1397/fotobro`
      (phải là link web, không phải email).
- [ ] App Icon 1024 (`AppIcon-1024.png`, 1024×1024, RGB, không alpha)
      đã tải lên App Information. **Lưu ý:** icon hiện vẫn là sen + ống
      kính cũ của Trợ lý Xèo; nếu Việt chốt đổi logo FotoBro mới thì phải
      render lại icon + splash **trước build cuối**.
- [ ] Pricing: Free, không IAP; App Privacy: Data Not Collected
      (khai lại nếu Google/CloudKit bật thật trước submit).
- [ ] Distribution Certificate + Provisioning Profile
      (`FotoBro App Store`) đã tạo; App Store Connect API Key (.p8) đã tạo.
- [ ] 6 secrets GitHub Actions đã dán đúng tên vào repo `fotobro`
      (không dán secret vào chat hay commit lên GitHub).
- [ ] Code đã đẩy lên repo `fotobro`, workflow iOS đã chạy xanh,
      build 1.0 (1) đã lên TestFlight.

### B. TestFlight (thử trên iPhone thật)

- [ ] Internal Testing: thêm tester (Xèo là người dùng đầu tiên) bằng
      Apple ID, cài qua app TestFlight.
- [ ] Thử đủ kịch bản §6 trên iPhone thật: Hôm nay → thêm 1 job Film +
      1 job Cả hai (Digital + Film) → nhảy bước pipeline → ghi cọc →
      huỷ + khôi phục 1 job → sổ tiền/báo cáo → (Nhánh B: đăng nhập
      Google 1 chạm; Nhánh A: nhập từ Lịch iPhone / file .ics) → đổi màu
      chủ đề/logo/ngôn ngữ/tiền tệ → sửa mẫu tin nhắn → khoá Face ID/PIN
      → sao lưu JSON.
- [ ] Kiểm dark mode + light mode, chữ không bị cắt, tab dưới không bị
      che (lỗi từng gặp ở bản web trên điện thoại).
- [ ] Chụp 6 screenshot theo `APP-STORE-READY.md` §9, đủ 2 bộ:
      6.7" 1290×2796 và 6.5" 1242×2688, đúng thứ tự, dữ liệu mẫu hư cấu,
      không dữ liệu thật, không màn cảnh báo Google chưa xác minh.
      Ảnh 4 là Google 1 chạm (Nhánh B) hoặc Nhập từ Lịch iPhone (Nhánh A).
- [ ] Sửa hết lỗi blocker, build lại nếu cần (tăng build number, giữ
      version 1.0).

### C. Trước khi bấm Submit for Review

- [ ] Mô tả VI + EN (`APP-STORE-READY.md` §6) đã khớp đúng tính năng có
      trong build gửi đi — Google có hay không, mic có hay không.
- [ ] Keywords đủ 100 ký tự, subtitle "Trợ lý studio ảnh" 17 ký tự
      (đếm lại bằng lệnh đếm ký tự, không tin con số trong file cũ).
- [ ] Screenshot 6 ảnh/bộ đã tải lên, đúng thứ tự, không có dữ liệu thật.
- [ ] App Privacy đã khai đúng, Privacy Policy URL còn mở được.
- [ ] **App Review Information đã điền đủ:** tên + email + số điện thoại
      liên hệ (trả lời được trong 1–3 ngày); Notes đã dán đúng **một**
      mẫu §3.1 hoặc §3.2; tài khoản demo: Nhánh A để trống
      ("No account required"), Nhánh B điền tài khoản Google test §1.2.
- [ ] Câu trả lời Guideline 4.8 (§5.2) đã chuẩn bị sẵn; đã quyết phương
      án dự phòng A/B/C nếu Apple hỏi.
- [ ] Export Compliance đã khai (không dùng mã hoá tự viết ngoài chuẩn).
- [ ] Không còn file/secret/test data/dữ liệu thật nào trong build gửi đi.
- [ ] `capacitor.config.ts` đã đổi màu nền + StatusBar theo UI Apple Music
      mới (trắng sạch / đen dark mode), không còn màu kem vintage `#FBF5EA`
      và StatusBar `LIGHT` cũ.
- [ ] Quyền trong Info.plist khớp đúng build: bỏ quyền Micro + Speech
      Recognition nếu mic dời v1.1; bỏ quyền Camera nếu v1 không dùng
      máy ảnh; giữ lại Lịch, Ảnh, Face ID, Thông báo (local).
- [ ] Việt đã duyệt: mô tả VI/EN, keywords, subtitle, Support URL tạm,
      logo (giữ hay đổi), mic/Google chốt nhánh nào, và thông tin liên hệ
      App Review (§13 trong `APP-STORE-READY.md`).

### Cửa chặn (submit gate) — gặp 1 trong các điều này thì DỪNG, không submit

1. Privacy Policy URL chưa mở được trên điện thoại.
2. Google có trong build nhưng chưa xác minh xong (reviewer sẽ thấy cảnh
   báo "ứng dụng chưa xác minh").
3. Mô tả/screenshot/Notes nhắc tới mic hoặc Google trong khi build không có.
4. Nút mic hiện trong app nhưng bấm không chạy.
5. App mở lên trống trơn / lỗi / kẹt ở màn đăng nhập.
6. Screenshot hoặc dữ liệu demo chứa tên/email/số điện thoại/ảnh thật.
7. Không liên hệ được người điền trong App Review Information trong 1–3 ngày.

---

## 8. Sau khi bấm Submit — nếu Apple trả về (rejection)

1. Đọc kỹ lý do trong Resolution Center, ghi lại đúng Guideline Apple viện
   dẫn (thường là 4.8, 2.1, 5.1.1 hoặc 2.3.3 — xem §5.4).
2. Không tranh luận dài — trả lời ngắn bằng tiếng Anh, theo mẫu đã chuẩn
   bị ở §5.2/§5.4, kèm việc đã sửa (nếu có).
3. Nếu bị bắt thêm Sign in with Apple: chọn phương án B (§5.3 — tắt Google
   tạm, gửi lại Nhánh A) trừ khi Việt quyết làm phương án C.
4. Nếu bị bắt sửa mô tả/screenshot: sửa đúng chỗ Apple chỉ, build lại
   (tăng build number, giữ version 1.0), gửi lại.
5. Ghi lại toàn bộ trao đổi với Apple vào file này (mục §9) để lần sau
   không lặp lại.

---

## 9. Nhật ký trao đổi với Apple (điền sau khi submit)

| Ngày | Guideline Apple viện dẫn | Apple hỏi gì | Đã trả lời / sửa gì | Kết quả |
|---|---|---|---|---|
| _chưa submit_ | — | — | — | — |

---

## 10. Nguồn

- `~/workspace/fotobro-ios-v1/APP-STORE-READY.md` — toàn bộ dữ kiện trong
  file này bám theo đó (§1 quyết định đã chốt, §3 metadata, §4 giá/IAP,
  §5 keywords, §6 mô tả, §7 Support/Privacy URL, §9 screenshots, §10 App
  Privacy + quyền, §11 checklist A/B/C, §12 câu trả lời khi Apple hỏi,
  §13 việc còn chờ Việt).
- Các file song song khác (không sửa, chỉ tham chiếu khi ghép lại):
  `GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md`, `PUSH-READY.md`,
  `~/workspace/fotobro-scale/docs/EMAIL-SETUP.md` (domain/email hỗ trợ).
