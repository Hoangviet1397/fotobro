#!/usr/bin/env node
/* Bật Đăng nhập Facebook cho FotoBro iOS — CHẠY 1 LẦN khi đã có App ID thật.
 *
 *   node scripts/enable-facebook.js <APP_ID> <CLIENT_TOKEN>
 *
 * Vì sao không gắn sẵn: SDK Facebook đòi FacebookAppID trong Info.plist,
 * thiếu là app văng ngay lúc mở. Nên chỉ gắn khi có mã thật.
 *
 * Script làm (chạy lại cũng không nhân đôi):
 *   1. npm install @capacitor-community/facebook-login@8.1.0 (có Package.swift, hợp SPM)
 *   2. Info.plist: FacebookAppID, FacebookClientToken, FacebookDisplayName,
 *      URL scheme fb<APP_ID>, LSApplicationQueriesSchemes (fbapi, fbauth2…)
 *   3. AppDelegate.swift: khởi tạo SDK; SceneDelegate.swift: chuyển URL quay về cho SDK
 *   4. www/fotobro-config.js: facebookAppId
 * Sau đó: npx cap sync ios, test, commit, đẩy lên rồi build như mọi lần.
 * App ID / Client Token KHÔNG phải mật khẩu (nằm sẵn trong mọi app Facebook),
 * nhưng App Secret thì TUYỆT ĐỐI không đưa vào app hay repo. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const [appId, clientToken] = process.argv.slice(2);
if (!/^\d{5,20}$/.test(appId || '') || !/^[0-9a-f]{16,64}$/i.test(clientToken || '')) {
  console.error('Cách dùng: node scripts/enable-facebook.js <APP_ID (chỉ số)> <CLIENT_TOKEN (chuỗi hex)>');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const p = (...a) => path.join(root, ...a);
function edit(file, fn) {
  const raw = fs.readFileSync(file, 'utf8'); const crlf = raw.includes('\r\n');
  const out = fn(raw.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, crlf ? out.replace(/\n/g, '\r\n') : out);
}

// 1. plugin
const pkg = JSON.parse(fs.readFileSync(p('package.json'), 'utf8'));
if (!(pkg.dependencies || {})['@capacitor-community/facebook-login']) {
  console.log('• Cài @capacitor-community/facebook-login@8.1.0 …');
  execSync('npm install @capacitor-community/facebook-login@8.1.0 --save-exact', { cwd: root, stdio: 'inherit' });
} else console.log('• Plugin đã có trong package.json');

// 2. Info.plist
edit(p('ios', 'App', 'App', 'Info.plist'), (s) => {
  if (s.includes('<key>FacebookAppID</key>')) {
    s = s.replace(/(<key>FacebookAppID<\/key>\s*<string>)[^<]*(<\/string>)/, '$1' + appId + '$2')
         .replace(/(<key>FacebookClientToken<\/key>\s*<string>)[^<]*(<\/string>)/, '$1' + clientToken + '$2')
         .replace(/<string>fb\d{5,20}<\/string>/, '<string>fb' + appId + '</string>');
    return s;
  }
  const scheme = '\t\t<dict>\n\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>facebook-login</string>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>fb' + appId + '</string>\n\t\t\t</array>\n\t\t</dict>\n';
  if (/<key>CFBundleURLTypes<\/key>\s*<array>\n/.test(s)) s = s.replace(/(<key>CFBundleURLTypes<\/key>\s*<array>\n)/, '$1' + scheme);
  else s = s.replace(/\n<\/dict>\s*<\/plist>\s*$/, '\n\t<key>CFBundleURLTypes</key>\n\t<array>\n' + scheme + '\t</array>\n</dict>\n</plist>\n');
  const qs = ['fbapi', 'fbapi20130214', 'fbapi20130410', 'fbapi20130702', 'fbapi20131010', 'fbapi20131219', 'fbapi20140410', 'fbapi20140116', 'fbapi20150313', 'fbapi20150629', 'fbapi20160328', 'fbauth', 'fbauth2', 'fb-messenger-share-api', 'fbshareextension'];
  const add = '\t<key>FacebookAppID</key>\n\t<string>' + appId + '</string>\n\t<key>FacebookClientToken</key>\n\t<string>' + clientToken + '</string>\n\t<key>FacebookDisplayName</key>\n\t<string>FotoBro</string>\n' +
    (s.includes('<key>LSApplicationQueriesSchemes</key>') ? '' : '\t<key>LSApplicationQueriesSchemes</key>\n\t<array>\n' + qs.map((q) => '\t\t<string>' + q + '</string>\n').join('') + '\t</array>\n');
  if (s.includes('<key>LSApplicationQueriesSchemes</key>')) {
    s = s.replace(/(<key>LSApplicationQueriesSchemes<\/key>\s*<array>\n)/, (m) => m + qs.filter((q) => !s.includes('<string>' + q + '</string>')).map((q) => '\t\t<string>' + q + '</string>\n').join(''));
  }
  return s.replace(/\n<\/dict>\s*<\/plist>\s*$/, '\n' + add + '</dict>\n</plist>\n');
});
console.log('• Info.plist: đã thêm App ID, Client Token, URL scheme fb' + appId);

// 3. AppDelegate + SceneDelegate
edit(p('ios', 'App', 'App', 'AppDelegate.swift'), (s) => {
  if (s.includes('import FBSDKCoreKit')) return s;
  s = s.replace('import Capacitor\n', 'import Capacitor\nimport FBSDKCoreKit\n');
  return s.replace(/(didFinishLaunchingWithOptions launchOptions: \[UIApplication\.LaunchOptionsKey: Any\]\?\) -> Bool \{\n)/,
    '$1        // Đăng nhập Facebook (scripts/enable-facebook.js)\n        ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)\n');
});
edit(p('ios', 'App', 'App', 'SceneDelegate.swift'), (s) => {
  if (s.includes('import FBSDKCoreKit')) return s;
  s = s.replace('import Capacitor\n', 'import Capacitor\nimport FBSDKCoreKit\n');
  return s.replace(/(func scene\(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>\) \{\n)/,
    '$1        // Facebook đăng nhập xong quay về app: đưa URL cho SDK Facebook trước\n        for ctx in URLContexts {\n            ApplicationDelegate.shared.application(UIApplication.shared, open: ctx.url, sourceApplication: ctx.options.sourceApplication, annotation: ctx.options.annotation)\n        }\n');
});
console.log('• AppDelegate / SceneDelegate: đã khởi tạo SDK Facebook');

// 4. config
edit(p('www', 'fotobro-config.js'), (s) => {
  if (/facebookAppId:/.test(s)) return s.replace(/facebookAppId:\s*'[^']*'/, "facebookAppId: '" + appId + "'");
  return s.replace(/supportEmail: '([^']*)'\n\};/, "supportEmail: '$1',\n  facebookAppId: '" + appId + "' // Đăng nhập Facebook — scripts/enable-facebook.js\n};");
});
console.log('• fotobro-config.js: facebookAppId = ' + appId);
console.log('\nXong. Tiếp theo: npx cap sync ios → node test-fotobro-v2.js → commit + đẩy lên → build iOS.');
