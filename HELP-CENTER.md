# FotoBro — Trung tâm trợ giúp trong app (Help Center)

- Mục đích: 10 câu hỏi thường gặp, hiển thị trong app (Cài đặt → Trợ giúp), mỗi câu trả lời ngắn 2–3 câu, tiếng Việt + tiếng Anh.
- Nguồn dữ liệu thật: đối chiếu `www/index.html` trong `~/workspace/fotobro-ios-v1/` (khoá PIN/Face ID, sao lưu JSON, đăng nhập Google 1 chạm, nhập Lịch iPhone native, huỷ/khôi phục job, bảng giá).
- Phạm vi: chỉ là nội dung + thiết kế, chưa code vào app. Agent code sau nối file này vào app theo mục "Ghi chú cho agent code" ở cuối.
- Quy ước: "bản sao lưu" = file `fotobro-sao-luu.json` tải từ app. Dữ liệu chỉ nằm trên máy, không tài khoản, không máy chủ.

## 1. Quên mã PIN thì làm sao?

**Tiếng Việt:** Mở app bằng Face ID (hoặc vân tay / mật mã máy) rồi vào Cài đặt để đặt lại mã PIN mới. Nếu quên cả Face ID lẫn mã PIN thì không còn cách mở lại — phải xoá dữ liệu của app rồi vào lại từ đầu, nên hãy tải bản sao lưu trước khi quên.

**English:** Unlock with Face ID (or Touch ID / your device passcode), then set a new PIN in Settings. If you forget both Face ID and your PIN, there is no way back in — you must delete the app data and start over, so keep a backup first.

## 2. Face ID không nhận thì làm sao?

**Tiếng Việt:** Bấm "Dùng mã PIN" trên màn hình khoá và nhập mã PIN 6 số bạn đã đặt. Nếu vẫn không được, kiểm tra Face ID trong Cài đặt iPhone (Face ID & Mật mã) rồi thử lại.

**English:** Tap "Use PIN" on the lock screen and enter the 6-digit PIN you set. If that still fails, check Face ID in your iPhone Settings (Face ID & Passcode) and try again.

## 3. Lỡ xoá app / mất dữ liệu thì khôi phục thế nào?

**Tiếng Việt:** Dữ liệu chỉ nằm trên máy, xoá app là mất dữ liệu nếu không có bản sao lưu. Cài lại app, vào Cài đặt → Mở bản sao lưu, chọn file `fotobro-sao-luu.json` bạn đã tải trước đó là dữ liệu về lại.

**English:** Your data lives only on your device — deleting the app deletes it unless you have a backup. Reinstall the app, go to Settings → Restore backup, and pick the `fotobro-sao-luu.json` file you saved earlier.

## 4. Đổi sang iPhone mới thì chuyển dữ liệu thế nào?

**Tiếng Việt:** Trên máy cũ, vào Cài đặt → Tải bản sao lưu để lưu file `fotobro-sao-luu.json` (gửi qua AirDrop, Mail hoặc Drive cho chính mình). Trên máy mới, cài FotoBro rồi vào Cài đặt → Mở bản sao lưu và chọn file đó.

**English:** On your old iPhone, go to Settings → Download backup to save `fotobro-sao-luu.json` (send it to yourself via AirDrop, Mail or Drive). On your new iPhone, install FotoBro, then go to Settings → Restore backup and pick that file.

## 5. Đăng nhập Google để làm gì? Không đăng nhập được thì sao?

**Tiếng Việt:** Đăng nhập Google 1 chạm để app đọc Lịch Google, Gmail (tiền về, khách hỏi chụp), Danh bạ và Drive của bạn — không cần tự tạo gì, chỉ bấm nút "Đăng nhập Google". Nếu app báo "chưa sẵn sàng" thì FotoBro đang chờ Client ID chung, thử lại sau khi có bản cập nhật.

**English:** Sign in with Google once and the app can read your Google Calendar, Gmail (payments and client enquiries), Contacts and Drive — no setup needed, just tap "Sign in with Google". If the app says "not ready yet", FotoBro is still waiting for its shared Client ID; try again after the next update.

## 6. Nhập Lịch iPhone thế nào? Sao không thấy sự kiện?

**Tiếng Việt:** Vào Cài đặt → Nhập từ Lịch iPhone, cho phép app đọc Lịch, sự kiện trong 30 ngày tới sẽ thành buổi chụp. Nếu không thấy sự kiện, kiểm tra quyền Lịch trong Cài đặt iPhone (Quyền riêng tư → Lịch) và chắc chắn sự kiện nằm trong 30 ngày tới.

**English:** Go to Settings → Import from iPhone Calendar, allow Calendar access, and events from the next 30 days will become shoots. If nothing appears, check Calendar permission in iPhone Settings (Privacy → Calendars) and make sure the events are within the next 30 days.

## 7. Sao lưu và khôi phục thế nào?

**Tiếng Việt:** Vào Cài đặt → Tải bản sao lưu để lưu file JSON về máy; nên tải 1 bản mỗi tuần. Để khôi phục, vào Cài đặt → Mở bản sao lưu, chọn file cũ — dữ liệu đang có trên máy sẽ được thay bằng bản sao lưu đó, nên tải bản mới nhất trước khi khôi phục.

**English:** Go to Settings → Download backup to save a JSON file; do it once a week. To restore, go to Settings → Restore backup and pick an older file — the data on your device will be replaced by that backup, so save a fresh copy first.

## 8. Huỷ job rồi có khôi phục lại được không?

**Tiếng Việt:** Được. Job huỷ chuyển sang trạng thái "Đã huỷ", không nằm trong pipeline đang chạy nhưng tiền và lịch vẫn giữ nguyên. Mở chi tiết job huỷ rồi bấm Khôi phục, job sẽ về lại bước "Tư vấn".

**English:** Yes. A cancelled job moves to "Cancelled", leaves the active pipeline, but its money and calendar entries stay. Open the cancelled job and tap Restore — it returns to the "Consulting" step.

## 9. Đổi bảng giá thì job cũ có đổi theo không?

**Tiếng Việt:** Không. Bảng giá trong Cài đặt chỉ áp cho job mới tạo — app tự điền giá theo gói khi bạn thêm job. Job cũ giữ nguyên giá đã chốt, muốn đổi thì sửa giá trong chi tiết job đó.

**English:** No. The price list in Settings applies only to new jobs — the app fills in the price when you create a job. Old jobs keep their agreed price; to change one, edit the price inside that job.

## 10. Liên hệ hỗ trợ / báo lỗi ở đâu?

**Tiếng Việt:** Vào Cài đặt → Trợ giúp → Liên hệ hỗ trợ, hoặc gửi email tới `support@fotobro.app` kèm tên máy, phiên bản app và các bước làm ra lỗi. Nếu app bị lỗi, tải 1 bản sao lưu trước rồi mới xoá hay cài lại app.

**English:** Go to Settings → Help → Contact support, or email `support@fotobro.app` with your iPhone model, app version and the steps that caused the problem. If the app is misbehaving, download a backup first before deleting or reinstalling it.

---

## Ghi chú cho agent code

- Hiển thị: 1 màn danh sách 10 câu hỏi (tiêu đề + 2 dòng đầu câu trả lời), chạm vào 1 câu thì mở rộng toàn bộ câu trả lời Việt + Anh.
- Ngôn ngữ: nếu người dùng chọn English trong Cài đặt thì hiện phần English trước, tiếng Việt sau; ngược lại hiện tiếng Việt trước.
- Nguồn dữ liệu: nội dung tĩnh trong file này, không gọi mạng, không cần đăng nhập.
- Kiểm chứng sau khi nối: mở 10 câu đều hiện đủ 2 ngôn ngữ; đổi ngôn ngữ rồi mở lại vẫn đúng thứ tự; màn hình iPhone SE không tràn chữ.
