# FotoBro v1 — Checklist ngày ra mắt trên App Store

> **Ngày viết:** 20/11/2026. **Phạm vi:** FotoBro iOS v1 — Capacitor 8, Bundle ID `com.fotobro.app`, phiên bản **1.0 (build 1)**.
> **Quy tắc file này:** chỉ là checklist — không nộp app, không tạo tài khoản, không mua gì, không push GitHub.
> **Cách dùng:** tick `☐` → `☑` khi xong. Mục nào có 🚫 **CHẶN** thì chưa làm được cho tới khi gỡ chặn (xem bảng chặn ở §0).
> **Người phụ trách:** để trống, ghi tên khi giao việc. Mẫu: `Người phụ trách: ______`.

---

## §0. Những mục còn CHẶN — đọc trước khi làm gì khác

| # | Mục bị chặn | Vì sao chặn | Gỡ chặn bằng cách nào | Ai gỡ |
|---|---|---|---|---|
| 🚫 B1 | **Google Client ID chung chưa có** — `www/fotobro-config.js` đang để `googleClientId: ''` | Chưa tạo project Google Cloud "FotoBro", chưa tạo client iOS, chưa dán Client ID. Nút "Đăng nhập Google" trong app hiện báo "chưa sẵn sàng". Xác minh Google (sensitive + restricted scopes) mất **4–10 tuần** nếu giữ đủ 6 scope, 2–6 tuần nếu bỏ `gmail.readonly` ở v1 | Việt/Muse tạo project + 2 client theo `GOOGLE-SETUP.md`, dán Client ID iOS vào `fotobro-config.js`, sửa redirect native + mở đăng nhập bằng trình duyệt hệ thống, rồi test bằng tài khoản test (chế độ Testing, tối đa 100 tài khoản, token hết hạn sau 7 ngày). **Quyết định chờ Việt:** giữ hay bỏ `gmail.readonly` ở v1 | Người phụ trách: ______ |
| 🚫 B2 | **Email `support@fotobro.app` chưa có** | Chưa mua domain, chưa tạo hộp thư. Consent screen Google cũng cần email hỗ trợ (tạm dùng Gmail cá nhân của Việt thì email đó hiện công khai trên màn hình xin quyền) | Việt duyệt mua domain rồi tạo hộp thư (xem B3). Tạm thời: **không ghi email nào** vào App Store Connect nếu chưa có hộp thư thật | Người phụ trách: ______ |
| 🚫 B3 | **Domain `fotobro.app` chưa mua — chưa xác minh được trống hay không** | `fotobro.com` đã có chủ từ 22/02/2008 tới 22/02/2027. `fotobro.app` chưa xác minh được. Dự phòng còn trống: `fotobroapp.com`, `getfotobro.com`. Đề xuất rẻ nhất: iCloud+ Custom Domain ~$20/năm (domain `.app` $8,20 + iCloud+ $0,99/tháng) | Việt kiểm tra lại ở trang registrar rồi duyệt giá/registrar trước khi mua. **Mua domain cần Việt duyệt — không tự mua** | Người phụ trách: ______ |
| 🚫 B4 | **Privacy Policy URL chưa có thật** — đề xuất `https://hoangviet1397.github.io/fotobro/PRIVACY.html` | Repo `Hoangviet1397/fotobro` mới chỉ có README, chưa đẩy code, chưa bật GitHub Pages, chưa host `PRIVACY.html`. Không có URL này thì **không tạo app trong App Store Connect được** | Thêm `PRIVACY.md`/`PRIVACY.html` vào repo `fotobro`, bật GitHub Pages (main/root), mở URL trên điện thoại kiểm tra đọc được rồi mới dán vào App Store Connect. Đồng thời sửa 2 chỗ cũ trong `PRIVACY.md`: repo `tro-ly-xeo` → `fotobro`, đoạn "Google mặc định TẮT" → đúng quyết định Google auto 1 chạm ở v1 | Người phụ trách: ______ |
| 🚫 B5 | **Code v1 chưa đẩy lên repo `fotobro`** | Repo mới chỉ có README. Chưa đẩy thì workflow iOS không chạy được, không có build TestFlight | Việt duyệt rồi mới đẩy (cần 1 lần phê duyệt push riêng). Đẩy toàn bộ `fotobro-ios-v1/` làm repo root, **không copy `node_modules/`**, không đẩy secret nào (`.p12`, `.key`, `.cer`, `.p8`, `.mobileprovision`) | Người phụ trách: ______ |
| ⚠️ B6 | **Giọng nói (mic) — plugin đã gỡ khỏi v1** | `package.json` hiện tại không còn `@capacitor-community/speech-recognition` (chỉ còn `@capacitor/calendar ^1.0.1` và các plugin Capacitor 8). Mic dời sang v1.1 theo quyết định đã chốt (thử sửa SPM tối đa 2 lần, không được thì dời) | Trước khi submit: kiểm tra trong build cuối **không còn nút mic** (hoặc nút mic hiện thông báo "Sẽ có ở bản sau", không bấm không chạy), xoá mọi nhắc tới giọng nói khỏi mô tả + screenshot + Info.plist (quyền Micro/Speech). **Lưu ý:** bản nháp bài đăng `batch-content/LAUNCH-POST.md` vẫn nhắc "giọng nói tiếng Việt" ở tính năng 4 — phải sửa lại trước khi đăng (xem §6) | Người phụ trách: ______ |
| ⚠️ B7 | **App ID / chứng chỉ / profile / API Key / 6 secrets — Việt phải tự làm** | Muse không làm thay được bằng Apple ID đã đăng ký Developer của Việt | Việt làm theo `BUILD-GUIDE.md` mục 1–5 (xem §1). Không dán secret vào chat hay commit lên GitHub | Người phụ trách: ______ |

**Nguyên tắc nộp v1 nếu B1 chưa gỡ xong:** tắt Google tạm ở v1 (ẩn nút đăng nhập), sửa mô tả + screenshot số 4 + App Privacy cho khớp (thay màn Google bằng màn **Nhập từ Lịch iPhone**), và **đừng để reviewer thấy màn cảnh báo "Google chưa xác minh ứng dụng này"**. Không submit bản có Google chưa xác minh.

---

## §1. Build cuối + TestFlight

> Chuẩn đã kiểm chứng lúc 20/11/2026 (đọc file, chưa chạy build thật): workflow `.github/workflows/ios-build.yml` dùng `macos-26` + Xcode **26.5** (đúng yêu cầu từ 28/04/2026: App Store Connect từ chối build bằng Xcode dưới 26); `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1`; plugin Lịch `@capacitor/calendar ^1.0.1` đã có trong `package.json`; `Info.plist` đã có `NSCalendarsUsageDescription`. **Vẫn phải kiểm lại ở build cuối** — file có thể đổi sau ngày viết checklist này.

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | App ID `com.fotobro.app` đã tạo trên Apple Developer (Capabilities: **không tick thêm gì** ở v1 — iCloud + Sign in with Apple chỉ tick khi Nấc 2 CloudKit bật thật; v1 chỉ là placeholder) | ______ | Sai 1 ký tự Bundle ID là build không ký được |
| ☐ | Distribution Certificate đã tạo (Apple Distribution, qua CSR bằng OpenSSL trên Windows) + file `.p12` đã tạo, mật khẩu `.p12` đã ghi nhớ | ______ | Không đẩy `.p12`/`.key`/`.cer` lên GitHub, không gửi qua chat |
| ☐ | Provisioning Profile (App Store) đã tạo, tên đúng **`FotoBro App Store`** (khớp tên trong workflow) | ______ | Đặt tên khác thì phải sửa tên trong file workflow cho khớp |
| ☐ | App Store Connect API Key (`.p8`) đã tạo — Name `FotoBro CI`, quyền **App Manager**; đã ghi lại Issuer ID + Key ID, đã tải `.p8` về (chỉ tải được 1 lần) | ______ | Mất `.p8` là phải tạo key mới |
| ☐ | Đủ 6 secrets (đúng tên từng ký tự) đã dán vào repo `fotobro` → Settings → Secrets → Actions: `IOS_DIST_CERT_P12_BASE64`, `IOS_DIST_CERT_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_BASE64`, `APPLE_TEAM_ID` | ______ | `IOS_PROVISIONING_PROFILE_BASE64` là dự phòng (workflow hiện tải profile bằng API key) — nên tạo sẵn |
| ☐ | Code v1 đã đẩy lên repo `Hoangviet1397/fotobro` (sau khi Việt duyệt push), không copy `node_modules/`, không đẩy secret | ______ | 🚫 Chặn bởi B5 |
| ☐ | Kiểm lại trước khi chạy workflow: workflow còn ghim `macos-26` + Xcode 26.x; `backgroundColor` đã đổi theo UI Apple Music mới (không còn `#FBF5EA` kem vintage); không còn tên repo cũ `tro-ly-xeo` trong workflow | ______ | QA ngày 19/11 từng ghi workflow ghim Xcode 16.4 — đã sửa thành 26.5 lúc 20/11, kiểm lại lần nữa trước build cuối |
| ☐ | Chạy workflow "Build FotoBro iOS" trên GitHub Actions (chọn "Đẩy lên TestFlight luôn: true"), chờ chạy xanh (lần đầu 10–20 phút) | ______ | Nếu đỏ ở bước Archive: đọc log theo `RISKS.md` (lỗi hay gặp: thiếu secret, thiếu profile, sai Xcode) |
| ☐ | Build **1.0 (1)** đã xuất hiện trong App Store Connect → TestFlight | ______ | Giữ version 1.0, chỉ tăng build number khi build lại |
| ☐ | Internal Testing: đã thêm tester bằng Apple ID (Xèo là người dùng đầu tiên) | ______ | TestFlight nội bộ không cần Apple duyệt trước |
| ☐ | Xèo đã cài qua app TestFlight trên iPhone thật, mở được app, không crash ở màn hình đầu | ______ | Ghi iPhone test + iOS version: ______ |
| ☐ | Test đủ theo `TESTFLIGHT-CHECKLIST.md` (mở app → Hôm nay → thêm 1 job Film + 1 job Cả hai → nhảy bước pipeline → ghi cọc → huỷ + khôi phục 1 job → sổ tiền/báo cáo → đăng nhập Google 1 chạm → nhập từ Lịch iPhone → đổi màu chủ đề/logo/ngôn ngữ/tiền tệ → sửa mẫu tin nhắn → khoá Face ID/PIN → sao lưu JSON) | ______ | Dữ liệu test là hư cấu, test xong xoá hoặc khôi phục bằng bản sao lưu cũ |
| ☐ | Mục 6 (Google) trong `TESTFLIGHT-CHECKLIST.md`: nếu app báo "Đăng nhập Google chưa sẵn sàng" thì ghi ⏭️ BỎ QUA toàn mục, không ghi lỗi | ______ | 🚫 Chặn bởi B1 nếu chưa có Client ID |
| ☐ | Mục 10 (giọng nói): nếu bản TestFlight không có nút mic thì ghi ⏭️ BỎ QUA toàn mục (mic dời v1.1) | ______ | Xem B6 |
| ☐ | Sửa hết lỗi mức **Chặn** từ bảng lỗi TestFlight, build lại nếu cần (tăng build number, giữ version 1.0), test lại phần đã sửa | ______ | Lỗi Chặn = không test tiếp được / mất dữ liệu |

---

## §2. App Store Connect — metadata, screenshots, Privacy/Support URL, giá

> Nguồn chuẩn: `APP-STORE-READY.md` (§3–§9). Hồ sơ cũ `APP-STORE-LISTING.md` có chỗ đã sai/cũ (subtitle, keywords, repo cũ) — **đừng copy nguyên hồ sơ cũ**.

### 2a. App Information + giá

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | App đã tạo trong App Store Connect: Platform **iOS**, Name `FotoBro`, Primary Language **Vietnamese**, Bundle ID `com.fotobro.app`, SKU `fotobro-001`, User Access: Full Access | ______ | Đổi Bundle ID sau khi tạo là không được, phải tạo app mới |
| ☐ | App Icon 1024×1024 đã tải lên (file `AppIcon-1024.png`, RGB, không alpha, đã kiểm chứng) | ______ | Icon hiện vẫn là sen + ống kính cũ của Trợ lý Xèo — nếu Việt chốt đổi logo FotoBro mới thì render lại icon + splash **trước build cuối** |
| ☐ | Pricing: **Free (0đ)**, không tạo IAP nào | ______ | Nấc 1 miễn phí. Nấc 2/3 có thu phí theo quyết định 19/11 nhưng giá + chu kỳ **chưa chốt (TBD)** — xem `PRICING-DRAFT.md`, không ghi giá vào mô tả, không tạo sản phẩm IAP ở v1 |
| ☐ | Copyright: `© 2026 FotoBro` (ghi tên chủ sở hữu khi tạo app — để Việt chốt tên hiển thị) | ______ | |
| ☐ | Agreements, Tax, and Banking: không còn báo đỏ (app Free không cần điền thuế/ngân hàng; chỉ cần mục Agreements không báo đỏ) | ______ | |

### 2b. Metadata — mô tả, keywords, category, độ tuổi

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Subtitle đã nhập: `Trợ lý studio ảnh` — **17 ký tự, ĐẠT ≤ 30**, còn dư 13 | ______ | Đừng tin con số trong file cũ (đã đếm sai 1 lần) — đếm lại trước khi nhập |
| ☐ | Keywords đã nhập đủ **100/100 ký tự** (không khoảng trắng sau dấu phẩy): `fotobro,foto bro,studio anh,chup anh,quan ly job,thu chi,nhac lich,chup cuoi,lookbook,portrait,event` | ______ | Không nhồi tên app khác, không dùng từ "miễn phí" |
| ☐ | Mô tả tiếng Việt đã dán (theo `APP-STORE-READY.md` §6a) — **đã khớp đúng tính năng có trong build gửi đi** | ______ | Đoạn "ĐĂNG NHẬP GOOGLE 1 CHẠM…" chỉ giữ nếu Google kịp v1; đoạn giọng nói **không có** trong mô tả v1 cho tới khi chốt mic kịp v1 |
| ☐ | Mô tả tiếng Anh đã dán (theo §6b) — dùng khi thêm ngôn ngữ phụ English | ______ | Ngôn ngữ chính vẫn là Vietnamese; thêm English khi bản EN đã đủ nhãn chính |
| ☐ | Mô tả không nhắc tên Xèo, Sadako, E.L.F., Super Junior hay dữ liệu mẫu thật của một người dùng cụ thể | ______ | |
| ☐ | Primary Category: **Business**; Secondary Category: **Photo & Video** | ______ | Productivity chỉ là phương án dự phòng — không đổi ở v1 nếu không có lý do mới |
| ☐ | Age Rating: **4+** — trả lời "Không" cho mọi mục nội dung nhạy cảm trong questionnaire; "Unrestricted web access" = **không** (app không có trình duyệt web mở tuỳ ý) | ______ | |

### 2c. Screenshots — 6 ảnh, 2 bộ kích thước

> Chụp bằng **iPhone thật qua TestFlight**, không chụp từ trình duyệt máy tính. Dữ liệu mẫu hư cấu theo `SCREENSHOT-DATA.md` (studio mẫu "An Studio", người dùng mẫu "An"). Không chụp màn có tên/email/số điện thoại thật, màn lỗi, màn trống, màn Google cảnh báo "ứng dụng chưa xác minh".

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Dữ liệu mẫu đã nhập đủ vào bản TestFlight (theo `SCREENSHOT-DATA.md`): 1 job đã xong + 2–3 job sắp tới, ảnh trang chủ đẹp (ảnh chung, không phải ảnh khách thật), tắt thông báo lạ, để light mode cho bộ chính | ______ | Kiểm khớp số giữa 6 màn trước khi chụp (bảng khớp số cuối `SCREENSHOT-DATA.md`) |
| ☐ | Bộ 6.7" (bắt buộc): **1290 × 2796** — đủ 6 ảnh, đúng thứ tự | ______ | iPhone 14/15/16 Pro Max |
| ☐ | Bộ 6.5": **1242 × 2688** — đủ 6 ảnh, đúng thứ tự | ______ | iPhone 11 Pro Max / XS Max |
| ☐ | Ảnh 1 — **Hôm nay**: lịch chụp hôm nay + tiền hôm nay + ảnh trang chủ đẹp, Large Title | ______ | Ảnh đầu tiên người ta thấy |
| ☐ | Ảnh 2 — **Pipeline job 8 bước**: job "Minh Quân & Lan Chi — Wedding" ở bước Hậu kỳ (6/8), giá 15.000.000đ, đã thu cọc 5.000.000đ | ______ | Thấy rõ bước đã xong / đang làm / sắp tới, nút nhảy bước |
| ☐ | Ảnh 3 — **Sổ tiền / báo cáo tuần**: thu 12.500.000đ, chi 1.200.000đ, còn thiếu 3.000.000đ | ______ | Nếu app tính "còn thiếu" khác thì lấy số app hiện làm chuẩn, sửa file cho khớp ảnh thật |
| ☐ | Ảnh 4 — **Đăng nhập Google 1 chạm** (chỉ chụp màn trong app, không chụp màn đăng nhập của Google) — **HOẶC màn Nhập từ Lịch iPhone nếu Google chưa kịp v1** | ______ | 🚫 Chặn bởi B1 nếu chọn màn Google |
| ☐ | Ảnh 5 — **Thêm job mới**: form gọn, giá 8.000.000đ tự điền khi chọn Lookbook + Digital | ______ | Job mẫu "Quán Cà Phê Mộc — Lookbook", ngày chụp tuần sau |
| ☐ | Ảnh 6 — **Cài đặt / Khoá app**: Face ID + PIN đang bật, cá nhân hoá (màu chủ đề, logo studio) | ______ | Không chụp màn có Client ID, secret, email thật, số PIN |
| ☐ | iPad: khai **không hỗ trợ** thì khỏi chụp iPad (app chỉ làm cho iPhone portrait) | ______ | Muốn hỗ trợ iPad thì phải chụp thêm bộ iPad 12.9" (2048 × 2732) |
| ☐ | Sau khi chụp xong: **xoá hết 6 bộ dữ liệu mẫu** khỏi bản TestFlight trước khi gửi Apple duyệt (hoặc giữ lại với ghi chú rõ "đây là dữ liệu mẫu" trong Notes cho reviewer) | ______ | |
| ☐ | App Preview video (tùy chọn, 15–30 giây, quay màn hình iPhone thật) — làm sau, không bắt buộc cho lần gửi đầu | ______ | Mở app → hôm nay có gì → thêm 1 job → job hiện trong pipeline → xem báo cáo |

### 2d. Privacy / Support URL + App Privacy

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Privacy Policy URL đã host và mở được trên điện thoại: `https://hoangviet1397.github.io/fotobro/PRIVACY.html` | ______ | 🚫 Chặn bởi B4 |
| ☐ | Support URL đã điền (tạm link web repo mới): `https://github.com/Hoangviet1397/fotobro` | ______ | Support URL bắt buộc phải là **link web, không phải email** — Việt duyệt dùng tạm link GitHub |
| ☐ | Marketing URL: để trống ở v1 (không bắt buộc) | ______ | Điền sau khi có trang giới thiệu |
| ☐ | Email hỗ trợ: **không ghi email nào** vào App Store Connect ở v1 nếu chưa tạo được hộp thư thật | ______ | 🚫 Chặn bởi B2 — sau này đổi thành `support@fotobro.app` khi có domain |
| ☐ | App Privacy (Privacy Nutrition Labels): khai **"Data Not Collected"** — khớp `PRIVACY.md` | ______ | Khai lại nếu trước submit có thay đổi: Google bật (dữ liệu Google chỉ đọc trên máy, không gửi về máy chủ FotoBro), CloudKit bật thật (đồng bộ qua iCloud của Apple) |
| ☐ | Quyền trong Info.plist đã kiểm lại: quyền nào không dùng thì bỏ. Lịch (`NSCalendarsUsageDescription`), Ảnh, Face ID, Thông báo (local) giữ; Micro + Speech **chỉ khai nếu mic kịp v1**; Máy ảnh chỉ giữ nếu v1 dùng máy ảnh | ______ | Câu chữ Usage Description tiếng Việt + tiếng Anh, nói rõ dùng để làm gì |

---

## §3. Kiểm tra lần cuối trên iPhone thật (trước khi bấm Submit)

> Làm trên bản TestFlight cuối cùng — đúng build sẽ gửi Apple duyệt. Không kiểm bằng trình duyệt máy tính.

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Mở app lần đầu: màn chào → **Bắt đầu sổ trống** → vào màn Hôm nay, sổ trống, không còn job mẫu / ảnh mẫu của bản cũ | ______ | |
| ☐ | 5 tab dưới (Hôm nay, Buổi chụp, Sổ tiền, Phòng ban, Cài đặt) mở được, chữ không bị cắt ở tai thỏ / Dynamic Island | ______ | Lỗi từng gặp ở bản web trên điện thoại |
| ☐ | Dark mode + light mode: nền đen/chữ sáng ở dark mode, không có chữ xám mờ khó đọc; đổi preset màu chủ đề toàn app đổi theo ngay | ______ | |
| ☐ | Pipeline: nhảy thẳng tới bước bất kỳ, lùi bước không mất dữ liệu, job kẹt quá lâu báo lên Hôm nay, Huỷ/Không chốt + khôi phục được | ______ | 8 bước: Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong |
| ☐ | Tiền: Chốt cọc ghi cọc, Đã giao nhắc thu nốt, Xong mà còn thiếu tiền thì cảnh báo (không cho xong lặng lẽ); báo cáo ngày/tuần/tháng tính đúng | ______ | |
| ☐ | Lịch iPhone native: nhập 1 chạm ra đúng sự kiện 30 ngày tới, không tạo job trùng khi nhập lại; từ chối quyền thì app báo rõ + hướng dẫn bật lại, không crash | ______ | Plugin `@capacitor/calendar` + quyền Lịch đã có trong gói lúc 20/11 — kiểm lại trên máy thật |
| ☐ | Xuất lịch: nút "Thêm vào Lịch iPhone" trong chi tiết job mở đúng app Lịch với sự kiện điền sẵn; job chưa có ngày chụp thì app báo rõ, không tạo file rỗng | ______ | |
| ☐ | Google 1 chạm (chỉ khi B1 đã gỡ): mở trình duyệt hệ thống (Safari), không đăng nhập trong WebView; quay lại app tự động, hiện "Đã kết nối Google" | ______ | Không test bằng tài khoản Google chính có mail khách quan trọng — dùng tài khoản Google test |
| ☐ | Khoá Face ID + PIN: mở được bằng Face ID, nhập đúng PIN mở được, rời app > 2 phút tự khoá lại; **không test nhập sai PIN 5 lần liên tiếp** (sẽ bị khoá chờ tăng dần) | ______ | Ghi PIN test ra giấy khi test |
| ☐ | Sao lưu JSON: tải được `fotobro-sao-luu.json`, khôi phục đúng trạng thái lúc sao lưu; mở file không phải bản sao lưu thì app báo rõ, không xoá dữ liệu | ______ | v1 sao lưu là file JSON trên máy, chưa có CloudKit — mất file + mất máy = mất dữ liệu |
| ☐ | Offline: bật chế độ máy bay rồi dùng app (mở job, ghi tiền, đổi bước) vẫn bình thường; chỉ Google/Lịch Google không tải được, app báo rõ | ______ | Nấc 1 local-first |
| ☐ | Chữ tiếng Việt có dấu không lỗi font; cuộn danh sách 10 job mượt, không giật | ______ | |
| ☐ | **Không còn nút mic chết trong app** (bấm không chạy) — hoặc ẩn hẳn, hoặc hiện thông báo "Sẽ có ở bản sau" | ______ | Xem B6 |
| ☐ | **Không còn file/secret/test data nào trong build gửi đi** (không Client ID thật lộ trong screenshot, không secret trong code) | ______ | |
| ☐ | Mô tả + screenshot + App Privacy đã khớp đúng tính năng có trong build gửi đi (Google có hay không, mic có hay không) | ______ | Lệch 1 chỗ là lý do Apple trả về thường gặp |

---

## §4. Nộp duyệt (Submit for Review)

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | App Review Information: tên + email + số điện thoại liên hệ của người duyệt đã điền (email Việt kiểm soát được, trả lời được trong **1–3 ngày**) | ______ | Việt điền — Apple cần liên hệ được trong thời gian duyệt |
| ☐ | Notes cho reviewer (tiếng Anh, ngắn gọn) đã ghi: **(1)** "No account is required. The app works offline with local data. Google sign-in is optional…" — app không cần tài khoản, mở app là dùng ngay; **(2)** Lịch iPhone chỉ đọc sau khi người dùng bấm nhập + cho phép, sự kiện ở trên máy, không gửi lên server (app không có server); **(3)** Ảnh chỉ ảnh người dùng tự chọn; Face ID chỉ mở khoá trên máy; **(4)** dữ liệu xoá được trong Cài đặt, gỡ app là xoá hết | ______ | Đầy đủ câu chữ chuẩn xem `APP-STORE-READY.md` §12 |
| ☐ | Tài khoản demo cho Apple: **không cần** (app không bắt buộc đăng nhập). Ghi rõ trong Notes. Chỉ chuẩn bị tài khoản Google test (có sẵn vài sự kiện lịch + email mẫu, **không dùng Gmail thật của Việt/Xèo**) khi Apple hỏi | ______ | |
| ☐ | Export Compliance: app không dùng mã hoá tự viết ngoài chuẩn (mã hoá sao lưu dùng AES chuẩn của hệ thống) — khai theo hướng dẫn của Apple | ______ | Nếu dùng mã hoá đầu cuối tự triển khai cho CloudKit thì hỏi lại trước khi khai |
| ☐ | Google OAuth — rủi ro Guideline 4.8 (Sign in with Apple): chuẩn bị sẵn câu trả lời — đăng nhập Google là **tùy chọn, không bắt buộc, không phải đăng nhập tài khoản FotoBro** (app không có tài khoản riêng); Sign in with Apple đã bật cho Nấc 2 CloudKit nếu reviewer yêu cầu. Nếu Apple vẫn bắt buộc thì phải thêm Sign in with Apple trước khi gửi lại | ______ | Chỉ áp dụng nếu Google bật ở v1 |
| ☐ | Bấm **Submit for Review** — ghi lại ngày/giờ nộp + build đã nộp (version + build number) | ______ | Ngày nộp: ____ / ____ / 2026 — Build đã nộp: 1.0 (____) |
| ☐ | Trạng thái sau khi nộp: **Waiting for Review** — không đẩy build mới đè lên trong lúc chờ, trừ khi cần sửa lỗi chặn | ______ | Apple duyệt thường **1–3 ngày**, lần đầu có thể lâu hơn |

---

## §5. Theo dõi phản hồi Apple

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Kiểm App Store Connect + email mỗi ngày trong lúc chờ duyệt (người liên hệ ở §4 phải trả lời được trong 1–3 ngày) | ______ | |
| ☐ | Nếu Apple hỏi thêm (Message từ reviewer): trả lời đúng câu hỏi, ngắn gọn, bằng tiếng Anh; đính kèm ảnh/video demo nếu được yêu cầu | ______ | Đừng đợi Apple hỏi mới nghĩ — câu trả lời chuẩn đã chuẩn bị ở §4 |
| ☐ | Nếu bị **reject**: đọc kỹ lý do (Guideline nào, màn hình nào), ghi lại vào bảng dưới, sửa đúng chỗ đó rồi nộp lại — không sửa lan man | ______ | Lý do reject (nếu có): ______________________ |
| ☐ | Nếu reject vì Google (chưa xác minh / Guideline 4.8): quyết 1 trong 2 — **(a)** tắt Google tạm ở v1 + sửa mô tả/screenshot/App Privacy cho khớp, nộp lại; **(b)** thêm Sign in with Apple rồi nộp lại | ______ | Quyết định này cần Việt chốt |
| ☐ | Nếu reject vì quyền (Lịch/Ảnh/Mic/Face ID): kiểm Usage Description + bỏ quyền không dùng, nộp lại | ______ | |
| ☐ | Nếu reject vì metadata (mô tả/screenshot hứa tính năng không có): sửa mô tả/screenshot cho khớp build thật, nộp lại | ______ | |
| ☐ | Khi trạng thái thành **Ready for Sale**: kiểm tra link App Store mở được, tên + icon + screenshot hiện đúng | ______ | Link App Store: ______________________ |
| ☐ | Ghi lại ngày được duyệt: ____ / ____ / 2026 — tổng thời gian duyệt: ____ ngày | ______ | |

---

## §6. Đăng bài ra mắt

> Bản nháp bài đăng đã có sẵn: `batch-content/LAUNCH-POST.md` (song ngữ Việt/Anh, 5 tính năng nổi bật, hashtag). **Chưa đăng — chỉ đăng sau khi app đã Ready for Sale.**

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Điền link App Store thật vào bài đăng (thay chỗ `[LINK TẢI — ĐANG CẬP NHẬT]`) | ______ | Link lấy ở §5 sau khi duyệt |
| ☐ | **Sửa lại bản nháp trước khi đăng:** xoá/sửa tính năng 4 "giọng nói tiếng Việt" nếu mic dời v1.1 (hiện bản nháp vẫn nhắc giọng nói — sai với build v1); kiểm lại đoạn "Đăng nhập Google một chạm" — chỉ giữ nếu Google kịp v1, nếu không thì sửa thành nhập Lịch iPhone 1 chạm | ______ | Xem B6 + B1. Đăng bài hứa tính năng không có = nhận xét 1 sao ngày đầu |
| ☐ | Việt duyệt lại toàn bộ chữ bài đăng (cả 2 ngôn ngữ) trước khi đăng | ______ | |
| ☐ | Đăng bài ra mắt (kênh: ______ — Facebook / Instagram / Threads / nhóm photographer) | ______ | Ngày đăng: ____ / ____ / 2026 |
| ☐ | Gắn link App Store + hashtag `#FotoBro` trong bài đăng | ______ | |
| ☐ | Đăng xong: kiểm tra bài hiển thị đúng link, ảnh, chữ (cả bản Việt + bản Anh nếu đăng 2 nơi) | ______ | |
| ☐ | **Đừng quảng bá rộng cho tới khi xác minh Google xong** (nếu Google bật mà chưa xác minh): người dùng ngoài vẫn thấy cảnh báo "Google chưa xác minh ứng dụng này" — chỉ dùng TestFlight + tài khoản test trong lúc chờ | ______ | Áp dụng khi B1 đang ở chế độ Testing |

---

## §7. Hỗ trợ người dùng ngày đầu

| ☐ | Việc | Người phụ trách | Ghi chú |
|---|---|---|---|
| ☐ | Kênh hỗ trợ ngày đầu đã chốt: ______ (tạm thời: repo GitHub `Hoangviet1397/fotobro` — Issues; email chưa có, xem B2) | ______ | Support URL trong App Store Connect trỏ repo GitHub |
| ☐ | Người trực hỗ trợ ngày đầu đã phân công (trả lời trong ngày): ______ | ______ | Ca trực: ______ |
| ☐ | Câu trả lời sẵn cho 5 câu hỏi hay gặp nhất: **(1)** "Mở app vẫn thấy bản cũ?" → bấm nút Cập nhật trong app / xoá cài lại từ App Store; **(2)** "Đăng nhập Google báo chưa sẵn sàng?" → tính năng đang chờ xác minh, dùng Lịch iPhone 1 chạm tạm; **(3)** "Nhập Lịch iPhone không thấy sự kiện?" → kiểm tra đã cho phép quyền Lịch + sự kiện trong 30 ngày tới; **(4)** "Quên PIN?" → (ghi cách xử lý đã chốt: ______); **(5)** "Mất dữ liệu khi đổi máy?" → v1 chỉ có sao lưu JSON thủ công, khôi phục bằng file đã tải về | ______ | Viết câu trả lời đúng với build v1 thật, không hứa tính năng chưa có |
| ☐ | Theo dõi review 1 sao / crash ngày đầu: ghi lại lỗi, phân loại Chặn/Nặng/Nhẹ (như bảng lỗi TestFlight), sửa lỗi Chặn trước | ______ | Số review ngày đầu: ____ — Lỗi chặn (nếu có): ______________________ |
| ☐ | Nhắc người dùng sao lưu JSON định kỳ (v1 chưa có CloudKit — mất file + mất máy = mất dữ liệu) | ______ | Banner nhắc sao lưu sau 7 ngày đã có trong app |
| ☐ | Tổng kết ngày đầu: số lượt tải, số lỗi chặn, số câu hỏi hỗ trợ — ghi vào cuối file này | ______ | Lượt tải ngày đầu: ____ — Lỗi chặn: ____ — Câu hỏi hỗ trợ: ____ |

---

## §8. Quyết định còn chờ Việt (chốt trước ngày nộp)

| # | Việc cần Việt | Vì sao chưa làm được |
|---|---|---|
| 1 | Duyệt mô tả VI/EN, keywords 100 ký tự, subtitle 17 ký tự (§2b) | Cần gật đầu trước khi nhập vào App Store Connect |
| 2 | Chốt có đổi logo FotoBro mới không (icon hiện vẫn là sen + ống kính cũ) | Đổi logo thì render lại App Icon 1024 + splash trước build cuối |
| 3 | Chốt Google có kịp v1 hay tắt tạm — và giữ hay bỏ `gmail.readonly` ở v1 (quyết định này đổi thời gian xác minh 4–10 tuần hay 2–6 tuần) | Đổi mô tả + screenshot số 4 + App Privacy + Notes cho reviewer |
| 4 | Chốt mic có kịp v1 hay dời v1.1 (hiện plugin đã gỡ — mặc định là dời) | Đổi mô tả + screenshot + quyền + bài đăng ra mắt |
| 5 | Kiểm tra + mua domain `fotobro.app` (hoặc dự phòng `fotobroapp.com` / `getfotobro.com`) và tạo email `support@fotobro.app` | Mua cần duyệt giá/registrar; email hiện công khai trên màn hình xin quyền Google nếu dùng Gmail cá nhân tạm |
| 6 | Duyệt Support URL tạm (link GitHub repo `fotobro`) + host Privacy Policy URL | Không có Privacy Policy URL thì không tạo app trong App Store Connect được |
| 7 | Duyệt push code v1 lên repo `fotobro` (1 lần phê duyệt push riêng) | Chưa đẩy thì không chạy được workflow build |
| 8 | Điền tên + email + số điện thoại liên hệ cho App Review | Apple cần liên hệ được trong 1–3 ngày duyệt |
| 9 | Chốt giá Nấc 2/3 (số tiền + chu kỳ) — **không cần cho v1** (v1 không tạo IAP), chỉ cần trước khi bật IAP sau này | Không có giá thì không cấu hình StoreKit được |

---

## Nguồn tham khảo trong gói (đã đọc để viết checklist này)

- `BUILD-GUIDE.md` — 6 bước build qua GitHub Actions (App ID → cert/profile → API Key → secrets → workflow → TestFlight)
- `APP-STORE-READY.md` — metadata, mô tả VI/EN, screenshots, App Privacy, checklist trước submit, câu trả lời cho reviewer
- `APP-STORE-LISTING.md` — hồ sơ cũ (có chỗ đã sai/cũ, xem §2)
- `TESTFLIGHT-CHECKLIST.md` — 12 mục test trên iPhone thật (0–12, có bảng lỗi + tổng kết)
- `GOOGLE-SETUP.md` — 4 việc Google Cloud, 6 scope, xác minh 4–10 tuần, chế độ Testing 100 tài khoản
- `SCREENSHOT-DATA.md` — dữ liệu mẫu hư cấu cho 6 screenshot + bảng khớp số
- `PRICING-DRAFT.md` — Nấc 1 miễn phí, Nấc 2/3 giá TBD, chưa bật IAP
- `PRIVACY.md` / `PRIVACY.html` — chính sách riêng tư (cần host, cần sửa 2 chỗ cũ)
- `QA-REPORT.md` — ảnh chụp QA 19/11/2026 (lưu ý: 2 điểm trong đó đã cũ lúc 20/11 — workflow đã lên Xcode 26.5, plugin Lịch + quyền Lịch đã có)
- `batch-content/LAUNCH-POST.md` — bản nháp bài đăng ra mắt (cần sửa tính năng giọng nói + link App Store trước khi đăng)
- `~/workspace/fotobro-scale/docs/EMAIL-SETUP.md` — domain/email hỗ trợ
