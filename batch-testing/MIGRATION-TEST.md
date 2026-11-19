# FotoBro iOS v1 — Ca test migration web v2.5 → iOS v1

> Ngày: 20/11/2026. Trạng thái: **kế hoạch test, chưa chạy.**
> Phạm vi: chỉ đường chuyển dữ liệu từ bản web v2.5 (Trợ lý Xèo)
> sang app FotoBro iOS v1. Chỉ viết file này, không sửa bất kỳ file
> nào khác, không tạo tài khoản, không push GitHub.
> Nguồn căn cứ (chỉ đọc, không sửa):
> - `www/index.html` — code thật đang chạy: `LS_KEY = 'troLyXeo.v1'`
>   (dòng ~904), `saveLocal`/`loadLocal` (dòng ~908–925),
>   `cleanData()`/`mergeCfg()`/`DEFAULT_CFG` (dòng ~813–900),
>   xuất sao lưu v1 (dòng ~2222–2229), nhập sao lưu v1 (dòng
>   ~2230–2244), `wipeAll` (dòng ~2250–2262), ảnh IndexedDB
>   `troLyXeoPhotos` + `shrinkPhoto()` + `MAX_PHOTOS = 60`
>   (dòng ~3722–3790), `heroPin` (dòng ~3759), `seed()` iOS v1
>   (dòng ~859–862: `sample=false`, jobs/txs rỗng, `uid=100`).
> - `BACKUP-V2.md` — thiết kế sao lưu v2 (**chưa code vào app**):
>   envelope `fotobro-backup` v2, bản mã hoá AES-256-GCM +
>   PBKDF2, tách ảnh > 25 MB, khôi phục thay thế + tự lưu bản
>   dự phòng, đọc được file v1 cũ, nhắc sao lưu 7 ngày.
> - `batch-engineering/MIGRATION-V1-V2.md` — spec mapping V1 → V2
>   (đặc biệt §8: 5 điểm lệch cần chốt; §5.2: ảnh backup là
>   `{id, dataUrl, addedAt}` trong khi code thật lưu
>   `{id, blob, added}`).
> - `batch-engineering/BACKUP-RESTORE-TEST.md` — ca test sao lưu /
>   khôi phục **trong** app iOS v1. File này KHÔNG lặp lại các ca đó;
>   file này chỉ test **đường chuyển từ web v2.5 sang iOS v1**
>   (mở dữ liệu cũ trực tiếp, khôi phục file JSON cũ, ảnh 60 tấm,
>   file v1 trên v1, dữ liệu lỗi/thiếu trường). Ca nào trùng thì
>   ghi rõ "xem BACKUP-RESTORE-TEST.md ca …" thay vì viết lại.
>
> Quy ước ghi kết quả: mỗi ca ghi `ĐẠT` / `KHÔNG ĐẠT` + ngày giờ
> chạy + máy test + phiên bản app + ghi chú. Ca nào thuộc thiết kế
> v2 mà app hiện tại chưa có thì ghi rõ **v2 — chưa nối vào app,
> chưa chạy được**, không ghi ĐẠT giả.

## Báo cáo theo mẫu 7 mục (Quy trình Vibe Coding)

1. **Mục tiêu:** Kế hoạch test đầy đủ cho đường chuyển dữ liệu web
   v2.5 sang iOS v1: mở dữ liệu cũ trực tiếp có được không, khôi
   phục file JSON cũ có đủ job/tiền/cài đặt không, 60 ảnh xử lý
   sao, file v1 cũ mở được trên v1 không, dữ liệu lỗi/thiếu
   trường thì app xử lý thế nào.
2. **Đã thực hiện:** Đọc code thật (`cleanData`, `mergeCfg`,
   xuất/nhập sao lưu v1, IndexedDB ảnh, `heroPin`, `wipeAll`) và
   đối chiếu `BACKUP-V2.md`, `MIGRATION-V1-V2.md`,
   `BACKUP-RESTORE-TEST.md`; chỉ viết file này.
3. **Kết quả kiểm tra:** 52 ca test (M-1.x → M-8.x) + 3 fixture
   dữ liệu mẫu, bao phủ cả hai đường chuyển (mở trực tiếp và qua
   file JSON), ảnh, file v1/v2, dữ liệu lỗi, `uid`/`checkDone`/
   `sample`/`heroPin`/khoá. Chưa chạy ca nào — file này là kế
   hoạch, chưa phải kết quả chạy.
4. **Vấn đề còn tồn tại:** (a) chưa chạy ca nào trên app thật;
   (b) app native iOS không chia sẻ localStorage/IndexedDB với
   Safari nên đường "mở trực tiếp" gần như chắc chắn không mang
   dữ liệu sang — file JSON là đường chuyển thật của Xèo (xem §1);
   (c) 5 điểm lệch ở `MIGRATION-V1-V2.md` §8 chưa chốt, ảnh hưởng
   trực tiếp ca M-4.x/M-5.x; (d) nhập file v1 hiện tại reset
   `checkDone = {}` (dòng ~2238) trái với `BACKUP-V2.md` §6.4.
5. **Điều kiện chuyển bước:** Chốt §8 của `MIGRATION-V1-V2.md` →
   chạy các ca P0 trên iPhone thật (M-2.1, M-2.2, M-3.1, M-4.1,
   M-5.1, M-6.1) → ghi ĐẠT/KHÔNG ĐẠT từng ca → mới giao cho Xèo
   chuyển dữ liệu.
6. **Bước tiếp theo:** Chạy nhóm P0 trên iPhone thật theo §0, ghi
   kết quả vào bảng §9; nếu ca M-1.1 đúng như dự đoán (không tự
   chuyển) thì hướng dẫn Xèo đi đường file JSON (§2) trước khi
   giao app.
7. **Trạng thái:** **Kế hoạch xong, chưa chạy ca nào.**

---

## 0. Chuẩn bị chung (dùng cho mọi ca)

1. **Máy test:** iPhone thật cài app FotoBro iOS v1 (Capacitor,
   bản native) là máy chính — vì nút tải file / chọn file và
   WebView storage trên iOS khác trình duyệt desktop. Ghi rõ máy
   nào cho mỗi ca. Ca nào chạy trên bản web cùng code
   `www/index.html` thì ghi rõ "bản web", không ghi chung là "app".
2. **Nguyên tắc an toàn:** trước mọi ca có nguy cơ mất dữ liệu
   (nhóm M-2, M-4, M-5, M-7), xuất 1 bản sao lưu an toàn ra Files
   rồi mới chạy ca. Không bao giờ chạy ca khôi phục trên máy đang
   giữ dữ liệu thật duy nhất của Xèo mà chưa có bản sao lưu.
3. **Kiểm tra sau mỗi ca khôi phục — đủ 7 nhóm:** (1) số job +
   đúng từng trường quan trọng (khách, loại, bước, giá, ngày chụp,
   trạng thái huỷ); (2) số khoản thu chi + **tổng thu/tổng chi
   khớp tới đồng**; (3) cài đặt (giá gói, giá film, % cọc, ngày
   trả ảnh, mẫu tin nhắn, màu chủ đề, ngôn ngữ, tiền tệ);
   (4) ảnh trang chủ (số ảnh, ảnh ghim hôm nay);
   (5) trạng thái check (`checkDone`); (6) `uid` (tạo job mới
   phải có id không trùng job cũ); (7) dữ liệu trên máy trước
   khi khôi phục đã bị thay thế hay còn (đè hay gộp).
4. **Nơi đọc dữ liệu để đối chiếu (không sửa code):** mở DevTools /
   Safari Web Inspector trên máy test, đọc
   `localStorage['troLyXeo.v1']` (JSON `{jobs, txs, sample, uid,
   checkDone, cfg}`) và đếm bản ghi trong IndexedDB
   `troLyXeoPhotos` (store `photos`).

### Fixture F1 — File sao lưu web v2.5 đầy đủ (định dạng v1)

File `fotobro-sao-luu.json` do bản web v2.5 xuất thật (code dòng
~2223: `JSON.stringify({jobs, txs, cfg})`, tên file
`fotobro-sao-luu.json`). **Không có** `uid`, `checkDone`,
`photos`, `sample` trong file — đó chính là điểm cần test.
Dùng đúng nội dung này cho mọi ca nhóm M-2/M-4 (sửa từng chỗ
theo ca, không viết fixture mới):

```json
{
  "jobs": [
    { "id": 101, "client": "Lan Anh", "type": "Portrait", "stage": "Tư vấn",
      "medium": "Digital", "shootDate": "2026-11-22", "shootTime": "09:00",
      "location": "Hồ Gươm", "deadline": "2026-12-06", "price": 2500000,
      "phone": "0901234567", "email": "lananh@example.com",
      "fbLink": "https://facebook.com/lananh", "msLink": "", "driveLink": "",
      "note": "Muốn tone ấm", "calUid": "", "gEventId": "",
      "cancelled": false, "cancelledFrom": "", "stageSince": "2026-11-19" },
    { "id": 102, "client": "Minh & Thu", "type": "Wedding", "stage": "Chốt cọc",
      "medium": "Film", "shootDate": "2026-12-20", "shootTime": "08:00",
      "location": "Đà Lạt", "deadline": "2027-01-03", "price": 15000000,
      "phone": "+84901234568", "email": "", "fbLink": "", "msLink": "",
      "driveLink": "", "note": "", "calUid": "abc", "gEventId": "g123",
      "cancelled": false, "cancelledFrom": "", "stageSince": "2026-11-18" },
    { "id": 103, "client": "Khách huỷ", "type": "Couple", "stage": "Đã chụp",
      "medium": "Cả hai", "shootDate": "2026-11-15", "shootTime": "",
      "location": "", "deadline": "", "price": 4000000,
      "phone": "", "email": "", "fbLink": "", "msLink": "", "driveLink": "",
      "note": "", "calUid": "", "gEventId": "",
      "cancelled": true, "cancelledFrom": "Đã chụp", "stageSince": "" }
  ],
  "txs": [
    { "id": 201, "kind": "thu", "category": "Tiền cọc", "jobId": 102,
      "amount": 6000000, "date": "2026-11-19", "method": "Chuyển khoản",
      "note": "Cọc wedding", "src": "" },
    { "id": 202, "kind": "thu", "category": "Thu theo buổi chụp", "jobId": 101,
      "amount": 2500000, "date": "2026-11-19", "method": "Tiền mặt",
      "note": "", "src": "" },
    { "id": 203, "kind": "thu", "category": "Thu khác", "jobId": "",
      "amount": 500000, "date": "2026-11-18", "method": "Chuyển khoản",
      "note": "Bán ảnh lẻ", "src": "gm:abc123" },
    { "id": 204, "kind": "chi", "category": "Thuê địa điểm", "jobId": 102,
      "amount": 800000, "date": "2026-11-19", "method": "Chuyển khoản",
      "note": "", "src": "" },
    { "id": 205, "kind": "chi", "category": "Chi cố định", "jobId": "",
      "amount": 1200000, "date": "2026-11-01", "method": "Chuyển khoản",
      "note": "Tiền nhà tháng 11", "src": "" }
  ],
  "cfg": {
    "name": "Xèo", "studio": "Sadako Photography", "instagram": "xeonong",
    "tagline": "portrait | lookbook | wedding",
    "prices": { "Portrait": 2500000, "Couple": 4000000, "Wedding": 15000000, "Lookbook": 8000000, "Event": 5000000 },
    "pricesFilm": { "Portrait": 3000000, "Couple": 5000000, "Wedding": 18000000, "Lookbook": 9000000, "Event": 6000000 },
    "extraHour": 500000, "extraLoc": 300000, "retouch": 200000, "album": 1500000,
    "depositPct": 40, "deliverDays": 14,
    "equipment": [ { "id": 900001, "name": "Sony A7IV", "price": 45000000, "years": 5 } ],
    "fixed": [ { "id": 900002, "name": "Tiền nhà", "category": "Chi cố định", "amount": 1200000 } ],
    "checkExtra": { "Wedding": ["Nhẫn cưới", "Hoa cưới"] },
    "theme": "minimal", "petals": false, "gCals": [], "gFeat": { "cal": true, "bank": false, "leads": false, "contacts": false, "drive": false, "calw": false, "send": false },
    "glass": true, "locale": "vi", "currency": "VND", "logo": "",
    "mailTpls": { "confirm": { "s": "Xác nhận lịch chụp", "b": "Chào bạn, mình xác nhận lịch chụp ngày {date} nhé." } }
  }
}
```

Đối chiếu nhanh fixture F1: 3 job (1 Tư vấn, 1 Chốt cọc, 1 đã Huỷ
từ bước "Đã chụp"); 5 khoản thu chi — **tổng thu 9.000.000đ**
(6.000.000 + 2.500.000 + 500.000), **tổng chi 2.000.000đ**
(800.000 + 1.200.000); `uid` lúc xuất (không có trong file,
chỉ có trên máy gốc) giả sử = 206; `checkDone` trên máy gốc
giả sử = `{"job:102": {"Nhẫn cưới": true}}`.

### Fixture F2 — Dữ liệu local trên máy web (đường mở trực tiếp)

Máy web của Xèo trước khi chuyển: `localStorage['troLyXeo.v1']`
= đúng nội dung F1 **cộng thêm** `sample: false`, `uid: 206`,
`checkDone: {"job:102": {"Nhẫn cưới": true}}`; IndexedDB
`troLyXeoPhotos` có 6 ảnh (1 ảnh ghim hôm nay qua
`localStorage['troLyXeo.heroPin'] = {"date": "<hôm nay>",
"id": "<id ảnh 1>"}`); `localStorage['troLyXeo.lastBackup']`
= ngày xuất file F1 (dạng `YYYY-MM-DD`, code dòng ~2226).

### Fixture F3 — File sao lưu v2 (thiết kế, chưa code)

Envelope theo `BACKUP-V2.md` §2.1, lấy F1 + thêm các trường v2:
`format: "fotobro-backup"`, `version: 2`, `app: "FotoBro"`,
`appVersion: "1.0"`, `exportedAt: "<ISO>"`,
`counts: {jobs: 3, txs: 5, photos: 2}`, `checkDone` như F2,
`uid: 206`, `photos: [{id: "p1", dataUrl: "data:image/jpeg;base64,…",
addedAt: "<ISO>"}, {id: "p2", …}]`. Dùng cho nhóm M-4 để xem
app v1 hiện tại xử lý file v2 ra sao (đọc được / đọc mất một
phần / từ chối).

---

## 1. Đường mở trực tiếp — dữ liệu web có tự sang app iOS không?

Bối cảnh bắt buộc phải test trước: app iOS v1 giữ nguyên key
`troLyXeo.v1` / `troLyXeoPhotos` (không đổi key là để không mất
dữ liệu — `MIGRATION-V1-V2.md` §1, QA-REPORT §3), nhưng **giữ
nguyên key không có nghĩa là dữ liệu tự chuyển máy**: WebView
của app native (Capacitor/WKWebView) không chia sẻ
localStorage/IndexedDB với Safari. Ghi nhớ đã lưu cũng xác nhận:
dữ liệu web cũ không tự chuyển sang app native, phải xuất JSON
rồi nhập lại. Nhóm này kiểm chứng đúng điểm đó — nếu M-1.1 ra
"không tự chuyển" thì đó là hành vi ĐÚNG (không phải lỗi app),
và đường chuyển thật của Xèo là nhóm M-2.

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-1.1 | Cài app iOS v1 trên máy đã dùng bản web, mở app, xem dữ liệu cũ có hiện không | Mồi F2 trên Safari (bản web v2.5) → cài app iOS v1 trên cùng iPhone → mở app, vào màn Hôm nay, Sổ tiền, Cài đặt | F2 (localStorage + 6 ảnh IndexedDB trên Safari) | **Dự đoán: app mở trống** (`seed()`: jobs/txs rỗng, `uid=100`, `sample=false`) — dữ liệu web không hiện. Ghi đúng thực tế quan sát được. Nếu dữ liệu tự hiện thì ghi lại cơ chế (cùng WebView? cùng profile?) vì trái với dự đoán. |
| M-1.2 | Dữ liệu nhập tay trên app iOS có ở lại sau khi tắt/mở lại không | Trên app iOS (sau M-1.1): thêm 1 job + 1 khoản thu → tắt app hẳn → mở lại | Job mới tạo tay | Job + khoản thu còn nguyên sau khi mở lại (chứng tỏ `saveLocal` ghi đúng key `troLyXeo.v1` trên WebView native, `loadLocal` đọc lại được). |
| M-1.3 | Xoá app iOS rồi cài lại thì dữ liệu local còn không | Sau M-1.2: xoá app khỏi iPhone → cài lại → mở app | Dữ liệu M-1.2 | **Dự đoán: mất hết** (xoá app native là xoá WebView storage). Ghi đúng thực tế. Đây là lý do Xèo bắt buộc phải có file sao lưu trước khi đổi máy/xoá app. |

---

## 2. Khôi phục file sao lưu JSON cũ — job / tiền / cài đặt có đủ không?

Đường chuyển thật của Xèo: xuất file trên bản web → nhập file
vào app iOS v1. Code nhập hiện tại (dòng ~2230–2244): yêu cầu
`jobs` và `txs` đều là mảng, hỏi xác nhận ("Bản sao lưu có N
buổi chụp và M khoản thu chi. Dữ liệu đang có trên máy sẽ được
thay bằng bản này."), rồi **thay thế toàn bộ** qua `cleanData` /
`mergeCfg`, đặt `sample = false`,
`uid = max(uid, cd.maxId, cfgMaxId)`, **`checkDone = {}`**
(reset), toast "Đã mở lại bản sao lưu". Không chạm tới ảnh.

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-2.1 **P0** | Khôi phục file F1 trên app iOS trống, đủ job/tiền/cài đặt | App iOS mới cài (trống) → Cài đặt → Sao lưu → Mở bản sao lưu → chọn file F1 → bấm "Thay bằng bản sao lưu" | F1 | Đủ 3 job đúng từng trường (khách, loại, bước, medium Digital/Film/Cả hai, ngày chụp, giá, link FB, `calUid`/`gEventId`); đủ 5 khoản thu chi, tổng thu 9.000.000đ / tổng chi 2.000.000đ khớp tới đồng; đủ cài đặt (giá 5 gói, giá film 5 gói, % cọc 40, trả ảnh 14 ngày, phí phát sinh, mẫu tin confirm đã sửa, theme minimal, VND). `sample = false`. Toast "Đã mở lại bản sao lưu". |
| M-2.2 **P0** | Khôi phục file F1 trên app đã có dữ liệu thì đè hay gộp | Trên app iOS đã có 1 job + 1 khoản thu khác hẳn F1 → nhập file F1 → xác nhận thay thế | F1 + dữ liệu có sẵn trên máy | Sau khôi phục: đúng 3 job / 5 khoản của F1; job + khoản thu có sẵn **không còn** (đã bị thay, không gộp). Giá cài đặt = giá trong F1, không phải giá trên máy. |
| M-2.3 | Hủy ở hộp xác nhận thì không đổi gì | Nhập file F1 → ở hộp "Mở bản sao lưu?" bấm Hủy / bấm ra ngoài | F1 + dữ liệu có sẵn | Dữ liệu trên máy giữ nguyên 100% (job, tiền, cài đặt, ảnh, `checkDone`). Không ghi đè gì, không đổi `uid`. |
| M-2.4 | File sao lưu tên cũ `tro-ly-xeo-sao-luu.json` có mở được không | Đổi tên file F1 thành `tro-ly-xeo-sao-luu.json` (nội dung giữ nguyên) → nhập | F1 đổi tên | Mở được như M-2.1 (code nhập không kiểm tra tên file, chỉ kiểm tra nội dung `jobs`/`txs` — `BACKUP-V2.md` §1 ghi tên cũ này). Ghi rõ tên file đã dùng. |
| M-2.5 | File F1 xuất từ bản web cũ hơn, `cfg` thiếu trường mới (không có `pricesFilm`) | Xoá `pricesFilm` khỏi `cfg` trong F1 → nhập | F1 thiếu `pricesFilm` | Khôi phục xong: các trường cũ giữ nguyên từ file; `pricesFilm` về mặc định 5 loại = 0 ("chưa đặt giá film", đúng `mergeCfg` + `DEFAULT_CFG`); không crash, không mất cài đặt khác. |
| M-2.6 | File chỉ có `{jobs, txs}`, không có `cfg` | Xoá `cfg` khỏi F1 → nhập | F1 không `cfg` | Nhập thành công job/tiền (code chỉ yêu cầu `jobs`/`txs` là mảng; `if (d.cfg)` mới merge). **Cài đặt trên máy giữ nguyên** (không về mặc định) — ghi đúng thực tế, vì khác với `loadLocal` (luôn `mergeCfg`, thiếu là về mặc định). |
| M-2.7 | Job Film / Cả hai + giá 0 (chưa đặt giá film) vẫn tròn | Sửa job 102 `price: 0`, `medium: "Film"`; job 103 `price: 0` → nhập | F1 sửa giá 0 | Cả hai job khôi phục đủ, `price = 0` được giữ (không đổi thành null, không tự điền giá digital); `medium` giữ "Film"/"Cả hai". Mở chi tiết job không báo lỗi giá. |
| M-2.8 | Job đã Huỷ khôi phục được và khôi phục được về bước cũ | Sau M-2.1: kiểm tra job 103 | F1 (job 103 `cancelled: true`, `cancelledFrom: "Đã chụp"`) | Job 103 hiện trạng thái Huỷ, còn nhớ "huỷ khi đang ở bước Đã chụp"; bấm khôi phục job → về đúng bước "Đã chụp" (không về "Tư vấn" nhầm). |

---

## 3. Ảnh — 60 tấm xử lý sao?

Bối cảnh: file sao lưu v1 (`{jobs, txs, cfg}`) **không chứa
ảnh** — ảnh sống riêng trong IndexedDB `troLyXeoPhotos`, tối đa
60 ảnh, mỗi ảnh là Blob JPEG đã nén bởi `shrinkPhoto()` (cạnh
dài ≤ 1400px, chất lượng 0.85), bản ghi `{id, blob, added}` với
`id` dạng `Date.now().toString(36) + '-' + i + '-' + random`.
Code nhập v1 không đọc/không chạm tới ảnh. Nhóm này xác định rõ:
chuyển máy bằng file v1 thì ảnh đi đâu, và giới hạn 60 ảnh có
giữ đúng không.

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-3.1 **P0** | Chuyển máy bằng file v1: ảnh có sang không | Máy A (web): 6 ảnh trang chủ (1 ảnh ghim hôm nay) + F2 → xuất file F1 → sang máy B (app iOS mới cài, chưa có ảnh) → nhập F1 | F1 + 6 ảnh trên máy A | Job/tiền/cài đặt đủ như M-2.1; **ảnh trang chủ trên máy B trống** (file v1 không mang ảnh) — ghi ĐẠT khi hành vi đúng như vậy. Đây là thiếu sót đã biết của v1 (`BACKUP-V2.md` §1), là lý do cần sao lưu v2. Không ghi ĐẠT giả là "đủ ảnh". |
| M-3.2 | Khôi phục file v1 không đụng tới ảnh đang có trên máy | Máy B đã có 2 ảnh riêng → nhập file F1 | F1 + 2 ảnh trên máy B | Sau khôi phục: 2 ảnh trên máy B còn nguyên (không bị xoá, không bị thay); job/tiền/cài đặt = F1. Ảnh ghim hôm nay (nếu có) vẫn ghim đúng ảnh. |
| M-3.3 | Ảnh ghim hôm nay (`heroPin`) sau khi chuyển máy | Máy A ghim ảnh 1 làm ảnh hôm nay (`troLyXeo.heroPin = {date: "<hôm nay>", id: "<id ảnh 1>"}`) → chuyển sang máy B bằng file F1 | F2 (có `heroPin`) | Trên máy B: không có ảnh ghim (key `heroPin` không nằm trong file sao lưu, không migrate — `MIGRATION-V1-V2.md` §5.2); màn Hôm nay về chế độ xoay ảnh tự động theo ngày, không hiện ảnh vỡ, không crash. |
| M-3.4 | Đủ 60 ảnh: thêm ảnh thứ 61 bị chặn, sao lưu không nới giới hạn | Trên app iOS: thêm ảnh tới đủ 60 (mỗi lần tối đa 20 ảnh) → thử thêm ảnh thứ 61 → xuất file | 60 ảnh trong `troLyXeoPhotos` | Thêm ảnh 61 bị chặn, toast "Đã đủ 60 ảnh — xoá bớt rồi thêm nha"; xuất file v1 vẫn thành công (file không chứa ảnh nên không nặng thêm); số ảnh trong IndexedDB vẫn = 60. |
| M-3.5 | Ảnh đã xoá trước khi xuất thì không quay lại khi khôi phục | Máy A: 3 ảnh → xoá 1 ảnh → xuất file F1 → nhập lại file F1 trên cùng máy A | F1 + 3 ảnh (1 đã xoá) | Ảnh đã xoá **không về lại** (file v1 không chứa ảnh, nhập cũng không chạm ảnh); 2 ảnh còn lại nguyên vẹn. Ghi đúng thực tế. |
| M-3.6 | Xoá toàn bộ dữ liệu rồi khôi phục từ file: ảnh mất theo | Máy A: `wipeAll` (xoá cả IndexedDB `troLyXeoPhotos`) → nhập file F1 | F1 + ảnh trước khi xoá | Job/tiền/cài đặt về đủ; **ảnh mất hết** (file sao lưu trong Files không bị xoá theo — app không xoá được file ngoài Files — nhưng ảnh trong file v1 thì vốn không có). Ghi rõ: file đã tải về máy vẫn còn trong Files. |

---

## 4. File v1 cũ mở được trên v1 không? File v2 (thiết kế) mở trên v1 ra sao?

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-4.1 **P0** | File v1 cũ (`{jobs, txs, cfg}`, không có `format`) mở được trên app iOS v1 | Dùng đúng file F1 do bản web v2.5 xuất → nhập trên app iOS v1 | F1 | Nhập thành công như M-2.1. Đây là ca tương thích ngược quan trọng nhất: file cũ của Xèo phải mở được, không được từ chối vì "thiếu `format`/`version`". |
| M-4.2 | File v2 thường (envelope `fotobro-backup` v2) nhập vào app v1 hiện tại | Nhập file F3 vào app iOS v1 **hiện tại** (chưa nối v2) | F3 | **Dự đoán:** app vẫn nhận (vì envelope v2 có `jobs`/`txs` ở top-level nên qua được kiểm tra mảng) và khôi phục được job/tiền/cài đặt — **nhưng lặng lẽ mất** `photos` (2 ảnh), `checkDone`, `uid` trong file (code v1 không đọc 3 trường đó; `uid` chỉ lấy `max(uid hiện tại, maxId, cfgMaxId)`). Không có cảnh báo thiếu ảnh. Ghi đúng thực tế quan sát được; nếu app từ chối file v2 thì cũng ghi rõ câu báo lỗi. **Ca này chỉ ĐẠT khi hành vi được ghi đúng, không ĐẠT giả là "đủ dữ liệu".** Sau khi v2 nối xong, chạy lại ca này theo `BACKUP-V2.md` §6: phải báo rõ trước khi khôi phục + đủ ảnh/checkDone/uid. |
| M-4.3 | File v2 mã hoá nhập vào app v1 hiện tại | Mã hoá file F3 theo `BACKUP-V2.md` §2.2 (envelope `fotobro-encrypted-backup`, `ciphertext` base64) → nhập vào app v1 hiện tại | F3 mã hoá | **Dự đoán: bị từ chối** (envelope mã hoá không có `jobs`/`txs` ở top-level) với toast "File này không giống bản sao lưu của FotoBro"; dữ liệu hiện tại còn nguyên. Sau khi v2 nối xong, chạy lại: hỏi mật khẩu, sai mật khẩu báo "Sai mật khẩu sao lưu.", đúng mật khẩu khôi phục đủ (xem `BACKUP-RESTORE-TEST.md` ca 3.8/3.9). |
| M-4.4 | File ảnh riêng (`fotobro-photos-YYYYMMDD.json`, tách > 25 MB) chọn một mình | Nhập file chỉ chứa `{format: "fotobro-photos", version: 1, photos: [...]}` vào app v1 hiện tại | File ảnh riêng mẫu (2 ảnh) | **Dự đoán: bị từ chối** (không có `jobs`/`txs`); dữ liệu còn nguyên. Sau khi v2 nối xong, kỳ vọng báo "Đây chỉ là file ảnh kèm theo, cần chọn file sao lưu chính trước." (`BACKUP-V2.md` §5.2 mục 4). |
| M-4.5 | File v2 sai `format`/`version` (v2 — chưa nối vào app) | Sửa `format` thành `"fotobro-backup-x"` (hoặc `version: 3`) trong file F3 → nhập | F3 sửa `format`/`version` | Sau khi v2 nối xong: từ chối "File này không giống bản sao lưu của FotoBro.", dữ liệu còn nguyên. Trên app v1 hiện tại, ghi đúng thực tế (vì code v1 không kiểm `format` nên có thể vẫn nhận — đó là hành vi cần ghi lại, không phải lỗi). |
| M-4.6 | File v2 có `counts` lệch số thực tế | Sửa `counts` trong F3 thành `{jobs: 99, txs: 5, photos: 2}` → nhập (sau khi v2 nối xong) | F3 sửa `counts` | Hiện cảnh báo số lượng lệch trước khi khôi phục, không im lặng khôi phục (`BACKUP-V2.md` §2.1). Trên app v1 hiện tại: ghi rõ app không kiểm `counts` (không có trường này trong code v1). |

---

## 5. Dữ liệu lỗi / thiếu trường — app xử lý thế nào?

Nguyên tắc an toàn (`BACKUP-V2.md` §6): mọi lỗi khi đọc file
đều dừng **trước khi** ghi đè; không bao giờ xoá dữ liệu hiện
tại chỉ vì đọc file lỗi. Code nhập v1 (dòng ~2230–2244): JSON
hỏng → toast "Chưa đọc được file này, bạn thử lại nha";
thiếu `jobs`/`txs` mảng → toast "File này không giống bản sao
lưu của FotoBro"; cả hai đều `return` trước khi hỏi xác nhận.
`cleanData()` làm sạch từng bản ghi: job sai kiểu → mặc định,
id trùng/thiếu → cấp lại, tx `amount ≤ 0` → **loại khỏi mảng**,
`date` sai → hôm nay, `jobId` mồ côi → `''`.

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-5.1 **P0** | File không phải JSON | Tạo file `rac.txt` (chữ linh tinh) đổi đuôi `.json` → nhập | File rác | Từ chối, toast "Chưa đọc được file này, bạn thử lại nha"; dữ liệu hiện tại còn nguyên; app không crash. |
| M-5.2 | File JSON hợp lệ nhưng không phải sao lưu | Nhập `{"hello": "world"}` | JSON lạ | Từ chối, toast "File này không giống bản sao lưu của FotoBro"; dữ liệu còn nguyên. |
| M-5.3 | JSON bị cắt dở / thiếu dấu đóng ngoặc | Lấy file F1, xoá nửa cuối file → nhập | F1 cắt dở | Từ chối như M-5.1, không crash, dữ liệu còn nguyên. |
| M-5.4 | File rỗng (0 byte) | Tạo file `.json` rỗng → nhập | File 0 byte | Từ chối, không crash, dữ liệu còn nguyên. |
| M-5.5 | Thiếu `txs` hoặc thiếu `jobs` | File chỉ có `jobs` (và ngược lại, chỉ có `txs`) | F1 thiếu 1 mảng | Từ chối (v1 yêu cầu cả hai là mảng); dữ liệu còn nguyên. |
| M-5.6 | `jobs`/`txs` không phải mảng | File `{"jobs": {}, "txs": "abc", "cfg": {}}` → nhập | Kiểu sai | Từ chối; dữ liệu còn nguyên. |
| M-5.7 | Job thiếu trường / sai kiểu thì về mặc định, không loại cả file | Job 101: xoá `client`, `type: "Cưới hỏi"` (không trong 6 loại), `stage: "Đang làm"` (không trong 8 bước), `medium: "Phim"`, `price: -500000`, `shootDate: "32/13/2026"`, `phone: "090-abc-123"`, `fbLink: "javascript:alert(1)"` → nhập | F1 sửa job 101 | File vẫn nhập được; job 101 về: `client` = "Khách chưa đặt tên", `type` = "Khác", `stage` = "Tư vấn", `medium` = "Digital", `price` = 0, `shootDate` = `""`, `phone` chỉ giữ số (`090123`), `fbLink` = `""` (bị `safeUrl` chặn); 2 job còn lại nguyên vẹn. |
| M-5.8 | Tx `amount ≤ 0` bị loại, tx ngày sai về hôm nay, tx trỏ job không tồn tại thành thu chi không gắn job | Tx 201 `amount: 0`; tx 202 `amount: -100000`; tx 203 `date: "99/99/9999"`; tx 204 `jobId: 999` (job không tồn tại) → nhập | F1 sửa txs | Tx 201 + 202 **bị loại khỏi mảng** (không còn trong sổ); tx 203 giữ lại, `date` = hôm nay; tx 204 giữ lại, `jobId` = `""` (không gắn job) nhưng tiền vẫn tính vào tổng chi; tổng thu/chi sau khôi phục phải khớp với 3 tx còn lại (thu 500.000đ, chi 2.000.000đ), không khớp với F1 gốc — ghi rõ số tiền đã loại vào ghi chú ca. |
| M-5.9 | Job trùng `id` thì cấp lại id mới — và tx trỏ job đó mất liên kết | Hai job cùng `id: 101` (job A + job B), tx 201 `jobId: 101` → nhập | F1 sửa trùng id | Cả hai job đều còn (job trùng được cấp id mới = `maxId + 1` theo `pending` trong `cleanData`); **nhưng** tx 201 có thể mất liên kết (`jobId` → `""`) vì id mới được cấp **sau** bước map tx (xem thứ tự trong `cleanData`: `pending.forEach` nằm sau map txs) — ghi đúng thực tế quan sát được, đây là ca cần xác nhận bằng chạy thật, không đoán. |
| M-5.10 | Job `id` là chuỗi / số quá lớn / âm | Job 101 `id: "101"` (chuỗi số), job 102 `id: 9999999999999` (13 chữ số), job 103 `id: -5` → nhập | F1 sửa id | `id: "101"` chuỗi số vẫn nhận (regex `^\d{1,12}$` chấp nhận chuỗi số); id 13 chữ số và id âm → coi như thiếu id, cấp lại id mới; sau khôi phục tạo job mới không trùng id cũ. |
| M-5.11 | `cfg` sai kiểu / có key lạ / số ngoài khoảng | `cfg.depositPct: 150`, `cfg.deliverDays: 999`, `cfg.theme: "hồng"`, `cfg.locale: "fr"`, `cfg.currency: "EUR"`, thêm key lạ `cfg.foo: "bar"`, `cfg.logo` = chuỗi 400.000 ký tự → nhập | F1 sửa cfg | Nhập được, không crash: `depositPct` kẹp ≤ 100, `deliverDays` kẹp ≤ 365, `theme` về `"warm"`, `locale` về `"vi"`, `currency` về `"VND"`, key lạ `foo` bị bỏ (không lọt vào cfg đã lưu), `logo` bị cắt còn 300.000 ký tự. |
| M-5.12 | `equipment`/`fixed` trùng id thì cấp lại từ 900001 | Hai thiết bị cùng `id: 900001` trong `cfg.equipment` → nhập | F1 sửa equipment | Cả hai thiết bị còn, id thứ hai được cấp lại từ dải 900001 trở lên (`cid()` trong `mergeCfg`); không mất thiết bị nào. |
| M-5.13 | File sao lưu của app khác (có `jobs`/`txs` nhưng job thiếu trường FotoBro) | Nhập file JSON có `jobs`/`txs` nhưng job chỉ có `{title, amount}` → nhập | File app khác | App không crash; `cleanData` ép mỗi job về mặc định (khách "Khách chưa đặt tên", loại "Khác", bước "Tư vấn", giá 0) hoặc từ chối cả file — ghi rõ hành vi thực tế quan sát được; job hợp lệ còn lại (nếu có) vẫn đủ. |
| M-5.14 | File v1 cũ từ thời Tro-ly-Xeo còn cờ `sample: true` | File F1 + thêm `"sample": true` ở top-level (bản web cũ có job mẫu) → nhập | F1 + `sample: true` | Nhập xong `sample = false` (code nhập đặt cứng `state.sample = false`, dòng ~2238); banner "đang có vài job mẫu" không hiện; job mẫu trong file (nếu có) vẫn nhập như job thường — ghi rõ số job mẫu đã nhập, để Việt quyết có nên lọc job mẫu khi migrate không (`MIGRATION-V1-V2.md` §5.6). |

---

## 6. `uid` / `checkDone` / khoá / Google — những gì file v1 không mang theo

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-6.1 **P0** | `uid` sau khôi phục không đi lùi, job mới không trùng id | Khôi phục F1 (`uid` lúc xuất trên máy gốc = 206, `maxId` trong file = 205) → tạo 3 job mới liên tiếp | F1 | 3 job mới có id tăng dần, đều > 205, không trùng nhau, không trùng job cũ. (Code: `uid = max(uid, cd.maxId, cfgMaxId)` — `uid` không bao giờ đi lùi.) |
| M-6.2 | Khôi phục file v1 làm mất dấu check (`checkDone` bị reset) | Trên máy iOS: đánh dấu 1 việc đã check xong (`checkDone = {"job:102": {"Nhẫn cưới": true}}`) → nhập file F1 (không có `checkDone`) | F1 + `checkDone` trên máy | **Dự đoán: việc đã check mất dấu** (code nhập đặt `checkDone = {}` cứng, dòng ~2238). Ghi ĐẠT khi hành vi đúng như vậy — đây là hành vi v1 đã biết, trái với `BACKUP-V2.md` §6.4 (file v1 cũ thì giữ `checkDone`/`uid` hiện tại). Sau khi sửa theo `MIGRATION-V1-V2.md` §8.4 (chốt giữ), chạy lại ca này: `checkDone` trên máy phải còn nguyên. |
| M-6.3 | Khôi phục file v2 (sau khi v2 nối xong) thì `checkDone`/`uid` về đủ | Nhập file F3 (có `checkDone`, `uid: 206`) sau khi v2 nối xong | F3 | Việc đã check vẫn còn dấu; tạo job mới có id > 206. (v2 — chưa nối vào app, chưa chạy được.) |
| M-6.4 | Khoá app (`troLyXeo.lock`) không nằm trong file sao lưu | Đặt khoá PIN trên app iOS → nhập file F1 | F1 + khoá PIN đang bật | Sau khôi phục: khoá vẫn bật như cũ (file không chứa khoá, nhập không chạm khoá); mở app vẫn hỏi PIN. |
| M-6.5 | Token/cache Google không nằm trong file sao lưu | Máy đã đăng nhập Google (lịch/mail đã tải) → nhập file F1 | F1 + Google đã đăng nhập | Sau khôi phục: dữ liệu Google đã tải trên máy còn hay mất thì ghi đúng thực tế; file F1 không mang token sang máy mới — máy mới phải đăng nhập Google lại (token chỉ ở sessionStorage / `troLyXeo.gtoken`, đã bị code v1 tự xoá — `MIGRATION-V1-V2.md` §5.5). |
| M-6.6 | `troLyXeo.lastBackup` sau khôi phục không đổi | Ghi lại `troLyXeo.lastBackup` trước khi nhập F1 → nhập xong kiểm tra lại | F1 | Giá trị không đổi (chỉ ghi lúc **xuất** thành công, dòng ~2226). Sau khi v2 nối xong: `fotobro.lastBackupAt` cũng không đổi khi khôi phục, và app nên nhắc xuất 1 bản mới ngay (`BACKUP-V2.md` §6.7). |

---

## 7. Đổi máy / máy mới — migration tròn một vòng

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-7.1 | Chuyển máy đầy đủ nhất có thể bằng file v1: xuất trên máy A → nhập trên máy B chưa từng cài app | Máy A (web, F2) → xuất file F1 → chép file sang máy B (iPhone khác, app iOS mới cài) → nhập | F1 + F2 | Máy B có đủ job/tiền/cài đặt như máy A (như M-2.1); **thiếu**: ảnh trang chủ (M-3.1), dấu check (M-6.2), ảnh ghim hôm nay (M-3.3); `uid` trên máy B = `max(100, 205, cfgMaxId)` nên tạo job mới không trùng id máy A. Ghi rõ danh sách "đủ / thiếu" để Việt biết trước khi giao cho Xèo chuyển máy. |
| M-7.2 | Chuyển máy bằng file v2 (sau khi v2 nối xong) thì đủ hơn | Lặp lại M-7.1 bằng file F3 sau khi v2 nối xong | F3 | Máy B đủ thêm: ảnh (đủ số ảnh, đúng `id` gốc, ảnh ghim hôm nay hiện lại nếu cùng ngày), `checkDone`, `uid: 206`. (v2 — chưa nối vào app, chưa chạy được.) |
| M-7.3 | Khôi phục nhầm file thì có đường quay lại không (v1 hiện tại) | Máy B đang có dữ liệu thật → nhập nhầm file F1 cũ hơn (dữ liệu cũ) → phát hiện nhầm | F1 cũ + dữ liệu mới trên máy B | **Dự đoán: không có đường quay lại tự động** — code v1 thay thế luôn, không tự lưu bản dự phòng trước khi ghi đè (chỉ có ở thiết kế v2, `BACKUP-V2.md` §6.4). Chỉ cứu được nếu trước đó đã xuất 1 bản sao lưu an toàn ra Files (§0 mục 2). Ghi đúng thực tế; sau khi v2 nối xong, chạy lại: app phải tự lưu bản dự phòng và báo "Đã lưu bản dự phòng" trước khi thay thế. |
| M-7.4 | Chạy migration 2 lần cùng 1 file thì không nhân đôi | Nhập file F1 → nhập lại đúng file F1 lần nữa | F1 | Sau lần 2: vẫn đúng 3 job / 5 khoản (không thành 6 job / 10 khoản); tổng tiền không đổi; id job không đổi. (Khôi phục là thay thế, không phải gộp — kiểm chứng tính idempotent.) |
| M-7.5 | Ngày tháng không lệch múi giờ sau khi chuyển máy | Job 101 `shootDate: "2026-11-22"`, tx 201 `date: "2026-11-19"` → nhập trên máy B (múi giờ +07) → kiểm tra ngày hiển thị | F1 | Ngày vẫn là 22/11 và 19/11 (không lệch sang 21/11 / 18/11 do UTC — `MIGRATION-V1-V2.md` §6.3: ngày `YYYY-MM-DD` phải hiểu theo giờ +07). |

---

## 8. Nhắc sao lưu + xuất file trên iOS (phần migration chạm tới)

Nhóm này thuộc thiết kế v2, app hiện tại chưa có — ghi lại để
chạy sau khi v2 nối xong, và để phân biệt với ca xuất v1 đang
có (xem `BACKUP-RESTORE-TEST.md` ca 1.1/1.2).

| Ca | Nội dung | Các bước | Dữ liệu mẫu | Kỳ vọng |
|----|----------|----------|-------------|---------|
| M-8.1 | Xuất file trên app iOS native tải về đâu | Trên iPhone thật: Cài đặt → Sao lưu → Tải bản sao lưu (file F1 đã nhập trước đó) | Dữ liệu M-2.1 | File `fotobro-sao-luu.json` tải về được và tìm thấy trong Files (hoặc qua Share Sheet); mở file ra đọc được JSON `{jobs, txs, cfg}`; `troLyXeo.lastBackup` = ngày hôm nay (dạng `YYYY-MM-DD`). Ghi rõ đường dẫn/cách lấy file trên iOS thật — vì `<a download>` trên WebView native có thể khác Safari. |
| M-8.2 | Chưa từng sao lưu thì nhắc luôn (v2) | App mới cài, chưa xuất lần nào → mở màn Hôm nay | — | Hiện nhắc: "Bạn chưa sao lưu lần nào, tải một bản cho chắc nhé." (v2 — chưa nối vào app.) |
| M-8.3 | Quá 7 ngày chưa sao lưu thì nhắc; chưa quá 7 ngày thì không nhắc (v2) | Đặt `fotobro.lastBackupAt` = 8 ngày trước → mở Hôm nay; rồi đặt = 3 ngày trước → mở lại | — | 8 ngày: nhắc "Bạn chưa sao lưu 8 ngày rồi…"; 3 ngày: không nhắc. Bấm "Sao lưu ngay" từ banner → vào thẳng màn xuất. (v2 — chưa nối vào app.) |
| M-8.4 | File > 25 MB tách 2 file, khôi phục thiếu file ảnh thì báo rõ (v2) | Mồi 60 ảnh sao cho sau nén file vẫn > 25 MB → xuất → chỉ nhập file JSON chính, bỏ qua file ảnh | 60 ảnh nặng | Xuất 2 file (`fotobro-backup-YYYYMMDD.json` + `fotobro-photos-YYYYMMDD.json`); khôi phục thiếu file ảnh vẫn được job/tiền/cài đặt nhưng báo rõ "Đã khôi phục job và tiền, thiếu N ảnh (chưa chọn file ảnh riêng)" — không báo thành công giả. (v2 — chưa có code phần tách ảnh, `BACKUP-V2.md` §5.2.) |

---

## 9. Checklist chạy nhanh (trước khi giao cho Xèo chuyển dữ liệu)

Chạy trên iPhone thật, ghi ĐẠT/KHÔNG ĐẠT từng dòng + ngày giờ +
máy + phiên bản app:

- [ ] M-1.1 Mở app iOS trên máy đã dùng web: dữ liệu cũ có tự hiện
      không (dự đoán: không — phải đi đường file).
- [ ] M-2.1 **P0** Nhập file F1 trên app trống: đủ 3 job / 5 khoản,
      tổng thu 9.000.000đ / tổng chi 2.000.000đ, đủ cài đặt.
- [ ] M-2.2 **P0** Nhập file F1 trên app đã có dữ liệu: thay thế
      toàn bộ, không gộp lén.
- [ ] M-2.3 Hủy xác nhận → dữ liệu còn nguyên.
- [ ] M-3.1 **P0** Chuyển máy bằng file v1: biết rõ ảnh KHÔNG sang
      theo (ghi rõ, không ĐẠT giả).
- [ ] M-3.4 Đủ 60 ảnh, ảnh 61 bị chặn.
- [ ] M-4.1 **P0** File v1 cũ mở được trên app iOS v1.
- [ ] M-4.2 File v2 nhập vào app v1 hiện tại: ghi đúng phần nào
      mất lặng lẽ (ảnh/checkDone/uid).
- [ ] M-5.1–M-5.6 File rác / JSON hỏng / thiếu mảng / rỗng → bị từ
      chối, dữ liệu còn nguyên, app không crash.
- [ ] M-5.8 Tx `amount ≤ 0` bị loại, ngày sai về hôm nay, `jobId`
      mồ côi thành không gắn job — tổng tiền đối chiếu đúng.
- [ ] M-6.1 **P0** Tạo job mới sau khôi phục không trùng id.
- [ ] M-6.2 Biết rõ nhập file v1 làm mất dấu check (`checkDone`
      về rỗng).
- [ ] M-7.1 Chuyển máy A → B: liệt kê đủ/thiếu (job/tiền/cài đặt
      đủ; ảnh/check/ghim thiếu).
- [ ] M-7.4 Nhập cùng file 2 lần không nhân đôi.
- [ ] M-8.1 Xuất file trên iPhone thật: tìm được file trong Files.
- [ ] (v2, khi nối xong) M-4.3, M-4.4, M-4.5, M-4.6, M-6.3, M-7.2,
      M-7.3, M-8.2, M-8.3, M-8.4.

## 10. Ghi chú — những gì file này KHÔNG test

- Sao lưu/khôi phục **trong** app iOS v1 (đã có
  `batch-engineering/BACKUP-RESTORE-TEST.md` — ca 1.x–6.x).
- Đồng bộ CloudKit / Nấc 2 (`CLOUDKIT-PLAN.md`, `MIGRATION-V1-V2.md`
  §7.3): migration ở đây là file local do người dùng tự cất, không
  tự đẩy lên cloud. Các field local-only không lên cloud
  (`phone`, `email`, link khách, `method`, `src` của tx) đã ghi
  trong `MIGRATION-V1-V2.md` §2.5/§3.5 — file v1 thì giữ đủ,
  cloud thì không.
- Mật khẩu khoá app, token Google, dữ liệu Google đã tải: không
  nằm trong file sao lưu (M-6.4, M-6.5).
- Khôi phục mật khẩu file mã hoá bằng Apple ID: chưa chốt
  (`BACKUP-V2.md` §7 câu 1), mặc định mất mật khẩu là mất file.
- 5 điểm lệch cần chốt trước khi code v2 (`MIGRATION-V1-V2.md`
  §8): tên field ngày tx (`txDate` hay `date`), ảnh CloudKit chỉ
  metadata hay cả file gốc, `appVersion` `"1.0"` hay `"2.6"`,
  khôi phục file v1 giữ hay xoá `checkDone`, và bước chuyển ảnh
  `blob`/`added` → `dataUrl`/`addedAt` (bắt buộc, code thật lưu
  Blob + ms epoch, không phải dataUrl + ISO).
