/* 2505QLNH — GRAND CIVIC V14: presentation only.
   Preserves app.js, news.js, push.js and all existing endpoints. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const pwaInstallButton=document.getElementById('pwaInstallBtn');const pwaStatus=document.getElementById('pwaInstallStatus');let deferredPwaEvent=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPwaEvent=e;if(pwaInstallButton)pwaInstallButton.hidden=false});
pwaInstallButton?.addEventListener('click',async()=>{if(!deferredPwaEvent)return;const pending=deferredPwaEvent;deferredPwaEvent=null;pwaInstallButton.hidden=true;try{await pending.prompt();const selection=await pending.userChoice;if(pwaStatus)pwaStatus.textContent=selection?.outcome==='accepted'?'Đã xác nhận yêu cầu cài đặt.':'Bạn có thể cài đặt sau.';}catch(e){if(pwaStatus)pwaStatus.textContent='Không thể mở lời mời cài đặt trên trình duyệt này.';}});
window.addEventListener('appinstalled',()=>{if(pwaStatus)pwaStatus.textContent='Ứng dụng đã được cài đặt.';if(pwaInstallButton)pwaInstallButton.hidden=true});
const drawer=document.getElementById('drawer');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer?.classList.contains('open'))document.getElementById('closeBtn')?.click()});
const pageLinks=[...document.querySelectorAll('[data-page]')];
const updateNav=()=>{
 const current=document.body.dataset.currentPage||'home';
 pageLinks.forEach(b=>{
  const isNav=!!b.closest('.desktopNav');
  if(isNav){const active=b.dataset.page===current;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}
 });
};
updateNav();new MutationObserver(updateNav).observe(document.body,{attributes:true,attributeFilter:['data-current-page']});
// The branch navigation is a real scroll-to-section control, not decorative tabs.
document.querySelectorAll('[data-scroll-to]').forEach(button=>button.addEventListener('click',()=>{
 const target=$(button.dataset.scrollTo);if(!target||target.hidden){return}
 target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
}));
// The news module owns content and click handling; reuse its actual cards.
const homeNews=$('newsHomeCards');const homeAlert=$('homeNotices');const homeNewsCount=$('homeNewsCount');
let lastAlertTitle='';
function syncAnnouncements(){
 if(!homeNews)return;
 const cards=[...homeNews.querySelectorAll('.news-card')];
 if(homeNewsCount)homeNewsCount.textContent=cards.length?String(cards.length).padStart(2,'0'):'—';
 if(!homeAlert)return;
 const important=cards.find(x=>x.querySelector('.news-important'));
 if(!important){homeAlert.hidden=true;lastAlertTitle='';return}
 const title=important.querySelector('h3')?.textContent?.trim()||'';
 if(!title){homeAlert.hidden=true;return}
 if(title===lastAlertTitle)return;
 lastAlertTitle=title;
 const lead=document.createElement('strong');lead.textContent='Thông báo nổi bật';
 const paragraph=document.createElement('p');paragraph.textContent=title;
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Xem thông báo: '+title);button.textContent='›';button.addEventListener('click',()=>important.click());
 homeAlert.replaceChildren(lead,paragraph,button);homeAlert.hidden=false;
}
if(homeNews){new MutationObserver(syncAnnouncements).observe(homeNews,{childList:true,subtree:false});syncAnnouncements()}
// Counts are derived from real loaded public data, not the illustrative numbers on the approved mockup.
const activityCount=$('homeActivityCount'),homeEvents=$('homeEvents');
function syncActivityCount(){
 if(!activityCount)return;
 try{const a=typeof state!=='undefined'&&state?state:null;if(a){const total=(Array.isArray(a.activities)?a.activities.length:0)+(Array.isArray(a.series)?a.series.length:0);activityCount.textContent=String(total).padStart(2,'0')}else{activityCount.textContent='—'}}catch(e){activityCount.textContent='—'}
}
if(homeEvents){new MutationObserver(syncActivityCount).observe(homeEvents,{childList:true});syncActivityCount()}
// If a real image cannot be fetched, keep the designed surface and text readable.
document.querySelectorAll('.hero-photo img,.branch-banner-image img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none'}));
})();
