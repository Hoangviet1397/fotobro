# FotoBro iOS v1.1 — Spec code: Sao lưu v2 mã hoá

> Trạng thái: **spec code, chưa viết vào app.**
> Nguồn duy nhất: `~/workspace/fotobro-ios-v1/BACKUP-V2.md`
> (thiết kế sao lưu v2, 20/11/2026) + hàm prototype đã kiểm chứng
> trong `~/workspace/fotobro-scale/src/fotobro-scale.js`
> (`buildBackup` / `parseBackup` / `encryptBackup` / `decryptBackup` /
> `backupStatus`, test 13/13 đạt, 19/11/2026).
> Mục tiêu triển khai: **v1.1**. Không sửa bất kỳ file app nào trong
> spec này. Không tạo tài khoản cloud. Nấc 1 local-first, miễn phí.
> Cùng một envelope mã hoá này sau này dùng lại cho Nấc 2 CloudKit
> (record `EncryptedBackup`, xem `CLOUDKIT-PLAN.md` §5).

## 0. Nguyên tắc bắt buộc

- Giữ nguyên key dữ liệu, không đổi key (đổi key là mất dữ liệu
  người dùng cũ, đặc biệt là Xèo):
  - `localStorage['troLyXeo.v1']`: `{jobs, txs, sample, uid, checkDone, cfg}`
    (`sample` không đưa vào file sao lưu — prototype không bao gồm nó).
  - IndexedDB `'troLyXeoPhotos'`, store `photos` (keyPath `id`),
    tối đa 60 ảnh. Ảnh lưu dạng `{id, blob, added}` trong app.
  - `localStorage['fotobro.lastBackupAt']`: ISO thời điểm xuất
    sao lưu thành công gần nhất.
- Dùng lại module prototype, không viết lại logic backup/crypto
  từ đầu. Chỉ viết mới phần tách ảnh > 25 MB (prototype chưa có).
- Dùng lại hàm nén `shrinkPhoto()` đã có trong base
  (`www/index.html`), **không viết hàm nén mới**.
- `appVersion` trong envelope v2 phải là `"1.0"`. Prototype để
  mặc định `"2.6"` — đó là số phiên bản web cũ, **không dùng**.
- Không ghi `support@fotobro.app` (placeholder, chưa có hộp mail
  thật) vào file sao lưu.
- Không tự động tải file nền, không tự gửi file đi đâu. Người dùng
  chủ động bấm tải và tự cất file (Files, Drive, gửi cho chính mình).
- Mật khẩu không lưu trong app, không lưu trong file sao lưu,
  không lưu trên server.

## 1. Hằng số

```js
var LS_KEY              = 'troLyXeo.v1';
var PHOTO_DB            = 'troLyXeoPhotos';   // store: 'photos', keyPath 'id'
var MAX_PHOTOS          = 60;
var BACKUP_FORMAT       = 2;                  // v2 = có ảnh + meta + checkDone + uid
var BACKUP_REMIND_DAYS  = 7;
var SPLIT_THRESHOLD     = 25 * 1024 * 1024;   // 25 MB = 26.214.400 byte
var PHOTO_TARGET_MAX    = 200 * 1024;         // ~200 KB / ảnh sau nén
var PHOTO_MAX_EDGE      = 1600;               // cạnh dài tối đa (px), JPEG vừa
var MIN_PASSWORD_LEN    = 8;
var MAX_WRONG_ATTEMPTS  = 5;                  // sai 5 lần liên tiếp -> khoá 60 s
var LOCKOUT_MS          = 60 * 1000;
var PBKDF2_ITERATIONS   = 100000;
var SALT_BYTES          = 16;
var IV_BYTES            = 12;                 // AES-GCM
```

## 2. Cấu trúc envelope

### 2.1 Envelope v2 thường (không mã hoá)

```json
{
  "format": "fotobro-backup",
  "version": 2,
  "app": "FotoBro",
  "appVersion": "1.0",
  "exportedAt": "2026-11-20T00:00:00.000Z",
  "counts": { "jobs": 12, "txs": 40, "photos": 6 },
  "jobs": [],
  "txs": [],
  "cfg": {},
  "checkDone": {},
  "uid": 123,
  "photos": [
    { "id": "p1", "dataUrl": "data:image/jpeg;base64,/9j/...", "addedAt": "2026-11-19T00:00:00.000Z" }
  ]
}
```

Quy tắc kiểm tra khi đọc:

- `format` phải đúng `"fotobro-backup"` và `version` phải đúng `2`.
  Sai một trong hai -> từ chối (xem §7, mã `invalid-backup`).
- `jobs` và `txs` phải là mảng, nếu không -> `invalid-backup`.
- `counts` chỉ để hiển thị trước khi khôi phục
  ("12 job, 40 khoản thu chi, 6 ảnh") và để kiểm tra đủ dữ liệu
  sau khi khôi phục. Số lượng thực tế lệch `counts` -> cảnh báo,
  không im lặng (xem `validateCounts`, §5).
- `photos[].dataUrl` là ảnh đã nén (§5.1). Mỗi ảnh giữ `id` gốc
  trong IndexedDB để khi khôi phục không tạo id mới.
- `appVersion` ghi phiên bản app lúc xuất (v1 là `"1.0"`).

### 2.2 Envelope v2 mã hoá (khi người dùng bật mã hoá)

Toàn bộ JSON v2 ở §2.1 được mã hoá thành envelope khác,
**trước khi** ghi ra file hay đẩy lên đâu:

```json
{
  "format": "fotobro-encrypted-backup",
  "version": 1,
  "kdf": "PBKDF2-SHA256-100k",
  "salt": "<base64, 16 byte>",
  "iv": "<base64, 12 byte>",
  "ciphertext": "<base64, AES-256-GCM của toàn bộ JSON v2>"
}
```

- KDF: PBKDF2-SHA256, **100.000 vòng**, salt ngẫu nhiên 16 byte
  (mỗi lần mã hoá một salt mới).
- Mã hoá: AES-256-GCM, iv ngẫu nhiên 12 byte (mỗi lần một iv mới).
- `salt` / `iv` / `ciphertext` đều base64. Salt/iv trong envelope
  là đủ để giải mã khi có đúng mật khẩu — không cần lưu thêm gì.

### 2.3 File ảnh tách riêng (chỉ khi > 25 MB, xem §5.2)

File chính khi tách:

```json
{
  "format": "fotobro-backup",
  "version": 2,
  "app": "FotoBro",
  "appVersion": "1.0",
  "exportedAt": "...",
  "counts": { "jobs": 12, "txs": 40, "photos": 6 },
  "jobs": [], "txs": [], "cfg": {}, "checkDone": {}, "uid": 123,
  "photos": [],
  "photosSplit": true,
  "photosFile": "fotobro-photos-YYYYMMDD.json"
}
```

File ảnh riêng:

```json
{
  "format": "fotobro-photos",
  "version": 1,
  "exportedAt": "...",
  "photos": [ { "id": "p1", "dataUrl": "data:image/jpeg;base64,...", "addedAt": "..." } ]
}
```

- `photosSplit: true` + `photosFile` chỉ xuất hiện khi tách.
  File chính không tách thì không có hai trường này.
- Nếu bật mã hoá: mã hoá **cả hai file** bằng cùng một mật khẩu
  (người dùng chỉ nhập mật khẩu một lần khi xuất, một lần khi
  khôi phục). Khi đó file ảnh cũng là envelope §2.2, và tên file
  ảnh thêm hậu tố `-encrypted` (xem §2.4).
- `counts.photos` trong file chính vẫn ghi tổng số ảnh thật
  (ví dụ 6), dù `photos: []` — để khi khôi phục thiếu file ảnh
  thì báo đúng số ảnh thiếu.

### 2.4 Tên file

| Trường hợp | Tên file |
|---|---|
| v2 thường, 1 file | `fotobro-backup-YYYYMMDD.json` (vd `fotobro-backup-20261120.json`) |
| v2 mã hoá, 1 file | `fotobro-backup-YYYYMMDD-encrypted.json` |
| Tách ảnh: file chính | `fotobro-backup-YYYYMMDD.json` |
| Tách ảnh: file ảnh | `fotobro-photos-YYYYMMDD.json` |
| Tách ảnh + mã hoá: file ảnh | `fotobro-photos-YYYYMMDD-encrypted.json` |

Không dùng tên cũ `tro-ly-xeo-sao-luu.json`. Ngày `YYYYMMDD`
là ngày xuất theo giờ máy. Tên file ảnh trong
`photosFile` phải khớp đúng tên file ảnh thực tế đã xuất
(kể cả hậu tố `-encrypted` khi mã hoá).

### 2.5 Tóm tắt các phiên bản file

| File | Nhận dạng | Đọc được? |
|---|---|---|
| v2 thường | `format=fotobro-backup`, `version=2` | Có — đủ dữ liệu |
| v2 mã hoá | `format=fotobro-encrypted-backup`, `version=1` | Có — sau khi nhập đúng mật khẩu |
| v1 cũ | `{jobs, txs, cfg}` (không có `format`) | Có — xem §6, nhưng **không có ảnh** |
| File ảnh riêng | `format=fotobro-photos`, `version=1` | Chỉ kèm file chính, đứng một mình thì không khôi phục được |
| File khác / JSON hỏng | — | Không — từ chối, không ghi đè dữ liệu hiện tại |

## 3. Danh sách hàm cần viết

Dùng lại từ prototype `fotobro-scale.js` (đã test 13/13 — nối
nguyên, chỉ đổi mặc định `appVersion` từ `"2.6"` thành `"1.0"`):

```js
// --- Dùng lại từ prototype (không viết lại logic) ---
buildBackup(state, photos, opts)
  // state: {jobs, txs, cfg, checkDone, uid} (đọc từ troLyXeo.v1)
  // photos: [{id, dataUrl, addedAt}] (đã nén, xem §5.1)
  // opts: {appVersion} — BẮT BUỘC truyền '1.0' khi nối vào app
  // -> trả về object envelope v2 thường (§2.1). Đồng bộ.

backupFileName(date)
  // date: Date (mặc định: new Date())
  // -> string 'fotobro-backup-YYYYMMDD.json'. Đồng bộ.

parseBackup(text)
  // text: string nội dung file
  // -> {kind: 'v2', jobs, txs, cfg, checkDone, uid, photos, exportedAt}
  //    | {kind: 'v1-legacy', jobs, txs, cfg, checkDone: {}, uid: 0,
  //       photos: [], exportedAt: null}
  // -> throw Error('invalid-json') | Error('invalid-backup') nếu không đọc được.
  // LƯU Ý: parseBackup KHÔNG xử lý envelope mã hoá (§2.2) — phải
  // giải mã trước bằng decryptBackup rồi mới đưa plaintext vào đây.

backupStatus(lastBackupAtIso, nowIso)
  // lastBackupAtIso: string ISO từ localStorage['fotobro.lastBackupAt']
  //   (null/'' nếu chưa từng sao lưu); nowIso: string ISO (mặc định: now)
  // -> {due: boolean, daysSince: number|null, messageKey: 'backup.remind'}
  // due = true khi chưa từng sao lưu, hoặc đã quá 7 ngày.

encryptBackup(passphrase, plaintext)
  // passphrase: string (mật khẩu người dùng, >= 8 ký tự, đã qua validatePassword)
  // plaintext: string JSON v2 (JSON.stringify của buildBackup)
  // -> Promise<envelope mã hoá §2.2>. Dùng WebCrypto (crypto.subtle).
  // -> Promise.reject(Error('no-webcrypto')) nếu không có WebCrypto.

decryptBackup(passphrase, envelope)
  // passphrase: string; envelope: object envelope mã hoá §2.2
  // -> Promise<string plaintext JSON v2>
  // -> Promise.reject(Error('wrong-password')) khi sai mật khẩu
  //    (mọi lỗi giải mã đều quy về 'wrong-password', không lộ lý do khác).
  // -> Promise.reject(Error('invalid-envelope')) nếu format không phải
  //    'fotobro-encrypted-backup'; Error('no-webcrypto') nếu thiếu WebCrypto.
```

Hàm nội bộ của crypto (dùng lại từ prototype, không đổi tham số):

```js
getSubtle()            // -> crypto.subtle | null
b64(buf)               // ArrayBuffer/Uint8Array -> string base64
unb64(s)               // string base64 -> Uint8Array (browser: atob)
deriveKey(passphrase, salt, subtle)
  // -> Promise<CryptoKey AES-GCM 256> qua PBKDF2-SHA256, 100.000 vòng
```

Hàm mới phải viết khi nối vào app (prototype chưa có):

```js
// --- Đọc dữ liệu local ---
readLocalState()
  // -> {jobs, txs, cfg, checkDone, uid} từ JSON.parse(localStorage[LS_KEY])
  //    (mảng/object thiếu thì mặc định [] / {} / 0). Đồng bộ.
  // Không bao gồm trường `sample`.

readAllPhotos()
  // -> Promise<[{id, blob, added}]> — toàn bộ ảnh trong IndexedDB
  //    'troLyXeoPhotos', store 'photos'. Chỉ ảnh đang còn trong app
  //    (ảnh đã xoá thì không có trong store, không đưa vào backup).

serializePhotos(photoRows)
  // photoRows: [{id, blob, added}] từ readAllPhotos()
  // -> Promise<[{id, dataUrl, addedAt}]>
  // Mỗi blob: nén lại bằng shrinkPhoto(blob) (dùng lại hàm base),
  // rồi đổi sang dataUrl (FileReader.readAsDataURL).
  // addedAt = new Date(added).toISOString().

// --- Kích thước + tách ảnh (§5) ---
measureBackupSize(backupObj)
  // backupObj: object envelope v2 -> số byte UTF-8 của JSON.stringify,
  // tính bằng new TextEncoder().encode(JSON.stringify(backupObj)).length.
  // Đồng bộ.

photosFileName(date)
  // date: Date (mặc định: new Date())
  // -> string 'fotobro-photos-YYYYMMDD.json'. Đồng bộ.
  // (Hàm mới — prototype chỉ có backupFileName cho file chính.)

buildPhotosFile(photos, opts)
  // photos: [{id, dataUrl, addedAt}]; opts: {appVersion} (không bắt buộc)
  // -> {format: 'fotobro-photos', version: 1, exportedAt: <ISO now>,
  //     photos} — envelope file ảnh §2.3. Đồng bộ.

parsePhotosFile(text)
  // text: string nội dung file ảnh
  // -> {photos: [{id, dataUrl, addedAt}], exportedAt}
  // -> throw Error('invalid-json') | Error('invalid-backup') nếu
  //    format !== 'fotobro-photos', version !== 1, hoặc photos không phải mảng.
  // LƯU Ý: nếu file ảnh được mã hoá thì giải mã trước bằng decryptBackup
  // rồi mới đưa plaintext vào đây (như parseBackup).

splitBackupIfNeeded(backupObj, photos)
  // backupObj: envelope v2 đầy đủ ảnh; photos: [{id, dataUrl, addedAt}]
  // -> {split: false, main: backupObj} nếu measureBackupSize <= 25 MB
  // -> {split: true, main, photosDoc} nếu > 25 MB, trong đó:
  //    main = backupObj với photos: [] + photosSplit: true +
  //           photosFile: <tên file ảnh thực tế, xem §2.4>
  //    photosDoc = buildPhotosFile(photos)
  // Đồng bộ. Chỉ tách khi vượt ngưỡng, không tách mặc định.

// --- Mật khẩu ---
validatePassword(passphrase, confirmPassphrase)
  // -> {ok: true} | {ok: false, error: 'too-short' | 'mismatch'}
  // 'too-short': dưới 8 ký tự -> không cho bật mã hoá, báo rõ lý do.
  // 'mismatch': nhập 2 lần không khớp (khi đặt mới).
  // Không ép kiểu ký tự phức tạp. Đồng bộ.

checkPasswordLockout()
  // -> {locked: boolean, waitSeconds: number}
  // Trạng thái khoá giữ trong biến module (số lần sai liên tiếp +
  // thời điểm hết khoá), reset về 0 khi nhập đúng một lần.
  // Sau 5 lần sai liên tiếp: khoá 60 giây rồi mới cho thử tiếp.
  // Đồng bộ. (Theo mẫu biến lockTries/lockUntil đã có trong app.)

recordWrongPassword()
  // Tăng số lần sai liên tiếp; nếu đủ 5 lần thì đặt thời điểm hết khoá
  // = now + 60 s. Đồng bộ. Gọi trong nhánh catch 'wrong-password'.

// --- Xuất / nhập / khôi phục (§4, §6) ---
exportBackup(opts)
  // opts: {encrypt: boolean, passphrase?: string, date?: Date}
  // -> Promise<{files: [{name, content}], counts, split: boolean,
  //             lastBackupAt: string}>
  // Luồng đầy đủ xem §4. Chỉ khi xuất thành công mới ghi
  // localStorage['fotobro.lastBackupAt']; xuất thất bại thì không ghi.
  // `files` có 1 phần tử (không tách) hoặc 2 phần tử (tách ảnh,
  // file chính trước, file ảnh sau). `content` là string JSON
  // (envelope thường hoặc envelope mã hoá, tuỳ opts.encrypt).

importBackup(fileText, opts)
  // fileText: string nội dung file người dùng chọn
  // opts: {passphrase?: string, onNeedPassword?: function}
  // -> Promise<{kind: 'v2'|'v1-legacy', jobs, txs, cfg, checkDone, uid,
  //             photos, exportedAt, counts, photosSplit, photosFile,
  //             needsPhotosFile: boolean}>
  // Chỉ PHÂN TÍCH + TRẢ VỀ BẢN XEM TRƯỚC, chưa ghi đè dữ liệu.
  // Phân biệt 4 loại file theo §2.5. File ảnh riêng chọn một mình
  // -> throw Error('photos-file-only').
  // Envelope mã hoá mà chưa có passphrase -> gọi onNeedPassword để
  // hỏi mật khẩu rồi thử lại; sai mật khẩu -> throw 'wrong-password'
  // (và gọi recordWrongPassword). Luồng đầy đủ xem §6.

restoreBackup(parsed, opts)
  // parsed: kết quả của importBackup (hoặc importBackup + file ảnh
  //   đã nhập thêm, xem §6 bước 5)
  // opts: {photosFromSplitFile?: [{id, dataUrl, addedAt}]}
  // -> Promise<{jobs, txs, photosRestored, photosMissing}>
  // Ghi đè toàn bộ dữ liệu hiện tại (thay thế, không gộp — xem §6).
  // TRƯỚC KHI ghi đè: gọi createSafetySnapshot() để lưu bản dự phòng.
  // Ngoại lệ duy nhất: kind 'v1-legacy' -> giữ uid/checkDone hiện tại.
  // Ảnh: ghi vào IndexedDB (ghi đè ảnh cùng id, thêm ảnh mới);
  //   dataUrl -> Blob trước khi ghi (idbPut nhận blob).
  // KHÔNG cập nhật fotobro.lastBackupAt ở đây (chỉ xuất mới cập nhật).

createSafetySnapshot()
  // -> lưu bản chụp dữ liệu hiện tại (state troLyXeo.v1 + danh sách
  //    id ảnh) vào bộ nhớ tạm trong app (biến module), để nếu khôi
  //    phục nhầm thì còn đường quay lại. Không ghi file, không ghi
  //    localStorage vĩnh viễn. Đồng bộ.
  // Gọi bắt buộc ở đầu restoreBackup, trước mọi ghi đè.

// --- Kiểm tra + nhắc sao lưu ---
validateCounts(parsed, restored)
  // parsed: kết quả importBackup (có counts/exportedAt);
  // restored: số lượng thực tế sau khôi phục {jobs, txs, photos}
  // -> {ok: boolean, mismatches: string[]} — lệch thì cảnh báo,
  //    không im lặng, không coi là lỗi chặn khôi phục. Đồng bộ.

updateLastBackupAt(iso)
  // Ghi localStorage['fotobro.lastBackupAt'] = iso (mặc định: now).
  // CHỈ gọi từ exportBackup khi xuất thành công. Không gọi từ
  // restoreBackup. Đồng bộ.

showBackupReminder()
  // Đọc backupStatus(localStorage['fotobro.lastBackupAt']) rồi hiện
  // banner / dòng nhắc trên màn Hôm nay khi due = true, không chặn
  // người dùng. Bấm "Sao lưu ngay" -> vào thẳng màn xuất (§4).
  // Bấm đóng banner -> ẩn tới lần nhắc sau (không tắt vĩnh viễn).
  // Đồng bộ (phần hiển thị theo UI app).
```

## 4. Luồng mã hoá / giải mã

### 4.1 Mã hoá (khi xuất, bật mã hoá)

```
plaintext = JSON.stringify(buildBackup(state, photos, {appVersion: '1.0'}))
  // hoặc JSON.stringify(main) / JSON.stringify(photosDoc) khi tách ảnh
salt = crypto.getRandomValues(new Uint8Array(16))   // mỗi lần một salt mới
iv   = crypto.getRandomValues(new Uint8Array(12))   // mỗi lần một iv mới
baseKey = subtle.importKey('raw', TextEncoder().encode(passphrase),
                           'PBKDF2', false, ['deriveKey'])
key = subtle.deriveKey({name: 'PBKDF2', salt, iterations: 100000,
                        hash: 'SHA-256'}, baseKey,
                       {name: 'AES-GCM', length: 256}, false,
                       ['encrypt', 'decrypt'])
ciphertext = subtle.encrypt({name: 'AES-GCM', iv}, key,
                            TextEncoder().encode(plaintext))
envelope = {format: 'fotobro-encrypted-backup', version: 1,
            kdf: 'PBKDF2-SHA256-100k',
            salt: b64(salt), iv: b64(iv), ciphertext: b64(ciphertext)}
fileContent = JSON.stringify(envelope)
```

- Thực hiện bằng `encryptBackup(passphrase, plaintext)` — không
  viết lại các bước trên ở nơi khác.
- Khi tách ảnh: gọi `encryptBackup` **riêng cho từng file**
  (file chính và file ảnh), cùng một `passphrase`, mỗi file một
  salt/iv ngẫu nhiên riêng. Người dùng chỉ nhập mật khẩu một lần
  khi xuất.
- Mật khẩu nhập 2 lần khi đặt mới (bật mã hoá lần đầu), kiểm tra
  bằng `validatePassword` trước khi mã hoá. Dưới 8 ký tự thì
  không cho bật mã hoá.
- Khi bật lần đầu, giải thích 1 dòng: "Bật mã hoá thì chỉ người
  có mật khẩu mới mở được file này."
- Mặc định tắt mã hoá (đỡ rào cản người mới). Bản không mã hoá
  vẫn được phép.

### 4.2 Giải mã (khi nhập file mã hoá)

```
envelope = JSON.parse(fileText)
if (envelope.format !== 'fotobro-encrypted-backup') -> Error('invalid-envelope')
salt = unb64(envelope.salt); iv = unb64(envelope.iv); ct = unb64(envelope.ciphertext)
key = deriveKey(passphrase, salt, subtle)   // PBKDF2-SHA256, 100.000 vòng
plaintext = TextDecoder().decode(
              subtle.decrypt({name: 'AES-GCM', iv}, key, ct))
  // mọi lỗi ở bước decrypt đều -> Error('wrong-password')
parsed = parseBackup(plaintext)  // hoặc parsePhotosFile(plaintext) cho file ảnh
```

- Thực hiện bằng `decryptBackup(passphrase, envelope)` — không
  viết lại các bước trên ở nơi khác.
- Sai mật khẩu -> báo đúng một câu: **"Sai mật khẩu sao lưu."**
  Không gợi ý mật khẩu, không thử lại tự động quá 5 lần liên tiếp
  (sau 5 lần sai, khoá 60 giây rồi mới cho thử tiếp — xem
  `checkPasswordLockout` / `recordWrongPassword`).
- Nhập đúng một lần -> reset số lần sai về 0.
- **Không có "quên mật khẩu":** mất mật khẩu = mất bản sao lưu
  mã hoá đó, không có đường khôi phục (mặc định đề xuất — xem
  §9, câu 1, CHƯA CHỐT).

## 5. Luồng xuất file (exportBackup)

```
1. Đọc state = readLocalState()                       // troLyXeo.v1
2. Đọc photoRows = await readAllPhotos()             // IndexedDB, tối đa 60
3. photos = await serializePhotos(photoRows)         // shrinkPhoto() + dataUrl
4. backupObj = buildBackup(state, photos, {appVersion: '1.0'})
5. Đo kích thước: size = measureBackupSize(backupObj)
   - size <= 25 MB:
       files = [{name: backupFileName(date), content: <xem bước 6>}]
       split = false
   - size > 25 MB:
       {main, photosDoc} = splitBackupIfNeeded(backupObj, photos)
       files = [{name: backupFileName(date), content: main},
                {name: photosFileName(date), content: photosDoc}]
       split = true
       Hiện cảnh báo TRƯỚC KHI tải:
       "Bản sao lưu này nặng hơn 25 MB nên tách ảnh ra file riêng.
        Cần giữ cả 2 file mới khôi phục đủ ảnh."
6. Nếu opts.encrypt:
     - Hỏi mật khẩu (nhập 2 lần khi đặt mới) + validatePassword.
     - content từng file = JSON.stringify(
         await encryptBackup(passphrase, JSON.stringify(<nội dung file>)))
     - Đổi tên file: thêm hậu tố '-encrypted' trước '.json'
       (vd fotobro-backup-20261120-encrypted.json;
        fotobro-photos-20261120-encrypted.json).
     - Khi tách: mã hoá cả 2 file, cùng mật khẩu, salt/iv riêng từng file.
   Nếu không mã hoá: content = JSON.stringify(<nội dung file>).
7. Đưa file cho người dùng tải (1 file, hoặc 2 file khi tách).
   CHỈ khi tải/xuất thành công mới gọi updateLastBackupAt(now).
   Xuất thất bại giữa chừng thì không cập nhật — lần sau vẫn nhắc.
8. Hiện xác nhận:
   - Không tách: "Đã sao lưu xong — 12 job, 40 khoản thu chi, 6 ảnh"
     (số thật từ counts).
   - Có tách: "...không kèm ảnh, xem file ảnh riêng"
     (ghi rõ số ảnh nằm ở file riêng).
```

### 5.1 Nén ảnh trước khi đưa vào backup (bắt buộc)

- Dùng lại `shrinkPhoto()` đã có trong base. Mục tiêu sau nén:
  mỗi ảnh tối đa ~200 KB (JPEG chất lượng vừa, cạnh dài tối đa
  1600px). 60 ảnh tối đa ≈ 12 MB — vừa trong 1 file.
- Không đưa ảnh gốc chưa nén vào backup.
- Nếu sau nén vẫn > 25 MB (ảnh nhiều hoặc nén không xuống được)
  -> chuyển sang §5.2, không cố nhét.
- Ảnh đã xoá trong app thì không đưa vào backup.
- Tối đa 60 ảnh trong app (giữ nguyên giới hạn cũ). Vượt 60 thì
  app đã không cho thêm từ trước — sao lưu không phải nơi để
  nới giới hạn này.

### 5.2 Tách file khi > 25 MB

- Ngưỡng 25 MB là ngưỡng của thiết kế (theo brief). Lý do: file
  JSON quá nặng dễ làm iPhone đơ khi mở, dễ lỗi khi gửi qua mail /
  chat, và nhiều dịch vụ chặn file đính kèm lớn.
- Xuất **2 file** cùng lúc, cùng ngày, cùng tiền tố tên (§2.4).
- File chính: đủ jobs/txs/cfg/checkDone/uid, `photos: []`,
  thêm `"photosSplit": true` + `"photosFile": "<tên file ảnh>"`.
- File ảnh: chỉ chứa ảnh (§2.3).
- Khôi phục thiếu file ảnh thì vẫn khôi phục được jobs/txs/cfg,
  nhưng báo rõ số ảnh thiếu (xem §6 bước 5).

## 6. Luồng nhập file / khôi phục (importBackup + restoreBackup)

```
1. Người dùng vào Cài đặt -> Sao lưu -> "Mở bản sao lưu", chọn file.
2. Đọc fileText. Phân biệt loại file (theo thứ tự):
   a. JSON hỏng / không phải JSON
      -> throw Error('invalid-json'); báo:
         "File này không giống bản sao lưu của FotoBro."
         Không ghi đè gì.
   b. Envelope mã hoá (format = 'fotobro-encrypted-backup')
      -> kiểm tra checkPasswordLockout(); nếu đang khoá thì báo
         thời gian chờ, không cho thử.
      -> hỏi mật khẩu; plaintext = await decryptBackup(passphrase, envelope)
      -> sai mật khẩu: recordWrongPassword(); báo "Sai mật khẩu sao lưu."
         Dừng, không ghi đè dữ liệu hiện tại.
      -> đúng mật khẩu: reset số lần sai về 0; đưa plaintext vào bước (c).
   c. Envelope v2 thường (format = 'fotobro-backup', version = 2)
      -> parsed = parseBackup(plaintext)
   d. File v1 cũ {jobs, txs, cfg} (không có format)
      -> parsed = parseBackup(text) trả về {kind: 'v1-legacy', ...}
         Báo rõ TRƯỚC KHI khôi phục:
         "Đây là bản sao lưu cũ, không có ảnh. Khôi phục xong ảnh
          trang chủ vẫn trống."
   e. File ảnh riêng (format = 'fotobro-photos') được chọn MỘT MÌNH
      -> throw Error('photos-file-only'); báo:
         "Đây chỉ là file ảnh kèm theo, cần chọn file sao lưu chính trước."
         Không khôi phục.
   f. File khác (JSON đúng nhưng không khớp dạng nào)
      -> throw Error('invalid-backup'); báo như (a).
3. Hiện bản xem trước: số job, số khoản thu chi, số ảnh, ngày xuất
   (exportedAt), phiên bản app lúc xuất (appVersion). Người dùng
   xác nhận mới khôi phục.
4. Khôi phục là THAY THẾ TOÀN BỘ (mặc định — xem §9, câu 3,
   CHƯA CHỐT):
   - restoreBackup(parsed) ghi đè jobs/txs/cfg/checkDone/uid/photos.
   - TRƯỚC KHI ghi đè: createSafetySnapshot() lưu bản dự phòng
     của dữ liệu hiện tại vào bộ nhớ tạm trong app.
   - Báo rõ: "Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại.
     Đã lưu bản dự phòng."
   - Ngoại lệ duy nhất: file v1 cũ không có uid/checkDone ->
     giữ uid/checkDone hiện tại, không ghi đè bằng 0/rỗng.
5. Ảnh tách riêng (parsed.photosSplit === true):
   - Hỏi tiếp file ảnh (tên gợi ý: parsed.photosFile).
   - Có file ảnh: nếu mã hoá thì giải mã bằng CÙNG mật khẩu đã nhập
     ở bước 2 (không hỏi lại); parsed2 = parsePhotosFile(plaintext);
     gộp photos từ file ảnh vào restoreBackup qua
     opts.photosFromSplitFile; kiểm tra số ảnh khớp counts.photos.
   - Không có file ảnh: vẫn khôi phục jobs/txs/cfg, nhưng báo rõ:
     "Đã khôi phục job và tiền, thiếu 6 ảnh (chưa chọn file ảnh riêng)"
     (số thật từ counts.photos) — không im lặng, không báo thành
     công giả.
   - Ghi ảnh vào IndexedDB troLyXeoPhotos: ghi đè ảnh cùng id,
     thêm ảnh mới. dataUrl trong file -> Blob trước khi ghi.
6. Kiểm tra sau khôi phục: validateCounts(parsed, restored).
   Lệch counts -> cảnh báo, không im lặng.
7. Hiện xác nhận: "Đã khôi phục xong — 12 job, 40 khoản thu chi,
   6 ảnh" (hoặc ghi rõ số ảnh thiếu nếu có).
8. KHÔNG cập nhật fotobro.lastBackupAt khi khôi phục.
   lastBackupAt chỉ ghi lúc XUẤT sao lưu thành công (§5 bước 7).
   Khôi phục xong nên nhắc người dùng xuất một bản mới ngay để có
   bản sao lưu của trạng thái vừa khôi phục.
```

An toàn dữ liệu: mọi lỗi ở bước 2–3 đều dừng **trước khi** ghi đè.
Không bao giờ xoá dữ liệu hiện tại chỉ vì đọc file lỗi.

## 7. Xử lý lỗi

| Mã lỗi / tình huống | Khi nào | Hành vi |
|---|---|---|
| `invalid-json` | File không phải JSON | Từ chối. Báo "File này không giống bản sao lưu của FotoBro." Không ghi đè gì. |
| `invalid-backup` | JSON đúng nhưng `format`/`version` sai, hoặc `jobs`/`txs` không phải mảng | Như trên. Không ghi đè gì. |
| `invalid-envelope` | Envelope mã hoá sai `format` | Từ chối, không thử giải mã. |
| `wrong-password` | Giải mã AES-GCM thất bại (sai mật khẩu, hoặc file bị sửa) | Báo đúng một câu: "Sai mật khẩu sao lưu." Dừng, không ghi đè. Ghi nhận 1 lần sai (`recordWrongPassword`); đủ 5 lần liên tiếp -> khoá 60 giây. Không gợi ý mật khẩu, không thử lại tự động. |
| Khoá thử mật khẩu | Đã sai 5 lần liên tiếp, chưa hết 60 giây | Báo thời gian chờ còn lại, không cho nhập thử. Hết 60 giây mới cho thử tiếp. Nhập đúng 1 lần -> reset số lần sai về 0. |
| `no-webcrypto` | Thiết bị/trình duyệt không có `crypto.subtle` | Báo không mã hoá/giải mã được trên máy này; bản không mã hoá vẫn xuất/nhập được. |
| `photos-file-only` | Chọn file ảnh riêng một mình | Báo "Đây chỉ là file ảnh kèm theo, cần chọn file sao lưu chính trước." Không khôi phục. |
| Thiếu file ảnh khi tách | File chính có `photosSplit: true` nhưng không chọn file ảnh | Vẫn khôi phục jobs/txs/cfg; báo rõ "Đã khôi phục job và tiền, thiếu N ảnh (chưa chọn file ảnh riêng)". Không báo thành công giả. |
| `counts` lệch thực tế | Số lượng sau khôi phục khác `counts` trong file | Cảnh báo (qua `validateCounts`), không im lặng, không chặn khôi phục. |
| Xuất thất bại giữa chừng | Lỗi đọc IndexedDB, lỗi mã hoá, người dùng huỷ tải | Không cập nhật `fotobro.lastBackupAt` — lần sau vẫn nhắc. Không ghi file nửa chừng. |
| Mật khẩu yếu | < 8 ký tự | Không cho bật mã hoá, báo rõ lý do. Không ép kiểu ký tự phức tạp. |
| Mật khẩu nhập 2 lần lệch | Khi đặt mới | Báo không khớp, yêu cầu nhập lại. Chưa mã hoá gì. |

Thông điệp hiển thị (dùng đúng câu này trong app):

- File lạ / hỏng: "File này không giống bản sao lưu của FotoBro."
- Sai mật khẩu: "Sai mật khẩu sao lưu."
- File v1 cũ: "Đây là bản sao lưu cũ, không có ảnh. Khôi phục xong ảnh trang chủ vẫn trống."
- File ảnh riêng một mình: "Đây chỉ là file ảnh kèm theo, cần chọn file sao lưu chính trước."
- Tách ảnh khi xuất: "Bản sao lưu này nặng hơn 25 MB nên tách ảnh ra file riêng. Cần giữ cả 2 file mới khôi phục đủ ảnh."
- Thiếu file ảnh khi khôi phục: "Đã khôi phục job và tiền, thiếu N ảnh (chưa chọn file ảnh riêng)" (N = số thật).
- Trước khi thay thế: "Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại. Đã lưu bản dự phòng."
- Bật mã hoá lần đầu: "Bật mã hoá thì chỉ người có mật khẩu mới mở được file này."

## 8. Nhắc sao lưu 7 ngày

- Dùng `backupStatus(lastBackupAtIso, nowIso)` với
  `BACKUP_REMIND_DAYS = 7`.
- Chưa từng sao lưu (`fotobro.lastBackupAt` trống) -> nhắc luôn:
  "Bạn chưa sao lưu lần nào, tải một bản cho chắc nhé."
- Đã sao lưu, quá 7 ngày -> nhắc: "Bạn chưa sao lưu {số ngày}
  ngày rồi, tải một bản cho chắc nhé."
- Chưa quá 7 ngày -> không nhắc.
- Chỉ hiện banner / dòng nhắc trên màn Hôm nay, **không chặn**
  người dùng, không bắt buộc sao lưu mới cho dùng tiếp.
- Bấm "Sao lưu ngay" từ banner -> vào thẳng màn xuất (§5).
  Bấm đóng banner -> ẩn tới lần nhắc sau (không tắt vĩnh viễn
  trong v1 — người dùng quên sao lưu là mất dữ liệu, nên đừng
  cho tắt hẳn).
- Thực hiện bằng `showBackupReminder()` (§3).

## 9. Câu hỏi chờ Việt chốt — CHƯA CHỐT

> Cả 3 câu dưới đây đều **chưa chốt**. Spec này viết theo mặc định
> đề xuất trong `BACKUP-V2.md` §9. Nếu Việt đổi ý, chỉ sửa các điểm
> mặc định tương ứng (ghi trong từng câu), không phải thiết kế lại
> toàn bộ. Không code phần thay thế khi chưa có quyết định rõ.

1. **Mất mật khẩu sao lưu mã hoá thì sao?**
   Mặc định đề xuất: mất là mất, không khôi phục.
   Phương án thay thế (chưa chốt): cho khôi phục bằng Apple ID —
   kém an toàn hơn, chỉ làm nếu Việt yêu cầu rõ, và phải ghi rõ
   trong Privacy Policy.
   Ảnh hưởng code nếu đổi: thêm luồng khôi phục qua Apple ID +
   cập nhật Privacy Policy; envelope mã hoá và hàm
   `encryptBackup` / `decryptBackup` không đổi.
2. **Ngưỡng tách ảnh 25 MB có giữ không?**
   Đề xuất giữ. Muốn đổi (ví dụ 10 MB cho nhẹ, hay 50 MB cho đỡ
   tách) thì nói.
   Ảnh hưởng code nếu đổi: chỉ đổi một hằng số
   `SPLIT_THRESHOLD` (§1); luồng tách (§5.2) và tên file không đổi.
3. **Khôi phục thay thế toàn bộ (mặc định §6) hay cho chọn gộp?**
   Đề xuất thay thế + tự lưu bản dự phòng (`createSafetySnapshot`).
   Gộp chỉ làm nếu Việt yêu cầu rõ (dễ trùng id, sai tiền).
   Ảnh hưởng code nếu đổi: thêm chế độ gộp trong `restoreBackup`
   (hợp nhất theo id, xử lý trùng id và cộng dồn tiền) — là thay
   đổi lớn, không làm trong v1.1 nếu không có yêu cầu rõ.

## 10. Checklist kiểm thử (chạy lại trên app thật sau khi nối)

Lấy từ `BACKUP-V2.md` §8, viết lại thành ca kiểm thử cho v1.1:

1. Xuất v2 không mã hoá -> nhập lại tròn (jobs/txs/cfg/checkDone/
   uid/photos khớp, `counts` khớp, `appVersion` là `"1.0"`).
2. Xuất v2 mã hoá -> sai mật khẩu báo "Sai mật khẩu sao lưu.",
   dữ liệu hiện tại còn nguyên; đúng mật khẩu mở được; sai 5 lần
   liên tiếp -> khoá 60 giây.
3. File v1 cũ `{jobs, txs, cfg}` đọc được, báo thiếu ảnh,
   giữ nguyên `uid`/`checkDone` hiện tại.
4. File rác / JSON hỏng bị từ chối, dữ liệu hiện tại còn nguyên.
5. File > 25 MB tách 2 file (tên file đúng §2.4, file chính có
   `photosSplit: true` + `photosFile`); khôi phục thiếu file ảnh
   thì báo rõ số ảnh thiếu; chọn file ảnh một mình thì bị từ chối.
6. Banner nhắc sau 7 ngày / chưa từng sao lưu; chưa quá 7 ngày
   thì không nhắc; bấm đóng banner không tắt vĩnh viễn.
7. (Thêm cho v1.1) Xuất mã hoá + tách ảnh: cả 2 file đều mã hoá,
   cùng một mật khẩu mở được cả 2; file ảnh mã hoá đứng một mình
   vẫn bị từ chối như file ảnh thường.
8. (Thêm cho v1.1) Khôi phục xong `fotobro.lastBackupAt` không
   đổi; xuất thất bại giữa chừng cũng không đổi.

## 11. Báo cáo theo mẫu 7 mục (Quy trình Vibe Coding)

1. **Mục tiêu:** Viết spec code sao lưu v2 mã hoá cho FotoBro
   v1.1 theo đúng thiết kế `BACKUP-V2.md`: envelope (appVersion
   `"1.0"`), danh sách hàm + chữ ký, luồng mã hoá/giải mã, luồng
   xuất/nhập, xử lý file v1 cũ, tách file ảnh, xử lý lỗi, và 3 câu
   hỏi chờ Việt (§9) ghi rõ chưa chốt.
2. **Đã thực hiện:** Đọc kỹ `BACKUP-V2.md` và đối chiếu chữ ký
   hàm với prototype `fotobro-scale.js` (dòng 184–310:
   `buildBackup`, `backupFileName`, `parseBackup`, `backupStatus`,
   `encryptBackup`, `decryptBackup`, `deriveKey`, `BACKUP_FORMAT = 2`,
   `BACKUP_REMIND_DAYS = 7`); viết file này
   (`batch-v11/BACKUP-V2-CODE.md`). Chỉ viết 1 file mới duy nhất,
   không sửa file nào khác, không tạo tài khoản, không push GitHub.
3. **Kết quả kiểm tra:** Spec bám đúng thiết kế: envelope v2 /
   envelope mã hoá / file ảnh tách riêng đúng §2 BACKUP-V2.md;
   hàm dùng lại từ prototype giữ nguyên chữ ký, chỉ đổi mặc định
   `appVersion` `"2.6"` -> `"1.0"`; phần tách ảnh và các hàm mới
   (`splitBackupIfNeeded`, `buildPhotosFile`, `parsePhotosFile`,
   `photosFileName`, `serializePhotos`, `createSafetySnapshot`,
   `validatePassword`, `checkPasswordLockout`) được ghi rõ là mới
   vì prototype chưa có. Chưa kiểm chứng bằng code chạy được —
   đây là spec, chưa phải tính năng.
4. **Vấn đề còn tồn tại:** (a) 3 câu hỏi §9 chưa chốt (mất mật
   khẩu có khôi phục qua Apple ID không; ngưỡng tách 25 MB;
   khôi phục thay thế hay gộp); (b) tên file ảnh mã hoá khi tách
   (`fotobro-photos-YYYYMMDD-encrypted.json`) là đề xuất thêm
   theo quy tắc hậu tố của file chính, thiết kế gốc không ghi rõ;
   (c) trạng thái khoá thử mật khẩu ghi là biến module, chưa có
   key lưu trữ bền — quyết định khi nối vào app.
5. **Điều kiện chuyển bước:** Việt chốt 3 câu §9 -> agent iOS
   nối module theo spec này + checklist §10 -> chạy test trên app
   thật -> mới giao v1.1.
6. **Bước tiếp theo:** Chờ Việt chốt §9, rồi nối code vào app
   iOS v1.1 theo §3–§8, ưu tiên bản sao lưu mã hoá nguyên file
   trước (rủi ro thấp nhất).
7. **Trạng thái:** **Spec xong, chưa phải code chạy được.**
