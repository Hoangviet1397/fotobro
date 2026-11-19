# FotoBro iOS — Quy tắc đánh version / build number (VERSIONING)

- **App:** FotoBro — trợ lý studio ảnh cho nhiếp ảnh gia tự do
- **Bundle ID:** `com.fotobro.app` (không đổi — đổi Bundle ID là đổi app mới, xem §3)
- **Version hiện tại:** **1.0** (build **1**) — tức `1.0 (1)` trên TestFlight / App Store Connect
- **Repo:** `Hoangviet1397/fotobro`
- **Tài liệu liên quan:** `batch-content/CHANGELOG-PROCESS.md` (§4 quy tắc đánh số,
  §6 checklist phát hành), `CHANGELOG-v1.0.md` (mẫu changelog),
  `batch-build/RELEASE-CHECKLIST.md` (checklist Go / No-Go trước khi submit),
  `batch-build/ROLLBACK-PLAN.md` (quay lại bản cũ khi bản mới lỗi).

> Nguyên tắc vàng: **một bản phát hành = một số version = một file changelog.**
> Không dùng chung một số version cho hai lần đẩy khác nhau, không bump version
> chỉ vì cập nhật nội dung/dữ liệu trong app.

## 1. Hai con số khác nhau: version và build number

| Khái niệm | Tên trong Xcode / Apple | Giá trị hiện tại | Người dùng có thấy không |
|---|---|---|---|
| **Version** (số phiên bản) | `MARKETING_VERSION` → `CFBundleShortVersionString` | `1.0` | Có — hiện trong app ("FotoBro v1.0" ở Cài đặt) và trên App Store |
| **Build number** (số build) | `CURRENT_PROJECT_VERSION` → `CFBundleVersion` | `1` | Không trực tiếp — chỉ thấy trên TestFlight / App Store Connect dạng `1.0 (1)` |

- **Version** trả lời câu "đây là bản nào" (tính năng gì, sửa lỗi gì).
- **Build number** trả lời câu "đây là lần build thứ mấy của bản đó".
- Hai số độc lập: cùng một version có thể có nhiều build (build 1, 2, 3…),
  nhưng một build number không bao giờ được dùng lại cho cùng một version.

## 2. Semantic Versioning — khi nào tăng số nào

FotoBro dùng **Semantic Versioning** dạng `MAJOR.MINOR.PATCH` (ví dụ `1.0.0`).
Số hiển thị cho người dùng (`APP_VERSION`, `MARKETING_VERSION`) rút gọn còn
`MAJOR.MINOR` khi `PATCH = 0` (v1.0, v1.1…); khi `PATCH > 0` thì hiện đủ
3 số (v1.0.1, v1.0.2…). Số đầy đủ 3 số luôn được ghi trong `package.json`
(xem §5).

| Loại thay đổi | Tăng số nào | Ví dụ | Ghi chú |
|---|---|---|---|
| Tính năng mới, thay đổi lớn về UX, thêm màn/luồng mới | `MINOR` (+1), `PATCH` về 0 | v1.0 → **v1.1** (thêm mic giọng nói native — đã chốt làm ở v1.1) | Loại bump thường gặp nhất ở v1.x |
| Chỉ sửa lỗi, **không thêm tính năng** | `PATCH` (+1) | v1.0 → **v1.0.1** (sửa lỗi đăng nhập Google) | Xem §4 quy tắc hotfix |
| Thay đổi phá vỡ dữ liệu cũ, đổi Bundle ID, viết lại app | `MAJOR` (+1), `MINOR` và `PATCH` về 0 | v1.x → **v2.0** | **Chỉ khi Việt chốt.** Agent chỉ đề xuất, không tự chốt MAJOR |

Quy tắc bổ sung:

- **Việt là người chốt số version của bản tiếp theo.** Agent đề xuất theo
  bảng trên, không tự chốt.
- Không bump version chỉ vì cập nhật nội dung/dữ liệu trong app (ví dụ thêm
  bài vào Bản tin, đổi ảnh mẫu, sửa chữ trong mẫu tin nhắn mà không đổi code
  tính năng) — cập nhật dữ liệu không tính là bản phát hành mới.
- Không bump `MINOR` cho một bản chỉ sửa lỗi, và không nhét tính năng mới
  vào một bản `PATCH` — nếu đã thêm tính năng thì đó là `MINOR`, dù tính
  năng nhỏ tới đâu.
- Khi tăng `MINOR` hoặc `MAJOR`, `PATCH` về 0. Khi tăng `MAJOR`, `MINOR`
  về 0.
- **Không đổi Bundle ID để "đổi version".** Bundle ID `com.fotobro.app`
  là cố định suốt đời app; đổi Bundle ID là tạo app mới trên App Store,
  người dùng cũ không nhận được cập nhật.

Ví dụ lộ trình đã chốt (xem `CHANGELOG-v1.0.md` mục "Sẽ làm ở v1.1"):

| Bản | Nội dung dự kiến | Loại bump |
|---|---|---|
| v1.0 | Bản đầu tiên lên App Store | — (baseline) |
| v1.1 | Mic giọng nói native + 2 lệnh giọng nói còn thiếu | MINOR |
| v1.0.1 | (nếu có) Sửa lỗi gấp phát hiện sau khi v1.0 lên Store | PATCH — xem §4 |

## 3. Build number — tăng mỗi lần build TestFlight

- Build number là **số nguyên, bắt đầu từ 1**, lưu ở `CURRENT_PROJECT_VERSION`
  trong Xcode (hiện tại `1`, cho cả hai cấu hình Debug và Release).
- **Tăng +1 mỗi lần đẩy build lên TestFlight / App Store Connect, kể cả khi
  version (`MARKETING_VERSION`) không đổi.** App Store Connect **từ chối
  build trùng build number** cho cùng một version — đẩy lại cùng số build
  sẽ bị lỗi, không có ngoại lệ.
- Build number tăng cả khi chỉ build lại để sửa lỗi build (lỗi ký, lỗi
  workflow, thiếu quyền trong `Info.plist`…) mà không đổi một dòng code
  tính năng nào: cứ mỗi lần upload là một build number mới.
- **Không reset build number về 1 khi đổi version.** Apple cho phép reset
  khi sang version mới, nhưng quy tắc của FotoBro là **tăng đơn điệu suốt
  đời app** (1, 2, 3… không quay lại) để không bao giờ nhầm build nào thuộc
  version nào và không bao giờ đụng số cũ. Ví dụ: v1.0 có build 1–3,
  v1.1 tiếp tục từ build 4, không quay về build 1.
- Cách đặt tên đầy đủ của một build: `version (build)` — ví dụ `1.0 (1)`,
  `1.0 (2)`, `1.1 (4)`. Dùng đúng dạng này khi báo cáo, khi ghi changelog
  và khi nhờ Việt/Xèo thử trên TestFlight ("thử giúp build 1.0 (2)").
- Build number **không** hiện trong app cho người dùng cuối; người dùng chỉ
  thấy version (`APP_VERSION`). Đừng nhầm hai số này khi trả lời người dùng
  ("bản 1.0" là version; "build 2" chỉ có ý nghĩa với đội phát hành).

## 4. Hotfix — bản vá lỗi gấp (PATCH)

Hotfix là bản `PATCH` (v1.0.1, v1.0.2…) phát hành ngoài lịch, chỉ để sửa
một lỗi nghiêm trọng đang ảnh hưởng người dùng trên Store (app crash khi mở,
không lưu được job, mất dữ liệu, đăng nhập Google hỏng hoàn toàn…).

Quy tắc bắt buộc của hotfix:

1. **Chỉ sửa lỗi, không thêm tính năng.** Không nhét tính năng mới, không
   đổi UX, không đổi chuỗi hiển thị ngoài phạm vi sửa lỗi — dù tính năng đó
   "nhỏ" hay "đã làm xong rồi". Tính năng chờ bản `MINOR` tiếp theo.
2. **Tăng `PATCH` +1, build number +1** (theo §2 và §3). Không dùng lại số
   version/build của bản đang lỗi.
3. **Phạm vi sửa tối thiểu:** chỉ sửa đúng chỗ gây lỗi và test bao quanh nó.
   Sửa càng ít, càng ít rủi ro phải vá tiếp bằng một hotfix nữa.
4. **Changelog riêng:** tạo file `CHANGELOG-v1.0.1.md` mới (theo mẫu
   `CHANGELOG-v1.0.md`, xem `batch-content/CHANGELOG-PROCESS.md` §3),
   ghi rõ lỗi gì, ai bị ảnh hưởng, sửa như thế nào. Một bản phát hành =
   một file changelog — hotfix cũng không ngoại lệ.
5. **What's New trên App Store Connect chỉ cần 1 dòng:** "Sửa lỗi …" nêu
   lỗi người dùng thấy rõ nhất; không liệt kê lỗi nội bộ
   (xem `CHANGELOG-PROCESS.md` §5).
6. **Test lại trước khi đẩy** như bản thường (xem §6) — hotfix gấp không có
   nghĩa là bỏ test. Ít nhất phải chạy lại test jsdom và kiểm chứng đúng
   lỗi đã sửa trên TestFlight trước khi submit.
7. **Sau khi hotfix lên Store:** merge phần sửa lỗi về nhánh làm việc chính
   (để bản `MINOR` sau không mang lại lỗi cũ), và ghi vào changelog của bản
   `MINOR` tiếp theo rằng lỗi đó đã được sửa ở v1.0.1.
8. **Không phát hành 2 hotfix cùng số PATCH.** Nếu v1.0.1 vẫn còn lỗi, bản
   vá tiếp theo là v1.0.2, không "sửa lại v1.0.1".

Không phải lỗi nào cũng cần hotfix: lỗi nhỏ, ít gặp, có cách xử lý tạm thời
thì gom vào bản `MINOR`/`PATCH` theo lịch thường. Việt là người chốt lỗi nào
đáng hotfix.

## 5. Version được ghi ở đâu — 6 nơi phải khớp nhau

| # | Nơi ghi | Tên trường / dòng | Giá trị hiện tại (v1.0, build 1) | Ai sửa |
|---|---|---|---|---|
| 1 | `www/index.html` (dòng ~3860) | `var APP_VERSION = '1.0';` | `'1.0'` | Agent làm bản phát hành |
| 2 | `ios/App/App.xcodeproj/project.pbxproj` (cả 2 cấu hình Debug **và** Release) | `MARKETING_VERSION = 1.0;` | `1.0` | Agent (sửa trong Xcode hoặc sửa file; **cả 2 chỗ phải giống nhau**) |
| 3 | `ios/App/App.xcodeproj/project.pbxproj` (cả 2 cấu hình Debug **và** Release) | `CURRENT_PROJECT_VERSION = 1;` | `1` | Agent — tăng +1 mỗi lần upload |
| 4 | `ios/App/App/Info.plist` | `CFBundleShortVersionString` = `$(MARKETING_VERSION)`; `CFBundleVersion` = `$(CURRENT_PROJECT_VERSION)` | (tham chiếu, không ghi số cứng) | **Không sửa tay** — hai key này chỉ trỏ sang giá trị ở `project.pbxproj` (§5, mục 2–3). Ai ghi số cứng vào đây là sai |
| 5 | `package.json` (gốc repo) | `"version": "1.0.0"` | `1.0.0` | Agent — luôn ghi đủ 3 số semver (`1.0.0`, `1.1.0`, `1.0.1`), kể cả khi `APP_VERSION` hiển thị rút gọn `1.0` |
| 6 | App Store Connect | Trường Version của bản submit + build number đi kèm | `1.0 (1)` | Điền lúc submit (xem `batch-build/RELEASE-CHECKLIST.md` mục B) |
| 7 | `CHANGELOG-vX.Y.md` (gốc repo) | Tiêu đề + dòng `**Phiên bản:** X.Y` + tên file | `CHANGELOG-v1.0.md`, `APP_VERSION = '1.0'`, `MARKETING_VERSION = 1.0` | Agent — tạo file mới cho mỗi bản (xem `CHANGELOG-PROCESS.md` §2–§3) |

Lưu ý quan trọng:

- **Ba số phải bằng nhau:** `APP_VERSION` (mục 1) = `MARKETING_VERSION`
  (mục 2) = số trong tên file changelog (mục 7). Kiểm tra bằng cách tìm
  `APP_VERSION` và `MARKETING_VERSION` trong repo trước khi đẩy
  (xem checklist §6).
- **`ios/App/App/public/index.html` là bản copy do `npx cap sync ios`
  tạo ra — không sửa tay.** Sau khi đổi `APP_VERSION` trong `www/index.html`,
  phải chạy `npx cap sync ios` để copy sang `ios/`, rồi kiểm tra
  `md5sum www/index.html` = `md5sum ios/App/App/public/index.html`.
  Bẫy đã gặp thật ở v1.0: file `public/index.html` vẫn là bản web cũ
  (v2.4, `APP_VERSION = '2.4'`) vì chưa sync — build từ đó sẽ hiện sai
  version trong app native (xem `RELEASE-CHECKLIST.md` mục A4).
- **Không lấy số version của bản web cũ.** Bản web Trợ lý Xèo đã tới v2.5,
  bản web FotoBro v2.6 — nhưng app iOS FotoBro bắt đầu lại từ **v1.0**.
  Không dùng 2.4 / 2.5 / 2.6 làm version iOS (xem `APP-STORE-LISTING.md`).
- Số version **không** nằm trong `capacitor.config.ts` (file này chỉ có
  `appId`, `appName`, `webDir`…) — đừng tìm hay sửa version ở đó.
- Trong app, version hiện ở Cài đặt ("FotoBro v" + `APP_VERSION`) và ở
  footer; đổi `APP_VERSION` là đổi cả hai chỗ hiển thị đó cùng lúc.

## 6. Checklist khi bump version (làm theo đúng thứ tự)

Dùng checklist này **mỗi lần** bump version hoặc tăng build number.
Tick đủ mới được đẩy build / submit.

### 6.1. Trước khi đổi số

- [ ] Việt đã chốt số version mới (và chốt đây là `MINOR`, `PATCH` hay
      hotfix) — agent chỉ đề xuất theo §2, không tự chốt.
- [ ] Đã đọc `CHANGELOG-PROCESS.md` §4 và xác định đúng loại bump cho
      thay đổi trong bản này (tính năng mới → `MINOR`, chỉ sửa lỗi →
      `PATCH`).
- [ ] Đã tạo file changelog mới `CHANGELOG-vX.Y.md` (với bản patch:
      `CHANGELOG-v1.0.1.md`), theo đúng mẫu `CHANGELOG-v1.0.md`,
      điền phần đầu và khung các mục trống; ngày phát hành để trống
      `_chưa chốt_` cho tới khi Việt chốt / TestFlight được duyệt.

### 6.2. Đổi số (cả 5 nơi ở §5)

- [ ] `www/index.html`: đổi `var APP_VERSION = 'X.Y';` (dòng ~3860).
- [ ] `project.pbxproj`: đổi `MARKETING_VERSION` ở **cả 2 cấu hình**
      Debug và Release (2 chỗ, phải giống nhau).
- [ ] `project.pbxproj`: tăng `CURRENT_PROJECT_VERSION` +1 ở **cả 2 cấu
      hình** (2 chỗ, phải giống nhau). Chỉ tăng build mà không đổi version
      thì chỉ làm bước này + bước sync/changelog dưới đây.
- [ ] `package.json`: đổi `"version"` sang đủ 3 số semver
      (`"1.1.0"`, `"1.0.1"`…).
- [ ] `Info.plist`: **kiểm tra, không sửa** — xác nhận hai key vẫn là
      `$(MARKETING_VERSION)` / `$(CURRENT_PROJECT_VERSION)`, không bị ghi
      số cứng.
- [ ] Chạy `npx cap sync ios` để `ios/App/App/public/index.html` khớp
      `www/index.html` (kiểm `md5sum` hai file bằng nhau, grep
      "Trợ lý Xèo" trong `public/` = 0 — xem `RELEASE-CHECKLIST.md` A4).
- [ ] Cập nhật test nếu test còn expect số version cũ: `www/test-fotobro-v1.js`
      dòng ~47 từng expect `APP_VERSION '2.6'` trong khi app đã là `'1.0'`
      (xem `QA-REPORT.md` §4) — sửa test theo spec bản mới, không sửa app
      cho khớp test cũ.

### 6.3. Cập nhật changelog

- [ ] Điền đủ 4 nhóm mục trong changelog mới theo `CHANGELOG-PROCESS.md`
      §3: Tính năng mới / Đã bỏ / Lỗi đã biết / Sẽ làm ở bản sau.
- [ ] Mọi mục "Tính năng mới" đều có thật trong code bản đó; tính năng
      chưa chạy được thật thì ghi rõ `(mới ở vX.Y, chưa chạy được thật)`.
- [ ] Mọi lỗi đã biết đều có nguồn (QA/test, ngày giờ) và file tham chiếu.
- [ ] Kiểm tra lại: `APP_VERSION` = `MARKETING_VERSION` = số trong tên
      file changelog.
- [ ] Việt đã duyệt nội dung changelog.

### 6.4. Test và build lại

- [ ] Chạy `node --check` cho các script inline trong `www/index.html`.
- [ ] Chạy test jsdom (`test-fotobro-v1.js`) đạt đủ số test
      (v1.0: 103/103 — xem `RELEASE-CHECKLIST.md` A2).
- [ ] Build lại qua workflow GitHub Actions (Xcode 26 trở lên — App Store
      Connect từ 28/04/2026 từ chối build bằng Xcode dưới 26) tới khi chạy
      xanh; kiểm tra build trên App Store Connect hiện đúng
      `version (build)` mới, ví dụ `1.1 (4)`.
- [ ] Cài bản TestFlight mới trên iPhone thật, mở Cài đặt trong app kiểm
      tra version hiển thị đúng số mới.
- [ ] Điền What's New lên App Store Connect lúc submit (tối đa 5 dòng cho
      bản `MINOR`, 1 dòng cho bản `PATCH` — xem `CHANGELOG-PROCESS.md` §5),
      rồi ghi lại nội dung đã submit vào cuối file changelog.
- [ ] Ngày phát hành trong changelog chỉ điền khi bản TestFlight đầu tiên
      được duyệt / bản lên App Store.

### 6.5. Sau khi submit

- [ ] Ghi lại số `version (build)` đã submit vào changelog (kèm ngày submit
      của What's New).
- [ ] Nếu Apple reject / cần build lại cùng version: chỉ tăng build number
      (+1), không đổi version, không tạo changelog mới — ghi chú thêm dòng
      build mới vào changelog hiện tại.
- [ ] Nếu phải quay lại bản cũ: xem `batch-build/ROLLBACK-PLAN.md` — không
      "hạ version" của bản đã submit (Apple không cho hạ version của cùng
      một bản ghi); cách quay lại là đẩy bản mới (version cao hơn) chứa code
      cũ, hoặc gỡ bản khỏi review.

## 7. Ví dụ đầy đủ — từ v1.0 (1) lên v1.1 (4)

Giả sử v1.0 đã có 3 build trên TestFlight (build 1, 2, 3) và giờ làm v1.1
thêm mic giọng nói native:

| Bước | Thao tác | Kết quả |
|---|---|---|
| 1 | Việt chốt: bản tiếp theo là v1.1 (MINOR — thêm tính năng) | — |
| 2 | Tạo `CHANGELOG-v1.1.md`, điền khung mục, ngày để trống | File mới |
| 3 | `www/index.html`: `var APP_VERSION = '1.0';` → `'1.1';` | `APP_VERSION = '1.1'` |
| 4 | `project.pbxproj` (Debug + Release): `MARKETING_VERSION = 1.0;` → `1.1;` | `MARKETING_VERSION = 1.1` |
| 5 | `project.pbxproj` (Debug + Release): `CURRENT_PROJECT_VERSION = 3;` → `4;` | Build 4 (không reset về 1) |
| 6 | `package.json`: `"version": "1.0.0"` → `"1.1.0"` | `1.1.0` |
| 7 | `npx cap sync ios` + kiểm `md5sum` `www/` = `public/` | Đồng bộ xong |
| 8 | Cập nhật test expect `APP_VERSION '1.1'`, chạy test đạt đủ | Test xanh |
| 9 | Điền changelog, Việt duyệt, build Actions xanh, upload | App Store Connect hiện `1.1 (4)` |
| 10 | Điền What's New (≤ 5 dòng, VI + EN), ghi lại vào changelog | Submit xong |

Ví dụ hotfix: v1.0 đang trên Store thì phát hiện crash khi mở app → bản vá
là **v1.0.1** (PATCH, không thêm tính năng), `APP_VERSION = '1.0.1'`,
`MARKETING_VERSION = 1.0.1`, `package.json` `"1.0.1"`, build number tiếp
tục tăng (ví dụ từ 3 lên 4), file `CHANGELOG-v1.0.1.md` mới, What's New
1 dòng "Sửa lỗi app thoát đột ngột khi mở".

---

*File này chỉ là tài liệu quy tắc — không sửa code, không tạo tài khoản,
không push GitHub. Nguồn kiểm chứng: `www/index.html:3860`,
`ios/App/App.xcodeproj/project.pbxproj` (Debug/Release),
`ios/App/App/Info.plist`, `package.json`, `CHANGELOG-v1.0.md`,
`batch-content/CHANGELOG-PROCESS.md` §4, `batch-build/RELEASE-CHECKLIST.md`.*
