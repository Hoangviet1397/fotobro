# FotoBro iOS v1 — EN Audit: rà soát bản dịch tiếng Anh (80 chuỗi)

- Nguồn rà soát: `~/workspace/fotobro-ios-v1/I18N-STRINGS.md` (80 chuỗi VI/EN, kiểm tra ngày 20/11/2026 lúc 00:10 +07)
- Đối chiếu: `~/workspace/fotobro-ios-v1/www/index.html` (341.754 byte, đọc ngày 20/11/2026) — chỉ để ước lượng ngữ cảnh UI (tab bar 5 tab, font tab ~10,5 px, các nhãn VI đã có trong code); **không sửa code, không sửa file nguồn**
- Ngày audit: 20/11/2026
- Phạm vi: chỉ bản dịch EN. Không audit tiếng Việt, không audit placeholder `{name}` / `{stage}` (giữ nguyên tên placeholder là đúng), không audit logic i18n.
- Quy ước verdict: ✅ Giữ nguyên | ✏️ Sửa (nên đổi trước khi nối i18n) | ⚠️ Xem xét (chấp nhận được, có phương án tốt hơn / cần Việt chốt)

## 1. Kết quả tổng quan

- Tổng: **80 chuỗi**
- ✅ Giữ nguyên: **57 chuỗi** — dịch đúng, tự nhiên, nhất quán
- ✏️ Sửa: **14 chuỗi** — #3, #29, #36, #37, #39, #40, #44, #45, #46, #58, #60, #68, #71, #80
- ⚠️ Xem xét: **9 chuỗi** — #5, #12, #26, #35, #38, #55, #56, #59, #76
- **Không phát hiện lỗi ngữ pháp nghiêm trọng** (sai thì, sai trật tự từ, thiếu mạo từ gây sai nghĩa). Các vấn đề chủ yếu là: (a) thuật ngữ không nhất quán, (b) lẫn lộn chính tả Anh-Mỹ / Anh-Anh, (c) dạng ngữ pháp không song song trong pipeline 8 bước, (d) một số chuỗi dài có nguy cơ tràn UI.
- Chuỗi dài nhất: #57 `May (Cloud) — Post-production` (29 ký tự); tiếp theo #55 (28), #56 và #59 và #76 (27), #71 (26).

## 2. Ba quyết định cần chốt trước khi sửa lẻ tẻ (ảnh hưởng nhiều chuỗi)

### 2.1. Chuẩn chính tả: chọn en-US, không phải en-GB

- Bằng chứng lẫn lộn trong cùng một bảng: #8 `Cancel` (Mỹ, 1 chữ L) nhưng #46 `Cancelled` (Anh, 2 chữ L); #68 `Theme colour` (Anh) trong khi toàn bộ app dùng USD, iPhone, Google — thị trường mặc định là Mỹ.
- **Quyết định đề xuất: dùng en-US cho toàn bộ.** Hệ quả: #46 `Cancelled` → `Canceled`; #68 `Theme colour` → `Theme color`. Không có chuỗi nào khác mang dấu hiệu en-GB, nên sau 2 sửa này bảng sẽ thuần en-US.

### 2.2. Thuật ngữ cốt lõi: `Job` là đơn vị công việc, `Shoot` chỉ buổi chụp

- Hiện tại lẫn lộn: #3 nav dùng `Shoots`, nhưng #14 dùng `No jobs yet`, #80 dùng `Job stuck at …`. Một thực thể không nên có 2 tên.
- **Đề xuất: `Job` = đơn vị đặt chụp / booking đi qua pipeline 8 bước (khách + tiền + deadline); `Shoot` = chỉ buổi chụp cụ thể (ngày, giờ, loại, chất liệu).**
- Hệ quả:
  - #3 `Shoots` → `Jobs` (đồng thời ngắn hơn cho tab bar: 4 ký tự thay vì 6).
  - Giữ nguyên `Shoot type / Shoot date / Shoot time` (#17–#19) vì đó đúng là thuộc tính của buổi chụp.
  - Giữ nguyên #14 `No jobs yet` và #80 `Job stuck …` — hai chuỗi này đã đúng theo chuẩn này.
  - Phương án ngược lại (đổi #14 → `No shoots yet`, #80 → `Shoot stuck …`) **không khuyến nghị**, vì "kẹt" là kẹt trong pipeline của job, không phải kẹt ở buổi chụp.
- Thuật ngữ phụ đã nhất quán, ghi nhận để khỏi sửa oan: `Deposit` (#25/#37), `Balance due` (#27), `Delivery deadline` (#21), `Post-production` dùng chung cho stage #41 và phòng Mây #57 (đúng — cùng một việc).

### 2.3. Dạng ngữ pháp pipeline 8 bước (#36–#43): hiện không song song

- Hiện tại trộn 4 dạng: danh từ (`Consulting`, `Post-production`), quá khứ phân từ (`Deposit confirmed`, `Shot`, `Delivered`), cụm động từ (`Ready to shoot`, `Selecting photos`), tính từ (`Done`).
- **Đề xuất: chuẩn hoá về dạng danh từ / trạng thái danh từ** (phù hợp làm nhãn bước, chip, và chèn vào `{stage}` ở #80):
  - #36 `Consulting` → `Consultation`
  - #37 `Deposit confirmed` → `Deposit paid` (vừa song song, vừa ngắn hơn: 12 thay vì 17 ký tự)
  - #39 `Shot` → `Shoot done`
  - #40 `Selecting photos` → `Photo selection`
  - Giữ: #38 `Ready to shoot`, #41 `Post-production`, #42 `Delivered`, #43 `Done`.
- Lưu ý: nếu Việt muốn giữ dạng động từ ("đang làm gì") thì phải đổi cả 8 bước sang dạng động từ, không đổi lẻ 1–2 bước — đổi lẻ sẽ càng lệch.

## 3. Nguy cơ tràn UI (độ dài chuỗi EN)

Độ dài tính theo ký tự (kể cả khoảng trắng; `{stage}` ở #80 tính chưa gồm tên bước chèn vào, thực tế còn dài hơn). Ngưỡng tham chiếu: tab bar 5 tab trên iPhone ~375 pt, mỗi tab ~70 pt, font ~10,5 px → nhãn tab an toàn ≤ ~10 ký tự; chip pipeline / nút bấm an toàn ≤ ~17 ký tự; hàng cài đặt an toàn ≤ ~22 ký tự (tuỳ layout).

| Nhóm nguy cơ | Chuỗi | Độ dài | Ghi chú |
|---|---|---|---|
| 🔴 Tab bar | #5 `Departments` | 11 | Dài nhất trong 5 tab; có thể bị cắt/ellipsis trên iPhone SE (320 pt). Xem #5 ở bảng chi tiết — cân nhắc `Teams` (5 ký tự). Các tab còn lại đều ≤ 9 ký tự, an toàn. |
| 🔴 Nút / hàng cài đặt | #76 `Import from iPhone Calendar` | 27 | Dài nhất trong nhóm nút; đề xuất rút gọn (xem bảng). |
| 🔴 Nút / hàng cài đặt | #71 `Restore original templates` | 26 | Đề xuất `Restore defaults` (17 ký tự). |
| 🔴 Nút | #75 `Add to iPhone Calendar` | 22 | Chấp nhận được nếu nút full-width; nếu nút hẹp thì dùng `Add to Calendar`. |
| 🟡 Chip pipeline | #37 `Deposit confirmed` | 17 | Đổi sang `Deposit paid` (12) giải quyết luôn. |
| 🟡 Chip pipeline | #40 `Selecting photos` | 16 | Đổi sang `Photo selection` (15) chỉ ngắn hơn 1 ký tự — vẫn cần kiểm tra chip có wrap không; phương án ngắn nhất là `Selecting` (9). |
| 🟡 Tiêu đề / thẻ phòng ban | #55–#60 | 18–29 | Cả 6 chuỗi đều dài do cấu trúc `Tên (dịch nghĩa) — vai trò`. Đây là nhóm dài nhất bảng. Không cắt tên riêng (theo quy tắc đã chốt), chỉ rút vai trò xuống 1–2 từ (xem bảng chi tiết). Cần kiểm tra thực tế trên thẻ/chip phòng ban — nếu layout 1 dòng thì 27–29 ký tự chắc chắn wrap/tràn. |
| 🟢 Còn lại | #12 (17), #21 (17), #44 (17), #53 (19), #74 (19), #80 (20) | 17–20 | Dài nhưng ở vị trí câu/thông báo (không phải tab/chip), chấp nhận được; #44 vẫn nên sửa vì lý do tự nhiên, không phải vì độ dài. |

## 4. Bảng audit chi tiết — cả 80 chuỗi

Cột "EN hiện tại" sao chép đúng từ `I18N-STRINGS.md`. Cột "Đề xuất" để trống (= giữ nguyên) khi verdict là ✅.

| # | Key | EN hiện tại | Verdict | Đề xuất | Lý do |
|---|---|---|---|---|---|
| 1 | `app.name` | FotoBro | ✅ | — | Tên app, không dịch. Đúng. |
| 2 | `nav.today` | Today | ✅ | — | Chuẩn iOS. |
| 3 | `nav.jobs` | Shoots | ✏️ | **Jobs** | Không nhất quán với #14 `No jobs yet` và #80 `Job stuck …` (xem §2.2). `Jobs` cũng ngắn hơn cho tab bar. |
| 4 | `nav.money` | Money | ✅ | — | Ngắn, chuẩn. |
| 5 | `nav.depts` | Departments | ⚠️ | **Teams** (cân nhắc) | `Departments` đúng nghĩa `Phòng ban` nhưng (a) dài nhất tab bar (11 ký tự, nguy cơ cắt trên màn hẹp), (b) nghe "công ty" trong khi 6 phòng là nhóm nhỏ thân mật (Sen/Nắng…). `Teams` ngắn và hợp tông app. Chỉ đổi nếu Việt đồng ý đổi nghĩa — nếu giữ nghĩa gốc thì giữ `Departments` và chấp nhận kiểm tra tràn tab. |
| 6 | `nav.assistant` | Assistant | ✅ | — | Đúng, ngắn. |
| 7 | `common.save` | Save | ✅ | — | Chuẩn. |
| 8 | `common.cancel` | Cancel | ✅ | — | Đúng en-US; chính sự đúng này làm lộ #46 sai chuẩn (xem §2.1). |
| 9 | `common.delete` | Delete | ✅ | — | Chuẩn. |
| 10 | `common.edit` | Edit | ✅ | — | Chuẩn. |
| 11 | `today.greeting` | Hello {name}! | ✅ | — | Tự nhiên; placeholder giữ nguyên, đúng. |
| 12 | `today.noShoot` | A quiet day today | ⚠️ | **All quiet today** | Không sai ngữ pháp, nhưng `A quiet day today` hơi dịch từng chữ (`today` lặp ý "hôm nay" đã có trong ngữ cảnh màn hình Hôm nay) và dài (17 ký tự). `All quiet today` là cách nói tự nhiên của người bản ngữ cho "hôm nay thong thả". |
| 13 | `today.upcoming` | Upcoming | ✅ | — | Tiêu đề mục, đủ rõ trong ngữ cảnh. |
| 14 | `today.noJobs` | No jobs yet | ✅ | — | Đúng; trở thành chuẩn sau khi sửa #3. |
| 15 | `today.moneyToday` | Today's money | ✅ | — | Tự nhiên. |
| 16 | `jobs.client` | Client name | ✅ | — | Chuẩn form. |
| 17 | `jobs.type` | Shoot type | ✅ | — | Nhất quán với `Shoot date/time`. |
| 18 | `jobs.date` | Shoot date | ✅ | — | Chuẩn. |
| 19 | `jobs.time` | Shoot time | ✅ | — | Chuẩn. |
| 20 | `jobs.location` | Location | ✅ | — | Chuẩn. |
| 21 | `jobs.deadline` | Delivery deadline | ✅ | — | Đúng thuật ngữ giao ảnh; `Delivery` ở đây không gây nhầm với giao hàng trong ngữ cảnh job ảnh. |
| 22 | `jobs.price` | Price | ✅ | — | Đủ rõ trong form job. |
| 23 | `jobs.medium` | Shot on | ✅ | — | Thuật ngữ nhiếp ảnh đúng (`Shot on film/digital`). |
| 24 | `jobs.note` | Notes | ✅ | — | Dạng số nhiều chuẩn cho trường ghi chú. |
| 25 | `jobs.deposit` | Deposit | ✅ | — | Đúng; nhất quán với #37. |
| 26 | `jobs.paid` | Collected | ⚠️ | **Paid** (cân nhắc) | `Collected` dịch sát nghĩa Việt `Đã thu` (phía photographer đã thu) và không sai. Nhưng trong sổ tiền / form giá, `Paid` là từ người dùng EN gặp thường xuyên hơn cho "số tiền khách đã trả". Đổi hay không là chọn góc nhìn (photographer thu ↔ khách trả), số tiền như nhau — cần Việt chốt, không tự đổi. |
| 27 | `jobs.owed` | Balance due | ✅ | — | Thuật ngữ kế toán đúng; cặp với #26 tốt. |
| 28 | `type.Portrait` | Portrait | ✅ | — | Danh mục chụp chuẩn. |
| 29 | `type.Couple` | Couple | ✏️ | **Couples** | Nhãn loại chụp là danh mục, dạng số nhiều mới đúng quy ước EN (`Couples photography`); dạng số ít `Couple` chỉ một cặp cụ thể. Các loại khác (`Portrait`, `Wedding`, `Event`) là danh từ không đếm được theo danh mục nên giữ số ít — chỉ riêng `Couple` cần số nhiều. |
| 30 | `type.Wedding` | Wedding | ✅ | — | Danh mục chuẩn. |
| 31 | `type.Lookbook` | Lookbook | ✅ | — | Thuật ngữ chuyên ngành, giữ nguyên. |
| 32 | `type.Event` | Event | ✅ | — | Danh mục chuẩn. |
| 33 | `medium.Digital` | Digital | ✅ | — | Chuẩn. |
| 34 | `medium.Film` | Film | ✅ | — | Chuẩn. |
| 35 | `medium.Both` | Both | ⚠️ | Giữ, hoặc **Digital + Film** nếu đủ chỗ | `Both` không sai và ngắn, nhưng đứng một mình trong form `Shot on` thì hơi cụt — người dùng phải nhớ "cả hai" là cả hai cái gì. Chỉ đổi sang `Digital + Film` (15 ký tự) nếu ô chọn đủ rộng; nếu không, giữ `Both`. |
| 36 | `stage.0` | Consulting | ✏️ | **Consultation** | Xem §2.3: chuẩn hoá pipeline về dạng danh từ. `Consulting` là danh động từ chỉ hoạt động chung, `Consultation` mới là tên bước tư vấn. |
| 37 | `stage.1` | Deposit confirmed | ✏️ | **Deposit paid** | Xem §2.3; đồng thời rút từ 17 xuống 12 ký tự, hết nguy cơ tràn chip. Nghĩa tương đương trong ngữ cảnh này (cọc đã chốt = đã trả). |
| 38 | `stage.2` | Ready to shoot | ⚠️ | Giữ | Đúng và tự nhiên; chỉ ghi nhận là bước duy nhất dùng cụm `Ready to …` trong khi các bước khác sẽ là danh từ — chấp nhận được vì `Ready` là trạng thái, không phải hành động. Phương án rút gọn `Ready` (5 ký tự) chỉ dùng nếu chip quá hẹp. |
| 39 | `stage.3` | Shot | ✏️ | **Shoot done** | `Shot` đứng một mình rất cụt và đa nghĩa (danh từ: phát súng / liều / ảnh chụp; quá khứ của shoot). Trong danh sách bước, người đọc phải đoán nghĩa "đã chụp xong". `Shoot done` rõ nghĩa và song song với `Done` (#43). |
| 40 | `stage.4` | Selecting photos | ✏️ | **Photo selection** | Xem §2.3: dạng danh từ song song với `Post-production`; `Selecting photos` là dạng đang-diễn-ra, lệch với các bước còn lại vốn là trạng thái đã đạt. |
| 41 | `stage.5` | Post-production | ✅ | — | Thuật ngữ chuẩn; giữ để nhất quán với phòng Mây #57. |
| 42 | `stage.6` | Delivered | ✅ | — | Đúng, ngắn. |
| 43 | `stage.7` | Done | ✅ | — | Đúng, ngắn. |
| 44 | `jobs.currentStage` | Currently at step | ✏️ | **Current step** | `Currently at step` là câu dở dang (thiếu "số mấy / bước nào" ngay sau nó) và nghe như dịch từng chữ. Nhãn mục trong chi tiết job chỉ cần `Current step` — ngắn (12 ký tự), tự nhiên, đúng quy ước nhãn iOS. |
| 45 | `jobs.nextStep` | Finish this step | ✏️ | **Complete step** | `Finish this step` không sai ngữ pháp, nhưng nút hành động trong app EN thường dùng `Complete step` / `Mark as done`. `Finish` nhấn mạnh kết thúc việc đang làm; `Complete` nhấn mạnh đánh dấu hoàn thành một bước checklist — đúng ý `Xong bước này` hơn. |
| 46 | `jobs.cancelled` | Cancelled | ✏️ | **Canceled** | Lỗi chuẩn chính tả theo §2.1: en-GB trong khi #8 `Cancel` là en-US. App dùng USD / thị trường Mỹ → dùng `Canceled` (1 chữ L). |
| 47 | `money.income` | Income | ✅ | — | Chuẩn. |
| 48 | `money.expense` | Expenses | ✅ | — | Cặp `Income / Expenses` là quy ước kế toán chuẩn (income không đếm được, expenses số nhiều) — không phải lỗi không nhất quán. |
| 49 | `money.profit` | Profit | ✅ | — | Đúng cho `Thu − Chi = Lời`. |
| 50 | `money.report` | Report | ✅ | — | Chuẩn. |
| 51 | `money.addIncome` | Add income | ✅ | — | Dạng số ít đúng cho một khoản thu mới (thêm một khoản, không phải thêm tất cả). |
| 52 | `money.addExpense` | Add expense | ✅ | — | Số ít đúng như #51; cặp `Add income / Add expense` song song tốt. |
| 53 | `money.noTx` | No transactions yet | ✅ | — | Đúng, tự nhiên (19 ký tự nhưng là câu trạng thái, không phải tab/chip). |
| 54 | `money.month` | Month | ✅ | — | Nhãn bộ lọc, đủ rõ trong ngữ cảnh. |
| 55 | `dept.Sen` | Sen (Lotus) — Client welcome | ⚠️ | **Sen (Lotus) — Clients** | Nội dung đúng; vấn đề là độ dài (28 ký tự, nhóm dài nhất) và `Client welcome` (2 từ, hơi dài cho vai trò). Rút vai trò còn 1 từ `Clients` vẫn đủ nghĩa. Giữ tên `Sen` + `(Lotus)` theo quy tắc đã chốt. |
| 56 | `dept.Nang` | Nang (Sunshine) — Shoot day | ⚠️ | Giữ, hoặc **Nang (Sunshine) — Shoots** | `Shoot day` rõ nghĩa nhất cho phòng lo buổi chụp; chỉ dài (27 ký tự). Chỉ rút sang `Shoots` nếu thẻ phòng ban bị tràn. Bản dịch `Sunshine` cho `Nắng` là đúng và hay. |
| 57 | `dept.May` | May (Cloud) — Post-production | ✅ | — | Đúng; dài (29 ký tự, dài nhất bảng) nhưng vai trò `Post-production` là thuật ngữ không thể rút gọn thêm mà không mất nghĩa — giải quyết bằng layout (cho wrap 2 dòng) chứ không bằng đổi từ. Nhất quán với stage #41. |
| 58 | `dept.Lua` | Lua (Rice) — Money | ✏️ | **Lua (Rice plant) — Money** | Lỗi dịch nghĩa tên: `Lúa` là cây lúa / lúa ngoài đồng, còn `Rice` trong EN thường hiểu là hạt gạo (đã thu hoạch, đã nấu). `(Rice)` gây hiểu sai nhẹ. `(Rice plant)` dài hơn 6 ký tự nhưng chính xác; phương án ngắn `(Paddy)` đúng chuyên ngành nhưng ít người Mỹ biết. |
| 59 | `dept.Trang` | Trang (Moon) — Storytelling | ⚠️ | **Trang (Moon) — Stories** | `Storytelling` không sai, nhưng (a) dài (27 ký tự cả chuỗi), (b) mơ hồ — phòng Trăng lo "kể chuyện và đăng bài", tức là nội dung/bài đăng, `Stories` (bài kể / story) gần với việc đăng bài hơn và ngắn hơn 6 ký tự. |
| 60 | `dept.Den` | Den (Lantern) — Gear | ✏️ | **Den (Lamp) — Gear** | Lỗi dịch nghĩa tên: `Đèn` là đèn / ánh sáng nói chung, còn `Lantern` chỉ đèn lồng (đèn cầm tay / đèn trang trí). `Lamp` mới là nghĩa gốc chính xác. Ngoại lệ: nếu Việt cố ý giữ hình ảnh "đèn lồng" vì tông vintage của app thì giữ `Lantern` như một lựa chọn phong cách, không phải bản dịch sát nghĩa — cần Việt chốt. Vai trò `Gear` giữ nguyên (ngắn, đúng cho "giữ đồ" nghề). |
| 61 | `settings.title` | Settings | ✅ | — | Chuẩn iOS. |
| 62 | `settings.yourName` | Your name | ✅ | — | Chuẩn. |
| 63 | `settings.studioName` | Studio name | ✅ | — | Chuẩn. |
| 64 | `settings.language` | Language | ✅ | — | Chuẩn. |
| 65 | `settings.currency` | Currency | ✅ | — | Chuẩn. |
| 66 | `settings.priceTable` | Price list | ✅ | — | Chuẩn; nhất quán với #67. |
| 67 | `settings.filmPriceTable` | Film price list | ✅ | — | Chuẩn; cặp với #66 tốt. |
| 68 | `settings.theme` | Theme colour | ✏️ | **Theme color** | Lỗi chuẩn chính tả theo §2.1: `colour` là en-GB; đổi sang `color` (en-US). |
| 69 | `settings.logo` | Studio logo | ✅ | — | Chuẩn. |
| 70 | `settings.templates` | Message templates | ✅ | — | Chuẩn. |
| 71 | `settings.restoreTemplates` | Restore original templates | ✏️ | **Restore defaults** | Không sai ngữ pháp, nhưng (a) dài nhất nhóm nút cài đặt (26 ký tự, nguy cơ tràn nút/hàng), (b) `Restore defaults` là cụm chuẩn của iOS/macOS cho đúng hành động này, ngắn hơn 9 ký tự. Phương án giữ nghĩa đầy đủ hơn: `Reset templates` (15 ký tự). |
| 72 | `settings.security` | Security | ✅ | — | Chuẩn mục cài đặt. |
| 73 | `settings.version` | Version | ✅ | — | Chuẩn. |
| 74 | `google.login` | Sign in with Google | ✅ | — | Đúng quy chuẩn thương hiệu Google (`Sign in with Google`, viết hoa G). |
| 75 | `cal.addiPhone` | Add to iPhone Calendar | ✅ | — | Đúng ý Việt (xuất sang Lịch iPhone); 22 ký tự, chấp nhận được nếu nút full-width. Lưu ý: tên sản phẩm Apple chỉ là `Calendar`, `iPhone Calendar` không phải tên chính thức — nhưng ở đây nó mang thông tin phân biệt (lịch trên máy, không phải Google), nên giữ. |
| 76 | `cal.importNative` | Import from iPhone Calendar | ⚠️ | Giữ, hoặc **Import from Calendar** | Đúng nghĩa; chỉ dài (27 ký tự, dài nhất nhóm nút). Nếu nút bị tràn thì rút `iPhone` — trong ngữ cảnh app iOS, `Import from Calendar` vẫn hiểu là lịch trên máy. Không rút nếu nút đủ rộng. |
| 77 | `backup.download` | Download backup | ✅ | — | Chuẩn. |
| 78 | `notify.saved` | Saved | ✅ | — | Toast chuẩn. |
| 79 | `notify.deleted` | Deleted | ✅ | — | Toast chuẩn. |
| 80 | `notify.stuck` | Job stuck at {stage} | ✏️ | **Job stuck in {stage}** | Lỗi giới từ: `stuck at` dùng cho địa điểm / thời điểm (`stuck at work`, `stuck at 50%`), còn kẹt *trong* một giai đoạn thì dùng `stuck in` (`stuck in review`, `stuck in post-production`). Với tên bước là danh từ (#36–#43 sau khi sửa theo §2.3), `Job stuck in {stage}` đọc tự nhiên với cả 8 bước. Lưu ý: câu này chỉ có nghĩa khi job chưa tới `Done` — logic hiển thị cần loại bước cuối, nhưng đó là việc của code, không phải của chuỗi. |

## 5. Những điểm đã kiểm tra và kết luận là KHÔNG có vấn đề (để khỏi sửa oan)

- **Viết hoa:** toàn bộ nhãn dùng Title Case nhất quán (`Client name`, `Shoot date`, `Price list`…); toast một từ (`Saved`, `Deleted`) viết hoa chữ đầu — đúng quy ước iOS, không cần đổi sang sentence case.
- **Số ít / số nhiều có chủ ý:** `Income` (không đếm được) / `Expenses` (số nhiều) là quy ước kế toán; `Add income / Add expense` (số ít) là đúng vì mỗi lần chỉ thêm một khoản.
- **`Shot on` (#23):** nghe lạ với người ngoài ngành nhưng là thuật ngữ nhiếp ảnh chuẩn (`Shot on film`), giữ nguyên.
- **Tên riêng:** `FotoBro`, tên 6 phòng (`Sen/Nắng/Mây/Lúa/Trăng/Đèn`) và `Lookbook` giữ nguyên theo quy tắc đã chốt — audit không đề xuất dịch tên riêng sang tên khác.
- **Placeholder:** `{name}` và `{stage}` giữ nguyên tên, không dịch — đúng; câu #80 sau khi sửa vẫn chèn `{stage}` bình thường.
- **Tiền tệ:** không thuộc phạm vi audit chuỗi; quy tắc "chỉ đổi hiển thị, không quy đổi tỷ giá" trong file nguồn đã đúng và không bị chuỗi nào vi phạm.
- **Không có chuỗi nào sai thì / sai trật tự từ / thiếu mạo từ gây sai nghĩa.** Hai lỗi rõ ràng nhất về mặt "đúng/sai" là chính tả en-GB (#46, #68) và dịch nghĩa tên phòng (#58, #60); còn lại là mức độ tự nhiên và nhất quán.

## 6. Danh sách sửa rút gọn (copy-paste cho người nối i18n)

Áp dụng sau khi Việt chốt 3 quyết định ở §2 (§2.1 và §2.2 nên chốt trước; §2.3 có thể chốt cùng lúc).

| # | Key | Từ | Thành |
|---|---|---|---|
| 3 | `nav.jobs` | Shoots | Jobs |
| 29 | `type.Couple` | Couple | Couples |
| 36 | `stage.0` | Consulting | Consultation |
| 37 | `stage.1` | Deposit confirmed | Deposit paid |
| 39 | `stage.3` | Shot | Shoot done |
| 40 | `stage.4` | Selecting photos | Photo selection |
| 44 | `jobs.currentStage` | Currently at step | Current step |
| 45 | `jobs.nextStep` | Finish this step | Complete step |
| 46 | `jobs.cancelled` | Cancelled | Canceled |
| 58 | `dept.Lua` | Lua (Rice) — Money | Lua (Rice plant) — Money |
| 60 | `dept.Den` | Den (Lantern) — Gear | Den (Lamp) — Gear |
| 68 | `settings.theme` | Theme colour | Theme color |
| 71 | `settings.restoreTemplates` | Restore original templates | Restore defaults |
| 80 | `notify.stuck` | Job stuck at {stage} | Job stuck in {stage} |

Các chuỗi ⚠️ chỉ đổi khi Việt đồng ý từng mục: #5 → `Teams`; #12 → `All quiet today`; #26 → `Paid`; #35 → `Digital + Film`; #55 → `Sen (Lotus) — Clients`; #59 → `Trang (Moon) — Stories`; #76 → `Import from Calendar`.

## 7. Hạn chế của audit này

- Chỉ rà soát trên bảng chuỗi, không chạy app: nguy cơ tràn UI ở §3 là ước lượng theo độ dài ký tự và font tab ~10,5 px trong `index.html`, **chưa được kiểm chứng bằng mắt trên iPhone thật** — đặc biệt tab `Departments`, chip pipeline và 6 thẻ phòng ban cần kiểm tra trực quan sau khi nối i18n.
- Không kiểm tra chuỗi EN trong code v1 (code hiện chủ yếu là tiếng Việt; cột "Trong code v1" trong file nguồn được tin theo ghi nhận của file đó, không đối chiếu lại từng chuỗi).
- Các đề xuất mang tính ngôn ngữ / UX viết; quyết định cuối về tên phòng (`Lantern` giữ vì phong cách hay đổi sang `Lamp` vì chính xác) và về `Collected` vs `Paid` thuộc về Việt.
