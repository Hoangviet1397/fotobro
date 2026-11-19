# FotoBro — Theo dõi giá đối thủ theo quý

> **Mục đích:** Mẫu theo dõi giá + tính năng của 5 đối thủ đã biết, để FotoBro định giá Nấc 2/3 và viết mô tả App Store mà không dùng số liệu cũ.
>
> **Quy tắc vàng — không bịa giá:** Giá nào chưa kiểm tra lại trên **trang giá chính thức** của hãng trong kỳ kiểm tra đó thì ghi rõ **"chưa xác minh"**. Không copy giá từ trí nhớ, không suy đoán, không dùng giá của bài so sánh cũ làm giá hiện tại.
>
> **Phạm vi:** Chỉ dùng tài liệu công khai trên web. Không tạo tài khoản dùng thử, không cài app đối thủ, không mua gói đối thủ.
>
> **File gốc:** `~/workspace/fotobro-ios-v1/COMPETITORS.md` (kiểm tra 20/11/2026). File này là **mẫu + nhật ký theo dõi**, không thay thế `COMPETITORS.md`. Khi có thay đổi đã xác minh, cập nhật cả hai file cùng lúc và ghi ngày.
>
> **FotoBro hiện tại (20/11/2026):** App iOS v1, Bundle ID `com.fotobro.app`, chưa lên App Store, chưa có TestFlight. Giá Nấc 2/3 **CHƯA CHỐT (TBD)** — xem `PRICING-DRAFT.md`. Nấc 1 miễn phí, local-first.

---

## 1. Ảnh chụp baseline — 20/11/2026 (sao từ `COMPETITORS.md`)

> Đây là **điểm xuất phát để so sánh**, không phải giá đã xác minh hôm nay.
> `COMPETITORS.md` tự ghi: giá lấy từ các bài so sánh độc lập trích dẫn trang giá chính thức tháng 10–11/2026, **không tự mở trang giá chính thức để đối chiếu lại**. Vì vậy mọi giá dưới đây ở trạng thái **"chưa xác minh lại trên trang chính thức"** cho tới kỳ kiểm tra đầu tiên theo mẫu này.
>
> Đơn vị: USD/tháng, trừ khi ghi khác. "Trả theo năm" = giá tháng khi trả cả năm.

| Đối thủ | Gói | Giá/tháng (trả theo tháng) | Giá/tháng (trả theo năm) | Giá/năm | Gói miễn phí / thử | Trạng thái xác minh |
|---|---|---|---|---|---|---|
| Studio Ninja | Starter | $24 | $16 | $160/năm | Thử 7 ngày, không cần thẻ | Chưa xác minh |
| Studio Ninja | Pro | $36 | $27 | $270/năm | — | Chưa xác minh |
| Studio Ninja | Master | $53 | $40 | $400/năm | — | Chưa xác minh |
| HoneyBook | Starter | $36 | $29 | — | Thử 30 ngày, không cần thẻ; hoàn tiền 60 ngày | Chưa xác minh |
| HoneyBook | Essentials | $59 | $49 | — | — | Chưa xác minh |
| HoneyBook | Premium | $129 | $109 | — | — | Chưa xác minh |
| Pixieset — Client Gallery | Miễn phí | $0 | $0 | $0 | 3 GB, cửa hàng lấy 15% hoa hồng | Chưa xác minh |
| Pixieset — Client Gallery | Basic | $10 | $8 | — | 10 GB | Chưa xác minh |
| Pixieset — Client Gallery | Plus | $20 | $16 | — | 100 GB | Chưa xác minh |
| Pixieset — Client Gallery | Pro | $30 | $24 | — | 1 TB | Chưa xác minh |
| Pixieset — Client Gallery | Ultimate | $50 | $40 | — | Không giới hạn | Chưa xác minh |
| Pixieset — Studio Manager | Miễn phí | $0 | $0 | $0 | Giới hạn | Chưa xác minh |
| Pixieset — Studio Manager | Trả phí (từ) | $15 | $12 | — | — | Chưa xác minh |
| Pixieset — Suite | (gộp Gallery + Website + Studio Manager, từ) | — | $28 | — | — | Chưa xác minh |
| ShootProof | Miễn phí | $0 | $0 | $0 | 3 GB, chỉ ảnh | Chưa xác minh |
| ShootProof | Starter | $9,99 | $8,33 | — | 20 GB ảnh + video; thử 14 ngày | Chưa xác minh |
| ShootProof | Standard | $19,99 | $16,67 | — | 100 GB | Chưa xác minh |
| ShootProof | Professional | $31,99 | $26,67 | — | 1.000 GB ảnh + 50 GB video | Chưa xác minh |
| ShootProof | Premium | $60 | $50 | — | Ảnh không giới hạn + 150 GB video | Chưa xác minh |
| ShootProof — add-on | Đặt lịch online | $6,99/tháng | — | — | Cộng thêm trên gói chính | Chưa xác minh |
| Sprout Studio | Lite | $24 * | $19 * | — | Thử 30 ngày, không cần thẻ | **Chưa xác minh — xem lưu ý \*** |
| Sprout Studio | Basic | $46 * | $36 * | — | — | **Chưa xác minh — xem lưu ý \*** |
| Sprout Studio | Pro | $66 * | $51 * | — | — | **Chưa xác minh — xem lưu ý \*** |
| Sprout Studio | Unlimited | $89 * | $69 * | — | — | **Chưa xác minh — xem lưu ý \*** |

\* **Lưu ý Sprout Studio (quan trọng):** Trang giá của hãng liệt kê cả USD và CAD cạnh nhau, không nói rõ con số theo tháng là trả theo tháng hay trả theo năm. Một nguồn so sánh (12/10/2026) ghi $19 là giá CAD / giá trả theo năm, còn trả theo tháng bằng USD là $24 / $46 / $66 / $89. Trong `COMPETITORS.md` ghi "$19–$24/tháng (Lite)" để phản ánh đúng mức không chắc chắn này. **Kỳ kiểm tra đầu tiên phải làm rõ: (a) đơn vị tiền là USD hay CAD, (b) giá đó là trả theo tháng hay trả theo năm, (c) có giá theo năm công bố không — và ghi cả 3 câu trả lời vào cột Ghi chú, không chọn một con số cho gọn.**

### Các mâu thuẫn / điểm chưa rõ đã biết từ baseline — phải kiểm tra lại, không được "chốt" hộ

| # | Đối thủ | Điểm chưa rõ | Nguồn baseline |
|---|---|---|---|
| 1 | Studio Ninja | Trang giá tự mâu thuẫn về Starter: thẻ gói ghi có tự động hoá + form đặt lịch, bảng so sánh ghi là không có | `COMPETITORS.md` §1 |
| 2 | HoneyBook | Phí xử lý thẻ: một chỗ ghi ~2,7% + 10¢, chỗ khác ghi 2,9% + 25¢ | `COMPETITORS.md` §2 |
| 3 | Sprout Studio | USD/CAD + trả theo tháng/năm không rõ (xem \* ở trên) | `COMPETITORS.md` §5 |
| 4 | Pixieset | 4 thang giá riêng + add-on video $5/tháng/giờ; giá Suite chỉ ghi "từ $28" | `COMPETITORS.md` §3 |
| 5 | ShootProof | Đã đổi từ tính theo số ảnh sang tính theo GB từ 23/09/2026 — kiểm tra xem còn gói cũ nào không | `COMPETITORS.md` §4 |

### Hai mốc giá FotoBro cần so sánh mỗi kỳ

Khi FotoBro chốt giá Nấc 2/3, so sánh trực tiếp với:

- **Studio Ninja Pro $27/tháng (trả theo năm)** — mốc CRM chuyên ảnh cho photographer solo.
- **ShootProof Standard $16,67/tháng (trả theo năm)** — mốc gallery + hợp đồng + hoá đơn rẻ nhất có đủ bộ.

Cho tới khi chốt giá, hai mốc này vẫn ghi là **chưa xác minh** ở mỗi kỳ kiểm tra mới.

---

## 2. Bảng mẫu cho mỗi kỳ kiểm tra

> Copy toàn bộ bảng này cho mỗi kỳ mới (xem §3). Một hàng = một gói của một đối thủ. Không gộp nhiều gói vào một hàng. Không bỏ gói chỉ vì "giá không đổi" — ghi lại để chứng minh đã kiểm tra.
>
> **Cột "Giá/tháng" và "Giá/năm":** ghi đúng con số trên trang giá chính thức, kèm đơn vị tiền (USD/CAD/…). Nếu trang chỉ ghi giá theo năm, ghi giá/năm và để trống giá/tháng (trả theo tháng), ghi chú "không có giá trả theo tháng".
>
> **Cột "Tính năng mới":** chỉ ghi tính năng **mới so với kỳ trước** (hoặc mới so với baseline ở kỳ đầu), kèm ngày hãng công bố nếu có. Tính năng đã có từ trước thì không ghi lại. Nếu không có gì mới, ghi "Không có".
>
> **Cột "Nguồn":** link trang giá chính thức (ưu tiên) hoặc link bài công bố chính thức của hãng. Không ghi link bài so sánh của bên thứ ba làm nguồn duy nhất cho giá — bài bên thứ ba chỉ là gợi ý để đi kiểm tra lại.

### Mẫu bảng (copy cho mỗi kỳ)

| Đối thủ | Gói | Giá/tháng (trả theo tháng) | Giá/tháng (trả theo năm) | Giá/năm | Tính năng mới | Ngày kiểm tra | Nguồn | Trạng thái xác minh |
|---|---|---|---|---|---|---|---|---|
| _VD: Studio Ninja_ | _Starter_ | _$24_ | _$16_ | _$160_ | _Không có_ | _20/02/2027_ | _link trang giá chính thức_ | _Đã xác minh / Chưa xác minh_ |
| | | | | | | | | |
| | | | | | | | | |

### Mẫu hàng cho đối thủ thêm mới (nếu phát hiện đối thủ mới)

| Đối thủ mới | Gói | Giá/tháng (trả theo tháng) | Giá/tháng (trả theo năm) | Giá/năm | Tính năng mới | Ngày kiểm tra | Nguồn | Trạng thái xác minh |
|---|---|---|---|---|---|---|---|---|
| _Tên + link trang chủ_ | | | | | _Ghi rõ: mới phát hiện kỳ này, chưa có trong baseline 20/11/2026_ | | | |

**Quy tắc "chưa xác minh":**

- Nếu không mở được trang giá chính thức (trang lỗi, bị chặn, đổi URL, yêu cầu đăng nhập mới xem được giá) → ghi giá cũ (nếu có) vào bảng, cột Trạng thái ghi **"Chưa xác minh — [lý do: vd. trang giá đổi URL / yêu cầu đăng nhập]"**, và ghi vào Nhật ký thay đổi (§5) một mục "Không kiểm tra được".
- Nếu trang giá ghi giá theo một đơn vị tiền khác (vd. CAD thay vì USD) → ghi đúng đơn vị tiền đó, không tự quy đổi, ghi chú "chưa quy đổi".
- Nếu chỉ thấy giá trên bài so sánh bên thứ ba mà chưa mở được trang chính thức → ghi giá đó nhưng trạng thái là **"Chưa xác minh — chỉ có nguồn thứ ba"**, kèm link bài đó.
- **Không bao giờ** để trống cột Trạng thái, và không bao giờ ghi "Đã xác minh" nếu chưa mở trang chính thức trong kỳ đó.

---

## 3. Lịch kiểm tra mỗi quý

| Kỳ | Ngày kiểm tra (hạn chót) | Ghi chú |
|---|---|---|
| **Q1 2027** | **20/02/2027** | Kỳ đầu tiên theo mẫu này. Ưu tiên làm rõ 5 điểm chưa rõ ở §1 (đặc biệt Sprout USD/CAD) và xác minh lại toàn bộ baseline trên trang chính thức. |
| Q2 2027 | 20/05/2027 | |
| Q3 2027 | 20/08/2027 | |
| Q4 2027 | 20/11/2027 | Tròn 1 năm baseline. Rà soát lại toàn bộ: có đối thủ mới không, có đối thủ nào ngừng kinh doanh / đổi tên / sáp nhập không. |
| Q1 2028 | 20/02/2028 | |
| Q2 2028 | 20/05/2028 | |
| Q3 2028 | 20/08/2028 | |
| Q4 2028 | 20/11/2028 | |

**Quy tắc lịch:**

1. **Mỗi quý 1 lần, đúng hạn trên.** Nếu trễ quá 7 ngày so với hạn chót, ghi lý do trễ vào đầu nhật ký kỳ đó.
2. **Kiểm tra thêm ngoài lịch (ad-hoc)** khi có 1 trong các sự kiện sau — không chờ tới quý sau:
   - FotoBro sắp đổi giá Nấc 2/3, hoặc sắp chốt giá lần đầu.
   - FotoBro sắp nộp App Store / cập nhật mô tả App Store có nhắc tới giá đối thủ.
   - Nghe tin đối thủ đổi giá mạnh, ra gói miễn phí mới, hoặc ra tính năng lớn (gallery, hợp đồng e-sign, đặt lịch online, AI) — tin nghe được phải kiểm tra lại trên trang chính thức rồi mới ghi.
   - Một đối thủ trong 5 app trên đổi tên, sáp nhập, hoặc ngừng kinh doanh.
3. **Mỗi kỳ kiểm tra đủ 5 đối thủ** (Studio Ninja, HoneyBook, Pixieset, ShootProof, Sprout Studio) + rà soát có đối thủ mới không. Không kiểm tra "chỉ 2–3 app vì các app kia chắc không đổi".
4. **Thời gian làm mỗi kỳ:** dự kiến 1–2 giờ (mở 5 trang giá chính thức + ghi bảng + nhật ký). Nếu một trang giá không mở được, ghi "chưa xác minh" theo §2, không bỏ qua đối thủ đó.
5. **Sau mỗi kỳ:** cập nhật bảng baseline (§1) nếu có thay đổi đã xác minh, cập nhật `COMPETITORS.md` (ghi ngày kiểm tra mới + nguồn), và thêm một mục vào Nhật ký thay đổi (§5).

---

## 4. Quy tắc ghi chú thay đổi giá

Áp dụng cho mọi mục trong Nhật ký thay đổi (§5) và cho việc cập nhật §1 / `COMPETITORS.md`.

1. **Một thay đổi = một mục riêng.** Không gộp "Studio Ninja tăng giá + HoneyBook thêm tính năng" vào một mục. Mỗi mục: 1 đối thủ, 1 gói (hoặc 1 tính năng), 1 thay đổi.
2. **Ghi đủ 6 trường cho mỗi thay đổi giá:**
   - Đối thủ + gói (vd. "Studio Ninja — Pro")
   - Giá cũ → giá mới, kèm kỳ áp dụng (vd. "$27/tháng trả theo năm → $30/tháng trả theo năm")
   - Mức thay đổi: số tiền tuyệt đối **và** % (vd. "+$3/tháng, +11,1%")
   - Ngày kiểm tra phát hiện thay đổi + ngày hãng công bố/áp dụng (nếu trang ghi rõ; nếu không ghi rõ thì ghi "không rõ ngày áp dụng")
   - Nguồn: link trang giá chính thức (hoặc link công bố chính thức của hãng)
   - Trạng thái: Đã xác minh / Chưa xác minh (+ lý do nếu chưa)
3. **Ghi cả thay đổi "không phải giá" nếu ảnh hưởng tới định giá FotoBro:**
   - Bỏ / thêm gói miễn phí, đổi giới hạn gói miễn phí (vd. Pixieset đổi % hoa hồng, ShootProof đổi GB miễn phí).
   - Đổi giới hạn gói trả phí (vd. Studio Ninja đổi giới hạn 5 job ở Starter, Sprout đổi giới hạn 10 job ở Lite).
   - Thêm / bỏ tính năng ở một gói (vd. tự động hoá chuyển từ Pro xuống Starter, đặt lịch online từ add-on thành tính năng có sẵn).
   - Đổi phí giao dịch / hoa hồng / phí xử lý thẻ.
   - Đổi đơn vị tiền, đổi cách tính (theo tháng / theo năm / theo GB / theo số ảnh).
4. **Không ghi suy đoán làm sự thật.** Vd. viết "có thể HoneyBook sắp tăng giá" là không được — chỉ ghi điều đã thấy trên trang chính thức hoặc công bố chính thức. Tin đồn / dự đoán (nếu cần ghi) phải ghi rõ "Tin chưa xác minh: …" và không dùng để định giá.
5. **Giữ lại giá cũ.** Khi cập nhật §1, không xoá giá cũ — chuyển giá cũ xuống Nhật ký thay đổi (§5) với ngày thay đổi. Bảng §1 luôn là giá mới nhất đã xác minh; nhật ký là lịch sử.
6. **Ghi chú bằng tiếng Việt**, ngắn gọn, một thay đổi không quá 5 dòng (trừ khi cần giải thích mâu thuẫn như Sprout USD/CAD).
7. **Nếu không có thay đổi trong kỳ:** vẫn ghi một mục nhật ký "Kỳ [Q…/năm]: không thay đổi giá đã xác minh ở 5 đối thủ" + ngày kiểm tra + nguồn đã mở (5 link trang giá). "Không đổi" cũng là một kết quả cần ghi lại, không phải là không có gì để ghi.

### Mẫu mục nhật ký thay đổi giá

```markdown
- **[20/02/2027] Studio Ninja — Pro:** $27/tháng (trả theo năm) → $30/tháng (trả theo năm). +$3/tháng, +11,1%. Ngày áp dụng: không rõ (trang giá không ghi). Nguồn: [link trang giá chính thức]. Trạng thái: Đã xác minh. → Cảnh báo: Mức VÀNG (xem §6).
```

```markdown
- **[20/02/2027] Sprout Studio — Lite:** Làm rõ đơn vị tiền: giá $19 là CAD, trả theo năm; trả theo tháng bằng USD là $24. Không phải tăng giá — chỉ là làm rõ cách ghi gây nhầm lẫn ở baseline. Nguồn: [link trang giá chính thức]. Trạng thái: Đã xác minh.
```

---

## 5. Nhật ký thay đổi (bắt đầu từ 20/11/2026)

> Thêm mục mới lên **đầu** danh sách (mới nhất lên đầu). Mục baseline đầu tiên dưới đây là điểm xuất phát, không phải một thay đổi.

- **[20/11/2026] Baseline:** Ảnh chụp giá 5 đối thủ từ `COMPETITORS.md` (ngày kiểm tra 20/11/2026, nguồn là các bài so sánh độc lập tháng 10–11/2026, chưa đối chiếu lại trang giá chính thức). Toàn bộ giá baseline ở §1 đang ở trạng thái **"chưa xác minh"**. 5 điểm chưa rõ cần làm rõ ở kỳ Q1 2027 (xem §1). FotoBro Nấc 2/3 chưa chốt giá (TBD).
- _[Thêm kỳ kiểm tra mới vào đây — mới nhất lên đầu.]_

### Mẫu đầu mục cho mỗi kỳ kiểm tra (copy vào nhật ký)

```markdown
- **[Ngày kiểm tra] Kỳ Q_/____:** Đã kiểm tra [5/5 hoặc n/5] đối thủ trên trang giá chính thức. Thay đổi đã xác minh: [số] mục (liệt kê dưới đây) / Không có thay đổi giá đã xác minh. Không kiểm tra được: [tên đối thủ + lý do, hoặc "Không có"]. Đối thủ mới phát hiện: [tên + link, hoặc "Không có"]. Người kiểm tra: [tên]. Link nguồn đã mở: [5 link trang giá chính thức].
  - [Thay đổi 1 theo mẫu §4]
  - [Thay đổi 2 theo mẫu §4]
```

---

## 6. Cảnh báo khi đối thủ đổi giá mạnh

### Mức cảnh báo

| Mức | Điều kiện (chỉ cần 1 điều kiện là đủ) | Hành động |
|---|---|---|
| **🔴 ĐỎ — cần quyết định ngay** | Tăng/giảm **≥ 20%** ở bất kỳ gói nào của bất kỳ đối thủ nào; **hoặc** tăng/giảm **≥ $10/tháng** ở gói rẻ nhất / gói tương đương Nấc 2 FotoBro; **hoặc** đối thủ bỏ hẳn gói miễn phí; **hoặc** đối thủ ra gói miễn phí mới đủ dùng cho photographer solo (không giới hạn job kiểu 5–10 job); **hoặc** đối thủ thêm gallery / hợp đồng e-sign / đặt lịch online vào gói rẻ nhất mà trước đây chưa có | **Dừng việc định giá / viết mô tả App Store đang làm dở.** Báo cho Việt ngay trong ngày, kèm bảng so sánh giá mới. Không tự đổi giá FotoBro — chờ Việt quyết. Cập nhật `COMPETITORS.md` + §1 trong 24 giờ. |
| **🟡 VÀNG — xem lại trong 7 ngày** | Tăng/giảm **10–20%**; **hoặc** tăng/giảm **$5–$10/tháng**; **hoặc** đổi giới hạn gói (số job, GB, số người dùng) ở gói rẻ nhất; **hoặc** đổi % hoa hồng / phí xử lý thẻ; **hoặc** đối thủ thêm tính năng lớn (AI, tự động hoá, gallery) vào gói tầm trung | Ghi vào nhật ký (§5), cập nhật §1 + `COMPETITORS.md`, và đưa vào danh sách "xem lại trước kỳ sau": so sánh lại giá FotoBro (nếu đã chốt) với mốc mới. Không cần báo ngay, nhưng phải nhắc lại ở lần làm việc tiếp theo về giá. |
| **🟢 XANH — ghi nhận, không cần hành động** | Tăng/giảm **< 10% và < $5/tháng**; **hoặc** chỉ đổi tên gói / đổi cách trình bày trang giá mà giá và giới hạn không đổi; **hoặc** thêm tính năng nhỏ không ảnh hưởng tới định giá | Ghi vào nhật ký (§5) và cập nhật §1. Không cần báo riêng. |

### Quy tắc tính % thay đổi

- % = (Giá mới − Giá cũ) / Giá cũ × 100%, tính trên **cùng một cách trả** (so trả theo năm với trả theo năm, trả theo tháng với trả theo tháng — không so giá trả theo năm với giá trả theo tháng).
- Làm tròn 1 chữ số thập phân (vd. +11,1%).
- Nếu hãng đổi cả cách tính (vd. từ tính theo số ảnh sang tính theo GB như ShootProof 23/09/2026) thì **không tính %** — ghi "đổi cách tính, không so sánh % được" và mô tả cách tính mới.
- Nếu giá cũ ở trạng thái "chưa xác minh" thì % tính được chỉ là tham khảo — ghi chú "so với baseline chưa xác minh".

### Các thay đổi KHÔNG tính bằng % nhưng vẫn cảnh báo ĐỎ

- Đối thủ **ngừng kinh doanh / sáp nhập / đổi tên** (vd. bị mua lại).
- Đối thủ **mở thị trường Việt Nam / thêm tiếng Việt / thêm VND** — trực tiếp đe doạ lợi thế "tiếng Việt + VND" của FotoBro.
- Đối thủ **ra tính năng giá film / pipeline 8 bước kiểu FotoBro** — đe doạ điểm khác biệt cốt lõi.
- Đối thủ **đổi chính sách dữ liệu** theo hướng local-first / không cần tài khoản (đe doạ lợi thế local-first của FotoBro).

Khi gặp các trường hợp này: báo cho Việt ngay trong ngày như mức ĐỎ, dù giá không đổi.

### Checklist khi cảnh báo ĐỎ xảy ra

- [ ] Đã xác minh thay đổi trên **trang giá / công bố chính thức** (không chỉ bài báo bên thứ ba).
- [ ] Đã ghi mục nhật ký (§5) với đủ 6 trường (§4) + mức cảnh báo.
- [ ] Đã cập nhật bảng baseline §1 và `COMPETITORS.md` (ghi ngày kiểm tra mới).
- [ ] Đã báo cho Việt (kèm: đối thủ nào, đổi gì, % bao nhiêu, ảnh hưởng gì tới giá FotoBro / mô tả App Store).
- [ ] Đã dừng / hoãn việc định giá / viết mô tả đang làm dở cho tới khi Việt quyết (ghi rõ việc nào đang dở).
- [ ] Đã ghi quyết định của Việt (giữ giá / đổi giá / chờ thêm) + ngày quyết vào nhật ký.

---

## 7. Nguồn trang giá chính thức (mở lại mỗi kỳ)

> Điền link trang giá chính thức của từng hãng vào bảng dưới đây ở kỳ kiểm tra đầu tiên (Q1 2027). Link lấy từ `COMPETITORS.md` là link **bài so sánh**, không phải trang giá chính thức — không dùng chúng làm nguồn xác minh giá.
>
> Nếu trang giá đổi URL, cập nhật link mới vào đây và ghi ngày đổi vào nhật ký.

| Đối thủ | Link trang giá chính thức | Ghi chú |
|---|---|---|
| Studio Ninja | _(điền ở kỳ Q1 2027)_ | |
| HoneyBook | _(điền ở kỳ Q1 2027)_ | Chỉ hỗ trợ Mỹ, Canada, Anh, Úc (theo baseline) |
| Pixieset | _(điền ở kỳ Q1 2027)_ | 4 thang giá riêng: Client Gallery, Website, Studio Manager, Suite — mở đủ 4 trang (hoặc 1 trang gộp nếu hãng đã gộp) |
| ShootProof | _(điền ở kỳ Q1 2027)_ | |
| Sprout Studio | _(điền ở kỳ Q1 2027)_ | Làm rõ USD/CAD + trả theo tháng/năm (xem §1) |

**Nguồn baseline (bài so sánh, chỉ để tham khảo — không dùng làm nguồn xác minh):** xem mục Nguồn trong `COMPETITORS.md` (KNNKTD 26/10/2026, WeddingRunbook 11/2026, Workspace369, Framekit/DigiSell 12/10/2026, WhatAllSay 12/11/2026, Codot 09/11/2026, ToolGPA 13/11/2026).

---

## 8. Việc cần làm ở kỳ kiểm tra đầu tiên (Q1 2027, hạn 20/02/2027)

- [ ] Mở 5 trang giá chính thức, điền link vào §7.
- [ ] Xác minh lại toàn bộ bảng baseline §1; đổi trạng thái "chưa xác minh" → "Đã xác minh" cho từng hàng đã mở trang chính thức (hoặc giữ "chưa xác minh" + lý do nếu không mở được).
- [ ] Làm rõ 5 điểm chưa rõ ở §1 (ưu tiên Sprout USD/CAD).
- [ ] Điền bảng mẫu §2 cho kỳ Q1 2027 (đủ 5 đối thủ).
- [ ] Thêm mục nhật ký kỳ Q1 2027 vào §5 (mới nhất lên đầu).
- [ ] Nếu có thay đổi ≥ mức VÀNG, áp dụng §6.
- [ ] Cập nhật `COMPETITORS.md` (ngày kiểm tra + nguồn mới) nếu có thay đổi đã xác minh.

---

*File tạo 20/11/2026. Baseline sao từ `COMPETITORS.md` (kiểm tra 20/11/2026). Kỳ kiểm tra đầu tiên: Q1 2027, hạn 20/02/2027.*
