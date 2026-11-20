# FotoBro v2.3 — Sửa viền trắng safe area + gợi ý lỗi Apple 1000

Ngày: 20/11/2026. Từ v2.2 (build 2.2 (13) đã lên TestFlight 17:07 20/11).

## v2.3b — Fix batch theo 10 báo cáo test v2.2 (20/11/2026)

10 persona test v2.2 trên giả lập (bản snapshot khớp main). Giữ phiên bản 2.3.

1. **Nút Apple mất khỏi cổng lúc vào app (Dũng)** — race thứ tự script:
   `maybeShowAuthGate()` gọi trong script inline trước khi `capacitor-bridge.js`
   tải xong nên `__fotobroAppleAvailable()` chưa có, nút Apple không dựng.
   Sửa: dời lời gọi cổng xuống script sau thẻ bridge; cộng thêm tự chữa —
   cổng đã dựng rồi mà bridge tải xong sau thì thêm nút Apple vào ngay.
2. **Tour 4 trang tự mở sau cổng (7 người)** — đóng cổng (bấm "Dùng thử" hay
   đăng nhập xong) thì vào thẳng app, KHÔNG tự mở tour; đặt `welcomed='2'`.
   Tour vẫn xem được từ Thêm → Hướng dẫn.
3. **Cổng hiện lại khi Google hết hạn (Phong)** — thêm cờ bền `googleEverLinked`
   (lưu khi đăng nhập Google thành công, sanitize qua `mergeCfg`); cổng bỏ qua
   khi cờ này có; app thử đăng nhập lại im lặng ở nền khi khởi động
   (`prompt=none`, dùng cơ chế silent có sẵn). User mới thật vẫn thấy cổng.
4. **Job 0đ "tàng hình" khi có job khác nợ (Phong)** — Tiền bạc, Trợ lý và
   các phòng luôn nhắc "có N buổi chụp chưa ghi giá" kể cả khi đã có người nợ.
5. **Job Event lấy checklist Portrait (Hương)** — thêm `CHECKLISTS.Event`
   (2 thân máy, flash, timeline, khách VIP…); `checkItems()` phòng thủ
   `(CHECKLISTS[t] || [])`.
6. **Mất lối vào đăng nhập sau "Dùng thử" (Tuấn, Phong, Ngọc)** — thêm hàng
   "Đăng nhập" trên màn Hôm nay khi chưa có tài khoản nào (mở lại cổng cưỡng
   bức); ngắt Google/Apple trong Cài đặt thì reset `authAsked=false`.
7. **Đổi theme trong Cài đặt không đổi ngay (Ngọc)** — ĐÃ CÓ SẴN trong v2.3:
   handler nút theme đã gọi `applyTheme(); renderAll();`. Chỉ thêm test.
8. **Cọc job đã huỷ không nhắc hoàn (Tuấn)** — tab Tiền bạc thêm dòng nhắc
   "cọc chưa hoàn" cho job đã huỷ còn cọc chưa hoàn; bấm vào mở sẵn form
   hoàn cọc.
9. **"đã nhận X / Y" ngắt dòng (Tuấn)** — bọc cụm trong span `white-space:nowrap`.
10. **Tiêu đề sự kiện Google bị cắt (Ngọc)** — tiêu đề xuống 2 dòng (`wrap2`),
    dòng phụ bỏ clamp, xuống dòng đầy đủ.
11. **Lỗi tải lịch lộ tiếng Anh (Ngọc)** — "Không tải được lịch mới — đang xem
    bản đã lưu." (không lộ message gốc).
12. **"Mời chọn ảnh" nói "Bạn xem giúp mình" khi chưa có link (Thảo)** — đổi
    thành "mình gửi link ngay sau tin này nhé."
13. **"Khôi phục mẫu gốc" ngắt 2 dòng (Thảo)** — `white-space:nowrap`.
14. **Cổng hứa "đồng bộ sau này" (Lan)** — bỏ hứa hẹn, chỉ còn "Tài khoản chỉ
    để nhận diện bạn. Dữ liệu vẫn ở trên máy bạn."
15. **"Dùng thử" chữ đỏ nhỏ (Lan, Minh)** — thành nút phụ `btn gray` rõ ràng.
16. **Bấm Google nhảy khỏi app không báo trước (Lan, Mai)** — thêm dòng chú
    thích dưới nút Google trên cổng; trên web mở auth ở tab mới (`window.open`
    ngay trong nhịp bấm, thất bại thì đóng tab), native giữ nguyên.
17. **"Kết nối Google" vs "Đăng nhập bằng Google" (Phong)** — thống nhất
    "Đăng nhập bằng Google" ở cổng, Cài đặt, tab Lịch, toasts (chỉ còn
    "Ngắt kết nối" ở đúng chỗ ngắt).
18. **7 công tắc Google bày ra trước khi kết nối (Phong, Mai)** — ẩn khi chưa
    đăng nhập; chỉ còn hàng "Đăng nhập Google để làm gì?".
19. **Nút Cài đặt chỉ có icon bánh răng (Lan)** — thêm chữ "Cài đặt" cạnh icon.
20. **Nút lưu form job nằm dưới cùng (Minh)** — ĐÃ CÓ SẴN: `openJobForm` đã
    truyền `right:'Lưu'/'Thêm'` vào `openSheet` (nút dính header). Kiểm chứng
    render thực tế trong batch này.
21. **Nhảy tới Xong = 3 hộp thoại (Minh)** — gộp cảnh báo thiếu tiền vào hộp
    xác nhận nhảy (một hộp: "Thu nốt X trước" / "Vẫn nhảy tới Xong, thiếu sau").
22. **Hoa cánh vẫn rơi dù đã bỏ (Dũng)** — `petalRain()` chặn khi `petalsOn()`
    false.
23. **Khoá tự thử Face ID không timeout, web (Quân)** — lần thử tự động kẹp
    9 giây (`AbortController`); hết giờ huỷ yêu cầu, giao diện bấm được trở
    lại. Bấm tay không kẹp. Native không đụng.
24. **Sao lưu/xoá dữ liệu chỉ ở tab Thêm (Quân)** — thêm mục "Sao lưu & dữ
    liệu" vào sheet Cài đặt (tải bản sao lưu / mở bản sao lưu / xoá dữ liệu),
    gọi cùng hàm cũ (`downloadBackup` / `restoreBackupFile` / `clearDataFlow`).

Không sửa: ô ngày mm/dd/yyyy (locale giả lập), logo vỡ trong ảnh chụp
(snapshot thiếu icon-192.png), đăng nhập thật/Face ID native/thông báo/
nhập Lịch iPhone/viền trắng trên máy thật (để Việt kiểm tra sau build).

Kiểm chứng: suite jsdom **800/800** (section [35] mới: 98 test); render
headless Chromium **38/38** (375×812 + 430×932, sáng + tối, 0 console error);
`node --check` bridge + 14/14 inline script; `npx cap sync ios` sạch;
md5 www == ios/App/App/public. Log + ảnh: `~/workspace/fotofix-v23b/`.


## Việt báo trên iPhone thật, build 2.2 (13), 17:29–17:31 20/11

1. **Chỗ đen chỗ trắng** — nội dung app tối nhưng viền TRẮNG lộ ở vùng status
   bar (trên cùng) và dưới tab bar (vùng home indicator), thấy trên cả 3 màn
   (Cài đặt → Tài khoản, Buổi chụp checklist, Buổi chụp → Lịch).
2. **Đăng nhập Apple vẫn lỗi 1000** — giờ hiện rõ mã nhờ appleLastError (v2.2):
   "Lỗi gần nhất: 1000 — The operation couldn't be completed.
   (com.apple.AuthenticationServices.AuthorizationError error 1000.)"

## 1. Sửa viền trắng (nguyên nhân đã tìm ra)

`capacitor.config.ts` đá nhau với CSS:

- Config cũ: `backgroundColor: '#FFFFFF'`, `StatusBar { style: 'DEFAULT',
  backgroundColor: '#FFFFFF', overlaysWebView: false }`,
  `ios.contentInset: 'always'`.
- `overlaysWebView: false` + `contentInset: 'always'` làm webview bị inset
  khỏi safe area — vùng inset lộ nền trắng của native — trong khi CSS đã tự
  xử safe area bằng `env(safe-area-inset-*)` ở `.nav`, `.wrap`, `.tabbar`,
  `.sheet-body` (nên `env()` về 0, padding safe-area mất tác dụng).

Sửa:

- `capacitor.config.ts`: `StatusBar.overlaysWebView: true` (webview phủ full
  màn, chui dưới status bar), bỏ `backgroundColor: '#FFFFFF'` của StatusBar,
  `backgroundColor` top-level → `'#000000'`, `ios.contentInset: 'never'`
  (để CSS `env()` nhận inset thật). `SplashScreen.backgroundColor` giữ
  nguyên `'#FFFFFF'` (không phải lỗi đang báo).
- `www/index.html`: `html` cũng có `background: var(--bg)` như `body`
  (trước đây chỉ `body` có nền nên vùng ngoài body — rubber-band
  overscroll, mép webview — lộ nền trắng của WKWebView trong theme tối).
- `www/capacitor-bridge.js` §9 mới `window.__fotobroStatusBarStyle(isDark)`:
  gọi `StatusBar.setStyle({ style: 'LIGHT' })` khi theme tối (chữ trắng),
  `'DARK'` khi theme sáng (chữ đen); không có plugin (bản web) thì bỏ qua
  im lặng. `applyTheme()` trong index.html gọi hàm này mỗi khi đổi theme;
  bridge tự đồng bộ một lần lúc nạp (vì bridge nạp sau script chính).
  Nút chọn theme trong Cài đặt gọi `applyTheme()` trực tiếp để chữ đổi
  ngay, không chờ render lại.

## 2. Lỗi Apple 1000 — điều tra xong, KHÔNG phải do ký/quyền

Đã chứng minh bằng file `.ipa` thật của build #13 (tải từ GitHub run #13,
giải nén, đọc entitlements DER trong chữ ký của binary `App`):

- Binary có `com.apple.developer.applesignin = "Default"`,
  `application-identifier = A64C927S45.com.fotobro.app`.
- `embedded.mobileprovision` trong `.ipa` cũng có `applesignin ['Default']`,
  profile "FotoBro App Store".
- `project.pbxproj` có `CODE_SIGN_ENTITLEMENTS` ở cả Debug + Release.
  Bundle ID khớp. Plugin `@capawesome/capacitor-apple-sign-in` đang ở
  0.1.5 = bản mới nhất trên npm (không có bản nâng cấp).

Nguyên nhân còn lại nhiều khả năng nhất: phía thiết bị — Apple ID chưa bật
Xác thực hai yếu tố (Sign in with Apple bắt buộc 2FA) hoặc chưa đăng nhập
iCloud/Keychain; hoặc lỗi nhất thời phía Apple.

Sửa duy nhất cho lỗi này: trong Cài đặt → Tài khoản, ngay dưới dòng
"Lỗi gần nhất: ...", khi mã lỗi là `1000` thì hiện thêm gợi ý kiểm tra
2FA/iCloud trên iPhone. Các mã lỗi khác không hiện dòng này. Giữ nguyên
toast và `appleLastError`. Không sửa phần ký, không đổi nonce/scopes.

## Test

- jsdom: toàn bộ suite đạt (683 test cũ + section [34] mới).
- Render 375px / iPhone 14 Pro Max (430×932), theme tối + sáng: vùng trên
  cùng (status bar) và vùng dưới cùng (home indicator) là màu nền của
  theme, không còn trắng. Lưu ý: `env(safe-area-inset-*)` trên trình giả
  lập trả 0 nên phần inset thật trên máy vẫn cần Việt kiểm chứng trên
  iPhone thật (xem LOG.md trong fotofix-v23/).

## Chưa làm

- Google không đụng tới (Google Lịch đang chạy tốt).
- Storage key `troLyXeo.v1` / `troLyXeoPhotos` không đổi.
