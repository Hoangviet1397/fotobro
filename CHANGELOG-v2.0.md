# FotoBro — Changelog v2.0

- **Phiên bản:** 2.0 (`APP_VERSION = '2.0'`, `MARKETING_VERSION = 2.0`)
- **Bundle ID:** `com.fotobro.app`
- **Nền tảng:** iOS (Capacitor 8), bản đầu tiên trên App Store
- **Ngày phát hành:** _chưa chốt_ (để trống — điền khi bản TestFlight đầu tiên được duyệt)
- **Repo:** `Hoangviet1397/fotobro` (repo mới, tách riêng khỏi `tro-ly-xeo` mà Xèo đang dùng)
- **Nguồn:** bản web FotoBro v2.6 (chuyển từ Trợ lý Xèo v2.5), làm tối giản lại cho iOS v2.0

> Ghi chú: đây là ghi chú phát hành cho bản v2.0 đang làm trong
> `~/workspace/fotobro-ios-v1/`. Chưa build `.ipa` thật, chưa lên
> TestFlight, chưa kiểm chứng trên iPhone thật. Các mục "Lỗi đã biết"
> dưới đây lấy từ QA độc lập lúc 00:03–00:04 ngày 20/11/2026
> (xem `QA-REPORT.md`) — cần QA lại sau khi agent chính sửa xong.

## Tính năng mới trong v2.0

### App chung cho nhiếp ảnh gia tự do (không còn riêng Xèo)
- Đổi tên Trợ lý Xèo → **FotoBro** (Foto + Bro), subtitle "Trợ lý studio ảnh".
- Người mới vào tên/studio/Instagram để trống, bảng giá digital + film mặc định 0 (chưa đặt).
- Dữ liệu cũ giữ nguyên key `troLyXeo.v1` / `troLyXeoPhotos` để không mất dữ liệu của Xèo khi chuyển sang.

### Lõi giữ lại
- Màn hình **Hôm nay**: buổi chụp hôm nay, tiền cần thu, việc cần làm.
- Job chạy qua pipeline 8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.
- Sổ tiền + báo cáo ngày/tuần/tháng, thu/chi theo job, mẫu tin nhắn/email cho khách, máy tính giá, bảng giá digital/film từng gói, khoá Face ID/PIN, sao lưu/khôi phục JSON.

### Pipeline cải tiến (mới ở v1)
- Nhảy thẳng tới bước bất kỳ trong thanh tiến độ (không bắt đi từng bước).
- Gắn tiền vào bước: sang Chốt cọc thì ghi cọc ngay; sang Đã giao thì nhắc thu nốt; bấm Xong mà còn thiếu tiền thì cảnh báo số thiếu, phải xác nhận mới cho xong.
- Thêm trạng thái **Huỷ / Không chốt** (khôi phục được về Tư vấn), job huỷ không tính vào pipeline đang chạy.
- Job kẹt ở một bước quá lâu (theo hạn chụp/giao, mặc định 7 ngày nếu không có hạn) thì báo lên màn hình Hôm nay.

### Cá nhân hoá chung (mới ở v1)
- Màu chủ đề: 3 preset (Ấm mặc định, Tối giản, Tối).
- Logo studio của mình (1 ảnh, hiện trên Hôm nay và đầu email gửi khách).
- Sửa mẫu tin nhắn/email theo giọng của mình, có nút khôi phục mẫu gốc.
- Ngôn ngữ Việt/Anh + tiền tệ VND/USD (chỉ đổi hiển thị, không quy đổi tỷ giá).

### Google — đăng nhập 1 chạm (mới ở v1, chưa chạy được thật)
- Chỉ còn 1 nút "Đăng nhập Google", xin đủ 6 scope một lần (đọc Lịch, ghi Lịch, đọc Gmail, gửi Gmail, đọc Danh bạ, xem Drive), luồng PKCE.
- Không còn ô nhập Client ID, không còn hướng dẫn tự tạo Google Cloud project.
- Client ID dùng chung của FotoBro lấy từ `www/fotobro-config.js` (`googleClientId`, hiện để trống).

### Lịch iPhone native 1 chạm (mới ở v1, chưa chạy được thật)
- Nhập buổi chụp 30 ngày tới thẳng từ Lịch iPhone qua plugin lịch Capacitor (EventKit), không cần file `.ics`.
- Xuất lịch: nút "Thêm vào Lịch iPhone" trong chi tiết job.
- Nhắc trong app vẫn là nhắc chính (nhắc trước buổi chụp 12 tiếng, cho chọn 1h/12h/24h).

### UX/UI kiểu Apple Music (mới ở v1)
- Large Title, font hệ thống SF Pro, nền trắng sạch + dark mode đen, 1 màu nhấn (`#FA2D48`, đỏ kiểu Apple Music), thẻ bo góc lớn, tab bar mờ (blur).
- Logo mới: chữ F đậm trong vòng ống kính đỏ (xem `assets/logo-v2/`, chờ duyệt trước khi thay icon thật).

### Màn chào lần đầu (thiết kế xong, xem `ONBOARDING.md`)
- 3 màn (Hôm nay / Một job, 8 bước / Tiền và lịch), mỗi màn 1 câu, nút Bỏ qua ở cả 3 màn; cuối là form tên/studio/bảng giá, để trống được.

## Đã bỏ so với Trợ lý Xèo
- Toàn bộ **E.L.F. / Super Junior**: Góc E.L.F., sticker, câu vui mỗi ngày, chủ đề Pearl Sapphire Blue, chibi 9 thành viên (kiểm chứng: 0 lần trong code v1).
- 6 ảnh mẫu của Xèo trong "Ảnh của bạn" và 5 job mẫu (mặc định sổ trống).
- Chức năng **nhập lịch cũ**: nhập file `.ics` / `.zip`, xuất `.zip` từ Google Lịch trên máy tính, hướng dẫn xuất file Google — đã bỏ hẳn (chỉ còn nhập Lịch iPhone native + đăng nhập Google).
- Chế độ vui kiểu E.L.F., đổi tên phòng ban, loại job riêng, checklist riêng từng bước, bảng Kanban kéo thả — không làm ở v1 (để sau).

## Lỗi đã biết / chưa làm xong ở v2.0
- **Giọng nói (mic) dời sang v2.1.** Plugin `@capacitor-community/speech-recognition@7.0.1` chỉ có `.podspec`, không có `Package.swift` nên build SPM của Capacitor 8 không link được; đã thử 2 cách, cả hai đều cần build trên macOS để kiểm chứng. Ở v1 iOS, bấm micro hiện "Giọng nói sẽ có ở bản v2.1 — giờ gõ câu hỏi nha". Gõ tay vẫn chạy đủ 8 lệnh (thêm job, ghi thu/chi, xem hôm nay, ai chưa trả tiền, lời tháng này…). Xem `VOICE-COMMANDS.md` — 2 lệnh bằng giọng nói chưa có trong code: chuyển bước pipeline và đặt nhắc.
- **Google chưa chạy được thật.** Chưa có Client ID chung (placeholder trống trong `fotobro-config.js`); app báo "chưa sẵn sàng" khi chưa có Client ID. Cần Việt tạo Client ID chung 1 lần + xác minh Google (xem `GOOGLE-SETUP.md`): 4–10 tuần nếu giữ đủ 6 scope, 2–6 tuần nếu bỏ đọc Gmail (`gmail.readonly`) ở v1. Ngoài ra redirect iOS của Google chỉ chấp nhận `com.googleusercontent.apps.<id>:/oauth2redirect` (code hiện dùng `com.fotobro.app:/oauth2redirect`, phải sửa theo Client ID thật), và Google cấm OAuth trong WKWebView — phải mở trình duyệt hệ thống + deep-link.
- **Lịch iPhone native chưa chạy được thật.** Code có `importFromNativeCalendar`/`isNativeCalendar()` nhưng `package.json` chưa có plugin lịch nào, `Info.plist` chưa có `NSCalendarsUsageDescription`, chưa có `node_modules/` trong bản sao. Trên máy thật app sẽ rơi về fallback (đã bỏ nhập file `.ics` nên cần sửa trước khi test). Xem `QA-REPORT.md` §4.
- **CloudKit Nấc 2 chỉ là placeholder.** Container `iCloud.com.fotobro.app` ở trạng thái `not-configured` trong `fotobro-config.js`; chưa có container thật, chưa có App ID, chưa code sync, chưa bật IAP. Nấc 1 miễn phí; Nấc 2/3 thu phí nhưng giá để placeholder (chưa chốt số tiền/chu kỳ). Xem `CLOUDKIT-PLAN.md`.
- **Workflow build chưa đủ để submit.** Workflow `.github/workflows/ios-build.yml` còn ghim Xcode 16.4 trên `macos-15` — App Store Connect từ 28/04/2026 từ chối build bằng Xcode dưới 26; phải nâng lên Xcode 26 trước khi chạy build thật. Workflow còn ghi tên repo cũ `tro-ly-xeo` (dòng 5), tên archive/artifact còn `TroLyXeo`.
- **Chưa kiểm chứng trên iPhone thật.** Build `.ipa`, TestFlight, Local Notifications, Face ID/passkey, chọn ảnh, Share sheet — tất cả đều chưa chạy lần nào (cần macOS runner / iPhone thật). Test jsdom lúc QA: 101/103 đạt, 2 lỗi là test lỗi thời (test vẫn expect `APP_VERSION '2.6'` và 5 job mẫu, app đã là `2.0` và 0 job mẫu) — cần cập nhật test theo spec v2.0.
- **Chưa có:** email hỗ trợ thật (`support@fotobro.app` vẫn là placeholder — domain `fotobro.app` chưa mua, xem `fotobro-scale/docs/EMAIL-SETUP.md`); Privacy Policy URL thật (file `PRIVACY.html` đã viết, chưa host lên GitHub Pages); Support URL thật (file `SUPPORT.html` đã viết, chưa host); screenshots App Store (cần TestFlight + dữ liệu mẫu hư cấu trong `SCREENSHOT-DATA.md`); icon mới chưa thay (logo v2 trong `assets/logo-v2/` chờ Việt duyệt).
- **Còn sót cần dọn:** phần tử `<p id="sampleNote">` về job mẫu vẫn còn trong HTML dù job mẫu đã bỏ; `backgroundColor` Capacitor vẫn là kem vintage `#FBF5EA`, lệch hướng UI Apple Music mới.
- **Rủi ro App Store Guideline 4.8:** Apple có thể bắt app có đăng nhập Google thì phải có Sign in with Apple tương đương — đã chuẩn bị phương án thêm Sign in with Apple nếu bị yêu cầu (xem `APP-STORE-READY.md`).

## Sẽ làm ở v2.1 (không có trong v2.0)
- Mic giọng nói native (sửa plugin SPM hoặc viết plugin riêng bọc SFSpeechRecognizer).
- 2 lệnh giọng nói còn thiếu: chuyển bước pipeline, đặt nhắc bằng giọng nói.
- CloudKit Nấc 2 (đồng bộ/sao lưu mã hoá) + Nấc 3 nhóm/studio, sau khi Việt chốt giá + tạo container.
- Sao lưu v2 (gồm cả ảnh, mã hoá, tách ảnh khi file > 25 MB) — thiết kế xong, xem `BACKUP-V2.md`.
- Báo cáo tiền nâng cao: biểu đồ thu/chi theo tháng, top loại job lãi nhất, xuất CSV — thiết kế xong, xem `MONEY-REPORT.md`.
- Checklist việc cần làm theo từng bước pipeline, bảng Kanban kéo thả.
