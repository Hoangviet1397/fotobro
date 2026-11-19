# FotoBro iOS v1 — Hiệu năng + Offline

Rà soát ngày 20/11/2026 trên bản trong `~/workspace/fotobro-ios-v1/`
(`www/index.html` sửa lần cuối 17:13 UTC 19/11, 337.803 byte).
Chỉ đọc code, không sửa gì. Các con số "ước tính" dưới đây là ước tính
từ kích thước file + code, CHƯA đo được trên iPhone thật (chưa có bản
TestFlight) — phải đo lại trước khi kết luận.

## 1. Kích thước gói

| Hạng mục | Số liệu thật |
|---|---|
| `www/index.html` | 337.803 byte (~330 KB), 3.860 dòng |
| Script inline trong `index.html` | 13 thẻ `<script>` |
| `www/fotobro-config.js` | 1.554 byte |
| `www/capacitor-bridge.js` | 9.115 byte |
| Toàn bộ `www/` | ~492 KB (gồm icon PNG 15–44 KB, `test-fotobro-v1.js` 16 KB) |
| `ios/App/App/public/` | 852 KB — bản cũ, `npx cap sync ios` sẽ ghi đè bằng `www/` |

- Không có tài nguyên ngoài nào tải lúc mở app: toàn bộ CSS/JS nhúng
  inline, icon là file local. Các URL `https://` trong code chỉ là
  Google API / link mở app ngoài, không fetch lúc khởi động.
- Không có `sw.js` trong `www/` iOS. Code đăng ký service worker có
  guard `location.protocol === 'https:'` nên trên
  `capacitor://localhost` nó không bao giờ chạy — đúng, không cần
  service worker trong app native: offline có được là nhờ file local
  trong gói, không nhờ cache.

## 2. Thời gian mở app (ước tính, chưa đo)

Luồng khởi động trong `init()`: `paintIcons()` → `renderAll()` →
`showStorageNote()` → `setNav()` → chào trong khung chat.

- Tải file: gần như 0 ms chờ mạng — file nằm trong gói app.
- Parse: 330 KB HTML/CSS/JS + 13 script inline. Trên iPhone đời
  mới ước tính 0,3–0,8 giây tới khi thấy màn Hôm nay; máy cũ
  (iPhone SE 2 / iPhone 8) có thể ~1–1,5 giây. **Chưa đo — cần đo
  trên TestFlight (cold start + time-to-interactive).**
- `loadMyShots()` là async, không chặn màn hình chính. Nhưng nó
  `getAll()` rồi tạo `URL.createObjectURL()` cho **cả 60 ảnh** ngay
  lúc mở app, dù màn Hôm nay chỉ hiện 1 ảnh hero (xem mục 4).

## 3. Dữ liệu lưu trên máy — giới hạn

| Nơi lưu | Nội dung | Giới hạn thực tế |
|---|---|---|
| localStorage key `troLyXeo.v1` | 1 JSON duy nhất: `{jobs, txs, sample, uid, checkDone, cfg}` | WebKit/WKWebView ~5 MB (không phải giới hạn cứng theo spec, là mức thực tế hay gặp; vượt là `setItem` throw) |
| IndexedDB `troLyXeoPhotos` | Ảnh trang chủ, tối đa `MAX_PHOTOS = 60`, mỗi ảnh đã thu nhỏ | Giới hạn theo dung lượng trống của máy / quota WebKit (thường hàng trăm MB trở lên), không phải 5 MB như localStorage |
| sessionStorage | Token Google (`troLyXeo.gtoken`), key tạm | Mất khi đóng app — đúng thiết kế (token phải đổi lại bằng refresh token) |
| localStorage phụ | `troLyXeo.lock`, `troLyXeo.heroPin`, `troLyXeo.gmail`, `troLyXeo.gseen`, `troLyXeo.lastBackup`… | Nhỏ, không đáng kể |

- Ảnh thêm từ máy được thu nhỏ trước khi lưu (`shrinkPhoto`):
  `createImageBitmap` (tự xoay theo EXIF) → canvas, cạnh dài nhất
  tối đa 1400 px → `toBlob`. Ảnh gốc 12 MP (~3–5 MB) sau thu nhỏ
  còn khoảng vài trăm KB. 60 ảnh ≈ 10–30 MB trong IndexedDB —
  chấp nhận được, nhưng là phần nặng nhất của app.
- `builtinShots = []` ở v1: không còn ảnh mẫu nhúng sẵn trong
  `index.html` (bản v2.6 cũ nặng 716 KB chủ yếu vì 6 ảnh mẫu base64;
  bản v1 còn 330 KB vì đã bỏ chúng).
- Rủi ro lớn nhất: `saveLocal()` ghi **toàn bộ** JSON `troLyXeo.v1`
  bằng 1 lần `setItem` đồng bộ, và `renderAll()` gọi `saveLocal()`
  mỗi lần thay đổi. Dữ liệu càng nhiều (vài trăm job + vài nghìn
  khoản thu chi) thì mỗi lần lưu càng nặng, và nếu ghi đúng lúc hết
  quota / bị ngắt thì có thể mất bản ghi đó. Code đã có `try/catch`
  đặt `storageOK = false` + hiện cảnh báo, nhưng không có cơ chế
  ghi dự phòng. Sao lưu v2 (xem `BACKUP-V2.md`) là lớp bảo vệ cho
  trường hợp này.

## 4. Offline — cái nào chạy, cái nào không

App chạy offline từ file local, nên phần lớn tính năng không cần mạng:

| Chạy offline | Cần mạng |
|---|---|
| Xem/thêm/sửa job, pipeline 8 bước, nhảy bước, huỷ/khôi phục | Đăng nhập Google lần đầu (OAuth qua trình duyệt hệ thống) |
| Sổ thu/chi, báo cáo, lời từng job, báo cáo cuối ngày | Đọc/ghi Google Lịch, Gmail (tiền về, khách hỏi), Danh bạ, Drive |
| Checklist chuẩn bị đồ, phòng ban | Làm mới token Google hết hạn (`refresh token` chỉ trả 1 lần đầu) |
| Cài đặt, bảng giá, cá nhân hoá (màu, logo, ngôn ngữ, tiền tệ) | Mở link ngoài: Facebook/Messenger/Zalo/Instagram/Drive, link Google Lịch |
| Khoá Face ID/PIN, sao lưu/khôi phục JSON trên máy | CloudKit Nấc 2 (hiện `not-configured`) |
| Ảnh trang chủ (đã lưu trong IndexedDB), đổi ảnh theo ngày | Mic nhận diện giọng nói web (đã dời sang v1.1; gõ tay vẫn chạy offline) |
| Nhắc lịch local notification (đã đặt lịch thì iOS phát cả khi app đóng) | — |
| Đọc to câu trả lời bằng `speechSynthesis` tiếng Việt (giọng trên máy) | — |

- Mất mạng giữa chừng: code Google đã xử lý — `gState.error` hiện
  "Đang mất mạng — đang xem lịch đã lưu lần trước" và dùng dữ liệu
  đã cache. Không có crash do mất mạng trong luồng chính.
- Nhắc lịch: bridge đặt nhắc chụp trước 60 phút, hạn giao trước
  24 giờ (xem `NOTIFICATIONS.md` — thiết kế v1 muốn đổi nhắc chụp
  thành 12 tiếng, bridge hiện chưa đổi). Nhắc đã đặt thì iOS phát
  cả khi tắt app; mất nếu máy tắt nguồn đúng giờ nhắc hoặc user
  từ chối quyền / bật Focus.
- Mic: plugin speech-recognition đã gỡ khỏi `package.json` (thiếu
  `Package.swift`); nút mic ở v1 báo "Giọng nói sẽ có ở bản v1.1".
  Gõ tay chạy cùng parser (`runCommand`) nên không mất tính năng,
  chỉ mất nhập bằng giọng nói.

## 5. Điểm cần tối ưu (theo thứ tự ưu tiên)

1. **Chỉ tạo object URL cho ảnh đang hiện, không tạo cho cả 60 ảnh
   lúc mở app** (`loadMyShots`). Hiện tại mở app là tạo 60 URL dù
   chỉ dùng 1 ảnh hero + vài thumbnail. Sửa: chỉ tạo URL cho ảnh
   hero và ảnh đang hiển thị trong lưới, còn lại tạo khi cuộn tới;
   `revokeObjectURL` khi ảnh bị xoá/không còn hiện. Hiệu quả rõ
   nhất trên máy có đủ 60 ảnh.
2. **Đừng `renderAll()` + `saveLocal()` toàn bộ mỗi lần thay đổi.**
   `renderAll()` render lại cả 5 màn (Hôm nay, Buổi chụp, Tiền bạc,
   Phòng ban, Checklist) + ghi toàn bộ JSON, dù chỉ đổi 1 job.
   Sửa: debounce `saveLocal()` (ví dụ 300 ms) và chỉ render lại
   màn đang mở. Hiệu quả tăng theo số job/tx.
3. **Bỏ `test-fotobro-v1.js` (16 KB) khỏi gói `www/` khi build.**
   File test không cần có trong app gửi Apple duyệt; chỉ giữ ở
   ngoài để chạy kiểm tra.
4. **Ảnh: giới hạn dung lượng sau thu nhỏ, không chỉ giới hạn số
   lượng.** 60 ảnh × vài trăm KB vẫn có thể ~30 MB. Thêm kiểm tra:
   nếu 1 ảnh sau thu nhỏ vẫn > ~500 KB thì nén mạnh tay hơn; báo
   dung lượng ảnh đã dùng trong Cài đặt.
5. **Thêm kiểm tra dung lượng `troLyXeo.v1` trước khi vượt 5 MB.**
   Khi JSON gần 4 MB thì cảnh báo user sao lưu + dọn dữ liệu cũ,
   thay vì đợi `setItem` throw mới báo.
6. **Google sync: giới hạn đã có là đủ, đừng nới.** Hiện tại đọc
   tối đa 12 lịch × 250 sự kiện, Gmail 40 + 25 thư/lần, có cache
   theo thời gian — giữ nguyên, không tăng `maxResults`.
7. **Đo thật trên TestFlight trước khi kết luận:** cold start,
   time-to-interactive, bộ nhớ khi đủ 60 ảnh, và stress test với
   500 job / 2.000 khoản thu chi (tạo bằng script, không nhập tay).
   Nếu mở app trên iPhone SE 2 > 2 giây thì mới tính tới tách
   file hay lazy-load script.

## 6. Kết luận nhanh

- Gói nhẹ (www ~492 KB, app chính 330 KB), mở app không chờ mạng:
  hiệu năng v1 đủ tốt cho máy mới, cần đo lại trên máy cũ.
- Offline là điểm mạnh thật: lõi app (job, tiền, nhắc) chạy hoàn
  toàn không cần mạng; chỉ Google/CloudKit/link ngoài cần mạng.
- Nút thắt duy nhất có thể phình theo thời gian là 2 chỗ ghi/lưu
  toàn bộ mỗi lần (localStorage JSON + 60 object URL ảnh) — sửa
  2 điểm đó ở mục 5.1–5.2 là đủ cho v1, không cần kiến trúc lại.
