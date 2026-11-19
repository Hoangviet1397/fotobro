# Dark Mode Audit — FotoBro iOS v1

> **Phạm vi:** chỉ rà soát từ code trong `www/index.html` (3.901 dòng, đọc ngày 20/11/2026).
> **Chưa kiểm bằng mắt trên iPhone thật** — các tỉ lệ dưới đây là tính toán WCAG từ mã hex trong CSS,
> chưa qua đo thực tế trên máy. Ảnh nền (hero, moments) và hiệu ứng kính mờ (backdrop-filter trên nền
> ảnh/nội dung thật) không thể kết luận chắc chắn từ code.
>
> **Ngưỡng WCAG 2.1:** chữ thường ≥ **4.5:1** · chữ lớn (≥24px, hoặc ≥18,66px đậm) ≥ **3:1** ·
> icon / biên UI (WCAG 1.4.11) ≥ **3:1**. Cách tính: tỉ lệ tương phản tương đối theo công thức WCAG,
> nền mờ (rgba / color-mix) được hoà (composite) lên nền đặc phía dưới trước khi tính.

## 1. Bảng màu dark mode trong code

Dark mode bật theo `@media (prefers-color-scheme: dark)` (dòng 52–61), cộng thêm 3 preset
chọn trong Cài đặt qua `data-theme` (dòng 376–378, mặc định `theme:'warm'`, dòng 819/837):

| Token | Dark (hệ thống) | Ghi chú |
|---|---|---|
| `--bg` | `#000000` | Nền trang |
| `--surface` | `#1C1C1E` | Nền list / tile / sheet nội dung |
| `--fill` | `#2C2C2E` | Nền pill / seg / switch tắt |
| `--fill2` / `--seg-on` | `#3A3A3C` | Nút seg đang chọn |
| `--label` | `#FFFFFF` | Chữ chính |
| `--label2` | `#AEAEB2` | Chữ phụ |
| `--label3` | `#636366` | Chữ mờ / placeholder / chevron |
| `--accent` | `#FF375F` | **Nhưng xem §2:** theme mặc định `warm` đè thành `#FA2D48` |
| `--accent-tint` | `rgba(255,55,95,.16)` | Nền nút tint |
| `--green` / `--red` / `--orange` / `--blue` / `--purple` / `--teal` / `--gray` | `#30D158` / `#FF375F` / `#FF9F0A` / `#0A84FF` / `#BF5AF2` / `#64D2FF` / `#8E8E93` | Giữ nguyên cả light lẫn dark |
| `--bar` / `--bar-strong` | `rgba(0,0,0,.80)` / `rgba(0,0,0,.95)` | Tab bar / nav / composer |

Chế độ kính mờ (`data-glass="1"`, mặc định bật) trong dark: list/tile `rgba(28,28,30,.50)`,
sheet `rgba(0,0,0,.76)`, pill/seg `rgba(255,255,255,.08)`, seg đang chọn `rgba(255,255,255,.20)`.

## 2. Tương tác preset theme × dark mode (quan trọng)

- `:root[data-theme="warm"]` có specificity cao hơn `@media (prefers-color-scheme: dark)`,
  nên **người dùng theme mặc định "Ấm" ở dark mode thực tế dùng accent `#FA2D48`, không phải
  `#FF375F`**. Accent `#FF375F` chỉ xuất hiện khi chọn theme "Tối".
- Cả hai giá trị accent đều được tính bên dưới; chỗ nào khác nhau sẽ ghi cả hai.

## 3. Cặp màu ĐẠT (để đối chiếu)

| Chữ / icon | Nền | Tỉ lệ | Ngưỡng | Kết quả |
|---|---|---|---|---|
| `--label` `#FFFFFF` | `--bg` `#000000` | 21,00 | 4,5 | ✅ Đạt |
| `--label` | `--surface` `#1C1C1E` | 17,01 | 4,5 | ✅ Đạt |
| `--label` | `--fill` `#2C2C2E` (pill) | 13,94 | 4,5 | ✅ Đạt |
| `--label` | `--seg-on` `#3A3A3C` | 11,35 | 4,5 | ✅ Đạt |
| `--label2` `#AEAEB2` | `--bg` | 9,50 | 4,5 | ✅ Đạt |
| `--label2` | `--surface` | 7,69 | 4,5 | ✅ Đạt |
| `--label2` | `--fill` | 6,30 | 4,5 | ✅ Đạt |
| `--label2` | `--seg-on` | 5,13 | 4,5 | ✅ Đạt |
| accent `#FF375F` (theme Tối) | `--bg` | 5,96 | 4,5 | ✅ Đạt |
| accent `#FF375F` | `--surface` | 4,83 | 4,5 | ✅ Đạt |
| accent `#FA2D48` (theme Ấm) | `--bg` | 5,53 | 4,5 | ✅ Đạt |
| accent trên nền tint, khi tint nằm trên `--bg` (`.btn.tint` ở màn Chào mừng) | tint 12–16% trên `#000000` | 5,12–5,23 | 4,5 | ✅ Đạt |
| `--green` `#30D158` | `--bg` / `--surface` | 10,39 / 8,42 | 4,5 | ✅ Đạt |
| `--orange` `#FF9F0A` | `--bg` / `--surface` | 10,22 / 8,28 | 4,5 | ✅ Đạt |
| `--blue` `#0A84FF` | `--bg` / `--surface` | 5,76 / 4,66 | 4,5 | ✅ Đạt (sát ngưỡng trên surface) |
| `--purple` `#BF5AF2` | `--bg` / `--surface` | 5,96 / 4,83 | 4,5 | ✅ Đạt |
| `--teal` `#64D2FF` | `--bg` / `--surface` | 12,20 / 9,89 | 4,5 | ✅ Đạt |
| `--gray` `#8E8E93` (tab chưa chọn, 10,5px) | `--bg` | 6,44 | 4,5 | ✅ Đạt |
| Chữ `#000000` trên pill đang chọn (nền `--label`) | `#FFFFFF` | 21,00 | 4,5 | ✅ Đạt |
| Chữ phụ trong pill đang chọn (đen 70% trên trắng) | `#FFFFFF` | 8,45 | 4,5 | ✅ Đạt |
| Tag xám: `--label2` trên `--fill` | `#2C2C2E` | 6,30 | 4,5 | ✅ Đạt |
| Tag cam / xanh lá trên surface | nền mix 16% | 6,11 / 6,21 | 4,5 | ✅ Đạt |
| `--label` / `--label2` trên list kính mờ | `rgba(28,28,30,.50)` trên `#000000` | 19,29 / 8,73 | 4,5 | ✅ Đạt |
| `--label` trên seg đang chọn (kính mờ) | `rgba(255,255,255,.20)` trên `--fill` | 7,32 | 4,5 | ✅ Đạt |
| Chữ trắng trên ô màu (icon): blue / tím / accent / xám | `#0A84FF` / `#BF5AF2` / `#FF375F` / `#8E8E93` | 3,65 / 3,52 / 3,52 / 3,26 | 3,0 | ✅ Đạt (chỉ tính icon) |
| Nút tròn switch: núm trắng trên track `--fill` (tắt) | `#2C2C2E` | 13,94 | 3,0 | ✅ Đạt |

## 4. Cặp màu CHƯA ĐẠT ❌

### 4.1. Nghiêm trọng — theme "Tối giản" + hệ Dark: chữ gần như tàng hình

Preset `minimal` chỉ đè `--accent/--bg/--surface/--fill`, **không đè `--label/--label2/--label3`**,
nên ở dark mode toàn bộ chữ trắng nằm trên nền sáng:

| Chữ | Nền (minimal + dark) | Tỉ lệ | Cần | Ảnh hưởng |
|---|---|---|---|---|
| `--label` `#FFFFFF` | `--bg` `#F7F7F5` | **1,07** | 4,5 | Toàn bộ tiêu đề, nội dung, ô nhập |
| `--label2` `#AEAEB2` | `--bg` `#F7F7F5` | **2,06** | 4,5 | Toàn bộ chữ phụ, giá tiền, ghi chú |
| `--label` `#FFFFFF` | `--surface` `#FFFFFF` | **1,00** | 4,5 | Mọi list/tile |
| `--label` `#FFFFFF` | `--fill` `rgba(0,0,0,.05)` trên `#F7F7F5` | ~1,1 | 4,5 | Pill, nút `.btn.gray`, seg |

Người dùng iPhone đang bật Dark Mode chỉ cần chạm "Tối giản" trong Cài đặt là app mất chữ.
Ở light mode thì preset này bình thường (chữ đen trên nền `#F7F7F5`).

### 4.2. Chữ trắng trên nền accent — nút chính, bong bóng chat, nút bước

| Vị trí | Cặp | Tỉ lệ | Cần | Ghi chú |
|---|---|---|---|---|
| `.btn.fill` (17px semibold), `.bub.me` (17px), `.steps.jump .n` (12px đậm), nút "Cập nhật", "Vào app", "Dùng thật" | trắng trên `#FA2D48` (theme Ấm mặc định) | **3,79** | 4,5 | Chữ thường, không phải chữ lớn |
| Như trên, khi chọn theme "Tối" | trắng trên `#FF375F` | **3,52** | 4,5 | Còn thấp hơn |
| Chữ "Đã hoàn tất, giỏi lắm!" (`.btn.tint` giả dạng) | — | — | — | Nằm trong §4.4 |

Riêng icon trắng trên nền accent (3,52–3,79) vẫn đạt ngưỡng icon 3:1 — chỉ **chữ** là chưa đạt.
Không tồn tại một màu đỏ duy nhất vừa đạt trắng-trên-nền ≥4,5 vừa đạt chữ-trên-surface ≥4,5
(cần độ sáng L ≤ 0,183 cho vế đầu, L ≥ 0,228 cho vế sau), nên bắt buộc tách 2 token — xem §5.2.

### 4.3. Accent theme Ấm trên surface — sát dưới ngưỡng

| Vị trí | Cặp | Tỉ lệ | Cần |
|---|---|---|---|
| `.row.act`, `.q-lbl` (12px), nhãn tile `.tl`, `.steps.jump .d` (phần chữ) | `#FA2D48` trên `--surface` `#1C1C1E` | **4,48** | 4,5 |

Chỉ thiếu 0,02 nhưng đây là theme mặc định nên gặp khắp app. Theme "Tối" (`#FF375F` trên
surface = 4,83) thì đạt.

### 4.4. Nút tint (`.btn.tint`, `.steps.jump .d`) khi nằm trên surface

Các nút này nằm trong `.list` (surface) ở: thẻ Câu của hôm nay, Báo cáo cuối ngày, mẫu tin nhắn,
máy tính giá, chi tiết job (`.stage-box` trong `.list`).

| Cặp | Tỉ lệ | Cần |
|---|---|---|
| `#FF375F` trên tint 16% hoà lên `--surface` (`#402028`) | **4,10** | 4,5 |
| `#FA2D48` trên tint 12% hoà lên `--surface` | **4,03** | 4,5 |

Cùng nút đó khi nằm trên `--bg` (màn Chào mừng) thì đạt 5,12–5,23 — lỗi chỉ xuất hiện trên surface.

### 4.5. `--label3` `#636366` — chữ mờ, placeholder, chevron, viền checkbox

| Vị trí | Cặp | Tỉ lệ | Cần |
|---|---|---|---|
| `.foot` (12px, cuối trang) | `#636366` trên `--bg` | **3,51** | 4,5 |
| `::placeholder` trong ô nhập, `.frow` | `#636366` trên `--surface` | **2,84** | 4,5 |
| Chevron `.row .chev` (icon) | `#636366` trên `--surface` | **2,84** | 3,0 (icon) |
| Viền `.chk` (checkbox tròn chưa tick) | `#636366` trên `--surface` | **2,84** | 3,0 (biên UI) |

Chấm `.wl-dots i` trên `--bg` (3,51) thì đạt ngưỡng 3:1 cho UI, không nằm trong bảng này.

### 4.6. Tag pills màu trên surface (`.tg-purple`, `.tg-red`, `.tg-blue`)

Tag 12px semibold, chữ màu trên nền `color-mix(15–16%)` hoà lên `--surface`:

| Tag | Cặp | Tỉ lệ | Cần |
|---|---|---|---|
| Tím `.tg-purple` | `#BF5AF2` trên `#362640` | **3,95** | 4,5 |
| Đỏ `.tg-red` | `#FF375F` trên `#3E2028` | **4,14** | 4,5 |
| Xanh dương `.tg-blue` | `#0A84FF` trên `#192C40` | **3,90** | 4,5 |

Tag cam (6,11) và xanh lá (6,21) đạt. Lưu ý: nhánh fallback `@supports not (color-mix…)` dùng
màu rgba chỉnh cho light mode (vd `rgba(194,125,18,.16)`), cũng áp dụng cho dark mode trên trình
duyệt cũ — nhưng iOS 16.2+ đã hỗ trợ `color-mix` nên ảnh hưởng thấp.

### 4.7. Icon / chữ cái trắng trên ô màu xanh lá, cam, teal (`.ic`, `.ic.ltr`)

| Ô màu | Trắng trên ô | Cần |
|---|---|---|
| `bg-green` `#30D158` | **2,02** | 3,0 (icon) / 4,5 (chữ cái 15px) |
| `bg-orange` `#FF9F0A` | **2,06** | 3,0 / 4,5 |
| `bg-teal` `#64D2FF` | **1,72** | 3,0 / 4,5 |

Ảnh hưởng: icon phòng ban (Lúa/tiền, Nắng/lịch, Đèn/giữ đồ), icon trạng thái Google Lịch đã kết nối,
chữ cái đầu tên nhân viên phòng (`.ic.ltr`, 26px trong chi tiết phòng = chữ lớn, vẫn cần 3:1 mà
chỉ được 1,72–2,06). Các ô blue (3,65), tím (3,52), accent (3,52), xám (3,26) đạt ngưỡng icon.

## 5. Đề xuất màu thay thế (đã tính lại, kèm tỉ lệ sau khi đổi)

### 5.1. P0 — Chặn theme "Tối giản" phá dark mode (§4.1)

Chỉ áp dụng preset minimal khi hệ đang light, ví dụ:

```css
@media (prefers-color-scheme: light){
  :root[data-theme="minimal"]{ --accent:#3A3A3C; --accent-tint:rgba(58,58,60,.10);
    --bg:#F7F7F5; --surface:#FFFFFF; --fill:rgba(0,0,0,.05); }
}
```

Khi hệ dark mà người dùng đang chọn "Tối giản" thì app rơi về bảng dark mặc định (chữ trắng
trên nền đen, đạt chuẩn). Phương án khác: viết thêm block dark riêng cho minimal với
`--label:#FFFFFF; --label2:#AEAEB2; --bg:#000000; --surface:#1C1C1E; …` — nhưng phương án
@media ở trên đơn giản và ít rủi ro hơn.

### 5.2. P0 — Tách token `--accent-fill` cho nền nút (§4.2)

Thêm token chỉ dùng làm **nền** cho các chỗ có chữ trắng (`.btn.fill`, `.bub.me`,
`.steps.jump button.n`, `.row.done .chk`, `.c-send`), không dùng làm màu chữ:

| Token mới | Giá trị | Trắng trên nền | Ghi chú |
|---|---|---|---|
| `--accent-fill` | `#D81B3F` | **5,06** (cần 4,5) | Chỉ làm nền; nếu dùng làm chữ trên đen chỉ được 4,15 |
| Phương án dự phòng | `#E0245E` | **4,58** | Vừa đủ cả hai vế trên nền đen (4,58), nhưng làm chữ trên surface chỉ 3,71 — vẫn phải tách token cho chữ trên surface |

Định nghĩa `--accent-fill` trong cả 3 block theme (`warm`/`minimal`/`dark`) và trong media query
dark, vì `.btn.fill` dùng `var(--accent)` ở cả hai chế độ. Lưu ý: cùng lỗi này tồn tại ở light mode
(trắng trên `#FA2D48` = 3,79 trên nền trắng) — một token `--accent-fill` sửa được cả hai.

### 5.3. P1 — Accent theme Ấm ở dark mode (§4.3)

Chọn một trong hai:

- **(a) Đơn giản:** bỏ dòng `--accent:#FA2D48` của theme `warm` khi hệ dark, để media query
  `#FF375F` thắng → chữ accent trên surface **4,83** ✅, trên bg 5,96 ✅.
- **(b) Giữ bản sắc Ấm:** đặt accent dark của theme warm thành `#FF5C73` → trên surface **5,70**,
  trên bg 7,03 ✅ (nhưng không được dùng `#FF5C73` làm nền nút — trắng trên đó chỉ 2,99;
  nền nút đã có `--accent-fill` ở §5.2).

### 5.4. P1 — Chữ nút tint (§4.4)

Đổi màu chữ `.btn.tint` / `.steps.jump button.d` sang hồng nhạt (giữ nguyên nền tint):

| Màu chữ mới | Trên tint-over-surface | Trên tint-over-bg |
|---|---|---|
| `#FF8FA3` (khuyên dùng) | **6,67** | 8,52 |
| `#FF7A90` | 5,80 | 7,40 |

Đặt tên token `--accent-soft: #FF8FA3` để dùng chung cho `.btn.tint`, `.steps.jump .d`,
`.wl-tag`. Phương án khác (giảm `--accent-tint` xuống 6%) chỉ đạt 4,56 — sát ngưỡng, không khuyên.

### 5.5. P1 — `--label3` (§4.5)

| Thay | Giá trị mới | Trên `--bg` | Trên `--surface` |
|---|---|---|---|
| `--label3: #636366` → | `#8E8E93` (đã có sẵn trong palette, trùng `--gray`) | **6,44** | **5,22** |
| Phương án dự phòng | `#98989D` | 7,31 | 5,93 |

Một dòng đổi duy nhất sửa cả placeholder, `.foot`, chevron (5,22 ≥ 3,0) và viền checkbox (5,22 ≥ 3,0).

### 5.6. P2 — Màu chữ tag pills (§4.6)

Giữ nguyên tỉ lệ mix 15–16% (tăng alpha làm tỉ lệ tệ hơn: mix 25% chỉ còn ~3,4–3,6),
chỉ đổi màu chữ — nền mix tự đi theo màu mới:

| Tag | Cũ → Mới | Tỉ lệ sau khi đổi |
|---|---|---|
| Tím | `#BF5AF2` → `#D18CFF` | **5,42** |
| Đỏ | `#FF375F` → `#FF7A90` (hoặc `#FF8FA3` → 5,97) | **5,35** |
| Xanh dương | `#0A84FF` → `#4DA3FF` (hoặc `#5EB0FF` → 5,66) | **5,10** |

Cam và xanh lá giữ nguyên.

### 5.7. P2 — Ô màu tile `.ic` (§4.7)

Màu sáng hiện tại vẫn tốt khi làm **chữ trên nền tối** — chỉ sai khi làm **nền ô có glyph/chữ trắng**.
Thêm token nền ô riêng (dùng cho `.bg-green/.bg-orange/.bg-teal` trong dark mode):

| Ô | Cũ → Nền ô mới (dark) | Trắng trên ô |
|---|---|---|
| Xanh lá | `#30D158` → `#1E7D32` | **5,20** |
| Cam | `#FF9F0A` → `#B25A00` | **4,82** |
| Teal | `#64D2FF` → `#0E7FA8` | **4,55** |

Đạt cả ngưỡng icon 3:1 lẫn chữ cái 15px 4,5. Ô blue/tím/accent/xám đạt ngưỡng icon nên có thể giữ,
nhưng nếu có chữ cái 15px trên đó thì vẫn chưa đủ 4,5 — hiện chỉ có chữ 26px (chữ lớn, cần 3:1) nên tạm ổn.

## 6. Lưu ý không tính được từ code (cần kiểm bằng mắt trên iPhone)

- **Chữ trắng trên ảnh** (`.hero-cap`, `.moments .shot span`): gradient `rgba(20,12,6,.68)` phủ
  lên ảnh thật. Ước tính trường hợp xấu nhất (đáy ảnh trắng hoàn toàn) vẫn đạt ~6,81, nhưng ảnh tối
  + chữ nhỏ 12px thì cần nhìn thật mới chắc.
- **Kính mờ trên nội dung thật** (tab bar, sheet, `.hud`): tỉ lệ tính trên giả định nền dưới là
  `#000000` thuần; trên nền ảnh/nội dung sáng, `backdrop-filter: blur` có thể làm chữ trên thanh
  mờ khó đọc hơn số liệu trong bảng.
- **Nút gửi disabled** (`.c-send:disabled`, opacity .35) và trạng thái `:active` (opacity .65):
  WCAG miễn trừ thành phần disabled / trạng thái nhất thời nên không tính là lỗi — chỉ ghi nhận
  là vẫn nhìn mờ.
- **Núm switch khi bật** (trắng trên nền xanh lá `#30D158` = 2,02, cần 3:1 cho biên UI): giống
  hệt switch gốc của iOS, có bóng đổ hỗ trợ phân tách; ghi nhận là lưu ý nhỏ, không phải lỗi chữ.
- **Light mode** (ngoài phạm vi audit này nhưng cùng gốc lỗi): chữ accent `#FA2D48` trên nền trắng
  = 3,79, cũng chưa đạt 4,5 — token `--accent-fill` ở §5.2 sửa được cả hai chế độ.

## 7. Tóm tắt đếm lỗi

| Mức | Số cặp chưa đạt | Nội dung |
|---|---|---|
| P0 | 2 nhóm | Theme "Tối giản" + dark = mất chữ (1,07) · Chữ trắng trên nút accent (3,52–3,79) |
| P1 | 3 nhóm | Accent Ấm trên surface (4,48) · Nút tint trên surface (4,03–4,10) · `--label3` (2,84–3,51) |
| P2 | 2 nhóm | Tag tím/đỏ/xanh dương (3,90–4,14) · Icon/chữ trắng trên ô xanh lá/cam/teal (1,72–2,06) |
| **Tổng** | **7 nhóm, 15 cặp** | Toàn bộ cặp còn lại trong §3 đều đạt |

File nguồn đã đọc: `www/index.html` (dòng 39–61 biến màu, 376–378 preset theme, 819/837/1303/2373–2434
logic chọn theme). Không sửa bất kỳ file nào.
