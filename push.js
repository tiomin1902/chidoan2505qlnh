/* 2505QLNH V6 - Tự chọn nhận thông báo Web Push (OneSignal SDK v16) */
(()=>{
  'use strict';
  const appId=String(window.CLASS_PUSH_APP_ID||'').trim();
  const status=document.getElementById('pushStatus');
  const prefs=[...document.querySelectorAll('[data-push-pref]')];
  const enable=document.getElementById('pushEnable');
  const save=document.getElementById('pushSave');
  const disable=document.getElementById('pushDisable');
  const iosTip=document.getElementById('pushIosTip');
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const tagNames={Lop:'qlnh_news_lop',ChiDoan:'qlnh_news_doan',ChiHoi:'qlnh_news_hoi',Activity:'qlnh_activity',Reminder:'qlnh_reminder',News:'qlnh_news_feed',Notice:'qlnh_notice',CongressDoan:'qlnh_congress_doan',CongressHoi:'qlnh_congress_hoi',Election:'qlnh_election'};
  let sdk=null;const PUSH_NEWS_TAG=tagNames.News,PUSH_NOTICE_TAG=tagNames.Notice;
  const LAST_SID='qlnh_push_bound_subscription_v19_1';
  const CONSENT_KEY='qlnh_push_consent_v19_1';
  const DISABLED_KEY='qlnh_push_explicitly_disabled_v19_1';
  let syncQueue=Promise.resolve(),lastReconcile=0,deviceMapped=false;
  function getStoredId(){try{return localStorage.getItem(LAST_SID)||'';}catch(_){return '';}}
  function setStoredId(id){try{if(id)localStorage.setItem(LAST_SID,id);else localStorage.removeItem(LAST_SID);}catch(_){}}
  function setOptChoice(disabled){try{localStorage.setItem(DISABLED_KEY,disabled?'1':'0');}catch(_){}}
  function explicitDisabled(){try{return localStorage.getItem(DISABLED_KEY)==='1';}catch(_){return false;}}

  function message(text){if(status)status.textContent=text;}
  function selected(){return Object.fromEntries(prefs.map(x=>[tagNames[x.dataset.pushPref],x.checked?'1':'0']));}
  function remember(){try{localStorage.setItem('qlnh_device_push_choices',JSON.stringify(selected()));window.dispatchEvent(new Event('qlnh-prefs-changed'));}catch(e){}}
  let accountLoaded=false;
  async function restoreAccountPreferences(){
    try{
      const r=await window.QLNH.request('/api/notification-prefs');
      if(!r?.success||!r.prefs||typeof r.prefs!=='object')return;
      prefs.forEach(x=>{
        const tag=tagNames[x.dataset.pushPref];
        if(r.prefs[tag]==='0'||r.prefs[tag]==='1')x.checked=r.prefs[tag]==='1';
      });
      accountLoaded=true;remember();
      // If the current device already opted in, synchronize tags without requesting permission.
      if(sdk&&sdk.User?.PushSubscription?.optedIn)await sdk.User.addTags(selected());
    }catch(e){console.warn('Sử dụng lựa chọn thông báo đã lưu trên thiết bị',e);}
  }
  async function syncAccountPreferences(){
    try{await window.QLNH.request('/api/notification-prefs',{method:'POST',data:{prefs:selected()}});}
    catch(e){console.warn('Chưa đồng bộ được tùy chọn với tài khoản',e);message('Đã lưu trên thiết bị; chưa đồng bộ được tài khoản.');}
  }
  function updateStatus(){
    if(!sdk)return;
    let subscribed=false;
    try{subscribed=!!sdk.User.PushSubscription.optedIn;}catch(e){}
    message(subscribed?(deviceMapped?'Thông báo đang bật và đã đồng bộ với tài khoản.':'Đã bật trên thiết bị; chưa xác nhận đồng bộ với tài khoản.'): 'Chưa bật nhận thông báo trên thiết bị này.');
    if(enable)enable.textContent=subscribed?'ĐỒNG BỘ LẠI THIẾT BỊ':'BẬT NHẬN THÔNG BÁO';
    if(disable)disable.disabled=!subscribed;
  }
  if(isIOS&&!isStandalone&&iosTip)iosTip.hidden=false;
  async function restoreTags(){
    try{
      const tags=await sdk.User.getTags()||{};
      if(Object.keys(tags).some(x=>Object.values(tagNames).includes(x))){
        // Server-side per-account preferences are authoritative when already saved.
        if(!accountLoaded){
          prefs.forEach(x=>{if(Object.prototype.hasOwnProperty.call(tags,tagNames[x.dataset.pushPref]))x.checked=tags[tagNames[x.dataset.pushPref]]==='1';});
          // Existing combined categories are kept enabled unless the account separately opted out.
          // They will be tagged on the next explicit save or app visit with existing consent.
          if(sdk.User?.PushSubscription?.optedIn &&
            !Object.prototype.hasOwnProperty.call(tags,PUSH_NEWS_TAG) &&
            !Object.prototype.hasOwnProperty.call(tags,PUSH_NOTICE_TAG)){
              await sdk.User.addTags({[PUSH_NEWS_TAG]:'1',[PUSH_NOTICE_TAG]:'1'});
          }
          remember();
        }
      }
    }catch(e){}
  }
  async function saveTags(){
    if(!sdk)throw Error('Dịch vụ thông báo chưa sẵn sàng.');
    await sdk.User.addTags(selected());remember();await syncAccountPreferences();
  }
  // Serialize updates to the Cloudflare binding table to prevent races between
  // a changing OneSignal subscription ID and logout. Never request permission here.
  function syncV17Device(action,subscriptionId,strict=false){
    const task=syncQueue.catch(()=>{}).then(async()=>{
      const id=subscriptionId||sdk?.User?.PushSubscription?.id||getStoredId();
      if(!id||!window.QLNH?.authToken||window.QLNH_GUEST)return false;
      if(action==='bind'&&window.QLNH_PUSH_LOGGING_OUT)return false;
      await window.QLNH.request('/api/v17/push-device',{method:'POST',data:{action,subscriptionId:id}});
      if(action==='bind'){setStoredId(id);deviceMapped=true;}
      else if(getStoredId()===id){setStoredId('');deviceMapped=false;}
      return true;
    });
    syncQueue=task.catch(()=>{});
    if(strict)return task;
    return task.catch(e=>{if(action==='bind')deviceMapped=false;console.warn('Không đồng bộ được thiết bị Web Push:',e?.message||e);return false;});
  }
  async function reconcileDevice(force=false,strict=false){
    if(!sdk||!sdk.User?.PushSubscription?.optedIn||!window.QLNH?.authToken||window.QLNH_GUEST||window.QLNH_PUSH_LOGGING_OUT||explicitDisabled())return;
    const id=sdk.User.PushSubscription.id;
    if(!id)return; // The SDK may assign the ID later; change event will retry.
    const prev=getStoredId(),now=Date.now();
    if(!force&&prev===id&&now-lastReconcile<5*60*1000)return deviceMapped;
    lastReconcile=now;
    if(prev&&prev!==id){
      // A rotated ID must not leave the old record targeted forever.
      await syncV17Device('unbind',prev,strict);
    }
    return await syncV17Device('bind',id,strict);
  }
  window.QLNH_V17_UNBIND_DEVICE=async()=>{
    // Called only by explicit sign-out; the OneSignal subscription remains intact.
    // A backend error must not be swallowed because it could leak private delivery.
    await syncQueue;
    const id=getStoredId()||sdk?.User?.PushSubscription?.id;
    if(id&&window.QLNH?.authToken)await syncV17Device('unbind',id,true);
    return true;
  };
  async function activate(){
    if(!sdk)return message('Chưa kết nối được OneSignal.');
    if(isIOS&&!isStandalone)return message('Trên iPhone, bạn cần thêm website vào Màn hình chính rồi mở từ biểu tượng vừa thêm.');
    if(!sdk.Notifications.isPushSupported())return message('Trình duyệt này chưa hỗ trợ Web Push.');
    if(!prefs.some(x=>x.checked))return message('Hãy chọn ít nhất một loại thông báo muốn nhận.');
    // An existing subscriber can repair the backend link without permission dialogs.
    if(sdk.User?.PushSubscription?.optedIn&&!explicitDisabled()) {
      try{enable.disabled=true;await saveTags();const ok=await reconcileDevice(true,true);updateStatus();message(ok?'Đã đồng bộ lại thiết bị với tài khoản.':'Chưa có mã đăng ký thiết bị để đồng bộ.');}
      catch(e){message('Không đồng bộ được thiết bị: '+(e?.message||e));}
      finally{enable.disabled=false;}
      return;
    }
    // Chỉ yêu cầu quyền khi người dùng thực sự bấm bật thông báo.
    try{
      enable.disabled=true;
      await sdk.Notifications.requestPermission();
      if(!sdk.Notifications.permission){message('Bạn chưa cho phép thông báo trong cài đặt trình duyệt/điện thoại.');return;}
      await sdk.User.PushSubscription.optIn();
      await saveTags();
      setOptChoice(false);
      try{localStorage.setItem(CONSENT_KEY,'1');}catch(_){}
      const bound=await reconcileDevice(true,true);
      updateStatus();
      message(bound?'Đã bật thông báo và liên kết thiết bị với tài khoản.':'Đã bật thông báo trên thiết bị; đang chờ mã thiết bị để đồng bộ.');
    }catch(e){message('Không thể bật thông báo: '+(e?.message||e));}
    finally{enable.disabled=false;}
  }
  enable.onclick=activate;
  save.onclick=async()=>{
    if(!sdk)return message('Dịch vụ chưa sẵn sàng.');
    try{await saveTags();message('Đã cập nhật các chủ đề muốn nhận.');}catch(e){message('Không lưu được lựa chọn: '+(e?.message||e));}
  };
  const copy=document.getElementById('pushCopySubscription');if(copy)copy.onclick=async()=>{try{const v=sdk?.User?.PushSubscription?.id;if(!v)throw Error('Hãy bật thông báo trên thiết bị trước.');await navigator.clipboard.writeText(v);message('Đã sao chép mã thiết bị. Dán vào mục Gửi thử trong Admin.');}catch(e){message('Không sao chép được: '+(e.message||e));}};
  disable.onclick=async()=>{
    if(!sdk)return;
    try{
      await sdk.User.PushSubscription.optOut(); // Only explicit user action may do this.
      setOptChoice(true);
      await syncV17Device('unbind');
      updateStatus();message('Đã tắt nhận thông báo theo yêu cầu của bạn.');
    }
    catch(e){message('Không tắt được thông báo: '+(e?.message||e));}
  };
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(appId)){
    message('Quản trị viên chưa hoàn tất cài đặt hệ thống thông báo đẩy.');
    enable.disabled=true;save.disabled=true;disable.disabled=true;
  }else if(!('serviceWorker' in navigator)||!window.isSecureContext){
    message('Cần mở website qua HTTPS và sử dụng trình duyệt hỗ trợ service worker.');
    enable.disabled=true;save.disabled=true;disable.disabled=true;
  }else{
    const base=new URL('.',location.href).pathname;
    window.OneSignalDeferred=window.OneSignalDeferred||[];
    window.OneSignalDeferred.push(async function(OS){
      try{
        await OS.init({appId,serviceWorkerPath:base+'OneSignalSDKWorker.js',serviceWorkerParam:{scope:base},
          notifyButton:{enable:false},promptOptions:{slidedown:{prompts:[{type:'push',autoPrompt:false}]}}});
        sdk=OS;
        // An already-opted-in device is existing consent. We never automatically
        // optIn() or re-prompt devices that previously opted out themselves.
        if(sdk.User?.PushSubscription?.optedIn&&!explicitDisabled()){
          try{localStorage.setItem(CONSENT_KEY,'1');}catch(_){}
        }
        sdk.User?.PushSubscription?.addEventListener?.('change',()=>{reconcileDevice(true).then(updateStatus).catch(e=>console.warn('Push subscription changed',e));});
        await restoreAccountPreferences();await restoreTags();
        await reconcileDevice(true);
        updateStatus();
      }catch(e){message('Không khởi tạo được OneSignal: '+(e?.message||e));enable.disabled=true;save.disabled=true;}
    });
    const script=document.createElement('script');script.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';script.async=true;
    script.onerror=()=>message('Không tải được dịch vụ thông báo. Vui lòng kiểm tra kết nối.');document.head.appendChild(script);
  }
  // Recover the account-to-device mapping after network reconnection/app reopening.
  // These are read/sync operations; they NEVER call requestPermission or optIn.
  window.addEventListener('online',()=>{reconcileDevice(true).catch(()=>{});});
  window.addEventListener('pageshow',()=>{reconcileDevice(false).catch(()=>{});});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcileDevice(false).catch(()=>{});});
  // Khi mở thông báo, điều hướng vào đúng hoạt động/chuỗi thay vì bắt tìm lại.
  const params=new URL(location.href).searchParams;
  const targetActivity=params.get('activity');const targetSeries=params.get('series');
  if(targetActivity||targetSeries){
    let done=false;const list=document.getElementById('activityList');
    const locate=()=>{
      if(done||!list)return;
      const blocks=[...list.querySelectorAll('[data-activity-id], [data-series-id]')];
      const found=blocks.find(x=>targetActivity?x.dataset.activityId===targetActivity:x.dataset.seriesId===targetSeries);
      if(!found)return;
      done=true;
      if(typeof nav==='function')nav('activities');
      if(targetActivity){const d=found.closest('details.seriesCollapse');if(d)d.open=true;}
      if(targetSeries){const d=found.querySelector('details.seriesCollapse');if(d)d.open=true;}
      found.classList.add('push-highlight');
      requestAnimationFrame(()=>found.scrollIntoView({behavior:'smooth',block:'start'}));
      obs.disconnect();
    };
    const obs=new MutationObserver(locate);if(list)obs.observe(list,{childList:true,subtree:true});locate();
  }
})();
