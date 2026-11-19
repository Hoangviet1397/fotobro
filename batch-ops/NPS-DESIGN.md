# Thiết kế khảo sát NPS — FotoBro iOS v1

> Trạng thái: THIẾT KẾ, chưa code. Chỉ là tài liệu để team chốt trước khi triển khai.

## 1. Mục đích

- Đo mức độ người dùng sẵn sàng giới thiệu FotoBro cho photographer tự do khác.
- Thu phản hồi mở để cải tiến app.
- NPS chỉ là con số tham khảo cho team nhỏ, **không dùng để đánh giá người dùng**, không ảnh hưởng tới tính năng, giá, hay quyền lợi của bất kỳ ai.

## 2. Câu hỏi

### Câu chính (bắt buộc, thang 0–10)

> "Bạn có giới thiệu FotoBro cho photographer khác không?"
> 0 = Chắc chắn không · 10 = Chắc chắn có

- Hiển thị 11 nút số 0–10, chọn 1 số.
- Không có đáp án mặc định; người dùng phải tự chọn.

### Câu phụ (mở, không bắt buộc)

> "Vì sao bạn chọn điểm đó?"

- Ô nhập text tự do, tối đa 500 ký tự.
- Có thể bỏ qua, vẫn gửi được điểm số.
- Không hỏi thêm câu nào khác (giữ khảo sát dưới 30 giây).

## 3. Cách tính NPS

- **Promoter (ủng hộ):** 9–10
- **Passive (trung lập):** 7–8
- **Detractor (không hài lòng):** 0–6

```
NPS = % Promoter − % Detractor   (thang −100 đến +100)
```

- Chỉ tính trên số người đã trả lời, không tính người bỏ qua / từ chối.
- Passive không cộng, không trừ — chỉ ghi nhận trong báo cáo.
- Báo cáo kèm: tổng số trả lời, % từng nhóm, và danh sách phản hồi mở (ẩn mọi thông tin định danh).

## 4. Khi nào hỏi

- **Lần đầu:** sau 14 ngày kể từ ngày cài / bắt đầu dùng app (đủ thời gian trải nghiệm lõi: Hôm nay, job pipeline, sổ tiền).
- **Tần suất tối đa:** 2 lần/năm cho mỗi người dùng.
- **Không hỏi khi:** người dùng đang trong job gấp (có job chụp trong 24h tới) hoặc đang nhập liệu dở.
- **Luôn có:** nút "Không hỏi nữa" (tắt vĩnh viễn) và nút "Để sau" (đóng, hỏi lại sau ≥ 90 ngày, vẫn trong giới hạn 2 lần/năm).
- Hỏi 1 lần cho 1 phiên bản lớn; không hỏi lại chỉ vì update nhỏ.

## 5. Lưu trữ & gửi đi (local-first)

- Câu trả lời lưu **local trên máy người dùng trước** (cùng kho dữ liệu local của app, Nấc 1).
- **Chỉ gửi về team khi người dùng đồng ý:** sau khi chọn điểm, hiện rõ "Gửi phản hồi ẩn danh cho team FotoBro?" với 2 nút "Gửi" / "Chỉ lưu trên máy".
- Gửi ẩn danh: không kèm tên, email, số điện thoại, tên job, tên khách hàng, hay dữ liệu sổ tiền. Chỉ gửi: điểm số, câu trả lời mở, phiên bản app, loại thiết bị chung (iPhone/iPad).
- Nếu người dùng chọn "Chỉ lưu trên máy": không gửi gì ra ngoài, không hỏi lại về lần gửi đó.
- Người dùng có thể xem lại / xoá câu trả lời của mình trong Cài đặt → Phản hồi.

## 6. Những gì KHÔNG làm

- Không hỏi NPS trước 14 ngày, không hỏi quá 2 lần/năm.
- Không bắt buộc trả lời để dùng tiếp app; không khoá tính năng nếu không trả lời.
- Không dùng điểm NPS để phân loại, ưu đãi, hay đối xử khác nhau giữa người dùng.
- Không gửi kèm dữ liệu cá nhân hay dữ liệu job/tiền bạc.
- Không dùng SDK khảo sát bên thứ ba thu thập dữ liệu ngầm.

## 7. Chốt trước khi code

- [ ] Việt chốt wording 2 câu hỏi (tiếng Việt + bản tiếng Anh).
- [ ] Chốt vị trí hiển thị (gợi ý: thẻ nhẹ ở màn Hôm nay, không popup chặn).
- [ ] Chốt nơi nhận kết quả (giai đoạn Nấc 1: chỉ xem tổng hợp khi người dùng tự gửi; chưa có dashboard).
