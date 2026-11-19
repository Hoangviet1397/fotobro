# FotoBro iOS v1 — Regression Suite (bộ test hồi quy mỗi bản phát hành)

- **App:** FotoBro — Bundle ID `com.fotobro.app` — iOS v1.0 (`APP_VERSION = '1.0'`, `MARKETING_VERSION = 1.0`)
- **Mục đích:** bộ test cốt lõi chạy lại **trước mỗi bản phát hành / mỗi build TestFlight mới**. Chỉ gồm những ca **không được phép hỏng** — nếu một ca P0 hỏng thì không phát hành, dù các tính năng mới có chạy tốt.
- **Phiên bản suite:** 1.0 — 20/11/2026
- **Nguồn bám theo:** `CHANGELOG-v1.0.md` (tính năng v1), `TESTFLIGHT-CHECKLIST.md` (ca test đầy đủ trên iPhone thật), `QA-REPORT.md` (kiểm chứng độc lập 00:03–00:04 20/11/2026), `NOTIFICATIONS.md` (hành vi nhắc lịch v1).
- **Phạm vi:** Nấc 1 local-first trên iPhone thật qua TestFlight. **Không** test CloudKit Nấc 2 (chỉ là placeholder `not-configured` ở v1), **không** test mic giọng nói (đã dời sang v1.1 — xem §6).
- **Người chạy:** Việt / Xèo, hoặc người được giao test bản đó. Ghi tên + build vào §1 trước khi bắt đầu.

> Quy tắc vàng: **dữ liệu test là hư cấu** (khách "Test Portrait", "Test Wedding"…). Không nhập job/ảnh/tiền thật của khách. Test xong thì dọn theo §8 hoặc khôi phục bằng bản sao lưu cũ. Không test Google bằng tài khoản chính có mail khách quan trọng nếu chưa rõ quyền — dùng tài khoản Google test trước.

---

## 1. Thông tin lần chạy (điền trước khi test)

| Mục | Điền vào |
|---|---|
| Ngày chạy | ____ / ____ / 2026 |
| Người test | __________ |
| Bản TestFlight (build) | __________ |
| iPhone test / iOS | __________ / __________ |
| Kết quả chung | ☐ ĐẠT phát hành / ☐ KHÔNG ĐẠT — sửa rồi chạy lại (xem §7) |

### Quy ước ghi kết quả

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ ĐẠT | Đúng như cột "Kết quả mong đợi" |
| ❌ KHÔNG | Sai / lỗi / không làm được — bắt buộc ghi vào bảng lỗi §9 |
| ⏭️ BỎ QUA | Chỉ dùng cho ca có ghi **(có điều kiện)** khi điều kiện tiên quyết chưa có (Google chưa có Client ID, Lịch native chưa có plugin/quyền…). Ghi rõ lý do, không ghi lỗi. |

### Mức độ

| Mức | Ý nghĩa | Ảnh hưởng phát hành |
|---|---|---|
| **P0 — Chặn** | Tính năng lõi hỏng, crash, mất dữ liệu, hoặc kẹt không làm tiếp được | **1 ca P0 ❌ = KHÔNG ĐẠT, dừng phát hành** |
| **P1 — Nặng** | Tính năng chính sai, nhưng có cách vòng qua, không mất dữ liệu | Tối đa 2 ca P1 ❌, và phải có kế hoạch sửa + ghi chú phát hành; quá 2 ca = KHÔNG ĐẠT |
| **P2 — Nhẹ** | Chữ sai, lệch giao diện, khó chịu nhưng dùng được | Không chặn phát hành, nhưng phải ghi vào bảng lỗi để sửa bản sau |

---

## 2. Chuẩn bị trước khi chạy (5 phút — không tính vào giờ test chính)

1. **Sao lưu sổ thật trước (nếu máy đang có dữ liệu thật):** Cài đặt → **Tải bản sao lưu** → kiểm tra có file `fotobro-sao-luu.json` trong Files. Đây là phao cứu sinh cho cả buổi test.
2. **Dọn sổ test cũ:** xoá hết job/khoản test của lần trước, hoặc bắt đầu từ sổ trống. Kỳ vọng lúc bắt đầu: màn hình **Hôm nay** trống, **0 job mẫu, 0 ảnh mẫu** (v1 đã bỏ job mẫu + ảnh mẫu của Xèo — nếu còn thấy job mẫu là lỗi hồi quy, xem R-01).
3. **Chuẩn bị sẵn trong Lịch iPhone:** 2 sự kiện hư cấu ngày mai, vd "Chụp Test Lịch" 09:00 có địa điểm (chỉ cần cho ca R-20, R-21).
4. **Chuẩn bị PIN test:** ghi ra giấy một mã PIN 4–6 số, vd `1234` (chỉ dùng khi test khoá, ca R-26–R-28; xem cảnh báo ở R-28).
5. **Kiểm tra mạng:** Wi-Fi/mạng di động đang bật lúc bắt đầu; ca offline R-32 sẽ tắt mạng riêng sau.

---

## 3. Thứ tự chạy — 7 pha, chạy đúng thứ tự, không nhảy pha

Thứ tự này là **bắt buộc**, vì các pha sau dùng dữ liệu pha trước tạo ra, và các ca phá huỷ dữ liệu (khôi phục sao lưu) được đẩy về cuối:

| Pha | Nội dung | Ca | Thời gian | Vì sao ở vị trí này |
|---|---|---|---|---|
| **0** | Kiểm tự động (máy tính, trước khi lên TestFlight) | A-01 – A-02 | ~10 phút | Rẻ nhất, chặn sớm: code hỏng cú pháp thì khỏi mất công test tay |
| **1** | Mở app + màn Hôm nay (smoke) | R-01 – R-04 | ~5 phút | App không mở được thì mọi ca sau vô nghĩa |
| **2** | Job + pipeline 8 bước | R-05 – R-13 | ~15 phút | Lõi của app; tạo dữ liệu cho pha tiền, lịch, sao lưu |
| **3** | Tiền: cọc, thu nốt, chi, báo cáo | R-14 – R-18 | ~10 phút | Dùng đúng job đã tạo ở pha 2; kiểm tra 5 khóa an toàn tiền |
| **4** | Lịch + nhắc (Lịch iPhone, xuất lịch, nhắc trong app) | R-19 – R-24 | ~10 phút | Cần job có ngày chụp từ pha 2 |
| **5** | Google — có điều kiện | R-25 (1 ca gộp) | ~5 phút | Chỉ chạy khi đã có Client ID chung; nếu chưa có thì ⏭️, không chặn |
| **6** | Khoá + sao lưu/khôi phục + cá nhân hoá + offline | R-26 – R-33 | ~15 phút | Sao lưu/khôi phục là thao tác phá huỷ (xoá dữ liệu tạo sau mốc sao lưu) nên làm cuối; khoá test sau cùng để không bị khoá giữa chừng |
| | **Tổng cộng** | **A-01 – A-02 + R-01 – R-33** | **~70 phút** | Pha 0 làm trên máy tính; pha 1–6 làm trên iPhone thật (~60 phút) |

> Nếu chỉ có ít thời gian: **không được bỏ pha nào** — thay vào đó chạy đúng bộ "tối thiểu" ở §5 (12 ca P0, ~25 phút) rồi chạy nốt phần còn lại trước khi phát hành. Không phát hành khi chỉ chạy bộ tối thiểu.

---

## 4. Danh sách test case

### Pha 0 — Kiểm tự động (chạy trên máy tính, trước khi đưa build lên TestFlight)

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| A-01 | P0 | Trích toàn bộ script inline trong `www/index.html` và chạy `node --check` từng script | **13/13 script pass**, không lỗi cú pháp |
| A-02 | P0 | Chạy test jsdom `test-fotobro-v1.js` | **103/103 đạt**. Lưu ý hồi quy đã biết (QA 20/11/2026): test cũ expect `APP_VERSION '2.6'` và 5 job mẫu là **sai theo spec v1** — kỳ vọng đúng của v1 là `APP_VERSION '1.0'` và **0 job mẫu**. Nếu test vẫn expect cũ thì sửa test, không sửa app; nếu số fail khác 2 lỗi này thì dừng lại, không đưa lên TestFlight |

### Pha 1 — Mở app + màn Hôm nay (smoke)

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-01 | P0 | Cài qua TestFlight → mở app lần đầu → bấm **Bắt đầu sổ trống — dùng thật** | App mở lên, không crash, không màn hình trắng. Vào màn hình **Hôm nay**, sổ trống: **0 job mẫu, 0 ảnh mẫu**, không còn Góc E.L.F. / Super Junior / Pearl Sapphire Blue / tên Xèo / Sadako |
| R-02 | P0 | Vuốt/bấm qua 5 tab dưới: Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt | Cả 5 tab mở được, chữ không bị cắt ở tai thỏ / Dynamic Island, không tab nào trắng trang |
| R-03 | P0 | Khoá màn hình iPhone rồi mở lại app, dùng bình thường 5 phút (mở job, đổi tab) | Không crash, không đứng màn hình trắng, không tự đăng xuất, không mất dữ liệu |
| R-04 | P1 | Màn **Hôm nay**: kiểm tra buổi chụp hôm nay/ngày mai, job kẹt, tiền về chờ ghi | Hiện đúng job hôm nay + ngày mai; **không** hiện job đã Xong / đã huỷ. Chữ tiếng Việt có dấu đúng ("Chốt cọc", "Đã giao", "Buổi chụp"), không lỗi font |

### Pha 2 — Job + pipeline 8 bước

Pipeline v1 giữ nguyên 8 bước: **Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong**.

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-05 | P0 | Hôm nay → **+ Thêm job**: khách "Test Portrait", loại Portrait, ngày chụp ngày mai 07:00, địa điểm "Studio test", giá để mặc định | Job được tạo, hiện ở bước **Tư vấn**, giá tự điền đúng bảng giá Portrait (**2.500.000**) |
| R-06 | P0 | Tạo thêm 4 job: Wedding, Couple, Lookbook, Event (mỗi loại 1 job, giá mặc định) | Đủ 5 loại job; giá mặc định đúng bảng giá: Couple 4.000.000, Wedding 15.000.000, Lookbook 8.000.000, Event 5.000.000 |
| R-07 | P0 | Tạo 1 job chọn **Chụp bằng: Film**; tạo 1 job chọn **Chụp bằng: Cả hai** (Digital + Film) | Job Film ghi Film, giá lấy theo bảng giá film (chưa đặt giá film thì hiện 0/trống, **không crash**). Job Cả hai ghi Cả hai, giá = Digital + Film |
| R-08 | P1 | Tạo job bỏ trống tên khách, bấm Lưu; rồi tạo job không chọn ngày chụp, bấm Lưu | Job trống tên: app báo thiếu tên, **không tạo job rỗng**. Job không ngày chụp: tạo được, nằm ở Tư vấn |
| R-09 | P0 | Mở job Test Portrait ở Tư vấn → bấm **Xong bước này** | Job sang **Chốt cọc**, thanh tiến độ nhích đúng 1 bước |
| R-10 | P0 | Chạm thẳng vào chấm/bước **Hậu kỳ** trên thanh tiến độ (nhảy bước) | Job nhảy thẳng tới **Hậu kỳ**, không bắt đi từng bước; có hỏi xác nhận nếu nhảy qua bước chưa xong. Dữ liệu job không mất |
| R-11 | P0 | Từ Hậu kỳ, lùi về **Sắp chụp** (nút lùi / chạm bước cũ), rồi đi lần lượt tới **Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao** | Mỗi bước chuyển đúng, không kẹt, không mất tiền/ảnh đã ghi |
| R-12 | P0 | Mở job → **Huỷ job** (Không chốt) → mở job đã huỷ → **Khôi phục về "Tư vấn"** | Job huỷ chuyển sang **Đã huỷ**, biến mất khỏi pipeline đang chạy, tiền và lịch giữ nguyên. Khôi phục xong job về lại Tư vấn, nằm lại trong pipeline đang chạy |
| R-13 | P1 | Tạo 1 job test, để ở 1 bước quá 7 ngày (hoặc quá hạn giao) không chuyển bước | App hiện cảnh báo **job kẹt ở bước X** trong chi tiết job **và** 1 dòng nhắc trên màn hình **Hôm nay**. Lọc danh sách job theo từng bước (chips Tư vấn / Chốt cọc / … / Xong) chỉ hiện đúng job ở bước đó, số đếm trên chip đúng |

### Pha 3 — Tiền: cọc, thu nốt, chi, báo cáo

Dùng job Test Portrait giá 2.500.000 từ pha 2 (nếu job đó đã đi khỏi bước Chốt cọc thì tạo job Portrait mới giá 2.500.000).

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-14 | P0 | Job Portrait 2.500.000 → sang bước **Chốt cọc** → nhập khoản thu cọc 1.000.000, lưu | App mở sẵn form ghi cọc khi sang Chốt cọc; lưu được; mở job thấy **đã thu 1.000.000, còn thiếu 1.500.000** |
| R-15 | P0 | Job sang bước **Đã giao** | App nhắc **thu nốt** số còn thiếu (1.500.000). Ghi thêm khoản thu 1.500.000 → còn thiếu về 0, job không còn hiện "thiếu tiền" |
| R-16 | P0 | Tạo job mới giá 4.000.000, chỉ thu cọc 1.000.000, rồi bấm **Xong** (bước cuối) | App hiện **cảnh báo còn thiếu 3.000.000** và hỏi xác nhận — **không cho xong lặng lẽ**. Bấm Huỷ thì job chưa xong, tiền giữ nguyên |
| R-17 | P0 | Sổ tiền → ghi 1 khoản **chi** (vd: thuê lens 500.000, gắn vào 1 job) + 1 khoản thu không gắn job nào (thu chung) | Khoản chi hiện đúng job, đúng ngày, đúng số tiền; khoản thu chung vẫn ghi được, báo cáo vẫn cộng đúng |
| R-18 | P1 | Sổ tiền → xem báo cáo ngày / tuần / tháng | Tổng thu, tổng chi, còn thiếu tính đúng với các khoản đã ghi ở R-14–R-17. Job đã **Xong** không còn nằm trong danh sách đang chạy, tiền đã thu đủ |

### Pha 4 — Lịch + nhắc

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-19 | P0 | Mở chi tiết 1 job có ngày chụp → bấm **Thêm vào Lịch iPhone** → bấm Thêm trong app Lịch | iPhone mở app Lịch với sự kiện đã điền sẵn (tên job, ngày, giờ, địa điểm). Kiểm tra trong Lịch iPhone: sự kiện có mặt, đúng giờ |
| R-20 | P0 **(có điều kiện)** | FotoBro → **Nhập từ Lịch iPhone** (lần đầu: app hỏi quyền → bấm **Cho phép**) | Sự kiện 30 ngày tới tự thành buổi chụp trong FotoBro (đúng tên, ngày, giờ, địa điểm). **Điều kiện:** chỉ chạy trên app iOS thật khi plugin lịch + quyền `NSCalendarsUsageDescription` đã có. Nếu app rơi về chọn file `.ics` (fallback cũ đã bỏ ở v1) thì ghi ❌ P0, không ghi ⏭️ |
| R-21 | P1 **(có điều kiện)** | Nhập lại lần 2 khi sự kiện đã thành job; rồi tắt quyền Lịch (Cài đặt iPhone → FotoBro → Lịch → tắt) và bấm nhập lại | Lần 2: **không tạo job trùng**. Khi tắt quyền: app báo rõ "chưa cho phép đọc Lịch" + hướng dẫn bật lại, không crash, không tạo job rác |
| R-22 | P1 | Job chưa có ngày chụp → tìm nút Thêm vào Lịch | App báo "job chưa có ngày chụp", không tạo sự kiện/file rỗng |
| R-23 | P0 | Nhắc trong app: job chụp ngày mai 07:00 — kiểm tra nhắc được đặt trước giờ chụp **12 tiếng** (mặc định v1; cho chọn 1h/12h/24h trong Cài đặt) | Có lịch nhắc trước buổi chụp đúng khoảng đã chọn (mặc định 12 tiếng). **Lưu ý hồi quy:** bridge cũ đang là 60 phút — nếu nhắc vẫn đặt 60 phút thay vì 12 tiếng thì ghi ❌ P1 (sai mặc định v1) |
| R-24 | P1 | Tắt app hoàn toàn (vuốt khỏi đa nhiệm) rồi mở lại | Nhắc đã đặt không mất; màu chủ đề, logo, ngôn ngữ, tiền tệ, tên studio, bảng giá đã đổi vẫn còn — không về mặc định. Job kẹt (R-13) vẫn còn cảnh báo |

### Pha 5 — Google — có điều kiện

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-25 | P1 **(có điều kiện)** | Chỉ chạy khi đã dán Client ID Google chung vào `fotobro-config.js`. Cài đặt → **Đăng nhập Google** → đăng nhập bằng tài khoản Google test → xem tab Buổi chụp → Lịch → ngắt kết nối → đăng nhập lại | Mở trình duyệt hệ thống (Safari), **không** đăng nhập trong WebView; quay lại app tự động, hiện "Đã kết nối Google", **không bắt dán Client ID hay tự tạo Cloud project**. Lịch Google 30 ngày tới hiện có nhãn "Google". Ngắt kết nối: Lịch/Gmail/Danh bạ đã tải bị xoá khỏi máy, **job và sổ tiền vẫn giữ nguyên**. Đăng nhập lại được bình thường. — **Nếu app báo "Đăng nhập Google chưa sẵn sàng" (chưa có Client ID) thì ghi ⏭️ BỎ QUA toàn ca, không ghi lỗi** |

### Pha 6 — Khoá + sao lưu/khôi phục + cá nhân hoá + offline

> ⚠️ Pha này làm **cuối cùng** vì R-30 khôi phục sao lưu sẽ xoá mọi dữ liệu tạo sau mốc sao lưu.

| # | Mức | Bước | Kết quả mong đợi |
|---|---|---|---|
| R-26 | P0 | Cài đặt → **Bật khoá Face ID**, đặt mã PIN dự phòng 4–6 số (PIN test đã ghi ra giấy ở §2) | Bật được, app báo đã bật khoá |
| R-27 | P0 | Khoá màn hình iPhone → mở lại FotoBro → mở bằng Face ID; rồi ở màn khoá → **Dùng mã PIN**, nhập đúng PIN | Cả hai cách đều mở được app |
| R-28 | P1 | Ở màn khoá → nhập sai PIN 1–2 lần; rồi rời app hơn 2 phút và mở lại | Nhập sai: báo sai, vẫn cho nhập lại (chưa khoá cứng). Sau 2 phút: app tự khoá lại, phải Face ID / PIN mới vào. **⚠️ Không test nhập sai 5 lần liên tiếp** — sẽ bị khoá chờ tăng dần, chỉ test khi đã có bản sao lưu chắc chắn |
| R-29 | P0 | Cài đặt → **Tải bản sao lưu** | Tải được file `fotobro-sao-luu.json` về máy (kiểm tra trong Files). Sau đó tạo thêm 1 job test + 1 khoản thu test |
| R-30 | P0 | Cài đặt → **Mở bản sao lưu** → chọn file ở R-29 → **Thay bằng bản sao lưu** | App về đúng trạng thái lúc R-29: job/khoản tạo sau mốc sao lưu **biến mất**, dữ liệu cũ còn nguyên |
| R-31 | P0 | Mở 1 file không phải bản sao lưu (vd: ảnh .jpg) bằng nút Mở bản sao lưu | App báo "không giống bản sao lưu", **không xoá dữ liệu hiện có** |
| R-32 | P0 | Bật chế độ máy bay (mất mạng) → mở job, ghi tiền, đổi bước pipeline | Dùng bình thường offline (Nấc 1 local-first); chỉ Google/Lịch Google là không tải được, app báo rõ. Tắt chế độ máy bay sau ca này |
| R-33 | P1 | Cá nhân hoá chung (4 tính năng v1, gộp 1 ca): đổi **màu chủ đề** sang preset khác + dark mode iPhone; thêm **logo studio**; sửa 1 **mẫu tin nhắn/email** rồi **Khôi phục mẫu gốc**; đổi **ngôn ngữ English** + **tiền tệ USD** rồi đổi lại Việt + VND | Màu/nền đổi ngay, chữ vẫn đọc được cả sáng lẫn tối. Logo hiện trên Hôm nay và đầu email gửi khách. Mẫu sửa được lưu, khôi phục chỉ về đúng mẫu đó. Tiếng Anh đổi nhãn chính; USD **chỉ đổi hiển thị, không quy đổi tỷ giá** (2.500.000 VND không được biến thành số USD sai). Đổi lại Việt + VND: app về như cũ, không mất dữ liệu |

---

## 5. Bộ tối thiểu khi gấp (12 ca P0, ~25 phút — chỉ dùng khi không đủ 70 phút)

Chạy đúng thứ tự: **R-01, R-02, R-05, R-09, R-10, R-12, R-14, R-15, R-16, R-19, R-27, R-30**. Thêm A-01 + A-02 trên máy tính trước đó (~10 phút).

- Bộ tối thiểu **không thay thế** bộ đầy đủ: bản phát hành chỉ được coi là ĐẠT khi đã chạy đủ 35 ca (A-01 – A-02 + R-01 – R-33) và đạt tiêu chí §7.
- Nếu 1 ca trong bộ tối thiểu ❌ thì **dừng ngay, không chạy tiếp** — sửa lỗi rồi chạy lại từ đầu bộ tối thiểu.

---

## 6. Những gì KHÔNG có trong bộ hồi quy này (và vì sao)

| Mục | Trạng thái v1 | Cách xử lý trong regression |
|---|---|---|
| Mic giọng nói | **Dời sang v1.1.** Plugin `@capacitor-community/speech-recognition@7.0.1` không có `Package.swift` nên build SPM Capacitor 8 không link được; đã thử 2 cách chưa xong. Ở v1, bấm micro hiện "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha" | **Không test mic.** Chỉ kiểm tra gõ tay vẫn chạy (là một phần của R-04/R-33 nếu cần). Khi mic có ở v1.1 thì thêm ca mới vào suite này |
| CloudKit Nấc 2 (đồng bộ/sao lưu mã hoá) | Chỉ là placeholder `not-configured`, chưa có container thật, chưa code sync | **Không test đồng bộ.** Sao lưu v1 chỉ là file JSON (R-29 – R-31) |
| Nhập lịch cũ (file `.ics` / `.zip`, xuất `.zip` từ Google) | **Đã bỏ hẳn ở v1** | **Không test.** Nếu app còn hiện đường nhập file thì ghi ❌ P0 (tính năng đã bỏ quay lại) |
| E.L.F. / Super Junior, job mẫu, ảnh mẫu, Góc E.L.F., sticker, Pearl Sapphire Blue | **Đã bỏ hẳn ở v1** | Kiểm hồi quy qua R-01 (0 lần xuất hiện). Nếu còn thấy thì ghi ❌ P0 |
| Checklist theo bước, Kanban kéo thả, đổi tên phòng ban, loại job riêng | Không làm ở v1 | Không test |

---

## 7. Tiêu chí đạt / không đạt để phát hành

### ĐẠT phát hành khi TẤT CẢ đúng:

1. **Pha 0:** A-01 và A-02 đều ✅ (103/103, với 2 expect đã sửa theo spec v1 — xem A-02).
2. **P0:** **35 ca P0 — 0 ca ❌.** Không có crash, không mất dữ liệu, không kẹt pipeline, không cho xong job khi còn thiếu tiền (R-16), sao lưu/khôi phục đúng (R-29 – R-31), khoá mở được (R-26 – R-27), offline dùng được (R-32).
3. **P1:** tối đa **2 ca ❌**, mỗi ca đã có kế hoạch sửa + ghi chú phát hành rõ ràng.
4. **P2:** đã ghi hết vào bảng lỗi §9 (không chặn, nhưng không được bỏ sót không ghi).
5. **Ca có điều kiện:** R-20/R-21/R-25 chỉ được ⏭️ khi đúng điều kiện ghi trong ca (chưa có Client ID / chưa có plugin lịch). ⏭️ vì lý do khác thì tính là ❌.
6. **Dọn dẹp xong** (§8) và bảng tổng kết (§10) đã điền đủ.

### KHÔNG ĐẠT — dừng phát hành, sửa rồi chạy lại khi:

- Bất kỳ ca **P0 nào ❌** (kể cả chỉ 1 ca).
- **P1 ❌ quá 2 ca**, hoặc 1 ca P1 là mất dữ liệu / sai tiền (tính sai tổng thu/chi/còn thiếu).
- Crash / màn hình trắng / mất dữ liệu ở bất kỳ ca nào, dù ca đó là P1/P2.
- Ca có điều kiện bị ⏭️ sai lý do, hoặc tính năng đã bỏ (nhập `.ics`, job mẫu, E.L.F.) quay lại.

### Chạy lại sau khi sửa:

- Sửa lỗi **P0**: chạy lại **toàn bộ suite** từ pha 1 (pha 0 chạy lại trên máy tính trước).
- Sửa lỗi **P1/P2**: chạy lại pha chứa ca đó + pha 2–3 (vì tiền và pipeline liên quan nhau). Ghi rõ lần chạy lại vào §10.

---

## 8. Dọn dẹp sau test (5 phút — bắt buộc, làm sau R-33)

1. Xoá hết job/khoản test, **hoặc** Mở bản sao lưu cũ (file đã tải ở §2 bước 1) để khôi phục sổ thật.
2. Tắt khoá Face ID test (nếu không muốn dùng tiếp) hoặc giữ nguyên theo ý mình — ghi rõ đã chọn cách nào vào §10.
3. Đổi lại ngôn ngữ Việt + tiền tệ VND + màu chủ đề mặc định nếu đã đổi trong R-33.
4. Kiểm tra lần cuối màn Hôm nay: sổ sạch, không còn dữ liệu test.

---

## 9. Bảng lỗi (điền khi test)

| # | Ca test | Lỗi thấy được (ghi đúng chữ app hiện + các bước làm lại được) | Ảnh chụp màn hình (có/không) | Mức độ |
|---|---|---|---|---|
| 1 | | | | P0 / P1 / P2 |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

Mức độ: **P0 Chặn** = không test tiếp được / mất dữ liệu; **P1 Nặng** = tính năng chính không làm được; **P2 Nhẹ** = chữ sai, lệch giao diện, dùng được nhưng khó chịu.

---

## 10. Tổng kết lần chạy

- Tổng số ca: **35 ca** (2 tự động + 33 tay)
- ✅ ĐẠT: ____ ca (trong đó P0: ____ / ____ ca)
- ❌ KHÔNG: ____ ca (liệt kê số ca ở bảng lỗi §9: __________)
- ⏭️ BỎ QUA: ____ ca (lý do: Google chưa có Client ID / Lịch native chưa có plugin / …: __________)
- Thời gian chạy thực tế: ____ phút (ước tính ~70 phút)
- Kết luận: ☐ **Đủ để phát hành** / ☐ **KHÔNG ĐẠT — sửa lỗi chặn rồi chạy lại** / ☐ Cần build mới rồi test lại
- Dọn dẹp (§8): ☐ đã xong — khoá test: ☐ đã tắt / ☐ giữ nguyên theo ý mình
- Người test ký tên: __________

---

## 11. Lịch sử sửa đổi của suite này

| Phiên bản | Ngày | Thay đổi |
|---|---|---|
| 1.0 | 20/11/2026 | Bản đầu tiên. Bám `CHANGELOG-v1.0.md` + `TESTFLIGHT-CHECKLIST.md` + `QA-REPORT.md` (20/11/2026). 35 ca: 2 tự động + 33 tay, 7 pha, ~70 phút. Mic dời v1.1 và CloudKit placeholder được ghi rõ là ngoài phạm vi. |

> Khi v1.1 thêm mic giọng nói, hoặc khi Google Client ID / plugin Lịch native đã sẵn sàng thật, cập nhật suite này (thêm ca, bỏ dấu "có điều kiện") và tăng số phiên bản ở bảng trên — không sửa âm thầm.
