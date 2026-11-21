/* LỚP 2505QLNH — V26.1: unified compact inbox.
 * Preserves existing API endpoints, read/hidden account state and notification navigation.
 * Default is title-only; tapping a row expands exactly one message.
 */
(()=>{'use strict';
 const list=document.getElementById('nuFeedList');
 const count=document.getElementById('nuBellCount');
 if(!list||!window.QLNH)return;
 const user=String(window.QLNH_STUDENT?.mssv||'device');
 const key='qlnh_inbox_state_v16_'+user;
 const txt=value=>String(value??'');
 const labels={
   qlnh_news_feed:'Bản tin',qlnh_notice:'Thông báo chung',qlnh_news_lop:'Lớp',
   qlnh_news_doan:'Chi đoàn',qlnh_news_hoi:'Chi hội',qlnh_activity:'Hoạt động',
   qlnh_attendance:'Điểm danh',qlnh_reminder:'Nhắc lịch',qlnh_congress_doan:'Chi đoàn',
   qlnh_congress_hoi:'Chi hội',qlnh_election:'Bầu cử',doc:'Tài liệu',doc_batch:'Tài liệu',
   withdrawn:'Tài liệu',exam:'Lịch thi',exam_batch:'Lịch thi',exam_group:'Kỳ thi',
   reminder:'Nhắc thi',report:'Phản ánh thi'
 };
 let items=[], expanded='', query='', stateFilter='all';
 let local={read:[],hidden:[]};
 try{
   const saved=JSON.parse(localStorage.getItem(key)||'{}');
   local={read:Array.isArray(saved.read)?saved.read:[],hidden:Array.isArray(saved.hidden)?saved.hidden:[]};
 }catch(_){}
 const hasRead=id=>local.read.includes(id);
 const hasHidden=id=>local.hidden.includes(id);
 function persist(){try{localStorage.setItem(key,JSON.stringify({read:local.read.slice(-500),hidden:local.hidden.slice(-500)}));}catch(_){}}
 async function syncState(id,state){
   try{await window.QLNH.request('/api/notification-state',{method:'POST',data:{id,state}});}
   catch(e){console.warn('Chưa đồng bộ trạng thái thông báo:',e);}
 }
 async function initState(){
   try{
     const result=await window.QLNH.request('/api/notification-state');
     if(result.success&&Array.isArray(result.items)){
       const server=new Map(result.items.map(x=>[x.id,x.state]));
       local.read.forEach(id=>{if(!server.has(id))server.set(id,'read');});
       local.hidden.forEach(id=>{if(!server.has(id))server.set(id,'hidden');});
       local.read=[...server].filter(([,v])=>v==='read').map(([id])=>id);
       local.hidden=[...server].filter(([,v])=>v==='hidden').map(([id])=>id);
       persist();
     }
   }catch(e){console.warn('Dùng trạng thái đã lưu trên thiết bị:',e);}
 }
 function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=txt(content);return node;}
 function sorted(){return items.filter(x=>!hasHidden(x.id)).slice().sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));}
 function formatTime(value){
   try{return window.QLNH_FORMAT_TIME?.(value,'')||'';}
   catch(_){return '';}
 }
 function setRead(id,value){
   if(value&&!hasRead(id))local.read.push(id);
   if(!value)local.read=local.read.filter(x=>x!==id);
   persist();syncState(id,value?'read':'unread');
 }
 function closeOtherCards(){
   for(const card of list.querySelectorAll('.nuInboxItem')){
     const open=card.dataset.id===expanded;
     card.classList.toggle('is-open',open);
     const body=card.querySelector('.nuInboxBody');if(body)body.hidden=!open;
     const button=card.querySelector('.nuInboxHeadButton');if(button)button.setAttribute('aria-expanded',String(open));
   }
 }
 function updateBell(){
   if(!count)return;
   const n=sorted().filter(x=>!hasRead(x.id)).length;
   count.textContent=n>99?'99+':String(n);count.hidden=!n;
 }
 function render(){
   const shown=sorted();updateBell();list.replaceChildren();
   const matches=shown.filter(n=>
     (stateFilter==='all'||(stateFilter==='read')===hasRead(n.id))&&
     (!query||txt(n.title+' '+n.body).toLocaleLowerCase('vi').includes(query))
   );
   if(!matches.length){
     list.append(el('p','nuInboxEmpty',shown.length?'Không có thông báo phù hợp.':'Bạn chưa có thông báo nào.'));
     return;
   }
   for(const n of matches){
     const isUnread=!hasRead(n.id);
     const article=el('article','nuInboxItem'+(isUnread?' nuUnread':''));
     article.dataset.id=n.id;
     const headButton=el('button','nuInboxHeadButton');headButton.type='button';
     headButton.setAttribute('aria-expanded',String(expanded===n.id));
     headButton.setAttribute('aria-label',txt(n.title)+' – nhấn để xem thông báo');
     const marker=el('span','nuInboxMarker');marker.setAttribute('aria-hidden','true');marker.textContent=isUnread?'●':'✓';
     const head=el('span','nuInboxHead');
     head.append(el('strong','nuInboxTitle',n.title));
     const meta=el('span','nuInboxMeta');
     meta.append(el('span','nuInboxCategory',labels[n.target]||'Thông báo'));
     const date=formatTime(n.time);
     if(date)meta.append(el('span','nuInboxDate',date));
     head.append(meta);
     const caret=el('span','nuInboxCaret','⌄');caret.setAttribute('aria-hidden','true');
     headButton.append(marker,head,caret);
     const body=el('div','nuInboxBody');body.hidden=expanded!==n.id;
     const p=el('p','nuInboxMessage',n.body||'Không có nội dung bổ sung.');body.append(p);
     const footer=el('div','nuInboxFooter');
     if(n.url){
       const open=el('button','nuInboxPrimary','Xem nội dung liên quan');open.type='button';
       open.onclick=()=>{
         if(!hasRead(n.id)){setRead(n.id,true);updateBell();}
         Promise.resolve(window.QLNH_V192_OPEN_NOTIFICATION?.(n.url))
           .then(ok=>{if(!ok)console.warn('Liên kết thông báo không hợp lệ');})
           .catch(e=>console.warn('Không thể mở liên kết thông báo:',e));
       };
       footer.append(open);
     }
     const more=el('details','nuInboxMore');
     const summary=el('summary','nuInboxMoreToggle','Tùy chọn ···');
     summary.setAttribute('aria-label','Các tùy chọn cho thông báo '+txt(n.title));
     const choices=el('div','nuInboxMoreChoices');
     const mark=el('button','nuInboxAux',hasRead(n.id)?'Đánh dấu chưa đọc':'Đánh dấu đã đọc');mark.type='button';
     mark.onclick=()=>{setRead(n.id,!hasRead(n.id));render();};
     const hide=el('button','nuInboxAux nuInboxHide','Ẩn khỏi danh sách');hide.type='button';
     hide.onclick=()=>{if(!hasHidden(n.id))local.hidden.push(n.id);persist();syncState(n.id,'hidden');if(expanded===n.id)expanded='';render();};
     choices.append(mark,hide);more.append(summary,choices);footer.append(more);body.append(footer);
     headButton.onclick=()=>{
       expanded=expanded===n.id?'':n.id;
       if(expanded&&!hasRead(n.id)){
         setRead(n.id,true);
         article.classList.remove('nuUnread');
         marker.textContent='✓';
         mark.textContent='Đánh dấu chưa đọc';
         updateBell();
       }
       closeOtherCards();
     };
     article.append(headButton,body);list.append(article);
   }
 }
 async function refresh(){
   try{
     const r=await window.QLNH.data('notificationFeed',{limit:100});
     if(r.success&&Array.isArray(r.items)){items=r.items;render();}
   }catch(e){if(!items.length)list.textContent='Không tải được thông báo: '+(e.message||'Lỗi kết nối');}
 }
 const markAll=document.getElementById('nuMarkAll');
 if(markAll)markAll.onclick=()=>{
   const ids=sorted().map(x=>x.id);local.read=[...new Set([...local.read,...ids])];persist();render();
   for(let i=0;i<ids.length;i+=100){window.QLNH.request('/api/notification-state/batch',{
     method:'POST',data:{ids:ids.slice(i,i+100),state:'read'}
   }).catch(e=>console.warn('Chưa đồng bộ trạng thái đã đọc:',e));}
 };
 const prefsButton=document.getElementById('nuShowPrefs');
 if(prefsButton)prefsButton.onclick=()=>window.nav?.('pushPrefs');
 const search=document.getElementById('nuInboxSearch');
 const filter=document.getElementById('nuInboxFilter');
 if(search)search.oninput=()=>{query=search.value.trim().toLocaleLowerCase('vi');render();};
 if(filter)filter.onchange=()=>{stateFilter=filter.value;render();};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 initState().then(refresh);
 setInterval(()=>{if(!document.hidden)refresh();},60000);
})();
