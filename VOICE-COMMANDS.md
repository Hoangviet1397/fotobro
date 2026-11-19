# FotoBro — Lệnh giọng nói tiếng Việt

Trạng thái: **tài liệu thiết kế + đối chiếu code thật (20/11/2026)** — không phải code chạy được.
Nguồn đối chiếu: `~/workspace/fotobro-ios-v1/www/index.html`
(hàm `runCommand`, `runVoiceCommand`, `answer`, `parseAmount`, `voiceCategory`,
`startListening`, `speak`, `QUICK_QS`) và `RISKS.md` mục 4.

## Trạng thái mic ở v1 — đọc trước khi dùng bảng lệnh

- **App iOS v1 (native, Capacitor 8): mic BỊ DỜI SANG v1.1.**
  Plugin `@capacitor-community/speech-recognition@7.0.1` chỉ có `.podspec`,
  không có `Package.swift`, nên build SPM của Capacitor 8 không link được
  (xem `RISKS.md` mục 4). Code v1 đã chặn mic trong app native:
  bấm micro trong app iOS sẽ hiện
  “Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha”.
- **Bản web: mic vẫn chạy** qua Web Speech API
  (`window.SpeechRecognition || window.webkitSpeechRecognition`, ngôn ngữ `vi-VN`).
  Khi mic dời, **toàn bộ 10 lệnh dưới đây vẫn dùng được bằng cách GÕ TAY**
  trong tab Trợ lý — cùng một parser (`runCommand` / `answer`), không mất lệnh nào.
- Khi mic trở lại ở v1.1, cần thêm quyền iOS
  (`NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`)
  và lưu ý: `SFSpeechRecognizer` của Apple xử lý giọng nói qua máy chủ Apple,
  không phải hoàn toàn trên máy — ghi rõ trong Privacy Policy trước khi bật.

## Cách mic hoạt động (bản web / v1.1)

1. Bấm nút micro (màn hình Hôm nay hoặc tab Trợ lý).
   App hiện “Đang nghe… bạn nói đi”.
2. App hiện lại đúng câu vừa nghe trong thẻ xác nhận, ví dụ: `“chi makeup 2 triệu”`.
3. Người dùng chọn 1 trong 3:
   - **Làm đi** — chạy lệnh.
   - **Nói lại** — nghe lại từ đầu.
   - **Sửa** — đưa câu vừa nghe xuống ô gõ tay để sửa rồi gửi.
4. **Không lệnh nào chạy lặng lẽ:** lệnh ghi sổ / thêm job chỉ chạy sau khi
   bấm “Làm đi”; kết quả hiện thành bong bóng chat + toast, và app **đọc to**
   câu trả lời bằng giọng Việt (`speechSynthesis`, `lang: 'vi-VN'`).
5. Lỗi mic hiện thông báo gõ tay thay thế:
   - Chưa cấp quyền micro → “Chưa được cấp quyền micro — gõ câu hỏi cũng được”.
   - Không nghe rõ → “Chưa nghe rõ — bấm micro nói lại nha”.
   - Máy không hỗ trợ → “Máy này chưa nghe được giọng nói — gõ câu hỏi nha”.

## Quy tắc hiểu câu nói (áp dụng cả nói lẫn gõ)

- **Không cần dấu:** app chuẩn hoá câu bằng `norm()` (bỏ dấu, `đ` → `d`),
  nên “chi makeup 2 trieu” = “chi makeup 2 triệu”.
- **Số tiền hiểu được:** `2 triệu` / `2tr` (= 2.000.000₫),
  `2 triệu rưỡi` (= 2.500.000₫), `500 nghìn` / `500k` (= 500.000₫),
  số trần từ 4 chữ số trở lên (`5000000` = 5.000.000₫).
  Xem `parseAmount` trong code.
- **Loại job tự đoán từ câu nói:** có `cưới` → Wedding;
  `couple` / `cặp đôi` → Couple; `lookbook` / `shop` → Lookbook;
  còn lại mặc định Portrait.
- **Chất liệu tự đoán:** có `film` → Film; `cả hai` / `digital và film` → Cả hai;
  còn lại mặc định Digital.
- **Loại thu/chi tự xếp** (`voiceCategory`): `makeup` / `trang điểm` → Makeup,
  `studio` / `địa điểm` → Thuê studio, `di chuyển` / `grab` / `xăng` → Di chuyển,
  `album` / `in ảnh` → Album & in ấn, `lightroom` / `phần mềm` → Phần mềm,
  `cloud` / `drive` → Lưu trữ cloud, `lens` / `thiết bị` → Mua thiết bị;
  khoản thu có `cọc` → Cọc, có `album` → Album thêm, còn lại → Thu khác.
- **Ghép job theo tên khách:** khi ghi thu/chi, app tự tìm job có tên khách
  xuất hiện trong câu nói để gắn khoản đó vào đúng job. Nói rõ tên khách
  thì gắn đúng; không nói tên thì khoản đó vẫn ghi vào sổ, không gắn job nào.

## Bảng 10 lệnh

Trạng thái: ✅ = có sẵn trong code v1 (nói trên web / gõ tay trên iOS đều chạy).
⚠️ = **chưa có trong code hiện tại** — lệnh đề xuất, cần thêm parser ở v1.1,
không được giới thiệu là đã chạy được.

| # | Lệnh | Câu mẫu (nói hoặc gõ) | Hành động trong app | Câu xác nhận hiện trên màn hình |
|---|------|------------------------|---------------------|----------------------------------|
| 1 | Thêm job ✅ | “Thêm job cho Mai Anh, cưới” | Tạo job mới, loại Wedding — Digital, bước **Tư vấn**, giá tự điền theo bảng giá gói. Ngày chụp, giờ, địa điểm, hạn giao để trống — điền sau trong tab Buổi chụp. | “Đã thêm job mới cho Mai Anh, loại Wedding — Digital, đang ở bước Tư vấn. bạn vào tab Buổi chụp để điền ngày và giá sau cũng được nha.” |
| 2 | Ghi thu ✅ | “Thu cọc Mai Anh 5 triệu” / “Nhận cọc Mai Anh 5 triệu” | Ghi khoản thu 5.000.000₫, loại **Cọc**, ngày hôm nay, gắn vào job Mai Anh (vì câu có tên khách). | “Đã ghi khoản thu Cọc — 5.000.000₫ vào sổ hôm nay rồi nè.” |
| 3 | Ghi chi ✅ | “Chi makeup 2 triệu” / “Chi thuê studio 1 triệu rưỡi” | Ghi khoản chi 2.000.000₫ (hoặc 1.500.000₫), loại tự xếp (Makeup / Thuê studio), ngày hôm nay. | “Đã ghi khoản chi Makeup — 2.000.000₫ vào sổ hôm nay rồi nè.” |
| 4 | Xem hôm nay ✅ | “Hôm nay chụp gì?” / “Hôm nay làm gì?” | Liệt kê buổi chụp hôm nay + việc tới hạn hôm nay (hàm `answer`, nhánh `hom nay`). | “Hôm nay của bạn nè: • …” — hoặc khi trống: “Hôm nay không có buổi chụp nào và cũng không có hạn nào dí hết. Ngày thong thả đó bạn!” |
| 5 | Ai chưa trả tiền ✅ | “Ai chưa trả tiền?” / “Ai còn nợ tiền?” | Liệt kê mọi job còn thiếu tiền, chưa ở bước Xong, kèm số thiếu từng khách + tổng thiếu (`debtorsText`). | “Danh sách khách còn thiếu tiền nè: • Mai Anh (Wedding — Digital) — còn thiếu 5.000.000₫, đang ở bước Chốt cọc. Tổng cộng còn thiếu: …” — hoặc khi đủ: “Không ai nợ đồng nào hết, bạn ơi. Khách trả đủ hết rồi, vui quá!” |
| 6 | Lời tháng này ✅ | “Tháng này lời bao nhiêu?” | Tổng thu – chi tháng này, job lời nhất tới giờ, tổng khách còn thiếu. | “Tháng này: thu … , chi … , lời … . Job lời nhất tới giờ: … — lời … . Khách còn thiếu tổng cộng … chưa về túi đó nha.” |
| 7 | Nhắc lịch sắp tới ✅ | “Tuần này chụp gì?” / “Job nào sắp tới hạn giao?” | 7 ngày tới có những buổi chụp nào (ngày, khách, địa điểm); hạn giao ảnh gần nhất, job quá hạn ghi rõ “ĐÃ QUÁ HẠN” + đang ở bước nào. | “7 ngày tới có 2 buổi chụp: • …” / “Các hạn giao ảnh gần nhất: • … — hạn …, đang ở bước Hậu kỳ.” |
| 8 | Đọc báo cáo hôm nay ✅ | “Đọc báo cáo hôm nay” | Báo cáo cuối ngày theo 6 phòng ban + tổng thu/chi/lời tháng tới hôm nay (`dailyReportText`). App đọc to câu trả lời, mở đầu bằng “Báo cáo hôm nay nè …”. | Toàn bộ báo cáo (dạng danh sách theo phòng ban + dòng tổng kết), hiện trong bong bóng chat. |
| 9 | Chuyển bước pipeline ⚠️ | “Chuyển job Mai Anh sang bước Hậu kỳ” | **Chưa có trong code.** Parser hiện tại không hiểu lệnh đổi bước — câu này sẽ rơi về tra cứu job (trả về thông tin job Mai Anh) chứ không đổi bước. Cần thêm ở v1.1: nhận tên khách + tên 1 trong 8 bước (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong), đổi `stage`, ghi chú “đổi bằng giọng nói”. | Đề xuất khi làm xong: “Đã chuyển job Mai Anh sang bước Hậu kỳ.” (chưa có thật — đừng giới thiệu trước). |
| 10 | Nhắc lịch ⚠️ | “Nhắc tôi chụp Mai Anh lúc 7 giờ sáng mai” | **Chưa có trong code.** App hiện không có lệnh đặt nhắc: ngày/giờ nhắc không được lưu, không có thông báo đẩy. Cần thêm ở v1.1: lưu nhắc theo job + giờ, xin quyền thông báo iOS, hiện nhắc trên màn hình Hôm nay. | Đề xuất khi làm xong: “Đã nhắc chụp Mai Anh lúc 7 giờ sáng mai.” (chưa có thật — đừng giới thiệu trước). |

## Phương án dự phòng gõ tay (dùng ngay ở v1 iOS, khi mic chưa có)

- **Mọi lệnh ✅ (1–8) gõ đúng câu mẫu ở trên vào ô “Hỏi trợ lý…” trong tab
  Trợ lý rồi bấm Gửi** — chạy đúng parser như khi nói, kết quả hiện bong bóng
  chat như bảng trên. Đây là cách dùng chính thức ở v1 iOS, không phải cách tạm.
- **Nút gợi ý nhanh:** dưới ô chat có sẵn 7 câu bấm là chạy
  (`QUICK_QS`): “Hôm nay chụp gì?”, “Ai chưa trả tiền?”,
  “Tháng này lời bao nhiêu?”, “Chi nhiều nhất vào đâu?”,
  “Job nào sắp tới hạn giao?”, “Tuần này chụp gì?”, “Đọc báo cáo hôm nay”.
- **Lệnh 9 (đổi bước):** mở chi tiết job → bấm vào bước muốn tới trong thanh
  tiến độ (tính năng nhảy bước của v1) hoặc bấm “Xong bước này”.
- **Lệnh 10 (nhắc lịch):** điền ngày + giờ chụp trong form job — app nhắc
  trong app theo ngày chụp / hạn giao; muốn nhắc vào Lịch iPhone thì dùng nút
  “Thêm vào Lịch iPhone” trong chi tiết job.
- **Khi câu nói/gõ không hiểu:** app trả lời
  “Câu này trợ lý chưa tra được. Bạn thử hỏi kiểu này nha: …” kèm 5 câu mẫu,
  hoặc gõ tên khách để tra job của khách đó.

## Ghi chú cho người làm v1.1 (mic + lệnh 9, 10)

1. Sửa plugin speech-recognition cho Capacitor 8 (xem `RISKS.md` mục 4):
   thử lại tối đa 2 cách đã ghi, không được thì viết plugin SPM riêng bọc
   `SFSpeechRecognizer`; chỉ bật mic sau khi build iOS thật qua GitHub Actions.
2. Lệnh 9: thêm nhánh trong `runCommand` trước nhánh tra cứu job trong
   `answer` — mẫu: `(chuyen|doi) (job|buoi chup) <tên khách> (sang|toi) buoc <tên bước>`,
   kiểm tra tên bước có trong `STAGES`, không có thì hỏi lại tên bước đúng.
3. Lệnh 10: thêm bảng nhắc (jobId, thời gian, nội dung) + quyền thông báo iOS;
   đừng dùng `speechSynthesis` để nhắc — nhắc phải hiện khi app đóng.
4. Test lại cả 10 lệnh bằng gõ tay trước, rồi mới test bằng mic trên iPhone thật:
   mỗi lệnh cần 1 ca đạt (câu mẫu) + 1 ca sai (không dấu, nói tên khách thiếu)
   để kiểm tra thẻ xác nhận hiện đúng câu nghe được trước khi bấm “Làm đi”.
