# FotoBro iOS v1 — Mẫu báo lỗi cho tester

> Dùng mẫu này cho **mọi** lỗi phát hiện khi test trên iPhone thật qua TestFlight.
> Một lỗi = một bản báo cáo. Không gộp nhiều lỗi vào một báo cáo.
> Quy tắc chung: xem `../TESTFLIGHT-CHECKLIST.md` để biết ca test tương ứng,
> và xem mục "Đã biết — không báo lại" ở cuối file này trước khi gửi.

- App: FotoBro, Bundle ID `com.fotobro.app`
- Kênh báo lỗi: ghi vào bảng lỗi cuối `TESTFLIGHT-CHECKLIST.md` (ghi số báo cáo
  này vào cột "Ca test"), hoặc gửi file này đã điền đầy đủ cho người tổng hợp.
- Dữ liệu test là hư cấu (khách "Test Portrait", "Test Wedding"...). Không nhập
  job/ảnh/tiền thật của khách. Không test bằng tài khoản Google chính có mail
  khách hàng quan trọng nếu chưa rõ quyền — dùng tài khoản Google test trước.

---

## 1. Mẫu trống — copy toàn bộ mục này cho mỗi lỗi mới

```markdown
### BUG-___ — [Tiêu đề ngắn: tính năng + lỗi thấy được]

- **Người báo:** __________
- **Ngày báo:** ____ / ____ / 2026
- **Ca test (theo TESTFLIGHT-CHECKLIST.md):** ___ (vd: 4.3, 2.2, 3.5)
  — nếu lỗi phát hiện ngoài checklist, ghi "ngoài checklist" + màn hình xảy ra.
- **Máy test:** __________ (vd: iPhone 15)
- **Phiên bản iOS:** __________ (vd: iOS 18.5 — xem ở Cài đặt iPhone → Cài đặt chung → Giới thiệu)
- **Phiên bản app / Build TestFlight:** __________ (vd: FotoBro 1.0, build ___ — xem trong TestFlight)
- **Mức nghiêm trọng:** ☐ Chặn / ☐ Nặng / ☐ Nhẹ
  (xem định nghĩa ở mục 3 — chọn đúng 1 mức)
- **Có mất dữ liệu không:** ☐ Không / ☐ Có — mất: __________ / ☐ Chưa rõ
  (mất dữ liệu = job, khoản thu/chi, ảnh, logo, mẫu tin nhắn, cài đặt đã lưu
  bị mất / về mặc định / không khôi phục được bằng bản sao lưu)
- **Lỗi có tái hiện được không:** ☐ Luôn tái hiện / ☐ Thỉnh thoảng / ☐ Mới gặp 1 lần
- **Tần suất (nếu thỉnh thoảng):** ____ / ____ lần thử thì gặp

#### Tóm tắt (1 câu)
App làm gì sai, ở đâu. Vd: "Bấm Nhập từ Lịch iPhone nhưng app mở khung chọn
file .ics thay vì nhập thẳng sự kiện từ Lịch iPhone."

#### Các bước tái hiện (ghi đúng thứ tự, đủ để người khác làm lại được)
1.
2.
3.
4.
5.

#### Kết quả thực tế (ghi đúng chữ app hiện trên màn hình, nếu có)
> ...

#### Kết quả kỳ vọng (theo TESTFLIGHT-CHECKLIST.md)
> ...

#### Ảnh chụp màn hình / quay màn hình
- [ ] Đã đính kèm ảnh chụp màn hình (bắt buộc với lỗi giao diện, lỗi chữ,
      và mọi lỗi Chặn/Nặng — xem mục 2)
- Tên file ảnh: __________
- Ghi chú trên ảnh (khoanh / mũi tên chỉ chỗ lỗi): __________
- Quay màn hình (nếu lỗi là thao tác nhiều bước / lỗi thỉnh thoảng): __________

#### Dữ liệu test đã dùng
- Job test: __________ (vd: "Test Portrait", loại Portrait, ngày chụp ___)
- Khoản tiền test (nếu liên quan): __________
- Đã thử tắt app mở lại chưa: ☐ Rồi — kết quả: __________ / ☐ Chưa
- Đã thử khởi động lại iPhone chưa: ☐ Rồi — kết quả: __________ / ☐ Chưa

#### Ghi chú thêm
- Lỗi này có chặn các ca test khác không: ☐ Không / ☐ Có — chặn ca: __________
- Đã dọn dữ liệu test sau khi báo chưa: ☐ Rồi / ☐ Chưa (xem mục 12 checklist)
```

---

## 2. Các trường bắt buộc — kiểm tra trước khi gửi

| # | Trường | Bắt buộc? | Ghi thế nào cho đúng |
|---|---|---|---|
| 1 | Người báo + ngày báo | Bắt buộc | Để biết hỏi lại ai, và lỗi thuộc bản build nào. |
| 2 | Ca test | Bắt buộc | Số ca trong `TESTFLIGHT-CHECKLIST.md` (vd: 4.3). Lỗi ngoài checklist thì ghi rõ màn hình + thao tác. |
| 3 | Máy / iOS | Bắt buộc | Ghi đúng mẫu iPhone + số iOS (vd: iPhone 15, iOS 18.5). Lỗi chỉ xảy ra trên 1 máy / 1 bản iOS là manh mối quan trọng. |
| 4 | Phiên bản app / Build TestFlight | Bắt buộc | Ghi cả số version (vd: 1.0) và số build trong TestFlight. Lỗi ở build cũ có thể đã sửa ở build mới — không ghi build thì không đối chiếu được. |
| 5 | Các bước tái hiện | Bắt buộc | Đánh số 1, 2, 3...; bắt đầu từ màn hình Hôm nay hoặc từ lúc mở app; ghi cả thao tác bấm nút nào, nhập dữ liệu gì. Người khác làm đúng các bước này phải gặp lại lỗi. Nếu không tái hiện được, ghi rõ "mới gặp 1 lần" + đã thử lại mấy lần. |
| 6 | Kết quả thực tế | Bắt buộc | Ghi đúng chữ app hiện trên màn hình (copy nguyên văn, kể cả lỗi chính tả), hoặc mô tả chính xác hành vi (crash, đứng màn hình trắng, không phản hồi...). Không ghi "nó bị lỗi" chung chung. |
| 7 | Kết quả kỳ vọng | Bắt buộc | Ghi theo cột "Kết quả mong đợi" của ca test tương ứng trong checklist. Không có kỳ vọng rõ ràng thì không kết luận được là lỗi. |
| 8 | Ảnh chụp màn hình | Bắt buộc với lỗi Chặn/Nặng và mọi lỗi giao diện/chữ | Chụp đúng màn hình lỗi (không chụp màn hình khác). Khoanh/mũi tên chỉ chỗ lỗi nếu không nhìn là thấy ngay. Lỗi là thao tác nhiều bước thì quay màn hình càng tốt. Đặt tên file theo mã lỗi, vd: `BUG-001-nhap-lich-mo-file-ics.png`. |
| 9 | Mức nghiêm trọng | Bắt buộc | Chọn đúng 1 mức theo mục 3. Khi phân vân giữa 2 mức, chọn mức cao hơn và ghi lý do ở Ghi chú thêm. |
| 10 | Có mất dữ liệu không | Bắt buộc | Chọn Không / Có / Chưa rõ. Nếu Có, ghi rõ mất cái gì (job nào, khoản tiền nào, cài đặt nào) và có khôi phục được bằng bản sao lưu `fotobro-sao-luu.json` không. Đây là trường quyết định mức Chặn (xem mục 3). |

**Một báo cáo thiếu bất kỳ trường bắt buộc nào = chưa đủ để sửa, sẽ bị trả lại
để bổ sung.** Riêng lỗi crash / đứng app / màn hình trắng: ghi thêm thời điểm
xảy ra (giờ:phút) và thao tác ngay trước khi crash.

---

## 3. Mức nghiêm trọng và bảng mức độ ưu tiên sửa

Định nghĩa mức nghiêm trọng (khớp với bảng lỗi cuối `TESTFLIGHT-CHECKLIST.md`):

| Mức | Định nghĩa | Ví dụ trong FotoBro v1 |
|---|---|---|
| **Chặn** | Không test tiếp được, hoặc mất dữ liệu, hoặc app không mở được / crash ngay khi mở | App crash ở màn hình đầu (ca 0.2); mở app là màn hình trắng; job/khoản tiền đã lưu biến mất sau khi tắt app mở lại; khôi phục bản sao lưu làm mất sổ thật; nhập sai PIN 5 lần bị khoá cứng không vào lại được mà không có bản sao lưu. |
| **Nặng** | Tính năng chính không làm được, nhưng app vẫn mở và các tính năng khác vẫn dùng được | Không tạo được job mới; pipeline kẹt không chuyển bước được (ca 2.4); ghi cọc xong nhưng số "còn thiếu" tính sai (ca 3.2); nhập Lịch iPhone không tạo được buổi chụp (ca 4.3); đăng nhập Google xong không quay lại app (ca 6.2); bật khoá Face ID xong không mở được bằng Face ID lẫn PIN (ca 8.2–8.3). |
| **Nhẹ** | Dùng được nhưng khó chịu: chữ sai, lệch giao diện, thiếu gợi ý, thao tác thừa | Chữ tiếng Việt mất dấu (ca 11.6); chữ bị cắt ở tai thỏ / Dynamic Island (ca 0.4); nhãn tiếng Anh còn sót tiếng Việt sau khi đổi ngôn ngữ (ca 7.6); nút "Thêm vào Lịch iPhone" khó bấm; màu chữ xám mờ khó đọc ở dark mode (ca 7.2). |

Bảng ưu tiên sửa (người tổng hợp / dev dùng bảng này để xếp hàng sửa):

| Ưu tiên | Mức nghiêm trọng | Mất dữ liệu? | Hành động |
|---|---|---|---|
| **P0 — Sửa ngay, chặn nộp / chặn test tiếp** | Chặn | Có, hoặc có nguy cơ mất dữ liệu | Dừng test diện rộng ở phần liên quan, sửa trước, ra build mới rồi test lại. Không nộp TestFlight rộng hơn khi còn P0. |
| **P1 — Sửa trước khi nộp rộng** | Chặn (không mất dữ liệu) hoặc Nặng ở tính năng chính | Không | Sửa trong bản build tiếp theo; test lại đúng ca đó trước khi nộp rộng. |
| **P2 — Sửa nếu kịp, không thì dời bản sau** | Nặng ở tính năng phụ, hoặc Nhẹ nhưng nhiều người gặp | Không | Ghi vào danh sách bản sau (v1.1) nếu không kịp sửa trong v1; không chặn nộp. |
| **P3 — Ghi nhận, sửa sau** | Nhẹ, gặp 1 lần, không ảnh hưởng dùng thật | Không | Ghi nhận vào backlog; sửa khi rảnh hoặc gộp vào bản sau. |

Quy tắc xếp ưu tiên khi phân vân:

1. Có mất dữ liệu = ít nhất P0, bất kể tính năng lớn hay nhỏ.
2. Lỗi ở luồng chính (tạo job → pipeline 8 bước → ghi tiền → sao lưu) nặng hơn
   lỗi ở luồng phụ (đổi màu chủ đề, sửa mẫu tin nhắn).
3. Lỗi tái hiện luôn nặng hơn lỗi thỉnh thoảng; lỗi thỉnh thoảng nhưng đã gặp
   trên 2 máy khác nhau thì nâng 1 bậc.
4. Lỗi chỉ xảy ra khi làm sai quy trình test (vd: nhập file .jpg làm bản sao
   lưu ở ca 9.4 mà app báo đúng) thì không phải lỗi — ghi vào Ghi chú, không
   xếp ưu tiên.

---

## 4. Ví dụ 1 báo lỗi mẫu đã điền sẵn

> ⚠️ Đây là **ví dụ mẫu để tester làm theo**, không phải báo cáo lỗi thật.
> Lỗi trong ví dụ này trùng với 1 điểm đã biết trong `QA-REPORT.md`
> (plugin Lịch iPhone chưa được cài/quyền chưa khai nên app rơi về fallback
> chọn file `.ics`) — xem mục 5. Tester gặp đúng lỗi này trên bản build mới
> thì vẫn báo lại bằng mẫu này, ghi rõ số build đã test.

```markdown
### BUG-001 — Nhập từ Lịch iPhone mở khung chọn file .ics thay vì nhập thẳng sự kiện

- **Người báo:** Việt
- **Ngày báo:** 20 / 11 / 2026
- **Ca test (theo TESTFLIGHT-CHECKLIST.md):** 4.3
- **Máy test:** iPhone 15
- **Phiên bản iOS:** iOS 18.5
- **Phiên bản app / Build TestFlight:** FotoBro 1.0, build 1
- **Mức nghiêm trọng:** ☑ Nặng (tính năng chính của v1 không làm được theo
  đúng thiết kế 1 chạm; app vẫn mở và dùng được các tính năng khác)
- **Có mất dữ liệu không:** ☑ Không — không tạo job rác, không mất dữ liệu cũ
- **Lỗi có tái hiện được không:** ☑ Luôn tái hiện
- **Tần suất (nếu thỉnh thoảng):** —

#### Tóm tắt (1 câu)
Bấm "Nhập từ Lịch iPhone" nhưng app mở khung chọn file thay vì nhập thẳng
sự kiện 30 ngày tới từ Lịch iPhone.

#### Các bước tái hiện (ghi đúng thứ tự, đủ để người khác làm lại được)
1. Tạo sẵn trong app Lịch iPhone 2 sự kiện: "Chụp Test Lịch" ngày mai 09:00,
   có địa điểm "Studio test".
2. Mở FotoBro, vào tab Buổi chụp.
3. Bấm nút "Nhập từ Lịch iPhone".
4. Cho phép quyền truy cập Lịch khi app hỏi (lần đầu).
5. Bấm lại nút "Nhập từ Lịch iPhone" 1 lần.

#### Kết quả thực tế (ghi đúng chữ app hiện trên màn hình, nếu có)
> App mở khung chọn file để chọn file .ics, không hiện danh sách sự kiện
> từ Lịch iPhone và không tạo buổi chụp nào. Không có thông báo lỗi.

#### Kết quả kỳ vọng (theo TESTFLIGHT-CHECKLIST.md)
> Sự kiện 30 ngày tới tự thành buổi chụp trong FotoBro (đúng tên, ngày, giờ,
> địa điểm) — ca 4.3. Không còn nhập file .ics / .zip ở v1.

#### Ảnh chụp màn hình / quay màn hình
- [x] Đã đính kèm ảnh chụp màn hình
- Tên file ảnh: `BUG-001-nhap-lich-mo-file-ics.png`
- Ghi chú trên ảnh (khoanh / mũi tên chỉ chỗ lỗi): khoanh khung chọn file
  vừa mở, kèm chú thích "đáng lẽ phải nhập thẳng từ Lịch iPhone"
- Quay màn hình (nếu lỗi là thao tác nhiều bước / lỗi thỉnh thoảng): không có

#### Dữ liệu test đã dùng
- Job test: chưa có job nào được tạo từ lần nhập này; 2 sự kiện Lịch test
  "Chụp Test Lịch" ngày mai 09:00 vẫn còn trong app Lịch iPhone.
- Khoản tiền test (nếu liên quan): không liên quan.
- Đã thử tắt app mở lại chưa: ☑ Rồi — kết quả: vẫn mở khung chọn file như cũ.
- Đã thử khởi động lại iPhone chưa: ☐ Chưa

#### Ghi chú thêm
- Lỗi này có chặn các ca test khác không: ☑ Có — chặn ca: 4.3, 4.5
  (không nhập được nên không kiểm được chống trùng lần nhập thứ 2).
- Đã dọn dữ liệu test sau khi báo chưa: ☐ Chưa (chưa tạo job rác nên chưa
  cần dọn; sẽ xoá 2 sự kiện Lịch test sau khi test lại).
```

---

## 5. Đã biết — không báo lại (trừ khi gặp trên bản build mới sau khi đã sửa)

Những điểm dưới đây đã ghi trong `QA-REPORT.md` (kiểm chứng 20/11/2026) hoặc
trong `TESTFLIGHT-CHECKLIST.md` — tester gặp đúng các điểm này thì **không
cần báo lỗi mới**, chỉ tick vào checklist và ghi số build:

| # | Điểm đã biết | Ghi chú cho tester |
|---|---|---|
| 1 | Đăng nhập Google báo "chưa sẵn sàng" | Bình thường khi chưa dán Client ID Google chung vào `fotobro-config.js`. Ghi ⏭️ BỎ QUA toàn mục 6, không ghi lỗi. |
| 2 | CloudKit (Nấc 2) chỉ là placeholder `not-configured` | Chưa đồng bộ thật ở v1, đừng test đồng bộ. Sao lưu v1 là file JSON `fotobro-sao-luu.json` tải về máy. |
| 3 | Mic / giọng nói có thể chưa có ở v1 | Chỉ test mục 10 nếu bản TestFlight ghi rõ mic đã có. Không có nút mic thì ghi ⏭️ BỎ QUA toàn mục 10 (mic dời sang v1.1). |
| 4 | Nhập Lịch iPhone rơi về chọn file `.ics` | Đã biết ở phía dev (plugin Lịch chưa được cài, thiếu quyền `NSCalendarsUsageDescription` trong `Info.plist`). Gặp trên bản build mới sau khi dev báo đã sửa thì báo lại bằng mẫu BUG-001 ở mục 4. |
| 5 | Workflow build còn ghim Xcode 16.4 | Lỗi phía build/submit, không phải lỗi tester thấy trên iPhone. Không báo. |
| 6 | Nền Capacitor / splash còn màu kem `#FBF5EA` | Lệch hướng UI Apple Music (trắng sạch + dark mode đen) — đã biết, đang chờ sửa. Chỉ báo lại nếu sau khi sửa mà vẫn còn màu kem. |
| 7 | Dòng chữ job mẫu `sampleNote` còn trong app | Job mẫu đã bỏ (sổ mặc định trống) nhưng dòng chữ "Đang có vài job mẫu..." có thể còn hiện — đã biết, đang chờ xoá. Gặp thì ghi Nhẹ, không cần báo dài. |
| 8 | Số version trong test cũ ghi 2.6, app v1 ghi 1.0 | Chênh lệch do test cũ chưa cập nhật theo spec v1, không phải lỗi trên app. Không báo. |

Ngoại lệ: nếu một điểm "đã biết" gây ra hậu quả mới chưa ghi ở đây
(vd: rơi về chọn file .ics rồi chọn nhầm file làm mất dữ liệu), thì báo lỗi
mới, ghi rõ hậu quả mới đó và dẫn lại điểm đã biết liên quan.

---

## 6. Sau khi gửi báo cáo

1. Ghi mã lỗi (BUG-___) vào bảng lỗi cuối `TESTFLIGHT-CHECKLIST.md`, đúng ca test.
2. Giữ nguyên dữ liệu test liên quan cho tới khi dev xác nhận đã tái hiện được
   lỗi — đừng xoá job/khoản test đó vội (trừ khi đó là dữ liệu thật của khách).
3. Khi có build mới sửa lỗi: test lại đúng các bước tái hiện trong báo cáo,
   ghi kết quả vào báo cáo cũ (ĐẠT / vẫn lỗi) thay vì tạo báo cáo mới.
4. Dọn dữ liệu test theo mục 12 checklist khi xong đợt test.
```

---

## Kiểm tra nhanh trước khi nộp mẫu này cho tester

- [ ] Mẫu trống có đủ 10 trường bắt buộc ở mục 2.
- [ ] Ví dụ BUG-001 điền đủ mọi trường, bước tái hiện làm lại được, kỳ vọng
      lấy đúng ca 4.3 trong checklist.
- [ ] Bảng ưu tiên P0–P3 khớp định nghĩa Chặn/Nặng/Nhẹ trong checklist.
- [ ] Mục "Đã biết" khớp `QA-REPORT.md` (Google chưa có Client ID, CloudKit
      placeholder, mic có điều kiện, plugin Lịch, Xcode 16.4, nền kem
      `#FBF5EA`, `sampleNote`, version test cũ 2.6).
- [ ] Không nhắc tester làm gì ngoài phạm vi test trên iPhone thật
      (không sửa code, không push GitHub).
