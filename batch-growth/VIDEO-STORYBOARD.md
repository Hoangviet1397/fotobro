# VIDEO STORYBOARD — App Preview FotoBro (App Store, iPhone)

> **Trạng thái:** Bản storyboard để quay/dựng sau — **chưa quay video, chưa xuất file**.
> **Ngày viết:** 20/11/2026. **Chỉ 1 file mới**, không sửa file nào khác.
> **App:** FotoBro v1 (iOS, Bundle ID `com.fotobro.app`) — trợ lý photographer tự do,
> local-first, miễn phí, không IAP ở v1.
> **Dữ liệu mẫu:** dùng đúng bộ hư cấu trong `SCREENSHOT-DATA.md` (studio "An Studio",
> khách Thu Hằng, Minh Quân & Lan Chi…) — **không dùng tên, job, tiền hay ảnh thật
> của Xèo / Sadako Photography / bất kỳ khách thật nào**.
> **Tham chiếu màn hình:** thứ tự 6 màn theo `APP-STORE-LISTING.md` §8.

---

## 0. Quyết định khung (đọc trước khi quay)

| Mục | Chốt cho bản này |
|---|---|
| Tổng thời lượng | **28 giây** (trong khung 15–30 giây của Apple; nhắm 25–30 giây để đủ kể chuyện) |
| Hướng / máy | **Dọc (portrait), iPhone** — bản chính. iPad là bản cắt riêng sau, không dùng chung file |
| Ngôn ngữ | **Bản chính: tiếng Việt.** Bản tiếng Anh: cùng các take, chỉ đổi chữ trên màn hình + giọng đọc |
| Phong cách hình | Toàn màn hình app, không khung điện thoại 3D, không tay cầm máy, không người trong khung hình (xem §1 — quy định của Apple) |
| Chế độ giao diện | **Light mode** cho bản chính (khớp bộ screenshot trong `SCREENSHOT-DATA.md`) |
| Âm thanh | Video phát **tự động nhưng tắt tiếng** trên App Store → chữ trên màn hình phải tự kể hết chuyện; nhạc/giọng đọc chỉ là lớp thêm, không được là kênh duy nhất truyền thông tin |
| Poster frame | **Giây thứ 5** (mặc định của Apple) — rơi vào Cảnh 2 (pipeline), nên Cảnh 2 phải là khung hình đẹp nhất, tự nó đã hiểu được |
| Tính năng KHÔNG đưa vào bản chính | Giọng nói (mic): plugin speech-recognition chưa tương thích Capacitor 8, có thể dời sang v1.1 — **không quay cảnh mic làm cảnh chính**. Nếu mic kịp vào v1 thì thêm làm take dự phòng (xem §4). Đăng nhập Google 1 chạm / nhập Lịch iPhone native: để dành cho **preview thứ 2** (Apple cho tối đa 3 preview), không nhồi vào 28 giây này |

---

## 1. Yêu cầu kỹ thuật của Apple cho App Preview

Nguồn: trang **App preview specifications** trong App Store Connect Help của Apple,
đối chiếu qua các bản tổng hợp đã kiểm chứng lại với trang Apple tháng 11/2026
(Ultramock, kiểm tra 13/11/2026; AppRanker; Smol for Mac, 11/10/2026).
**Apple có thể đổi bảng thông số khi ra máy mới — kiểm tra lại trang chính thức
của Apple trong App Store Connect Help trước khi xuất file gửi đi, đừng tin
bản này một cách mù quáng.**

### 1.1 Bảng thông số (iPhone là bản chính)

| Thông số | Yêu cầu của Apple |
|---|---|
| Độ dài | **15–30 giây** (ngắn hơn 15 giây hay dài hơn 30 giây đều bị từ chối) |
| Số lượng | Tối đa **3 preview cho mỗi cỡ máy + mỗi ngôn ngữ** (preview là tùy chọn, không bắt buộc) |
| Định dạng | H.264 trong `.mov`, `.m4v` hoặc `.mp4`; hoặc ProRes 422 **HQ** trong `.mov` (chỉ HQ mới được) |
| Kích thước file | Tối đa **500 MB** (bản 28 giây ở 10–12 Mbps chỉ ~35–45 MB, khó chạm trần) |
| Tốc độ khung hình | Tối đa **30 fps** (xuất 60 fps là lỗi thường gặp nhất khiến file bị từ chối — xuất đúng 30 fps) |
| H.264 | Progressive, tối đa High Profile Level 4.0, bitrate mục tiêu **10–12 Mbps** |
| Âm thanh | Stereo, **AAC 256 kbps, 44,1 hoặc 48 kHz**, mọi track đều bật (ProRes thì dùng PCM hoặc AAC 256 kbps) |
| Độ phân giải — iPhone hiện nay (Face ID / Dynamic Island, mọi cỡ) | **886 × 1920** (dọc) hoặc 1920 × 886 (ngang) |
| Độ phân giải — iPhone nút Home lớn (5,5") | 1080 × 1920 / 1920 × 1080 |
| Độ phân giải — iPad 13"/11"/10,5" | 1200 × 1600 / 1600 × 1200 |
| Độ phân giải — Mac, Apple TV | Chỉ ngang, 1920 × 1080 |
| Poster frame | Mặc định lấy khung hình ở **giây thứ 5**; có thể chọn khung khác trong App Store Connect |
| Thời gian xử lý | Sau khi tải lên có thể mất **tới 24 giờ** mới xử lý xong — đừng để tới ngày gửi mới làm |

**Bẫy thường gặp:** độ phân giải Apple chấp nhận **không phải** độ phân giải gốc
của màn hình máy quay. Video quay từ iPhone 17/18 Pro Max là 1320 × 2868 nhưng
App Store Connect chỉ nhận 886 × 1920 cho iPhone hiện nay — quay ở độ phân
giải gốc rồi **scale xuống 886 × 1920 khi xuất**. Không dùng HEVC/H.265 —
Apple chỉ liệt kê H.264 và ProRes 422 HQ. Quay bằng Simulator phải thêm
`--codec=h264` (mặc định của Simulator là HEVC).

### 1.2 Quy định nội dung — App Review Guideline 2.3.4

- Preview **chỉ được dùng video quay màn hình của chính app** ("may only use video
  screen captures of the app itself"). Được thêm **lời dẫn (narration) và chữ/
  lớp phủ video** để giải thích những gì nhìn màn hình chưa rõ.
- **Không** quay cảnh người cầm/chạm vào điện thoại; **không** để điện thoại 3D
  xoay hay màn hình app lồng trong hình điện thoại dựng sẵn — màn hình app phải
  lấp đầy khung hình.
- **Không đưa giá** (giá thay đổi theo vùng) — xem lưu ý riêng ở §3.5 vì FotoBro
  có màn hình bảng giá và sổ tiền.
- **Không** nhắc tới mùa vụ / thời điểm cụ thể ("Tết này", "tháng 11 này"…).
- Nếu tính năng cần mua trong app, đăng ký, hoặc đăng nhập thì **phải nói rõ**
  trong preview. FotoBro v1 **miễn phí, không IAP, không bắt buộc tài khoản**
  nên không cần câu này; nếu quay preview thứ 2 có Google thì phải nói rõ
  "đăng nhập Google là tùy chọn".
- Preview **tự động phát, tắt tiếng** trên trang sản phẩm và trong kết quả tìm
  kiếm, đứng **trước các screenshot**. Mọi ý quan trọng phải nằm trong chữ trên
  màn hình, không được chỉ nằm trong giọng đọc.

---

## 2. Storyboard chính — 28 giây, 6 cảnh (bản tiếng Việt)

Nhịp chung: mỗi cảnh **1 ý duy nhất**, chữ trên màn hình ≤ 7 từ, để chữ đủ lâu
để đọc được 2 lần. Chuyển cảnh bằng cắt thẳng (hard cut), không hiệu ứng bay
nhảy — đúng phong cách Apple Music tối giản của app (Large Title, SF Pro,
nền trắng sạch, 1 màu nhấn, thẻ bo góc lớn).

### Cảnh 1 — MỞ APP LÀ THẤY HÔM NAY (0:00–0:03, 3 giây)

| Mục | Nội dung |
|---|---|
| Hình ảnh | Màn hình **Hôm nay** lấp đầy khung hình. Ảnh trang chủ đẹp phía trên; dưới là 2 buổi chụp hôm nay: Portrait — Thu Hằng, 09:00, Công viên Lê Văn Tám; Couple — Minh Quân & Lan Chi, 16:00, Bờ sông Sài Gòn. Thẻ tiền hôm nay: đã thu 2.000.000đ, còn thiếu 1.500.000đ. Camera đứng yên 1 giây, sau đó cuộn chậm xuống 1 nhịp để lộ thẻ tiền rồi dừng |
| Chữ trên màn hình (VI) | **Mở app là thấy hôm nay** |
| Chữ trên màn hình (EN) | **Open the app. See today.** |
| Nhạc / giọng đọc | Nhạc nền bắt đầu: piano nhẹ, không lời, nhịp vừa (~90 BPM), âm lượng thấp. Giọng đọc VI (nữ, ấm, chậm rãi): "Mở app là thấy hôm nay — chụp ai, mấy giờ, thu bao nhiêu." / EN: "Open the app and see today — who you're shooting, when, and what's been paid." |
| Ghi chú quay | Dữ liệu mẫu theo `SCREENSHOT-DATA.md` màn 1. Dọn status bar trước khi quay: pin đầy, giờ trung tính (9:41), không thông báo lạ. Không để job kẹt lọt vào màn này |

### Cảnh 2 — JOB ĐI THEO 8 BƯỚC (0:03–0:08, 5 giây) ⭐ POSTER FRAME Ở GIÂY THỨ 5

| Mục | Nội dung |
|---|---|
| Hình ảnh | Chi tiết job **Wedding — Minh Quân & Lan Chi**, 15.000.000đ, cọc đã thu 5.000.000đ. Thanh tiến độ 8 bước: 5 bước đầu đã xong (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh), bước đang làm **Hậu kỳ — Bước 6/8** tô đậm, 2 bước sau (Đã giao → Xong) mờ. Ở giây thứ 5, ngón tay (chỉ là thao tác trong app, không quay bàn tay — dùng hiệu ứng chạm trong bản ghi màn hình) chạm vào bước **Đã giao** để cho thấy **nhảy thẳng tới bước bất kỳ**, rồi quay lại Hậu kỳ. Khung hình ở đúng giây thứ 5 phải gọn, đủ 8 bước + tên bước to — đây là poster frame |
| Chữ trên màn hình (VI) | **Job đi theo 8 bước rõ ràng** |
| Chữ trên màn hình (EN) | **Every job, in 8 clear steps** |
| Nhạc / giọng đọc | Nhạc tiếp tục, thêm một nốt nhấn nhẹ khi bước Hậu kỳ sáng lên. Giọng đọc VI: "Job nào đang ở bước nào, nhìn là biết." / EN: "See exactly where every job stands." |
| Ghi chú quay | Dữ liệu mẫu theo `SCREENSHOT-DATA.md` màn 2. **Kiểm tra poster frame ở 5,0 giây trước khi xuất** — nếu khung 5 giây bị cắt dở (đang chuyển động) thì dời nhịp chạm sang giây 5,5 hoặc chọn poster frame khác trong App Store Connect |

### Cảnh 3 — TIỀN BẠC RÕ TỪNG KHOẢN (0:08–0:13, 5 giây)

| Mục | Nội dung |
|---|---|
| Hình ảnh | Tab **Sổ tiền**, xem **Báo cáo tuần**: cột thu 12.500.000đ / chi 1.200.000đ / số dư 11.300.000đ hiện rõ; dưới là 2–3 dòng khoản mẫu (thu cọc Wedding 5.000.000đ, thu thêm giờ 5.500.000đ, chi thuê đèn 800.000đ). Cuộn chậm 1 nhịp qua danh sách khoản rồi dừng ở dòng tổng |
| Chữ trên màn hình (VI) | **Thu–chi rõ từng khoản** |
| Chữ trên màn hình (EN) | **Every dong, accounted for** |
| Nhạc / giọng đọc | Nhạc giữ nguyên nhịp, không đổi đoạn. Giọng đọc VI: "Thu theo đợt, chi theo job — báo cáo tự tính sẵn." / EN: "Income by instalment, costs by job — reports calculate themselves." |
| Ghi chú quay | Số liệu theo `SCREENSHOT-DATA.md` màn 3; **lấy đúng số app hiện làm chuẩn** — nếu app tính "còn thiếu" khác số trong file mẫu thì dùng số app hiện, không chỉnh ảnh cho khớp file. Tránh zoom sát vào con số VND (xem §3.5) |

### Cảnh 4 — KHÔNG TRỄ HẸN VỚI KHÁCH (0:13–0:18, 5 giây)

| Mục | Nội dung |
|---|---|
| Hình ảnh | Màn hình **nhắc lịch trong app**: thẻ nhắc "Chụp Portrait — Thu Hằng, 09:00, còn 60 phút" và thẻ "Hạn giao ảnh Wedding — Minh Quân & Lan Chi, còn 1 ngày". Chuyển nhẹ sang màn chi tiết job thấy dòng hạn giao ảnh. Toàn bộ là màn hình trong app — **không quay banner thông báo iOS thật** (dễ lọt tên/thông báo lạ) |
| Chữ trên màn hình (VI) | **Nhắc trước giờ chụp, trước hạn giao** |
| Chữ trên màn hình (EN) | **Reminded before every shoot** |
| Nhạc / giọng đọc | Một tiếng "ting" nhắc nhẹ, đúng 1 lần, trùng lúc thẻ nhắc hiện. Giọng đọc VI: "Nhắc trước giờ chụp 60 phút, trước hạn giao ảnh 1 ngày." / EN: "A reminder 60 minutes before the shoot, a day before delivery." |
| Ghi chú quay | Nhắc trong app là nhắc chính ở v1 (theo quyết định 00:06 20/11/2026). Tắt mọi thông báo hệ thống khác trước khi quay |

### Cảnh 5 — BẢNG GIÁ DIGITAL / FILM, GIÁ TỰ ĐIỀN (0:18–0:24, 6 giây)

| Mục | Nội dung |
|---|---|
| Hình ảnh | **Nửa đầu (0:18–0:21):** form **Thêm job mới** — chọn Loại job **Lookbook**, chọn **Chụp bằng: Digital**, ô Giá **tự điền 8.000.000đ** (không gõ tay). **Nửa sau (0:21–0:24):** chuyển sang **Cài đặt → Bảng giá**: 5 loại job (Portrait / Couple / Wedding / Lookbook / Event), mỗi loại 2 cột **Digital / Film** (ví dụ Portrait Digital 2.500.000đ — Film 3.500.000đ). Cuộn chậm qua bảng rồi dừng |
| Chữ trên màn hình (VI) | **Digital hay Film — giá tự điền** |
| Chữ trên màn hình (EN) | **Digital or film — priced for you** |
| Nhạc / giọng đọc | Nhạc lên nhẹ nửa nhịp ở lúc giá tự điền hiện (cảm giác "xong"). Giọng đọc VI: "Chụp film hay digital, giá nào cũng có sẵn." / EN: "Film or digital — the price fills itself in." |
| Ghi chú quay | Dữ liệu mẫu theo `SCREENSHOT-DATA.md` màn 5 + bảng giá mẫu (Bộ 0). Giá film là do người dùng tự điền trong Cài đặt, mặc định trống — trong video dùng đúng bảng giá mẫu đã nhập, không hard-code giá film vào kịch bản. Xem lưu ý về giá ở §3.5 |

### Cảnh 6 — KẾT: FOTOBRO, TRỢ LÝ CỦA PHOTOGRAPHER TỰ DO (0:24–0:28, 4 giây)

| Mục | Nội dung |
|---|---|
| Hình ảnh | Quay lại **màn hình Hôm nay** ở trạng thái gọn, đẹp nhất (2 buổi + tiền hôm nay), logo studio mẫu + tên "An Studio" hiện ở đầu màn. Chữ kết hiện dần phía dưới màn hình app (lớp phủ chữ, không phải màn hình riêng ngoài app). Dừng yên 2 giây cuối để người xem đọc xong |
| Chữ trên màn hình (VI) | **FotoBro — Trợ lý studio ảnh** |
| Chữ trên màn hình (EN) | **FotoBro — Your photo studio assistant** |
| Nhạc / giọng đọc | Nhạc khép lại bằng 2 hợp âm piano, dứt ở giây 28. Giọng đọc VI: "FotoBro — công ty thu nhỏ trong túi bạn." / EN: "FotoBro — your whole studio, in your pocket." |
| Ghi chú quay | **Không làm thẻ kết logo đứng riêng ngoài app** — Guideline 2.3.4 chỉ cho quay màn hình app; màn kết phải là màn hình app thật + chữ phủ. Không thêm chữ "Tải miễn phí" hay giá tiền vào thẻ kết (v1 miễn phí nhưng Apple cấm đưa giá vào preview) |

---

## 3. Tổng hợp thời lượng & lời dẫn

| Cảnh | Thời gian | Thời lượng | Ý chính (1 ý/cảnh) |
|---|---|---|---|
| 1 — Hôm nay | 0:00–0:03 | 3 giây | Mở app là thấy hôm nay |
| 2 — Pipeline 8 bước ⭐ | 0:03–0:08 | 5 giây | Job đi theo 8 bước rõ ràng |
| 3 — Sổ tiền | 0:08–0:13 | 5 giây | Thu–chi rõ từng khoản |
| 4 — Nhắc lịch | 0:13–0:18 | 5 giây | Nhắc trước giờ chụp, trước hạn giao |
| 5 — Bảng giá Digital/Film | 0:18–0:24 | 6 giây | Digital hay Film — giá tự điền |
| 6 — Kết | 0:24–0:28 | 4 giây | FotoBro — Trợ lý studio ảnh |
| **Tổng** | | **28 giây** | Nằm trong 15–30 giây của Apple, còn 2 giây đệm an toàn dưới trần 30 giây |

**Kịch bản giọng đọc đầy đủ (VI, ~55 từ — đọc chậm trong 28 giây):**
"Mở app là thấy hôm nay — chụp ai, mấy giờ, thu bao nhiêu. Job nào đang ở
bước nào, nhìn là biết. Thu theo đợt, chi theo job — báo cáo tự tính sẵn.
Nhắc trước giờ chụp 60 phút, trước hạn giao ảnh 1 ngày. Chụp film hay
digital, giá nào cũng có sẵn. FotoBro — công ty thu nhỏ trong túi bạn."

**Kịch bản giọng đọc đầy đủ (EN):**
"Open the app and see today — who you're shooting, when, and what's been
paid. See exactly where every job stands. Income by instalment, costs by
job — reports calculate themselves. A reminder 60 minutes before the shoot,
a day before delivery. Film or digital — the price fills itself in.
FotoBro — your whole studio, in your pocket."

**Nhạc nền gợi ý:** piano/acoustic nhẹ, không lời, ~90 BPM, xuyên suốt 28
giây, âm lượng dưới giọng đọc; không dùng nhạc có bản quyền chưa được cấp
phép — dùng nhạc nền miễn phí có giấy phép (ví dụ thư viện nhạc của trình
dựng video) và ghi nguồn vào file bàn giao dựng. Không đặt tên bài cụ thể
ở đây vì chưa chọn thư viện nhạc — người dựng chọn và ghi lại.

---

## 4. Các take dự phòng & preview thứ 2 (không quay trong lần đầu)

| Take / Preview | Khi nào quay | Nội dung |
|---|---|---|
| Take dự phòng A — Giọng nói | **Chỉ khi** mic kịp vào v1 (plugin speech-recognition sửa được; nếu không thì dời v1.1 và **bỏ take này**) | Màn hỏi trợ lý, khung "Bạn nói là…" hiện câu "thêm job chụp cưới ngày mai", app hiện lại cho xác nhận rồi mới ghi. Thay thế Cảnh 4 nếu cần, không kéo dài tổng quá 30 giây |
| Take dự phòng B — Poster frame | Khi dựng xong | Xuất 2 khung ứng viên ở giây 5 (Cảnh 2 lúc đủ 8 bước, và Cảnh 1 lúc thẻ tiền hiện) để chọn poster frame trong App Store Connect |
| Preview thứ 2 (tối đa 3) — Google + Lịch iPhone | Sau khi bản chính xong, nếu Google auto 1 chạm và nhập Lịch iPhone native đã chạy ổn trên TestFlight | 15–20 giây riêng: bấm "Đăng nhập Google" → Lịch/Gmail gợi ý tiền về + khách hỏi chụp; rồi "Nhập từ Lịch iPhone" → sự kiện 30 ngày tới nạp thành buổi chụp. **Không quay màn đăng nhập của Google, không quay màn cảnh báo xác minh**; dùng tài khoản Google test riêng, không lộ email thật. Nếu tính năng cần đăng nhập thì phải nói rõ trong video là "đăng nhập Google là tùy chọn" |
| Preview thứ 3 | Chưa cần ở v1 | Để trống — chỉ làm khi có tính năng mới đáng kể (ví dụ Nấc 2 đồng bộ CloudKit) |

---

## 5. Checklist trước khi quay & xuất file

### Trước khi quay (dữ liệu + máy)
- [ ] Nhập đủ bộ dữ liệu mẫu hư cấu trong `SCREENSHOT-DATA.md` vào bản TestFlight
  (An Studio; 2 buổi hôm nay; job Wedding ở Hậu kỳ 6/8; sổ tiền tuần; bảng giá
  Digital/Film 5 loại) — kiểm 1 lần các con số khớp nhau giữa các màn
- [ ] Đặt 1 ảnh trang chủ đẹp (ảnh chung, không phải ảnh khách thật); để **light mode**
- [ ] Dọn status bar: pin đầy, giờ trung tính, **tắt mọi thông báo**; bật chế độ
  Không làm phiền trong lúc quay
- [ ] Quay từng cảnh thành take ngắn riêng (1 ý/take), thao tác chậm, dừng lại
  trên kết quả — take ngắn dễ cắt/ghép hơn 1 lần quay dài
- [ ] Quay bằng ghi màn hình iPhone thật qua TestFlight (không quay từ trình
  duyệt máy tính — màu và chữ sẽ khác); hoặc Simulator với `--codec=h264`

### Trước khi xuất file
- [ ] Tổng thời lượng **15–30 giây** (bản này: 28 giây); kiểm tra đúng từng khung
  hình, không để encoder đẩy lên 30,0x giây
- [ ] Xuất đúng **886 × 1920**, **30 fps**, H.264 (.mp4) 10–12 Mbps, âm thanh
  stereo AAC 256 kbps 44,1/48 kHz; dung lượng ≤ 500 MB
- [ ] Kiểm tra poster frame ở **giây thứ 5** — phải là khung gọn, hiểu được ngay
  cả khi tắt tiếng
- [ ] Xem lại toàn bộ **không bật tiếng**: mọi ý có hiểu được chỉ bằng chữ trên
  màn hình không? Nếu có ý nào chỉ nằm trong giọng đọc thì thêm chữ phủ
- [ ] Kiểm tra lại bảng thông số Apple trong App Store Connect Help trước khi
  tải lên (thông số có thể đổi khi ra máy mới); sau khi tải lên, xử lý có thể
  mất tới 24 giờ
- [ ] Đặt tên file rõ ràng: `FotoBro-AppPreview-iPhone-VI-28s-886x1920-30fps.mp4`
  (bản EN: `...-EN-...`); bản iPad sau này đặt tên riêng theo đúng độ phân giải
  của nó (1200 × 1600), không dùng chung file iPhone

### Tuân thủ nội dung (đối chiếu Guideline 2.3.4)
- [ ] Chỉ có màn hình app thật, lấp đầy khung hình — không tay, không người,
  không khung điện thoại 3D, không màn hình dựng ngoài app
- [ ] Không nhắc mùa vụ / thời điểm cụ thể
- [ ] Không lộ tên, email, số điện thoại, job hay tiền thật của bất kỳ ai
- [ ] Sau khi quay xong: **xóa hết dữ liệu mẫu** khỏi bản TestFlight trước khi
  gửi Apple duyệt (hoặc ghi rõ "đây là dữ liệu mẫu" trong Notes cho reviewer),
  theo quy tắc cuối trong `SCREENSHOT-DATA.md`

---

## 6. Lưu ý & điểm chưa chốt (cần Việt / người dựng quyết trước khi quay)

1. **Giá trong video:** hướng dẫn của
   Apple nói preview "không đưa giá, vì giá thay đổi theo vùng" (xem §1.2). Các con số VND
   trong Cảnh 2, 3, 5 là **số tiền trong app** (giá job, thu/chi), không phải giá
   bán app — nhưng để an toàn, khi dựng: **không zoom sát vào con số VND**,
   để số tiền chỉ hiện như một phần tự nhiên của màn hình app, và kiểm tra lại
   với Guideline 2.3.4 trước khi gửi. Nếu Apple phản hồi về giá thì phương án
   dự phòng là quay lại Cảnh 3 và 5 với các con số làm mờ. **Chưa có kết luận
   chắc chắn ở đây — cần kiểm chứng lúc gửi.**
2. **Giọng đọc:** chưa chốt giọng đọc VI/EN cụ thể (giọng nữ ấm cho VI là gợi ý,
   chưa chọn người đọc). Giọng đọc là lớp thêm — video phải hiểu được khi tắt
   tiếng nên việc này không chặn dựng.
3. **Nhạc nền:** chưa chọn bài/thư viện cụ thể — người dựng chọn nhạc không lời
   có giấy phép và ghi nguồn vào file bàn giao.
4. **Bản EN:** app v1 có ngôn ngữ Việt/Anh (theo quyết định cá nhân hoá chung
   23:55 19/11/2026), nhưng ngôn ngữ chính trên App Store Connect hiện để là
   tiếng Việt (`APP-STORE-LISTING.md` §1). Bản EN chỉ làm **sau khi bản VI xong
   và app đã chạy ổn bằng tiếng Anh trên TestFlight** — đừng quay bản EN từ
   bản dịch máy.
5. **Bản iPad:** app v1 chỉ làm cho iPhone (portrait); chỉ xuất bản iPad
   (1200 × 1600) khi Việt quyết cho app chạy trên iPad.
6. **Mic (giọng nói):** chưa biết có kịp v1 hay dời v1.1 — take dự phòng A chỉ
   quay khi mic đã chạy được trên máy thật.

---

## 7. Nguồn tham chiếu

- Apple — App preview specifications (App Store Connect Help): độ dài 15–30
  giây, tối đa 3 preview/cỡ máy/ngôn ngữ, H.264 (.mov/.m4v/.mp4) hoặc ProRes
  422 HQ (.mov), ≤ 500 MB, ≤ 30 fps, H.264 10–12 Mbps, âm thanh stereo AAC
  256 kbps 44,1/48 kHz, iPhone hiện nay 886 × 1920, poster frame mặc định
  giây thứ 5, xử lý tới 24 giờ. (Truy cập qua các bản tổng hợp đã đối chiếu
  với trang Apple tháng 11/2026 — xem §1; kiểm tra lại trang Apple trước khi
  xuất file.)
- Apple — App Review Guideline 2.3.4: preview chỉ dùng video quay màn hình của
  chính app; được thêm narration và chữ/lớp phủ; không quay người cầm/chạm
  thiết bị; không đưa giá; không nhắc mùa vụ/thời điểm; phải nói rõ nếu tính
  năng cần IAP/đăng ký/đăng nhập.
- `APP-STORE-LISTING.md` §8–§9 (6 màn hình, gợi ý preview), `SCREENSHOT-DATA.md`
  (toàn bộ dữ liệu mẫu hư cấu + số liệu khớp nhau giữa các màn),
  `PRICING-DRAFT.md` §1 (pipeline 8 bước, bảng giá Digital/Film, Nấc 1 miễn phí,
  không IAP ở v1).
