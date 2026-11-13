/* LỚP 2505QLNH · Public site audio control V20.9. No private auth data. */
(()=>{'use strict';
 const KEY='qlnh_site_music_choice_v1',VOLKEY='qlnh_site_music_volume_v1';
 let config=null,lastSrc='',isPending=false,loading=false;
 const root=document.createElement('div');root.id='qlnhMusicWidget';root.className='qlnh-music-widget';root.hidden=true;
 root.innerHTML=`<div class="qlnh-music-panel" id="qlnhMusicPanel" hidden><strong id="qlnhMusicTitle">Âm nhạc website</strong><p>Nhạc do lớp lựa chọn. Bạn có thể tắt bất cứ lúc nào.</p><label class="qlnh-music-volume">Âm lượng <input type="range" id="qlnhMusicVolume" min="0" max="100" step="1" value="35" aria-label="Điều chỉnh âm lượng nhạc nền"></label><p class="qlnh-music-status" id="qlnhMusicStatus" role="status"></p></div><div class="qlnh-music-actions"><button id="qlnhMusicSettings" class="qlnh-music-settings" type="button" aria-label="Tùy chỉnh nhạc nền" aria-expanded="false" aria-controls="qlnhMusicPanel">♫</button><button id="qlnhMusicToggle" class="qlnh-music-toggle" type="button" aria-pressed="false" aria-label="Phát nhạc nền"><span class="qlnh-music-note" aria-hidden="true">♪</span><span id="qlnhMusicToggleLabel">Bật nhạc</span></button></div><audio id="qlnhMusicAudio" preload="none" playsinline></audio>`;
 document.body.append(root);
 const byId=id=>document.getElementById(id),audio=byId('qlnhMusicAudio'),play=byId('qlnhMusicToggle'),settings=byId('qlnhMusicSettings'),panel=byId('qlnhMusicPanel'),slider=byId('qlnhMusicVolume'),status=byId('qlnhMusicStatus'),label=byId('qlnhMusicToggleLabel');
 const stored=(key)=>{try{return localStorage.getItem(key)}catch(e){return null}};
 const save=(key,value)=>{try{localStorage.setItem(key,value)}catch(e){}};
 const enabledChoice=()=>stored(KEY);
 function applyVisual(){const playing=!audio.paused;play.setAttribute('aria-pressed',playing?'true':'false');label.textContent=playing?'Tắt nhạc':'Bật nhạc';play.setAttribute('aria-label',playing?'Tắt nhạc nền':'Phát nhạc nền');}
 function say(value){status.textContent=value||'';}
 function configure(result){
   const gateway=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');
   const managed=result?.managed===true;
   const source=managed && /^https:\/\//i.test(gateway)
     ?gateway+'/api/guest/music.mp3?rev='+encodeURIComponent(String(result.revision||0))
     :String(result?.url||'');
   if(result?.success!==true||result.enabled!==true||!/^https:\/\//i.test(source)){audio.pause();audio.removeAttribute('src');lastSrc='';config=null;root.hidden=true;applyVisual();return;}
   const previous=config;config={...result,playbackSource:source};root.hidden=false;
   byId('qlnhMusicTitle').textContent=String(config.title||'Giai điệu tri ân');
   if(lastSrc!==source){audio.pause();lastSrc=source;audio.src=source;audio.load();}
   audio.loop=config.loop!==false;
   const preference=stored(VOLKEY),vol=preference!==null?Number(preference):Math.round((Number.isFinite(Number(config.volume))?Number(config.volume):.35)*100);
   const bounded=Math.min(100,Math.max(0,Number.isFinite(vol)?vol:35));slider.value=String(bounded);audio.volume=bounded/100;
   if(!previous||previous.playbackSource!==config.playbackSource){
     if(enabledChoice()==='off'){say('Bạn đã tắt nhạc trên thiết bị này.');return;}
     if(config.autoplayTry===true || enabledChoice()==='on')start(false);
   }
 }
 async function start(byUser){if(!config||isPending)return;isPending=true;
   try{await audio.play();if(byUser)save(KEY,'on');say('Đang phát · '+String(config.title||'Nhạc nền'));}
   catch(e){if(byUser){say('Không phát được nhạc. Nếu dùng file tải lên, kiểm tra Apps Script và Cloudflare Worker đã cập nhật V21.0.');}else{say('Chạm “Bật nhạc” để nghe (trình duyệt có thể chặn tự phát).');}}
   finally{isPending=false;applyVisual();}
 }
 function stop(){audio.pause();save(KEY,'off');say('Đã tắt nhạc trên thiết bị này.');applyVisual();}
 play.addEventListener('click',()=>{if(audio.paused){start(true);}else stop();});
 settings.addEventListener('click',()=>{panel.hidden=!panel.hidden;settings.setAttribute('aria-expanded',String(!panel.hidden));});
 slider.addEventListener('input',()=>{audio.volume=Math.max(0,Math.min(1,Number(slider.value)/100));save(VOLKEY,String(slider.value));});
 audio.addEventListener('play',applyVisual);audio.addEventListener('pause',applyVisual);
 audio.addEventListener('error',()=>{say('Không tải được MP3. Kiểm tra cổng phát nhạc hoặc quyền chia sẻ của tệp đã tải lên.');applyVisual();});
 async function refresh(){if(loading)return;loading=true;try{
   const gateway=String(window.QLNH_GATEWAY_URL||'').replace(/\/+$/,'');if(!/^https:\/\//i.test(gateway))return;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
   try{const response=await fetch(gateway+'/api/guest/data?action=music',{cache:'no-store',credentials:'omit',signal:controller.signal});
     if(!response.ok)throw Error('Không tải được cấu hình nhạc');configure(await response.json());}
   finally{clearTimeout(timer);}
 }catch(e){if(!config)root.hidden=true;console.warn('Không đồng bộ nhạc nền:',e);}finally{loading=false;}}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 setInterval(()=>{if(!document.hidden)refresh();},180000);
 refresh();
})();
