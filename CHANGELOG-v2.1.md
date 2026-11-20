# FotoBro — Changelog v2.1

- **Phiên bản:** 2.1 (`APP_VERSION` `'2.1'`, `MARKETING_VERSION` `2.1` — đã chốt khi Việt duyệt chạy build thử 12:28 20/11/2026)
- **Bundle ID:** `com.fotobro.app`
- **Nền tảng:** iOS (Capacitor 8)
- **Ngày phát hành:** _chưa chốt_ (điền khi bản TestFlight v2.1 được duyệt)
- **Repo:** `Hoangviet1397/fotobro`, nhánh `apple-signin` (chưa gộp main, chưa build)
- **Tài liệu thiết kế:** `APPLE-SIGNIN-PLAN.md`

> Ghi chú: bản v2.1 đang làm trong `~/workspace/fotobro-ios-v1/`, nhánh
> `apple-signin`. Chưa build `.ipa`, chưa lên TestFlight, chưa kiểm chứng
> trên iPhone thật. Số phiên bản v2.1 đã chốt — `APP_VERSION` trong
> `www/index.html` là `'2.1'` và `MARKETING_VERSION` trong pbxproj là
> `2.1` (Việt duyệt chạy build thử 12:28 20/11/2026).

## Tính năng mới trong v2.1

### Đăng nhập bằng Apple (tài khoản Google / Apple, không tài khoản riêng)
- Nút **"Đăng nhập bằng Apple"** trong Cài đặt → mục **Tài khoản** mới (đặt trên
  mục Kết nối Google). Chỉ hiện trên app iPhone native; bản web ẩn hẳn.
- Bấm nút mở sheet đăng nhập native của iOS (ASAuthorizationAppleIDProvider).
  Đăng nhập xong Cài đặt hiện tên + email, kèm nút Đăng xuất Apple ID.
- Đăng nhập **không bắt buộc** — app chạy đầy đủ khi chưa đăng nhập.
- Dữ liệu chỉ lưu trên máy (`cfg.apple` trong key `troLyXeo.v1`): mã định danh
  Apple, tên, email (có thể là email ẩn `@privaterelay.appleid.com`), thời điểm
  đăng nhập. **Không lưu** `idToken` / `authorizationCode` (không có server để
  xác thực). Tên/email chỉ Apple trả lần đầu nên được lưu ngay và giữ lại ở
  các lần đăng nhập sau.
- Đăng xuất chỉ xoá tên/email Apple khỏi máy; job, tiền và cài đặt giữ nguyên.
  "Xoá tài khoản" = Đăng xuất + Xoá hết dữ liệu (đã có trong Cài đặt).
- Đóng rủi ro **Guideline 4.8**: app đã có cả đăng nhập Google và Apple.
  App Privacy "Data Not Collected" vẫn đúng (định danh chỉ ở trên máy).

### Sửa kèm khi chạm Cài đặt
- Hàng **Liên hệ** trong Cài đặt dùng email hỗ trợ thật `supportfotobro@gmail.com`
  (lấy từ `FOTOBRO_CONFIG.supportEmail`) thay cho `support@fotobro.app` (hộp thư
  không tồn tại). `PRIVACY.html` / `SUPPORT.html` / `PRIVACY.md` sửa tương tự.

## Kỹ thuật

- Plugin: `@capawesome/capacitor-apple-sign-in@0.1.5` (pin đúng bản).
  **Mini-G0 ĐẠT 20/11/2026:** `Package.swift` của plugin đòi
  `capacitor-swift-pm from: "8.0.0"` → giao với `exact 8.6.2` của app cho ra
  8.6.2; `npx cap sync ios` chạy sạch, không cảnh báo phiên bản.
- Plugin cũ `@capacitor-community/apple-sign-in@7.1.0` **đã loại**: đòi
  `capacitor-swift-pm` 7.x, cổng G0 rớt 12:16 20/11/2026 (xung đột tất định).
- Bridge mới trong `www/capacitor-bridge.js` (mục 7): `__fotobroAppleSignIn()`,
  `__fotobroAppleAvailable()`. Bridge bắt mã lỗi `SIGN_IN_CANCELED` (người dùng
  bấm Huỷ) và trả `null` im lặng; chỉ throw lỗi thật. Không gọi `initialize()`
  trên iOS, không truyền `clientId`/`redirectUrl` (iOS không dùng).
- Xcode: thêm capability Sign in with Apple → file mới
  `ios/App/App/FotoBro.entitlements` (`com.apple.developer.applesignin = Default`),
  `CODE_SIGN_ENTITLEMENTS` trong cả Debug và Release.
- Test jsdom: 635/635 (gốc 235 mục [1]–[22] + 10 mục sửa song song 400 test, mục [23]–[32]).

## Bổ sung từ đợt gộp 10 bản sửa song song (20/11/2026, chưa gộp main, chưa build)

10 người sửa song song trên cùng baseline, gộp bằng git 3-way (không xung đột —
mỗi diff chạm dòng khác nhau, đã kiểm chứng gộp xuôi/ngược cho cùng 1 file).
Các mục dưới đây là phần CHÊNH so với mục "Sửa 32 mục" ở trên; test gộp 635/635.

- **#15 "Sắp tới · 30 ngày" mở rộng:** liệt kê theo ngày chụp, không lọc theo bước
  pipeline nữa — kể cả job đã Xong hay Đã chụp vẫn thấy; chỉ trừ job đã huỷ.
  (Trước đây ghi "chưa Xong".)
- **#17 Sheet chi tiết job:** chạm thanh kéo (grab) cũng đóng sheet (thêm 1 lối
  thoát rõ ràng ngoài nút Đóng và chạm nền tối).
- **#1 Trợ lý/báo cáo nói rõ job chưa ghi giá:** khi không còn khoản thiếu nào
  trong các job đã ghi giá nhưng còn job chưa ghi giá, Trợ lý và báo cáo phòng ban
  nói "có N buổi chụp chưa ghi giá nên app chưa tính được số thiếu" thay vì
  "Không ai nợ đồng nào".
- **#3 Tạo job với pre.type (vd từ Gmail):** không ghi giá thì lấy giá theo đúng
  loại + hình thức (`priceFor`), không nhầm giá Portrait mặc định.
- **#6 Form hoàn cọc điền sẵn đúng:** sửa lỗi truyền `pre` lồng nhau khiến hạng
  mục "Hoàn cọc" không điền sẵn — giờ form mở sẵn đúng hạng mục/số tiền/ghi chú/job.
- **#11 Cảnh báo nhắc lịch trong chi tiết job:** job gấp (mốc 12 tiếng đã qua)
  hiện cảnh báo rõ app sẽ nhắc 60 phút trước giờ chụp (ghi rõ giờ) hoặc nhắc ngay;
  job thường không hiện gì. Hàm `shootReminderInfo()` dùng chung logic với cầu nối.
- **#19 Chân trang khi chưa bật tính năng nào:** nói rõ "Chưa bật tính năng nào —
  bật 1 tính năng ở trên rồi bấm Kết nối" (trước đây viết sai "chỉ xin quyền đọc Lịch").
- **#23 PIN: chỉ reset khi đã từng bị khoá** (`lockUntil > 0` mà hết hạn). Số lần
  sai 1–4 (chưa tới mức khoá) được giữ nguyên qua lần tải lại trang — bản trước
  reset cả khi chưa khoá nên tải lại là đếm lại từ đầu.
- **#24 Form thu chi:** ô "Buổi chụp" thành frow stack (nhãn trên, select full-width);
  ghi chú sổ thu chi nằm dòng riêng `.tx-note`, hiện đầy đủ, không kẹp chung với
  tên khách/phương thức nữa.
- **#26 Màn chào trang 3 gọn lại:** `.wl-mini` 96px → 76px, padding trang
  40px/28px → 20px/16px, `.wl-list` gọn lại (dòng 44px); câu "Nhập từ Lịch iPhone"
  rút ngắn để đủ 6 dòng ở 375×812 không cần cuộn.
- **#28 "Chào mừng bạn!"** tắt sau 1100ms (trước 1600ms).
- **#30 Tab bar nền đặc:** dùng `var(--bar-strong)`; chế độ kính mờ dùng .92
  (sáng `rgba(255,255,255,.92)`, tối `rgba(0,0,0,.92)`) để chữ nội dung không lộ qua.
- **Kỹ thuật:** xoá định nghĩa `doCancel` trùng (bản cũ chết, giữ bản đúng —
  nhớ `cancelledFrom`, huỷ nhắc lịch, `renderAll()`).

## Sửa 32 mục từ báo cáo 10 tester (20/11/2026, chưa gộp main, chưa build)

Báo cáo tổng hợp: `~/workspace/fotobro-test-personas/TONG-HOP-10-TESTER.md`.
Phiên bản giữ 2.1. Khóa `troLyXeo.v1` giữ nguyên.

### Chặn dùng
- **#1 Nợ biến mất khi job Xong:** job Xong còn thiếu tiền vẫn tính vào "Khách còn
  thiếu", danh sách nợ, "Lời theo từng job", Trợ lý "ai chưa trả tiền?", tile Hôm
  nay. Chỉ loại job đã huỷ. "Khách trả đủ hết rồi" chỉ hiện khi thật sự không còn
  khoản thiếu nào; job chưa ghi giá hiện "Chưa ghi giá" (không tính là trả đủ).
  Chi tiết job chưa ghi giá hiện "Chưa ghi giá" thay vì "Đã thu đủ".
- **#2 Trợ lý "tháng"/"thanh toán":** nhánh nợ/lời/thu/chi đứng trước nhánh hạn giao;
  "han" chỉ khớp khi là từ riêng (`' han'`/`'han '`) nên "tháng"/"thanh toán" không
  lọt vào nhánh hạn nữa. "Tháng này lời bao nhiêu?", "tháng này thu/chi bao nhiêu",
  "khách nào chưa thanh toán" đều đáp đúng.

### Tiền bạc
- **#3 Giá mặc định:** Digital Portrait 2.500.000, Couple 4.000.000, Wedding
  15.000.000, Lookbook 8.000.000, Event 5.000.000 (giá web v2.5); Film mặc định 0
  = chưa đặt. `mergeCfg()` giữ giá người dùng đã lưu.
- **#4 Số chính xác:** "Lời theo từng job", dòng nợ, dòng sổ thu chi hiện số đầy đủ
  (10.834.567₫); tile lớn giữ số làm tròn kèm số chính xác bên dưới. "0đồng" → "0 đồng".
- **#5 Cọc thống nhất `depFor()` (10.000đ):** mẫu chat, email, máy tính giá đều dùng
  `depFor()` — không còn làm tròn 1.000đ ở mẫu chat.
- **#6 Hạng mục chi mới:** "Thuê đèn" (Chi cho buổi chụp), "Hoàn cọc" (Chi khác);
  huỷ job đã có cọc > 0 thì hỏi "Huỷ & ghi hoàn cọc" (không tự ghi). Giọng nói nhận
  "thuê đèn"/"hoàn cọc".
- **#7 Job huỷ khỏi mọi phép tính:** "Lời theo từng job" loại job cancelled (trước
  đây vẫn hiện "thiếu").

### Mẫu tin / email
- **#8 Mẫu không khẳng định sai:** "Đã nhận cọc" (chat + email) chỉ gợi ý/hiện khi
  đã ghi cọc > 0 (chat dùng số cọc thật `{tiền cọc}`, chưa cọc thì hỏi xin cọc);
  "Mời chọn ảnh" chỉ nhắc link khi có link Drive thật, không thì câu trung tính.
- **#9 "Nhắc lịch chụp":** bỏ "Nhớ ngủ sớm" khi buổi chụp là hôm nay (cả chat và email).
- **#10 Composer email:** ô "Gửi tới" và "Tiêu đề" thành textarea 2 dòng, không cắt chữ.

### Nhắc lịch
- **#11 Nhắc dự phòng:** mốc 12 tiếng đã qua thì nhắc 60 phút trước giờ chụp; 60
  phút cũng qua thì nhắc ngay sau ~30 giây (chỉ khi giờ chụp còn phía trước). Hạn
  giao ảnh áp dụng tương tự (24 tiếng → 60 phút → nhắc ngay).

### Pipeline / điều hướng
- **#12 Form cọc có "Để sau":** nút "Chưa có cọc — để sau", bấm thì đóng và không bật
  lại cho job đó (cờ `depPrompted` trên job, giữ qua `cleanData`); nút trái đổi thành
  "Đóng" khi là form nhắc cọc — chỉ đóng form, không huỷ việc chuyển bước.
- **#13 Job mới ở bước ≥ Chốt cọc** chưa có cọc thì hỏi nhập cọc sau khi lưu (cùng
  nút "Để sau", cùng cờ `depPrompted`).
- **#14 Khôi phục job huỷ** xong chuyển bộ lọc về "Tất cả" để thấy ngay job vừa khôi phục.
- **#15 Mục "Sắp tới · 30 ngày"** trên Hôm nay: job chụp 8–30 ngày tới (không huỷ,
  chưa Xong); Hôm nay trống thì nhắc có lịch ở mục Sắp tới.
- **#16 Nút "Xong bước này"** → "Xong: Chốt cọc → Sắp chụp" (ghi rõ bước tiếp theo).
- **#17 Sheet chi tiết job:** thêm nút Đóng ở cuối sheet; nút Đóng trên đầu sheet in
  đậm; chạm nền ngoài vẫn đóng (đã có sẵn).

### Google / riêng tư
- **#18 Khôi phục `openGGuide()`:** sheet "Đăng nhập Google để làm gì?" liệt kê từng
  tính năng dùng đúng quyền nào, bật/tắt ngay tại đó, nút Kết nối / Cập nhật quyền.
- **#19 Scope theo công tắc (ưu tiên a):** `gScopes()` chỉ xin scope của tính năng
  đang bật; bật thêm sau thì xin thêm qua `include_granted_scopes`. Không bật tính
  năng nào thì `gConnect` báo và không mở màn hình Google. Chân trang Cài đặt động —
  liệt kê đúng các quyền sẽ xin, khớp 100% với `gScopes()`. Prompt kết nối ở tab Lịch
  sửa cho đúng khi `calw` đang bật.
- **#20 Công tắc "Google Lịch"** mờ + chưa bật cho tới khi Google đã kết nối (cả trong
  Cài đặt và trong sheet giải thích).
- **#21 Hàng "Quyền riêng tư"** trong Cài đặt, mở `PRIVACY.html` (Capacitor Browser
  trên native, tab mới trên web). Cụm "riêng tư" đã có trong app.

### Sao lưu / bảo mật
- **#22 Sao lưu v2 gồm ảnh** (theo `BACKUP-V2.md` §2.1/§5.2/§6, chưa mã hoá):
  envelope `fotobro-backup` v2 (`format`, `version: 2`, `appVersion`, `exportedAt`,
  `counts`, `jobs`, `txs`, `cfg`, `checkDone`, `uid`, `photos` base64 từ IndexedDB);
  file `fotobro-backup-YYYYMMDD.json`; > 25 MB tách ảnh ra `fotobro-photos-YYYYMMDD.json`
  (`photosSplit`/`photosFile`, khôi phục hỏi tiếp file ảnh, thiếu file thì báo rõ số
  ảnh thiếu); đọc được file v1 cũ (báo "không có ảnh", giữ `uid`/`checkDone` hiện tại);
  file mã hoá/file ảnh riêng/file rác đều có báo đúng; khôi phục thay thế toàn bộ và
  tự lưu bản dự phòng vào `troLyXeo.backupSafety` trước khi ghi đè; ghi cả
  `troLyXeo.lastBackup` và `fotobro.lastBackupAt` khi xuất thành công.
  **Chưa làm:** mã hoá file sao lưu (§2.2/§4 — cần Việt chốt mật khẩu, xem BACKUP-V2 §7).
- **#23 Bộ đếm sai PIN xuyên phiên:** `lockTries`/`lockUntil` lưu `troLyXeo.lockTries`;
  hết hạn khoá thì reset; tắt khoá thì xoá. Key mới đã thêm vào `WIPE_KEYS`.

### Hiển thị / chữ
- **#24 Địa điểm wrap 2 dòng:** dòng job, dòng thời gian Lịch (Google), dòng sổ thu
  chi, dòng phòng ban (Thêm + Hôm nay); ô "Buổi chụp" trong form thu chi chỉ hiện
  tên khách (select không wrap được).
- **#25 "Giọng nói sẽ có ở bản v2.1"** → "bản sau" (toast mic, màn chào, bridge).
- **#26 Màn chào trang 3:** bỏ dòng "Nút Ghi ở giữa" trùng trang 2; padding đáy
  12px → 28px để "Sao lưu mỗi tuần" không bị cắt.
- **#27 Tab Thêm:** mô tả phòng ban wrap 2 dòng thay vì cắt "..." sau 1 dòng.
- **#28 "Chào mừng bạn!"** không chặn thao tác (`pointer-events:none`) và tự tắt
  sau 1600ms (trước 2300ms).
- **#29 Ô ngày "mm/dd/yyyy":** thẻ `html` đã `lang="vi"` — do trình duyệt test, cần
  kiểm tra lại trên iPhone thật (không sửa bừa).
- **#30 Tab bar nền mờ:** `--bar` ở chế độ kính mờ .5 → .85 (sáng + tối).
- **#31 Máy tính giá:** dropdown gói hiện giá theo medium đang chọn (Film → giá film
  hoặc "chưa đặt giá"); đổi medium thì dựng lại nhãn, giữ nguyên gói đang chọn.
- **#32 Ô nhập cọc** (tùy chọn) trong form tạo job mới; nhập > 0 thì ghi khoản thu
  "Cọc" vào tab Tiền bạc; placeholder giá "VD: 2.500.000".

## Lỗi đã biết / việc còn lại

- Chưa kiểm chứng trên iPhone thật (sheet Apple, lần đăng nhập 2, Huỷ, Ẩn email,
  thu hồi quyền) — xem `APPLE-SIGNIN-PLAN.md` §9, checklist 10 mục.
- Chưa kiểm chứng profile "FotoBro App Store" có gồm capability Sign in with Apple
  không — nếu build báo thiếu capability thì tạo lại profile (Việt làm qua trình
  duyệt như lần trước).
- Chưa build trên GitHub Actions (chờ duyệt rồi mới build từ nhánh `apple-signin`).
- Sao lưu mã hoá chưa làm (xem #22 trên) — cần Việt chốt mật khẩu sao lưu.
- Cần kiểm tra trên iPhone thật: đăng nhập Google/Apple thật, Face ID, nhắc lịch
  native (đặc biệt job gấp trong ngày), ô ngày kiểu Việt, scope Google chỉ xin đúng
  tính năng đã bật, sao lưu gồm ảnh khôi phục đủ ảnh, xuất file sao lưu qua Files,
  mở PRIVACY.html bằng Capacitor Browser.
