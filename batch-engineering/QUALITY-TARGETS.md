# FotoBro iOS v1 — Chỉ tiêu chất lượng (Quality Targets)

- App: FotoBro, Bundle ID `com.fotobro.app` (Capacitor 8, local-first — Nấc 1)
- Phạm vi: bản v1 gửi TestFlight nội bộ và nộp App Store. Không áp cho Nấc 2 (CloudKit) / Nấc 3 (nhóm/studio) — hai nấc đó có chỉ tiêu riêng khi làm.
- Ngày ban hành: 20/11/2026 — Trạng thái: **bản nháp để đo lần đầu, chưa có số đo thật nào**.
- Nguồn số liệu nền: `PERFORMANCE.md` (www ~492 KB, `index.html` ~330 KB, localStorage `troLyXeo.v1` ~5 MB, tối đa 60 ảnh trang chủ) và `TESTFLIGHT-CHECKLIST.md` (quy trình test trên iPhone thật). Mọi con số "ước tính" trong `PERFORMANCE.md` đều **chưa đo** — file này quy định ngưỡng phải đạt và cách đo, không lấy ước tính làm kết quả.

## 1. Bảng chỉ tiêu — ngưỡng đạt của v1

| # | Chỉ tiêu | Ngưỡng đạt (v1) | Không đạt khi |
|---|---|---|---|
| Q1 | Tỉ lệ phiên không crash (crash-free sessions) | **≥ 99,5%** phiên không crash trong 7 ngày TestFlight; mục tiêu phấn đấu ≥ 99,8% | < 99,5%, hoặc có 1 crash lặp lại được ở thao tác chính (mở app, tạo job, chuyển bước, ghi tiền) |
| Q2 | Thời gian mở app (cold start tới màn Hôm nay dùng được) | iPhone đời mới: **≤ 1,5 giây**; iPhone cũ (SE 2 / iPhone 8 trở lên): **≤ 2,5 giây** | Vượt ngưỡng trên 1 trong 2 loại máy, hoặc màn trắng / đứng > 3 giây |
| Q3 | Thời gian thao tác chính | **Mỗi thao tác ≤ 10 giây** từ lúc chạm tới lúc xong (quy tắc UX của app: mọi việc 10 giây, tối đa 3 chạm); mục tiêu thường gặp ≤ 5 giây | Bất kỳ thao tác nào trong bảng §3 vượt 10 giây |
| Q4 | Dung lượng | Tải về từ TestFlight/App Store **≤ 50 MB**; dung lượng chiếm trên máy sau cài **≤ 100 MB**; thư mục `www/` trong gói **≤ 1 MB** | Vượt 1 trong 3 mức; hoặc dữ liệu người dùng phình không kiểm soát (xem §4) |
| Q5 | Tỉ lệ test đạt | **≥ 95%** số ca áp dụng được trong `TESTFLIGHT-CHECKLIST.md` đạt ✅; **0 lỗi mức Chặn**, **0 lỗi mức Nặng** còn mở | < 95%, hoặc còn 1 lỗi Chặn/Nặng chưa sửa |

**Cổng phát hành (release gate):** cả 5 chỉ tiêu Q1–Q5 phải đạt cùng lúc mới được nộp App Store. Chỉ 1 chỉ tiêu không đạt là dừng, sửa rồi đo lại từ đầu chỉ tiêu đó (không "châm chước" bằng cách hạ ngưỡng — muốn đổi ngưỡng phải ghi lý do vào §6 và được Việt duyệt).

**Điều kiện đo chuẩn:** đo trên **iPhone thật qua TestFlight** (không đo trên giả lập, không đo bản web GitHub Pages). Tối thiểu 2 máy: 1 máy đời mới (iPhone 13 trở lên) + 1 máy cũ (iPhone SE 2 / iPhone 8, iOS mới nhất máy đó chạy được). Ghi rõ vào biên bản đo: tên máy, iOS, số build TestFlight, ngày đo, người đo.

## 2. Q1 — Tỉ lệ không crash: cách đo

**Định nghĩa:** crash-free sessions = (số phiên mở app không crash / tổng số phiên) × 100%. Một "phiên" là 1 lần mở app từ lúc chạm icon tới lúc đóng/vuốt khỏi đa nhiệm. Crash do iOS giết app vì hết RAM khi app chạy nền lâu vẫn tính là crash nếu App Store Connect ghi nhận.

**Cách đo (TestFlight + App Store Connect):**
1. Cài bản TestFlight lên cả 2 máy test, dùng bình thường theo `TESTFLIGHT-CHECKLIST.md` ít nhất **3 ngày**, tối thiểu **100 phiên** cộng dồn (mỗi người mở app ~15–20 lần/ngày là đủ).
2. Trên máy tính, vào App Store Connect → TestFlight → build đang test → **Crashes** (hoặc Xcode → Window → Organizer → Crashes). Ghi: tổng phiên, số crash, tỉ lệ crash-free, danh sách crash theo nhóm (stack trace giống nhau gộp thành 1 nhóm).
3. Song song, người test ghi tay vào nhật ký: mỗi lần app tự tắt/văng ra màn hình chính thì ghi giờ, đang làm gì, có mất dữ liệu không. Đối chiếu nhật ký tay với số liệu App Store Connect — nếu nhật ký có crash mà hệ thống không ghi, ưu tiên nhật ký tay (crash chưa kịp gửi báo cáo).

**Ngưỡng chi tiết:**
- Đạt: ≥ 99,5% và không có nhóm crash nào lặp lại ≥ 2 lần.
- Không đạt: < 99,5%, hoặc 1 nhóm crash lặp lại ≥ 2 lần ở thao tác chính, hoặc bất kỳ crash nào làm **mất dữ liệu** (job/tiền đã lưu biến mất) — mất dữ liệu là lỗi Chặn, không cần đợi đủ 100 phiên.

**Lưu ý:** TestFlight nội bộ ít người nên 100 phiên là mẫu nhỏ — 1 crash đã là 1%. Vì vậy ngoài tỉ lệ %, bắt buộc kèm điều kiện "không crash lặp lại" ở trên. Khi lên App Store thật, đo lại sau 7 ngày với mẫu lớn hơn và giữ nguyên ngưỡng 99,5%.

## 3. Q3 — Thời gian thao tác chính: bảng thao tác + cách đo

Mọi thao tác đo **từ lúc chạm nút bắt đầu tới lúc màn hình hiện kết quả cuối cùng** (đã lưu xong, không còn spinner). Dùng đồng hồ bấm giờ trên điện thoại khác hoặc quay video màn hình rồi đếm giây — không ước lượng bằng cảm giác. Mỗi thao tác đo **3 lần** trên mỗi máy, lấy lần chậm nhất làm kết quả.

| Thao tác (ca test tương ứng) | Ngưỡng v1 | Mục tiêu thường gặp |
|---|---|---|
| Mở app lạnh tới màn Hôm nay dùng được (Q2, đo riêng ở §2b) | ≤ 1,5 s máy mới / ≤ 2,5 s máy cũ | ≤ 1 s / ≤ 2 s |
| Tạo 1 job mới: chạm + Thêm job → điền tên/loại/ngày → Lưu (ca 1.1) | ≤ 10 s | ≤ 5 s |
| Chuyển 1 bước pipeline / nhảy thẳng tới bước bất kỳ (ca 2.1–2.2) | ≤ 10 s | ≤ 3 s |
| Ghi cọc ở bước Chốt cọc (ca 3.1) | ≤ 10 s | ≤ 5 s |
| Ghi thu nốt ở bước Đã giao, còn thiếu về 0 (ca 3.3–3.4) | ≤ 10 s | ≤ 5 s |
| Ghi 1 khoản chi + xem báo cáo ngày/tuần/tháng (ca 3.6–3.7) | ≤ 10 s | ≤ 5 s |
| Nhập từ Lịch iPhone: chạm 1 lần → sự kiện 30 ngày thành buổi chụp (ca 4.3) | ≤ 10 s | ≤ 5 s |
| Thêm job vào Lịch iPhone (ca 5.1) | ≤ 10 s | ≤ 5 s |
| Đăng nhập Google 1 chạm: chạm → quay lại app đã kết nối (ca 6.1–6.2, có điều kiện) | ≤ 10 s **không tính thời gian người dùng gõ mật khẩu Google** | ≤ 5 s (phần trong app) |
| Đổi màu chủ đề / ngôn ngữ / tiền tệ (ca 7.1, 7.6–7.7) | ≤ 10 s | ≤ 3 s |
| Mở khoá bằng Face ID / PIN (ca 8.2–8.3) | ≤ 10 s | ≤ 3 s |
| Tải bản sao lưu JSON (ca 9.1) / khôi phục từ file (ca 9.3) | ≤ 10 s | ≤ 5 s |
| Mở app khi mất mạng (chế độ máy bay), mở job + ghi tiền (ca 11.4) | ≤ 10 s, không treo chờ mạng | ≤ 5 s |

**Cách đo thao tác:**
1. Chuẩn bị sẵn dữ liệu test (job "Test Portrait", khoản thu/chi mẫu) để thời gian gõ không làm lệch phép đo; ghi rõ trong biên bản nếu lần đo nào gõ chậm do người đo.
2. Bấm giờ từ lúc chạm tới lúc kết quả hiện xong. Đo 3 lần/máy, ghi cả 3 lần, kết luận bằng lần chậm nhất.
3. Đo thêm 1 lần ở **điều kiện nặng**: sổ có ~50 job test + 60 ảnh trang chủ (giới hạn tối đa của v1) — vì `PERFORMANCE.md` cảnh báo `renderAll()` + `saveLocal()` toàn bộ mỗi lần đổi và tạo object URL cho cả 60 ảnh lúc mở app có thể làm chậm khi dữ liệu nhiều. Nếu thao tác ở sổ nặng vượt 10 s trong khi sổ nhẹ đạt, ghi là **không đạt có điều kiện** và sửa theo `PERFORMANCE.md` §5.1–5.2 trước khi nộp.

### 2b. Q2 — Thời gian mở app: cách đo chi tiết

1. **Cold start:** vuốt app khỏi đa nhiệm (đóng hẳn) → bấm giờ từ lúc chạm icon tới lúc màn Hôm nay hiện đủ nội dung và chạm được vào 1 job. Đo 5 lần/máy, lấy trung vị (lần ở giữa sau khi xếp theo thứ tự), đồng thời ghi lần chậm nhất.
2. **Warm start:** mở app khi nó còn chạy nền → phải ≤ 1 giây trên cả 2 máy (chỉ hiện lại màn hình, không tải lại).
3. Ghi thêm: có màn trắng không, màn trắng kéo dài bao lâu (ngưỡng: màn trắng > 1 giây là ghi chú bắt buộc, > 3 giây là không đạt).
4. Không dùng số đo trên giả lập Xcode hay bản web để kết luận — chỉ số trên iPhone thật qua TestFlight mới tính.

## 4. Q4 — Giới hạn dung lượng: các mức + cách đo

| Hạng mục | Giới hạn v1 | Cách đo |
|---|---|---|
| Gói tải về (TestFlight / App Store) | ≤ 50 MB | App Store Connect → build → App Store File Sizes (xem cột Download Size, máy iPhone); hoặc TestFlight trên iPhone hiện dung lượng lúc tải |
| Dung lượng chiếm trên máy sau cài | ≤ 100 MB | iPhone → Cài đặt → Cài đặt chung → Dung lượng iPhone → FotoBro (ghi cả "Kích thước App" và "Tài liệu & Dữ liệu") |
| Thư mục `www/` trong gói (code + tài nguyên web) | ≤ 1 MB | Trên máy build: `du -sh` thư mục `www/` trước khi `npx cap sync ios`. Nền hiện tại ~492 KB (`PERFORMANCE.md`) — còn dư địa nhưng không được nhúng thêm ảnh mẫu base64 (bản v2.6 cũ nặng 716 KB chỉ vì 6 ảnh mẫu là bài học) |
| Dữ liệu người dùng: JSON `troLyXeo.v1` (localStorage) | < 4 MB cảnh báo, **5 MB là giới hạn cứng** (vượt là `setItem` throw, có thể mất bản ghi) | Không đo trực tiếp trên iPhone được — đo gián tiếp: xuất file sao lưu JSON (`fotobro-sao-luu.json`, ca 9.1) rồi xem kích thước file trong Files; file này ≈ kích thước JSON trong localStorage. Nếu ≥ 4 MB thì cảnh báo user sao lưu + dọn dữ liệu cũ (theo `PERFORMANCE.md` §5.5) |
| Ảnh trang chủ (IndexedDB, tối đa 60 ảnh) | ≤ 30 MB cộng dồn (60 ảnh × ~500 KB sau thu nhỏ) | Cài đặt iPhone → Dung lượng iPhone → FotoBro → "Tài liệu & Dữ liệu" trừ đi kích thước file sao lưu JSON. Nếu 1 ảnh sau thu nhỏ vẫn > ~500 KB thì nén mạnh tay hơn (`PERFORMANCE.md` §5.4) |
| File test `test-fotobro-v1.js` (16 KB) | **Không có trong gói gửi Apple** | Kiểm tra trước khi build: file chỉ ở ngoài gói, không nằm trong `www/` |

**Khi nào đo:** đo Q4 mỗi lần có build TestFlight mới (vì chỉ cần 1 ảnh/logo nhúng thêm là dung lượng nhảy). Ghi 6 số trên vào biên bản đo của build đó.

## 5. Q5 — Tỉ lệ test đạt: cách đo

1. Chạy toàn bộ `TESTFLIGHT-CHECKLIST.md` trên iPhone thật qua TestFlight, đúng quy ước ✅ / ❌ / ⏭️ trong file đó. Dữ liệu test là hư cấu, không dùng job/tiền thật.
2. Tính: **tỉ lệ đạt = số ca ✅ / (tổng số ca − số ca ⏭️ BỎ QUA)**. Ca ⏭️ chỉ được dùng cho các ca checklist đã ghi rõ "có điều kiện" (Google chưa có Client ID, mic dời sang v1.1, CloudKit placeholder) — không được ghi ⏭️ cho ca làm không được để né tỉ lệ.
3. Mọi ca ❌ bắt buộc có 1 dòng trong bảng lỗi cuối checklist (ghi đúng chữ app hiện + các bước làm lại được + ảnh chụp màn hình) và xếp mức **Chặn / Nặng / Nhẹ** theo định nghĩa trong file đó.
4. Ngưỡng: **≥ 95%** và **0 Chặn, 0 Nặng còn mở**. Lỗi Nhẹ được phép còn tối đa 5 lỗi, nhưng phải liệt kê hết và hẹn bản sửa (v1.0.1), không giấu.
5. Tổng kết ghi vào cuối checklist: tổng ca, ✅ / ❌ / ⏭️, kết luận (đủ nộp / cần sửa lỗi chặn / cần build mới test lại), người test ký tên.

## 6. Biên bản đo + nhật ký thay đổi ngưỡng

Mỗi lần đo lập 1 biên bản ngắn (1 trang, lưu cùng thư mục này với tên `MEASURE-<build>-<ngày>.md`):

- Build TestFlight, máy + iOS, ngày đo, người đo.
- Kết quả Q1–Q5: số đo thật + đạt/không đạt từng chỉ tiêu.
- Lỗi gặp (link tới bảng lỗi trong checklist), quyết định: nộp / sửa rồi đo lại.

**Nhật ký thay đổi ngưỡng (ghi tại đây khi đổi):**

| Ngày | Chỉ tiêu | Đổi từ → thành | Lý do | Người duyệt |
|---|---|---|---|---|
| 20/11/2026 | — | — | Ban hành lần đầu, chưa có số đo thật | — |

**Việc chưa làm / cần quyết:**
- Chưa có số đo thật nào cho Q1–Q4 (chưa có build TestFlight) — mọi ngưỡng trên là mục tiêu, không phải kết quả.
- Chưa chốt máy cũ cụ thể để đo Q2 (đề xuất iPhone SE 2; nếu không có máy, ghi rõ và chỉ đo trên máy đời mới + ghi chú "chưa đo máy cũ").
- Ngưỡng Q1 (99,5%) đặt cho mẫu TestFlight nhỏ (≥ 100 phiên); khi lên App Store với mẫu lớn, xem lại sau 7 ngày đầu.
