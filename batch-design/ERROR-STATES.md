# ERROR-STATES — Câu chữ lỗi · FotoBro iOS v1

> Phạm vi: chỉ câu chữ (copy), không phải code. App thật: `~/workspace/fotobro-ios-v1/www/index.html`
> (Capacitor 8, Bundle ID `com.fotobro.app`, local-first, tiếng Việt + tiếng Anh).
> Mỗi lỗi gồm: tiêu đề · giải thích 1–2 dòng · nút khắc phục chính · nút phụ.
> Ngôn ngữ hiển thị theo `state.cfg.locale` của app (Việt/Anh) — không hiện cả hai cùng lúc
> trong app; file này ghi cả hai để dev đối chiếu.
> Giọng văn: nói rõ chuyện gì xảy ra + làm gì tiếp theo. Không đổ lỗi cho người dùng
> (không dùng: "bạn đã làm sai", "file của bạn bị lỗi", "bạn chưa cấp quyền" kiểu trách móc).

## Quy ước chung

- **Nơi hiện:** `toast` = thông báo nổi ngắn (lỗi nhẹ, vẫn dùng tiếp được);
  `actionSheet` = bảng xác nhận (lỗi nặng / có nguy cơ mất dữ liệu / cần quyết định).
- **Nút phụ mặc định** cho mọi `actionSheet`: `Để sau` / `Not now` (đóng bảng, không làm gì thêm).
- **Dữ liệu an toàn:** khi lỗi xảy ra, job / sổ tiền / ảnh đã lưu trên máy vẫn còn nguyên —
  câu chữ phải nói rõ điều này mỗi khi có nguy cơ người dùng tưởng đã mất dữ liệu.
- **Mã lỗi** (`ERR-…`) chỉ để dev đối chiếu với code, không hiện cho người dùng.
- Câu chữ dưới đây thay thế các toast hiện có trong app khi cùng một tình huống
  (xem mục "Đối chiếu với app hiện tại" ở cuối).

---

## 1. Mất mạng khi đăng nhập Google — `ERR-GOOGLE-OFFLINE`

Hiện khi: bấm **Kết nối Google** mà không có mạng (hoặc mạng rớt giữa chừng khi Google
đang xác nhận). Nơi hiện: `toast`. Job, sổ tiền và lịch đã lưu vẫn xem được offline.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề / toast** | Chưa kết nối được Google — đang mất mạng | Couldn't connect to Google — you're offline |
| **Giải thích** | Đăng nhập Google cần mạng. Job và sổ tiền trên máy vẫn xem và ghi bình thường, có mạng rồi kết nối lại là xong. | Signing in to Google needs a connection. Your jobs and money log on this phone still work offline — just reconnect once you're back online. |
| **Nút chính** | Thử lại | Try again |
| **Nút phụ** | Dùng offline trước đã | Continue offline |

Ghi chú dev: nút **Thử lại** gọi lại `gConnect(false)`; nút phụ chỉ đóng toast.
Nếu Google trả về lỗi khác (không phải mất mạng), dùng toast hiện có của app:
"Google báo lỗi: …" — không dùng câu chữ của lỗi này.

## 2. Thiếu quyền Lịch iPhone — `ERR-CAL-PERMISSION`

App chỉ **đọc** Lịch iPhone (EventKit, `@capacitor/calendar`, 30 ngày tới), không sửa gì.
Có 2 trạng thái — iOS chỉ hỏi quyền 1 lần, nên câu chữ khác nhau:

### 2a. Chưa trả lời lần nào (hệ thống sắp hỏi)

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Cho FotoBro đọc Lịch iPhone nhé? | Let FotoBro read your iPhone Calendar? |
| **Giải thích** | App chỉ đọc lịch hẹn chụp 30 ngày tới để tạo buổi chụp, không sửa hay xoá gì trong Lịch của bạn. | FotoBro only reads your shoot appointments for the next 30 days to create jobs. It won't change or delete anything in your Calendar. |
| **Nút chính** | Cho phép đọc lịch | Allow Calendar access |
| **Nút phụ** | Để sau | Not now |

### 2b. Đã từ chối trước đó (iOS không hỏi lại — phải bật trong Cài đặt)

Hiện khi: `readCalendar !== 'granted'` sau khi đã hỏi. Nơi hiện: `toast` + mở sheet nhập lịch trống.
Thay thế toast hiện có: "Chưa cho phép đọc Lịch iPhone — bật trong Cài đặt iPhone → FotoBro → Lịch".

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề / toast** | Chưa đọc được Lịch iPhone | Can't read your iPhone Calendar yet |
| **Giải thích** | Quyền đọc lịch đang tắt nên app chưa lấy được lịch hẹn. Bật lại trong Cài đặt iPhone → FotoBro → Lịch, rồi quay lại bấm nhập lại. | Calendar access is off, so FotoBro can't fetch your appointments yet. Turn it back on in iPhone Settings → FotoBro → Calendar, then come back and import again. |
| **Nút chính** | Mở Cài đặt iPhone | Open iPhone Settings |
| **Nút phụ** | Nhập bằng Google Lịch | Import from Google Calendar |

Ghi chú dev: nút **Mở Cài đặt iPhone** mở `App-Prefs:` / Settings của app (native);
nếu không mở được thì chỉ hiện đường dẫn bằng chữ như trên. Nút phụ gọi `gConnect(false)`.
Trường hợp máy không có Lịch iPhone native (bản web): giữ toast hiện có của app
("Máy này chưa có Lịch iPhone native — dùng app iOS trên iPhone, hoặc đăng nhập Google…").

## 3. Thiếu quyền thông báo — `ERR-NOTIF-PERMISSION`

Hiện khi: nhắc lịch / nhắc việc không gửi được vì quyền thông báo đang tắt.
Nhắc trong app vẫn hoạt động: buổi chụp sắp tới vẫn hiện ở tab **Hôm nay**, và lịch đã ghi
trên Google Lịch / file `.ics` vẫn nhắc trước 12 tiếng như thường.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Thông báo đang tắt | Notifications are off |
| **Giải thích** | App chưa gửi được nhắc việc ra ngoài màn hình khoá. Buổi chụp sắp tới vẫn hiện ở tab Hôm nay, bạn mở app là thấy. | FotoBro can't send reminders to your lock screen yet. Upcoming shoots still show on the Today tab whenever you open the app. |
| **Nút chính** | Bật thông báo | Turn on notifications |
| **Nút phụ** | Để sau — xem ở tab Hôm nay | Later — I'll check the Today tab |

Ghi chú dev: nút chính mở Cài đặt iPhone → FotoBro → Thông báo. Không hiện lỗi này
quá 1 lần mỗi lần mở app; nếu người dùng đã bấm "Để sau" thì chỉ nhắc lại khi họ bấm
vào một nhắc việc cụ thể.

## 4. Hết dung lượng lưu trữ — `ERR-STORAGE-FULL`

App lưu mọi thứ trên máy (localStorage `troLyXeo.v1`, khoảng ~5 MB; ảnh trang chủ lưu
riêng, tối đa 60 ảnh). Có 2 trạng thái:

### 4a. Bộ nhớ lưu job / sổ tiền đã đầy (không lưu tự động được nữa)

Hiện khi: `saveLocal()` ghi localStorage thất bại. Nơi hiện: `actionSheet` (vì có nguy cơ
mất dữ liệu mới nhập). Dữ liệu đã lưu trước đó vẫn còn.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Bộ nhớ trên máy đã đầy | Storage on this phone is full |
| **Giải thích** | App chưa lưu được thay đổi vừa rồi. Hãy tải một bản sao lưu ngay để giữ dữ liệu an toàn, rồi xoá bớt ảnh trang chủ hoặc job cũ. | FotoBro couldn't save your latest change. Download a backup right now to keep your data safe, then free some space by removing home photos or old jobs. |
| **Nút chính** | Tải bản sao lưu ngay | Download a backup now |
| **Nút phụ** | Để sau | Not now |

### 4b. Đã đủ 60 ảnh trang chủ (thêm ảnh mới không được)

Hiện khi: thêm ảnh trang chủ khi đã đủ 60 ảnh. Nơi hiện: `toast`.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề / toast** | Đã đủ 60 ảnh trang chủ | You've reached 60 home photos |
| **Giải thích** | Ảnh mới chưa được thêm. Xoá một ảnh cũ trong mục ảnh trang chủ rồi thêm lại nhé. | The new photo wasn't added. Remove an old home photo first, then add this one again. |
| **Nút chính** | Xem ảnh trang chủ | View home photos |
| **Nút phụ** | Để sau | Not now |

Ghi chú dev: sau khi tải sao lưu xong ở 4a, hiện toast "Đã tải bản sao lưu về máy"
(câu chữ hiện có của app). Không tự xoá dữ liệu của người dùng để giải phóng dung lượng.

## 5. Sao lưu / khôi phục lỗi — `ERR-BACKUP-FAILED`

### 5a. Tải bản sao lưu xuống không được (xuất file lỗi / bị gián đoạn)

Nơi hiện: `toast`. File sao lưu tên `fotobro-sao-luu.json`.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề / toast** | Chưa tải được bản sao lưu | Couldn't download the backup |
| **Giải thích** | File sao lưu chưa được tạo xong. Dữ liệu trên máy vẫn còn nguyên — thử tải lại nhé. | The backup file wasn't finished. Your data on this phone is still intact — please try downloading again. |
| **Nút chính** | Thử tải lại | Try again |
| **Nút phụ** | Để sau | Not now |

### 5b. Mở lại bản sao lưu không được (đọc / khôi phục gián đoạn giữa chừng)

Nơi hiện: `actionSheet`. Dữ liệu đang có trên máy **không bị thay** khi khôi phục lỗi —
câu này phải có trong giải thích.

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Chưa mở lại được bản sao lưu | Couldn't restore this backup |
| **Giải thích** | File chưa đọc xong nên app giữ nguyên dữ liệu đang có trên máy, không thay gì cả. Thử mở lại file, hoặc thử một bản sao lưu khác mới hơn. | The file didn't finish reading, so FotoBro kept your current data on this phone unchanged. Try opening the file again, or try a newer backup. |
| **Nút chính** | Thử mở lại | Try again |
| **Nút phụ** | Giữ dữ liệu hiện tại | Keep my current data |

## 6. File sao lưu không đúng định dạng — `ERR-BACKUP-FORMAT`

Hiện khi: file đã chọn không phải file sao lưu của FotoBro — mở được file nhưng bên trong
không có `jobs` và `txs` dạng danh sách (kiểm tra hiện có của app), hoặc file không phải JSON.
Thay thế 2 toast hiện có: "File này không giống bản sao lưu của FotoBro" và
"Chưa đọc được file này, bạn thử lại nha". Nơi hiện: `toast` (file sai định dạng) /
`actionSheet` (file đúng dạng JSON nhưng thiếu dữ liệu — để người dùng quyết định).

### 6a. File không phải JSON / không đọc được

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề / toast** | File này chưa mở được | This file couldn't be opened |
| **Giải thích** | Hình như đây không phải file sao lưu của FotoBro (file đúng có tên `fotobro-sao-luu.json`). Kiểm tra lại file rồi thử mở lại nhé. | This doesn't look like a FotoBro backup (the right file is named `fotobro-sao-luu.json`). Please check the file and try opening it again. |
| **Nút chính** | Chọn file khác | Choose a different file |
| **Nút phụ** | Để sau | Not now |

### 6b. File đúng là JSON nhưng không có dữ liệu buổi chụp / thu chi

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | File này không có dữ liệu FotoBro | This file has no FotoBro data |
| **Giải thích** | File mở được nhưng bên trong không có buổi chụp hay khoản thu chi nào. Có thể bạn đã chọn nhầm file — dữ liệu trên máy vẫn giữ nguyên. | The file opened, but it contains no shoots or money entries. You may have picked the wrong file — your data on this phone is unchanged. |
| **Nút chính** | Chọn file khác | Choose a different file |
| **Nút phụ** | Giữ dữ liệu hiện tại | Keep my current data |

Ghi chú dev: chỉ hiện 6b khi file parse được JSON nhưng thiếu `jobs`/`txs` hợp lệ.
File JSON hợp lệ thì giữ flow xác nhận hiện có của app ("Mở bản sao lưu? … Dữ liệu đang
có trên máy sẽ được thay bằng bản này." + nút "Thay bằng bản sao lưu") — không đổi.

---

## Đối chiếu với app hiện tại (`www/index.html`)

| Tình huống | Câu chữ cũ trong app | Dùng câu chữ mới ở trên |
|---|---|---|
| Lịch iPhone chưa được cấp quyền | "Chưa cho phép đọc Lịch iPhone — bật trong Cài đặt iPhone → FotoBro → Lịch" | §2b |
| Lịch iPhone đọc lỗi chung | "Chưa đọc được Lịch iPhone (…)" | §2b (nếu do quyền) hoặc §5b-style: giữ nguyên, chỉ thêm "dữ liệu trên máy vẫn còn nguyên" |
| Google lỗi chung | "Google báo lỗi: …" | Giữ nguyên (không phải lỗi mất mạng) |
| Google mất mạng khi tải lịch | "Đang mất mạng — đang xem lịch đã lưu lần trước." | Giữ nguyên cho tải lịch; §1 chỉ dùng cho **đăng nhập** |
| File sao lưu sai định dạng | "File này không giống bản sao lưu của FotoBro" | §6b |
| File sao lưu không đọc được | "Chưa đọc được file này, bạn thử lại nha" | §6a |
| Không lưu tự động được | "Máy này không lưu tự động được (trình duyệt chặn bộ nhớ khi mở file). Bạn nhớ bấm "Tải bản sao lưu" sau mỗi ngày chụp nhé." | Giữ nguyên cho trường hợp bị chặn bộ nhớ khi mở file; §4a dùng khi bộ nhớ đã đầy |

## Những câu KHÔNG dùng

- "Bạn đã làm sai…", "File của bạn bị lỗi", "Bạn chưa cấp quyền" (đổ lỗi).
- "Lỗi hệ thống", "Đã xảy ra lỗi không xác định" (không nói được gì tiếp theo).
- Hứa hẹn không chắc chắn: "sẽ không mất dữ liệu" khi khôi phục chưa xong —
  chỉ nói "giữ nguyên dữ liệu đang có" khi code thật sự chưa ghi đè (xem §5b/§6b).
