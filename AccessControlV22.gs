/** V22 – delegated admin sessions and explicit RPC allowlist. Legacy auth_ remains super-only
 * except for a single server-local, unexported capability active during a checked RPC.
 * No browser receives an elevated token. New permissions are denied unless explicitly mapped.
 */
var QLNH_ACL_CAP_=null;
function qlnhAclSuper_(token){if(QLNH_ACL_CAP_)throw Error('Chỉ Super Admin');return auth_(token);}
function qlnhAclWorker_(action,payload){return v17WorkerRequest_('/admin/acl/'+action,payload||{});}
function qlnhAclLogin_(user,password){const p=PropertiesService.getScriptProperties(),u=String(user||'').trim().toLowerCase();if([p.getProperty('ADMIN_USERNAME'),p.getProperty('FUND_TREASURER_USER')].some(x=>x&&String(x).trim().toLowerCase()===u))throw Error('Sai tài khoản hoặc mật khẩu');const r=qlnhAclWorker_('login',{username:u,password});return {token:'deleg_'+r.token,user:r.account.name,role:'delegate',account:r.account};}
function qlnhAclRaw_(token){if(!/^deleg_[A-Za-z0-9_-]{43}$/.test(String(token||'')))throw Error('Phiên đăng nhập không hợp lệ');return String(token).slice(6);}
function qlnhAclAccount_(token,allowChange){const r=qlnhAclWorker_('session',{token:qlnhAclRaw_(token)}).account;if(!r||(!allowChange&&r.mustChange))throw Error('Cần đổi mật khẩu lần đầu');return r;}
function adminAclMe(token){return qlnhAclAccount_(token,true);}
function adminAclPassword(token,password){return qlnhAclWorker_('password',{token:qlnhAclRaw_(token),password});}
function adminAclManage(token,action,payload){const actor=qlnhAclSuper_(token);if(!['list','audit','student-list','student-set','student-patch','save','reset','revoke','disable'].includes(action))throw Error('Thao tác không hợp lệ');const next={...(payload||{}),actor};if(['save','reset','revoke','disable'].includes(action)){const u=String(next.username||'').trim().toLowerCase(),p=PropertiesService.getScriptProperties();if([p.getProperty('ADMIN_USERNAME'),p.getProperty('FUND_TREASURER_USER')].some(x=>x&&String(x).trim().toLowerCase()===u))throw Error('Không thể quản lý tài khoản chính hoặc thủ quỹ bằng chức năng này');}if(action==='student-set'&&next.allowedMode!==undefined){if(next.allowedMode==='all'){next.allowed=null;next.expiresAt=0;}else if(next.allowedMode!=='custom'||!Array.isArray(next.allowed))throw Error('Chế độ quyền không hợp lệ');delete next.allowedMode;}
 if(action==='save'&&next.rights&&typeof next.rights==='object'){for(const r of Object.values(next.rights)){if(!r||r.scopeMode===undefined)continue;if(r.scopeMode==='all')r.ids=null;else if(r.scopeMode!=='limited'||!Array.isArray(r.ids))throw Error('Phạm vi quyền không hợp lệ');delete r.scopeMode;}}
 const result=qlnhAclWorker_(action,next);
 if(action==='student-list'){if(!Array.isArray(result.items)||!Array.isArray(result.modules))throw Error('Worker trả danh sách sinh viên không hợp lệ');for(const x of result.items){if(x.allowed===null)x.allowedMode='all';else if(Array.isArray(x.allowed))x.allowedMode='custom';else throw Error('Worker thiếu dữ liệu quyền sinh viên');}}
 if(action==='list'){if(!Array.isArray(result.items)||!result.rules)throw Error('Worker trả danh sách Admin không hợp lệ');for(const x of result.items){if(!x.rights||typeof x.rights!=='object')throw Error('Worker thiếu quyền Admin');for(const r of Object.values(x.rights)){if(r.ids===null)r.scopeMode='all';else if(Array.isArray(r.ids))r.scopeMode='limited';else throw Error('Worker thiếu phạm vi quyền Admin');}}}
 return result;}
function qlnhAclRight_(account,module,op,id){const r=account.rights&&account.rights[module];if(!r||!Array.isArray(r.ops)||!r.ops.includes('view')||!r.ops.includes(op))throw Error('Không có quyền '+module+'/'+op);if(r.ids!==null&&r.ids!==undefined&&(!Array.isArray(r.ids)||id==null||!r.ids.includes(String(id))))throw Error('Nội dung nằm ngoài phạm vi được giao');return r;}
function qlnhAclView_(a,m){return !!a.rights?.[m]?.ops?.includes('view');}
function qlnhAclFilter_(a,m,rows,key){const r=a.rights?.[m];return !qlnhAclView_(a,m)?[]:(r.ids===null||r.ids===undefined)?rows:rows.filter(x=>r.ids.includes(String(x[key])));}
function qlnhAclScope_(a,m,id){const r=a.rights?.[m];return !!r&&(r.ids==null||r.ids.includes(String(id)));}
function qlnhAclUnit_(k){return /^cd_/.test(k)?'ChiDoan':/^ch_/.test(k)?'ChiHoi':'Lop';}
function qlnhAclConfigModule_(k){const suffix=k.replace(/^(cd|ch)_/,'');if(['tenLop','slogan','bannerUrl','moTaLop','coVan','lopTruong','lopPhoHocTap','lopPhoPhongTrao','lopPhoDoiSong'].includes(k)||/^lop_(hienMoTa|anCoVan|anLopTruong|anLopPhoHocTap|anLopPhoPhongTrao|anLopPhoDoiSong)$/.test(k))return 'info';if(!/^(cd|ch)_/.test(k))return null;if(/^(hienThiKetQua|congBoUngVien|congBoUngVienMode)$/.test(suffix))return 'votes';if(/^(moBauCu|hienThiCongBauCu|dotBauCu|bauCuLyDoDong|bauCuDaMo|bauCuUngVien|toiDaTinNhiem|moPhieuLuc|dongPhieuLuc|gioiHanPhieu|khongGioiHanPhieu|hienSoPhieu)$/.test(suffix))return 'ballot';if(/^(hienThiDeAn|deAnCongBo)$/.test(suffix))return 'candidates';if(/^(hienThiDaiHoi|tenDaiHoi|thoiGian|diaDiem|batDauDaiHoi|ketThucDaiHoi|trangPhuc|thanhPhan|luuYDaiHoi|hienDemNguoc)$/.test(suffix))return 'congress';if(/^(nhiemKy|biThu|phoBiThu|chiHoiTruong|chiHoiPho|uyVien|uyVien1|uyVien2|uyVien3|uyVienBoSung|uyVienBoSungVisible|phoBoSung|moTa|hienMoTa|anNhiemKy|anNguoiDungDau|anCapPho|anUyVien|anUyVien1|anUyVien2|anUyVien3)$/.test(suffix))return 'info';return null;}
function qlnhAclBranch_(b){const k=String(b);if(k==='cd'||k==='ChiDoan')return 'ChiDoan';if(k==='ch'||k==='ChiHoi')return 'ChiHoi';throw Error('Đơn vị không hợp lệ');}
function qlnhAclManagedDoc_(id){if(!id)return;const folder=PropertiesService.getScriptProperties().getProperty('V17_DRIVE_FOLDER_ID');if(!folder)throw Error('Chưa cấu hình kho tài liệu');const file=DriveApp.getFileById(String(id)),parents=file.getParents();let ok=false;while(parents.hasNext())if(parents.next().getId()===folder)ok=true;if(!ok)throw Error('Chỉ Super Admin được quản lý nguồn Drive ngoài kho tài liệu');}
function qlnhAclDashboard_(a){
 const out={config:{},activities:[],series:[],candidates:[],registrations:[],results:{ChiHoi:{total:0,results:[]},ChiDoan:{total:0,results:[]}},voteArchives:[],resultPublications:[],voteCount:0,attendanceSessions:[],attendanceRecords:[],attendancePhotoRecords:[],attendanceCodes:{},attendanceRetryGrants:[]};
 if(['info','congress','ballot','votes','candidates'].some(m=>qlnhAclView_(a,m))){const cfg=cfg_();for(const k of Object.keys(cfg)){const m=qlnhAclConfigModule_(k),unit=qlnhAclUnit_(k);if(m&&qlnhAclView_(a,m)&&qlnhAclScope_(a,m,unit))out.config[k]=cfg[k];}}
 if(qlnhAclView_(a,'activities')){out.activities=qlnhAclFilter_(a,'activities',rows_(S.ACT),'ID');const r=a.rights.activities;out.series=r.ids==null?activitySeriesRows_():[];out.registrations=rows_(S.REG).filter(x=>qlnhAclScope_(a,'activities',x.HOAT_DONG_ID));}
 if(qlnhAclView_(a,'attendance')){out.attendanceSessions=qlnhAclFilter_(a,'attendance',attendanceRows_('BuoiDiemDanh'),'ID');const ids=new Set(out.attendanceSessions.map(x=>String(x.ID)));out.attendanceRecords=attendanceRows_('DanhSachDiemDanh').filter(x=>ids.has(String(x.BUOI_ID)));out.attendancePhotoRecords=attendancePhotoAdminRows_().filter(x=>ids.has(x.sessionId));out.attendanceRetryGrants=attendanceRetryRows_().filter(x=>ids.has(String(x.BUOI_ID)));if(a.rights.attendance.ops.includes('edit')||a.rights.attendance.ops.includes('create')){const codes=attendanceCodesMap_();for(const id of ids)if(Object.prototype.hasOwnProperty.call(codes,id))out.attendanceCodes[id]=codes[id];}
 // Names of linked activities are needed for headings only, not registration data.
 const linked=new Set(out.attendanceSessions.map(x=>String(x.HOAT_DONG_ID||'')));const existing=new Set(out.activities.map(x=>String(x.ID)));for(const row of rows_(S.ACT))if(linked.has(String(row.ID))&&!existing.has(String(row.ID)))out.activities.push({ID:row.ID,TEN_HOAT_DONG:row.TEN_HOAT_DONG});}
 if(qlnhAclView_(a,'candidates')||qlnhAclView_(a,'ballot')||qlnhAclView_(a,'votes'))out.candidates=rows_(S.CAND).filter(r=>['candidates','ballot','votes'].some(m=>qlnhAclView_(a,m)&&qlnhAclScope_(a,m,r.PHAN_HE)));
 if(qlnhAclView_(a,'votes')){const v=rows_(S.VOTES).filter(r=>qlnhAclScope_(a,'votes',r.PHAN_HE));for(const unit of ['ChiDoan','ChiHoi'])if(qlnhAclScope_(a,'votes',unit))out.results[unit]=tally_(unit,out.candidates,v);out.voteCount=v.length;out.voteArchives=voteArchiveList_().filter(r=>qlnhAclScope_(a,'votes',r.branch));out.resultPublications=kpPublicationList_().filter(r=>qlnhAclScope_(a,'votes',r.branch));}
 return out;
}
function qlnhAclPolicy_(a,name,args){
 // Explicit registry. Never dispatch arbitrary browser-controlled function names.
 const basic={
 adminAttendanceImage:['attendance','image'],adminReviewAttendance:['attendance',args[1]==='approved'?'review':'reject'],adminAttendanceGrantRetry:['attendance','reject'],adminAttendanceRevokeRetry:['attendance','reject'],adminCloseAttendanceSession:['attendance','close'],adminDeleteAttendanceSession:['attendance','delete'],adminArchiveAttendanceSession:['attendance',args[1]?'archive':'restore'],
 adminDeleteRegistration:['activities','delete'],adminArchiveActivity:['activities',args[1]?'archive':'restore'],adminArchiveSeries:['activities',args[1]?'archive':'restore'],
 adminNewsGet:['news','view'],adminNewsSetStatus:['news','publish'],adminNewsDelete:['news','delete'],adminNewsUpload:['news','upload'],adminPushResendNews:['news','notify'],
 adminChristmasGet:['theme2011','view'],adminChristmasSave:['theme2011','edit'],adminTheme2011Get:['theme2011','view'],adminTheme2011Save:['theme2011','edit'],adminTheme2011UploadPhoto:['theme2011','upload'],adminPlaylistGet:['siteMusic','view'],adminPlaylistPreview:['siteMusic','view'],adminPlaylistSave:['siteMusic','edit'],adminPlaylistUpload:['siteMusic','upload'],adminSiteMotionGet:['siteMotion','view'],adminSiteMotionSave:['siteMotion','edit'],
 adminArchivedCandidates:['candidates','view'],adminV8Proposal:['candidates','publish'],adminV8Gate:['ballot','edit'],adminV8SaveBallot:['ballot','edit'],adminV8SetBallotVisibility:['ballot','publish'],adminSaveVoteRoundPublication:['votes','publish'],adminNotifyVoteRound:['votes','notify'],
 adminV17ListExams:['exams17','view'],adminV17Roster:['exams17','view'],adminV17Reports:['exams17','view'],adminV17GetReminders:['exams17','view'],adminV17ImportPreview:['exams17','view'],adminV17ImportApply:['exams17','edit'],adminV17Finalize:['exams17','edit'],adminV17ReportToggle:['exams17','edit'],adminV17ReplyReport:['exams17','edit'],adminV17PublishExam:['exams17','publish'],adminV17TrashExams:['exams17','archive'],adminV17RestoreExams:['exams17','restore'],adminV17SetReminders:['exams17','notify'],adminV19ListGroups:['exams17','view'],adminV19PublishGroup:['exams17','publish'],adminV19PublishRoster:['exams17','publish'],
 adminV17ListDocs:['documents17','view'],adminV17Types:['documents17','view'],adminV17DocVersions:['documents17','view'],adminV17AddType:['documents17','edit'],adminV17RenameType:['documents17','edit'],adminV17ArchiveType:['documents17','archive'],adminV17Upload:['documents17','upload'],adminV17UploadBegin:['documents17','upload'],adminV17UploadChunk:['documents17','upload'],adminV17UploadStatus:['documents17','upload'],adminV17PublishDoc:['documents17','publish'],adminV17PublishDocs:['documents17','publish'],adminV17DocState:['documents17','archive'],adminV17StageOldVersion:['documents17','edit'],adminV17AttachDriveLink:['documents17','upload'],
 adminFundDashboard:['funds','view'],adminFundCreatePeriod:['funds','create'],adminFundSetPeriodStatus:['funds','publish'],adminFundAddTransaction:['funds','create'],adminFundAddPayment:['funds','create'],adminFundEditTransactionMeta:['funds','edit'],adminFundAddMember:['funds','edit'],adminFundSaveActivity:['funds','edit'],adminFundAddActivityEntry:['funds','create'],adminFundEditActivityEntry:['funds','edit'],adminFundReplyReport:['funds','review'],adminFundReminderPreview:['funds','view'],adminFundQueueReminder:['funds','notify'],studentAdminList:['students','view']};
 let p=basic[name],id=null;
 if(name==='adminAttendanceExportCheck'){if(!Array.isArray(args[0])||!args[0].length||args[0].length>500)throw Error('Thiếu buổi');for(const x of args[0]){qlnhAclRight_(a,'attendance','export',x);if(args[1])qlnhAclRight_(a,'attendance','image',x);}return true;}
 if(name==='adminMotionV22Get')p=['siteMotion','view'];if(name==='adminMotionV22Save')p=['siteMotion','edit'];
 if(name==='adminSaveAttendanceSession'){const r=args[0]||{},old=attendanceRows_('BuoiDiemDanh').find(x=>String(x.ID)===String(r.ID));p=['attendance',old?'edit':'create'];id=r.ID;if(old){if(yes_(old.DANG_MO)!==yes_(r.DANG_MO)||yes_(old.CONG_KHAI)!==yes_(r.CONG_KHAI))qlnhAclRight_(a,'attendance','close',id);if(a.rights?.attendance?.ids!=null&&String(old.HOAT_DONG_ID)!==String(r.HOAT_DONG_ID))throw Error('Không chuyển hoạt động ngoài phạm vi');}}
 else if(['adminAttendanceImage','adminReviewAttendance','adminAttendanceGrantRetry','adminAttendanceRevokeRetry'].includes(name)){const r=attendancePhotoRows_().find(x=>String(x.ID)===String(args[0]));if(!r)throw Error('Không tìm thấy lượt ảnh');id=r.BUOI_ID;}
 else if(p&&p[0]==='attendance')id=args[0];
 else if(name==='adminSaveRecord'||name==='adminDeleteRecord'){const section=args[0],r=args[1];if(section!==S.ACT&&section!==S.CAND)throw Error('Không hỗ trợ');const m=section===S.ACT?'activities':'candidates';id=name==='adminSaveRecord'?r?.ID:r;const old=rows_(section).find(x=>String(x.ID)===String(id));p=[m,name==='adminDeleteRecord'?'delete':old?'edit':'create'];if(m==='candidates'){if(old)qlnhAclRight_(a,m,p[1],old.PHAN_HE);id=name==='adminSaveRecord'?qlnhAclBranch_(r.PHAN_HE):old?.PHAN_HE;}}
 else if(name==='adminSaveSeries'){p=['activities','edit'];if(a.rights?.activities?.ids!=null)throw Error('Không hỗ trợ sửa chuỗi trong phạm vi ID riêng');qlnhAclRight_(a,'activities','create',null);}
 else if(p&&p[0]==='activities'){id=args[0];if(name==='adminArchiveSeries'&&a.rights?.activities?.ids!=null)throw Error('Không hỗ trợ phạm vi chuỗi');}
 else if(name==='adminNewsSave'){const r=args[0]||{},old=newsRows_().find(x=>String(x.ID)===String(r.id));id=old?old.ID:null;p=['news',old?'edit':'create'];if(r.status!=='DRAFT'||r.sendPush===true||r.guestVisible===true)qlnhAclRight_(a,'news','publish',id);if(r.sendPush===true)qlnhAclRight_(a,'news','notify',id);if(a.rights?.news?.ids!=null&&old&&String(old.DON_VI)!==String(r.unit))throw Error('Không chuyển đơn vị của bản tin được giao');}
 else if(p&&p[0]==='news'){id=name==='adminNewsUpload'?null:args[0];if(name==='adminNewsSetStatus'&&args[1]==='PUBLISHED')qlnhAclRight_(a,'news','notify',id);}
 else if(name==='adminSaveConfig'){const keys=Object.keys(args[0]||{});if(!keys.length)throw Error('Thiếu cấu hình');for(const k of keys){const m=qlnhAclConfigModule_(k);if(!m||!Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG,k))throw Error('Chỉ Super Admin được thay cấu hình này');if(m==='ballot'||m==='votes'||m==='candidates')throw Error('Dùng thao tác nghiệp vụ riêng để sửa bầu cử/kiểm phiếu');qlnhAclRight_(a,m,'edit',qlnhAclUnit_(k));}return true;}
 else if(name==='adminV17SaveExam'||name==='adminV19SaveGroup'||name==='adminV19SaveSubject'){const x=name==='adminV19SaveSubject'?args[1]:args[0];p=['exams17',x?.id?'edit':'create'];id=name==='adminV19SaveGroup'?null:x?.id||null;if(a.rights?.exams17?.ids!=null&&name!=='adminV17SaveExam')throw Error('Phạm vi riêng chưa hỗ trợ sửa nhóm kỳ thi');}
 else if(name==='adminV17SaveDoc'){p=['documents17',args[0]?.id?'edit':'create'];id=args[0]?.id||null;qlnhAclManagedDoc_(args[0]?.source?.id);}
 else if(['adminNuGetEnabled','adminNuGetOverride','adminNuSetEnabled','adminNuSaveOverride','adminNuSendNow','adminNuScheduleSave'].includes(name)){const kind=String(name==='adminNuScheduleSave'?args[0]?.kind:args[0]).toUpperCase();id=name==='adminNuScheduleSave'?args[0]?.contentId:args[1];const m=kind==='ATTENDANCE'?'attendance':kind==='ACTIVITY'?'activities':['NEWS','NOTICE'].includes(kind)?'news':null;if(!m)throw Error('Chỉ hỗ trợ thông báo theo nội dung đã cấp quyền');p=[m,name.startsWith('adminNuGet')?'view':'notify'];}
 if(p&&['ballot','votes','candidates'].includes(p[0])&&id===null&&name!=='adminArchivedCandidates')id=qlnhAclBranch_(args[0]);
 if(p&&p[0]==='exams17'&&id===null){if(['adminV17Roster','adminV17GetReminders','adminV17ImportPreview','adminV17ImportApply','adminV17Finalize','adminV17ReportToggle','adminV17PublishExam','adminV17SetReminders','adminV19PublishRoster'].includes(name))id=args[0];else if(name==='adminV17ReplyReport'){const rr=v17Rows_('V17_PhanAnhThi').find(x=>String(x.ID)===String(args[0]));if(!rr)throw Error('Không tìm thấy phản ánh');id=rr.EXAM_ID;}else if(['adminV17TrashExams','adminV17RestoreExams'].includes(name)){if(!Array.isArray(args[0])||!args[0].length)throw Error('Thiếu kỳ thi');for(const x of args[0])qlnhAclRight_(a,p[0],p[1],x);return true;}}
 if(p&&p[0]==='documents17'&&id===null){if(['adminV17DocVersions','adminV17PublishDoc','adminV17DocState','adminV17StageOldVersion'].includes(name))id=args[0];else if(name==='adminV17PublishDocs'){if(!Array.isArray(args[0])||!args[0].length)throw Error('Thiếu tài liệu');for(const x of args[0]){qlnhAclRight_(a,p[0],p[1],x);if(!['none','',undefined].includes(args[1]))qlnhAclRight_(a,'documents17','notify',x);const r=v17Require_('V17_TaiLieu',x);qlnhAclManagedDoc_(v17Parse_(r.DRAFT).source?.id);}return true;}}
 if(name==='adminV17AttachDriveLink')throw Error('Chỉ Super Admin được gắn URL Drive ngoài hệ thống');
 if(['adminV17PublishDoc','adminV17StageOldVersion'].includes(name)){const r=v17Require_('V17_TaiLieu',id);qlnhAclManagedDoc_(v17Parse_(r.DRAFT).source?.id);if(name==='adminV17StageOldVersion')throw Error('Chỉ Super Admin được chuyển phiên bản Drive cũ');}
 if(name==='adminV17UploadStatus'||name==='adminV17UploadChunk')throw Error('Upload phân đoạn đang giới hạn Super Admin');
 if(name==='adminNewsSave'&&args[0]?.guestVisible!==false)qlnhAclRight_(a,'news','publish',id);
 if(name==='adminV8Gate')qlnhAclRight_(a,'ballot','notify',id);
 if(name==='adminV8Proposal')qlnhAclRight_(a,'candidates','publish',id);
  if(!p)throw Error('Chức năng này chỉ dành cho Super Admin hoặc chưa chuyển đổi phân quyền');
 if(name==='adminV17ReplyReport'&&args[3])qlnhAclRight_(a,'exams17','notify',id);
 if(['adminV17PublishExam','adminV19PublishRoster'].includes(name)&&!['none','',undefined].includes(args[2]))qlnhAclRight_(a,'exams17','notify',id);
 if(name==='adminV19PublishGroup'&&!['none','',undefined].includes(args[1]))qlnhAclRight_(a,'exams17','notify',null);
 if(name==='adminV17PublishDoc'&&!['none','',undefined].includes(args[1]))qlnhAclRight_(a,'documents17','notify',id);
 if(name==='adminV17DocState'&&args[1]==='trash')throw Error('Chỉ Super Admin được đưa tài liệu vào thùng rác');
 qlnhAclRight_(a,p[0],p[1],id);return true;
}
function adminAclCall(token,name,args){
 const a=qlnhAclAccount_(token,false);if(!Array.isArray(args)||args.length>12)throw Error('Tham số không hợp lệ');
 if(name==='adminDashboard'||name==='adminAttendanceDashboard')return qlnhAclDashboard_(a);
 if(name==='adminNewsList'){if(!qlnhAclView_(a,'news'))throw Error('Không có quyền');const r=a.rights.news;return newsRows_().filter(x=>r.ids==null||r.ids.includes(String(x.ID))).sort((x,y)=>Date.parse(y.NGAY_CAP_NHAT)-Date.parse(x.NGAY_CAP_NHAT)).slice(0,500).map(x=>({...newsRowView_(x,false),status:String(x.TRANG_THAI),createdAt:String(x.NGAY_TAO)}));}
 if(name==='adminNuSchedules'){return nuRows_('LichThongBaoV16').filter(r=>{const m=r.KIND==='ATTENDANCE'?'attendance':r.KIND==='ACTIVITY'?'activities':['NEWS','NOTICE'].includes(r.KIND)?'news':null;return m&&qlnhAclView_(a,m)&&qlnhAclScope_(a,m,r.CONTENT_ID);}).map(nuScheduleView_);}
 const listModule=({adminV17ListExams:'exams17',adminV19ListGroups:'exams17',adminV17Reports:'exams17',adminV17ListDocs:'documents17',adminV17Types:'documents17',adminArchivedCandidates:'candidates'})[name];
 if(listModule){if(!qlnhAclView_(a,listModule))throw Error('Không có quyền');}else qlnhAclPolicy_(a,name,args);
 const fn=qlnhAclFunction_(name);if(typeof fn!=='function')throw Error('Module chưa có trong bản triển khai');
 const internal=Utilities.getUuid()+Utilities.getUuid();QLNH_ACL_CAP_={token:internal,user:'delegate:'+a.username};
 try{const result=fn.apply(null,[internal,...args]);if(name==='adminFundDashboard'){result.role='delegate';delete result.treasurer;}if(listModule&&a.rights[listModule].ids!=null){const ids=a.rights[listModule].ids;if(name==='adminV19ListGroups'){result.items=result.items.map(g=>({...g,exams:(g.exams||[]).filter(e=>ids.includes(String(e.id)))})).filter(g=>g.exams.length);}else if(name==='adminArchivedCandidates'){return Array.isArray(result)?result.filter(x=>ids.includes(String(x.PHAN_HE||x.branch))):[];}else if(name==='adminV17Reports'){result.items=result.items.filter(x=>ids.includes(String(x.examId)));}else if(name!=='adminV17Types')result.items=result.items.filter(x=>ids.includes(String(x.id)));}try{if(!listModule&&!/Get|List|Dashboard|Image|Preview|Roster|Types|Schedules/.test(name))audit_('delegate:'+a.username,'ACL_RPC',name);}catch(e){}return result;}finally{QLNH_ACL_CAP_=null;}
}

function qlnhAclFunction_(name){switch(name){
case 'adminAttendanceExportCheck':return adminAttendanceExportCheck;
case 'adminMotionV22Get':return adminMotionV22Get;
case 'adminMotionV22Save':return adminMotionV22Save;
case 'adminArchiveActivity':return typeof adminArchiveActivity==='function'?adminArchiveActivity:null;
case 'adminArchiveAttendanceSession':return typeof adminArchiveAttendanceSession==='function'?adminArchiveAttendanceSession:null;
case 'adminArchiveSeries':return typeof adminArchiveSeries==='function'?adminArchiveSeries:null;
case 'adminArchivedCandidates':return typeof adminArchivedCandidates==='function'?adminArchivedCandidates:null;
case 'adminAttendanceGrantRetry':return typeof adminAttendanceGrantRetry==='function'?adminAttendanceGrantRetry:null;
case 'adminAttendanceImage':return typeof adminAttendanceImage==='function'?adminAttendanceImage:null;
case 'adminAttendanceRevokeRetry':return typeof adminAttendanceRevokeRetry==='function'?adminAttendanceRevokeRetry:null;
case 'adminCloseAttendanceSession':return typeof adminCloseAttendanceSession==='function'?adminCloseAttendanceSession:null;
case 'adminDeleteAttendanceSession':return typeof adminDeleteAttendanceSession==='function'?adminDeleteAttendanceSession:null;
case 'adminDeleteRecord':return typeof adminDeleteRecord==='function'?adminDeleteRecord:null;
case 'adminDeleteRegistration':return typeof adminDeleteRegistration==='function'?adminDeleteRegistration:null;
case 'adminFundAddActivityEntry':return typeof adminFundAddActivityEntry==='function'?adminFundAddActivityEntry:null;
case 'adminFundAddMember':return typeof adminFundAddMember==='function'?adminFundAddMember:null;
case 'adminFundAddPayment':return typeof adminFundAddPayment==='function'?adminFundAddPayment:null;
case 'adminFundAddTransaction':return typeof adminFundAddTransaction==='function'?adminFundAddTransaction:null;
case 'adminFundCreatePeriod':return typeof adminFundCreatePeriod==='function'?adminFundCreatePeriod:null;
case 'adminFundDashboard':return typeof adminFundDashboard==='function'?adminFundDashboard:null;
case 'adminFundEditActivityEntry':return typeof adminFundEditActivityEntry==='function'?adminFundEditActivityEntry:null;
case 'adminFundEditTransactionMeta':return typeof adminFundEditTransactionMeta==='function'?adminFundEditTransactionMeta:null;
case 'adminFundQueueReminder':return typeof adminFundQueueReminder==='function'?adminFundQueueReminder:null;
case 'adminFundReminderPreview':return typeof adminFundReminderPreview==='function'?adminFundReminderPreview:null;
case 'adminFundReplyReport':return typeof adminFundReplyReport==='function'?adminFundReplyReport:null;
case 'adminFundSaveActivity':return typeof adminFundSaveActivity==='function'?adminFundSaveActivity:null;
case 'adminFundSetPeriodStatus':return typeof adminFundSetPeriodStatus==='function'?adminFundSetPeriodStatus:null;
case 'adminNewsDelete':return typeof adminNewsDelete==='function'?adminNewsDelete:null;
case 'adminNewsGet':return typeof adminNewsGet==='function'?adminNewsGet:null;
case 'adminNewsSave':return typeof adminNewsSave==='function'?adminNewsSave:null;
case 'adminNewsSetStatus':return typeof adminNewsSetStatus==='function'?adminNewsSetStatus:null;
case 'adminNewsUpload':return typeof adminNewsUpload==='function'?adminNewsUpload:null;
case 'adminNotifyVoteRound':return typeof adminNotifyVoteRound==='function'?adminNotifyVoteRound:null;
case 'adminNuGetEnabled':return typeof adminNuGetEnabled==='function'?adminNuGetEnabled:null;
case 'adminNuGetOverride':return typeof adminNuGetOverride==='function'?adminNuGetOverride:null;
case 'adminNuSaveOverride':return typeof adminNuSaveOverride==='function'?adminNuSaveOverride:null;
case 'adminNuScheduleSave':return typeof adminNuScheduleSave==='function'?adminNuScheduleSave:null;
case 'adminNuSendNow':return typeof adminNuSendNow==='function'?adminNuSendNow:null;
case 'adminNuSetEnabled':return typeof adminNuSetEnabled==='function'?adminNuSetEnabled:null;
case 'adminPlaylistGet':return typeof adminPlaylistGet==='function'?adminPlaylistGet:null;
case 'adminPlaylistPreview':return typeof adminPlaylistPreview==='function'?adminPlaylistPreview:null;
case 'adminPlaylistSave':return typeof adminPlaylistSave==='function'?adminPlaylistSave:null;
case 'adminPlaylistUpload':return typeof adminPlaylistUpload==='function'?adminPlaylistUpload:null;
case 'adminPushResendNews':return typeof adminPushResendNews==='function'?adminPushResendNews:null;
case 'adminReviewAttendance':return typeof adminReviewAttendance==='function'?adminReviewAttendance:null;
case 'adminSaveAttendanceSession':return typeof adminSaveAttendanceSession==='function'?adminSaveAttendanceSession:null;
case 'adminSaveConfig':return typeof adminSaveConfig==='function'?adminSaveConfig:null;
case 'adminSaveRecord':return typeof adminSaveRecord==='function'?adminSaveRecord:null;
case 'adminSaveSeries':return typeof adminSaveSeries==='function'?adminSaveSeries:null;
case 'adminSaveVoteRoundPublication':return typeof adminSaveVoteRoundPublication==='function'?adminSaveVoteRoundPublication:null;
case 'adminSiteMotionGet':return typeof adminSiteMotionGet==='function'?adminSiteMotionGet:null;
case 'adminSiteMotionSave':return typeof adminSiteMotionSave==='function'?adminSiteMotionSave:null;
case 'adminChristmasGet':return adminChristmasGet;
case 'adminChristmasSave':return adminChristmasSave;
case 'adminTheme2011Get':return typeof adminTheme2011Get==='function'?adminTheme2011Get:null;
case 'adminTheme2011Save':return typeof adminTheme2011Save==='function'?adminTheme2011Save:null;
case 'adminTheme2011UploadPhoto':return typeof adminTheme2011UploadPhoto==='function'?adminTheme2011UploadPhoto:null;
case 'adminV17AddType':return typeof adminV17AddType==='function'?adminV17AddType:null;
case 'adminV17ArchiveType':return typeof adminV17ArchiveType==='function'?adminV17ArchiveType:null;
case 'adminV17AttachDriveLink':return typeof adminV17AttachDriveLink==='function'?adminV17AttachDriveLink:null;
case 'adminV17DocState':return typeof adminV17DocState==='function'?adminV17DocState:null;
case 'adminV17DocVersions':return typeof adminV17DocVersions==='function'?adminV17DocVersions:null;
case 'adminV17Finalize':return typeof adminV17Finalize==='function'?adminV17Finalize:null;
case 'adminV17GetReminders':return typeof adminV17GetReminders==='function'?adminV17GetReminders:null;
case 'adminV17ImportApply':return typeof adminV17ImportApply==='function'?adminV17ImportApply:null;
case 'adminV17ImportPreview':return typeof adminV17ImportPreview==='function'?adminV17ImportPreview:null;
case 'adminV17ListDocs':return typeof adminV17ListDocs==='function'?adminV17ListDocs:null;
case 'adminV17ListExams':return typeof adminV17ListExams==='function'?adminV17ListExams:null;
case 'adminV17PublishDoc':return typeof adminV17PublishDoc==='function'?adminV17PublishDoc:null;
case 'adminV17PublishDocs':return typeof adminV17PublishDocs==='function'?adminV17PublishDocs:null;
case 'adminV17PublishExam':return typeof adminV17PublishExam==='function'?adminV17PublishExam:null;
case 'adminV17RenameType':return typeof adminV17RenameType==='function'?adminV17RenameType:null;
case 'adminV17ReplyReport':return typeof adminV17ReplyReport==='function'?adminV17ReplyReport:null;
case 'adminV17ReportToggle':return typeof adminV17ReportToggle==='function'?adminV17ReportToggle:null;
case 'adminV17Reports':return typeof adminV17Reports==='function'?adminV17Reports:null;
case 'adminV17RestoreExams':return typeof adminV17RestoreExams==='function'?adminV17RestoreExams:null;
case 'adminV17Roster':return typeof adminV17Roster==='function'?adminV17Roster:null;
case 'adminV17SaveDoc':return typeof adminV17SaveDoc==='function'?adminV17SaveDoc:null;
case 'adminV17SaveExam':return typeof adminV17SaveExam==='function'?adminV17SaveExam:null;
case 'adminV17SetReminders':return typeof adminV17SetReminders==='function'?adminV17SetReminders:null;
case 'adminV17StageOldVersion':return typeof adminV17StageOldVersion==='function'?adminV17StageOldVersion:null;
case 'adminV17TrashExams':return typeof adminV17TrashExams==='function'?adminV17TrashExams:null;
case 'adminV17Types':return typeof adminV17Types==='function'?adminV17Types:null;
case 'adminV17Upload':return typeof adminV17Upload==='function'?adminV17Upload:null;
case 'adminV17UploadBegin':return typeof adminV17UploadBegin==='function'?adminV17UploadBegin:null;
case 'adminV17UploadChunk':return typeof adminV17UploadChunk==='function'?adminV17UploadChunk:null;
case 'adminV17UploadStatus':return typeof adminV17UploadStatus==='function'?adminV17UploadStatus:null;
case 'adminV19ListGroups':return typeof adminV19ListGroups==='function'?adminV19ListGroups:null;
case 'adminV19PublishGroup':return typeof adminV19PublishGroup==='function'?adminV19PublishGroup:null;
case 'adminV19PublishRoster':return typeof adminV19PublishRoster==='function'?adminV19PublishRoster:null;
case 'adminV19SaveGroup':return typeof adminV19SaveGroup==='function'?adminV19SaveGroup:null;
case 'adminV19SaveSubject':return typeof adminV19SaveSubject==='function'?adminV19SaveSubject:null;
case 'adminV8Gate':return typeof adminV8Gate==='function'?adminV8Gate:null;
case 'adminV8Proposal':return typeof adminV8Proposal==='function'?adminV8Proposal:null;
case 'adminV8SaveBallot':return typeof adminV8SaveBallot==='function'?adminV8SaveBallot:null;
case 'adminV8SetBallotVisibility':return typeof adminV8SetBallotVisibility==='function'?adminV8SetBallotVisibility:null;
case 'studentAdminList':return typeof studentAdminList==='function'?studentAdminList:null;
default:return null;}}
