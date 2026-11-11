/* LỚP 2505QLNH V15 – student login, remember device, first-time password reset. */
(()=>{'use strict';
 const API=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');
 const KEY='qlnh_student_session_v15';
 const $=x=>document.getElementById(x);const gate=$('studentAuthGate'),msg=$('studentAuthMessage');
 const loginForm=$('studentLoginForm'),changeForm=$('studentPasswordForm');
 const btn=$('studentLogoutBtn');
 let token='',me=null,loaded=false;
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
   async data(action,params={}){const q=new URLSearchParams({action});for(const [k,v] of Object.entries(params))q.set(k,String(v));return request('/api/data?'+q)},
   async write(action,payload={}){return request('/api/write',{method:'POST',data:{...payload,action}})}
 };
 function showLogin(){document.documentElement.classList.remove('qlnh-authenticated');gate.hidden=false;loginForm.hidden=false;changeForm.hidden=true;btn.hidden=true;}
 function showChange(){document.documentElement.classList.remove('qlnh-authenticated');gate.hidden=false;loginForm.hidden=true;changeForm.hidden=false;btn.hidden=false;say('Lần đầu đăng nhập: hãy tự đặt mật khẩu mới (tối thiểu 12 ký tự).');}
 async function loadApp(){
   if(loaded)return;
   const scripts=['./config.js','./app.js?v=15','./news.js?v=15','./push-config.js','./push.js?v=15','./grand-civic-v14.js?v=15'];
   for(const src of scripts){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Không tải được '+src));document.body.append(s);});}
   loaded=true;
 }
 async function openApp(student){me=student;window.QLNH_STUDENT=student;await loadApp();
   const n=$('studentAccountName');if(n)n.textContent=student.name||student.mssv;
   document.documentElement.classList.add('qlnh-authenticated');gate.hidden=true;btn.hidden=false;
 }
 async function restore(){token=storageGet();if(!token){showLogin();return;}say('Đang xác minh thiết bị đã ghi nhớ…');
   try{const response=await request('/api/me');me=response.student;if(me.mustChange)showChange();else await openApp(me);}
   catch(e){token='';storageDrop();showLogin();say(e.status===401?'Phiên cũ không còn hiệu lực. Vui lòng đăng nhập lại.':e.message,true);}
 }
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
 async function logout(){try{if(window.OneSignal?.User?.PushSubscription)await window.OneSignal.User.PushSubscription.optOut();}catch(e){}
   try{await request('/api/logout',{method:'POST',data:{}})}catch(e){}
   token='';me=null;storageDrop();window.QLNH_STUDENT=null;
   // Clear loaded private HTML from DOM, then reload into the locked login shell.
   location.replace(location.pathname);
 }
 document.querySelectorAll('[data-student-logout]').forEach(b=>b.addEventListener('click',logout));
 btn.addEventListener('click',logout);
 restore();
})();
