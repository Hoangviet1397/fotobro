# NETWORK-RETRY — Chính sách thử lại khi gọi Google API

> FotoBro iOS v1 · Ngày soạn: 20/11/2026
> Phạm vi: mọi lệnh gọi Google từ app — Calendar API, Gmail API, People API,
> Drive API và endpoint đổi code lấy token (`oauth2.googleapis.com/token`).
> Trạng thái: **chính sách, chưa code**. Code hiện tại (`www/index.html`) gọi
> mỗi API đúng 1 lần, không thử lại, không timeout — tài liệu này quy định
> hành vi phải có trước khi sửa code.

## 0. Hiện trạng cần biết (đọc code ngày 20/11/2026)

- Điểm gọi duy nhất cần sửa: `gApi()` (Calendar), `gGet()` (Gmail / People /
  Drive), `gSend()` (ghi Lịch + gửi Gmail), `gExchangeCode()` (đổi code lấy
  token). Sửa ở **một wrapper chung**, không vá retry rải rác từng tính năng.
- Token: access token chỉ nằm trong `sessionStorage` (`troLyXeo.gtoken`),
  hết hạn sau ~1 giờ; `gToken()` đã coi token hết hạn trước 60 giây là hết.
  **V1 cố tình KHÔNG lưu refresh token** (xem `SECURITY-AUDIT.md` H2 và
  comment trong `gExchangeCode`) — nên không có chuyện "refresh token rồi
  thử lại". Hết hạn thì đăng nhập lại im lặng bằng `gConnect(true)`
  (`prompt=none`).
- Client ID chung vẫn là placeholder rỗng (`fotobro-config.js`:
  `googleClientId: ''`). Chưa có Client ID thật thì **không gọi, không thử
  lại** — `gConnect()` đã chặn và báo "chưa sẵn sàng". Chính sách này chỉ
  có hiệu lực khi đã có Client ID thật.
- Dữ liệu đã lưu để xem khi mất mạng: Lịch trong `localStorage`
  (`troLyXeo.gcal`), Gmail (`troLyXeo.gmail`), Danh bạ (`troLyXeo.gcontacts`).
  Thử lại thất bại thì **hiện dữ liệu cũ + báo rõ**, không hiện màn hình trắng.
- `fetch()` hiện không có timeout. Mọi lệnh gọi trong chính sách này đều phải
  có timeout (xem §5), nếu không "thử lại" không bao giờ chạy vì request
  treo mãi.
- `pool()` (Gmail, đồng thời 5) hiện nuốt lỗi từng thư thành `null`. Retry
  (nếu có) áp dụng **theo từng request con**, không thử lại cả lô vì 1 thư lỗi.

## 1. Nguyên tắc

1. **Không thử lại vô hạn. Không bao giờ.** Mọi lệnh gọi có số lần tối đa
   cố định (xem §3). Hết số lần thì dừng hẳn, báo người dùng 1 lần, chờ
   người dùng bấm lại (hoặc lần đồng bộ sau).
2. **Chỉ thử lại lỗi tạm thời.** Mất mạng, timeout, 429, 500/502/503/504 là
   tạm thời. Lỗi do quyền, do cấu hình, do dữ liệu sai là vĩnh viễn với
   lần gọi đó — thử lại chỉ tốn quota và làm người dùng chờ vô ích.
3. **Đọc thì thử lại thoải mái hơn, ghi thì chặt hơn.** GET là idempotent
   (gọi lại không tạo trùng). POST tạo sự kiện Lịch và POST gửi Gmail thì
   **không có idempotency key** — gọi lại sau khi request đã tới Google có
   thể tạo 2 sự kiện / gửi 2 email. Xem §4.
4. **Không thử lại trong im lặng rồi bất ngờ thành công muộn.** Lần thử lại
   chỉ chạy trong cùng một thao tác của người dùng (hoặc cùng một lần đồng
   bộ nền). Không đặt timer chạy nền hàng giờ để thử lại.
5. **Tôn trọng `Retry-After` của Google.** Google trả header này khi 429 /
   503 — chờ đúng số giây đó (có trần, xem §5), không đoán mò.
6. **Một lỗi 401 chỉ được đăng nhập lại im lặng tối đa 1 lần cho mỗi thao
   tác.** Đăng nhập im lặng thất bại thì dừng, không tự mở màn hình đăng
   nhập lặp lại, không vòng lặp `gConnect` → 401 → `gConnect`.
7. **Đồng bộ im lặng thì lặng, thao tác tay thì nói.** Đồng bộ nền
   (`gSyncAll(false)`, `gAutoCal` quiet, tự tải lúc mở app) thất bại thì chỉ
   ghi vào `gState.error` / `gmState.error` và hiện dữ liệu cũ — không toast
   liên tục. Người dùng bấm "Làm mới" / "Gửi" thì được báo kết quả cuối cùng
   bằng toast rõ ràng.
8. **Một tính năng lỗi không chặn tính năng khác.** `gSyncAll()` gọi Lịch →
   Gmail → Danh bạ nối tiếp; mỗi bước tự xử lý retry và lỗi của mình rồi
   mới sang bước sau (code hiện tại đã `catch` riêng từng bước — giữ vậy).

## 2. Phân loại lỗi — thử lại hay dừng ngay

Google trả lỗi dạng JSON `{ "error": { "code", "status", "message",
"errors": [{ "reason" }] } }`. Khi phân loại thì đọc **`reason` trước,
HTTP status sau** — vì cùng 403 có thể là tạm thời hoặc vĩnh viễn.

| Lỗi | Thử lại? | Vì sao / làm gì |
|---|---|---|
| Mất mạng (`TypeError: Failed to fetch`, `navigator.onLine === false`, lỗi DNS) | **Không gọi API; thử lại 0 lần** | Không có mạng thì gọi cũng lỗi. Hiện dữ liệu đã lưu + banner mất mạng. Chỉ gọi lại khi có sự kiện `online` hoặc người dùng bấm "Làm mới". Xem §6. |
| Timeout (AbortError do hết timeout, §5) | Có, như lỗi tạm thời — **trừ POST tạo / POST gửi** (xem §4) | Mạng chậm, server chưa chắc đã xử lý xong. |
| 401 `invalid_credentials` / token hết hạn | **Đăng nhập lại im lặng 1 lần, rồi gọi lại đúng 1 lần** | Đây là đường duy nhất vì v1 không có refresh token. Nếu sau đó vẫn 401 → dừng, xoá token trong session (`ssSet(GT_KEY, '')` như code hiện tại), báo "hết hạn, kết nối lại". |
| 401 do `invalid_grant`, `invalid_client`, `redirect_uri_mismatch` (đổi code, §7) | **Không** | Lỗi cấu hình / code đã dùng rồi. Thử lại không sửa được gì. |
| 403 `rateLimitExceeded`, `userRateLimitExceeded` | Có, như 429 | Thực chất là hết quota theo tốc độ — chờ rồi thử lại. |
| 403 `dailyLimitExceeded`, `quotaExceeded` | **Không** | Hết quota ngày. Thử lại trong ngày cũng lỗi. Báo "hôm nay đã hết lượt, thử lại ngày mai". |
| 403 còn lại (`forbidden`, `insufficientPermissions`, API chưa bật, scope thiếu) | **Không** | Thử lại không thêm quyền. Báo đúng nguyên nhân: "chưa bật API / chưa cấp quyền" (thông điệp hiện tại của `gGet`/`gSend` giữ nguyên) + nút "Kết nối lại" / "Cấp quyền". |
| 404 / 410 (`notFound`, sự kiện đã bị xoá) | **Không** | Dữ liệu không còn. Riêng `gCalSave`: PATCH gặp `notfound` thì tạo mới bằng POST 1 lần như code hiện tại — đó là fallback nghiệp vụ, không phải retry. |
| 400 (`invalid`, `invalidArgument`, email khách sai, dữ liệu job sai) | **Không** | Request sai thì gửi lại y hệt cũng sai. |
| 429 `rateLimitExceeded` | Có | Chờ theo `Retry-After` (nếu có), xem §5. |
| 500 / 502 / 503 / 504 | Có | Lỗi phía Google, thường tự hết sau vài giây. |
| Người dùng từ chối cấp quyền (`access_denied`, `interaction_required` ở bước đăng nhập) | **Không** | Không tự mở lại màn hình đăng nhập. Báo 1 lần, để người dùng tự bấm "Đăng nhập Google" khi muốn. |

Quy tắc nhớ nhanh: **chỉ retry 429, 403-rate-limit, 5xx, timeout — và 401
theo đường đăng nhập lại ở §7. Mọi thứ khác dừng ngay.**

## 3. Số lần thử và backoff

### 3.1. Đọc (GET) — Calendar, Gmail, People, Drive

| Lần | Hành động |
|---|---|
| 1 | Gọi chính. |
| 2 | Chờ **1 giây** rồi gọi lại. |
| 3 | Chờ **2 giây** rồi gọi lại lần cuối. |
| Hết | Dừng. Báo người dùng theo §8. |

- Tổng cộng **tối đa 3 lần gọi** (1 chính + 2 thử lại), tổng thời gian chờ
  tối đa ~3 giây + thời gian 3 lần gọi. Không thêm lần 4.
- Backoff: cấp số nhân, cơ số 2, bắt đầu 1 giây, trần 8 giây
  (`delay = min(8s, 1s × 2^(lần-1))`), cộng jitter ngẫu nhiên ±25%
  (hoặc full jitter) để nhiều máy không dội Google cùng lúc.
- Nếu Google trả `Retry-After: N` thì **dùng N thay cho backoff tính sẵn**,
  với trần N ≤ 60 giây. `Retry-After` > 60 giây → dừng ngay, báo "Google
  đang bận, thử lại sau" (không bắt người dùng chờ hơn 1 phút trong 1 thao tác).

### 3.2. Ghi idempotent — PATCH sửa sự kiện Lịch, DELETE xoá sự kiện

- Giống đọc: **tối đa 3 lần gọi**, backoff như §3.1. PATCH cùng nội dung và
  DELETE cùng ID gọi lại không tạo trùng nên an toàn.

### 3.3. Ghi không idempotent — POST tạo sự kiện Lịch, POST gửi Gmail

- **Không tự thử lại sau khi request đã được gửi đi** (đã nhận được response
  429/5xx hay chưa cũng vậy — không phân biệt được "Google chưa xử lý" với
  "Google đã xử lý nhưng response bị mất").
- Chỉ được thử lại **duy nhất 1 lần** khi lỗi xảy ra **trước khi request rời
  khỏi máy** — thực tế chỉ có 2 trường hợp chứng minh được: mất mạng ngay
  khi bấm gửi (`navigator.onLine === false` trước `fetch`) và timeout mà
  request chưa kịp gửi (không phân biệt được — nên coi timeout của POST là
  **không thử lại**, xem dưới).
- Thực hành cho v1:
  - POST tạo Lịch / POST gửi Gmail gặp **429 / 5xx có response**: dừng ngay,
    báo "chưa chắc đã gửi được — kiểm tra lại Lịch / Hộp thư đã gửi trước
    khi bấm gửi lại" (xem câu chữ §8). Người dùng tự kiểm tra rồi bấm lại.
  - POST gặp **timeout / mất mạng giữa chừng**: coi là **không rõ đã gửi
    hay chưa** → dừng ngay, báo như trên. Không tự gửi lại.
  - Ngoại lệ duy nhất: `gCalSave` đã có fallback PATCH → POST khi sự kiện
    cũ `notfound`. Đó là 1 lần tạo mới có chủ đích, không tính là retry.
- Gửi Gmail càng chặt hơn: email gửi trùng là lỗi người dùng nhìn thấy ngay
  (khách nhận 2 email). **Không retry tự động cho `gmailSendMail` trong mọi
  trường hợp sau khi đã bấm Gửi**, kể cả 429/5xx.

### 3.4. Đổi code lấy token (`POST oauth2.googleapis.com/token`)

- Chỉ thử lại lỗi tạm thời (mất mạng lúc đổi code, 5xx): **tối đa 2 lần gọi**,
  chờ 1 giây giữa 2 lần.
- **Không thử lại** 400 (`invalid_grant` — code đã dùng / hết hạn,
  `redirect_uri_mismatch`, `invalid_client`). Authorization code chỉ dùng
  được 1 lần — gửi lại code cũ luôn lỗi.
- Hết 2 lần → báo "Google chưa đổi được mã đăng nhập, thử lại nha" (câu
  hiện tại của `gExchangeCode`) và để người dùng bấm "Đăng nhập Google" lại
  từ đầu (lấy code mới).

## 4. Bảng tóm tắt: mỗi loại lệnh gọi được thử lại mấy lần

| Lệnh gọi | Tối đa số lần gọi | Backoff | Ghi chú |
|---|---|---|---|
| GET Lịch / Gmail / People / Drive (`gApi`, `gGet`) | 3 | 1s → 2s (+ jitter) | Theo §3.1 |
| PATCH / DELETE sự kiện Lịch (`gSend`) | 3 | 1s → 2s (+ jitter) | Idempotent |
| POST tạo sự kiện Lịch (`gSend` trong `gCalSave`) | 1 (+ 1 lần fallback sau PATCH `notfound`) | — | Không retry sau khi đã gửi; xem §3.3 |
| POST gửi Gmail (`gmailSendMail` qua `gSend`) | 1 | — | Không retry tự động |
| POST đổi code lấy token (`gExchangeCode`) | 2 | 1s | Chỉ lỗi tạm thời; code dùng 1 lần |
| Revoke token lúc ngắt kết nối / xoá dữ liệu | 1 | — | Best-effort, lỗi thì bỏ qua (code hiện tại đã `.catch(()=>{})` — giữ vậy) |

## 5. Timeout và `Retry-After`

- Mọi `fetch` tới Google phải có `AbortController` + timeout, vì hiện tại
  không có timeout nên request treo sẽ không bao giờ tới bước thử lại:
  - Đọc (GET): **15 giây**.
  - Ghi (POST/PATCH/DELETE, gửi Gmail): **20 giây**.
  - Đổi code lấy token: **10 giây**.
- Hết timeout → huỷ request, tính là 1 lần lỗi tạm thời (trừ POST tạo /
  POST gửi theo §3.3 — timeout ở đó là "không rõ", không retry).
- `Retry-After`: đọc header response (giây; nếu là ngày giờ HTTP thì quy
  ra số giây còn lại). Dùng giá trị này thay backoff tính sẵn, trần 60 giây
  (§3.1). Không có header thì dùng backoff mặc định.
- Tổng ngân sách cho 1 thao tác đọc: không quá ~45 giây kể cả chờ backoff
  và timeout (3 lần × 15 giây là trần lý thuyết; thực tế lần 1 timeout thì
  các lần sau thường lỗi nhanh hơn). Quá ngân sách thì dừng dù chưa hết
  số lần.

## 6. Mất mạng — không gọi, hiện dữ liệu cũ

- Trước mỗi lần gọi (kể cả lần thử lại): nếu `navigator.onLine === false`
  thì **không gọi**, dừng ngay, không tính vào số lần thử.
- Hành vi khi mất mạng:
  - **Đọc:** hiện dữ liệu đã lưu lần trước (`gcal`, `gmail`, `gContacts`
    trong `localStorage`) + dòng báo "Đang mất mạng — đang xem lịch đã lưu
    lần trước." (câu hiện tại của `gFetch` giữ nguyên). Không toast lỗi
    lặp lại mỗi lần mở app.
  - **Ghi Lịch tự động** (`gAutoCal`, quiet): bỏ qua trong im lặng, lần
    lưu job sau hoặc khi có mạng sẽ thử lại qua lần lưu đó. Không báo lỗi.
  - **Ghi do người dùng bấm** (lưu job có ghi Lịch, bấm Gửi email): báo
    ngay "Đang mất mạng — chưa ghi / chưa gửi được, có mạng thì thử lại
    nha". Không xếp hàng gửi ngầm — v1 không có hàng đợi offline, đừng giả
    vờ là đã gửi.
- Khi mạng về (`online` event): **không tự gọi lại tất cả**. Chỉ đồng bộ
  lại nếu đang ở màn hình cần dữ liệu đó và dữ liệu đã cũ hơn 10 phút
  (ngưỡng hiện tại của `gFetch`/`gSyncAll`), hoặc người dùng bấm "Làm mới".
  Tránh dội 1 loạt request ngay khi mạng vừa về.

## 7. Token hết hạn (401) — đăng nhập lại im lặng, tối đa 1 lần

V1 không có refresh token nên đây là đường duy nhất. Trình tự cho **mỗi
thao tác** (1 lần tải Lịch, 1 lần đọc Gmail, 1 lần gửi email…):

1. Trước khi gọi: `gToken()` đã trả `null` nếu token hết hạn trong 60 giây
   tới → **đăng nhập lại im lặng trước** (`gConnect(true)`, `prompt=none`),
   không đợi tới lúc gọi rồi mới nhận 401.
2. Gọi API → nhận 401 → xoá token trong session (`ssSet(GT_KEY, '')`,
   như code hiện tại) → đăng nhập lại im lặng **1 lần** → gọi lại API
   **đúng 1 lần**.
3. Vẫn 401, hoặc đăng nhập im lặng thất bại (`interaction_required`,
   `login_required`, `consent_required` — Google bắt người dùng tương tác
   lại): **dừng hẳn**. Không gọi lần 3, không tự mở màn hình đăng nhập.
   Báo "Kết nối Google hết hạn — bấm Kết nối lại trong Cài đặt" (câu hiện
   tại trong `gCalSave` / Drive picker) và hiện nút "Kết nối lại".
4. Cờ "đang đăng nhập lại" phải là **một cờ chung cho cả thao tác**, không
   phải cờ riêng từng request con: `gSyncAll` gọi Lịch → Gmail → Danh bạ,
   nếu Lịch đã dùng hết 1 lần đăng nhập lại thì Gmail gặp 401 trong cùng
   lần đồng bộ đó **không đăng nhập lại lần nữa** — dừng bước đó, chờ lần
   đồng bộ sau hoặc người dùng kết nối lại tay. Nếu không, 1 lần đồng bộ
   có thể mở nhiều lần đăng nhập chồng nhau.
5. Đăng nhập im lặng cũng phải có timeout (10 giây, như đổi code) và cũng
   tuân §3.4: lỗi tạm thời thử lại tối đa 1 lần, lỗi `interaction_required`
   thì dừng ngay.

## 8. Khi nào dừng và báo người dùng — câu chữ

- **Chỉ báo 1 lần cho 1 thao tác**, sau khi đã hết số lần thử. Không toast
  sau mỗi lần thử lại — người dùng không cần biết app đang thử lần 2.
- Trong lúc đang thử lại ở thao tác tay: giữ trạng thái "Đang tải…" /
  "Đang gửi…" (như `gmState.loading`, nút "Đang gửi…" hiện tại), không
  hiện lỗi tạm thời.
- Câu chữ (tiếng Việt, giữ giọng hiện tại của app — ngắn, gọi "bạn", không
  hiện mã lỗi thô trừ khi cần):

| Tình huống | Báo cho người dùng |
|---|---|
| Hết 3 lần đọc, lỗi tạm thời (5xx/429/timeout) | "Chưa tải được lịch / Gmail — Google đang bận, thử lại sau nha." + vẫn hiện dữ liệu cũ. Nút "Làm mới" để thử lại tay. |
| Mất mạng | "Đang mất mạng — đang xem lịch đã lưu lần trước." (đọc) / "Đang mất mạng — chưa gửi được, có mạng thì thử lại nha." (ghi/gửi) |
| 401 sau 1 lần đăng nhập lại | "Kết nối Google hết hạn — kết nối lại rồi thử nha." + nút "Kết nối lại". |
| 403 hết quota ngày | "Hôm nay Google đã hết lượt cho FotoBro, thử lại ngày mai nha." |
| 403 quyền / API chưa bật | "Chưa bật API hoặc chưa cấp quyền." (giữ câu hiện tại) + nút "Cấp quyền" / "Kết nối lại". |
| POST tạo Lịch / gửi Gmail gặp 429/5xx/timeout (không rõ đã xong chưa) | "Chưa chắc đã lưu / gửi được — kiểm tra lại Google Lịch / Hộp thư đã gửi trước khi bấm lại nha." (Không được báo "chưa gửi được" chắc chắn, vì có thể đã gửi rồi.) |
| Đổi code thất bại | "Google chưa đổi được mã đăng nhập, thử lại nha." (giữ câu hiện tại) |
| Đồng bộ nền thất bại | Không toast. Chỉ ghi `gState.error` / `gmState.error` để màn hình đó tự hiện dòng đỏ + dữ liệu cũ. |

- Không bao giờ hiện cho người dùng: mã `invalid_grant`,
  `redirect_uri_mismatch`, stack trace, toàn bộ JSON lỗi Google. Những thứ
  đó chỉ ghi `console.warn` để debug.

## 9. Trường hợp đặc biệt

- **Gmail `pool()` (đọc nhiều thư cùng lúc, tối đa 5):** 1 thư lỗi 429/5xx
  thì chỉ thử lại thư đó (tối đa 3 lần như GET), không thử lại cả lô 40 thư.
  Nếu trong lô có ≥ 2 thư trả 429 → dừng cả lô, chờ `Retry-After` rồi mới
  đọc tiếp (giảm đồng thời xuống 2 cho lần sau). Thư lỗi sau khi hết retry
  thì bỏ qua thư đó (như `pool` hiện tại trả `null`), không làm hỏng cả lần
  đọc Gmail.
- **Danh bạ phân trang (`ctFetch`, tối đa 4 trang):** trang lỗi tạm thời thì
  thử lại trang đó (tối đa 3 lần). Hết retry thì dừng ở trang đã tải được,
  giữ số liên hệ đã có, không xoá cache cũ.
- **Lịch nhiều lịch con (`gFetch`, tối đa 12 lịch):** lịch nào lỗi tạm thời
  thì thử lại lịch đó; hết retry thì bỏ qua lịch đó, vẫn hiện các lịch còn
  lại + ghi chú "chưa tải được lịch X". Không vì 1 lịch lỗi mà mất cả Lịch.
- **Người dùng bấm "Làm mới" liên tục:** chống bấm đúp — `gState.loading` /
  `gmState.loading` đã chặn gọi chồng (giữ nguyên). Lần bấm mới sau khi lần
  trước đã báo lỗi thì được tính là thao tác mới, reset số lần thử.
- **Chuyển màn hình / đóng app giữa chừng:** huỷ các lần thử lại đang chờ
  (clear timeout / AbortController). Không thử lại sau khi người dùng đã
  rời khỏi thao tác đó.
- **Google trả 429 cho cả tài khoản (quota dự án chung):** Client ID là
  chung cho mọi người dùng FotoBro nên 429 có thể do người khác gây ra.
  Không tăng số lần thử để "cố" qua — càng thử càng nặng quota. Dừng theo
  §3 và báo thử lại sau.

## 10. Triển khai — checklist cho agent code

1. Thêm **1 wrapper duy nhất** (ví dụ `googleFetchWithRetry(url, options)`)
   dùng chung cho `gApi`, `gGet`, `gSend`; `gExchangeCode` dùng biến thể
   riêng với giới hạn §3.4. Không viết logic retry riêng trong từng hàm.
2. Wrapper nhận tham số: `kind: 'read' | 'idempotent-write' |
   'non-idempotent-write' | 'token'`, để áp đúng bảng §4. Mặc định (không
   truyền) là `'read'` — nhưng **POST tạo Lịch và POST gửi Gmail bắt buộc
   phải truyền đúng kind**, nếu không wrapper sẽ thử lại sai và gây trùng.
3. Wrapper tự: kiểm tra `navigator.onLine` trước mỗi lần gọi; gắn
   `AbortController` + timeout §5; đọc `Retry-After`; parse JSON lỗi Google
   lấy `reason`; phân loại theo §2; backoff + jitter §3; đếm số lần và dừng
   đúng giới hạn.
4. 401 đi qua đường §7 (đăng nhập lại im lặng tối đa 1 lần / thao tác, cờ
   chung), không đi qua bộ đếm retry thông thường.
5. Giữ nguyên hành vi hiện tại: 401 xoá token session; 403 báo "chưa bật
   API hoặc chưa cấp quyền"; 404/410 trong `gSend` báo `notfound` để
   `gCalSave` fallback POST; lỗi thì ghi `gState.error` / `gmState.error`,
   không toast giữa chừng; revoke token giữ best-effort 1 lần.
6. Không lưu thêm gì vào `localStorage` ngoài cache đã có. Không lưu
   refresh token, không lưu log lỗi dài hạn lên máy người dùng.
7. Không thay đổi scope, Client ID, redirect — tài liệu này chỉ quy định
   retry, không đụng tới OAuth setup (xem `GOOGLE-SETUP.md`).

## 11. Kiểm thử (làm trước khi giao)

- [ ] Ngắt mạng (Airplane Mode) → mở Lịch/Gmail: hiện dữ liệu cũ + câu mất
      mạng, **0 request** được gửi đi.
- [ ] Bật mạng lại → bấm "Làm mới": tải được, không tự dội request lúc
      mạng vừa về.
- [ ] Giả lập 500 cho 2 lần đầu rồi 200: GET thành công sau lần 3, người
      dùng chỉ thấy "Đang tải…" rồi có dữ liệu, không thấy toast lỗi.
- [ ] Giả lập 500 cả 3 lần: dừng sau lần 3, báo 1 lần, hiện dữ liệu cũ.
- [ ] Giả lập 429 kèm `Retry-After: 2`: chờ ~2 giây mới gọi lại, không gọi
      ngay.
- [ ] Giả lập 403 `quotaExceeded`: dừng ngay lần 1, báo hết lượt ngày.
- [ ] Giả lập 403 `insufficientPermissions`: dừng ngay lần 1, báo thiếu quyền.
- [ ] Giả lập 401: đăng nhập im lặng 1 lần rồi thành công; giả lập 401 lần
      2 → dừng, báo hết hạn + nút "Kết nối lại", không tự mở login lần nữa.
- [ ] Giả lập timeout 15 giây ở GET: thử lại đúng 2 lần rồi dừng.
- [ ] Giả lập 500 ở POST gửi Gmail: **không gửi lại**, báo câu "chưa chắc
      đã gửi được — kiểm tra Hộp thư đã gửi trước khi bấm lại", và kiểm tra
      thực tế chỉ có 1 email được gửi.
- [ ] Giả lập 500 ở POST tạo Lịch: **không tạo trùng** (chỉ 1 sự kiện trên
      Lịch), báo câu kiểm tra lại.
- [ ] Bấm "Làm mới" 3 lần liên tiếp khi đang tải: chỉ có 1 lần tải chạy
      (chặn bấm đúp).
- [ ] Rời màn hình giữa lúc đang chờ retry: không còn request nào chạy sau đó.

## 12. Chưa quyết / cần Việt hoặc agent iOS xác nhận

- Timeout 15s (đọc) / 20s (ghi) / 10s (token) ở §5 là số đề xuất theo thông
  lệ — chưa đo trên mạng 4G Việt Nam. Nếu người dùng hay ở vùng sóng yếu,
  có thể phải nới đọc lên 20s; đo thực tế rồi mới chốt.
- Câu "chưa chắc đã gửi được — kiểm tra lại…" ở §8 là cách an toàn nhất cho
  v1 vì Gmail API không có idempotency key. Nếu muốn chắc chắn hơn thì cần
  cơ chế riêng (ví dụ ghi lại `Message-ID` / kiểm tra Hộp thư đã gửi trước
  khi gửi lại) — đó là việc riêng, không thuộc tài liệu retry này.
- Chưa có Client ID thật nên **chưa kiểm chứng được gì với Google thật** —
  toàn bộ kiểm thử §11 hiện chỉ làm được bằng giả lập (mock `fetch`).
  Sau khi có Client ID + app TestFlight thì chạy lại §11 với API thật.
