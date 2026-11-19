# ERROR-LOGGING — Log lỗi chỉ trên máy, không gửi server (FotoBro iOS v1)

> Phạm vi: chỉ là thiết kế, KHÔNG sửa code app.
> Nguyên tắc nền: app local-first, không máy chủ, không tracking — log lỗi cũng vậy.
> **Không dùng SDK crash bên thứ ba** (không Sentry, không Firebase Crashlytics, không
> dịch vụ tương tự) ở v1. Không có log nào tự động rời khỏi máy.
> File này không tạo tài khoản, không push GitHub.

## 0. Quyết định chốt trước khi đọc tiếp

| Quyết định | Nội dung |
|---|---|
| Gửi log đi đâu | Không gửi đi đâu. Chỉ lưu trên máy, chỉ người dùng xem/xoá/xuất thủ công |
| Dùng SDK ngoài không | Không. Logger tự viết, ~100 dòng, không thêm dependency, không thêm quyền |
| Lưu ở đâu | IndexedDB, store riêng `fotobroErrorLogs` (xem §2) — cùng cơ chế lưu trữ app đã dùng, không cần thêm plugin |
| Đồng bộ CloudKit (Nấc 2) | **Không đồng bộ log.** Log không bao giờ vào CloudKit, không vào file backup JSON |
| Gửi kèm email hỗ trợ | **Không tự đính kèm.** Chỉ khi người dùng tự bấm Xuất rồi tự gửi, sau khi đã xem trước nội dung |

## 1. Mục tiêu & tiêu chí đạt / không đạt

Mục tiêu: khi app lỗi, người dùng (hoặc người hỗ trợ, khi được người dùng gửi log)
biết được **lỗi gì, ở tính năng nào, lúc nào, trên bản app nào** — mà không lộ bất cứ
thông tin nào về khách hàng, tiền bạc hay tài khoản của người dùng.

| Chỉ số | Cách kiểm tra | Ngưỡng đạt |
|---|---|---|
| Log được ghi khi lỗi thật xảy ra | Gây lỗi giả ở từng điểm bắt lỗi (§4), mở lại app | Có entry mới, đúng module + mã lỗi, thời gian đúng |
| Không lộ dữ liệu nhạy cảm | Gây lỗi trong khi dữ liệu giả có tên khách, số tiền, token (xem §5) rồi đọc toàn bộ log | 0 lần xuất hiện tên khách / SĐT / email / số tiền / token / nội dung job trong log |
| Giới hạn dung lượng được giữ | Ghi 300 lỗi giả liên tiếp | Tổng số entry ≤ 200, tổng dung lượng ≤ ~500 KB, entry cũ nhất bị xoá trước (FIFO) |
| Log không lọt vào backup / đồng bộ | Xuất backup JSON, kiểm tra file; bật CloudKit (khi có Nấc 2) | File backup không chứa store log; log không xuất hiện trên thiết bị thứ hai |
| Xoá được | Bấm "Xoá toàn bộ nhật ký", rồi "Xoá toàn bộ dữ liệu" (reset app) | Sau mỗi thao tác, store log trống; sau reset, store không còn tồn tại |
| Logger hỏng không làm hỏng app | Làm cho ghi log thất bại (ví dụ IndexedDB bị khoá) rồi dùng app bình thường | App vẫn chạy, không crash, không hiện lỗi lạ cho người dùng; lỗi ghi log không được log đệ quy |

## 2. Lưu ở đâu — và vì sao không phải chỗ khác

### 2.1. Lựa chọn: IndexedDB, store riêng

- Database: dùng chung database IndexedDB của app (cùng chỗ với dữ liệu job/tiền/ảnh).
- Store riêng: `fotobroErrorLogs`, keyPath `id` (tự tăng), index `ts` (thời gian) để
  xoá entry cũ và liệt kê mới-nhất-trước cho nhanh.
- Một entry = một record. Không gom nhiều lỗi vào một record lớn (khó xoá từng cái,
  khó giới hạn dung lượng).

### 2.2. Vì sao không dùng các chỗ khác

| Vị trí | Vì sao không dùng |
|---|---|
| `localStorage` | Giới hạn ~5 MB, ghi đồng bộ (block UI), không có index để xoá entry cũ |
| `Documents/` (qua Filesystem plugin) | File xuất hiện trong app Files, bị backup lên iCloud — log không phải dữ liệu người dùng, không được backup |
| `Library/Caches/` (qua Filesystem plugin) | Đúng về mặt "không backup", nhưng cần thêm plugin + quyền + code native cho một nhu cầu mà IndexedDB đã đáp ứng; để dành nếu sau này log vượt khỏi IndexedDB |
| CloudKit / server / SDK crash | Trái nguyên tắc local-first của v1; log là dữ liệu chẩn đoán, không phải dữ liệu người dùng, không được rời máy nếu không có đồng ý rõ ràng |
| `console.log` / `console.error` | Chỉ tồn tại trong phiên chạy, mất khi đóng app, người dùng không xem được — dùng để debug lúc dev, không thay cho log lưu trữ |

### 2.3. Vòng đời của log

- Tồn tại qua đóng/mở app, qua cập nhật app (cùng database, không xoá khi nâng cấp).
- **Không** bị xoá khi người dùng chỉ xoá ảnh hay xoá một job.
- Bị xoá khi: (a) quá hạn 30 ngày (tự dọn, xem §3), (b) người dùng bấm xoá (§6),
  (c) người dùng reset toàn bộ dữ liệu (xoá cả database, log đi theo).
- Không bao giờ được khôi phục từ backup (backup không chứa log — xem §2.1 và §6.3).

## 3. Log gì, định dạng nào, giới hạn ra sao

### 3.1. Một entry log gồm những trường này — và chỉ những trường này

```json
{
  "id": 42,
  "ts": "2026-11-20T09:15:03.120+07:00",
  "level": "error",
  "code": "STORAGE_WRITE_FAIL",
  "module": "backup",
  "message": "IndexedDB put failed after 3 retries",
  "stack": "put@www/index.html:… (rut gon, chi frame cua app)",
  "appVersion": "1.0.0",
  "iosVersion": "17.4",
  "context": "screen=settings"
}
```

| Trường | Quy định |
|---|---|
| `ts` | Thời gian ISO 8601 có múi giờ máy. Bắt buộc — không có thời gian thì log vô dụng |
| `level` | Chỉ 2 mức ở bản release: `error` (lỗi làm tính năng thất bại) và `warning` (lỗi đã tự phục hồi, ví dụ retry lần 1 thành công). **Không log `info`/`debug` ở bản release** — log debug chỉ bật bằng cờ dev, không ship cho người dùng |
| `code` | Mã lỗi dạng `MODULE_NGUYEN_NHAN`, lấy từ bảng §4.2. Không dùng message tự do làm mã |
| `module` | Tên tính năng: `home`, `job`, `money`, `calendar`, `photo`, `backup`, `auth`, `notif`, `settings`, `app` |
| `message` | Câu mô tả kỹ thuật ngắn, viết sẵn trong code (không ghép từ dữ liệu người dùng). Tối đa 1.000 ký tự, dài hơn thì cắt + thêm `…[truncated]` |
| `stack` | Stack trace đã rút gọn: tối đa 3.000 ký tự, chỉ giữ frame của app, bỏ frame của thư viện hệ thống. **Không có stack thì vẫn log** — thiếu stack tốt hơn là không có log |
| `appVersion` | Phiên bản app (ví dụ `1.0.0`). Để biết lỗi thuộc về bản nào khi người dùng gửi log |
| `iosVersion` | Phiên bản iOS dạng `17.4` (lấy từ user agent). Không lấy mẫu máy chi tiết, không lấy IDFV/IDFA/serial |
| `context` | Chỉ tên màn hình đang mở (`screen=job-detail`) hoặc tên thao tác (`action=export-json`). **Không** ghi id của job, không ghi tên khách, không ghi số tiền |

### 3.2. Giới hạn dung lượng (ring buffer — đầy thì xoá cũ nhất)

| Giới hạn | Số | Ghi chú |
|---|---|---|
| Số entry tối đa | 200 | Đủ để chẩn đoán; lỗi lặp lại 200 lần thì 200 entry đầu đã nói hết vấn đề |
| Tổng dung lượng ước tính | ≤ ~500 KB | 200 entry × ~2,5 KB/entry trung bình; không đo chính xác từng byte, đếm entry là chính |
| Một entry tối đa | ~4 KB | `message` ≤ 1.000 ký tự, `stack` ≤ 3.000 ký tự; vượt thì cắt, không được từ chối ghi |
| Tuổi tối đa | 30 ngày | Entry quá 30 ngày tự xoá khi app mở (dọn 1 lần mỗi lần mở, không dọn liên tục) |
| Ghi trùng lặp | Gộp | Cùng `code` + `module` lặp lại trong 60 giây thì tăng `count` của entry đó, cập nhật `ts` mới nhất, không tạo entry mới — tránh 1 lỗi lặp (ví dụ đồng bộ lịch lỗi) lấp đầy cả log trong vài phút |

Cơ chế cắt ngắn (prune): chạy (a) sau mỗi lần ghi log, (b) khi app mở. Xoá entry cũ nhất
(theo `ts`) cho tới khi còn ≤ 200 entry. Prune không được throw — nếu prune lỗi thì bỏ qua,
lần mở app sau prune lại.

### 3.3. Logger không được làm chậm hay làm hỏng app

- Ghi log là **bất đồng bộ, fire-and-forget**: không `await` ở đường đi chính của người
  dùng, không block UI để chờ ghi log xong.
- Nếu ghi log thất bại (IndexedDB lỗi, đầy bộ nhớ): **nuốt lỗi lặng lẽ** — không hiện
  thông báo cho người dùng, không thử log lại lỗi của chính logger (đệ quy vô hạn),
  không crash app. Ghi log thất bại là chuyện nhỏ; app chạy tiếp mới là chuyện lớn.
- Logger không được `throw`. Mọi hàm public của logger đều có `try/catch` bao ngoài.

## 4. Bắt lỗi ở đâu

### 4.1. Hai lớp bắt lỗi

**Lớp 1 — bẫy toàn cục (bắt lỗi không ai ngờ tới):**

| Bẫy | Ghi gì |
|---|---|
| `window.onerror` | Lỗi JS không được catch: `code = APP_UNCAUGHT`, `message` = message của lỗi (đã qua bộ lọc §5), `stack` = stack nếu có |
| `window.onunhandledrejection` | Promise bị reject không ai xử lý: `code = APP_UNHANDLED_REJECTION`, `message` = lý do reject đã rút gọn (không phải object dữ liệu — chỉ lấy `String(reason)` rồi lọc) |

Cả hai bẫy chỉ log, không chặn hành vi mặc định của trình duyệt, không hiện thêm
popup cho người dùng. Người dùng đã thấy thông báo lỗi thân thiện của app (nếu có);
log chỉ là bản ghi phía sau.

**Lớp 2 — bắt có chủ đích tại ranh giới dễ lỗi (nơi biết trước lỗi có thể xảy ra):**

| Ranh giới | Ví dụ lỗi | Ghi chú |
|---|---|---|
| Đọc/ghi IndexedDB (job, tiền, ảnh, cài đặt) | Ghi thất bại, đọc trả về rỗng bất thường, quota đầy | Đây là ranh giới quan trọng nhất — mất dữ liệu là lỗi nghiêm trọng nhất của app local-first |
| Backup / khôi phục JSON | File backup hỏng, JSON parse lỗi, khôi phục thiếu trường | Log mã lỗi + số trường thiếu (con số), không log nội dung file |
| Đăng nhập Google (auto 1 chạm) | Người dùng huỷ, token hết hạn, mạng lỗi | Chỉ log mã lỗi; **không bao giờ** log token, email trả về, hay nội dung phản hồi của Google (xem §5) |
| Nhập Lịch iPhone (EventKit, native) / xuất `.ics` | Không có quyền lịch, sự kiện lỗi, file `.ics` tạo thất bại | Log mã lỗi + số sự kiện đã nhập được (con số), không log tiêu đề sự kiện |
| Ảnh (thu nhỏ, lưu, xoá) | Ảnh lỗi định dạng, thu nhỏ thất bại, lưu IndexedDB đầy | Log kích thước file gốc (con số, KB) được; không log tên file, không log nội dung ảnh |
| Nhắc lịch / thông báo | Đặt nhắc thất bại, quyền thông báo bị từ chối | Log mã lỗi; không log nội dung nhắc (có thể chứa tên khách) |
| Tính tiền / báo cáo | Số tiền không hợp lệ, chia cho 0, làm tròn lỗi | Log mã lỗi; **không log số tiền** (xem §5) |
| Mạng (khi cần: Google, tải ảnh bìa) | Timeout, mất mạng | Log `NET_TIMEOUT` / `NET_OFFLINE`; không log URL đầy đủ nếu URL chứa tham số (token, email) |

Nguyên tắc: **log rồi xử lý cho người dùng** — log xong vẫn phải hiện thông báo thân
thiện ("Không lưu được, thử lại nhé") và giữ app dùng được. Không bao giờ chỉ log mà
không báo cho người dùng khi tính năng của họ vừa thất bại.

### 4.2. Bảng mã lỗi (dùng đúng các mã này, không tự bịa mã mới khi sửa code)

| Mã | Module | Ý nghĩa |
|---|---|---|
| `APP_UNCAUGHT` | `app` | Lỗi JS không được catch (bẫy toàn cục) |
| `APP_UNHANDLED_REJECTION` | `app` | Promise reject không được xử lý |
| `APP_START_FAIL` | `app` | App mở lên lỗi ở bước khởi tạo |
| `STORAGE_READ_FAIL` | `job` / `money` / `photo` / `settings` | Đọc IndexedDB thất bại |
| `STORAGE_WRITE_FAIL` | `job` / `money` / `photo` / `settings` | Ghi IndexedDB thất bại |
| `STORAGE_QUOTA_FULL` | `photo` / `backup` | Hết dung lượng lưu trữ (ảnh, backup) |
| `BACKUP_EXPORT_FAIL` | `backup` | Xuất file backup thất bại |
| `BACKUP_IMPORT_FAIL` | `backup` | File backup hỏng / không đọc được |
| `BACKUP_RESTORE_INCOMPLETE` | `backup` | Khôi phục thiếu trường (ghi số trường thiếu) |
| `AUTH_GOOGLE_CANCELLED` | `auth` | Người dùng huỷ đăng nhập Google |
| `AUTH_GOOGLE_TOKEN_FAIL` | `auth` | Lấy/refresh token thất bại (không log token) |
| `AUTH_GOOGLE_NETWORK_FAIL` | `auth` | Lỗi mạng khi đăng nhập Google |
| `CAL_IMPORT_FAIL` | `calendar` | Nhập Lịch iPhone thất bại |
| `CAL_EXPORT_FAIL` | `calendar` | Tạo file `.ics` / thêm vào Lịch thất bại |
| `CAL_PERMISSION_DENIED` | `calendar` | Không có quyền truy cập Lịch |
| `PHOTO_SHRINK_FAIL` | `photo` | Thu nhỏ ảnh thất bại |
| `PHOTO_SAVE_FAIL` | `photo` | Lưu ảnh thất bại |
| `NOTIF_SCHEDULE_FAIL` | `notif` | Đặt nhắc lịch thất bại |
| `NOTIF_PERMISSION_DENIED` | `notif` | Quyền thông báo bị từ chối |
| `MONEY_CALC_FAIL` | `money` | Tính tiền gặp giá trị không hợp lệ |
| `NET_TIMEOUT` / `NET_OFFLINE` | `app` | Hết thời gian chờ / mất mạng |

Mã mới chỉ được thêm khi có tính năng mới; thêm mã thì thêm 1 dòng vào bảng này.

## 5. KHÔNG log gì — danh sách cấm (quan trọng nhất của file này)

### 5.1. Nguyên tắc: allowlist, không phải blocklist

- Chỉ log những trường liệt kê ở §3.1, với nội dung viết sẵn trong code.
- **Không bao giờ** đưa dữ liệu người dùng nhập, dữ liệu đọc từ job/khách, hay nội dung
  phản hồi từ dịch vụ ngoài vào `message` / `stack` / `context` — dù là để "debug cho dễ".
- Mọi chỗ gọi logger chỉ được truyền: mã lỗi (§4.2) + module + **con số đếm được**
  (số sự kiện, số trường thiếu, kích thước KB) hoặc **enum có sẵn**. Không truyền chuỗi
  tự do từ người dùng hay từ server.

### 5.2. Danh sách cấm tuyệt đối

| Loại dữ liệu | Ví dụ | Vì sao cấm |
|---|---|---|
| Tên khách, SĐT, email, địa chỉ | Tên, số điện thoại, email khách, địa điểm chụp | Thông tin cá nhân của khách hàng — lộ ra là vi phạm niềm tin, kể cả khi log chỉ ở trên máy |
| Nội dung job / ghi chú / mẫu tin nhắn | Ghi chú job, nội dung tin nhắn soạn cho khách, tiêu đề sự kiện lịch | Có thể chứa thông tin riêng tư của khách và của người dùng |
| Tiền bạc | Số tiền job, tiền cọc, tiền còn thiếu, giá gói, doanh thu | Dữ liệu tài chính — không bao giờ xuất hiện trong log |
| Token / mật khẩu / khoá | Google access token, refresh token, ID token, PIN khoá app, mật khẩu | Lộ token = mất tài khoản; log không bao giờ được chứa credential dưới bất kỳ dạng nào |
| Nội dung phản hồi API | Body trả về từ Google, lỗi HTTP đầy đủ | Thường chứa email, token, hoặc dữ liệu người dùng lẫn trong đó |
| Tên file / đường dẫn có tên người | Tên file ảnh, đường dẫn file backup | Tên file do người dùng đặt có thể chứa tên khách |
| Ảnh | Blob ảnh, base64, thumbnail | Không bao giờ log dữ liệu ảnh |
| Định danh thiết bị | IDFV, IDFA, serial, UDID | Không cần để chẩn đoán lỗi; thu thập là tracking |
| Vị trí | GPS, địa chỉ IP | Không cần để chẩn đoán lỗi |

### 5.3. Bộ lọc tẩy (scrubber) — lớp phòng thủ thứ hai

Dù §5.1 đã cấm từ đầu vào, logger vẫn chạy một bộ lọc tẩy trên `message` và `stack`
trước khi ghi, phòng trường hợp lỗi hệ thống tự mang theo dữ liệu nhạy cảm
(ví dụ message lỗi của trình duyệt chứa URL có email):

- Email → thay bằng `[email]`.
- Dãy số giống SĐT (9–11 chữ số liên tiếp, có/không có `+84`/`0` đầu) → `[phone]`.
- Token: chuỗi bắt đầu bằng `ya29.`, `eyJ` (JWT), hoặc dài > 40 ký tự không có khoảng
  trắng nằm trong thông báo lỗi → `[token]`.
- Số tiền: số đi kèm `VND`, `đ`, `₫`, `$` trong message lỗi → `[amount]`.
- URL có query string (`?...`) → chỉ giữ phần path, bỏ toàn bộ query.

Bộ lọc này là **phòng thủ**, không phải giấy phép để truyền dữ liệu nhạy cảm vào
logger — code review vẫn phải bắt lỗi ở đầu vào (§5.1) trước.

### 5.4. Ví dụ đúng / sai

```js
// ✅ ĐÚNG — chỉ mã lỗi + con số
logError('CAL_IMPORT_FAIL', 'calendar', 'EventKit import failed', { imported: 12, failed: 2 });

// ✅ ĐÚNG — message viết sẵn, không ghép dữ liệu người dùng
logError('STORAGE_WRITE_FAIL', 'job', 'IndexedDB put failed after 3 retries');

// ❌ SAI — ghép tên khách vào message
logError('STORAGE_WRITE_FAIL', 'job', 'Save failed for client ' + job.clientName);

// ❌ SAI — log cả object lỗi từ Google (có thể chứa token/email)
logError('AUTH_GOOGLE_TOKEN_FAIL', 'auth', JSON.stringify(err));

// ❌ SAI — log số tiền để "debug tính tiền"
logError('MONEY_CALC_FAIL', 'money', 'Total mismatch: expected ' + total + ' got ' + sum);
```

## 6. Người dùng xem, xuất, xoá log thế nào

### 6.1. Xem log trong app

- Vị trí: **Cài đặt → Hỗ trợ → Nhật ký lỗi**. Không đặt ở màn hình chính, không hiện
  badge số lỗi — log là công cụ chẩn đoán, không phải thứ nhắc người dùng mỗi ngày.
- Màn hình liệt kê: mới nhất lên đầu, mỗi dòng hiện thời gian + mã lỗi + module
  (ví dụ `20/11 09:15 · STORAGE_WRITE_FAIL · backup`). Bấm vào một dòng để xem chi
  tiết đầy đủ của entry đó.
- Lọc: theo mức (`error` / `warning` / tất cả) và theo module. Tìm kiếm theo mã lỗi.
- Nếu chưa có lỗi nào: hiện "Chưa ghi nhận lỗi nào. Tốt lắm!" — không hiện màn hình trống.

### 6.2. Xoá log

| Cách xoá | Hành vi |
|---|---|
| Nút "Xoá toàn bộ nhật ký" (trong màn hình Nhật ký lỗi) | Hỏi xác nhận 1 lần ("Xoá hết nhật ký lỗi trên máy này?"), rồi xoá toàn bộ store. Không hỏi lại từng entry |
| Tự động | Entry quá 30 ngày tự xoá khi mở app (§3.2); entry cũ nhất tự xoá khi vượt 200 entry |
| Reset toàn bộ dữ liệu | Xoá cả database IndexedDB — log đi theo, không còn gì |
| Xoá app khỏi máy | iOS xoá toàn bộ sandbox — log biến mất cùng app |

Không có cách nào khôi phục log đã xoá — và đó là đúng: log đã xoá thì thôi, app vẫn
chạy bình thường.

### 6.3. Xuất log (khi người dùng cần gửi cho người hỗ trợ)

- Nút "Xuất nhật ký" trong màn hình Nhật ký lỗi → tạo file `fotobro-error-log.txt`
  (định dạng JSONL, 1 entry 1 dòng, giống §3.1) → mở Share Sheet của iOS để người
  dùng tự chọn gửi qua đâu (Mail, Messages, lưu vào Files…).
- **Trước khi mở Share Sheet, hiện màn hình xem trước** toàn bộ nội dung sẽ xuất,
  kèm dòng cảnh báo: "File này chỉ chứa mã lỗi kỹ thuật, không chứa tên khách hay
  số tiền. Hãy xem lại trước khi gửi."
- Không tự đính kèm log vào email hỗ trợ, không tự mở Mail với file đính kèm sẵn —
  người dùng phải là người bấm gửi, sau khi đã xem.
- File xuất **không** chứa dữ liệu job/tiền/ảnh — chỉ chứa store log. Tên file không
  chứa tên người dùng hay tên máy.

## 7. Kiểm thử (checklist — chạy trước khi giao v1)

| # | Kiểm thử | Cách làm | Đạt khi |
|---|---|---|---|
| 1 | Log được ghi | Gây lỗi giả: gọi `logError` trực tiếp + gây lỗi IndexedDB giả | Entry mới xuất hiện trong màn hình Nhật ký lỗi, đúng mã + module + thời gian |
| 2 | Bẫy toàn cục hoạt động | Gây lỗi không được catch + promise reject không xử lý | Cả hai đều có entry `APP_UNCAUGHT` / `APP_UNHANDLED_REJECTION` |
| 3 | Giới hạn 200 entry | Ghi 300 lỗi giả liên tiếp | Còn đúng 200 entry, entry cũ nhất đã mất, app không chậm rõ rệt |
| 4 | Giới hạn tuổi 30 ngày | Chèn entry giả có `ts` 31 ngày trước, mở lại app | Entry đó biến mất |
| 5 | Gộp trùng lặp | Gây cùng một lỗi 10 lần trong 1 phút | Chỉ 1 entry, `count = 10` |
| 6 | Không lộ tên khách / tiền | Đặt tên khách giả + số tiền giả, gây lỗi ở màn hình job và màn hình tiền, đọc toàn bộ log (kể cả `stack`) | Không tìm thấy tên khách, SĐT, email, số tiền trong bất kỳ entry nào |
| 7 | Không lộ token | Gây lỗi đăng nhập Google giả với token giả trong object lỗi | Không tìm thấy token (kể cả một phần) trong log |
| 8 | Bộ lọc tẩy | Gọi logger với message chứa email + SĐT giả (mô phỏng lỗi hệ thống) | Trong log chỉ còn `[email]`, `[phone]` |
| 9 | Backup không chứa log | Xuất backup JSON khi log đang có 50 entry | File backup không chứa chuỗi `fotobroErrorLogs`, không chứa mã lỗi nào |
| 10 | Xoá thủ công | Bấm "Xoá toàn bộ nhật ký" | Store trống; màn hình hiện "Chưa ghi nhận lỗi nào" |
| 11 | Reset xoá log | Reset toàn bộ dữ liệu | Store log không còn tồn tại |
| 12 | Logger hỏng không hỏng app | Khoá IndexedDB (mô phỏng), rồi dùng các tính năng chính | App vẫn chạy, không crash, không hiện lỗi lạ |
| 13 | Xuất log | Bấm "Xuất nhật ký", xem trước rồi chia sẻ | File chỉ chứa entry log, xem trước hiện đúng nội dung, không tự gửi đi |
| 14 | Log sống qua khởi động lại | Ghi lỗi, đóng app hẳn (swipe khỏi đa nhiệm), mở lại | Entry vẫn còn |

## 8. Những gì KHÔNG làm ở v1 (để dành, cần quyết riêng)

| Việc | Vì sao chưa làm |
|---|---|
| Gửi log tự động về server / Crashlytics | Trái nguyên tắc local-first; cần đồng ý rõ ràng của người dùng + đánh giá riêng về quyền riêng tư, không gộp vào v1 |
| Log mức `info`/`debug` ở bản release | Tăng dung lượng, tăng rủi ro lộ dữ liệu, không cần cho chẩn đoán lỗi |
| Đồng bộ log qua CloudKit (Nấc 2) | Log không phải dữ liệu người dùng; đồng bộ log là rò rỉ chẩn đoán sang thiết bị khác mà không có lợi ích rõ ràng |
| Ghi log ra file trong `Documents/` | Cần plugin Filesystem, file lọt vào Files/iCloud backup — xem §2.2 |
| Thống kê "tỉ lệ crash" tự động | Không có server thì không có thống kê tập trung; tỉ lệ crash chỉ biết qua log người dùng tự gửi |
| Giữ log quá 30 ngày | Log cũ hết giá trị chẩn đoán (đã qua nhiều bản app); giữ lâu chỉ tăng rủi ro |

## 9. Ghi chú cho người viết code (tóm tắt 1 trang)

1. Viết 1 module logger duy nhất, mọi chỗ khác gọi nó — không ai tự ghi IndexedDB log trực tiếp.
2. Logger có 2 hàm public: `logError(code, module, message, safeCounts?)` và
   `logWarning(code, module, message, safeCounts?)`. Không có hàm log nhận chuỗi tự do
   từ dữ liệu người dùng.
3. Thứ tự trong hàm ghi: tẩy (scrub) → cắt ngắn (truncate) → gộp trùng lặp → ghi
   IndexedDB (không await ở caller) → prune.
4. Bẫy toàn cục `onerror` / `onunhandledrejection` đăng ký ngay khi app khởi động,
   trước khi chạy code tính năng.
5. Mọi `catch` ở ranh giới §4.1 đều gọi logger **rồi mới** hiện thông báo thân thiện
   cho người dùng. Không catch rồi im lặng.
6. Màn hình Nhật ký lỗi + nút Xoá + nút Xuất là một phần của v1, không phải tính năng
   để sau — log mà người dùng không xem/xoá được thì chỉ là dữ liệu chết.
