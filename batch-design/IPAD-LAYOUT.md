# FotoBro iOS v1 — Thiết kế layout iPad

> **Đây là thiết kế, chưa code.** Không sửa `www/index.html`, không đổi dữ
> liệu, không thêm tính năng. **Ưu tiên iPhone trước** — layout iPad chỉ được
> làm sau khi bản iPhone ổn định, và không được làm vỡ bất cứ hành vi nào
> trên iPhone.

- App thật (đối chiếu): `~/workspace/fotobro-ios-v1/www/index.html`
- Ngôn ngữ thiết kế giữ nguyên: Large Title 34px, thẻ bo góc lớn 16–20px,
  tab bar mờ, 1 màu nhấn `#FA2D48` (dark mode `#FF375F`), nền trắng
  `#FFFFFF` + dark mode đen thật `#000000`, chữ hệ thống SF Pro.
- Hiện trạng iPhone (đã có trong file, làm mốc so sánh):
  - `.wrap` tối đa `720px`, căn giữa; `.nav-in` tối đa `720px`;
    `.tabbar-in` tối đa `620px`; sheet tối đa `720px`.
  - Đã có 1 breakpoint: `@media (min-width:700px)` — ảnh hero cao `250px`,
    `.tiles` thành 4 cột, `.moments` thành 3 cột.
  - Không có breakpoint nào cho iPad. Trên iPad hiện tại app chỉ là cột
    iPhone `720px` đặt giữa màn hình rộng — lãng phí chiều ngang, danh
    sách job dài phải cuộn nhiều, bảng tiền/báo cáo hẹp.

## 0. Đối chiếu tên màn hình — lưu ý quan trọng

Nhiệm vụ giao ghi 5 màn chính là **Hôm nay, Job, Sổ tiền, Lịch, Cài đặt**,
nhưng trong file thật cấu trúc khác một chút, và thiết kế này bám theo
**file thật**, không bịa thêm màn:

| Tên trong nhiệm vụ | Trong file thật |
|---|---|
| Hôm nay | Tab `Hôm nay` (`#view-home`) |
| Job | Tab `Buổi chụp` (`#view-jobs`) — gồm 2 chế độ: `Danh sách` / `Lịch` (`#jobsSeg`) |
| Sổ tiền | Tab `Tiền bạc` (`#view-money`) |
| Lịch | **Không phải tab riêng** — là chế độ `Lịch` (`#calView`) bên trong tab Buổi chụp |
| Cài đặt | **Không phải tab riêng** — là sheet `Cài đặt` (mở từ tab Phòng ban, nút `#settingsRow` / `openSettings()`), cộng một mục Cài đặt trong tab Phòng ban |

Hệ quả: **không tạo thêm tab Lịch hay tab Cài đặt trên iPad.** Lịch được
mở rộng bên trong tab Buổi chụp (§3), Cài đặt giữ nguyên dạng sheet (§5).
Tab bar vẫn đúng 5 tab như iPhone: **Hôm nay – Buổi chụp – Tiền bạc –
Phòng ban – Trợ lý.**

## 1. Quyết định khung: giữ tab bar, KHÔNG dùng split view toàn app

- **Giữ tab bar dưới cùng trên mọi kích thước iPad**, giống iPhone.
  Tab bar vẫn mờ (`backdrop-filter: blur`), 5 tab, icon + nhãn, tab đang
  chọn màu nhấn. Chỉ nới `.tabbar-in` từ `620px` lên tối đa `720px` cho
  iPad để các tab không bị dồn quá chặt ở màn rộng.
- **Không làm sidebar trái / split view toàn app** (kiểu app macOS hay
  Mail trên iPad). Lý do:
  - App chỉ có 5 tab, người dùng đã quen điều hướng bằng tab bar trên
    iPhone; thêm một kiểu điều hướng thứ hai gây rối, phải học lại.
  - Sidebar chiếm 280–320px chiều ngang vĩnh viễn, trong khi nội dung
    chính của app (danh sách job, sổ thu chi) vốn đã cần chiều rộng.
  - Ưu tiên iPhone trước: giữ một hệ điều hướng duy nhất thì mọi sửa
    chữa, kiểm chứng sau này chỉ cần làm một lần.
- **Ngoại lệ duy nhất dùng split view: màn Buổi chụp** (§3). Chỉ ở đó
  việc xem danh sách + chi tiết cạnh nhau mới thật sự tiết kiệm thao
  tác (chạm job này sang job khác không cần đóng/mở liên tục).

## 2. Chiều rộng tối đa nội dung — nguyên tắc chung

Không kéo nội dung giãn hết màn hình iPad. Dòng chữ, hàng danh sách và
thẻ mà quá rộng sẽ khó quét mắt và khó chạm chính xác.

| Chiều rộng cửa sổ | `.wrap` tối đa | Ghi chú |
|---|---|---|
| < 700px (iPhone, Slide Over hẹp) | 720px như hiện tại | **Giữ nguyên y hệt iPhone**, không đổi gì |
| 700–1023px (iPad dọc: 768, 820, 834) | **820px** | Cột đơn, căn giữa, padding ngang 24px |
| ≥ 1024px (iPad ngang: 1024, 1180/1194, 1366) | **1080px** | Cột đơn cho đa số màn; chỉ màn Buổi chụp và Tiền bạc mới chia 2 cột (§3, §4). Padding ngang 32px |

- `.nav-in` đi theo `.wrap`: tối đa bằng `.wrap` ở từng breakpoint.
- Large Title giữ `34px`, cỡ chữ thân `17px`, nút bấm tối thiểu `44pt`
  chiều cao — **không phóng to chữ/nút chỉ vì màn lớn hơn**. Màn lớn
  hơn thì chứa được nhiều cột/hàng hơn, không phải chữ to hơn.
- Bo góc thẻ giữ `16–20px` như iPhone; khoảng cách giữa các thẻ giữ
  `12px`. Không đổi màu sắc, dark mode, hiệu ứng kính mờ.
- **Breakpoint theo chiều rộng cửa sổ, không theo loại thiết bị.**
  Dùng `@media (min-width:1024px)` (và `700px` đã có), không dùng
  phát hiện "đây có phải iPad không". Nhờ vậy app chạy trong
  Split View / Slide Over / Stage Manager vẫn đúng: cửa sổ hẹp lại
  thì tự rơi về layout iPhone, cửa sổ rộng ra thì mới bật layout iPad.
- Multitasking: khi cửa sổ iPad bị thu hẹp dưới `700px` (Slide Over),
  mọi màn phải hiển thị đúng như iPhone, không vỡ layout, không tràn
  ngang, không mất nút.

## 3. Màn Buổi chụp — nơi duy nhất dùng split view

### 3.1. iPad dọc (< 1024px): giữ nguyên như iPhone

- Một cột duy nhất: Large Title → seg `Danh sách / Lịch` → chip lọc
  theo bước → danh sách job → mục Chuẩn bị đồ.
- Chạm một job thì chi tiết mở như hiện tại (sheet), không đổi.

### 3.2. iPad ngang (≥ 1024px): danh sách + chi tiết cạnh nhau

- Bố cục 2 cột trong cùng một màn, không còn mở chi tiết bằng sheet:
  - **Cột trái — danh sách job: rộng cố định `360–400px`**, có thanh
    cuộn riêng. Giữ nguyên seg `Danh sách / Lịch`, chip lọc theo bước
    (8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh →
    Hậu kỳ → Đã giao → Xong) và mục Chuẩn bị đồ ở dưới danh sách
    (hoặc ghim cuối cột trái, cuộn cùng danh sách).
  - **Cột phải — chi tiết job: chiếm phần còn lại (tối thiểu `480px`)**,
    có thanh cuộn riêng. Hiển thị đúng nội dung chi tiết job như
    hiện tại: đầu job (tên khách, loại, ngày/giờ), thanh tiến trình
    8 bước có nhảy thẳng tới bước bất kỳ, tiền cọc / còn thiếu, ghi
    chú, các nút hành động (nhắn khách, thêm vào Lịch iPhone, sửa,
    xoá…).
  - Hai cột tách nhau bằng khoảng trắng `16–24px` (không vẽ đường kẻ
    dọc đậm kiểu desktop — giữ cảm giác iOS).
- Hành vi chọn:
  - Chạm một job ở cột trái → chi tiết hiện ngay ở cột phải, hàng
    job đó được tô nền nhấn nhạt (`--accent-tint`) để biết đang xem
    job nào. Chuyển job khác không cần đóng gì.
  - Lần đầu mở màn mà chưa chọn job nào: cột phải hiện trạng thái
    trống — icon máy ảnh + dòng "Chạm một buổi chụp để xem chi tiết"
    (không tự chọn job đầu tiên, tránh người dùng tưởng đó là job
    đang mở; và tránh nhầm khi vuốt nhầm).
  - Mọi thao tác trong chi tiết (đổi bước, ghi tiền, sửa job) cập
    nhật ngay hàng tương ứng ở cột trái, không cần tải lại màn.
- Form thêm/sửa job: **không** nhét vào cột phải. Vẫn mở bằng sheet
  như iPhone (§5), để form luôn đủ rộng và không làm mất vị trí
  đang xem trong danh sách.
- Nút thêm job mới (+): giữ ở nav phải như iPhone; trên iPad ngang
  đặt ở đầu cột trái (trên danh sách) để tay không phải với lên xa —
  vị trí cụ thể do người code chọn, miễn là luôn thấy được mà không
  cần cuộn.

### 3.3. Chế độ Lịch bên trong màn Buổi chụp (`#calView`)

Lịch tháng hiện tại là lưới 7 cột hẹp theo chiều rộng iPhone; trên
iPad nó là màn hưởng lợi nhiều thứ hai sau split view.

- **iPad dọc (< 1024px):** lịch tháng chiếm toàn bộ chiều rộng nội
  dung, ô ngày cao tối thiểu `64px` (đủ chỗ cho 2–3 chấm/chip sự
  kiện), danh sách job của ngày đang chọn nằm **bên dưới** lịch
  như iPhone.
- **iPad ngang (≥ 1024px):** chia 2 cột — **lịch tháng bên trái
  (~60%)**, **danh sách job của ngày/tháng đang chọn bên phải
  (~40%, tối thiểu `320px`)**. Ô ngày cao tối thiểu `72px`, tên
  job trong ô ngày hiển thị tối đa 2 dòng rồi cắt gọn (không để
  ô ngày phình to làm vỡ lưới tháng).
- Chuyển tháng, chạm ngày, chạm job trong lịch: hành vi giữ nguyên
  như iPhone; chỉ khác là danh sách ngày đã ở sẵn bên phải nên
  không cần cuộn xuống mới thấy.

## 4. Màn Tiền bạc — bảng tiền / báo cáo hiển thị rộng ra sao

- **iPad dọc (< 1024px):** giữ một cột như iPhone, chỉ nới rộng theo
  `.wrap` `820px`. Bốn ô số liệu (`.tiles`) đã là 4 cột từ breakpoint
  `700px` nên giữ nguyên — không xếp 4 ô thành 1 hàng dài hơn nữa.
- **iPad ngang (≥ 1024px):** chia 2 cột:
  - **Cột trái (~5/12):** 4 ô số liệu xếp thành lưới 2×2 (không xếp
    4 ô trên 1 hàng — ô sẽ quá dẹt, số tiền khó đọc) + mục
    "Lời theo từng job".
  - **Cột phải (~7/12):** "Sổ thu chi" + seg lọc
    (Tất cả / Thu / Chi / Tháng này) + danh sách khoản thu chi.
  - Lý do chia như vậy: sổ thu chi là danh sách dài, cần chiều rộng
    để mỗi hàng hiện đủ ngày + nội dung + job liên quan + số tiền
    trên một hàng; còn các ô số liệu và lời theo job là khối tóm
    tắt, đặt gọn ở cột hẹp vẫn đọc tốt.
- Hàng thu chi trên iPad ngang: một hàng duy nhất gồm ngày (ngắn),
  nội dung, tên job (nếu có), số tiền căn phải — **không** để số
  tiền rớt xuống dòng thứ hai như trên iPhone hẹp. Hàng nào dài
  quá thì cắt gọn nội dung bằng dấu …, chạm vào vẫn xem đủ / xoá
  như hiện tại.
- Báo cáo cuối ngày (đang nằm trong tab Phòng ban, `#dailyReport`):
  giữ một cột, rộng tối đa bằng `.wrap`, **không** chia 2 cột —
  báo cáo là văn bản dài, chia cột sẽ làm câu bị ngắt vụn, khó đọc
  liền mạch. Nút Chép / Chia sẻ báo cáo giữ ngay dưới báo cáo.

## 5. Màn hình nào giữ nguyên như iPhone

| Màn / thành phần | Quyết định | Lý do |
|---|---|---|
| **Hôm nay** (`#view-home`) | Gần như giữ nguyên, chỉ nới rộng theo §2 | Đây là màn mở app mỗi ngày, phải nhận ra ngay. Thay đổi: hero cao hơn một chút (`250px` đã có từ `700px`), `.moments` 3 cột (đã có), ở iPad ngang (`≥ 1024px`) cho phép 4 cột ảnh và xếp 2 khối phụ cạnh nhau — "Hỏi trợ lý" + "Các phòng báo cáo" thành 2 cột — nhưng **thứ tự các khối không đổi**, "Cần nhớ hôm nay" và 4 ô số liệu vẫn ở trên cùng, full chiều rộng. Không chia hero hay danh sách việc hôm nay thành 2 cột (việc cần nhớ là danh sách dọc, đọc từ trên xuống). |
| **Phòng ban** (`#view-depts`) | Giữ nguyên một cột; ở `≥ 1024px` 6 phòng xếp lưới 2 cột | Danh sách 6 phòng vốn là các hàng dọc; xếp 2 cột trên iPad ngang tiết kiệm cuộn mà vẫn nhận ra từng phòng. Báo cáo cuối ngày và các mục Cài đặt / Dữ liệu & sao lưu bên dưới **giữ một cột** như iPhone. |
| **Trợ lý** (`#view-ask`, chat) | **Giữ nguyên hoàn toàn như iPhone** | Bong bóng chat mà giãn rộng sẽ khó đọc (dòng quá dài). Khung chat + ô nhập giữ tối đa `720px`, căn giữa. Composer vẫn neo trên tab bar như hiện tại. |
| **Cài đặt** (sheet) | Giữ dạng sheet, chỉ đổi cách đặt trên màn rộng | Form cài đặt (giá gói, % cọc, bảng giá film, thiết bị, chi cố định…) là form dọc hẹp — kéo rộng sẽ làm nhãn và ô nhập xa nhau, khó quét. Trên iPad: sheet thành **hộp thoại căn giữa, tối đa `680px`**, bo góc cả 4 phía, có khoảng trống xung quanh để thấy được màn hình phía sau; không chiếm toàn màn hình. Nội dung bên trong giữ một cột như iPhone. |
| **Mọi sheet / form khác** (thêm job, ghi thu/chi, nhập từ Lịch iPhone, mẫu tin nhắn, máy tính giá) | Giữ dạng sheet, cùng quy tắc như Cài đặt | Tối đa `680–720px`, căn giữa trên iPad ngang; trên iPad dọc giữ sheet trượt từ dưới lên như iPhone. Không chia form thành 2 cột (nhãn trái – ô nhập phải) — form iPhone vốn là nhãn trên, ô nhập dưới, đổi sang 2 cột sẽ phải kiểm chứng lại toàn bộ nhập liệu. |
| **Màn chào mừng, màn khoá, HUD/toast** | **Giữ nguyên** | Màn chào mừng tối đa `460px` căn giữa; màn khoá tối đa `360px`; toast vẫn ở giữa phía trên. Không nới rộng theo iPad. |
| **Tab bar, nav trên, Large Title, màu sắc, dark mode** | **Giữ nguyên** | Chỉ nới `.tabbar-in` lên `720px` (§1). Không thêm tab, không đổi vị trí tab, không đổi màu nhấn hay nền. |

## 6. Những gì KHÔNG làm trong đợt iPad này

- Không thêm tab, không thêm màn, không thêm tính năng (không Kanban
  kéo thả, không kéo-thả file, không đa cửa sổ, không phím tắt bàn
  phím — iPad chủ yếu dùng cảm ứng; phím tắt là việc riêng, làm sau
  nếu cần).
- Không đổi mô hình dữ liệu, không đổi cách lưu (local-first), không
  đổi luồng Google / Lịch iPhone native.
- Không làm layout kiểu macOS, không ép app thành 2–3 cột ở mọi màn.
- Không thay đổi hành vi trên iPhone: mọi breakpoint iPad chỉ cộng
  thêm, không sửa CSS/JS của layout iPhone hiện tại. Nếu một thay
  đổi làm iPhone khác đi thì phải dừng lại và tách riêng.

## 7. Gợi ý kỹ thuật cho người code sau này (chỉ gợi ý, chưa code)

- Thêm 1 breakpoint `@media (min-width:1024px)` bên cạnh breakpoint
  `700px` đã có; mọi quy tắc iPad nằm trong 2 breakpoint này, không
  rải media query khắp file.
- Split view Buổi chụp: bọc danh sách + chi tiết trong một khung
  2 cột chỉ ở `≥ 1024px`; dưới ngưỡng đó khung trở về 1 cột và chi
  tiết lại mở bằng sheet như cũ. Cần một trạng thái "job đang chọn"
  và trạng thái trống cho cột phải (hiện chưa có trong code iPhone).
- Cột trái danh sách và cột phải chi tiết cuộn độc lập
  (`overflow-y: auto` riêng, chiều cao bằng chiều cao màn hình trừ
  nav/tab bar).
- Kiểm chứng sau khi code (chưa làm trong đợt thiết kế này): iPad
  mini 768, iPad Air 820/834, iPad Pro 1024, 1180/1194, 1366 — cả
  dọc lẫn ngang; Slide Over hẹp (~320–500px) phải về đúng layout
  iPhone; dark mode; chữ to (Dynamic Type) không vỡ hàng thu chi
  1 dòng; xoay màn hình không mất job đang chọn ở cột phải.

## 8. Mức ưu tiên

1. **P0 — iPhone không đổi:** mọi kiểm chứng iPhone hiện tại vẫn đạt.
2. **P1 — iPad dọc:** cột đơn rộng `820px`, không vỡ, không tràn ngang.
3. **P2 — iPad ngang:** split view Buổi chụp + 2 cột Tiền bạc + lịch
   tháng cạnh danh sách ngày.
4. **P3 — tinh chỉnh:** sheet căn giữa, lưới 2 cột cho 6 phòng ban,
   4 cột ảnh ở Hôm nay.
