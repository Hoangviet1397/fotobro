# Mẫu tin nhắn & email — FotoBro

Bộ mẫu dùng chung cho nhiếp ảnh gia tự do. Mỗi mẫu có chỗ trống để điền
tên khách, loại job, giá, ngày giờ — điền tay hoặc để app tự điền khi gửi
từ chi tiết job.

## Chỗ trống dùng trong mọi mẫu

| Chỗ trống | Nghĩa | Ví dụ |
|---|---|---|
| `{ten}` | Tên khách | Mai Anh |
| `{type}` | Loại job (kèm Digital / Film / Cả hai) | Wedding — Digital |
| `{date}` | Ngày chụp | 20/12/2026 |
| `{time}` | Giờ chụp | lúc 08:00 |
| `{loc}` | Địa điểm | Đà Lạt |
| `{price}` | Tổng giá job | 15.000.000₫ |
| `{dep}` | Tiền cọc ({pct}% cọc trước) | 5.000.000₫ |
| `{paid}` | Đã nhận | 5.000.000₫ |
| `{owe}` | Còn thiếu | 10.000.000₫ |
| `{drive}` | Link thư mục ảnh (Drive) | drive.google.com/… |
| `{studio}` | Tên studio của bạn | Sadako Photography |
| `{sign}` | Chữ ký: tên + studio + Instagram | — |

Chỗ trống chỉ hiện khi có dữ liệu: `{depPart}` chỉ hiện khi có cọc,
`{owePart}` / `{owePart2}` chỉ hiện khi còn thiếu tiền, `{driveOrNote}`
hiện link Drive nếu có, không thì hiện câu hẹn gửi link sau.
Trong app, 5 mẫu email gốc (`confirm`, `deposit`, `remind`, `deliver`,
`balance`) sửa được ở Cài đặt → Mẫu tin nhắn / email, có nút Khôi phục
mẫu gốc cho từng mẫu.

---

## A. 5 mẫu email

### E1. Chào khách mới

**Dùng khi:** khách vừa nhắn hỏi lần đầu, chưa chốt gói nào.
**Tiêu đề:** Chào {ten} — {studio} đây ạ

> Chào {ten},
>
> Cảm ơn bạn đã nhắn cho {studio}! Mình chụp {type} và các gói khác,
> bạn đang quan tâm buổi chụp nào, ngày nào và ở đâu nhỉ?
>
> Bạn gửi mình vài ý bạn thích (phong cách, địa điểm, số người chụp)
> là mình báo giá và giữ lịch cho bạn ngay.
>
> Cảm ơn bạn!{sign}

### E2. Báo giá

**Dùng khi:** đã biết loại job, ngày, địa điểm; gửi giá chính thức.
**Tiêu đề:** Báo giá chụp {type} — {studio}

> Chào {ten},
>
> Mình gửi bạn báo giá buổi chụp {type}:
>
> • Ngày: {date}{time}
> • Địa điểm: {loc}
> • Chi phí: {price}{depPart}
>
> Giá đã gồm chụp, chỉnh màu và giao ảnh online. Album, ảnh in thêm
> và giờ chụp thêm tính riêng, mình báo trước khi làm, không phát
> sinh lặng lẽ.
>
> Bạn ok thì mình giữ lịch cho bạn, cọc trước giữ lịch chắc chắn hơn.
> Bạn có câu hỏi nào cứ trả lời email này nha.{sign}

### E3. Nhắc cọc

**Dùng khi:** khách đã chốt lịch nhưng chưa chuyển cọc.
**Tiêu đề:** Giữ lịch chụp {type} — cọc trước {dep}

> Chào {ten},
>
> Lịch chụp {type} của bạn ngày {date}{time} mình đang giữ, nhưng
> chưa có cọc nên lịch chưa chắc chắn — có khách khác hỏi cùng ngày
> mình vẫn phải ưu tiên người cọc trước.
>
> Bạn chuyển giúp mình {dep} để giữ lịch nhé. Chuyển xong nhắn mình
> một tiếng, mình xác nhận lại ngay.
>
> Cảm ơn bạn!{sign}

### E4. Nhắc lịch chụp

**Dùng khi:** gửi trước buổi chụp 1 ngày (app nhắc trước 12 tiếng).
**Tiêu đề:** Nhắc lịch chụp {date}{time}

> Chào {ten},
>
> Mình nhắc lịch chụp {type} của mình nè:
>
> • Ngày: {date}{time}
> • Địa điểm: {loc}
>
> Bạn nhớ ngủ sớm, chuẩn bị trang phục và phụ kiện như đã hẹn,
> tới sớm 10–15 phút để mình chỉnh ánh sáng nha. Có gì cần đổi giờ
> cứ báo mình sớm.
>
> Hẹn gặp bạn!{sign}

### E5. Giao ảnh + nhắc thu nốt

**Dùng khi:** ảnh đã xong, gửi link + nhắc phần còn thiếu (nếu có).
**Tiêu đề:** Ảnh buổi chụp {type} của bạn đã xong!

> Chào {ten},
>
> Ảnh buổi chụp {type} của bạn xong rồi nè. Bạn xem và tải ảnh ở đây:
> {driveOrNote}
>
> Tấm nào muốn mình chỉnh thêm bạn cứ nói nha.{owePart2}
>
> Nếu bạn vui, cho mình xin một câu cảm nhận và cho phép mình đăng
> vài tấm lên trang nhé. Cảm ơn bạn rất nhiều!{sign}

---

## B. 5 mẫu nhắn nhanh (Zalo / Messenger)

Ngắn, 2–4 dòng, copy là gửi. Không cần tiêu đề. Các mẫu này không có
sẵn trong app — dùng trực tiếp từ đây, hoặc dán vào mẫu email trong
Cài đặt rồi sửa ngắn lại cho hợp giọng của bạn.

### Z1. Chào khách mới

> Chào {ten} ạ, mình là {studio} đây. Bạn đang cần chụp {type}
> ngày nào, ở đâu nhỉ? Gửi mình vài ý bạn thích là mình báo giá
> ngay cho bạn nhé.

### Z2. Báo giá

> Chào {ten}, báo giá chụp {type} ngày {date} ở {loc} của bạn là
> {price} ạ.{depPart} Bạn ok thì mình giữ lịch cho bạn nhé.

### Z3. Nhắc cọc

> Chào {ten}, lịch chụp {type} ngày {date} mình đang giữ cho bạn,
> bạn chuyển giúp mình {dep} để giữ lịch chắc chắn nhé. Chuyển
> xong nhắn mình một tiếng ạ.

### Z4. Nhắc lịch chụp

> Chào {ten}, mai {date}{time} mình chụp {type} ở {loc} nhé.
> Bạn tới sớm 10–15 phút giúp mình, có gì đổi giờ cứ báo sớm ạ.

### Z5. Giao ảnh + nhắc thu nốt

> Chào {ten}, ảnh buổi chụp {type} của bạn xong rồi nè:
> {driveOrNote}{owePart2}
> Bạn xem thử, tấm nào muốn chỉnh thêm cứ nói mình nhé. Cảm ơn
> bạn nhiều!

---

## Ghi chú cho người dùng

- **Đừng gửi giá film và giá digital lẫn nhau:** job “Cả hai” cộng
  cả hai bảng giá; mẫu báo giá chỉ hiện `{price}` là tổng đã cộng.
- **Nhắc cọc thì nhắc 1 lần, khéo léo:** nếu khách chưa trả lời sau
  2 ngày, nhắn lại 1 lần rồi thôi — giữ lịch thêm 2 ngày nữa rồi
  mới nhả lịch cho khách khác.
- **Nhắc thu nốt đi kèm giao ảnh, không tách riêng:** khách vừa
  nhận ảnh là lúc dễ trả nhất; gửi riêng một tin đòi tiền sau đó
  thường bị xem là khó chịu.
- **Sửa mẫu theo giọng của bạn:** các mẫu trên viết theo giọng
  lịch sự, thân thiện. Nếu bạn xưng hô khác (mình/tớ/em), sửa
  trong Cài đặt → Mẫu tin nhắn / email một lần là áp dụng cho
  mọi lần sau.
- **Chỗ trống chưa có dữ liệu sẽ để trống:** ví dụ job chưa có
  địa điểm thì `{loc}` hiện câu hẹn báo sau — kiểm tra lại trước
  khi bấm Gửi.
