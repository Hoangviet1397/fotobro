# Rủi ro đã thấy — FotoBro lên App Store

> Đọc trước khi build và trước khi gửi Apple duyệt. Rủi ro xếp theo mức
> nghiêm trọng với bản v2.0. Ngày rà soát: 19/11/2026, trên source bản web
> v2.4 (commit 8008ec79) và project Capacitor 8.6.2 vừa tạo.
> **Cập nhật 20/11/2026 cho iOS v2.0** — các mục 1 và 4 đã lỗi thời, xem
> ghi chú cập nhật ngay dưới tiêu đề mỗi mục.
> Cách kiểm chứng từng mục đều ghi rõ: cái nào đã kiểm bằng code, cái
> nào chỉ kiểm được trên iPhone thật qua TestFlight.

## 1. 🟡 Google TẮT ở bản TestFlight v2.0 (chưa có Client ID) — code đã sẵn PKCE

> **CẬP NHẬT 20/11/2026 — phân tích dưới đây viết cho bản web v2.4, ĐÃ LỖI THỜI.**
> Code iOS v2.0 đã đổi sang **Authorization Code + PKCE** mở bằng trình duyệt
> hệ thống (`@capacitor/browser`) + deep-link `appUrlOpen`, redirect là
> reversed client ID `com.googleusercontent.apps.<id>:/oauth2redirect`
> (xem GOOGLE-SETUP.md §2c). Vấn đề còn lại duy nhất là **chưa có Client ID
> thật** — nên Google TẮT ở bản TestFlight v2.0, trong app đã ghi rõ, không
> khai thu thập dữ liệu Google ở bản này.

**Đã kiểm bằng code (chắc chắn):**

- Bản web đăng nhập Google bằng Implicit Flow (`response_type: 'token'`)
  với `redirect_uri = location.origin + location.pathname`
  (`gRedirectUri()` trong index.html) và `gConnect()` chặn khi
  `location.protocol !== 'https:' && location.hostname !== 'localhost'`.
- Trong Capacitor, app chạy trên **`capacitor://localhost`**:
  `location.origin` = `capacitor://localhost`, nên `redirect_uri` thành
  `capacitor://localhost/` — **không khớp** Authorized Redirect URI nào
  của Google OAuth client hiện tại (client web đăng ký origin
  `https://hoangviet1397.github.io`). Google sẽ từ chối với lỗi
  `redirect_uri_mismatch`.
- Thêm nữa, Google đã bỏ Implicit Flow cho client mới; client web hiện
  tại có thể vẫn chạy trên web, nhưng không có đường nào để nó
  chạy trong WKWebView mà không tạo client mới.
- Token Google hiện lưu trong `sessionStorage` (`troLyXeo.gtoken`) và
  lịch đã tải lưu trong `localStorage` (`troLyXeo.gcal`) — khi Google
  tắt, các mục Lịch / Tiền về từ Gmail / Khách hỏi / Danh bạ / Drive
  trong app sẽ trống, nhưng **job, thu chi, báo cáo vẫn chạy bình
  thường** vì không phụ thuộc Google.

**Quyết định đề xuất cho v1: TẮT Google trong bản App Store.**
Cụ thể: trong `www/index.html` của bản iOS, đặt `gFeat` mặc định toàn
`false` và ẩn nút "Kết nối Google" (hoặc để nút nhưng bấm vào thì báo
"Google sẽ có ở bản sau"). Bản web trên GitHub Pages giữ nguyên Google.
**Cần Việt chốt** (xem README.md).

**Đường làm lại cho v2.1 (nếu Việt muốn giữ Google):**
- Tạo **OAuth client loại iOS** mới trong Google Cloud Console với
  Bundle ID `com.fotobro.app` (loại iOS dùng redirect scheme riêng,
  không dùng origin web).
- Đổi luồng đăng nhập sang **Authorization Code + PKCE** mở bằng trình
  duyệt ngoài (`@capacitor/browser` + App plugin `appUrlOpen` với custom
  scheme `com.fotobro.app:/oauth2redirect`), thay cho
  `location.href = accounts.google.com/...` hiện tại.
- Đây là việc code thêm, không làm trong gói này.

## 2. 🔴 Web Speech API không chạy trên iOS — đã có plugin thay thế, CHƯA kiểm chứng

**Đã kiểm bằng code + tài liệu Apple/WebKit (chắc chắn về nguyên nhân):**

- Bản web dùng `window.SpeechRecognition || window.webkitSpeechRecognition`
  (`var SR = ...` trong index.html, nút `#micBtn` / `#homeMic`, ngôn ngữ
  `vi-VN`). Trên iOS WKWebView, `webkitSpeechRecognition` có tồn tại
  nhưng **im lặng không trả kết quả** (lỗi WebKit đã biết) — nút mic sẽ
  bấm được nhưng không nghe được gì, hoặc rơi vào thông báo "Máy này
  chưa nghe được giọng nói — gõ câu hỏi nha".
- **Đã chuẩn bị:** plugin `@capacitor-community/speech-recognition`
  **7.0.1** (miễn phí, maintained, bọc `SFSpeechRecognizer` của iOS),
  đã khai trong `package.json`, đã viết `www/capacitor-bridge.js` nối
  vào đúng nút mic hiện có (`#micBtn`, `#homeMic`) và giữ nguyên luồng
  xác nhận "Bạn nói là…" của bản web. `Info.plist` đã thêm
  `NSSpeechRecognitionUsageDescription` + `NSMicrophoneUsageDescription`.
- **Chưa kiểm chứng:** bridge chưa từng chạy trên iOS thật. Ngoài ra
  bridge cần **1 móc nối nhỏ trong index.html** (hàm giọng nói hiện nằm
  trong closure, không phải global) — xem đầu file
  `www/capacitor-bridge.js` (móc `window.__trolyxeoVoice` +
  `window.__trolyxeoNotifyJob`). Móc này **chưa thêm vào www/index.html**
  trong gói này (chỉ thêm thẻ `<script src="capacitor-bridge.js">`).
  Nếu không thêm móc, bridge tự tắt an toàn và mic rơi về gõ tay.
- Giọng **đọc lại** (`speechSynthesis`, giọng vi-VN) thì **giữ nguyên** —
  trên WKWebView iOS, `speechSynthesis` dùng giọng hệ thống và thường
  chạy được; nếu TestFlight thấy không đọc thì mới thay bằng plugin TTS.
- Xem thêm mục 4: chính plugin này cũng đang vướng SPM (rủi ro build).

## 3. 🟠 WebAuthn passkey / Face ID trong WKWebView — cần kiểm chứng, PIN vẫn là cứu cánh

**Đã kiểm bằng code (chắc chắn về khác biệt, chưa chắc về hành vi iOS):**

- Bản web tạo passkey với `rp: { name: 'FotoBro', id: location.hostname }`
  và kiểm tra với `rpId: location.hostname`. Trên web,
  `location.hostname` = `hoangviet1397.github.io`; trong Capacitor,
  `location.hostname` = **`localhost`**.
- Hệ quả: **passkey người dùng tạo trên bản web không mở được app native**
  (RP khác nhau) — người dùng phải tạo lại khoá trong app native. Và việc tạo
  passkey với RP ID `localhost` trong WKWebView **chưa được kiểm chứng**:
  iOS có thể yêu cầu Associated Domains / Apple App Site Association để
  passkey đồng bộ qua iCloud Keychain; trường hợp xấu nhất là tạo khoá
  thất bại.
- **Cứu cánh đã có sẵn trong app:** khoá PIN dự phòng (`troLyXeo.lock`
  lưu cả `id` passkey + `pin`). Nếu passkey lỗi, người dùng vẫn mở app bằng
  PIN. Khi test TestFlight: thử bật khoá → tắt app → mở lại bằng Face ID;
  nếu Face ID lỗi thì thử PIN; nếu cả hai lỗi thì **tắt khoá trong v1**
  (đổi mặc định khoá thành tắt trong bản iOS) và sửa ở v1.1.
- **Chưa làm trong gói này:** chưa cấu hình Associated Domains
  (`applinks` / `webcredentials`) vì chưa có domain riêng ngoài
  github.io — không nên gắn domain github.io vào app của người khác.

## 4. ✅ Plugin speech-recognition — ĐÃ XỬ LÝ (không còn chặn build)

> **CẬP NHẬT 20/11/2026 — ĐÃ XỬ LÝ: chọn phương án A.** Plugin
> `@capacitor-community/speech-recognition` đã **gỡ khỏi `package.json`**,
> mic dời sang **v2.1** (nút mic hiện báo "Giọng nói sẽ có ở bản v2.1").
> `npx cap sync ios` 20/11: `Package.swift` có đủ 10 plugin (gồm browser +
> calendar), không còn cảnh báo SPM. Phân tích gốc dưới đây giữ lại để tham khảo.

**Đã kiểm bằng lệnh thật trên Linux (chắc chắn):**

- Khi chạy `npx cap add ios`, Capacitor báo:
  `[warn] @capacitor-community/speech-recognition does not have a Package.swift`
  và plugin này **không có mặt** trong `ios/App/CapApp-SPM/Package.swift`
  (chỉ 8 plugin chính thức của Capacitor có mặt).
- Kiểm trong `node_modules/@capacitor-community/speech-recognition/`:
  plugin chỉ có `CapacitorCommunitySpeechRecognition.podspec`
  (CocoaPods) + `ios/Plugin/Plugin.swift` (có dùng `SFSpeechRecognizer`),
  **không có `Package.swift`**. Capacitor 8 build iOS bằng Swift Package
  Manager, không dùng CocoaPods nữa, nên Xcode sẽ không link được code
  native của plugin này — lỗi dự kiến ở bước `xcodebuild archive`:
  `No such module 'CapacitorCommunitySpeechRecognition'` hoặc plugin
  không đăng ký (nút mic im lặng).
- **Các phương án xử lý (chọn 1 trước khi build, theo thứ tự nên thử):**
  - **A. Bỏ plugin khỏi v1, mic dùng gõ tay + chờ plugin cập nhật.**
    An toàn nhất cho lần gửi đầu; giọng nói bổ sung ở v1.1. Nhược: mất
    1 tính năng quảng cáo chính (nói là làm).
  - **B. Thêm Package.swift shim cho plugin trong repo** (tạo file
    `Package.swift` trỏ tới `ios/Plugin/` rồi khai thêm dependency trong
    `ios/App/CapApp-SPM/Package.swift` — nhưng file này do Capacitor
    quản lý, `npx cap sync` sẽ ghi đè; phải làm bằng script sau sync
    hoặc fork plugin). Làm được nhưng **chưa kiểm chứng được trên Linux**,
    phải thử trên macOS runner.
  - **C. Đổi sang plugin giọng nói khác có hỗ trợ SPM** — ví dụ
    `@capawesome/speech-recognition` (có SPM, hỗ trợ Capacitor 8, có cả
    SpeechTranscriber on-device cho iOS 26+) nhưng **chỉ dành cho
    Capawesome Insiders (trả phí, cần licence key)** — không phù hợp
    nếu Việt không muốn trả phí hàng tháng.
  - **D. Viết plugin Capacitor tự làm** (Swift + SFSpeechRecognizer,
    ~200 dòng) — chắc chắn tương thích SPM, nhưng là việc code thêm,
    phải test trên máy thật.
- **Đề xuất của mình: thử B trên GitHub Actions trước; nếu B thất bại
  trong 1–2 lần chạy thì chuyển sang A cho v1** (đừng để giọng nói kẹt
  cả đợt phát hành). **Cần Việt chốt A hay B.**

## 5. 🔴 Dữ liệu web cũ KHÔNG tự chuyển sang app native — phải xuất / nhập tay

**Đã kiểm bằng code (chắc chắn):**

- Dữ liệu chính lưu ở `localStorage` key `troLyXeo.v1`; ảnh trang chủ
  lưu ở IndexedDB `troLyXeoPhotos` (tối đa 60 ảnh).
- Trong WKWebView của app native, origin là `capacitor://localhost` —
  **kho lưu trữ khác hoàn toàn** với origin web
  `https://hoangviet1397.github.io`. Trình duyệt / hệ thống không cho
  app native đọc localStorage / IndexedDB của Safari.
- Sao lưu JSON của app (`tro-ly-xeo-sao-luu.json`) chỉ chứa
  `{ jobs, txs, cfg }` — **không gồm ảnh IndexedDB**. Nên:
  - ✅ Job, thu chi, cài đặt: chuyển được (xuất JSON ở bản web → nhập
    ở bản native bằng nút nhập file đã có trong app).
  - ❌ Ảnh trang chủ (tối đa 60 ảnh): **không chuyển được** — người dùng phải
    chọn lại ảnh trong app native (đã có Camera plugin + nút chọn ảnh).
  - ❌ Passkey: phải tạo lại (xem mục 3). Token Google: phải đăng nhập
    lại (xem mục 1) — và ở v1 thì Google tắt hẳn.
- **Hướng dẫn chuyển dữ liệu (đưa vào TestFlight + khi app lên Store):**
  1. Mở bản web → Cài đặt → xuất bản sao lưu JSON → gửi file qua
     AirDrop / Messenger cho chính mình → lưu vào Files trên iPhone.
  2. Cài app FotoBro (TestFlight / App Store) → Cài đặt → nhập file
     JSON đó.
  3. Chọn lại ảnh trang chủ, bật lại khoá Face ID + PIN, bật lại nhắc
     lịch.
  4. Chỉ khi đã thấy đủ job + tiền trong app mới thì mới gỡ bản web
     khỏi màn hình chính (bản web vẫn giữ làm dự phòng).
- Lưu ý kỹ thuật: nút nhập file trong app dùng `<input type="file">` —
  trong WKWebView vẫn mở được Files, nhưng người dùng phải biết file JSON đang
  ở đâu (Files → Downloads / AirDrop). Nếu người dùng thấy khó, v1.1 có thể
  thêm nhập bằng Share sheet ("Mở bằng FotoBro" từ Files).

## 6. 🟠 Service worker không chạy trong Capacitor — đã xử lý, còn 1 chỗ cần dọn

**Đã kiểm bằng code (chắc chắn):**

- `index.html` chỉ đăng ký SW khi `location.protocol === 'https:'`
  (`if ('serviceWorker' in navigator && location.protocol === 'https:')`).
  Trên `capacitor://localhost`, điều kiện sai nên **SW không đăng ký** —
  không cần sửa code.
- File `sw.js` **không copy vào `www/`** trong gói này (đúng — Capacitor
  không dùng SW; app native chạy từ file trong gói, cập nhật bằng bản
  app mới trên TestFlight / App Store, không phải bằng SW).
- **Còn 1 chỗ cần dọn trước khi gửi duyệt:** banner "Có bản cập nhật
  mới" (`#updBanner` / `#updBtn` trong index.html) dựa vào `swReg` —
  trong app native `swReg` luôn null nên banner không hiện (an toàn),
  nhưng nút `updBtn` và hàm `checkUpdate()` vẫn còn. Nên **ẩn hẳn cụm
  cập nhật khi chạy native** (1 dòng: nếu `window.Capacitor` thì ẩn
  `#updBanner`) để reviewer Apple không bấm vào nút chết. Chưa làm
  trong gói này — ghi vào checklist v1.
- `manifest.webmanifest` có copy vào `www/` nhưng Capacitor không đọc —
  giữ lại vô hại (để tham khảo), không cần xoá.

## 7. 🟡 Guideline 4.2 — app không được chỉ là webview

**Đánh giá (chưa có phán quyết của Apple — chỉ Apple mới quyết):**

- Apple từ chối app "chỉ bọc website" (Guideline 4.2 Minimum
  Functionality). Gói này đã chuẩn bị các tính năng native để đối phó:
  giọng nói native (SFSpeechRecognizer), nhắc lịch khi app đóng (Local
  Notifications), rung khi chạm (Haptics), Share sheet hệ thống, chọn
  ảnh từ thư viện (Camera), splash + status bar native, chạy offline
  hoàn toàn từ file trong máy.
- Điểm yếu còn lại: **nội dung chính vẫn là 1 file HTML** và app phục vụ nhiếp ảnh gia tự do
  (người dùng đầu tiên là Xèo). Reviewer có thể hỏi "sao không dùng web?".
  Câu trả lời chuẩn bị sẵn trong mô tả App Store (APP-STORE-LISTING.md)
  + ghi chú cho reviewer (khi submit, điền vào mục Notes: "App dùng
  offline hoàn toàn, dữ liệu chỉ trên máy, có giọng nói native,
  nhắc lịch local, Face ID; tài khoản demo không cần vì không có đăng
  nhập").
- **Không cần tài khoản demo** cho reviewer (app không có đăng nhập) —
  ghi rõ điều này khi submit để khỏi bị hỏi.

## 8. 🟡 App chỉ dùng cho 1 người — Guideline 2.1 / 4.2 có thể bị soi

- App làm cho nhiếp ảnh gia tự do (trước đây làm riêng cho Xèo,
  Sadako Photography — đã chuyển thành bản chung từ FotoBro v2.6), không có đăng ký, không
  có nội dung công khai. Apple có thể thắc mắc "app này ai dùng?".
  Cách giảm rủi ro: mô tả App Store viết rõ app cho nhiếp ảnh gia tự do
  (đã viết), không giả vờ là app cho mọi người.
  Nếu reviewer từ chối vì "quá hẹp", phương án dự phòng là phát hành
  qua **TestFlight Internal / Custom App (Apple Business Manager)** cho
  riêng một studio thay vì App Store công khai — quyết sau nếu bị từ chối.

## 9. 🟢 Những thứ đã an toàn

- **Không tracking / không quảng cáo / không tài khoản** → khai
  "Data Not Collected" là khớp, ít bị soi privacy.
- **Icon 1024** render từ vector, RGB không alpha — đúng chuẩn.
- **Không dùng API riêng tư, không dùng webview mở link ngoài tuỳ ý**
  (link Facebook / Messenger chỉ mở bằng app ngoài khi người dùng bấm).
- **Offline hoàn toàn** — không phụ thuộc mạng khi mở app (trừ Google
  khi bật, mà v1 tắt).
- **Tên + Bundle ID** chưa từng dùng trên App Store (theo hiểu biết
  hiện tại) nên không đụng tên.

## 10. Checklist kiểm chứng trên TestFlight (làm trước khi Submit)

- [ ] Mở app lần đầu: màn Hôm nay hiện, không màn hình trắng.
- [ ] Nhập JSON sao lưu từ bản web → đủ job + thu chi.
- [ ] Nút mic: nói "thêm job..." → hiện khung xác nhận → bấm đồng ý → job mới có trong pipeline. (Nếu lỗi → xem mục 2 + 4.)
- [ ] Nhắc lịch: tạo job chụp ngày mai → khoá app → tới giờ nhắc → thông báo hiện.
- [ ] Khoá app: bật Face ID + PIN → tắt app → mở lại → Face ID mở được; thử PIN.
- [ ] Chọn ảnh trang chủ từ thư viện → ảnh đổi, tắt app mở lại vẫn còn.
- [ ] Tắt mạng (chế độ máy bay) → app vẫn mở và dùng được.
- [ ] Nút Google: đã ẩn / đã báo "bản sau" (nếu quyết tắt ở v1).
- [ ] Nút Cập nhật (SW banner): không hiện trong app native.
- [ ] Chia sẻ báo cáo / sao lưu bằng Share sheet iOS.
