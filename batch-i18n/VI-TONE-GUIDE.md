# FotoBro iOS v1 — Hướng dẫn giọng văn tiếng Việt (VI-TONE-GUIDE)

- File: `~/workspace/fotobro-ios-v1/batch-i18n/VI-TONE-GUIDE.md` (chỉ tài liệu, không sửa code)
- Viết ngày 20/11/2026, đối chiếu với `www/index.html` (341.754 byte), `I18N-STRINGS.md` (80 chuỗi v1) và `MESSAGE-TEMPLATES.md` (5 mẫu email + 5 mẫu nhắn nhanh)
- Vai trò: tài liệu này quy định **cách viết**; `I18N-STRINGS.md` là **danh mục chuỗi**, `MESSAGE-TEMPLATES.md` là **nội dung mẫu gửi khách**. Khi ba tài liệu mâu thuẫn nhau về câu chữ, theo tài liệu này; khi mâu thuẫn về chuỗi nào tồn tại, theo `I18N-STRINGS.md`.
- Phạm vi: mọi chuỗi tiếng Việt trong app v1 — giao diện, thông báo, lỗi, nhắc việc, nhắc tiền. Không áp dụng cho bản tiếng Anh (bản Anh theo giọng trung tính, ngắn, không hạt cảm thán).

## 1. Nguyên tắc chung — 5 điều

1. **Ngắn trước đã.** Một câu một ý. Người dùng đọc lướt trên điện thoại, giữa buổi chụp.
2. **Nói như người thật, không như văn bản hành chính.** App là trợ lý đứng cạnh nhiếp ảnh gia, không phải cơ quan.
3. **Không đổ lỗi cho người dùng.** Lỗi thì nói việc chưa xong + cách sửa, không nói người dùng làm sai.
4. **Nhất quán một giọng từ đầu tới cuối.** Cùng một việc, mọi chỗ trong app dùng cùng một từ (xem §5).
5. **Tiền là chuyện nhạy cảm — nói khéo, nói kèm giá trị.** Không bao giờ đòi tiền trần trụi, không tách tin nhắc tiền khỏi tin giao giá trị (xem §7).

## 2. Xưng hô — mình / bạn

| Ai nói với ai | Xưng | Gọi | Ví dụ |
|---|---|---|---|
| App → nhiếp ảnh gia (người dùng app) | mình | bạn | "Chào {name}! FotoBro đây." |
| Nhiếp ảnh gia → khách (trong mẫu tin nhắn/email) | mình | bạn | "Chào {ten}, mình là {studio} đây." |
| App → khách | — | — | App không nói trực tiếp với khách; mọi câu gửi khách đều qua mẫu ở `MESSAGE-TEMPLATES.md` |

Quy tắc:

- **Luôn dùng "mình / bạn".** Đây là giọng đã có sẵn trong code (`"Mình là … nè"`, `"Cảm ơn bạn!"`, `"Bạn nhớ bấm …"`).
- **Không dùng "tôi".** "Tôi" nghe xa cách, như đơn từ.
- **Không dùng "quý khách / quý vị".** Đó là giọng tổng đài, không phải giọng studio ảnh.
- **Không dùng "anh / chị / em" để gọi người dùng.** App không biết tuổi người dùng; gọi sai còn tệ hơn gọi chung.
- **Không dùng "tớ / cậu".** Quá thân mật, không hợp với công việc.
- **Không gọi người dùng là "khách hàng".** Người dùng là nhiếp ảnh gia — chủ studio. "Khách hàng" chỉ dùng để chỉ khách chụp của họ.
- **Chào theo tên khi biết tên:** `Chào {name}!` (chuỗi `today.greeting`, I18N #11). Chưa biết tên thì chỉ chào chung: "Chào bạn!" — không chào "Chào mừng bạn đến với…".
- **Trong mẫu gửi khách, "mình" là nhiếp ảnh gia, "bạn" là khách.** Không lẫn: đừng để app xưng "mình" trong câu khách sẽ đọc mà tưởng là app nói.

## 3. Mức độ thân thiện và lịch sự

Giọng chuẩn của FotoBro: **thân thiện, ấm áp, lịch sự nhẹ — như một trợ lý giỏi nói chuyện với chủ studio, không như nhân viên lễ tân và không như bạn thân nhắn tin.**

- **Thân thiện:** dùng được hạt cảm thán nhẹ `nè`, `nha`, `nhé` trong thông báo và nhắc việc. Ví dụ trong code: `"Chưa nghe rõ — bấm micro nói lại nha"`, `"Mình nhận được cọc rồi nè"`.
- **Lịch sự nhẹ:** dùng `ạ` **chỉ trong mẫu gửi khách** (`MESSAGE-TEMPLATES.md`: "Chào {ten} ạ", "Chuyển xong nhắn mình một tiếng ạ"). **Trong giao diện app, không dùng `ạ`** — người dùng là chủ, app không cần khúm núm với chủ.
- **Không trang trọng quá:** tránh "Kính gửi", "Trân trọng", "Vui lòng", "Quý khách vui lòng…". Một ngoại lệ duy nhất: câu "Vui lòng" không xuất hiện trong code v1 — giữ như vậy.
- **Không xuề xoà quá:** tránh "ê", "okela", "nhá", "nhééé", teencode, viết tắt kiểu "k", "ko", "dc". "Ok" chỉ dùng trong mẫu gửi khách khi đã có sẵn ("Bạn ok thì mình giữ lịch cho bạn") — không dùng "ok" trong nút bấm hay thông báo hệ thống.
- **Hạt cảm thán có liều lượng:** tối đa **1 hạt / câu**, và **không dùng trong câu báo lỗi nghiêm trọng** (mất dữ liệu, không lưu được, lỗi bảo mật). Lỗi nghiêm trọng viết câu đầy đủ, bình tĩnh, không "nha/nè".
- **Dấu chấm than:** tối đa 1 câu / màn hình, chỉ dùng cho tin vui (nhận cọc, giao ảnh xong, "Chào {name}!"). Thông báo thường ("Đã lưu", "Đã xoá") không có dấu chấm than.

## 4. Câu ngắn — quy tắc độ dài

- **Nút bấm:** 1–2 từ. Động từ đứng đầu. Ví dụ: "Lưu", "Huỷ", "Ghi thu", "Thêm vào Lịch iPhone", "Xong bước này".
- **Thông báo (toast):** tối đa **6 từ**. Ví dụ: "Đã lưu", "Đã xoá", "Đã lưu logo studio".
- **Nhắc việc / trạng thái trống:** tối đa **12 từ**. Ví dụ: "Hôm nay thong thả lắm", "Chưa có job", "Chưa có khoản thu nào."
- **Câu hướng dẫn trong lỗi:** tối đa **15 từ**, gồm 2 vế: *việc chưa xong* + *làm gì tiếp*. Ví dụ: "Chưa nghe rõ — bấm micro nói lại nha".
- **Không dùng câu ghép dài có 2–3 mệnh đề phụ.** Nếu một câu cần tới "vì", "nên", "tuy nhiên", "do đó" thì tách làm hai câu hoặc bỏ mệnh đề phụ đi.
- **Không viết tắt gây khó hiểu.** "Hạn giao ảnh" chứ không viết "Hạn giao"; "Tiền cọc" viết đủ trong nhãn form, chỉ rút gọn thành "Cọc" khi đã có ngữ cảnh (đã có trong I18N #25).

## 5. Từ nên dùng và từ tránh dùng

| Việc / khái niệm | Nên dùng | Tránh dùng | Vì sao |
|---|---|---|---|
| Tiền khách chưa trả | Còn thiếu | Còn nợ, Nợ, Dư nợ, Công nợ | "Nợ" nghe như đòi nợ; "Còn thiếu" trung tính, đã dùng trong code v1 (I18N #27) |
| Tiền giữ lịch | Cọc | Đặt cọc trước, Tiền đặt cọc, Tiền giữ chỗ | Ngắn, đúng từ thợ ảnh vẫn dùng |
| Tiền đã nhận | Đã thu | Đã nhận tiền, Đã thanh toán | "Đã thu" là nhãn đã có trong code (I18N #26) |
| Tiền lãi | Lời | Lợi nhuận, Thu nhập ròng | "Lời" ngắn, đúng giọng sổ tiền tay |
| Công việc chụp | Job, Buổi chụp | Dự án, Hợp đồng, Đơn hàng | Người dùng gọi là "job" trong đời thật; "Buổi chụp" là nhãn tab |
| Khách chụp | Khách, Tên khách | Khách hàng, Quý khách | "Khách" đủ thân mật; "Khách hàng" nghe như CRM |
| Bước pipeline | Bước | Giai đoạn, Trạng thái, Phase | "Bước" đã dùng trong code ("Đang ở bước", "Xong bước này") |
| Job chậm tiến độ | Job kẹt ở bước … | Job trễ, Job quá hạn, Job bị đình trệ | "Kẹt" là từ trong code; "trễ/quá hạn" nghe như khiển trách |
| Chưa có dữ liệu | Chưa có … | Không có …, Trống, Rỗng | "Chưa có job" mở ra khả năng sẽ có; "Không có" nghe như kết luận |
| Lỗi / thất bại | Chưa … được | Lỗi, Thất bại, Sai, Không thành công | Code v1 dùng mẫu "Chưa …": "Chưa lưu được", "Chưa gửi được", "Chưa mở được bằng Face ID" — mềm, không đổ lỗi |
| Xoá | Xoá | Huỷ bỏ, Loại bỏ, Delete | "Xoá" là nhãn nút đã có (I18N #9); "Huỷ" chỉ dùng cho huỷ job/lịch, không dùng cho xoá dữ liệu |
| Lưu | Đã lưu | Lưu thành công, Đã lưu thành công | "Đã lưu" đủ; thêm "thành công" là thừa |
| Gửi tin | Gửi, Nhắn | Gửi đi, Truyền tin | Động từ đơn |
| Bắt đầu | Bắt đầu | Khởi tạo, Thiết lập | Tránh từ kỹ thuật trong giao diện người dùng |
| Cài đặt | Cài đặt | Cấu hình, Tuỳ chỉnh hệ thống | "Cài đặt" là nhãn đã có (I18N #61) |
| Ảnh đã xong | Ảnh … đã xong | Ảnh đã hoàn thiện, Ảnh đã hoàn tất | "Xong" là từ bước cuối pipeline (I18N #43) — nhất quán |
| Chào khách | Chào {ten} | Kính chào, Dear, Hi | "Chào {ten}," mở đầu mọi mẫu email (MESSAGE-TEMPLATES.md) |
| Cảm ơn | Cảm ơn bạn! / Cảm ơn bạn rất nhiều! | Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ | Câu cảm ơn trong code ngắn, có dấu chấm than, không kèm "dịch vụ" |

Quy tắc chung khi phân vân giữa hai từ: **chọn từ ngắn hơn, chọn từ đã có trong code v1, chọn từ người chụp ảnh ngoài đời vẫn nói.**

## 6. Ví dụ đúng / sai theo loại câu

### 6.1. Thông báo (toast, banner)

| Tình huống | ✅ Đúng | ❌ Sai | Ghi chú |
|---|---|---|---|
| Lưu xong | Đã lưu | Lưu thành công! Dữ liệu của bạn đã được lưu. | Thừa chữ, thừa dấu chấm than |
| Xoá xong | Đã xoá | Đã xoá thành công mục đã chọn. | "Thành công" thừa; không cần nói "mục đã chọn" |
| Lưu logo | Đã lưu logo studio | Logo studio đã được cập nhật thành công. | Bị động + dài |
| Nhận cọc | Mình nhận được cọc rồi nè {ten}! | Đã ghi nhận khoản đặt cọc từ khách hàng thành công. | Giọng hành chính, gọi khách là "khách hàng" |
| Giao ảnh xong | Ảnh buổi chụp {type} của bạn đã xong! | Ảnh của quý khách đã hoàn thiện và sẵn sàng để tải xuống. | "Quý khách", "hoàn thiện", "tải xuống" đều sai giọng |

### 6.2. Nút bấm

| Tình huống | ✅ Đúng | ❌ Sai | Ghi chú |
|---|---|---|---|
| Lưu form | Lưu | Lưu lại thông tin | Nút chỉ cần động từ |
| Ghi tiền vào | Ghi thu / Ghi chi | Thêm khoản thu nhập mới | Dài, dùng từ kế toán |
| Xong một bước pipeline | Xong bước này | Hoàn thành bước hiện tại | "Xong" là từ của pipeline |
| Thêm job vào lịch | Thêm vào Lịch iPhone | Thêm sự kiện vào ứng dụng Lịch | Nêu đúng tên nơi đến, ngắn |
| Nhập lịch | Nhập từ Lịch iPhone | Đồng bộ hoá dữ liệu lịch từ thiết bị | Từ kỹ thuật, dài |
| Khôi phục mẫu | Khôi phục mẫu gốc | Đặt lại về mẫu mặc định ban đầu | "Mẫu gốc" đã có trong code (I18N #71) |

### 6.3. Lỗi và trạng thái chưa xong — mẫu "Chưa … + cách sửa"

| Tình huống | ✅ Đúng | ❌ Sai | Ghi chú |
|---|---|---|---|
| Chưa nghe rõ giọng nói | Chưa nghe rõ — bấm micro nói lại nha | Lỗi nhận dạng giọng nói. Vui lòng thử lại. | Câu sai đổ lỗi cho hệ thống + "Vui lòng" |
| Chưa gửi được email | Chưa gửi được — kiểm tra mạng rồi thử lại | Gửi email thất bại. Lỗi: … | Không hiện mã lỗi kỹ thuật cho người dùng |
| Chưa mở được Face ID | Chưa mở được bằng Face ID — thử lại hoặc dùng mã PIN | Xác thực sinh trắc học không thành công. | Từ kỹ thuật, không chỉ cách sửa |
| Chưa có email khách | Chưa có email khách — bấm Sửa để thêm | Thiếu thông tin bắt buộc: email khách hàng. | Nghe như biểu mẫu phạt |
| Chưa cho phép đọc lịch | Chưa cho phép đọc Lịch iPhone — bật trong Cài đặt iPhone | Quyền truy cập lịch đã bị từ chối. | Nói rõ chỗ bật, không nói "bị từ chối" |
| Mất mạng khi kiểm tra | Chưa kiểm tra được, thử lại khi có mạng | Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền. | Câu đúng nói việc + thời điểm thử lại |
| Chưa thêm được ảnh | Chưa thêm được ảnh — máy có thể đang hết dung lượng | Thêm ảnh thất bại do lỗi hệ thống. | Câu đúng đoán nguyên nhân thường gặp nhất, không đổ lỗi chung chung |

Nguyên tắc lỗi: **không bao giờ hiện mã lỗi, tên lỗi kỹ thuật (`NotAllowedError`, `500`, `timeout`) trong câu người dùng đọc.** Ghi lỗi kỹ thuật vào log, câu hiển thị chỉ nói việc + cách sửa.

### 6.4. Nhắc tiền — cọc và thu nốt

Nhắc tiền tuân thủ thêm 3 quy tắc (đã ghi trong `MESSAGE-TEMPLATES.md`, nhắc lại ở đây vì hay bị viết sai):

1. **Nhắc cọc thì nhắc 1 lần, khéo léo.** Nhắn lại tối đa 1 lần sau 2 ngày không trả lời, rồi giữ lịch thêm 2 ngày nữa mới nhả.
2. **Nhắc thu nốt đi kèm giao ảnh, không tách riêng.** Khách vừa nhận ảnh là lúc dễ trả nhất.
3. **Nói số tiền cụ thể + việc cụ thể, không nói chung chung.** "Còn thiếu 10.000.000₫" rõ hơn "Bạn còn nợ tiền".

| Tình huống | ✅ Đúng | ❌ Sai | Ghi chú |
|---|---|---|---|
| Nhắc cọc lần đầu | Lịch chụp {type} ngày {date} mình đang giữ cho bạn, bạn chuyển giúp mình {dep} để giữ lịch chắc chắn nhé. | Bạn chưa chuyển cọc. Vui lòng thanh toán {dep} để giữ lịch, nếu không lịch sẽ bị huỷ. | Câu sai đe doạ huỷ lịch + "Vui lòng thanh toán" |
| Nhắc thu nốt kèm giao ảnh | Ảnh buổi chụp {type} của bạn xong rồi nè. Bạn xem và tải ảnh ở đây: {drive}. Phần còn lại {owe} bạn chuyển giúp mình khi tiện nhé. | Ảnh đã xong. Bạn còn nợ {owe}, đề nghị thanh toán ngay. | "Còn nợ", "đề nghị thanh toán ngay" — giọng đòi nợ |
| Nhãn số tiền trong app | Còn thiếu 10.000.000₫ | Dư nợ: 10.000.000₫ | "Dư nợ" là từ kế toán |
| Cảnh báo job Xong mà còn thiếu tiền | Job xong rồi mà còn thiếu {owe} — nhắn khách thu nốt nhé | Cảnh báo: job đã hoàn thành nhưng vẫn còn công nợ chưa thu hồi. | Câu đúng nói với người dùng app (nhiếp ảnh gia), chỉ việc cần làm |
| Hỏi cọc ở bước Chốt cọc | Ghi cọc đã nhận (nếu có) | Nhập số tiền đặt cọc trước đã thu | Dài, từ hành chính |

### 6.5. Nhắc lịch và job kẹt

| Tình huống | ✅ Đúng | ❌ Sai | Ghi chú |
|---|---|---|---|
| Nhắc lịch chụp ngày mai | Mai {date} {time} mình chụp {type} ở {loc} nhé. Bạn tới sớm 10–15 phút giúp mình. | Nhắc nhở: bạn có lịch hẹn chụp ảnh vào ngày mai. Vui lòng đến đúng giờ. | Câu sai vô hồn, không có thông tin cụ thể |
| Job kẹt (thông báo trong app) | Job kẹt ở bước {stage} | Job của bạn đã bị trễ tại giai đoạn {stage} quá lâu. | "Kẹt" + tên bước, không thêm "quá lâu" |
| Màn hình Hôm nay không có job | Hôm nay thong thả lắm | Hôm nay bạn không có buổi chụp nào được lên lịch. | Câu đúng là câu đã có trong code (I18N #12) |
| Màn hình trống sổ tiền | Chưa có khoản thu nào. | Không có dữ liệu giao dịch. | "Chưa có" mở, "Không có dữ liệu" đóng |

## 7. Quy tắc riêng cho tiền và số

- **Định dạng (giữ nguyên theo `I18N-STRINGS.md`):** VND hiển thị `1.000.000₫` (vi-VN), USD hiển thị `$1,000.00` (en-US). **Chỉ đổi hiển thị, không quy đổi tỷ giá.**
- **Viết số tiền đầy đủ, không rút gọn:** viết `15.000.000₫`, không viết `15tr` trong app và mẫu tin (15tr chỉ là cách nói miệng). Ngoại lệ duy nhất: bảng giá nháp trong tài liệu nội bộ, không phải chuỗi trong app.
- **Đơn vị tiền luôn đi kèm số:** "Cọc 5.000.000₫", không viết "Cọc 5.000.000" trơ trọi.
- **Không dùng từ "giá rẻ / ưu đãi / khuyến mãi" trong app.** FotoBro không phải app bán hàng; giá là giá studio tự đặt trong Cài đặt → Bảng giá.
- **Giá film và giá digital không lẫn nhau:** job "Cả hai" cộng cả hai bảng giá; mẫu báo giá chỉ hiện `{price}` là tổng đã cộng (đã ghi trong `MESSAGE-TEMPLATES.md`).
- **Không làm tròn số tiền khi nhắc khách:** nhắc đúng số còn thiếu, không viết "khoảng" hay "tầm".

## 8. Quy tắc tên riêng — không dịch, không đổi

- **FotoBro:** không dịch, không viết "Phô-tô-Bro", không viết thường "fotobro" trong câu hiển thị.
- **Tên 6 phòng ban giữ tiếng Việt + chú thích tiếng Anh** (I18N #55–60): Sen — Đón khách, Nắng — Buổi chụp, Mây — Hậu kỳ, Lúa — Tiền bạc, Trăng — Kể chuyện, Đèn — Giữ đồ. Không dịch "Sen" thành "Lotus" làm tên chính.
- **Digital / Film / Cả hai:** giữ nguyên từ "Digital", "Film" (I18N #33–34); "Cả hai" là nhãn hiển thị cho Both.
- **Loại chụp:** nhãn tiếng Việt Chân dung / Cặp đôi / Cưới / Lookbook / Sự kiện (I18N #28–32). "Lookbook" giữ nguyên vì không có từ Việt tương đương ngắn gọn.
- **Tên bước pipeline giữ nguyên thứ tự và tên** (I18N #36–43): Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong. Không đổi tên bước để "nghe hay hơn".
- **Tên tính năng iOS giữ đúng tên Apple dùng:** "Lịch iPhone", "Face ID". Không viết "Lịch Apple" hay "mở khoá khuôn mặt".

## 9. Checklist trước khi thêm chuỗi tiếng Việt mới

1. Câu có ≤ 15 từ không? Nút ≤ 2 từ, toast ≤ 6 từ?
2. Xưng hô có phải mình / bạn không? Có "tôi", "quý khách", "anh/chị/em" lọt vào không?
3. Có hạt `ạ` trong giao diện app không? (Chỉ được có trong mẫu gửi khách.)
4. Lỗi có theo mẫu "Chưa … + cách sửa" không? Có mã lỗi kỹ thuật lọt vào câu hiển thị không?
5. Từ về tiền có đúng bảng §5 không? ("Còn thiếu", không phải "Còn nợ".)
6. Từ này đã dùng ở chỗ khác chưa? Nếu rồi, dùng đúng từ cũ — không sáng tạo từ đồng nghĩa mới.
7. Tên riêng có đúng §8 không? (FotoBro, tên phòng ban, Digital/Film, tên bước.)
8. Số tiền có đủ đơn vị ₫ / $ và đúng định dạng §7 không?
9. Đọc to câu lên: có nghe như một người đang nói với chủ studio không? Nếu nghe như văn bản hành chính, viết lại.
10. Thêm chuỗi vào `I18N-STRINGS.md` (đánh số tiếp, ghi rõ CÓ/MỚI) rồi mới đưa vào code — không thêm chuỗi chỉ trong code.

## 10. Ngoại lệ duy nhất — mẫu gửi khách khác giọng app

Mẫu email / nhắn nhanh trong `MESSAGE-TEMPLATES.md` được phép **lịch sự hơn một bậc** so với giao diện app, vì người đọc là khách:

- Được dùng `ạ` ("Chào {ten} ạ", "nhắn mình một tiếng ạ").
- Được dùng câu dài hơn một chút (tối đa 2 câu / đoạn, mỗi câu ≤ 20 từ) vì email cần đủ thông tin (ngày, giờ, địa điểm, giá).
- Được mở đầu bằng "Chào {ten}," và kết bằng "Cảm ơn bạn!" + chữ ký `{sign}`.
- Nhưng **vẫn cấm** "quý khách", "Kính gửi", "Vui lòng thanh toán", "còn nợ", "đề nghị thanh toán".
- Người dùng được sửa mẫu theo giọng của mình trong Cài đặt → Mẫu tin nhắn / email; nút "Khôi phục mẫu gốc" trả về đúng các mẫu trong tài liệu này.
