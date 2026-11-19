# FotoBro iOS v1 — Độ tuổi App Store (Age Rating)

> **Ngày phân tích:** 20/11/2026 · **App:** FotoBro iOS v1 · **Bundle ID:** `com.fotobro.app`
> · **Phiên bản:** 1.0 (build 1) · **Phạm vi:** chỉ bản v1 local-first, chưa bật IAP, chưa bật CloudKit
> · **Trạng thái:** bản phân tích để Việt duyệt trước khi nhập vào App Store Connect.
> Không nộp app, không tạo tài khoản, không push GitHub trong file này.
>
> **Nguồn đã đọc thật (20/11/2026):** `www/index.html` (341.754 byte),
> `APP-STORE-READY.md`, `APP-STORE-LISTING.md` (§5–§6), `PRIVACY.html`,
> `PRIVACY.md` (§5–§6), `ios/App/App/Info.plist` (quyền), `capacitor.config.ts`,
> `package.json`. Kết luận dưới đây chỉ đúng với những gì các file này thể hiện;
> nếu build gửi đi thêm tính năng mới thì phải rà lại (§6).

---

## 1. Kết luận — chọn 4+

| Mục | Kết luận |
|---|---|
| **Age Rating nên khai** | **4+** |
| **Cách khai** | Trả lời **"Không / None" cho mọi mục** trong questionnaire của Apple (bảng §3). **Không gõ tay "4+"** — Apple tự tính rating từ câu trả lời; kiểm tra rating Apple tính ra hiện đúng **4+** trước khi bấm Submit for Review. |
| **Vì sao không phải 12+** | Không có yếu tố nào trong app chạm ngưỡng 12+ (xem §4). Các liên kết mở trình duyệt/email bên ngoài **không** đẩy rating lên 12+ hay 17+ — xem phân tích chi tiết ở §3, mục "Truy cập web không giới hạn", và §4. |
| **Vì sao không phải 17+** | Không có trình duyệt web nhúng trong app, không nội dung người lớn, không chat với người lạ, không cờ bạc. |
| **Khớp với hồ sơ cũ** | Khớp `APP-STORE-LISTING.md` §5 và `APP-STORE-READY.md` §3 (cả hai đều đã ghi 4+). File này là bản phân tích căn cứ đầy đủ đằng sau con số đó — không đổi kết luận cũ. |

**Lưu ý quan trọng về ý nghĩa của 4+:** 4+ là mức **nội dung** (không có nội dung
nhạy cảm), **không phải đối tượng sử dụng**. App vẫn là công cụ cho nhiếp ảnh gia
trưởng thành; `PRIVACY.html` §6 / `PRIVACY.md` §5 ghi "app dành cho người lớn
(chủ studio), không hướng tới trẻ em dưới 13 tuổi, không cố ý thu thập dữ liệu
trẻ em" — điều này **không mâu thuẫn** với 4+. 4+ không có nghĩa là "app làm cho
trẻ em", mà chỉ có nghĩa là "không có gì trong app mà trẻ 4 tuổi trở lên không
được xem". Một app văn phòng / quản lý công việc không có nội dung nhạy cảm thì
luôn là 4+, dù người dùng thực tế toàn là người lớn.

---

## 2. Căn cứ từ app thật — app này thực sự chứa gì

Đọc từ `www/index.html`, `PRIVACY.html` và `Info.plist` (không suy đoán):

| Hạng mục | Thực tế trong file |
|---|---|
| **App là gì** | Công cụ quản lý công việc cho photographer tự do: pipeline job 8 bước (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong), sổ thu/chi, báo cáo ngày/tuần/tháng, nhắc lịch, mẫu tin nhắn, máy tính giá. Local-first, không tài khoản, không máy chủ riêng. |
| **Nội dung hiển thị** | Tên khách, loại chụp (portrait / couple / wedding / lookbook / event), ngày giờ, địa điểm, số tiền, mẫu tin nhắn công việc bằng tiếng Việt lịch sự. Không ảnh, không video, không chữ, không nội dung nào mang tính người lớn / bạo lực / cờ bạc. |
| **Chat / mạng xã hội** | **Không có.** Màn "Hỏi đáp" trong app (`#view-ask`, `chatBox`) là trợ lý hỏi–đáp trên dữ liệu job có sẵn trên máy — không nhắn cho người thật, không có người lạ, không chia sẻ dữ liệu giữa các người dùng. Không feed, không bình luận, không kết bạn. |
| **Mua hàng trong app** | **Không có ở v1.** Grep toàn bộ `www/index.html`, `www/fotobro-config.js`, `capacitor.config.ts`, `package.json`: **0 kết quả** StoreKit / IAP / `SKPayment`. `APP-STORE-READY.md` §4: Price = Free, không tạo IAP nào. Nấc 2 (CloudKit) / Nấc 3 (nhóm/studio) có thu phí theo quyết định 23:43 19/11 nhưng ở v1 **chỉ là placeholder**, chưa bật IAP thật, chưa chốt giá. |
| **Quảng cáo** | **Không có.** Không SDK quảng cáo, không tracking, không analytics (`PRIVACY.html`). |
| **Thu thập dữ liệu** | **Không thu thập** (khai App Privacy "Data Not Collected"): job/tiền/cài đặt chỉ ở trên máy. Google (Lịch/Gmail/Danh bạ/Drive) mặc định TẮT, chỉ đọc trên máy khi người dùng tự bật và đăng nhập; v1 cố tình **không lưu refresh token**. Không GPS (`PRIVACY.html` §1). |
| **Giọng nói** | **Mic chưa có ở v1** (dời sang v1.1). V1 chỉ gõ tay; app không ghi âm, không lưu file ghi âm (`PRIVACY.html` §3–§4). |
| **Liên kết mở ra ngoài** | Có — nhưng **toàn bộ đều mở bằng trình duyệt hệ thống / app ngoài, không mở trong app** (xem §3, mục web). Gồm: link Instagram cá nhân của người dùng, nút Messenger (`m.me/`), Facebook khách, Zalo (`zalo.me/` + số điện thoại), link "Thêm vào Google Lịch" (`calendar.google.com`), link Drive do người dùng tự dán, và `mailto:` soạn email cho khách. Google OAuth mở bằng trình duyệt hệ thống (PKCE). |
| **Trình duyệt trong app** | **Không có.** Content-Security-Policy trong `www/index.html` dòng 8: `default-src 'self'`, **`frame-src 'none'`**, `object-src 'none'`, `form-action 'none'` — app không nhúng được trang web nào, không cho duyệt web trong app. |
| **Quyền đã khai** | `Info.plist`: Camera, Photo Library (+ Add), Calendars (full + write-only + legacy), Face ID (theo `APP-STORE-READY.md` §10; micro/speech chỉ khai nếu mic kịp v1 — hiện mic dời v1.1 nên bỏ). Không quyền nào liên quan nội dung nhạy cảm. |

---

## 3. Phân tích từng mục questionnaire của Apple

Bảng này đi theo đúng các mục Apple hỏi trong App Store Connect khi khai Age
Rating. Cột "Trả lời" là đáp án phải chọn; cột "Căn cứ" dẫn về file thật.

| # | Mục Apple hỏi | Trả lời | Căn cứ trong app FotoBro v1 | Ảnh hưởng nếu trả lời khác |
|---|---|---|---|---|
| 1 | Cartoon or Fantasy Violence (bạo lực hoạt hình / giả tưởng) | **None** | Không có hình ảnh, game, nhân vật hay nội dung bạo lực nào. App chỉ có chữ + số + ảnh trang chủ do người dùng tự chọn. | Infrequent/Mild → 9+; Frequent/Intense → 12+ |
| 2 | Realistic Violence (bạo lực thực tế) | **None** | Không có. Không video, không tin tức, không nội dung mô tả bạo lực. | Infrequent/Mild → 12+; Frequent/Intense → 17+ |
| 3 | Sexual Content or Nudity (nội dung tình dục / khoả thân) | **None** | Không có. App quản lý job chụp portrait/couple/wedding/lookbook/event bằng **chữ và số** (tên khách, giá, ngày giờ) — app không chứa, không hiển thị, không gợi ý ảnh hay nội dung khoả thân / gợi dục. Ảnh trang chủ và logo là ảnh do chính người dùng chọn từ máy mình, chỉ hiện trên máy mình, không chia sẻ cho ai. | Bất kỳ mức nào trên None → tối thiểu 12+, thường 17+ |
| 4 | Profanity or Crude Humor (ngôn từ tục tĩu / thô tục) | **None** | Không có. Mẫu tin nhắn trong app là câu chào hỏi, báo giá, nhắc lịch bằng tiếng Việt lịch sự (vd. "Chào {ten}! Cảm ơn bạn đã ghé studio mình nè…"). Không có từ tục, không có nội dung hài thô tục. | Infrequent/Mild → 12+; Frequent/Intense → 17+ |
| 5 | Alcohol, Tobacco, or Drug Use or References (rượu / thuốc lá / ma tuý) | **None** | Không nhắc tới, không hình ảnh, không nội dung nào liên quan. | Infrequent/Mild → 12+; Frequent/Intense → 17+ |
| 6 | Mature / Suggestive Themes (chủ đề người lớn / gợi ý) | **None** | Không có. Không hẹn hò, không nội dung gợi ý, không chủ đề người lớn. Job wedding/couple là công việc chụp ảnh cưới / cặp đôi bình thường, không kèm nội dung gợi ý. | Infrequent/Mild → 12+; Frequent/Intense → 17+ |
| 7 | Horror / Fear Themes (kinh dị / sợ hãi) | **None** | Không có. | Infrequent/Mild → 9+; Frequent/Intense → 12+ |
| 8 | Gambling (cờ bạc — thật hay mô phỏng) | **None** | Không có game, không cá cược, không quay số, không vật phẩm may rủi. Sổ tiền chỉ ghi thu/chi thật của studio. | Sim mô phỏng → 12+; cờ bạc thật → 17+ |
| 9 | Contests (cuộc thi / trúng thưởng) | **None** | Không có cuộc thi, bốc thăm hay phần thưởng nào trong app. | Có → thường 12+ (tuỳ hình thức) |
| 10 | Medical / Treatment Information (thông tin y tế / điều trị) | **None** | Không có. App không đưa lời khuyên y tế, không tính liều, không chẩn đoán. (Mục này Apple hỏi ở một số khu vực; FotoBro không liên quan.) | Có → xem xét riêng theo khu vực, không áp cho app này |
| 11 | **Unrestricted Web Access (truy cập web không giới hạn)** | **No** | **Đây là mục dễ khai sai nhất — xem phân tích riêng ngay dưới bảng.** App không có trình duyệt nhúng; mọi link đều mở ra trình duyệt hệ thống / app ngoài. | **Yes → 17+ ngay lập tức**, bất kể các mục khác |
| 12 | User-generated content / giao tiếp giữa người dùng | **Không có** | Không có nội dung do người dùng tạo rồi chia sẻ cho người khác, không chat, không bình luận, không kết bạn, không feed. Dữ liệu mỗi người chỉ ở trên máy mình. | Có UGC / chat không kiểm duyệt → 12+ hoặc 17+ (xem §6) |
| 13 | In-App Purchases (mua hàng trong app) | **Không có ở v1** | Không StoreKit, không sản phẩm IAP nào được tạo (xem §2). Lưu ý: **bản thân IAP không làm tăng age rating** — Apple không cộng rating vì có IAP; IAP chỉ liên quan khi nội dung mua thêm chứa nội dung nhạy cảm (không phải trường hợp này). | Không đổi rating; chỉ cần khai đúng khi bật IAP thật (xem §6) |
| 14 | Quảng cáo | **Không có** | Không quảng cáo, không SDK quảng cáo. | Quảng cáo không tự nó đổi rating, nhưng quảng cáo có nội dung người lớn thì bị tính — không áp cho app này |
| 15 | Thu thập dữ liệu / vị trí | **Không thu thập** | "Data Not Collected"; không GPS; Google chỉ đọc trên máy khi người dùng tự bật. Thu thập dữ liệu **không phải** một mục trong questionnaire độ tuổi — nó thuộc App Privacy, không cộng rating. (Riêng trẻ em: xem §5.) | Không đổi rating |

### Phân tích riêng mục 11 — "Unrestricted Web Access" (quyết định 4+ hay 17+)

Apple định nghĩa mục này là: **app có cho người dùng duyệt web tự do, không
giới hạn, ngay trong app hay không** — điển hình là app có trình duyệt web
nhúng (webview) cho gõ URL tuỳ ý. Trả lời **Yes** thì rating thành **17+** ngay,
không có mức trung gian 12+.

FotoBro v1 trả lời **No**, với 3 căn cứ độc lập, cái nào cũng đủ:

1. **Không có trình duyệt trong app.** CSP trong `www/index.html` khoá
   `frame-src 'none'` — app không nhúng được bất kỳ trang web nào. Không có ô
   địa chỉ, không có webview duyệt web. Người dùng không thể "lên mạng" từ
   trong app.
2. **Mọi link đều mở ra ngoài, bằng trình duyệt hệ thống / app ngoài.**
   Instagram (`instagram.com/{tài khoản}`), Messenger (`m.me/`), Facebook,
   Zalo (`zalo.me/`), Google Lịch (`calendar.google.com/...`), Drive và
   `mailto:` đều mở bằng `window.open(..., '_blank')` / link `target="_blank"` /
   deep link — tức là mở Safari hoặc app tương ứng của hệ thống, **không phải
   nội dung trong app**. Apple không tính link mở ra Safari là "unrestricted
   web access" — nếu không thì mọi app có một link "Xem thêm trên web" đều
   thành 17+, điều Apple không làm. `APP-STORE-LISTING.md` §5 đã ghi đúng
   điểm này.
3. **Các link đều có đích xác định, do người dùng chủ động bấm.**
   - Link cố định: Instagram của chính người dùng, `m.me/`, `facebook.com/`,
     `zalo.me/`, `calendar.google.com` (mẫu tạo sự kiện), Google OAuth (mở
     trình duyệt hệ thống để đăng nhập, rồi quay lại app).
   - Link do người dùng tự nhập: ô Facebook / Messenger / Drive trong chi
     tiết job — người dùng tự dán link liên hệ của **khách của mình**, rồi tự
     bấm để mở. Đây là dữ liệu liên hệ cá nhân của người dùng, tương đương
     bấm một link trong Danh bạ hay Ghi chú — không phải app cung cấp kho nội
     dung web cho người dùng duyệt. Link chỉ mở khi người dùng bấm, mở ra
     Safari, và app không hiển thị nội dung của trang đó trong app.

**Kết luận mục 11: No → không cộng rating.** Đây là điểm mấu chốt giữ app ở
4+ thay vì 17+.

---

## 4. Vì sao không phải 12+

Có hai lý do người ta hay nghĩ tới 12+, cả hai đều không áp dụng:

### (a) "App có liên kết web / email mở ngoài không kiểm soát" → không lên 12+

- Questionnaire của Apple **không có mức 12+ cho liên kết ngoài**. Mức liên
  quan duy nhất là mục 11 "Unrestricted Web Access": trả lời Yes thì nhảy
  thẳng lên **17+**, không qua 12+. Mà FotoBro trả lời No (§3, mục 11).
- Các yếu tố thực sự đẩy lên 12+ là: ngôn từ tục tĩu nhẹ / không thường xuyên,
  nội dung gợi ý nhẹ, rượu/thuốc lá/ma tuý nhẹ, bạo lực thực tế nhẹ, cờ bạc mô
  phỏng, UGC/chat có kiểm duyệt — **không yếu tố nào có trong app** (§3).
- Email `mailto:` càng không liên quan: đó là mở app Mail của hệ thống để soạn
  thư cho khách của chính người dùng, không phải nội dung trong app.
- Chọn 12+ "cho chắc" khi không có yếu tố 12+ là **khai sai**: Apple tính
  rating từ câu trả lời, nên muốn ra 12+ thì phải trả lời "có" ở một mục không
  có thật — vừa sai sự thật, vừa khiến app bị ẩn với tài khoản trẻ em dưới 13
  (không cần thiết cho một app công việc) mà không tăng thêm an toàn nào.

### (b) "App dành cho người lớn / photographer chuyên nghiệp" → không lên 12+

- Age rating đo **mức độ nội dung**, không đo **độ tuổi đối tượng sử dụng**.
  Một app bảng tính, app ghi chú hay app quản lý công việc không có nội dung
  nhạy cảm thì là 4+ dù 100% người dùng là người lớn. FotoBro cũng vậy.
- Đối tượng trưởng thành chỉ liên quan tới **chính sách trẻ em / COPPA** (không
  thu thập dữ liệu trẻ em — đã ghi ở `PRIVACY.html` §6), không liên quan tới
  con số rating. Xem §5.

**Tóm lại: không có yếu tố nào trên 4+ → 4+ là đáp án đúng, không phải đáp án
"lạc quan".** Nếu một reviewer của Apple sau này cho rằng một link cụ thể nào
đó là unrestricted access thì họ sẽ nêu rõ — lúc đó mới xử lý theo đúng link
đó, chứ không tự nâng rating trước.

---

## 5. Trẻ em và dữ liệu — không mâu thuẫn với 4+

- `PRIVACY.html` §6 / `PRIVACY.md` §5: app dành cho người lớn (chủ studio),
  không hướng tới trẻ em dưới 13 tuổi, không cố ý thu thập dữ liệu trẻ em.
  Điều này đúng và **giữ nguyên** — nó là cam kết COPPA / App Store về trẻ em,
  không phải lý do để nâng rating.
- 4+ **không** bắt buộc app phải phù hợp hay hấp dẫn với trẻ em, và cũng
  **không** cho phép thu thập dữ liệu trẻ em. Hai thứ độc lập nhau.
- Không cần thêm mục "Made for Kids", không cần khai báo COPPA riêng, vì app
  không hướng tới trẻ em và không thu thập dữ liệu nào.
- Nếu sau này Nấc 3 (nhóm/studio) cho nhiều người cùng dùng một studio, vẫn
  giữ nguyên cam kết này: tài khoản nhóm là tài khoản người lớn làm việc, không
  phải tài khoản trẻ em.

---

## 6. Khi nào phải đổi rating — IAP Nấc 2/3 và tính năng nhóm

### 6.1. Bật IAP cho Nấc 2 (CloudKit đồng bộ / sao lưu, có thu phí)

- **Không đổi rating — vẫn 4+.** Bản thân IAP không nằm trong questionnaire
  độ tuổi. Nấc 2 chỉ là đồng bộ dữ liệu job/tiền của chính người dùng qua
  iCloud của họ (dữ liệu đã mã hoá, Apple không đọc được nội dung) — không
  thêm nội dung nhạy cảm nào, không thêm người dùng khác, không thêm web.
- Việc phải làm khi bật Nấc 2 (không liên quan rating, nhưng đừng quên):
  khai lại App Privacy theo hướng dẫn của Apple cho CloudKit; tạo sản phẩm IAP
  với giá + chu kỳ đã chốt; cập nhật mô tả app (mô tả v1 hiện không nhắc giá).
- Chỉ rà lại rating nếu Nấc 2 đi kèm một tính năng nội dung mới (vd. kho mẫu
  ảnh dùng chung) — lúc đó rà đúng tính năng mới đó.

### 6.2. Thêm tính năng nhóm / studio ở Nấc 3 (nhiều người dùng chung)

Đây là thay đổi **có thể đổi rating**, tuỳ thiết kế. Rà theo từng khả năng:

| Tính năng Nấc 3 | Ảnh hưởng rating | Ghi chú |
|---|---|---|
| Chia sẻ job / sổ tiền chỉ trong nhóm kín (đồng nghiệp cùng studio, do chủ studio mời, không có người lạ) | **Thường vẫn 4+**, nhưng phải rà lại mục UGC/chat | Nội dung vẫn là dữ liệu công việc (tên khách, tiền, lịch). Không có nội dung nhạy cảm thì không lên 12+. |
| Thêm chat / bình luận giữa thành viên trong nhóm | **Có thể lên 12+** | Apple xếp app có tính năng giao tiếp giữa người dùng (kể cả nhóm kín) cao hơn app đơn thuần. Nếu chat chỉ có chữ công việc và có chặn/báo cáo thì thường 12+; nếu chat mở, không kiểm duyệt, cho gửi ảnh tự do thì có thể 17+. |
| Cho người lạ tham gia nhóm / xem job của người khác / feed chung | **Lên 12+ hoặc 17+** | Đây là mạng xã hội thu nhỏ. Phải làm đủ nghĩa vụ Guideline 1.2: lọc nội dung, chặn người dùng, báo cáo vi phạm, xử lý trong 24 giờ. Không làm đủ thì Apple từ chối chứ không chỉ nâng rating. |
| Kho ảnh / mẫu dùng chung giữa các studio | **Rà lại theo nội dung** | Nếu chỉ là mẫu tin nhắn, bảng giá, template công việc → vẫn 4+. Nếu cho đăng ảnh tự do không kiểm duyệt → lên 12+ trở lên. |
| Chỉ thêm phân quyền (chủ studio / nhân viên) và báo cáo nhóm, không thêm chat hay chia sẻ công khai | **Vẫn 4+** | Không thêm nội dung nhạy cảm, không thêm giao tiếp. |

**Quy tắc chung cho Nấc 3:** trước khi submit bản có tính năng nhóm, rà lại
toàn bộ bảng §3 với đúng tính năng nhóm đó, và trả lời questionnaire theo
**build gửi đi**, không theo bản v1 này. Nếu có chat/UGC thì chuẩn bị sẵn cơ
chế kiểm duyệt (Guideline 1.2) **trước** khi submit.

### 6.3. Các thay đổi khác

| Thay đổi | Ảnh hưởng rating |
|---|---|
| Giọng nói v1.1 (mic, nhận dạng giọng nói trên máy) | **Không đổi — vẫn 4+.** Chỉ thêm cách nhập liệu, không thêm nội dung. Nhớ khai 2 quyền micro/speech trong Info.plist khi mic kịp bản nào. |
| Thêm quảng cáo | Không đổi rating, nhưng quảng cáo có nội dung người lớn thì bị tính — nên nếu thêm quảng cáo thì chọn mạng quảng cáo có lọc nội dung phù hợp. Hiện v1 không có quảng cáo. |
| Thêm trình duyệt web nhúng trong app (webview cho gõ URL tuỳ ý) | **Lên 17+ ngay** (mục 11 → Yes). **Đừng thêm** nếu không thật sự cần; mọi nhu cầu mở web hiện tại đã làm được bằng Safari ngoài app. |
| Thêm feed tin tức / nội dung bên ngoài vào app | Rà lại toàn bộ §3 theo đúng nội dung feed đó; nội dung không kiểm soát được thì dễ lên 12+/17+. |
| Đổi logo / màu / UI kiểu Apple Music | Không đổi rating. |

---

## 7. Cách khai trong App Store Connect (làm đúng từng bước)

1. Vào **App Store Connect → FotoBro → App Information → Age Rating**,
   bấm **Edit** để mở questionnaire.
2. Trả lời **"None" / "Không"** cho mọi mục nội dung (bạo lực, tình dục,
   ngôn từ, rượu/thuốc, chủ đề người lớn, kinh dị, cờ bạc, cuộc thi, y tế).
3. Mục **Unrestricted Web Access**: chọn **No** — căn cứ §3 mục 11 (không có
   trình duyệt trong app, CSP `frame-src 'none'`, link mở ra Safari/app ngoài).
4. Các mục về UGC / chat / chia sẻ giữa người dùng (nếu questionnaire hiện
   mục này): chọn **không có** — app v1 đơn người dùng, không chat với ai.
5. Mục mua hàng trong app / quảng cáo (nếu có trong form): khai **không có**
   ở v1 — khớp Price = Free, không tạo IAP.
6. Kiểm tra rating Apple tính ra hiển thị **4+** rồi mới lưu. Nếu Apple tính
   ra khác 4+, **đừng bấm lưu vội** — đối chiếu lại từng câu trả lời với bảng
   §3, vì khác 4+ nghĩa là có một câu đã trả lời sai so với thực tế app.
7. **Khai lại từ đầu nếu questionnaire đổi phiên bản** (Apple thỉnh thoảng
   thêm/bớt mục) hoặc nếu build gửi đi khác với bản v1 này — đáp án phải khớp
   **build gửi đi**, không khớp bản nháp.

---

## 8. Lưu ý / điểm chưa chắc chắn (đọc trước khi submit)

1. **`www/index.html` hiện tại vẫn còn nhiều phần của bản web cũ
   (Trợ lý Xèo):** còn phòng ban Sen/Nắng/Mây, tông vintage, link Instagram
   trang chủ, nút Messenger/Facebook/Zalo trong chi tiết job. `APP-STORE-READY.md`
   ghi v1 đang làm dở. **Kết luận 4+ không đổi** vì các phần cũ đó cũng không
   chứa nội dung nhạy cảm nào — nhưng trước khi submit, rà lại **build cuối**
   một lần nữa: nếu bản UI mới (Apple Music, tối giản) bỏ các nút link ngoài
   thì mục 11 càng chắc chắn là No; nếu bản mới thêm tính năng gì thì rà theo
   §6.
2. **Thông báo nhắc lịch hiện tên khách + giờ chụp trên màn hình khoá**
   (`PRIVACY.html` §5): đây là vấn đề riêng tư (người khác cầm máy có thể thấy
   tên khách), không phải vấn đề age rating — không ảnh hưởng 4+. Ghi ở đây để
   khỏi nhầm sang rating.
3. **Google ở v1 chưa chắc chắn:** `APP-STORE-READY.md` §12 ghi Google chỉ bật
   khi Client ID chung + xác minh Google xong; nếu chưa xong thì tắt Google tạm
   và sửa mô tả. Dù Google bật hay tắt thì **rating vẫn 4+** — Google OAuth mở
   bằng trình duyệt hệ thống, dữ liệu Google chỉ đọc trên máy, không thêm nội
   dung nhạy cảm.
4. **File này không thay thế câu trả lời trong App Store Connect.** Người nhập
   phải tự trả lời questionnaire theo đúng build gửi đi; file này chỉ là căn cứ
   để trả lời đúng.
5. **Nguồn tham khảo chính:** App Store Review Guidelines (Guideline 1.2 về
   UGC, Guideline 4.8 về đăng nhập bên thứ ba — xem `APP-STORE-READY.md` §12),
   và trang Age Ratings trong App Store Connect Help. Nếu Apple đổi questionnaire
   thì bảng §3 phải cập nhật theo mẫu mới nhất lúc submit.

---

## Nguồn đã đọc

- `www/index.html` — CSP (`frame-src 'none'`), link ngoài (Instagram /
  Messenger / Facebook / Zalo / Google Lịch / Drive / `mailto:`), không có
  StoreKit/IAP, màn hỏi–đáp local (`#view-ask`), mẫu tin nhắn.
- `APP-STORE-READY.md` — §3 (Age Rating 4+), §4 (Free, không IAP, Nấc 2/3
  placeholder), §10 (quyền), §12 (Google, mic dời v1.1).
- `APP-STORE-LISTING.md` — §5 (4+, khai "Unrestricted web access" là không),
  §6 (không IAP, không quảng cáo, "Data Not Collected").
- `PRIVACY.html` — §1 (không thu thập, không GPS), §2 (Google mặc định TẮT,
  không lưu refresh token, nút mở app ngoài), §3–§4 (mic chưa có ở v1),
  §5 (thông báo), §6 (trẻ em), §9 (liên hệ `support@fotobro.app` — đang
  thiết lập).
- `PRIVACY.md` — §5 (trẻ em), §6 (xoá dữ liệu).
- `ios/App/App/Info.plist` — quyền Camera, Photo Library, Calendars.
