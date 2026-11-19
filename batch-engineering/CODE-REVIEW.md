# CODE-REVIEW — FotoBro iOS v1 — Checklist review code trước khi merge

> **Phạm vi:** `~/workspace/fotobro-ios-v1/` — app iOS v1, Capacitor 8, Bundle ID `com.fotobro.app`,
> base web FotoBro v2.6 tối giản. File chính: `www/index.html` (~342 KB, 3.901 dòng),
> `www/fotobro-config.js`, `www/capacitor-bridge.js`, `capacitor.config.ts`, `package.json`,
> `ios/App/App/Info.plist`, `.github/workflows/ios-build.yml`, `www/test-fotobro-v1.js`.
> **Thời điểm review:** 20/11/2026 ~00:21–00:35 (+07), chỉ đọc code, không sửa file nào khác.
> File duy nhất được viết trong đợt này là file này.
> **Cách dùng:** reviewer tick từng ô. Mục ⛔ = chặn merge. Mục ⚠️ = sửa trước TestFlight
> hoặc ghi rõ chấp nhận rủi ro. Mục ℹ️ = ghi nhận, không chặn.
> Đối chiếu: `QA-REPORT.md` (00:03–00:04 20/11/2026), `SECURITY-AUDIT.md`,
> `CHANGELOG-v1.0.md`. Nhiều lỗi QA đã được sửa sau 00:04 — xem cột "Trạng thái lúc review".

## 0. Kết quả kiểm tra nhanh (để reviewer khỏi kiểm lại từ đầu)

| Hạng mục | Kết quả lúc review |
|---|---|
| Test jsdom `www/test-fotobro-v1.js` | **101/103 đạt** (chạy lại 20/11/2026, `NODE_PATH=/tmp/film-verify/node_modules node test-fotobro-v1.js`). 2 lỗi đều do **test lỗi thời**, không phải app hỏng (xem §6) |
| `APP_VERSION` | `'1.0'` (`www/index.html:3860`), đúng số iOS v1 |
| Bundle ID | `com.fotobro.app` đúng ở `capacitor.config.ts`, `ios/App/App/capacitor.config.json`, `project.pbxproj`, workflow |
| Workflow build | **Đã sửa sau QA**: Xcode **26.5** trên `macos-26` (`.github/workflows/ios-build.yml:31,36-39`), repo `Hoangviet1397/fotobro` — lỗi chặn submit của QA đã hết |
| Plugin Lịch iPhone | **Đã sửa sau QA**: `@capacitor/calendar ^1.0.1` có trong `package.json` + `node_modules/@capacitor/calendar`; `Info.plist` có đủ 3 key `NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription`, `NSCalendarsWriteOnlyAccessUsageDescription` |
| Mic / giọng nói native | Plugin `@capacitor-community/speech-recognition` **đã gỡ khỏi `package.json`**; `capacitor-bridge.js` ghi rõ dời sang v1.1; nút mic báo "Giọng nói sẽ có ở bản v1.1". Gõ tay vẫn chạy đủ lệnh |
| Secret hard-code | Không tìm thấy API key / client_secret / token thật (xem §4) |
| Dữ liệu mẫu Xèo | `seed()` trả sổ trống (`www/index.html:860-862`); `builtinShots = []`; giá digital + film mặc định 0; tên/studio/Instagram mặc định rỗng |

---

## 1. Pipeline 8 bước — logic lõi (review kỹ nhất)

Định nghĩa duy nhất: `STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']`
(`www/index.html:781`). Mọi chỗ khác phải dùng mảng này, không hard-code chuỗi bước lẻ.

- [ ] **Đủ 8 bước, đúng thứ tự, đúng chính tả** — grep `STAGES` trong `index.html`, đối chiếu từng
      nhãn hiển thị (tab Buổi chụp, chi tiết job, Hôm nay, email mẫu). Không còn bước thừa/thiếu.
- [ ] **Nhảy thẳng tới bước bất kỳ** — `stepsBar(j, big, clickable)` render nút `data-jump`
      (`:1049`); `jumpToStage()` (`:1491-1500`): nhảy lùi 1 bước thì đi thẳng; nhảy qua >1 bước
      thì hiện actionSheet xác nhận "Nhảy qua N bước? … bỏ qua các bước giữa chưa xong".
      Kiểm: nhảy qua bước **Chốt cọc** thì có mở form ghi cọc không (xem §2 — hiện tại `setStage`
      mở form cọc, nhưng nhảy qua bằng `jumpToStage` → `setStage` nên vẫn mở; xác nhận bằng test tay).
- [ ] **Không cho nhảy khi job đã huỷ** — `jumpToStage` return sớm nếu `j.cancelled` (`:1492`).
- [ ] **Đi lùi 1 bước (`prev`)** — `jobAction('prev')` (`:1504`) cho lùi; kiểm tay: lùi từ
      "Đã giao" về "Hậu kỳ" có làm mất tiền đã thu / lịch Google không (hiện tại không — chỉ đổi stage).
- [ ] **Trạng thái Huỷ / Không chốt** — `jobAction('cancel')` (`:1505-1510`): đặt
      `cancelled = true`, giữ `cancelledFrom = stage`, tiền + lịch giữ nguyên, job huỷ không nằm
      trong pipeline đang chạy (`totalOwe()` loại `cancelled`, `:1037`; `stuckInfo()` loại, `:1022`).
      Kiểm: job huỷ không hiện ở Hôm nay / "job đang chạy" / danh sách thiếu tiền.
- [ ] **Khôi phục** — `jobAction('restore')` (`:1507`): về đúng **"Tư vấn"** (không về bước cũ),
      `stageSince = hôm nay`, `cancelledFrom = ''`. Kiểm: khôi phục xong job lại tính vào pipeline.
- [ ] **Xoá job** — `jobAction('del')` (`:1508-1517`): xoá kèm **toàn bộ txs của job**, xoá sự kiện
      Google (`gCalDelete(j.gEventId)` nếu có), xoá checklist `checkDone['job:'+id]`. Xác nhận
      "Không hoàn tác được" trước khi xoá. Kiểm: sau xoá, `totalOwe()` và báo cáo tháng không còn job đó.
- [ ] **Job kẹt** — `stuckInfo()` / `isStuck()` (`:1020-1035`): kẹt khi (a) qua ngày chụp mà vẫn ở
      Tư vấn/Chốt cọc/Sắp chụp, (b) quá hạn giao mà chưa tới Đã giao/Xong, (c) ở 1 bước ≥7 ngày
      (tính từ `stageSince`, fallback `shootDate`). Job kẹt hiện tag đỏ "Kẹt ở …" (`stageTag`, `:1040`)
      và báo lên Hôm nay. Kiểm tay: job mới tạo hôm nay **không** bị gắn kẹt; job không có
      `stageSince` cũng không kẹt oan (days = 0 khi không có ngày).
- [ ] **Nhập từ Lịch iPhone gán bước đúng** — `doImport()` (`:2903`): sự kiện quá khứ → "Đã chụp",
      tương lai → "Sắp chụp"; `deadline = shootDate + deliverDays` (0 thì để trống); giá theo
      `cfg.prices[type]` (digital — nhập lịch luôn `medium:'Digital'`, cần xác nhận đây là ý đồ).
      Chống trùng: `processCalEvents()` lọc theo `calUid` và `client|shootDate`, sự kiện lặp lại
      không chọn sẵn (`:2870-2880`).
- [ ] **Stage lạ từ dữ liệu cũ / file sao lưu** — `cleanData()` ép stage không thuộc `STAGES` về
      "Tư vấn" (`:884`); `medium` lạ về "Digital" (`normMedium`, `:784`). Kiểm: import file sao lưu
      tay sửa stage thành "ABC" không làm vỡ render.
- [ ] **Lịch Google đồng bộ bước** — `gAutoCal(j)` chỉ ghi lịch khi job có `shootDate` + đủ quyền
      `calw`; xoá job xoá luôn event Google. Kiểm: đổi ngày chụp có cập nhật event cũ hay tạo trùng.

## 2. An toàn tiền bạc — sai 1 đồng là mất lòng tin

Công thức chuẩn (giữ nguyên, đừng "cải tiến" khi review):
`jobThu(id)` = tổng tx `kind='thu'` theo `jobId` · `jobOwe(j) = max(0, price − jobThu)` ·
`totalOwe()` = tổng `jobOwe` của job chưa "Xong" và chưa huỷ (`:1015-1017, :1037`).

- [ ] **`jobOwe` không bao giờ âm** — `Math.max(0, …)` (`:1017`). Thu thừa (khách chuyển dư)
      không làm số thiếu thành số âm, không làm lệch báo cáo lời.
- [ ] **Tiền chỉ là số nguyên, không cộng nhầm chuỗi** — `cleanNum()` (`:868`): `NaN` / âm / 0 →
      0, làm tròn; `cleanData()` lọc tx có `amount ≤ 0` (`:890`); `moneyVal()` chỉ giữ chữ số
      (`:1064`). Kiểm: nhập giá "6.000.000" (có dấu chấm) → lưu 6000000; nhập "abc" → 0, không vỡ.
- [ ] **Cọc tự tính đúng % và làm tròn** — sang "Chốt cọc", `setStage` mở form thu với
      `dep = round(price × depositPct% / 10000) × 10000` (`:1476`); máy tính giá dùng cùng công thức
      (`:1960`). Kiểm: giá 15tr, cọc 40% → 6.000.000; giá 0 → form cọc 0 (không ghi khoản 0đ —
      `openTxForm` chặn `amount = 0`, `:1757`).
- [ ] **% cọc bị chặn 0–100, số ngày giao ≤365** — `mergeCfg` (`:831`):
      `depositPct = min(100, …)`, `deliverDays = min(365, …)`. Kiểm: nhập cọc 150% không lưu thành 150%.
- [ ] **Sang "Đã giao" nhắc thu nốt** — `setStage('Đã giao')` toast "Còn thiếu … — nhắc khách thu nốt"
      (`:1480`) + gợi ý email `deliver`. Kiểm: job đã thu đủ thì **không** hiện nhắc thiếu.
- [ ] **Bấm "Xong" mà còn thiếu tiền thì CHẶN + xác nhận** — `setStage('Xong')` khi `jobOwe > 0`
      và chưa `force` thì dừng lại, hiện actionSheet "Vẫn còn thiếu tiền" với 2 lựa chọn:
      "Thu nốt … trước" (mở form thu đúng số thiếu) hoặc "Vẫn xong, thiếu sau" (destructive,
      gọi lại với `force:true`) (`:1466-1473`). Kiểm: không có đường nào tới "Xong" mà bỏ qua
      cảnh báo này (kể cả nhảy bước từ xa tới "Xong" — `jumpToStage` đi qua `setStage` nên vẫn chặn).
- [ ] **Giá film / "Cả hai" không tính sai** — `priceFor(type, medium)` (`:789-794`):
      Film → giá film; "Cả hai" → `digital + film` **chỉ khi cả hai đều > 0**, thiếu một bảng thì
      trả 0 = chưa tính được, để trống cho người dùng tự gõ (không tự cộng 0 rồi báo giá sai).
      Test jsdom §10 đã pass: Wedding "Cả hai" = 15tr + 22tr = 37tr.
- [ ] **Tiền tệ VND/USD chỉ đổi hiển thị, không quy đổi tỷ giá** — `fmt()` (`:964`):
      USD chỉ đổi `$` + định dạng `en-US`, số tiền giữ nguyên. Kiểm: đổi VND→USD không làm
      `jobOwe` / báo cáo thay đổi số.
- [ ] **Thu/chi gắn đúng job, xoá khoản không làm lệch job khác** — tx lưu `jobId` số, `cleanData`
      chỉ giữ `jobId` khi job đó tồn tại (`:891-893`); xoá 1 khoản thu (`:1831`) chỉ xoá đúng `id`.
      Kiểm: xoá khoản thu của job A không đổi số thiếu của job B.
- [ ] **Khấu hao thiết bị** — `depMonthly = round(price / (years × 12))` (`:2302`), `years` ép
      1–30 (`:845`). Kiểm: thiết bị giá 0 / số năm trống không chia cho 0 (guard `+e.years > 0`).
- [ ] **Sao lưu / khôi phục không mất tiền** — file `fotobro-sao-luu.json`; khôi phục qua
      `cleanData()` + `mergeCfg()`; test jsdom §12 pass (save/load giữ giá film Event 7tr).
      Kiểm tay: khôi phục file sao lưu cũ của Xèo (job Wedding 15tr, tên "Xèo", studio
      "Sadako Photography") vẫn giữ nguyên tiền + tên — đây là **tương thích dữ liệu cũ có chủ đích**,
      không phải dữ liệu mẫu (xem §5).

## 3. Khoá Face ID / PIN — khoá phải khoá thật, đừng chỉ là màn che

- [ ] **Bật khoá đúng luồng** — `openLockSetup()` (`:3678-3705`): PIN 4–6 chữ số, nhập 2 lần khớp
      nhau mới gọi `enableLock()`; `enableLock()` tạo passkey WebAuthn (`rp.name:'FotoBro'`,
      `userVerification:'required'`, `authenticatorAttachment:'platform'`) rồi mới lưu
      `{id, salt, pin: SHA-256(salt + ':' + PIN)}` vào `troLyXeo.lock` (`:3636-3647`).
      Kiểm: huỷ giữa chừng (NotAllowedError) thì **không** lưu khoá nửa vời.
- [ ] **Mở khoá: Face ID trước, PIN dự phòng sau** — `showLock()` (`:3660-3695`): nút Face ID thử
      `bioCheck()`; sai thì báo "thử lại hoặc dùng mã PIN"; form PIN chỉ hiện khi bấm "Dùng mã PIN".
- [ ] **Chống đoán mò PIN trên giao diện** — sai ≥5 lần thì khoá `30s × 2^(sai−5)` (`lockUntil`,
      `:3690-3692`); thông báo đếm ngược số giây còn lại. Kiểm: sai 5 lần liên tiếp thì lần 6 bị chặn.
- [ ] **Tự khoá lại khi rời app** — `visibilitychange`: ẩn >2 phút thì `showLock(true)` (`:3696-3698`).
      Kiểm tay trên iPhone: mở app khác 3 phút rồi quay lại → phải hiện màn khoá.
- [ ] **Tắt khoá phải xác thực lại** — `disableLock()` (`:3706-3711`): thử Face ID trước, thất bại
      thì hỏi PIN; sai thì dừng, không tắt khoá.
- [ ] **Quên cả Face ID lẫn PIN thì có đường ra rõ ràng** — app ghi rõ "quên cả hai thì phải xoá
      dữ liệu trang web mới vào lại được (nên tải bản sao lưu trước)" (`:3684`). Kiểm: câu này còn
      hiện trong màn bật khoá, không bị xoá khi dọn UI.
- [ ] ⚠️ **Biết rõ giới hạn (không chặn merge, nhưng phải ghi vào PRIVACY / TestFlight notes)** —
      theo `SECURITY-AUDIT.md` H1/M1/M2, vẫn còn mở ở v1:
  - Dữ liệu chính lưu **plaintext** trong `localStorage` (`troLyXeo.v1`) + IndexedDB
    (`troLyXeoPhotos`): khoá app chỉ ẩn giao diện, không mã hoá dữ liệu. Chấp nhận cho v1
    (dựa vào khoá máy + sandbox iOS) — **phải ghi đúng trong PRIVACY**, không được ghi "dữ liệu
    đã mã hoá".
  - PIN 4–6 số, băm SHA-256 nhanh (không PBKDF2/bcrypt): chống đoán mò trên giao diện thì đủ,
    chống đoán mò offline nếu trích xuất được `troLyXeo.lock` thì không. Ghi vào backlog v1.1.
  - Passkey dùng `rp.id = location.hostname` (`:3639`): trên Capacitor hostname là
    `capacitor://localhost` — **chưa kiểm chứng trên iOS thật**; passkey tạo trên bản web không
    mở được app native và ngược lại. **Bắt buộc test trên TestFlight**: bật khoá → tắt app →
    mở lại → Face ID mở được; nếu không được thì đây thành ⛔ trước khi submit.
- [ ] **"Xoá toàn bộ dữ liệu" xoá thật** — `wipeAll()` (`:2244-2262`, đã sửa theo SECURITY-AUDIT H5):
      thu hồi cả access token + refresh token cũ (nếu còn), xoá IndexedDB `troLyXeoPhotos`,
      xoá toàn bộ `WIPE_KEYS` (gồm `troLyXeo.lock`, `gcal/gmail/gcontacts`, `heroPin`, cài đặt),
      reset `cfg` về mặc định, `location.reload()`. Kiểm: sau wipe, mở lại app là sổ trắng + khoá đã tắt.
      Lưu ý còn đúng: file sao lưu JSON đã tải + sự kiện đã ghi trên Google Lịch **không** xoá được
      từ trong app — app đã báo rõ trong hộp thoại xác nhận, giữ nguyên câu chữ đó.

## 4. Secret / OAuth Google / quyền riêng tư — không rò rỉ, không xin thừa

- [ ] **Không secret hard-code** — grep `api[_-]?key|client[_-]?secret|AIza|ghp_|sk-|Bearer ` (token
      thật) trong `www/`, `capacitor.config.ts`, `ios/`: lúc review chỉ còn **nhắc tên trong comment**
      và code dùng token lúc chạy. `googleClientId: ''` (trống) trong `www/fotobro-config.js:20`.
      Không điền `client_secret` vào app (public client dùng PKCE — comment trong file đã ghi rõ).
- [ ] **Google Client ID chung còn trống là ĐÚNG cho tới khi Việt tạo** — chưa có Client ID thì nút
      "Đăng nhập Google" báo "chưa sẵn sàng", app vẫn chạy bình thường. ⛔ **Trước khi merge bản
      có Client ID thật:** Client ID chỉ được dán vào `fotobro-config.js` (1 chỗ), **không** commit
      `client_secret`, không commit file `GoogleService-Info.plist` chứa secret, và phải đăng ký
      scheme reversed `com.googleusercontent.apps.<Client-ID-phần-đầu>` trong `Info.plist`
      **thay cho** placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID` hiện tại
      (`Info.plist:103`) — nếu không sẽ lỗi `redirect_uri_mismatch`.
- [ ] **PKCE đúng, không lưu refresh token** — `gConnect()` xin code + `code_challenge S256`
      (`:2981-2989`); `gExchangeCode()` đổi code lấy token (`:3006-3013`) và **CỐ TÌNH không lưu
      `d.refresh_token`** (comment H2, `:3011`); access token chỉ giữ trong `sessionStorage`
      (`troLyXeo.gtoken`, hết hạn ~1h, kiểm tra `exp > now + 60s`, `:2966`). Không có
      `grant_type=refresh_token` trong code. Các đoạn code cũ đọc `troLyXeo.grefresh` chỉ còn để
      **thu hồi + dọn** token cũ (`:938, :2253, :2457`), không dùng để làm mới — giữ nguyên.
- [ ] **Ngắt kết nối thu hồi đủ token** — nút Ngắt kết nối + `wipeAll()` gọi revoke cả access token
      và refresh token cũ (nếu còn) trước khi xoá ở máy (`:2452-2462, :2253`). Kiểm: sau ngắt kết nối,
      token cũ không còn dùng được (kiểm bằng cách mở lại app — Gmail/Lịch phải báo chưa kết nối).
- [ ] **Scope Google: biết rõ đang xin đủ 6 scope 1 lần** — `gScopes()` (`:3207-3211`) xin 1 lần:
      `calendar.readonly`, `gmail.readonly`, `contacts.readonly`, `drive.metadata.readonly`,
      `calendar.events`, `gmail.send`. Đây là quyết định "AUTO 1 chạm" đã chốt cho v1, nhưng
      **trái với câu chữ cũ trong PRIVACY.md** ("chỉ bật từng tính năng", "mặc định TẮT") — xem
      SECURITY-AUDIT H4. ⛔ **Trước submit:** hoặc sửa PRIVACY + màn "Đăng nhập Google để làm gì?"
      cho đúng thực tế (xin đủ 6 scope 1 lần), hoặc tách nhóm quyền (Lịch / Gmail / Drive).
      Lưu ý: `gmail.readonly` là scope restricted — Google xác minh 4–10 tuần; nếu muốn rút ngắn
      thì dời đọc Gmail sang v1.1 (quyết định chờ Việt, xem `GOOGLE-SETUP.md` §7).
- [ ] **CSP + chống XSS (spot-check, chưa phải audit đầy đủ)** — CSP meta (`index.html:8`):
      `default-src 'self'`, `connect-src` chỉ Google APIs + `oauth2.googleapis.com`,
      `object-src 'none'`, `frame-src 'none'`; chặn framing (`window.top !== window.self`, `:12`).
      Dữ liệu người dùng render qua `esc()` (`:993`) ở các chỗ đã kiểm (tên khách, stage, lịch);
      URL ngoài qua `safeUrl()` chặn `javascript:`/`data:` (`:873-878`); `cleanStr` giới hạn độ dài.
      Kiểm khi review: tìm `innerHTML =` + biến chưa qua `esc()` trong code mới thêm sau đợt này.
- [ ] **Không tracking / quảng cáo / GPS** — grep `analytics` = 0; `fetch(` chỉ tới Google APIs +
      revoke; không lưu file ghi âm (mic đã dời v1.1). CloudKit Nấc 2 chỉ là tên container
      `iCloud.com.fotobro.app` ở trạng thái `not-configured` — không có dữ liệu nào rời máy qua
      CloudKit ở v1.
- [ ] **Email hỗ trợ + Support URL còn placeholder là đúng lúc này** — `supportEmail: ''` trong
      `fotobro-config.js`; `support@fotobro.app` chưa có thật (domain chưa mua). ⛔ **Trước submit
      App Store:** phải có Support URL + Privacy Policy URL thật đã host (file `PRIVACY.html` /
      `SUPPORT.html` đã viết, chưa host) — App Store Review sẽ kiểm.

## 5. Không dữ liệu mẫu / không cá nhân hoá của Xèo

Quyết định đã chốt 23:48 19/11: bỏ hẳn E.L.F./Super Junior, 6 ảnh mẫu + 5 job mẫu của Xèo; giữ lõi chung.

- [ ] **Không còn job / tiền mẫu** — `seed()` (`:860-862`): `jobs = []`, `txs = []`, `sample = false`,
      kèm comment "iOS v1: KHÔNG còn job/tiền mẫu — người mới bắt đầu với sổ trống". Test jsdom
      hiện fail ở expect cũ "mẫu có 5 job" chính vì app đã bỏ mẫu (xem §6).
- [ ] **Không còn ảnh mẫu** — `builtinShots = []` (`:3724`); `data:image` duy nhất còn là 1 icon SVG
      nhỏ, không phải ảnh mẫu (QA đã kiểm). Ảnh trang chủ chỉ từ ảnh người dùng thêm (IndexedDB,
      tối đa 60).
- [ ] **Cấu hình mặc định trống + giá 0** — `DEFAULT_CFG` (`:814-819`): `name/studio/instagram = ''`,
      `prices` + `pricesFilm` toàn 0 cho cả 5 gói, `depositPct = 40`, `deliverDays = 14`,
      `equipment/fixed = []`. Test jsdom §1 pass.
- [ ] **Không còn E.L.F. / Super Junior / Pearl Sapphire trong giao diện** — grep
      `Super Junior|Pearl Sapphire|xeonong|Sadako` trong `index.html` = 0 (chỉ còn trong **fixture
      test** §2/§12 để kiểm tương thích dữ liệu cũ — xem ô dưới, không phải lỗi).
      ⚠️ **Còn sót 1 xác chết CSS:** `.elf-grid` / `.elf-m` (`:396-401`) — chỉ còn CSS, **không còn
      phần tử HTML / JS nào dùng tới**. Không ảnh hưởng chạy, nhưng phải xoá trước merge để khỏi
      bị hiểu là chưa bỏ E.L.F. (QA 00:03 báo 0 lần vì grep theo tên tính năng, không grep class CSS).
- [ ] **Còn sót logic "dữ liệu mẫu" dù job mẫu đã bỏ** — `state.sample` vẫn tồn tại:
      banner `#sampleBanner` (`:536-540`), nút `#clearSample` / `#sampleUseReal`, nhánh
      `if (state.sample)` ở nhập lịch (`:2888, :2899`) và `#clearLabel` (`:1978`). Vì `seed()` đặt
      `sample = false` nên banner không hiện với người mới — nhưng code chết này dễ gây nhầm
      (QA cũng ghi `sampleNote` đã xoá, còn `sampleBanner` thì chưa). ⚠️ Xoá hẳn hoặc chứng minh
      bằng test: người mới mở app → `#sampleBanner` có class `hidden`.
- [ ] **Dữ liệu cũ của Xèo được GIỮ (không phải lỗi)** — key `troLyXeo.v1` / `troLyXeoPhotos` giữ
      nguyên có chủ đích để Xèo chuyển sang không mất dữ liệu; `mergeCfg()` giữ tên/giá cũ;
      test §2/§12 dùng fixture tên "Xèo" / studio "Sadako Photography" để kiểm việc này và đều pass.
      Reviewer **không** được yêu cầu "xoá hết chữ Xèo" trong test fixture — chỉ xoá dữ liệu mẫu
      trong **app chạy**.
- [ ] **Tên hiển thị / tagline mặc định là chung, không phải của Xèo** — kiểm: màn Hôm nay với
      người mới hiện "bạn" (qua `greetName()`), không hiện tên riêng; `tagline` mặc định
      `portrait | lookbook | wedding` là nhãn chung, chấp nhận được.

## 6. Test — chạy được mới merge

- [ ] **Test jsdom đạt 103/103 sau khi sửa test** — lúc review: **101/103**, 2 lỗi đều do test lỗi thời:
  1. `APP_VERSION 2.6 — got="1.0" want="2.6"` (`test-fotobro-v1.js:47`): app đã là `1.0`, test còn
     expect `2.6` (copy từ test v2.6).
  2. `mẫu có 5 job — got=0 want=5` (`test-fotobro-v1.js:128`): app đã bỏ job mẫu, test còn expect 5.
  
      ⛔ **Sửa 2 expect này theo spec v1** (`'1.0'` và `0` job mẫu) rồi chạy lại, kỳ vọng 103/103.
      Không được sửa app để chiều test cũ.
- [ ] **Test chưa cover tính năng mới của v1** — test hiện tại không có case nào cho: nhảy bước
      pipeline, huỷ/khôi phục job, cảnh báo "Xong còn thiếu tiền", job kẹt, màu chủ đề, logo,
      sửa mẫu tin nhắn, ngôn ngữ/tiền tệ, Google auto, Lịch native. ⚠️ Trước merge: thêm ít nhất
      test cho 4 case chặn tiền/pipeline: (a) nhảy qua "Chốt cọc" mở form cọc đúng số,
      (b) "Xong" khi còn thiếu → chặn, (c) huỷ → khôi phục về "Tư vấn",
      (d) `priceFor` "Cả hai" thiếu 1 bảng → 0. Các case còn lại ghi vào backlog test v1.1 nếu
      không kịp.
- [ ] **Cú pháp script** — QA đã kiểm 13/13 script inline pass `node --check` (2 lần). Reviewer
      chạy lại sau mọi sửa đổi cuối: trích script inline → `node --check` từng file, và
      `npx cap sync ios` không báo lỗi (chạy trên macOS runner, không kiểm được trên Linux).
- [ ] **Không có `console.log` debug / `alert` sót trong code merge** — grep nhanh trước merge.
- [ ] **Chưa kiểm chứng trên iPhone thật — ghi rõ, không giả vờ đã kiểm** — build `.ipa`,
      TestFlight, Local Notifications, Face ID/passkey, chọn ảnh, Share sheet, nhập Lịch iPhone
      native, Google OAuth deep-link: **tất cả đều chưa chạy lần nào** (cần macOS runner / iPhone
      thật). Merge code ≠ xác nhận chạy được. Xem §7 điều kiện chuyển bước.

## 7. iOS / Capacitor / App Store — những thứ chỉ lộ ra khi build thật

- [ ] **Workflow đã đúng để submit** — `.github/workflows/ios-build.yml`: `macos-26`, Xcode `26.5`,
      Bundle ID `com.fotobro.app`, tên repo `fotobro` (đã sửa sau QA — kiểm lại dòng 5 và tên
      archive/artifact không còn `TroLyXeo`). Secrets GitHub Actions (chứng chỉ, provisioning)
      phải đủ trước khi chạy workflow — không thuộc code review này, ghi vào checklist release.
- [ ] **Màu nền Capacitor đồng nhất UI mới** — `capacitor.config.ts` đã là `#FFFFFF` (Splash +
      StatusBar + background). ⚠️ **File sinh ra `ios/App/App/capacitor.config.json` vẫn còn
      `#FBF5EA` (kem vintage) ở 3 chỗ** — file này do `npx cap sync ios` sinh lại từ
      `capacitor.config.ts`, nên sau lần sync tới sẽ tự hết; reviewer xác nhận sau sync không còn
      `#FBF5EA`, không sửa tay file sinh ra.
- [ ] **Lịch iPhone native đủ điều kiện chạy** — `@capacitor/calendar ^1.0.1` trong `package.json`,
      `node_modules/@capacitor/calendar` đã có, `Info.plist` đủ 3 key lịch, `importFromNativeCalendar()`
      (`:2834-2855`) xin quyền `readCalendar` rồi `findEvents(30 ngày tới)`, không còn fallback
      file `.ics` (đã bỏ hẳn theo quyết định 00:06 20/11 — nhập lịch chỉ còn native + Google).
      ⚠️ `capacitor-bridge.js` ghi "CHƯA KIỂM CHỨNG trên iOS thật" — bắt buộc test trên TestFlight:
      bấm "Nhập từ Lịch iPhone" → cấp quyền → sự kiện 30 ngày tới nạp thành job. Nếu `isNativeCalendar()`
      trả `false` trên máy thật thì đây thành ⛔.
- [ ] **Google OAuth native** — mở bằng plugin `@capacitor/browser` (Google cấm OAuth trong
      WKWebView), trả code về qua `appUrlOpen` → `handleGoogleReturnUrl()` (`capacitor-bridge.js:68-80`).
      Chưa kiểm chứng thật. TestFlight phải thử: đăng nhập → quay lại app → Lịch Google tải được.
- [ ] **Mic đã dời v1.1 đúng cách** — không còn plugin speech-recognition trong `package.json`;
      nút mic báo "Giọng nói sẽ có ở bản v1.1"; gõ tay đủ lệnh (test §11 pass: thêm job film/cả hai/
      digital). Kiểm: không còn import / gọi plugin giọng nói nào trong `index.html` gây crash khi
      bấm mic.
- [ ] **Rủi ro App Store Guideline 4.8** — app có đăng nhập Google thì Apple có thể yêu cầu
      Sign in with Apple tương đương — phương án đã chuẩn bị trong `APP-STORE-READY.md`; không chặn
      merge, ghi vào checklist submit.
- [ ] **Icon / screenshot / listing** — logo v2 trong `assets/logo-v2/` đang chờ Việt duyệt, chưa thay
      icon thật; screenshot App Store cần dữ liệu mẫu **hư cấu** theo `SCREENSHOT-DATA.md` (không
      dùng dữ liệu thật của Xèo). Không chặn merge code, chặn submit nếu chưa xong.

## 8. Checklist ký duyệt (điền tay trước khi merge)

| Người review | Ngày | Kết quả |
|---|---|---|
| Reviewer 1 (code — pipeline + tiền) | | ☐ Đạt / ☐ Chưa đạt — ghi mục còn mở: |
| Reviewer 2 (bảo mật — §3 + §4) | | ☐ Đạt / ☐ Chưa đạt — ghi mục còn mở: |
| Việt (quyết: scope Gmail 6-in-1, PRIVACY, giá CloudKit Nấc 2/3) | | ☐ Đồng ý / ☐ Cần sửa: |

**Quy tắc merge:**

1. Tất cả ô ⛔ đã tick (hoặc ghi rõ lý do hoãn + issue theo dõi).
2. Test jsdom 103/103 sau khi sửa 2 expect cũ.
3. Không merge khi còn TODO / placeholder liên quan tới tiền, khoá, secret trong code mới.
4. Merge xong: chạy lại workflow Xcode 26 trên GitHub Actions; chỉ khi build green mới gắn
   nhãn "sẵn sàng TestFlight" — merge code không đồng nghĩa build được.

## 9. Vấn đề còn mở sau đợt review này (tóm tắt để theo dõi)

| # | Vấn đề | Mức | Nguồn |
|---|---|---|---|
| 1 | Test jsdom còn 2 expect cũ (`APP_VERSION '2.6'`, 5 job mẫu) — sửa test, không sửa app | ⛔ trước merge | §6, test:47,128 |
| 2 | CSS chết `.elf-grid`/`.elf-m` còn sót | ⚠️ trước merge | §5, index.html:396-401 |
| 3 | Logic `state.sample` / `#sampleBanner` còn sót dù job mẫu đã bỏ | ⚠️ trước merge | §5, index.html:536,811,2618 |
| 4 | `capacitor.config.json` (file sinh ra) còn `#FBF5EA` — hết sau `cap sync` | ⚠️ kiểm sau sync | §7 |
| 5 | PRIVACY + màn đăng nhập Google chưa theo kịp thực tế xin đủ 6 scope 1 lần | ⛔ trước submit | §4, SECURITY-AUDIT H4 |
| 6 | Placeholder scheme Google `com.googleusercontent.apps.CHUA-CO-CLIENT-ID` trong `Info.plist` — thay khi có Client ID thật | ⛔ khi có Client ID | §4, Info.plist:103 |
| 7 | Face ID/passkey (`rp.id = location.hostname`), Lịch native, OAuth deep-link, Local Notifications — chưa kiểm chứng trên iOS thật | ⛔ trước submit (test TestFlight) | §3, §7 |
| 8 | Dữ liệu plaintext + PIN SHA-256 nhanh — chấp nhận cho v1, ghi đúng PRIVACY, backlog v1.1 (AES-256-GCM / PBKDF2) | ℹ️ | §3, SECURITY-AUDIT H1/M1 |
| 9 | Test chưa cover tính năng mới v1 (pipeline/tiền/cá nhân hoá/Google/Lịch) | ⚠️ trước merge (tối thiểu 4 case §6) | §6 |
| 10 | Support URL / Privacy Policy URL thật + email hỗ trợ chưa có (domain chưa mua) | ⛔ trước submit | §4 |
