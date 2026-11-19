# FotoBro — Biến thể Icon App theo iOS 18

> **Đây là tài liệu THIẾT KẾ, chưa phải file ảnh thật.**
> Chưa có file PNG nào được vẽ/xuất theo thiết kế này.
> Icon app hiện tại (`AppIcon-1024.png`) vẫn là hoa sen + ống kính cũ (nền kem,
> sen hồng, vòng vàng, lá xanh) — **chưa đổi sang logo mới**.
> Logo mới làm gốc cho cả 3 biến thể dưới đây đã có sẵn:
> `assets/logo-v2/fotobro-logo.svg` và `assets/logo-v2/fotobro-icon-1024.png`
> (chữ "F" đậm trong vòng ống kính đỏ trên nền trắng).

- **App:** FotoBro iOS v1 — trợ lý cho photographer tự do
- **Bundle ID:** `com.fotobro.app`
- **Nền tảng:** iOS 18 (Capacitor 8) — hỗ trợ icon sáng / tối / tinted
- **Màu nhấn:** `#FA2D48` (đỏ Apple Music)
- **Phong cách UI:** Apple Music — nền trắng sạch, dark mode đen thật

## 1. Hình gốc chung (dùng cho cả 3 biến thể)

Chỉ đổi màu — **không đổi hình, không đổi bố cục, không đổi tỉ lệ** giữa các biến thể,
để người dùng nhận ra cùng một app ở mọi chế độ.

| Thuộc tính | Giá trị |
|---|---|
| Kích thước master | **1024 × 1024 px**, PNG, không trong suốt (opaque, full-bleed) |
| Hình | Chữ **"F" đậm** (SF Pro Bold / Arial Bold, weight 700) đặt giữa **vòng ống kính** tròn, liền mạch, không highlight, không bóng đổ |
| Hình học (theo `fotobro-logo.svg`, viewBox 512 → nhân 2 cho 1024) | Tâm (512, 512); vòng tròn bán kính 352 px, nét vẽ dày 88 px; chữ F cỡ ~600 px, căn giữa |
| Lề an toàn | Vòng ống kính cách mép tối thiểu ~116 px (≈ 11%) — không chạm mép, không bị cắt khi iOS bo góc squircle |
| Bo góc | **Không tự bo góc trong file ảnh** — iOS tự áp mask squircle khi hiển thị |
| Chữ | Chỉ duy nhất chữ cái **"F"** — **không** thêm chữ "FotoBro", không tagline, **không dùng chữ quá nhỏ** |
| Ảnh | Chỉ hình vector (vòng tròn + chữ) — **không dùng ảnh chụp**, không dùng ảnh nền |

## 2. Biến thể Light (icon sáng — mặc định)

Dùng khi iPhone ở chế độ sáng; cũng là icon marketing 1024 px nộp App Store.

| Thành phần | Màu | Ghi chú |
|---|---|---|
| Nền | Trắng `#FFFFFF` | Trắng sạch, khớp UI sáng kiểu Apple Music |
| Vòng ống kính | Đỏ nhấn `#FA2D48` | Giữ nguyên màu thương hiệu |
| Chữ "F" | Đen `#111111` | Tương phản với nền trắng ≈ 18,9 : 1 — đọc rõ ở mọi cỡ |

## 3. Biến thể Dark (icon tối)

Dùng khi iPhone ở chế độ tối (Dark Mode). Nền đen thật để hòa với màn hình chính tối.

| Thành phần | Màu | Ghi chú |
|---|---|---|
| Nền | Đen thật `#000000` | Khớp dark mode đen thật của app, không dùng xám `#1C1C1E` |
| Vòng ống kính | Đỏ nhấn `#FA2D48` | Giữ nguyên `#FA2D48` — tương phản với nền đen ≈ 5,5 : 1, nổi hơn trên nền trắng (≈ 3,8 : 1) nên không cần làm sáng thêm |
| Chữ "F" | Trắng `#FFFFFF` | Đảo từ đen sang trắng; tương phản với nền đen = 21 : 1 |

> Không làm phiên bản "nền xám đậm + F đen": F đen trên nền tối sẽ chìm, mất nhận diện.

## 4. Biến thể Tinted (icon đơn sắc theo màu hệ thống)

iOS 18 cho người dùng chọn 1 màu tint áp lên toàn bộ icon màn hình chính.
Biến thể này **không dùng màu đỏ thương hiệu** — artwork phải đơn sắc để hệ thống
tô màu, và phải đọc được với **bất kỳ** màu tint nào người dùng chọn.

| Thành phần | Màu | Ghi chú |
|---|---|---|
| Nền | Màu tint do hệ thống / người dùng chọn | File artwork để nền ở dạng trung tính để iOS tô tint; **không** hard-code `#FA2D48` làm nền |
| Vòng ống kính | Một màu duy nhất — trắng `#FFFFFF` | Cùng một màu với chữ F; hệ thống sẽ render artwork theo tông của màu tint |
| Chữ "F" | Một màu duy nhất — trắng `#FFFFFF` | Cùng màu với vòng ống kính: toàn bộ artwork chỉ có **1 màu + nền tint**, không có màu thứ hai |
| Quy tắc | Artwork đơn sắc, không gradient, không bóng đổ, không viền phụ | Nếu để F đen + vòng đỏ như bản light, iOS tô tint sẽ cho ra 2 tông lệch nhau, trông bẩn |

> Ghi chú kỹ thuật: nếu không cung cấp artwork tinted riêng, iOS 18 sẽ tự tạo bản
> tinted từ icon light — nhưng bản tự tạo có thể làm vòng đỏ + F đen bị tô lệch.
> Vì vậy nên xuất riêng artwork tinted đơn sắc theo bảng trên để kiểm soát kết quả.

## 5. Bảng tóm tắt 3 biến thể

| Biến thể | Nền | Vòng ống kính | Chữ "F" |
|---|---|---|---|
| Light | `#FFFFFF` | `#FA2D48` | `#111111` |
| Dark | `#000000` | `#FA2D48` | `#FFFFFF` |
| Tinted | Màu tint hệ thống | `#FFFFFF` (đơn sắc) | `#FFFFFF` (đơn sắc) |

## 6. Quy tắc chung (áp dụng cho cả 3 biến thể)

1. **Không chữ nhỏ:** chỉ có chữ "F" duy nhất, cỡ lớn (~600 px trên canvas 1024).
   Không tên app, không slogan, không chữ phụ.
2. **Không ảnh chụp:** toàn bộ icon là hình vector (vòng tròn + chữ). Không ảnh máy ảnh,
   không ảnh mẫu, không ảnh nền.
3. **Một hình, ba màu:** hình học giống hệt nhau ở cả 3 biến thể; chỉ khác bảng màu.
4. **Tương phản tối thiểu:** vòng ống kính là yếu tố đồ họa lớn (nét 88 px) nên chỉ cần
   ≥ 3 : 1 — `#FA2D48` đạt ≈ 3,8 : 1 trên trắng và ≈ 5,5 : 1 trên đen. Chữ "F"
   đạt ≥ 18 : 1 ở cả hai bản light/dark.
5. **Không bo góc, không trong suốt:** xuất PNG 1024 × 1024 opaque, full-bleed;
   iOS tự bo góc và tự tạo các cỡ nhỏ (180, 120, 87, 80, 60, 40 px) từ file master.
6. **Không hoa sen, không màu kem/hồng phấn/vàng lá:** phong cách vintage cũ đã bỏ;
   icon mới chỉ dùng trắng / đen / đỏ `#FA2D48`.

## 7. Khi vẽ file thật (chưa làm — việc cho bước sau)

- Xuất 3 file PNG 1024 × 1024 từ cùng 1 file vector gốc, chỉ đổi bảng màu theo §5:
  `AppIcon-light-1024.png`, `AppIcon-dark-1024.png`, `AppIcon-tinted-1024.png`
  (tên file cuối cùng theo quy ước của asset catalog lúc build).
- Đưa vào Xcode asset catalog `Assets.xcassets/AppIcon.appiconset` với 3 appearance:
  Any (light) / Dark / Tinted; icon 1024 px nộp App Store = bản Light.
- Kiểm tra thực tế trên iPhone ở cả 3 chế độ (sáng / tối / tinted với 2–3 màu tint
  khác nhau, gồm tint rất nhạt và rất đậm) ở cỡ hiển thị nhỏ nhất trên màn hình chính,
  xác nhận vòng ống kính + chữ F vẫn đọc được, không bị cắt góc.
- Sau khi thay icon, file `AppIcon-1024.png` cũ (hoa sen + ống kính) được thay thế —
  không giữ song song hai icon.

## Nguồn tham chiếu

- Logo gốc: `assets/logo-v2/fotobro-logo.svg` (F `#111111`, vòng `#FA2D48`, nét 44/512)
- Icon logo mới: `assets/logo-v2/fotobro-icon-1024.png` (1024 × 1024)
- Icon cũ cần thay: `AppIcon-1024.png` (hoa sen + ống kính, nền kem)
- Tỉ lệ tương phản đã tính bằng công thức WCAG từ mã màu hex (không ước lượng bằng mắt).
