/* LỚP 2505QLNH V21.1: lightweight, fail-visible, optional motion enhancement. */
(()=>{'use strict';
const root=document.documentElement,KEY='qlnh_site_motion_public_v1';
const defaults={enabled:true,intensity:'standard',scroll:true,typewriter:true,flowers:true};
let config={...defaults},observer=null,frame=0,typingTimer=0,hasTyped=false;
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const safe=x=>({enabled:x?.enabled!==false,intensity:['low','standard','high'].includes(x?.intensity)?x.intensity:'standard',scroll:x?.scroll!==false,typewriter:x?.typewriter!==false,flowers:x?.flowers!==false});
const seen=new Set();
function markedKey(el){
 const pg=el.closest('.page')?.id||'home';const id=el.id||el.dataset.id||'';
 const text=(el.querySelector('h2,h3,strong')?.textContent||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,62);
 return pg+'|'+el.tagName+'|'+el.className?.toString().split(' ').slice(0,2).join('.')+'|'+id+'|'+text;
}
function clean(){document.querySelectorAll('.qlnh-motion-pending').forEach(el=>{el.classList.remove('qlnh-motion-pending');el.classList.add('qlnh-motion-visible')});}
function makeObserver(){if(observer){observer.disconnect();observer=null;}
 if(!root.classList.contains('qlnh-motion-scroll')||!('IntersectionObserver'in window)){clean();return;}
 observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;
  const el=entry.target;el.classList.add('qlnh-motion-visible');seen.add(markedKey(el));observer.unobserve(el);
  window.setTimeout(()=>el.classList.remove('qlnh-motion-pending'),900);
 }},{root:null,threshold:.08,rootMargin:'0px 0px -12px 0px'});
 scan();
}
function scan(){if(!observer)return;
 const current=document.querySelector('.page.current');if(!current)return;
 const selectors=['.home-shortcuts .shortcut','.home-overview-grid > *','.branch-tiles > *','.page-ribbon','.content-page-head','.organization-content > .section-title','.organization-content .grid > *','.news-card','.activity-card','.v17-upcoming','.surface-panel','.fund-card','.theme-advisor-panel','.theme-advisor-portrait','.theme-advisor-letter','.news-detail-page','.v17-page-head'];
 const els=[...current.querySelectorAll(selectors.join(','))].filter(el=>!el.hidden && !el.closest('[hidden]'));
 let batch=0;for(const el of els){
  const rect=el.getBoundingClientRect();
  if(el.dataset.qlnhMotionObserved==='1'){
   // Extra fallback for browsers that delay IntersectionObserver while scrolling (iOS PWA).
   if(el.classList.contains('qlnh-motion-pending') && rect.top < innerHeight-10 && rect.bottom>0){
    el.classList.add('qlnh-motion-visible');seen.add(markedKey(el));observer.unobserve(el);
   }
   continue;
  }
  // Do not make far-away content invisible. Arm the animation only when approaching.
  if(rect.top>innerHeight+160)continue;
  const key=markedKey(el);el.dataset.qlnhMotionObserved='1';
  if(rect.top<innerHeight*.7||seen.has(key)){seen.add(key);continue;}
  el.style.setProperty('--qlnh-motion-delay',String((batch++%5)*75)+'ms');el.classList.add('qlnh-motion-pending');observer.observe(el);
  if(rect.top<innerHeight-10)requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('qlnh-motion-visible')));
  // Watchdog: fail open on broken observers; never hide a real page permanently.
  window.setTimeout(()=>{el.classList.remove('qlnh-motion-pending');el.classList.add('qlnh-motion-visible');},1800);
 }
}
function scheduleScan(){if(frame) return;frame=requestAnimationFrame(()=>{frame=0;scan()})}
function writeIntro(){
 if(hasTyped||!config.enabled||!config.typewriter||reduced()||!root.classList.contains('theme-2011'))return;
 const el=document.querySelector('.theme-v2-kicker');if(!el)return;
 const text=el.dataset.motionFull||el.textContent.trim();if(!text||el.dataset.motionTyped==='1')return;
 el.dataset.motionFull=text;const segments=(typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text));
 const height=el.getBoundingClientRect().height;el.style.minHeight=Math.ceil(height)+'px';el.setAttribute('aria-label',text);
 el.dataset.motionTyped='1';el.classList.add('qlnh-typing');hasTyped=true;let index=0;
 function tick(){if(reduced()||!config.enabled||!config.typewriter){el.textContent=text;el.classList.remove('qlnh-typing');return;}
  index=Math.min(index+1,segments.length);el.textContent=segments.slice(0,index).join('');
  if(index<segments.length)typingTimer=window.setTimeout(tick,45);else typingTimer=window.setTimeout(()=>el.classList.remove('qlnh-typing'),650);
 }
 // Preserve the sentence in accessible text before animation and avoid blank first paint.
 window.setTimeout(tick,210);
}
function apply(incoming){config=safe(incoming);root.classList.toggle('qlnh-motion-active',config.enabled&&!reduced());
 root.classList.toggle('qlnh-motion-scroll',config.enabled&&config.scroll&&!reduced());
 root.classList.toggle('qlnh-motion-flowers',config.enabled&&config.flowers&&!reduced());
 root.classList.toggle('qlnh-motion-low',config.intensity==='low');root.classList.toggle('qlnh-motion-high',config.intensity==='high');
 if(config.enabled&&!reduced())makeObserver();else {observer?.disconnect();observer=null;clean();clearTimeout(typingTimer);}
 if(config.enabled)writeIntro();
}
try{let old=JSON.parse(localStorage.getItem(KEY)||'null');if(old)config=safe(old)}catch(_){ }
apply(config);
const api=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');
async function load(){if(!/^https:\/\//i.test(api))return;
 try{const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),5500);let result;
 try{const response=await fetch(api+'/api/guest/data?action=motion',{cache:'no-store',credentials:'omit',signal:ctrl.signal});if(!response.ok)throw Error('Motion API '+response.status);result=await response.json();}finally{clearTimeout(timeout)}
 if(result?.success!==true)throw Error('Motion config unavailable');config=safe(result);try{localStorage.setItem(KEY,JSON.stringify(config))}catch(_){}apply(config);
 }catch(e){console.warn('Sử dụng hiệu ứng mặc định/đã lưu; không ảnh hưởng dữ liệu website.',e);}
}
const host=document.getElementById('siteMain');if(host){new MutationObserver(scheduleScan).observe(host,{childList:true,subtree:true});}
new MutationObserver(()=>{scheduleScan();if(document.body.dataset.currentPage==='home')writeIntro()}).observe(document.body,{attributes:true,attributeFilter:['data-current-page']});
window.addEventListener('scroll',scheduleScan,{passive:true});window.addEventListener('resize',scheduleScan,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
try{const media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener?.('change',()=>apply(config));}catch(_){}
setInterval(()=>{if(!document.hidden)load()},300000);
load();
})();
