# FotoBro — Thiết kế thử nghiệm giá sau khi ra mắt

> Ngày: 20/11/2026. Trạng thái: **THIẾT KẾ — chưa chạy, chưa có giá thật, chưa có số liệu người dùng thật.**
> Nguồn giá: `PRICING-DRAFT.md` (cùng thư mục gốc). Nấc 1 miễn phí, Nấc 2/3 thu phí là quyết định đã chốt ngày 19/11/2026; **giá và chu kỳ các nấc đều là `TBD` — mọi mức giá trong file này chỉ là ký hiệu (Giá A / Giá B / Giá C), không phải giá thật.**
> File này chỉ là thiết kế thử nghiệm. Không sửa code app, không cấu hình IAP/StoreKit, không tạo tài khoản, không push GitHub.

## 0. Đọc trước khi dùng file này

- **Chưa có giá thật.** Không có mức giá nào trong file này được dùng để cấu hình IAP hay ghi vào App Store Listing. Việt phải chốt giá + chu kỳ Nấc 2/3 trước (xem `PRICING-DRAFT.md` §5, ít nhất #1–#4), rồi mới điền số thật vào các ký hiệu Giá A/B/C dưới đây.
- **Chưa có số liệu người dùng thật.** App chưa ra mắt nên chưa có baseline nào: không có tỉ lệ chuyển đổi, không có tỉ lệ giữ chân, không có doanh thu, không có số người dùng. Mọi con số baseline trong file này đều ghi là `TBD — đo sau khi ra mắt`. Không bịa số liệu người dùng.
- **Thử nghiệm chỉ chạy sau khi ra mắt.** Điều kiện tiên quyết: Nấc 2 đã code xong và chạy ổn trên TestFlight + bản live, IAP đã cấu hình đúng giá đã chốt, và đã có ít nhất một chu kỳ đo baseline (xem §1).
- **Nấc 1 giữ miễn phí.** Mọi thử nghiệm trong file này chỉ chạm tới Nấc 2/3. Không thử nghiệm nào được thu phí, giới hạn hay làm chậm tính năng Nấc 1.
- **Hết hạn thì quay về Nấc 1, dữ liệu local còn nguyên.** Đây là nguyên tắc đã chốt trong `PRICING-DRAFT.md` §0 — thử nghiệm giá không được đổi nguyên tắc này.
- **Tuân thủ App Store.** Chỉ dùng StoreKit / IAP của Apple (auto-renewable subscription hoặc mua 1 lần). Không tự làm cổng thanh toán riêng trong app. Không dùng chiêu trò gây áp lực giả (đếm ngược giả, "chỉ còn 1 suất", giảm giá giả).

## 1. Nguyên tắc chung cho mọi thử nghiệm

### 1.1. Đo baseline trước, thử sau

Trước thử nghiệm đầu tiên, chạy app live với **một mức giá duy nhất đã chốt** trong ít nhất **4 tuần** (hoặc ít nhất 1 chu kỳ gia hạn tháng, tuỳ cái nào dài hơn) để có baseline. Baseline cần có, trước khi so sánh bất kỳ biến thể nào:

| Chỉ số baseline | Ghi chú |
|---|---|
| Số người mở màn giá / tuần | `TBD` — đo sau khi ra mắt |
| Tỉ lệ mở màn giá → bắt đầu dùng thử / mua | `TBD` |
| Tỉ lệ dùng thử → trả phí (trial-to-paid) | `TBD` |
| Tỉ lệ mua tháng / mua năm / mua trọn đời | `TBD` |
| Tỉ lệ huỷ trong 30 ngày đầu | `TBD` |
| Tỉ lệ gia hạn tháng 2, tháng 3 | `TBD` |
| Doanh thu / người dùng trả phí / tháng | `TBD` |
| Tỉ lệ người dùng Nấc 1 còn hoạt động sau 30 ngày | `TBD` (chỉ số bảo vệ — xem §1.3) |

Không có baseline thì không kết luận được thử nghiệm thắng hay thua — chỉ thấy "khác nhau" mà không biết "tốt hơn".

### 1.2. Một thử nghiệm một lúc trên cùng một phễu

- Chỉ chạy **1 thử nghiệm tại một thời điểm** trên phễu mua Nấc 2, và **1 thử nghiệm** trên phễu mua Nấc 3. Hai phễu khác nhau nên có thể chạy song song, nhưng không chạy 2 thử nghiệm cùng lúc trên cùng một phễu (kết quả sẽ không tách được do thử nghiệm nào gây ra).
- Phân nhóm ngẫu nhiên theo user (không theo thiết bị, không theo lần mở app), tỉ lệ chia nhóm ghi rõ trong từng thử nghiệm. Một user chỉ thuộc 1 nhóm trong suốt thử nghiệm đó — không đổi nhóm giữa chừng.
- Không chạy thử nghiệm trong tuần đầu ra mắt, tuần có sự kiện lớn của app (vd: lên báo, được Apple giới thiệu), hay tuần vừa đổi màn giá / onboarding — các yếu tố đó làm lệch kết quả.

### 1.3. Chỉ số bảo vệ (guardrail) — áp dụng cho mọi thử nghiệm

Một thử nghiệm chỉ được coi là thắng nếu **không vi phạm** các chỉ số bảo vệ sau (ngưỡng cụ thể điền sau khi có baseline):

- Tỉ lệ người dùng Nấc 1 còn hoạt động sau 30 ngày **không giảm** so với đối chứng.
- Tỉ lệ huỷ / yêu cầu hoàn tiền **không tăng** so với đối chứng.
- Số khiếu nại / email hỗ trợ về giá **không tăng đột biến** so với đối chứng.
- Không có lỗi kỹ thuật do thử nghiệm gây ra (mua lỗi, mất quyền Nấc 2/3 sau khi mua, hết hạn không quay về Nấc 1 đúng).

Nếu vi phạm guardrail thì dừng thử nghiệm ngay, dù chỉ số chính có vẻ tốt.

### 1.4. Cách đọc kết quả

- Thắng/thua quyết định bằng **chỉ số chính** (ghi trong từng thử nghiệm), có ý nghĩa thống kê (p < 0,05) **và** chênh lệch đủ lớn để có ý nghĩa thực tế (ngưỡng chênh lệch tối thiểu ghi trong từng thử nghiệm; nếu chưa có baseline thì đặt ngưỡng sau khi đo baseline, trước khi chạy thử nghiệm).
- Cỡ mẫu: tính bằng phép tính power analysis **sau khi có baseline** (dựa trên tỉ lệ chuyển đổi baseline và chênh lệch tối thiểu muốn phát hiện). Không đặt trước một con số người dùng cố định khi chưa có baseline — con số đó sẽ là bịa.
- Thời gian chạy tối thiểu ghi trong từng thử nghiệm. Không kết luận sớm trước thời gian tối thiểu, kể cả khi kết quả sớm trông rất tốt (kết quả sớm hay đảo chiều).
- Ghi lại mọi quyết định vào bảng §8 (nhật ký thử nghiệm) — kể cả thử nghiệm thua hoặc dừng giữa chừng.

### 1.5. Cần chuẩn bị trước khi chạy thử nghiệm đầu tiên

- [ ] Việt chốt giá + chu kỳ Nấc 2/3 (`PRICING-DRAFT.md` §5 #1–#4).
- [ ] IAP / StoreKit đã cấu hình đúng giá đã chốt; màn giá trong app chỉ hiện giá thật.
- [ ] Đo được baseline 4 tuần (§1.1) — các ô `TBD` đã có số thật.
- [ ] Có cách phân nhóm ngẫu nhiên theo user và ghi lại nhóm của từng user (để không đổi nhóm giữa chừng).
- [ ] Có dashboard theo dõi được, tối thiểu: mở màn giá, bắt đầu dùng thử/mua, trial-to-paid, huỷ, gia hạn, doanh thu / người dùng trả phí.
- [ ] Có cách dừng thử nghiệm nhanh (tắt biến thể, đưa mọi user về giá đã chốt) mà không làm hỏng quyền Nấc 2/3 của người đã mua.

## 2. Thử nghiệm 1 — Mức giá Nấc 2

Thử nghiệm quan trọng nhất, chạy đầu tiên sau khi có baseline.

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Có một mức giá Nấc 2 mà tại đó doanh thu / người dùng cao hơn mức giá đã chốt ban đầu, vì giá thấp hơn thì nhiều người mua hơn nhưng mỗi người trả ít hơn, giá cao hơn thì ít người mua hơn nhưng mỗi người trả nhiều hơn. Mức giá tối ưu nằm ở giữa, không phải ở hai đầu. |
| **Nhóm đối chứng** | Giá Nấc 2 đã chốt ban đầu (Giá A = giá chốt trong `PRICING-DRAFT.md`, `TBD` cho tới khi Việt chốt). Nhóm này chiếm 50% user vào phễu mua Nấc 2. |
| **Nhóm thử nghiệm** | Giá B — thấp hơn Giá A một nấc (mức chênh lệch do Việt chốt khi điền số thật; vd: thấp hơn khoảng 20–30% — con số % này là gợi ý khoảng thử, không phải giá thật). Nhóm này chiếm 25%. Giá C — cao hơn Giá A một nấc (chênh lệch tương tự, do Việt chốt). Nhóm này chiếm 25%. Chỉ thử **1 chu kỳ** trong thử nghiệm này (chu kỳ đã chốt — tháng hoặc năm; không trộn tháng với năm ở đây, xem thử nghiệm 3). |
| **Chỉ số chính** | Doanh thu Nấc 2 / 1.000 người mở màn giá (tính trong 60 ngày từ lúc mở màn giá, để bao gồm cả dùng thử + gia hạn đầu tiên nếu có). |
| **Chỉ số phụ** | Tỉ lệ mở màn giá → mua; tỉ lệ dùng thử → trả phí (nếu có dùng thử); tỉ lệ huỷ trong 30 ngày; tỉ lệ gia hạn tháng 2. |
| **Chỉ số bảo vệ** | §1.3 (đặc biệt: tỉ lệ huỷ và tỉ lệ người dùng Nấc 1 còn hoạt động). |
| **Thời gian chạy** | Tối thiểu **8 tuần** (đủ dài để qua ít nhất 1 chu kỳ gia hạn tháng; nếu chu kỳ đã chốt là năm thì tối thiểu 8 tuần vẫn áp dụng cho chỉ số mua ban đầu, còn chỉ số gia hạn năm thì ghi nhận sau, không đợi đủ 1 năm mới kết luận phần mua ban đầu). Không kết luận trước 8 tuần. |
| **Tiêu chí thắng** | Một mức giá thắng khi: (1) doanh thu / 1.000 người mở màn giá cao hơn đối chứng **ít nhất 10%** với p < 0,05; **và** (2) không vi phạm guardrail §1.3; **và** (3) tỉ lệ huỷ trong 30 ngày không cao hơn đối chứng quá 2 điểm phần trăm. Nếu Giá B và Giá C đều không thắng thì giữ Giá A. Nếu cả hai đều thắng thì chọn mức có doanh thu cao hơn. |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: tỉ lệ mua lỗi / mất quyền tăng; huỷ tăng mạnh (cao hơn đối chứng quá 5 điểm phần trăm trong 2 tuần liên tiếp); hoặc khiếu nại về giá tăng đột biến. |
| **Ghi chú / rủi ro** | Người đã mua ở giá cũ giữ nguyên giá cũ cho tới khi huỷ (không tăng giá retroactive với người đang dùng). Màn giá phải ghi rõ giá theo chu kỳ đã chốt, không ghi giá "gốc" bịa để tạo cảm giác giảm giá. Nếu Giá A ban đầu là giá Việt chốt theo cảm tính thì thử nghiệm này là cách kiểm chứng lại bằng số liệu thật — kết quả có thể là "giá chốt ban đầu đã đúng". |

## 3. Thử nghiệm 2 — Độ dài dùng thử miễn phí Nấc 2 (7 / 14 / 30 ngày)

Chỉ chạy sau khi thử nghiệm 1 kết thúc và đã chọn được mức giá Nấc 2 (hoặc sau khi quyết định giữ Giá A). Không chạy cùng lúc với thử nghiệm 1.

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Dùng thử càng dài thì càng nhiều người kịp trải nghiệm giá trị đồng bộ/sao lưu mã hoá (đổi máy, khôi phục dữ liệu) nên tỉ lệ dùng thử → trả phí cao hơn; nhưng dùng thử quá dài thì người dùng trì hoãn quyết định và có thể huỷ nhiều hơn sau khi hết thử. Độ dài tối ưu có thể là 14 ngày, không phải 7 hay 30. |
| **Nhóm đối chứng** | Dùng thử **7 ngày** (hoặc "không dùng thử" nếu Việt chốt ban đầu là không có dùng thử — ghi rõ lựa chọn này trước khi chạy; đối chứng phải là phương án đang chạy live lúc đó). Nhóm này chiếm 34% user vào phễu mua Nấc 2. |
| **Nhóm thử nghiệm** | Dùng thử **14 ngày** (33%) và dùng thử **30 ngày** (33%). Giá, chu kỳ và màn giá giữ nguyên như sau thử nghiệm 1 — chỉ đổi độ dài dùng thử. |
| **Chỉ số chính** | Tỉ lệ dùng thử → trả phí (tính trong 7 ngày sau khi hết dùng thử, để bao gồm cả người trả phí chậm vài ngày). |
| **Chỉ số phụ** | Tỉ lệ mở màn giá → bắt đầu dùng thử; doanh thu Nấc 2 / 1.000 người mở màn giá (60 ngày); tỉ lệ huỷ trong 30 ngày sau khi trả phí; tỉ lệ người dùng thử có bật đồng bộ / khôi phục dữ liệu ít nhất 1 lần trong thời gian thử (dấu hiệu đã trải nghiệm giá trị). |
| **Chỉ số bảo vệ** | §1.3. |
| **Thời gian chạy** | Tối thiểu **10 tuần** (nhóm 30 ngày cần 30 ngày thử + 7 ngày chờ trả phí + thời gian gom đủ mẫu; nhóm 7 ngày xong sớm hơn nhưng vẫn đợi đủ 10 tuần để so sánh công bằng). Không kết luận trước 10 tuần. |
| **Tiêu chí thắng** | Một độ dài thắng khi: (1) tỉ lệ dùng thử → trả phí cao hơn đối chứng **ít nhất 5 điểm phần trăm** với p < 0,05; **và** (2) doanh thu / 1.000 người mở màn giá không thấp hơn đối chứng; **và** (3) không vi phạm guardrail §1.3. Nếu 14 và 30 ngày đều thắng thì chọn độ dài ngắn hơn trong hai (ít "cho không" thời gian hơn mà vẫn đạt hiệu quả). Nếu không độ dài nào thắng thì giữ đối chứng. |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: tỉ lệ dùng thử → trả phí của một nhóm thấp hơn đối chứng quá 10 điểm phần trăm trong 4 tuần liên tiếp; hoặc có lỗi hết thử không chuyển sang trả phí / không quay về Nấc 1 đúng. |
| **Ghi chú / rủi ro** | Cấu hình dùng thử là introductory offer trong App Store Connect — đổi độ dài là đổi cấu hình IAP, cần Việt duyệt trước khi đổi. Màn giá phải ghi rõ ngày hết dùng thử và giá sau dùng thử, không giấu giá. Người dùng phải huỷ được dùng thử trong 1 chạm trước khi hết hạn. Nếu Việt chốt ban đầu là "không dùng thử" thì thử nghiệm này vẫn có ý nghĩa: đối chứng = không dùng thử, thử nghiệm = 7 vs 14 ngày (bỏ nhóm 30 ngày ở vòng đầu). |

## 4. Thử nghiệm 3 — Chu kỳ: theo năm vs theo tháng (Nấc 2)

Chỉ chạy sau khi đã chọn được mức giá (thử nghiệm 1) và độ dài dùng thử (thử nghiệm 2). Không trộn với thử nghiệm 1/2.

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Gói năm (trả 1 lần cho 12 tháng, giá năm thấp hơn tổng 12 tháng lẻ) giữ chân tốt hơn gói tháng vì người dùng đã trả trước cả năm và ít có điểm quyết định huỷ hàng tháng; nhưng gói tháng dễ mua hơn lúc đầu vì số tiền mỗi lần trả thấp hơn. Hiển thị cả hai lựa chọn cùng lúc, với gói năm là lựa chọn mặc định được gợi ý, sẽ cho doanh thu / người dùng cao hơn chỉ bán gói tháng. |
| **Nhóm đối chứng** | Chỉ bán **gói tháng** (chu kỳ đã chốt ban đầu nếu là tháng; nếu chu kỳ chốt ban đầu là năm thì đối chứng là chỉ bán gói năm — ghi rõ trước khi chạy). Nhóm này chiếm 50% user vào phễu mua Nấc 2. |
| **Nhóm thử nghiệm** | Hiển thị **cả gói tháng và gói năm**, gói năm được gợi ý là lựa chọn chính (hiển thị trước / đánh dấu "tiết kiệm hơn"), giá năm = `TBD` (do Việt chốt; phải thấp hơn tổng 12 tháng lẻ thì mới gọi là tiết kiệm — mức chiết khấu cụ thể do Việt chốt khi điền số thật). Nhóm này chiếm 50%. |
| **Chỉ số chính** | Doanh thu Nấc 2 / người dùng trả phí trong **6 tháng** đầu (tính cả người mua năm trả trước cả năm và người mua tháng trả dần — so sánh trên cùng cửa sổ 6 tháng). |
| **Chỉ số phụ** | Tỉ lệ mở màn giá → mua; tỉ lệ chọn gói năm trong nhóm thử nghiệm; tỉ lệ huỷ gói tháng trong 6 tháng; tỉ lệ người mua năm còn dùng sau 6 tháng. |
| **Chỉ số bảo vệ** | §1.3 (đặc biệt: tỉ lệ huỷ và khiếu nại về giá). |
| **Thời gian chạy** | Tối thiểu **6 tháng** cho chỉ số chính (vì cần đủ thời gian để người mua tháng huỷ dần và người mua năm thể hiện giá trị giữ chân). Có thể đọc chỉ số phụ (tỉ lệ mua ban đầu, tỉ lệ chọn gói năm) sau 8 tuần, nhưng **không kết luận thắng/thua** trước 6 tháng. |
| **Tiêu chí thắng** | Nhóm thử nghiệm thắng khi: (1) doanh thu / người dùng trả phí trong 6 tháng cao hơn đối chứng **ít nhất 10%** với p < 0,05; **và** (2) tỉ lệ huỷ trong 6 tháng không cao hơn đối chứng; **và** (3) không vi phạm guardrail §1.3. Nếu nhóm thử nghiệm không thắng thì giữ phương án đối chứng (chỉ bán 1 chu kỳ). |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: tỉ lệ mua ban đầu của nhóm thử nghiệm thấp hơn đối chứng quá 20% trong 4 tuần đầu (màn giá 2 lựa chọn làm người dùng rối và bỏ mua); hoặc có lỗi tính giá năm / gia hạn năm. |
| **Ghi chú / rủi ro** | Giá năm phải là giá thật đã chốt, không được ghi giá năm "gốc" bịa rồi gạch đi. Màn giá phải ghi rõ: gói năm trả 1 lần bao nhiêu, gia hạn năm bao nhiêu, huỷ thì dùng tới hết kỳ đã trả. Người mua năm huỷ giữa năm thì vẫn dùng tới hết năm đã trả (theo luật App Store) — màn giá và màn huỷ phải nói rõ điều này. Nếu Việt chốt ban đầu là "chỉ bán năm" thì đổi vai: đối chứng = chỉ bán năm, thử nghiệm = cả tháng + năm. |

## 5. Thử nghiệm 4 — Gói trọn đời (mua 1 lần) vs gói đăng ký (Nấc 2)

Thử nghiệm rủi ro cao nhất trong 4 thử nghiệm Nấc 2 — chỉ chạy sau khi thử nghiệm 3 kết thúc, và chỉ chạy nếu Việt đồng ý về nguyên tắc bán trọn đời (vì bán trọn đời là cam kết dài hạn với người mua).

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Một số nhiếp ảnh gia muốn trả 1 lần rồi dùng mãi, không muốn đăng ký hàng tháng/năm; gói trọn đời sẽ thu hút nhóm này và cho doanh thu ngay cao hơn, nhưng đổi lại mất doanh thu gia hạn dài hạn từ chính nhóm này. Gói trọn đời chỉ có lợi nếu giá trọn đời đủ cao để bù doanh thu gia hạn đã mất. |
| **Nhóm đối chứng** | Chỉ bán **gói đăng ký** (kết quả sau thử nghiệm 3 — tháng, năm, hoặc cả hai). Nhóm này chiếm 50% user vào phễu mua Nấc 2. |
| **Nhóm thử nghiệm** | Thêm **gói trọn đời (mua 1 lần, giá `TBD` — do Việt chốt)** bên cạnh gói đăng ký, hiển thị rõ "trả 1 lần, dùng Nấc 2 mãi". Nhóm này chiếm 50%. Giá trọn đời là giá thật đã chốt trước khi chạy — không thử "giá trọn đời A vs B" trong cùng thử nghiệm này (muốn thử 2 mức giá trọn đời thì làm thử nghiệm khác sau). |
| **Chỉ số chính** | Doanh thu Nấc 2 / 1.000 người mở màn giá trong **12 tháng** (tính cả tiền trọn đời thu ngay + tiền đăng ký thu dần trong 12 tháng; nhóm trọn đời không còn tiền gia hạn sau lần mua đầu nên phải so sánh trên cửa sổ dài). |
| **Chỉ số phụ** | Tỉ lệ mở màn giá → mua (bất kỳ gói nào); tỉ lệ chọn trọn đời trong nhóm thử nghiệm; doanh thu / người dùng trả phí trong 12 tháng; tỉ lệ người mua trọn đời còn dùng app sau 12 tháng (so với người mua đăng ký). |
| **Chỉ số bảo vệ** | §1.3, cộng thêm: tỉ lệ yêu cầu hoàn tiền gói trọn đời (người mua trọn đời rồi hối hận) không vượt quá tỉ lệ hoàn tiền của gói đăng ký. |
| **Thời gian chạy** | Tối thiểu **12 tháng** cho chỉ số chính. Có thể đọc chỉ số phụ (tỉ lệ mua ban đầu, tỉ lệ chọn trọn đời) sau 8 tuần, nhưng **không kết luận thắng/thua** trước 12 tháng. Đây là thử nghiệm dài nhất — cân nhắc kỹ trước khi bắt đầu. |
| **Tiêu chí thắng** | Nhóm thử nghiệm thắng khi: (1) doanh thu / 1.000 người mở màn giá trong 12 tháng cao hơn đối chứng **ít nhất 15%** với p < 0,05 (ngưỡng cao hơn các thử nghiệm khác vì cam kết trọn đời là dài hạn); **và** (2) tỉ lệ người mua trọn đời còn dùng app sau 12 tháng không thấp hơn tỉ lệ người mua đăng ký còn dùng; **và** (3) không vi phạm guardrail §1.3. Nếu không thắng thì **không bán trọn đời** — gỡ lựa chọn trọn đời khỏi màn giá. |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: tỉ lệ hoàn tiền gói trọn đời vượt quá 5% số người mua trọn đời trong 3 tháng đầu; hoặc doanh thu / 1.000 người mở màn giá của nhóm thử nghiệm thấp hơn đối chứng quá 20% trong 6 tháng đầu (người dùng dồn sang trọn đời giá rẻ làm mất doanh thu đăng ký). |
| **Ghi chú / rủi ro** | **Cân nhắc trước khi chạy:** (1) "Trọn đời" là cam kết với người mua — nếu sau này FotoBro đổi mô hình (vd: ra Nấc 4) thì người mua trọn đời Nấc 2 vẫn phải được giữ quyền Nấc 2. Ghi rõ trong màn giá là trọn đời = Nấc 2, không bao gồm các nấc mới sau này (nếu Việt quyết như vậy — chốt câu chữ trước khi chạy). (2) Apple có thể thay đổi chính sách mua 1 lần — kiểm tra lại guideline lúc cấu hình. (3) Nếu giá trọn đời đặt quá thấp thì mất doanh thu dài hạn không lấy lại được; nếu đặt quá cao thì không ai mua và thử nghiệm vô nghĩa. Việt phải chốt giá trọn đời dựa trên doanh thu đăng ký trung bình / người dùng đã đo được (baseline §1.1), không chốt theo cảm tính. |

## 6. Thử nghiệm 5 — Mức giá Nấc 3 (theo workspace vs theo thành viên)

Thử nghiệm riêng cho Nấc 3 — có thể chạy song song với thử nghiệm Nấc 2 (khác phễu), nhưng chỉ chạy sau khi Nấc 3 đã live và có baseline riêng.

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Studio nhỏ (2–3 người) nhạy cảm với giá tính theo đầu người (càng thêm người càng đắt nên ngại mời thêm), còn studio lớn thì giá theo workspace cố định lại rẻ hơn nhiều so với giá trị họ nhận được. Tính giá theo workspace (1 giá cho cả studio, không tính theo số thành viên) sẽ làm studio nhỏ mời thêm người dễ hơn và studio lớn thấy "hời" hơn, nên doanh thu Nấc 3 / studio cao hơn tính giá theo thành viên. |
| **Nhóm đối chứng** | Giá Nấc 3 tính **theo thành viên** (mỗi thành viên thêm thì trả thêm — mức giá mỗi thành viên là `TBD`, do Việt chốt). Nhóm này chiếm 50% workspace vào phễu mua Nấc 3. |
| **Nhóm thử nghiệm** | Giá Nấc 3 tính **theo workspace** (1 giá cố định cho cả studio, không tính theo số thành viên — mức giá là `TBD`, do Việt chốt; số thành viên tối đa trong 1 workspace ở v1 là `TBD` theo `CLOUDKIT-PLAN.md` — ghi rõ giới hạn này trên màn giá nếu có). Nhóm này chiếm 50%. |
| **Chỉ số chính** | Doanh thu Nấc 3 / workspace trong **6 tháng** đầu. |
| **Chỉ số phụ** | Tỉ lệ workspace bắt đầu dùng thử / mua Nấc 3; số thành viên trung bình / workspace sau 3 tháng; tỉ lệ workspace mời thêm thành viên sau khi mua; tỉ lệ huỷ Nấc 3 trong 6 tháng. |
| **Chỉ số bảo vệ** | §1.3, cộng thêm: số thành viên / workspace không vượt giới hạn kỹ thuật của Nấc 3 (nếu có). |
| **Thời gian chạy** | Tối thiểu **6 tháng** (cần đủ thời gian để studio mời thêm người và thể hiện hành vi dùng nhóm). Không kết luận trước 6 tháng. |
| **Tiêu chí thắng** | Một cách tính giá thắng khi: (1) doanh thu / workspace trong 6 tháng cao hơn đối chứng **ít nhất 10%** với p < 0,05; **và** (2) số thành viên trung bình / workspace không thấp hơn đối chứng; **và** (3) không vi phạm guardrail §1.3. Nếu không bên nào thắng thì giữ cách tính đã chốt ban đầu. |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: workspace mua theo workspace rồi thêm thành viên ồ ạt vượt giới hạn kỹ thuật; hoặc doanh thu / workspace thấp hơn đối chứng quá 20% trong 3 tháng đầu. |
| **Ghi chú / rủi ro** | Nấc 3 có ít user hơn Nấc 2 nhiều nên cần thời gian dài hơn để gom đủ mẫu — có thể phải chạy 6–12 tháng mới đủ power thống kê. Nếu sau 6 tháng vẫn chưa đủ mẫu thì **kéo dài thời gian chạy, không hạ ngưỡng ý nghĩa thống kê**. Cách tính giá Nấc 3 liên quan tới bảng quyền (`CLOUDKIT-PLAN.md` §5.2) — đổi cách tính giá không được đổi bảng quyền. Màn giá Nấc 3 phải ghi rõ: giá tính theo workspace hay theo thành viên, bao gồm bao nhiêu thành viên, thêm người thì tính sao. |

## 7. Thử nghiệm 6 — Thời điểm hiện màn giá (sau khi dùng thử Nấc 1 vs ngay lúc onboarding)

Thử nghiệm về vị trí phễu, không phải về mức giá — có thể chạy sau thử nghiệm 1, song song với thử nghiệm 2/3 (vì chạm tới thời điểm hiện màn giá, không chạm tới giá hay chu kỳ — nhưng nếu chạy song song thì phải ghi rõ trong nhật ký §8 để không nhầm nguyên nhân).

| Mục | Nội dung |
|---|---|
| **Giả thuyết** | Hiện màn giá ngay lúc onboarding làm người dùng mới thấy app "đòi tiền" quá sớm nên bỏ app; đợi tới khi người dùng đã tạo vài job và thấy giá trị đồng bộ (vd: sau khi tạo job đầu tiên, hoặc sau 7 ngày dùng Nấc 1) rồi mới gợi ý Nấc 2 thì tỉ lệ mua cao hơn và tỉ lệ bỏ app không tăng. |
| **Nhóm đối chứng** | Hiện gợi ý Nấc 2 **ngay lúc onboarding** (màn giá xuất hiện trong luồng onboarding). Nhóm này chiếm 50% user mới. |
| **Nhóm thử nghiệm** | **Không** hiện màn giá lúc onboarding; chỉ gợi ý Nấc 2 **sau khi user tạo job đầu tiên** (hoặc sau 7 ngày dùng Nấc 1 — chọn 1 trigger duy nhất trước khi chạy và ghi rõ; không dùng cả hai trigger cùng lúc). Nhóm này chiếm 50%. |
| **Chỉ số chính** | Tỉ lệ user mới → mua Nấc 2 trong **30 ngày** đầu. |
| **Chỉ số phụ** | Tỉ lệ user mới còn hoạt động sau 7 ngày và sau 30 ngày; tỉ lệ user mới tạo job đầu tiên; doanh thu Nấc 2 / 1.000 user mới trong 30 ngày. |
| **Chỉ số bảo vệ** | §1.3 (đặc biệt: tỉ lệ user mới còn hoạt động sau 30 ngày — nếu nhóm thử nghiệm giữ chân tốt hơn nhưng mua ít hơn thì vẫn là kết quả đáng ghi nhận, xem tiêu chí thắng). |
| **Thời gian chạy** | Tối thiểu **6 tuần** (đủ để user mới đi qua trigger và có 30 ngày theo dõi một phần; nhóm user vào cuối thử nghiệm sẽ được theo dõi tiếp sau khi thử nghiệm kết thúc để đủ 30 ngày). |
| **Tiêu chí thắng** | Nhóm thử nghiệm thắng khi: (1) tỉ lệ user mới → mua Nấc 2 trong 30 ngày cao hơn đối chứng với p < 0,05; **và** (2) tỉ lệ user mới còn hoạt động sau 30 ngày không thấp hơn đối chứng; **và** (3) không vi phạm guardrail §1.3. Nếu nhóm thử nghiệm mua không cao hơn nhưng giữ chân cao hơn đối chứng ít nhất 5 điểm phần trăm thì **không kết luận thắng** — ghi nhận là "giữ chân tốt hơn, cần thử nghiệm tiếp về giá" và giữ đối chứng cho tới khi có thử nghiệm khác. |
| **Tiêu chí dừng sớm** | Dừng ngay nếu: tỉ lệ user mới còn hoạt động sau 7 ngày của một nhóm thấp hơn nhóm còn lại quá 10 điểm phần trăm trong 2 tuần liên tiếp. |
| **Ghi chú / rủi ro** | Trigger "sau khi tạo job đầu tiên" và trigger "sau 7 ngày" là hai giả thuyết khác nhau — không trộn. Nếu chọn trigger theo thời gian (7 ngày) thì user chưa tạo job vẫn thấy màn giá; nếu chọn trigger theo hành động (tạo job đầu tiên) thì user không tạo job sẽ không bao giờ thấy màn giá — cả hai đều có hệ quả cần ghi nhận trong kết quả. Không hiện màn giá quá nhiều lần sau khi user đã từ chối (tối đa 1 lần nhắc lại sau khi từ chối, và phải có nút "không hiện lại" — tránh làm phiền). |

## 8. Thứ tự chạy đề xuất (roadmap)

| Giai đoạn | Thử nghiệm | Điều kiện bắt đầu |
|---|---|---|
| Baseline | — (không thử nghiệm) | App live, IAP đúng giá đã chốt; chạy 4 tuần để đo baseline §1.1 |
| Vòng 1 | Thử nghiệm 1 — Mức giá Nấc 2 | Đã có baseline; 8 tuần |
| Vòng 2 | Thử nghiệm 2 — Độ dài dùng thử Nấc 2 | Thử nghiệm 1 xong, đã chọn giá Nấc 2; 10 tuần |
| Vòng 3 | Thử nghiệm 3 — Năm vs tháng (Nấc 2) | Thử nghiệm 2 xong; 6 tháng |
| Vòng 4 | Thử nghiệm 4 — Gói trọn đời (Nấc 2) | Thử nghiệm 3 xong **và** Việt đồng ý về nguyên tắc bán trọn đời; 12 tháng |
| Song song (khi Nấc 3 live) | Thử nghiệm 5 — Giá Nấc 3 theo workspace vs theo thành viên | Nấc 3 live + có baseline Nấc 3 riêng; 6 tháng |
| Linh hoạt | Thử nghiệm 6 — Thời điểm hiện màn giá | Sau vòng 1; 6 tuần; có thể chạy song song với vòng 2/3 (ghi rõ trong nhật ký) |

Tổng thời gian nếu chạy nối tiếp hết vòng 1–4: khoảng **2 năm** (8 + 10 tuần + 6 + 12 tháng). Đây là lộ trình dài — không cần chạy hết. Việt có thể dừng ở bất kỳ vòng nào nếu giá hiện tại đã tốt và không muốn đổi nữa. Mỗi vòng xong đều có một mức giá "đã kiểm chứng" để giữ.

## 9. Nhật ký thử nghiệm (điền khi chạy thật)

| # | Thử nghiệm | Ngày bắt đầu | Ngày kết thúc | Đối chứng | Biến thể | Kết quả chỉ số chính | Kết luận | Quyết định sau thử nghiệm |
|---|---|---|---|---|---|---|---|---|
| 1 | — | — | — | — | — | `TBD` | — | — |

Ghi chú: chỉ điền số liệu thật đo được sau khi chạy. Không điền số dự đoán hay số ví dụ vào bảng này.

## 10. Điều kiện chuyển bước

1. Việt chốt giá + chu kỳ Nấc 2/3 (`PRICING-DRAFT.md` §5 #1–#4) → điền số thật vào các ký hiệu Giá A/B/C và giá năm / giá trọn đời trong file này thay cho `TBD`.
2. App live + IAP đúng giá đã chốt → đo baseline 4 tuần (§1.1), điền số thật vào bảng baseline.
3. Mỗi thử nghiệm chỉ bắt đầu khi thử nghiệm trước trên cùng phễu đã kết thúc và đã ghi kết luận vào §9.
4. Thử nghiệm 4 (trọn đời) chỉ bắt đầu khi Việt đồng ý về nguyên tắc bán trọn đời (xem §5, ghi chú rủi ro).

## 11. Trạng thái

- **Thiết kế xong.** Chỉ 1 file mới (`batch-growth/PRICING-EXPERIMENTS.md`), không sửa file nào khác, không sửa code, không cấu hình IAP, không tạo tài khoản, không push GitHub.
- Mọi mức giá trong file này đều là ký hiệu (`Giá A/B/C`, `TBD`) — không có giá thật nào, không có số liệu người dùng nào bị bịa ra.
- Còn chờ Việt: chốt giá + chu kỳ Nấc 2/3 trước, rồi app ra mắt và đo baseline, rồi mới chạy thử nghiệm đầu tiên (thử nghiệm 1, vòng 1).
