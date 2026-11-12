/* LỚP 2505QLNH V16 — Trung tâm thông báo riêng cho tài khoản đã đăng nhập.
 * Gateway authorizes read. D1 stores per-account read/hidden state with local offline fallback. */
(()=>{'use strict';
 const list=document.getElementById('nuFeedList'),count=document.getElementById('nuBellCount');
 if(!list||!window.QLNH)return;
 const user=String(window.QLNH_STUDENT?.mssv||'device'),key='qlnh_inbox_state_v16_'+user;
 const text=(t)=>String(t??'');const escape=(s)=>text(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let items=[],local={read:[],hidden:[]};
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');local={read:Array.isArray(saved.read)?saved.read:[],hidden:Array.isArray(saved.hidden)?saved.hidden:[]};}catch(e){}
 function persist(){try{localStorage.setItem(key,JSON.stringify({read:local.read.slice(-500),hidden:local.hidden.slice(-500)}));}catch(e){}}
 async function syncState(id,state){try{await window.QLNH.request('/api/notification-state',{method:'POST',data:{id,state}});}catch(e){console.warn('Chưa đồng bộ trạng thái thông báo',e);}}
 async function initState(){try{const res=await window.QLNH.request('/api/notification-state');if(res.success&&Array.isArray(res.items)){
   // Merge offline device actions instead of silently discarding them after reconnect.
   const entries=new Map(res.items.map(x=>[x.id,x.state]));
   local.read.forEach(id=>{if(!entries.has(id))entries.set(id,'read')});
   local.hidden.forEach(id=>{if(!entries.has(id))entries.set(id,'hidden')});
   local.read=[...entries].filter(([,state])=>state==='read').map(([id])=>id);
   local.hidden=[...entries].filter(([,state])=>state==='hidden').map(([id])=>id);
   persist();
 }}catch(e){console.warn('Sử dụng trạng thái thông báo lưu trên thiết bị',e);}}
 const labels={qlnh_news_feed:'Bản tin',qlnh_notice:'Thông báo chung',qlnh_news_lop:'Lớp',qlnh_news_doan:'Chi đoàn',qlnh_news_hoi:'Chi hội',qlnh_activity:'Hoạt động',qlnh_reminder:'Nhắc lịch',qlnh_congress_doan:'Đại hội Chi đoàn',qlnh_congress_hoi:'Đại hội Chi hội',qlnh_election:'Bầu cử'};
 function selected(){try{return JSON.parse(localStorage.getItem('qlnh_device_push_choices')||'{}');}catch(e){return {}}}
 function visible(){return items.filter(n=>!local.hidden.includes(n.id));}
 function render(){const shown=visible(),unread=shown.filter(x=>!local.read.includes(x.id)).length;
   count.textContent=unread>99?'99+':String(unread);count.hidden=!unread;list.replaceChildren();
   if(!shown.length){const p=document.createElement('p');p.className='loadingLine';p.textContent='Chưa có thông báo nào để hiển thị.';list.append(p);return;}
   shown.forEach(n=>{
     const article=document.createElement('article');article.className='nuInboxItem'+(local.read.includes(n.id)?'':' nuUnread');
     const head=document.createElement('div');head.className='nuInboxHead';
     const title=document.createElement('strong');title.textContent=n.title;
     const meta=document.createElement('small');const d=new Date(n.time);meta.textContent=(labels[n.target]||'Thông báo')+' · '+(Number.isFinite(d.getTime())?d.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'');
     head.append(title,meta);
     const body=document.createElement('p');body.textContent=n.body;
     const actions=document.createElement('div');actions.className='nuInboxActions';
     const open=document.createElement('button');open.type='button';open.textContent='Xem chi tiết';open.onclick=()=>{if(!local.read.includes(n.id))local.read.push(n.id);persist();syncState(n.id,'read');render();const u=new URL(n.url,location.origin);if(u.origin===location.origin)location.href=u.href;};
     const mark=document.createElement('button');mark.type='button';mark.textContent=local.read.includes(n.id)?'Đánh dấu chưa đọc':'Đã đọc';mark.className='nuSecondary';mark.onclick=()=>{if(local.read.includes(n.id))local.read=local.read.filter(x=>x!==n.id);else local.read.push(n.id);persist();syncState(n.id,local.read.includes(n.id)?'read':'unread');render();};
     const hide=document.createElement('button');hide.type='button';hide.textContent='Xóa khỏi danh sách';hide.className='nuSecondary';hide.onclick=()=>{local.hidden.push(n.id);persist();syncState(n.id,'hidden');render();};
     actions.append(open,mark,hide);article.append(head,body,actions);list.append(article);
   });
 }
 async function refresh(){try{const res=await window.QLNH.data('notificationFeed',{limit:100});if(res.success&&Array.isArray(res.items)){items=res.items;render();}}
  catch(e){if(!items.length){list.textContent='Không tải được thông báo: '+(e.message||'Lỗi kết nối');}}}
 const markAll=document.getElementById('nuMarkAll');if(markAll)markAll.onclick=()=>{const ids=visible().map(x=>x.id);ids.forEach(id=>{if(!local.read.includes(id))local.read.push(id);});persist();render();if(ids.length)window.QLNH.request('/api/notification-state/batch',{method:'POST',data:{ids:ids.slice(0,100),state:'read'}}).catch(e=>console.warn('Chưa đồng bộ trạng thái đã đọc',e));};
 const filter=document.getElementById('nuShowPrefs');if(filter)filter.onclick=()=>nav('pushPrefs');
 window.addEventListener('qlnh-prefs-changed',render);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 initState().then(refresh);setInterval(()=>{if(!document.hidden)refresh();},60000);
})();
