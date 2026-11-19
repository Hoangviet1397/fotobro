# Kế hoạch ứng phó sự cố dữ liệu — FotoBro iOS v1

> Ngày: 20/11/2026 · FotoBro iOS v1 · Bundle ID: `com.fotobro.app`
> Người vận hành duy nhất ở v1: **Việt** (nhà phát triển + hỗ trợ).
> Cơ sở thực tế: `SECURITY-AUDIT.md` (20/11/2026), `PRIVACY.html` (20/11/2026),
> `BACKUP-V2.md` (20/11/2026), `RISKS.md` (19/11/2026).
> Chỉ viết file này, không sửa code, không tạo tài khoản, không push GitHub.

## 0. Phạm vi — đọc trước khi dùng kế hoạch này

### 0.1. Điều quan trọng nhất: v1 không có máy chủ

FotoBro v1 là app **local-first, không máy chủ, không tài khoản, không
analytics, không quảng cáo, không đồng bộ ngầm**. Không có "server FotoBro"
nào để bị tấn công, không có cơ sở dữ liệu tập trung nào để rò rỉ, và
Việt **không nhìn thấy, không truy cập được, không sao lưu được** dữ liệu
của bất kỳ người dùng nào.

Hệ quả trực tiếp cho ứng phó sự cố:

- **Không có kịch bản "rò rỉ phía server" ở v1.** Mọi sự cố đều xảy ra
  ở phía thiết bị người dùng, tài khoản Google của người dùng, hoặc
  file sao lưu do người dùng tự giữ.
- **Việt không thể tự phát hiện sự cố trên máy người dùng.** App không
  gửi telemetry, không có log tập trung. Mọi phát hiện đều bắt đầu từ
  (a) người dùng báo lại, (b) cảnh báo bảo mật của Google/Apple,
  hoặc (c) Việt tự phát hiện lỗi trong code.
- **Việt không thể khắc phục thay người dùng.** Việt chỉ có thể: hướng
  dẫn xử lý, sửa code và phát hành bản vá qua TestFlight/App Store,
  cập nhật Privacy Policy / trang hỗ trợ. Các bước thu hồi quyền,
  xoá file, khoá máy chỉ người dùng mới làm được trên thiết bị và
  tài khoản của chính họ.

### 0.2. Dữ liệu nào có thể bị ảnh hưởng (bản đồ dữ liệu v1)

Lấy từ `SECURITY-AUDIT.md` §1 và §6 — đây là những gì một sự cố
thực sự có thể lộ ra:

| Dữ liệu | Ở đâu | Mã hoá lúc lưu? | Mức nhạy cảm |
|---|---|---|---|
| Job + thu/chi + cài đặt (tên khách, SĐT, email, giá, cọc, ghi chú) | `localStorage` key `troLyXeo.v1` | **Không** — JSON plaintext | Cao — dữ liệu khách hàng + tiền |
| Ảnh trang chủ (tối đa 60, JPEG ~1400px) | IndexedDB `troLyXeoPhotos` | **Không** — Blob JPEG plaintext | Trung bình — do người dùng tự chọn; EXIF (kể cả GPS) đã bị lược khi vẽ lại qua canvas |
| Khoá app (PIN 4–6 số) | `localStorage` `troLyXeo.lock` | PIN là SHA-256(salt + PIN), salt 16 byte | Trung bình — SHA-256 nhanh, PIN 4 số chỉ có 10.000 khả năng nếu trích xuất được file (audit M1) |
| Access token Google | `sessionStorage` `troLyXeo.gtoken` | Không — hết hạn sau ~1 giờ | Cao trong 1 giờ — đọc Lịch/Gmail/Danh bạ/Drive + ghi lịch + gửi Gmail (đủ 6 scope) |
| Refresh token Google | `localStorage` `troLyXeo.grefresh` | **Không** — sống dài hạn | **Cao nhất** — xem lưu ý §0.3 |
| Lịch / Gmail / Danh bạ đã tải từ Google | `localStorage` `troLyXeo.gcal` / `gmail` / `gcontacts` | Không — tồn tại cả sau khi access token hết hạn | Cao — nội dung thư tới 6.000 ký tự/thư |
| Sao lưu v1 do người dùng tải | File `fotobro-sao-luu.json` | **Không** — JSON plaintext, không có ảnh | Cao — ai cầm file đọc được tên khách + số tiền |
| Ảnh khách chụp thật | **Không nằm trong app** — app chỉ lưu link thư mục Drive (`driveLink`) | — | Nằm trên Drive / máy ảnh của người dùng, không phải trong app |
| CloudKit Nấc 2 | **Chưa bật** (`not-configured`) | — | Không có dữ liệu nào rời máy qua CloudKit ở v1 |

### 0.3. ⚠️ Hai điểm lệch giữa PRIVACY.html và code thật — ảnh hưởng trực tiếp tới kế hoạch này

`SECURITY-AUDIT.md` §H2/H3/H5 và §L3 phát hiện tài liệu lệch code.
Kế hoạch này viết theo **code thật**, không theo tài liệu, vì xử lý
sự cố theo tài liệu sai sẽ bỏ sót bước thu hồi:

1. **Refresh token:** `PRIVACY.html` ghi "App v1 cố tình KHÔNG lưu
   refresh token" và "bấm Ngắt kết nối là mã bị thu hồi ngay". Code
   thật: refresh token **được lưu plaintext** trong `localStorage`
   (`www/index.html:2974`) và nút Ngắt kết nối **chỉ thu hồi access
   token** — refresh token phía Google có thể vẫn sống. → Trong mọi
   kịch bản lộ token, **phải thu hồi thủ công tại
   myaccount.google.com** cho tới khi H3 được sửa (xem §8).
2. **"Xoá toàn bộ dữ liệu":** `PRIVACY.html` ghi xoá toàn bộ gồm ảnh,
   khoá, token Google. Code thật: nút này **chỉ xoá jobs/txs**, còn
   ảnh IndexedDB, token Google, dữ liệu Google đã tải, khoá app, logo
   vẫn còn. → Khi hướng dẫn người dùng xoá dữ liệu sau sự cố
   (đổi/bán/trả máy), phải liệt kê rõ từng thứ còn sót và cách xoá tay.

Cả hai điểm này phải được sửa (code H2/H3/H5 + đồng bộ PRIVACY.md =
PRIVACY.html = code thật) **trước TestFlight** theo checklist của
`SECURITY-AUDIT.md` §7. Cho tới lúc đó, kế hoạch này là bản ghi đúng
thực tế để không ai xử lý thiếu bước.

### 0.4. Vai trò pháp lý — ai phải thông báo cho ai

- **Người dùng FotoBro (nhiếp ảnh gia)** là người thu thập và giữ dữ
  liệu khách hàng của chính họ trong app. Về mặt pháp lý, họ là
  **bên kiểm soát dữ liệu (data controller)** đối với dữ liệu khách
  của họ; FotoBro chỉ là công cụ lưu trữ trên máy họ.
- **Việt / FotoBro** không nắm dữ liệu người dùng, nên không thể thay
  họ thông báo cho khách hàng của họ, và cũng không thể biết một sự
  cố trên máy riêng của họ đã xảy ra nếu họ không báo.
- Vì vậy kế hoạch này chia hai tầng:
  - **Tầng 1 — người dùng tự xử lý trên máy/tài khoản của mình**
    (thu hồi, xoá, khôi phục, thông báo cho khách của mình).
  - **Tầng 2 — Việt xử lý ở phía app** (xác minh lỗi, sửa code, phát
    hành bản vá, đăng thông báo chung cho mọi người dùng nếu lỗi
    thuộc về app).

### 0.5. Mức độ nghiêm trọng

| Mức | Định nghĩa | Ví dụ |
|---|---|---|
| **P1 — nghiêm trọng** | Dữ liệu khách hàng hoặc credential Google có thể đã lọt ra ngoài, hoặc đang bị khai thác | Mất máy không mật mã; lộ refresh token; file sao lưu gửi nhầm người lạ |
| **P2 — đáng kể** | Mất mát hoặc lộ dữ liệu giới hạn, chưa rõ có bên ngoài đọc được không | Lỗi app xoá nhầm dữ liệu nhưng còn bản sao lưu; ảnh trang chủ là ảnh khách bị người ngoài nhìn thấy |
| **P3 — thấp** | Lộ dữ liệu thoáng qua, ít khả năng gây hại | Tên khách hiện trên màn hình khoá qua thông báo nhắc lịch (audit M5) |

## 1. Quy tắc chung cho mọi sự cố

1. **Ngăn chặn trước, điều tra sau.** Bước đầu tiên luôn là cắt
   quyền truy cập / dừng thiệt hại lan rộng (khoá máy, thu hồi token,
   gỡ link chia sẻ), rồi mới tìm hiểu nguyên nhân.
2. **Không ghi đè dữ liệu khi chưa có bản sao lưu.** Trước mọi thao
   tác khôi phục/xoá, xuất (hoặc giữ nguyên) bản sao lưu hiện tại.
   Khôi phục trong app là **thay thế toàn bộ** (`BACKUP-V2.md` §6).
3. **Ghi nhật ký sự cố** theo mẫu §9 ngay khi xử lý — ngày giờ, ai
   báo, dữ liệu nào, đã làm gì, đã thông báo cho ai. Không có log
   tập trung nên nhật ký tay là bằng chứng duy nhất.
4. **Không hứa hẹn quá mức.** Không nói "dữ liệu đã an toàn tuyệt
   đối" khi chưa kiểm chứng được. Nói đúng những gì đã làm và những
   gì chưa chắc chắn.
5. **Kênh liên hệ sự cố ở v1:** trong app (Cài đặt → Liên hệ) và repo
   `Hoangviet1397/fotobro`. ⚠️ `support@fotobro.app` trong
   `PRIVACY.html` vẫn là địa chỉ **đang thiết lập, chưa có hộp mail
   thật** (`BACKUP-V2.md` §4) — cho tới khi có hộp mail thật, đây là
   một lỗ hổng trong quy trình tiếp nhận sự cố (xem §8, mục còn tồn
   tại). Người dùng báo sự cố qua kênh trong app; Việt trả lời trong
   vòng 24 giờ làm việc.

### 1.1. Thời hạn thông báo (GDPR — khi có dữ liệu EU)

Kế hoạch này áp dụng mốc GDPR vì đó là chuẩn chặt nhất và vì người
dùng FotoBro có thể chụp khách ở EU (khách du lịch, đám cưới ở châu
Âu) hoặc dùng tài khoản Google EU:

- **Thông báo cho cơ quan giám sát (GDPR Điều 33):** bên kiểm soát
  dữ liệu (ở đây là **nhiếp ảnh gia — người dùng**, không phải Việt)
  phải thông báo cho cơ quan giám sát **không chậm hơn 72 giờ** kể
  từ khi biết sự cố, nếu sự cố có thể gây rủi ro cho quyền/tự do
  của cá nhân. Nếu quá 72 giờ phải giải thích lý do chậm trễ.
- **Thông báo cho người bị ảnh hưởng (GDPR Điều 34):** thông báo
  **không chậm trễ** cho từng khách hàng bị ảnh hưởng khi sự cố có
  **rủi ro cao** (ví dụ: tên + SĐT + số tiền của họ đã lọt cho người
  lạ; email của họ đã bị đọc/gửi mạo danh). Thông báo bằng ngôn ngữ
  rõ ràng, nói rõ: chuyện gì xảy ra, dữ liệu nào, đã làm gì, họ nên
  làm gì.
- **Khi nào KHÔNG cần thông báo:** dữ liệu chỉ bị mất (không ai ngoài
  đọc được) và đã khôi phục được từ sao lưu; hoặc dữ liệu đã mã hoá
  mạnh mà khoá không lộ (không áp dụng cho v1 vì dữ liệu lưu
  plaintext — xem §0.2). Mất khả năng truy cập dữ liệu (availability)
  cũng là một dạng "personal data breach" theo GDPR — nếu mất dữ liệu
  gây rủi ro cao (ví dụ mất toàn bộ lịch chụp, lỡ hẹn khách), vẫn
  phải đánh giá nghĩa vụ thông báo, không được tự cho là "không sao".
- **Vai trò của Việt:** Việt không phải bên kiểm soát dữ liệu khách
  của người dùng, nên Việt không nộp báo cáo GDPR thay họ. Việc của
  Việt là (a) hướng dẫn họ đánh giá và thông báo đúng hạn, (b) nếu
  lỗi thuộc về app (ví dụ: lỗi code làm lộ token, lỗi xoá nhầm),
  Việt thông báo chung cho mọi người dùng qua cập nhật app + trang
  Privacy Policy **trong vòng 72 giờ** kể từ khi xác nhận lỗi, và
  (c) cung cấp đúng thông tin kỹ thuật (dữ liệu nào, từ khi nào) để
  họ điền vào báo cáo của mình.
- **Nếu không có dữ liệu EU** (toàn bộ khách và người dùng ở Việt Nam):
  vẫn áp dụng cùng mốc 72 giờ làm chuẩn nội bộ — nhanh là tốt, và
  Luật Bảo vệ dữ liệu cá nhân Việt Nam (Nghị định 13/2023) cũng yêu
  cầu thông báo cho cơ quan chức năng khi có vi phạm quy định bảo vệ
  dữ liệu cá nhân.

---

## 2. Kịch bản 1 — Mất máy (mất / bị trộm iPhone)

**Rủi ro thật:** dữ liệu lưu **plaintext** trong sandbox app, khoá
Face ID/PIN chỉ ẩn giao diện chứ không mã hoá dữ liệu (audit H1).
Ai cầm máy đã mở khoá — hoặc máy không đặt mật mã iPhone — là đọc
được toàn bộ sổ khách + tiền. PIN 4 số có thể bị đoán mò offline
nếu trích xuất được file khoá (audit M1).

### Phát hiện thế nào

- Người dùng tự phát hiện mất máy và báo cho Việt (qua kênh §1.1),
  hoặc phát hiện qua Find My khi định vị máy.
- Dấu hiệu phụ: thông báo đăng nhập lạ từ Apple ID / Google,
  job bị sửa hoặc email gửi đi mà người dùng không gửi (khi đó
  chuyển sang kịch bản 2).

### Bước xử lý 1-2-3

1. **Khoá và xoá máy từ xa — làm ngay, trong giờ đầu tiên.**
   Mở iCloud.com/find (hoặc app Tìm trên máy khác) → chọn iPhone
   bị mất → bật **Chế độ mất (Lost Mode)** → nếu không còn hy vọng
   lấy lại, bấm **Xoá iPhone (Erase)**. Đổi mật khẩu Apple ID ngay
   nếu nghi máy đã mở khoá. Đây là bước duy nhất có thể thực sự
   chặn người cầm máy đọc dữ liệu plaintext trong app.
2. **Cắt quyền Google — làm ngay sau bước 1.** Vào
   myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba
   → FotoBro → **Xoá quyền truy cập** (thu hồi cả access token và
   refresh token — xem §0.3, không trông chờ vào nút Ngắt kết nối
   trong app vì app đã nằm trên máy mất). Kiểm tra hộp thư Gmail
   đã gửi và Google Lịch xem có hoạt động lạ không. Nếu có, xử lý
   theo kịch bản 2 bước 2.
3. **Khôi phục trên máy mới + đánh giá mức lộ.** Trên iPhone mới:
   cài FotoBro → nhập file sao lưu JSON gần nhất (Cài đặt → Sao
   lưu → Mở bản sao lưu). Lưu ý: sao lưu v1 **không có ảnh trang
   chủ** — ảnh phải chọn lại (`BACKUP-V2.md` §1). Sau đó đánh giá:
   máy mất có đặt mật mã iPhone không? Có bật Face ID không? Nếu
   **có mật mã + máy khoá khi mất** → rủi ro thực tế thấp (dữ liệu
   được bảo vệ bằng mã hoá của iOS), ghi P2. Nếu **không có mật mã
   hoặc máy đang mở khoá khi mất** → coi như dữ liệu đã lộ, ghi P1
   và chuyển sang mục "Thông báo" dưới đây.

### Ai làm

- **Người dùng:** toàn bộ 3 bước (chỉ họ mới đăng nhập được
  iCloud/Google của họ và cầm file sao lưu của họ).
- **Việt:** hướng dẫn từng bước qua kênh liên hệ; nếu người dùng
  báo máy mất mà không có mật mã, Việt tư vấn đánh giá mức lộ và
  soạn thông báo cho khách của họ; không can thiệp được vào máy
  hay tài khoản của họ.

### Thông báo cho người bị ảnh hưởng

- **Ai thông báo:** người dùng (nhiếp ảnh gia) thông báo cho khách
  hàng của chính họ — Việt không biết khách của họ là ai.
- **Khi nào:** nếu đánh giá là P1 (máy không mật mã / đang mở khoá):
  thông báo cho các khách có trong sổ (tên, SĐT, email, số tiền)
  **trong vòng 72 giờ** kể từ khi biết mất máy, nếu có dữ liệu EU
  (GDPR Điều 33/34); kể cả khi không có dữ liệu EU, vẫn thông báo
  trong 72 giờ làm chuẩn nội bộ. Nội dung: máy bị mất ngày nào,
  dữ liệu nào có thể đã lộ (tên, SĐT, lịch chụp, số tiền), đã khoá
  và xoá máy từ xa, khách nên cảnh giác với tin nhắn/cuộc gọi mạo
  danh dùng đúng tên và lịch chụp của họ.
- **Nếu P2** (máy có mật mã, đã khoá + xoá từ xa kịp): không bắt buộc
  thông báo từng khách, nhưng nên nhắn chung cho các khách có lịch
  chụp sắp tới nếu việc mất máy làm lỡ hẹn hoặc mất liên lạc tạm thời.
- Mẫu câu chữ: xem §7, mẫu A.

### Ngăn lặp lại

- Bắt buộc đặt mật mã iPhone 6 số + Face ID (hướng dẫn trong app
  và trang hỗ trợ — đây là lớp bảo vệ duy nhất cho dữ liệu
  plaintext ở v1).
- Sao lưu định kỳ 7 ngày/lần (banner nhắc đã thiết kế trong
  `BACKUP-V2.md` §7); giữ file sao lưu ở nơi riêng, không để chung
  với máy.
- v1.1: mã hoá dữ liệu lúc lưu (AES-256-GCM, audit H1) + PIN sang
  PBKDF2 ≥100.000 vòng (audit M1) — khi đó mất máy không mật mã
  cũng không còn đọc được dữ liệu app.

---

## 3. Kịch bản 2 — Lộ token Google

**Rủi ro thật:** refresh token lưu **plaintext** trong `localStorage`
và **không được dùng để làm mới token** — một credential sống dài
hạn nằm ở nơi yếu nhất mà không mang lại lợi ích gì (audit H2).
Ngắt kết nối trong app chỉ thu hồi access token, refresh token phía
Google có thể vẫn sống (audit H3). Kẻ có token được quyền của đủ
6 scope: đọc Lịch/Gmail/Danh bạ/Drive, ghi lịch, gửi Gmail.

### Phát hiện thế nào

- Cảnh báo bảo mật của Google ("Có hoạt động đáng ngờ", "Đã đăng
  nhập từ thiết bị lạ") gửi tới email/tài khoản Google của người dùng.
- Người dùng thấy email đã gửi / sự kiện lịch / thư đã đọc mà mình
  không làm, hoặc thấy FotoBro vẫn kết nối trong
  myaccount.google.com dù đã bấm Ngắt kết nối.
- Việt phát hiện: lỗi code làm lộ token (ví dụ log/token lọt vào
  file sao lưu hoặc crash report) — khi đó Việt chủ động thông báo
  cho mọi người dùng theo §3 mục "Thông báo".

### Bước xử lý 1-2-3

1. **Thu hồi quyền tại Google — làm ngay, không qua app.**
   Vào myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ
   ba → FotoBro → **Xoá quyền truy cập**. Bước này thu hồi **cả**
   access token và refresh token. ⚠️ **Không** chỉ bấm "Ngắt kết
   nối" trong app — nút đó chỉ thu hồi access token (audit H3) cho
   tới khi H3 được sửa. Nếu nghi cả mật khẩu Google cũng lộ (phishing,
   máy nhiễm mã độc): đổi mật khẩu Google + bật xác minh 2 bước +
   "Đăng xuất khỏi tất cả thiết bị" trong cùng trang Bảo mật.
2. **Kiểm tra thiệt hại trong tài khoản Google.** Mở Gmail → mục
   Đã gửi: có email nào gửi đi mà người dùng không gửi không?
   Mở Google Lịch: có sự kiện lạ nào được tạo/xoá không? Mở Drive:
   có file nào bị chia sẻ/đổi quyền không? Xoá các email/sự kiện
   mạo danh, thu hồi các link chia sẻ lạ, và chụp lại màn hình làm
   bằng chứng cho nhật ký sự cố (§9).
3. **Dọn sạch trong app rồi đăng nhập lại.** Trên iPhone: mở FotoBro
   → Ngắt kết nối Google → kiểm tra dữ liệu Google đã tải
   (`gcal`/`gmail`/`gcontacts`) đã xoá khỏi máy chưa; nếu còn, xoá
   dữ liệu app và nhập lại từ sao lưu (lưu ý H5: nút "Xoá toàn bộ"
   hiện chưa xoá hết — xem §0.3). Sau đó đăng nhập Google lại từ
   đầu (OAuth PKCE mới, token mới, hết hạn sau ~1 giờ) và kiểm tra
   lại danh sách quyền đã cấp trong myaccount.google.com.

### Ai làm

- **Người dùng:** toàn bộ 3 bước (chỉ họ mới thu hồi được quyền trên
  tài khoản Google của họ).
- **Việt:** nếu nguyên nhân là lỗi app (H2/H3): xác minh, sửa code
  (bỏ lưu refresh token — phương án (a) của audit H2, rẻ nhất;
  revoke cả refresh token khi ngắt kết nối — audit H3), phát hành
  bản vá, và thông báo cho mọi người dùng theo mục dưới đây.

### Thông báo cho người bị ảnh hưởng

- **Ai thông báo:** người dùng thông báo cho khách hàng của mình
  nếu email/thông tin của khách đã bị đọc hoặc bị gửi mạo danh;
  Việt thông báo chung cho mọi người dùng FotoBro nếu lỗi thuộc
  về app.
- **Khi nào:** trong vòng **72 giờ** kể từ khi biết token đã lộ và
  có dữ liệu EU bị truy cập (GDPR Điều 33/34); chuẩn nội bộ 72 giờ
  áp dụng cả khi không có dữ liệu EU. Nội dung cho khách: email nào
  của họ có thể đã bị đọc, có email mạo danh nào gửi từ tài khoản
  của nhiếp ảnh gia không, họ nên làm gì (không bấm link trong
  email lạ, xác minh lại mọi yêu cầu chuyển tiền qua kênh khác).
- **Trường hợp lỗi thuộc về app:** Việt đăng thông báo trong ghi chú
  phát hành của bản vá + cập nhật Privacy Policy, nội dung gồm:
  lỗi gì, từ phiên bản nào, dữ liệu nào có thể bị ảnh hưởng, người
  dùng cần làm gì (thu hồi quyền tại myaccount.google.com rồi đăng
  nhập lại). Không gửi email riêng cho từng người dùng vì app không
  có tài khoản/email người dùng — đây là giới hạn cấu trúc của v1,
  ghi nhận ở §8.
- Mẫu câu chữ: xem §7, mẫu B.

### Ngăn lặp lại

- **Trước TestFlight (chặn):** sửa H2 + H3 theo `SECURITY-AUDIT.md`
  §7 — bỏ lưu refresh token (chỉ giữ access token trong
  `sessionStorage`, silent re-auth đã đủ), và revoke cả refresh
  token khi ngắt kết nối. Sau khi sửa, kịch bản này gần như biến
  mất: token dài hạn không còn tồn tại trong app.
- v1.1: cho người dùng chọn nhóm quyền trước khi đăng nhập (Lịch /
  Gmail / Drive — mặc định chỉ Lịch) thay vì xin đủ 6 scope 1 lần
  (audit H4), để token dù lộ cũng chỉ đọc được ít nhất có thể.
- Nhắc người dùng bật xác minh 2 bước cho tài khoản Google trong
  trang hỗ trợ.

---

## 4. Kịch bản 3 — Bản sao lưu JSON lọt ra ngoài

**Rủi ro thật:** sao lưu v1 là file **JSON plaintext, không mã hoá,
không chữ ký, không kiểm tra tính toàn vẹn** (audit M4). Ai cầm file
là đọc được hết tên khách + SĐT + email + số tiền từng job. File
thường được gửi qua chat/email/AirDrop để chuyển máy — mỗi lần gửi
là một lần có thể gửi nhầm người, nhầm nhóm, hoặc để lại bản sao
trên máy người khác / dịch vụ chat.

### Phát hiện thế nào

- Người dùng tự phát hiện: gửi nhầm file cho người khác, gửi vào
  nhóm chat chung, để file trong thư mục chia sẻ chung, máy tính
  dùng chung bị người khác mở, hoặc file đính kèm trong email bị
  chuyển tiếp.
- Người nhận lạ liên hệ lại ("sao bạn gửi tôi file này?") hoặc
  khách báo nhận được tin nhắn lạ dùng đúng thông tin job của họ.

### Bước xử lý 1-2-3

1. **Thu hồi file — làm ngay.** Xoá tin nhắn/email chứa file ở phía
   người gửi (thu hồi nếu ứng dụng chat cho phép); nếu file nằm trên
   link chia sẻ (Drive/iCloud link): tắt chia sẻ hoặc xoá file khỏi
   thư mục chia sẻ ngay; nhắn người nhận nhầm nhờ xoá file và xác
   nhận đã xoá (lưu lại xác nhận này). Lưu ý thẳng thắn: file đã
   tải về máy người khác thì **không thu hồi được triệt để** — phải
   đánh giá như dữ liệu đã lộ, không được tự trấn an là "đã thu hồi".
2. **Liệt kê dữ liệu trong file.** Mở lại bản sao lưu của chính mình
   (hoặc nhớ lại ngày xuất): file chứa bao nhiêu job, tên/SĐT/email
   của những khách nào, tổng số tiền, ngày xuất file. Ghi vào nhật
   ký sự cố (§9) — đây là danh sách người cần thông báo ở bước 3.
   Kiểm tra thêm: file có kèm ảnh không? (v1: **không** — ảnh sống
   riêng trong IndexedDB, `BACKUP-V2.md` §1 — đây là điểm may duy
   nhất của sao lưu v1.)
3. **Giảm thiệt hại tiếp theo.** File sao lưu không chứa mật khẩu
   hay token (chỉ jobs/txs/cfg), nên không có gì để "đổi mật khẩu"
   trong app. Việc cần làm: cảnh báo các khách trong file về nguy
   cơ bị mạo danh (kẻ xấu biết đúng tên, lịch chụp, số tiền cọc —
   đủ để giả làm studio nhắn tin đòi chuyển khoản); xuất một bản
   sao lưu mới và cất ở nơi an toàn, xoá các bản cũ đã gửi lung tung;
   từ nay chỉ chuyển file qua AirDrop trực tiếp hoặc Files trên máy
   mình, không gửi qua nhóm chat.

### Ai làm

- **Người dùng:** toàn bộ 3 bước (chỉ họ mới biết file đã gửi đi
  đâu và cầm danh sách khách trong file).
- **Việt:** tư vấn cách thu hồi theo từng kênh (Messenger, email,
  Drive, AirDrop); nếu nhiều người dùng cùng gặp (ví dụ lỗi app tự
  chia sẻ file), Việt sửa code + phát hành bản vá.

### Thông báo cho người bị ảnh hưởng

- **Ai thông báo:** người dùng thông báo trực tiếp cho từng khách có
  trong file (nhắn tin/gọi/email — dùng kênh họ vẫn liên lạc với
  khách), vì chỉ họ mới biết khách của mình.
- **Khi nào:** **trong vòng 72 giờ** kể từ khi biết file đã lọt ra
  ngoài, nếu có dữ liệu EU trong file (GDPR Điều 34 — rủi ro cao vì
  dữ liệu plaintext đã tới tay người lạ, kể cả khi người lạ "tình
  cờ" nhận được). Chuẩn nội bộ 72 giờ áp dụng cả khi không có dữ
  liệu EU. Nội dung: file sao lưu chứa tên/SĐT/lịch chụp/số tiền
  của họ đã gửi nhầm cho người khác ngày nào, đã thu hồi/xoá tới
  đâu, họ nên cảnh giác với tin nhắn đòi tiền mạo danh studio, và
  studio sẽ chỉ liên lạc qua số/kênh quen thuộc.
- Mẫu câu chữ: xem §7, mẫu C.

### Ngăn lặp lại

- **Ưu tiên v1.1:** triển khai sao lưu v2 mã hoá theo `BACKUP-V2.md`
  (AES-256-GCM + PBKDF2 100.000 vòng, mật khẩu do người dùng đặt,
  tối thiểu 8 ký tự, mất mật khẩu là mất bản sao lưu — cần Việt
  chốt). File mã hoá lọt ra ngoài cũng không đọc được.
- Cho tới lúc đó: trong app và trang hỗ trợ, ghi rõ cảnh báo 1 dòng
  khi xuất sao lưu — "File này đọc được luôn, ai cầm file là thấy
  tên khách và số tiền. Chỉ gửi cho chính mình, xoá sau khi chuyển
  máy xong." Nhắc sao lưu 7 ngày/lần nhưng **không** nhắc gửi file
  qua chat.
- Không bao giờ đính kèm file sao lưu vào email gửi cho Việt hay
  bộ phận hỗ trợ khi báo lỗi — chỉ gửi mô tả lỗi.

---

## 5. Kịch bản 4 — Lỗi app xoá nhầm dữ liệu

**Rủi ro thật:** có hai dạng. (a) Lỗi phần mềm: khôi phục file sao
lưu thay thế toàn bộ dữ liệu hiện tại (`BACKUP-V2.md` §6), nhập
nhầm file cũ/file rác, hoặc cập nhật app lỗi làm mất dữ liệu.
(b) Người dùng bấm nhầm "Xoá toàn bộ dữ liệu" — và nút này hiện
**không xoá hết** (audit H5), nên thiệt hại thực tế là mất jobs/txs
nhưng ảnh/token/cài đặt còn lại, gây nhầm lẫn khi khôi phục. Thêm
nữa: gỡ app khỏi iPhone là mất toàn bộ localStorage + IndexedDB
(audit §6) — không có bản sao nào trên cloud ở v1.

### Phát hiện thế nào

- Người dùng mở app thấy job/tiền biến mất, hoặc số lượng job ít
  hơn hẳn sau khi cập nhật/khôi phục/xoá.
- Việt phát hiện qua báo lỗi của người dùng (không có telemetry nên
  Việt không tự thấy được), hoặc tự tái hiện lỗi khi test bản mới.

### Bước xử lý 1-2-3

1. **Dừng mọi thao tác ghi — làm ngay.** Không nhập thêm file sao
   lưu khác, không tạo job mới đè lên, không gỡ và cài lại app
   (gỡ app là xoá sạch sandbox, audit §6). Chụp màn hình màn Hôm
   nay + Cài đặt (phiên bản app) làm bằng chứng. Nếu vừa khôi phục
   nhầm file: app đã tự lưu bản dự phòng của dữ liệu trước khi ghi
   đè theo thiết kế `BACKUP-V2.md` §6 mục 4 — kiểm tra và khôi phục
   từ bản dự phòng đó trước.
2. **Khôi phục từ bản sao lưu gần nhất.** Cài đặt → Sao lưu → Mở
   bản sao lưu → chọn file `fotobro-sao-luu.json` (v1) hoặc
   `fotobro-backup-YYYYMMDD.json` (v2) gần nhất. Kiểm tra kỹ bản
   xem trước (số job, số khoản thu chi, ngày xuất) rồi mới xác nhận
   — khôi phục là thay thế toàn bộ, không gộp. Lưu ý: file v1
   **không có ảnh** và không có `checkDone`/`uid` — khôi phục xong
   ảnh trang chủ vẫn trống, phải chọn lại ảnh; file v1 cũ giữ
   `uid`/`checkDone` hiện tại. Nếu không có file sao lưu: thử khôi
   phục từ bản sao lưu iPhone (iCloud/Finder backup) — toàn bộ
   sandbox app nằm trong đó; hoặc dựng lại lịch chụp từ Google
   Lịch / email khách làm nguồn đối chiếu.
3. **Báo lỗi cho Việt để sửa gốc.** Gửi cho Việt: phiên bản app,
   thao tác ngay trước khi mất dữ liệu (cập nhật / khôi phục /
   bấm xoá / nhập file), file sao lưu đã dùng (chỉ tên file + ngày
   xuất — **không gửi nội dung file**), và ảnh chụp màn hình.
   Việt tái hiện lỗi, sửa code, phát hành bản vá; nếu lỗi do bản
   cập nhật gây ra cho nhiều người, Việt đăng thông báo trong ghi
   chú phát hành của bản vá.

### Ai làm

- **Người dùng:** bước 1 và 2 (chỉ họ mới có file sao lưu và máy
  của họ).
- **Việt:** bước 3 — tái hiện, sửa, phát hành bản vá; hướng dẫn
  khôi phục từng trường hợp qua kênh liên hệ.

### Thông báo cho người bị ảnh hưởng

- **Đây chủ yếu là sự cố mất dữ liệu (availability), không phải lộ
  dữ liệu.** Nếu khôi phục được đầy đủ từ sao lưu và không lỡ hẹn
  khách nào: không cần thông báo từng khách, chỉ ghi nhật ký sự cố.
- **Nếu mất dữ liệu gây lỡ hẹn / mất liên lạc với khách** (ví dụ mất
  lịch chụp ngày mai): người dùng liên hệ ngay các khách bị ảnh
  hưởng để hẹn lại, giải thích ngắn gọn là lỗi kỹ thuật, không cần
  nêu chi tiết nội bộ. Nếu mất dữ liệu là mất vĩnh viễn và có dữ
  liệu EU: đánh giá nghĩa vụ thông báo theo GDPR — mất dữ liệu cá
  nhân cũng là breach, thông báo cho cơ quan giám sát trong 72 giờ
  nếu có rủi ro cho quyền/tự do của cá nhân (xem §1.1).
- **Nếu lỗi do app và ảnh hưởng nhiều người dùng:** Việt thông báo
  chung trong ghi chú phát hành bản vá + cập nhật trang hỗ trợ
  trong vòng 72 giờ kể từ khi xác nhận lỗi.

### Ngăn lặp lại

- Nhắc sao lưu 7 ngày/lần (banner trên màn Hôm nay, `BACKUP-V2.md`
  §7) — đây là biện pháp duy nhất cứu được dữ liệu ở v1 vì không
  có cloud.
- Triển khai sao lưu v2 (`BACKUP-V2.md`): khôi phục có bản xem trước
  + tự lưu bản dự phòng trước khi ghi đè + từ chối file rác trước
  khi ghi đè (không bao giờ xoá dữ liệu hiện tại chỉ vì đọc file lỗi).
- Sửa H5 trước TestFlight: viết hàm `wipeAll()` duy nhất, xoá thật
  ảnh IndexedDB + token Google + dữ liệu Google đã tải + khoá (hỏi
  riêng) + logo, và báo rõ "file sao lưu đã tải về không xoá được
  từ trong app".
- Trước mỗi bản phát hành: test ca khôi phục (xuất → nhập lại tròn)
  và ca xoá trên TestFlight theo checklist `RISKS.md` §10.

---

## 6. Kịch bản 5 — Lộ ảnh khách

**Rủi ro thật — cần nói đúng:** ảnh khách chụp thật **không nằm
trong app**. App chỉ lưu (a) ảnh trang chủ do người dùng tự chọn
(tối đa 60, JPEG ~1400px, EXIF đã bị lược), và (b) link thư mục
Drive do người dùng dán (`driveLink` — chỉ là chuỗi URL). App không
upload ảnh đi đâu, không đồng bộ ngầm, không backup tự động lên
cloud (audit §5). Vì vậy "lộ ảnh khách" ở v1 chỉ xảy ra qua 3 đường
sau — kế hoạch này xử lý đúng 3 đường đó, không xử lý một đường
không tồn tại:

### Các đường lộ thực tế

| Đường lộ | Cách xảy ra | Mức |
|---|---|---|
| A. Ảnh khách được dùng làm ảnh trang chủ | Người dùng chọn ảnh chụp khách làm ảnh nền màn Hôm nay → ảnh hiện mỗi khi mở app, có thể lọt vào ảnh chụp màn hình / quay màn hình / người ngoài nhìn qua vai | P2 |
| B. Link Drive bị chia sẻ sai | Người dùng dán link thư mục Drive của job rồi gửi link đó nhầm người, hoặc thư mục Drive đang để chế độ "bất kỳ ai có link cũng xem được" | P1 nếu thư mục chứa ảnh gốc của khách |
| C. Ảnh trong file sao lưu (tương lai) | Sao lưu v2 có kèm ảnh trang chủ (`BACKUP-V2.md` §2.1) — nếu file v2 lọt ra ngoài thì ảnh đi theo file (xử lý như kịch bản 3 + mục này) | P1–P2 tuỳ ảnh |

(Không thuộc kịch bản này: tên khách hiện trên màn hình khoá qua
thông báo nhắc lịch — audit M5 — đó là lộ *thông tin* chứ không phải
lộ ảnh; xử lý bằng cách tắt preview thông báo trong Cài đặt iPhone
→ Thông báo → FotoBro, và dự kiến tuỳ chọn ẩn tên khách ở v1.1.)

### Phát hiện thế nào

- Đường A: người dùng tự phát hiện khi cho người khác xem máy,
  hoặc ảnh trang chủ xuất hiện trong ảnh chụp màn hình gửi đi.
- Đường B: khách báo "sao có người lạ xem được ảnh của em", hoặc
  người dùng kiểm tra lại quyền chia sẻ Drive thấy đang mở công khai.
- Đường C: như kịch bản 3 (phát hiện file sao lưu lọt ra ngoài).

### Bước xử lý 1-2-3

1. **Ngừng lộ ngay.**
   - Đường A: vào app → gỡ ảnh đó khỏi ảnh trang chủ (xoá khỏi
     IndexedDB `troLyXeoPhotos`); kiểm tra các ảnh chụp màn hình /
     video quay màn hình đã gửi đi có chứa ảnh đó không.
   - Đường B: vào Google Drive → mở thư mục ảnh của job → Chia sẻ
     → chuyển về "Chỉ những người được thêm" hoặc gỡ quyền của
     người nhận nhầm; nếu link đã phát tán rộng thì tạo bản sao
     thư mục mới với link mới và xoá thư mục cũ.
   - Đường C: xử lý như kịch bản 3 bước 1 (thu hồi file sao lưu).
2. **Xác định phạm vi.** Ảnh nào, của khách nào, đã lộ cho ai, từ
   khi nào (đường B: xem lịch sử hoạt động của thư mục Drive;
   đường A: nhớ lại ai đã nhìn thấy màn hình). Ghi vào nhật ký
   sự cố (§9). Nếu ảnh đã bị tải về / phát tán tiếp (đăng lại,
   gửi tiếp) thì ghi rõ — lúc này thu hồi triệt để là không thể.
3. **Thông báo và khắc phục với khách.** Người dùng liên hệ trực
   tiếp khách bị ảnh hưởng: xin lỗi, nói rõ ảnh nào đã lộ, đã
   chặn tới đâu, và hỏi khách muốn xử lý thêm gì (ví dụ: đổi link
   giao ảnh, gỡ ảnh khỏi album online). Nếu ảnh đã phát tán rộng:
   nhờ khách cùng báo cáo gỡ trên nền tảng đã phát tán. Tuyệt đối
   không đổ lỗi cho khách ("tại bạn gửi link") và không hứa "đã
   xoá hết" khi chưa chắc chắn.

### Ai làm

- **Người dùng:** toàn bộ 3 bước (chỉ họ mới cầm ảnh, link Drive
  và quan hệ với khách của họ).
- **Việt:** tư vấn cách thu hồi quyền Drive / gỡ ảnh; nếu lỗi thuộc
  về app (ví dụ app tự chia sẻ ảnh), sửa code + phát hành bản vá +
  thông báo chung.

### Thông báo cho người bị ảnh hưởng

- **Ai thông báo:** người dùng thông báo trực tiếp cho khách có ảnh
  bị lộ.
- **Khi nào:** ngay khi xác định được phạm vi (mục tiêu trong 24 giờ,
  tối đa **72 giờ** kể từ khi biết sự cố nếu có dữ liệu EU — GDPR
  Điều 34, vì ảnh là dữ liệu cá nhân nhạy cảm, rủi ro cao). Ảnh
  cưới/chân dung bị lộ có thể gây tổn hại danh tiếng — không được
  chần chừ với lý do "để xem đã". Nội dung: ảnh nào, lộ qua đường
  nào, đã chặn ra sao, khách có thể làm gì thêm (báo cáo gỡ, đổi
  mật khẩu album nếu có).
- Mẫu câu chữ: xem §7, mẫu D.

### Ngăn lặp lại

- **Không dùng ảnh khách làm ảnh trang chủ.** Chỉ dùng ảnh phong
  cảnh / ảnh mẫu không nhận diện được người, hoặc ảnh của chính
  studio. Ghi quy tắc này vào trang hỗ trợ + màn chọn ảnh trong app.
- Link Drive của job để chế độ riêng tư mặc định ("Chỉ những người
  được thêm"), chỉ mở link khi giao ảnh và thu hồi sau khi khách
  đã tải xong.
- Sao lưu v2 mã hoá (`BACKUP-V2.md` §4) sẽ bảo vệ cả ảnh trong file
  sao lưu khi tính năng này lên v1.1.
- Tắt preview thông báo trên màn hình khoá nếu máy hay để người
  khác nhìn thấy (Cài đặt iPhone → Thông báo → FotoBro → tắt
  "Hiển thị bản xem trước").

---

## 7. Mẫu thông báo cho người bị ảnh hưởng

Dùng nguyên văn hoặc sửa tên/ngày cho khớp thực tế. Giữ giọng xin
lỗi, nói rõ sự việc, không đổ lỗi, không hứa quá mức. Bản tiếng Anh
ngắn gọn kèm theo cho khách nước ngoài.

### Mẫu A — Mất máy (kịch bản 1, P1)

> Chào [tên khách], mình là [tên studio]. Mình viết tin này để báo
> một sự việc: điện thoại làm việc của mình bị mất ngày [ngày].
> Trong máy có lưu tên, số điện thoại, lịch chụp và số tiền cọc của
> bạn. Mình đã khoá máy và xoá dữ liệu từ xa ngay khi phát hiện.
> Mình chưa có bằng chứng là ai đó đã đọc được dữ liệu, nhưng để
> chắc chắn, bạn cảnh giác giúp mình: nếu có ai nhắn tin/gọi điện
> xưng là studio và nhắc đúng lịch chụp của bạn để hỏi thêm thông
> tin hoặc yêu cầu chuyển tiền, đó không phải là mình — bạn kiểm
> tra lại với mình qua số [số quen thuộc] trước khi làm theo.
> Mình xin lỗi vì sự bất tiện này. [Tên studio]

### Mẫu B — Lộ token Google (kịch bản 2)

> Chào [tên khách], mình là [tên studio]. Tài khoản Google làm việc
> của mình vừa bị truy cập trái phép trong khoảng [thời gian]. Kẻ
> xấu có thể đã đọc được email trao đổi giữa chúng mình và/hoặc gửi
> email mạo danh mình. Mình đã thu hồi toàn bộ quyền truy cập và
> đổi mật khẩu. Bạn giúp mình: không bấm link và không chuyển tiền
> theo bất kỳ email nào nhận được từ địa chỉ của mình trong khoảng
> thời gian trên nếu chưa xác minh lại với mình qua [kênh quen
> thuộc]. Mình xin lỗi vì chuyện này. [Tên studio]

### Mẫu C — File sao lưu lọt ra ngoài (kịch bản 3)

> Chào [tên khách], mình là [tên studio]. Mình báo một sự việc:
> ngày [ngày], file sao lưu công việc của mình (có tên, số điện
> thoại, lịch chụp và số tiền của bạn) đã gửi nhầm cho người khác.
> Mình đã thu hồi và nhờ người nhận xoá file ngay khi phát hiện.
> Bạn cảnh giác giúp mình với các tin nhắn lạ nhắc đúng lịch chụp
> hoặc số tiền cọc của bạn để yêu cầu chuyển tiền — studio chỉ
> liên lạc với bạn qua [kênh quen thuộc]. Mình xin lỗi vì sự cố
> này. [Tên studio]

### Mẫu D — Lộ ảnh khách (kịch bản 5)

> Chào [tên khách], mình là [tên studio]. Mình rất tiếc phải báo:
> [ảnh/ album ảnh] của bạn đã bị lộ ra ngoài qua [đường lộ: link
> Drive chia sẻ nhầm / ảnh hiện trên màn hình khi...] vào ngày
> [ngày]. Mình đã [thu hồi link / gỡ ảnh] ngay khi phát hiện.
> Mình xin lỗi vì chuyện này và sẽ [biện pháp cụ thể: giao lại ảnh
> qua link mới riêng tư / hỗ trợ bạn báo cáo gỡ ảnh ở...]. Bạn cho
> mình biết nếu bạn muốn mình làm thêm gì khác. [Tên studio]

### English short version (cho khách nước ngoài)

> Hi [name], this is [studio]. I need to let you know about a data
> incident on [date]: [your contact details and booking information
> / your photos] may have been exposed when [my phone was lost / a
> backup file was sent to the wrong person / a Drive link was shared
> by mistake]. I have [locked and erased the phone / revoked access /
> removed the link] immediately. Please be cautious of any message
> using your booking details to ask for payment — verify with me
> first at [usual contact]. I sincerely apologize. [Studio]

---

## 8. Những gì KHÔNG thuộc kế hoạch này — và điều kiện để kế hoạch này đủ dùng

### 8.1. Kịch bản không tồn tại ở v1

- **Rò rỉ dữ liệu phía server FotoBro:** không tồn tại vì không có
  server. Nếu sau này bật CloudKit Nấc 2, kế hoạch này phải được
  viết lại phần server: lúc đó dữ liệu nằm trong iCloud container
  `iCloud.com.fotobro.app` của từng người dùng, mã hoá đầu cuối
  AES-256-GCM (`CLOUDKIT-PLAN.md`) — Apple giữ ciphertext, Việt
  vẫn không đọc được nội dung. Kịch bản server khi đó là: lộ khoá
  mã hoá / lộ Apple ID của người dùng / Apple thông báo breach —
  xử lý theo quy trình của Apple + thu hồi khoá mã hoá.
- **Tấn công vào app qua mạng:** app không mở cổng, không có API,
  `connect-src` trong CSP chỉ cho phép Google APIs (audit M3).
  Đường tấn công mạng duy nhất ở v1 là qua tài khoản Google (kịch
  bản 2) hoặc qua file sao lưu người dùng tự chia sẻ (kịch bản 3).

### 8.2. Việc phải làm trước TestFlight để kế hoạch này không bị thủng

Lấy từ checklist `SECURITY-AUDIT.md` §7 — các mục liên quan trực
tiếp tới ứng phó sự cố:

- [ ] Sửa H2: bỏ lưu refresh token (hoặc viết luồng refresh thật +
  Keychain). Nếu không sửa, kịch bản 2 vẫn có "đạn thật" nằm
  plaintext trong app.
- [ ] Sửa H3: revoke cả refresh token khi ngắt kết nối + sửa câu chữ
  trong app/PRIVACY. Nếu không sửa, bước 1 của kịch bản 2 bắt buộc
  phải làm tay tại myaccount.google.com.
- [ ] Sửa H5: hàm `wipeAll()` xoá thật ảnh IndexedDB + token Google
  + dữ liệu Google đã tải + khoá + logo.
- [ ] Đồng bộ PRIVACY.md = PRIVACY.html = code thật (audit L3) —
  đặc biệt câu về refresh token và "Xoá toàn bộ". Thông báo sự cố
  mà trích sai Privacy Policy sẽ làm mất lòng tin và có thể vi
  phạm cam kết đã công bố.
- [ ] Có hộp mail hỗ trợ thật thay cho `support@fotobro.app`
  placeholder, hoặc ghi rõ kênh liên hệ sự cố trong app (Cài đặt →
  Liên hệ) trước khi nộp App Store — nếu không, người dùng không
  có đường nào báo sự cố cho Việt.
- [ ] Thay scheme placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID`
  trong Info.plist bằng reversed client ID thật (audit L1) — nếu
  không, Google OAuth lỗi và kịch bản 2 không kiểm chứng được.

### 8.3. Diễn tập (rẻ, nên làm 1 lần trước khi phát hành)

Việt tự chạy 3 ca diễn tập trên máy test (không cần người dùng thật):

1. Mất máy giả định: bật Lost Mode + xoá từ xa trên iPhone test,
   thu hồi quyền Google tay, khôi phục từ file sao lưu — đo thời
   gian từng bước.
2. Lộ token giả định: thu hồi quyền tại myaccount.google.com, kiểm
   tra Gmail Đã gửi / Lịch có hoạt động lạ không, đăng nhập lại.
3. Xoá nhầm giả định: tạo vài job test → bấm "Xoá toàn bộ" → kiểm
   tra còn sót gì (đối chiếu audit H5) → khôi phục từ sao lưu.

Ghi kết quả diễn tập vào nhật ký (§9). Nếu ca nào làm không được
trong 30 phút thì kế hoạch cần sửa lại cho thực tế hơn.

---

## 9. Nhật ký sự cố (mẫu ghi tay)

Vì app không có log tập trung, mỗi sự cố ghi 1 dòng vào file này
(hoặc sổ riêng của Việt). Không ghi dữ liệu khách hàng cụ thể vào
nhật ký chung — chỉ ghi loại dữ liệu và số lượng người ảnh hưởng.

| Trường | Ghi gì |
|---|---|
| Mã sự cố | `INC-YYYYMMDD-01` (đánh số tăng dần trong ngày) |
| Ngày giờ phát hiện | Giờ Việt Nam, ghi rõ ai phát hiện (người dùng / Google / Việt) |
| Kịch bản | Số kịch bản (§2–§6) + mức P1/P2/P3 |
| Dữ liệu liên quan | Loại dữ liệu (job/tiền/token/ảnh...), số người ảnh hưởng (ước lượng), có dữ liệu EU không |
| Bước đã làm | Liệt kê theo 1-2-3, kèm giờ thực hiện từng bước |
| Thông báo | Đã thông báo cho ai, bằng kênh nào, lúc nào; có trong hạn 72h không |
| Nguyên nhân gốc | Lỗi app / lỗi người dùng / mất máy / tài khoản Google — ghi rõ, không đoán |
| Ngăn lặp lại | Việc sửa code / sửa tài liệu / nhắc người dùng — ghi rõ làm xong chưa |
| Trạng thái | Đang xử lý / Đã xử lý / Đang theo dõi |

---

## 10. Báo cáo 7 mục (Quy trình Vibe Coding)

1. **Mục tiêu:** Viết kế hoạch ứng phó sự cố dữ liệu cho FotoBro
   iOS v1 — đúng rủi ro thật của app (local-first, không máy chủ,
   dữ liệu plaintext trên máy người dùng, token Google lưu local,
   sao lưu JSON plaintext ở v1, CloudKit chưa bật), gồm 5 kịch bản
   (mất máy, lộ token Google, bản sao lưu lọt ra ngoài, lỗi app
   xoá nhầm dữ liệu, lộ ảnh khách), mỗi kịch bản có cách phát hiện,
   bước xử lý 1-2-3, người thực hiện (Việt là người duy nhất vận
   hành v1), cách thông báo cho người bị ảnh hưởng và thời hạn
   (GDPR 72h nếu có dữ liệu EU), biện pháp ngăn lặp lại; ghi rõ v1
   không có sự cố rò rỉ phía server.
2. **Đã thực hiện:** Đọc kỹ `SECURITY-AUDIT.md` (toàn bộ 8 mục, gồm
   bản đồ dữ liệu §1, 5 rủi ro cao H1–H5, 6 trung bình, 4 thấp),
   `PRIVACY.html` (toàn bộ 9 mục + English summary),
   `BACKUP-V2.md` (định dạng file, mã hoá, tách ảnh 25 MB, luồng
   nhập/khôi phục, nhắc 7 ngày), và `RISKS.md` (đối chiếu, đặc biệt
   §5 chuyển dữ liệu và §10 checklist TestFlight). Chỉ viết 1 file
   mới duy nhất `~/workspace/fotobro-ios-v1/batch-legal/INCIDENT-PLAN.md`.
   Không sửa bất kỳ file nào khác, không tạo tài khoản, không push
   GitHub.
3. **Kết quả kiểm tra:** File kế hoạch hoàn thành với: phạm vi và
   bản đồ dữ liệu v1 (§0), quy tắc chung + mốc GDPR 72h (§1), đủ 5
   kịch bản yêu cầu (§2–§6, mỗi kịch bản đủ 5 thành phần: phát
   hiện, bước 1-2-3, ai làm, thông báo + thời hạn, ngăn lặp lại),
   4 mẫu thông báo VI + 1 bản EN ngắn (§7), mục "kịch bản không tồn
   tại ở v1" + checklist chặn trước TestFlight + diễn tập (§8), mẫu
   nhật ký sự cố (§9). Mọi con số và hành vi trong file đều có căn
   cứ trong 4 file đã đọc (ví dụ: token hết hạn ~1 giờ, PIN 4–6 số
   SHA-256, ảnh tối đa 60, sao lưu v1 không có ảnh, khôi phục là
   thay thế toàn bộ).
4. **Vấn đề còn tồn tại:**
   - (a) **PRIVACY.html lệch code thật ở 2 điểm** (§0.3): refresh
     token và "Xoá toàn bộ". Kế hoạch này viết theo code thật; nếu
     ai đó xử lý sự cố theo PRIVACY.html sẽ bỏ sót bước thu hồi
     refresh token và tưởng đã xoá sạch dữ liệu. Cần sửa H2/H3/H5
     + đồng bộ tài liệu trước TestFlight.
   - (b) **Chưa có hộp mail hỗ trợ thật:** `support@fotobro.app`
     vẫn là placeholder đang thiết lập — người dùng chưa có đường
     báo sự cố chắc chắn cho Việt (§1, §8.2).
   - (c) **Không có kênh thông báo hàng loạt cho người dùng:** app
     không có tài khoản/email người dùng nên nếu lỗi thuộc về app,
     Việt chỉ thông báo được qua ghi chú phát hành + Privacy Policy,
     không gửi riêng từng người (§3, §5).
   - (d) **Chưa kiểm chứng trên iPhone thật:** các bước khoá máy từ
     xa, thu hồi token, khôi phục từ sao lưu đều là quy trình trên
     giấy — cần diễn tập 3 ca ở §8.3 trước khi phát hành.
   - (e) Kế hoạch này giả định người dùng biết dùng myaccount.google.com
     và iCloud.com/find; người dùng không rành công nghệ sẽ cần Việt
     hướng dẫn trực tiếp từng bước.
5. **Điều kiện chuyển bước:** Việt đọc và chốt 2 điểm: (1) có đồng ý
   với cách phân vai ở §0.4 không — người dùng (nhiếp ảnh gia) là
   bên kiểm soát dữ liệu khách của họ và là người thông báo cho
   khách của họ, Việt chỉ hỗ trợ + sửa app; (2) có chấp nhận mốc
   thông báo 72 giờ làm chuẩn nội bộ cho cả trường hợp không có dữ
   liệu EU không. Sau đó sửa H2/H3/H5 + đồng bộ PRIVACY rồi mới đưa
   kế hoạch này vào bộ hồ sơ pháp lý nộp App Store (cùng PRIVACY.html).
6. **Bước tiếp theo:** (1) Việt chốt 2 điểm ở mục 5; (2) agent chính
   sửa H2/H3/H5 + L1/L3 theo checklist `SECURITY-AUDIT.md` §7 rồi
   cập nhật lại §0.3 và các bước thu hồi trong file này cho khớp
   code mới (lúc đó bước thu hồi token trong app sẽ đủ, không cần
   làm tay tại myaccount.google.com nữa); (3) lập hộp mail hỗ trợ
   thật; (4) Việt chạy diễn tập 3 ca ở §8.3 và ghi kết quả vào
   nhật ký §9; (5) khi bật CloudKit Nấc 2, viết lại §8.1 cho kịch
   bản phía server.
7. **Trạng thái:** Hoàn thành bản kế hoạch trên giấy, dựa trên file
   thật đã đọc. Chưa phải quy trình đã diễn tập, chưa sửa gì trong
   app, chưa gửi cho Apple/Google.


---

## Ghi chú cập nhật — các mục pháp lý đã sửa trong code (20/11/2026, agent chính)

- **H2/H3/H5:** đã sửa trong code (xem ghi chú cập nhật cuối `SECURITY-AUDIT.md`):
  không lưu refresh token; ngắt kết nối revoke cả 2 token; `wipeAll()` chờ
  revoke + xoá IndexedDB xong mới reload (race 3 giây).
- **Nhắc lịch:** `__trolyxeoScheduleReminder` / `__trolyxeoCancelReminder`
  trong bridge trước đây không chỗ nào gọi — nay đã gọi: lên lịch khi lưu job
  (qua `scheduleJobReminders()`), huỷ nhắc khi huỷ/xoá job. Thêm sheet giải
  thích trước khi xin quyền Thông báo (nhắc 12 tiếng trước giờ chụp, 1 ngày
  trước hạn giao, tên khách hiện trên màn hình khoá), theo dõi `cfg.notifAsked`.
  Thời gian nhắc đã thống nhất **12 tiếng** (bridge trước đây 60 phút).
- **Liên hệ:** đã thêm mục "Liên hệ" trong Cài đặt (`mailto:support@fotobro.app`,
  ghi rõ email đang thiết lập, chưa gửi được ngay).
- **PrivacyInfo.xcprivacy:** đã tạo `ios/App/App/PrivacyInfo.xcprivacy`
  (tracking false, không thu thập dữ liệu, UserDefaults CA92.1 qua
  `@capacitor/preferences`) + thêm vào target trong `project.pbxproj`.
- **Google ở bản TestFlight v2.0:** TẮT (chưa có Client ID thật) — trong app
  (mục Google trong Cài đặt + `openGGuide()`) và tài liệu đã ghi rõ, không khai
  thu thập dữ liệu Google ở bản này.
- **Rà lại bản web cũ:** 6 phòng ban Sen/Nắng/Mây/Lúa/Trăng/Đèn là tính năng
  lõi "Phòng ban" còn giữ theo thiết kế (không phải xác web cũ); nút
  Messenger/Facebook/Zalo là deep link liên hệ khách có chủ đích (không API);
  tông vintage (hoa/cánh hoa, nền kem/hồng) đã bỏ trong đợt UX Apple Music.
  Không còn gì để dọn thêm ở mục này.
