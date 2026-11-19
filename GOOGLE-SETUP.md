# Thiết lập Google cho FotoBro — 1 Client ID chung, đăng nhập 1 chạm

> Ngày soạn: 20/11/2026 (rạng sáng). Trạng thái: **CHƯA LÀM GÌ trên Google
> Cloud** — file này chỉ là hướng dẫn + checklist. Không có Client ID hay
> secret thật nào trong file này, và không được điền client_secret vào app.
>
> Mục tiêu (Việt chốt 23:52 19/11/2026): người dùng chỉ bấm **1 nút
> "Đăng nhập Google"** trong app là có hết — Lịch, Gmail (tiền về + khách
> hỏi), Danh bạ, Drive, ghi Lịch, gửi Gmail. **Không ai phải tự tạo Google
> Cloud project, không ai phải dán Client ID.** Toàn bộ phần Google Cloud
> chỉ làm **1 lần cho cả app**, do Việt/Muse làm, không phải việc của
> từng người dùng.

## 0. Toàn cảnh: 4 việc, theo thứ tự

```
[1] Tạo project Google Cloud "FotoBro" + bật 4 API        (~15 phút)
[2] Màn hình xin quyền (OAuth consent screen) + 2 client   (~30 phút)
[3] Sửa 1 chỗ trong code app cho khớp redirect của Google  (agent iOS)
[4] Gửi xác minh Google (sensitive + restricted scopes)   (chờ 4–10 tuần)
```

**Thứ tự quan trọng:** bước 2 cần bước 1 xong; bước 3 cần biết Client ID
thật ở bước 2 mới sửa được; bước 4 chỉ làm được khi app + Privacy Policy
URL đã xong. Trong lúc chờ xác minh (bước 4), app vẫn chạy được ở chế độ
Testing với tối đa 100 người dùng thử (xem §5).

---

## 1. Tạo project + bật API (làm 1 lần)

1. Vào https://console.cloud.google.com bằng Gmail của Việt → **Create
   Project** (hoặc **Select a project → New Project**).
   - Project name: `FotoBro` (tên này hiện cho Việt trong console, không
     hiện cho người dùng cuối).
   - Organization: để trống (tài khoản cá nhân, không có tổ chức).
   - Location: để mặc định. Bấm **Create**.
2. Vào **APIs & Services → Library**, lần lượt tìm và bấm **Enable** cho
   đúng 4 API này (không bật thừa):
   | API | Để làm gì trong FotoBro |
   |---|---|
   | Google Calendar API | Đọc + ghi Lịch (buổi chụp) |
   | Gmail API | Đọc Gmail (tiền về, khách hỏi) + gửi email cho khách |
   | People API | Đọc Danh bạ (tên, email, số điện thoại khách) |
   | Google Drive API | Xem tên thư mục Drive của job (chỉ metadata, không đọc file ảnh) |
3. Không cần bật thêm API nào, không cần tạo API key, không cần bật
   thanh toán (billing) cho 4 API này ở mức dùng của app.

---

## 2. Màn hình xin quyền + 2 OAuth client (làm 1 lần)

### 2a. OAuth consent screen

Vào **APIs & Services → OAuth consent screen → Get started**:

| Mục | Điền gì |
|---|---|
| App name | `FotoBro` — tên này hiện trên màn hình "FotoBro muốn truy cập tài khoản Google của bạn" |
| User support email | Email hỗ trợ của FotoBro. **Chưa có** — xem EMAIL-SETUP.md trong `~/workspace/fotobro-scale/docs/`: `fotobro.com` đã có chủ (từ 2008), `fotobro.app` chưa xác minh được, đề xuất mua `fotobro.app` rồi dùng iCloud+ Custom Domain làm `support@fotobro.app`. **Tạm thời** có thể điền Gmail cá nhân của Việt, nhưng email này **hiện công khai** trên màn hình xin quyền cho mọi người dùng thấy — nên thay bằng `support@fotobro.app` ngay khi có domain. |
| App logo | File `AppIcon-1024.png` trong gói iOS (Google yêu cầu ảnh vuông, sẽ hiện trên màn hình xin quyền) |
| App domain → Application home page | `https://hoangviet1397.github.io/fotobro/` (repo mới của FotoBro; **chưa đẩy code**, phải đẩy repo + bật GitHub Pages trước khi gửi xác minh) |
| App domain → Privacy policy link | URL đã host của `PRIVACY.md`. **Chưa có URL thật** — file `PRIVACY.md` trong gói iOS hiện vẫn trỏ về URL cũ `https://hoangviet1397.github.io/tro-ly-xeo/PRIVACY.html` và ghi repo cũ; **phải sửa lại** thành repo `fotobro` rồi host lên GitHub Pages trước khi gửi xác minh (xem BUILD-GUIDE.md mục 2). Không có Privacy Policy URL thì Google không nhận hồ sơ xác minh. |
| App domain → Terms of service link | Để trống ở v1 (không bắt buộc) hoặc trỏ về cùng trang GitHub Pages khi có. |
| Authorized domains | Thêm `github.io` (và `fotobro.app` sau khi mua domain) |
| Developer contact information (email) | Gmail của Việt — Google chỉ dùng để liên hệ khi hồ sơ xác minh có vấn đề, không hiện cho người dùng. |
| Audience / User type | Chọn **External** (app cho người ngoài dùng, không phải nội bộ tổ chức) |
| Publishing status | Để **Testing** lúc đầu (xem §5). Chỉ bấm **Publish app** sau khi xác minh xong. |

### 2b. Tạo 2 OAuth client — cùng 1 project, khác loại

Vào **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
Tạo **2 client**, cả 2 đều trong project `FotoBro` vừa tạo (dùng chung 1
màn hình xin quyền, chung 1 bộ scope ở §3):

**Client 1 — loại iOS (cho app native trên iPhone, là client chính):**
- Application type: **iOS**
- Name: `FotoBro iOS`
- Bundle ID: nhập đúng `com.fotobro.app` (khớp `capacitor.config.ts` và
  App ID Apple — sai 1 ký tự là đăng nhập hỏng)
- App Store ID: để trống cho tới khi app lên App Store, bổ sung sau
- Bấm **Create**. Google tự sinh:
  - **Client ID** dạng `123456789012-abc…xyz.apps.googleusercontent.com`
  - **Reversed client ID** dạng `com.googleusercontent.apps.123456789012-abc…xyz`
  - **Redirect URI tự động: `com.googleusercontent.apps.123456789012-abc…xyz:/oauth2redirect`**
  - ⚠️ **Không tự bịa redirect này** — nó được sinh từ Client ID thật,
    chỉ biết được sau khi tạo client xong.
- **Không có client_secret** cho loại iOS (public client, dùng PKCE — xem §4).

**Client 2 — loại Web application (cho bản web GitHub Pages / dự phòng):**
- Application type: **Web application**
- Name: `FotoBro Web`
- Authorized JavaScript origins: `https://hoangviet1397.github.io`
- Authorized redirect URIs (đăng ký đúng từng ký tự, có dấu `/` cuối):
  `https://hoangviet1397.github.io/fotobro/`
  (khớp `location.origin + location.pathname` trong code — xem §4)
- Client này **có client_secret**, nhưng **không bao giờ đưa secret này
  vào app** (app chỉ dùng PKCE, không cần secret). Giữ secret trong
  Google Cloud console, không dán vào file, không đẩy lên GitHub.

### 2c. Điền Client ID vào code — đúng 1 file

File cấu hình duy nhất (đã có sẵn trong gói iOS, đang để trống):

```
~/workspace/fotobro-ios-v1/www/fotobro-config.js
```

```js
window.FOTOBRO_CONFIG = {
  googleClientId: '',                 // ← dán Client ID loại iOS vào đây
  googleRedirectScheme: 'com.fotobro.app',
  cloudKitContainer: 'iCloud.com.fotobro.app',
  supportEmail: ''
};
```

- `googleClientId`: dán **Client ID loại iOS** (đuôi
  `.apps.googleusercontent.com`). Đây là giá trị công khai được phép
  nhúng trong app (nó hiện trong URL đăng nhập) — nhưng vẫn **không
  đẩy secret nào** kèm theo.
- ⚠️ **Lệch cần sửa trong code trước khi dùng Client ID thật** (xem §4):
  code hiện tại dùng redirect `com.fotobro.app:/oauth2redirect`, còn
  Google (client iOS) chỉ chấp nhận redirect dạng
  `com.googleusercontent.apps.<id>:/oauth2redirect`. Phải sửa
  `gRedirectUri()` + `googleRedirectScheme` trong `fotobro-config.js`
  theo Client ID thật, và đăng ký scheme đó trong `Info.plist`
  (`CFBundleURLTypes`), nếu không Google trả lỗi `redirect_uri_mismatch`.
- Web client (Client 2) chỉ dùng khi chạy bản web — code web lấy
  `location.origin` làm redirect nên không cần sửa gì thêm, chỉ cần
  đăng ký đúng Authorized redirect URI ở §2b.

---

## 3. Scopes — xin đủ 6 quyền 1 lần

Code app (`gScopes()` trong `www/index.html`, dòng ~3160) xin đủ 6 scope
trong **1 lần đăng nhập duy nhất**, không xin thêm từng lần:

| Scope (đầy đủ) | Dùng cho | Mức của Google |
|---|---|---|
| `https://www.googleapis.com/auth/calendar.readonly` | Xem Lịch trong tab Buổi chụp | Sensitive |
| `https://www.googleapis.com/auth/calendar.events` | Ghi / sửa / xoá buổi chụp trên Google Lịch | Sensitive |
| `https://www.googleapis.com/auth/gmail.readonly` | Đọc Gmail: tiền về + khách hỏi chụp | **Restricted** |
| `https://www.googleapis.com/auth/gmail.send` | Gửi email cho khách bằng Gmail | Sensitive |
| `https://www.googleapis.com/auth/contacts.readonly` | Đọc Danh bạ (People API) | Sensitive |
| `https://www.googleapis.com/auth/drive.metadata.readonly` | Xem tên thư mục Drive của job | **Restricted** |

Ghi chú phân mức (đã kiểm tra qua tài liệu Google, 20/11/2026):
- **Sensitive**: cần xác minh OAuth (video demo + giải thích từng scope +
  Privacy Policy) mới bỏ được cảnh báo "ứng dụng chưa xác minh" cho
  người dùng ngoài.
- **Restricted** (`gmail.readonly`, `drive.metadata.readonly`): cần thêm
  vòng xác minh restricted-scope (Google xét use-case, xem demo thật).
- **CASA (đánh giá bảo mật của bên thứ 3) — KHÔNG cần cho FotoBro** vì
  dữ liệu Google chỉ được đọc/gửi **ngay trên máy người dùng**, không
  qua máy chủ nào của FotoBro (app không có backend, token chỉ nằm trên
  máy). CASA chỉ bắt buộc khi dữ liệu restricted đi qua hoặc lưu trên
  máy chủ của nhà phát triển. Nếu sau này FotoBro thêm server đồng bộ
  mà server đó chạm vào dữ liệu Gmail/Drive thì phải làm CASA lại từ
  đầu (đánh giá hàng năm, trả phí cho lab được Google công nhận).
- **Quyết định còn chờ Việt** (không tự quyết): có giữ
  `gmail.readonly` (đọc Gmail) trong v1 không? Nếu bỏ scope này ở v1,
  chỉ còn sensitive → xác minh nhanh hơn nhiều (xem §5), Gmail đọc thêm
  ở v1.1. Nếu giữ, v1 đi đường dài (4–10 tuần). Tính năng Gmail đọc là
  1 trong 2 tính năng Gmail của app (cái còn lại là gửi mail, chỉ cần
  `gmail.send` — sensitive, không bị restricted).

Khi khai scope trong OAuth consent screen (**APIs & Services → OAuth
consent screen → Scopes → Add or Remove Scopes**): chọn đúng 6 scope
trên, và viết giải thích ngắn cho từng scope (Google bắt viết, ví dụ:
"Đọc lịch để tạo buổi chụp", "Đọc email báo tiền về của ngân hàng để
gợi ý ghi sổ" — viết đúng mục đích thật trong app, không viết chung
chung).

---

## 4. Luồng đăng nhập trong app — PKCE, không secret

Code đã viết sẵn trong `~/workspace/fotobro-ios-v1/www/index.html`
(dòng ~2939–2980, hàm `gConnect` / `gExchangeCode` / `gRedirectUri`):

1. Bấm **"Đăng nhập Google"** → app tạo `code_verifier` ngẫu nhiên +
   `code_challenge` (SHA-256, S256) → mở trang
   `https://accounts.google.com/o/oauth2/v2/auth` với
   `response_type=code`, `code_challenge`, `code_challenge_method=S256`,
   `access_type=offline` (để lấy refresh token), `include_granted_scopes=true`,
   `scope` = 6 scope ở §3.
2. Người dùng đăng nhập + cho phép → Google trả **authorization code**
   về redirect URI.
3. App đổi code lấy access token (+ refresh token lần đầu) bằng POST tới
   `https://oauth2.googleapis.com/token` với `code_verifier` — **không
   cần client_secret** (đây là điểm của PKCE cho public client).
4. Token lưu **chỉ trên máy** (session/local storage của app), tự refresh
   khi hết hạn; ngắt kết nối thì thu hồi token ở
   `https://oauth2.googleapis.com/revoke`.

**3 điểm lệch / thiếu so với chuẩn Google — phải sửa trước khi chạy thật:**

1. **Redirect URI native sai dạng** (xem §2c): code đang trả
   `com.fotobro.app:/oauth2redirect`, Google client iOS chỉ chấp nhận
   `com.googleusercontent.apps.<Client-ID-phần-đầu>:/oauth2redirect`.
   Sửa `gRedirectUri()` + `googleRedirectScheme` theo Client ID thật,
   đăng ký scheme đó trong `ios/App/App/Info.plist` (`CFBundleURLTypes`).
2. **Google cấm OAuth trong webview nhúng.** Code hiện mở trang đăng nhập
   bằng `location.href` — trong Capacitor (WKWebView) Google có thể chặn
   với lỗi `disallowed_useragent`, và redirect custom-scheme không tự
   quay về app nếu không có deep-link listener. Cần mở bằng trình duyệt
   hệ thống (ASWebAuthenticationSession — qua plugin Capacitor, vd
   `@capacitor/browser` + listener `appUrlOpen` của plugin App) rồi hứng
   code trả về. Đây là việc của agent đang làm app iOS, không phải việc
   Google Cloud.
3. **Refresh token chỉ trả 1 lần** (lần cho phép đầu tiên). Nếu người dùng
   ngắt kết nối rồi kết nối lại mà Google không trả refresh token mới,
   app phải xin lại quyền (thêm `prompt=consent`) — code cần xử lý
   trường hợp này, nếu không đăng nhập lần 2 sẽ chỉ có access token
   ngắn hạn.

---

## 5. Xác minh Google — quy trình, thời gian, cảnh báo

### 5a. Chế độ Testing (dùng ngay, không cần xác minh)

- Sau khi tạo client xong, consent screen ở trạng thái **Testing**.
- Thêm tối đa **100 tài khoản test** (OAuth consent screen → Test users →
  Add users): thêm Gmail của Việt + Xèo + người test nội bộ.
- Chỉ tài khoản test mới đăng nhập được; người ngoài bấm sẽ báo lỗi
  "Access blocked".
- Token của tài khoản test **hết hạn sau 7 ngày** → phải đăng nhập lại.
- Dùng chế độ này để test TestFlight nội bộ thoải mái trong lúc chờ
  xác minh.

### 5b. Gửi xác minh (để mở cho mọi người dùng)

Vào **OAuth consent screen → Publish app / Submit for verification**,
cần chuẩn bị trước:

1. **Video demo** (Google bắt buộc): quay màn hình iPhone chạy app thật
   (bản TestFlight), cho thấy: bấm "Đăng nhập Google" → màn hình xin
   quyền hiện đủ 6 scope → vào app thấy Lịch/Gmail/Danh bạ/Drive hiện
   dữ liệu → giải thích từng scope dùng để làm gì. Quay bằng tiếng
   Anh hoặc có phụ đề tiếng Anh, đăng ở chế độ Unlisted trên YouTube
   rồi dán link vào hồ sơ. **Không dùng video quay bản web cũ.**
2. **Privacy Policy URL** đã host (§2a) + trang chủ app đã live
   (GitHub Pages repo `fotobro`).
3. **Giải thích từng scope** bằng tiếng Anh trong form (§3).
4. App phải ở trạng thái **Production** (Publish app) sau khi nộp.

### 5c. Thời gian ước tính (theo tài liệu Google + kinh nghiệm chung, 2026)

| Vòng | Ước tính |
|---|---|
| Xác minh sensitive scopes (Calendar, gmail.send, Contacts) | Google ước tính ~10 ngày làm việc; thực tế thường **2–6 tuần** kể cả qua lại bổ sung |
| Thêm vòng restricted scopes (gmail.readonly, drive.metadata.readonly) | Thêm **~6 tuần** theo FAQ của Google (xét use-case; không tính CASA vì FotoBro không dùng server — xem §3) |
| **Tổng nếu giữ đủ 6 scope** | **Khoảng 4–10 tuần** từ lúc nộp hồ sơ đầy đủ |
| **Tổng nếu bỏ `gmail.readonly` ở v1** (chỉ còn sensitive) | **Khoảng 2–6 tuần** |

- Google không thu phí xác minh. Thời gian trên là ước tính, không phải
  cam kết — hồ sơ thiếu video, Privacy Policy chưa live, hoặc giải thích
  scope chung chung sẽ bị trả về và tính lại từ đầu.
- Trong lúc chờ: màn hình đăng nhập vẫn hiện cảnh báo **"Google chưa xác
  minh ứng dụng này"** (unverified app) với người dùng ngoài. Người dùng
  vẫn bấm "Tiếp tục" được (sau khi bấm "Nâng cao"), nhưng nhiều người sẽ
  sợ và bỏ — vì vậy **đừng quảng bá rộng cho tới khi xác minh xong**;
  chỉ dùng TestFlight + tài khoản test trong lúc chờ.
- Sau khi xác minh xong, cảnh báo biến mất. Nếu sau này **thêm/bớt scope
  hoặc đổi logo/tên app** thì phải xác minh lại phần đổi đó.

---

## 6. Phân biệt: việc 1 lần vs việc người dùng KHÔNG phải làm

| Việc | Ai làm | Khi nào |
|---|---|---|
| Tạo project Google Cloud "FotoBro", bật 4 API | Việt/Muse, 1 lần | Trước khi có Client ID |
| Màn hình xin quyền, support email, Privacy Policy URL, logo | Việt/Muse, 1 lần | Trước khi gửi xác minh (§2a) |
| Tạo 2 OAuth client (iOS + Web), dán Client ID iOS vào `www/fotobro-config.js` | Việt/Muse, 1 lần | Sau §2b, trước khi test đăng nhập |
| Sửa redirect URI + deep-link + mở trình duyệt hệ thống trong code | Agent làm app iOS | Cùng lúc với §2c |
| Quay video demo, nộp hồ sơ xác minh, trả lời Google | Việt/Muse | Khi app TestFlight + Privacy Policy đã xong |
| Mua domain `fotobro.app` + tạo `support@fotobro.app` (để điền vào consent screen) | Việt (mua), Muse hướng dẫn | Trước khi gửi xác minh (xem EMAIL-SETUP.md) |
| **Người dùng cuối làm** | **Chỉ bấm "Đăng nhập Google" 1 lần trong app, chọn tài khoản, bấm Cho phép** | Lúc dùng app |
| Người dùng cuối **KHÔNG** phải làm | Tạo Google Cloud project, bật API, tạo Client ID, dán Client ID, xin xác minh, trả phí Google | Không bao giờ |

---

## 7. Checklist chốt (đánh dấu khi xong)

- [ ] Project Google Cloud `FotoBro` đã tạo, 4 API đã bật (§1)
- [ ] OAuth consent screen: tên `FotoBro`, support email, logo, home page
  `https://hoangviet1397.github.io/fotobro/`, Privacy Policy URL đã host,
  Authorized domains có `github.io` (§2a)
- [ ] Client iOS (`com.fotobro.app`) đã tạo → có Client ID thật (§2b)
- [ ] Client Web đã tạo, redirect `https://hoangviet1397.github.io/fotobro/` (§2b)
- [ ] Client ID iOS đã dán vào `www/fotobro-config.js` (§2c)
- [ ] Code đã sửa: redirect native = reversed client ID, mở đăng nhập bằng
  trình duyệt hệ thống + deep-link (§4)
- [ ] 6 scope đã khai + giải thích trong consent screen (§3)
- [ ] Test đăng nhập bằng tài khoản test ở chế độ Testing (§5a)
- [ ] Video demo đã quay (bản TestFlight, đủ 6 scope) (§5b)
- [ ] Hồ sơ xác minh đã nộp; chờ 4–10 tuần (§5c)
- [ ] Việt quyết: giữ `gmail.readonly` ở v1 hay dời sang v1.1 (§3)
- [ ] Việt quyết: tên project Google Cloud + email hỗ trợ điền vào consent
  screen (tạm Gmail cá nhân hay chờ `support@fotobro.app`) (§2a)

## Nguồn kiểm tra (20/11/2026)

- Code app: `~/workspace/fotobro-ios-v1/www/index.html` dòng 2939–2980
  (`gRedirectUri`, `gConnect`, `gExchangeCode`), dòng 3160–3164
  (`gScopes`); `~/workspace/fotobro-ios-v1/www/fotobro-config.js`
  (placeholder `googleClientId: ''`).
- Tài liệu Google: "OAuth 2.0 for iOS & Desktop Apps"
  (developers.google.com/identity/protocols/AuthForInstalledApps) — client
  iOS dùng Bundle ID, redirect tự sinh dạng reversed client ID, PKCE.
- Phân mức scope + CASA: tài liệu Google về restricted scopes và security
  assessment — `gmail.readonly` và `drive.metadata.readonly` là restricted;
  `gmail.send`, Calendar, Contacts là sensitive; CASA chỉ bắt buộc khi dữ
  liệu restricted đi qua máy chủ của nhà phát triển.
- BUILD-GUIDE.md / PRIVACY.md trong gói iOS (Privacy Policy URL hiện vẫn
  trỏ repo cũ `tro-ly-xeo`, cần sửa trước khi nộp xác minh).
