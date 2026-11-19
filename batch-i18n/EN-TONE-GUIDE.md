# FotoBro iOS v1 — English Tone Guide (EN-TONE-GUIDE)

- File: `~/workspace/fotobro-ios-v1/batch-i18n/EN-TONE-GUIDE.md` (chỉ tài liệu, không sửa code)
- Viết ngày 20/11/2026, đối chiếu với `www/index.html` (341.754 byte — từ điển EN ở dòng 951: `Today`, `Shoots`, `Money`, `Studio`, `Assistant`, `Hello`, `Good morning / Good afternoon / Good evening`, `To remember today`, `Ask assistant`, `no date yet`), `I18N-STRINGS.md` (80 chuỗi v1), `EN-AUDIT.md` (20/11/2026) và `VI-TONE-GUIDE.md` (bản đối tác tiếng Việt)
- Vai trò: tài liệu này quy định **cách viết tiếng Anh**; `I18N-STRINGS.md` là **danh mục chuỗi**, `EN-AUDIT.md` là **rà soát từng chuỗi EN đã có**, `MESSAGE-TEMPLATES.md` là **nội dung mẫu gửi khách**. Khi mâu thuẫn về *câu chữ viết thế nào*, theo tài liệu này; khi mâu thuẫn về *chuỗi nào tồn tại*, theo `I18N-STRINGS.md`; khi mâu thuẫn về *chính tả / thuật ngữ đã chốt trong audit*, theo `EN-AUDIT.md`.
- Phạm vi: mọi chuỗi tiếng Anh trong app v1 — giao diện, thông báo, lỗi, nhắc việc, nhắc tiền. Không áp dụng cho bản tiếng Việt (bản Việt theo `VI-TONE-GUIDE.md`: ấm, có hạt cảm thán nhẹ `nè / nha`).

## 1. Nguyên tắc chung — 5 điều

1. **Short first.** One sentence, one idea. The user reads on a phone, in the middle of a shoot.
2. **Plain, professional English — not legal English, not chat slang.** FotoBro is a competent studio assistant, not a corporation and not a buddy texting.
3. **Never blame the user.** An error says what did not happen + what to do next. It never says the user did something wrong.
4. **One voice, everywhere.** The same thing always uses the same word (see §5 and §6).
5. **Money is sensitive — state the fact, pair it with value.** Never demand payment bare; a money reminder always travels with what the client gets (see §7).

## 2. Xưng hô — you / we

| Who speaks to whom | Subject | Address | Example |
|---|---|---|---|
| App → photographer (app user) | FotoBro / we (rare) | you | `Hello {name}!` |
| Photographer → client (in message/email templates) | I | you | `Hi {name}, this is {studio}.` |
| App → client | — | — | The app never speaks to the client directly; everything sent to a client goes through a template in `MESSAGE-TEMPLATES.md` |

Rules:

- **Default to `you` + imperative.** `Save the deposit`, `Add to iPhone Calendar`, `Check today's shoots`. The imperative is shorter than `You can…` and is the normal iOS voice.
- **Use `we` only when the app is doing something on the user's behalf.** Example: `We'll remind you before the shoot.` Do not use `we` to soften a demand for money (`We need you to pay` — no).
- **Never use `I` for the app.** The app is not a person. `I` belongs to the photographer, only inside templates sent to clients.
- **Never use `sir / madam / dear / guys / folks`.** No honorifics, no group slang.
- **Never call the user a `customer` / `client`.** The user is the photographer — the studio owner. `Client` means *their* client, the person being photographed.
- **Greet by name when the name is known:** `Hello {name}!` (string `today.greeting`, I18N #11). Time-of-day greetings already in code (line 951): `Good morning`, `Good afternoon`, `Good evening`. When no name is known, use `Hello!` only — never `Welcome to FotoBro!` and never `Welcome back!` on every open.
- **In templates sent to clients, `I` is the photographer and `you` is the client.** Do not mix the two voices: a sentence the client will read must never sound like the app speaking.

## 3. Mức độ thân thiện và chuyên nghiệp

The standard FotoBro English voice: **warm, calm, professional — like a good studio assistant talking to the studio owner. Not a receptionist, not a close friend texting.**

- **Friendly, not familiar.** Warmth comes from short, clear, helpful sentences — not from jokes, slang, or exclamation marks. There is no English equivalent of the Vietnamese particles `nè / nha / nhé`: do **not** invent one (`Hey!`, `Yay!`, `No worries!` are all out).
- **Professional, not stiff.** Use everyday words. Avoid `Kindly`, `Please be advised`, `Please note that`, `Dear valued client`, `As per`, `Hereby`, `Should you require`.
- **`Please` — sparingly.** Use it only when asking the user to do something outside the app (a permission, a sign-in, a system step), e.g. `Please allow microphone access to use voice input.` Never use `Please` on ordinary buttons or toasts (`Please save` — no; `Save` is enough). Never use it in a money reminder.
- **`Sorry` — almost never.** One `Sorry` is allowed only for data loss or a failed save that loses the user's work. Never `Sorry!` for a routine hiccup (no network, no speech heard) — say what happened and what to do instead.
- **No `Oops!`, no `Uh-oh`, no `Whoops`.** A cute error message in a work tool reads as careless, especially next to a client's money.
- **Exclamation marks:** at most **1 per screen**, only for good news (deposit received, photos delivered, `Hello {name}!`). Ordinary confirmations (`Saved`, `Deleted`) have no exclamation mark.
- **Contractions are fine** (`don't`, `can't`, `you're`) — they keep sentences short and natural. But never contract in a formal client email subject line; the template itself decides that.
- **Sentence case for sentences, Title Case only where iOS does it.** Button and tab labels follow the existing strings (`Save`, `Cancel`, `Add income`, `Sign in with Google`). Do not switch a label to ALL CAPS or to Title Case mid-sentence (`Save` on a button, but `saved` inside a sentence).

## 4. Câu ngắn — quy tắc độ dài

- **Buttons:** 1–3 words. Verb first. Examples: `Save`, `Cancel`, `Add income`, `Finish this step`, `Add to iPhone Calendar` (the one long exception — it is a system action and already in I18N #75).
- **Toasts / confirmations:** at most **6 words**. Examples: `Saved`, `Deleted`, `Deposit saved`, `Logo saved`.
- **Empty states / reminders:** at most **12 words**. Examples: `A quiet day today`, `No jobs yet`, `No transactions yet`.
- **Error guidance:** at most **15 words**, in two parts: *what did not happen* + *what to do next*. Example: `Couldn't hear you — tap the mic and try again.`
- **No compound sentences with 2–3 subordinate clauses.** If a sentence needs `because`, `however`, `therefore`, or `although`, split it in two or drop the subordinate clause.
- **No abbreviations that can confuse.** `Delivery deadline`, not `Deadline`; `Deposit`, not `Dep.`; `Post-production`, not `Post-prod.` in UI text. (`AM / PM` and `USD / VND` are fine.)

## 5. Chính tả và định dạng — en-US, thống nhất

Per `EN-AUDIT.md` §2.1, the whole app uses **American English (en-US)**, not British English — the app sells in USD, runs on iPhone, and signs in with Google.

| Dùng | Không dùng |
|---|---|
| `color` | `colour` |
| `Canceled` (I18N #46) | `Cancelled` |
| `organize`, `customize` (`-ize`) | `organise`, `customise` (`-ise`) |
| `check` (verb) / `check` (noun) | `cheque` (never, in any sense) |
| `12-hour clock` with AM/PM in UI times | 24-hour clock in English UI (Vietnamese UI may differ) |

- **Dates:** US order in English UI — `Nov 20, 2026`, never `20 Nov 2026` and never `20/11/2026` in an English sentence (a compact `11/20` is acceptable only inside a tight calendar cell).
- **Money:** display only, never convert the rate (per `I18N-STRINGS.md`): VND `1.000.000₫` (vi-VN grouping), USD `$1,000.00` (en-US). In English text, write the amount the same way the UI formats it — do not retype `1000000 VND` in a sentence.
- **Placeholders:** `{name}` and `{stage}` keep their exact names — never translate a placeholder.
- **Proper names:** `FotoBro` is never translated. Department names stay Vietnamese with an English gloss (`Sen (Lotus) — Client welcome`, I18N #55–#60) — never translate `Sen` into `Lotus` alone and drop the Vietnamese name. Shoot types stay as in code: `Portrait`, `Couple`, `Wedding`, `Lookbook`, `Event`.

## 6. Từ nên dùng và từ tránh dùng

| Việc / khái niệm | Nên dùng | Tránh dùng | Vì sao |
|---|---|---|---|
| Đơn vị công việc đi qua pipeline 8 bước (khách + tiền + deadline) | `Job` | `Shoot` (cho nghĩa này), `Booking`, `Order` | Per `EN-AUDIT.md` §2.2: một thực thể, một tên. `No jobs yet`, `Job stuck at {stage}` đã đúng |
| Buổi chụp cụ thể (ngày, giờ, loại, chất liệu) | `Shoot` | `Job` (cho nghĩa này), `Session` | `Shoot type / Shoot date / Shoot time` (I18N #17–#19) đúng là thuộc tính của buổi chụp |
| Tiền giữ lịch | `Deposit` | `Down payment`, `Advance`, `Booking fee` | Ngắn, đúng từ thợ ảnh dùng; đã nhất quán ở #25/#37 |
| Tiền khách chưa trả | `Balance due` | `Debt`, `You owe`, `Outstanding`, `Unpaid debt` | `Debt` nghe như đòi nợ; `Balance due` trung tính, đã dùng trong code v1 (I18N #27) |
| Tiền đã thu | `Collected` | `Received` (cho tiền job), `Got` | `Collected` (I18N #26) phân biệt với tiền mới `Add income` |
| Hạn giao ảnh | `Delivery deadline` | `Deadline` (đứng một mình), `Due date` (cho ảnh) | Rõ nghĩa, tránh lẫn với hạn trả tiền |
| Hậu kỳ | `Post-production` | `Editing` (cho cả giai đoạn), `Retouch` (cho cả giai đoạn) | `Post-production` dùng chung cho stage #41 và phòng Mây #57 — cùng một việc |
| Bước pipeline | Dạng danh từ / trạng thái (per `EN-AUDIT.md` §2.3): `Consultation`, `Deposit paid`, `Shoot done`, `Photo selection`, `Post-production`, `Delivered`, `Done` | Trộn lẫn động từ đang diễn ra (`Selecting photos`) với quá khứ phân từ (`Shot`) trong cùng một dãy | Các bước là nhãn + chip + chèn vào `{stage}` ở #80, nên phải song song về ngữ pháp |
| Tab phòng ban | `Departments` (I18N #5) | — | Lưu ý: code v1 dòng 951 đang dùng `Studio` cho tab này. Giữ `Departments` theo I18N; việc đổi code chờ Việt chốt (xem §9) |
| Khách chụp | `Client` | `Customer` (trong ngữ cảnh chụp ảnh) | `Client` là từ studio ảnh dùng; `Customer` nghe như bán lẻ |
| Lưu / xoá | `Save` / `Delete` | `Store`, `Remove` (cho xoá hẳn) | `Delete` là xoá hẳn; `Remove` chỉ dùng khi gỡ khỏi một danh sách mà dữ liệu vẫn còn |
| Đăng nhập Google | `Sign in with Google` | `Login with Google`, `Connect Google`, `Log in` | Đúng nhãn chuẩn của Google; `Sign in` (2 từ) khác `Sign-in` (tính từ) |

## 7. Ví dụ đúng / sai

### 7.1. Thông báo (toast)

| Tình huống | ✅ Đúng | ❌ Sai | Vì sao sai |
|---|---|---|---|
| Lưu xong | `Saved` | `Saved successfully!` | `successfully` thừa; dấu `!` không cần cho tin thường |
| Xoá xong | `Deleted` | `Deleted successfully.` | Như trên |
| Nhận cọc | `Deposit saved` | `Yay! Deposit received!!!` | `Yay`, 3 dấu `!` — giọng bạn thân, không phải trợ lý |
| Lưu logo | `Logo saved` | `Your studio logo has been saved successfully.` | Dài, thừa `successfully`; toast tối đa 6 từ |
| Ngày trống | `A quiet day today` | `You have no shoots scheduled for today.` | Dài, giọng báo cáo; chuỗi I18N #12 đã đúng |
| Chưa có job | `No jobs yet` | `You don't have any jobs yet, add one now!` | Toast/empty state không ra lệnh; `yet` đã đủ thân thiện |

### 7.2. Nút bấm

| Tình huống | ✅ Đúng | ❌ Sai | Vì sao sai |
|---|---|---|---|
| Lưu | `Save` | `Please save` | Nút không cần `Please` |
| Huỷ | `Cancel` | `Cancel this` | Thừa từ; `Cancel` đã đủ trong ngữ cảnh |
| Xong một bước pipeline | `Finish this step` | `Complete this stage now` | `stage` lẫn với `step` (I18N #44–#45 dùng `step`); `now` gây áp lực |
| Ghi thu / ghi chi | `Add income` / `Add expense` | `Record income` / `Record an expense` | `Add` nhất quán với nút `Add to iPhone Calendar`; `Record` dài và trang trọng hơn |
| Nhập lịch iPhone | `Import from iPhone Calendar` | `Import calendar` | Mơ hồ: nhập từ đâu? Tên đầy đủ đã có ở I18N #76 |
| Đăng nhập Google | `Sign in with Google` | `Login with Google` | Không phải nhãn chuẩn của Google |
| Khôi phục mẫu gốc | `Restore original templates` | `Reset templates to default` | `Reset` nghe như xoá hết; `Restore original` nói rõ là về bản gốc |

### 7.3. Lỗi — mẫu chung: *việc chưa xong* + *làm gì tiếp*, không đổ lỗi

| Tình huống | ✅ Đúng | ❌ Sai | Vì sao sai |
|---|---|---|---|
| Không nghe rõ giọng nói | `Couldn't hear you — tap the mic and try again.` | `You didn't speak clearly. Try again.` | Đổ lỗi cho người dùng (`You didn't…`) |
| Chưa cấp quyền micro | `Microphone access is off — turn it on in Settings to use voice input.` | `Error: Microphone permission denied.` | `Error:` + `denied` nghe như hệ thống kết tội; không chỉ cách sửa |
| Mất mạng khi tải lịch | `You're offline — showing your last saved calendar.` | `Failed to load calendar. Check your connection!` | `Failed` + dấu `!` gây căng thẳng; câu đúng nói rõ app vẫn có dữ liệu cũ cho dùng |
| Kết nối Google hết hạn | `Your Google connection expired — sign in again to keep syncing.` | `Invalid Google token. Please re-authenticate.` | `Invalid token`, `re-authenticate` là từ kỹ thuật, người dùng không cần biết |
| Không lưu được | `Couldn't save — check your connection and try again.` | `Save failed. Something went wrong.` | `Something went wrong` không cho biết làm gì tiếp; `failed` đổ lỗi mơ hồ |
| Ảnh logo đọc không được | `Couldn't read that image — try another file.` | `Invalid image file!` | `Invalid` + `!`: vừa kỹ thuật vừa gắt |
| Chưa đặt giá film | `Film price isn't set for {type} yet — add it in Settings → Film price list.` | `You forgot to set the film price!` | `You forgot` đổ lỗi trực tiếp |

Quy tắc lỗi:

- **Không bắt đầu bằng `Error:` / `Failed` / `Invalid`.** Bắt đầu bằng việc chưa xong: `Couldn't save…`, `Couldn't hear you…`, `You're offline…`.
- **Không dùng `must` / `you have to` với người dùng.** Nói việc cần làm, không ra lệnh: `Sign in again to keep syncing`, không phải `You must sign in again`.
- **Một lỗi, một cách sửa.** Nếu có 2 cách sửa, chọn cách ngắn nhất; cách còn lại để vào màn hình chi tiết, không nhét vào toast.
- **Lỗi nghiêm trọng (mất dữ liệu, không lưu được, lỗi bảo mật): viết câu đầy đủ, bình tĩnh, không dấu `!`, không `Oops`, không `Sorry!`.** Chỉ dùng `Sorry` khi công việc của người dùng đã mất thật.

### 7.4. Nhắc tiền — nói kèm giá trị, không đòi trần trụi

| Tình huống | ✅ Đúng | ❌ Sai | Vì sao sai |
|---|---|---|---|
| Nhắc cọc trước buổi chụp | `Deposit due before your shoot on {date} — {amount}. Your date is held once it's paid.` | `Pay your deposit now or lose your booking!` | Đe doạ mất lịch; `Pay now` trần trụi |
| Nhắc số còn thiếu sau khi giao ảnh | `Your photos are ready — balance due {amount}.` | `You still owe {amount}. Pay now.` | `You owe` + `Pay now` nghe như đòi nợ |
| Job còn thiếu tiền mà đã xong | `This job is done, but {amount} is still due.` | `Done, but the client hasn't paid {amount} yet!` | `hasn't paid` đổ lỗi cho khách trong câu app nói với nhiếp ảnh gia; nói số tiền, không phán xét ai |
| Job kẹt ở một bước | `Job stuck at {stage}` | `This job has been stuck at {stage} for too long!` | `too long` phán xét; chuỗi I18N #80 đã đúng dạng ngắn |
| Báo cáo tháng | `Profit this month: {amount}` | `You made {amount} profit this month!` | Câu đúng là nhãn báo cáo, không cần `You made` + `!` |
| Tiền cọc theo % | `Deposit ({pct}%): {amount}` | `Deposit required: {amount} ({pct}% of total)` | `required` gây áp lực; công thức ngắn đã đủ rõ trong máy tính giá |

Quy tắc nhắc tiền:

- **Luôn có số tiền cụ thể hoặc ngày cụ thể.** Không nhắc tiền chung chung (`Balance due` đứng một mình trong một tin nhắc là chưa đủ — phải có `{amount}` hoặc `{date}`).
- **Nhắc tiền đi kèm giá trị đã giao / sẽ giao:** ảnh đã sẵn sàng, lịch đã giữ, buổi chụp đã chốt. Không bao giờ gửi một câu chỉ có số tiền.
- **Không dùng `overdue` cho tiền.** `Overdue` chỉ dùng cho `Delivery deadline` đã qua ngày (ảnh giao trễ), không dùng cho tiền chưa trả.
- **Không dùng `debt / owe / outstanding / unpaid` trong câu nhắc.** Chỉ dùng `Balance due` / `Deposit due` / `still due`.

## 8. Checklist nhanh cho người dịch / người soát chuỗi mới

1. Câu có ≤ 6 từ (toast), ≤ 12 từ (empty state), ≤ 15 từ (lỗi kèm cách sửa) không?
2. Có phải en-US không (`color`, `Canceled`, `-ize`)?
3. Đúng thuật ngữ chưa: `Job` = đơn vị công việc, `Shoot` = buổi chụp, `Deposit`, `Balance due`, `Delivery deadline`?
4. Có từ nào trong cột "Tránh dùng" ở §6 không?
5. Lỗi có nói *việc chưa xong + làm gì tiếp* mà không đổ lỗi (`You didn't…`, `You forgot…`, `Invalid…`) không?
6. Câu nhắc tiền có kèm số tiền / ngày / giá trị đã giao không?
7. Placeholder `{name}` / `{stage}` còn nguyên tên không? Tên `FotoBro` và tên phòng ban (`Sen`, `Nang`…) còn nguyên không?
8. Có quá 1 dấu `!` trên cùng một màn hình không? Có `Please` / `Sorry` / `Oops` thừa không?

## 9. Vấn đề còn tồn tại (không tự quyết — chờ Việt / chờ nối i18n)

- **Tab phòng ban: `Studio` (code, dòng 951) hay `Departments` (I18N #5)?** Hướng dẫn này theo I18N (`Departments`); nếu Việt chốt giữ `Studio` thì sửa I18N #5 và §6, không sửa ngược hướng dẫn này lẻ tẻ.
- **Pipeline 8 bước:** `EN-AUDIT.md` §2.3 đề xuất chuẩn hoá về dạng danh từ (`Consultation`, `Deposit paid`, `Shoot done`, `Photo selection`). Hướng dẫn này theo đề xuất đó; nếu Việt muốn giữ dạng động từ thì phải đổi cả 8 bước, không đổi lẻ.
- **Chuỗi #80 `Job stuck at {stage}`:** dạng ngắn đã đúng theo §7.4; khi chèn tên bước dài (ví dụ `Post-production`) cần kiểm tra tràn UI trên chip — việc kiểm tra thuộc về bước nối i18n, không thuộc hướng dẫn giọng văn.
- **Mẫu tin nhắn/email gửi khách bằng tiếng Anh** chưa nằm trong 80 chuỗi v1 (`MESSAGE-TEMPLATES.md` là mẫu tiếng Việt); khi dịch mẫu sang tiếng Anh, áp dụng §2 (dòng `I / you`) và §7.4 của tài liệu này, không áp dụng giọng app→người dùng.
