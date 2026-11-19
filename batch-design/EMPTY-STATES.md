# Empty States — FotoBro iOS v1

Thiết kế + câu chữ màn hình trống cho 5 trạng thái trống của app.
Nguồn đối chiếu: `www/index.html` (chỉ đọc, không sửa) — các câu trống đã có
sẵn trong app được giữ nguyên ở chỗ nào đã đúng giọng, chỉ thêm những gì còn
thiếu (mô tả 1 dòng, nút hành động).

## Quy tắc chung (áp dụng cho cả 5 màn)

- **Bố cục:** dùng đúng mẫu đã có trong app (`.empty-row` căn giữa, dọc):
  icon lớn → tiêu đề → mô tả 1 dòng → 1 nút chính. Padding `28px 20px`,
  căn giữa, tối đa 1 nút chính (`.btn fill`) để đúng luật "tối đa 3 chạm".
- **Icon:** lấy từ bộ `IC` có sẵn trong app, nền `bg-accent` (trừ Sổ tiền
  dùng `bg-green` như code hiện tại). Không thêm icon mới ở v1.
- **Màu:** nút chính nền accent `#FA2D48` (light) / `#FF375F` (dark mode đen
  thật `#000000`). Chữ nút trắng. Không dùng thêm màu nhấn thứ hai.
- **Chữ:** tiêu đề 19px, bold; mô tả 15px, màu `muted` (`--label2`).
  Câu chữ ngắn, thân thiện, xưng hô như app đang dùng: "bạn", "nha", "thôi".
  Không dùng từ chuyên môn, không dọa người dùng, không đổ lỗi ("bạn chưa…").
- **Nút:** chiều cao chạm tối thiểu 44pt, nhãn bắt đầu bằng động từ
  ("Thêm…", "Ghi…", "Nhập…"). Nút mở đúng form/flow đã có trong app,
  không tạo flow mới.
- **Song ngữ:** mọi chuỗi đều có đủ VI + EN, đặt tên key theo kiểu snake_case
  như `I18N-STRINGS.md` để đưa thẳng vào bảng i18n v1. Tiếng Anh giữ giọng
  ấm, ngắn, không dịch từng chữ.
- **Trạng thái lọc:** màn Job khi đang lọc theo 1 bước pipeline thì tiêu đề
  thêm "ở bước này" (đã có trong code) và nút chính giữ nguyên.

## 1. Hôm nay — chưa có job hôm nay

Vị trí: `view-home`, khu "Cần nhớ hôm nay" (`index.html:1213` — câu hiện tại
được giữ nguyên, chỉ thêm nút).

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Hôm nay thong thả lắm | A slow day today |
| **Mô tả (1 dòng)** | Không có hạn nào dí hết — pha trà, ngắm ảnh, nghĩ concept mới thôi. | Nothing chasing you — make tea, look at photos, dream up a new concept. |
| **Nút chính** | + Thêm buổi chụp | + Add a shoot |
| **Icon** | `sleep` (như hiện tại) | — |
| **Hành động** | `openJobForm()` | — |

Key gợi ý: `empty_today_title`, `empty_today_desc`, `empty_today_cta`.
Ghi chú: nếu ngày mai có job thì có thể thêm link phụ "Xem ngày mai"
(`.btn plain`, không bắt buộc ở v1) — không thêm nút thứ hai dạng fill.

## 2. Job (Buổi chụp) — chưa có job nào

Vị trí: `view-jobs`, `#jobList` (`index.html:1375` — cả ba câu dưới đây đã có
sẵn trong code, giữ nguyên toàn bộ).

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Chưa có buổi chụp nào | No shoots yet |
| **Mô tả (1 dòng)** | Có khách mới thì thêm vào đây, mất chừng 10 giây. | Got a new client? Add them here — it takes about 10 seconds. |
| **Nút chính** | + Thêm buổi chụp | + Add a shoot |
| **Icon** | `cam` | — |
| **Hành động** | `openJobForm()` | — |

Key gợi ý: `empty_jobs_title`, `empty_jobs_desc`, `empty_jobs_cta`.
Biến thể khi lọc theo bước: tiêu đề thành "Chưa có buổi chụp nào ở bước
này" / "No shoots at this step yet" — mô tả và nút giữ nguyên.

## 3. Sổ tiền (Tiền bạc) — chưa có giao dịch

Vị trí: `view-money`, `#txList` (`index.html:1815` — tiêu đề và nút đã có
sẵn trong code, chỉ thêm mô tả 1 dòng).

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Chưa có khoản nào | No transactions yet |
| **Mô tả (1 dòng)** | Thu hay chi, ghi lại một dòng là sổ tự cộng. | Income or expense — one entry and the book adds it up. |
| **Nút chính** | + Ghi khoản đầu tiên | + Record your first entry |
| **Icon** | `wallet`, nền `bg-green` | — |
| **Hành động** | `openTxForm()` | — |

Key gợi ý: `empty_money_title`, `empty_money_desc`, `empty_money_cta`.
Ghi chú: không nhắc số tiền, không nhắc cọc ở đây — người dùng mới chưa
có job nào thì "khoản đầu tiên" thường là cọc, form sẽ tự điền theo gói.

## 4. Lịch — chưa có lịch

Vị trí: màn nhập/xem lịch 30 ngày tới (`index.html:3153` hiện chỉ có dòng
chữ xám "30 ngày tới chưa có lịch nào." — nâng lên thành empty state đầy đủ
theo mẫu chung; logic nhập giữ nguyên `index.html:2834–2921`).

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Chưa có lịch nào | No events yet |
| **Mô tả (1 dòng)** | 30 ngày tới đang trống — nhập Lịch iPhone một chạm là có ngay. | The next 30 days are clear — import from iPhone Calendar in one tap. |
| **Nút chính** | Nhập từ Lịch iPhone | Import from iPhone Calendar |
| **Nút phụ** | Đăng nhập Google | Sign in with Google |
| **Icon** | `cal`, nền `bg-red` | — |
| **Hành động** | Mở sheet nhập lịch native (EventKit, 30 ngày tới) | — |

Key gợi ý: `empty_cal_title`, `empty_cal_desc`, `empty_cal_cta`,
`empty_cal_secondary`.
Ghi chú: nút phụ là `.btn tint`, chỉ hiện khi máy chưa có Lịch iPhone
native (đúng điều kiện rẽ nhánh đã có trong code). Không nhắc chuyện
quyền truy cập lịch ở màn trống — nếu người dùng từ chối quyền thì toast
hiện tại đã xử lý ("Chưa cho phép đọc Lịch iPhone — bật trong Cài đặt
iPhone → FotoBro → Lịch").

## 5. Ảnh — chưa có ảnh

Vị trí: khu ảnh trên màn Hôm nay, `view-home` → `#igShots`
(`index.html:590` — câu hiện tại "Chưa có ảnh mẫu — thêm ảnh của bạn từ
máy ở dưới." được thay bằng bộ ba dưới đây cho gọn và có nút).

| | Tiếng Việt | English |
|---|---|---|
| **Tiêu đề** | Chưa có ảnh nào | No photos yet |
| **Mô tả (1 dòng)** | Thêm vài tấm bạn ưng nhất, ảnh trang chủ sẽ đổi mỗi ngày. | Add a few favourites and your home photo will change every day. |
| **Nút chính** | + Thêm ảnh từ máy | + Add photos from your phone |
| **Icon** | `cam` (hoặc `plusc`) | — |
| **Hành động** | Mở `#myShotFile` (chọn ảnh từ máy, như nút hiện tại) | — |

Key gợi ý: `empty_photos_title`, `empty_photos_desc`, `empty_photos_cta`.
Ghi chú: ảnh thêm từ máy chỉ nằm trên máy này (không đồng bộ ở v1) — câu
mô tả không hứa hẹn gì thêm; dòng chú thích hiện tại dưới khu ảnh
("Ảnh Instagram… chạm để mở bài gốc…") giữ nguyên.

## Không có empty state: Cài đặt

Cài đặt là màn hình cấu hình (mở bằng sheet `openSettings()`), không phải
danh sách — nên không có trạng thái trống. Khi người dùng mới mở Cài đặt,
mọi mục đều hiển thị giá trị mặc định (bảng giá, % cọc, màu chủ đề…), không
hiện màn trống và không ép điền gì trước khi dùng app.

## Lưu ý đối chiếu với app thật (để bên triển khai khỏi nhầm)

- Tên tab trong `www/index.html` hiện tại là: Hôm nay, Buổi chụp, Tiền
  bạc, Phòng ban, Trợ lý (tab bar `index.html:703–708`). Tài liệu này dùng
  tên theo nhiệm vụ giao ("Job", "Sổ tiền", "Lịch", "Cài đặt") và ghi rõ
  vị trí thật trong code cho từng màn: "Lịch" là flow nhập lịch (không
  phải tab riêng), "Cài đặt" là sheet, "Ảnh" là khu vực trên màn Hôm nay.
- Nếu sau này Lịch thành tab riêng thì dùng nguyên bộ câu chữ ở mục 4,
  chỉ đổi đích của nút chính từ "mở sheet nhập lịch" thành "mở màn Lịch".
- Toàn bộ câu chữ trên chưa được đưa vào code — file này chỉ là thiết kế
  và câu chữ, việc gắn key i18n + thay chuỗi trong `index.html` là bước
  triển khai riêng, cần Việt duyệt trước theo quy trình Vibe Coding.
