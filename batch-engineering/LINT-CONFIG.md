# LINT-CONFIG.md — Đề xuất cấu hình lint / format cho FotoBro iOS v1

- **Dự án:** FotoBro iOS v1 — Capacitor 8, `appId: com.fotobro.app`, `webDir: www`
- **Ngày:** 20/11/2026
- **Trạng thái:** ĐỀ XUẤT — chưa cài đặt, chưa sửa bất kỳ file nào. Chỉ cần duyệt rồi copy các file mẫu ở §5–§6 vào gốc repo và chạy lệnh ở §8.
- **Phạm vi:** chỉ `www/` (app web) + `capacitor.config.ts`. Không lint code native `ios/`.

---

## 1. Hiện trạng (kiểm chứng ngày 20/11/2026)

| Hạng mục | Thực tế trong repo |
|---|---|
| ESLint / Prettier | **Chưa có.** Không có file config nào, không có trong `package.json`, không có trong `node_modules`. |
| `package.json` | Chỉ có deps Capacitor 8 (`@capacitor/*` ^8.0.0, `@capacitor/ios` ^8.6.2, `@capacitor/calendar` ^1.0.1) và devDeps `@capacitor/cli` ^8.0.0 + `typescript` ^5.6.0. Scripts hiện có: `sync`, `build:ios`, `open:ios` — chưa có `lint` / `format`. |
| `www/index.html` | **3.901 dòng**, gồm **13 khối `<script>` inline** + 2 file ngoài (`fotobro-config.js` ở đầu, `capacitor-bridge.js` ở cuối body). Đây là file chứa gần như toàn bộ logic app. |
| Phong cách JS hiện tại | Toàn bộ dùng `var` (~670 lần xuất hiện, **không có `const`/`let` nào** trong `index.html`), dấu nháy đơn, có dấu `;`. Không có `eval(`, không có `alert(` / `confirm(`. |
| Điểm cần lưu ý | `innerHTML` dùng **52 lần** (chưa audit có chèn dữ liệu người dùng không). `localStorage` key `troLyXeo.v1`. |
| Global tự định nghĩa | `window.Capacitor` (Capacitor tự chèn trong WebView, không có trên bản web), `window.FOTOBRO_CONFIG` (trong `fotobro-config.js`), `window.__trolyxeoScheduleReminder` / `__trolyxeoCancelReminder` / `__trolyxeoShare` / `__trolyxeoPickHero` (trong `capacitor-bridge.js`, `index.html` gọi tới). Ngoài ra `window.SpeechRecognition` / `window.webkitSpeechRecognition` (bản web). |
| File JS rời | `www/capacitor-bridge.js` (169 dòng), `www/fotobro-config.js` (24 dòng), `www/test-fotobro-v1.js` (258 dòng, **CommonJS kiểu Node**: `require('fs')`, `require('jsdom')`, chạy test bằng `node`, không chạy trong app). |
| File TS duy nhất | `capacitor.config.ts` (cấu hình Capacitor, import type từ `@capacitor/cli`). |
| CI sẵn có | `.github/workflows/ios-build.yml` đã có — có thể thêm job lint chạy trước job build (xem §9). |
| Môi trường | Node v24.22.1 trên máy kiểm chứng. |

Kết luận từ hiện trạng: **không thể áp `eslint:recommended` ở mức `error` ngay** — code `var` khắp nơi và 1 file HTML 3.901 dòng sẽ nổ hàng trăm lỗi, và format toàn bộ `index.html` một lần sẽ tạo diff khổng lồ che mất lịch sử git. Cần lộ trình 3 giai đoạn (§10).

---

## 2. Nguyên tắc

1. **ESLint lo lỗi logic, Prettier lo định dạng — không để hai bên đánh nhau.** Dùng `eslint-config-prettier` để tắt mọi rule ESLint xung đột với Prettier.
2. **Warn trước, error sau.** Giai đoạn đầu mọi rule phong cách chỉ là `warn` để không chặn build; chỉ lỗi thật sự nguy hiểm (như `eval`) mới là `error` ngay.
3. **Không reformat `index.html` wholesale.** Prettier chỉ format file `.js` / `.ts` / `.json` / `.md` ở giai đoạn 1; `index.html` chỉ `lint` (kiểm tra JS inline), format nó là việc giai đoạn 3, sau khi đã tách bớt script ra file riêng (nếu làm).
4. **Lint được cả JS inline trong HTML.** Vì logic app nằm trong 13 khối `<script>` của `index.html`, ESLint thuần (chỉ đọc `.js`) sẽ bỏ sót gần hết app. Bắt buộc dùng plugin HTML.
5. **Mỗi loại file một override riêng.** Code chạy trong WebView (browser globals) khác code test chạy bằng Node (CommonJS + `require`), khác file config TypeScript. Không dùng một bộ globals chung cho tất cả.
6. **Không lint code sinh ra.** Thư mục `ios/` (Xcode project + bản copy `www/` mà `npx cap sync` tạo ra) và `node_modules/` được loại trừ hoàn toàn.

---

## 3. Lựa chọn công cụ

| Công cụ | Phiên bản đề xuất | Vì sao chọn |
|---|---|---|
| ESLint | `^9.x` (flat config `eslint.config.js`) | Bản mới nhất, flat config là chuẩn hiện tại; ESLint 8 + `.eslintrc` đã lỗi thời. Node 24 chạy tốt. |
| Prettier | `^3.x` | Chuẩn format JS/TS/JSON/MD/HTML, không cần cấu hình phức tạp. |
| `eslint-config-prettier` | mới nhất | Tắt các rule ESLint về format để khỏi xung đột với Prettier (nguyên tắc 1). |
| `globals` | mới nhất | Cung cấp bộ globals `browser` / `node` cho ESLint 9 flat config (ESLint 9 không còn `env` như bản cũ). |
| `@html-eslint/eslint-plugin` | mới nhất | Lint được JS inline trong `<script>` của `index.html` + kiểm tra cấu trúc HTML (trùng `id`, thiếu thẻ đóng…). Đây là plugin bắt buộc vì logic app nằm trong HTML. **Lưu ý:** cần chạy thử trên `index.html` trước khi chốt (§10, giai đoạn 1) — nếu plugin báo quá nhiễu trên 13 khối script thì phương án dự phòng là tách script ra file `.js` rồi lint như JS thường. |
| `typescript-eslint` | `^8.x` | Chỉ để lint đúng 1 file `capacitor.config.ts`. Không kéo cả bộ rule TS nặng cho toàn dự án vì app không có code TS nào khác. |

**Không dùng thêm:** `eslint-plugin-no-unsanitized` (chặn `innerHTML` không an toàn) — để dành giai đoạn 2, sau khi audit 52 chỗ `innerHTML` hiện tại; bật ngay bây giờ sẽ chặn cả những chỗ đang dùng đúng.

---

## 4. File sẽ thêm vào repo (khi áp dụng)

```text
fotobro-ios-v1/
├── eslint.config.js        # Cấu hình ESLint 9 flat — xem mẫu đầy đủ ở §5
├── .prettierrc.json        # Cấu hình Prettier — xem mẫu ở §6
├── .prettierignore         # File Prettier bỏ qua — xem mẫu ở §6
├── .editorconfig           # Tùy chọn, đồng bộ indent/EOL cho editor — xem mẫu ở §7
└── package.json            # CHỈ thêm devDeps + 5 script (xem §8), không sửa gì khác
```

Không cần `.eslintignore` riêng — ESLint 9 dùng trường `ignores` ngay trong `eslint.config.js`.

---

## 5. File mẫu đầy đủ — `eslint.config.js`

> Đặt tại gốc repo (`fotobro-ios-v1/eslint.config.js`). Dạng flat config của ESLint 9.

```js
// FotoBro iOS v1 — ESLint 9 flat config.
// Nguyên tắc: warn trước, error sau (xem LINT-CONFIG.md §10).
// Chạy: npm run lint | Sửa tự động được: npm run lint:fix
import js from '@eslint/js';
import globals from 'globals';
import html from '@html-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Global do Capacitor / app tự tạo lúc chạy — ESLint không được báo no-undef.
const fotobroGlobals = {
  Capacitor: 'readonly', // window.Capacitor — Capacitor tự chèn trong WebView
  FOTOBRO_CONFIG: 'readonly', // window.FOTOBRO_CONFIG — www/fotobro-config.js
  __trolyxeoScheduleReminder: 'readonly',
  __trolyxeoCancelReminder: 'readonly',
  __trolyxeoShare: 'readonly',
  __trolyxeoPickHero: 'readonly',
};

// Rule JS dùng chung cho mọi file app (browser). Giai đoạn 1: lỗi nguy hiểm
// là error, còn lại là warn để không chặn build.
const appJsRules = {
  // --- An toàn: error ngay từ đầu (code hiện tại đã sạch các lỗi này) ---
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-script-url': 'error',
  'no-undef': 'error',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  // --- Đúng đắn: warn ở giai đoạn 1, lên error ở giai đoạn 2 ---
  eqeqeq: ['warn', 'smart'],
  'no-var': 'warn', // Code hiện dùng var khắp nơi (~670 lần). Không ép sửa
  'prefer-const': 'warn', // ồ ạt một lúc; sửa dần khi chạm vào từng hàm.
  'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log còn
  'no-debugger': 'warn', // dùng khi debug local; cấm hẳn khi lên error ở gđ 2.
  'no-alert': 'off', // App hiện không dùng alert/confirm; để off, khỏi cấm trước.
  'no-inner-declarations': 'warn',
};

export default [
  // 0. Bỏ qua: code sinh ra + phụ thuộc + file tĩnh. ios/ chứa cả bản copy
  //    www/ do `npx cap sync` tạo — lint www/ là đủ, lint cả ios/ là trùng.
  {
    ignores: [
      'node_modules/**',
      'ios/**',
      'dist/**',
      'package-lock.json',
      'www/PRIVACY.html', // Trang pháp lý tĩnh, ít thay đổi — khỏi lint HTML.
      'www/SUPPORT.html',
      '*.mobileprovision',
      '*.p12',
      '*.key',
      'AuthKey_*.p8',
    ],
  },

  // 1. JS chạy trong WebView: www/*.js + JS inline trong www/index.html.
  {
    files: ['www/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022, // WKWebView hiện đại chạy tốt ES2022.
      sourceType: 'script', // File www/*.js dùng var/function toàn cục, không ESM.
      globals: { ...globals.browser, ...fotobroGlobals },
    },
    rules: appJsRules,
  },

  // 2. HTML: lint JS inline trong <script> bằng cùng bộ rule app,
  //    cộng kiểm tra cấu trúc HTML tối thiểu. TẮT các rule HTML về định
  //    dạng (indent/quotes/…) để Prettier là bên duy nhất lo format.
  {
    files: ['www/**/*.html'],
    plugins: { '@html-eslint': html },
    languageOptions: {
      parser: html.parser,
      globals: { ...globals.browser, ...fotobroGlobals },
    },
    rules: {
      ...appJsRules,
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/require-closing-tags': 'error',
      '@html-eslint/no-multiple-h1': 'warn',
      '@html-eslint/indent': 'off',
      '@html-eslint/quotes': 'off',
      '@html-eslint/sort-attrs': 'off',
      '@html-eslint/no-trailing-spaces': 'off',
    },
  },

  // 3. File test chạy bằng Node (CommonJS): được dùng require, process,
  //    __dirname. Không áp globals browser ở đây.
  {
    files: ['www/test-fotobro-v1.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...appJsRules,
      'no-console': 'off', // Test in kết quả PASS/FAIL ra console là đúng việc.
    },
  },

  // 4. capacitor.config.ts: file TS duy nhất — parser TS + rule recommended.
  {
    files: ['capacitor.config.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { projectService: false },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // 5. Luôn đặt cuối: tắt mọi rule ESLint xung đột với Prettier.
  prettier,
];
```

### Bảng quy tắc — bật / tắt và vì sao

| Rule | Mức | Vì sao |
|---|---|---|
| `no-eval`, `no-implied-eval`, `no-new-func`, `no-script-url` | `error` | Chạy code từ chuỗi là rủi ro bảo mật; app hiện đã sạch (0 `eval(`) nên bật `error` ngay không tốn công sửa. |
| `no-undef`, `no-unused-vars` | `error` | Bắt lỗi gõ sai tên biến/hàm và biến thừa — lỗi thật, sửa rẻ. Kèm globals FotoBro (§5) để khỏi báo oan `Capacitor`, `FOTOBRO_CONFIG`, `__trolyxeo*`. |
| `eqeqeq` (`smart`) | `warn` | `==`/`!=` dễ gây bug kiểu dữ liệu; `smart` cho phép `== null` (so sánh null/undefined) vốn là idiom thường dùng. Lên `error` ở giai đoạn 2. |
| `no-var`, `prefer-const` | `warn` | Code hiện toàn `var`, 0 `const`/`let`. Ép `error` sẽ tạo ~670 lỗi một lúc. `warn` để code mới viết đúng, code cũ sửa dần khi chạm vào. |
| `no-console` (cho `warn`/`error`) | `warn` | `console.log` sót lại làm nhiễu log khi debug trên máy thật; vẫn cho `console.warn`/`console.error`. File test được miễn (`off`). |
| `no-debugger` | `warn` | `debugger` quên xóa sẽ dừng app khi debug; giai đoạn 2 lên `error`. |
| `no-alert` | `off` | App hiện không dùng `alert`/`confirm`; không cấm trước thứ chưa tồn tại. |
| `@html-eslint/no-duplicate-id`, `require-closing-tags` | `error` | Trùng `id` làm `getElementById` trỏ sai chỗ; thiếu thẻ đóng làm vỡ layout — lỗi thật trong file HTML 3.901 dòng. |
| `@html-eslint/no-multiple-h1` | `warn` | Nhiều `<h1>` hại accessibility/SEO trong WebView; chỉ nhắc, không chặn. |
| `@html-eslint/indent`, `quotes`, `sort-attrs`, `no-trailing-spaces` | `off` | Định dạng HTML là việc của Prettier — hai bên cùng format sẽ đánh nhau (nguyên tắc 1). |
| `no-unsanitized` (chặn `innerHTML` bẩn) | **chưa bật** | App có 52 chỗ `innerHTML` chưa audit. Bật khi chưa audit sẽ chặn cả chỗ đúng. Để giai đoạn 2 sau khi rà soát xong. |

---

## 6. File mẫu đầy đủ — Prettier

### `.prettierrc.json` (đặt tại gốc repo)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "always",
  "overrides": [
    {
      "files": "*.md",
      "options": { "printWidth": 100, "proseWrap": "preserve" }
    },
    {
      "files": "*.json",
      "options": { "printWidth": 100 }
    }
  ]
}
```

**Vì sao chọn các giá trị này:**

| Tùy chọn | Giá trị | Vì sao |
|---|---|---|
| `singleQuote: true` | Nháy đơn | Khớp phong cách code hiện tại (JS trong app đã dùng nháy đơn). |
| `semi: true` | Có `;` | Khớp code hiện tại; tránh lỗi ASI khi nối file/minify. |
| `tabWidth: 2` | 2 khoảng trắng | Khớp code hiện tại; chuẩn phổ biến cho JS/TS. |
| `printWidth: 100` | 100 ký tự | 80 quá hẹp cho file HTML/JS dài, dòng bị bẻ vụn; 120 quá rộng khi đọc trên điện thoại/màn hình chia đôi. 100 là điểm giữa. |
| `trailingComma: es5` | Dấu phẩy cuối ở object/array | Diff git gọn khi thêm phần tử; `es5` an toàn cho mọi môi trường (không dùng trailing comma ở tham số hàm như `all`). |
| `endOfLine: lf` | LF | Repo build trên macOS/Linux qua GitHub Actions; LF tránh lỗi line-ending khi checkout trên Windows. |
| `proseWrap: preserve` (cho `.md`) | Giữ nguyên dòng | Các file `.md` trong repo (hơn 20 file tài liệu) đang viết dòng dài; Prettier mà tự ngắt dòng sẽ tạo diff lớn vô ích. |

### `.prettierignore` (đặt tại gốc repo)

```text
# Phụ thuộc + code sinh ra
node_modules/
ios/
dist/
package-lock.json

# File HTML pháp lý tĩnh — nội dung do luật/quy định, khỏi format
www/PRIVACY.html
www/SUPPORT.html

# GIAI ĐOẠN 1: chưa format www/index.html (3.901 dòng, 13 khối script inline).
# Format một lần = diff khổng lồ che lịch sử git. Bỏ qua ở đây, xử lý ở
# giai đoạn 3 (xem LINT-CONFIG.md §10). Khi sẵn sàng, xóa 2 dòng dưới.
www/index.html
```

> Chú ý: `.prettierignore` bỏ qua `www/index.html` nghĩa là `npm run format` sẽ **không** đụng vào file app chính. ESLint (§5, mục 2) vẫn lint JS inline trong đó — chỉ format là chưa làm.

---

## 7. Tùy chọn — `.editorconfig` (đồng bộ editor)

Không bắt buộc, nhưng rẻ và giúp người mới mở repo không bị editor tự format lệch. Đặt tại gốc repo:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

---

## 8. Cài đặt và script `package.json`

### Cài đặt (chạy 1 lần tại gốc repo)

```bash
npm install -D eslint@^9 prettier@^3 globals @html-eslint/eslint-plugin typescript-eslint eslint-config-prettier
```

> `typescript-eslint` là package gộp (parser + plugin) của `typescript-eslint` v8 — cài 1 package là đủ cho 1 file TS duy nhất. Không cần `@typescript-eslint/parser` / `@typescript-eslint/eslint-plugin` riêng.

### Thêm vào `package.json` (chỉ thêm `devDependencies` do lệnh trên tự ghi + 5 script dưới, không sửa gì khác)

```json
{
  "scripts": {
    "sync": "npx cap sync ios",
    "build:ios": "npx cap sync ios",
    "open:ios": "npx cap open ios",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run lint && npm run format:check"
  }
}
```

### Cách chạy

| Lệnh | Dùng khi nào |
|---|---|
| `npm run lint` | Kiểm tra lỗi (chỉ báo, không sửa). Chạy trước mỗi commit. |
| `npm run lint:fix` | Tự sửa lỗi sửa được (vd. biến thừa không tự sửa được — phải sửa tay; `prefer-const`/`no-var` thì `--fix` sửa được nhưng **đừng chạy trên toàn repo ở giai đoạn 1**, xem §10). |
| `npm run format` | Format toàn bộ file (trừ file trong `.prettierignore`, tức là trừ `www/index.html` ở giai đoạn 1). |
| `npm run format:check` | Chỉ kiểm tra format có đúng không, không sửa — dùng cho CI. |
| `npm run check` | Chạy cả lint + format check — lệnh duy nhất cần nhớ trước khi push. |

**Quy trình làm việc đề xuất:** viết code → `npm run lint:fix` → `npm run format` → `npm run check` → commit. Lỗi `error` phải sửa hết mới commit; `warn` được phép còn tồn tại trong giai đoạn 1.

---

## 9. Tùy chọn — job lint trong CI

Repo đã có `.github/workflows/ios-build.yml`. Thêm file mới `.github/workflows/lint.yml` để lint chạy nhanh trên Linux trước khi job build iOS (chạy trên macOS, đắt và chậm) bắt đầu:

```yaml
name: Lint

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
```

> Giai đoạn 1 nên để job này ở chế độ **không chặn merge** (`continue-on-error: true` ở step `npm run check`) vì còn nhiều `warn`; sang giai đoạn 2 mới cho chặn thật. Job iOS build hiện tại không cần sửa.

---

## 10. Lộ trình áp dụng (3 giai đoạn)

| Giai đoạn | Việc làm | Điều kiện chuyển bước |
|---|---|---|
| **1. Lắp đặt (ngay)** | Copy `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.editorconfig` vào gốc repo; chạy lệnh cài đặt §8; thêm 5 script. Chạy `npm run lint` lần đầu để lấy danh sách lỗi thật. | Config chạy được, không crash trên `index.html` (đặc biệt kiểm tra `@html-eslint` với 13 khối script inline — nếu báo nhiễu vô lý thì tạm bỏ mục 2 trong `eslint.config.js` và chỉ lint file `.js` rời, ghi chú lại). |
| **1b. Dọn lỗi error** | Sửa hết lỗi `error` (dự kiến ít: `no-undef` do thiếu global, `no-unused-vars`, lỗi HTML trùng `id`/thiếu thẻ đóng). **Không** sửa `warn` hàng loạt. Chạy `npm run format` một lần cho file `.js`/`.ts`/`.json`/`.md` (không gồm `index.html`). | `npm run lint` còn 0 `error` (warn được phép còn). Commit riêng 1 commit "chore: add eslint + prettier". |
| **2. Siết dần** | Audit 52 chỗ `innerHTML` (chỗ nào chèn dữ liệu người dùng thì escape hoặc chuyển sang `textContent`/`createElement`); sau đó cân nhắc bật `eslint-plugin-no-unsanitized`. Nâng `eqeqeq`, `no-debugger` lên `error`. Bật `continue-on-error: false` cho job lint CI. | Audit `innerHTML` xong, không còn `debugger`/`console.log` sót. |
| **3. Format `index.html`** | Chỉ làm khi đã tách bớt JS inline ra file `.js` riêng (hoặc khi chấp nhận 1 commit format lớn). Xóa `www/index.html` khỏi `.prettierignore`, chạy `prettier --write www/index.html`, kiểm tra lại app chạy đúng rồi mới commit (commit format đứng riêng, không trộn với sửa logic). Nâng `no-var`/`prefer-const` lên `error` sau khi code cũ đã chuyển dần sang `const`/`let`. | App sau format vẫn chạy đúng (kiểm tra trên bản web + TestFlight như mọi lần). |

**Nguyên tắc xuyên suốt:** mỗi giai đoạn 1 commit riêng; không trộn commit format với commit sửa logic; không chạy `lint:fix` toàn repo ở giai đoạn 1 (nó sẽ sửa ~670 chỗ `var` cùng lúc).

---

## 11. Những gì KHÔNG làm

- **Không lint `ios/`.** Đó là Xcode project + bản copy `www/` do `npx cap sync` sinh ra; lint `www/` là đủ.
- **Không ép `const`/`let` ngay.** `warn` thôi (§5) — ép `error` bây giờ là 670 lỗi không liên quan tới chất lượng app.
- **Không format `www/index.html` ở giai đoạn 1.** Diff khổng lồ, rủi ro cao, lợi ích thấp.
- **Không thêm rule về style viết code dài dòng** (vd. `max-len`, `complexity`, `max-lines`) — app single-file 3.901 dòng sẽ vi phạm ngay; để khi nào tách file mới tính.
- **Không dùng chung 1 bộ globals cho mọi file.** File test Node mà áp globals browser (và ngược lại) sẽ báo sai.
- **Không commit secret vào config.** Config này không chứa Client ID, token hay khóa nào — `googleClientId` vẫn nằm trong `www/fotobro-config.js` như hiện tại.

---

## 12. Kiểm chứng đề xuất này

- [x] Đã đọc `package.json`, `capacitor.config.ts`, `.gitignore`, cấu trúc `www/` (ngày 20/11/2026).
- [x] Đã đếm: `index.html` 3.901 dòng / 13 khối `<script>` inline / ~670 `var` / 0 `const`/`let` / 0 `eval` / 0 `alert` / 52 `innerHTML`.
- [x] Đã xác nhận chưa có ESLint/Prettier trong repo và `node_modules`.
- [ ] **Chưa chạy thử** — file config mẫu trong tài liệu này chưa được copy vào repo hay chạy `npm run lint` thật (nằm ngoài phạm vi task: chỉ viết file đề xuất, không sửa repo). Bước chạy thử thuộc giai đoạn 1 (§10) khi có người duyệt.
- [ ] **Chưa kiểm chứng `@html-eslint`** trên `index.html` thật — plugin này là điểm rủi ro duy nhất của đề xuất; cần chạy thử trước khi chốt (§10, giai đoạn 1).
