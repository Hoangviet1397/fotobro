# Widget màn hình chính iOS — FotoBro

> **Trạng thái: THIẾT KẾ cho v1.1 trở đi — CHƯA CODE.**
> Widget cần WidgetKit (Swift, native) + App Groups để chia sẻ dữ liệu với app Capacitor,
> nằm ngoài phạm vi v1 (v1 là app web đóng gói Capacitor, local-first, dữ liệu trong máy).
> Tài liệu này chỉ chốt thiết kế để khi làm v1.1 thì code theo, không phải bàn lại.

## 1. Nguyên tắc

- **Widget là màn Hôm nay thu nhỏ, không phải app thứ hai.** Mọi số liệu, nhãn và quy tắc
  phải giống hệt màn Hôm nay trong app thật (`~/workspace/fotobro-ios-v1/www/index.html`):
  - Pipeline 8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong.
  - Job kẹt: ở 1 bước quá 7 ngày, hoặc đã qua ngày chụp mà vẫn ở bước trước "Đã chụp",
    hoặc đã quá hạn giao mà chưa tới "Đã giao".
  - "Còn thiếu" của 1 job = giá job − cọc − các khoản đã thu; tổng còn thiếu cộng dồn
    các job chưa Xong và chưa huỷ.
- **Chỉ đọc, không sửa.** Widget không có nút đổi bước, không ghi tiền. Mọi thao tác
  đều mở app rồi làm trong app.
- **Local-first, không mạng.** Widget chỉ đọc snapshot dữ liệu app đã ghi sẵn trong
  App Groups; không gọi Google, không gọi server.
- **Riêng tư trên màn hình khoá.** Widget hiện trên màn hình khoá, nên tôn trọng khoá app:
  nếu app đang khoá (`troLyXeo.lock`), widget chỉ hiện "FotoBro đã khoá — mở app để xem",
  không lộ tên khách hay số tiền.
- **Kiểu Apple Music như app v1:** nền trắng sạch / dark mode đen, chữ SF Pro,
  1 màu nhấn `#FA2D48`, thẻ bo góc lớn, không dùng phong cách vintage cũ.

## 2. Dữ liệu widget dùng (snapshot)

App ghi snapshot vào App Groups (`group.com.fotobro.app`, UserDefaults suite chung)
mỗi lần dữ liệu đổi (thêm/sửa job, đổi bước pipeline, ghi thu/chi, mở app). Widget chỉ đọc
snapshot này — không đọc thẳng localStorage của WebView (WidgetKit không vào được).

| Trường | Nội dung | Nguồn trong app |
|---|---|---|
| `locked` | App có đang khoá không | `localStorage troLyXeo.lock` |
| `today` | Ngày của snapshot (yyyy-mm-dd) | `dstr(0)` |
| `jobsToday` | Job chụp hôm nay (chưa Xong, chưa huỷ), tối đa 4 | `shootDate === today`, sắp xếp theo `shootTime` |
| `moneyToday` | Tiền đã thu hôm nay | Tổng giao dịch `thu` ngày hôm nay |
| `totalOwe` | Tổng tiền khách còn thiếu | `totalOwe()` |
| `stuckJobs` | Job kẹt, tối đa 3 (kèm bước đang kẹt + lý do ngắn) | `isStuck(j)` |
| `nextJob` | Job sắp tới gần nhất sau hôm nay | Job chưa Xong có `shootDate` > hôm nay, gần nhất |
| `updatedAt` | Giờ ghi snapshot | Giờ hệ thống lúc ghi |

Mỗi job trong snapshot chỉ cần: `id`, `client`, `type` (Portrait/Couple/Wedding/Lookbook/Event),
`shootTime`, `location`, `stage`, `owe`, `stuckReason` (nếu kẹt).

## 3. Cỡ nhỏ (Small, 2×2) — "Buổi chụp tiếp theo"

Hiển thị **1 job duy nhất**: job chụp hôm nay gần nhất (theo giờ chụp; job đã qua giờ thì
lấy job tiếp theo trong ngày).

- Dòng 1 (eyebrow): `HÔM NAY` + giờ chụp, vd: `HÔM NAY · 09:00`.
- Dòng 2 (tiêu đề lớn): tên khách, vd: `Minh Anh`.
- Dòng 3: loại job + địa điểm, vd: `Couple · Hồ Gươm`.
- Dòng 4: chip bước pipeline hiện tại, vd: `● Sắp chụp` (màu nhấn nếu sắp tới giờ,
  đỏ nếu job kẹt).
- Nếu job đó còn thiếu tiền: thêm dòng nhỏ `Còn thiếu 2.000.000đ` (màu đỏ).

**Không có job hôm nay:** hiện job sắp tới gần nhất — eyebrow đổi thành ngày đó
(vd: `THỨ 7 · 21/11`), kèm giờ chụp. Nếu không có job nào cả: xem mục 6.

**Chạm vào:** mở chi tiết job đó trong app (`fotobro://job/<id>`).

## 4. Cỡ vừa (Medium, 4×2) — "Hôm nay của tôi"

Hiển thị tối đa **2 job hôm nay** + 1 hàng tiền.

- Cột trái — job hôm nay (tối đa 2, theo giờ chụp):
  - Mỗi job 1 dòng: `09:00  Minh Anh — Couple` + chip bước (`Sắp chụp`).
  - Job kẹt có dấu `!` đỏ trước giờ.
  - Nếu có hơn 2 job: dòng cuối `+2 buổi chụp nữa`.
- Cột phải — tiền bạc:
  - `Thu hôm nay` + số tiền (xanh lá nếu > 0, xám nếu 0).
  - `Khách còn thiếu` + số tiền (đỏ nếu > 0).
- Chân widget: nếu có job kẹt, 1 dòng đỏ `⚠ 1 job kẹt ở Hậu kỳ — Lan Anh` (job kẹt
  đầu tiên; chạm vào mở job đó).

**Không có job hôm nay:** cột trái hiện job sắp tới gần nhất (`Tiếp theo: Thứ 7 21/11,
09:00 — Minh Anh`), cột phải giữ nguyên hàng tiền.

**Chạm vào:**
- Chạm 1 job → chi tiết job đó (`fotobro://job/<id>`).
- Chạm hàng tiền → màn Tiền bạc (`fotobro://money`).
- Chạm dòng job kẹt → chi tiết job kẹt đó.
- Chạm vùng còn lại → màn Hôm nay (`fotobro://home`).

## 5. Cỡ lớn (Large, 4×4) — "Hôm nay đầy đủ"

Gần như màn Hôm nay thu nhỏ, 3 nhóm theo đúng thứ tự trong app:

1. **Cần nhớ hôm nay** (tối đa 3 mục, theo thứ tự ưu tiên trong app):
   - Job chụp hôm nay: `09:00 — Minh Anh, Couple · Hồ Gươm`.
   - Job tới hạn giao hôm nay: `Hạn giao ảnh — Lan Anh (đang ở Hậu kỳ)`.
   - Job còn thiếu tiền ở bước Chọn ảnh / Hậu kỳ / Đã giao: `Lan Anh còn thiếu 2.000.000đ`.
2. **Tiền bạc** (1 hàng 2 ô):
   - `Thu hôm nay: 5.000.000đ` · `Khách còn thiếu: 3.500.000đ`.
3. **Job kẹt** (nếu có, tối đa 2): `Kẹt ở Hậu kỳ — Lan Anh · quá 9 ngày` + nút chữ
   `Xem` (chạm mở job). Không có job kẹt thì thay bằng dòng `Ngày mai: 09:00 — Thu Hằng,
   Portrait` (job sắp tới gần nhất).

**Chạm vào:** như cỡ vừa, theo từng vùng: job → chi tiết job, tiền → Tiền bạc,
job kẹt → chi tiết job kẹt, vùng còn lại → Hôm nay.

## 6. Trạng thái trống (không có job hôm nay)

Áp dụng cho cả 3 cỡ, giữ đúng giọng app ("Hôm nay thong thả lắm"):

- **Còn job sắp tới:** `Hôm nay thong thả lắm` + `Tiếp theo: Thứ 7 21/11, 09:00 — Minh Anh`.
  Cỡ nhỏ chỉ hiện 2 dòng này; cỡ vừa/lớn thêm hàng tiền (thu hôm nay / còn thiếu).
- **Không có job nào cả (app mới):** `Chưa có buổi chụp nào` + `Thêm buổi chụp đầu tiên`
  — chạm vào mở form thêm job (`fotobro://jobs/new`).
- **App đang khoá:** mọi cỡ đều chỉ hiện `FotoBro đã khoá` + `Mở app để xem hôm nay`
  — chạm vào mở app (màn khoá). Không hiện tên khách, giờ chụp hay số tiền.

## 7. Cập nhật khi nào

WidgetKit giới hạn số lần làm mới (timeline budget), nên cập nhật theo sự kiện +
theo mốc giờ, không cập nhật liên tục:

| Thời điểm | Vì sao |
|---|---|
| App ghi dữ liệu mới → `WidgetCenter.reloadAllTimelines()` | Thêm/sửa job, đổi bước pipeline, ghi thu/chi, khôi phục/huỷ job — widget phải đổi ngay |
| 00:05 mỗi ngày | Sang ngày mới: job hôm nay đổi, "thu hôm nay" reset |
| 30 phút trước mỗi buổi chụp hôm nay | Nhắc job sắp tới giờ; job đó lên đầu danh sách |
| Lúc tới giờ chụp | Job đang chụp chuyển trạng thái hiển thị (từ "sắp chụp" sang "đang chụp") |
| Mở app / app vào nền | Ghi lại snapshot mới nhất trước khi widget đọc |

Không dùng `reloadAllTimelines` theo timer ngắn (vd: mỗi 15 phút) — vừa tốn budget,
vừa không cần vì dữ liệu chỉ đổi khi người dùng làm gì đó trong app.

## 8. Chạm vào widget thì mở màn nào (deep link)

Widget dùng `widgetURL` (toàn widget) và `Link` (từng vùng) với URL scheme riêng
của FotoBro. **Lưu ý: v1 chưa có URL scheme** — v1.1 phải thêm `fotobro://` vào
Xcode (`CFBundleURLSchemes`) và thêm handler trong app Capacitor để mở đúng màn:

| Deep link | Mở trong app |
|---|---|
| `fotobro://home` | Màn Hôm nay (mặc định khi chạm vùng trống) |
| `fotobro://job/<id>` | Chi tiết job (mở từ job hôm nay / job kẹt / nhắc hạn giao) |
| `fotobro://money` | Màn Tiền bạc (mở từ hàng tiền / còn thiếu) |
| `fotobro://jobs/new` | Form thêm job mới (mở từ trạng thái trống "chưa có job nào") |
| `fotobro://jobs` | Màn Buổi chụp (dự phòng khi job trong widget đã bị xoá) |

Nếu deep link trỏ tới job đã bị xoá / đã Xong: mở màn Buổi chụp thay vì báo lỗi.

## 9. Ngoài phạm vi v1.1 (không làm cùng đợt này)

- **Widget tương tác** (nút "Xong bước này" ngay trên widget, iOS 17 AppIntents): dời v1.2,
  vì đổi bước có gắn tiền (Chốt cọc ghi cọc, Đã giao nhắc thu nốt, Xong còn thiếu tiền
  thì cảnh báo) — không làm gọn trên widget được.
- **Live Activity** (đếm ngược tới giờ chụp trên Dynamic Island / màn hình khoá): dời v1.2.
- **Widget màn hình khoá** (Lock Screen widgets) và **complication Apple Watch**: dời sau,
  chờ quyết định có làm app Watch không.
- **Cấu hình widget** (chọn chỉ hiện job / chỉ hiện tiền): không làm ở v1.1 — 3 cỡ cố định
  là đủ; thêm cấu hình chỉ khi người dùng yêu cầu.

## 10. Checklist nghiệm thu v1.1 (khi code xong)

- [ ] 3 cỡ hiển thị đúng nội dung mục 3–5, đúng font/màu/dark mode của app v1.
- [ ] Số tiền, bước pipeline, job kẹt khớp 100% với màn Hôm nay cùng thời điểm.
- [ ] Đổi bước / ghi thu trong app → widget đổi trong vài giây (reload on write).
- [ ] Qua 0h → widget sang ngày mới, không còn job hôm qua.
- [ ] Chạm từng vùng mở đúng màn theo mục 8; job đã xoá → mở Buổi chụp.
- [ ] App khoá → widget chỉ hiện màn khoá, không lộ dữ liệu.
- [ ] Không có job hôm nay / không có job nào → trạng thái trống mục 6.
- [ ] Chữ tiếng Việt có dấu hiển thị đúng; Dynamic Type (chữ to hệ thống) không vỡ layout.
- [ ] Widget không gọi mạng, không đọc dữ liệu ngoài App Groups snapshot.
