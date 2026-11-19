# Thiết kế Analytics tôn trọng riêng tư — FotoBro iOS v1

> **Phạm vi:** FotoBro iOS v1 — Bundle ID `com.fotobro.app`
> **Ngày soạn:** 20/11/2026
> **Trạng thái: CHỈ LÀ THIẾT KẾ — chưa code, chưa bật, chưa thu thập gì.**
> **Nguyên tắc nền:** app local-first, không máy chủ, không tracking, không quảng cáo
> (`PRIVACY.md` §Tóm tắt; `SDK-INVENTORY.md` §1 — đã kiểm chứng bằng grep: không có
> analytics / Firebase / AdMob / Crashlytics / Sentry / Amplitude / Mixpanel trong app).
> File này không tạo tài khoản, không push GitHub, không sửa code, không thêm SDK.

---

## 0. Kết luận chốt trước khi đọc tiếp

| Quyết định | Nội dung |
|---|---|
| v1 có analytics không | **KHÔNG.** Ở v1, app không đếm, không gửi, không thu thập bất cứ số liệu dùng app nào — kể cả số liệu ẩn danh. `PRIVACY.md` đã cam kết "không tracking, không analytics" và cam kết đó vẫn đúng cho tới khi tài liệu này được Việt chốt và code thật được viết theo đúng thiết kế dưới đây. |
| Thiết kế này cho phép cái gì | **Chỉ một dạng duy nhất:** bộ đếm ẩn danh **trên máy**, **mặc định TẮT**, người dùng tự bật trong Cài đặt mới đếm. Không SDK bên thứ ba, không máy chủ, không tài khoản, không định danh. |
| Dữ liệu đếm có rời khỏi máy không | **Không — ở v1 và ở thiết kế này.** Không có server FotoBro nên không có nơi nào để gửi. Mục §6 mô tả *điều kiện* nếu sau này mới có server — đó là thiết kế cho tương lai, **chưa có hiệu lực**, chưa có endpoint, chưa có URL nào. |
| Ai nhìn thấy số liệu | **Chỉ chính người dùng đó**, trên máy của họ (màn hình "Thống kê của tôi", xem §5). Nhà phát triển **không nhìn thấy gì** trừ khi người dùng tự xuất file và tự gửi (xem §5.3) — giống cơ chế xuất nhật ký lỗi trong `ERROR-LOGGING.md` §6.3. |
| Cần gì trước khi code | Việt chốt thiết kế này **riêng**; sau đó cập nhật `PRIVACY.md` + `PRIVACY.html` + `SDK-INVENTORY.md` + `GDPR-NOTES.md` + câu trả lời App Privacy trong App Store Connect cho khớp với hành vi thật — rồi mới viết code. Không được code trước, sửa giấy tờ sau. |

**Vì sao cần file này dù v1 không có analytics:** để khi có người đề nghị "thêm analytics cho biết người dùng dùng tính năng nào", cả nhóm có sẵn một đáp án đã chốt — đếm local, opt-in, không SDK — thay vì tiện tay gắn Firebase Analytics hay một SDK tương tự rồi phá vỡ cam kết riêng tư của app. Mọi đề xuất analytics khác (SDK bên thứ ba, tracking quảng cáo, fingerprint, A/B test theo người dùng) đều **bị từ chối mặc định** theo thiết kế này.

---

## 1. Nguyên tắc (5 nguyên tắc, không có ngoại lệ)

### 1.1. Không tracking — không theo dõi người dùng qua app, qua thời gian, hay qua dịch vụ khác

- Không gắn định danh cho người dùng hay cho máy: **không** IDFA, IDFV, serial, UDID,
  địa chỉ MAC, hash email/số điện thoại, fingerprint thiết bị/trình duyệt, cookie
  theo dõi, hay bất cứ "mã ẩn danh nhưng ổn định theo máy" nào.
- Không ghi nhật ký hành trình của một người dùng: các bộ đếm là **số tổng theo ngày**
  (xem §3), không có chuỗi sự kiện gắn với nhau thành một phiên (session) hay một
  người. Hai lần mở app trong cùng một ngày chỉ làm con số tăng lên — không ai biết
  đó là cùng một người mở hai lần hay hai người khác nhau, và thiết kế này **cố tình
  không cho biết**.
- Không theo dõi chéo: số liệu đếm không được nối với tài khoản Google, Apple ID,
  tài khoản CloudKit (Nấc 2), hay bất cứ tài khoản nào khác. Bật Google hay bật
  CloudKit không làm analytics tự bật, và ngược lại.

### 1.2. Không quảng cáo — số liệu không phục vụ quảng cáo, không bán, không chia sẻ cho bên thứ ba

- Không quảng cáo trong app, không SDK quảng cáo, không chia sẻ số liệu cho mạng
  quảng cáo, nhà môi giới dữ liệu, hay bất cứ bên thứ ba nào vì mục đích tiếp thị.
- Số liệu chỉ dùng cho **một mục đích duy nhất**: biết tính năng nào được dùng nhiều /
  ít để quyết định cải tiến app (ví dụ: có nên đầu tư thêm vào Máy tính giá hay vào
  Mẫu tin nhắn). Không dùng để chấm điểm người dùng, phân loại người dùng, định giá,
  hay ra quyết định tự động nào về người dùng (không profiling — xem `GDPR-NOTES.md` §2,
  Điều 22 GDPR).

### 1.3. Không gửi dữ liệu ra khỏi máy khi chưa đồng ý — và ở thiết kế này là không gửi đi đâu cả

- Mặc định **TẮT**: khi chưa bật, app không đếm gì hết — không phải "đếm rồi giữ local",
  mà là **không ghi lại gì**.
- Khi người dùng bật, số liệu **vẫn chỉ nằm trên máy** (xem §4). Không có đường gửi
  ngầm, không gửi nền, không gửi kèm email hỗ trợ, không gửi kèm file sao lưu JSON,
  không đồng bộ qua CloudKit (Nấc 2).
- Bất cứ hình thức gửi nào trong tương lai cũng phải xin đồng ý **mới, riêng, rõ ràng**
  (không gộp chung vào nút bật đếm local), và phải đáp ứng đủ điều kiện ở §6. Cho tới
  lúc đó, câu trả lời cho "số liệu gửi về đâu?" là: **không gửi về đâu**.

### 1.4. Tối thiểu hoá — chỉ đếm cái cần để quyết định, đếm càng ít càng tốt

- Chỉ đếm **sự kiện đã liệt kê sẵn** trong bảng allowlist ở §3.1. Ngoài bảng đó, không
  đếm gì thêm — kể cả khi "đếm thêm một trường nữa cũng tiện".
- Chỉ đếm **số lần**, không đếm nội dung: đếm "đã mở màn Sổ tiền" chứ không đếm "đã xem
  job nào, số tiền bao nhiêu". Mọi trường chứa dữ liệu nghiệp vụ đều bị cấm (xem §3.2).
- Gộp theo ngày, không ghi từng lần: một ngày chỉ lưu một con số cho mỗi loại sự kiện
  (xem §4.2). Không lưu giờ-phút-giây của từng lần dùng, không lưu thứ tự thao tác.

### 1.5. Người dùng làm chủ hoàn toàn — bật/tắt/xem/xoá lúc nào cũng được, không bị giữ lại

- Bật/tắt chỉ bằng **một nút gạt trong Cài đặt** (§5.1), không cần email, không cần
  tài khoản, không cần liên hệ hỗ trợ.
- Tắt là **dừng đếm ngay lập tức**; xoá là **xoá thật, không hoàn tác** (§5.2).
- Người dùng xem được **toàn bộ** số liệu đã đếm về mình (§5.3) — không có số liệu ẩn
  mà người dùng không xem được.
- Không có "bẫy" giữ người dùng ở lại: không hiện popup nài nỉ khi tắt, không giảm
  tính năng khi tắt analytics, không nhắc bật lại quá 1 lần (xem §5.1).

---

## 2. Opt-in — mặc định TẮT, người dùng bật trong Cài đặt mới đếm

### 2.1. Trạng thái mặc định

| Thời điểm | Trạng thái đếm |
|---|---|
| Mới cài app (v1) | **TẮT** — không đếm gì |
| Cập nhật app từ bản cũ | **TẮT** — cập nhật không tự bật, dù bản cũ có nút này hay không |
| Khôi phục từ file sao lưu JSON | **TẮT** — file sao lưu v1 không chứa số liệu đếm (xem §4.4), khôi phục xong vẫn TẮT |
| Đổi máy / gỡ app rồi cài lại | **TẮT** — số liệu cũ đã mất theo app (xem §4.4) |
| Bật Google / bật CloudKit (Nấc 2) | **Không ảnh hưởng** — analytics vẫn TẮT cho tới khi người dùng bật riêng nó |

**Không có màn hình xin bật analytics lúc mở app lần đầu.** Lý do: người dùng mở
app để làm job chụp, không phải để trả lời câu hỏi về dữ liệu. Việc xin bật chỉ nằm
yên trong Cài đặt, ai quan tâm thì tự tìm tới. Không hiện banner, không hiện popup,
không hiện huy hiệu (badge) nhắc bật.

### 2.2. Cách bật — trong Cài đặt

- Vị trí: **Cài đặt → Riêng tư → "Chia sẻ số liệu dùng ẩn danh"** (1 nút gạt).
- Ngay dưới nút gạt phải hiện đủ 3 câu, bằng ngôn ngữ app đang dùng (Việt/Anh):
  1. "Chỉ đếm trên máy này: số lần mở app và tính năng nào được dùng."
  2. "Không thu tên khách, số tiền, nội dung job hay ảnh. Không gửi đi đâu."
  3. "Tắt bất cứ lúc nào; xoá số liệu đã đếm trong cùng màn hình này."
- Khi người dùng gạt BẬT: hiện **1 hộp xác nhận duy nhất** nhắc lại đúng 3 câu trên,
  với 2 nút "Bật đếm trên máy" / "Để sau". Không có bước xác nhận thứ hai, không xin
  thêm quyền iOS nào (không cần quyền hệ thống — đếm local không dùng API riêng tư nào
  của iOS).
- **Chỉ đếm từ lúc bật trở đi.** Không đếm bù quá khứ: app không có dữ liệu dùng app
  trước lúc bật (vì trước đó không đếm), và không được suy ra quá khứ từ dữ liệu khác
  (ví dụ: không được đếm số job đã tạo trước đó rồi ghi vào số liệu "đã dùng tính năng
  tạo job"). Ngày bắt đầu đếm (`since`) được lưu cùng số liệu để ai đọc cũng biết
  con số chỉ tính từ ngày đó.

### 2.3. Ghi chú pháp lý của việc opt-in

- Cơ sở pháp lý nếu áp dụng GDPR: **đồng ý** — Điều 6(1)(a) (xem `GDPR-NOTES.md` §2).
  Không dùng lợi ích hợp pháp (Điều 6(1)(f)) làm cơ sở cho analytics, vì app không xử
  lý dữ liệu cho mục đích riêng của nhà phát triển ở v1. Nếu sau này thêm gửi số liệu
  về server (§6), phải đánh giá lại cơ sở pháp lý và cập nhật `GDPR-NOTES.md`.
- Việc bật/tắt là **rút đồng ý** theo Điều 7(3) GDPR: rút lúc nào cũng được, rút xong
  không ảnh hưởng tính hợp pháp của việc đếm trước đó (khi còn đồng ý), và không làm
  mất tính năng nào của app.
- Trẻ em: app dành cho người lớn (chủ studio), không hướng tới trẻ dưới 13 tuổi
  (`PRIVACY.md` §5) — analytics không thay đổi điều này, và không được dùng để thu
  thập dữ liệu trẻ em.

---

## 3. Chỉ đếm gì — và KHÔNG đếm gì

### 3.1. Bảng allowlist — chỉ những sự kiện này mới được đếm

Mỗi sự kiện chỉ lưu **tên sự kiện + ngày + số lần trong ngày đó**. Không lưu giờ,
không lưu thứ tự, không lưu kèm dữ liệu nào khác.

| # | Sự kiện (tên kỹ thuật gợi ý) | Nghĩa | Vì sao cần đếm |
|---|---|---|---|
| 1 | `app_open` | App được mở lên (mỗi lần mở tính 1) | Biết app được dùng thường xuyên tới mức nào; ngày nào không mở thì không có số |
| 2 | `feature_home` | Mở màn hình Hôm nay | Màn chính có được dùng như thiết kế không |
| 3 | `feature_pipeline` | Mở pipeline job / mở chi tiết job | Job pipeline có phải tính năng lõi thật không |
| 4 | `feature_job_create` | Tạo một job mới (chỉ đếm "đã tạo 1 job") | Biết nhịp tạo job, không biết job gì |
| 5 | `feature_money` | Mở Sổ tiền / Báo cáo | Sổ tiền có được dùng không |
| 6 | `feature_reminder` | Mở mục nhắc lịch / xem nhắc | Nhắc lịch có được quan tâm không |
| 7 | `feature_templates` | Mở Mẫu tin nhắn / dùng 1 mẫu (chỉ đếm "đã dùng 1 mẫu") | Mẫu tin có ích không |
| 8 | `feature_pricing` | Mở Máy tính giá | Máy tính giá có được dùng không |
| 9 | `feature_calendar_import` | Bấm nhập từ Lịch iPhone (chỉ đếm "đã bấm", kể cả thành công hay thất bại) | Nhập lịch native có được dùng không |
| 10 | `feature_google` | Bấm Đăng nhập Google / dùng 1 tính năng Google (chỉ đếm "đã dùng", không đếm xem lịch hay mail gì) | Google có được dùng không — để quyết có giữ 6 scope hay tách scope (xem `GDPR-NOTES.md` H4) |
| 11 | `feature_backup` | Xuất file sao lưu JSON / khôi phục từ file (chỉ đếm "đã xuất 1 lần" / "đã khôi phục 1 lần") | Người dùng có sao lưu không |
| 12 | `feature_lock` | Bật/tắt khoá app (chỉ đếm "đã đổi trạng thái khoá") | Khoá app có được dùng không |
| 13 | `feature_settings` | Mở Cài đặt | Mức độ người dùng tự chỉnh app |
| 14 | `crash_count` | App tự thoát / lỗi nghiêm trọng — **chỉ đếm số lần**, lấy từ nhật ký lỗi local (xem §3.3) | Biết app có ổn định không, không cần biết người dùng là ai |

**Quy tắc thêm sự kiện mới:** thêm 1 sự kiện = thêm 1 dòng vào bảng này + ghi lý do
"cần đếm để quyết định gì". Không thêm sự kiện chỉ vì "đếm cho biết". Sự kiện nào
không còn dùng để quyết định nữa thì **bỏ khỏi bảng** ở lần cập nhật tài liệu sau.

**Không đếm:** thời gian dùng app (số phút), số lần chạm màn hình, vị trí cuộn trang,
thao tác gõ phím, nội dung tìm kiếm trong app, hay bất cứ "hành vi vi mô" nào khác.
Những thứ đó là theo dõi hành vi, không phải đếm tính năng.

### 3.2. Danh sách cấm tuyệt đối — KHÔNG bao giờ đếm, ghi, hay suy ra

| Loại dữ liệu | Ví dụ | Vì sao cấm |
|---|---|---|
| Tên khách, SĐT, email, địa chỉ khách | Tên, số điện thoại, email, địa điểm chụp | Thông tin cá nhân của khách hàng — người dùng là controller dữ liệu này (`GDPR-NOTES.md` §6), app không được biến nó thành số liệu |
| Số tiền | Giá job, tiền cọc, tiền còn thiếu, doanh thu, chi phí | Dữ liệu tài chính — không bao giờ xuất hiện trong số liệu đếm, kể cả dạng tổng hay trung bình |
| Nội dung job / ghi chú / mẫu tin đã điền | Ghi chú job, nội dung tin nhắn soạn cho khách, tiêu đề sự kiện lịch | Có thể chứa thông tin riêng tư của khách và của người dùng |
| Ảnh | Ảnh trang chủ, ảnh khách, link thư mục Drive | Không bao giờ đếm nội dung hay số lượng ảnh có tên người |
| Tài khoản / token / khoá | Tài khoản Google, Apple ID, access token, PIN khoá app | Lộ token = mất tài khoản; số liệu đếm không bao giờ chứa credential dưới bất kỳ dạng nào |
| Danh bạ / lịch / email đã tải từ Google | Tên + email/SĐT trong danh bạ, nội dung email, sự kiện lịch | Dữ liệu Google chỉ được xử lý trên máy cho tính năng của nó (`PRIVACY.md` §2), không được đếm hay tổng hợp |
| Định danh thiết bị / người dùng | IDFV, IDFA, serial, UDID, địa chỉ IP, vị trí GPS | Không cần để đếm tính năng; thu thập là tracking (vi phạm §1.1) |
| Nội dung phản hồi API / log lỗi đầy đủ | Body trả về từ Google, stack trace đầy đủ | Thường chứa email, token, hoặc dữ liệu người dùng lẫn trong đó — crash chỉ đếm số lần (§3.3), không copy nội dung log |

**Nguyên tắc kiểm tra:** nếu một con số đếm có thể trả lời câu hỏi "người dùng này
là ai / khách của họ là ai / họ kiếm bao nhiêu tiền" thì con số đó **không được
tồn tại**. Bộ đếm chỉ được trả lời "tính năng X được dùng bao nhiêu lần trong ngày Y".

### 3.3. Crash — đếm thế nào mà không cần SDK

Crash **không** dùng SDK bên thứ ba (không Crashlytics, không Sentry — xem
`CRASH-REPORTING.md` §1 và `SDK-INVENTORY.md` §1). Thiết kế này đếm crash bằng 2
nguồn đã có, cả hai đều không gửi dữ liệu tự động:

1. **Nhật ký lỗi local** (`ERROR-LOGGING.md`): app đã có store IndexedDB
   `fotobroErrorLogs` (tối đa 200 entry, 30 ngày, đã tẩy tên khách/tiền/token).
   Bộ đếm analytics chỉ đọc **số lượng entry theo mã lỗi + module + ngày** từ store
   đó (ví dụ: ngày 20/11 có 3 entry `STORAGE_WRITE_FAIL`), **không copy** message,
   stack, hay bất cứ trường nào khác sang store analytics. Xoá nhật ký lỗi thì số
   đếm crash của những ngày đó cũng mất theo — đó là đúng.
2. **Crash log của Apple** (`CRASH-REPORTING.md` §2): Apple thu thập crash log qua
   Xcode Organizer / App Store Connect, chỉ với người dùng đã bật "Chia sẻ với nhà
   phát triển ứng dụng" trên iPhone. Đây là kênh duy nhất cho biết crash thật trên
   máy người dùng — và nó **không thuộc về analytics này**: nhà phát triển xem số
   lượng crash theo nhóm stack trace trong Organizer, không nối với số liệu đếm
   local, không nối với danh tính nào. Không tự động hoá việc đọc Organizer.

**Không đếm "tỉ lệ crash" tự động** (số crash / số lần mở app) ở phía máy chủ — vì
không có máy chủ. Người dùng tự xem 2 con số local của mình (`app_open` và
`crash_count`) và tự hiểu app có ổn định không. Tỉ lệ tập trung chỉ có thể tính khi
có server theo §6, và chỉ sau khi Việt chốt riêng.

### 3.4. Ví dụ đúng / sai

```
// ✅ ĐÚNG — chỉ tên sự kiện + ngày + số lần
{ "date": "2026-11-20", "feature_money": 4, "app_open": 3 }

// ✅ ĐÚNG — đếm crash bằng con số từ nhật ký lỗi local
{ "date": "2026-11-20", "crash_count": 1 }

// ❌ SAI — gắn tên khách vào sự kiện
{ "date": "2026-11-20", "feature_job_create": 1, "client": "Nguyễn Văn A" }

// ❌ SAI — đếm kèm số tiền
{ "date": "2026-11-20", "feature_money": 1, "amount": 5000000 }

// ❌ SAI — ghi giờ từng lần dùng để dựng lại hành trình
{ "events": [{ "name": "feature_money", "at": "2026-11-20T09:15:03+07:00" }] }

// ❌ SAI — gắn mã máy để biết "ai" dùng nhiều
{ "date": "2026-11-20", "app_open": 3, "deviceId": "…" }
```

---

## 4. Dữ liệu lưu ở đâu

### 4.1. Chỉ local — trên máy người dùng, không nơi nào khác

| Hạng mục | Thiết kế |
|---|---|
| Nơi lưu | Trên iPhone của người dùng, trong vùng nhớ riêng của app (sandbox iOS), cùng cơ chế app đã dùng cho dữ liệu chính. **Đề xuất (chưa code):** 1 key `localStorage` riêng — `troLyXeo.analytics` — tách khỏi key dữ liệu chính `troLyXeo.v1` để xoá số liệu không chạm tới job/tiền/cài đặt, và để "Xoá toàn bộ dữ liệu" xoá được cả hai key một cách rõ ràng. Không dùng IndexedDB cho bộ đếm (không cần index, dung lượng rất nhỏ). |
| Dạng lưu | JSON thuần: cờ bật/tắt + ngày bắt đầu đếm + bảng đếm theo ngày (§4.2). Không mã hoá riêng lúc lưu ở v1 — giống dữ liệu chính của app (`PRIVACY.md` §1: lưu dạng thường trong sandbox, bảo vệ bằng mật mã iPhone + sandbox iOS; mã hoá lúc lưu dự kiến ở v1.1). |
| Dung lượng | Rất nhỏ: mỗi ngày tối đa 14 con số (§3.1) + ngày tháng. Ước tính < 1 KB/ngày, < 90 KB cho 90 ngày. Không ảnh hưởng hiệu năng, không cần đo dung lượng chính xác từng byte. |
| Đồng bộ CloudKit (Nấc 2) | **Không đồng bộ.** Số liệu đếm không vào CloudKit, không vào file sao lưu JSON, không sang máy khác. Lý do: số liệu đếm là chẩn đoán về cách dùng app trên máy này, không phải dữ liệu người dùng cần mang theo; đồng bộ nó là rò rỉ chẩn đoán sang thiết bị khác mà không có lợi ích rõ ràng (cùng lập luận như nhật ký lỗi trong `ERROR-LOGGING.md` §0). |
| File sao lưu JSON | **Không chứa số liệu đếm.** File `fotobro-sao-luu.json` chỉ có `{jobs, txs, cfg}` (xem `RETENTION-POLICY.md` §3). Khôi phục từ file không mang số liệu đếm theo — và sau khôi phục, trạng thái đếm về **TẮT** (§2.1). |
| Gỡ app | iOS xoá toàn bộ sandbox — số liệu đếm biến mất cùng app, giống mọi dữ liệu khác (`RETENTION-POLICY.md` §7). |

### 4.2. Hình dạng dữ liệu (đề xuất — chưa code, chỉ để người viết code làm theo)

```json
{
  "enabled": true,
  "since": "2026-11-20",
  "days": {
    "2026-11-20": { "app_open": 3, "feature_home": 3, "feature_money": 4, "crash_count": 0 },
    "2026-11-21": { "app_open": 1, "feature_home": 1, "feature_job_create": 2 }
  }
}
```

| Trường | Quy định |
|---|---|
| `enabled` | `true`/`false`. `false` = không đếm, và không được có entry nào mới trong `days` |
| `since` | Ngày đầu tiên bắt đầu đếm (`YYYY-MM-DD`, theo múi giờ máy). `null` khi chưa bao giờ bật |
| `days` | Key là ngày `YYYY-MM-DD`, value là object chỉ chứa tên sự kiện trong allowlist §3.1 với giá trị là số nguyên ≥ 0. Ngày không mở app thì **không có key** — không lưu ngày 0 lần để khỏi suy ra "ngày nào người dùng không dùng app" một cách tường minh (dù suy ra được từ vắng mặt, cũng không ghi tường minh) |
| Không có trường nào khác | Không `deviceId`, không `userId`, không `sessionId`, không `appVersion` theo từng sự kiện (phiên bản app chỉ cần ghi 1 lần ở màn hình xem thống kê, để người dùng tự biết số liệu thuộc về bản nào — không gắn vào từng ngày đếm), không giờ-phút-giây |

### 4.3. Giới hạn lưu giữ — tự cắt ngắn

| Giới hạn | Số | Ghi chú |
|---|---|---|
| Số ngày giữ tối đa | **90 ngày** | Đủ để thấy xu hướng dùng theo tháng/quý; quá 90 ngày thì số liệu cũ hết giá trị quyết định (đã qua nhiều bản app). Dài hơn nhật ký lỗi (30 ngày) vì bộ đếm nhẹ hơn log rất nhiều và không chứa nội dung nhạy cảm |
| Cách cắt | Tự động, khi app mở: xoá ngày cũ nhất cho tới khi còn ≤ 90 ngày | Chạy 1 lần mỗi lần mở app, không chạy liên tục; cắt ngắn không được throw — lỗi thì bỏ qua, lần mở sau cắt lại (cùng cách làm như prune log trong `ERROR-LOGGING.md` §3.2) |
| Khi tắt đếm | **Giữ lại số liệu đã đếm** cho tới khi người dùng bấm xoá (§5.2) — tắt chỉ dừng đếm mới, không tự xoá cũ. Lý do: người dùng tắt tạm rồi bật lại không mất lịch sử; ai muốn xoá thì xoá bằng 1 nút riêng, rõ ràng |
| Khi "Xoá toàn bộ dữ liệu" (`wipeAll()`) | Xoá luôn key `troLyXeo.analytics` | Cùng với mọi key khác trong `RETENTION-POLICY.md` §6 — reset app là trắng hoàn toàn, không sót số liệu đếm |
| Khi gỡ app | Mất hết | iOS xoá sandbox (§4.1) |

### 4.4. Những gì KHÔNG được lưu cùng số liệu đếm

- Không lưu số liệu đếm vào `troLyXeo.v1` (key dữ liệu chính) — tách key để xoá
  riêng được, và để file sao lưu JSON không vô tình mang số liệu theo.
- Không lưu vào IndexedDB `troLyXeoPhotos` hay store `fotobroErrorLogs` — mỗi store
  một việc.
- Không lưu bản sao số liệu ở bất cứ đâu khác trên máy (không file trong `Documents/`,
  không file lọt vào Files/iCloud backup — số liệu đếm không phải dữ liệu người dùng
  cần backup).

---

## 5. Người dùng bật / tắt / xem / xoá thế nào

### 5.1. Bật và tắt

| Thao tác | Vị trí | Hành vi |
|---|---|---|
| Bật | Cài đặt → Riêng tư → "Chia sẻ số liệu dùng ẩn danh" | Gạt BẬT → hộp xác nhận 1 lần (§2.2) → `enabled = true`, ghi `since` = hôm nay, bắt đầu đếm từ lúc đó |
| Tắt | Cùng nút gạt đó | Gạt TẮT → **dừng đếm ngay**, không hỏi xác nhận lần hai (tắt phải dễ hơn bật), không hiện popup nài nỉ "Bạn có chắc không?". Sau khi tắt, hiện 1 dòng gợi ý (không bắt buộc): "Số liệu đã đếm vẫn còn trên máy. Bạn có thể xoá trong mục Xoá số liệu đếm bên dưới." |
| Nhắc bật lại | Không nhắc | App không nhắc bật lại sau khi người dùng đã tắt — kể cả sau cập nhật app. Ai muốn bật lại thì tự vào Cài đặt. Ngoại lệ duy nhất: nếu sau này có server theo §6 và người dùng đang ở màn hình xem thống kê, được phép hiện **1 dòng chữ tĩnh** (không phải popup) giải thích "Bật gửi ẩn danh để giúp cải tiến app" — và chỉ hiện khi người dùng tự mở màn hình đó |

### 5.2. Xoá số liệu đếm

| Cách xoá | Hành vi |
|---|---|
| Nút "Xoá số liệu đếm" (trong Cài đặt → Riêng tư, ngay dưới nút gạt) | Hỏi xác nhận 1 lần ("Xoá hết số liệu đếm trên máy này? Số liệu đã xoá không khôi phục được."), rồi xoá toàn bộ key `troLyXeo.analytics` (cả `days` lẫn `since`), đặt `enabled` về `false` hay giữ nguyên trạng thái gạt? — **Quyết: xoá xong giữ nguyên trạng thái gạt.** Nếu đang BẬT thì sau khi xoá sẽ đếm lại từ đầu (ghi `since` = hôm nay); nếu đang TẮT thì vẫn TẮT. Không hỏi lại từng ngày |
| Tự động | Ngày quá 90 ngày tự xoá khi mở app (§4.3); ngày cũ nhất tự xoá khi vượt 90 ngày |
| "Xoá toàn bộ dữ liệu" (`wipeAll()`) | Xoá luôn số liệu đếm cùng mọi dữ liệu khác (`RETENTION-POLICY.md` §6) — app tải lại trắng như mới |
| Gỡ app khỏi máy | iOS xoá toàn bộ sandbox — số liệu biến mất cùng app |

Không có cách nào khôi phục số liệu đã xoá — và đó là đúng: số liệu đã xoá thì thôi,
app vẫn chạy bình thường. Không có "thùng rác" cho số liệu đếm.

### 5.3. Xem và xuất số liệu của chính mình

- Vị trí: **Cài đặt → Riêng tư → "Thống kê của tôi"**. Chỉ hiện khi người dùng đã
  từng bật đếm (dù hiện tại đang TẮT mà còn số liệu cũ thì vẫn xem được) — nếu chưa
  bao giờ bật, màn hình này hiện "Bạn chưa bật đếm số liệu. Bật trong mục Riêng tư
  để xem thống kê dùng app của mình."
- Nội dung hiển thị: bảng đơn giản — mỗi dòng 1 ngày (mới nhất lên đầu), mỗi cột 1
  tính năng (§3.1), giá trị là số lần. Kèm 2 dòng tổng: "Từ ngày …" (`since`) và
  "Tổng số lần mở app: …". Không biểu đồ phức tạp, không so sánh với người khác
  (không có dữ liệu người khác để so sánh).
- Xuất số liệu: nút "Xuất thống kê" → tạo file `fotobro-usage-stats.json` (đúng hình
  dạng §4.2) → **hiện màn hình xem trước toàn bộ nội dung** kèm dòng cảnh báo:
  "File này chỉ chứa số lần dùng tính năng theo ngày, không chứa tên khách hay số
  tiền. Hãy xem lại trước khi gửi." → mở Share Sheet iOS để người dùng tự chọn gửi
  qua đâu (Mail, Messages, lưu vào Files…). **Không tự đính kèm vào email hỗ trợ,
  không tự mở Mail với file đính kèm sẵn** — người dùng phải là người bấm gửi, sau
  khi đã xem (cùng cơ chế như xuất nhật ký lỗi trong `ERROR-LOGGING.md` §6.3).
- File xuất **không** chứa dữ liệu job/tiền/ảnh — chỉ chứa bộ đếm. Tên file không
  chứa tên người dùng hay tên máy.

---

## 6. Sau này nếu có server — điều kiện bắt buộc (CHƯA có ở v1, chưa có hiệu lực)

> **Đọc kỹ:** mục này mô tả *điều kiện* để một ngày nào đó mới được gửi số liệu
> đi — không phải mô tả một hệ thống đang tồn tại. **Hiện tại FotoBro không có
> server, không có endpoint, không có tài khoản server nào, không có URL nào để
> gửi.** Không được đọc mục này rồi kết luận "app đã gửi analytics về server".

### 6.1. Khi nào mới được bàn tới chuyện gửi

Chỉ khi **cả 4 điều kiện** sau đều đủ — thiếu 1 thì không gửi:

1. Việt chốt riêng bằng văn bản: "cho gửi số liệu ẩn danh về server" (không gộp
   chung vào quyết định bật đếm local ở §2).
2. Đã có server thật do FotoBro tự vận hành (hoặc dịch vụ do FotoBro thuê và ký
   hợp đồng xử lý dữ liệu), với endpoint, chính sách lưu giữ và quy trình xoá đã
   viết xong — không dùng "server tạm", không gửi thử nghiệm.
3. `PRIVACY.md` + `PRIVACY.html` + `GDPR-NOTES.md` + câu trả lời App Privacy đã
   cập nhật xong, ghi rõ: gửi cái gì, gửi về đâu, giữ bao lâu, xoá thế nào.
4. Code gửi đã được viết theo đúng §6.2–§6.4 dưới đây và đã qua kiểm thử §7.

### 6.2. Gửi cái gì — và chỉ cái đó

- Chỉ gửi **bản sao của đúng dữ liệu ở §4.2** (tên sự kiện + ngày + số lần) — không
  gửi thêm bất cứ trường nào, kể cả "cho tiện debug".
- Gửi theo lô (batch) theo ngày, không gửi từng sự kiện theo thời gian thực — để
  không ai dựng lại được hành trình dùng app trong ngày từ thời điểm gửi.
- **Không gửi định danh:** không IDFV/IDFA, không email, không Apple ID, không tài
  khoản Google, không địa chỉ IP lưu kèm (server không log IP cùng số liệu; nếu hạ
  tầng tự ghi log truy cập thì log đó phải tách khỏi số liệu và xoá theo chu kỳ ngắn,
  không nối lại được).
- Tần suất tối đa: 1 lần/ngày, chỉ khi có mạng, chỉ khi người dùng đã bật cả 2 nút
  (§6.3). Gửi thất bại thì giữ lại trên máy và thử lại lần sau — không gửi dồn nhiều
  ngày thành 1 lô lớn quá 7 ngày (quá 7 ngày chưa gửi được thì bỏ lô cũ nhất, không
  tích lũy vô hạn).

### 6.3. Đồng ý gửi — nút riêng, không gộp

- Gửi về server cần **nút gạt thứ hai, riêng biệt** trong Cài đặt → Riêng tư:
  "Gửi số liệu ẩn danh về FotoBro để cải tiến app" — nút này **chỉ hiện và chỉ bật
  được khi nút đếm local (§2.2) đang BẬT**. Tắt đếm local thì gửi cũng tắt theo.
- Bật nút gửi phải hiện hộp xác nhận riêng, ghi rõ: gửi về đâu (tên server/đơn vị
  vận hành), gửi cái gì (§6.2), giữ bao lâu (§6.4), và "Tắt bất cứ lúc nào".
- Tắt nút gửi là **dừng gửi ngay**; số liệu đã gửi trước đó được xử lý theo §6.4
  (người dùng có quyền yêu cầu xoá phía server — xem §6.4).

### 6.4. Server giữ gì, giữ bao lâu, xoá thế nào

| Hạng mục | Thiết kế bắt buộc |
|---|---|
| Giữ cái gì | Chỉ bảng đếm theo ngày đã gửi (§6.2). Không suy ra thêm, không nối với dữ liệu khác, không làm giàu dữ liệu (enrichment) từ bên thứ ba |
| Giữ bao lâu | **Tối đa 12 tháng** kể từ ngày nhận, rồi xoá tự động. Dài hơn 90 ngày local (§4.3) vì cần đủ dữ liệu theo quý để quyết định, nhưng không giữ vô hạn |
| Tổng hợp | Sau 90 ngày, được phép gộp thành số tổng theo tháng (mất chi tiết theo ngày) rồi xoá bản theo ngày — càng ít chi tiết càng tốt |
| Xoá theo yêu cầu | Người dùng tắt gửi + bấm "Yêu cầu xoá số liệu đã gửi" trong app → app gửi 1 yêu cầu xoá (chỉ chứa mã xoá ẩn danh đã cấp lúc bật gửi — không chứa danh tính) → server xoá các lô gắn mã đó trong tối đa 30 ngày và trả xác nhận. **Lưu ý thiết kế:** mã xoá này là mã ngẫu nhiên chỉ để xoá, không phải mã định danh người dùng — server không được dùng nó để nối các lô thành hồ sơ một người dùng |
| Bảo mật đường truyền | Chỉ gửi qua HTTPS; không gửi qua HTTP; không gửi kèm token hay credential nào |
| Không SDK bên thứ ba | Kể cả khi có server, **vẫn không dùng SDK analytics bên thứ ba** (không Firebase Analytics, PostHog, Amplitude, Mixpanel…). Code gửi là code tự viết, chỉ gọi 1 endpoint duy nhất của FotoBro. Thêm SDK analytics là phải sửa file này + `SDK-INVENTORY.md` + xin Việt chốt riêng |

---

## 7. Kiểm thử (checklist — chạy trước khi giao bất cứ bản nào có đếm)

| # | Kiểm thử | Cách làm | Đạt khi |
|---|---|---|---|
| 1 | Mặc định TẮT | Cài app mới, dùng đủ tính năng 1 ngày, kiểm tra key `troLyXeo.analytics` | Key không tồn tại hoặc `enabled = false` và `days` rỗng |
| 2 | Bật mới đếm | Bật nút gạt, dùng app, kiểm tra lại | Có entry đúng ngày hôm nay, đúng tên sự kiện §3.1, đúng số lần |
| 3 | Không đếm bù quá khứ | Tạo job trước khi bật, rồi bật đếm | Số liệu `feature_job_create` không tính job đã tạo trước lúc bật; `since` = ngày bật |
| 4 | Không lộ tên khách / tiền | Đặt tên khách giả + số tiền giả, dùng mọi tính năng, đọc toàn bộ key analytics | Không tìm thấy tên khách, SĐT, email, số tiền trong bất kỳ chỗ nào |
| 5 | Không có định danh | Đọc toàn bộ key analytics + kiểm tra mạng (không có request nào khi đếm local) | Không có IDFV/IDFA/serial/IP; không có request mạng nào phát sinh từ việc đếm |
| 6 | Giới hạn 90 ngày | Chèn entry giả 91 ngày trước, mở lại app | Entry đó biến mất, còn đúng ≤ 90 ngày |
| 7 | Tắt dừng đếm ngay | Đang bật thì tắt, dùng app tiếp, kiểm tra | Không có entry mới sau lúc tắt; số liệu cũ vẫn còn (chưa xoá) |
| 8 | Xoá thủ công | Bấm "Xoá số liệu đếm", xác nhận | Key analytics trống/mất; màn hình "Thống kê của tôi" hiện chưa có số liệu |
| 9 | Reset xoá số liệu | "Xoá toàn bộ dữ liệu" (`wipeAll()`) | Key `troLyXeo.analytics` không còn tồn tại |
| 10 | Backup không chứa số liệu | Xuất backup JSON khi đang có số liệu đếm | File backup không chứa chuỗi `troLyXeo.analytics`, không chứa tên sự kiện nào ở §3.1 |
| 11 | Khôi phục về TẮT | Khôi phục từ file backup | Sau khôi phục, đếm ở trạng thái TẮT |
| 12 | Xem + xuất đúng nội dung | Mở "Thống kê của tôi", bấm "Xuất thống kê", xem trước | Màn hình xem trước hiện đúng nội dung file; file chỉ chứa bộ đếm §4.2; không tự gửi đi |
| 13 | Crash chỉ đếm số lần | Gây lỗi giả, kiểm tra `crash_count` | `crash_count` tăng 1; không có message/stack nào lọt sang store analytics |
| 14 | Đếm hỏng không hỏng app | Làm cho ghi đếm thất bại (mô phỏng localStorage lỗi), dùng app bình thường | App vẫn chạy, không crash, không hiện lỗi lạ cho người dùng |
| 15 | Cập nhật app không tự bật | Cài bản cũ (TẮT) rồi cập nhật lên bản có đếm | Sau cập nhật vẫn TẮT |

---

## 8. Những gì KHÔNG làm (để dành — cần quyết riêng, không gộp vào thiết kế này)

| Việc | Vì sao chưa làm |
|---|---|
| SDK analytics bên thứ ba (Firebase / PostHog / Amplitude / Mixpanel…) | Trái nguyên tắc §1; thêm SDK là thêm đường dữ liệu rời máy ngoài tầm kiểm soát của app, phải có đánh giá riêng + Việt chốt riêng + cập nhật Privacy |
| Gửi số liệu về server | Chưa có server; chỉ làm khi đủ 4 điều kiện §6.1 |
| Đếm thời gian dùng app, số lần chạm, hành vi cuộn/gõ | Là theo dõi hành vi, không phải đếm tính năng (§3.1) |
| A/B test / thử nghiệm theo nhóm người dùng | Cần gắn người dùng vào nhóm — tức là cần định danh — trái §1.1 |
| Phân tích theo người dùng (cohort, funnel theo cá nhân) | Cần nối các ngày của cùng một người lại với nhau — trái nguyên tắc không ghi hành trình (§1.1, §1.4) |
| Quảng cáo / bán số liệu / chia sẻ cho bên thứ ba | Cấm tuyệt đối theo §1.2 |
| Đếm khi chưa bật (kể cả "chỉ đếm local thôi") | Mặc định TẮT nghĩa là không đếm gì hết (§2.1) |
| Hiện popup xin bật analytics lúc mở app | Làm phiền người dùng lúc họ đang làm việc (§2.1) |

---

## 9. Liên hệ với các tài liệu khác (đọc cùng file này)

| Tài liệu | Liên hệ |
|---|---|
| `PRIVACY.md` / `PRIVACY.html` | Cam kết gốc "không tracking, không analytics" — file này là thiết kế cho *ngoại lệ duy nhất* được phép, và chỉ có hiệu lực sau khi Việt chốt + Privacy được cập nhật cho khớp |
| `batch-legal/SDK-INVENTORY.md` | Chứng cứ "không có SDK analytics" (đã grep thật) — thêm SDK nào cũng phải cập nhật inventory này |
| `batch-legal/GDPR-NOTES.md` | Cơ sở pháp lý (đồng ý, Điều 6(1)(a)), quyền rút đồng ý, vai trò controller của nhiếp ảnh gia đối với dữ liệu khách |
| `batch-legal/RETENTION-POLICY.md` | Key lưu trữ (`troLyXeo.v1`, `troLyXeo.lock`…), hành vi `wipeAll()`, gỡ app — số liệu đếm phải theo cùng quy tắc |
| `batch-build/CRASH-REPORTING.md` | Crash log của Apple qua Organizer — kênh crash chính thức, không nối với analytics |
| `batch-engineering/ERROR-LOGGING.md` | Nhật ký lỗi local (`fotobroErrorLogs`, 200 entry, 30 ngày, bộ lọc tẩy) — nguồn duy nhất để đếm `crash_count` |
| `batch-ops/FEEDBACK-SURVEY.md` | Khảo sát góp ý — cùng triết lý: local-first, chỉ gửi khi người dùng tự bấm gửi, không thu thập thêm |
| `CLOUDKIT-PLAN.md` | Nấc 2 đồng bộ — số liệu đếm **không** đồng bộ qua CloudKit (§4.1) |

---

## 10. Ghi chú cho người viết code (tóm tắt 1 trang — chỉ làm khi Việt đã chốt)

1. Viết 1 module đếm duy nhất, mọi chỗ khác gọi nó — không ai tự ghi key
   `troLyXeo.analytics` trực tiếp.
2. Module có 1 hàm public: `count(eventName)` — chỉ nhận tên sự kiện trong
   allowlist §3.1, từ chối mọi tên khác. Không có hàm đếm nhận chuỗi tự do hay
   object dữ liệu.
3. Thứ tự trong hàm đếm: kiểm tra `enabled` → kiểm tra tên sự kiện có trong
   allowlist → tăng số của ngày hôm nay lên 1 → lưu (không await ở đường đi
   chính, không block UI) → prune ngày quá 90 ngày.
4. Ghi đếm thất bại thì **nuốt lỗi lặng lẽ** — không hiện thông báo cho người dùng,
   không crash app, không log đệ quy vào nhật ký lỗi.
5. Màn hình Cài đặt → Riêng tư (nút gạt + 3 câu giải thích + nút xoá + màn hình
   "Thống kê của tôi" + nút xuất) là một phần của tính năng, không phải để sau —
   đếm mà người dùng không xem/tắt/xoá được thì chỉ là dữ liệu chết.
6. Trước khi submit build có đếm: chạy đủ checklist §7, đồng bộ `PRIVACY.md` =
   `PRIVACY.html` = code thật = câu trả lời App Privacy, và ghi ngày cập nhật ở
   đầu trang của mọi file đã đổi.

---

*File này chỉ mô tả thiết kế — không yêu cầu tạo tài khoản dịch vụ nào, không sửa
code, không thêm SDK, không push GitHub. Mọi thay đổi thiết kế sau này cần cập nhật
lại file này và ghi ngày cập nhật ở đầu trang.*
