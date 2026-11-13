/* LỚP 2505QLNH V15 – student login, remember device, first-time password reset. */
(()=>{'use strict';
 const API=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');
 const KEY='qlnh_student_session_v15';const GUEST_PREF='qlnh_guest_preference_v16_3';
 const $=x=>document.getElementById(x);const gate=$('studentAuthGate'),msg=$('studentAuthMessage');
 const loginForm=$('studentLoginForm'),changeForm=$('studentPasswordForm');
 const btn=$('studentLogoutBtn');
 let token='',me=null,baseLoaded=false,privateLoaded=false,restoring=false,pendingTarget=null;
 window.QLNH_GUEST=false;
 const loadStatus=$('studentAuthLoadingStatus'),loadActions=$('studentAuthLoadingActions');
 function say(v,error=false){msg.textContent=v;msg.style.color=error?'#B42318':'#485268';}
 function storageGet(){try{return localStorage.getItem(KEY)||'';}catch(e){return ''}}
 function storageSet(t){try{localStorage.setItem(KEY,t)}catch(e){say('Trình duyệt đang chặn ghi nhớ, lần sau có thể phải đăng nhập lại.',true)}}
 function storageDrop(){try{localStorage.removeItem(KEY)}catch(e){}}
 async function request(path,opts={}){
   if(!/^https:\/\//.test(API)||API.includes('REPLACE-WITH'))throw Error('Chưa cấu hình cổng đăng nhập sinh viên trong student-auth-config.js');
   const {method='GET',data,credential=token}=opts;
   const headers={};if(data!==undefined)headers['content-type']='application/json';if(credential)headers.authorization='Bearer '+credential;
   let response;try{response=await fetch(API+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),cache:'no-store',credentials:'omit'});}catch(e){throw Error('Không thể kết nối máy chủ. Kiểm tra mạng và địa chỉ Worker.');}
   const json=await response.json().catch(()=>({message:'Phản hồi máy chủ không hợp lệ'}));
   if(!response.ok){const err=new Error(json.message||'Yêu cầu thất bại');err.status=response.status;throw err;}
   return json;
 }
 window.QLNH={
   request,
   get authToken(){return token},
   get student(){return me},
   async data(action,params={}){const q=new URLSearchParams({action});for(const [k,v] of Object.entries(params))q.set(k,String(v));return request((window.QLNH_GUEST?'/api/guest/data?':'/api/data?')+q,{credential:window.QLNH_GUEST?'':token})},
   async write(action,payload={}){if(window.QLNH_GUEST){requestStudentLogin('activities');throw Error('Vui lòng đăng nhập để sử dụng chức năng này');}return request('/api/write',{method:'POST',data:{...payload,action}})}
 };
 function showLogin(){if($('studentGuestBtn'))$('studentGuestBtn').hidden=false;document.getElementById('drawer')?.classList.remove('open');if(document.getElementById('shade'))document.getElementById('shade').hidden=true;window.QLNH_GUEST=false;document.documentElement.classList.remove('qlnh-authenticated','qlnh-guest','qlnh-session-pending');gate.hidden=false;loginForm.hidden=false;changeForm.hidden=true;btn.hidden=true;}
 function showChange(){if($('studentGuestBtn'))$('studentGuestBtn').hidden=true;document.documentElement.classList.remove('qlnh-authenticated','qlnh-session-pending');gate.hidden=false;loginForm.hidden=true;changeForm.hidden=false;btn.hidden=false;say('Lần đầu đăng nhập: hãy tự đặt mật khẩu mới (tối thiểu 12 ký tự).');}
 async function loadApp(privateMode){
   const load=async src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(Error('Không tải được '+src));document.body.append(script);});
   if(!baseLoaded){
     for(const src of ['./config.js','./app.js?v=16.3.1','./news.js?v=16.3.2','./grand-civic-v14.js?v=16.3.1','./qlnh-document-viewer.js?v=19.2.0','./v17-student.js?v=19.2.0','./qlnh-deeplink.js?v=19.2.0'])await load(src);
     baseLoaded=true;
   }
   if(privateMode&&!privateLoaded){
     for(const src of ['./push-config.js','./push.js?v=19.1.0','./notification-center.js?v=16.3.1'])await load(src);
     privateLoaded=true;
   }
 }
 // V19.1: Entering guest mode must NEVER unsubscribe this browser from Web Push.
 // Guest does not load the private push module, read private data or bind any student.
 // A push subscription is browser-level state and survives normal GitHub deployments.
 // Account-targeted delivery is controlled by the authenticated Cloudflare mapping.
 async function openGuest(){
   if(token){showLogin();return;}
   window.QLNH_GUEST=true;window.QLNH_STUDENT=null;
   document.documentElement.classList.remove('qlnh-authenticated','qlnh-session-pending');
   document.documentElement.classList.add('qlnh-guest');gate.hidden=true;btn.hidden=true;
   try{localStorage.setItem(GUEST_PREF,'1');}catch(_){}
   await loadApp(false);
   // Guest must actually fetch public content (not merely reveal empty sections).
   // Retry once after scripts have loaded; no student token, Push SDK or private API.
   if(typeof window.refresh==='function')await window.refresh(false,true);
   if(typeof window.QLNH_REFRESH_NEWS==='function')await window.QLNH_REFRESH_NEWS();
 }
 async function openApp(student){
   me=student;window.QLNH_STUDENT=student;window.QLNH_GUEST=false;
   document.documentElement.classList.remove('qlnh-session-pending','qlnh-guest');
   document.documentElement.classList.add('qlnh-authenticated');gate.hidden=true;btn.hidden=false;
   try{localStorage.removeItem(GUEST_PREF);}catch(_){}
   const n=$('studentAccountName');if(n)n.textContent=student.name||student.mssv;
   await loadApp(true);
   const deepLink=!!new URL(location.href).searchParams.toString().match(/(?:^|&)(activity|series|vote|congress|proposal|results)=/);
   if(deepLink&&typeof v8DeepLinkDone!=='undefined')v8DeepLinkDone=false;
   if(typeof window.refresh==='function')await window.refresh(false,true);
   else if(typeof refresh==='function')await refresh(false,true);
   if(typeof window.QLNH_REFRESH_NEWS==='function')await window.QLNH_REFRESH_NEWS();
   window.QLNH_V17_REFRESH?.();
   const v17Target=new URL(location.href).searchParams.get('v17');
   if(['documents','exams'].includes(v17Target)&&typeof window.nav==='function')window.nav(v17Target);
   if(pendingTarget&&!deepLink&&typeof window.nav==='function'&&!new URL(location.href).searchParams.has('qlnh_doc'))window.nav(pendingTarget);
   pendingTarget=null;
   // Do not consume a direct content route before app scripts and authentication are ready.
   try{await window.QLNH_V192_HANDLE_URL?.(location.href);}catch(e){console.warn('Không mở được nội dung trực tiếp:',e);}
 }
 function requestStudentLogin(page){
   pendingTarget=typeof page==='string'&&['activities','attendance','pushPrefs','notificationCenter','ballot','doan','hoi','exams','documents'].includes(page)?page:'home';
   const dialog=$('guestAuthDialog');if(dialog){dialog.hidden=false;$('guestAuthConfirm')?.focus();}
 }
 window.QLNH_GUEST_REQUIRE_LOGIN=requestStudentLogin;
 $('guestAuthCancel')?.addEventListener('click',()=>{$('guestAuthDialog').hidden=true;});
 $('guestAuthConfirm')?.addEventListener('click',()=>{$('guestAuthDialog').hidden=true;showLogin();$('studentMssv')?.focus();});
 $('drawerGuestLogin')?.addEventListener('click',()=>{pendingTarget=null;showLogin();});
 $('guestHeaderLogin')?.addEventListener('click',()=>{pendingTarget=null;showLogin();});
 $('studentGuestBtn')?.addEventListener('click',async()=>{try{if(token){say('Thiết bị còn phiên đăng nhập; vui lòng đăng xuất trước khi dùng chế độ khách.',true);return;}me=null;storageDrop();await openGuest();}catch(e){showLogin();say(e.message,true);}});
 async function restore(){
   if(restoring)return;
   token=storageGet();if(!token){let useGuest=false;try{useGuest=localStorage.getItem(GUEST_PREF)==='1'}catch(_){}if(useGuest){try{await openGuest()}catch(e){showLogin();say(e.message,true)}}else showLogin();return;}
   restoring=true;document.documentElement.classList.add('qlnh-session-pending');
   if(loadActions)loadActions.style.display='none';
   if(loadStatus)loadStatus.textContent='Đang xác minh thiết bị và mở trang chính…';
   try{
     const response=await request('/api/me');
     if(!response||!response.student)throw Error('Không đọc được trạng thái tài khoản.');
     me=response.student;
     if(me.mustChange)showChange();else await openApp(me);
   }catch(e){
     // Only an explicit 401/403 may invalidate a remembered session.
     // Offline/server errors must not silently log the student out.
     if(e.status===401||e.status===403){
       token='';me=null;storageDrop();showLogin();
       say('Phiên đăng nhập đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.',true);
     }else{
       if(loadStatus)loadStatus.textContent='Chưa thể kết nối để xác minh phiên đăng nhập. Kiểm tra mạng rồi thử lại.';
       if(loadActions)loadActions.style.display='flex';
     }
   }finally{restoring=false;}
 }
 if($('studentAuthRetry'))$('studentAuthRetry').addEventListener('click',restore);
 if($('studentAuthForgetDevice'))$('studentAuthForgetDevice').addEventListener('click',async()=>{
   if(token){await logout();return;} // Explicitly detach before clearing an active session.
   token='';me=null;storageDrop();showLogin();say('Đã chuyển sang đăng nhập tài khoản khác.');
 });
 window.addEventListener('online',()=>{
   if(document.documentElement.classList.contains('qlnh-session-pending')&&storageGet())restore();
 });
 loginForm.addEventListener('submit',async e=>{e.preventDefault();const submit=loginForm.querySelector('button[type=submit]');submit.disabled=true;say('Đang xác minh tài khoản…');
   try{const payload={mssv:$('studentMssv').value.trim(),password:$('studentPassword').value};const result=await request('/api/login',{method:'POST',data:payload,credential:''});token=result.token;storageSet(token);$('studentPassword').value='';me=result.student;
     if(me.mustChange)showChange();else await openApp(me);
   }catch(err){say(err.message,true)}finally{submit.disabled=false;}
 });
 changeForm.addEventListener('submit',async e=>{e.preventDefault();const a=$('studentNewPassword').value,b=$('studentConfirmPassword').value;
   if(a!==b)return say('Hai mật khẩu không trùng khớp.',true);if(a.length<12)return say('Mật khẩu phải có ít nhất 12 ký tự.',true);
   const button=changeForm.querySelector('button[type=submit]');button.disabled=true;
   try{await request('/api/password',{method:'POST',data:{password:a}});changeForm.reset();const r=await request('/api/me');await openApp(r.student);}catch(err){say(err.message,true)}finally{button.disabled=false;}
 });
 async function logout(){
   // Logout detaches account delivery on the server, but retains the browser's
   // already-granted Web Push subscription. Do NOT optOut()/unsubscribe() here.
   window.QLNH_PUSH_LOGGING_OUT=true;
   try{
     if(typeof window.QLNH_V17_UNBIND_DEVICE==='function'){
       await window.QLNH_V17_UNBIND_DEVICE();
     }else{
       const sid=(window.OneSignal?.User?.PushSubscription?.id||
         localStorage.getItem('qlnh_push_bound_subscription_v19_1')||'');
       if(sid&&token)await request('/api/v17/push-device',{method:'POST',data:{action:'unbind',subscriptionId:sid}});
     }
     try{localStorage.removeItem('qlnh_push_bound_subscription_v19_1');}catch(_){}
   }catch(e){
     // Fail closed: never leave this device bound to a previous student account
     // when local session is cleared without server confirmation.
     window.QLNH_PUSH_LOGGING_OUT=false;
     say('Chưa thể tách thiết bị khỏi tài khoản để đăng xuất an toàn. Kiểm tra mạng rồi thử lại.',true);
     return;
   }
   try{await request('/api/logout',{method:'POST',data:{}})}catch(e){}
   token='';me=null;storageDrop();window.QLNH_STUDENT=null;window.QLNH_GUEST=false;
   try{localStorage.removeItem(GUEST_PREF)}catch(_){}
   // Explicitly logged-out users no longer receive targeted student notifications;
   // an existing browser permission is preserved for their next authorized login.
   location.replace(location.pathname);
 }
 document.querySelectorAll('[data-student-logout]').forEach(b=>b.addEventListener('click',logout));
 btn.addEventListener('click',logout);
 restore();
})();
