# DEVICE-MATRIX.md — Ma trận máy / iOS cần test: FotoBro iOS v1

- **App:** FotoBro iOS v1.0.0 — Bundle ID `com.fotobro.app`, Capacitor 8
- **Ngày lập:** 20/11/2026
- **Phạm vi:** chỉ ma trận test (máy nào, iOS nào, test gì trên từng cỡ màn). Không sửa code, không phải kết quả test thật.
- **Căn cứ trong repo (đã đọc, không sửa):**
  - `ios/App/App.xcodeproj/project.pbxproj`: `IPHONEOS_DEPLOYMENT_TARGET = 15.0` (4 cấu hình build) → app yêu cầu **iOS 15.0 trở lên**.
  - `README.md`: v1.0.0, base web FotoBro v2.6 tối giản, UI Apple Music (nền trắng sạch + dark mode đen, 1 màu nhấn đỏ `#FA2D48`), 5 tab dưới, pipeline 8 bước, khoá Face ID/PIN, nhập Lịch iPhone native 1 chạm, đăng nhập Google auto 1 chạm, mic dời sang v1.1.
  - `www/index.html`: viewport `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`; tab bar cao `--tabh:50px`; nội dung chừa `env(safe-area-inset-*)`; tiêu đề lớn (Large Title) 34px; nhãn tab 10.5px.
  - `ACCESSIBILITY.md` (đã có sẵn trong repo): 95 chỗ `font-size` dùng `px` (12–42px), 0 chỗ dùng `rem` → bật "Chữ lớn" (Dynamic Type) của iOS thì app không to ra; nút nhảy bước pipeline chỉ 28px (dưới chuẩn chạm 44×44pt của Apple HIG); trắng `#FFFFFF` trên nhấn `#FA2D48` tương phản 3.79:1 (chỉ đạt mức chữ lớn, không đạt AA chữ thường); xám `#636366` trên nền tối `#1C1C1E` chỉ 2.84:1 (không đạt). Đây là các rủi ro phải kiểm riêng theo từng cỡ màn (xem §5).
  - `TESTFLIGHT-CHECKLIST.md` §0.4, §7.2, §8: 5 tab dưới không bị cắt ở tai thỏ / Dynamic Island; dark mode nền đen chữ trắng; khoá Face ID + PIN.

## Cách đọc bảng

- **Points (pt) mới là kích thước layout thật.** Pixels = points × scale. Hai máy cùng points thì layout giống nhau dù inch/pixels khác nhau — chỉ cần test 1 máy đại diện cho mỗi nhóm points.
- **Ưu tiên:** P0 = test trước, chặn submit nếu lỗi; P1 = test sau khi P0 đạt; P2 = test nếu còn máy / còn thời gian, chủ yếu để phủ iOS cũ.
- **iOS trong bảng là "iOS cao nhất / thấp nhất trong phạm vi 15–18"**, không phải iOS cao nhất máy đó chạy được ngoài phạm vi (ví dụ iPhone 11 chạy được iOS mới hơn 18, nhưng ma trận này chỉ tới iOS 18 theo yêu cầu).
- **Không bịa thông số:** inch / points / pixels / scale dưới đây lấy từ bảng Apple HIG (bản lưu trữ) và trang thông số kỹ thuật Apple, đối chiếu qua các nguồn ở §7. Ô nào không chắc chắn thì ghi "—" thay vì đoán.
- **iPad không nằm trong ma trận này** (app v1 là app iPhone; nếu chạy trên iPad thì đó là chế độ tương thích, test riêng sau).

## 1. Ma trận thiết bị theo cỡ màn (dọc, portrait)

| Nhóm | Máy đại diện | Màn hình | Points (rộng × cao) | Pixels (rộng × cao) | Scale | Mở khoá / vùng trên cùng | iOS trong phạm vi 15–18 | Ưu tiên |
|---|---|---|---|---|---|---|---|---|
| **A. Màn nhỏ nhất** | iPhone SE (thế hệ 1, 2016) | 4.0" | 320 × 568 | 640 × 1136 | @2x | Nút Home / Touch ID, không tai thỏ | Chỉ iOS 15 (cao nhất) | P2 |
| **A. Màn nhỏ** | **iPhone SE (thế hệ 2, 2020) / SE (thế hệ 3, 2022)** | 4.7" | 375 × 667 | 750 × 1334 | @2x | Nút Home / Touch ID, không tai thỏ | 15 – 18 | **P0** |
| **B. Hẹp, cao** | iPhone 12 mini / 13 mini | 5.4" | 375 × 812 | 1080 × 2340 * | @3x * | Face ID, tai thỏ | 15 – 18 | P1 |
| **B. Hẹp, cao** | iPhone X / XS / 11 Pro | 5.8" | 375 × 812 | 1125 × 2436 | @3x | Face ID, tai thỏ | X: tới iOS 16; XS / 11 Pro: 15 – 18 | P2 |
| **C. Chuẩn** | **iPhone 12 / 13 / 14, iPhone 16e** | 6.1" | 390 × 844 | 1170 × 2532 | @3x | Face ID, tai thỏ | 12: 15 – 18; 13: 15 – 18; 14: 16 – 18; 16e: 18 | **P0** |
| **C. Chuẩn** | iPhone 15 / 16 | 6.1" | 393 × 852 | 1179 × 2556 | @3x | Face ID, Dynamic Island | 15: 17 – 18; 16: 18 | P1 |
| **C. Chuẩn** | iPhone 14 Pro / 15 Pro | 6.1" | 393 × 852 | 1179 × 2556 | @3x | Face ID, Dynamic Island | 14 Pro: 16 – 18; 15 Pro: 17 – 18 | P1 |
| **C. Chuẩn, cao hơn** | iPhone 16 Pro | 6.3" | 402 × 874 | 1206 × 2622 | @3x | Face ID, Dynamic Island | 18 | P1 |
| **D. Lớn** | iPhone XR / 11 | 6.1" | 414 × 896 | 828 × 1792 | @2x | Face ID, tai thỏ | XR: 15 – 18 (cao nhất 18); 11: 15 – 18 | P1 |
| **D. Lớn** | iPhone XS Max / 11 Pro Max | 6.5" | 414 × 896 | 1242 × 2688 | @3x | Face ID, tai thỏ | XS Max: 15 – 18 (cao nhất 18); 11 Pro Max: 15 – 18 | P2 |
| **D. Lớn** | iPhone 12 Pro Max / 13 Pro Max | 6.7" | 428 × 926 | 1284 × 2778 | @3x | Face ID, tai thỏ | 15 – 18 | P1 |
| **D. Lớn nhất** | **iPhone 14 Pro Max / 15 Pro Max / 15 Plus / 16 Plus** | 6.7" | 430 × 932 | 1290 × 2796 | @3x | Face ID, Dynamic Island | 14 Pro Max: 16 – 18; 15 Pro Max / 15 Plus: 17 – 18; 16 Plus: 18 | **P0** |
| **D. Lớn nhất** | **iPhone 16 Pro Max** | 6.9" | 440 × 956 | 1320 × 2868 | @3x | Face ID, Dynamic Island | 18 | **P0** |

\* iPhone 12 mini / 13 mini: panel 1080 × 2340 nhưng hệ thống render ở 1125 × 2436 rồi thu nhỏ lại (ghi `@3x*` trong bảng HIG). Khi test chỉ cần nhớ: layout tính theo 375 × 812 pt, ảnh chụp màn hình thực tế sẽ là 1080 × 2340 px.

**Ghi chú về "đại diện":** trong mỗi ô points giống nhau, chỉ cần 1 máy thật (hoặc 1 Simulator) là đủ phủ layout — ví dụ iPhone 13 đại diện cho cả nhóm 390 × 844 (12 / 13 / 14 / 16e); iPhone 15 Pro Max đại diện cho nhóm 430 × 932. Đừng test cả 4 máy cùng points chỉ để "cho đủ".

## 2. Ma trận iOS 15 – 18 (máy nào test iOS nào)

Không phải máy nào cũng chạy được mọi iOS 15–18. iOS càng cũ thì càng ít máy còn giữ được — cần giữ lại máy cũ, đừng cập nhật hết lên iOS mới nhất.

| iOS cần test | Máy giữ ở iOS đó (đề xuất) | Vì sao máy này | Ưu tiên |
|---|---|---|---|
| **iOS 15** | iPhone SE (thế hệ 1) hoặc iPhone 7 / 7 Plus — nếu không có, dùng iPhone SE (thế hệ 2) đang ở iOS 15, chưa cập nhật | SE 1 / 6s / 7 dừng ở iOS 15, không lên được cao hơn; SE 2 / iPhone 13 ra mắt cùng iOS 15 | P0 (1 máy) |
| **iOS 16** | iPhone 8 / 8 Plus hoặc iPhone X — nếu không có, dùng iPhone XR / SE 2 đang ở iOS 16 | 8 / X dừng ở iOS 16, không lên được 17 | P1 (1 máy) |
| **iOS 17** | iPhone XR / XS hoặc iPhone 11 / SE 2 đang ở iOS 17 | XR / XS lên được 18 nên phải giữ lại 1 máy ở 17, nếu không sẽ mất phủ iOS 17 | P1 (1 máy) |
| **iOS 18** | iPhone SE 3, iPhone 13/14, iPhone 15/16 (bất kỳ máy P0 nào) | iOS 18 là iOS mới nhất trong phạm vi; mọi máy P0 đều chạy được | **P0 (mọi máy P0)** |

**Quy tắc giữ máy cũ:** trước khi test, ghi lại iOS hiện tại của từng máy vào biên bản test; máy nào đang ở iOS 15/16/17 thì **không cập nhật** cho tới khi xong vòng test iOS đó. iPhone SE (thế hệ 1) và iPhone 7/8/X chỉ có giá trị test khi còn ở iOS cũ — cập nhật lên là mất.

**Ngoài phạm vi v1:** iPhone 17 series / iOS 26 (Apple đổi cách đánh số từ iOS 18 sang iOS 26, không có iOS 19–25) **không** nằm trong ma trận này. Nếu sau này mở rộng, thêm 1 máy iPhone 17 / iOS 26 vào P1.

## 3. Thứ tự test — máy nào trước, máy nào sau

### P0 — Test trước (tối thiểu 4 máy, chặn submit nếu lỗi)

| # | Máy | iOS | Lý do chọn |
|---|---|---|---|
| 1 | **iPhone SE (thế hệ 3, 2022)** | 18 (và 15 nếu giữ được 1 máy SE 2 ở iOS 15) | Màn nhỏ nhất còn bán/chạy được iOS 18; nút Home + Touch ID; mọi lỗi tràn/chữ to/nút nhỏ đều lộ ra ở đây trước tiên |
| 2 | **iPhone 13 (hoặc 14)** | 18 | Cỡ chuẩn phổ biến nhất (390 × 844); tai thỏ + Face ID; đại diện cho đa số người dùng |
| 3 | **iPhone 15 Pro Max (hoặc 14 Pro Max)** | 18 | Màn lớn phổ biến (430 × 932); Dynamic Island; đại diện nhóm Pro Max / Plus |
| 4 | **iPhone 16 Pro Max** | 18 | Màn lớn nhất (440 × 956, 6.9"); nếu không có máy này thì máy #3 làm mốc lớn nhất tạm thời |

**Ngưỡng tối thiểu để submit:** cả 4 máy P0 (hoặc 3 máy nếu thiếu 16 Pro Max) đều **đạt** bộ kiểm tra chung §4 + kiểm tra riêng theo cỡ màn §5. Chỉ 1 máy P0 lỗi chặn (tab bar che nút, form không nhập được, khoá Face ID/PIN không mở được) là dừng, không đẩy sang P1.

### P1 — Test sau (khi P0 đã đạt)

| Máy | iOS | Lý do |
|---|---|---|
| iPhone 12 mini / 13 mini | 18 | Rộng chỉ 375pt nhưng cao 812pt + tai thỏ: khác SE ở safe-area trên/dưới, dễ lộ lỗi tab bar và chữ tab bị cắt |
| iPhone 15 / 16 (hoặc 14 Pro / 15 Pro) | 18 | Nhóm 393 × 852 + Dynamic Island; kiểm tra vùng Dynamic Island có che tiêu đề lớn / nút trên cùng không |
| iPhone 16 Pro | 18 | 402 × 874 — cỡ trung gian mới, giữa chuẩn và Pro Max |
| iPhone 12 Pro Max / 13 Pro Max | 18 | 428 × 926 — nhóm Pro Max đời cũ, vẫn còn nhiều người dùng |
| iPhone XR / 11 | 18 (XR là iOS cao nhất) | 414 × 896 @2x — chữ/ảnh render ở mật độ thấp hơn, dễ lộ chữ mờ, icon vỡ |
| Máy giữ iOS 16 (iPhone 8 / X) và iOS 17 (XR / 11) | 16 / 17 | Phủ iOS cũ theo §2; chỉ cần chạy bộ kiểm tra chung, không cần lặp lại toàn bộ kiểm tra cỡ màn |

### P2 — Test cuối (nếu còn máy / còn thời gian)

iPhone SE (thế hệ 1, iOS 15), iPhone X (iOS 16), iPhone XS / 11 Pro, iPhone XS Max / 11 Pro Max. Chủ yếu để khẳng định "app mở được, dùng được" trên phần cứng cũ nhất còn hỗ trợ iOS 15–18, không yêu cầu hiệu năng mượt như máy mới. Nếu không có máy thật, có thể dùng Simulator cho nhóm này (xem §6).

## 4. Bộ kiểm tra chung — chạy trên MỌI máy, MỌI iOS

(Dùng chung với `TESTFLIGHT-CHECKLIST.md` trong repo; bảng này chỉ nhắc những điểm gắn với máy/iOS, không lặp lại toàn bộ checklist đó.)

| # | Kiểm tra | Đạt khi |
|---|---|---|
| C1 | Cài từ TestFlight, mở lần đầu | Mở được, không crash, màn Hôm nay hiện đủ |
| C2 | 5 tab dưới (Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt) | Bấm được cả 5, nhãn không bị cắt, tab đang chọn thấy rõ |
| C3 | Pipeline 8 bước: nhảy thẳng tới bước bất kỳ, gắn tiền vào bước (Chốt cọc ghi cọc, Đã giao nhắc thu nốt), Huỷ / khôi phục job, job kẹt báo lên Hôm nay | Đủ 4 cải tiến, không kẹt bước |
| C4 | Thêm job, sửa job, máy tính giá (digital / film / cả hai), sổ tiền + báo cáo | Nhập được số tiền, tính đúng, không mất dữ liệu khi tắt app mở lại |
| C5 | Nhắc lịch local (Local Notifications) | Tới giờ nhắc thì có thông báo |
| C6 | Nhập Lịch iPhone native 1 chạm; nút "Thêm vào Lịch iPhone" trong chi tiết job | Xin quyền Lịch 1 lần, sự kiện vào đúng ngày/giờ |
| C7 | Đăng nhập Google auto 1 chạm (khi đã có Client ID chung) | Mở trình duyệt hệ thống, quay lại app bằng deep-link, không kẹt ở trình duyệt |
| C8 | Khoá Face ID / PIN: bật → tắt app → mở lại | Face ID mở được; PIN dự phòng mở được khi Face ID lỗi; tắt khoá được |
| C9 | Sao lưu JSON (xuất / nhập) | File xuất ra mở lại được, nhập lại đủ job + sổ tiền |
| C10 | Xoay ngang (landscape) — chỉ kiểm tra "không vỡ", không yêu cầu layout ngang hoàn hảo | Không có nút/tab bị che khuất hoàn toàn ở ngang; xoay về dọc thì bình thường |
| C11 | Nền tảng: cuộn mượt, không crash khi chuyển tab nhanh, ảnh trang chủ + logo studio hiện đúng | Không giật/crash lặp lại được |

## 5. Tính năng cần test RIÊNG trên từng cỡ màn

### 5.1 Nhóm A — Màn nhỏ (SE 1: 320 × 568; SE 2/3: 375 × 667) — rủi ro cao nhất

| Tính năng | Cách test | Lỗi hay gặp cần soi |
|---|---|---|
| Tab bar dưới | Mở từng tab, xem 5 nhãn + icon có đủ chỗ không; cuộn tới cuối trang xem nút cuối có bị tab bar che không | Nhãn tab 10.5px bị cắt / chồng nhau; nút cuối trang chìm dưới tab bar (nội dung chỉ chừa `tabh 50px + 40px + safe-area`) |
| Nút to / vùng chạm | Bấm lần lượt: nút chính, nút nhảy bước pipeline, nút segment, nút pill | Nút nhảy bước chỉ 28px (< 44×44pt chuẩn Apple HIG) — trên SE hẹp rất dễ bấm trượt sang bước bên cạnh |
| Chữ lớn (Dynamic Type) | Cài đặt iPhone → Trợ năng → Hiển thị & Cỡ chữ → Chữ lớn → kéo tới mức lớn nhất (AX5); mở lại app | App dùng `font-size` px nên chữ **không to theo hệ thống** (lỗi đã biết trong `ACCESSIBILITY.md`); ở AX5 phải ghi rõ: chữ có tràn, che nút, hay vỡ layout không — SE là nơi tràn đầu tiên |
| Chữ lớn + zoom | `maximum-scale=1, user-scalable=no` trong viewport → pinch-zoom trong app bị chặn; người dùng chỉ còn cách dùng Chữ lớn hệ thống | Ghi vào biên bản: người dùng SE + mắt kém có cách nào đọc được không, hay bị kẹt cả hai đường |
| Dark mode | Bật Tối (Cài đặt iPhone → Màn hình → Tối); mở Hôm nay, Sổ tiền, Cài đặt | Chữ xám `#636366` trên nền tối `#1C1C1E` (2.84:1) mờ khó đọc trên màn LCD nhỏ của SE; trắng trên đỏ `#FA2D48` (3.79:1) chỉ đạt mức chữ lớn |
| Form + bàn phím | Thêm job mới, nhập tên khách / số tiền / ghi chú | Bàn phím che mất nút Lưu / che ô đang nhập trên màn 667pt cao; phải cuộn được tới nút Lưu |
| Large Title 34px + tiêu đề | Màn Hôm nay, tiêu đề từng tab | Tiêu đề lớn + tên job dài làm tràn 1 dòng, đẩy nội dung xuống, che nút |
| Touch ID (không có Face ID) | Bật khoá, khoá máy, mở lại app | Touch ID mở được; PIN dự phòng mở được; không hiện màn hình Face ID trên máy không có Face ID |

### 5.2 Nhóm B — Hẹp nhưng cao (mini / X / XS / 11 Pro: 375 × 812)

| Tính năng | Cách test | Lỗi hay gặp cần soi |
|---|---|---|
| Tab bar + Home indicator | Cuộn cuối trang, xem nút cuối có bị Home indicator / tab bar mờ che không | Nền tab bar `blur(20px)` trong suốt làm chữ xám trên nền mờ khó đọc khi nội dung phía sau đổi màu (đã nêu trong `ACCESSIBILITY.md`) |
| Tai thỏ (notch) | Mở Hôm nay, xem Large Title / nút trên cùng | Tai thỏ che tiêu đề hoặc nút góc trên nếu `safe-area-inset-top` không ăn |
| Chữ lớn (Dynamic Type) | Như §5.1, mức AX5 | Rộng 375pt như SE nhưng cao hơn → tràn ít hơn SE; so sánh trực tiếp với SE để biết lỗi do "hẹp" hay do "thấp" |
| Dark mode | Như §5.1 | Màn OLED: chữ xám mờ trên nền đen dễ lộ hơn LCD; kiểm tra cả 3 preset màu chủ đề |
| Face ID | Bật khoá, mở lại app | Face ID mở được ngay cả khi đeo khẩu trang/kính (theo iOS của máy); PIN dự phòng vẫn mở được |

### 5.3 Nhóm C — Chuẩn (390 × 844 / 393 × 852 / 402 × 874)

| Tính năng | Cách test | Lỗi hay gặp cần soi |
|---|---|---|
| Tab bar dưới | Như trên | Đây là cỡ chuẩn — nếu ở đây mà tab đã cắt thì lỗi là lỗi chung, không phải lỗi riêng cỡ màn |
| Nút to / chạm 1 tay | Dùng 1 tay (ngón cái) bấm nút trên cùng và tab xa nhất | Nút trên cùng khó với tới trên máy 6.1"–6.3" — ghi nhận, không chặn trừ khi không bấm được bằng 2 tay |
| Chữ lớn (Dynamic Type) | Mức mặc định + 1 mức lớn + AX5 | Đây là mốc đối chứng: layout phải đạt ở mức mặc định và mức lớn; AX5 chỉ yêu cầu "dùng được, không che nút" |
| Dark mode | Sáng → Tối, đổi cả 3 preset màu chủ đề + logo studio | Màu nhấn `#FA2D48` trên nền đen/trắng, chữ trạng thái (đỏ/xanh/cam) có đủ tương phản ở cả 2 chế độ không |
| Dynamic Island (15/16/Pro) | Mở Hôm nay, cuộn lên đầu | Dynamic Island che tiêu đề lớn / nút trên cùng không; thông báo nhắc lịch có hiện quanh Dynamic Island không |
| Ngôn ngữ VI/EN + tiền tệ VND/USD | Đổi VI → EN, VND → USD trong Cài đặt | Chữ EN dài hơn VI có tràn nút/tab không (nhất là nhãn tab và nút segment) |

### 5.4 Nhóm D — Lớn (414 × 896 / 428 × 926 / 430 × 932 / 440 × 956)

| Tính năng | Cách test | Lỗi hay gặp cần soi |
|---|---|---|
| Tab bar dưới | Như trên | Tab bar có bị kéo giãn / icon thưa quá không; nhãn tab có bị dãn chữ không |
| Nút to / chạm 1 tay | Dùng 1 tay bấm nút góc trên xa nhất | Trên Pro Max 6.7"–6.9" nút trên cùng rất khó với tới — các thao tác chính (thêm job, lưu) phải nằm trong tầm ngón cái hoặc cuộn tới được |
| Chữ lớn (Dynamic Type) | Mức mặc định + AX5 | Màn lớn che được nhiều lỗi tràn — **không được kết luận "chữ lớn ổn" chỉ vì test trên Pro Max**; phải đối chiếu với SE |
| Dark mode | Như §5.3 | Ảnh trang chủ / ảnh job trên màn lớn có bị mờ/vỡ không; thẻ bo góc lớn có bị kéo dãn không |
| Màn lớn + nhiều nội dung | Hôm nay có nhiều job, Sổ tiền có nhiều khoản | Khoảng trắng thừa quá lớn, thẻ bị dãn, danh sách thưa — ghi nhận về thẩm mỹ, không chặn trừ khi nút bị đẩy khỏi màn hình |
| Dynamic Island (14/15/16 Pro Max) | Như §5.3 | Như §5.3 |
| Face ID | Như §5.2 | Như §5.2 |

### 5.5 Kiểm tra theo chế độ hệ thống — lặp lại trên 1 máy P0 nhỏ + 1 máy P0 lớn

| Chế độ | Máy | Kiểm tra |
|---|---|---|
| Dark mode (Tối) | SE 3 + 15 Pro Max | Toàn bộ §4 (C1–C11) chạy lại 1 lượt ở chế độ Tối; soi riêng tương phản chữ phụ và chữ trên nền đỏ |
| Chữ lớn AX5 | SE 3 + 15 Pro Max | Mở Hôm nay → thêm job → pipeline → sổ tiền → cài đặt; ghi lại chỗ nào tràn/che nút |
| Chữ đậm (Bold Text) | SE 3 | Nhãn tab 10.5px + chữ 12px có bị đậm quá làm tràn không |
| Giảm chuyển động | 1 máy bất kỳ | Mở/đóng sheet, chuyển tab — không yêu cầu tắt hết hiệu ứng, chỉ cần không giật |
| Màn hình Thu phóng (Display Zoom) — nếu máy có | SE 3 | Bật Thu phóng rồi mở app: layout có vỡ không (đây là cách người dùng SE hay dùng để chữ to hơn) |

## 6. Máy thật hay Simulator — cái nào test được gì

| Loại kiểm tra | Máy thật (TestFlight) | Simulator (Xcode) |
|---|---|---|
| Layout theo points, tab bar, dark mode, chữ lớn, tràn chữ | ✅ (chính) | ✅ (đủ để soi layout các cỡ màn không có máy thật) |
| Face ID / Touch ID / PIN | ✅ (chỉ máy thật) | ❌ (Simulator không có sinh trắc học thật) |
| Nhập Lịch iPhone native, Local Notifications, rung (Haptics) | ✅ (chỉ máy thật) | ⚠️ (một phần / không giống thật) |
| Đăng nhập Google (trình duyệt hệ thống + deep-link quay lại app) | ✅ (chỉ máy thật) | ⚠️ |
| Chọn ảnh / máy ảnh, Share sheet | ✅ (chỉ máy thật) | ⚠️ |
| iOS 15/16/17 cũ | ✅ (giữ máy cũ, xem §2) | ✅ (cài thêm runtime iOS cũ trong Xcode nếu có) |

**Quy tắc:** Simulator chỉ dùng để **phủ cỡ màn** khi thiếu máy thật; kết luận "đạt" cho P0 phải dựa trên **máy thật qua TestFlight**. Riêng Face ID/Touch ID, Lịch, thông báo, Google — không được kết luận đạt chỉ bằng Simulator.

## 7. Nguồn tra cứu (thông số công khai)

- Bảng kích thước Apple HIG (bản lưu trữ 06/2026 — Apple đã gỡ bảng này khỏi trang live từ 09/2026): points/pixels/scale các đời iPhone.
  - https://appguidelines.com/human-interface-guidelines/version/5/layout/
- Tổng hợp từ trang thông số kỹ thuật Apple (kiểm tra 12/11/2026): inch, pixels, ppi, points theo từng đời máy.
  - https://jusnod.com/resolution/iphone
  - https://twinr.dev/blogs/the-complete-guide-to-iphone-screen-resolutions-and-sizes/
- Khả năng chạy iOS theo đời máy (iOS 15 dừng ở 6s/7/SE 1; iOS 16 dừng ở 8/X; iOS 17/18 từ XR/XS/SE 2 trở lên):
  - https://www.macworld.com/article/1811287/which-version-of-ios-can-my-iphone-run.html
  - https://rottenwifi.com/ios-version-history-complete-list-from-iphone-os-1-to-ios-26/
- Căn cứ trong repo: `ios/App/App.xcodeproj/project.pbxproj` (`IPHONEOS_DEPLOYMENT_TARGET = 15.0`), `README.md`, `www/index.html`, `ACCESSIBILITY.md`, `TESTFLIGHT-CHECKLIST.md`.

## 8. Ghi chép khi test

- Mỗi máy test ghi 1 dòng: `Máy | iOS | Chế độ (Sáng/Tối, cỡ chữ) | Kết quả (Đạt/Lỗi) | Ghi chú + ảnh chụp màn hình`.
- Lỗi ghi theo mẫu trong `BUG-REPORT-TEMPLATE.md` (cùng thư mục `batch-testing/`), kèm: máy + iOS + cỡ chữ + sáng/tối, và nói rõ lỗi có tái hiện trên máy khác cỡ màn không.
- Ảnh chụp màn hình: chụp cả 2 chế độ Sáng/Tối trên SE 3 và 15 Pro Max cho màn Hôm nay + Sổ tiền (phục vụ App Store screenshots 6.7" + 6.5" — xem `README.md` "Còn thiếu" mục 5).
