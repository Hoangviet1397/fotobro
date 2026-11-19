# FotoBro v1.1 — Thiết kế bảng Kanban kéo thả

> **Trạng thái: CHỈ LÀ THIẾT KẾ — chưa code, chưa sửa app.**
> Ngày viết: 20/11/2026. Base đối chiếu: FotoBro iOS v1.0 trong
> `~/workspace/fotobro-ios-v1/www/index.html` (~338 KB, 3.860 dòng).
> Việt đã chốt **KHÔNG làm Kanban ở v1** (`CHANGELOG-v1.0.md`: "bảng Kanban
> kéo thả — không làm ở v1 (để sau)"; `README.md` § "Chưa có ở v1").
> File này thiết kế cho **v1.1**, để agent code v1.1 làm theo — không tự ý
> đổi pipeline, không tự ý đổi logic tiền / xác nhận đã có ở v1.

## 0. Nguyên tắc — cái gì KHÔNG được đổi

| Hạng mục | Giữ nguyên ở v1.1 |
|---|---|
| Pipeline | Đúng 8 bước, đúng thứ tự, đúng tên: `STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']` (`www/index.html:781`). Không thêm bước, không đổi tên, không gộp bước thành "giai đoạn" trên dữ liệu — gộp chỉ là cách hiển thị (xem §1, và quyết định là **không gộp**). |
| Trạng thái Huỷ | Không phải bước thứ 9. Job huỷ là cờ riêng: `j.cancelled = true`, `j.cancelledFrom = <bước lúc huỷ>` (`index.html:1502–1505`); khôi phục về đúng `'Tư vấn'` + `stageSince = hôm nay` (`index.html:1507`). |
| Logic chuyển bước | Mọi lần đổi bước — dù chạm, nhảy, hay kéo thả — đều phải đi qua **cùng một hàm** `setStage(j, target, opts)` (`index.html:1462–1485`) và `jumpToStage(id, ti)` (`index.html:1487–1497`). Không viết đường đổi bước thứ hai. |
| Dữ liệu | Không thêm field mới vào job. Kanban chỉ đọc field đã có: `client, type, medium, stage, cancelled, cancelledFrom, stageSince, shootDate, shootTime, location, deadline, price` + tiền từ `state.txs` qua `jobThu/jobChi/jobOwe`. Lưu vẫn 1 JSON key `troLyXeo.v1` (`index.html:901–910`). Trạng thái riêng của bảng (đang mở bảng hay danh sách, cột đang cuộn tới đâu, cột nào thu gọn) chỉ giữ **trong bộ nhớ**, không ghi vào `troLyXeo.v1` — tránh phình quota 5 MB đã cảnh báo trong `PERFORMANCE.md` §3. |
| Mặc định | Mở màn Buổi chụp vẫn là **Danh sách** như v1. Kanban là chế độ xem thêm, không thay màn mặc định. |

## 1. Bố cục bảng — quyết định: 8 cột, cuộn ngang, không gộp cột

### 1.1 Vì sao không gộp cột

Đã cân nhắc gộp 8 bước thành 4 nhóm (VD: Tư vấn–Chốt cọc / Sắp chụp–Đã chụp /
Chọn ảnh–Hậu kỳ / Đã giao–Xong) để vừa màn hình. **Bác phương án này**, vì:

- Gộp cột làm mất tương ứng 1–1 giữa cột và bước: kéo thả vào nhóm thì app
  vẫn phải hỏi "vào bước nào trong nhóm", tức thêm 1 chạm — mất đúng lợi ích
  của kéo thả (1 thao tác xong).
- Các móc tiền gắn theo **bước**, không theo nhóm: `setStage` mở form ghi cọc
  khi tới đúng `'Chốt cọc'`, nhắc thu nốt + gợi ý email khi tới đúng
  `'Đã giao'` (`index.html:1473–1484`). Gộp cột làm các móc này mơ hồ.
- Người dùng đã quen 8 bước từ thanh tiến độ `stepsBar` và chip lọc
  `renderStageChips` (8 chip + Tất cả + Đã huỷ, `index.html:1344–1351`).
  Bảng phải nói cùng một ngôn ngữ với 2 chỗ đó.

### 1.2 Bố cục đã chốt

- **8 cột, mỗi cột = 1 bước, xếp ngang, cuộn ngang.** Cột cuối cùng là
  `Xong`. Không có cột `Đã huỷ` trên bảng (xem §5).
- Vị trí: màn **Buổi chụp** (`#view-jobs`), thêm nút thứ ba vào đoạn chọn
  chế độ đã có (`#jobsSeg`, hiện có 2 nút `Danh sách` / `Lịch`,
  `index.html:600`):
  `Danh sách | Lịch | Bảng`. Chạm `Bảng` thì ẩn `#jobList` + `#stageChips`
  + `#calView`, hiện `#kanbanView`. Chạm lại `Danh sách`/`Lịch` thì về như v1.
  Các phần dưới bảng trong màn Buổi chụp (Chuẩn bị đồ, `index.html:607–620`)
  giữ nguyên, nằm dưới bảng.
- Kích thước cột (iPhone):
  - Rộng cột **272px**, khe giữa các cột **12px**, lề ngoài 16px (khớp
    `.wrap` padding 16px, `index.html:89–90`).
  - Trên iPhone 390px: thấy trọn 1 cột + ló ~90px của cột kế — người dùng
    nhìn là biết còn cột bên phải để cuộn. Trên iPhone SE 375px: thấy 1 cột
    + ló ~75px, vẫn đủ tín hiệu. Trên iPad / xoay ngang: thấy 2–3 cột, cùng
    một luật cuộn, không làm layout riêng.
  - Cuộn ngang có **snap theo cột** (dừng đúng đầu cột, không dừng lưng
    chừng) và thanh chỉ vị trí: tên 8 bước thu nhỏ ở trên bảng, cột đang xem
    được tô màu nhấn — chạm vào tên bước thì cuộn tới cột đó (đường tắt cho
    người không muốn vuốt nhiều).
- Đầu cột (sticky trong cột, không trôi khi cuộn dọc thẻ trong cột):
  - Tên bước (VD "Chốt cọc") + **số lượng job** trong cột (số này phải khớp
    số trên chip lọc `renderStageChips` ở chế độ Danh sách — cùng một phép
    đếm: job chưa huỷ, `stage === <bước>`).
  - Màu đầu cột tái dùng màu tag đã có ở `stageTag` (`index.html:1039–1044`):
    Tư vấn/Chốt cọc xám, Sắp chụp cam, Đã chụp–Đã giao tím, Xong xanh lá.
    Màu chỉ là phụ — tên bước + số lượng là thông tin chính (không báo trạng
    thái chỉ bằng màu, xem §7).
  - Cột `Xong` thêm nút thu gọn/mở rộng (xem §1.3).
- Cuộn dọc: mỗi cột cuộn dọc độc lập (danh sách thẻ trong cột), trang không
  cuộn dọc chung khi đang ở chế độ Bảng — tránh xung đột vuốt dọc trang /
  vuốt dọc cột / kéo ngang thẻ. Tab bar dưới (`--tabh:50px`) và nav trên giữ
  nguyên như mọi màn khác.
- Chế độ tối: cột/thẻ dùng đúng biến màu đã có (`--surface`, `--fill`,
  `--sep`, `--label`, `--label2`, `--accent:#FA2D48` sáng / `#FF375F` tối,
  `index.html:40–60`). Không đặt màu cứng mới.

### 1.3 Cột `Xong` — hiển thị có giới hạn

- Job đã xong vẫn nằm ở cột `Xong` (không tự ẩn — người dùng cần thấy mình
  vừa xong job nào), nhưng cột này **mặc định chỉ hiện 10 job xong gần nhất**
  (sắp xếp theo `stageSince` mới nhất trước — ngày xong job), kèm nút
  "Xem thêm N job đã xong" ở cuối cột để mở hết.
- Thêm công tắc nhỏ ở đầu bảng: **"Ẩn job đã xong"** (mặc định TẮT — tức
  vẫn hiện). Bật thì cột `Xong` thu lại thành 1 dòng "Đã xong (N) — chạm để
  mở". Công tắc này chỉ là hiển thị, không xoá dữ liệu, không đổi `stage`.

## 2. Thẻ job trên bảng — hiện gì, không hiện gì

Thẻ là phiên bản gọn của `jobRow` đã có (`index.html:1353–1359`), không phải
thiết kế mới hoàn toàn. Mỗi thẻ hiện đúng 5 nhóm thông tin, theo thứ tự:

| # | Nội dung | Nguồn v1 (tái dùng) | Ghi chú hiển thị |
|---|---|---|---|
| 1 | **Tên khách** — 1 dòng, cắt `…` nếu dài | `j.client` (như `jobRow`) | Chữ 17px semibold, giống `.t1`. Đây là dòng to nhất trên thẻ. |
| 2 | **Loại job + hình thức** | `jobTypeLabel(j)` (`index.html:785`): VD "Wedding — Film", "Portrait" (Digital thì không ghi thêm) | Chữ 14px, màu `--label2`, giống `.t2`. |
| 3 | **Ngày + giờ chụp** | `fmtRel(j.shootDate)` + `j.shootTime` (`index.html:980–986`): VD "T7, 22/11 · 08:00"; chưa hẹn thì "Chưa hẹn ngày" | Nếu đã qua ngày chụp mà chưa tới `Đã chụp` thì dòng này đỏ + kèm cảnh báo ở dòng 5. |
| 4 | **Tiền còn thiếu** — chỉ hiện khi `jobOwe(j) > 0` và chưa `Xong` | `jobOwe(j) = max(0, price − jobThu)` (`index.html:1017`); hiển thị gọn `fmtTiny` như `jobRow` ("còn 2,5tr"), bấm vào thẻ mới thấy số đầy đủ `fmt` trong chi tiết | Màu đỏ + chữ "còn …" (không chỉ tô màu số). `jobOwe == 0` thì **không hiện dòng này** — thẻ đã gọn, và trạng thái "Đã thu đủ" chỉ hiện trong chi tiết job. |
| 5 | **Cảnh báo kẹt / trễ hạn** — chỉ hiện khi có | `stuckInfo(j)` (`index.html:1021–1035`) + `isLate(j)` (`index.html:1019`) | 1 dòng, có icon ⏰ + chữ, VD "Kẹt 9 ngày ở bước Hậu kỳ" / "Đã quá hạn giao 2 ngày". Lý do đầy đủ (`st.reason`) hiện khi mở chi tiết job (`jobDetailHTML`, `index.html:1395–1398`) — trên thẻ chỉ hiện bản rút gọn 1 dòng, không hiện cả câu dài. Job kẹt **luôn xếp lên đầu cột** (xem §2.1). |

**Không hiện trên thẻ:** số điện thoại, email, địa điểm chi tiết, ghi chú,
tiền đã thu/đã chi/lời, link Drive/Facebook — tất cả đã có trong chi tiết job
(`jobDetailHTML`, `index.html:1391–1436`), chạm thẻ là mở ra. Thẻ Kanban phải
đọc được trong 1 giây: tối đa 5 dòng, không cuộn trong thẻ.

### 2.1 Thứ tự thẻ trong một cột

Tái dùng đúng luật `sortJobs` đã có (`index.html:1360–1369`), áp cho từng cột:

1. Job kẹt (`isStuck`) lên trước.
2. Rồi tới ngày chụp sắp tới trước (ngày chụp đã qua xếp sau — nhưng nhóm
   "đã qua ngày chụp mà chưa tới Đã chụp" đã bị `stuckInfo` bắt lên đầu).
3. Job chưa có ngày chụp xếp cuối cột.

Không thêm luật sắp xếp mới (không xếp theo tiền thiếu, không xếp theo tên).

### 2.2 Thẻ trống / cột trống

- Cột không có job: hiện dòng mờ "Chưa có job ở bước này" + **không phải
  vùng thả rỗng vô hình** — vùng thả của cột trống vẫn nhận thẻ kéo tới
  (chiều cao tối thiểu của vùng thả = 120px, xem §3.3).
- Bảng không có job nào (sổ trống): hiện đúng empty-state của `renderJobs`
  ("Chưa có buổi chụp nào — Có khách mới thì thêm vào đây…", nút
  "Thêm buổi chụp"), không hiện 8 cột trống.

## 3. Thao tác kéo thả — luật duy nhất: kéo chỉ là cách gọi `setStage`

### 3.1 Cách kéo (touch — HTML5 drag-and-drop KHÔNG dùng được trên iOS)

- **Nhấn giữ thẻ ~250ms** (kèm rung nhẹ qua Haptics bridge đã có) thì thẻ
  "nhấc lên": to lên ~5%, đổ bóng, các cột khác hiện viền nhận thả. Kéo bằng
  1 ngón. Thả vào cột nào thì đổi sang bước đó.
- **Phân biệt chạm và kéo:** di chuyển < 10px sau khi nhấn giữ thì tính là
  chạm → mở chi tiết job như v1 (`openJob`). Di chuyển ≥ 10px thì tính là
  kéo → không mở chi tiết khi thả. Ngưỡng này ngăn lỗi "định chạm mà thành
  kéo" khi cuộn dọc cột.
- Trong lúc kéo: **tự cuộn ngang** khi ngón tay tới gần mép trái/phải màn
  hình (vùng 48px ở mỗi mép), tốc độ vừa phải; cột đang trỏ tới được tô
  viền màu nhấn + đầu cột đậm lên. Không có cột nào bị vô hiệu hoá — kéo tới
  cột nào cũng được (kể cả kéo ngược về bước trước, kể cả kéo tới `Xong`).
- Thả ra ngoài mọi cột (VD lên tab bar, lên đầu trang): **huỷ kéo**, job ở
  nguyên bước cũ, không toast, không lưu. Không có chuyện "thả trượt tay
  làm mất job".
- Kéo thả **chỉ bật trong chế độ Bảng**. Ở chế độ Danh sách/Lịch, thẻ không
  kéo được — tránh xung đột với cuộn dọc trang (v1 đặt `touch-action:pan-y`
  toàn trang, `index.html:66`).

### 3.2 Sau khi thả — tái dùng y nguyên 3 luật xác nhận của v1

Thả thẻ **không** đổi bước ngay trong mọi trường hợp. Luồng đúng là:
thả → gọi `jumpToStage(id, ti)` → hàm này gọi `setStage` → `setStage` tự
áp các luật của nó. Cụ thể:

| Trường hợp thả | Hành vi (đã có trong code v1 — Kanban chỉ gọi lại) |
|---|---|
| Thả vào **cùng cột** (bước cũ) | Không làm gì. Không toast, không lưu. |
| Thả **sang bước kế tiếp** (`ti == cur + 1`) hoặc **lùi về bước trước** (`ti < cur`) | Đổi bước ngay, không hỏi. `setStage` cập nhật `stage`, `stageSince = hôm nay`, `saveLocal()`, `renderAll()`, `refreshJobSheet()`, toast "“<tên khách>” sang bước <bước mới>". |
| Thả **nhảy cóc về phía trước** (`ti > cur + 1`, VD Tư vấn → Đã chụp) | Hiện đúng `actionSheet` của `jumpToStage` (`index.html:1490–1495`): "Nhảy qua N bước? Từ “…” nhảy thẳng tới “…” , bỏ qua các bước giữa chưa xong. Vẫn nhảy?" — nút "Nhảy tới “…”" / "Huỷ". Bấm Huỷ thì job ở nguyên bước cũ, thẻ trở về cột cũ. |
| Thả vào **`Xong` mà còn thiếu tiền** (`jobOwe(j) > 0`) | Hiện đúng `actionSheet` của `setStage` (`index.html:1466–1472`): "Vẫn còn thiếu tiền — Khách còn thiếu <số tiền đầy đủ>. Xong job mà chưa thu đủ thì sổ sẽ ghi thiếu. Chắc chắn muốn xong?" — 2 nút: **"Thu nốt <số tiền> trước"** (mở form ghi thu `openTxForm`, category "Tiền sau buổi chụp", số tiền = đúng số thiếu) và **"Vẫn xong, thiếu sau"** (destructive — gọi `setStage` với `force:true`). Bấm Huỷ/backdrop thì ở nguyên bước cũ. |
| Thả vào **`Chốt cọc`** | Sau khi đổi bước, `setStage` tự mở form ghi cọc sau 400ms, số cọc = `price × depositPct` trong Cài đặt (`index.html:1476–1479`). Kanban không tự tính cọc, không tự mở form. |
| Thả vào **`Đã giao`** | `setStage` tự: toast nhắc thu nốt nếu còn thiếu, hiệu ứng `celebrate`, gợi ý email giao ảnh (`suggestEmail(j,'deliver')`, `index.html:1480–1483`). Kanban không làm thêm. |
| Thả vào **`Xong` (đã thu đủ)** | `setStage` tự `celebrate('Xong job … rồi!')` (`index.html:1484`). |

**Hoàn tác sau khi thả:** sau mỗi lần đổi bước thành công bằng kéo thả,
toast hiện thêm nút **"Hoàn tác"** trong 5 giây. Bấm thì job về lại bước cũ
**và `stageSince` cũ** (phải chụp lại `stage` + `stageSince` trước khi gọi
`setStage`, vì `setStage` đã ghi đè `stageSince = hôm nay`). Hết 5 giây thì
hết hoàn tác — muốn về lại thì dùng kéo thả / nút "Lùi về…" trong chi tiết
job như v1. Lưu ý: toast v1 hiện không có nút hành động (`toast(msg, kind)`,
`index.html:995`) — đây là phần mới cần code ở v1.1, chỉ cho toast sau kéo
thả, không đổi toast ở chỗ khác. Nếu job đã đổi bước rồi lại đổi tiếp trong
5 giây đó thì hoàn tác chỉ về được bước ngay trước lần đổi gần nhất.

### 3.3 Vùng thả và phản hồi trực quan

- Vùng thả = toàn bộ thân cột (kể cả khoảng trống dưới thẻ cuối). Cột trống
  có chiều cao tối thiểu 120px để thả được (xem §2.2).
- Cột đích khi đang trỏ tới: viền 2px màu nhấn + nền nhạt màu nhấn; các cột
  còn lại mờ đi một chút. Thẻ đang kéo: theo ngón tay bằng `transform`
  (không đổi layout, không re-render trong lúc kéo).
- Nếu thả mà bị chặn bởi actionSheet xác nhận (nhảy cóc / thiếu tiền) thì
  thẻ **nằm lại cột cũ** cho tới khi người dùng bấm xác nhận — không nhảy
  trước rồi mới hỏi. Chỉ khi xác nhận mới chuyển cột (kèm animation trượt
  ngắn 200ms; tắt animation khi bật Giảm chuyển động, theo `prefers-reduced-motion`
  đã có ở `index.html:505–507`).
- Trong lúc 1 thẻ đang được kéo thì **không cho kéo thẻ thứ hai**; các nút
  khác trên bảng vẫn bấm được nhưng kéo thả mới thì đợi thả xong đã.

### 3.4 Kéo thả KHÔNG làm được những việc này (cố tình cấm)

- **Không kéo để huỷ job.** Không có cột Huỷ, không có vùng "kéo vào thùng
  rác". Huỷ job chỉ làm trong chi tiết job (`jobAction 'cancel'`,
  `index.html:1502–1505`) với actionSheet xác nhận riêng — vì huỷ là quyết
  định nặng (dù khôi phục được), không được xảy ra do trượt tay.
- **Không kéo để xoá job.** Xoá chỉ trong chi tiết job (`jobAction 'del'`).
- **Không kéo để đổi thứ tự thẻ trong cùng một cột.** Thứ tự trong cột do
  `sortJobs` quyết (kẹt trước, ngày chụp trước) — kéo trong cùng cột không
  có ý nghĩa nghiệp vụ, thả lại cùng cột = không làm gì (§3.2).
- **Không kéo job đã huỷ.** Job huỷ không có mặt trên bảng (xem §5).

## 4. Chuyển đổi giữa Danh sách và Bảng

- Đoạn chọn chế độ `#jobsSeg` thành 3 nút: **Danh sách | Lịch | Bảng**.
  Nút đang chọn có kiểu `.on` như v1. Chế độ Bảng là **chế độ xem** của cùng
  một dữ liệu — đổi chế độ không đổi dữ liệu, không đổi bộ lọc.
- Khi ở chế độ Bảng, chip lọc bước (`#stageChips`) được ẩn — vì chính các
  cột đã là bộ lọc. Muốn xem riêng 1 bước thì cuộn tới cột đó (hoặc chạm tên
  bước ở thanh chỉ vị trí, §1.2).
- Mở chi tiết job từ thẻ Kanban thì mở đúng sheet `openJob(id)` của v1
  (đầy đủ Tiến độ / Lịch / Tiền / Liên lạc / Lịch & nhắc việc / Drive).
  Đổi bước trong sheet (nút "Xong bước này", "Lùi về…", chạm số bước để
  nhảy) vẫn chạy như v1; đóng sheet về thì bảng đã cập nhật đúng cột mới
  (vì `setStage` gọi `renderAll()`).
- Tìm kiếm: v1 không có ô tìm job — Kanban v1.1 cũng **không thêm** ô tìm.
  Nếu sau này thêm tìm kiếm thì áp chung cho cả Danh sách và Bảng, không
  làm riêng cho bảng.

## 5. Job Huỷ — hiển thị ở đâu

- **Không có trên bảng Kanban.** Lý do: job huỷ "không nằm trong pipeline
  đang chạy" (đúng câu chữ trong actionSheet huỷ, `index.html:1503`) — để
  lên bảng sẽ làm người dùng tưởng còn phải làm tiếp bước nào đó.
- Vị trí: **dưới bảng**, một mục thu gọn riêng: dòng "Đã huỷ (N)" (N = số
  job `cancelled == true`). Mặc định thu gọn — chạm để mở ra danh sách job
  huỷ, mỗi dòng hiện: tên khách, loại job, "đang ở bước X lúc huỷ"
  (`cancelledFrom`), nút **"Khôi phục về Tư vấn"** (gọi đúng
  `jobAction 'restore'`, `index.html:1507`). Job huỷ trong danh sách này
  **không kéo thả được**, chạm vào thì mở chi tiết job (hiện banner đỏ +
  nút khôi phục như `jobDetailHTML`, `index.html:1397–1401`).
- Số N này phải khớp số trên chip "Đã huỷ" ở chế độ Danh sách
  (`renderStageChips` đếm `j.cancelled`).
- Job huỷ **không tính** vào số lượng ở đầu cột nào, không tính vào tổng
  tiền còn thiếu `totalOwe()` (`index.html:1037` đã loại `cancelled`), và
  không hiện trong mục "Cần nhớ hôm nay" — giữ đúng luật v1.

## 6. Hiệu năng khi nhiều job

Bối cảnh đo được từ code v1 (`PERFORMANCE.md`): `renderAll()` render lại cả
5 màn + `saveLocal()` ghi toàn bộ JSON mỗi lần đổi 1 job; `jobThu/jobChi`
quét toàn bộ `txs` cho mỗi job (O(job × tx)). Kanban không được làm tệ hơn:

| Vấn đề | Thiết kế v1.1 |
|---|---|
| Render lại cả bảng mỗi lần chạm | Thêm `renderBoard()` chỉ render `#kanbanView`. `setStage` vẫn gọi `renderAll()` như v1 (để Hôm nay/Tiền bạc đồng bộ) — nhưng trong lúc **kéo** (chưa thả) thì **không render gì cả**, chỉ đổi `transform` của thẻ đang kéo. Chỉ render khi đã thả + đã xác nhận (nếu có). |
| Tính tiền thiếu lặp lại | Mỗi lần render bảng, tính `jobThu/jobChi` **một lần cho mọi job** thành map `jobId → {thu, owe}` rồi thẻ nào cũng đọc map — không gọi `jobOwe(j)` riêng cho từng thẻ (mỗi lần gọi là 1 lần quét `txs`). |
| Nhiều job trong 1 cột | Mỗi cột render tối đa **20 thẻ**, cuối cột có nút "Xem thêm (N job nữa)" để mở thêm 20. Cột `Xong` mặc định 10 (xem §1.3). Không render 200 thẻ cùng lúc rồi giấu bằng CSS. |
| Lưu dữ liệu | Chỉ `saveLocal()` **1 lần khi đã thả + xác nhận xong** (đi theo `setStage`). Không lưu trong lúc kéo, không lưu khi chỉ cuộn bảng. |
| Ảnh / icon | Thẻ Kanban không chứa ảnh (icon loại job tái dùng `typeIcon`, SVG có sẵn). Không tạo `objectURL` nào thêm. |
| Cuộn ngang mượt | Dùng `transform` + `will-change` cho thẻ đang kéo; cột dùng `overflow-y:auto` + `-webkit-overflow-scrolling:touch` như `.sheet-body` đã có. Không animation layout (không đổi `width/left/top` trong lúc kéo). |

Mục tiêu đo (chưa đo — phải đo trên TestFlight, xem §8): mở bảng với 200 job
+ 1.000 khoản thu chi dưới 1 giây trên iPhone đời mới; thả 1 thẻ đổi bước
xong (gồm lưu + render lại) dưới 300ms; cuộn ngang 60fps, không khựng khi
thả.

## 7. Trợ năng (Accessibility) — kéo thả PHẢI có cách thay thế bằng chạm

Đây là yêu cầu bắt buộc, không phải điểm cộng thêm. Kéo thả bằng tay là thao
tác khó với người dùng VoiceOver, Switch Control, tay run — nên mọi việc làm
được bằng kéo thả đều phải làm được bằng chạm, với cùng kết quả, cùng luật
xác nhận (§3.2).

### 7.1 Cách thay thế bằng chạm (luôn có, không chỉ khi bật VoiceOver)

- Mỗi thẻ có nút **"⋯ Chuyển bước"** riêng (44×44pt, nằm góc phải thẻ, tách
  khỏi vùng chạm mở chi tiết). Bấm thì hiện actionSheet liệt kê **đủ 8 bước**
  theo đúng thứ tự pipeline + dòng trạng thái hiện tại ("Đang ở: Hậu kỳ").
  Chọn bước nào thì chạy đúng `jumpToStage` → `setStage` như kéo thả —
  nghĩa là nhảy cóc vẫn hỏi, `Xong` thiếu tiền vẫn hỏi (§3.2). Nút này là
  đường chính cho VoiceOver/Switch Control, và là đường dự phòng cho mọi
  người khi kéo thả khó (tay ướt, đang đi đường).
- Trong chi tiết job, thanh tiến độ chạm để nhảy bước (`stepsBar` dạng
  `clickable`, `index.html:1049`) **giữ nguyên** — đó đã là cách thay thế
  bằng chạm thứ hai. Lưu ý lỗi đã biết ở `ACCESSIBILITY.md` §2.4: nút nhảy
  bước hiện chỉ cao **28px** (dưới chuẩn Apple HIG 44pt) — khi làm Kanban
  v1.1 thì sửa luôn nút này lên tối thiểu 44px chiều cao (giữ số bước bên
  trong), vì người dùng sẽ chạm nó nhiều hơn khi có bảng.
- Không dùng thao tác "vuốt thẻ sang trái/phải để đổi bước" làm cách thay
  thế — vuốt ngang trên thẻ xung đột với cuộn ngang bảng.

### 7.2 VoiceOver

- Thẻ là 1 nút duy nhất với nhãn đọc đầy đủ, VD:
  "Ngọc Anh, Wedding Film, chụp thứ Bảy 22/11 lúc 8 giờ, còn thiếu 2,5 triệu,
  kẹt 9 ngày ở bước Hậu kỳ. Đang ở cột Hậu kỳ, cột 6 trên 8."
  (Nhãn này ghép từ đúng 5 dòng ở §2 + vị trí cột — không đọc màu, không đọc
  "thẻ đỏ/thẻ xanh".)
- Nút "⋯ Chuyển bước" có `aria-label` riêng: "Chuyển job Ngọc Anh sang bước
  khác". Đầu cột có `role="heading"` + nhãn "Cột Chốt cọc, 3 job".
- Khi VoiceOver đang bật, **tắt hẳn chế độ nhấn-giữ-để-kéo** (kéo thả bằng
  cử chỉ VoiceOver rất khó trúng) và chỉ dùng nút "Chuyển bước" + thanh
  nhảy bước trong chi tiết. Không chỉ giấu nút kéo — mà là kéo không kích
  hoạt. (Phát hiện VoiceOver: `window.matchMedia` không đủ — dùng cách v1
  đã dùng cho toast `role="status"`/`aria-live`; việc tắt kéo khi VoiceOver
  bật cần kiểm chứng trên máy thật, xem §8.)
- Sau khi đổi bước (dù bằng kéo hay chạm), thông báo qua vùng
  `aria-live="polite"` đã có (toast `role="status"`, `index.html:712`):
  "Ngọc Anh đã sang bước Đã giao". Người dùng không nhìn màn hình vẫn biết
  kết quả.
- Thứ tự focus hợp lý: đầu cột → thẻ trong cột (theo thứ tự §2.1) → nút
  "Xem thêm" → cột tiếp theo. Không để focus nhảy lung tung sau khi render
  lại bảng (giữ focus ở thẻ/cột vừa thao tác).

### 7.3 Các yêu cầu trợ năng khác (kế thừa lỗi đã biết ở v1)

- **Vùng chạm:** mọi nút trên bảng tối thiểu **44×44pt** (Apple HIG) — thẻ
  cao tối thiểu 76px, nút "⋯" 44×44, đầu cột 44px, nút "Xem thêm" 44px.
  (V1 còn lỗi nút nhảy bước 28px và chip lọc 32–36px — xem
  `ACCESSIBILITY.md` §2.4 — Kanban không được lặp lại lỗi này.)
- **Không báo trạng thái chỉ bằng màu:** cột kẹt có icon + chữ "Kẹt …",
  tiền thiếu có chữ "còn …", cột đích khi kéo có viền + chữ tên bước đậm
  lên (không chỉ đổi màu nền). Màu chữ trạng thái dùng bản đậm đạt tương
  phản WCAG AA (đỏ `#D70015`, xanh lá `#248A3D` ở chế độ sáng — xem
  `ACCESSIBILITY.md` §1; v1 hiện dùng `#FF375F`/`#30D158` trên trắng chỉ
  đạt 3.52:1 / 2.02:1, không đạt AA).
- **Chữ lớn (Dynamic Type):** v1 dùng toàn `px` (95 chỗ, 0 `rem`) nên bật
  "Chữ lớn" hệ thống thì app không to ra (`ACCESSIBILITY.md` §2.2). Thẻ
  Kanban mới viết phải dùng `rem` cho cỡ chữ và cho phép thẻ cao lên khi
  chữ to (không cố định chiều cao thẻ, không cắt chữ ở mức AX5). Kiểm tra ở
  mức chữ lớn nhất trên iPhone SE.
- **Giảm chuyển động:** khi bật `prefers-reduced-motion`, tắt animation
  nhấc thẻ / trượt cột — đổi cột xảy ra ngay, không hiệu ứng
  (`index.html:505–507` đã tắt animation toàn app theo setting này).
- **Phóng to:** Kanban không được khoá zoom thêm — lưu ý v1 đang khoá zoom
  (`maximum-scale=1, user-scalable=no`, `index.html:5`, lỗi
  `ACCESSIBILITY.md` §2.1) — sửa viewport là việc của v1/v1.1 chung, không
  phải của riêng bảng, nhưng bảng không được phụ thuộc vào việc khoá zoom.

### 7.4 Chuỗi giao diện Việt / Anh (bổ sung vào `I18N-STRINGS.md`)

Kanban thêm các chuỗi sau (chưa có trong bảng chuỗi v1 — cần dịch EN khi
làm v1.1, theo đúng bảng `vi`/`en` ở `index.html:950–951`):

| Key (đề xuất) | Tiếng Việt | English (dịch khi code) |
|---|---|---|
| `jobs.board` | Bảng | Board |
| `jobs.boardHint` | Nhấn giữ thẻ rồi kéo sang cột khác | Long-press a card, then drag it to another column |
| `jobs.moveTo` | Chuyển sang bước… | Move to step… |
| `jobs.moveJob` | Chuyển job {tên} sang bước khác | Move {name} to another step |
| `jobs.cancelledList` | Đã huỷ ({n}) | Cancelled ({n}) |
| `jobs.showMore` | Xem thêm ({n} job nữa) | Show more ({n} more) |
| `jobs.hideDone` | Ẩn job đã xong | Hide finished jobs |
| `jobs.undoMove` | Hoàn tác | Undo |
| `jobs.movedTo` | {tên} đã sang bước {bước} | {name} moved to {step} |

## 8. Tiêu chí kiểm chứng (v1.1 — chạy trước khi giao)

Chia 3 nhóm. Nhóm A chạy được bằng test jsdom kiểu `www/test-fotobro-v1.js`
(không cần iPhone); nhóm B và C bắt buộc iPhone thật qua TestFlight.

### A. Logic — test tự động (jsdom, mở rộng `test-fotobro-v1.js`)

1. Bảng có đúng 8 cột, đúng tên + đúng thứ tự `STAGES`; số job mỗi cột
   khớp số trên chip lọc Danh sách (cùng dữ liệu mẫu).
2. Thẻ hiện đủ 5 dòng §2 (tên, loại + Digital/Film/Cả hai, ngày+giờ, còn
   thiếu khi `owe > 0`, cảnh báo khi `stuckInfo != null`); thẻ `owe == 0`
   không hiện dòng tiền; thẻ job huỷ không có trong cột nào.
3. Kéo (mô phỏng gọi đúng hàm đích) sang bước kế tiếp: `stage` đổi,
   `stageSince` = hôm nay, `saveLocal` được gọi 1 lần.
4. Kéo nhảy cóc (`ti > cur + 1`): actionSheet nhảy bước hiện đúng câu hỏi
   v1; bấm Huỷ thì `stage` không đổi.
5. Kéo vào `Xong` khi `owe > 0`: actionSheet thiếu tiền hiện đúng số tiền;
   chọn "Thu nốt" thì mở form thu với `amount == owe`; chọn "Vẫn xong" thì
   `stage == 'Xong'`; bấm Huỷ thì không đổi.
6. Kéo vào `Chốt cọc`: form cọc mở với số tiền = `price × depositPct`
   (làm tròn theo luật `setStage`); kéo vào `Đã giao` khi còn thiếu tiền:
   toast nhắc thu nốt xuất hiện.
7. Hoàn tác trong 5 giây: về đúng bước cũ **và** `stageSince` cũ; hết 5 giây
   thì nút hoàn tác mất.
8. Job huỷ: không nằm trong cột nào, không tính vào `totalOwe()`; bấm
   "Khôi phục về Tư vấn" thì `cancelled == false`, `stage == 'Tư vấn'`,
   xuất hiện ở cột Tư vấn.
9. Thứ tự trong cột: job kẹt trước, rồi ngày chụp gần trước, chưa hẹn ngày
   cuối (theo `sortJobs`).
10. Nút "Chuyển bước" (⋯) cho cùng kết quả với kéo thả ở các ca 3–6 (cùng
    actionSheet, cùng `setStage`) — kiểm bằng cách gọi cùng hàm đích.

### B. Trên iPhone thật — thao tác + hiển thị

11. iPhone 390px và SE 375px, sáng + tối: thấy 1 cột + ló cột kế; cuộn
    ngang snap đúng đầu cột; chạm tên bước ở thanh chỉ vị trí thì cuộn tới
    đúng cột.
12. Nhấn giữ ~250ms + rung nhẹ thì thẻ nhấc lên; kéo sang cột khác, cột
    đích viền nhấn; tự cuộn ngang khi tới mép; thả ngoài cột thì job về chỗ
    cũ, không đổi bước, không toast.
13. Kéo thật 1 job qua đủ 8 bước (tiến + lùi): mỗi lần đổi đúng luật §3.2
    (nhảy cóc hỏi, `Xong` thiếu tiền hỏi, `Chốt cọc` mở form cọc,
    `Đã giao` nhắc thu nốt + gợi ý email).
14. Chạm thẻ mở đúng chi tiết job v1; đổi bước trong sheet rồi đóng lại thì
    bảng đã ở cột mới; nút "Thêm buổi chụp" (nav phải, màn Buổi chụp) vẫn
    hoạt động khi đang ở chế độ Bảng.
15. Cột trống nhận được thẻ kéo tới; cột `Xong` thu gọn/mở rộng + "Ẩn job
    đã xong" hoạt động; "Xem thêm" ở cột > 20 job mở thêm đúng 20.
16. Bảng với 200 job mẫu + 1.000 khoản thu chi: mở bảng < 1 giây, thả đổi
    bước < 300ms, cuộn ngang không khựng (kiểm bằng mắt + cảm nhận; ghi rõ
    máy đo là máy nào).
17. Xoay ngang / iPad: 2–3 cột hiện cùng lúc, kéo thả vẫn đúng cột đích;
    không tràn chữ, không che tab bar.

### C. Trên iPhone thật — trợ năng

18. Bật VoiceOver: đi hết bảng bằng vuốt — mỗi thẻ đọc đủ tên + loại +
    ngày + tiền thiếu + kẹt + "cột X trên 8"; nút "⋯ Chuyển bước" đọc được
    tên job; nhấn-giữ-để-kéo không kích hoạt; đổi bước bằng nút "⋯" cho
    cùng kết quả + cùng xác nhận như kéo thả; sau khi đổi bước, VoiceOver
    nghe được thông báo "… đã sang bước …".
19. Bật Switch Control: tới được nút "⋯" trên thẻ, đầu cột, nút "Xem thêm"
    — không kẹt focus.
20. Bật Cài đặt → Trợ năng → Chữ lớn mức lớn nhất (AX5): thẻ cao lên,
    không cắt chữ, không che nút "⋯"; màn SE vẫn dùng được.
21. Bật Giảm chuyển động: kéo thả đổi cột ngay, không animation nhấc/trượt.
22. Tương phản: số tiền thiếu, chữ "Kẹt …", tên bước ở đầu cột đọc rõ ở cả
    sáng và tối (không chỉ nhìn màu).

## 9. Rủi ro đã thấy + việc cố tình chưa quyết (cần Việt chốt khi làm v1.1)

1. **Nhầm cột khi kéo trên màn hình nhỏ.** Cột 272px trên màn 390px: kéo
   nhanh dễ thả nhầm cột kế bên. Giảm thiểu: snap + tô viền cột đích +
   toast hoàn tác 5 giây (§3.2). Nếu Việt thử trên máy thật mà vẫn nhầm
   nhiều thì phương án dự phòng là tăng rộng cột lên 300px (thấy ít cột
   hơn nhưng thả chính xác hơn) — cần Việt thử mới chốt.
2. **Kéo thả xung đột với cuộn dọc cột.** Ngưỡng nhấn-giữ 250ms + di chuyển
   10px (§3.1) là số chọn theo kinh nghiệm iOS, chưa đo trên máy thật.
   Nếu người dùng phản ánh "cuộn cột mà thành kéo thẻ" thì tăng thời gian
   giữ lên 350ms hoặc bắt đầu kéo chỉ từ tay cầm (grip) trên thẻ — chưa
   chốt, để v1.1 test thật rồi quyết.
3. **Hoàn tác toast là UI mới.** Toast v1 không có nút hành động — thêm nút
   "Hoàn tác" vào toast chỉ cho trường hợp kéo thả, không đổi toast chỗ
   khác. Nếu thấy phức tạp thì phương án rút gọn: bỏ hoàn tác, người dùng
   kéo ngược lại là xong (vì kéo lùi không hỏi xác nhận) — cần Việt chốt
   khi code v1.1: giữ hoàn tác hay bỏ.
4. **Hiệu năng `renderAll()` chưa sửa.** Kanban thiết kế để render ít lại
   (`renderBoard`, map tiền 1 lần, 20 thẻ/cột — §6), nhưng `setStage` vẫn
   gọi `renderAll()` như v1 để đồng bộ các màn khác. Nếu đo trên máy thật
   thấy thả thẻ chậm (> 300ms) với nhiều job thì phải sửa `renderAll()`
   theo `PERFORMANCE.md` §5 (debounce `saveLocal`, chỉ render màn đang mở)
   — đó là việc riêng, không nhét vào task Kanban.
5. **Chưa có thiết kế cho Apple Watch / Mac.** Kanban chỉ cho iPhone/iPad
   (màn cảm ứng). Không làm bản macOS, không làm widget.

## 10. Phạm vi code v1.1 (để agent code ước lượng — không phải code)

- Thêm: `#kanbanView` + `renderBoard()` + logic kéo (pointer/touch,
  nhấn-giữ 250ms, tự cuộn mép, snap cột) + nút "⋯ Chuyển bước" trên thẻ +
  mục "Đã huỷ (N)" dưới bảng + toast có nút Hoàn tác (5 giây) + chuỗi
  i18n §7.4 + nút `Bảng` trong `#jobsSeg`.
- Sửa: nút nhảy bước `.steps.jump button` cao 28px → tối thiểu 44px
  (§7.1); màu chữ trạng thái sáng cho đạt WCAG AA (§7.3).
- Không sửa: `STAGES`, `setStage`, `jumpToStage`, `jobAction`,
  `stuckInfo`, `jobOwe`, `sortJobs`, `saveLocal`, key `troLyXeo.v1`,
  cấu trúc job/tx.
- Test: mở rộng `www/test-fotobro-v1.js` theo §8 nhóm A; checklist §8 nhóm
  B–C chạy trên TestFlight.

---

*File thiết kế duy nhất cho task này. Không sửa code, không đẩy GitHub.
Căn cứ đã đọc: `www/index.html` (STAGES:781; `jobOwe`:1017;
`stuckInfo`:1021–1035; `stageTag`:1039–1044; `stepsBar`:1045–1050;
`renderStageChips`:1344–1351; `jobRow`:1353–1359; `sortJobs`:1360–1369;
`renderJobs`:1370–1383; `jobDetailHTML`:1391–1436; `setStage`:1462–1485;
`jumpToStage`:1487–1497; `jobAction` cancel/restore:1502–1507;
`#jobsSeg`:600; `saveLocal`:907–910; `renderAll`:2274–2278),
`README.md`, `CHANGELOG-v1.0.md`, `PERFORMANCE.md`, `ACCESSIBILITY.md`.*
