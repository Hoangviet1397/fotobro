# FotoBro iOS v1 — Xoá dữ liệu & xoá tài khoản (App Store Review Guideline 5.1.1(v))

> Ngày: 20/11/2026. Trạng thái: **tài liệu, dựa trên code thật đã đọc — chưa kiểm chứng
> trên iPhone thật.**
> Phạm vi: `~/workspace/fotobro-ios-v1/` — `www/index.html`, `www/capacitor-bridge.js`,
> `www/fotobro-config.js`, `PRIVACY.html`, `SECURITY-AUDIT.md`, `BACKUP-V2.md`.
> Chỉ viết file này. Không sửa code, không tạo tài khoản, không push GitHub.
> Mọi khẳng định về hành vi app đều có dòng code đối chứng; chỗ nào là suy luận
> hoặc chưa kiểm được thì ghi rõ.

## 0. Tóm tắt cho người duyệt App Store (đọc 30 giây)

- FotoBro v1 **không có tài khoản người dùng**: không đăng ký, không đăng nhập vào
  máy chủ FotoBro, không có máy chủ riêng, không đồng bộ lên cloud (CloudKit Nấc 2
  chưa bật — `fotobro-config.js`, trạng thái `not-configured`). Vì không có tài khoản
  nên **không có luồng "xoá tài khoản"** — Guideline 5.1.1(v) được đáp ứng bằng luồng
  **xoá dữ liệu trong app** (§2–§4) + hướng dẫn liên hệ hỗ trợ (§7).
- Người dùng xoá toàn bộ dữ liệu ngay trong app: **Cài đặt → Dữ liệu & sao lưu →
  "Xoá toàn bộ dữ liệu"** — xoá job, thu chi, ảnh trang chủ, cài đặt, logo, khoá app,
  token Google và dữ liệu Google đã tải, rồi app tải lại trắng như mới. Không cần
  đăng nhập, không cần gửi email, không cần chờ duyệt.
- Mọi dữ liệu chỉ nằm trên iPhone của người dùng. **Gỡ app khỏi iPhone là xoá sạch
  sandbox** — toàn bộ localStorage + IndexedDB của app biến mất theo (§8).
- Địa chỉ hỗ trợ `support@fotobro.app` hiện **chỉ là placeholder** (domain chưa mua,
  chưa có hộp mail thật) — xem §7. Đây là điểm phải xong trước khi nộp App Store.

## 1. Guideline 5.1.1(v) áp dụng cho FotoBro như thế nào

Apple yêu cầu: app nào cho tạo tài khoản thì phải cho xoá tài khoản **trong app**,
kèm theo việc xoá dữ liệu cá nhân đi kèm.

| Điều kiện của Apple | FotoBro v1 | Kết luận |
|---|---|---|
| App có tạo tài khoản không? | Không. Không có màn đăng ký, không có tài khoản FotoBro, không có mật khẩu tài khoản. "Đăng nhập Google" chỉ là OAuth để đọc/ghi Lịch/Gmail/Danh bạ/Drive của chính người dùng, không tạo tài khoản FotoBro | Không có tài khoản để xoá |
| App có thu thập dữ liệu cá nhân lên máy chủ không? | Không. Không máy chủ, không analytics, không tracking, không SDK quảng cáo (`SECURITY-AUDIT.md` §1; `fetch(` trong app chỉ tới Google APIs + revoke) | Không có dữ liệu phía máy chủ để xoá |
| Người dùng có xoá được dữ liệu của mình trong app không? | Có — §2–§4 dưới đây | Đáp ứng qua xoá dữ liệu trong app |
| Có cần kênh liên hệ để yêu cầu xoá không? | Có — vì có trường hợp người dùng không mở được app (quên PIN + Face ID lỗi, mất máy). Kênh này hiện chưa hoàn thiện, xem §7 | Cần xong trước khi nộp |

**Hệ quả thực tế:** vì không có tài khoản và không có máy chủ, yêu cầu xoá dữ liệu
của người dùng **không có gì để xử lý phía server** — toàn bộ việc xoá diễn ra trên
máy người dùng (§2–§4, §8). Kênh email hỗ trợ chỉ còn 2 vai trò: (a) hướng dẫn
người dùng tự xoá trong app hoặc gỡ app, khi họ không tự làm được; (b) hướng dẫn
thu hồi quyền Google phía Google khi họ đã mất máy. Cả hai đều phải nói rõ trong
trả lời hỗ trợ — không được hứa "chúng tôi đã xoá dữ liệu của bạn trên hệ thống"
khi thực tế không có hệ thống nào giữ dữ liệu đó.

## 2. Người dùng xoá dữ liệu ở đâu trong app

### 2.1 Đường đi

1. Mở app → tab **Hôm nay** → nút **Cài đặt** (bánh răng).
2. Kéo tới mục **"Dữ liệu & sao lưu"** (`www/index.html:662-666`).
3. Bấm nút có biểu tượng thùng rác, nhãn thay đổi theo trạng thái sổ
   (`www/index.html:1978`, handler `:2263-2271`):
   - Sổ đang có dữ liệu mẫu (`state.sample === true`): nhãn **"Xoá dữ liệu mẫu,
     bắt đầu trống"** — chỉ xoá job/tx mẫu, **giữ nguyên** cài đặt giá và thiết bị.
   - Sổ đã là dữ liệu thật: nhãn **"Xoá toàn bộ dữ liệu"** — xoá hết (§4).
4. App hiện bảng xác nhận liệt kê đúng số lượng sẽ xoá ("Xoá hết N buổi chụp,
   M khoản thu chi, ảnh trang chủ, cài đặt, logo, khoá app và ngắt kết nối Google
   trên máy này") và cảnh báo 2 thứ **không** xoá được từ trong app: file sao lưu
   đã tải về máy, và sự kiện đã ghi trên Google Lịch. Người dùng bấm **"Xoá tất
   cả"** mới xoá — không có xoá ngầm, không có xoá khi bấm nhầm 1 chạm.
5. App xoá xong thì tải lại trắng như mới và hiện thông báo "Đã xoá toàn bộ dữ
   liệu trên máy này" (`www/index.html:2286`).

### 2.2 Các mức xoá khác trong app (không phải "xoá toàn bộ")

| Thao tác | Ở đâu | Xoá cái gì | Không hoàn tác? |
|---|---|---|---|
| Xoá 1 job | Chi tiết job → "Xoá buổi chụp" | Job + toàn bộ khoản thu/chi của job đó + trạng thái check của job; nếu job có `gEventId` thì xoá luôn sự kiện đó trên Google Lịch (`www/index.html:1508-1518`, `gCalDelete` `:3527-3530`) | Có — dialog ghi rõ "Không hoàn tác được" |
| Huỷ job | Chi tiết job → "Huỷ job" | **Không xoá gì** — job chuyển trạng thái "Đã huỷ", tiền và lịch giữ nguyên, khôi phục được về "Tư vấn" (`:1502-1506`) | Khôi phục được — đừng nhầm với xoá |
| Xoá 1 khoản thu/chi | Sổ tiền → khoản đó → "Xoá khoản này" | Chỉ khoản đó (`:1831`) | Có |
| Xoá dữ liệu mẫu | Cài đặt → nút rác (khi còn dữ liệu mẫu) | Chỉ job/tx mẫu; giữ cài đặt giá, thiết bị (`:2265-2266`) | Có |
| Xoá logo | Cài đặt → Bảng logo → "Xoá logo" | Chỉ chuỗi dataURL logo trong `cfg.logo` (`:2490`) | Có |
| Ngắt kết nối Google | Cài đặt → "Ngắt kết nối" | Thu hồi access token + refresh token (nếu còn) tại Google, xoá lịch/email/danh bạ đã tải trên máy; job và sổ tiền **giữ nguyên** (`:2455-2477`) | Có — nhưng đăng nhập lại được |
| Xoá toàn bộ dữ liệu | Cài đặt → nút rác (sổ thật) | Tất cả — §4 | Có |

## 3. Dữ liệu app đang giữ — bản đồ trước khi xoá

(Đối chiếu `SECURITY-AUDIT.md` §1 và code thật.)

| Dữ liệu | Lưu ở đâu | Ghi chú |
|---|---|---|
| Job + thu/chi + cài đặt (tên khách, SĐT, email, giá, cọc, ghi chú, bảng giá, mẫu tin, logo) | `localStorage` key `troLyXeo.v1` (`:904-909`) | JSON plaintext, không mã hoá riêng (dựa vào mật mã iPhone + sandbox iOS) |
| Ảnh trang chủ (tối đa 60, thu nhỏ ~1400px JPEG 0.85) | IndexedDB `troLyXeoPhotos`, store `photos` (`:3722`) | Blob JPEG; EXIF (kể cả GPS) đã bị lược khi vẽ lại qua canvas |
| Khoá app | `localStorage` `troLyXeo.lock` (`:3626`) | PIN băm SHA-256(salt + PIN); quên cả Face ID lẫn PIN thì phải xoá dữ liệu web mới vào lại được |
| Access token Google | `sessionStorage` `troLyXeo.gtoken` (`:2941`) | Hết hạn sau ~1 giờ; chỉ sống trong phiên |
| Refresh token Google | **Không lưu ở v1** — xem §9.1 | Code cố tình không lưu (`gExchangeCode`, `:3011-3016`); bản cũ từng lưu thì được dọn khi app khởi động (`:938`) |
| Lịch / Gmail / Danh bạ đã tải từ Google | `localStorage` `troLyXeo.gcal`, `troLyXeo.gmail`, `troLyXeo.gseen`, `troLyXeo.gcontacts` (`:2941`, `:3205`) | Tồn tại cả sau khi access token hết hạn |
| PKCE verifier + `state` lúc đăng nhập | `localStorage` `troLyXeo.gstate` | Chỉ sống trong lúc đăng nhập, xoá ngay sau khi đổi code |
| Ảnh ghim trang chủ | `localStorage` `troLyXeo.heroPin` | |
| Dấu thời gian sao lưu | `localStorage` `troLyXeo.lastBackup` | Key của sao lưu v1; key sao lưu v2 (`fotobro.lastBackupAt`, xem `BACKUP-V2.md` §1) chưa tồn tại trong app vì v2 chưa nối vào |
| Cờ đã xem chào mừng / đã tắt nhắc cài app | `troLyXeo.welcomed`, `troLyXeo.installDismissed` | Không phải dữ liệu cá nhân |
| File sao lưu người dùng tự tải | File `fotobro-sao-luu.json` trong Files / nơi người dùng cất (`:2224`) | JSON plaintext v1, chỉ có `{jobs, txs, cfg}` — **không có ảnh** |
| Ảnh khách chụp thật | **Không nằm trong app** — app chỉ lưu link thư mục Drive (`driveLink`, chuỗi URL do người dùng dán) | App không xoá được file trên Drive của người dùng |

## 4. "Xoá toàn bộ dữ liệu" xoá những gì — hành vi thật của `wipeAll()`

Hàm duy nhất `wipeAll()` (`www/index.html:2243-2264`, comment H5 ở `:2243-2248`).
Thứ tự thực hiện:

1. **Thu hồi token Google tại Google:** lấy access token hiện tại (nếu còn) +
   refresh token cũ trong `localStorage` (nếu còn sót từ bản trước), gửi
   `POST https://oauth2.googleapis.com/revoke?token=…` cho từng token.
2. **Huỷ URL ảnh tạm** trong bộ nhớ (`URL.revokeObjectURL` cho `myShots`).
3. **Xoá IndexedDB ảnh:** `indexedDB.deleteDatabase('troLyXeoPhotos')` — toàn bộ
   ảnh trang chủ.
4. **Xoá 14 key localStorage** (`WIPE_KEYS`, `:2249`): `troLyXeo.v1`,
   `troLyXeo.lock`, `troLyXeo.gtoken`, `troLyXeo.gcal`, `troLyXeo.gmail`,
   `troLyXeo.gseen`, `troLyXeo.gcontacts`, `troLyXeo.gstate`,
   `troLyXeo.grefresh`, `troLyXeo.ghadRefresh`, `troLyXeo.heroPin`,
   `troLyXeo.lastBackup`, `troLyXeo.welcomed`, `troLyXeo.installDismissed`.
5. **Xoá sessionStorage:** `troLyXeo.gtoken`; đặt cờ `troLyXeo.wiped = '1'`
   để sau khi tải lại thì hiện toast xác nhận.
6. **Reset dữ liệu trong bộ nhớ** (`state.jobs = []; state.txs = [];`,
   `state.cfg` về `DEFAULT_CFG`) rồi `location.reload()` — app mở lại trắng như mới.

### 4.1 Bảng xoá / còn lại sau "Xoá toàn bộ"

| Hạng mục | Xoá? | Ghi chú |
|---|---|---|
| Job, thu/chi | ✅ Xoá | Cả trong `localStorage` lẫn bộ nhớ |
| Cài đặt: giá gói, % cọc, hạn giao, thiết bị, chi cố định, mẫu tin, ngôn ngữ, tiền tệ, tên studio | ✅ Xoá (về mặc định) | `cfg` reset về `DEFAULT_CFG` |
| Logo studio | ✅ Xoá | Nằm trong `cfg.logo` |
| Ảnh trang chủ (tối đa 60) | ✅ Xoá | `deleteDatabase('troLyXeoPhotos')` |
| Khoá app (PIN / Face ID) | ✅ Xoá | `troLyXeo.lock` bị xoá — sau wipe, app mở lại không hỏi khoá |
| Access token Google | ✅ Thu hồi + xoá | Revoke tại Google + xoá khỏi máy |
| Refresh token Google (nếu còn sót từ bản cũ) | ✅ Thu hồi + xoá | Revoke tại Google + xoá khỏi máy |
| Lịch / Gmail / Danh bạ đã tải | ✅ Xoá khỏi máy | `gcal` / `gmail` / `gseen` / `gcontacts` |
| File sao lưu JSON đã tải về máy | ❌ **Không xoá được** | File nằm trong Files / iCloud Drive, ngoài sandbox app — người dùng tự xoá trong Files. Dialog wipeAll đã cảnh báo điều này |
| Sự kiện buổi chụp đã ghi trên Google Lịch | ❌ **Không xoá** | Sự kiện nằm trên Google Lịch của người dùng — xoá trong app Lịch hoặc Google Calendar |
| Email đã gửi cho khách / tin nhắn đã chép qua Messenger | ❌ Không thu hồi được | Đã rời máy theo ý người dùng từ trước |
| File ảnh khách trên Google Drive | ❌ Không xoá | App chỉ lưu link, không sở hữu file |
| Thông báo nhắc lịch đã lên lịch | ⚠️ **Chưa chắc xoá** — xem §9.3 | `wipeAll()` không huỷ notification đã schedule |
| Dữ liệu CloudKit | Không áp dụng ở v1 | Chưa bật; khi bật Nấc 2 thì cần bổ sung luồng xoá bản sao iCloud trong tài liệu này |

## 5. Xoá 1 job — xoá tới đâu

- Job + toàn bộ thu/chi gắn với job đó + trạng thái check của job: xoá ngay,
  đồng bộ, không hoàn tác (`:1508-1518`).
- Sự kiện Google Lịch của job (nếu có `gEventId`): gọi `gCalDelete()` — `DELETE
  https://www.googleapis.com/calendar/v3/calendars/primary/events/<id>`. Nhưng
  hàm này **chỉ chạy khi còn access token hợp lệ và còn scope ghi lịch**
  (`:3527-3530`); token hết hạn thì sự kiện ở lại Google Lịch — xem §9.4.
- Không xoá: thư mục Drive của job (chỉ là link), email/tin nhắn đã gửi cho
  khách của job đó, file sao lưu cũ có chứa job đó.
- Thông báo nhắc lịch của job: xem §9.3 (hiện chưa huỷ).

## 6. Thời gian xoá

| Kênh | Thời gian |
|---|---|
| Xoá 1 job / 1 khoản / "Xoá toàn bộ" trong app | **Ngay lập tức** — dữ liệu trên máy bị xoá đồng bộ trong lúc bấm (localStorage + IndexedDB + reload trang). Không có hàng chờ, không có "xoá sau 30 ngày" |
| Thu hồi token Google | Gửi ngay khi bấm, nhưng là **best-effort, không chờ xác nhận** — xem §9.2. Nếu mất mạng lúc bấm, lệnh revoke có thể không tới được Google; khi đó token vẫn còn hiệu lực phía Google cho tới khi hết hạn (access token ~1 giờ) hoặc người dùng thu hồi thủ công |
| Xoá sự kiện trên Google Lịch khi xoá job | Gửi ngay, fire-and-forget, không báo thành công/thất bại cho người dùng |
| Gỡ app khỏi iPhone | **Ngay lập tức** — sandbox bị xoá cùng app (§8) |
| Yêu cầu qua email hỗ trợ | Không có dữ liệu phía máy chủ để xoá nên **không có thời gian xử lý xoá phía server**. Thời gian trả lời email xem §7 — hiện chưa cam kết được vì hộp mail chưa tồn tại |

## 7. Yêu cầu xoá qua email — `support@fotobro.app` (placeholder)

### 7.1 Trạng thái thật (20/11/2026)

- `support@fotobro.app` **chưa phải hộp mail hoạt động**: domain `fotobro.app`
  chưa mua (xem `fotobro-config.js:17` — "cần mua domain fotobro.app trước"),
  `supportEmail: ''` trong config (`fotobro-config.js:23`).
- `PRIVACY.html` §9 và `SUPPORT.html:91` đã ghi địa chỉ này kèm chú thích "đang
  trong quá trình thiết lập; trong lúc chờ, liên hệ qua thông tin trong app, mục
  Cài đặt → Liên hệ" — **nhưng trong code app hiện tại không có mục "Liên hệ"
  nào trong Cài đặt** (grep `Liên hệ` / `supportEmail` trong `www/index.html`
  không có kết quả nào ngoài mailto gửi cho khách). Đây là lệch tài liệu ↔ code,
  xem §9.6.
- `PRIVACY.md:8,130,171` cũng ghi địa chỉ này với cùng chú thích "đang thiết lập".

### 7.2 Quy trình yêu cầu xoá qua email (áp dụng sau khi hộp mail hoạt động)

Vì không có tài khoản và không có dữ liệu phía máy chủ, email yêu cầu xoá chỉ
xử lý được các việc sau — trả lời hỗ trợ phải nói đúng như vậy, không hứa hơn:

1. Người dùng gửi email tới `support@fotobro.app` với tiêu đề gợi ý:
   **"FotoBro — Yêu cầu xoá dữ liệu"**, ghi rõ: (a) đang dùng FotoBro trên iPhone,
   (b) vấn đề gặp phải (ví dụ: không mở được app vì quên PIN, đã mất máy, hay
   muốn chắc chắn dữ liệu đã sạch), (c) có còn đăng nhập Google trong app không.
2. Hỗ trợ trả lời hướng dẫn theo từng trường hợp:
   - **Còn cầm máy, mở được app:** hướng dẫn Cài đặt → "Xoá toàn bộ dữ liệu"
     (§2.1), rồi tự xoá file sao lưu trong Files và sự kiện trên Google Lịch.
   - **Còn cầm máy nhưng quên PIN + Face ID lỗi:** không có cách mở lại app —
     hướng dẫn gỡ app rồi cài lại (dữ liệu sạch theo §8). Nói rõ: gỡ app là mất
     hết dữ liệu trên máy, không khôi phục được nếu không có file sao lưu.
   - **Đã mất máy:** nói rõ **không xoá được từ xa** — FotoBro v1 không có máy
     chủ, không có tính năng xoá từ xa, không có tài khoản để khoá. Hướng dẫn:
     (i) thu hồi quyền FotoBro tại
     `myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba → FotoBro
     → Xoá quyền` (cắt token Google còn sống); (ii) dùng Find My để khoá/xoá
     iPhone; (iii) đổi mật khẩu Google nếu nghi lộ máy.
   - **Muốn xoá dữ liệu trên Google:** hướng dẫn tự xoá sự kiện trên Google Lịch
     và file trên Drive — FotoBro không xoá hộ được.
3. **Thời gian trả lời (đề xuất, chưa chốt):** trả lời trong **3 ngày làm việc**
   kể từ khi hộp mail hoạt động. Chưa ghi cam kết này vào `PRIVACY.html` hay
   App Store cho tới khi Việt chốt và hộp mail thật sự nhận được mail thử.

### 7.3 Cần làm trước khi nộp App Store (§9.6)

Mua domain `fotobro.app`, lập hộp mail `support@fotobro.app` (hoặc dùng
iCloud+ Custom Domain theo phương án đã đề xuất), gửi thử 1 mail đi/về, thêm
mục "Liên hệ" trong Cài đặt của app trỏ tới `mailto:support@fotobro.app`, rồi
mới giữ địa chỉ này trong `PRIVACY.html` / App Store Connect. Nếu tới lúc nộp
mà hộp mail chưa xong thì phải gỡ địa chỉ placeholder khỏi mọi chỗ công khai —
để địa chỉ không nhận được mail là vi phạm cam kết liên hệ trong chính sách.

## 8. Gỡ app khỏi iPhone — xoá sạch tới đâu

- **Xoá sạch:** toàn bộ sandbox của app bị iOS xoá theo app — `localStorage`
  (`troLyXeo.v1`, `troLyXeo.lock`, token và dữ liệu Google đã tải) +
  IndexedDB `troLyXeoPhotos` (60 ảnh trang chủ) + `sessionStorage`. Đây là
  cách xoá triệt để nhất, dùng được cả khi quên PIN/khoá app.
  (Chưa kiểm chứng thao tác gỡ app trên iPhone thật — đây là hành vi chuẩn của
  iOS sandbox, nhưng vẫn ghi rõ là chưa kiểm chứng thực tế trên máy thật.)
- **Còn lại sau khi gỡ app:**
  - File sao lưu `fotobro-sao-luu.json` (và file sao lưu v2 sau này) nếu người
    dùng đã tải về Files / iCloud Drive — tự xoá trong Files.
  - Sự kiện buổi chụp đã ghi trên Google Lịch, file ảnh trên Google Drive —
    dữ liệu của người dùng trên tài khoản Google của họ, không nằm trong app.
  - Email/tin nhắn đã gửi cho khách từ trước.
  - Quyền FotoBro trong tài khoản Google vẫn còn cho tới khi người dùng thu hồi
    tại `myaccount.google.com` (gỡ app **không** tự thu hồi quyền Google).
- **Cài lại app sau khi gỡ:** app mở lên trắng như mới (sổ trống, không còn
  job/tiền mẫu — `seed()` ở v1 đã là sổ trống). Khôi phục được dữ liệu cũ chỉ
  khi người dùng còn file sao lưu và nhập lại qua Cài đặt → "Mở bản sao lưu".

## 9. Thiếu sót hiện có & cách khắc phục

### 9.1 ĐÃ SỬA — nhưng `SECURITY-AUDIT.md` vẫn mô tả code cũ (cần cập nhật audit, không sửa code)

`SECURITY-AUDIT.md` (rà soát 20/11/2026) ghi 3 rủi ro cao về xoá dữ liệu — **cả 3
đã được sửa trong `www/index.html` hiện tại**, audit chưa cập nhật theo:

| Audit ghi | Code hiện tại |
|---|---|
| H5: "Xoá toàn bộ dữ liệu" chỉ xoá jobs/txs, không xoá ảnh/token/khoá/cfg | **Đã sửa:** `wipeAll()` (`:2243-2264`) xoá IndexedDB ảnh, revoke cả 2 token, xoá 14 key gồm `troLyXeo.lock` + `cfg` (reset về `DEFAULT_CFG`) |
| H3: Ngắt kết nối chỉ revoke access token, refresh token phía Google có thể vẫn sống | **Đã sửa:** handler "Ngắt kết nối" (`:2455-2477`) revoke **cả** access token lẫn refresh token, chờ `Promise.all`, báo đường thu hồi thủ công nếu revoke lỗi |
| H2: Refresh token lưu plaintext trong `localStorage` mà không dùng | **Đã sửa:** `gExchangeCode()` **không lưu** `d.refresh_token` (`:3011-3016`); code khởi động dọn token cũ khỏi `localStorage` (`:938`); không có `grant_type=refresh_token` trong code |

**Khắc phục:** cập nhật `SECURITY-AUDIT.md` §5 (H2/H3/H5) và §6 (bảng "Xoá dữ liệu
thì mất hẳn không?") theo code hiện tại; giữ lại ghi chú "đã sửa ngày …, kiểm
chứng lại trên TestFlight" thay vì xoá hẳn lịch sử. `PRIVACY.html` §7 đã mô tả
đúng hành vi mới — không cần sửa, chỉ cần giữ đồng bộ sau mỗi lần đổi code xoá.

### 9.2 `wipeAll()` tải lại trang ngay — có thể cắt ngang lệnh thu hồi token và lệnh xoá IndexedDB

- **Bằng chứng:** `wipeAll()` gửi các `fetch(...revoke...)` fire-and-forget
  (`.catch(function(){})`, không `await`) và gọi `indexedDB.deleteDatabase()`
  (bất đồng bộ) rồi gọi `location.reload()` ngay ở dòng tiếp theo (`:2252-2263`).
  Reload có thể huỷ request revoke đang bay và thao tác xoá DB chưa xong —
  khi đó token phía Google vẫn sống và ảnh IndexedDB có thể còn lại sau khi app
  mở lại.
- **Tác động:** trung bình. Dữ liệu trên máy vẫn bị xoá (localStorage xoá đồng
  bộ trước reload), nhưng phần "thu hồi tại Google" và "xoá ảnh" không được đảm
  bảo. Người dùng tưởng đã cắt quyền Google nhưng thực tế chưa.
- **Khắc phục (rẻ, làm trước TestFlight):** chờ xong mới reload —
  `Promise.all(revokes)` + chờ `deleteDatabase` `onsuccess`/`onerror`/`onblocked`
  (đặt timeout tối đa ~3 giây rồi vẫn reload để app không kẹt), rồi mới
  `location.reload()`. Nếu revoke lỗi thì vẫn xoá local nhưng toast đường thu hồi
  thủ công, giống cách handler "Ngắt kết nối" đã làm (`:2465-2470`).

### 9.3 Xoá job / xoá toàn bộ không huỷ thông báo nhắc lịch đã lên lịch

- **Bằng chứng:** `www/capacitor-bridge.js:113-120` có sẵn `cancelReminder(jobId)`
  (huỷ 2 notification: nhắc chụp + nhắc hạn giao) và expose ra
  `window.__trolyxeoCancelReminder`, nhưng **không chỗ nào trong
  `www/index.html` gọi hàm này** (grep toàn bộ file: 0 lần gọi). `wipeAll()`
  cũng không huỷ notification.
- **Tác động:** trung bình. Sau khi xoá job (hoặc xoá toàn bộ), nhắc lịch của job
  đã xoá vẫn có thể hiện trên màn hình khoá iPhone, kèm tên khách + giờ chụp —
  vừa gây hoang mang ("job đã xoá sao còn nhắc"), vừa là dữ liệu khách hàng còn
  hiện sau khi người dùng tưởng đã xoá sạch. Lưu ý: bridge nhắc trước giờ chụp
  **60 phút** (`capacitor-bridge.js:98`), trong khi `PRIVACY.html` §5 ghi 12
  tiếng — lệch này cũng cần sửa cho khớp (§9.7).
- **Khắc phục (rẻ, làm trước TestFlight):** gọi `__trolyxeoCancelReminder(id)`
  trong handler xoá job (`:1511-1516`); trong `wipeAll()`, huỷ toàn bộ
  notification đã lên lịch — cần thêm 1 hàm `cancelAllReminders()` trong bridge
  (dùng `LocalNotifications.getPending()` rồi `cancel()` hết) vì wipeAll không
  còn danh sách job để huỷ từng cái. Kiểm chứng trên TestFlight: tạo job → xoá
  job → đợi tới giờ nhắc, xác nhận không còn notification.

### 9.4 Xoá job không xoá được sự kiện Google Lịch nếu token đã hết hạn

- **Bằng chứng:** `gCalDelete()` (`:3527-3530`) return ngay nếu không có token
  hợp lệ (`!gToken()`) hoặc thiếu scope ghi lịch. Access token chỉ sống ~1 giờ.
  Dialog xoá job vẫn hiện câu "Xoá luôn lịch hẹn này trên Google Lịch." mỗi khi
  job có `gEventId` (`:1510`), bất kể token còn sống hay không.
- **Tác động:** thấp–trung bình. Sự kiện ở lại Google Lịch sau khi job đã xoá
  trong app; người dùng tưởng đã xoá cả hai nơi.
- **Khắc phục:** khi xoá job mà có `gEventId` nhưng không có token hợp lệ, đổi
  câu toast/dialog thành "Đã xoá job trong app — sự kiện trên Google Lịch vẫn
  còn, xoá trong app Lịch nếu muốn" (cùng câu chữ đã dùng ở handler "Ngắt kết
  nối" `:2456`). Dài hạn: thử silent re-auth trước khi gọi `gCalDelete()`.

### 9.5 `WIPE_KEYS` chưa có key sao lưu v2 (`fotobro.lastBackupAt`)

- **Bằng chứng:** `BACKUP-V2.md` §1 đặt key mới `fotobro.lastBackupAt` cho lần
  sao lưu gần nhất; `WIPE_KEYS` (`:2249`) chỉ có key v1 `troLyXeo.lastBackup`.
- **Tác động:** hiện chưa ảnh hưởng (sao lưu v2 chưa nối vào app, key chưa tồn
  tại). Nhưng khi nối v2 mà quên thêm key thì sau wipe, app vẫn nhớ "đã sao lưu
  ngày X" dù dữ liệu đã trắng — banner nhắc sao lưu 7 ngày sẽ tính sai.
- **Khắc phục:** khi nối sao lưu v2 vào app, thêm `'fotobro.lastBackupAt'` vào
  `WIPE_KEYS` trong cùng commit. Ghi chú này vào checklist nối v2
  (`BACKUP-V2.md` §8).

### 9.6 Chưa có hộp mail hỗ trợ + chưa có mục "Liên hệ" trong app

- **Bằng chứng:** xem §7.1 — `support@fotobro.app` là placeholder, domain chưa
  mua; `PRIVACY.html` §9 nói "liên hệ qua thông tin trong app, mục Cài đặt →
  Liên hệ" nhưng app không có mục đó.
- **Tác động:** cao đối với việc nộp App Store (cam kết liên hệ trong chính sách
  không thực hiện được; reviewer có thể thử gửi mail và không nhận được trả lời).
- **Khắc phục:** xem §7.3 — mua domain + lập hộp mail + gửi thử + thêm mục
  "Liên hệ" trong Cài đặt, xong trước khi nộp. Tới lúc đó cập nhật cả
  `PRIVACY.html` §9 và `PRIVACY.md` (bỏ chú thích "đang thiết lập").

### 9.7 Lệch nhỏ khác liên quan tới xoá/thông báo

- Nhắc trước giờ chụp: bridge ghi **60 phút** (`capacitor-bridge.js:98`),
  `PRIVACY.html` §5 và §2 của file này (mục Google) ghi **12 tiếng**. Cần chốt
  1 con số và sửa cho khớp cả 3 nơi trước khi nộp — ảnh hưởng tới câu chữ về
  thông báo còn hiện sau khi xoá (§9.3).
- File sao lưu v1 vẫn là JSON plaintext, tên `fotobro-sao-luu.json` (`:2224`),
  không có ảnh — đã báo rõ trong dialog wipeAll, giữ nguyên tới khi sao lưu v2
  mã hoá được nối vào app (`BACKUP-V2.md`).

## 10. Checklist trước khi nộp App Store (phần xoá dữ liệu)

- [ ] Sửa §9.2: `wipeAll()` chờ revoke + `deleteDatabase` xong mới reload (kèm timeout).
- [ ] Sửa §9.3: huỷ notification khi xoá job + huỷ toàn bộ khi wipeAll; test trên TestFlight.
- [ ] Sửa §9.4: câu chữ khi xoá job mà token Google đã hết hạn.
- [ ] Sửa §9.6: hộp mail `support@fotobro.app` hoạt động + mục "Liên hệ" trong Cài đặt.
- [ ] Cập nhật `SECURITY-AUDIT.md` §5–§6 theo code đã sửa (§9.1).
- [ ] Chốt thời gian nhắc trước giờ chụp (60 phút hay 12 tiếng) và sửa cho khớp bridge + PRIVACY (§9.7).
- [ ] Khi nối sao lưu v2: thêm `'fotobro.lastBackupAt'` vào `WIPE_KEYS` (§9.5).
- [ ] TestFlight — chạy đúng các ca: (1) xoá 1 job có sự kiện Google → kiểm tra
      sự kiện biến mất trên Google Lịch; (2) "Xoá toàn bộ" → mở lại app trắng,
      kiểm tra IndexedDB `troLyXeoPhotos` đã sạch, kiểm tra quyền FotoBro đã bị
      thu hồi tại `myaccount.google.com`; (3) xoá job → đợi tới giờ nhắc, xác
      nhận không còn notification; (4) gỡ app → cài lại → sổ trống; (5) gửi mail
      thử tới `support@fotobro.app` và nhận được trả lời.
- [ ] Đồng bộ lần cuối: `PRIVACY.html` §7 = `PRIVACY.md` §7 = hành vi `wipeAll()`
      thật = tài liệu này. Apple đối chiếu chính sách với hành vi thật — lệch là
      bị hỏi lại / từ chối.

## 11. Báo cáo 7 mục

1. **Mục tiêu:** Viết `DATA-DELETION.md` — luồng xoá dữ liệu trong app theo
   Guideline 5.1.1(v): người dùng xoá ở đâu, xoá cái gì, xoá xong còn lại gì,
   thời gian xoá, liên hệ `support@fotobro.app` để yêu cầu xoá, lưu ý gỡ app mới
   xoá sạch sandbox — dựa trên code thật, ghi rõ thiếu sót và cách khắc phục.
2. **Đã thực hiện:** Đọc `www/index.html` (đối chiếu trực tiếp `wipeAll()`,
   `WIPE_KEYS`, xoá job, ngắt kết nối Google, `gExchangeCode`, dọn token lúc
   khởi động), `www/capacitor-bridge.js` (nhắc/huỷ nhắc lịch),
   `www/fotobro-config.js` (`supportEmail`), `SECURITY-AUDIT.md`,
   `BACKUP-V2.md`, `PRIVACY.html`. Chỉ viết 1 file mới
   `~/workspace/fotobro-ios-v1/batch-legal/DATA-DELETION.md`. Không sửa file
   nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** Phát hiện quan trọng nhất — **H2/H3/H5 trong
   `SECURITY-AUDIT.md` đã được sửa trong code hiện tại** (`wipeAll()` xoá thật:
   IndexedDB ảnh + revoke cả 2 token + 14 key + reset `cfg`; ngắt kết nối revoke
   cả 2 token; refresh token không còn được lưu), nhưng audit chưa cập nhật nên
   vẫn mô tả code cũ. `PRIVACY.html` §7 đã mô tả đúng hành vi mới. Xác nhận
   được: không có tài khoản người dùng nên không có luồng "xoá tài khoản";
   xoá trong app là ngay lập tức; gỡ app xoá sạch sandbox; `support@fotobro.app`
   vẫn là placeholder (domain chưa mua, `supportEmail: ''`).
4. **Vấn đề còn tồn tại:** 7 thiếu sót (§9): (9.1) audit lỗi thời so với code;
   (9.2) `wipeAll()` reload ngay, có thể cắt ngang revoke token + xoá IndexedDB;
   (9.3) `cancelReminder` tồn tại nhưng không chỗ nào gọi — notification của job
   đã xoá vẫn có thể hiện; (9.4) xoá job không xoá được sự kiện Google khi token
   hết hạn nhưng dialog vẫn hứa xoá; (9.5) `WIPE_KEYS` thiếu key sao lưu v2
   (chưa ảnh hưởng vì v2 chưa nối); (9.6) chưa có hộp mail hỗ trợ + chưa có mục
   "Liên hệ" trong app dù PRIVACY nói có; (9.7) lệch 60 phút vs 12 tiếng về
   thời gian nhắc. Chưa kiểm chứng trên iPhone thật: gỡ app có xoá sạch
   IndexedDB không, revoke token sau wipe có tới được Google không.
5. **Điều kiện chuyển bước:** Sửa xong §9.2 + §9.3 + §9.6 (3 việc chặn nộp App
   Store) và cập nhật audit (§9.1), rồi chạy đủ 5 ca TestFlight ở §10 mới nộp.
   Việt chốt: thời gian trả lời email hỗ trợ (đề xuất 3 ngày làm việc) và thời
   gian nhắc trước giờ chụp (60 phút hay 12 tiếng).
6. **Bước tiếp theo:** Agent iOS sửa §9.2/§9.3/§9.4 theo §9, Việt mua domain +
   lập hộp mail `support@fotobro.app` (§7.3), agent cập nhật `SECURITY-AUDIT.md`
   §5–§6, rồi QA chạy 5 ca TestFlight ở §10.
7. **Trạng thái:** Hoàn thành tài liệu. Chưa phải code chạy được, chưa sửa gì
   trong app.
