# FotoBro iOS v1 — Ảnh hưởng pin (Battery Impact)

> Trạng thái: **ghi chú phân tích, chưa đo trên máy thật**.
> Chỉ đọc code hiện có trong `~/workspace/fotobro-ios-v1/` (ngày 20/11/2026),
> không sửa bất kỳ file app nào. File mới duy nhất:
> `~/workspace/fotobro-ios-v1/batch-engineering/BATTERY-IMPACT.md`.
>
> Kết luận ngắn: **app v1 gần như không tốn pin khi đóng** — nhắc lịch là
> local notification do iOS phát (không chạy nền), không GPS, không push,
> không đồng bộ nền. Pin tiêu thụ chủ yếu lúc **mở app dùng** (màn hình +
> CPU render), giống mọi app ghi chú local khác. Mọi con số "ước tính" dưới
> đây là **thứ tự độ lớn, chưa đo** — phải đo lại trên iPhone thật qua
> TestFlight (xem §7) trước khi ghi vào App Store hay trả lời user.

## 1. Kiến trúc v1 — vì sao pin nền ≈ 0

| Hạng mục | Trạng thái v1 (đã kiểm chứng bằng đọc code) | Ảnh hưởng pin |
|---|---|---|
| Nhắc lịch | Local notification, `@capacitor/local-notifications` `^8.0.0` (`package.json`); cấu hình `capacitor.config.ts` | ≈ 0 khi chờ — iOS giữ lịch, app không chạy |
| Chạy nền | **Không có** `UIBackgroundModes` trong `ios/App/App/Info.plist`; không `BGAppRefresh`, không background fetch | 0 — app đóng là dừng hẳn |
| Push / server | **Không có** `aps-environment`, không server, không push (xem `NOTIFICATIONS.md` §3) | 0 — không giữ kết nối, không radio chờ |
| GPS / vị trí | **Không dùng** — không plugin geolocation, không key `NSLocation*` trong `Info.plist`; ô "địa điểm" trong job chỉ là chữ user gõ tay | 0 — GPS là thứ tốn pin nhất, v1 không đụng tới |
| Đồng bộ nền | **Không có** — CloudKit Nấc 2 đang `not-configured` (`fotobro-config.js`); Google chỉ đồng bộ khi app đang mở (xem §4) | 0 khi đóng app |
| Service worker | Không có `sw.js` trong `www/` iOS; code đăng ký SW có guard `location.protocol === 'https:'` nên trên `capacitor://localhost` không chạy (xem `PERFORMANCE.md` §1) | 0 — không worker chạy ngầm |
| Mở app | File local trong gói (`www/` ~492 KB, `index.html` ~330 KB), không tải gì lúc khởi động | Chỉ tốn pin lúc dùng, như mọi app local |

Nói một câu cho user: **đóng app lại là FotoBro không tốn pin** — khác hẳn
app gọi xe / bản đồ / chat vốn phải giữ GPS hoặc giữ kết nối server.

## 2. Local notification — tốn bao nhiêu pin?

Cơ chế: app chỉ **đặt lịch** (1 lần lúc lưu job / mở app), rồi iOS tự phát
đúng giờ. Trong lúc chờ, app không chạy, không dùng CPU, radio hay GPS.

| Loại nhắc (theo `NOTIFICATIONS.md` §2) | Mặc định v1 | Số nhắc đang chờ |
|---|---|---|
| Nhắc trước buổi chụp | Trước giờ chụp **12 tiếng** (chọn 1h / 12h / 24h) | 1 nhắc / job |
| Nhắc hạn giao ảnh | Trước hạn giao **1 ngày**, phát 09:00 | 1 nhắc / job |
| Nhắc job kẹt | Quét lúc **mở app**, 1 nhắc tổng hợp cho 09:00 hôm sau | Tối đa 1 nhắc / ngày |
| Nhắc sao lưu | Quá **7 ngày** chưa sao lưu → 1 nhắc lúc 20:00 hôm đó | Tối đa 1 nhắc / lần |

- Tổng đang chờ: tối đa ~2 nhắc/job + 2 nhắc tổng hợp; iOS giới hạn
  64 nhắc đang chờ — v1 chỉ đặt nhắc cho job trong 30 ngày tới nên
  không chạm giới hạn với mức dùng bình thường (xem `NOTIFICATIONS.md` §5).
- Chi phí mỗi lần phát: iOS đánh thức máy trong tích tắc, hiện banner /
  kêu 1 tiếng. Ước tính **không đo được trên biểu đồ pin** (dưới 0,01%
  pin / 1 nhắc — thứ tự độ lớn, xem §6). Kể cả 10 nhắc/ngày vẫn không
  thấy trong Cài đặt → Pin.
- Đặt lại lịch nhắc: chỉ xảy ra khi user **lưu/sửa job hoặc mở app**
  (ghi đè cùng ID, không nhân bản) — không có timer nào chạy ngầm để
  đặt nhắc. Mở app 20 lần/ngày cũng chỉ là 20 lần quét nhẹ lúc mở.
- Trường hợp tốn pin hơn một chút (vẫn nhỏ): user tắt quyền Thông báo
  rồi mở app liên tục — app vẫn quét job kẹt / sao lưu lúc mở, nhưng
  không đặt được nhắc nào; chi phí vẫn chỉ là chi phí mở app (xem §5).

## 3. Chạy nền — không có gì chạy nền

- App **không đăng ký bất kỳ background mode nào**: không fetch nền,
  không xử lý nền, không audio nền, không cập nhật vị trí nền.
- Hệ quả thực tế:
  - Tắt app (vuốt khỏi đa nhiệm) → **0% pin nền**, iOS không cho app
    chạy lại trừ khi user mở hoặc nhắc tới giờ (mà nhắc thì do iOS
    phát, không cần app chạy).
  - Không có chuyện app tự dậy lúc nửa đêm để đồng bộ hay kiểm tra
    job kẹt — job kẹt chỉ được phát hiện **lúc user mở app** (§2.3
    `NOTIFICATIONS.md`). Đây là đánh đổi có chủ ý của v1: nhắc job
    kẹt / sao lưu có thể tới muộn 1 ngày nếu user nhiều ngày không
    mở app, đổi lại pin nền bằng 0.
  - Nhắc đã đặt vẫn phát cả khi app tắt hẳn; chỉ mất khi máy tắt
    nguồn đúng giờ nhắc hoặc gỡ app (giới hạn iOS, xem
    `NOTIFICATIONS.md` §5).

## 4. Đồng bộ Google — chỉ tốn pin lúc mở app

Google (Lịch, Gmail, Danh bạ, Drive) chỉ chạy khi app đang mở và user
đã đăng nhập; đóng app là dừng. Các giới hạn đã có trong code
(`www/index.html`, đọc ngày 20/11/2026):

| Tác vụ | Giới hạn trong code | Tần suất |
|---|---|---|
| Google Lịch | `maxResults=250` sự kiện / lịch; cache **10 phút** (`Date.now() - fetchedAt > 10 * 60000` mới tải lại) | Khi mở tab Lịch / màn Hôm nay, tối đa 1 lần / 10 phút |
| Gmail — tiền về | `maxResults=40` thư / lần | Khi mở màn Tiền bạc / bấm Làm mới |
| Gmail — khách hỏi chụp | `maxResults=25` thư / lần | Cùng lúc với mục trên |
| Làm mới token | Chỉ khi token hết hạn (`oauth2.googleapis.com/token`) | Theo hạn token, không định kỳ |

- Mỗi lần đồng bộ là vài request HTTPS nhỏ (danh sách sự kiện/thư
  dạng JSON, không tải file đính kèm, không tải ảnh Drive). Ước tính
  **dưới 0,1% pin / 1 lần làm mới** — thứ tự độ lớn, chưa đo; phần lớn
  là radio bật trong vài giây, iOS gộp chung với lúc màn hình đang
  sáng nên khó tách riêng.
- **Không làm mới tự động khi đóng app.** Không có polling, không
  có timer 5 phút, không có "kiểm tra Gmail mới". Muốn biết có khách
  hỏi mới thì user phải mở app (hoặc xem Gmail thật).
- Rủi ro duy nhất làm pin tăng: user bấm "Làm mới" liên tục, hoặc
  mở app ở nơi sóng yếu (radio phải phát mạnh + thử lại). Code đã có
  cache 10 phút cho Lịch nên bấm qua lại trong 10 phút không tải lại;
  Gmail chưa có cache thời gian — bấm Làm mới 10 lần là 10 lần tải
  (xem §8, mục cải thiện).

## 5. Pin lúc mở app (foreground) — phần tốn pin thật

Pin v1 tiêu thụ thực tế nằm ở lúc user **đang dùng app**, và phần lớn
là màn hình sáng + CPU render WebView — giống mọi app Capacitor /
ghi chú khác, không có gì đặc biệt tốn pin.

| Nguồn tốn pin lúc mở app | Mức độ | Ghi chú |
|---|---|---|
| Màn hình sáng (lớn nhất) | Cao | Chi phối tổng pin; dark mode đen trên iPhone OLED tiết kiệm hơn nền trắng — v1 có dark mode |
| Parse + render `index.html` ~330 KB | Nhỏ | Mở app ước tính 0,3–0,8 giây trên máy mới (xem `PERFORMANCE.md` §2, chưa đo) |
| `loadMyShots()` tạo object URL cho **cả 60 ảnh** lúc mở app | Nhỏ–vừa | Chỉ dùng 1 ảnh hero; tạo thừa 59 URL mỗi lần mở — tốn CPU/bộ nhớ lúc mở, không tốn khi đóng (xem `PERFORMANCE.md` §5.1) |
| `saveLocal()` ghi **toàn bộ** JSON `troLyXeo.v1` mỗi lần thay đổi | Nhỏ | 1 lần `setItem` đồng bộ / thay đổi; càng nhiều job thì mỗi lần ghi càng nặng (xem `PERFORMANCE.md` §5.2). Không phải ghi nền liên tục |
| Ảnh: thu nhỏ về cạnh dài nhất 1400 px trước khi lưu | Nhỏ, 1 lần | Chỉ tốn lúc user thêm ảnh; ảnh gốc 12 MP (~3–5 MB) còn vài trăm KB |
| Nhập Lịch iPhone native (`@capacitor/calendar` `^1.0.1`) | Nhỏ, 1 lần | Chỉ khi user bấm nhập; đọc sự kiện 30 ngày tới rồi thôi, không theo dõi lịch liên tục |
| Giọng nói | **Không tốn ở v1** | Mic đã dời sang v1.1 (plugin speech-recognition thiếu `Package.swift`); v1 chỉ gõ tay |

- Không có animation chạy liên tục, không có video tự phát, không có
  bản đồ, không có đếm ngược realtime — màn Hôm nay là màn tĩnh,
  không tự làm mới theo giây.
- So sánh nhanh (thứ tự độ lớn, chưa đo): dùng FotoBro 10 phút/ngày
  (mở vài lần, xem job, ghi thu chi) ước tính **~1–2% pin/ngày**,
  trong đó màn hình chiếm phần lớn. Con số này để user hình dung,
  không phải cam kết — máy cũ / màn sáng tối đa / sóng yếu đều làm
  tăng.

## 6. Ước tính tổng mức tiêu thụ (chưa đo — đọc kỹ trước khi trích dẫn)

| Kịch bản dùng (1 ngày) | Ước tính pin | Phần nào chiếm |
|---|---|---|
| Không mở app, chỉ nhận 2–3 nhắc | **< 0,1%** (không thấy trong Cài đặt → Pin) | Chỉ lúc nhắc phát |
| Mở app 3–5 lần, mỗi lần 1–2 phút (xem job, ghi tiền) | **~1%** | Màn hình + render |
| Mở app 10 phút + 1 lần đồng bộ Google + nhập Lịch iPhone | **~1–2%** | Màn hình là chính; Google < 0,1% |
| Ngày chụp bận: mở app 30 phút + chụp ảnh bằng app Máy ảnh (ngoài FotoBro) | **~3–5% cho FotoBro**, chưa tính app Máy ảnh | Màn hình + mở app nhiều lần |
| Để qua đêm không mở | **0%** | Không có tác vụ nền nào |

- Trong Cài đặt iPhone → Pin, FotoBro **dự kiến hiện "Hoạt động nền:
  0 phút"** (hoặc không hiện dòng nền). Nếu thấy "Hoạt động nền"
  khác 0 ở bản TestFlight thì đó là lỗi cần điều tra — v1 không được
  phép có hoạt động nền.
- Các ước tính trên **không phải số đo**: chưa có bản TestFlight,
  chưa đo trên iPhone thật. Đừng ghi "FotoBro chỉ tốn 1% pin" lên
  App Store; chỉ nói "chạy hoàn toàn trên máy, không chạy nền,
  không theo dõi vị trí".

## 7. Cách đo thật trên iPhone (TestFlight)

1. **Cài đặt → Pin (24 giờ / 10 ngày):** xem % pin của FotoBro và
   dòng "Hoạt động nền" — kỳ vọng nền = 0 phút. Chụp màn hình lại
   sau 1 ngày dùng bình thường và 1 ngày không mở app.
2. **Ngày không mở app:** đặt 2–3 job có nhắc ngày hôm sau, đóng
   app hẳn (vuốt khỏi đa nhiệm), sáng hôm sau kiểm tra: nhắc có tới
   không, và Pin có ghi FotoBro không (kỳ vọng: nhắc tới, pin ~0%).
3. **Ngày dùng nhiều:** dùng app ~30 phút + bấm Làm mới Google
   2–3 lần, ghi % pin FotoBro cuối ngày để đối chiếu §6.
4. **Máy cũ:** lặp lại bước 2–3 trên iPhone SE 2 / iPhone 8 nếu có —
   máy cũ CPU yếu hơn nên lúc mở app tốn pin hơn, nhưng pin nền
   vẫn phải bằng 0.
5. Ghi kết quả đo vào file này (§6) kèm mẫu máy + iOS, thay các
   chữ "ước tính" bằng số đo thật trước khi công bố.

## 8. Cách giảm pin thêm (v1 đã tốt — chỉ làm nếu đo thấy vấn đề)

Đã tốt rồi, không cần làm ở v1:

- Giữ nguyên local notification, đừng đổi sang push — push cần giữ
  kết nối + server, tốn pin hơn mà v1 không cần.
- Đừng thêm background fetch / BGAppRefresh để "nhắc job kẹt đúng
  giờ hơn" — sẽ phá cam kết pin nền = 0; job kẹt muộn 1 ngày là
  chấp nhận được (đã chốt trong `NOTIFICATIONS.md` §2.3).
- Đừng thêm GPS / nhắc theo vị trí ("tới gần điểm chụp thì nhắc") —
  GPS nền là nguồn tốn pin lớn nhất trên iPhone.

Cải thiện nhỏ, làm khi rảnh (không chặn v1):

1. **Lazy-load ảnh trang chủ** (`PERFORMANCE.md` §5.1): chỉ tạo
   object URL cho ảnh hero + ảnh đang hiện, thay vì cả 60 ảnh lúc
   mở app — giảm CPU/bộ nhớ lúc mở, nhất là máy đủ 60 ảnh.
2. **Debounce `saveLocal()` ~300 ms + chỉ render màn đang mở**
   (`PERFORMANCE.md` §5.2): giảm số lần ghi toàn bộ JSON khi user
   sửa nhiều job liên tiếp.
3. **Cache Gmail theo thời gian như Lịch** (hiện Lịch cache 10
   phút, Gmail chưa có): tránh tải lại 40 + 25 thư mỗi lần bấm
   Làm mới liên tiếp.
4. **Giữ nguyên giới hạn Google** (250 sự kiện/lịch, 40 + 25 thư):
   đừng nới `maxResults` — đã đủ cho studio nhỏ, nới chỉ tốn
   thêm radio + pin.
5. **Nhắc user bật dark mode / giảm sáng màn hình** khi dùng lâu
   ngoài trời — màn hình mới là phần tốn pin nhất, không phải app.

## 9. Câu trả lời nhanh cho user / App Store

- **"App có tốn pin không?"** — Không đáng kể. Đóng app là không
  tốn pin; nhắc lịch do iPhone tự phát, không cần app chạy.
- **"App có theo dõi vị trí không?"** — Không. App không xin quyền
  vị trí, không dùng GPS; địa điểm job là chữ bạn tự gõ.
- **"App có chạy nền không?"** — Không. Không đồng bộ nền, không
  push, không tự dậy lúc nửa đêm. Muốn xem Gmail/Lịch mới thì mở
  app lên.
- **"Sao Cài đặt → Pin thấy FotoBro 2%?"** — Đó là pin lúc bạn mở
  app dùng (màn hình sáng), không phải pin chạy nền. Kiểm tra dòng
  "Hoạt động nền" — phải là 0 phút.

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Ghi chú ảnh hưởng pin của FotoBro iOS v1 — local
   notification, chạy nền, đồng bộ Google, GPS không dùng, ước tính
   mức tiêu thụ, cách giảm — để Việt / agent làm app / App Store
   trả lời đúng, không phóng đại.
2. **Đã thực hiện:** Chỉ đọc code và tài liệu hiện có (`NOTIFICATIONS.md`,
   `PERFORMANCE.md`, `PUSH-READY.md`, `package.json`,
   `capacitor.config.ts`, `www/index.html` phần Google sync,
   `ios/App/App/Info.plist` qua grep). Viết 1 file mới duy nhất:
   `~/workspace/fotobro-ios-v1/batch-engineering/BATTERY-IMPACT.md`
   (tạo thư mục `batch-engineering/` mới). Không sửa bất kỳ file
   nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** File đã viết, đọc được. Các căn cứ đều lấy
   từ code thật: plugin `@capacitor/local-notifications` 8.0.0 +
   `@capacitor/calendar` 1.0.1; grep `Info.plist` /
   `capacitor.config.ts` / `package.json` = 0 kết quả cho
   `UIBackgroundModes` / `NSLocation` / `aps-environment` (không
   có chạy nền, GPS, push); Google Lịch `maxResults=250`, cache
   10 phút, Gmail 40 + 25 thư/lần; nhắc chụp 12h / hạn giao 1 ngày /
   sao lưu 7 ngày theo `NOTIFICATIONS.md`.
4. **Vấn đề còn tồn tại:** Mọi con số % pin (§5–§6) là **ước tính
   thứ tự độ lớn, chưa đo** — chưa có bản TestFlight, chưa đo trên
   iPhone thật. Gmail chưa có cache thời gian như Lịch (bấm Làm mới
   liên tiếp là tải lại). `loadMyShots()` + `saveLocal()` toàn bộ
   vẫn là 2 điểm tốn CPU lúc mở app (đã ghi trong `PERFORMANCE.md`).
5. **Điều kiện chuyển bước:** Không cần Việt quyết gì thêm — v1 đã
   chốt không chạy nền, không GPS, không push. File này là ghi chú,
   không đổi hành vi app.
6. **Bước tiếp theo:** Khi có bản TestFlight, đo theo checklist §7
   (Cài đặt → Pin, ngày không mở app, ngày dùng nhiều, máy cũ) rồi
   quay lại sửa §6 bằng số đo thật kèm mẫu máy + phiên bản iOS.
7. **Trạng thái:** Ghi chú xong. Không tạo tài khoản, không mua gì,
   không sửa file nào ngoài file mới này.
