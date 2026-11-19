# ASO Keywords — FotoBro iOS v1

- **App:** FotoBro — trợ lý cho photographer tự do
- **Bundle ID:** `com.fotobro.app`
- **Phiên bản áp dụng:** v1 (submit đầu tiên)
- **Ngày soạn:** 20/11/2026
- **Trạng thái:** Bản nháp để dán vào App Store Connect — chưa submit, chưa đo thực tế.
- **Phạm vi:** Chỉ chiến lược từ khoá / metadata tìm kiếm. Không thay đổi tên thương hiệu, không
  thay đổi tính năng app. Mọi con số giới hạn dưới đây đã đối chiếu với tài liệu Apple qua web
  search ngày 20/11/2026 (xem §1); không bịa quy định.

## 1. Quy tắc Apple đã kiểm chứng (đừng vi phạm)

Nguồn: Apple Developer — trang App Store search; App Store Connect Help
(App information, Platform version information); App Review Guidelines 2.3.7
(cập nhật 08/06/2026 theo tài liệu đối chiếu).

| Quy tắc | Nội dung |
|---|---|
| Tổng ngân sách tìm kiếm | Tên 30 ký tự + subtitle 30 ký tự + keywords 100 byte = ~160 ký tự/localization. Cả 3 trường đều được lập chỉ mục (indexed) cho tìm kiếm. |
| Keywords | Tối đa **100 byte** (App Store Connect Help ghi "100 bytes"; trang search của Apple ghi "100 characters" — với tiếng Anh 2 cách đếm trùng nhau, với tiếng Việt có dấu thì **byte mới là giới hạn thật**). Vượt là bị từ chối, không tự cắt ngắn. |
| Định dạng | Ngăn cách bằng dấu phẩy, **không có khoảng trắng sau dấu phẩy**. Khoảng trắng *bên trong* một cụm từ thì được (vd `chân dung`). Chỉ dùng dấu phẩy làm dấu phân cách. |
| Không lặp | Không lặp từ đã có trong tên app, subtitle, tên công ty/developer, hoặc tên category. Apple đã lập chỉ mục các từ đó rồi; lặp lại chỉ tốn byte. |
| Không dùng số nhiều thừa | Không thêm dạng số nhiều của từ đã có (Apple coi là trùng lặp). |
| Không dùng từ chung | Không dùng tên category, từ `app`, từ đệm (`the`, `to`…). |
| Cấm thương hiệu / đối thủ | Không dùng tên app khác, tên công ty khác, trademark không sở hữu. Vi phạm Guideline 2.3.7 là lý do bị reject thường gặp; Apple có quyền tự sửa keywords không phù hợp. |
| Chỉ dùng từ liên quan | Guideline 2.3.7 cấm nhồi metadata bằng từ trademark, tên app nổi tiếng, giá, hoặc cụm không liên quan chỉ để "game" tìm kiếm. |
| Mỗi keyword | Dài hơn 2 ký tự (theo tài liệu đối chiếu App Store Connect Help). Không dùng ký tự đặc biệt `#`, `@` trừ khi là một phần thương hiệu. |
| Mô tả dài (description) | Tối đa 4.000 ký tự nhưng **không được lập chỉ mục cho tìm kiếm trên iOS** — đừng nhồi từ khoá vào description. Promotional text (170 ký tự) cũng **không ảnh hưởng xếp hạng tìm kiếm**. |
| Khi nào đổi được | Tên, subtitle, keywords **chỉ đổi được khi submit phiên bản mới**. Chọn sai ở v1 thì phải chờ tới v1.1 mới sửa được. |
| Xếp hạng | Apple không công bố công thức/trọng số. Kết quả tìm kiếm dựa trên độ liên quan của text (tên, subtitle, keywords, category chính) **và** hành vi người dùng (lượt tải, đánh giá, review). Không ai ngoài Apple biết chính xác trọng số — mọi tuyên bố "tên nặng gấp X lần keywords" đều là suy đoán, không phải quy định Apple. |

### Lưu ý riêng cho tiếng Việt: byte ≠ ký tự

Chữ có dấu tiếng Việt trong UTF-8 chiếm 2 byte/chữ (vd `ế`, `ụ`, `á`, `ả`).
Một chuỗi tiếng Việt "79 ký tự" có thể đã là 98 byte. **Luôn đếm bằng byte trước khi
dán vào App Store Connect**, không đếm bằng mắt. Cách đếm nhanh:

```python
len("nhiếp,chụp,cưới,chân dung,lookbook,sự kiện,khách,báo giá,thu chi,lịch,nhắc,film".encode("utf-8"))
# -> 98
```

Các con số byte trong file này đã đếm bằng `len(s.encode('utf-8'))` ngày 20/11/2026.

---

## 2. Tên + subtitle (đã chốt, dùng làm nền cho keywords)

| Trường | Nội dung | Độ dài | Ghi chú |
|---|---|---|---|
| App name | `FotoBro` | 7 / 30 ký tự | Thương hiệu. Không nhét thêm từ khoá vào tên ở v1 (giữ tên sạch, dễ nhớ; Guideline 2.3.7 cấm tên chỉ toàn từ chung). |
| Subtitle | `Trợ lý studio ảnh` | 17 / 30 ký tự (22 byte) | Đã chốt theo task. Các từ `trợ`, `lý`, `studio`, `ảnh` đã được lập chỉ mục — **không lặp lại 4 từ này trong trường keywords**. |
| Category chính (đề xuất) | Business | — | FotoBro là trợ lý kinh doanh cho freelancer (job, tiền, lịch, báo giá), không phải app chỉnh sửa ảnh. Category phụ (nếu dùng): Photo & Video. Quyết cuối thuộc về người submit; dù chọn category nào thì 2 trường keywords dưới đây cũng không chứa tên category (`business`, `photo`, `video` đều không có mặt) nên không phải sửa lại. |

---

## 3. Trường keywords TIẾNG VIỆT (localization `vi`) — DÙNG CHO V1

**Dán nguyên văn vào App Store Connect (copy-paste, không thêm khoảng trắng):**

```
nhiếp,chụp,cưới,chân dung,lookbook,sự kiện,khách,báo giá,thu chi,lịch,nhắc,film
```

- **Độ dài: 79 ký tự / 98 byte — còn dư 2 byte.** Không nhét thêm được từ nào có nghĩa
  (từ ngắn nhất còn lại cũng cần ≥ 3 byte + 1 dấu phẩy). Dư 2 byte là chấp nhận được;
  đừng cố lấp đầy bằng từ vô nghĩa.
- **Không lặp:** không chứa `fotoBro`, `trợ`, `lý`, `studio`, `ảnh`, `app`.
- **Không chứa:** tên đối thủ/thương hiệu, tên category, dạng số nhiều thừa.

### Từng token ứng với ý định tìm kiếm nào

| Token | Ý định / cụm tìm kiếm Apple có thể ghép được* | Tính năng FotoBro tương ứng |
|---|---|---|
| `nhiếp` | "nhiếp ảnh", "nhiếp ảnh gia", "thuê nhiếp ảnh" (ghép với `ảnh` ở subtitle) | Đối tượng chính: photographer |
| `chụp` | "chụp ảnh", "chụp ảnh cưới", "lịch chụp" (ghép với `lịch`) | Job chụp |
| `cưới` | "chụp ảnh cưới", "nhiếp ảnh cưới", "wedding" (bản VI) | Gói Wedding — gói giá cao nhất |
| `chân dung` | "chụp chân dung", "nhiếp ảnh chân dung" | Gói Portrait |
| `lookbook` | "chụp lookbook", "nhiếp ảnh lookbook" | Gói Lookbook |
| `sự kiện` | "chụp sự kiện", "nhiếp ảnh sự kiện" | Gói Event |
| `khách` | "quản lý khách", "khách hàng chụp ảnh" | Quản lý khách / pipeline 8 bước |
| `báo giá` | "báo giá chụp ảnh", "báo giá cưới" | Máy tính giá, mẫu tin nhắn báo giá |
| `thu chi` | "quản lý thu chi", "sổ thu chi chụp ảnh" | Sổ tiền / báo cáo |
| `lịch` | "lịch chụp", "nhắc lịch chụp" (ghép với `nhắc`) | Nhắc lịch, Lịch iPhone native |
| `nhắc` | "nhắc lịch", "nhắc lịch chụp" | Nhắc lịch trong app |
| `film` | "chụp film", "báo giá film", "chụp ảnh film" | Bảng giá film riêng (Digital / Film / Cả hai) |

\* Apple ghép các từ trong tên + subtitle + keywords với nhau để khớp cụm tìm kiếm,
nên token đơn lẻ vẫn phủ được cụm dài. Đây là cơ chế Apple mô tả (text relevance
trên nhiều trường), không phải đảm bảo xếp hạng — xếp hạng còn phụ thuộc lượt tải/review.

### Từ khoá chính vs phụ (tiếng Việt)

- **Chính (quyết định tải về):** `nhiếp`, `chụp`, `cưới`, `báo giá`, `thu chi` — đúng
  người (photographer), đúng job tiền cao (cưới), đúng nỗi đau (báo giá, thu chi).
- **Phụ (mở rộng phủ):** `chân dung`, `lookbook`, `sự kiện`, `khách`, `lịch`, `nhắc`, `film`.
- **Chưa đưa vào v1 (dự phòng xoay vòng ở v1.1, xem §5):** `quản`, `hợp đồng`, `cọc`,
  `giao ảnh`, `hậu kỳ`. Không phải vì chúng dở — mà vì hết byte. Muốn thêm từ nào thì
  phải bỏ một từ khác, và chỉ làm sau khi có số liệu §6.

### Không dùng bản không dấu trong v1

Người dùng Việt hay tìm không dấu (`nhiep anh`, `chup anh cuoi`). **Không nhét bản
không dấu vào trường 100 byte ở v1** — mỗi bản không dấu tốn thêm byte mà chưa có bằng
chứng nó tăng hiển thị (Apple có chuẩn hoá dấu hay không chưa được xác minh từ tài liệu
Apple trong lần tra này). Sau ra mắt, kiểm tra thực tế: tìm không dấu trên App Store
xem FotoBro có hiện không; nếu không hiện thì mới cân nhắc đổi một token ở v1.1.

---

## 4. Trường keywords TIẾNG ANH (localization `en-US`) — DÙNG CHO V1

FotoBro làm cho thị trường quốc tế nữa (tên tiếng Anh, giao diện Việt/Anh), nên cần
localization tiếng Anh riêng — mỗi localization có trường keywords 100 byte của nó.

**Dán nguyên văn vào App Store Connect:**

```
photographer,freelance,wedding,portrait,booking,client,invoice,pricing,shoot,schedule,reminder,film
```

- **Độ dài: 99 ký tự / 99 byte — còn dư 1 byte.** Đã dùng gần tối đa; không thêm được gì.
- **Không lặp:** không chứa `fotobro`, `studio` (đã có trong subtitle), `app`.
- **Không chứa:** tên đối thủ/thương hiệu, tên category.

### Từng token ứng với ý định nào

| Token | Ý định tìm kiếm | Tính năng tương ứng |
|---|---|---|
| `photographer` | "photographer app/assistant", "freelance photographer" (ghép với `freelance`) | Đối tượng chính |
| `freelance` | "freelance photographer", "freelance booking" | Photographer tự do (không chỉ studio lớn) |
| `wedding` | "wedding photographer", "wedding booking" | Gói Wedding |
| `portrait` | "portrait photographer", "portrait booking" | Gói Portrait |
| `booking` | "photography booking", "client booking" | Job pipeline 8 bước |
| `client` | "client management photographer" | Quản lý khách |
| `invoice` | "photographer invoice", "invoice client" | Sổ tiền / thu tiền (thu nốt ở bước Đã giao) |
| `pricing` | "photography pricing", "pricing calculator" | Máy tính giá Digital/Film |
| `shoot` | "photo shoot booking/schedule" | Buổi chụp |
| `schedule` | "shoot schedule", "photography schedule" | Lịch chụp |
| `reminder` | "shoot reminder", "booking reminder" | Nhắc lịch |
| `film` | "film photography pricing", "film photographer" | Bảng giá film riêng |

### Từ khoá chính vs phụ (tiếng Anh)

- **Chính:** `photographer`, `freelance`, `wedding`, `booking`, `pricing` — đúng người,
  đúng job, đúng việc tính tiền.
- **Phụ:** `portrait`, `client`, `invoice`, `shoot`, `schedule`, `reminder`, `film`.
- **Bị loại vì hết byte (dự phòng v1.1):** `event`, `contract`, `deposit`, `delivery`,
  `session`, `editing`. `event` là từ tiếc nhất (gói Event có trong app) — nếu dữ liệu
  sau ra mắt cho thấy tìm kiếm "event photographer" mạnh, cân nhắc thay `reminder`
  hoặc `invoice` bằng `event` ở v1.1, nhưng chỉ sau khi đo (§6), không đổi theo cảm tính.

---

## 5. Danh sách dự phòng — chỉ dùng khi xoay vòng ở v1.1+

Nguyên tắc xoay vòng: **mỗi lần chỉ đổi 1–2 token, ghi lại ngày đổi + phiên bản**,
để biết thay đổi nào gây ra thay đổi xếp hạng. Không đổi toàn bộ trường cùng lúc.

| Localization | Token dự phòng | Byte (token + 1 dấu phẩy) | Thay cho token nào thì hợp lý | Khi nào cân nhắc |
|---|---|---|---|---|
| VI | `quản` | 6 | `nhắc` (nếu nhắc lịch không mang lượt tìm) | Người dùng tìm "quản lý studio/chụp ảnh" nhiều |
| VI | `hợp đồng` | 10 | `lookbook` (nếu gói Lookbook ít tìm) | — |
| VI | `cọc` | 5 | — (chỉ khi có token thừa byte) | Tìm "cọc chụp ảnh" xuất hiện trong Search Terms |
| VI | `hậu kỳ` | 8 | `sự kiện` | — |
| VI | `giao ảnh` | 10 | `lookbook` | — |
| EN | `event` | 6 | `reminder` hoặc `invoice` | "event photographer" có lượt tìm cao |
| EN | `contract` | 9 | `invoice` | — |
| EN | `deposit` | 8 | `invoice` | Tìm "deposit" cho cọc |
| EN | `session` | 8 | `shoot` | "photo session" phổ biến hơn "shoot" |
| EN | `delivery` | 9 | `reminder` | Tính năng giao ảnh được tìm nhiều |

Lưu ý: `studio` đã có trong subtitle nên **không bao giờ** đưa vào keywords EN/VI
dưới dạng token riêng — đó là lặp, tốn byte.

---

## 6. Từ khoá / cụm CẤM — tuyệt đối không đưa vào metadata

| Nhóm | Ví dụ cấm | Lý do |
|---|---|---|
| **App đối thủ đã có trên store** | `FotoFlow` — **đã có app khác tên này** (theo xác nhận của Việt: FotoFlow đã trùng với FotoFlow AI và FotoFlow CRM cho studio ảnh, nên tên này đã bị bỏ) | Dùng tên app khác trong keywords vi phạm Guideline 2.3.7, có thể bị reject; ngoài ra còn gây nhầm lẫn thương hiệu và rủi ro pháp lý. Không dùng `FotoFlow` ở bất kỳ trường nào: tên, subtitle, keywords, description, screenshot text. |
| App / công ty đối thủ khác | `HoneyBook`, `Studio Ninja`, `ShootQ`, `Pixieset`, `Sprout Studio`, `17hats`, `Dubsado` | Tên app/công ty khác không được phép trong keywords (App Store Connect Help: "Names of other apps or companies aren't allowed"). |
| Thương hiệu nền tảng / công cụ | `Instagram`, `Facebook`, `Google`, `Apple`, `iPhone`, `Lightroom`, `Photoshop`, `Canva` | Trademark không sở hữu; Apple cấm dùng trademark trong metadata để câu tìm kiếm. Việc app *tích hợp* Google / Lịch iPhone không cho quyền dùng tên đó làm từ khoá. |
| Tuyên bố không kiểm chứng / giá | `số 1`, `tốt nhất`, `best`, `top`, `miễn phí`, `free` | Guideline 2.3.7 cấm giá và tuyên bố không kiểm chứng trong tên/subtitle/keywords. FotoBro có Nấc 2/3 thu phí nên "miễn phí" còn gây hiểu lầm. |
| Từ chung / từ đệm | `app`, `photo`, `video`, `business`, `the`, `to`, `và` | `app` + tên category Apple khuyên bỏ; `photo`/`video`/`business` là tên category tuỳ category chính được chọn. |
| Từ không liên quan / câu view | `AI`, `trending`, `viral`, tên người nổi tiếng, tên app nổi tiếng không liên quan | Guideline 2.3.7: nhồi từ không liên quan để game tìm kiếm là lý do reject. FotoBro v1 không có tính năng AI tạo ảnh — đừng gắn `AI`. |
| Lặp / số nhiều thừa | `fotobro`, `trợ`, `lý`, `studio`, `ảnh`, `photographers`, `bookings` | Đã có trong tên/subtitle hoặc là số nhiều của từ đã có. |

Nếu một từ trong bảng này xuất hiện trong mô tả dài (description) với ngữ cảnh thật
(vd "xuất lịch sang Lịch iPhone" trong câu hướng dẫn), đó là mô tả tính năng, không phải
nhồi từ khoá — vẫn được, nhưng **không** đưa vào tên/subtitle/keywords.

---

## 7. Cách đo hiệu quả sau ra mắt

### 7.1. Apple không cho số liệu từng từ khoá — phải đo gián tiếp

App Store Connect **không** báo cáo xếp hạng hay lượt hiển thị theo từng keyword.
Vì vậy đo bằng 2 nguồn kết hợp:

1. **App Store Connect → App Analytics → Sources → App Store Search** (số liệu chính thức):
   - Impressions (lượt hiển thị từ tìm kiếm), Product Page Views, Downloads,
     Conversion Rate (Downloads / Product Page Views).
   - Lọc theo thời gian (theo ngày/tuần) và theo storefront (Việt Nam vs Mỹ).
   - Đây là số liệu duy nhất đáng tin cho "tìm kiếm có mang về lượt tải không".
2. **Công cụ rank-tracking bên thứ ba** (Appfigures, Sensor Tower, AppTweak, ASOdesk…):
   - Chỉ dùng để theo dõi **thứ hạng ước tính** của từng từ khoá trong §3–§4
     (vd FotoBro đứng top mấy khi tìm "nhiếp ảnh cưới", "photographer booking").
   - Đây là **ước tính của bên thứ ba, không phải số liệu Apple** — dùng để so sánh
     tương đối theo thời gian, không dùng làm số tuyệt đối. Chưa chọn công cụ cụ thể;
     chọn sau khi app lên store (bản miễn phí của Appfigures đủ cho giai đoạn đầu).

### 7.2. Quy trình đo (làm theo thứ tự)

| Bước | Việc làm | Khi nào |
|---|---|---|
| 0. Baseline | Trước ngày phát hành: chụp lại (screenshot/ghi chú) trường keywords đã submit cho từng localization + phiên bản v1. Không có baseline thì sau này không biết thay đổi nào gây ra kết quả. | Trước khi submit v1 |
| 1. Chờ ổn định | Không kết luận gì trong 7 ngày đầu — xếp hạng tuần đầu nhiễu do app mới, lượt tải ban đầu, review chưa có. | Ngày 1–7 sau phát hành |
| 2. Đọc số tuần 2–4 | Ghi vào bảng theo dõi: Search Impressions, Product Page Views, Downloads từ Search, Conversion Rate; so với tuần trước. Ghi thứ hạng ước tính top 10 từ khoá chính mỗi tuần (cùng một công cụ, cùng storefront). | Cuối tuần 2, 3, 4 |
| 3. Đánh giá từng cụm | Một token được coi là "có hiệu quả" khi **cả 2** điều kiện đúng: (a) app lọt top 10 cho cụm chứa token đó, (b) Search Impressions/Downloads tăng cùng thời gian đó. Chỉ top 10 mà không có tải về = hiển thị không chuyển đổi (xem lại screenshot/giá); có tải mà không rõ từ khoá nào = xem lại toàn bộ, đừng gán công cho một token. | Sau 2–4 tuần dữ liệu |
| 4. Quyết định đổi hay giữ | Chỉ đổi keywords khi có bằng chứng: một token chính 4 tuần liền ngoài top 20 **và** có token dự phòng (§5) khớp với cụm đang có lượt tìm thật (thấy trong Search Terms của App Analytics hoặc công cụ thứ ba). Đổi 1–2 token/lần, ghi ngày + phiên bản. | Khi submit v1.1 trở đi |
| 5. Không đổi | Đừng đổi keywords chỉ vì "thấy đối thủ dùng từ khác", đừng đổi trong tuần đầu, đừng đổi 2 lần trong cùng một phiên bản (không thể — keywords gắn với phiên bản). | Luôn |

### 7.3. Chỉ số mục tiêu (mục tiêu tham khảo cho v1, không phải cam kết)

- **Tìm kiếm mang về lượt tải:** Search Downloads tăng đều 4 tuần đầu (không đặt con số
  tuyệt đối vì app mới, chưa có baseline).
- **Top 10:** ít nhất 2–3 cụm chính lọt top 10 ở storefront Việt Nam sau 4 tuần
  (ưu tiên: "nhiếp ảnh cưới", "báo giá chụp ảnh", "quản lý thu chi chụp ảnh" — các cụm
  ghép từ token §3; và "photographer booking", "photography pricing" ở storefront Mỹ).
- **Conversion:** Product Page → Download từ nguồn Search không thấp hơn rõ rệt so với
  nguồn Browse (nếu thấp hơn nhiều → vấn đề nằm ở screenshot/mô tả, không phải keywords).
- **Tín hiệu xấu cần xử lý:** Search Impressions cao nhưng Conversion thấp kéo dài
  2 tuần → xem lại screenshot đầu tiên + subtitle; Impressions gần bằng 0 sau 2 tuần →
  kiểm tra lại localization đã bật đúng storefront chưa, keywords đã lưu đúng chưa.

### 7.4. Những gì KHÔNG đo được / đừng cố đo

- Thứ hạng chính xác từng từ khoá theo Apple (Apple không công bố).
- Lượt tìm kiếm tuyệt đối của một từ khoá (Apple không công bố search volume).
- Tác dụng riêng của một token đơn lẻ trong một cụm (Apple ghép nhiều trường với nhau).
- Hiệu quả của keywords trong tuần đầu tiên (nhiễu quá lớn).

---

## 8. Checklist trước khi dán vào App Store Connect

- [ ] Tên `FotoBro` (7 ký tự), subtitle `Trợ lý studio ảnh` (17 ký tự) đúng như §2.
- [ ] Dán trường VI đúng nguyên văn §3 — đếm lại bằng byte, phải ≤ 100 byte (bản này: 98).
- [ ] Dán trường EN đúng nguyên văn §4 — đếm lại bằng byte, phải ≤ 100 byte (bản này: 99).
- [ ] Không có khoảng trắng sau dấu phẩy trong cả 2 trường.
- [ ] Không có từ nào trong §6 (đặc biệt `FotoFlow`, `app`, tên đối thủ).
- [ ] Localization `vi` và `en-US` đều được bật; mỗi localization dùng đúng trường của nó
      (đừng dán trường VI vào ô EN và ngược lại).
- [ ] Lưu lại bản chụp màn hình / copy text của 2 trường + ngày submit + phiên bản v1
      (baseline cho §7.2 bước 0).
- [ ] Sau phát hành: hẹn lịch đọc số liệu cuối tuần 2 và tuần 4 (xem §7.2).

---

## Nguồn & ghi chú

- Apple Developer — App Store search (text relevance: title, subtitle, keywords,
  primary category; user behavior: downloads, ratings, reviews).
- App Store Connect Help — App information / Platform version information
  (app name 2–30 ký tự; subtitle 30 ký tự; keywords tối đa 100 bytes; không dùng tên
  app/công ty khác trong keywords).
- Apple App Review Guidelines 2.3.7 (cập nhật 08/06/2026): tên + keywords phải mô tả
  đúng app; cấm nhồi trademark, tên app nổi tiếng, giá, cụm không liên quan.
- Đối chiếu thêm (không phải nguồn Apple): Launchshots, "The App Store Keyword Field:
  How to Use All 100 Characters" — https://www.launchshots.com/blog/app-store-keyword-field ;
  Haplo, "App Store Keywords: How the 100-Character Field Works" —
  https://haploapp.com/blog/app-store-keywords . Hai nguồn này chỉ dùng để đối chiếu
  cách diễn giải; khi có mâu thuẫn thì tài liệu Apple thắng.
- Tên `FotoFlow` đã có app khác: theo xác nhận của Việt (19/11/2026) — FotoFlow đã
  trùng với FotoFlow AI và FotoFlow CRM cho studio ảnh, là lý do tên này bị loại.
- File này chỉ là chiến lược từ khoá. Quyết định submit cuối cùng (category chính,
  ngày phát hành, công cụ rank-tracking) thuộc về người phụ trách submit v1.
