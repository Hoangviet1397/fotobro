# FotoBro — Quy trình duy trì changelog

Tài liệu này quy định cách viết và cập nhật changelog cho mỗi bản phát hành
của app iOS FotoBro, để ghi chú các bản luôn đúng mẫu, đủ thông tin và khớp
với những gì người dùng thấy trên App Store.

- **File changelog của mỗi bản:** `CHANGELOG-vX.Y.md` đặt ở gốc
  `~/workspace/fotobro-ios-v1/` (ví dụ: `CHANGELOG-v1.0.md`).
- **File mẫu tham chiếu:** `CHANGELOG-v1.0.md` — mọi bản sau bám đúng cấu trúc
  và giọng văn của file này (không đổi tên mục, không tự chế mục mới).
- **Repo:** `Hoangviet1397/fotobro` (repo mới, tách riêng khỏi `tro-ly-xeo`).

## 1. Ai viết

| Người viết | Vai trò |
|---|---|
| Agent làm bản phát hành (Muse / Claude) | Soạn nháp changelog từ danh sách thay đổi thật trong code của bản đó. |
| Việt (chủ app) | Duyệt nội dung trước khi đẩy lên repo; là người duy nhất chốt ngày phát hành và chốt danh sách "Sẽ làm ở bản sau". |

Quy tắc:

- Changelog do agent soạn, **không tự điền ngày phát hành** — để trống
  `_chưa chốt_` cho tới khi Việt chốt (như v1.0 đang làm).
- Chỉ ghi những gì **đã làm thật trong code của bản đó**. Tính năng thiết
  kế xong nhưng chưa code thì ghi vào mục "Sẽ làm ở bản sau", không ghi vào
  "Tính năng mới".
- Mọi mục "Lỗi đã biết" phải có nguồn kiểm chứng: ghi rõ lấy từ QA nào
  (file `QA-REPORT.md` hay lần test nào, ngày giờ nào), như v1.0 đã ghi
  "QA độc lập lúc 00:03–00:04 ngày 20/11/2026 (xem `QA-REPORT.md`)".

## 2. Khi nào viết

Changelog được viết theo 3 thời điểm, theo thứ tự:

1. **Đầu bản phát hành (khi bắt đầu làm):** tạo file `CHANGELOG-vX.Y.md`
   mới, điền phần đầu (phiên bản, Bundle ID, nền tảng, repo, nguồn) và
   khung các mục trống. Ngày phát hành để trống.
2. **Trong lúc làm:** cập nhật từng mục ngay khi một thay đổi được làm xong
   và kiểm chứng (không dồn tới cuối mới viết lại từ trí nhớ).
3. **Trước khi đẩy lên repo / trước khi submit TestFlight:** rà soát lần
   cuối — đối chiếu từng mục với code thật, Việt duyệt, rồi mới điền ngày
   phát hành (khi bản TestFlight đầu tiên được duyệt, hoặc ngày lên App Store).

**Không** viết changelog sau khi bản đã lên App Store — lúc đó chỉ còn sửa
mục "Lỗi đã biết" nếu phát hiện lỗi mới (ghi rõ ngày phát hiện).

## 3. Mẫu mục cho mỗi bản

Bám đúng cấu trúc của `CHANGELOG-v1.0.md`. Mỗi bản gồm phần đầu + 4 nhóm
mục sau, theo đúng thứ tự này:

### Phần đầu (bắt buộc, viết ở trên cùng)

```markdown
# FotoBro — Changelog vX.Y

- **Phiên bản:** X.Y (`APP_VERSION = 'X.Y'`, `MARKETING_VERSION = X.Y`)
- **Bundle ID:** `com.fotobro.app`
- **Nền tảng:** iOS (Capacitor 8), ...
- **Ngày phát hành:** _chưa chốt_ (để trống — điền khi bản TestFlight đầu tiên được duyệt)
- **Repo:** `Hoangviet1397/fotobro`
- **Nguồn:** ... (bản trước làm nền, hoặc ghi "bản vá của vX.Y")

> Ghi chú: ...
```

- `APP_VERSION` trong code web (`www/`) và `MARKETING_VERSION` trong
  `ios/` phải bằng nhau và bằng số trong tên file changelog.
- Nếu bản chưa build `.ipa` thật / chưa lên TestFlight / chưa kiểm chứng
  trên iPhone thật thì **ghi rõ trong khối ghi chú**, như v1.0 đã làm.

### 3.1. Tính năng mới trong vX.Y

- Một gạch đầu dòng cho mỗi thay đổi, nhóm theo chủ đề bằng tiêu đề `###`
  (ví dụ: "Pipeline cải tiến", "Cá nhân hoá chung", "Google — đăng nhập
  1 chạm", "UX/UI kiểu Apple Music").
- Mỗi mục ghi **cái gì thay đổi + người dùng thấy gì**, không ghi chi tiết
  kỹ thuật nội bộ (chi tiết kỹ thuật để trong file thiết kế riêng, ví dụ
  `GOOGLE-SETUP.md`, `CLOUDKIT-PLAN.md`).
- Tính năng **chưa chạy được thật** (ví dụ: Google chưa có Client ID, Lịch
  iPhone native chưa có plugin) vẫn ghi trong "Tính năng mới" nhưng phải
  thêm rõ `(mới ở vX.Y, chưa chạy được thật)` ngay ở tiêu đề nhóm, như
  v1.0 đã làm — không được ghi như thể đã chạy được.
- Thiết kế đã xong nhưng chưa code (ví dụ: màn chào lần đầu ở v1.0) thì ghi
  rõ `(thiết kế xong, xem <tên file>.md)` và không liệt kê chi tiết như
  tính năng đã có.

### 3.2. Đã bỏ so với bản trước

- Ghi mọi thứ bị bỏ hẳn so với bản trước (tính năng, dữ liệu mẫu, luồng
  cũ), kể cả thứ "không làm ở bản này" nhưng đã từng có trong bản trước
  hoặc đã hứa ở bản trước.
- Ghi rõ lý do bỏ trong 1 dòng nếu có (ví dụ: "đã bỏ hẳn — chỉ còn nhập
  Lịch iPhone native + đăng nhập Google").
- Nếu có kiểm chứng (ví dụ: "kiểm chứng: 0 lần trong code v1") thì ghi kèm
  để người đọc tin được là đã bỏ thật.

### 3.3. Lỗi đã biết / chưa làm xong ở vX.Y

- Mỗi lỗi một gạch đầu dòng, bắt đầu bằng **tên lỗi in đậm**, rồi mô tả
  ngắn: nguyên nhân (nếu biết), ảnh hưởng tới người dùng, và cách xử lý
  tạm thời (nếu có).
- Lỗi nào dời sang bản sau thì ghi rõ "dời sang vX.Y+1" và ghi vào luôn
  mục 3.4.
- Ghi kèm file tham chiếu để tra cứu (ví dụ: "Xem `QA-REPORT.md` §4",
  "Xem `CLOUDKIT-PLAN.md`").
- Mục này **không được để trống bằng cách giấu lỗi**: nếu chưa kiểm chứng
  trên iPhone thật thì phải ghi rõ "Chưa kiểm chứng trên iPhone thật" với
  danh sách những gì chưa chạy (build `.ipa`, TestFlight, Face ID...),
  như v1.0 đã làm.
- Các mục "Chưa có" (email hỗ trợ, Privacy Policy URL, Support URL,
  screenshots, icon mới) gom thành một gạch đầu dòng cuối mục này, ghi rõ
  cái nào vẫn là placeholder.

### 3.4. Sẽ làm ở vX.Y+1 (không có trong vX.Y)

- Liệt kê ngắn gọn các việc đã chốt làm ở bản sau, mỗi việc một gạch đầu
  dòng, kèm file thiết kế nếu đã có (ví dụ: "— thiết kế xong, xem
  `BACKUP-V2.md`").
- Chỉ ghi việc **đã được Việt chốt**. Việc chưa chốt thì không ghi vào đây
  (để trong file kế hoạch riêng, ví dụ `PRICING-DRAFT.md`, `RISKS.md`).

## 4. Quy tắc đánh số phiên bản

FotoBro dùng **Semantic Versioning** dạng `MAJOR.MINOR.PATCH`
(ví dụ: `1.0.0`), nhưng số hiển thị cho người dùng (`MARKETING_VERSION`,
`APP_VERSION`) chỉ lấy `MAJOR.MINOR` khi `PATCH = 0` (v1.0, v1.1...).

| Loại thay đổi | Tăng số nào | Ví dụ |
|---|---|---|
| Tính năng mới, thay đổi lớn về UX, đổi tên app, đổi kiến trúc | `MINOR` | v1.0 → v1.1 (thêm mic giọng nói native) |
| Chỉ sửa lỗi, không thêm tính năng | `PATCH` | v1.0 → v1.0.1 (sửa lỗi đăng nhập Google) |
| Thay đổi phá vỡ dữ liệu cũ / đổi Bundle ID / viết lại app | `MAJOR` | v1.x → v2.0 (chỉ khi Việt chốt) |

Quy tắc bắt buộc:

- **Một bản phát hành = một số phiên bản = một file changelog.**
  Không dùng chung một số cho hai lần đẩy khác nhau.
- Số phiên bản phải khớp ở **cả 3 chỗ**: tên file `CHANGELOG-vX.Y.md`,
  `APP_VERSION` trong code web, `MARKETING_VERSION` trong `ios/`.
  Kiểm tra bằng cách tìm `APP_VERSION` và `MARKETING_VERSION` trước khi
  đẩy.
- **Build number** (`CURRENT_PROJECT_VERSION` trong Xcode) tăng +1 mỗi lần
  đẩy lên TestFlight/App Store Connect, kể cả khi số phiên bản
  (`MARKETING_VERSION`) không đổi — App Store Connect từ chối build trùng
  build number.
- Không bump phiên bản chỉ vì cập nhật nội dung (ví dụ: thêm bài vào Bản
  tin trong app Nội khoa & Hồi sức thì không bump — quy tắc tương tự áp
  dụng ở đây: cập nhật dữ liệu trong app không tính là bản phát hành mới).
- Việt là người chốt số phiên bản của bản tiếp theo. Agent đề xuất theo
  bảng trên, không tự chốt.

## 5. Khi nào cập nhật mục "What's New" trên App Store Connect

Mục "What's New" (tiếng Việt: "Tính năng mới") trên App Store Connect là
bản tóm tắt **ngắn** của changelog, viết cho người dùng cuối — không copy
nguyên changelog vào.

- **Khi nào cập nhật:** mỗi lần submit một bản mới lên App Store Connect
  (kể cả bản TestFlight nội bộ muốn ghi chú cho tester). Điền ngay lúc
  submit, không để sau.
- **Lấy nội dung từ đâu:** chỉ lấy từ mục 3.1 "Tính năng mới" và mục 3.2
  "Đã bỏ" của changelog bản đó. **Không** đưa mục "Lỗi đã biết" lên
  App Store Connect (lỗi đã biết chỉ ở trong changelog nội bộ).
- **Cách viết:**
  - Tối đa 5 gạch đầu dòng, mỗi dòng 1 câu, viết cho người dùng cuối
    (không nhắc tên file, tên plugin, tên kỹ thuật).
  - Bỏ hết các ghi chú "(chưa chạy được thật)" — nếu tính năng chưa chạy
    được thật thì **không đưa lên What's New**.
  - Viết bằng **tiếng Việt** (ngôn ngữ chính của app) và **tiếng Anh**
    (app có giao diện Việt/Anh) — hai bản, nội dung khớp nhau.
  - Ví dụ (từ v1.0): "Nhảy thẳng tới bất kỳ bước nào trong quy trình
    8 bước của một job." / "Jump straight to any step in a job's
    8-step pipeline."
- **Sau khi điền:** ghi lại nội dung What's New đã submit vào cuối file
  `CHANGELOG-vX.Y.md` (thêm mục "## What's New đã submit lên App Store
  Connect" kèm ngày submit), để lần sau đối chiếu không bị lệch.
- **Bản vá lỗi (PATCH):** What's New chỉ cần 1 dòng: "Sửa lỗi ..." nêu lỗi
  người dùng thấy rõ nhất; không liệt kê hết lỗi nội bộ.

## 6. Checklist trước khi đẩy bản phát hành

- [ ] File `CHANGELOG-vX.Y.md` đã tạo, đúng mẫu v1.0, đủ 4 nhóm mục.
- [ ] Mọi mục "Tính năng mới" đều có thật trong code bản đó.
- [ ] Mọi lỗi đã biết đều có nguồn (QA/test) và file tham chiếu.
- [ ] `APP_VERSION` = `MARKETING_VERSION` = số trong tên file changelog.
- [ ] Build number đã tăng +1 so với lần đẩy trước.
- [ ] Ngày phát hành vẫn để trống cho tới khi Việt chốt / TestFlight được duyệt.
- [ ] Việt đã duyệt nội dung changelog.
- [ ] Sau khi submit: đã điền What's New lên App Store Connect và ghi lại
      vào cuối file changelog.
