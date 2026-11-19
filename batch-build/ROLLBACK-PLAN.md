# Kế hoạch quay lại (Rollback Plan) — FotoBro iOS v1

> App: **FotoBro iOS v1.0** — Bundle ID `com.fotobro.app` — Capacitor 8
> Repo: `Hoangviet1397/fotobro` (nhánh `main`) — repo riêng, tách khỏi
> `tro-ly-xeo` mà Xèo đang dùng.
> Ngày soạn: 20/11/2026. Trạng thái: **bản nháp, chưa có build TestFlight
> nào được đẩy lên** (workflow `.github/workflows/ios-build.yml` chưa
> từng chạy, chưa có `.ipa` thật — xem README.md). Vì vậy mục "bản
> TestFlight trước" trong file này chỉ có giá trị **sau khi build đầu
> tiên lên TestFlight**; trước lúc đó, bản an toàn duy nhất là **bản
> web** (xem §1).

## 0. Nguyên tắc chung

1. **Dữ liệu trên máy người dùng là ưu tiên số 1.** FotoBro v1 chạy
   local-first (Nấc 1): job, thu chi, cài đặt nằm trong
   `localStorage` key `troLyXeo.v1`, ảnh trang chủ nằm trong
   IndexedDB `troLyXeoPhotos` (tối đa 60 ảnh). Không có server, không
   có CloudKit ở v1 — nên **không có nút "khôi phục từ cloud"**.
   Mọi bước rollback phải bắt đầu bằng câu hỏi: "dữ liệu trên máy
   người dùng còn không?" — nếu còn thì **cấm xoá app, cấm khôi phục
   đè lên** trước khi đã xuất được bản sao lưu JSON.
2. **Không sửa lỗi bằng cách đẩy vội một build chưa test.** Build sửa
   lỗi phải chạy qua checklist TESTFLIGHT-CHECKLIST.md tối thiểu ở
   các ca liên quan tới lỗi, rồi mới lên TestFlight.
3. **Việt là người duy nhất quyết dừng phát hành / phát hành lại.**
   Muse chỉ chuẩn bị build, sửa code và viết thông báo nháp — không
   tự bấm dừng hay bấm phát hành trong App Store Connect.
4. **Nói thật, không giấu.** Mẫu câu chữ lấy sẵn trong
   `batch-ops/INCIDENT-COMMS.md` (Mẫu 2 cho TestFlight, Mẫu 1 cho
   Google, Mẫu 4 cho hoãn phát hành). Email hỗ trợ
   `support@fotobro.app` hiện là **placeholder, chưa có thật**
   (domain chưa mua) — **không dùng làm kênh thông báo** cho tới khi
   có hộp thư thật. Kênh chính: trong app / TestFlight / nhóm chat
   nội bộ với tester.
5. **Ghi lại mọi sự cố vào bảng §6** (số phiên bản, số build, dấu
   hiệu, giờ phát hiện, giờ xử lý xong). Không có log thì lần sau
   không biết bản nào an toàn.

## 1. Các bản an toàn — quay lại bản nào?

| Bản | Ở đâu | Khi nào dùng làm bản quay lại | Giới hạn |
|---|---|---|---|
| **Bản web Trợ lý Xèo v2.5** (live) | `https://hoangviet1397.github.io/tro-ly-xeo/` — repo `Hoangviet1397/tro-ly-xeo`, commit `de1d3117` | **Bản an toàn mặc định cho mọi sự cố nghiêm trọng**, kể cả khi chưa có build TestFlight nào. Dùng được ngay, không cần Apple duyệt. | Là bản web cũ (tên Trợ lý Xèo, còn E.L.F./ảnh + job mẫu, giao diện vintage kem/hồng phấn), **không phải** FotoBro v1. Không có Lịch iPhone native, không có Google auto 1 chạm. |
| **Bản web FotoBro v2.6** (base của v1) | Là source `www/` trong gói `~/workspace/fotobro-ios-v1/` (chưa đẩy lên GitHub, chưa host riêng) | Chỉ dùng khi cần bản web mang tên FotoBro đã tối giản (bỏ E.L.F., bỏ job mẫu). Cần Việt duyệt đẩy lên repo `fotobro` + bật GitHub Pages rồi mới có link. | Chưa live, chưa kiểm chứng trên điện thoại ở dạng web. Không dùng làm bản quay lại khẩn cấp nếu chưa host xong. |
| **Build TestFlight trước đó** (VD: 1.0.0 build N−1) | App Store Connect → TestFlight → build cũ vẫn còn trong danh sách | Bản quay lại chính cho sự cố TestFlight **sau khi đã có ít nhất 2 build**. Build cũ vẫn cài được qua app TestFlight chừng nào chưa hết hạn 90 ngày và chưa bị gỡ. | **Chưa tồn tại lúc soạn file này** — build 1.0.0 (1) đầu tiên chưa lên TestFlight. Chỉ điền số build thật vào bảng §6 khi đã có. |
| **Bản App Store trước đó** | Không có — **v1.0 là bản đầu tiên, chưa từng lên App Store** | Không áp dụng cho v1.0. | App Store **không cho hạ phiên bản** (không có nút "về lại 1.0" sau khi 1.0.1 đã live). Cách duy nhất là nộp bản mới chứa code cũ dưới số phiên bản mới (xem §3.2). |

**Chuyển dữ liệu khi quay lại bản web (quan trọng — đọc trước khi
hướng dẫn người dùng):**

- Dữ liệu app native (origin `capacitor://localhost`) và dữ liệu bản
  web (origin `https://hoangviet1397.github.io`) **không tự chuyển
  cho nhau**. Người dùng phải xuất JSON ở app lỗi (nếu còn mở được)
  → gửi file qua AirDrop/Messenger cho chính mình → lưu vào Files →
  mở bản web → Cài đặt → nhập file JSON đó (xem RISKS.md §5).
- File sao lưu v1 chỉ chứa `{jobs, txs, cfg}` — **ảnh trang chủ
  (IndexedDB) không chuyển được**, passkey phải tạo lại, token
  Google phải đăng nhập lại. Nói rõ 3 điểm này khi hướng dẫn, đừng
  hứa "chuyển hết".
- Nếu app lỗi **không mở được** (crash khi mở, §4.1) thì **không
  xuất được JSON từ app**. Khi đó chỉ còn: (a) file sao lưu JSON
  người dùng đã tải trước đó (nhắc sao lưu 7 ngày — xem BACKUP-V2.md
  §7); (b) không có file thì chấp nhận mất dữ liệu từ lần sao lưu
  cuối tới lúc lỗi. Đây là lý do phải nhắc tester **tải sao lưu
  trước mỗi lần cập nhật TestFlight** (xem §2).

## 2. Chuẩn bị trước — để lúc lỗi không lúng túng

| # | Việc | Ai làm | Khi nào |
|---|---|---|---|
| 2.1 | Ghi sẵn số build TestFlight đang phát hành + số build trước đó (bản an toàn) vào bảng §6, cập nhật mỗi lần có build mới | Việt (ghi) / Muse (nhắc) | Mỗi lần đẩy build |
| 2.2 | Nhắc tester (Xèo + tester nội bộ) **tải bản sao lưu JSON trước khi bấm Update trong TestFlight** | Việt | Trước mỗi bản TestFlight mới |
| 2.3 | Giữ bản web v2.5 live, không gỡ khỏi màn hình chính cho tới khi v1.0 App Store đã ổn định ít nhất 1 tuần | Việt | Suốt giai đoạn TestFlight + tuần đầu lên Store |
| 2.4 | Không xoá build TestFlight cũ ngay sau khi build mới lên (để còn đường quay lại); chỉ gỡ build lỗi sau khi đã quay lại xong | Việt | Mỗi lần có build mới |
| 2.5 | Chuẩn bị sẵn link TestFlight + kênh báo lỗi nội bộ (xem `batch-build/TESTFLIGHT-INVITES.md`) để gửi thông báo nhanh | Việt | Trước TestFlight đầu tiên |

## 3. Cách dừng phát hành và quay lại (theo kênh)

### 3.1 Trên TestFlight (bản beta)

1. **Dừng phát hành bản lỗi:** Việt vào App Store Connect →
   TestFlight → chọn build lỗi → **Expire Build** (hết hạn build)
   hoặc gỡ khỏi nhóm Internal Testing. Tester mở TestFlight sẽ
   không còn thấy bản lỗi để cài.
2. **Quay lại bản trước:** Việt mở lại build trước đó (số build
   trong bảng §6) cho nhóm Internal Testing. Tester mở app
   TestFlight → bấm **Update** (hoặc Install lại) để về build cũ.
3. **Nếu chưa có build trước** (chỉ có đúng 1 build và build đó
   lỗi): không có đường quay lại trong TestFlight — hướng dẫn
   tester dùng tạm **bản web v2.5** (§1) cho tới khi có build sửa
   lỗi. Nói rõ trong thông báo, đừng để tester tưởng "cập nhật
   lại là hết lỗi".
4. **Lưu ý hạn 90 ngày:** bản TestFlight tự hết hạn sau 90 ngày kể
   từ ngày upload. Bản an toàn quá hạn thì không cài lại được — nếu
   bản trước sắp hết hạn mà bản mới chưa ổn, Việt phải đẩy lại
   build cũ (cùng code, tăng số build) để gia hạn, hoặc chuyển
   tester sang bản web.

### 3.2 Trên App Store (bản chính thức — chỉ áp dụng sau khi v1.0 live)

1. **Không có nút hạ phiên bản.** Apple không cho người dùng quay
   lại phiên bản cũ, và nhà phát hành cũng không hạ được version
   đã phát hành.
2. **Dừng thiệt hại ngay:** nếu dùng **phased release** (phát hành
   theo giai đoạn) thì Việt bấm **Pause Phased Release** trong App
   Store Connect để dừng ở % hiện tại (VD: mới tới 10% người
   dùng). Nếu phát hành 100% ngay từ đầu thì không dừng được bằng
   cách này — phải **Remove from Sale** (gỡ khỏi bán) để không ai
   tải mới nữa; người đã cài vẫn giữ bản lỗi trên máy.
3. **Quay lại bằng bản mới chứa code cũ:** Muse chuẩn bị một bản
   sửa (VD: v1.0.1) bằng cách lấy lại đúng code của phiên bản ổn
   định trước đó, tăng số phiên bản, Việt nộp **Expedited Review**
   (xin duyệt gấp) kèm ghi chú "bản sửa lỗi nghiêm trọng, khôi
   phục hành vi của v1.0". Thời gian duyệt gấp thường nhanh hơn
   duyệt thường (1–3 ngày) nhưng **không có gì đảm bảo** — phải
   nói rõ điều này với người dùng trong thông báo.
4. **Trong lúc chờ bản sửa được duyệt:** hướng dẫn người dùng dùng
   tạm **bản web v2.5** (§1) và **tuyệt đối không xoá app** (xoá
   là mất dữ liệu local chưa sao lưu).

## 4. Các tình huống — dấu hiệu, mức độ, xử lý, quay lại, kiểm chứng, phân công

Mức độ theo quy ước chung của TESTFLIGHT-CHECKLIST.md:
**Chặn** = không dùng tiếp được / mất dữ liệu; **Nặng** = tính năng
chính không làm được; **Nhẹ** = dùng được nhưng khó chịu.

### 4.1 Crash khi mở app (mở lên là văng / màn hình trắng đứng yên)

| Mục | Nội dung |
|---|---|
| **Dấu hiệu nhận biết** | Bấm icon FotoBro → app hiện splash rồi văng ra màn hình chính ngay, hoặc đứng ở màn hình trắng quá 10 giây không vào được Hôm nay. Lặp lại được trên 2 lần mở liên tiếp (không phải văng 1 lần rồi hết). Trên TestFlight: tester báo kèm iPhone + iOS + số build. |
| **Mức độ** | **Chặn** — không vào được app thì không làm được gì, kể cả xuất sao lưu. |
| **Xử lý ngay** | 1. Việt **dừng phát hành bản lỗi ngay** (§3.1 nếu là TestFlight; §3.2 nếu là App Store). 2. Việt thông báo cho tester/người dùng theo Mẫu 2 trong `batch-ops/INCIDENT-COMMS.md` ("Bản thử nghiệm mới gặp lỗi — chúng tôi đã quay về bản ổn định trước đó"), ghi rõ số build lỗi. 3. Hướng dẫn người dùng **không xoá app, không cài đặt lại** (xoá là mất dữ liệu local chưa sao lưu). Thử trước: khởi động lại iPhone rồi mở lại app — nếu vẫn crash thì chắc chắn là lỗi build, không phải lỗi máy. |
| **Quay lại bản trước** | TestFlight: Việt mở lại **build trước đó** (§1, bảng §6) cho nhóm Internal Testing; tester cập nhật về build cũ qua app TestFlight. App Store: không hạ được — làm theo §3.2 (bản v1.0.1 chứa code cũ + xin duyệt gấp), trong lúc chờ thì dùng tạm **bản web v2.5**. Nếu chỉ có 1 build duy nhất và build đó lỗi: không có bản TestFlight cũ — dùng tạm bản web v2.5. |
| **Kiểm chứng sau khi quay lại** | 1. Mở app: vào được màn Hôm nay trong 3 giây, không crash, không màn hình trắng (ca 0.2 trong TESTFLIGHT-CHECKLIST.md). 2. Vuốt qua 5 tab (Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt) đều mở được (ca 0.4). 3. Khoá màn hình rồi mở lại, dùng 5 phút bình thường, không crash (ca 0.5). 4. Kiểm tra dữ liệu: số job + số khoản thu chi khớp với trước khi lỗi (đối chiếu file sao lưu JSON gần nhất nếu có). 5. Chỉ khi 4 điểm trên đều đạt mới báo "đã quay lại xong" cho tester. |
| **Ai làm bước nào** | **Việt:** quyết dừng phát hành, bấm Expire Build / mở lại build cũ trong App Store Connect, gửi thông báo cho tester. **Muse:** xác định nguyên nhân crash từ log/mô tả lỗi (VD: plugin, `capacitor-bridge.js`, `Info.plist`), sửa code, chuẩn bị build sửa lỗi, chạy lại test jsdom + checklist ca 0.2/0.4/0.5 trước khi đưa build mới. |

### 4.2 Mất dữ liệu sau cập nhật (job / sổ tiền / ảnh biến mất hoặc về trống)

| Mục | Nội dung |
|---|---|
| **Dấu hiệu nhận biết** | Sau khi cập nhật TestFlight / App Store, mở app thấy sổ trống (0 job, 0 khoản thu chi) dù trước đó có dữ liệu; hoặc thiếu một phần (VD: job còn mà tiền mất, hoặc ảnh trang chủ mất hết); hoặc số tiền/báo cáo sai hẳn so với trước. Đối chiếu được bằng file sao lưu JSON đã tải trước đó. |
| **Mức độ** | **Chặn** — mất dữ liệu là lỗi nặng nhất của app local-first. (Riêng mất ảnh trang chủ mà job + tiền còn nguyên thì là **Nặng**, vì ảnh không có trong file sao lưu v1 — xem BACKUP-V2.md §1.) |
| **Xử lý ngay** | 1. Việt **dừng phát hành bản lỗi ngay** (§3.1/§3.2) — cập nhật thêm máy nữa là mất thêm dữ liệu. 2. Việt thông báo ngay cho tester/người dùng (Mẫu 2 INCIDENT-COMMS.md), nói rõ: **đừng ghi thêm job/tiền mới, đừng nhập file sao lưu đè lên, đừng xoá app** — mọi thao tác ghi mới đều có thể ghi đè lên dữ liệu còn sót lại. 3. Hỏi ngay người bị mất: có file sao lưu JSON gần nhất không, tải ngày nào, còn giữ file không. |
| **Quay lại bản trước** | 1. TestFlight: Việt mở lại **build trước đó** (§1, bảng §6); tester cập nhật về build cũ. **Lưu ý:** quay lại build cũ **không tự khôi phục dữ liệu đã mất** — dữ liệu mất là do bản lỗi ghi đè/xoá kho local, build cũ chỉ ngăn không mất thêm. 2. Khôi phục dữ liệu: nếu người dùng còn file sao lưu JSON → Cài đặt → **Mở bản sao lưu** → chọn file → **Thay bằng bản sao lưu** (khôi phục là thay thế toàn bộ — xem BACKUP-V2.md §6; app tự lưu bản dự phòng của dữ liệu hiện tại trước khi ghi đè). Nếu không còn file sao lưu: **không có cách khôi phục** — ghi nhận trung thực vào bảng §6, xin lỗi người dùng, và rút kinh nghiệm bắt buộc sao lưu trước mỗi lần cập nhật (§2.2). 3. App Store: như §3.2 — bản v1.0.1 chứa code cũ + duyệt gấp; trong lúc chờ, người dùng dùng tạm bản web v2.5 sau khi đã nhập file sao lưu (nếu có). |
| **Kiểm chứng sau khi quay lại** | 1. Sau khi về build cũ + nhập file sao lưu: đếm số job, số khoản thu chi, đối chiếu đúng với file sao lưu (số lượng trong file `counts` / xem trước khi khôi phục). 2. Mở 2–3 job bất kỳ: tên khách, giá, bước pipeline, tiền đã thu/còn thiếu đúng như trước khi lỗi. 3. Xem báo cáo ngày/tuần/tháng: tổng thu/chi khớp sổ tiền. 4. Tắt app hoàn toàn (vuốt khỏi đa nhiệm) rồi mở lại: dữ liệu vẫn còn (ca 7.11). 5. Xuất ngay 1 bản sao lưu JSON mới và giữ file đó trước khi làm gì tiếp. |
| **Ai làm bước nào** | **Việt:** quyết dừng phát hành, thông báo, hỏi tester về file sao lưu, bấm mở lại build cũ. **Muse:** xác định nguyên nhân mất dữ liệu (VD: đổi key `localStorage`, lỗi migration, ghi đè khi khôi phục), sửa code, viết rõ trong changelog build sửa lỗi là "đã sửa lỗi mất dữ liệu khi cập nhật từ build X", và kiểm chứng bằng test: cập nhật từ build cũ → build mới trên dữ liệu thật (job + tiền + ảnh) rồi đối chiếu. **Người dùng/tester:** cung cấp file sao lưu gần nhất, không tự nhập file lạ, không xoá app. |

### 4.3 Lỗi đăng nhập Google (không đăng nhập được / đăng nhập xong bị văng / mất kết nối)

| Mục | Nội dung |
|---|---|
| **Dấu hiệu nhận biết** | Bấm "Đăng nhập Google" mà app báo "chưa sẵn sàng" (chưa có Client ID chung — đây là **trạng thái đã biết trước**, không phải lỗi bất ngờ, xem TESTFLIGHT-CHECKLIST.md mục 6); hoặc mở trình duyệt hệ thống rồi báo `redirect_uri_mismatch` / `access_blocked`; hoặc đăng nhập xong quay lại app mà vẫn hiện "chưa kết nối"; hoặc đang dùng thì Lịch Google/Gmail đột nhiên trống. |
| **Mức độ** | **Nặng** nếu Google đã từng chạy được rồi hỏng (người dùng mất Lịch/Gmail); **Nhẹ** nếu Google chưa bao giờ bật được ở v1 (Client ID chưa có) vì lõi app — job, sổ tiền, nhắc lịch local — **vẫn chạy bình thường** (xem RISKS.md §1). |
| **Xử lý ngay** | 1. **Không dừng phát hành chỉ vì lỗi Google**, trừ khi lỗi Google kéo theo crash app hoặc mất dữ liệu (khi đó xử lý theo §4.1/§4.2). 2. Việt thông báo theo Mẫu 1 trong `batch-ops/INCIDENT-COMMS.md` ("Đăng nhập Google đang gặp lỗi — dữ liệu trên máy của bạn vẫn an toàn"), nhấn mạnh: job, sổ tiền, nhắc lịch trên máy vẫn đầy đủ; **đừng xoá app, đừng ngắt kết nối Google** (ngắt kết nối sẽ xoá Lịch/Gmail đã tải khỏi máy — xem ca 6.7). 3. Nếu lỗi là `redirect_uri_mismatch`: gần như chắc chắn Client ID / scheme redirect chưa khớp (code v1 dùng scheme `com.fotobro.app:/oauth2redirect`, Google chỉ chấp nhận `com.googleusercontent.apps.<id>:/oauth2redirect` — xem CHANGELOG-v1.0.md) — ghi đúng chữ lỗi lại để Muse sửa. |
| **Quay lại bản trước** | 1. Nếu lỗi Google xuất hiện **sau một bản cập nhật** (bản trước đăng nhập được, bản mới không): TestFlight — Việt mở lại **build trước đó** (§1, bảng §6); App Store — làm theo §3.2 (bản mới chứa code Google cũ). 2. Nếu Google **chưa bao giờ chạy được ở v1** (chưa có Client ID chung / chưa xác minh Google): **không có gì để quay lại** — hướng xử lý là **tắt Google tạm ở v1** (ẩn nút đăng nhập hoặc báo "Google sẽ có ở bản sau", sửa mô tả App Store + App Privacy cho khớp — xem RISKS.md §1) rồi làm lại đúng ở bản sau, thay vì cố vá trong bản lỗi. 3. Bản web v2.5 vẫn đăng nhập Google bình thường (origin `https://hoangviet1397.github.io`) — người dùng cần Lịch/Gmail gấp thì dùng tạm bản web. |
| **Kiểm chứng sau khi quay lại** | Chạy lại toàn bộ mục 6 trong TESTFLIGHT-CHECKLIST.md trên tài khoản Google **test** (không dùng tài khoản chính có mail khách quan trọng): 6.1 mở trình duyệt hệ thống (không đăng nhập trong WebView); 6.2 quay lại app tự động, hiện "Đã kết nối Google"; 6.3 xem được Lịch Google 30 ngày tới, chạm sự kiện tạo được buổi chụp; 6.5 ghi buổi chụp lên Google Lịch và kiểm tra trên calendar.google.com; 6.7 ngắt kết nối thì job/sổ tiền vẫn nguyên; 6.8 đăng nhập lại được bình thường. Chỉ khi 6.1–6.3 và 6.7–6.8 đạt mới coi Google đã quay lại ổn. |
| **Ai làm bước nào** | **Việt:** quyết có dừng phát hành không (thường là không, trừ khi kèm crash/mất dữ liệu), quyết tắt Google tạm hay chờ sửa, tạo/sửa Client ID chung trong Google Cloud Console + xác minh Google (xem GOOGLE-SETUP.md — việc này chỉ Việt làm được). **Muse:** sửa code theo đúng lỗi (redirect scheme, PKCE, scope), cập nhật `fotobro-config.js` + `Info.plist` khi có Client ID thật, viết thông báo nháp. |

### 4.4 Lỗi lịch (nhập Lịch iPhone không được / trùng job / xuất lịch sai / nhắc sai giờ)

| Mục | Nội dung |
|---|---|
| **Dấu hiệu nhận biết** | Bấm "Nhập từ Lịch iPhone" mà không có sự kiện nào vào app, hoặc sự kiện vào sai tên/giờ/địa điểm; hoặc nhập 2 lần thì tạo job trùng (sự kiện đã nhập bị nhập lại); hoặc bấm "Thêm vào Lịch iPhone" mà app Lịch không mở / mở ra trống / sai giờ; hoặc nhắc trước buổi chụp không kêu / kêu sai giờ; hoặc app crash ngay khi bấm nhập lịch (khi đó xử lý theo §4.1 trước). |
| **Mức độ** | **Nặng** nếu nhập lịch tạo job trùng hàng loạt hoặc xuất lịch sai giờ (người dùng có thể lỡ buổi chụp thật); **Nhẹ** nếu chỉ là không nhập được (người dùng vẫn thêm job tay được) hoặc nhắc không kêu (nhắc trong app chỉ là nhắc phụ — Lịch iPhone vẫn nhắc riêng). |
| **Xử lý ngay** | 1. **Không dừng phát hành chỉ vì lỗi lịch**, trừ khi lỗi lịch gây crash hoặc tạo job trùng hàng loạt (khi đó dừng theo §3.1/§3.2). 2. Việt thông báo ngắn cho tester (dựa theo Mẫu 2 INCIDENT-COMMS.md, rút gọn): lỗi gì, ảnh hưởng ai, cách làm tạm — **thêm job tay, kiểm tra lại giờ trong app Lịch iPhone trước mỗi buổi chụp**, đừng tin giờ nhắc trong app cho tới khi có bản sửa. 3. Nếu đã tạo job trùng: hướng dẫn xoá job trùng tay (kiểm tra kỹ job nào là job thật trước khi xoá — job trùng thường có cùng tên + giờ, job thật có thể đã gắn tiền cọc; **xoá nhầm job thật là mất tiền đã ghi**). |
| **Quay lại bản trước** | 1. Nếu lỗi lịch xuất hiện **sau một bản cập nhật** (bản trước nhập/xuất đúng, bản mới sai): TestFlight — Việt mở lại **build trước đó** (§1, bảng §6); App Store — làm theo §3.2. 2. Nếu Lịch iPhone **chưa bao giờ chạy được ở v1** (plugin `@capacitor/calendar` chưa kiểm chứng trên iPhone thật — xem CHANGELOG-v1.0.md): **không có gì để quay lại** — hướng xử lý là sửa ở bản sau; trong lúc chờ, người dùng thêm job tay + dùng nút "Thêm vào Lịch iPhone" để tạo sự kiện (nếu nút này còn chạy) hoặc tạo sự kiện tay trong app Lịch. 3. Lưu ý: v1 **đã bỏ hẳn nhập lịch bằng file `.ics`/`.zip`** (quyết 00:06 20/11) — **không hướng dẫn người dùng quay lại cách nhập file**, vì code nhập file đã gỡ khỏi app. |
| **Kiểm chứng sau khi quay lại** | Chạy lại toàn bộ mục 4 + 5 + ca 11.2 trong TESTFLIGHT-CHECKLIST.md: 4.2 app hỏi quyền Lịch lần đầu; 4.3 sự kiện 30 ngày tới vào đúng tên/giờ/địa điểm; 4.4 từ chối quyền thì app báo rõ + hướng dẫn bật lại, không crash, không tạo job rác; 4.5 nhập lại lần 2 không tạo job trùng; 5.1–5.2 nút "Thêm vào Lịch iPhone" tạo đúng sự kiện trong Lịch iPhone; 5.3 job chưa có ngày chụp thì app báo rõ, không tạo file rỗng; 11.2 nhắc trước buổi chụp kêu đúng giờ. Chỉ khi 4.3, 4.5, 5.2 đạt mới coi lịch đã quay lại ổn. |
| **Ai làm bước nào** | **Việt:** quyết có dừng phát hành không, thông báo cho tester, kiểm chứng trên iPhone thật (nhập/xuất lịch chỉ kiểm được trên máy thật, không kiểm được trên Linux). **Muse:** sửa code (quyền Lịch, chống trùng khi nhập lại, múi giờ khi xuất lịch), chạy lại test liên quan, chuẩn bị build sửa lỗi. |

## 5. Sau khi quay lại xong — checklist đóng sự cố

- [ ] Bản lỗi đã dừng phát hành (Expire Build trên TestFlight / Pause
      Phased Release hoặc Remove from Sale trên App Store).
- [ ] Tester/người dùng đã nhận được thông báo (ghi rõ kênh + giờ gửi).
- [ ] Đã xác nhận dữ liệu người dùng còn nguyên (đếm job + thu chi,
      đối chiếu file sao lưu gần nhất).
- [ ] Đã chạy lại các ca kiểm chứng ở §4 cho đúng tình huống, ghi
      kết quả vào bảng §6.
- [ ] Đã đăng bản "Đã khắc phục" trên cùng kênh đã thông báo (theo
      checklist cuối INCIDENT-COMMS.md), ghi rõ giờ khắc phục.
- [ ] Đã ghi nguyên nhân gốc (root cause) vào bảng §6 — không đóng
      sự cố khi chưa biết vì sao lỗi.
- [ ] Build sửa lỗi (nếu có) đã qua checklist TESTFLIGHT-CHECKLIST.md
      ở các ca liên quan trước khi đẩy lên TestFlight lại.

## 6. Bảng ghi sự cố và bản an toàn (điền khi có build/sự cố thật)

> Điền số build thật vào đây mỗi lần đẩy TestFlight. Lúc soạn file
> này (20/11/2026) chưa có build nào — các ô dưới đây đang trống là
> **đúng**, không phải thiếu sót.

| Ngày | Bản lỗi (version + build) | Bản an toàn quay lại (version + build) | Tình huống (§4) | Mức độ | Nguyên nhân gốc | Giờ phát hiện | Giờ xử lý xong | Người quyết |
|---|---|---|---|---|---|---|---|---|
| _chưa có_ | _chưa có build TestFlight_ | Bản web v2.5 (`tro-ly-xeo`, commit `de1d3117`) | — | — | — | — | — | — |
| | | | | | | | | |
| | | | | | | | | |

## 7. Những gì kế hoạch này KHÔNG xử lý (không phải rollback)

- **Mic/giọng nói không chạy:** mic đã dời sang **v1.1** theo quyết
  định (plugin speech-recognition không tương thích Capacitor 8).
  Bấm mic ở v1 chỉ hiện "Giọng nói sẽ có ở bản v1.1" — đây là hành
  vi đúng, **không phải lỗi, không rollback**.
- **CloudKit không đồng bộ:** Nấc 2 chỉ là placeholder
  `not-configured` ở v1, chưa có đồng bộ thật — đừng báo là lỗi
  rollback, xem `batch-ops/INCIDENT-COMMS.md` Mẫu 3 khi Nấc 2 chạy.
- **Apple từ chối duyệt (Guideline 4.2/4.8):** không phải lỗi kỹ
  thuật, không rollback được — xem RISKS.md §7–§8 (phương án dự
  phòng: TestFlight Internal / Custom App, hoặc thêm Sign in with
  Apple nếu bị yêu cầu).
- **Quên mã PIN / Face ID không mở được:** dùng PIN dự phòng (xem
  RISKS.md §3, TESTFLIGHT-CHECKLIST.md mục 8). Nếu quên cả PIN thì
  chỉ còn cách xoá app cài lại — **và sẽ mất dữ liệu local nếu
  không có file sao lưu**. Đây là rủi ro đã biết, không có đường
  rollback kỹ thuật.
- **Mất mật khẩu sao lưu mã hoá:** sao lưu v2 mã hoá (thiết kế trong
  BACKUP-V2.md) không có "quên mật khẩu" — mất là mất, không khôi
  phục. Lưu ý: sao lưu v2 hiện **chưa code vào app**, v1 chỉ có
  file JSON không mã hoá.

## 8. Tài liệu liên quan

- `TESTFLIGHT-CHECKLIST.md` — ca test để kiểm chứng sau khi quay lại
  (mục 0, 4, 5, 6, 8, 9, 11).
- `batch-ops/INCIDENT-COMMS.md` — mẫu thông báo sự cố (Mẫu 1 Google,
  Mẫu 2 TestFlight, Mẫu 4 hoãn phát hành) + checklist trước khi đăng.
- `batch-build/TESTFLIGHT-INVITES.md` — link mời TestFlight, kênh báo
  lỗi, hạn test (bản beta hết hạn sau 90 ngày).
- `RISKS.md` — §1 Google, §3 khoá, §5 chuyển dữ liệu, §7–§8 rủi ro
  App Store.
- `BACKUP-V2.md` — sao lưu v1/v2, khôi phục thay thế toàn bộ, nhắc
  sao lưu 7 ngày.
- `BUILD-GUIDE.md` — các bước đẩy build lên TestFlight qua GitHub
  Actions (macOS runner, Xcode 26).
- `CHANGELOG-v1.0.md` — lỗi đã biết ở v1.0 (Google chưa có Client ID,
  Lịch iPhone chưa kiểm chứng thật, mic dời v1.1).
- `README.md` — trạng thái gói v1.0, những gì chưa kiểm chứng được
  trên Linux.
