/* 2505QLNH V25 — Thông báo nội dung riêng, tận dụng API newsList/newsDetail có sẵn.
   Không thay thế trung tâm thông báo tài khoản, không thay đổi Bản tin. */
(()=>{'use strict';
 const root=document.getElementById('qlnhNoticeList'),input=document.getElementById('qlnhNoticeSearch'),filter=document.getElementById('qlnhNoticeFilter'),more=document.getElementById('qlnhNoticeLoadMore');
 if(!root||!input||!filter||!more)return;
 const make=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;};
 const allowedUrl=url=>typeof url==='string'&&url.length<2000&&(/^https:\/\/[^\s]+$/i.test(url)||/^\/(?!\/)[^\s]*$/.test(url));
 const safeDoc=(node,depth=0)=>{
  if(!node||typeof node!=='object'||depth>16)return document.createTextNode('');
  if(node.type==='text')return document.createTextNode(String(node.text||''));
  if(node.type!=='element')return document.createTextNode('');
  const tags=['p','div','br','h2','h3','blockquote','ul','ol','li','strong','b','em','i','u','s','span','a','img','figure','figcaption','table','thead','tbody','tr','th','td'];
  if(!tags.includes(node.tag))return document.createTextNode('');
  const el=document.createElement(node.tag),attr=node.attrs||{};
  if(['left','right','center','justify'].includes(attr.align))el.style.textAlign=attr.align;
  if(/^#[0-9a-f]{6}$/i.test(attr.color||''))el.style.color=attr.color;
  if(node.tag==='a'&&allowedUrl(attr.href)){el.href=attr.href;el.target='_blank';el.rel='noopener noreferrer';}
  if(node.tag==='img'&&allowedUrl(attr.src)){el.src=attr.src;el.alt=String(attr.alt||'');el.loading='lazy';el.style.maxWidth='100%';}
  (Array.isArray(node.children)?node.children:[]).slice(0,300).forEach(child=>el.append(safeDoc(child,depth+1)));
  return el;
 };
 let items=[],page=1,hasMore=false,query='',active='',read=new Set(),seq=0,ready=false,loadedFor='';
 const uid=()=>String(window.QLNH_STUDENT?.mssv||'guest');
 const key=()=>`qlnh_notice_read_v25_${uid()}`;
 const isGuest=()=>!!window.QLNH_GUEST;
 const preserve=()=>{try{localStorage.setItem(key(),JSON.stringify([...read].slice(-1500)));}catch(_){}};
 const localLoad=()=>{try{const x=JSON.parse(localStorage.getItem(key())||'[]');return new Set(Array.isArray(x)?x.filter(id=>/^TIN_[A-Z0-9_-]{6,80}$/.test(id)):[]);}catch(_){return new Set();}};
 const syncHint=()=>document.getElementById('qlnhNoticesSyncHint');
 async function initialRead(){read=localLoad();if(isGuest()){ready=true;return;}
  try{const r=await window.QLNH.request('/api/v25/notice-read');if(r.success&&Array.isArray(r.ids)){const remote=new Set(r.ids);for(const id of read)if(!remote.has(id)){window.QLNH.request('/api/v25/notice-read',{method:'POST',data:{id,read:true}}).catch(()=>{});}read=new Set([...remote,...read]);preserve();}ready=true;}
  catch(e){ready=true;const hint=syncHint();if(hint)hint.textContent='Trạng thái đọc đang lưu trên thiết bị; cần cập nhật backend V25 để đồng bộ giữa các máy.';}
 }
 function markRead(id){if(!read.has(id)){read.add(id);preserve();if(!isGuest())window.QLNH.request('/api/v25/notice-read',{method:'POST',data:{id,read:true}}).catch(()=>{const h=syncHint();if(h)h.textContent='Chưa đồng bộ trạng thái đã đọc với máy chủ.';});}}
 const fmt=ts=>{try{return window.QLNH_FORMAT_TIME(ts,'');}catch(e){return String(ts||'');}};
 function detail(item,container){const holder=make('div','qlnh-notice-body');holder.hidden=true;holder.append(make('p','qlnh-notice-loading','Đang tải nội dung…'));container.append(holder);return holder;}
 async function expand(item,card,button,content){
  if(active===item.id){active='';button.setAttribute('aria-expanded','false');content.hidden=true;return;}
  active=item.id;for(const node of root.querySelectorAll('.qlnh-notice-item')){const expanded=node.dataset.id===item.id;node.querySelector('.qlnh-notice-toggle')?.setAttribute('aria-expanded',String(expanded));const c=node.querySelector('.qlnh-notice-body');if(c)c.hidden=!expanded;}
  markRead(item.id);card.classList.remove('is-unread');const tag=card.querySelector('.qlnh-notice-unread');if(tag)tag.remove();
  if(content.dataset.loaded==='1')return;
  try{const r=await window.QLNH.data('newsDetail',{id:item.id});if(!r.success||r.item?.kind!=='ThongBao')throw Error('Không tìm thấy thông báo này');
   if(!card.isConnected)return;content.replaceChildren();const article=make('div','qlnh-notice-rich');
   for(const node of (Array.isArray(r.item.document)?r.item.document:[]).slice(0,300))article.append(safeDoc(node));
   content.append(article);
   for(const link of (Array.isArray(r.item.links)?r.item.links:[])){if(!allowedUrl(link.url))continue;const a=make('a','qlnh-notice-link',link.label||'Mở liên kết');a.href=link.url;a.rel='noopener noreferrer';a.target='_blank';content.append(a);}
   for(const attachment of (Array.isArray(r.item.attachments)?r.item.attachments:[])){if(!allowedUrl(attachment.url))continue;const a=make('a','qlnh-notice-link',attachment.label||attachment.name||'Tài liệu');a.href=attachment.url;a.rel='noopener noreferrer';a.target='_blank';content.append(a);}
   if(r.item.openMode==='LINK'&&allowedUrl(r.item.mainUrl)){const a=make('a','qlnh-notice-link','Mở nội dung liên quan');a.href=r.item.mainUrl;a.rel='noopener noreferrer';a.target='_blank';content.append(a);}
   if(!content.textContent.trim())content.append(make('p','','Thông báo không có nội dung bổ sung.'));
   content.dataset.loaded='1';
  }catch(e){content.replaceChildren(make('p','qlnh-notice-error','Không thể tải nội dung: '+(e.message||'Lỗi kết nối')));}
 }
 function render(){active='';const f=filter.value,q=query.toLocaleLowerCase('vi');root.replaceChildren();const visible=items.filter(x=>(f==='all'||(f==='read')===read.has(x.id))&&(!q||String(x.title+' '+(x.excerpt||'')).toLocaleLowerCase('vi').includes(q)));
  if(!visible.length){root.append(make('p','qlnh-notice-empty',items.length?'Không có thông báo phù hợp bộ lọc.':'Chưa có thông báo nào được công bố.'));return;}
  for(const item of visible){const card=make('article','qlnh-notice-item'+(read.has(item.id)?'':' is-unread'));card.dataset.id=item.id;
   const header=make('button','qlnh-notice-toggle');header.type='button';header.setAttribute('aria-expanded',String(active===item.id));
   const title=make('span','qlnh-notice-title',item.title),meta=make('span','qlnh-notice-meta',fmt(item.publishedAt)+' · '+({Lop:'Lớp',ChiDoan:'Chi đoàn',ChiHoi:'Chi hội'}[item.unit]||'Thông báo'));
   const main=make('span','qlnh-notice-heading');main.append(title,meta);header.append(main);
   if(!read.has(item.id))header.append(make('span','qlnh-notice-unread','Mới'));
   header.append(make('span','qlnh-notice-chevron','⌄'));card.append(header);
   const content=detail(item,card);content.hidden=active!==item.id;
   header.onclick=()=>expand(item,card,header,content);root.append(card);
  }
 }
 async function load(append=false){const my=++seq;if(!append){page=1;items=[];root.replaceChildren(make('p','qlnh-notice-loading','Đang tải thông báo…'));}
  try{const res=await window.QLNH.data('newsList',{unit:'all',kind:'ThongBao',page,limit:15,q:query});if(my!==seq)return;if(!res.success||!Array.isArray(res.items))throw Error(res.message||'Lỗi dữ liệu');
   items=append?items.concat(res.items):res.items;const seen=new Set();items=items.filter(x=>{if(x.kind!=='ThongBao'||seen.has(x.id))return false;seen.add(x.id);return true;});items.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));hasMore=!!res.hasMore;more.hidden=!hasMore;render();}
  catch(e){if(my!==seq)return;root.replaceChildren(make('p','qlnh-notice-error','Không tải được thông báo: '+(e.message||'Lỗi kết nối')));}
 }
 function enter(){if(loadedFor!==uid()){loadedFor=uid();ready=false;read=new Set();}if(!ready){initialRead().then(()=>load());return;}load();}
 document.querySelectorAll('[data-page="notices"]').forEach(b=>b.addEventListener('click',enter));
 input.addEventListener('input',()=>{query=input.value.trim().slice(0,100);clearTimeout(input._timer);input._timer=setTimeout(()=>load(),300);});
 filter.addEventListener('change',render);more.addEventListener('click',()=>{if(hasMore){page++;load(true);}});
 window.QLNH_REFRESH_NOTICES=enter;
 if(document.body.dataset.currentPage==='notices')enter();
})();
