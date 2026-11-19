# FotoBro iOS v1 — Checklist test trên iPhone thật qua TestFlight

- App: FotoBro (Foto + Bro), Bundle ID `com.fotobro.app`
- Cách test: TestFlight (bản beta nội bộ, không cần Apple duyệt trước)
- Người test: Việt / Xèo — ghi tên vào bảng dưới trước khi bắt đầu
- Ngày test: ____ / ____ / 2026 — Bản TestFlight (build): __________
- iPhone test: __________ — iOS: __________

## Quy ước ghi kết quả

Mỗi ca test có 3 cột cuối để tick:

| Cột | Ý nghĩa |
|---|---|
| ✅ ĐẠT | Đúng như cột "Kết quả mong đợi" |
| ❌ KHÔNG | Sai / lỗi / không làm được — bắt buộc ghi vào bảng lỗi cuối file |
| ⏭️ BỎ QUA | Tính năng chưa sẵn sàng ở bản này (chỉ dùng cho các ca có ghi "có điều kiện") |

**Dữ liệu test là hư cấu** (khách "Test Portrait", "Test Wedding"...). Không nhập job/ảnh/tiền thật của khách. Test xong thì xoá dữ liệu test hoặc dùng "Mở bản sao lưu" để khôi phục lại sổ cũ. Không test bằng tài khoản Google chính có mail khách hàng quan trọng nếu chưa rõ quyền — dùng tài khoản Google test trước.

**Biết trước khi test (không tính là lỗi):**
- Đăng nhập Google chỉ sẵn sàng khi đã dán Client ID chung vào `fotobro-config.js`. Nếu bấm nút mà app báo "chưa sẵn sàng" thì ghi ⏭️ BỎ QUA ở mục 6, không ghi lỗi.
- Nhập Lịch iPhone native chỉ có trên app iOS thật. Không còn nhập file `.ics` / `.zip` ở v1 (đã bỏ hẳn).
- CloudKit (Nấc 2) ở v1 chỉ là placeholder `not-configured` — chưa đồng bộ thật, đừng test đồng bộ.
- Sao lưu ở v1 là file JSON tải về máy (`fotobro-sao-luu.json`), chưa phải CloudKit.

---

## 0. Cài đặt qua TestFlight

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 0.1 | Mở link mời TestFlight trên iPhone → cài app TestFlight (miễn phí trên App Store) nếu chưa có | Mở được link, thấy app FotoBro trong TestFlight | | |
| 0.2 | Bấm **Cài đặt** trong TestFlight, chờ tải xong, bấm **Mở** | App mở lên, không crash ở màn hình đầu | | |
| 0.3 | Mở lần đầu: màn chào / hướng dẫn hiện ra, bấm **Bắt đầu sổ trống — dùng thật** | Vào được màn hình **Hôm nay**, sổ trống, không còn job mẫu / ảnh mẫu của bản cũ | | |
| 0.4 | Vuốt / bấm qua 5 tab dưới (Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt) | Cả 5 tab mở được, chữ không bị cắt ở tai thỏ / Dynamic Island | | |
| 0.5 | Khoá màn hình iPhone rồi mở lại app, dùng app 5 phút bình thường | Không crash, không đứng màn hình trắng, không tự đăng xuất | | |

## 1. Tạo job mới

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 1.1 | Hôm nay → **+ Thêm job**: khách "Test Portrait", loại Portrait, ngày chụp ngày mai 07:00, địa điểm "Studio test", giá để mặc định | Job hiện ở bước **Tư vấn**, giá tự điền đúng bảng giá Portrait | | |
| 1.2 | Tạo thêm 1 job Wedding, 1 job Couple, 1 job Lookbook, 1 job Event | Đủ 5 loại job, mỗi loại giá mặc định đúng bảng giá | | |
| 1.3 | Tạo 1 job chọn **Chụp bằng: Film** | Job ghi Film, giá lấy theo bảng giá film (nếu chưa đặt giá film thì hiện 0 / trống, không crash) | | |
| 1.4 | Tạo 1 job chọn **Chụp bằng: Cả hai** (Digital + Film) | Job ghi Cả hai, giá tính đúng Digital + Film | | |
| 1.5 | Tạo job bỏ trống tên khách, bấm Lưu | App báo thiếu tên, không tạo job rỗng | | |
| 1.6 | Tạo job không chọn ngày chụp, bấm Lưu | Tạo được job (ngày chụp trống), job nằm ở Tư vấn | | |
| 1.7 | Mở chi tiết 1 job → sửa tên khách / giá / ngày, bấm Lưu | Lưu đúng, quay lại thấy đúng dữ liệu đã sửa | | |
| 1.8 | Xoá 1 job test (nếu có nút xoá) | Job biến mất khỏi danh sách, tiền thu/chi kèm job được hỏi xử lý rõ ràng | | |

## 2. Pipeline 8 bước

8 bước giữ nguyên: **Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong**.

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 2.1 | Mở job ở Tư vấn → bấm **Xong bước này** | Job sang **Chốt cọc**, thanh tiến độ nhích 1 bước | | |
| 2.2 | Chạm thẳng vào chấm/bước **Hậu kỳ** trên thanh tiến độ (nhảy bước) | Job nhảy thẳng tới **Hậu kỳ**, không bắt đi từng bước; có hỏi xác nhận nếu nhảy qua bước chưa xong | | |
| 2.3 | Từ Hậu kỳ, lùi về **Sắp chụp** (nút lùi / chạm bước cũ) | Job về lại Sắp chụp, dữ liệu job không mất | | |
| 2.4 | Đi lần lượt tới **Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao** | Mỗi bước chuyển đúng, không kẹt, không mất tiền/ảnh đã ghi | | |
| 2.5 | Ở bước **Đã giao**, app có gợi ý / nhắc gửi email báo khách (nếu có) | Hiện gợi ý đúng lúc, bấm Huỷ thì không gửi gì | | |
| 2.6 | Tạo 1 job test, để nguyên ở 1 bước quá hạn giao (deadline đã qua) hoặc quá 7 ngày cùng 1 bước | App hiện cảnh báo **job kẹt ở bước X** trong chi tiết job và 1 dòng nhắc trên màn hình **Hôm nay** | | |
| 2.7 | Mở job → **Huỷ job** (Không chốt) | Job chuyển sang **Đã huỷ**, biến mất khỏi pipeline đang chạy, tiền và lịch giữ nguyên | | |
| 2.8 | Mở job đã huỷ → **Khôi phục về "Tư vấn"** | Job về lại Tư vấn, nằm lại trong pipeline đang chạy | | |
| 2.9 | Lọc danh sách job theo từng bước (chips Tư vấn / Chốt cọc / … / Xong) | Mỗi bộ lọc chỉ hiện đúng job ở bước đó; số đếm trên chip đúng | | |

## 3. Tiền: cọc, thu nốt, chi, báo cáo

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 3.1 | Job Portrait giá 2.500.000 → sang bước **Chốt cọc** | App mở sẵn form ghi khoản thu cọc — nhập 1.000.000, lưu được | | |
| 3.2 | Mở job đó: xem **đã thu / còn thiếu** | Hiện đã thu 1.000.000, còn thiếu 1.500.000 | | |
| 3.3 | Job sang bước **Đã giao** | App nhắc **thu nốt** số còn thiếu (1.500.000) | | |
| 3.4 | Ghi thêm khoản thu 1.500.000 cho job đó | Còn thiếu về 0, job không còn hiện "thiếu tiền" | | |
| 3.5 | Tạo job mới giá 4.000.000, chỉ thu cọc 1.000.000, rồi bấm **Xong** (bước cuối) | App hiện **cảnh báo còn thiếu 3.000.000** và hỏi xác nhận — không cho xong lặng lẽ | | |
| 3.6 | Sổ tiền → ghi 1 khoản **chi** (vd: thuê lens 500.000, gắn vào 1 job) | Khoản chi hiện đúng job, đúng ngày, đúng số tiền | | |
| 3.7 | Sổ tiền → xem báo cáo ngày / tuần / tháng | Tổng thu, tổng chi, còn thiếu tính đúng với các khoản đã ghi ở 3.1–3.6 | | |
| 3.8 | Ghi 1 khoản thu không gắn job nào (thu chung) | Vẫn ghi được, báo cáo vẫn cộng đúng | | |
| 3.9 | Mở job đã **Xong** | Job không còn nằm trong danh sách đang chạy, tiền đã thu đủ | | |

## 4. Nhập Lịch iPhone native (1 chạm) — chỉ có trên app iOS thật

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 4.1 | Trước khi test: tạo sẵn 2 sự kiện trong app Lịch iPhone (vd: "Chụp Test Lịch" ngày mai 09:00, có địa điểm) | Sự kiện có trong Lịch iPhone | | |
| 4.2 | FotoBro → **Nhập từ Lịch iPhone** | App hỏi quyền truy cập Lịch (lần đầu) — bấm **Cho phép** | | |
| 4.3 | Sau khi cho phép: bấm **Nhập từ Lịch iPhone** 1 lần | Sự kiện 30 ngày tới tự thành buổi chụp trong FotoBro (đúng tên, ngày, giờ, địa điểm) | | |
| 4.4 | Từ chối quyền Lịch (Cài đặt iPhone → FotoBro → Lịch → tắt), rồi bấm nhập lại | App báo rõ "chưa cho phép đọc Lịch" + hướng dẫn bật lại, không crash, không tạo job rác | | |
| 4.5 | Nhập lại lần 2 khi sự kiện đã thành job | Không tạo job trùng (sự kiện đã nhập không nhập lại lần nữa) | | |

## 5. Xuất lịch sang Lịch iPhone

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 5.1 | Mở chi tiết 1 job có ngày chụp → bấm **Thêm vào Lịch iPhone** | iPhone tự mở app Lịch với sự kiện đã điền sẵn (tên job, ngày, giờ, địa điểm) | | |
| 5.2 | Bấm Thêm trong app Lịch, rồi kiểm tra Lịch iPhone | Sự kiện có trong Lịch iPhone, đúng giờ | | |
| 5.3 | Job chưa có ngày chụp → tìm nút Thêm vào Lịch | App báo "job chưa có ngày chụp", không tạo file rỗng | | |

## 6. Đăng nhập Google (1 chạm) — CÓ ĐIỀU KIỆN

> Chỉ test mục này khi đã dán Client ID Google chung vào `fotobro-config.js`. Nếu app báo "Đăng nhập Google chưa sẵn sàng" thì ghi ⏭️ BỎ QUA toàn mục 6, không ghi lỗi.

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 6.1 | Cài đặt → **Đăng nhập Google** | Mở trình duyệt hệ thống (Safari) sang trang đăng nhập Google — KHÔNG đăng nhập trong khung WebView của app | | |
| 6.2 | Đăng nhập bằng tài khoản Google test, cho phép đủ quyền 1 lần | Quay lại app tự động, hiện "Đã kết nối Google", không bắt dán Client ID hay tự tạo Cloud project | | |
| 6.3 | Tab **Buổi chụp → Lịch**: xem lịch Google | Hiện sự kiện Google Lịch 30 ngày tới, có nhãn "Google", chạm vào 1 sự kiện → tạo được buổi chụp | | |
| 6.4 | Sổ tiền: kiểm tra mục **Tiền về từ Gmail** (nếu có) | App tìm được email báo tiền về (nếu có trong hộp thư test) và gợi ý ghi khoản thu đúng số tiền | | |
| 6.5 | Ghi 1 buổi chụp có ngày vào **Google Lịch** (nút Thêm/Cập nhật trên Google Lịch trong chi tiết job) | Sự kiện xuất hiện trong Google Lịch thật (kiểm tra trên calendar.google.com) | | |
| 6.6 | Gửi email cho khách bằng Gmail (trong chi tiết job, nếu có) | Soạn sẵn đúng mẫu, bấm Gửi thì gửi được, khách nhận đúng nội dung | | |
| 6.7 | Cài đặt → **Ngắt kết nối Google** | Lịch/Gmail/Danh bạ đã tải bị xoá khỏi máy, job và sổ tiền vẫn giữ nguyên | | |
| 6.8 | Đăng nhập lại sau khi ngắt | Đăng nhập lại được bình thường, không kẹt ở màn hình cũ | | |

## 7. Cá nhân hoá chung (4 tính năng v1)

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 7.1 | Cài đặt → **Màu chủ đề**: đổi sang preset Tối giản, rồi sang Tối (dark) | Toàn app đổi màu nhấn + nền theo preset ngay; chữ vẫn đọc được cả 2 chế độ | | |
| 7.2 | Bật dark mode của iPhone (Cài đặt iPhone → Màn hình → Tối), mở app | App nền đen, chữ trắng/xám sáng, không có chữ xám mờ khó đọc, ảnh/tab vẫn thấy rõ | | |
| 7.3 | Cài đặt → thêm **logo studio** (chọn 1 ảnh từ máy) | Logo hiện trên màn hình **Hôm nay** và ở đầu email gửi khách; chưa có logo thì hiện chữ FotoBro như cũ | | |
| 7.4 | Cài đặt → **Mẫu tin nhắn/email**: sửa 1 mẫu (đổi câu chào theo giọng mình), lưu, rồi mở lại | Mẫu đã sửa được lưu, dùng khi nhắn/gửi mail cho khách | | |
| 7.5 | Trong mẫu vừa sửa → **Khôi phục mẫu gốc** | Mẫu về lại câu gốc ban đầu, chỉ mẫu đó bị khôi phục | | |
| 7.6 | Cài đặt → **Ngôn ngữ: English** | Nhãn chính (tab, Hôm nay, form job, Cài đặt) đổi sang tiếng Anh; ghi lại phần nào vẫn còn tiếng Việt | | |
| 7.7 | Cài đặt → **Tiền tệ: USD** | Số tiền hiển thị dạng USD (chỉ đổi hiển thị, không quy đổi tỷ giá — kiểm tra 2.500.000 VND không bị đổi thành số USD sai) | | |
| 7.8 | Đổi lại ngôn ngữ Việt + tiền tệ VND | App về lại như cũ, không mất dữ liệu | | |
| 7.9 | Cài đặt → đổi **Tên gọi / Tên studio / Instagram** rồi ra màn Hôm nay | Lời chào dùng tên mới, không còn hiện "bạn" chung chung hay tên cũ | | |
| 7.10 | Cài đặt → sửa **bảng giá** 1 gói (vd: Portrait digital 3.000.000, film 1.000.000) rồi tạo job mới loại đó | Job mới lấy giá mới, job cũ giữ giá cũ | | |
| 7.11 | Tắt app hoàn toàn (vuốt khỏi đa nhiệm) rồi mở lại | Màu chủ đề, logo, ngôn ngữ, tiền tệ, tên studio, bảng giá đã đổi vẫn còn — không về mặc định | | |

## 8. Khoá Face ID + mã PIN

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 8.1 | Cài đặt → **Bật khoá Face ID**, đặt mã PIN dự phòng 4–6 số (ghi PIN ra giấy khi test, vd: 1234) | Bật được, app báo đã bật khoá | | |
| 8.2 | Khoá màn hình iPhone → mở lại FotoBro | App hiện màn khoá, mở được bằng Face ID | | |
| 8.3 | Ở màn khoá → **Dùng mã PIN**, nhập đúng PIN | Mở được app | | |
| 8.4 | Ở màn khoá → nhập sai PIN 1–2 lần | Báo sai, vẫn cho nhập lại (chưa khoá cứng) | | |
| 8.5 | Rời app hơn 2 phút rồi mở lại | App tự khoá lại, phải Face ID / PIN mới vào | | |
| 8.6 | Cài đặt → **Tắt khoá Face ID** (nhập PIN để xác nhận) | Tắt được, mở app lại không còn màn khoá | | |
| 8.7 | ⚠️ Chưa test 8.4 quá 5 lần sai liên tiếp ở bản này — nhập sai 5 lần sẽ bị khoá chờ tăng dần, đừng test tới mức này nếu không có bản sao lưu | — | | |

## 9. Sao lưu & khôi phục

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 9.1 | Cài đặt → **Tải bản sao lưu** | Tải được file `fotobro-sao-luu.json` về máy (kiểm tra trong Files) | | |
| 9.2 | Tạo thêm 1 job test + 1 khoản thu test sau khi tải sao lưu | Job/khoản mới có trong app | | |
| 9.3 | Cài đặt → **Mở bản sao lưu** → chọn file ở 9.1 → **Thay bằng bản sao lưu** | App về đúng trạng thái lúc 9.1: job/khoản ở 9.2 biến mất, dữ liệu cũ còn nguyên | | |
| 9.4 | Mở 1 file không phải bản sao lưu (vd: ảnh .jpg) bằng nút Mở bản sao lưu | App báo "không giống bản sao lưu", không xoá dữ liệu hiện có | | |
| 9.5 | Ghi chú: bản sao lưu v1 là file JSON trên máy, chưa có đồng bộ CloudKit — mất file + mất máy = mất dữ liệu nếu không tải sao lưu định kỳ | Đã đọc và hiểu | | |

## 10. Giọng nói — CÓ ĐIỀU KIỆN

> Chỉ test nếu bản TestFlight ghi rõ mic đã có ở v1. Nếu không có nút mic thì ghi ⏭️ BỎ QUA toàn mục 10 (mic dời sang v1.1).

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 10.1 | Màn Hôm nay → bấm mic, nói tiếng Việt: "Thêm job Portrait cho Test Mic ngày mai" | App hiện đúng chữ đã nghe, hỏi xác nhận trước khi tạo | | |
| 10.2 | Từ chối quyền mic (lần đầu bấm Không cho phép), bấm mic lại | App báo cần quyền mic + hướng dẫn bật, không crash | | |
| 10.3 | Nói ở nơi ồn (quán cà phê / ngoài đường) 1 lệnh đơn giản | Ghi lại có nghe đúng không; nếu sai thì ghi rõ câu nói và chữ app nghe được | | |

## 11. Hôm nay, nhắc lịch, hiệu năng, hiển thị

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 11.1 | Màn **Hôm nay**: kiểm tra buổi chụp hôm nay / ngày mai, job kẹt, tiền về chờ ghi | Hiện đúng job hôm nay + ngày mai, không hiện job đã Xong / đã huỷ | | |
| 11.2 | Tạo job chụp hôm nay 07:00, để app chạy nền tới giờ | (Nếu có nhắc trong app) Hiện nhắc trước buổi chụp đúng giờ; ghi rõ có/không có nhắc | | |
| 11.3 | Cuộn danh sách job dài (tạo 10 job test nhanh) | Cuộn mượt, không giật, không đứng app | | |
| 11.4 | Bật chế độ máy bay (mất mạng) rồi dùng app: mở job, ghi tiền, đổi bước | Dùng bình thường offline (Nấc 1 local-first); chỉ Google/Lịch Google là không tải được, app báo rõ | | |
| 11.5 | Xoay ngang iPhone (nếu app cho xoay) hoặc dùng iPhone cỡ nhỏ | Chữ/nút không tràn, không bị che bởi tai thỏ / nút Home ảo | | |
| 11.6 | Kiểm tra chữ tiếng Việt có dấu (vd: "Chốt cọc", "Đã giao", "Buổi chụp") | Không lỗi font, không mất dấu | | |
| 11.7 | Mở app bằng VoiceOver 1 phút (Cài đặt iPhone → Trợ năng) — chỉ test nhanh | Các nút chính đọc được tên, không phải "button" trống | | |

## 12. Dọn dẹp sau test

| # | Bước | Kết quả mong đợi | ✅ / ❌ / ⏭️ | Ghi chú |
|---|---|---|---|---|
| 12.1 | Xoá hết job test / khoản test, hoặc **Mở bản sao lưu** cũ để khôi phục sổ thật | Sổ sạch, không còn dữ liệu test | | |
| 12.2 | Tắt khoá Face ID test (nếu không muốn dùng tiếp) hoặc giữ nguyên theo ý mình | Đã quyết định rõ | | |
| 12.3 | Ghi lại vào bảng lỗi cuối file: tổng số ca ĐẠT / KHÔNG / BỎ QUA | Đã tổng hợp | | |

---

## Bảng lỗi (điền khi test)

| # | Ca test | Lỗi thấy được (ghi đúng chữ app hiện + các bước làm lại được) | Ảnh chụp màn hình (có/không) | Mức độ |
|---|---|---|---|---|
| 1 | | | | Chặn / Nặng / Nhẹ |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

Mức độ: **Chặn** = không test tiếp được / mất dữ liệu; **Nặng** = tính năng chính không làm được; **Nhẹ** = chữ sai, lệch giao diện, dùng được nhưng khó chịu.

## Tổng kết

- Tổng số ca: ____ ca
- ✅ ĐẠT: ____ ca
- ❌ KHÔNG: ____ ca (liệt kê số ca ở bảng lỗi trên)
- ⏭️ BỎ QUA: ____ ca (lý do: Google chưa có Client ID / mic chưa có ở v1 / …)
- Kết luận: ☐ Đủ để nộp TestFlight rộng hơn / ☐ Cần sửa lỗi chặn trước / ☐ Cần build mới rồi test lại
- Người test ký tên: __________
