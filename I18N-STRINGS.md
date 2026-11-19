# FotoBro iOS v1 — Bảng chuỗi giao diện Việt / Anh (I18N-STRINGS)

- File: `~/workspace/fotobro-ios-v1/I18N-STRINGS.md` (chỉ tài liệu, không sửa code)
- Kiểm tra ngày 20/11/2026 lúc 00:10 (+07) đối chiếu với `www/index.html` (341.124 byte) và `www/fotobro-config.js` trong `~/workspace/fotobro-ios-v1/`
- Nguồn tham khảo: `~/workspace/fotobro-scale/src/i18n-strings.json` (bản prototype, 110 key) — bảng này rút còn **80 chuỗi chính cho v1**, bỏ các chuỗi Nấc 2/3 (đồng bộ, nhóm, sao lưu mã hoá, góp ý) chưa thuộc v1, thêm các chuỗi chỉ v1 mới có (Google auto, Lịch iPhone native, màu chủ đề, logo studio, nhảy bước, huỷ job, job kẹt)
- Cột "Trong code v1": **CÓ** = chuỗi tiếng Việt đã xuất hiện đúng dạng trong `www/index.html`; **MỚI** = chưa có chuỗi đầy đủ đó, cần thêm khi nối i18n (ghi chú kèm theo nêu rõ phần nào đã có)
- Quy tắc định dạng đã có trong code (giữ nguyên, không đổi): `locale` chỉ nhận `'vi'` / `'en'`; `currency` chỉ nhận `'VND'` / `'USD'`; tiền VND hiển thị `1.000.000₫` (vi-VN), USD hiển thị `$1,000.00` (en-US); **chỉ đổi hiển thị, không quy đổi tỷ giá**
- Quy tắc tên riêng: tên 6 phòng ban giữ tiếng Việt + thêm chú thích tiếng Anh (không dịch tên Sen/Nắng/Mây/Lúa/Trăng/Đèn sang tên khác); tên app `FotoBro` không dịch; tên loại chụp trong code đang dùng tiếng Anh (`Portrait`, `Couple`…) nên cột VI ở bảng này là nhãn hiển thị cần thêm

## A. App, tab và thao tác chung (1–10)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 1 | `app.name` | FotoBro | FotoBro | CÓ |
| 2 | `nav.today` | Hôm nay | Today | CÓ |
| 3 | `nav.jobs` | Buổi chụp | Shoots | CÓ |
| 4 | `nav.money` | Tiền bạc | Money | CÓ |
| 5 | `nav.depts` | Phòng ban | Departments | CÓ |
| 6 | `nav.assistant` | Trợ lý | Assistant | CÓ |
| 7 | `common.save` | Lưu | Save | CÓ |
| 8 | `common.cancel` | Huỷ | Cancel | CÓ |
| 9 | `common.delete` | Xoá | Delete | CÓ |
| 10 | `common.edit` | Sửa | Edit | CÓ |

## B. Màn hình Hôm nay (11–15)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 11 | `today.greeting` | Chào {name}! | Hello {name}! | MỚI — "Chào" và "bạn" đã có rời rạc, chưa có chuỗi chào đầy đủ |
| 12 | `today.noShoot` | Hôm nay thong thả lắm | A quiet day today | CÓ |
| 13 | `today.upcoming` | Sắp tới | Upcoming | CÓ |
| 14 | `today.noJobs` | Chưa có job | No jobs yet | CÓ |
| 15 | `today.moneyToday` | Tiền hôm nay | Today's money | MỚI |

## C. Form job (16–27)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 16 | `jobs.client` | Tên khách | Client name | CÓ |
| 17 | `jobs.type` | Loại chụp | Shoot type | CÓ |
| 18 | `jobs.date` | Ngày chụp | Shoot date | CÓ |
| 19 | `jobs.time` | Giờ chụp | Shoot time | CÓ |
| 20 | `jobs.location` | Địa điểm | Location | CÓ |
| 21 | `jobs.deadline` | Hạn giao ảnh | Delivery deadline | CÓ |
| 22 | `jobs.price` | Giá | Price | CÓ |
| 23 | `jobs.medium` | Chụp bằng | Shot on | CÓ |
| 24 | `jobs.note` | Ghi chú | Notes | CÓ |
| 25 | `jobs.deposit` | Cọc | Deposit | CÓ |
| 26 | `jobs.paid` | Đã thu | Collected | CÓ |
| 27 | `jobs.owed` | Còn thiếu | Balance due | CÓ — lưu ý: bản prototype dùng "Còn nợ", code v1 dùng "Còn thiếu", giữ theo code v1 |

## D. Loại chụp và chất liệu (28–35)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 28 | `type.Portrait` | Chân dung | Portrait | MỚI (nhãn VI) — code đang dùng tên "Portrait" |
| 29 | `type.Couple` | Cặp đôi | Couple | CÓ |
| 30 | `type.Wedding` | Cưới | Wedding | MỚI (nhãn VI) — code đang dùng tên "Wedding" |
| 31 | `type.Lookbook` | Lookbook | Lookbook | CÓ |
| 32 | `type.Event` | Sự kiện | Event | CÓ |
| 33 | `medium.Digital` | Digital | Digital | CÓ |
| 34 | `medium.Film` | Film | Film | CÓ |
| 35 | `medium.Both` | Cả hai | Both | CÓ |

## E. Pipeline 8 bước (36–43) — giữ nguyên thứ tự và tên bước

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 36 | `stage.0` | Tư vấn | Consulting | CÓ |
| 37 | `stage.1` | Chốt cọc | Deposit confirmed | CÓ |
| 38 | `stage.2` | Sắp chụp | Ready to shoot | CÓ |
| 39 | `stage.3` | Đã chụp | Shot | CÓ |
| 40 | `stage.4` | Chọn ảnh | Selecting photos | CÓ |
| 41 | `stage.5` | Hậu kỳ | Post-production | CÓ |
| 42 | `stage.6` | Đã giao | Delivered | CÓ |
| 43 | `stage.7` | Xong | Done | CÓ |

## F. Điều khiển pipeline (44–46)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 44 | `jobs.currentStage` | Đang ở bước | Currently at step | CÓ |
| 45 | `jobs.nextStep` | Xong bước này | Finish this step | CÓ |
| 46 | `jobs.cancelled` | Đã huỷ | Cancelled | CÓ |

## G. Sổ tiền (47–54)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 47 | `money.income` | Thu | Income | CÓ |
| 48 | `money.expense` | Chi | Expenses | CÓ |
| 49 | `money.profit` | Lời | Profit | CÓ |
| 50 | `money.report` | Báo cáo | Report | CÓ |
| 51 | `money.addIncome` | Ghi thu | Add income | CÓ |
| 52 | `money.addExpense` | Ghi chi | Add expense | MỚI — chỉ "Ghi thu" có trong code |
| 53 | `money.noTx` | Chưa có khoản | No transactions yet | CÓ |
| 54 | `money.month` | Tháng | Month | CÓ — "Ngày" và "Tuần" cũng có trong code, theo cùng mẫu |

## H. Phòng ban — giữ tên Việt + chú thích Anh (55–60)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 55 | `dept.Sen` | Sen — Đón khách | Sen (Lotus) — Client welcome | CÓ |
| 56 | `dept.Nang` | Nắng — Buổi chụp | Nang (Sunshine) — Shoot day | CÓ |
| 57 | `dept.May` | Mây — Hậu kỳ | May (Cloud) — Post-production | CÓ |
| 58 | `dept.Lua` | Lúa — Tiền bạc | Lua (Rice) — Money | CÓ |
| 59 | `dept.Trang` | Trăng — Kể chuyện | Trang (Moon) — Storytelling | CÓ |
| 60 | `dept.Den` | Đèn — Giữ đồ | Den (Lantern) — Gear | CÓ |

## I. Cài đặt và cá nhân hoá (61–73)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 61 | `settings.title` | Cài đặt | Settings | CÓ |
| 62 | `settings.yourName` | Tên của bạn | Your name | CÓ |
| 63 | `settings.studioName` | Tên studio | Studio name | CÓ |
| 64 | `settings.language` | Ngôn ngữ | Language | CÓ — nút "Tiếng Việt" / "English" đã có |
| 65 | `settings.currency` | Tiền tệ | Currency | MỚI (nhãn) — nút "VND (₫)" / "USD ($)" đã có, nhãn mục chưa có |
| 66 | `settings.priceTable` | Bảng giá | Price list | CÓ |
| 67 | `settings.filmPriceTable` | Bảng giá film | Film price list | CÓ |
| 68 | `settings.theme` | Màu chủ đề | Theme colour | CÓ — 3 preset: Ấm, Tối giản, Tối |
| 69 | `settings.logo` | Logo studio | Studio logo | CÓ |
| 70 | `settings.templates` | Mẫu tin nhắn | Message templates | CÓ |
| 71 | `settings.restoreTemplates` | Khôi phục mẫu gốc | Restore original templates | CÓ |
| 72 | `settings.security` | Bảo mật | Security | CÓ |
| 73 | `settings.version` | Phiên bản | Version | CÓ |

## J. Google, Lịch iPhone, sao lưu (74–77)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 74 | `google.login` | Đăng nhập Google | Sign in with Google | CÓ |
| 75 | `cal.addiPhone` | Thêm vào Lịch iPhone | Add to iPhone Calendar | CÓ — nút xuất lịch trong chi tiết job |
| 76 | `cal.importNative` | Nhập từ Lịch iPhone | Import from iPhone Calendar | CÓ |
| 77 | `backup.download` | Tải bản sao lưu | Download backup | CÓ |

## K. Thông báo (78–80)

| # | Key | Tiếng Việt | English | Trong code v1 |
|---|---|---|---|---|
| 78 | `notify.saved` | Đã lưu | Saved | CÓ |
| 79 | `notify.deleted` | Đã xoá | Deleted | CÓ |
| 80 | `notify.stuck` | Job kẹt ở bước {stage} | Job stuck at {stage} | MỚI — từ "kẹt" đã có trong code, chưa có chuỗi thông báo đầy đủ |

## Tổng kết đếm

- Tổng: **80 chuỗi** (A 10 + B 5 + C 12 + D 8 + E 8 + F 3 + G 8 + H 6 + I 13 + J 4 + K 3)
- Đã có trong code v1: **73 chuỗi**
- Mới (cần thêm khi nối i18n): **7 chuỗi** — #11 `today.greeting`, #15 `today.moneyToday`, #28 `type.Portrait` (nhãn VI), #30 `type.Wedding` (nhãn VI), #52 `money.addExpense`, #65 `settings.currency` (nhãn mục), #80 `notify.stuck`
- Placeholder dùng trong chuỗi: `{name}` (tên người dùng), `{stage}` (tên bước pipeline) — giữ nguyên tên placeholder khi dịch, không dịch tên placeholder
- Không có trong bảng này (cố ý bỏ, thuộc Nấc 2/3 hoặc chưa chốt v1): chuỗi đồng bộ CloudKit, nhóm/studio và vai trò, sao lưu mã hoá, góp ý qua email, tìm kiếm, "Quay lại" — các chuỗi này chưa có trong code v1 và không thuộc phạm vi 80 chuỗi chính
