# Logo FotoBro v2

Logo mới cho FotoBro, thay cho icon hoa sen + lens cũ của Trợ lý Xèo.
**Chưa thay vào app** — cần Việt duyệt trước khi thay icon hiện tại.

## Ý tưởng

- **Chữ F** = Foto (và FotoBro), đậm, đen, đặt giữa.
- **Vòng tròn đỏ** = ống kính máy ảnh, cũng là vòng tròn khép kín của một studio làm việc trọn quy trình.
- Chỉ 2 yếu tố, không chữ nhỏ, không chi tiết thừa — đọc được ở cỡ 32px (đã thử thu nhỏ kiểm tra).

## Màu

| Vai trò | Màu | Mã |
|---|---|---|
| Màu nhấn (vòng ống kính) | Đỏ kiểu Apple Music | `#FA2D48` |
| Chữ F | Đen gần tuyệt đối | `#111111` |
| Nền icon App Store | Trắng sạch | `#FFFFFF` |
| Nền logo SVG | Trong suốt | — |

Màu nhấn `#FA2D48` khớp hướng UI tối giản kiểu Apple Music của app (nền trắng + dark mode đen, 1 màu nhấn).

## File

| File | Cỡ | Dùng cho |
|---|---|---|
| `fotobro-logo.svg` | 512×512 (viewBox), nền trong suốt | Logo trong app, web, tài liệu. Chữ F dùng font hệ thống (Arial / SF Pro Bold trên iOS). |
| `fotobro-icon-1024.png` | 1024×1024, PNG, nền trắng | Icon App Store (đúng cỡ Apple yêu cầu). Không có chữ nhỏ, không hoa sen, không hình có bản quyền. |

Cả hai file vẽ từ cùng một hình học (vòng r = 176/512, F căn giữa), nên SVG và PNG khớp nhau. PNG render bằng code (PIL, supersample rồi thu nhỏ) để nét và đúng màu, không dùng ảnh AI sinh.

## Khi Việt duyệt

1. Thay `AppIcon-1024.png` ở gói iOS bằng `fotobro-icon-1024.png` (giữ bản cũ lại nếu cần đối chiếu).
2. Dùng `fotobro-logo.svg` cho màn hình chào / Hôm nay nếu muốn logo thay chữ.
3. Nếu muốn đổi màu nhấn, chỉ cần đổi `#FA2D48` ở cả hai file (SVG đổi mã màu, PNG render lại từ script).
