/* V19.9 – PUBLIC 20/11 theme: no login requirement, no private student data. */
(()=>{'use strict';
const DEFAULT_WISH='Nhân ngày Nhà giáo Việt Nam 20/11, tập thể LỚP 2505QLNH xin gửi đến cô những lời chúc tốt đẹp và chân thành nhất.\n\nChúng em kính chúc cô luôn mạnh khỏe, hạnh phúc, tràn đầy niềm vui và luôn giữ mãi ngọn lửa nhiệt huyết với sự nghiệp trồng người.\n\nCảm ơn cô vì sự quan tâm, tận tình hướng dẫn, đồng hành và dìu dắt chúng em trên hành trình học tập, trưởng thành.\n\nSự tận tâm và những lời chỉ bảo của cô luôn là nguồn động viên quý giá đối với tập thể lớp.\n\nKính chúc cô có một ngày 20/11 thật ấm áp, ngập tràn yêu thương và những kỷ niệm đẹp!';
const defaults={mode:'auto',start:'2026-11-13T00:00',end:'2026-11-20T23:59',title:'KÍNH CHÚC CÔ NGÀY NHÀ GIÁO VIỆT NAM 20/11 THẬT Ý NGHĨA!',tagline:'Tôn sư trọng đạo – Tri ân người lái đò',wish:DEFAULT_WISH,publicWish:true,photoUrl:''};
let config=defaults,appConfig=null;
const $=id=>document.getElementById(id);
function isActive(o){if(o.mode==='off')return false;if(o.mode==='on')return true;const now=Date.now(),start=Date.parse(String(o.start||'')+':00+07:00'),end=Date.parse(String(o.end||'')+':59+07:00');return Number.isFinite(start)&&Number.isFinite(end)&&now>=start&&now<=end;}
function bindWords(){
  document.querySelectorAll('[data-theme-title]').forEach(el=>el.textContent=String(config.title||defaults.title));
  document.querySelectorAll('[data-theme-tagline]').forEach(el=>el.textContent=String(config.tagline||defaults.tagline));
  document.querySelectorAll('[data-theme-wish]').forEach(el=>el.textContent=config.publicWish===false?'':String(config.wish||defaults.wish));
  const hasGreeting=config.publicWish!==false;
  if($('teacherTribute'))$('teacherTribute').hidden=!document.documentElement.classList.contains('theme-2011')||!hasGreeting;
  if($('advisorSpotlight'))$('advisorSpotlight').hidden=!document.documentElement.classList.contains('theme-2011');
  document.querySelectorAll('.theme-login-wish').forEach(el=>el.hidden=!hasGreeting);
  document.querySelectorAll('.theme-advisor-letter').forEach(el=>el.hidden=!hasGreeting);
  const teacher=String(appConfig?.coVan||'').trim();
  const hidden=['true','1'].includes(String(appConfig?.lop_anCoVan||'').toLowerCase());
  const name=teacher&&!hidden?teacher:'';
  if($('themeRecipient'))$('themeRecipient').textContent=name?'Kính gửi '+(/^cô\s/i.test(name)?name:'cô '+name):'Kính gửi cô Cố vấn học tập';
  if($('themeAdvisorName'))$('themeAdvisorName').textContent=name||'Cố vấn học tập LỚP 2505QLNH';
  const portrait=$('themeAdvisorPortrait');
  if(portrait){const old=portrait.querySelector('img');if(old)old.remove();if(/^https:\/\//i.test(String(config.photoUrl||''))){const img=document.createElement('img');img.src=config.photoUrl;img.alt='Ảnh cô cố vấn học tập được quản trị viên cho phép công khai';img.loading='lazy';img.onerror=()=>img.remove();portrait.prepend(img);}}
}
function apply(value){config={...defaults,...value};const active=typeof value?.active==='boolean'?value.active:isActive(config);document.documentElement.classList.toggle('theme-2011',!!active);bindWords();}
async function load(){const api=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');if(!/^https:\/\//i.test(api)){apply(defaults);return;}
 try{const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),6500);
 let result;try{const resp=await fetch(api+'/api/guest/data?action=theme2011',{cache:'no-store',credentials:'omit',signal:ctrl.signal});if(!resp.ok)throw Error('Theme endpoint unavailable');result=await resp.json();}finally{clearTimeout(timeout);}
 if(result?.success!==true)throw Error('Theme format invalid');apply(result);
 }catch(e){console.warn('Không tải được cấu hình 20/11; ẩn chủ đề để tôn trọng cài đặt Admin.',e);apply({...defaults,mode:'off'});}
}
window.QLNH_THEME2011_SET_PUBLIC_CONFIG=c=>{appConfig=c&&typeof c==='object'?c:null;bindWords();};
$('themeGoAdvisor')?.addEventListener('click',()=>{if(typeof window.nav==='function')window.nav('class');else document.querySelector('[data-page="class"]')?.click();setTimeout(()=>$('advisorSpotlight')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}),70);});
$('themeMenuAdvisor')?.addEventListener('click',()=>setTimeout(()=>$('advisorSpotlight')?.scrollIntoView({behavior:'smooth',block:'start'}),80));
// Theme status refreshes without forcing a new session or page reload.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
setInterval(()=>{if(!document.hidden)load();},300000);
// The visitor can read the entire greeting on the login screen, or enter existing guest mode.
load();
})();
