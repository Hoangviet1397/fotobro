# FotoBro iOS v1 — Quy trình đóng băng chuỗi (String Freeze) trước phát hành

- File: `~/workspace/fotobro-ios-v1/batch-i18n/STRING-FREEZE.md`
- Phạm vi: chỉ FotoBro iOS v1 (`APP_VERSION = '1.0'`, Bundle ID `com.fotobro.app`)
- Nguồn chuỗi duy nhất: `~/workspace/fotobro-ios-v1/I18N-STRINGS.md`
- Ngày viết: 20/11/2026
- Trạng thái mốc phát hành (theo `CHANGELOG-v1.0.md`): **ngày phát hành chưa chốt** — để trống, điền khi bản TestFlight đầu tiên được duyệt. Chưa build `.ipa` thật, chưa lên TestFlight, chưa kiểm chứng trên iPhone thật.
- Vì ngày submit chưa chốt, mọi mốc dưới đây tính theo **T = ngày submit lên App Store Connect**, không tính theo ngày cố định. Khi ngày submit dời, ngày đóng băng dời theo.

## 1. Chuỗi thuộc phạm vi đóng băng

Tổng **80 chuỗi chính cho v1** (đối chiếu ngày 20/11/2026 lúc 00:10 với `www/index.html` 341.124 byte và `www/fotobro-config.js`):

| Nhóm | Số chuỗi |
|---|---|
| A. App, tab và thao tác chung | 10 |
| B. Màn hình Hôm nay | 5 |
| C. Form job | 12 |
| D. Loại chụp và chất liệu | 8 |
| E. Pipeline 8 bước | 8 |
| F. Điều khiển pipeline | 3 |
| G. Sổ tiền | 8 |
| H. Phòng ban | 6 |
| I. Cài đặt và cá nhân hoá | 13 |
| J. Google, Lịch iPhone, sao lưu | 4 |
| K. Thông báo | 3 |
| **Tổng** | **80** |

- Đã có trong code v1: **73 chuỗi**.
- Mới, cần thêm khi nối i18n (phải xong **trước** đóng băng): **7 chuỗi** — #11 `today.greeting`, #15 `today.moneyToday`, #28 `type.Portrait` (nhãn VI), #30 `type.Wedding` (nhãn VI), #52 `money.addExpense`, #65 `settings.currency` (nhãn mục), #80 `notify.stuck`.
- Không thuộc phạm vi v1, không được thêm trong đợt đóng băng này: chuỗi đồng bộ CloudKit, nhóm/studio và vai trò, sao lưu mã hoá, góp ý qua email, tìm kiếm, "Quay lại" (thuộc Nấc 2/3 hoặc chưa chốt v1).

### Quy tắc bất biến (không được đổi trong hay sau đóng băng nếu không có ngoại lệ P0)

- `locale` chỉ nhận `'vi'` / `'en'`; `currency` chỉ nhận `'VND'` / `'USD'`.
- Tiền VND hiển thị `1.000.000₫` (vi-VN), USD hiển thị `$1,000.00` (en-US); **chỉ đổi hiển thị, không quy đổi tỷ giá**.
- Tên app `FotoBro` không dịch.
- Tên 6 phòng ban giữ tiếng Việt + chú thích tiếng Anh, không dịch tên Sen / Nắng / Mây / Lúa / Trăng / Đèn sang tên khác.
- Placeholder giữ nguyên tên khi dịch, không dịch tên placeholder: `{name}` (tên người dùng), `{stage}` (tên bước pipeline).
- Pipeline giữ nguyên thứ tự và tên 8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.
- Chuỗi #27 giữ theo code v1 là "Còn thiếu" / "Balance due", không đổi về "Còn nợ" của bản prototype.

## 2. Thời điểm đóng băng — bao nhiêu ngày trước submit

| Mốc | Thời điểm | Ý nghĩa |
|---|---|---|
| **T-14** | 14 ngày trước submit | **Soft freeze (đóng băng mềm).** Không thêm key mới, không đổi cấu trúc chuỗi (không thêm/bớt placeholder, không tách/gộp chuỗi). Chỉ còn được sửa wording nhỏ trong cùng một key và chỉ khi có cả hai ngôn ngữ VI + EN. Mọi đề xuất thêm tính năng cần chuỗi mới phải dời sang v1.1. |
| **T-7** | 7 ngày trước submit | **Hard freeze (đóng băng cứng) — mốc chính của quy trình này.** Từ thời điểm này, không ai được tự ý sửa, thêm hay xoá bất kỳ chuỗi nào trong 80 chuỗi, kể cả sửa chính tả, trừ khi theo quy trình ngoại lệ ở mục 4 và được Việt duyệt bằng văn bản. |
| **T-2** | 2 ngày trước submit | **Final lock (khoá cuối).** Chỉ còn ngoại lệ P0 (mục 4) được xét. Không nhận ngoại lệ P1/P2 nữa. Build ứng cử viên phát hành (release candidate) được chốt từ bản chuỗi ở trạng thái này. |
| **T-0** | Ngày submit | Submit bản đã khoá. Không sửa chuỗi trong ngày submit. Nếu phát hiện lỗi chuỗi sau T-0, ghi vào danh sách v1.0.1, không sửa lén trên bản đã submit. |

### Vì sao chọn 7 ngày (T-7), không phải 1–2 ngày

- v1 chỉ có 80 chuỗi / 2 ngôn ngữ, không có đội dịch ngoài, nên không cần 2–3 tuần như app lớn. 7 ngày là đủ cho: soát EN lần cuối, kiểm tra chuỗi dài bị tràn trên giao diện Large Title / thẻ bo góc lớn / tab bar (kiểu Apple Music), và một vòng kiểm tra trên bản TestFlight nội bộ nếu có.
- 7 ngày cũng đủ dài để lỗi chuỗi không bị sửa vội vào phút cuối rồi lọt lỗi khác.
- Nếu ngày submit chưa chốt (đúng tình trạng v1 hiện tại: chưa có Client ID Google chung, chưa có plugin Lịch iPhone native, workflow build còn ghim Xcode 16.4 trong khi App Store Connect từ 28/04/2026 từ chối build dưới Xcode 26), thì **không tuyên bố đóng băng theo ngày dương lịch**. Chỉ tuyên bố đóng băng khi đã có ngày submit dự kiến bằng văn bản. Tuyên bố sớm khi chưa biết ngày submit sẽ khiến freeze bị phá vỡ nhiều lần và mất tác dụng.

### Quy tắc dời mốc

- Dời submit → dời T-14 / T-7 / T-2 theo cùng số ngày, ghi rõ ngày mới vào bảng theo dõi ở mục 6.
- Không rút ngắn T-7 xuống dưới 3 ngày. Nếu buộc phải submit gấp trong dưới 7 ngày, phải ghi rõ lý do, Việt duyệt, và chỉ đóng băng rút gọn tối thiểu 3 ngày (T-3), với checklist mục 6 vẫn phải đủ 100%.

## 3. Ai được sửa chuỗi sau khi đóng băng

| Vai trò | Được làm sau T-7 | Không được làm |
|---|---|---|
| **Việt — Product Owner, người duyệt duy nhất** | Duyệt hoặc từ chối mọi yêu cầu ngoại lệ; chốt ngày submit và ngày đóng băng mới nếu dời lịch. | Không sửa trực tiếp chuỗi trong code rồi coi như đã duyệt — mọi sửa đổi vẫn phải đi qua yêu cầu ngoại lệ có ghi lại (mục 4). |
| **Người triển khai v1 (agent / dev đang làm bản sao `fotobro-ios-v1/`)** | Chỉ sửa chuỗi khi đã có phê duyệt ngoại lệ bằng văn bản của Việt, đúng key, đúng nội dung đã duyệt, đúng cả hai ngôn ngữ. Sau khi sửa phải cập nhật `I18N-STRINGS.md`, `STRINGS_VERSION` (mục 5) và bảng theo dõi ngoại lệ (mục 6). | Không tự sửa chuỗi vì "thấy sai chính tả", "thấy hay hơn", "cho đồng nhất". Không thêm key mới, không đổi placeholder, không đổi tên phòng ban / tên bước pipeline. |
| **Người kiểm tra / QA** | Báo lỗi chuỗi (ghi rõ key, màn hình, ngôn ngữ, ảnh chụp màn hình nếu có), đề xuất mức độ P0/P1/P2. | Không tự sửa chuỗi trong code. Báo lỗi không đồng nghĩa với được sửa. |

Nguyên tắc chung sau T-7: **không có phê duyệt bằng văn bản của Việt thì không có sửa chuỗi**. Sửa code không chạm chuỗi (sửa logic, sửa layout không đổi text, sửa bug không đổi chuỗi) vẫn được làm bình thường, nhưng nếu sửa layout làm lộ lỗi chuỗi (tràn chữ, cắt chữ) thì báo lỗi chuỗi theo mục 4, không tự rút ngắn chuỗi để vừa layout.

## 4. Quy trình xin sửa ngoại lệ sau đóng băng

### 4.1. Mức độ ngoại lệ

| Mức | Định nghĩa | Được xét tới |
|---|---|---|
| **P0 — bắt buộc sửa** | Lỗi làm người dùng hiểu sai và gây hậu quả thật: sai số tiền / sai hạn / sai trạng thái job (ví dụ nhầm "Đã thu" với "Còn thiếu"), sai nghĩa nghiêm trọng, chuỗi gây crash / hiển thị placeholder thô `{name}` / `{stage}`, lỗi pháp lý hoặc vi phạm quy định App Store, lỗi chính tả trong tên app / tên studio / nút thanh toán. | Tới hết T-0, và cả sau submit (sửa ở bản vá v1.0.1). |
| **P1 — nên sửa nếu kịp** | Lỗi chính tả / ngữ pháp rõ ràng, dịch EN sai nghĩa nhẹ nhưng không gây hiểu sai hậu quả, chuỗi bị cắt / tràn trên màn hình chính (Hôm nay, form job, sổ tiền). | Tới hết T-2. Sau T-2, dời sang v1.0.1. |
| **P2 — không sửa ở v1.0** | Wording chưa hay, chưa đồng nhất phong cách, muốn đổi từ đồng nghĩa, muốn thêm chuỗi cho tính năng chưa chốt. | Không xét sau T-7. Ghi vào backlog v1.1. |

### 4.2. Các bước xin ngoại lệ (làm đủ 6 bước, không bỏ bước)

1. **Ghi yêu cầu** — dùng mẫu ở 4.3, ghi rõ key, nội dung cũ (VI + EN), nội dung mới đề xuất (VI + EN, cả hai bắt buộc — không duyệt sửa chỉ một ngôn ngữ), lý do, mức P0/P1/P2, ảnh chụp màn hình nếu là lỗi hiển thị.
2. **Đánh giá tác động** — người triển khai ghi: key này xuất hiện ở màn hình nào, có đổi độ dài đáng kể không (EN thường dài hơn VI — kiểm tra tràn), có chạm placeholder / định dạng tiền tệ / tên riêng không, có cần sửa thêm ở `I18N-STRINGS.md` không (luôn là có).
3. **Việt duyệt hoặc từ chối** — duyệt bằng văn bản (tin nhắn / ghi chú trong yêu cầu), ghi rõ "đồng ý sửa key X thành nội dung Y". Không duyệt miệng không ghi lại. Không có duyệt thì dừng ở đây.
4. **Sửa đúng phạm vi đã duyệt** — chỉ sửa đúng key và đúng nội dung đã duyệt, không sửa kèm key khác "cho tiện". Cập nhật đồng thời: code (`www/index.html` / file chuỗi), `I18N-STRINGS.md`, `STRINGS_VERSION` (mục 5), bảng theo dõi ngoại lệ (mục 6).
5. **Kiểm tra lại** — kiểm tra cả hai ngôn ngữ, kiểm tra placeholder còn nguyên, kiểm tra hiển thị ở màn hình liên quan, kiểm tra không làm vỡ key khác. Ghi kết quả kiểm tra vào yêu cầu.
6. **Đóng yêu cầu** — ghi ngày sửa, người sửa, phiên bản chuỗi mới. Nếu yêu cầu bị từ chối, ghi lý do và dời sang v1.0.1 / v1.1, không sửa lén sau đó.

### 4.3. Mẫu yêu cầu ngoại lệ (copy và điền)

```text
Ngoại lệ chuỗi #___ — FotoBro iOS v1
- Key: (ví dụ jobs.owed)
- Màn hình / ngôn ngữ lỗi: (ví dụ Form job / EN)
- Nội dung cũ VI: … | EN: …
- Nội dung mới đề xuất VI: … | EN: …
- Lý do: …
- Mức: P0 / P1 / P2
- Tác động: (màn hình liên quan, độ dài, placeholder, tiền tệ)
- Ảnh chụp màn hình (nếu có): …
- Việt duyệt: Đồng ý / Từ chối — ngày, ghi chú: …
- Người sửa + ngày sửa: …
- STRINGS_VERSION sau sửa: …
- Kiểm tra lại: ĐẠT / KHÔNG ĐẠT — ghi rõ: …
```

### 4.4. Trường hợp đặc biệt: lỗi phát hiện sau khi đã submit

- Không sửa trên bản đã submit. Ghi vào danh sách v1.0.1, đánh mức P0/P1/P2 như trên.
- Chỉ làm bản vá v1.0.1 nếu có lỗi P0. Lỗi P1/P2 chờ gộp vào bản vá hoặc v1.1 tiếp theo, do Việt quyết.

## 5. Cách đánh phiên bản chuỗi (string versioning)

Phiên bản chuỗi tách riêng với phiên bản app, để biết bản chuỗi nào đang nằm trong bản build nào, và để ngoại lệ sau đóng băng luôn để lại dấu vết.

### 5.1. Định dạng

```text
STRINGS_VERSION = '1.0.0'
```

- Ghi `STRINGS_VERSION` ở đầu `I18N-STRINGS.md` (dòng trạng thái) và, khi nối i18n vào code, ghi cùng giá trị vào file cấu hình chuỗi / `www/fotobro-config.js` (chưa có sẵn — thêm khi nối i18n, không bịa rằng đã có).
- Số phiên bản đi theo app version: chuỗi cho app 1.0 bắt đầu ở `1.0.0`.

| Thành phần | Khi nào tăng | Ví dụ |
|---|---|---|
| **MAJOR** (`1.x.x` → `2.0.0`) | Đổi key, đổi tên placeholder, đổi quy tắc định dạng (tiền tệ, locale), đổi tên bước pipeline hoặc tên phòng ban. | Đổi `{name}` thành `{userName}` → `2.0.0`. |
| **MINOR** (`1.0.x` → `1.1.0`) | Thêm key mới, xoá key (phải có cả VI + EN, hoặc ghi rõ key bị xoá và lý do). | Thêm 1 key mới → `1.1.0`. |
| **PATCH** (`1.0.0` → `1.0.1`) | Chỉ sửa wording trong key đã có, không thêm/bớt key, không đổi placeholder. | Sửa chính tả EN ở `jobs.owed` → `1.0.1`. |

- Sau mỗi lần tăng, reset các thành phần bên phải về 0 (ví dụ `1.0.3` thêm key mới → `1.1.0`, không phải `1.1.3`).
- Mỗi lần đổi `STRINGS_VERSION` phải ghi một dòng vào lịch sử ở 5.2, kèm ngày, lý do, danh sách key đổi, và người duyệt.

### 5.2. Lịch sử phiên bản chuỗi (điền khi có thay đổi)

| STRINGS_VERSION | Ngày | Thay đổi | Key liên quan | Duyệt bởi |
|---|---|---|---|---|
| `1.0.0` | 20/11/2026 | Baseline v1: 80 chuỗi (73 đã có trong code + 7 mới), VI + EN đầy đủ, freeze T-7 theo quy trình này. | Toàn bộ 80 key (A–K) | — (baseline, chưa có ngoại lệ) |
| _(điền khi có ngoại lệ)_ | | | | |

### 5.3. Quy tắc ghi chép đi kèm mỗi lần đổi phiên bản

- Cập nhật `I18N-STRINGS.md` trước, code sau — không để code và bảng chuỗi lệch nhau.
- Ghi rõ trong `CHANGELOG-v1.0.md` (mục phù hợp) khi thay đổi chuỗi làm đổi hành vi hiển thị mà người dùng thấy được.
- Không dùng lại số phiên bản cũ cho nội dung mới. Không tăng phiên bản chuỗi khi chỉ sửa code không chạm chuỗi.

## 6. Checklist trước khi đóng băng (phải đủ 100% mới được tuyên bố T-7)

Đánh dấu từng mục. Mục nào chưa đạt thì ghi rõ lý do và ngày hẹn hoàn thành — không tuyên bố đóng băng khi còn mục bắt buộc chưa đạt.

### A. Đủ chuỗi

- [ ] Đủ 80/80 chuỗi trong `I18N-STRINGS.md`, đếm lại theo nhóm A–K (10 + 5 + 12 + 8 + 8 + 3 + 8 + 6 + 13 + 4 + 3 = 80).
- [ ] 7 chuỗi MỚI đã được thêm đủ cả VI + EN: `today.greeting`, `today.moneyToday`, `type.Portrait`, `type.Wedding`, `money.addExpense`, `settings.currency`, `notify.stuck`.
- [ ] Không còn key nào chỉ có VI mà thiếu EN, hoặc ngược lại.
- [ ] Không còn chuỗi Nấc 2/3 lọt vào bảng v1 (đồng bộ CloudKit, nhóm/studio, sao lưu mã hoá, góp ý qua email).

### B. Đúng nội dung

- [ ] Soát chính tả và ngữ pháp cả VI và EN cho toàn bộ 80 chuỗi.
- [ ] Placeholder `{name}` và `{stage}` còn nguyên tên, không bị dịch, không bị xoá, không bị nhân đôi.
- [ ] Tên riêng đúng quy tắc: `FotoBro` không dịch; 6 phòng ban giữ tên Việt + chú thích Anh; 8 bước pipeline đúng thứ tự và tên.
- [ ] Chuỗi #27 là "Còn thiếu" / "Balance due" (theo code v1), không phải "Còn nợ".
- [ ] Định dạng tiền tệ đúng quy tắc: VND `1.000.000₫`, USD `$1,000.00`, chỉ đổi hiển thị, không quy đổi tỷ giá.
- [ ] Các nút và nhãn trong code khớp với bảng chuỗi (đặc biệt: nút "Đăng nhập Google", "Thêm vào Lịch iPhone", "Nhập từ Lịch iPhone", "Tải bản sao lưu").

### C. Đúng hiển thị

- [ ] Kiểm tra chuỗi dài nhất ở mỗi màn hình chính (Hôm nay, form job, sổ tiền, Cài đặt) — không tràn, không bị cắt trên cỡ chữ mặc định.
- [ ] Kiểm tra Large Title và tab bar (Hôm nay / Buổi chụp / Tiền bạc / Phòng ban / Trợ lý) ở cả hai ngôn ngữ.
- [ ] Kiểm tra dark mode (nền đen) — chuỗi vẫn đọc được, không lẫn màu nền.
- [ ] Ghi lại thiết bị / cỡ màn hình đã kiểm tra (lưu ý: cloud check không thu hẹp được cỡ điện thoại — mục này cần kiểm tra trên iPhone thật hoặc trình mô phỏng cỡ điện thoại, không chỉ kiểm tra desktop).

### D. Đúng mốc và ghi chép

- [ ] Ngày submit dự kiến (T-0) đã chốt bằng văn bản; từ đó suy ra T-14, T-7, T-2 và ghi vào bảng theo dõi dưới đây.
- [ ] `STRINGS_VERSION` đã ghi là `1.0.0` (baseline) ở `I18N-STRINGS.md` và (khi nối i18n) trong code.
- [ ] Bảng theo dõi ngoại lệ sau đóng băng đã lập sẵn (mục 6, bảng cuối), chưa có ngoại lệ nào chưa duyệt.
- [ ] Người triển khai và người kiểm tra đã đọc quy trình này và biết: sau T-7, không tự sửa chuỗi.

### Bảng theo dõi mốc và ngoại lệ (điền khi tuyên bố đóng băng)

| Hạng mục | Ngày |
|---|---|
| Ngày submit dự kiến (T-0) | _(chưa chốt — điền khi chốt)_ |
| Soft freeze (T-14) | |
| Hard freeze (T-7) | |
| Final lock (T-2) | |
| `STRINGS_VERSION` tại lúc đóng băng | `1.0.0` |

| # | Ngày yêu cầu | Key | Mức | Nội dung đổi (tóm tắt) | Việt duyệt? | Ngày sửa | STRINGS_VERSION sau sửa | Kiểm tra lại |
|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | |

## 7. Những gì được / không được làm sau T-7

**Được làm (không cần ngoại lệ chuỗi):** sửa logic không đổi text; sửa layout không đổi text; sửa bug crash / đồng bộ / lịch / Google không chạm chuỗi; cập nhật ảnh, icon, màu (không đổi chuỗi); chuẩn bị screenshot, Privacy Policy, Support URL (không đổi chuỗi trong app).

**Không được làm (cần ngoại lệ theo mục 4):** sửa / thêm / xoá bất kỳ chuỗi nào trong 80 chuỗi; đổi placeholder; đổi tên bước pipeline, tên phòng ban, tên loại chụp; đổi định dạng tiền tệ; thêm chuỗi cho tính năng mới (dời sang v1.1).

**Nếu không chắc một thay đổi có chạm chuỗi không:** coi như có chạm chuỗi, và xin ngoại lệ. Sửa sai do "tưởng không chạm chuỗi" vẫn tính là vi phạm đóng băng và phải ghi lại, khôi phục, rồi làm lại theo đúng quy trình.
