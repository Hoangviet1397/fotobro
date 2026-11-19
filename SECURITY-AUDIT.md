# Rà soát bảo mật + riêng tư — FotoBro iOS v1

> **Phạm vi:** `~/workspace/fotobro-ios-v1/` — `www/index.html` (~338 KB, rà soát ngày 20/11/2026),
> `www/capacitor-bridge.js`, `www/fotobro-config.js`, `package.json`, `capacitor.config.ts`,
> `ios/App/App/Info.plist`, `PRIVACY.md`, `RISKS.md`, `GOOGLE-SETUP.md`, `BACKUP-V2.md`,
> `CLOUDKIT-PLAN.md`, `QA-REPORT.md`.
> **Phương pháp:** chỉ đọc code (static review), không sửa file nào, không build, không chạy trên
> iPhone thật. Mọi kết luận dưới đây đều có dòng code đối chứng; mục nào chưa kiểm được trên
> máy thật thì ghi rõ "chưa kiểm chứng trên iOS thật".
> **Kết luận 1 dòng:** Nền tảng tốt (local-first, không máy chủ, không tracking, không quảng cáo),
> nhưng dữ liệu lưu **plaintext** và token Google được xử lý lỏng tay — đó là 2 nhóm rủi ro chính của v1.

## 1. Dữ liệu lưu ở đâu (bản đồ dữ liệu v1)

| Dữ liệu | Lưu ở đâu | Mã hoá lúc lưu? | Ai đọc được |
|---|---|---|---|
| Job + thu/chi + cài đặt (tên khách, SĐT, email, giá, cọc, ghi chú) | `localStorage` key `troLyXeo.v1` — `www/index.html:903-909` | **Không** — JSON plaintext | Bất kỳ JS nào chạy cùng WebView origin `capacitor://localhost`; ai cầm máy đã mở khoá / cầm file sao lưu |
| Ảnh trang chủ (tối đa 60, thu nhỏ ~1400px JPEG 0.85) | IndexedDB `troLyXeoPhotos`, store `photos` — `www/index.html:3681-3700` | **Không** — Blob JPEG gốc sau khi thu nhỏ | Như trên; ảnh **không** rời máy trừ khi người dùng tự chia sẻ |
| Logo studio | Chuỗi dataURL JPEG trong `cfg.logo`, tối đa 300.000 ký tự, nằm chung trong `troLyXeo.v1` — `mergeCfg` | **Không** | Như trên |
| Khoá app | `localStorage` `troLyXeo.lock`: `{id, salt, pin}` — `www/index.html:3585-3606` | PIN là SHA-256(salt + ":" + PIN), salt 16 byte ngẫu nhiên | Xem §3 |
| Access token Google | `sessionStorage` `troLyXeo.gtoken` `{t, exp, s}` — `www/index.html:2927` | **Không** | JS cùng origin; hết hạn sau ~1 giờ (`exp`, kiểm tra `> now + 60s`) |
| Refresh token Google | `localStorage` `troLyXeo.grefresh` (plaintext) + cờ `troLyXeo.ghadRefresh` — `www/index.html:2974` | **Không** | JS cùng origin; **sống lâu dài** cho tới khi ngắt kết nối |
| Lịch / Gmail / Danh bạ đã tải từ Google | `localStorage` `troLyXeo.gcal`, `troLyXeo.gmail`, `troLyXeo.gcontacts` (nội dung thư tới 6.000 ký tự/thư) — `www/index.html:2903, 3170-3180` | **Không** | Như trên; tồn tại cả sau khi access token hết hạn |
| PKCE verifier + `state` | `localStorage` `troLyXeo.gstate` — chỉ sống trong lúc đăng nhập, xoá ngay sau khi đổi code (`lsSet(GS_KEY, '')`) | Không cần (dùng 1 lần) | OK — đã xoá đúng lúc |
| Sao lưu v1 (người dùng tự tải) | File `fotobro-sao-luu.json` do người dùng tải về — `www/index.html:2217-2224` | **Không** — JSON plaintext, không có ảnh | Ai cầm được file là đọc được tên khách + số tiền |
| CloudKit Nấc 2 | **Chưa có** — chỉ có tên container `iCloud.com.fotobro.app` trong `fotobro-config.js`, trạng thái `not-configured` | — | Không có dữ liệu nào rời máy qua CloudKit ở v1 |
| Ảnh khách (ảnh chụp thật) | **Không nằm trong app** — app chỉ lưu *link* thư mục Drive (`driveLink`, chuỗi URL) | — | Ảnh khách chỉ nằm trên Drive của người dùng / máy ảnh |

**Không có trong v1:** không máy chủ riêng, không tài khoản, không analytics, không SDK quảng cáo
(`grep analytics = 0`, `fetch(` chỉ tới Google APIs + revoke), không GPS, không danh bạ iOS
(chỉ đọc Danh bạ Google khi bật), không lưu file ghi âm (mic native đã dời sang v1.1).

## 2. Rủi ro mức CAO

### H1 — Dữ liệu chính lưu plaintext, khoá app chỉ là "màn hình che"
- **Bằng chứng:** `saveLocal()` ghi toàn bộ `jobs/txs/cfg` dạng JSON plaintext vào `localStorage`
  (`www/index.html:906-910`); ảnh lưu Blob JPEG plaintext trong IndexedDB; không dùng
  Keychain / Secure Enclave / `crypto.subtle` để mã hoá dữ liệu lúc lưu (chỉ dùng `crypto.subtle`
  để băm PIN và PKCE).
- **Tác động:** Khoá Face ID/PIN chỉ ẩn giao diện (`visibility:hidden` + màn `#lockScreen`,
  `www/index.html:487-488, 3610-3630`) — dữ liệu vẫn nằm nguyên trong bộ nhớ/WebView. Ai lấy
  được máy đã mở khoá, trích xuất được backup iPhone không mã hoá, hoặc khai thác được 1 lỗ
  XSS trong app là đọc được toàn bộ sổ khách + tiền. Mất máy mà không có mật mã iPhone thì
  coi như mất dữ liệu.
- **Khắc phục:** v1 chấp nhận được **nếu** ghi rõ trong App Store / PRIVACY rằng dữ liệu dựa vào
  khoá máy + sandbox iOS (xem §6). v1.1 nên làm: mã hoá `troLyXeo.v1` bằng AES-256-GCM, khoá
  mã hoá bọc bằng khoá sinh từ PIN/passkey (đừng tự giữ khoá plaintext), hoặc chuyển dữ liệu
  nhạy cảm sang Keychain qua plugin. Đây là việc lớn, không nhét vào v1.

### H2 — Refresh token Google lưu plaintext trong `localStorage`, và **không được dùng để làm mới token**
- **Bằng chứng:** `gExchangeCode()` lưu `d.refresh_token` vào `localStorage` `troLyXeo.grefresh`
  (`www/index.html:2974`); grep toàn bộ code **không có** `grant_type=refresh_token` — không
  có đoạn code nào dùng refresh token để lấy access token mới. Khi access token hết hạn, app
  chỉ gọi `gConnect(true)` silent (`prompt=none`) để đăng nhập lại.
- **Tác động:** Một credential sống dài hạn của Google nằm plaintext trong `localStorage` mà
  không mang lại lợi ích gì — kẻ lấy được nó có quyền đọc Lịch/Gmail/Danh bạ/Drive + ghi lịch +
  gửi Gmail (đủ 6 scope, xem H3) cho tới khi người dùng thu hồi. Đây là credential có giá trị
  cao nhất trong app, lưu ở nơi yếu nhất.
- **Khắc phục (làm ngay trước TestFlight, rẻ):** hoặc (a) **đừng lưu refresh token nữa**
  (xoá dòng lưu ở `:2974`, chỉ giữ access token trong `sessionStorage` như hiện tại — silent
  re-auth đã đủ), hoặc (b) nếu giữ thì phải viết luồng refresh thật + lưu refresh token vào
  Keychain (plugin secure storage), không để trong `localStorage`. Khuyến nghị (a) cho v1.

### H3 — Ngắt kết nối Google chỉ thu hồi access token, refresh token phía Google có thể vẫn sống
- **Bằng chứng:** nút "Ngắt kết nối" chỉ gọi `POST https://oauth2.googleapis.com/revoke?token=<access_token>`
  rồi xoá token ở máy (`www/index.html:2426-2427`). Không có lệnh revoke nào với refresh token.
- **Tác động:** Sau khi người dùng bấm "Ngắt kết nối" (tưởng đã cắt quyền), refresh token đã cấp
  cho FotoBro có thể vẫn còn hiệu lực phía Google cho tới khi hết hạn/thu hồi thủ công — trái
  với cam kết trong PRIVACY.md ("bấm Ngắt kết nối là mã bị thu hồi ngay").
- **Khắc phục (làm ngay, rẻ):** khi ngắt kết nối, gọi revoke **cả refresh token** (nếu có) trước
  rồi mới xoá ở máy; nếu revoke refresh thất bại thì báo cho người dùng đường thu hồi thủ công
  (myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba → FotoBro → Xoá quyền).
  Sửa cả câu chữ trong PRIVACY.md cho đúng thực tế sau khi sửa code.

### H4 — Xin đủ 6 scope Google 1 lần, kể cả scope nhạy cảm mà người dùng có thể không cần
- **Bằng chứng:** `gScopes()` xin 1 lần: `calendar.readonly`, `gmail.readonly` (restricted),
  `contacts.readonly`, `drive.metadata.readonly`, `calendar.events`, `gmail.send`
  (`www/index.html:3155-3175`). Trong khi PRIVACY.md vẫn ghi "chỉ bật từng tính năng" và
  "mặc định TẮT" — code v1 đã đổi sang auto 1 chạm nhưng tài liệu chưa theo kịp.
- **Tác động:** Người chỉ muốn xem Lịch cũng phải cấp quyền đọc Gmail + gửi Gmail. Scope
  `gmail.readonly` là restricted — Google xác minh 4–10 tuần (xem `GOOGLE-SETUP.md` §7),
  và nếu tài khoản Google bị lộ token thì kẻ xấu đọc được cả thư ngân hàng/khách hàng.
- **Khắc phục:** v1 nên cho người dùng **chọn** nhóm quyền trước khi đăng nhập (Lịch / Gmail /
  Drive — 3 nhóm, mặc định chỉ Lịch), xin scope theo nhóm đã chọn thay vì xin tất cả. Nếu giữ
  auto 1 chạm thì phải sửa PRIVACY.md + màn "Đăng nhập Google để làm gì?" cho đúng, và cân
  nhắc dời `gmail.readonly` sang v1.1 để rút thời gian xác minh Google xuống 2–6 tuần
  (quyết định đang chờ Việt — xem `GOOGLE-SETUP.md` §7).

### H5 — "Xoá toàn bộ dữ liệu" không xoá hết: ảnh, token Google, khoá app vẫn còn
- **Bằng chứng:** nút "Xoá toàn bộ dữ liệu" chỉ làm `state.jobs = []; state.txs = [];` rồi
  `saveLocal()` (`www/index.html:2241-2247`). Không xoá: IndexedDB `troLyXeoPhotos` (60 ảnh),
  `troLyXeo.grefresh` / `gcal` / `gmail` / `gcontacts`, `troLyXeo.lock`, `cfg` (giá, logo,
  mailTpls), `heroPin`, file sao lưu JSON người dùng đã tải.
- **Tác động:** Người dùng tưởng đã xoá sạch (đổi máy, bán máy, trả máy) nhưng ảnh trang chủ,
  token Google và dữ liệu Google đã tải vẫn còn trong app. Vi phạm cam kết mục 6 của
  PRIVACY.md ("toàn bộ job, thu chi, cài đặt trên máy sẽ bị xoá. Ảnh trang chủ cũng bị xoá theo")
  — thực tế ảnh **không** bị xoá theo.
- **Khắc phục (làm ngay trước TestFlight, rẻ):** viết 1 hàm `wipeAll()` duy nhất: xoá jobs/txs,
  xoá IndexedDB `troLyXeoPhotos`, revoke + xoá token Google, xoá `gcal/gmail/gcontacts`,
  xoá `troLyXeo.lock` (hoặc hỏi riêng), xoá `cfg.logo`/`heroPin`, và báo rõ "file sao lưu bạn
  đã tải về máy không xoá được từ trong app — tự xoá trong Files". Xoá job lẻ hiện đã đúng
  (xoá kèm txs + xoá sự kiện Google của job đó, `:1507-1513`) — giữ nguyên.

## 3. Rủi ro mức TRUNG BÌNH

### M1 — PIN dự phòng chỉ 4–6 số, băm bằng SHA-256 nhanh (không PBKDF2/bcrypt)
- **Bằng chứng:** PIN `^\d{4,6}$`, lưu `SHA-256(salt 16 byte + ":" + PIN)` (`www/index.html:3585-3606`).
  Khoá sau 5 lần sai: chờ `30s × 2^(sai−5)` — chống đoán mò **trên giao diện**, nhưng không
  chống được đoán mò **offline** nếu kẻ xấu trích xuất được `troLyXeo.lock` (SHA-256 nhanh:
  PIN 4 số chỉ có 10.000 khả năng).
- **Khắc phục:** v1 chấp nhận được vì cần máy + trích xuất được localStorage mới tấn công offline
  được; v1.1 đổi sang PBKDF2-SHA256 ≥100.000 vòng (đã có sẵn mẫu trong `BACKUP-V2.md` §4) hoặc
  Argon2id, và cân nhắc bắt buộc PIN 6 số khi bật khoá. Ghi chú: quên cả Face ID lẫn PIN thì
  phải xoá dữ liệu web mới vào lại được — đã ghi rõ trong app (`:3640`), giữ nguyên.

### M2 — Passkey/Face ID chưa kiểm chứng trên native, RP ID sẽ khác bản web
- **Bằng chứng:** `enableLock()` tạo passkey với `rp.id = location.hostname`
  (`www/index.html:3595-3600`); trên Capacitor hostname là `capacitor://localhost`. `RISKS.md` §3
  đã cảnh báo: passkey tạo trên bản web không mở được app native, tạo passkey với RP ID
  `localhost` chưa được kiểm chứng; `bioSupported()` yêu cầu `isSecureContext`.
- **Tác động:** Người dùng bật khoá trên TestFlight có thể gặp lỗi tạo passkey, hoặc passkey tạo
  được nhưng sau này không mở được — khi đó chỉ còn PIN cứu (đã có). Rủi ro vận hành, không
  phải rò rỉ dữ liệu.
- **Khắc phục:** TestFlight phải test đúng ca: bật khoá → tắt app → mở lại bằng Face ID → thử
  PIN khi Face ID lỗi (đã có trong `TESTFLIGHT-CHECKLIST.md` mục 8). Nếu Face ID lỗi thì tắt
  khoá mặc định ở v1, dời sang v1.1 (đúng đề xuất trong `RISKS.md` §3).

### M3 — CSP còn `unsafe-inline`, 13 script inline + `innerHTML` 53 chỗ
- **Bằng chứng:** CSP `script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
  (`www/index.html:8`); `innerHTML` 53 lần (chủ yếu `I()` icon SVG nội bộ + `esc()` dữ liệu
  người dùng). Điểm tốt: `esc()` escape `&<>"`, `safeUrl()` chặn `javascript:`/`data:`
  (`:873-879`), `cleanData()` ép kiểu/enum/giới hạn độ dài mọi trường khi load file sao lưu
  (`:879-900`), `connect-src` chỉ cho phép Google APIs, `object-src 'none'`, `frame-src 'none'`.
- **Tác động:** `unsafe-inline` làm CSP gần như không chặn được XSS nếu có 1 chỗ quên `esc()`.
  Hiện tại chưa tìm thấy chỗ nào render dữ liệu người dùng mà không qua `esc()`/`cleanStr()`,
  nhưng đây là rủi ro **mòn dần theo thời gian**: mỗi lần thêm tính năng mới là 1 lần có thể quên.
- **Khắc phục:** v1 giữ nguyên (tách inline script ra file ngoài là việc lớn, đụng toàn bộ app).
  v1.1: tách script inline ra file JS ngoài + bỏ `unsafe-inline`; thêm test tự động grep
  "innerHTML" không kèm `esc(` trong CI; rà lại các chỗ `I()` (icon) vì đó là nguồn `innerHTML`
  không qua `esc()` — icon là hằng nội bộ nên hiện an toàn, nhưng phải giữ nguyên tắc đó.

### M4 — Sao lưu v1 là JSON plaintext, nhập file không kiểm tra tính toàn vẹn
- **Bằng chứng:** xuất `fotobro-sao-luu.json` plaintext (`:2217-2224`); nhập chỉ kiểm tra
  `Array.isArray(d.jobs) && Array.isArray(d.txs)` rồi `cleanData()` (`:2226-2237`).
  Không có chữ ký/hash, không mã hoá, không có ảnh trong file sao lưu.
- **Tác động:** Ai cầm file sao lưu đọc được hết tên khách + số tiền; file bị sửa tay vẫn được
  nhập (chỉ bị `cleanData()` gọt bớt trường lạ — đây vừa là điểm tốt vừa là giới hạn: dữ liệu
  sai vẫn vào sổ nếu đúng định dạng). Mất máy + mất file sao lưu = mất dữ liệu (không có bản
  sao trên cloud ở v1).
- **Khắc phục:** Triển khai sao lưu v2 mã hoá đã thiết kế trong `BACKUP-V2.md` (AES-256-GCM +
  PBKDF2, mật khẩu người dùng đặt, đọc được file v1 cũ, tách ảnh khi >25 MB) — đã có thiết kế
  đầy đủ, chỉ chưa code. Tới lúc đó: nhắc người dùng đặt mật khẩu mạnh, cảnh báo "mất mật khẩu
  là mất bản sao lưu", và nhắc sao lưu 7 ngày (đã có trong thiết kế).

### M5 — Thông báo nhắc lịch để lộ tên khách trên màn hình khoá
- **Bằng chứng:** `capacitor-bridge.js` đặt local notification với `body: client + type + giờ chụp`
  (`:79-110`); nhắc trước giờ chụp 60 phút (thiết kế v1 nói 12 tiếng — đang lệch, xem
  `NOTIFICATIONS.md` §4), nhắc hạn giao trước 1 ngày.
- **Tác động:** Tên khách + giờ chụp hiện trên màn hình khoá iPhone nếu người dùng để chế độ
  hiện preview thông báo — người ngoài cầm máy liếc qua là thấy. Nội dung không có số tiền
  (tốt), nhưng vẫn là dữ liệu khách hàng.
- **Khắc phục:** v1 chấp nhận được (đây là hành vi chuẩn của app lịch); ghi 1 dòng trong
  PRIVACY.md rằng nhắc lịch hiện tên khách trên màn hình khoá và người dùng tắt được trong
  Cài đặt iPhone → Thông báo → FotoBro. v1.1: cho tắt preview trong Cài đặt app (chỉ hiện
  "Bạn có lịch chụp lúc 08:00" không kèm tên khách).

### M6 — Chia sẻ / mailto / mở app ngoài: dữ liệu rời máy theo ý người dùng, nhưng không có "xác nhận lần 2"
- **Bằng chứng:** `navigator.share` / Capacitor Share gửi báo cáo cuối ngày (tên studio, tổng
  thu/chi/lời, khách còn thiếu — `:1991-1994`); `mailto:` soạn sẵn email khách kèm giá/cọc/còn
  thiếu (`:1528, :3570`); nút Messenger/Facebook mở `m.me/` / `facebook.com` sau khi chép tin
  nhắn (`:1517-1518`); `driveLink` chỉ là chuỗi URL do người dùng dán.
- **Tác động:** Thấp — mọi lần gửi đều do người dùng bấm và (với email) xem lại trước khi gửi;
  app không tự gửi (đã ghi rõ trong code `:3449-3452`). Rủi ro còn lại là bấm nhầm Share rồi
  chọn nhầm người nhận — lỗi người dùng, không phải lỗi app.
- **Khắc phục:** Giữ nguyên. Chỉ cần đảm bảo nút Share báo cáo không kèm chi tiết từng khách
  (hiện chỉ có tổng + "khách còn thiếu" dạng tổng tiền — đã kiểm, OK).

## 4. Rủi ro mức THẤP

### L1 — Secrets / cấu hình
- Không có `client_secret`, API key hay token nào hard-code trong app — `googleClientId: ''`
  (placeholder), CloudKit `not-configured`, `supportEmail: ''` (`fotobro-config.js`). Tốt.
- Nhưng `Info.plist` còn scheme placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID` —
  **phải thay bằng reversed client ID thật trước khi build cuối**, nếu không Google trả
  `redirect_uri_mismatch` (đã ghi trong `GOOGLE-SETUP.md` §2c). Đây là lỗi cấu hình, không
  phải rò rỉ secret.

### L2 — Quyền iOS khai trong Info.plist
- Đủ và đúng mục đích: Camera, PhotoLibrary (đọc + thêm), Calendars (đọc/ghi). Không xin
  Location, Contacts iOS, Microphone (mic đã dời v1.1 — nhất quán, không có
  `NSMicrophoneUsageDescription` là đúng). Mỗi quyền đều có câu giải thích tiếng Việt.
- Lưu ý: `UIRequiredDeviceCapabilities` còn `armv7` (cũ, từ template Capacitor) — không ảnh
  hưởng bảo mật, nhưng nên rà lại trước build cuối để khỏi chặn máy mới.

### L3 — Tài liệu lệch với code (rủi ro tuân thủ App Store / Google)
- `PRIVACY.md` còn ghi: repo `tro-ly-xeo`, Google "mặc định TẮT / có thể TẮT ở v1", token "chỉ
  giữ trong phiên" — trong khi code v1 đã là Google auto 1 chạm + refresh token lưu dài hạn
  trong `localStorage`. `RISKS.md` vẫn dựa trên source web v2.4 (Implicit Flow) trong khi code
  v1 đã dùng PKCE + trình duyệt hệ thống. `PRIVACY.html` (mới, 20/11) đã sửa đúng hướng này.
- **Khắc phục:** trước khi nộp App Store, đồng bộ 1 lần: `PRIVACY.md` = `PRIVACY.html` = hành vi
  code thật (đặc biệt: refresh token, scope xin 1 lần, "Xoá toàn bộ" xoá những gì). Apple và
  Google đều đối chiếu chính sách với hành vi thật — lệch là bị hỏi lại / từ chối.

### L4 — Dữ liệu mẫu / dữ liệu test
- `seed()` ở v1 đã là sổ trống, không còn job/tiền mẫu (`www/index.html:861-863`). Tốt.
- Còn 1 xác chết `<p id="sampleNote">` (QA-REPORT đã ghi) — không chứa dữ liệu, chỉ là rác UI.
- Dữ liệu mẫu cho screenshot (`SCREENSHOT-DATA.md`) là hư cấu, không dùng tên khách thật — tốt,
  nhớ xoá dữ liệu mẫu khỏi máy test trước khi gửi Apple duyệt.

## 5. Ảnh khách có gửi đi đâu không? — Không, trừ khi người dùng tự gửi

- **Ảnh trong app:** chỉ có ảnh trang chủ do người dùng tự chọn từ máy (tối đa 60, thu nhỏ
  ~1400px, lưu IndexedDB trên máy). Vẽ lại qua `canvas.toBlob()` nên **EXIF (kể cả GPS) bị
  lược bỏ** khi lưu — điểm tốt, không chủ ý nhưng có lợi.
- **Ảnh khách chụp thật:** không nằm trong app, app không upload ảnh đi đâu. Chỉ lưu link thư
  mục Drive do người dùng dán.
- **Đường duy nhất ảnh/dữ liệu rời máy:** (1) người dùng bấm Share / sao lưu JSON / gửi email;
  (2) người dùng bật Google — khi đó dữ liệu đi tới Google APIs theo scope đã cấp (Lịch,
  Gmail, Danh bạ, Drive) và **chỉ** tới Google, không tới máy chủ FotoBro nào (không có);
  (3) sau này bật CloudKit Nấc 2 — chưa có ở v1, thiết kế đã ghi mã hoá đầu cuối
  (AES-256-GCM + PBKDF2) trong `CLOUDKIT-PLAN.md`.
- **Không có:** upload nền, đồng bộ ngầm, backup tự động lên cloud, gửi ảnh cho bên thứ ba.

## 6. Xoá dữ liệu thì mất hẳn không? — Chưa hẳn, xem bảng

| Cách xoá | Mất thật? | Còn lại |
|---|---|---|
| Xoá 1 job | Có (kèm txs của job + sự kiện Google của job đó) | Thư mục Drive của job (chỉ là link, app không xoá được Drive) |
| Xoá 1 khoản thu/chi | Có | — |
| "Xoá toàn bộ dữ liệu" trong app | **Chưa hẳn** — chỉ xoá jobs/txs, giữ cài đặt | Ảnh IndexedDB, token Google + dữ liệu Google đã tải, khoá app, logo, file sao lưu đã tải (xem H5) |
| Ngắt kết nối Google | Access token thu hồi + xoá ở máy; dữ liệu Google đã tải xoá ở máy | Refresh token phía Google có thể còn sống (xem H3); sự kiện đã ghi trên Google Lịch **không** bị xoá |
| Gỡ app khỏi iPhone | Có — toàn bộ localStorage + IndexedDB trong sandbox của app bị xoá theo | File sao lưu JSON người dùng đã tải về Files/iCloud Drive; dữ liệu trên Google Lịch/Drive (do người dùng tạo) |
| Mất máy | Phụ thuộc mật mã iPhone + mã hoá iOS | Dữ liệu plaintext trong app không có lớp mã hoá riêng (xem H1) |

## 7. Checklist trước TestFlight / trước khi nộp App Store

**Trước TestFlight (chặn):**
- [ ] H2: bỏ lưu refresh token, hoặc viết luồng refresh thật + Keychain. (1 dòng xoá lưu token là xong phương án rẻ.)
- [ ] H3: revoke cả refresh token khi ngắt kết nối + sửa câu chữ trong app/PRIVACY.
- [ ] H5: `wipeAll()` xoá thật: ảnh IndexedDB + token Google + dữ liệu Google đã tải + khoá (hỏi riêng) + logo.
- [ ] L1: thay scheme `CHUA-CO-CLIENT-ID` trong Info.plist bằng reversed client ID thật.
- [ ] Test ca khoá (M2): bật Face ID → tắt app → mở lại bằng Face ID → thử PIN khi Face ID lỗi.
- [ ] Đồng bộ PRIVACY.md = PRIVACY.html = code thật (L3), đặc biệt câu về token và "Xoá toàn bộ".

**Trước khi nộp App Store (không chặn TestFlight):**
- [ ] H4: cho chọn nhóm quyền Google trước khi đăng nhập, hoặc sửa tài liệu cho đúng "xin đủ 6 scope 1 lần".
- [ ] M4: triển khai sao lưu v2 mã hoá theo `BACKUP-V2.md` (đã có thiết kế).
- [ ] M1: PIN sang PBKDF2 ≥100.000 vòng (v1.1).
- [ ] M3: tách script inline ra file ngoài, bỏ `unsafe-inline` (v1.1).
- [ ] M5: ghi chú màn hình khoá trong PRIVACY + tuỳ chọn ẩn tên khách ở v1.1.

## 8. Báo cáo 7 mục

1. **Mục tiêu:** Rà soát bảo mật + riêng tư FotoBro iOS v1 (dữ liệu lưu ở đâu, khoá, sao lưu, token Google, ảnh khách, xoá dữ liệu), liệt kê rủi ro theo mức + cách khắc phục — chỉ đọc code, chỉ viết 1 file mới.
2. **Đã thực hiện:** Đọc `www/index.html`, `capacitor-bridge.js`, `fotobro-config.js`, `package.json`, `capacitor.config.ts`, `Info.plist`, `PRIVACY.md`, `RISKS.md`, `GOOGLE-SETUP.md`, `BACKUP-V2.md`, `CLOUDKIT-PLAN.md`, `QA-REPORT.md`; kiểm tra bằng grep/đếm (fetch, CSP, token, lock, innerHTML/esc, scope). Viết file mới duy nhất `~/workspace/fotobro-ios-v1/SECURITY-AUDIT.md`. Không sửa file nào khác, không tạo tài khoản.
3. **Kết quả kiểm tra:** Nền tảng tốt: không máy chủ, không tracking/quảng cáo, không GPS, không upload ảnh khách, không secret hard-code, CSP giới hạn connect-src ở Google APIs, `esc()`/`safeUrl()`/`cleanData()` chặn XSS/URL lạ. Tìm được **5 rủi ro cao** (H1 dữ liệu plaintext + khoá chỉ che màn hình; H2 refresh token lưu plaintext mà không dùng; H3 ngắt kết nối không revoke refresh token; H4 xin đủ 6 scope 1 lần; H5 "Xoá toàn bộ" không xoá hết), **6 trung bình**, **4 thấp**.
4. **Vấn đề còn tồn tại:** H2/H3/H5 sửa rẻ, nên làm trước TestFlight. H1 (mã hoá dữ liệu lúc lưu) là việc lớn, để v1.1. Chưa kiểm chứng được trên iPhone thật: Face ID/passkey với RP ID `localhost`, luồng OAuth PKCE qua trình duyệt hệ thống, và việc gỡ app có xoá sạch IndexedDB không.
5. **Điều kiện chuyển bước:** Sửa xong H2, H3, H5 + thay scheme placeholder trong Info.plist + đồng bộ PRIVACY.md với code thật, rồi mới đưa lên TestFlight. Việt chốt 2 điểm: có giữ `gmail.readonly` ở v1 không (ảnh hưởng thời gian xác minh Google 4–10 tuần so với 2–6 tuần), và có cho chọn nhóm quyền Google trước khi đăng nhập không.
6. **Bước tiếp theo:** Agent chính sửa H2/H3/H5 + L1/L3 theo checklist §7, QA chạy lại, rồi mới đẩy repo + build TestFlight. Sau đó làm sao lưu v2 mã hoá + PIN PBKDF2 ở v1.1.
7. **Trạng thái:** Hoàn thành phần rà soát. Chưa phải code chạy được, chưa sửa gì trong app.


---

## Ghi chú cập nhật — H2/H3/H5/L1/L3 đã sửa trong code (20/11/2026, agent chính)

> Chỉ ghi chú, không sửa code trong lần này. Nhóm pháp lý đã xác nhận các
> sửa dưới đây khớp code hiện tại (xem batch-legal/).

- **H2 (không lưu refresh token):** `gExchangeCode()` không còn lưu
  `d.refresh_token` vào `troLyXeo.grefresh` (đã xoá dòng lưu + `ghadRefresh`);
  `gConnect()` không còn `access_type:'offline'` / `prompt=consent`. Hết hạn
  token xử lý bằng silent re-auth `gConnect(true)` (`prompt=none`). Lúc mở
  app có dọn `troLyXeo.grefresh` + `troLyXeo.ghadRefresh` cũ nếu còn sót.
- **H3 (revoke cả 2 token):** nút "Ngắt kết nối Google Lịch" revoke cả access
  token và refresh token cũ (nếu có) qua `POST oauth2.googleapis.com/revoke`,
  rồi xoá sạch các key Google; lỗi revoke thì toast hướng dẫn thu hồi tay
  (myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba).
- **H5 (xoá toàn bộ thật):** `wipeAll()` chờ revoke 2 token + xoá IndexedDB
  `troLyXeoPhotos` xong (race với timeout 3 giây) mới xoá 14 key rồi reload;
  actionSheet ghi rõ file sao lưu đã tải về và sự kiện đã ghi lên Google Lịch
  không xoá được từ trong app.
- **L1 (placeholder scheme):** `Info.plist` vẫn giữ scheme
  `com.googleusercontent.apps.CHUA-CO-CLIENT-ID` nhưng comment đã ghi rõ là
  PLACEHOLDER — phải thay bằng reversed client ID thật khi có Client ID,
  nếu không Google trả `redirect_uri_mismatch`.
- **L3 (PRIVACY đồng bộ):** `PRIVACY.md` = `PRIVACY.html` = code thật
  (Google mặc định TẮT, 6 scope xin 1 lần, access token ~1h, refresh token
  KHÔNG lưu ở v2.0, mic chưa có ở v2.0, nhắc 12 tiếng, khoá chỉ che UI,
  dữ liệu lưu plaintext trong sandbox — H1). Phiên bản tài liệu đã bump
  v1.0 → **v2.0**, mic dời v1.1 → **v2.1**.
- **Còn mở:** H1 (mã hoá dữ liệu lúc lưu) để **v2.1** theo chỉ đạo; H4 (6 scope
  1 lần) vẫn giữ nguyên hành vi, đã sửa tài liệu cho khớp code thật.
