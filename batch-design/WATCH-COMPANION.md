# FotoBro — App đồng hành Apple Watch (ý tưởng v2)

> **Trạng thái: Ý TƯỞNG v2 — chưa code, chưa quyết làm.**
> File này chỉ ghi ý tưởng thiết kế để cân nhắc sau v1. Không có code Watch nào
> được viết, không có quyết định nào được chốt. Mọi thứ dưới đây có thể đổi,
> cắt, hoặc bỏ hẳn khi tới v2.
>
> Bối cảnh v1 (để đối chiếu): FotoBro iOS v1, Capacitor 8, Bundle ID
> `com.fotobro.app`, local-first (dữ liệu trong máy), màn Hôm nay hiển thị job
> chụp hôm nay + tiền thu/thiếu, pipeline job 8 bước (Tư vấn → Chốt cọc →
> Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong), nhắc lịch chụp
> trước 12 tiếng, giọng nói gõ tay (mic dời v1.1). UI kiểu Apple Music:
> Large Title, SF Pro, tối giản, dark mode.

---

## 1. Nguyên tắc thiết kế cho Watch

Photographer đang chụp ngoài trời thì hai tay bận máy ảnh, mắt bận khách,
điện thoại thường để trong túi/balo. Đồng hồ là màn hình thứ hai — chỉ đáng
làm nếu nó **nhanh hơn lấy điện thoại ra**, không phải bản thu nhỏ của app iPhone.

Vì vậy, Watch companion (nếu làm) tuân theo:

1. **Chỉ đọc + tick nhanh, không nhập liệu dài.** Không tạo job mới, không
   sửa giá, không gõ tin nhắn trên đồng hồ.
2. **Một màn hình, một việc, tối đa 2 chạm.** Mở lên là thấy ngay việc cần
   làm tiếp theo, không lướt qua nhiều menu.
3. **Chữ to, tương phản cao, dùng được dưới nắng.** Nền đen, chữ trắng,
   nút lớn — tay ướt/mồ hôi vẫn chạm được.
4. **Không phụ thuộc mạng.** Ngoài trời có thể mất sóng; dữ liệu hôm nay
   phải có sẵn trên đồng hồ từ trước (đồng bộ lúc còn ở nhà/studio).
5. **Không làm phiền lúc đang chụp.** Chỉ rung khi thật sự cần (sắp tới
   giờ chụp, job kẹt tiền), không rung cho mọi thay đổi nhỏ.

---

## 2. Các ý tưởng (mỗi ý tưởng có 3 mục: có ích thật không / cần đồng bộ gì / khó khăn gì)

### Ý tưởng 1 — Xem job hôm nay trên đồng hồ

**Mô tả:** Mở Watch là thấy danh sách job chụp hôm nay: giờ chụp, tên khách,
loại job (Portrait / Couple / Wedding / Lookbook / Event), địa điểm, bước
pipeline hiện tại. Chạm vào một job để xem tóm tắt: giờ, địa điểm, số tiền
còn thiếu, ghi chú ngắn (1–2 dòng).

**Có ích thật cho photographer đang chụp ngoài trời không?**
- **Có, ích thật — đây là ý tưởng đáng làm nhất.** Khi đang chụp, photographer
  hay quên job tiếp theo bắt đầu mấy giờ, ở đâu, khách tên gì. Liếc đồng hồ
  nhanh hơn nhiều so với móc điện thoại ra khỏi túi (tay đang cầm máy ảnh).
- Đặc biệt ích khi một ngày có 2–3 job nối nhau, hoặc job cưới dài cả ngày
  với nhiều mốc giờ (makeup → lễ → tiệc).
- Ít ích nếu ngày đó chỉ có 1 job và photographer đã nhớ rõ — nhưng vẫn
  đáng có vì không tốn thêm thao tác nào.

**Cần đồng bộ dữ liệu gì với iPhone?**
- Danh sách job có ngày chụp = hôm nay (và nên kèm cả ngày mai, để tối hôm
  trước xem trước được): id job, tên khách, loại job, giờ bắt đầu/kết thúc,
  địa điểm, bước pipeline hiện tại, ghi chú ngắn.
- Đồng bộ khi: mở app iPhone, hoặc tự động nền khi có thay đổi job; và bắt
  buộc đồng bộ xong trước khi ra khỏi nhà (xem mục khó khăn).
- Chỉ đồng bộ job hôm nay + ngày mai, không đồng bộ toàn bộ lịch sử — để
  nhẹ, nhanh, tiết kiệm pin.

**Khó khăn gì?**
- Đồng bộ nền không đảm bảo 100%: nếu photographer sửa job trên iPhone lúc
  đã ra ngoài mà iPhone–Watch mất kết nối Bluetooth (để điện thoại trong
  xe/balo xa), đồng hồ có thể hiện thông tin cũ. Cần hiển thị rõ "cập nhật
  lúc HH:MM" để người dùng biết dữ liệu có thể cũ.
- Địa điểm dài (địa chỉ chi tiết) hiển thị xấu trên màn hình nhỏ — chỉ nên
  hiện tên địa điểm ngắn, chạm thêm mới thấy địa chỉ đầy đủ / nút mở bản đồ
  trên iPhone.
- Capacitor 8 (v1) là web app — Watch app là native watchOS (Swift), không
  dùng chung code với app iPhone. Phải viết riêng hoàn toàn, tốn công gấp
  đôi khi sửa một tính năng (sửa 2 nơi).

---

### Ý tưởng 2 — Nhắc giờ chụp (thông báo trên Watch)

**Mô tả:** Trước mỗi job, Watch hiện thông báo: "30 phút nữa chụp Couple —
Anh Tuấn, tại Hồ Gươm". Người dùng có thể chạm để xem nhanh job, hoặc vuốt
cho qua. Tích hợp với nhắc 12 tiếng đã có ở v1 trên iPhone (nhắc trước 12
tiếng là nhắc chuẩn bị; nhắc trên Watch là nhắc sát giờ, đi đường).

**Có ích thật cho photographer đang chụp ngoài trời không?**
- **Có, ích thật — nhất là khi đang chụp job này mà sắp tới giờ job sau.**
  Photographer mải chụp dễ quên giờ, tới trễ job sau là mất khách.
- Ích nhất ở các mốc: 60 phút trước (chuẩn bị di chuyển), 30 phút trước
  (lên đường), 10 phút trước (sắp tới giờ, kiểm tra đồ lần cuối).
- Kém ích nếu chỉ có 1 job/ngày và đã đặt báo thức trên điện thoại — nhưng
  thông báo Watch vẫn hơn báo thức thường vì nó ghi rõ tên khách + địa điểm,
  không phải chỉ kêu "bíp".

**Cần đồng bộ dữ liệu gì với iPhone?**
- Giờ chụp + tên khách + địa điểm của từng job hôm nay, và mốc nhắc nào
  người dùng đã bật (60/30/10 phút — cho chọn trong Cài đặt iPhone, không
  cài trên Watch).
- Lịch nhắc được tính trên iPhone rồi đẩy sang Watch, hoặc Watch tự tính từ
  giờ chụp đã đồng bộ (xem mục khó khăn).
- Trạng thái đã xem / đã bỏ qua nhắc — không cần đồng bộ ngược, vì chỉ là
  thông báo.

**Khó khăn gì?**
- Nếu lịch nhắc tính trên iPhone: iPhone phải ở gần Watch lúc tới giờ nhắc
  thì thông báo mới tới được (qua Bluetooth). Nếu để điện thoại ở nhà mà
  đeo Watch có cellular thì vẫn nhận được qua mạng — nhưng Watch bản
  GPS-only (không cellular) sẽ không nhận được. Cần nói rõ giới hạn này
  trong hướng dẫn, tránh người dùng tưởng Watch thay được điện thoại.
- Nếu lịch nhắc tính trên Watch (dựa trên giờ đã đồng bộ): nhắc được cả khi
  xa điện thoại, nhưng nếu giờ job đổi trên iPhone sau khi đồng bộ thì Watch
  nhắc sai giờ cũ. Cần cơ chế: mỗi lần iPhone–Watch gặp lại nhau thì đồng
  bộ lại giờ mới ngay.
- Rủi ro rung/nhắc quá nhiều: một ngày 3 job × 3 mốc = 9 thông báo — gây
  phiền. Nên mặc định chỉ bật 1 mốc (30 phút), các mốc khác để người dùng
  tự bật thêm.

---

### Ý tưởng 3 — Tick nhanh bước pipeline trên Watch

**Mô tả:** Sau khi chụp xong một job, photographer chạm 1 nút trên Watch để
chuyển job sang bước tiếp theo (ví dụ: Sắp chụp → Đã chụp), không cần mở
điện thoại. Chỉ cho tick **tiến 1 bước**, không cho nhảy cóc nhiều bước,
không cho sửa ngược (muốn sửa thì mở iPhone). Có nút hoàn tác (Undo) trong
vài giây sau khi tick nhầm.

**Có ích thật cho photographer đang chụp ngoài trời không?**
- **Có, ích vừa phải — ích nhất ở đúng khoảnh khắc vừa chụp xong.**
  Vừa bấm máy xong, tay vẫn đang cầm máy, tick 1 cái trên đồng hồ là xong;
  mở điện thoại ra, mở app, tìm job, đổi bước thì mất 30 giây và dễ quên.
- Giúp pipeline luôn đúng trạng thái thật: nhiều photographer quên cập nhật
  bước vì ngại mở điện thoại giữa buổi chụp, về nhà mới cập nhật dồn — lúc
  đó dễ quên job nào đã chụp xong, job nào chưa.
- Ít ích với các bước không diễn ra ngoài trời (Chọn ảnh, Hậu kỳ, Đã giao)
  — các bước đó làm ở nhà, mở iPhone tiện hơn. Nên trên Watch chỉ hiện nút
  tick cho các bước ngoài trời: Sắp chụp → Đã chụp là chính; các bước sau
  vẫn tick được nhưng không phải trọng tâm.

**Cần đồng bộ dữ liệu gì với iPhone?**
- **Đồng bộ 2 chiều (quan trọng nhất trong 5 ý tưởng):** Watch gửi "job X
  sang bước Y lúc HH:MM" về iPhone; iPhone gửi lại trạng thái mới nhất để
  Watch hiển thị đúng.
- Cần chống xung đột: nếu cùng lúc tick trên Watch và sửa trên iPhone thì
  lấy bản mới nhất theo giờ, và không được mất dữ liệu (không được ghi đè
  làm mất bước đã tick).
- Cần ghi log: ai tick, tick lúc nào, từ Watch hay iPhone — để khi có sai
  thì tra được.

**Khó khăn gì?**
- **Đây là ý tưởng khó nhất về đồng bộ.** Đồng bộ 2 chiều luôn phức tạp
  hơn đồng bộ 1 chiều (chỉ xem). Nếu iPhone–Watch mất kết nối lúc tick,
  thao tác phải được xếp hàng (queue) trên Watch và gửi lại khi gặp lại
  iPhone — nếu không, người dùng tưởng đã tick mà thực ra chưa, về nhà
  thấy pipeline vẫn cũ.
- Tick nhầm là rủi ro thật: nút to, tay ướt, đang vội — chạm nhầm là đổi
  bước sai. Cần: (a) chỉ cho tiến 1 bước, (b) hiện xác nhận ngắn sau khi
  tick ("Đã chuyển sang Đã chụp — Hoàn tác"), (c) không cho tick bước liên
  quan tới tiền (Chốt cọc, Đã giao) trên Watch — vì các bước đó gắn tiền
  cọc / thu nốt, sai là rối sổ tiền.
- Cần quyết: tick trên Watch có cần mở khóa / xác nhận không? Không xác
  nhận thì nhanh nhưng dễ nhầm; có xác nhận thì mất ý nghĩa "tick nhanh".
  Đề xuất v2: không xác nhận, nhưng có Undo 10 giây.

---

### Ý tưởng 4 — Xem tiền còn thiếu trên Watch

**Mô tả:** Màn hình tiền gọn trên Watch: hôm nay thu được bao nhiêu, còn
thiếu bao nhiêu (tổng các job hôm nay + job quá hạn chưa thu đủ), và từng
job còn thiếu bao nhiêu. Chỉ xem, **không cho sửa tiền, không cho ghi đã
thu trên Watch**.

**Có ích thật cho photographer đang chụp ngoài trời không?**
- **Có, ích thật — nhất là lúc giao ảnh / lúc khách hỏi "còn bao nhiêu".**
  Khách hay hỏi ngay tại buổi chụp: "Anh/chị ơi em còn thiếu bao nhiêu ạ?"
  — liếc đồng hồ trả lời ngay được, không cần mở điện thoại tra sổ tiền.
- Ích khi thu tiền mặt ngoài trời: chụp xong khách đưa tiền, photographer
  nhìn đồng hồ biết khách còn thiếu đúng số đó không, tránh thu thiếu/thừa.
- Ích vừa phải vào cuối ngày: xem nhanh hôm nay thu được bao nhiêu mà
  không cần mở app.

**Cần đồng bộ dữ liệu gì với iPhone?**
- Số tiền mỗi job: tổng giá, đã thu (cọc + các đợt), còn thiếu; và tổng
  hôm nay (đã thu / còn thiếu). Chỉ đồng bộ số tiền của job hôm nay + job
  quá hạn chưa thu đủ — không đồng bộ toàn bộ sổ tiền.
- Tiền tệ hiển thị theo cài đặt v1 (VND/USD — chỉ đổi hiển thị, không quy
  đổi tỷ giá).
- Chỉ đồng bộ 1 chiều iPhone → Watch (xem, không sửa). Không đồng bộ ngược.

**Khó khăn gì?**
- **Nhạy cảm nhất về riêng tư:** số tiền hiện trên cổ tay — người đứng cạnh
  (khách khác, người ngoài) có thể liếc thấy khi photographer giơ tay xem.
  Cần: (a) mặc định ẩn số tiền chi tiết, chỉ hiện khi chạm "Hiện tiền";
  (b) cho phép tắt hẳn màn hình tiền trên Watch trong Cài đặt iPhone;
  (c) không hiện số tiền trên mặt đồng hồ (complication) — chỉ hiện khi
  mở app Watch.
- Số tiền sai do đồng bộ chậm là rủi ro thật: nếu vừa thu cọc trên iPhone
  mà Watch chưa kịp đồng bộ, đồng hồ hiện "còn thiếu" trong khi thực ra
  khách đã trả — dễ thu trùng. Cần hiển thị rõ "cập nhật lúc HH:MM" và
  khuyến cáo: con số trên Watch chỉ để tham khảo nhanh, số chính thức là
  trên iPhone.
- Định dạng tiền trên màn hình nhỏ: "15.000.000đ" dài, dễ tràn — cần rút
  gọn ("15tr" / "15.000k") theo cách hiển thị đã dùng ở v1, và giữ nhất
  quán giữa iPhone và Watch.

---

### Ý tưởng 5 — Rung nhắc trước giờ chụp (haptic)

**Mô tả:** Watch rung (haptic) trước giờ chụp theo mốc người dùng đã chọn
(mặc định 30 phút, tùy chọn thêm 60/10 phút). Rung khác nhau theo mức gấp:
rung nhẹ 1 lần ở mốc 60 phút, rung mạnh 2 lần ở mốc 10 phút. Kèm theo đó
là thông báo ngắn (xem Ý tưởng 2) — rung là để **đánh thức sự chú ý** khi
điện thoại đang im lặng trong túi.

**Có ích thật cho photographer đang chụp ngoài trời không?**
- **Có, ích thật — đây là lý do chính đáng để đeo Watch khi chụp.**
  Ngoài trời ồn (đám cưới, sự kiện), điện thoại để trong túi thì không nghe
  thấy chuông, không cảm thấy rung. Đồng hồ rung trực tiếp lên cổ tay thì
  cảm nhận được ngay cả khi đang ồn, đang bận tay.
- Ích nhất khi photographer đang ở xa điện thoại (để điện thoại trong xe,
  trong balo ở góc phòng) mà vẫn đeo Watch.
- Kém ích nếu photographer luôn để điện thoại trong túi quần và đã bật rung
  mạnh — nhưng rung cổ tay vẫn rõ hơn rung trong túi.

**Cần đồng bộ dữ liệu gì với iPhone?**
- Giống Ý tưởng 2: giờ chụp + tên khách + mốc rung đã chọn (60/30/10 phút).
  Rung và thông báo là một cặp — cùng một dữ liệu, hai cách báo.
- Cài đặt rung (mốc nào, mạnh/nhẹ) chỉ cài trên iPhone, Watch chỉ thực thi
  theo cài đặt đã đồng bộ. Không cài đặt riêng trên Watch để tránh lệch
  nhau.

**Khó khăn gì?**
- **Phụ thuộc vào kết nối iPhone–Watch lúc tới giờ rung** (giống Ý tưởng 2):
  Watch GPS-only xa điện thoại thì không rung đúng giờ nếu lịch nhắc nằm
  trên iPhone. Muốn rung được khi xa điện thoại thì lịch nhắc phải nằm sẵn
  trên Watch (đồng bộ trước) — nhưng lại gặp vấn đề giờ đổi sau khi đồng
  bộ thì rung sai. Cần chọn 1 trong 2 cách và nói rõ giới hạn, không hứa
  cả hai.
- Rung quá nhiều gây chai cảm giác: nếu rung cho mọi job, mọi mốc, người
  dùng sẽ quen và bỏ qua cả rung quan trọng. Cần giới hạn: tối đa 2–3 lần
  rung/ngày cho việc chụp, rung mạnh chỉ dành cho mốc 10 phút.
- Chế độ im lặng / Không làm phiền (Focus) trên Watch có thể chặn rung —
  cần hướng dẫn người dùng: nếu bật Focus lúc chụp thì nhắc giờ chụp cũng
  bị chặn theo. Có thể cần xin quyền "Thông báo quan trọng" (Time Sensitive)
  để vượt qua Focus — việc này cần xin phép người dùng rõ ràng, không tự
  bật.
- Pin: rung nhiều + màn hình sáng khi nhắc sẽ tốn pin Watch. Cần kiểm tra
  thực tế: một ngày chụp dài (8–10 tiếng) Watch có đủ pin tới cuối ngày
  không, hay phải sạc giữa chừng.

---

## 3. Những thứ KHÔNG nên làm trên Watch (v2)

Để Watch không biến thành bản sao vụng về của app iPhone:

| Không làm | Vì sao |
|---|---|
| Tạo job mới trên Watch | Nhập tên khách, giá, giờ trên màn hình nhỏ rất chậm, dễ sai. Tạo job là việc làm ở nhà, trên iPhone. |
| Sửa giá / ghi đã thu tiền trên Watch | Tiền sai là rối sổ. Chỉ xem trên Watch, sửa trên iPhone. |
| Gõ tin nhắn / gửi email cho khách trên Watch | Soạn tin cần mẫu + sửa câu chữ — làm trên iPhone. Watch tối đa chỉ có nút "Mở mẫu tin trên iPhone" (handoff). |
| Nhập lịch / đồng bộ Lịch iPhone trên Watch | Việc này thuộc về iPhone (EventKit). Watch chỉ xem giờ đã có. |
| Giọng nói trên Watch ở v2 | Mic trên Watch ồn ngoài trời, nhận diện tiếng Việt kém hơn trên iPhone; giọng nói iPhone còn dời sang v1.1 — đừng đưa lên Watch trước khi nó ổn trên iPhone. |
| Xem toàn bộ lịch sử job / báo cáo tháng | Màn hình nhỏ không hợp để xem báo cáo. Chỉ xem hôm nay + ngày mai. |
| Complication mặt đồng hồ hiện số tiền | Rủi ro lộ tiền cho người đứng cạnh (xem Ý tưởng 4). Complication chỉ nên hiện job tiếp theo (giờ + tên khách), không hiện tiền. |

---

## 4. Đồng bộ iPhone ↔ Watch: hướng chung (ý tưởng, chưa chốt)

- **Kênh đồng bộ:** WatchConnectivity (kênh chuẩn Apple giữa iPhone và
  Watch khi ở gần nhau qua Bluetooth/Wi-Fi). Không dùng mạng riêng, không
  qua server — giữ đúng mô hình local-first của v1.
- **Dữ liệu đồng bộ:** chỉ job hôm nay + ngày mai + tiền còn thiếu của các
  job đó. Không đồng bộ toàn bộ database.
- **Chiều đồng bộ:**
  - iPhone → Watch: job, giờ, tiền, nhắc (1 chiều, 4/5 ý tưởng).
  - Watch → iPhone: chỉ có tick bước pipeline (Ý tưởng 3) là 2 chiều.
- **Khi mất kết nối:** Watch dùng dữ liệu đã đồng bộ lần cuối + hiện rõ
  "cập nhật lúc HH:MM". Thao tác tick khi mất kết nối được xếp hàng và gửi
  lại khi gặp lại iPhone — không được lặng lẽ mất thao tác.
- **CloudKit (Nấc 2 của FotoBro):** nếu sau này FotoBro có đồng bộ CloudKit
  thì Watch có thể lấy dữ liệu qua CloudKit thay vì chỉ qua iPhone — nhưng
  đó là quyết định của Nấc 2, không phải của Watch v2. Ở v2, giả định
  Watch chỉ đồng bộ qua iPhone.
- **Chưa chốt:** lịch nhắc tính trên iPhone hay trên Watch (xem Ý tưởng 2
  và 5); cách xử lý xung đột khi tick 2 chiều (xem Ý tưởng 3). Hai điểm
  này phải chốt trước khi viết code.

---

## 5. Thứ tự ưu tiên nếu làm v2 (đề xuất, chưa chốt)

1. **Ý tưởng 1 (Xem job hôm nay)** — nền tảng, các ý tưởng khác đều dựa
   vào dữ liệu này. Làm trước.
2. **Ý tưởng 5 (Rung nhắc trước giờ chụp)** — lý do chính đáng nhất để đeo
   Watch khi chụp. Làm cùng hoặc ngay sau ý tưởng 1.
3. **Ý tưởng 2 (Nhắc giờ chụp)** — đi kèm ý tưởng 5, cùng dữ liệu.
4. **Ý tưởng 4 (Xem tiền còn thiếu)** — chỉ xem, đồng bộ 1 chiều, ít rủi
   ro hơn ý tưởng 3. Làm sau khi 1 + 2 + 5 ổn.
5. **Ý tưởng 3 (Tick nhanh bước pipeline)** — khó nhất (đồng bộ 2 chiều,
   chống mất thao tác, chống tick nhầm). Làm cuối cùng, chỉ làm khi 4 ý
   tưởng trên đã ổn và đã kiểm tra kỹ ngoài trời thật.

Không làm tất cả cùng lúc. Mỗi ý tưởng làm xong phải cho photographer dùng
thử ngoài trời thật (nắng, ồn, tay bận) rồi mới làm ý tưởng tiếp theo.

---

## 6. Rủi ro & câu hỏi chưa có lời đáp

- **Chi phí gấp đôi:** Watch app viết native Swift riêng, không dùng chung
  code Capacitor với iPhone. Mỗi lần đổi pipeline/tiền trên iPhone là phải
  sửa cả Watch. Cần cân nhắc: đội làm v1 có đủ sức duy trì 2 app không?
- **Kiểm tra ngoài trời thật:** rung có cảm nhận được khi đang ồn không?
  Chữ có đọc được dưới nắng gắt không? Pin Watch có đủ một ngày chụp dài
  không? Không trả lời được bằng lý thuyết — phải thử thật.
- **Watch GPS-only vs Cellular:** nhiều photographer dùng Watch GPS-only.
  Mọi tính năng phải hoạt động được khi xa iPhone (dựa trên dữ liệu đã
  đồng bộ), hoặc phải nói rõ giới hạn.
- **Quyền riêng tư:** tiền trên cổ tay, tên khách trên mặt đồng hồ — cần
  cho người dùng tắt từng phần, không bật tất cả mặc định.
- **App Store:** Watch app đi kèm app iPhone (cùng Bundle ID
  `com.fotobro.app`, thêm Watch target) — không bán riêng. Cần kiểm tra
  lại yêu cầu App Store cho Watch companion khi tới v2.

---

## 7. Kết luận

- Đây là **ý tưởng v2, chưa code, chưa quyết làm**. Không có dòng code
  Watch nào, không có thiết kế màn hình chi tiết, không có lịch làm.
- Nếu làm, thứ tự là: xem job hôm nay → rung nhắc → nhắc giờ → xem tiền
  thiếu → tick nhanh pipeline (khó nhất, làm cuối).
- Nguyên tắc xuyên suốt: Watch chỉ làm việc **nhanh hơn lấy điện thoại ra**,
  chỉ đọc + tick nhanh, không nhập liệu, không sửa tiền, hoạt động được
  khi mất mạng, và không làm phiền lúc đang chụp.
- Quyết định có làm hay không, và làm tới đâu, để tới sau khi v1 ổn định
  và có phản hồi dùng thật ngoài trời.
