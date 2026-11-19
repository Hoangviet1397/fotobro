# FotoBro iOS v1 — Hiển thị giá theo khu vực (REGION-PRICING)

> Ngày: 20/11/2026. Trạng thái: **TÀI LIỆU — chưa chốt giá, chưa bật IAP, chưa ghi giá vào code hay App Store Listing.**
> Nguồn duy nhất: `../PRICING-DRAFT.md` (giá Nấc 2/3) và `../I18N-STRINGS.md` (ngôn ngữ + tiền tệ hiển thị trong app).
> File này chỉ giải thích **cách giá hiển thị theo khu vực**. Không sửa code app, không tạo tài khoản, không bật IAP, không cấu hình StoreKit / App Store Connect.
> **Mọi ô giá thật đều là `TBD`.** Các ví dụ dưới đây chỉ minh hoạ *định dạng hiển thị*, không phải giá thật — đừng đọc bất kỳ con số nào trong file này thành giá bán.

## 0. Tóm tắt 1 đoạn

- **Nấc 1 — Cá nhân: Miễn phí**, không giới hạn thời gian (theo `PRICING-DRAFT.md` §2).
- **Nấc 2 — Đồng bộ: thu phí, giá `TBD` / chu kỳ `TBD`** (tháng / năm / mua 1 lần — chưa chốt).
- **Nấc 3 — Studio: thu phí, giá `TBD` / chu kỳ `TBD`, cao hơn Nấc 2** (chưa chốt).
- Giá Nấc 2/3 **không do app tự đặt, tự tính hay tự quy đổi**. Giá do **App Store / StoreKit** quyết theo **storefront (quốc gia/vùng của Apple ID)** của người mua, và app chỉ **hiển thị đúng chuỗi giá Apple trả về** (`localizedPrice`).
- Tiền tệ hiển thị trong app cho **job / sổ tiền / bảng giá** (`VND` / `USD`, theo `I18N-STRINGS.md`) là một hệ riêng, **không phải** tiền tệ của giá Nấc 2/3 và **không điều khiển** giá IAP.
- **Không quy đổi tỷ giá trong app** — ở cả hai hệ: không đổi VND ↔ USD cho sổ tiền, và không đổi giá IAP từ tiền này sang tiền khác.

## 1. Hai hệ tiền tệ khác nhau — đừng trộn lẫn

|  | A. Tiền tệ trong app (job / sổ tiền / bảng giá) | B. Giá Nấc 2/3 (IAP qua App Store) |
|---|---|---|
| Nguồn | `I18N-STRINGS.md`: `currency` chỉ nhận `'VND'` / `'USD'`; user chọn trong Cài đặt (`settings.currency` — Tiền tệ / Currency) | `PRICING-DRAFT.md` §0: StoreKit / IAP của Apple; giá + chu kỳ cấu hình trong App Store Connect sau khi Việt chốt |
| Dùng cho | Giá job, cọc, đã thu, còn thiếu, báo cáo thu/chi, bảng giá digital/film | Chỉ màn giá / màn nâng cấp Nấc 2, Nấc 3 |
| Ai quyết tiền tệ | **User chọn** trong Cài đặt | **Apple quyết** theo storefront của Apple ID người mua (xem §2) |
| Có đổi theo ngôn ngữ không? | Không tự đổi — user chọn riêng ngôn ngữ (`locale` `'vi'` / `'en'`) và tiền tệ (`VND` / `USD`) | Không — ngôn ngữ giao diện không đổi tiền tệ IAP (xem §3) |
| Có quy đổi tỷ giá không? | **Không.** Chỉ đổi hiển thị, không quy đổi tỷ giá (`I18N-STRINGS.md`: VND `1.000.000₫` kiểu vi-VN; USD `$1,000.00` kiểu en-US) | **Không.** App không tự tính giá nước này từ giá nước khác; Apple cho sẵn giá từng storefront |

Hệ quả thực tế: một user có thể để giao diện **tiếng Anh + tiền tệ USD** cho sổ tiền, nhưng khi mua Nấc 2 bằng Apple ID Việt Nam thì màn giá vẫn hiện **giá VND của storefront Việt Nam** — và ngược lại. Hai lựa chọn đó độc lập với nhau.

## 2. Giá Nấc 2/3 hiển thị theo App Store từng quốc gia như thế nào

Quy trình (theo `PRICING-DRAFT.md` §0, §5–§6 — Việt chốt giá + chu kỳ trước, rồi mới cấu hình):

1. Việt chốt **giá + chu kỳ** Nấc 2 và Nấc 3 (ít nhất 4 điểm #1–#4 trong `PRICING-DRAFT.md` §5).
2. Cấu hình IAP / StoreKit trong **App Store Connect**: chọn loại IAP (auto-renewable subscription hay mua 1 lần), chọn **bậc giá (price tier)** cho từng sản phẩm.
3. Apple tự sinh **giá tương đương cho từng storefront/quốc gia** theo bậc giá đó (có thể chỉnh tay từng nước trong App Store Connect nếu muốn, nhưng mặc định là Apple tính sẵn — app không tự tính).
4. Trong app, màn giá **không hard-code số tiền, không hard-code ký hiệu tiền**. App gọi StoreKit lấy sản phẩm và hiển thị đúng chuỗi Apple trả về cho storefront đó (giá đã gồm ký hiệu tiền + định dạng số của nước đó).

Vì vậy, cùng một sản phẩm Nấc 2, người mua ở các nước sẽ thấy **số tiền và ký hiệu tiền khác nhau**, nhưng đó là **cùng một bậc giá Apple**, không phải app quy đổi tỷ giá.

| Storefront (Apple ID) | Tiền tệ hiển thị cho giá Nấc 2/3 | Ai quyết |
|---|---|---|
| Việt Nam | **VND (₫)** | Apple, theo bậc giá đã cấu hình trong App Store Connect |
| Hoa Kỳ | **USD ($)** | Apple, theo bậc giá đã cấu hình |
| Các nước khác (EU, Anh, Úc, Nhật, …) | **Tiền tệ của nước đó** (EUR, GBP, AUD, JPY, …) | Apple, theo bậc giá đã cấu hình |
| Không có storefront / chưa tải được giá | **Không hiện giá** — hiện trạng thái đang tải / thử lại, không hiện số bịa | App phải xử lý: chưa có giá từ StoreKit thì không được tự điền số |

Lưu ý:

- Giá hiển thị là giá **đã gồm thuế theo quy định của App Store từng nước** (Apple tính, app không cộng/trừ thuế).
- Nấc 2 hết hạn thì app quay về Nấc 1: dữ liệu local còn nguyên, chỉ tắt đồng bộ/team, không khoá dữ liệu cũ (`PRICING-DRAFT.md` §0). Điều này không đổi theo quốc gia.
- Không tự làm cổng thanh toán riêng trong app (vi phạm guideline App Store — `PRICING-DRAFT.md` §0).

## 3. Có đổi tiền tệ theo ngôn ngữ không? — Không

Trong FotoBro v1 chỉ có 2 ngôn ngữ giao diện (`locale` `'vi'` / `'en'`) và 2 lựa chọn tiền tệ cho sổ tiền (`currency` `'VND'` / `'USD'`) — theo `I18N-STRINGS.md`. Ba thứ này độc lập:

| Ngôn ngữ giao diện | Tiền tệ sổ tiền (user chọn) | Tiền tệ giá Nấc 2/3 (Apple quyết) |
|---|---|---|
| Tiếng Việt (`vi`) | VND hoặc USD — user chọn | Theo storefront Apple ID, không theo ngôn ngữ |
| English (`en`) | VND hoặc USD — user chọn | Theo storefront Apple ID, không theo ngôn ngữ |

Ví dụ đối chiếu (chỉ là tổ hợp, **giá vẫn là `TBD`**):

| Trường hợp | Giao diện | Sổ tiền hiện | Màn giá Nấc 2 hiện |
|---|---|---|---|
| Photographer ở Việt Nam, dùng tiếng Việt | Tiếng Việt | `1.000.000₫` (nếu chọn VND) | Giá VND của storefront Việt Nam — vd. định dạng `₫[giá TBD]/tháng` |
| Photographer ở Việt Nam, dùng tiếng Anh | English | `$1,000.00` (nếu chọn USD) | **Vẫn giá VND** của storefront Việt Nam — ngôn ngữ không đổi tiền tệ IAP |
| Photographer người Việt ở Mỹ, dùng tiếng Việt | Tiếng Việt | `1.000.000₫` (nếu chọn VND) | **Giá USD** của storefront Hoa Kỳ — vd. định dạng `$[giá TBD]/month` |
| Photographer nước ngoài, dùng tiếng Anh | English | `$1,000.00` (nếu chọn USD) | Giá tiền tệ nước của họ (USD / EUR / …) theo storefront của họ |

Quy tắc nhớ: **ngôn ngữ đổi chữ, không đổi tiền IAP; tiền tệ trong Cài đặt đổi cách hiện sổ tiền, không đổi giá IAP; storefront đổi tiền tệ IAP, không đổi ngôn ngữ hay sổ tiền.**

## 4. Không quy đổi tỷ giá trong app — ghi rõ

- **Sổ tiền / bảng giá:** chọn VND thì hiện `1.000.000₫`, chọn USD thì hiện `$1,000.00` — chỉ đổi **cách hiển thị** của cùng một con số đã nhập, **không nhân/chia theo tỷ giá** (`I18N-STRINGS.md`). Không có tỷ giá nào được hard-code hay gọi API tỷ giá trong app.
- **Giá Nấc 2/3:** app **không** lấy giá VND rồi nhân tỷ giá ra USD (hay ngược lại) để hiện cho nước khác. Giá từng nước là giá Apple đã cấu hình/sinh sẵn theo bậc giá; app chỉ hiển thị lại.
- **Không có trường hợp nào app tự quy đổi:** không quy đổi khi đổi ngôn ngữ, không quy đổi khi đổi tiền tệ trong Cài đặt, không quy đổi khi user đổi storefront, không quy đổi khi hết hạn / gia hạn.
- Nếu sau này Việt muốn giá Nấc 2/3 ở một nước khác hẳn bậc giá chung, cách làm là **chỉnh giá từng nước trong App Store Connect**, không phải thêm code quy đổi trong app.

## 5. Ví dụ hiển thị (định dạng — không phải giá thật)

> **Đọc kỹ:** mọi con số giá dưới đây đều là `TBD`. Ký hiệu `[giá TBD]` giữ nguyên vị trí của con số thật sau khi Việt chốt. Chỉ định dạng, ký hiệu tiền, vị trí `/tháng`–`/month` và ngôn ngữ câu chữ là thứ ví dụ này minh hoạ.

### 5.1. Màn giá Nấc 2 — user Việt Nam, giao diện tiếng Việt

- Tiêu đề: Đồng bộ — Nấc 2
- Giá: `₫[giá TBD]/tháng` (hoặc `/năm` / `mua 1 lần` — theo chu kỳ Việt chốt)
- Ghi chú: Miễn phí Nấc 1 vẫn giữ nguyên; hết hạn quay về Nấc 1, dữ liệu local còn nguyên.

### 5.2. Màn giá Nấc 2 — user Việt Nam, giao diện tiếng Anh

- Tiêu đề: Sync — Tier 2
- Giá: **`₫[giá TBD]/month`** — tiền vẫn là VND (storefront Việt Nam), chỉ chữ đổi sang tiếng Anh.
- Đây là trường hợp dễ nhầm nhất: đừng đổi `₫` thành `$` chỉ vì giao diện đang là tiếng Anh.

### 5.3. Màn giá Nấc 2 — user ở Hoa Kỳ, giao diện tiếng Việt

- Tiêu đề: Đồng bộ — Nấc 2
- Giá: **`$[giá TBD]/tháng`** — chữ vẫn tiếng Việt, tiền là USD (storefront Hoa Kỳ).
- Ngược lại với 5.2: đừng đổi `$` thành `₫` chỉ vì giao diện đang là tiếng Việt.

### 5.4. Màn giá Nấc 3 — mọi khu vực

- Nấc 3 gồm tất cả Nấc 2 + workspace studio; giá **`TBD`, cao hơn Nấc 2** (`PRICING-DRAFT.md` §1, §4).
- Hiển thị cùng nguyên tắc: cùng một bậc giá Apple, mỗi storefront hiện tiền tệ của nước đó; chu kỳ hiển thị theo chu kỳ Việt chốt (tháng / năm / mua 1 lần — và, nếu chốt tính theo workspace hay theo thành viên, phải ghi rõ trên màn giá, vì đó là điểm #4 trong `PRICING-DRAFT.md` §5).

### 5.5. Định dạng số tiền tham chiếu (từ `I18N-STRINGS.md`, chỉ cho sổ tiền — không phải giá IAP)

| Lựa chọn trong Cài đặt | Ví dụ hiển thị sổ tiền |
|---|---|
| VND | `1.000.000₫` (định dạng vi-VN: dấu `.` phân cách nghìn, `₫` đặt sau số) |
| USD | `$1,000.00` (định dạng en-US: dấu `,` phân cách nghìn, `$` đặt trước số) |

Bảng này chỉ để đối chiếu định dạng số — **không dùng nó để suy ra giá Nấc 2/3** ở bất kỳ nước nào.

## 6. Chuỗi giao diện cho màn giá — chưa có trong `I18N-STRINGS.md`

`I18N-STRINGS.md` có 80 chuỗi chính cho v1 và **cố ý bỏ** các chuỗi Nấc 2/3 (đồng bộ, nhóm, sao lưu mã hoá) vì chưa thuộc v1. Vì vậy:

- **Chưa có** chuỗi Việt/Anh nào cho màn giá Nấc 2/3 trong bảng 80 chuỗi đó (không có key giá, chu kỳ, dùng thử, khôi phục mua hàng, hết hạn…).
- File này **không tự bịa thêm key i18n** cho màn giá. Khi Việt chốt giá + chu kỳ (mục 7) và màn giá được làm, các chuỗi đó phải được thêm vào `I18N-STRINGS.md` (hoặc file i18n nối tiếp) với đủ cả hai ngôn ngữ `vi` / `en` — và chuỗi **giá tiền thì không dịch**, chỉ hiển thị lại chuỗi Apple trả về.
- Nguyên tắc dịch cho màn giá (khi tới lúc đó): dịch **tên gói, mô tả tính năng, chu kỳ (`/tháng`–`/month`, `/năm`–`/year`, `mua 1 lần`–`one-time purchase`)**; **không dịch** số tiền, ký hiệu tiền, tên app `FotoBro`.

## 7. Những gì cần Việt chốt trước khi hiển thị giá thật

Lấy từ `PRICING-DRAFT.md` §5 (6 điểm), chỉ những điểm ảnh hưởng trực tiếp tới hiển thị theo khu vực:

| # | Cần Việt chốt | Ảnh hưởng tới hiển thị theo khu vực |
|---|---|---|
| 1 | **Giá Nấc 2** | Không có giá thì không có bậc giá Apple → không có giá từng nước để hiện |
| 2 | **Chu kỳ Nấc 2** (tháng / năm / mua 1 lần) | Đổi hậu tố hiển thị (`/tháng`–`/month`, `/năm`–`/year`, `mua 1 lần`) ở mọi nước |
| 3 | **Giá Nấc 3** (cao hơn Nấc 2 bao nhiêu) | Như #1, cho Nấc 3 |
| 4 | **Chu kỳ Nấc 3** (tháng / năm / mua 1 lần; tính theo workspace hay theo thành viên) | Đổi hậu tố + câu ghi chú tính tiền nhóm trên màn giá |
| 5 | **Có dùng thử miễn phí không?** (vd: 7/14 ngày) | Nếu có, màn giá phải hiện rõ thời gian dùng thử + giá sau dùng thử, ở mọi storefront |
| 6 | Bộ vai trò Nấc 3 | Không đổi tiền tệ, chỉ đổi mô tả tính năng Nấc 3 trên màn giá |

## 8. Điều kiện chuyển bước

1. Việt chốt giá + chu kỳ Nấc 2/3 (mục 7, ít nhất #1–#4) → điền số thật vào `PRICING-DRAFT.md` §1 thay cho `TBD`.
2. Cấu hình IAP / StoreKit trong App Store Connect với đúng giá + chu kỳ đã chốt (bậc giá → Apple sinh giá từng storefront); màn giá trong app chỉ hiện sau bước này.
3. Thêm chuỗi màn giá Việt/Anh vào `I18N-STRINGS.md` (mục 6) — dịch tên gói/mô tả/chu kỳ, không dịch số tiền.
4. Test trên TestFlight: mua thử (sandbox) ở storefront Việt Nam và ít nhất một storefront khác, kiểm tra tiền tệ + định dạng số đúng từng nước, ngôn ngữ không làm đổi tiền tệ, và hết hạn quay về Nấc 1 mà dữ liệu local còn nguyên.

## 9. Trạng thái

- **Tài liệu xong.** Chỉ 1 file mới (`batch-i18n/REGION-PRICING.md`), không sửa file nào khác, không sửa code, không tạo tài khoản, không bật IAP.
- Mọi ô giá thật đều là `TBD` — không có giá bịa nào trong file này.
- Còn chờ Việt: chốt giá + chu kỳ Nấc 2/3 (`PRICING-DRAFT.md` §5) trước khi cấu hình IAP và hiển thị giá thật.
