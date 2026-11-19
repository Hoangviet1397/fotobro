# FotoBro iOS v1 — Checklist kiểm tra bản dịch (TRANSLATION-QA)

- Phạm vi: **80 chuỗi chính trong `I18N-STRINGS.md`** (mục A–K), giao diện Việt / Anh cho FotoBro iOS v1.
- Nguồn đối chiếu: `~/workspace/fotobro-ios-v1/I18N-STRINGS.md` (kiểm tra 20/11/2026 lúc 00:10 +07) và `~/workspace/fotobro-ios-v1/www/index.html` (3.901 dòng, 341.754 byte) + `www/fotobro-config.js`.
- Cách dùng: đánh dấu `[x]` khi một mục **ĐẠT có bằng chứng** (ghi rõ bằng chứng ở cột cuối / mục §10). Một mục chưa kiểm trên máy thật thì ghi `[ ]`, không ghi ĐẠT.
- Quy tắc nền (giữ nguyên, không đổi khi kiểm): `locale` chỉ `'vi'` / `'en'`; `currency` chỉ `'VND'` / `'USD'`; **chỉ đổi hiển thị, không quy đổi tỷ giá**; tên app `FotoBro` không dịch; tên 6 phòng ban giữ tiếng Việt + chú thích tiếng Anh, không dịch tên Sen/Nắng/Mây/Lúa/Trăng/Đèn sang tên khác.

## 0. Baseline đã biết trước khi kiểm — đọc trước, đừng để checklist "đậu giả"

Những lệch dưới đây đã thấy khi đối chiếu ngày 20/11/2026. Checklist này **không được coi là ĐẠT** nếu chỉ kiểm bảng mà bỏ qua chúng:

| # | Lệch đã thấy | Ý nghĩa cho QA |
|---|---|---|
| 0.1 | Bảng có **80 chuỗi**, nhưng dict `I18N` trong `index.html` (dòng ~950–951) hiện chỉ có **16 key / ngôn ngữ** (`tab_home`, `tab_jobs`, `tab_money`, `tab_depts`, `tab_ask`, `today`, `remember`, `ask`, `settings`, `hello`, `morning`, `afternoon`, `evening`, `tomorrow`, `yesterday`, `no_date`). `applyLocale()` hiện chỉ đổi nhãn tab bar + tiêu đề `#todaySec h2`. Comment trong code (dòng ~948): "i18n v1 tối thiểu: chỉ nhãn chính… Phần còn lại vẫn tiếng Việt". | Kiểm đủ 80 chuỗi **trong app đã nối i18n**, không chỉ kiểm bảng `.md`. Nếu app chưa nối đủ 80, §1 phải ghi TRƯỢT và ghi rõ còn bao nhiêu key chưa nối. |
| 0.2 | **7 chuỗi MỚI** chưa có trong code v1: #11 `today.greeting`, #15 `today.moneyToday`, #28 `type.Portrait` (nhãn VI), #30 `type.Wedding` (nhãn VI), #52 `money.addExpense`, #65 `settings.currency` (nhãn mục), #80 `notify.stuck`. | §1.2 kiểm riêng 7 chuỗi này — thiếu 1 cũng là TRƯỢT. |
| 0.3 | **Lệch EN đã thấy:** bảng #5 `nav.depts` = "Departments", nhưng dict `en.tab_depts` trong code = **"Studio"**. | §3.2: chốt một bản duy nhất ("Departments" hay "Studio") rồi sửa cả bảng lẫn code cho khớp; không để hai nơi hai từ. |
| 0.4 | **Mẫu tin nhắn / email nằm ngoài 80 chuỗi** và hiện chỉ có tiếng Việt: 6 mẫu `TPLS` + 5 mẫu `MAIL_TPLS_DEFAULT` trong code, với nhiều placeholder hơn bảng (§2.2). | §8 kiểm riêng. Nếu v1 quyết định mẫu vẫn tiếng Việt thì phải ghi rõ quyết định đó vào §10 (không im lặng cho qua). |
| 0.5 | **Tiền / ngày còn chỗ hard-code `vi-VN`:** `fmtTiny()` luôn trả `"tr"` / `"k"` bất kể locale; `fmtRel()` luôn dùng `['CN','T2','T3','T4','T5','T6','T7']` và dạng `d/m`; dòng ngày `#dateLine` và báo cáo cuối ngày hard-code `vi-VN`; nhiều ô nhập tiền dùng `toLocaleString('vi-VN')` (xem §4.3). `fmt()` USD hiện ra `$1,000` (không có `.00`) trong khi bảng ghi `$1,000.00`. | §4 kiểm từng hàm, không chỉ kiểm 1–2 ví dụ tiền. Chốt lại mẫu USD đúng là `$1,000` hay `$1,000.00` rồi sửa bảng/code cho khớp. |
| 0.6 | **Không có logic số nhiều (plural) trong code** (không thấy xử lý 0 / 1 / nhiều cho EN). | §5: nếu v1 có bất kỳ chuỗi đếm nào thì phải có quy tắc plural; nếu không có chuỗi đếm nào trong 80 thì ghi rõ "v1 không có chuỗi đếm — §5 N/A có lý do". |

---

## 1. Đếm chuỗi VI/EN — đủ số, không thiếu, không thừa

### 1.1 Tổng số và số theo mục (đối chiếu bảng, không đếm bằng cảm giác)

- [ ] Tổng đúng **80 chuỗi**: A 10 + B 5 + C 12 + D 8 + E 8 + F 3 + G 8 + H 6 + I 13 + J 4 + K 3 = 80.
- [ ] Đếm lại từng mục trong bảng và trong file i18n đã nối vào app, khớp nhau từng mục:

| Mục | Chuỗi | Số lượng phải có |
|---|---|---|
| A. App, tab, thao tác chung (#1–10) | `app.name`, `nav.today`, `nav.jobs`, `nav.money`, `nav.depts`, `nav.assistant`, `common.save`, `common.cancel`, `common.delete`, `common.edit` | 10 |
| B. Hôm nay (#11–15) | `today.greeting`, `today.noShoot`, `today.upcoming`, `today.noJobs`, `today.moneyToday` | 5 |
| C. Form job (#16–27) | `jobs.client`, `jobs.type`, `jobs.date`, `jobs.time`, `jobs.location`, `jobs.deadline`, `jobs.price`, `jobs.medium`, `jobs.note`, `jobs.deposit`, `jobs.paid`, `jobs.owed` | 12 |
| D. Loại chụp, chất liệu (#28–35) | `type.Portrait`, `type.Couple`, `type.Wedding`, `type.Lookbook`, `type.Event`, `medium.Digital`, `medium.Film`, `medium.Both` | 8 |
| E. Pipeline 8 bước (#36–43) | `stage.0` … `stage.7` | 8 |
| F. Điều khiển pipeline (#44–46) | `jobs.currentStage`, `jobs.nextStep`, `jobs.cancelled` | 3 |
| G. Sổ tiền (#47–54) | `money.income`, `money.expense`, `money.profit`, `money.report`, `money.addIncome`, `money.addExpense`, `money.noTx`, `money.month` | 8 |
| H. Phòng ban (#55–60) | `dept.Sen`, `dept.Nang`, `dept.May`, `dept.Lua`, `dept.Trang`, `dept.Den` | 6 |
| I. Cài đặt, cá nhân hoá (#61–73) | `settings.title`, `settings.yourName`, `settings.studioName`, `settings.language`, `settings.currency`, `settings.priceTable`, `settings.filmPriceTable`, `settings.theme`, `settings.logo`, `settings.templates`, `settings.restoreTemplates`, `settings.security`, `settings.version` | 13 |
| J. Google, Lịch iPhone, sao lưu (#74–77) | `google.login`, `cal.addiPhone`, `cal.importNative`, `backup.download` | 4 |
| K. Thông báo (#78–80) | `notify.saved`, `notify.deleted`, `notify.stuck` | 3 |

- [ ] Mỗi key có **cả hai cột VI và EN đều điền** — không ô trống, không ô chỉ có một ngôn ngữ, không dùng key làm bản dịch (ví dụ hiển thị `nav.today` thay vì "Hôm nay"/"Today").
- [ ] **Không trùng key** trong cùng một ngôn ngữ; key viết đúng dạng trong bảng (phân biệt hoa/thường: `type.Portrait`, `dept.Nang`…).
- [ ] **Không thừa chuỗi ngoài 80:** mọi chuỗi EN/VI trong app thuộc Nấc 2/3 (đồng bộ CloudKit, nhóm/studio và vai trò, sao lưu mã hoá, góp ý qua email) hoặc chuỗi chưa chốt v1 (tìm kiếm, "Quay lại") nếu xuất hiện thì phải liệt kê ở §10 và quyết định: đưa vào bảng (đổi tổng 80) hay gỡ khỏi app v1. Không tự ý cộng thêm mà không đổi tổng.
- [ ] Kiểm bằng lệnh (chạy trên file i18n thật sau khi nối, không đếm tay trên `.md`):

```bash
# Đếm key mỗi ngôn ngữ trong file i18n đã nối (thay <file-i18n> bằng file thật)
grep -o '"[a-zA-Z0-9_.]*":' <file-i18n> | sort | uniq -c | sort -rn
# So key VI với key EN — danh sách lệch phải rỗng
# (dán kết quả vào §10)
```

### 1.2 Bảy chuỗi MỚI — kiểm riêng, thiếu 1 là TRƯỢT

| # | Key | VI | EN | Đã có trong app? |
|---|---|---|---|---|
| 11 | `today.greeting` | Chào {name}! | Hello {name}! | [ ] |
| 15 | `today.moneyToday` | Tiền hôm nay | Today's money | [ ] |
| 28 | `type.Portrait` | Chân dung | Portrait | [ ] |
| 30 | `type.Wedding` | Cưới | Wedding | [ ] |
| 52 | `money.addExpense` | Ghi chi | Add expense | [ ] |
| 65 | `settings.currency` | Tiền tệ | Currency | [ ] |
| 80 | `notify.stuck` | Job kẹt ở bước {stage} | Job stuck at {stage} | [ ] |

- [ ] Cả 7 chuỗi trên đã xuất hiện trong app (không chỉ trong bảng), đúng màn hình, đúng vị trí.
- [ ] Riêng #28/#30: khi chọn `locale = vi`, nhãn loại chụp hiện "Chân dung" / "Cưới" (không còn hiện nguyên "Portrait" / "Wedding"); khi `locale = en` vẫn hiện "Portrait" / "Wedding".
- [ ] Riêng #65: nhãn mục "Tiền tệ" / "Currency" đã có, không chỉ có hai nút "VND (₫)" / "USD ($)".

### 1.3 Chuỗi đã "CÓ" trong code — kiểm lại, không tin cột "Trong code v1" mù

- [ ] 73 chuỗi ghi "CÓ" trong bảng: kiểm lại từng chuỗi trên app thật (bật từng màn hình), vì cột đó đối chiếu ngày 20/11/2026 và code có thể đã đổi sau đó.
- [ ] Chuỗi nào trong 73 mà thực tế chỉ có dạng rời rạc / gần giống (ví dụ #11: "Chào" và "bạn" rời rạc, chưa phải chuỗi đầy đủ) thì chuyển sang danh sách MỚI và kiểm như §1.2.

---

## 2. Chỗ trống (placeholder) — đúng tên, đủ số, không rò ra màn hình

### 2.1 Placeholder trong 80 chuỗi (bảng I18N)

Bảng chỉ dùng 2 placeholder. Kiểm cả hai:

| Placeholder | Chuỗi dùng | Quy tắc |
|---|---|---|
| `{name}` | #11 `today.greeting`: "Chào {name}!" / "Hello {name}!" | Tên người dùng, điền từ Cài đặt → Tên của bạn. |
| `{stage}` | #80 `notify.stuck`: "Job kẹt ở bước {stage}" / "Job stuck at {stage}" | Tên bước pipeline, **phải dịch theo locale đang bật** (ví dụ EN: "Job stuck at Deposit confirmed", không phải "Job stuck at Chốt cọc"). |

- [ ] Tên placeholder **giữ nguyên khi dịch** — không dịch `{name}` thành `{tên}`, không dịch `{stage}` thành `{bước}`.
- [ ] Mọi chuỗi có placeholder đều được điền đủ trước khi hiển thị: không còn `{name}` / `{stage}` thô trên màn hình, kể cả khi tên người dùng trống (khi đó phải có fallback — ví dụ "Chào bạn!" / "Hello!" — và ghi rõ fallback đã chốt là gì).
- [ ] Placeholder ở đúng vị trí ngữ pháp của từng ngôn ngữ (VI "Chào {name}!" ↔ EN "Hello {name}!" — kiểm dấu `!`, khoảng trắng, dấu câu đi kèm).
- [ ] Kiểm bằng lệnh: tìm mọi `{...}` còn sót trong bản build / chuỗi đã render; danh sách sót phải rỗng (trừ placeholder hợp lệ trong file mẫu chưa điền — nếu có thì liệt kê).

### 2.2 Placeholder trong mẫu tin nhắn / email (ngoài 80 chuỗi — xem §8)

Danh sách đầy đủ trong code (`TPLS` 6 mẫu, `MAIL_TPLS_DEFAULT` 5 mẫu, hàm `fillTpl`):

`{ten}` `{type}` `{date}` `{time}` `{loc}` `{price}` `{dep}` `{pct}` `{paid}` `{owe}` `{drive}` `{studio}` `{sign}` `{ig}` `{gia}` — và các phần điều kiện `{depPart}` `{owePart}` `{owePart2}` `{driveOrNote}` (chỉ hiện khi có cọc / còn thiếu / có link Drive).

- [ ] Mọi placeholder trong danh sách trên đều có trong `fillTpl` map; placeholder nào không có trong map thì phải báo lỗi rõ ràng, không để lọt ra email/tin nhắn gửi khách.
- [ ] `{depPart}` chỉ hiện khi có cọc; `{owePart}` / `{owePart2}` chỉ hiện khi còn thiếu (`oweN`); `{driveOrNote}` có fallback khi chưa có link Drive. Kiểm cả 3 trường hợp: có cọc + còn thiếu, không cọc, đã thu đủ.
- [ ] `{price}` `{paid}` `{owe}` `{dep}` trong mẫu đã qua định dạng tiền theo §4 (không phải số thô `15000000`).
- [ ] `{date}` `{time}` trong mẫu đã qua định dạng ngày/giờ theo locale (§4.4).
- [ ] Người dùng sửa mẫu trong Cài đặt (khôi phục mẫu gốc có sẵn): mẫu đã sửa vẫn giữ được placeholder; nếu người dùng xoá mất một placeholder thì app báo rõ (hoặc tự điền rỗng có chủ ý) — ghi rõ hành vi đã chốt.

---

## 3. Dịch đúng và nhất quán — thuật ngữ, tên riêng, thứ tự

### 3.1 Thuật ngữ chốt (glossary) — một khái niệm, một từ, cả app

- [ ] **Tên app:** `FotoBro` ở cả VI và EN, mọi màn hình.
- [ ] **6 phòng ban — giữ tên Việt + chú thích Anh** (không dịch tên riêng): Sen (Lotus), Nắng/Nang (Sunshine), Mây/May (Cloud), Lúa/Lua (Rice), Trăng/Trang (Moon), Đèn/Den (Lantern). Kiểm đúng cả 6, đúng chú thích trong bảng #55–60.
- [ ] **Pipeline 8 bước giữ nguyên thứ tự và tên bước** (#36–43): Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong / Consulting → Deposit confirmed → Ready to shoot → Shot → Selecting photos → Post-production → Delivered → Done. Kiểm thứ tự trên cả hai ngôn ngữ, kể cả khi nhảy thẳng tới bước bất kỳ (§ pipeline v1).
- [ ] **Loại chụp:** Portrait / Couple / Wedding / Lookbook / Event — nhãn VI theo bảng #28–32 (Chân dung / Cặp đôi / Cưới / Lookbook / Sự kiện); `Lookbook` giữ nguyên ở cả hai ngôn ngữ.
- [ ] **Chất liệu:** Digital / Film / Cả hai — EN: Digital / Film / Both (#33–35).
- [ ] **Tiền:** "Còn thiếu" (không phải "Còn nợ" của bản prototype) / "Balance due" (#27); "Cọc" / "Deposit"; "Đã thu" / "Collected" (§ C). "Ghi thu" / "Add income" và "Ghi chi" / "Add expense" phải song song nhau (đừng để một bên có, một bên thiếu như trước).
- [ ] **"Quay lại" / tìm kiếm:** nếu hai chuỗi này xuất hiện trong app thì đưa vào bảng hoặc gỡ — không để chuỗi tiếng Việt lạc trong bản EN (xem §1.1, mục thừa/thiếu).
- [ ] **Lệch cần chốt trước khi ĐẠT (§0.3):** `nav.depts` EN là "Departments" (bảng) hay "Studio" (code)? Ghi quyết định vào §10, sửa cả hai nơi cho khớp.
- [ ] Không còn chuỗi tiếng Việt nào lẫn trong bản EN ngoài các ngoại lệ đã chốt (tên phòng ban, `FotoBro`, `Lookbook`, tên studio/người dùng do người dùng tự nhập). Kiểm bằng cách bật EN rồi đi hết mọi màn hình (§7).

### 3.2 Giọng văn và chính tả

- [ ] EN: đúng chính tả, đúng ngữ pháp; không dịch từng từ (word-for-word) kiểu "Money today" sai ngữ cảnh; kiểm lại các chuỗi dài: "Restore original templates", "Add to iPhone Calendar", "Import from iPhone Calendar".
- [ ] VI: đúng dấu, đúng từ chuyên môn nhiếp ảnh ("Buổi chụp", "Hậu kỳ", "Chọn ảnh"); không lẫn từ EN trừ từ đã chốt giữ nguyên.
- [ ] Dấu câu đi kèm chuỗi: `!` trong "Chào {name}!" / "Hello {name}!"; không thừa/thiếu khoảng trắng trước dấu câu ở bản EN.
- [ ] Chuỗi trong thông báo (toast) ngắn, đọc được trong 1–2 giây: "Đã lưu" / "Saved", "Đã xoá" / "Deleted".

---

## 4. Tiền và ngày — định dạng theo locale, không quy đổi tỷ giá

### 4.1 Tiền hiển thị chính (`fmt()`)

- [ ] VND: `1.000.000₫` — dấu chấm phân tách nghìn, ký hiệu `₫` đặt sau số.
- [ ] USD: chốt mẫu đúng rồi kiểm theo mẫu đó — hiện code ra `$1,000` (không thập phân), bảng ghi `$1,000.00`. **Chọn một mẫu, sửa bảng/code cho khớp, ghi quyết định vào §10.** Không để bảng và app khác nhau.
- [ ] **Không quy đổi tỷ giá:** cùng một số tiền gốc, đổi VND ↔ USD chỉ đổi ký hiệu/dấu phân tách, con số không đổi. Kiểm với các mốc: 0, 1.000, 999.500, 1.000.000, 15.000.000, 100.000.000.
- [ ] Số âm (chi vượt thu / tiền âm): dấu trừ hiển thị đúng cả hai locale, không mất dấu, không thành `−` lạ ở một nơi và `-` ở nơi khác.

### 4.2 Tiền rút gọn (`fmtParts` / `fmtShort` / `fmtTiny`)

| Hàm | VI | EN | Kiểm |
|---|---|---|---|
| `fmtParts` ≥ 999.500 | `… triệu` | `… M` | [ ] |
| `fmtParts` ≥ 1.000 | `… nghìn` | `… k` | [ ] |
| `fmtParts` < 1.000 | `… đồng` | (không đơn vị) | [ ] |
| `fmtTiny` ≥ 1.000.000 | hiện ra `"tr"` — **sai locale khi bật EN** (§0.5) | phải là dạng EN | [ ] |
| `fmtTiny` ≥ 1.000 | `"k"` | `"k"` | [ ] |

- [ ] Dấu thập phân trong số rút gọn đúng locale: VI dùng dấu phẩy (`1,5 triệu`), EN dùng dấu chấm (`1.5M`).
- [ ] Ngưỡng rút gọn không làm mất ý nghĩa số tiền: 999.499 không nhảy lên "1 triệu" / "1M"; 999.500 trở lên mới rút gọn theo quy tắc đã chốt.

### 4.3 Ô nhập tiền — chỗ hay sót nhất

- [ ] Các ô nhập giá / cọc / thu / chi: khi `currency = USD` + `locale = en`, số nhập vào hiển thị theo định dạng EN (dấu phẩy phân tách nghìn), **không** còn hard-code `toLocaleString('vi-VN')` như hiện tại ở nhiều chỗ trong code. Liệt kê từng ô đã kiểm (giá job, cọc, ghi thu, ghi chi, bảng giá, bảng giá film).
- [ ] Nhập số có dấu phân tách (`1.000.000` hay `1,000,000`) đều parse đúng, không nhân 1000 lần / mất số 0.
- [ ] Placeholder trong ô nhập tiền (ví dụ `"6.000.000"`) đổi theo locale/currency, hoặc ghi rõ quyết định giữ nguyên.

### 4.4 Ngày và giờ

- [ ] Ngày chụp / hạn giao ảnh: VI `vi-VN` (thứ, ngày/tháng), EN `en-US` — kiểm `fmtDate()` và `fmtHeaderDate()` trên cả hai locale.
- [ ] **Ngày tương đối:** Hôm nay / Ngày mai / Hôm qua ↔ Today / Tomorrow / Yesterday — kiểm đúng cả 3, cả hai ngôn ngữ.
- [ ] **Lệch đã biết (§0.5):** `fmtRel()` hiện luôn trả `T2…T7, d/m` kể cả khi bật EN; dòng ngày `#dateLine` và báo cáo cuối ngày hard-code `vi-VN`. Kiểm và ghi rõ: đã sửa hay đã chốt giữ nguyên (và vì sao) — không để sót không ghi.
- [ ] Định dạng ngày trong mẫu email (§2.2) khớp locale người gửi đang dùng; ngày trong file sao lưu / xuất lịch không bị đổi theo locale (ngày xuất phải là ngày thật, không phải chuỗi đã dịch).
- [ ] Múi giờ: ngày chụp không lệch 1 ngày khi đổi múi giờ / khi nhập từ Lịch iPhone (kiểm job có ngày 29/02, job qua nửa đêm).

---

## 5. Số nhiều (plural) và đếm

- [ ] Liệt kê **mọi chuỗi đếm** trong app v1 (ví dụ: số job, số ảnh, số khoản, số ngày kẹt). Nếu không có chuỗi đếm nào trong 80 chuỗi thì ghi rõ "v1 không có chuỗi đếm — mục này N/A" và bỏ qua các ô dưới.
- [ ] Với mỗi chuỗi đếm (nếu có), kiểm đủ 3 dạng EN: **0** (no jobs / 0 jobs), **1** (1 job), **nhiều** (2 jobs) — và dạng VI tương ứng (VI không chia số nhiều nhưng vẫn phải đúng: "0 job" không được hiện thành "0 jobs" ở bản VI, và ngược lại).
- [ ] Không dùng cách ghép chuỗi kiểu `"You have " + n + " job(s)"` — kiểm trong code, dạng `(s)` lộ ra màn hình là TRƯỢT.
- [ ] Số đếm trong câu có placeholder số phải qua đúng định dạng locale (dấu phân tách nghìn khi số lớn).

---

## 6. Tràn UI — iPhone SE và iPhone lớn

### 6.1 Thiết bị kiểm (bắt buộc cả hai đầu)

| Thiết bị | Kích thước | Ghi chú |
|---|---|---|
| iPhone SE (thế hệ 1) | 320 × 568 pt | Hẹp nhất — nơi dễ tràn nhất. Nếu chỉ có SE 2020/2022 thì kiểm thêm bằng giả lập 320 pt và ghi rõ. |
| iPhone SE (2020/2022) | 375 × 667 pt | Màn hình nhỏ phổ biến. |
| iPhone lớn (Pro Max) | 430 × 932 pt | Kiểm chữ không quá nhỏ / không giãn lệch, nút không quá xa nhau. |

- [ ] Kiểm trên **máy thật** (iPhone của Việt / máy test), không chỉ giả lập trình duyệt desktop. Ghi rõ model + iOS đã kiểm vào §10.
- [ ] Kiểm cả **sáng (light) và tối (dark)** — theme Tối trong Cài đặt; chữ EN dài hơn không bị chìm / mất tương phản trên nền tối.
- [ ] Kiểm cả **3 preset màu chủ đề** (Ấm, Tối giản, Tối) ở màn hình có chuỗi dài nhất (§6.2).

### 6.2 Chuỗi dài nhất — kiểm trước (EN thường dài hơn VI)

| Chuỗi | VI | EN (số ký tự) | Nơi hiện |
|---|---|---|---|
| `settings.restoreTemplates` | Khôi phục mẫu gốc (18) | Restore original templates (27) | Cài đặt |
| `cal.importNative` | Nhập từ Lịch iPhone (20) | Import from iPhone Calendar (28) | Cài đặt / Onboarding |
| `cal.addiPhone` | Thêm vào Lịch iPhone (20) | Add to iPhone Calendar (23) | Chi tiết job |
| `jobs.currentStage` | Đang ở bước (12) | Currently at step (17) | Chi tiết job |
| `stage.1` | Chốt cọc (8) | Deposit confirmed (17) | Pipeline |
| `stage.4` | Chọn ảnh (8) | Selecting photos (16) | Pipeline |
| `stage.5` | Hậu kỳ (6) | Post-production (16) | Pipeline |
| `notify.stuck` | Job kẹt ở bước {stage} | Job stuck at {stage} (dài thêm khi {stage} là "Deposit confirmed") | Thông báo |

- [ ] Từng chuỗi trên: không tràn, không cắt chữ giữa chừng, không đè lên nút/icon bên cạnh, không rớt xuống 2 dòng một cách xấu (nếu xuống 2 dòng thì phải có chủ ý và đều nhau).
- [ ] **Tab bar 5 tab** (Hôm nay / Buổi chụp / Tiền bạc / Phòng ban / Trợ lý ↔ Today / Shoots / Money / Departments hay Studio / Assistant): trên SE 320 pt, cả 5 nhãn đều đọc được, không cắt, không chồng nhau. Đây là chỗ dễ TRƯỢT nhất vì "Departments" dài hơn "Phòng ban".
- [ ] **Nút đoạn (segmented control)** Ngôn ngữ / Tiền tệ: "Tiếng Việt" / "English" và "VND (₫)" / "USD ($)" đều vừa trong nút trên SE.
- [ ] **Tiêu đề sheet** (`.sheet-head b`, `max-width: 52vw`, ellipsis): tên job dài + chuỗi EN dài không làm vỡ tiêu đề.
- [ ] **Hàng tiền** (`.row .val`, `max-width: 55%`): số tiền dài (100.000.000₫ / $100,000,000) không đè lên nhãn bên trái, trên cả SE và máy lớn.
- [ ] **Form job:** nhãn + ô nhập (Giá, Cọc, Còn thiếu…) không tràn khi bật EN; ô nhập tiền không bị che bởi bàn phím (kiểm trên máy thật).
- [ ] **Pipeline 8 bước:** tên bước EN dài ("Deposit confirmed", "Selecting photos") vừa trong chip/bước trên SE; khi nhảy bước, nhãn bước hiện tại không tràn.
- [ ] **Toast / thông báo:** "Job stuck at Deposit confirmed" không tràn màn hình SE, đọc được trọn vẹn.
- [ ] Không có thanh cuộn ngang (`overflow-x`) xuất hiện ở bất kỳ màn hình nào, ở cả hai ngôn ngữ, trên cả hai cỡ máy. Kiểm bằng cách vuốt ngang từng màn hình.

---

## 7. Chuyển ngôn ngữ trong app (runtime)

- [ ] Đổi VI ↔ EN trong Cài đặt: **mọi chuỗi trong 80** đổi ngay, không cần khởi động lại app; không còn màn hình nào giữ tiếng cũ sau khi đổi.
- [ ] Lựa chọn ngôn ngữ **được lưu lại** (đóng app mở lại vẫn giữ EN nếu đã chọn EN).
- [ ] **Fallback:** key nào thiếu bản EN thì hiện bản VI (theo hàm `tr()` trong code: `d[k] || I18N.vi[k] || k`) — và key thiếu đó phải được liệt kê vào §10 để bổ sung, không coi fallback là ĐẠT. Key thô (ví dụ `nav.today`) **không bao giờ** hiện ra màn hình.
- [ ] Không có màn hình **nửa VI nửa EN** sau khi đổi ngôn ngữ (trừ ngoại lệ đã chốt ở §3.1: tên phòng ban, `FotoBro`, tên do người dùng nhập).
- [ ] Dữ liệu người dùng không bị dịch theo: tên khách, tên studio, ghi chú, tên job do người dùng nhập giữ nguyên khi đổi ngôn ngữ; chỉ nhãn giao diện đổi.
- [ ] Lịch / ngày / tiền đổi theo locale ngay khi đổi ngôn ngữ (§4), không cần nhập lại dữ liệu.
- [ ] Giọng nói (nếu kiểm cùng đợt): lệnh thoại tiếng Việt vẫn chạy khi giao diện đang EN, hoặc ghi rõ hành vi đã chốt (hiện code đặt `recog.lang = 'vi-VN'`).

---

## 8. Mẫu tin nhắn / email — kiểm riêng (ngoài 80 chuỗi)

Phạm vi: 6 mẫu nhắn tin `TPLS` + 5 mẫu email `MAIL_TPLS_DEFAULT` (tiêu đề + nội dung). Hiện chỉ có tiếng Việt.

- [ ] **Quyết định v1 đã chốt và ghi vào §10:** mẫu tin nhắn/email có bản EN không, hay v1 vẫn gửi tiếng Việt cho mọi khách? Nếu vẫn VI thì ghi rõ lý do + không kiểm các ô EN dưới đây (đánh N/A có lý do).
- [ ] Nếu có bản EN: mỗi mẫu có đủ cả VI lẫn EN; tiêu đề email cũng dịch (ví dụ "Xác nhận lịch chụp {type} — {studio}"), không để tiêu đề VI với nội dung EN.
- [ ] Placeholder theo §2.2: điền đủ, đúng tiền/ngày theo §4, phần điều kiện chỉ hiện khi đúng điều kiện.
- [ ] Gửi thử 1 email mẫu cho chính mình (địa chỉ test): đọc trên iPhone, kiểm không còn placeholder thô, không lỗi font/dấu, link Drive (nếu có) bấm được.
- [ ] Mẫu do người dùng sửa trong Cài đặt: sau khi "Khôi phục mẫu gốc", mẫu về đúng bản gốc của locale đang dùng (không về bản VI khi đang EN).

---

## 9. Ai kiểm, khi nào — vai trò và cổng kiểm (gate)

| Vai trò | Người | Việc kiểm | Khi nào |
|---|---|---|---|
| Người nối i18n (dev) | Người làm bản nối i18n | §1 (đếm key bằng lệnh), §2 (placeholder), §7 (đổi ngôn ngữ) | Ngay sau khi nối xong, trước khi giao cho người khác kiểm |
| Người soát dịch (reviewer) | Người soát VI/EN (không phải người dịch) | §3 (thuật ngữ, giọng văn), §5 (số nhiều) | Sau khi dev xong, trước khi kiểm trên máy thật |
| Người kiểm máy thật | Việt (iPhone của Việt) | §6 (tràn UI SE + máy lớn), §4 (tiền/ngày trên máy thật), §8 (gửi thử email) | Trước khi đưa lên TestFlight; kiểm lại sau mỗi lần sửa chuỗi |
| Người duyệt cuối | Việt | §10 ký duyệt (ĐẠT / CHƯA ĐẠT + danh sách lỗi còn lại) | Trước khi nộp App Store |

- [ ] **Gate 1 — sau khi nối i18n:** §1 + §2 + §7 phải ĐẠT mới được kiểm máy thật. Chưa đủ 80 key thì không kiểm §6 (tràn UI sẽ phải kiểm lại).
- [ ] **Gate 2 — trước TestFlight:** §3 + §4 + §5 + §6 + §8 phải ĐẠT (hoặc N/A có lý do ghi rõ). Lỗi tràn UI trên SE là lỗi chặn (blocker), không được đưa lên TestFlight.
- [ ] **Gate 3 — trước khi nộp App Store:** kiểm hồi quy (regression) toàn bộ §1–§8 sau lần sửa chuỗi cuối cùng; Việt ký §10.
- [ ] **Kiểm lại sau mỗi lần sửa chuỗi:** bất kỳ chuỗi nào trong 80 bị sửa (dù chỉ 1 từ) thì kiểm lại: §1.1 (đếm), §2 (placeholder của chuỗi đó), §6.2 (nếu chuỗi dài ra), §7 (đổi ngôn ngữ qua chuỗi đó). Không sửa chuỗi "nhỏ" rồi bỏ qua kiểm.
- [ ] Mỗi lần kiểm ghi lại: ngày kiểm, người kiểm, máy + iOS, locale/currency đã kiểm, kết quả từng mục (§10).

---

## 10. Bảng kết quả và ký duyệt

Điền sau mỗi lần kiểm. Một mục chỉ ghi ĐẠT khi có bằng chứng (ảnh chụp màn hình / kết quả lệnh / ghi chú máy đã kiểm).

| Mục | Kết quả (ĐẠT / TRƯỢT / N/A) | Bằng chứng / ghi chú |
|---|---|---|
| §1.1 Đếm chuỗi (80, theo mục) | | |
| §1.2 Bảy chuỗi MỚI | | |
| §1.3 Chuỗi "CÓ" kiểm lại | | |
| §2.1 Placeholder {name} {stage} | | |
| §2.2 Placeholder mẫu tin/email | | |
| §3.1 Thuật ngữ, tên riêng, thứ tự | | Quyết định `nav.depts` EN: "Departments" hay "Studio"? |
| §3.2 Giọng văn, chính tả | | |
| §4.1 Tiền hiển thị chính | | Mẫu USD đã chốt: `$1,000` hay `$1,000.00`? |
| §4.2 Tiền rút gọn | | |
| §4.3 Ô nhập tiền | | |
| §4.4 Ngày và giờ | | |
| §5 Số nhiều và đếm | | |
| §6.1 Thiết bị (SE + máy lớn, sáng/tối) | | Model + iOS đã kiểm: |
| §6.2 Chuỗi dài nhất, tab bar, form | | |
| §7 Chuyển ngôn ngữ runtime | | |
| §8 Mẫu tin nhắn / email | | Quyết định v1: mẫu có bản EN không? |
| §9 Gate đã qua (1 / 2 / 3) | | |

**Lỗi còn lại (mỗi lỗi một dòng — mô tả, màn hình, locale, máy):**

1.
2.

**Ký duyệt:**

- Người kiểm máy thật (Việt): ______________________ Ngày: __________
- Kết luận: [ ] ĐẠT — được đưa lên TestFlight / nộp App Store &nbsp;&nbsp; [ ] CHƯA ĐẠT — sửa các lỗi trên rồi kiểm lại từ Gate đã ghi ở §9

---

## Phụ lục — Danh sách kiểm nhanh (dán vào ghi chú khi kiểm trên iPhone)

```
[ ] Bật EN → đi hết 5 tab → không còn chữ VI (trừ tên phòng ban, FotoBro)
[ ] Bật VI → đi hết 5 tab → không còn chữ EN (trừ Lookbook, Digital, Film)
[ ] Đổi VND ↔ USD → số tiền không đổi, chỉ đổi ký hiệu
[ ] SE 320/375 pt: tab bar đủ 5 nhãn, không cắt
[ ] SE: "Restore original templates" không tràn
[ ] SE: "Import from iPhone Calendar" không tràn
[ ] Tạo job mẫu: Chào {name}! hiện đúng tên, không còn {name}
[ ] Job kẹt: "Job stuck at …" hiện đúng tên bước đã dịch
[ ] Ghi chi: nút "Add expense" có mặt khi bật EN
[ ] Đóng app mở lại: vẫn giữ ngôn ngữ đã chọn
```
