# FotoBro — Ghi chú về EULA (End User License Agreement)

> **Trạng thái:** Ghi chú nội bộ để Việt chốt phương án — **không phải văn bản
> pháp lý, không phải bản EULA để nộp**, và **không thay thế tư vấn của luật sư**.
> Ngày viết: 20/11/2026. Phạm vi: app iOS v1, Bundle ID `com.fotobro.app`,
> repo `Hoangviet1397/fotobro`.
>
> **Quyết định chưa chốt:** dùng EULA chuẩn của Apple hay viết EULA riêng cho
> FotoBro — cần Việt chốt (xem §6). Khuyến nghị trong file này là **dùng EULA
> chuẩn Apple cho v1** (xem §5).
>
> Nguồn đã đọc trong gói (20/11/2026): `APP-STORE-READY.md`,
> `PRIVACY.md` / `PRIVACY.html`, `README.md`, `CLOUDKIT-PLAN.md`,
> `PRICING-DRAFT.md`. Nguồn ngoài: văn bản EULA chuẩn của Apple
> (`apple.com/legal/internet-services/itunes/dev/stdeula/`) và tài liệu
> "Instructions for Minimum Terms of Developer's End-User License Agreement"
> của Apple (10 điều khoản bắt buộc đối với EULA riêng — xem §3.2).
> **Lưu ý:** thư mục `batch-legal/` trước khi viết file này là thư mục trống —
> chưa có `TERMS-DRAFT.md` (Điều khoản sử dụng) trong gói; xem §1.3.

---

## 1. EULA là gì — và nó khác gì Privacy Policy, Terms of Service

### 1.1. Định nghĩa ngắn

EULA (End User License Agreement — Thỏa thuận cấp phép cho người dùng cuối)
là hợp đồng giữa **bên cấp phép app (FotoBro) và người dùng**, quy định người
dùng được phép dùng app trong phạm vi nào. Người dùng đồng ý EULA khi tải
app từ App Store. EULA trả lời 4 câu hỏi: *được dùng app tới đâu, không được
làm gì với app, ai chịu trách nhiệm nếu app lỗi, và khi nào giấy phép chấm dứt.*

### 1.2. EULA không phải là Privacy Policy

| Văn bản | Trả lời câu hỏi | Trạng thái ở FotoBro v1 |
|---|---|---|
| **EULA** | Được dùng app tới đâu? Không được sao chép/bán lại? Ai chịu trách nhiệm khi app lỗi? | **Chưa chọn phương án** — file này |
| **Privacy Policy** (Chính sách riêng tư) | App thu thập dữ liệu gì, lưu ở đâu, chia sẻ với ai, xoá thế nào? | **Đã có**: `PRIVACY.md` / `PRIVACY.html` (20/11/2026), dùng làm Privacy Policy URL bắt buộc khi nộp App Store |
| **Terms of Service / Terms of Use** (Điều khoản sử dụng) | Quy tắc dùng dịch vụ: tài khoản, gói trả phí, hành vi bị cấm, chấm dứt tài khoản? | **Chưa có** — `TERMS-DRAFT.md` chưa tồn tại trong `batch-legal/` |

Ba văn bản này khác nhau và **không thay thế nhau**. EULA nói về *giấy phép
dùng phần mềm*; Privacy Policy nói về *dữ liệu*; Terms of Service nói về
*quy tắc dùng dịch vụ*. Một app có thể chỉ cần EULA + Privacy Policy (như
FotoBro v1), và chỉ cần thêm Terms of Service khi có tài khoản, gói trả phí
hay tính năng nhiều người dùng (Nấc 2/3 — xem §5.3).

### 1.3. Mô hình app v1 — vì sao nó quyết định phương án EULA

Những điểm đã chốt trong gói, lấy từ `APP-STORE-READY.md`, `PRIVACY.md`,
`README.md` (không nhắc lại ở đây để hỏi lại):

- **Local-first, Nấc 1 miễn phí, không tài khoản, không máy chủ riêng.**
  Dữ liệu job/tiền/cài đặt chỉ ở trên máy người dùng; không quảng cáo,
  không theo dõi, không analytics.
- **Không có In-App Purchase ở v1**, không thu phí, không gói thuê bao.
  Nấc 2 (CloudKit) và Nấc 3 (nhóm/studio) **có thu phí nhưng chỉ là
  placeholder** — giá và chu kỳ chưa chốt (`TBD`, xem `PRICING-DRAFT.md`),
  chưa bật IAP thật, container CloudKit `iCloud.com.fotobro.app` chưa tạo.
- **Không có nội dung do người dùng tạo rồi chia sẻ cho nhau** (không UGC,
  không cộng đồng, không chat giữa các user). Mỗi người dùng tự điền tên và
  studio của mình; app không chia sẻ dữ liệu giữa các người dùng.
- **Google là tùy chọn, không bắt buộc**: đăng nhập 1 chạm, dùng Client ID
  chung của FotoBro, token chỉ giữ trong phiên, v1 không lưu refresh token.
  Lịch iPhone nhập 1 chạm qua EventKit. Giọng nói dời sang v1.1.
- **Thông tin pháp lý còn thiếu:** tên chủ sở hữu để ghi Copyright
  (`© 2026 FotoBro` — `APP-STORE-READY.md` §3 ghi "để Việt chốt tên hiển thị")
  và email hỗ trợ `support@fotobro.app` **đang thiết lập, chưa có hộp thư thật**.

Kết luận rút ra từ mô hình này: **v1 là app đơn giản nhất có thể về mặt pháp
lý** — miễn phí, dùng một mình, không máy chủ, không thu tiền, không chia sẻ
dữ liệu. Đó là lý do phương án EULA chuẩn của Apple đủ dùng cho v1 (§2),
và là lý do EULA riêng chỉ trở nên cần thiết khi mô hình đổi ở Nấc 2/3 (§5.3).

---

## 2. Phương án A — Dùng EULA chuẩn của Apple (Apple Standard EULA)

### 2.1. Cơ chế: không làm gì cũng có EULA

- Khi nhà phát triển **không cung cấp EULA riêng**, EULA chuẩn của Apple
  (Licensed Application End User License Agreement) **tự động áp dụng** ngay
  khi app lên App Store. Người dùng đồng ý với nó khi tải app.
- Không cần viết, không cần host, không cần dán link. Trong App Store
  Connect, mục App Information → License Agreement cứ **để mặc định**
  (không chọn "Apply custom EULA") là xong.
- Văn bản gốc: `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
  — đây là văn bản của Apple, Apple tự cập nhật; nhà phát triển không phải
  theo dõi hay sửa theo.

### 2.2. EULA chuẩn của Apple nói gì (tóm tắt những điểm chính)

| Điều khoản | Nội dung |
|---|---|
| Phạm vi giấy phép | Giấy phép **giới hạn, không độc quyền, không được chuyển nhượng**, chỉ dùng trên thiết bị Apple mà người dùng sở hữu hoặc kiểm soát, theo đúng Quy tắc sử dụng của App Store (kể cả Family Sharing). |
| Không được làm gì | Không được cho thuê, cho mượn, bán lại, phân phối lại app; không được dịch ngược / tháo gỡ / cố phá mã app, trừ khi luật cho phép. |
| Bảo hành | Apple **từ chối bảo hành** ở mức tối đa luật cho phép; app được cung cấp "nguyên trạng". Nếu app lỗi không đúng như cam kết, người dùng báo cho Apple và Apple hoàn tiền giá mua — đó là nghĩa vụ bảo hành duy nhất của Apple. |
| Giới hạn trách nhiệm | Trách nhiệm của Apple với vai trò bên cấp phép **giới hạn ở 50 USD**, không chịu thiệt hại gián tiếp / đặc biệt / do hậu quả. |
| Bảo trì, hỗ trợ | Apple **không có nghĩa vụ** bảo trì hay hỗ trợ app. |
| Khiếu nại, sở hữu trí tuệ | Apple không chịu trách nhiệm giải quyết khiếu nại về app (trách nhiệm sản phẩm, tuân thủ pháp luật, bảo vệ người tiêu dùng) hay khiếu nại xâm phạm sở hữu trí tuệ của bên thứ ba. |
| Chấm dứt | Giấy phép chấm dứt khi người dùng vi phạm thỏa thuận; khi đó phải ngừng dùng app và xoá app khỏi thiết bị. |
| Luật áp dụng | Luật bang California, tòa án quận Santa Clara — **trừ** người tiêu dùng ở EU/EEA được áp dụng luật và tòa án nơi mình ở. |
| Tuân thủ pháp luật | Người dùng cam đoan không ở nước bị Mỹ cấm vận, không nằm trong danh sách cấm của chính phủ Mỹ. |

### 2.3. Ưu điểm (đối với FotoBro v1)

1. **Không tốn công, không tốn tiền, không rủi ro sai sót.** Không cần thuê
   luật sư viết, không cần dịch, không sợ viết thiếu điều khoản bắt buộc
   rồi bị Apple trả về khi duyệt.
2. **Apple đã duyệt sẵn.** Đây là văn bản của chính Apple, nên không có
   chuyện App Review bắt bẻ nội dung EULA.
3. **Đủ dùng cho app miễn phí, dùng một mình.** Mọi rủi ro pháp lý lớn của
   app trả phí / nhiều người dùng (hoàn tiền thuê bao, tranh chấp trong
   nhóm, nội dung người dùng đăng) **đều không tồn tại ở v1** — nên những
   điều khoản "chung chung" của EULA chuẩn là đủ.
4. **Không cần thông tin còn thiếu.** EULA chuẩn không yêu cầu ghi tên,
   địa chỉ hay email liên hệ của nhà phát triển — trong khi EULA riêng thì
   bắt buộc phải có (§3.2, mục 8), mà hiện tại tên chủ sở hữu và email hỗ
   trợ của FotoBro đều **chưa chốt** (§1.3).
5. **Dễ đổi sau.** Dùng EULA chuẩn ở v1 không khóa cửa: khi lên Nấc 2/3
   vẫn có thể chuyển sang EULA riêng bằng cách dán văn bản mới vào App
   Store Connect (xem §3.3).

### 2.4. Nhược điểm / giới hạn

1. **Không nói gì riêng về FotoBro.** EULA chuẩn không nhắc tới: dữ liệu
   job/tiền của nhiếp ảnh gia, ảnh khách hàng, bảng giá digital/film, mẫu
   tin nhắn, sao lưu JSON, CloudKit. Nếu có tranh chấp xoay quanh những
   thứ đó, EULA chuẩn không có câu chữ nào bênh vực riêng cho FotoBro.
2. **Giới hạn 50 USD là giới hạn của Apple, không phải của FotoBro.**
   Một số hướng dẫn pháp lý lưu ý: con số 50 USD trong EULA chuẩn giới hạn
   trách nhiệm của **Apple với vai trò bên cấp phép**, chứ không tự động
   giới hạn trách nhiệm của **nhà phát triển** theo cùng mức đó. Đây là
   điểm cần luật sư xác nhận nếu Việt muốn chắc chắn — **không nên coi
   EULA chuẩn là "lá chắn trách nhiệm" đầy đủ cho FotoBro**.
3. **Luật áp dụng là luật California (trừ EU/EEA).** Người dùng FotoBro là
   nhiếp ảnh gia ở Việt Nam; nếu có tranh chấp, EULA chuẩn không đưa tranh
   chấp về luật Việt Nam. Ở v1 (miễn phí, không hợp đồng tiền bạc) thì rủi
   ro này nhỏ, nhưng nó là một giới hạn có thật.
4. **Không có điều khoản về thuê bao / hoàn tiền / gói dùng thử.** Ở v1
   không cần (không có IAP), nhưng ngay khi bật Nấc 2/3 thu phí thì EULA
   chuẩn **không đủ** — xem §5.3.
5. **Không có điều khoản về dữ liệu trong nhóm / vai trò / mời thành viên.**
   Chỉ phát sinh ở Nấc 3, chưa có ở v1.
6. **Ngôn ngữ:** văn bản gốc của Apple bằng tiếng Anh. Người dùng Việt
   đọc EULA chuẩn qua App Store sẽ thấy bản tiếng Anh (hoặc bản dịch của
   Apple nếu có), không có bản tiếng Việt riêng của FotoBro.

### 2.5. Việc phải làm nếu chọn phương án A

- **Không làm gì thêm trong App Store Connect**: để License Agreement ở
  mặc định (Standard EULA).
- **Không cần viết file EULA**, không cần host URL nào cho EULA.
- **Lưu ý duy nhất:** nếu sau này app có thuê bao (Nấc 2/3) mà vẫn dùng
  EULA chuẩn, Guideline 3.1.2 của Apple yêu cầu phải có link "Terms of Use
  (EULA)" tới EULA chuẩn của Apple trong mô tả app hoặc trong app — việc
  này chỉ phát sinh khi có thuê bao, **không cần làm ở v1**.

---

## 3. Phương án B — Viết EULA riêng cho FotoBro

### 3.1. Cơ chế: tự viết, tự chịu trách nhiệm, Apple kiểm tra tối thiểu

- Nhà phát triển soạn văn bản EULA riêng, rồi dán vào App Store Connect:
  App → General → App Information → License Agreement → Edit → chọn
  **"Apply custom EULA to all chosen countries and regions"** → dán toàn
  bộ văn bản vào ô Custom License Agreement → chọn quốc gia/vùng áp dụng
  → Done → Save.
- EULA riêng **thay thế hoàn toàn** EULA chuẩn của Apple đối với các quốc
  gia/vùng đã chọn (có thể áp dụng khác nhau theo từng nước, nhưng v1
  không cần phức tạp tới vậy).
- Apple **không duyệt nội dung** EULA riêng như duyệt app, nhưng EULA riêng
  **bắt buộc phải chứa đủ 10 điều khoản tối thiểu** của Apple (§3.2). Thiếu
  một trong 10 điều khoản đó thì EULA riêng không đạt yêu cầu và có nguy cơ
  bị trả về khi duyệt.

### 3.2. 10 điều khoản tối thiểu Apple bắt buộc (Minimum Terms)

Theo tài liệu "Instructions for Minimum Terms of Developer's End-User License
Agreement" của Apple (kèm theo Apple Developer Program License Agreement,
Schedule 1). **Mọi EULA riêng đều phải có đủ 10 mục sau** — thứ tự trình bày
trong văn bản thì tùy, nhưng nội dung thì không được thiếu:

| # | Điều khoản bắt buộc | Nội dung phải có |
|---|---|---|
| 1 | **Acknowledgement (Xác nhận)** | Thỏa thuận này chỉ giữa **nhà phát triển và người dùng**, không phải với Apple; nhà phát triển (không phải Apple) chịu trách nhiệm duy nhất về app và nội dung của app. |
| 2 | **Scope of License (Phạm vi giấy phép)** | Giấy phép **giới hạn, có thể thu hồi, không được chuyển nhượng**, chỉ dùng trên thiết bị Apple mà người dùng sở hữu hoặc kiểm soát, và chỉ theo đúng Quy tắc sử dụng của App Store. |
| 3 | **Maintenance and Support (Bảo trì và hỗ trợ)** | Apple **không có nghĩa vụ** bảo trì hay hỗ trợ app; ghi rõ nhà phát triển có hỗ trợ hay không, và hỗ trợ qua kênh nào (ví dụ: `support@fotobro.app` — khi đã có hộp thư thật). |
| 4 | **Warranty (Bảo hành)** | Nếu nhà phát triển đưa ra bất kỳ bảo hành nào thì **nhà phát triển tự chịu**, không phải Apple. Kể cả khi từ chối mọi bảo hành, vẫn phải ghi rõ Apple không chịu trách nhiệm bảo hành. |
| 5 | **Product Claims (Khiếu nại về sản phẩm)** | Apple không chịu trách nhiệm với bất kỳ khiếu nại nào liên quan tới app hay việc người dùng sở hữu/sử dụng app — gồm khiếu nại trách nhiệm sản phẩm, khiếu nại app không tuân thủ quy định pháp luật, và khiếu nại theo luật bảo vệ người tiêu dùng / quyền riêng tư. |
| 6 | **Intellectual Property Rights (Quyền sở hữu trí tuệ)** | Nếu có khiếu nại rằng app xâm phạm quyền sở hữu trí tuệ của bên thứ ba thì **nhà phát triển (không phải Apple)** chịu trách nhiệm điều tra, bào chữa, dàn xếp và giải quyết khiếu nại đó. |
| 7 | **Legal Compliance (Tuân thủ pháp luật)** | Người dùng cam đoan không ở nước bị chính phủ Mỹ cấm vận hay coi là hỗ trợ khủng bố, và không nằm trong danh sách cấm / hạn chế của chính phủ Mỹ. |
| 8 | **Developer Name and Address (Tên và địa chỉ nhà phát triển)** | Ghi **tên, địa chỉ và thông tin liên hệ** (email hoặc điện thoại) của nhà phát triển để người dùng gửi câu hỏi, khiếu nại. — *Hiện FotoBro chưa chốt tên chủ sở hữu và email hỗ trợ (§1.3), nên mục này chưa viết được.* |
| 9 | **Third Party Terms of Agreement (Điều khoản của bên thứ ba)** | Người dùng phải tuân thủ các điều khoản của bên thứ ba khi dùng app cùng các dịch vụ khác (với FotoBro: điều khoản của Google khi dùng Lịch/Gmail/Drive, điều khoản của Apple về iCloud/CloudKit khi bật đồng bộ). |
| 10 | **Third Party Beneficiary (Bên thứ ba hưởng lợi)** | Apple và các công ty con của Apple là **bên thứ ba hưởng lợi** của EULA và có quyền thi hành các điều khoản của EULA đối với người dùng. |

### 3.3. Nội dung tối thiểu EULA riêng của FotoBro cần có (ngoài 10 mục bắt buộc trên)

Đây là phần "ruột" riêng của FotoBro — những điều EULA chuẩn của Apple
không có, và là lý do chính để viết EULA riêng khi tới lúc. Nội dung dưới
đây là **dàn ý, chưa phải văn bản pháp lý hoàn chỉnh**; khi viết thật cần
luật sư rà lại, và cần bản tiếng Việt + bản tiếng Anh (khớp ngôn ngữ VI/EN
của app).

**a) Giấy phép sử dụng (License Grant)**
- Cấp cho người dùng giấy phép cá nhân, giới hạn, không độc quyền, không
  được chuyển nhượng, chỉ để dùng FotoBro cho công việc studio ảnh của
  chính mình, trên thiết bị iOS của mình.
- Ghi rõ: mua/tải app miễn phí ở v1 không có nghĩa là sở hữu app; FotoBro
  vẫn thuộc về nhà phát triển.
- Ghi rõ phạm vi dùng: quản lý job, thu chi, nhắc lịch, mẫu tin nhắn —
  đúng tính năng v1 đã có; tính năng Nấc 2/3 chỉ dùng khi đã đăng ký và
  trả phí (khi có).

**b) Những điều không được làm (Restrictions — không được sao chép / bán lại)**
- Không được sao chép, phân phối lại, bán lại, cho thuê, cho mượn app
  hay tài khoản; không được trích xuất mã nguồn, dịch ngược, tháo gỡ app.
- Không được dùng app cho mục đích vi phạm pháp luật, hay để lưu trữ /
  phát tán nội dung vi phạm pháp luật.
- Không được giả mạo FotoBro, không được dùng tên/logo FotoBro để kinh
  doanh dịch vụ khác khi chưa được phép.
- (Nấc 3, khi có) Không được chia sẻ tài khoản workspace / mã mời cho
  người ngoài studio; mỗi thành viên dùng đúng vai trò được giao.

**c) Dữ liệu và quyền riêng tư (liên kết với Privacy Policy)**
- Nhắc lại ngắn gọn mô hình local-first của v1: dữ liệu chỉ ở trên máy
  người dùng; khi bật CloudKit (Nấc 2) thì dữ liệu đồng bộ qua iCloud
  của Apple theo lựa chọn của người dùng.
- Dẫn link tới Privacy Policy đầy đủ (`PRIVACY.html`) thay vì viết lại
  toàn bộ chính sách trong EULA.

**d) Giới hạn trách nhiệm (Limitation of Liability)**
- App được cung cấp "nguyên trạng"; nhà phát triển không bảo đảm app
  không lỗi, không gián đoạn, hay số liệu tính toán (báo cáo thu chi,
  nhắc lịch) luôn chính xác tuyệt đối.
- Giới hạn trách nhiệm bồi thường ở mức **cần chốt con số cụ thể**
  (ví dụ: tổng số tiền người dùng đã trả cho FotoBro trong 12 tháng gần
  nhất — ở v1 là 0đ vì miễn phí; hoặc một mức trần cố định). **Không nên
  tự ghi một con số mà chưa hỏi luật sư**, vì mức trần quá thấp có thể
  vô hiệu theo luật bảo vệ người tiêu dùng ở một số nước.
- Loại trừ trách nhiệm với thiệt hại gián tiếp (mất job, mất khách, mất
  dữ liệu do người dùng không sao lưu) — nhưng phải ghi đúng giới hạn
  luật cho phép, vì không phải nước nào cũng cho phép loại trừ hết.

**e) Chấm dứt (Termination)**
- Giấy phép tự động chấm dứt nếu người dùng vi phạm EULA; khi đó phải
  ngừng dùng app và xoá app khỏi thiết bị.
- Nhà phát triển có quyền chấm dứt / tạm ngưng quyền dùng app khi phát
  hiện vi phạm (gian lận thanh toán, lạm dụng tính năng nhóm ở Nấc 3).
- Chấm dứt giấy phép **không xoá dữ liệu local** của người dùng (dữ liệu
  vẫn ở trên máy họ; họ tự xoá trong Cài đặt hoặc gỡ app) — điểm này cần
  ghi rõ để không mâu thuẫn với Privacy Policy mục 6.
- (Nấc 2/3, khi có) Hết hạn thuê bao thì app quay về Nấc 1: dữ liệu local
  còn nguyên, chỉ tắt đồng bộ/nhóm — **không khoá dữ liệu cũ**
  (đã chốt trong `CLOUDKIT-PLAN.md` §6 và `PRICING-DRAFT.md` §0).

**f) Gói trả phí và hoàn tiền — chỉ khi có Nấc 2/3 (chưa viết ở v1)**
- Gói nào, giá nào, chu kỳ nào, tự gia hạn ra sao, huỷ thế nào; giá và
  chu kỳ hiện đều là `TBD` nên **không thể viết mục này ở v1**.
- Hoàn tiền qua Apple (App Store) theo chính sách của Apple, không hoàn
  trực tiếp từ FotoBro; dùng thử (nếu có) và điều kiện huỷ trước khi
  bị tính tiền.
- Mục này phải khớp 100% với mô tả trong App Store và với màn hình mua
  trong app (Guideline 3.1.2) — viết sai là bị Apple trả về.

**g) Luật áp dụng và giải quyết tranh chấp (cần Việt + luật sư chốt)**
- Chọn luật áp dụng (luật Việt Nam hay luật California như EULA chuẩn)
  và nơi giải quyết tranh chấp. Vì người dùng chính là nhiếp ảnh gia ở
  Việt Nam, luật Việt Nam là phương án đáng cân nhắc — nhưng cần luật sư
  xác nhận tính khả thi khi phân phối qua App Store toàn cầu.
- Ghi rõ ngôn ngữ nào có hiệu lực khi bản tiếng Việt và bản tiếng Anh
  khác nhau (khuyến nghị: bản tiếng Việt là chính đối với người dùng
  Việt Nam, hoặc ghi rõ một bản làm chuẩn).

### 3.4. Ưu điểm (của EULA riêng)

1. **Viết đúng mô hình FotoBro**: nhắc được local-first, CloudKit, gói
   trả phí, workspace/nhóm, vai trò thành viên — những thứ EULA chuẩn
   không bao giờ nhắc tới.
2. **Tự đặt giới hạn trách nhiệm của chính mình** (mức trần bồi thường,
   loại trừ thiệt hại gián tiếp), thay vì trông chờ vào con số 50 USD
   của Apple mà thực chất giới hạn trách nhiệm của Apple (§2.4 mục 2).
3. **Tự chọn luật áp dụng** (ví dụ: luật Việt Nam) thay vì mặc định luật
   California.
4. **Bảo vệ thương hiệu và nội dung riêng**: cấm sao chép/bán lại, cấm
   dùng tên/logo FotoBro, cấm lạm dụng tính năng nhóm — EULA chuẩn chỉ
   cấm chung chung ở mức "đừng làm vậy với app".
5. **Đáp ứng Guideline 3.1.2 khi có thuê bao**: app có gói trả phí thì
   Apple yêu cầu phải có link "Terms of Use (EULA)" — EULA riêng (kèm
   Terms of Service) là cách đáp ứng gọn nhất.

### 3.5. Nhược điểm / chi phí (của EULA riêng)

1. **Tốn công và tốn tiền.** Cần người viết có hiểu biết pháp lý, tốt nhất
   là luật sư — đặc biệt cho mục giới hạn trách nhiệm và luật áp dụng.
   Viết sai còn tệ hơn không viết: điều khoản vô hiệu, mâu thuẫn với
   Privacy Policy, hay mâu thuẫn với chính sách của Apple đều có thể bị
   trả về hoặc gây tranh chấp.
2. **Phải có đủ 10 điều khoản tối thiểu của Apple (§3.2)** — thiếu một mục
   là không đạt. Trong đó mục 8 (tên + địa chỉ + liên hệ nhà phát triển)
   hiện **chưa viết được** vì tên chủ sở hữu và email hỗ trợ chưa chốt.
3. **Phải duy trì 2 ngôn ngữ** (tiếng Việt + tiếng Anh) và giữ hai bản
   đồng bộ mỗi lần sửa — app đã chốt hỗ trợ VI/EN, EULA riêng cũng nên
   vậy.
4. **Phải cập nhật mỗi khi mô hình đổi**: thêm Nấc 2, thêm Nấc 3, đổi giá,
   đổi chu kỳ thuê bao, thêm tính năng nhóm — mỗi lần đổi là một lần sửa
   EULA + sửa Terms of Service + sửa mô tả App Store cho khớp.
5. **Rủi ro mâu thuẫn nội bộ**: EULA riêng, Terms of Service (chưa có)
   và Privacy Policy (đã có) phải nói cùng một câu chuyện về dữ liệu,
   sao lưu, xoá dữ liệu, hết hạn thuê bao. Viết EULA riêng khi Terms of
   Service còn chưa có là làm ngược thứ tự.

---

## 4. So sánh nhanh hai phương án

| Tiêu chí | A. EULA chuẩn Apple | B. EULA riêng |
|---|---|---|
| Công sức ở v1 | Không làm gì | Cần soạn + rà pháp lý + dịch VI/EN |
| Chi phí | 0 | Luật sư / thời gian rà soát |
| Rủi ro bị Apple trả về vì EULA | Gần như 0 | Có, nếu thiếu 1 trong 10 mục bắt buộc |
| Bảo vệ riêng cho FotoBro (job, ảnh khách, bảng giá, CloudKit, nhóm) | Không có | Có, viết theo ý mình |
| Giới hạn trách nhiệm của chính FotoBro | Không đặt được (50 USD là của Apple) | Tự đặt mức trần (cần luật sư chốt số) |
| Luật áp dụng | California (trừ EU/EEA) | Tự chọn (ví dụ: luật Việt Nam) |
| Gói trả phí / thuê bao (Nấc 2/3) | Không đủ — phải bổ sung Terms khi có thuê bao | Viết được đầy đủ trong EULA + Terms |
| Tính năng nhóm / vai trò (Nấc 3) | Không có | Viết được |
| Cần tên + địa chỉ + email nhà phát triển | Không | Bắt buộc (mục 8) — hiện chưa chốt |
| Đổi phương án sau này | Dễ: dán EULA riêng vào App Store Connect khi cần | Dễ: quay về EULA chuẩn bằng cách gỡ EULA riêng |

---

## 5. Khuyến nghị cho v1

### 5.1. Khuyến nghị: dùng EULA chuẩn của Apple cho v1

**Lý do, gắn với đúng mô hình v1 đã chốt:**

1. **App v1 không có gì mà EULA chuẩn không bao quát được.** Miễn phí,
   không tài khoản, không máy chủ, không thu tiền, không chia sẻ dữ liệu,
   không nội dung người dùng đăng cho nhau — mọi tình huống pháp lý "nặng"
   (tranh chấp thuê bao, lạm dụng nhóm, rò rỉ dữ liệu máy chủ) đều chưa
   tồn tại.
2. **Thông tin để viết EULA riêng còn thiếu.** Tên chủ sở hữu (Copyright)
   và email hỗ trợ đều chưa chốt; viết EULA riêng bây giờ đồng nghĩa với
   việc phải chốt vội hai thứ đó, hoặc viết EULA với chỗ trống — cả hai
   đều không nên.
3. **Terms of Service chưa có.** EULA riêng và Terms of Service nên viết
   cùng nhau để khỏi mâu thuẫn. Viết EULA riêng trước khi có Terms là làm
   ngược thứ tự (§3.5 mục 5).
4. **Không làm chậm lịch nộp App Store.** EULA chuẩn = 0 việc phải làm;
   EULA riêng = thêm một vòng soạn + rà + dịch trước khi submit, trong khi
   lịch v1 còn nhiều việc khác đang chờ (Client ID Google, host Privacy
   Policy URL, screenshots, TestFlight — xem `APP-STORE-READY.md` §11–§13).
5. **Đổi được sau, không mất gì.** Chuyển sang EULA riêng ở Nấc 2/3 chỉ
   là việc dán văn bản mới vào App Store Connect; người dùng cũ không cần
   làm gì thêm.

### 5.2. Những gì KHÔNG nên làm ở v1

- **Không viết EULA riêng vội** chỉ vì "cho chuyên nghiệp". EULA riêng
  viết ẩu (thiếu mục bắt buộc, mức trần trách nhiệm tự bịa, luật áp dụng
  chọn bừa) tệ hơn dùng EULA chuẩn.
- **Không copy EULA mẫu trên mạng rồi dán.** EULA mẫu thường thiếu 1–2
  trong 10 mục bắt buộc của Apple, hoặc ghi tên công ty / luật áp dụng
  không đúng với FotoBro.
- **Không nhầm EULA với Privacy Policy.** Privacy Policy đã có và phải
  host để lấy URL; EULA là văn bản khác, không cần URL riêng khi dùng
  EULA chuẩn.

### 5.3. Khi nào thì bắt buộc / nên chuyển sang EULA riêng

Chuyển sang EULA riêng khi **bất kỳ** điều nào sau đây xảy ra (không cần
đủ tất cả):

| Dấu hiệu | Vì sao lúc đó EULA chuẩn không đủ |
|---|---|
| **Bật thu phí Nấc 2/3 (IAP / thuê bao)** — giá + chu kỳ đã chốt | Cần điều khoản gói, tự gia hạn, huỷ, hoàn tiền qua Apple; Guideline 3.1.2 yêu cầu link Terms of Use (EULA) rõ ràng |
| **Bật CloudKit đồng bộ / sao lưu mã hoá** | Cần điều khoản về dữ liệu trên iCloud, mất mật khẩu sao lưu thì mất bản sao lưu, trách nhiệm khi đồng bộ lỗi |
| **Bật Nấc 3 nhóm/studio** (workspace, vai trò, mã mời) | Cần điều khoản về tài khoản nhóm, quyền của từng vai trò, ai chịu trách nhiệm khi thành viên lạm dụng, chấm dứt thành viên |
| **Có tranh chấp / khiếu nại đầu tiên** về dữ liệu, tiền bạc hay bản quyền | Lúc đó mới biết điều khoản nào của EULA chuẩn là thiếu — viết EULA riêng theo đúng vấn đề thực tế gặp phải |
| **Việt chốt xong tên chủ sở hữu + email hỗ trợ + luật áp dụng** | Khi đã có đủ thông tin mục 8 (§3.2) và đã có Terms of Service, viết EULA riêng mới không còn chỗ trống |

**Thứ tự làm khi tới lúc đó:** (1) Việt chốt giá/chu kỳ Nấc 2/3 + tên chủ sở
hữu + email hỗ trợ + luật áp dụng → (2) viết `TERMS-DRAFT.md` (Điều khoản
sử dụng: gói, thuê bao, nhóm) → (3) viết EULA riêng theo dàn ý §3.3, đủ 10
mục bắt buộc §3.2, bản VI + EN → (4) luật sư rà một lượt → (5) dán vào App
Store Connect (License Agreement → Custom EULA) trước khi submit bản có
Nấc 2/3.

---

## 6. Những gì còn chờ Việt chốt

| # | Việc cần Việt | Vì sao chưa làm được / ghi chú |
|---|---|---|
| 1 | **Chốt phương án EULA cho v1: chuẩn Apple hay riêng** (khuyến nghị: chuẩn Apple — §5.1) | Quyết định này đổi việc phải làm trước khi submit: chuẩn Apple = 0 việc; riêng = phải viết + rà + dịch trước submit |
| 2 | Chốt **tên chủ sở hữu** để ghi Copyright (`© 2026 FotoBro` — `APP-STORE-READY.md` §3) | Cần cho EULA riêng (mục 8, §3.2) và cho App Store Connect; chưa chốt thì không viết được EULA riêng |
| 3 | Chốt **email hỗ trợ** (`support@fotobro.app` đang thiết lập) và mua domain `fotobro.app` (hoặc dự phòng) | Cần cho EULA riêng (mục 8) và cho Support URL; xem `APP-STORE-READY.md` §7 |
| 4 | Chốt **giá + chu kỳ Nấc 2/3** (hiện `TBD`) | Chưa chốt thì không viết được mục gói trả phí trong EULA riêng / Terms of Service (§3.3 f) |
| 5 | Chốt **luật áp dụng** nếu làm EULA riêng (luật Việt Nam hay giữ luật California như EULA chuẩn) | Cần luật sư xác nhận; không tự chọn bừa |
| 6 | Duyệt **thứ tự làm**: viết `TERMS-DRAFT.md` trước, rồi mới viết EULA riêng khi tới Nấc 2/3 (§5.3) | Tránh làm ngược thứ tự rồi phải sửa lại cả hai văn bản |

---

## 7. Checklist hành động (theo phương án được chốt)

### Nếu Việt chốt phương án A — EULA chuẩn Apple (khuyến nghị)

- [ ] Trong App Store Connect, để App Information → License Agreement ở
      mặc định (Standard EULA) — không chọn Custom EULA.
- [ ] Không viết thêm file EULA nào; không cần URL cho EULA.
- [ ] Ghi chú vào `APP-STORE-READY.md` (hoặc checklist submit) dòng:
      "EULA: dùng Apple Standard EULA — không có Custom EULA ở v1."
- [ ] Khi bắt đầu làm Nấc 2/3: quay lại file này, làm theo §5.3.

### Nếu Việt chốt phương án B — EULA riêng (làm sau, không làm ở v1)

- [ ] Chốt xong mục 2–5 ở §6 (tên chủ sở hữu, email hỗ trợ, giá/chu kỳ,
      luật áp dụng).
- [ ] Viết `TERMS-DRAFT.md` trước (Điều khoản sử dụng), rồi mới viết
      EULA riêng theo dàn ý §3.3.
- [ ] Kiểm đủ 10 mục bắt buộc §3.2, đối chiếu với văn bản "Instructions
      for Minimum Terms" hiện hành của Apple trước khi dán.
- [ ] Luật sư rà một lượt (đặc biệt mục giới hạn trách nhiệm và luật áp dụng).
- [ ] Dịch sang tiếng Anh, giữ hai bản đồng bộ.
- [ ] Dán vào App Store Connect → App Information → License Agreement →
      Custom EULA, chọn quốc gia/vùng áp dụng, Save — trước khi submit
      bản có Nấc 2/3.

---

## Nguồn tham khảo

- Apple — Licensed Application End User License Agreement (Standard EULA):
  `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
- Apple — Instructions for Minimum Terms of Developer's End-User License
  Agreement (kèm theo Apple Developer Program License Agreement, Schedule 1)
  — 10 điều khoản bắt buộc đối với EULA riêng (§3.2).
- Apple — App Store Review Guidelines 3.1.2 (thuê bao: công bố giá, tự gia
  hạn, huỷ; link Terms of Use (EULA)).
- Trong gói FotoBro: `APP-STORE-READY.md` (§3 Copyright, §4 giá/IAP, §7
  Support/Privacy URL, §11–§13 checklist và việc chờ Việt),
  `PRIVACY.md` / `PRIVACY.html` (20/11/2026), `README.md` (tính năng v1),
  `CLOUDKIT-PLAN.md` (§0, §6 — Nấc 2/3, hết hạn quay về Nấc 1),
  `PRICING-DRAFT.md` (§0–§1 — giá/chu kỳ `TBD`, IAP qua StoreKit).

> **Tuyên bố miễn trừ:** File này là ghi chú nội bộ dựa trên tài liệu công
> khai của Apple và các file trong gói FotoBro, viết ngày 20/11/2026. Nội
> dung có thể lỗi thời nếu Apple đổi điều khoản — **trước khi submit, đối
> chiếu lại văn bản EULA chuẩn và "Instructions for Minimum Terms" hiện
> hành trên trang pháp lý của Apple**. File này không phải tư vấn pháp lý
> và không tạo quan hệ luật sư — khách hàng; các quyết định về giới hạn
> trách nhiệm, luật áp dụng và điều khoản thuê bao nên có luật sư rà soát.
