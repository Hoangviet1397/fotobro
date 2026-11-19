# FotoBro — FAQ cộng đồng (bản nháp cho tester beta)

> **Bản nháp, chưa phải câu hỏi thật.** 10 câu dưới đây là dự đoán từ tính năng app (khoá PIN, sao lưu local-first, Google, Lịch iPhone, pipeline job, sổ tiền, giọng nói, thu phí) để chuẩn bị trước cho đợt TestFlight beta — **chưa có tester beta nào hỏi những câu này**. Cập nhật lại sau khi có phản hồi beta thật: thay câu dự đoán bằng câu tester hỏi thật, ghi ngày cập nhật và số tester hỏi.
>
> App: FotoBro iOS v1, Bundle ID `com.fotobro.app`, repo `Hoangviet1397/fotobro`, local-first, Nấc 1 miễn phí. Email `support@fotobro.app` hiện chỉ là placeholder, chưa có hộp mail thật — đừng hướng tester gửi mail vào đó cho tới khi có thật; trong lúc beta, nhận góp ý qua kênh TestFlight / nhóm beta đã hẹn.

## 1. Quên mã PIN thì làm sao?

Mở app bằng Face ID (hoặc mật mã máy) rồi vào Cài đặt để đặt lại mã PIN mới nhé. Nếu quên cả Face ID lẫn mã PIN thì không còn cách mở lại, phải xoá dữ liệu app rồi vào lại từ đầu, nên nhớ tải bản sao lưu trước khi quên.

## 2. Xoá app rồi thì dữ liệu có mất không?

Có, vì dữ liệu chỉ nằm trên máy của bạn, xoá app là mất hết nếu trước đó bạn chưa tải bản sao lưu. Cài lại app rồi vào Cài đặt → Mở bản sao lưu, chọn file sao lưu bạn đã lưu trước đó là dữ liệu về lại.

## 3. Đổi sang iPhone mới thì chuyển dữ liệu thế nào?

Trên máy cũ, bạn vào Cài đặt → Tải bản sao lưu để lưu file JSON, rồi gửi file đó cho chính mình qua AirDrop, Mail hoặc Drive. Trên máy mới, cài FotoBro rồi vào Cài đặt → Mở bản sao lưu và chọn file đó là xong.

## 4. Sao bấm "Đăng nhập Google" mà chưa vào được?

FotoBro chỉ cần bạn bấm 1 nút "Đăng nhập Google" là có hết Lịch, Gmail, Danh bạ và Drive, bạn không cần tự tạo gì thêm. Nếu app báo "chưa sẵn sàng" thì FotoBro đang chờ Client ID chung của app, bạn thử lại sau khi có bản cập nhật nhé.

## 5. Nhập Lịch iPhone thế nào? Sao không thấy sự kiện nào?

Bạn vào Cài đặt → Nhập từ Lịch iPhone, cho phép app đọc Lịch, các sự kiện trong 30 ngày tới sẽ thành buổi chụp. Nếu không thấy sự kiện, bạn kiểm tra quyền Lịch trong Cài đặt iPhone (Quyền riêng tư → Lịch) và chắc chắn sự kiện nằm trong 30 ngày tới.

## 6. Job bị kẹt ở một bước lâu quá thì làm sao?

Bạn cứ bấm thẳng vào bước muốn tới trên thanh tiến độ của job, hoặc bấm "Xong bước này", app không bắt bạn đi lần lượt từng bước đâu. Job kẹt quá lâu app sẽ báo lên màn Hôm nay để bạn để ý, còn job nào không làm nữa thì cứ huỷ, muốn làm lại thì mở job đã huỷ và bấm Khôi phục.

## 7. Làm sao biết khách nào còn thiếu tiền, thiếu bao nhiêu?

Bạn hỏi trợ lý "Ai chưa trả tiền?" hoặc mở chi tiết từng job, app liệt kê khách còn thiếu tiền kèm số thiếu từng người và tổng thiếu. Nhớ ghi cọc ở bước Chốt cọc, khi giao ảnh app sẽ nhắc thu nốt, và nếu bấm Xong mà vẫn còn thiếu tiền thì app sẽ cảnh báo trước.

## 8. Sao lưu ở đâu, bao lâu nên sao lưu một lần?

Bạn vào Cài đặt → Tải bản sao lưu để lưu 1 file JSON về máy, rồi tự cất file đó trong Files, Drive hoặc gửi cho chính mình. Nên tải 1 bản mỗi tuần, app cũng sẽ nhắc sau 7 ngày chưa sao lưu, và lưu ý là khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại nên hãy tải bản mới nhất trước khi khôi phục.

## 9. Sao bấm micro mà không nói được?

Ở bản iOS v1 này mic đang dời sang v1.1, nên bấm micro app sẽ báo "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha". Bạn cứ gõ đúng câu lệnh vào ô "Hỏi trợ lý…", ví dụ "Hôm nay chụp gì?" hay "Ai chưa trả tiền?", app hiểu và trả lời y như khi nói.

## 10. App có thu phí không?

Bản v1 này (Nấc 1) miễn phí, không giới hạn thời gian, đủ hết lõi: Hôm nay, pipeline 8 bước, sổ tiền, nhắc lịch, mẫu tin nhắn, máy tính giá, giọng nói và khoá. Sau này Nấc 2 (đồng bộ nhiều máy) và Nấc 3 (làm nhóm/studio) mới thu phí, nhưng giá và chu kỳ chưa chốt, trong app cũng chưa bật mua hàng gì cả.

---

## Ghi chú cập nhật (cho người giữ file này)

- Nguồn đối chiếu khi viết bản nháp: `HELP-CENTER.md` (câu 1–8, 10), `BACKUP-V2.md` (sao lưu v2 là thiết kế, chưa code — FAQ trên viết theo sao lưu v1 đang có trong app), `VOICE-COMMANDS.md` (mic dời sang v1.1, gõ tay dùng được), `GOOGLE-SETUP.md` (đăng nhập 1 chạm, đang chờ Client ID chung), `PRICING-DRAFT.md` (Nấc 1 miễn phí, giá Nấc 2/3 là TBD).
- Khi có phản hồi beta thật: thêm cột "số tester hỏi" cho từng câu, sửa câu trả lời nào tester chê khó hiểu, xoá câu nào không ai hỏi sau 2 đợt beta, và ghi ngày cập nhật ở đầu file.
