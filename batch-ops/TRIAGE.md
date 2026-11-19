# FotoBro — Quy trình phân loại ticket hỗ trợ (TRIAGE)

- Phạm vi: FotoBro iOS v1, Bundle ID `com.fotobro.app`, repo `Hoangviet1397/fotobro`.
- Team: 1–2 người. Mục tiêu của file này: ticket nào cũng có người nhận, có mức độ, có câu trả lời đầu tiên đúng hạn — không ticket nào chìm.
- Nguyên tắc nền (nhắc lại trước mọi quyết định): app v1 local-first, dữ liệu chỉ nằm trên iPhone người dùng, không máy chủ, không tài khoản. **Không thể khôi phục dữ liệu giúp người dùng, không thể mở khoá PIN từ xa, không xem được dữ liệu của họ.** Mọi hướng xử lý phải xuất phát từ đó — đừng hứa điều app không làm được.

## 1. Kênh nhận ticket

| Kênh | Trạng thái | Cách xử lý |
|---|---|---|
| Email `support@fotobro.app` | ⚠️ **Chưa có thật** — domain chưa mua, mailbox chưa tạo. Chưa công bố là kênh chính thức cho tới khi mua domain + tạo mailbox + test gửi/nhận. | Khi email sẵn sàng: kiểm tra hộp thư 1 lần/ngày. Trước đó, trang Hỗ trợ (`SUPPORT.html`) và Help Center trong app vẫn ghi địa chỉ này — coi đó là việc cần sửa sau khi mailbox xong, đừng trả lời ticket ở một hộp thư không tồn tại. |
| TestFlight feedback | Kênh chính trong giai đoạn beta. | Đọc kèm crash log / ảnh chụp màn hình TestFlight gửi kèm. Trả lời qua TestFlight hoặc email người gửi nếu có. |
| GitHub Issues — repo `fotobro` | Kênh chính cho báo lỗi kỹ thuật (kể cả sau khi lên App Store). | Mọi lỗi xác nhận được đều phải có 1 Issue. Ticket email/TestFlight trùng lỗi thì link về Issue đó, không mở Issue mới. |

- Quy tắc chung: **mọi ticket, dù từ kênh nào, đều ghi vào 1 danh sách duy nhất** (bảng theo dõi Issue GitHub, hoặc 1 file/sheet chung nếu chưa quen GitHub). Không xử lý ticket chỉ trong đầu, chỉ trong email, hay chỉ trong tin nhắn riêng.
- Ticket trùng nhau: giữ lại ticket tới trước (hoặc ticket có thông tin đầy đủ nhất), các ticket sau ghi chú "trùng #N" rồi đóng.

## 2. Thông tin cần hỏi ngay (checklist tiếp nhận)

Hỏi 1 lần, đủ ý, đừng hỏi rải rác nhiều vòng. Nếu ticket đã có đủ thì bỏ qua bước này.

1. Mẫu iPhone + phiên bản iOS (VD: iPhone 13, iOS 18.5).
2. Phiên bản FotoBro (VD: v1.0, build TestFlight số mấy).
3. Các bước làm ra lỗi (làm gì → bấm gì → thấy gì).
4. Ảnh chụp màn hình / quay màn hình lỗi (nếu có).
5. Lỗi xảy ra lần đầu hay lặp lại? Sau khi cập nhật mới bị, hay từ trước đã bị?
6. Đã thử chưa: tắt hẳn app mở lại, khởi động lại máy, còn dung lượng trống không?
7. Riêng ticket mất dữ liệu / khoá: đã có file sao lưu `fotobro-sao-luu.json` chưa, sao lưu lần cuối khi nào?

**Không bao giờ hỏi:** mã PIN, mật khẩu máy, mật khẩu Google, mã Face ID, và **không yêu cầu gửi file sao lưu đầy đủ** (trong đó có dữ liệu khách hàng của họ). Chỉ xin ảnh chụp màn hình đã che tên/số tiền nhạy cảm nếu cần.

## 3. Phân loại theo mức độ

| Mức | Định nghĩa | Ví dụ | Trả lời đầu tiên | Mục tiêu xử lý |
|---|---|---|---|---|
| **P0 — Khẩn** | App không dùng được, hoặc mất / sai dữ liệu tiền, hoặc nhiều người cùng bị. | App crash ngay khi mở; mở app mất hết job; số tiền cọc/thu nốt tính sai; khoá PIN kẹt không vào được dù Face ID đúng. | Trong **4 giờ làm việc** (ngày thường) | Có hướng xử lý tạm trong 24h; bản sửa ưu tiên cao nhất, chuyển ngay cho người làm app (mục 6). |
| **P1 — Cần sửa sớm** | Một tính năng chính hỏng, nhưng có cách vòng qua; hoặc lỗi ít người gặp nhưng rõ ràng. | Nhập Lịch iPhone không ra sự kiện; đăng nhập Google báo lỗi; nhắc lịch không kêu; job kẹt không nhảy bước được; sao lưu/khôi phục báo lỗi. | Trong **24 giờ** | Xác nhận + ghi Issue trong 2 ngày làm việc; sửa trong bản cập nhật gần nhất. |
| **P2 — Câu hỏi** | Người dùng chưa biết dùng, hoặc chưa rõ app làm gì / không làm gì. | "Quên PIN thì sao?", "Đổi máy thì chuyển dữ liệu thế nào?", "Bảng giá có áp cho job cũ không?", "CloudKit khi nào có?" | Trong **24 giờ** | Trả lời dứt điểm bằng Help Center / trang Hỗ trợ; nếu câu hỏi lặp lại ≥ 3 lần thì bổ sung vào Help Center. |
| **P3 — Góp ý** | Đề xuất tính năng mới, chê giao diện, xin thêm lựa chọn. | "Thêm Kanban kéo thả", "Cho đổi tên phòng ban", "Thêm checklist theo bước", "Muốn dark mode đậm hơn". | Trong **48 giờ** | Ghi nhận + gắn nhãn `enhancement`, đưa vào danh sách cân nhắc bản sau. Không hứa ngày ra mắt. |

- Chưa chắc mức nào → xếp cao hơn 1 bậc rồi hạ sau khi xác minh, đừng xếp thấp rồi bỏ sót.
- P0 ngoài giờ làm việc: ghi nhận ngay, trả lời đầu tiên vào sáng hôm sau; chỉ gọi/báo gấp cho người làm app nếu app sập diện rộng (nhiều ticket cùng lỗi trong 1 ngày).

## 4. Phân loại theo tính năng (nhãn)

Dán **1 nhãn mức độ + 1 nhãn tính năng chính** cho mỗi ticket. Nhãn tính năng:

| Nhãn | Gồm những gì |
|---|---|
| `job` | Tạo/sửa/xoá job, thông tin khách, loại chụp, giá, màn hình Hôm nay. |
| `pipeline` | 8 bước Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong; nhảy bước, job kẹt, Huỷ/Không chốt, khôi phục. |
| `tien` | Sổ tiền, cọc, thu nốt, cảnh báo còn thiếu tiền khi bấm Xong, báo cáo ngày/tuần/tháng, bảng giá (kể cả bảng giá film). |
| `lich` | Nhắc lịch trong app, nhập từ Lịch iPhone (30 ngày), nút "Thêm vào Lịch iPhone", hạn giao ảnh. |
| `google` | Đăng nhập Google 1 chạm, Lịch Google, Gmail (tiền về, khách hỏi chụp), Danh bạ, Drive, gửi email cho khách. |
| `sao-luu` | Xuất/nhập file `fotobro-sao-luu.json`, đổi máy, mất dữ liệu, dung lượng file sao lưu. |
| `khoa` | PIN, Face ID, màn hình khoá, quên PIN. |
| `giao-dien` | Hiển thị, màu chủ đề, ngôn ngữ Việt/Anh, tiền tệ VND/USD, chữ tràn màn hình nhỏ, dark mode. |
| `khac` | Cài đặt chung, thông báo, giọng nói, App Store/TestFlight, tài khoản/thu phí (Nấc 2/3 — v1 chưa có, chỉ giải đáp). |

- Ticket chạm 2 tính năng (VD: tiền + lịch): lấy tính năng gây lỗi chính, ghi tính năng phụ trong nội dung.
- Nhãn `tien` + `sao-luu` mà liên quan mất dữ liệu: luôn kiểm tra xem có phải P0 không trước khi dán P1.

## 5. Mẫu trả lời đầu tiên (copy-paste, sửa tên + chi tiết)

Giọng văn: ngắn, tiếng Việt, xưng "FotoBro", không hứa hẹn quá. Nếu người dùng viết tiếng Anh thì trả lời tiếng Anh tương đương.

### 5.1. P0 — Khẩn (app không mở được / mất dữ liệu)

> Chào bạn, FotoBro đã nhận được báo lỗi của bạn và đang ưu tiên xử lý. Bạn thử giúp mình theo thứ tự này trước nhé: 1) Tắt hẳn app rồi mở lại. 2) Khởi động lại iPhone. 3) Kiểm tra còn dung lượng trống và đang dùng bản FotoBro mới nhất. **Nếu app còn mở được, bạn xuất 1 bản sao lưu ngay (Cài đặt → Sao lưu) trước khi xoá hay cài lại app.**
> Bạn gửi thêm giúp mình: mẫu iPhone, phiên bản iOS, phiên bản FotoBro, và ảnh chụp màn hình lỗi. Mình sẽ báo lại bạn trong hôm nay.

Lưu ý: với ticket mất dữ liệu, nói rõ ngay: *"FotoBro lưu dữ liệu chỉ trên máy bạn nên chúng mình không khôi phục được từ xa — cách duy nhất là nhập lại file sao lưu bạn đã xuất trước đó."* Đừng để người dùng chờ một cách khôi phục không tồn tại.

### 5.2. P1 — Cần sửa sớm (tính năng hỏng)

> Chào bạn, cảm ơn bạn đã báo lỗi. Mình đã ghi nhận và chuyển cho bộ phận kỹ thuật kiểm tra. Bạn cho mình xin thêm: mẫu iPhone, phiên bản iOS, phiên bản FotoBro, và các bước bạn làm ra lỗi (kèm ảnh chụp màn hình nếu có) để mình tái hiện lại cho chính xác nhé. Mình sẽ cập nhật cho bạn khi có bản sửa.

### 5.3. P2 — Câu hỏi (hướng dẫn sử dụng)

> Chào bạn, [trả lời ngắn 2–3 câu theo Help Center / trang Hỗ trợ]. Bạn xem thêm tại Cài đặt → Trợ giúp trong app, hoặc trang hỗ trợ của FotoBro. Nếu làm theo mà vẫn không được, bạn nhắn lại giúp mình ảnh chụp màn hình nhé.

Ví dụ — quên PIN: *"Mã PIN chỉ lưu trên iPhone của bạn, chúng mình không giữ bản sao và không mở khoá được từ xa. Bạn mở app bằng Face ID rồi vào Cài đặt để đặt lại PIN mới. Nếu quên cả Face ID lẫn PIN thì phải xoá dữ liệu app và khôi phục từ file sao lưu đã xuất trước đó."*

### 5.4. P3 — Góp ý

> Chào bạn, cảm ơn góp ý của bạn! Mình đã ghi lại đề xuất "[tóm tắt 1 dòng]" vào danh sách cải tiến của FotoBro để cân nhắc cho bản cập nhật sau. Hiện team nhỏ nên mình chưa hứa được thời gian cụ thể, nhưng góp ý của bạn sẽ được xem xét cùng các đề xuất khác nhé.

### 5.5. Ticket thiếu thông tin (mọi mức)

> Chào bạn, để mình kiểm tra đúng lỗi bạn gặp, bạn gửi thêm giúp mình: mẫu iPhone, phiên bản iOS, phiên bản FotoBro bạn đang dùng, và các bước làm ra lỗi (kèm ảnh chụp màn hình nếu có). Cảm ơn bạn!

## 6. Khi nào chuyển cho người làm app xử lý

**Chuyển ngay (không tự xử lý):** mọi P0; mọi P1 đã xác nhận tái hiện được; lỗi liên quan tiền tính sai; lỗi sao lưu/khôi phục; crash lặp lại; lỗi bảo mật/khoá.

**Tự xử lý, không chuyển:** P2 trả lời được bằng Help Center; P3 chỉ ghi nhận; ticket trùng; ticket thiếu thông tin (hỏi lại trước, chỉ chuyển khi người dùng bổ sung đủ mà vẫn lỗi).

**Nội dung bàn giao cho người làm app (ghi trong Issue GitHub, không chuyển nguyên email dài):**

- Tiêu đề: `[mức độ] [tính năng] mô tả ngắn` — VD: `[P0] [tien] Thu nốt không trừ cọc, tổng tiền sai`.
- Mô tả: lỗi là gì, kết quả mong đợi vs thực tế.
- Các bước tái hiện (đánh số, càng ngắn càng tốt).
- Môi trường: mẫu iPhone, iOS, phiên bản FotoBro, tài khoản TestFlight hay App Store.
- Ảnh chụp màn hình / quay màn hình, crash log (nếu có).
- Tần suất: 1 người hay nhiều người, lần đầu hay lặp lại.
- Đã thử cách vòng qua nào chưa, kết quả ra sao.

**Sau khi chuyển:** người phân loại vẫn là đầu mối trả lời người dùng (báo "đã chuyển kỹ thuật", báo tiến độ, báo khi có bản sửa). Người làm app chỉ tập trung sửa, không trả lời trực tiếp người dùng trừ khi được nhờ.

## 7. Quy trình xử lý 1 ticket (tóm tắt)

1. **Nhận** → ghi vào danh sách chung trong ngày, đừng để ticket nằm riêng trong 1 hộp thư.
2. **Phân loại** → dán mức độ (mục 3) + nhãn tính năng (mục 4). Chưa rõ thì xếp cao hơn 1 bậc.
3. **Trả lời đầu tiên** → dùng mẫu mục 5, đúng hạn mục 3. Thiếu thông tin thì hỏi theo checklist mục 2.
4. **Xử lý** → P2/P3 tự trả lời; P0/P1 xác nhận tái hiện rồi chuyển theo mục 6.
5. **Theo dõi** → mỗi ticket có trạng thái: Mới / Đang hỏi thêm / Đã chuyển kỹ thuật / Chờ bản sửa / Đã trả lời / Đóng.
6. **Đóng** → chỉ đóng khi: đã trả lời dứt điểm (P2), đã có bản sửa và người dùng xác nhận hết lỗi (P0/P1), hoặc người dùng 7 ngày không trả lời sau 1 lần nhắc. Ghi lý do đóng ngắn gọn.

## 8. Việc lặp lại hằng tuần (15 phút)

- Rà soát ticket còn mở quá hạn (P0 > 24h chưa có hướng xử lý, P1 > 1 tuần chưa có Issue).
- Đếm ticket theo nhãn tính năng: nhãn nào tăng đột biến thì báo người làm app xem có lỗi theo lô không.
- Câu hỏi nào lặp lại ≥ 3 lần → bổ sung vào Help Center / trang Hỗ trợ.
- Góp ý P3 nào được nhiều người xin → đưa lên đầu danh sách cân nhắc bản sau.

## 9. Những điều không làm

- Không hứa ngày ra bản sửa, ngày có tính năng mới, hay giá Nấc 2/3 (v1 chưa chốt).
- Không hứa khôi phục dữ liệu, mở khoá PIN, hay xem dữ liệu trên máy người dùng.
- Không xin mật khẩu, mã PIN, file sao lưu đầy đủ, hay thông tin khách hàng của người dùng.
- Không tranh luận với người dùng về lỗi là "do họ dùng sai" — nếu nhiều người vấp cùng 1 chỗ thì đó là lỗi của app/hướng dẫn, ghi nhận và sửa.
- Không xoá ticket, không đóng ticket chỉ vì "khó tái hiện" khi chưa hỏi đủ thông tin.

---

- File này thuộc batch FotoBro iOS v1, thư mục `batch-ops/`. Cập nhật khi: email hỗ trợ chính thức hoạt động, app lên App Store, hoặc có thêm kênh nhận ticket mới.
- Tài liệu liên quan: `HELP-CENTER.md`, `SUPPORT.html`, `PRIVACY.md` (giới hạn local-first), repo Issues `Hoangviet1397/fotobro`.
