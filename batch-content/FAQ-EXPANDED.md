# FotoBro — Câu hỏi thường gặp bổ sung (FAQ Expanded)

- Mục đích: 20 câu hỏi thường gặp BỔ SUNG cho app FotoBro iOS v1, hiển thị trong app (Cài đặt → Trợ giúp), mỗi câu trả lời ngắn 2–3 câu, tiếng Việt + tiếng Anh.
- KHÔNG trùng với 10 câu trong `HELP-CENTER.md` (quên PIN, Face ID không nhận, lỡ xoá app/mất dữ liệu, đổi iPhone mới, đăng nhập Google, nhập Lịch iPhone, sao lưu/khôi phục, huỷ job rồi khôi phục, đổi bảng giá, liên hệ hỗ trợ).
- Nguồn dữ liệu thật: đối chiếu `www/index.html` trong `~/workspace/fotobro-ios-v1/` (pipeline 8 bước, sổ tiền/báo cáo, nhắc lịch, mẫu tin nhắn, máy tính giá Digital/Film/Cả hai, khoá, Google 1 chạm, nhập Lịch iPhone native, sao lưu JSON).
- Quy ước: "bản sao lưu" = file `fotobro-sao-luu.json` tải từ app. Dữ liệu chỉ nằm trên máy, không tài khoản, không máy chủ.

## 1. Chuyển job sang bước tiếp theo thế nào? Có nhảy thẳng tới bước sau được không?

**Tiếng Việt:** Mở chi tiết job rồi bấm nút bước tiếp theo, hoặc chạm thẳng vào bất kỳ bước nào trong pipeline 8 bước (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong) để nhảy tới đó. App không bắt bạn đi lần lượt từng bước, nên job nào làm tắt cũng cập nhật đúng vị trí thật của nó.

**English:** Open the job and tap the next-step button, or tap any step directly in the 8-step pipeline (Consulting → Deposit → Scheduled → Shot → Selecting → Editing → Delivered → Done) to jump straight there. You don't have to move step by step, so a job that skips ahead still shows its real position.

## 2. Job kẹt ở một bước quá lâu thì app báo thế nào?

**Tiếng Việt:** Job nào nằm ở một bước quá lâu sẽ tự hiện lên màn hình Hôm nay để bạn chú ý xử lý. Bạn chỉ cần mở job đó, cập nhật bước mới hoặc ghi chú lý do kẹt, cảnh báo sẽ tự biến mất.

**English:** A job stuck on one step for too long automatically appears on the Today screen so you notice it. Just open that job, move it to a new step or note why it's stuck, and the warning clears by itself.

## 3. Tiền cọc ghi ở đâu? Làm sao biết khách còn thiếu bao nhiêu?

**Tiếng Việt:** Khi job tới bước "Chốt cọc", ghi số tiền cọc khách đã đóng ngay trong chi tiết job; app tự tính còn thiếu = tổng giá job trừ đi cọc và các lần thu sau. Số còn thiếu hiện rõ trong chi tiết job và trong sổ tiền, nên bạn luôn biết khách nào chưa trả đủ.

**English:** When a job reaches "Deposit", enter the deposit the client paid in the job details; the app calculates the balance as the total price minus the deposit and later payments. The remaining amount shows in the job details and in the money book, so you always know who still owes you.

## 4. Đã giao ảnh mà khách chưa trả đủ tiền thì sao?

**Tiếng Việt:** Khi job tới bước "Đã giao" mà vẫn còn tiền thiếu, app sẽ nhắc bạn thu nốt trước khi đánh dấu xong. Tới bước "Xong" mà vẫn còn thiếu tiền, app hiện cảnh báo rõ ràng để bạn không vô tình chốt job khi chưa thu đủ.

**English:** When a job reaches "Delivered" with money still outstanding, the app reminds you to collect the rest before marking it done. If you mark it "Done" while money is still owed, the app shows a clear warning so you don't accidentally close a job before getting paid in full.

## 5. Sổ tiền và báo cáo ngày / tuần / tháng xem ở đâu?

**Tiếng Việt:** Vào tab Sổ tiền để xem từng khoản thu theo đợt, theo loại job và từng khoản chi theo job, vận hành tháng hay thiết bị. Báo cáo ngày, tuần, tháng tổng hợp sẵn thu – chi – còn thiếu, giúp bạn biết ngay tháng này làm được bao nhiêu mà không cần tính tay.

**English:** Open the Money tab to see every income entry by instalment and job type, and every expense by job, monthly running cost or equipment. Daily, weekly and monthly reports already total income, expenses and outstanding amounts, so you can see how the month went without doing the maths yourself.

## 6. Thêm khoản chi (tiền xăng, thuê đồ, sửa máy…) thế nào?

**Tiếng Việt:** Trong Sổ tiền, bấm thêm khoản chi, chọn gắn vào một job cụ thể hoặc để là chi vận hành chung của tháng. Khoản chi gắn theo job sẽ tính vào lãi của job đó, còn chi chung sẽ tính vào báo cáo tháng.

**English:** In the Money tab, add an expense and attach it to a specific job or leave it as a general monthly running cost. Expenses attached to a job count against that job's profit, while general costs count in the monthly report.

## 7. Mẫu tin nhắn / email cho khách sửa được không? Sửa hỏng thì sao?

**Tiếng Việt:** Được. Vào Cài đặt → Mẫu tin nhắn, sửa nội dung mẫu theo cách nói của bạn, app sẽ dùng mẫu đó khi soạn tin cho khách. Sửa hỏng cũng không sao — bấm "Khôi phục mẫu gốc" là mẫu trở về như ban đầu.

**English:** Yes. Go to Settings → Message templates, edit any template in your own words, and the app will use it when drafting messages to clients. If an edit goes wrong, tap "Restore original template" and it goes back to the default.

## 8. Máy tính giá Digital / Film / Cả hai khác nhau ra sao?

**Tiếng Việt:** Khi tạo job, chọn "Chụp bằng": Digital dùng bảng giá digital, Film dùng bảng giá film riêng, "Cả hai" cộng cả hai bảng giá lại. Chọn đúng ngay từ đầu để giá tự điền chính xác và khách không bị báo sai giá.

**English:** When creating a job, pick "Shot on": Digital uses the digital price list, Film uses the separate film price list, and "Both" adds the two together. Choose correctly from the start so the price fills in accurately and clients never get a wrong quote.

## 9. Giá film đặt ở đâu? Giá film hiện 0 nghĩa là gì?

**Tiếng Việt:** Giá film đặt trong Cài đặt → Bảng giá, mỗi gói chụp có một giá film riêng do bạn tự điền, không có giá mặc định. Giá hiện 0 nghĩa là bạn chưa đặt giá film cho gói đó, nên hãy nhập giá trước khi báo giá film cho khách.

**English:** Film prices live in Settings → Price list, with a separate film price per package that you fill in yourself — there is no preset. A price showing 0 means you haven't set a film price for that package yet, so enter it before quoting film to a client.

## 10. Nhắc lịch hoạt động thế nào? Tắt / bật nhắc ở đâu?

**Tiếng Việt:** App nhắc trong app trước mỗi buổi chụp và trước hạn giao ảnh, nhắc nhở vẫn là nhắc chính của FotoBro. Bật hoặc tắt nhắc trong Cài đặt → Nhắc lịch; tắt nhắc trong app không xoá buổi chụp khỏi Lịch iPhone của bạn.

**English:** The app reminds you in-app before each shoot and before each photo delivery deadline — in-app reminders are FotoBro's main reminders. Turn them on or off in Settings → Reminders; turning them off does not remove the shoot from your iPhone Calendar.

## 11. Thêm buổi chụp vào Lịch iPhone từ trong app thế nào?

**Tiếng Việt:** Trong chi tiết job, bấm "Thêm vào Lịch iPhone" để tạo sự kiện đúng ngày giờ buổi chụp. Sự kiện này nằm trong Lịch iPhone của bạn, sửa hay xoá trong Lịch sẽ không làm mất job trong FotoBro.

**English:** In the job details, tap "Add to iPhone Calendar" to create an event at the shoot's date and time. The event lives in your iPhone Calendar, and editing or deleting it there will not delete the job in FotoBro.

## 12. Đổi màu chủ đề và logo studio ở đâu?

**Tiếng Việt:** Vào Cài đặt → Giao diện, chọn 1 trong 3 màu chủ đề có sẵn và tải logo studio của bạn lên để app mang dấu riêng của studio. Đổi màu hay logo chỉ thay đổi hiển thị, không ảnh hưởng gì tới job, tiền hay lịch của bạn.

**English:** Go to Settings → Appearance, pick one of the 3 built-in theme colours and upload your studio logo so the app carries your studio's identity. Changing the colour or logo only changes how the app looks — your jobs, money and calendar stay untouched.

## 13. Đổi ngôn ngữ Việt / Anh và tiền tệ VND / USD thế nào?

**Tiếng Việt:** Vào Cài đặt → Ngôn ngữ & Tiền tệ, chọn tiếng Việt hoặc English và chọn hiển thị VND hoặc USD. Đổi tiền tệ chỉ đổi đơn vị hiển thị, app không tự quy đổi tỷ giá, nên số tiền gốc của bạn vẫn giữ nguyên.

**English:** Go to Settings → Language & Currency, choose Vietnamese or English and choose to display VND or USD. Changing the currency only changes the displayed unit — the app does not convert exchange rates, so your original amounts stay exactly as they are.

## 14. Trạng thái "Không chốt" khác "Đã huỷ" thế nào?

**Tiếng Việt:** "Không chốt" dùng khi khách hỏi rồi không đặt chụp, còn "Đã huỷ" dùng khi job đã chốt rồi mới huỷ. Cả hai đều rời khỏi pipeline đang chạy nhưng vẫn lưu lại để bạn xem, và đều khôi phục được nếu khách quay lại.

**English:** "Not booked" is for enquiries that never became a shoot, while "Cancelled" is for a confirmed job that was later called off. Both leave the active pipeline but stay saved for reference, and both can be restored if the client comes back.

## 15. Xoá hẳn một job khỏi app được không?

**Tiếng Việt:** Được, nhưng khác với huỷ job: xoá hẳn sẽ mất luôn job đó, kể cả tiền và ghi chú đi kèm, và không khôi phục được. Nếu chỉ muốn tạm dừng job, hãy dùng "Đã huỷ" thay vì xoá, và tải bản sao lưu trước khi xoá.

**English:** Yes, but unlike cancelling, deleting removes the job completely — including its money and notes — and it cannot be restored. If you only want to pause a job, use "Cancelled" instead of deleting, and download a backup first.

## 16. Ảnh trang chủ đổi mỗi ngày là ảnh gì? Thêm ảnh của mình được không?

**Tiếng Việt:** Ảnh trang chủ là ảnh mẫu của app, tự đổi mỗi ngày để màn hình Hôm nay luôn mới. Bạn có thể thêm ảnh chụp của chính mình từ máy để thay ảnh mẫu, tối đa 60 ảnh, và ảnh bạn thêm chỉ nằm trên máy của bạn.

**English:** The home photo is a sample image from the app that changes daily so the Today screen always feels fresh. You can add your own photos from your device to replace the samples, up to 60 photos, and photos you add stay only on your device.

## 17. Tìm lại job cũ của một khách thì làm sao?

**Tiếng Việt:** Dùng ô tìm kiếm trên màn hình chính, gõ tên khách, loại job hoặc tháng chụp để lọc ra các job liên quan. Kết quả hiện cả job đang chạy lẫn job đã xong, đã huỷ, nên bạn tra lại lịch sử khách rất nhanh.

**English:** Use the search box on the home screen and type the client's name, the job type or the shoot month to filter matching jobs. Results include active, completed and cancelled jobs, so you can look up a client's history in seconds.

## 18. App có cần mạng không? Dữ liệu của tôi có lên máy chủ nào không?

**Tiếng Việt:** FotoBro chạy hoàn toàn trên máy của bạn: job, tiền, lịch và ảnh đều chỉ lưu local, không tài khoản, không máy chủ. Chỉ các tính năng Google (Lịch, Gmail, Drive) mới cần mạng, còn xem job, ghi tiền hay nhắc lịch thì không cần mạng vẫn dùng được.

**English:** FotoBro runs entirely on your device: jobs, money, calendar and photos are stored locally only, with no account and no server. Only the Google features (Calendar, Gmail, Drive) need internet — viewing jobs, recording money and reminders all work offline.

## 19. Lưu thông tin khách (số điện thoại, Facebook, ghi chú) ở đâu?

**Tiếng Việt:** Khi tạo job mới, điền tên khách, số điện thoại, link Facebook/Messenger và ghi chú ngay trong form job. Từ chi tiết job, bạn bấm thẳng vào số điện thoại hay link để gọi, nhắn Messenger hoặc gửi email cho khách mà không cần tìm lại trong Danh bạ.

**English:** When creating a new job, enter the client's name, phone number, Facebook/Messenger link and notes right in the job form. From the job details you can tap the phone number or link to call, message on Messenger or email the client without searching your Contacts.

## 20. Cập nhật app lên bản mới thì dữ liệu có mất không?

**Tiếng Việt:** Không. Cập nhật app qua App Store chỉ thay phần mềm, dữ liệu job, tiền và cài đặt trên máy vẫn giữ nguyên. Dù vậy, trước mỗi lần cập nhật lớn, cứ tải 1 bản sao lưu JSON cho chắc — mất 10 giây mà an toàn hơn nhiều.

**English:** No. Updating the app from the App Store only replaces the software — your jobs, money and settings on the device stay exactly as they are. Still, download one JSON backup before any major update, just in case — it takes 10 seconds and is much safer.

---

## Ghi chú cho agent code

- Hiển thị: cùng 1 màn danh sách với 10 câu trong `HELP-CENTER.md` (tổng 20 + 10 = 30 câu), chạm vào 1 câu thì mở rộng toàn bộ câu trả lời Việt + Anh.
- Ngôn ngữ: nếu người dùng chọn English trong Cài đặt thì hiện phần English trước, tiếng Việt sau; ngược lại hiện tiếng Việt trước.
- Nguồn dữ liệu: nội dung tĩnh trong file này, không gọi mạng, không cần đăng nhập.
- Kiểm chứng sau khi nối: mở 20 câu đều hiện đủ 2 ngôn ngữ; không câu nào trùng nội dung với 10 câu trong `HELP-CENTER.md`; màn hình iPhone SE không tràn chữ.
