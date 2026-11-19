# FotoBro iOS v1 — Ma trận test offline (từng tính năng × trạng thái mạng)

- App: FotoBro, Bundle ID `com.fotobro.app` — bản TestFlight v1
- Ngày lập ma trận: 20/11/2026
- Căn cứ phân loại online/offline: `PERFORMANCE.md` §4 (rà soát 20/11/2026) và
  `TESTFLIGHT-CHECKLIST.md` (§11.4, mục 4–6, 8–9). Chỉ đọc 2 file đó + checklist,
  không sửa code, không tạo tài khoản, không push GitHub.
- Dùng kèm: `TESTFLIGHT-CHECKLIST.md` (ca test chính), `NOTIFICATIONS.md`
  (nhắc lịch local), `BACKUP-V2.md` (sao lưu), `GOOGLE-SETUP.md` (Client ID Google).

## Quy ước

### 3 trạng thái mạng

| Trạng thái | Định nghĩa trong ma trận này | Cách tạo |
|---|---|---|
| **Online** | Wi-Fi hoặc 4G/5G ổn định, mở được google.com | Tắt chế độ máy bay, bật Wi-Fi/4G, mở Safari kiểm tra 1 trang |
| **Offline** | Không có mạng hẳn | **Chế độ máy bay** (Cài đặt → Chế độ máy bay → Bật), hoặc tắt cả Wi-Fi + Dữ liệu di động |
| **Chập chờn** | Mạng lúc có lúc mất, hoặc mất đúng giữa thao tác | Xem §2 "Cách test mạng chập chờn" — tắt Wi-Fi giữa chừng, bật/tắt chế độ máy bay nhanh, đi vào vùng sóng yếu (thang máy, tầng hầm) |

### Cách ghi kết quả

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ ĐẠT | Đúng như ô "Kết quả kỳ vọng" |
| ❌ KHÔNG | Sai / lỗi / crash / mất dữ liệu — bắt buộc ghi vào "Bảng lỗi" cuối file |
| ⏭️ BỎ QUA | Tính năng chưa sẵn sàng ở bản này (chỉ dùng cho ca có ghi "có điều kiện") |

**Dữ liệu test là hư cấu** (khách "Test Portrait", "Test Wedding"...). Không nhập
job/ảnh/tiền thật của khách. Test xong xoá dữ liệu test hoặc dùng "Mở bản sao lưu"
để khôi phục sổ cũ. Không test bằng tài khoản Google chính có mail khách quan
trọng nếu chưa rõ quyền — dùng tài khoản Google test trước.

**Biết trước khi test (không tính là lỗi):**
- Đăng nhập Google chỉ sẵn sàng khi đã dán Client ID chung vào
  `fotobro-config.js`. Nếu app báo "chưa sẵn sàng" thì ghi ⏭️ BỎ QUA ở các ca
  Google, không ghi lỗi.
- Nhập Lịch iPhone native chỉ có trên app iOS thật (EventKit). Không còn nhập
  file `.ics` / `.zip` ở v1 (đã bỏ hẳn).
- CloudKit (Nấc 2) ở v1 chỉ là placeholder `not-configured` — chưa đồng bộ thật,
  đừng test đồng bộ.
- Sao lưu ở v1 là file JSON tải về máy (`fotobro-sao-luu.json`), chưa phải CloudKit.
- Mic nhận diện giọng nói web đã dời sang v1.1; nút mic ở v1 báo "Giọng nói sẽ có
  ở bản v1.1". Gõ tay vẫn chạy offline (cùng parser `runCommand`).
- Token Google lưu ở sessionStorage: **mất khi đóng app** — đúng thiết kế, token
  phải đổi lại bằng refresh token (refresh token chỉ trả 1 lần đầu, cần mạng).

---

## 1. Ma trận tổng — tính năng × trạng thái mạng

Đọc theo hàng: mỗi tính năng có kết quả kỳ vọng riêng ở từng cột mạng.
Chi tiết bước test từng ô xem §3 (mã ca OT-01 → OT-40).

### Nhóm A — Lõi local-first (phải chạy đầy đủ cả 3 trạng thái)

| # | Tính năng | Online | Offline | Chập chờn |
|---|---|---|---|---|
| A1 | Mở app, màn Hôm nay (OT-01) | Mở ngay, không chờ mạng; hiện đúng job hôm nay/ngày mai, job kẹt, tiền chờ ghi | Y hệt online — mở ngay, đủ dữ liệu local, không màn trắng, không spinner chờ mạng | Y hệt online; không crash khi mạng chập chờn lúc mở app |
| A2 | Tạo / sửa / xoá job (OT-02) | Lưu ngay, giá tự điền đúng bảng giá (digital/film/cả hai) | Lưu ngay, không báo lỗi mạng, không mất dữ liệu | Lưu ngay; không tạo job trùng nếu mạng ngắt đúng lúc bấm Lưu |
| A3 | Pipeline 8 bước: tiến, nhảy bước, lùi bước (OT-03) | Chuyển bước đúng, thanh tiến độ nhích đúng | Y hệt online | Y hệt online; nhảy bước qua bước chưa xong vẫn hỏi xác nhận |
| A4 | Huỷ job / khôi phục job (OT-04) | Job huỷ biến khỏi pipeline, tiền + lịch giữ nguyên; khôi phục về Tư vấn | Y hệt online | Y hệt online |
| A5 | Cảnh báo job kẹt quá lâu (OT-05) | Hiện cảnh báo trong chi tiết job + 1 dòng nhắc trên Hôm nay | Y hệt online | Y hệt online |
| A6 | Sổ thu/chi, ghi cọc, thu nốt (OT-06) | Ghi được, đã thu/còn thiếu tính đúng | Y hệt online | Y hệt online; không ghi trùng 1 khoản 2 lần nếu mạng ngắt lúc lưu |
| A7 | Báo cáo ngày/tuần/tháng, lời từng job (OT-07) | Tổng thu/chi/còn thiếu đúng | Y hệt online | Y hệt online |
| A8 | Checklist chuẩn bị đồ + Phòng ban (OT-08) | Tick checklist lưu được, phòng ban mở đủ | Y hệt online | Y hệt online |
| A9 | Cài đặt, bảng giá, cá nhân hoá: màu/logo/ngôn ngữ/tiền tệ/tên studio (OT-09) | Đổi là áp dụng ngay, lưu lại sau khi tắt app mở lại | Y hệt online | Y hệt online |
| A10 | Ảnh trang chủ (IndexedDB, tối đa 60) (OT-10) | Ảnh đã lưu hiện ngay; thêm ảnh từ máy lưu được (thu nhỏ ≤1400 px) | Y hệt online — ảnh local không cần mạng | Y hệt online |
| A11 | Khoá Face ID / PIN (OT-11) | Khoá/mở bằng Face ID hoặc PIN; sai PIN báo sai, cho nhập lại | Y hệt online — khoá local, không cần mạng | Y hệt online |
| A12 | Sao lưu / khôi phục JSON trên máy (OT-12) | Tải `fotobro-sao-luu.json` về Files được; mở lại đúng trạng thái lúc sao lưu | Y hệt online — file local, không cần mạng | Y hệt online; file sao lưu không bị ghi dở/ghi trùng |
| A13 | Nhắc lịch local (đã đặt lịch) (OT-13) | Nhắc chụp trước 60 phút, hạn giao trước 24 giờ; iOS phát cả khi app đóng | Y hệt online — nhắc local không cần mạng, phát cả khi app đóng | Y hệt online; mất nhắc chỉ khi máy tắt nguồn đúng giờ nhắc, user từ chối quyền, hoặc bật Focus |
| A14 | Gõ lệnh bằng tay (parser `runCommand`) (OT-14) | Gõ "Thêm job..." → hiện chữ xác nhận, hỏi trước khi tạo | Y hệt online | Y hệt online |
| A15 | Đọc to câu trả lời (`speechSynthesis` tiếng Việt) (OT-15) | Đọc bằng giọng trên máy | Y hệt online — giọng trên máy, không cần mạng | Y hệt online |

### Nhóm B — Cần mạng (Google / link ngoài)

| # | Tính năng | Online | Offline | Chập chờn |
|---|---|---|---|---|
| B1 | Đăng nhập Google lần đầu — OAuth qua trình duyệt hệ thống (OT-16) | Mở Safari sang trang Google, đăng nhập xong quay lại app, hiện "Đã kết nối Google", không bắt dán Client ID | **Không đăng nhập được** — app báo rõ chưa có mạng / chưa sẵn sàng, không kẹt màn hình, không crash; job + sổ tiền vẫn dùng bình thường | Nếu mất mạng giữa chừng khi đang ở trang Google: quay lại app an toàn, trạng thái "chưa kết nối", không kẹt ở màn hình cũ; đăng nhập lại được khi có mạng |
| B2 | Làm mới token Google hết hạn (OT-17) | Tự làm mới lặng lẽ bằng refresh token, user không phải đăng nhập lại | **Không làm mới được** — các tính năng Google dùng dữ liệu đã cache lần trước (xem B3–B6), app báo rõ đang xem dữ liệu đã lưu; lõi local vẫn chạy | Làm mới thất bại thì giữ token cũ/cache cũ, không xoá dữ liệu đã tải, không đăng xuất user lặng lẽ; có mạng lại thì thử lại được |
| B3 | Đọc Google Lịch — tab Buổi chụp → Lịch (OT-18) | Hiện sự kiện Google 30 ngày tới, có nhãn "Google"; chạm 1 sự kiện → tạo được buổi chụp | **Không tải mới được** — hiện đúng câu `gState.error`: "Đang mất mạng — đang xem lịch đã lưu lần trước" + dùng dữ liệu đã cache; không crash, không màn trắng | Đang tải thì mất mạng: dừng tải an toàn, giữ cache cũ, hiện câu báo mất mạng; có mạng lại thì tải lại được (không cần khởi động lại app) |
| B4 | Ghi buổi chụp lên Google Lịch (OT-19) | Sự kiện xuất hiện trong Google Lịch thật (kiểm tra trên calendar.google.com) | **Không ghi được** — app báo rõ chưa có mạng, không tạo sự kiện rác local giả làm Google, job local vẫn lưu bình thường | Mất mạng đúng lúc bấm ghi: báo lỗi rõ, không ghi trùng khi có mạng lại; user bấm ghi lại thì chỉ tạo 1 sự kiện |
| B5 | Gmail — tiền về, khách hỏi chụp (OT-20) | Tìm được email báo tiền về, gợi ý ghi khoản thu đúng số tiền | **Không tải mới được** — dùng email đã tải lần trước (nếu có); nếu chưa từng tải thì báo rõ chưa có dữ liệu, không hiện email giả | Đang tải thì mất mạng: giữ danh sách cũ, báo mất mạng, không gợi ý ghi khoản thu từ email chưa tải xong |
| B6 | Gửi email cho khách bằng Gmail (OT-21) | Soạn sẵn đúng mẫu, bấm Gửi thì gửi được, khách nhận đúng nội dung | **Không gửi được** — app báo rõ chưa có mạng; bản nháp/mẫu không mất, gửi lại được khi có mạng | Mất mạng đúng lúc bấm Gửi: báo lỗi rõ, không gửi trùng khi có mạng lại (chỉ gửi 1 lần sau khi user bấm lại) |
| B7 | Danh bạ Google + Drive chỉ đọc (OT-22) | Đọc được danh bạ / file Drive đã liên kết | **Không tải mới được** — dùng dữ liệu đã cache (nếu có); chưa có thì báo rõ, không crash | Như B3: giữ cache cũ, báo mất mạng |
| B8 | Ngắt kết nối Google (OT-23) | Lịch/Gmail/Danh bạ đã tải bị xoá khỏi máy, job + sổ tiền giữ nguyên | Ngắt được offline (xoá dữ liệu Google local); job + sổ tiền giữ nguyên; lần đăng nhập sau cần mạng (xem B1) | Ngắt giữa chừng: dữ liệu Google local phải xoá sạch hoặc còn nguyên — không được xoá dở 1 nửa rồi báo đã ngắt |
| B9 | Mở link ngoài: Facebook / Messenger / Zalo / Instagram / Drive, link Google Lịch (OT-24) | Mở được app ngoài / trình duyệt | **Không mở được nội dung** — iOS báo không có mạng hoặc app ngoài báo lỗi; FotoBro không crash, không đứng màn hình trắng khi quay lại | Mở link lúc mạng chập chờn: FotoBro vẫn sống khi quay lại, dữ liệu không mất |
| B10 | CloudKit Nấc 2 (OT-25) | ⏭️ BỎ QUA — placeholder `not-configured`, chưa đồng bộ thật | ⏭️ BỎ QUA — như cột Online | ⏭️ BỎ QUA — như cột Online |

### Nhóm C — Tính năng native iOS (không phụ thuộc mạng FotoBro)

| # | Tính năng | Online | Offline | Chập chờn |
|---|---|---|---|---|
| C1 | Nhập Lịch iPhone native 1 chạm — EventKit, 30 ngày tới (OT-26) | Nhập được: sự kiện thành buổi chụp đúng tên/ngày/giờ/địa điểm; nhập lại không trùng | **Y hệt online** — Lịch iPhone là dữ liệu trên máy, không cần mạng | Y hệt online |
| C2 | Xuất lịch: "Thêm vào Lịch iPhone" trong chi tiết job (OT-27) | iPhone mở app Lịch với sự kiện điền sẵn; bấm Thêm thì có trong Lịch iPhone | **Y hệt online** — tạo sự kiện local, không cần mạng | Y hệt online |
| C3 | Từ chối quyền Lịch / quyền mic — báo + hướng dẫn bật lại (OT-28) | App báo rõ "chưa cho phép đọc Lịch" + hướng dẫn bật lại, không crash, không tạo job rác | Y hệt online | Y hệt online |
| C4 | Mic giọng nói (OT-29) | ⏭️ BỎ QUA ở v1 — nút mic báo "Giọng nói sẽ có ở bản v1.1"; gõ tay vẫn chạy (xem A14) | ⏭️ BỎ QUA — như cột Online | ⏭️ BỎ QUA — như cột Online |

### Nhóm D — Mở app / hiển thị (nền tảng cho cả 3 trạng thái)

| # | Tính năng | Online | Offline | Chập chờn |
|---|---|---|---|---|
| D1 | Cold start: mở app lần đầu sau khi cài (OT-30) | Mở lên màn Hôm nay, không chờ mạng (file local trong gói, không fetch lúc khởi động), không service worker | Y hệt online | Y hệt online |
| D2 | Mở app sau khi tắt hẳn (vuốt khỏi đa nhiệm) (OT-31) | Mở bình thường, dữ liệu + cá nhân hoá còn nguyên | Y hệt online | Y hệt online |
| D3 | Khoá màn hình iPhone rồi mở lại, dùng 5 phút (OT-32) | Không crash, không màn trắng, không tự đăng xuất | Y hệt online | Y hệt online |
| D4 | Cuộn danh sách job dài (10 job test) (OT-33) | Cuộn mượt, không giật | Y hệt online | Y hệt online |
| D5 | Xoay ngang / iPhone cỡ nhỏ / tai thỏ (OT-34) | Chữ/nút không tràn, không bị che | Y hệt online | Y hệt online |
| D6 | Dark mode iPhone + preset Tối (OT-35) | Nền đen, chữ đọc được, ảnh/tab thấy rõ | Y hệt online | Y hệt online |

---

## 2. Cách test mạng chập chờn (dùng chung cho mọi ca OT)

Làm theo đúng thứ tự — mỗi ca chập chờn chỉ cần 1 trong 4 cách dưới, ghi rõ đã
dùng cách nào vào cột "Ghi chú".

| Cách | Thao tác | Mô phỏng tình huống thật |
|---|---|---|
| **F1 — Tắt Wi-Fi giữa chừng** | Bắt đầu thao tác khi đang online → vuốt Control Center → tắt Wi-Fi đúng lúc app đang tải/ghi → xem app phản ứng → bật Wi-Fi lại | Đang dùng thì rớt Wi-Fi (quán cà phê, thang máy) |
| **F2 — Chế độ máy bay nhanh** | Bật chế độ máy bay 5–10 giây giữa thao tác → tắt đi → xem app có tự tải lại / báo rõ không | Mất sóng thoáng qua |
| **F3 — Vùng sóng yếu** | Ra thang máy / tầng hầm / chỗ sóng 1 vạch, làm thao tác Google (B3–B6) | Sóng yếu, tải dở dang |
| **F4 — Đổi mạng giữa chừng** | Đang dùng Wi-Fi thì tắt Wi-Fi để máy nhảy sang 4G (hoặc ngược lại) trong lúc tải | Đổi mạng khi di chuyển |

**Nguyên tắc kiểm tra cho mọi ca chập chờn (ghi vào kết quả):**
1. App không crash, không màn trắng, không đứng (kiểm tra bằng cách bấm tab khác).
2. Dữ liệu local không mất, không trùng (1 thao tác = tối đa 1 bản ghi).
3. App báo rõ trạng thái bằng chữ người dùng hiểu được (không báo lỗi kỹ thuật).
4. Có mạng lại thì thao tác làm lại được, không cần khởi động lại app.

---

## 3. Ca test chi tiết (OT-01 → OT-40)

### 3.1. Nhóm A — Lõi local-first

#### OT-01 — Mở app ở cả 3 trạng thái mạng

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Mở app bình thường | Vào màn Hôm nay ngay, không chờ mạng; hiện đúng job hôm nay/ngày mai, job kẹt, tiền chờ ghi |
| Offline | Bật **chế độ máy bay** → mở app | Y hệt online — không màn trắng, không spinner chờ mạng |
| Chập chờn | Mở app, ngay lúc màn hình đang hiện thì bật/tắt chế độ máy bay (F2) | Không crash, màn Hôm nay hiện đủ |

#### OT-02 — Tạo / sửa / xoá job offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tạo job "Test Portrait", Portrait, ngày mai 07:00, giá mặc định | Job ở Tư vấn, giá đúng bảng giá Portrait |
| Offline | Bật **chế độ máy bay** → tạo job "Test Wedding", sửa tên 1 job cũ, xoá 1 job test | Lưu ngay, không báo lỗi mạng; tắt chế độ máy bay → dữ liệu vẫn đúng |
| Chập chờn | Tạo job rồi **tắt Wi-Fi đúng lúc bấm Lưu** (F1) | Chỉ tạo 1 job, không trùng; bật Wi-Fi lại → job vẫn 1 |

#### OT-03 — Pipeline 8 bước offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Job Tư vấn → **Xong bước này** → chạm thẳng bước Hậu kỳ (nhảy bước) → lùi về Sắp chụp | Chuyển đúng từng bước, không kẹt, không mất tiền/ảnh |
| Offline | Bật **chế độ máy bay** → lặp lại toàn bộ bước trên với job khác | Y hệt online |
| Chập chờn | Nhảy bước trong lúc bật/tắt chế độ máy bay (F2) | Chuyển đúng 1 lần, không nhảy 2 bước; có hỏi xác nhận khi nhảy qua bước chưa xong |

#### OT-04 — Huỷ / khôi phục job offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Huỷ 1 job → kiểm tra pipeline → khôi phục về Tư vấn | Job huỷ biến khỏi pipeline, tiền + lịch giữ nguyên; khôi phục về Tư vấn |
| Offline | Bật **chế độ máy bay** → huỷ + khôi phục 1 job khác | Y hệt online |
| Chập chờn | Huỷ job rồi **tắt Wi-Fi đúng lúc bấm Huỷ** (F1) | Job chỉ huỷ 1 lần, không mất tiền/lịch kèm job |

#### OT-05 — Cảnh báo job kẹt offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tạo job, để nguyên 1 bước quá hạn giao (deadline đã qua) hoặc quá 7 ngày cùng 1 bước | Cảnh báo **job kẹt ở bước X** trong chi tiết job + 1 dòng nhắc trên Hôm nay |
| Offline | Bật **chế độ máy bay** → mở màn Hôm nay + chi tiết job kẹt | Cảnh báo vẫn hiện đủ |
| Chập chờn | (Không cần ca riêng — kiểm tra cùng OT-01) | Như cột Offline |

#### OT-06 — Sổ thu/chi: cọc, thu nốt, chi — offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Job Portrait 2.500.000 → Chốt cọc → ghi cọc 1.000.000 → Đã giao → nhắc thu nốt 1.500.000 → ghi nốt → còn thiếu về 0 | Đã thu/còn thiếu tính đúng từng bước |
| Offline | Bật **chế độ máy bay** → lặp lại với job 4.000.000, cọc 1.000.000, rồi bấm **Xong** | App hiện **cảnh báo còn thiếu 3.000.000** và hỏi xác nhận — không cho xong lặng lẽ |
| Chập chờn | Ghi khoản thu 1.500.000 rồi **tắt Wi-Fi đúng lúc bấm Lưu** (F1) | Chỉ ghi 1 khoản, không trùng; còn thiếu về 0 đúng 1 lần |

#### OT-07 — Báo cáo ngày/tuần/tháng offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Sổ tiền → xem báo cáo ngày/tuần/tháng sau OT-06 | Tổng thu/chi/còn thiếu đúng với các khoản đã ghi |
| Offline | Bật **chế độ máy bay** → xem lại báo cáo + ghi thêm 1 khoản chi (thuê lens 500.000, gắn 1 job) | Báo cáo cộng đúng khoản mới ngay, không cần mạng |
| Chập chờn | (Không cần ca riêng — kiểm tra cùng OT-06) | Như cột Offline |

#### OT-08 — Checklist + Phòng ban offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Checklist: tick vài món chuẩn bị đồ; Phòng ban: mở đủ các phòng | Tick lưu được, phòng ban mở đủ |
| Offline | Bật **chế độ máy bay** → tick/bỏ tick checklist, tắt app mở lại | Tick vẫn giữ đúng sau khi mở lại |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-09 — Cá nhân hoá offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Đổi màu chủ đề → thêm logo studio → sửa 1 mẫu tin nhắn → đổi ngôn ngữ English → tiền tệ USD | Áp dụng ngay; 2.500.000 VND chỉ đổi hiển thị USD, không quy đổi tỷ giá |
| Offline | Bật **chế độ máy bay** → đổi lại tiếng Việt + VND, sửa bảng giá Portrait, tắt app hoàn toàn rồi mở lại | Mọi cài đặt vẫn còn, không về mặc định, không mất dữ liệu |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-10 — Ảnh trang chủ offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Thêm 1 ảnh từ máy làm ảnh trang chủ; đổi ảnh theo ngày | Ảnh hiện ngay, đã thu nhỏ trước khi lưu |
| Offline | Bật **chế độ máy bay** → mở app → đổi sang ảnh khác đã lưu trong máy | Ảnh local hiện ngay, không cần mạng; không hiện khung ảnh trống |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-11 — Khoá Face ID / PIN offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Bật khoá Face ID, đặt PIN dự phòng (ghi ra giấy, vd: 1234) → khoá màn hình → mở lại bằng Face ID → mở bằng PIN | Mở được cả 2 cách |
| Offline | Bật **chế độ máy bay** → khoá màn hình → mở lại bằng Face ID/PIN; nhập sai PIN 1–2 lần | Mở được offline; sai PIN báo sai, vẫn cho nhập lại (chưa khoá cứng) |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

> ⚠️ Đừng test nhập sai PIN 5 lần liên tiếp — sai 5 lần sẽ bị khoá chờ tăng dần.
> Chỉ test sai 1–2 lần.

#### OT-12 — Sao lưu / khôi phục JSON offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | **Tải bản sao lưu** → kiểm tra file `fotobro-sao-luu.json` trong Files | Tải được file về máy |
| Offline | Bật **chế độ máy bay** → tạo thêm 1 job + 1 khoản thu test → **Mở bản sao lưu** → chọn file vừa tải → **Thay bằng bản sao lưu** | App về đúng trạng thái lúc sao lưu: job/khoản mới biến mất, dữ liệu cũ còn nguyên |
| Chập chờn | Mở 1 file không phải bản sao lưu (vd: ảnh .jpg) bằng nút Mở bản sao lưu | App báo "không giống bản sao lưu", không xoá dữ liệu hiện có |

#### OT-13 — Nhắc lịch local (đã đặt lịch)

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tạo job chụp hôm nay (giờ chụp sau thời điểm test ~10 phút để kiểm tra nhanh, nếu app có nhắc) → để app chạy nền tới giờ | Hiện nhắc trước buổi chụp đúng giờ (thiết kế: nhắc chụp trước 60 phút, hạn giao trước 24 giờ — xem `NOTIFICATIONS.md`; bridge hiện chưa đổi nhắc chụp thành 12 tiếng, ghi rõ giờ nhắc thực tế thấy được) |
| Offline | Bật **chế độ máy bay** trước giờ nhắc → để máy tới giờ nhắc | Nhắc vẫn phát khi offline, cả khi app đã đóng; **mất nhắc chỉ khi máy tắt nguồn đúng giờ nhắc, user từ chối quyền, hoặc bật Focus** — ghi rõ nếu rơi vào 1 trong 3 trường hợp này |
| Chập chờn | (Không cần ca riêng — nhắc local không dùng mạng) | Như cột Offline |

#### OT-14 — Gõ lệnh bằng tay offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Màn Hôm nay → gõ: "Thêm job Portrait cho Test Gõ ngày mai" | App hiện đúng chữ đã gõ, hỏi xác nhận trước khi tạo |
| Offline | Bật **chế độ máy bay** → gõ 1 lệnh tương tự | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-15 — Đọc to câu trả lời offline

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Bật đọc to câu trả lời (nếu có nút) | Đọc bằng giọng tiếng Việt trên máy |
| Offline | Bật **chế độ máy bay** → đọc to lại | Y hệt online — giọng trên máy, không cần mạng |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

### 3.2. Nhóm B — Cần mạng (Google / link ngoài)

#### OT-16 — Đăng nhập Google lần đầu (CÓ ĐIỀU KIỆN)

> Chỉ test khi đã dán Client ID Google chung vào `fotobro-config.js`. Nếu app
> báo "Đăng nhập Google chưa sẵn sàng" thì ghi ⏭️ BỎ QUA toàn ca, không ghi lỗi.

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Cài đặt → **Đăng nhập Google** → đăng nhập tài khoản Google test | Mở Safari (trình duyệt hệ thống, KHÔNG phải WebView trong app) → quay lại app tự động, hiện "Đã kết nối Google" |
| Offline | Bật **chế độ máy bay** → bấm Đăng nhập Google | App báo rõ chưa có mạng / chưa sẵn sàng, không kẹt màn hình, không crash; job + sổ tiền vẫn dùng bình thường |
| Chập chờn | Đăng nhập xong, đang ở trang Google thì **tắt Wi-Fi** (F1) → quay lại app | Trạng thái "chưa kết nối", không kẹt màn hình cũ; đăng nhập lại được khi có mạng |

#### OT-17 — Token Google hết hạn

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | (Khó ép hết hạn thủ công — chỉ test nếu token đã hết hạn tự nhiên) Mở tab Lịch Google | Tự làm mới lặng lẽ bằng refresh token, user không phải đăng nhập lại |
| Offline | Bật **chế độ máy bay** sau khi token đã hết hạn (hoặc đóng app rồi mở lại khi offline — token sessionStorage đã mất) | Các tính năng Google dùng dữ liệu đã cache lần trước; app báo rõ đang xem dữ liệu đã lưu; lõi local vẫn chạy |
| Chập chờn | Có mạng lại sau khi làm mới thất bại | Thử làm mới lại được, không xoá dữ liệu đã tải, không đăng xuất lặng lẽ |

#### OT-18 — Đọc Google Lịch

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tab Buổi chụp → Lịch: xem lịch Google 30 ngày tới | Hiện sự kiện Google, có nhãn "Google"; chạm 1 sự kiện → tạo được buổi chụp |
| Offline | Bật **chế độ máy bay** → mở lại tab Lịch | Hiện đúng câu: "Đang mất mạng — đang xem lịch đã lưu lần trước" + dữ liệu cache; không crash, không màn trắng |
| Chập chờn | Đang tải lịch thì **tắt Wi-Fi giữa chừng** (F1) | Dừng tải an toàn, giữ cache cũ, hiện câu báo mất mạng; bật Wi-Fi lại → tải lại được, không cần khởi động lại app |

#### OT-19 — Ghi buổi chụp lên Google Lịch

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Chi tiết job có ngày → ghi lên Google Lịch | Sự kiện xuất hiện trong Google Lịch thật (kiểm tra trên calendar.google.com) |
| Offline | Bật **chế độ máy bay** → bấm ghi lên Google Lịch | App báo rõ chưa có mạng, không tạo sự kiện rác local giả làm Google; job local vẫn lưu bình thường |
| Chập chờn | Bấm ghi rồi **tắt Wi-Fi đúng lúc** (F1) → bật Wi-Fi lại → bấm ghi lại | Chỉ tạo 1 sự kiện trên Google Lịch, không trùng |

#### OT-20 — Gmail: tiền về, khách hỏi

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Sổ tiền → mục Tiền về từ Gmail | Tìm được email báo tiền về (nếu có trong hộp thư test), gợi ý ghi khoản thu đúng số tiền |
| Offline | Bật **chế độ máy bay** → mở lại mục Tiền về từ Gmail | Dùng email đã tải lần trước (nếu có); chưa từng tải thì báo rõ chưa có dữ liệu, không hiện email giả |
| Chập chờn | Đang tải Gmail thì **tắt Wi-Fi giữa chừng** (F1) | Giữ danh sách cũ, báo mất mạng, không gợi ý ghi khoản thu từ email chưa tải xong |

#### OT-21 — Gửi email cho khách bằng Gmail

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Chi tiết job → gửi email cho khách bằng Gmail | Soạn sẵn đúng mẫu, bấm Gửi thì gửi được, khách nhận đúng nội dung |
| Offline | Bật **chế độ máy bay** → bấm gửi email | App báo rõ chưa có mạng; bản nháp/mẫu không mất, gửi lại được khi có mạng |
| Chập chờn | Bấm Gửi rồi **tắt Wi-Fi đúng lúc** (F1) → bật Wi-Fi lại → bấm Gửi lại | Chỉ gửi 1 email, không gửi trùng |

#### OT-22 — Danh bạ Google + Drive chỉ đọc

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Mở Danh bạ / Drive trong app | Đọc được danh bạ / file Drive đã liên kết |
| Offline | Bật **chế độ máy bay** → mở lại Danh bạ / Drive | Dùng dữ liệu đã cache (nếu có); chưa có thì báo rõ, không crash |
| Chập chờn | Đang tải thì **tắt Wi-Fi giữa chừng** (F1) | Giữ cache cũ, báo mất mạng |

#### OT-23 — Ngắt kết nối Google

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Cài đặt → **Ngắt kết nối Google** | Lịch/Gmail/Danh bạ đã tải bị xoá khỏi máy, job + sổ tiền giữ nguyên; đăng nhập lại được (OT-16) |
| Offline | Bật **chế độ máy bay** → ngắt kết nối | Ngắt được offline (xoá dữ liệu Google local); job + sổ tiền giữ nguyên; đăng nhập lại cần mạng |
| Chập chờn | Ngắt kết nối trong lúc bật/tắt chế độ máy bay (F2) | Dữ liệu Google local hoặc xoá sạch hoặc còn nguyên — không được xoá dở 1 nửa rồi báo đã ngắt |

#### OT-24 — Mở link ngoài

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Bấm link Facebook / Messenger / Zalo / Instagram / Drive trong app | Mở được app ngoài / trình duyệt |
| Offline | Bật **chế độ máy bay** → bấm 1 link ngoài → quay lại FotoBro | iOS/app ngoài báo không có mạng; FotoBro không crash, không màn trắng khi quay lại |
| Chập chờn | Bấm link lúc mạng chập chờn (F3 — vùng sóng yếu) → quay lại FotoBro | FotoBro vẫn sống, dữ liệu không mất |

#### OT-25 — CloudKit Nấc 2

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online / Offline / Chập chờn | — | ⏭️ BỎ QUA toàn ca ở v1 — placeholder `not-configured`, chưa đồng bộ thật. Đừng test đồng bộ. |

### 3.3. Nhóm C — Tính năng native iOS

#### OT-26 — Nhập Lịch iPhone native 1 chạm

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tạo sẵn 2 sự kiện trong app Lịch iPhone (vd: "Chụp Test Lịch" ngày mai 09:00, có địa điểm) → FotoBro → **Nhập từ Lịch iPhone** → Cho phép quyền | Sự kiện 30 ngày tới tự thành buổi chụp (đúng tên, ngày, giờ, địa điểm); nhập lại lần 2 không tạo job trùng |
| Offline | Bật **chế độ máy bay** → nhập lại từ Lịch iPhone | **Y hệt online** — Lịch iPhone là dữ liệu trên máy, không cần mạng |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-27 — Xuất lịch: "Thêm vào Lịch iPhone"

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Chi tiết job có ngày chụp → **Thêm vào Lịch iPhone** → bấm Thêm trong app Lịch | Sự kiện có trong Lịch iPhone, đúng giờ |
| Offline | Bật **chế độ máy bay** → làm lại với job khác; thử với job chưa có ngày chụp | **Y hệt online**; job chưa có ngày thì app báo "job chưa có ngày chụp", không tạo file rỗng |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-28 — Từ chối quyền Lịch / mic

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Cài đặt iPhone → FotoBro → Lịch → tắt → bấm Nhập từ Lịch iPhone | App báo rõ "chưa cho phép đọc Lịch" + hướng dẫn bật lại, không crash, không tạo job rác |
| Offline | Bật **chế độ máy bay** → lặp lại bước trên | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-29 — Mic giọng nói

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online / Offline / Chập chờn | Bấm mic ở màn Hôm nay | ⏭️ BỎ QUA ở v1 — nút mic báo "Giọng nói sẽ có ở bản v1.1"; gõ tay vẫn chạy (xem OT-14). Chỉ test nếu bản TestFlight ghi rõ mic đã có ở v1. |

### 3.4. Nhóm D — Mở app / hiển thị

#### OT-30 — Cold start (mở lần đầu sau khi cài)

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Cài qua TestFlight → mở app | Vào màn Hôm nay, không chờ mạng (file local trong gói, không fetch lúc khởi động), không service worker |
| Offline | Gỡ + cài lại (hoặc test trên máy thứ 2) → bật **chế độ máy bay** trước khi mở lần đầu | Y hệt online — mở được offline ngay từ lần đầu |
| Chập chờn | Mở lần đầu trong lúc bật/tắt chế độ máy bay (F2) | Không crash, không màn trắng |

#### OT-31 — Mở lại sau khi tắt hẳn

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Vuốt app khỏi đa nhiệm → mở lại | Dữ liệu + cá nhân hoá còn nguyên |
| Offline | Bật **chế độ máy bay** → vuốt app khỏi đa nhiệm → mở lại | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-32 — Khoá màn hình rồi mở lại, dùng 5 phút

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Khoá màn hình iPhone → mở lại app, dùng 5 phút bình thường | Không crash, không màn trắng, không tự đăng xuất |
| Offline | Bật **chế độ máy bay** → lặp lại | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-33 — Cuộn danh sách job dài

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Tạo 10 job test nhanh → cuộn danh sách | Cuộn mượt, không giật, không đứng app |
| Offline | Bật **chế độ máy bay** → cuộn lại | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-34 — Xoay ngang / iPhone cỡ nhỏ / tai thỏ

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Xoay ngang iPhone (nếu app cho xoay); vuốt qua 5 tab dưới | Chữ/nút không tràn, không bị che bởi tai thỏ / Dynamic Island / nút Home ảo |
| Offline | Bật **chế độ máy bay** → lặp lại | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

#### OT-35 — Dark mode iPhone + preset Tối

| Trạng thái | Bước | Kết quả kỳ vọng |
|---|---|---|
| Online | Cài đặt iPhone → Màn hình → Tối → mở app; đổi preset màu Tối trong app | Nền đen, chữ trắng/xám sáng, không có chữ xám mờ khó đọc, ảnh/tab thấy rõ |
| Offline | Bật **chế độ máy bay** → lặp lại | Y hệt online |
| Chập chờn | (Không cần ca riêng) | Như cột Offline |

---

## 4. Ca "bẫy" — mất mạng đúng thời điểm nhạy cảm (chỉ test khi đã xong §3)

Các ca này bắt lỗi hay gặp nhất của app local-first: ghi trùng, ghi dở, kẹt
trạng thái. Mỗi ca chỉ cần làm 1 lần, ghi rõ cách F1–F4 đã dùng.

| # | Tình huống | Bước | Kết quả kỳ vọng | Liên quan |
|---|---|---|---|---|
| OT-36 | Mất mạng đúng lúc **lưu job mới** | Tạo job → **tắt Wi-Fi đúng lúc bấm Lưu** (F1) → bật lại → kiểm tra danh sách | Chỉ 1 job mới, không trùng | OT-02 |
| OT-37 | Mất mạng đúng lúc **ghi khoản thu** | Ghi thu 1.500.000 → **tắt Wi-Fi đúng lúc bấm Lưu** (F1) → bật lại → kiểm tra còn thiếu | Chỉ 1 khoản thu, còn thiếu về 0 đúng 1 lần | OT-06 |
| OT-38 | Mất mạng đúng lúc **ghi lên Google Lịch** | Ghi job lên Google Lịch → **tắt Wi-Fi đúng lúc bấm ghi** (F1) → bật lại → kiểm tra calendar.google.com | Chỉ 1 sự kiện trên Google Lịch | OT-19 |
| OT-39 | Mất mạng đúng lúc **gửi email Gmail** | Gửi email khách → **tắt Wi-Fi đúng lúc bấm Gửi** (F1) → bật lại → kiểm tra hộp thư gửi | Chỉ 1 email được gửi | OT-21 |
| OT-40 | Mất mạng đúng lúc **khôi phục sao lưu** | Mở bản sao lưu → **bật chế độ máy bay đúng lúc bấm Thay bằng bản sao lưu** (F2) → tắt đi | Dữ liệu hoặc về đúng bản sao lưu, hoặc giữ nguyên bản hiện tại — không được ở trạng thái dở dang (mất 1 nửa job/tiền) | OT-12 |

---

## 5. Thứ tự test gợi ý (1 buổi, khoảng 60–90 phút)

1. **Chuẩn bị (online):** tạo 2 sự kiện Lịch iPhone (OT-26), tải 1 bản sao lưu
   (OT-12), ghi PIN test ra giấy (OT-11). Dùng tài khoản Google test.
2. **Online hết 1 lượt:** OT-01 → OT-15 (nhóm A), OT-16 → OT-24 (nhóm B),
   OT-26 → OT-28 (nhóm C), OT-30 → OT-35 (nhóm D).
3. **Offline hết 1 lượt:** bật **chế độ máy bay**, lặp lại OT-01 → OT-15,
   OT-18 → OT-24 (chỉ kiểm tra câu báo + cache), OT-26 → OT-28, OT-30 → OT-35.
   Nhóm A phải ĐẠT 100% offline — đây là cam kết local-first của v1.
4. **Chập chờn:** làm các ca F1 trong OT-02/OT-06/OT-19/OT-21 + OT-36 → OT-40.
5. **Dọn dẹp:** xoá hết job/khoản test, hoặc Mở bản sao lưu cũ để khôi phục sổ
   thật; tắt khoá Face ID test nếu không muốn dùng tiếp.

---

## 6. Bảng ghi kết quả (điền khi test)

- Người test: __________ — iPhone: __________ — iOS: __________ — Bản TestFlight: __________
- Ngày test: ____ / ____ / 2026

| Ca | Online | Offline | Chập chờn | Ghi chú (cách F1–F4 đã dùng, chữ app hiện) |
|---|---|---|---|---|
| OT-01 | | | | |
| OT-02 | | | | |
| OT-03 | | | | |
| OT-04 | | | | |
| OT-05 | | | | |
| OT-06 | | | | |
| OT-07 | | | | |
| OT-08 | | | | |
| OT-09 | | | | |
| OT-10 | | | | |
| OT-11 | | | | |
| OT-12 | | | | |
| OT-13 | | | | |
| OT-14 | | | | |
| OT-15 | | | | |
| OT-16 | | | | |
| OT-17 | | | | |
| OT-18 | | | | |
| OT-19 | | | | |
| OT-20 | | | | |
| OT-21 | | | | |
| OT-22 | | | | |
| OT-23 | | | | |
| OT-24 | | | | |
| OT-25 | | | | |
| OT-26 | | | | |
| OT-27 | | | | |
| OT-28 | | | | |
| OT-29 | | | | |
| OT-30 | | | | |
| OT-31 | | | | |
| OT-32 | | | | |
| OT-33 | | | | |
| OT-34 | | | | |
| OT-35 | | | | |
| OT-36 | | | | |
| OT-37 | | | | |
| OT-38 | | | | |
| OT-39 | | | | |
| OT-40 | | | | |

## Bảng lỗi (điền khi test)

| # | Ca test | Lỗi thấy được (ghi đúng chữ app hiện + các bước làm lại được) | Ảnh chụp màn hình (có/không) | Mức độ |
|---|---|---|---|---|
| 1 | | | | Chặn / Nặng / Nhẹ |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

Mức độ: **Chặn** = không test tiếp được / mất dữ liệu; **Nặng** = tính năng chính
không làm được; **Nhẹ** = chữ sai, lệch giao diện, dùng được nhưng khó chịu.

## Tổng kết

- Tổng số ca: 40 ca (OT-01 → OT-40)
- ✅ ĐẠT: ____ ca
- ❌ KHÔNG: ____ ca (liệt kê số ca ở bảng lỗi trên)
- ⏭️ BỎ QUA: ____ ca (lý do: Google chưa có Client ID / mic chưa có ở v1 / CloudKit chưa có ở v1 / …)
- Kết luận: ☐ Đủ để nộp TestFlight rộng hơn / ☐ Cần sửa lỗi chặn trước / ☐ Cần build mới rồi test lại
- Người test ký tên: __________

---

## Ghi chú nguồn (để đối chiếu khi ma trận và code lệch nhau)

- Phân loại online/offline: `PERFORMANCE.md` §4 — lõi app (job, tiền, nhắc)
  chạy hoàn toàn không cần mạng; chỉ Google/CloudKit/link ngoài cần mạng.
- Câu báo mất mạng của Google: `PERFORMANCE.md` §4 — `gState.error` hiện
  "Đang mất mạng — đang xem lịch đã lưu lần trước" và dùng dữ liệu đã cache.
- Nhắc lịch: `NOTIFICATIONS.md` — nhắc chụp trước 60 phút, hạn giao trước
  24 giờ; bridge hiện chưa đổi nhắc chụp thành 12 tiếng như thiết kế v1 muốn.
  Nhắc đã đặt thì iOS phát cả khi tắt app; mất nếu máy tắt nguồn đúng giờ nhắc
  hoặc user từ chối quyền / bật Focus.
- Token: `PERFORMANCE.md` §3 — token Google ở sessionStorage, mất khi đóng app;
  refresh token chỉ trả 1 lần đầu.
- Mic: `PERFORMANCE.md` §4 — plugin speech-recognition đã gỡ khỏi
  `package.json` (thiếu `Package.swift`); nút mic ở v1 báo "Giọng nói sẽ có ở
  bản v1.1"; gõ tay chạy cùng parser nên không mất tính năng.
- CloudKit: `TESTFLIGHT-CHECKLIST.md` — Nấc 2 ở v1 chỉ là placeholder
  `not-configured`, chưa đồng bộ thật.
- Sao lưu: `TESTFLIGHT-CHECKLIST.md` §9 — v1 là file JSON trên máy, chưa có
  đồng bộ CloudKit; mất file + mất máy = mất dữ liệu nếu không tải sao lưu định kỳ.
- Giới hạn localStorage `troLyXeo.v1` ~5 MB (`PERFORMANCE.md` §3): nếu test
  offline với dữ liệu lớn (vài trăm job + vài nghìn khoản thu chi) mà app báo
  lỗi lưu thì ghi vào bảng lỗi — đó là lỗi thật, không phải lỗi do mất mạng.
