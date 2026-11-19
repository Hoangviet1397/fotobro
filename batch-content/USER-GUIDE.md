# FotoBro — Hướng dẫn sử dụng (iOS v1)

> Trợ lý cho photographer tự do: quản lý job, tiền bạc và lịch chụp trong một app.
> Bundle ID: `com.fotobro.app` · v1 · Local-first — dữ liệu lưu trên máy của bạn.

---

## 1. Mở đầu — FotoBro là gì?

### 1.1. FotoBro giúp gì cho bạn?
- Nhìn một màn hình là biết **hôm nay làm gì**: job nào chụp, job nào tới hạn giao ảnh, job nào còn thiếu tiền.
- Theo dõi mỗi job từ lúc khách nhắn tin tới lúc giao ảnh xong và thu đủ tiền.
- Ghi thu / chi rõ ràng theo từng job, xem báo cáo ngày / tuần / tháng.
- Nhắn khách nhanh bằng mẫu tin nhắn có sẵn, tính giá đúng (Digital / Film / Cả hai).
- Nhắc lịch chụp, giao ảnh, thu tiền — không cần nhớ bằng đầu.

### 1.2. Ai nên dùng?
- Photographer tự do chụp Portrait, Couple, Wedding, Lookbook, Event.
- Studio nhỏ, làm việc một mình hoặc nhóm nhỏ.
- Người muốn một app đơn giản, mở lên là dùng được ngay — không cần học.

### 1.3. Nguyên tắc của v1
- **Local-first:** dữ liệu ở trên iPhone của bạn trước đã. Không bắt buộc tạo tài khoản để dùng.
- **Tối giản:** chỉ giữ lõi — Hôm nay, job, tiền, lịch, mẫu tin nhắn, máy tính giá.
- **Tối đa 3 chạm:** việc thường làm (xem hôm nay, đổi bước job, ghi tiền) làm trong 3 chạm.
- **Miễn phí ở Nấc 1** (dùng local). Đồng bộ / sao lưu mã hoá và tính năng nhóm / studio thuộc Nấc 2 / 3 (có thu phí) — sẽ có sau.

### 1.4. Tổng quan các tab / màn hình chính
| Màn hình | Dùng để làm gì |
|---|---|
| **Hôm nay** | Việc cần làm hôm nay: job sắp chụp, job kẹt quá lâu, job tới hạn giao / thu tiền |
| **Job** | Danh sách job theo pipeline 8 bước |
| **Tiền** | Sổ thu / chi, báo cáo ngày / tuần / tháng |
| **Lịch** | Lịch chụp / giao ảnh, nhắc lịch |
| **Cài đặt** | Bảng giá, mẫu tin nhắn, ngôn ngữ, tiền tệ, khoá, sao lưu |

### 1.5. Thuật ngữ nhanh
- **Job:** một buổi chụp / một khách hàng (ví dụ: Wedding Anh A — 20/12).
- **Pipeline:** 8 bước một job đi qua, từ Tư vấn tới Xong (xem §4).
- **Cọc:** tiền khách đặt trước khi chốt chụp.
- **Thu nốt:** số tiền còn lại khách phải trả khi giao ảnh.

---

## 2. Thiết lập lần đầu (chỉ làm một lần, khoảng 5 phút)

### 2.1. Cài app và mở lần đầu
1. Cài FotoBro từ App Store, mở app.
2. Xem nhanh màn hình giới thiệu (onboarding): Hôm nay → Job → Tiền → Lịch.
3. Chọn **ngôn ngữ**: Tiếng Việt / English.
4. Chọn **tiền tệ hiển thị**: VND / USD.
   - Lưu ý: chỉ đổi cách hiển thị, **không quy đổi tỷ giá**. Số tiền bạn nhập VND vẫn là VND.

### 2.2. Cá nhân hoá chung (tuỳ chọn, làm sau cũng được)
1. Vào **Cài đặt → Giao diện**:
   - **Màu chủ đề:** chọn 1 trong 3 preset có sẵn.
   - **Logo studio:** tải logo của bạn lên (hiện trên màn hình chính / khi xuất báo cáo).
   - **Chế độ tối:** app theo hệ thống iOS (nền trắng sạch / dark mode đen).
2. Giao diện v1 theo chuẩn tối giản kiểu Apple Music: Large Title, chữ SF Pro, 1 màu nhấn, thẻ bo góc lớn, tab bar mờ.

### 2.3. Nhập bảng giá của bạn
1. Vào **Cài đặt → Bảng giá**.
2. Giá Digital mặc định (một giá cho mỗi loại — tự điền khi chọn loại job):
   - Portrait: 2.500.000đ · Couple: 4.000.000đ · Wedding: 15.000.000đ
   - Lookbook: 8.000.000đ · Event: 5.000.000đ
   - Sửa lại theo giá của bạn — con số trên chỉ là giá khởi điểm.
3. **Giá Film — bảng riêng từng gói:**
   - Film là lựa chọn cho mọi gói, không hard-code giá.
   - Nhập giá film cho từng loại gói trong Cài đặt. Mặc định là 0 = chưa đặt.
   - Chưa nhập giá film thì máy tính giá sẽ nhắc bạn nhập, không tự đoán giá.
4. Khi tạo job, chọn **Chụp bằng: Digital / Film / Cả hai** (Cả hai = Digital + Film). Giá tự tính theo lựa chọn đó.

### 2.4. Kết nối Google — 1 chạm (tuỳ chọn)
- Vào **Cài đặt → Google → Đăng nhập Google** là có hết — không cần tự tạo Google Cloud project, không cần dán Client ID.
- Dùng chung 1 Client ID của FotoBro (đã xác minh 1 lần phía Google).
- Sau khi đăng nhập: xem Lịch Google, ghi lịch, đọc Gmail (tiền về, khách hỏi chụp) — theo quyền bạn cho phép.
- Muốn tắt: vào Cài đặt → Google → Đăng xuất. Dữ liệu local trong app vẫn còn.

### 2.5. Nhập lịch từ Lịch iPhone — 1 chạm (tuỳ chọn)
- Vào **Lịch → Nhập từ Lịch iPhone**, cho phép truy cập Lịch, chọn nhập.
- App nạp trực tiếp qua EventKit (chỉ làm được trong app native iOS).
- Không còn nhập file `.ics` / `.zip` hay xuất `.zip` từ Google ở v1 — đã bỏ hẳn theo quyết định v1.
- Sau khi nhập, sự kiện lịch thành job / nhắc hẹn trong app; nhắc trong app vẫn là nhắc chính.

### 2.6. Bật khoá app (khuyên dùng)
- Vào **Cài đặt → Khoá**: bật **Face ID** hoặc đặt **mã PIN**.
- Mỗi lần mở app sẽ hỏi Face ID / PIN trước khi hiện job và sổ tiền.
- Quên PIN: làm theo hướng dẫn khôi phục trong app (không gửi PIN của bạn đi đâu).

### 2.7. Bật thông báo / nhắc lịch
- Cho phép **Thông báo** khi iOS hỏi lần đầu.
- Nhắc chụp, nhắc giao ảnh, nhắc thu tiền, nhắc job kẹt quá lâu — xem §6.

---

## 3. Tạo job mới — từ lúc khách nhắn tin

### 3.1. Tạo job trong 30 giây
1. Mở tab **Job → + Job mới** (hoặc từ màn hình Hôm nay → +).
2. Nhập: tên khách, loại job (Portrait / Couple / Wedding / Lookbook / Event).
3. Chọn **Chụp bằng: Digital / Film / Cả hai**.
4. Nhập ngày chụp, giờ, địa điểm (tuỳ chọn — nhập sau cũng được).
5. Giá tự điền theo bảng giá. Sửa tay được nếu báo giá riêng cho khách này.
6. Bấm **Lưu** — job mới nằm ở bước **Tư vấn**.

> Mẹo: khách nhắn qua Facebook / Messenger / Gmail — copy tên + ngày giờ rồi dán vào form, không cần gõ lại từ đầu.

### 3.2. Thêm thông tin cho job (làm dần, không cần đủ ngay)
- Số điện thoại / Facebook / Messenger / Gmail của khách (để nhắn nhanh, xem §7).
- Ghi chú: yêu cầu đặc biệt, concept, địa điểm, người đi cùng.
- Tiền cọc: ghi khi khách chốt (xem §4.2, §5).
- Thêm vào Lịch iPhone: trong chi tiết job → **Thêm vào Lịch iPhone** (1 nút duy nhất).

### 3.3. Tìm job cũ
- Tìm theo tên khách, loại job, ngày chụp, hoặc bước pipeline.
- Lọc: job đang làm / job đã xong / job đã huỷ.

---

## 4. Pipeline 8 bước — theo dõi job từ đầu tới cuối

### 4.1. 8 bước là gì?
```
Tư vấn → Chốt cọc → Sắp chụp → Đã chụp
→ Chọn ảnh → Hậu kỳ → Đã giao → Xong
```

| Bước | Nghĩa là gì | Xong bước này khi… |
|---|---|---|
| 1. Tư vấn | Khách đang hỏi, chưa chốt | Bạn đã báo giá, khách đang cân nhắc |
| 2. Chốt cọc | Khách đồng ý chụp | Đã nhận cọc (ghi số tiền cọc, xem §4.2) |
| 3. Sắp chụp | Đã chốt, đang chuẩn bị | Đã chốt ngày / giờ / địa điểm, đồ nghề sẵn sàng |
| 4. Đã chụp | Buổi chụp đã xong | Ảnh gốc đã về máy / đã sao lưu |
| 5. Chọn ảnh | Đang chọn ảnh giao khách | Đã chốt danh sách ảnh cần hậu kỳ |
| 6. Hậu kỳ | Đang chỉnh sửa | Ảnh đã sửa xong, sẵn sàng giao |
| 7. Đã giao | Đã giao ảnh cho khách | Khách đã nhận đủ ảnh |
| 8. Xong | Hoàn tất | Đã thu đủ tiền, không còn việc tồn |

### 4.2. Gắn tiền vào từng bước
- **Chốt cọc:** ghi số tiền cọc ngay khi nhận — job mới được tính là đã chốt.
- **Đã giao:** app nhắc **thu nốt** số tiền còn lại.
- **Xong:** nếu còn thiếu tiền, app **cảnh báo** — không cho xong trong im lặng. Thu đủ rồi mới bấm Xong, hoặc ghi rõ lý do (giảm giá / miễn phần còn lại).

### 4.3. Chuyển bước — nhảy thẳng tới bước bất kỳ
- Mở chi tiết job → bấm vào bước muốn tới (không cần đi lần lượt từng bước).
- Ví dụ: khách huỷ chọn ảnh, chụp lại — bấm thẳng về **Sắp chụp**.
- Mỗi lần chuyển bước, app ghi lại ngày giờ (để biết job kẹt ở bước nào bao lâu).

### 4.4. Job kẹt quá lâu thì sao?
- Job nằm một bước quá lâu (ví dụ: Chọn ảnh 2 tuần chưa xong) sẽ **báo lên màn hình Hôm nay** để bạn xử lý.
- Mở job đó, nhắn khách hỏi, hoặc chuyển bước / cập nhật ngày hẹn.

### 4.5. Huỷ / Không chốt — và khôi phục
- Khách không chốt / huỷ job: đổi trạng thái thành **Huỷ** hoặc **Không chốt** (không xoá job).
- Job đã huỷ vẫn tìm lại được, xem lại được lịch sử.
- Khách quay lại: bấm **Khôi phục** — job về lại đúng bước trước khi huỷ.

---

## 5. Tiền bạc — sổ thu / chi và báo cáo

### 5.1. Sổ tiền hoạt động thế nào?
- Mọi khoản thu / chi đều gắn với một job (hoặc ghi là chi vận hành chung).
- Thu: cọc, thu nốt khi giao ảnh, thu phát sinh (thêm giờ, thêm ảnh, in album…).
- Chi: đi lại, ăn uống buổi chụp, thuê đồ / địa điểm, chi vận hành tháng, mua thiết bị (kèm khấu hao).

### 5.2. Ghi một khoản trong 10 giây
1. Mở job → **Tiền** → **+ Thu** / **+ Chi**.
2. Nhập số tiền, chọn loại (Cọc / Thu nốt / Phát sinh / Đi lại / Vận hành / Thiết bị…).
3. Ghi chú ngắn (tuỳ chọn) → Lưu.
- Số dư của job (đã thu / còn thiếu / tổng chi) cập nhật ngay.

### 5.3. Xem báo cáo
- Vào tab **Tiền → Báo cáo**: chọn **Ngày / Tuần / Tháng**.
- Xem: tổng thu, tổng chi, lãi, job nào thu nhiều nhất, khoản chi lớn nhất.
- Dùng báo cáo tháng để biết tháng này làm được bao nhiêu, chi bao nhiêu.

### 5.4. Máy tính giá
- Vào **Máy tính giá** (trong tab Tiền hoặc khi tạo job).
- Chọn loại job + **Digital / Film / Cả hai** → app tính giá theo bảng giá của bạn.
- Film chưa đặt giá (0đ) thì app nhắc nhập giá film trước.
- Giá tính ra chỉ để báo khách — sửa tay được trước khi ghi vào job.

### 5.5. Quy tắc tiền bạc cần nhớ
- Chưa thu đủ tiền thì đừng bấm **Xong** — app sẽ cảnh báo.
- Cọc ghi ngay khi nhận, đừng để cuối tháng mới ghi lại (dễ quên, dễ sai).
- Chi theo job ghi vào đúng job đó — cuối tháng mới biết job nào thật sự có lãi.

---

## 6. Lịch và nhắc việc

### 6.1. Màn hình Hôm nay — bắt đầu ngày ở đây
- Mở app buổi sáng, màn hình **Hôm nay** cho biết:
  - Hôm nay chụp job nào, mấy giờ, ở đâu.
  - Job nào tới hạn giao ảnh / thu tiền hôm nay.
  - Job nào kẹt quá lâu cần xử lý.
- Bấm vào một việc là mở thẳng job đó.

### 6.2. Nhắc lịch
- Nhắc trước giờ chụp, trước hạn giao ảnh, trước hạn thu tiền.
- Nhắc trong app là nhắc chính — kể cả khi bạn không mở app.
- Đổi giờ nhắc: **Cài đặt → Thông báo**.

### 6.3. Lịch iPhone và Google Lịch
- **Nhập từ Lịch iPhone:** 1 chạm, qua EventKit (xem §2.5).
- **Xuất ra Lịch iPhone:** trong chi tiết job → **Thêm vào Lịch iPhone**.
- **Google Lịch:** sau khi đăng nhập Google (§2.4), xem và ghi lịch trực tiếp.
- Nếu lịch trên iPhone và trong app lệch nhau: kiểm tra xem job đã bấm **Thêm vào Lịch iPhone** chưa, và quyền truy cập Lịch còn bật không (**Cài đặt iPhone → FotoBro → Lịch**).

---

## 7. Mẫu tin nhắn — nhắn khách nhanh, đúng ý

### 7.1. Dùng mẫu có sẵn
- Vào **Mẫu tin nhắn** (hoặc trong chi tiết job → **Nhắn khách**).
- Chọn mẫu theo tình huống: báo giá, nhắc cọc, nhắc lịch chụp, giao ảnh, nhắc thu nốt, cảm ơn sau buổi chụp…
- App tự điền tên khách, loại job, ngày giờ, số tiền — bạn chỉ cần xem lại rồi gửi qua Messenger / Facebook / Gmail.

### 7.2. Sửa mẫu và khôi phục gốc
- **Cài đặt → Mẫu tin nhắn / Email:** sửa lời văn theo cách nói của bạn.
- Sửa sai / muốn về mẫu ban đầu: bấm **Khôi phục gốc** cho mẫu đó.
- Mẫu bạn sửa chỉ đổi trên máy bạn, không ảnh hưởng người dùng khác.

### 7.3. Gửi qua app ngoài
- FotoBro không nhắn thay bạn trong app chat — nó soạn sẵn nội dung, bạn bấm gửi qua Messenger / Gmail / tin nhắn.
- Cách này giữ đúng tài khoản và lịch sử chat của bạn với khách.

---

## 8. Giọng nói và gõ tay

### 8.1. Ra lệnh bằng giọng nói
- Bấm nút **mic** trên màn hình Hôm nay / Job, nói lệnh tiếng Việt, ví dụ:
  - “Tạo job Wedding Anh A ngày 20 tháng 12”
  - “Job Lan Anh chuyển sang Đã chụp”
  - “Ghi thu 5 triệu job Wedding Anh A”
- App hiện chữ xác nhận những gì nó nghe được — kiểm tra rồi mới bấm xác nhận.

### 8.2. Gõ tay dự phòng
- Nếu mic nghe sai, ồn, hoặc bạn đang ở chỗ không tiện nói: gõ lệnh bằng tay vào cùng ô đó.
- Mọi việc làm bằng giọng nói đều làm được bằng tay — giọng nói chỉ để nhanh hơn.

### 8.3. Lưu ý về giọng nói ở v1
- Plugin giọng nói native đang được sửa để tương thích Capacitor 8; nếu mic chưa chạy trên máy bạn ở v1, dùng gõ tay và chờ v1.1.
- Kiểm tra quyền mic: **Cài đặt iPhone → FotoBro → Micro**.

---

## 9. Sao lưu và khôi phục (JSON)

### 9.1. Vì sao phải sao lưu?
- Dữ liệu v1 lưu local trên iPhone. Mất máy / xoá app mà không sao lưu = mất job và sổ tiền.
- Sao lưu JSON là cách giữ lại toàn bộ dữ liệu của bạn.

### 9.2. Sao lưu
1. Vào **Cài đặt → Sao lưu → Xuất file JSON**.
2. Lưu file vào Files / iCloud Drive / gửi vào email của chính bạn.
3. Đặt tên file theo ngày, ví dụ: `fotobro-2026-11-20.json`.
4. Nên sao lưu: sau mỗi tuần làm việc, và trước khi đổi máy / cập nhật lớn.

### 9.3. Khôi phục
1. Vào **Cài đặt → Sao lưu → Nhập file JSON**.
2. Chọn file `.json` đã xuất trước đó.
3. Kiểm tra lại: số job, sổ tiền, bảng giá có đủ không, rồi mới dùng tiếp.
- Lưu ý: nhập file sao lưu sẽ thay thế dữ liệu hiện tại trong app — sao lưu bản hiện tại trước khi nhập bản cũ.

### 9.4. Đồng bộ / sao lưu mã hoá (Nấc 2 — chưa có ở v1)
- Nấc 2 sẽ có đồng bộ / sao lưu mã hoá qua CloudKit (làm chính) — có thu phí, Nấc 1 giữ miễn phí.
- Ở v1, sao lưu JSON thủ công là cách duy nhất — đừng bỏ qua.

---

## 10. Cài đặt — tất cả tuỳ chọn ở một chỗ

| Mục trong Cài đặt | Làm gì |
|---|---|
| Bảng giá | Giá Digital từng gói + giá Film từng gói (§2.3) |
| Mẫu tin nhắn / Email | Sửa mẫu, khôi phục gốc (§7.2) |
| Giao diện | Màu chủ đề (3 preset), logo studio, dark mode (§2.2) |
| Ngôn ngữ | Tiếng Việt / English |
| Tiền tệ | VND / USD — chỉ đổi hiển thị, không quy đổi tỷ giá |
| Google | Đăng nhập 1 chạm / đăng xuất (§2.4) |
| Lịch iPhone | Nhập lịch native 1 chạm (§2.5) |
| Khoá | Face ID / PIN (§2.6) |
| Thông báo | Giờ nhắc, loại nhắc (§6.2) |
| Sao lưu | Xuất / nhập JSON (§9) |
| Giới thiệu / Hỗ trợ | Phiên bản app, liên hệ hỗ trợ, điều khoản & quyền riêng tư |

### Không có ở v1 (đừng tìm)
- Đổi tên phòng ban, loại job riêng, checklist riêng cho từng bước, chế độ vui / theme riêng theo khách — không làm ở v1.
- Bảng Kanban kéo thả, checklist theo bước — không làm ở v1.
- Nhập file `.ics` / `.zip`, xuất `.zip` từ Google — đã bỏ hẳn ở v1.
- Đồng bộ CloudKit, làm nhóm / studio — thuộc Nấc 2 / 3, sẽ có sau.

---

## 11. Mẹo dùng nhanh (cho người bận)

1. **Mỗi sáng mở Hôm nay trước** — 10 giây biết cả ngày làm gì.
2. **Ghi cọc ngay khi nhận tiền** — đừng để tới tối mới ghi.
3. **Chụp xong bấm Đã chụp ngay** — để app nhắc chọn ảnh / hậu kỳ đúng hạn.
4. **Giao ảnh xong nhắc thu nốt luôn** — đừng để khách quên, bạn cũng quên.
5. **Sao lưu JSON mỗi tuần** — 1 phút, cứu được cả tháng dữ liệu.
6. **Dùng mẫu tin nhắn** thay vì gõ lại từ đầu — nhanh và không sót số tiền / ngày giờ.
7. **Job kẹt hiện lên Hôm nay là để xử lý, không phải để nhìn** — nhắn khách hoặc dời hẹn ngay hôm đó.

---

## 12. Hỏi đáp nhanh (FAQ)

| Câu hỏi | Trả lời |
|---|---|
| Quên PIN thì sao? | Làm theo khôi phục PIN trong màn hình khoá. Dữ liệu không gửi đi đâu nên chỉ khôi phục được trên máy bạn. |
| Đổi iPhone mới thì sao? | Xuất JSON ở máy cũ (§9.2) → nhập JSON ở máy mới (§9.3). Google / Lịch iPhone đăng nhập lại. |
| Sao giá film hiện 0đ? | Bạn chưa nhập giá film trong Cài đặt → Bảng giá (§2.3). Mặc định 0 = chưa đặt, app không tự đoán giá. |
| Sao không nhập được file .ics? | v1 đã bỏ nhập `.ics` / `.zip`. Dùng nhập Lịch iPhone native 1 chạm (§2.5). |
| Sao mic không nghe? | Kiểm tra quyền Micro (§8.3). Nếu vẫn không được, dùng gõ tay — sửa plugin giọng nói dời v1.1 nếu thử 2 lần không xong. |
| Sao Lịch iPhone và app lệch nhau? | Kiểm tra đã bấm **Thêm vào Lịch iPhone** trong job chưa, và quyền Lịch còn bật không (§6.3). |
| App có cần mạng không? | Dùng local là chính. Google / đồng bộ (sau này) mới cần mạng. |
| Dữ liệu của tôi có gửi lên server không? | Không, ở v1 dữ liệu ở trên máy bạn. Chỉ khi bạn bật Google / đồng bộ thì dữ liệu liên quan mới đi qua dịch vụ đó. |
| Đổi VND sang USD có quy đổi tiền không? | Không. Chỉ đổi đơn vị hiển thị, số tiền giữ nguyên (§2.1). |

---

## 13. Hỗ trợ và góp ý

- Gặp lỗi / muốn góp ý: dùng mục **Cài đặt → Hỗ trợ** trong app (kênh hỗ trợ chính thức sẽ ghi ở đó).
- Khi báo lỗi, ghi kèm: phiên bản app, loại iPhone / iOS, bước làm ra lỗi, ảnh chụp màn hình nếu có.
- Góp ý về bảng giá, mẫu tin nhắn, pipeline — nhóm FotoBro dùng để ưu tiên tính năng Nấc 2 / 3.

---

*FotoBro iOS v1 — Hướng dẫn sử dụng cho người dùng mới. Tài liệu này đi kèm bản v1 (local-first); các mục ghi “Nấc 2 / 3” hoặc “v1.1” là tính năng chưa có ở v1.*
