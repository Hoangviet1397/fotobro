# Khảo sát góp ý trong app FotoBro

> Thiết kế — chưa code. App: FotoBro iOS v1 (Bundle ID `com.fotobro.app`, repo `Hoangviet1397/fotobro`), local-first, Nấc 1 miễn phí.

## Mục đích

Thu góp ý thật từ người dùng sau khi đã dùng app đủ lâu để đánh giá, phục vụ cải tiến v1.x — không làm phiền, không thu thập dữ liệu cá nhân.

## Khi nào hiện khảo sát

- Hiện lần đầu **sau 7 ngày** kể từ ngày cài / mở app lần đầu.
- Tối đa **1 lần/tháng** — dù người dùng bỏ qua hay đã trả lời.
- Không hiện khi đang làm việc dở trong app (đang tạo/sửa job, đang tính giá); chỉ hiện ở màn hình Hôm nay, sau khi mở app.
- Luôn có nút **Bỏ qua** rõ ràng; bấm Bỏ qua = không hiện lại trong tháng đó.
- Có mục **Góp ý** trong Cài đặt để người dùng chủ động mở lại bất cứ lúc nào (không bị giới hạn 1 lần/tháng).

## 5 câu hỏi

| # | Câu hỏi | Dạng trả lời |
|---|---------|--------------|
| 1 | Bạn hài lòng với FotoBro ở mức nào? | 1–5 sao (bắt buộc, chạm để chọn) |
| 2 | Tính năng nào bạn dùng nhiều nhất? | Chọn 1 trong: Hôm nay · Pipeline job · Sổ tiền / Báo cáo · Nhắc lịch · Mẫu tin nhắn · Máy tính giá · Giọng nói · Khác |
| 3 | Tính năng nào bạn thấy thiếu nhất? | Chọn 1 trong: Đồng bộ nhiều thiết bị · Làm nhóm / studio · Xuất báo cáo · Mẫu tin nhắn thêm · Nhắc lịch nâng cao · Khác (ghi thêm) |
| 4 | Bạn gặp lỗi gì khi dùng app? | Ô tự do, không bắt buộc (mô tả lỗi, bước gặp lỗi nếu nhớ) |
| 5 | Bạn có giới thiệu FotoBro cho photographer khác không? | Có / Chưa chắc / Không (+ ô tự do ngắn: vì sao, không bắt buộc) |

- Câu 1 là bắt buộc; các câu còn lại được phép bỏ trống (trừ khi chọn "Khác" thì nên ghi thêm).
- Nút **Gửi góp ý** chỉ bật sau khi đã chọn sao ở câu 1.

## Dữ liệu lưu ở đâu — gửi như thế nào

- **Local-first:** câu trả lời chỉ lưu trên máy người dùng cho tới khi họ bấm **Gửi góp ý**. Không tự động gửi, không gửi nền, không gửi kèm dữ liệu job / sổ tiền / danh bạ.
- **Chỉ gửi khi người dùng bấm gửi:** sau khi bấm gửi, app mở **email soạn sẵn** (địa chỉ hỗ trợ FotoBro — chờ chốt) hoặc **form góp ý** (chờ chốt link), nội dung là 5 câu trả lời. Người dùng tự bấm gửi email / gửi form — app không tự gửi thay.
- **Không thu thập tên / email** trừ khi người dùng tự điền vào ô tùy chọn "Tên / email của bạn (không bắt buộc, chỉ để liên hệ lại khi cần)".
- Không thu thập: vị trí, danh bạ, nội dung job, số tiền, ảnh, ID thiết bị.
- Sau khi gửi xong, lưu mốc "đã khảo sát tháng này" trên máy để không hiện lại trong tháng; nội dung câu trả lời không cần giữ lại trong app sau khi đã gửi (xóa khỏi máy sau khi gửi thành công, trừ khi người dùng muốn giữ bản sao).

## Ghi chú cho lúc code (v1.x)

- Đếm ngày dùng = số ngày khác nhau có mở app (lưu local), không phải 7 ngày liên tục.
- Tôn trọng giới hạn 1 lần/tháng kể cả sau khi cập nhật app.
- Ngôn ngữ: Việt/Anh theo ngôn ngữ app (xem `I18N-STRINGS.md` khi làm).
- Không hiện khảo sát trong tuần đầu sau khi người dùng vừa khôi phục dữ liệu / nhập từ Lịch iPhone (tránh làm phiền lúc đang làm quen lại).
