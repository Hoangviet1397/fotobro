# FotoBro iOS v1.1 — Kế hoạch sửa plugin giọng nói

> Trạng thái: **kế hoạch (20/11/2026)** — chưa làm, chưa build, chưa kiểm chứng.
> Phạm vi: chỉ khôi phục **đầu vào giọng nói** (nút mic) cho app iOS.
> Không bao gồm lệnh mới 9 (chuyển bước pipeline) và 10 (nhắc lịch) — hai lệnh
> đó là việc parser, xem `VOICE-COMMANDS.md` mục "Ghi chú cho người làm v1.1".

## 1. Tóm tắt vấn đề

- Plugin `@capacitor-community/speech-recognition@7.0.1` chỉ có
  `CapacitorCommunitySpeechRecognition.podspec` (CocoaPods) và
  `ios/Plugin/Plugin.swift` (có dùng `SFSpeechRecognizer`), **không có
  `Package.swift`**.
- Capacitor 8 build iOS bằng **Swift Package Manager**, không dùng CocoaPods
  nữa. Khi chạy `npx cap add ios`, Capacitor báo:
  `[warn] @capacitor-community/speech-recognition does not have a Package.swift`
  và plugin **không có mặt** trong `ios/App/CapApp-SPM/Package.swift`
  (chỉ 8 plugin chính thức của Capacitor có mặt).
- Lỗi dự kiến ở bước `xcodebuild archive`:
  `No such module 'CapacitorCommunitySpeechRecognition'`, hoặc plugin không
  đăng ký (nút mic im lặng).
- **Quyết định ở v1 (đã chốt):** gỡ plugin khỏi `package.json`
  (đã kiểm: `node_modules/@capacitor-community/` không còn tồn tại), xoá code
  giọng nói native khỏi `www/capacitor-bridge.js`, mic dời sang v1.1.
- **Trạng thái v1 hiện tại (đã kiểm trong `www/index.html`, dòng ~2166–2205):**
  - `var SR = isNativeApp() ? null : (window.SpeechRecognition || window.webkitSpeechRecognition);`
  - `startListening()` trên app native chặn ngay:
    `toast('Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha', 'warn')` rồi
    focus ô gõ tay. Nút mic (`#micBtn`, `#homeMic`) vẫn hiện, không crash.
  - `runCommand` / `runVoiceCommand` / `answer` vẫn chạy đủ qua **gõ tay**:
    8/10 lệnh trong `VOICE-COMMANDS.md` đã chạy (lệnh 9, 10 chưa có parser).
    Thẻ xác nhận "Bạn nói là…" (`#voiceHeard`, nút `voiceYes` / `voiceRetry` /
    `voiceEdit`) vẫn còn nguyên trong code, chỉ chưa được gọi tới trên iOS.
  - `speak()` (đọc to bằng `speechSynthesis`, `lang: 'vi-VN'`) giữ nguyên —
    trên WKWebView iOS thường chạy được bằng giọng hệ thống; kiểm chứng lại
    ở TestFlight, nếu không đọc mới thay bằng plugin TTS.
- **Hai cách đã thử trước v1 đều cần macOS để kiểm chứng, không làm được
  trên Linux** (ghi trong comment ở `www/index.html` dòng 2166–2172 và
  `RISKS.md` mục 4): (1) tạo lại `ios/` bằng CocoaPods, (2) viết plugin SPM
  riêng bọc `SFSpeechRecognizer`. Vì vậy cả hai lần thử dưới đây đều chạy
  trên **GitHub Actions macOS runner** (Xcode 26, macOS 15.6+), không thử
  trên máy local. Lưu ý: MacBook Pro 2017 của Việt chỉ lên tới Ventura 13
  nên **không build được** — xem `MEMORY.md`.
- **Tái sinh `ios/` bằng CocoaPods KHÔNG tính là một lần thử trong kế hoạch
  này:** Capacitor 8 đã bỏ CocoaPods; regen bằng CocoaPods sẽ xung đột với
  luồng SPM và bị `npx cap sync` ghi đè. Đây là đường quay lại kiến trúc cũ,
  không làm.

## 2. Lần thử 1 — Thêm `Package.swift` shim cho plugin cộng đồng

**Mục tiêu:** giữ nguyên plugin `@capacitor-community/speech-recognition`
và API JS của nó, chỉ vá phần đóng gói SPM để Xcode link được.

**Việc làm (theo thứ tự):**

1. Fork repo plugin (hoặc dùng `patch-package`): thêm `Package.swift` ở root
   của plugin, trỏ `sources` tới `ios/Plugin/` (file `Plugin.swift` đã có
   sẵn, dùng `SFSpeechRecognizer` — không viết lại code Swift).
2. Khai thêm dependency vào `ios/App/CapApp-SPM/Package.swift`.
   **Bẫy đã biết:** file này do Capacitor quản lý, `npx cap sync` sẽ ghi đè.
   Phải làm bằng **script chạy sau mỗi lần sync** (hook `post-sync` hoặc
   bước riêng trong workflow Actions), hoặc trỏ Capacitor tới fork qua
   `package.json`. Ghi rõ cách làm vào `BUILD-GUIDE.md` sau khi thử xong.
3. Cài lại plugin vào `package.json` (`@capacitor-community/speech-recognition`,
   giữ đúng bản `7.0.1` đã đối chiếu; chỉ nâng bản nếu bản mới có
   `Package.swift` chính thức — kiểm tra release notes trước).
4. Thêm 2 quyền vào `ios/App/App/Info.plist` (xem mục 4).
5. Nối lại mic trong code (xem mục 5): bỏ nhánh chặn native trong
   `startListening()`, gọi plugin qua `Capacitor.Plugins.SpeechRecognition`
   (`requestPermission`, `startListening({ language: 'vi-VN' })`,
   `stopListening`, listener kết quả), giữ nguyên luồng thẻ xác nhận
   "Bạn nói là…" + 3 nút Làm đi / Nói lại / Sửa.
6. Build trên GitHub Actions macOS runner: `npx cap sync ios` →
   `xcodebuild archive` → đẩy TestFlight internal.

**Tiêu chí DỪNG sau lần 1:**

- **Thành công (dừng, làm mục 6 kiểm chứng đầy đủ):** build archive qua
  được; sau `npx cap sync` plugin vẫn còn trong `CapApp-SPM/Package.swift`;
  trên iPhone thật qua TestFlight: bấm mic lần đầu hiện xin quyền (micro +
  nhận diện giọng nói), nói "chi makeup 2 triệu" → thẻ xác nhận hiện đúng
  câu → bấm "Làm đi" ghi đúng 2.000.000₫ loại Makeup vào sổ.
- **Thất bại (dừng, chuyển lần 2):** sau **tối đa 2 lần chạy build trên
  Actions** vẫn lỗi link (`No such module
  'CapacitorCommunitySpeechRecognition'`, plugin không đăng ký, mic im
  lặng), hoặc shim bị `cap sync` ghi đè mất 2 lần liên tiếp dù đã có script
  sau sync. Không thử lần 3 — mỗi lần thử là 1 build macOS, càng kéo dài
  càng trễ v1.1.
- **Ghi lại:** dù thành công hay thất bại, cập nhật `RISKS.md` mục 4 và
  `CHANGELOG-v1.0.md` (hoặc changelog v1.1) với kết quả + số build đã chạy.

## 3. Lần thử 2 — Viết plugin Capacitor SPM riêng bọc `SFSpeechRecognizer`

**Chỉ làm khi lần 1 thất bại theo tiêu chí trên.** Không làm song song với
lần 1 (tránh 2 code giọng nói cùng tồn tại trong repo).

**Mục tiêu:** plugin của riêng FotoBro, viết từ đầu theo chuẩn SPM của
Capacitor 8 nên chắc chắn link được; API tối giản, chỉ đủ cho app dùng.

**Việc làm (theo thứ tự):**

1. Tạo plugin mới trong repo (tên gợi ý `FotoBroSpeechRecognition`,
   không dùng lại tên package của plugin cộng đồng để tránh nhầm lẫn),
   gồm: `Package.swift` riêng + ~200 dòng Swift bọc `SFSpeechRecognizer`
   + `SFAudioSession` (tham khảo `ios/Plugin/Plugin.swift` của plugin cũ
   làm mẫu, không copy nguyên file podspec).
2. API tối giản (chỉ 4 hàm, đủ cho luồng hiện có trong `index.html`):
   - `requestPermission()` → trả về trạng thái quyền micro + nhận diện.
   - `startListening({ language: 'vi-VN' })` → bắt đầu nghe.
   - `stopListening()` → dừng nghe.
   - Event `transcript` (hoặc `partialResults`) → trả câu nghe được về JS.
   Không làm thêm: không làm nhận diện offline, không làm từ đánh thức,
   không làm nhiều ngôn ngữ (v1.1 chỉ cần `vi-VN`; bản tiếng Anh dùng
   `en-US` sau, xem `I18N-STRINGS.md`).
3. Đăng ký plugin trong `CapApp-SPM/Package.swift` (cùng bẫy ghi đè của
   `cap sync` như lần 1 — dùng script sau sync, ghi vào `BUILD-GUIDE.md`).
4. Thêm 2 quyền vào `Info.plist` (mục 4) nếu lần 1 chưa thêm.
5. Nối mic trong `index.html` / `capacitor-bridge.js` theo cùng 1 interface
   như lần 1 (đổi tên plugin gọi tới), giữ nguyên thẻ xác nhận + 3 nút.
6. Build trên GitHub Actions macOS runner → TestFlight internal.

**Tiêu chí DỪNG sau lần 2:**

- **Thành công (dừng, làm mục 6 kiểm chứng đầy đủ):** cùng tiêu chí thành
  công như lần 1 (build qua, mic xin quyền, nói → xác nhận → "Làm đi" ghi
  sổ đúng), cộng thêm: plugin không crash khi bấm mic liên tiếp / khi app
  xuống nền giữa lúc nghe / khi mất mạng giữa lúc nghe (xem mục 6).
- **Thất bại (dừng, chuyển fallback mục 7):** sau **tối đa 2 lần chạy build
  trên Actions** vẫn không link được / không nhận diện được tiếng Việt, hoặc
  `SFSpeechRecognizer` báo không khả dụng trên máy test. Không thử lần 3,
  không đổi sang plugin trả phí (`@capawesome/speech-recognition` chỉ dành
  cho Capawesome Insiders, cần licence key — xem `RISKS.md` mục 4, phương
  án C; chỉ cân nhắc khi Việt đồng ý trả phí, đó là quyết định riêng, không
  nằm trong 2 lần thử này).

## 4. Quyền iOS — bắt buộc cho cả 2 lần thử

**Phát hiện khi đối chiếu (20/11/2026):** `RISKS.md` mục 2 ghi
"`Info.plist` đã thêm `NSSpeechRecognitionUsageDescription` +
`NSMicrophoneUsageDescription`", nhưng **kiểm tra thật trong
`ios/App/App/Info.plist` thì 2 key này KHÔNG có** — hiện chỉ có
`NSPhotoLibraryUsageDescription` và `NSPhotoLibraryAddUsageDescription`.
Phải thêm mới trong lần thử 1 (hoặc lần 2 nếu lần 1 chưa tới bước này),
không được giả định là đã có.

Thêm vào `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>FotoBro cần dùng micro để bạn nói lệnh thay vì gõ — ví dụ "chi makeup 2 triệu" hay "thêm job cho Mai Anh".</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>FotoBro dùng nhận diện giọng nói của Apple để hiểu lệnh bạn nói bằng tiếng Việt.</string>
```

Lưu ý:

- Thiếu 1 trong 2 key → iOS từ chối quyền, plugin lỗi ngay lần bấm mic
  đầu tiên (lỗi `not-allowed`); app phải rơi về gõ tay với toast
  "Chưa được cấp quyền micro — gõ câu hỏi cũng được" (đã có sẵn trong
  `startListening()`).
- Khi người dùng từ chối quyền trong Cài đặt iOS, mic không được hỏi lại
  trong app — nút mic hiện hướng dẫn mở Cài đặt, không hiện hộp xin quyền
  lần 2.
- `SFSpeechRecognizer` của Apple **xử lý giọng nói qua máy chủ Apple,
  không phải hoàn toàn trên máy**. Trước khi bật mic phải ghi rõ điều này
  trong Privacy Policy (`PRIVACY.md` / `PRIVACY.html`) — xem
  `VOICE-COMMANDS.md` mục "Trạng thái mic ở v1".
- Kiểm tra sau khi thêm: mở `Info.plist` bằng text, xác nhận đủ 2 key;
  trên iPhone test, bấm mic lần đầu phải hiện **2 hộp xin quyền** (micro +
  nhận diện giọng nói), không phải 1.

## 5. Chỗ code phải đổi khi mic trở lại (áp dụng cho lần 1 hoặc lần 2)

Chỉ sửa sau khi build đã link được plugin — không sửa code web trước khi
biết plugin nào thắng, tránh phải sửa 2 lần.

1. `www/index.html`, hàm `startListening()` (~dòng 2176):
   - Bỏ nhánh chặn native (`if (isNativeApp()) { toast('Giọng nói sẽ có
     ở bản v1.1…'); return; }`).
   - Trên native: gọi plugin Capacitor thay cho `new SR()` (Web Speech API
     không chạy trên WKWebView iOS — xem `RISKS.md` mục 2). Giữ nhánh Web
     Speech API cho bản web GitHub Pages như cũ.
   - Giữ nguyên: `recog.lang = 'vi-VN'`, placeholder "Đang nghe… bạn nói
     đi", class `.listening` trên `#micBtn`, 3 toast lỗi đã có
     (chưa cấp quyền / chưa nghe rõ / trục trặc).
2. `www/index.html`, thẻ xác nhận `#voiceHeard` + 3 nút `voiceYes` /
   `voiceRetry` / `voiceEdit`: **không đổi logic** — câu plugin trả về
   phải đi qua đúng thẻ này (`pendingVoice`), lệnh chỉ chạy sau khi bấm
   "Làm đi" (`runVoiceCommand`). Không lệnh ghi sổ / thêm job nào được chạy
   ngay khi nghe xong, chưa qua xác nhận.
3. `www/capacitor-bridge.js`: code giọng nói native đã xoá khỏi file này
   ngày 20/11/2026 (xem comment đầu file). Khi mic trở lại, chọn 1 trong 2
   và ghi rõ đã chọn cái nào: (a) nối trực tiếp trong `index.html` (đơn
   giản, khuyên dùng), hoặc (b) viết lại mục giọng nói trong bridge và thêm
   móc `window.__trolyxeoVoice` — móc này **chưa từng được thêm vào
   `index.html`** (xem `RISKS.md` mục 2), nếu chọn (b) thì phải thêm móc.
4. `speak()` (đọc to kết quả): giữ nguyên `speechSynthesis`; chỉ thay bằng
   plugin TTS nếu TestFlight cho thấy iOS không đọc.
5. Không đổi `runCommand` / `answer` / `parseAmount` / `voiceCategory`:
   parser gõ tay và parser giọng nói là cùng một hàm — mic chỉ thay **đầu
   vào** (giọng nói → chữ), không thay logic lệnh.

## 6. Cách kiểm chứng trên iPhone thật (TestFlight)

Build phải qua GitHub Actions macOS runner (Xcode 26) rồi đẩy TestFlight
internal; không build local (MacBook 2017 không đủ điều kiện). Theo khung
`TESTFLIGHT-CHECKLIST.md` (mục 0 cài đặt, mục 10 mic — mục 10 ở v1 ghi
"⏭️ BỎ QUA", ở v1.1 bỏ dòng bỏ qua đó và test đủ mục dưới đây).

**Trước khi test mic — kiểm tra gõ tay trước (hồi quy):**

- Gõ 8 lệnh ✅ trong `VOICE-COMMANDS.md` (thêm job, ghi thu, ghi chi, hôm
  nay, ai chưa trả tiền, lời tháng này, tuần này / hạn giao, báo cáo hôm
  nay) — mỗi lệnh 1 ca đạt. Gõ tay hỏng thì lỗi nằm ở parser, không phải ở
  mic — sửa parser trước, đừng đổ cho plugin.

**Test mic (mỗi ca ghi ĐẠT / HỎNG + câu nghe được thực tế):**

| # | Ca kiểm | Đạt khi |
|---|---------|---------|
| 1 | Build + cài | Archive qua, cài qua TestFlight, app mở không crash, nút mic hiện |
| 2 | Xin quyền lần đầu | Bấm mic → hiện đủ 2 hộp quyền (micro + nhận diện); đồng ý cả 2 → vào trạng thái "Đang nghe…" |
| 3 | Lệnh ghi chi | Nói "chi makeup 2 triệu" → thẻ xác nhận hiện đúng câu → "Làm đi" → sổ ghi chi Makeup 2.000.000₫, đọc to kết quả |
| 4 | Lệnh ghi thu | Nói "thu cọc Mai Anh 5 triệu" → ghi thu Cọc 5.000.000₫, gắn đúng job Mai Anh |
| 5 | Lệnh thêm job | Nói "thêm job cho Mai Anh, cưới" → job Wedding — Digital, bước Tư vấn |
| 6 | Lệnh tra cứu | Nói "hôm nay chụp gì?" và "ai chưa trả tiền?" → trả lời đúng như gõ tay |
| 7 | Không dấu | Nói "chi makeup 2 trieu" (không dấu, nói tự nhiên) → vẫn hiểu đúng số tiền |
| 8 | Nói lại | Thẻ xác nhận → bấm "Nói lại" → nghe lại từ đầu, không ghi sổ |
| 9 | Sửa | Thẻ xác nhận → bấm "Sửa" → câu nghe được rơi xuống ô gõ tay để sửa rồi gửi |
| 10 | Từ chối quyền | Từ chối 1 trong 2 quyền → toast "Chưa được cấp quyền micro — gõ câu hỏi cũng được", gõ tay vẫn chạy |
| 11 | Không nghe rõ / ồn | Nói không rõ hoặc im lặng → toast "Chưa nghe rõ — bấm micro nói lại nha", không ghi sổ sai |
| 12 | Mất mạng giữa lúc nghe | Tắt mạng lúc đang nghe → báo lỗi rõ, không crash, không ghi sổ sai (SFSpeechRecognizer cần mạng Apple) |
| 13 | Ngắt quãng | Bấm mic 2 lần liên tiếp / xuống nền giữa lúc nghe / có cuộc gọi tới → không crash, không kẹt trạng thái "Đang nghe…" |
| 14 | Đọc to | Sau mỗi lệnh, app đọc to kết quả bằng giọng Việt (`speak()`); nếu không đọc, ghi lại để thay TTS |

**Tiêu chí nghiệm thu mic ở v1.1:** ca 1–6 và 10–12 đều ĐẠT; ca 7 ĐẠT
(không dấu là cách người dùng nói thật); ca 8, 9, 13, 14 ĐẠT hoặc có lỗi
ghi rõ + cách xử lý. Nếu ca 3–6 có lệnh nào nói đúng mà ghi sai, kiểm tra
parser trước (so với kết quả gõ tay cùng câu) rồi mới kết luận plugin sai.

## 7. Fallback nếu cả 2 lần đều thất bại

**Nguyên tắc: mic không được chặn phát hành v1.1.** Nếu lần 2 dừng theo
tiêu chí thất bại ở mục 3:

1. **Giữ nguyên v1:** gỡ plugin khỏi `package.json` lần nữa, gỡ code nối
   mic đã thêm ở mục 5, trả `startListening()` về nhánh chặn native với
   toast "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha" (đổi chữ v1.1
   thành phiên bản đích mới, ví dụ v1.2, khi chốt số phiên bản).
2. **Gõ tay là cách dùng chính thức, không phải cách tạm:** 8 lệnh ✅ vẫn
   chạy đủ qua ô "Hỏi trợ lý…" + 7 câu gợi ý nhanh (`QUICK_QS`); lệnh 9
   (đổi bước) làm bằng cách bấm bước trong chi tiết job; lệnh 10 (nhắc
   lịch) làm bằng ngày + giờ trong form job và nút "Thêm vào Lịch iPhone".
   Xem `VOICE-COMMANDS.md` mục "Phương án dự phòng gõ tay".
3. **Nút mic vẫn hiện, vẫn báo rõ:** bấm mic → toast báo giọng nói sẽ có
   ở bản sau + focus ô gõ tay. Không giấu nút mic (người dùng đã thấy nút
   từ v1), không để nút im lặng không phản hồi.
4. **Ghi lại và dời:** cập nhật `RISKS.md` mục 4 (ghi 2 lần đã thử + kết
   quả + số build), `VOICE-COMMANDS.md` (trạng thái mic), `TESTFLIGHT-CHECKLIST.md`
   (mục 10 giữ "⏭️ BỎ QUA"), changelog v1.1 (ghi mic dời sang v1.2).
   Chốt với Việt trước khi dời: có muốn thử phương án trả phí
   (`@capawesome/speech-recognition`, Capawesome Insiders) hay dời sang
   v1.2 và chờ plugin cộng đồng ra bản có `Package.swift`.
5. **Không làm thêm trong fallback:** không thử lần 3, không tự ý mua
   licence trả phí, không viết thêm plugin khác trong cùng đợt v1.1.

## 8. Rủi ro nếu plugin vẫn không build được

| Rủi ro | Mức | Hậu quả / cách xử lý |
|--------|-----|----------------------|
| Plugin cộng đồng không bao giờ ra bản SPM | Cao | Fork/shim phải tự bảo trì mỗi lần Capacitor nâng cấp; nếu shim gãy ở bản Capacitor sau, mic lại rơi — cân nhắc viết plugin riêng (lần 2) làm phương án dài hạn |
| `CapApp-SPM/Package.swift` bị `cap sync` ghi đè | Cao | Shim "biến mất" sau sync, build gãy không rõ nguyên nhân; bắt buộc có script sau sync + ghi vào `BUILD-GUIDE.md`, kiểm tra file sau mỗi lần sync |
| `SFSpeechRecognizer` cần mạng Apple | Trung bình | Mất mạng / máy chủ Apple chậm → mic lỗi dù app đúng; phải có toast + rơi về gõ tay (ca 12 mục 6); không quảng cáo mic là "offline" |
| Nhận diện tiếng Việt sai tên khách / số tiền | Trung bình | Ghi sổ sai là lỗi nghiêm trọng với app tiền bạc; thẻ xác nhận "Bạn nói là…" + nút "Làm đi" là chốt chặn bắt buộc, không được bỏ |
| Quyền bị từ chối / Privacy Policy thiếu câu về máy chủ Apple | Trung bình | App Store Review có thể hỏi; bổ sung Privacy Policy trước khi nộp (mục 4) |
| Trễ phát hành v1.1 vì kẹt ở mic | Cao | Đã chặn bằng giới hạn 2 lần thử × tối đa 2 build/lần (mục 2–3) + fallback mục 7; mic không chặn release |
| Plugin trả phí là đường duy nhất còn lại | Thấp | `@capawesome/speech-recognition` cần licence Insiders trả phí; chỉ làm khi Việt đồng ý trả phí, không tự quyết |
| `speechSynthesis` đọc to không chạy trên iOS | Thấp | Kết quả lệnh vẫn hiện chữ + toast; thay bằng plugin TTS ở đợt sau, không chặn mic |

## Nguồn đối chiếu

- `www/index.html` dòng ~2125–2215 (`runCommand`, `runVoiceCommand`,
  `startListening`, comment dời mic sang v1.1), dòng 2647 (mục hướng dẫn
  trong app: "Giọng nói (bản v1.1)").
- `VOICE-COMMANDS.md` — bảng 10 lệnh, phương án gõ tay, ghi chú v1.1.
- `RISKS.md` mục 2 (Web Speech API không chạy trên WKWebView) và mục 4
  (plugin không tương thích SPM; phương án A–D).
- `www/capacitor-bridge.js` — code giọng nói native đã xoá 20/11/2026;
  `package.json` — plugin đã gỡ; `ios/App/App/Info.plist` — 2 key quyền
  mic/nhận diện **chưa có** (chỉ có key thư viện ảnh).
- `TESTFLIGHT-CHECKLIST.md` mục 0 và mục 10 (mic ở v1: bỏ qua).
- `BUILD-GUIDE.md` mục 4 (quyền Info.plist) — cập nhật sau khi thử xong.
