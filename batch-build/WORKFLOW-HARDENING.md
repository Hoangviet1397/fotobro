# WORKFLOW-HARDENING — Rà soát `.github/workflows/ios-build.yml` (FotoBro iOS v1)

- **Phạm vi rà soát (chỉ đọc, không sửa file nào):** `~/workspace/fotobro-ios-v1/.github/workflows/ios-build.yml` (124 dòng), đối chiếu `BUILD-GUIDE.md`, `package.json`, `www/test-fotobro-v1.js`, `QA-REPORT.md`, `RISKS.md`, `ios/App/App.xcodeproj/project.pbxproj`, `ios/App/CapApp-SPM/Package.swift`, `capacitor.config.ts`.
- **Ngày rà soát:** 20/11/2026. **Bundle ID:** `com.fotobro.app`. **Repo đích:** `Hoangviet1397/fotobro`.
- **Trạng thái gốc của workflow (tự khai trong header, dòng 1–5):** workflow MẪU, **CHƯA TỪNG CHẠY** — chưa có Distribution Certificate / Provisioning Profile nên chưa thể chạy green. Mọi kết luận dưới đây là rà soát tĩnh trên file; **không có bước nào kiểm chứng được trên Linux** — chỉ một lần chạy thật trên GitHub Actions mới biết green hay đỏ.
- **Mức độ:** 🔴 **Chặn** = lần chạy đầu (hoặc lần chạy thứ hai) có khả năng đỏ / không submit được. 🟠 **Nên sửa** = không chặn lần đầu nhưng gây lỗi khó chẩn đoán, tốn phút macOS, hoặc mất bằng chứng khi lỗi. 🟡 **Khuyến nghị** = vệ sinh / độ bền lâu dài.

---

## 0. Kết luận đầu tiên — tiền đề "workflow còn pin Xcode 16.4" ĐÃ SAI với file hiện tại

> **Không còn lỗi Xcode 16.4 trong file hiện tại. Đừng sửa lại chỗ này theo tiền đề cũ.**

| Điểm | File hiện tại (20/11/2026) | Nguồn cũ gây hiểu lầm |
|---|---|---|
| Runner | `runs-on: macos-26` (dòng 31) | `QA-REPORT.md` dòng 45, 82 ghi workflow ghim `16.4` trên `macos-15` — nhưng đó là **ảnh chụp lúc 17:04 UTC 19/11/2026**, trước khi agent chính nâng cấp |
| Xcode | `xcode-version: '26.5'` qua `maximedenes/xcode-select@v1` (dòng 37–39) | Cùng nguồn QA cũ ở trên |
| Header workflow | Dòng 8–13 đã ghi rõ: Xcode 26 bắt buộc, App Store Connect từ chối build dưới Xcode 26 từ 28/04/2026, runner macos-26 có Xcode 26.0.1–26.6 (mặc định 26.5) | — |

Kiểm chứng độc lập: tài liệu runner-images / các dự án dùng `macos-26` đều xác nhận image này có sẵn Xcode 26.5 (mặc định) và 26.6, nên pin `26.5` là **hợp lệ tại thời điểm rà soát**. Lỗi chặn thật còn lại không phải là "Xcode 16.4" mà là các mục 🔴 A1–A6 dưới đây — trong đó **A1 (signing Automatic vs manual) và A2 (không tăng build number) là hai lỗi chặn lớn nhất còn tồn tại**.

**Những gì workflow đã làm đúng (giữ nguyên, đừng phá):** `macos-26` + Xcode 26.5; `actions/setup-node@v4` với `cache: npm`; `npm ci` (không phải `npm install`); `npx cap sync ios` trước archive; plugin speech-recognition đã gỡ khỏi `package.json` nên không còn lỗi SPM `No such module 'CapacitorCommunitySpeechRecognition'`; ExportOptions `method: app-store-connect` + `teamID` từ secret; upload `.ipa` làm artifact; input `upload_testflight` cho phép chỉ build không đẩy TestFlight.

---

## 1. 🔴 Chặn — phải sửa trước lần chạy thật (hoặc trước lần chạy thứ hai)

### A1. Mâu thuẫn signing: project để `Automatic`, workflow ký `manual` — archive có thể ký sai / export gãy
- **Bằng chứng:**
  - `ios/App/App.xcodeproj/project.pbxproj`, cả Debug và Release: `CODE_SIGN_STYLE = Automatic`, `CODE_SIGN_IDENTITY = "iPhone Developer"` (không phải Distribution).
  - Workflow, bước Archive (dòng 95–104): `xcodebuild … archive` **không truyền bất kỳ override signing nào** (`CODE_SIGN_STYLE`, `DEVELOPMENT_TEAM`, `CODE_SIGN_IDENTITY`, `PROVISIONING_PROFILE_SPECIFIER` đều vắng).
  - Chỉ bước Export (dòng 106–109) mới dùng `ExportOptions.plist` với `signingStyle = manual` + profile `FotoBro App Store`.
- **Hậu quả:** archive bằng Automatic trên CI (không có team cấu hình trong project, identity chỉ là iPhone Developer) có thể (a) thất bại ngay vì không tự ký được, hoặc (b) archive xong bằng Dev identity rồi bước export manual mới gãy — lỗi hiện muộn, log khó đọc, rất giống "thiếu secret / thiếu profile" nên dễ sửa sai hướng.
- **Cách sửa (chọn 1, làm trước khi chạy):**
  - **Phương án 1 (khuyến nghị, sửa project):** trong Xcode đặt Release → `CODE_SIGN_STYLE = Manual`, `CODE_SIGN_IDENTITY = "Apple Distribution"`, `DEVELOPMENT_TEAM = <Team ID>`, `PROVISIONING_PROFILE_SPECIFIER = FotoBro App Store`; commit `project.pbxproj` đã sửa.
  - **Phương án 2 (chỉ sửa workflow, không động project):** thêm override vào lệnh archive:
    ```yaml
    xcodebuild -project ios/App/App.xcodeproj \
      -scheme App -configuration Release \
      -destination 'generic/platform=iOS' \
      -archivePath build/FotoBro.xcarchive \
      CODE_SIGN_STYLE=Manual \
      DEVELOPMENT_TEAM=${{ secrets.APPLE_TEAM_ID }} \
      CODE_SIGN_IDENTITY="Apple Distribution" \
      PROVISIONING_PROFILE_SPECIFIER="FotoBro App Store" \
      archive
    ```
  - Sau sửa, thêm bước kiểm chứng ngay sau import cert: `security find-identity -v -p codesigning` để chắc cert đã vào keychain trước khi archive.

### A2. Không tăng build number — lần chạy thứ hai lên TestFlight sẽ bị App Store Connect từ chối
- **Bằng chứng:** `project.pbxproj` Release: `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1`. Workflow không có bước nào đọc hay tăng `CURRENT_PROJECT_VERSION`. Lần chạy đầu (nếu thành công) chiếm `1.0 (1)`; lần chạy sau với cùng số sẽ bị từ chối là build trùng.
- **Cách sửa:** thêm một bước trước Archive, ví dụ dùng `agvtool` hoặc script tăng `CURRENT_PROJECT_VERSION` theo số lần chạy:
  ```yaml
  - name: Tăng build number
    run: |
      cd ios/App
      agvtool next-version -all   # hoặc: xcrun agvtool new-version ${{ github.run_number }}
      xcodebuild -project App.xcodeproj -showBuildSettings | grep -E "MARKETING_VERSION|CURRENT_PROJECT_VERSION"
  ```
  Lưu ý: `agvtool` đổi file trong repo checkout của runner, không commit ngược lên GitHub — mỗi lần chạy dùng `github.run_number` làm build number là cách đơn giản và đơn trị. Quyết định cơ chế tăng số rồi ghi vào `BUILD-GUIDE.md` mục 6 để Việt biết số build nào tương ứng lần chạy nào.

### A3. Không kiểm tra secret sớm — thiếu secret chỉ lộ ra sau 10+ phút `npm ci` + sync + archive
- **Bằng chứng:** workflow đọc 6 secret (`IOS_DIST_CERT_P12_BASE64`, `IOS_DIST_CERT_PASSWORD`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_KEY_BASE64`, `APPLE_TEAM_ID` — 9 lần tham chiếu `secrets.` trong file) nhưng **không có bước nào kiểm tra secret rỗng trước khi làm việc nặng**. Bước import cert (dòng 60) và tải profile (dòng 66) là nơi đầu tiên secret được dùng, sau `npm ci` + `cap sync`.
- **Cách sửa:** thêm bước fail-fast ngay sau Checkout (trước cả chọn Xcode):
  ```yaml
  - name: Kiểm tra đủ secret (fail-fast)
    run: |
      for s in IOS_DIST_CERT_P12_BASE64 IOS_DIST_CERT_PASSWORD \
               APP_STORE_CONNECT_API_ISSUER_ID APP_STORE_CONNECT_API_KEY_ID \
               APP_STORE_CONNECT_API_KEY_BASE64 APPLE_TEAM_ID; do
        if [ -z "${!s}" ]; then echo "❌ Thiếu secret: $s"; exit 1; fi
      done
    env:
      IOS_DIST_CERT_P12_BASE64: ${{ secrets.IOS_DIST_CERT_P12_BASE64 }}
      IOS_DIST_CERT_PASSWORD: ${{ secrets.IOS_DIST_CERT_PASSWORD }}
      APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
      APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
      APP_STORE_CONNECT_API_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_API_KEY_BASE64 }}
      APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  ```
  Chỉ in tên secret thiếu, **không bao giờ in giá trị secret ra log**.

### A4. Tên profile hard-code `"FotoBro App Store"` — sai một ký tự là export gãy, không có bước nào kiểm tra
- **Bằng chứng:** `ExportOptions.plist` dòng 85 hard-code `<key>com.fotobro.app</key><string>FotoBro App Store</string>`. Comment dòng 92–93 và `BUILD-GUIDE.md` mục 3c đều cảnh báo tên này phải khớp đúng tên profile Việt tạo. Nhưng workflow không kiểm tra: không liệt kê profile đã tải, không grep tên profile trong file đã tạo.
- **Cách sửa:** sau bước tải profile, thêm bước xác minh rồi mới tạo ExportOptions:
  ```yaml
  - name: Kiểm tra profile đã tải
    run: |
      ls -la ~/Library/MobileDevice/Provisioning\ Profiles/
      # Đối chiếu tên profile trong ExportOptions.plist với tên thật trong thư mục trên;
      # nếu khác nhau thì sửa dòng 85 cho khớp rồi chạy lại (không sửa tên trên Apple Developer).
  ```
  Phương án bền hơn: đưa tên profile thành biến môi trường ở đầu job (`env: PROFILE_NAME: FotoBro App Store`) và dùng `${{ env.PROFILE_NAME }}` trong cả bước archive (A1) lẫn ExportOptions, để chỉ còn **một chỗ duy nhất** cần sửa khi đổi tên.

### A5. Plugin `@capacitor/browser` và `@capacitor/calendar` có trong `package.json` nhưng VẮNG trong `CapApp-SPM/Package.swift` — chưa rõ `cap sync` có tự bổ sung không
- **Bằng chứng:**
  - `package.json`: `"@capacitor/browser": "^8.0.0"`, `"@capacitor/calendar": "^1.0.1"`.
  - `ios/App/CapApp-SPM/Package.swift` (file do Capacitor quản lý): chỉ liệt kê 8 plugin — app, camera, haptics, local-notifications, preferences, share, splash-screen, status-bar. **Không có CapacitorBrowser, không có CapacitorCalendar.** (Calendar là tính năng "nhập Lịch iPhone native 1 chạm" của v1; Browser dùng mở link ngoài.)
  - Workflow chạy `npx cap sync ios` (dòng 51) rồi archive ngay, **không có bước nào xác minh Package.swift sau sync**.
- **Hậu quả nếu `cap sync` không tự bổ sung:** archive lỗi `No such module 'CapacitorCalendar'` / `'CapacitorBrowser'`, hoặc build xong nhưng plugin không đăng ký (nút nhập lịch im lặng) — đúng kiểu lỗi RISKS.md mục 4 đã mô tả cho speech-recognition.
- **Cách sửa:** thêm bước kiểm chứng ngay sau `cap sync`:
  ```yaml
  - name: Kiểm tra plugin sau sync
    run: |
      grep -q CapacitorCalendar ios/App/CapApp-SPM/Package.swift || { echo "❌ Thiếu CapacitorCalendar sau cap sync"; exit 1; }
      grep -q CapacitorBrowser ios/App/CapApp-SPM/Package.swift || { echo "❌ Thiếu CapacitorBrowser sau cap sync"; exit 1; }
      grep -q NSCalendarsFullAccessUsageDescription ios/App/App/Info.plist
  ```
  Quyền lịch trong `Info.plist` đã có sẵn (`NSCalendarsFullAccessUsageDescription`, `NSCalendarsWriteOnlyAccessUsageDescription`, `NSCalendarsUsageDescription`) — điểm này đã đúng, chỉ cần giữ bước grep trên để lần sync sau không vô tình ghi đè mất. Nếu grep thất bại thật trên runner thì phải xử lý như RISKS.md mục 4 (thêm dependency SPM sau sync bằng script, hoặc chốt bỏ tính năng khỏi v1) — **không được lặng lẽ bỏ qua bước kiểm tra**.

### A6. Pin Xcode 26.5 nhưng không có bước nào xác minh Xcode đã chọn đúng — nếu runner image đổi, lỗi hiện muộn và khó hiểu
- **Bằng chứng:** dòng 37–39 dùng `maximedenes/xcode-select@v1` với `xcode-version: '26.5'`. Chính comment dòng 11–12 trong file thừa nhận: "Nếu bước chọn Xcode báo không có 26.5 thì đổi sang 26.6 hoặc 26.0.1". Không có bước nào in `xcodebuild -version` hay liệt kê `/Applications/Xcode_*.app` trước archive.
- **Cách sửa:** thêm ngay sau bước chọn Xcode:
  ```yaml
  - name: Kiểm tra Xcode đã chọn
    run: |
      ls /Applications | grep Xcode
      xcodebuild -version
      test "$(xcodebuild -version | head -1)" = "Xcode 26.5" || echo "⚠️ Xcode không phải 26.5 — xem log, cân nhắc đổi pin theo comment dòng 11–12"
      swift --version
  ```
  Nếu muốn bớt phụ thuộc action bên thứ ba, thay `maximedenes/xcode-select@v1` bằng lệnh trực tiếp `sudo xcode-select -s /Applications/Xcode_26.5.app/Contents/Developer` (đã có sẵn trên runner) hoặc `maxim-lobanov/setup-xcode@v1` — quyết một hướng rồi ghi vào BUILD-GUIDE, đừng để hai cách song song.

---

## 2. 🟠 Nên sửa — không chặn lần chạy đầu, nhưng gây lỗi khó chẩn đoán / mất bằng chứng / tốn tiền runner

### B1. Không có bước test jsdom — và test hiện tại CHƯA ĐỦ ĐIỀU KIỆN để đưa vào workflow
- **Bằng chứng:**
  - `package.json` **không có script `"test"`** và **không có `jsdom` trong `devDependencies`** (grep `jsdom` trong `package.json` / `package-lock.json` = 0 kết quả).
  - `www/test-fotobro-v1.js` dòng đầu yêu cầu `NODE_PATH=/tmp/film-verify/node_modules node test-fotobro.js` — đường dẫn `/tmp/film-verify` là máy local, **không tồn tại trên runner**.
  - `QA-REPORT.md` dòng 25, 38–39: test chạy local đạt **101/103**, 2 lỗi đều do test lỗi thời: expect `APP_VERSION '2.6'` trong khi app đã là `'1.0'` (dòng 47 file test), và expect `mẫu có 5 job` trong khi app đã bỏ job mẫu (`jobs: []`, dòng 128 file test).
- **Hậu quả nếu thêm `npm test` một cách ngây thơ ngay bây giờ:** workflow đỏ vì 2 expect cũ — không phải vì app hỏng, nhưng sẽ chặn nhầm và gây hoang mang.
- **Cách sửa (theo đúng thứ tự, không đảo):**
  1. Sửa `www/test-fotobro-v1.js`: expect `APP_VERSION` thành `'1.0'`, expect số job mẫu thành `0`.
  2. Thêm `jsdom` vào `devDependencies` và script `"test": "node --test www/test-fotobro-v1.js"` (hoặc đường dẫn chạy test đúng) vào `package.json`; chạy lại local tới **103/103**.
  3. Chỉ sau đó mới thêm bước vào workflow, đặt **trước `npx cap sync ios`** (test web không cần Xcode, lỗi thì dừng sớm, đỡ tốn phút macOS):
     ```yaml
     - name: Test jsdom (web)
       run: npm test
     ```
  4. Ghi rõ trong `QA-REPORT.md` rằng test hiện **không cover** tính năng mới v1 (nhảy bước pipeline, huỷ/khôi phục job, cảnh báo kẹt, gắn tiền vào bước, màu chủ đề, logo, sửa mẫu tin nhắn, ngôn ngữ/tiền tệ, Google auto, Lịch native) — các tính năng này mới chỉ kiểm bằng grep, chưa có test chạy được.

### B2. Header hứa artifact `.xcarchive` nhưng workflow chỉ upload `.ipa`
- **Bằng chứng:** header dòng 16–17: "Kết quả: .ipa (đẩy thẳng lên TestFlight) + bản archive .xcarchive làm artifact." Thực tế bước upload-artifact (dòng 112–116) chỉ có `path: build/ipa/*.ipa`, không có `.xcarchive`.
- **Cách sửa:** thêm một bước upload riêng cho archive (để khi export/TestFlight lỗi vẫn còn archive mà ký lại / chẩn đoán, không phải archive lại từ đầu):
  ```yaml
  - name: Lưu .xcarchive làm artifact
    uses: actions/upload-artifact@v4
    with:
      name: FotoBro-xcarchive
      path: build/FotoBro.xcarchive
      retention-days: 30
  ```
  Đồng thời thêm `retention-days: 30` (hoặc 14) cho artifact `.ipa` hiện tại — hiện không đặt, sẽ giữ theo mặc định của repo (90 ngày) và tốn dung lượng lưu trữ.

### B3. Không kiểm tra `.ipa` tồn tại trước khi upload; không có artifact chẩn đoán khi build lỗi
- **Bằng chứng:**
  - Bước upload-artifact (dòng 112–116) không có `if-no-files-found: error` — nếu export không tạo ra `.ipa`, bước này chỉ cảnh báo rồi bước TestFlight (dòng 119–124) mới gãy vì glob `build/ipa/*.ipa` không khớp file nào, với thông báo khó hiểu.
  - Bước TestFlight dùng `app-path: build/ipa/*.ipa` (glob) — nếu có nhiều hơn 1 file `.ipa` trong thư mục thì mơ hồ.
  - Không có bước nào chạy khi lỗi (`if: failure()`): không lưu `build.log`, không lưu `.xcarchive` khi archive/export lỗi.
- **Cách sửa:**
  ```yaml
  - name: Kiểm tra .ipa sau export
    run: ls -lh build/ipa/ && test -n "$(ls build/ipa/*.ipa 2>/dev/null)"
  ```
  và thêm vào cuối job:
  ```yaml
  - name: Lưu log + archive khi build lỗi
    if: failure()
    uses: actions/upload-artifact@v4
    with:
      name: FotoBro-build-logs
      path: |
        build/FotoBro.xcarchive
        build.log
      retention-days: 14
  ```
  (Muốn có `build.log` thì bước Archive phải ghi log ra file, xem B7.) Đồng thời cân nhắc ghim đúng 1 đường dẫn `.ipa` cụ thể thay vì glob, hoặc `ls` để chắc chỉ có 1 file.

### B4. Cache: npm đã đúng, CocoaPods KHÔNG áp dụng, nhưng cache SPM / DerivedData đang vắng
- **Bằng chứng:**
  - npm: `actions/setup-node@v4` với `cache: npm` (dòng 42–45) — **đúng**.
  - CocoaPods: **không có `Podfile` nào** trong `ios/App/` (chỉ có `CapApp-SPM/Package.swift`). Capacitor 8 build iOS bằng Swift Package Manager, không dùng CocoaPods nữa (xác nhận trong RISKS.md mục 4). Nên yêu cầu "cache CocoaPods" **không áp dụng cho repo này** — đừng thêm bước `pod install` / cache Pods, sẽ chỉ thêm lỗi.
  - SPM: workflow không cache `~/Library/Caches/org.swift.swiftpm`, `~/Library/Developer/Xcode/DerivedData`, hay thư mục `SourcePackages` — mỗi lần chạy phải resolve lại `capacitor-swift-pm` 8.6.2 và các package SPM, làm lần chạy đầu (BUILD-GUIDE nói 10–20 phút) chậm hơn mức cần thiết.
- **Cách sửa (không chặn, chỉ tăng tốc):** thêm `actions/cache@v4` cho SPM trước `cap sync`:
  ```yaml
  - name: Cache SwiftPM
    uses: actions/cache@v4
    with:
      path: |
        ~/Library/Caches/org.swift.swiftpm
        ~/Library/Developer/Xcode/DerivedData
      key: ${{ runner.os }}-spm-${{ hashFiles('ios/App/CapApp-SPM/Package.swift', 'package-lock.json') }}
  ```
  Lưu ý: cache DerivedData đôi khi gây lỗi lạ sau khi đổi Xcode — nếu gặp build lỗi khó hiểu sau khi thêm cache, bước đầu tiên là xoá cache này rồi chạy lại.

### B5. Chỉ chạy bằng tay (`workflow_dispatch`) — code merge lên `main` không bao giờ tự build
- **Bằng chứng:** `on:` (dòng 20–30) chỉ có `workflow_dispatch`. Không có `push`, không có `pull_request`.
- **Hậu quả:** một commit làm gãy build (ví dụ sửa `www/` rồi quên `cap sync`, hay thêm plugin không có SPM) sẽ nằm im trên `main` cho tới khi có người bấm Run workflow bằng tay.
- **Cách sửa:** thêm trigger tự động cho nhánh `main`, nhưng **chỉ build, không đẩy TestFlight** (để không vô tình phát hành bản chưa duyệt):
  ```yaml
  on:
    push:
      branches: [main]
      paths: ['www/**', 'ios/**', 'package.json', 'package-lock.json', 'capacitor.config.ts']
    pull_request:
      branches: [main]
    workflow_dispatch:
      inputs:
        upload_testflight: { … }   # giữ nguyên
  ```
  và đổi điều kiện bước TestFlight thành `if: inputs.upload_testflight == 'true'` **chỉ chạy khi dispatch bằng tay** (khi chạy bằng push/PR thì `inputs` rỗng — cần guard thêm, ví dụ `if: github.event_name == 'workflow_dispatch' && inputs.upload_testflight == 'true'`). Quyết định này cần Việt chốt: có muốn mỗi push lên main đều build không (tốn phút macOS), hay giữ dispatch tay như hiện tại.

### B6. Không có `timeout-minutes`, `concurrency`, `permissions` ở cấp job
- **Bằng chứng:** job `build-ios` (dòng 30–31) chỉ có `runs-on: macos-26`. Không có `timeout-minutes` (mặc định GitHub là 360 phút — một bước treo có thể đốt hàng giờ phút macOS đắt tiền), không có `concurrency` (hai lần bấm Run cùng lúc có thể đua nhau đẩy cùng build number lên TestFlight — xem A2), không có `permissions:` (token mặc định rộng hơn mức cần).
- **Cách sửa:**
  ```yaml
  jobs:
    build-ios:
      runs-on: macos-26
      timeout-minutes: 60
      concurrency:
        group: fotobro-ios-build
        cancel-in-progress: false
      permissions:
        contents: read
  ```
  `timeout-minutes: 60` đủ cho lần đầu 10–20 phút theo BUILD-GUIDE (dự phòng kẹt mạng), và tự cắt khi treo.

### B7. Log lỗi chưa rõ ràng: archive/export không ghi log ra file, không dùng `xcpretty`/`tee`
- **Bằng chứng:** bước Archive (dòng 95–104) và Export (dòng 106–109) chạy `xcodebuild` trực tiếp ra stdout của GitHub — log dài, không có file riêng, không có bước nào lưu lại khi lỗi (xem B3). Khi archive đỏ, người đọc log phải cuộn qua hàng nghìn dòng.
- **Cách sửa (không chặn):** ghi log ra file để bước `if: failure()` có cái mà upload:
  ```yaml
  - name: Archive (xcodebuild)
    run: |
      set -o pipefail
      xcodebuild -project ios/App/App.xcodeproj \
        -scheme App -configuration Release \
        -destination 'generic/platform=iOS' \
        -archivePath build/FotoBro.xcarchive \
        archive 2>&1 | tee build.log
  ```
  (Nếu cài `xcpretty` thì pipe qua `xcpretty` cho log ngắn gọn, nhưng phải giữ `tee build.log` bản đầy đủ — log rút gọn không đủ để chẩn đoán lỗi signing/SPM.)

---

## 3. 🟡 Khuyến nghị — vệ sinh, độ bền, tài liệu

### C1. Action dùng tag, không pin SHA; Node `'22'` là version trôi
- Tất cả các action đều dùng tag (`actions/checkout@v4`, `actions/setup-node@v4`, `apple-actions/*@v3`, `maximedenes/xcode-select@v1`, `actions/upload-artifact@v4`) — không action nào pin SHA commit. Với workflow ký và đẩy lên TestFlight, pin SHA cho các action bên thứ ba (`apple-actions/*`, `maximedenes/*`) là thực hành nên làm, nhưng là việc nên làm sau khi build đã green lần đầu, không phải trước.
- `node-version: '22'` (dòng 44) là bản 22.x mới nhất tại lúc chạy, không có `.nvmrc` hay trường `engines` trong `package.json` để khoá. Thêm `"engines": { "node": "22.x" }` (hoặc pin `22.x.y` cụ thể) để lần chạy sau không bất ngờ đổi Node.

### C2. Tài liệu đi kèm workflow có 3 điểm lệch — sửa tài liệu, không sửa workflow
1. **Tham chiếu chết `RISKS.md mục 11`:** header workflow dòng 13 ghi "Từ tháng 4/2027 Apple sẽ yêu cầu Xcode 27 / iOS 27 SDK — tới lúc đó phải nâng tiếp, xem RISKS.md mục 11." Nhưng `RISKS.md` chỉ có **mục 1–10**, không có mục 11. (BUILD-GUIDE.md cũng nhắc "RISKS.md §11" cho iCloud — cùng một tham chiếu chết.) **Sửa:** hoặc thêm mục 11 thật vào `RISKS.md` (ghi kế hoạch nâng Xcode 27), hoặc sửa tham chiếu thành mục đúng.
2. **Bảng secret đếm lệch:** BUILD-GUIDE.md mục 5 mở đầu "Tạo đủ 6 secret sau" nhưng bảng liệt kê **7 dòng** — dòng thừa là `IOS_PROVISIONING_PROFILE_BASE64`, và ghi chú dưới bảng tự thừa nhận workflow hiện **không đọc secret này** (chỉ là "dự phòng"). **Sửa:** hoặc xoá dòng đó khỏi bảng (và ghi rõ "workflow tải profile bằng API key, không dùng file .mobileprovision"), hoặc sửa workflow để thật sự dùng nó làm fallback khi tải bằng API lỗi (xem C3). Hiện tại trạng thái "tạo sẵn cho chắc" chỉ gây nhầm: Việt có thể tưởng đã đủ secret trong khi secret thật sự cần lại thiếu (xem A3).
3. **BUILD-GUIDE mục 6 bước 4 viết "tải Xcode 26.5":** runner `macos-26` đã **cài sẵn** Xcode 26.5, workflow không tải Xcode — chỉ chọn version đã có. Sửa câu này thành "chọn Xcode 26.5 đã có sẵn trên runner" để Việt không tưởng lần chạy đầu phải tải thêm.

### C3. Chưa có fallback khi tải profile bằng API lỗi
- Workflow chỉ có một đường tải profile: `apple-actions/download-provisioning-profiles@v3` bằng API key (dòng 66–72). Nếu API key hết hạn / sai quyền App Manager / Apple đổi quyền API, bước này đỏ và không có đường khác. Secret dự phòng `IOS_PROVISIONING_PROFILE_BASE64` đã có trong BUILD-GUIDE nhưng workflow không dùng.
- **Cách sửa (sau khi build green lần đầu):** thêm bước fallback có điều kiện — chỉ chạy khi bước tải bằng API thất bại — giải mã secret dự phòng thành file `.mobileprovision` và đặt vào `~/Library/MobileDevice/Provisioning Profiles/`. Cần Việt quyết có tạo sẵn secret dự phòng này không (xem C2.2); nếu không thì xoá hẳn khỏi BUILD-GUIDE cho khỏi nhầm.

### C4. Chưa kiểm tra tính nhất quán Bundle ID / version trước khi archive
- Bundle ID `com.fotobro.app` hiện khớp ở 4 chỗ (`capacitor.config.ts`, `ios/App/App/capacitor.config.json`, `project.pbxproj` 2 chỗ, workflow dòng 69 + ExportOptions) — QA-REPORT dòng 28 đã xác nhận đúng. Nhưng workflow không tự kiểm tra điều này: một lần sửa Bundle ID ở một chỗ mà quên chỗ khác sẽ chỉ lộ ra ở bước export.
- **Cách sửa (rẻ, nên thêm cùng A3/A6):**
  ```yaml
  - name: Kiểm tra Bundle ID + version
    run: |
      grep -q "com.fotobro.app" capacitor.config.ts ios/App/App/capacitor.config.json
      grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.fotobro.app" ios/App/App.xcodeproj/project.pbxproj
      grep -q "MARKETING_VERSION" ios/App/App.xcodeproj/project.pbxproj
  ```

---

## 4. Thứ tự sửa đề xuất (làm theo đúng thứ tự này)

| # | Việc | Mức | Ghi chú |
|---|---|---|---|
| 1 | Sửa signing A1 (project Manual hoặc override archive) + thêm `security find-identity` | 🔴 | Chặn lớn nhất còn lại sau Xcode |
| 2 | Thêm bước tăng build number A2 | 🔴 | Nếu không, lần chạy thứ hai chắc chắn bị từ chối |
| 3 | Thêm fail-fast secret A3 + kiểm tra Xcode A6 + kiểm tra Bundle ID C4 (một bước "preflight" chung) | 🔴 | Rẻ, cứu 10+ phút mỗi lần thiếu secret |
| 4 | Sửa tên profile A4 (biến `PROFILE_NAME` duy nhất) | 🔴 | Khớp đúng tên profile Việt tạo ở BUILD-GUIDE mục 3c |
| 5 | Thêm kiểm tra plugin sau sync A5 (Browser/Calendar) | 🔴 | Chạy thử mới biết `cap sync` có tự bổ sung không |
| 6 | Sửa test jsdom (2 expect cũ) + thêm `jsdom` + script `test`, rồi mới thêm bước `npm test` vào workflow (B1) | 🟠 | **Không đảo thứ tự**: thêm test vào workflow trước khi sửa test sẽ làm workflow đỏ oan |
| 7 | Upload `.xcarchive` + `if-no-files-found: error` + kiểm tra `.ipa` + artifact log khi lỗi (B2, B3, B7) | 🟠 | Có bằng chứng mới chẩn đoán được lần chạy đầu |
| 8 | Thêm `timeout-minutes` / `concurrency` / `permissions` (B6) | 🟠 | Một dòng mỗi cái, làm cùng lúc với mục 7 |
| 9 | Cache SPM (B4) — sau khi build green, để tránh cache làm nhiễu lần chạy đầu | 🟠 | Không phải CocoaPods (không áp dụng) |
| 10 | Quyết trigger tự động hay giữ dispatch tay (B5) + pin SHA / Node (C1) + sửa 3 lệch tài liệu (C2) + fallback profile (C3) | 🟡 | Cần Việt chốt B5; còn lại làm sau khi green lần đầu |

**Lần chạy thử đầu tiên nên làm:** sau khi xong mục 1–5, chạy workflow bằng tay với `upload_testflight: false` (chỉ build `.ipa`, không đẩy TestFlight) để kiểm tra archive/export/archive artifact trước; chỉ bật `true` khi `.ipa` đã build được và đã kiểm tra xong.

---

## 5. Điều kiện chuyển bước (definition of done cho workflow)

- [ ] Chạy tay lần 1 với `upload_testflight: false` **green**: archive + export + artifact `.ipa` (+ `.xcarchive`) đều có.
- [ ] Chạy tay lần 2 liên tiếp (không sửa gì) vẫn **green** — chứng minh A2 (build number) đã xong.
- [ ] Bước `npm test` trong workflow **green 103/103** (sau khi sửa 2 expect cũ).
- [ ] Một lần chạy cố tình thiếu 1 secret (trên repo test hoặc bằng cách đổi tên secret) **đỏ nhanh ở bước preflight** thay vì đỏ muộn ở archive.
- [ ] `BUILD-GUIDE.md` và `RISKS.md` đã sửa 3 lệch ở C2 (đếm secret, RISKS mục 11, câu "tải Xcode 26.5").

---

## 6. Ghi chú về giới hạn của lần rà soát này

- Chỉ đọc file, không sửa bất kỳ file nào; file duy nhất được tạo mới là file này.
- Không tạo tài khoản, không push GitHub, không chạy workflow (không có quyền / không có secret, và workflow tự khai chưa đủ cert/profile để chạy).
- Không kiểm chứng được trên Linux: `xcodebuild`, `cap sync` đầy đủ, SPM resolve, signing, và TestFlight upload đều cần macOS runner / Apple Developer. Kết quả cuối cùng chỉ có sau một lần chạy thật trên GitHub Actions.
- Tiền đề "Xcode 16.4" trong yêu cầu rà soát đã lỗi thời so với file hiện tại (xem mục 0) — báo cáo này ghi nhận sự khác biệt đó thay vì lặp lại lỗi cũ. `QA-REPORT.md` (ảnh chụp 19/11) cũng cần QA lại sau khi các mục trên xong, vì 3 điểm chặn nó nêu (Xcode 16.4, plugin Lịch, mic) thì 2 điểm đã đổi trạng thái: Xcode đã lên 26.5, mic đã gỡ khỏi v1; chỉ còn plugin Lịch (A5) chưa có bằng chứng chạy thật.
