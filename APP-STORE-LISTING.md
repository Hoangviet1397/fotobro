# Hồ sơ App Store — FotoBro

> Bản nháp để Việt duyệt trước khi nhập vào App Store Connect.
> Mọi chữ tiếng Việt dưới đây đều đếm theo giới hạn ký tự của Apple.
> Ngày cập nhật: 20/11/2026 (v2.0 iOS). Nguồn app: FotoBro iOS v2.0 trong
> `~/workspace/fotobro-ios-v1/` (base web FotoBro v2.6). Repo GitHub
> `Hoangviet1397/fotobro` (đã tạo 19/11/2026, hiện chỉ có README — chưa push code).
> Bundle ID đã chốt: `com.fotobro.app` (đổi Bundle ID sau khi tạo app là không được,
> phải tạo app mới — nên tạo App ID với Bundle ID này).

## 1. Tên và nhận diện

| Mục | Nội dung | Giới hạn Apple |
|---|---|---|
| Tên app (App Name) | **FotoBro** | ≤ 30 ký tự (đang dùng 7) |
| Subtitle | **Trợ lý studio ảnh** | ≤ 30 ký tự — đếm: "Trợ lý studio ảnh" = **17 ký tự**, ĐẠT (13 ký tự dự phòng) |
| Bundle ID | `com.fotobro.app` | đã chốt 19/11/2026, dùng khi tạo App ID |
| SKU (mã nội bộ, tự đặt) | `fotobro-001` | chỉ hiện trong App Store Connect |
| Phiên bản đầu tiên | **2.0** (build 1) | MARKETING_VERSION trong Xcode đang là 2.0 ✅ |
| Ngôn ngữ chính | Tiếng Việt (Vietnamese) | app có tiếng Việt + tiếng Anh (chọn trong Cài đặt), tiền tệ VND/USD chỉ đổi hiển thị |

Tên hiển thị trên màn hình chính iPhone (CFBundleDisplayName) đang là
"FotoBro" — 7 ký tự, vừa màn hình chính, không cần tên ngắn.

## 2. Category — chọn 1 chính + 1 phụ

| | Category | Vì sao |
|---|---|---|
| **Chính** | **Business** | App quản lý job, thu chi, báo cáo ngày/tuần/tháng của một studio — bản chất là quản trị kinh doanh nhỏ. Người tìm app quản lý studio / freelancer sẽ thấy ở đây. |
| **Phụ** | **Photo & Video** | Đúng nghề (portrait / lookbook / wedding, ảnh trang chủ, Drive ảnh job) và là category nhiếp ảnh gia tự do có thể tìm thấy. |

**Không chọn Productivity làm chính:** Productivity quá chung (ghi chú,
to-do) và Apple hay xếp app "trợ lý cá nhân" vào đó, nhưng FotoBro
mạnh nhất ở quản lý tiền + pipeline job của studio — Business mô tả
đúng hơn và ít bị so với app ghi chú. Productivity có thể làm phụ thay
Photo & Video nếu Việt muốn nhấn "trợ lý" hơn "nhiếp ảnh" — quyết ở mục
"Việc cần Việt chốt" cuối file README.md.

## 3. Mô tả (Description — tiếng Việt, sẽ dán vào App Store Connect)

> FotoBro là công ty thu nhỏ trong túi của một nhiếp ảnh gia tự do.
>
> Bạn là Giám đốc. App là 6 phòng ban làm việc cho bạn: Sen đón khách,
> Nắng lo buổi chụp, Mây lo hậu kỳ, Lúa lo tiền bạc, Trăng lo kể chuyện
> và đăng bài, Đèn lo giữ đồ.
>
> MỞ APP LÀ THẤY HÔM NAY
> Hôm nay chụp ai, mấy giờ, ở đâu, thu bao nhiêu, giao ảnh cho ai —
> tất cả ở một màn hình. Mọi việc tối đa 3 chạm, 10 giây là xong.
>
> JOB ĐI THEO 8 BƯỚC RÕ RÀNG
> Từ khách hỏi, tư vấn, chốt lịch, chụp, hậu kỳ, giao ảnh tới thu tiền.
> Job nào đang ở bước nào nhìn là biết, không sót việc.
>
> TIỀN BẠC RÕ TỪNG KHOẢN
> Thu theo đợt, theo loại, phát sinh thêm; chi theo job, theo tháng,
> theo thiết bị. Báo cáo ngày, tuần, tháng tự tính sẵn.
>
> NHẮC TRƯỚC GIỜ CHỤP VÀ HẠN GIAO ẢNH
> Nhắc trước giờ chụp **12 tiếng** và trước hạn giao ảnh 1 ngày, để không
> trễ hẹn với khách.
>
> DỮ LIỆU CHỈ Ở TRÊN MÁY CỦA BẠN
> Không tài khoản, không máy chủ, không quảng cáo, không theo dõi.
> Job và sổ tiền chỉ lưu trên điện thoại của bạn. Muốn sao lưu thì xuất
> file JSON về máy, muốn xoá thì xoá trong Cài đặt là sạch.
>
> FotoBro làm cho nhiếp ảnh gia tự do — portrait, lookbook, wedding,
> couple, event. Điền tên và studio của bạn trong Cài đặt là app
> xưng hô, nhắn tin và báo cáo theo tên của bạn.

## 4. Keywords (100 ký tự, cách nhau bằng dấu phẩy, không khoảng trắng)

```
fotobro,foto bro,studio anh,chup anh,quan ly job,thu chi,nhac lich,chup cuoi,lookbook,portrait,event
```

Đếm: chuỗi trên = **100 ký tự** (kể cả dấu phẩy), ĐẠT = 100 (đúng giới hạn). Không nhồi tên
app khác, không dùng từ "miễn phí" nếu app không miễn phí (app này miễn
phí, không có mua trong app — xem mục 6).

## 5. Độ tuổi (Age Rating)

- **4+** — app không có nội dung người lớn, bạo lực, cờ bạc, chat với
  người lạ hay mua trong app. Khi khai questionnaire trong App Store
  Connect: trả lời "Không" cho mọi mục nội dung nhạy cảm.
- Lưu ý: app có link mở Facebook / Messenger / Gmail / Drive ngoài —
  khai đúng ở mục "Unrestricted web access" là **không** (app không có
  trình duyệt web mở tuỳ ý; chỉ mở link do người dùng bấm).

## 6. Giá và mua trong app

- **Miễn phí, không có In-App Purchase, không có quảng cáo.**
- Khai trong App Store Connect: Price = Free (0đ), không tạo IAP nào.
- Privacy Nutrition Labels (khai trong App Store Connect, khớp với
  PRIVACY.md): **"Data Not Collected"** — không thu thập dữ liệu nào
  (dữ liệu job/tiền chỉ ở trên máy, Apple tính là không thu thập).
  Nếu giữ Google ở bản sau thì phải khai lại: dữ liệu Google (lịch,
  mail) chỉ đọc trên máy theo quyền người dùng — xem RISKS.md mục 1.

## 7. Screenshots cần chụp (khi có bản TestFlight chạy được)

Apple yêu cầu ít nhất 1 bộ. Chuẩn bị 2 bộ iPhone (bộ 6.7" là bắt buộc
cho iPhone mới; 6.5" cho máy cũ). iPad: **không bắt buộc** — app chỉ
làm cho iPhone (portrait), khai iPad là không hỗ trợ thì khỏi chụp
iPad; nếu muốn cho chạy trên iPad thì phải chụp thêm bộ iPad 12.9".

| Bộ | Kích thước | Máy chụp |
|---|---|---|
| 6.7" (bắt buộc) | 1290 × 2796 | iPhone 14/15/16 Pro Max |
| 6.5" | 1242 × 2688 | iPhone 11 Pro Max / XS Max |
| iPad 12.9" (nếu hỗ trợ) | 2048 × 2732 | iPad Pro 12.9" |

Tối đa 10 ảnh / bộ, tối thiểu 1 ảnh / bộ (nên làm 5–6 ảnh, xem mục 8).
Chụp bằng iPhone thật qua TestFlight (không chụp từ trình duyệt máy
tính — màu và chữ sẽ khác). Trước khi chụp: nhập dữ liệu mẫu đẹp
(job thật đã xong + 2–3 job sắp tới), đặt ảnh trang chủ đẹp, tắt thông
báo lạ.

## 8. 6 màn hình nên chụp (theo thứ tự lên App Store)

1. **Màn hình Hôm nay** — có lịch chụp hôm nay + tiền hôm nay + ảnh
   trang chủ đẹp. Đây là ảnh đầu tiên người ta thấy.
2. **Pipeline job 8 giai đoạn** — 1 job đang ở giữa pipeline, thấy rõ
   các bước đã xong / đang làm.
3. **Sổ tiền / báo cáo** — báo cáo ngày hoặc tuần, thu–chi rõ ràng.
4. **Đăng nhập Google 1 chạm** — màn hình Cài đặt → Kết nối Google (chỉ
   chụp khi đã có Client ID; ở v2.0 Google chưa sẵn sàng thì thay bằng màn
   Hôm nay ở dark mode).
5. **Thêm job mới** — form thêm job gọn, thấy các trường khách / loại
   chụp / ngày giờ / giá.
6. **Cài đặt / Cá nhân hoá** — 3 màu chủ đề, logo studio, ngôn ngữ
   VI/EN, tiền tệ VND/USD; kèm màn hình khoá Face ID + PIN (chứng minh app
   riêng tư, dữ liệu ở trên máy).

## 9. App Preview video (tùy chọn, nên làm sau)

- 15–30 giây, quay màn hình iPhone thật: mở app → hôm nay có gì →
  thêm job → job hiện trong pipeline → xem báo cáo. (Không quay giọng nói —
  mic dời v2.1.)
- Không bắt buộc cho lần gửi đầu; làm sau khi app đã lên TestFlight ổn.

## 10. Thông tin hỗ trợ (Support URL / Marketing URL)

- **Support URL:** dùng repo GitHub `https://github.com/Hoangviet1397/fotobro`
  (README có hướng dẫn) — hoặc trang trong PRIVACY.md. **Cần Việt chốt:**
  có muốn để link GitHub công khai làm Support URL không, hay dùng một
  email hỗ trợ.
- **Privacy Policy URL:** xem PRIVACY.md — đề xuất
  `https://hoangviet1397.github.io/fotobro/PRIVACY.html` sau khi thêm
  file vào repo. **Chưa có URL thật — phải host xong mới tạo app trong
  App Store Connect được.**
- **Marketing URL:** để trống ở v2.0 (không bắt buộc).
