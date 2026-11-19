# FotoBro — Spec xuất CSV sổ tiền (v1.1)

> Phạm vi: **thiết kế cho v1.1, KHÔNG làm ở v1**. Chỉ đọc file có sẵn, không
> sửa bất kỳ file nào, không code vào app. File spec duy nhất cho tính năng này.
> Nguồn: `MONEY-REPORT.md` §4 (đã chốt **CSV trước, Excel `.xlsx` sau** —
> `.xlsx` không làm ở v1.1, để v1.2), code sổ tiền thật trong
> `www/index.html`, `I18N-STRINGS.md`, `BACKUP-V2.md` (mẫu tải file).
> Mô hình: local-first — dữ liệu chỉ trên máy, không tài khoản, không máy chủ.
> Ngày viết: 20/11/2026.

## 0. Hiện trạng đã có trong app (đọc từ code thật)

| Dữ liệu | Nguồn trong code | Ghi chú cho CSV |
|---|---|---|
| Khoản thu/chi `txs[]` | `cleanData()` | Mỗi khoản: `id, kind ('thu'/'chi'), category, jobId ('' = khoản chung), amount (số nguyên > 0), date ('YYYY-MM-DD'), method, note, src` |
| Job `jobs[]` | `cleanData()` | `id, client, type (Portrait/Couple/Wedding/Lookbook/Event/Khác), medium (Digital/Film/Cả hai), stage (8 bước), cancelled, shootDate, deadline, price, phone, email, stageSince` |
| Tiền từng job | `jobThu(id)`, `jobChi(id)`, `jobOwe(j) = max(0, price − jobThu)`, `profit = jobThu − jobChi` | Dùng cho file còn thiếu (§2.2) |
| Tổng còn thiếu | `totalOwe()` | Chỉ cộng job chưa `Xong` và chưa `cancelled` |
| Lọc tháng | `monthOf(s) = s.slice(0,7)`, `thisMonth()`, `monthTxs(kind)`, `sum(arr)` | Tháng đang xem là `YYYY-MM`; hiện v1 chỉ lọc tháng hiện tại, v1.1 cần chọn tháng (§3) |
| Hạng mục thu | `THU_CATS` | 10 hạng mục: Cọc, Tiền sau buổi chụp, Tiền sau khi giao ảnh, Thêm giờ chụp, Thêm địa điểm, Thêm ảnh retouch, Lấy file gốc, Album thêm, In thêm ảnh, Thu khác |
| Hạng mục chi | `CHI_GROUPS` | 4 nhóm / 20 hạng mục: Chi cho buổi chụp (9), Chi vận hành hằng tháng (5), Chi thiết bị & dài hạn (3), Chi khác (3: Thuế & phí ngân hàng, Quà cho khách, Phát sinh khác) |
| Hình thức | form thu/chi (`name="method"`) | `Chuyển khoản` (mặc định khi thiếu, theo `cleanData`), `Tiền mặt`, `Trả góp / đợt`; riêng khoản khấu hao tự ghi có `method = 'Khấu hao'` |
| Định dạng tiền hiển thị | `fmt()` | VND `vi-VN` + `₫`, USD `en-US` + `$`; **`currency` VND/USD chỉ đổi hiển thị, không quy đổi tỷ giá** — quy tắc này giữ nguyên trong CSV (§5) |
| Chia sẻ đã có | `navigator.share({title, text})` cho báo cáo cuối ngày; tải file bằng `<a>` + `Blob` + `URL.createObjectURL` cho sao lưu JSON (`fotobro-sao-luu.json`) và `.ics` | CSV dùng lại cả hai mẫu này (§6); app **chưa từng** `share` kèm file — phải kiểm chứng trên iPhone thật |
| Không có | `CSV`/`xlsx` = 0 lần trong code | Chưa có hàm xuất nào; chỉ có sao lưu JSON nguyên bộ và chép văn bản báo cáo |

## 1. Nguyên tắc chung

1. **CSV trước, `.xlsx` sau.** v1.1 chỉ làm CSV. CSV mở được bằng Excel /
   Numbers / Google Sheets là đủ cho đối chiếu kế toán.
2. **File chỉ chứa dữ liệu tiền bạc cần cho kế toán.** Không xuất số điện
   thoại, email, link Drive/Facebook/Messenger của khách, không xuất `note`
   nội bộ ngoài ghi chú của khoản thu/chi, không xuất trường `src` (nguồn
   nhập nội bộ, vd: giọng nói). Dữ liệu khách vẫn nằm trong file sao lưu
   JSON, không nằm trong CSV báo cáo. (Theo `MONEY-REPORT.md` §4.)
3. **Số trong file phải cộng được trong Excel.** Không ký tự tiền tệ, không
   dấu phân cách hàng nghìn, không số thập phân trong cột tiền (§5).
4. **Một file = một bảng, một dòng tiêu đề duy nhất.** Không dòng tiêu đề
   phụ, không gộp ô, không dòng tổng nằm lẫn trong vùng dữ liệu (§4.4) —
   để `SUM()` trong Excel và import vào Sheets/Numbers không vỡ.
5. **Thứ tự cột cố định, không đổi theo ngôn ngữ.** Chỉ nhãn tiêu đề đổi
   theo `locale` (§2.3); thứ tự và ý nghĩa cột giữ nguyên để file tháng
   này ghép được với file tháng trước.
6. **Không thêm trường dữ liệu mới.** Toàn bộ cột lấy từ `jobs[]`/`txs[]`
   và các hàm `jobThu`/`jobChi`/`jobOwe`/`totalOwe` đã có. Chỉ thêm 1 hàm
   xuất (đề xuất tên `exportCSV(range)`) và dùng lại `navigator.share` /
   mẫu tải file đã có.
7. **Không đổi dữ liệu khi xuất.** Xuất là đọc-only: không ghi thêm tx,
   không đổi `stage`, không cập nhật `lastBackupAt` (chỉ sao lưu JSON mới
   cập nhật thời điểm sao lưu).

## 2. Định dạng file CSV

### 2.1. Hai loại file

| # | Loại file | Nội dung | Dùng khi nào |
|---|---|---|---|
| A | Thu/chi | Mọi khoản `txs` trong phạm vi chọn (§3) | Đối chiếu thu/chi với ngân hàng / kế toán |
| B | Còn thiếu tiền | Ảnh chụp (snapshot) các job còn thiếu tại thời điểm xuất | Đi thu nốt tiền, gửi danh sách nhắc khách |

Chỉ làm 2 loại này ở v1.1. Không làm file tổng hợp tháng, file top loại
job, file lời từng job — các báo cáo đó xem trong app (MONEY-REPORT §1–§3),
không xuất thêm file.

### 2.2. Tên cột và thứ tự cột

#### File A — Thu/chi (7 cột, đúng thứ tự `MONEY-REPORT.md` §4)

| # | Tiếng Việt (locale `vi`) | English (locale `en`) | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|
| 1 | Ngày | Date | `tx.date` | `YYYY-MM-DD` (§5.2) |
| 2 | Loại | Type | `tx.kind` | `Thu` / `Chi` (vi) hoặc `Income` / `Expense` (en) |
| 3 | Hạng mục | Category | `tx.category` | Nguyên văn trong app (vd: `Cọc`, `Khấu hao thiết bị`). Không dịch hạng mục sang tiếng Anh ở v1.1 — hạng mục là dữ liệu gốc tiếng Việt |
| 4 | Khách / Job | Client | Tên khách của job gắn với `tx.jobId` (`jobById`), hoặc `Khoản chung` / `General` khi `jobId = ''` | Chỉ tên khách, **không** kèm SĐT/email |
| 5 | Phương thức | Method | `tx.method` | Nguyên văn: `Chuyển khoản`, `Tiền mặt`, `Trả góp / đợt`, `Khấu hao` |
| 6 | Số tiền (VND) / Số tiền (USD) | Amount (VND) / Amount (USD) | `tx.amount` | Số nguyên, theo `cfg.currency` lúc xuất (§5.1). Tiêu đề cột ghi đúng mã tiền đang dùng |
| 7 | Ghi chú | Note | `tx.note` | Có thể rỗng; là trường hay chứa dấu phẩy/xuống dòng nhất — escape theo §4.2 |

Ví dụ dòng tiêu đề (locale `vi`, tiền VND):

```csv
Ngày,Loại,Hạng mục,Khách / Job,Phương thức,Số tiền (VND),Ghi chú
```

Ví dụ dòng tiêu đề (locale `en`, tiền USD):

```csv
Date,Type,Category,Client,Method,Amount (USD),Note
```

#### File B — Còn thiếu tiền (8 cột, đúng thứ tự `MONEY-REPORT.md` §4)

| # | Tiếng Việt (locale `vi`) | English (locale `en`) | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|---|
| 1 | Khách | Client | `job.client` | Chỉ tên khách |
| 2 | Loại job | Job type | `jobTypeLabel(job)` | `type` + ` — Film` / ` — Cả hai` khi không phải Digital (vd: `Wedding — Film`); Digital giữ nguyên tên loại |
| 3 | Bước | Stage | `job.stage` | 8 bước pipeline; locale `en` dịch theo `I18N-STRINGS.md` §E (Tư vấn→Consulting, Chốt cọc→Deposit confirmed, Sắp chụp→Ready to shoot, Đã chụp→Shot, Chọn ảnh→Selecting photos, Hậu kỳ→Post-production, Đã giao→Delivered, Xong→Done). Job `cancelled` không vào file này |
| 4 | Ngày chụp | Shoot date | `job.shootDate` | `YYYY-MM-DD`, rỗng nếu chưa hẹn |
| 5 | Hạn giao | Deadline | `job.deadline` | `YYYY-MM-DD`, rỗng nếu chưa có; không ghi "trễ X ngày" trong file — người đọc tự so với ngày xuất |
| 6 | Giá job | Price | `job.price` | Số nguyên (§5.1) |
| 7 | Đã thu | Collected | `jobThu(job.id)` | Số nguyên |
| 8 | Còn thiếu | Balance due | `jobOwe(job)` | Số nguyên, luôn > 0 trong file này (§3.4) |

Ví dụ dòng tiêu đề (locale `vi`, tiền VND):

```csv
Khách,Loại job,Bước,Ngày chụp,Hạn giao,Giá job,Đã thu,Còn thiếu
```

**Lưu ý về cột tiền trong file B:** tiêu đề cột 6–8 không ghi `(VND)`/`(USD)`
vì đã ghi đơn vị tiền trong tên file (§2.4); nếu lúc code muốn ghi rõ thì
ghi `Giá job (VND)` / `Price (VND)` — quyết 1 kiểu cho cả 3 cột, không ghi
kiểu này cột kia kiểu khác. Giá trị vẫn là số nguyên, không ký hiệu tiền.

### 2.3. Ngôn ngữ tiêu đề

- Tiêu đề cột theo `cfg.locale` lúc xuất: `vi` → cột tiếng Việt, `en` →
  cột tiếng Anh (bảng §2.2). `locale` chỉ nhận `'vi'` / `'en'` (theo
  `mergeCfg`); mọi giá trị khác về `vi`.
- **Thứ tự cột, nội dung dữ liệu và tên file không đổi theo ngôn ngữ**
  (trừ nhãn `Thu`/`Chi` ở cột Loại file A và tên bước ở cột Bước file B
  như bảng trên). Hạng mục, phương thức, tên khách giữ nguyên văn tiếng
  Việt như trong app — đó là dữ liệu gốc, không phải nhãn giao diện.
- Chuỗi giao diện cho nút/sheet xuất (thêm mới, theo `I18N-STRINGS.md`):

| Key (đề xuất) | Tiếng Việt | English |
|---|---|---|
| `csv.export` | Xuất báo cáo | Export report |
| `csv.month` | CSV tháng đang xem | CSV for this month |
| `csv.all` | CSV toàn bộ | CSV for all time |
| `csv.byJob` | CSV theo 1 job | CSV for one shoot |
| `csv.owed` | CSV danh sách còn thiếu tiền | CSV of outstanding balances |
| `csv.empty` | Sổ đang trống | No transactions yet |
| `csv.noOwed` | Không còn job thiếu tiền | No outstanding balances |
| `csv.shared` | Đã chuẩn bị file để chia sẻ | File ready to share |
| `csv.downloaded` | Đã tải file về máy | File downloaded |

### 2.4. Tên file xuất

Ngày trong tên file là **ngày xuất theo lịch máy** (`dstr(0)` =
`YYYY-MM-DD`), trừ file tháng dùng tháng đang xem. Tên file chỉ dùng chữ
thường không dấu, số và dấu `-`, không chứa tên khách (tên file hiện ra
trong Share sheet / Mail — không để lộ tên khách ở đó).

| Phạm vi | Mẫu tên file |
|---|---|
| File A — tháng đang xem `YYYY-MM` | `fotobro-bao-cao-YYYY-MM-<vnd\|usd>.csv` (vd: `fotobro-bao-cao-2026-11-vnd.csv`) |
| File A — toàn bộ | `fotobro-bao-cao-tat-ca-YYYY-MM-DD-<vnd\|usd>.csv` (vd: `fotobro-bao-cao-tat-ca-2026-11-20-vnd.csv`) |
| File A — theo 1 job (id số) | `fotobro-bao-cao-job-<id>-YYYY-MM-DD-<vnd\|usd>.csv` (vd: `fotobro-bao-cao-job-104-2026-11-20-vnd.csv`) |
| File B — còn thiếu tiền | `fotobro-con-thieu-YYYY-MM-DD-<vnd\|usd>.csv` (vd: `fotobro-con-thieu-2026-11-20-vnd.csv`) |

- Hậu tố `<vnd|usd>` là `cfg.currency` lúc xuất, viết thường — để 2 file
  VND/USD không lẫn nhau và người đọc biết cột tiền đang ở đơn vị nào.
- Không dùng tên cũ `tro-ly-xeo-...` (tên cũ của app Xèo); dùng tiền tố
  `fotobro-` như sao lưu JSON v2 (`fotobro-backup-YYYYMMDD.json`).

### 2.5. Thứ tự dòng dữ liệu

- **File A:** ngày tăng dần (`date` tăng dần), cùng ngày thì `id` tăng dần
  (thứ tự nhập). Không sắp theo số tiền, không đảo mới nhất lên đầu —
  file kế toán đọc theo thời gian.
- **File B:** số còn thiếu giảm dần (`jobOwe` giảm dần — khớp thứ tự mục
  "Cần thu nốt" trong `MONEY-REPORT.md` §3); cùng số thiếu thì hạn giao
  gần nhất lên trước, chưa có hạn giao xếp sau cùng.

## 3. Bộ lọc xuất

Vị trí: 1 nút **"Xuất báo cáo"** trong tab Tiền bạc, cạnh nút lọc
(`all / thu / chi / month`) đã có — theo `MONEY-REPORT.md` §4. Bấm nút mở
sheet chọn đúng 4 mục dưới đây (không thêm mục khác ở v1.1).

| # | Mục trong sheet | Phạm vi dữ liệu | File |
|---|---|---|---|
| (a) | CSV tháng đang xem | `txs` có `monthOf(date) === <tháng đang xem>` (tháng chọn ở bộ chọn kỳ xem của `MONEY-REPORT.md` §1; mặc định tháng hiện tại `thisMonth()`). Cả `thu` và `chi` trong cùng 1 file, phân biệt bằng cột Loại | A |
| (b) | CSV toàn bộ | Toàn bộ `txs` từ trước tới nay, không lọc ngày | A |
| (c) | CSV theo 1 job | Chọn 1 job từ danh sách job (hiện tên khách + loại job + bước; chỉ liệt kê job có ít nhất 1 khoản thu/chi — job chưa có khoản nào thì file sẽ trống, không liệt kê). Lấy mọi `tx` có `jobId === <id>`, mọi ngày, cả `thu` và `chi` | A |
| (d) | CSV danh sách còn thiếu tiền | Ảnh chụp tại thời điểm xuất: job chưa `Xong`, chưa `cancelled`, `jobOwe > 0` (đúng điều kiện của `totalOwe()` và mục "Cần thu nốt") | B |

Quy tắc chung cho bộ lọc:

- **(a) theo tháng đang xem, không phải tháng hiện tại cố định.** Nếu tab
  Tiền bạc đang xem tháng 10/2026 thì xuất tháng 10/2026. Sheet xuất ghi
  rõ tháng sẽ xuất (vd: "CSV tháng 11/2026 — 23 khoản").
- **Không có bộ lọc theo loại thu/chi riêng.** File A luôn chứa cả thu và
  chi; người dùng lọc bằng cột Loại trong Excel/Sheets. Không thêm mục
  "chỉ thu" / "chỉ chi" ở v1.1.
- **Không có bộ lọc theo hạng mục hay phương thức** ở v1.1.
- **Job đã huỷ:** khoản thu/chi của job đã huỷ vẫn nằm trong file A
  (tiền đã thu/chi là thật, không xoá khỏi sổ); job đã huỷ không vào
  file B.
- **Job đã `Xong` nhưng vẫn thiếu tiền** (người dùng bấm "Xong" kèm cảnh
  báo ở v1): **không** vào file B chính (vì `totalOwe()` loại job `Xong`),
  để tổng trong file B khớp đúng `totalOwe()` trên màn hình. Nếu muốn
  nhắc các job này thì xem trong app ở mục riêng "Đã xong nhưng vẫn
  thiếu" (`MONEY-REPORT.md` §3) — không thêm vào CSV v1.1 để khỏi lệch
  tổng.
- **Khoản chung** (`jobId = ''`, vd: khấu hao, chi vận hành): có trong
  file A với cột Khách / Job = `Khoản chung` / `General`; không gắn vào
  job nào trong file B (file B chỉ tính tiền theo job).
- **Khoản mồ côi:** `tx.jobId` trỏ tới job không còn tồn tại đã được
  `cleanData()` ép về `''` nên tự thành khoản chung — không cần xử lý
  riêng lúc xuất.

## 4. Định dạng CSV chi tiết (chuẩn RFC 4180)

### 4.1. Mã hoá, xuống dòng, phân tách

- **Mã hoá: UTF-8 có BOM** (`EF BB BF` ở đầu file) — để Excel trên
  Windows mở tiếng Việt không lỗi font (quyết trong `MONEY-REPORT.md`
  §4). Không dùng UTF-16, không dùng Windows-1258.
- **Xuống dòng: `\r\n`** cho mọi dòng, kể cả dòng cuối (file kết thúc
  bằng `\r\n` sau dòng dữ liệu cuối).
- **Phân tách: dấu phẩy `,`** — đúng quyết định trong `MONEY-REPORT.md`
  §4. Không dùng dấu chấm phẩy, không dùng tab.
- **Không có dòng trống** ở đầu file, giữa các dòng, hay trước dòng tiêu đề.
- **Mỗi dòng có đủ số cột** (file A đúng 7 cột, file B đúng 8 cột), kể cả
  khi ô rỗng — ô rỗng để trống, không ghi `null`, `undefined`, `-` hay
  `chưa có`.

### 4.2. Cách escape dấu phẩy / xuống dòng / dấu ngoặc kép

Áp đúng RFC 4180, cho **mọi** ô (không chỉ ô ghi chú):

| Trường hợp trong giá trị ô | Cách ghi trong file |
|---|---|
| Chứa dấu phẩy `,` | Bọc cả ô trong dấu ngoặc kép: `"..."` |
| Chứa xuống dòng `\n` hoặc `\r\n` | Bọc cả ô trong dấu ngoặc kép; giữ nguyên ký tự xuống dòng bên trong (file vẫn đúng vì ô đã bọc kín) |
| Chứa dấu ngoặc kép `"` | Nhân đôi thành `""`, rồi bọc cả ô trong dấu ngoặc kép |
| Chứa cả 3 loại trên | Nhân đôi `"` trước, rồi bọc cả ô trong `"..."` |
| Không chứa ký tự nào trên | Ghi trần, không bọc ngoặc kép |

Ví dụ (ghi chú `Chụp thêm giờ, khách nói "lấy luôn album" nhé`):

```csv
2026-11-15,Thu,Tiền sau buổi chụp,Nguyễn Văn A,Chuyển khoản,4000000,"Chụp thêm giờ, khách nói ""lấy luôn album"" nhé"
```

Ví dụ (ghi chú có xuống dòng `Cọc đợt 1\nCòn 2 đợt nữa`):

```csv
2026-11-10,Thu,Cọc,Trần Thị B,Chuyển khoản,6000000,"Cọc đợt 1
Còn 2 đợt nữa"
```

Ví dụ (tên khách có dấu phẩy `Lê, Minh Anh` — tên này bọc ngoặc kép, các
ô khác không đổi):

```csv
2026-11-12,Thu,Cọc,"Lê, Minh Anh",Tiền mặt,5000000,
```

Quy tắc khi code (đề xuất, 1 hàm duy nhất dùng cho cả 2 file):

```js
function csvCell(v){
  var s = String(v == null ? '' : v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
```

- Không escape bằng backslash (`\"` là sai chuẩn CSV, Excel không hiểu).
- Không thay dấu phẩy trong dữ liệu thành dấu khác, không cắt bỏ xuống
  dòng trong ghi chú — dữ liệu trong file phải giống đúng dữ liệu trong app.

### 4.3. Ô rỗng và giá trị đặc biệt

| Trường hợp | Ghi trong file |
|---|---|
| Ghi chú trống | Ô trống (`,,`) |
| `shootDate` / `deadline` chưa có | Ô trống — **không** ghi `chưa hẹn ngày` / `no date yet` (đó là nhãn hiển thị của `fmtDate`, không phải dữ liệu) |
| `price = 0` (chưa chốt giá) | Ghi `0` (file B chỉ chứa job `jobOwe > 0` nên trường hợp này không xuất hiện; ghi ở đây để khỏi nhầm khi đọc file A) |
| Tên khách trống | Không xảy ra — `cleanData()` đã ép thành `Khách chưa đặt tên` |
| Khoản `amount` | Luôn > 0 theo `cleanData()`; không có số âm trong file A (thu/chi phân biệt bằng cột Loại, không bằng dấu trừ) |

### 4.4. Không có dòng tổng trong vùng dữ liệu

- **Không thêm dòng "Tổng cộng" vào cuối file.** Lý do: người dùng
  `SUM()` cả cột tiền trong Excel sẽ cộng cả dòng tổng vào, ra số gấp
  đôi; file import vào phần mềm kế toán cũng sẽ đọc dòng tổng thành 1
  khoản giả.
- Tổng tiền để đối chiếu hiển thị **trên màn hình trước khi chia sẻ**:
  sheet xuất hiện dòng tóm tắt theo phạm vi đã chọn, dùng `fmt()` như
  trong app — vd: file A tháng 11: `Thu 25.000.000₫ · Chi 8.000.000₫ ·
  Lời 17.000.000₫ · 23 khoản`; file B: `Tổng còn thiếu: 12.000.000₫ —
  4 khách` (dùng `totalOwe()`). Người dùng so tổng này với tổng `SUM()`
  trong Excel khi kiểm chứng (§8).
- Không thêm dòng tiêu đề phụ, dòng ghi chú, dòng ngày xuất, dòng tên
  studio vào trong file CSV. Ngày xuất đã có trong tên file (§2.4).

## 5. Xử lý số tiền VND/USD và ngày giờ

### 5.1. Số tiền

- **Giá trị ghi trong file = số nguyên đã lưu trong `amount` /
  `price` / `jobThu` / `jobOwe`** (`cleanNum` đã `Math.round`, không có
  thập phân). Ghi đúng số đó, không làm tròn thêm, không đổi đơn vị.
- **Không ghi ký tự tiền tệ** (`₫`, `$`), **không ghi dấu phân cách hàng
  nghìn** (`.`, `,`), **không ghi hậu tố** (`tr`, `k`, `triệu`, `M`).
  `fmt()` / `fmtShort()` / `fmtTiny()` chỉ dùng cho hiển thị trên màn
  hình, **không dùng trong file** (theo `MONEY-REPORT.md` §4).
- **Không quy đổi tỷ giá.** `currency` chỉ đổi hiển thị: nếu app đang để
  USD thì các số trong file là số đã nhập khi để USD; nếu đang để VND
  thì là số VND. Không nhân/chia tỷ giá lúc xuất, không ghi 2 cột
  VND+USD. Đơn vị tiền của file được ghi rõ bằng hậu tố `-vnd`/`-usd`
  trong tên file (§2.4) và mã tiền trong tiêu đề cột tiền file A (§2.2).
- **Số 0:** ghi `0`, không để trống. Số tiền không bao giờ âm trong cả
  2 file (file A phân biệt thu/chi bằng cột Loại; file B chỉ có job
  `jobOwe > 0`).
- **Số lớn:** ghi đầy đủ (vd: `15000000`), Excel/Sheets tự hiển thị
  theo định dạng ô của người dùng. Không rút gọn thành `15tr`.

### 5.2. Ngày giờ

- **Ngày trong file luôn dạng `YYYY-MM-DD`** (đúng dạng lưu trong
  `tx.date`, `job.shootDate`, `job.deadline`): vd `2026-11-15`. Không
  ghi dạng `15/11/2026`, không ghi tên thứ, không ghi giờ.
- **Không có cột giờ.** `tx` không lưu giờ (chỉ lưu ngày), job chỉ lưu
  `shootTime` (`HH:MM`) riêng — không xuất giờ chụp vào CSV tiền bạc.
- **Không chuyển múi giờ.** Ngày trong app là ngày theo lịch máy
  (`dstr(0)` dùng giờ địa phương), không phải timestamp UTC — lúc xuất
  ghi nguyên chuỗi `YYYY-MM-DD` đã lưu, không cộng/trừ giờ, không đổi
  ngày. Ngày xuất trong tên file cũng là ngày theo lịch máy.
- **Ngày không hợp lệ:** không xảy ra — `cleanData()` đã ép ngày sai
  thành `''` (tx) hoặc loại khỏi tính toán; ngày tx rỗng được ép về
  ngày hôm nay (`dstr(0)`) lúc làm sạch.

## 6. Cách chia sẻ file trên iOS (Share sheet)

### 6.1. Luồng chính — Share sheet với file

1. Người dùng chọn phạm vi trong sheet xuất (§3) → app tạo chuỗi CSV
   (BOM + `\r\n` + escape theo §4) → tạo `Blob` với
   `type: 'text/csv;charset=utf-8'`.
2. Tạo `File`: `new File([blob], <tên file §2.4>, {type:
   'text/csv;charset=utf-8'})`.
3. Kiểm tra `navigator.canShare && navigator.canShare({files: [file]})`:
   - **Chia sẻ được** → gọi `navigator.share({files: [file], title:
     <tên file>})`. Mở Share sheet của iOS để người dùng chọn đích:
     Lưu vào Tệp (Files), Excel, Numbers, Google Sheets, Mail, Drive,
     AirDrop, in… Không tự chọn đích thay người dùng, không tự gửi file
     đi đâu.
   - **Không chia sẻ được** (vd: WebView/Capacitor không hỗ trợ share
     kèm file) → rẽ sang luồng dự phòng §6.2. Đây là trường hợp **dự
     kiến**, không phải lỗi — báo bằng toast bình thường, không báo lỗi đỏ.
4. Sau khi share xong (hoặc người dùng đóng sheet) thì
   `URL.revokeObjectURL` và hiện toast `csv.shared` ("Đã chuẩn bị file
   để chia sẻ"). **Không** coi việc mở Share sheet là "đã gửi thành
   công" — app không biết người dùng có chọn đích hay chỉ đóng sheet.
5. Không ghi file CSV vào `localStorage` / IndexedDB, không lưu bản sao
   CSV trong app. File chỉ tồn tại trong bộ nhớ lúc chia sẻ; muốn xuất
   lại thì bấm xuất lại (số liệu lúc đó là số liệu mới nhất).

Lưu ý kỹ thuật (cần kiểm chứng trên iPhone thật, §8): app v1 đã dùng
`navigator.share({title, text})` cho báo cáo cuối ngày, nhưng **chưa
từng share kèm `files`**. `navigator.share` với file trong WKWebView /
Capacitor có thể không hỗ trợ — vì vậy luồng dự phòng §6.2 là bắt buộc,
không phải tuỳ chọn.

### 6.2. Luồng dự phòng — tải file về máy

Dùng đúng mẫu tải file đã có trong app (sao lưu JSON, `.ics`):

```js
var a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([csvText], {type: 'text/csv;charset=utf-8'}));
a.download = <tên file §2.4>;
document.body.appendChild(a); a.click();
setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 400);
```

- Hiện toast `csv.downloaded` ("Đã tải file về máy") + hướng dẫn 1 dòng:
  "Mở file trong Tệp rồi chọn Mở bằng Excel / Numbers".
- Trên iOS, file tải về rơi vào thư mục Downloads của Safari/WKWebView
  hoặc Files — người dùng tự mở từ đó. Không tự mở Excel/Numbers bằng
  deep link (không có deep link chuẩn cho việc này).

### 6.3. Không làm ở v1.1

- Không gửi file tự động qua Mail/Gmail/Drive API (không có tài khoản,
  không có backend — app local-first).
- Không xuất thẳng vào Google Sheets qua API.
- Không in trực tiếp từ app.
- Không nén file thành `.zip` (1 file CSV duy nhất, không cần nén).

## 7. Trường hợp không có dữ liệu

| Trường hợp | Hành vi |
|---|---|
| Sổ trống hoàn toàn (không có `tx` nào — trạng thái mặc định của v1, `seed()` không tạo job/tiền mẫu) | Nút "Xuất báo cáo" **vẫn bấm được**. File A (tháng / toàn bộ / theo job) chỉ có **dòng tiêu đề + 0 dòng dữ liệu**, kèm toast `csv.empty` ("Sổ đang trống"). Không chặn xuất, không hiện file rỗng 0 byte, không báo lỗi |
| Tháng đang xem không có khoản nào | Như trên, cho phạm vi tháng đó: file chỉ có tiêu đề, toast "Tháng này chưa có khoản nào" |
| Job được chọn không có khoản nào | Job đó không liệt kê trong danh sách chọn (§3c) nên không gặp; nếu vẫn gặp (dữ liệu đổi giữa lúc chọn và lúc xuất) thì xuất file chỉ có tiêu đề |
| Không còn job thiếu tiền (file B) | File B chỉ có dòng tiêu đề + 0 dòng dữ liệu, kèm toast `csv.noOwed` ("Không còn job thiếu tiền"). Không xuất file B với dòng tổng `0` giả |
| Dữ liệu cũ (file sao lưu JSON v1, không có trường mới) | Không ảnh hưởng — CSV chỉ đọc `jobs`/`txs` đã có từ v1, không cần trường mới nào (khác với nhắc tự động cần `lastRemindedAt` trong `MONEY-REPORT.md` §5) |
| Xuất thất bại giữa chừng (vd: hết bộ nhớ khi tạo Blob) | Không tạo file nửa vời, không toast thành công giả; báo "Không xuất được file, thử lại nhé" và giữ nguyên dữ liệu |

## 8. Tiêu chí kiểm chứng (làm xong mới gọi là xong)

Kiểm bằng **iPhone thật + Excel/Numbers trên iOS** (không kiểm được đầy
đủ trên Linux — xem §9). Dữ liệu thử nhập tay, không dùng dữ liệu mẫu
(v1 đã bỏ job/tiền mẫu).

| # | Kiểm tra | Đạt khi |
|---|---|---|
| 1 | Mở bằng Numbers (iOS) | File mở ra đúng 7 cột (A) / 8 cột (B), tiếng Việt không lỗi font, ngày hiện đúng `YYYY-MM-DD` |
| 2 | Mở bằng Excel (iOS) và Google Sheets | Như #1; cột tiền được nhận là số (căn phải, cộng được), không phải chữ |
| 3 | Đúng tổng tiền so với app | `SUM()` cột tiền file A tháng đang xem = Thu tháng đó trên tab Tiền bạc; `SUM()` cột tiền file A toàn bộ (lọc Loại = Thu, rồi = Chi) = tổng thu/chi toàn bộ trong app; `SUM()` cột Còn thiếu file B = `totalOwe()` trên màn hình |
| 4 | Đúng tổng file B từng dòng | Với 2 job bất kỳ: Giá job − Đã thu = Còn thiếu trong file, khớp `jobThu`/`jobOwe` trong chi tiết job |
| 5 | Tên khách / ghi chú có dấu phẩy | Tên `Lê, Minh Anh` không vỡ cột; ghi chú có dấu phẩy vẫn nằm gọn trong 1 ô |
| 6 | Ghi chú có dấu `"` và xuống dòng | Ghi chú `khách nói "lấy luôn album"` và ghi chú 2 dòng mở ra đúng 1 ô, không vỡ dòng, không thừa dấu `"` |
| 7 | Tên file | Đúng mẫu §2.4 (tháng, ngày xuất, hậu tố `-vnd`/`-usd`, không tên khách, không dấu) |
| 8 | Bộ lọc | File tháng chỉ chứa đúng tháng đó; file theo job chỉ chứa khoản của job đó; file toàn bộ chứa hết; file B chỉ chứa job chưa `Xong`, chưa huỷ, còn thiếu > 0, sắp xếp thiếu giảm dần |
| 9 | Sổ trống | File chỉ có dòng tiêu đề, toast "Sổ đang trống"; không crash, không file 0 byte |
| 10 | Riêng tư | Trong file không có SĐT, email, link Drive/Facebook/Messenger, trường `src` |
| 11 | Share sheet | Bấm xuất trên iPhone thật mở được Share sheet, chọn Lưu vào Tệp / Excel / Mail đều nhận file `.csv`; nếu `canShare({files})` = false thì tải file về máy theo §6.2, không kẹt |
| 12 | Tiền tệ | Đổi `currency` sang USD rồi xuất: tiêu đề cột tiền ghi `(USD)`, tên file có `-usd`, giá trị số không đổi (không quy đổi tỷ giá); đổi lại VND thì ngược lại |
| 13 | Hồi quy | Chạy lại test jsdom của app vẫn đạt; sao lưu JSON và báo cáo cuối ngày không đổi |

## 9. Vấn đề còn tồn tại / rủi ro

1. **`navigator.share` kèm file chưa từng kiểm chứng trong app này.**
   v1 chỉ share `text`. Trên WKWebView/Capacitor, `canShare({files})`
   có thể trả `false` — khi đó luồng tải file §6.2 là đường chính, phải
   kiểm trên iPhone thật mới biết. Không kiểm được trên Linux.
2. **Excel trên Windows (locale vi-VN) có thể không tự tách cột bằng
   dấu phẩy.** Windows vi-VN dùng dấu `;` làm ký tự phân tách danh sách
   trong một số cài đặt — file vẫn đúng chuẩn RFC 4180, nhưng Excel
   Windows có thể dồn cả dòng vào 1 cột. Cách xử lý khi gặp: mở bằng
   Data → From Text/CSV, chọn UTF-8 + delimiter Comma. Không đổi sang
   dấu `;` chỉ vì Excel Windows — quyết định dấu phẩy đã chốt trong
   `MONEY-REPORT.md` §4 và khớp Excel iOS / Numbers / Google Sheets.
   Ghi chú này vào Help Center lúc giao, không sửa spec.
3. **Tiêu đề cột tiếng Anh cho hạng mục/phương thức:** spec giữ nguyên
   văn tiếng Việt cho 2 cột này (§2.3) vì đó là dữ liệu gốc. Nếu Việt
   muốn file `en` dịch hết cả hạng mục thì phải thêm bảng dịch hạng mục
   (20+ mục chi) — để v1.2, không làm ở v1.1.
4. **File B là ảnh chụp tại thời điểm xuất**, không tự cập nhật — khách
   trả thêm tiền sau khi xuất thì file cũ lệch. Đây là bản chất của file
   xuất, không phải lỗi; người dùng xuất lại khi cần số mới.
5. **Chưa có `.xlsx`:** nếu Việt vẫn cần `.xlsx` thì làm ở v1.2 với
   thư viện đã chọn (vd: SheetJS) và kiểm chứng riêng — không gộp vào
   v1.1.

## 10. Câu hỏi chờ Việt chốt (nếu có)

1. **Giữ dấu phẩy làm ký tự phân tách** (theo `MONEY-REPORT.md` §4) dù
   Excel Windows vi-VN có thể cần import thủ công (§9.2) — hay muốn đổi
   sang dấu chấm phẩy cho hợp Excel Windows?
2. **Tiêu đề cột tiền file B** (§2.2): giữ `Giá job / Đã thu / Còn thiếu`
   (đơn vị tiền chỉ ghi trong tên file) hay ghi rõ `Giá job (VND)` cho
   cả 3 cột như file A?
3. **Mục "CSV theo 1 job"** có giữ không, hay chỉ cần 3 mục (tháng, toàn
   bộ, còn thiếu) cho sheet xuất gọn hơn?

---

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Viết spec xuất CSV sổ tiền cho FotoBro v1.1 — định dạng
   CSV (tên cột, thứ tự cột, Việt + Anh), cách escape, bộ lọc xuất, tên
   file, chia sẻ trên iOS, xử lý tiền VND/USD và ngày giờ, trường hợp
   không có dữ liệu, tiêu chí kiểm chứng — chỉ viết 1 file spec mới,
   không sửa file nào.
2. **Đã thực hiện:** Đọc code sổ tiền thật trong `www/index.html`
   (`cleanData`, `jobThu`/`jobChi`/`jobOwe`/`totalOwe`/`monthTxs`,
   `THU_CATS`, `CHI_GROUPS`, `fmt`, mẫu `navigator.share` text và mẫu
   tải file `Blob` của sao lưu JSON/`.ics`); đọc `MONEY-REPORT.md` §4
   (CSV trước, `.xlsx` sau), `I18N-STRINGS.md`, `BACKUP-V2.md`; viết
   file mới duy nhất
   `~/workspace/fotobro-ios-v1/batch-v11/CSV-EXPORT.md`.
3. **Kết quả kiểm tra:** File đã viết xong, gồm: 2 loại file (A thu/chi
   7 cột, B còn thiếu 8 cột) với tên cột VI/EN + thứ tự cố định; escape
   chuẩn RFC 4180 (BOM UTF-8, `\r\n`, dấu phẩy, nhân đôi `"`); 4 bộ lọc
   (tháng đang xem, toàn bộ, theo 1 job, còn thiếu); tên file
   `fotobro-bao-cao-...` / `fotobro-con-thieu-...` có hậu tố `-vnd`/`-usd`;
   Share sheet kèm file + dự phòng tải file theo mẫu đã có; tiền ghi số
   nguyên không ký hiệu, không quy đổi tỷ giá; ngày `YYYY-MM-DD` không
   chuyển múi giờ; sổ trống vẫn xuất file chỉ có tiêu đề; 13 tiêu chí
   kiểm chứng (§8). Tự kiểm lại: mọi tên trường/hàm/cột đều đối chiếu
   đúng code và `MONEY-REPORT.md` §4; không sửa bất kỳ file nào khác.
4. **Vấn đề còn tồn tại:** (a) `navigator.share` kèm file chưa từng
   dùng trong app — có thể `canShare({files})` = false trên WKWebView,
   phải kiểm trên iPhone thật; (b) Excel Windows vi-VN có thể không tự
   tách cột dấu phẩy, cần import thủ công; (c) hạng mục/phương thức giữ
   nguyên văn tiếng Việt trong cả file `en`; (d) file B là ảnh chụp, xuất
   lại khi số liệu đổi.
5. **Điều kiện chuyển bước:** Việt duyệt spec này (đặc biệt 3 câu hỏi
   §10: dấu phân tách, tiêu đề cột tiền file B, có giữ mục "CSV theo
   1 job" không) — xong mới code v1.1 theo thứ tự `MONEY-REPORT.md` §6
   (CSV làm cuối trong 5 mục, sau §3 → §5 Tầng A → §1 → §2).
6. **Bước tiếp theo:** Code `exportCSV(range)` + nút "Xuất báo cáo" trong
   tab Tiền bạc theo spec này, kiểm chứng theo §8 trên iPhone thật
   (Excel/Numbers iOS + Google Sheets), rồi mới tính `.xlsx` ở v1.2.
7. **Trạng thái:** Spec xong, chưa phải tính năng chạy được. Không sửa
   bất kỳ file nào khác, không tạo tài khoản, không push GitHub.
