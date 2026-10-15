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
function info(container,items){$(container).replaceChildren(...items.filter(([,val,key])=>!key||!state||!state.config||state.config['show_'+key]!==false&&String(state.config['show_'+key]).toLowerCase()!=='false').map(([label,val])=>{const box=document.createElement('article');box.className='infoCard';const small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=String(val||'Chưa cập nhật');box.append(small,strong);return box}))}
function render(){if(!state)return;const c=state.config||{};$('slogan').textContent=c.slogan||'';$('banner').style.backgroundImage=c.bannerUrl?`linear-gradient(90deg,#15365c22,#15365c44), url(${JSON.stringify(String(c.bannerUrl))})`:'';$('banner').classList.toggle('hasBanner',!!c.bannerUrl);info('classCards',[['Cố vấn học tập',c.coVan,'coVan'],['Lớp trưởng',c.lopTruong,'lopTruong'],['Lớp phó học tập',c.lopPhoHocTap,'lopPhoHocTap'],['Lớp phó phong trào',c.lopPhoPhongTrao,'lopPhoPhongTrao'],['Lớp phó đời sống',c.lopPhoDoiSong,'lopPhoDoiSong']]);$('classDescription').textContent=c.moTaLop||'Chưa cập nhật';$('classDescription').closest('.panel').hidden=(c.show_moTaLop===false||String(c.show_moTaLop).toLowerCase()==='false');info('doanCards',[['Nhiệm kỳ',c.cd_nhiemKy,'cd_nhiemKy'],['Bí thư',c.cd_biThu,'cd_biThu'],['Phó Bí thư',c.cd_phoBiThu,'cd_phoBiThu'],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien1||(c.cd_uyVien!=='Chưa cập nhật'?c.cd_uyVien:''),'cd_uyVien1'],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien2,'cd_uyVien2'],['Ủy viên Ban Chấp hành Chi Đoàn',c.cd_uyVien3,'cd_uyVien3']]);$('doanDescription').textContent=c.cd_moTa||'Chưa cập nhật';$('doanDescription').closest('.panel').hidden=(c.show_cd_moTa===false||String(c.show_cd_moTa).toLowerCase()==='false');info('hoiCards',[['Nhiệm kỳ',c.ch_nhiemKy,'ch_nhiemKy'],['Chi hội trưởng',c.ch_chiHoiTruong,'ch_chiHoiTruong'],['Chi hội phó',c.ch_chiHoiPho,'ch_chiHoiPho'],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien1||(c.ch_uyVien!=='Chưa cập nhật'?c.ch_uyVien:''),'ch_uyVien1'],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien2,'ch_uyVien2'],['Ủy viên Ban Chấp hành Chi Hội',c.ch_uyVien3,'ch_uyVien3']]);$('hoiDescription').textContent=c.ch_moTa||'Chưa cập nhật';$('hoiDescription').closest('.panel').hidden=(c.show_ch_moTa===false||String(c.show_ch_moTa).toLowerCase()==='false');renderCongress('ChiDoan','doanCongress');renderCongress('ChiHoi','hoiCongress');renderActivities();renderAttendance();applyDesign_();renderNotices_();$('syncTime').textContent='Cập nhật: '+new Date().toLocaleTimeString('vi-VN')}
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
  container.innerHTML=`<div class="congress"><div class="panel"><h2>${html(c[p+'_tenDaiHoi']||'Đại hội')}</h2><div class="eventMeta"><p><b>Thời gian:</b> ${html(prettyDate(c[p+'_thoiGian']))}</p><p><b>Địa điểm:</b> ${html(c[p+'_diaDiem']||'Chưa cập nhật')}</p></div><h3>Đếm ngược đến Đại hội</h3><div class="countdown" data-time="${html(c[p+'_thoiGian'])}">${countdown(c[p+'_thoiGian'])}</div>${String(c[p+'_hienThiDeAn']).toLowerCase() === 'false' ? '' : `<h3>Đề án nhân sự</h3>${table([['Họ và tên','name'],['Quê quán','home'],['Dân tộc','ethnicity'],['Tôn giáo','religion'],['Chức vụ hiện tại','role']],candidates)}`} <div class="voteEntry">${open&&candidates.length?'<button class="action voteOpen">BẮT ĐẦU BẦU CỬ →</button>':'<p class="muted">Cổng bầu cử chưa mở.</p>'}</div></div>${result?`<div class="panel"><h2>Kết quả kiểm phiếu đã công bố</h2><p>Tổng phiếu thu: <b>${Number(result.total)||0}</b> · Đợt ${html(result.run)}</p>${table([['Ứng viên','name'],['Tín nhiệm','trusted'],['Không tín nhiệm','notTrusted'],['Số phiếu xét','total'],['Tỷ lệ tín nhiệm (%)','percent']],result.results||[])}</div>`:''}</div>`;
  const btn=container.querySelector('.voteOpen');if(btn)btn.onclick=()=>showBallot(branch,run,candidates);
}
function showBallot(branch,run,candidates){
  window.activeBallotBranch=branch;
  const panel=$('ballotContent'),key='voted_'+branch+'_'+run,voted=localStorage.getItem(key)==='1';
  $('ballotTitle').textContent='Bầu cử '+(branch==='ChiHoi'?'Chi Hội':'Chi Đoàn')+' 2505QLNH';
  panel.innerHTML=`<p class="ballotInstruction">Mỗi ứng viên mặc định được <b>Tín nhiệm</b>. Nếu không tín nhiệm, đánh dấu ở ô <b>Không tín nhiệm</b>. Phiếu hợp lệ cần có ít nhất một lựa chọn Không tín nhiệm.</p><div class="ballotCandidates">${candidates.map((x,i)=>`<article class="voteCandidate"><div class="votePerson"><span class="voteIndex">ỨNG VIÊN ${String(i+1).padStart(2,'0')}</span><strong>${html(x.name)}</strong></div><div class="voteFacts"><div><small>Quê quán</small><strong>${html(x.home||'Chưa cập nhật')}</strong></div><div><small>Dân tộc</small><strong>${html(x.ethnicity||'Chưa cập nhật')}</strong></div><div><small>Tôn giáo</small><strong>${html(x.religion||'Chưa cập nhật')}</strong></div><div><small>Chức vụ hiện tại</small><strong>${html(x.role||'Không')}</strong></div></div><div class="voteDecision"><span class="trustIndicator">✓ Tín nhiệm</span><label class="rejectLabel"><input type="checkbox" value="${html(x.id)}" ${voted?'disabled':''} aria-label="Không tín nhiệm ${html(x.name)}"> Không tín nhiệm</label></div></article>`).join('')}</div><div class="ballotActions"><button class="action sendVote" ${voted?'disabled':''}>${voted?'THIẾT BỊ ĐÃ GỬI PHIẾU':'XÁC NHẬN NỘP PHIẾU'}</button><p class="message" role="status">${voted?'Thiết bị này đã gửi phiếu trong đợt bầu cử này.':''}</p></div>`;
  const inputs=[...panel.querySelectorAll('input[type="checkbox"]')];
  const update=()=>inputs.forEach(x=>{const tr=x.closest('.voteCandidate');tr.querySelector('.trustIndicator').textContent=x.checked?'— Không tín nhiệm':'✓ Tín nhiệm';tr.classList.toggle('rejectedRow',x.checked)});
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
function updateTimers(){document.querySelectorAll('.countdown[data-time]').forEach(n=>n.innerHTML=countdown(n.dataset.time));syncActivityTimers();updateNoticeClocks_()}
refresh();setInterval(()=>refresh(true),interval);setInterval(updateTimers,1000);


// ĐIỂM DANH: mở công khai bằng thời gian và công tắc quản trị, ghi nhận do máy chủ xác thực.
function attendanceDate(v){return activityDate(v)}
function renderAttendance(){
  const root=$('attendanceList');if(!root)return;
  const sessions=Array.isArray(state.attendanceSessions)?state.attendanceSessions:[];
  if(!sessions.length){root.innerHTML='<div class="panel activityEmpty">Hiện tại chưa có buổi điểm danh nào đang mở.</div>';return}
  root.replaceChildren();
  sessions.forEach(s=>{
    const a=document.createElement('article');a.className='panel attendanceCard';
    const until=Date.parse(s.endsAt),from=Date.parse(s.startsAt),now=Date.now();
    const available=s.enabled&&Number.isFinite(until)&&Number.isFinite(from)&&now>=from&&now<until;
    a.innerHTML=`<h2>${html(s.title)}</h2><p><b>Loại:</b> ${html(s.kind==='DaiHoi'?'Đại hội':'Hoạt động')} · <b>Địa điểm:</b> ${html(s.location||'Chưa cập nhật')}</p><p><b>Bắt đầu:</b> ${html(attendanceDate(s.startsAt))} · <b>Kết thúc:</b> ${html(attendanceDate(s.endsAt))}</p><p class="muted">${available?'Đang mở điểm danh':now<from?'Chưa đến thời gian điểm danh':'Đã đóng điểm danh'}</p><form class="regForm"><label>Họ và tên<input name="name" maxlength="150" required ${available?'':'disabled'}></label><label>MSSV<input name="studentId" maxlength="30" required ${available?'':'disabled'}></label><button class="action" ${available?'':'disabled'}>XÁC NHẬN ĐIỂM DANH</button></form><p class="message" role="status"></p>`;
    const f=a.querySelector('form'),btn=f.querySelector('button'),msg=a.querySelector('.message');
    f.onsubmit=async e=>{e.preventDefault();btn.disabled=true;msg.textContent='Đang xác nhận điểm danh...';try{await write('attendance',{sessionId:s.id,name:f.elements.name.value.trim(),studentId:f.elements.studentId.value.trim()});msg.textContent='Điểm danh thành công.';msg.className='message green';f.reset();await refresh(true)}catch(error){msg.textContent=error.message;msg.className='message red'}finally{btn.disabled=false}};
    root.append(a)
  });
}

// ĐIỀU KHIỂN GIAO DIỆN TỪ ADMIN
function applyDesign_(){if(!state)return;const c=state.config||{},r=document.documentElement.style;
 const defs=[['ui_primary','--wine'],['ui_gold','--gold'],['ui_background','--cream'],['ui_hoi','--blue']];defs.forEach(([key,varname])=>{if(/^#[0-9a-f]{6}$/i.test(c[key]||''))r.setProperty(varname,c[key]);});
 const banner=$('banner');if(banner){banner.style.backgroundPosition=c.ui_banner_position||'center';if(c.bannerUrl&&/^https:\/\//.test(c.bannerUrl)){const shade=Math.min(90,Math.max(0,Number(c.ui_banner_shade)||65))/100;banner.style.backgroundImage=`linear-gradient(90deg,rgba(55,4,12,${shade}),rgba(49,8,18,${Math.min(1,shade*.7)})),url(${JSON.stringify(c.bannerUrl)})`;}}
 const ft=$('footerLabel');if(ft)ft.textContent=c.ui_footer||'LỚP 2505QLNH · 2026 – 2027';}
// Nút chuông gọn, xuất hiện tự động khi có thông báo công khai.
let noticesOpen = false;
let noticeSignature = '';
let noticeGreetingUntil = 0;
let noticeGreetingTimer = null;
function renderNotices_() {
  const root = $('homeNotices');
  if (!root || !state) return;
  const items = Array.isArray(state.announcements) ? state.announcements : [];
  root.hidden = items.length === 0;
  if (!items.length) {
    root.replaceChildren();
    noticesOpen = false;
    noticeSignature = '';
    noticeGreetingUntil = 0;
    clearTimeout(noticeGreetingTimer);
    return;
  }

  // Đồng bộ định kỳ không làm lời nhắc nhấp nháy liên tục.
  const signature = JSON.stringify(items.map(x => [x.id, x.title, x.startsAt, x.endsAt]));
  if (signature !== noticeSignature) {
    noticeSignature = signature;
    noticeGreetingUntil = Date.now() + 5000;
    clearTimeout(noticeGreetingTimer);
    noticeGreetingTimer = setTimeout(() => {
      noticeGreetingUntil = 0;
      const hint = root.querySelector('.noticeHint');
      if (hint) hint.hidden = true;
    }, 5000);
  }

  // Lưu vị trí cuộn trong bảng khi website tự đồng bộ.
  const oldList = root.querySelector('.noticeCards');
  const scroll = oldList ? oldList.scrollTop : 0;
  const open = noticesOpen;
  root.innerHTML = `<div class="noticeDock ${open ? 'noticeDockOpen' : ''}">
    <div class="noticeLauncher">
      <span class="noticeHint" ${open || Date.now() >= noticeGreetingUntil ? 'hidden' : ''}>Có thông báo mới</span>
      <button type="button" class="noticeToggle" aria-label="${open ? 'Đóng' : 'Mở'} ${items.length} thông báo" aria-expanded="${open}" aria-controls="noticeDetails" title="${open ? 'Đóng thông báo' : 'Xem thông báo'}">
        <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
        <span class="noticeBadge">${items.length > 99 ? '99+' : items.length}</span>
      </button>
    </div>
    <div id="noticeDetails" class="noticeDetails" ${open ? '' : 'hidden'}>
      <div class="noticePanelHeader"><strong>Thông báo của lớp</strong><button class="noticeClose" type="button" aria-label="Đóng danh sách thông báo">✕</button></div>
      <div class="noticeCards">${items.map(a => {
        const f = a.fields || {};
        const line = (k, label, val) => f[k] !== false && val ? `<p>${label ? `<b>${label}:</b> ` : ''}${html(val)}</p>` : '';
        return `<article class="noticeCard">
          ${f.ANH_URL !== false && a.image && /^https:\/\//i.test(a.image) ? `<img loading="lazy" src="${html(a.image)}" alt="Ảnh thông báo">` : ''}
          ${f.TIEU_DE !== false ? `<h3>${html(a.title)}</h3>` : ''}
          ${line('MO_TA', '', a.description)}
          ${line('BAT_DAU', 'Bắt đầu', a.startsAt ? prettyDate(a.startsAt) : '')}
          ${line('KET_THUC', 'Kết thúc', a.endsAt ? prettyDate(a.endsAt) : '')}
          ${line('DIA_DIEM', 'Địa điểm', a.location)}
          ${line('DOI_TUONG', 'Người tham gia', a.audience)}
          ${line('TRANG_PHUC', 'Trang phục', a.dress)}
          ${line('PHU_TRACH', 'Phụ trách', a.contact)}
          ${line('DON_VI', 'Tổ chức', a.organizer)}
          ${line('LUU_Y', 'Lưu ý', a.note)}
          ${f.DEM_NGUOC !== false && a.countTo !== 'off' ? `<p class="noticeClock" data-to="${html(a.countTo === 'end' ? a.endsAt : a.startsAt)}"></p>` : ''}
          ${f.LIEN_KET !== false && a.url && /^https:\/\//i.test(a.url) ? `<a href="${html(a.url)}" target="_blank" rel="noopener noreferrer">${html(f.NUT_LINK !== false && a.button ? a.button : 'Xem chi tiết')} →</a>` : ''}
        </article>`;
      }).join('')}</div>
    </div>
  </div>`;
  const launcher = root.querySelector('.noticeToggle');
  const toggle = () => {
    noticesOpen = !noticesOpen;
    noticeGreetingUntil = 0;
    renderNotices_();
  };
  launcher.onclick = toggle;
  root.querySelector('.noticeClose').onclick = () => { noticesOpen = false; renderNotices_(); };
  if (open) root.querySelector('.noticeCards').scrollTop = scroll;
  updateNoticeClocks_();
}
function updateNoticeClocks_(){document.querySelectorAll('.noticeClock[data-to]').forEach(n=>{const diff=Date.parse(n.dataset.to)-Date.now();if(!Number.isFinite(diff)){n.textContent='Chưa có thời gian hợp lệ';return;}if(diff<=0){n.textContent='Đã đến thời gian sự kiện';return;}let sec=Math.floor(diff/1000),d=Math.floor(sec/86400);sec%=86400;const h=Math.floor(sec/3600);sec%=3600;n.textContent=`Còn ${d} ngày ${h} giờ ${Math.floor(sec/60)} phút ${sec%60} giây`;});}
