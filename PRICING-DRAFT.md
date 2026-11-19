# FotoBro — Bản nháp giá thu phí Nấc 2/3

> Ngày: 20/11/2026. Trạng thái: **BẢN NHÁP — chưa chốt, chưa bật IAP, chưa ghi giá vào code hay App Store Listing.**
> Nguồn duy nhất: `CLOUDKIT-PLAN.md` (§0, §6, §8). Nấc 1 miễn phí, Nấc 2/3 thu phí là quyết định đã chốt ngày 19/11/2026; **giá và chu kỳ CHƯA chốt — mọi ô giá dưới đây đều là `TBD`**.
> File này chỉ là bản nháp để Việt chốt. Không sửa code app, không tạo tài khoản, không bật IAP.

## 0. Nguyên tắc thu phí (theo CLOUDKIT-PLAN.md §6)

- Thu phí **theo user** (Nấc 2) và **theo workspace** (Nấc 3), không thu theo job hay theo dung lượng ảnh ở v1.
- Dùng **StoreKit / IAP của Apple** (auto-renewable subscription hoặc mua 1 lần — quyết sau khi Việt chốt chu kỳ). Không tự làm cổng thanh toán riêng trong app (vi phạm guideline App Store).
- Nấc 2/3 hết hạn thì app quay về Nấc 1: dữ liệu local còn nguyên, chỉ tắt đồng bộ/team, không khoá dữ liệu cũ.
- Chi phí phía Apple: CloudKit miễn phí tới hạn mức lớn của Apple (đủ cho app nhỏ; vượt hạn mức mới tính theo mức dùng — kiểm tra lại bảng giá Apple lúc bật). Không có server riêng nên không có phí server cho Nấc 2. App Store đã trả $99/năm (Apple Developer) — không liên quan phí Nấc 2/3.

## 1. So sánh 3 nấc trong 1 bảng

| Tính năng | Nấc 1 — Cá nhân | Nấc 2 — Đồng bộ | Nấc 3 — Studio |
|---|:---:|:---:|:---:|
| Giá | **Miễn phí** | **Thu phí — `TBD`** | **Thu phí — `TBD` (cao hơn Nấc 2)** |
| Chu kỳ | — | `TBD` (tháng / năm / mua 1 lần) | `TBD` (tháng / năm / mua 1 lần) |
| Màn hình Hôm nay | ✅ | ✅ | ✅ |
| Job pipeline 8 bước (Tư vấn → Chốt cọc → Sắp chụp → Đã chụp → Chọn ảnh → Hậu kỳ → Đã giao → Xong) | ✅ | ✅ | ✅ |
| Sổ tiền / báo cáo ngày/tuần/tháng | ✅ | ✅ | ✅ |
| Nhắc lịch (nhắc trong app) | ✅ | ✅ | ✅ |
| Mẫu tin nhắn / email | ✅ | ✅ | ✅ |
| Máy tính giá + bảng giá digital/film | ✅ | ✅ | ✅ |
| Giọng nói (gõ tay + mic khi có ở v1.1) | ✅ | ✅ | ✅ |
| Khoá Face ID / PIN | ✅ | ✅ | ✅ |
| Cá nhân hoá: màu chủ đề, logo studio, ngôn ngữ Việt/Anh, tiền tệ VND/USD | ✅ | ✅ | ✅ |
| Sao lưu JSON thủ công + nhắc sao lưu 7 ngày | ✅ | ✅ | ✅ |
| Sao lưu mã hoá lên CloudKit (`EncryptedBackup`, AES-256-GCM + PBKDF2) | — | ✅ | ✅ |
| Đồng bộ giữa các máy của cùng 1 user (iPhone ↔ iPad, CloudKit privateDB, zone `FotoBroZone`) | — | ✅ | ✅ |
| Khôi phục từ bản sao lưu mã hoá trên CloudKit | — | ✅ | ✅ |
| Đăng nhập bằng Sign in with Apple (để bật Nấc 2/3) | — | ✅ | ✅ |
| Workspace studio (1 user = 1 workspace + dữ liệu cá nhân ở v1) | — | — | ✅ |
| 4 vai trò: Chủ / Quản lý / Photographer / Xem | — | — | ✅ |
| Mời thành viên bằng mã mời (hết hạn 7 ngày) | — | — | ✅ |
| Nhật ký hoạt động (tối đa 500 dòng/workspace) | — | — | ✅ |
| Xem tiền studio (thu/chi/báo cáo) cho mọi vai trò | — | — | ✅ |

Ghi chú bảng:

- Nấc 2 gồm **tất cả Nấc 1** + đồng bộ/sao lưu mã hoá. Nấc 3 gồm **tất cả Nấc 2** + workspace.
- Ảnh gốc **không** lên CloudKit record ở v1 (chỉ metadata `PhotoMeta` + ảnh trong file sao lưu mã hoá) — xem CLOUDKIT-PLAN.md §2.4. Nếu Việt đổi quyết định này thì bảng trên phải sửa lại trước khi code.
- Quyền chi tiết Nấc 3 (ai được xoá job, sửa tiền/bảng giá, xuất sao lưu, xem log) xem CLOUDKIT-PLAN.md §5.2 — bản nháp giá này không đổi bảng quyền đó.

## 2. Nấc 1 — Cá nhân (miễn phí)

**Giá: Miễn phí, không giới hạn thời gian.**

Gồm toàn bộ lõi local-first, dùng offline hoàn toàn:

- Hôm nay; job pipeline 8 bước; sổ tiền/báo cáo ngày/tuần/tháng; nhắc lịch trong app; mẫu tin nhắn/email; máy tính giá; bảng giá digital/film; giọng nói; khoá Face ID/PIN.
- Cá nhân hoá: màu chủ đề, logo studio, ngôn ngữ Việt/Anh, tiền tệ VND/USD (chỉ đổi hiển thị, không quy đổi tỷ giá).
- Sao lưu JSON thủ công + nhắc sao lưu sau 7 ngày (chưa từng sao lưu hoặc quá 7 ngày thì hiện banner nhắc, không chặn user).

Không gồm: đồng bộ CloudKit, sao lưu mã hoá lên CloudKit, workspace/nhóm.

## 3. Nấc 2 — Đồng bộ (thu phí, `TBD`)

**Giá: `TBD` / chu kỳ `TBD`. Chưa chốt.**

Gồm tất cả Nấc 1, cộng:

- Sao lưu mã hoá nguyên file lên CloudKit (record `EncryptedBackup`): toàn bộ file backup JSON v2 đã mã hoá AES-256-GCM, mật khẩu do user đặt và tự nhớ — mất mật khẩu = mất bản sao lưu mã hoá (không có khôi phục bằng Apple ID ở v1).
- Đồng bộ giữa các máy của cùng 1 user (iPhone ↔ iPad): record `Job` / `Tx` / `Config` / `PhotoMeta` trong container `iCloud.com.fotobro.app`, privateDB, zone `FotoBroZone`; outbox khi mất mạng, xung đột giữ bản mới nhất (last-write-wins).
- Khôi phục từ bản sao lưu mã hoá trên CloudKit khi đổi máy.
- Đăng nhập bằng Sign in with Apple (không tài khoản FotoBro riêng).

Thứ tự triển khai theo CLOUDKIT-PLAN.md §2.2: sao lưu mã hoá nguyên file trước (rủi ro thấp), sync từng record sau (khi bước 1 chạy ổn).

Không gồm: workspace, vai trò, mời thành viên, nhật ký hoạt động (đó là Nấc 3).

## 4. Nấc 3 — Studio (thu phí, `TBD`, cao hơn Nấc 2)

**Giá: `TBD` / chu kỳ `TBD`. Chưa chốt. Cao hơn Nấc 2.**

Gồm tất cả Nấc 2, cộng:

- Workspace studio: 1 workspace = 1 studio; job/tx có `workspaceId` thì thuộc studio, không có thì là job cá nhân; 1 user = 1 workspace + dữ liệu cá nhân ở v1.
- 4 vai trò **Chủ / Quản lý / Photographer / Xem** (bộ này là chốt của thiết kế CloudKit; bộ của prototype là Chủ / Photographer / Hậu kỳ / Kế toán — nếu Việt muốn giữ bộ prototype thì đổi trước khi code, xem CLOUDKIT-PLAN.md §5.2 và §8.3).
- Mời thành viên bằng mã mời 1 lần, hết hạn 7 ngày (hết hạn thì chủ tạo mã mới).
- Nhật ký hoạt động: ai làm gì, khi nào (tối đa 500 dòng/workspace); không ghi số tiền chi tiết, tên khách đầy đủ, nội dung ghi chú job; chỉ Chủ và Quản lý xem được log.
- Mọi vai trò đều xem được tiền studio (thu/chi/báo cáo); chỉ Chủ/Quản lý sửa tiền, sửa bảng giá, xuất sao lưu, xem log.

Không gồm ở v1 (theo CLOUDKIT-PLAN.md §5.4): chat trong app, giao việc qua app, chấm công, nhiều workspace cho 1 user, tự động chia tiền theo % cho thành viên.

## 5. Những gì cần Việt chốt trước khi bật IAP

| # | Cần Việt chốt | Vì sao chưa làm được nếu chưa chốt |
|---|---|---|
| 1 | **Giá Nấc 2** (bao nhiêu) | Không có giá thì không cấu hình IAP / StoreKit được, không ghi được vào App Store Listing |
| 2 | **Chu kỳ Nấc 2** (theo tháng / theo năm / mua 1 lần) | Đổi loại IAP (auto-renewable subscription hay 1 lần mua) và đổi màn giá trong app |
| 3 | **Giá Nấc 3** (bao nhiêu, cao hơn Nấc 2 bao nhiêu) | Như #1, cho Nấc 3 |
| 4 | **Chu kỳ Nấc 3** (theo tháng / theo năm / mua 1 lần; tính theo workspace hay theo thành viên) | Đổi loại IAP và cách tính tiền nhóm |
| 5 | **Có dùng thử miễn phí không?** (vd: Nấc 2 dùng thử 7/14 ngày) | Đổi cấu hình IAP (introductory offer) và màn giá |
| 6 | **Bộ vai trò Nấc 3:** giữ Chủ / Quản lý / Photographer / Xem hay giữ bộ prototype (Chủ / Photographer / Hậu kỳ / Kế toán)? | Code quyền + UI mời thành viên phụ thuộc bộ này (CLOUDKIT-PLAN.md §8.3) |

Không cần chốt để viết bản nháp này, nhưng **cần chốt cả 6 điểm trên trước khi cấu hình IAP thật** — đặc biệt là #1–#4 (giá + chu kỳ), vì không có giá thì không cấu hình StoreKit được.

## 6. Điều kiện chuyển bước

1. Việt chốt giá + chu kỳ Nấc 2/3 (mục 5, ít nhất #1–#4) → điền số thật vào bảng §1 thay cho `TBD`.
2. App ID `com.fotobro.app` + container `iCloud.com.fotobro.app` đã tạo (Việt tự làm trên Apple Developer, xem CLOUDKIT-PLAN.md §7.1–7.2) và Nấc 2 đã code xong theo thứ tự §2.2 (sao lưu mã hoá trước, sync từng record sau).
3. Cấu hình IAP / StoreKit trong App Store Connect với đúng giá + chu kỳ đã chốt; màn giá trong app chỉ hiện sau bước này.
4. Test trên TestFlight: mua thử (sandbox), hết hạn quay về Nấc 1 mà dữ liệu local còn nguyên, chỉ tắt đồng bộ/team.

## 7. Trạng thái

- **Bản nháp xong.** Chỉ 1 file mới (`PRICING-DRAFT.md`), không sửa file nào khác, không sửa code, không tạo tài khoản, không bật IAP.
- Mọi ô giá đều là `TBD` — không có giá bịa nào trong file này, trong code hay trong App Store Listing.
- Còn chờ Việt: chốt giá + chu kỳ Nấc 2/3 (mục 5) trước khi bật IAP.
