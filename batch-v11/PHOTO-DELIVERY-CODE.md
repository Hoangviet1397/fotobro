# PHOTO-DELIVERY-CODE — Spec code luồng giao ảnh v1.1

> Trạng thái: **spec, chưa code.** Chỉ để code v1.1, không sửa v1.
> Nguồn thiết kế: `../PHOTO-DELIVERY.md` (thiết kế luồng v1.1, trạng thái "thiết kế, chưa code").
> Code đối chiếu: `../www/index.html` (v1.0, `APP_VERSION = '1.0'`, 3.901 dòng, đọc ngày 20/11/2026).
> Phạm vi: chỉ thêm luồng giao ảnh vào pipeline 8 bước đã có — **không tạo pipeline mới,
> không lưu ảnh trong app, không backend, không trang chọn ảnh cho khách**.

## 0. Điểm neo trong code v1 (đã kiểm chứng bằng đọc code thật)

| Cái đã có | Vị trí trong `www/index.html` | Ghi chú cho v1.1 |
|---|---|---|
| Pipeline 8 bước | `STAGES`, dòng 781: `['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']` | Hai bước `Chọn ảnh` (index 4) và `Hậu kỳ` (index 5) đã tồn tại ở mức job — v1.1 chỉ thêm dữ liệu + UI con bên trong, không đổi `STAGES` |
| Hạn giao tự điền | `cfg.deliverDays` mặc định 14, dòng 818; `deadline = shootDate + deliverDays`, dòng 1617–1618 | Giữ nguyên; `pickDeadline` là hạn khác (hạn khách chọn ảnh), không thay `deadline` |
| `driveLink` theo job | Form job dòng 1586, 1594; chi tiết job dòng 1430–1448, 1534–1536; sanitizer dòng 886 | Ô duy nhất hiện tại — v1.1 tách thành 2 ô (xem §5) |
| Drive picker (chỉ xem tên thư mục) | Dòng 3434–3449, scope `drive.metadata.readonly` dòng 3202 | **Bằng chứng cho giới hạn §6:** scope này không có sự kiện tải file — xem §6 |
| Mẫu tin nhắn "Nhắc khách chọn ảnh" + "Giao ảnh & xin cảm nhận" | `TPLS`, dòng 1905–1906 | Dùng lại, không thêm mẫu mới |
| Mẫu email `deliver` (`{drive}`, `{owePart2}`) và `balance` | `MAIL_TPLS_DEFAULT`, dòng 3550–3556; `fillTpl` dòng 3556–3561 | Dùng lại; `deliver` phải trỏ sang link giao chính thức (xem §5) |
| Gợi ý email sau khi giao | `suggestEmail(j, 'deliver', 2600)` trong handler chuyển bước, dòng 1482 | Giữ nguyên; chỉ đổi nguồn link `{drive}` |
| Tiền gắn bước | Sang "Đã giao" còn thiếu → toast nhắc, dòng 1480; sang "Xong" còn thiếu → actionSheet xác nhận, dòng 1466–1473 | Giữ nguyên quy tắc "không cho xong lặng lẽ" |
| `jobOwe(j)` | Dòng 1017: `max(0, price - jobThu)` | Dùng lại cho mọi phép đối chiếu tiền (phí retouch thêm, nhắc thu nốt) |
| Job kẹt / nhắc "Hôm nay" | `stuckInfo` dòng 1021–1032 (kẹt = ở 1 bước ≥ 7 ngày, hoặc quá hạn giao); `todayItems()` dòng 1159–1175 (đã có mục "còn thiếu tiền" ở bước Chọn ảnh/Hậu kỳ/Đã giao + mục "Job kẹt") | Nhắc thu nốt tự động (§7) nối vào đây, không làm hệ nhắc mới |
| Cài đặt "Cọc & giao ảnh" | Dòng 2386–2388: `depositPct`, `deliverDays` | Thêm 3 cài đặt mới vào đúng mục này (§8) |
| `cfg.retouch` (Retouch / ảnh) | `DEFAULT_CFG` dòng 817; Cài đặt dòng 2384; máy tính giá dòng 1921–1923, 1959 | Đã có — v1.1 chỉ dùng để tính phí retouch thêm, không thêm cài đặt giá mới |
| Hạng mục thu đã có | `THU_CATS` dòng 796: "Tiền sau khi giao ảnh", "Thêm ảnh retouch", "Lấy file gốc", "Album thêm" | Phí retouch thêm ghi vào "Thêm ảnh retouch", không tạo hạng mục mới |
| Lưu trữ / sao lưu | Khóa `troLyXeo.v1`, `saveLocal()` dòng 907; import sao lưu qua `cleanData()` dòng 2238 | **Lưu ý đặt tên:** `PHOTO-DELIVERY.md` §3 ghi "thêm vào `cleanJob`" — trong code v1 **không có hàm `cleanJob`**; hàm làm sạch job là `cleanData()` (dòng ~876–900, job được ép kiểu trong `.map` ở dòng 884–887). Spec này dùng `cleanData()` |
| LocalNotifications | Có trong `package.json` (`@capacitor/local-notifications ^8.0.0`) và `capacitor.config.ts`, nhưng **0 lần xuất hiện trong `www/index.html`** (đã grep) | Chưa được nối dây trong code v1 — nhắc push chỉ là "tùy chọn, cần nối dây mới", xem §7 |
| "Tạo nhắc việc" trong chi tiết job | Dòng 1550–1553: chỉ share/copy text sang app Nhắc việc, không phải notification của app | Không dùng cho nhắc thu nốt tự động |

> Lưu ý đối chiếu: `PHOTO-DELIVERY.md` có vài tham chiếu số mục lệch — §1 nhắc "xem §4" cho tick tay
> (đúng, §4 là "Giới hạn và rủi ro") nhưng nhắc "xem §7" cho câu hỏi watermark và "xem §5" cho nhắc
> thu nốt, trong khi file thực tế chỉ có 6 mục (§5 = tiêu chí chấp nhận, §6 = câu hỏi chờ Việt,
> **không có §7**). Spec này trích theo nội dung đúng, không theo số mục sai đó.

## 1. Luồng 6 bước → điểm chạm code

| # | Bước | Điểm chạm v1 | Thêm ở v1.1 |
|---|---|---|---|
| 1 | Đăng ảnh xem trước | Ô `driveLink` chung (dòng 1430) | Ô `previewLink` riêng + ghi `previewSentAt`, `pickDeadline` (§3.1, §5) |
| 2 | Khách chọn ảnh | Mẫu tin nhắn "Nhắc khách chọn ảnh" (dòng 1905) | Mục "Chọn ảnh" trong chi tiết job: nhập `pickedCodes`, đếm, đối chiếu gói (§3.2, §4) |
| 3 | Hậu kỳ từng tấm | Bước "Hậu kỳ" ở mức job | Checklist từng mã ảnh, 3 trạng thái, cộng phí retouch thêm (§3.3, §4) |
| 4 | Giao qua Drive link | `driveLink` + `suggestEmail(j,'deliver',2600)` (dòng 1482) | Giữ `driveLink` làm link giao; chạm "Đã giao" ghi `deliveredAt` (§3.4, §5) |
| 5 | Khách tải ảnh | Chưa có | Tick tay "Khách đã tải" + `downloadedAt`/`downloadedNote` (§3.5, §6) |
| 6 | Nhắc thu nốt | Toast khi sang "Đã giao" (dòng 1480) + cảnh báo khi sang "Xong" (dòng 1466) | Nhắc tự động sau 3 ngày từ `deliveredAt`, 1 lần/ngày, trên màn "Hôm nay" (§3.6, §7) |

## 2. Trường job mới cần thêm

Thêm vào object job trong `cleanData()` (`www/index.html`, dòng 884–887) — **mọi trường đều
phải có giá trị mặc định khi đọc file sao lưu v1 cũ** (thiếu trường → mặc định trống, job cũ
vẫn mở được, không mất tiền/job — tiêu chí §9.2). Không đổi khóa lưu `troLyXeo.v1`, không đổi
cấu trúc `{jobs, txs, sample, uid, checkDone, cfg}` ở `saveLocal()` (dòng 907–909).

| Trường | Kiểu | Mặc định (file v1 cũ) | Làm sạch trong `cleanData()` | Ghi chú |
|---|---|---|---|---|
| `previewLink` | string (URL) | `''` | `safeUrl(j.previewLink)` (như `driveLink`, dòng 886) | Link thư mục "Xem trước" — tách khỏi link giao (§5) |
| `previewSentAt` | string `YYYY-MM-DD` | `''` | `cleanDate(j.previewSentAt)` | Ngày gửi link chọn ảnh; ghi khi photographer bấm "Đã gửi link xem trước" |
| `pickDeadline` | string `YYYY-MM-DD` | `''` | `cleanDate(j.pickDeadline)` | Mặc định = `previewSentAt + cfg.pickDays` (mặc định 3 ngày, §8); cho sửa tay trong chi tiết job |
| `pickedCodes` | string[] | `[]` | Mảng chuỗi: mỗi mã `cleanStr(x, 40).trim()`, bỏ rỗng, bỏ trùng, giữ thứ tự nhập, tối đa 500 mã | Mã/số ảnh khách đã chọn; nguồn duy nhất cho checklist hậu kỳ (§4) |
| `pickedAt` | string `YYYY-MM-DD` | `''` | `cleanDate(j.pickedAt)` | Ngày nhập (lần đầu) danh sách đã chọn; cập nhật lại nếu sửa danh sách |
| `photoStatus` | object `{mã: 0\|1\|2}` | `{}` | Chỉ giữ key có trong `pickedCodes`; value ép về 0/1/2, khác thì 0 | **Trường bổ sung ngoài danh sách §3 của `PHOTO-DELIVERY.md`** — bắt buộc để lưu trạng thái checklist 3 mức (`0=chưa làm, 1=đang làm, 2=xong`) mà không suy ra từ `pickedCodes`. Khi xóa mã khỏi `pickedCodes` thì xóa key tương ứng |
| `deliveredAt` | string `YYYY-MM-DD` | `''` | `cleanDate(j.deliveredAt)` | Ghi tự động khi job chuyển sang bước "Đã giao" (handler dòng 1473–1482); không cho sửa tay, chỉ ghi đè khi chuyển lại sang "Đã giao" sau khi quay bước |
| `downloadedAt` | string `YYYY-MM-DD` | `''` | `cleanDate(j.downloadedAt)` | Ghi khi tick "Khách đã tải"; bỏ tick → xóa về `''` |
| `downloadedNote` | string | `''` | `cleanStr(j.downloadedNote, 500)` | Vd "khách nhắn đã tải đủ qua Zalo" |
| `includedPhotos` | number | `0` | `cleanNum(j.includedPhotos)` (0–999) | Số ảnh bao gồm trong gói; **0 = không giới hạn** (đề xuất mặc định, chờ Việt chốt §10.1) |
| `lastBalanceRemindAt` | string `YYYY-MM-DD` | `''` | `cleanDate(j.lastBalanceRemindAt)` | **Trường bổ sung ngoài danh sách §3** — bắt buộc để thực thi quy tắc "nhắc 1 lần/ngày" ở §7; ghi ngày lần nhắc gần nhất |

Xác nhận đối chiếu: `selectedPhotos`, `deliveredAt`, `downloadedAt` đều **chưa có** trong code v1
(đã grep toàn `www/index.html`: 0 kết quả). Spec này dùng tên `pickedCodes` theo
`PHOTO-DELIVERY.md` (không dùng `selectedPhotos`). Các trường mới chỉ xuất hiện sau khi code
v1.1 — tiêu chí kiểm tra §9.4 grep `pickedCodes`/`deliveredAt` có mặt trong code và trong
file sao lưu.

Quy tắc tương thích ngược (bắt buộc):
- `cleanData()` phải chấp nhận file sao lưu v1 cũ thiếu toàn bộ 11 trường trên, không throw,
  không xóa job/tx nào.
- `driveLink` cũ **giữ nguyên vai trò link giao chính thức** — không đổi nghĩa, không migrate
  sang tên khác (file cũ không hỏng).
- Job cũ đang ở bước "Đã giao"/"Xong" mà không có `deliveredAt` → để trống, không tự suy ra từ
  `stageSince` hay `deadline`; nhắc thu nốt tự động chỉ chạy khi `deliveredAt` có giá trị.

## 3. 8 việc cần làm (theo §3 `PHOTO-DELIVERY.md`, triển khai tới mức code)

### 3.1. Trường job mới — dữ liệu (§2)
- Sửa duy nhất `cleanData()` (dòng 884–887): thêm 11 trường ở bảng §2.
- Mọi chỗ tạo job mới (form job dòng 1594–1596, tạo nhanh bằng giọng nói dòng 2140, tạo từ
  lịch dòng 2905, 3116) **không cần** gán tường minh — `cleanData()` + mặc định khi load sẽ
  lo; nhưng khi tạo job mới trong bộ nhớ thì khởi tạo `pickedCodes: []`, `photoStatus: {}`,
  các trường ngày `''`, `includedPhotos: <mặc định theo loại job, §8>`.
- `saveLocal()` không đổi — các trường mới tự đi theo vì job được `JSON.stringify` nguyên object.

### 3.2. Mục "Chọn ảnh" trong chi tiết job — giao diện
- Vị trí: trong `jobDetailHTML(j)` (dòng 1390 trở đi), đặt ngay sau khối "Tiến độ"/stage-box,
  trước khối Drive. **Chỉ hiện khi `STAGES.indexOf(j.stage) >= 4`** (từ bước "Chọn ảnh" trở đi)
  và job chưa hủy.
- Thành phần:
  1. Ô link xem trước (`previewLink`, xem §5) + nút "Mở link xem trước" + nút "Đã gửi link
     xem trước" → ghi `previewSentAt = hôm nay`, `pickDeadline = previewSentAt + cfg.pickDays`
     (nếu `pickDeadline` đang trống; nếu đã có thì không ghi đè).
  2. Ô nhập mã ảnh: textarea 1 dòng, placeholder vd `VD: A012, A015, B003…`,
     nhập nhanh cách nhau bằng dấu phẩy (chấp nhận cả khoảng trắng/xuống dòng làm dấu tách).
     Nút "Lưu danh sách" → parse → `pickedCodes`, `pickedAt = hôm nay` (chỉ ghi lần đầu
     có danh sách; sửa danh sách thì cập nhật lại), `saveLocal()`, render lại.
  3. Dòng đếm + đối chiếu (xem §4): `Đã chọn N tấm` + so với `includedPhotos`.
  4. Ô sửa `pickDeadline` (input `type="date"`), hiện số ngày còn lại tới hạn; quá hạn mà
     chưa nhập đủ thì hiện cảnh báo nhẹ (không chặn — khách chọn muộn vẫn nhập được).
- Không tạo mẫu tin nhắn mới: nút "Nhắn khách chọn ảnh" dùng lại mẫu `TPLS` "Nhắc khách chọn
  ảnh" (dòng 1905), chèn `{drive}` = `previewLink` (không phải `driveLink` — tránh khách
  mở nhầm thư mục giao).

### 3.3. Checklist hậu kỳ từng mã ảnh — giao diện
- Vị trí: trong chi tiết job, ngay dưới mục "Chọn ảnh"; **chỉ hiện khi `pickedCodes.length > 0`**.
- Nguồn duy nhất: `pickedCodes`. Mỗi mã là 1 hàng: mã ảnh + trạng thái 3 mức
  `chưa làm (0) → đang làm (1) → xong (2)`; chạm 1 lần để chuyển trạng thái (vòng tròn),
  lưu vào `photoStatus[mã]`, `saveLocal()`, render lại.
- Dòng đếm: `Đã xong X/N` (X = số mã có `photoStatus === 2`). Khi `X === N` và `N > 0`:
  hiện gợi ý "Xong hết rồi — chuyển sang bước Hậu kỳ → Đã giao" (gợi ý, không tự chuyển bước).
- Không lưu ảnh trong app — chỉ mã + trạng thái.
- Khi job chuyển sang bước "Đã giao" mà checklist chưa xong hết: hiện cảnh báo trong
  actionSheet xác nhận chuyển bước ("Còn M tấm chưa xong hậu kỳ — vẫn giao?"), cho phép
  giao tiếp hoặc quay lại; **không chặn cứng** (photographer có thể giao 1 phần).
- Tính phí retouch thêm (xem §4): hiển thị ngay dưới checklist, trước khi giao.

### 3.4. Tách link "Xem trước" / "Giao chính thức" — giao diện + dữ liệu
- Giữ `driveLink` = link giao chính thức (tương thích file cũ). Thêm `previewLink` (§5).
- Trong form tạo/sửa job (dòng 1586): giữ ô "Drive" hiện tại (đổi nhãn thành "Link Drive giao
  ảnh"), thêm ô "Link Drive xem trước (chọn ảnh)" — cả hai đều qua `link()`/`safeUrl()`.
- Trong chi tiết job (dòng 1430–1448): thay 1 ô + 1 nút "Mở thư mục Drive" bằng 2 cặp
  ô + nút ("Mở thư mục xem trước" / "Mở thư mục giao ảnh"). Nút "Chọn thư mục từ Google Drive"
  (dòng 1432, `openDrivePicker`, dòng 3434–3449) phải hỏi **gắn vào ô nào** (xem trước hay giao)
  trước khi gán — mặc định gắn vào ô giao để giữ hành vi cũ.
- Email `deliver`: `{drive}`/`{driveOrNote}` trong `fillTpl` (dòng 3556–3561) lấy từ
  `j.driveLink` (link giao) — **không đổi nguồn**; chỉ kiểm chứng lại rằng sau khi tách ô,
  email giao ảnh không vô tình lấy `previewLink`.
- Quy tắc 1 năm giữ ảnh gốc trong thư mục Drive riêng của từng job: giữ nguyên, nhắc lại
  trong hướng dẫn ở chi tiết job (không thêm logic xóa/quản lý file).

### 3.5. Tick "Khách đã tải" + ghi chú — giao diện
- Vị trí: chi tiết job, khối giao ảnh; **chỉ hiện khi job ở bước "Đã giao" trở đi**
  (`STAGES.indexOf(j.stage) >= 6`) và `deliveredAt` đã có.
- Một checkbox/toggle "Khách đã tải" + ô ghi chú `downloadedNote` (placeholder
  `VD: khách nhắn đã tải đủ qua Zalo`).
  - Tick → `downloadedAt = hôm nay`, `saveLocal()`.
  - Bỏ tick → `downloadedAt = ''` (ghi chú giữ lại).
  - Sửa ghi chú → `saveLocal()` (không đổi `downloadedAt`).
- Lý do thủ công — xem §6 (bắt buộc ghi rõ trong UI bằng dòng chú thích nhỏ dưới ô tick:
  "App không tự biết khách đã tải hay chưa — tick tay sau khi khách báo.").

### 3.6. Nhắc thu nốt tự động sau 3 ngày kể từ `deliveredAt` — logic
- Điều kiện nhắc (đánh giá mỗi lần render "Hôm nay", trong `todayItems()`, dòng 1159–1175):
  `j.stage === 'Đã giao'` **và** `deliveredAt` có giá trị **và** `jobOwe(j) > 0` **và**
  `số ngày từ deliveredAt tới hôm nay >= cfg.remindAfterDays` (mặc định 3, §8) **và**
  `lastBalanceRemindAt !== hôm nay` (chống spam 1 lần/ngày).
- Hành vi khi đủ điều kiện: thêm 1 mục vào "Hôm nay" (màu cam, icon `coin`):
  `Nhắc thu nốt — {client} còn thiếu {fmt(owe)}` + mô tả `Đã giao {n} ngày trước
  ({fmtDate(deliveredAt)}). Gửi email "Nhắc thanh toán" một câu thôi.`
  Chạm vào mục → mở chi tiết job; trong chi tiết job hiện nút gợi ý gửi email `balance`
  (dùng `suggestEmail(j, 'balance', …)` / `openComposer` đã có, không viết composer mới).
  Khi nhắc được hiện (hoặc khi người dùng bấm gửi email), ghi `lastBalanceRemindAt = hôm nay`,
  `saveLocal()` — để ngày mai mới nhắc lại.
- Sau 7 ngày kể từ `deliveredAt` mà vẫn `jobOwe(j) > 0`: mục nhắc đổi sang màu đỏ + thêm
  cảnh báo "job kẹt ở bước Đã giao" — **dùng sẵn `stuckInfo()`** (dòng 1021–1032: job ở 1 bước
  ≥ 7 ngày đã tự thành "kẹt"), không viết logic kẹt riêng; chỉ cần đảm bảo `todayItems()`
  không tạo 2 mục trùng nhau cho cùng 1 job (gộp: nếu đã có mục kẹt thì mục nhắc thu nốt
  hiển thị trong cùng 1 thẻ, hoặc ưu tiên mục nhắc thu nốt và bỏ mục kẹt trùng).
- Không thay đổi quy tắc v1: sang "Xong" còn thiếu tiền vẫn phải xác nhận
  "Vẫn xong, thiếu sau" (dòng 1466–1473).
- Local notification (push trong app): **tùy chọn, không bắt buộc cho v1.1** — plugin
  `@capacitor/local-notifications` đã có trong `package.json` nhưng chưa được gọi lần nào
  trong `www/index.html` (xem §0). Nếu làm: nối dây `Capacitor.Plugins.LocalNotifications`
  theo mẫu `Calendar` (dòng 2836, 2992), chỉ lên lịch khi đủ điều kiện §7, id theo job,
  hủy khi thu đủ hoặc job sang "Xong". Nếu không làm: mục "Hôm nay" (§7) đã đủ tiêu chí
  chấp nhận §9.1. **Không được giả vờ đã có push khi chưa nối dây.**

### 3.7. Cài đặt: số ảnh / hạn chọn / số ngày nhắc thu nốt
- Thêm vào mục "Cọc & giao ảnh" trong Cài đặt (dòng 2386–2388), sau ô "Giao sau (ngày)":
  xem §8 (bảng cài đặt đầy đủ + mặc định + giới hạn).
- `mergeCfg()` (dòng 820–834) phải merge + ép kiểu 3 cài đặt mới giống `deliverDays`
  (`cleanNum`, kẹp min/max); file cài đặt v1 cũ thiếu chúng → nhận mặc định, không lỗi.

### 3.8. Cập nhật `TESTFLIGHT-CHECKLIST.md` — kiểm chứng
- Thêm 1 ca test "giao ảnh 6 bước" theo đúng §9.1 (job Wedding, 32 mã / gói 30, checklist
  32/32, giao, tick tải, nhắc thu nốt sau 3 ngày, xong khi thu đủ) + 1 ca "mở file sao lưu
  v1 cũ" (§9.2) + 1 ca "tắt mạng" (§9.3).
- Làm **sau khi code xong**, trong cùng commit v1.1 — không sửa checklist trước khi code.

## 4. Mục chọn ảnh + checklist hậu kỳ (logic chi tiết)

### 4.1. Parse mã ảnh
```
parseCodes(text):
  tách bằng dấu phẩy / khoảng trắng / xuống dòng
  mỗi mã: trim, bỏ rỗng, giới hạn 40 ký tự, giữ nguyên chữ hoa/thường như nhập
  bỏ trùng (giữ lần xuất hiện đầu tiên), giữ thứ tự nhập
  tối đa 500 mã (vượt thì cắt + toast "Chỉ nhận 500 mã đầu tiên")
```
- Lưu `pickedCodes` + `pickedAt`; đồng thời dọn `photoStatus`: xóa key không còn trong
  `pickedCodes`, key mới mặc định `0`.

### 4.2. Đối chiếu số ảnh trong gói + phí retouch thêm
```
extra = max(0, pickCount - includedPhotos)   // chỉ khi includedPhotos > 0; =0 nghĩa không giới hạn
extraFee = extra * cfg.retouch
```
- Hiện ngay dưới ô nhập mã, cập nhật theo thời gian thực khi nhập:
  - `includedPhotos > 0` và `pickCount > includedPhotos`:
    `Đã chọn {pickCount}/{includedPhotos} tấm — {extra} tấm tính thêm phí retouch
    ({fmt(extraFee)})` (màu cam, cảnh báo).
  - `pickCount <= includedPhotos`: `Đã chọn {pickCount}/{includedPhotos} tấm` (bình thường).
  - `includedPhotos === 0`: `Đã chọn {pickCount} tấm (gói không giới hạn số ảnh)`.
- `extraFee` **chỉ hiển thị để photographer biết** — không tự cộng vào `j.price` (giá job
  không tự đổi). Cách thu: khi giao, gợi ý tạo 1 khoản thu "Thêm ảnh retouch" bằng
  `openTxForm({jobId, kind:'thu', category:'Thêm ảnh retouch', amount:extraFee})`
  (hạng mục đã có trong `THU_CATS`, dòng 796); photographer bấm xác nhận mới ghi.
  Nếu `extraFee === 0` thì không hiện gợi ý này.
- Ví dụ kiểm chứng (§9.1): gói Wedding gồm 30, khách chọn 32 → `extra = 2`,
  `extraFee = 2 × cfg.retouch`, hiện trước khi giao.

### 4.3. Checklist hậu kỳ
- Trạng thái: `0 = chưa làm`, `1 = đang làm`, `2 = xong`. Chạm 1 lần: `0 → 1 → 2 → 0`
  (vòng tròn, cho phép quay lại khi làm sai).
- Đếm: `Đã xong X/N` với `X = số mã có photoStatus === 2`. Thanh tiến độ dùng lại kiểu
  `stepsBar` nếu tiện, không bắt buộc.
- Thứ tự hiển thị: theo thứ tự `pickedCodes`; mã chưa xong lên trước, mã xong xuống dưới
  (tùy chọn — nếu làm thì chỉ đổi thứ tự hiển thị, không đổi `pickedCodes`).
- Gợi ý chuyển bước: khi `X === N > 0` → hiện nút "Chuyển sang bước Hậu kỳ → Đã giao"
  (thực chất là gợi ý mở bộ chọn bước đã có; không tự đổi `stage`).
- Không lưu ảnh, không thumbnail, không upload — chỉ mã + trạng thái (local-first, offline được).

## 5. Tách link xem trước / giao chính thức

| | Link xem trước | Link giao chính thức |
|---|---|---|
| Trường | `previewLink` (mới) | `driveLink` (giữ nguyên, tương thích file cũ) |
| Thư mục Drive | Thư mục con "Xem trước" trong thư mục Drive của job — ảnh nhỏ, nên có watermark (xem §10.2) | Thư mục giao chính thức, khác thư mục xem trước |
| Dùng ở | Mẫu "Nhắc khách chọn ảnh" (`{drive}` = `previewLink`); nút "Mở thư mục xem trước" | Mẫu email `deliver` (`{drive}` = `driveLink`); nút "Mở thư mục Drive" |
| Ghi ngày | `previewSentAt` khi bấm "Đã gửi link xem trước" | `deliveredAt` khi chuyển sang "Đã giao" |
| Trống thì sao | Ô trống + gợi ý "Dán link thư mục Xem trước" | Hành vi cũ: toast "Dán link Drive vào ô phía trên trước nha" (dòng 1536) |

- Cả hai ô đều qua `safeUrl()` (chặn `javascript:`, `data:`, … như dòng 886).
- Drive picker (`openDrivePicker`, dòng 3434–3449): hỏi gắn vào ô nào trước khi gán;
  mặc định ô giao. Không đổi scope — vẫn `drive.metadata.readonly` (chỉ xem tên thư mục).

## 6. Tick tay "Khách đã tải" — giới hạn phải ghi rõ

**Sự thật kỹ thuật (đã kiểm chứng bằng code v1):** app **không đo được** khách đã tải ảnh hay chưa.
- Link Drive mở bằng trình duyệt / app Drive ngoài FotoBro — app không thấy hành vi đó.
- Google Drive API mà app dùng chỉ có scope `drive.metadata.readonly`
  (`SC.drive`, dòng 3202: `https://www.googleapis.com/auth/drive.metadata.readonly`) —
  chỉ đọc tên/metadata thư mục, **không có sự kiện "ai đã tải file nào"**, không đếm lượt tải.
- Vì vậy v1.1 dùng **xác nhận tay**: photographer tick sau khi khách báo đã tải, hoặc sau khi
  gửi link được 2 ngày mà khách không báo lỗi. App ghi `downloadedAt` + `downloadedNote`,
  **không tự động suy ra từ Drive**.
- UI phải ghi rõ dòng chú thích dưới ô tick (xem §3.5) — không được để giao diện gợi ý rằng
  app tự theo dõi được.
- **Không làm ở v1.1:** link tải có hạn / đếm lượt tải / trang tải riêng (cần backend hoặc
  dịch vụ giao ảnh riêng, ngoài phạm vi local-first).

## 7. Nhắc thu nốt tự động sau 3 ngày

- Mốc: `deliveredAt` (ghi tự động khi sang "Đã giao", §3.4). Job cũ không có `deliveredAt`
  thì không nhắc tự động (chỉ nhắc thủ công như v1).
- Ngưỡng: `cfg.remindAfterDays` ngày (mặc định **3**, cho sửa trong Cài đặt §8).
- Tần suất: tối đa **1 lần/ngày/job**, khóa bằng `lastBalanceRemindAt` (§2).
- Kênh chính (bắt buộc): mục nhắc trên màn "Hôm nay" trong `todayItems()` (§3.6) — làm được
  offline, không cần quyền gì thêm.
- Kênh phụ (tùy chọn): local notification — chỉ khi nối dây plugin đã có trong
  `package.json` (xem §0, §3.6); không có push thì vẫn đạt tiêu chí.
- Sau 7 ngày chưa thu đủ: nhắc lại kèm cảnh báo kẹt — dùng sẵn `stuckInfo()` (§3.6),
  không viết logic kẹt mới.
- Nội dung nhắc: tên khách + số còn thiếu (`jobOwe(j)`) + số ngày từ khi giao + nút gợi ý
  gửi email `balance` (mẫu đã có: tổng / đã nhận / còn lại).

## 8. Cài đặt mới (thêm vào mục "Cọc & giao ảnh", dòng 2386–2388)

Thêm vào `DEFAULT_CFG` (dòng ~812–819) + `mergeCfg()` (ép kiểu như `deliverDays`, dòng 830–831):

| Cài đặt | Key `cfg.*` | Mặc định | Giới hạn | Ghi chú |
|---|---|---|---|---|
| Số ảnh bao gồm theo gói | `includedPhotos` (object theo loại job, như `prices`) | `{Portrait:0, Couple:0, Wedding:0, Lookbook:0, Event:0}` — **0 = không giới hạn** | 0–999 / gói | Khi tạo job, `j.includedPhotos` lấy theo `j.type`; cho sửa riêng từng job trong chi tiết job. Chờ Việt chốt §10.1 — nếu Việt chốt số cụ thể từng gói thì đổi mặc định tại đây, không đổi logic |
| Số ngày hạn chọn ảnh | `pickDays` | `3` | 0–30 (0 = không đặt hạn) | `pickDeadline = previewSentAt + pickDays` |
| Số ngày nhắc thu nốt | `remindAfterDays` | `3` | 1–30 | Ngưỡng nhắc tự động §7 |

Nhãn UI (tiếng Việt, theo phong cách Cài đặt hiện tại):
- "Số ảnh gồm trong gói — Portrait / Couple / Wedding / Lookbook / Event (0 = không giới hạn)"
- "Hạn khách chọn ảnh (ngày)"
- "Nhắc thu nốt sau (ngày, kể từ ngày giao)"

## 9. Tiêu chí chấp nhận (theo §5 `PHOTO-DELIVERY.md` — kiểm chứng sau khi code)

1. **Đi hết 6 bước (job Wedding):** tạo job Wedding → gửi link xem trước (`previewSentAt`
   được ghi) → nhập 32 mã ảnh (gói gồm 30) → app báo 2 tấm tính thêm phí retouch
   (`extraFee = 2 × cfg.retouch`) → checklist hậu kỳ xong 32/32 → giao link chính thức,
   `deliveredAt` được ghi, email `deliver` gợi ý đúng link giao → tick "Khách đã tải"
   (`downloadedAt` được ghi) → nhắc thu nốt xuất hiện sau 3 ngày nếu còn thiếu
   (đổi ngày máy / giả lập `deliveredAt` lùi 3 ngày để test) → xong job khi đã thu đủ
   (còn thiếu thì vẫn chặn xác nhận như v1).
2. **Tương thích file cũ:** mở file sao lưu JSON v1 cũ trong app v1.1 — job cũ vẫn mở được,
   11 trường mới trống/mặc định, không lỗi, không mất tiền/job/tx nào.
3. **Offline:** tắt mạng — toàn bộ 6 bước vẫn làm được, ngoại trừ mở link Drive (cần mạng) —
   đúng tính local-first. Nhắc "Hôm nay" vẫn hiện khi offline.
4. **Kiểm tra tĩnh:** `node --check` đạt (file JS trích từ `www/index.html` như quy trình
   test v1); test jsdom của v1.1 đạt; `grep pickedCodes` / `grep deliveredAt` có mặt trong
   code **và** trong file sao lưu JSON xuất ra.
5. **Không hồi quy:** pipeline 8 bước, nhảy bước, job kẹt, toast/cảnh báo thu nốt cũ,
   email `deliver`/`balance`, Drive picker vẫn chạy như v1 (chạy lại các ca cũ trong
   `TESTFLIGHT-CHECKLIST.md`).

## 10. Câu hỏi chờ Việt chốt (theo §6 `PHOTO-DELIVERY.md` — chưa chốt, chưa được code theo hướng nào)

1. **Số ảnh bao gồm trong mỗi gói là bao nhiêu?** Vd Portrait 10, Couple 20, Wedding 50 —
   hay để mỗi photographer tự điền trong Cài đặt, mặc định 0 = không giới hạn?
   → Đề xuất của thiết kế: tự điền, mặc định 0. **Code v1.1 mặc định 0 cho tới khi Việt chốt số khác.**
2. **Ảnh xem trước có watermark / ảnh nhỏ không?** → Đề xuất v1.1: chỉ ghi chú "đăng ảnh nhỏ"
   trong hướng dẫn, không tự đóng watermark (cần xử lý ảnh, nặng cho app).
3. **Khách chọn ảnh bằng mã qua tin nhắn như hiện tại, hay làm trang chọn ảnh riêng?**
   → Đề xuất: giữ cách nhắn mã ở v1.1; trang chọn ảnh để sau (cần backend).

> Chưa có câu trả lời cho cả 3 câu — spec này code theo đúng đề xuất mặc định trong từng câu
> (0 = không giới hạn; chỉ ghi chú ảnh nhỏ; giữ nhắn mã). Nếu Việt chốt khác, chỉ đổi
> mặc định ở §8 / §3.2, không đổi kiến trúc.

## 11. Không làm ở v1.1 (ngoài phạm vi — đã chốt trong `PHOTO-DELIVERY.md` §4)

- Trang chọn ảnh cho khách / link công khai chọn ảnh (cần backend).
- Link tải có hạn, đếm lượt tải, biết khách tải file nào.
- Tự đóng watermark / tự resize ảnh xem trước trong app.
- Lưu ảnh/thumbnail trong app (app chỉ lưu link + mã ảnh; ảnh gốc ở Drive).
- Đổi pipeline 8 bước, đổi khóa lưu `troLyXeo.v1`, đổi nghĩa `driveLink`.
- Tự cộng phí retouch thêm vào `j.price` (chỉ hiển thị + gợi ý tạo khoản thu, §4.2).

## 12. Danh sách file / hàm chạm tới khi code (để coder v1.1 đối chiếu)

| File | Chạm tới | Không chạm |
|---|---|---|
| `www/index.html` | `DEFAULT_CFG` + `mergeCfg()` (§8); `cleanData()` (§2); `jobDetailHTML()` (§3.2–3.5); handler chuyển bước dòng 1466–1482 (ghi `deliveredAt`); `todayItems()` (§3.6); Cài đặt "Cọc & giao ảnh" (§8); `openDrivePicker` (hỏi ô đích, §5); form job dòng 1586/1594 (thêm ô `previewLink`) | `STAGES`, `saveLocal()`, `LS_KEY`, `suggestEmail()`, `fillTpl()`, `MAIL_TPLS_DEFAULT`, `TPLS`, `stuckInfo()`, `jobOwe()` — dùng lại, không sửa logic |
| `TESTFLIGHT-CHECKLIST.md` | Thêm ca test giao ảnh 6 bước (§3.8) — sau khi code xong | — |
| Các file khác | Không | Không sửa `capacitor.config.ts` / `package.json` trừ khi nối dây LocalNotifications (§7) — và nếu nối thì ghi rõ trong commit |

---
*Spec viết ngày 20/11/2026, chỉ đọc code v1 — chưa sửa bất kỳ file code nào. File này là tài liệu
thiết kế code, không phải code chạy được.*
