/* 2505QLNH V28: one semantic navigation tree for every public theme.
 * All existing data-page routes keep the original app.js navigation/ACL.
 * No changes to music, authentication, attendance photos, or backend.
 */
(()=>{'use strict';
 const drawer=document.getElementById('drawer');
 const opener=document.getElementById('menuBtn');
 const close=document.getElementById('closeBtn');
 if(!drawer||!opener||!close)return;
 // Avoid double handlers if a cached loader invokes the bundle again.
 if(drawer.dataset.v281MenuReady==='1')return;
 drawer.dataset.v281MenuReady='1';
 const groupButtons=[...drawer.querySelectorAll('.qlnh-v28-groupToggle')];
 const groups=[...drawer.querySelectorAll('.qlnh-v28-group')];
 let lastFocus=null;
 function setGroup(id){
   for(const group of groups){
     const opened=group.dataset.group===id;
     const toggle=group.querySelector('.qlnh-v28-groupToggle');
     const body=group.querySelector('.qlnh-v28-subitems');
     if(toggle)toggle.setAttribute('aria-expanded',String(opened));
     if(body){body.hidden=!opened;body.setAttribute('aria-hidden',String(!opened));}
   }
 }
 groupButtons.forEach(button=>button.addEventListener('click',(event)=>{
   event.preventDefault();
   const group=button.closest('.qlnh-v28-group');
   setGroup(button.getAttribute('aria-expanded')==='true'?'':group?.dataset.group||'');
 }));
 const scroll=drawer.querySelector('.drawerScroll');
 function syncActive(page){
   const current=String(page||document.body.dataset.currentPage||'home');
   drawer.querySelectorAll('.qlnh-v28-nav-item[data-page]').forEach(b=>{
     const same=b.dataset.page===current;
     if(same)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
   });
 }
 window.QLNH_V28_SYNC_ACTIVE=syncActive;
 syncActive();
 function openReady(){
   if(!drawer.classList.contains('open'))return;
   lastFocus=opener;
   syncActive();
   const current=drawer.querySelector('.qlnh-v28-nav-item[aria-current="page"]');
   const currentGroup=current?.closest('.qlnh-v28-group');
   setGroup(currentGroup?.dataset.group||'');
 }
 opener.addEventListener('click',openReady);
 document.addEventListener('keydown',event=>{
   if(!drawer.classList.contains('open'))return;
   if(event.key==='Escape'){
     event.preventDefault();close.click();opener.focus({preventScroll:true});return;
   }
   if(event.key!=='Tab')return;
   const all=[...drawer.querySelectorAll('button,[href],summary,[tabindex="0"]')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&el.getClientRects().length);
   if(!all.length)return;
   const first=all[0],last=all[all.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 close.addEventListener('click',()=>{(lastFocus&&document.contains(lastFocus)?lastFocus:opener).focus({preventScroll:true});});
 scroll?.addEventListener('click',event=>{
   const button=event.target.closest('button.qlnh-v28-nav-item[data-page]');
   if(!button)return;
   // app.js owns navigation, permissions, and closing the drawer. Do not duplicate it.
   // The body[data-current-page] observer updates active styling only on successful route changes.
 });
 const observer=new MutationObserver(()=>syncActive());
 observer.observe(document.body,{attributes:true,attributeFilter:['data-current-page']});
 // The announcement archive and the per-account inbox remain separate data sources.
 // No music controls are moved or reinitialized.
})();
