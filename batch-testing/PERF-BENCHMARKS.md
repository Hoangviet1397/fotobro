# FotoBro iOS v1 — Chỉ tiêu hiệu năng (PERF-BENCHMARKS)

- Phạm vi: bản trong `~/workspace/fotobro-ios-v1/`, app iOS v1 (Capacitor 8, Bundle ID `com.fotobro.app`).
- Nguồn số liệu gốc: `PERFORMANCE.md` (rà soát 20/11/2026, chỉ đọc code, chưa đo trên iPhone thật).
- Trạng thái: **chưa có số đo thật nào** — mọi ngưỡng dưới đây là **chỉ tiêu đề xuất**, chưa phải kết quả đo. Chỉ khi nào điền số vào bảng kết quả (mục 8) bằng cách đo ở mục 7 thì số đó mới thành số đo thật.

## 0. Quy ước ghi số — đọc trước khi dùng bảng này

| Nhãn | Ý nghĩa |
|---|---|
| 🟢 ĐÃ ĐO | Số đo được từ file/code thật trên máy (kích thước file, hằng số trong code) — có nguồn trích dẫn cụ thể. |
| 🟡 ƯỚC TÍNH | Ước tính từ kích thước file + đọc code trong `PERFORMANCE.md` — chưa đo, không dùng làm kết luận đạt/không đạt. |
| 🔵 ĐỀ XUẤT | Ngưỡng đạt/không đạt do file này đặt ra, chờ đo thật để kiểm chứng. Nếu số đo thật vượt ngưỡng, ngưỡng không tự đổi — ghi lỗi và quyết định sửa app hay sửa ngưỡng (xem mục 9). |

### Số liệu ĐÃ ĐO (🟢) — lấy từ `PERFORMANCE.md` + kiểm tra lại file ngày 20/11/2026

| Hạng mục | Số đo | Nguồn |
|---|---|---|
| `www/index.html` | 337.803 byte (~330 KB), 3.860 dòng, 13 thẻ `<script>` inline | `PERFORMANCE.md` §1 (file sửa lần cuối 17:13 UTC 19/11) |
| `www/index.html` lúc viết file này | 341.754 byte (~334 KB) — tăng ~4 KB so với lúc rà soát | `ls -l` ngày 20/11/2026 (file đổi sau lần rà soát, xem mục 9) |
| Toàn bộ `www/` | ~492 KB (gồm icon PNG 15–44 KB, `test-fotobro-v1.js` 16 KB) | `PERFORMANCE.md` §1; kiểm tra lại `du` 20/11: 496 KB |
| `www/fotobro-config.js` / `www/capacitor-bridge.js` | 1.554 byte / 9.115 byte | `PERFORMANCE.md` §1 |
| Ảnh trang chủ tối đa | `MAX_PHOTOS = 60` | `PERFORMANCE.md` §3; đã kiểm tra lại trong `www/index.html` |
| localStorage key `troLyXeo.v1` | 1 JSON duy nhất `{jobs, txs, sample, uid, checkDone, cfg}`; giới hạn thực tế WebKit/WKWebView ~5 MB (không phải giới hạn cứng theo spec; vượt là `setItem` throw) | `PERFORMANCE.md` §3 |
| Ảnh sau thu nhỏ | Cạnh dài nhất tối đa 1400 px (`shrinkPhoto`, `createImageBitmap` + canvas → `toBlob`) | `PERFORMANCE.md` §3 |

### Số liệu ƯỚC TÍNH (🟡) — trong `PERFORMANCE.md`, CHƯA đo, không phải kết quả

| Hạng mục | Ước tính | Ghi chú |
|---|---|---|
| Mở app, iPhone đời mới | 0,3–0,8 giây tới khi thấy màn Hôm nay | Ước tính từ 330 KB file + 13 script inline |
| Mở app, máy cũ (iPhone SE 2 / iPhone 8) | ~1–1,5 giây | Ước tính, chưa đo |
| 60 ảnh trong IndexedDB | ≈ 10–30 MB (mỗi ảnh sau thu nhỏ vài trăm KB) | Ước tính từ "ảnh gốc 12 MP ~3–5 MB → còn vài trăm KB" |
| Dữ liệu lớn (vài trăm job + vài nghìn khoản thu chi) | `saveLocal()` + `renderAll()` toàn bộ mỗi lần thay đổi sẽ nặng dần | Nhận định định tính, chưa có số ms |

> **Không bịa số đo:** file này không chứa bất kỳ con số thời gian/bộ nhớ "đã đo trên iPhone" nào, vì chưa có bản TestFlight để đo. Mọi con số giây/MB ở mục 1–6 đều là 🔵 ĐỀ XUẤT.

## 1. B1 — Thời gian mở app, máy mới (cold start + warm start)

- Định nghĩa: **cold start** = vuốt app khỏi đa nhiệm, chờ 10 giây, mở lại; đo từ lúc chạm icon tới khi màn **Hôm nay** hiện đủ (ảnh hero + job hôm nay + số tiền) và chạm được vào tab. **Warm start** = app đang ở nền, mở lại từ đa nhiệm; đo tương tự. **Time-to-interactive (TTI)** = lúc chạm tab đầu tiên có phản hồi (không cần đợi ảnh hero tải xong).
- Điều kiện đo: sổ có 10 job + 20 khoản thu chi + 5 ảnh (mức dùng thật nhẹ, xem mục 7.2); mạng bật (Wi-Fi), Google chưa đăng nhập hoặc đã đăng nhập đều ghi rõ.

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B1.1 Cold start tới màn Hôm nay | ≤ 1,0 giây | > 2,0 giây | Quay màn hình 60 fps + bấm giờ; lấy mốc chạm icon → khung hình đầu tiên thấy đủ nội dung Hôm nay |
| B1.2 Cold start tới TTI | ≤ 1,0 giây | > 2,0 giây | Chạm ngay vào tab Buổi chụp khi màn Hôm nay vừa hiện; ghi lúc tab phản hồi |
| B1.3 Warm start tới màn Hôm nay | ≤ 0,5 giây | > 1,0 giây | Như B1.1 nhưng app đang ở nền |
| B1.4 Không màn trắng / không đứng hình | Không có màn trắng > 0,5 giây, không đứng > 1 giây | Màn trắng > 1 giây hoặc đứng > 2 giây | Quan sát trực tiếp + quay màn hình |

- Căn cứ đề xuất: 🟡 ước tính 0,3–0,8 giây trên máy mới → ngưỡng đạt 1,0 giây chừa biên độ cho máy thật + ảnh hero; ngưỡng không đạt 2,0 giây là mức người dùng bắt đầu thấy "chậm" và là mức `PERFORMANCE.md` §5.7 lấy làm mốc xem xét tách file/lazy-load.
- Máy mới = iPhone 13 trở lên (iOS 17+). Ghi rõ model + iOS khi đo.

## 2. B2 — Thời gian mở app, máy cũ (cold start + warm start)

- Máy cũ = iPhone SE 2 / iPhone 8 / iPhone X trở xuống (máy yếu nhất còn chạy được iOS của v1). Nếu không có máy cũ thật thì ghi "không đo được B2" — không lấy số máy mới suy ra máy cũ.

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B2.1 Cold start tới màn Hôm nay | ≤ 2,0 giây | > 2,0 giây | Như B1.1 |
| B2.2 Cold start tới TTI | ≤ 2,0 giây | > 3,0 giây | Như B1.2 |
| B2.3 Warm start tới màn Hôm nay | ≤ 1,0 giây | > 2,0 giây | Như B1.3 |
| B2.4 Không màn trắng / không đứng hình | Không có màn trắng > 1 giây, không đứng > 2 giây | Màn trắng > 2 giây hoặc đứng > 3 giây | Quan sát trực tiếp + quay màn hình |

- Căn cứ đề xuất: 🟡 ước tính ~1–1,5 giây trên máy cũ → ngưỡng đạt 2,0 giây; `PERFORMANCE.md` §5.7 viết rõ "Nếu mở app trên iPhone SE 2 > 2 giây thì mới tính tới tách file hay lazy-load script" — vượt 2 giây là tín hiệu phải sửa app, không phải sửa ngưỡng.

## 3. B3 — Bộ nhớ dùng (RAM lúc chạy)

- Định nghĩa: bộ nhớ thực tế app chiếm lúc chạy (footprint), đo bằng Xcode Instruments khi cắm iPhone vào Mac, hoặc số liệu Memory trong App Store Connect → Xcode Organizer Metrics (nếu có). **Không** đo bằng cảm giác "máy nóng/chậm".
- Điều kiện đo: đo 3 trạng thái trên cùng 1 máy, cùng 1 bản build: (a) sổ trống, 0 ảnh; (b) 10 job + 20 khoản + 5 ảnh; (c) 500 job + 2.000 khoản + 60 ảnh (xem B4/B5).

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B3.1 Peak memory, sổ trống (a) | ≤ 150 MB | > 250 MB | Instruments → Allocations → peak "All Heap & Anonymous VM", hoặc Organizer Metrics |
| B3.2 Peak memory, mức dùng thật (b) | ≤ 180 MB | > 250 MB | Như trên |
| B3.3 Peak memory, tải nặng (c) | ≤ 250 MB | > 350 MB | Như trên; đo cả lúc mở app và lúc cuộn danh sách 500 job |
| B3.4 Tăng thêm do 60 ảnh (c − a) | ≤ 60 MB | > 100 MB | Lấy hiệu peak (c) − peak (a); so với 🟡 ước tính 60 ảnh ≈ 10–30 MB trong IndexedDB (lưu trữ đĩa, không phải RAM — RAM tăng thêm chủ yếu do `loadMyShots()` tạo 60 object URL lúc mở app, xem `PERFORMANCE.md` §2/§5.1) |
| B3.5 Không bị iOS kill (jetsam) | Không crash/kill trong 10 phút dùng liên tục ở trạng thái (c) | Bị kill 1 lần trở lên | Dùng app 10 phút ở trạng thái (c): mở job, cuộn, ghi tiền, đổi bước; ghi lại crash/kill |

- Căn cứ đề xuất: app webview nhẹ (www ~492 KB 🟢) nên baseline RAM kỳ vọng thấp; ngưỡng 150–250 MB chừa chỗ cho WKWebView + 60 object URL; 350 MB là vùng iOS trên máy cũ bắt đầu kill app nền/aggressive. Các ngưỡng này là 🔵 đề xuất — nếu Instruments cho số khác hẳn, ghi số thật vào mục 8 rồi mới bàn sửa ngưỡng hay sửa app.
- Nếu không có Mac để chạy Instruments: ghi "B3 đo bằng Organizer Metrics / chưa đo được" và vẫn đo B3.5 (kill/crash) bằng dùng thật 10 phút — không ước lượng RAM bằng mắt.

## 4. B4 — Thời gian render khi 500 job + 2.000 khoản thu chi

- Bối cảnh: `renderAll()` render lại cả 5 màn + `saveLocal()` ghi toàn bộ JSON mỗi lần thay đổi (`PERFORMANCE.md` §5.2) — đây là nút thắt phình theo dữ liệu. Stress test này kiểm chứng đúng nút thắt đó.
- Chuẩn bị dữ liệu: tạo bằng script (không nhập tay) — 500 job rải đều 8 bước pipeline + 2.000 khoản thu/chi gắn job; khôi phục bằng bản sao lưu sau khi đo xong (xem mục 7.2). Ghi rõ script/cách tạo vào bảng kết quả.

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B4.1 Cold start với 500 job (máy mới) | ≤ 2,0 giây tới màn Hôm nay | > 3,0 giây | Như B1.1, sổ 500 job |
| B4.2 Cold start với 500 job (máy cũ) | ≤ 3,0 giây | > 5,0 giây | Như B1.1, sổ 500 job |
| B4.3 Chuyển tab Hôm nay → Buổi chụp (500 job) | ≤ 1,0 giây (máy mới) / ≤ 2,0 giây (máy cũ) | > 2,0 giây / > 3,0 giây | Quay màn hình 60 fps; mốc chạm tab → danh sách job hiện đủ |
| B4.4 Cuộn danh sách 500 job | Mượt, không giật thấy rõ, không đứng | Giật/đứng > 1 giây hoặc đứng app | Cuộn nhanh từ đầu tới cuối danh sách 2 lượt; ghi số lần khựng thấy được |
| B4.5 Lưu 1 thay đổi (sửa 1 job / ghi 1 khoản thu) | ≤ 0,5 giây từ lúc bấm Lưu tới khi màn hình cập nhật xong | > 1,0 giây hoặc màn hình đứng > 1 giây | Bấm giờ từ lúc bấm Lưu → nội dung mới hiện; lặp 3 lần lấy trung vị |
| B4.6 Kích thước JSON `troLyXeo.v1` ở 500 job + 2.000 khoản | < 4 MB (cảnh báo ở 4 MB) | ≥ 5 MB (`setItem` có thể throw → mất bản ghi) | Tải bản sao lưu `fotobro-sao-luu.json` về máy, xem kích thước file; đối chiếu 🟢 giới hạn ~5 MB trong `PERFORMANCE.md` §3/§5.5 |

- Căn cứ đề xuất: chưa có 🟡 ước tính nào cho 500 job (chỉ có nhận định "càng nhiều càng nặng") nên toàn bộ ngưỡng B4 là 🔵 đề xuất, lấy theo cảm nhận dùng được (tab < 1 giây, lưu < 0,5 giây). Nếu đo thật vượt ngưỡng, đó là bằng chứng để làm `PERFORMANCE.md` §5.2 (debounce `saveLocal()` 300 ms, chỉ render màn đang mở) — không tự nới ngưỡng cho qua.

## 5. B5 — Thời gian render khi 60 ảnh trang chủ

- Bối cảnh: `loadMyShots()` là async, không chặn màn chính, nhưng tạo `URL.createObjectURL()` cho **cả 60 ảnh** ngay lúc mở app dù màn Hôm nay chỉ hiện 1 ảnh hero (`PERFORMANCE.md` §2/§5.1) — đây là nút thắt thứ hai.
- Chuẩn bị: thêm đủ 60 ảnh từ máy (ảnh chụp thật, đã qua `shrinkPhoto` cạnh dài nhất 1400 px 🟢). Ghi rõ tổng dung lượng IndexedDB nếu xem được (Cài đặt → dung lượng, nếu app có hiện — nếu chưa có thì ghi "chưa xem được").

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B5.1 Cold start với 60 ảnh (máy mới) | ≤ 1,5 giây tới màn Hôm nay | > 2,5 giây | Như B1.1, sổ 60 ảnh |
| B5.2 Cold start với 60 ảnh (máy cũ) | ≤ 2,5 giây | > 4,0 giây | Như B1.1, sổ 60 ảnh |
| B5.3 Màn Hôm nay hiện ảnh hero | Ảnh hero hiện trong ≤ 1 giây sau khi màn Hôm nay hiện (máy mới) | Ảnh hero trống/mờ > 2 giây | Quay màn hình; mốc màn Hôm nay hiện → ảnh hero rõ nét |
| B5.4 Mở lưới/thư viện ảnh (nếu có màn xem đủ 60 ảnh) | ≤ 1,0 giây (máy mới) / ≤ 2,0 giây (máy cũ) | > 2,0 giây / > 3,0 giây | Bấm giờ từ lúc chạm → đủ thumbnail hiện |
| B5.5 Dung lượng 60 ảnh trong IndexedDB | ≤ 30 MB | > 50 MB | So với 🟡 ước tính 10–30 MB; đo bằng dung lượng app trong Cài đặt iPhone → Dung lượng iPhone → FotoBro (trừ đi dung lượng lúc 0 ảnh) hoặc dung lượng file sao lưu ảnh nếu xem được |
| B5.6 Xoá 1 ảnh / đổi ảnh hero | ≤ 0,5 giây phản hồi, ảnh cũ không còn hiện | > 1,0 giây hoặc ảnh đã xoá vẫn hiện (object URL chưa revoke) | Bấm giờ + quan sát; đối chiếu `PERFORMANCE.md` §5.1 (`revokeObjectURL` khi ảnh bị xoá) |

- Căn cứ đề xuất: B5.1/B5.2 nới hơn B1/B2 đúng bằng chi phí tạo 60 object URL lúc mở app; B5.5 lấy đúng 🟡 ước tính 10–30 MB làm ngưỡng đạt, > 50 MB là vượt xa ước tính → xem lại `shrinkPhoto`/nén (mục 5.4 `PERFORMANCE.md`).

## 6. B6 — Khi mất mạng (offline)

- Bối cảnh: app local-first — lõi (job, tiền, nhắc, ảnh đã lưu) chạy hoàn toàn offline; chỉ Google/CloudKit/link ngoài cần mạng (`PERFORMANCE.md` §4). Mất mạng không được làm chậm hay crash luồng chính.
- Cách bật mất mạng: bật **Chế độ máy bay** trên iPhone (ghi rõ trong bảng kết quả). Test 2 thời điểm: (a) mở app khi đang mất mạng; (b) đang dùng thì bật chế độ máy bay giữa chừng.

| Chỉ tiêu | Ngưỡng ĐẠT (🔵 đề xuất) | Ngưỡng KHÔNG ĐẠT | Cách đo trên TestFlight |
|---|---|---|---|
| B6.1 Cold start khi mất mạng (máy mới) | ≤ 1,5 giây (chậm hơn lúc có mạng ≤ 0,5 giây) | > 2,5 giây hoặc chậm hơn lúc có mạng > 1 giây | Như B1.1, bật chế độ máy bay trước khi mở app; so với B1.1 cùng máy |
| B6.2 Cold start khi mất mạng (máy cũ) | ≤ 2,5 giây (chậm hơn lúc có mạng ≤ 0,5 giây) | > 3,5 giây | Như trên, máy cũ |
| B6.3 Dùng lõi offline: mở job, ghi tiền, đổi bước, sửa giá | Làm được bình thường, phản hồi ≤ 1 giây mỗi thao tác | Thao tác nào đứng > 2 giây, báo lỗi mạng, hoặc không lưu được | Làm lần lượt 4 thao tác ở chế độ máy bay; bấm giờ từng thao tác |
| B6.4 Mục Google (Lịch/Gmail) khi mất mạng | Hiện rõ "Đang mất mạng — đang xem lịch đã lưu lần trước" (đúng chữ app hiện) trong ≤ 2 giây, không màn trắng, không spinner quay mãi | Spinner > 3 giây, màn trắng, crash, hoặc không báo gì mà hiện dữ liệu cũ như dữ liệu mới | Mở tab Buổi chụp → Lịch ở chế độ máy bay; bấm giờ + ghi đúng chữ app hiện |
| B6.5 Mất mạng giữa chừng | App không crash, không mất dữ liệu vừa nhập, thao tác đang làm xong bình thường | Crash, mất dữ liệu, hoặc phải mở lại app | Nhập 1 job dở dang → bật chế độ máy bay → bấm Lưu → kiểm tra job còn nguyên |
| B6.6 Nhắc lịch local khi mất mạng | Nhắc đã đặt vẫn phát đúng giờ (iOS phát cả khi app đóng) | Nhắc không phát | Đặt nhắc 1 job test trước 10 phút, bật chế độ máy bay, chờ tới giờ nhắc (ghi rõ có/không phát) |
| B6.7 Có mạng lại | Google đồng bộ lại được, không cần mở lại app | Phải mở lại app mới đồng bộ lại, hoặc kẹt ở trạng thái mất mạng | Tắt chế độ máy bay → mở tab Lịch → ghi sau bao lâu thì dữ liệu Google mới hiện |

- Căn cứ đề xuất: ngưỡng B6.1/B6.2 = B1/B2 + 0,5 giây dung sai (mở app không chờ mạng 🟢 vì file local trong gói, nên mất mạng gần như không được làm chậm mở app); B6.4 đối chiếu đúng hành vi `gState.error` trong `PERFORMANCE.md` §4.

## 7. Cách đo trên TestFlight (áp dụng chung cho B1–B6)

### 7.1 Thiết bị + bản build (ghi vào mọi bảng kết quả)

- iPhone test: model + iOS (vd: iPhone 13, iOS 18.x; iPhone SE 2, iOS 17.x) — ghi rõ máy nào là "máy mới", máy nào là "máy cũ".
- Bản TestFlight: số build (vd: 1.0 (3)) + ngày build; ngày đo; người đo.
- Điều kiện chung: pin > 50%, không cắm sạc lúc đo cold start (sạc có thể làm máy nhanh hơn), tắt app chạy nền nặng, Wi-Fi ổn định (trừ B6).

### 7.2 Chuẩn bị dữ liệu test (dữ liệu hư cấu, theo `TESTFLIGHT-CHECKLIST.md`)

- Mức nhẹ (B1/B2/B3.1–B3.2/B6): 10 job + 20 khoản thu chi + 5 ảnh; khách tên "Test …", không dùng dữ liệu khách thật.
- Mức nặng (B3.3/B4): 500 job + 2.000 khoản — **tạo bằng script, không nhập tay** (`PERFORMANCE.md` §5.7). Ghi rõ script/cách tạo; sau khi đo xong thì khôi phục bằng bản sao lưu (`fotobro-sao-luu.json`) hoặc xoá dữ liệu test.
- Mức ảnh (B3.4/B5): đúng 60 ảnh từ máy (ảnh chụp thật, qua `shrinkPhoto`); đếm đủ 60 trước khi đo.
- Mỗi chỉ tiêu đo **3 lần, lấy trung vị** (cold start: vuốt khỏi đa nhiệm + chờ 10 giây giữa các lần). Ghi cả 3 lần, không chỉ ghi lần nhanh nhất.

### 7.3 Công cụ đo (không sửa code app)

1. **Bấm giờ + quay màn hình 60 fps** (iPhone: Cài đặt → Trung tâm điều khiển → Ghi màn hình): mốc chạm icon/chạm tab → khung hình đầu tiên thấy đủ nội dung. Quay lại để xem lại mốc khi tranh cãi 0,2–0,3 giây.
2. **Xcode Instruments** (cần Mac + cáp): Time Profiler / Allocations cho B3 (RAM) và B4.5 (thời gian lưu). Nếu không có Mac: dùng Organizer Metrics trong App Store Connect (launch time p50/p90, memory) + bấm giờ thủ công — ghi rõ đã dùng công cụ nào.
3. **App Store Connect → TestFlight → Metrics / Xcode Organizer**: launch time, hang rate, memory theo build — đối chiếu với số bấm giờ thủ công; nếu lệch > 0,5 giây thì ghi cả hai số và ghi chú.
4. **Cài đặt iPhone → Cài đặt chung → Dung lượng iPhone → FotoBro**: dung lượng app/documents để ước tính B5.5 (trừ đi mức 0 ảnh).
5. **Không** dùng số đo trên trình duyệt máy tính / simulator làm kết quả TestFlight — simulator không tính.

### 7.4 Thứ tự đo gợi ý (1 buổi, ~60–90 phút)

1. Sổ nhẹ: B1 → B2 (nếu có máy cũ) → B6 (mất mạng) → B3.1/B3.2.
2. Nạp 500 job + 2.000 khoản bằng script: B4 → B3.3/B3.5 → khôi phục sao lưu.
3. Nạp 60 ảnh: B5 → B3.4 → dọn dữ liệu test (theo `TESTFLIGHT-CHECKLIST.md` §12).

## 8. Bảng kết quả (điền khi đo — hiện để trống, chưa có số đo thật)

| Mã | Chỉ tiêu | Máy / iOS | Build | Lần 1 | Lần 2 | Lần 3 | Trung vị | Ngưỡng đạt | ĐẠT / KHÔNG |
|---|---|---|---|---|---|---|---|---|---|
| B1.1 | Cold start, máy mới | | | | | | | ≤ 1,0 s | |
| B1.2 | TTI, máy mới | | | | | | | ≤ 1,0 s | |
| B1.3 | Warm start, máy mới | | | | | | | ≤ 0,5 s | |
| B1.4 | Màn trắng/đứng, máy mới | | | | | | | Không > 0,5 s | |
| B2.1 | Cold start, máy cũ | | | | | | | ≤ 2,0 s | |
| B2.2 | TTI, máy cũ | | | | | | | ≤ 2,0 s | |
| B2.3 | Warm start, máy cũ | | | | | | | ≤ 1,0 s | |
| B2.4 | Màn trắng/đứng, máy cũ | | | | | | | Không > 1 s | |
| B3.1 | Peak RAM, sổ trống | | | | | | | ≤ 150 MB | |
| B3.2 | Peak RAM, mức thật | | | | | | | ≤ 180 MB | |
| B3.3 | Peak RAM, tải nặng | | | | | | | ≤ 250 MB | |
| B3.4 | RAM tăng thêm do 60 ảnh | | | | | | | ≤ 60 MB | |
| B3.5 | Không bị kill 10 phút | | | | | | | 0 lần kill | |
| B4.1 | Cold start 500 job, máy mới | | | | | | | ≤ 2,0 s | |
| B4.2 | Cold start 500 job, máy cũ | | | | | | | ≤ 3,0 s | |
| B4.3 | Chuyển tab, 500 job | | | | | | | ≤ 1,0/2,0 s | |
| B4.4 | Cuộn 500 job | | | | | | | Không giật/đứng | |
| B4.5 | Lưu 1 thay đổi, 500 job | | | | | | | ≤ 0,5 s | |
| B4.6 | JSON `troLyXeo.v1`, 500 job | | | | | | | < 4 MB | |
| B5.1 | Cold start 60 ảnh, máy mới | | | | | | | ≤ 1,5 s | |
| B5.2 | Cold start 60 ảnh, máy cũ | | | | | | | ≤ 2,5 s | |
| B5.3 | Ảnh hero hiện | | | | | | | ≤ 1,0 s | |
| B5.4 | Mở lưới 60 ảnh | | | | | | | ≤ 1,0/2,0 s | |
| B5.5 | Dung lượng 60 ảnh | | | | | | | ≤ 30 MB | |
| B5.6 | Xoá/đổi ảnh hero | | | | | | | ≤ 0,5 s | |
| B6.1 | Cold start mất mạng, máy mới | | | | | | | ≤ 1,5 s | |
| B6.2 | Cold start mất mạng, máy cũ | | | | | | | ≤ 2,5 s | |
| B6.3 | Lõi offline 4 thao tác | | | | | | | ≤ 1 s / thao tác | |
| B6.4 | Mục Google mất mạng | | | | | | | Báo rõ ≤ 2 s | |
| B6.5 | Mất mạng giữa chừng | | | | | | | Không mất dữ liệu | |
| B6.6 | Nhắc local mất mạng | | | | | | | Phát đúng giờ | |
| B6.7 | Có mạng lại | | | | | | | Đồng bộ lại được | |

## 9. Vấn đề còn tồn tại / lưu ý

1. **Chưa có số đo thật nào** — chưa có bản TestFlight, chưa có iPhone thật để đo. Toàn bộ ngưỡng mục 1–6 là 🔵 đề xuất, không phải kết luận.
2. **File `www/index.html` đã đổi sau lần rà soát**: `PERFORMANCE.md` ghi 337.803 byte (17:13 UTC 19/11), lúc viết file này đo lại là 341.754 byte (~334 KB, `ls -l` 20/11/2026). Chênh ~4 KB — nhỏ, không đổi ngưỡng B1/B2, nhưng người đo phải ghi đúng kích thước file của đúng bản build mình đo.
3. **Ngưỡng B3/B4/B5 chưa có 🟡 ước tính để bám**: `PERFORMANCE.md` chỉ ước tính thời gian mở app và dung lượng 60 ảnh; RAM, thời gian render 500 job, thời gian lưu đều chưa có ước tính nào — ngưỡng đề xuất ở đây lấy theo cảm nhận dùng được, lần đo đầu tiên có thể phải chỉnh ngưỡng (ghi rõ lý do chỉnh, không lặng lẽ nới).
4. **B2 và B4.2/B5.2/B6.2 cần máy cũ thật**: không có iPhone SE 2 / iPhone 8 thì để trống, không suy số máy cũ từ số máy mới.
5. **B3 cần Mac + Instruments hoặc Organizer Metrics**: chỉ bấm giờ thủ công thì không đo được RAM — ghi rõ công cụ đã dùng, đừng ghi RAM "ước chừng".
6. **Script tạo 500 job + 2.000 khoản chưa có sẵn**: `PERFORMANCE.md` §5.7 yêu cầu tạo bằng script; ai làm B4 phải chuẩn bị script trước buổi đo (không thuộc phạm vi file này — file này chỉ ghi chỉ tiêu, không sửa code).
7. **Hai nút thắt đã biết trước** (`PERFORMANCE.md` §5.1–5.2: tạo 60 object URL lúc mở app; `renderAll()` + `saveLocal()` toàn bộ mỗi lần thay đổi) nhiều khả năng làm B4/B5 vượt ngưỡng ở lần đo đầu — đó là kết quả đo có giá trị, không phải lỗi của bảng này; hướng sửa đã có trong `PERFORMANCE.md` §5.

## 10. Điều kiện chuyển bước

- File này coi là xong khi: đủ 6 nhóm chỉ tiêu (B1–B6) + cách đo TestFlight + bảng kết quả trống — đã đủ trong file này.
- Chuyển sang **đo thật** khi: có bản TestFlight + iPhone thật (ít nhất 1 máy mới, tốt nhất thêm 1 máy cũ) + dữ liệu test đã chuẩn bị theo mục 7.2.
- Coi là **đạt hiệu năng v1** khi: mọi chỉ tiêu B1–B6 ở mức ĐẠT, hoặc các chỉ tiêu KHÔNG ĐẠT đều đã ghi vào bảng lỗi kèm quyết định sửa app (theo `PERFORMANCE.md` §5) hay chấp nhận có lý do — không tự nới ngưỡng để cho qua.
