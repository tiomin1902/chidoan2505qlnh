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
  const tagNames={Lop:'qlnh_news_lop',ChiDoan:'qlnh_news_doan',ChiHoi:'qlnh_news_hoi',Activity:'qlnh_activity',Reminder:'qlnh_reminder'};
  let sdk=null;
  function message(text){if(status)status.textContent=text;}
  function selected(){return Object.fromEntries(prefs.map(x=>[tagNames[x.dataset.pushPref],x.checked?'1':'0']));}
  function updateStatus(){
    if(!sdk)return;
    let subscribed=false;
    try{subscribed=!!sdk.User.PushSubscription.optedIn;}catch(e){}
    message(subscribed?'Thông báo đang bật trên thiết bị này.':'Chưa bật nhận thông báo trên thiết bị này.');
    if(enable)enable.textContent=subscribed?'BẬT LẠI THÔNG BÁO':'BẬT NHẬN THÔNG BÁO';
    if(disable)disable.disabled=!subscribed;
  }
  if(isIOS&&!isStandalone&&iosTip)iosTip.hidden=false;
  function restoreTags(){
    try{
      const tags=sdk.User.getTags()||{};
      if(Object.keys(tags).some(x=>Object.values(tagNames).includes(x))){
        prefs.forEach(x=>{x.checked=tags[tagNames[x.dataset.pushPref]]==='1';});
      }
    }catch(e){}
  }
  async function saveTags(){
    if(!sdk)throw Error('Dịch vụ thông báo chưa sẵn sàng.');
    sdk.User.addTags(selected());
  }
  async function activate(){
    if(!sdk)return message('Chưa kết nối được OneSignal.');
    if(isIOS&&!isStandalone)return message('Trên iPhone, bạn cần thêm website vào Màn hình chính rồi mở từ biểu tượng vừa thêm.');
    if(!sdk.Notifications.isPushSupported())return message('Trình duyệt này chưa hỗ trợ Web Push.');
    if(!prefs.some(x=>x.checked))return message('Hãy chọn ít nhất một loại thông báo muốn nhận.');
    // Phải gọi quyền ở sự kiện nhấn thật của người dùng, đặc biệt trên iPhone.
    try{
      enable.disabled=true;
      await sdk.Notifications.requestPermission();
      if(!sdk.Notifications.permission){message('Bạn chưa cho phép thông báo trong cài đặt trình duyệt/điện thoại.');return;}
      await sdk.User.PushSubscription.optIn();
      await saveTags();
      updateStatus();
      message('ĐĂNG KÝ NHẬN THÔNG BÁO THÀNH CÔNG. Thiết bị đã kết nối với LỚP 2505QLNH và sẽ nhận tin theo chủ đề bạn chọn.');
    }catch(e){message('Không thể bật thông báo: '+(e?.message||e));}
    finally{enable.disabled=false;}
  }
  enable.onclick=activate;
  save.onclick=async()=>{
    if(!sdk)return message('Dịch vụ chưa sẵn sàng.');
    try{await saveTags();message('Đã cập nhật các chủ đề muốn nhận.');}catch(e){message('Không lưu được lựa chọn: '+(e?.message||e));}
  };
  disable.onclick=async()=>{
    if(!sdk)return;
    try{await sdk.User.PushSubscription.optOut();updateStatus();message('Đã tắt nhận thông báo trên thiết bị này.');}
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
        sdk=OS;restoreTags();updateStatus();
      }catch(e){message('Không khởi tạo được OneSignal: '+(e?.message||e));enable.disabled=true;save.disabled=true;}
    });
    const script=document.createElement('script');script.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';script.async=true;
    script.onerror=()=>message('Không tải được dịch vụ thông báo. Vui lòng kiểm tra kết nối.');document.head.appendChild(script);
  }
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
