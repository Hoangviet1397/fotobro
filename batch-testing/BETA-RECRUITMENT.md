# FotoBro iOS v1 — Tuyển 10–20 photographer thử beta trên TestFlight

> **Ngày viết:** 20/11/2026. **Trạng thái:** bản kế hoạch — **chưa gửi thư
> mời thật, chưa tạo tài khoản, chưa mở link TestFlight.**
> **App:** FotoBro v1.0, Bundle ID `com.fotobro.app` — trợ lý cho
> photographer tự do, local-first, **Nấc 1 miễn phí**, không tài khoản,
> không máy chủ. Xem `README.md`, `APP-STORE-READY.md` và
> `TESTFLIGHT-CHECKLIST.md` (checklist test chi tiết trên iPhone thật)
> trước khi dùng file này.
>
> **Nguyên tắc xuyên suốt:** chỉ mời test đúng những gì **đã có trong
> build TestFlight gửi đi**. Không hứa tính năng chưa có — xem §10.

---

## 1. Mục tiêu của đợt beta

| Mục tiêu | Cách đo |
|---|---|
| Kiểm chứng app chạy được trên iPhone thật, nhiều máy / iOS khác nhau — không chỉ máy của Việt/Xèo | 10–20 tester cài được, mở app không crash ở màn đầu |
| Kiểm chứng 4 luồng chính ngoài đời thật: thêm job → pipeline 8 bước → ghi cọc/thu nốt → nhắc lịch | Mỗi tester hoàn thành ít nhất 1 job test đi hết 8 bước + 1 khoản cọc + 1 khoản thu nốt (theo `TESTFLIGHT-CHECKLIST.md` mục 1–3) |
| Kiểm chứng nhập Lịch iPhone native + (nếu kịp) đăng nhập Google 1 chạm trên máy thật | ≥ 70% tester nhập Lịch iPhone thành công; mục Google chỉ tính khi Client ID chung đã sẵn sàng (xem §10) |
| Tìm lỗi chặn (blocker) trước khi submit App Store | 0 lỗi mức **Chặn** còn mở khi kết thúc beta |
| Biết người dùng thật có hiểu và dùng được app trong 10 giây / tối đa 3 chạm không | Phản hồi định tính ở form cuối đợt (§9): ≥ 70% tester nói "dùng được ngay, không cần hướng dẫn dài" |

**Beta này KHÔNG phải để:** lấy ý tưởng tính năng mới, test đồng bộ
nhiều máy, test giọng nói, hay chạy marketing. Ý tưởng mới ghi lại vào
danh sách chờ v1.1+, không hứa làm.

**Tiêu chí đóng beta (đủ để sửa lỗi rồi submit):**

- 0 lỗi **Chặn** (không test tiếp được / mất dữ liệu).
- ≥ 10 tester đã gửi phản hồi cuối đợt (form §9).
- Các luồng Hôm nay / pipeline / sổ tiền / Lịch iPhone đã có ít nhất
  5 người test đạt trên máy thật.

---

## 2. Tuyển ai — tiêu chí chọn

### 2.1. Bắt buộc (thiếu 1 là loại)

| # | Tiêu chí | Vì sao |
|---|---|---|
| 1 | **Dùng iPhone** (iOS 15.0 trở lên — yêu cầu tối thiểu của app v1) và có **Apple ID** (email) để nhận lời mời TestFlight | Beta chỉ chạy trên iOS qua TestFlight; không có bản Android, không có bản web để test thay |
| 2 | **Là photographer tự do / studio nhỏ đang nhận job thật** (chụp để kiếm tiền, không chỉ chụp chơi) | App làm cho người quản job + thu tiền thật; người không nhận job sẽ không test được luồng tiền/cọc |
| 3 | Sẵn sàng **test trong 2 tuần** và **gửi phản hồi bằng văn bản** (form + ảnh chụp màn hình khi gặp lỗi) | Beta không có giá trị nếu chỉ cài rồi không dùng, không báo lỗi |
| 4 | Đồng ý **chỉ dùng dữ liệu hư cấu khi test** (tên khách giả, số tiền giả) và **không nhập job/tiền/ảnh khách thật** vào bản beta | Bảo vệ khách thật của tester + tránh rò rỉ dữ liệu khi app còn lỗi; xem §11 |
| 5 | Hiểu và chấp nhận: đây là **bản beta, có thể lỗi, có thể mất dữ liệu test** — phải sao lưu JSON trước khi nhập dữ liệu gì quan trọng | Nấc 1 local-first, chưa có CloudKit; mất máy + mất file sao lưu = mất dữ liệu |

### 2.2. Ưu tiên (càng đủ nhiều càng tốt — để phủ đủ các nhánh)

| Tiêu chí | Mục tiêu phủ |
|---|---|
| **Loại job chụp đa dạng:** Portrait, Couple, Wedding, Lookbook, Event | Mỗi loại có **ít nhất 2 tester** chụp loại đó thường xuyên (xem bảng quota §3) |
| **Chụp film / digital / cả hai** | Ít nhất **3 tester chụp film** (kể cả chỉ thỉnh thoảng) để test bảng giá film + ô Digital/Film/Cả hai; ít nhất 5 tester digital thuần |
| **Tần suất job:** ít nhất 2–3 job/tháng | Người chụp quá ít sẽ không đi hết pipeline trong 2 tuần |
| **Nhiều đời máy / iOS:** iPhone đời cũ (iOS 15–16) + đời mới (iOS 17–26), màn hình nhỏ + Pro Max | Phát hiện lỗi hiển thị theo cỡ màn (lỗi từng gặp: tab dưới bị che, chữ bị cắt) |
| **Biết dùng cả tiếng Việt và tiếng Anh** (ít nhất 3–4 tester) | Test được phần ngôn ngữ VI/EN trong Cài đặt |
| **Có dùng Google Lịch / Gmail cho việc chụp** (ít nhất 5 tester) | Chỉ nhóm này mới test được luồng Google — và chỉ khi Google đã sẵn sàng (§10) |
| **Ở Việt Nam** (ưu tiên; chấp nhận 1–2 tester ở nước ngoài nếu dùng VND/USD) | Khung giờ nhắc lịch, múi giờ, ngôn ngữ và thói quen thu cọc giống người dùng mục tiêu đầu tiên |

### 2.3. Loại trừ — đừng mời (dù họ nhiệt tình)

- Chỉ dùng **Android** hoặc không có iPhone.
- Cần **đồng bộ nhiều máy / làm nhóm nhiều người** ngay ở v1 — đó là
  Nấc 2/3, **chưa có ở v1** (chỉ placeholder CloudKit, xem §10).
- Cần **ra lệnh bằng giọng nói** để dùng app — mic **dời sang v1.1**.
- Cần **nhập lịch bằng file .ics/.zip** — đã **bỏ hẳn ở v1**, chỉ còn
  nhập Lịch iPhone native + Google.
- Muốn app **tự đăng bài / tự nhắn khách / tự quản fanpage** — v1 chỉ
  soạn sẵn mẫu tin nhắn/email, không tự gửi, không kết nối mạng xã hội.
- Không có thời gian test trong 2 tuần tới (hẹn đợt sau, cho vào danh
  sách chờ — xem §6.3).

---

## 3. Số lượng và quota — 10–20 người, tuyển theo 2 đợt

Tổng **10–20 tester**. Tuyển theo đợt để sửa lỗi đợt 1 trước khi mở
rộng, thay vì mời 20 người cùng lúc vào một bản còn lỗi chặn.

| Đợt | Ai | Số lượng | Cách mời (TestFlight) | Điều kiện mở đợt |
|---|---|---|---|---|
| **Đợt 1 — nội bộ** | Xèo (tester #1) + 4–5 photographer thân cận, quen Việt/Xèo, liên lạc được trực tiếp | **5–6 người** | **Internal Testing** trong App Store Connect (thêm bằng Apple ID, tối đa 100 người, **không cần Apple duyệt beta** — build lên là mời được ngay) | Build 1.0 đã lên TestFlight, chạy được màn Hôm nay |
| **Đợt 2 — mở rộng** | Photographer ngoài, tuyển qua kênh §4 | **5–14 người** (để tổng 10–20) | **External Testing** (mời bằng email hoặc link công khai; build đầu tiên gửi tester ngoài **cần qua Beta App Review của Apple** — thường ~1 ngày, tính vào lịch) | Hết lỗi **Chặn** ở đợt 1; đã có ít nhất 3 người đợt 1 đi hết pipeline |

**Quota theo loại job (tính trên tổng 10–20 người — một người có thể
chụp nhiều loại, đếm trùng được):**

| Loại job | Tối thiểu | Ghi chú |
|---|---|---|
| Portrait | 2 | Loại phổ biến nhất, bảng giá mặc định 2,5tr (digital) |
| Couple | 2 | |
| Wedding | 2 | Job giá lớn, luồng cọc/thu nốt quan trọng nhất |
| Lookbook | 2 | |
| Event | 2 | |
| Chụp film (bất kỳ loại nào) | 3 | Kể cả film thỉnh thoảng; test bảng giá film (mặc định trống = chưa đặt) |
| Dùng Google Lịch/Gmail cho việc chụp | 5 | Chỉ nhóm này test mục Google |

Nếu một loại job thiếu người, **đừng hạ tiêu chí để đủ số** — thiếu thì
ghi rõ vào báo cáo cuối đợt là "chưa phủ được loại X", hẹn đợt beta
sau, thay vì mời người không phù hợp cho đủ 20.

---

## 4. Kênh tìm tester

### 4.1. Kênh chính (theo thứ tự ưu tiên)

| Kênh | Cách làm | Lưu ý |
|---|---|---|
| **1. Người quen của Việt/Xèo** (photographer từng hợp tác, bạn nghề) | Nhắn trực tiếp (Messenger/Zalo/Instagram DM) kèm thư mời §6 | Tỉ lệ đồng ý cao nhất, phản hồi thật nhất — lấp đủ đợt 1 từ đây |
| **2. Nhóm Facebook photographer Việt Nam** (nhóm về portrait, wedding, lookbook, film, studio nhỏ) | Đăng 1 bài theo mẫu §12, **sau khi hỏi phép admin** nếu nhóm có quy định; chỉ đăng ở 2–3 nhóm phù hợp nhất, không đăng tràn lan | Không spam nhiều nhóm cùng lúc; không đăng link TestFlight công khai trong bài (chỉ để form sàng lọc §5) — link TestFlight chỉ gửi riêng cho người đã chọn |
| **3. Instagram** | Story + 1 post trên tài khoản của Xèo/Sadako Photography (và của Việt nếu có), kèm form sàng lọc; nhắn DM cho photographer hay tương tác | Nhắm tới người đã quen phong cách làm việc của Xèo — họ hiểu app làm cho ai |
| **4. Giới thiệu từ tester đợt 1** | Cuối tuần 1, hỏi mỗi tester đợt 1: "giới thiệu giúp 1 photographer nữa phù hợp tiêu chí §2 không?" | Nguồn tốt nhất cho đợt 2 — người được giới thiệu thường giống người giới thiệu |

### 4.2. Quy tắc khi đăng bài / nhắn tin

- Đăng đúng **1 bài / 1 nhóm**, không đăng lại nhiều lần, không nhờ
  nhiều tài khoản đăng cùng nội dung.
- Tiêu đề nói rõ **"thử beta miễn phí, 2 tuần, iPhone"** — để người
  không có iPhone tự loại ngay, đỡ mất công sàng lọc.
- Không ghi số tiền thù lao (beta này **không trả tiền** — xem §6),
  không hứa "bản chính thức sẽ miễn phí tính năng X".
- Mọi phản hồi về bài đăng đều trả lời bằng link **form sàng lọc**
  (§5), không thu thập Apple ID/email ngay trong comment/inbox công
  khai.

---

## 5. Quy trình tuyển — 5 bước

| Bước | Việc làm | Ai làm | Xong khi |
|---|---|---|---|
| **1. Đăng / nhắn** | Đăng bài (§12) ở 2–3 nhóm + story Instagram + nhắn người quen | Việt (hoặc Xèo) | Bài đã đăng, form sàng lọc đã mở |
| **2. Sàng lọc** | Người quan tâm điền **form sàng lọc** (Google Form — tạo mới, xem câu hỏi dưới). Loại ngay người không đạt tiêu chí bắt buộc §2.1 | Việt | Có danh sách 10–20 người đạt + danh sách chờ |
| **3. Chọn + xác nhận** | Chọn đủ quota §3, gửi **thư mời** (§6) cho người được chọn, gửi **thư chờ/từ chối** (§6.3) cho người còn lại. Hẹn hạn trả lời: **48 giờ** — quá hạn không trả lời thì mời người trong danh sách chờ | Việt | Đủ 10–20 người đã xác nhận "tham gia" + đã gửi Apple ID |
| **4. Mời TestFlight** | Thêm Apple ID vào nhóm Internal (đợt 1) / External (đợt 2) trong App Store Connect, gửi kèm **hướng dẫn cài** (§7) + **checklist test** (`TESTFLIGHT-CHECKLIST.md`) + link **form phản hồi** (§9) | Việt | Tester báo "đã cài được, mở được app" |
| **5. Theo dõi** | Nhắc nhẹ 2 lần/tuần (§8), thu phản hồi, sửa lỗi, ra build mới nếu có lỗi chặn | Việt + agent làm app | Kết thúc 2 tuần, có báo cáo tổng kết (§9.4) |

### Câu hỏi sàng lọc (đưa vào Google Form — 2 phút điền)

1. Tên + studio (nếu có)? *(bắt buộc)*
2. Email Apple ID để nhận lời mời TestFlight? *(bắt buộc — chỉ dùng
   để mời beta, không dùng việc khác)*
3. iPhone model + phiên bản iOS? *(bắt buộc — vd: iPhone 13, iOS 18.5;
   kiểm tra: Cài đặt → Cài đặt chung → Giới thiệu)*
4. Loại job chụp thường xuyên nhất? *(chọn nhiều: Portrait / Couple /
   Wedding / Lookbook / Event / khác)*
5. Chụp bằng gì? *(Digital / Film / Cả hai)*
6. Trung bình mấy job/tháng? *(< 1 / 2–3 / 4–8 / > 8)*
7. Có dùng Google Lịch và/hoặc Gmail cho việc chụp không? *(Có/Không)*
8. Ngôn ngữ muốn test? *(Tiếng Việt / Tiếng Anh / Cả hai)*
9. Trong 2 tuần tới, bạn dành được khoảng bao nhiêu thời gian test
   app? *(< 1 giờ / 1–2 giờ / > 2 giờ — dưới 1 giờ thì hẹn đợt sau)*
10. Bạn đã từng test beta app nào chưa? *(không bắt buộc phải có kinh
    nghiệm — chỉ để biết cần hướng dẫn kỹ tới đâu)*
11. Bạn có đồng ý chỉ dùng dữ liệu hư cấu khi test, không nhập
    job/tiền/ảnh khách thật không? *(Có — bắt buộc tích Có mới được
    chọn)*

---

## 6. Thư mời mẫu

### 6.1. Thư mời chính (tiếng Việt — gửi riêng cho từng người đã chọn)

> **Tiêu đề:** Mời bạn thử beta FotoBro — trợ lý studio ảnh trên iPhone (2 tuần)
>
> Chào [Tên],
>
> Mình là Việt — đang làm **FotoBro**, app trợ lý cho photographer tự
> do trên iPhone: xem Hôm nay có gì (chụp ai, mấy giờ, thu bao nhiêu),
> job đi theo 8 bước từ Tư vấn tới Xong, sổ tiền + báo cáo, nhắc trước
> giờ chụp và hạn giao ảnh. App **miễn phí ở bản này, không tài khoản,
> dữ liệu chỉ ở trên máy bạn**.
>
> Mình mời bạn thử **bản beta trên TestFlight trong 2 tuần** (từ
> [ngày bắt đầu] tới [ngày kết thúc]). Bạn là 1 trong 10–20
> photographer được mời đợt này.
>
> **Bạn cần có:** iPhone (iOS 15 trở lên) + Apple ID (email bạn đã
> gửi ở form). Mình sẽ gửi lời mời TestFlight tới email đó.
>
> **Bạn cần làm:** cài app theo hướng dẫn kèm theo, dùng app với
> **dữ liệu hư cấu** (tên khách giả, số tiền giả — đừng nhập job/tiền/
> ảnh khách thật), đi hết 1 job từ Tư vấn tới Xong, ghi 1 khoản cọc
> và 1 khoản thu nốt, nhập thử 1 buổi chụp từ Lịch iPhone. Cuối đợt
> điền 1 form phản hồi ngắn (5 phút). Tổng cộng khoảng 1–2 giờ trong
> 2 tuần.
>
> **Cần nói rõ trước — những gì bản này CHƯA có:**
> - **Chưa có ra lệnh bằng giọng nói** (nút mic nếu có cũng chưa dùng
>   được — giọng nói sẽ có ở bản v1.1).
> - **Chưa đồng bộ giữa các máy** — dữ liệu chỉ ở trên iPhone của
>   bạn; muốn giữ thì xuất file sao lưu JSON trong Cài đặt.
> - **Đăng nhập Google** (Lịch/Gmail/Danh bạ/Drive) chỉ bật khi
>   FotoBro xong bước xác minh với Google; nếu tới lúc bạn test mà
>   chưa xong thì nút Google sẽ tạm ẩn — bạn cứ test phần còn lại
>   bình thường, đó không phải lỗi.
> - **Không nhập lịch bằng file .ics/.zip** — bản này chỉ nhập từ
>   Lịch iPhone và Google.
>
> Beta có thể lỗi và có thể mất dữ liệu test — nên đừng dùng bản beta
> làm sổ thật. Gặp lỗi thì chụp màn hình + ghi lại các bước làm, gửi
> vào form phản hồi (link kèm theo thư này).
>
> Nếu bạn đồng ý, chỉ cần trả lời "Đồng ý" cho mình trong 48 giờ.
> Cảm ơn bạn rất nhiều!
>
> Việt — FotoBro

### 6.2. Bản ngắn tiếng Anh (cho tester nước ngoài / tester muốn test bản EN)

> **Subject:** Invitation to beta-test FotoBro — photo studio assistant for iPhone (2 weeks)
>
> Hi [Name],
>
> I'm Viet, building **FotoBro**, an iPhone assistant for freelance
> photographers: see Today (who you shoot, when, how much to
> collect), jobs in 8 steps from Consult to Done, money ledger +
> reports, and reminders before shoots and delivery deadlines. This
> version is **free, no account, data stays on your device**.
>
> I'd like to invite you to a **2-week TestFlight beta** (from [start
> date] to [end date]). You're one of 10–20 photographers invited.
>
> **You need:** an iPhone (iOS 15+) and the Apple ID email you gave
> in the form. I'll send the TestFlight invite to that email.
>
> **What to do:** install via the guide attached, test with **made-up
> data only** (fake client names and amounts — please don't enter real
> client jobs, money or photos), take one job from Consult to Done,
> record one deposit and one final payment, and import one shoot from
> iPhone Calendar. Fill in one short feedback form at the end
> (5 minutes). About 1–2 hours total over 2 weeks.
>
> **Not in this version, so please don't expect it:**
> - **No voice commands yet** (voice comes in v1.1).
> - **No sync between devices** — data stays on your iPhone; export a
>   JSON backup in Settings if you want to keep it.
> - **Google sign-in** (Calendar/Gmail/Contacts/Drive) only turns on
>   once our Google verification is done; if it's not ready when you
>   test, the Google button will be hidden — that's expected, not a bug.
> - **No calendar import from .ics/.zip files** — iPhone Calendar and
>   Google only.
>
> Beta software can crash and test data can be lost — please don't use
> it as your real ledger. If you hit a bug, take a screenshot, note
> the steps, and send it in the feedback form.
>
> If you're in, just reply "Yes" within 48 hours. Thank you!
>
> Viet — FotoBro

### 6.3. Thư cho người chưa được chọn / danh sách chờ

> Chào [Tên], cảm ơn bạn đã đăng ký thử beta FotoBro. Đợt này mình chỉ
> mời được 10–20 người để theo sát phản hồi, nên chưa mời được bạn
> đợt này. Mình đã đưa bạn vào **danh sách chờ** — nếu có người rút
> hoặc đợt beta sau mở, mình sẽ nhắn bạn trước. Cảm ơn bạn đã quan tâm!

---

## 7. Hướng dẫn cài TestFlight (gửi kèm thư mời)

> Gửi nguyên đoạn này cho tester. Viết cho người chưa từng dùng
> TestFlight bao giờ.

### 7.1. Trước khi cài

- iPhone chạy **iOS 15.0 trở lên** (kiểm tra: Cài đặt → Cài đặt chung →
  Giới thiệu → Phiên bản iOS).
- Còn ít nhất **500 MB** trống.
- Biết **email Apple ID** của mình (email đã gửi ở form sàng lọc —
  lời mời sẽ gửi tới đúng email đó).
- Cần mạng Wi-Fi/4G để tải app.

### 7.2. Cài đặt — 4 bước

1. **Cài app TestFlight** (miễn phí, của Apple): mở App Store trên
   iPhone → tìm `TestFlight` → Cài đặt. (Nếu đã có TestFlight thì bỏ
   qua bước này.)
2. **Mở email mời** (từ Apple / TestFlight, tiêu đề có chữ
   `TestFlight` + `FotoBro`) trên iPhone → bấm **View in TestFlight**
   (Xem trong TestFlight). Nếu không thấy email, kiểm tra hộp Thư rác
   / Quảng cáo, hoặc nhắn cho Việt để gửi lại.
   - *Đợt 2 (link công khai):* bấm thẳng link TestFlight Việt gửi →
     bấm **Accept** (Chấp nhận) → mở trong TestFlight.
3. Trong TestFlight, bấm **Install** (Cài đặt) ở app FotoBro → chờ tải
   xong → bấm **Open** (Mở).
4. Mở lần đầu: bấm **Bắt đầu sổ trống — dùng thật** để vào màn hình
   **Hôm nay**. App sẽ hỏi quyền: **Lịch** (để nhập buổi chụp),
   **Ảnh** (để chọn ảnh trang chủ/logo), **Thông báo** (để nhắc giờ
   chụp) — cứ bấm **Cho phép** khi test; muốn test trường hợp từ chối
   quyền thì xem `TESTFLIGHT-CHECKLIST.md` mục 4.4.

### 7.3. Trong 2 tuần test

- **Cập nhật bản mới:** khi có build mới, TestFlight sẽ báo — mở
  TestFlight → FotoBro → **Update** (Cập nhật). Luôn test trên bản
  mới nhất.
- **App hết hạn:** bản TestFlight hết hạn sau **90 ngày** kể từ ngày
  build — beta này chỉ kéo dài 2 tuần nên không lo hết hạn giữa đợt;
  sau beta, app beta sẽ tự hết hiệu lực khi bản chính thức lên App
  Store (cài lại bản chính thức khi đó).
- **Gửi phản hồi nhanh từ TestFlight:** trong app FotoBro, **chụp màn
  hình** lúc gặp lỗi → mở app TestFlight → FotoBro → **Send Feedback**
  (Gửi phản hồi) → đính kèm ảnh chụp màn hình + ghi ngắn gọn lỗi là
  gì. (Crash của app Apple tự gửi báo cáo về — bạn không cần làm gì
  thêm khi app crash.)
- **Rời beta bất cứ lúc nào:** mở TestFlight → FotoBro → **Stop
  Testing** (Ngừng test) hoặc xoá app khỏi iPhone. Dữ liệu test chỉ ở
  trên máy bạn — xoá app là mất; muốn giữ thì xuất file sao lưu JSON
  trong Cài đặt trước khi xoá (Cài đặt → Tải bản sao lưu).

### 7.4. Nếu cài không được

| Triệu chứng | Làm gì |
|---|---|
| Không nhận được email mời | Kiểm tra Thư rác; xác nhận lại email Apple ID đã gửi có đúng không; nhắn Việt gửi lại |
| Bấm link mời báo "beta đã đầy" / "không chấp nhận thêm tester" | Nhắn Việt ngay — có thể link đợt 2 đã đóng khi đủ 20 người; bạn sẽ vào danh sách chờ |
| TestFlight báo "cần iOS mới hơn" | iPhone của bạn dưới iOS 15 — không test được đợt này, hẹn bản sau |
| Cài xong mở app bị văng / màn trắng | Chụp màn hình (nếu chụp được) + ghi model iPhone + iOS, gửi cho Việt; thử xoá app, cài lại từ TestFlight 1 lần |

---

## 8. Thời gian test — 2 tuần

Ngày bắt đầu tính từ **ngày build TestFlight gửi tới tester đợt 1**
(không ấn định ngày cố định trong file này — build chưa lên
TestFlight). Lịch tương đối:

| Thời điểm | Việc | Ai |
|---|---|---|
| **Tuần 0 — chuẩn bị** (trước ngày bắt đầu 2–3 ngày) | Build lên TestFlight; chốt Google **bật hay tắt** ở bản beta này (§10); gửi thư mời + hướng dẫn §7 cho đợt 1 | Việt |
| **Ngày 1–2** | Tester cài app, vào được màn Hôm nay, báo "đã cài được" | Tester → Việt |
| **Tuần 1 — luồng lõi** | Mỗi tester: tạo 2–3 job (đủ loại mình hay chụp, gồm 1 job Film nếu chụp film) → đi hết 8 bước 1 job → ghi cọc → thu nốt → xem báo cáo tuần. Làm theo `TESTFLIGHT-CHECKLIST.md` mục 0–3, 11 | Tester |
| **Cuối tuần 1** | Việt tổng hợp lỗi tuần 1; sửa lỗi **Chặn**; ra build mới nếu cần; **mở đợt 2** (gửi mời cho 5–14 người còn lại) khi hết lỗi chặn | Việt + agent làm app |
| **Tuần 2 — lịch + Google + cá nhân hoá** | Tester: nhập Lịch iPhone 1 chạm → xuất 1 buổi chụp sang Lịch iPhone → (chỉ nếu Google đã bật) đăng nhập Google 1 chạm → đổi màu chủ đề/logo/ngôn ngữ/tiền tệ → khoá Face ID/PIN → sao lưu JSON. Làm theo `TESTFLIGHT-CHECKLIST.md` mục 4–9 | Tester |
| **Ngày cuối (ngày 14)** | Tester điền **form phản hồi cuối đợt** (§9.3) — hạn chót 48 giờ sau ngày kết thúc | Tester |
| **Sau beta 3–5 ngày** | Việt tổng hợp: bảng lỗi + quyết định sửa trước submit + nhắn cảm ơn tester + thông báo đợt beta sau (nếu có) | Việt |

**Nhắc tester (không nhắc quá nhiều):**

- Ngày 3: nhắn chung 1 lần — "Bạn cài được app chưa? Có kẹt ở bước
  nào không?"
- Ngày 7: nhắc "Tuần 1 xong chưa? Gửi giúp mình lỗi gặp được tới giờ."
- Ngày 12: nhắc "Còn 2 ngày nữa hết beta — nhớ điền form phản hồi
  cuối đợt nhé."
- Nhắc qua **1 kênh duy nhất** đã hẹn trước với tester (email hoặc
  nhóm chat chung) — không nhắn riêng từng người nhiều lần.

---

## 9. Cách thu phản hồi

### 9.1. Kênh phản hồi (theo thứ tự dùng)

| Kênh | Dùng cho | Ghi chú |
|---|---|---|
| **1. Google Form phản hồi** (tạo mới — 1 form cho lỗi, 1 form cuối đợt, xem §9.2–9.3) | Mọi lỗi + phản hồi cuối đợt | Kênh chính — mọi lỗi đều phải có 1 dòng trong form để không thất lạc trong chat |
| **2. TestFlight → Send Feedback** (kèm ảnh chụp màn hình) | Lỗi gặp đúng lúc đang dùng app | Nhanh nhất khi đang cầm máy; vẫn nên ghi lại vào form lỗi nếu là lỗi nặng |
| **3. Nhóm chat chung / email** | Hỏi nhanh ("cài không được", "không hiểu nút này"), nhắc lịch | Chỉ hỏi đáp — lỗi thật vẫn phải ghi vào form |
| **4. Crash report tự động** (Apple gửi về App Store Connect) | App crash/văng | Tester không cần làm gì; Việt kiểm tra trong App Store Connect |

### 9.2. Mẫu báo lỗi (đưa vào form lỗi — tester chỉ cần điền đúng mẫu này)

> **Bắt buộc có 4 thứ, thiếu là Việt phải hỏi lại:**
>
> 1. **Máy + iOS + bản build:** vd: iPhone 13, iOS 18.5, FotoBro 1.0 (build 1) — xem số build trong TestFlight.
> 2. **Đang làm gì thì lỗi:** vd: "Đang ở bước Đã giao, bấm thu nốt 1.500.000đ."
> 3. **Thấy gì (khác mong đợi thế nào):** ghi đúng chữ app hiện, vd:
>    "App hiện 'Đã lưu' nhưng quay lại vẫn thấy còn thiếu 1.500.000đ."
> 4. **Ảnh chụp màn hình / quay màn hình** (nếu có).
>
> **Mức độ (tester tự chọn 1):**
> - **Chặn** — không test tiếp được / mất dữ liệu / app crash liên tục.
> - **Nặng** — tính năng chính không làm được (vd: không tạo được job,
>   không ghi được tiền).
> - **Nhẹ** — chữ sai, lệch giao diện, dùng được nhưng khó chịu.
> - **Góp ý** — không phải lỗi, chỉ là "giá mà có thêm…" (ghi vào danh
>   sách chờ v1.1+, không hứa làm).
>
> **Khu vực:** Hôm nay / Thêm job / Pipeline / Sổ tiền / Lịch iPhone /
> Google / Cài đặt – cá nhân hoá / Khoá / Sao lưu / Khác.

### 9.3. Form phản hồi cuối đợt (5 phút — gửi ngày 12, hạn ngày 14 + 48 giờ)

1. Bạn đã đi hết 1 job từ Tư vấn tới Xong chưa? *(Rồi/Chưa — nếu chưa,
   kẹt ở bước nào?)*
2. Bạn đã ghi được khoản cọc + khoản thu nốt chưa? *(Rồi/Chưa)*
3. Nhập Lịch iPhone có thành công không? *(Rồi/Không — lỗi gì?)*
4. (Chỉ nếu Google đã bật) Đăng nhập Google có thành công không?
   *(Rồi/Không — lỗi gì?/Không test)*
5. Tính năng nào bạn thấy **hữu ích nhất**? Tính năng nào **khó hiểu
   nhất**?
6. Mở app là bạn có biết hôm nay phải làm gì không? *(Có ngay / Phải
   mò một lúc / Không)*
7. Bạn có sẵn sàng **dùng tiếp bản chính thức** khi lên App Store
   không? *(Có/Không — vì sao?)*
8. Có lỗi nào bạn gặp mà chưa báo ở form lỗi không? *(ghi ngắn gọn)*
9. Góp ý khác (tùy ý, không bắt buộc).

### 9.4. Sau beta — Việt tổng hợp

- Bảng lỗi: tổng số lỗi theo mức (Chặn/Nặng/Nhẹ) + theo khu vực;
  lỗi nào đã sửa ở build nào, lỗi nào dời v1.1.
- Tỉ lệ hoàn thành: bao nhiêu tester đi hết pipeline / ghi đủ cọc–thu
  nốt / nhập Lịch thành công.
- Kết luận 1 trong 3: **(a)** đủ để sửa lỗi rồi submit · **(b)** cần
  sửa lỗi chặn rồi test lại 1 vòng ngắn · **(c)** cần thêm 1 đợt beta
  nữa (ghi rõ thiếu phủ loại job nào).
- Nhắn cảm ơn từng tester + cho biết app đã lên App Store (khi có)
  — **không hứa tặng tính năng trả phí** (Nấc 2/3 chưa chốt giá/chu
  kỳ, xem §10).

---

## 10. Những gì KHÔNG hứa với tester (đọc trước khi gửi thư mời)

Bảng này là cam kết với tester — **đừng viết gì trong thư mời, bài
đăng hay tin nhắn trái với bảng này.**

| Tính năng | Trạng thái ở bản beta v1 | Nói với tester thế nào |
|---|---|---|
| Hôm nay, thêm job, pipeline 8 bước (nhảy bước, tiền gắn bước, Huỷ/khôi phục, job kẹt báo lên Hôm nay) | **Có** | Test kỹ, đây là lõi của app |
| Sổ tiền + báo cáo ngày/tuần/tháng, bảng giá digital/film | **Có** | Test kỹ; giá film mặc định trống (chưa đặt) là đúng, không phải lỗi |
| Nhập Lịch iPhone native 1 chạm, xuất "Thêm vào Lịch iPhone" | **Có** | Test kỹ — chỉ có trên app iOS thật |
| Nhắc trước giờ chụp 60 phút, trước hạn giao 1 ngày | **Có** | Ghi rõ có/không nhận được nhắc (xem checklist mục 11.2) |
| Cá nhân hoá: 3 màu chủ đề, logo studio, sửa mẫu tin nhắn + khôi phục gốc, VI/EN, VND/USD (chỉ đổi hiển thị) | **Có** | Test được |
| Khoá Face ID/PIN, sao lưu JSON | **Có** | Test được; sao lưu là file JSON trên máy, chưa phải đồng bộ |
| **Đăng nhập Google 1 chạm** (Lịch/Gmail/Danh bạ/Drive) | **CÓ ĐIỀU KIỆN — chỉ bật khi Client ID chung + xác minh Google đã xong.** Nếu chưa xong lúc beta: nút Google tạm ẩn, tester test phần còn lại bình thường — **đó không phải lỗi** | Nói rõ trong thư mời (§6) đúng câu này; đừng hứa "sắp có trong tuần" nếu chưa có ngày xác minh cụ thể |
| **Giọng nói / mic** | **CHƯA CÓ — dời sang v1.1.** Plugin speech-recognition không tương thích Capacitor 8; nút mic (nếu còn hiện) chỉ báo "sẽ có ở bản v1.1" | Đừng để tester tưởng mic hỏng — nói trước là chưa có |
| **Đồng bộ CloudKit (Nấc 2), làm nhóm/studio (Nấc 3)** | **CHƯA CÓ — chỉ placeholder `not-configured` ở v1** | Đừng test đồng bộ; đừng hứa ngày có |
| **Thu phí / mua trong app (IAP)** | **CHƯA CÓ — v1 miễn phí, không IAP** | Đừng hứa "tester được miễn phí Nấc 2/3" — giá Nấc 2/3 chưa chốt |
| **Nhập lịch bằng file .ics/.zip** | **ĐÃ BỎ HẲN ở v1** | Đừng hướng dẫn tester nhập file; chỉ Lịch iPhone + Google |
| Checklist theo bước, bảng Kanban kéo thả | **CHƯA CÓ** | Ghi vào danh sách chờ, không hứa v1 |
| Android, bản web dùng thay app | **KHÔNG CÓ** | Beta chỉ trên iPhone qua TestFlight |

**Nếu tới lúc beta mà Google chưa kịp:** sửa thư mời §6 trước khi gửi
— xoá câu "đăng nhập Google 1 chạm" khỏi phần "bạn cần làm", giữ
nguyên câu "nút Google tạm ẩn là đúng, không phải lỗi". Đừng gửi thư
mời hứa Google rồi mới phát hiện chưa có Client ID.

---

## 11. Quyền riêng tư và an toàn dữ liệu khi test

- **Dữ liệu test là hư cấu.** Tester dùng tên khách giả (vd: "Test
  Portrait", "Test Wedding"), số tiền giả, ảnh trang chủ chung — không
  nhập job/ảnh/tiền thật của khách. Test xong thì xoá dữ liệu test
  hoặc khôi phục bằng bản sao lưu cũ (xem `TESTFLIGHT-CHECKLIST.md`
  mục 12).
- **Dữ liệu chỉ ở trên máy tester.** FotoBro v1 không có máy chủ,
  không tài khoản, không gửi job/tiền của tester về đâu. Apple chỉ
  nhận crash report ẩn danh qua TestFlight.
- **Đừng test bằng tài khoản Google chính** có email khách quan trọng
  nếu chưa rõ quyền — dùng tài khoản Google test trước (xem
  `TESTFLIGHT-CHECKLIST.md` đầu file).
- **Form sàng lọc / phản hồi** chỉ thu: tên, email Apple ID, model
  máy, thói quen chụp — không thu số điện thoại, địa chỉ, CCCD, tài
  khoản ngân hàng hay bất kỳ thông tin khách hàng nào của tester.
- **Tester được rời beta bất cứ lúc nào** (§7.3), xoá app là sạch dữ
  liệu test trên máy.
- **Ảnh chụp màn hình gửi kèm báo lỗi:** nhắc tester kiểm tra trước
  khi gửi — không gửi ảnh có tên/email/số điện thoại thật của khách.

---

## 12. Mẫu bài đăng tìm tester (Facebook / Instagram)

> Đăng sau khi đã có form sàng lọc (§5) và build đã lên TestFlight.
> Điền [ngày] trước khi đăng. Không đính kèm link TestFlight trong bài.

**Tiêu đề:** [BETA TEST] Tìm 10–20 photographer dùng iPhone thử app
quản job chụp — miễn phí, 2 tuần

> Mình đang làm **FotoBro** — app iPhone giúp photographer tự do quản
> job chụp: hôm nay chụp ai, mấy giờ, thu bao nhiêu; job đi theo 8
> bước từ Tư vấn tới Xong; sổ tiền + báo cáo; nhắc trước giờ chụp.
> App miễn phí, không tài khoản, dữ liệu chỉ ở trên máy bạn.
>
> Mình cần **10–20 photographer dùng iPhone** thử bản beta trên
> TestFlight trong **2 tuần** (từ [ngày] tới [ngày]).
>
> **Bạn phù hợp nếu:**
> - Dùng iPhone (iOS 15 trở lên), có Apple ID
> - Đang nhận job chụp thật (portrait / couple / wedding / lookbook /
>   event — digital hay film đều được)
> - Có 1–2 giờ trong 2 tuần để test + gửi phản hồi
>
> **Bạn sẽ làm:** cài app qua TestFlight, test bằng dữ liệu giả (không
> nhập job khách thật), đi hết 1 job 8 bước, ghi thử cọc + thu nốt,
> nhập thử buổi chụp từ Lịch iPhone, điền 1 form phản hồi cuối đợt.
>
> **Lưu ý trước:** bản này **chưa có ra lệnh bằng giọng nói** (sẽ có ở
> bản sau) và **chưa đồng bộ giữa các máy**. Đăng nhập Google chỉ bật
> khi xong bước xác minh với Google — nếu chưa kịp thì bạn cứ test
> phần còn lại bình thường.
>
> Quan tâm thì điền form này (2 phút): [link Google Form sàng lọc]
>
> Cảm ơn mọi người!

---

## 13. Checklist vận hành — Việt tick trước khi gửi thư mời đầu tiên

- [ ] Build 1.0 đã lên TestFlight, mở được màn Hôm nay trên iPhone thật
- [ ] Đã chốt: Google ở bản beta này **BẬT hay TẮT** — và thư mời §6 đã
      sửa khớp với quyết định đó (xem §10)
- [ ] Form sàng lọc (§5) đã tạo, đã test điền thử 1 lần
- [ ] Form lỗi (§9.2) + form phản hồi cuối đợt (§9.3) đã tạo
- [ ] Bài đăng §12 đã có link form sàng lọc (không có link TestFlight)
- [ ] Đã gửi thư mời đợt 1 (Xèo + 4–5 người thân cận) kèm hướng dẫn
      §7 + `TESTFLIGHT-CHECKLIST.md`
- [ ] Đã hẹn 1 kênh nhắc tester duy nhất (email / nhóm chat) và lịch
      nhắc §8 (ngày 3 / 7 / 12)
- [ ] Đã chuẩn bị sẵn thư chờ (§6.3) cho người không được chọn đợt này

---

## 14. Nguồn tham khảo trong gói

- `README.md` — tính năng v1 có/chưa có, trạng thái build
- `APP-STORE-READY.md` — mô tả, quyền, App Privacy ("Data Not
  Collected"), lưu ý nếu mic dời v1.1 / Google chưa kịp
- `TESTFLIGHT-CHECKLIST.md` — checklist test chi tiết 12 mục trên
  iPhone thật (đưa cho tester làm theo)
- `RISKS.md` — rủi ro Google OAuth, mic, Guideline 4.2/4.8
- `GOOGLE-SETUP.md` — tạo Client ID chung + xác minh Google (việc 1
  lần, quyết định Google ở beta có bật được không)
- `CLOUDKIT-PLAN.md` — Nấc 2/3 (chưa có ở v1, đừng hứa với tester)

---

*File này chỉ là kế hoạch tuyển beta. Không sửa code, không tạo tài
khoản, không gửi thư mời thật, không push GitHub.*
