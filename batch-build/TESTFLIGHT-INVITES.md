# Thư mời tester nội bộ — FotoBro v1 (TestFlight)

> **Trạng thái:** Mẫu nháp — điền các placeholder `[...]` trước khi gửi.
> **App:** FotoBro v1.0 — iOS, Bundle ID `com.fotobro.app`
> **Kênh phát hành beta:** TestFlight (Apple) — bản beta hết hạn sau **90 ngày** kể từ ngày upload, cập nhật qua app TestFlight.
>
> ⚠️ **Không có email thật trong file này.** Mọi địa chỉ email dưới đây đều là
> **placeholder** — domain `fotobro.app` **chưa mua**, chưa có hộp thư nào.
> Đừng ghi `support@fotobro.app` (hay bất kỳ địa chỉ `@fotobro.app` nào) như
> email đã có thật. Khi nào mua domain + tạo hộp thư hỗ trợ thì thay
> placeholder bằng địa chỉ thật rồi mới gửi.

## Điền trước khi gửi

| Placeholder | Điền gì | Ví dụ / ghi chú |
|---|---|---|
| `[LINK TESTFLIGHT]` | Link mời TestFlight công khai hoặc link redeem từ App Store Connect | Lấy trong App Store Connect → TestFlight → Internal Testing → link mời |
| `[MÃ TESTFLIGHT]` | Mã redeem (nếu gửi kèm link) | Chỉ dùng khi không gửi link trực tiếp |
| `[NGÀY HẾT HẠN TEST]` | Hạn cuối nhận phản hồi | VD: 30/11/2026 — nên đặt trước ngày nộp App Store ít nhất 3–5 ngày |
| `[KÊNH BÁO LỖI]` | Nơi tester gửi lỗi | VD: nhóm Zalo/Messenger nội bộ, hoặc `[EMAIL HỖ TRỢ — PLACEHOLDER, chưa có thật]` |
| `[TÊN NGƯỜI GỬI]` | Tên người mời | VD: Việt |
| `[TÊN TESTER]` | Tên người nhận (mẫu email) | Điền từng người, đừng gửi chung tên |

---

## FotoBro là gì? (dùng chung cho mọi mẫu)

**Tiếng Việt:**
FotoBro là trợ lý cho nhiếp ảnh gia tự do — quản lý job chụp, tiền bạc và lịch hẹn trong một app, không cần sổ tay hay nhiều app rời rạc.

**English:**
FotoBro is an assistant for freelance photographers — jobs, money and schedule in one app, no notebook or scattered apps needed.

## Cài đặt thế nào? (dùng chung cho mọi mẫu)

**Tiếng Việt:**
1. Cài app **TestFlight** miễn phí từ App Store trên iPhone.
2. Mở link mời: `[LINK TESTFLIGHT]` (hoặc nhập mã `[MÃ TESTFLIGHT]` trong TestFlight).
3. Bấm **Install** để cài **FotoBro** bản beta, rồi mở app dùng bình thường.
4. Khi có bản beta mới, mở TestFlight → bấm **Update**. Bản beta tự hết hạn sau 90 ngày.

**English:**
1. Install the free **TestFlight** app from the App Store on your iPhone.
2. Open the invite link: `[LINK TESTFLIGHT]` (or enter code `[MÃ TESTFLIGHT]` in TestFlight).
3. Tap **Install** to get the **FotoBro** beta, then open it and use it as normal.
4. When a new beta is out, open TestFlight → tap **Update**. The beta expires automatically after 90 days.

## Test cái gì? (dùng chung cho mọi mẫu)

Ưu tiên test theo thứ tự — gặp lỗi ở mục nào thì dừng lại, chụp màn hình và báo ngay:

**Tiếng Việt:**
1. **Màn hình Hôm nay** — job hôm nay, job kẹt quá lâu có hiện cảnh báo không?
2. **Thêm job + pipeline 8 bước** (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong) — nhảy thẳng tới bước bất kỳ, ghi tiền cọc ở bước Chốt cọc, job Đã giao có nhắc thu nốt tiền không, job Xong mà còn thiếu tiền có cảnh báo không, Huỷ job rồi khôi phục lại được không?
3. **Sổ tiền + báo cáo** — thu/chi theo job có cộng đúng không, báo cáo ngày/tuần/tháng có khớp sổ không?
4. **Nhắc lịch** — nhắc job sắp tới có kêu đúng giờ không?
5. **Nhập Lịch iPhone** — bấm nhập 1 chạm, sự kiện 30 ngày tới có vào đúng job/lịch không? Nút "Thêm vào Lịch iPhone" trong chi tiết job có tạo được sự kiện không?
6. **Đăng nhập Google** — bấm 1 chạm có đăng nhập được không? (Nếu chưa đăng nhập được, ghi rõ màn hình dừng ở đâu.)
7. **Mẫu tin nhắn/email** — sửa mẫu rồi khôi phục gốc có về đúng mẫu ban đầu không?
8. **Máy tính giá + bảng giá** — giá Digital / Film / Cả hai có tính đúng không, sửa giá film trong Cài đặt có lưu không?
9. **Khoá Face ID / PIN** — khoá/mở app có hoạt động không?
10. **Cá nhân hoá** — đổi 3 màu chủ đề, logo studio, ngôn ngữ Việt/Anh, tiền tệ VND/USD (chỉ đổi hiển thị, không quy đổi) có áp dụng đúng không?
11. **Sao lưu JSON** — xuất file sao lưu rồi nhập lại, job và sổ tiền có còn đủ không?
12. **Giao diện** — chữ có bị cắt, nút có bấm được, dark mode có chỗ nào khó đọc không? (Ưu tiên test trên iPhone thật.)

**Chưa có ở v1 — đừng báo lỗi các mục này:** giọng nói/mic (dời sang v1.1), đồng bộ đám mây CloudKit, mua trong app (IAP), nhập lịch bằng file (.ics/.zip đã bỏ), checklist theo bước, bảng Kanban kéo thả.

**English:**
1. **Today screen** — today's jobs, and does an overdue stuck job show a warning?
2. **Add a job + 8-step pipeline** (Consult → Deposit → Scheduled → Shot → Selecting → Editing → Delivered → Done) — jump to any step, record the deposit at Deposit, does Delivered remind you to collect the remaining payment, does Done warn if money is still missing, can you cancel a job and restore it?
3. **Money book + reports** — income/expense per job adding up correctly, daily/weekly/monthly reports matching the book?
4. **Reminders** — do upcoming-job reminders fire on time?
5. **iPhone Calendar import** — one-tap import, do events for the next 30 days come in correctly? Does "Add to iPhone Calendar" in a job create the event?
6. **Google sign-in** — does one-tap sign-in work? (If not, note exactly which screen it stops at.)
7. **Message/email templates** — edit a template, then restore the original: does it come back correctly?
8. **Price calculator + price list** — Digital / Film / Both priced correctly, does editing film prices in Settings save?
9. **Face ID / PIN lock** — does locking/unlocking the app work?
10. **Personalisation** — 3 theme colours, studio logo, Vietnamese/English, VND/USD currency (display only, no conversion) applied correctly?
11. **JSON backup** — export a backup and import it back: are jobs and money records complete?
12. **Interface** — any cut-off text, unresponsive buttons, hard-to-read spots in dark mode? (Please test on a real iPhone.)

**Not in v1 — please don't report these as bugs:** voice/mic (moved to v1.1), CloudKit sync, in-app purchases, importing calendar from a file (.ics/.zip removed), per-step checklists, drag-and-drop Kanban.

## Báo lỗi ở đâu và báo như thế nào? (dùng chung cho mọi mẫu)

**Tiếng Việt:**
Gửi về: `[KÊNH BÁO LỖI]`
Mỗi lỗi gửi kèm: (1) iPhone + phiên bản iOS, (2) phiên bản FotoBro trong TestFlight (VD: 1.0 build …), (3) các bước làm trước khi lỗi xảy ra, (4) ảnh chụp màn hình hoặc quay màn hình, (5) lỗi có lặp lại được không.
Lỗi làm mất dữ liệu (job, sổ tiền) hoặc không mở được app thì báo ngay, đừng đợi hết hạn test.

**English:**
Send to: `[KÊNH BÁO LỖI]`
For each bug, include: (1) iPhone model + iOS version, (2) FotoBro version in TestFlight (e.g. 1.0 build …), (3) steps before the bug happened, (4) a screenshot or screen recording, (5) whether it happens every time.
Bugs that lose data (jobs, money records) or stop the app from opening — report immediately, don't wait until the test deadline.

---

## Mẫu 1 — Tin nhắn ngắn (Zalo / Messenger)

### Tiếng Việt

> Chào bạn! Mình mời bạn test bản beta app **FotoBro** — trợ lý quản lý job chụp, tiền bạc và lịch hẹn cho nhiếp ảnh gia tự do, làm trên iPhone.
>
> Cài 2 bước: (1) cài app **TestFlight** miễn phí trên App Store, (2) mở link này rồi bấm Install: `[LINK TESTFLIGHT]`
>
> Nhờ bạn test giúp: thêm job, pipeline 8 bước, sổ tiền, nhắc lịch, nhập Lịch iPhone, đăng nhập Google, máy tính giá, khoá Face ID/PIN. Chi tiết xem trong app là đủ dùng.
>
> Gặp lỗi thì chụp màn hình gửi mình qua `[KÊNH BÁO LỖI]`, kèm dòng máy + iOS. Hạn nhận phản hồi: **[NGÀY HẾT HẠN TEST]**.
>
> Cảm ơn bạn nhiều! — `[TÊN NGƯỜI GỬI]`

### English

> Hi! I'd like to invite you to test the beta of **FotoBro** — an assistant for freelance photographers to manage photo jobs, money and schedule, on iPhone.
>
> Two steps: (1) install the free **TestFlight** app from the App Store, (2) open this link and tap Install: `[LINK TESTFLIGHT]`
>
> Please test: adding a job, the 8-step pipeline, money book, reminders, iPhone Calendar import, Google sign-in, price calculator, Face ID/PIN lock. The app itself explains the rest.
>
> If you hit a bug, send me a screenshot via `[KÊNH BÁO LỖI]` with your iPhone model + iOS version. Feedback deadline: **[NGÀY HẾT HẠN TEST]**.
>
> Thank you! — `[TÊN NGƯỜI GỬI]`

---

## Mẫu 2 — Email dài

### Tiêu đề / Subject

- **Tiếng Việt:** `Mời test bản beta FotoBro trên iPhone (TestFlight) — hạn [NGÀY HẾT HẠN TEST]`
- **English:** `You're invited to beta test FotoBro on iPhone (TestFlight) — by [NGÀY HẾT HẠN TEST]`

### Tiếng Việt

> Chào `[TÊN TESTER]`,
>
> Mình mời bạn tham gia test nội bộ bản beta của **FotoBro** — app iOS dành cho nhiếp ảnh gia tự do, giúp quản lý job chụp, tiền bạc và lịch hẹn trong một nơi. Bản v1 này chạy local trên máy (chưa có đồng bộ đám mây), gồm: màn hình Hôm nay, pipeline job 8 bước, sổ tiền + báo cáo, nhắc lịch, mẫu tin nhắn/email, máy tính giá Digital/Film, khoá Face ID/PIN, nhập Lịch iPhone và đăng nhập Google.
>
> **Cài đặt (mất khoảng 2 phút):**
> 1. Cài app **TestFlight** miễn phí từ App Store trên iPhone của bạn.
> 2. Mở link mời này trên iPhone: `[LINK TESTFLIGHT]` (hoặc mở TestFlight rồi nhập mã `[MÃ TESTFLIGHT]`).
> 3. Bấm **Install** để cài **FotoBro** bản beta, rồi mở app dùng như bình thường.
> 4. Khi có bản beta mới, mở TestFlight → bấm **Update**. Lưu ý bản beta tự hết hạn sau 90 ngày kể từ ngày phát hành.
>
> **Nhờ bạn test giúp (theo thứ tự ưu tiên):**
> 1. Màn hình Hôm nay — job hôm nay và cảnh báo job kẹt quá lâu.
> 2. Thêm job + pipeline 8 bước: nhảy bước, ghi tiền cọc, nhắc thu nốt tiền, cảnh báo khi job Xong mà còn thiếu tiền, Huỷ/khôi phục job.
> 3. Sổ tiền + báo cáo ngày/tuần/tháng có khớp nhau không.
> 4. Nhắc lịch có kêu đúng giờ không.
> 5. Nhập Lịch iPhone 1 chạm và nút "Thêm vào Lịch iPhone" trong chi tiết job.
> 6. Đăng nhập Google 1 chạm (nếu dừng ở màn hình nào thì ghi rõ giúp mình).
> 7. Sửa mẫu tin nhắn/email rồi khôi phục gốc.
> 8. Máy tính giá Digital / Film / Cả hai và bảng giá film trong Cài đặt.
> 9. Khoá Face ID/PIN, cá nhân hoá (màu chủ đề, logo studio, Việt/Anh, VND/USD), sao lưu JSON (xuất rồi nhập lại).
> 10. Giao diện trên iPhone thật: chữ bị cắt, nút khó bấm, dark mode khó đọc.
>
> **Chưa có ở v1, bạn đừng báo lỗi các mục này:** giọng nói/mic (sang v1.1), đồng bộ CloudKit, mua trong app, nhập lịch bằng file, checklist theo bước, Kanban kéo thả.
>
> **Báo lỗi như thế nào:**
> Gửi về `[KÊNH BÁO LỖI]`, mỗi lỗi kèm: dòng iPhone + phiên bản iOS, phiên bản FotoBro trong TestFlight, các bước trước khi lỗi xảy ra, ảnh chụp hoặc quay màn hình, và lỗi có lặp lại được không. Lỗi làm mất dữ liệu hoặc không mở được app thì báo ngay giúp mình, đừng đợi hết hạn.
>
> **Thời hạn test:** nhận phản hồi tới hết ngày **[NGÀY HẾT HẠN TEST]**.
>
> Cảm ơn bạn đã giúp FotoBro tốt hơn trước khi lên App Store!
>
> Thân mến,
> `[TÊN NGƯỜI GỬI]`
>
> ---
> *Lưu ý: đây là bản beta nội bộ, chỉ dùng để test. Vui lòng không chia sẻ link TestFlight ra ngoài nhóm tester.*

### English

> Hi `[TÊN TESTER]`,
>
> You're invited to join the internal beta test of **FotoBro** — an iOS app for freelance photographers that keeps photo jobs, money and schedule in one place. This v1 runs locally on your phone (no cloud sync yet) and includes: a Today screen, an 8-step job pipeline, money book + reports, reminders, message/email templates, a Digital/Film price calculator, Face ID/PIN lock, iPhone Calendar import and Google sign-in.
>
> **Install (about 2 minutes):**
> 1. Install the free **TestFlight** app from the App Store on your iPhone.
> 2. Open this invite link on your iPhone: `[LINK TESTFLIGHT]` (or open TestFlight and enter code `[MÃ TESTFLIGHT]`).
> 3. Tap **Install** to get the **FotoBro** beta, then open it and use it as normal.
> 4. When a new beta is out, open TestFlight → tap **Update**. Note the beta expires automatically 90 days after release.
>
> **What we'd like you to test (in priority order):**
> 1. Today screen — today's jobs and warnings for jobs stuck too long.
> 2. Add a job + 8-step pipeline: jumping between steps, recording deposits, reminders to collect remaining payment, warnings when a Done job still has money missing, cancelling/restoring a job.
> 3. Money book + daily/weekly/monthly reports matching each other.
> 4. Reminders firing on time.
> 5. One-tap iPhone Calendar import and the "Add to iPhone Calendar" button in a job.
> 6. One-tap Google sign-in (if it stops somewhere, please note the exact screen).
> 7. Editing message/email templates, then restoring the originals.
> 8. Digital / Film / Both price calculator and film prices in Settings.
> 9. Face ID/PIN lock, personalisation (theme colour, studio logo, Vietnamese/English, VND/USD), JSON backup (export, then import back).
> 10. Interface on a real iPhone: cut-off text, hard-to-tap buttons, hard-to-read dark mode.
>
> **Not in v1 — please don't report these as bugs:** voice/mic (coming in v1.1), CloudKit sync, in-app purchases, importing calendar from a file, per-step checklists, drag-and-drop Kanban.
>
> **How to report a bug:**
> Send it to `[KÊNH BÁO LỖI]` with: your iPhone model + iOS version, the FotoBro version shown in TestFlight, the steps before the bug, a screenshot or screen recording, and whether it happens every time. Bugs that lose data or stop the app from opening — please report right away, don't wait for the deadline.
>
> **Test deadline:** feedback by **[NGÀY HẾT HẠN TEST]**.
>
> Thank you for helping make FotoBro better before it reaches the App Store!
>
> Best regards,
> `[TÊN NGƯỜI GỬI]`
>
> ---
> *Note: this is an internal beta for testing only. Please don't share the TestFlight link outside the tester group.*

---

## Checklist trước khi gửi (người gửi tự tick)

- [ ] Đã thay `[LINK TESTFLIGHT]` / `[MÃ TESTFLIGHT]` bằng link/mã thật từ App Store Connect
- [ ] Đã điền `[NGÀY HẾT HẠN TEST]` và `[KÊNH BÁO LỖI]`
- [ ] Đã điền tên người nhận (mẫu email) — không gửi chung một tên cho nhiều người
- [ ] **Không còn địa chỉ email placeholder nào** trong bản gửi đi (đặc biệt không gửi đi khi `[EMAIL HỖ TRỢ — PLACEHOLDER]` chưa được thay bằng email thật — domain `fotobro.app` chưa mua)
- [ ] Chỉ gửi cho tester nội bộ, không đăng link công khai
