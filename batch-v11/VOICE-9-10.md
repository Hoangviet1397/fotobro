# FotoBro v1.1 — Spec 2 lệnh giọng nói còn thiếu: (9) đổi bước pipeline, (10) đặt nhắc lịch

> Trạng thái: **spec thiết kế, chưa code** — viết 20/11/2026, chỉ đọc file có sẵn, không sửa code.
> Phạm vi: chỉ 2 lệnh đánh dấu ⚠️ trong `VOICE-COMMANDS.md`. 8 lệnh 1–8 đã chạy ở v1, không đổi hành vi.
> Quy tắc chung vẫn giữ: **không lệnh nào chạy lặng lẽ** — mọi lệnh ghi/chuyển/đặt lịch chỉ chạy sau khi người dùng bấm **Làm đi** trên thẻ xác nhận, kết quả hiện bong bóng chat + đọc to bằng `speechSynthesis` `vi-VN` (xem `VOICE-COMMANDS.md` § "Cách mic hoạt động").

## 0. Căn cứ đối chiếu code thật (đọc 20/11/2026)

| Hạng mục | Code thật |
|---|---|
| Parser hiện tại | `runCommand(raw)` (`www/index.html`, dòng ~2125): chỉ có 2 nhánh — thêm job (`thêm/tạo job…`) và ghi thu/chi (`parseAmount` + `chi`/`thu`/`nhận`/`cọc`). Trả `null` với mọi câu khác → rơi sang `answer(raw)`. |
| Tra cứu job (nơi lệnh 9 đang rơi vào) | `answer()`: khớp tên khách bằng từng từ dài > 2 ký tự sau `norm()`, trả về thông tin job (loại, ngày chụp, bước hiện tại, tiền) — **không đổi bước**. Khớp job đầu tiên tìm thấy, không hỏi lại khi trùng tên. |
| 8 bước pipeline | `STAGES = ['Tư vấn','Chốt cọc','Sắp chụp','Đã chụp','Chọn ảnh','Hậu kỳ','Đã giao','Xong']` (dòng 781). |
| Đổi bước đã có sẵn (bấm tay) | `setStage(j, target, opts)` (dòng ~1464) + `jumpToStage(id, ti)` (dòng ~1486) + `jobAction('next'/'prev')`. Lệnh 9 **dùng lại 3 hàm này, không viết logic đổi bước mới**. |
| Chặn tiền khi đổi bước | `setStage`: sang `Xong` mà `jobOwe(j) > 0` và chưa `force` → hiện actionSheet "Vẫn còn thiếu tiền" (Thu nốt / Vẫn xong, thiếu sau). Sang `Chốt cọc` → tự mở form ghi cọc theo `% cọc` cài đặt. Sang `Đã giao` mà còn thiếu → toast cảnh báo + gợi ý email nhắc thu nốt. |
| Nhảy bước | `jumpToStage`: nhảy qua > 1 bước (ví dụ Tư vấn → Hậu kỳ) → actionSheet xác nhận "Nhảy qua N bước? … Vẫn nhảy?". Lùi/tới 1 bước thì đổi thẳng. |
| Nhắc đã có sẵn | `www/capacitor-bridge.js` `scheduleReminder(job)` / `cancelReminder(jobId)`: chỉ 2 loại — nhắc chụp (trước giờ chụp 60 phút; `NOTIFICATIONS.md` chốt đổi thành 720 phút/12 tiếng ở v1) và nhắc hạn giao (trước 24 tiếng, phát 09:00 hôm trước). ID nhắc `notifId(prefix, jobId)` (hash `prefix:jobId`). **Không có loại nhắc tự đặt theo giờ người dùng nói, không có bảng lưu nhắc riêng.** |
| Nhắc trong app (không phải thông báo) | Nút "Tạo nhắc việc" trong chi tiết job (`act === 'remind'`, dòng ~1550) chỉ **soạn text rồi share/copy** — không đặt lịch nhắc. Nút báo thức (`act === 'alarm'`) chỉ copy text để dán vào app Đồng hồ. **Không được nhầm 2 nút này với lệnh 10.** |
| Chuẩn hoá câu | `norm(s)`: chữ thường, bỏ dấu (`NFD`), `đ` → `d`. Mọi parser mới phải chạy trên câu đã `norm()`, như `runCommand` và `answer()` đang làm. |
| Ngày/giờ trong code | `dstr(off)` trả `YYYY-MM-DD` theo giờ địa phương của máy; giờ chụp mặc định `08:00` khi job không có giờ (`capacitor-bridge.js`, `ics`); `shootTime` dạng `HH:mm`. **Chưa có hàm phân tích ngày tương đối** ("mai", "ngày kia", "thứ 2") trong `runCommand`/`answer()` — lệnh 10 phải viết mới. |
| Thẻ xác nhận giọng nói | `#voiceHeard` + `#voiceText` + 3 nút `#voiceYes` (Làm đi → `runVoiceCommand`), `#voiceRetry` (Nói lại), `#voiceEdit` (Sửa → đưa câu xuống ô gõ). `speak(text)`: `lang 'vi-VN'`, `rate 1.02`, cắt 900 ký tự. |
| Đường gõ tay | `askAndAnswer` bị bọc lại (dòng ~2212): chỉ gọi `runCommand` khi câu có số tiền (`parseAmount`) hoặc khớp `thêm/tạo job…`; còn lại đi thẳng `answer()`. **Lệnh 9 và 10 không có số tiền và không chứa "thêm job" nên hiện tại gõ tay cũng không tới được `runCommand`** — v1.1 phải mở rộng điều kiện bọc này (xem §3). |
| Mic ở v1 | **DỜI SANG v1.1.** `SR = null` khi `isNativeApp()`; bấm micro trong app iOS hiện toast "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha". Bản web mic chạy qua Web Speech API (`vi-VN`). Xem §4. |
| Lưu ý về file mic | `batch-v11/MIC-PLUGIN.md` (kế hoạch sửa mic v1.1, 20/11/2026 — nằm trong chính thư mục `batch-v11/`, cùng chỗ với file này): phạm vi chỉ khôi phục **đầu vào giọng nói**, không bao gồm lệnh 9/10. Lần thử 1: thêm `Package.swift` shim cho plugin cộng đồng (tối đa 2 build trên Actions, dừng nếu lỗi link hoặc shim bị `cap sync` ghi đè 2 lần); lần thử 2 (chỉ khi lần 1 thất bại, không làm song song): viết plugin SPM riêng `FotoBroSpeechRecognition` (~200 dòng Swift bọc `SFSpeechRecognizer`, 4 hàm tối giản). Tái sinh `ios/` bằng CocoaPods **không tính** là một lần thử. Plugin đã gỡ khỏi `package.json` ở v1 (`node_modules/@capacitor-community/` không còn). **Phát hiện trong MIC-PLUGIN.md §4:** `RISKS.md` mục 2 ghi `Info.plist` đã thêm 2 key quyền mic/nhận diện, nhưng kiểm tra thật thì 2 key `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` **không có** (chỉ có key thư viện ảnh) — phải thêm mới trong lần thử 1. Fallback nếu cả 2 lần thất bại: mic dời sang v1.2, gõ tay là cách dùng chính thức. |

---

## 1. Lệnh 9 — Đổi bước pipeline bằng giọng nói

### 1.1 Mẫu câu người dùng (nói hoặc gõ — parser không phân biệt)

| # | Câu mẫu | Hiểu thành |
|---|---|---|
| 1 | "Chuyển job Mai Anh sang bước Hậu kỳ" | Mai Anh → Hậu kỳ |
| 2 | "Đổi job Mai Anh sang Đã giao" | Mai Anh → Đã giao (bỏ chữ "bước" vẫn hiểu) |
| 3 | "Job Mai Anh xong bước Chọn ảnh rồi, chuyển sang Hậu kỳ" | Mai Anh → Hậu kỳ (lấy bước sau cùng nhắc tới) |
| 4 | "Mai Anh xong rồi" | Mai Anh → Xong (xem §1.3 — "xong" không kèm tên bước = bước Xong) |
| 5 | "Chuyển Mai Anh sang bước Chốt cọc" | Mai Anh → Chốt cọc (bỏ chữ "job" vẫn hiểu) |
| 6 | "Job Mai Anh xong bước này" / "Mai Anh xong bước này rồi" | Mai Anh → bước kế tiếp (dùng `jobAction('next')` — §1.4) |
| 7 | "Cho Mai Anh lùi về bước Sắp chụp" | Mai Anh → Sắp chụp (lùi vẫn cho, không chỉ tiến) |
| 8 | "Nhảy job Mai Anh tới bước Đã giao luôn" | Mai Anh → Đã giao, qua `jumpToStage` nên có xác nhận nhảy bước (§1.5) |

Yêu cầu tối thiểu: 5 cách nói — spec này cho 8, gồm cả dạng rút gọn (không "job", không "bước") và dạng tương đối (mẫu 6).

### 1.2 Cách phân tích câu

Chạy trên câu đã `norm()` (không dấu, `đ` → `d`). Thứ tự các bước phân tích — **dừng ngay và hỏi lại ở bước nào thiếu, không đoán mò rồi làm**:

1. **Nhận diện đây là lệnh đổi bước** (trước nhánh tra cứu job trong `answer()` — xem §3):
   `/(chuyen|doi|nhay)\b.*\b(buoc|sang|toi|ve)\b/` hoặc `/xong buoc nay/` hoặc `/xong roi$/`.
   Phải chứa ít nhất một trong các từ: `chuyen`, `doi`, `nhay`, `xong buoc`, `lui ve buoc`.
   Câu chỉ có tên khách ("Mai Anh") → vẫn là tra cứu job như v1, không phải lệnh 9.
2. **Tách tên bước đích** — khớp tên bước trong `STAGES` sau khi `norm()`:
   `tu van`, `chot coc`, `sap chup`, `da chup`, `chon anh`, `hau ky`, `da giao`, `xong`.
   Bảng tên gọi khác (chỉ dùng khi khớp đúng 1 bước, xem §1.3):

   | Người dùng nói | Hiểu thành bước |
   |---|---|
   | `chot tien`, `nhan coc`, `dat coc` | Chốt cọc |
   | `sap toi ngay chup`, `chuan bi chup` | Sắp chụp |
   | `chup xong`, `chup roi` | Đã chụp |
   | `chon hinh`, `chon anh` | Chọn ảnh |
   | `edit`, `edit anh`, `lam hau ky` | Hậu kỳ |
   | `giao anh`, `tra anh` | Đã giao |
   | `xong`, `hoan tat`, `xong job` | Xong |
   | `tu van` | Tư vấn |

   Từ `chup` đứng một mình **không đủ** để phân biệt Sắp chụp / Đã chụp → hỏi lại (§1.3).
3. **Tách tên job** — phần câu còn lại sau khi trừ các từ lệnh (`chuyen`, `doi`, `job`, `buoi chup`, `sang`, `toi`, `buoc`, tên bước đã khớp):
   khớp với `state.jobs` bằng cùng cách `answer()` đang dùng (từng từ tên khách dài > 2 ký tự sau `norm()`), **nhưng khác v1 ở chỗ: khớp được > 1 job thì không lấy job đầu tiên mà hỏi lại** (§1.3).
   Chỉ xét job chưa `cancelled`; job đã `Xong` vẫn cho đổi bước (ví dụ chuyển nhầm thì sửa lại được), trừ khi đích cũng là `Xong`.
4. **Kiểm tra hợp lệ trước khi hiện thẻ xác nhận:**
   - Job không tồn tại → không hiện thẻ xác nhận, trả câu hỏi (§1.3).
   - Bước đích = bước hiện tại → không làm gì, trả: "Job Mai Anh đang ở bước Hậu kỳ rồi đó bạn."
   - Bước đích không có trong `STAGES` và không khớp bảng tên gọi khác → hỏi lại tên bước (§1.3).

### 1.3 Xử lý mơ hồ và câu sai

| Tình huống | App trả lời (bong bóng bot + đọc to) | Không làm gì thêm |
|---|---|---|
| Nhiều job cùng tên khách ("Mai Anh" có 2 job: Wedding và Portrait) | "Có 2 job tên Mai Anh nè: 1. Wedding — đang ở bước Tư vấn, chụp 12/12. 2. Portrait — đang ở bước Sắp chụp, chụp 20/12. Bạn muốn chuyển job nào? Gõ số 1 hoặc 2, hoặc nói rõ loại job nha." | Chờ người dùng chọn số / nói thêm loại job ("job cưới Mai Anh") rồi mới hiện thẻ xác nhận. Không tự chọn job mới nhất. |
| Không tìm thấy job ("Chuyển job Lan sang Hậu kỳ" mà sổ không có Lan) | "Sổ chưa có job tên Lan. Bạn kiểm tra lại tên khách, hoặc thêm job mới trước nha." | Không tạo job mới từ lệnh 9 (tạo job là lệnh 1). |
| Bước không hợp lệ ("…sang bước Chỉnh màu") | "FotoBro có 8 bước thôi nè: Tư vấn, Chốt cọc, Sắp chụp, Đã chụp, Chọn ảnh, Hậu kỳ, Đã giao, Xong. Bạn muốn chuyển sang bước nào trong 8 bước này?" | Không đoán bước gần giống nhất. |
| Bước mơ hồ ("…sang bước chụp" — không rõ Sắp chụp hay Đã chụp) | "Bước chụp có 2 bước nè: Sắp chụp (chưa chụp) và Đã chụp (chụp xong rồi). Job này chụp xong chưa bạn?" | Câu trả lời "chụp xong rồi" → Đã chụp; "chưa chụp" → Sắp chụp. |
| Tên khách thiếu / chỉ nói bước ("Chuyển sang Hậu kỳ") | "Chuyển job của khách nào sang bước Hậu kỳ vậy bạn? Nói tên khách giúp mình nha." | Không lấy job gần nhất / job đang mở. |
| Đích là `Xong` mà khách còn thiếu tiền | Không phải lỗi phân tích — chạy đúng chặn tiền của `setStage` (§1.5): hiện actionSheet "Vẫn còn thiếu tiền" (Thu nốt / Vẫn xong, thiếu sau). Thẻ xác nhận giọng nói vẫn hiện trước, chặn tiền hiện sau khi bấm Làm đi. | Không tự ghi thu, không tự bỏ qua khoản thiếu. |
| Job đã huỷ | "Job Mai Anh đã huỷ rồi, không chuyển bước được. Muốn dùng lại thì khôi phục job về Tư vấn nha." | Không tự khôi phục. |

### 1.4 Thẻ xác nhận trước khi làm

Sau khi phân tích đủ (1 job duy nhất + 1 bước đích hợp lệ), hiện thẻ xác nhận **hiển thị cái đã hiểu, không chỉ hiển thị câu đã nghe**:

> **Chuyển bước?**
> Job **Mai Anh** (Wedding — Digital)
> Từ bước **Tư vấn** → **Hậu kỳ** (nhảy qua 2 bước: Chốt cọc, Sắp chụp)
> [Làm đi] [Sửa] [Huỷ]

- Dòng "nhảy qua…" chỉ hiện khi nhảy > 1 bước (khớp hành vi `jumpToStage`).
- Nút **Sửa**: đưa câu gốc xuống ô gõ tay để sửa (giống `#voiceEdit` của v1).
- Nút **Huỷ**: đóng thẻ, không đổi gì, không ghi log.
- Với câu gõ tay (không qua mic): không có bước xác nhận "đã nghe", chỉ hiện thẻ này một lần rồi mới làm.
- Sau khi bấm **Làm đi**: chạy `setStage` / `jumpToStage` như bấm tay (§1.5), rồi trả câu xác nhận + đọc to (§1.6).

### 1.5 Thực thi — dùng lại hàm có sẵn, không viết mới

```
đích = bước đã khớp; job = job đã chọn (duy nhất)
nếu đích == job.stage → trả "đang ở bước … rồi", dừng
nếu STAGES.indexOf(đích) > STAGES.indexOf(job.stage) + 1 → jumpToStage(job.id, index(đích))
   (jumpToStage tự hiện actionSheet "Nhảy qua N bước?" — đây là lần xác nhận thứ 2, chỉ cho trường hợp nhảy xa;
    nếu người dùng huỷ ở đây thì dừng, giữ nguyên bước)
ngược lại → setStage(job, đích)
```

- `setStage` tự lo: cập nhật `stage` + `stageSince = hôm nay`, `saveLocal()`, `renderAll()`, toast, và các chặn/phụ sau:
  - sang `Chốt cọc` → mở form ghi cọc (người dùng vẫn tự bấm lưu, không tự ghi tiền);
  - sang `Đã giao` còn thiếu tiền → toast cảnh báo + gợi ý email nhắc thu nốt;
  - sang `Xong` còn thiếu tiền → actionSheet chặn tiền (Thu nốt / Vẫn xong).
- **Lệnh giọng nói không được bỏ qua bất kỳ chặn nào trong 3 gạch trên.** Giọng nói chỉ thay cách ra lệnh, không thay luật tiền/bước.
- Ghi chú: sau khi đổi xong, thêm 1 dòng vào `j.note` (trường đã có trong `cleanData`, không cần thêm cột mới):
  `Đổi bước bằng giọng nói: Tư vấn → Hậu kỳ, 20/11/2026 14:30.`
  Dòng này nối tiếp ghi chú cũ (không ghi đè). Mục đích: tra lại được ai/đổi lúc nào khi có nhầm lẫn.

### 1.6 Câu trả lời sau khi làm xong (bong bóng + đọc to bằng `speak`, vi-VN)

| Trường hợp | Câu trả lời |
|---|---|
| Đổi thường (tiến/lùi 1 bước) | "Đã chuyển job Mai Anh sang bước Hậu kỳ rồi nè." |
| Nhảy xa | "Đã chuyển job Mai Anh từ Tư vấn sang Hậu kỳ rồi nè." |
| Sang Chốt cọc | "Đã chuyển job Mai Anh sang bước Chốt cọc. Mình mở sẵn form ghi cọc, bạn nhập số cọc rồi lưu nha." |
| Sang Đã giao, còn thiếu tiền | "Đã chuyển job Mai Anh sang bước Đã giao. Khách còn thiếu 5.000.000₫ — nhớ nhắc thu nốt nha." |
| Sang Xong, đủ tiền | "Xong job Mai Anh rồi, giỏi lắm!" (khớp câu `celebrate` của `setStage`) |
| Sang Xong, người dùng chọn "Vẫn xong, thiếu sau" | "Đã xong job Mai Anh, khách còn thiếu 5.000.000₫ — sổ vẫn ghi thiếu đó nha." |

---

## 2. Lệnh 10 — Đặt nhắc lịch bằng giọng nói

### 2.1 Mẫu câu người dùng (nói hoặc gõ)

| # | Câu mẫu | Hiểu thành |
|---|---|---|
| 1 | "Nhắc tôi chụp Mai Anh lúc 7 giờ sáng mai" | Nhắc 07:00 ngày mai, gắn job Mai Anh, nội dung chụp |
| 2 | "Nhắc tôi 6 giờ tối nay gọi cho Mai Anh chốt lịch" | Nhắc 18:00 hôm nay, gắn job Mai Anh, nội dung gọi chốt lịch |
| 3 | "Mai 8 giờ nhắc tôi chuẩn bị đồ chụp cho Mai Anh" | Nhắc 08:00 ngày mai, gắn job Mai Anh |
| 4 | "Nhắc giao ảnh cho Mai Anh vào 9 giờ sáng thứ 2" | Nhắc 09:00 thứ 2 tới, gắn job Mai Anh, nội dung giao ảnh |
| 5 | "Nhắc tôi 30 phút trước giờ chụp Mai Anh" | Nhắc = giờ chụp của job Mai Anh − 30 phút (lấy giờ từ job, không phải giờ nói) |
| 6 | "Nhắc tôi ngày mai lúc 7 giờ dậy sớm chuẩn bị chụp" | Nhắc 07:00 ngày mai, **không gắn job nào** (nhắc chung) |
| 7 | "Nhắc tôi chiều nay 3 giờ mang máy đi sửa" | Nhắc 15:00 hôm nay, nhắc chung, nội dung mang máy đi sửa |
| 8 | "Hẹn nhắc tôi trả ảnh cho khách lúc 10 giờ sáng ngày kia" | Nhắc 10:00 ngày kia, gắn job nếu nói rõ tên khách, không thì nhắc chung |

Yêu cầu tối thiểu: 5 cách nói — spec này cho 8, gồm cả nhắc gắn job, nhắc chung không gắn job, và nhắc tính theo giờ chụp của job (mẫu 5).

### 2.2 Cách phân tích câu

Chạy trên câu đã `norm()`. Thứ tự phân tích:

1. **Nhận diện đây là lệnh đặt nhắc** (trước nhánh tra cứu trong `answer()` — xem §3):
   câu chứa `nhac` (hoặc `hen nhac`, `bao toi`, `nho toi`) **và** chứa giờ hoặc từ chỉ thời gian (§2.2b).
   Phân biệt với lệnh 7 (xem lịch sắp tới): lệnh 7 là câu hỏi ("Tuần này chụp gì?", "Job nào sắp tới hạn giao?") — không có `nhac` + giờ cụ thể. Câu "Nhắc tôi xem tuần này chụp gì" → vẫn là lệnh 7, không đặt nhắc.
2. **Tách ngày** — quét theo thứ tự ưu tiên, lấy mốc đầu tiên khớp được:

   | Người dùng nói | Ngày hiểu thành |
   |---|---|
   | `hom nay`, `toi nay`, `chieu nay`, `sang nay` | Hôm nay (`dstr(0)`) |
   | `mai`, `ngay mai`, `sang mai`, `toi mai` | Ngày mai (`dstr(1)`) |
   | `mot`, `ngay mot` | Ngày kia (`dstr(2)`) |
   | `ngay kia` | Ngày kia (`dstr(2)`) |
   | `thu 2` … `thu 7`, `chu nhat` | Ngày thứ đó **gần nhất trong tương lai** (nếu hôm nay là thứ 2 mà nói "thứ 2" thì hiểu là thứ 2 tuần sau, không phải hôm nay) |
   | `tuan sau` + thứ (vd "thứ 2 tuần sau") | Thứ đó của tuần sau |
   | `ngay 25`, `25/11`, `25 thang 11` | Ngày đó trong tháng này; nếu đã qua thì tháng sau |
   | Không nói ngày | Xem §2.3 (mặc định theo giờ) |

3. **Tách giờ** — quét mẫu giờ, theo giờ địa phương của máy:

   | Người dùng nói | Giờ hiểu thành |
   |---|---|
   | `7 gio`, `7h`, `luc 7 gio` | 07:00 |
   | `7 gio 30`, `7h30`, `7 gio ruoi` | 07:30 |
   | `7 gio sang`, `7 gio buoi sang` | 07:00 |
   | `3 gio chieu` | 15:00 |
   | `6 gio toi`, `6 gio buoi toi` | 18:00 |
   | `12 gio trua` | 12:00 |
   | `19 gio`, `19h` | 19:00 (giờ 24h nói thẳng thì giữ nguyên) |
   | `30 phut truoc gio chup` (+ tên job) | Giờ chụp của job − 30 phút (lấy `shootTime`, mặc định 08:00 nếu job chưa có giờ — khớp mặc định trong bridge) |
   | `1 tieng truoc gio chup`, `2 tieng truoc…` | Giờ chụp − 1/2 tiếng |
   | Chỉ nói buổi, không nói giờ ("sáng mai nhắc tôi…") | Mặc định **08:00** (khớp giờ mặc định job chưa có giờ trong bridge) |

   Số giờ 1–12 kèm buổi (sáng/chiều/tối) thì đổi sang 24h như bảng trên. Số giờ > 12 thì giữ nguyên. Số giờ = 12 kèm "tối" → 00:00 hôm sau là sai — quy ước: `12 gio toi` = 00:00 là trường hợp hiếm, nếu gặp thì hỏi lại thay vì đoán.
4. **Tách nội dung nhắc** — phần câu còn lại sau khi trừ từ lệnh (`nhac`, `toi`, `hen`), ngày, giờ:
   - Có tên khách khớp 1 job → nhắc gắn job đó (`jobId`), nội dung mặc định theo động từ: có `chup` → "Chụp {khách}"; có `giao anh`/`tra anh` → "Giao ảnh cho {khách}"; có `goi` → "Gọi {khách}"; có `chot` → "Chốt lịch với {khách}"; không có động từ rõ → "Nhắc về job {khách}".
   - Không có tên khách → nhắc chung (`jobId = null`), nội dung = phần câu còn lại (vd "dậy sớm chuẩn bị chụp", "mang máy đi sửa"). Nội dung chung tối đa 140 ký tự, dài hơn thì cắt và ghi rõ đã cắt trong thẻ xác nhận.
   - Nội dung sau khi trừ hết mà rỗng ("Nhắc tôi lúc 7 giờ sáng mai" — không nói việc gì) → hỏi lại việc cần nhắc (§2.3).
5. **Tính thời điểm phát nhắc** (`at`): ngày + giờ đã tách, theo giờ địa phương.
   - **Khác với nhắc chụp mặc định của v1:** nhắc tự đặt phát **đúng giờ người dùng nói**, không trừ 12 tiếng/60 phút. (Nhắc chụp v1 trừ trước giờ chụp vì đó là nhắc chuẩn bị; lệnh 10 là nhắc đúng hẹn.)
   - Nếu `at` đã qua (vd 18:00 mà bây giờ 19:00, nói "tối nay 6 giờ") → tự dời sang ngày hôm sau cùng giờ, và **ghi rõ trong thẻ xác nhận**: "6 giờ tối nay đã qua rồi, mình nhắc 6 giờ tối mai nha."

### 2.3 Xử lý mơ hồ và thiếu thông tin

| Tình huống | App trả lời | Không làm gì thêm |
|---|---|---|
| Thiếu giờ ("Nhắc tôi mai chụp Mai Anh" — có ngày, không có giờ) | "Nhắc Mai Anh lúc mấy giờ ngày mai vậy bạn? Nói giờ giúp mình, ví dụ 7 giờ sáng." | Không tự lấy giờ chụp của job làm giờ nhắc, trừ khi câu có "trước giờ chụp" (mẫu 5, §2.2). |
| Thiếu ngày, giờ còn trong hôm nay ("Nhắc tôi lúc 7 giờ tối" — lúc 17:00) | Hiểu là hôm nay 18:00, thẻ xác nhận ghi rõ "Hôm nay, 18:00" để người dùng kiểm tra. | Không hỏi lại. |
| Thiếu ngày, giờ đã qua hôm nay ("Nhắc tôi lúc 7 giờ sáng" — lúc 09:00) | Hiểu là ngày mai 07:00, thẻ xác nhận ghi rõ "Ngày mai, 07:00 (7 giờ sáng nay đã qua rồi)". | Không hỏi lại, nhưng phải ghi rõ đã dời ngày trong thẻ xác nhận. |
| Thiếu cả ngày lẫn giờ ("Nhắc tôi chụp Mai Anh") | "Nhắc Mai Anh lúc nào vậy bạn? Nói ngày và giờ giúp mình, ví dụ 7 giờ sáng mai." | Không đặt nhắc. |
| Thiếu nội dung ("Nhắc tôi lúc 7 giờ sáng mai" — không nói việc gì, không tên khách) | "7 giờ sáng mai nhắc bạn làm gì vậy? Nói việc cần nhắc giúp mình nha." | Không đặt nhắc chung rỗng. |
| Nhiều job cùng tên khách | Hỏi giống lệnh 9 (§1.3): liệt kê các job trùng tên + ngày chụp + bước, chờ chọn số hoặc nói rõ loại job. | Không gắn bừa vào job đầu tiên. |
| Tên khách không có trong sổ ("Nhắc tôi 7 giờ mai gọi Lan") | Hỏi: "Sổ chưa có job tên Lan. Vẫn đặt nhắc chung 'Gọi Lan lúc 7 giờ sáng mai' không, hay bạn muốn thêm job Lan trước?" — 2 nút: [Đặt nhắc chung] [Thêm job trước]. | Không tự tạo job, không tự gắn job sai. |
| Job đã huỷ / đã Xong | Vẫn cho đặt nhắc gắn job đó (người dùng có thể cần nhắc giao ảnh bù / gọi lại), nhưng thẻ xác nhận ghi rõ trạng thái: "Job Mai Anh đã Xong — vẫn nhắc?". | Không chặn. |
| Giờ nhắc trùng nhắc chụp tự động của job | Không chặn, không gộp: nhắc tự đặt là nhắc riêng (ID riêng, §2.5). Thẻ xác nhận ghi thêm: "Job này đã có nhắc chụp tự động trước giờ chụp 12 tiếng." | Không xoá nhắc tự động. |
| Ngày quá xa (> 30 ngày tới) | Vẫn cho đặt, nhưng thẻ xác nhận ghi rõ ngày đầy đủ ("Thứ 2, 25/01/2027 — còn 66 ngày nữa"). Giới hạn 64 nhắc chờ của iOS (xem `NOTIFICATIONS.md` §5): nếu đã gần đầy thì báo "Sổ nhắc sắp đầy (60/64), xoá bớt nhắc cũ rồi đặt lại nha." | Không tự xoá nhắc cũ. |

### 2.4 Thẻ xác nhận trước khi làm

> **Đặt nhắc?**
> 🔔 **7 giờ sáng mai** — Thứ 7, 21/11/2026, 07:00
> Nội dung: **Chụp Mai Anh (Wedding) — tại Đà Lạt**
> Gắn job: Mai Anh · đang ở bước Sắp chụp
> [Làm đi] [Sửa] [Huỷ]

- Nhắc chung (không gắn job) thì dòng cuối là "Nhắc chung — không gắn job nào".
- Nếu giờ đã dời ngày (§2.2 bước 5) thì thêm dòng: "7 giờ sáng nay đã qua rồi, mình nhắc sáng mai nha."
- Nút **Sửa** / **Huỷ** giống lệnh 9. Bấm **Làm đi** mới lưu nhắc + đặt lịch thông báo (§2.5).

### 2.5 Lưu nhắc + đặt lịch thông báo (phần code mới của v1.1)

**Chưa có gì trong code v1 để dùng lại** — đây là phần việc code lớn nhất của 2 lệnh. Spec chốt hình dạng để agent làm app không tự đổi:

1. **Bảng nhắc mới trong `state`** (lưu cùng `localStorage` key `troLyXeo.v1`, theo cùng `saveLocal()`; thêm vào danh sách trắng trong `cleanData()` — dòng ~884 — nếu không dữ liệu sẽ bị lọc mất khi mở lại):
   ```js
   state.reminders = [
     { id, jobId: <id job hoặc null>, at: 'YYYY-MM-DDTHH:mm', text: 'Chụp Mai Anh',
       kind: 'custom', done: false, createdAt: 'YYYY-MM-DDTHH:mm' }
   ]
   ```
   - `at` lưu giờ địa phương dạng chuỗi (không lưu timestamp UTC — tránh lệch múi giờ khi user đổi múi giờ đi chụp xa; xem `NOTIFICATIONS.md` §5).
   - Sao lưu JSON: `reminders` đi kèm `jobs`/`txs` trong file sao lưu (cùng cơ chế export/import hiện có). **Nhắc đã đặt trên máy không đi theo file sao lưu** — mở lại từ sao lưu trên máy khác thì app phải đặt lại lịch từ `state.reminders` khi mở app (giống cách nhắc job kẹt / sao lưu chỉ đặt khi mở app, `NOTIFICATIONS.md` §2.3–2.4).
   - Xoá toàn bộ dữ liệu (`wipeAll`) xoá luôn `state.reminders` (nằm trong state nên xoá theo, không cần thêm key).
2. **Đặt lịch qua bridge có sẵn** (`www/capacitor-bridge.js`):
   - Thêm hàm `scheduleCustomReminder(rem)` cạnh `scheduleReminder(job)`, dùng `LocalNotifications.schedule` như hàm cũ.
   - ID nhắc: `notifId('custom', rem.id)` — tiền tố mới, không trùng `shoot`/`dl`/`stuck`/`backup` nên không ghi đè nhắc chụp/hạn giao của job.
   - Nội dung thông báo: tiêu đề `Nhắc lịch 🔔`, body = `rem.text` + (giờ + tên khách nếu có). `extra: { kind:'custom', reminderId: rem.id, jobId }`.
   - Chạm vào thông báo → mở chi tiết job nếu `jobId` còn tồn tại, không thì mở màn hình Hôm nay (khớp quy ước `NOTIFICATIONS.md` §4).
   - Chỉ đặt lịch khi `at` > hiện tại; quá khứ thì bỏ qua (khớp bộ lọc `filter(at > Date.now())` trong bridge).
   - Lỗi đặt lịch thì im lặng (try/catch như bridge hiện tại) — **nhưng phải báo cho người dùng bằng câu trả lời**: "Đã lưu nhắc trong app, nhưng chưa đặt được thông báo trên máy — mở app vẫn thấy nhắc trên màn hình Hôm nay." (Khác bridge cũ ở chỗ bridge cũ im lặng hoàn toàn; lệnh 10 là do người dùng đặt đích danh nên phải nói rõ.)
3. **Quyền thông báo iOS** — theo đúng `NOTIFICATIONS.md` §3 (không xin quyền lúc mở app lần đầu):
   - Lần đầu đặt nhắc bằng lệnh 10: hiện sheet trong app "Cho FotoBro nhắc đúng giờ bạn đặt nhé?" → [Cho phép nhắc] / [Để sau].
   - Bấm Cho phép → gọi `LocalNotifications.requestPermissions()` (iOS chỉ cho hộp thoại hệ thống hiện 1 lần).
   - Bấm Để sau / bị từ chối → **vẫn lưu nhắc vào `state.reminders`**, hiện nhắc trên màn hình Hôm nay (mục "Nhắc đã đặt") + banner nhẹ "Đang tắt nhắc lịch — bật trong Cài đặt iPhone → FotoBro → Thông báo". Không hỏi lại bằng hộp thoại hệ thống.
   - **Không dùng `speechSynthesis` để nhắc** — nhắc phải hiện khi app đóng (`VOICE-COMMANDS.md` ghi chú 3). Giọng đọc chỉ dùng để đọc câu xác nhận sau khi đặt.
4. **Hiện nhắc trong app:** màn hình Hôm nay thêm mục "Nhắc đã đặt" liệt kê nhắc chưa tới giờ (giờ + nội dung + tên khách nếu có), chạm vào mở job / xoá nhắc. Nhắc tới giờ thì đánh `done: true` khi người dùng mở app sau giờ đó (không tự xoá ngay — để người dùng thấy mình đã nhắc).
5. **Huỷ / sửa nhắc:** xoá nhắc trong mục "Nhắc đã đặt" → gọi `LocalNotifications.cancel({ id: notifId('custom', rem.id) })` + xoá khỏi `state.reminders`. Sửa nhắc = xoá nhắc cũ + đặt nhắc mới (không có API sửa tại chỗ).

### 2.6 Câu trả lời sau khi làm xong (bong bóng + đọc to, vi-VN)

| Trường hợp | Câu trả lời |
|---|---|
| Đặt thành công, đã có quyền thông báo | "Đã nhắc chụp Mai Anh lúc 7 giờ sáng mai rồi nè. Tới giờ app sẽ nhắc bạn." |
| Đặt thành công, chưa có quyền thông báo | "Đã lưu nhắc chụp Mai Anh lúc 7 giờ sáng mai trong app rồi. Nhưng thông báo đang tắt nên app chỉ nhắc khi bạn mở app thôi — bật thông báo trong Cài đặt iPhone để nhắc cả khi app đóng nha." |
| Nhắc chung | "Đã nhắc 7 giờ sáng mai dậy sớm chuẩn bị chụp rồi nè." |
| Giờ đã dời sang hôm sau | "7 giờ sáng nay qua rồi nên mình nhắc 7 giờ sáng mai nha." (nối sau câu xác nhận chính) |
| Nhắc theo giờ chụp ("30 phút trước giờ chụp") | "Đã nhắc trước giờ chụp Mai Anh 30 phút — tức 7 giờ 30 sáng mai — rồi nè." (ghi rõ giờ tính ra để người dùng kiểm tra) |

---

## 3. Nối vào code hiện có (cho agent làm v1.1)

Thứ tự nhánh trong `runCommand` — **thêm 2 nhánh mới trước khi `return null`**, và trước nhánh tra cứu job trong `answer()` (vì `answer()` khớp tên khách trước nên lệnh 9 hiện rơi vào đó):

```
runCommand(raw):
  1. nhánh thêm job (giữ nguyên)
  2. nhánh ghi thu/chi (giữ nguyên)
  3. MỚI — nhánh đổi bước (lệnh 9): khớp mẫu §1.2 bước 1
       → parseStageCommand(raw): trả về {job, targetStage} hoặc {ask: '…câu hỏi lại…'}
       → nếu đủ thông tin: trả về đối tượng "cần xác nhận" (không đổi bước ngay — thẻ xác nhận §1.4 quyết)
  4. MỚI — nhánh đặt nhắc (lệnh 10): khớp mẫu §2.2 bước 1
       → parseReminderCommand(raw): trả về {at, text, job} hoặc {ask: '…'}
       → nếu đủ thông tin: trả về đối tượng "cần xác nhận" (thẻ §2.4)
  5. return null → answer() như cũ
```

- **Mở rộng điều kiện bọc `askAndAnswer`** (dòng ~2212): hiện tại chỉ gọi `runCommand` khi có số tiền hoặc `thêm/tạo job`. Thêm điều kiện cho 2 lệnh mới:
  ```js
  /(chuyen|doi|nhay)\s+(job|buoi chup)?.*(buoc|sang|toi)/.test(n)   // lệnh 9
  /nhac/.test(n) && /(gio|phut|sang|chieu|toi|mai|hom nay)/.test(n) // lệnh 10
  ```
  Nếu không mở rộng, gõ tay 2 lệnh này vẫn rơi thẳng vào `answer()` và không bao giờ tới parser mới.
- **Thẻ xác nhận 2 tầng:** tầng 1 là `#voiceHeard` có sẵn (xác nhận câu đã nghe, chỉ khi nói bằng mic); tầng 2 là thẻ mới §1.4/§2.4 (xác nhận cái đã hiểu: job + bước / giờ + nội dung). Gõ tay chỉ có tầng 2. **Không gộp 2 tầng thành 1** — người dùng cần thấy cả "app nghe có đúng không" và "app hiểu có đúng không".
- **Hàm phân tích mới:** `parseStageCommand(raw)`, `parseReminderCommand(raw)` — viết mới hoàn toàn, dùng `norm()` + `STAGES` + `dstr()` có sẵn. Không sửa `parseAmount` / `voiceCategory` (2 lệnh mới không dùng số tiền).
- **Hàm thực thi:** lệnh 9 dùng lại `setStage` / `jumpToStage` (kèm chặn tiền, xác nhận nhảy bước, toast, celebrate). Lệnh 10 viết mới `scheduleCustomReminder` trong bridge + thêm `state.reminders` (§2.5).
- **Câu gợi ý nhanh:** `QUICK_QS` hiện có 7 câu hỏi (dòng 2004), không có lệnh ra lệnh nào. Không thêm lệnh 9/10 vào `QUICK_QS` (2 lệnh này cần tên khách + bước/giờ cụ thể, không bấm chung được). Thay vào đó, thêm 2 câu mẫu vào câu trả lời "chưa tra được" của `answer()` (dòng ~2058): "…hoặc ra lệnh như 'Chuyển job Mai Anh sang bước Hậu kỳ', 'Nhắc tôi chụp Mai Anh lúc 7 giờ sáng mai'."
- **Chuỗi hiển thị:** câu xác nhận + câu hỏi lại trong spec này viết bằng tiếng Việt. Khi làm, thêm cả bản tiếng Anh vào `I18N-STRINGS.md` theo đúng quy ước file đó (app v1 có chuyển Việt/Anh).
- **Không đổi:** `speak()` (vi-VN, rate 1.02), `#voiceHeard` / 3 nút Làm đi–Nói lại–Sửa, `STAGES`, luật tiền trong `setStage`, nhắc chụp/hạn giao tự động trong bridge.

## 4. Phụ thuộc vào mic plugin — 2 lệnh vẫn chạy bằng gõ tay nếu mic chưa xong

- **Mic native dời v1.1** (`RISKS.md` mục 4 + `batch-v11/MIC-PLUGIN.md`): plugin `@capacitor-community/speech-recognition@7.0.1` chỉ có `.podspec`, không có `Package.swift`, không có mặt trong `ios/App/CapApp-SPM/Package.swift` nên build SPM của Capacitor 8 không link được. Kế hoạch sửa trong `MIC-PLUGIN.md` (làm tuần tự, không song song): lần 1 thêm `Package.swift` shim cho plugin cộng đồng (tối đa 2 build trên GitHub Actions macOS runner, dừng nếu vẫn lỗi link hoặc shim bị `cap sync` ghi đè 2 lần); lần 2 viết plugin SPM riêng `FotoBroSpeechRecognition` bọc `SFSpeechRecognizer` (~200 dòng, 4 hàm: `requestPermission` / `startListening({language:'vi-VN'})` / `stopListening` / event `transcript`). Phương án trả phí `@capawesome/speech-recognition` (Capawesome Insiders, cần licence key) chỉ cân nhắc khi Việt đồng ý trả phí. Nếu cả 2 lần thất bại → mic dời sang v1.2 theo fallback `MIC-PLUGIN.md` §7, gõ tay vẫn là cách dùng chính thức. **Lưu ý:** 2 key quyền `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` hiện **chưa có** trong `ios/App/App/Info.plist` (chỉ có key thư viện ảnh) — phải thêm khi làm lần thử 1, không được giả định là đã có.
- **2 lệnh này không phụ thuộc mic:** parser (`runCommand` + 2 hàm mới), thẻ xác nhận, `setStage`, `state.reminders`, bridge local notification — tất cả đều chạy từ câu **gõ tay** trong ô "Hỏi trợ lý…" ở tab Trợ lý, đúng như 8 lệnh 1–8 đang chạy ở v1 iOS. Mic chỉ thay cách nhập câu (nói thay vì gõ); câu nói sau khi nhận dạng xong đi qua đúng parser và đúng thẻ xác nhận như câu gõ.
- **Nếu mic chưa xong ở v1.1:** 2 lệnh vẫn giao được, chỉ thiếu bước "nói". Trong app vẫn hiện toast "Giọng nói sẽ có ở bản v1.1 — giờ gõ câu hỏi nha" khi bấm micro (hành vi v1 hiện tại). Tài liệu hướng dẫn và App Store không được giới thiệu 2 lệnh này là "nói là làm" cho tới khi mic chạy thật trên iPhone.
- **Khi mic trở lại:** cần thêm 2 quyền iOS `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` vào `Info.plist` (hiện chưa có — xem §0); lưu ý `SFSpeechRecognizer` xử lý giọng nói qua máy chủ Apple, không hoàn toàn trên máy — ghi rõ trong Privacy Policy trước khi bật (`VOICE-COMMANDS.md` § trạng thái mic, `MIC-PLUGIN.md` §4). Nối mic theo `MIC-PLUGIN.md` §5: bỏ nhánh chặn native trong `startListening()`, gọi plugin qua `Capacitor.Plugins.SpeechRecognition`, giữ nguyên luồng thẻ xác nhận + 3 nút; `SFSpeechRecognizer` cần mạng Apple nên mất mạng giữa lúc nghe phải báo lỗi rõ và rơi về gõ tay. Giọng đọc trả lời (`speechSynthesis` vi-VN) giữ nguyên, không phụ thuộc plugin mic (kiểm chứng lại ở TestFlight, nếu không đọc mới thay bằng plugin TTS).
- **Thứ tự làm v1.1 (đề xuất):** (1) code 2 parser + thẻ xác nhận + `state.reminders` + bridge nhắc tự đặt → kiểm chứng bằng gõ tay; (2) sửa mic theo đúng thứ tự `MIC-PLUGIN.md` (lần 1 shim → chỉ khi thất bại mới lần 2 plugin riêng, mỗi lần tối đa 2 build, không làm song song); (3) chỉ khi mic build được trên GitHub Actions thì test 2 lệnh bằng mic trên iPhone thật. Không để mic kẹt cả 2 lệnh.

## 5. Tiêu chí kiểm chứng (chạy bằng gõ tay trước, rồi mới bằng mic)

Quy tắc chung: **mỗi lệnh cần 1 ca đạt (câu mẫu) + 1 ca sai** (`VOICE-COMMANDS.md` ghi chú 4). Test gõ tay trên bản web trước (parser giống hệt), rồi test mic trên iPhone thật sau khi mic xong. Không kiểm chứng được nhắc khi app đóng trên Linux/máy ảo — phải qua TestFlight.

### 5.1 Lệnh 9 — đổi bước

| # | Ca kiểm | Cách làm | Đạt khi |
|---|---|---|---|
| 9.1 | Câu mẫu chuẩn | Gõ "Chuyển job Mai Anh sang bước Hậu kỳ" → bấm Làm đi | Thẻ xác nhận hiện đúng job + Tư vấn → Hậu kỳ; sau Làm đi job sang Hậu kỳ, `stageSince` = hôm nay, toast đúng tên bước |
| 9.2 | Không dấu | Gõ "chuyen job mai anh sang buoc hau ky" | Kết quả giống 9.1 (`norm()` bỏ dấu) |
| 9.3 | Dạng rút gọn | Gõ "Mai Anh xong rồi" | Job Mai Anh sang bước Xong (hoặc hiện chặn tiền nếu còn thiếu — xem 9.6) |
| 9.4 | Trùng tên | Tạo 2 job tên Mai Anh (Wedding + Portrait), gõ lệnh 9 | App hỏi chọn job (liệt kê 2 job + ngày chụp), **không tự đổi job nào** |
| 9.5 | Bước sai | Gõ "Chuyển job Mai Anh sang bước Chỉnh màu" | App liệt kê 8 bước đúng, không đổi bước |
| 9.6 | Xong mà còn thiếu tiền | Job Mai Anh còn thiếu 5.000.000₫, gõ "Mai Anh xong rồi" → Làm đi | Hiện actionSheet "Vẫn còn thiếu tiền" (Thu nốt / Vẫn xong); chọn Thu nốt → mở form ghi cọc/thu đủ số thiếu |
| 9.7 | Nhảy xa | Job đang Tư vấn, gõ "Nhảy job Mai Anh tới bước Đã giao luôn" | Hiện xác nhận nhảy bước ("Nhảy qua 2 bước?") trước khi đổi |
| 9.8 | Bước hiện tại | Job đã ở Hậu kỳ, gõ "Chuyển job Mai Anh sang bước Hậu kỳ" | Trả "đang ở bước Hậu kỳ rồi", không đổi gì, không ghi note |
| 9.9 | Ghi note | Sau ca 9.1, mở chi tiết job | `note` có dòng "Đổi bước bằng giọng nói: Tư vấn → Hậu kỳ, <ngày giờ>" |
| 9.10 | Mic (chỉ khi mic xong) | Nói câu 9.1 trên iPhone thật | Thẻ `#voiceHeard` hiện đúng câu nghe được → Làm đi → kết quả giống 9.1; nói sai tên bước thì bấm Sửa được |

### 5.2 Lệnh 10 — đặt nhắc lịch

| # | Ca kiểm | Cách làm | Đạt khi |
|---|---|---|---|
| 10.1 | Câu mẫu chuẩn | Gõ "Nhắc tôi chụp Mai Anh lúc 7 giờ sáng mai" → bấm Làm đi | Thẻ xác nhận hiện đúng 07:00 ngày mai + nội dung "Chụp Mai Anh"; sau Làm đi nhắc có trong `state.reminders` và trong mục "Nhắc đã đặt" ở Hôm nay |
| 10.2 | Không dấu | Gõ "nhac toi chup mai anh luc 7 gio sang mai" | Kết quả giống 10.1 |
| 10.3 | Giờ đã qua hôm nay | Lúc 09:00, gõ "Nhắc tôi lúc 7 giờ sáng" | Thẻ xác nhận ghi rõ dời sang ngày mai 07:00 (không đặt 07:00 hôm nay đã qua) |
| 10.4 | Thiếu giờ | Gõ "Nhắc tôi mai chụp Mai Anh" | App hỏi "lúc mấy giờ?", không đặt nhắc |
| 10.5 | Nhắc theo giờ chụp | Job Mai Anh chụp 08:00 mai, gõ "Nhắc tôi 30 phút trước giờ chụp Mai Anh" | Thẻ xác nhận ghi rõ giờ tính ra (07:30 mai); nhắc đặt đúng 07:30 |
| 10.6 | Nhắc chung | Gõ "Nhắc tôi chiều nay 3 giờ mang máy đi sửa" | Nhắc lưu với `jobId = null`, nội dung "mang máy đi sửa", 15:00 hôm nay |
| 10.7 | Trùng tên khách | 2 job Mai Anh, gõ lệnh 10 có tên Mai Anh | App hỏi chọn job trước khi hiện thẻ xác nhận |
| 10.8 | Từ chối quyền thông báo | Từ chối quyền, gõ câu 10.1 → Làm đi | Nhắc vẫn lưu trong app + hiện ở Hôm nay; câu trả lời nói rõ "thông báo đang tắt, chỉ nhắc khi mở app"; không hiện lại hộp thoại hệ thống |
| 10.9 | Nhắc tới khi app đóng | Đặt nhắc sau 2 phút nữa, tắt app, chờ | Thông báo hiện đúng giờ, chạm vào mở đúng chi tiết job (TestFlight / iPhone thật) |
| 10.10 | Sao lưu + mở lại | Đặt 1 nhắc, xuất sao lưu JSON, xoá dữ liệu, nhập lại sao lưu, mở app | Nhắc còn trong `state.reminders` và được đặt lại lịch (không mất nhắc sau khi nhập sao lưu) |
| 10.11 | Mic (chỉ khi mic xong) | Nói câu 10.1 trên iPhone thật | Thẻ `#voiceHeard` hiện đúng câu nghe được → Làm đi → kết quả giống 10.1 |

### 5.3 Không được vỡ (hồi quy 8 lệnh cũ)

- Gõ lại 7 câu `QUICK_QS` + "Thu cọc Mai Anh 5 triệu" + "Chi makeup 2 triệu": kết quả giống v1 (thêm job / ghi sổ / tra cứu không đổi).
- Lệnh 7 ("Tuần này chụp gì?") không bị nhận nhầm thành lệnh 10; câu "Nhắc tôi xem tuần này chụp gì" trả lịch tuần như lệnh 7, không đặt nhắc.
- Câu chỉ có tên khách ("Mai Anh") vẫn tra cứu job như v1, không hỏi đổi bước/đặt nhắc.

## 6. Việc còn mở / cần Việt hoặc agent làm app quyết

1. **Ghi log đổi bước:** spec chọn thêm dòng vào `j.note` (§1.5) để không thêm cột mới. Nếu agent làm app muốn log riêng (`stageLog`) thì phải thêm vào danh sách trắng `cleanData()` + sao lưu JSON — báo lại trước khi đổi.
2. **Giờ mặc định khi chỉ nói buổi:** spec chọn 08:00 (khớp mặc định giờ chụp trong bridge). Việt có thể đổi thành 09:00 nếu muốn.
3. **Mic plugin:** chọn phương án A/B/C/D trong `RISKS.md` mục 4 — Việt chưa chốt. Không ảnh hưởng 2 lệnh này (vẫn chạy bằng gõ tay), chỉ ảnh hưởng bước "nói".
4. **Mic plugin:** theo `batch-v11/MIC-PLUGIN.md` (đã đọc, §0/§4) — lần 1 shim, lần 2 plugin riêng, fallback dời sang v1.2 nếu cả 2 thất bại; 2 key quyền trong `Info.plist` hiện chưa có, phải thêm khi làm lần thử 1. Việt chưa chốt phương án trả phí `@capawesome/speech-recognition` — chỉ cân nhắc khi Việt đồng ý trả phí. Không ảnh hưởng 2 lệnh này (vẫn chạy bằng gõ tay), chỉ ảnh hưởng bước "nói".

---

## Báo cáo 7 mục (mẫu Quy trình Vibe Coding)

1. **Mục tiêu:** Viết spec 2 lệnh giọng nói còn thiếu cho FotoBro v1.1 — (9) đổi bước pipeline bằng giọng nói, (10) đặt nhắc lịch bằng giọng nói — theo `VOICE-COMMANDS.md`, đối chiếu code thật `runCommand` trong `www/index.html`.
2. **Đã thực hiện:** Chỉ đọc file có sẵn (`VOICE-COMMANDS.md`, `batch-v11/MIC-PLUGIN.md`, `www/index.html` các hàm `runCommand`/`answer`/`setStage`/`jumpToStage`/`speak`/thẻ `#voiceHeard`/bọc `askAndAnswer`, `www/capacitor-bridge.js` `scheduleReminder`/`cancelReminder`/`notifId`, `RISKS.md` mục 4, `NOTIFICATIONS.md`). Viết 1 file mới duy nhất: `~/workspace/fotobro-ios-v1/batch-v11/VOICE-9-10.md`. Không sửa bất kỳ file nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** File đã viết, đọc được. Nội dung bám code thật: 8 bước `STAGES`, chặn tiền `Xong` + nhảy bước trong `setStage`/`jumpToStage`, bridge chỉ có nhắc chụp 60 phút + hạn giao 24h (chưa có nhắc tự đặt), `askAndAnswer` hiện không đưa lệnh 9/10 tới `runCommand` (phải mở rộng điều kiện bọc), nút "Tạo nhắc việc" hiện tại chỉ share/copy text (không phải thông báo). Mỗi lệnh có 8 mẫu câu (yêu cầu tối thiểu 5), bảng phân tích, thẻ xác nhận 2 tầng, bảng xử lý mơ hồ, tiêu chí kiểm chứng 10.1–10.11 và 9.1–9.10.
4. **Vấn đề còn tồn tại:** (a) Chưa có hàm phân tích ngày tương đối ("mai", "thứ 2") và chưa có bảng `state.reminders` — đều phải viết mới ở v1.1; (b) `answer()` hiện khớp job đầu tiên khi trùng tên — 2 lệnh mới phải hỏi lại thay vì lấy job đầu tiên; (c) Chưa kiểm chứng được nhắc khi app đóng trên Linux — phải qua TestFlight/iPhone thật; (d) 2 key quyền mic/nhận diện chưa có trong `Info.plist` (phát hiện trong `MIC-PLUGIN.md` §4) — phải thêm khi làm lần thử mic 1. Lưu ý quá trình: bản nháp spec này từng ghi nhầm "không có file MIC-PLUGIN.md" do lệnh `find` lỗi toán tử `-o` bỏ sót file trong chính `batch-v11/` — đã đọc file và sửa lại toàn bộ các chỗ liên quan trước khi giao.
5. **Điều kiện chuyển bước:** Agent làm v1.1 code theo §3 (2 parser mới + mở rộng bọc `askAndAnswer` + `state.reminders` + `scheduleCustomReminder` trong bridge), chạy tiêu chí §5 bằng gõ tay trước; Việt chốt phương án mic (A/B/C/D) chỉ khi muốn test bằng mic.
6. **Bước tiếp theo:** Sau khi code xong, QA chạy bảng §5.1–§5.3 (gõ tay), rồi test mic trên iPhone thật khi plugin mic xong; kiểm tra nhắc khi app đóng qua TestFlight (ca 10.9–10.10).
7. **Trạng thái:** Spec xong, chờ code v1.1. 2 lệnh thiết kế để **chạy được bằng gõ tay ngay cả khi mic chưa xong** — mic chỉ thay cách nhập câu, không phải điều kiện tiên quyết.
