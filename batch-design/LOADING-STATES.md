# Trạng thái đang tải / Skeleton — FotoBro iOS v1

> Phạm vi: chỉ thiết kế, không sửa code. App thật: `~/workspace/fotobro-ios-v1/www/index.html`
> (single-file, Capacitor 8, Bundle ID `com.fotobro.app`).
> Ngôn ngữ trong app: tiếng Việt. Màu nhấn duy nhất: `#FA2D48`
> (dark mode: `#FF375F`). Nền sáng `#FFFFFF`, nền tối đen thật `#000000`.

## 0. Nguyên tắc chung — đọc trước khi làm từng trạng thái

### 0.1 Local-first: dữ liệu local KHÔNG cần skeleton dài

Hầu hết dữ liệu FotoBro đã có sẵn ngay trên máy, vì:

- Job, thu chi, cài đặt, checklist: đọc đồng bộ từ `localStorage` key
  `troLyXeo.v1` trong lúc khởi động (`renderAll()` chạy ngay, không `await`).
- Lịch Google đã tải: cache trong `localStorage` key `troLyXeo.gcal`
  (kèm `fetchedAt`); Gmail/Danh bạ cũng cache tương tự.
- Ảnh trang chủ / ảnh của bạn: IndexedDB trên máy.
- Màn chào mừng lần đầu (`troLyXeo.welcomed`) là nội dung tĩnh, không tải gì.

**Quy tắc bắt buộc:**

1. **Không bao giờ hiện skeleton toàn màn hình cho dữ liệu local.**
   Render nội dung thật ngay; nếu dữ liệu trống thì hiện trạng thái trống
   thật ("Chưa có job nào", "30 ngày tới chưa có lịch nào") — không hiện
   skeleton rồi mới hiện trống.
2. **Skeleton chỉ dùng khi đang chờ mạng hoặc chờ hệ thống** (Google API,
   EventKit, đọc file sao lưu, đọc ảnh IndexedDB lần đầu). Mà những việc này
   đều có bản cache / bản cũ để hiện trước — xem từng mục dưới.
3. **Không chặn tab bar.** Tab bar 5 tab (Hôm nay · Buổi chụp · Tiền bạc ·
   Phòng ban · Trợ lý) luôn bấm được trong lúc tải. Người dùng được phép
   rời khỏi màn đang tải; khi tải xong, cập nhật ngầm, không kéo họ quay lại.
4. **Không chặn thao tác local.** Trong lúc Google đang đồng bộ, vẫn thêm
   job, ghi tiền, tick checklist bình thường. Đồng bộ chạy nền, xong thì
   `renderAll()` + toast, không khoá màn hình.
5. **Mọi trạng thái tải đều có thời gian tối đa và lối thoát.** Quá 3 giây
   là phải có fallback (xem §0.4). Không có spinner quay vô hạn.
6. **Không hiện skeleton khi tải nhanh hơn 200 ms.** Đợi 200 ms mới hiện
   skeleton/spinner — tránh nhấp nháy khi mạng nhanh. (Ngoại lệ: lần mở
   app đầu tiên, xem §1 — dùng launch screen của iOS, không phải skeleton
   trong webview.)

### 0.2 Khi nào dùng skeleton, khi nào dùng spinner

| Tình huống | Dùng gì | Vì sao |
|---|---|---|
| Đang tải **danh sách có hình dạng biết trước** (dòng ngày, job, khoản tiền, sự kiện lịch) | **Skeleton** theo đúng hình dạng màn đó | Người dùng đoán được bố cục sắp hiện; cảm giác nhanh hơn spinner |
| Đang chờ **một việc không có danh sách** (xin quyền Lịch, đọc file sao lưu, đăng nhập Google, ghi sự kiện lên Google Lịch) | **Spinner** nhỏ + 1 dòng chữ | Không có gì để "phác" trước; spinner nói rõ "đang làm việc gì đó" |
| Đang tải **1 ảnh** (hero, ảnh "Ảnh của bạn") | **Khối màu nền** (`--fill`), không skeleton nhấp nháy | Ảnh chỉ có 1 khung; giữ khung đúng kích thước, ảnh về thì fade-in |
| Tải nền / làm mới (kéo làm mới, `gFetch(false)`, đồng bộ sau khi mở app) | **Không skeleton, không spinner toàn màn** — chỉ dòng trạng thái nhỏ + spinner 16 px trong header của khối đó | Dữ liệu cũ vẫn đang hiện; không được giật màn hình |

### 0.3 Hình thức skeleton (dùng chung cho mọi màn)

- **Màu:** khối skeleton dùng `--fill` (sáng `#F2F2F7`, tối `#2C2C2E`);
  dòng chữ skeleton là bo tròn 8 px trên nền đó. **Không dùng màu xám
  hard-code** — phải đổi theo dark mode.
- **Hiệu ứng:** shimmer nhẹ (gradient trắng/đen 6% chạy ngang, 1,2 s/vòng).
  Tôn trọng `prefers-reduced-motion`: tắt shimmer, chỉ hiện khối tĩnh.
  (App đã có sẵn quy tắc tắt animation khi giảm chuyển động — skeleton
  theo cùng quy tắc đó.)
- **Bo góc:** skeleton bắt chước đúng bo góc của thành phần thật —
  thẻ/list `border-radius: 18–20 px`, ảnh hero `20 px`, nút/chip dạng viên
  (`pill`). Không dùng hình chữ nhật thô cho mọi thứ.
- **Số lượng:** tối đa 3–5 khối skeleton mỗi màn (đủ gợi bố cục, không
  vẽ cả trang dài). Skeleton **không được dài hơn nội dung thật thường có**.
- **Chữ:** skeleton không chứa chữ thật, không chứa số tiền giả.
  Không bao giờ để skeleton mang nội dung giả gây hiểu nhầm là dữ liệu thật.
- **Spinner:** dùng spinner hệ thống iOS (`UIActivityIndicatorView` qua
  Capacitor, hoặc CSS spinner 20 px, màu `--accent` `#FA2D48`).
  Không dùng spinner tự vẽ to, không dùng GIF.

### 0.4 Quy tắc "quá 3 giây" — áp cho mọi trạng thái

| Mốc | Hành động |
|---|---|
| 0–200 ms | Chưa hiện gì. Nếu xong trong khoảng này thì không ai thấy trạng thái tải. |
| 200 ms – 3 s | Hiện skeleton/spinner theo thiết kế của từng mục. |
| **> 3 s** | **Fallback bắt buộc:** (1) hiện nội dung cache / nội dung cũ nếu có; (2) nếu không có cache, hiện trạng thái trống + dòng lỗi ngắn + nút **Thử lại**; (3) spinner/skeleton biến mất — không bao giờ để quay tiếp vô hạn. |
| > 10 s (tác vụ nền) | Huỷ ngầm, giữ dữ liệu cũ, hiện toast 1 lần: "Chưa đồng bộ được — đang xem bản đã lưu". Không hiện lại toast mỗi lần thử. |
| Mất mạng (`navigator.onLine === false`) | Không chờ đủ 3 s: hiện ngay bản cache + dòng "Đang mất mạng — đang xem bản đã lưu". Nút Thử lại chỉ bật khi có mạng lại. |

### 0.5 Trạng thái hiện tại của app (để người làm sau khỏi làm lại)

Kiểm tra trên `www/index.html` ngày 20/11/2026: app **chưa có skeleton
hay spinner nào**. Hiện chỉ có:

- Tab Buổi chụp → Lịch: chữ "Đang tải lịch…" + nút "Làm mới" bị `disabled`
  khi `gState.loading` (`renderCal()` / `gFetch()`).
- Sheet nhập Lịch iPhone: 1 dòng chữ "Đang đọc Lịch iPhone…" trong
  `#calResult` (`importFromNativeCalendar()`), không spinner, không skeleton.
- Mở/khôi phục sao lưu: đọc file rồi hỏi xác nhận bằng action sheet, không
  có chỉ báo tải; lỗi chỉ báo bằng toast.
- Ảnh hero: `<img src="icon.svg">` mặc định, đổi ảnh theo ngày qua
  `heroPin()` + IndexedDB; chưa có placeholder/fade-in riêng.

Nghĩa là file này là thiết kế mới hoàn toàn, không phải mô tả cái đã có.
Khi triển khai, giữ nguyên các chuỗi tiếng Việt hiện có ("Đang tải lịch…",
"Đang đọc Lịch iPhone…") để người dùng cũ không bị lạ.

---

## 1. Mở app lần đầu

### Bối cảnh thật trong app

- Lần đầu: `localStorage` chưa có `troLyXeo.v1` → app tạo dữ liệu mẫu
  (`state.sample = true`, job + thu chi mẫu), rồi sau 250 ms hiện màn chào
  mừng (`openWelcome()`, cờ `troLyXeo.welcomed`).
- Lần sau: đọc `troLyXeo.v1` đồng bộ, render tab Hôm nay ngay.
- Khóa app (Face ID/PIN, `troLyXeo.lock`) hiện trước cả nội dung.
- Cả hai trường hợp đều **không có gọi mạng bắt buộc** trước khi hiện màn
  Hôm nay. Google chỉ đồng bộ nền sau đó (xem §2).

### Thiết kế

| Hạng mục | Thiết kế |
|---|---|
| Skeleton hay spinner | **Không dùng cả hai trong webview.** Dùng **launch screen native của iOS** (storyboard/xib trong `ios/`, logo FotoBro trên nền trắng/đen theo hệ thống) trong lúc Capacitor khởi động webview. Khi webview sẵn sàng, nội dung thật hiện ngay — không có khoảng trống cần lấp. |
| Hình dạng skeleton | Không có. Màn Hôm nay render 1 lần từ dữ liệu local: Large Title "Chào *bạn*", "Cần nhớ hôm nay" (`#todayList`), 4 ô thống kê (`#homeStats`), hero, "Các phòng báo cáo", "Ảnh của bạn". |
| Thời gian tối đa | Webview phải hiện nội dung **≤ 600 ms** sau khi launch screen biến mất (đọc + parse `localStorage` là đồng bộ, dưới 50 ms trên máy thật với dữ liệu thường). Nếu quá 600 ms thì đó là lỗi hiệu năng, không phải chuyện skeleton — phải sửa code khởi động, không đắp skeleton lên. |
| Fallback > 3 s | Không áp dụng skeleton. Nếu webview trắng > 3 s: đó là lỗi khởi động (thường do file `index.html` lỗi hoặc Capacitor chưa nạp xong) — hiện màn lỗi tĩnh của iOS, không tự thử render lại trong vòng lặp. Ghi log lỗi để sửa ở bản sau. |

### Lưu ý riêng

- **Dữ liệu mẫu không phải trạng thái tải.** Banner cam "Đang xem dữ liệu
  mẫu" + nút "Dùng thật — xoá dữ liệu mẫu" hiện cùng lúc với nội dung thật,
  không thay thế skeleton.
- **Màn chào mừng không có skeleton.** Nó là sheet tĩnh (hướng dẫn + nút
  "Nhập từ Lịch iPhone" / "Đăng nhập Google"); các nút này dẫn sang §2, §3.
- **Ảnh hero lần đầu:** ảnh mặc định `icon.svg` đã nằm sẵn trong app, hiện
  ngay — không chờ IndexedDB (xem §5).

---

## 2. Đồng bộ Google (Lịch / Gmail / Drive)

### Bối cảnh thật trong app

- Nút "Kết nối Google" → `gConnect()` (OAuth, chuyển sang Google rồi quay
  lại app) → `gSyncAll(true)` / `gFetch(false)`.
- `gFetch()`: gọi `calendarList` (tối đa 50 lịch) rồi tối đa 12 lịch đã chọn,
  mỗi lịch tối đa 250 sự kiện, khoảng -7 → +62 ngày; lưu cache `troLyXeo.gcal`
  (`fetchedAt`). Tab Lịch tự làm mới nếu cache cũ hơn 10 phút.
- Gmail gợi ý tiền về/khách hỏi (`gmFetch()`), Drive chỉ lấy tên thư mục —
  cùng cơ chế: có cache thì hiện cache, tải nền.
- Lỗi hiện tại: `gState.error` = "Đang mất mạng — đang xem lịch đã lưu
  lần trước." hoặc "Chưa tải được lịch (…)", token hết hạn sau 1 giờ thì
  hiện "Kết nối đã hết hạn — đang xem bản đã lưu."

### Thiết kế

| Hạng mục | Thiết kế |
|---|---|
| Skeleton hay spinner | **Skeleton cho tab Lịch; spinner nhỏ cho các chỗ khác.** |
| Hình dạng skeleton — tab Buổi chụp → Lịch (`#calView`) | **Chỉ dùng khi chưa có cache nào** (lần đầu kết nối xong, `gcal` còn trống): 3 nhóm ngày, mỗi nhóm gồm: 1 dòng tiêu đề ngày (skeleton dài ~120 px, cao 13 px) + 2 hàng sự kiện, mỗi hàng = ô icon tròn 36 px + 2 dòng chữ (dòng 1 dài ~70% chiều rộng, dòng 2 ~45%). Giữ đúng bố cục `.list` + `.row` thật. **Nếu đã có cache: không skeleton** — hiện lịch cũ + dòng "Google Lịch · cập nhật X phút trước" + spinner 16 px cạnh dòng đó trong lúc tải nền. |
| Hình dạng — Gmail gợi ý (`#gmBank`, `#gmLeads`) | Không skeleton riêng. Khối gợi ý hiện sau khi có dữ liệu; lúc đang tải, khối đó thu gọn thành 1 hàng "Đang kiểm tra Gmail…" + spinner 16 px. Không vẽ skeleton tiền bạc giả — số tiền không được "phác". |
| Hình dạng — Drive (chọn thư mục trong form job) | Spinner trong nút "Chọn thư mục từ Google Drive" (nút `disabled` + spinner, chữ đổi thành "Đang mở Drive…"). Không skeleton danh sách thư mục. |
| Thời gian tối đa | Skeleton tab Lịch: **tối đa 3 s**. Đồng bộ nền (đã có cache): không giới hạn hiển thị vì không chặn gì, nhưng phải xong hoặc báo lỗi trong **10 s** (xem §0.4). |
| Fallback > 3 s | Skeleton biến mất, thay bằng **bản cache cũ nhất** (nếu có) + dòng đỏ `gState.error` + nút **Thử lại** (gọi lại `gFetch(true)`). Nếu chưa từng có cache: hiện trạng thái trống của tab Lịch (icon lịch + "Chưa tải được lịch" + nút **Thử lại** + link "Mở Google Lịch"). **Không giữ skeleton quá 3 s, không thử lại tự động quá 2 lần.** Token hết hạn: không skeleton — hiện nút "Kết nối lại" như hiện tại. |

### Lưu ý riêng

- Nút "Làm mới" (`#gRefresh`) trong lúc tải: `disabled` + spinner thay chữ
  (đã có `disabled`, chỉ thêm spinner) — tránh bấm đúp gọi API 2 lần.
- Đồng bộ sau khi mở app (`gFetch(false)` lúc vào tab Lịch): **luôn là tải
  nền**, không skeleton dù cache cũ — người dùng đang xem lịch cũ, không
  được giật màn hình.
- Khi ghi 1 buổi chụp lên Google Lịch (`calw`): spinner trong nút
  "Thêm vào Google Lịch" / "Cập nhật trên Google Lịch" + toast kết quả;
  không skeleton, không khoá cả sheet.

---

## 3. Nhập Lịch iPhone (EventKit, native)

### Bối cảnh thật trong app

- Mở từ Phòng ban → "Nhập từ Lịch iPhone" hoặc màn chào mừng →
  `openCalImport()`: sheet cao (`tall`), nút "Nhập từ Lịch iPhone".
- Trên app iOS thật, sheet tự gọi `importFromNativeCalendar()` sau 350 ms:
  `checkPermissions()` → `requestPermissions()` (nếu chưa cấp) →
  `findEvents({ startDate: now, endDate: now + 30 ngày })` → lọc trùng,
  tick sẵn sự kiện chưa có + không lặp lại → `renderCalList()` (danh sách
  chọn + nút "Nạp N" ở header sheet).
- Hiện tại lúc chờ chỉ có 1 dòng chữ "Đang đọc Lịch iPhone…" trong
  `#calResult`; nếu từ chối quyền thì toast + `#calResult` trống.

### Thiết kế

| Hạng mục | Thiết kế |
|---|---|
| Skeleton hay spinner | **Spinner + skeleton danh sách trong sheet.** Spinner đặt cạnh dòng "Đang đọc Lịch iPhone…"; skeleton vẽ trước danh sách sẽ hiện. |
| Hình dạng skeleton — trong `#calResult` | 4 hàng sự kiện, mỗi hàng đúng bố cục `.row` thật: ô checkbox tròn 28 px bên trái + 2 dòng chữ (dòng 1: tên khách, dài ~60%; dòng 2: ngày · giờ · loại chụp, dài ~40%) + khoảng trống bên phải cho nhãn "Đã có"/"Lặp lại". Phía trên skeleton: thanh `seg` 3 nút (Sắp tới / Từ 2 tháng trước / Tất cả) hiện ở dạng skeleton viên (3 viên xám, không bấm được). Nút header "Nạp" của sheet **ẩn** trong lúc tải (đã ẩn sẵn bằng `visibility:hidden` — giữ nguyên). |
| Thời gian tối đa | Skeleton + spinner: **tối đa 3 s**. `findEvents` 30 ngày thường xong < 1 s; xin quyền hệ thống là do người dùng bấm, không tính vào 3 s này. |
| Fallback > 3 s | Skeleton biến mất, `#calResult` hiện 1 trong 3 trạng thái (không spinner quay tiếp): (a) **Chưa cấp quyền:** "FotoBro chưa được đọc Lịch iPhone" + nút "Mở Cài đặt iPhone" (deep link `App-Prefs:`) + nút "Thử lại"; (b) **Lỗi đọc lịch:** "Chưa đọc được Lịch iPhone (…)" + nút **Thử lại**; (c) **Không có sự kiện:** giữ câu hiện tại "Chưa có sự kiện nào trong 30 ngày tới." (đây là kết quả thật, không phải lỗi — không có nút Thử lại, chỉ có nút đóng sheet). Trong mọi trường hợp, nút "Nhập từ Lịch iPhone" vẫn bấm lại được. |

### Lưu ý riêng

- **Giai đoạn xin quyền không dùng skeleton.** Hộp thoại quyền là của iOS,
  app không kiểm soát được; trong lúc chờ người dùng chọn Cho phép/Từ chối,
  sheet giữ nguyên dòng "Đang chờ bạn cho phép…" + spinner nhỏ, không vẽ
  danh sách giả.
- **Lúc bấm "Nạp":** không skeleton. Nạp là ghi local đồng bộ (vài chục
  job), xong ngay → đóng sheet, sang tab Buổi chụp + `celebrate()`. Nếu
  nạp > 200 ms (rất nhiều sự kiện, tối đa 400 hàng), nút "Nạp" hiện spinner
  + `disabled` tới khi xong.
- Trên bản web (không phải app iOS, `isNativeCalendar()` = false): không
  skeleton — hiện ngay dòng hướng dẫn "Nhập lịch chỉ có trong app iOS…"
  + nút "Đăng nhập Google" như hiện tại.

---

## 4. Khôi phục sao lưu (mở file JSON)

### Bối cảnh thật trong app

- Phòng ban → "Dữ liệu & sao lưu": "Tải bản sao lưu" (xuất JSON: jobs +
  txs + cfg, tải về máy) và "Mở bản sao lưu" (`<input type="file"
  accept=".json">` → đọc file → kiểm tra `Array.isArray(d.jobs) &&
  Array.isArray(d.txs)` → action sheet "Thay bằng bản sao lưu" →
  thay toàn bộ state, `renderAll()`, toast "Đã mở lại bản sao lưu").
- File lỗi: toast "File này không giống bản sao lưu của FotoBro" hoặc
  "Chưa đọc được file này, bạn thử lại nha". Dữ liệu cũ **không bị xoá**
  nếu file lỗi (chỉ thay sau khi người dùng bấm xác nhận).
- "Xoá toàn bộ dữ liệu" (`wipeAll()`): xoá key local + thu hồi token Google,
  rồi tải lại trang — cũng thuộc nhóm "khôi phục/xoá", xem lưu ý cuối mục.

### Thiết kế

| Hạng mục | Thiết kế |
|---|---|
| Skeleton hay spinner | **Spinner, không skeleton.** Khôi phục không có danh sách để phác; việc nặng nhất là đọc + kiểm tra file (nhanh, local). |
| Hình dạng | Spinner 20 px đặt trong chính hàng "Mở bản sao lưu" (icon upload → spinner, hàng `disabled` trong lúc đọc) + dòng trạng thái nhỏ dưới hàng đó: "Đang đọc bản sao lưu…". Không mở sheet trống, không skeleton toàn màn Phòng ban. |
| Thời gian tối đa | Spinner: **tối đa 3 s**. File JSON của app thường < 1 MB, đọc + `JSON.parse` + kiểm tra xong trong < 300 ms. |
| Fallback > 3 s | Dừng đọc, spinner biến mất, hàng "Mở bản sao lưu" bấm lại được, toast: "File này đọc lâu quá — thử lại hoặc kiểm tra file còn nguyên vẹn không". **Dữ liệu hiện tại giữ nguyên 100%.** Không bao giờ xoá hay thay state khi chưa đọc xong + chưa được xác nhận. Nếu file sai định dạng: giữ toast hiện tại ("File này không giống bản sao lưu của FotoBro") + không hiện thêm skeleton. |

### Lưu ý riêng

- **Xuất sao lưu ("Tải bản sao lưu"):** không spinner dài. Tạo file JSON
  là đồng bộ, xong ngay → toast "Đã tải bản sao lưu về máy". Nếu tạo file
  > 200 ms thì nút hiện spinner tới khi trình duyệt nhận file.
- **Action sheet xác nhận là bắt buộc, không thay bằng tự động.**
  Người dùng phải thấy "Thay bằng bản sao lưu" + biết dữ liệu cũ sẽ mất
  trước khi bấm — skeleton/spinner không được che bước này.
- **"Xoá toàn bộ dữ liệu":** không skeleton; sau khi xác nhận, hiện màn
  trắng + spinner toàn màn tối đa 2 s trong lúc thu hồi token + tải lại
  trang (đây là lần duy nhất trong app được dùng spinner toàn màn, vì
  trang đang tải lại thật).

---

## 5. Tải ảnh trang chủ (hero + "Ảnh của bạn")

### Bối cảnh thật trong app

- Hero (`#heroLink`, cao 190 px, iPad 250 px, bo 20 px): ảnh mặc định
  `icon.svg` có sẵn trong app; mỗi ngày chọn 1 ảnh trong "Ảnh của bạn"
  (hoặc ảnh ghim `troLyXeo.heroPin`) làm ảnh hôm nay, caption 2 dòng
  phủ gradient dưới ảnh.
- "Ảnh của bạn" (`#myShots`, lưới `moments`): ảnh thêm từ máy, thu nhỏ
  ~1400 px, lưu IndexedDB; chạm để đặt làm ảnh hôm nay / xoá.
- Ảnh Instagram (`#igShots`): chỉ là link mở bài gốc, không tải ảnh về —
  không thuộc phạm vi mục này.

### Thiết kế

| Hạng mục | Thiết kế |
|---|---|
| Skeleton hay spinner | **Không skeleton, không spinner. Chỉ khối màu nền + fade-in.** Ảnh là nội dung trang trí, không phải dữ liệu; không được để khung ảnh nhấp nháy skeleton mỗi sáng. |
| Hình dạng | Khung hero giữ đúng kích thước thật ngay từ đầu (190 px / 250 px iPad), nền `--fill`, caption vẫn hiện (chữ trắng trên gradient — đọc được cả khi chưa có ảnh). Ảnh về thì `opacity` 0 → 1 trong 300 ms (`transition` đã có sẵn trong CSS). Lưới "Ảnh của bạn": mỗi ô giữ đúng tỉ lệ, nền `--fill`; ảnh về tới đâu fade-in tới đó, không chờ tất cả. |
| Thời gian tối đa | Ảnh từ IndexedDB (local) phải hiện **≤ 300 ms**. Không có khái niệm "tối đa 3 s" cho ảnh local — nếu quá 300 ms thì đó là lỗi đọc IndexedDB, xem fallback. Ảnh mặc định `icon.svg` luôn có sẵn nên hero **không bao giờ trống**. |
| Fallback > 3 s | Không chờ 3 s. Quy tắc: (a) nếu ảnh hôm nay chưa đọc được sau **1 s**, giữ ảnh mặc định `icon.svg` + caption như cũ — người dùng không thấy lỗi; (b) nếu ảnh trong "Ảnh của bạn" lỗi từng cái, ô đó hiện nền `--fill` + icon ảnh mờ, các ảnh khác vẫn hiện; (c) nếu IndexedDB lỗi hẳn, hiện dòng nhỏ dưới lưới ảnh: "Chưa tải được ảnh đã lưu trên máy này — thử mở lại app" + không chặn các phần khác của tab Hôm nay. **Không bao giờ hiện khung hero trống đen/trắng.**

### Lưu ý riêng

- **Không dùng skeleton cho ảnh mỗi lần đổi tab.** Tab Hôm nay render lại
  khi quay về từ tab khác — ảnh đã có trong bộ nhớ thì hiện ngay, không
  fade-in lại từ đầu (chỉ fade-in lần đầu tiên trong phiên mở app).
- Thêm ảnh mới từ máy (`#myShotFile`): lúc thu nhỏ + lưu IndexedDB, ô ảnh
  mới hiện ngay ở dạng nền `--fill` + spinner 16 px giữa ô, tối đa 3 s;
  quá 3 s thì ô biến mất + toast "Chưa lưu được ảnh này, thử lại nha".

---

## 6. Những gì KHÔNG làm (để khỏi hiểu nhầm khi triển khai)

1. Không thêm skeleton cho: chuyển tab (render local tức thì), mở sheet
   form job / ghi thu chi, tick checklist, hỏi Trợ lý (chat dùng bong bóng
   "… đang trả lời" đã có, không phải skeleton), tìm kiếm/lọc trong app.
2. Không dùng skeleton toàn màn hình ở bất cứ đâu trong app — kể cả lúc
   mất mạng. Mất mạng thì hiện cache + dòng báo, không phải màn hình xám.
3. Không tự thử lại quá 2 lần cho cùng 1 tác vụ; lần thử lại phải do người
   dùng bấm (trừ đồng bộ nền sau khi mở app, tối đa 1 lần tự thử lại sau
   30 s nếu lần đầu lỗi mạng).
4. Không để skeleton/spinner che nút đóng sheet, nút Huỷ, hay tab bar.
5. Không ghi đè dữ liệu local bằng "trống" trong lúc đang tải: danh sách
   job/tiền đang hiện phải ở yên cho tới khi dữ liệu mới về và kiểm tra xong.

## 7. Checklist nghiệm thu (cho người triển khai + người test)

- [ ] Tắt mạng (chế độ máy bay) → mở app: tab Hôm nay hiện ngay, không
      skeleton; tab Lịch hiện cache + "Đang mất mạng — đang xem bản đã lưu".
- [ ] Lần đầu kết nối Google xong → tab Lịch: skeleton 3 nhóm ngày, biến
      mất ≤ 3 s, sau đó là danh sách thật hoặc trạng thái trống + Thử lại.
- [ ] Mở sheet nhập Lịch iPhone trên iPhone thật: skeleton 4 hàng ≤ 3 s,
      rồi danh sách chọn; từ chối quyền → hướng dẫn mở Cài đặt, không kẹt.
- [ ] Mở file sao lưu sai định dạng: toast lỗi, dữ liệu cũ còn nguyên,
      không skeleton, không mất job nào.
- [ ] Ảnh hero: mở app buổi sáng, ảnh hôm nay fade-in ≤ 300 ms; xoá hết
      ảnh trong IndexedDB → hero vẫn hiện `icon.svg` + caption, không trống.
- [ ] Bật `prefers-reduced-motion` (Cài đặt iPhone → Trợ lý tiếp cận):
      shimmer tắt, skeleton hiện dạng tĩnh.
- [ ] Dark mode: skeleton dùng `--fill` tối `#2C2C2E`, không còn khối xám
      sáng lạc lõng trên nền đen.
- [ ] Trong lúc Google đang đồng bộ: vẫn thêm job / ghi tiền được, tab bar
      bấm được, không bị khoá màn hình.
