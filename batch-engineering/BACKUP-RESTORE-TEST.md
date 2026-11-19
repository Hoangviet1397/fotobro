# FotoBro iOS v1 — Ca test sao lưu / khôi phục

> Ngày: 20/11/2026. Trạng thái: **ca test, chưa chạy.**
> Phạm vi: chỉ sao lưu/khôi phục local trong app iOS v1.
> Nguồn căn cứ (chỉ đọc, không sửa):
> - `www/index.html` — code sao lưu v1 đang chạy (§SAO LƯU, khoảng dòng 2220–2247):
>   xuất `{jobs, txs, cfg}` → file `fotobro-sao-luu.json`, ghi
>   `localStorage['troLyXeo.lastBackup']`; nhập: yêu cầu `jobs`/`txs`
>   là mảng, hỏi xác nhận rồi **thay thế toàn bộ** (`checkDone = {}`,
>   `uid = max(uid, maxId, cfgMaxId)`), không chạm tới ảnh.
> - `BACKUP-V2.md` — thiết kế sao lưu v2 (**chưa code vào app**):
>   envelope `fotobro-backup` v2 (`jobs, txs, cfg, checkDone, uid,
>   photos`, `counts`), bản mã hoá AES-256-GCM + PBKDF2,
>   tách ảnh khi file > 25 MB, khôi phục thay thế + tự lưu bản
>   dự phòng, đọc được file v1 cũ, nhắc sao lưu sau 7 ngày
>   (`fotobro.lastBackupAt`).
> - Dữ liệu local: `localStorage['troLyXeo.v1']`
>   (`{jobs, txs, sample, uid, checkDone, cfg}`),
>   IndexedDB `troLyXeoPhotos` (store `photos`, tối đa 60 ảnh).
>
> Quy ước ghi kết quả: mỗi ca ghi `ĐẠT` / `KHÔNG ĐẠT` + ngày giờ
> chạy + phiên bản app + ghi chú. Ca nào thuộc thiết kế v2 mà app
> hiện tại chưa có thì ghi rõ **v2 — chưa nối vào app, chưa chạy
> được**, không ghi ĐẠT giả.

## 0. Chuẩn bị chung (dùng cho mọi ca)

1. Máy test: iPhone thật (app native qua Capacitor) hoặc bản web
   cùng code `www/index.html`; ghi rõ máy nào, vì nút tải file
   và chọn file trên iOS khác trình duyệt desktop.
2. Dữ liệu mồi trước mỗi ca (tạo tay trong app, không sửa code):
   - 3 job ở 3 bước pipeline khác nhau (1 job đã chốt cọc có ghi
     tiền cọc, 1 job đã giao còn thiếu tiền, 1 job đã Huỷ).
   - 5 khoản thu chi (2 thu theo job, 1 thu phát sinh, 2 chi),
     tổng thu/chi ghi lại để đối chiếu.
   - Cài đặt: đổi 1 giá gói (ví dụ Portrait), đổi 1 mẫu tin nhắn,
     đặt màu chủ đề khác mặc định, đặt tiền tệ VND.
   - Ảnh trang chủ: thêm 2 ảnh (1 ảnh ghim làm ảnh nền), ghi lại
     số ảnh trong IndexedDB `troLyXeoPhotos`.
   - Đánh dấu 1 việc đã check xong trên màn Hôm nay (`checkDone`).
   - Ghi lại `uid` hiện tại (tạo 1 job mới rồi xoá để đẩy `uid` lên,
     tránh `uid` = số job hiện có).
3. Sau mỗi ca khôi phục: kiểm tra đủ 6 nhóm — số job, số khoản
   thu chi + tổng tiền, cài đặt (giá/mẫu tin/màu/tiền tệ), ảnh
   trang chủ, trạng thái check, `uid` (tạo job mới phải có id
   không trùng job cũ).
4. Nguyên tắc an toàn: trước ca nào có nguy cơ mất dữ liệu
   (ca 2x, 3x, 4x), xuất 1 bản sao lưu an toàn ra Files trước
   rồi mới chạy ca.

## 1. Sao lưu đủ dữ liệu (xuất)

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 1.1 | Xuất đủ job + tiền + cài đặt (v1, đang có) | Mồi theo §0 → Cài đặt → Sao lưu → Tải bản sao lưu → mở file JSON đã tải | File là JSON hợp lệ, có đủ `jobs` (3), `txs` (5), `cfg` (giá Portrait đã đổi, mẫu tin đã sửa, màu, tiền tệ). Tổng tiền trong file = tổng tiền trong app. Tên file `fotobro-sao-luu.json`. |
| 1.2 | Xuất ghi dấu thời gian | Sau ca 1.1, kiểm tra `localStorage['troLyXeo.lastBackup']` | Có giá trị ngày giờ lúc xuất. Xuất thất bại giữa chừng (tắt app ngay khi đang tải) thì giá trị này không đổi. |
| 1.3 | Xuất đủ cả ảnh + checkDone + uid (v2 — chưa nối vào app) | Mồi theo §0 → xuất theo thiết kế `BACKUP-V2.md` §2.1/§3 | File có `format: "fotobro-backup"`, `version: 2`, `counts: {jobs: 3, txs: 5, photos: 2}`, `photos` đủ 2 ảnh (giữ nguyên `id` gốc), `checkDone` có việc đã check, `uid` = uid đã ghi ở §0. Tên file `fotobro-backup-YYYYMMDD.json`. **Hiện tại app v1 chưa có: file v1 thiếu photos/checkDone/uid — ghi KHÔNG ĐẠT cho tới khi v2 nối xong.** |
| 1.4 | Ảnh đã xoá không lọt vào bản sao lưu (v2) | Thêm ảnh thứ 3 rồi xoá nó trong app → xuất | File chỉ có 2 ảnh còn lại, không có ảnh đã xoá. |
| 1.5 | Xuất khi không có ảnh / sổ trống | Xoá hết ảnh (giữ job/tiền) → xuất; rồi xoá hết job/tiền → xuất | Cả hai lần đều xuất được file hợp lệ, `photos: []` / `jobs: [], txs: []`, không crash, không báo lỗi giả. |
| 1.6 | Xuất khi vượt 60 ảnh (giới hạn app) | App đã chặn thêm ảnh thứ 61 từ trước → xuất với đúng 60 ảnh | Xuất thành công, file chứa đủ 60 ảnh (sau nén, xem ca 1.7). Sao lưu không được nới giới hạn 60 ảnh. |
| 1.7 | Ảnh được nén trước khi đưa vào file (v2) | Xuất với 2 ảnh gốc nặng (chụp bằng camera, mỗi ảnh > 2 MB) | Mỗi ảnh trong file ≤ ~200 KB, cạnh dài ≤ 1600 px. File không chứa ảnh gốc chưa nén. |
| 1.8 | File > 25 MB thì tách ảnh riêng (v2 — chưa có code) | Mồi 60 ảnh sao cho sau nén file vẫn > 25 MB → xuất | Xuất 2 file cùng tiền tố ngày: `fotobro-backup-YYYYMMDD.json` (`photos: []`, `photosSplit: true`, `photosFile: "fotobro-photos-YYYYMMDD.json"`) + `fotobro-photos-YYYYMMDD.json` (chỉ ảnh). Trước khi tải hiện cảnh báo "cần giữ cả 2 file mới khôi phục đủ ảnh". **Prototype chưa có code phần này — ghi rõ chưa chạy được.** |

## 2. Khôi phục — đè hay gộp

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 2.1 | Khôi phục thay thế toàn bộ (v1, đang có) | Xuất bản A (mồi §0) → đổi dữ liệu trên máy: thêm 1 job mới, xoá 1 khoản chi, đổi giá Portrait về mặc định → nhập file A → bấm "Thay bằng bản sao lưu" | Sau khôi phục: đúng 3 job / 5 khoản thu chi / giá Portrait của bản A; job mới thêm và khoản chi đã xoá **không còn** (đã bị thay, không gộp). Toast "Đã mở lại bản sao lưu". |
| 2.2 | Hủy ở bước xác nhận thì không đổi gì | Nhập file A → ở hộp xác nhận bấm Hủy / bấm ra ngoài | Dữ liệu trên máy giữ nguyên 100% (job, tiền, cài đặt, ảnh). Không ghi đè gì. |
| 2.3 | Xem trước trước khi khôi phục (v2) | Nhập file v2 → đọc màn xem trước | Hiện đúng: số job, số khoản thu chi, số ảnh, ngày xuất (`exportedAt`), phiên bản app lúc xuất. Số liệu sai lệch `counts` trong file thì có cảnh báo, không im lặng khôi phục. |
| 2.4 | Tự lưu bản dự phòng trước khi thay thế (v2 — chưa nối vào app) | Đổi dữ liệu trên máy sau khi xuất bản A → nhập bản A | Trước khi ghi đè, app tự lưu 1 bản dự phòng của dữ liệu hiện tại (không cần người dùng bấm gì), và báo rõ "Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại. Đã lưu bản dự phòng." Khôi phục nhầm vẫn có đường quay lại. |
| 2.5 | Không có chế độ gộp (theo quyết định hiện tại) | — | App chỉ có "thay thế toàn bộ", không có nút gộp. Nếu Việt sau này chốt cho gộp (`BACKUP-V2.md` §7 câu 3) thì thêm ca riêng: gộp 2 bản phải không trùng id job/tx, không sai tổng tiền. |
| 2.6 | `uid` sau khôi phục không trùng id cũ (v1, đang có) | Khôi phục bản A (uid lúc xuất = U) → tạo job mới | Job mới có id > mọi id job trong bản A (app v1 đặt `uid = max(uid, maxId, cfgMaxId)`). Tạo 3 job liên tiếp, id tăng dần, không trùng nhau. |
| 2.7 | `checkDone` sau khôi phục (v1 vs v2) | Khôi phục bản A v1 | v1: `checkDone` bị reset về rỗng (code hiện tại `checkDone = {}`) — ghi nhận là hành vi v1, việc đã check mất dấu. v2: `checkDone` trong file được khôi phục nguyên — kiểm tra việc đã check vẫn còn dấu. |

## 3. File hỏng / file lạ

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 3.1 | File không phải JSON | Tạo file `rac.txt` (chữ linh tinh) đổi đuôi `.json` → nhập | Từ chối, toast "File này không giống bản sao lưu của FotoBro" (v1) hoặc "Chưa đọc được file này, bạn thử lại nha". Dữ liệu hiện tại còn nguyên. |
| 3.2 | File JSON hợp lệ nhưng không phải sao lưu | Nhập file JSON `{"hello": "world"}` | Từ chối như ca 3.1 (thiếu `jobs`/`txs` mảng). Dữ liệu còn nguyên. |
| 3.3 | JSON bị cắt dở / thiếu dấu đóng ngoặc | Lấy file sao lưu thật, xoá nửa cuối file → nhập | Từ chối, không crash app, dữ liệu còn nguyên. |
| 3.4 | Thiếu `txs` hoặc thiếu `jobs` | File chỉ có `jobs`, không có `txs` (và ngược lại) | Từ chối (v1 yêu cầu cả hai là mảng). Dữ liệu còn nguyên. |
| 3.5 | `jobs`/`txs` không phải mảng | File `{"jobs": {}, "txs": "abc", "cfg": {}}` → nhập | Từ chối. Dữ liệu còn nguyên. |
| 3.6 | File rỗng (0 byte) | Tạo file `.json` rỗng → nhập | Từ chối, không crash, dữ liệu còn nguyên. |
| 3.7 | File v2 sai `format`/`version` (v2) | Sửa `format` thành `"fotobro-backup-x"` (hoặc `version: 3`) trong file v2 → nhập | Từ chối: "File này không giống bản sao lưu của FotoBro." Dữ liệu còn nguyên. |
| 3.8 | File mã hoá nhập sai mật khẩu (v2 — chưa nối vào app) | Xuất bản mã hoá → nhập → nhập sai mật khẩu | Báo đúng một câu "Sai mật khẩu sao lưu." Dừng, không ghi đè dữ liệu. Nhập sai 5 lần liên tiếp → khoá 60 giây mới cho thử tiếp. |
| 3.9 | File mã hoá nhập đúng mật khẩu (v2) | Xuất bản mã hoá → nhập → nhập đúng mật khẩu | Khôi phục đủ như ca 2.1 + đủ ảnh (ca 1.3). |
| 3.10 | Mật khẩu mã hoá dưới 8 ký tự (v2) | Bật mã hoá, đặt mật khẩu 5 ký tự | Không cho bật, báo rõ lý do (tối thiểu 8 ký tự). |
| 3.11 | File tách ảnh đứng một mình (v2) | Chỉ chọn `fotobro-photos-YYYYMMDD.json` để khôi phục | Báo "Đây chỉ là file ảnh kèm theo, cần chọn file sao lưu chính trước." Không khôi phục gì. |
| 3.12 | File sao lưu của app khác / tên giống | Nhập 1 file JSON có `jobs`/`txs` nhưng cấu trúc job khác hẳn (thiếu trường bắt buộc của FotoBro) | App không crash; `cleanData` loại bỏ job hỏng hoặc từ chối cả file — ghi rõ hành vi thực tế quan sát được, job hợp lệ còn lại vẫn đủ. |

## 4. File cũ v1

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 4.1 | File v1 cũ đọc được (đang có) | Dùng đúng file `fotobro-sao-luu.json` do app v1 xuất (`{jobs, txs, cfg}`, không có `format`) → nhập | Nhập thành công, đủ job/tiền/cài đặt như ca 2.1. |
| 4.2 | File v1 cũ báo rõ thiếu ảnh (v2) | Nhập file v1 vào app đã có v2 | Trước khi khôi phục báo rõ: "Đây là bản sao lưu cũ, không có ảnh. Khôi phục xong ảnh trang chủ vẫn trống." |
| 4.3 | File v1 cũ giữ `uid`/`checkDone` hiện tại (v2) | Mồi `uid` cao + 1 việc đã check → nhập file v1 (không có `uid`/`checkDone`) | Sau khôi phục: `uid` và `checkDone` trên máy được giữ nguyên, không bị ghi đè bằng 0/rỗng. Tạo job mới không trùng id. |
| 4.4 | File v1 từ thời Tro-ly-Xeo (tên file cũ) | File `tro-ly-xeo-sao-luu.json` cũ (nếu còn) → nhập | Đọc được như ca 4.1 (cùng cấu trúc `{jobs, txs, cfg}`). Ghi rõ file này từ bản nào nếu biết. |
| 4.5 | File v1 có `cfg` thiếu trường mới | File v1 xuất từ bản app cũ, `cfg` thiếu 1 trường mà app hiện tại đã có (ví dụ giá film) | Khôi phục xong: trường cũ giữ nguyên từ file, trường mới thiếu thì dùng mặc định của app (`mergeCfg`), không crash, không mất cài đặt hiện tại của trường đó một cách im lặng. |

## 5. Mất ảnh / ảnh khôi phục sai

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 5.1 | Khôi phục v1 làm mất ảnh trang chủ (hành vi v1 hiện tại) | Mồi 2 ảnh → xuất bản v1 → xoá 1 ảnh trong app → nhập bản v1 | Ghi nhận đúng thực tế: file v1 không chứa ảnh nên ảnh đã xoá **không về lại**; ảnh còn lại trong app không bị đụng tới. Đây là thiếu sót đã biết của v1 (xem `BACKUP-V2.md` §1) — ca này ĐẠT khi hành vi đúng như mô tả, và là lý do cần v2. |
| 5.2 | Khôi phục v2 đủ ảnh, giữ nguyên id (v2 — chưa nối vào app) | Mồi 2 ảnh (1 ảnh ghim) → xuất v2 → xoá hết ảnh trong app → nhập file v2 | Sau khôi phục: đủ 2 ảnh, đúng `id` gốc, ảnh ghim vẫn là ảnh nền trang chủ. Mở màn Hôm nay thấy ảnh hiện ngay, không ảnh vỡ. |
| 5.3 | Khôi phục thiếu file ảnh riêng (v2, tách > 25 MB) | Xuất bản tách 2 file → chỉ nhập file JSON chính, bấm bỏ qua khi app hỏi file ảnh | Khôi phục được job/tiền/cài đặt; báo rõ "Đã khôi phục job và tiền, thiếu 6 ảnh (chưa chọn file ảnh riêng)" — không báo thành công giả. Sau đó nhập tiếp file ảnh → đủ ảnh. |
| 5.4 | Ảnh trong file trùng id với ảnh đang có | Mồi ảnh A → xuất → đổi ảnh A trong app (xoá rồi thêm lại ảnh khác, trùng `id` cũ nếu có thể) → nhập file | Ảnh trong file ghi đè ảnh cùng `id` trong IndexedDB (theo `BACKUP-V2.md` §6 mục 5); không sinh 2 bản trùng `id`, không vượt 60 ảnh. |
| 5.5 | File v2 ghi 6 ảnh nhưng chỉ khôi phục được 4 | Giả lập: sửa file v2, làm hỏng `dataUrl` của 2 ảnh (cắt chuỗi base64) → nhập | App báo rõ số ảnh thiếu/khôi phục lỗi (ví dụ "Đã khôi phục 4/6 ảnh"), không im lặng, không crash; job/tiền vẫn khôi phục đủ. |
| 5.6 | Xoá toàn bộ dữ liệu rồi khôi phục từ file | Cài đặt → Xoá toàn bộ dữ liệu (xoá cả IndexedDB `troLyXeoPhotos`) → nhập file v2 | Khôi phục đủ job/tiền/cài đặt/ảnh như ca 5.2. Lưu ý: file sao lưu đã tải về máy không bị xoá theo (app không xoá được file ngoài Files). |
| 5.7 | Khôi phục trên máy mới (đổi máy) | Xuất file trên máy A → chép file sang máy B chưa từng cài app → nhập trên máy B | Máy B có đủ job/tiền/cài đặt/ảnh như máy A (v2); với file v1 thì đủ job/tiền/cài đặt, ảnh trống (ca 5.1). Kiểm tra cả `uid` (tạo job mới trên máy B không trùng id máy A). |

## 6. Nhắc sao lưu 7 ngày (v2 — chưa nối vào app)

| Ca | Nội dung | Các bước | Kỳ vọng |
|----|----------|----------|---------|
| 6.1 | Chưa từng sao lưu thì nhắc luôn | Xoá `fotobro.lastBackupAt` (app mới cài) → mở màn Hôm nay | Hiện banner/dòng nhắc: "Bạn chưa sao lưu lần nào, tải một bản cho chắc nhé." |
| 6.2 | Quá 7 ngày chưa sao lưu thì nhắc | Đặt `fotobro.lastBackupAt` = 8 ngày trước → mở màn Hôm nay | Nhắc: "Bạn chưa sao lưu 8 ngày rồi, tải một bản cho chắc nhé." |
| 6.3 | Chưa quá 7 ngày thì không nhắc | Đặt `fotobro.lastBackupAt` = 3 ngày trước → mở màn Hôm nay | Không hiện banner nhắc sao lưu. |
| 6.4 | Bấm "Sao lưu ngay" từ banner | Từ banner ở ca 6.2 → bấm "Sao lưu ngay" | Vào thẳng màn xuất sao lưu (§3 `BACKUP-V2.md`). |
| 6.5 | Đóng banner không tắt vĩnh viễn | Đóng banner → mở lại app hôm sau (vẫn quá 7 ngày) | Banner hiện lại (không có nút tắt vĩnh viễn trong v1). |
| 6.6 | Khôi phục xong không tính là đã sao lưu | Nhập 1 file sao lưu thành công → kiểm tra `fotobro.lastBackupAt` | Giá trị không đổi (chỉ ghi lúc **xuất** thành công). App nên nhắc người dùng xuất 1 bản mới ngay sau khi khôi phục. |

## 7. Checklist chạy nhanh (trước mỗi lần giao bản)

Chạy trên app thật, ghi ĐẠT/KHÔNG ĐẠT từng dòng:

- [ ] 1.1 Xuất đủ job/tiền/cài đặt, file mở được, tổng tiền khớp.
- [ ] 2.1 Khôi phục thay thế toàn bộ, dữ liệu mới thêm sau khi xuất
      không còn (không gộp lén).
- [ ] 2.2 Hủy xác nhận → dữ liệu còn nguyên.
- [ ] 3.1–3.3 File rác / JSON hỏng / JSON cắt dở → bị từ chối,
      dữ liệu còn nguyên, app không crash.
- [ ] 4.1 File v1 cũ đọc được.
- [ ] 5.1 Ảnh: biết rõ file v1 không mang ảnh theo (v2: 5.2 đủ ảnh).
- [ ] 2.6 Tạo job mới sau khôi phục không trùng id.
- [ ] (v2, khi nối xong) 1.3, 2.4, 3.8, 3.9, 5.3, 6.1–6.3.

## 8. Ghi chú — những gì file này KHÔNG test

- Đồng bộ CloudKit / Nấc 2 (`CLOUDKIT-PLAN.md`): sao lưu ở đây
  là file local do người dùng tự cất, không tự đẩy lên cloud.
- Google Drive / Gmail / Lịch: sao lưu không bao gồm token Google
  hay dữ liệu Google đã tải (`WIPE_KEYS` trong app liệt kê riêng).
- Mật khẩu khoá app (`troLyXeo.lock`): không nằm trong file sao lưu.
- Khôi phục mật khẩu sao lưu mã hoá bằng Apple ID: chưa chốt
  (`BACKUP-V2.md` §7 câu 1), mặc định mất mật khẩu là mất file.
