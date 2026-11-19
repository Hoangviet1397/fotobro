# FotoBro — Tìm kiếm trong Trung tâm trợ giúp (Help Search)

- Phạm vi: thiết kế, chưa code. Nối vào màn Trợ giúp (Cài đặt → Trợ giúp) đã có trong `HELP-CENTER.md` (10 câu hỏi thường gặp, tiếng Việt + tiếng Anh).
- Nguyên tắc: chạy hoàn toàn offline trên dữ liệu có sẵn trong app, không gọi mạng, không cần đăng nhập.

## 1. Vị trí và giao diện

- Ô tìm kiếm đặt ở đầu màn Trợ giúp, ngay trên danh sách 10 câu hỏi, luôn hiện (không ẩn sau nút).
- Placeholder: tiếng Việt "Tìm câu hỏi…" / tiếng Anh "Search help…".
- Có nút X để xoá nhanh từ khoá; xoá hết thì trở lại danh sách đầy đủ 10 câu.
- Gõ là tìm ngay (không cần bấm Enter), tìm trên cả 10 câu hỏi.

## 2. Tìm tiếng Việt không dấu + có dấu

- Mọi từ khoá và nội dung đều được chuẩn hoá trước khi so khớp: bỏ dấu tiếng Việt (à→a, ơ→o, đ→d…), viết thường, gom khoảng trắng thừa.
- Ví dụ: "quen PIN" tìm ra "Quên mã PIN thì làm sao?"; "sao luu" tìm ra "Sao lưu và khôi phục thế nào?"; "lich iphone" tìm ra câu 6.
- Tìm theo từng từ: từ khoá nhiều từ thì câu hỏi chứa đủ các từ (không cần đúng thứ tự) vẫn khớp, ví dụ "quên PIN Face ID" khớp câu 1 và câu 2.
- Tìm cả tiếng Anh theo cùng cách (không dấu sẵn có): "backup" tìm ra câu 3, 4, 7.

## 3. Thứ tự kết quả (mức khớp)

1. **Tiêu đề khớp** — từ khoá xuất hiện trong tiêu đề câu hỏi (ví dụ "PIN" → câu 1, câu 2).
2. **Nội dung khớp** — từ khoá chỉ xuất hiện trong phần trả lời (ví dụ "AirDrop" → câu 4).
- Trong cùng một mức, giữ thứ tự gốc 1→10 của `HELP-CENTER.md`.
- Kết quả hiện dạng danh sách như bình thường (tiêu đề + 2 dòng đầu câu trả lời), chạm vào thì mở rộng toàn bộ câu trả lời Việt + Anh.
- Hiện số kết quả, ví dụ "3 kết quả cho 'PIN'".
- Tô đậm (highlight) từ khoá khớp trong tiêu đề và đoạn trích.

## 4. Không tìm thấy

- Hiện dòng: "Không tìm thấy câu hỏi nào cho '…'." kèm 2 phần:
  1. **Gợi ý câu hỏi liên quan** — 3 câu gần nhất theo độ tương đồng (chung từ khoá, cùng chủ đề: ví dụ tìm "đổi mật khẩu" thì gợi ý câu 1 Quên PIN, câu 2 Face ID, câu 10 Liên hệ hỗ trợ). Nếu không tính được độ tương đồng thì gợi ý 3 câu được xem nhiều nhất: câu 1, câu 3, câu 7.
  2. **Nút "Liên hệ hỗ trợ"** — mở màn liên hệ theo câu 10 (`support@fotobro.app`, kèm tên máy, phiên bản app, các bước làm ra lỗi).

## 5. Dữ liệu và hiệu năng

- Nguồn dữ liệu: 10 câu hỏi + trả lời trong `HELP-CENTER.md`, đóng gói sẵn trong app (file tĩnh, cùng nguồn với màn Trợ giúp).
- Tìm kiếm chạy ngay trên máy: chuẩn hoá chuỗi rồi so khớp, 10 mục nên kết quả trả về tức thì, không cần chỉ mục (index) riêng.
- Ngôn ngữ: tìm trên cả hai ngôn ngữ; thứ tự hiển thị câu trả lời theo ngôn ngữ đã chọn trong Cài đặt (như mục "Ghi chú cho agent code" của `HELP-CENTER.md`).
- Không lưu lịch sử tìm kiếm, không gửi từ khoá đi đâu.

## 6. Kiểm chứng sau khi code

1. Gõ "quen PIN" → câu 1 lên đầu; gõ "sao luu" → câu 3 và 7; gõ "backup" → câu 3, 4, 7.
2. Gõ "PIN" → câu 1, 2 (tiêu đề khớp) đứng trước câu có "PIN" chỉ trong nội dung.
3. Gõ từ không có, ví dụ "hoàn tiền" → hiện câu "Không tìm thấy", 3 gợi ý và nút Liên hệ hỗ trợ.
4. Xoá từ khoá → đủ lại 10 câu theo thứ tự gốc.
5. Tắt mạng/Wi-Fi → tìm kiếm vẫn chạy bình thường.
6. Màn hình iPhone SE: ô tìm kiếm không tràn, không che danh sách.
