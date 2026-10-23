'use strict';
const $=id=>document.getElementById(id);let state=null,latestTime=0;const interval=Math.max(5000,Number(window.CLASS_REFRESH_MS)||15000);const API=window.CLASS_API_URL;
document.body.setAttribute('data-current-page','home');
const viTime=v=>{if(!v)return 'Chưa cập nhật';const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric',hour12:false}).format(d):String(v)};
const multiline=v=>html(v).replace(/\r\n?|\n/g,'\n').replace(/\n/g,'<br>');
const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bool=v=>v===true||String(v).toLowerCase()==='true';
function nav(page){document.querySelectorAll('.page').forEach(n=>n.classList.toggle('current',n.id===page));document.body.setAttribute('data-current-page',page);$('drawer').classList.remove('open');$('shade').hidden=true;$('menuBtn').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'smooth'})}
$('menuBtn').onclick=()=>{$('drawer').classList.add('open');$('shade').hidden=false;$('menuBtn').setAttribute('aria-expanded','true')};$('closeBtn').onclick=()=>$('shade').click();$('shade').onclick=()=>nav(document.querySelector('.page.current').id);document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>nav(b.dataset.page));
function jsonp(action,params={}){return new Promise((resolve,reject)=>{if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(API)){reject(Error('Chưa cấu hình URL Apps Script mới trong config.js'));return}const callback='cb_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');const timeout=setTimeout(()=>{clean();reject(Error('Hết thời gian kết nối máy chủ'))},15000);function clean(){clearTimeout(timeout);delete window[callback];s.remove()}window[callback]=d=>{clean();resolve(d)};s.onerror=()=>{clean();reject(Error('Không thể tải dữ liệu máy chủ'))};const url=new URL(API);url.searchParams.set('action',action);url.searchParams.set('callback',callback);url.searchParams.set('cacheBust',Date.now());Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));s.src=url;document.body.append(s)})}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function write(action,payload){const op=(crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):'op'+Date.now()+Math.random().toString(36).slice(2).padEnd(16,'0'));const body={...payload,action,op};if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(API))throw Error('Chưa thiết lập Apps Script mới');try{await fetch(API,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),redirect:'follow'})}catch(e){throw Error('Không gửi được yêu cầu đến máy chủ. Vui lòng kiểm tra kết nối trước khi thử lại.')}for(let attempt=0;attempt<12;attempt++){await sleep(1100);try{const r=await jsonp('receipt',{op});if(r.done){if(!r.success)throw Error(r.message||'Giao dịch thất bại');return r}}catch(e){if(e.message!=='Hết thời gian kết nối máy chủ'&&!e.message.includes('Không thể tải'))throw e}}throw Error('Chưa xác nhận được giao dịch. Vui lòng kiểm tra danh sách trước khi gửi lại để tránh trùng lặp.')}
function info(container,items){$(container).replaceChildren(...items.map(([label,val])=>{const box=document.createElement('article');box.className='infoCard';const small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=String(val||'Chưa cập nhật');box.append(small,strong);return box}))}
function parseExtras(raw){try{const x=JSON.parse(raw||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'&&v.trim()).slice(0,30):[]}catch(e){return []}}
function personnel(prefix,head){const c=state.config||{},items=[];
 if(!bool(c[prefix+'_anNhiemKy']))items.push(['Nhiệm kỳ',c[prefix+'_nhiemKy']]);
 if(!bool(c[prefix+'_anNguoiDungDau']))items.push([head==='doan'?'Bí thư':'Chi hội trưởng',c[prefix+(head==='doan'?'_biThu':'_chiHoiTruong')]]);
 if(!bool(c[prefix+'_anCapPho'])){const key=prefix+(head==='doan'?'_phoBiThu':'_chiHoiPho');items.push([head==='doan'?'Phó Bí thư':'Chi hội phó',c[key]]);parseExtras(c[prefix+'_phoBoSung']).forEach(x=>items.push([head==='doan'?'Phó Bí thư':'Chi hội phó',x]));}
 if(!bool(c[prefix+'_anUyVien'])){let vals=[1,2,3].filter(i=>!bool(c[prefix+'_anUyVien'+i])).map(i=>c[prefix+'_uyVien'+i]).filter(x=>String(x||'').trim());if(!vals.length&&c[prefix+'_uyVien']&&c[prefix+'_uyVien']!=='Chưa cập nhật')vals=[c[prefix+'_uyVien']];vals=vals.concat(parseExtras(c[prefix+'_uyVienBoSung']));vals.forEach(x=>items.push(['Ủy viên Ban Chấp hành',x]));}
 return items.filter(([,v])=>v!==undefined&&v!==null&&String(v).trim()!==''&&String(v)!=='Chưa cập nhật');}
function render(){if(!state)return;const c=state.config||{};
 $('slogan').textContent=c.slogan||'';$('banner').style.backgroundImage=c.bannerUrl?`linear-gradient(90deg,#15365c22,#15365c44), url(${JSON.stringify(String(c.bannerUrl))})`:'';$('banner').classList.toggle('hasBanner',!!c.bannerUrl);
 info('classCards',[
  ['Cố vấn học tập',c.coVan,'lop_anCoVan'],
  ['Lớp trưởng',c.lopTruong,'lop_anLopTruong'],
  ['Lớp phó học tập',c.lopPhoHocTap,'lop_anLopPhoHocTap'],
  ['Lớp phó phong trào',c.lopPhoPhongTrao,'lop_anLopPhoPhongTrao'],
  ['Lớp phó đời sống',c.lopPhoDoiSong,'lop_anLopPhoDoiSong']
 ].filter(([,value,flag])=>!bool(c[flag])&&value!=null&&String(value).trim()&&String(value)!=='Chưa cập nhật'));
 $('classDescription').textContent=c.moTaLop||'';
 document.getElementById('classIntroPanel').hidden=!bool(c.lop_hienMoTa===undefined?true:c.lop_hienMoTa)||!String(c.moTaLop||'').trim();
 info('doanCards',personnel('cd','doan'));info('hoiCards',personnel('ch','hoi'));
 $('doanDescription').textContent=bool(c.cd_hienMoTa===undefined?true:c.cd_hienMoTa)?(c.cd_moTa||''):'';
 $('hoiDescription').textContent=bool(c.ch_hienMoTa===undefined?true:c.ch_hienMoTa)?(c.ch_moTa||''):'';
 document.getElementById('doanIntroPanel').hidden=!bool(c.cd_hienMoTa===undefined?true:c.cd_hienMoTa)||!String(c.cd_moTa||'').trim();
 document.getElementById('hoiIntroPanel').hidden=!bool(c.ch_hienMoTa===undefined?true:c.ch_hienMoTa)||!String(c.ch_moTa||'').trim();
 renderCongress('ChiDoan','doanCongress');renderCongress('ChiHoi','hoiCongress');renderActivities();$('syncTime').textContent='Cập nhật: '+new Date().toLocaleTimeString('vi-VN');}

function countdown(t){const ms=Date.parse(t)-Date.now();if(!Number.isFinite(ms))return '<span class="muted">Chưa xác định thời gian đại hội</span>';if(ms<=0)return '<span class="muted">Đã đến thời gian diễn ra đại hội</span>';let s=Math.floor(ms/1000);const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60),sec=s%60;return [[d,'NGÀY'],[h,'GIỜ'],[m,'PHÚT'],[sec,'GIÂY']].map(([v,l])=>`<div class="digit">${String(v).padStart(2,'0')}<small>${l}</small></div>`).join('')}
function table(columns,rows){return `<div class="scroll"><table><thead><tr>${columns.map(x=>`<th>${html(x[0])}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${columns.map(([,key])=>`<td>${html(key==='time'?viTime(r[key]):r[key])}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${columns.length}">Chưa có dữ liệu</td></tr>`}</tbody></table></div>`}
function renderCongress(branch,target){const c=state.config||{},p=branch==='ChiHoi'?'ch':'cd',container=$(target);
 if(!bool(c[p+'_hienThiDaiHoi'])){container.replaceChildren();return}
 const candidates=(state.candidates||[]).filter(v=>v.branch===branch),result=state.results?.[branch],gate=state.voteStatus?.[branch]||{open:bool(c[p+'_moBauCu']),showCount:false};
 const time=c[p+'_batDauDaiHoi']||c[p+'_thoiGian'];const end=c[p+'_ketThucDaiHoi'];
 const details=[['Thời gian',viTime(time)],['Kết thúc',end?viTime(end):''],['Địa điểm',c[p+'_diaDiem']],['Trang phục',c[p+'_trangPhuc']],['Thành phần',c[p+'_thanhPhan']],['Lưu ý',c[p+'_luuYDaiHoi']]].filter(([,v])=>v&&v!=='Chưa cập nhật');
 const showCounter=bool(c[p+'_hienDemNguoc']===undefined?true:c[p+'_hienDemNguoc'])&&time;
 container.innerHTML=`<div class="congress"><div class="panel"><div class="eyebrow">${branch==='ChiHoi'?'CHI HỘI':'CHI ĐOÀN'}</div><h2>${html(c[p+'_tenDaiHoi']||'Đại hội')}</h2>
 <div class="congressDetails">${details.map(([k,v])=>`<div><strong>${html(k)}</strong><span>${multiline(v)}</span></div>`).join('')}</div>
 ${showCounter?`<h3 class="timerHeading">Đếm ngược đến đại hội</h3><div class="countdown" data-time="${html(time)}">${countdown(time)}</div>`:''}
 <h3>Đề án nhân sự</h3>${table([['Họ và tên','name'],['Quê quán','home'],['Dân tộc','ethnicity'],['Tôn giáo','religion'],['Chức vụ hiện tại','role']],candidates)}
 ${gate.open&&candidates.length&&!gate.full?`<button class="action voteOpen">CỔNG BẦU CỬ ĐÃ MỞ →</button>${gate.showCount?`<p class="voteStatus">Đã nhận: ${Number(gate.count)||0}${gate.unlimited?'':' / '+Number(gate.limit)}</p>`:''}`:''}
 </div>${result?`<div class="panel"><h2>Kết quả kiểm phiếu đã công bố</h2><p>Tổng phiếu thu: <b>${Number(result.total)||0}</b> · Đợt ${html(result.run)}</p>${table([['Ứng viên','name'],['Tín nhiệm','trusted'],['Không tín nhiệm','notTrusted'],['Số phiếu xét','total'],['Tỷ lệ tín nhiệm (%)','percent']],result.results||[])}</div>`:''}</div>`;
 const btn=container.querySelector('.voteOpen');if(btn)btn.onclick=()=>openBallotPage(branch,c[p+'_dotBauCu'],candidates);
}
function openBallotPage(branch,run,candidates){
 let page=document.getElementById('voteStandalone');if(!page){page=document.createElement('section');page.id='voteStandalone';page.className='page';page.innerHTML='<div class="panel ballotStandaloneInner"><button class="action backFromBallot" type="button">← Quay lại</button><div id="ballotStandaloneContent"></div></div>';
 document.querySelector('main')?.append(page);page.querySelector('.backFromBallot').onclick=()=>nav(branch==='ChiHoi'?'hoi':'doan');}
 const root=page.querySelector('#ballotStandaloneContent');root.innerHTML='<h2>PHIẾU BẦU KÍN</h2><div class="ballotPanel"></div>';
 showBallot(branch,run,root,candidates);nav('voteStandalone');
}

function showBallot(branch,run,root,candidates){const panel=root.querySelector('.ballotPanel');panel.hidden=false;const key='voted_'+branch+'_'+run;const voted=localStorage.getItem(key)==='1';panel.innerHTML=`<h3>Phiếu bầu kín · ${html(branch==='ChiHoi'?'Chi Hội':'Chi Đoàn')}</h3><p class="muted">Tích “Không tín nhiệm” cho ít nhất một ứng viên. Các ứng viên không tích được tính là Tín nhiệm. Không yêu cầu họ tên hoặc MSSV.</p>${candidates.map(x=>`<div class="candidate"><div><b>${html(x.name)}</b><br><span>${html(x.role||'')}</span></div><label><input type="checkbox" value="${html(x.id)}" ${voted?'disabled':''}> Không tín nhiệm</label></div>`).join('')}<button class="action sendVote" ${voted?'disabled':''}>${voted?'THIẾT BỊ ĐÃ GỬI PHIẾU':'NỘP PHIẾU BẦU'}</button><p class="message" role="status">${voted?'Thiết bị này đã gửi phiếu trong đợt bầu cử này.':''}</p>`;panel.querySelector('.sendVote').onclick=async()=>{const rejected=[...panel.querySelectorAll('input:checked')].map(n=>n.value);const msg=panel.querySelector('.message');if(!rejected.length){msg.textContent='Bạn phải tích ít nhất một ô Không tín nhiệm.';msg.className='message red';return}if(!confirm('Xác nhận nộp phiếu? Không thể sửa phiếu sau khi nộp.'))return;const btn=panel.querySelector('.sendVote');btn.disabled=true;msg.textContent='Đang gửi phiếu và chờ xác nhận...';try{await write('vote',{branch,run,notTrusted:rejected});localStorage.setItem(key,'1');msg.textContent='Phiếu đã được ghi nhận thành công.';msg.className='message green';btn.textContent='ĐÃ GỬI PHIẾU';panel.querySelectorAll('input').forEach(x=>x.disabled=true)}catch(e){msg.textContent=e.message;msg.className='message red';btn.disabled=false}}}
function status(a){const now=Date.now();if(now<Date.parse(a.opensAt))return ['Chưa mở','closed',false];if(a.closesAt&&now>=Date.parse(a.closesAt))return ['Đã đóng','closed',false];if(!a.unlimited&&(!a.limit||a.count>=a.limit))return ['Đã đủ số lượng','closed',false];return ['Đang mở đăng ký','',true]}

// Chuỗi hoạt động được hiển thị ngay trong #activityList (không cần sửa index.html).
(function addActivitySeriesStyle(){
 if(document.getElementById('qlnh-series-style'))return;
 const style=document.createElement('style');style.id='qlnh-series-style';
 style.textContent=`
 .seriesCard{background:linear-gradient(135deg,#f1f8ff,#fff 40%);border:2px solid #c8ddf3;border-radius:22px;padding:clamp(16px,3vw,28px);margin:18px 0;box-shadow:0 12px 35px #163f7011}
 .seriesCard .seriesTop{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
 .seriesCard .seriesChip{display:inline-block;border-radius:50px;background:#e0efff;color:#19578a;padding:7px 12px;font-weight:700;font-size:13px}
 .seriesCard h2{margin:12px 0;color:#1b4772}
 .seriesCard .seriesMeta{color:#596e84;font-size:14px;line-height:1.75}
 .seriesChild{background:white;border:1px solid #d7e5f3;border-radius:14px;padding:16px;margin:12px 0}
 .seriesChild h3{font-size:17px;margin:8px 0;color:#224b72}
 .seriesChild .seriesChildTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
 .seriesChild .seriesSelect{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:650;white-space:nowrap;cursor:pointer;color:#245d89}
 .seriesChild .seriesSelect input{width:19px;height:19px;accent-color:#1b669d;cursor:pointer}
 .seriesChild .seriesSelect input:disabled{cursor:not-allowed}
 .seriesChild .seriesNumbers{color:#5a7188;font-size:13px}
 .seriesChild .seriesTrack{height:7px;border-radius:50px;background:#e8eff6;overflow:hidden;margin-top:10px}
 .seriesChild .seriesTrack span{display:block;height:100%;background:#2a79af;border-radius:50px}
 .seriesCard .seriesForm{margin-top:18px;padding:16px;border-radius:14px;background:#eff6ff}
 .seriesCard .seriesForm .seriesPicked{font-weight:600;font-size:13px;margin:10px 0;color:#214b75}
 .seriesCard .seriesFull{color:#aa3b40;font-weight:700}
 .seriesCard .seriesNote{font-size:12px;color:#65788d}
 @media(max-width:550px){.seriesChild .seriesChildTop{flex-direction:column}.seriesCard .seriesMeta{font-size:13px}}
 `;
 document.head.append(style);
})();
function actVnTime(value){
 const d=new Date(value);
 return Number.isFinite(d.getTime())?d.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric',hour12:false}):'Chưa cập nhật';
}
function existingRegState_(list){
 const saved={};
 list.querySelectorAll('.regForm').forEach(f=>{
  const name=f.elements.namedItem('name');
  const id=f.elements.namedItem('studentId');
  saved[f.dataset.id]={name:name?name.value:'',id:id?id.value:'',choices:[...f.querySelectorAll('input[data-choice]:checked')].map(n=>n.value)};
 });
 return saved;
}
function renderActivities(){
 const list=$('activityList');
 const solos=Array.isArray(state.activities)?state.activities:[];
 const groups=Array.isArray(state.series)?state.series:[];
 if(!solos.length&&!groups.length){list.innerHTML='<div class="panel">Hiện chưa có hoạt động được hiển thị.</div>';return;}
 const existing=existingRegState_(list);list.replaceChildren();
 groups.forEach(series=>{
  const st=status({opensAt:series.opensAt,closesAt:series.closesAt,unlimited:true,count:0});
  const card=document.createElement('article');card.className='seriesCard';
  const children=Array.isArray(series.activities)?series.activities:[];
  if(!children.length)return;
  card.innerHTML=`<div class="seriesTop"><span class="seriesChip">CHUỖI HOẠT ĐỘNG</span><span class="tag ${st[1]}">${html(st[0])}</span></div>
  <h2>${html(series.title)}</h2><p class="activityDescription">${multiline(series.description)}</p>
  <p class="seriesMeta">🟢 Mở đăng ký: ${html(actVnTime(series.opensAt))}<br>⏰ Đóng toàn chuỗi: ${html(actVnTime(series.closesAt))}
   ${Date.now()<Date.parse(series.opensAt)?`<br><span class="countdown" data-time="${html(series.opensAt)}"></span>`:st[2]?`<br><span class="countdown" data-time="${html(series.closesAt)}"></span>`:''}</p>
  <details class="seriesCollapse" data-series="${html(series.id)}"><summary>Hiển thị các hoạt động và đăng ký <span aria-hidden="true">⌄</span></summary><form class="regForm seriesForm" data-id="${html('series:'+series.id)}">
   <div class="seriesChildren"></div>
   <p class="seriesPicked" aria-live="polite">Đã chọn 0 hoạt động</p>
   <label>Họ và tên<input name="name" autocomplete="name" maxlength="150" required ${st[2]?'':'disabled'}></label>
   <label>MSSV<input name="studentId" maxlength="30" required ${st[2]?'':'disabled'}></label>
   <button class="action" type="submit" disabled>ĐĂNG KÝ CÁC HOẠT ĐỘNG ĐÃ CHỌN</button>
   <p class="seriesNote">Chỉ chọn những hoạt động còn suất và còn thời hạn. Mỗi hoạt động có danh sách đăng ký riêng.</p>
  </form><p class="message" role="status"></p></details>`;
  const form=card.querySelector('form');
  const savedOpen=sessionStorage.getItem('seriesOpen:'+series.id)==='1';card.querySelector('.seriesCollapse').open=savedOpen;card.querySelector('.seriesCollapse').ontoggle=e=>sessionStorage.setItem('seriesOpen:'+series.id,e.target.open?'1':'0');
  const container=card.querySelector('.seriesChildren');
  const saved=existing['series:'+series.id]||{};
  form.elements.name.value=saved.name||'';
  form.elements.studentId.value=saved.id||'';
  children.forEach(a=>{
   const stateChild=status(a);
   const can=st[2]&&stateChild[2];
   const progress=!a.unlimited&&a.limit?Math.min(100,Math.round(a.count*100/a.limit)):0;
   const row=document.createElement('section');row.className='seriesChild';
   row.innerHTML=`<div class="seriesChildTop"><div><span class="tag ${can?'': 'closed'}">${html(can?'Còn nhận đăng ký':(st[2]?stateChild[0]:st[0]))}</span>
    <h3>${html(a.title)}</h3></div>
    <label class="seriesSelect"><input data-choice type="checkbox" value="${html(a.id)}" ${can?'':'disabled'} ${can&&saved.choices?.includes(a.id)?'checked':''}> Tham gia</label></div>
    <p class="activityDescription">${multiline(a.description)}</p><p class="seriesMeta">🗓 ${html(a.eventTime||'Đang cập nhật')} · 📍 ${html(a.location||'Đang cập nhật')}<br>
    ⏰ Hạn đăng ký: ${html(actVnTime(a.closesAt||series.closesAt))}</p>
    ${a.note?`<div class="activityNote"><strong>Lưu ý</strong><p>${multiline(a.note)}</p></div>`:''}<p class="seriesNumbers">Đã đăng ký: ${a.count}${a.unlimited?' · Không giới hạn':' / '+a.limit}</p>
    ${a.unlimited?'':`<div class="seriesTrack"><span style="width:${progress}%"></span></div>`}
    <details><summary>Danh sách đã đăng ký (${a.count})</summary>
    ${table([['STT','index'],['Họ và tên','name'],['MSSV','studentId'],['Thời gian đăng ký','time']],(a.registrations||[]).map((r,i)=>({...r,index:i+1})))}</details>`;
   container.append(row);
  });
  const button=form.querySelector('button[type=submit]');
  function update(){const num=form.querySelectorAll('input[data-choice]:checked').length;card.querySelector('.seriesPicked').textContent='Đã chọn '+num+' hoạt động';button.disabled=!st[2]||num===0;}
  form.querySelectorAll('input[data-choice]').forEach(input=>input.onchange=update);
  update();
  form.onsubmit=async e=>{
   e.preventDefault();const ids=[...form.querySelectorAll('input[data-choice]:checked')].map(c=>c.value);
   if(!st[2]||!ids.length)return;
   const name=form.elements.name.value.trim(),studentId=form.elements.studentId.value.trim();
   const msg=card.querySelector('.message');button.disabled=true;msg.className='message';msg.textContent='Đang xử lý và chờ xác nhận...';
   try{
    await write('registerSeries',{seriesId:series.id,activityIds:ids,name,studentId});
    msg.className='message green';msg.textContent='Đăng ký thành công '+ids.length+' hoạt động!';
    form.reset();await refresh(true);
   }catch(err){msg.textContent=err.message;msg.className='message red';}
   finally{update();}
  };
  list.append(card);
 });
 // Giữ nguyên thẻ hoạt động riêng lẻ và hành vi đã có.
 solos.forEach(a=>{
  const st=status(a),card=document.createElement('article');card.className='itemCard';
  card.innerHTML=`<span class="tag ${st[1]}">${html(st[0])}</span><h2>${html(a.title)}</h2><p class="activityDescription">${multiline(a.description)}</p>
  <div class="meta"><p>🗓 Diễn ra: ${html(a.eventTime)}<br>📍 Địa điểm: ${html(a.location)}<br>
  ⌛ Mở: ${html(actVnTime(a.opensAt))}<br>⌛ Hạn đăng ký: ${html(actVnTime(a.closesAt))}<br>
  👥 Đã đăng ký: ${a.count}${a.unlimited?' · Không giới hạn':' / '+a.limit}</p>${a.note?`<div class="activityNote"><strong>Lưu ý</strong><p>${multiline(a.note)}</p></div>`:""}</div>
  <form class="regForm" data-id="${html(a.id)}"><label>Họ và tên<input name="name" autocomplete="name" maxlength="150" required ${st[2]?'':'disabled'}></label>
  <label>MSSV<input name="studentId" maxlength="30" required ${st[2]?'':'disabled'}></label>
  <button class="action" ${st[2]?'':'disabled'}>ĐĂNG KÝ</button></form><p class="message" role="status"></p>
  <h3 class="listHeading">Danh sách đã đăng ký (${a.count})</h3>
  ${table([['STT','index'],['Họ và tên','name'],['MSSV','studentId'],['Thời gian đăng ký','time']],(a.registrations||[]).map((r,i)=>({...r,index:i+1})))}`;
  const form=card.querySelector('form'),saved=existing[a.id];
  if(saved){form.elements.name.value=saved.name;form.elements.studentId.value=saved.id;}
  form.onsubmit=async e=>{
   e.preventDefault();const name=form.elements.name.value.trim(),studentId=form.elements.studentId.value.trim();
   const msg=card.querySelector('.message'),btn=form.querySelector('button');btn.disabled=true;
   msg.textContent='Đang xử lý và chờ xác nhận...';msg.className='message';
   try{await write('register',{activityId:a.id,name,studentId});msg.textContent='Đăng ký thành công!';msg.className='message green';form.reset();await refresh(true);}
   catch(err){msg.textContent=err.message;msg.className='message red';}
   finally{btn.disabled=false;}
  };
  list.append(card);
 });
}

async function refresh(silent=false){try{const data=await jsonp('publicData');if(!data.success)throw Error(data.message||'Máy chủ chưa sẵn sàng');state=data;latestTime=Date.now();if(!document.querySelector('.regForm:focus-within')&&!document.querySelector('.ballotPanel input:focus'))render();else $('syncTime').textContent='Đã có bản cập nhật mới';}catch(e){if(!silent)$('syncTime').textContent='Lỗi đồng bộ: '+e.message}}
function updateTimers(){document.querySelectorAll('.countdown[data-time]').forEach(n=>n.innerHTML=countdown(n.dataset.time))}
refresh();setInterval(()=>refresh(true),interval);setInterval(updateTimers,1000);
