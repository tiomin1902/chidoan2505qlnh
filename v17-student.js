/* LỚP 2505QLNH V17.0 – student-only exams and library. No guest fetch. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const authorized=()=>!window.QLNH_GUEST&&!!window.QLNH?.authToken;
 const api=(p,o)=>window.QLNH.request('/api/v17/'+p,o||{});
 const viDate=s=>{if(!s)return 'Chưa cập nhật';const d=new Date(s);return Number.isNaN(d.valueOf())?esc(s):d.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'medium',timeStyle:'short'});};
 const state={exams:[],reports:[],docs:[],groups:['Học tập','Lớp','Chi đoàn','Chi hội','Nhà trường'],cat:'Tất cả',search:'',examTab:'upcoming',doc:null};
 const setStatus=(id,msg)=>{const el=$(id);if(el)el.textContent=msg;};
 async function loadExams(){if(!authorized())return;try{const [e,r]=await Promise.all([api('exams'),api('reports')]);state.exams=e.items||[];state.reports=r.items||[];renderExams();renderUpcoming();}catch(e){setStatus('v17ExamsStatus',e.message||'Không tải được Lịch thi');}}
 function examTime(x){return x?.personal?.shift?.start||x?.commonDate||'';}
 function badge(x){if(x.personal?.confirmed)return '<span class="v17-tag success">Đã phân ca cá nhân</span>';if(x.personal?.sbd)return '<span class="v17-tag warn">Đã có SBD · chờ ca</span>';return '<span class="v17-tag">Lịch chung · chưa xác nhận tham gia</span>';}
 function nextExams(){const now=Date.now()-86400000;return state.exams.filter(x=>!examTime(x)||!Number.isFinite(Date.parse(examTime(x)))||Date.parse(examTime(x))>now).sort((a,b)=>Number(!!b.personal?.confirmed)-Number(!!a.personal?.confirmed)||((Date.parse(examTime(a))||Infinity)-(Date.parse(examTime(b))||Infinity)));}
 function renderUpcoming(){const box=$('v17Upcoming');if(!box)return;const next=nextExams()[0];box.hidden=!authorized()||!next;if(!next)return;box.innerHTML='<div class="v17-kicker">LỊCH THI SẮP TỚI</div><h3>'+esc(next.course)+'</h3>'+badge(next)+'<p>'+esc(next.personal?.confirmed?'Ca thi của bạn: '+viDate(next.personal.shift.start):'Lịch chung: '+viDate(next.commonDate))+'</p><button type="button" data-v17-go-exams>Xem lịch thi →</button>';box.querySelector('button').onclick=()=>window.nav?.('exams');}
 function selectExams(){const now=Date.now(),list=state.exams.filter(x=>{const t=Date.parse(examTime(x));if(state.examTab==='past')return Number.isFinite(t)&&t<now-86400000;if(state.examTab==='waiting')return !x.personal?.confirmed;return !Number.isFinite(t)||t>=now-86400000;});return list;}
 function renderExams(){
 const box=$('v17ExamsList');if(!box)return;
 const list=selectExams();
 const card=x=>`<article class="v17-card" data-qlnh-exam-id="${esc(x.id)}"><div class="v17-kicker">${esc(x.type||'Kỳ thi')} · ${x.dateStatus==='official'?'Chính thức':'Dự kiến'}</div><h3>${esc(x.course)}</h3>${badge(x)}<p><strong>Lịch chung:</strong> ${viDate(x.commonDate||x.assignmentDueAt)}</p>${x.personal?.sbd?`<div class="v17-sbd">SBD <strong>${esc(x.personal.sbd)}</strong></div>`:x.personal?.revoked?.sbd?'<span class="v17-tag warn">SBD đang được đính chính</span>':''}<div class="v17-meta"><span><b>Phòng:</b> ${esc(x.personal?.revoked?.room?'Đang đính chính':x.personal?.room||'Đang cập nhật')}</span><span><b>Ca:</b> ${esc(x.personal?.revoked?.shift?'Đang đính chính':x.personal?.shift?.label||'Chưa phân ca')}</span><span><b>Giờ cá nhân:</b> ${x.personal?.confirmed?viDate(x.personal.shift.start):'Chờ phân công'}</span></div>${x.notes?`<p>${esc(x.notes)}</p>`:''}${x.reportOpen?`<button type="button" data-exam-report="${esc(x.id)}">Báo thiếu hoặc sai thông tin</button>`:''}</article>`;
 const groups=new Map(),singles=[];
 for(const x of list){if(x.groupId&&x.groupName){if(!groups.has(x.groupId))groups.set(x.groupId,{name:x.groupName,items:[]});groups.get(x.groupId).items.push(x);}else singles.push(x);}
 box.innerHTML=list.length?[...groups.values()].map(g=>`<section class="v19-student-group"><div class="v19-student-heading"><span>KỲ THI LỚN</span><h2>${esc(g.name)}</h2><p>${g.items.length} môn thi đã công bố</p></div><div class="v19-student-grid">${g.items.map(card).join('')}</div></section>`).join('')+(singles.length?`<section class="v19-student-group"><div class="v19-student-heading"><span>LỊCH THI RIÊNG</span><h2>Môn thi độc lập</h2></div><div class="v19-student-grid">${singles.map(card).join('')}</div></section>`:''):'<p class="v17-empty">Chưa có lịch thi phù hợp.</p>';
 box.querySelectorAll('[data-exam-report]').forEach(b=>b.onclick=()=>reportForm(b.dataset.examReport));
 const history=$('v17Reports');if(history){const statusLabel={new:'Chưa xử lý',verifying:'Đang xác minh',need_more:'Chờ bổ sung',resolved:'Đã giải quyết'};
 history.innerHTML=state.reports.map(r=>`<div class="v17-report"><b>${esc(r.type)} · ${esc(statusLabel[r.status]||r.status)}</b><p>${esc(r.content)}</p>${r.reply?`<p><strong>Admin:</strong> ${esc(r.reply)}</p>`:''}</div>`).join('')||'<p class="v17-muted">Chưa có phản ánh nào.</p>';}
 }
 function reportForm(examId){const root=$('v17ReportForm');if(!root)return;root.hidden=false;root.innerHTML=`<h3>Gửi phản ánh lịch thi</h3><label>Vấn đề<select id="v17ReportType"><option value="missing">Thiếu SBD / chưa có phân công</option><option value="wrong">SBD, phòng hoặc ca không chính xác</option><option value="other">Vấn đề khác</option></select></label><label>Mô tả<textarea id="v17ReportContent" rows="3" maxlength="1500" placeholder="Mô tả vấn đề..."></textarea></label><div class="v17-form-actions"><button type="button" id="v17ReportSubmit">Gửi phản ánh</button><button type="button" id="v17ReportCancel" class="v17-secondary">Đóng</button></div><p id="v17ReportNotice" role="status"></p>`;root.scrollIntoView({behavior:'smooth',block:'center'});
 $('v17ReportCancel').onclick=()=>root.hidden=true;
 $('v17ReportSubmit').onclick=async()=>{const btn=$('v17ReportSubmit');btn.disabled=true;try{await api('report',{method:'POST',data:{examId,type:$('v17ReportType').value,content:$('v17ReportContent').value}});root.hidden=true;await loadExams();}catch(e){setStatus('v17ReportNotice',e.message);}finally{btn.disabled=false;}};
 }
 async function loadDocs(){if(!authorized())return;try{const r=await api('docs');state.docs=r.items||[];renderDocs();}catch(e){setStatus('v17DocsStatus',e.message||'Không tải được thư viện');}}
 function renderDocs(){const groups=$('v17DocGroups'),box=$('v17DocList');if(!groups||!box)return;const cats=['Tất cả',...state.groups];groups.innerHTML=cats.map(x=>`<button type="button" data-v17-category="${esc(x)}" class="${x===state.cat?'selected':''}">${esc(x)}</button>`).join('');groups.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.cat=b.dataset.v17Category;renderDocs();});
 const q=state.search.toLowerCase(),rows=state.docs.filter(x=>(state.cat==='Tất cả'||x.group===state.cat)&&(!q||[x.title,x.group,x.category,x.description,x.course,x.issuer].join(' ').toLowerCase().includes(q)));
 box.innerHTML=rows.length?rows.map(x=>`<article class="v17-docitem"><div class="v17-docicon" aria-hidden="true">▤</div><div><div class="v17-kicker">${esc(x.group)} · ${esc(x.category)}</div><h3>${esc(x.title)}</h3><p>${esc(x.course||x.issuer||'')}${x.archived?' · Tài liệu lưu trữ':''}</p></div><button type="button" data-v17-docid="${esc(x.id)}" aria-label="Mở ${esc(x.title)}">Xem →</button></article>`).join(''):'<p class="v17-empty">Không có tài liệu phù hợp hoặc bạn chưa được cấp quyền.</p>';
 box.querySelectorAll('[data-v17-docid]').forEach(b=>b.onclick=()=>openDoc(b.dataset.v17Docid));}
 async function rawFile(doc,mode){const origin=String(window.QLNH_GATEWAY_URL||'').replace(/\/$/,''); // Authenticated Worker only, never Apps Script direct.
 if(!/^https:\/\//.test(origin))throw Error('Chưa xác định URL Worker cho tải file.');
 const res=await fetch(origin+'/api/v17/doc-file?id='+encodeURIComponent(doc.id)+'&mode='+encodeURIComponent(mode),{headers:{authorization:'Bearer '+window.QLNH.authToken},cache:'no-store'});
 if(!res.ok){const data=await res.json().catch(()=>({}));throw Error(data.message||'Không thể mở tài liệu');}
 return res.blob();
 }
 async function openDoc(id,opts={}){const area=$('v17DocDetail');if(!area||!authorized())return;try{const r=await api('doc?id='+encodeURIComponent(id));const d=r.item;if(!r?.success||!d)throw Error(r?.message||'Tài liệu không khả dụng hoặc bạn không có quyền xem.');state.doc=d;area.hidden=false;area.innerHTML=`<div class="v17-kicker">${esc(d.group)} · ${esc(d.category)}</div><h2>${esc(d.title)}</h2><p>${esc(d.description||'')}</p>${d.archived?'<p class="v17-tag warn">Tài liệu lưu trữ</p>':''}<div class="v17-meta"><span><b>Nguồn ban hành:</b> ${esc(d.issuer||'Chưa cung cấp')}</span><span><b>Số, ký hiệu:</b> ${esc(d.number||'Không có')}</span><span><b>Học phần:</b> ${esc(d.course||'Không áp dụng')}</span><span><b>Tình trạng hiệu lực:</b> ${esc(d.effect||'Chưa xác định')}</span></div><div class="v17-form-actions">${d.preview?'<button type="button" id="v17Preview">Xem trước</button>':''}${d.download?'<button type="button" id="v17Download">Tải về</button>':''}<button type="button" class="v17-secondary" id="v17DocClose">Đóng</button></div><div id="v17FileArea" aria-live="polite"></div>`;
 $('v17DocClose').onclick=()=>{area.hidden=true;area.replaceChildren();};if(d.preview)$('v17Preview').onclick=()=>showFile(d,'preview');if(d.download)$('v17Download').onclick=()=>showFile(d,'download');area.scrollIntoView({behavior:'smooth',block:'start'});
 if(opts.preview&&d.preview)await showFile(d,'preview');
 }catch(e){setStatus('v17DocsStatus',e.message);}}
 async function showFile(d,mode){
 const zone=$('v17FileArea');zone.textContent='Đang mở file...';
 try{
  const blob=await rawFile(d,mode);
  if(mode==='preview'){
   zone.textContent='';
   if(typeof window.QLNH_V192_VIEW_DOCUMENT!=='function')throw Error('Trình xem tài liệu chưa tải được. Vui lòng tải lại ứng dụng.');
   await window.QLNH_V192_VIEW_DOCUMENT(blob,{title:d.title,mime:blob.type});
   return;
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;
  const suffix=({'application/pdf':'.pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx','application/vnd.openxmlformats-officedocument.presentationml.presentation':'.pptx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx','image/png':'.png','image/jpeg':'.jpg','text/plain':'.txt'})[blob.type]||'';
  a.download=d.title.replace(/[\\/:*?"<>|]/g,'_').slice(0,100)+(suffix&&!d.title.toLowerCase().endsWith(suffix)?suffix:'');
  document.body.append(a);a.click();a.remove();
  zone.textContent='Đã yêu cầu tải file.';
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(e){zone.textContent=e.message||'Không thể mở file';}
 }
 // One authenticated document ID from push / notification center / shared link.
 window.QLNH_V192_OPEN_DOC=(id,opts)=>openDoc(id,opts||{});
 // Focus exam after loading private schedule without disclosing another student's assignments.
 window.QLNH_V192_FOCUS_EXAM=async id=>{
  if(!authorized())return;
  await loadExams();
  const card=[...document.querySelectorAll('[data-qlnh-exam-id]')].find(x=>x.dataset.qlnhExamId===id);
  if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('v192-highlight');setTimeout(()=>card.classList.remove('v192-highlight'),2400);}
  else setStatus('v17ExamsStatus','Môn thi này chưa được công bố hoặc không còn khả dụng.');
 };
 function onPage(page){if(!authorized())return;if(page==='exams')loadExams();if(page==='documents')loadDocs();if(page==='home')loadExams();}
 window.QLNH_V17_PAGE=onPage;
 const setup=()=>{document.querySelectorAll('[data-v17-examtab]').forEach(b=>b.onclick=()=>{state.examTab=b.dataset.v17Examtab;document.querySelectorAll('[data-v17-examtab]').forEach(x=>x.classList.toggle('selected',x===b));renderExams();});$('v17DocSearch')?.addEventListener('input',e=>{state.search=e.target.value.trim();renderDocs();});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
 window.QLNH_V17_REFRESH=()=>{if(authorized()){loadExams();loadDocs();}};
})();
