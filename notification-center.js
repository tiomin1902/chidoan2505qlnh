/* 2505QLNH V28: account inbox, shared card design across themes.
 * Preserves API endpoints, authenticated data, per-account read/hidden sync,
 * chronological ordering, and safe deep linking from the previous V26.1 module.
 */
(()=>{'use strict';
 const list=document.getElementById('nuFeedList');
 const count=document.getElementById('nuBellCount');
 const summary=document.getElementById('nuInboxSummary');
 if(!list||!window.QLNH)return;
 const user=String(window.QLNH_STUDENT?.mssv||'device');
 const key='qlnh_inbox_state_v16_'+user;
 const txt=x=>String(x??'');
 const types={qlnh_news_feed:'Bản tin',qlnh_notice:'Thông báo chung',qlnh_news_lop:'Lớp',
  qlnh_news_doan:'Chi đoàn',qlnh_news_hoi:'Chi hội',qlnh_activity:'Hoạt động',
  qlnh_attendance:'Điểm danh',qlnh_reminder:'Nhắc hẹn',qlnh_congress_doan:'Chi đoàn',
  qlnh_congress_hoi:'Chi hội',qlnh_election:'Bầu cử',doc:'Tài liệu',doc_batch:'Tài liệu',
  withdrawn:'Tài liệu',exam:'Lịch thi',exam_batch:'Lịch thi',exam_group:'Kỳ thi',
  reminder:'Nhắc hẹn',report:'Phản ánh thi'};
 const svgPaths={
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
  camera:'<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3"/><path d="m8 6 1-2h6l1 2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  file:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8m-8 4h8m-8 4h5"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>'};
 function icon(kind){
  const n=document.createElementNS('http://www.w3.org/2000/svg','svg');
  n.setAttribute('class','nuInboxIcon');n.setAttribute('width','20');n.setAttribute('height','20');
  n.setAttribute('viewBox','0 0 24 24');n.setAttribute('fill','none');
  n.setAttribute('stroke','currentColor');n.setAttribute('stroke-width','1.8');
  n.setAttribute('stroke-linecap','round');n.setAttribute('stroke-linejoin','round');
  n.setAttribute('aria-hidden','true');n.innerHTML=svgPaths[kind]||svgPaths.bell;return n;
 }
 const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=txt(content);return n;};
 let items=[],expanded='',menuFor='',query='',filter='all',local={read:[],hidden:[]};
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');local={read:Array.isArray(saved.read)?saved.read:[],hidden:Array.isArray(saved.hidden)?saved.hidden:[]};}catch(_){}
 const read=id=>local.read.includes(id),hidden=id=>local.hidden.includes(id);
 function persist(){try{localStorage.setItem(key,JSON.stringify({read:local.read.slice(-500),hidden:local.hidden.slice(-500)}));}catch(_){}}
 async function syncState(id,state){try{await window.QLNH.request('/api/notification-state',{method:'POST',data:{id,state}});}catch(e){console.warn('Chưa đồng bộ trạng thái thông báo:',e);}}
 async function initState(){try{
  const r=await window.QLNH.request('/api/notification-state');
  if(r.success&&Array.isArray(r.items)){
   const server=new Map(r.items.map(x=>[x.id,x.state]));
   local.read.forEach(id=>{if(!server.has(id))server.set(id,'read');});
   local.hidden.forEach(id=>{if(!server.has(id))server.set(id,'hidden');});
   local.read=[...server].filter(([,state])=>state==='read').map(([id])=>id);
   local.hidden=[...server].filter(([,state])=>state==='hidden').map(([id])=>id);persist();
  }
 }catch(e){console.warn('Dùng trạng thái thông báo trên thiết bị:',e);}}
 function sorted(){return items.filter(n=>!hidden(n.id)).slice().sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));}
 function dateTime(time){try{
  const d=new Date(time);if(!Number.isFinite(d.getTime()))return '';
  return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
 }catch(_){return '';}}
 function setRead(id,yes){if(yes&&!read(id))local.read.push(id);if(!yes)local.read=local.read.filter(x=>x!==id);persist();syncState(id,yes?'read':'unread');}
 function updateCount(){const n=sorted().filter(x=>!read(x.id)).length;if(count){count.textContent=n>99?'99+':String(n);count.hidden=n===0;}if(summary)summary.textContent=sorted().length+' thông báo · '+n+' chưa đọc';}
 function resolveTarget(url){
  try{
   const u=new URL(url,location.href),q=u.searchParams;
   if(q.has('attendance'))return 'Mở đợt điểm danh';
   if(q.has('activity')||q.has('series'))return 'Xem hoạt động';
   if(q.has('qlnh_doc'))return 'Xem tài liệu';
   if(q.has('qlnh_exam')||q.get('v17')==='exams')return 'Xem lịch thi';
   if(q.has('fund'))return 'Xem quỹ lớp';
   if(q.has('results'))return 'Xem kết quả';
   return 'Xem nội dung liên quan';
  }catch(_){return 'Xem nội dung liên quan';}
 }
 function render(){
  const shown=sorted();updateCount();list.replaceChildren();
  const matched=shown.filter(n=>(filter==='all'||(filter==='read')===read(n.id))&&(!query||txt(n.title+' '+n.body).toLocaleLowerCase('vi').includes(query)));
  if(!matched.length){list.append(el('p','nuInboxEmpty',shown.length?'Không có thông báo phù hợp.':'Bạn chưa có thông báo nào.'));return;}
  for(const n of matched){
   const unread=!read(n.id);const article=el('article','nuInboxItem'+(unread?' nuUnread':'')+(expanded===n.id?' is-open':'')+(menuFor===n.id?' has-open-menu':''));article.dataset.id=n.id;
   const button=el('button','nuInboxHeadButton');button.type='button';button.setAttribute('aria-expanded',String(expanded===n.id));button.setAttribute('aria-label',txt(n.title)+' – '+(expanded===n.id?'thu gọn':'mở để đọc'));
   const marker=el('span','nuInboxMarker');marker.setAttribute('aria-hidden','true');
   const k=/attendance/i.test(n.target)?'camera':/activity|exam|reminder/i.test(n.target)?'calendar':/doc|news|notice/i.test(n.target)?'file':'bell';marker.append(icon(k));
   const head=el('span','nuInboxHead');head.append(el('strong','nuInboxTitle',n.title));
   const meta=el('span','nuInboxMeta');meta.append(el('span','nuInboxCategory',types[n.target]||'Thông báo'));
   const when=dateTime(n.time);if(when)meta.append(el('span','nuInboxDate',when));head.append(meta);
   const caret=el('span','nuInboxCaret');caret.setAttribute('aria-hidden','true');caret.append(icon('chevron'));
   button.append(marker,head);if(unread)button.append(el('span','nuInboxUnreadDot'));button.append(caret);
   const body=el('div','nuInboxBody');body.hidden=expanded!==n.id;
   body.append(el('p','nuInboxMessage',n.body||'Không có nội dung bổ sung.'));
   const footer=el('div','nuInboxFooter');
   if(n.url){
    const link=el('button','nuInboxPrimary',resolveTarget(n.url));link.type='button';
    link.onclick=async()=>{
     if(!read(n.id)){setRead(n.id,true);updateCount();}
     try{const ok=await window.QLNH_V192_OPEN_NOTIFICATION?.(n.url);if(!ok)alert('Đường dẫn liên quan không hợp lệ hoặc bạn chưa có quyền truy cập.');}
     catch(e){console.warn('Không thể mở nội dung thông báo:',e);alert('Không thể mở nội dung liên quan. Vui lòng thử lại.');}
    };
    footer.append(link);
   }
   // Separate action from the disclosure button; do not nest buttons or force a text label into 40px.
   const headRow=el('div','nuInboxHeadRow');
   const more=el('div','nuInboxMore');
   const toggle=el('button','nuInboxMoreToggle','⋯');toggle.type='button';
   toggle.setAttribute('aria-label','Tùy chọn thông báo');toggle.title='Tùy chọn thông báo';
   toggle.setAttribute('aria-haspopup','menu');toggle.setAttribute('aria-expanded',String(menuFor===n.id));
   const choices=el('div','nuInboxMoreChoices');choices.setAttribute('role','menu');choices.hidden=menuFor!==n.id;
   const mark=el('button','nuInboxAux',unread?'Đánh dấu đã đọc':'Đánh dấu chưa đọc');mark.type='button';mark.setAttribute('role','menuitem');
   mark.onclick=(event)=>{event.stopPropagation();setRead(n.id,unread);menuFor='';render();};
   const hide=el('button','nuInboxAux nuInboxHide','Ẩn khỏi danh sách');hide.type='button';hide.setAttribute('role','menuitem');
   hide.onclick=(event)=>{event.stopPropagation();if(!hidden(n.id))local.hidden.push(n.id);persist();syncState(n.id,'hidden');if(expanded===n.id)expanded='';menuFor='';render();};
   choices.append(mark,hide);
   toggle.onclick=(event)=>{
    event.stopPropagation();menuFor=menuFor===n.id?'':n.id;render();
    const open=menuFor===n.id;
    const current=list.querySelector('.nuInboxItem[data-id="'+CSS.escape(n.id)+'"] .nuInboxMoreToggle');
    if(open){
     requestAnimationFrame(()=>{
      const panel=current?.nextElementSibling;
      if(panel){panel.classList.toggle('flip-up',panel.getBoundingClientRect().bottom>window.innerHeight-8&&current.getBoundingClientRect().top>170);}
     });
    }
    current?.focus({preventScroll:true});
   };
   more.append(toggle,choices);headRow.append(button,more);
   button.onclick=()=>{
    expanded=expanded===n.id?'':n.id;menuFor='';
    if(expanded&&!read(n.id)){setRead(n.id,true);}
    render();
   };
   article.append(headRow,body);list.append(article);
  }
 }
 document.addEventListener('click',event=>{
  if(menuFor&&!event.target.closest('.nuInboxMore')){menuFor='';render();}
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuFor){event.preventDefault();const id=menuFor;menuFor='';render();const t=[...list.querySelectorAll('.nuInboxItem')].find(x=>x.dataset.id===id)?.querySelector('.nuInboxMoreToggle');t?.focus({preventScroll:true});}
 });
 async function refresh(){try{
  const r=await window.QLNH.data('notificationFeed',{limit:100});
  if(r.success&&Array.isArray(r.items)){items=r.items;render();}
 }catch(e){if(!items.length)list.textContent='Không tải được thông báo. Vui lòng kiểm tra kết nối.';}}
 const markAll=document.getElementById('nuMarkAll');if(markAll)markAll.onclick=()=>{
  const ids=sorted().map(x=>x.id);local.read=[...new Set([...local.read,...ids])];persist();render();
  for(let i=0;i<ids.length;i+=100)window.QLNH.request('/api/notification-state/batch',{method:'POST',data:{ids:ids.slice(i,i+100),state:'read'}}).catch(e=>console.warn('Chưa đồng bộ trạng thái đọc:',e));
 };
 const prefs=document.getElementById('nuShowPrefs');if(prefs)prefs.onclick=()=>window.nav?.('pushPrefs');
 const search=document.getElementById('nuInboxSearch');if(search)search.oninput=()=>{query=search.value.trim().toLocaleLowerCase('vi');render();};
 const select=document.getElementById('nuInboxFilter');if(select)select.onchange=()=>{filter=select.value;render();};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 initState().then(refresh);setInterval(()=>{if(!document.hidden)refresh();},60000);
})();
