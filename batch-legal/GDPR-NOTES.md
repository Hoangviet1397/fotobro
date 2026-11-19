# Ghi chú GDPR — FotoBro iOS v1 (người dùng ở EU/EEA)

> **Ngày soạn:** 20/11/2026 · FotoBro iOS v1 · Bundle ID `com.fotobro.app`
> **Phạm vi:** chỉ áp dụng cho người dùng ở Liên minh châu Âu (EU) và Khu vực
> kinh tế châu Âu (EEA). File này đi kèm `PRIVACY.md` / `PRIVACY.html`
> (Chính sách riêng tư) và `SECURITY-AUDIT.md` (rà soát bảo mật 20/11/2026).
> **⚠️ Đây là ghi chú nội bộ, KHÔNG phải tư vấn pháp lý.** Trước khi công bố
> cho người dùng EU, phải có luật sư (quen GDPR) soát lại toàn bộ file này
> cùng `PRIVACY.md` / `PRIVACY.html`. Không dùng file này làm căn cứ pháp lý
> duy nhất cho bất kỳ quyết định nào.

---

## 0. Mô hình dữ liệu của FotoBro v1 — vì sao GDPR áp dụng khác thường

FotoBro v1 là app **local-first, không máy chủ**:

- Mọi dữ liệu (job chụp, thu/chi, cài đặt, ảnh trang chủ, mã khoá app) chỉ nằm
  trên iPhone của người dùng, trong sandbox của app. FotoBro **không có máy
  chủ riêng, không thu thập, không lưu trữ, không bán dữ liệu, không quảng
  cáo, không tracking, không analytics** (`PRIVACY.md` §Tóm tắt;
  `SECURITY-AUDIT.md` §1).
- Dữ liệu **chỉ rời khỏi máy** khi người dùng tự bật một trong hai tính năng
  sau (cả hai đều **mặc định TẮT** ở v1):
  1. **Đăng nhập Google** — Lịch / Gmail / Danh bạ / Drive (xem §4).
  2. **Đồng bộ CloudKit** (Nấc 2, có thu phí) — **chưa bật ở v1** (trạng thái
     `not-configured`, container `iCloud.com.fotobro.app` chưa được tạo;
     xem `CLOUDKIT-PLAN.md` §0).
- Ngoài hai trường hợp trên, không có dữ liệu nào của người dùng EU rời khỏi
  thiết bị — và do đó không có dữ liệu nào rời khỏi EU.

Hệ quả pháp lý quan trọng: **người dùng FotoBro (nhiếp ảnh gia) không chỉ là
"người dùng" mà còn là bên kiểm soát dữ liệu khách hàng của chính họ** (xem
§6). FotoBro chỉ cung cấp công cụ lưu trữ cục bộ; nhà phát triển FotoBro
không nhìn thấy, không xử lý dữ liệu đó trên máy chủ của mình.

---

## 1. Dữ liệu cá nhân nào được xử lý

### 1.1 Dữ liệu của chính người dùng (nhiếp ảnh gia)

| Dữ liệu | Nguồn | Lưu ở đâu (v1) |
|---|---|---|
| Tên, tên studio, logo, bảng giá, % cọc, ngày trả ảnh, chi cố định | Người dùng tự nhập trong Cài đặt | Chỉ trên máy (localStorage `troLyXeo.v1`) |
| Ngôn ngữ, tiền tệ, màu chủ đề, mẫu tin nhắn/email | Người dùng tự chọn | Chỉ trên máy |
| Ảnh trang chủ (tối đa 60, do người dùng tự chọn) | Thư viện ảnh của người dùng | Chỉ trên máy (IndexedDB `troLyXeoPhotos`) |
| PIN khoá app (dạng băm SHA-256 + salt) | Người dùng tự đặt | Chỉ trên máy (`troLyXeo.lock`) |
| Tài khoản Google (khi đăng nhập) + Lịch/Gmail/Danh bạ/Drive đã tải | Google, khi người dùng cho phép | Trên máy; bản gốc ở Google |
| Apple ID (khi bật CloudKit, Nấc 2) | Apple | Chưa áp dụng ở v1 (CloudKit chưa bật) |

### 1.2 Dữ liệu khách hàng của nhiếp ảnh gia (khách chụp)

Đây là dữ liệu **người dùng tự gõ vào job**: tên khách, số điện thoại, email,
ngày giờ/địa điểm chụp, loại chụp, giá, cọc, ghi chú, tiến độ pipeline
8 giai đoạn. App không tự thu thập thêm gì về khách (không GPS, không danh bạ
iOS, không quét ảnh khách — ảnh chụp thật không nằm trong app, chỉ có link
thư mục Drive do người dùng dán; xem `SECURITY-AUDIT.md` §5).

**Lưu ý:** dữ liệu này là dữ liệu cá nhân theo GDPR (Điều 4(1)) ngay cả khi
chỉ nằm trên máy của nhiếp ảnh gia. Việc nhiếp ảnh gia lưu tên + số điện
thoại + email khách trong app **là một hoạt động xử lý** mà họ chịu trách
nhiệm (xem §6).

### 1.3 Dữ liệu KHÔNG được thu thập

Không GPS, không danh bạ iOS, không giọng nói/ghi âm (mic dời sang v1.1),
không dữ liệu trẻ em (app dành cho người lớn, chủ studio), không dữ liệu
sức khoẻ, không dữ liệu sinh trắc học (Face ID chỉ dùng để mở khoá giao diện
trên máy, template sinh trắc học do iOS quản lý, app không lưu).

---

## 2. Cơ sở pháp lý xử lý dữ liệu (GDPR Điều 6)

| Hoạt động xử lý | Cơ sở pháp lý | Giải thích |
|---|---|---|
| Lưu job, thu/chi, cài đặt trên máy để app chạy (quản lý pipeline, nhắc lịch, báo cáo) | **Thực hiện hợp đồng** — Điều 6(1)(b) | Đây là chức năng cốt lõi người dùng yêu cầu khi dùng app; không có dữ liệu này thì app không làm được việc. |
| Nhắc lịch chụp / nhắc hạn giao ảnh (thông báo cục bộ) | **Thực hiện hợp đồng** — Điều 6(1)(b) | Một phần của dịch vụ nhắc lịch mà người dùng đã bật. |
| Kết nối Google (Lịch/Gmail/Danh bạ/Drive) | **Đồng ý** — Điều 6(1)(a) | Mặc định TẮT; chỉ xử lý sau khi người dùng bấm "Đăng nhập Google" và cho phép đủ 6 scope trong 1 lần. Rút đồng ý bất cứ lúc nào bằng "Ngắt kết nối" (xem §3.5 và lưu ý H3 ở §7). |
| Nhập từ Lịch iPhone | **Đồng ý** — Điều 6(1)(a) | Chỉ đọc khi người dùng bấm nhập và cấp quyền Lịch cho app. |
| Đồng bộ/sao lưu CloudKit (Nấc 2) | **Đồng ý** — Điều 6(1)(a) | Chưa có ở v1. Khi có, chỉ bật khi người dùng đăng nhập Apple ID và bật đồng bộ; tắt được bất cứ lúc nào. |
| Lưu dữ liệu khách hàng của nhiếp ảnh gia trong app | **Do nhiếp ảnh gia tự xác định** (xem §6) | FotoBro không tự đặt cơ sở pháp lý thay cho họ. Thông thường là thực hiện hợp đồng chụp ảnh (Điều 6(1)(b)) hoặc đồng ý của khách (Điều 6(1)(a)). Nhiếp ảnh gia phải tự có cơ sở hợp lệ trước khi nhập dữ liệu khách vào app. |

**Không dùng** lợi ích hợp pháp (Điều 6(1)(f)) làm cơ sở cho bất kỳ hoạt động
xử lý nào ở v1, vì app không xử lý dữ liệu cho mục đích riêng của nhà phát
triển (không quảng cáo, không phân tích, không cải tiến sản phẩm từ dữ liệu
người dùng). Nếu sau này thêm analytics hoặc xử lý trên máy chủ, phải đánh
giá lại cơ sở pháp lý và cập nhật file này.

**Không có quyết định tự động / profiling** (Điều 22): app không chấm điểm,
không phân loại, không ra quyết định tự động nào về người dùng hay khách hàng
của họ. Mọi gợi ý (ví dụ: gợi ý ghi sổ từ Gmail) đều cần người dùng bấm đồng
ý mới ghi.

---

## 3. Quyền của người dùng EU (GDPR Chương III)

Người dùng EU có các quyền sau. Vì dữ liệu nằm trên máy của họ (không có máy
chủ FotoBro), **hầu hết các quyền được thực hiện trực tiếp trong app**, không
cần gửi yêu cầu cho nhà phát triển:

| Quyền | Điều GDPR | Cách thực hiện trong FotoBro v1 |
|---|---|---|
| **Quyền được thông tin** | Điều 13–14 | `PRIVACY.md` / `PRIVACY.html` + file này. Màn hình xin quyền của Google/Apple hiện rõ từng scope trước khi cho phép. |
| **Quyền truy cập** | Điều 15 | Mở app là thấy toàn bộ dữ liệu của mình (job, thu/chi, cài đặt). Không cần yêu cầu bản sao từ nhà phát triển vì nhà phát triển không giữ bản sao nào. |
| **Quyền sửa chữa** | Điều 16 | Sửa trực tiếp trong app (sửa job, sửa khoản thu/chi, sửa cài đặt). Có hiệu lực ngay trên máy. |
| **Quyền xoá ("quyền được lãng quên")** | Điều 17 | Cài đặt → Xoá dữ liệu đã lưu (xoá job, thu/chi, cài đặt, token Google, dữ liệu Google đã tải). Gỡ app khỏi iPhone cũng xoá toàn bộ dữ liệu trong sandbox. Xem lưu ý H5 ở §7 — nút xoá ở v1 chưa xoá hết mọi thứ, phải sửa trước khi công bố cho người dùng EU. |
| **Quyền hạn chế xử lý** | Điều 18 | Tắt tính năng gây ra xử lý đó: ngắt kết nối Google, tắt đồng bộ CloudKit, tắt thông báo (Cài đặt iPhone → Thông báo → FotoBro). |
| **Quyền xuất dữ liệu (portability)** | Điều 20 | Xuất file sao lưu JSON về máy (nút xuất trong app). File JSON là định dạng có cấu trúc, đọc được bằng máy, dùng được để chuyển sang hệ thống khác. Lưu ý: file sao lưu v1 là JSON plaintext, không mã hoá (xem `SECURITY-AUDIT.md` M4) — người dùng tự giữ file cẩn thận. |
| **Quyền phản đối** | Điều 21 | Không áp dụng thực tế ở v1 vì không có xử lý nào dựa trên lợi ích hợp pháp hay tiếp thị trực tiếp. |
| **Quyền rút đồng ý** | Điều 7(3) | Bấm "Ngắt kết nối" (Google) hoặc tắt đồng bộ (CloudKit) bất cứ lúc nào; việc rút đồng ý không ảnh hưởng tính hợp pháp của xử lý trước đó. Xem lưu ý H3 ở §7 về việc thu hồi token. |
| **Quyền khiếu nại** | Điều 77 | Gửi khiếu nại tới cơ quan bảo vệ dữ liệu ở nước mình (ví dụ: CNIL — Pháp, BfDI — Đức, AP — Hà Lan, hoặc cơ quan tương đương). FotoBro chưa có cơ sở tại EU nên chưa có cơ quan giám sát chính (lead authority) theo Điều 56; người dùng khiếu nại tại cơ quan địa phương của mình. |
| **Quyền không bị quyết định tự động** | Điều 22 | Không áp dụng — app không ra quyết định tự động (xem §2). |

**Thời hạn trả lời yêu cầu:** vì dữ liệu nằm trên máy người dùng, các quyền
trên thực hiện ngay trong app, không chờ nhà phát triển. Với yêu cầu gửi tới
email hỗ trợ (ví dụ: hỏi về dữ liệu Google/CloudKit), mục tiêu trả lời trong
**1 tháng** kể từ khi nhận được (Điều 12(3)), có thể gia hạn thêm 2 tháng với
yêu cầu phức tạp — nhưng lưu ý email hỗ trợ hiện chưa hoạt động (xem §8).

**Không thu phí** khi thực hiện các quyền trên, trừ khi yêu cầu rõ ràng là
vô căn cứ hoặc quá mức (Điều 12(5)).

---

## 4. Dữ liệu nào rời khỏi EU — khi bật Google / CloudKit

### 4.1 Khi cả hai đều TẮT (mặc định v1)

**Không có dữ liệu nào rời khỏi thiết bị, không có dữ liệu nào rời khỏi EU.**
Không có chuyển dữ liệu quốc tế nào theo Chương V GDPR.

### 4.2 Khi bật Google (người dùng tự chọn)

| Hạng mục | Chi tiết |
|---|---|
| Dữ liệu nào đi đâu | Lịch, Gmail, Danh bạ, Drive của người dùng được đọc/ghi qua Google APIs. Dữ liệu đi tới **máy chủ Google** (Google vận hành trung tâm dữ liệu toàn cầu, gồm cả ngoài EU — chủ yếu tại Mỹ). Sự kiện buổi chụp do app ghi sẽ nằm trên Google Lịch của người dùng. |
| Cơ chế chuyển | OAuth 2.0 + PKCE, mở bằng trình duyệt hệ thống; access token chỉ giữ trong phiên trên máy, hết hạn sau ~1 giờ. App không có máy chủ trung gian — dữ liệu đi thẳng từ máy người dùng tới Google, không qua FotoBro. |
| Căn cứ chuyển dữ liệu (Chương V) | Google LLC (Mỹ) tham gia **EU–US Data Privacy Framework** và Google dùng **Điều khoản hợp đồng chuẩn (SCCs)** trong điều khoản xử lý dữ liệu của mình. Người dùng chấp nhận điều khoản của Google khi đăng nhập tài khoản Google — FotoBro không tự ký SCC riêng với Google thay cho người dùng. **Cần luật sư xác nhận** điểm này trước khi công bố, vì FotoBro không phải là bên ký hợp đồng xử lý dữ liệu (DPA) với Google; vai trò của FotoBro ở đây là ứng dụng khách (client) chạy trên máy người dùng. |
| Phạm vi | Đủ 6 scope xin trong 1 lần đăng nhập: `calendar.readonly`, `calendar.events`, `gmail.readonly` (restricted), `gmail.send`, `contacts.readonly`, `drive.metadata.readonly` (xem `GOOGLE-SETUP.md` §3). Người dùng chỉ muốn xem Lịch cũng phải cấp cả quyền đọc/gửi Gmail — đây là điểm cần sửa (cho chọn nhóm quyền) hoặc ít nhất phải nói rõ trước khi công bố (xem `SECURITY-AUDIT.md` H4). |
| Cách dừng | Bấm "Ngắt kết nối": token được thu hồi tại Google, dữ liệu Google đã tải bị xoá khỏi máy. **Lưu ý H3 (§7):** code v1 chỉ thu hồi access token; refresh token phía Google có thể vẫn sống — phải sửa trước khi công bố. Sự kiện đã ghi trên Google Lịch không bị xoá theo — người dùng tự xoá trong app Lịch. |

### 4.3 Khi bật CloudKit (Nấc 2 — chưa có ở v1)

| Hạng mục | Chi tiết |
|---|---|
| Trạng thái | **Chưa bật ở v1** — container `iCloud.com.fotobro.app` chưa được tạo, chưa có dữ liệu nào rời máy qua CloudKit. |
| Khi bật (thiết kế) | Dữ liệu được **mã hoá đầu cuối (AES-256-GCM) ở tầng app trước khi đẩy**, lưu vào **privateDB iCloud cá nhân** của người dùng (mỗi người chỉ thấy dữ liệu của mình). Apple chỉ thấy ciphertext đối với bản sao lưu mã hoá. Ảnh gốc không đẩy lên CloudKit (chỉ metadata + link). Xem `CLOUDKIT-PLAN.md` §1–§2. |
| Máy chủ | iCloud do Apple vận hành (trung tâm dữ liệu toàn cầu, gồm cả ngoài EU — chủ yếu tại Mỹ). Apple tham gia **EU–US Data Privacy Framework** và dùng SCCs. Người dùng chấp nhận điều khoản iCloud của Apple khi đăng nhập Apple ID. |
| Cách dừng | Tắt đồng bộ trong app bất cứ lúc nào; dữ liệu trên máy vẫn giữ nguyên; người dùng có thể xoá bản sao lưu đã mã hoá trong iCloud từ trong app. |

### 4.4 Các đường dữ liệu rời máy khác (do người dùng tự bấm)

- **Chia sẻ / gửi email / sao lưu JSON:** người dùng bấm Share, gửi email cho
  khách (mailto/Gmail), hoặc tải file sao lưu JSON về máy — dữ liệu đi tới
  người nhận / dịch vụ mà người dùng tự chọn. App không tự gửi.
- **Mở app ngoài (Facebook/Messenger/Gmail/Drive):** chỉ là deep link, app
  không tự gửi dữ liệu cho các bên này.
- **Thông báo màn hình khoá:** tên khách + giờ chụp có thể hiện trên màn
  hình khoá nếu iPhone để hiện nội dung thông báo (`SECURITY-AUDIT.md` M5)
  — đây là hiển thị cục bộ trên máy, không phải chuyển dữ liệu cho bên thứ
  ba, nhưng người dùng EU nên được nhắc để tự tắt preview nếu muốn.

---

## 5. Thời gian lưu giữ dữ liệu (GDPR Điều 5(1)(e))

| Dữ liệu | Thời gian lưu | Khi nào xoá |
|---|---|---|
| Job, thu/chi, cài đặt, ảnh trang chủ, khoá app (trên máy) | **Không giới hạn mặc định — cho tới khi người dùng xoá** | Người dùng bấm "Xoá dữ liệu đã lưu" trong app, xoá từng job/khoản, hoặc gỡ app (xoá toàn bộ sandbox). Không có chính sách tự xoá theo hạn (ví dụ: không tự xoá job cũ sau X năm) ở v1. |
| Access token Google | ~1 giờ (hết hạn tự động) | Hết hạn, hoặc ngắt kết nối. |
| Refresh token Google | Xem lưu ý H2/H3 ở §7 — code v1 lưu refresh token dài hạn trong localStorage; **phải sửa trước khi công bố** (khuyến nghị: không lưu refresh token nữa). | Ngắt kết nối (sau khi sửa code để revoke cả refresh token). |
| Dữ liệu Google đã tải (lịch, email gợi ý, danh bạ) | Cho tới khi ngắt kết nối hoặc xoá dữ liệu | Ngắt kết nối / xoá dữ liệu trong app. |
| Sự kiện đã ghi trên Google Lịch | Theo chính sách lưu giữ của Google / tài khoản người dùng | Người dùng tự xoá trong app Lịch (app không xoá được từ xa). |
| Bản sao lưu CloudKit đã mã hoá (Nấc 2) | Cho tới khi người dùng xoá | Xoá từ trong app; tắt đồng bộ không tự xoá bản sao trên iCloud — phải nói rõ điều này trong giao diện khi triển khai Nấc 2. |
| File sao lưu JSON người dùng tự tải | Do người dùng tự quản | Người dùng tự xoá trong Files (app không xoá được file đã tải). |

**Nguyên tắc:** FotoBro không đặt hạn lưu giữ phía máy chủ vì không có máy
chủ. Người dùng tự quyết định giữ dữ liệu của mình bao lâu. **Cần luật sư
xác nhận** liệu có cần thêm chính sách tự xoá (ví dụ: nhắc người dùng xoá job
đã xong quá 2 năm) hay việc "giữ tới khi người dùng xoá" đã đủ cho mục đích
quản lý studio.

---

## 6. Nhiếp ảnh gia cũng là bên kiểm soát dữ liệu (controller)

Đây là điểm người dùng EU cần hiểu rõ nhất:

1. **Hai vai trò khác nhau.** Khi dùng FotoBro, nhiếp ảnh gia đồng thời là:
   - **Chủ thể dữ liệu (data subject)** đối với dữ liệu của chính mình
     (tên, studio, tài khoản Google/Apple của mình) — các quyền ở §3 áp
     dụng cho họ với vai trò này.
   - **Bên kiểm soát dữ liệu (data controller)** đối với dữ liệu **khách
     hàng của họ** (tên, số điện thoại, email khách chụp) mà họ nhập vào
     app — theo GDPR Điều 4(7) và Điều 24.
2. **FotoBro (nhà phát triển) không phải là bên kiểm soát dữ liệu khách
   hàng của nhiếp ảnh gia**, vì dữ liệu đó chỉ nằm trên máy của nhiếp ảnh
   gia và nhà phát triển không truy cập, không xử lý nó. FotoBro cũng không
   phải là bên xử lý (processor) theo Điều 28 trong mô hình local-first
   này — không có hợp đồng xử lý dữ liệu (DPA) nào giữa nhà phát triển và
   nhiếp ảnh gia ở v1, vì không có dữ liệu nào được giao cho nhà phát triển
   xử lý. **Cần luật sư xác nhận** phân loại vai trò này, đặc biệt khi
   CloudKit (Nấc 2) bật lên — lúc đó Apple là bên xử lý phụ (sub-processor)
   vận hành hạ tầng iCloud, và Google là bên xử lý đối với dữ liệu Google
   của người dùng.
3. **Nghĩa vụ của nhiếp ảnh gia với khách hàng của họ** (khi khách ở EU):
   - Có **cơ sở pháp lý** trước khi nhập dữ liệu khách vào app (thường là
     hợp đồng chụp ảnh, hoặc đồng ý của khách).
   - **Thông báo cho khách** biết dữ liệu của họ được lưu ở đâu, để làm
     gì, giữ bao lâu (Điều 13–14) — ví dụ: ghi 1–2 câu trong hợp đồng
     chụp / email xác nhận, hoặc trong chính sách riêng tư của studio.
   - **Đáp ứng quyền của khách** (truy cập, sửa, xoá...) — thực hiện trực
     tiếp trong app FotoBro (sửa/xoá job của khách đó).
   - **Bảo vệ dữ liệu trên máy**: đặt mật mã iPhone mạnh, bật khoá app
     (PIN/Face ID), không để máy mở khoá cho người lạ, xoá dữ liệu trước
     khi bán/cho mượn máy. Lưu ý dữ liệu v1 lưu dạng thường (plaintext)
     trong sandbox, chưa mã hoá riêng lúc lưu (xem §7, H1).
   - **Không nhập dữ liệu khách không cần thiết** (nguyên tắc tối thiểu
     hoá, Điều 5(1)(c)): chỉ nhập những gì cần để làm job (tên, liên hệ,
     ngày giờ, giá) — không nhập CCCD, địa chỉ nhà riêng hay thông tin
     nhạy cảm khác của khách vào app.
4. **Ngoại lệ hộ gia đình (Điều 2(2)(c)) không áp dụng** khi nhiếp ảnh gia
   dùng app cho hoạt động nghề nghiệp (studio) — đây là hoạt động xử lý có
   tính nghề nghiệp/thương mại, nên GDPR áp dụng đầy đủ với họ trong vai
   trò controller.

---

## 7. Điểm chưa đạt — phải sửa trước khi công bố cho người dùng EU

Các điểm dưới đây lấy từ `SECURITY-AUDIT.md` (20/11/2026). Chúng ảnh hưởng
trực tiếp tới khả năng đáp ứng quyền xoá / rút đồng ý của GDPR, nên **không
được công bố file này cho người dùng EU khi các điểm H2/H3/H5 chưa sửa**:

| # | Vấn đề | Ảnh hưởng GDPR |
|---|---|---|
| H1 | Dữ liệu chính lưu **plaintext** trong localStorage/IndexedDB; khoá app chỉ ẩn giao diện, không mã hoá dữ liệu. Mất máy không có mật mã iPhone = mất dữ liệu. | Rủi ro vi phạm nguyên tắc toàn vẹn/bảo mật (Điều 5(1)(f), Điều 32). Chấp nhận được ở v1 **nếu** nói rõ trong Privacy Policy (đã nói rõ), và mã hoá lúc lưu dự kiến ở v1.1. Người dùng EU phải được nhắc đặt mật mã iPhone mạnh. |
| H2 | **Refresh token Google lưu plaintext** trong localStorage (`troLyXeo.grefresh`) mà code không dùng để làm mới token. | Credential sống dài hạn nằm ở nơi yếu nhất; trái với nguyên tắc tối thiểu hoá + bảo mật. Sửa rẻ: đừng lưu refresh token nữa (xoá 1 dòng lưu), chỉ giữ access token trong phiên. |
| H3 | "Ngắt kết nối" chỉ thu hồi **access token**, refresh token phía Google có thể vẫn sống. | Người dùng tưởng đã rút đồng ý (Điều 7(3)) nhưng quyền truy cập vẫn còn hiệu lực — vi phạm cam kết trong PRIVACY.md. Sửa: revoke cả refresh token khi ngắt kết nối; nếu revoke thất bại thì hướng dẫn thu hồi thủ công (myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba → FotoBro). |
| H4 | Xin đủ **6 scope Google 1 lần**, kể cả scope nhạy cảm/restricted mà người dùng có thể không cần (`gmail.readonly` là restricted). | Trái nguyên tắc tối thiểu hoá (Điều 5(1)(c)) và đồng ý cụ thể (Điều 7). Nên cho chọn nhóm quyền trước khi đăng nhập (Lịch / Gmail / Drive), hoặc sửa tài liệu cho đúng "xin đủ 6 scope 1 lần". Quyết định giữ hay bỏ `gmail.readonly` ở v1 đang chờ Việt (ảnh hưởng thời gian xác minh Google 4–10 tuần so với 2–6 tuần). |
| H5 | "Xoá toàn bộ dữ liệu" **không xoá hết**: ảnh IndexedDB, token Google + dữ liệu Google đã tải, khoá app, logo vẫn còn. | Vi phạm trực tiếp quyền xoá (Điều 17) và cam kết trong PRIVACY.md mục 6. Sửa rẻ: viết 1 hàm `wipeAll()` xoá thật tất cả + báo rõ file sao lưu đã tải không xoá được từ trong app. |
| M4 | File sao lưu JSON v1 là **plaintext, không mã hoá**, nhập file không kiểm tra tính toàn vẹn. | Rủi ro khi người dùng xuất dữ liệu theo quyền portability (Điều 20) rồi để file ở nơi không an toàn. Sao lưu v2 mã hoá đã có thiết kế trong `BACKUP-V2.md`, chưa code. |
| M5 | Thông báo nhắc lịch hiện **tên khách trên màn hình khoá**. | Dữ liệu khách hàng lộ cho người cầm máy liếc qua. Ghi 1 dòng trong PRIVACY.md; v1.1 cho tắt preview (chỉ hiện giờ chụp, không kèm tên). |
| L3 | `PRIVACY.md` còn lệch với code thật (câu về refresh token, "Xoá toàn bộ", scope xin 1 lần). `PRIVACY.html` (20/11) đã sửa đúng hướng. | Apple và Google đều đối chiếu chính sách với hành vi thật. Trước khi nộp App Store / gửi xác minh Google, đồng bộ 1 lần: PRIVACY.md = PRIVACY.html = code thật. File GDPR này cũng phải soát lại sau khi sửa code. |

---

## 8. Liên hệ về dữ liệu (DPO / support)

| Hạng mục | Trạng thái (20/11/2026) |
|---|---|
| Email hỗ trợ | **support@fotobro.app — PLACEHOLDER, CHƯA CÓ EMAIL THẬT.** Domain `fotobro.app` chưa được mua/xác minh; `fotobro.com` đã có chủ từ 22/02/2008. Đề xuất: mua `fotobro.app` rồi dùng iCloud+ Custom Domain (xem `GOOGLE-SETUP.md` §2a). Trong lúc chờ, người dùng liên hệ qua mục Cài đặt → Liên hệ trong app. **Không công bố email này như kênh liên hệ GDPR đang hoạt động cho tới khi hộp thư thật sự nhận được thư.** |
| DPO (Data Protection Officer) | **Chưa bổ nhiệm.** FotoBro v1 là app nhỏ, local-first, không xử lý dữ liệu quy mô lớn và không xử lý dữ liệu đặc biệt (Điều 9) hay theo dõi có hệ thống — nên chưa thuộc trường hợp bắt buộc bổ nhiệm DPO theo Điều 37. Nếu sau này thêm máy chủ, analytics, hoặc xử lý dữ liệu khách hàng tập trung, phải đánh giá lại. **Cần luật sư xác nhận** kết luận này. |
| Đại diện tại EU (Điều 27) | **Chưa có.** Nhà phát triển hiện không có cơ sở tại EU. Nếu FotoBro bắt đầu cung cấp dịch vụ cho người dùng EU một cách thường xuyên (qua App Store), cần luật sư xác định có phải chỉ định đại diện tại EU theo Điều 27 hay không — và nếu có, ghi tên + địa chỉ liên hệ của đại diện vào file này. |
| Cơ quan giám sát | Chưa có cơ quan giám sát chính (lead authority) vì chưa có cơ sở tại EU. Người dùng khiếu nại tại cơ quan bảo vệ dữ liệu ở nước mình (Điều 77). |
| Hồ sơ xử lý (Điều 30) | Nhà phát triển nên giữ 1 bản ghi hoạt động xử lý (records of processing) — file này + `PRIVACY.md` + `SECURITY-AUDIT.md` là điểm khởi đầu, nhưng cần lập thành hồ sơ Điều 30 chính thức khi có luật sư soát. Nhiếp ảnh gia (với vai trò controller dữ liệu khách của họ) cũng có nghĩa vụ ghi chép theo Điều 30(1)–(2) nếu xử lý không chỉ thỉnh thoảng — cần nhắc họ trong tài liệu hướng dẫn. |

---

## 9. Thay đổi của ghi chú này

- Ghi chú này sẽ được cập nhật khi: sửa xong H2/H3/H5 (§7), bật CloudKit
  (Nấc 2), thêm/bớt scope Google, thêm máy chủ hoặc analytics, bổ nhiệm DPO
  hoặc đại diện EU, hoặc khi luật sư soát xong và yêu cầu sửa.
- Mỗi lần cập nhật ghi ngày + nội dung đổi, giống cách `PRIVACY.md` ghi ngày
  cập nhật ở đầu trang.
- Phiên bản luật sư soát xong (nếu có) nên ghi rõ: tên luật sư/công ty luật,
  ngày soát, phạm vi soát — để phân biệt với bản ghi chú nội bộ này.

---

## English summary

**FotoBro** is a local-first iOS app for freelance photographers. All data
stays on the user's iPhone; there is no FotoBro server, no tracking, no ads,
no analytics. Data only leaves the device when the user opts in to Google
sign-in (Calendar/Gmail/Contacts/Drive) or CloudKit sync (Tier 2 — not
enabled in v1). Google servers and Apple iCloud servers are located outside
the EU (mainly the US); both companies rely on the EU–US Data Privacy
Framework and Standard Contractual Clauses.

**Legal bases (GDPR Art. 6):** performance of a contract (Art. 6(1)(b)) for
core app functions on-device; consent (Art. 6(1)(a)) for Google, iPhone
Calendar import and CloudKit. No legitimate-interest processing, no automated
decisions/profiling (Art. 22).

**User rights (GDPR Chapter III):** access, rectification, erasure, restriction,
portability (JSON export), withdrawal of consent and complaint to the local
supervisory authority — most are exercised directly inside the app, because
the developer holds no copy of the data. Retention: data stays on the device
until the user deletes it; there is no server-side retention.

**Photographers are also controllers** of their own clients' data (name,
phone, email entered into jobs). They need their own legal basis, must inform
their clients, and must answer their clients' rights requests.

**Contact:** support@fotobro.app is a **placeholder — no real mailbox exists
yet**. No DPO has been appointed; no EU representative has been appointed.

**⚠️ This is a working note, NOT legal advice. A lawyer must review it
before it is published to EU users.** Known gaps that must be fixed first are
listed in §7 (refresh token stored in plaintext, disconnect not revoking the
refresh token, "Delete all data" not deleting everything, all six Google
scopes requested at once).

---

*Nguồn kiểm tra (20/11/2026): `PRIVACY.md`, `PRIVACY.html`, `SECURITY-AUDIT.md`,
`GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md` trong `~/workspace/fotobro-ios-v1/`.*
