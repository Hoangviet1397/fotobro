# FotoBro iOS v1 — Luồng xin quyền (Consent Flows)

> Trạng thái: **tài liệu thiết kế, 20/11/2026** — câu chữ chốt để agent làm app
> nối vào, chưa phải code chạy được. Chỉ viết 1 file này, không sửa code.
>
> Nguồn đối chiếu (đọc thật, 20/11/2026):
> `ios/App/App/Info.plist` (6 usage description hiện có),
> `www/index.html` (nhập Lịch iPhone `importFromNativeCalendar`,
> `createEventInteractively`, khoá passkey + PIN `openLockSetup`/`showLock`,
> Google `gScopes()`/`gConnect()`, mic `startListening`),
> `www/capacitor-bridge.js` (Local Notifications, `__trolyxeoPickHero`,
> `@capacitor/calendar`),
> `NOTIFICATIONS.md` §3 (thiết kế xin quyền Thông báo),
> `ONBOARDING.md:68` (nguyên tắc hỏi quyền),
> `VOICE-COMMANDS.md` (mic dời v1.1),
> `GOOGLE-SETUP.md` §3 (6 scope Google),
> `RISKS.md` §3 (passkey trong WKWebView),
> `package.json` (plugin Capacitor 8 đã cài).
>
> Ngôn ngữ trong app: `locale` chỉ nhận `'vi'` / `'en'`
> (xem `I18N-STRINGS.md`). Câu chữ dưới đây có cả hai thứ tiếng; **tiếng Việt
> là bản chốt**, tiếng Anh là bản dịch đi kèm (khi thêm ngôn ngữ vào app thì
> dùng đúng câu này, không dịch lại tự do).

## 0. Nguyên tắc chung — xin đúng lúc, không xin dồn

1. **Không xin quyền nào lúc mở app lần đầu.** `ONBOARDING.md:68` đã chốt:
   _"Không hỏi quyền (Lịch, Ảnh, Micro, Thông báo) ngay lúc chào — hỏi quyền
   khi người dùng bấm tính năng cần quyền lần đầu."_ Màn chào mừng chỉ có nút
   vào tính năng (`Bắt đầu sổ trống`, `Nhập từ Lịch iPhone`, `Xem thử với dữ
   liệu mẫu`) — bấm mới tới bước xin quyền.
2. **Hai lớp trước mỗi hộp thoại hệ thống:** (a) câu giải thích trong app
   (sheet / dòng phụ dưới nút) nói rõ quyền dùng để làm gì và dữ liệu có rời
   khỏi máy không; (b) hộp thoại hệ thống của iOS (chỉ hiện 1 lần, câu chữ
   lấy từ `Info.plist`). Người dùng bấm "Để sau" / "Huỷ" ở lớp (a) thì
   **không gọi API hệ thống**, không tính là đã hỏi.
3. **Từ chối không được làm hỏng app.** Mọi tính năng có quyền đều có đường
   làm tay thay thế (tạo job bằng tay, gõ câu hỏi thay vì nói, xem lịch trong
   app thay vì nhắc). Từ chối quyền không khoá màn hình, không bắt đăng nhập,
   không hiện lại hộp thoại hệ thống (iOS không cho hiện lại).
4. **Thu hồi lúc nào cũng được.** Mỗi mục dưới đây ghi rõ đường bật lại
   trong Cài đặt iOS và trong Cài đặt của app (nếu có). Ngắt quyền trong Cài
   đặt iOS thì dữ liệu đã nhập trước đó (job, ảnh, token Google) vẫn ở trên
   máy, không bị xoá theo.
5. **Dữ liệu không rời khỏi máy** (trừ Google — xem §6, và giọng nói v1.1 —
   xem §7). Lịch iPhone, ảnh, nhắc lịch, Face ID đều xử lý local.

## 1. Bảng tổng quan

| # | Quyền | Hộp thoại hệ thống | Xin khi nào | Không có trong v1? |
|---|---|---|---|---|
| §2 | Lịch iPhone — đọc (EventKit) | Có (`NSCalendars…`) | Bấm "Nhập từ Lịch iPhone" | Không |
| §2 | Lịch iPhone — ghi (EventKit) | Có (`NSCalendars…`) | Bấm "Thêm vào Lịch iPhone" trong chi tiết job | Không |
| §3 | Thư viện ảnh — xem | Có (`NSPhotoLibrary…`) | Bấm "Thêm ảnh từ máy" / "Chọn logo từ máy" | Không |
| §3 | Thư viện ảnh — thêm (lưu) | Có (`NSPhotoLibraryAdd…`) | Cùng lúc chọn ảnh (hệ thống gộp) | Không |
| §3 | Máy ảnh — chụp ảnh mới | Có (`NSCamera…`) | Khi bộ chọn ảnh hệ thống cho chọn "Chụp ảnh" | Xem §9 D4 |
| §4 | Thông báo local | Có (hộp thoại iOS, **không cần key `Info.plist`**) | Lần đầu tạo job có ngày chụp | Không |
| §5 | Face ID / vân tay (khoá app) | **Không** — dùng passkey WebAuthn, không dùng `LAContext` | Bật trong Cài đặt → "Khoá app bằng Face ID" | Không |
| §6 | Google sign-in (Lịch, Gmail, Danh bạ, Drive) | **Không** — màn hình xin phép của Google, không phải hộp thoại iOS | Bấm "Kết nối Google" | Client ID thật chưa có — xem §9 D7 |
| §7 | Micro + nhận dạng giọng nói | Có (`NSMicrophone…`, `NSSpeech…`) | **v1.1 — v1 KHÔNG xin** | **Dời v1.1** |

## 2. Lịch iPhone (EventKit — `@capacitor/calendar` 1.0.1)

### 2.1 Đọc lịch — nhập buổi chụp thành job

**Code thật:** `importFromNativeCalendar()` trong `www/index.html` —
`Cal.checkPermissions()` → nếu chưa `granted` thì
`Cal.requestPermissions({ permissions:['readCalendar'] })` → rồi
`Cal.findEvents({ startDate: now, endDate: now + 30 ngày })`. Chỉ đọc
tiêu đề / giờ / địa điểm / ghi chú của sự kiện; sự kiện lặp lại (sinh nhật,
họp…) không chọn sẵn; sự kiện trùng job đã có thì gắn thẻ "Đã có".

**Văn bản trong app trước khi xin** (đã có trong code, giữ nguyên):

- Tiêu đề sheet: `Nhập từ Lịch iPhone`
  — EN: `Import from iPhone Calendar`
- Dòng giải thích: `Lịch hẹn chụp có sẵn → thành buổi chụp trong app`
  — EN: `Turn your existing shoot appointments into jobs in the app`
- Dòng phụ dưới nút: `Bấm 1 cái là lấy hết sự kiện 30 ngày tới từ Lịch
  iPhone, thành buổi chụp trong app. App chỉ đọc lịch, không sửa gì. Hoặc
  đăng nhập Google để đọc Lịch Google.`
  — EN: `One tap imports the next 30 days of events from your iPhone
  Calendar as jobs. The app only reads your calendar — it changes nothing.
  Or sign in with Google to read Google Calendar instead.`
- Nút: `Nhập từ Lịch iPhone` — EN: `Import from iPhone Calendar`

**Thời điểm xin:** khi người dùng bấm nút trên — từ màn Hôm nay
(`calRow`), từ Cài đặt → Nhập dữ liệu (`cfgCal`), hoặc từ màn chào mừng
(`wlCal`). Trên app native, sheet tự gọi nhập sau 350 ms
(`setTimeout(…, 350)` trong `openCalImport`) — tức là hộp thoại hệ thống
hiện ngay sau khi mở sheet, không đợi bấm lần nữa. Ngoài app iOS (bản web),
nút này không hiện — chỉ hiện nút "Đăng nhập Google".

**`Info.plist` — purpose string (đang có, giữ nguyên từng chữ):**

```xml
<key>NSCalendarsFullAccessUsageDescription</key>
<string>FotoBro cần đọc Lịch iPhone để nhập buổi chụp 30 ngày tới thành job — chỉ khi bạn bấm "Nhập từ Lịch iPhone".</string>
<key>NSCalendarsUsageDescription</key>
<string>FotoBro cần đọc và ghi Lịch iPhone để nhập buổi chụp thành job và thêm buổi chụp vào lịch của bạn.</string>
```

- EN (bản dịch để dùng khi thêm `InfoPlist.strings`, chưa có trong plist
  hôm nay — plist hiện chỉ có tiếng Việt):
  - Full Access: `FotoBro needs to read your iPhone Calendar to import
    shoots from the next 30 days as jobs — only when you tap "Import from
    iPhone Calendar".`
  - Usage: `FotoBro needs to read and write your iPhone Calendar to
    import shoots as jobs and add shoots to your calendar.`

**Nếu bị từ chối** (code đã xử lý, giữ nguyên hành vi):

- Toast trong app: `Chưa cho phép đọc Lịch iPhone — bật trong Cài đặt
  iPhone → FotoBro → Lịch`
  — EN: `iPhone Calendar access not granted — turn it on in iPhone
  Settings → FotoBro → Calendars`
- Sheet nhập lịch trở về trống, không báo lỗi thêm, không hỏi lại.
- App vẫn chạy đủ: tạo job bằng tay, nhập qua Google Lịch (§6), xem /
  sửa / xoá job bình thường. Job đã nhập trước đó không mất.
- Bật lại: `Cài đặt iPhone → FotoBro → Lịch → bật "Truy cập đầy đủ"`
  (iOS 17+; với lựa chọn "Chỉ thêm sự kiện" thì chỉ ghi được, không đọc
  được — app sẽ báo lại câu toast trên khi nhập). Mở lại app rồi bấm
  "Nhập từ Lịch iPhone" lần nữa là chạy.

### 2.2 Ghi lịch — thêm buổi chụp vào Lịch iPhone

**Code thật:** trong chi tiết job, nút "Thêm vào Lịch iPhone" gọi
`Cal.createEventInteractively({ title, location, notes, startDate,
endDate: +2 giờ, firstReminderMinutes: 720 })` — tức là **mở trình sửa
sự kiện của hệ thống** để người dùng xem lại rồi mới lưu, kèm nhắc trước
12 tiếng. Thành công: toast `Đã thêm vào Lịch iPhone`. Lỗi / huỷ: tự
rơi về tải file `.ics` (`downloadICS(j)`).

**Văn bản trong app trước khi xin:**

- Nút trong chi tiết job: `Thêm vào Lịch iPhone`
  — EN: `Add to iPhone Calendar`
- Không cần thêm sheet giải thích riêng: trình sửa sự kiện của hệ thống đã
  hiện rõ tiêu đề / giờ / địa điểm trước khi lưu — đó chính là lớp xác nhận.

**`Info.plist` — purpose string (đang có, giữ nguyên từng chữ):**

```xml
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>FotoBro cần ghi buổi chụp vào Lịch iPhone khi bạn bấm "Thêm vào Lịch iPhone" trong chi tiết job.</string>
```

- EN: `FotoBro needs to add shoots to your iPhone Calendar when you tap
  "Add to iPhone Calendar" in a job's details.`

**Thời điểm xin:** chỉ khi bấm nút trong chi tiết job có ngày chụp. Job
chưa có ngày chụp: toast `Job này chưa có ngày chụp` (đã có trong code),
không xin quyền.

**Nếu bị từ chối:** hệ thống không cho lưu sự kiện; code rơi về tải file
`.ics` để người dùng tự mở bằng app Lịch — buổi chụp không mất, job trong
app vẫn nguyên. Bật lại: `Cài đặt iPhone → FotoBro → Lịch`.

## 3. Ảnh — thư viện ảnh và máy ảnh (`@capacitor/camera` 8.2.6)

### 3.1 Chọn ảnh làm ảnh trang chủ / logo studio

**Code thật:** `__trolyxeoPickHero()` trong `www/capacitor-bridge.js` dùng
`Camera.getPhoto({ source: 'PHOTOS', resultType: 'DATA_URL', quality: 85 })`
— chỉ chọn ảnh có sẵn trong thư viện, lưu vào IndexedDB
`troLyXeoPhotos` (tối đa 60 ảnh), ảnh trang chủ đổi mỗi ngày. Logo studio:
tối đa 1 ảnh, "lưu trên máy này". Xem §9 D3: hàm bridge này **chưa được
móc nối** vào luồng chọn ảnh trong `index.html` — luồng hiện tại dùng
`<input type="file" accept="image/*">`, trên iOS vẫn mở bộ chọn ảnh hệ
thống.

**Văn bản trong app trước khi xin** (đã có trong code, giữ nguyên):

- Nút: `Thêm ảnh từ máy` — EN: `Add photos from this phone`
- Dòng phụ: `Ảnh lưu trong app, ảnh trang chủ đổi mỗi ngày`
  — EN: `Photos stay in the app; the home photo changes daily`
- Logo: `Chọn logo từ máy` / `Tối đa 1 ảnh, lưu trên máy này`
  — EN: `Choose a logo from this phone` / `One image max, stored on this phone`
- Khi đã có ảnh: `N ảnh từ máy · ảnh trang chủ đổi mỗi ngày`
  — EN: `N photos from this phone · home photo changes daily`

**`Info.plist` — purpose strings (đang có, giữ nguyên từng chữ):**

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>FotoBro cần xem thư viện ảnh để bạn chọn ảnh làm ảnh trang chủ của app.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>FotoBro lưu ảnh bạn chọn làm ảnh trang chủ trên máy của bạn.</string>
<key>NSCameraUsageDescription</key>
<string>FotoBro cần máy ảnh để bạn chụp ảnh mới làm ảnh trang chủ của app.</string>
```

- EN:
  - Library (read): `FotoBro needs to see your photo library so you can
    pick a photo as the app's home photo.`
  - Library (add): `FotoBro saves the photo you pick as the home photo on
    this phone.`
  - Camera: `FotoBro needs the camera so you can take a new photo as the
    app's home photo.`

**Thời điểm xin:** khi bấm "Thêm ảnh từ máy" (màn Hôm nay) hoặc "Chọn logo
từ máy" (Cài đặt → Logo studio). Không xin lúc mở app, không xin khi chỉ
xem ảnh trang chủ có sẵn.

**Nếu bị từ chối:**

- Bộ chọn ảnh hệ thống không mở / mở trống; app không báo lỗi ầm ĩ — ảnh
  trang chủ giữ ảnh có sẵn (ảnh mẫu của app hoặc ảnh đã chọn trước đó),
  logo giữ nguyên (hoặc "Chưa có logo").
- Tính năng khác không ảnh hưởng: job, sổ tiền, nhắc lịch chạy bình thường.
- Bật lại: `Cài đặt iPhone → FotoBro → Ảnh` — chọn "Truy cập đầy đủ"
  (để chọn ảnh bất kỳ) hoặc "Ảnh được chọn" (chỉ các ảnh đã chọn). Câu
  hướng dẫn trong app khi cần (chưa có trong code — thêm khi nối v1):
  `Chưa cho phép xem Ảnh — bật trong Cài đặt iPhone → FotoBro → Ảnh`
  — EN: `Photo access not granted — turn it on in iPhone Settings →
  FotoBro → Photos`
- **Lưu ý quyền "chỉ thêm" (add-only):** nếu người dùng chỉ cho phép thêm
  ảnh mà không cho xem thư viện, app vẫn lưu được ảnh đã chọn trước đó
  nhưng không mở được bộ chọn — hành vi này do iOS quyết, app không vượt
  được; câu hướng dẫn trên vẫn đúng.

### 3.2 Máy ảnh (chụp ảnh mới)

- `NSCameraUsageDescription` đã có trong `Info.plist` (câu trên). Code
  native v1 **không gọi** `Camera.getPhoto` với `source: 'CAMERA'` — chỉ
  có `source: 'PHOTOS'`. Key này vẫn cần giữ vì bộ chọn ảnh của hệ thống
  qua `<input type="file">` trên iOS có thể cho chọn "Chụp ảnh" — xem §9 D4,
  phải kiểm chứng trên iPhone thật trước khi gửi duyệt: nếu bộ chọn không
  bao giờ cho chụp ảnh mới thì cân nhắc bỏ key này để khỏi bị App Store
  Review hỏi.

## 4. Thông báo local (`@capacitor/local-notifications` 8.3.1)

**Không cần khai báo gì thêm trong `Info.plist`** (không dùng push —
không cần `aps-environment`, không cần chứng chỉ push). Mọi nhắc đều là
local notification do chính máy đặt lịch và phát; tắt app vẫn nhắc được;
gỡ app thì mất hết lịch nhắc. Xem chi tiết 4 loại nhắc (chụp 12h, hạn giao
1 ngày, job kẹt, sao lưu 7 ngày) trong `NOTIFICATIONS.md` §2.

**Văn bản trong app trước khi xin** (thiết kế trong `NOTIFICATIONS.md` §3,
chưa có trong code — xem §9 D2):

- Sheet giải thích 1 câu: `Cho FotoBro nhắc trước buổi chụp và hạn giao
  ảnh nhé?`
  — EN: `Let FotoBro remind you before shoots and photo delivery deadlines?`
- Nút: `Cho phép nhắc` / `Để sau`
  — EN: `Allow reminders` / `Later`

**Thời điểm xin:** lần đầu tạo job **có ngày chụp** (ngay trước khi đặt
nhắc chụp đầu tiên). Không xin lúc mở app, không xin khi tạo job không có
ngày chụp. Bấm "Để sau" → không gọi API hệ thống, không đặt nhắc, không
hỏi lại cho tới lần tạo job tiếp theo.

**Nếu bị từ chối:**

- iOS chỉ cho hiện hộp thoại hệ thống **1 lần duy nhất** — từ chối rồi thì
  app không tự xin lại được.
- Trong app chỉ hiện banner nhẹ ở màn hình Hôm nay (thiết kế, chưa có
  trong code): `Đang tắt nhắc lịch — bật trong Cài đặt iPhone → FotoBro →
  Thông báo`
  — EN: `Shoot reminders are off — turn them on in iPhone Settings →
  FotoBro → Notifications`
- Kèm nút mở Cài đặt hệ thống (dùng URL scheme `app-settings:` — **chưa
  chắc chắn chạy qua Capacitor**, phải kiểm chứng lúc code; không được ghi
  là đã có).
- Không có nhắc nào được đặt; mọi tính năng khác chạy bình thường. Người
  dùng vẫn xem được lịch chụp / hạn giao trên màn Hôm nay.
- Các giới hạn iOS khác (không phải do từ chối quyền, app không vượt
  được — xem `NOTIFICATIONS.md` §5): chế độ Tập trung / Không làm phiền
  giữ nhắc lại trong Trung tâm thông báo; máy tắt nguồn đúng giờ nhắc thì
  nhắc đó mất luôn; tối đa 64 nhắc đang chờ (v1 chỉ đặt nhắc cho job trong
  30 ngày tới).

## 5. Face ID / vân tay — khoá app (passkey WebAuthn + PIN)

**Không phải quyền iOS, không có hộp thoại xin quyền hệ thống, không cần
`NSFaceIDUsageDescription`.** Khoá dùng WebAuthn passkey
(`navigator.credentials.create` / `.get`, platform authenticator,
`userVerification: 'required'`) + mã PIN dự phòng (4–6 số, lưu dạng
SHA-256 với salt trong `localStorage` key `troLyXeo.lock`). Không có key
`NSFaceIDUsageDescription` trong `Info.plist` — **đúng, không thêm.**

**Văn bản trong app** (đã có trong code, giữ nguyên):

- Cài đặt → nút bật: `Khoá app bằng Face ID` / `Hoặc vân tay / mật mã
  máy, kèm mã PIN dự phòng`
  — EN: `Lock the app with Face ID` / `Or Touch ID / device passcode,
  with a backup PIN`
- Sheet bật khoá — tiêu đề: `Khoá app khi mở` / `Mở app là phải nhìn Face
  ID (hoặc vân tay / mật mã máy)`
  — EN: `Lock when opening` / `Opening the app requires Face ID (or
  Touch ID / device passcode)`
- Sheet bật khoá — cảnh báo PIN (quan trọng, giữ nguyên): `Dùng khi Face
  ID không nhận. Nhớ kỹ mã này — quên cả Face ID lẫn PIN thì phải xoá dữ
  liệu trang web mới vào lại được (nên tải bản sao lưu trước).`
  — EN: `Use this when Face ID doesn't recognise you. Remember it — if
  you forget both Face ID and the PIN, you'll have to erase the app's
  website data to get back in (download a backup first).`
- Khi đã bật: `Đang khoá bằng Face ID` / `Mở app, hoặc rời app quá 2
  phút, là phải mở khoá`
  — EN: `Locked with Face ID` / `Unlock when opening the app, or after
  being away for more than 2 minutes`
- Màn khoá: `App đang khoá` — EN: `App is locked`
  - Nút: `Mở bằng Face ID / vân tay` — EN: `Unlock with Face ID / Touch ID`
  - Nút: `Dùng mã PIN` — EN: `Use PIN`
- Lỗi: `Chưa mở được bằng Face ID — thử lại hoặc dùng mã PIN.`
  — EN: `Couldn't unlock with Face ID — try again or use your PIN.`
  - PIN sai: `Mã PIN chưa đúng.` — EN: `Wrong PIN.`
  - Sai 5 lần trở lên: `Sai N lần — tạm khoá một lúc.` + `Sai nhiều lần —
    đợi X giây rồi thử lại.` (khoá tăng dần 30 giây × 2ⁿ)
    — EN: `Wrong N times — locked for a while.` / `Too many wrong
    attempts — wait X seconds and try again.`
  - Bật khoá thất bại: `Chưa bật được (đã huỷ hoặc máy chưa cài Face ID /
    mật mã)` — EN: `Couldn't turn it on (cancelled, or Face ID /
    passcode isn't set up on this phone)`
  - Máy không hỗ trợ: `Máy hoặc trình duyệt này chưa hỗ trợ Face ID cho
    web` — EN: `This phone or browser doesn't support Face ID for web`
  - Tắt khoá: `Đã tắt khoá Face ID` — EN: `Face ID lock turned off`
    (tắt khoá yêu cầu xác nhận lại bằng Face ID hoặc PIN trước).

**Thời điểm "xin":** chỉ khi người dùng tự bật trong Cài đặt → Khoá.
Không bật mặc định, không hỏi lúc mở app. Khoá lại khi mở app hoặc khi
rời app quá 2 phút (`visibilitychange` + `hiddenAt`).

**Nếu người dùng huỷ / thất bại:**

- Huỷ sheet tạo passkey (`NotAllowedError`): khoá không bật, app chạy
  bình thường, không hỏi lại.
- Face ID không nhận ở màn khoá: dùng PIN (form PIN hiện khi bấm "Dùng
  mã PIN"). Quên cả Face ID lẫn PIN: **không có đường khôi phục trong
  app** — phải xoá dữ liệu trang web của app rồi vào lại, dữ liệu chỉ còn
  nếu đã sao lưu JSON trước đó. Câu này đã ghi trong sheet bật khoá, không
  được giấu đi.
- **Rủi ro đã biết, chưa kiểm chứng** (`RISKS.md` §3): passkey tạo trên
  bản web (RP ID `hoangviet1397.github.io`) **không mở được app native**
  (RP ID `localhost` trong Capacitor) — người dùng phải tạo lại khoá trong
  app native. Tạo passkey với RP ID `localhost` trong WKWebView chưa được
  kiểm chứng; trường hợp xấu nhất là tạo khoá thất bại. Cứu cánh là PIN
  vẫn dùng được. Khi test TestFlight: thử bật khoá → tắt app → mở lại
  bằng Face ID; nếu Face ID lỗi thì thử PIN; nếu cả hai lỗi thì **tắt
  khoá trong v1** (đổi mặc định khoá thành tắt trong bản iOS) và sửa ở
  v1.1. Chưa cấu hình Associated Domains (`webcredentials`) vì chưa có
  domain riêng.

## 6. Google sign-in — Lịch, Gmail, Danh bạ, Drive (OAuth, không phải quyền iOS)

**Không có hộp thoại quyền iOS.** Người dùng cho phép trên **màn hình xin
phép của Google** (mở bằng trình duyệt hệ thống qua `@capacitor/browser`,
trả code về app bằng deep link `com.googleusercontent.apps.<id>:/oauth2redirect`
— Google cấm OAuth trong WKWebView, xem `GOOGLE-SETUP.md` §4). Trong app
chỉ có câu giải thích trước khi chuyển sang Google.

**Văn bản trong app trước khi chuyển sang Google** (đã có trong code,
giữ nguyên):

- Cài đặt → `Đăng nhập Google để làm gì?` / `Bấm 1 lần là có Lịch, Gmail,
  Danh bạ, Drive — không cần tự tạo gì`
  — EN: `What is Google sign-in for?` / `One tap gives you Calendar,
  Gmail, Contacts and Drive — no setup needed`
- Nút: `Kết nối Google` — EN: `Connect Google`
- Khi bật thêm từng tính năng trong Cài đặt → "Lấy gì từ Google" (mặc định
  chỉ Lịch bật, còn lại tắt — `gFeat: { cal:true, bank:false,
  leads:false, contacts:false, drive:false, calw:false, send:false }`),
  app hiện hộp thoại xác nhận: `Cho phép thêm quyền? Chuyển sang Google
  để cho phép app {đọc lịch / đọc Gmail / đọc danh bạ / xem tên thư mục
  Drive / ghi buổi chụp vào Google Lịch / gửi những email bạn đã duyệt}.
  Xong sẽ tự quay lại app.` — nút `Tiếp tục`
  — EN: `Allow more access? You'll go to Google to let the app
  {read your calendar / read Gmail / read contacts / see Drive folder
  names / add shoots to Google Calendar / send emails you've approved}.
  You'll come back to the app when done.` — button `Continue`

**6 scope xin 1 lần** (`gScopes()` — `GOOGLE-SETUP.md` §3):

| Scope | Dùng cho | Mức Google | Câu giải thích cho Google (form xác minh) |
|---|---|---|---|
| `calendar.readonly` | Xem Lịch Google trong tab Buổi chụp → Lịch | Non-sensitive | Xem lịch hẹn để nhập thành buổi chụp |
| `gmail.readonly` | Đọc Gmail: tiền về, khách hỏi chụp | **Restricted** | Tìm email khách hỏi chụp và báo tiền về |
| `contacts.readonly` | Đọc Danh bạ | Sensitive | Lấy số / email khách đã lưu để nhắn tin |
| `drive.metadata.readonly` | Xem tên thư mục Drive của job (chỉ metadata, không đọc file ảnh) | Non-sensitive | Tìm thư mục ảnh của job theo tên |
| `calendar.events` | Ghi / sửa / xoá buổi chụp trên Google Lịch | Sensitive | Ghi buổi chụp vào lịch, nhắc trước 12 tiếng |
| `gmail.send` | Gửi email cho khách bằng Gmail (chỉ email người dùng đã duyệt) | Sensitive | Gửi email đã soạn sẵn cho khách |

**Thời điểm xin:** khi bấm "Kết nối Google" (Cài đặt, màn Lịch Google,
hoặc sheet nhập lịch trên bản web). Xin đủ 6 scope 1 lần (AUTO), không
xin thêm từng lần. Token chỉ nằm trên máy, tự hết hạn sau ~1 giờ; refresh
token chỉ trả 1 lần ở lần cho phép đầu tiên.

**Nếu bị từ chối / ngắt kết nối:**

- Từ chối trên màn hình Google: quay lại app, không có dữ liệu Google nào
  được tải; app chạy đủ bằng dữ liệu local + Lịch iPhone (§2).
- Ngắt trong app (Cài đặt → "Ngắt kết nối Google Lịch"): xoá lịch, email
  gợi ý và danh bạ đã lưu trên máy; thu hồi mã đăng nhập tại Google.
  Buổi chụp và sổ thu chi vẫn giữ nguyên. Sự kiện đã ghi trên Google Lịch
  vẫn còn — xoá trong app Lịch nếu muốn.
  — EN: `Disconnect Google Calendar? This erases the calendar, suggested
  emails and contacts saved on this phone, and revokes the sign-in at
  Google. Your shoots and money ledger stay. Events already on Google
  Calendar stay — delete them in the Calendar app if you want.`
- Thu hồi mã thất bại: toast `Đã ngắt trên máy, nhưng Google chưa xác nhận
  thu hồi mã — kiểm tra lại tại myaccount.google.com → Bảo mật → Quyền
  truy cập của bên thứ ba → FotoBro`
  — EN: `Disconnected on this phone, but Google hasn't confirmed the
  revocation — check myaccount.google.com → Security → Third-party
  access → FotoBro`
- Người dùng cũng có thể thu hồi bất cứ lúc nào tại
  `myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba →
  FotoBro` — app sẽ tự coi như chưa kết nối ở lần mở sau.

## 7. Micro / giọng nói — DỜI SANG v1.1 (chuẩn bị sẵn, CHƯA dùng ở v1)

**Trạng thái v1 (đọc code thật):** plugin
`@capacitor-community/speech-recognition@7.0.1` đã **gỡ khỏi
`package.json`** (không có `Package.swift`, build SPM của Capacitor 8
không link được — xem `RISKS.md` mục 4, `VOICE-COMMANDS.md`). Code giọng
nói native đã xoá khỏi `www/capacitor-bridge.js`. Trong app native, bấm
micro hiện toast: `Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha`
— EN: `Voice is coming in v1.1 — type your question for now`.
Toàn bộ 10 lệnh vẫn dùng được bằng cách **gõ tay** trong tab Trợ lý
(cùng parser `runCommand` / `answer`), không mất lệnh nào. Bản web: mic
vẫn chạy qua Web Speech API (`vi-VN`).

**`Info.plist` v1: KHÔNG có `NSMicrophoneUsageDescription` và KHÔNG có
`NSSpeechRecognitionUsageDescription` — đúng, không thêm.** Thêm hai key
này vào v1 khi mic chưa có code sẽ bị App Store Review hỏi (khai quyền
không dùng). Xem §9 D1 về ghi chú cũ ghi sai việc này.

**Câu chữ chuẩn bị sẵn cho v1.1** (chỉ thêm vào `Info.plist` cùng lúc với
code mic thật — plugin SPM mới hoặc plugin tự viết bọc
`SFSpeechRecognizer`):

```xml
<key>NSMicrophoneUsageDescription</key>
<string>FotoBro cần micro để bạn nói lệnh thay vì gõ — ví dụ "Chi makeup 2 triệu" hay "Ai chưa trả tiền?". Chỉ nghe khi bạn bấm nút micro.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>FotoBro dùng nhận dạng giọng nói để hiểu câu bạn nói thành lệnh ghi sổ, tìm job. Giọng nói được Apple xử lý trên máy chủ của Apple.</string>
```

- EN:
  - Microphone: `FotoBro needs the microphone so you can speak commands
    instead of typing — for example "Chi makeup 2 triệu" or "Ai chưa trả
    tiền?". It only listens when you tap the microphone button.`
  - Speech recognition: `FotoBro uses speech recognition to turn what
    you say into commands for logging money and finding jobs. Apple
    processes your speech on Apple's servers.`

**Văn bản trong app trước khi xin (v1.1, bản nháp):**

- Lần đầu bấm micro: `Nói với trợ lý — bấm micro rồi nói, ví dụ "Chi
  makeup 2 triệu". Chỉ nghe khi bạn đang bấm.`
  — EN: `Talk to your assistant — tap the mic and speak, for example
  "Chi makeup 2 triệu". It only listens while you tap.`
- Nút: `Cho phép dùng micro` / `Để sau`
  — EN: `Allow microphone` / `Later`

**Thời điểm xin (v1.1):** lần đầu bấm nút micro (màn Hôm nay hoặc tab
Trợ lý). Không xin lúc mở app.

**Nếu bị từ chối (v1.1):** toast (theo `VOICE-COMMANDS.md`):
`Chưa được cấp quyền micro — gõ câu hỏi cũng được`
— EN: `Microphone access not granted — typing works just as well`.
Mọi lệnh vẫn chạy bằng gõ tay; không hỏi lại bằng hộp thoại hệ thống.
Bật lại: `Cài đặt iPhone → FotoBro → Micro`.

**Bắt buộc trước khi bật mic ở v1.1:** `SFSpeechRecognizer` của Apple
xử lý giọng nói qua **máy chủ Apple, không phải hoàn toàn trên máy** —
phải ghi rõ câu này trong Privacy Policy trước khi bật (xem
`VOICE-COMMANDS.md`), và câu `NSSpeechRecognitionUsageDescription` trên
đã ghi đúng điều đó. Không được viết "xử lý trên máy" cho giọng nói.

## 8. Đường bật lại quyền trong Cài đặt iOS (dùng chung cho mọi mục)

| Quyền | Đường dẫn trong Cài đặt iOS |
|---|---|
| Lịch | `Cài đặt → FotoBro → Lịch` |
| Ảnh | `Cài đặt → FotoBro → Ảnh` |
| Micro (v1.1) | `Cài đặt → FotoBro → Micro` |
| Thông báo | `Cài đặt → FotoBro → Thông báo` |
| Face ID | Không có mục riêng — Face ID là khoá của app, bật/tắt trong Cài đặt của app; Face ID của máy bật/tắt ở `Cài đặt → Face ID & Mật mã` |
| Google | Không có trong Cài đặt iOS — thu hồi ở `myaccount.google.com → Bảo mật → Quyền truy cập của bên thứ ba → FotoBro`, hoặc ngắt trong Cài đặt của app |

Mở thẳng Cài đặt hệ thống từ trong app (URL scheme `app-settings:`):
**chưa kiểm chứng qua Capacitor** — xem `NOTIFICATIONS.md` §3. Tới khi
kiểm chứng được, câu hướng dẫn trong app chỉ ghi đường dẫn bằng chữ
(không gắn nút mở Cài đặt mà chưa chắc chạy).

## 9. Lệch giữa thiết kế và code hiện tại — phải xử lý trước TestFlight / gửi duyệt

| # | Vấn đề | Nguồn | Việc cần làm |
|---|---|---|---|
| D1 | `IOS-SETUP-NOTE.md` ghi "đã thêm 5 usage description bằng tay: giọng nói, micro, thư viện ảnh (xem + thêm), máy ảnh" — nhưng `Info.plist` thật **không có** `NSMicrophoneUsageDescription` / `NSSpeechRecognitionUsageDescription`. Ghi chú sai, plist đúng (mic dời v1.1). | `IOS-SETUP-NOTE.md` vs `Info.plist` | Sửa ghi chú cho khớp plist thật; không thêm key mic vào v1. |
| D2 | Thiết kế Thông báo (`NOTIFICATIONS.md` §3) yêu cầu sheet giải thích trong app **trước** hộp thoại hệ thống; code bridge hiện tại gọi `LN.requestPermissions()` thẳng trong `scheduleReminder()` khi lưu job — sheet chưa có, hộp thoại hệ thống có thể hiện ngay khi lưu job lần đầu. | `NOTIFICATIONS.md` §3 vs `capacitor-bridge.js` §2 | Thêm sheet + nút "Cho phép nhắc / Để sau" trước khi gọi `requestPermissions()`; chỉ gọi khi user bấm "Cho phép nhắc". |
| D3 | Hàm chọn ảnh native `__trolyxeoPickHero()` (Camera plugin, `source: 'PHOTOS'`) **chưa được móc nối** vào luồng chọn ảnh trong `index.html` (chính bridge ghi "Cần móc nối…"). Luồng hiện tại dùng `<input type="file">` trong WKWebView. | `capacitor-bridge.js` §5 | Móc nối hàm bridge vào chỗ xử lý `myShotFile` / `logoFile`, rồi kiểm chứng trên iPhone thật: hộp thoại quyền Ảnh hiện đúng lúc, ảnh lưu được vào IndexedDB. |
| D4 | `NSCameraUsageDescription` đã có trong plist nhưng **không có code native nào** dùng `source: 'CAMERA'` ở v1 (chỉ `PHOTOS`). | `Info.plist` vs `capacitor-bridge.js` §5 | Kiểm chứng trên iPhone thật: bộ chọn ảnh qua `<input type="file">` có cho "Chụp ảnh" không. Nếu không, cân nhắc bỏ key này trước khi gửi duyệt để khỏi bị Review hỏi quyền không dùng. |
| D5 | Nhập Lịch chỉ xin quyền **đọc** (`requestPermissions({ permissions:['readCalendar'] })`); ghi lịch đi qua `createEventInteractively` (trình sửa hệ thống tự xử lý quyền ghi). `NSCalendarsWriteOnlyAccessUsageDescription` đã có trong plist nhưng chưa rõ iOS có hiện hộp thoại ghi riêng không. | `www/index.html` `importFromNativeCalendar` / `act === 'ics'` | Kiểm chứng trên iPhone thật: bấm "Thêm vào Lịch iPhone" khi chưa cấp quyền ghi thì hộp thoại nào hiện; nếu iOS không hiện gì mà sự kiện vẫn lưu được thì ghi chú lại, không sửa code. |
| D6 | Passkey khoá app: RP ID `localhost` trong Capacitor chưa kiểm chứng; passkey bản web không dùng được trong app native; **quên cả Face ID lẫn PIN thì không có đường khôi phục trong app** (đã ghi rõ trong sheet, nhưng cần quyết: giữ vậy hay thêm đường khôi phục có xác minh). | `RISKS.md` §3, `www/index.html` `openLockSetup` | TestFlight: bật khoá → mở lại bằng Face ID → thử PIN. Nếu Face ID lỗi thì thử PIN; nếu cả hai lỗi thì tắt khoá trong v1. |
| D7 | Google sign-in: URL scheme trong `Info.plist` vẫn là placeholder `com.googleusercontent.apps.CHUA-CO-CLIENT-ID`; chưa có Client ID iOS thật; consent screen đang ở trạng thái Testing (tối đa 100 tài khoản test); xác minh Google cho scope restricted (`gmail.readonly`) mất 4–10 tuần. | `Info.plist`, `GOOGLE-SETUP.md` §2–§5 | Thay scheme bằng reversed client ID thật ngay khi có Client ID (xem `GOOGLE-SETUP.md` §2c); không test luồng consent Google trên TestFlight khi chưa có Client ID thật. |

## 10. Ghi chú cho App Store Review

- **Purpose string phải khớp hành vi thật.** Mọi câu trong `Info.plist`
  đều đã đối chiếu với code: Lịch đọc 30 ngày (§2.1), Lịch ghi khi bấm
  nút (§2.2), Ảnh làm ảnh trang chủ (§3.1). Không khai quyền nào không
  dùng ở v1 — đặc biệt không thêm key micro khi mic dời v1.1 (§7).
- **Privacy Nutrition Labels:** Lịch (đọc sự kiện — chỉ dùng để tạo job,
  không gửi đi), Ảnh (chỉ lưu trên máy), Thông báo (local, không server),
  Face ID (passkey + PIN trên máy), Google (dữ liệu Google chỉ đọc/gửi
  ngay trên máy người dùng, không qua máy chủ trung gian — xem
  `GOOGLE-SETUP.md`). Đối chiếu lại với `PRIVACY.md` / `PRIVACY.html`
  trước khi gửi — lưu ý `PRIVACY.md` hiện vẫn trỏ URL cũ
  `tro-ly-xeo` và ghi repo cũ (xem `GOOGLE-SETUP.md` §2a), phải sửa
  thành repo `fotobro` và host lên GitHub Pages trước khi gửi xác minh
  Google.
- **Không xin quyền dồn lúc mở app** (§0) — Review Guideline 5.1.1
  (quyền riêng tư) soi đúng điểm này; luồng just-in-time trong file này
  là bằng chứng thiết kế.

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Viết câu chữ xin quyền cho từng quyền của FotoBro iOS v1
   (Lịch iPhone đọc/ghi, Ảnh, Thông báo local, Face ID, Google sign-in;
   mic dời v1.1 chỉ chuẩn bị sẵn) — văn bản trong app, purpose string
   `Info.plist`, thời điểm xin just-in-time, hành vi khi bị từ chối —
   tiếng Việt + tiếng Anh.
2. **Đã thực hiện:** Đọc kỹ file thật (`ios/App/App/Info.plist`,
   `www/index.html` 3.901 dòng, `www/capacitor-bridge.js`,
   `NOTIFICATIONS.md`, `ONBOARDING.md`, `VOICE-COMMANDS.md`,
   `GOOGLE-SETUP.md`, `RISKS.md`, `package.json`,
   `capacitor.config.ts`). Viết 1 file mới duy nhất:
   `~/workspace/fotobro-ios-v1/batch-legal/CONSENT-FLOWS.md`. Không sửa
   bất kỳ file nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** File đã viết, đọc được. Mọi câu chữ `Info.plist`
   trích nguyên văn (6 key: Camera, PhotoLibraryAdd, PhotoLibrary,
   CalendarsFullAccess, CalendarsWriteOnlyAccess, Calendars); mọi câu
   trong app trích nguyên văn từ code (toast từ chối Lịch, sheet nhập
   Lịch, sheet khoá Face ID + cảnh báo quên PIN, toast mic v1.1, hộp
   thoại "Cho phép thêm quyền?" của Google); 6 scope Google lấy đúng
   `gScopes()` + `GOOGLE-SETUP.md` §3. Xác nhận: plist **không có**
   key micro / giọng nói / Face ID — đúng với trạng thái v1 (mic dời
   v1.1, khoá dùng WebAuthn không cần `NSFaceIDUsageDescription`);
   Thông báo local không cần key plist.
4. **Vấn đề còn tồn tại:** 7 lệch đã ghi ở §9 (D1 ghi chú
   `IOS-SETUP-NOTE.md` ghi sai về key mic; D2 sheet giải thích Thông báo
   chưa có trong code; D3 hàm chọn ảnh native chưa móc nối; D4 key Camera
   chưa rõ có dùng thật không; D5 hộp thoại quyền ghi Lịch chưa rõ hành
   vi; D6 passkey RP `localhost` chưa kiểm chứng + không có đường khôi
   phục khi quên cả Face ID lẫn PIN; D7 Google Client ID vẫn là
   placeholder). Chưa kiểm chứng được gì trên iPhone thật (cần
   TestFlight / Mac).
5. **Điều kiện chuyển bước:** Agent làm app nối §9 D2 + D3 vào code
   (sheet Thông báo, móc nối `__trolyxeoPickHero`), sửa ghi chú D1, rồi
   kiểm chứng trên iPhone thật qua TestFlight: từng quyền xin đúng lúc,
   từ chối thì app vẫn chạy + có hướng dẫn bật lại, Face ID/PIN mở được
   khoá. Việt không cần quyết thêm câu chữ — bản Việt đã chốt trong file
   này; bản Anh chỉ là dịch đi kèm.
6. **Bước tiếp theo:** Sau khi code D2/D3 xong, QA chạy lại theo §1–§8:
   bấm từng tính năng lần đầu, ghi lại hộp thoại hệ thống hiện ra có
   đúng câu plist không; thử từ chối từng quyền rồi bật lại trong Cài
   đặt iOS; thử quên PIN (chỉ còn đường xoá dữ liệu — cần Việt biết
   trước). Khi mic làm ở v1.1: thêm 2 key plist ở §7 cùng lúc với code
   mic + cập nhật Privacy Policy câu "Apple xử lý giọng nói trên máy
   chủ của Apple".
7. **Trạng thái:** File thiết kế xong, chưa phải code chạy được. Không
   tạo tài khoản, không mua gì, không sửa file nào khác ngoài file mới
   này.
