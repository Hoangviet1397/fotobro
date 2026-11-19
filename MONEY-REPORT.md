# FotoBro — Thiết kế cải tiến báo cáo tiền bạc (v1.1)

> Phạm vi: **thiết kế cho v1.1, KHÔNG làm ở v1**. Chỉ đọc code sổ tiền hiện có
> trong `www/index.html`, không sửa code. Mọi tính năng dưới đây đều chạy
> local-first (dữ liệu chỉ trên máy, không tài khoản, không máy chủ), đúng
> mô hình FotoBro v1.

## 0. Hiện trạng đã có trong app (đọc từ code thật, 20/11/2026)

### 0.1. Dữ liệu đã có — dùng được ngay, không cần thêm

| Dữ liệu | Nguồn trong code | Ghi chú |
|---|---|---|
| Khoản thu/chi `txs[]` | `cleanData()` | Mỗi khoản: `id, kind ('thu'/'chi'), category, jobId ('' = khoản chung), amount (> 0, số nguyên VND), date ('YYYY-MM-DD'), method, note, src` |
| Job `jobs[]` | `cleanData()` | `id, client, type (Portrait/Couple/Wedding/Lookbook/Event/Khác), medium (Digital/Film/Cả hai), stage (8 bước), cancelled, shootDate, deadline, price, phone, email, stageSince` |
| Hạng mục thu | `THU_CATS` (dòng 805) | 10 hạng mục: Cọc, Tiền sau buổi chụp, Tiền sau khi giao ảnh, Thêm giờ chụp, Thêm địa điểm, Thêm ảnh retouch, Lấy file gốc, Album thêm, In thêm ảnh, Thu khác |
| Hạng mục chi | `CHI_GROUPS` (dòng 806) | 4 nhóm / 20 hạng mục: chi cho buổi chụp, chi vận hành hằng tháng, chi thiết bị & dài hạn, chi khác (gồm Khấu hao thiết bị, Thuế & phí ngân hàng) |
| Tiền đã thu / đã chi / còn thiếu / lời từng job | `jobThu(id)`, `jobChi(id)`, `jobOwe(j) = max(0, price − jobThu)`, `profit = jobThu − jobChi` | Đã dùng trong chi tiết job (`infoRow`) và tab Tiền bạc |
| Tổng còn thiếu | `totalOwe()` | Cộng `jobOwe` của job chưa `Xong` và chưa `cancelled` |
| Tháng hiện tại | `monthOf(s) = s.slice(0,7)`, `thisMonth()`, `monthTxs(kind)`, `sum(arr)` | Chỉ lọc tháng hiện tại, chưa có chọn tháng khác hay lịch sử nhiều tháng |
| Định dạng tiền | `fmt()` (VND `vi-VN` / USD `en-US`, chỉ đổi hiển thị, không quy đổi tỷ giá), `fmtParts`/`fmtShort`/`fmtTiny` | Giữ nguyên ở v1.1 |
| Cài đặt liên quan | `DEFAULT_CFG`: `depositPct` (mặc định 40%), `deliverDays` (14), `equipment[]` (khấu hao), `fixed[]` (chi cố định), `locale` vi/en, `currency` VND/USD | Khấu hao ghi vào sổ bằng 1 nút (`DEP_NOTE`, dòng 2471) |

### 0.2. Báo cáo đã có trong v1

- **Tab Tiền bạc** (`renderMoney()`, `view-money`): 4 ô lớn tháng này —
  Thu / Chi / Lời / Khách còn thiếu; danh sách lời từng job (`#jobProfit`,
  job đã xong gom vào nút "Xem thêm" khi > 6 job); danh sách khoản thu chi
  gom theo ngày (`#txList`), lọc `all / thu / chi / month`.
- **Phòng Tiền Bạc (Lúa)** (`deptLines('tienbac')`): 4 dòng chữ — thu/chi/lời
  tháng này, tổng còn thiếu, khoản chi lớn nhất tháng (`biggestChiCat()`),
  khấu hao thiết bị tháng này đã ghi hay chưa.
- **Báo cáo cuối ngày** (`dailyReportText()`): văn bản thuần, có nút Chép và
  Chia sẻ (`navigator.share`). Không có bảng, không có biểu đồ, không xuất file.
- **Trợ lý hỏi đáp** (`answer()`): đã trả lời "Ai chưa trả tiền?"
  (`debtorsText()`), "Tháng này lời bao nhiêu?", "Chi nhiều nhất vào đâu?",
  "Job lời nhất tới giờ" — dùng đúng các hàm trên.
- **Nhắc tiền đã có, nhưng thủ công:** vào bước "Đã giao" thì gợi ý email
  (`suggestEmail(j, 'deliver')`); bấm "Xong" khi còn thiếu tiền thì hiện
  cảnh báo + nút "Thu nốt"; màn hình Hôm nay liệt kê job còn thiếu
  (`todayItems()`). Chưa có nhắc tự động theo lịch.

### 0.3. Những gì CHƯA có (và v1.1 phải xử lý)

- Không có biểu đồ nào (`chart`/`canvas` cho biểu đồ = 0; 3 lần `canvas` trong
  code là cho ảnh, không phải biểu đồ). Không có xem theo tuần, không chọn
  tháng/năm, không lịch sử nhiều tháng.
- Không có xếp hạng loại job theo lãi, không có danh sách "thiếu nhiều nhất"
  tách riêng (chỉ có tổng `totalOwe()` và từng job lẻ trong `#jobProfit`).
- Không xuất CSV/Excel (`CSV`/`xlsx` = 0). Chỉ có sao lưu JSON nguyên bộ
  (`fotobro-sao-luu.json`: `{jobs, txs, cfg}`) và chép văn bản báo cáo.
- Không có nhắc tự động: không dùng `Notification` (0 lần trong code), không
  có trường `dueDate` / `lastRemindedAt` / `remindCount` trên job hay tx,
  không có hẹn giờ nhắc trong Cài đặt.
- Lợi nhuận hiện tại là **lợi nhuận trực tiếp từng job** (`jobThu − jobChi`
  của job đó) — chưa trừ chi chung (vận hành, khấu hao, quảng cáo) nên không
  được gọi là "lãi ròng" khi báo cáo tổng.

---

## 1. Biểu đồ thu/chi theo tháng

**Mục đích:** nhìn 1 giây biết tháng nào thu nhiều, tháng nào chi lấn, lời
tháng này so với các tháng trước ra sao — thay cho 4 ô số chỉ của tháng hiện tại.

**Thiết kế:**
- Vị trí: đầu tab Tiền bạc, ngay dưới 4 ô Thu / Chi / Lời / Còn thiếu (giữ
  4 ô, không thay).
- Dạng biểu đồ: cột nhóm theo tháng (cột xanh = thu, cột đỏ = chi), đường
  hoặc cột mờ thứ ba = lời (thu − chi, có thể âm). Mặc định hiện 6 tháng gần
  nhất, có nút cuộn/xem thêm 12 tháng. Chạm vào 1 cột thì hiện số chi tiết
  tháng đó và lọc danh sách khoản bên dưới theo tháng đó.
- Chọn kỳ: thêm bộ chọn Tháng / 6 tháng / 12 tháng / Năm nay ở đầu tab.
  Mặc định là tháng hiện tại như v1.
- Vẽ bằng gì: **không thêm thư viện nặng**. Vẽ bằng SVG/canvas thuần trong
  app (cùng phong cách tối giản Apple Music của v1), hoặc dùng 1 thư viện
  nhỏ offline nếu cần — quyết lúc code, không quyết ở đây. Tuyệt đối không
  gọi API biểu đồ online (app local-first, v1 đã bỏ offline).
- Hiển thị số: dùng `fmtShort()` cho nhãn trục (vd: 12tr), `fmt()` đầy đủ
  khi chạm vào cột. Tôn trọng `currency` VND/USD như v1.

**Dùng dữ liệu đã có:** toàn bộ — `txs[].date` (cắt `YYYY-MM`) + `kind` +
`amount`. Gom theo tháng bằng `monthOf()` đã có, chỉ cần viết thêm hàm gom
nhiều tháng (hiện `monthTxs()` chỉ lấy tháng hiện tại).

**Cần thêm:** không cần thêm trường dữ liệu. Chỉ cần lưu lựa chọn kỳ xem
(`reportRange: 'month' | '6m' | '12m' | 'year'`) vào `cfg` để mở lại vẫn nhớ.

**Trường hợp biên:**
- Tháng không có khoản nào: hiện cột 0, không bỏ tháng đó khỏi trục (trục
  thời gian phải liên tục, không nhảy tháng).
- Sổ trống (v1 seed đã trống, không còn job/tiền mẫu): hiện biểu đồ trống
  với dòng "Chưa có khoản nào — ghi khoản đầu tiên", không hiện trục rỗng.
- Tháng lời âm: cột lời hiện màu đỏ, ghi rõ "lỗ" thay vì "lời âm".

## 2. Top loại job có lãi nhất

**Mục đích:** biết gói nào nuôi studio (vd: Wedding lãi cao nhất dù ít job,
Portrait lãi thấp nhưng đều) để quyết định báo giá và nhận job.

**Thiết kế:**
- Vị trí: mục mới "Loại job nào lãi nhất" trong tab Tiền bạc, dưới biểu đồ
  tháng, trên danh sách lời từng job.
- Bảng xếp hạng theo **từng loại job** (`type`): mỗi dòng gồm tên loại,
  số job, tổng thu, tổng chi trực tiếp, **lời trực tiếp** (`Σ(jobThu − jobChi)`),
  lời trung bình / job, và % đóng góp vào tổng lời. Sắp xếp giảm dần theo
  lời trực tiếp. Loại chưa có job nào thì không hiện.
- Thêm 1 dòng chú thích ngay dưới bảng, bắt buộc: "Lời ở đây là thu − chi
  trực tiếp của job, chưa trừ chi chung (vận hành, khấu hao, quảng cáo).
  Xem lãi ròng ở mục tổng tháng." — tránh hiểu lầm con số.
- Tùy chọn ở v1.1 (không bắt buộc): cho chuyển cách xếp hạng giữa "Lời tổng"
  và "Lời trung bình / job" (2 chế độ xem, 1 nút chuyển). Nếu làm thì mặc
  định là "Lời tổng".

**Dùng dữ liệu đã có:** toàn bộ — `jobs[].type`, `jobThu()`, `jobChi()`,
`jobOwe()` không cần ở đây. Job `cancelled` và job chưa có khoản nào vẫn
tính (lời = 0 hoặc âm nếu đã chi), nhưng ghi rõ số job tính vào mỗi dòng.

**Cần thêm:** không cần thêm trường dữ liệu. Cần 1 tham số hiển thị duy
nhất: kỳ tính (theo tháng đang chọn ở mục 1 hay toàn bộ từ trước tới nay —
mặc định: theo kỳ đang chọn ở mục 1, để 2 mục khớp nhau).

**Trường hợp biên:**
- Loại job chỉ có 1 job lãi rất cao: hiện đúng, nhưng cột "lời trung bình"
  sẽ bằng lời tổng — không có cảnh báo đặc biệt, người dùng tự đọc số job.
- Tất cả các loại đều lỗ: bảng vẫn hiện, dòng đầu là "lỗ ít nhất", không
  giấu số âm.

## 3. Job còn thiếu tiền nhiều nhất

**Mục đích:** thu nốt tiền là việc quan trọng nhất của Phòng Tiền Bạc —
danh sách này là "to-do thu tiền", không phải chỉ là 1 con số tổng.

**Thiết kế:**
- Vị trí: mục mới "Cần thu nốt" trong tab Tiền bạc, đặt ngay dưới 4 ô đầu
  (trước cả biểu đồ), vì đây là hành động cần làm hôm nay.
- Mỗi dòng: tên khách, loại job + bước hiện tại (`stage`), số còn thiếu
  (`jobOwe`, đỏ, đậm), hạn giao (`deadline`, nếu có — quá hạn thì ghi đỏ
  "trễ X ngày"), nút nhanh "Nhắc khách" (mở mẫu tin nhắn nhắc khéo có sẵn)
  và "Ghi thu nốt" (mở form thu với số tiền = đúng số còn thiếu, như nút
  "Thu nốt" đã có ở bước "Xong").
- Sắp xếp: **số còn thiếu giảm dần** là mặc định; có nút chuyển sang sắp
  theo "hạn giao gần nhất" (job sắp quá hạn lên trước). Chỉ hiện job chưa
  `Xong`, chưa `cancelled`, `jobOwe > 0`.
- Cuối danh sách: 1 dòng tổng "Tổng còn thiếu: X — Y khách" (dùng
  `totalOwe()` đã có).

**Dùng dữ liệu đã có:** toàn bộ — `jobOwe()`, `stage`, `deadline`,
`shootDate`, `client`, `type`. Mẫu tin nhắn nhắc và form thu nốt đã có sẵn
trong v1, chỉ cần nối nút vào.

**Cần thêm:** không cần thêm trường cho v1.1 bản đầu. Nếu làm nhắc tự động
(mục 5) thì mới cần thêm trường (xem mục 5).

**Trường hợp biên:**
- Job chưa chốt giá (`price = 0`): `jobOwe = 0` nên không vào danh sách —
  đúng, vì chưa biết thiếu bao nhiêu; job đó vẫn hiện ở danh sách job thường.
- Job đã `Xong` mà vẫn thiếu tiền (người dùng bấm "Xong" kèm cảnh báo ở v1):
  đưa vào 1 mục riêng cuối danh sách, tiêu đề "Đã xong nhưng vẫn thiếu",
  để không bị quên.

## 4. Xuất CSV / Excel

**Mục đích:** đưa số liệu ra ngoài để đối chiếu với kế toán / ngân hàng /
bảng tính — JSON sao lưu hiện tại chỉ để khôi phục app, không đọc được
bằng Excel.

**Thiết kế:**
- Vị trí: 1 nút "Xuất báo cáo" trong tab Tiền bạc (cạnh nút lọc), mở sheet
  chọn: (a) **CSV tháng đang xem**, (b) **CSV toàn bộ**, (c) **CSV danh sách
  còn thiếu tiền**. Chỉ làm CSV ở v1.1; Excel `.xlsx` là bước sau (xem dưới).
- Định dạng CSV (quyết ở đây để lúc code không phải hỏi lại):
  - Mã hoá UTF-8 **có BOM** (để Excel trên Windows mở tiếng Việt không lỗi
    font), xuống dòng `\r\n`, phân tách bằng dấu phẩy, trường có dấu phẩy /
    xuống dòng thì bọc trong `"..."`.
  - Cột cho file thu/chi: `Ngày, Loại (Thu/Chi), Hạng mục, Khách / Job,
    Phương thức, Số tiền (VND), Ghi chú`. Số tiền là số nguyên, không có
    ký tự `₫` hay dấu phân cách trong file (để cộng được trong Excel).
  - Cột cho file còn thiếu tiền: `Khách, Loại job, Bước, Ngày chụp, Hạn giao,
    Giá job, Đã thu, Còn thiếu`.
  - Tên file: `fotobro-bao-cao-YYYY-MM.csv` (theo tháng đang xem) hoặc
    `fotobro-con-thieu-YYYY-MM-DD.csv`. Mở bằng Share Sheet của iOS
    (`navigator.share` với file, đã có mẫu dùng cho báo cáo văn bản) hoặc
    tải file như nút sao lưu JSON hiện tại.
- Excel `.xlsx`: **không làm ở v1.1**. Lý do: cần thêm thư viện (vd: SheetJS)
  làm tăng kích thước app và phải kiểm tra kỹ trên iOS; CSV mở được bằng
  Excel/Google Sheets là đủ. Nếu Việt vẫn cần `.xlsx` thì làm ở v1.2 với
  thư viện đã chọn và kiểm chứng riêng.

**Dùng dữ liệu đã có:** toàn bộ — `txs[]`, `jobs[]`, `jobThu()`,
`jobOwe()`, `fmt` chỉ dùng cho hiển thị trên màn hình, không dùng trong file.

**Cần thêm:** không cần thêm trường dữ liệu. Chỉ cần thêm 1 hàm xuất
(`exportCSV(range)`) và dùng lại `copyText`/`navigator.share` đã có. Cần
quyết lúc code: xuất trên iOS dùng Share Sheet hay tải file — ưu tiên Share
Sheet để gửi thẳng vào Excel/Drive/Mail.

**Trường hợp biên / an toàn:**
- Sổ trống: nút xuất vẫn bấm được, file CSV chỉ có dòng tiêu đề + 0 dòng
  dữ liệu, kèm toast "Sổ đang trống".
- Tên khách / ghi chú có dấu phẩy, xuống dòng, dấu `"`: phải escape đúng
  chuẩn CSV, kiểm tra bằng cách mở file bằng Excel thật trước khi giao.
- Không xuất kèm: số điện thoại, email, link Drive, link Facebook của
  khách — chỉ xuất dữ liệu tiền bạc cần cho kế toán. (Dữ liệu khách vẫn nằm
  trong file sao lưu JSON, không nằm trong CSV báo cáo.)

## 5. Nhắc thu nốt tự động

**Mục đích:** biến "nhắc khéo" từ việc người dùng phải tự nhớ thành việc
app tự nhắc đúng lúc — đây là tính năng có giá trị nhất trong 5 mục, vì
tiền thiếu mà quên nhắc là mất tiền thật.

**Thiết kế (2 tầng, làm theo thứ tự):**

### Tầng A — Nhắc trong app (làm trước, v1.1)
- Quy tắc nhắc (mặc định, cho phép đổi trong Cài đặt):
  1. Job sang bước **"Đã giao"** mà còn thiếu tiền → nhắc ngay hôm đó
     (đã có gợi ý email ở v1, nâng lên thành 1 thẻ nhắc cố định trên màn
     hình Hôm nay cho tới khi thu đủ hoặc người dùng bấm "Để sau").
  2. Job **quá hạn giao** (`deadline` đã qua) mà chưa tới "Đã giao" và còn
     thiếu tiền → nhắc mỗi ngày 1 lần.
  3. Job **kẹt ở 1 bước ≥ 7 ngày** (`stuckInfo()` đã có) và còn thiếu tiền
     → nhắc 1 lần khi vừa bị đánh dấu kẹt.
  4. Job đã **"Xong" nhưng vẫn thiếu tiền** → nhắc 1 lần sau 7 ngày kể từ
     ngày xong (trường hợp người dùng bấm "Xong" kèm cảnh báo ở v1).
- Mỗi lần nhắc: thẻ nhắc trên Hôm nay + dòng trong mục "Cần thu nốt"
  (mục 3) đổi trạng thái "Đã nhắc hôm nay". Mỗi thẻ có 2 nút: "Nhắn khách"
  (mở mẫu tin nhắn nhắc, dùng `MAIL_TPLS` / mẫu tin nhắn đã có) và
  "Đã thu nốt" (mở form thu). Nút "Để sau" ẩn thẻ tới ngày hôm sau.
- Tần suất: **tối đa 1 lần / job / ngày** cho mỗi quy tắc, không nhắc dồn
  nhiều lần trong ngày. Không nhắc job đã `cancelled`.

### Tầng B — Nhắc đẩy (push / local notification, làm sau, KHÔNG cam kết ở v1.1)
- Code hiện tại **không dùng `Notification` lần nào** và app không có
  backend, không có server gửi thông báo. Nhắc đẩy trên iOS cần thêm
  plugin Capacitor Local Notifications + quyền thông báo + đăng ký lịch
  nhắc trên máy. Đây là việc riêng, cần 1 thiết kế + kiểm chứng trên iPhone
  thật (không kiểm được trên Linux), nên để sau Tầng A, không gộp vào v1.1
  nếu thời gian gấp. Nếu làm, nhắc đẩy chỉ nhắc lại đúng các quy tắc Tầng A,
  không thêm quy tắc mới.

**Dùng dữ liệu đã có:** `jobOwe()`, `stage`, `deadline`, `stageSince`,
`stuckInfo()`, `isLate()`, mẫu tin nhắn / email nhắc đã có, form thu nốt
đã có. Quy tắc 1–3 tính được ngay từ dữ liệu hiện tại.

**Cần thêm (mới, phải thêm trường):**
- Trên mỗi job: `lastRemindedAt` (ngày nhắc gần nhất, `'YYYY-MM-DD'` hoặc
  `''`), `remindCount` (số lần đã nhắc) — để thực hiện "tối đa 1 lần / ngày"
  và để người dùng thấy đã nhắc mấy lần. Thêm vào `cleanData()` với giá trị
  mặc định `''` / `0` để dữ liệu cũ vẫn mở được; thêm vào file sao lưu JSON
  (nó nằm trong `jobs[]` nên tự đi theo, không cần đổi định dạng sao lưu).
- Trong `cfg`: `remindDays` (mặc định 7 ngày cho quy tắc 4; cho phép đổi
  3/7/14 ngày), `remindEnabled` (mặc định bật; tắt là không nhắc tự động
  nữa, chỉ còn nhắc thủ công như v1). Không thêm giờ nhắc cụ thể ở v1.1
  (nhắc hiện khi mở app, không hẹn giờ).

**Trường hợp biên:**
- Người dùng tắt nhắc: thẻ nhắc biến mất, nhưng mục "Cần thu nốt" (mục 3)
  vẫn hiện — tắt nhắc không có nghĩa là xóa nợ.
- Job vừa nhắc hôm nay rồi mà người dùng mở app nhiều lần: không nhắc lại
  trong ngày (`lastRemindedAt` = hôm nay).
- Khách trả 1 phần: `jobOwe` giảm, thẻ nhắc cập nhật số mới ngay, không cần
  nhập lại.

---

## 6. Thứ tự làm (đề xuất cho v1.1)

| Thứ tự | Mục | Vì sao trước |
|---|---|---|
| 1 | §3 Job còn thiếu tiền nhiều nhất | Dùng toàn bộ dữ liệu + form đã có, làm nhanh nhất, giá trị thu tiền rõ nhất |
| 2 | §5 Tầng A Nhắc thu nốt trong app | Dựa trên §3, chỉ thêm 2 trường + quy tắc; không cần quyền hệ thống |
| 3 | §1 Biểu đồ thu/chi theo tháng | Cần chọn kỳ xem (tháng/6/12 tháng) — quyết định này dùng chung cho §2 |
| 4 | §2 Top loại job có lãi nhất | Dùng cùng kỳ xem với §1, tính toán đơn giản |
| 5 | §4 Xuất CSV | Độc lập, làm lúc nào cũng được; để cuối vì cần kiểm chứng bằng Excel thật |
| Sau v1.1 | §5 Tầng B Nhắc đẩy + Excel `.xlsx` | Cần plugin/quyền/thư viện mới, kiểm chứng trên iPhone thật |

**Không làm ở v1.1:** xem theo tuần (chưa có nhu cầu rõ, tháng + ngày đã đủ);
đổi định dạng sao lưu JSON; quy đổi tỷ giá VND/USD (v1 đã quyết chỉ đổi hiển
thị); tính lãi ròng có trừ chi chung (cần quyết định cách phân bổ chi chung
trước — để v1.2).

## 7. Tiêu chí kiểm chứng (làm xong mới gọi là xong)

1. Sổ có ≥ 3 tháng dữ liệu thử (tự nhập tay, không dùng dữ liệu mẫu — v1 đã
   bỏ job/tiền mẫu): biểu đồ 6 tháng hiện đủ tháng, tháng trống hiện 0.
2. Top loại job: cộng tay 1 loại (vd: Wedding) khớp số trên màn hình; dòng
   chú thích "chưa trừ chi chung" hiện đúng.
3. "Cần thu nốt": sắp xếp theo số thiếu giảm dần đúng; job đã `Xong` nhưng
   thiếu tiền nằm ở mục riêng; bấm "Ghi thu nốt" mở form với đúng số còn thiếu.
4. CSV: mở bằng Excel/Google Sheets, tiếng Việt không lỗi font, cột số tiền
   cộng được, tên khách có dấu phẩy không vỡ cột.
5. Nhắc tự động: job "Đã giao" còn thiếu tiền hiện thẻ nhắc hôm đó; mở app
   lần 2 trong ngày không nhắc lại; bấm "Để sau" thì mai mới nhắc lại.
6. Dữ liệu cũ (file sao lưu JSON v1, không có `lastRemindedAt`) mở được bình
   thường, 2 trường mới mặc định `''` / `0`.
7. Chạy lại test jsdom của app vẫn đạt; không thêm quyền hệ thống mới ở v1.1
   (Tầng B chưa làm nên không xin quyền thông báo).

---

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Thiết kế cải tiến báo cáo tiền bạc cho FotoBro v1.1 — biểu
   đồ thu/chi theo tháng, top loại job có lãi nhất, job còn thiếu tiền nhiều
   nhất, xuất CSV/Excel, nhắc thu nốt tự động — chỉ viết file thiết kế, không
   code, không sửa file app.
2. **Đã thực hiện:** Đọc code sổ tiền thật trong
   `~/workspace/fotobro-ios-v1/www/index.html` (dữ liệu `jobs`/`txs`, các hàm
   `jobThu`/`jobChi`/`jobOwe`/`totalOwe`/`monthTxs`, tab Tiền bạc
   `renderMoney()`, Phòng Tiền Bạc, báo cáo cuối ngày, sao lưu JSON);
   xác nhận 0 lần `Notification`/`CSV`/`chart` trong code; viết file mới duy
   nhất `~/workspace/fotobro-ios-v1/MONEY-REPORT.md`.
3. **Kết quả kiểm tra:** File đã viết xong, 5 mục thiết kế đều có bảng "dùng
   dữ liệu đã có / cần thêm" và trường hợp biên; 4/5 mục dùng toàn bộ dữ
   liệu đã có, chỉ mục nhắc tự động cần thêm 2 trường job + 2 cài đặt.
4. **Vấn đề còn tồn tại:** (a) Chưa quyết định cách phân bổ chi chung nên
   chưa có "lãi ròng" — bảng top loại job phải ghi rõ là lời trực tiếp;
   (b) Nhắc đẩy (Tầng B) và Excel `.xlsx` chưa có thiết kế chi tiết, để sau
   v1.1; (c) Cần kiểm chứng CSV bằng Excel thật và nhắc tự động trên iPhone
   thật, không kiểm được trên Linux.
5. **Điều kiện chuyển bước:** Việt duyệt thiết kế này (đặc biệt: CSV trước,
   Excel sau; nhắc trong app trước, nhắc đẩy sau) — xong mới code v1.1 theo
   thứ tự §6.
6. **Bước tiếp theo:** Code v1.1 theo thứ tự §3 → §5 Tầng A → §1 → §2 →
   §4, kiểm chứng theo §7, rồi mới tính Tầng B + `.xlsx`.
7. **Trạng thái:** Thiết kế xong, chưa phải code chạy được. Không sửa bất kỳ
   file nào khác, không tạo tài khoản, không thêm quyền hệ thống.
