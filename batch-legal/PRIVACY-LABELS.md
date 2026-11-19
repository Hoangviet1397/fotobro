# Nhãn riêng tư App Store (App Privacy) — FotoBro iOS v1

- **App:** FotoBro — Bundle ID `com.fotobro.app`, v1.0
- **Ngày lập:** 20/11/2026
- **Mục đích file này:** bản nháp duy nhất để khai **App Privacy (Privacy Nutrition Labels)** trong App Store Connect khi nộp FotoBro iOS v1 — liệt kê từng loại dữ liệu theo đúng phân loại của Apple, dữ liệu nào chỉ lưu local, dữ liệu nào rời máy tới Google khi người dùng bật Google, có chia sẻ cho bên thứ ba không, và quyết định nào còn chờ Việt chốt. **File này chưa phải là bản đã khai** — chưa có app nào trong App Store Connect, chưa ai điền questionnaire.
- **Trạng thái:** BẢN NHÁP, dựa trên code thật + tài liệu thật (xem §10). Không phải tư vấn pháp lý.

## 0. Kết luận 1 dòng

**"Data Not Collected" chỉ đúng cho lõi local-first khi Google TẮT và CloudKit TẮT; v1 như thiết kế có Google auto 1 chạm (6 scope, truy cập liên tục sau 1 lần cho phép) nên bản khai đúng cho v1 đầy đủ tính năng là khai các loại dữ liệu Google (mục §4, phương án A) — khai "Data Not Collected" nguyên xi cho cả app có Google sẽ là khai sai.**

| Phương án khai | Khi nào dùng được | Nhãn hiển thị |
|---|---|---|
| **A — Khai đủ các loại dữ liệu Google (khuyến nghị)** | V1 nộp đúng như thiết kế: Google bật được bằng 1 chạm, xin đủ 6 scope 1 lần | "Data Linked to You": Contact Info (Name, Email), User Content (Emails, Other User Content), Contacts, Financial Info (Other Financial Info) — mục đích duy nhất **App Functionality**; "Data Used to Track You": **không có** |
| **B — "Data Not Collected"** | Chỉ khi bản nộp **tắt hẳn Google** (hoặc gỡ Google khỏi v1, dời sang v1.1) và CloudKit vẫn chưa bật | "Data Not Collected" |

- Cả hai phương án đều ghi: **không tracking, không quảng cáo, không analytics, không bán dữ liệu, không data broker, không SDK bên thứ ba thu thập dữ liệu** (khớp `SDK-INVENTORY.md` trong cùng thư mục `batch-legal/`).
- Việt chốt phương án nào thì khai theo phương án đó — xem §9, quyết định số 1.

## 1. Apple định nghĩa "thu thập" (Collect) như thế nào — điểm then chốt

Nguồn: Apple Developer, "App Privacy Details" — https://developer.apple.com/app-store/app-privacy-details/ (đọc ngày 20/11/2026).

> **"Collect" refers to transmitting data off the device in a way that allows you and/or your third-party partners to access it for a period longer than what is necessary to service the transmitted request in real time.**
> ("Thu thập" là việc truyền dữ liệu ra khỏi thiết bị theo cách cho phép bạn và/hoặc đối tác bên thứ ba truy cập nó lâu hơn thời gian cần thiết để xử lý yêu cầu đã truyền trong thời gian thực.)

Hệ quả trực tiếp cho FotoBro:

1. **Dữ liệu chỉ nằm trên máy, không rời máy, thì Apple KHÔNG tính là "thu thập".** Job, thu/chi, cài đặt, ảnh trang chủ, logo, PIN — tất cả chỉ ở trong sandbox iOS trên iPhone người dùng, không có máy chủ FotoBro nào nhận được — nên không phải khai các loại đó. Đây là cơ sở cho phương án B, và cũng là lý do `APP-STORE-READY.md` §10 viết "dữ liệu job/tiền/cài đặt/ảnh trang chủ chỉ ở trên máy → Apple tính là không thu thập" — **câu này đúng, nhưng chỉ đúng cho lõi local**.
2. **Dữ liệu rời máy tới Google thì Apple tính là thu thập.** Khi người dùng bật Google, app ghi sự kiện buổi chụp lên Google Lịch (`calendar.events`) và gửi email cho khách qua Gmail API (`gmail.send`) — tên khách, giờ chụp, địa điểm, giá/cọc/còn thiếu rời máy và được Google lưu lại (trong Lịch / hộp thư Sent của chính người dùng) lâu hơn thời gian xử lý yêu cầu. Đó là "collect", và Google là bên thứ ba nhận dữ liệu.
3. **Miễn khai (optional disclosure) KHÔNG áp dụng được cho Google của FotoBro.** Apple chỉ miễn khai khi dữ liệu thỏa **đủ cả 4** điều kiện, trong đó có: "Collection of the data occurs only in infrequent cases that are not part of your app's primary functionality, and which are optional for the user" (chỉ thu thập trong các trường hợp hiếm, không thuộc chức năng chính, người dùng tự chọn) — và Apple nói rõ: **"For the purpose of clarity, data collected on an ongoing basis after an initial request for permission must be disclosed"** (dữ liệu thu thập liên tục sau một lần xin quyền ban đầu thì phải khai). Google của FotoBro là tính năng chính được quảng bá ("đăng nhập 1 chạm là có hết", `GOOGLE-SETUP.md` §0), xin quyền 1 lần rồi đọc/ghi liên tục sau đó — trượt cả hai điều kiện này. Vì vậy không được dựa vào miễn khai để giữ "Data Not Collected" khi Google vẫn bật.
4. **Mục đích vẫn phải khai dù chỉ phục vụ chức năng app.** Apple: "even if you collect the data for reasons other than analytics or advertising, it still needs to be declared" — thu thập chỉ để app chạy vẫn phải khai, ghi mục đích là **App Functionality**.
5. **"Linked to You" (gắn với người dùng):** dữ liệu gửi tới Google gắn với tài khoản Google của người dùng (địa chỉ email dùng đăng nhập) — tức là gắn với danh tính người dùng, nên khai là **Data Linked to You**, không phải "Data Not Linked to You".

## 2. Bản đồ dữ liệu thật của v1 (đã đối chiếu code)

Nguồn đối chiếu: `www/index.html` (~338 KB), `www/capacitor-bridge.js`, `www/fotobro-config.js`, `ios/App/App/Info.plist`, `PRIVACY.md`, `PRIVACY.html`, `GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md`, `SECURITY-AUDIT.md`, `APP-STORE-READY.md` §10, `APP-STORE-LISTING.md:99-100`.

### 2.1 Chỉ lưu trên máy — Apple không tính là "thu thập", không khai

| Dữ liệu | Lưu ở đâu (code thật) | Rời máy không? |
|---|---|---|
| Job chụp: tên khách, loại chụp, ngày giờ, địa điểm (chuỗi văn bản người dùng tự gõ), giá, cọc, tiến độ 8 bước, ghi chú, SĐT, email khách, link Facebook/Messenger/Drive | `localStorage` key `troLyXeo.v1` (`www/index.html:885-886, 903-909`) — JSON plaintext | Không (trừ khi người dùng tự gửi đi, xem §5, hoặc bật Google, xem §4) |
| Thu / chi: số tiền, loại, ngày, job liên quan | Cùng `troLyXeo.v1` | Không |
| Cài đặt: tên, studio, logo (dataURL JPEG ≤300.000 ký tự), màu chủ đề, bảng giá digital/film, % cọc, ngày trả ảnh, ngôn ngữ, tiền tệ, mẫu tin nhắn | Cùng `troLyXeo.v1` | Không |
| Ảnh trang chủ (tối đa 60, thu nhỏ ~1400px JPEG 0.85 qua `canvas.toBlob()` — **EXIF, kể cả GPS trong EXIF, bị lược bỏ khi lưu**) | IndexedDB `troLyXeoPhotos` (`www/index.html:3681-3700`) | Không |
| Khoá app: PIN băm SHA-256(salt 16 byte + ":" + PIN), passkey/Face ID | `localStorage` `troLyXeo.lock` (`www/index.html:3585-3606`); sinh trắc học do iOS xử lý, không rời máy | Không |
| File sao lưu JSON người dùng tự tải (`fotobro-sao-luu.json`, plaintext, không có ảnh) | Người dùng tự giữ trong Files / nơi họ chọn | Do người dùng tự mang đi — app không gửi |

- **Lưu ý lưu trữ (ghi đúng sự thật, khớp `PRIVACY.md` §1):** dữ liệu trên máy lưu dạng thường (plaintext) trong sandbox iOS, được bảo vệ bằng mật mã iPhone + sandbox — v1 chưa mã hoá riêng dữ liệu lúc lưu, mã hoá dự kiến v1.1. Khoá Face ID/PIN trong app chỉ ẩn giao diện khi mở lại.
- **Lưu ý sao lưu iCloud của Apple:** nếu người dùng bật iCloud Backup trên iPhone, iOS có thể sao lưu dữ liệu app lên iCloud của chính người dùng theo chế độ hệ thống — đó là sao lưu của Apple, không phải FotoBro gửi dữ liệu đi, và không do app điều khiển. Không khai thêm vì đây là hành vi của hệ điều hành, nhưng đừng viết "dữ liệu không bao giờ rời máy trong mọi trường hợp" — viết đúng là "app không gửi dữ liệu lên máy chủ nào".

### 2.2 Không thu thập, không có trong app — không khai

| Loại dữ liệu (Apple) | Bằng chứng code thật |
|---|---|
| **Vị trí — Precise / Coarse Location** | Không có: `grep geolocation` trong `www/index.html` = 0; `Info.plist` không có `NSLocation…UsageDescription` nào. Địa điểm job chỉ là **chuỗi văn bản người dùng tự gõ** ("ở …"), không phải vị trí GPS của máy. Chuỗi văn bản đó có đi kèm sự kiện ghi lên Google Lịch khi bật Google — nhưng Apple xếp đó vào nội dung sự kiện (Other User Content), không phải loại dữ liệu Location của thiết bị |
| **Âm thanh — Audio Data** | Không có: mic dời sang v1.1; `Info.plist` không có `NSMicrophoneUsageDescription`; không ghi âm, không lưu file ghi âm (`PRIVACY.md` §3) |
| **Danh bạ iOS — Contacts (trên máy)** | Không có: app không đọc danh bạ iPhone; chỉ đọc Danh bạ **Google** (People API) khi bật Google — xem §4 |
| **Định danh thiết bị — Device ID / IDFA** | Không có: không IDFA, không IDFV/UUID, không `identifierForAdvert` trong code; không có tài khoản FotoBro, không có User ID riêng của app |
| **Lịch sử duyệt web / tìm kiếm** | Không có trình duyệt trong app, không tìm kiếm web |
| **Sức khoẻ, Sensitive Info** | Không có dữ liệu sức khoẻ, tôn giáo, chính trị, sinh trắc học rời máy. Face ID/passkey chỉ dùng để mở khoá trên máy |
| **Lịch sử mua hàng — Purchase History** | Không có: IAP/StoreKit chưa bật, giá Nấc 2/3 vẫn là placeholder `TBD` (`CLOUDKIT-PLAN.md` §6) |
| **Usage Data / Diagnostics (Product Interaction, Crash Data, Performance Data)** | Không có: không analytics SDK, không crash-reporting SDK, không SDK quảng cáo (grep `analytics/crashlytics/sentry/firebase/admob/amplitude/mixpanel` trong `www/`, `package.json`, `Info.plist` = 0; `fetch(` trong code chỉ tới Google APIs + `oauth2.googleapis.com/revoke`). Báo cáo App Store / crash log do Apple thu qua hệ thống không phải do app khai |
| **Ảnh / video (Photos or Videos)** | Ảnh trang chủ + logo chỉ ở trên máy (§2.1). Scope Drive là `drive.metadata.readonly` — chỉ đọc **tên + link thư mục**, không đọc file ảnh, không upload ảnh nào. Không khai, trừ khi sau này có tính năng upload ảnh |

## 3. Chia sẻ cho bên thứ ba — tổng kết

| Bên thứ ba | Nhận dữ liệu gì, khi nào | Ghi chú |
|---|---|---|
| **Google (Google APIs)** — Calendar, Gmail, People, Drive | Chỉ khi người dùng bấm "Đăng nhập Google" và cho phép (mặc định TẮT). Chi tiết từng scope ở §4 | Bên thứ ba duy nhất nhận dữ liệu từ app ở v1. Không có máy chủ FotoBro, không gửi cho Facebook/Messenger/bất kỳ ai khác |
| **Apple (iCloud / CloudKit)** | **Chưa có gì ở v1** — container `iCloud.com.fotobro.app` chưa tạo, trạng thái `not-configured` (`fotobro-config.js`, `CLOUDKIT-PLAN.md` §9). Chỉ khi Nấc 2 bật sau này mới có dữ liệu lên iCloud của chính người dùng, đã mã hoá đầu cuối AES-256-GCM trước khi đẩy | Xem §6 — khai lại khi Nấc 2 bật |
| **Facebook / Messenger / Gmail app / Drive app (mở app ngoài)** | Không nhận dữ liệu từ app. Các nút chỉ là deep link mở app ngoài khi người dùng bấm; nội dung tin nhắn/email được soạn sẵn rồi người dùng tự xem lại và tự gửi (`SECURITY-AUDIT.md` M6) | Không tính là app chia sẻ dữ liệu |
| **Bên quảng cáo / data broker / SDK analytics** | Không có, không chia sẻ gì | Không cần prompt App Tracking Transparency (ATT) vì không tracking |

**"Data Used to Track You": KHÔNG CÓ.** Apple định nghĩa tracking là liên kết dữ liệu trong app với dữ liệu bên thứ ba để quảng cáo nhắm mục tiêu / đo lường quảng cáo, hoặc chia sẻ với data broker — FotoBro không làm việc nào trong số đó.

## 4. Khi người dùng bật Google — từng scope → từng loại dữ liệu phải khai

Code thật: `gScopes()` (`www/index.html:3207-3210`) xin đủ **6 scope trong 1 lần đăng nhập duy nhất**, không xin lẻ từng tính năng. Google **mặc định TẮT**; Client ID chung của FotoBro hiện vẫn để trống (`googleClientId: ''` trong `fotobro-config.js`) — xem §8.

| Scope (Google) | Dữ liệu rời máy / được app truy cập | Loại dữ liệu Apple phải khai (phương án A) | Gắn với người dùng? | Mục đích |
|---|---|---|---|---|
| `calendar.readonly` | Đọc sự kiện Lịch của người dùng về máy để hiện lịch chụp; bản sao sự kiện lưu local `troLyXeo.gcal` | **Other User Content** (nội dung lịch) — mức thận trọng: khai, vì app truy cập và lưu bản sao nội dung lịch của người dùng | Linked (gắn tài khoản Google) | App Functionality |
| `calendar.events` | **Ghi / sửa / xoá buổi chụp lên Google Lịch**: tiêu đề (loại chụp + tên khách), giờ chụp, địa điểm (chuỗi văn bản), ghi chú job (`www/index.html:1543` tạo event, `firstReminderMinutes:720`) | **Contact Info — Name** (tên khách trong tiêu đề sự kiện); **Other User Content** (nội dung + địa điểm sự kiện) | Linked | App Functionality |
| `gmail.readonly` (restricted) | Đọc mail báo tiền về + mail khách hỏi chụp về máy (nội dung thư tới 6.000 ký tự/thư, tối đa 800 ID đã xem), lưu local `troLyXeo.gmail` | **User Content — Emails or Text Messages** (tiêu đề, người gửi, nội dung email) | Linked | App Functionality |
| `gmail.send` | **Gửi email cho khách bằng Gmail**: email soạn theo mẫu có sẵn, kèm tên khách, giá/cọc/còn thiếu (`www/index.html:1528, 3570`; `gmail.googleapis.com/gmail/v1/users/me/messages/send`) | **User Content — Emails or Text Messages**; **Contact Info — Email Address** (địa chỉ email khách); **Financial Info — Other Financial Info** (giá/cọc/còn thiếu trong nội dung email) | Linked | App Functionality |
| `contacts.readonly` | Đọc Danh bạ Google (tên + email / SĐT) về máy để gợi ý khách, lưu local `troLyXeo.gcontacts` | **Contacts** (danh sách liên hệ); **Contact Info — Name, Email Address, Phone Number** (trong danh bạ đọc về) | Linked | App Functionality |
| `drive.metadata.readonly` (restricted) | Đọc tên + link thư mục Drive của job (chỉ metadata, không đọc file) | **Other User Content** (tên thư mục/file) — mức thận trọng | Linked | App Functionality |

Bổ sung, theo code thật:

- **Token Google:** access token chỉ giữ trong `sessionStorage` (`troLyXeo.gtoken`, hết hạn sau ~1 giờ), **không lưu refresh token** — `gExchangeCode()` cố tình bỏ qua `d.refresh_token` (`www/index.html:3010-3016`, đã sửa theo H2 của `SECURITY-AUDIT.md`). Hết hạn thì đăng nhập lại im lặng (`prompt=none`). Token là credential, không phải một loại dữ liệu trong bảng phân loại của Apple, nên không khai riêng — nhưng phải ghi đúng trong Privacy Policy (xem §8).
- **Dữ liệu Google đã tải về máy** (`troLyXeo.gcal` / `.gmail` / `.gcontacts` trong `localStorage`, plaintext) tồn tại cả sau khi access token hết hạn, cho tới khi người dùng bấm "Ngắt kết nối" hoặc "Xoá toàn bộ dữ liệu" — cả hai nút này nay đã xoá thật (xem §8).
- **SĐT khách:** SĐT chỉ rời máy tới Google trong 2 trường hợp — (a) nằm trong Danh bạ Google đọc về (đã có sẵn trên Google, app chỉ đọc), (b) người dùng tự gõ SĐT vào ghi chú job / nội dung email gửi đi. Bình thường app không gửi SĐT lên Google Lịch hay Gmail. Vì vậy Phone Number chỉ khai trong nhóm Contacts (danh bạ đọc về), không khai riêng cho job.
- **Nếu Việt bỏ `gmail.readonly` ở v1** (quyết định đang chờ — xem §9.2): hàng `gmail.readonly` trong bảng trên biến mất, nhưng **Emails or Text Messages vẫn phải khai** vì `gmail.send` vẫn gửi email qua Google. Bỏ scope đọc chỉ rút ngắn thời gian xác minh Google (4–10 tuần → 2–6 tuần, `GOOGLE-SETUP.md` §5c), không làm nhãn sạch hoàn toàn.
- **Nếu Việt cho chọn nhóm quyền trước khi đăng nhập** (H4 của `SECURITY-AUDIT.md`, quyết định đang chờ — xem §9.3): bảng khai vẫn giữ nguyên các loại trên (vì người dùng có thể bật đủ nhóm), nhưng câu chuyện xin phép trung thực hơn và giảm rủi ro bị Apple/Google hỏi lại.

## 5. Người dùng tự gửi dữ liệu đi (Share / mailto / file sao lưu) — không tính là app thu thập

- **Nút Share báo cáo cuối ngày** (`navigator.share` / Capacitor Share, `www/index.html:1991-1994`): chỉ có tổng thu/chi/lời + tổng tiền khách còn thiếu, không kèm chi tiết từng khách; người dùng bấm, tự chọn người nhận, tự gửi. Thỏa đủ tiêu chí miễn khai của Apple (người dùng tự cung cấp trong giao diện, rõ ràng dữ liệu nào được gửi, tự chọn gửi mỗi lần).
- **Email `mailto:` soạn sẵn cho khách**: người dùng xem lại trong app Mail rồi tự bấm gửi; app không tự gửi.
- **File sao lưu JSON** người dùng tự tải về máy: app không gửi đi đâu; người dùng tự giữ / tự chia sẻ file.
- Ba đường này không làm thay đổi bản khai ở §4 — nhưng đừng viết trong Privacy Policy rằng "dữ liệu không bao giờ rời máy", vì chính người dùng có thể mang dữ liệu ra khỏi máy bằng các nút này.

## 6. CloudKit Nấc 2 — chưa bật ở v1, chưa khai; khai lại khi bật

- Trạng thái thật: **chưa bật, chưa có container thật** (`iCloud.com.fotobro.app` chưa tạo, adapter trả `not-configured`, Sign in with Apple chưa code, IAP chưa bật — `CLOUDKIT-PLAN.md` §9). V1 không có dữ liệu nào rời máy qua CloudKit → **không khai gì cho CloudKit trong bản nộp v1**.
- Khi Nấc 2 bật (bản sau, có thu phí): dữ liệu đồng bộ là job / thu-chi / cài đặt / metadata ảnh (không ảnh gốc, không logo) lên **privateDB iCloud của chính người dùng**, trường nhạy cảm (tên khách, số tiền) mã hoá ở tầng app bằng AES-256-GCM + PBKDF2-SHA256-100k **trước khi đẩy** — Apple chỉ thấy ciphertext + salt/iv + số lượng (`CLOUDKIT-PLAN.md` §2–§3). Lúc đó phải khai lại trong App Store Connect (cập nhật đáp án không cần nộp bản app mới — Apple cho sửa đáp án bất cứ lúc nào): dự kiến khai các loại tương ứng §4 (Name, Other Financial Info, Other User Content) với mục đích App Functionality, Linked — và ghi rõ dữ liệu mã hoá đầu cuối trước khi lên iCloud, nhà phát triển không đọc được.
- Nấc 3 nhóm/studio (sharedDB, 4 vai trò) chỉ là thiết kế, chưa code — không khai, không nhắc trong nhãn v1.

## 7. Hướng dẫn điền trong App Store Connect (bản nháp để Việt/Muse điền)

### 7.1 Phương án A — v1 đầy đủ Google (khuyến nghị)

1. **Does your app collect data?** → Yes (vì Google bật được — xem §1.2).
2. **Data Used to Track You** → không chọn loại nào (không tracking).
3. **Data Linked to You** — chọn các loại sau, tất cả chỉ với mục đích **App Functionality**:
   - Contact Info — **Name**, **Email Address**, **Phone Number** (chỉ trong phạm vi Danh bạ Google đọc về + email gửi đi; ghi chú rõ trong phần giải thích, xem §7.3)
   - User Content — **Emails or Text Messages**, **Other User Content**
   - Contacts — **Contacts**
   - Financial Info — **Other Financial Info**
4. **Data Not Linked to You** → không chọn loại nào.
5. **Không khai:** Location (Precise/Coarse), Photos or Videos, Audio Data, User ID, Device ID, Usage Data (Product Interaction / Advertising Data / Other Usage Data), Diagnostics (Crash / Performance / Other), Purchase History, Browsing History, Search History, Health & Fitness, Sensitive Info.
6. **Privacy Policy URL (bắt buộc):** `https://hoangviet1397.github.io/fotobro/PRIVACY.html` — **chưa có URL thật** (chưa host — xem §8.3). Không điền URL repo `tro-ly-xeo` cũ.
7. **App Tracking Transparency:** không cần hiện prompt ATT (không tracking, không IDFA).

Nhãn hiển thị dự kiến (Apple tự sinh từ đáp án trên): mục "Data Linked to You" liệt kê Contact Info, User Content, Contacts, Financial Info — kèm dòng "The following data may be collected and linked to your identity" và mục đích App Functionality cho từng loại; mục "Data Used to Track You" không hiện.

### 7.2 Phương án B — "Data Not Collected" (chỉ khi tắt hẳn Google ở bản nộp)

1. **Does your app collect data?** → No.
2. Điều kiện bắt buộc: **Google không bật được trong bản nộp** (nút "Đăng nhập Google" tắt hẳn hoặc gỡ code Google khỏi bản nộp, không chỉ "mặc định TẮT" — vì chỉ cần tính năng còn đó và người dùng bật lên là dữ liệu rời máy ngay); CloudKit vẫn chưa bật; không thêm SDK nào.
3. Nếu sau này bật lại Google (v1.1), phải khai lại theo §7.1 **trước khi** bản có Google lên App Store — Apple cho sửa đáp án mà không cần nộp bản app mới, nhưng đáp án phải đúng trước khi bản đó phát hành.

### 7.3 Ghi chú giải thích kèm theo đáp án (điền vào ô ghi chú của Apple nếu có)

> "FotoBro stores all jobs, income/expenses, settings, home photos and app lock only on the user's device (iOS sandbox, no FotoBro server). No data leaves the device unless the user taps 'Sign in with Google' (off by default) and grants permission. When Google is enabled, the app reads/writes the user's own Google Calendar, Gmail, Contacts and Drive metadata via Google APIs on the device, using OAuth 2.0 PKCE; access tokens are kept only in the session on the device and no refresh token is stored. No location (GPS), no audio recording, no iOS contacts, no device identifier, no analytics, no advertising, no tracking. CloudKit sync is not enabled in v1."

## 8. Điểm lệch tài liệu/code phải xử lý trước khi nộp (ảnh hưởng trực tiếp tới nhãn)

Apple và Google đều đối chiếu Privacy Policy + nhãn khai với hành vi thật của app — lệch là bị hỏi lại / từ chối. Các điểm sau đã kiểm chứng bằng code thật ngày 20/11/2026:

| # | Vấn đề | Trạng thái thật (đã kiểm chứng) |
|---|---|---|
| 1 | **`APP-STORE-READY.md` §10 + `APP-STORE-LISTING.md:99-100` ghi khai "Data Not Collected"** — không kèm điều kiện Google | **Sai nếu nộp v1 có Google.** Chỉ đúng cho lõi local. Sửa hai file đó theo phương án Việt chốt (§7.1 hoặc §7.2) trước khi nộp. File này là bản sửa đúng để đối chiếu |
| 2 | `PRIVACY.md` §2 ghi Google "chỉ bật từng tính năng" / "mặc định TẮT" | **Sai với code v1:** code xin đủ 6 scope trong **1 lần** (`gScopes()`, `www/index.html:3207-3210`), không bật từng tính năng. `PRIVACY.html` §2 đã ghi đúng ("xin đủ các quyền sau trong 1 lần"). Đồng bộ `PRIVACY.md` = `PRIVACY.html` = code thật trước khi nộp |
| 3 | Privacy Policy URL chưa host | Repo `Hoangviet1397/fotobro` đã tạo (19/11/2026) nhưng **chưa push code, chưa bật GitHub Pages** — URL `https://hoangviet1397.github.io/fotobro/PRIVACY.html` hiện chưa mở được. Phải host xong mới tạo app trong App Store Connect và mới nộp xác minh Google (`GOOGLE-SETUP.md` §2a; `APP-STORE-READY.md` §7). Trong lúc chờ, `PRIVACY.md` vẫn ghi đúng repo `fotobro` (không còn trỏ `tro-ly-xeo` như `GOOGLE-SETUP.md` §2a từng ghi — đã sửa) |
| 4 | Refresh token + "Ngắt kết nối" + "Xoá toàn bộ" — các rủi ro H2/H3/H5 trong `SECURITY-AUDIT.md` | **Đã sửa trong code, audit đã cũ ở 3 điểm này:** (a) H2 — `gExchangeCode()` nay **không lưu refresh token** (`www/index.html:3010-3016`, comment H2), access token chỉ trong `sessionStorage`, nên câu "v1 KHÔNG lưu refresh token" trong `PRIVACY.md`/`PRIVACY.html` nay là **đúng**; (b) H3 — nút "Ngắt kết nối" nay revoke **cả access token lẫn refresh token** (nếu còn bản cũ) rồi mới xoá ở máy, revoke lỗi thì báo đường thu hồi thủ công (`www/index.html:2455-2466`, comment H3); (c) H5 — đã có hàm `wipeAll()` duy nhất: revoke token, xoá IndexedDB ảnh, xoá toàn bộ key (job/txs, khoá, token, dữ liệu Google đã tải, logo, `heroPin`), reset cài đặt về mặc định rồi tải lại trắng (`www/index.html:2249-2268`, comment H5). **Chưa kiểm chứng trên iPhone thật** (chưa có TestFlight): wipe có xoá sạch IndexedDB sau khi gỡ/cài lại không, revoke có thành công khi mất mạng không (trong `wipeAll()` lệnh revoke là fire-and-forget, không chờ kết quả) |
| 5 | Nhắc lịch: `PRIVACY.md` §4 + `PRIVACY.html` §5 ghi nhắc trước giờ chụp **12 tiếng** | **Lệch code:** local notification nhắc trước **60 phút** (`www/capacitor-bridge.js:98`); chỉ sự kiện ghi lên Google Lịch / Lịch iPhone mới có nhắc 720 phút = 12 tiếng (`www/index.html:1543`). `APP-STORE-READY.md` §10 ghi 60 phút. Không đổi nhãn (thông báo không phải loại dữ liệu khai), nhưng phải thống nhất con số trong Privacy Policy trước khi nộp — và giữ câu "thông báo hiện tên khách + giờ chụp trên màn hình khoá, tắt được trong Cài đặt iPhone → Thông báo → FotoBro" |
| 6 | `Info.plist` thiếu `NSFaceIDUsageDescription` | Grep `Info.plist` = không có. Chưa rõ có cần không: khoá app dùng passkey (WebAuthn, `rp.id = location.hostname`) chứ không gọi API Face ID trực tiếp — nhưng nếu bản native dùng LocalAuthentication thì Apple sẽ yêu cầu mô tả này. **Kiểm tra trước build cuối**; không ảnh hưởng nhãn (sinh trắc học không rời máy, không khai) |
| 7 | `Info.plist` còn scheme placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID` | Phải thay bằng reversed client ID thật sau khi tạo Client iOS trên Google Cloud, nếu không đăng nhập Google lỗi `redirect_uri_mismatch` (`GOOGLE-SETUP.md` §2c; `SECURITY-AUDIT.md` L1). Không ảnh hưởng nhãn, nhưng Google không chạy được thì phương án A cũng vô nghĩa |

## 9. Cần Việt chốt (quyết định ảnh hưởng trực tiếp tới bản khai này)

| # | Cần Việt quyết | Ảnh hưởng tới nhãn | Gợi ý |
|---|---|---|---|
| 1 | **Khai phương án A (khai đủ Google) hay phương án B ("Data Not Collected" + tắt Google ở v1)?** | Quyết định toàn bộ bản khai §7 | **Khuyến nghị A** — trung thực với tính năng đã làm; nhãn có vài dòng "Data Linked to You" nhưng mục đích chỉ là App Functionality, không tracking, không quảng cáo — người dùng hiểu được. Chọn B thì phải tắt Google thật ở bản nộp, mất tính năng headline của v1 |
| 2 | **Giữ hay bỏ scope `gmail.readonly` ở v1?** | Bỏ thì hàng `gmail.readonly` trong §4 biến mất, nhưng **Emails vẫn phải khai** vì `gmail.send` còn đó. Đổi thời gian xác minh Google: giữ đủ 6 scope = 4–10 tuần; bỏ `gmail.readonly` = 2–6 tuần (`GOOGLE-SETUP.md` §5c) | Chưa có gợi ý cứng — phụ thuộc Việt có cần tính năng "đọc Gmail gợi ý ghi sổ" ngay ở v1 không |
| 3 | **Cho chọn nhóm quyền Google trước khi đăng nhập (Lịch / Gmail / Drive) hay giữ auto 1 chạm xin đủ 6 scope?** | Bảng khai §4 giữ nguyên (người dùng vẫn có thể bật đủ nhóm), nhưng câu chuyện xin phép trung thực hơn, giảm nguy cơ Apple/Google hỏi lại (H4 của `SECURITY-AUDIT.md`) | Nên làm chọn nhóm ở v1 nếu kịp — đây là điểm Apple/Google soi kỹ nhất vì có 2 scope restricted |
| 4 | **Mua domain `fotobro.app` + tạo `support@fotobro.app`?** | Không đổi bảng khai, nhưng Privacy Policy URL + màn hình xin quyền Google đều cần email hỗ trợ thật; tạm dùng Gmail cá nhân của Việt thì email đó **hiện công khai** trên màn hình xin quyền cho mọi người dùng thấy (`GOOGLE-SETUP.md` §2a) | Mua `fotobro.app` rồi dùng iCloud+ Custom Domain làm `support@fotobro.app` (đề xuất trong `GOOGLE-SETUP.md`/`EMAIL-SETUP.md`); `fotobro.com` đã có chủ từ 2008 |
| 5 | **Thống nhất thời gian nhắc lịch: 60 phút hay 12 tiếng?** | Không đổi nhãn; đổi câu chữ trong Privacy Policy + mô tả app (§8.5) | Quyết theo hành vi code muốn giữ, rồi sửa tài liệu cho khớp — đừng để 3 con số khác nhau ở 3 file |

## 10. Chưa kiểm chứng trên iPhone thật (đọc trước khi tin bản khai này)

- **Chưa có gì trong file này được kiểm chứng trên iPhone thật.** Chưa có TestFlight, chưa có bản build, chưa có App ID `com.fotobro.app` trên Apple Developer, chưa có container CloudKit, chưa có Client ID Google thật, chưa nộp xác minh Google. Mọi kết luận đều từ **đọc code tĩnh + tài liệu** ngày 20/11/2026.
- Chưa kiểm được: luồng OAuth PKCE qua trình duyệt hệ thống + deep-link có về lại app không (code hiện mở bằng `@capacitor/browser`, fallback `location.href` — `GOOGLE-SETUP.md` §4 ghi Google có thể chặn `disallowed_useragent` trong WKWebView); passkey/Face ID với RP ID `capacitor://localhost` có tạo/mở được không; `wipeAll()` có xoá sạch IndexedDB sau khi gỡ app không; App Privacy Report trên iPhone thật có hiện domain lạ nào ngoài `*.googleapis.com` / `accounts.google.com` không.
- **Sau khi có bản TestFlight:** bật App Privacy Report (Cài đặt → Quyền riêng tư & Bảo mật → Báo cáo riêng tư của ứng dụng), chạy đủ tính năng (thêm job, bật Google, gửi 1 email, ghi 1 sự kiện lên Lịch), đối chiếu domain mạng thực tế với §2–§4 rồi mới chốt bản khai gửi Apple. Nếu phát hiện domain/SDK lạ, cập nhật file này + khai lại.
- **Khi có thay đổi:** cập nhật đáp án App Privacy trong App Store Connect ngay khi tính năng đổi (Apple cho sửa đáp án bất cứ lúc nào, không cần nộp bản app mới) — đặc biệt khi: bật CloudKit Nấc 2, thêm/bớt scope Google, thêm mic v1.1 (khi đó khai thêm **Audio Data**), thêm IAP (khi đó khai thêm **Purchase History**).

## 11. Nguồn đã đọc thật để lập bản khai này

- Code: `www/index.html` (toàn bộ luồng Google `gConnect`/`gExchangeCode`/`gScopes`, `cleanData` dòng 885-886, `wipeAll()` dòng 2249-2268, nút "Ngắt kết nối" dòng 2455-2466, `saveLocal`, CSP dòng 8), `www/capacitor-bridge.js` (Camera, LocalNotifications nhắc 60 phút, deep-link OAuth), `www/fotobro-config.js` (`googleClientId: ''`, container `iCloud.com.fotobro.app` not-configured, `supportEmail: ''`), `capacitor.config.ts`, `ios/App/App/Info.plist` (quyền: Calendars, Camera, PhotoLibrary — không Location, không Microphone, không Contacts iOS, không Face ID description).
- Tài liệu: `PRIVACY.md`, `PRIVACY.html` (đồng bộ 20/11/2026), `GOOGLE-SETUP.md` (6 scope, phân mức sensitive/restricted, thời gian xác minh, CASA không cần vì không có server), `CLOUDKIT-PLAN.md` (Nấc 2 thiết kế only, mã hoá AES-256-GCM + PBKDF2-SHA256-100k, không ảnh gốc lên CloudKit), `SECURITY-AUDIT.md` (H1–H5, M1–M6, L1–L4 — lưu ý: H2/H3/H5 đã được sửa trong code sau khi audit viết, xem §8.4), `APP-STORE-READY.md` §10 + `APP-STORE-LISTING.md:99-100` (khai "Data Not Collected" — xem §8.1), `batch-legal/SDK-INVENTORY.md` (không analytics/quảng cáo/crash SDK, Google chỉ gọi qua `fetch()` REST, không SDK).
- Định nghĩa của Apple: "App Privacy Details" — https://developer.apple.com/app-store/app-privacy-details/ (định nghĩa "Collect", tiêu chí miễn khai, các loại dữ liệu, mục đích sử dụng, "Linked to You", "Tracking"), đọc ngày 20/11/2026.

---

## Báo cáo 7 mục

1. **Mục tiêu:** Viết 1 file mới duy nhất `~/workspace/fotobro-ios-v1/batch-legal/PRIVACY-LABELS.md` — nhãn riêng tư App Store (App Privacy) cho FotoBro iOS v1: liệt kê từng loại dữ liệu thu thập, dùng để làm gì, có chia sẻ cho bên thứ ba không, dữ liệu nào chỉ lưu local, dữ liệu nào đi tới Google APIs khi người dùng bật Google; ghi rõ phần nào là thiết kế/chưa kiểm chứng trên iPhone thật và phần nào cần Việt chốt (ví dụ giữ hay bỏ scope `gmail.readonly`). Không sửa file nào khác, không tạo tài khoản, không push GitHub.
2. **Đã thực hiện:** Đọc kỹ các file thật trong `~/workspace/fotobro-ios-v1/`: `PRIVACY.md`, `PRIVACY.html`, `GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md`, `SECURITY-AUDIT.md`, `www/fotobro-config.js`, `capacitor.config.ts`, `ios/App/App/Info.plist`, `APP-STORE-READY.md` §10, `APP-STORE-LISTING.md`, `batch-legal/SDK-INVENTORY.md`; grep kiểm chứng trong `www/index.html` + `www/capacitor-bridge.js` (geolocation = 0, analytics/tracker SDK = 0, IDFA/UUID = 0, `fetch(` chỉ tới Google APIs, 6 scope trong `gScopes()`, `wipeAll()`, revoke 2 token khi ngắt kết nối, không lưu refresh token). Tra cứu định nghĩa chính thức của Apple tại https://developer.apple.com/app-store/app-privacy-details/ (định nghĩa "Collect", tiêu chí miễn khai). Chỉ viết 1 file mới `batch-legal/PRIVACY-LABELS.md`; không sửa file nào khác.
3. **Kết quả kiểm tra:** (a) Lõi local-first (job, thu/chi, cài đặt, ảnh trang chủ, logo, PIN) chỉ ở trên máy, Apple không tính là "thu thập" → không khai. (b) **Không** thu thập: vị trí GPS, mic/ghi âm, danh bạ iOS, ID thiết bị/IDFA, usage/diagnostics, quảng cáo, tracking — đều có bằng chứng code (không quyền, không SDK, không API). (c) Khi bật Google (mặc định TẮT, xin đủ 6 scope 1 lần), dữ liệu rời máy tới Google: tên/email khách trong sự kiện Lịch + email gửi đi, nội dung Gmail đọc/gửi, Danh bạ Google, tên thư mục Drive, giá/cọc trong email gửi khách — phải khai là **Data Linked to You, mục đích App Functionality**, không tracking. (d) CloudKit Nấc 2 chưa bật (not-configured, chưa có container) → không khai ở v1. (e) Phát hiện sai lệch lớn nhất: `APP-STORE-READY.md` §10 + `APP-STORE-LISTING.md` ghi khai "Data Not Collected" nguyên xi — chỉ đúng cho lõi local, **sai nếu nộp v1 có Google**, vì Google là tính năng chính, thu thập liên tục sau 1 lần cho phép nên không đủ điều kiện miễn khai theo đúng chữ của Apple. (f) Phát hiện mới: 3 rủi ro H2/H3/H5 trong `SECURITY-AUDIT.md` **đã được sửa trong code** (không lưu refresh token; ngắt kết nối revoke cả 2 token; có `wipeAll()` xoá thật gồm IndexedDB ảnh) — audit đã cũ ở 3 điểm này, `PRIVACY.md` nay nói đúng về refresh token; ngược lại `PRIVACY.md` vẫn sai câu "chỉ bật từng tính năng" (code là auto 1 chạm đủ 6 scope), và còn lệch nhắc lịch 60 phút (code) vs 12 tiếng (Privacy Policy).
4. **Vấn đề còn tồn tại:** Chưa có gì kiểm chứng trên iPhone thật (chưa TestFlight, chưa App ID, chưa Client ID Google, chưa container CloudKit, chưa host Privacy Policy URL). Privacy Policy URL đề xuất chưa mở được (repo `fotobro` chưa push code, chưa bật Pages). `support@fotobro.app` chưa có (domain `fotobro.app` chưa xác minh trống). `Info.plist` thiếu `NSFaceIDUsageDescription` (chưa rõ có cần không vì khoá dùng passkey) và còn scheme placeholder `CHUA-CO-CLIENT-ID`. `wipeAll()` revoke token kiểu fire-and-forget, chưa kiểm chứng khi mất mạng.
5. **Điều kiện chuyển bước:** Việt chốt 5 quyết định ở §9 — trước hết là phương án khai A hay B, và giữ hay bỏ `gmail.readonly` (ảnh hưởng thời gian xác minh Google 4–10 tuần vs 2–6 tuần). Sau đó: sửa `APP-STORE-READY.md` §10 + `APP-STORE-LISTING.md` theo phương án đã chốt; đồng bộ `PRIVACY.md` = `PRIVACY.html` = code thật (câu "từng tính năng", con số nhắc lịch); host Privacy Policy URL; tạo Client ID Google thật + thay scheme trong `Info.plist`. Chỉ khi xong các bước này mới điền questionnaire trong App Store Connect.
6. **Bước tiếp theo:** Parent agent trình 5 quyết định §9 cho Việt chốt (đặc biệt phương án A/B và `gmail.readonly`); sau khi Việt chốt, agent chính sửa 2 file listing + `PRIVACY.md` theo §8, rồi mới host Privacy Policy và điền App Store Connect theo §7. Khi có bản TestFlight, chạy App Privacy Report trên iPhone thật để đối chiếu domain mạng với §2–§4 rồi chốt bản khai cuối.
7. **Trạng thái:** Hoàn thành file nháp `batch-legal/PRIVACY-LABELS.md`. Đây là bản nháp để khai, **chưa phải bản đã khai** trong App Store Connect (chưa có app nào trong đó), chưa kiểm chứng trên iPhone thật, và còn chờ 5 quyết định của Việt ở §9.
