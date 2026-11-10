/* THE NEW ERA V12 — visual interactions only, không gọi API và không đổi nghiệp vụ */
(()=>{'use strict';
 const buttons=Array.from(document.querySelectorAll('[data-page]'));
 const titles={home:'Trang chủ',class:'Tập thể lớp',doan:'Chi đoàn',hoi:'Chi hội',activities:'Hoạt động',attendance:'Điểm danh',news:'Bản tin',newsDetail:'Bài viết',pushPrefs:'Thông báo',ballot:'Phiếu bầu',voteStandalone:'Phiếu bầu'};
 const updateNav=()=>{
   const page=document.body.dataset.currentPage||'home';
   buttons.forEach(b=>{if(!b.closest('.desktopNav,#drawer'))return;
     const selected=b.dataset.page===page;b.classList.toggle('is-active',selected);
     if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
   document.title=(titles[page]||'LỚP 2505QLNH')+' | LỚP 2505QLNH';
 };
 new MutationObserver(updateNav).observe(document.body,{attributes:true,attributeFilter:['data-current-page']});updateNav();
 const drawer=document.getElementById('drawer');
 drawer?.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('closeBtn')?.click()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer?.classList.contains('open'))document.getElementById('closeBtn')?.click()});
 // Ảnh thật không tải được: giữ lại layout nghệ thuật, không để icon ảnh hỏng / alt text chồng lên.
 const coverPhoto=document.querySelector('.coverPhoto>img');
 if(coverPhoto){coverPhoto.addEventListener('error',()=>{coverPhoto.hidden=true;document.querySelector('.coverPhoto')?.classList.add('photo-failed')});
  if(coverPhoto.complete&&coverPhoto.naturalWidth===0){coverPhoto.hidden=true;document.querySelector('.coverPhoto')?.classList.add('photo-failed')}}
 // Hiệu ứng nhẹ không làm nội dung biến mất khi script dừng; transition không phụ thuộc IO.
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in-view');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px 40px 0px'});
  document.querySelectorAll('.chapterLinks>button,.editorialHeading,.homeEventSection,.news-home,.branchHeading,.hoiCoverBody,.mastheadMain').forEach(el=>observer.observe(el));
 }
 const applyScroll=()=>document.querySelector('.top')?.classList.toggle('is-scrolled',scrollY>32);
 addEventListener('scroll',applyScroll,{passive:true});applyScroll();
})();
