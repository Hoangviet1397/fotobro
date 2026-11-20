# Đăng nhập bằng Apple — Thiết kế v2.1 (APPLE-SIGNIN-PLAN.md)

> **Trạng thái:** THIẾT KẾ ĐÃ CẬP NHẬT cho plugin Capawesome, đang triển khai.
> Chỉ viết tài liệu + code theo doc — KHÔNG build, KHÔNG đẩy lên main,
> KHÔNG động vào build 10 đang chạy.
> **Ngày:** 20/11/2026 · **App:** FotoBro iOS v2.1 (sau v2.0 / build 10) · **Quyết định của Việt
> (11:36 20/11/2026):** tài khoản bằng Google / Apple, KHÔNG làm tài khoản
> email+mật khẩu riêng; dữ liệu vẫn local-first; đăng nhập không bắt buộc.
> **Plugin (Việt chốt hướng C lúc 12:18 20/11/2026):** `@capawesome/capacitor-apple-sign-in@0.1.5`
> — cổng G0 với plugin cũ `@capacitor-community/apple-sign-in@7.1.0` đã RỚT 12:16 20/11/2026
> (đòi `capacitor-swift-pm` 7.x trong khi app pin exact 8.6.2, xung đột tất định); thư mục
> làm việc đã khôi phục về baseline (test 120/120) trước khi đổi plugin.
> **Tài liệu liên quan:** `GOOGLE-SETUP.md`, `APP-STORE-READY.md` (§4, §10, §12),
> `PRIVACY.md`, `CLOUDKIT-PLAN.md`, `ONBOARDING.md`, `SECURITY-AUDIT.md`.

---

## 1. Bối cảnh — vì sao phải làm

- **Quy định Apple 4.8 (bắt buộc, không phải tùy chọn):** app nào có đăng nhập bên thứ ba
  (Google) thì **phải** có Sign in with Apple tương đương. Google sign-in đã lên build 10
  (Client ID iOS `613244728921-…apps.googleusercontent.com`, OAuth consent External/Testing).
  Nếu gửi duyệt mà chỉ có Google thì reviewer có thể trả về — `APP-STORE-READY.md` §4 đã
  ghi rủi ro này, và việc thêm Sign in with Apple sẽ **đóng rủi ro đó**.
- **App ID đã sẵn sàng:** App ID `com.fotobro.app` đã bật capability Sign in with Apple từ
  lúc tạo (20/11/2026). Không cần Việt làm thêm bước nào trên Apple Developer.
- **Tài khoản để làm gì (theo kế hoạch Việt duyệt):** chỉ để **nhận diện người dùng** —
  hiện tên trong Cài đặt, đăng xuất khi cần, sau này dùng làm định danh cho đồng bộ CloudKit
  Nấc 2. Không có mật khẩu FotoBro riêng, không có máy chủ lưu tài khoản, không bắt buộc
  đăng nhập mới dùng được app.

---

## 2. Yêu cầu — MVP v2.1

### 2.1 Trong phạm vi (MVP)

| # | Yêu cầu |
|---|---------|
| M1 | Nút **“Đăng nhập bằng Apple”** trong Cài đặt → mục **Tài khoản** mới (đặt trên mục “Kết nối Google” hiện tại). Chỉ hiện khi chạy native iOS (plugin có sẵn); bản web ẩn nút như các tính năng native khác. |
| M2 | Bấm nút → mở **sheet đăng nhập native của iOS** (ASAuthorizationAppleIDProvider). Không mở trình duyệt, không dùng web flow. |
| M3 | Sau khi đăng nhập: Cài đặt hiện **tên + email (hoặc email ẩn)** của tài khoản Apple, kèm nút **Đăng xuất**. |
| M4 | Đăng xuất: xoá định danh Apple khỏi máy (không xoá job/tiền/cài đặt khác), hiện lại nút đăng nhập. Không cần gọi API thu hồi nào (xem §6). |
| M5 | Đăng nhập **không bắt buộc**: app chạy đầy đủ khi chưa đăng nhập; không chặn màn Hôm nay, không chặn onboarding. |
| M6 | Chuỗi vi/en đầy đủ cho mọi nhãn mới (theo i18n tối thiểu hiện tại: `loc()` trong `www/index.html` dòng ~998). |
| M7 | Mục **Tài khoản** trong màn chào lần đầu (tuỳ chọn, không bắt buộc) — **chỉ khi** onboarding trong `ONBOARDING.md` được code trong cùng bản; nếu onboarding chưa làm thì M7 dời sang bản sau, không chặn M1–M6. |
| M8 | Cập nhật `PRIVACY.md` + `APP-STORE-READY.md` (§10, §12) cho đúng với việc lưu định danh Apple cục bộ (xem §7). |

### 2.2 Ngoài phạm vi (KHÔNG làm ở v2.1)

- Đăng nhập Apple trên **bản web** (GitHub Pages): cần Services ID + domain đăng ký + xác thực
  token phía server — không có server nên không làm.
- **Xác thực identityToken phía server** (không có server; token chỉ để đó, xem §5).
- Ràng buộc định danh Apple với **CloudKit** (Nấc 2 có kế hoạch riêng trong `CLOUDKIT-PLAN.md`;
  CloudKit dùng user record của nó, không dùng Apple sign-in user ID — đừng lẫn hai thứ).
- Tài khoản email+mật khẩu riêng của FotoBro (Việt đã quyết không làm).
- Đồng bộ / khôi phục tài khoản qua đám mây (định danh chỉ nằm trên máy này).

### 2.3 Tiêu chí chấp nhận (acceptance criteria)

1. Trên iPhone thật (TestFlight): bấm “Đăng nhập bằng Apple” → sheet iOS hiện → đăng nhập
   xong Cài đặt hiện đúng tên + email; tắt app mở lại vẫn còn (đã lưu).
2. Đăng nhập lần 2 (cùng Apple ID): vẫn thành công, không lỗi dù Apple **không trả lại
   tên/email lần 2** (xem §8 R2).
3. Bấm Huỷ trên sheet: app im lặng quay lại, **không** hiện toast lỗi.
4. Bật “Ẩn email của tôi”: app lưu email relay `@privaterelay.appleid.com`, không crash,
   không tự điền email relay vào mẫu email cho khách (xem §8 R3).
5. Đăng xuất: tên/email biến mất khỏi Cài đặt, app vẫn dùng bình thường.
6. Thu hồi quyền trong iPhone Cài đặt → Apple ID → Sign in with Apple → FotoBro, rồi đăng
   nhập lại trong app: thành công, định danh được làm mới.
7. Bản web (GitHub Pages): không có nút Apple, không lỗi JS, mọi test cũ vẫn đạt.
8. Test jsdom: **120/120 + test mới** (xem §9) đạt; `npx cap sync ios` xong md5
   `www/index.html` = `ios/App/App/public/index.html`.
9. Build GitHub Actions (Xcode 26.3) xanh, `.ipa` lên App Store Connect; khai Export
   Compliance như mọi build; build vào nhóm Internal.
10. App Review: không bị trả về vì Guideline 4.8 (Sign in with Apple đã có mặt và hoạt động).

---

## 3. Nghiên cứu plugin — kết quả kiểm chứng trực tiếp (20/11/2026)

Plugin: **`@capawesome/capacitor-apple-sign-in`**, bản **`0.1.5`** (Việt chốt hướng C
12:18 20/11/2026). Plugin cũ `@capacitor-community/apple-sign-in@7.1.0` đã bị loại ở
cổng G0 (xem §3.1 cuối mục) — toàn bộ mục này viết cho plugin Capawesome.

### 3.1 Kết luận lớn nhất: 0.1.5 tương thích Capacitor 8 — không xung đột SwiftPM

- Đã tải tarball `0.1.5` từ npm registry và đọc trực tiếp: **`Package.swift` có mặt**,
  iOS source tại `ios/Plugin/AppleSignInPlugin.swift` + `AppleSignIn.swift`.
- `peerDependencies`: `@capacitor/core >= 8.0.0` → tương thích Capacitor 8 về mặt khai báo.
- `Package.swift` (đọc trực tiếp từ tarball): `swift-tools-version: 5.9`,
  `platforms: [.iOS(.v15)]`, phụ thuộc
  `.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")`.
- **Không xung đột:** `from: "8.0.0"` cho SwiftPM nghĩa là `>= 8.0.0, < 9.0.0` → giao
  với `exact 8.6.2` mà app pin trong `ios/App/CapApp-SPM/Package.swift` cho ra **8.6.2**.
  Mini-G0 (§9) vẫn phải kiểm chứng lại bằng `cap sync` thật trước khi viết code.
- Yêu cầu iOS: plugin cần **iOS 15+** (`platforms: .iOS(.v15)`); Sign in with Apple cần
  iOS 13+. App FotoBro đặt `IPHONEOS_DEPLOYMENT_TARGET = 15.0` → **đạt đúng ngưỡng**.
- **Lịch sử plugin cũ (để khỏi quay lại):** `@capacitor-community/apple-sign-in@7.1.0`
  (02/10/2025) ĐÃ có `Package.swift` (SPM, commit #127) nhưng đòi
  `capacitor-swift-pm from: "7.0.0"` (< 8.0.0) trong khi app pin exact 8.6.2 →
  xung đột tất định, cổng G0 rớt 12:16 20/11/2026. Đừng dùng lại plugin này chừng nào
  chưa có bản 8.x.

### 3.2 API thật (đọc từ `dist/esm/definitions.d.ts` + `ios/Plugin/*.swift` trong tarball 0.1.5)

```ts
AppleSignIn.signIn(options?: SignInOptions): Promise<SignInResult>  // jsName: "AppleSignIn"
interface SignInOptions { redirectUrl?: string; scopes?: SignInScope[]; nonce?: string; state?: string; }
enum SignInScope { Email = "EMAIL", FullName = "FULL_NAME" }
interface SignInResult {            // KẾT QUẢ PHẲNG, không bọc trong `response`
  authorizationCode: string;        // dùng 1 lần, để đổi token phía server (v2.1 không có server)
  idToken: string;                  // JWT, hiệu lực ~10 phút (tên khác plugin cũ: identityToken)
  user: string;                     // Apple user ID ổn định của (team, người dùng) — dùng làm định danh
  email: string | null;             // CHỈ lần đăng nhập đầu tiên
  givenName: string | null;         // CHỈ lần đăng nhập đầu tiên
  familyName: string | null;        // CHỈ lần đăng nhập đầu tiên
  realUserStatus?: RealUserStatus;  // "LIKELY_REAL" | "UNKNOWN" | "UNSUPPORTED" — chỉ iOS
}
enum ErrorCode { SignInCanceled = "SIGN_IN_CANCELED" }
```

Hành vi iOS thật (đọc `AppleSignInPlugin.swift` + `AppleSignIn.swift`):

- Dùng **`ASAuthorizationAppleIDProvider` + `ASAuthorizationController`** — sheet native
  của iOS, không qua trình duyệt.
- **Không cần `clientId`/`redirectURI` trên iOS:** `SignInOptions` chỉ đọc `scopes`
  (`EMAIL` → `.email`, `FULL_NAME` → `.fullName`) và `nonce` từ lời gọi; `redirectUrl`
  và `state` chỉ dùng cho Android/Web. `initialize({clientId})` cũng chỉ cần cho
  Android/Web — **trên iOS không gọi `initialize()`**. **Không cần** tạo Services ID
  trên Apple Developer cho luồng native.
- `scopes`: truyền mảng `['EMAIL', 'FULL_NAME']` để xin cả hai (mặc định rỗng = không xin gì).
- Lỗi: người dùng bấm Huỷ (`ASAuthorizationError.canceled`) → plugin đổi thành
  `CustomError.signInCanceled` → `call.reject(message, "SIGN_IN_CANCELED")` — **mã lỗi
  có cấu trúc**, code JS chỉ cần kiểm tra `e.code === 'SIGN_IN_CANCELED'` (xem §4.3),
  không phải dò chuỗi `canceled`/`1001` như plugin cũ.
- **Không có force-unwrap token:** `SignInResult.init` dùng `?? ""` khi
  `identityToken`/`authorizationCode` nil → không crash native như plugin cũ (§8 R4 cũ
  không còn áp dụng). Token nil thì trả chuỗi rỗng — bridge vẫn không trả token về cho
  `index.html` (§4.3).
- Plugin **không có API kiểm tra trạng thái credential** (`getCredentialState`). v2.1 không
  cần: thu hồi quyền chỉ xử lý bằng cách đăng nhập lại (xem §6, §8 R5).
- Bản web của plugin (`dist/esm/web.js`) cần Services ID + `initialize()` → **không dùng**
  cho FotoBro web (xem §2.2).

### 3.3 Cần thêm ở phía Apple Developer / Xcode

| Hạng mục | Trạng thái hiện tại | Việc cần làm ở v2.1 |
|---|---|---|
| Capability Sign in with Apple trên **App ID** | **Đã bật** từ lúc tạo App ID (20/11/2026) | Không cần gì thêm |
| Capability trong **Xcode project** | **Chưa có** — `project.pbxproj` không có `CODE_SIGN_ENTITLEMENTS`, chưa có file `.entitlements` | Thêm capability “Sign in with Apple” trong Xcode → sinh file `.entitlements` chứa `com.apple.developer.applesignin = Default`; commit file này |
| Provisioning profile “FotoBro App Store” | Tạo sau khi App ID đã có capability → nhiều khả năng đã gồm capability | Kiểm chứng ở build thử: nếu Xcode báo profile thiếu capability thì tạo lại profile (Việt làm qua trình duyệt như lần trước) |
| `Info.plist` | Không cần thêm URL scheme cho Apple (khác Google) | Không đổi |

---

## 4. Điểm tích hợp chính xác

### 4.1 `package.json` + `package-lock.json`

- Thêm `"@capawesome/capacitor-apple-sign-in": "0.1.5"` — **pin đúng bản, không dùng `^`**,
  cho tới khi mini-G0 (§9) đạt. (Nếu mini-G0 rớt → xem §8 R1.)
- Chạy `npm install` (chỉ cập nhật lockfile), rồi `npx cap sync ios`.
- **Không** cài `@capacitor-community/apple-sign-in` hay plugin Apple nào khác song song
  (tránh 2 plugin cùng đăng ký Sign in with Apple).

### 4.2 `ios/App/App.xcodeproj` (qua Xcode / `cap sync`)

- Thêm capability Sign in with Apple → file `.entitlements` mới (xem §3.3).
- Kiểm chứng `ios/App/CapApp-SPM/Package.swift` sau `cap sync` có plugin, và
  `Package.resolved` resolve `capacitor-swift-pm` ở bản nào (cổng G0).

### 4.3 `www/capacitor-bridge.js` — thêm mục 7 (theo đúng mẫu các mục 1–6)

Bridge là chỗ duy nhất chạm plugin native (giữ `index.html` không gọi
`window.Capacitor.Plugins.*` trực tiếp — trừ Calendar đã làm sẵn theo lối cũ, không đổi).
Thêm cuối file, trước `void isIOS;`:

```js
/* ---------- 7. Đăng nhập bằng Apple (v2.1) ---------- */
// Plugin @capawesome/capacitor-apple-sign-in 0.1.5 — jsName "AppleSignIn".
// Chỉ native iOS. Trả về { user, email, givenName, familyName } hoặc null khi
// người dùng bấm Huỷ (không toast lỗi). Lỗi thật thì throw để index.html toast.
// idToken / authorizationCode KHÔNG trả về cho index.html (v2.1 không có
// server để xác thực, giữ lại chỉ thêm rủi ro — xem APPLE-SIGNIN-PLAN.md §5).
// Không gọi initialize() — chỉ cần cho Android/Web.
window.__fotobroAppleSignIn = async function () {
  var SIA = P.AppleSignIn;
  if (!SIA || !SIA.signIn) return null; // plugin chưa có (web / build cũ)
  var nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  var r;
  try {
    r = await SIA.signIn({ scopes: ['EMAIL', 'FULL_NAME'], nonce: nonce });
  } catch (e) {
    if (e && e.code === 'SIGN_IN_CANCELED') return null; // người dùng bấm Huỷ: im lặng
    throw e;
  }
  r = r || {};
  return { user: r.user || null, email: r.email || null,
           givenName: r.givenName || null, familyName: r.familyName || null };
};
window.__fotobroAppleAvailable = function () {
  return !!(P.AppleSignIn && P.AppleSignIn.signIn);
};
```

Lưu ý khi code (để agent làm v2.1 đọc):

- `signIn()` reject với `e.code === 'SIGN_IN_CANCELED'` khi người dùng Huỷ → bridge
  **bắt mã này và trả `null`**, chỉ throw lỗi khác. Kiểm chứng mã lỗi trên iPhone thật
  ở cổng kiểm tra (plugin gán mã có cấu trúc, đã đọc trong `CustomError.swift`).
- Không truyền `clientId`/`redirectUrl`/`state` — iOS không dùng (xem §3.2); chỉ truyền
  `scopes` + `nonce`. Không gọi `initialize()` trên iOS.
- Kết quả của plugin là **phẳng** (`r.user`, không phải `r.response.user` như plugin cũ).
- Không gọi `signIn()` khi `!isNativeApp()` — index.html guard trước khi gọi bridge,
  giống cách guard `gConnect()`.

### 4.4 `www/index.html` — hàm mới (đặt cạnh cụm Google, sau `gLinked()` ~dòng 3155)

Mirroring cụm Google (`gConnect` / `gLinked` / `gDisc`), nhưng đơn giản hơn nhiều vì
không có token hết hạn, không có scope từng tính năng:

```js
function aLinked(){ return !!(state.cfg.apple && state.cfg.apple.user); }
async function aConnect(){
  if (!isNativeApp() || typeof window.__fotobroAppleSignIn !== 'function'){ toast('Đăng nhập bằng Apple chỉ có trên app iPhone', 'warn'); return; }
  var r = null;
  try { r = await window.__fotobroAppleSignIn(); } catch (e) { toast('Chưa đăng nhập được bằng Apple, thử lại nha', 'warn'); return; }
  if (!r || !r.user) return; // người dùng bấm Huỷ: im lặng
  var name = [r.givenName, r.familyName].filter(Boolean).join(' ').trim();
  var prev = (state.cfg.apple && state.cfg.apple.user === r.user) ? state.cfg.apple : null;
  state.cfg.apple = {
    user: String(r.user),
    name: name || (prev && prev.name) || '',               // tên CHỈ có lần đầu — giữ lại tên cũ nếu lần này không có
    email: r.email || (prev && prev.email) || '',
    relay: !!r.email && /@privaterelay\.appleid\.com$/.test(r.email),
    at: Date.now()
  };
  saveLocal(); renderAll(); refreshSettings();
  toast('Đã đăng nhập bằng Apple', 'ok');
}
function aDisconnect(){
  actionSheet({ title:'Đăng xuất Apple ID?', msg:'Chỉ xoá tên và email Apple khỏi máy này. Job, tiền và cài đặt vẫn giữ nguyên. Muốn Apple quên hẳn FotoBro thì vào iPhone Cài đặt → Apple ID → Đăng nhập bằng Apple → FotoBro.', actions:[{ label:'Đăng xuất', destructive:true, fn:function(){
    state.cfg.apple = null; saveLocal(); renderAll(); refreshSettings();
    toast('Đã đăng xuất Apple ID', 'del');
  } }] });
}
```

### 4.5 `www/index.html` — `DEFAULT_CFG` + `mergeCfg()` (~dòng 864–900)

- Thêm vào `DEFAULT_CFG`: `apple:null`.
- Thêm dòng sanitize trong `mergeCfg()` (sau dòng xử lý `o.logo`, cùng kiểu các dòng
  `o.gFeat`/`o.theme`):
  ```js
  o.apple = (o.apple && typeof o.apple === 'object' && typeof o.apple.user === 'string' && o.apple.user)
    ? { user:cleanStr(o.apple.user, 200), name:cleanStr(o.apple.name || '', 80),
        email:cleanStr(o.apple.email || '', 120), relay:o.apple.relay === true, at:+o.apple.at || 0 }
    : null;
  ```
  Nhờ vòng lặp chung của `mergeCfg()`, `cfg.apple` tự được giữ/khôi phục qua backup JSON
  mà không cần code riêng. **Không** tạo key localStorage riêng (tránh tách dữ liệu làm
  hai nơi — đúng quy ước trong `capacitor-bridge.js`).

### 4.6 `www/index.html` — UI Cài đặt (mục “Tài khoản” mới, đặt ngay trên mục “Kết nối Google” ~dòng 2514)

Render trong `refreshSettings()` (cùng chỗ render mục Google), theo đúng mẫu hàng
`.row` / `.list` hiện tại:

- **Chưa đăng nhập** (native iOS, plugin có sẵn):
  hàng nút `id="aConnRow"` — icon `person`, tiêu đề `Đăng nhập bằng Apple` (en: `Sign in with Apple`),
  phụ đề `Dùng Apple ID của bạn — không cần tạo tài khoản mới` (en: `Use your Apple ID — no new account needed`).
  Nút phải dùng **chữ + logo Apple theo đúng HIG** (logo  do `I()` chưa có icon Apple →
  thêm icon `apple` vào bộ icon, hoặc dùng chữ “” + chữ; **không** tự vẽ logo sai chuẩn).
- **Đã đăng nhập:** hàng trạng thái (icon check xanh) `Đã đăng nhập bằng Apple` + tên/email
  (email relay thì thêm chú thích `Email ẩn của Apple`), nút `Làm mới` không cần (không có
  token hết hạn), nút destructive `id="aDisc"` `Đăng xuất Apple ID`.
- **Bản web / plugin vắng:** không render mục Tài khoản (ẩn hẳn như cách mục Google ẩn khi
  chưa có Client ID), không hiện chữ “sẽ có ở bản sau” — vì đây là tính năng native-only
  theo thiết kế.
- Handler (cạnh `gcr`/`gds` ~dòng 2636–2655): `$('#aConnRow').click → aConnect()`,
  `$('#aDisc').click → aDisconnect()`.

### 4.7 Màn chào lần đầu (M7 — có điều kiện)

- `ONBOARDING.md` hiện **mới là thiết kế, chưa code**. Nếu onboarding được code trong
  cùng bản v2.1: thêm vào màn cuối (form “Cho app biết về bạn”) một hàng tuỳ chọn
  “Đăng nhập bằng Apple (không bắt buộc)” + nút “Bỏ qua” vẫn vào thẳng Hôm nay.
- Nếu onboarding chưa làm: **bỏ M7**, chỉ làm M1–M6. Không chặn bản vì M7.

### 4.8 `www/fotobro-config.js` — KHÔNG đổi

Luồng Apple native không cần Client ID, không cần redirect scheme, không cần Services ID.
Không thêm gì vào file này.

---

## 5. Dữ liệu lưu trữ

### 5.1 Lưu gì — và lưu ở đâu

| Trường (`state.cfg.apple`) | Nguồn | Ghi chú |
|---|---|---|
| `user` | `user` (kết quả phẳng của `signIn()`) | **Định danh chính.** ID ổn định của cặp (team FotoBro, Apple ID người dùng), dạng `000XXX.…`. Dùng để biết “đã đăng nhập là ai”. Không phải secret, nhưng cũng không hiện ra ngoài app. |
| `name` | `givenName + familyName` | **Chỉ có ở lần đăng nhập đầu.** Phải lưu ngay lần đầu; các lần sau Apple trả `null` → giữ tên cũ (code ở §4.4 đã làm). Nếu lần đầu người dùng không cho tên thì để trống, cho sửa tay ở Cài đặt → Thông tin (ô “Tên gọi” đã có). |
| `email` | `email` | **Chỉ có ở lần đăng nhập đầu**, có thể là email thật hoặc **email ẩn relay** `@privaterelay.appleid.com`. Lưu y như nhận được. |
| `relay` | suy ra từ hậu tố email | `true` nếu là email ẩn → UI ghi chú “Email ẩn của Apple”. |
| `at` | `Date.now()` | Thời điểm đăng nhập lần cuối (để hiển thị / gỡ lỗi). |

- **Nơi lưu:** trong `troLyXeo.v1` → `state.cfg.apple` (localStorage, cùng chỗ với toàn bộ
  cài đặt). Không tạo key riêng, không dùng Preferences plugin cho dữ liệu này.
- **Backup JSON** (`fotobro-sao-luu.json`) sẽ chứa `cfg.apple` như mọi trường cfg khác —
  chấp nhận được (ID ẩn danh theo app, không phải credential). Ghi chú trong `BACKUP-V2.md`
  khi sửa file đó (không bắt buộc ở v2.1).
- **`wipeAll()` tự xoá:** `troLyXeo.v1` đã nằm trong `WIPE_KEYS` (dòng 2416) → “Xoá hết
  dữ liệu” trong Cài đặt xoá luôn định danh Apple. **Không cần** thêm key mới vào `WIPE_KEYS`.

### 5.2 KHÔNG lưu (quyết định bảo mật)

| Thứ | Vì sao không lưu |
|---|---|
| `idToken` (JWT) | Hiệu lực ~10 phút, chỉ có ý nghĩa khi có server xác thực. v2.1 không có server → giữ lại chỉ thêm rủi ro (token rò qua backup JSON). Bridge không trả nó về cho `index.html` (§4.3). |
| `authorizationCode` | Dùng 1 lần, để đổi token phía server. Không có server → bỏ. |
| Mật khẩu / mã PIN Apple | Không bao giờ tồn tại ở phía app (sheet iOS xử lý hết). |

### 5.3 Không có xác thực phía server ở v2.1 — hệ quả

- App **tin** `user` mà sheet iOS trả về (sheet do hệ điều hành hiện, không giả mạo được
  từ web). Đủ cho mục đích “nhận diện trên máy này”.
- `nonce` vẫn truyền vào `signIn()` (§4.3) để đúng chuẩn và để sau này có
  server thì dùng luôn; ở v2.1 **không có gì để đối chiếu** vì `signIn()` không trả
  lại `nonce`/`state`. Ghi rõ để người sau không tưởng đã xác thực xong.
- Khi Nấc 2 CloudKit cần định danh thật: dùng user record của CloudKit, **không** dùng
  Apple sign-in `user` (hai hệ ID khác nhau).

---

## 6. Đăng xuất & thu hồi quyền

| Thao tác | App làm gì | Người dùng làm gì thêm (nếu muốn) |
|---|---|---|
| **Đăng xuất trong app** (nút `aDisc`) | Xoá `cfg.apple`, `saveLocal()`, render lại. Job/tiền/cài đặt giữ nguyên. Không gọi mạng. | — |
| **Thu hồi quyền** | App không có API để thu hồi (plugin không expose; Apple cũng không có endpoint thu hồi client-side). | iPhone Cài đặt → Apple ID → Đăng nhập bằng Apple → FotoBro → “Ngừng sử dụng Apple ID”. Sau đó đăng nhập lại trong app để làm mới định danh. |
| **Xoá tài khoản (Guideline 5.1.1(v))** | App **không tạo tài khoản phía server** nên không có gì để xoá phía server. Việc “xoá tài khoản” trong app = Đăng xuất + **Xoá hết dữ liệu** (đã có trong Cài đặt, `wipeAll()`). | Ghi rõ điểm này trong Reviewer Notes khi submit (xem §7), để reviewer không hỏi link xoá tài khoản. |

---

## 7. Riêng tư & App Store

### 7.1 Guideline 4.8 — đóng rủi ro

- Sau v2.1, app có **cả hai** nút đăng nhập bên thứ ba (Google + Apple) → thỏa 4.8.
- Nút Apple phải **nổi bật tương đương** nút Google (cùng mục Tài khoản, cùng cỡ hàng),
  không giấu trong menu con.
- Cập nhật `APP-STORE-READY.md` §4: đổi rủi ro 4.8 thành “đã xử lý ở v2.1”.

### 7.2 App Privacy (“Data Not Collected”) — còn đúng không?

**Kết luận: vẫn đúng, nhưng phải ghi chú rõ khi submit.**

- Apple định nghĩa “thu thập” = dữ liệu **rời khỏi máy**. `cfg.apple` (user ID, tên, email)
  chỉ nằm trong localStorage trên máy, **không gửi lên bất kỳ máy chủ nào** (không có
  server FotoBro; Google/Apple cũng không nhận lại dữ liệu này từ app).
- Email relay `@privaterelay.appleid.com` cũng chỉ lưu cục bộ → không đổi kết luận.
- Tuy nhiên, vì tên/email là “Contact Info” theo bảng phân loại của Apple, khi trả lời
  App Privacy questionnaire phải trả lời đúng ngữ cảnh: dữ liệu có trên máy nhưng **không
  thu thập / không chia sẻ**. Ghi chú này vào `APP-STORE-READY.md` §10 bên cạnh ngoại lệ
  (a) Google và (b) CloudKit đã có.
- **Nếu sau này** Nấc 2 đồng bộ `cfg.apple` qua CloudKit → **phải khai lại** (dữ liệu lúc đó
  rời máy qua iCloud của Apple, khai theo hướng dẫn CloudKit). Ghi câu này vào
  `CLOUDKIT-PLAN.md` khi làm Nấc 2.
- `PrivacyInfo.xcprivacy` hiện tại (tracking false, không thu thập) **không cần đổi**
  ở v2.1 vì không thêm SDK thu thập nào.
- `PRIVACY.md`: thêm một đoạn ngắn mục dữ liệu tài khoản — “Đăng nhập bằng Apple chỉ lưu
  mã định danh Apple, tên và email (nếu bạn cho phép) **trên máy này**, không gửi lên máy
  chủ FotoBro; đăng xuất sẽ xoá.” (PRIVACY.md dòng ~89 đã nhắc Apple ID trong ngữ cảnh
  CloudKit — viết cho khớp, đừng mâu thuẫn.)

### 7.3 Việc nhỏ kèm theo (không phải MVP nhưng nên làm cùng lúc chạm Cài đặt)

- Cài đặt → Liên hệ (dòng ~2511) và `PRIVACY.html`/`SUPPORT.html` vẫn hardcode
  `support@fotobro.app` (hộp thư này không tồn tại) trong khi `FOTOBRO_CONFIG.supportEmail`
  đã là `supportfotobro@gmail.com` (thật, từ 20/11/2026). Khi sửa Cài đặt cho mục Tài khoản
  thì đổi luôn hàng Liên hệ sang dùng `supportEmail` trong config. Không để sang bản khác
  vì reviewer có thể bấm vào email chết.

---

## 8. Rủi ro & phương án dự phòng

| # | Rủi ro | Mức | Phương án |
|---|---|---|---|
| R1 | **SPM resolve kẹt (đã xảy ra với plugin cũ):** `@capacitor-community/apple-sign-in@7.1.0` đòi `capacitor-swift-pm from 7.0.0` (< 8.0.0) trong khi app pin exact 8.6.2 → cổng G0 rớt 12:16 20/11/2026. Plugin Capawesome đòi `from: "8.0.0"` → không xung đột, nhưng **vẫn phải qua mini-G0** (§9) trước khi viết code. | **Cao — mini-G0** | (a) Mini-G0 cho Capawesome (§9). (b) Nếu mini-G0 rớt: quay lại các hướng Việt đã cân nhắc — **fork** plugin cộng đồng sửa `from: "8.0.0"`, hoặc viết **plugin Swift tối thiểu tự làm** (~80 dòng, copy `Plugin.swift` gốc + `Package.swift` với `from: "8.0.0"`). (c) Không hạ Capacitor xuống 7 (app đang chạy ổn định trên Cap 8, build 10 đã lên TestFlight). |
| R2 | **Tên/email chỉ có lần đầu:** đăng nhập lần 2 Apple trả `null` → nếu lần đầu không lưu kịp (crash, user tắt app giữa chừng) thì mất tên/email vĩnh viễn cho Apple ID đó. | Trung bình | Lưu ngay trong `aConnect()` trước khi làm gì khác (§4.4 giữ tên/email cũ khi lần sau null). Nếu đã mất: hướng dẫn user vào iPhone Cài đặt → Apple ID → Đăng nhập bằng Apple → FotoBro → “Ngừng sử dụng”, rồi đăng nhập lại (lúc đó Apple coi như lần đầu và trả lại tên/email). Ghi hướng dẫn này vào HELP-CENTER.md. |
| R3 | **Email ẩn relay:** user chọn “Ẩn email” → app chỉ có `@privaterelay.appleid.com`. Không được tự điền email này vào mẫu email/báo giá cho khách (nó là email của chính user, không phải email khách — nhưng vẫn phải chú thích rõ để user không nhầm). Mailto tới relay thì Apple chuyển tiếp được, nhưng reply có thể bị lọc. | Thấp | UI ghi chú “Email ẩn của Apple” khi `relay === true`. Không dùng email Apple làm email mặc định trong mẫu gửi khách. |
| R4 | **Token nil (plugin Capawesome):** `SignInResult.init` dùng `?? ""` khi `identityToken`/`authorizationCode` nil → trả chuỗi rỗng, **không crash** (đã đọc code). Token rỗng thì bridge vẫn không trả về cho `index.html`, `aConnect()` chỉ cần `user` nên không ảnh hưởng. | Thấp | Không cần làm gì thêm ở v2.1. |
| R5 | **Thu hồi quyền không phát hiện được:** plugin không có `getCredentialState`; user thu hồi trong Cài đặt iPhone mà app không biết, vẫn hiện “Đã đăng nhập”. | Thấp | Chấp nhận ở v2.1 (định danh chỉ dùng hiển thị + nhận diện cục bộ, không dùng để gọi API nào). Lần đăng nhập sau sẽ làm mới. Không tự viết thêm native code check state ở v2.1. |
| R6 | **Plugin mới (0.1.x):** Capawesome mới ở bản `0.1.5`; API có thể đổi ở các bản sau (ví dụ đổi tên hàm/trường). | Thấp–Trung bình | Pin đúng `0.1.5`. Khi nâng cấp plugin sau này thì đọc lại `definitions.d.ts` và chạy lại toàn bộ test §9 trước khi đẩy. |
| R7 | **Reviewer test bằng Apple ID mới:** reviewer đăng nhập lần đầu sẽ thấy sheet xin tên/email; nếu reviewer chọn “Ẩn email” thì tên/email trong app có thể trống → reviewer tưởng lỗi. | Thấp | Khi không có tên thì Cài đặt hiện “Đã đăng nhập bằng Apple” + user ID rút gọn (không hiện hàng trống). Ghi vào Reviewer Notes: “Sign in with Apple là tuỳ chọn; tên/email chỉ Apple trả lần đầu, có thể trống nếu reviewer ẩn email.” |
| R8 | **Nhầm với tài khoản Google:** user tưởng đăng nhập Apple thì có luôn Lịch/Gmail (như Google). | Thấp | Phụ đề nút Apple ghi rõ “chỉ để nhận diện, không nối Lịch/Gmail — nối Google ở mục dưới”. Mục Google giữ nguyên. |

---

## 9. Kế hoạch kiểm tra

### Mini-G0 — kiểm chứng plugin Capawesome TRƯỚC KHI viết code tính năng (bắt buộc)

Trên **nhánh thử riêng** (không phải main, không động build 10):

1. `npm view @capawesome/capacitor-apple-sign-in version` — xác nhận bản mới nhất
   (kỳ vọng vẫn 0.1.5; nếu có bản mới thì đọc lại `Package.swift` của bản đó).
2. `npm install --save-exact @capawesome/capacitor-apple-sign-in@0.1.5` (nhánh thử).
3. `npx cap sync ios` — **xem có lỗi resolve `capacitor-swift-pm` không**; mở
   `ios/App/CapApp-SPM/Package.swift` kiểm tra plugin có mặt và `capacitor-swift-pm`
   vẫn `exact 8.6.2` (giao của `from: "8.0.0"` với `exact 8.6.2` phải ra 8.6.2).
4. Build thử trên GitHub Actions (workflow `ios-build.yml` hiện tại, Xcode 26.3) — chỉ cần
   tới bước Archive thành công (không cần upload TestFlight ở nhánh thử; đặt
   `upload_testflight: false`).
5. **Đạt** → chốt dùng plugin, chuyển sang G1. **Rớt** → làm §8 R1(b) fork hoặc plugin
   tự làm, rồi quay lại mini-G0. Không viết code tính năng khi mini-G0 chưa đạt.

### Kiểm tra jsdom (thêm vào `test-fotobro-v2.js`, chạy `NODE_PATH=… node test-fotobro-v2.js`)

Lưu ý: test chỉ tải `www/index.html`, KHÔNG tải `capacitor-bridge.js` (jsdom không
tải script ngoài) — nên mock trực tiếp `window.__fotobroAppleSignIn` /
`window.__fotobroAppleAvailable` (đúng hợp đồng của bridge, §4.3) qua `beforeParse`,
và mock `window.Capacitor = { isNativePlatform: () => true }` để `isNativeApp()`
trả true. Riêng test bridge (§4.3) tải `capacitor-bridge.js` trong một JSDOM riêng
với `window.Capacitor.Plugins.AppleSignIn` đã mock.

| Test mới | Kiểm tra |
|---|---|
| `apple row hidden on web` | Không có `window.Capacitor` → Cài đặt không render mục Tài khoản / nút Apple. |
| `apple row shown when plugin present` | Mock `__fotobroAppleAvailable = () => true`, `__fotobroAppleSignIn = async () => ({user:'000123.abc', email:'a@privaterelay.appleid.com', givenName:'Mai', familyName:'Anh'})` → render Cài đặt có nút Apple; bấm → `cfg.apple.user === '000123.abc'`, `relay === true`. |
| `apple bridge maps flat result + strips tokens` | JSDOM riêng tải bridge: mock `AppleSignIn.signIn` trả `{user, email, givenName, familyName, idToken:'FAKE', authorizationCode:'FAKE', realUserStatus:'LIKELY_REAL'}` → `__fotobroAppleSignIn()` trả đúng 4 trường, không có `idToken`/`authorizationCode`. |
| `apple bridge cancel is silent` | JSDOM riêng tải bridge: mock `signIn` reject lỗi `{code:'SIGN_IN_CANCELED'}` → `__fotobroAppleSignIn()` trả `null` (không throw). |
| `apple bridge real error throws` | JSDOM riêng tải bridge: mock `signIn` reject lỗi khác → `__fotobroAppleSignIn()` throw. |
| `apple cancel is silent` | Mock `__fotobroAppleSignIn` trả `null` (người dùng Huỷ) → `cfg.apple` vẫn `null`, không có toast lỗi. |
| `apple second sign-in keeps name` | `cfg.apple` đã có tên; mock lần 2 trả `email/givenName/familyName = null` → tên/email cũ còn nguyên. |
| `apple sign-out clears` | `aDisconnect()` → `cfg.apple === null`, job/tiền không đổi. |
| `apple survives mergeCfg + wipeAll` | `mergeCfg({apple:{user:'x',…}})` giữ nguyên; `wipeAll()` xoá `troLyXeo.v1` (đã có test wipe — chỉ thêm assert `cfg.apple` mất). |
| `no idToken stored` | Mock `__fotobroAppleSignIn` trả kèm `idToken:'FAKE-ID-TOKEN'` → sau `aConnect()` thành công, `JSON.stringify(localStorage)` không chứa `FAKE-ID-TOKEN`. |

Mục tiêu: **120/120 cũ + test mới, tất cả đạt**; `node --check` cho mọi script inline;
md5 `www/index.html` = `ios/App/App/public/index.html` sau `cap sync`.

### Kiểm tra trên iPhone thật (TestFlight, build v2.1)

1. Cài build v2.1, mở Cài đặt → mục Tài khoản có nút “Đăng nhập bằng Apple” (sáng/tối đều đọc được).
2. Đăng nhập bằng Apple ID thật, chọn **chia sẻ email thật** → Cài đặt hiện tên + email thật.
3. Đăng xuất → đăng nhập lại (cùng Apple ID) → vẫn vào được, tên/email còn (lấy từ lần đầu đã lưu).
4. Đăng xuất → đăng nhập lại, lần này chọn **Ẩn email** → hiện email relay + chú thích “Email ẩn của Apple”.
5. Bấm nút rồi bấm **Huỷ** trên sheet → về Cài đặt im lặng, không toast lỗi.
6. iPhone Cài đặt → Apple ID → Đăng nhập bằng Apple → FotoBro → “Ngừng sử dụng Apple ID”
   → mở app, đăng nhập lại → thành công, định danh mới.
7. Tắt mạng → bấm đăng nhập Apple: sheet iOS vẫn mở được (Apple xử lý), lỗi mạng thì toast
   “thử lại” bình thường, app không treo.
8. Toàn bộ app vẫn dùng được khi **chưa đăng nhập** (Hôm nay, job, tiền, Google).
9. Kiểm tra dark mode + chữ to (Dynamic Type) ở mục Tài khoản mới.
10. Kiểm tra tài khoản demo cho App Review: ghi vào Reviewer Notes rằng reviewer dùng
    Apple ID của họ (sandbox) là được, không cần tài khoản demo FotoBro.

---

## 10. Thứ tự triển khai (cho agent làm v2.1)

| Bước | Việc | Cổng |
|---|---|---|
| 0 | Đọc lại doc này + `GOOGLE-SETUP.md` §4.8 + `SECURITY-AUDIT.md` (H1/H2/H3). Không code khi chưa đọc. | — |
| G0 | Mini-G0: cài plugin Capawesome 0.1.5 → `cap sync` → kiểm tra `Package.swift` (xem §9). Rớt → fork / plugin tự làm (§8 R1). | **Chặn** |
| G1 | Xcode: thêm capability Sign in with Apple → commit `.entitlements`. Kiểm tra profile gồm capability. | Build thử đạt |
| G2 | `capacitor-bridge.js` mục 7 (§4.3) + `index.html` §4.4–§4.6 + `DEFAULT_CFG`/`mergeCfg` (§4.5) + chuỗi vi/en (§4.6). | jsdom đạt |
| G3 | `PRIVACY.md` (§7.2) + `APP-STORE-READY.md` §4/§10 (§7.1–7.2) + hàng Liên hệ dùng `supportEmail` (§7.3). | Review doc |
| G4 | Test jsdom mới (§9) + `cap sync` + md5 + `node --check`. | 120+ đạt |
| G5 | Đẩy lên nhánh `apple-signin` (không đẩy workflow qua `push-files` — xem bài học cũ), build TestFlight, khai Export Compliance, kiểm tra trên iPhone thật theo §9. | TestFlight đạt |

### File thay đổi (dự kiến)

| File | Thay đổi |
|---|---|
| `package.json`, `package-lock.json` | Thêm `@capawesome/capacitor-apple-sign-in@0.1.5` (pin đúng) |
| `www/capacitor-bridge.js` | Thêm mục 7: `__fotobroAppleSignIn()`, `__fotobroAppleAvailable()` |
| `www/index.html` | `DEFAULT_CFG.apple`, sanitize trong `mergeCfg()`, `aLinked/aConnect/aDisconnect`, mục Tài khoản trong Cài đặt, handler, chuỗi vi/en |
| `ios/App/App.xcodeproj/project.pbxproj` + `ios/App/App/*.entitlements` (mới) | Capability Sign in with Apple |
| `ios/App/CapApp-SPM/Package.swift`, `Package.resolved` | Tự sinh bởi `cap sync` (không sửa tay) |
| `PRIVACY.md`, `APP-STORE-READY.md`, `HELP-CENTER.md` | Đoạn tài khoản Apple (§7.2), đóng rủi ro 4.8, hướng dẫn mất tên/email (§8 R2) |
| `test-fotobro-v2.js` | Test mới §9 |
| `CHANGELOG-v2.1.md` (mới) | Ghi tính năng + mini-G0 |

### File KHÔNG đổi

- `www/fotobro-config.js` (không cần Client ID Apple), `capacitor.config.ts` (không cần
  config plugin), `GOOGLE-SETUP.md` (luồng Google giữ nguyên), `Info.plist` (không cần
  scheme mới), `www/index.html` cụm Google (`gConnect`/`gDisc` giữ nguyên).

---

## 11. Nguồn kiểm chứng (đã đọc trực tiếp ngày 20/11/2026)

- npm registry: `@capawesome/capacitor-apple-sign-in` — bản `0.1.5`,
  `peerDependencies: { "@capacitor/core": ">=8.0.0" }`.
- Tarball `0.1.5` (`registry.npmjs.org/.../capacitor-apple-sign-in-0.1.5.tgz`): có
  `Package.swift` (`capacitor-swift-pm from: "8.0.0"`, iOS 15), `ios/Plugin/AppleSignInPlugin.swift`,
  `ios/Plugin/AppleSignIn.swift`, `ios/Plugin/Enums/CustomError.swift`,
  `ios/Plugin/Classes/Results/SignInResult.swift`,
  `ios/Plugin/Classes/Options/SignInOptions.swift`, `dist/esm/definitions.d.ts` — đã đọc tất cả.
- Plugin cũ đã loại: npm registry `@capacitor-community/apple-sign-in` — bản mới nhất `7.1.0`
  (phát hành 02/10/2025), `Package.swift` đòi `capacitor-swift-pm from: "7.0.0"` → xung đột
  với app pin exact 8.6.2; cổng G0 rớt 12:16 20/11/2026 (kiểm chứng trực tiếp).
- GitHub `ionic-team/capacitor-swift-pm`: có tag `8.6.2` (khớp Capacitor 8 của app).
- Code FotoBro đã đọc: `www/index.html` (cụm Google dòng ~3125–3410, Cài đặt dòng ~2514,
  `mergeCfg()` dòng ~866, `WIPE_KEYS` dòng 2416), `www/capacitor-bridge.js` (mục 1–6),
  `www/fotobro-config.js`, `capacitor.config.ts`, `package.json` (Capacitor 8.6.2),
  `ios/App/App.xcodeproj/project.pbxproj` (`IPHONEOS_DEPLOYMENT_TARGET = 15.0`, chưa có
  entitlements), `APP-STORE-READY.md` (§4 rủi ro 4.8, §10 “Data Not Collected”),
  `ONBOARDING.md` (thiết kế, chưa code), `PRIVACY.md` (dòng ~89 nhắc Apple ID).
