# Mẫu thông báo sự cố — FotoBro iOS v1

> Dùng khi có sự cố ảnh hưởng người dùng. Mục đích: nói rõ chuyện gì đang xảy ra, người dùng cần làm gì, và khi nào có tin mới.
> Lưu ý: email hỗ trợ `support@fotobro.app` hiện là placeholder — chưa có thật, chưa mua domain. Đừng gửi email từ địa chỉ này cho tới khi email thật được tạo. Trước lúc đó, kênh chính là trong app + trang trạng thái.

## Nguyên tắc (áp dụng cho mọi mẫu)

1. **Nói thật, không giấu.** Nói rõ lỗi gì, ảnh hưởng tới ai, tới mức nào.
2. **Không hứa giờ khắc phục nếu chưa chắc.** Chỉ hứa "cập nhật tiếp theo lúc…" khi đã biết chắc sẽ có thông tin mới vào lúc đó.
3. **Dữ liệu local-first là an toàn.** Nhắc người dùng rằng dữ liệu trên máy họ vẫn còn nguyên (Nấc 1), trừ khi có bằng chứng ngược lại.
4. **Một sự cố, một thông báo duy nhất.** Cập nhật thêm bằng cách sửa/bổ sung cùng một bài, không đăng bài mới chồng lên.
5. **Ngắn gọn.** Người dùng đọc trên điện thoại: tiêu đề 1 dòng, nội dung tối đa 5–7 dòng mỗi ngôn ngữ.

## Kênh đăng

| Kênh | Khi nào dùng | Ghi chú |
|---|---|---|
| Trong app (banner / màn hình Hôm nay) | Mọi sự cố ảnh hưởng tới dùng app | Kênh nhanh nhất, tới đúng người đang bị ảnh hưởng |
| Trang trạng thái | Mọi sự cố từ mức trung bình trở lên | Link trạng thái đặt trong app (Cài đặt → Trạng thái dịch vụ) |
| Email | Sự cố nghiêm trọng (mất dữ liệu, lộ dữ liệu, lỗi kéo dài > 24h) | Chỉ gửi khi email hỗ trợ thật đã có; không spam, 1 email/sự cố + 1 email khi khắc phục xong |

---

## Mẫu 1 — Google đăng nhập / đồng bộ lỗi

**Tiêu đề:**
- VI: Đăng nhập Google đang gặp lỗi — dữ liệu trên máy của bạn vẫn an toàn
- EN: Google sign-in is having issues — your on-device data is safe

**Nội dung:**
- VI: Đăng nhập Google và đồng bộ Lịch/Gmail hiện không hoạt động. Lỗi nằm ở phía kết nối Google, không phải do dữ liệu của bạn. Mọi job, sổ tiền và nhắc lịch đã lưu trên máy vẫn đầy đủ và dùng bình thường.
- EN: Google sign-in and Calendar/Gmail sync are currently not working. The problem is with the Google connection, not your data. All jobs, money records and reminders saved on your device are intact and work normally.

**Người dùng cần làm gì:**
- VI: Không cần làm gì. Đừng xoá app hay đăng xuất — đăng xuất có thể làm mất dữ liệu chưa đồng bộ. Cứ dùng app như bình thường, tính năng Google sẽ tự hoạt động lại khi lỗi được sửa.
- EN: No action needed. Do not delete the app or sign out — signing out may lose unsynced data. Keep using the app normally; Google features will resume automatically once fixed.

**Khi nào cập nhật tiếp theo:** Trong vòng 4 giờ, hoặc ngay khi có thay đổi (ghi rõ giờ cụ thể khi đăng, ví dụ "cập nhật tiếp theo trước 18:00 hôm nay").

---

## Mẫu 2 — TestFlight bản mới lỗi, phải quay về bản cũ

**Tiêu đề:**
- VI: Bản thử nghiệm mới gặp lỗi — chúng tôi đã quay về bản ổn định trước đó
- EN: The latest beta build has a bug — we've rolled back to the previous stable build

**Nội dung:**
- VI: Bản TestFlight mới (ghi rõ số bản, ví dụ 1.0.0 build 12) gặp lỗi [mô tả ngắn, ví dụ: mở app là văng / không lưu được job mới]. Chúng tôi đã gỡ bản lỗi và quay về bản ổn định trước đó (build 11). Dữ liệu của bạn không bị mất.
- EN: The latest TestFlight build (state the build number, e.g. 1.0.0 build 12) has a bug [short description, e.g. the app crashes on launch / new jobs cannot be saved]. We've removed the faulty build and rolled back to the previous stable build (build 11). Your data was not lost.

**Người dùng cần làm gì:**
- VI: Mở TestFlight và cập nhật về bản ổn định (build 11). Nếu app vẫn lỗi sau khi cập nhật, khởi động lại máy rồi mở lại app. Vẫn lỗi thì báo cho chúng tôi qua TestFlight (gửi phản hồi kèm ảnh chụp màn hình nếu được).
- EN: Open TestFlight and update to the stable build (build 11). If the app still misbehaves after updating, restart your phone and reopen the app. If it still fails, report it via TestFlight (send feedback with a screenshot if possible).

**Khi nào cập nhật tiếp theo:** Khi bản sửa lỗi mới lên TestFlight (ghi rõ dự kiến nếu đã chắc, ví dụ "bản sửa dự kiến trong ngày mai"), hoặc trong vòng 24 giờ nếu chưa có bản sửa.

---

## Mẫu 3 — CloudKit đồng bộ lỗi (Nấc 2)

**Tiêu đề:**
- VI: Đồng bộ iCloud (CloudKit) đang lỗi — dữ liệu trên máy vẫn nguyên vẹn
- EN: iCloud (CloudKit) sync is failing — your on-device data is intact

**Nội dung:**
- VI: Đồng bộ giữa các thiết bị qua iCloud hiện không hoạt động [mô tả ngắn: ví dụ không đẩy được thay đổi mới lên iCloud / thiết bị khác chưa thấy job mới]. Dữ liệu trên từng máy vẫn đầy đủ và không bị mất — chỉ là các máy chưa đồng bộ với nhau lúc này.
- EN: Sync between devices via iCloud is currently not working [short description: e.g. new changes are not uploading to iCloud / other devices don't see new jobs yet]. Data on each device is complete and not lost — devices just aren't syncing with each other right now.

**Người dùng cần làm gì:**
- VI: Tiếp tục dùng app trên máy chính như bình thường. Đừng xoá app trên bất kỳ máy nào, và đừng tắt iCloud cho FotoBro — làm vậy có thể gây trùng hoặc mất dữ liệu khi đồng bộ chạy lại. Khi đồng bộ hoạt động trở lại, các máy sẽ tự khớp dữ liệu.
- EN: Keep using the app on your main device as normal. Do not delete the app on any device, and do not turn off iCloud for FotoBro — that can cause duplicates or data loss when sync resumes. Devices will reconcile automatically once sync is back.

**Khi nào cập nhật tiếp theo:** Trong vòng 6 giờ, hoặc ngay khi đồng bộ hoạt động trở lại. Nếu lỗi kéo dài quá 24 giờ, đăng thêm hướng dẫn sao lưu thủ công (xuất JSON) để người dùng tự giữ bản sao an toàn.

---

## Mẫu 4 — App Store Connect / bản phát hành bị hoãn

**Tiêu đề:**
- VI: Bản phát hành mới bị hoãn — app hiện tại vẫn dùng bình thường
- EN: The new release is delayed — the current app still works normally

**Nội dung:**
- VI: Bản [số phiên bản, ví dụ 1.1.0] dự kiến phát hành ngày [ngày] đã bị hoãn vì [lý do thật, ngắn gọn: ví dụ Apple yêu cầu bổ sung thông tin xét duyệt / phát hiện lỗi cuối trước khi nộp]. App bạn đang dùng không bị ảnh hưởng gì.
- EN: Version [e.g. 1.1.0], planned for release on [date], has been delayed because [honest short reason: e.g. Apple asked for extra review information / a last-minute bug was found before submission]. The app you're using is unaffected.

**Người dùng cần làm gì:**
- VI: Không cần làm gì. Cứ dùng bản hiện tại như bình thường. Tính năng mới trong bản hoãn sẽ có ngay khi bản đó được duyệt và phát hành.
- EN: No action needed. Keep using the current version as normal. The new features in the delayed release will arrive as soon as it is approved and released.

**Khi nào cập nhật tiếp theo:** Khi có ngày phát hành mới chắc chắn, hoặc trong vòng 48 giờ kể từ thông báo này (ghi rõ ngày giờ cụ thể khi đăng).

---

## Checklist trước khi đăng (dùng cho mọi mẫu)

- [ ] Đã ghi đúng số phiên bản / số build bị ảnh hưởng
- [ ] Đã nói rõ dữ liệu người dùng có an toàn không (và bằng chứng nếu có)
- [ ] Không hứa giờ khắc phục khi chưa chắc chắn
- [ ] Đã điền giờ cập nhật tiếp theo cụ thể (ngày + giờ, múi giờ Việt Nam)
- [ ] Bản tiếng Anh đã được kiểm tra lại, không dịch máy ẩu
- [ ] Đã đăng cùng lúc trên các kênh đã chọn (trong app + trang trạng thái; email chỉ khi nghiêm trọng)
- [ ] Khi khắc phục xong: đăng bản "Đã khắc phục" trên cùng các kênh, ghi rõ giờ khắc phục và xin lỗi ngắn gọn (1 câu)
