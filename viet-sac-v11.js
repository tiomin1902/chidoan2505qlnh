/* VIỆT SẮC 2505 — presentation interactions only; data and registration remain in original app.js */
(()=>{'use strict';
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const navButtons=[...document.querySelectorAll('[data-page]')];
  const applyActive=()=>{
    const page=document.body.dataset.currentPage||'home';
    navButtons.forEach(b=>{
      const current=b.dataset.page===page;
      if(b.closest('.desktopNav,#drawer')){
        b.classList.toggle('is-active',current);
        if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
      }
    });
  };
  new MutationObserver(applyActive).observe(document.body,{attributes:true,attributeFilter:['data-current-page']});
  applyActive();
  const drawer=document.getElementById('drawer');
  if(drawer){drawer.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('closeBtn')?.click()})}
  if(reduce||!('IntersectionObserver' in window))return;
  document.documentElement.classList.add('js-motion');
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.remove('ui-pending');e.target.classList.add('ui-revealed');observer.unobserve(e.target)}
  }),{rootMargin:'0px 0px 36px 0px',threshold:.06});
  function observe(){
    document.querySelectorAll('.homeSectionHead,.homeLinks>button,.news-section-heading,.news-card,.infoCard,.itemCard,.seriesCard,.panel:not(.ballotPanel)').forEach(el=>{
      if(el.classList.contains('ui-reveal'))return;
      el.classList.add('ui-reveal');
      // Do not hide already-visible content during refresh, or content above the fold.
      if(el.getBoundingClientRect().top > window.innerHeight+30){el.classList.add('ui-pending')}
      observer.observe(el);
    });
  }
  observe();
  const target=document.querySelector('main');
  if(target){let scheduled=false;const mutation=new MutationObserver(()=>{
    if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;observe()});
  });mutation.observe(target,{childList:true,subtree:true});}
})();
