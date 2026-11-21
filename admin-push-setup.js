/* 2505QLNH - first-party OneSignal device registration; never stores Admin sessions. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);const API=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');
 const appId=String(window.CLASS_PUSH_APP_ID||'');
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 let sdk=null,proofToken='';
 function say(x,error=false){$('status').textContent=x;$('status').style.color=error?'#a42130':'#176044';}
 if(ios&&!standalone){$('iosTip').hidden=false;$('pairButton').disabled=true;say('Hãy thêm trang này vào Màn hình chính trước khi đăng ký Push.',true);}
 else if(!('serviceWorker' in navigator)||!window.isSecureContext){$('pairButton').disabled=true;say('Thiết bị hoặc trình duyệt không hỗ trợ Web Push qua HTTPS.',true);}
 if(!/^[a-f0-9-]{36}$/i.test(appId)||!/^https:\/\//.test(API)){$('pairButton').disabled=true;say('Thiếu cấu hình OneSignal hoặc Worker công khai.',true);}
 async function post(path,obj){
  const res=await fetch(API+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(obj),credentials:'omit',cache:'no-store'});
  const json=await res.json().catch(()=>({}));if(!res.ok||!json.success)throw Error(json.message||'Yêu cầu thất bại ('+res.status+')');return json;
 }
 function loadSDK(){return new Promise((resolve,reject)=>{
  if(sdk){resolve(sdk);return;}
  window.OneSignalDeferred=window.OneSignalDeferred||[];
  window.OneSignalDeferred.push(async OS=>{
   try{const root=new URL('.',location.href).pathname;
    await OS.init({appId,serviceWorkerPath:root+'OneSignalSDKWorker.js',serviceWorkerParam:{scope:root},notifyButton:{enable:false}});
    sdk=OS;resolve(OS);
   }catch(e){reject(e);}
  });
  const script=document.createElement('script');script.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';script.async=true;script.onerror=()=>reject(Error('Không tải được OneSignal SDK'));document.head.appendChild(script);
 })}
 $('pairButton').onclick=async()=>{
  const btn=$('pairButton'),code=$('pairCode').value.trim(),name=$('deviceName').value.trim();
  if(!/^[A-Za-z0-9_-]{24}$/.test(code)){say('Mã liên kết không đúng định dạng.',true);return;}
  if(!name){say('Hãy đặt tên thiết bị.',true);return;}
  btn.disabled=true;say('Đang kiểm tra quyền thông báo và ghép nối…');
  try{
   const OS=await loadSDK();
   if(!OS.User?.PushSubscription?.optedIn){
    if(OS.Notifications?.permission===false && typeof OS.Notifications.requestPermission==='function')await OS.Notifications.requestPermission();
    if(OS.User?.PushSubscription?.optIn)await OS.User.PushSubscription.optIn();
   }
   if(!OS.User?.PushSubscription?.optedIn || !OS.User?.PushSubscription?.id)throw Error('Chưa cấp quyền hoặc chưa có Subscription ID. Kiểm tra thông báo trình duyệt.');
   const result=await post('/api/admin-push/begin',{code,subscriptionId:OS.User.PushSubscription.id,name});
   proofToken=result.proofToken;$('begin').hidden=true;$('verify').hidden=false;
   say('Đã gửi yêu cầu xác minh. Mở thông báo mới trên điện thoại và nhập mã vào đây.');
  }catch(e){say(e.message||String(e),true);}finally{btn.disabled=false;}
 };
 $('verifyButton').onclick=async()=>{
  const b=$('verifyButton');b.disabled=true;
  try{
   const code=$('verifyCode').value.trim();if(!/^\d{6}$/.test(code))throw Error('Nhập đủ 6 chữ số.');
   await post('/api/admin-push/verify',{proofToken,code});proofToken='';
   $('verify').hidden=true;say('Thiết bị đã xác minh! Quay về Admin để tùy chỉnh loại Push và gửi thử.');
  }catch(e){say(e.message||String(e),true);}finally{b.disabled=false;}
 };
 $('resetButton').onclick=()=>{proofToken='';$('verify').hidden=true;$('begin').hidden=false;say('Tạo mã liên kết mới trong Admin nếu mã cũ đã sử dụng.');};
})();
