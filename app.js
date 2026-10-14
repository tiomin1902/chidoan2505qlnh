'use strict';
const $=id=>document.getElementById(id);let state=null,latestTime=0;const interval=Math.max(5000,Number(window.CLASS_REFRESH_MS)||15000);const API=window.CLASS_API_URL;
document.body.setAttribute('data-current-page','home');
const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bool=v=>v===true||String(v).toLowerCase()==='true';
function nav(page){document.querySelectorAll('.page').forEach(n=>n.classList.toggle('current',n.id===page));document.body.setAttribute('data-current-page',page==='ballot'?(window.activeBallotBranch==='ChiHoi'?'hoi':'doan'):page);$('drawer').classList.remove('open');$('shade').hidden=true;$('menuBtn').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'smooth'})}
$('menuBtn').onclick=()=>{$('drawer').classList.add('open');$('shade').hidden=false;$('menuBtn').setAttribute('aria-expanded','true')};$('closeBtn').onclick=()=>$('shade').click();$('shade').onclick=()=>nav(document.querySelector('.page.current').id);document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>nav(b.dataset.page));
function jsonp(action,params={}){return new Promise((resolve,reject)=>{if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(API)){reject(Error('Chưa cấu hình URL Apps Script mới trong config.js'));return}const callback='cb_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');const timeout=setTimeout(()=>{clean();reject(Error('Hết thời gian kết nối máy chủ'))},15000);function clean(){clearTimeout(timeout);delete window[callback];s.remove()}window[callback]=d=>{clean();resolve(d)};s.onerror=()=>{clean();reject(Error('Không thể tải dữ liệu máy chủ'))};const url=new URL(API);url.searchParams.set('action',action);url.searchParams.set('callback',callback);url.searchParams.set('cacheBust',Date.now());Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));s.src=url;document.body.append(s)})}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function write(action,payload){const op=(crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):'op'+Date.now()+Math.random().toString(36).slice(2).padEnd(16,'0'));const body={...payload,action,op};if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(API))throw Error('Chưa thiết lập Apps Script mới');try{await fetch(API,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),redirect:'follow'})}catch(e){throw Error('Không gửi được yêu cầu đến máy chủ. Vui lòng kiểm tra kết nối trước khi thử lại.')}for(let attempt=0;attempt<12;attempt++){await sleep(1100);try{const r=await jsonp('receipt',{op});if(r.done){if(!r.success)throw Error(r.message||'Giao dịch thất bại');return r}}catch(e){if(e.message!=='Hết thời gian kết nối máy chủ'&&!e.message.includes('Không thể tải'))throw e}}throw Error('Chưa xác nhận được giao dịch. Vui lòng kiểm tra danh sách trước khi gửi lại để tránh trùng lặp.')}
function info(container,items){$(container).replaceChildren(...items.map(([label,val])=>{const box=document.createElement('article');box.className='infoCard';const small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=String(val||'Chưa cập nhật');box.append(small,strong);return box}))}
function render(){if(!state)return;const c=state.config||{};$('slogan').textContent=c.slogan||'';$('banner').style.backgroundImage=c.bannerUrl?`linear-gradient(90deg,#15365c22,#15365c44), url(${JSON.stringify(String(c.bannerUrl))})`:'';$('banner').classList.toggle('hasBanner',!!c.bannerUrl);info('classCards',[['Cố vấn học tập',c.coVan],['Lớp trưởng',c.lopTruong],['Lớp phó học tập',c.lopPhoHocTap],['Lớp phó phong trào',c.lopPhoPhongTrao],['Lớp phó đời sống',c.lopPhoDoiSong]]);$('classDescription').textContent=c.moTaLop||'Chưa cập nhật';info('doanCards',[['Nhiệm kỳ',c.cd_nhiemKy],['Bí thư',c.cd_biThu],['Phó Bí thư',c.cd_phoBiThu],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien1||(c.cd_uyVien!=='Chưa cập nhật'?c.cd_uyVien:'')],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien2],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien3]]);$('doanDescription').textContent=c.cd_moTa||'Chưa cập nhật';info('hoiCards',[['Nhiệm kỳ',c.ch_nhiemKy],['Chi hội trưởng',c.ch_chiHoiTruong],['Chi hội phó',c.ch_chiHoiPho],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien1||(c.ch_uyVien!=='Chưa cập nhật'?c.ch_uyVien:'')],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien2],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien3]]);$('hoiDescription').textContent=c.ch_moTa||'Chưa cập nhật';renderCongress('ChiDoan','doanCongress');renderCongress('ChiHoi','hoiCongress');renderActivities();$('syncTime').textContent='Cập nhật: '+new Date().toLocaleTimeString('vi-VN')}
function countdown(t){const ms=Date.parse(t)-Date.now();if(!Number.isFinite(ms))return '<span class="muted">Chưa xác định thời gian đại hội</span>';if(ms<=0)return '<span class="muted">Đã đến thời gian diễn ra đại hội</span>';let s=Math.floor(ms/1000);const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60),sec=s%60;return [[d,'NGÀY'],[h,'GIỜ'],[m,'PHÚT'],[sec,'GIÂY']].map(([v,l])=>`<div class="digit">${String(v).padStart(2,'0')}<small>${l}</small></div>`).join('')}
function table(columns,rows){return `<div class="scroll"><table><thead><tr>${columns.map(x=>`<th>${html(x[0])}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${columns.map(([,key])=>`<td>${html(r[key])}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${columns.length}">Chưa có dữ liệu</td></tr>`}</tbody></table></div>`}
function prettyDate(value){
  if(!value)return 'Chưa cập nhật';
  const d=new Date(value);
  if(!Number.isFinite(d.getTime()))return String(value);
  return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric',hour12:false}).format(d).replace(/^(\d{2}:\d{2}),? (\d{2}\/\d{2}\/\d{4})$/, '$1, ngày $2');
}
function renderCongress(branch,target){
  const c=state.config,p=branch==='ChiHoi'?'ch':'cd',container=$(target);
  if(!bool(c[p+'_hienThiDaiHoi'])){container.replaceChildren();return}
  const candidates=state.candidates.filter(v=>v.branch===branch),result=state.results&&state.results[branch],open=bool(c[p+'_moBauCu']),run=c[p+'_dotBauCu'];
  container.innerHTML=`<div class="congress"><div class="panel"><h2>${html(c[p+'_tenDaiHoi']||'Đại hội')}</h2><div class="eventMeta"><p><b>Thời gian:</b> ${html(prettyDate(c[p+'_thoiGian']))}</p><p><b>Địa điểm:</b> ${html(c[p+'_diaDiem']||'Chưa cập nhật')}</p></div><h3>Đếm ngược đến Đại hội</h3><div class="countdown" data-time="${html(c[p+'_thoiGian'])}">${countdown(c[p+'_thoiGian'])}</div><h3>Đề án nhân sự</h3>${table([['Họ và tên','name'],['Quê quán','home'],['Dân tộc','ethnicity'],['Tôn giáo','religion'],['Chức vụ hiện tại','role']],candidates)}<div class="voteEntry">${open&&candidates.length?'<button class="action voteOpen">BẮT ĐẦU BẦU CỬ →</button>':'<p class="muted">Cổng bầu cử chưa mở.</p>'}</div></div>${result?`<div class="panel"><h2>Kết quả kiểm phiếu đã công bố</h2><p>Tổng phiếu thu: <b>${Number(result.total)||0}</b> · Đợt ${html(result.run)}</p>${table([['Ứng viên','name'],['Tín nhiệm','trusted'],['Không tín nhiệm','notTrusted'],['Số phiếu xét','total'],['Tỷ lệ tín nhiệm (%)','percent']],result.results||[])}</div>`:''}</div>`;
  const btn=container.querySelector('.voteOpen');if(btn)btn.onclick=()=>showBallot(branch,run,candidates);
}
function showBallot(branch,run,candidates){
  window.activeBallotBranch=branch;
  const panel=$('ballotContent'),key='voted_'+branch+'_'+run,voted=localStorage.getItem(key)==='1';
  $('ballotTitle').textContent='Bầu cử '+(branch==='ChiHoi'?'Chi Hội':'Chi Đoàn')+' 2505QLNH';
  panel.innerHTML=`<p class="ballotInstruction">Mỗi ứng viên được mặc định <b>Tín nhiệm</b>. Nếu không tín nhiệm, hãy đánh dấu ở cột <b>Không tín nhiệm</b>. Theo quy chế hiện tại, phiếu hợp lệ phải có ít nhất một lựa chọn Không tín nhiệm.</p><div class="scroll"><table class="ballotTable"><thead><tr><th>STT</th><th>Ứng viên và thông tin</th><th>Tín nhiệm</th><th>Không tín nhiệm</th></tr></thead><tbody>${candidates.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${html(x.name)}</strong><span class="ballotDetail">${html(x.home||'')} · ${html(x.ethnicity||'')} · ${html(x.religion||'')}<br>${html(x.role||'')}</span></td><td class="trustCell"><span class="trustIndicator">✓ Tín nhiệm</span></td><td class="trustCell"><label class="rejectLabel"><input type="checkbox" value="${html(x.id)}" ${voted?'disabled':''} aria-label="Không tín nhiệm ${html(x.name)}"> Không tín nhiệm</label></td></tr>`).join('')}</tbody></table></div><div class="ballotActions"><button class="action sendVote" ${voted?'disabled':''}>${voted?'THIẾT BỊ ĐÃ GỬI PHIẾU':'XÁC NHẬN NỘP PHIẾU'}</button><p class="message" role="status">${voted?'Thiết bị này đã gửi phiếu trong đợt bầu cử này.':''}</p></div>`;
  const inputs=[...panel.querySelectorAll('input[type="checkbox"]')];
  const update=()=>inputs.forEach(x=>{const tr=x.closest('tr');tr.querySelector('.trustIndicator').textContent=x.checked?'— Không tín nhiệm':'✓ Tín nhiệm';tr.classList.toggle('rejectedRow',x.checked)});
  inputs.forEach(x=>x.addEventListener('change',update));update();
  panel.querySelector('.sendVote').onclick=async()=>{
    const rejected=inputs.filter(x=>x.checked).map(x=>x.value),msg=panel.querySelector('.message');
    if(!rejected.length){msg.textContent='Bạn phải chọn ít nhất một ô Không tín nhiệm.';msg.className='message red';return}
    if(!confirm('Xác nhận nộp phiếu? Không thể sửa phiếu sau khi nộp.'))return;
    const btn=panel.querySelector('.sendVote');btn.disabled=true;msg.textContent='Đang gửi phiếu và chờ xác nhận...';msg.className='message';
    try{await write('vote',{branch,run,notTrusted:rejected});localStorage.setItem(key,'1');msg.textContent='Phiếu đã được ghi nhận thành công.';msg.className='message green';btn.textContent='ĐÃ GỬI PHIẾU';inputs.forEach(x=>x.disabled=true)}
    catch(e){msg.textContent=e.message;msg.className='message red';btn.disabled=false}
  };
  nav('ballot');
}
$('ballotBack').onclick=()=>nav(window.activeBallotBranch==='ChiHoi'?'hoi':'doan');
// Trang danh sách hoạt động chỉ hiển thị tiêu đề, đồng hồ và nút mở chi tiết.
// Mọi quyết định cho phép đăng ký tiếp tục được kiểm tra ở máy chủ.
const expandedActivities=new Set();
const activityDrafts=new Map();
const activityNotices=new Map();
function activityDate(value){
  if(value===undefined||value===null||String(value).trim()==='')return 'Chưa cập nhật';
  const timestamp=Date.parse(value);
  if(!Number.isFinite(timestamp))return String(value);
  const parts=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(timestamp));
  const get=key=>parts.find(p=>p.type===key)?.value||'';
  return `${get('hour')}:${get('minute')}, ngày ${get('day')}/${get('month')}/${get('year')}`;
}
function activityStatus(a){
 const now=Date.now(),opens=Date.parse(a.opensAt),closes=Date.parse(a.closesAt);
 if(!Number.isFinite(opens)||!Number.isFinite(closes))return ['Chưa xác định thời gian','closed',false];
 if(now<opens)return ['Chưa mở','closed',false];
 if(now>=closes)return ['Đã đóng','closed',false];
 if(!a.unlimited&&(!a.limit||a.count>=a.limit))return ['Đã đủ số lượng','closed',false];
 return ['Đang mở đăng ký','',true];
}
function activityClock(a){
 const now=Date.now(),start=Date.parse(a.opensAt),end=Date.parse(a.closesAt);
 if(!Number.isFinite(start)||!Number.isFinite(end))return {label:'Chưa xác định thời gian đăng ký',count:'--'};
 let remaining=0,label='';
 if(now<start){label='ĐẾM NGƯỢC ĐẾN KHI MỞ ĐĂNG KÝ';remaining=start-now;}
 else if(now<end){label='ĐẾM NGƯỢC ĐẾN KHI HẾT HẠN ĐĂNG KÝ';remaining=end-now;}
 else return {label:'THỜI GIAN ĐĂNG KÝ ĐÃ KẾT THÚC',count:'Đã hết hạn'};
 let seconds=Math.max(0,Math.floor(remaining/1000));
 const days=Math.floor(seconds/86400);seconds%=86400;
 const hours=Math.floor(seconds/3600);seconds%=3600;
 const minutes=Math.floor(seconds/60);seconds%=60;
 return {label,count:`${String(days).padStart(2,'0')} ngày  ${String(hours).padStart(2,'0')} giờ  ${String(minutes).padStart(2,'0')} phút  ${String(seconds).padStart(2,'0')} giây`};
}
function syncActivityTimers(){
 if(!state)return;
 const activities=new Map((state.activities||[]).map(a=>[String(a.id),a]));
 document.querySelectorAll('.activityCard[data-activity-id]').forEach(card=>{
   const a=activities.get(card.dataset.activityId);if(!a)return;
   const clock=activityClock(a),status=activityStatus(a);
   const label=card.querySelector('.activityTimerLabel'),time=card.querySelector('.activityTimerValue'),badge=card.querySelector('.tag');
   if(label)label.textContent=clock.label;
   if(time)time.textContent=clock.count;
   if(badge){badge.textContent=status[0];badge.className='tag '+status[1];}
   const form=card.querySelector('.regForm');
   if(form){form.querySelectorAll('input,button').forEach(el=>{if(!form.dataset.submitting)el.disabled=!status[2]});}
 });
}
function renderActivities(){
 const list=$('activityList');
 list.querySelectorAll('.regForm').forEach(form=>activityDrafts.set(form.dataset.id,{name:form.elements.name.value,id:form.elements.studentId.value}));
 const activities=Array.isArray(state.activities)?state.activities:[];
 if(!activities.length){expandedActivities.clear();list.innerHTML='<div class="panel activityEmpty">Hiện tại chưa có hoạt động nào để đăng ký</div>';return;}
 list.replaceChildren();
 const valid=new Set(activities.map(a=>String(a.id)));
 for(const id of [...expandedActivities])if(!valid.has(id))expandedActivities.delete(id);
 activities.forEach(a=>{
  const id=String(a.id),st=activityStatus(a),clock=activityClock(a),opened=expandedActivities.has(id);
  const card=document.createElement('article');card.className='itemCard activityCard';card.dataset.activityId=id;
  card.innerHTML=`
   <div class="activitySummary"><span class="tag ${st[1]}">${html(st[0])}</span>
    <h2>${html(a.title)}</h2>
    <div class="activityTimer" aria-live="off"><span class="activityTimerLabel">${html(clock.label)}</span><strong class="activityTimerValue">${html(clock.count)}</strong></div>
    <button type="button" class="action activityToggle" aria-expanded="${opened}" aria-controls="activity-detail-${html(id)}">${opened?'THU GỌN THÔNG TIN ↑':'BẮT ĐẦU ĐĂNG KÝ →'}</button>
   </div>
   <div class="activityDetail" id="activity-detail-${html(id)}" ${opened?'':'hidden'}>
    <div class="activityMeta"><p>${html(a.description||'')}</p>
    <p><b>Thời gian diễn ra:</b> ${html(activityDate(a.eventTime))}<br>
    <b>Địa điểm:</b> ${html(a.location||'Chưa cập nhật')}<br>
    <b>Mở đăng ký:</b> ${html(activityDate(a.opensAt))}<br>
    <b>Hạn đăng ký:</b> ${html(activityDate(a.closesAt))}<br>
    <b>Số lượng đã đăng ký:</b> ${Number(a.count)||0}${a.unlimited?' · Không giới hạn':' / '+(Number(a.limit)||0)}</p>
    ${a.note?`<p>${html(a.note)}</p>`:''}</div>
    <form class="regForm" data-id="${html(id)}"><label>Họ và tên<input name="name" autocomplete="name" maxlength="150" required ${st[2]?'':'disabled'}></label><label>MSSV<input name="studentId" maxlength="30" required ${st[2]?'':'disabled'}></label><button class="action" ${st[2]?'':'disabled'}>XÁC NHẬN ĐĂNG KÝ</button></form>
    <p class="message" role="status"></p>
    <h3 class="listHeading">Danh sách đã đăng ký (${Number(a.count)||0})</h3>
    ${table([['STT','index'],['Họ và tên','name'],['MSSV','studentId'],['Thời gian đăng ký','time']],(a.registrations||[]).map((r,i)=>({...r,index:i+1,time:activityDate(r.time)})))}
   </div>`;
  const detail=card.querySelector('.activityDetail'),toggle=card.querySelector('.activityToggle');
  toggle.onclick=()=>{
    const opening=detail.hidden;
    detail.hidden=!opening;
    toggle.setAttribute('aria-expanded',String(opening));
    toggle.textContent=opening?'THU GỌN THÔNG TIN ↑':'BẮT ĐẦU ĐĂNG KÝ →';
    if(opening)expandedActivities.add(id);else expandedActivities.delete(id);
  };
  const form=card.querySelector('.regForm'),draft=activityDrafts.get(id),msg=card.querySelector('.message');
  if(draft){form.elements.name.value=draft.name;form.elements.studentId.value=draft.id;}
  if(activityNotices.has(id)){const notice=activityNotices.get(id);msg.textContent=notice.text;msg.className='message '+notice.kind;}
  form.onsubmit=async event=>{
   event.preventDefault();
   if(!activityStatus(a)[2]){msg.textContent='Hoạt động hiện không nhận đăng ký.';msg.className='message red';return;}
   const name=form.elements.name.value.trim(),studentId=form.elements.studentId.value.trim(),btn=form.querySelector('button');
   if(!name||!studentId)return;
   form.dataset.submitting='yes';btn.disabled=true;msg.textContent='Đang gửi đăng ký và chờ xác nhận...';msg.className='message';
   try{
    await write('register',{activityId:a.id,name,studentId});
    activityDrafts.delete(id);activityNotices.set(id,{text:'Đăng ký thành công!',kind:'green'});
    form.reset();msg.textContent='Đăng ký thành công!';msg.className='message green';
    await refresh(true);
   }catch(error){
    activityNotices.set(id,{text:error.message,kind:'red'});
    msg.textContent=error.message;msg.className='message red';
   }finally{delete form.dataset.submitting;btn.disabled=!activityStatus(a)[2];}
  };
  list.append(card);
 });
 syncActivityTimers();
}
async function refresh(silent=false){try{const data=await jsonp('publicData');if(!data.success)throw Error(data.message||'Máy chủ chưa sẵn sàng');state=data;latestTime=Date.now();if(document.querySelector("#ballot.current")){const b=window.activeBallotBranch,p=b==="ChiHoi"?"ch":"cd";if(!bool(data.config?.[p+"_moBauCu"])||!bool(data.config?.[p+"_hienThiDaiHoi"]))nav(b==="ChiHoi"?"hoi":"doan");}if(!document.querySelector('.regForm:focus-within')&&!document.querySelector('.ballotPanel input:focus'))render();else $('syncTime').textContent='Đã có bản cập nhật mới';}catch(e){if(!silent)$('syncTime').textContent='Lỗi đồng bộ: '+e.message}}
function updateTimers(){document.querySelectorAll('.countdown[data-time]').forEach(n=>n.innerHTML=countdown(n.dataset.time));syncActivityTimers()}
refresh();setInterval(()=>refresh(true),interval);setInterval(updateTimers,1000);
