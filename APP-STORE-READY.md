# FotoBro v1 — Sẵn sàng App Store (bản rà soát)

> **Trạng thái:** Bản nháp để Việt duyệt trước khi nhập vào App Store Connect.
> **Ngày rà soát:** 20/11/2026. **Phạm vi:** app iOS v1 trong `~/workspace/fotobro-ios-v1/`
> (Capacitor 8, Bundle ID `com.fotobro.app`), base web FotoBro v2.6 đã kiểm chứng.
> **Repo mới:** `Hoangviet1397/fotobro` (public, nhánh `main`, mới chỉ có README).
> **Không nộp app, không tạo tài khoản, không mua gì trong file này.**
>
> Nguồn đã đọc: `APP-STORE-LISTING.md`, `PRIVACY.md`, `README.md`,
> `BUILD-GUIDE.md`, `capacitor.config.ts`, `package.json`, `www/index.html`
> (bản v1 đang làm dở: đã 0 lần `E.L.F.` / `Super Junior`, 336 KB sau khi bỏ
> ảnh mẫu base64). File này **không sửa** các file đó — chỉ rà lại và chốt
> lại những gì cần nhập vào App Store Connect.

---

## 1. Những quyết định đã chốt (không hỏi lại)

| Mục | Đã chốt |
|---|---|
| Tên app | **FotoBro** (Foto + Bro) |
| Bundle ID | `com.fotobro.app` — đổi sau khi tạo App ID là không được, phải tạo app mới |
| Repo | `Hoangviet1397/fotobro` — repo `tro-ly-xeo` của Xèo không đụng vào |
| Phiên bản đầu tiên | **1.0 (build 1)** — không lấy số 2.6/2.7 của bản web |
| Mô hình dữ liệu | Local-first, Nấc 1 miễn phí, không tài khoản, không máy chủ riêng |
| Nấc 2/3 | CloudKit làm chính, có thu phí — **chỉ placeholder ở v1, chưa bật IAP thật, chưa chốt giá** |
| Google | Đăng nhập **1 chạm, auto toàn bộ** (không dán Client ID, không tự tạo Google Cloud project). Client ID chung + xác minh Google là việc làm 1 lần phía Google Cloud, còn chờ |
| Lịch iPhone | Nhập 1 chạm từ Lịch iPhone qua EventKit trong app native (bản web vẫn phải dùng file .ics — Apple chặn trình duyệt) |
| Tối giản | Bỏ hẳn E.L.F. / Super Junior, bỏ 6 ảnh mẫu + job mẫu của Xèo |
| Cá nhân hoá v1 | (1) Màu chủ đề 3 preset, (2) logo studio, (3) sửa mẫu tin nhắn/email + khôi phục gốc, (4) ngôn ngữ Việt/Anh + tiền tệ VND/USD (chỉ đổi hiển thị, không quy đổi tỷ giá) |
| Pipeline v1 | Giữ nguyên 8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong; thêm (1) nhảy thẳng tới bước bất kỳ, (2) gắn tiền vào bước, (3) Huỷ/Không chốt + khôi phục, (4) job kẹt thì báo lên Hôm nay |
| UX/UI v1 | Chuyên nghiệp, tối giản kiểu Apple Music: Large Title, SF Pro, nền trắng sạch + dark mode đen, 1 màu nhấn, thẻ bo góc lớn, tab bar mờ, bỏ phong cách vintage kem/hồng phấn cũ |
| Giọng nói v1 | Thử sửa plugin speech-recognition (thiếu Package.swift) tối đa 2 lần; không được thì **dời mic sang v1.1** — xem §12, mục "Nếu mic dời v1.1" |

---

## 2. Sửa lại những chỗ hồ sơ cũ đã sai / đã cũ

Rà ngày 20/11/2026, các điểm sau trong `APP-STORE-LISTING.md` /
`PRIVACY.md` / `README.md` / `BUILD-GUIDE.md` **không còn đúng** — dùng
bảng này làm chuẩn, đừng copy nguyên hồ sơ cũ vào App Store Connect:

| # | Hồ sơ cũ ghi | Thực tế / chốt mới |
|---|---|---|
| 1 | Subtitle "27/30 ký tự" (README) / "18 ký tự" (APP-STORE-LISTING) | **"Trợ lý studio ảnh" = 17 ký tự** (đếm lại 20/11/2026), còn dư 13 ký tự, vẫn ĐẠT ≤ 30 |
| 2 | Keywords "92/100" (README) | Chuỗi trong APP-STORE-LISTING = **94/100 ký tự**, ĐẠT. Đề xuất lấp đủ 100 ở §5 |
| 3 | Repo `Hoangviet1397/tro-ly-xeo`, SKU `tro-ly-xeo-001` | Repo mới **`Hoangviet1397/fotobro`**, SKU mới **`fotobro-001`** |
| 4 | Support URL trỏ repo `tro-ly-xeo`, Privacy Policy URL trỏ `hoangviet1397.github.io/tro-ly-xeo/PRIVACY.html` | Support URL tạm: `https://github.com/Hoangviet1397/fotobro`. Privacy Policy URL đề xuất: `https://hoangviet1397.github.io/fotobro/PRIVACY.html` — **chưa host, chưa có URL thật** (xem §7) |
| 5 | Ngôn ngữ chính: "app chỉ có tiếng Việt" | v1 có chọn ngôn ngữ **Việt/Anh** trong Cài đặt (đang làm). Ngôn ngữ chính trong App Store Connect vẫn để **Vietnamese**, thêm English làm ngôn ngữ phụ khi bản EN đã đủ nhãn chính |
| 6 | Google ở v1: "TẮT (đề xuất)" | **Đổi hướng 23:52 19/11: Google auto 1 chạm, BẬT ở v1** — nhưng chỉ bật khi Client ID chung + xác minh Google xong. Nếu tới lúc submit mà chưa xong thì phải tắt Google tạm và sửa lại mô tả + khai báo dữ liệu (xem §12) |
| 7 | Mô tả hứa "Nói là làm — bấm mic rồi nói…" | **Chỉ giữ câu này nếu mic kịp v1.** Nếu mic dời v1.1 thì xoá đoạn giọng nói khỏi mô tả và khỏi screenshot số 4 (xem §9) |
| 8 | `capacitor.config.ts` còn màu nền `#FBF5EA` (kem vintage), StatusBar `LIGHT` | Phải đổi theo UI Apple Music mới (trắng sạch / đen dark mode) trước khi build cuối — việc của agent đang làm UI, kiểm lại ở §12 |
| 9 | BUILD-GUIDE bước 5–6 còn ghi repo `tro-ly-xeo` | Đọc BUILD-GUIDE thì thay repo thành `fotobro`, không copy `node_modules/`, không đẩy secret nào lên GitHub |

---

## 3. Metadata nhập vào App Store Connect (v1)

| Trường | Nhập đúng như sau | Giới hạn |
|---|---|---|
| App Name | `FotoBro` | ≤ 30 ký tự — đang dùng 7 |
| Subtitle | `Trợ lý studio ảnh` | ≤ 30 ký tự — **17 ký tự, ĐẠT**, còn dư 13 |
| Bundle ID | `com.fotobro.app` | chọn App ID đã tạo, không gõ tay sai 1 ký tự |
| SKU | `fotobro-001` | chỉ hiện trong App Store Connect, tự đặt |
| Primary Language | `Vietnamese` | — |
| Version | `1.0` | Build `1` |
| Primary Category | **Business** | Quản lý job, thu chi, báo cáo của studio nhỏ |
| Secondary Category | **Photo & Video** | Đúng nghề; Productivity chỉ là phương án dự phòng nếu Việt muốn nhấn "trợ lý" hơn "nhiếp ảnh" — không đổi ở v1 nếu không có lý do mới |
| Price | **Free (0đ)** | Không tạo IAP ở v1 |
| Age Rating | **4+** | Trả lời "Không" cho mọi mục nội dung nhạy cảm trong questionnaire |
| Copyright | `© 2026 FotoBro` (ghi tên chủ sở hữu khi tạo app — để Việt chốt tên hiển thị) | — |
| App Icon | `AppIcon-1024.png` (1024×1024, RGB, không alpha — đã kiểm chứng) | Bắt buộc |

**Tên hiển thị trên màn hình chính (CFBundleDisplayName):** `FotoBro`
(7 ký tự, vừa màn hình chính).

---

## 4. Giá và mua trong app (v1)

- **Miễn phí, không có In-App Purchase, không có quảng cáo.**
- Trong App Store Connect: Price = Free, **không tạo IAP nào**.
- Nấc 2 (CloudKit) và Nấc 3 (nhóm/studio) **có thu phí theo quyết định
  23:43 19/11, nhưng ở v1 chỉ là placeholder trong code/tài liệu** —
  không bật IAP thật, không ghi giá vào mô tả, không tạo sản phẩm IAP
  cho tới khi Việt chốt **số tiền + chu kỳ** (tháng/năm). Xem
  `CLOUDKIT-PLAN.md` (agent khác đang viết) để biết Nấc 1 miễn phí gồm
  gì, Nấc 2/3 trả phí gồm gì.
- **App Privacy (Privacy Nutrition Labels):** khai
  **"Data Not Collected"** — khớp `PRIVACY.md`: dữ liệu job/tiền chỉ ở
  trên máy, Apple tính là không thu thập. **Ngoại lệ cần khai lại nếu
  xảy ra trước submit:** (a) Google bật ở v1 → dữ liệu Google chỉ đọc
  trên máy theo quyền người dùng, vẫn không gửi về máy chủ của FotoBro,
  nhưng phải ghi đúng trong App Privacy questionnaire; (b) CloudKit bật
  thật → dữ liệu đồng bộ qua iCloud của Apple, khai theo hướng dẫn của
  Apple cho CloudKit. Không khai sai để khỏi bị Apple trả về.

---

## 5. Keywords (100 ký tự)

**Chuỗi hiện có (94/100, ĐẠT):**

```
fotobro,foto bro,studio anh,chup anh,quan ly job,thu chi,nhac lich,chup cuoi,lookbook,portrait
```

**Đề xuất lấp đủ 100/100 cho v1 (chỉ thêm 1 từ, không nhồi tên app khác):**

```
fotobro,foto bro,studio anh,chup anh,quan ly job,thu chi,nhac lich,chup cuoi,lookbook,portrait,event
```

- Đếm: 94 + 6 (`,event`) = **100 ký tự đúng giới hạn**.
- Quy tắc Apple: cách nhau bằng dấu phẩy, **không khoảng trắng**,
  không lặp từ đã có trong tên/subtitle, không dùng từ "miễn phí",
  không nhồi tên app đối thủ. Từ `event` khớp loại job Event đã có
  trong app.
- **Kiểm lại trước khi nhập:** đếm lại chuỗi cuối bằng lệnh đếm ký tự,
  không tin con số trong file cũ (đã sai 1 lần ở subtitle, xem §2).

---

## 6. Mô tả (Description)

### 6a. Tiếng Việt — dán vào App Store Connect

> FotoBro là trợ lý studio ảnh cho nhiếp ảnh gia tự do.
>
> Mở app là thấy Hôm nay: hôm nay chụp ai, mấy giờ, ở đâu, thu bao
> nhiêu, giao ảnh cho ai — tất cả ở một màn hình. Mọi việc tối đa
> 3 chạm, 10 giây là xong.
>
> JOB ĐI THEO 8 BƯỚC RÕ RÀNG
> Tư vấn, chốt cọc, sắp chụp, đã chụp, chọn ảnh, hậu kỳ, đã giao, xong.
> Chạm vào bước nào cũng nhảy thẳng tới đó. Job kẹt quá lâu tự hiện
> lên Hôm nay. Khách bỏ thì cho Huỷ, huỷ rồi khôi phục được.
>
> TIỀN BẠC RÕ TỪNG KHOẢN
> Chốt cọc ghi cọc ngay, giao ảnh nhắc thu nốt, xong job mà còn thiếu
> tiền thì app cảnh báo. Thu theo đợt, theo loại, phát sinh thêm; chi
> theo job, theo tháng, theo thiết bị. Báo cáo ngày, tuần, tháng tự
> tính sẵn.
>
> ĐĂNG NHẬP GOOGLE 1 CHẠM LÀ CÓ HẾT
> Đăng nhập Google một lần là thấy Lịch, Gmail báo tiền về, khách hỏi
> chụp, Danh bạ và Drive của bạn — không cần tự tạo gì thêm. Nhập buổi
> chụp từ Lịch iPhone cũng chỉ một chạm.
>
> NHẮC TRƯỚC GIỜ CHỤP VÀ HẠN GIAO ẢNH
> Nhắc trước giờ chụp 60 phút và trước hạn giao ảnh 1 ngày, để không
> trễ hẹn với khách.
>
> LÀM THEO CÁCH CỦA BẠN
> Chọn màu chủ đề, thêm logo studio, sửa mẫu tin nhắn theo giọng của
> mình, chọn tiếng Việt hoặc tiếng Anh, tiền VND hoặc USD.
>
> DỮ LIỆU CHỈ Ở TRÊN MÁY CỦA BẠN
> Không tài khoản, không máy chủ, không quảng cáo, không theo dõi.
> Job và sổ tiền chỉ lưu trên điện thoại của bạn. Muốn sao lưu thì xuất
> file về máy, muốn xoá thì xoá trong Cài đặt là sạch.
>
> FotoBro làm cho nhiếp ảnh gia tự do — portrait, couple, wedding,
> lookbook, event, cả chụp digital lẫn film. Điền tên và studio của bạn
> trong Cài đặt là app xưng hô, nhắn tin và báo cáo theo tên của bạn.

**Lưu ý khi dán:**
- Đoạn "ĐĂNG NHẬP GOOGLE 1 CHẠM…" chỉ giữ nếu Google kịp v1; nếu
  Google chưa kịp thì thay bằng đoạn nhập lịch bằng file .ics / Lịch
  iPhone (xem §12).
- Đoạn giọng nói **không có trong mô tả v1** cho tới khi chốt mic có
  kịp v1 hay dời v1.1 — đừng hứa tính năng chưa có.
- Mô tả không nhắc tên Xèo, Sadako, E.L.F., Super Junior hay bất kỳ
  dữ liệu mẫu thật nào của một người dùng cụ thể.

### 6b. Tiếng Anh (English description — dùng khi thêm ngôn ngữ phụ)

> FotoBro is a photo studio assistant for freelance photographers.
>
> Open the app and see Today: who you shoot today, when, where, how
> much to collect, and who to deliver photos to — all on one screen.
> Everything takes at most 3 taps, 10 seconds.
>
> JOBS FOLLOW 8 CLEAR STEPS
> Consult, deposit, upcoming shoot, shot, select photos, editing,
> delivered, done. Tap any step to jump straight to it. Stuck jobs
> surface on Today. Cancelled jobs can be restored.
>
> MONEY, DOWN TO EVERY ITEM
> Record the deposit at booking, get reminded to collect the rest on
> delivery, and get warned if a job is finished with money still owed.
> Income by instalment, type and extra; expenses by job, month and
> gear. Daily, weekly and monthly reports are calculated for you.
>
> SIGN IN WITH GOOGLE ONCE AND YOU ARE DONE
> One Google sign-in shows your Calendar, Gmail money alerts, client
> enquiries, Contacts and Drive — nothing else to set up. Import
> shoots from iPhone Calendar in one tap too.
>
> REMINDERS BEFORE SHOOTS AND DELIVERY DEADLINES
> 60 minutes before a shoot, 1 day before a delivery deadline, so you
> never miss a client.
>
> MAKE IT YOURS
> Pick a theme colour, add your studio logo, edit message templates
> in your own voice, choose Vietnamese or English, VND or USD.
>
> YOUR DATA STAYS ON YOUR DEVICE
> No account, no server, no ads, no tracking. Jobs and money live only
> on your phone. Export a backup file when you want, delete everything
> in Settings when you want.
>
> FotoBro is made for freelance photographers — portrait, couple,
> wedding, lookbook, event, digital and film. Fill in your name and
> studio in Settings and the app greets, messages and reports in your
> name.

---

## 7. Support URL và Privacy Policy URL

| Mục | Dùng tạm ở v1 | Sau này đổi thành |
|---|---|---|
| **Support URL** (bắt buộc, phải là **link web**, không phải email) | `https://github.com/Hoangviet1397/fotobro` (repo mới, README có hướng dẫn) | `https://fotobro.app/support` — trang có nút `mailto:support@fotobro.app`, làm sau khi có domain (xem dưới) |
| **Privacy Policy URL** (bắt buộc) | **Chưa có URL thật** — phải host `PRIVACY.md` trước khi tạo app trong App Store Connect | Đề xuất: `https://hoangviet1397.github.io/fotobro/PRIVACY.html` (thêm file vào repo `fotobro`, render thành HTML) |
| **Marketing URL** | Để trống ở v1 (không bắt buộc) | Điền sau khi có trang giới thiệu |
| **Email hỗ trợ** | **Chưa có** — không ghi email nào vào App Store Connect ở v1 nếu chưa tạo được hộp thư thật | `support@fotobro.app` (đề xuất) — cần mua domain trước |

**Cách host Privacy Policy (làm trước khi tạo app):**
1. Thêm `PRIVACY.md` (và bản render `PRIVACY.html` nếu cần) vào repo
   `Hoangviet1397/fotobro`.
2. Bật GitHub Pages cho repo `fotobro` (main/root).
3. Mở URL `https://hoangviet1397.github.io/fotobro/PRIVACY.html` trên
   điện thoại, kiểm tra đọc được, rồi mới dán vào App Store Connect.
4. Cập nhật ngày trong đầu file `PRIVACY.md` khi host (hiện ghi
   19/11/2026, FotoBro v2.6) và sửa 2 chỗ còn cũ trong đó: repo
   `tro-ly-xeo` → `fotobro`, và đoạn "Google mặc định TẮT / có thể bị
   TẮT ở v1" → đúng với quyết định Google auto 1 chạm ở v1.

**Tình trạng domain/email (19/11/2026, xem
`~/workspace/fotobro-scale/docs/EMAIL-SETUP.md`):**
- `fotobro.com` đã có chủ từ 22/02/2008 tới 22/02/2027 — không mua
  được giá thường.
- `fotobro.app` **chưa xác minh được** trống hay đã đăng ký — Việt phải
  kiểm tra lại ở trang registrar trước khi mua.
- Dự phòng còn trống thật: `fotobroapp.com`, `getfotobro.com`.
- Đề xuất rẻ nhất: iCloud+ Custom Domain, khoảng $20/năm (domain
  `.app` $8,20 + iCloud+ $0,99/tháng). **Chưa mua gì, chưa tạo hộp thư
  nào — mua domain cần Việt duyệt giá/registrar trước.**

---

## 8. Icon và ảnh đại diện

- **App Icon (App Store):** `AppIcon-1024.png` — 1024×1024, RGB, không
  alpha, đã kiểm chứng. Tải lên ở App Information khi tạo app.
- **Icon trong app / splash:** nguồn `assets/icon.png`,
  `assets/splash.png`, tạo bằng `@capacitor/assets` trong `ios/`.
- **Lưu ý:** icon hiện tại vẫn là hoa sen + ống kính cũ của Trợ lý Xèo.
  Chưa có logo FotoBro mới. Nếu đổi logo thì phải render lại
  `AppIcon-1024.png` + icon/splash trong `ios/` **trước khi build
  cuối**, không đổi icon sau khi đã gửi Apple duyệt.

---

## 9. Screenshots — 6 màn hình cần chụp

**Quy tắc chung:**
- Chụp bằng **iPhone thật qua TestFlight**, không chụp từ trình duyệt
  máy tính (màu và chữ sẽ khác).
- 2 bộ bắt buộc: **6.7" 1290×2796** (iPhone 14/15/16 Pro Max) và
  **6.5" 1242×2688** (iPhone 11 Pro Max / XS Max). Tối đa 10 ảnh/bộ,
  tối thiểu 1 ảnh/bộ — làm **6 ảnh/bộ** theo danh sách dưới, đúng thứ
  tự này (ảnh 1 là ảnh đầu tiên người ta thấy).
- iPad: **không bắt buộc** — app chỉ làm cho iPhone (portrait). Khai
  iPad không hỗ trợ thì khỏi chụp iPad.
- **Dữ liệu mẫu:** dùng dữ liệu mẫu hư cấu, **không dùng job/ảnh/tiền
  thật của Xèo hay của bất kỳ khách thật nào**. Trước khi chụp: tạo
  1 job đã xong + 2–3 job sắp tới bằng tên hư cấu, đặt ảnh trang chủ
  đẹp (ảnh chung, không phải ảnh khách thật), tắt thông báo lạ, để
  điện thoại ở chế độ sáng (light mode) cho bộ chính — chụp thêm bộ
  dark mode chỉ khi còn thời gian.
- **Không chụp:** màn hình có tên/email/số điện thoại thật, màn hình
  lỗi, màn hình trống không có dữ liệu, màn hình Google đăng nhập có
  cảnh báo "ứng dụng chưa xác minh".

| # | Màn hình | Nội dung phải thấy | Dữ liệu mẫu hư cấu gợi ý |
|---|---|---|---|
| 1 | **Hôm nay** | Lịch chụp hôm nay + tiền hôm nay + ảnh trang chủ đẹp, tiêu đề lớn kiểu Apple Music | Hôm nay: 1 buổi Couple 16:00, 1 buổi Portrait 09:00; tiền hôm nay: đã thu 2.000.000đ, còn thiếu 1.500.000đ |
| 2 | **Pipeline job 8 bước** | 1 job đang ở giữa pipeline, thấy rõ bước đã xong / đang làm / sắp tới, có thể thấy nút nhảy bước | Job "Minh & Lan — Wedding", đang ở bước "Hậu kỳ" (bước 6/8), giá 15.000.000đ, đã thu cọc 5.000.000đ |
| 3 | **Sổ tiền / báo cáo** | Báo cáo tuần, thu–chi rõ ràng, số dư rõ | Tuần này: thu 12.500.000đ, chi 1.200.000đ, còn thiếu 3.000.000đ |
| 4 | **Đăng nhập Google 1 chạm** (thay cho màn giọng nói cũ) | Nút "Đăng nhập Google" + sau khi đăng nhập thấy lịch Gmail gợi ý tiền về / khách hỏi | Chỉ chụp màn trong app (không chụp màn đăng nhập của Google). Nếu Google chưa kịp v1 thì thay bằng màn **Nhập từ Lịch iPhone** |
| 5 | **Thêm job mới** | Form thêm job gọn: khách / loại chụp / Digital-Film / ngày giờ / giá tự điền | Job mới: "Quán cà phê X — Lookbook", Digital, 8.000.000đ, ngày chụp tuần sau |
| 6 | **Cài đặt / Khoá app** | Màn khoá Face ID + PIN và phần cá nhân hoá (màu chủ đề, logo studio) — chứng minh app riêng tư, dữ liệu ở trên máy | Không chụp màn có Client ID, secret hay email thật |

**Nếu mic kịp v1:** thay ảnh 4 bằng màn giọng nói (khung "Bạn nói
là…" đang hiện / mic đang nghe), và dồn màn Google vào ảnh 6 thay cho
màn khoá. **Nếu mic dời v1.1:** giữ danh sách trên, không nhắc giọng
nói trong screenshot hay mô tả.

**App Preview video (tùy chọn, làm sau):** 15–30 giây, quay màn hình
iPhone thật: mở app → hôm nay có gì → thêm 1 job → job hiện trong
pipeline → xem báo cáo. Không bắt buộc cho lần gửi đầu.

---

## 10. Khai báo dữ liệu (App Privacy) và quyền

### App Privacy — khai "Data Not Collected"
- Dữ liệu job/tiền/cài đặt/ảnh trang chủ chỉ ở trên máy → Apple tính
  là không thu thập.
- Khai lại nếu trước submit có thay đổi: Google bật (dữ liệu Google chỉ
  đọc trên máy, không gửi về máy chủ FotoBro), CloudKit bật thật (đồng
  bộ qua iCloud của Apple).

### Các quyền app xin (phải có Usage Description trong Info.plist,
### câu chữ tiếng Việt + tiếng Anh, nói rõ dùng để làm gì)

| Quyền | Dùng để làm gì | Ghi chú cho Apple |
|---|---|---|
| Lịch (EventKit, `NSCalendarsUsageDescription`) | Nhập buổi chụp từ Lịch iPhone 1 chạm; ghi buổi chụp vào Lịch iPhone | Chỉ đọc/ghi lịch chụp do người dùng chọn; không đọc hết lịch cá nhân để gửi đi |
| Thư viện ảnh (`NSPhotoLibraryUsageDescription`) | Thêm ảnh trang chủ + logo studio từ máy | Chỉ ảnh người dùng tự chọn |
| Máy ảnh (`NSCameraUsageDescription`) | Chụp ảnh trang chủ/logo nếu có (nếu v1 không dùng máy ảnh thì bỏ quyền này) | Kiểm lại trước build cuối: quyền nào không dùng thì bỏ |
| Micro + Nhận dạng giọng nói (`NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`) | Ra lệnh bằng giọng nói | **Chỉ khai nếu mic kịp v1.** Nếu mic dời v1.1 thì bỏ 2 quyền này khỏi Info.plist và khỏi mô tả |
| Face ID (`NSFaceIDUsageDescription`) | Khoá app bằng Face ID | Dữ liệu sinh trắc học không rời khỏi máy |
| Thông báo (Local Notifications) | Nhắc trước giờ chụp 60 phút, trước hạn giao 1 ngày | Chỉ từ dữ liệu job trên máy, không qua máy chủ, không Push Notifications |

---

## 11. Checklist trước khi Submit for Review

Làm theo thứ tự — mục nào chưa xong thì chưa submit được.

### A. Trước TestFlight (chuẩn bị)
- [ ] App ID `com.fotobro.app` đã tạo trên Apple Developer (kèm
  capability iCloud + Sign in with Apple **chỉ khi** Nấc 2 CloudKit
  bật ở v1; nếu Nấc 2 chỉ là placeholder thì không tick thêm gì)
- [ ] App đã tạo trong App Store Connect: Name `FotoBro`, ngôn ngữ
  chính Vietnamese, Bundle ID `com.fotobro.app`, SKU `fotobro-001`
- [ ] Privacy Policy URL đã host và mở được trên điện thoại (§7)
- [ ] Support URL đã điền (tạm link GitHub repo `fotobro`, §7)
- [ ] App Icon 1024 đã tải lên App Information
- [ ] Pricing: Free, không IAP; App Privacy: Data Not Collected
- [ ] Distribution Certificate + Provisioning Profile (`FotoBro App Store`)
  đã tạo; App Store Connect API Key (.p8) đã tạo — xem `BUILD-GUIDE.md`
  mục 3–4 (làm trên Windows bằng OpenSSL được, không cần Mac)
- [ ] 6 secrets GitHub Actions đã dán đúng tên vào repo `fotobro`
  (xem `PUSH-READY.md` của agent khác — không dán secret vào chat hay
  commit lên GitHub)
- [ ] Code đã đẩy lên repo `fotobro`, workflow iOS đã chạy xanh,
  build 1.0 (1) đã lên TestFlight

### B. TestFlight (thử trên iPhone thật)
- [ ] Internal Testing: thêm tester (Xèo là người dùng đầu tiên) bằng
  Apple ID, cài qua app TestFlight
- [ ] Thử đủ: mở app → Hôm nay → thêm 1 job Film + 1 job Cả hai
  (Digital + Film) → nhảy bước pipeline → ghi cọc → huỷ + khôi phục
  1 job → sổ tiền/báo cáo → đăng nhập Google 1 chạm → nhập từ Lịch
  iPhone → đổi màu chủ đề/logo/ngôn ngữ/tiền tệ → sửa mẫu tin nhắn →
  khoá Face ID/PIN → sao lưu JSON
- [ ] Kiểm dark mode + light mode, chữ không bị cắt, tab dưới không
  bị che (lỗi từng gặp ở bản web trên điện thoại)
- [ ] Chụp 6 screenshot theo §9 (2 bộ kích thước)
- [ ] Sửa hết lỗi blocker, build lại nếu cần (tăng build number, giữ
  version 1.0)

### C. Trước khi bấm Submit for Review
- [ ] Mô tả VI + EN (§6) đã khớp đúng tính năng có trong build gửi đi
  (Google có hay không, mic có hay không — xem §12)
- [ ] Keywords đủ 100 ký tự (§5), subtitle 17 ký tự (§3)
- [ ] Screenshot 6 ảnh/bộ đã tải lên, đúng thứ tự, không có dữ liệu thật
- [ ] App Privacy đã khai đúng, Privacy Policy URL còn mở được
- [ ] **App Review Information:** điền tên + email + số điện thoại liên
  hệ của người duyệt (dùng email Việt kiểm soát được, trả lời được
  trong 1–3 ngày); ghi chú cho reviewer (xem §12) + tài khoản demo
  (xem dưới)
- [ ] **Tài khoản demo cho Apple:** app **không cần tài khoản** để dùng
  (local-first, không đăng nhập bắt buộc). Ghi rõ trong Notes cho
  reviewer: "Không cần tài khoản. Mở app là dùng ngay với dữ liệu mẫu
  có sẵn; đăng nhập Google là tùy chọn, không bắt buộc." Nếu reviewer
  vẫn cần tài khoản Google demo thì chuẩn bị 1 tài khoản Google test
  có sẵn vài sự kiện lịch + email mẫu, **không dùng Gmail thật của
  Việt/Xèo**, và ghi tài khoản đó vào Notes — chỉ làm khi Apple hỏi.
- [ ] Export Compliance: app không dùng mã hoá tự viết ngoài chuẩn
  (mã hoá sao lưu dùng AES chuẩn của hệ thống) — khai theo hướng dẫn
  của Apple; nếu dùng mã hoá đầu cuối tự triển khai cho CloudKit thì
  hỏi lại trước khi khai.
- [ ] Không còn file/secret/test data nào trong build gửi đi.

---

## 12. Câu trả lời chuẩn bị sẵn nếu Apple hỏi (Reviewer Notes)

Ghi vào mục Notes trong App Store Connect khi submit (viết bằng tiếng
Anh, ngắn gọn). Đừng đợi Apple hỏi mới nghĩ.

**1. App không cần tài khoản:**
> No account is required. The app works offline with local data.
> Google sign-in is optional, only for users who want to import
> their own Calendar/Gmail/Drive. All core features work without it.

**2. Google sign-in (nguy cơ lớn nhất ở v1):**
- App dùng Google OAuth với Client ID chung của FotoBro, PKCE,
  redirect theo scheme `com.fotobro.app` (native) — không dùng
  redirect web cũ.
- **Rủi ro Guideline 4.8 (Sign in with Apple):** Apple có thể yêu cầu
  app nào có đăng nhập bên thứ ba (Google) thì phải có Sign in with
  Apple tương đương. Chuẩn bị sẵn câu trả lời: đăng nhập Google là
  **tùy chọn, không bắt buộc, không phải đăng nhập tài khoản FotoBro**
  (app không có tài khoản riêng), và Sign in with Apple đã được bật
  cho Nấc 2 CloudKit nếu reviewer yêu cầu. Nếu Apple vẫn bắt buộc thì
  phải thêm Sign in with Apple trước khi gửi lại — ghi vào mục "Vấn đề
  còn tồn tại" ở báo cáo cuối của agent làm app.
- **Cảnh báo "Google chưa xác minh ứng dụng này":** chỉ được submit khi
  xác minh Google đã xong. Nếu chưa xong thì **tắt Google tạm ở v1**
  và sửa mô tả + screenshot + App Privacy cho khớp, đừng để reviewer
  thấy màn cảnh báo.

**3. Quyền Lịch iPhone:**
> The app reads iPhone Calendar only after the user taps "Import from
> iPhone Calendar" and grants permission, to create photo jobs from
> the next 30 days of events. Events stay on the device; nothing is
> uploaded to our server (we have no server).

**4. Quyền Ảnh / Micro / Face ID:**
> Photos: only photos the user picks as home image or studio logo.
> Microphone/speech (only if voice ships in v1): voice commands are
> transcribed by iOS speech recognition; no audio is stored or sent
> to us. Face ID: unlocks the app on-device only.

**5. Dữ liệu và xoá dữ liệu:**
> All jobs and money data stay on the device. Users can export a JSON
> backup and delete all data in Settings → Delete data. Uninstalling
> the app deletes everything.

**6. Nếu mic dời v1.1:**
- Xoá mọi nhắc tới giọng nói khỏi mô tả (§6), screenshot (§9),
  Info.plist (2 quyền micro/speech), và `PRIVACY.md` mục 3 (ghi rõ
  giọng nói sẽ có ở bản sau).
- Đừng để nút mic hiện trong app nhưng bấm không chạy — hoặc ẩn hẳn,
  hoặc hiện thông báo "Sẽ có ở bản sau".

**7. Nếu Google chưa kịp v1:**
- Ẩn nút đăng nhập Google, thay bằng nhập lịch bằng file .ics (bản
  web fallback) + nút "Thêm vào Lịch iPhone" (.ics) trong chi tiết job.
- Sửa mô tả §6a: thay đoạn Google 1 chạm bằng đoạn nhập lịch .ics.
- Sửa App Privacy: không khai gì thêm về Google.

---

## 13. Những gì còn chờ Việt

| # | Việc cần Việt | Vì sao chưa làm được |
|---|---|---|
| 1 | Duyệt mô tả VI/EN (§6), keywords đủ 100 (§5), subtitle 17 ký tự (§3) | Cần Việt gật đầu trước khi nhập vào App Store Connect |
| 2 | Chốt có đổi logo FotoBro mới không (icon hiện vẫn là sen + ống kính cũ) | Đổi logo thì phải render lại App Icon 1024 + splash trước build cuối |
| 3 | Chụp 6 screenshot (§9) trên iPhone thật qua TestFlight | Chỉ chụp được khi có bản TestFlight chạy được |
| 4 | Host Privacy Policy URL (§7) — hoặc duyệt để Muse thêm `PRIVACY.md`/`PRIVACY.html` vào repo `fotobro` + bật GitHub Pages | Chưa có URL thật thì không tạo app trong App Store Connect được |
| 5 | Duyệt Support URL tạm (link GitHub repo `fotobro`) | Support URL bắt buộc phải là link web |
| 6 | Kiểm tra + mua domain `fotobro.app` (hoặc dự phòng `fotobroapp.com` / `getfotobro.com`) và tạo email `support@fotobro.app` | Xem `EMAIL-SETUP.md`: `fotobro.com` đã có chủ, `fotobro.app` chưa xác minh được — mua cần Việt duyệt giá/registrar |
| 7 | Chốt giá Nấc 2/3 (số tiền + chu kỳ) trước khi bật IAP | v1 không tạo IAP, không ghi giá vào mô tả |
| 8 | Tạo App ID, chứng chỉ, profile, API Key, dán 6 secrets (BUILD-GUIDE mục 1–5) | Việt phải tự làm bằng Apple ID đã đăng ký Developer — Muse không làm thay được |
| 9 | Chốt mic có kịp v1 hay dời v1.1, và Google có kịp v1 hay tắt tạm | Quyết định này đổi mô tả + screenshot + quyền (§12 mục 6–7) |
| 10 | Điền tên + email + số điện thoại liên hệ cho App Review (mục C. trong §11) | Apple cần liên hệ được trong 1–3 ngày duyệt |

---

## 14. Nguồn tham khảo trong gói

- `APP-STORE-LISTING.md` — hồ sơ cũ (đã rà, các chỗ sai xem §2)
- `PRIVACY.md` — chính sách riêng tư, cần host (§7) và sửa 2 chỗ cũ (§7)
- `BUILD-GUIDE.md` — build .ipa qua GitHub Actions, 6 secrets, App ID
- `RISKS.md` — 10 rủi ro (Google OAuth, Web Speech, passkey, SPM…)
- `IOS-SETUP-NOTE.md`, `README.md` — ghi chú gói iOS
- `PUSH-READY.md`, `GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md` — các agent
  khác đang viết song song (đọc khi ghép lại, không sửa file của họ)
- `~/workspace/fotobro-scale/docs/EMAIL-SETUP.md` — domain/email hỗ trợ
