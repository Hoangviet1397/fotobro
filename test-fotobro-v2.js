/* Test FotoBro iOS v2.3 — chạy bằng jsdom, không cần trình duyệt.
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

/* v2.4: app theo ngôn ngữ/tiền tệ của máy — jsdom mặc định en-US, giả lập máy tiếng Việt. */
const html = fs.readFileSync(path.join(__dirname, 'www', 'index.html'), 'utf-8').replace('<head>',
  '<head><script>try{Object.defineProperty(navigator,"language",{get:function(){return "vi-VN";}});Object.defineProperty(navigator,"languages",{get:function(){return ["vi-VN"];}});}catch(e){}</script>');
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
  eq('APP_VERSION 2.3', W.APP_VERSION, '2.3');
  eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
  // Phương án A (20/11/2026): 5 ô = 4 màn (home, jobs, money, depts/Thêm) + nút Ghi nhanh ở giữa
  t('v2.8: thanh dưới 4 tab, bỏ nút + Ghi (thêm mới ở góc trên)', doc.querySelectorAll('.tabbar button').length === 4 &&
    [...doc.querySelectorAll('.tabbar button[data-view]')].map(b => b.getAttribute('data-view')).join(',') === 'home,jobs,money,depts' &&
    !doc.querySelector('.tabbar #tabAdd'),
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
  t('v2.7b: không còn chân trang / ảnh trang trí / câu hôm nay', !doc.querySelector('#footInfo') && !doc.querySelector('#heroLink') && !doc.querySelector('#quoteCard'));
  t('chưa điền tên: greetLine không có Sadako', !doc.querySelector('#greetLine').textContent.includes('Sadako'));
  W.state.cfg.name = 'Lan'; W.state.cfg.studio = 'Lan Studio'; W.state.cfg.instagram = 'lanphoto';
  W.renderHome();
  eq('điền tên Lan: lời chào là Lan', doc.querySelector('#view-home .lt h1 em').textContent, 'Lan');
  t('điền tên: thẻ studio có Lan Studio', !!doc.querySelector('.idc-name') && doc.querySelector('.idc-name').textContent.includes('Lan Studio'));
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
  W.renderDepts();
  t('v2.7b: 6 phòng tên chuyên nghiệp, không còn "bạn Sen/Mây…"', ['Khách hàng & Tư vấn','Lịch chụp & Chuẩn bị','Hậu kỳ & Giao ảnh','Tài chính','Marketing & Đánh giá','Lưu trữ & Thiết bị'].every(s => doc.body.textContent.includes(s)) && !/bạn (Sen|Nắng|Mây|Lúa|Trăng|Đèn)/.test(doc.body.textContent));

  console.log('\n[6] Sổ trống + cleanData job cũ');
  eq('sổ trống: 0 job mẫu', W.state.jobs.length, 0);
  t('sổ trống: không job nào sai medium', W.state.jobs.every(j => W.jobMedium(j) === 'Digital'));
  const cd = W.cleanData({ jobs: [
    { id: 1, client: 'Cu', type: 'Wedding', stage: 'Khách hỏi', price: 15000000 },
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
  t('chi tiết Lan hiện medium Film', W.jobDetailHTML(lan).includes('Film'));
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
    jobs: [{ id: 1, client: 'Cu', type: 'Wedding', stage: 'Khách hỏi', shootDate: '', shootTime: '', location: '', deadline: '', price: 15000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '' }],
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
    const j = { id: W.nid(), client: client, type: 'Wedding', medium: 'Digital', stage: 'Khách hỏi',
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: 'Studio', deadline: '',
      price: price, phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j); return j;
  }
  // (a) Nhảy kề Khách hỏi -> Đã chốt: không xác nhận, mở form cọc điền sẵn 40% của 15tr = 6tr
  const ja = mkJob('Khách A', 15000000);
  W.jumpToStage(ja.id, 1);
  eq('nhảy kề: sang Đã chốt ngay', ja.stage, 'Đã chốt');
  await sleep(700);
  const txForm = doc.querySelector('#txForm');
  t('nhảy Đã chốt: mở form ghi cọc', !!txForm);
  if (txForm) eq('form cọc điền sẵn 6.000.000', txForm.elements.amount.value, '6.000.000');
  await closeSheet();
  // (a2) Nhảy xa Khách hỏi -> Đang làm ảnh: có xác nhận, bấm Nhảy thì sang
  const jb = mkJob('Khách B', 15000000);
  W.jumpToStage(jb.id, 3); /* v2.7: 6 bước — 3 = Đang làm ảnh */
  eq('nhảy xa: chưa xác nhận thì vẫn Khách hỏi', jb.stage, 'Khách hỏi');
  t('nhảy xa: hiện sheet xác nhận', !!lastAsheetBtn('[data-a="0"]'));
  lastAsheetBtn('[data-a="0"]').click(); await sleep(200);
  eq('nhảy xa: bấm Nhảy thì sang Đang làm ảnh', jb.stage, 'Đang làm ảnh');
  // (b) Xong khi còn thiếu tiền: chặn, bấm "Vẫn xong, thiếu sau" mới xong
  eq('job B còn thiếu 15tr', W.jobOwe(jb), 15000000);
  W.setStage(jb, 'Xong');
  eq('xong-thiếu-tiền: chưa xác nhận thì vẫn Đang làm ảnh', jb.stage, 'Đang làm ảnh');
  t('xong-thiếu-tiền: hiện sheet cảnh báo', !!lastAsheetBtn('[data-a="1"]'));
  lastAsheetBtn('[data-a="1"]').click(); await sleep(200);
  eq('xong-thiếu-tiền: bấm "Vẫn xong" thì sang Xong', jb.stage, 'Xong');
  // (c) Huỷ -> khôi phục về Khách hỏi
  const jc = mkJob('Khách C', 5000000);
  W.jobAction('cancel', jc.id);
  lastAsheetBtn('[data-a="0"]').click(); await sleep(200);
  eq('huỷ: cancelled = true', jc.cancelled, true);
  t('huỷ: jobAction next bị chặn', (W.jobAction('next', jc.id), jc.stage === 'Khách hỏi'));
  W.jobFilter = 'Đã huỷ';
  W.jobAction('restore', jc.id);
  eq('khôi phục: cancelled = false', jc.cancelled, false);
  eq('khôi phục: về Khách hỏi', jc.stage, 'Khách hỏi');
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
  const jRun = mk16('Khách Chạy', 4000000, 'Đã chốt', 0);       // thiếu 4tr
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
  const jDebt = mk16('Khách Nợ', 2500000, 'Đã chốt', 1000000);
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
  W.state.jobs = [mk16('Khách Backup', 2500000, 'Đã chốt', 1000000)];
  W.state.txs = W.state.txs.filter(t => t.jobId === W.state.jobs[0].id);
  const env = await W.buildBackupData();
  eq('backup: format', env.format, 'fotobro-backup');
  eq('backup: version 2', env.version, 2);
  eq('backup: appVersion 2.3', env.appVersion, '2.3');
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
  W.state.jobs = [mk16('Khách Hiện Tại', 1000000, 'Khách hỏi', 0)];
  const res = await W.restoreBackupData(env);
  eq('restore: jobs về lại 1', res.jobs, 1);
  eq('restore: txs về lại 1', res.txs, 1);
  eq('restore: state.jobs[0] là Khách Backup', W.state.jobs[0].client, 'Khách Backup');
  t('restore: bản dự phòng giữ job hiện tại', (W.localStorage.getItem('troLyXeo.backupSafety') || '').includes('Khách Hiện Tại'));
  W.checkDone = { 'job:1': { 'Sạc đầy pin': true } };
  const v1env = { jobs: [{ id: 1, client: 'Khách V1', type: 'Portrait', stage: 'Khách hỏi', price: 2500000 }], txs: [], cfg: { name: 'V1' } };
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
  const jTpl = mk16('Khách Mẫu', 2535000, 'Đã chốt', 0);
  eq('chatCtx coc dùng depFor = 1.010.000₫', W.chatCtx(jTpl).coc, '1.010.000₫');
  eq('suggestKey Đã chốt chưa cọc -> baogia', W.suggestKey(jTpl), 'baogia');
  W.pickMsg(jTpl);
  const pickLabels = [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent);
  t('pickMsg chưa cọc: không có mẫu "Đã nhận cọc"', !pickLabels.some(l => l.includes('Đã nhận cọc')), pickLabels.join(' | '));
  const pickCancel = doc.querySelector('.asheet .cancel'); if (pickCancel) pickCancel.click();
  W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: jTpl.id, amount: 1010000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
  jTpl.shootDate = W.dstr(20); /* còn xa ngày chụp: mẫu "Đã nhận cọc"; gần ngày thì "Nhắc lịch" */
  eq('suggestKey Đã chốt đã cọc -> coc', W.suggestKey(jTpl), 'coc');
  t('chat "Đã nhận cọc" dùng số cọc thật 1.010.000₫', W.chatMsg('coc', jTpl).includes('1.010.000'));
  t('chat "Đã nhận cọc" không nói "Đã nhận 0₫"', !W.chatMsg('coc', jTpl).includes('Đã nhận 0₫'));
  eq('mailCtx depPaid = 1.010.000₫', W.mailCtx(jTpl).depPaid, '1.010.000₫');
  t('email deposit dùng {tiền cọc} thật', W.fillTpl(W.MAIL_TPLS_DEFAULT.deposit.b, W.mailCtx(jTpl)).includes('1.010.000'));
  const jNoDrive = mk16('Khách Không Link', 2500000, 'Đã chụp', 0);
  t('chat "Mời chọn ảnh" không link thì không nhắc link', !W.chatMsg('chon', jNoDrive).includes('link'));

  console.log('\n[22] Hiển thị + Cài đặt: máy tính film, Sắp tới, Quyền riêng tư');
  t('source không còn "Giọng nói sẽ có ở bản v2.1"', !html.includes('Giọng nói sẽ có ở bản v2.1'));
  t('source không còn "Giọng nói sẽ có ở bản sau" (mic hỏi đã gỡ)', !html.includes('Giọng nói sẽ có ở bản sau'));
  W.state.cfg.prices.Wedding = 15000000; W.state.cfg.pricesFilm.Wedding = 22000000;
  t('calcPkgOptions Film hiện giá film 22tr', W.calcPkgOptions('Film').includes('Wedding — 22.000.000'));
  t('calcPkgOptions Digital hiện giá digital 15tr', W.calcPkgOptions('Digital').includes('Wedding — 15.000.000'));
  const cdDep = W.cleanData({ jobs: [{ id: 5, client: 'X', depPrompted: true }], txs: [] });
  eq('cleanData giữ cờ depPrompted', cdDep.jobs[0].depPrompted, true);
  W.state.jobs = [mk16('Khách Xa', 2500000, 'Khách hỏi', 0)];
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
  t('v2.3b: chưa kết nối -> Cài đặt ẩn hẳn công tắc tính năng Google', !calSw && st22.querySelectorAll('[data-gfeat]').length === 0, String(st22.querySelectorAll('[data-gfeat]').length));
  await saveSheet();

  console.log('\n[23] fix-01 — B1: nợ job Xong vẫn tính, job huỷ loại, job chưa ghi giá');
  {
    const { win: W, doc, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION 2.3', W.APP_VERSION, '2.3');
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
    const jRun = mk01('Khách Chạy', 4000000, 'Đã chốt', 0);
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
    mk01('Khách Chạy', 4000000, 'Đã chốt', 0);
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
    eq('APP_VERSION 2.3', W.APP_VERSION, '2.3');
    eq('storage key giữ troLyXeo.v1', W.LS_KEY, 'troLyXeo.v1');
    W.state.cfg.depositPct = 40;

    const mkJob02 = function (client, price, stage, shootDate, deposit, driveLink, depCategory) {
      const j = { id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage: stage || 'Khách hỏi',
        stageSince: W.dstr(0), shootDate: shootDate || '', shootTime: '15:00', location: 'Studio Quận 1', deadline: '',
        price: price || 0, phone: '', email: 'khach@example.com', fbLink: '', msLink: '', driveLink: driveLink || '', note: '', cancelled: false };
      W.state.jobs.unshift(j);
      if (deposit) W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: depCategory || 'Cọc', jobId: j.id, amount: deposit, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
      return j;
    }

    console.log('\n[A] B2: trợ lý với "tháng" / "thanh toán"');
    W.state.jobs = []; W.state.txs = [];
    const jDebt = mkJob02('Khách Nợ', 2500000, 'Đã chốt', W.dstr(2), 1000000); // còn thiếu 1.500.000
    const jDl = mkJob02('Khách Hạn', 2500000, 'Đang làm ảnh', W.dstr(5), 0); jDl.deadline = W.dstr(3);
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
    const jNoDep = mkJob02('Khách Chưa Cọc', 2535000, 'Đã chốt', W.dstr(5), 0);
    eq('coc: suggestKey Đã chốt chưa cọc -> baogia', W.suggestKey(jNoDep), 'baogia');
    t('coc: chat "Đã nhận cọc" khi chưa cọc thì xin cọc, không khẳng định đã nhận',
      !W.chatMsg('coc', jNoDep).includes('nhận cọc') && W.chatMsg('coc', jNoDep).includes('cọc trước'), W.chatMsg('coc', jNoDep));
    t('coc: msgFor job chưa cọc không khẳng định đã nhận', !W.msgFor(jNoDep).includes('nhận cọc'), W.msgFor(jNoDep));
    W.pickMsg(jNoDep);
    let pickLabels = [...doc.querySelectorAll('.asheet [data-a]')].map(b => b.textContent);
    t('coc: pickMsg chưa cọc không liệt kê "Đã nhận cọc"', !pickLabels.some(l => l.includes('Đã nhận cọc')), pickLabels.join(' | '));
    closeAsheet02();
    // Cọc ghi ở hạng mục khác (không phải "Cọc") thì KHÔNG tính là đã nhận cọc.
    const jWrongCat = mkJob02('Khách Cọc Sai Mục', 2535000, 'Đã chốt', W.dstr(5), 1010000, '', 'Tiền sau buổi chụp');
    eq('coc: cọc ghi sai hạng mục -> suggestKey vẫn baogia', W.suggestKey(jWrongCat), 'baogia');
    eq('coc: cọc ghi sai hạng mục -> depPaid rỗng', W.chatCtx(jWrongCat).depPaid, '');
    t('coc: cọc ghi sai hạng mục -> chat không khẳng định đã nhận', !W.chatMsg('coc', jWrongCat).includes('nhận cọc'), W.chatMsg('coc', jWrongCat));
    // Cọc thật (tx hạng mục "Cọc") thì dùng được, dùng đúng số cọc thật.
    const jDep = mkJob02('Khách Đã Cọc', 2535000, 'Đã chốt', W.dstr(5), 1010000);
    eq('coc: suggestKey Đã chốt đã cọc -> coc', W.suggestKey(jDep), 'coc');
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
    eq('v2.7: vừa chụp xong thì gợi ý gửi ảnh xem trước', W.suggestKey(jNoDrive), 'sneak');
    jNoDrive.sneakSent = true;
    eq('chon: không link vẫn gợi ý chon ở bước Đã chụp', W.suggestKey(jNoDrive), 'chon');
    const jDrive = mkJob02('Khách Có Link', 2500000, 'Đã chụp', W.dstr(0), 0, 'https://drive.google.com/drive/folders/abc123');
    t('chon: có link thì nhắc link + kèm đúng link', W.chatMsg('chon', jDrive).includes('https://drive.google.com/drive/folders/abc123'), W.chatMsg('chon', jDrive));

    console.log('\n[D] "Nhắc lịch chụp" — hôm nay bỏ "ngủ sớm", ngày mai giữ');
    W.state.jobs = []; W.state.txs = [];
    const jToday = mkJob02('Khách Hôm Nay', 2500000, 'Đã chốt', W.dstr(0), 0);
    const jTmr = mkJob02('Khách Ngày Mai', 2500000, 'Đã chốt', W.dstr(1), 0);
    const jLater = mkJob02('Khách Xa', 2500000, 'Đã chốt', W.dstr(5), 0);
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
    const jMailNoDep = mkJob02('Khách Mail Chưa Cọc', 2535000, 'Đã chốt', W.dstr(5), 0);
    const jMailDep = mkJob02('Khách Mail Đã Cọc', 2535000, 'Đã chốt', W.dstr(5), 1010000);
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
    eq('APP_VERSION 2.3', W.APP_VERSION, '2.3');
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
    const jLe = { id: 999001, client: 'Khách Lẻ', type: 'Portrait', medium: 'Digital', stage: 'Khách hỏi', price: 2535000, shootDate: '', shootTime: '', location: '' };
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
    { const cf = [...DOC.querySelectorAll('.asheet [data-a="0"]')].pop(); t('v2.6: ghi cọc hỏi xác nhận lần 2', !!cf && cf.textContent.includes('1.000.000')); if (cf) cf.click(); await sleep(200); }
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
    t('APP_VERSION vẫn 2.3', W.APP_VERSION === '2.3', String(W.APP_VERSION));
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

  const jobToday05 = { id: 1, client: 'Lan Anh', type: 'Portrait', medium: 'Digital', stage: 'Đã chốt',
    shootDate: '2026-11-20', shootTime: '15:00', location: 'Studio Quận 1',
    deadline: '2026-11-21', price: 2500000, note: '', phone: '', email: '', driveLink: '', cancelled: false };
  const jobTomorrow05 = { id: 2, client: 'Minh Tuấn', type: 'Couple', medium: 'Digital', stage: 'Khách hỏi',
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
    eq('job ngày mai 15:00 → nhắc trước 1 ngày (15:00 hôm nay)', a2 && a2.at, NOON05 + 3 * 3600000);

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
      hToday.indexOf('Mốc nhắc trước 1 ngày đã qua') >= 0);
    t('chi tiết job gấp hôm nay ghi rõ nhắc 60 phút trước, lúc 14:00',
      hToday.indexOf('60 phút trước giờ chụp, lúc') >= 0 && hToday.indexOf('14:00') >= 0);
    const hTomorrow = W.jobDetailHTML(jobTomorrow05);
    t('chi tiết job ngày mai (nhắc 12h bình thường) KHÔNG hiện cảnh báo',
      hTomorrow.indexOf('Mốc nhắc trước 1 ngày đã qua') < 0 &&
      hTomorrow.indexOf('Buổi chụp trong chưa tới 60 phút') < 0);
    const hCancelled = W.jobDetailHTML(Object.assign({}, jobToday05, { cancelled: true }));
    t('job đã huỷ KHÔNG hiện cảnh báo nhắc lịch',
      hCancelled.indexOf('Mốc nhắc trước 1 ngày đã qua') < 0);
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
    eq('bridge [trưa]: job ngày mai 15:00 nhắc trước 1 ngày (15:00 hôm nay)',
      shoot2[0] && shoot2[0].schedule.at.getTime(), NOON05 + 3 * 3600000);

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
  console.log('\n[28] fix-06 — Pipeline UX: "Để sau" form cọc, tạo job Đã chốt, khôi phục, nhãn nút');
  {
  const lastSheetEl06 = function (doc, sel) { const els = doc.querySelectorAll('.sheet ' + sel); return els[els.length - 1]; }
  const lastAsheetBtn06 = function (doc, sel) { const els = doc.querySelectorAll('.asheet ' + sel); return els[els.length - 1]; }
  const mkJob06 = function (W, client, price) {
    const j = { id: W.nid(), client: client, type: 'Wedding', medium: 'Digital', stage: 'Khách hỏi',
      stageSince: W.dstr(0), shootDate: W.dstr(20), shootTime: '08:00', location: 'Studio', deadline: '',
      price: price, phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j); return j;
  }
    console.log('[A] "Để sau" trong form cọc mở từ setStage');
    let { win: W, doc, errors } = await loadDom();
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    const ja = mkJob06(W, 'Khách A', 15000000);
    W.jumpToStage(ja.id, 1);
    eq('nhảy kề: sang Đã chốt ngay', ja.stage, 'Đã chốt');
    await sleep(700);
    t('vào Đã chốt: mở form ghi cọc', !!doc.querySelector('#txForm'));
    const deferBtn = doc.querySelector('#txDefer');
    t('form cọc có nút "Để sau"', !!deferBtn && deferBtn.textContent.toLowerCase().includes('để sau'), deferBtn ? deferBtn.textContent : 'không có nút');
    eq('nút trái form cọc là "Đóng" (không phải "Huỷ")', lastSheetEl06(doc, '.sh-l').textContent, 'Đóng');
    if (doc.querySelector('#txForm')) eq('form cọc điền sẵn 6.000.000', doc.querySelector('#txForm').elements.amount.value, '6.000.000');
    deferBtn.click();
    await sleep(500);
    eq('bấm "Để sau": depPrompted = true', ja.depPrompted, true);
    t('bấm "Để sau": form cọc đã đóng', !doc.querySelector('#txForm'));
    eq('bấm "Để sau": vẫn ở Đã chốt (chuyển bước không bị huỷ)', ja.stage, 'Đã chốt');
    eq('bấm "Để sau": chưa ghi cọc nào', W.jobDep(ja), 0);
    W.setStage(ja, 'Đã chốt');
    eq('rời sang Đã chốt', ja.stage, 'Đã chốt');
    await sleep(200);
    W.setStage(ja, 'Đã chốt');
    eq('vào lại Đã chốt', ja.stage, 'Đã chốt');
    await sleep(700);
    t('vào lại Đã chốt: form cọc KHÔNG mở lại', !doc.querySelector('#txForm'));
    // Cờ bền qua reload (localStorage -> cleanData -> loadLocal)
    const saved = W.localStorage.getItem('troLyXeo.v1');
    const w2 = await loadDom(w => { w.localStorage.setItem('troLyXeo.v1', saved); });
    const reloaded = w2.win.state.jobs.find(j => j.id === ja.id);
    eq('reload: depPrompted vẫn true', reloaded && reloaded.depPrompted, true);
    eq('reload: job vẫn ở Đã chốt', reloaded && reloaded.stage, 'Đã chốt');

    console.log('\n[A2] Job đã có cọc thì vào Đã chốt không mở form');
    ({ win: W, doc } = await loadDom());
    const jd = mkJob06(W, 'Khách Đã Cọc', 15000000);
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: jd.id, amount: 6000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    eq('job đã có cọc 6tr', W.jobDep(jd), 6000000);
    W.jumpToStage(jd.id, 1);
    await sleep(700);
    t('đã có cọc: form cọc KHÔNG mở', !doc.querySelector('#txForm'));

    console.log('\n[B] Tạo job mới ở bước Đã chốt chưa có cọc -> hỏi nhập cọc sau khi lưu');
    ({ win: W, doc } = await loadDom());
    W.openJobForm(null);
    let form = doc.querySelector('#jobForm');
    t('mở form thêm job', !!form);
    form.elements.client.value = 'Khách Mới';
    setSel(form.querySelector('select[name="type"]'), 'Wedding');
    eq('chọn Wedding -> giá tự điền 15tr', form.elements.price.value, '15.000.000');
    setSel(form.querySelector('select[name="stage"]'), 'Đã chốt');
    form.elements.shootDate.value = W.dstr(5); form.elements.shootTime.value = '08:00'; form.elements.location.value = 'Studio'; form.elements.phone.value = '0901234567'; // v2.4: qua Khách hỏi cần đủ thông tin
    eq('ô cọc để trống', form.elements.deposit.value, '');
    lastSheetEl06(doc, '.sh-r').click();
    await sleep(900);
    const jm = W.state.jobs[0];
    eq('job mới đã lưu, client Khách Mới', jm && jm.client, 'Khách Mới');
    eq('job mới ở bước Đã chốt', jm && jm.stage, 'Đã chốt');
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
    eq('khôi phục: về Khách hỏi', jc.stage, 'Khách hỏi');
    eq('khôi phục: jobFilter về "Tất cả"', W.jobFilter, 'Tất cả');
    W.renderJobs();
    t('sau khôi phục: thấy job trong danh sách "Tất cả"', doc.querySelector('#jobList').textContent.includes('Khách C'));
    t('sau khôi phục: không còn dòng "Chưa có buổi chụp nào"', !doc.querySelector('#jobList').textContent.includes('Chưa có buổi chụp nào'));

    console.log('\n[D] Nhãn nút chuyển bước ghi rõ bước hiện tại và bước tới');
    ({ win: W, doc } = await loadDom());
    const jn = mkJob06(W, 'Khách N', 10000000);
    t('nhãn nút ở Khách hỏi: "Xong: Khách hỏi → Đã chốt"', W.jobDetailHTML(jn).includes('Xong: Khách hỏi → Đã chốt'));
    t('source không còn nhãn cũ "Xong bước này"', !html.includes('Xong bước này'));
    W.openJob(jn.id);
    await sleep(100);
    const nextBtn = doc.querySelector('[data-act="next"]');
    t('nút chuyển bước hiển thị trong sheet chi tiết', !!nextBtn);
    if (nextBtn) eq('nút trong sheet ghi đúng bước tới', nextBtn.textContent, 'Xong: Khách hỏi → Đã chốt');
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
      mkJob07(W, 'j3', 'Hương', 'Khách hỏi', 3),                           // mục 7 ngày
      mkJob07(W, 'j4', 'Tuấn', 'Đã chốt', 7),                          // biên: đúng 7 ngày -> mục 7 ngày
      mkJob07(W, 'j5', 'Ngọc', 'Khách hỏi', 8),                            // biên: 8 ngày -> Sắp tới
      mkJob07(W, 'j6', 'Dũng', 'Khách hỏi', 31),                           // ngoài 30 ngày -> không mục nào
      mkJob07(W, 'j7', 'Mai', 'Khách hỏi', 22, { cancelled: true }),       // đã huỷ -> không mục nào
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
    eq('APP_VERSION giữ 2.3', W.APP_VERSION, '2.3');
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
      eq('auth URL: scope đúng calendar.readonly (+ openid profile để lấy tên)', u.searchParams.get('scope'), SC08.cal + ' openid email profile');
      eq('auth URL: include_granted_scopes=true (xin thêm quyền sau vẫn giữ quyền cũ)', u.searchParams.get('include_granted_scopes'), 'true');
      t('auth URL: không có gmail.send', !u.searchParams.get('scope').includes(SC08.send));
      t('auth URL: response_type=code (PKCE, không token ngầm)', u.searchParams.get('response_type') === 'code');
      t('auth URL: xin access_type=offline (giữ đăng nhập bằng refresh token)', u.searchParams.get('access_type') === 'offline');
    }
    setFeat08(W, { cal: true, bank: true, leads: true, contacts: true, drive: true, calw: true, send: true });
    capturedUrl = null;
    await W.gConnect(false);
    await sleep(50);
    if (capturedUrl) {
      const allUrl = scopesOf08(new URL(capturedUrl).searchParams.get('scope'));
      eq('auth URL đủ tính năng: đúng 6 scope (+ openid profile)', allUrl.filter(x => x !== 'openid' && x !== 'profile' && x !== 'email').length, 6);
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
    t('sheet có nút Đăng nhập bằng Google', !!(g.querySelector('#gGuideConn') && g.querySelector('#gGuideConn').textContent.includes('Đăng nhập bằng Google')));
    // đóng sheet hướng dẫn, quay lại Cài đặt
    gSheets[gSheets.length - 1].querySelector('.sh-l').click();
    await sleep(500);

    console.log('\n[4] v2.3b: công tắc Google ẩn khỏi Cài đặt khi chưa kết nối (bật/tắt ở sheet giải thích)');
    sheets = doc.querySelectorAll('.sheet .sheet-body');
    st = sheets[sheets.length - 1];
    t('chưa kết nối: Cài đặt không còn công tắc tính năng Google nào', st.querySelectorAll('[data-gfeat]').length === 0, String(st.querySelectorAll('[data-gfeat]').length));
    t('chưa kết nối: vẫn có hàng "Đăng nhập Google để làm gì?"', !!st.querySelector('#gGuideRow'));

    console.log('\n[5] Chân trang Cài đặt khớp 100% với scope thật');
    /* v2.3b: chân trang nằm trong cụm công tắc, chỉ hiện khi đã kết nối —
       gieo token để kiểm chứng logic chân trang (không test kết nối thật). */
    W.localStorage.setItem('troLyXeo.gtoken', JSON.stringify({ t: 'tok30', exp: Date.now() + 3600000, s: '' }));
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
      id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage: 'Khách hỏi',
      shootDate: W.dstr(0), shootTime: '09:00', location: 'Studio', deadline: W.dstr(14),
      price, phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '',
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
    W.downloadBackup(); /* v2.7b: nút sao lưu chỉ còn trong Cài đặt — gọi thẳng hàm */
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
    t('hàng Quyền riêng tư ghi đúng nội dung', !!pr && pr.textContent.includes('Quyền riêng tư')); /* v2.7b: bỏ dòng giải thích dưới nút */
    e.openedUrls.length = 0;
    pr.click();
    await sleep(50);
    const pvs = doc5.querySelectorAll('.sheet .pv'); const pv = pvs[pvs.length - 1];
    t('bấm hàng Quyền riêng tư mở trang ngay trong app (không mở web)', !!pv && e.openedUrls.length === 0);
    t('trang Quyền riêng tư có đủ mục Google + Xoá dữ liệu + Liên hệ', !!pv && pv.textContent.includes('Đăng nhập Google') && pv.textContent.includes('Xoá tài khoản và dữ liệu') && pv.textContent.includes('supportfotobro@gmail.com'));
  }
  console.log('\n[32] fix-10 — Hiển thị nhỏ + hạng mục chi Thuê đèn/Hoàn cọc, hoàn cọc, .tx-note');
  {
    console.log('[F10-1] Chữ + lang (kiểm tra trên source)');
    t('không còn "Giọng nói sẽ có ở bản v2.1"', !html.includes('Giọng nói sẽ có ở bản v2.1'));
    t('"Giọng nói sẽ có ở bản sau" không còn trong code (mic hỏi đã gỡ)', !html.includes('Giọng nói sẽ có ở bản sau'));
    t('html lang="vi"', html.includes('<html lang="vi">'));
    t('câu dài "Nhập từ Lịch iPhone" đã rút ngắn', !html.includes('Bấm 1 chạm trong app iOS — sự kiện 30 ngày tới thành buổi chụp; hoặc đăng nhập Google để đọc Lịch Google'));
    t('câu ngắn mới có trong code', html.includes('Đăng nhập Google là buổi chụp tự lưu vào Google Lịch'));

    console.log('\n[F10-2] Tab bar + celebrate (kiểm tra trên source/CSS)');
    t('tabbar dùng nền đặc --bar-strong', /\.tabbar\{[^}]*background:var\(--bar-strong\)/.test(html));
    t('glass C: tabbar nhuộm đỏ sáng --tab-bg .14', html.includes('--tab-bg:rgba(250,45,72,.14)'));
    t('glass C: tabbar nhuộm đỏ tối --tab-bg .30', html.includes('--tab-bg:rgba(250,45,72,.30)'));
    t('glass C: tabbar dùng background:var(--tab-bg)', /html\[data-glass="1"\] \.tabbar\{[^}]*background:var\(--tab-bg\) !important/.test(html));
    t('glass C: tabbar .92 cũ đã bỏ', !html.includes('background:rgba(255,255,255,.92)') && !html.includes('background:rgba(0,0,0,.92)'));
    t('.stk-pop pointer-events:none', /\.stk-pop\{[^}]*pointer-events:none/.test(html));
    t('celebrate tắt sau 1100ms', html.includes('setTimeout(rm, 1100)'));
    t('màn chào: .wl-list .row gọn 44px', html.includes('.wl-list .row{ min-height:44px; padding:8px 16px; }'));
    t('màn chào: wl-mini 76px', html.includes('.wl-mini{ width:76px; height:76px;'));

    console.log('\n[F10-3] Hạng mục chi + máy tính giá');
    const { win: W, doc, errors } = await loadDom();
    DOC = doc;
    t('trang tải không lỗi jsdom', errors.length === 0, errors.slice(0, 3).join(' | '));
    eq('APP_VERSION vẫn 2.3', W.APP_VERSION, '2.3');
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
    const j0 = { id: W.nid(), client: 'Nguyễn Thị Mai Anh', type: 'Wedding', medium: 'Digital', stage: 'Đã chốt',
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
    const j1 = { id: W.nid(), client: 'Khách Có Cọc', type: 'Wedding', medium: 'Digital', stage: 'Đã chốt',
      stageSince: W.dstr(0), shootDate: W.dstr(10), shootTime: '08:00', location: '', deadline: '',
      price: 15000000, phone: '', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j1);
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j1.id, amount: 6000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    eq('jobDep tính đúng 6tr', W.jobDep(j1), 6000000);
    W.jobAction('cancel', j1.id);
    await sleep(200);
    const asheets5 = [...doc.querySelectorAll('.asheet')];
    const as5 = asheets5[asheets5.length - 1];
    const refundBtns = [...as5.querySelectorAll('[data-a]')].filter(b => b.textContent.includes('Khách huỷ — hoàn cọc'));
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
      eq('form hoàn cọc: ghi chú để trống, gợi ý hiện mờ (v2.4)', f2.elements.note.value + '|' + f2.elements.note.placeholder, '|Hoàn cọc cho Khách Có Cọc (không bắt buộc)');
      eq('form hoàn cọc: gắn đúng job', f2.elements.jobId.value, String(j1.id));
      t('form hoàn cọc: đang ở tab Chi', !!doc.querySelector('#txForm #txKindSeg button[data-k="chi"].on'));
    }
    await closeSheet();

    console.log('\n[F10-6] Huỷ job KHÔNG cọc -> không hỏi hoàn cọc');
    const j2 = { id: W.nid(), client: 'Khách Không Cọc', type: 'Portrait', medium: 'Digital', stage: 'Khách hỏi',
      stageSince: W.dstr(0), shootDate: W.dstr(0), shootTime: '08:00', location: 'Studio', deadline: '',
      price: 2500000, phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j2);
    await sleep(500); /* chờ asheet của test trước tháo khỏi DOM */
    W.jobAction('cancel', j2.id);
    await sleep(200);
    const asheets6 = [...doc.querySelectorAll('.asheet')];
    const as6 = asheets6[asheets6.length - 1];
    const noRefund = [...as6.querySelectorAll('[data-a]')].filter(b => b.textContent.includes('hoàn cọc'));
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
  console.log('\n[33] v2.2 — màn đăng nhập lúc vào app, lỗi Apple, khoá native, mẫu tin mới');
  {
  const nodeCrypto22 = require('crypto');
  const loadDom22 = async function (opts) {
    opts = opts || {};
    const vc = new VirtualConsole();
    const errors = [];
    vc.on('jsdomError', e => errors.push(String((e && e.message) || e)));
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(win) {
        win.crypto.subtle = nodeCrypto22.webcrypto.subtle; // jsdom không có subtle; PIN check cần nó
        if (opts.native) win.Capacitor = { isNativePlatform: () => true };
        if (opts.appleSignIn) win.__fotobroAppleSignIn = opts.appleSignIn;
        if (opts.appleAvailable) win.__fotobroAppleAvailable = opts.appleAvailable;
        if (opts.bioAvailable) win.__fotobroBiometricAvailable = opts.bioAvailable;
        if (opts.bioVerify) win.__fotobroBiometricVerify = opts.bioVerify;
        if (opts.seedLS) for (const k of Object.keys(opts.seedLS)) win.localStorage.setItem(k, opts.seedLS[k]);
      },
    });
    await new Promise(r => dom.window.addEventListener('load', r));
    await new Promise(r => setTimeout(r, 50));
    return { dom, win: dom.window, doc: dom.window.document, errors };
  };
  const closeSheetIn = async (d) => { const els = d.querySelectorAll('.sheet .sh-l'); if (els.length) els[els.length - 1].click(); await sleep(500); };

    console.log('\n[1] Màn đăng nhập lúc vào app');
    const g0 = await loadDom22();
    const W0 = g0.win, doc0 = g0.doc;
    t('gate: hiện khi chưa liên kết tài khoản nào', !!doc0.querySelector('#authGate'));
    t('gate (web): không có nút Apple', !doc0.querySelector('#agApple'));
    t('gate: có nút Google', !!doc0.querySelector('#agGoogle'));
    t('gate: có link dùng thử không cần tài khoản', !!doc0.querySelector('#agSkip'));
    t('gate: có ghi chú dữ liệu ở trên máy', (doc0.querySelector('#authGate') || { textContent: '' }).textContent.includes('Dữ liệu vẫn nằm trên máy bạn'));
    doc0.querySelector('#agSkip').click();
    eq('gate: bấm bỏ qua -> authAsked = true', W0.state.cfg.authAsked, true);
    await sleep(500);
    t('gate: bấm bỏ qua -> màn đăng nhập đóng', !doc0.querySelector('#authGate'));
    const g0b = await loadDom22({ seedLS: { 'troLyXeo.v1': JSON.stringify({ jobs: [], txs: [], cfg: { authAsked: true }, sample: false }) } });
    t('gate: đã bấm bỏ qua trước đó -> không hiện lại', !g0b.doc.querySelector('#authGate'));
    const g0c = await loadDom22({ seedLS: { 'troLyXeo.v1': JSON.stringify({ jobs: [], txs: [], cfg: { apple: { user: 'u1', name: 'Mai Anh', email: '', relay: false, at: 1 } }, sample: false }) } });
    t('gate: đã liên kết Apple -> không hiện', !g0c.doc.querySelector('#authGate'));

    console.log('\n[2] Màn đăng nhập: bấm Apple trên native -> vào app');
    const g1 = await loadDom22({ native: true,
      appleAvailable: () => true,
      appleSignIn: async () => ({ user: 'apple-u1', email: 'x@privaterelay.appleid.com', givenName: 'Mai', familyName: 'Anh' }),
    });
    const W1 = g1.win, doc1 = g1.doc;
    t('gate (native): có nút Apple', !!doc1.querySelector('#agApple'));
    doc1.querySelector('#agApple').click();
    await sleep(300);
    eq('gate (native): đăng nhập Apple xong -> cfg.apple.user', W1.state.cfg.apple && W1.state.cfg.apple.user, 'apple-u1');
    eq('gate (native): tên lấy từ Apple', W1.state.cfg.apple && W1.state.cfg.apple.name, 'Mai Anh');
    await sleep(500);
    t('gate (native): đăng nhập xong -> màn đăng nhập tự đóng', !doc1.querySelector('#authGate'));

    console.log('\n[3] Apple sign-in: lỗi thật lưu lại, Huỷ im lặng');
    const g2 = await loadDom22({ native: true,
      appleAvailable: () => true,
      appleSignIn: async () => { const e = new Error('Test error 1004'); e.code = '1004'; throw e; },
    });
    const W2 = g2.win, doc2 = g2.doc;
    await W2.aConnect();
    await sleep(50);
    eq('Apple lỗi 1004: appleLastError.code', W2.state.cfg.appleLastError && W2.state.cfg.appleLastError.code, '1004');
    t('Apple lỗi 1004: appleLastError.message', (W2.state.cfg.appleLastError && W2.state.cfg.appleLastError.message || '').includes('Test error 1004'));
    eq('Apple lỗi 1004: toast lỗi chung', doc2.querySelector('#toastText').textContent, 'Chưa đăng nhập được bằng Apple, thử lại nha');
    W2.openSettings(); await sleep(150);
    const st2 = doc2.querySelectorAll('.sheet .sheet-body'); const stBody2 = st2[st2.length - 1];
    t('Apple lỗi 1004: Cài đặt hiện dòng "Lỗi gần nhất: 1004"', stBody2.textContent.includes('Lỗi gần nhất: 1004'));
    await closeSheetIn(doc2);
    const g3 = await loadDom22({ native: true,
      appleAvailable: () => true,
      appleSignIn: async () => { const e = new Error('Sign in was canceled.'); e.code = 'SIGN_IN_CANCELED'; throw e; },
    });
    const W3 = g3.win, doc3 = g3.doc;
    const toastBefore3 = doc3.querySelector('#toastText').textContent;
    await W3.aConnect();
    await sleep(50);
    t('Apple Huỷ (SIGN_IN_CANCELED): không lưu lỗi', W3.state.cfg.appleLastError == null);
    eq('Apple Huỷ: không toast lỗi', doc3.querySelector('#toastText').textContent, toastBefore3);
    const g4 = await loadDom22({ native: true,
      appleAvailable: () => true,
      appleSignIn: async () => { const e = new Error('The operation couldn\u2019t be completed.'); e.code = '1001'; throw e; },
    });
    const W4 = g4.win, doc4 = g4.doc;
    await W4.aConnect();
    await sleep(50);
    t('Apple Huỷ (1001): không lưu lỗi', W4.state.cfg.appleLastError == null);
    W2.state.cfg.appleLastError = { code: '1004', message: 'cũ', at: 1 };
    W2.__fotobroAppleSignIn = async () => ({ user: 'u9', email: '', givenName: '', familyName: '' });
    await W2.aConnect();
    await sleep(50);
    t('Apple thành công: xoá appleLastError', W2.state.cfg.appleLastError === null);

    console.log('\n[4] Khoá Face ID native');
    const g5 = await loadDom22({ native: true,
      bioAvailable: async () => true,
      bioVerify: async () => true,
    });
    const W5 = g5.win, doc5 = g5.doc;
    t('khoá native: bioNative() true khi có bridge', W5.bioNative());
    await W5.enableLock('1234');
    const lc5 = W5.lockCfg();
    t('khoá native: lockCfg có sau enableLock', !!lc5);
    eq('khoá native: id = native', lc5 && lc5.id, 'native');
    t('khoá native: PIN 1234 đúng', await W5.pinCheck('1234'));
    t('khoá native: PIN sai bị từ chối', !(await W5.pinCheck('0000')));
    t('khoá native: bioCheck mở được', await W5.bioCheck());
    W5.__fotobroBiometricVerify = async () => false;
    let threw5 = false; try { await W5.bioCheck(); } catch (e) { threw5 = true; }
    t('khoá native: Huỷ Face ID -> bioCheck throw', threw5);
    const g6 = await loadDom22({ native: true,
      bioAvailable: async () => false,
      bioVerify: async () => true,
    });
    const W6 = g6.win, doc6 = g6.doc;
    W6.openLockSetup();
    await sleep(150);
    t('khoá native: máy không có sinh trắc -> toast rõ', (doc6.querySelector('#toastText').textContent || '').includes('chưa cài Face ID'));
    t('khoá native: máy không có sinh trắc -> không mở form', !doc6.querySelector('#lkSetForm'));
    t('khoá web: bioNative() false', W.bioNative() === false);

    console.log('\n[5] Mẫu tin nhắn / email mới');
    /* DOC toàn cục đã bị các mục trước đổi sang ngữ cảnh khác (dòng 1693) —
       mục này dùng `doc` gốc của suite, không dùng DOC. */
    const docMain = doc;
    const lastSheetMain = (sel) => { const els = docMain.querySelectorAll('.sheet ' + sel); return els[els.length - 1]; };
    const agMain = docMain.querySelector('#authGate'); if (agMain) agMain.remove(); // dọn cổng để test Cài đặt (hành vi bỏ qua đã test ở [1])
    W.state.cfg.mailTpls = {}; W.saveLocal();
    W.openSettings();
    await sleep(150);
    const cards = [...docMain.querySelectorAll('.tpl-card')];
    eq('mẫu: đủ 5 card mẫu email', cards.length, 5);
    const prev0 = cards[0].querySelector('.tpl-prev').textContent;
    t('mẫu: xem trước đã điền tên mẫu', prev0.includes('Mai Anh'));
    t('mẫu: xem trước KHÔNG còn {tên} thô', !prev0.includes('{tên}') && !prev0.includes('{loại}'));
    t('mẫu: card Đã nhận cọc xem trước đã điền tiền cọc mẫu', cards[1].querySelector('.tpl-prev').textContent.includes('1.000.000₫'));
    t('mẫu: Cài đặt không còn "xem README"', !docMain.querySelector('.sheet').textContent.includes('xem README'));
    cards[0].click();
    await sleep(150);
    const ed = lastSheetMain('.sheet-body');
    t('editor: mở sheet soạn mẫu', !!ed && !!ed.querySelector('#tplSubj'));
    eq('editor: đủ 8 chip chèn', ed.querySelectorAll('.tpl-chip').length, 8);
    t('editor: xem trước đang ẩn', ed.querySelector('#tplPrevBox').classList.contains('hidden'));
    const bodyTa = ed.querySelector('#tplBody');
    bodyTa.focus();
    bodyTa.setSelectionRange(0, 0);
    ed.querySelector('.tpl-chip[data-ph="{tên}"]').click();
    t('editor: chip chèn {tên} vào đầu ô nội dung', bodyTa.value.startsWith('{tên}'));
    t('editor: chèn xong tự lưu vào cfg', (W.state.cfg.mailTpls.confirm || {}).b && W.state.cfg.mailTpls.confirm.b.startsWith('{tên}'));
    W.tplAutoGrow(bodyTa);
    t('editor: textarea tự cao (style.height được đặt >= 56px)', parseInt(bodyTa.style.height, 10) >= 56, bodyTa.style.height);
    ed.querySelector('#tplPrevBtn').click();
    await sleep(50);
    const pv = ed.querySelector('#tplPrevBox');
    t('editor: Xem trước hiện bản đã điền (tên + giá mẫu)', !pv.classList.contains('hidden') && pv.textContent.includes('Mai Anh') && pv.textContent.includes('2.500.000₫'));
    eq('editor: nút đổi thành Soạn mẫu', ed.querySelector('#tplPrevBtn').textContent, 'Soạn mẫu');
    ed.querySelector('#tplPrevBtn').click();
    await sleep(50);
    t('editor: bấm Soạn mẫu quay lại soạn', ed.querySelector('#tplPrevBox').classList.contains('hidden'));
    const subjTa = ed.querySelector('#tplSubj');
    subjTa.value = 'Tiêu đề tự sửa';
    subjTa.dispatchEvent(new W.Event('input', { bubbles: true }));
    t('editor: sửa tiêu đề tự lưu', (W.state.cfg.mailTpls.confirm || {}).s === 'Tiêu đề tự sửa');
    ed.querySelector('#tplResetBtn').click();
    await sleep(50);
    eq('editor: khôi phục -> tiêu đề về mẫu gốc', subjTa.value, 'Xác nhận lịch chụp {loại}');
    t('editor: khôi phục -> xoá phần sửa trong cfg', !W.state.cfg.mailTpls.confirm);
    await closeSheetIn(docMain);
  }

  console.log('\n[34] v2.3 — viền trắng safe area (StatusBar theo theme) + gợi ý lỗi Apple 1000');
  {
  const closeSheet23 = async (d) => { const els = d.querySelectorAll('.sheet .sh-l'); if (els.length) els[els.length - 1].click(); await sleep(500); };
  // [34a] Bridge §9: __fotobroStatusBarStyle gọi StatusBar.setStyle đúng LIGHT/DARK
  const bridgeSrc23 = fs.readFileSync(path.join(__dirname, 'www', 'capacitor-bridge.js'), 'utf-8');
  async function loadBridgeSB(themeAttr) {
    const sbCalls = [];
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w) {
        w.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios',
          Plugins: { StatusBar: { setStyle: (o) => { sbCalls.push(o && o.style); } } } };
      },
    });
    if (themeAttr) dom.window.document.documentElement.setAttribute('data-theme', themeAttr);
    const s = dom.window.document.createElement('script');
    s.textContent = bridgeSrc23;
    dom.window.document.body.appendChild(s);
    await new Promise(r => setTimeout(r, 50));
    return { win: dom.window, sbCalls };
  }
  const sb1 = await loadBridgeSB(null);
  t('bridge §9: có hàm __fotobroStatusBarStyle', typeof sb1.win.__fotobroStatusBarStyle === 'function');
  eq('bridge §9: tự đồng bộ lúc nạp (không theme -> DARK)', sb1.sbCalls[0], 'DARK');
  sb1.win.__fotobroStatusBarStyle(true);
  eq('bridge §9: theme tối -> LIGHT', sb1.sbCalls[sb1.sbCalls.length - 1], 'LIGHT');
  sb1.win.__fotobroStatusBarStyle(false);
  eq('bridge §9: theme sáng -> DARK', sb1.sbCalls[sb1.sbCalls.length - 1], 'DARK');
  const sb2 = await loadBridgeSB('dark');
  eq('bridge §9: tự đồng bộ lúc nạp (theme dark -> LIGHT)', sb2.sbCalls[0], 'LIGHT');
  const domNoSB = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) { w.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: {} }; },
  });
  const sNoSB = domNoSB.window.document.createElement('script');
  sNoSB.textContent = bridgeSrc23;
  domNoSB.window.document.body.appendChild(sNoSB);
  await new Promise(r => setTimeout(r, 50));
  let sbNoThrow = true;
  try { domNoSB.window.__fotobroStatusBarStyle(true); } catch (e) { sbNoThrow = false; }
  t('bridge §9: không plugin -> gọi im lặng, không ném lỗi', sbNoThrow);

  // [34b] applyTheme() móc StatusBar + html có background var(--bg)
  const loadDom23 = async function (opts) {
    opts = opts || {};
    const sbCalls = [];
    const vc = new VirtualConsole();
    const errors = [];
    vc.on('jsdomError', e => errors.push(String((e && e.message) || e)));
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(win) {
        win.__fotobroStatusBarStyle = (isDark) => { sbCalls.push(isDark); };
        if (opts.native) win.Capacitor = { isNativePlatform: () => true };
        if (opts.appleAvailable) win.__fotobroAppleAvailable = opts.appleAvailable;
        if (opts.appleSignIn) win.__fotobroAppleSignIn = opts.appleSignIn;
        if (opts.seedLS) for (const k of Object.keys(opts.seedLS)) win.localStorage.setItem(k, opts.seedLS[k]);
      },
    });
    await new Promise(r => dom.window.addEventListener('load', r));
    await new Promise(r => setTimeout(r, 50));
    return { dom, win: dom.window, doc: dom.window.document, errors, sbCalls };
  };
  const g5 = await loadDom23();
  const W5 = g5.win, doc5 = g5.doc;
  t('theme: applyTheme lúc mở app gọi StatusBar (warm -> false)', g5.sbCalls.length >= 1 && g5.sbCalls[0] === false, JSON.stringify(g5.sbCalls));
  /* v2.5: sáng / tối theo máy — giả lập iPhone chuyển chế độ tối */
  const mm5 = W5.matchMedia; W5.matchMedia = (q) => ({ matches: /dark/.test(q), addEventListener(){}, addListener(){} }); W5.applyTheme();
  eq('theme: máy chế độ tối -> StatusBar true', g5.sbCalls[g5.sbCalls.length - 1], true);
  W5.matchMedia = mm5; W5.applyTheme();
  eq('theme: máy về sáng -> StatusBar false', g5.sbCalls[g5.sbCalls.length - 1], false);
  t('theme: v2.6 không đổi màu app (không đặt --accent riêng)', doc5.documentElement.style.getPropertyValue('--accent').trim() === '');
  t('css: html có background var(--bg)', /html\{[^}]*background:var\(--bg\)/.test(html));
  t('css: body vẫn có background var(--bg)', /body\{[^}]*background:var\(--bg\)/.test(html));
  const g5b = await loadDom23({ native: true, appleAvailable: () => true });
  const W5b = g5b.win, doc5b = g5b.doc;
  W5b.openSettings(); await sleep(150);
  t('theme: Cài đặt không còn nút chọn sáng/tối (theo máy)', !doc5b.querySelector('#themeSeg'));
  t('theme: v2.6 Cài đặt không còn bảng đổi màu app', !doc5b.querySelector('[data-brand]'));
  await closeSheet23(doc5b);

  // [34c] Gợi ý lỗi Apple 1000 chỉ hiện khi code 1000
  const g6 = await loadDom23({ native: true, appleAvailable: () => true });
  const W6 = g6.win, doc6 = g6.doc;
  W6.state.cfg.appleLastError = { code: '1000', message: 'The operation couldn\u2019t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)', at: Date.now() };
  W6.openSettings(); await sleep(150);
  const st6 = doc6.querySelectorAll('.sheet .sheet-body'); const stBody6 = st6[st6.length - 1];
  t('Apple 1000: Cài đặt hiện dòng "Lỗi gần nhất: 1000"', stBody6.textContent.includes('Lỗi gần nhất: 1000'));
  t('Apple 1000: hiện gợi ý kiểm tra Xác thực hai yếu tố', stBody6.textContent.includes('Xác thực hai yếu tố'));
  t('Apple 1000: gợi ý nhắc đăng nhập iCloud', stBody6.textContent.includes('đăng nhập iCloud'));
  await closeSheet23(doc6);
  const g7 = await loadDom23({ native: true, appleAvailable: () => true });
  const W7 = g7.win, doc7 = g7.doc;
  W7.state.cfg.appleLastError = { code: '1004', message: 'Test error 1004', at: Date.now() };
  W7.openSettings(); await sleep(150);
  const st7 = doc7.querySelectorAll('.sheet .sheet-body'); const stBody7 = st7[st7.length - 1];
  t('Apple 1004: hiện dòng lỗi nhưng KHÔNG gợi ý 2FA', stBody7.textContent.includes('Lỗi gần nhất: 1004') && !stBody7.textContent.includes('Xác thực hai yếu tố'));
  await closeSheet23(doc7);
  const g8 = await loadDom23({ native: true, appleAvailable: () => true,
    appleSignIn: async () => { const e = new Error('The operation couldn\u2019t be completed.'); e.code = '1000'; throw e; },
  });
  const W8 = g8.win, doc8 = g8.doc;
  await W8.aConnect();
  await sleep(50);
  eq('Apple 1000 qua aConnect: appleLastError.code', W8.state.cfg.appleLastError && W8.state.cfg.appleLastError.code, '1000');
  W8.openSettings(); await sleep(150);
  const st8 = doc8.querySelectorAll('.sheet .sheet-body'); const stBody8 = st8[st8.length - 1];
  t('Apple 1000 qua aConnect: Cài đặt hiện gợi ý 2FA', stBody8.textContent.includes('Xác thực hai yếu tố'));
  await closeSheet23(doc8);

  // [34d] capacitor.config.ts: webview phủ full màn, không còn nền trắng
  const cfgSrc = fs.readFileSync(path.join(__dirname, 'capacitor.config.ts'), 'utf-8');
  t('config: overlaysWebView true', cfgSrc.includes('overlaysWebView: true'));
  t('config: contentInset never', cfgSrc.includes("contentInset: 'never'"));
  t('config: backgroundColor top-level đen', cfgSrc.includes("backgroundColor: '#000000'"));
  const sbBlock = (cfgSrc.match(/StatusBar:\s*\{[^}]*\}/) || [''])[0];
  t('config: StatusBar không còn backgroundColor trắng', !sbBlock.includes('#FFFFFF'));
  t('config: SplashScreen giữ nguyên (không đụng)', cfgSrc.includes('SplashScreen') && cfgSrc.includes("backgroundColor: '#FFFFFF'"));
  }

  console.log('\n[35] v2.3b — fix batch theo 10 báo cáo test v2.2');
  {
  const closeSheet35 = async (d) => { const els = d.querySelectorAll('.sheet .sh-l'); if (els.length) els[els.length - 1].click(); await sleep(500); };
  const loadDom35 = async function (opts) {
    opts = opts || {};
    const sbCalls = [];
    const vc = new VirtualConsole();
    const errors = [];
    vc.on('jsdomError', e => errors.push(String((e && e.message) || e)));
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(win) {
        win.__fotobroStatusBarStyle = (isDark) => { sbCalls.push(isDark); };
        if (opts.native) win.Capacitor = { isNativePlatform: () => true };
        if (opts.appleAvailable) win.__fotobroAppleAvailable = opts.appleAvailable;
        if (opts.appleSignIn) win.__fotobroAppleSignIn = opts.appleSignIn;
        if (opts.seedLS) for (const k of Object.keys(opts.seedLS)) win.localStorage.setItem(k, opts.seedLS[k]);
      },
    });
    await new Promise(r => dom.window.addEventListener('load', r));
    await new Promise(r => setTimeout(r, 50));
    return { dom, win: dom.window, doc: dom.window.document, errors, sbCalls };
  };
  const mkJ35 = (W, client, price, stage, paid) => {
    const j = { id: W.nid(), client, type: 'Portrait', medium: 'Digital', stage,
      stageSince: W.dstr(0), shootDate: '2026-11-21', shootTime: '08:00', location: 'Studio', deadline: '',
      price, phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W.state.jobs.unshift(j);
    if (paid) W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: paid, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    return j;
  };
  const TOK35 = () => JSON.stringify({ t: 'tok35', exp: Date.now() + 3600000, s: '' });

  // [35a] Mục 1 — nút Apple trên cổng: gọi cổng sau thẻ bridge + tự chữa khi bridge tải muộn
  const bridgeIdx = html.indexOf('<script src="capacitor-bridge.js">');
  const postGateIdx = html.indexOf('if (!lockCfg()){ maybeShowAuthGate();');
  t('1: lời gọi cổng lúc khởi động nằm SAU thẻ capacitor-bridge.js', bridgeIdx > 0 && postGateIdx > bridgeIdx, 'bridge=' + bridgeIdx + ' gate=' + postGateIdx);
  t('1: không còn lời gọi cổng cũ trong script inline trước bridge', !html.slice(0, bridgeIdx).includes('if (!lockCfg()) maybeShowAuthGate();'));
  const g1 = await loadDom35();
  t('1: cổng lúc mở lần đầu (chưa có bridge) vẫn hiện, chỉ thiếu nút Apple', !!g1.doc.querySelector('#authGate') && !g1.doc.querySelector('#agApple'));
  g1.win.Capacitor = { isNativePlatform: () => true };
  g1.win.__fotobroAppleAvailable = () => true;
  g1.win.maybeShowAuthGate();
  t('1: bridge tải muộn -> gọi lại cổng thì nút Apple xuất hiện (tự chữa)', !!g1.doc.querySelector('#agApple'));
  const g1b = await loadDom35({ native: true, appleAvailable: () => true });
  t('1: mở lần đầu không khoá, có bridge -> nút Apple hiện ngay', !!g1b.doc.querySelector('#agApple'));
  t('1: trang tải không lỗi jsdom', g1.errors.length === 0 && g1b.errors.length === 0, (g1.errors[0] || '') + ' | ' + (g1b.errors[0] || ''));

  // [35b] Mục 2 — bấm "Dùng thử" thì vào thẳng Hôm nay, không tour; tour vẫn mở được tay
  const g2 = await loadDom35();
  g2.doc.querySelector('#agSkip').click();
  await sleep(800);
  t('2: bấm Dùng thử -> không có màn chào mừng', !g2.doc.querySelector('.welcome'));
  eq('2: bấm Dùng thử -> welcomed=2 (tour không tự mở lại)', g2.win.localStorage.getItem('troLyXeo.welcomed'), '2');
  g2.win.openWelcome();
  t('2: tour vẫn mở được bằng tay (Thêm -> Hướng dẫn)', !!g2.doc.querySelector('.welcome'));

  // [35c] Mục 3 — cờ googleEverLinked: cổng bỏ qua khi token hết hạn, user mới vẫn thấy cổng
  const g3 = await loadDom35();
  const W3 = g3.win, doc3 = g3.doc;
  W3.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  t('3: user mới (chưa liên kết) vẫn thấy cổng', !!doc3.querySelector('#authGate'));
  W3.state.cfg.googleEverLinked = true; W3.saveLocal();
  doc3.querySelector('#authGate').remove();
  W3.maybeShowAuthGate();
  t('3: đã từng liên kết Google -> cổng không hiện lại (dù token hết hạn)', !doc3.querySelector('#authGate'));
  W3.state.cfg.googleEverLinked = false; W3.saveLocal();
  W3.maybeShowAuthGate();
  t('3: chưa từng liên kết -> cổng hiện lại', !!doc3.querySelector('#authGate'));
  let gcArgs = null;
  W3.gConnect = function (s, a) { gcArgs = [s, a]; };
  W3.state.cfg.googleEverLinked = true;
  W3.maybeSilentGoogle();
  t('3: everLinked + hết token -> thử đăng nhập im lặng (silent, auto)', gcArgs && gcArgs[0] === true && gcArgs[1] === true, JSON.stringify(gcArgs));
  gcArgs = null; W3.state.cfg.googleEverLinked = false;
  W3.maybeSilentGoogle();
  t('3: user mới thật -> không thử đăng nhập im lặng', gcArgs === null);
  W3.state.cfg.googleEverLinked = true;
  W3.localStorage.setItem('troLyXeo.gtoken', TOK35());
  gcArgs = null; W3.maybeSilentGoogle();
  t('3: token còn hạn -> không thử đăng nhập im lặng', gcArgs === null);
  W3.localStorage.removeItem('troLyXeo.gtoken');
  W3.state.cfg.googleEverLinked = false; W3.saveLocal(); W3.gMarkLinked();
  t('3: gMarkLinked ghi cờ bền', W3.state.cfg.googleEverLinked === true && (W3.localStorage.getItem('troLyXeo.v1') || '').includes('"googleEverLinked":true'));

  // [35d] Mục 4 — job 0đ nhắc luôn khi đã có job khác nợ (Tiền bạc + Trợ lý + phòng)
  const g4 = await loadDom35();
  const W4 = g4.win, doc4 = g4.doc;
  mkJ35(W4, 'Khách Nợ', 2500000, 'Đã chốt', 1000000);
  mkJ35(W4, 'Khách Chưa Giá', 0, 'Đã giao', 0);
  W4.renderMoney();
  t('4: Tiền bạc vẫn liệt kê Khách Nợ', doc4.querySelector('#oweList').textContent.includes('Khách Nợ'));
  t('4: Tiền bạc nhắc job chưa ghi giá dù đã có người nợ', doc4.querySelector('#oweList').textContent.includes('chưa ghi giá'));
  t('4: Trợ lý (debtorsText) nhắc job chưa ghi giá dù đã có người nợ', W4.debtorsText().includes('Khách Nợ') && W4.debtorsText().includes('chưa ghi giá'));
  t('4: Trợ lý "ai chưa trả tiền?" nhắc job chưa ghi giá', W4.answer('ai chưa trả tiền?').includes('chưa ghi giá'));
  t('4: Phòng Đón khách nhắc job chưa ghi giá dù đã có người nợ', W4.deptLines('donkhach').join(' ').includes('chưa ghi giá'));
  t('4: Phòng Tiền bạc nhắc job chưa ghi giá dù đã có người nợ', W4.deptLines('tienbac').join(' ').includes('chưa ghi giá'));

  // [35e] Mục 5 — CHECKLISTS.Event + checkItems phòng thủ
  const g5c = await loadDom35();
  const W5c = g5c.win;
  t('5: CHECKLISTS.Event có đồ event', Array.isArray(W5c.CHECKLISTS.Event) && W5c.CHECKLISTS.Event.length >= 6, JSON.stringify(W5c.CHECKLISTS.Event));
  t('5: checklist Event nhắc timeline chương trình', W5c.checkItems('Event').join(' ').includes('Timeline chương trình'));
  t('5: checklist Event nhắc khách VIP', W5c.checkItems('Event').join(' ').includes('khách VIP'));
  let noCrash = true; let unk = null;
  try { unk = W5c.checkItems('Kiểu lạ'); } catch (e) { noCrash = false; }
  t('5: checkItems loại lạ không crash, trả mảng rỗng', noCrash && Array.isArray(unk) && unk.length === 0);
  eq('5: listType Event không rơi về Portrait', W5c.listType('Event'), 'Event');

  // [35f] Mục 6 — hàng Đăng nhập trên Hôm nay + reset authAsked khi ngắt kết nối
  const g6 = await loadDom35();
  const W6 = g6.win, doc6 = g6.doc;
  t('v2.7b: Hôm nay không còn hàng Đăng nhập / Hỏi FotoBro', !doc6.querySelector('#homeLoginRow') && !doc6.querySelector('#homeAsk'));
  doc6.querySelector('#agSkip').click();
  await sleep(700);
  doc6.querySelector('#sampleUseReal').click(); await sleep(100);
  t('6: dải Demo "Đăng nhập để dùng thật" -> cổng mở lại', !!doc6.querySelector('#authGate'));
  W6.state.cfg.apple = { user: 'test-user-123', name: 'Test', email: '', at: Date.now() };
  W6.state.cfg.authAsked = true; W6.saveLocal();
  W6.aDisconnect();
  await sleep(100);
  const asBtn6 = doc6.querySelectorAll('.asheet [data-a]');
  t('6: ngắt Apple hiện sheet xác nhận', asBtn6.length === 1, String(asBtn6.length));
  if (asBtn6.length) { asBtn6[0].click(); await sleep(150); }
  t('6: ngắt Apple xong -> apple null + authAsked=false', W6.state.cfg.apple === null && W6.state.cfg.authAsked === false);
  // Ngắt Google: cần token để hiện nút Ngắt, stub fetch cho bước thu hồi
  const g6b = await loadDom35();
  const W6b = g6b.win, doc6b = g6b.doc;
  W6b.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  W6b.localStorage.setItem('troLyXeo.gtoken', TOK35());
  W6b.state.cfg.googleEverLinked = true; W6b.state.cfg.authAsked = true; W6b.saveLocal();
  W6b.fetch = async () => ({ ok: true });
  const ag6b = doc6b.querySelector('#authGate'); if (ag6b) ag6b.remove();
  W6b.openSettings(); await sleep(150);
  const gd6b = doc6b.querySelector('#gDisc');
  t('6: đã đăng nhập Google -> Cài đặt có nút Ngắt', !!gd6b);
  if (gd6b) { gd6b.click(); await sleep(100); }
  const asBtn6b = doc6b.querySelectorAll('.asheet [data-a]');
  if (asBtn6b.length) { asBtn6b[0].click(); await sleep(300); }
  t('6: ngắt Google xong -> authAsked=false + everLinked=false', W6b.state.cfg.authAsked === false && W6b.state.cfg.googleEverLinked === false);
  t('6: ngắt Google xong -> cổng có thể hiện lại', (function () { W6b.maybeShowAuthGate(); return !!doc6b.querySelector('#authGate'); })());
  await closeSheet35(doc6b);

  // [35g] Mục 7 — theme trong Cài đặt đổi ngay (đã có sẵn trong v2.3 — chỉ thêm test)
  const g7 = await loadDom35({ native: true });
  const W7 = g7.win, doc7 = g7.doc;
  const ag7 = doc7.querySelector('#authGate'); if (ag7) ag7.remove();
  W7.openSettings(); await sleep(150);
  t('7: không còn đổi màu app', !doc7.querySelector('[data-brand]'));
  const mm7 = W7.matchMedia; W7.matchMedia = (q) => ({ matches: /dark/.test(q), addEventListener(){}, addListener(){} }); W7.applyTheme();
  t('7: máy tối -> StatusBar được gọi theme tối', g7.sbCalls[g7.sbCalls.length - 1] === true, JSON.stringify(g7.sbCalls));
  W7.matchMedia = mm7;
  await closeSheet35(doc7);

  // [35h] Mục 8 — job đã huỷ còn cọc chưa hoàn: nhắc ở Tiền bạc, bấm mở form hoàn cọc
  const g8 = await loadDom35();
  const W8 = g8.win, doc8 = g8.doc;
  const jCx8 = mkJ35(W8, 'Khách Huỷ', 15000000, 'Đã giao', 2000000); jCx8.cancelled = true;
  W8.renderMoney();
  t('8: Tiền bạc nhắc cọc chưa hoàn của job đã huỷ', doc8.querySelector('#oweList').textContent.includes('cọc chưa hoàn') && doc8.querySelector('#oweList').textContent.includes('Khách Huỷ'));
  const rf8 = doc8.querySelector('#oweList [data-refund]');
  t('8: có nút hoàn cọc cho job đã huỷ', !!rf8);
  if (rf8) { rf8.click(); await sleep(150); }
  const txF8 = doc8.querySelector('#txForm');
  t('8: bấm nhắc hoàn -> mở form ghi chi', !!txF8);
  if (txF8) eq('8: form hoàn cọc điền sẵn hạng mục Hoàn cọc', txF8.elements.category ? txF8.elements.category.value : '', 'Hoàn cọc');
  // Job đã huỷ nhưng ĐÃ hoàn cọc thì không nhắc nữa
  const g8b = await loadDom35();
  const W8b = g8b.win, doc8b = g8b.doc;
  const jCx8b = mkJ35(W8b, 'Khách Đã Hoàn', 15000000, 'Đã giao', 2000000); jCx8b.cancelled = true;
  W8b.state.txs.unshift({ id: W8b.nid(), kind: 'chi', category: 'Hoàn cọc', jobId: jCx8b.id, amount: 2000000, date: W8b.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
  W8b.renderMoney();
  t('8: job đã hoàn cọc thì không nhắc nữa', !doc8b.querySelector('#oweList').textContent.includes('cọc chưa hoàn'));

  // [35i] Mục 9 — "đã nhận X / Y" không ngắt dòng
  const g9 = await loadDom35();
  const W9 = g9.win, doc9 = g9.doc;
  mkJ35(W9, 'Khách Nợ', 2500000, 'Đã chốt', 1000000);
  W9.renderMoney();
  const nw9 = doc9.querySelector('#oweList [style*="white-space:nowrap"]');
  t('9: cụm "đã nhận X / Y" bọc trong span nowrap', !!nw9 && nw9.textContent.includes('đã nhận') && nw9.textContent.includes('1.000.000') && nw9.textContent.includes('2.500.000'), nw9 ? nw9.textContent : 'không có span');

  // [35j] Mục 10 — tiêu đề/địa chỉ sự kiện Google xuống dòng đầy đủ
  const g10 = await loadDom35();
  const h10 = g10.win.gRow({ id: 'ev1', summary: 'Chụp Couple — Hoàng + Thảo My', time: '08:00 – 10:00', cal: 'Lịch chụp', location: 'Số 12 đường Lạch Tray, Hải Phòng', color: '#e11d48' });
  t('10: tiêu đề sự kiện dùng wrap2 (2 dòng), không clip 1 dòng', h10.includes('t1 wrap2') && !h10.includes('t1 clip'));
  t('10: tiêu đề hiện đủ tên khách', h10.includes('Hoàng + Thảo My') && !h10.includes('…'));
  t('10: địa chỉ hiện đủ, không cắt sau 2 dòng', h10.includes('Số 12 đường Lạch Tray, Hải Phòng') && !h10.includes('t2 wrap2'));

  // [35k] Mục 11 — lỗi tải lịch bằng tiếng Việt, không lộ message tiếng Anh
  const g11 = await loadDom35();
  const W11 = g11.win;
  W11.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  W11.localStorage.setItem('troLyXeo.gtoken', TOK35());
  W11.fetch = undefined;
  await W11.gFetch(true);
  eq('11: lỗi tải lịch dịch sang tiếng Việt', W11.gState.error, 'Không tải được lịch mới — đang xem bản đã lưu.');
  t('11: không lộ message gốc tiếng Anh', !/Failed|fetch|Error/i.test(W11.gState.error || ''));

  // [35l] Mục 12 — mẫu "Mời chọn ảnh" khi chưa có link
  const g12 = await loadDom35();
  const chon12 = g12.win.CHAT_TPLS.find(function (x) { return x.k === 'chon'; });
  t('12: mẫu chon tồn tại', !!chon12);
  if (chon12) {
    const noLink = chon12.f({ Ten: 'Mai', drive: '' });
    t('12: chưa có link -> không bảo khách "xem giúp mình"', !noLink.includes('Bạn xem giúp mình'));
    t('12: chưa có link -> không nhắc tới link khi chưa có link thật', !noLink.includes('link'), noLink);
    t('12: chưa có link -> hẹn gửi ảnh cho khách chọn ngay', noLink.includes('gửi ảnh cho bạn chọn ngay'));
    const withLink = chon12.f({ Ten: 'Mai', drive: 'https://drive/x' });
    t('12: có link -> vẫn gửi link như cũ', withLink.includes('https://drive/x') && withLink.includes('gửi số ảnh'));
  }

  // [35m] Mục 13 — nút "Khôi phục mẫu gốc" không ngắt dòng
  const g13 = await loadDom35();
  const W13 = g13.win, doc13 = g13.doc;
  const ag13 = doc13.querySelector('#authGate'); if (ag13) ag13.remove();
  W13.openSettings(); await sleep(150);
  const cards13 = [...doc13.querySelectorAll('.tpl-card')];
  t('13: Cài đặt có card mẫu để mở editor', cards13.length >= 1, String(cards13.length));
  if (cards13.length) { cards13[0].click(); await sleep(150); }
  const rb13 = doc13.querySelector('#tplResetBtn');
  t('13: nút Khôi phục mẫu gốc có white-space:nowrap', !!rb13 && (rb13.style.whiteSpace === 'nowrap' || (rb13.getAttribute('style') || '').includes('white-space:nowrap')));
  await closeSheet35(doc13); await closeSheet35(doc13);

  // [35n] Mục 14+15+16 — chữ trên cổng: bỏ hứa đồng bộ, nút Dùng thử rõ ràng, chú thích Google
  const g14 = await loadDom35();
  const doc14 = g14.doc;
  const note14 = doc14.querySelector('.ag-note');
  t('14: cổng không còn hứa "đồng bộ sau này"', !!note14 && !note14.textContent.includes('đồng bộ'));
  t('14: cổng vẫn giữ ý dữ liệu ở trên máy', !!note14 && note14.textContent.includes('trên máy bạn'));
  const skip14 = doc14.querySelector('#agSkip');
  t('15: nút Dùng thử là nút phụ gray rõ ràng, không còn chữ đỏ plain', !!skip14 && skip14.classList.contains('gray') && !skip14.classList.contains('plain'));
  t('v2.7b: cổng không còn chữ giải thích thừa', !doc14.body.textContent.includes('mở trình duyệt để đăng nhập Google'));

  // [35o] Mục 17 — thống nhất "Đăng nhập bằng Google" (nguồn + Cài đặt)
  t('17: nguồn không còn "Kết nối Google" (chỗ hành động)', !html.includes('Kết nối Google'));
  t('17: nguồn không còn "Kết nối lại"', !html.includes('Kết nối lại'));
  const g17 = await loadDom35();
  const W17 = g17.win, doc17 = g17.doc;
  const ag17 = doc17.querySelector('#authGate'); if (ag17) ag17.remove();
  W17.openSettings(); await sleep(150);
  const stTxt17 = doc17.querySelector('.sheet').textContent;
  t('17: Cài đặt ghi "Đăng nhập bằng Google"', stTxt17.includes('Đăng nhập bằng Google'));
  t('17: Cài đặt không còn "Kết nối Google" (chỗ hành động)', !stTxt17.includes('Kết nối Google'));
  await closeSheet35(doc17);

  // [35p] Mục 18 — 7 công tắc Google ẩn khi chưa kết nối, hiện khi đã kết nối
  const g18 = await loadDom35();
  const W18 = g18.win, doc18 = g18.doc;
  W18.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  const ag18 = doc18.querySelector('#authGate'); if (ag18) ag18.remove();
  W18.openSettings(); await sleep(150);
  t('18: chưa kết nối -> không hiện công tắc tính năng Google', doc18.querySelectorAll('[data-gfeat]').length === 0, String(doc18.querySelectorAll('[data-gfeat]').length));
  t('18: chưa kết nối -> vẫn có hàng "Đăng nhập Google để làm gì?"', !!doc18.querySelector('#gGuideRow'));
  await closeSheet35(doc18);
  const g18b = await loadDom35();
  const W18b = g18b.win, doc18b = g18b.doc;
  W18b.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  W18b.localStorage.setItem('troLyXeo.gtoken', TOK35());
  const ag18b = doc18b.querySelector('#authGate'); if (ag18b) ag18b.remove();
  W18b.openSettings(); await sleep(150);
  eq('18: đã kết nối -> đủ 7 công tắc tính năng Google', doc18b.querySelectorAll('[data-gfeat]').length, 7);
  await closeSheet35(doc18b);

  // [35q] Mục 19 — nút Cài đặt có chữ (nav chỉ dựng 1 nút cho màn hiện tại)
  const g19 = await loadDom35();
  const W19 = g19.win, doc19 = g19.doc;
  const navBtns19 = doc19.querySelectorAll('.nav-btn');
  t('19 (v2.8): nav Hôm nay có 2 nút: + Ghi và Cài đặt', navBtns19.length === 2 && navBtns19[0].classList.contains('add') && navBtns19[0].textContent.includes('Ghi'), String(navBtns19.length));
  const navSet19 = doc19.querySelector('.nav-btn:not(.add)');
  t('19 (v2.8b): nút Cài đặt tròn kiểu Claude, có aria-label', !!navSet19 && navSet19.getAttribute('aria-label') === 'Cài đặt' && !!navSet19.querySelector('svg'));
  W19.go('jobs');
  await sleep(100);
  const navJob19 = doc19.querySelector('.nav-btn');
  t('19 (v2.8): màn Buổi chụp có nút "+ Buổi chụp" có chữ', !!navJob19 && navJob19.classList.contains('add') && navJob19.textContent.includes('Buổi chụp'));

  // [35r] Mục 20 — nút lưu form job dính ở header (đã có sẵn — kiểm chứng)
  const g20 = await loadDom35();
  const W20 = g20.win, doc20 = g20.doc;
  const ag20 = doc20.querySelector('#authGate'); if (ag20) ag20.remove();
  W20.openJobForm(null);
  await sleep(150);
  const saveBtn20 = doc20.querySelector('.sheet-head .sh-r');
  t('20: form tạo job có nút lưu ở header', !!saveBtn20 && saveBtn20.textContent === 'Thêm', saveBtn20 ? saveBtn20.textContent : 'không có nút');
  t('20: css sheet-head flex:none (dính trên)', /\.sheet-head\{[^}]*flex:none/.test(html));
  t('20: css sheet-body flex:1 + overflow-y:auto (cuộn riêng phần thân)', /\.sheet-body\{[^}]*overflow-y:auto[^}]*flex:1/.test(html) || /\.sheet-body\{[^}]*flex:1[^}]*overflow-y:auto/.test(html));
  await closeSheet35(doc20);

  // [35s] Mục 21 — nhảy tới Xong còn thiếu tiền: một hộp duy nhất
  const closeAsheet35 = async (d) => { const els = d.querySelectorAll('.asheet .cancel'); if (els.length) els[els.length - 1].click(); await sleep(500); };
  const lastAsheetBtns35 = (d) => { const ss = d.querySelectorAll('.asheet'); const last = ss[ss.length - 1]; return last ? last.querySelectorAll('[data-a]') : []; };
  const g21 = await loadDom35();
  const W21 = g21.win, doc21 = g21.doc;
  const j21 = mkJ35(W21, 'Khách Xong Xa', 15000000, 'Khách hỏi', 0);
  W21.jumpToStage(j21.id, 5);
  const as21 = doc21.querySelector('.asheet');
  t('21: nhảy xa tới Xong còn thiếu tiền -> hiện 1 hộp xác nhận', !!as21);
  if (as21) {
    t('21: hộp gộp cả cảnh báo thiếu tiền', as21.textContent.includes('còn thiếu') && as21.textContent.includes('15.000.000'));
    t('21: hộp có nút "Thu nốt" và "Vẫn nhảy"', as21.textContent.includes('Thu nốt') && as21.textContent.includes('Vẫn nhảy'));
    const btns21 = lastAsheetBtns35(doc21);
    t('21: hộp chỉ có 2 lựa chọn', btns21.length === 2, String(btns21.length));
    if (btns21.length === 2) { btns21[1].click(); await sleep(500); }
  }
  eq('21: bấm "Vẫn nhảy" -> sang Xong ngay', j21.stage, 'Xong');
  t('21: không hiện thêm hộp cảnh báo thiếu tiền lần 2', !doc21.querySelector('.asheet'));
  // Nhánh "Thu nốt" mở form ghi tiền
  const j21b = mkJ35(W21, 'Khách Thu Nốt', 15000000, 'Khách hỏi', 0);
  W21.jumpToStage(j21b.id, 5);
  const btns21b = lastAsheetBtns35(doc21);
  if (btns21b.length === 2) { btns21b[0].click(); await sleep(200); }
  t('21: bấm "Thu nốt" -> mở form ghi tiền', !!doc21.querySelector('#txForm'));
  eq('21: bấm "Thu nốt" -> job vẫn ở Khách hỏi', j21b.stage, 'Khách hỏi');
  await closeSheet35(doc21);
  // Nhảy xa không phải tới Xong: hộp cũ, không nhắc thiếu tiền
  const j21c = mkJ35(W21, 'Khách Hậu Kỳ', 15000000, 'Khách hỏi', 0);
  W21.jumpToStage(j21c.id, 3);
  const as21c = doc21.querySelector('.asheet');
  t('21: nhảy xa tới Đang làm ảnh -> hộp xác nhận cũ (không nhắc thiếu tiền)', !!as21c && as21c.textContent.includes('Nhảy qua') && !as21c.textContent.includes('còn thiếu'));
  await closeAsheet35(doc21);

  // [35t] Mục 22 — petalRain tôn trọng petalsOn (đã tắt)
  const g22 = await loadDom35();
  const W22 = g22.win, doc22 = g22.doc;
  W22.petalRain(doc22.body, 5);
  t('22: petalRain không tạo cánh hoa nào khi petals đã tắt', doc22.querySelectorAll('.petal').length === 0);
  W22.renderAmbient();
  t('22: renderAmbient không tạo lớp hoa khi petals đã tắt', !doc22.querySelector('.ambient'));

  // [35u] Q1 — khoá tự thử Face ID trên web kẹp 9 giây; bấm tay không kẹp
  const gQ1 = await loadDom35();
  const WQ1 = gQ1.win, docQ1 = gQ1.doc;
  const credId = Buffer.from('test-credential-id-1').toString('base64url');
  WQ1.localStorage.setItem('troLyXeo.lock', JSON.stringify({ id: credId, salt: 'testsalt', pin: 'testpin' }));
  let capturedQ1 = null;
  const mockCreds = { get: function (opts) { capturedQ1 = opts; return new Promise(function (res, rej) { if (opts && opts.signal) opts.signal.addEventListener('abort', function () { rej(new Error('aborted')); }); }); } };
  try { WQ1.navigator.credentials = mockCreds; } catch (e) { Object.defineProperty(WQ1.navigator, 'credentials', { value: mockCreds, configurable: true }); }
  t('Q1: mock navigator.credentials đã gắn được', WQ1.navigator.credentials === mockCreds);
  WQ1.BIO_AUTO_TIMEOUT_MS = 60;
  WQ1.showLock(true);
  await sleep(700);
  t('Q1: lần thử tự động bị huỷ sau timeout -> hiện thông báo Face ID', (docQ1.querySelector('#lkMsg') || { textContent: '' }).textContent.includes('Face ID'));
  t('Q1: signal của lần thử tự động đã aborted', !!(capturedQ1 && capturedQ1.signal && capturedQ1.signal.aborted));
  docQ1.querySelector('#lkUsePin').click();
  t('Q1: sau timeout vẫn bấm được "Dùng mã PIN"', !docQ1.querySelector('#lkPinForm').classList.contains('hidden'));
  // Bấm tay: không kẹp giờ (signal undefined)
  docQ1.querySelector('#lockScreen').remove();
  let capturedQ1b = null;
  const mockCreds2 = { get: function (opts) { capturedQ1b = opts; return new Promise(function () {}); } };
  try { WQ1.navigator.credentials = mockCreds2; } catch (e) { Object.defineProperty(WQ1.navigator, 'credentials', { value: mockCreds2, configurable: true }); }
  WQ1.showLock(false);
  await sleep(100);
  docQ1.querySelector('#lkBio').click();
  await sleep(100);
  t('Q1: bấm tay -> get() gọi không kèm signal (không kẹp giờ)', !!capturedQ1b && capturedQ1b.signal === undefined, capturedQ1b ? String(capturedQ1b.signal) : 'không gọi get');

  // [35v] Q2 — sao lưu/khôi phục/xoá dữ liệu có trong sheet Cài đặt, dùng chung hàm cũ
  const gQ2 = await loadDom35();
  const WQ2 = gQ2.win, docQ2 = gQ2.doc;
  const agQ2 = docQ2.querySelector('#authGate'); if (agQ2) agQ2.remove();
  WQ2.openSettings(); await sleep(150);
  const setSheetQ2 = docQ2.querySelector('.sheet');
  t('Q2: Cài đặt có nút Tải bản sao lưu', !!(setSheetQ2 && setSheetQ2.querySelector('#setExportBtn')));
  t('Q2: Cài đặt có mục Mở bản sao lưu', !!(setSheetQ2 && setSheetQ2.querySelector('#setImportFile')));
  t('Q2: Cài đặt có nút Xoá dữ liệu', !!(setSheetQ2 && setSheetQ2.querySelector('#setClearBtn')));
  let dlCalled = false;
  WQ2.downloadBackup = function () { dlCalled = true; };
  const sebQ2 = docQ2.querySelector('#setExportBtn');
  if (sebQ2) sebQ2.click();
  t('Q2: bấm Tải bản sao lưu trong Cài đặt -> gọi cùng hàm downloadBackup', dlCalled);
  t('v2.7b: tab Thêm KHÔNG lặp nút sao lưu / cài đặt (chỉ ở Cài đặt)', !docQ2.querySelector('#exportBtn') && !docQ2.querySelector('#settingsRow'));
  t('Q2: hàm dùng chung tồn tại (downloadBackup/restoreBackupFile/clearDataFlow)', typeof WQ2.downloadBackup === 'function' && typeof WQ2.restoreBackupFile === 'function' && typeof WQ2.clearDataFlow === 'function');
  await closeSheet35(docQ2);

  // [35w] Mục 16 — gConnect trên web mở tab mới trong nhịp bấm, thất bại thì đóng tab
  const g16 = await loadDom35();
  const W16 = g16.win;
  W16.FOTOBRO_CONFIG = { googleClientId: 'test.apps.googleusercontent.com' };
  W16.state.cfg.gFeat = { cal: true, bank: false, leads: false, contacts: false, drive: false, calw: false, send: false };
  let opened16 = false, closed16 = false, nav16 = '';
  W16.open = function () { opened16 = true; return { set location(u) { nav16 = u; }, close: function () { closed16 = true; } }; };
  await W16.gConnect(false);
  t('16: bấm Google trên web -> mở tab mới ngay trong nhịp bấm', opened16);
  t('16: PKCE không hỗ trợ (jsdom) -> đóng tab đã mở, không để tab trắng', closed16);
  opened16 = false; closed16 = false;
  await W16.gConnect(true, true);
  t('16: đăng nhập im lặng (auto) -> không mở tab mới', !opened16 && !closed16);

  // [36] Việt 20/11 — (a) ví dụ hỏi đổi 'Ai chưa trả tiền?' -> 'Tuần này chụp gì?';
  // (b) gỡ mic hỏi bằng giọng nói; (c) Trợ lý trả lời 'mai' / 'ngày kia'
  console.log('\n[36] Ví dụ hỏi mới + gỡ mic + ngày tương đối (mai / ngày kia)');
  const g36 = await loadDom35();
  const W36 = g36.win, doc36 = g36.doc;
  const ag36 = doc36.querySelector('#authGate'); if (ag36) ag36.remove();
  t('36: trang tải không lỗi jsdom', g36.errors.length === 0, g36.errors[0] || '');
  // (a) hàng Hỏi FotoBro + chip + bong bóng chào: không còn 'Ai chưa trả tiền?'
  const homeAsk36 = doc36.querySelector('#homeAsk .t2');
  t('v2.7b: hàng Hỏi FotoBro không còn dòng ví dụ bên dưới', !homeAsk36);
  W36.go('ask'); await sleep(100);
  const chips36 = [...doc36.querySelectorAll('#askChips .pill')].map(c => c.textContent);
  t('36a: chip Trợ lý không còn "Ai chưa trả tiền?"', chips36.length > 0 && !chips36.some(c => c.includes('Ai chưa trả tiền?')), chips36.join(' | '));
  t('36a: chip có "Tuần này chụp gì?" và "Ngày kia chụp gì?"', chips36.some(c => c.includes('Tuần này chụp gì?')) && chips36.some(c => c.includes('Ngày kia chụp gì?')), chips36.join(' | '));
  const chat36 = doc36.querySelector('#chatBox');
  t('36a: bong bóng chào không còn "Ai chưa trả tiền?"', !!chat36 && !chat36.textContent.includes('Ai chưa trả tiền?'), chat36 ? chat36.textContent.slice(0, 120) : 'không có #chatBox');
  t('36a: bong bóng chào gợi ý "Tuần này chụp gì?"', !!chat36 && chat36.textContent.includes('Tuần này chụp gì?'));
  t('36a: câu trả lời dự phòng không còn "Ai chưa trả tiền?"', !W36.answer('xyzqq khong hieu').includes('Ai chưa trả tiền?'));
  t('36a: câu trả lời dự phòng gợi ý "Tuần này chụp gì?"', W36.answer('xyzqq khong hieu').includes('Tuần này chụp gì?'));
  // dữ liệu kiểm soát: job tuần trả đủ (không phải nợ), chỉ Khach No còn thiếu 3tr
  W36.state.jobs = []; W36.state.txs = [];
  const mk36 = (client, shootDate, price, paid) => {
    const j = { id: W36.nid(), client, type: 'Portrait', medium: 'Digital', stage: 'Khách hỏi',
      stageSince: W36.dstr(0), shootDate, shootTime: '08:00', location: 'Studio', deadline: '', price,
      phone: '', email: 'khach@vd.vn', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false };
    W36.state.jobs.unshift(j);
    if (paid) W36.state.txs.unshift({ id: W36.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: paid, date: W36.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    return j;
  };
  mk36('Lan Anh', W36.dstr(2), 2500000, 2500000);   // trong tuần + ngày kia
  mk36('Mai Anh', W36.dstr(5), 2500000, 2500000);   // trong tuần, tên chứa 'Mai'
  mk36('Khach Xa', W36.dstr(10), 2500000, 2500000); // ngoài tuần
  mk36('Khach No', W36.dstr(20), 4000000, 1000000); // nợ 3tr
  mk36('Khach Du', W36.dstr(20), 2500000, 2500000); // trả đủ
  // (b) 'Tuần này chụp gì?' liệt kê đúng job trong tuần, không lọt job ngoài tuần
  const wk36 = W36.answer('Tuần này chụp gì?');
  t('36b: "Tuần này chụp gì?" liệt kê job trong tuần', wk36.includes('Lan Anh') && wk36.includes('Mai Anh'), wk36);
  t('36b: "Tuần này chụp gì?" không liệt kê job ngoài tuần', !wk36.includes('Khach Xa'));
  W36.state.jobs = W36.state.jobs.filter(j => j.client !== 'Lan Anh' && j.client !== 'Mai Anh');
  t('36b: "Tuần này chụp gì?" không có job thì báo không có', W36.answer('Tuần này chụp gì?').includes('chưa có buổi chụp nào'));
  mk36('Lan Anh', W36.dstr(2), 2500000, 2500000);
  mk36('Mai Anh', W36.dstr(5), 2500000, 2500000);
  // (c) 'Mai Anh chụp khi nào?' vẫn tra job của Mai Anh trước (không nhầm nhánh 'mai')
  const maiAnh36 = W36.answer('Mai Anh chụp khi nào?');
  t('36c: "Mai Anh chụp khi nào?" tra job Mai Anh, không nhầm nhánh mai', maiAnh36.includes('Mai Anh') && !maiAnh36.includes('không có buổi chụp nào'), maiAnh36);
  // (d) 'Ngày kia chụp gì?' / 'Mai chụp gì?'
  const nk36 = W36.answer('Ngày kia chụp gì?');
  t('36d: "Ngày kia chụp gì?" liệt kê job ngày kia', nk36.includes('Lan Anh'), nk36);
  t('36d: "Ngày kia chụp gì?" không liệt kê job ngày khác', !nk36.includes('Mai Anh') && !nk36.includes('Khach Xa'));
  W36.state.jobs = W36.state.jobs.filter(j => j.client !== 'Lan Anh' && j.client !== 'Mai Anh');
  const nkEmpty36 = W36.answer('Ngày kia chụp gì?');
  t('36d: "Ngày kia chụp gì?" không có job thì báo không có ngày kia', nkEmpty36.includes('Ngày kia') && nkEmpty36.includes('không có buổi chụp nào'), nkEmpty36);
  const maiEmpty36 = W36.answer('Mai chụp gì?');
  t('36d: "Mai chụp gì?" không có job mai thì báo không có', maiEmpty36.includes('Mai') && maiEmpty36.includes('không có buổi chụp nào'), maiEmpty36);
  mk36('Lan Anh', W36.dstr(1), 2500000, 2500000);
  t('36d: "Mai chụp gì?" có job mai thì liệt kê đúng', W36.answer('Mai chụp gì?').includes('Lan Anh'));
  // (e) gõ tay 'Ai chưa trả tiền?' vẫn ra danh sách nợ đúng (tile Hôm nay dùng câu này)
  const owe36 = W36.answer('Ai chưa trả tiền?');
  t('36e: gõ tay "Ai chưa trả tiền?" vẫn liệt kê khách nợ', owe36.includes('Khach No') && owe36.includes('3.000.000'), owe36);
  t('36e: gõ tay "Ai chưa trả tiền?" không liệt kê khách trả đủ', !owe36.includes('Khach Du') && !owe36.includes('Lan Anh'));
  // (f) mic đã gỡ, ô gõ chữ vẫn hoạt động
  t('36f: màn Trợ lý không còn nút mic hỏi', !doc36.querySelector('#micBtn'));
  t('36f: màn Trợ lý không còn thẻ xác nhận giọng nói', !doc36.querySelector('#voiceHeard'));
  t('36f: source không còn "Giọng nói sẽ có ở bản sau"', !html.includes('Giọng nói sẽ có ở bản sau'));
  t('36f: source không còn nút mic / handler giọng nói', !html.includes('micBtn') && !html.includes('startListening') && !html.includes('runVoiceCommand'));
  const askIn36 = doc36.querySelector('#askInput');
  const askForm36 = doc36.querySelector('#askForm');
  askIn36.value = 'Hôm nay chụp gì?';
  askForm36.dispatchEvent(new W36.Event('submit', { bubbles: true, cancelable: true }));
  await sleep(500);
  const bots36 = [...doc36.querySelectorAll('#chatBox .bub.bot')].map(b => b.textContent);
  t('36f: gõ chữ + gửi vẫn ra câu trả lời của Trợ lý', bots36.length > 0 && bots36[bots36.length - 1].includes('Hôm nay'), bots36[bots36.length - 1] || 'không có bong bóng bot');
  t('36f: lệnh gõ tay (runCommand) vẫn chạy', typeof W36.runCommand === 'function' && !!W36.runCommand('thêm job portrait cho Test36'));
  }


  console.log('\n[37] v2.4–v2.5 — demo, chuẩn bị đồ, Khách hỏi, Excel, hợp đồng, Cài đặt nhóm, thiết lập lần đầu');
  {
  const g = await loadDom();
  const W = g.win, d = g.doc;
  t('37: cổng có nút "Xem demo trước"', !!d.querySelector('#agSkip') && d.querySelector('#agSkip').textContent.includes('demo'));
  d.querySelector('#agSkip').click(); await sleep(500);
  t('37: demo nạp dữ liệu mẫu', W.state.sample === true && W.state.jobs.length >= 5);
  t('37: thiết lập lần đầu KHÔNG mở khi đang xem demo', !W.setupSheet);
  const jj = W.state.jobs.find(x => x.stage === 'Đã chốt');
  W.openJob(jj.id); await sleep(300);
  const sb = [...d.querySelectorAll('.sheet .sheet-body')].pop();
  t('37: chi tiết job có Chuẩn bị đồ', !!sb.querySelector('#prepList'));
  const inp = sb.querySelector('#prepAdd input'); inp.value = 'Quạt test 37'; sb.querySelector('#prepAdd button').click(); await sleep(100);
  t('37: thêm món đọc đúng ô nhập (không trùng elements.item)', (jj.prep || []).includes('Quạt test 37'));
  t('37: chi tiết job có nút Hợp đồng', !![...d.querySelectorAll('.sheet [data-act="contract"]')].length);
  const tv = W.state.jobs.find(x => x.stage === 'Khách hỏi');
  W.setStage(tv, 'Đã chốt');
  eq('37: Khách hỏi thiếu thông tin -> không cho sang bước', tv.stage, 'Khách hỏi');
  eq('37: số tiền bằng chữ 2.500.000', W.vnWords(2500000), 'Hai triệu năm trăm nghìn đồng');
  eq('37: số tiền bằng chữ 1.005.000', W.vnWords(1005000), 'Một triệu không trăm lẻ năm nghìn đồng');
  eq('37: số tiền bằng chữ 15.000.000', W.vnWords(15000000), 'Mười lăm triệu đồng');
  const cb = W.contractBlocks(jj).map(b => b.s).join('\n');
  t('37: hợp đồng có tên khách + điều khoản', cb.includes(jj.client) && cb.includes('Điều 4') && cb.includes('Đặt cọc'));
  const xl = W.buildXlsx();
  t('37: file Excel là xlsx', xl.type.includes('spreadsheetml') && xl.size > 2000);
  W.state.cfg.fb = 'facebook.com/nang.studio'; W.state.cfg.threads = 'nang.studio';
  const soc = W.mySocials().map(x => x.url).join(' ');
  t('37: link mạng xã hội chuẩn hoá', soc.includes('https://facebook.com/nang.studio') && soc.includes('threads.net/@nang.studio'), soc);
  W.openSettings(); await sleep(150);
  const st = [...d.querySelectorAll('.sheet .sheet-body')].pop();
  t('37: Cài đặt mở ra là danh sách nhóm', !!st.querySelector('[data-sg-open="profile"]') && st.querySelector('.sg[data-sg="price"]').classList.contains('hidden'));
  st.querySelector('[data-sg-open="price"]').click(); await sleep(50);
  t('37: bấm nhóm Giá & cọc thì hiện nhóm đó', !st.querySelector('.sg[data-sg="price"]').classList.contains('hidden') && st.querySelector('.sg-menu').classList.contains('hidden'));
  t('37: mẫu tin nhắn gọn 1 dòng', st.querySelectorAll('.tpl-mini').length === 5);
  { const ls = [...d.querySelectorAll('.sheet .sh-r, .sheet .sh-l')].pop(); if (ls) ls.click(); await sleep(450); }
  }
  {
  const g2 = await loadDom();
  const W2 = g2.win, d2 = g2.doc;
  const ag = d2.querySelector('#authGate'); if (ag) ag.remove();
  W2.maybeSetup(); await sleep(100);
  t('37: người mới (chưa tên) -> mở Thiết lập nhanh', !!W2.setupSheet);
  const sb2 = [...d2.querySelectorAll('.sheet .sheet-body')].pop();
  const nm = sb2.querySelector('[data-cfg="studio"]'); nm.value = 'Nắng Studio'; nm.dispatchEvent(new W2.Event('input'));
  eq('37: thiết lập lưu tên studio', W2.state.cfg.studio, 'Nắng Studio');
  for (let i = 0; i < 5; i++){ const nx = [...d2.querySelectorAll('.sheet #suNext')].pop(); if (nx) nx.click(); await sleep(60); }
  await sleep(450);
  t('37: đi hết các bước -> đánh dấu đã thiết lập', W2.state.cfg.setupDone === true && !W2.setupSheet);
  }

  console.log('\n[38] v2.6 — tự sang Đã chốt, xác nhận tiền 2 lần, hợp đồng, nhắc thanh toán, thẻ studio, tổng kết tối');
  {
  const { win: W, doc: d } = await loadDom();
  const ag = d.querySelector('#authGate'); if (ag) ag.remove();
  const mk = (o) => { const j = Object.assign({ id: W.nid(), client: 'K', type: 'Portrait', medium: 'Digital', stage: 'Đã chốt', stageSince: W.dstr(0), shootDate: W.dstr(2), shootTime: '09:00', location: 'Hồ Gươm', deadline: '', price: 3000000, phone: '0901', email: '', fbLink: '', msLink: '', driveLink: '', note: '', cancelled: false }, o); W.state.jobs.unshift(j); return j; };
  const near = mk({ client: 'Gần Ngày' }), far = mk({ client: 'Xa Ngày', shootDate: W.dstr(20) }), noDep = mk({ client: 'Chưa Cọc' });
  [near, far].forEach(j => W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: j.id, amount: 1000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' }));
  /* v2.7: luồng 6 bước tự chuyển theo việc thật */
  near.stage = 'Khách hỏi'; noDep.stage = 'Khách hỏi';
  const shot = mk({ client: 'Chụp Rồi', stage: 'Đã chốt', shootDate: W.dstr(-1) });
  W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: shot.id, amount: 1000000, date: W.dstr(-5), method: 'Chuyển khoản', note: '', src: '' });
  const paid = mk({ client: 'Trả Đủ', stage: 'Đã giao', shootDate: W.dstr(-20), price: 2000000 });
  W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: paid.id, amount: 2000000, date: W.dstr(-20), method: 'Chuyển khoản', note: '', src: '' });
  W.autoFlow();
  eq('38: Khách hỏi + đã cọc -> tự sang Đã chốt', near.stage, 'Đã chốt');
  eq('38: Khách hỏi chưa cọc -> đứng yên (Việt: cọc rồi mới nhảy)', noDep.stage, 'Khách hỏi');
  eq('38: Đã chốt qua ngày chụp -> KHÔNG tự nhảy, chờ xác nhận', shot.stage, 'Đã chốt');
  t('38: Hôm nay hỏi "Đã chụp ... chưa?"', W.todayItems().some(x => x.title === 'Đã chụp Chụp Rồi chưa?'));
  W.openReschedule(shot); await sleep(200);
  { const rf = [...d.querySelectorAll('#rsForm')].pop(); rf.elements.d.value = W.dstr(4); rf.elements.t.value = '15:00'; rf.elements.why.value = '0'; [...d.querySelectorAll('.sheet .sh-r')].pop().click(); await sleep(600); }
  eq('38: dời lịch đổi ngày chụp', shot.shootDate, W.dstr(4));
  t('38: dời lịch có tin báo khách', [...d.querySelectorAll('.asheet')].some(x => x.textContent.includes('dời sang') && x.textContent.includes('thời tiết')));
  d.querySelectorAll('.asheet .cancel').forEach(b => b.click()); await sleep(300);
  W.setStage(shot, 'Đã chụp');
  eq('38: Đã giao thu đủ -> tự sang Xong', paid.stage, 'Xong');
  eq('38: Đã chốt còn 20 ngày -> giữ nguyên', far.stage, 'Đã chốt');
  paid.stage = 'Đã giao'; W.setStage(paid, 'Đang làm ảnh'); W.autoFlow();
  eq('38: lùi tay thì không tự nhảy lại', paid.stage, 'Đang làm ảnh');
  shot.stage = 'Đang làm ảnh';
  W.markProofSent(shot); eq('38: gửi link chọn ảnh ghi ngày', shot.proofSentAt, W.dstr(0));
  t('38: chưa chọn xong thì chưa có hạn giao', !shot.deadline);
  W.markSelected(shot);
  const dl = new W.Date(); dl.setDate(dl.getDate() + (+W.state.cfg.deliverDays || 7));
  eq('38: khách chọn xong -> hạn giao = hôm nay + số ngày giao', shot.deadline, W.dstr(+W.state.cfg.deliverDays || 7));
  { const dv = d.createElement('div'); dv.innerHTML = W.jobDetailHTML(shot); const main = [...dv.children].filter(x => !x.matches('details')).map(x => x.outerHTML).join('');
    t('38: Đang làm ảnh — phần chính KHÔNG có Tiền và nút Facebook', !main.includes('>Tiền<') && !main.includes('data-act="fb"'));
    t('38: Đang làm ảnh — phần chính có Ảnh + nhắn khách', main.includes('driveInp') && main.includes('jd-chips'));
    t('38: có cọc -> không có nút Xoá', !W.jobDetailHTML(near).includes('data-act="del"'));
  { const n0 = W.state.jobs.length; W.jobAction('del', near.id); await sleep(50); eq('38: có cọc -> lệnh xoá bị chặn', W.state.jobs.length, n0); }
  t('38: Đã chụp -> không có nút Huỷ / Xoá', !W.jobDetailHTML(shot).includes('data-act="del"') && !W.jobDetailHTML(shot).includes('data-act="cancel"'));
  { const fresh = mk({ client: 'Tạo Nhầm', stage: 'Khách hỏi', shootDate: W.dstr(30) }); t('38: Khách hỏi chưa có tiền -> xoá được', W.jobDetailHTML(fresh).includes('data-act="del"')); }
  { const lk = mk({ client: 'Sát Ngày', stage: 'Đã chốt', shootDate: W.dstr(2) }); const fr = mk({ client: 'Còn Xa', stage: 'Đã chốt', shootDate: W.dstr(10) });
    W.state.txs.unshift({ id: W.nid(), kind: 'thu', category: 'Cọc', jobId: lk.id, amount: 1000000, date: W.dstr(0), method: 'Chuyển khoản', note: '', src: '' });
    t('38: sát ngày vẫn có nút Huỷ + Dời lịch', W.jobDetailHTML(lk).includes('data-act="cancel"') && W.jobDetailHTML(lk).includes('data-act="resched"'));
    W.jobAction('cancel', lk.id); await sleep(100);
    { const as = [...d.querySelectorAll('.asheet')].pop(); const first = as && as.querySelector('[data-a="0"]'); t('38: sát ngày -> lựa chọn đầu là KHÔNG hoàn cọc', !!first && first.textContent.includes('giữ cọc') && as.textContent.includes('KHÔNG được hoàn cọc')); }
    d.querySelectorAll('.asheet .cancel').forEach(x => x.click()); await sleep(300);
    W.jobAction('cancel', fr.id); await sleep(100);
    t('38: còn xa ngày -> hỏi huỷ bình thường', [...d.querySelectorAll('.asheet')].some(x => x.textContent.includes('Còn Xa')));
    d.querySelectorAll('.asheet .cancel').forEach(x => x.click()); await sleep(300); }
  t('v2.7b: tab thứ 4 tên Phòng ban', d.querySelector('.tabbar button[data-view="depts"]').textContent.trim() === 'Phòng ban');
  W.renderDepts(); t('v2.7b: tab Phòng ban có ô Hỏi FotoBro + 6 thẻ phòng', !!d.querySelector('#askBoxForm') && d.querySelectorAll('.dtile').length === 6);
  t('38: không còn nút Lùi về', !W.jobDetailHTML(shot).includes('data-act="prev"'));
  { const st0 = shot.stage; W.jumpToStage(shot.id, 1); eq('38: chạm số bước lùi -> hỏi lại, chưa lùi ngay', shot.stage, st0);
    const lb = [...d.querySelectorAll('.asheet [data-a="0"]')].pop(); t('38: hộp hỏi lùi có nút xác nhận', !!lb && lb.textContent.includes('Lùi về')); if (lb) lb.click(); await sleep(100); eq('38: xác nhận thì lùi', shot.stage, 'Đã chốt'); }
  t('38: Tiền vẫn còn trong Xem thêm', !!dv.querySelector('details.jd-more') && dv.querySelector('details.jd-more').innerHTML.includes('>Tiền<')); }
  await sleep(700);
  const msg = W.chatMsg('tien', near);
  t('38: nhắc thanh toán có ngày giờ địa điểm', msg.includes('09:00') && msg.includes('Hồ Gươm'), msg);
  const both = mk({ client: 'Hai Máy', medium: 'Cả hai', stage: 'Khách hỏi', shootDate: W.dstr(30) });
  const ct = W.contractBlocks(both).map(b => b.s).join('\n');
  t('38: hợp đồng ghi rõ "ảnh số + ảnh film", không còn "Cả hai"', ct.includes('ảnh số + ảnh film') && !ct.includes('Cả hai'));
  d.querySelectorAll('.asheet .cancel').forEach(b => b.click()); await sleep(300);
  const before = W.state.txs.length;
  W.openTxForm({ kind: 'thu' }); await sleep(200);
  const f = [...d.querySelectorAll('#txForm')].pop(); f.elements.amount.value = '500.000';
  [...d.querySelectorAll('.sheet .sh-r')].pop().click(); await sleep(150);
  eq('38: bấm Lưu chưa ghi ngay (chờ xác nhận)', W.state.txs.length, before);
  const cf = [...d.querySelectorAll('.asheet [data-a="0"]')].pop();
  t('38: hộp xác nhận ghi rõ số tiền', !!cf && cf.textContent.includes('500.000'));
  if (cf) cf.click(); await sleep(200);
  eq('38: xác nhận xong mới ghi', W.state.txs.length, before + 1);
  W.state.cfg.studio = 'Nắng Studio'; W.state.cfg.name = 'Việt'; W.state.cfg.instagram = 'nang.studio'; W.renderAll(); W.go('home'); await sleep(100);
  t('38: thẻ studio hiện trên Hôm nay', !!d.querySelector('.idc') && d.querySelector('.idc-name').textContent === 'Nắng Studio');
  eq('38: chữ lồng N', W.monogram(), 'N');
  t('38: danh thiếp có Instagram', W.cardText().includes('instagram.com/nang.studio'));
  t('38: tổng kết tối có lịch mai', W.dailyBody(0).length > 0);
  W.openJob(near.id); await sleep(250);
  const sb = [...d.querySelectorAll('.sheet .sheet-body')].pop();
  t('38: chi tiết job gọn — có hàng nút nhắn khách', !!sb.querySelector('.jd-chips'));
  t('38: chi tiết job không còn mục "Liên lạc" dài', ![...sb.querySelectorAll('.sec-s')].some(x => x.textContent === 'Liên lạc'));
  }

  console.log('\n[39] v2.6 — Đăng nhập Facebook (giả lập plugin)');
  {
  const { win: W0, doc: d0 } = await loadDom();
  t('39: chưa gắn plugin -> cổng KHÔNG có nút Facebook', !d0.querySelector('#agFb'));
  const { win: W, doc: d } = await loadDom(w => {
    w.__fotobroFbAvailable = () => true;
    w.__fotobroFbLogin = async () => ({ id: '123', name: 'Việt Nắng', email: 'viet@fb.vn', picture: 'https://platform-lookaside.fbsbx.com/x.jpg' });
    w.__fotobroFbLogout = async () => {};
  });
  t('39: có plugin -> cổng có nút Facebook', !!d.querySelector('#agFb'));
  await W.fbConnect(); await sleep(700);
  t('39: đăng nhập FB lưu tài khoản', W.fbLinked() && W.state.cfg.fbAcc.id === '123');
  eq('39: FB điền tên', W.state.cfg.name, 'Việt Nắng');
  eq('39: FB điền ảnh đại diện', W.state.cfg.avatar, 'https://platform-lookaside.fbsbx.com/x.jpg');
  t('39: đăng nhập FB xong thì cổng đóng', !d.querySelector('#authGate') || !d.querySelector('#authGate').classList.contains('on'));
  }

  console.log('\n[40] Liquid Glass C — Kính Nhuộm (Việt chọn 21/11/2026)');
  {
    t('40: token kính C sáng --glass .50', html.includes('--glass:rgba(255,255,255,.50)'));
    t('40: token kính C tối --glass .09', html.includes('--glass:rgba(255,255,255,.09)'));
    t('40: 5 tint sáng đủ', ['--tint-sage:rgba(186,219,178,.55)','--tint-peach:rgba(255,203,168,.55)','--tint-sun:rgba(255,231,150,.55)','--tint-sky:rgba(178,216,243,.50)','--tint-lilac:rgba(216,196,240,.52)'].every(s => html.includes(s)));
    t('40: 5 tint tối đủ', ['--tint-sage:rgba(52,94,52,.55)','--tint-peach:rgba(146,84,40,.55)','--tint-sun:rgba(146,116,30,.55)','--tint-sky:rgba(52,96,138,.55)','--tint-lilac:rgba(96,66,140,.55)'].every(s => html.includes(s)));
    t('40: nền sau kính có gradient kem + 4 vệt màu', html.includes('linear-gradient(165deg, #FBF6EF 0%, #FAF0E6 55%, #F7EFE3 100%)') && html.includes('linear-gradient(165deg, #1D1712 0%, #171310 55%, #1C1418 100%)'));
    t('40: ô Thu = sage, ô Còn thiếu = peach', html.includes('.tile[data-tile="thu"]{ background:var(--tint-sage) !important; }') && html.includes('.tile[data-tile="owe"]{ background:var(--tint-peach) !important; }'));
    t('40: danh thiếp = sky, danh sách job = sky', html.includes('.idc{ background:var(--tint-sky); }') && html.includes('#todayList, html[data-glass="1"] #upcomingList, html[data-glass="1"] #jobList .list{ background:var(--tint-sky) !important; }'));
    t('40: Tài chính sage/peach/sun, biểu đồ sky, còn thiếu/lời/sổ = lilac', html.includes('.msum-c:nth-child(1){ background:var(--tint-sage) !important; }') && html.includes('.msum-c:nth-child(3){ background:var(--tint-sun) !important; }') && html.includes('#moneyChart{ background:var(--tint-sky) !important; }') && html.includes('#oweList, html[data-glass="1"] #jobProfit, html[data-glass="1"] #txList .list{ background:var(--tint-lilac) !important; }'));
    t('40: Phòng ban giữ màu riêng dạng kính (color-mix 55%)', html.includes('color-mix(in srgb, var(--kc, var(--k-cream)) 55%, transparent)'));
    t('40: tabbar blur 22px saturate 170% + viền kính', /html\[data-glass="1"\] \.tabbar\{[^}]*blur\(22px\) saturate\(170%\)/.test(html) && html.includes('border:1px solid var(--glass-border);'));
    t('40: fallback nền đặc khi không hỗ trợ blur', html.includes('@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px)))'));
    t('40: bản tối chữ trắng kem trên kính nhuộm', html.includes('color:#FFF9F2 !important;'));
    t('40: không blur từng dòng .row trong danh sách dài', !/\.row\{[^}]*backdrop-filter/.test(html));
    t('40: APP_VERSION vẫn 2.3 (không nâng số)', html.includes("var APP_VERSION = '2.3'"));
  }

  console.log('\n===== KẾT QUẢ: ' + pass + ' đạt / ' + (pass + fail) + ' =====');
  if (fail) { console.log('FAILURES:', fails.join(' | ')); process.exit(1); }
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
