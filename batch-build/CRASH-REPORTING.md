# Báo lỗi & Crash — FotoBro iOS v1

> **Phạm vi:** FotoBro iOS v1 — Bundle ID `com.fotobro.app`
> **Nguyên tắc v1:** KHÔNG dùng SDK bên thứ ba để báo lỗi/crash (không Firebase Crashlytics, không Sentry, không Instabug, không SDK tương tự). Không thêm dependency, không thêm quyền, không gửi dữ liệu tự động ra ngoài.
> **Kênh duy nhất:** (1) Xcode Organizer / App Store Connect → TestFlight → Crashes để xem crash log do Apple thu thập; (2) tester / người dùng báo lỗi thủ công theo mẫu dưới đây.

---

## 1. Tổng quan — v1 làm gì và không làm gì

| | v1 |
|---|---|
| Crash log tự động từ Apple | ✅ Có — qua Xcode Organizer / App Store Connect (xem §2) |
| Báo lỗi tự động gửi về server/dev | ❌ Không có |
| SDK crash bên thứ ba | ❌ Không dùng (không Crashlytics, không Sentry) |
| Thu thập dữ liệu người dùng khi crash | ❌ Không — Apple chỉ thu thập log kỹ thuật đã được người dùng đồng ý chia sẻ với nhà phát triển (xem §2.4) |
| Kênh báo lỗi thủ công | ✅ Mẫu form §4 (tiếng Việt + tiếng Anh), gửi qua email hỗ trợ / TestFlight feedback / kênh liên hệ trong app |

**Hệ quả trực tiếp:** một crash chỉ được biết tới khi (a) tester/người dùng chủ động báo, hoặc (b) ai đó mở Organizer/App Store Connect và thấy crash log xuất hiện. Không có cảnh báo đẩy, không có dashboard theo thời gian thực, không có số liệu tỉ lệ crash tự động. Xem §6 Giới hạn.

---

## 2. Xem crash log bằng Xcode Organizer (kênh chính thức duy nhất)

### 2.1. Điều kiện tiên quyết

- App đã được build bằng Xcode 26+ và phát hành qua TestFlight hoặc App Store (build chạy local qua Xcode — sideload/debug — **không** xuất hiện ở đây).
- Tài khoản Apple Developer đã đăng nhập trong Xcode và có quyền xem App Store Connect của app `com.fotobro.app` (vai trò Admin / App Manager / Developer đều xem được Crashes; vai trò Marketing/Sales thì không).
- Crash log chỉ xuất hiện khi người dùng/tester đã bật **Share iPhone Analytics / Share With App Developers** trên thiết bị (Cài đặt → Quyền riêng tư & Bảo mật → Phân tích & Cải tiến → Chia sẻ với nhà phát triển ứng dụng). Nếu tắt, Apple không gửi log — đây là lý do phổ biến nhất khiến "app crash mà Organizer không thấy gì" (xem §6).

### 2.2. Cách xem — Xcode Organizer

1. Mở Xcode → menu **Window → Organizer** (⇧⌘O).
2. Chọn tab **Crashes** ở cột trái (nếu không thấy, chọn app FotoBro trong danh sách, mục Crashes nằm dưới tên app).
3. Chọn **phiên bản app** (Version) và **bản build** (Build) ở bộ lọc phía trên — luôn lọc đúng build mà tester đang dùng, vì crash của build cũ không còn giá trị sau khi đã sửa.
4. Danh sách crash được nhóm theo **loại crash giống nhau** (cùng stack trace): mỗi nhóm cho biết **số lần xảy ra**, **số người dùng bị ảnh hưởng**, **phiên bản iOS**, **dòng máy** (ví dụ iPhone 15, iPhone 12), và **ngày xuất hiện lần đầu / lần cuối**.
5. Bấm vào một nhóm để xem **stack trace đã được symbolicate** (Xcode tự giải mã địa chỉ thành tên hàm/file/dòng — yêu cầu dSYM của đúng build đó đã được upload; khi archive & upload qua Xcode thì dSYM được gửi kèm tự động, **không tắt tùy chọn "Include app symbols"** khi upload).
6. Bấm **Open in Project** để nhảy tới đúng file/dòng code gây crash (chỉ hoạt động khi đang mở đúng project/source của build đó).

### 2.3. Cách xem — App Store Connect (không cần mở Xcode)

1. Vào [App Store Connect](https://appstoreconnect.apple.com) → **My Apps → FotoBro**.
2. Tab **TestFlight** → chọn build → mục **Crashes** (hoặc **App Store → Activity → Crashes** đối với bản App Store).
3. Nội dung tương tự Organizer: nhóm crash, số lượng, thiết bị, iOS version.
4. Dùng kênh này khi cần kiểm tra nhanh trên máy không có Xcode, hoặc để đối chiếu số liệu với Organizer.

> **Lưu ý về độ trễ:** crash log không xuất hiện ngay. Apple thường cần **vài giờ tới 1–2 ngày** sau khi crash xảy ra mới tổng hợp và hiển thị. Một crash vừa xảy ra lúc tester báo sẽ **chưa có** trong Organizer — đừng kết luận "không có crash" chỉ vì Organizer đang trống. Luôn đối chiếu với báo cáo thủ công của tester (§3–§4).

### 2.4. Quyền riêng tư — crash log chứa gì và không chứa gì

- **Có:** tên app, phiên bản app/build, dòng máy, phiên bản iOS, thời điểm crash, stack trace (dãy hàm đã chạy tới lúc crash), loại exception/signal (ví dụ `EXC_BAD_ACCESS`, `SIGABRT`).
- **Không có:** tên người dùng, email, nội dung job, tên khách hàng, số tiền, ảnh, ghi chú, dữ liệu trong app, vị trí. Crash log của Apple không chứa dữ liệu nghiệp vụ của FotoBro.
- Vì vậy crash log **không bao giờ thay thế** được báo cáo thủ công: nó cho biết *app chết ở dòng code nào*, nhưng không cho biết *người dùng đang làm gì* lúc đó. Cần cả hai (§5).

### 2.5. Lịch kiểm tra Organizer (v1, thủ công)

| Thời điểm | Việc làm |
|---|---|
| Mỗi ngày trong giai đoạn TestFlight nội bộ | Mở Organizer → Crashes, lọc đúng build mới nhất, ghi lại nhóm crash mới vào bảng theo dõi (§5.1) |
| Ngay sau khi tester báo "app tự thoát / văng ra" | Đối chiếu: hỏi tester giờ xảy ra, máy, iOS; kiểm tra Organizer (nhớ độ trễ §2.3 — chưa thấy không có nghĩa là không có) |
| Trước mỗi lần submit build mới | Kiểm tra lại: nhóm crash của build cũ đã hết ở build mới chưa (số lượng về 0 sau vài ngày tester dùng build mới) |
| Sau khi lên App Store | Kiểm tra 2–3 lần/tuần trong 2 tuần đầu, sau đó 1 lần/tuần |

Không có ai "trực" Organizer tự động ở v1 — lịch trên là trách nhiệm thủ công của người phụ trách build/release. Ghi rõ người phụ trách vào bảng theo dõi (§5.1).

---

## 3. Hướng dẫn người dùng / tester báo lỗi

Mục tiêu: một báo cáo đủ để tái hiện lỗi trong **1 lần thử**, không phải hỏi đi hỏi lại 3–4 vòng. Hướng dẫn này đưa cho mọi tester TestFlight và để trong mục trợ giúp của app (link tới form §4).

### 3.1. Khi nào cần báo

- App **tự thoát ra màn hình chính** (crash) khi đang dùng.
- App **đứng hình / treo** (không bấm được gì, phải vuốt thoát).
- Một chức năng **không làm đúng như mong đợi** (ví dụ: bấm lưu job mà job không hiện; tiền cọc nhập rồi mà báo cáo không cộng; nhắc lịch không kêu).
- Giao diện **hiển thị sai** (chữ chồng lên nhau, nút bị che, màn hình trắng).

### 3.2. Cần ghi lại ngay lúc lỗi xảy ra (trước khi quên)

1. **Bạn đang làm gì?** Ghi từng bước bấm, theo thứ tự (xem ví dụ §3.4). Đây là thông tin quan trọng nhất — không có bước tái hiện thì dev không sửa được.
2. **Kết quả mong đợi là gì, kết quả thật là gì?** (Ví dụ: "Mong đợi: job lưu và hiện ở Hôm nay. Thật: app văng ra màn hình chính.")
3. **Lỗi xảy ra mấy lần?** Lần đầu / thỉnh thoảng / lần nào cũng bị (ghi rõ: "3 lần liên tiếp" hay "1 lần duy nhất rồi hết").
4. **Phiên bản app:** mở app → Cài đặt → cuối trang có số phiên bản (ví dụ `1.0 (3)`). Hoặc xem trong TestFlight → FotoBro → Version.
5. **Dòng máy + iOS:** Cài đặt → Cài đặt chung → Giới thiệu → (ví dụ: iPhone 13, iOS 18.5). Ghi cả hai.
6. **Ảnh chụp màn hình / quay màn hình:** chụp ngay lúc lỗi hiện ra (nút Nguồn + Tăng âm lượng). Nếu là crash (app văng ra), chụp màn hình trước khi crash nếu kịp, hoặc quay màn hình lại toàn bộ thao tác từ đầu (Cài đặt → Trung tâm điều khiển → thêm Ghi màn hình). Video quay màn hình là bằng chứng tốt nhất cho lỗi khó tái hiện.
7. **Giờ xảy ra lỗi:** ghi giờ phút (ví dụ: "khoảng 21:40 ngày 20/11") để đối chiếu với crash log trong Organizer (§2.3).

### 3.3. Những gì KHÔNG cần gửi (bảo vệ dữ liệu của bạn)

- **Không gửi** tên khách hàng, số điện thoại khách, địa chỉ, số tiền thật của job, ảnh khách hàng, nội dung tin nhắn riêng tư — trừ khi chính những dữ liệu đó là thứ gây lỗi và bạn đồng ý gửi.
- Nếu lỗi liên quan tới một job cụ thể, hãy **đổi tên khách/thông tin nhạy cảm** thành dữ liệu giả trước khi chụp màn hình, hoặc mô tả bằng lời ("job cưới, cọc 5 triệu") thay vì chụp nguyên màn hình có tên thật.
- **Không gửi** mật khẩu, mã PIN khóa app, mã xác minh Google.

### 3.4. Ví dụ báo cáo tốt vs báo cáo chưa đủ

**✅ Tốt — đủ để tái hiện ngay:**

> App văng ra khi bấm Lưu job.
> Các bước: Mở app → bấm + → chọn loại Wedding → nhập tên khách "Test" → nhập cọc 5.000.000 → bấm Lưu → app văng ra màn hình chính.
> Lần nào cũng bị, thử 3 lần đều vậy. Trước đó vừa nhập từ Lịch iPhone xong.
> App 1.0 (3), iPhone 13, iOS 18.5. Xảy ra khoảng 21:40 ngày 20/11.
> (Kèm video quay màn hình.)

**❌ Chưa đủ — sẽ phải hỏi lại:**

> App bị lỗi, sửa giúp mình.
> (Không có bước làm, không có phiên bản, không có máy/iOS, không có ảnh.)

---

## 4. Mẫu form báo lỗi (copy-paste để dùng)

Người dùng/tester điền form này rồi gửi qua kênh đã thống nhất (email hỗ trợ / TestFlight feedback / tin nhắn cho người phụ trách test). Form có 2 ngôn ngữ; dùng bản nào tùy người báo.

### 4.1. Tiếng Việt

```
BÁO LỖI — FotoBro iOS
=====================

1. Vấn đề là gì? (mô tả ngắn gọn 1 câu)
   Ví dụ: App tự thoát khi bấm Lưu job.

2. Các bước gây lỗi (ghi từng bước theo thứ tự)
   1.
   2.
   3.

3. Kết quả mong đợi:
   ...

4. Kết quả thực tế:
   ...

5. Lỗi xảy ra mấy lần?
   [ ] Lần đầu tiên
   [ ] Thỉnh thoảng
   [ ] Lần nào cũng bị (đã thử ___ lần)

6. Phiên bản app: ___ (xem trong app → Cài đặt, cuối trang)
   Build: ___ (số trong ngoặc, ví dụ 1.0 (3))

7. Dòng máy: ___ (ví dụ: iPhone 13)
   Phiên bản iOS: ___ (ví dụ: iOS 18.5)

8. Thời gian xảy ra lỗi: ___ giờ ___ phút, ngày ___/___/___

9. Ảnh chụp / video quay màn hình: (đính kèm)
   [ ] Ảnh chụp màn hình
   [ ] Video quay màn hình

10. Ghi chú thêm:
    ...
```

### 4.2. English

```
BUG REPORT — FotoBro iOS
========================

1. What is the problem? (one sentence)
   Example: The app quits by itself when I tap Save job.

2. Steps to reproduce (in order)
   1.
   2.
   3.

3. Expected result:
   ...

4. Actual result:
   ...

5. How often does it happen?
   [ ] First time
   [ ] Sometimes
   [ ] Every time (tried ___ times)

6. App version: ___ (in app → Settings, at the bottom)
   Build: ___ (number in brackets, e.g. 1.0 (3))

7. iPhone model: ___ (e.g. iPhone 13)
   iOS version: ___ (e.g. iOS 18.5)

8. When did it happen: ___:___ on ___/___/___

9. Screenshot / screen recording: (attach)
   [ ] Screenshot
   [ ] Screen recording

10. Additional notes:
    ...
```

---

## 5. Quy trình xử lý (thu thập → tái hiện → sửa → build mới → báo lại tester)

### 5.1. Bảng theo dõi lỗi (1 dòng = 1 lỗi)

Dùng bảng này (ghi trong file riêng, ví dụ `BUG-TRACKER.md`, hoặc issue tracker của repo — v1 không quy định công cụ, chỉ quy định nội dung tối thiểu). Không dùng bảng này thì lỗi sẽ bị quên sau vài ngày.

| Cột | Nội dung |
|---|---|
| Mã lỗi | Đánh số thứ tự: `FB-001`, `FB-002`, … (không dùng lại số cũ) |
| Ngày báo | Ngày nhận báo cáo |
| Người báo | Tên tester (không ghi thông tin nhạy cảm khác) |
| Mô tả ngắn | 1 câu, theo §4 mục 1 |
| Mức độ | Xem §5.2 |
| App version / Build | Build mà lỗi xảy ra |
| Máy / iOS | Theo §4 mục 7 |
| Bước tái hiện | Copy từ báo cáo, hoặc link tới form gốc |
| Crash log (Organizer) | Có/Không — nếu Có, ghi tên nhóm crash + ngày thấy trong Organizer |
| Trạng thái | Mới → Đang tái hiện → Đã tái hiện → Đang sửa → Đã sửa (chờ build) → Đã sửa (đã có build mới) → Đã xác nhận hết lỗi → Đóng |
| Build sửa | Số build chứa bản sửa (ví dụ `1.0 (4)`) |
| Ngày xác nhận | Ngày tester xác nhận lỗi đã hết |

### 5.2. Mức độ ưu tiên

| Mức | Định nghĩa | Xử lý |
|---|---|---|
| **P0 — Chặn** | Crash khi làm việc thường xuyên (mở app, lưu job, xem Hôm nay); mất dữ liệu (job/tiền biến mất); không mở được app | Sửa trước mọi việc khác; không submit build mới khi còn P0 chưa sửa |
| **P1 — Nặng** | Chức năng chính sai (tính tiền sai, nhắc lịch không kêu, nhập lịch thiếu sự kiện); có cách vòng vo nhưng rất bất tiện | Sửa trong build tiếp theo |
| **P2 — Vừa** | Chức năng phụ sai; giao diện hiển thị sai nhưng vẫn dùng được | Sửa trong 1–2 build tới, theo thứ tự |
| **P3 — Nhẹ** | Lỗi chính tả, giao diện lệch nhỏ, góp ý cải tiến | Gom lại sửa sau, không chặn release |

### 5.3. Các bước xử lý

**Bước 1 — Thu thập (ngay khi nhận báo cáo, trong ngày)**
- Ghi vào bảng §5.1, gán mã lỗi (`FB-xxx`) và mức độ (§5.2).
- Kiểm tra báo cáo có đủ 4 thứ tối thiểu không: (a) bước tái hiện, (b) phiên bản app/build, (c) máy + iOS, (d) ảnh/video. Thiếu thứ nào thì **hỏi lại ngay 1 lần, hỏi đủ cả 4 thứ thiếu trong cùng 1 tin nhắn** — không hỏi nhỏ giọt từng thứ.
- Ghi giờ xảy ra lỗi để đối chiếu Organizer.

**Bước 2 — Tái hiện (trước khi sửa)**
- Làm đúng theo từng bước tester ghi, trên cùng dòng máy/iOS nếu có, nếu không thì trên máy test sẵn có — và trên **đúng build** mà tester dùng (không tái hiện trên build mới hơn, vì lỗi có thể đã khác).
- Mở Xcode Organizer → Crashes, lọc đúng build, tìm nhóm crash trùng thời điểm tester báo. Ghi vào bảng: Có/Không thấy crash log.
- Kết quả chỉ có 3 loại, ghi rõ vào bảng:
  - **Đã tái hiện** — làm theo bước là lỗi xảy ra → sang Bước 3.
  - **Không tái hiện được** — thử đủ 3 lần trên 2 máy khác nhau vẫn không ra → báo lại tester: hỏi thêm (có làm gì khác trước đó không? máy còn dung lượng không? vừa cập nhật iOS không?), giữ trạng thái mở, **không đóng lỗi chỉ vì "máy mình không bị"**.
  - **Là hành vi đúng của app** (không phải lỗi, ví dụ: nút bị mờ vì chưa nhập đủ thông tin) → giải thích lại cho tester, ghi rõ lý do, đóng lỗi với trạng thái "Không phải lỗi — giải thích".

**Bước 3 — Sửa**
- Sửa theo nguyên nhân gốc tìm được từ bước tái hiện + stack trace trong Organizer (nếu có). Không sửa "đoán mò" khi chưa tái hiện được — trừ lỗi P0 mà stack trace đã chỉ rõ dòng code.
- Nếu crash log trong Organizer chỉ rõ file/dòng, đính kèm tên nhóm crash vào ghi chú sửa để lần sau tra cứu.
- Sau khi sửa, dev tự kiểm tra lại đúng các bước tái hiện ở Bước 2 trên bản debug trước khi đóng gói build mới.

**Bước 4 — Build mới**
- Tăng số build (Build number), **không cần tăng số version** nếu chỉ sửa lỗi (ví dụ: `1.0 (3)` → `1.0 (4)`).
- Upload lên TestFlight, ghi số build mới vào bảng §5.1 (cột "Build sửa").
- Ghi chú release nội bộ cho tester: liệt kê mã lỗi đã sửa trong build này (ví dụ: "Build 4 sửa FB-001, FB-003").

**Bước 5 — Báo lại tester & xác nhận**
- Nhắn cho tester đã báo lỗi: **mã lỗi + build mới đã sửa + nhờ kiểm tra lại đúng các bước cũ**.
- Tester kiểm tra lại trên build mới, trả lời 1 trong 2:
  - **Hết lỗi** → ghi ngày xác nhận, chuyển trạng thái "Đã xác nhận hết lỗi" → **Đóng**.
  - **Vẫn còn lỗi** → mở lại lỗi (giữ nguyên mã, tăng số lần tái phát), quay lại Bước 2 với thông tin mới. Không tạo mã lỗi mới cho cùng một lỗi chưa sửa xong.
- Quy tắc đóng lỗi: **chỉ tester/người báo mới được xác nhận "hết lỗi"**. Dev không tự đóng lỗi chỉ vì "mình đã sửa rồi".

### 5.4. Sơ đồ tóm tắt

```
Tester báo lỗi (form §4)
        ↓
Thu thập → ghi bảng §5.1, gán mã FB-xxx + mức độ (§5.2)
        ↓
Tái hiện đúng bước + đối chiếu Organizer (§2)
   ↙            ↓               ↘
Không tái hiện   Đã tái hiện    Không phải lỗi
(hỏi thêm,       (sửa)          (giải thích, đóng)
 giữ mở)
        ↓
Sửa → tự kiểm tra lại bước tái hiện
        ↓
Build mới (tăng Build number) → TestFlight
        ↓
Báo lại tester → tester kiểm tra lại
   ↙                ↘
Hết lỗi → Đóng    Vẫn lỗi → mở lại, quay về Tái hiện
```

---

## 6. Giới hạn — phải nói rõ với cả nhóm (v1)

1. **Không có báo cáo tự động.** Không SDK nào gửi crash về khi app sập. Nếu tester không báo và không ai mở Organizer, một crash có thể tồn tại nhiều ngày mà không ai biết. Lịch kiểm tra thủ công ở §2.5 là biện pháp duy nhất bù lại — bỏ lịch này là mất hoàn toàn khả năng phát hiện.
2. **Organizer không thấy mọi crash.** Chỉ thấy crash của người dùng đã bật "Chia sẻ với nhà phát triển ứng dụng" (§2.1) và chỉ sau độ trễ vài giờ tới 1–2 ngày (§2.3). Crash vừa xảy ra, crash trên máy tắt chia sẻ, và crash của bản debug/sideload đều **không** xuất hiện. Số liệu trong Organizer là **số tối thiểu**, không phải tổng số crash thật.
3. **Crash log không có ngữ cảnh.** Log cho biết app chết ở dòng code nào, không cho biết người dùng đang làm gì, đang nhập dữ liệu gì (§2.4). Lỗi không crash (tính tiền sai, nhắc lịch không kêu, giao diện sai) thì **không bao giờ** xuất hiện trong Organizer — chỉ có báo cáo thủ công mới phát hiện ra.
4. **Không có thống kê tự động.** Không có tỉ lệ crash (%), không có biểu đồ theo ngày, không có cảnh báo khi crash tăng đột biến. Mọi con số đều phải đếm tay từ Organizer và bảng §5.1.
5. **Không thu thập được dữ liệu người dùng để chẩn đoán.** Không có log thao tác, không có trạng thái app trước lúc crash. Với lỗi khó tái hiện, cách duy nhất là nhờ tester quay màn hình (§3.2 mục 6).
6. **Phụ thuộc vào tester.** Chất lượng phát hiện lỗi = chất lượng báo cáo của tester. Báo cáo thiếu bước tái hiện (§3.4 ví dụ ❌) sẽ làm chậm hoặc chặn hẳn việc sửa.

**Hướng cải thiện sau v1 (không làm ở v1, chỉ ghi để sau này quyết):** nếu số lượng người dùng tăng hoặc crash khó bắt bằng tay, cân nhắc thêm SDK crash reporting (ví dụ Sentry — mã nguồn mở, tự host được — hoặc Firebase Crashlytics) kèm cập nhật Privacy (ghi rõ SDK thu thập gì) và xin ý kiến người dùng. Quyết định này cần Việt chốt riêng; v1 giữ nguyên không-SDK theo đúng phạm vi đã định.

---

## 7. Checklist trước mỗi lần submit build (dán vào quy trình release)

- [ ] Đã mở Organizer → Crashes, lọc đúng build sắp thay thế, ghi lại nhóm crash còn mở vào bảng §5.1.
- [ ] Mọi lỗi P0 trong bảng đều đã có build sửa và đã được tester xác nhận hết (hoặc có lý do bằng văn bản nếu chưa).
- [ ] Khi upload build: tùy chọn **"Include app symbols" (dSYM)** đã được bật — nếu tắt, crash log sau này không symbolicate được (§2.2 bước 5).
- [ ] Số build đã tăng so với build trước; ghi chú TestFlight liệt kê mã lỗi đã sửa (FB-xxx).
- [ ] Đã nhắn tester của các lỗi vừa sửa: số build mới + nhờ kiểm tra lại (§5.3 Bước 5).

---

*Tài liệu này chỉ mô tả quy trình — không yêu cầu tạo tài khoản dịch vụ nào, không sửa code, không thêm SDK. Mọi thay đổi quy trình sau v1 cần cập nhật lại file này.*
