# FotoBro iOS v1 — Kế hoạch test đầu-cuối (E2E) trên TestFlight

- App: FotoBro, Bundle ID `com.fotobro.app` (Capacitor 8, `www/index.html` single-file, local-first)
- Đối tượng test: bản TestFlight trên iPhone thật (không test trên web / giả lập cho các luồng native)
- Tài liệu gốc bám theo: `TESTFLIGHT-CHECKLIST.md` (cùng thư mục dự án) + code thật trong `www/index.html` và `www/fotobro-config.js`
- Người test: Việt / Xèo — Ngày test: ____ / ____ / 2026 — Build TestFlight: ________ — iPhone / iOS: ________________

## 0. Đọc trước khi test — những điểm đã kiểm chứng từ code thật

Những điểm này quyết định cách viết các luồng dưới đây; nếu bản TestFlight khác đi thì đó là lỗi cần ghi, không phải lỗi của kế hoạch.

1. **Bảng giá mặc định là 0, không phải giá có sẵn.** Trong code, `prices` và `pricesFilm` mặc định đều `0` (xác nhận trong `CHANGELOG-v1.0.md`: "bảng giá digital + film mặc định 0 (chưa đặt)"). Vì vậy mọi luồng kiểm tra "giá tự điền đúng bảng giá" đều phải chạy **E2E-02 (cài đặt giá test) trước**. Các con số giá trong kế hoạch này (Portrait 2.500.000, Couple 4.000.000, Wedding 15.000.000, Lookbook 8.000.000, Event 5.000.000) là **giá test do người test tự đặt trong Cài đặt**, trùng bảng giá thật của Xèo để dễ đối chiếu — không phải giá hard-code của app.
2. **Cọc mặc định 40%, hạn giao mặc định 14 ngày** (`depositPct:40, deliverDays:14` trong code). App gợi ý tiền cọc = giá × 40% làm tròn tới 10.000.
3. **5 tab dưới trong code là: Hôm nay — Buổi chụp — Tiền bạc — Phòng ban — Trợ lý.** "Cài đặt" không phải tab riêng mà nằm trong Phòng ban (nút "Thông số của bạn"). `TESTFLIGHT-CHECKLIST.md` §0.4 ghi 5 tab là "Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt" — **sai lệch so với code**; E2E-01 kiểm tra theo tên tab thật trong code và ghi lại nếu bản TestFlight hiển thị khác.
4. **Pipeline đúng 8 bước, thứ tự cố định:** Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong. Nhảy bước bằng cách chạm nút số trên thanh tiến độ trong chi tiết job (`data-jump`). Job đã huỷ khôi phục về đúng bước Tư vấn.
5. **Job kẹt (theo code `stuckInfo`):** ở 1 bước ≥ 7 ngày, hoặc đã qua ngày chụp mà vẫn ở bước trước "Đã chụp", hoặc đã quá hạn giao mà chưa tới "Đã giao". Màn Hôm nay hiện dòng "Job kẹt: … — kẹt ở bước X".
6. **Tiền:** còn thiếu = giá job − tổng đã thu của job đó. "Cả hai" (Digital + Film) chỉ tính được giá khi **cả hai** bảng giá đều > 0, nếu không giá trả về 0 và để trống cho người dùng tự gõ (không crash, không tự đoán).
7. **Lịch iPhone native:** plugin `@capacitor/calendar` (EventKit, `findEvents`), nhập 1 chạm lấy sự kiện **30 ngày tới** thành buổi chụp. Lưu ý: code tự gọi nhập lịch sau 350ms khi mở app native — nếu vừa mở app đã thấy job từ Lịch nhảy vào thì đó là hành vi theo code, không phải lỗi. Xuất lịch: nút "Thêm vào Lịch iPhone" trong chi tiết job mở sheet hệ thống, sự kiện dài 2 giờ, nhắc trước 12 tiếng (720 phút). **Không còn nhập file `.ics` / `.zip` ở v1.**
8. **Google 1 chạm — CÓ ĐIỀU KIỆN.** `www/fotobro-config.js` hiện để `googleClientId: ''` (trống, placeholder). Nếu bản TestFlight chưa dán Client ID chung thì toàn bộ E2E-07 ghi ⏭️ BỎ QUA, không ghi lỗi. Khi đã có Client ID: đăng nhập mở trình duyệt hệ thống (Safari, PKCE, không đăng nhập trong WebView), ngắt kết nối sẽ thu hồi token tại Google và xoá lịch/email/danh bạ đã tải trên máy, **job và sổ tiền giữ nguyên**.
9. **CloudKit (Nấc 2) chỉ là placeholder `not-configured`** — kế hoạch này KHÔNG test đồng bộ CloudKit.
10. **Khoá:** cờ `troLyXeo.lock`; rời app (ẩn màn hình) **hơn 2 phút** thì tự khoá lại, mở bằng Face ID hoặc PIN dự phòng. Quên cả Face ID lẫn PIN thì phải xoá dữ liệu web mới vào lại được — vì vậy **luôn tải bản sao lưu trước khi test khoá**.
11. **Sao lưu v1 là file JSON tải về máy** (`fotobro-sao-luu.json`), mở lại bằng nút "Mở bản sao lưu" — file sai định dạng thì app báo "File này không giống bản sao lưu của FotoBro" và **không xoá** dữ liệu hiện có.
12. **Nhắc trong app (local notification, không server):** nhắc chụp trước giờ chụp (mặc định 12 tiếng, tuỳ chọn 1 giờ / 12 giờ / 24 giờ trong Cài đặt → Nhắc nhở), nhắc hạn giao, nhắc job kẹt, nhắc sao lưu. Nhắc Google Lịch là bổ sung (VALARM 12 tiếng + 60 phút), không thay nhắc trong app.
13. **Giọng nói — CÓ ĐIỀU KIỆN.** Plugin native `@capacitor-community/speech-recognition` chưa chắc có ở v1 (thiếu Package.swift, có thể dời sang v1.1). Nếu bản TestFlight không có nút mic thì E2E-10 ghi ⏭️ BỎ QUA toàn mục giọng nói.
14. **Cá nhân hoá v1 (4 nhóm):** (1) màu chủ đề 3 preset Ấm / Tối giản / Tối; (2) logo studio; (3) sửa mẫu tin nhắn/email (5 mẫu: confirm / deposit / remind / deliver / balance) + khôi phục gốc từng mẫu; (4) ngôn ngữ Việt/Anh (chỉ nhãn chính) + tiền tệ VND/USD (**chỉ đổi hiển thị, không quy đổi tỷ giá**).

## Quy ước chung cho mọi luồng

- **Dữ liệu test là hư cấu.** Chỉ dùng khách test dưới đây, không nhập job/ảnh/tiền thật của khách. Test xong dọn theo E2E-11.
- **Tài khoản Google test riêng**, không dùng tài khoản Google chính có mail khách quan trọng.
- **Ghi kết quả mỗi bước:** ✅ ĐẠT (đúng cột "Kết quả kỳ vọng") / ❌ KHÔNG (sai hoặc không làm được — bắt buộc ghi vào bảng lỗi cuối file, kèm đúng chữ app hiện + các bước làm lại được + ảnh chụp màn hình) / ⏭️ BỎ QUA (chỉ cho các luồng ghi "có điều kiện").
- **Mức độ lỗi:** Chặn = không test tiếp được / mất dữ liệu; Nặng = tính năng chính không làm được; Nhẹ = chữ sai, lệch giao diện, dùng được nhưng khó chịu.
- **Trước mỗi phiên test:** tải 1 bản sao lưu sạch (E2E-09) để luôn có đường về.
- **Cách kiểm tra** trong mỗi bảng là cách xác minh độc lập (mở lại màn khác, tắt/mở app, đối chiếu Lịch iPhone / Files / Google Lịch thật), không chỉ "nhìn thấy thì cho qua".

## Dữ liệu mẫu dùng chung cho mọi luồng

Đặt trước trong E2E-02 (Cài đặt → Thông số của bạn). Dùng đúng các giá trị này trong toàn bộ kế hoạch để các luồng nối nhau được:

| Hạng mục | Giá trị test |
|---|---|
| Tên / studio / Instagram | Tên: Test FotoBro · Studio: Studio Test · Instagram: @test.fotobro |
| Giá digital | Portrait 2.500.000 · Couple 4.000.000 · Wedding 15.000.000 · Lookbook 8.000.000 · Event 5.000.000 |
| Giá film | Portrait 1.000.000 · Couple 1.500.000 · Wedding 5.000.000 · Lookbook 2.000.000 · Event 1.500.000 |
| % cọc / hạn giao | 40% / 14 ngày (mặc định, không đổi) |
| Khách chính (luồng hạnh phúc) | "Test Portrait" — Portrait, Digital, ngày chụp = ngày mai 07:00, địa điểm "Studio test", giá 2.500.000 |
| Khách phụ | "Test Wedding" — Wedding, Digital, ngày chụp = ngày kia 09:00, giá 15.000.000; "Test Couple" — Couple, Film, giá 1.500.000; "Test Lookbook" — Lookbook, Cả hai, giá 10.000.000 (8.000.000 + 2.000.000); "Test Event" — Event, Digital, giá 5.000.000 |
| PIN test (ghi ra giấy) | 1234 |
| Sự kiện Lịch iPhone tạo sẵn | "Chụp Test Lịch" ngày mai 09:00, địa điểm "Studio test" + 1 sự kiện ngày kia 14:00 |

Ngày trong kế hoạch viết tương đối ("ngày mai", "ngày kia") theo ngày test thực tế; người test tự đổi thành ngày dương lịch khi ghi chép.

---

## E2E-01 — Mở app lần đầu: onboarding → sổ trống → 5 tab

**Mục đích:** xác nhận cài đặt TestFlight sạch, onboarding đúng 3 màn + form thông tin, vào được Hôm nay với sổ trống (không còn job mẫu / ảnh mẫu của bản Trợ lý Xèo cũ).
**Điều kiện tiên quyết:** chưa từng cài FotoBro trên iPhone này (nếu đã cài: xoá app rồi cài lại từ TestFlight để test đúng "lần đầu").

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 1.1 | Mở link mời TestFlight trên iPhone, cài app TestFlight (nếu chưa có), bấm Cài đặt FotoBro, chờ tải xong, bấm Mở | — | App mở lên, không crash ở màn hình đầu, không màn hình trắng đứng | Quan sát màn đầu; khoá màn hình rồi mở lại vẫn vào được |
| 1.2 | Xem màn chào / onboarding, bấm qua cả 3 màn (Hôm nay / Một job 8 bước / Tiền và lịch), mỗi màn có nút Bỏ qua | — | Đủ 3 màn, đúng thứ tự, bấm Bỏ qua ở màn bất kỳ thì sang được form thông tin | Vuốt/bấm qua từng màn, thử nút Bỏ qua ở màn 2 |
| 1.3 | Ở form cuối: nhập tên/studio/Instagram test, **để trống bảng giá** rồi bấm tiếp (hoặc chọn "Bắt đầu sổ trống — dùng thật") | Tên: Test FotoBro · Studio: Studio Test | Vào được màn Hôm nay, sổ trống, **không còn job mẫu / ảnh mẫu** của bản cũ; có banner "dùng thật" hoặc tương đương | Màn Hôm nay không hiện job lạ; tab Buổi chụp trống; tab Tiền bạc trống |
| 1.4 | Vuốt/bấm qua 5 tab dưới | — | Đủ 5 tab theo đúng tên trong code: **Hôm nay, Buổi chụp, Tiền bạc, Phòng ban, Trợ lý**; chữ không bị cắt ở tai thỏ / Dynamic Island; tab đang chọn tô sáng | Bấm từng tab, chụp ảnh tab bar; **đối chiếu với CHECKLIST §0.4** — nếu bản TestFlight hiện tên tab khác (vd: "Sổ tiền", "Cài đặt") thì ghi ❌ và ghi rõ tên thấy được |
| 1.5 | Dùng app 5 phút bình thường (mở các tab, mở chi tiết trống), khoá màn hình rồi mở lại | — | Không crash, không tự đăng xuất, không mất trạng thái onboarding | Lặp lại 1.4 sau khi mở lại |

**Tiêu chí đạt:** 1.1–1.5 đều ✅. Lỗi Chặn nếu crash ở màn đầu hoặc kẹt ở onboarding không vào được Hôm nay.

## E2E-02 — Cài đặt nền tảng: giá, cọc, hạn giao, tên studio (điều kiện tiên quyết cho mọi luồng sau)

**Mục đích:** đặt dữ liệu nền để các luồng sau kiểm tra được "giá tự điền đúng bảng giá" (vì mặc định giá = 0, xem §0.1).
**Điều kiện tiên quyết:** đã xong E2E-01.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 2.1 | Phòng ban → Thông số của bạn → nhập bảng giá digital + film theo bảng dữ liệu mẫu | Portrait 2.500.000 / film 1.000.000; Couple 4.000.000 / 1.500.000; Wedding 15.000.000 / 5.000.000; Lookbook 8.000.000 / 2.000.000; Event 5.000.000 / 1.500.000 | Lưu được, mở lại vẫn thấy đúng 10 con số | Tắt app hoàn toàn (vuốt khỏi đa nhiệm) rồi mở lại, mở Thông số kiểm tra lại |
| 2.2 | Kiểm tra % cọc và hạn giao | 40% / 14 ngày | Hiện đúng mặc định 40% và 14 ngày, không cần sửa | Đối chiếu ô nhập trong cùng màn Thông số |
| 2.3 | Kiểm tra tên/studio/Instagram đã nhập ở onboarding | Tên: Test FotoBro · Studio: Studio Test | Màn Hôm nay chào bằng tên mới, không còn "bạn" chung chung hay tên cũ | Ra màn Hôm nay đọc lời chào |

**Tiêu chí đạt:** 2.1–2.3 đều ✅. Nếu giá không lưu được sau khi tắt/mở app → lỗi Nặng (mọi luồng tiền sau đó đều sai).

## E2E-03 — LUỒNG CHÍNH: một job đi trọn 8 bước từ Tư vấn tới Xong ⭐

**Mục đích:** luồng hạnh phúc quan trọng nhất — tạo job, nhảy bước, ghi cọc, chụp, giao ảnh, thu nốt, xong; tiền thu đủ thì mới được xong.
**Điều kiện tiên quyết:** đã xong E2E-02. Đây là luồng duy nhất bắt buộc phải đạt 100% trước khi nộp TestFlight rộng hơn.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 3.1 | Hôm nay → **+ Thêm job** (Buổi chụp mới): khách "Test Portrait", loại Portrait, Chụp bằng Digital, ngày chụp ngày mai 07:00, địa điểm "Studio test", bấm Thêm/Lưu | Như cột dữ liệu mẫu | Job được tạo, **giá tự điền 2.500.000** (bảng giá digital Portrait), job nằm ở bước **Tư vấn**, thanh tiến độ 1/8 | Mở chi tiết job đọc giá + bước; mở tab Buổi chụp thấy job ở nhóm Tư vấn |
| 3.2 | Trong chi tiết job, bấm **Xong bước này** (hoặc nút chuyển bước) | — | Job sang **Chốt cọc**; app mở sẵn form ghi khoản thu cọc với số gợi ý **1.000.000** (= 40% × 2.500.000) | Đọc số gợi ý trong form; thanh tiến độ 2/8 |
| 3.3 | Ghi khoản thu cọc 1.000.000, lưu | Thuộc loại "Cọc", gắn đúng job "Test Portrait" | Lưu được; chi tiết job hiện **đã thu 1.000.000 / còn thiếu 1.500.000** | Mở lại chi tiết job; sang tab Tiền bạc thấy khoản thu 1.000.000 đúng ngày, đúng job |
| 3.4 | Chạm thẳng vào chấm/bước **Hậu kỳ** trên thanh tiến độ (nhảy bước, bỏ qua Sắp chụp → Đã chụp → Chọn ảnh) | — | Job nhảy thẳng tới **Hậu kỳ**; app có hỏi xác nhận vì nhảy qua bước chưa xong (nếu có hỏi thì bấm Đồng ý); dữ liệu job và khoản cọc không mất | Đọc bước hiện tại trong chi tiết job; kiểm tra lại đã thu/còn thiếu vẫn 1.000.000 / 1.500.000 |
| 3.5 | Từ Hậu kỳ, chạm bước **Sắp chụp** để lùi lại, rồi đi lần lượt Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ | — | Mỗi bước chuyển đúng, không kẹt, không mất tiền/ảnh đã ghi; lùi bước không xoá dữ liệu | Đi từng bước, mỗi lần đọc lại tên bước + số tiền đã thu |
| 3.6 | Ở bước **Đã giao**: chuyển job sang Đã giao | — | App **nhắc thu nốt** số còn thiếu 1.500.000 (dòng nhắc / gợi ý gửi email báo khách nếu có); job hiện "còn thiếu 1.500.000" | Đọc màn Hôm nay: có dòng nhắc tiền của job này; mở chi tiết job thấy nhắc thu nốt |
| 3.7 | Ghi thêm khoản thu 1.500.000 cho job (loại "Tiền sau khi giao ảnh") | 1.500.000 | **Còn thiếu về 0**, job không còn hiện "thiếu tiền"; tổng đã thu = 2.500.000 = đúng giá | Chi tiết job: đã thu 2.500.000 / còn thiếu 0; tab Tiền bạc cộng đúng |
| 3.8 | Chuyển job sang bước cuối **Xong** | — | Job sang Xong bình thường (đã thu đủ nên **không** có cảnh báo thiếu tiền); job biến mất khỏi danh sách đang chạy, còn xem được trong danh sách đã xong / chi tiết | Tab Buổi chụp: job không còn ở pipeline đang chạy; lọc bước "Xong" thấy job |
| 3.9 | Mở lại job đã Xong, kiểm tra toàn bộ hồ sơ | — | Đủ: tên, loại + Digital, ngày/giờ/địa điểm, giá 2.500.000, đã thu 2.500.000, còn thiếu 0, lịch sử 8 bước | Đối chiếu từng trường với dữ liệu đã nhập ở 3.1–3.7 |

**Tiêu chí đạt:** 3.1–3.9 đều ✅. Lỗi Chặn nếu: giá không tự điền, cọc không ghi được, nhảy bước kẹt/mất tiền, hoặc job thu đủ mà vẫn báo thiếu tiền ở bước Xong.

## E2E-04 — Nhánh rẽ của pipeline: thiếu tiền khi xong, huỷ/khôi phục, job kẹt, lọc theo bước

**Mục đích:** kiểm tra các khóa an toàn và trạng thái phụ của pipeline, dùng job phụ để không làm bẩn job chính ở E2E-03.
**Điều kiện tiên quyết:** đã xong E2E-02 (E2E-03 không bắt buộc, nhưng nên chạy trước để có job Xong để đối chiếu).

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 4.1 | Tạo job "Test Wedding" (Wedding, Digital, ngày kia 09:00, giá 15.000.000), đi nhanh tới Chốt cọc, chỉ ghi cọc 1.000.000 (không phải 40% = 6.000.000), rồi nhảy thẳng tới **Xong** | Cọc 1.000.000 / giá 15.000.000 | App hiện **cảnh báo còn thiếu 14.000.000** và hỏi xác nhận — **không cho xong lặng lẽ**; nếu bấm Huỷ thì job ở nguyên bước cũ | Đọc đúng chữ cảnh báo + con số 14.000.000; bấm Huỷ, kiểm tra bước job không đổi |
| 4.2 | Vẫn job 4.1: xác nhận xong dù thiếu tiền (nếu app cho phép sau cảnh báo) | — | Job sang Xong nhưng vẫn ghi rõ còn thiếu 14.000.000; màn Hôm nay / Sổ tiền vẫn nhắc khoản thiếu này | Mở chi tiết job đã Xong đọc "còn thiếu"; kiểm tra tab Tiền bạc |
| 4.3 | Tạo job "Test Couple" (Couple, Film, giá 1.500.000), mở chi tiết → **Huỷ job** (Không chốt) | — | Job chuyển sang **Đã huỷ**, biến mất khỏi pipeline đang chạy; tiền và lịch (nếu có) giữ nguyên, không bị xoá theo | Tab Buổi chụp không còn job trong danh sách đang chạy; lọc "Đã huỷ" (nếu có) thấy job |
| 4.4 | Mở job đã huỷ → **Khôi phục về "Tư vấn"** | — | Job về lại **Tư vấn**, nằm lại trong pipeline đang chạy, dữ liệu (giá, ngày, loại Film) còn nguyên | Đọc bước + giá + loại trong chi tiết job sau khôi phục |
| 4.5 | Tạo 1 job test, để nguyên ở 1 bước quá 7 ngày (sửa ngày tạo/bước về quá khứ nếu app cho, hoặc dùng job có ngày chụp đã qua mà vẫn ở Tư vấn/Chốt cọc/Sắp chụp) | Job "Test Kẹt": ngày chụp hôm qua, vẫn ở Tư vấn | App hiện cảnh báo **"Kẹt ở Tư vấn"** trong chi tiết job và 1 dòng nhắc "Job kẹt: …" trên màn **Hôm nay** | Đọc thẻ đỏ trong chi tiết job + dòng nhắc ở Hôm nay; ghi đúng câu chữ app hiện |
| 4.6 | Lọc danh sách job theo từng bước (chips Tư vấn / Chốt cọc / … / Xong) | Các job ở 4.1–4.5 | Mỗi bộ lọc chỉ hiện đúng job ở bước đó; số đếm trên chip đúng | Bấm từng chip, đếm job hiện ra và đối chiếu với bước thật của từng job |
| 4.7 | Tạo job "Test Lookbook" (Lookbook, **Cả hai**, giá kỳ vọng 10.000.000) và 1 job "Test Event" (Event, Digital, 5.000.000) | Lookbook Cả hai: digital 8.000.000 + film 2.000.000 | Job Lookbook ghi "Cả hai", giá tự điền **10.000.000**; job Event giá 5.000.000 | Đọc giá + nhãn loại trong chi tiết từng job |
| 4.8 | Kiểm tra trường hợp "Cả hai" khi thiếu một bảng giá: tạm sửa giá film Lookbook về 0 trong Cài đặt, tạo job Lookbook "Cả hai" mới | Giá film Lookbook = 0 | Giá job trả về **0 / để trống** cho tự gõ (theo code), **không crash, không tự đoán** thành 8.000.000 | Đọc ô giá trong form tạo job; sau đó **đặt lại giá film Lookbook = 2.000.000** để các luồng sau không sai |

**Tiêu chí đạt:** 4.1–4.8 đều ✅. Lỗi Nặng nếu: xong khi thiếu tiền mà không cảnh báo; huỷ/khôi phục làm mất tiền hoặc mất job; job kẹt không hiện nhắc.

## E2E-05 — Sổ tiền và báo cáo: thu, chi, báo cáo ngày/tuần/tháng

**Mục đích:** kiểm tra sổ tiền độc lập với pipeline — thu/chi ghi đúng, báo cáo cộng đúng.
**Điều kiện tiên quyết:** đã xong E2E-03 (đã có thu cọc 1.000.000 + thu nốt 1.500.000 của job "Test Portrait").

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 5.1 | Tab Tiền bạc → ghi 1 khoản **chi** gắn vào job "Test Portrait": thuê lens 500.000 | Chi 500.000, gắn job "Test Portrait" | Khoản chi hiện đúng job, đúng ngày, đúng số tiền | Mở chi tiết job thấy khoản chi; mở tab Tiền bạc thấy dòng chi |
| 5.2 | Ghi 1 khoản thu **không gắn job nào** (thu chung, vd: bán ảnh lẻ 300.000) | Thu 300.000, không gắn job | Ghi được; báo cáo vẫn cộng đúng | Tab Tiền bạc thấy dòng thu chung; báo cáo ngày cộng thêm 300.000 |
| 5.3 | Xem báo cáo **ngày / tuần / tháng** | Đã có: thu 1.000.000 + 1.500.000 (job Portrait) + 300.000 (thu chung) + cọc 1.000.000 job Wedding (nếu đã ghi ở E2E-04) = tổng thu; chi 500.000 | Tổng thu, tổng chi, còn thiếu tính **đúng** với các khoản đã ghi; chuyển đổi ngày/tuần/tháng thì số liệu đổi theo đúng kỳ | Tự cộng tay trên giấy rồi đối chiếu từng con số trong báo cáo; chụp ảnh báo cáo tháng |
| 5.4 | Mở job đã Xong ("Test Portrait") từ tab Tiền bạc | — | Thấy đúng lịch sử thu/chi của job, không lẫn khoản của job khác | Đối chiếu từng dòng thu/chi với 3.3, 3.7, 5.1 |

**Tiêu chí đạt:** 5.1–5.4 đều ✅. Lỗi Nặng nếu báo cáo cộng sai hoặc khoản chi gắn nhầm job.

## E2E-06 — Lịch iPhone native: nhập 1 chạm + xuất lịch (chỉ iPhone thật)

**Mục đích:** kiểm tra nhập/xuất Lịch iPhone qua EventKit — tính năng chỉ có trên app iOS thật.
**Điều kiện tiên quyết:** đã tạo sẵn 2 sự kiện trong app Lịch iPhone trước khi test (xem bảng dữ liệu mẫu). Đã xong E2E-01.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 6.1 | Tạo sẵn trong app Lịch iPhone: "Chụp Test Lịch" ngày mai 09:00 (có địa điểm "Studio test") + 1 sự kiện ngày kia 14:00 | Như cột dữ liệu mẫu | Cả 2 sự kiện có trong Lịch iPhone | Mở app Lịch iPhone kiểm tra trực tiếp |
| 6.2 | FotoBro → Phòng ban → **Nhập từ Lịch iPhone** (lần đầu) | — | App hỏi quyền truy cập Lịch — bấm **Cho phép**; sau đó sự kiện 30 ngày tới tự thành buổi chụp trong FotoBro (đúng tên, ngày, giờ, địa điểm) | Mở tab Buổi chụp tìm "Chụp Test Lịch"; mở chi tiết đối chiếu ngày/giờ/địa điểm với app Lịch |
| 6.3 | Bấm **Nhập từ Lịch iPhone** lần 2 (khi sự kiện đã thành job) | — | **Không tạo job trùng** — sự kiện đã nhập không nhập lại lần nữa | Đếm số job "Chụp Test Lịch" trong tab Buổi chụp (phải = 1) |
| 6.4 | Từ chối quyền Lịch: Cài đặt iPhone → FotoBro → Lịch → tắt, rồi bấm nhập lại trong app | — | App báo rõ "chưa cho phép đọc Lịch" + hướng dẫn bật lại, **không crash, không tạo job rác**; sau đó bật lại quyền | Đọc đúng chữ app báo; kiểm tra tab Buổi chụp không có job rác mới |
| 6.5 | Mở chi tiết job "Test Portrait" (có ngày chụp ngày mai 07:00) → bấm **Thêm vào Lịch iPhone** | — | iPhone tự mở app Lịch với sự kiện đã điền sẵn (tên job, ngày, giờ, địa điểm); bấm Thêm trong app Lịch → sự kiện có trong Lịch iPhone, đúng giờ, nhắc trước 12 tiếng | Kiểm tra trong app Lịch iPhone: tên + giờ + địa điểm + nhắc 12 tiếng |
| 6.6 | Mở 1 job chưa có ngày chụp → tìm nút Thêm vào Lịch | Job tạo ở CHECKLIST 1.6 (không ngày chụp) | App báo "job chưa có ngày chụp", không tạo sự kiện rỗng / file rỗng | Đọc đúng chữ app báo; mở app Lịch kiểm tra không có sự kiện rác |

**Tiêu chí đạt:** 6.1–6.6 đều ✅. Lỗi Nặng nếu: nhập trùng job, nhập sai giờ (lệch múi giờ), hoặc xuất lịch tạo sự kiện sai ngày.

## E2E-07 — Đăng nhập Google 1 chạm — CÓ ĐIỀU KIỆN

> Chỉ chạy khi bản TestFlight đã dán Client ID Google chung vào `fotobro-config.js`. Mở đầu phiên: vào Cài đặt → xem nút Đăng nhập Google — nếu app báo "chưa sẵn sàng" thì ghi ⏭️ BỎ QUA toàn bộ E2E-07, không ghi lỗi, chuyển sang E2E-08.

**Mục đích:** người dùng chỉ đăng nhập Google là có hết (Lịch, Gmail tiền về, Danh bạ, Drive) mà không tự tạo Cloud project hay dán Client ID.
**Điều kiện tiên quyết:** Client ID đã có trong bản TestFlight; dùng tài khoản Google test riêng.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 7.1 | Cài đặt → **Đăng nhập Google** | Tài khoản Google test | Mở **trình duyệt hệ thống (Safari)** sang trang đăng nhập Google — **KHÔNG** đăng nhập trong khung WebView của app | Quan sát: thấy Safari mở ra ngoài app, URL là accounts.google.com |
| 7.2 | Đăng nhập tài khoản test, cho phép đủ quyền 1 lần | — | Tự quay lại app, hiện "Đã kết nối Google"; **không bắt dán Client ID hay tự tạo Cloud project** | Đọc trạng thái trong Cài đặt sau khi quay lại app |
| 7.3 | Tab Buổi chụp → Lịch: xem lịch Google | Tài khoản test có sẵn 1–2 sự kiện 30 ngày tới | Hiện sự kiện Google Lịch 30 ngày tới, có nhãn "Google"; chạm vào 1 sự kiện → tạo được buổi chụp | Đối chiếu sự kiện trong app với calendar.google.com trên máy tính |
| 7.4 | Sổ tiền: kiểm tra mục **Tiền về từ Gmail** | Hộp thư test có 1 email báo tiền về (chuẩn bị trước) | App tìm được email và gợi ý ghi khoản thu **đúng số tiền**; bấm xác nhận thì ghi được vào sổ | Đối chiếu số tiền gợi ý với email gốc trong Gmail |
| 7.5 | Trong chi tiết job có ngày → **Thêm vào Google Lịch** (hoặc Cập nhật trên Google Lịch nếu đã có) | Job "Test Portrait", ngày mai 07:00 | Sự kiện xuất hiện trong **Google Lịch thật**, nhắc trước 12 tiếng + 60 phút | Kiểm tra trên calendar.google.com (máy tính), đối chiếu tên/giờ/nhắc |
| 7.6 | Gửi email cho khách bằng Gmail (trong chi tiết job, nếu có nút) | Job "Test Portrait", mẫu deliver/balance | Soạn sẵn đúng mẫu (đúng tên khách, tên studio, logo nếu đã đặt); bấm Gửi thì gửi được, khách nhận đúng nội dung | Kiểm tra hộp thư nhận (tài khoản test thứ hai) đọc đúng nội dung |
| 7.7 | Cài đặt → **Ngắt kết nối Google** | — | Lịch/Gmail/Danh bạ đã tải **bị xoá khỏi máy**, token bị thu hồi tại Google; **job và sổ tiền vẫn giữ nguyên**; sự kiện đã ghi trên Google Lịch vẫn còn (xoá tay trong app Lịch nếu muốn) | Kiểm tra tab Buổi chụp → Lịch trống Google; tab Tiền bạc + job còn nguyên; kiểm tra myaccount.google.com → quyền truy cập bên thứ ba không còn FotoBro |
| 7.8 | Đăng nhập lại sau khi ngắt | Tài khoản Google test | Đăng nhập lại được bình thường, không kẹt ở màn hình cũ | Lặp lại 7.1–7.2 |

**Tiêu chí đạt:** nếu Client ID đã có thì 7.1–7.8 đều ✅. Lỗi Chặn nếu đăng nhập kẹt trong WebView hoặc ngắt kết nối làm mất job/sổ tiền.

## E2E-08 — Khoá Face ID + PIN, tự khoá lại, sao lưu/khôi phục JSON

**Mục đích:** kiểm tra khoá bảo vệ sổ và đường về bằng sao lưu — hai tính năng liên quan trực tiếp tới an toàn dữ liệu.
**Điều kiện tiên quyết:** đã tải 1 bản sao lưu sạch TRƯỚC KHI bật khoá (8.1). PIN test 1234 ghi ra giấy.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 8.1 | Cài đặt → **Tải bản sao lưu** (làm trước mọi bước khoá) | — | Tải được file **`fotobro-sao-luu.json`** về máy | Mở app Files tìm file, kiểm tra tên file + dung lượng > 0 |
| 8.2 | Cài đặt → **Bật khoá Face ID**, đặt mã PIN dự phòng 1234 | PIN 1234 | Bật được, app báo đã bật khoá | Đọc thông báo trong Cài đặt |
| 8.3 | Khoá màn hình iPhone → mở lại FotoBro | — | App hiện màn khoá, mở được bằng **Face ID** | Quan sát màn khoá; Face ID mở được ngay |
| 8.4 | Ở màn khoá → **Dùng mã PIN**, nhập đúng 1234 | PIN 1234 | Mở được app | Khoá màn hình lại, mở app, chọn PIN, nhập 1234 |
| 8.5 | Ở màn khoá → nhập sai PIN 1–2 lần (vd: 0000) | PIN sai 0000 | Báo sai, vẫn cho nhập lại (chưa khoá cứng) | Đọc đúng chữ báo sai; nhập lại đúng 1234 mở được |
| 8.6 | Rời app **hơn 2 phút** (mở app khác / khoá màn hình, chờ > 2 phút) rồi mở lại FotoBro | — | App **tự khoá lại**, phải Face ID / PIN mới vào (theo code: ẩn app > 2×60.000ms thì `showLock`) | Bấm giờ: rời app 2 phút 30 giây rồi mở lại, thấy màn khoá |
| 8.7 | Cài đặt → **Tắt khoá Face ID** (nhập PIN 1234 để xác nhận) | PIN 1234 | Tắt được, mở app lại không còn màn khoá | Khoá màn hình rồi mở lại app: vào thẳng Hôm nay |
| 8.8 | Tạo thêm 1 job test + 1 khoản thu test **sau** khi tải sao lưu ở 8.1 | Job "Test Sau Sao Lưu" + thu 100.000 | Job/khoản mới có trong app | Tab Buổi chụp + Tiền bạc thấy dữ liệu mới |
| 8.9 | Cài đặt → **Mở bản sao lưu** → chọn file ở 8.1 → **Thay bằng bản sao lưu** | File `fotobro-sao-luu.json` ở 8.1 | App về đúng trạng thái lúc 8.1: job/khoản ở 8.8 **biến mất**, dữ liệu cũ còn nguyên | Đếm job + khoản trước/sau khôi phục, đối chiếu với trạng thái lúc 8.1 |
| 8.10 | Mở 1 file **không phải** bản sao lưu (vd: ảnh .jpg) bằng nút Mở bản sao lưu | File ảnh .jpg | App báo "không giống bản sao lưu", **không xoá** dữ liệu hiện có | Đọc đúng chữ app báo; kiểm tra job/sổ tiền còn nguyên |

**Tiêu chí đạt:** 8.1–8.10 đều ✅. ⚠️ **Không test nhập sai PIN 5 lần liên tiếp** (theo CHECKLIST §8.7: sai 5 lần sẽ bị khoá chờ tăng dần — không test tới mức này nếu không có bản sao lưu). Lỗi Chặn nếu: khôi phục sao lưu làm mất dữ liệu cũ, hoặc file lạ làm mất dữ liệu hiện có.

## E2E-09 — Hôm nay, nhắc lịch, offline, hiển thị

**Mục đích:** kiểm tra màn Hôm nay tổng hợp đúng, nhắc trong app đúng giờ, app chạy offline (local-first), hiển thị đúng trên iPhone thật.
**Điều kiện tiên quyết:** đã có job "Test Portrait" (ngày mai 07:00), job "Test Wedding" (ngày kia), job kẹt (E2E-04.5), khoản thiếu tiền (E2E-04.1).

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 9.1 | Màn **Hôm nay**: kiểm tra buổi chụp hôm nay/ngày mai, job kẹt, tiền về chờ ghi | Job Portrait ngày mai, job kẹt, job Wedding còn thiếu 14.000.000 | Hiện đúng: buổi chụp ngày mai, dòng "Job kẹt", dòng nhắc tiền thiếu; **không** hiện job đã Xong / đã huỷ | Đọc từng dòng trên Hôm nay, đối chiếu với tab Buổi chụp + Tiền bạc |
| 9.2 | Nhắc trước buổi chụp: tạo job chụp **ngày mai 07:00**, để app chạy nền tới giờ nhắc (mặc định 12 tiếng trước = tối nay 19:00) | Job "Test Nhắc" ngày mai 07:00 | Hiện nhắc (local notification) đúng giờ đã đặt; ghi rõ có/không có nhắc + đúng giờ hay lệch bao nhiêu | Ghi lại giờ nhắc thực tế so với giờ kỳ vọng; kiểm tra Cài đặt → Nhắc nhở đang đặt 12 giờ |
| 9.3 | Đổi Nhắc nhở sang **1 giờ** trong Cài đặt, tạo job chụp sau 2 giờ nữa, chờ nhắc | — | Nhắc tới trước giờ chụp 1 giờ (không còn 12 giờ); đổi lại 12 giờ sau khi test xong | Ghi giờ nhắc thực tế; đổi lại mặc định 12 giờ |
| 9.4 | Bật **chế độ máy bay** (mất mạng) rồi dùng app: mở job, ghi tiền, đổi bước | — | Dùng bình thường offline (Nấc 1 local-first); chỉ Google/Lịch Google là không tải được, app báo rõ | Thử đủ 3 thao tác offline; tắt máy bay, kiểm tra dữ liệu vừa ghi còn nguyên |
| 9.5 | Cuộn danh sách job dài (đã có ≥ 10 job test) | ≥ 10 job | Cuộn mượt, không giật, không đứng app | Cuộn nhanh lên/xuống 3 lần |
| 9.6 | Xoay ngang iPhone (nếu app cho xoay) hoặc dùng iPhone cỡ nhỏ; kiểm tra chữ tiếng Việt có dấu | "Chốt cọc", "Đã giao", "Buổi chụp" | Chữ/nút không tràn, không bị che bởi tai thỏ / nút Home ảo; không lỗi font, không mất dấu | Chụp ảnh màn hình ngang + dọc |
| 9.7 | Mở app bằng VoiceOver 1 phút (Cài đặt iPhone → Trợ năng) — chỉ test nhanh | — | Các nút chính đọc được tên, không phải "button" trống | Bật VoiceOver, chạm 5 nút chính ghi lại câu đọc được |

**Tiêu chí đạt:** 9.1–9.7 đều ✅ (9.2/9.3 cho phép ghi "không có nhắc" kèm giờ thực tế nếu notification chưa tới — nhưng đó là ❌ Nặng nếu đã bật quyền nhắc mà tới giờ vẫn không nhắc).

## E2E-10 — Cá nhân hoá chung + giọng nói (giọng nói CÓ ĐIỀU KIỆN)

**Mục đích:** kiểm tra 4 nhóm cá nhân hoá v1 và giọng nói (nếu có mic ở bản TestFlight).
**Điều kiện tiên quyết:** đã xong E2E-02.

| # | Bước | Dữ liệu mẫu | Kết quả kỳ vọng | Cách kiểm tra |
|---|---|---|---|---|
| 10.1 | Cài đặt → **Màu chủ đề**: đổi sang preset Tối giản, rồi sang Tối (dark) | — | Toàn app đổi màu nhấn + nền theo preset ngay; chữ vẫn đọc được cả 2 chế độ | Chụp ảnh 3 preset; quay lại preset Ấm (mặc định) |
| 10.2 | Bật dark mode của iPhone (Cài đặt iPhone → Màn hình → Tối), mở app | — | App nền đen, chữ trắng/xám sáng, không có chữ xám mờ khó đọc, ảnh/tab vẫn thấy rõ | Chụp ảnh dark mode hệ thống |
| 10.3 | Cài đặt → thêm **logo studio** (chọn 1 ảnh từ máy) | Ảnh logo test | Logo hiện trên màn hình **Hôm nay** và ở đầu email gửi khách (xem E2E-07.6 nếu có Google); chưa có logo thì hiện chữ FotoBro như cũ | Màn Hôm nay thấy logo; xoá logo thì về chữ FotoBro |
| 10.4 | Cài đặt → **Mẫu tin nhắn/email**: sửa 1 mẫu (đổi câu chào theo giọng mình), lưu, mở lại | Mẫu "confirm": đổi câu chào | Mẫu đã sửa được lưu, dùng khi nhắn/gửi mail cho khách | Mở chi tiết job → xem trước email thấy câu chào mới |
| 10.5 | Trong mẫu vừa sửa → **Khôi phục mẫu gốc** | — | Mẫu về lại câu gốc ban đầu, **chỉ mẫu đó** bị khôi phục (các mẫu khác giữ nguyên) | Đối chiếu 5 mẫu sau khôi phục |
| 10.6 | Cài đặt → **Ngôn ngữ: English** | — | Nhãn chính (tab, Hôm nay, form job, Cài đặt) đổi sang tiếng Anh; ghi lại phần nào vẫn còn tiếng Việt | Chụp ảnh từng tab bằng tiếng Anh |
| 10.7 | Cài đặt → **Tiền tệ: USD** | Giá Portrait 2.500.000 | Số tiền hiển thị dạng USD (**chỉ đổi hiển thị, không quy đổi tỷ giá** — kiểm tra 2.500.000 không bị đổi thành số USD sai) | Đọc giá job Portrait ở chế độ USD; đổi lại VND ngay sau đó |
| 10.8 | Đổi lại ngôn ngữ Việt + tiền tệ VND | — | App về lại như cũ, không mất dữ liệu | Kiểm tra lại giá + job + sổ tiền |
| 10.9 | Cài đặt → sửa **bảng giá** 1 gói (Portrait digital 3.000.000, film 1.000.000) rồi tạo job mới loại đó | Job "Test Giá Mới", Portrait | Job mới lấy giá mới 3.000.000; **job cũ giữ giá cũ 2.500.000**; sau đó đặt lại Portrait digital = 2.500.000 | Đối chiếu giá job mới vs job "Test Portrait" cũ |
| 10.10 | Tắt app hoàn toàn (vuốt khỏi đa nhiệm) rồi mở lại | — | Màu chủ đề, logo, ngôn ngữ, tiền tệ, tên studio, bảng giá đã đổi vẫn còn — không về mặc định | Kiểm tra lại từng mục 10.1–10.9 sau khi mở lại |
| 10.11 | **Giọng nói — CÓ ĐIỀU KIỆN:** màn Hôm nay → bấm mic, nói tiếng Việt: "Thêm job Portrait cho Test Mic ngày mai" | Câu nói mẫu | App hiện đúng chữ đã nghe, **hỏi xác nhận trước khi tạo** (màn xác nhận có nút Làm đi / Nói lại / Sửa); bấm Làm đi thì tạo được job | Đọc chữ app nghe được, đối chiếu với câu đã nói; kiểm tra job được tạo đúng loại + ngày |
| 10.12 | **Giọng nói — CÓ ĐIỀU KIỆN:** từ chối quyền mic lần đầu (bấm Không cho phép), bấm mic lại | — | App báo cần quyền mic + hướng dẫn bật, không crash | Đọc đúng chữ app báo |
| 10.13 | **Giọng nói — CÓ ĐIỀU KIỆN:** nói ở nơi ồn 1 lệnh đơn giản | — | Ghi lại có nghe đúng không; nếu sai thì ghi rõ câu nói và chữ app nghe được | Ghi chép câu nói vs chữ nhận được |

**Tiêu chí đạt:** 10.1–10.10 đều ✅; 10.11–10.13 ⏭️ BỎ QUA toàn bộ nếu bản TestFlight không có nút mic (ghi rõ lý do), hoặc ✅ nếu mic có và nghe đúng.

## E2E-11 — Dọn dẹp sau test + tổng kết

| # | Bước | Kết quả kỳ vọng |
|---|---|---|
| 11.1 | Xoá hết job test / khoản test, hoặc **Mở bản sao lưu** sạch (bản ở E2E-08.1) để khôi phục sổ thật | Sổ sạch, không còn dữ liệu test |
| 11.2 | Tắt khoá Face ID test (nếu không muốn dùng tiếp) hoặc giữ nguyên theo ý mình | Đã quyết định rõ, ghi lại |
| 11.3 | Đặt lại nhắc nhở 12 giờ, ngôn ngữ Việt, tiền tệ VND, preset Ấm, bảng giá về giá thật của studio | App về trạng thái dùng thật |
| 11.4 | Tổng hợp vào bảng lỗi + tổng kết cuối file: tổng số bước ĐẠT / KHÔNG / BỎ QUA | Đã tổng hợp, ký tên người test |

---

## Bảng lỗi (điền khi test)

| # | Luồng / bước | Lỗi thấy được (ghi đúng chữ app hiện + các bước làm lại được) | Ảnh chụp màn hình (có/không) | Mức độ |
|---|---|---|---|---|
| 1 | | | | Chặn / Nặng / Nhẹ |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

## Tổng kết

- Tổng số bước: ____ bước (E2E-01→E2E-11)
- ✅ ĐẠT: ____ bước
- ❌ KHÔNG: ____ bước (liệt kê số bước ở bảng lỗi trên)
- ⏭️ BỎ QUA: ____ bước (lý do: Google chưa có Client ID / mic chưa có ở v1 / …)
- Kết luận: ☐ Đủ để nộp TestFlight rộng hơn / ☐ Cần sửa lỗi chặn trước / ☐ Cần build mới rồi test lại
- Người test ký tên: __________

## Đối chiếu với TESTFLIGHT-CHECKLIST.md (để không test trùng / không sót)

| Mục checklist | Phủ bởi E2E |
|---|---|
| §0 Cài đặt TestFlight | E2E-01 |
| §1 Tạo job mới | E2E-03.1, E2E-04.7–4.8, E2E-06.6 |
| §2 Pipeline 8 bước | E2E-03.2–3.8, E2E-04 |
| §3 Tiền: cọc, thu nốt, chi, báo cáo | E2E-03.2–3.3, 3.6–3.7, E2E-05 |
| §4 Nhập Lịch iPhone native | E2E-06.1–6.4 |
| §5 Xuất lịch sang Lịch iPhone | E2E-06.5–6.6 |
| §6 Đăng nhập Google (có điều kiện) | E2E-07 |
| §7 Cá nhân hoá chung | E2E-10.1–10.10 |
| §8 Khoá Face ID + PIN | E2E-08.2–8.7 |
| §9 Sao lưu & khôi phục | E2E-08.1, 8.8–8.10 |
| §10 Giọng nói (có điều kiện) | E2E-10.11–10.13 |
| §11 Hôm nay, nhắc lịch, hiệu năng, hiển thị | E2E-09 |
| §12 Dọn dẹp sau test | E2E-11 |

## Ghi chú cho người chạy test

- Chạy theo đúng thứ tự E2E-01 → E2E-11: E2E-02 là điều kiện tiên quyết cho E2E-03–E2E-05 và E2E-10; E2E-08.1 (tải sao lưu) phải làm **trước** E2E-08.2 (bật khoá).
- Luồng E2E-03 là luồng bắt buộc đạt 100% trước khi nộp TestFlight rộng hơn; các luồng có điều kiện (E2E-07 Google, E2E-10.11–10.13 mic) được bỏ qua hợp lệ nếu tính năng chưa sẵn sàng ở bản này — nhưng phải ghi rõ lý do bỏ qua, không để trống.
- Hai điểm đã biết trước từ code, không tính là lỗi khi gặp: (1) Google báo "chưa sẵn sàng" khi chưa có Client ID; (2) CloudKit chỉ là placeholder, không test đồng bộ.
- Hai điểm sai lệch đã phát hiện khi đối chiếu checklist với code (cần xác minh lại trên bản TestFlight thật, xem E2E-01.4 và §0.1): tên 5 tab dưới và việc bảng giá mặc định là 0.
