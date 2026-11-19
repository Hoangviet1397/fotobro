# FotoBro — Thiết kế chương trình giới thiệu bạn (Referral) — v2

> Ngày: 20/11/2026. Trạng thái: **THIẾT KẾ ONLY — chưa code, chưa bật,
> chưa có tài khoản thật, chưa có link giới thiệu thật.**
> File này chỉ là thiết kế, đặt cạnh app iOS v1 trong
> `~/workspace/fotobro-ios-v1/batch-growth/`. Nó KHÔNG sửa code app,
> không tạo tài khoản, không push GitHub.
> Đọc cùng: `../CLOUDKIT-PLAN.md` (§0, §2, §6, §8), `../PRICING-DRAFT.md`
> (§1, §5), `../RISKS.md`, `../PRIVACY.md`.

## 0. Kết luận trước hết — chương trình này KHÔNG làm được ở v1

| Hạng mục | Trạng thái thật |
|---|---|
| v1 (Nấc 1) | **Local-first, không tài khoản, không đồng bộ, không server.** Dữ liệu chỉ nằm trên máy user (`localStorage troLyXeo.v1` + IndexedDB). Không có chỗ nào để ghi "ai giới thiệu ai", không có cách nào xác minh người được giới thiệu có thật hay không, không có cách nào trao thưởng qua các máy khác nhau. |
| Chương trình giới thiệu | **Chỉ làm được từ Nấc 2 trở lên**, khi đã có định danh user (Sign in with Apple) + một nơi ghi nhận chung (xem §6). |
| Hệ quả | **Không giả vờ làm được ở v1.** Không làm "mã giới thiệu local" (mã chỉ nằm trên máy người giới thiệu, không ai xác minh được, thưởng được thì gian lận được ngay). Không đưa nút "Giới thiệu bạn" vào app v1 với lời hứa thưởng — chỉ được đưa khi Nấc 2 đã chạy và chương trình đã bật thật. |

Nói ngắn gọn: **v1 = không referral. Nấc 2 = điều kiện cần. Chương trình
này là thiết kế cho Nấc 2 (và mở rộng lên Nấc 3 ở §7).**

## 1. Mục tiêu

1. Tăng trưởng bằng truyền miệng giữa các nhiếp ảnh gia tự do — đúng
   đối tượng dùng FotoBro (chụp portrait/couple/wedding/lookbook/event),
   thay vì quảng cáo trả tiền rộng.
2. Thưởng cho cả hai bên (người giới thiệu + người được giới thiệu) để
   người mới có lý do thử, người cũ có lý do chia sẻ.
3. Thưởng bằng **quyền dùng Nấc 2/3**, không thưởng bằng tiền mặt —
   vừa khớp mô hình thu phí đã chốt (Nấc 2/3 thu phí qua IAP, Nấc 1
   miễn phí), vừa tránh phải làm cổng thanh toán riêng (vi phạm
   guideline App Store — xem §8.4).
4. Đo được hiệu quả bằng số liệu (§5), không đo bằng cảm giác.

Không phải mục tiêu: mua user bằng mọi giá, thưởng cho lượt cài đặt ảo,
hay biến FotoBro thành app "kiếm tiền bằng mời bạn".

## 2. Phần thưởng — ĐỀ XUẤT, CHƯA CHỐT

> **Tất cả các ô dưới đây đều là đề xuất, chưa có quyết định nào được
> chốt.** Giá Nấc 2/3 hiện vẫn là `TBD` (xem `PRICING-DRAFT.md` §5) nên
> **không thể chốt số tháng thưởng trước khi chốt giá + chu kỳ**.
> Mọi con số tháng/ngày dưới đây là số gợi ý để Việt chọn, không phải
> số thật, không ghi vào code hay App Store Listing.

### 2.1 Nguyên tắc thưởng

- Thưởng = **gia hạn miễn phí Nấc 2** (hoặc giảm giá Nấc 3, xem §2.3).
  Không thưởng tiền mặt, không thưởng bằng tiền chuyển khoản, không
  thưởng bằng gift card ngoài App Store.
- Thưởng chỉ trao **sau khi người được giới thiệu đạt mốc xác minh**
  (§4.2) — không trao ngay lúc cài app, để chống tài khoản ảo.
- Thưởng có **hạn dùng** (vd: dùng trong 12 tháng kể từ ngày trao),
  không cộng dồn vô hạn — tránh một user tích 10 năm miễn phí rồi
  không bao giờ trả tiền.
- Người giới thiệu **đang ở Nấc 1 miễn phí** vẫn nhận được thưởng:
  thưởng được "cất" lại và tự bật khi họ nâng lên Nấc 2 (xem §2.4).

### 2.2 Bảng đề xuất (chưa chốt — Việt chọn 1 phương án)

| # | Người giới thiệu được | Người được giới thiệu được | Ghi chú |
|---|---|---|---|
| **A (đề xuất chính)** | `TBD` tháng Nấc 2 miễn phí / 1 người giới thiệu thành công | `TBD` tháng Nấc 2 miễn phí khi đăng ký qua link giới thiệu | Đơn giản nhất, dễ hiểu, dễ code. Gợi ý ban đầu để bàn: 1 tháng / bên. |
| **B** | `TBD` tháng Nấc 2 / người, tối đa `TBD` tháng cộng dồn | Giảm `TBD`% tháng đầu Nấc 2 (thay vì miễn phí hẳn) | Người mới vẫn trả một ít → lọc user thật sự muốn dùng. Nhưng phức tạp hơn A (cần cấu hình introductory offer trong IAP). |
| **C** | Mốc bậc thang: 3 người = `TBD` tháng, 5 người = `TBD` tháng, 10 người = `TBD` tháng Nấc 3 | Như phương án A | Khuyến khích giới thiệu nhiều, nhưng dễ gây "chơi game" để leo mốc + khó giải thích trong 1 màn hình. Chỉ cân nhắc khi A đã chạy ổn. |

**Chưa chọn phương án nào.** Đề xuất bắt đầu bằng **A** vì đơn giản
nhất; B và C ghi lại để bàn sau, không code cùng lúc.

### 2.3 Mở rộng lên Nấc 3 (studio)

- Người giới thiệu đang dùng Nấc 3: thưởng quy đổi thành giảm giá /
  gia hạn Nấc 3 theo tỷ lệ do Việt chốt sau (không tự quy đổi 1 tháng
  Nấc 2 = 1 tháng Nấc 3 vì giá Nấc 3 cao hơn Nấc 2 — giá cả hai đều
  đang `TBD`).
- Người được giới thiệu đăng ký Nấc 3 (mở studio): người giới thiệu
  được thưởng Nấc 3 thay vì Nấc 2 (mức do Việt chốt).
- Không làm riêng một chương trình referral cho Nấc 3 ở giai đoạn đầu;
  dùng chung một chương trình, chỉ khác mức quy đổi.

### 2.4 Trường hợp biên (đã nghĩ trước, chưa code)

| Trường hợp | Cách xử lý đề xuất |
|---|---|
| Người giới thiệu đang ở Nấc 1 (chưa trả tiền) | Thưởng "cất" lại (credit chờ). Khi họ nâng lên Nấc 2, credit tự trừ vào kỳ đầu. Hiển thị rõ trong app: "Bạn đang có X tháng miễn phí chờ dùng". Credit hết hạn sau `TBD` tháng nếu không dùng. |
| Người được giới thiệu đã có tài khoản FotoBro từ trước | Không tính là giới thiệu thành công. Mã/link chỉ có tác dụng với user mới (chưa từng có Apple ID nào đăng nhập FotoBro Nấc 2). |
| Người được giới thiệu tự giới thiệu chính mình | Chặn (§4.1). |
| Người giới thiệu hết hạn Nấc 2 rồi mới có người đăng ký qua link cũ | Link vẫn tính, thưởng vẫn "cất" lại như trường hợp Nấc 1. Link không hết hạn theo gói của người giới thiệu. |
| Tranh chấp "ai giới thiệu trước" (người mới bấm 2 link khác nhau) | Người bấm link **đầu tiên** được tính, nếu lượt bấm đó xảy ra trước khi đăng ký. Sau khi đã gắn mã thì không đổi được. |

## 3. Cách chia sẻ mã / link

### 3.1 Mã giới thiệu

- Định dạng đề xuất: **6 ký tự, chữ + số, dễ đọc, tránh nhầm lẫn**
  (bỏ `0`/`O`, `1`/`I`/`l`). Ví dụ dạng: `FOTO-XXXXXX` — ví dụ chỉ
  minh hoạ định dạng, không phải mã thật.
- Mã gắn với **Apple ID đã Sign in with Apple** của người giới thiệu
  (không gắn với máy, không gắn với tên user tự gõ — vì tên tự gõ thì
  đổi được, Apple ID thì không).
- 1 user = 1 mã duy nhất, không đổi được (đổi mã = mất dấu các link
  đã chia sẻ). Mã hiện trong Cài đặt → Giới thiệu bạn, kèm nút sao chép.
- Không dùng số điện thoại hay email làm mã (nhạy cảm, lộ thông tin).

### 3.2 Link giới thiệu

- Dạng đề xuất: **Universal Link / App Store link + mã**, vd:
  `https://fotobro.app/r/<MÃ>` (domain `fotobro.app` chưa xác minh
  được trống hay không — xem MEMORY 19/11/2026; nếu không lấy được thì
  dùng link App Store kèm mã, xem dưới). Đây là **dạng đề xuất, chưa
  có link thật**.
- Luồng bấm link (khi đã có Nấc 2):
  1. Người mới bấm link → mở App Store (nếu chưa cài) hoặc mở app
     (nếu đã cài, qua Universal Link).
  2. App đọc mã từ link, lưu tạm local ("mã chờ gắn"), hiện banner:
     "Bạn được giới thiệu bởi … — đăng ký Nấc 2 để nhận `TBD` tháng
     miễn phí". Không hiện tên thật của người giới thiệu nếu họ không
     cho phép (xem §3.4).
  3. Người mới đăng nhập Sign in with Apple + đạt mốc xác minh (§4.2)
     → mã được gắn chính thức, thưởng trao cho cả hai bên.
  4. Nếu người mới đã cài app từ trước và tự mở app (không qua link),
     mã không tự gắn — phải nhập mã tay trong lúc đăng ký Nấc 2
     (ô "Mã giới thiệu (không bắt buộc)").
- Dự phòng khi chưa có domain riêng: dùng link App Store
  (`https://apps.apple.com/app/id…`) + hướng dẫn nhập mã tay. Kém
  mượt hơn nhưng làm được ngay, không phụ thuộc việc mua domain.

### 3.3 Kênh chia sẻ

- Dùng **iOS Share Sheet hệ thống** (tin nhắn, Messenger, Zalo,
  Facebook, email, copy link) — app không tự làm kênh riêng.
- Nội dung chia sẻ soạn sẵn (2 ngôn ngữ vi/en, theo `I18N-STRINGS.md`),
  ngắn, nói rõ app làm gì + thưởng là gì (khi đã chốt §2.2):
  "FotoBro — trợ lý cho photographer tự do: job, tiền, lịch trong 1
  app. Đăng ký qua link của mình để nhận `TBD` tháng Nấc 2 miễn phí."
- **Không tự động gửi tin nhắn, không đọc danh bạ, không tải danh bạ
  lên server.** User tự chọn người nhận trong Share Sheet. Đây là
  ranh giới riêng tư: FotoBro không biết user định mời ai cho tới khi
  người đó tự đăng ký qua link.

### 3.4 Riêng tư

- Người giới thiệu chọn hiển thị tên studio / tên hiển thị hay ẩn danh
  trong banner giới thiệu ("Bạn được một photographer giới thiệu").
  Mặc định: **chỉ hiện tên studio nếu user đã đặt, không hiện tên
  thật, email hay Apple ID**.
- Không hiện cho người giới thiệu danh sách "ai đã đăng ký qua link
  của bạn" kèm tên thật — chỉ hiện **số lượng** (vd: "3 người đã tham
  gia qua link của bạn") để tránh lộ thông tin người mới.
- Không ghi log số điện thoại, email hay nội dung tin nhắn chia sẻ.

## 4. Chống gian lận (cơ bản)

> Mức độ: **cơ bản, đủ cho giai đoạn đầu**. Không làm hệ thống chống
> gian lận nặng (device fingerprint chuyên sâu, ML, thuê dịch vụ
> chống fraud) ở v1 của chương trình. Nếu gian lận tăng thì nâng cấp
> sau, theo số liệu §5.4.

### 4.1 Quy tắc chặn (đề xuất)

| # | Quy tắc | Vì sao |
|---|---|---|
| 1 | **1 Apple ID = 1 tài khoản referral**, cả hai vai | Apple ID khó tạo hàng loạt hơn email tự do; Sign in with Apple đã có sẵn ở Nấc 2 nên không thêm bước xác minh mới. |
| 2 | **Không tự giới thiệu mình**: mã của chính mình không gắn được cho chính mình | Chặn trường hợp tự tạo link rồi tự đăng ký lấy thưởng. |
| 3 | **Thưởng chỉ trao sau mốc xác minh (§4.2), không trao lúc cài app** | Cài app là miễn phí + không cần tài khoản (Nấc 1), nên "lượt cài" không chứng minh được gì. |
| 4 | **Giới hạn thiết bị**: tối đa `TBD` tài khoản Nấc 2 mới / 1 thiết bị / `TBD` ngày (gợi ý để bàn: 3 tài khoản / máy / 30 ngày) | Chặn tạo nhiều Apple ID trên cùng 1 máy để farm thưởng. Con số `TBD` — chốt sau khi xem số liệu thật, đặt quá chặt sẽ chặn cả gia đình/studio dùng chung máy. |
| 5 | **Giới hạn tốc độ**: 1 mã giới thiệu tối đa `TBD` lượt thành công / ngày (gợi ý để bàn: 10/ngày) | Chặn mã bị spam lên mạng xã hội rồi farm hàng loạt. Vượt giới hạn thì các lượt sau xếp hàng chờ duyệt tay. |
| 6 | **Không cộng dồn vô hạn**: tổng tháng thưởng cộng dồn tối đa `TBD` tháng / user (gợi ý để bàn: 12 tháng) | Tránh 1 user tích thưởng nhiều năm rồi không bao giờ trả tiền. |
| 7 | **Thu hồi thưởng khi phát hiện gian lận**: nếu tài khoản người được giới thiệu bị xác định là ảo sau khi đã trao thưởng, thu hồi tháng miễn phí của cả hai bên + vô hiệu hoá mã (tạm thời hoặc vĩnh viễn) | Không có thu hồi thì gian lận không có giá phải trả. Phải thông báo rõ lý do trong app, có kênh khiếu nại (email hỗ trợ — hiện chưa có, xem §8.5). |

### 4.2 Mốc xác minh — khi nào mới tính là "giới thiệu thành công"

Thưởng chỉ trao khi người được giới thiệu đạt **cả 3 điều kiện**
(đề xuất, chưa chốt — Việt có thể nới/chặt):

1. **Đã đăng nhập Nấc 2** bằng Sign in with Apple (có Apple ID thật,
   không phải tài khoản local ẩn danh).
2. **Đã dùng app thật**: tạo tối thiểu `TBD` job HOẶC `TBD` giao dịch
   thu/chi trong `TBD` ngày đầu (gợi ý để bàn: 3 job hoặc 5 giao dịch
   trong 14 ngày). Điều kiện này lọc tài khoản tạo xong bỏ đó.
3. **Đã trả tiền ít nhất 1 kỳ Nấc 2** HOẶC **đã dùng hết tháng miễn
   phí đầu và vẫn còn dùng app** (tuỳ phương án thưởng ở §2.2):
   - Nếu phương án A (tặng tháng miễn phí ngay): điều kiện (2) là đủ,
     không đòi trả tiền trước — vì tháng đầu đã miễn phí.
   - Nếu phương án B (giảm giá tháng đầu): yêu cầu đã thanh toán tháng
     đầu (đã giảm giá) thì mới trao thưởng cho người giới thiệu.

**Không dùng "cài app" hay "mở app 1 lần" làm mốc** — cả hai đều
không tốn công và không chứng minh dùng thật.

### 4.3 Phát hiện + xử lý

- **Tự động**: các quy tắc §4.1 chạy ngay lúc gắn mã / trao thưởng;
  lượt vi phạm bị từ chối kèm lý do chung chung ("Mã không hợp lệ
  hoặc đã hết lượt") — không tiết lộ chi tiết luật chặn để khỏi bị
  lách luật.
- **Thủ công**: dashboard xem top mã có lượt thành công bất thường
  (vd: 1 mã > `TBD` lượt / tuần, nhiều tài khoản cùng 1 thiết bị).
  Người vận hành (Việt) xem và quyết: giữ, tạm khoá mã, hay thu hồi
  thưởng. Ở giai đoạn đầu làm bằng tay trong CloudKit Console /
  Supabase dashboard, không code dashboard riêng.
- **Khiếu nại**: user bị thu hồi thưởng có quyền hỏi lại qua email hỗ
  trợ. Chưa có email hỗ trợ thì chưa mở kênh này (xem §8.5) — không
  hứa kênh khiếu nại khi chưa có người trả lời.

### 4.4 Những gì KHÔNG chống được ở mức cơ bản (nói thật)

- Người dùng thật rủ người quen thật tạo tài khoản thật rồi chia nhau
  thưởng — đây là hành vi đúng luật chơi, không phải gian lận, chỉ
  tốn chi phí thưởng. Giới hạn cộng dồn (§4.1 #6) là cách kiềm chế.
- Nhiều Apple ID thật trên nhiều máy thật (vd: cả studio cùng đăng ký
  qua 1 link) — nhìn giống farm nhưng có thể là dùng thật. Chỉ can
  thiệp khi có thêm dấu hiệu khác (không tạo job nào, bỏ app ngay).
- Không chống được việc chia sẻ mã công khai lên mạng xã hội — chỉ
  kiềm bằng giới hạn tốc độ (§4.1 #5).

## 5. Chỉ số đo hiệu quả (KPIs)

Đo **hàng tuần** trong 3 tháng đầu sau khi bật, rồi hàng tháng. Tất cả
chỉ số tính trên user Nấc 2 (có tài khoản), không tính user Nấc 1 ẩn
danh vì không gắn được mã.

### 5.1 Chỉ số chính

| Chỉ số | Định nghĩa | Mục tiêu gợi ý (chưa chốt) |
|---|---|---|
| **Invite rate** | % user Nấc 2 đã chia sẻ link/mã ít nhất 1 lần | `TBD`% (gợi ý để bàn: 10%/tháng đầu) |
| **Click-through rate** | Số lượt bấm link / số lượt chia sẻ | `TBD`% |
| **Signup conversion** | Số tài khoản Nấc 2 mới đăng ký qua link / số lượt bấm link | `TBD`% (gợi ý để bàn: 5–10%) |
| **Verified conversion** | Số giới thiệu thành công (đạt mốc §4.2) / số đăng ký qua link | `TBD`% (gợi ý để bàn: ≥ 50% — thấp hơn nghĩa là mốc xác minh quá chặt hoặc user mới không dùng thật) |
| **K-factor** | Số user mới thành công trung bình / 1 user hiện có = invite rate × conversion | > 0,2 = tăng trưởng tự lan tốt; < 0,1 = chương trình chưa đủ hấp dẫn, cần xem lại thưởng (§2.2) |
| **Cost per referred user** | Chi phí thưởng trung bình / 1 user thành công (tính bằng tháng Nấc 2 miễn phí đã trao × giá Nấc 2 — giá đang `TBD` nên chỉ số này chỉ tính được sau khi chốt giá) | Thấp hơn chi phí quảng cáo / 1 user (nếu có chạy quảng cáo để so sánh) |
| **Retention của user được giới thiệu** | % user qua referral còn dùng app sau 30/90 ngày, so với user đến từ kênh khác | Cao hơn hoặc bằng kênh khác — nếu thấp hơn nhiều thì referral đang kéo user không đúng đối tượng |

### 5.2 Chỉ số phụ

- Số mã đang hoạt động / mã bị khoá / mã hết lượt (§4.1 #5).
- Thời gian trung bình từ bấm link → đăng ký → đạt mốc xác minh.
- Top 10 mã có nhiều lượt thành công nhất (để phát hiện bất thường, §4.3).
- % thưởng bị thu hồi (§4.1 #7) — tăng đột biến = gian lận tăng hoặc luật chặn quá chặt.

### 5.3 Ngưỡng xem xét lại chương trình

- **K-factor < 0,1 sau 2 tháng** → xem lại mức thưởng (§2.2) hoặc
  luồng chia sẻ (§3.2) có khó dùng không.
- **Verified conversion < 30%** → mốc xác minh (§4.2) có thể quá
  chặt, hoặc user mới không hiểu app làm gì — xem lại onboarding.
- **Thu hồi thưởng > 5% tổng lượt thành công** → gian lận đáng kể,
  siết luật §4.1 hoặc chuyển sang duyệt tay.
- **Cost per referred user cao hơn doanh thu trung bình / user trong
  3 tháng đầu** → chương trình đang lỗ, giảm thưởng hoặc dừng.

### 5.4 Dữ liệu cần ghi (tối thiểu, không thừa)

Mỗi lượt referral chỉ ghi: mã, thời điểm bấm link, thời điểm đăng ký,
thời điểm đạt mốc, trạng thái (chờ / thành công / từ chối / thu hồi),
thiết bị (định danh ẩn danh để áp §4.1 #4, không lưu UDID/serial).
**Không ghi**: tên khách, số tiền job, nội dung tin nhắn chia sẻ, danh
bạ. Dữ liệu này phải tuân thủ `PRIVACY.md` + luật App Store về theo
dõi (không dùng cho quảng cáo bên thứ ba).

## 6. Điều kiện kỹ thuật tiên quyết (chưa có gì trong số này ở v1)

| # | Cần có trước | Vì sao | Trạng thái hiện tại |
|---|---|---|---|
| 1 | **Nấc 2 chạy ổn**: Sign in with Apple + CloudKit container `iCloud.com.fotobro.app` + sync/so lưu mã hoá | Không có định danh user thì không biết ai giới thiệu ai | Chưa có — xem `CLOUDKIT-PLAN.md` §7, §9 |
| 2 | **Nơi ghi nhận chung, ngoài privateDB**: 1 record type chia sẻ (CloudKit sharedDB) hoặc 1 bảng server tối thiểu (vd: Supabase dự phòng) để ghi "mã X đã được user Y dùng" | CloudKit **privateDB chỉ mỗi user thấy dữ liệu của mình** — user A không thể ghi vào privateDB của user B, nên không thể đối soát referral nếu chỉ dùng privateDB. Đây là điểm kỹ thuật quan trọng nhất của chương trình này, phải quyết trước khi code. | Chưa quyết (sharedDB hay Supabase — xem `CLOUDKIT-PLAN.md` §5.1, §8.2) |
| 3 | **Giá + chu kỳ Nấc 2/3 đã chốt** (`PRICING-DRAFT.md` §5) | Không có giá thì không tính được chi phí thưởng, không cấu hình IAP cho tháng miễn phí / giảm giá | `TBD` |
| 4 | **Cơ chế trao thưởng qua IAP**: tháng miễn phí = cấu hình trong StoreKit (introductory offer / promo code / gia hạn subscription), không tự cộng ngày trong app local | Tự cộng ngày trong app local thì user xoá app cài lại là mất dấu, và Apple không công nhận | Chưa có — cần kiểm tra cách StoreKit hỗ trợ (xem §8.4) |
| 5 | **Màn hình Giới thiệu bạn trong app** (Cài đặt → Giới thiệu bạn): hiện mã, nút chia sẻ, số người đã tham gia, số tháng thưởng đang có/chờ dùng | Không có UI thì user không biết chương trình tồn tại | Chưa thiết kế UI, chưa code |

Thứ tự: **(1) → (2) → (3) → (4) → (5)**. Không làm ngược: code UI
giới thiệu trước khi có nơi ghi nhận chung (§6 #2) thì UI đó chỉ là
màn hình trang trí.

## 7. Lộ trình đề xuất (sau Nấc 2)

| Giai đoạn | Nội dung | Điều kiện vào |
|---|---|---|
| **G0 — Hiện tại (v1)** | Không có referral. Không nút, không mã, không hứa thưởng. | — |
| **G1 — Nấc 2 chạy ổn** | Nấc 2 + giá đã chốt + nơi ghi nhận chung (§6 #2) đã quyết. | `CLOUDKIT-PLAN.md` §7 xong, `PRICING-DRAFT.md` §5 xong |
| **G2 — Referral tối thiểu** | Phương án A (§2.2) + mã 6 ký tự + link + mốc xác minh §4.2 + luật chặn §4.1 + đo §5.1. Chỉ cho user Nấc 2. | G1 xong + Việt chốt phương án thưởng + các con số `TBD` trong §2.2, §4.1, §4.2 |
| **G3 — Mở rộng** | Quy đổi thưởng lên Nấc 3 (§2.3), phương án B/C nếu K-factor thấp (§5.3), dashboard xem top mã (§4.3). | G2 chạy ≥ 2 tháng + có số liệu §5 |
| **G4 — Sau này (không hứa ngày)** | Referral cho nhóm/studio (chủ studio mời cả nhóm), thưởng theo workspace. | Nấc 3 chạy ổn |

## 8. Những gì còn chờ Việt quyết / cần kiểm tra

| # | Cần Việt quyết / kiểm tra | Vì sao chưa làm được |
|---|---|---|
| 1 | **Chọn phương án thưởng** (§2.2: A, B hay C) + điền các số `TBD` (bao nhiêu tháng, giới hạn cộng dồn, mốc xác minh) | Không có số thì không code được, không đo được chi phí |
| 2 | **Giá + chu kỳ Nấc 2/3** | Như `PRICING-DRAFT.md` §5 — chặn cả referral lẫn IAP |
| 3 | **Nơi ghi nhận chung: CloudKit sharedDB hay Supabase?** (§6 #2) | Quyết định này đổi toàn bộ cách code đối soát referral |
| 4 | **Cách trao tháng miễn phí qua StoreKit có đúng guideline Apple không?** (introductory offer / offer code / subscription extension — cần kiểm tra tài liệu StoreKit lúc code, không đoán trong file này) | Trao thưởng sai cách có thể bị Apple từ chối khi review; **không thưởng bằng tiền mặt hay thanh toán ngoài IAP** |
| 5 | **Email hỗ trợ FotoBro** (để xử lý khiếu nại thu hồi thưởng, §4.3) | Hiện chưa có email hỗ trợ (MEMORY 19/11/2026) — chưa có thì chưa mở kênh khiếu nại |
| 6 | **Domain cho link giới thiệu** (`fotobro.app` chưa xác minh được trống hay không) | Không có domain thì dùng link App Store + nhập mã tay (§3.2) |
| 7 | **Có cho phép user Nấc 1 chia sẻ link trước (để dành) không?** | Đề xuất trong file này là KHÔNG — chỉ user Nấc 2 mới có mã, vì mã phải gắn Apple ID. Nếu Việt muốn Nấc 1 cũng chia sẻ được thì phải thiết kế lại §3.1 |

## 9. Cái nào thật, cái nào chưa (đọc trước khi tin)

| Hạng mục | Trạng thái thật |
|---|---|
| App iOS v1 (Nấc 1, local-first, không tài khoản) | Đang làm, xem `../README.md`, `../CHANGELOG-v1.0.md` |
| Nấc 2 CloudKit + Sign in with Apple | Thiết kế only (`../CLOUDKIT-PLAN.md`), chưa code, container chưa tạo |
| Giá Nấc 2/3 | `TBD`, chưa chốt (`../PRICING-DRAFT.md`) |
| Chương trình giới thiệu này (`REFERRAL-DESIGN.md`) | **Thiết kế only, bản v2 — chưa code, chưa bật, chưa có mã/link thật** |
| Mọi con số tháng / % / giới hạn trong file này | **Đề xuất, chưa chốt** — ghi `TBD` ở chỗ chưa có số gợi ý, ghi "gợi ý để bàn" ở chỗ có số tham khảo |
| Mã giới thiệu, link `fotobro.app/r/…` | Chưa tồn tại — ví dụ định dạng, không phải mã/link thật |

## 10. Trạng thái

- **Thiết kế xong (bản v2).** Chỉ 1 file mới (`batch-growth/REFERRAL-DESIGN.md`),
  không sửa file nào khác, không sửa code, không tạo tài khoản, không push GitHub.
- Còn chờ Việt: chốt phương án thưởng + các số `TBD` (§8 #1–#2) và
  quyết nơi ghi nhận chung (§8 #3) — cả ba đều chặn trước khi code,
  và tất cả đều đứng sau Nấc 2 chạy ổn (§6, §7 G1).
