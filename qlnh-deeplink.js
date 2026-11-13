/* 2505QLNH V19.2 – stable same-origin routes; no secrets or PII in URLs. */
(()=>{'use strict';
  let navigating=false;
  const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(id);
  const base=new URL('./',location.href);
  const inside=url=>url.origin===location.origin&&(url.pathname===base.pathname||url.pathname===base.pathname+'index.html');
  const normalize=raw=>{try{const u=new URL(raw,location.href);return inside(u)?u:null;}catch(_){return null;}};
  async function handle(raw){
    const u=normalize(raw||location.href);if(!u)return false;
    if(!window.QLNH?.authToken||window.QLNH_GUEST)return false;
    const docId=u.searchParams.get('qlnh_doc'),examId=u.searchParams.get('qlnh_exam');
    if(validId(docId)){
      window.nav?.('documents');
      if(typeof window.QLNH_V192_OPEN_DOC!=='function')return false;
      await window.QLNH_V192_OPEN_DOC(docId,{preview:u.searchParams.get('qlnh_preview')==='1'});
      return true;
    }
    if(validId(examId)){
      window.nav?.('exams');
      if(typeof window.QLNH_V192_FOCUS_EXAM==='function')await window.QLNH_V192_FOCUS_EXAM(examId);
      return true;
    }
    if(u.searchParams.get('v17')==='documents'){window.nav?.('documents');return true;}
    if(u.searchParams.get('v17')==='exams'){window.nav?.('exams');return true;}
    return false;
  }
  window.QLNH_V192_HANDLE_URL=async raw=>{if(navigating)return false;navigating=true;try{return await handle(raw);}finally{navigating=false;}};
  window.QLNH_V192_OPEN_NOTIFICATION=async raw=>{
    const u=normalize(raw);if(!u)return false;
    if(!window.QLNH?.authToken||window.QLNH_GUEST){location.assign(u.href);return true;}
    if(u.href!==location.href)history.pushState({qlnhDeepLink:true},'',u.href);
    if(await window.QLNH_V192_HANDLE_URL(u.href))return true;
    // Preserve existing routing for news, activities, elections, congresses, etc.
    location.assign(u.href);return true;
  };
  window.addEventListener('popstate',()=>{window.QLNH_V192_HANDLE_URL(location.href).catch(console.warn);});
})();
