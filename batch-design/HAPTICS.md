# Haptics — FotoBro iOS v1

> **Trạng thái: THIẾT KẾ — chưa code.** File này chỉ quy định rung nào cho
> thao tác nào. Không đổi code, không cài thêm thư viện, không sửa
> `www/index.html`. Khi code, người làm chỉ việc bám bảng dưới đây.
>
> Phạm vi: FotoBro iOS v1, Capacitor 8, Bundle ID `com.fotobro.app`,
> UI kiểu Apple Music. Nguồn đối chiếu (chỉ đọc): `www/index.html`
> (3.901 dòng), `package.json`. Ngày viết: 20/11/2026.

## 0. Hiện trạng (đã kiểm tra trong code)

- Plugin **`@capacitor/haptics` ^8.0.0 đã có sẵn** trong `package.json`
  (cùng nhóm với `@capacitor/core` 8.0.0), nhưng **chưa được gọi ở đâu**
  trong `www/index.html`. Thiết kế này dùng đúng plugin đó — **không cần
  thêm dependency mới**.
- App hiện tại chỉ rung bằng `navigator.vibrate` (fallback web) ở đúng
  3 chỗ, và cả 3 đều sẽ được thay bằng 1 cổng chung (xem §6):
  - `toast()` (`index.html:1002`): rung `8ms`, cảnh báo `[10, 40, 10]`.
  - `celebrate()` (`index.html:1297`): rung `[12, 60, 12]` mỗi lần ăn mừng.
  - Tick checklist (`index.html:1690`): rung `6ms` mỗi lần tick/bỏ tick.
- Chưa có nút tắt rung nào trong Cài đặt. Chưa có rung cho: thêm job,
  nhảy bước pipeline, ghi tiền, thêm nhắc lịch, khoá Face ID/PIN, sao lưu.
- Pipeline có 8 bước (`index.html:781`): Tư vấn, Chốt cọc, Sắp chụp,
  Đã chụp, Chọn ảnh, Hậu kỳ, Đã giao, Xong. Chuyển bước có gắn tiền:
  Chốt cọc → mở form ghi cọc; Đã giao → nhắc thu nốt; Xong còn thiếu
  tiền → cảnh báo + xác nhận (`index.html:1460` trở đi).

## 1. Nguyên tắc chung (áp dụng cho mọi bảng dưới đây)

1. **1 thao tác = tối đa 1 rung.** Không bao giờ rung kép: không
   `light + success`, không rung ở cả action lẫn toast lẫn celebrate
   cho cùng một lần chạm. Rung gắn vào **hành động của người dùng**,
   không gắn vào toast hay hiệu ứng visual đi kèm.
2. **`success` là loại rung hiếm, chỉ dành cho mốc hoàn thành đáng mừng.**
   Không dùng `success` cho mọi toast "Đã lưu" — nếu cái gì cũng
   success thì success mất ý nghĩa, và tay người dùng sẽ mỏi.
3. **Rung là phụ, không phải tín hiệu duy nhất.** Mọi thao tác vẫn phải
   có phản hồi nhìn thấy được (toast / đổi bước / đổi màu) như hiện tại.
   Người tắt rung, hoặc máy đang ở chế độ im lặng, vẫn phải hiểu app
   vừa làm gì. Không dùng rung để báo lỗi mà không có chữ đi kèm.
4. **Không rung cho việc thụ động:** mở xem, mở form, đóng sheet,
   cuộn, gõ chữ, render lại màn hình, tự động lưu, badge "job kẹt",
   nhắc quá hạn, ảnh trang chủ đổi, quote đổi.
5. **`heavy` chỉ dành cho xác nhận phá huỷ / không hoàn tác được.**
   Không dùng `heavy` cho thao tác thường ngày.
6. **Tôn trọng hệ thống trước, rồi mới tới nút tắt của app:** nếu người
   dùng đã tắt System Haptics trong Cài đặt iOS thì plugin sẽ không rung
   (hành vi mặc định của iOS) — app không cố rung bằng cách khác.
   Nút tắt trong app (§6) là lớp thứ hai, cho người thấy rung phiền
   dù hệ thống vẫn bật.
7. **Không rung khi đang ở màn khoá** (trừ đúng 1 trường hợp PIN sai
   ở §5.6 — vì lúc đó người dùng đang tương tác với màn khoá).

## 2. Bảng từ vựng rung (iOS, qua `@capacitor/haptics`)

| Loại rung | API Capacitor | Cảm giác / ý nghĩa | Khi nào dùng (tóm tắt) |
|---|---|---|---|
| `selection` | `Haptics.selectionChanged()` | Tách nhẹ, như gạt công tắc chọn | Chọn 1 trong nhiều lựa chọn (pill, loại job) |
| `light` | `Haptics.impact({ style: 'light' })` | Chạm nhẹ, xác nhận nhỏ | Tick 1 món, tiến/lùi 1 bước, lưu sửa nhỏ, sao chép, bật/tắt |
| `medium` | `Haptics.impact({ style: 'medium' })` | Chạm rõ, thay đổi đáng kể | Nhảy nhiều bước, xoá 1 khoản tiền / 1 món checklist, nhập sao lưu |
| `heavy` | `Haptics.impact({ style: 'heavy' })` | Chạm mạnh, quyết định nặng | Chỉ khi xác nhận xoá job, huỷ job |
| `success` | `Haptics.notification({ type: 'success' })` | Rung đôi vui, "xong rồi" | Thêm job mới, thu được tiền, giao ảnh, xong job, đủ đồ nghề |
| `warning` | `Haptics.notification({ type: 'warning' })` | Rung cảnh báo, "khoan đã" | Còn thiếu tiền mà đòi Xong / Đã giao, thiếu dữ kiện bắt buộc |
| `error` | `Haptics.notification({ type: 'error' })` | Rung lỗi, "không được" | Lưu thất bại, PIN sai, file sao lưu hỏng, Lịch từ chối |

Không dùng trong v1: `selectionStart` / `selectionEnd` và
`Haptics.vibrate()` với pattern tự chế — app không có thao tác kéo-thả
(Kanban kéo thả đã chốt không làm ở v1), nên không cần rung giữ-kéo.
Trên web (không phải app native), các loại trên được map về
`navigator.vibrate` theo §7 — chỉ là fallback, bản native mới là chuẩn.

## 3. Thêm job (thêm buổi chụp mới)

| Thao tác | Rung | Ghi chú |
|---|---|---|
| Mở form thêm job (bấm nút `+`) | **Không rung** | Chỉ là mở sheet, chưa làm gì |
| Lưu thành công → job mới xuất hiện | **`success`** | Mốc hoàn thành: có thêm 1 buổi chụp. Toast "Đã thêm buổi chụp mới" đi kèm, không rung thêm ở toast |
| Lưu thất bại — thiếu tên khách (form rung lắc, toast "Nhập tên khách trước nha") | **`error`** | 1 lần duy nhất cho lần bấm Lưu đó. Không rung lại khi người dùng đang gõ sửa tên |
| Sửa job đã có → lưu thành công | **`light`** | Chỉ là chỉnh sửa nhỏ, không phải mốc mới — phân biệt với thêm job |
| Đóng form không lưu (bấm Huỷ / vuốt xuống) | **Không rung** | Không có gì thay đổi |
| Huỷ job (xác nhận trong action sheet) | **`heavy`** | Quyết định nặng, job rời pipeline (khôi phục được về Tư vấn). Chỉ rung khi bấm nút xác nhận, không rung khi mở sheet hỏi |
| Khôi phục job đã huỷ về Tư vấn | **`light`** | Hoàn tác nhẹ, không ăn mừng |
| Xoá job (xác nhận trong action sheet, kèm thu chi) | **`heavy`** | Không hoàn tác được. Chỉ rung khi bấm nút xác nhận, không rung khi mở sheet hỏi |

## 4. Nhảy bước pipeline (8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong)

| Thao tác | Rung | Ghi chú |
|---|---|---|
| Tiến / lùi **1 bước** (bấm bước kề, nút Tiếp / Quay lại) | **`light`** | Thay đổi nhỏ, làm nhiều lần trong ngày — phải nhẹ |
| **Nhảy qua nhiều bước** (nhảy thẳng tới bước xa, sau khi xác nhận ở sheet "Nhảy qua N bước?") | **`medium`** | Bỏ qua bước giữa là thay đổi lớn, cần chạm rõ hơn. Chỉ rung khi bấm nút xác nhận nhảy, không rung khi mở sheet hỏi |
| Bấm vào đúng bước đang đứng | **Không rung** | Không có gì thay đổi (`jumpToStage` đã bỏ qua trường hợp này trong code) |
| Sang bước **Chốt cọc** (tự mở form ghi cọc sau đó) | **`light`** | Chỉ rung 1 lần cho việc đổi bước. Mở form ghi cọc không rung thêm |
| Sang bước **Đã giao** | **`success`** | Mốc đáng mừng, đi kèm celebrate "Giao ảnh rồi, giỏi lắm!" — celebrate chỉ hiện visual, **không rung riêng** (rung của celebrate cũ `[12, 60, 12]` bỏ đi, tránh rung kép với `success` này). Nếu còn thiếu tiền thì toast nhắc thu nốt hiện thêm, vẫn chỉ 1 rung `success` |
| Sang bước **Xong** (đã thu đủ tiền) | **`success`** | Mốc cuối của job, đi kèm celebrate "Xong job … rồi!" — celebrate không rung riêng, như trên |
| Sang bước **Xong** nhưng **còn thiếu tiền** → sheet cảnh báo "Vẫn còn thiếu tiền" hiện ra | **`warning`** | Rung 1 lần khi sheet cảnh báo hiện ra (do người dùng vừa bấm Xong). Sau đó: bấm "Thu nốt … trước" → mở form ghi tiền, không rung thêm; bấm "Vẫn xong, thiếu sau" → job xong, rung **`success`** (đây là lần chạm mới, không tính là rung kép) |
| Job kẹt / quá hạn hiện badge trên màn Hôm nay | **Không rung** | Render thụ động, không phải do chạm. Người dùng mở job lên mới rung theo thao tác họ làm tiếp |

## 5. Ghi tiền — cọc / thu nốt / chi

| Thao tác | Rung | Ghi chú |
|---|---|---|
| Mở form ghi tiền (từ bước Chốt cọc, từ nút "Thu nốt", từ Sổ tiền) | **Không rung** | Chỉ là mở form |
| Ghi **cọc** thành công | **`success`** | Tiền về, giữ được lịch — mốc đáng mừng |
| Ghi **thu nốt** thành công (kể cả thu nốt xong hết nợ) | **`success`** | Chỉ 1 rung dù vừa hết nợ: không rung thêm "đã hết nợ" |
| Ghi **chi** thành công (makeup, xăng xe, thiết bị…) | **`light`** | Tiền ra — ghi nhận xong, không ăn mừng như tiền về |
| Lưu thất bại — thiếu số tiền / số tiền = 0 / thiếu loại khoản | **`error`** | 1 lần cho lần bấm Lưu đó |
| Xoá 1 khoản thu / chi (sau xác nhận) | **`medium`** | Xoá dữ liệu tiền là thay đổi đáng kể, nhưng chỉ 1 khoản nên chưa tới `heavy` |
| Sổ tiền tự tính lại, tổng tháng đổi số | **Không rung** | Render thụ động sau khi lưu — rung đã có ở thao tác lưu |

## 6. Checklist đồ nghề (theo loại job / theo buổi chụp)

| Thao tác | Rung | Ghi chú |
|---|---|---|
| Tick **1 món** (chưa đủ bộ) | **`light`** | Rung hiện tại `navigator.vibrate(6)` đổi thành `light` native. Tick nhanh nhiều món liên tiếp: mỗi lần chạm vẫn `light`, không tăng dần, không dồn thành rung mạnh |
| Bỏ tick 1 món | **`light`** | Đối xứng với tick — cùng 1 mức, không phân biệt tick/bỏ |
| Tick **món cuối cùng → đủ đồ** ("Đủ đồ rồi, diễn thôi!") | **`success`** (thay cho `light`) | Chỉ rung `success`, **không** rung `light` trước đó. Celebrate chỉ hiện visual, không rung riêng — sửa đúng chỗ code hiện tại đang rung cả ở tick lẫn ở `celebrate()` |
| Đổi pill chọn danh sách (chọn buổi chụp khác / loại job khác) | **`selection`** | Đây là thao tác "chọn 1 trong nhiều" đúng nghĩa |
| Thêm món mới vào danh sách | **`light`** | Thêm 1 dòng, thay đổi nhỏ |
| Xoá 1 món khỏi danh sách (sau xác nhận) | **`medium`** | Xoá khỏi mọi buổi sau, cần chạm rõ hơn tick thường |
| "Làm mới" — bỏ tick hết (sau xác nhận) | **`medium`** | Thay đổi hàng loạt, 1 rung duy nhất cho cả thao tác, không rung theo từng món bị bỏ tick |

## 7. Thêm nhắc lịch

| Thao tác | Rung | Ghi chú |
|---|---|---|
| "Thêm vào Lịch iPhone" (EventKit native) thành công | **`light`** | Ghi lịch là việc phụ, không phải mốc chính của job — cố ý không dùng `success` để `success` khỏi loãng |
| "Tạo nhắc việc" / "Lưu vào app Lịch" (.ics) thành công | **`light`** | Như trên |
| Thêm nhắc thất bại — job chưa có ngày chụp (toast "Job này chưa có ngày chụp") | **`warning`** | Thiếu dữ kiện, chưa phải lỗi hệ thống — người dùng thêm ngày là xong |
| Thêm nhắc thất bại — Lịch iPhone từ chối / mất quyền truy cập Lịch | **`error`** | Lỗi hệ thống, cần chữ hướng dẫn đi kèm (mở lại quyền trong Cài đặt iOS) |
| Nhắc tự tới giờ (local notification tới hạn) | **Không rung** | Nhắc do hệ thống phát, không phải do chạm trong app; iOS tự quyết định rung/chuông theo cài đặt thông báo của người dùng |

## 8. Khoá Face ID / PIN

| Thao tác | Rung | Ghi chú |
|---|---|---|
| Mở khoá bằng **Face ID thành công** | **Không rung** | Hệ thống đã có animation + rung riêng của Face ID. Rung thêm là thừa và dễ thành rung kép |
| Face ID thất bại → hiện dòng "Chưa mở được bằng Face ID" | **Không rung** | Hệ thống đã báo thất bại. Chỉ rung khi người dùng chuyển sang nhập PIN và nhập sai (dòng dưới) |
| Mở khoá bằng **PIN đúng** | **`light`** | PIN không có phản hồi hệ thống như Face ID nên cần 1 chạm nhẹ xác nhận đã mở |
| Nhập **sai PIN** (mỗi lần bấm nút xác nhận) | **`error`** | 1 lần cho mỗi lần nhập sai. Kèm form rung lắc + chữ "Mã PIN chưa đúng" như code hiện tại |
| Sai PIN 5 lần → tạm khoá 30 giây | **`error`** | Vẫn chỉ là rung `error` của lần nhập sai đó, không rung thêm lần nữa cho việc "bị khoá" |
| Nhập từng ký tự PIN (gõ số) | **Không rung** | Gõ 6 số mà rung 6 lần thì rất khó chịu — cấm rung ở đây |
| Bật / tắt khoá trong Cài đặt | **`light`** | Như mọi toggle khác (xem §9) |

## 9. Sao lưu (Tải bản / Mở bản)

| Thao tác | Rung | Ghi chú |
|---|---|---|
| "Tải bản sao lưu" (export JSON) thành công | **`light`** | Việc bảo trì định kỳ, không phải mốc đáng mừng |
| "Mở bản sao lưu" (import JSON) thành công | **`success`** | Khôi phục dữ liệu — thay đổi toàn bộ app, xứng đáng `success`. Chỉ rung sau khi file đã đọc và dữ liệu đã nạp xong |
| Export / import thất bại (không tải được, file sai định dạng, file hỏng) | **`error`** | 1 lần, kèm chữ nói rõ lý do |
| App tự lưu (save sau mỗi lần thêm job / ghi tiền) | **Không rung** | Chạy ngầm liên tục — rung ở đây thì app rung cả ngày. Rung đã có ở chính thao tác thêm/ghi đó |

## 10. Các thao tác khác (để không ai phải đoán)

| Thao tác | Rung |
|---|---|
| Chuyển tab (Hôm nay / Job / Tiền / Cài đặt) | **Không rung** — tab bar iOS vốn không rung |
| Mở xem chi tiết job, mở sheet, đóng sheet không lưu | **Không rung** |
| Gõ chữ, chọn ngày/giờ, chọn loại job trong form | **Không rung**, trừ chọn loại job dạng pill/chip thì `selection` |
| Sao chép tin nhắn / link (toast "Đã sao chép") | `light` |
| Đổi chủ đề (3 preset), đổi logo studio, bật/tắt hiệu ứng kính | **Không rung** — đổi màu nhìn thấy ngay, không cần rung |
| Bật/tắt bất kỳ công tắc nào trong Cài đặt (trừ công tắc rung, xem §11) | `light` |
| Gửi email cho khách, mở Messenger / Facebook / Zalo / gọi điện | **Không rung** — app ngoài sẽ tự phản hồi |
| Giọng nói: ra lệnh, trợ lý trả lời, sticker ăn mừng | **Không rung** — giọng nói đã có phản hồi bằng lời/chữ; sticker `celebrate()` không rung riêng |
| Bấm nút "Cập nhật" (đổi bản mới) | `light` khi bấm (xác nhận đã chạm), không rung khi app tự tải xong |

## 11. Nút tắt rung trong Cài đặt

- **Vị trí:** tab **Cài đặt**, mục mới **"Cảm ứng"**, ngay dưới mục
  "Thông số của bạn". Dạng 1 dòng toggle (kiểu công tắc iOS như các
  mục khác trong app), không làm màn riêng.
- **Nhãn:**
  - Tiếng Việt — tiêu đề: `Rung phản hồi`; mô tả 1 dòng:
    `Rung nhẹ khi lưu job, ghi tiền, đổi bước… Tắt nếu thấy phiền.`
  - English — tiêu đề: `Haptics`; mô tả:
    `A gentle tap when you save a job, log money or change a step. Turn off if it bothers you.`
  - Key i18n gợi ý: `haptics_title`, `haptics_desc`.
- **Mặc định: BẬT.** Người dùng cũ chưa từng chỉnh thì vẫn rung như
  §3–§10 (tương thích với hành vi `navigator.vibrate` hiện tại).
- **Lưu trữ:** 1 cờ trong cấu hình app, gợi ý `state.cfg.haptics`
  (kiểu boolean; `undefined` = bật, `false` = tắt). Lưu local như các
  mục Cài đặt khác, có hiệu lực ngay, không cần khởi động lại app.
- **Phạm vi:** tắt là tắt **hết** — cả rung native Capacitor lẫn
  fallback `navigator.vibrate` trên web. Không có mức "chỉ tắt rung
  mạnh" hay "chỉ tắt rung vui" ở v1.
- **Phản hồi của chính nút tắt:** gạt sang **BẬT** → rung `light`
  1 lần để người dùng biết rung đã hoạt động trở lại; gạt sang
  **TẮT** → **không rung** (vừa tắt thì rung 1 cái chót là sai).
- **Không rung khi mở màn Cài đặt** để xem nút này — chỉ rung khi
  người dùng gạt nó.

## 12. Cách code bám theo thiết kế này (định hướng, chưa code)

- **1 cổng chung duy nhất.** Mọi chỗ rung trong app gọi qua 1 hàm
  trung tâm (tên gợi ý: `haptic(kind)`), hàm này kiểm tra cờ
  `state.cfg.haptics` trước rồi mới gọi `Haptics` native. Không để
  `navigator.vibrate` rải rác ở `toast()`, `celebrate()`, checklist
  như hiện tại nữa — 3 chỗ đó chuyển sang gọi cổng chung.
- **Map loại rung → API:** `selection` → `selectionChanged()`;
  `light` / `medium` / `heavy` → `impact({ style })`;
  `success` / `warning` / `error` → `notification({ type })`.
- **Fallback web** (chỉ khi chạy ngoài app native, không có plugin):
  map về `navigator.vibrate` như bảng dưới — giữ đúng độ dài hiện tại
  ở chỗ nào đã có, để người dùng web không thấy khác đi:

  | Loại | Fallback web |
  |---|---|
  | `selection` | `4ms` |
  | `light` | `6–8ms` (đã có: tick `6ms`, toast `8ms`) |
  | `medium` | `12ms` |
  | `heavy` | `20ms` |
  | `success` | `[12, 60, 12]` (đã có ở `celebrate()`) |
  | `warning` | `[10, 40, 10]` (đã có ở `toast()` loại warn) |
  | `error` | `[20, 60, 20]` |

- **Không gọi cả native lẫn fallback cùng lúc.** Trên app native chỉ
  gọi plugin; trên web chỉ gọi `navigator.vibrate`. Gọi cả hai là
  rung kép.
- **`celebrate()` không tự rung nữa.** Hàm này chỉ lo visual (sticker
  + chữ). Rung do action gọi nó quyết định (`success` ở Đã giao /
  Xong / đủ đồ — xem §4, §6).
- **`toast()` không tự rung nữa.** Toast chỉ hiện chữ. Rung (nếu có)
  do action gây ra toast quyết định — ví dụ lưu job thành công thì
  action rung `success`, toast chỉ hiện "Đã thêm buổi chụp mới".
  Đây là điểm sửa quan trọng nhất so với code hiện tại: hiện tại
  `toast()` rung với mọi toast, kể cả toast do render thụ động tạo ra.

## 13. Chống rung quá nhiều — checklist kiểm soát

- [ ] Không thao tác nào rung 2 lần cho 1 lần chạm (đặc biệt: Đã giao,
  Xong, tick món cuối — 3 chỗ dễ rung kép nhất vì có cả action,
  toast và celebrate).
- [ ] Không rung khi mở/đóng form, chuyển tab, cuộn, gõ chữ, nhập PIN.
- [ ] `success` chỉ xuất hiện ở đúng 6 chỗ: thêm job mới (§3),
  ghi cọc / thu nốt (§5), sang Đã giao (§4), sang Xong (§4),
  tick đủ đồ (§6), import sao lưu thành công (§9).
  Ngoài 6 chỗ này, không chỗ nào được dùng `success`.
- [ ] `heavy` chỉ xuất hiện ở đúng 2 chỗ: xác nhận huỷ job, xác nhận
  xoá job (§3). Không dùng `heavy` cho xoá khoản tiền hay xoá món
  checklist (chỉ `medium`).
- [ ] Tick checklist nhanh 10 món liên tiếp: vẫn là 10 rung `light`
  rời rạc (mỗi lần chạm 1 rung), không dồn, không leo thang thành
  `medium`/`success` giữa chừng.
- [ ] Tắt nút rung trong Cài đặt → chạm thử thêm job, tick checklist,
  ghi tiền: **không rung gì hết**, kể cả fallback web.
- [ ] Bật lại nút rung → gạt sang BẬT rung `light` 1 lần duy nhất.

## 14. Kiểm thử (trên iPhone thật, không test bằng cảm giác trên máy ảo)

Máy ảo iOS (Simulator) không rung được — mọi mục dưới đây phải thử
trên iPhone thật, tay cầm máy, sau khi build Capacitor:

1. Tắt nút rung → làm đủ các thao tác §3–§10 → không rung.
2. Bật nút rung → thêm job → `success` 1 lần; thêm job thiếu tên →
   `error` 1 lần.
3. Nhảy 1 bước → `light`; nhảy qua 3 bước (có sheet xác nhận) →
   `medium` 1 lần khi bấm xác nhận, không rung khi sheet hiện.
4. Chốt cọc → `light` (đổi bước) + form cọc mở ra không rung thêm;
   ghi cọc xong → `success` 1 lần.
5. Đã giao → `success` 1 lần (dù có toast nhắc thu nốt); Xong còn
   thiếu tiền → `warning` khi sheet hiện, bấm "Vẫn xong" → `success`.
6. Tick checklist từng món → `light`; tick món cuối → `success`
   1 lần thay cho `light`.
7. Thêm nhắc lịch thành công → `light`; job chưa có ngày chụp →
   `warning`.
8. PIN sai → `error` 1 lần + form lắc; PIN đúng → `light`; Face ID
   mở thành công → không rung thêm.
9. Tải sao lưu → `light`; mở sao lưu đúng file → `success`;
   mở file hỏng → `error`.
10. Huỷ job / xoá job → `heavy` 1 lần khi bấm xác nhận, không rung
    khi sheet hỏi hiện ra.

## 15. Ngoài phạm vi v1 (không làm theo file này)

- Rung theo nhịp khi kéo-thả (Kanban kéo thả đã chốt không làm ở v1).
- Cường độ rung tuỳ chỉnh theo từng người (chỉ có bật/tắt ở v1).
- Rung khác nhau cho từng loại job (Portrait / Wedding…) — không cần,
  gây rối.
- Rung khi notification tới (do iOS quyết định, app không can thiệp).
- Âm thanh đi kèm rung — file này chỉ nói về rung, không nói về âm thanh.
