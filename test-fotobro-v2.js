/* Test FotoBro iOS v2.1 — chạy bằng jsdom, không cần trình duyệt.
   Từ repo root: NODE_PATH=/tmp/film-verify/node_modules node test-fotobro-v2.js
   (trên CI: NODE_PATH=node_modules node test-fotobro-v2.js, sau npm ci + npm i --no-save jsdom)
   Base: www/index.html. Kỳ vọng:
   - Mặc định người mới: tên/studio/instagram rỗng, giá digital mặc định
     (Portrait 2.5tr, Couple 4tr, Wedding 15tr, Lookbook 8tr, Event 5tr —
     giá web v2.5), giá film đều 0 = chưa đặt.
   - Dữ liệu cũ của Xèo (cfg đã lưu) vẫn giữ nguyên tên/giá khi merge.
   - Storage key troLyXeo.v1 KHÔNG đổi; định dạng sao lưu là envelope v2
     (fotobro-backup, có ảnh) — tên file cũ fotobro-sao-luu.json đã bỏ. */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const vm = require('vm');

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
  eq('APP_VERSION 2.1', W.APP_VERSION, '2.1');
  eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
  // Phương án A (20/11/2026): 5 ô = 4 màn (home, jobs, money, depts/Thêm) + nút Ghi nhanh ở giữa
  t('đủ 5 ô thanh tab (4 màn + nút Ghi)', doc.querySelectorAll('.tabbar button').length === 5 &&
    [...doc.querySelectorAll('.tabbar button[data-view]')].map(b => b.getAttribute('data-view')).join(',') === 'home,jobs,money,depts' &&
    !!doc.querySelector('.tabbar #tabAdd'),
    [...doc.querySelectorAll('.tabbar button[data-view]')].map(b => b.getAttribute('data-view')).join(','));
  t('source chứa fotobro-backup-', html.includes('fotobro-backup-'));
  t('source không chứa fotobro-sao-luu.json', !html.includes('fotobro-sao-luu.json'));

  console.log('\n[1] Config mặc định người mới: trống + giá digital mặc định, film 0');
  const d0 = W.mergeCfg(null);
  eq('mergeCfg(null).name rỗng', d0.name, '');
  eq('mergeCfg(null).studio rỗng', d0.studio, '');
  eq('mergeCfg(null).instagram rỗng', d0.instagram, '');
  eq('mergeCfg(null).prices Portrait=2.5tr', d0.prices.Portrait, 2500000);
  eq('mergeCfg(null).prices Couple=4tr', d0.prices.Couple, 4000000);
  eq('mergeCfg(null).prices Wedding=15tr', d0.prices.Wedding, 15000000);
  eq('mergeCfg(null).prices Lookbook=8tr', d0.prices.Lookbook, 8000000);
  eq('mergeCfg(null).prices Event=5tr', d0.prices.Event, 5000000);
  eq('mergeCfg(null).pricesFilm Portrait=0', d0.pricesFilm.Portrait, 0);
  eq('mergeCfg(null).pricesFilm Wedding=0', d0.pricesFilm.Wedding, 0);
  eq('mergeCfg(null).extraHour=0', d0.extraHour, 0);
  eq('mergeCfg(null).depositPct giữ 40', d0.depositPct, 40);
  eq('mergeCfg(null).deliverDays giữ 14', d0.deliverDays, 14);
  eq('state.cfg mặc định name rỗng', W.state.cfg.name, '');
  eq('state.cfg mặc định prices Wedding=15tr', W.state.cfg.prices.Wedding, 15000000);

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
  eq('cfg cũ thiếu Wedding -> về mặc định 15tr', dOld2.prices.Wedding, 15000000);

  console.log('\n[3] priceFor: mặc định digital có giá, film 0, Cả hai cần cả 2 giá');
  eq('mặc định Digital Portrait = 2.5tr', W.priceFor('Portrait', 'Digital'), 2500000);
  eq('mặc định Digital Wedding = 15tr', W.priceFor('Wedding', 'Digital'), 15000000);
  eq('mặc định Film Portrait = 0 (chưa đặt)', W.priceFor('Portrait', 'Film'), 0);
  eq('mặc định Cả hai Portrait = 0 (film chưa đặt)', W.priceFor('Portrait', 'Cả hai'), 0);
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
  W.jobFilter = 'Đã huỷ';
  W.jobAction('restore', jc.id);
  eq('khôi phục: cancelled = false', jc.cancelled, false);
  eq('khôi phục: về Tư vấn', jc.stage, 'Tư vấn');
  eq('khôi phục: jobFilter về Tất cả', W.jobFilter, 'Tất cả');
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

  console.log('\n[16] B1: nợ job Xong vẫn tính, job huỷ loại, job chưa ghi giá không tính là trả đủ');
  DOC = doc; // [14] đã đổi DOC sang DOM Apple — các mục sau dùng lại DOM gốc
  W.state.jobs = []; W.state.txs = [];
  function mk16(client, price, stage, paid) {
    const j = { id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage,
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: '', deadline: '',
      price, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j);
    if (paid) W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: paid, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    return j;
  }
  const jDone = mk16('Khách Xong', 2500000, 'Xong', 1000000);   // thiếu 1.5tr
  const jRun = mk16('Khách Chạy', 4000000, 'Sắp chụp', 0);       // thiếu 4tr
  const jCx = mk16('Khách Huỷ', 15000000, 'Đã giao', 0); jCx.cancelled = true;
  const jNoPrice = mk16('Khách Chưa Giá', 0, 'Đã giao', 0);
  eq('B1: totalOwe gồm Xong 1.5tr + Chạy 4tr = 5.5tr', W.totalOwe(), 5500000);
  t('B1: debtorsText có Khách Xong', W.debtorsText().includes('Khách Xong'));
  t('B1: debtorsText không có Khách Huỷ', !W.debtorsText().includes('Khách Huỷ'));
  t('B1: assistant "ai chưa trả tiền?" có Khách Xong', W.answer('ai chưa trả tiền?').includes('Khách Xong'));
  W.renderMoney();
  t('B1: sổ Tiền bạc liệt kê Khách Xong còn thiếu', doc.querySelector('#oweList').textContent.includes('Khách Xong'));
  t('B1: sổ Tiền bạc không nói trả đủ khi còn thiếu', !doc.querySelector('#oweList').textContent.includes('trả đủ hết rồi'));
  t('B1: sổ Tiền bạc không liệt kê Khách Huỷ', !doc.querySelector('#oweList').textContent.includes('Khách Huỷ'));
  t('B1: "Lời theo từng job" không có Khách Huỷ', !doc.querySelector('#jobProfit').textContent.includes('Khách Huỷ'));
  t('B1: "Lời theo từng job" có Khách Xong thiếu 1.5tr', doc.querySelector('#jobProfit').textContent.includes('Khách Xong') && doc.querySelector('#jobProfit').textContent.includes('1.500.000'));
  t('B1: chi tiết job chưa ghi giá hiện "Chưa ghi giá"', W.jobDetailHTML(jNoPrice).includes('Chưa ghi giá'));
  t('B1: chi tiết job chưa ghi giá không nói "Đã thu đủ"', !W.jobDetailHTML(jNoPrice).includes('Đã thu đủ'));
  W.state.jobs = [jNoPrice]; W.state.txs = [];
  W.renderMoney();
  t('B1: chỉ còn job chưa ghi giá -> báo "chưa ghi giá"', doc.querySelector('#oweList').textContent.includes('chưa ghi giá'));

  console.log('\n[17] B2: trợ lý "tháng"/"thanh toán" không lọt nhánh hạn giao');
  W.state.jobs = []; W.state.txs = [];
  const a1 = W.answer('Tháng này lời bao nhiêu?');
  t('B2: "Tháng này lời bao nhiêu?" đáp về lời', a1.includes('lời') && !a1.includes('hạn giao'), a1);
  const a2 = W.answer('tháng này thu bao nhiêu');
  t('B2: "tháng này thu bao nhiêu" đáp về thu', a2.includes('Thu tháng này') && !a2.includes('hạn giao'), a2);
  const a3 = W.answer('tháng này chi bao nhiêu');
  t('B2: "tháng này chi bao nhiêu" đáp về chi', a3.includes('Chi tháng này') && !a3.includes('hạn giao'), a3);
  const jDebt = mk16('Khách Nợ', 2500000, 'Sắp chụp', 1000000);
  const a4 = W.answer('khách nào chưa thanh toán');
  t('B2: "khách nào chưa thanh toán" đáp về nợ', a4.includes('Khách Nợ') && a4.includes('1.500.000') && !a4.includes('hạn giao'), a4);
  const a5 = W.answer('Job nào sắp tới hạn giao?');
  t('B2: "sắp tới hạn giao" vẫn đáp về hạn', a5.includes('hạn giao'), a5);

  console.log('\n[18] Google scope theo công tắc (không xin thừa)');
  W.state.cfg.gFeat = { cal: true, bank: false, leads: false, contacts: false, drive: false, calw: false, send: false };
  eq('scope chỉ cal: 1 scope đọc lịch', W.gScopes(), 'https://www.googleapis.com/auth/calendar.readonly');
  W.state.cfg.gFeat.bank = true;
  t('scope +bank: thêm gmail.readonly', W.gScopes().includes('https://www.googleapis.com/auth/gmail.readonly'));
  t('scope +bank: vẫn không có gmail.send', !W.gScopes().includes('https://www.googleapis.com/auth/gmail.send'));
  W.state.cfg.gFeat.calw = true; W.state.cfg.gFeat.send = true; W.state.cfg.gFeat.contacts = true; W.state.cfg.gFeat.drive = true;
  const sc = W.gScopes();
  t('scope đủ: có calendar.events', sc.includes('https://www.googleapis.com/auth/calendar.events'));
  t('scope đủ: có gmail.send', sc.includes('https://www.googleapis.com/auth/gmail.send'));
  t('scope đủ: có contacts.readonly', sc.includes('https://www.googleapis.com/auth/contacts.readonly'));
  t('scope đủ: có drive.metadata.readonly', sc.includes('https://www.googleapis.com/auth/drive.metadata.readonly'));
  W.state.cfg.gFeat = { cal: false, bank: false, leads: false, contacts: false, drive: false, calw: false, send: false };
  eq('scope không bật gì: rỗng', W.gScopes(), '');
  W.state.cfg.gFeat = { cal: true, bank: false, leads: false, contacts: false, drive: false, calw: false, send: false };

  console.log('\n[19] Sao lưu v2: envelope, phân loại file, khôi phục tròn');
  eq('backupFileName', W.backupFileName('2026-11-20'), 'fotobro-backup-20261120.json');
  eq('photosFileName', W.photosFileName('2026-11-20'), 'fotobro-photos-20261120.json');
  W.state.jobs = [mk16('Khách Backup', 2500000, 'Sắp chụp', 1000000)];
  W.state.txs = W.state.txs.filter(t => t.jobId === W.state.jobs[0].id);
  const env = await W.buildBackupData();
  eq('backup: format', env.format, 'fotobro-backup');
  eq('backup: version 2', env.version, 2);
  eq('backup: appVersion 2.1', env.appVersion, '2.1');
  t('backup: có exportedAt', typeof env.exportedAt === 'string' && env.exportedAt.length > 10);
  eq('backup: counts.jobs 1', env.counts.jobs, 1);
  eq('backup: counts.txs 1', env.counts.txs, 1);
  eq('backup: counts.photos 0 (jsdom không có IndexedDB)', env.counts.photos, 0);
  eq('parse v2', W.parseBackupFile(env).kind, 'v2');
  eq('parse v1 cũ', W.parseBackupFile({ jobs: [], txs: [] }).kind, 'v1');
  eq('parse mã hoá', W.parseBackupFile({ format: 'fotobro-encrypted-backup', version: 1 }).kind, 'encrypted');
  eq('parse file ảnh riêng', W.parseBackupFile({ format: 'fotobro-photos', version: 1, photos: [] }).kind, 'photos');
  eq('parse file rác', W.parseBackupFile({ foo: 1 }).kind, 'invalid');
  eq('parse null', W.parseBackupFile(null).kind, 'invalid');
  W.state.jobs = [mk16('Khách Hiện Tại', 1000000, 'Tư vấn', 0)];
  const res = await W.restoreBackupData(env);
  eq('restore: jobs về lại 1', res.jobs, 1);
  eq('restore: txs về lại 1', res.txs, 1);
  eq('restore: state.jobs[0] là Khách Backup', W.state.jobs[0].client, 'Khách Backup');
  t('restore: bản dự phòng giữ job hiện tại', (W.localStorage.getItem('troLyXeo.backupSafety') || '').includes('Khách Hiện Tại'));
  W.checkDone = { 'job:1': { 'Sạc đầy pin': true } };
  const v1env = { jobs: [{ id: 1, client: 'Khách V1', type: 'Portrait', stage: 'Tư vấn', price: 2500000 }], txs: [], cfg: { name: 'V1' } };
  await W.restoreBackupData(v1env);
  eq('restore v1: job về', W.state.jobs[0].client, 'Khách V1');
  t('restore v1: checkDone hiện tại giữ nguyên', !!(W.checkDone['job:1'] && W.checkDone['job:1']['Sạc đầy pin'] === true));

  console.log('\n[20] PIN xuyên phiên: đếm lưu localStorage');
  W.lockTries = 3; W.lockUntil = Date.now() + 60000; W.lockStateSave();
  W.lockTries = 0; W.lockUntil = 0; W.lockStateLoad();
  eq('PIN: tải lại vẫn nhớ 3 lần sai', W.lockTries, 3);
  t('PIN: lockUntil còn hạn', W.lockUntil > Date.now());
  W.lockUntil = Date.now() - 1000; W.lockStateSave();
  W.lockTries = 9; W.lockStateLoad();
  eq('PIN: hết hạn khoá thì reset về 0', W.lockTries, 0);
  W.lockTries = 0; W.lockUntil = 0; W.lockStateSave();

  console.log('\n[21] Cọc thống nhất depFor + mẫu không khẳng định sai');
  W.state.cfg.depositPct = 40;
  eq('depFor 2.535.000đ = 1.010.000 (10.000đ)', W.depFor({ price: 2535000 }), 1010000);
  const jTpl = mk16('Khách Mẫu', 2535000, 'Chốt cọc', 0);
  eq('chatCtx coc dùng depFor = 1.010.000₫', W.chatCtx(jTpl).coc, '1.010.000₫');
  eq('suggestKey Chốt cọc chưa cọc -> baogia', W.suggestKey(jTpl), 'baogia');
  W.pickMsg(jTpl);
  const pickLabels = [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent);
  t('pickMsg chưa cọc: không có mẫu "Đã nhận cọc"', !pickLabels.some(l => l.includes('Đã nhận cọc')), pickLabels.join(' | '));
  const pickCancel = doc.querySelector('.asheet .cancel'); if (pickCancel) pickCancel.click();
  W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: jTpl.id, amount: 1010000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
  eq('suggestKey Chốt cọc đã cọc -> coc', W.suggestKey(jTpl), 'coc');
  t('chat "Đã nhận cọc" dùng số cọc thật 1.010.000₫', W.chatMsg('coc', jTpl).includes('1.010.000'));
  t('chat "Đã nhận cọc" không nói "Đã nhận 0₫"', !W.chatMsg('coc', jTpl).includes('Đã nhận 0₫'));
  eq('mailCtx depPaid = 1.010.000₫', W.mailCtx(jTpl).depPaid, '1.010.000₫');
  t('email deposit dùng {tiền cọc} thật', W.fillTpl(W.MAIL_TPLS_DEFAULT.deposit.b, W.mailCtx(jTpl)).includes('1.010.000'));
  const jNoDrive = mk16('Khách Không Link', 2500000, 'Đã chụp', 0);
  t('chat "Mời chọn ảnh" không link thì không nhắc link', !W.chatMsg('chon', jNoDrive).includes('link'));

  console.log('\n[22] Hiển thị + Cài đặt: giọng nói, máy tính film, Sắp tới, Quyền riêng tư');
  t('source không còn "Giọng nói sẽ có ở bản v2.1"', !html.includes('Giọng nói sẽ có ở bản v2.1'));
  t('source có "Giọng nói sẽ có ở bản sau"', html.includes('Giọng nói sẽ có ở bản sau'));
  W.state.cfg.prices.Wedding = 15000000; W.state.cfg.pricesFilm.Wedding = 22000000;
  t('calcPkgOptions Film hiện giá film 22tr', W.calcPkgOptions('Film').includes('Wedding — 22.000.000'));
  t('calcPkgOptions Digital hiện giá digital 15tr', W.calcPkgOptions('Digital').includes('Wedding — 15.000.000'));
  const cdDep = W.cleanData({ jobs: [{ id: 5, client: 'X', depPrompted: true }], txs: [] });
  eq('cleanData giữ cờ depPrompted', cdDep.jobs[0].depPrompted, true);
  W.state.jobs = [mk16('Khách Xa', 2500000, 'Tư vấn', 0)];
  W.state.jobs[0].shootDate = W.dstr(10);
  W.renderHome();
  t('Hôm nay có mục Sắp tới', !!doc.querySelector('#upcomingSec'));
  t('job 10 ngày tới hiện ở Sắp tới (không ẩn)', !doc.querySelector('#upcomingSec').classList.contains('hidden'));
  t('job 10 ngày tới có trong danh sách Sắp tới', doc.querySelector('#upcomingList').textContent.includes('Khách Xa'));
  W.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  W.openSettings();
  await sleep(100);
  const _sheets22 = doc.querySelectorAll('.sheet .sheet-body');
  const st22 = _sheets22[_sheets22.length - 1];
  t('Cài đặt có hàng Quyền riêng tư', !!st22.querySelector('#privacyRow'));
  t('Cài đặt có hàng "Đăng nhập Google để làm gì?"', !!st22.querySelector('#gGuideRow'));
  t('Cài đặt có hàm openGGuide', typeof W.openGGuide === 'function');
  t('Cài đặt có hàm openPrivacy', typeof W.openPrivacy === 'function');
  const calSw = st22.querySelector('[data-gfeat="cal"]');
  t('cal switch mờ/vô hiệu khi chưa kết nối', !!(calSw && calSw.disabled === true));
  await saveSheet();

  console.log('\n[23] fix-01 — B1: nợ job Xong vẫn tính, job huỷ loại, job chưa ghi giá');
  {
    const { win: W, doc, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION 2.1', W.APP_VERSION, '2.1');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');

    const mk01 = function (client, price, stage, paid, cancelled) {
      const j = { id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage,
        stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: '', deadline: '',
        price, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: !!cancelled };
      W.state.jobs.unshift(j);
      if (paid) W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: paid, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
      return j;
    }
    const reset01 = function () { W.state.jobs = []; W.state.txs = []; }

    /* --- A. Tái hiện đúng báo cáo Mai: job 4tr, cọc 1.6tr, Xong khi còn thiếu 2.4tr --- */
    console.log('\n[A] Job Xong còn thiếu 2.4tr vẫn hiện khắp nơi');
    reset01();
    const jDone = mk01('Khách Xong', 4000000, 'Xong', 1600000);
    const jRun = mk01('Khách Chạy', 4000000, 'Sắp chụp', 0);
    eq('A1: totalOwe = 2.4tr (Xong) + 4tr (chạy) = 6.4tr', W.totalOwe(), 6400000);
    t('A2: debtorsText có Khách Xong + 2.400.000', W.debtorsText().includes('Khách Xong') && W.debtorsText().includes('2.400.000'), W.debtorsText());
    t('A3: trợ lý "ai chưa trả tiền?" có Khách Xong', W.answer('ai chưa trả tiền?').includes('Khách Xong'));
    W.renderMoney(); W.renderHome();
    t('A4: sổ Tiền bạc liệt kê Khách Xong + 2.400.000', doc.querySelector('#oweList').textContent.includes('Khách Xong') && doc.querySelector('#oweList').textContent.includes('2.400.000'));
    t('A5: "Lời theo từng job" có Khách Xong thiếu 2.400.000', doc.querySelector('#jobProfit').textContent.includes('Khách Xong') && doc.querySelector('#jobProfit').textContent.includes('2.400.000'));
    t('A6: tile Hôm nay "Khách còn thiếu" hiện 6,4 triệu (2.4 Xong + 4 chạy)', doc.querySelector('#homeStats').textContent.includes('Khách còn thiếu') && doc.querySelector('#homeStats').textContent.includes('6,4') && doc.querySelector('#homeStats').textContent.includes('triệu'), doc.querySelector('#homeStats').textContent);
    t('A7: todayItems nhắc nợ job Xong', W.todayItems().some(function(it){ return it.title.includes('Khách Xong') && it.title.includes('còn thiếu 2.400.000'); }), JSON.stringify(W.todayItems().map(function(i){ return i.title; })));

    /* --- B. Mọi khoản thiếu đều nằm trên job Xong -> không được nói "trả đủ hết rồi" --- */
    console.log('\n[B] Chỉ còn nợ trên job Xong: không chỗ nào được nói "trả đủ"');
    reset01();
    mk01('Khách Xong', 4000000, 'Xong', 1600000);
    eq('B1: totalOwe = 2.4tr', W.totalOwe(), 2400000);
    t('B2: debtorsText không nói "trả đủ hết rồi"', !W.debtorsText().includes('trả đủ hết rồi') && W.debtorsText().includes('Khách Xong'), W.debtorsText());
    t('B3: deptLines Tiền bạc nêu đúng tổng thiếu 2.400.000', W.deptLines('tienbac').join(' ').includes('2.400.000') && !W.deptLines('tienbac').join(' ').includes('Không ai nợ'), W.deptLines('tienbac').join(' | '));
    W.renderMoney();
    t('B4: sổ Tiền bạc không nói "trả đủ hết rồi"', !doc.querySelector('#oweList').textContent.includes('trả đủ hết rồi'));

    /* --- C. Job đã huỷ: không tính thiếu ở bất cứ đâu --- */
    console.log('\n[C] Job đã huỷ không hiện thiếu');
    reset01();
    const jCx = mk01('Khách Huỷ', 15000000, 'Đã giao', 0, true);
    mk01('Khách Chạy', 4000000, 'Sắp chụp', 0);
    eq('C1: totalOwe chỉ tính job chạy = 4tr (loại 15tr của job huỷ)', W.totalOwe(), 4000000);
    t('C2: debtorsText không có Khách Huỷ', !W.debtorsText().includes('Khách Huỷ'));
    t('C3: trợ lý "ai chưa trả tiền?" không có Khách Huỷ', !W.answer('ai chưa trả tiền?').includes('Khách Huỷ'));
    W.renderMoney();
    t('C4: sổ Tiền bạc không liệt kê Khách Huỷ', !doc.querySelector('#oweList').textContent.includes('Khách Huỷ'));
    t('C5: "Lời theo từng job" không có Khách Huỷ', !doc.querySelector('#jobProfit').textContent.includes('Khách Huỷ'));

    /* --- D. Chỉ còn job chưa ghi giá (giá 0) -> "Chưa ghi giá", không "trả đủ" --- */
    console.log('\n[D] Job giá 0 không tính là "trả đủ"');
    reset01();
    const jNoPrice = mk01('Khách Chưa Giá', 0, 'Đã giao', 0);
    eq('D1: totalOwe = 0 (job giá 0 không sinh nợ)', W.totalOwe(), 0);
    t('D2: debtorsText nói "chưa ghi giá", không nói "trả đủ hết rồi"', W.debtorsText().includes('chưa ghi giá') && !W.debtorsText().includes('trả đủ hết rồi'), W.debtorsText());
    t('D3: deptLines Tiền bạc nói "chưa ghi giá"', W.deptLines('tienbac').join(' ').includes('chưa ghi giá'), W.deptLines('tienbac').join(' | '));
    t('D4: deptLines Đón khách nói "chưa ghi giá"', W.deptLines('donkhach').join(' ').includes('chưa ghi giá'));
    W.renderMoney();
    t('D5: sổ Tiền bạc báo "chưa ghi giá", không nói "trả đủ hết rồi"', doc.querySelector('#oweList').textContent.includes('chưa ghi giá') && !doc.querySelector('#oweList').textContent.includes('trả đủ hết rồi'));
    t('D6: chi tiết job chưa ghi giá hiện "Chưa ghi giá"', W.jobDetailHTML(jNoPrice).includes('Chưa ghi giá'));
    t('D7: chi tiết job chưa ghi giá không nói "Đã thu đủ"', !W.jobDetailHTML(jNoPrice).includes('Đã thu đủ'));

    /* --- E. Đối chứng dương: thật sự không còn nợ, không còn job chưa ghi giá --- */
    console.log('\n[E] Thật sự trả đủ hết -> vẫn hiện "trả đủ hết rồi"');
    reset01();
    mk01('Khách Đủ', 2500000, 'Xong', 2500000);
    eq('E1: totalOwe = 0', W.totalOwe(), 0);
    t('E2: debtorsText vẫn nói "trả đủ hết rồi"', W.debtorsText().includes('trả đủ hết rồi'), W.debtorsText());
    W.renderMoney();
    t('E3: sổ Tiền bạc vẫn nói "trả đủ hết rồi"', doc.querySelector('#oweList').textContent.includes('trả đủ hết rồi'));
  }
  console.log('\n[24] fix-02 — B2 trợ lý "tháng"/"thanh toán", mẫu cọc/link, "Nhắc lịch chụp"');
  {
  const closeSheet02 = async () => { const b = lastSheetEl('.sh-l'); if (b) { b.click(); await sleep(300); } };
  const closeAsheet02 = () => { const b = DOC.querySelector('.asheet .cancel'); if (b) b.click(); };
    const { win, doc, errors } = await loadDom();
    DOC = doc;
    const W = win;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION 2.1', W.APP_VERSION, '2.1');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
    W.state.cfg.depositPct = 40;

    const mkJob02 = function (client, price, stage, shootDate, deposit, driveLink, depCategory) {
      const j = { id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage: stage || 'Tư vấn',
        stageSince: W.dstr(0), shootDate: shootDate || '', shootTime: '15:00', location: 'Studio Quận 1', deadline: '',
        price: price || 0, phone: '', email: 'khach@example.com', fbLink: '', msLink: '', driveLink: driveLink || '', note: '', cancelled: false };
      W.state.jobs.unshift(j);
      if (deposit) W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: depCategory || 'Cọc', jobId: j.id, amount: deposit, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
      return j;
    }

    console.log('\n[A] B2: trợ lý với "tháng" / "thanh toán"');
    W.state.jobs = []; W.state.txs = [];
    const jDebt = mkJob02('Khách Nợ', 2500000, 'Sắp chụp', W.dstr(2), 1000000); // còn thiếu 1.500.000
    const jDl = mkJob02('Khách Hạn', 2500000, 'Hậu kỳ', W.dstr(5), 0); jDl.deadline = W.dstr(3);
    let a = W.answer('Tháng này lời bao nhiêu?');
    t('B2: "Tháng này lời bao nhiêu?" đáp về lời, không về hạn', a.includes('lời') && !a.includes('hạn giao'), a);
    a = W.answer('tháng này thu bao nhiêu');
    t('B2: "tháng này thu bao nhiêu" đáp về thu', a.includes('Thu tháng này') && !a.includes('hạn giao'), a);
    a = W.answer('tháng này chi bao nhiêu');
    t('B2: "tháng này chi bao nhiêu" đáp về chi', a.includes('Chi tháng này') && !a.includes('hạn giao'), a);
    a = W.answer('khách nào chưa thanh toán');
    t('B2: "khách nào chưa thanh toán" đáp về nợ', a.includes('Khách Nợ') && a.includes('1.500.000') && !a.includes('hạn giao'), a);
    a = W.answer('hạn giao trong 7 ngày tới');
    t('B2: "hạn giao trong 7 ngày tới" vẫn về nhánh hạn', a.includes('hạn giao') && a.includes('Khách Hạn'), a);
    a = W.answer('sắp tới hạn giao');
    t('B2: "sắp tới hạn giao" vẫn về nhánh hạn', a.includes('hạn giao'), a);
    a = W.answer('Job nào sắp tới hạn giao?');
    t('B2: "Job nào sắp tới hạn giao?" vẫn về nhánh hạn', a.includes('hạn giao'), a);
    a = W.answer('ai chưa trả tiền?');
    t('B2: "ai chưa trả tiền?" đáp về nợ', a.includes('Khách Nợ'), a);

    console.log('\n[B] Mẫu "Đã nhận cọc" (chat) — chỉ khi có tx Cọc thật');
    W.state.jobs = []; W.state.txs = [];
    const jNoDep = mkJob02('Khách Chưa Cọc', 2535000, 'Chốt cọc', W.dstr(5), 0);
    eq('coc: suggestKey Chốt cọc chưa cọc -> baogia', W.suggestKey(jNoDep), 'baogia');
    t('coc: chat "Đã nhận cọc" khi chưa cọc thì xin cọc, không khẳng định đã nhận',
      !W.chatMsg('coc', jNoDep).includes('nhận cọc') && W.chatMsg('coc', jNoDep).includes('cọc trước'), W.chatMsg('coc', jNoDep));
    t('coc: msgFor job chưa cọc không khẳng định đã nhận', !W.msgFor(jNoDep).includes('nhận cọc'), W.msgFor(jNoDep));
    W.pickMsg(jNoDep);
    let pickLabels = [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent);
    t('coc: pickMsg chưa cọc không liệt kê "Đã nhận cọc"', !pickLabels.some(l => l.includes('Đã nhận cọc')), pickLabels.join(' | '));
    closeAsheet02();
    // Cọc ghi ở hạng mục khác (không phải "Cọc") thì KHÔNG tính là đã nhận cọc.
    const jWrongCat = mkJob02('Khách Cọc Sai Mục', 2535000, 'Chốt cọc', W.dstr(5), 1010000, '', 'Tiền sau buổi chụp');
    eq('coc: cọc ghi sai hạng mục -> suggestKey vẫn baogia', W.suggestKey(jWrongCat), 'baogia');
    eq('coc: cọc ghi sai hạng mục -> depPaid rỗng', W.chatCtx(jWrongCat).depPaid, '');
    t('coc: cọc ghi sai hạng mục -> chat không khẳng định đã nhận', !W.chatMsg('coc', jWrongCat).includes('nhận cọc'), W.chatMsg('coc', jWrongCat));
    // Cọc thật (tx hạng mục "Cọc") thì dùng được, dùng đúng số cọc thật.
    const jDep = mkJob02('Khách Đã Cọc', 2535000, 'Chốt cọc', W.dstr(5), 1010000);
    eq('coc: suggestKey Chốt cọc đã cọc -> coc', W.suggestKey(jDep), 'coc');
    t('coc: chat "Đã nhận cọc" dùng số cọc thật 1.010.000₫', W.chatMsg('coc', jDep).includes('1.010.000'), W.chatMsg('coc', jDep));
    t('coc: chat "Đã nhận cọc" không nói "Đã nhận 0₫"', !W.chatMsg('coc', jDep).includes('Đã nhận 0₫'));
    W.pickMsg(jDep);
    pickLabels = [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent);
    t('coc: pickMsg đã cọc có liệt kê "Đã nhận cọc"', pickLabels.some(l => l.includes('Đã nhận cọc')), pickLabels.join(' | '));
    closeAsheet02();
    t('coc: danh sách chung (Sen) không có mẫu "Đã nhận cọc"', !W.tplRows('Lan').includes('Đã nhận cọc'));

    console.log('\n[C] Mẫu "Mời chọn ảnh" — chỉ nhắc link khi có link Drive thật');
    W.state.jobs = []; W.state.txs = [];
    const jNoDrive = mkJob02('Khách Không Link', 2500000, 'Đã chụp', W.dstr(0), 0);
    t('chon: không link thì không nhắc link', !W.chatMsg('chon', jNoDrive).includes('link'), W.chatMsg('chon', jNoDrive));
    eq('chon: không link vẫn gợi ý chon ở bước Đã chụp', W.suggestKey(jNoDrive), 'chon');
    const jDrive = mkJob02('Khách Có Link', 2500000, 'Đã chụp', W.dstr(0), 0, 'https://drive.google.com/drive/folders/abc123');
    t('chon: có link thì nhắc link + kèm đúng link', W.chatMsg('chon', jDrive).includes('https://drive.google.com/drive/folders/abc123'), W.chatMsg('chon', jDrive));

    console.log('\n[D] "Nhắc lịch chụp" — hôm nay bỏ "ngủ sớm", ngày mai giữ');
    W.state.jobs = []; W.state.txs = [];
    const jToday = mkJob02('Khách Hôm Nay', 2500000, 'Sắp chụp', W.dstr(0), 0);
    const jTmr = mkJob02('Khách Ngày Mai', 2500000, 'Sắp chụp', W.dstr(1), 0);
    const jLater = mkJob02('Khách Xa', 2500000, 'Sắp chụp', W.dstr(5), 0);
    t('nhac: chat job hôm nay KHÔNG có "ngủ sớm"', !W.chatMsg('nhac', jToday).includes('ngủ sớm'), W.chatMsg('nhac', jToday));
    t('nhac: chat job hôm nay vẫn dặn tới sớm', W.chatMsg('nhac', jToday).includes('Tới sớm 10 phút'), W.chatMsg('nhac', jToday));
    t('nhac: chat job ngày mai CÓ "ngủ sớm"', W.chatMsg('nhac', jTmr).includes('ngủ sớm'), W.chatMsg('nhac', jTmr));
    t('nhac: chat job 5 ngày nữa CÓ "ngủ sớm"', W.chatMsg('nhac', jLater).includes('ngủ sớm'), W.chatMsg('nhac', jLater));
    t('nhac: email job hôm nay KHÔNG có "ngủ sớm"', !W.mailCtx(jToday).prepLine.includes('ngủ sớm'), W.mailCtx(jToday).prepLine);
    t('nhac: email job ngày mai CÓ "ngủ sớm"', W.mailCtx(jTmr).prepLine.includes('ngủ sớm'), W.mailCtx(jTmr).prepLine);
    t('nhac: email remind đã điền, job hôm nay KHÔNG có "ngủ sớm"',
      !W.fillTpl(W.MAIL_TPLS_DEFAULT.remind.b, W.mailCtx(jToday)).includes('ngủ sớm'));
    t('nhac: email remind đã điền, job ngày mai CÓ "ngủ sớm"',
      W.fillTpl(W.MAIL_TPLS_DEFAULT.remind.b, W.mailCtx(jTmr)).includes('ngủ sớm'));

    console.log('\n[E] Email "Đã nhận cọc" — composer chặn khi chưa có cọc');
    W.state.jobs = []; W.state.txs = [];
    const jMailNoDep = mkJob02('Khách Mail Chưa Cọc', 2535000, 'Chốt cọc', W.dstr(5), 0);
    const jMailDep = mkJob02('Khách Mail Đã Cọc', 2535000, 'Chốt cọc', W.dstr(5), 1010000);
    eq('mail: mailCtx depPaid rỗng khi chưa cọc', W.mailCtx(jMailNoDep).depPaid, '');
    t('mail: email deposit đã điền, job đã cọc dùng số thật 1.010.000₫',
      W.fillTpl(W.MAIL_TPLS_DEFAULT.deposit.b, W.mailCtx(jMailDep)).includes('1.010.000'));
    t('mail: email deposit đã điền, job đã cọc không nói "Đã nhận 0₫"',
      !W.fillTpl(W.MAIL_TPLS_DEFAULT.deposit.b, W.mailCtx(jMailDep)).includes('Đã nhận 0₫'));
    // Mở composer với key='deposit' cho job CHƯA cọc -> phải rơi về mẫu "Xác nhận lịch chụp".
    W.openComposer(jMailNoDep.id, 'deposit');
    await sleep(150);
    let subj = lastSheetEl('textarea[name="subject"]');
    t('mail: composer mở deposit cho job chưa cọc -> rơi về Xác nhận lịch chụp',
      !!subj && subj.value.indexOf('Xác nhận lịch chụp') === 0, subj && subj.value);
    const depPill = lastSheetEl('#mailTpls .pill[data-mt="deposit"]');
    t('mail: pill "Đã nhận cọc" bị vô hiệu khi chưa cọc', !!(depPill && depPill.disabled));
    await closeSheet02();
    // Job ĐÃ cọc: pill bật, mở thẳng deposit thì tiêu đề là "Đã nhận cọc".
    W.openComposer(jMailDep.id, 'deposit');
    await sleep(150);
    subj = lastSheetEl('textarea[name="subject"]');
    t('mail: composer mở deposit cho job đã cọc -> tiêu đề "Đã nhận cọc"',
      !!subj && subj.value.indexOf('Đã nhận cọc') === 0, subj && subj.value);
    const depPill2 = lastSheetEl('#mailTpls .pill[data-mt="deposit"]');
    t('mail: pill "Đã nhận cọc" bật khi đã cọc', !!(depPill2 && !depPill2.disabled));
    await closeSheet02();
  }
  console.log('\n[25] fix-03 — Giá mặc định + tự điền theo loại/hình thức, ô cọc trong form tạo job');
  {
    const { win, doc, errors } = await loadDom();
    DOC = doc;
    const W = win;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION 2.1', W.APP_VERSION, '2.1');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');

    console.log('\n[1] Giá mặc định Digital (web v2.5), Film 0 = chưa đặt');
    const d0 = W.mergeCfg(null);
    eq('mặc định Portrait 2.500.000', d0.prices.Portrait, 2500000);
    eq('mặc định Couple 4.000.000', d0.prices.Couple, 4000000);
    eq('mặc định Wedding 15.000.000', d0.prices.Wedding, 15000000);
    eq('mặc định Lookbook 8.000.000', d0.prices.Lookbook, 8000000);
    eq('mặc định Event 5.000.000', d0.prices.Event, 5000000);
    eq('mặc định Film Portrait 0', d0.pricesFilm.Portrait, 0);
    eq('mặc định Film Wedding 0', d0.pricesFilm.Wedding, 0);
    eq('mặc định Film Couple 0', d0.pricesFilm.Couple, 0);

    console.log('\n[2] mergeCfg GIỮ giá người dùng đã lưu, không ghi đè bằng mặc định mới');
    const dOld = W.mergeCfg({ name: 'Xèo', prices: { Portrait: 3000000, Couple: 4500000 }, pricesFilm: { Wedding: 20000000 } });
    eq('cfg cũ: Portrait giữ 3.000.000', dOld.prices.Portrait, 3000000);
    eq('cfg cũ: Couple giữ 4.500.000', dOld.prices.Couple, 4500000);
    eq('cfg cũ: Wedding digital về mặc định 15tr', dOld.prices.Wedding, 15000000);
    eq('cfg cũ: Wedding film giữ 20.000.000', dOld.pricesFilm.Wedding, 20000000);
    eq('cfg cũ: Film Portrait về 0', dOld.pricesFilm.Portrait, 0);

    console.log('\n[3] Tạo job Couple tự điền 4.000.000; đổi loại/hình thức thì giá theo bảng mới');
    W.state.cfg.prices = { Portrait: 2500000, Couple: 4000000, Wedding: 15000000, Lookbook: 8000000, Event: 5000000 };
    W.state.cfg.pricesFilm = { Portrait: 3500000, Couple: 2000000, Wedding: 20000000, Lookbook: 0, Event: 0 };
    W.openJobForm(null);
    let form = lastForm();
    eq('form mới: giá Portrait Digital 2.500.000', form.elements.price.value, '2.500.000');
    setSel(form.querySelector('select[name="type"]'), 'Couple');
    eq('đổi sang Couple Digital -> 4.000.000', form.elements.price.value, '4.000.000');
    setSel(form.querySelector('select[name="medium"]'), 'Film');
    eq('đổi sang Film -> 2.000.000', form.elements.price.value, '2.000.000');
    setSel(form.querySelector('select[name="medium"]'), 'Cả hai');
    eq('đổi sang Cả hai -> 6.000.000', form.elements.price.value, '6.000.000');
    setSel(form.querySelector('select[name="medium"]'), 'Digital');
    eq('đổi lại Digital -> 4.000.000', form.elements.price.value, '4.000.000');
    form.elements.client.value = 'Khách Couple';
    await saveSheet();
    const jCouple = W.state.jobs.find(j => j.client === 'Khách Couple');
    t('job Couple đã lưu', !!jCouple);
    eq('job Couple lưu giá 4.000.000', jCouple && jCouple.price, 4000000);
    await sleep(500);

    console.log('\n[4] Tạo job mới với pre.type (vd từ Gmail): giá theo đúng loại, không nhầm Portrait');
    W.openJobForm(null, { client: 'Khách Gmail', type: 'Wedding' });
    form = lastForm();
    eq('pre Wedding Digital -> 15.000.000', form.elements.price.value, '15.000.000');
    await closeSheet();
    W.openJobForm(null, { client: 'Khách Film', type: 'Wedding', medium: 'Film' });
    form = lastForm();
    eq('pre Wedding Film (đã đặt 20tr) -> 20.000.000', form.elements.price.value, '20.000.000');
    await closeSheet();
    W.state.cfg.pricesFilm.Wedding = 0;
    W.openJobForm(null, { client: 'Khách Film Chưa Giá', type: 'Wedding', medium: 'Film' });
    form = lastForm();
    eq('pre Wedding Film chưa đặt giá -> để trống', form.elements.price.value, '');
    await closeSheet();
    W.state.cfg.pricesFilm.Wedding = 20000000;

    console.log('\n[5] Cọc làm tròn thống nhất depFor (10.000đ) ở mẫu chat báo giá');
    eq('depFor(2.535.000đ) = 1.010.000', W.depFor({ price: 2535000 }), 1010000);
    const jLe = { id: 999001, client: 'Khách Lẻ', type: 'Portrait', medium: 'Digital', stage: 'Tư vấn', price: 2535000, shootDate: '', shootTime: '', location: '' };
    eq('chatCtx coc = 1.010.000₫', W.chatCtx(jLe).coc, '1.010.000₫');
    const msgBaoGia = W.chatMsg('baogia', jLe);
    t('mẫu chat báo giá ghi cọc 1.010.000', msgBaoGia.includes('1.010.000'), msgBaoGia);
    t('mẫu chat báo giá KHÔNG còn 1.014.000', !msgBaoGia.includes('1.014.000'), msgBaoGia);

    console.log('\n[6] Form tạo job mới có ô cọc tùy chọn; nhập cọc thì ghi khoản thu Cọc');
    W.openJobForm(null);
    form = lastForm();
    t('form tạo mới có ô cọc', !!form.elements.deposit);
    eq('ô cọc placeholder "Chưa nhận thì để trống"', form.elements.deposit.placeholder, 'Chưa nhận thì để trống');
    form.elements.client.value = 'Khách Có Cọc';
    form.elements.deposit.value = '1000000';
    fire(form.elements.deposit, 'input');
    eq('gõ cọc 1000000 thì ô hiện 1.000.000 (moneyInput)', form.elements.deposit.value, '1.000.000');
    const txBefore = W.state.txs.length;
    await saveSheet();
    await sleep(500);
    const jCoc = W.state.jobs.find(j => j.client === 'Khách Có Cọc');
    t('job Khách Có Cọc đã lưu', !!jCoc);
    const txCoc = W.state.txs.find(tx => tx.jobId === (jCoc && jCoc.id) && tx.category === 'Cọc');
    t('có khoản thu Cọc gắn job', !!txCoc, 'txs=' + W.state.txs.length + ' before=' + txBefore);
    eq('khoản Cọc đúng 1.000.000', txCoc && txCoc.amount, 1000000);
    eq('khoản Cọc kind thu', txCoc && txCoc.kind, 'thu');
    eq('jobDep(job) = 1.000.000', W.jobDep(jCoc), 1000000);

    console.log('\n[7] Để trống ô cọc thì không ghi khoản thu nào');
    const txBefore2 = W.state.txs.length;
    W.openJobForm(null);
    form = lastForm();
    form.elements.client.value = 'Khách Không Cọc';
    eq('ô cọc mặc định trống', form.elements.deposit.value, '');
    await saveSheet();
    await sleep(500);
    const jNoCoc = W.state.jobs.find(j => j.client === 'Khách Không Cọc');
    t('job Khách Không Cọc đã lưu', !!jNoCoc);
    eq('không thêm khoản thu nào', W.state.txs.length, txBefore2);
    eq('jobDep = 0', W.jobDep(jNoCoc), 0);

    console.log('\n[8] Form SỬA job không có ô cọc (cọc sửa ở tab Tiền bạc)');
    W.openJobForm(jCoc);
    form = lastForm();
    t('form sửa không có ô cọc', !form.elements.deposit);
    await closeSheet();

    console.log('\n[9] "0 đồng" có khoảng trắng (tile Hôm nay + fmtShort)');
    eq('fmtShort(0) = "0 đồng"', W.fmtShort(0), '0 đồng');
    t('fmtShort(0) không có "0đồng"', !W.fmtShort(0).includes('0đồng'));
    /* Các test trước đã tạo job/tx nên tile không còn 0: reset sổ trống rồi kiểm tra tile. */
    W.state.jobs.length = 0; W.state.txs.length = 0;
    if (typeof W.renderAll === 'function') W.renderAll();
    await sleep(100);
    const homeTxt = doc.querySelector('#homeStats') ? doc.querySelector('#homeStats').textContent : '';
    t('tile Hôm nay chứa "0 đồng" (có khoảng trắng)', homeTxt.includes('0 đồng'), homeTxt);
    t('tile Hôm nay không chứa "0đồng"', !homeTxt.includes('0đồng'), homeTxt);
  }
  console.log('\n[26] fix-04 — Số tiền chính xác: Lời từng job, sổ thu chi, tile, oweTitle');
  {
    const { win: W, doc, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    t('APP_VERSION vẫn 2.1', W.APP_VERSION === '2.1', String(W.APP_VERSION));
    t('storage key giữ troLyXeo.v1', W.LS_KEY === 'troLyXeo.v1', String(W.LS_KEY));

    /* Job Linh Chi: giá 5.000.000, đã thu 3.200.000, chi 1.150.000 -> lời 2.050.000, thiếu 1.800.000.
       Số lẻ này là trường hợp Mai báo: làm tròn "Thu 3,2tr · Chi 1,2tr" nhưng "+2,1 triệu" (3,2-1,2=2,0). */
    W.state.jobs = []; W.state.txs = [];
    const j = { id: W.nid(), client: 'Linh Chi', type: 'Portrait', medium: 'Digital', stage: 'Đã chụp',
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: '', deadline: '',
      price: 5000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j);
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: 3200000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    W.state.txs.unshift({ id: W.nid(), kind: 'chi', category: 'Thuê đèn', jobId: j.id, amount: 1150000, date: W.dstr(0), method: 'Tiền mặt', note: '', src: '' });

    W.renderMoney();
    const profitTxt = doc.querySelector('#jobProfit').textContent;
    const txTxt = doc.querySelector('#txList').textContent;
    const statsHtml = doc.querySelector('#moneyStats').innerHTML;

    console.log('\n[fix-04] Lời theo từng job hiện số chính xác');
    t('jobProfit có Thu chính xác 3.200.000', profitTxt.includes('Thu 3.200.000'), profitTxt);
    t('jobProfit có Chi chính xác 1.150.000', profitTxt.includes('Chi 1.150.000'), profitTxt);
    t('jobProfit lời chính xác +2.050.000', profitTxt.includes('+2.050.000'), profitTxt);
    t('jobProfit không còn số làm tròn cộng sai "+2,1"', !profitTxt.includes('2,1'), profitTxt);
    t('jobProfit không còn "3,2tr"/"1,2tr"', !profitTxt.includes('3,2tr') && !profitTxt.includes('1,2tr'), profitTxt);
    t('jobProfit có thiếu chính xác 1.800.000', profitTxt.includes('thiếu 1.800.000'), profitTxt);

    console.log('\n[fix-04] Sổ thu chi hiện số chính xác từng khoản');
    t('txList có khoản thu +3.200.000', txTxt.includes('+3.200.000'), txTxt);
    t('txList có khoản chi 1.150.000', txTxt.includes('1.150.000'), txTxt);
    t('txList tổng ngày +2.050.000 (không phải số làm tròn)', txTxt.includes('+2.050.000'), txTxt);
    t('txList không có "3,2tr"', !txTxt.includes('3,2tr'), txTxt);

    console.log('\n[fix-04] Tile tháng giữ số làm tròn + có số chính xác kèm');
    const cells = [...doc.querySelectorAll('#moneyStats .msum-c')];
    t('đủ 3 ô Thu/Chi/Lời', cells.length === 3, String(cells.length));
    const cellTxt = i => cells[i] ? cells[i].textContent : '';
    t('tile Thu: làm tròn "3,2 triệu" + chính xác "3.200.000₫"', cellTxt(0).includes('3,2 triệu') && cellTxt(0).includes('3.200.000'), cellTxt(0));
    t('tile Chi: làm tròn "1,2 triệu" + chính xác "1.150.000₫"', cellTxt(1).includes('1,2 triệu') && cellTxt(1).includes('1.150.000'), cellTxt(1));
    t('tile Lời: làm tròn "2,1 triệu" + chính xác "2.050.000₫"', cellTxt(2).includes('2,1 triệu') && cellTxt(2).includes('2.050.000'), cellTxt(2));
    t('tile Thu có span .exact', !!doc.querySelector('#moneyStats .msum-c .exact'));

    console.log('\n[fix-04] Tiêu đề "Khách còn thiếu" hiện số chính xác');
    t('oweTitle = "Khách còn thiếu · 1.800.000₫"',
      doc.querySelector('#oweTitle').textContent === 'Khách còn thiếu · 1.800.000₫',
      doc.querySelector('#oweTitle').textContent);
    t('oweTitle không còn "1,8 triệu"', !doc.querySelector('#oweTitle').textContent.includes('1,8 triệu'));

    console.log('\n[fix-04] Tile Hôm nay (Thu tháng này / Khách còn thiếu) có số chính xác');
    W.renderHome();
    const thuTile = doc.querySelector('[data-tile="thu"]');
    const oweTile = doc.querySelector('[data-tile="owe"]');
    t('tile Thu tháng này còn số làm tròn', thuTile && thuTile.textContent.includes('3,2'), thuTile && thuTile.textContent);
    t('tile Thu tháng này có số chính xác 3.200.000₫', thuTile && thuTile.textContent.includes('3.200.000'), thuTile && thuTile.textContent);
    t('tile Khách còn thiếu còn số làm tròn', oweTile && oweTile.textContent.includes('1,8'), oweTile && oweTile.textContent);
    t('tile Khách còn thiếu có số chính xác 1.800.000₫', oweTile && oweTile.textContent.includes('1.800.000'), oweTile && oweTile.textContent);
    t('tile có span .tx (dòng số chính xác)', !!doc.querySelector('[data-tile="thu"] .tx'));
  }
  console.log('\n[27] fix-05 — Nhắc lịch job gấp: 12h -> 60 phút -> nhắc ngay');
  {
  const bridgeSrc05 = fs.readFileSync(path.join(__dirname, 'www', 'capacitor-bridge.js'), 'utf-8');
  const NOON05 = new Date(2026, 10, 20, 12, 0, 0).getTime();
  const SOON05 = new Date(2026, 10, 20, 14, 30, 0).getTime();
  const LATE05 = new Date(2026, 10, 20, 16, 0, 0).getTime();
  const T140005 = new Date(2026, 10, 20, 14, 0, 0).getTime();
  const T0300_NEXT05 = new Date(2026, 10, 21, 3, 0, 0).getTime();
  const T0800_NEXT05 = new Date(2026, 10, 21, 8, 0, 0).getTime();

  const jobToday05 = { id: 1, client: 'Lan Anh', type: 'Portrait', medium: 'Digital', stage: 'Sắp chụp',
    shootDate: '2026-11-20', shootTime: '15:00', location: 'Studio Quận 1',
    deadline: '2026-11-21', price: 2500000, note: '', phone: '', email: '', driveLink: '', cancelled: false };
  const jobTomorrow05 = { id: 2, client: 'Minh Tuấn', type: 'Couple', medium: 'Digital', stage: 'Tư vấn',
    shootDate: '2026-11-21', shootTime: '15:00', location: '',
    deadline: '2026-11-28', price: 4000000, note: '', phone: '', email: '', driveLink: '', cancelled: false };

  const runBridge05 = function (fixedNow) {
    const RealDate = Date;
    class FakeDate extends RealDate {
      constructor(...a) { super(...a); }
      static now() { return fixedNow; }
    }
    const recorded = [];
    const win = {
      Capacitor: {
        isNativePlatform: () => true,
        getPlatform: () => 'ios',
        Plugins: {
          App: { addListener() {} },
          LocalNotifications: {
            requestPermissions: async () => ({ display: 'granted' }),
            schedule: async (o) => { recorded.push(...o.notifications); },
            cancel: async () => {},
          },
        },
      },
    };
    const sandbox = { window: win, document: { addEventListener() {} }, Date: FakeDate, console };
    vm.createContext(sandbox);
    vm.runInContext(bridgeSrc05, sandbox, { filename: 'capacitor-bridge.js' });
    return { win, recorded };
  }
    /* ============ [A] Helper shootReminderInfo trong index.html ============ */
    console.log('\n[A] shootReminderInfo() — logic tính giờ nhắc');
    const { win: W, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    t('shootReminderInfo có trên window', typeof W.shootReminderInfo === 'function');
    const ri = W.shootReminderInfo;

    const a1 = ri(jobToday05, NOON05);
    eq('job hôm nay 15:00, trưa 12:00 → mode 60m', a1 && a1.mode, '60m');
    eq('job hôm nay 15:00, trưa 12:00 → nhắc lúc 14:00', a1 && a1.at, T140005);

    const a2 = ri(jobTomorrow05, NOON05);
    eq('job ngày mai 15:00, trưa hôm nay → mode 12h', a2 && a2.mode, '12h');
    eq('job ngày mai 15:00 → nhắc 03:00 ngày mai', a2 && a2.at, T0300_NEXT05);

    const a3 = ri(jobToday05, SOON05);
    eq('job hôm nay 15:00, lúc 14:30 → mode now', a3 && a3.mode, 'now');
    eq('job hôm nay 15:00, lúc 14:30 → nhắc ngay (now+30s)', a3 && a3.at, SOON05 + 30000);

    eq('giờ chụp đã qua (16:00) → null, không nhắc', ri(jobToday05, LATE05), null);
    eq('không có ngày chụp → null', ri({ id: 9, shootDate: '' }, NOON05), null);
    eq('không ghi giờ chụp → mặc định 08:00, đã qua lúc trưa → null',
      ri({ id: 9, shootDate: '2026-11-20', shootTime: '' }, NOON05), null);

    console.log('\n[A2] Cảnh báo trong chi tiết job (jobDetailHTML)');
    const realNow = W.Date.now;
    W.Date.now = () => NOON05; // giả lập "bây giờ" là trưa 20/11
    const hToday = W.jobDetailHTML(jobToday05);
    t('chi tiết job gấp hôm nay có cảnh báo mốc 12h đã qua',
      hToday.indexOf('Mốc nhắc 12 tiếng trước đã qua') >= 0);
    t('chi tiết job gấp hôm nay ghi rõ nhắc 60 phút trước, lúc 14:00',
      hToday.indexOf('60 phút trước giờ chụp, lúc 14:00') >= 0);
    const hTomorrow = W.jobDetailHTML(jobTomorrow05);
    t('chi tiết job ngày mai (nhắc 12h bình thường) KHÔNG hiện cảnh báo',
      hTomorrow.indexOf('Mốc nhắc 12 tiếng trước đã qua') < 0 &&
      hTomorrow.indexOf('Buổi chụp trong chưa tới 60 phút') < 0);
    const hCancelled = W.jobDetailHTML(Object.assign({}, jobToday05, { cancelled: true }));
    t('job đã huỷ KHÔNG hiện cảnh báo nhắc lịch',
      hCancelled.indexOf('Mốc nhắc 12 tiếng trước đã qua') < 0);
    W.Date.now = realNow;

    /* ============ [B] Cầu nối bridge đặt lịch nhắc thật ============ */
    console.log('\n[B] capacitor-bridge.js — lịch nhắc Local Notifications đặt ra');
    t('bridge expose __trolyxeoScheduleReminder', true); // kiểm tra thật ở dưới từng context

    const b1 = runBridge05(NOON05);
    t('bridge [trưa]: expose __trolyxeoScheduleReminder',
      typeof b1.win.__trolyxeoScheduleReminder === 'function');
    await b1.win.__trolyxeoScheduleReminder(jobToday05);
    const shoot1 = b1.recorded.filter(n => n.title.indexOf('lịch chụp') >= 0);
    const dl1 = b1.recorded.filter(n => n.title.indexOf('hạn giao') >= 0);
    eq('bridge [trưa]: job hôm nay 15:00 có đúng 1 nhắc chụp', shoot1.length, 1);
    eq('bridge [trưa]: nhắc chụp đặt lúc 14:00 (60 phút trước), không bị bỏ',
      shoot1[0] && shoot1[0].schedule.at.getTime(), T140005);
    eq('bridge [trưa]: nhắc hạn giao đặt 08:00 ngày mai (mốc 24h đã qua → 60 phút trước hạn)',
      dl1[0] && dl1[0].schedule.at.getTime(), T0800_NEXT05);

    const b2 = runBridge05(NOON05);
    await b2.win.__trolyxeoScheduleReminder(jobTomorrow05);
    const shoot2 = b2.recorded.filter(n => n.title.indexOf('lịch chụp') >= 0);
    eq('bridge [trưa]: job ngày mai 15:00 nhắc đúng 12h trước (03:00 ngày mai)',
      shoot2[0] && shoot2[0].schedule.at.getTime(), T0300_NEXT05);

    const b3 = runBridge05(SOON05);
    await b3.win.__trolyxeoScheduleReminder(jobToday05);
    const shoot3 = b3.recorded.filter(n => n.title.indexOf('lịch chụp') >= 0);
    eq('bridge [14:30]: job 15:00 hôm nay nhắc ngay (now+30s)',
      shoot3[0] && shoot3[0].schedule.at.getTime(), SOON05 + 30000);

    const b4 = runBridge05(LATE05);
    await b4.win.__trolyxeoScheduleReminder({ id: 3, client: 'Khách muộn', type: 'Event',
      shootDate: '2026-11-20', shootTime: '15:00', deadline: '' });
    eq('bridge [16:00]: giờ chụp đã qua, không ngày giao → không đặt nhắc nào',
      b4.recorded.length, 0);
  }
  console.log('\n[28] fix-06 — Pipeline UX: "Để sau" form cọc, tạo job Chốt cọc, khôi phục, nhãn nút');
  {
  const lastSheetEl06 = function (doc, sel) { const els = doc.querySelectorAll('.sheet ' + sel); return els[els.length - 1]; }
  const lastAsheetBtn06 = function (doc, sel) { const els = doc.querySelectorAll('.asheet ' + sel); return els[els.length - 1]; }
  const mkJob06 = function (W, client, price) {
    const j = { id: W.nid(), client: client, type: 'Wedding', medium: 'Digital', stage: 'Tư vấn',
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: '', deadline: '',
      price: price, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j); return j;
  }
    console.log('[A] "Để sau" trong form cọc mở từ setStage');
    let { win: W, doc, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    const ja = mkJob06(W, 'Khách A', 15000000);
    W.jumpToStage(ja.id, 1);
    eq('nhảy kề: sang Chốt cọc ngay', ja.stage, 'Chốt cọc');
    await sleep(700);
    t('vào Chốt cọc: mở form ghi cọc', !!doc.querySelector('#txForm'));
    const deferBtn = doc.querySelector('#txDefer');
    t('form cọc có nút "Để sau"', !!deferBtn && deferBtn.textContent.toLowerCase().includes('để sau'), deferBtn ? deferBtn.textContent : 'không có nút');
    eq('nút trái form cọc là "Đóng" (không phải "Huỷ")', lastSheetEl06(doc, '.sh-l').textContent, 'Đóng');
    if (doc.querySelector('#txForm')) eq('form cọc điền sẵn 6.000.000', doc.querySelector('#txForm').elements.amount.value, '6.000.000');
    deferBtn.click();
    await sleep(500);
    eq('bấm "Để sau": depPrompted = true', ja.depPrompted, true);
    t('bấm "Để sau": form cọc đã đóng', !doc.querySelector('#txForm'));
    eq('bấm "Để sau": vẫn ở Chốt cọc (chuyển bước không bị huỷ)', ja.stage, 'Chốt cọc');
    eq('bấm "Để sau": chưa ghi cọc nào', W.jobDep(ja), 0);
    W.setStage(ja, 'Sắp chụp');
    eq('rời sang Sắp chụp', ja.stage, 'Sắp chụp');
    await sleep(200);
    W.setStage(ja, 'Chốt cọc');
    eq('vào lại Chốt cọc', ja.stage, 'Chốt cọc');
    await sleep(700);
    t('vào lại Chốt cọc: form cọc KHÔNG mở lại', !doc.querySelector('#txForm'));
    // Cờ bền qua reload (localStorage -> cleanData -> loadLocal)
    const saved = W.localStorage.getItem('troLyXeo.v1');
    const w2 = await loadDom(w => { w.localStorage.setItem('troLyXeo.v1', saved); });
    const reloaded = w2.win.state.jobs.find(j => j.id === ja.id);
    eq('reload: depPrompted vẫn true', reloaded && reloaded.depPrompted, true);
    eq('reload: job vẫn ở Chốt cọc', reloaded && reloaded.stage, 'Chốt cọc');

    console.log('\n[A2] Job đã có cọc thì vào Chốt cọc không mở form');
    ({ win: W, doc } = await loadDom());
    const jd = mkJob06(W, 'Khách Đã Cọc', 15000000);
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: jd.id, amount: 6000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    eq('job đã có cọc 6tr', W.jobDep(jd), 6000000);
    W.jumpToStage(jd.id, 1);
    await sleep(700);
    t('đã có cọc: form cọc KHÔNG mở', !doc.querySelector('#txForm'));

    console.log('\n[B] Tạo job mới ở bước Chốt cọc chưa có cọc -> hỏi nhập cọc sau khi lưu');
    ({ win: W, doc } = await loadDom());
    W.openJobForm(null);
    let form = doc.querySelector('#jobForm');
    t('mở form thêm job', !!form);
    form.elements.client.value = 'Khách Mới';
    setSel(form.querySelector('select[name="type"]'), 'Wedding');
    eq('chọn Wedding -> giá tự điền 15tr', form.elements.price.value, '15.000.000');
    setSel(form.querySelector('select[name="stage"]'), 'Chốt cọc');
    eq('ô cọc để trống', form.elements.deposit.value, '');
    lastSheetEl06(doc, '.sh-r').click();
    await sleep(900);
    const jm = W.state.jobs[0];
    eq('job mới đã lưu, client Khách Mới', jm && jm.client, 'Khách Mới');
    eq('job mới ở bước Chốt cọc', jm && jm.stage, 'Chốt cọc');
    eq('job mới giá 15tr', jm && jm.price, 15000000);
    t('sau khi lưu: mở form hỏi nhập cọc', !!doc.querySelector('#txForm'));
    if (doc.querySelector('#txForm')) eq('form cọc gợi ý 6.000.000 (40% của 15tr)', doc.querySelector('#txForm').elements.amount.value, '6.000.000');
    t('form cọc có nút "Để sau"', !!doc.querySelector('#txDefer'));
    doc.querySelector('#txDefer').click();
    await sleep(500);
    eq('bấm "Để sau": depPrompted = true', jm.depPrompted, true);
    t('bấm "Để sau": form cọc đã đóng', !doc.querySelector('#txForm'));
    eq('chưa ghi cọc nào cho job mới', W.jobDep(jm), 0);

    console.log('\n[C] Khôi phục job đã huỷ khi đang lọc "Đã huỷ"');
    ({ win: W, doc } = await loadDom());
    const jc = mkJob06(W, 'Khách C', 5000000);
    W.jobAction('cancel', jc.id);
    lastAsheetBtn06(doc, '[data-a="0"]').click(); await sleep(200);
    eq('huỷ: cancelled = true', jc.cancelled, true);
    W.jobFilter = 'Đã huỷ'; W.renderJobs();
    t('lọc "Đã huỷ": thấy job đã huỷ trong danh sách', doc.querySelector('#jobList').textContent.includes('Khách C'));
    W.jobAction('restore', jc.id);
    eq('khôi phục: cancelled = false', jc.cancelled, false);
    eq('khôi phục: về Tư vấn', jc.stage, 'Tư vấn');
    eq('khôi phục: jobFilter về "Tất cả"', W.jobFilter, 'Tất cả');
    W.renderJobs();
    t('sau khôi phục: thấy job trong danh sách "Tất cả"', doc.querySelector('#jobList').textContent.includes('Khách C'));
    t('sau khôi phục: không còn dòng "Chưa có buổi chụp nào"', !doc.querySelector('#jobList').textContent.includes('Chưa có buổi chụp nào'));

    console.log('\n[D] Nhãn nút chuyển bước ghi rõ bước hiện tại và bước tới');
    ({ win: W, doc } = await loadDom());
    const jn = mkJob06(W, 'Khách N', 10000000);
    t('nhãn nút ở Tư vấn: "Xong: Tư vấn → Chốt cọc"', W.jobDetailHTML(jn).includes('Xong: Tư vấn → Chốt cọc'));
    t('source không còn nhãn cũ "Xong bước này"', !html.includes('Xong bước này'));
    W.openJob(jn.id);
    await sleep(100);
    const nextBtn = doc.querySelector('[data-act="next"]');
    t('nút chuyển bước hiển thị trong sheet chi tiết', !!nextBtn);
    if (nextBtn) eq('nút trong sheet ghi đúng bước tới', nextBtn.textContent, 'Xong: Tư vấn → Chốt cọc');
    const jg = mkJob06(W, 'Khách G', 10000000); jg.stage = 'Đã giao';
    t('nhãn nút ở Đã giao: "Xong: Đã giao → Xong"', W.jobDetailHTML(jg).includes('Xong: Đã giao → Xong'));
    const jx = mkJob06(W, 'Khách X', 10000000); jx.stage = 'Xong';
    t('job đã Xong: không có nút chuyển bước', !W.jobDetailHTML(jx).includes('data-act="next"'));
    t('job đã Xong: hiện "Đã hoàn tất"', W.jobDetailHTML(jx).includes('Đã hoàn tất'));
  }
  console.log('\n[29] fix-07 — Hôm nay: "Sắp tới · 30 ngày" + 3 cách đóng sheet');
  {
  const lastSheet07 = function () { const els = DOC.querySelectorAll('.sheet'); return els[els.length - 1]; }
  const lastBd07 = function () { const els = DOC.querySelectorAll('.sheet-bd'); return els[els.length - 1]; }
  const mkJob07 = function (W, id, client, stage, shootOff, opts) {
    opts = opts || {};
    return {
      id: id, client: client, type: 'Portrait', medium: 'Digital', stage: stage,
      shootDate: W.dstr(shootOff), shootTime: '09:00', location: 'Studio Quận 1',
      deadline: '', price: (opts.price === undefined ? 2500000 : opts.price),
      phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '',
      stageSince: W.dstr(0), cancelled: !!opts.cancelled,
    };
  }
    const { win: W, doc, errors } = await loadDom();
    DOC = doc;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));

    /* Seed 7 job bao phủ các biên của 2 mục Hôm nay. */
    W.state.jobs = [
      mkJob07(W, 'j1', 'Lan Anh', 'Đã chụp', 22),                       // Sắp tới (đang ở bước Đã chụp)
      mkJob07(W, 'j2', 'Quốc Bảo', 'Xong', 22, { price: 0 }),          // Sắp tới (kể cả job đã Xong)
      mkJob07(W, 'j3', 'Hương', 'Tư vấn', 3),                           // mục 7 ngày
      mkJob07(W, 'j4', 'Tuấn', 'Sắp chụp', 7),                          // biên: đúng 7 ngày -> mục 7 ngày
      mkJob07(W, 'j5', 'Ngọc', 'Tư vấn', 8),                            // biên: 8 ngày -> Sắp tới
      mkJob07(W, 'j6', 'Dũng', 'Tư vấn', 31),                           // ngoài 30 ngày -> không mục nào
      mkJob07(W, 'j7', 'Mai', 'Tư vấn', 22, { cancelled: true }),       // đã huỷ -> không mục nào
    ];
    W.state.txs = [];
    W.renderHome();

    const upSec = doc.querySelector('#upcomingSec');
    const upList = doc.querySelector('#upcomingList');
    const todayList = doc.querySelector('#todayList');
    const upText = upList.textContent;
    const todayText = todayList.textContent;

    console.log('\n[1] Mục "Sắp tới · 30 ngày"');
    t('mục Sắp tới hiện (không hidden)', !upSec.classList.contains('hidden') && !upList.classList.contains('hidden'));
    t('tiêu đề mục là "Sắp tới · 30 ngày"', upSec.textContent.includes('Sắp tới'));
    t('Sắp tới có đúng 3 job', upList.querySelectorAll('[data-job]').length === 3,
      'got=' + upList.querySelectorAll('[data-job]').length);
    t('Sắp tới chứa job 22 ngày, bước Đã chụp (Lan Anh)', upText.includes('Lan Anh'));
    t('Sắp tới chứa job 22 ngày, bước Xong (Quốc Bảo)', upText.includes('Quốc Bảo'));
    t('Sắp tới chứa job biên 8 ngày (Ngọc)', upText.includes('Ngọc'));
    t('Sắp tới KHÔNG chứa job 3 ngày (Hương)', !upText.includes('Hương'));
    t('Sắp tới KHÔNG chứa job biên 7 ngày (Tuấn)', !upText.includes('Tuấn'));
    t('Sắp tới KHÔNG chứa job 31 ngày (Dũng)', !upText.includes('Dũng'));
    t('Sắp tới KHÔNG chứa job đã huỷ (Mai)', !upText.includes('Mai'));

    console.log('\n[2] Không trùng lặp với mục 7 ngày');
    t('mục 7 ngày chứa job 3 ngày (Hương)', todayText.includes('Hương'));
    t('mục 7 ngày chứa job biên 7 ngày (Tuấn)', todayText.includes('Tuấn'));
    t('mục 7 ngày KHÔNG chứa job 22 ngày (Lan Anh)', !todayText.includes('Lan Anh'));
    t('mục 7 ngày KHÔNG chứa job 8 ngày (Ngọc)', !todayText.includes('Ngọc'));
    t('mục 7 ngày KHÔNG chứa job 31 ngày (Dũng)', !todayText.includes('Dũng'));
    t('mục 7 ngày KHÔNG chứa job đã huỷ (Mai)', !todayText.includes('Mai'));

    console.log('\n[3] Dòng Sắp tới đủ ngày/giờ/địa điểm + bấm mở chi tiết job');
    const row1 = upList.querySelector('[data-job="j1"]');
    t('dòng Lan Anh có giờ chụp 09:00', row1.textContent.includes('09:00'));
    t('dòng Lan Anh có địa điểm Studio Quận 1', row1.textContent.includes('Studio Quận 1'));
    row1.click();
    await sleep(150);
    const sheetHead = lastSheet07().querySelector('.sheet-head');
    t('bấm dòng Sắp tới mở sheet chi tiết job', !!sheetHead && sheetHead.querySelector('b').textContent === 'Buổi chụp');
    t('sheet chi tiết hiện tên khách Lan Anh', lastSheet07().querySelector('.sheet-body').textContent.includes('Lan Anh'));

    console.log('\n[4] Nút Đóng luôn ở đầu sheet, không bị nội dung cuộn che');
    const sh = lastSheet07();
    const head = sh.querySelector('.sheet-head');
    const body = sh.querySelector('.sheet-body');
    const closeBtn = head.querySelector('.sh-l');
    t('nút Đóng có nhãn "Đóng"', closeBtn && closeBtn.textContent.trim() === 'Đóng');
    t('sheet-head là anh em trước sheet-body (không nằm trong vùng cuộn)',
      head.nextElementSibling === body && !head.closest('.sheet-body'));
    t('sheet-head không cuộn theo nội dung (flex:none)',
      W.getComputedStyle(head).flexShrink === '0');
    t('sheet-body là vùng cuộn riêng (overflow-y auto)',
      W.getComputedStyle(body).overflowY === 'auto');
    body.scrollTop = 9999; /* cuộn hết nội dung */
    await sleep(50);
    t('sau khi cuộn hết sheet-body, nút Đóng vẫn còn trong DOM và ở đầu sheet',
      !!lastSheet07().querySelector('.sheet-head .sh-l') &&
      lastSheet07().querySelector('.sheet-head').compareDocumentPosition(lastSheet07().querySelector('.sheet-body')) & 4);

    console.log('\n[5] Ba cách đóng sheet đều hoạt động');
    lastBd07().click(); /* chạm nền tối */
    await sleep(600);
    t('chạm nền tối (backdrop) đóng được sheet', !lastSheet07());

    upList.querySelector('[data-job="j1"]').click();
    await sleep(150);
    t('mở lại sheet để thử thanh kéo', !!lastSheet07());
    lastSheet07().querySelector('.sheet-grab').click(); /* chạm thanh kéo */
    await sleep(600);
    t('chạm thanh kéo (grab) đóng được sheet', !lastSheet07());

    upList.querySelector('[data-job="j1"]').click();
    await sleep(150);
    t('mở lại sheet để thử nút Đóng', !!lastSheet07());
    lastSheet07().querySelector('.sheet-head .sh-l').click(); /* nút Đóng */
    await sleep(600);
    t('nút Đóng đóng được sheet', !lastSheet07());
  }
  console.log('\n[30] fix-08 — Google: scope theo công tắc, sheet giải thích, công tắc Lịch');
  {
  const SC08 = {
    cal: 'https://www.googleapis.com/auth/calendar.readonly',
    gmail: 'https://www.googleapis.com/auth/gmail.readonly',
    contacts: 'https://www.googleapis.com/auth/contacts.readonly',
    drive: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    calevents: 'https://www.googleapis.com/auth/calendar.events',
    send: 'https://www.googleapis.com/auth/gmail.send',
  };
  const scopesOf08 = function (s) { return s ? s.split(' ').filter(Boolean) : []; }
  const setFeat08 = function (W, o) { W.state.cfg.gFeat = Object.assign({ cal: false, bank: false, leads: false, contacts: false, drive: false, calw: false, send: false }, o); }
    const vc = new VirtualConsole();
    const errors = [];
    vc.on('jsdomError', e => errors.push(String(e && e.message || e)));
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
    });
    await new Promise(r => dom.window.addEventListener('load', r));
    await new Promise(r => setTimeout(r, 50));
    const W = dom.window, doc = W.document;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION giữ 2.1', W.APP_VERSION, '2.1');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
    t('chưa kết nối Google (không token)', !W.gToken());

    console.log('\n[1] gScopes() theo đúng công tắc đang bật');
    setFeat08(W, { cal: true });
    eq('chỉ bật Lịch: scope đúng 1 scope đọc lịch', W.gScopes(), SC08.cal);
    t('chỉ bật Lịch: không có gmail.send', !W.gScopes().includes(SC08.send));
    t('chỉ bật Lịch: không có calendar.events', !W.gScopes().includes(SC08.calevents));
    t('chỉ bật Lịch: không có gmail.readonly', !W.gScopes().includes(SC08.gmail));
    setFeat08(W, { cal: true, bank: true });
    t('+bank: thêm gmail.readonly', W.gScopes().includes(SC08.gmail));
    t('+bank: vẫn không có gmail.send', !W.gScopes().includes(SC08.send));
    setFeat08(W, { cal: true, bank: true, leads: true, contacts: true, drive: true, calw: true, send: true });
    const all = scopesOf08(W.gScopes());
    eq('bật đủ 4 tính năng: đúng 6 scope', all.length, 6);
    [SC08.cal, SC08.gmail, SC08.contacts, SC08.drive, SC08.calevents, SC08.send].forEach(s => t('bật đủ: có ' + s.split('/').pop(), all.includes(s)));
    setFeat08(W, {});
    eq('không bật gì: scope rỗng', W.gScopes(), '');
    setFeat08(W, { calw: true });
    eq('chỉ bật ghi Lịch: chỉ xin calendar.events', W.gScopes(), SC08.calevents);
    setFeat08(W, { send: true });
    eq('chỉ bật gửi email: chỉ xin gmail.send', W.gScopes(), SC08.send);

    console.log('\n[2] URL auth của gConnect chứa đúng scope đã bật (incremental: include_granted_scopes=true)');
    W.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
    let capturedUrl = null;
    W.Capacitor = { isNativePlatform: () => true, Plugins: { Browser: { open: async (o) => { capturedUrl = o.url; } } } };
    W.pkceChallenge = async () => 'test-challenge-abc'; // jsdom không có crypto.subtle; PKCE không phải thứ kiểm chứng ở đây
    setFeat08(W, { cal: true });
    capturedUrl = null;
    await W.gConnect(false);
    await sleep(50);
    t('auth URL được mở (chỉ bật Lịch)', !!capturedUrl, capturedUrl);
    if (capturedUrl) {
      const u = new URL(capturedUrl);
      eq('auth URL: scope đúng calendar.readonly', u.searchParams.get('scope'), SC08.cal);
      eq('auth URL: include_granted_scopes=true (xin thêm quyền sau vẫn giữ quyền cũ)', u.searchParams.get('include_granted_scopes'), 'true');
      t('auth URL: không có gmail.send', !u.searchParams.get('scope').includes(SC08.send));
      t('auth URL: response_type=code (PKCE, không token ngầm)', u.searchParams.get('response_type') === 'code');
      t('auth URL: không xin access_type=offline (không lưu refresh token)', u.searchParams.get('access_type') !== 'offline');
    }
    setFeat08(W, { cal: true, bank: true, leads: true, contacts: true, drive: true, calw: true, send: true });
    capturedUrl = null;
    await W.gConnect(false);
    await sleep(50);
    if (capturedUrl) {
      const allUrl = scopesOf08(new URL(capturedUrl).searchParams.get('scope'));
      eq('auth URL đủ tính năng: đúng 6 scope', allUrl.length, 6);
      t('auth URL đủ: có calendar.events (ghi lịch)', allUrl.includes(SC08.calevents));
      t('auth URL đủ: có gmail.send (gửi email)', allUrl.includes(SC08.send));
    } else t('auth URL đủ tính năng: được mở', false);
    setFeat08(W, {});
    capturedUrl = null;
    await W.gConnect(false);
    await sleep(50);
    t('không bật tính năng nào: không mở màn hình Google', capturedUrl === null);

    console.log('\n[3] Bấm "Đăng nhập Google để làm gì?" mở sheet giải thích');
    setFeat08(W, { cal: true });
    W.openSettings();
    await sleep(150);
    let sheets = doc.querySelectorAll('.sheet .sheet-body');
    let st = sheets[sheets.length - 1];
    const guideRow = st.querySelector('#gGuideRow');
    t('Cài đặt có hàng "Đăng nhập Google để làm gì?"', !!guideRow);
    guideRow.click();
    await sleep(150);
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    const g = sheets[sheets.length - 1];
    const gSheets = doc.querySelectorAll('.sheet');
    const gTitle = gSheets[gSheets.length - 1].querySelector('.sheet-head b').textContent;
    eq('sheet mở ra đúng tiêu đề', gTitle, 'Đăng nhập Google để làm gì?');
    const rows = g.querySelectorAll('[data-gguide]');
    eq('sheet liệt kê đủ 7 tính năng', rows.length, 7);
    t('sheet nêu rõ quyền GHI lịch (không giấu)', g.textContent.includes('GHI vào lịch'));
    t('sheet nêu rõ quyền GỬI email (không giấu)', g.textContent.includes('GỬI email'));
    t('sheet nói rõ bật thêm sau thì xin thêm quyền', g.textContent.includes('Bật thêm tính năng sau thì Google hỏi thêm quyền đó'));
    const gCal = g.querySelector('[data-gguide="cal"]');
    t('trong sheet: hàng Google Lịch vô hiệu khi chưa kết nối', !!(gCal && gCal.disabled === true));
    const gBank = g.querySelector('[data-gguide="bank"]');
    t('trong sheet: hàng Gmail bật/tắt được trước khi kết nối', !!(gBank && gBank.disabled === false));
    t('sheet có nút Kết nối Google', !!(g.querySelector('#gGuideConn') && g.querySelector('#gGuideConn').textContent.includes('Kết nối Google')));
    // đóng sheet hướng dẫn, quay lại Cài đặt
    gSheets[gSheets.length - 1].querySelector('.sh-l').click();
    await sleep(500);

    console.log('\n[4] Công tắc Google Lịch vô hiệu khi chưa kết nối (trong Cài đặt)');
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    st = sheets[sheets.length - 1];
    const calSw = st.querySelector('[data-gfeat="cal"]');
    t('công tắc Google Lịch bị disabled', !!(calSw && calSw.disabled === true));
    t('công tắc Google Lịch ghi "Kết nối Google trước đã"', st.textContent.includes('Kết nối Google trước đã'));
    ['bank', 'leads', 'contacts', 'drive', 'calw', 'send'].forEach(k => {
      const sw = st.querySelector('[data-gfeat="' + k + '"]');
      t('công tắc ' + k + ' bật/tắt được trước khi kết nối', !!(sw && sw.disabled === false));
    });

    console.log('\n[5] Chân trang Cài đặt khớp 100% với scope thật');
    setFeat08(W, { cal: true });
    W.refreshSettings();
    await sleep(150);
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    st = sheets[sheets.length - 1];
    t('chỉ bật Lịch: chân trang liệt kê "đọc Lịch"', st.textContent.includes('đọc Lịch'));
    t('chỉ bật Lịch: chân trang không nhắc ghi/gửi', !st.textContent.includes('ghi buổi chụp vào Lịch') && !st.textContent.includes('gửi email bạn đã duyệt'));
    setFeat08(W, {});
    W.refreshSettings();
    await sleep(150);
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    st = sheets[sheets.length - 1];
    t('không bật gì: chân trang nói "Chưa bật tính năng nào"', st.textContent.includes('Chưa bật tính năng nào'));
    t('không bật gì: chân trang KHÔNG còn câu sai "chỉ xin quyền đọc Lịch"', !st.textContent.includes('chỉ xin quyền đọc Lịch'));
    setFeat08(W, { cal: true, calw: true, send: true });
    W.refreshSettings();
    await sleep(150);
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    st = sheets[sheets.length - 1];
    t('bật ghi+gửi: chân trang liệt kê "ghi buổi chụp vào Lịch"', st.textContent.includes('ghi buổi chụp vào Lịch'));
    t('bật ghi+gửi: chân trang liệt kê "gửi email bạn đã duyệt"', st.textContent.includes('gửi email bạn đã duyệt'));
  }
  console.log('\n[31] fix-09 — Sao lưu v2 có ảnh + tách file, PIN xuyên phiên, Quyền riêng tư');
  {
  const nodeCrypto09 = require('crypto');
  const sha256hexNode09 = s => nodeCrypto09.createHash('sha256').update(s).digest('hex');
  const makeFakeIDB09 = function () {
    const rows = new Map(); // id -> {id, blob, added}
    function asyncReq(result) {
      const req = { result, onsuccess: null, onerror: null };
      setTimeout(() => { if (req.onsuccess) req.onsuccess({ target: req }); }, 0);
      return req;
    }
    const store = {
      getAll() { return asyncReq([...rows.values()]); },
      put(o) { rows.set(String(o.id), o); return asyncReq(o.id); },
      delete(id) { rows.delete(String(id)); return asyncReq(undefined); },
    };
    const db = {
      createObjectStore() { return store; },
      transaction() {
        const tx = { oncomplete: null, onerror: null, objectStore: () => store };
        setTimeout(() => { if (tx.oncomplete) tx.oncomplete({ target: tx }); }, 0);
        return tx;
      },
    };
    return {
      rows,
      indexedDB: {
        open() {
          const req = { result: db, onsuccess: null, onerror: null, onupgradeneeded: null };
          setTimeout(() => {
            if (req.onupgradeneeded) req.onupgradeneeded({ target: req });
            if (req.onsuccess) req.onsuccess({ target: req });
          }, 0);
          return req;
        },
      },
    };
  }
  const loadDom09 = async function (opts) {
    opts = opts || {};
    const fake = opts.fake || makeFakeIDB09();
    const blobs = new Map(); let blobN = 0;
    const anchorClicks = [];
    const openedUrls = [];
    const vc = new VirtualConsole();
    const errors = [];
    vc.on('jsdomError', e => errors.push(String((e && e.message) || e)));
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(win) {
        win.indexedDB = fake.indexedDB;
        win.URL.createObjectURL = blob => { const u = 'blob:fake-' + (++blobN); blobs.set(u, blob); return u; };
        win.URL.revokeObjectURL = () => {};
        win.HTMLAnchorElement.prototype.click = function() {
          anchorClicks.push({ href: this.href, download: this.getAttribute('download') });
        };
        win.crypto.subtle = nodeCrypto09.webcrypto.subtle; // jsdom không có subtle; PIN check cần nó
        win.open = url => { openedUrls.push(url); return null; };
        if (opts.seedLS) for (const k of Object.keys(opts.seedLS)) win.localStorage.setItem(k, opts.seedLS[k]);
      },
    });
    await new Promise(r => dom.window.addEventListener('load', r));
    await new Promise(r => setTimeout(r, 50));
    return { dom, win: dom.window, doc: dom.window.document, errors, fake, blobs, anchorClicks, openedUrls };
  }
  const mkJob09 = function (W, client, price) {
    return {
      id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage: 'Tư vấn',
      shootDate: W.dstr(0), shootTime: '09:00', location: 'Studio', deadline: W.dstr(14),
      price, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '',
      cancelled: false, stageSince: W.dstr(0),
    };
  }
  const mkTx09 = function (W, jobId, amount) {
    return { id: W.nid(), kind: 'thu', category: 'Cọc', jobId, amount, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' };
  }
  const fakeJpeg09 = function (win, seed) {
    return new win.Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0, 16, seed || 1, 2, 3, 4, 5])], { type: 'image/jpeg' });
  }
    /* ============ [1] Sao lưu v2 CÓ ảnh: build -> khôi phục -> ảnh quay lại store ============ */
    console.log('\n[1] Sao lưu v2 có ảnh (IndexedDB giả lập)');
    const a = await loadDom09();
    const W = a.win, doc = a.doc;
    t('trang tải không lỗi jsdom', a.errors.length === 0, a.errors.slice(0, 3).join(' | '));
    const job1 = mkJob09(W, 'Khách Có Ảnh', 2500000);
    W.state.jobs = [job1];
    W.state.txs = [mkTx09(W, job1.id, 1000000)];
    a.fake.rows.set('p1', { id: 'p1', blob: fakeJpeg09(W, 11), added: Date.now() - 86400000 });
    a.fake.rows.set('p2', { id: 'p2', blob: fakeJpeg09(W, 22), added: Date.now() });
    const env = await W.buildBackupData();
    eq('backup: format', env.format, 'fotobro-backup');
    eq('backup: version 2', env.version, 2);
    t('backup: có exportedAt', typeof env.exportedAt === 'string' && env.exportedAt.length > 10);
    eq('backup: counts.jobs 1', env.counts.jobs, 1);
    eq('backup: counts.txs 1', env.counts.txs, 1);
    eq('backup: counts.photos 2 (từ IndexedDB giả lập)', env.counts.photos, 2);
    eq('backup: photos.length 2', env.photos.length, 2);
    t('backup: photo p1 là dataUrl jpeg base64', typeof env.photos[0].dataUrl === 'string' && env.photos[0].dataUrl.indexOf('data:image/jpeg;base64,/9j/') === 0);
    t('backup: photo giữ đúng id gốc', env.photos.some(p => p.id === 'p1') && env.photos.some(p => p.id === 'p2'));
    t('backup: photo có addedAt', env.photos.every(p => typeof p.addedAt === 'string' && p.addedAt.length > 10));
    eq('parse v2', W.parseBackupFile(env).kind, 'v2');

    console.log('\n[2] Khôi phục tròn: job/tiền/ảnh quay lại, không mất lặng lẽ');
    const jobHienTai = mkJob09(W, 'Khách Hiện Tại', 1000000);
    W.state.jobs = [jobHienTai];
    W.state.txs = [];
    a.fake.rows.clear();
    const res = await W.restoreBackupData(env);
    eq('restore: jobs 1', res.jobs, 1);
    eq('restore: txs 1', res.txs, 1);
    eq('restore: photos 2', res.photos, 2);
    eq('restore: badPhotos 0', res.badPhotos, 0);
    eq('restore: state.jobs[0] là Khách Có Ảnh', W.state.jobs[0].client, 'Khách Có Ảnh');
    eq('restore: store ảnh có lại 2 ảnh', a.fake.rows.size, 2);
    const back1 = a.fake.rows.get('p1');
    t('restore: ảnh p1 là Blob jpeg còn nguyên', !!(back1 && back1.blob instanceof W.Blob && back1.blob.size > 0 && back1.blob.type === 'image/jpeg'));
    await sleep(200); // putBackupPhotos gọi loadMyShots() không await
    eq('restore: myShots hiện lại 2 ảnh trên trang chủ', W.myShots.length, 2);
    t('restore: bản dự phòng giữ job hiện tại (đường quay lại)', (W.localStorage.getItem('troLyXeo.backupSafety') || '').includes('Khách Hiện Tại'));
    // Khôi phục file v1 cũ (không có photos): job về, ảnh hiện tại KHÔNG bị xoá lặng (theo BACKUP-V2 §6.5: chỉ ghi đè cùng id + thêm mới)
    const v1env = { jobs: [Object.assign({}, job1, { client: 'Khách V1' })], txs: [], cfg: { name: 'V1' } };
    const resV1 = await W.restoreBackupData(v1env);
    eq('restore v1: job về', W.state.jobs[0].client, 'Khách V1');
    eq('restore v1: photos 0 (file cũ không có ảnh)', resV1.photos, 0);
    eq('restore v1: ảnh hiện tại không bị xoá lặng', a.fake.rows.size, 2);

    console.log('\n[3] Tách file > 25 MB (ép ngưỡng xuống để test nhánh tách)');
    W.BACKUP_SPLIT_MB = 0.000001; // ép ngưỡng ~10 byte để chắc chắn tách
    a.anchorClicks.length = 0;
    doc.querySelector('#exportBtn').click();
    await sleep(1000);
    eq('tách: tải đúng 2 file', a.anchorClicks.length, 2, JSON.stringify(a.anchorClicks));
    const dlPhotos = a.anchorClicks[0], dlMain = a.anchorClicks[1];
    t('tách: file 1 là fotobro-photos-YYYYMMDD.json', /^fotobro-photos-\d{8}\.json$/.test(dlPhotos.download || ''), dlPhotos.download);
    t('tách: file 2 là fotobro-backup-YYYYMMDD.json', /^fotobro-backup-\d{8}\.json$/.test(dlMain.download || ''), dlMain.download);
    const mainJson = JSON.parse(await a.blobs.get(dlMain.href).text());
    const photosJson = JSON.parse(await a.blobs.get(dlPhotos.href).text());
    eq('tách: file chính photosSplit true', mainJson.photosSplit, true);
    eq('tách: file chính photos rỗng', mainJson.photos.length, 0);
    eq('tách: file chính photosFile đúng tên file ảnh', mainJson.photosFile, dlPhotos.download);
    eq('tách: counts.photos giữ tổng 2 ảnh (để lúc khôi phục biết thiếu bao nhiêu)', mainJson.counts.photos, 2);
    eq('parse file chính tách ảnh vẫn là v2', W.parseBackupFile(mainJson).kind, 'v2');
    eq('tách: file ảnh format fotobro-photos', photosJson.format, 'fotobro-photos');
    eq('tách: file ảnh có 2 ảnh', photosJson.photos.length, 2);
    t('tách: file ảnh giữ dataUrl', photosJson.photos.every(p => typeof p.dataUrl === 'string' && p.dataUrl.indexOf('data:image/jpeg;base64,') === 0));
    eq('parse file ảnh riêng', W.parseBackupFile(photosJson).kind, 'photos');
    t('tách: lastBackupAt được ghi', !!(W.localStorage.getItem('fotobro.lastBackupAt') || '').length);
    W.BACKUP_SPLIT_MB = 25; // trả lại ngưỡng thật

    /* ============ [4] PIN xuyên phiên: mức hàm + "tải lại trang" ============ */
    console.log('\n[4] PIN xuyên phiên (mức hàm + tải lại trang thật qua 2 ngữ cảnh jsdom)');
    W.lockTries = 3; W.lockUntil = 0; W.lockStateSave();
    W.lockTries = 0; W.lockUntil = 0; W.lockStateLoad();
    eq('PIN: sai 3 lần CHƯA khoá, tải lại vẫn nhớ 3 (kẽ hở đã sửa)', W.lockTries, 3);
    W.lockTries = 5; W.lockUntil = Date.now() + 30000; W.lockStateSave();
    W.lockTries = 0; W.lockUntil = 0; W.lockStateLoad();
    eq('PIN: đang bị khoá, tải lại vẫn nhớ 5 lần', W.lockTries, 5);
    t('PIN: lockUntil còn hạn sau tải lại', W.lockUntil > Date.now());
    W.lockUntil = Date.now() - 1000; W.lockStateSave();
    W.lockTries = 9; W.lockStateLoad();
    eq('PIN: khoá đã hết hạn thì reset về 0', W.lockTries, 0);
    W.lockTries = 0; W.lockUntil = 0; W.lockStateSave();
    // "Tải lại trang" thật: ngữ cảnh mới seed đúng chuỗi localStorage cũ
    W.lockTries = 4; W.lockUntil = 0; W.lockStateSave();
    const savedTries = W.localStorage.getItem('troLyXeo.lockTries');
    const b = await loadDom09({ seedLS: { 'troLyXeo.lockTries': savedTries } });
    eq('PIN: ngữ cảnh mới (tải lại) vẫn nhớ 4 lần sai', b.win.lockTries, 4);
    eq('PIN: ngữ cảnh mới lockUntil 0', b.win.lockUntil, 0);
    W.lockTries = 5; W.lockUntil = Date.now() + 30000; W.lockStateSave();
    const savedLock = W.localStorage.getItem('troLyXeo.lockTries');
    const b2 = await loadDom09({ seedLS: { 'troLyXeo.lockTries': savedLock } });
    eq('PIN: ngữ cảnh mới (tải lại) vẫn nhớ 5 lần khi đang khoá', b2.win.lockTries, 5);
    t('PIN: ngữ cảnh mới lockUntil còn hạn', b2.win.lockUntil > Date.now());
    W.lockTries = 0; W.lockUntil = 0; W.lockStateSave();

    /* ============ [5] PIN qua UI thật: 5 lần sai -> khoá -> tải lại vẫn khoá ============ */
    console.log('\n[5] PIN qua UI: sai 5 lần -> khoá, tải lại vẫn khoá');
    const lockCfg = JSON.stringify({ id: 'testid', salt: 'testsalt', pin: sha256hexNode09('testsalt:1234') });
    const c = await loadDom09({ seedLS: { 'troLyXeo.lock': lockCfg } });
    const W3 = c.win, doc3 = c.doc;
    await sleep(600); // chờ tryBio tự động (350ms) chạy xong, không ảnh hưởng đếm PIN
    t('PIN UI: màn khoá hiện khi mở app', !!doc3.querySelector('#lockScreen'));
    const usePin = doc3.querySelector('#lkUsePin');
    if (usePin) usePin.click();
    await sleep(100);
    const pinForm = doc3.querySelector('#lkPinForm');
    const pinInput = doc3.querySelector('#lkPin');
    const msg = doc3.querySelector('#lkMsg');
    t('PIN UI: form PIN hiện sau khi bấm Dùng mã PIN', !!pinForm && !pinForm.classList.contains('hidden'));
    const submitPin09 = async (v) => {
      pinInput.value = v;
      pinForm.dispatchEvent(new W3.Event('submit', { bubbles: true, cancelable: true }));
      await sleep(150);
    }
    for (let i = 0; i < 5; i++) await submitPin09('0000');
    eq('PIN UI: sai 5 lần -> lockTries 5', W3.lockTries, 5);
    t('PIN UI: lockUntil trong tương lai', W3.lockUntil > Date.now());
    eq('PIN UI: localStorage ghi tries 5', JSON.parse(W3.localStorage.getItem('troLyXeo.lockTries')).tries, 5);
    await submitPin09('1234'); // đúng PIN nhưng đang khoá -> vẫn chặn
    t('PIN UI: đúng PIN trong lúc khoá vẫn bị chặn', !!doc3.querySelector('#lockScreen') && /đợi/.test(msg.textContent || ''));
    // "Tải lại trang": ngữ cảnh mới với cùng localStorage (khoá app + đếm sai)
    const savedLock2 = W3.localStorage.getItem('troLyXeo.lockTries');
    const d = await loadDom09({ seedLS: { 'troLyXeo.lock': lockCfg, 'troLyXeo.lockTries': savedLock2 } });
    const W4 = d.win, doc4 = d.doc;
    await sleep(600);
    eq('PIN UI tải lại: vẫn nhớ 5 lần sai', W4.lockTries, 5);
    t('PIN UI tải lại: lockUntil còn hạn', W4.lockUntil > Date.now());
    t('PIN UI tải lại: màn khoá vẫn hiện', !!doc4.querySelector('#lockScreen'));
    const usePin4 = doc4.querySelector('#lkUsePin');
    if (usePin4) usePin4.click();
    await sleep(100);
    const pinForm4 = doc4.querySelector('#lkPinForm');
    const pinInput4 = doc4.querySelector('#lkPin');
    const msg4 = doc4.querySelector('#lkMsg');
    pinInput4.value = '1234';
    pinForm4.dispatchEvent(new W4.Event('submit', { bubbles: true, cancelable: true }));
    await sleep(150);
    t('PIN UI tải lại: đúng PIN vẫn bị chặn khi còn hạn khoá', !!doc4.querySelector('#lockScreen') && /đợi/.test(msg4.textContent || ''));

    /* ============ [6] Quyền riêng tư trong Cài đặt ============ */
    console.log('\n[6] Quyền riêng tư');
    t('source chứa cụm "Quyền riêng tư"', html.includes('Quyền riêng tư'));
    const e = await loadDom09();
    const W5 = e.win, doc5 = e.doc;
    W5.openSettings();
    await sleep(150);
    const sheets = doc5.querySelectorAll('.sheet .sheet-body');
    const st = sheets[sheets.length - 1];
    const pr = st.querySelector('#privacyRow');
    t('Cài đặt có hàng Quyền riêng tư', !!pr);
    t('hàng Quyền riêng tư ghi đúng nội dung', !!pr && pr.textContent.includes('Quyền riêng tư') && pr.textContent.includes('không gửi dữ liệu'));
    e.openedUrls.length = 0;
    pr.click();
    await sleep(50);
    eq('bấm hàng Quyền riêng tư mở đúng URL PRIVACY.html', e.openedUrls[0], 'https://hoangviet1397.github.io/fotobro/PRIVACY.html');
  }
  console.log('\n[32] fix-10 — Hiển thị nhỏ + hạng mục chi Thuê đèn/Hoàn cọc, hoàn cọc, .tx-note');
  {
    console.log('[F10-1] Chữ + lang (kiểm tra trên source)');
    t('không còn "Giọng nói sẽ có ở bản v2.1"', !html.includes('Giọng nói sẽ có ở bản v2.1'));
    t('"Giọng nói sẽ có ở bản sau" có trong code', html.includes('Giọng nói sẽ có ở bản sau'));
    t('html lang="vi"', html.includes('<html lang="vi">'));
    t('câu dài "Nhập từ Lịch iPhone" đã rút ngắn', !html.includes('Bấm 1 chạm trong app iOS — sự kiện 30 ngày tới thành buổi chụp; hoặc đăng nhập Google để đọc Lịch Google'));
    t('câu ngắn mới có trong code', html.includes('1 chạm trong app iOS — sự kiện 30 ngày tới thành buổi chụp, hoặc đăng nhập Google'));

    console.log('\n[F10-2] Tab bar + celebrate (kiểm tra trên source/CSS)');
    t('tabbar dùng nền đặc --bar-strong', /\.tabbar\{[^}]*background:var\(--bar-strong\)/.test(html));
    t('glass mode: tabbar .92 (sáng)', html.includes('html[data-glass="1"] .tabbar{ background:rgba(255,255,255,.92); }'));
    t('glass mode: tabbar .92 (tối)', html.includes('html[data-glass="1"] .tabbar{ background:rgba(0,0,0,.92); }'));
    t('.stk-pop pointer-events:none', /\.stk-pop\{[^}]*pointer-events:none/.test(html));
    t('celebrate tắt sau 1100ms', html.includes('setTimeout(rm, 1100)'));
    t('màn chào: .wl-list .row gọn 44px', html.includes('.wl-list .row{ min-height:44px; padding:8px 16px; }'));
    t('màn chào: wl-mini 76px', html.includes('.wl-mini{ width:76px; height:76px;'));

    console.log('\n[F10-3] Hạng mục chi + máy tính giá');
    const { win: W, doc, errors } = await loadDom();
    DOC = doc;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION vẫn 2.1', W.APP_VERSION, '2.1');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
    const chiCats = [];
    Object.keys(W.CHI_GROUPS).forEach(g => W.CHI_GROUPS[g].forEach(c => chiCats.push(c)));
    t('CHI_GROUPS có "Thuê đèn"', chiCats.indexOf('Thuê đèn') >= 0, chiCats.join(','));
    t('CHI_GROUPS có "Hoàn cọc"', chiCats.indexOf('Hoàn cọc') >= 0, chiCats.join(','));
    t('"Thuê đèn" nằm trong nhóm "Chi cho buổi chụp"', (W.CHI_GROUPS['Chi cho buổi chụp'] || []).indexOf('Thuê đèn') >= 0);
    t('"Hoàn cọc" nằm trong nhóm "Chi khác"', (W.CHI_GROUPS['Chi khác'] || []).indexOf('Hoàn cọc') >= 0);

    // Máy tính giá: giá film Wedding 6tr, giá digital 15tr
    W.state.cfg.pricesFilm = { Portrait: 0, Couple: 0, Wedding: 6000000, Lookbook: 0, Event: 0 };
    const filmOpts = W.calcPkgOptions('Film');
    t('Film: nhãn Wedding hiện 6.000.000', filmOpts.includes('Wedding — 6.000.000'), filmOpts);
    t('Film: nhãn Wedding KHÔNG hiện 15.000.000 (giá Digital)', !filmOpts.includes('15.000.000'), filmOpts);
    const digOpts = W.calcPkgOptions('Digital');
    t('Digital: nhãn Wedding hiện 15.000.000', digOpts.includes('Wedding — 15.000.000'), digOpts);

    // Form chi liệt kê đủ 2 hạng mục mới
    W.openTxForm({ kind: 'chi' });
    await sleep(200);
    const catSel = doc.querySelector('#txForm select[name="category"]');
    const catTexts = [...catSel.options].map(o => o.textContent);
    t('form chi có option "Thuê đèn"', catTexts.indexOf('Thuê đèn') >= 0, catTexts.join(','));
    t('form chi có option "Hoàn cọc"', catTexts.indexOf('Hoàn cọc') >= 0, catTexts.join(','));
    await closeSheet();

    console.log('\n[F10-4] Form cọc: ô "Buổi chụp" full-width');
    const j0 = { id: W.nid(), client: 'Nguyễn Thị Mai Anh', type: 'Wedding', medium: 'Digital', stage: 'Sắp chụp',
      stageSince: W.dstr(0), shootDate: W.dstr(0), shootTime: '15:00', location: 'Studio Quận 1', deadline: '',
      price: 15000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j0);
    W.openTxForm({ jobId: j0.id, kind: 'thu', category: 'Cọc', amount: 6000000 });
    await sleep(200);
    const jobSel = doc.querySelector('.sheet select[name="jobId"]');
    t('form cọc có select Buổi chụp', !!jobSel);
    t('ô Buổi chụp là frow stack (nhãn trên, select full-width)', !!(jobSel && jobSel.closest('.frow') && jobSel.closest('.frow').classList.contains('stack')));
    t('select đã chọn đúng job', jobSel && String(jobSel.value) === String(j0.id), jobSel && jobSel.value);
    await closeSheet();

    console.log('\n[F10-5] Huỷ job có cọc -> gợi ý hoàn cọc, form điền sẵn');
    const j1 = { id: W.nid(), client: 'Khách Có Cọc', type: 'Wedding', medium: 'Digital', stage: 'Chốt cọc',
      stageSince: W.dstr(0), shootDate: W.dstr(0), shootTime: '08:00', location: '', deadline: '',
      price: 15000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j1);
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j1.id, amount: 6000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    eq('jobDep tính đúng 6tr', W.jobDep(j1), 6000000);
    W.jobAction('cancel', j1.id);
    await sleep(200);
    const asheets5 = [...doc.querySelectorAll('.asheet')];
    const as5 = asheets5[asheets5.length - 1];
    const refundBtns = [...as5.querySelectorAll('[data-a]')].filter(b => b.textContent.includes('Huỷ & ghi hoàn cọc'));
    t('huỷ job có cọc: hiện nút "Huỷ & ghi hoàn cọc"', refundBtns.length === 1, [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent).join(' | '));
    t('nút hoàn cọc ghi đúng số 6.000.000', refundBtns.length === 1 && refundBtns[0].textContent.includes('6.000.000'), refundBtns[0] && refundBtns[0].textContent);
    if (refundBtns.length === 1) refundBtns[0].click();
    await sleep(300);
    eq('bấm hoàn cọc: job đã huỷ', j1.cancelled, true);
    const f2 = doc.querySelector('#txForm');
    t('bấm hoàn cọc: mở form ghi chi', !!f2);
    if (f2) {
      eq('form hoàn cọc: hạng mục = Hoàn cọc', f2.elements.category.value, 'Hoàn cọc');
      eq('form hoàn cọc: số tiền điền sẵn 6.000.000', f2.elements.amount.value, '6.000.000');
      eq('form hoàn cọc: ghi chú điền sẵn', f2.elements.note.value, 'Hoàn cọc cho Khách Có Cọc');
      eq('form hoàn cọc: gắn đúng job', f2.elements.jobId.value, String(j1.id));
      t('form hoàn cọc: đang ở tab Chi', !!doc.querySelector('#txForm #txKindSeg button[data-k="chi"].on'));
    }
    await closeSheet();

    console.log('\n[F10-6] Huỷ job KHÔNG cọc -> không hỏi hoàn cọc');
    const j2 = { id: W.nid(), client: 'Khách Không Cọc', type: 'Portrait', medium: 'Digital', stage: 'Tư vấn',
      stageSince: W.dstr(0), shootDate: W.dstr(0), shootTime: '08:00', location: '', deadline: '',
      price: 2500000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j2);
    await sleep(500); /* chờ asheet của test trước tháo khỏi DOM */
    W.jobAction('cancel', j2.id);
    await sleep(200);
    const asheets6 = [...doc.querySelectorAll('.asheet')];
    const as6 = asheets6[asheets6.length - 1];
    const noRefund = [...as6.querySelectorAll('[data-a]')].filter(b => b.textContent.includes('Huỷ & ghi hoàn cọc'));
    t('huỷ job không cọc: không có nút hoàn cọc', noRefund.length === 0, [...as6.querySelectorAll('[data-a]')].map(b => b.textContent).join(' | '));
    const onlyCancel = [...as6.querySelectorAll('[data-a]')].find(b => b.textContent.includes('Huỷ job này'));
    t('huỷ job không cọc: chỉ có nút "Huỷ job này"', !!onlyCancel && onlyCancel.textContent.includes('Huỷ job này'), onlyCancel && onlyCancel.textContent);
    if (onlyCancel) onlyCancel.click();
    await sleep(200);
    eq('huỷ job không cọc: cancelled = true', j2.cancelled, true);

    console.log('\n[F10-7] Sổ thu chi: ghi chú dòng riêng, hiện đủ');
    const NOTE = 'Cọc đợt 1 — khách chuyển khoản Vietcombank, đã xác nhận qua Zalo, hẹn chụp lại nếu trời mưa to';
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j0.id, amount: 6000000, date: W.dstr(0), method: 'Chuyển khoản', note: NOTE, src: '' });
    W.state.txs.unshift({ id: W.nid(), kind: 'chi', category: 'Thuê đèn', jobId: j0.id, amount: 800000, date: W.dstr(0), method: 'Tiền mặt', note: 'Thuê 2 đèn Godox AD200 và chân đèn ở tiệm anh Ba', src: '' });
    W.state.txs.unshift({ id: W.nid(), kind: 'chi', category: 'Phát sinh khác', jobId: '', amount: 100000, date: W.dstr(0), method: 'Tiền mặt', note: '', src: '' });
    W.renderMoney();
    await sleep(100);
    const rows = [...doc.querySelectorAll('#txList .row')];
    const cocRow = rows.find(r => (r.querySelector('.t1') || {}).textContent === 'Cọc');
    t('sổ thu chi: tìm được dòng Cọc', !!cocRow);
    if (cocRow) {
      const noteEl = cocRow.querySelector('.tx-note');
      t('dòng Cọc: có dòng ghi chú riêng .tx-note', !!noteEl);
      eq('dòng Cọc: ghi chú hiện ĐẦY ĐỦ (không cắt)', noteEl && noteEl.textContent, NOTE);
      t('dòng Cọc: ghi chú KHÔNG bị kẹp wrap2', !!(noteEl && !noteEl.classList.contains('wrap2')));
      const subEl = cocRow.querySelector('.t2.wrap2');
      t('dòng Cọc: dòng phụ chỉ còn khách + phương thức', !!subEl && !subEl.textContent.includes('Vietcombank'), subEl && subEl.textContent);
    }
    const noNoteRow = rows.find(r => (r.querySelector('.t1') || {}).textContent === 'Phát sinh khác');
    t('dòng không ghi chú: không có .tx-note', !!noNoteRow && !noNoteRow.querySelector('.tx-note'));

    console.log('\n[F10-8] Dòng job / timeline / phòng ban: địa điểm 2 dòng (wrap2)');
    W.renderJobs();
    await sleep(100);
    const jobT2 = doc.querySelector('#jobList .row .t2');
    t('dòng job: t2 có wrap2', !!(jobT2 && jobT2.classList.contains('wrap2')));
    W.renderDepts();
    await sleep(100);
    const deptT2 = [...doc.querySelectorAll('#view-depts .row .t2')].find(e => e.classList.contains('wrap2'));
    t('phòng ban (Thêm): mô tả có wrap2', !!deptT2);
    W.renderHome();
    await sleep(100);
    const upT2 = doc.querySelector('#upcomingList .row .t2');
    t('mục Sắp tới: t2 có wrap2', !upT2 || upT2.classList.contains('wrap2'));
  }
  console.log('\n===== KẾT QUẢ: ' + pass + ' đạt / ' + (pass + fail) + ' =====');
  if (fail) { console.log('FAILURES:', fails.join(' | ')); process.exit(1); }
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
