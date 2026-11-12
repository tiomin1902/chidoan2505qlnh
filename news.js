/* Bản tin & Thông báo 2505QLNH V5 — public news module */
(()=>{
'use strict';
const U={Lop:'LỚP',ChiDoan:'CHI ĐOÀN',ChiHoi:'CHI HỘI'};
const K={BanTin:'BẢN TIN',ThongBao:'THÔNG BÁO'};
let unit='Lop',kind='all',q='',page=1,more=false,searchTimer=0,loadedHome=false,lastList=[];
const $n=id=>document.getElementById(id);
const dateTime=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';};
const safeURL=url=>typeof url==='string'&&url.length<=2000&&(/^(https:\/\/[^\s]+)$/i.test(url)||/^\/(?!\/)[^\s]*$/.test(url));
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=String(text);return n;}
function imageFrom(media,alt){
  if(!media||!safeURL(media.preview))return null;
  const box=el('div','news-image');const img=el('img');img.src=media.preview;img.alt=alt||media.name||'Hình ảnh bản tin';img.loading='lazy';img.decoding='async';img.onerror=()=>box.remove();box.append(img);return box;
}
function goLink(url,target){if(!safeURL(url))return;const a=document.createElement('a');a.href=url;a.target=target||'_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();}
function heading(item){return (K[item.kind]||'BẢN TIN')+' · '+(U[item.unit]||'LỚP');}
function card(item){
 const article=el('article','news-card');const cover=imageFrom(item.cover,item.title);if(cover)article.append(cover);
 const body=el('div','news-card-body');const meta=el('div','news-card-meta');meta.append(el('span','news-class',heading(item)));if(item.important)meta.append(el('span','news-important','QUAN TRỌNG'));body.append(meta);
 body.append(el('h3','',item.title));if(item.excerpt)body.append(el('p','news-excerpt',item.excerpt));
 const foot=el('div','news-card-bottom');foot.append(el('time','',dateTime(item.publishedAt)));foot.append(el('span','news-card-arrow',item.openMode==='LINK'?'Mở liên kết ↗':'Đọc tiếp ↗'));body.append(foot);article.append(body);
 article.tabIndex=0;article.setAttribute('role','link');article.setAttribute('aria-label','Mở '+item.title);article.onclick=()=>openCard(item);article.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(item);}};
 return article;
}
function openCard(item){if(item.openMode==='LINK'&&safeURL(item.mainUrl))goLink(item.mainUrl);else openDetail(item.id,true);}
async function loadHome(){
 const box=$n('newsHomeCards');if(!box)return;
 try{const r=await jsonp('newsList',{unit:'all',kind:'all',limit:6,page:1,home:1});if(!r.success)throw Error(r.message||'Không tải được bản tin');
 box.replaceChildren(...(r.items||[]).map(card));if(!r.items.length)box.append(el('p','news-empty','Hiện chưa có bản tin hoặc thông báo được công bố.'));
 loadedHome=true;
 }catch(e){box.replaceChildren(el('p','news-empty','Chưa thể tải bản tin. Vui lòng thử lại sau.'));}
}
async function loadList(append=false){
 const box=$n('newsListCards');if(!box)return;if(!append){page=1;box.replaceChildren(el('p','news-loading','Đang tải bản tin...'));}
 try{const r=await jsonp('newsList',{unit,kind,q,page,limit:6});if(!r.success)throw Error(r.message||'Không tải được bản tin');
 if(!append)box.replaceChildren();
 if(!r.items.length&&!append)box.append(el('p','news-empty','Chưa có bản tin phù hợp với lựa chọn này.'));
 else (r.items||[]).forEach(x=>box.append(card(x)));
 lastList=append?lastList.concat(r.items):r.items;more=!!r.hasMore;$n('newsLoadMore').hidden=!more;
 $n('newsTotal').textContent=r.total+' bài viết';
 }catch(e){if(!append)box.replaceChildren(el('p','news-empty','Không tải được bản tin. Vui lòng kiểm tra kết nối và thử lại.'));}
}
function navNews(){unit=unit||'Lop';nav('news');document.body.dataset.currentPage='news';loadList();}
function setUnit(v){unit=v;document.querySelectorAll('[data-news-unit]').forEach(b=>{const active=b.dataset.newsUnit===v;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});loadList();}
function setKind(v){kind=v;document.querySelectorAll('[data-news-kind]').forEach(b=>{const active=b.dataset.newsKind===v;b.classList.toggle('active',active);});loadList();}
function documentNode(node){
 if(!node||typeof node!=='object')return document.createTextNode('');
 if(node.type==='text')return document.createTextNode(String(node.text||''));
 const allowed=['p','div','br','h2','h3','blockquote','ul','ol','li','strong','b','em','i','u','s','span','a','img','figure','figcaption','table','thead','tbody','tr','th','td'];
 if(node.type!=='element'||!allowed.includes(node.tag))return document.createTextNode('');
 const x=document.createElement(node.tag),a=node.attrs||{};
 if(['left','center','right','justify'].includes(a.align))x.style.textAlign=a.align;
 if(/^#[\da-f]{6}$/i.test(a.color))x.style.color=a.color;
 if(/^#[\da-f]{6}$/i.test(a.backgroundColor))x.style.backgroundColor=a.backgroundColor;
 if(['Arial','Georgia','Times New Roman','Inter','system-ui'].includes(a.fontFamily))x.style.fontFamily=a.fontFamily;
 if(Number.isInteger(Number(a.fontSize))&&+a.fontSize>=11&&+a.fontSize<=42)x.style.fontSize=a.fontSize+'px';
 if(node.tag==='a'&&safeURL(a.href)){x.href=a.href;x.target=a.target==='_self'?'_self':'_blank';x.rel='noopener noreferrer';}
 if(node.tag==='img'&&safeURL(a.src)){x.src=a.src;x.alt=String(a.alt||'');x.loading='lazy';x.style.maxWidth='100%';x.style.height='auto';if(Number(a.width)>=20&&Number(a.width)<=100)x.style.width=a.width+'%';}
 (Array.isArray(node.children)?node.children:[]).forEach(child=>x.append(documentNode(child)));
 return x;
}
function linkArea(item){
 const row=el('div','news-external-links');if(!Array.isArray(item.links)||!item.links.length)return null;
 row.append(el('h3','','LIÊN KẾT ĐÍNH KÈM'));
 item.links.forEach(link=>{if(!safeURL(link.url))return;const a=el('a','news-external-link');a.href=link.url;a.target=link.target==='_self'?'_self':'_blank';a.rel='noopener noreferrer';a.append(el('span','',link.label));a.append(el('span','','↗'));if(link.description)a.title=link.description;row.append(a);});return row;
}
function attachmentArea(item){
 if(!Array.isArray(item.attachments)||!item.attachments.length)return null;
 const box=el('div','news-attachments');box.append(el('h3','','TÀI LIỆU ĐÍNH KÈM'));
 item.attachments.forEach(file=>{if(!safeURL(file.url))return;const card=el('div','news-attachment');const title=el('div','news-attachment-name');title.append(el('span','news-file-icon',String(file.name||'').split('.').pop().toUpperCase()));const info=el('div');info.append(el('strong','',file.label||file.name));info.append(el('small','',Number(file.size)?(file.size/1024/1024).toFixed(2)+' MB':'Tài liệu đính kèm'));title.append(info);card.append(title);const actions=el('div','news-attachment-actions');const see=el('a','','Xem ↗');see.href=file.url;see.target='_blank';see.rel='noopener noreferrer';actions.append(see);if(/^[\w-]{15,130}$/.test(file.id||'')){const down=el('a','','Tải xuống ↓');down.href='https://drive.google.com/uc?export=download&id='+file.id;down.target='_blank';down.rel='noopener noreferrer';actions.append(down);}card.append(actions);box.append(card);
 if((file.mime||'').toLowerCase()==='application/pdf'&&/^[\w-]{15,130}$/.test(file.id||'')){
   const details=el('details','news-pdf-preview');const summary=el('summary','','Xem trước PDF ngay trên trang');details.append(summary);
   const frame=document.createElement('iframe');frame.src='https://drive.google.com/file/d/'+file.id+'/preview';frame.title='Xem trước '+(file.label||file.name);frame.loading='lazy';frame.referrerPolicy='no-referrer';frame.style.cssText='width:100%;height:500px;border:1px solid #e2e8e1;border-radius:8px;margin-top:12px';details.append(frame);box.append(details);
 }
 });return box;
}
async function openDetail(id,push){
 if(!/^TIN_[A-Z0-9_-]{6,80}$/.test(id))return;
 nav('newsDetail');const view=$n('newsDetailBody');view.replaceChildren(el('p','news-loading','Đang tải bài viết...'));
 if(push){const u=new URL(window.location.href);u.searchParams.set('news',id);history.pushState({news:id},'',u.pathname+u.search+u.hash);}
 try{const r=await jsonp('newsDetail',{id});if(!r.success||!r.item)throw Error(r.message||'Không tìm thấy bài viết');
 const item=r.item;view.replaceChildren();
 const top=el('div','news-article-heading');top.append(el('p','news-article-unit',heading(item)));if(item.important)top.append(el('p','news-important','QUAN TRỌNG'));top.append(el('h1','',item.title));top.append(el('p','news-article-time','Ngày đăng: '+dateTime(item.publishedAt)));view.append(top);
 const cover=imageFrom(item.cover,item.title);if(cover)cover.classList.add('news-detail-image');if(cover)view.append(cover);
 const body=el('article','news-article-content');(Array.isArray(item.document)?item.document:[]).forEach(n=>body.append(documentNode(n)));view.append(body);
 const links=linkArea(item),files=attachmentArea(item);if(links)view.append(links);if(files)view.append(files);
 const actions=el('div','news-detail-actions');const copy=el('button','news-share','Sao chép liên kết bài viết');copy.onclick=async()=>{const u=new URL(location.href);u.searchParams.set('news',id);try{await navigator.clipboard.writeText(u.href);copy.textContent='Đã sao chép liên kết';}catch(e){prompt('Sao chép đường dẫn:',u.href);}};actions.append(copy);view.append(actions);
 }catch(e){view.replaceChildren(el('p','news-empty','Không thể đọc bài viết. Bài có thể đã bị ẩn, lưu trữ hoặc chưa được công bố.'));}
}
function backList(){const u=new URL(location.href);u.searchParams.delete('news');history.replaceState({},'',u.pathname+u.search+u.hash);navNews();}
$n('newsDetailBack').onclick=backList;
$n('newsLoadMore').onclick=()=>{page++;loadList(true);};
document.querySelectorAll('[data-news-unit]').forEach(b=>b.onclick=()=>setUnit(b.dataset.newsUnit));
document.querySelectorAll('[data-news-kind]').forEach(b=>b.onclick=()=>setKind(b.dataset.newsKind));
$n('newsSearch').oninput=e=>{clearTimeout(searchTimer);q=e.target.value.trim();searchTimer=setTimeout(()=>loadList(),300);};
document.querySelectorAll('[data-page="news"]').forEach(b=>b.addEventListener('click',()=>{loadList();}));
window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('news');if(id)openDetail(id,false);else if($n('newsDetail').classList.contains('current'))navNews();});
const id=new URL(location.href).searchParams.get('news');if(id)openDetail(id,false);
window.QLNH_REFRESH_NEWS=()=>Promise.all([loadHome(),loadList(false)]);
loadHome();
})();
