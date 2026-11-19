# FotoBro — Đường leo thang vận hành (ESCALATION)

- Phạm vi: FotoBro iOS v1, Bundle ID `com.fotobro.app`, repo `Hoangviet1397/fotobro`.
- Nguyên tắc nền: app v1 local-first, dữ liệu chỉ nằm trên iPhone người dùng, không máy chủ, không tài khoản. Team không thể khôi phục dữ liệu hay mở khoá PIN từ xa.
- **Việt là người quyết cuối cho tiền, pháp lý và dữ liệu người dùng.** Không ai khác được tự quyết những việc này — kể cả khi gấp.
- Email hỗ trợ `support@fotobro.app` hiện là **placeholder — chưa có thật**, domain chưa mua. Cho tới khi mailbox thật hoạt động, kênh liên hệ chính là TestFlight và GitHub Issues của repo `fotobro` (xem `TRIAGE.md`).

## Mức 1 — Team tự xử

**Dấu hiệu nhận biết:**
- Câu hỏi dùng app: quên PIN, đổi máy, bảng giá áp cho job cũ không, CloudKit khi nào có.
- Hướng dẫn tính năng: tạo job, nhảy bước pipeline, xuất file sao lưu, nhập Lịch iPhone, đăng nhập Google.
- Góp ý, chê giao diện, xin tính năng mới (P3 trong `TRIAGE.md`).
- Ticket trùng, ticket thiếu thông tin.

**Ai xử lý:** Team hỗ trợ (1–2 người). Không cần báo Việt.

**Thời gian phản hồi:** Trả lời đầu tiên trong 24 giờ (góp ý: 48 giờ). Trả lời dứt điểm bằng Help Center / trang Hỗ trợ; câu hỏi lặp lại ≥ 3 lần thì bổ sung vào Help Center.

**Kênh liên hệ:** Trả lời ngay trên kênh ticket tới (TestFlight, GitHub Issues; email khi mailbox thật hoạt động). Mọi ticket ghi vào 1 danh sách chung.

**Không làm:** Không hứa ngày ra bản sửa, ngày có tính năng mới, hay giá Nấc 2/3. Không hứa khôi phục dữ liệu hay mở khoá PIN.

## Mức 2 — Báo Việt trong ngày

**Dấu hiệu nhận biết:**
- Lỗi mất dữ liệu: mở app mất hết job/sổ tiền, sao lưu/khôi phục báo lỗi, dữ liệu tiền tính sai.
- Lỗi thanh toán: thu phí Nấc 2/3 sai (khi đã có), người dùng bị trừ tiền nhưng không dùng được tính năng trả phí.
- App Store từ chối / hoãn phát hành: Apple yêu cầu sửa, bổ sung thông tin, hoặc từ chối bản nộp.
- Sự cố Google/Apple kéo dài: đăng nhập Google lỗi, Lịch/Gmail không đồng bộ, CloudKit lỗi quá 24 giờ.
- Lỗi diện rộng: nhiều người cùng báo 1 lỗi trong 1 ngày, app crash khi mở (P0 trong `TRIAGE.md`).

**Ai xử lý:** Team hỗ trợ xác nhận + ghi Issue GitHub, chuyển cho người làm app sửa; đồng thời **báo Việt trong ngày** (không chờ tới hôm sau). Việt nắm tình hình và quyết hướng xử lý với người dùng, team thực hiện.

**Thời gian phản hồi:** Trả lời đầu tiên cho người dùng trong 4 giờ làm việc (ngày thường); báo Việt ngay khi xác nhận lỗi thật, chậm nhất trong ngày. Có hướng xử lý tạm trong 24 giờ.

**Kênh liên hệ:**
- Báo Việt: nhắn trực tiếp cho Việt (kênh riêng team–Việt, không qua ticket công khai).
- Với người dùng: trả lời trên kênh ticket + đăng thông báo theo `INCIDENT-COMMS.md` (trong app, trang trạng thái; email chỉ khi nghiêm trọng và mailbox thật đã có).
- Kỹ thuật: Issue GitHub repo `fotobro`, gắn nhãn mức độ + tính năng (xem `TRIAGE.md` mục 4).

## Mức 3 — Việt quyết ngay

**Dấu hiệu nhận biết:**
- Đổi giá: đổi giá gói chụp, giá film, giá Nấc 2/3, đổi chính sách thu phí.
- Đổi tên: đổi tên app, đổi Bundle ID, đổi tên tính năng/phòng ban.
- Xoá dữ liệu người dùng: bất kỳ yêu cầu hay thao tác nào xoá dữ liệu của người dùng (kể cả theo yêu cầu của chính họ).
- Quyết định pháp lý / bảo mật: khiếu nại pháp lý, yêu cầu cung cấp dữ liệu, nghi lộ dữ liệu, thay đổi Điều khoản / Chính sách riêng tư, quyết định về quyền riêng tư.
- Bất kỳ việc gì chạm tới tiền, pháp lý, hay dữ liệu người dùng mà chưa có quyết định trước đó của Việt.

**Ai xử lý:** **Chỉ Việt quyết.** Team dừng lại, không tự xử, không hứa gì với người dùng, không thực hiện thao tác nào cho tới khi Việt chốt.

**Thời gian phản hồi:** Báo Việt **ngay lập tức** (không chờ cuối ngày). Trả lời người dùng chỉ để xác nhận đã nhận và đang chờ quyết định — không hứa kết quả hay thời hạn cụ thể trước khi Việt chốt.

**Kênh liên hệ:**
- Báo Việt: nhắn trực tiếp cho Việt, ghi rõ: việc gì, ai yêu cầu, ảnh hưởng tới ai, cần quyết trước khi nào.
- Với người dùng: trả lời ngắn trên kênh ticket ("Đã nhận yêu cầu, đang chờ quyết định, sẽ báo lại bạn"), không tiết lộ nội bộ.
- Sau khi Việt quyết: team thực hiện đúng quyết định đó, ghi lại quyết định + ngày giờ vào Issue/file liên quan.

## Quy tắc leo thang chung

1. **Chưa chắc mức nào → xếp cao hơn 1 bậc.** Thà báo Việt sớm còn hơn xử sai việc thuộc quyền Việt.
2. **Mức 2 leo lên Mức 3 ngay** khi việc đó chạm tới tiền, tên, xoá dữ liệu, hay pháp lý/bảo mật — dù ban đầu tưởng chỉ là lỗi kỹ thuật.
3. **Không tự hạ mức.** Chỉ Việt (Mức 3) hoặc người làm app sau khi xác minh (Mức 2 → Mức 1) mới được hạ mức, và phải ghi lý do.
4. **Ghi lại mọi lần leo thang:** ngày giờ, ai báo, báo cho Việt qua kênh nào, Việt quyết gì. Không xử lý bằng miệng rồi quên.

---

- File này thuộc batch FotoBro iOS v1, thư mục `batch-ops/`. Cập nhật khi: email hỗ trợ chính thức hoạt động, app lên App Store, hoặc có thêm kênh liên hệ mới.
- Tài liệu liên quan: `TRIAGE.md` (phân loại ticket P0–P3), `INCIDENT-COMMS.md` (mẫu thông báo sự cố), `STATUS-PAGE.md`.
