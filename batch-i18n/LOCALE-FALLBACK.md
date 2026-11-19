# FotoBro iOS v1 — Quy tắc fallback khi thiếu locale (LOCALE-FALLBACK)

- Phạm vi: app FotoBro iOS v1, chỉ 2 locale `vi` / `en` (theo `I18N-STRINGS.md`: 80 chuỗi, `locale` chỉ nhận `'vi'` / `'en'`).
- Đối chiếu ngày 20/11/2026 với `www/index.html` và `I18N-STRINGS.md`. Tài liệu quy tắc, **không sửa code**.
- Ngôn ngữ mặc định của app là **tiếng Việt**. Tiếng Anh là lựa chọn do người dùng bật thủ công trong Cài đặt, không tự bật theo máy.

## 0. Code hiện tại đang làm gì (căn cứ để ra quy tắc)

Những điểm dưới đây là hành vi thật trong `www/index.html` — quy tắc ở các mục sau giữ nguyên chúng, trừ khi ghi rõ là "quy tắc mới cho lúc nối đủ 80 chuỗi":

| # | Hành vi trong code | Vị trí |
|---|---|---|
| 1 | Mặc định `locale:'vi'` trong `DEFAULT_CFG` | `www/index.html` ~dòng 819 |
| 2 | `mergeCfg` chuẩn hoá: `o.locale = o.locale === 'en' ? 'en' : 'vi'` — mọi giá trị khác `'en'` (kể cả `'fr'`, `'EN'`, `''`, `null`, sai kiểu) đều thành `'vi'` | ~dòng 838 |
| 3 | `loc()` trả `'en'` chỉ khi `cfg.locale === 'en'`, còn lại `'vi'` | ~dòng 953 |
| 4 | `tr(k)`: lấy chuỗi ở locale hiện tại, thiếu thì lấy chuỗi `vi`, thiếu cả hai thì trả về chính key `k` — không bao giờ trả chuỗi rỗng | ~dòng 954: `I18N[loc()][k] \|\| I18N.vi[k] \|\| k` |
| 5 | `I18N` trong code hiện chỉ có 16 key tối thiểu (tab, Hôm nay, chào theo buổi…); phần còn lại (chi tiết job, sổ tiền, phòng ban, trợ lý, báo cáo) vẫn hard-code tiếng Việt | ~dòng 950–952, ghi chú ngay trên `I18N` |
| 6 | `applyLocale()` hiện chỉ đổi nhãn 5 tab + tiêu đề mục "Cần nhớ hôm nay"; được gọi trong `renderHome()` (qua `renderAll()`) | ~dòng 955–964, 1201, 2274 |
| 7 | **Không có** `navigator.language` / `navigator.languages` / `Locale.current` trong `www/` và `ios/` — app không đọc ngôn ngữ hệ thống | grep toàn `www/`, `ios/`, `capacitor.config.ts` ngày 20/11/2026: 0 kết quả |
| 8 | `<html lang="vi">` hard-code; `Info.plist` có `CFBundleDevelopmentRegion = en` (chỉ ảnh hưởng chuỗi hệ thống iOS, không ảnh hưởng chuỗi trong app) | `www/index.html` dòng 2; `ios/App/App/Info.plist` dòng 7 |
| 9 | Đổi ngôn ngữ trong Cài đặt: bấm nút `Tiếng Việt` / `English` → `state.cfg.locale = …; saveLocal(); renderAll(); refreshSettings();` — đổi ngay, không cần khởi động lại | ~dòng 2361–2362, 2491 |
| 10 | Ngôn ngữ và tiền tệ độc lập: `currency` chỉ nhận `'USD'` / `'VND'` (`mergeCfg` tương tự mục 2); `fmt()` đổi ký hiệu theo `currency`, `fmtDate()` đổi định dạng theo `loc()` | ~dòng 839, 964, 977 |

## 1. Thứ tự ưu tiên ngôn ngữ

```
1. Lựa chọn người dùng đã lưu (cfg.locale trong localStorage, key troLyXeo.v1)
2. Mặc định: tiếng Việt (vi)
```

- **Không có bước "đọc ngôn ngữ hệ thống" trong v1.** Thứ tự chỉ có 2 nấc trên.
- Vì sao VI trước: người dùng chính là nhiếp ảnh gia Việt; 73/80 chuỗi đã có sẵn bằng tiếng Việt trong code; `DEFAULT_CFG.locale = 'vi'`.
- Khi nào về VI: chưa từng chọn; giá trị lưu bị hỏng / sai kiểu / là locale lạ (xem mục 3); khôi phục bản sao lưu có `locale` lạ (do `mergeCfg` chuẩn hoá, mục 0.2).
- Khi nào EN: chỉ khi người dùng đã bấm `English` trong Cài đặt và lựa chọn đó còn lưu trong `cfg.locale`.
- Lựa chọn đã lưu **thắng mọi thứ khác**, kể cả ngôn ngữ hệ thống (ví dụ ở mục 3, ví dụ 7).

## 2. Khi chuỗi tiếng Anh thiếu thì hiện gì

Áp dụng đúng chuỗi fallback của `tr()` (mục 0.4), theo thứ tự:

```
1. Chuỗi EN của key đó (nếu có)
2. Chuỗi VI của key đó (nếu EN thiếu) — đây là trường hợp thường gặp nhất ở v1
3. Chính key đó, dạng nguyên văn (vd "money.addExpense") — chỉ khi cả EN lẫn VI đều thiếu
```

Quy tắc chi tiết:

- **Không bao giờ hiện ô trống, không hiện `undefined` / `null`.** Thiếu EN thì hiện VI, giao diện vẫn dùng được đầy đủ.
- **Không tự dịch máy, không đoán chuỗi EN.** Thiếu thì giữ VI, ghi vào danh sách chuỗi còn thiếu để bổ sung (7 chuỗi MỚI trong `I18N-STRINGS.md`: #11 `today.greeting`, #15 `today.moneyToday`, #28 `type.Portrait`, #30 `type.Wedding`, #52 `money.addExpense`, #65 `settings.currency`, #80 `notify.stuck`).
- **Trường hợp 3 (hiện key) là lỗi, không phải trạng thái bình thường.** Key hiện ra để lập trình viên thấy ngay chuỗi nào chưa được thêm; khi nối đủ 80 chuỗi, trường hợp này không được xảy ra với bất kỳ key nào trong bảng.
- **Placeholder giữ nguyên, không dịch tên placeholder.** `{name}` và `{stage}` giữ nguyên tên trong cả hai ngôn ngữ; chỉ dịch phần chữ xung quanh. Giá trị điền vào placeholder cũng fallback theo cùng quy tắc (tên bước pipeline lấy theo locale hiện tại, thiếu EN thì lấy tên bước tiếng Việt — xem ví dụ 12).
- **Tên riêng không fallback kiểu dịch:** `FotoBro` không dịch ở cả hai locale; tên 6 phòng ban giữ tên Việt + chú thích Anh ở chế độ EN (`Sen (Lotus) — Client welcome`), không dịch `Sen` thành `Lotus` đứng một mình (theo `I18N-STRINGS.md`, mục H); tên loại chụp trong code đang là tiếng Anh (`Portrait`…) nên ở chế độ VI hiện nhãn VI (`Chân dung`), ở chế độ EN hiện tên gốc.
- **Dữ liệu người dùng không thuộc fallback:** tên khách, ghi chú, tên studio, mẫu tin nhắn đã sửa — hiện đúng như người dùng đã gõ, không dịch, không đổi theo locale (xem ví dụ 14).

## 3. Khi ngôn ngữ hệ thống là ngôn ngữ thứ ba

Ngôn ngữ thứ ba = bất kỳ ngôn ngữ nào ngoài VI và EN (Pháp, Đức, Nhật, Hàn, Trung, Thái…), kể cả biến thể vùng (`en-US`, `en-GB`, `vi-VN`, `zh-Hant`…).

- **V1: app bỏ qua hoàn toàn ngôn ngữ hệ thống.** Không đọc, không suy ra locale từ máy, không hiện một phần bằng ngôn ngữ thứ ba.
- Máy để tiếng Pháp / Đức / Nhật / … + người dùng chưa từng chọn ngôn ngữ trong app → app hiện **tiếng Việt** (mặc định, mục 1).
- Máy để tiếng Anh + người dùng chưa từng chọn → app **vẫn hiện tiếng Việt** (không tự bật EN). Muốn EN thì vào Cài đặt → Ngôn ngữ → bấm `English` (1 chạm).
- Người dùng đã chọn EN, sau đó đổi máy sang tiếng Pháp → app **vẫn EN** (lựa chọn đã lưu thắng hệ thống).
- Nếu sau này (v1.1+) mới thêm tự nhận ngôn ngữ hệ thống, quy tắc sẽ là: hệ thống `en*` → EN, mọi ngôn ngữ khác → VI; **không thêm locale thứ ba** nếu chưa có bảng chuỗi đầy đủ cho ngôn ngữ đó. Quyết định này chưa chốt ở v1, không làm trong phạm vi file này.
- `CFBundleDevelopmentRegion = en` trong `Info.plist` không làm app hiện EN — nó chỉ là vùng mặc định của bundle iOS.

## 4. Khi người dùng đổi ngôn ngữ giữa chừng

- **Đổi ngay lập tức, không cần khởi động lại app, không tải lại trang.** Cơ chế hiện tại: bấm nút trong Cài đặt → `saveLocal()` → `renderAll()` → `refreshSettings()` (mục 0.9). Toàn bộ màn hình đang mở vẽ lại bằng locale mới.
- **Dữ liệu không đổi:** job, tiền bạc, trạng thái pipeline, checklist, tên khách, ghi chú, mẫu tin nhắn — giữ nguyên, không dịch, không mất, không đổi số tiền.
- **Tiền tệ không đổi theo ngôn ngữ.** Đổi VI → EN không tự đổi VND → USD và ngược lại; `locale` và `currency` là hai lựa chọn độc lập (mục 0.10). Người dùng muốn đổi tiền thì đổi riêng ở mục Tiền tệ trong Cài đặt. Cả 4 tổ hợp đều hợp lệ: VI+VND, VI+USD, EN+VND, EN+USD.
- **Định dạng ngày / số đổi theo locale ngay:** `fmtDate()` dùng `vi-VN` ở chế độ VI, `en-US` ở chế độ EN; `fmtParts()` đổi `triệu`/`nghìn`/`đồng` ↔ `M`/`k`/`` theo locale.
- **Nội dung đang mở dở:** sheet/form đang mở giữ nguyên nội dung đã nhập; nhãn trong sheet đổi theo locale mới khi sheet vẽ lại. Thông báo (toast) đã hiện rồi thì giữ nguyên ngôn ngữ lúc nó hiện, không đổi ngược lại. Lịch sử chat với trợ lý giữ nguyên như đã ghi, không dịch lại.
- **Giới hạn đã biết ở v1 (không phải lỗi fallback, cần sửa khi nối đủ 80 chuỗi):** một số chuỗi trong code hiện hard-code tiếng Việt và chưa đi qua `tr()`, nên đổi sang EN vẫn hiện VI — gồm câu chào theo buổi ở `greetLine` (`Buổi sáng an lành`…), ngày ở `dateLine` (luôn `vi-VN`), các toast (`Đã lưu`, `Đã xoá`…), viết tắt thứ trong `fmtRel` (`CN`, `T2`…), tiêu đề báo cáo cuối ngày. Khi nối đủ 80 chuỗi, các chỗ này phải đi qua `tr()` thì quy tắc mục 2 mới phủ hết giao diện.

## 5. Ví dụ từng trường hợp

| # | Tình huống | Kết quả đúng |
|---|---|---|
| 1 | Cài mới, chưa chọn gì | Toàn app tiếng Việt (mặc định `locale:'vi'`) |
| 2 | Vào Cài đặt → bấm `English` | Tab đổi ngay: Today / Shoots / Money / Studio / Assistant; mục "Cần nhớ hôm nay" → "To remember today" |
| 3 | Chế độ EN, key `money.addExpense` chưa có chuỗi EN (chuỗi MỚI #52) | Hiện tiếng Việt: **"Ghi chi"** (fallback nấc 2, mục 2) |
| 4 | Chế độ EN, key thiếu cả EN lẫn VI (chuỗi chưa được thêm vào bảng) | Hiện nguyên key, vd `money.addExpense` — coi là lỗi cần bổ sung chuỗi, không phải hiển thị chuẩn |
| 5 | Máy để tiếng Pháp, chưa từng chọn ngôn ngữ | App tiếng Việt; không hiện tiếng Pháp |
| 6 | Máy để tiếng Anh, chưa từng chọn ngôn ngữ | App **vẫn tiếng Việt** (v1 không tự nhận ngôn ngữ hệ thống); muốn EN thì bấm `English` trong Cài đặt |
| 7 | Người dùng đã chọn EN, sau đó đổi máy sang tiếng Nhật | App vẫn EN (lựa chọn đã lưu thắng hệ thống) |
| 8 | Khôi phục bản sao lưu có `cfg.locale: "fr"` | `mergeCfg` chuẩn hoá thành `'vi'` → app tiếng Việt |
| 9 | Khôi phục bản sao lưu có `cfg.locale: "EN"` (viết hoa) | Không khớp `=== 'en'` nên thành `'vi'` → app tiếng Việt (so sánh phân biệt hoa/thường — xem mục 6) |
| 10 | Đang mở sheet sửa job, đổi VI → EN trong Cài đặt | Nhãn vẽ lại bằng EN; nội dung job đã nhập giữ nguyên; số tiền không đổi |
| 11 | Đang VI + VND, đổi ngôn ngữ sang EN | Tiền vẫn hiện VND (`1.000.000₫`), không tự đổi sang `$`; chỉ chữ đổi sang EN |
| 12 | Chế độ EN, thông báo `notify.stuck` chưa có chuỗi EN (chuỗi MỚI #80) | Hiện VI: **"Job kẹt ở bước {stage}"**, với `{stage}` là tên bước theo locale EN nếu có, thiếu thì tên bước tiếng Việt (vd "Chốt cọc") |
| 13 | Chế độ EN, phòng Sen | Hiện **"Sen (Lotus) — Client welcome"** — giữ tên Việt, không dịch thành "Lotus" |
| 14 | Chế độ EN, job của khách "Nguyễn Văn A", ghi chú "Chụp lúc 7h" | Hiện đúng "Nguyễn Văn A", "Chụp lúc 7h" — dữ liệu người dùng không dịch |
| 15 | Chế độ EN, ngày chụp 21/11/2026 | Hiện định dạng `en-US` (vd "Saturday, 11/21"); chế độ VI hiện `vi-VN` |
| 16 | Đổi EN → VI giữa chừng | Toàn app về tiếng Việt ngay, dữ liệu và tiền tệ giữ nguyên |

## 6. Checklist cho người nối i18n (để quy tắc này giữ đúng khi code đổi)

- [ ] Mọi chuỗi hiển thị đi qua `tr()`; không còn chuỗi hard-code tiếng Việt ngoài `I18N` (trừ dữ liệu người dùng) — nếu không, mục 4 sẽ còn chỗ không đổi theo locale.
- [ ] Giữ nguyên chuỗi fallback trong `tr()`: `EN → VI → key`, không trả chuỗi rỗng.
- [ ] Giữ nguyên chuẩn hoá trong `mergeCfg`: chỉ `'en'` mới thành EN, còn lại thành VI (kể cả locale lạ, viết hoa, sai kiểu).
- [ ] Không thêm `navigator.language` / tự nhận ngôn ngữ hệ thống nếu chưa có quyết định riêng (mục 3).
- [ ] Giữ `locale` và `currency` độc lập: đổi ngôn ngữ không đổi tiền tệ và ngược lại.
- [ ] Giữ nguyên tên placeholder `{name}`, `{stage}` khi dịch; tên bước pipeline fallback VI khi thiếu EN.
- [ ] Khi nối đủ 80 chuỗi, kiểm tra lại 7 chuỗi MỚI và 4 trường hợp: EN thiếu → hiện VI; cả hai thiếu → hiện key (lỗi); máy ngôn ngữ thứ ba → VI; đổi giữa chừng → vẽ lại ngay, dữ liệu nguyên vẹn.
- [ ] Đồng bộ `document.documentElement.lang` với locale hiện tại (hiện `<html lang="vi">` đang hard-code) — việc nhỏ, làm cùng lúc nối i18n.

## 7. Ngoài phạm vi file này (chưa quyết)

- Thêm locale thứ ba (vd tiếng Trung, tiếng Hàn) — cần bảng chuỗi đầy đủ mới làm.
- Tự nhận ngôn ngữ hệ thống lúc cài mới — chưa chốt, nếu làm thì theo quy tắc dự kiến ở mục 3 (`en*` → EN, còn lại → VI).
- Dịch dữ liệu người dùng (tên khách, ghi chú, mẫu tin nhắn) — không làm; dữ liệu luôn hiện đúng như đã gõ.
