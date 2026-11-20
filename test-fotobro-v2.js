/* Test FotoBro iOS v2.0 — chạy bằng jsdom, không cần trình duyệt.
   Từ repo root: NODE_PATH=/tmp/film-verify/node_modules node test-fotobro-v2.js
   (trên CI: NODE_PATH=node_modules node test-fotobro-v2.js, sau npm ci + npm i --no-save jsdom)
   Base: www/index.html. Kỳ vọng:
   - Mặc định người mới: tên/studio/instagram rỗng, giá digital + film đều 0.
   - Dữ liệu cũ của Xèo (cfg đã lưu) vẫn giữ nguyên tên/giá khi merge.
   - Storage key troLyXeo.v1 + định dạng JSON sao lưu KHÔNG đổi. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'www', 'index.html'), 'utf-8');
let pass = 0, fail = 0;
const fails = [];
function t(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; fails.push(name); console.log('  FAIL ' + name + (extra !== undefined ? ' — ' + extra : '')); }
}
function eq(name, got, want) { t(name, got === want, 'got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
function fire(el, type) { el.dispatchEvent(new el.ownerDocument.defaultView.Event(type, { bubbles: true })); }
function setSel(sel, val) { sel.value = val; fire(sel, 'change'); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
let DOC = null;
function lastSheetEl(sel) { const els = DOC.querySelectorAll('.sheet ' + sel); return els[els.length - 1]; }
/* actionSheet render vào .asheet (không phải .sheet) — helper riêng cho nút xác nhận. */
function lastAsheetBtn(sel) { const els = DOC.querySelectorAll('.asheet ' + sel); return els[els.length - 1]; }
async function closeSheet() { lastSheetEl('.sh-l').click(); await sleep(500); }
async function saveSheet() { lastSheetEl('.sh-r').click(); await sleep(100); }
function lastForm() { const f = DOC.querySelectorAll('#jobForm'); return f[f.length - 1]; }

async function loadDom(beforeParse) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', e => errors.push(String(e && e.message || e)));
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    virtualConsole: vc, beforeParse,
  });
  await new Promise(r => dom.window.addEventListener('load', r));
  await new Promise(r => setTimeout(r, 50));
  return { dom, win: dom.window, doc: dom.window.document, errors };
}

(async () => {
  const { win, doc, errors } = await loadDom();
  DOC = doc;
  const W = win;
  t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
  eq('title là FotoBro', doc.title, 'FotoBro');
  eq('APP_VERSION 2.0', W.APP_VERSION, '2.0');
  eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
  // Phương án A (20/11/2026): 5 ô = 4 màn (home, jobs, money, depts/Thêm) + nút Ghi nhanh ở giữa
  t('đủ 5 ô thanh tab (4 màn + nút Ghi)', doc.querySelectorAll('.tabbar button').length === 5 &&
    [...doc.querySelectorAll('.tabbar button[data-view]')].map(b => b.getAttribute('data-view')).join(',') === 'home,jobs,money,depts' &&
    !!doc.querySelector('.tabbar #tabAdd'),
    [...doc.querySelectorAll('.tabbar button[data-view]')].map(b => b.getAttribute('data-view')).join(','));
  t('source chứa fotobro-sao-luu.json', html.includes('fotobro-sao-luu.json'));
  t('source không chứa tro-ly-xeo-sao-luu.json', !html.includes('tro-ly-xeo-sao-luu.json'));

  console.log('\n[1] Config mặc định người mới: trống + giá 0');
  const d0 = W.mergeCfg(null);
  eq('mergeCfg(null).name rỗng', d0.name, '');
  eq('mergeCfg(null).studio rỗng', d0.studio, '');
  eq('mergeCfg(null).instagram rỗng', d0.instagram, '');
  eq('mergeCfg(null).prices Portrait=0', d0.prices.Portrait, 0);
  eq('mergeCfg(null).prices Wedding=0', d0.prices.Wedding, 0);
  eq('mergeCfg(null).pricesFilm Portrait=0', d0.pricesFilm.Portrait, 0);
  eq('mergeCfg(null).pricesFilm Wedding=0', d0.pricesFilm.Wedding, 0);
  eq('mergeCfg(null).extraHour=0', d0.extraHour, 0);
  eq('mergeCfg(null).depositPct giữ 40', d0.depositPct, 40);
  eq('mergeCfg(null).deliverDays giữ 14', d0.deliverDays, 14);
  eq('state.cfg mặc định name rỗng', W.state.cfg.name, '');
  eq('state.cfg mặc định prices Wedding=0', W.state.cfg.prices.Wedding, 0);

  console.log('\n[2] Dữ liệu cũ của Xèo vẫn giữ nguyên khi merge (không mất)');
  const dOld = W.mergeCfg({ name: 'Xèo', studio: 'Sadako Photography', instagram: 'xeonong',
    prices: { Portrait: 2500000, Couple: 4000000, Wedding: 15000000, Lookbook: 8000000, Event: 5000000 },
    pricesFilm: { Wedding: 20000000 } });
  eq('cfg cũ: name Xèo giữ', dOld.name, 'Xèo');
  eq('cfg cũ: studio Sadako giữ', dOld.studio, 'Sadako Photography');
  eq('cfg cũ: instagram xeonong giữ', dOld.instagram, 'xeonong');
  eq('cfg cũ: giá digital Wedding giữ 15tr', dOld.prices.Wedding, 15000000);
  eq('cfg cũ: giá film Wedding giữ 20tr', dOld.pricesFilm.Wedding, 20000000);
  eq('cfg cũ: giá film Portrait về 0', dOld.pricesFilm.Portrait, 0);
  const dOld2 = W.mergeCfg({ name: 'Xèo', prices: { Portrait: 3000000 } });
  eq('cfg cũ thiếu pricesFilm -> film 0', dOld2.pricesFilm.Couple, 0);
  eq('cfg cũ: giá digital Portrait giữ 3tr', dOld2.prices.Portrait, 3000000);
  eq('cfg cũ thiếu Wedding -> về mặc định 0', dOld2.prices.Wedding, 0);

  console.log('\n[3] priceFor: mặc định 0, đã cấu hình thì tính đúng');
  eq('mặc định Digital Portrait = 0', W.priceFor('Portrait', 'Digital'), 0);
  eq('mặc định Film Portrait = 0', W.priceFor('Portrait', 'Film'), 0);
  eq('mặc định Cả hai Portrait = 0', W.priceFor('Portrait', 'Cả hai'), 0);
  W.state.cfg.prices.Portrait = 2500000; W.state.cfg.prices.Wedding = 15000000;
  W.state.cfg.pricesFilm.Portrait = 3500000; W.state.cfg.pricesFilm.Wedding = 20000000;
  eq('đã cấu hình Digital Portrait = 2.5tr', W.priceFor('Portrait', 'Digital'), 2500000);
  eq('đã cấu hình Film Portrait = 3.5tr', W.priceFor('Portrait', 'Film'), 3500000);
  eq('đã cấu hình Cả hai Portrait = 6tr', W.priceFor('Portrait', 'Cả hai'), 6000000);
  eq('đã cấu hình Cả hai Wedding = 35tr', W.priceFor('Wedding', 'Cả hai'), 35000000);
  W.state.cfg.pricesFilm.Couple = 0;
  eq('Cả hai Couple thiếu giá film = 0', W.priceFor('Couple', 'Cả hai'), 0);

  console.log('\n[4] Lời chào / tin nhắn / báo cáo theo tên trong Cài đặt');
  W.state.cfg.name = ''; W.state.cfg.studio = ''; W.state.cfg.instagram = '';
  W.renderHome();
  eq('chưa điền tên: lời chào là bạn', doc.querySelector('#view-home .lt h1 em').textContent, 'bạn');
  t('chưa điền tên: footInfo là FotoBro', doc.querySelector('#footInfo').textContent.includes('FotoBro'),
    doc.querySelector('#footInfo').textContent);
  t('chưa điền tên: greetLine không có Sadako', !doc.querySelector('#greetLine').textContent.includes('Sadako'));
  W.state.cfg.name = 'Lan'; W.state.cfg.studio = 'Lan Studio'; W.state.cfg.instagram = 'lanphoto';
  W.renderHome();
  eq('điền tên Lan: lời chào là Lan', doc.querySelector('#view-home .lt h1 em').textContent, 'Lan');
  t('điền tên: footInfo có Lan Studio', doc.querySelector('#footInfo').textContent.includes('Lan Studio'));
  const job0 = { client: 'Mai', type: 'Wedding', medium: 'Film', shootDate: '2026-11-20', shootTime: '08:00', location: 'Đà Lạt', deadline: '', price: 20000000 };
  t('msgFor dùng tên Lan + Lan Studio', W.msgFor(job0).includes('Lan') && W.msgFor(job0).includes('Lan Studio'), W.msgFor(job0).slice(0, 80));
  t('msgFor ghi rõ Wedding — Film', W.msgFor(job0).includes('Wedding — Film'));
  t('báo cáo dùng Lan Studio · Giám đốc: Lan', W.dailyReportText().includes('Lan Studio · Giám đốc: Lan'));
  W.state.cfg.name = ''; W.state.cfg.studio = ''; W.state.cfg.instagram = '';
  W.renderHome();
  t('xoá tên: msgFor không còn Lan', !W.msgFor(job0).includes('Lan Studio'));
  t('xoá tên: msgFor vẫn chào khách', W.msgFor(job0).startsWith('Chào Mai!'));

  console.log('\n[5] Không còn Xèo / Sadako / Trợ lý Xèo trong UI hiển thị');
  W.renderHome();
  const visible = doc.body.textContent;
  t('body không chứa "Xèo"', !visible.includes('Xèo'));
  t('body không chứa "Sadako"', !visible.includes('Sadako'));
  t('body không chứa "Trợ lý Xèo"', !visible.includes('Trợ lý Xèo'));
  t('body có "FotoBro"', visible.includes('FotoBro'), 'footer/version');
  t('6 phòng ban còn đủ Sen/Nắng/Mây/Lúa/Trăng/Đèn',
    ['Sen', 'Nắng', 'Mây', 'Lúa', 'Trăng', 'Đèn'].every(s => visible.includes(s)));

  console.log('\n[6] Sổ trống + cleanData job cũ');
  eq('sổ trống: 0 job mẫu', W.state.jobs.length, 0);
  t('sổ trống: không job nào sai medium', W.state.jobs.every(j => W.jobMedium(j) === 'Digital'));
  const cd = W.cleanData({ jobs: [
    { id: 1, client: 'Cu', type: 'Wedding', stage: 'Tư vấn', price: 15000000 },
    { id: 2, client: 'Moi', type: 'Portrait', medium: 'Film', price: 3500000 },
    { id: 3, client: 'La', type: 'Couple', medium: 'Analog', price: 4000000 },
  ], txs: [] });
  eq('job cũ không medium -> Digital', cd.jobs[0].medium, 'Digital');
  eq('job Film giữ Film', cd.jobs[1].medium, 'Film');
  eq('medium lạ -> Digital', cd.jobs[2].medium, 'Digital');

  console.log('\n[7] Form thêm job: mặc định giá 0 -> để trống; đã cấu hình thì tự điền');
  W.state.cfg.prices.Portrait = 0; W.state.cfg.prices.Wedding = 0; W.state.cfg.pricesFilm.Wedding = 0;
  W.openJobForm(null);
  let form = doc.querySelector('#jobForm');
  t('form có select medium', !!form.querySelector('select[name="medium"]'));
  eq('medium có 3 lựa chọn', form.querySelector('select[name="medium"]').options.length, 3);
  eq('medium mặc định Digital', form.querySelector('select[name="medium"]').value, 'Digital');
  eq('giá mặc định Portrait khi chưa đặt giá -> trống', form.elements.price.value, '');
  await closeSheet();
  W.state.cfg.prices.Portrait = 2500000; W.state.cfg.prices.Wedding = 15000000;
  W.state.cfg.pricesFilm.Portrait = 3500000; W.state.cfg.pricesFilm.Wedding = 20000000;
  W.openJobForm(null);
  form = lastForm();
  eq('đã cấu hình: giá Portrait Digital 2.5tr', form.elements.price.value, '2.500.000');
  const typeSel = form.querySelector('select[name="type"]');
  const medSel = form.querySelector('select[name="medium"]');
  setSel(typeSel, 'Wedding');
  eq('đổi sang Wedding Digital -> 15tr', form.elements.price.value, '15.000.000');
  setSel(medSel, 'Film');
  eq('đổi sang Film -> 20tr', form.elements.price.value, '20.000.000');
  setSel(medSel, 'Cả hai');
  eq('đổi sang Cả hai -> 35tr', form.elements.price.value, '35.000.000');
  await closeSheet();

  console.log('\n[8] Lưu job film + cả hai qua form');
  W.openJobForm(null);
  form = lastForm();
  form.elements.client.value = 'Lan';
  setSel(form.querySelector('select[name="type"]'), 'Wedding');
  setSel(form.querySelector('select[name="medium"]'), 'Film');
  eq('form Lan Film tự điền 20tr', form.elements.price.value, '20.000.000');
  await saveSheet();
  const lan = W.state.jobs[0];
  eq('job mới client Lan', lan.client, 'Lan');
  eq('job mới medium Film', lan.medium, 'Film');
  eq('job mới giá 20tr', lan.price, 20000000);
  t('jobRow Lan hiện "Wedding — Film"', W.jobRow(lan).includes('Wedding — Film'));
  t('chi tiết Lan hiện medium Film', W.jobDetailHTML(lan).includes('Chụp bằng') && W.jobDetailHTML(lan).includes('Film'));
  eq('mailCtx Lan type', W.mailCtx(lan).type, 'Wedding — Film');
  t('msgFor Lan có Film', W.msgFor(lan).includes('Wedding — Film'));
  await sleep(400);

  console.log('\n[9] Cài đặt: tên/studio đổi thì lời chào đổi; Bảng giá film đủ 5 ô');
  W.openSettings();
  await sleep(100);
  const _sheets9 = doc.querySelectorAll('.sheet .sheet-body');
  const st = _sheets9[_sheets9.length - 1];
  t('Cài đặt có mục Bảng giá film', st.innerHTML.includes('Bảng giá film'));
  t('Cài đặt có đủ 5 ô giá film', st.querySelectorAll('input[data-cfg^="pricesFilm."]').length === 5);
  const nameInp = st.querySelector('input[data-cfg="name"]');
  const studioInp = st.querySelector('input[data-cfg="studio"]');
  t('có ô nhập Tên gọi', !!nameInp);
  t('có ô nhập Tên studio', !!studioInp);
  t('placeholder Tên gọi không phải Xèo', nameInp.getAttribute('placeholder') !== 'Xèo');
  t('placeholder Tên studio không phải Sadako', studioInp.getAttribute('placeholder') !== 'Sadako Photography');
  nameInp.value = 'Lan'; fire(nameInp, 'input');
  studioInp.value = 'Lan Studio'; fire(studioInp, 'input');
  eq('nhập tên Lan -> cfg.name Lan', W.state.cfg.name, 'Lan');
  eq('nhập studio -> cfg.studio Lan Studio', W.state.cfg.studio, 'Lan Studio');
  const filmInp = st.querySelector('input[data-cfg="pricesFilm.Wedding"]');
  t('có ô nhập pricesFilm.Wedding', !!filmInp);
  filmInp.value = '22.000.000'; fire(filmInp, 'input');
  eq('nhập giá film Wedding -> cfg 22tr', W.state.cfg.pricesFilm.Wedding, 22000000);
  await saveSheet();
  W.renderHome();
  eq('lưu Cài đặt xong: lời chào là Lan', doc.querySelector('#view-home .lt h1 em').textContent, 'Lan');

  console.log('\n[10] Máy tính giá (Phòng Đón Khách)');
  W.openDept('donkhach');
  await sleep(100);
  const _sheets10 = doc.querySelectorAll('.sheet .sheet-body');
  const dept = _sheets10[_sheets10.length - 1];
  t('máy tính có ô Chụp bằng', !!dept.querySelector('#calcMedium'));
  setSel(dept.querySelector('#calcPkg'), 'Wedding'); setSel(dept.querySelector('#calcMedium'), 'Cả hai');
  t('Wedding Cả hai = 15+22=37tr', dept.querySelector('#calcOut').textContent.includes('37.000.000'),
    dept.querySelector('#calcOut').textContent.split('\n')[0]);
  await closeSheet();

  console.log('\n[11] Giọng nói: thêm job film / cả hai / digital');
  const r1 = W.runCommand('thêm job cưới film cho Lan Anh');
  const j1 = W.state.jobs[0];
  eq('voice film: client Lan Anh', j1.client, 'Lan Anh');
  eq('voice film: type Wedding', j1.type, 'Wedding');
  eq('voice film: medium Film', j1.medium, 'Film');
  eq('voice film: giá 22tr', j1.price, 22000000);
  t('voice film: câu trả lời có Film', r1.includes('Film'));
  W.runCommand('thêm job couple cả hai cho Mai');
  const j2 = W.state.jobs[0];
  eq('voice cả hai: medium', j2.medium, 'Cả hai');
  eq('voice cả hai: type Couple', j2.type, 'Couple');
  W.runCommand('thêm job portrait cho An');
  const j3 = W.state.jobs[0];
  eq('voice digital: medium Digital', j3.medium, 'Digital');
  eq('voice digital: giá 2.5tr', j3.price, 2500000);

  console.log('\n[12] Sao lưu JSON + round-trip localStorage + dữ liệu cũ');
  const saved = JSON.stringify({ jobs: W.state.jobs, txs: W.state.txs, cfg: W.state.cfg });
  t('JSON sao lưu có pricesFilm', saved.includes('"pricesFilm"'));
  t('JSON sao lưu có medium Film', saved.includes('"medium":"Film"'));
  W.state.cfg.pricesFilm.Event = 7000000;
  W.saveLocal();
  W.state.cfg.pricesFilm.Event = 0;
  W.loadLocal();
  eq('save/load giữ giá film Event 7tr', W.state.cfg.pricesFilm.Event, 7000000);
  const oldBackup = JSON.stringify({
    jobs: [{ id: 1, client: 'Cu', type: 'Wedding', stage: 'Tư vấn', shootDate: '', shootTime: '', location: '', deadline: '', price: 15000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '' }],
    txs: [], sample: false,
    cfg: { name: 'Xèo', studio: 'Sadako Photography', prices: { Portrait: 2500000, Couple: 4000000, Wedding: 15000000, Lookbook: 8000000, Event: 5000000 } },
  });
  const { win: w2 } = await loadDom(w => { w.localStorage.setItem('troLyXeo.v1', oldBackup); });
  eq('dữ liệu cũ: job medium Digital', w2.jobMedium(w2.state.jobs[0]), 'Digital');
  eq('dữ liệu cũ: pricesFilm toàn 0', Object.values(w2.state.cfg.pricesFilm).every(v => v === 0), true);
  eq('dữ liệu cũ: giá digital Wedding giữ 15tr', w2.state.cfg.prices.Wedding, 15000000);
  eq('dữ liệu cũ: tên Xèo giữ nguyên', w2.state.cfg.name, 'Xèo');
  eq('dữ liệu cũ: studio Sadako giữ nguyên', w2.state.cfg.studio, 'Sadako Photography');
  t('dữ liệu cũ: jobRow không hiện Film', !w2.jobRow(w2.state.jobs[0]).includes('Film'));


  console.log('\n[13] Pipeline v2.0: nhảy bước, cọc, xong-thiếu-tiền, huỷ/khôi phục, sổ trống');
  function mkJob(client, price) {
    const j = { id: W.nid(), client: client, type: 'Wedding', medium: 'Digital', stage: 'Tư vấn',
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: '', deadline: '',
      price: price, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j); return j;
  }
  // (a) Nhảy kề Tư vấn -> Chốt cọc: không xác nhận, mở form cọc điền sẵn 40% của 15tr = 6tr
  const ja = mkJob('Khách A', 15000000);
  W.jumpToStage(ja.id, 1);
  eq('nhảy kề: sang Chốt cọc ngay', ja.stage, 'Chốt cọc');
  await sleep(700);
  const txForm = doc.querySelector('#txForm');
  t('nhảy Chốt cọc: mở form ghi cọc', !!txForm);
  if (txForm) eq('form cọc điền sẵn 6.000.000', txForm.elements.amount.value, '6.000.000');
  await closeSheet();
  // (a2) Nhảy xa Tư vấn -> Hậu kỳ: có xác nhận, bấm Nhảy thì sang
  const jb = mkJob('Khách B', 15000000);
  W.jumpToStage(jb.id, 5);
  eq('nhảy xa: chưa xác nhận thì vẫn Tư vấn', jb.stage, 'Tư vấn');
  t('nhảy xa: hiện sheet xác nhận', !!lastAsheetBtn('[data-a="0"]'));
  lastAsheetBtn('[data-a="0"]').click(); await sleep(200);
  eq('nhảy xa: bấm Nhảy thì sang Hậu kỳ', jb.stage, 'Hậu kỳ');
  // (b) Xong khi còn thiếu tiền: chặn, bấm "Vẫn xong, thiếu sau" mới xong
  eq('job B còn thiếu 15tr', W.jobOwe(jb), 15000000);
  W.setStage(jb, 'Xong');
  eq('xong-thiếu-tiền: chưa xác nhận thì vẫn Hậu kỳ', jb.stage, 'Hậu kỳ');
  t('xong-thiếu-tiền: hiện sheet cảnh báo', !!lastAsheetBtn('[data-a="1"]'));
  lastAsheetBtn('[data-a="1"]').click(); await sleep(200);
  eq('xong-thiếu-tiền: bấm "Vẫn xong" thì sang Xong', jb.stage, 'Xong');
  // (c) Huỷ -> khôi phục về Tư vấn
  const jc = mkJob('Khách C', 5000000);
  W.jobAction('cancel', jc.id);
  lastAsheetBtn('[data-a="0"]').click(); await sleep(200);
  eq('huỷ: cancelled = true', jc.cancelled, true);
  t('huỷ: jobAction next bị chặn', (W.jobAction('next', jc.id), jc.stage === 'Tư vấn'));
  W.jobAction('restore', jc.id);
  eq('khôi phục: cancelled = false', jc.cancelled, false);
  eq('khôi phục: về Tư vấn', jc.stage, 'Tư vấn');
  // (e) Mở mới hoàn toàn: banner mẫu ẩn, sample false, 0 job
  const w3 = await loadDom();
  eq('mở mới: state.sample false', w3.win.state.sample, false);
  eq('mở mới: 0 job', w3.win.state.jobs.length, 0);
  t('mở mới: #sampleBanner ẩn', w3.doc.querySelector('#sampleBanner').classList.contains('hidden'));

  console.log('\n[14] Đăng nhập bằng Apple (v2.1): hàng ẩn trên web, hiện khi có plugin');
  // (a) Bản web: không có window.Capacitor -> Cài đặt không có mục Tài khoản
  W.state.cfg.apple = null;
  W.openSettings();
  await sleep(100);
  const _sheets14 = doc.querySelectorAll('.sheet .sheet-body');
  const st14 = _sheets14[_sheets14.length - 1];
  t('web: Cài đặt không có nút Apple', !st14.querySelector('#aConnRow'));
  t('web: Cài đặt không có mục Tài khoản', !st14.innerHTML.includes('Đăng nhập bằng Apple'));
  await saveSheet();
  // (b) App iPhone: mock Capacitor + bridge (trả kèm token để kiểm tra không lưu token)
  const appleMock = { user: '000123.abc', email: 'a@privaterelay.appleid.com', givenName: 'Mai', familyName: 'Anh', idToken: 'FAKE-ID-TOKEN', authorizationCode: 'FAKE-AUTH-CODE' };
  const { win: wA, doc: dA } = await loadDom(w => {
    w.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: {} };
    w.__fotobroAppleAvailable = () => true;
    w.__fotobroAppleSignIn = async () => ({ ...appleMock });
  });
  DOC = dA;
  eq('apple: mặc định cfg.apple null', wA.state.cfg.apple, null);
  wA.openSettings();
  await sleep(100);
  let stA = dA.querySelectorAll('.sheet .sheet-body');
  stA = stA[stA.length - 1];
  t('apple: Cài đặt có nút Đăng nhập bằng Apple', !!stA.querySelector('#aConnRow'));
  t('apple: có mục Tài khoản', stA.innerHTML.includes('Tài khoản'));
  stA.querySelector('#aConnRow').click();
  await sleep(300);
  eq('apple: cfg.apple.user', wA.state.cfg.apple.user, '000123.abc');
  eq('apple: tên Mai Anh', wA.state.cfg.apple.name, 'Mai Anh');
  eq('apple: email relay', wA.state.cfg.apple.email, 'a@privaterelay.appleid.com');
  eq('apple: relay true', wA.state.cfg.apple.relay, true);
  // (c) không lưu token
  const savedA = wA.localStorage.getItem('troLyXeo.v1') || '';
  t('apple: localStorage không chứa idToken giả', !savedA.includes('FAKE-ID-TOKEN'));
  t('apple: localStorage không chứa authorizationCode giả', !savedA.includes('FAKE-AUTH-CODE'));
  // (d) Cài đặt hiện trạng thái đã đăng nhập
  stA = dA.querySelectorAll('.sheet .sheet-body');
  stA = stA[stA.length - 1];
  t('apple: đã đăng nhập hiện tên Mai Anh', stA.innerHTML.includes('Mai Anh'));
  t('apple: đã đăng nhập có nút Đăng xuất', !!stA.querySelector('#aDisc'));
  t('apple: relay có chú thích Email ẩn', stA.innerHTML.includes('Email ẩn'));
  // (e) đăng nhập lần 2 không trả tên/email -> giữ tên cũ
  wA.__fotobroAppleSignIn = async () => ({ user: '000123.abc', email: null, givenName: null, familyName: null });
  await wA.aConnect();
  await sleep(200);
  eq('apple lần 2: tên Mai Anh còn nguyên', wA.state.cfg.apple.name, 'Mai Anh');
  eq('apple lần 2: email relay còn nguyên', wA.state.cfg.apple.email, 'a@privaterelay.appleid.com');
  // (f) bấm Huỷ: im lặng, không toast lỗi, cfg không đổi
  const origToast = wA.toast;
  const seenToasts = [];
  wA.toast = function(m, k){ seenToasts.push(m); };
  wA.__fotobroAppleSignIn = async () => null;
  await wA.aConnect();
  await sleep(100);
  eq('apple huỷ: cfg.apple.user không đổi', wA.state.cfg.apple.user, '000123.abc');
  t('apple huỷ: không toast nào', seenToasts.length === 0, seenToasts.join('|'));
  wA.toast = origToast;
  // (g) đăng xuất: xoá apple, job/tiền không đổi
  const jobsBefore = wA.state.jobs.length, txsBefore = wA.state.txs.length;
  wA.aDisconnect();
  await sleep(100);
  lastAsheetBtn('[data-a="0"]').click();
  await sleep(300);
  eq('apple đăng xuất: cfg.apple null', wA.state.cfg.apple, null);
  eq('apple đăng xuất: số job không đổi', wA.state.jobs.length, jobsBefore);
  eq('apple đăng xuất: số tx không đổi', wA.state.txs.length, txsBefore);
  // (h) mergeCfg + wipeAll
  const dApple = wA.mergeCfg({ apple: { user: 'x9', name: 'Test', email: 't@x.com', relay: false, at: 123 } });
  eq('mergeCfg giữ apple.user', dApple.apple.user, 'x9');
  eq('mergeCfg giữ apple.name', dApple.apple.name, 'Test');
  eq('mergeCfg apple không user -> null', wA.mergeCfg({ apple: { name: 'NoUser' } }).apple, null);
  wA.state.cfg.apple = { user: 'x9', name: 'Test', email: 't@x.com', relay: false, at: 1 };
  wA.saveLocal();
  t('wipe: trước wipe có troLyXeo.v1', !!wA.localStorage.getItem('troLyXeo.v1'));
  wA.wipeAll();
  await sleep(600);
  t('wipe: sau wipe mất troLyXeo.v1', !wA.localStorage.getItem('troLyXeo.v1'));
  eq('wipe: sau wipe cfg.apple null', wA.state.cfg.apple, null);
  await saveSheet();

  console.log('\n[15] Bridge Apple (capacitor-bridge.js): map kết quả phẳng, Huỷ im lặng');
  const bridgeSrc = fs.readFileSync(path.join(__dirname, 'www', 'capacitor-bridge.js'), 'utf-8');
  async function loadBridge(signInImpl){
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w){
        w.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios',
          Plugins: { AppleSignIn: signInImpl ? { signIn: signInImpl } : {} } };
      }
    });
    const s = dom.window.document.createElement('script');
    s.textContent = bridgeSrc;
    dom.window.document.body.appendChild(s);
    await new Promise(r => setTimeout(r, 50));
    return dom.window;
  }
  const bw1 = await loadBridge(async () => ({ user: '000123.abc', email: 'a@privaterelay.appleid.com', givenName: 'Mai', familyName: 'Anh', idToken: 'FAKE-ID-TOKEN', authorizationCode: 'FAKE-AUTH-CODE', realUserStatus: 'LIKELY_REAL' }));
  t('bridge: AppleSignIn có sẵn', bw1.__fotobroAppleAvailable() === true);
  const br1 = await bw1.__fotobroAppleSignIn();
  eq('bridge: user', br1.user, '000123.abc');
  eq('bridge: email', br1.email, 'a@privaterelay.appleid.com');
  eq('bridge: givenName', br1.givenName, 'Mai');
  eq('bridge: familyName', br1.familyName, 'Anh');
  t('bridge: không trả idToken', !('idToken' in br1));
  t('bridge: không trả authorizationCode', !('authorizationCode' in br1));
  const bw2 = await loadBridge(async () => { const e = new Error('Sign in was canceled.'); e.code = 'SIGN_IN_CANCELED'; throw e; });
  eq('bridge: Huỷ -> null', await bw2.__fotobroAppleSignIn(), null);
  const bw3 = await loadBridge(async () => { throw new Error('Network error'); });
  let threw = false;
  try { await bw3.__fotobroAppleSignIn(); } catch (e) { threw = true; }
  t('bridge: lỗi thật -> throw', threw);
  const bw4 = await loadBridge(null);
  t('bridge: không plugin -> available false', bw4.__fotobroAppleAvailable() === false);
  eq('bridge: không plugin -> signIn null', await bw4.__fotobroAppleSignIn(), null);

  console.log('\n===== KẾT QUẢ: ' + pass + ' đạt / ' + (pass + fail) + ' =====');
  if (fail) { console.log('FAILURES:', fails.join(' | ')); process.exit(1); }
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
