# FotoBro — Email chào mừng người dùng mới (Onboarding)

> ⚠️ **Lưu ý quan trọng:** Các email dưới đây **chỉ gửi được khi có hệ thống tài khoản / email người dùng**.
> FotoBro v1 là app **local-first, Nấc 1 miễn phí, không có tài khoản, không thu thập email** — nên v1
> **chưa gửi được email nào**. Đây là **nội dung chuẩn bị trước** cho giai đoạn sau (khi có Nấc 2
> đồng bộ / tài khoản), để dùng ngay mà không phải soạn lại. Không gửi email thật, không tạo tài khoản.

- Đối tượng: photographer tự do mới tải FotoBro.
- Ngôn ngữ: tiếng Việt là chính, kèm bản tiếng Anh ngắn (app v1 hỗ trợ Việt/Anh).
- Giọng văn: ngắn, ấm, thực tế — đúng 1 việc cần làm, không dài dòng.
- Người gửi gợi ý: `FotoBro <chao@fotobro.app>` (chưa có — cần tạo khi triển khai hệ thống email).
- Chuỗi: 3 email — ngay khi tải (Email 1), ngày 3 (Email 2), ngày 7 (Email 3).
- Quy tắc chung: mỗi email chỉ có **1 nút bấm chính** (mở app / làm 1 việc), không chèn link mua bán,
  không yêu cầu trả lời email, không thu thập dữ liệu.

---

## Email 1 — Ngay khi tải: Chào mừng + 3 việc đầu tiên

**Thời điểm gửi:** ngay sau khi người dùng tạo tài khoản / để lại email lần đầu (giai đoạn sau v1).
**Mục tiêu:** người dùng mở app và làm xong 3 việc đầu tiên trong 5 phút.

### Tiêu đề

- VI: `Chào mừng tới FotoBro — 3 việc đầu tiên, xong trong 5 phút`
- EN: `Welcome to FotoBro — 3 first steps, done in 5 minutes`

### Nội dung (tiếng Việt)

> Chào bạn,
>
> Cảm ơn bạn đã tải FotoBro — trợ lý cho photographer tự do: quản lý job, tiền bạc và lịch chụp
> trong một chỗ, dữ liệu nằm trên máy của bạn.
>
> 3 việc đầu tiên nên làm:
>
> 1. **Tạo job đầu tiên** — nhập tên khách, loại job (Portrait, Couple, Wedding, Lookbook, Event)
>    và ngày chụp. Giá sẽ tự điền theo bảng giá của bạn.
> 2. **Xem màn hình Hôm nay** — mọi việc cần làm hôm nay nằm ở đây, chỉ 1 màn hình.
> 3. **Chọn màu chủ đề và tiền tệ** — vào Cài đặt, chọn 1 trong 3 màu, chọn VND hoặc USD.
>
> Xong 3 việc này là app đã sẵn sàng theo bạn đi chụp.
>
> Chúc bạn một buổi chụp thật vui,
> Đội FotoBro

### Nội dung (tiếng Anh, ngắn)

> Hi there,
>
> Welcome to FotoBro — your assistant for freelance photography: jobs, money and shoot
> schedule in one place, with your data staying on your device.
>
> Your first 3 steps:
>
> 1. **Create your first job** — client name, job type and shoot date. The price fills in itself.
> 2. **Check Today** — everything you need today, on one screen.
> 3. **Pick a theme colour and currency** — in Settings, choose 1 of 3 colours, VND or USD.
>
> That's it — you're ready to shoot.
>
> Happy shooting,
> The FotoBro Team

### Nút bấm gợi ý

| Nút | Đích |
| --- | --- |
| Chính: `Mở FotoBro và tạo job đầu tiên` | Deep link mở app → màn hình tạo job |
| Phụ (text link): `Xem hướng dẫn nhanh` | Trang hướng dẫn / Help Center |

---

## Email 2 — Ngày 3: Mẹo pipeline + sổ tiền

**Thời điểm gửi:** ngày thứ 3 sau khi tải.
**Mục tiêu:** người dùng dùng đúng pipeline 8 bước và ghi tiền theo bước, để không sót cọc / sót tiền thu nốt.

### Tiêu đề

- VI: `Ngày 3 với FotoBro: đừng để sót tiền cọc`
- EN: `Day 3 with FotoBro: don't miss a deposit`

### Nội dung (tiếng Việt)

> Chào bạn,
>
> Bạn đã dùng FotoBro được 3 ngày rồi. Hai mẹo nhỏ giúp bạn không sót việc, không sót tiền:
>
> **1. Pipeline 8 bước — nhảy thẳng tới bước cần, không cần đi lần lượt**
> Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.
> Chạm vào bước bất kỳ để nhảy thẳng tới đó. Job kẹt ở một bước quá lâu sẽ tự hiện lên
> màn hình Hôm nay để bạn xử lý.
>
> **2. Ghi tiền gắn vào từng bước**
> - Tới **Chốt cọc**: ghi ngay số tiền cọc đã nhận.
> - Tới **Đã giao**: app nhắc bạn thu nốt phần còn lại.
> - Tới **Xong** mà vẫn còn thiếu tiền: app cảnh báo trước khi cho xong job.
> - Job không chốt / bị huỷ: chuyển sang trạng thái Huỷ, vẫn khôi phục lại được khi cần.
>
> Mở sổ tiền là thấy ngay: job nào đã thu đủ, job nào còn thiếu, tháng này thu — chi bao nhiêu.
>
> Đội FotoBro

### Nội dung (tiếng Anh, ngắn)

> Hi there,
>
> Day 3 with FotoBro. Two quick tips so nothing slips through:
>
> **1. The 8-step pipeline — jump to any step**
> Consult → Deposit → Scheduled → Shot → Selecting → Editing → Delivered → Done.
> Tap any step to jump straight there. A job stuck too long shows up on Today.
>
> **2. Money follows the steps**
> - At **Deposit**: record the deposit received.
> - At **Delivered**: FotoBro reminds you to collect the rest.
> - At **Done** with money still missing: you'll get a warning first.
> - Cancelled jobs can be restored anytime.
>
> Your money book shows at a glance which jobs are fully paid and which still owe you.
>
> The FotoBro Team

### Nút bấm gợi ý

| Nút | Đích |
| --- | --- |
| Chính: `Mở sổ tiền của tôi` | Deep link mở app → Sổ tiền / Báo cáo |
| Phụ (text link): `Xem lại pipeline 8 bước` | Trang hướng dẫn pipeline |

---

## Email 3 — Ngày 7: Sao lưu + dùng thử tính năng còn lại

**Thời điểm gửi:** ngày thứ 7 sau khi tải.
**Mục tiêu:** người dùng sao lưu dữ liệu (phòng mất máy) và thử các tính năng còn lại chưa dùng.

### Tiêu đề

- VI: `Tuần đầu với FotoBro: sao lưu ngay, kẻo mất dữ liệu`
- EN: `Your first week with FotoBro: back up now, before you lose data`

### Nội dung (tiếng Việt)

> Chào bạn,
>
> Một tuần rồi — bạn đã quen với FotoBro chưa?
>
> **Việc quan trọng nhất hôm nay: sao lưu dữ liệu.**
> FotoBro lưu dữ liệu trên máy của bạn (local-first). Mất máy, hỏng máy là mất hết job và sổ tiền
> nếu chưa sao lưu. Hãy xuất bản sao lưu ngay hôm nay và cất ở chỗ an toàn, rồi đặt lịch nhắc
> sao lưu định kỳ.
>
> **Nếu chưa thử, hãy thử nốt 3 tính năng này trong tuần này:**
>
> 1. **Lịch iPhone 1 chạm** — nhập lịch chụp từ Lịch iPhone, và bấm `Thêm vào Lịch iPhone`
>    trong chi tiết job để xuất lịch ra.
> 2. **Mẫu tin nhắn** — gửi tin cho khách bằng mẫu có sẵn, sửa được theo ý bạn trong Cài đặt.
> 3. **Máy tính giá** — tính nhanh giá job trước khi báo khách, kể cả khi chụp film
>    (Digital / Film / Cả hai, bảng giá film riêng trong Cài đặt).
>
> Cảm ơn bạn đã dùng FotoBro trong tuần đầu tiên. Có góp ý gì, cứ trả lời email này.
>
> Đội FotoBro

### Nội dung (tiếng Anh, ngắn)

> Hi there,
>
> One week in — how is FotoBro working for you?
>
> **Most important today: back up your data.**
> FotoBro keeps your data on your device (local-first). If you lose the phone without a backup,
> your jobs and money book are gone. Export a backup today and keep it somewhere safe.
>
> **If you haven't tried these yet, give them a go this week:**
>
> 1. **iPhone Calendar, one tap** — import shoots from your iPhone Calendar, and tap
>    `Add to iPhone Calendar` in a job to export it.
> 2. **Message templates** — message clients with ready-made templates, editable in Settings.
> 3. **Price calculator** — quote a job quickly before replying to a client, including film
>    shoots (Digital / Film / Both, with separate film prices in Settings).
>
> Thanks for your first week with FotoBro. Just reply to this email with any feedback.
>
> The FotoBro Team

### Nút bấm gợi ý

| Nút | Đích |
| --- | --- |
| Chính: `Sao lưu dữ liệu ngay` | Deep link mở app → Cài đặt → Sao lưu |
| Phụ (text link): `Xem các tính năng còn lại` | Trang hướng dẫn / Help Center |

---

## Ghi chú triển khai (khi có hệ thống email)

- [ ] Có hệ thống tài khoản + thu thập email người dùng (v1 chưa có — điều kiện tiên quyết).
- [ ] Tạo địa chỉ gửi (gợi ý `chao@fotobro.app`) và cấu hình SPF / DKIM / DMARC trước khi gửi loạt đầu.
- [ ] Deep link mở app cho 3 nút chính: tạo job, sổ tiền, sao lưu — kiểm chứng trên iOS thật.
- [ ] Chỉ gửi Email 2 / Email 3 cho người vẫn dùng app (tránh gửi cho người đã xoá app, nếu đo được).
- [ ] Thêm link huỷ nhận (unsubscribe) ở chân mỗi email và tuân thủ quy định chống spam của
      Apple / nhà cung cấp email.
- [ ] Không đưa dữ liệu job / tiền bạc / lịch chụp của người dùng vào nội dung email.
