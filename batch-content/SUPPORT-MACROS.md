# FotoBro — Câu trả lời mẫu cho hỗ trợ khách hàng (Support Macros)

> Mục đích: trả lời nhanh, đúng giọng FotoBro — lịch sự, thân thiện, ngắn gọn, hướng tới
> giải pháp. Dùng khi trả lời email/tin nhắn gửi tới **support@fotobro.app**
> (địa chỉ đang thiết lập — xem `PRIVACY.md`; chưa mua domain).
>
> Quy ước placeholder trong mọi mẫu:
> - `[Tên khách]` — tên khách hàng (điền tên thật khi biết, không để trống).
> - `[Chi tiết]` — thông tin cụ thể của trường hợp đó (tên job, ngày, thiết bị…).
> - `[Tên bạn]` — tên người trả lời hỗ trợ.
> - Mỗi mẫu có bản tiếng Việt (mặc định) và bản tiếng Anh (English version) ngay sau đó.
> - **Không bịa giá, không hứa ngày ra mắt tính năng, không hứa khôi phục dữ liệu
>   khi chưa chắc chắn.** Giá Nấc 2/3 chưa chốt (xem `PRICING-DRAFT.md` — mọi ô giá đều là TBD).
> - Nấc 1 (bản hiện tại) miễn phí, dữ liệu chỉ lưu trên máy người dùng (local-first),
>   sao lưu bằng file JSON do người dùng tự xuất.

---

## M-01 — Quên PIN / không mở được khoá app

**Khi dùng:** khách quên mã PIN, nhập sai nhiều lần, hoặc Face ID không mở được app.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã liên hệ FotoBro. Mình hiểu cảm giác bị khoá ngoài app giữa lúc đang cần xem
> lịch chụp — rất bực mình, mình sẽ giúp bạn mở lại nhanh nhất có thể.
>
> Bạn thử giúp mình các bước sau nhé:
> 1. Đóng hẳn app rồi mở lại, thử Face ID một lần nữa (đảm bảo camera trước không bị che).
> 2. Nếu Face ID vẫn không được, chọn **"Nhập PIN"** và thử lại mã PIN bạn hay dùng.
> 3. Nếu vẫn không mở được, bạn **xoá app rồi cài lại từ App Store** — dữ liệu trong app
>    sẽ mất, nhưng nếu bạn đã từng xuất file sao lưu JSON (Cài đặt → Sao lưu) thì chỉ cần
>    nhập lại file đó là có lại toàn bộ job và sổ tiền.
>
> ⚠️ Lưu ý quan trọng: vì FotoBro lưu dữ liệu chỉ trên máy của bạn (không có tài khoản,
> không có máy chủ), nên đội hỗ trợ **không thể xem hay đặt lại PIN giúp bạn** — đây là
> cách app bảo vệ dữ liệu của bạn, mong bạn thông cảm.
>
> Nếu sau khi cài lại mà file sao lưu gặp lỗi, bạn gửi file JSON đó cho mình qua email này,
> mình sẽ kiểm tra giúp bạn.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thanks for reaching out to FotoBro. I understand how frustrating it is to be locked out
> of the app right when you need your shoot schedule — I'll help you get back in as fast
> as possible.
>
> Please try these steps:
> 1. Fully close the app and reopen it, then try Face ID once more (make sure the front
>    camera isn't covered).
> 2. If Face ID still doesn't work, tap **"Enter PIN"** and try the PIN you usually use.
> 3. If it still won't open, **delete the app and reinstall it from the App Store** — the
>    data in the app will be lost, but if you previously exported a JSON backup file
>    (Settings → Backup), just import that file and all your jobs and money records
>    will be restored.
>
> ⚠️ Important: because FotoBro stores your data only on your device (no account, no
> server), our support team **cannot view or reset your PIN for you** — this is how the
> app protects your data. Thank you for understanding.
>
> If your backup file fails to import after reinstalling, please send the JSON file to
> me in reply to this email and I'll check it for you.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-02 — Mất dữ liệu (xoá app, đổi máy, mất máy)

**Khi dùng:** khách báo mất job, mất sổ tiền sau khi xoá app, đổi điện thoại hoặc mất máy.

### Tiếng Việt

> Chào [Tên khách],
>
> Mình rất tiếc khi nghe bạn bị mất dữ liệu — mình biết sổ job và sổ tiền là cả công việc
> của bạn, nên mình sẽ kiểm tra kỹ cùng bạn.
>
> FotoBro v1 lưu dữ liệu **chỉ trên máy của bạn**, chưa đồng bộ lên đám mây, nên việc khôi
> phục được hay không phụ thuộc vào việc bạn đã sao lưu trước đó chưa:
>
> - **Nếu bạn đã xuất file sao lưu JSON** (Cài đặt → Sao lưu → Xuất file): bạn chỉ cần
>   vào Cài đặt → Sao lưu → Nhập file trên máy mới (hoặc sau khi cài lại app) là có lại
>   toàn bộ dữ liệu. Bạn kiểm tra giúp mình trong Files / iCloud Drive / email xem còn
>   giữ file đó không nhé.
> - **Nếu bạn chưa từng sao lưu và đã xoá app / mất máy:** rất tiếc là dữ liệu không
>   thể khôi phục được, vì không có bản sao nào trên máy chủ của FotoBro.
>
> Để không gặp lại tình huống này, bạn nhớ **xuất file sao lưu JSON mỗi tuần một lần**
> và giữ file ở nơi an toàn (iCloud Drive hoặc gửi vào email của chính bạn) nhé.
>
> Bạn cho mình biết bạn thuộc trường hợp nào trong hai trường hợp trên, mình sẽ hướng
> dẫn bước tiếp theo cụ thể cho bạn.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> I'm very sorry to hear you lost your data — I know your jobs and money records are your
> whole business, so I'll go through this carefully with you.
>
> FotoBro v1 stores data **only on your device** and doesn't sync to the cloud yet, so
> whether recovery is possible depends on whether you backed up before:
>
> - **If you exported a JSON backup file** (Settings → Backup → Export): just go to
>   Settings → Backup → Import file on your new device (or after reinstalling) and all
>   your data will be restored. Please check Files / iCloud Drive / your email to see if
>   you still have that file.
> - **If you never backed up and already deleted the app / lost the device:** unfortunately
>   the data cannot be recovered, because no copy exists on FotoBro's servers.
>
> To avoid this happening again, please **export a JSON backup once a week** and keep the
> file somewhere safe (iCloud Drive, or emailed to yourself).
>
> Please let me know which of the two cases applies to you, and I'll guide you through
> the next steps.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-03 — Đăng nhập Google chưa sẵn sàng / bấm đăng nhập không được

**Khi dùng:** khách hỏi về nút đăng nhập Google, bấm không có phản hồi, hoặc hỏi khi nào có.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã hỏi về đăng nhập Google. Tính năng **đăng nhập Google 1 chạm** đang được
> hoàn thiện và **chưa sẵn sàng trong bản v1 hiện tại** — nên nếu bạn bấm nút mà chưa thấy
> gì xảy ra thì đó là đúng như hiện trạng, không phải do máy của bạn bị lỗi.
>
> Trong lúc chờ, bạn vẫn dùng app bình thường mà không cần đăng nhập: toàn bộ job, sổ tiền
> và nhắc lịch đều hoạt động đầy đủ trên máy của bạn.
>
> Khi đăng nhập Google sẵn sàng, app sẽ tự báo cho bạn khi mở app, và bạn chỉ cần bấm một
> lần là xong — không cần tạo tài khoản Google Cloud hay dán mã gì cả.
>
> Mình sẽ ghi nhận email này để báo cho bạn ngay khi tính năng ra mắt nhé.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thanks for asking about Google sign-in. **One-tap Google sign-in is still being finished
> and is not ready in the current v1** — so if you tap the button and nothing happens,
> that's expected, not a problem with your phone.
>
> In the meantime, you can use the app normally without signing in: all jobs, money
> records and reminders work fully on your device.
>
> When Google sign-in is ready, the app will let you know when you open it, and you'll
> just tap once — no need to create a Google Cloud project or paste any codes.
>
> I'll keep your email on file and let you know as soon as the feature is released.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-04 — Nhập lịch từ Lịch iPhone không được

**Khi dùng:** khách bấm nhập lịch nhưng không thấy sự kiện nào, hoặc app không xin quyền Lịch.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã báo lỗi nhập lịch. Mình sẽ giúp bạn kiểm tra từng bước một nhé:
>
> 1. Mở **Cài đặt iPhone → FotoBro → Lịch** và chắc chắn quyền Lịch đang bật
>    (chọn "Cho phép truy cập đầy đủ" nếu có).
> 2. Mở lại app FotoBro, vào phần nhập lịch và bấm **"Nhập từ Lịch iPhone"** một lần nữa.
> 3. Lưu ý: app chỉ nhập các sự kiện **trong 30 ngày tới** — sự kiện đã qua hoặc xa hơn
>    30 ngày sẽ không hiện.
>
> Nếu đã làm đủ 3 bước mà vẫn không được, bạn cho mình xin thêm thông tin nhé:
> - iPhone của bạn đang dùng iOS phiên bản mấy? (Cài đặt → Cài đặt chung → Giới thiệu)
> - Bạn có thấy app hiện bảng xin quyền Lịch lần nào không?
>
> Cảm ơn bạn đã kiên nhẫn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thanks for reporting the calendar import issue. Let's check it step by step:
>
> 1. Open **iPhone Settings → FotoBro → Calendars** and make sure calendar access is
>    turned on (choose "Full Access" if available).
> 2. Reopen FotoBro, go to calendar import and tap **"Import from iPhone Calendar"** again.
> 3. Note: the app only imports events **in the next 30 days** — past events or events
>    further than 30 days out won't appear.
>
> If you've tried all three steps and it still doesn't work, could you share a bit more?
> - Which iOS version is your iPhone running? (Settings → General → About)
> - Did the app ever show you a calendar permission prompt?
>
> Thank you for your patience,
> [Tên bạn] — FotoBro Support Team

---

## M-05 — App bị crash / đơ / tự thoát

**Khi dùng:** khách báo app văng ra, treo màn hình, hoặc không mở lên được.

### Tiếng Việt

> Chào [Tên khách],
>
> Mình xin lỗi vì app làm gián đoạn công việc của bạn. Bạn giúp mình vài thông tin để
> mình tìm đúng nguyên nhân nhé:
>
> 1. Bạn thử **đóng hẳn app rồi mở lại** (vuốt app lên khỏi đa nhiệm) — đa số trường hợp
>    đơ/văng sẽ hết sau bước này.
> 2. Nếu vẫn bị, bạn **khởi động lại iPhone** rồi mở app lại.
> 3. Bạn cho mình xin thêm:
>    - iPhone model gì, iOS phiên bản mấy?
>    - App văng khi bạn đang làm gì (mở job nào, bấm nút nào)? [Chi tiết]
>    - Bạn có đang dùng phiên bản app mới nhất trên App Store không?
>
> Trong lúc chờ, dữ liệu của bạn vẫn an toàn trên máy — crash không làm mất job hay sổ tiền.
> Nếu bạn chưa sao lưu gần đây, bạn vào **Cài đặt → Sao lưu → Xuất file** ngay khi mở
> lại được app nhé.
>
> Cảm ơn bạn đã báo lỗi giúp FotoBro tốt hơn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> I'm sorry the app interrupted your work. Could you help me with a few details so I can
> find the exact cause?
>
> 1. Please **fully close the app and reopen it** (swipe it away from the app switcher) —
>    most freeze/crash cases clear up after this step.
> 2. If it still happens, **restart your iPhone** and open the app again.
> 3. Could you also tell me:
>    - Which iPhone model and iOS version are you using?
>    - What were you doing when the app crashed (which job, which button)? [Chi tiết]
>    - Are you on the latest version of the app from the App Store?
>
> In the meantime, your data is safe on your device — a crash doesn't delete your jobs
> or money records. If you haven't backed up recently, please go to **Settings → Backup
> → Export file** as soon as you can reopen the app.
>
> Thank you for reporting this and helping FotoBro get better,
> [Tên bạn] — FotoBro Support Team

---

## M-06 — Muốn đổi giá gói chụp / giá film

**Khi dùng:** khách hỏi cách sửa bảng giá, thêm giá film, hoặc giá không tự điền đúng.

### Tiếng Việt

> Chào [Tên khách],
>
> Bạn đổi giá ngay trong app được nhé, không cần liên hệ hỗ trợ đâu — nhưng mình hướng dẫn
> nhanh để bạn làm một lần là xong:
>
> 1. Vào **Cài đặt → Bảng giá**.
> 2. Bấm vào gói bạn muốn sửa (Portrait, Couple, Wedding, Lookbook, Event) rồi nhập giá mới.
> 3. Nếu bạn chụp film: nhập thêm **giá film riêng cho từng gói** ở ô bên dưới — giá film
>    để trống (0) nghĩa là bạn chưa đặt giá cho gói đó.
> 4. Khi tạo job mới, chọn **Chụp bằng: Digital / Film / Cả hai**, app sẽ tự điền đúng
>    giá theo lựa chọn của bạn.
>
> Lưu ý nhỏ: đổi giá chỉ áp dụng cho **job tạo mới sau đó** — các job đã tạo trước đó vẫn
> giữ giá cũ, để sổ tiền của bạn không bị lệch.
>
> Nếu bạn sửa rồi mà giá vẫn không tự điền, bạn cho mình biết gói nào và bạn chọn Digital
> hay Film nhé, mình kiểm tra giúp bạn.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> You can change prices right in the app — no need to contact support — but here's a quick
> guide so you can do it in one go:
>
> 1. Go to **Settings → Price List**.
> 2. Tap the package you want to edit (Portrait, Couple, Wedding, Lookbook, Event) and
>    enter the new price.
> 3. If you shoot film: enter a **separate film price for each package** in the field
>    below — leaving it empty (0) means you haven't set a film price for that package yet.
> 4. When creating a new job, choose **Shoot with: Digital / Film / Both**, and the app
>    will fill in the right price automatically.
>
> One note: price changes only apply to **jobs created afterwards** — existing jobs keep
> their original price, so your money records stay accurate.
>
> If the price still doesn't fill in after editing, please tell me which package and
> whether you chose Digital or Film, and I'll check it for you.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-07 — Huỷ job / job không chốt, muốn khôi phục lại

**Khi dùng:** khách huỷ nhầm job, muốn khôi phục job đã huỷ, hoặc hỏi trạng thái Huỷ/Không chốt.

### Tiếng Việt

> Chào [Tên khách],
>
> Bạn yên tâm, job bị huỷ không bị xoá hẳn đâu — FotoBro giữ lại để bạn khôi phục khi cần.
>
> Cách khôi phục:
> 1. Mở job đó lên (job đã huỷ vẫn nằm trong danh sách, có nhãn **Huỷ** hoặc
>    **Không chốt**).
> 2. Bấm **"Khôi phục"** — job sẽ trở lại đúng bước pipeline trước khi huỷ, kèm đầy đủ
>    tiền cọc và ghi chú cũ.
>
> Một số lưu ý:
> - Job ở trạng thái **Không chốt** (khách chưa chốt sau tư vấn) và **Huỷ** (đã chốt rồi huỷ)
>   đều khôi phục được như nhau.
> - Nếu bạn huỷ job mà khách **đã đặt cọc**, app sẽ nhắc bạn xử lý tiền cọc (hoàn lại hay
>   giữ lại) — bạn kiểm tra sổ tiền để chắc chắn số tiền khớp nhé.
> - Chỉ khi bạn **xoá hẳn** job thì mới không khôi phục được — nên nếu chưa chắc, bạn cứ
>   để ở trạng thái Huỷ thay vì xoá.
>
> Nếu bạn không tìm thấy job đó trong danh sách, bạn cho mình biết tên job và ngày chụp
> dự kiến [Chi tiết], mình hướng dẫn bạn tìm nhé.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Don't worry — a cancelled job isn't deleted for good. FotoBro keeps it so you can
> restore it when needed.
>
> How to restore it:
> 1. Open that job (cancelled jobs stay in your list, marked **Cancelled** or
>    **Not confirmed**).
> 2. Tap **"Restore"** — the job returns to the exact pipeline step it was on before
>    cancellation, with its deposit and notes intact.
>
> A few notes:
> - **Not confirmed** (client didn't confirm after consultation) and **Cancelled**
>   (confirmed, then cancelled) jobs can both be restored the same way.
> - If you cancel a job where the client **already paid a deposit**, the app will remind
>   you to settle the deposit (refund it or keep it) — please check your money records
>   to make sure the amounts match.
> - Only a job you **permanently delete** can't be restored — so if you're unsure, leave
>   it as Cancelled instead of deleting it.
>
> If you can't find the job in your list, please tell me the job name and planned shoot
> date [Chi tiết], and I'll help you locate it.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-08 — Sao lưu / khôi phục file JSON bị lỗi

**Khi dùng:** khách xuất file sao lưu không được, hoặc nhập file sao lưu báo lỗi.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã báo lỗi sao lưu. Mình kiểm tra cùng bạn nhé:
>
> **Nếu xuất file không được:**
> 1. Bạn thử xuất lại: **Cài đặt → Sao lưu → Xuất file**, rồi chọn lưu vào **Files →
>    iCloud Drive** (tránh lưu vào vị trí lạ).
> 2. Kiểm tra dung lượng trống của iPhone còn đủ không (Cài đặt → Cài đặt chung →
>    Dung lượng iPhone).
>
> **Nếu nhập file báo lỗi:**
> 1. Bạn chắc chắn file đó là file sao lưu do FotoBro xuất ra (đuôi `.json`) và chưa bị
>    sửa đổi nhé — file đã chỉnh tay có thể không nhập được.
> 2. Thử nhập lại file đó trên cùng máy đã xuất ra, để loại trừ lỗi do chuyển file.
> 3. Nếu vẫn lỗi, bạn **gửi file JSON đó đính kèm email trả lời này** — mình sẽ kiểm tra
>    giúp bạn xem file có bị hỏng ở đâu không. (File chỉ chứa job và sổ tiền của bạn,
>    mình chỉ dùng để kiểm tra lỗi rồi xoá.)
>
> Bạn cho mình biết bạn đang gặp lỗi ở bước xuất hay bước nhập, và app báo dòng lỗi gì
> (nếu có) nhé.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thanks for reporting the backup issue. Let's check it together:
>
> **If exporting doesn't work:**
> 1. Try exporting again: **Settings → Backup → Export file**, then save it to **Files →
>    iCloud Drive** (avoid unusual locations).
> 2. Check that your iPhone still has enough free space (Settings → General → iPhone
>    Storage).
>
> **If importing reports an error:**
> 1. Please make sure the file is a backup exported by FotoBro (a `.json` file) and hasn't
>    been edited — a hand-edited file may fail to import.
> 2. Try importing it again on the same device that exported it, to rule out a file
>    transfer problem.
> 3. If it still fails, **attach the JSON file to your reply to this email** — I'll check
>    whether the file is damaged anywhere. (The file only contains your jobs and money
>    records; I'll use it only to diagnose the error, then delete it.)
>
> Please let me know whether the error happens when exporting or importing, and what
> error message the app shows (if any).
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-09 — Hỏi giá Nấc 2 / Nấc 3 (đồng bộ, sao lưu đám mây, làm nhóm)

**Khi dùng:** khách hỏi giá gói trả phí, đồng bộ CloudKit, làm việc nhóm/studio.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã quan tâm tới các gói nâng cao của FotoBro. Mình xin nói rõ hiện trạng để
> bạn không phải chờ đợi mơ hồ:
>
> - **Nấc 1 (bản hiện tại): miễn phí** — đầy đủ pipeline 8 bước, sổ tiền, nhắc lịch,
>   mẫu tin nhắn, máy tính giá, sao lưu JSON trên máy.
> - **Nấc 2 (đồng bộ/sao lưu mã hoá)** và **Nấc 3 (làm nhóm/studio)** là gói trả phí —
>   nhưng **giá cụ thể chưa được chốt**, nên mình chưa thể báo giá cho bạn lúc này.
>   Mình xin lỗi vì chưa có con số chính xác.
>
> Mình sẽ ghi nhận email của bạn vào danh sách chờ — ngay khi giá Nấc 2/3 được công bố,
> mình sẽ báo cho bạn đầu tiên. Trong lúc chờ, bản miễn phí vẫn dùng đầy đủ, không giới
> hạn số job.
>
> Bạn có thể cho mình biết bạn quan tâm nhất tới tính năng nào không (đồng bộ nhiều máy,
> sao lưu tự động, hay làm việc nhóm)? Mình sẽ chuyển ý kiến của bạn cho đội phát triển
> để ưu tiên đúng thứ bạn cần.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thank you for your interest in FotoBro's advanced plans. Let me be clear about where
> things stand, so you're not left waiting without an answer:
>
> - **Tier 1 (the current version): free** — full 8-step pipeline, money records,
>   reminders, message templates, price calculator, and on-device JSON backup.
> - **Tier 2 (encrypted sync/backup)** and **Tier 3 (team/studio)** are paid plans — but
>   **exact prices haven't been decided yet**, so I can't quote you a price right now.
>   I apologise for not having a firm number yet.
>
> I'll add your email to the waiting list — as soon as Tier 2/3 pricing is announced,
> you'll be among the first to know. In the meantime, the free version is fully usable
> with no limit on the number of jobs.
>
> Could you tell me which feature matters most to you (syncing across devices, automatic
> backup, or team collaboration)? I'll pass your feedback to the development team so
> they prioritise what you actually need.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-10 — Yêu cầu tính năng mới / góp ý cải tiến

**Khi dùng:** khách đề xuất thêm tính năng (Kanban, checklist theo bước, báo cáo mới…).

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã góp ý — những đề xuất từ photographer đang dùng app mỗi ngày là cách tốt
> nhất để FotoBro đi đúng hướng.
>
> Mình đã ghi nhận đề xuất của bạn: **[Chi tiết — tóm tắt tính năng khách muốn]**.
>
> Mình xin nói thật: đội phát triển đang tập trung hoàn thiện bản v1 cho thật ổn định
> (đăng nhập Google, nhập Lịch iPhone, sao lưu) trước khi thêm tính năng mới, nên mình
> chưa thể hứa ngày ra mắt cụ thể cho đề xuất này. Nhưng ý kiến của bạn đã được ghi vào
> danh sách yêu cầu tính năng, và những tính năng được nhiều người hỏi nhất sẽ được ưu
> tiên làm trước.
>
> Nếu tiện, bạn cho mình biết thêm một chút nhé: tính năng này giúp bạn tiết kiệm thời
> gian ở khâu nào nhất? Mình sẽ chuyển nguyên văn cho đội phát triển.
>
> Cảm ơn bạn đã đồng hành cùng FotoBro,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thank you for the suggestion — ideas from photographers who use the app every day are
> the best way for FotoBro to head in the right direction.
>
> I've recorded your request: **[Chi tiết — summary of the feature requested]**.
>
> To be honest with you: the development team is currently focused on making v1 stable
> (Google sign-in, iPhone Calendar import, backup) before adding new features, so I
> can't promise a specific release date for this one yet. But your suggestion is now on
> the feature request list, and the most-requested features get built first.
>
> If you don't mind, could you tell me a little more: which part of your work would this
> feature save you the most time on? I'll pass your words on to the development team
> exactly as you wrote them.
>
> Thank you for growing with FotoBro,
> [Tên bạn] — FotoBro Support Team

---

## M-11 — Face ID / khoá vân tay không mở được (riêng Face ID, không quên PIN)

**Khi dùng:** khách mở app bằng Face ID thất bại nhiều lần nhưng vẫn nhớ PIN.

### Tiếng Việt

> Chào [Tên khách],
>
> Cảm ơn bạn đã báo lỗi Face ID. Bạn thử giúp mình các bước sau nhé:
>
> 1. Mở **Cài đặt iPhone → Face ID & Mật mã** và kiểm tra Face ID vẫn hoạt động với các
>    app khác (ví dụ mở khoá máy).
> 2. Mở **Cài đặt iPhone → FotoBro** và chắc chắn quyền **Face ID** đang bật.
> 3. Trong app FotoBro, vào **Cài đặt → Khoá**, tắt Face ID rồi bật lại — app sẽ xin
>    quyền Face ID một lần nữa.
> 4. Nếu vẫn không được, bạn dùng **PIN để mở app tạm thời** — dữ liệu của bạn vẫn an toàn,
>    chỉ là cách mở khoá thay đổi thôi.
>
> Nếu Face ID lỗi với mọi app (không chỉ FotoBro), thì nguyên nhân nằm ở máy — bạn thử
> khởi động lại iPhone, hoặc đặt lại Face ID trong Cài đặt iPhone nhé.
>
> Bạn cho mình biết sau bước 3 Face ID đã hoạt động lại chưa nhé.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Thanks for reporting the Face ID issue. Please try these steps:
>
> 1. Open **iPhone Settings → Face ID & Passcode** and check that Face ID still works
>    with other apps (for example, unlocking your phone).
> 2. Open **iPhone Settings → FotoBro** and make sure **Face ID** permission is turned on.
> 3. In the FotoBro app, go to **Settings → Lock**, turn Face ID off and then on again —
>    the app will ask for Face ID permission once more.
> 4. If it still doesn't work, use your **PIN to open the app for now** — your data is
>    still safe; only the unlock method changes.
>
> If Face ID fails in every app (not just FotoBro), the cause is with the device — please
> try restarting your iPhone, or resetting Face ID in iPhone Settings.
>
> Please let me know whether Face ID is working again after step 3.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## M-12 — Đổi điện thoại mới / chuyển dữ liệu sang máy mới

**Khi dùng:** khách mua iPhone mới và muốn mang toàn bộ job + sổ tiền sang.

### Tiếng Việt

> Chào [Tên khách],
>
> Chúc mừng bạn có máy mới! Bạn chuyển dữ liệu sang máy mới theo 2 bước sau nhé — làm
> trước khi xoá app trên máy cũ:
>
> **Trên máy cũ:**
> 1. Mở FotoBro → **Cài đặt → Sao lưu → Xuất file** (file `.json`).
> 2. Lưu file vào **iCloud Drive** hoặc gửi file vào email của chính bạn.
>
> **Trên máy mới:**
> 1. Cài FotoBro từ App Store, mở app lên.
> 2. Vào **Cài đặt → Sao lưu → Nhập file**, chọn đúng file `.json` vừa xuất — toàn bộ
>    job, pipeline, sổ tiền và bảng giá sẽ hiện lại đầy đủ.
> 3. Kiểm tra nhanh một job gần nhất và số dư sổ tiền xem đã khớp chưa, rồi mới xoá app
>    trên máy cũ nhé.
>
> Lưu ý: FotoBro v1 **chưa tự đồng bộ qua iCloud** — nếu bạn chỉ đăng nhập iCloud trên
> máy mới mà không nhập file sao lưu thì dữ liệu sẽ không tự sang. Bản đồng bộ tự động
> (Nấc 2) sẽ ra mắt sau; giá chưa chốt nên mình chưa báo giá được.
>
> Nếu bước nhập file báo lỗi, bạn gửi file JSON đó cho mình qua email này, mình kiểm tra
> giúp bạn.
>
> Cảm ơn bạn,
> [Tên bạn] — Đội hỗ trợ FotoBro

### English

> Hi [Tên khách],
>
> Congratulations on your new phone! Move your data to the new device in two steps — do
> this **before** deleting the app on your old phone:
>
> **On your old phone:**
> 1. Open FotoBro → **Settings → Backup → Export file** (a `.json` file).
> 2. Save the file to **iCloud Drive** or email it to yourself.
>
> **On your new phone:**
> 1. Install FotoBro from the App Store and open it.
> 2. Go to **Settings → Backup → Import file** and select the `.json` file you just
>    exported — all your jobs, pipeline, money records and price list will reappear.
> 3. Quickly check your most recent job and your money balance to make sure everything
>    matches, and only then delete the app on your old phone.
>
> Note: FotoBro v1 **doesn't auto-sync via iCloud yet** — signing into iCloud on your new
> phone alone won't transfer your data without importing the backup file. Automatic sync
> (Tier 2) is coming later; pricing hasn't been decided, so I can't quote it yet.
>
> If the import step reports an error, please send the JSON file to me in reply to this
> email and I'll check it for you.
>
> Thank you,
> [Tên bạn] — FotoBro Support Team

---

## Ghi chú cho người trả lời hỗ trợ

- **Luôn điền `[Tên khách]` và `[Chi tiết]`** trước khi gửi — không gửi mẫu còn placeholder.
- **Chọn đúng mẫu** theo vấn đề khách gặp; nếu khách gặp 2 vấn đề cùng lúc, ghép 2 mẫu
  lại và giữ giọng văn thống nhất.
- **Không hứa:** ngày ra mắt tính năng, giá Nấc 2/3, khôi phục dữ liệu khi khách chưa
  sao lưu, đặt lại PIN thay khách.
- **Khi khách gửi file JSON sao lưu:** chỉ dùng để kiểm tra lỗi, xoá ngay sau khi xong,
  không lưu trữ, không chia sẻ.
- **Khi không chắc câu trả lời:** nói rõ "mình sẽ kiểm tra thêm và trả lời bạn trong
  [thời gian]" thay vì đoán.
- **Ngôn ngữ:** trả lời bằng ngôn ngữ khách đã viết (tiếng Việt mặc định; dùng bản
  English khi khách viết tiếng Anh).

---

*FotoBro — Trợ lý cho photographer tự do. Hỗ trợ: support@fotobro.app (đang thiết lập).*
*File này thuộc batch-content v1; cập nhật khi có thay đổi về tính năng, giá Nấc 2/3,
hoặc địa chỉ email hỗ trợ chính thức.*
