/* LỚP 2505QLNH V19.2 – Authenticated full-screen document reader.
 * Fetching private bytes is performed by the existing Cloudflare Worker in v17-student.js.
 * This component receives a Blob only: never expose storage URLs or session tokens. */
(()=>{'use strict';
 const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs';
 const PDFWORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs';
 let opened=null,pdfLibPromise=null;
 const loadLib=()=>{if(!pdfLibPromise)pdfLibPromise=import(PDFJS).then(mod=>{mod.GlobalWorkerOptions.workerSrc=PDFWORKER;return mod;}).catch(e=>{pdfLibPromise=null;throw e;});return pdfLibPromise;};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const css=document.createElement('link');css.rel='stylesheet';css.href='./qlnh-document-viewer.css?v=19.2.0';document.head.append(css);
 const setText=(el,text)=>{if(el)el.textContent=text;};
 const stopKeys=e=>{if(opened&&e.key==='Escape'){e.preventDefault();opened.close();}};
 window.QLNH_V192_VIEW_DOCUMENT=async(blob,meta={})=>{
  if(!(blob instanceof Blob))throw Error('Dữ liệu tài liệu không hợp lệ');
  if(opened)opened.close();
  const mime=(meta.mime||blob.type||'').toLowerCase();
  const title=String(meta.title||'Tài liệu').slice(0,180);
  const previousFocus=document.activeElement,previousOverflow=document.body.style.overflow;
  const overlay=document.createElement('section');overlay.id='qlnhDocReader';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Đọc tài liệu: '+title);
  overlay.innerHTML=`<header class="qdr-head"><button type="button" class="qdr-back" aria-label="Đóng trình xem">← Quay lại</button><strong class="qdr-title">${esc(title)}</strong><span class="qdr-counter" aria-live="polite">Đang mở…</span></header>
  <main class="qdr-body" role="region" aria-label="Nội dung tài liệu"><p class="qdr-loading" role="status">Đang tải tài liệu…</p></main>
  <footer class="qdr-footer"><button type="button" data-qdr="prev" aria-label="Trang trước">‹</button><span class="qdr-count">—</span><button type="button" data-qdr="next" aria-label="Trang sau">›</button><span class="qdr-sep"></span><button type="button" data-qdr="minus" aria-label="Thu nhỏ">−</button><button type="button" data-qdr="fit" aria-label="Vừa chiều rộng">Vừa rộng</button><button type="button" data-qdr="plus" aria-label="Phóng to">+</button></footer>`;
  document.body.append(overlay);document.body.style.overflow='hidden';
  const body=overlay.querySelector('.qdr-body'),counter=overlay.querySelector('.qdr-counter'),pageLabel=overlay.querySelector('.qdr-count');
  const buttons=Object.fromEntries([...overlay.querySelectorAll('[data-qdr]')].map(b=>[b.dataset.qdr,b]));
  let alive=true,currentPage=1,numPages=0,zoom=1,pdf=null,observer=null,scrollFn=null,objectUrl=null;
  const pageNodes=[];
  const updateControls=()=>{setText(pageLabel,numPages?`${currentPage} / ${numPages}`:'—');setText(counter,numPages?`${numPages} trang`:mime.startsWith('image/')?'Hình ảnh':'Tài liệu');
    for(const name of ['prev','next','minus','plus','fit'])buttons[name].disabled=!pdf||(name==='prev'&&currentPage<=1)||(name==='next'&&currentPage>=numPages);
  };
  function close(){
    if(!alive)return;alive=false;
    observer?.disconnect();if(scrollFn)body.removeEventListener('scroll',scrollFn);
    document.removeEventListener('keydown',stopKeys);
    for(const node of pageNodes){if(node?.renderTask)try{node.renderTask.cancel();}catch(_){}}
    try{pdf?.destroy?.();}catch(_){ }
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    overlay.remove();document.body.style.overflow=previousOverflow;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  opened={close};overlay.querySelector('.qdr-back').onclick=close;document.addEventListener('keydown',stopKeys);updateControls();overlay.querySelector('.qdr-back').focus({preventScroll:true});
  const setStatus=(msg)=>{body.replaceChildren();const p=document.createElement('p');p.className='qdr-loading';p.textContent=msg;body.append(p);};
  const go=n=>{if(!pdf||n<1||n>numPages)return;currentPage=n;pageNodes[n-1].element.scrollIntoView({behavior:'smooth',block:'start'});updateControls();};
  buttons.prev.onclick=()=>go(currentPage-1);buttons.next.onclick=()=>go(currentPage+1);
  const updateCurrent=()=>{const rootTop=body.getBoundingClientRect().top+20;let best=1,dist=Infinity;for(let i=0;i<pageNodes.length;i++){
    const d=Math.abs(pageNodes[i].element.getBoundingClientRect().top-rootTop);if(d<dist){dist=d;best=i+1;}
   }if(best!==currentPage){currentPage=best;updateControls();}};
  async function renderPage(i){
    const rec=pageNodes[i];if(!alive||!pdf||!rec||rec.busy||rec.canvas)return;
    rec.busy=true;
    try{
      const page=await pdf.getPage(i+1);if(!alive)return;
      const p1=page.getViewport({scale:1});
      const containerWidth=Math.max(260,body.clientWidth-32);
      const fit=Math.min(1.8,containerWidth/p1.width);
      const viewport=page.getViewport({scale:fit*zoom});
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const cap=Math.min(dpr,Math.sqrt(9500000/(viewport.width*viewport.height)));
      const canvas=document.createElement('canvas');canvas.className='qdr-page-canvas';canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
      canvas.width=Math.ceil(viewport.width*cap);canvas.height=Math.ceil(viewport.height*cap);
      const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Thiết bị không thể hiển thị trang PDF này');
      rec.element.replaceChildren(canvas);rec.element.style.minHeight=viewport.height+'px';
      rec.renderTask=page.render({canvasContext:ctx,viewport,transform:cap!==1?[cap,0,0,cap,0,0]:null});
      await rec.renderTask.promise;
      if(!alive)return;
      rec.canvas=canvas;
      // Avoid retaining every decoded page canvas on long PDFs.
      const rendered=pageNodes.filter(r=>r.canvas).length;
      if(rendered>7){for(const other of pageNodes){if(!other.canvas||Math.abs(other.index-i)<3)continue;other.canvas.remove();other.canvas=null;other.element.textContent='Trang '+(other.index+1);if(pageNodes.filter(r=>r.canvas).length<=5)break;}}
    }catch(e){if(alive&&e?.name!=='RenderingCancelledException'){rec.element.textContent='Không tải được trang '+(i+1)+'. Hãy thử cuộn lại.';}}
    finally{rec.busy=false;rec.renderTask=null;}
  }
  function rerender(){if(!pdf)return;
    for(const rec of pageNodes){if(rec.renderTask)try{rec.renderTask.cancel();}catch(_){ }rec.canvas=null;rec.element.replaceChildren();rec.element.textContent='Trang '+(rec.index+1);rec.element.style.minHeight=Math.max(280,Math.round(rec.estimatedHeight*zoom))+'px';}
    observer?.disconnect();for(const rec of pageNodes)observer.observe(rec.element);
    go(currentPage);
  }
  buttons.minus.onclick=()=>{zoom=Math.max(.65,Math.round((zoom-.2)*100)/100);rerender();};
  buttons.plus.onclick=()=>{zoom=Math.min(2.5,Math.round((zoom+.2)*100)/100);rerender();};
  buttons.fit.onclick=()=>{zoom=1;rerender();};
  try{
   if(mime==='application/pdf'||blob.type==='application/pdf'){
     try{
       const mod=await loadLib();if(!alive)return;
       const task=mod.getDocument({data:new Uint8Array(await blob.arrayBuffer())});pdf=await task.promise;
       if(!alive){pdf.destroy();return;}
       numPages=pdf.numPages;setStatus('');body.replaceChildren();
       const first=await pdf.getPage(1);const vp=first.getViewport({scale:1});const ratio=vp.height/vp.width;
       const estimatedHeight=Math.round(Math.max(260,body.clientWidth-32)*ratio);
       const fragment=document.createDocumentFragment();
       for(let i=0;i<numPages;i++){
         const el=document.createElement('article');el.className='qdr-page';el.setAttribute('aria-label','Trang '+(i+1));el.textContent='Trang '+(i+1);el.style.minHeight=estimatedHeight+'px';fragment.append(el);pageNodes.push({element:el,index:i,estimatedHeight,canvas:null,busy:false,renderTask:null});
       }body.append(fragment);
       observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)renderPage(pageNodes.findIndex(p=>p.element===entry.target));},{root:body,rootMargin:'550px 0px'});
       for(const rec of pageNodes)observer.observe(rec.element);
       scrollFn=()=>requestAnimationFrame(updateCurrent);body.addEventListener('scroll',scrollFn,{passive:true});
       updateControls();
     }catch(e){
       if(!alive)return;
       // Trusted blob stays in this origin; PDF.js may be unavailable on blocked CDN/offline devices.
       objectUrl=URL.createObjectURL(blob);setStatus('Không tải được trình đọc nhiều trang. Đang thử trình xem PDF của thiết bị.');
       const frame=document.createElement('iframe');frame.title=title;frame.className='qdr-native-frame';frame.src=objectUrl;body.append(frame);
       setText(counter,'Trình xem thiết bị');console.warn('PDF.js unavailable, using browser viewer',e);
     }
   }else if(mime.startsWith('image/')){
     objectUrl=URL.createObjectURL(blob);body.replaceChildren();const img=document.createElement('img');img.className='qdr-image';img.alt=title;img.src=objectUrl;body.append(img);setText(counter,'Hình ảnh');
   }else if(mime==='text/plain'){
     const txt=await blob.text();body.replaceChildren();const pre=document.createElement('pre');pre.className='qdr-text';pre.textContent=txt;body.append(pre);setText(counter,'Văn bản');
   }else{
     setStatus('Định dạng này chưa có bộ đọc tích hợp an toàn. Vui lòng quay lại và tải xuống nếu tài liệu cho phép.');setText(counter,'Không hỗ trợ xem trước');
   }
  }catch(e){if(alive)setStatus('Không xem được tài liệu: '+(e.message||'Lỗi tải tệp'));}
 };
})();
