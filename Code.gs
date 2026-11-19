
/**
 * LỚP 2505QLNH
 * HỆ THỐNG BACKEND & DATABASE
 *
 * Google Sheets + Google Apps Script
 *
 * Giữ nguyên dữ liệu đã có.
 * KHÔNG chạy setupNewClassStore()
 * trên cơ sở dữ liệu đã khởi tạo.
 */

const S = {
  CONFIG: 'CauHinh',
  ACT: 'HoatDong',
  CAND: 'UngCuVien',
  REG: 'DangKyHoatDong',
  VOTES: 'PhieuBau',
  RECEIPTS: 'BienNhan',
  LOG: 'NhatKy',
  SERIES: 'ChuoiHoatDong'
};

const HEAD = {
  CauHinh: ['KEY', 'VALUE'],

  HoatDong: [
    'ID',
    'TEN_HOAT_DONG',
    'MO_TA',
    'MO_DANG_KY',
    'DONG_DANG_KY',
    'THOI_GIAN_DIEN_RA',
    'DIA_DIEM',
    'LUU_Y',
    'GIOI_HAN',
    'KHONG_GIOI_HAN',
    'HIEN_THI',
    'CHUOI_ID',
    'TRANG_THAI',
    'LUU_TRU_LUC'
  ],

  ChuoiHoatDong: [
    'ID', 'TEN_CHUOI', 'MO_TA', 'MO_DANG_KY',
    'DONG_DANG_KY', 'HIEN_THI', 'TRANG_THAI', 'LUU_TRU_LUC'
  ],

  UngCuVien: [
    'ID',
    'PHAN_HE',
    'HO_TEN',
    'QUE_QUAN',
    'DAN_TOC',
    'TON_GIAO',
    'CHUC_VU',
    'HIEN_THI'
  ],

  DangKyHoatDong: [
    'MA_GIAO_DICH',
    'HOAT_DONG_ID',
    'HO_TEN',
    'MSSV',
    'THOI_GIAN'
  ],

  PhieuBau: [
    'MA_GIAO_DICH',
    'PHAN_HE',
    'DOT_BAU_CU',
    'THOI_GIAN',
    'DANH_SACH_KHONG_TIN_NHIEM',
    'DANH_SACH_UNG_VIEN'
  ],

  BienNhan: [
    'MA_GIAO_DICH',
    'LOAI',
    'KET_QUA',
    'THONG_BAO',
    'THOI_GIAN'
  ],

  NhatKy: [
    'THOI_GIAN',
    'TAI_KHOAN',
    'THAO_TAC',
    'CHI_TIET'
  ]
};

const DEFAULT_CONFIG = {
  tenLop: 'LỚP 2505QLNH',
  slogan: 'Đoàn kết • Trách nhiệm • Chủ động • Cống hiến',
  bannerUrl: '',

  coVan: 'Chưa cập nhật',
  lopTruong: 'Chưa cập nhật',
  lopPhoHocTap: 'Chưa cập nhật',
  lopPhoPhongTrao: 'Chưa cập nhật',
  lopPhoDoiSong: 'Chưa cập nhật',
  moTaLop: 'Tập thể LỚP 2505QLNH',
  lop_hienMoTa: true,
  lop_anCoVan: false,
  lop_anLopTruong: false,
  lop_anLopPhoHocTap: false,
  lop_anLopPhoPhongTrao: false,
  lop_anLopPhoDoiSong: false,

  cd_nhiemKy: '2026 – 2027',
  cd_biThu: 'Chưa cập nhật',
  cd_phoBiThu: 'Chưa cập nhật',

  cd_uyVien: 'Chưa cập nhật',
  cd_uyVien1: '',
  cd_uyVien2: '',
  cd_uyVien3: '',

  cd_moTa: '',
  cd_hienThiDaiHoi: false,
  cd_tenDaiHoi: 'Đại hội Chi Đoàn 2505QLNH',
  cd_thoiGian: '',
  cd_diaDiem: '',
  cd_moBauCu: false,
  cd_hienThiCongBauCu: false, // V9.1: chỉ điều khiển HIỂN THỊ, không đổi trạng thái nhận phiếu
  cd_hienThiKetQua: false,
  cd_dotBauCu: 'CD2026',

  ch_nhiemKy: '2026 – 2027',
  ch_chiHoiTruong: 'Chưa cập nhật',
  ch_chiHoiPho: 'Chưa cập nhật',

  ch_uyVien: 'Chưa cập nhật',
  ch_uyVien1: '',
  ch_uyVien2: '',
  ch_uyVien3: '',

  ch_moTa: '',
  ch_hienThiDaiHoi: true,
  ch_tenDaiHoi: 'Đại hội Hội viên Chi Hội 2505QLNH (Phiên trù bị)',
  ch_thoiGian: '2026-10-16T07:15:00+07:00',
  ch_diaDiem: 'Sẽ thông báo sau',
  ch_moBauCu: false,
  ch_hienThiCongBauCu: false, // V9.1: ẩn độc lập với mở/đóng cổng
  ch_hienThiKetQua: false,
  ch_dotBauCu: 'CH2026',
  // Cấu hình hiển thị nhân sự và nội dung đại hội V3.
  cd_uyVienBoSungVisible: '[]',
  ch_uyVienBoSungVisible: '[]',
  cd_bauCuLyDoDong: '',
  ch_bauCuLyDoDong: '',
  cd_bauCuDaMo: false,
  ch_bauCuDaMo: false,
  cd_hienThiDeAn: true,
  ch_hienThiDeAn: true,
  cd_deAnCongBo: '',
  ch_deAnCongBo: '',
  cd_bauCuUngVien: '',
  ch_bauCuUngVien: '',
  cd_toiDaTinNhiem: '0',
  ch_toiDaTinNhiem: '0',
  cd_congBoUngVienMode: false,
  ch_congBoUngVienMode: false,
  cd_hienMoTa: true,
  cd_anNhiemKy: false,
  cd_anNguoiDungDau: false,
  cd_anCapPho: false,
  cd_anUyVien: false,
  cd_anUyVien1: false,
  cd_anUyVien2: false,
  cd_anUyVien3: false,
  cd_phoBoSung: '[]',
  cd_uyVienBoSung: '[]',
  cd_batDauDaiHoi: '',
  cd_ketThucDaiHoi: '',
  cd_trangPhuc: '',
  cd_thanhPhan: '',
  cd_luuYDaiHoi: '',
  cd_hienDemNguoc: true,
  cd_moPhieuLuc: '',
  cd_dongPhieuLuc: '',
  cd_gioiHanPhieu: '0',
  cd_khongGioiHanPhieu: true,
  cd_hienSoPhieu: false,
  cd_congBoUngVien: '[]',
  ch_hienMoTa: true,
  ch_anNhiemKy: false,
  ch_anNguoiDungDau: false,
  ch_anCapPho: false,
  ch_anUyVien: false,
  ch_anUyVien1: false,
  ch_anUyVien2: false,
  ch_anUyVien3: false,
  ch_phoBoSung: '[]',
  ch_uyVienBoSung: '[]',
  ch_batDauDaiHoi: '',
  ch_ketThucDaiHoi: '',
  ch_trangPhuc: '',
  ch_thanhPhan: '',
  ch_luuYDaiHoi: '',
  ch_hienDemNguoc: true,
  ch_moPhieuLuc: '',
  ch_dongPhieuLuc: '',
  ch_gioiHanPhieu: '0',
  ch_khongGioiHanPhieu: true,
  ch_hienSoPhieu: false,
  ch_congBoUngVien: '[]'
};

const START_ACT = [
  [
    'ThanhAmTriThuc_2026',
    'THAM GIA ĐỘI THI CUỘC THI THANH ÂM TRI THỨC',
    'Đăng ký tham gia đội thi Cuộc thi Thanh Âm Tri Thức.',
    '2026-10-14T20:00:00+07:00',
    '2026-10-19T20:00:00+07:00',
    'Dự kiến giữa tháng 11/2026',
    'Sẽ thông báo sau',
    'Vui lòng nhập đúng họ tên và MSSV.',
    '',
    true,
    true
  ],
  [
    'BieuDien_DaiHoiHoiVien_2026',
    'THAM GIA BIỂU DIỄN ĐẠI HỘI HỘI VIÊN CHI HỘI 2505QLNH',
    'Đăng ký biểu diễn văn nghệ tại Đại hội Hội viên.',
    '2026-10-14T20:00:00+07:00',
    '2026-10-16T20:00:00+07:00',
    'Ngày 21/10/2026',
    'Sẽ thông báo sau',
    'Loại hình tham gia: ca hát.',
    '',
    true,
    true
  ]
];

const START_CAND = [
  ['UV01', 'ChiHoi', 'Phan Gia Bảo', 'An Giang', 'Kinh', 'Phật giáo Hòa Hảo', 'Không', true],
  ['UV02', 'ChiHoi', 'Nguyễn Hoàng Thiên Kim', 'Vĩnh Long', 'Kinh', 'Không', 'Ủy viên Ban Chấp hành Chi hội', true],
  ['UV03', 'ChiHoi', 'Nguyễn Chung Lan Thanh', 'Cà Mau', 'Kinh', 'Không', 'Ủy viên Ban Chấp hành Chi hội', true],
  ['UV04', 'ChiHoi', 'Huỳnh Thị Quỳnh Trâm', 'Quảng Ngãi', 'Kinh', 'Không', 'Không', true],
  ['UV05', 'ChiHoi', 'Nguyễn Thị Ngọc Trâm', 'Đồng Tháp', 'Kinh', 'Không', 'Chi hội phó', true],
  ['UV06', 'ChiHoi', 'Nguyễn Minh Trung', 'Đồng Tháp', 'Kinh', 'Không', 'Chi hội trưởng', true],
  ['UV07', 'ChiHoi', 'Nguyễn Ngọc Huỳnh Vy', 'Đồng Tháp', 'Kinh', 'Không', 'Không', true],
  ['UV08', 'ChiHoi', 'Nguyễn Thảo Vy', 'Quảng Ngãi', 'Kinh', 'Không', 'Ủy viên Ban Chấp hành Chi hội', true],
  ['UV09', 'ChiHoi', 'Hồ Đăng Khoa', 'Tỉnh Gia Lai', 'Kinh', 'Phật giáo', 'Lớp phó học tập', true]
];

// ==========================================
// KHỞI TẠO CƠ SỞ DỮ LIỆU MỚI
// KHÔNG CHẠY LẠI TRÊN SHEET ĐÃ CÓ
// ==========================================

function setupNewClassStore_() {
  const p = PropertiesService.getScriptProperties();

  if (p.getProperty('CLASS_STORE_ID')) {
    throw Error('Kho đã cấu hình. Dừng để bảo toàn dữ liệu.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw Error('Tạo Apps Script từ bảng tính MỚI dành riêng cho lớp.');
  }

  Object.keys(HEAD).forEach(name => {
    if (ss.getSheetByName(name)) {
      throw Error('Sheet đã tồn tại: ' + name);
    }
  });

  Object.keys(HEAD).forEach(name => {
    const sh = ss.insertSheet(name);

    sh.getRange(1, 1, 1, HEAD[name].length)
      .setValues([HEAD[name]])
      .setFontWeight('bold')
      .setBackground('#15477f')
      .setFontColor('white');

    sh.setFrozenRows(1);
  });

  const cfg = Object.keys(DEFAULT_CONFIG)
    .map(k => [k, DEFAULT_CONFIG[k]]);

  ss.getSheetByName(S.CONFIG)
    .getRange(2, 1, cfg.length, 2)
    .setValues(cfg);

  ss.getSheetByName(S.ACT)
    .getRange(2, 1, START_ACT.length, 11)
    .setValues(START_ACT);

  ss.getSheetByName(S.CAND)
    .getRange(2, 1, START_CAND.length, 8)
    .setValues(START_CAND);

  p.setProperty('CLASS_STORE_ID', ss.getId());

  return 'Kho mới đã sẵn sàng: ' + ss.getId();
}

// ==========================================
// KẾT NỐI GOOGLE SHEETS
// ==========================================

let qlnhExecutionStore_;
function store_() {
  if(qlnhExecutionStore_)return qlnhExecutionStore_;
  const id = PropertiesService.getScriptProperties()
    .getProperty('CLASS_STORE_ID');

  if (!id) {
    throw Error('Chưa chạy setupNewClassStore');
  }

  return (qlnhExecutionStore_=SpreadsheetApp.openById(id));
}

function rows_(name) {
  const d = store_()
    .getSheetByName(name)
    .getDataRange()
    .getValues();

  if (d.length <= 1) return [];

  return d.slice(1)
    .filter(r => r.some(x => x !== ''))
    .map(r => Object.fromEntries(
      d[0].map((k, i) => [
        k,
        r[i] instanceof Date
          ? Utilities.formatDate(
              r[i],
              Session.getScriptTimeZone(),
              "yyyy-MM-dd'T'HH:mm:ssXXX"
            )
          : r[i]
      ])
    ));
}

function cfg_() {
  return Object.fromEntries(
    rows_(S.CONFIG).map(r => [r.KEY, r.VALUE])
  );
}

function yes_(v) {
  return v === true ||
    String(v).toLowerCase() === 'true' ||
    String(v) === '1';
}

function safe_(v, max) {
  const s = String(
    v === undefined || v === null ? '' : v
  ).trim();

  if (
    s.length > (max || 5000) ||
    /^[=+@\-\t\r]/.test(s)
  ) {
    throw Error('Dữ liệu không hợp lệ');
  }

  return s;
}

// ==========================================
// HOẠT ĐỘNG
// ==========================================

function act_(r) {
  return {
    id: String(r.ID),
    title: String(r.TEN_HOAT_DONG || ''),
    description: String(r.MO_TA || ''),
    opensAt: String(r.MO_DANG_KY || ''),
    closesAt: String(r.DONG_DANG_KY || ''),
    eventTime: String(r.THOI_GIAN_DIEN_RA || ''),
    location: String(r.DIA_DIEM || ''),
    note: String(r.LUU_Y || ''),
    limit: Number(r.GIOI_HAN) || 0,
    unlimited: yes_(r.KHONG_GIOI_HAN),
    seriesId: String(r.CHUOI_ID || ''),
    archived: String(r.TRANG_THAI || 'ACTIVE') === 'ARCHIVED',
    archivedAt: String(r.LUU_TRU_LUC || '')
  };
}

// ==========================================
// KIỂM PHIẾU
// ==========================================

function tally_(branch, candidates, votes) {
  const c = candidates.filter(x => x.PHAN_HE === branch);

  const config = cfg_();

  const run = config[
    (branch === 'ChiHoi' ? 'ch' : 'cd') + '_dotBauCu'
  ];

  const vv = votes.filter(
    v => v.PHAN_HE === branch && v.DOT_BAU_CU === run
  );
  const votedIds=new Set();
  vv.forEach(v=>{try{JSON.parse(v.DANH_SACH_UNG_VIEN).forEach(id=>votedIds.add(String(id)));}catch(e){}});
  // Ứng viên đã lưu trữ vẫn dùng để tính lại phiếu cũ của đúng đợt bầu cử.
  const archived=archivedCandidates_().filter(x=>x.PHAN_HE===branch&&String(x.DOT_BAU_CU)===String(run)&&votedIds.has(String(x.ID)));
  const display=[...c];
  archived.forEach(x=>{if(!display.some(y=>String(y.ID)===String(x.ID)))display.push(x);});

  return {
    total: vv.length,
    run,

    results: v8RankResults_(display.map(x => {
      const applicable = vv.filter(v => {
        try {
          return JSON.parse(
            v.DANH_SACH_UNG_VIEN
          ).includes(String(x.ID));
        } catch (e) {
          return false;
        }
      });

      const no = applicable.filter(v => {
        try {
          return JSON.parse(
            v.DANH_SACH_KHONG_TIN_NHIEM
          ).includes(String(x.ID));
        } catch (e) {
          return false;
        }
      }).length;

      return {
        id: x.ID,
        name: x.HO_TEN,
        total: applicable.length,
        notTrusted: no,
        trusted: applicable.length - no,
        percent: applicable.length
          ? Math.round(
              (applicable.length - no) *
              10000 / applicable.length
            ) / 100
          : 0
      };
    }))
  };
}

// ==========================================
// DỮ LIỆU CÔNG KHAI CHO WEBSITE
// ==========================================

function activityPublicSnapshot_(){
  const all = rows_(S.ACT);
  const regs = rows_(S.REG);
  const seriesRows = activitySeriesRows_();
  const activeSeries = seriesRows.filter(r =>
    yes_(r.HIEN_THI) && !isArchived_(r)
  );

  const byActivity=new Map();for(const reg of regs){const id=String(reg.HOAT_DONG_ID);if(!byActivity.has(id))byActivity.set(id,[]);byActivity.get(id).push(reg);}
  const mapActivity = r => {
    const a = act_(r);
    const parent = a.seriesId
      ? activeSeries.find(x => String(x.ID) === a.seriesId)
      : null;
    const list = (byActivity.get(a.id)||[])
      .map(x => ({
        name: String(x.HO_TEN || ''),
        time: x.THOI_GIAN instanceof Date ? x.THOI_GIAN.toISOString() : String(x.THOI_GIAN || '')
      }));
    return {
      ...a,
      opensAt: parent ? String(parent.MO_DANG_KY || '') : a.opensAt,
      count: list.length,
      // Authentication is required by the V15 Student Gateway. Publish names only, never MSSV.
      registrants: list,
    };
  };

  const activeChildren = all.filter(r =>
    !!String(r.CHUOI_ID || '') && yes_(r.HIEN_THI) && !isArchived_(r)
  );

  return {
    success:true,updatedAt:new Date().toISOString(),
    // Hoạt động độc lập giữ nguyên dạng API cũ.
    activities: all.filter(r =>
      !String(r.CHUOI_ID || '') && yes_(r.HIEN_THI) && !isArchived_(r)
    ).map(mapActivity),
    // Chuỗi có các hoạt động con để sinh viên tích chọn trong 1 biểu mẫu.
    series: activeSeries.map(parent => ({
      id: String(parent.ID),
      title: String(parent.TEN_CHUOI || ''),
      description: String(parent.MO_TA || ''),
      opensAt: String(parent.MO_DANG_KY || ''),
      closesAt: String(parent.DONG_DANG_KY || ''),
      activities: activeChildren.filter(r =>
        String(r.CHUOI_ID) === String(parent.ID)
      ).map(mapActivity)
    })),
  };
}

function public_() {
  const c=cfg_(),candidates=rows_(S.CAND),votes=rows_(S.VOTES),activity=activityPublicSnapshot_();
  return {
    success: true,
    updatedAt: new Date().toISOString(),
    config: c,
    candidates: candidates.filter(r => v8ProposalVisible_(c,r)).map(v8PublicCandidate_),
    ballotCandidates: Object.fromEntries(['ChiHoi','ChiDoan'].map(branch => [branch,
      v8BallotCandidates_(c,branch,candidates).map(v8PublicCandidate_)])),
    activities:activity.activities,series:activity.series,
    attendanceSessions: attendancePublic_(),
    voteStatus: Object.fromEntries(['ChiHoi','ChiDoan'].map(branch => {
      const prefix = branch === 'ChiHoi' ? 'ch':'cd';
      const opened = voteGateOpen_(c,prefix);
      const run = String(c[prefix+'_dotBauCu']||'');
      const received = votes.filter(v=>v.PHAN_HE===branch&&String(v.DOT_BAU_CU)===run).length;
      const unlimited = yes_(c[prefix+'_khongGioiHanPhieu']);
      const limit = Number(c[prefix+'_gioiHanPhieu'])||0;
      return [branch, {open:opened, visible:yes_(c[prefix+'_hienThiCongBauCu']), showCount:yes_(c[prefix+'_hienSoPhieu']),
        count:received, unlimited,limit, full:!unlimited&&limit>0&&received>=limit,
        closeReason: v8BallotCloseReason_(c,prefix,received),
        everOpened:yes_(c[prefix+'_bauCuDaMo'])}];
    })),
    results: {
      ChiHoi: publishedResult_('ChiHoi',c,candidates,votes),
      ChiDoan: publishedResult_('ChiDoan',c,candidates,votes)
    },
    // V10.3: nhiều bảng kết quả công khai độc lập theo từng đợt bầu cử.
    publishedVoteRounds: kpPublishedVoteRounds_(c,candidates,votes)
  };
}


// V16.3 — read-only guest projection. No registrations, ballots, election runs,
// activity IDs, private contact fields or notification subscriptions.
function guestPublic_() {
  const full = cfg_();
  const keys = [
    'tenLop','slogan','bannerUrl','moTaLop','lop_hienMoTa',
    'coVan','lopTruong','lopPhoHocTap','lopPhoPhongTrao','lopPhoDoiSong',
    'lop_anCoVan','lop_anLopTruong','lop_anLopPhoHocTap','lop_anLopPhoPhongTrao','lop_anLopPhoDoiSong',
    'cd_nhiemKy','cd_biThu','cd_phoBiThu','cd_uyVien','cd_uyVien1','cd_uyVien2','cd_uyVien3',
    'cd_moTa','cd_hienMoTa','cd_anNhiemKy','cd_anNguoiDungDau','cd_anCapPho',
    'cd_anUyVien','cd_anUyVien1','cd_anUyVien2','cd_anUyVien3',
    'cd_phoBoSung','cd_uyVienBoSung','cd_uyVienBoSungVisible',
    'ch_nhiemKy','ch_chiHoiTruong','ch_chiHoiPho','ch_uyVien','ch_uyVien1','ch_uyVien2','ch_uyVien3',
    'ch_moTa','ch_hienMoTa','ch_anNhiemKy','ch_anNguoiDungDau','ch_anCapPho',
    'ch_anUyVien','ch_anUyVien1','ch_anUyVien2','ch_anUyVien3',
    'ch_phoBoSung','ch_uyVienBoSung','ch_uyVienBoSungVisible'
  ];
  const config={}; keys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(full,k))config[k]=full[k];});
  // Hidden values must never leave the server, not merely be hidden by CSS.
  const hide=(flag,key)=>{if(yes_(full[flag]))delete config[key];};
  [['lop_anCoVan','coVan'],['lop_anLopTruong','lopTruong'],
   ['lop_anLopPhoHocTap','lopPhoHocTap'],['lop_anLopPhoPhongTrao','lopPhoPhongTrao'],
   ['lop_anLopPhoDoiSong','lopPhoDoiSong']].forEach(pair=>hide(pair[0],pair[1]));
  if(full.lop_hienMoTa!==undefined&&!yes_(full.lop_hienMoTa))delete config.moTaLop;
  ['cd','ch'].forEach(pre=>{
    if(full[pre+'_hienMoTa']!==undefined&&!yes_(full[pre+'_hienMoTa']))delete config[pre+'_moTa'];
    hide(pre+'_anNhiemKy',pre+'_nhiemKy');
    hide(pre+'_anNguoiDungDau',pre+(pre==='cd'?'_biThu':'_chiHoiTruong'));
    if(yes_(full[pre+'_anCapPho'])){
      delete config[pre+(pre==='cd'?'_phoBiThu':'_chiHoiPho')];
      delete config[pre+'_phoBoSung'];
    }
    if(yes_(full[pre+'_anUyVien'])){
      ['_uyVien','_uyVien1','_uyVien2','_uyVien3','_uyVienBoSung','_uyVienBoSungVisible'].forEach(s=>delete config[pre+s]);
    } else {
      [1,2,3].forEach(i=>hide(pre+'_anUyVien'+i,pre+'_uyVien'+i));
      if(yes_(full[pre+'_anUyVien1']))delete config[pre+'_uyVien'];
      // Visible extras only; remove private names even from the JSON string field.
      try{
        const names=JSON.parse(String(full[pre+'_uyVienBoSung']||'[]'));
        const visible=JSON.parse(String(full[pre+'_uyVienBoSungVisible']||'[]'));
        if(Array.isArray(names))config[pre+'_uyVienBoSung']=JSON.stringify(names.filter((x,i)=>typeof x==='string'&&visible[i]!==false));
      }catch(e){delete config[pre+'_uyVienBoSung'];}
      delete config[pre+'_uyVienBoSungVisible'];
    }
  });
  return {success:true,updatedAt:new Date().toISOString(),config};
}

// ==========================================
// BIÊN NHẬN GIAO DỊCH
// ==========================================

function receiptLookup_(op){
 const sh=store_().getSheetByName(S.RECEIPTS);if(sh.getLastRow()<2)return null;
 const match=sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(String(op)).matchEntireCell(true).matchCase(true).useRegularExpression(false).findNext();
 if(!match)return null;const v=sh.getRange(match.getRow(),1,1,5).getValues()[0];return {MA_GIAO_DICH:v[0],LOAI:v[1],KET_QUA:v[2],THONG_BAO:v[3],THOI_GIAN:v[4]};
}
function receipt_(op) {
  const x=receiptLookup_(op);

  return x
    ? {
        success: yes_(x.KET_QUA),
        done: true,
        message: String(x.THONG_BAO)
      }
    : { done: false };
}

// ==========================================
// TRẢ DỮ LIỆU JSON / JSONP
// ==========================================

function output_(data, callback) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c');

  if (callback) {
    if (!/^[A-Za-z_$][\w$]{0,100}$/.test(callback)) {
      return ContentService.createTextOutput(
        'Invalid callback'
      );
    }

    return ContentService.createTextOutput(
      callback + '(' + json + ');'
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// API GET
// ==========================================

function doGet(e) {
  const p = e && e.parameter || {};

  try {
    // V16.3.1: PUBLIC READ ONLY actions must be accessible to anonymous guests.
    // All other data/actions still require the secret gateway key via Worker.
    // Never add write, receipt, election, attendance or admin actions here.
    const guestReadOnly = ['guestPublicData','guestNewsList','guestNewsDetail','theme2011Public','christmasPublic','siteMusicPublic','siteMotionPublic'];
    if (p.action && guestReadOnly.indexOf(String(p.action)) === -1 &&
        !qlnhGatewayAllowed_(p.gatewayKey)) {
      return output_({ success:false, message:'Cần đăng nhập sinh viên' }, p.callback);
    }
    if (p.action === 'christmasPublic') return output_(qlnhChristmasPublic_());
    if (p.action === 'theme2011Public') {
      return output_(theme2011Public_());
    }
    if (p.action === 'siteMusicPublic') {
      return output_(typeof qlnhPlaylistPublic_==='function'?qlnhPlaylistPublic_():siteMusicPublic_());
    }
    if (p.action === 'siteMotionPublic') {
      return output_(qlnhMotionV22Public_());
    }
    if (p.action === 'siteMusicAudioBytes') {
      // Require the existing Worker gatewayKey; never allow anonymous direct GAS access.
      return output_(typeof qlnhPlaylistAudio_==='function'?qlnhPlaylistAudio_(p.track):siteMusicAudioBytes_());
    }
    if (p.action === 'guestPublicData') {
      return output_(guestPublic_());
    }
    if (p.action === 'guestNewsList') {
      return output_(newsGuestList_(p));
    }
    if (p.action === 'guestNewsDetail') {
      return output_(newsGuestDetail_(p));
    }
    if (p.action === 'fundPublic') return output_(fundPublicData_(fundMssv_(p.mssv)));
    if (p.action === 'fundInbox') return output_(fundStudentInbox_(p.mssv));
    if (p.action === 'publicData') {
      return output_(public_(), p.callback);
    }
    if(p.action==='activitySnapshot')return output_(activityPublicSnapshot_());
    if(p.action==='attendancePrivateInbox')return output_(attNotifyInbox_(p.mssv));
    if (p.action === 'attendanceMine') {
      return output_(attendanceMine_(p.mssv));
    }
    if (p.action === 'notificationFeed') {
      return output_(nuPublicFeed_(p), p.callback);
    }

    if (p.action === 'newsList') {
      return output_(newsPublicList_(p), p.callback);
    }
    if (p.action === 'newsDetail') {
      return output_(newsPublicDetail_(p), p.callback);
    }

    // V17.0: private student-only read operations; this branch is behind gatewayKey.
    if (p.action === 'v17ExamList') return output_(v17GetExams_(p.mssv));
    if (p.action === 'v17ReportList') return output_(v17StudentReports_(v17Mssv_(p.mssv)));
    if (p.action === 'v17Inbox') return output_(v17PrivateFeed_(p.mssv));
    if (p.action === 'v17DocList') return output_(v17StudentDocs_(p.mssv,p.q));
    if (p.action === 'v17DocDetail') return output_(v17StudentDocDetail_(p.mssv,p.id));
    if (p.action === 'v17DocFile') return output_(v17StudentDocFile_(p.mssv,p.id,p.mode));
    if (p.action === 'v17DocTicket') return output_(v17StudentDocTicket_(p.mssv,p.id,p.mode));
    if (p.action === 'receipt') {
      return output_(
        receipt_(safe_(p.op, 100)),
        p.callback
      );
    }

    return HtmlService
      .createHtmlOutputFromFile('Admin')
      .setTitle('Admin | LỚP 2505QLNH')
      .addMetaTag(
        'viewport',
        'width=device-width,initial-scale=1'
      );
  } catch (err) {
    return output_(
      {
        success: false,
        message: String(err.message)
      },
      p.callback
    );
  }
}

// ==========================================
// API POST
// ==========================================

function doPost(e) {
  let op = '';

  try {
    const body = JSON.parse(
      (e.postData && e.postData.contents) || '{}'
    );

    // Student Gateway V15: do not accept direct anonymous writes.
    if (!qlnhGatewayAllowed_(body.gatewayKey)) {
      return output_({ success:false, message:'Yêu cầu xác thực' });
    }
    op = safe_(body.op, 100);

    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(op)) {
      throw Error('Mã giao dịch không hợp lệ');
    }

    if(body.action==='attendancePhoto')return output_(attendancePhotoCommit_(body,op));

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);

    try {
      const old=receiptLookup_(op);

      if (old) {
        return output_({
          success: yes_(old.KET_QUA),
          message: old.THONG_BAO
        });
      }

      try {
        let message;

        if (body.action === 'register') {
          message = register_(body);
        } else if (body.action === 'registerSeries') {
          message = registerSeries_(body);
        } else if (body.action === 'vote') {
          message = vote_(body);
        } else if (body.action === 'fundReport') {
          message = fundStudentReport_(fundMssv_(body.studentId),body);
        } else if (body.action === 'v17ExamReport') {
          message = v17StudentReport_(v17Mssv_(body.studentId),body);
        } else if (body.action === 'attendance') {
          message = attendanceSubmit_(body);
        } else {
          throw Error('Hành động không được hỗ trợ');
        }

        store_()
          .getSheetByName(S.RECEIPTS)
          .appendRow([
            op,
            body.action,
            true,
            message,
            new Date()
          ]);

        return output_({
          success: true,
          message
        });

      } catch (err) {
        store_()
          .getSheetByName(S.RECEIPTS)
          .appendRow([
            op,
            body.action,
            false,
            String(err.message),
            new Date()
          ]);

        return output_({
          success: false,
          message: String(err.message)
        });
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return output_({
      success: false,
      message: String(err.message)
    });
  }
}

// ==========================================
// ĐĂNG KÝ HOẠT ĐỘNG
// ==========================================

function validateRegistrant_(b) {
  const name = safe_(b.name, 150);
  const studentId = safe_(b.studentId, 40).toUpperCase();
  if (name.length < 2 || !/^[0-9A-Za-z]{4,30}$/.test(studentId)) {
    throw Error('Họ tên hoặc MSSV không hợp lệ');
  }
  return { name, studentId };
}

function checkActivitySignup_(raw, parent, regs, studentId, now) {
  if (!raw || !yes_(raw.HIEN_THI) || isArchived_(raw)) {
    throw Error('Hoạt động đang ẩn hoặc đã lưu trữ');
  }
  const a = act_(raw);
  if (a.seriesId && (!parent || String(parent.ID) !== a.seriesId)) {
    throw Error('Chuỗi hoạt động không hợp lệ');
  }
  if (parent && (!yes_(parent.HIEN_THI) || isArchived_(parent))) {
    throw Error('Chuỗi hoạt động đã đóng');
  }
  const open = Date.parse(parent ? parent.MO_DANG_KY : a.opensAt);
  const explicitClose = a.closesAt ? Date.parse(a.closesAt) : Infinity;
  const parentClose = parent && parent.DONG_DANG_KY ? Date.parse(parent.DONG_DANG_KY) : Infinity;
  if (!Number.isFinite(open) || Number.isNaN(explicitClose) || Number.isNaN(parentClose) ||
      now < open || now >= Math.min(explicitClose,parentClose)) {
    throw Error('Hoạt động "' + a.title + '" chưa mở hoặc đã hết hạn');
  }
  const prev = regs.filter(r => String(r.HOAT_DONG_ID) === a.id);
  if (prev.some(r => String(r.MSSV).toUpperCase() === studentId)) {
    throw Error('MSSV đã đăng ký hoạt động: ' + a.title);
  }
  if (!a.unlimited && (!a.limit || prev.length >= a.limit)) {
    throw Error('Hoạt động đã đủ số lượng: ' + a.title);
  }
  return a;
}

// doPost đã dùng ScriptLock; kiểm tra và ghi nhiều hoạt động trong cùng khóa.
function register_(b) {
  const id = safe_(b.activityId, 100);
  const person = validateRegistrant_(b);
  const raw = rows_(S.ACT).find(r => String(r.ID) === id);
  if (!raw || String(raw.CHUOI_ID || '')) {
    throw Error('Hoạt động không hợp lệ; hãy đăng ký qua biểu mẫu chuỗi');
  }
  const existing=rows_(S.REG);
  checkActivitySignup_(raw, null, existing, person.studentId, Date.now());
  store_().getSheetByName(S.REG).appendRow([
    b.op, id, person.name, person.studentId, new Date()
  ]);
  try{v8QueueFullActivity_(raw,null,existing.filter(r=>String(r.HOAT_DONG_ID)===id).length+1);}catch(ex){console.warn('Thông báo đủ chỗ đang chờ khắc phục:',ex);}
  return 'Đăng ký thành công';
}

function registerSeries_(b) {
  const seriesId = safe_(b.seriesId, 100);
  const person = validateRegistrant_(b);
  const ids = b.activityIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 30 ||
      ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9_-]{2,100}$/.test(id)) ||
      new Set(ids).size !== ids.length) {
    throw Error('Vui lòng chọn từ 1 đến 30 hoạt động hợp lệ');
  }
  const parent = activitySeriesRows_().find(r => String(r.ID) === seriesId);
  if (!parent || !yes_(parent.HIEN_THI) || isArchived_(parent)) {
    throw Error('Chuỗi hoạt động không tồn tại hoặc đã đóng');
  }
  const all = rows_(S.ACT);
  const regs = rows_(S.REG);
  const now = Date.now();
  // Kiểm tra TẤT CẢ trước khi ghi, không cho phép đăng ký một phần.
  ids.forEach(id => {
    const raw = all.find(r => String(r.ID) === id && String(r.CHUOI_ID) === seriesId);
    checkActivitySignup_(raw, parent, regs, person.studentId, now);
  });
  const sheet = store_().getSheetByName(S.REG);
  const first = sheet.getLastRow() + 1;
  const stamp = new Date();
  // Ghi một khối liên tục; mỗi hoạt động có bản ghi riêng.
  const rows = ids.map(id => [b.op, id, person.name, person.studentId, stamp]);
  sheet.getRange(first, 1, rows.length, 5).setValues(rows);
  ids.forEach(id=>{
    const raw=all.find(r=>String(r.ID)===id&&String(r.CHUOI_ID)===seriesId);
    try{v8QueueFullActivity_(raw,parent,regs.filter(r=>String(r.HOAT_DONG_ID)===id).length+1);}catch(ex){console.warn('Thông báo đủ chỗ đang chờ khắc phục:',ex);}
  });
  return 'Đăng ký thành công ' + ids.length + ' hoạt động';
}

// ==========================================
// BỎ PHIẾU BẦU CỬ
// ==========================================

function voteGateOpen_(c,prefix) {
  if (!yes_(c[prefix+'_moBauCu'])) return false;
  const now=Date.now();
  const start=String(c[prefix+'_moPhieuLuc']||'').trim();
  const end=String(c[prefix+'_dongPhieuLuc']||'').trim();
  if (start && (!Number.isFinite(Date.parse(start)) || now<Date.parse(start))) return false;
  if (end && (!Number.isFinite(Date.parse(end)) || now>=Date.parse(end))) return false;
  const max=Number(c[prefix+'_gioiHanPhieu'])||0;
  if(!yes_(c[prefix+'_khongGioiHanPhieu'])&&max>0){
    const branch=prefix==='cd'?'ChiDoan':'ChiHoi',run=String(c[prefix+'_dotBauCu']||'');
    if(rows_(S.VOTES).filter(v=>v.PHAN_HE===branch&&String(v.DOT_BAU_CU)===run).length>=max)return false;
  }
  return true;
}
function publishedResult_(branch,c,candidates,votes){
  const prefix=branch==='ChiHoi'?'ch':'cd';
  if(!yes_(c[prefix+'_hienThiKetQua']))return null;
  const data=tally_(branch,candidates,votes);
  let allow=[];try{const parsed=JSON.parse(String(c[prefix+'_congBoUngVien']||'[]'));if(Array.isArray(parsed))allow=parsed.map(String);}catch(e){}
  if(yes_(c[prefix+'_congBoUngVienMode'])||allow.length)data.results=data.results.filter(x=>allow.includes(String(x.id)));
  return data;
}

function vote_(b) {
  const branch = safe_(b.branch, 20);

  if (!['ChiHoi', 'ChiDoan'].includes(branch)) {
    throw Error('Phân hệ không hợp lệ');
  }

  const prefix = branch === 'ChiHoi' ? 'ch' : 'cd';
  const c = cfg_();

  if (!yes_(c[prefix + '_moBauCu'])) {
    throw Error('Cổng bầu cử đang đóng');
  }

  if (!voteGateOpen_(c,prefix)) throw Error('Cổng bầu cử đang đóng hoặc ngoài giờ bỏ phiếu');
  const max=Number(c[prefix+'_gioiHanPhieu'])||0;
  if (!yes_(c[prefix+'_khongGioiHanPhieu'])) {
    if(max<1)throw Error('Chưa thiết lập số phiếu tối đa');
    const received=rows_(S.VOTES).filter(v=>v.PHAN_HE===branch&&String(v.DOT_BAU_CU)===String(c[prefix+'_dotBauCu'])).length;
    if(received>=max)throw Error('Đã nhận đủ số phiếu cho đợt bầu cử này');
  }
  const run = safe_(b.run, 100);

  if (
    run !== String(c[prefix + '_dotBauCu'])
  ) {
    throw Error('Đợt bầu cử đã thay đổi');
  }

  const ids = v8BallotCandidates_(c,branch,rows_(S.CAND))
    .map(r => String(r.ID));

  if (!ids.length) {
    throw Error('Chưa có ứng viên');
  }

  const rejected = b.notTrusted;

  if (
    !Array.isArray(rejected) ||
    !rejected.length ||
    rejected.length > ids.length ||
    new Set(rejected).size !== rejected.length ||
    rejected.some(x => !ids.includes(x))
  ) {
    throw Error(
      'Phiếu bầu không hợp lệ: cần gạch ít nhất một ứng viên'
    );
  }

  const maxTrusted=Number(c[prefix+'_toiDaTinNhiem'])||0;
  if(maxTrusted>0 && ids.length-rejected.length>maxTrusted){
    throw Error('Phiếu bầu vượt số ứng cử viên tối đa được tín nhiệm');
  }
  store_()
    .getSheetByName(S.VOTES)
    .appendRow([
      b.op,
      branch,
      run,
      new Date(),
      JSON.stringify(rejected),
      JSON.stringify(ids)
    ]);
  if(!yes_(c[prefix+'_khongGioiHanPhieu'])&&max>0){
    const received=rows_(S.VOTES).filter(v=>v.PHAN_HE===branch&&String(v.DOT_BAU_CU)===run).length;
    if(received>=max){try{v8CloseBallotInternal_(branch,'LIMIT');}catch(ex){console.warn('Đã đủ phiếu nhưng không thể ghi trạng thái thông báo:',ex);}}
  }
  return 'Đã ghi nhận phiếu bầu kín';
}

// ==========================================
// TÀI KHOẢN ADMIN
// ==========================================

function setAdminCredentialsOnce(username, password) {
  const p = PropertiesService.getScriptProperties();

  if (p.getProperty('ADMIN_PASSWORD_HASH')) {
    throw Error('Đã có tài khoản, không ghi đè');
  }

  if (String(password).length < 12) {
    throw Error('Mật khẩu phải dài ít nhất 12 ký tự');
  }

  const salt = Utilities.getUuid();
  const user = safe_(username, 80);

  p.setProperties({
    ADMIN_USERNAME: user,
    ADMIN_PASSWORD_SALT: salt,
    ADMIN_PASSWORD_HASH: hash_(password, salt)
  });

  return 'Đã thiết lập tài khoản';
}

function hash_(s, salt) {
  return Utilities.base64Encode(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      salt + String(s),
      Utilities.Charset.UTF_8
    )
  );
}

function adminLogin(user, password, rememberDevice) {
  const p = PropertiesService.getScriptProperties();

  // V19.4: Treasurer has a separate, fund-only session. Never insert it into sess_.
  if (safe_(user, 80) !== p.getProperty('ADMIN_USERNAME') ||
      hash_(password,p.getProperty('ADMIN_PASSWORD_SALT')) !== p.getProperty('ADMIN_PASSWORD_HASH')) {
    const treasurer = fundLoginTreasurer_(user,password);
    if (treasurer) return treasurer;
    return qlnhAclLogin_(user,password);
  }

  const token =
    Utilities.getUuid() +
    Utilities.getUuid();

  CacheService.getScriptCache().put('sess_' + token,user,21600);
  // Persistent sessions are stored as hashes, never plaintext tokens.
  if(rememberDevice){
    const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,token));
    PropertiesService.getScriptProperties().setProperty('remember_'+digest,JSON.stringify({user,expires:Date.now()+30*86400000}));
  }

  return { token, user, role:'super' };
}

function auth_(token) {
  if(QLNH_ACL_CAP_&&token===QLNH_ACL_CAP_.token)return QLNH_ACL_CAP_.user;
  if(String(token||'').startsWith('deleg_'))throw Error('Không có quyền truy cập API quản trị cũ');
  const user = CacheService
    .getScriptCache()
    .get('sess_' + String(token));

  if (user) return user;
  const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(token)));
  const props=PropertiesService.getScriptProperties();
  const saved=props.getProperty('remember_'+digest);
  if(saved){
    try{
      const record=JSON.parse(saved);
      if(record.expires>Date.now())return record.user;
    }catch(e){}
    props.deleteProperty('remember_'+digest);
  }
  throw Error('Phiên đăng nhập hết hạn');
}

function adminLogout(token) {
  if(String(token||'').startsWith('deleg_'))return qlnhAclWorker_('logout',{token:qlnhAclRaw_(token)});
  // Treasurer session is not shared with any legacy admin API.
  CacheService.getScriptCache().remove('fundsess_' + String(token));
  CacheService
    .getScriptCache()
    .remove('sess_' + String(token));
  const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(token)));
  PropertiesService.getScriptProperties().deleteProperty('remember_'+digest);
  return true;
}

// ==========================================
// DASHBOARD ADMIN
// ==========================================

function adminAttendanceDashboard(token){
  auth_(token);
  return {attendanceSessions:attendanceRows_('BuoiDiemDanh'),attendanceRecords:attendanceRows_('DanhSachDiemDanh'),attendancePhotoRecords:attendancePhotoAdminRows_(),attendanceCodes:attendanceCodesMap_(),attendanceRetryGrants:attendanceRetryRows_()};
}

function adminDashboard(token) {
  auth_(token);

  const c = rows_(S.CAND);
  const v = rows_(S.VOTES);

  return {
    config: cfg_(),

    activities: rows_(S.ACT),

    series: activitySeriesRows_(),

    candidates: c,

    registrations: rows_(S.REG),

    results: {
      ChiHoi: tally_('ChiHoi', c, v),
      ChiDoan: tally_('ChiDoan', c, v)
    },

    voteArchives: voteArchiveList_(),
    resultPublications: kpPublicationList_(),

    voteCount: v.length,

    attendanceSessions:
      attendanceRows_('BuoiDiemDanh'),

    attendanceRecords:
      attendanceRows_('DanhSachDiemDanh'),
    attendancePhotoRecords: attendancePhotoAdminRows_(),
    attendanceCodes: attendanceCodesMap_(),
    attendanceRetryGrants: attendanceRetryRows_()
  };
}


// Xóa đúng một lượt đăng ký, không tác động các hoạt động khác trong chuỗi.
function adminDeleteRegistration(token, activityId, transactionId, studentId) {
  const user = auth_(token);
  const aid = safe_(activityId, 100);
  const tx = safe_(transactionId, 100);
  const sid = safe_(studentId, 40).toUpperCase();
  if (!aid || !tx || !sid) throw Error('Thiếu thông tin xác định lượt đăng ký');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = store_().getSheetByName(S.REG);
    if (!sh) throw Error('Không tìm thấy bảng đăng ký');
    const values = sh.getDataRange().getValues();
    const keys = values[0].map(String);
    const ix = ['MA_GIAO_DICH','HOAT_DONG_ID','HO_TEN','MSSV','THOI_GIAN']
      .map(k => keys.indexOf(k));
    if (ix.some(i => i < 0)) throw Error('Cấu trúc bảng đăng ký không hợp lệ');
    const matches = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[ix[0]]) === tx && String(row[ix[1]]) === aid &&
          String(row[ix[3]]).trim().toUpperCase() === sid) matches.push(i + 1);
    }
    if (matches.length !== 1) throw Error(matches.length ? 'Có bản ghi trùng; chưa xóa để bảo vệ dữ liệu' : 'Không tìm thấy lượt đăng ký (có thể đã bị xóa)');
    const sheetRow = matches[0];
    const record = values[sheetRow - 1];
    // Ghi nhật ký trước khi xóa để lưu lại dữ liệu gốc phục vụ đối chiếu.
    audit_(user, 'DELETE_REGISTRATION', JSON.stringify({
      activityId: aid, transactionId: tx, studentId: sid,
      name: String(record[ix[2]]), registeredAt: String(record[ix[4]]),
      row: sheetRow
    }));
    sh.deleteRow(sheetRow);
    SpreadsheetApp.flush();
    return {success: true, message: 'Đã xóa một lượt đăng ký của ' + String(record[ix[2]])};
  } finally {
    lock.releaseLock();
  }
}

// Thêm các KEY cấu hình mới, không sửa hoặc xóa bất kỳ dữ liệu cũ.
function adminInstallV3Config(token){
 const user=auth_(token),sh=store_().getSheetByName(S.CONFIG),existing=cfg_();
 const add=Object.keys(DEFAULT_CONFIG).filter(k=>!(k in existing));
 if(add.length)sh.getRange(sh.getLastRow()+1,1,add.length,2).setValues(add.map(k=>[k,DEFAULT_CONFIG[k]]));
 audit_(user,'INSTALL_V3_CONFIG','Đã thêm '+add.length+' KEY');
 return {added:add.length};
}

// ==========================================
// NHẬT KÝ QUẢN TRỊ
// ==========================================

function audit_(user, action, detail) {
  store_()
    .getSheetByName(S.LOG)
    .appendRow([
      new Date(),
      user,
      action,
      detail
    ]);
}

// ==========================================
// LƯU THÔNG TIN LỚP / CHI ĐOÀN / CHI HỘI
// ==========================================

function adminSaveConfig(token, patch) {
  const user = auth_(token);
  const oldConfig=cfg_();

  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch)
  ) {
    throw Error('Dữ liệu không hợp lệ');
  }

  const sheet = store_()
    .getSheetByName(S.CONFIG);

  const data = sheet
    .getDataRange()
    .getValues();

  Object.keys(patch).forEach(key => {
    if (
      !Object.prototype.hasOwnProperty.call(
        DEFAULT_CONFIG,
        key
      )
    ) {
      throw Error('Trường không được phép: ' + key);
    }

    let value = patch[key];

    if (typeof DEFAULT_CONFIG[key] === 'boolean') {
      value = yes_(value);
    } else {
      value = safe_(value, 3000);
    }

    if (
      key.endsWith('_dotBauCu') &&
      !/^[A-Za-z0-9_-]{2,100}$/.test(value)
    ) {
      throw Error('Mã đợt bầu cử không hợp lệ');
    }

    if (
      key === 'bannerUrl' &&
      value &&
      !/^https:\/\//.test(value)
    ) {
      throw Error('Ảnh phải dùng URL https');
    }

    const row = data.findIndex(
      (x, i) => i > 0 && x[0] === key
    );

    if (row >= 0) {
      sheet
        .getRange(row + 1, 2)
        .setValue(value);
    } else {
      sheet.appendRow([key, value]);
    }
  });

  audit_(
    user,
    'CONFIG',
    Object.keys(patch).join(',')
  );
  v8OnConfigChanged_(oldConfig,patch);
  return true;
}

// ==========================================
// LƯU HOẠT ĐỘNG / ỨNG CỬ VIÊN
// ==========================================

function adminSaveRecord(token, section, record) {
  const user = auth_(token);

  if (![S.ACT, S.CAND].includes(section)) {
    throw Error('Không hỗ trợ');
  }

  const headers = HEAD[section];

  if (
    !record ||
    typeof record !== 'object'
  ) {
    throw Error('Bản ghi không hợp lệ');
  }

  const id = safe_(record.ID, 100);

  if (!/^[\w-]{2,100}$/.test(id)) {
    throw Error(
      'ID chỉ gồm chữ, số, dấu gạch, dài ít nhất 2 ký tự'
    );
  }

  if (
    section === S.CAND &&
    !['ChiHoi', 'ChiDoan'].includes(record.PHAN_HE)
  ) {
    throw Error('Phân hệ phải là ChiHoi hoặc ChiDoan');
  }

  if (section === S.ACT) installActivitySeriesModule();
  const sh = store_().getSheetByName(section);
  const data = sh.getDataRange().getValues();
  const i = data.findIndex(
    (r, j) => j > 0 && String(r[0]) === id
  );
  const old = i > 0 ? data[i] : null;
  if(section === S.CAND && !old && archivedCandidates_().some(r=>String(r.ID)===id)){
    throw Error('Mã ứng viên đã có trong lịch sử. Hãy dùng mã ID mới cho đề án mới để không lẫn phiếu cũ.');
  }
  if (section === S.ACT && old && String(old[11] || '')) {
    throw Error('Hoạt động con chỉ được sửa tại biểu mẫu Chuỗi hoạt động');
  }
  const row = headers.map((h, idx) => {
    if (section === S.ACT && idx >= 11) {
      return old ? old[idx] : (h === 'TRANG_THAI' ? 'ACTIVE' : '');
    }
    return typeof record[h] === 'boolean'
      ? record[h] : safe_(record[h], 3000);
  });
  if (section === S.ACT) {
    activityValidateTimes_(row[3], row[4]);
    activityValidateLimit_(row[8], row[9]);
  }

  if (i > 0) {
    sh.getRange(
      i + 1,
      1,
      1,
      row.length
    ).setValues([row]);
  } else {
    sh.appendRow(row);
  }

  audit_(user, 'SAVE', section + ' ' + id);

  return true;
}

// ==========================================
// XÓA HOẠT ĐỘNG / ỨNG CỬ VIÊN
// ==========================================

function adminDeleteRecord(token, section, id) {
  const user = auth_(token);

  if (![S.ACT, S.CAND].includes(section)) {
    throw Error('Không hỗ trợ');
  }

  const sh = store_().getSheetByName(section);
  const data = sh.getDataRange().getValues();

  const i = data.findIndex(
    (r, j) => j > 0 && String(r[0]) === String(id)
  );

  if (i < 1) {
    throw Error('Không tìm thấy ID');
  }
  if (section === S.ACT) {
    if (String(data[i][11] || '')) {
      throw Error('Không xóa hoạt động trong chuỗi; hãy ẩn hoặc lưu trữ');
    }
    if (rows_(S.REG).some(r => String(r.HOAT_DONG_ID) === String(id))) {
      throw Error('Hoạt động đã có đăng ký; hãy nhấn Xong để lưu trữ');
    }
  }

  if (
    section === S.CAND &&
    rows_(S.VOTES).some(v => {
      try {
        return JSON.parse(
          v.DANH_SACH_UNG_VIEN
        ).includes(String(id));
      } catch (e) {
        return false;
      }
    })
  ) {
    throw Error(
      'Ứng viên đã xuất hiện trên phiếu bầu; ' +
      'hãy ẩn ứng viên thay vì xóa để bảo toàn kết quả'
    );
  }

  sh.deleteRow(i + 1);

  audit_(
    user,
    'DELETE',
    section + ' ' + id
  );

  return true;
}

// ==========================================
// CÀI ĐẶT MODULE ĐIỂM DANH
// CHỈ TẠO SHEET CÒN THIẾU
// ==========================================

function installAttendanceModule() {
  const ss = store_();

  const defs = {
    BuoiDiemDanh: [
      'ID',
      'TEN_BUOI',
      'LOAI',
      'HOAT_DONG_ID',
      'BAT_DAU',
      'KET_THUC',
      'DIA_DIEM',
      'CONG_KHAI',
      'DANG_MO',
      'GHI_CHU'
    ],

    DanhSachDiemDanh: [
      'MA_GIAO_DICH',
      'BUOI_ID',
      'HO_TEN',
      'MSSV',
      'THOI_GIAN'
    ]
  };

  let created = [];

  Object.keys(defs).forEach(name => {
    let sh = ss.getSheetByName(name);

    if (sh) {
      const actual = sh.getRange(
        1,
        1,
        1,
        defs[name].length
      ).getDisplayValues()[0];

      if (
        JSON.stringify(actual) !==
        JSON.stringify(defs[name])
      ) {
        throw Error(
          'Sheet ' + name +
          ' đã tồn tại nhưng cấu trúc khác. ' +
          'Dừng để bảo toàn dữ liệu.'
        );
      }

      return;
    }

    sh = ss.insertSheet(name);

    sh.getRange(
      1,
      1,
      1,
      defs[name].length
    )
      .setValues([defs[name]])
      .setFontWeight('bold')
      .setBackground('#24476d')
      .setFontColor('white');

    sh.setFrozenRows(1);
    created.push(name);
  });

  return created.length
    ? 'Đã tạo: ' + created.join(', ')
    : 'Hai sheet điểm danh đã tồn tại, không ghi đè dữ liệu.';
}

// ==========================================
// ĐỌC DỮ LIỆU ĐIỂM DANH
// ==========================================

function attendanceRows_(sheet) {
  return store_().getSheetByName(sheet)
    ? rows_(sheet)
    : [];
}

function attendanceParseTime_(value){
  if(value instanceof Date)return value.getTime();
  const raw=String(value==null?'':value).trim();if(!raw)return NaN;
  let m=/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?(Z|[+-]\d{2}:?\d{2})?$/i.exec(raw);
  if(!m){const v=/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(raw);if(v)m=[v[0],v[3],v[2],v[1],v[4],v[5],v[6]];}
  if(!m)return NaN;
  const y=+m[1],mo=+m[2],d=+m[3],h=+(m[4]||0),mi=+(m[5]||0),sec=+(m[6]||0),ms=+(String(m[7]||'0').padEnd(3,'0'));
  const utc=Date.UTC(y,mo-1,d,h,mi,sec,ms),check=new Date(utc);
  if(check.getUTCFullYear()!==y||check.getUTCMonth()!==mo-1||check.getUTCDate()!==d||h>23||mi>59||sec>59)return NaN;
  const zone=m[8]||'+07:00';if(zone.toUpperCase()==='Z')return utc;
  const z=/^([+-])(\d{2}):?(\d{2})$/.exec(zone);if(!z||+z[2]>23||+z[3]>59)return NaN;
  return utc-(z[1]==='-'?-1:1)*(+z[2]*60+ +z[3])*60000;
}
function attendanceStatus_(s,now){
  if(!s.public||!s.enabled)return 'closed';
  const start=attendanceParseTime_(s.startsAt),hasEnd=!!String(s.endsAt||'').trim(),end=hasEnd?attendanceParseTime_(s.endsAt):Infinity;
  if(!Number.isFinite(start)||(hasEnd&&(!Number.isFinite(end)||end<start)))return 'invalid';
  if(now<start)return 'upcoming';if(now>=end)return 'ended';return 'open';
}
function attendanceCanonical_(value){
  const raw=String(value==null?'':value).trim();if(!raw)return '';
  const t=attendanceParseTime_(value);return Number.isFinite(t)?new Date(t).toISOString():raw;
}
function attendanceSession_(r) {
  return {
    id: String(r.ID),
    title: String(r.TEN_BUOI || ''),
    kind: String(r.LOAI || 'HoatDong'),
    activityId: String(r.HOAT_DONG_ID || ''),
    startsAt: attendanceCanonical_(r.BAT_DAU),
    endsAt: attendanceCanonical_(r.KET_THUC),
    location: String(r.DIA_DIEM || ''),
    enabled: String(r.TRANG_THAI||'')!=='ARCHIVED'&&yes_(r.DANG_MO),
    public: String(r.TRANG_THAI||'')!=='ARCHIVED'&&yes_(r.CONG_KHAI),
    note: String(r.GHI_CHU || '')
  };
}

function attendancePublic_() {
  const codes = attendanceCodesMap_();
  return attendanceRows_('BuoiDiemDanh')
    .map(attendanceSession_)
    .filter(x => x.public)
    .map(x => ({ ...x, requiresCode: !!codes[x.id] }));
}

// ==========================================
// SINH VIÊN ĐIỂM DANH
// ==========================================

function attendanceSubmit_(b) {
  const sessionId = safe_(b.sessionId, 100);
  const name = safe_(b.name, 150);
  const mssv = safe_(b.studentId, 40);

  if (
    name.length < 2 ||
    !/^[0-9A-Za-z]{4,30}$/.test(mssv)
  ) {
    throw Error('Họ tên hoặc MSSV không hợp lệ');
  }

  const raw = attendanceRows_('BuoiDiemDanh')
    .find(x => String(x.ID) === sessionId);

  if (!raw) {
    throw Error('Không tìm thấy buổi điểm danh');
  }

  const session = attendanceSession_(raw);

  if(attendanceStatus_(session,Date.now())!=='open')throw Error('Buổi điểm danh chưa mở hoặc đã đóng');

  if (
    attendanceRows_('DanhSachDiemDanh').some(
      x =>
        String(x.BUOI_ID) === sessionId &&
        String(x.MSSV).toUpperCase() ===
        mssv.toUpperCase()
    )
  ) {
    throw Error('MSSV đã điểm danh buổi này');
  }

  store_()
    .getSheetByName('DanhSachDiemDanh')
    .appendRow([
      b.op,
      sessionId,
      name,
      mssv,
      new Date()
    ]);

  return 'Điểm danh thành công';
}

// ============================================================
// ĐIỂM DANH ẢNH XÁC THỰC — V21.2
// Dữ liệu ảnh nằm trong Drive riêng tư; Sheet chỉ lưu metadata.
// Không sửa/xóa hai Sheet điểm danh cũ.
// ============================================================
const ATT_PHOTO_SHEET_ = 'DiemDanhAnh';
const ATT_CODE_SHEET_ = 'MaDiemDanh';
const ATT_PHOTO_HEADERS_ = [
  'ID','BUOI_ID','HO_TEN','MSSV','FILE_ID','MIME_TYPE','SIZE_BYTES',
  'SUBMITTED_AT','STATUS','REVIEWED_AT','REVIEWED_BY','REJECTION_REASON',
  'CLIENT_FILE_NAME','UPDATED_AT'
];
const ATT_CODE_HEADERS_ = ['BUOI_ID','MA_XAC_THUC','UPDATED_AT'];

function ensureAttendancePhotoSheets_() {
  const ss = store_();
  [[ATT_PHOTO_SHEET_,ATT_PHOTO_HEADERS_],[ATT_CODE_SHEET_,ATT_CODE_HEADERS_]].forEach(([name,headers]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1,1,1,headers.length).setValues([headers])
        .setFontWeight('bold').setBackground('#24476d').setFontColor('white');
      sh.setFrozenRows(1);
      return;
    }
    const actual = sh.getRange(1,1,1,Math.max(sh.getLastColumn(),headers.length)).getDisplayValues()[0];
    if (headers.some((h,i) => String(actual[i]||'') !== h)) {
      throw Error('Sheet '+name+' có cấu trúc không tương thích. Dừng để bảo toàn dữ liệu.');
    }
  });
}

function attendancePhotoFolder_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('ATTENDANCE_PHOTO_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { props.deleteProperty('ATTENDANCE_PHOTO_FOLDER_ID'); }
  }
  const folder = DriveApp.createFolder('2505QLNH_DiemDanhAnh_RiengTu');
  props.setProperty('ATTENDANCE_PHOTO_FOLDER_ID', folder.getId());
  return folder;
}

// Chạy thủ công MỘT LẦN để tạo hai Sheet mới và cấp quyền Drive cho Apps Script.
// Hàm chỉ tạo tài nguyên còn thiếu, không sửa dữ liệu điểm danh cũ.
function installAttendancePhotoModule() {
  ensureAttendancePhotoSheets_();
  const folder = attendancePhotoFolder_();
  return 'Đã chuẩn bị lưu trữ ảnh điểm danh riêng tư: '+folder.getName();
}

function attendanceCodeUpsert_(sessionId, code) {
  ensureAttendancePhotoSheets_();
  const sh = store_().getSheetByName(ATT_CODE_SHEET_);
  const sid = safe_(sessionId,100);
  const value = safe_(code,40).trim();
  const rows = rows_(ATT_CODE_SHEET_);
  const i = rows.findIndex(r => String(r.BUOI_ID) === sid);
  if (!value) {
    if (i >= 0) sh.deleteRow(i+2);
    return;
  }
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(value)) throw Error('Mã xác thực phải có 3–40 ký tự chữ, số, _ hoặc -.');
  const row = [sid,value,new Date()];
  if (i >= 0) sh.getRange(i+2,1,1,row.length).setValues([row]); else sh.appendRow(row);
}

function attendanceCodesMap_() {
  try {
    ensureAttendancePhotoSheets_();
    const out = {};
    rows_(ATT_CODE_SHEET_).forEach(r => { if (r.BUOI_ID) out[String(r.BUOI_ID)] = String(r.MA_XAC_THUC||''); });
    return out;
  } catch (e) { return {}; }
}

function attendancePhotoRows_() {
  ensureAttendancePhotoSheets_();
  return rows_(ATT_PHOTO_SHEET_);
}

function attendancePhotoAdminRows_() {
  return attendancePhotoRows_().map(r => ({
    id:String(r.ID||''), sessionId:String(r.BUOI_ID||''), name:String(r.HO_TEN||''),
    studentId:String(r.MSSV||''), mimeType:String(r.MIME_TYPE||''), sizeBytes:Number(r.SIZE_BYTES)||0,
    submittedAt:r.SUBMITTED_AT||'', status:String(r.STATUS||'pending'), reviewedAt:r.REVIEWED_AT||'',
    reviewedBy:String(r.REVIEWED_BY||''), rejectionReason:String(r.REJECTION_REASON||''),
    fileAvailable:!!r.FILE_ID
  }));
}

const ATT_RETRY_SHEET_='DiemDanhGuiLaiV22';
const ATT_RETRY_HEADER_=['ID','BUOI_ID','MSSV','REJECTED_ID','EXPIRES_AT','STATUS','ACTOR','UPDATED_AT'];
function attendanceRetrySheet_(create){const ss=store_();let sh=ss.getSheetByName(ATT_RETRY_SHEET_);if(!sh&&create){sh=ss.insertSheet(ATT_RETRY_SHEET_);sh.getRange(1,1,1,ATT_RETRY_HEADER_.length).setValues([ATT_RETRY_HEADER_]);sh.setFrozenRows(1);}if(sh){const actual=sh.getRange(1,1,1,ATT_RETRY_HEADER_.length).getDisplayValues()[0];if(ATT_RETRY_HEADER_.some((h,i)=>actual[i]!==h))throw Error('Cấu trúc bảng cấp quyền gửi lại không hợp lệ');}return sh;}
function attendanceRetryRows_(){return attendanceRetrySheet_(false)?rows_(ATT_RETRY_SHEET_):[];}
function attendanceLatestAttempt_(rows){return rows.length?rows[rows.length-1]:null;}
function attendanceRetryValid_(matches,grant,now){const latest=attendanceLatestAttempt_(matches);return !!latest&&String(latest.STATUS)==='rejected'&&!matches.some(r=>['approved','pending'].includes(String(r.STATUS)))&&!!grant&&grant.STATUS==='ACTIVE'&&String(grant.REJECTED_ID)===String(latest.ID)&&attendanceParseTime_(grant.EXPIRES_AT)>now;}
function attendanceRetryFor_(rows,sessionId,mssv){return rows.filter(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv).slice(-1)[0]||null;}
function attendanceMine_(mssv) {
 const id=safe_(mssv,40).toUpperCase();if(!/^[0-9A-Z]{4,30}$/.test(id))throw Error('Tài khoản sinh viên không hợp lệ');
 const photos=attendancePhotoRows_().filter(r=>String(r.MSSV||'').toUpperCase()===id),grants=attendanceRetryRows_().filter(r=>String(r.MSSV).toUpperCase()===id),sessions=attendanceRows_('BuoiDiemDanh');
 const items=photos.map(r=>{const sid=String(r.BUOI_ID),matches=photos.filter(p=>String(p.BUOI_ID)===sid),g=attendanceRetryFor_(grants,sid,id),session=sessions.find(v=>String(v.ID)===sid),valid=!!session&&attendanceSession_(session).public&&attendanceRetryValid_(matches,g,Date.now())&&String(r.ID)===String(g.REJECTED_ID);return {id:String(r.ID||''),sessionId:sid,submittedAt:r.SUBMITTED_AT||'',status:String(r.STATUS||'pending'),rejectionReason:String(r.REJECTION_REASON||''),reviewedAt:r.REVIEWED_AT||'',retryUntil:valid?attendanceCanonical_(g.EXPIRES_AT):'',archived:session?.TRANG_THAI==='ARCHIVED',sessionTitle:String(session?.TEN_BUOI||'Buổi '+sid)};});
 return {success:true,items};
}
/** Grant binds to one rejected photo, so submitting a new attempt consumes it without a cross-sheet transaction. */
function adminAttendanceGrantRetry(token,recordId,expiry){
 const user=auth_(token),until=attendanceParseTime_(expiry);if(!Number.isFinite(until)||until<=Date.now())throw Error('Hạn gửi lại phải nằm trong tương lai');
 return attendanceWithLock_(()=>{
 const all=attendancePhotoRows_(),record=all.find(r=>String(r.ID)===String(recordId));if(!record)throw Error('Không tìm thấy lượt ảnh');
 const sessionId=String(record.BUOI_ID),mssv=String(record.MSSV).toUpperCase(),matches=all.filter(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv);
 const session=attendanceRows_('BuoiDiemDanh').find(r=>String(r.ID)===sessionId);
 if(!session||!attendanceSession_(session).public)throw Error('Buổi đang ẩn hoặc lưu trữ; cần công khai nhưng không cần mở cổng');
 if(String(attendanceLatestAttempt_(matches)?.ID)!==String(record.ID)||record.STATUS!=='rejected'||matches.some(r=>['pending','approved'].includes(String(r.STATUS))))throw Error('Chỉ cấp quyền cho lượt từ chối mới nhất');
 if(attendanceRows_('DanhSachDiemDanh').some(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv))throw Error('Đã có kết quả chính thức');
 const grant=Utilities.getUuid();attendanceRetrySheet_(true).appendRow([grant,sessionId,mssv,String(record.ID),new Date(until),'ACTIVE',user,new Date()]);SpreadsheetApp.flush();
 try{audit_(user,'ATTENDANCE_RETRY_GRANT',sessionId+' '+mssv);}catch(e){}try{attNotifyQueue_(mssv,sessionId,'retry',grant,until);}catch(e){console.warn('Không ghi được thông báo cá nhân');}return {success:true,expiresAt:new Date(until).toISOString()};
 });
}
function adminAttendanceRevokeRetry(token,recordId){const user=auth_(token);return attendanceWithLock_(()=>{
 const record=attendancePhotoRows_().find(r=>String(r.ID)===String(recordId));if(!record)throw Error('Không tìm thấy lượt ảnh');
 const sh=attendanceRetrySheet_(false);if(!sh)return {success:true};const values=sh.getDataRange().getValues();let index=-1;
 for(let i=1;i<values.length;i++)if(String(values[i][1])===String(record.BUOI_ID)&&String(values[i][2]).toUpperCase()===String(record.MSSV).toUpperCase())index=i;
 if(index>0&&String(values[index][3])!==String(recordId))throw Error('Không thể thu hồi quyền của lượt khác');
 if(index>0){sh.getRange(index+1,6,1,3).setValues([['REVOKED',user,new Date()]]);SpreadsheetApp.flush();try{audit_(user,'ATTENDANCE_RETRY_REVOKE',String(recordId));}catch(e){}}
 return {success:true};});}

function attendancePhotoInput_(b,op){
  const sessionId = safe_(b.sessionId,100);
  const mssv = safe_(b.mssv,40).toUpperCase();
  const name = safe_(b.name,150);
  const mime = String(b.mimeType||'').toLowerCase();
  const encoded = String(b.imageBase64||'').replace(/^data:[^,]+,/, '');
  if (!/^[0-9A-Z]{4,30}$/.test(mssv) || name.length<2) throw Error('Thông tin tài khoản không hợp lệ');
  if (!['image/jpeg','image/png','image/webp'].includes(mime)) throw Error('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP');
  if (!encoded || encoded.length > 7*1024*1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw Error('Ảnh không hợp lệ hoặc vượt quá dung lượng cho phép');
  const bytes = Utilities.base64Decode(encoded);
  if (!bytes.length || bytes.length > 5*1024*1024) throw Error('Ảnh tối đa 5 MB');
  const unsigned=bytes.slice(0,12).map(x=>x&255);
  const isJpeg=bytes.length>=3&&unsigned[0]===0xFF&&unsigned[1]===0xD8&&unsigned[2]===0xFF;
  const isPng=bytes.length>=8&&unsigned[0]===0x89&&unsigned[1]===0x50&&unsigned[2]===0x4E&&unsigned[3]===0x47&&unsigned[4]===0x0D&&unsigned[5]===0x0A&&unsigned[6]===0x1A&&unsigned[7]===0x0A;
  const isWebp=bytes.length>=12&&String.fromCharCode.apply(null,bytes.slice(0,4))==='RIFF'&&String.fromCharCode.apply(null,bytes.slice(8,12))==='WEBP';
  if (!(mime==='image/jpeg'&&isJpeg)&&!(mime==='image/png'&&isPng)&&!(mime==='image/webp'&&isWebp)) throw Error('Nội dung tệp không khớp định dạng ảnh đã khai báo');
  const supplied=safe_(b.verificationCode||'',40).trim(),clientName=safe_(b.fileName||'',180);
  if(!/^[A-Za-z0-9_-]{2,100}$/.test(sessionId))throw Error('Buổi điểm danh không hợp lệ');
  return {sessionId,mssv,name,mime,bytes,supplied,clientName,id:'ATT_'+op};
}
function attendancePhotoCheck_(a){
 const {sessionId,mssv,supplied,id}=a;
  const matching = attendancePhotoRows_().filter(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv);
  if(matching.some(r=>String(r.ID)===id))return 'already';
  const raw = attendanceRows_('BuoiDiemDanh').find(x => String(x.ID)===sessionId);
  if (!raw) throw Error('Không tìm thấy buổi điểm danh');
  const session = attendanceSession_(raw), now = Date.now();
  if(attendanceStatus_(session,now)!=='open'){const grant=attendanceRetryFor_(attendanceRetryRows_(),sessionId,mssv);if(!session.public||!attendanceRetryValid_(matching,grant,now))throw Error('Buổi điểm danh chưa mở hoặc đã đóng; chưa có quyền gửi lại hợp lệ');}
  const codeRows=rows_(ATT_CODE_SHEET_).filter(r=>String(r.BUOI_ID)===sessionId);
  if(codeRows.length>1)throw Error('Cấu hình mã xác thực bị trùng; liên hệ Admin');
  const expected=String(codeRows[0]?.MA_XAC_THUC||'');
  if (expected && supplied.toUpperCase() !== expected.toUpperCase()) throw Error('Mã xác thực của buổi điểm danh không chính xác');
  if (attendanceRows_('DanhSachDiemDanh').some(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv)) throw Error('Bạn đã có bản ghi điểm danh của buổi này. Nếu cần bổ sung ảnh, hãy liên hệ Admin.');
  if(matching.some(r=>String(r.STATUS)==='approved'))throw Error('Bạn đã được xác nhận điểm danh buổi này');
  if(matching.some(r=>String(r.STATUS)==='pending'))throw Error('Bạn đã có ảnh chờ duyệt. Hãy kiểm tra kết quả trước khi gửi lại.');
  if(matching.some(r=>String(r.STATUS)!=='rejected'))throw Error('Trạng thái lượt gửi không hợp lệ, liên hệ Admin');
 return 'new';
}
function attendanceWithLock_(fn){const lock=LockService.getScriptLock();lock.waitLock(20000);try{return fn();}finally{lock.releaseLock();}}
/** V22.0.1: Drive upload outside global lock; recheck every condition under lock before committing. */
function attendancePhotoCommit_(b,op){
 const a=attendancePhotoInput_(b,op),message='Đã gửi ảnh xác thực. Điểm danh đang chờ Admin duyệt.';
 const first=attendanceWithLock_(()=>{
  ensureAttendancePhotoSheets_();
  if(attendancePhotoCheck_(a)==='already')return {already:true};
  return {folder:attendancePhotoFolder_()};
 });
 if(first.already)return {success:true,message:'Lượt gửi này đã được ghi nhận. Hãy kiểm tra trạng thái.'};
 const ext=a.mime==='image/png'?'png':a.mime==='image/webp'?'webp':'jpg';
 const file=first.folder.createFile(Utilities.newBlob(a.bytes,a.mime,'attendance_'+a.sessionId+'_'+a.mssv+'_'+a.id+'_'+Utilities.getUuid()+'.'+ext));
 let attempted=false,committed=false,already=false;
 try{
  attendanceWithLock_(()=>{
   if(attendancePhotoCheck_(a)==='already'){already=true;return;}
   const now=new Date(),sh=store_().getSheetByName(ATT_PHOTO_SHEET_);
   attempted=true;sh.appendRow([a.id,a.sessionId,a.name,a.mssv,file.getId(),a.mime,a.bytes.length,now,'pending','','','',a.clientName,now]);
   SpreadsheetApp.flush();committed=true;
   // Receipt is secondary to the durable attempt row, which also acts as the idempotency record.
   try{store_().getSheetByName(S.RECEIPTS).appendRow([op,'attendancePhoto',true,message,now]);SpreadsheetApp.flush();}catch(e){console.warn('ATTENDANCE_RECEIPT: '+String(e.message||e));}
  });
 }finally{
  // Only delete an upload which was definitely never referenced. On ambiguous commit retain for manual reconciliation.
  if(!attempted)try{file.setTrashed(true);}catch(e){console.warn('ATTENDANCE_UNUSED_UPLOAD: '+String(e.message||e));}
 }
 if(!committed&&!already)throw Error('Chưa xác minh được kết quả gửi. Kiểm tra trạng thái trước khi gửi lại.');
 return {success:true,message:already?'Lượt gửi này đã được ghi nhận. Hãy kiểm tra trạng thái.':message};
}

function adminAttendanceImage(token, recordId) {
  auth_(token);
  const id = safe_(recordId,100);
  const row = attendancePhotoRows_().find(r => String(r.ID)===id);
  if (!row || !row.FILE_ID) throw Error('Không tìm thấy ảnh xác thực');
  const blob = DriveApp.getFileById(String(row.FILE_ID)).getBlob();
  const mime = blob.getContentType();
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) throw Error('Tệp lưu trữ không phải ảnh hợp lệ');
  return {success:true,dataUrl:'data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes())};
}

function adminReviewAttendance(token, recordId, decision, reason) {
  const user = auth_(token);
  ensureAttendancePhotoSheets_();
  const id = safe_(recordId,100), action = String(decision||'');
  if (!['approved','rejected'].includes(action)) throw Error('Trạng thái duyệt không hợp lệ');
  const why = action==='rejected'?safe_(reason||'',500).trim():'';
  if (action==='rejected'&&!why) throw Error('Vui lòng nhập lý do từ chối');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = store_().getSheetByName(ATT_PHOTO_SHEET_);
    const values = sh.getDataRange().getValues();
    const i = values.findIndex((r,n)=>n>0&&String(r[0])===id);
    if (i<1) throw Error('Không tìm thấy bản ghi điểm danh');
    const currentStatus = String(values[i][8]||'');
    if (currentStatus!=='pending') throw Error('Chỉ được xử lý lượt ảnh đang chờ duyệt. Hãy làm mới danh sách.');
    const reviewer = String(user).slice(0,100);
    const sessionId=String(values[i][1]||''), name=String(values[i][2]||''), mssv=String(values[i][3]||'');
    if (action==='approved') {
      installAttendanceModule();
      const oldSheet=store_().getSheetByName('DanhSachDiemDanh');
      const already=attendanceRows_('DanhSachDiemDanh').some(r=>String(r.BUOI_ID)===sessionId&&String(r.MSSV).toUpperCase()===mssv.toUpperCase());
      if (!already) oldSheet.appendRow(['ATT_PHOTO_'+id,sessionId,name,mssv,new Date()]);
    }
    sh.getRange(i+1,9,1,4).setValues([[action,new Date(),reviewer,why]]);
    SpreadsheetApp.flush();
    let warning='';try{attNotifyQueue_(mssv,sessionId,action,id,0);}catch(e){warning='Đã lưu kết quả, chưa xác nhận ghi thông báo cá nhân.';}try{audit_(user,'ATTENDANCE_PHOTO_'+action.toUpperCase(),id);}catch(e){warning='Đã lưu kết quả nhưng chưa xác nhận nhật ký.';}
    return {success:true,warning,message:action==='approved'?'Đã xác nhận điểm danh và cập nhật sổ điểm danh chính thức.':'Đã từ chối ảnh xác thực.'};
  } finally { lock.releaseLock(); }
}

// ==========================================
// ADMIN LƯU BUỔI ĐIỂM DANH
// ==========================================

function adminSaveAttendanceSession(token, record) {
  const user = auth_(token);

  installAttendanceModule();

  const sh = store_()
    .getSheetByName('BuoiDiemDanh');

  const headers = [
    'ID',
    'TEN_BUOI',
    'LOAI',
    'HOAT_DONG_ID',
    'BAT_DAU',
    'KET_THUC',
    'DIA_DIEM',
    'CONG_KHAI',
    'DANG_MO',
    'GHI_CHU'
  ];

  const id = safe_(record.ID, 100);
  const attendanceCode = safe_(record.MA_XAC_THUC || '',40).trim();
  if (attendanceCode && !/^[A-Za-z0-9_-]{3,40}$/.test(attendanceCode)) throw Error('Mã xác thực phải có 3–40 ký tự chữ, số, _ hoặc -.');

  if (!/^[A-Za-z0-9_-]{2,100}$/.test(id)) {
    throw Error('ID không hợp lệ');
  }

  if (
    !['DaiHoi', 'HoatDong'].includes(record.LOAI)
  ) {
    throw Error('Loại điểm danh không hợp lệ');
  }

  const start=attendanceParseTime_(record.BAT_DAU),endText=String(record.KET_THUC||'').trim(),end=attendanceParseTime_(endText);
  if(!Number.isFinite(start))throw Error('Hãy chọn thời gian bắt đầu hợp lệ');
  if(endText&&(!Number.isFinite(end)||end<start))throw Error('Thời gian kết thúc phải từ thời gian bắt đầu trở đi');
  record={...record,BAT_DAU:Utilities.formatDate(new Date(start),'Asia/Ho_Chi_Minh',"yyyy-MM-dd'T'HH:mm:ssXXX"),KET_THUC:endText?Utilities.formatDate(new Date(end),'Asia/Ho_Chi_Minh',"yyyy-MM-dd'T'HH:mm:ssXXX"):''};
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
  const row = headers.map(k =>
    ['CONG_KHAI', 'DANG_MO'].includes(k)
      ? yes_(record[k])
      : safe_(record[k], 3000)
  );

  const data = sh.getDataRange().getValues();

  const i = data.findIndex(
    (r, n) => n > 0 && String(r[0]) === id
  );

  if(i>0&&data[0][10]==='TRANG_THAI'&&String(data[i][10])==='ARCHIVED')throw Error('Hãy khôi phục buổi lưu trữ trước khi sửa');
  const previous=i>0?{enabled:yes_(data[i][8]),shown:yes_(data[i][7])}:null;
  const rowNumber=i>0?i+1:sh.getLastRow()+1;
  if(rowNumber>sh.getMaxRows())sh.insertRowsAfter(sh.getMaxRows(),1);
  // Only the edited time cells become explicit text; no global sheet migration.
  sh.getRange(rowNumber,5,1,2).setNumberFormat('@');
  sh.getRange(rowNumber,1,1,row.length).setValues([row]);
  attendanceCodeUpsert_(id, attendanceCode);
  if(typeof attendanceCancelObsoleteSchedules_==='function')attendanceCancelObsoleteSchedules_(id,!endText,!!(previous&&((previous.enabled&&!yes_(record.DANG_MO))||(previous.shown&&!yes_(record.CONG_KHAI)))));

  audit_(user, 'ATTENDANCE_SAVE', id);
  return true;
  }finally{lock.releaseLock();}
}

// ==========================================
// ADMIN XÓA BUỔI ĐIỂM DANH
// ==========================================


/** V21.5: close one attendance session, preserving all other cells and records. */
function adminCloseAttendanceSession(token,id){
  const user=auth_(token);id=String(id||'').trim();
  if(!/^[A-Za-z0-9_-]{2,100}$/.test(id))throw Error('ID buổi điểm danh không hợp lệ');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const sh=store_().getSheetByName('BuoiDiemDanh');
    if(!sh)throw Error('Không tìm thấy bảng buổi điểm danh');
    const rows=sh.getDataRange().getValues(),head=rows[0]||[];
    if(head[0]!=='ID'||head[8]!=='DANG_MO')throw Error('Cấu trúc BuoiDiemDanh không hợp lệ; không ghi dữ liệu');
    const matches=[];for(let i=1;i<rows.length;i++)if(String(rows[i][0])===id)matches.push(i);
    if(matches.length!==1)throw Error(matches.length?'Mã buổi bị trùng; không ghi dữ liệu':'Không tìm thấy buổi điểm danh');
    const i=matches[0],wasEnabled=yes_(rows[i][8]);
    if(wasEnabled){sh.getRange(i+1,9).setValue(false);SpreadsheetApp.flush();}
    // Retrying a close also retries cancellation, without reopening or changing times.
    const warnings=[];
    try{
      if(typeof attendanceCancelObsoleteSchedules_!=='function')throw Error('Thiếu module lịch thông báo V21.3');
      attendanceCancelObsoleteSchedules_(id,true,true);
      SpreadsheetApp.flush();
    }catch(e){warnings.push('Cổng đã đóng nhưng chưa xác nhận hủy hết lịch thông báo. Kiểm tra mục Thông báo.');console.warn('ATTENDANCE_CLOSE schedule: '+String(e.message||e));}
    if(wasEnabled){try{audit_(user,'ATTENDANCE_CLOSE',id);SpreadsheetApp.flush();}catch(e){warnings.push('Chưa xác nhận ghi nhật ký quản trị.');}}
    return {success:true,id,enabled:false,alreadyClosed:!wasEnabled,warning:warnings.join(' ')};
  }finally{lock.releaseLock();}
}

function adminDeleteAttendanceSession(token, id) {
  const user = auth_(token);
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{

  const sh = store_()
    .getSheetByName('BuoiDiemDanh');

  const data = sh.getDataRange().getValues();

  const i = data.findIndex(
    (r, n) =>
      n > 0 &&
      String(r[0]) === String(id)
  );

  if (i < 1) {
    throw Error('Không tìm thấy buổi');
  }

  if (
    attendanceRows_('DanhSachDiemDanh')
      .some(x => String(x.BUOI_ID) === String(id)) || attendancePhotoRows_().some(x=>String(x.BUOI_ID)===String(id))
  ) {
    throw Error(
      'Buổi đã có người điểm danh. ' +
      'Hãy đóng/ẩn buổi để bảo toàn dữ liệu'
    );
  }

  sh.deleteRow(i + 1);
  if(typeof attendanceCancelObsoleteSchedules_==='function')attendanceCancelObsoleteSchedules_(String(id),true,true);

  audit_(
    user,
    'ATTENDANCE_DELETE',
    id
  );

  return true;
  }finally{lock.releaseLock();}
}



// ============================================================
// MODULE CHUỖI HOẠT ĐỘNG + LƯU TRỮ (2505QLNH v2)
// Chạy installActivitySeriesModule() MỘT LẦN sau khi sao lưu.
// Idempotent: lần sau chỉ kiểm tra lại, không xóa dữ liệu.
// ============================================================
function installActivitySeriesModule() {
  const ss = store_();
  const sheet = ss.getSheetByName(S.ACT);
  if (!sheet) throw Error('Thiếu sheet HoatDong');
  const legacy = HEAD[S.ACT].slice(0, 11);
  const existing = sheet.getRange(1, 1, 1, Math.max(11, sheet.getLastColumn()))
    .getDisplayValues()[0];
  legacy.forEach((h, i) => {
    if (existing[i] !== h) {
      throw Error('Cấu trúc HoatDong khác bản đã lưu, dừng tại cột ' + (i+1));
    }
  });
  // Chỉ nối cột đã biết đúng thứ tự; không đè cột tùy chỉnh của người dùng.
  const present = existing.slice(11).filter(Boolean);
  const extra = HEAD[S.ACT].slice(11);
  if (present.some((h,i) => h !== extra[i])) {
    throw Error('HoatDong có cột mở rộng không đúng thứ tự; hãy sao lưu và kiểm tra thủ công');
  }
  extra.slice(present.length).forEach(h => {
    const col = sheet.getLastColumn()+1;
    sheet.getRange(1,col).setValue(h).setFontWeight('bold');
  });
  let series = ss.getSheetByName(S.SERIES);
  if (!series) {
    series = ss.insertSheet(S.SERIES);
    series.getRange(1,1,1,HEAD[S.SERIES].length)
      .setValues([HEAD[S.SERIES]])
      .setBackground('#15477f').setFontWeight('bold').setFontColor('#ffffff');
    series.setFrozenRows(1);
  } else {
    const cur = series.getRange(1,1,1,HEAD[S.SERIES].length).getDisplayValues()[0];
    if (JSON.stringify(cur) !== JSON.stringify(HEAD[S.SERIES])) {
      throw Error('Sheet ChuoiHoatDong có cột khác mẫu, không tự ý sửa');
    }
  }
  return 'Đã kiểm tra/nâng cấp module chuỗi hoạt động; dữ liệu cũ được giữ nguyên.';
}
function activitySeriesRows_() {
  return store_().getSheetByName(S.SERIES) ? rows_(S.SERIES) : [];
}
function isArchived_(r) {
  return String(r.TRANG_THAI || 'ACTIVE') === 'ARCHIVED';
}
function activityValidateTimes_(open, close) {
  const a=Date.parse(String(open || ''));
  if (!Number.isFinite(a)) throw Error('Vui lòng nhập thời gian MỞ đăng ký hợp lệ');
  // V16.1: giờ đóng tùy chọn. Nếu để trống thì đăng ký mở cho đến khi Admin đóng/ẩn/lưu trữ hoặc hết suất.
  if (!String(close || '').trim()) return;
  const b=Date.parse(String(close));
  if (!Number.isFinite(b) || b<=a) throw Error('Nếu đặt giờ ĐÓNG, thời gian phải hợp lệ và sau giờ MỞ đăng ký');
}
function activityValidateLimit_(limit, unlimited) {
  if (!yes_(unlimited) && (!/^[0-9]+$/.test(String(limit)) ||
      Number(limit) < 1 || Number(limit) > 100000)) {
    throw Error('Phải nhập số lượng tối đa từ 1 đến 100000 hoặc chọn không giới hạn');
  }
}
function activityRecordId_(prefix) {
  return prefix + Utilities.getUuid().replace(/-/g,'').slice(0,24);
}
function activitySheetRow_(name, record) {
  const headers = HEAD[name];
  return headers.map(h => {
    const value = record[h];
    return typeof value === 'boolean' ? value : safe_(value, 3000);
  });
}
function activityUpsert_(sheetName, record) {
  const sheet = store_().getSheetByName(sheetName);
  const grid = sheet.getDataRange().getValues();
  const idx = grid.findIndex((row,i)=>i>0 && String(row[0])===String(record.ID));
  const row = activitySheetRow_(sheetName, record);
  if (idx > 0) sheet.getRange(idx+1,1,1,row.length).setValues([row]);
  else sheet.appendRow(row);
}
function activityWriteLock_(fn) {
  const lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try {return fn();} finally {lock.releaseLock();}
}

/** Tạo/sửa toàn bộ chuỗi, không xóa các hoạt động con đã tồn tại. */
function adminSaveSeries(token, payload) {
  const user=auth_(token);
  installActivitySeriesModule();
  return activityWriteLock_(() => {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.children)) {
      throw Error('Biểu mẫu chuỗi hoạt động không hợp lệ');
    }
    const id=payload.ID ? safe_(payload.ID,100) : activityRecordId_('SER_');
    if (!/^[A-Za-z0-9_-]{2,100}$/.test(id)) throw Error('Mã chuỗi không hợp lệ');
    const parents=activitySeriesRows_();
    const old=parents.find(r=>String(r.ID)===id);
    const title=safe_(payload.TEN_CHUOI,250);
    const desc=safe_(payload.MO_TA,3000);
    const opens=safe_(payload.MO_DANG_KY,80);
    const closes=safe_(payload.DONG_DANG_KY,80);
    if (!title) throw Error('Chưa nhập tên chuỗi');
    activityValidateTimes_(opens,closes);
    if (!payload.children.length || payload.children.length>60) {
      throw Error('Chuỗi cần từ 1 đến 60 hoạt động');
    }
    const prior=rows_(S.ACT);
    const used=new Set();
    const children=payload.children.map((input,index)=>{
      if (!input || typeof input !== 'object') throw Error('Hoạt động con không hợp lệ');
      const childId=input.ID ? safe_(input.ID,100) : activityRecordId_('ACT_');
      if (!/^[A-Za-z0-9_-]{2,100}$/.test(childId) || used.has(childId)) {
        throw Error('Trùng ID hoạt động con');
      }
      used.add(childId);
      const oldChild=prior.find(r=>String(r.ID)===childId);
      if (oldChild && String(oldChild.CHUOI_ID || '') !== id) {
        throw Error('Hoạt động con không thuộc chuỗi này');
      }
      const childTitle=safe_(input.TEN_HOAT_DONG,250);
      const ends=safe_(input.DONG_DANG_KY,80);
      if (!childTitle) throw Error('Chưa nhập tên hoạt động số ' + (index+1));
      if (ends && (!Number.isFinite(Date.parse(ends)) || Date.parse(ends)<=Date.parse(opens))) {
        throw Error('Hạn đăng ký hoạt động "'+childTitle+'" phải sau thời gian mở chuỗi');
      }
      activityValidateLimit_(input.GIOI_HAN, input.KHONG_GIOI_HAN);
      return {
        ID:childId,
        TEN_HOAT_DONG:childTitle,
        MO_TA:safe_(input.MO_TA,3000),
        MO_DANG_KY:opens,
        DONG_DANG_KY:ends,
        THOI_GIAN_DIEN_RA:safe_(input.THOI_GIAN_DIEN_RA,500),
        DIA_DIEM:safe_(input.DIA_DIEM,500),
        LUU_Y:safe_(input.LUU_Y,1000),
        GIOI_HAN:yes_(input.KHONG_GIOI_HAN) ? '' : String(Number(input.GIOI_HAN)),
        KHONG_GIOI_HAN:yes_(input.KHONG_GIOI_HAN),
        HIEN_THI:yes_(input.HIEN_THI),
        CHUOI_ID:id,
        TRANG_THAI:oldChild ? String(oldChild.TRANG_THAI || 'ACTIVE') : 'ACTIVE',
        LUU_TRU_LUC:oldChild ? String(oldChild.LUU_TRU_LUC || '') : ''
      };
    });
    const parent={
      ID:id, TEN_CHUOI:title, MO_TA:desc,
      MO_DANG_KY:opens, DONG_DANG_KY:closes,
      HIEN_THI:yes_(payload.HIEN_THI),
      TRANG_THAI:old ? String(old.TRANG_THAI||'ACTIVE') : 'ACTIVE',
      LUU_TRU_LUC:old ? String(old.LUU_TRU_LUC||'') : ''
    };
    activityUpsert_(S.SERIES,parent);
    children.forEach(child=>activityUpsert_(S.ACT,child));
    audit_(user,'SAVE_SERIES',id+' '+children.length+' hoạt động');
    return {success:true,id,children:children.length};
  });
}

/** Xong/khôi phục hoạt động riêng hoặc một hoạt động con. */
function adminArchiveActivity(token,id, archive) {
  const user=auth_(token);
  installActivitySeriesModule();
  return activityWriteLock_(()=>{
    id=safe_(id,100);
    const sh=store_().getSheetByName(S.ACT);
    const grid=sh.getDataRange().getValues();
    const rowIndex=grid.findIndex((r,i)=>i>0 && String(r[0])===id);
    if (rowIndex < 1) throw Error('Không tìm thấy hoạt động');
    const headers=grid[0];
    const ix=(h)=>headers.indexOf(h);
    const parentId=String(grid[rowIndex][ix('CHUOI_ID')] || '');
    if (!yes_(archive) && parentId) {
      const parent=activitySeriesRows_().find(x=>String(x.ID)===parentId);
      if (!parent || isArchived_(parent)) {
        throw Error('Cần khôi phục chuỗi trước khi khôi phục hoạt động con');
      }
    }
    sh.getRange(rowIndex+1,ix('TRANG_THAI')+1).setValue(yes_(archive)?'ARCHIVED':'ACTIVE');
    sh.getRange(rowIndex+1,ix('LUU_TRU_LUC')+1).setValue(yes_(archive)?new Date().toISOString():'');
    audit_(user,yes_(archive)?'ARCHIVE_ACTIVITY':'RESTORE_ACTIVITY',id);
    return true;
  });
}

/** Lưu trữ cả chuỗi: không sửa/xóa trạng thái các hoạt động con. */
function adminArchiveSeries(token,id,archive) {
  const user=auth_(token);
  installActivitySeriesModule();
  return activityWriteLock_(()=>{
    id=safe_(id,100);
    const sh=store_().getSheetByName(S.SERIES);
    const grid=sh.getDataRange().getValues();
    const idx=grid.findIndex((r,i)=>i>0 && String(r[0])===id);
    if (idx<1) throw Error('Không tìm thấy chuỗi hoạt động');
    sh.getRange(idx+1,7).setValue(yes_(archive)?'ARCHIVED':'ACTIVE');
    sh.getRange(idx+1,8).setValue(yes_(archive)?new Date().toISOString():'');
    audit_(user,yes_(archive)?'ARCHIVE_SERIES':'RESTORE_SERIES',id);
    return true;
  });
}


// ADMIN V3: chỉ đọc nhật ký với phiên quản trị hợp lệ.
function adminRecentAudit(token, limit) {
  auth_(token);
  const n=Math.min(200,Math.max(1,Number(limit)||100));
  return rows_(S.LOG).slice(-n).reverse();
}

// V4: lưu đề án cũ thay vì xóa vĩnh viễn và làm mất dữ liệu kiểm phiếu.
function candidateArchiveSheet_() {
  const ss=store_();
  let sh=ss.getSheetByName('LuuTruDeAn');
  if(!sh){
    sh=ss.insertSheet('LuuTruDeAn');
    sh.appendRow(['LUU_TRU_LUC','DOT_BAU_CU','ID','PHAN_HE','HO_TEN','QUE_QUAN','DAN_TOC','TON_GIAO','CHUC_VU','HIEN_THI']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function archivedCandidates_(){
  const sh=store_().getSheetByName('LuuTruDeAn');
  if(!sh||sh.getLastRow()<2)return [];
  return rows_('LuuTruDeAn');
}
function adminDeleteAllCandidates(token,confirmation){
  const user=auth_(token);
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const ss=store_(),sh=ss.getSheetByName(S.CAND);
    const records=rows_(S.CAND);
    if(!records.length)return {success:true,archived:0,deleted:0};
    const cfg=cfg_(),history=candidateArchiveSheet_(),now=new Date();
    const archiveRows=records.map(r=>[now,String(cfg[(r.PHAN_HE==='ChiHoi'?'ch':'cd')+'_dotBauCu']||''),
      String(r.ID||''),String(r.PHAN_HE||''),String(r.HO_TEN||''),String(r.QUE_QUAN||''),
      String(r.DAN_TOC||''),String(r.TON_GIAO||''),String(r.CHUC_VU||''),r.HIEN_THI]);
    history.getRange(history.getLastRow()+1,1,archiveRows.length,10).setValues(archiveRows);
    SpreadsheetApp.flush();
    const csh=ss.getSheetByName(S.CONFIG),cv=csh.getDataRange().getValues();
    cv.forEach((r,i)=>{if(i>0&&['cd_moBauCu','ch_moBauCu'].includes(String(r[0])))csh.getRange(i+1,2).setValue(false);});
    sh.deleteRows(2,sh.getLastRow()-1);
    audit_(user,'ARCHIVE_CANDIDATES','Lưu trữ '+archiveRows.length+' ứng viên; đóng cổng bầu cử; phiếu bầu được giữ nguyên');
    return {success:true,archived:archiveRows.length,deleted:archiveRows.length};
  }finally{lock.releaseLock();}
}
function adminArchivedCandidates(token){auth_(token);return archivedCandidates_();}


// LƯU TRỮ KẾT QUẢ KIỂM PHIẾU – tách theo Chi hội/Chi đoàn.
// Chỉ tạo sheet lịch sử khi lần đầu bấm Xong; không động chạm PhieuBau.
function voteArchiveSheet_() {
  const ss = store_();
  let sh = ss.getSheetByName('LuuTruKiemPhieu');
  if (!sh) {
    sh = ss.insertSheet('LuuTruKiemPhieu');
    sh.appendRow(['ID_LUU_TRU','PHAN_HE','DOT_BAU_CU','KET_THUC_LUC',
                  'SO_PHIEU','KET_QUA_JSON','NGUOI_THUC_HIEN']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function voteArchiveList_() {
  const sh = store_().getSheetByName('LuuTruKiemPhieu');
  if (!sh || sh.getLastRow() < 2) return [];
  return rows_('LuuTruKiemPhieu').map(r => {
    let results=[];
    try { results=JSON.parse(String(r.KET_QUA_JSON || '[]')); }
    catch(e) { results=[]; }
    return {
      id:String(r.ID_LUU_TRU||''), branch:String(r.PHAN_HE||''),
      run:String(r.DOT_BAU_CU||''), finishedAt:String(r.KET_THUC_LUC||''),
      total:Number(r.SO_PHIEU)||0, results:Array.isArray(results)?results:[]
    };
  }).reverse();
}
function adminFinishVoteRound(token, branch, expectedRun, confirmation) {
  const user=auth_(token);
  branch=String(branch||'');
  if (!['ChiHoi','ChiDoan'].includes(branch)) throw Error('Đơn vị bầu cử không hợp lệ');
  const lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const prefix=branch==='ChiHoi'?'ch':'cd', cfg=cfg_();
    const currentRun=String(cfg[prefix+'_dotBauCu']||'');
    if (!currentRun || currentRun !== String(expectedRun||'')) {
      throw Error('Đợt bầu cử đã thay đổi. Hãy tải lại Admin.');
    }
    const oldVotes=rows_(S.VOTES).filter(r =>
      String(r.PHAN_HE)===branch && String(r.DOT_BAU_CU)===currentRun);
    if (!oldVotes.length) throw Error('Đợt này chưa nhận phiếu; không cần kết thúc kiểm phiếu.');
    // Dùng tally_ hiện có, bao gồm ứng viên đã lưu trữ của đợt này.
    const snapshot=tally_(branch,rows_(S.CAND),rows_(S.VOTES));
    const history=voteArchiveSheet_();
    const prior=rows_('LuuTruKiemPhieu');
    if (prior.some(r=>String(r.PHAN_HE)===branch && String(r.DOT_BAU_CU)===currentRun)) {
      throw Error('Đợt này đã được lưu trữ. Hãy tải lại Admin.');
    }
    // Tạo mã hoàn toàn mới, tránh cả mã đã xuất hiện trong bảng phiếu.
    const used=new Set(rows_(S.VOTES).filter(r=>String(r.PHAN_HE)===branch)
      .map(r=>String(r.DOT_BAU_CU)));
    let nextRun;
    do { nextRun=prefix.toUpperCase()+'_'+Utilities.getUuid().replace(/-/g,'').slice(0,12).toUpperCase(); }
    while (used.has(nextRun)||nextRun===currentRun);
    const now=new Date();
    // Đóng cổng trước, rồi lưu snapshot và chuyển đợt.
    const cfgSheet=store_().getSheetByName(S.CONFIG);
    const grid=cfgSheet.getDataRange().getValues();
    function setCfg(key,value) {
      const i=grid.findIndex((r,j)=>j>0&&String(r[0])===key);
      if(i>0) cfgSheet.getRange(i+1,2).setValue(value);
      else cfgSheet.appendRow([key,value]);
    }
    setCfg(prefix+'_moBauCu',false);
    SpreadsheetApp.flush();
    history.appendRow([Utilities.getUuid(),branch,currentRun,now,
      snapshot.total,JSON.stringify(snapshot.results),user]);
    SpreadsheetApp.flush();
    setCfg(prefix+'_dotBauCu',nextRun);
    setCfg(prefix+'_hienThiKetQua',false);
    setCfg(prefix+'_congBoUngVien','[]');
    setCfg(prefix+'_moPhieuLuc','');
    setCfg(prefix+'_dongPhieuLuc','');
    audit_(user,'FINISH_VOTE_ROUND',branch+' '+currentRun+' → '+nextRun+
      ' ('+snapshot.total+' phiếu; giữ nguyên PhieuBau)');
    return {success:true,oldRun:currentRun,newRun:nextRun,archivedVotes:snapshot.total};
  } finally { lock.releaseLock(); }
}

/** V22 attendance archive: additive columns only; no row or image deletion. */
function adminArchiveAttendanceSession(token,id,archive){
 const user=auth_(token);id=String(id||'').trim();
 if(!/^[A-Za-z0-9_-]{2,100}$/.test(id)||typeof archive!=='boolean')throw Error('Yêu cầu không hợp lệ');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sh=store_().getSheetByName('BuoiDiemDanh');if(!sh)throw Error('Thiếu bảng điểm danh');
  const values=sh.getDataRange().getValues(),h=values[0]||[];
  const expected=['ID','TEN_BUOI','LOAI','HOAT_DONG_ID','BAT_DAU','KET_THUC','DIA_DIEM','CONG_KHAI','DANG_MO','GHI_CHU'];
  if(expected.some((k,i)=>h[i]!==k))throw Error('Cấu trúc bảng không hợp lệ');
  if((h[10]||h[11])&&(h[10]!=='TRANG_THAI'||h[11]!=='LUU_TRU_LUC'))throw Error('Cột lưu trữ đã có dữ liệu khác; không ghi đè');
  if(!h[10]&&values.some(r=>r.slice(10).some(v=>v!=='')))throw Error('Có dữ liệu ngoài cột chuẩn; không tự ghi đè');
  const matches=[];for(let i=1;i<values.length;i++)if(String(values[i][0])===id)matches.push(i);
  if(matches.length!==1)throw Error('Không tìm thấy duy nhất một buổi');
  const i=matches[0],r=values[i],archived=String(r[10]||'')==='ARCHIVED';
  if(archive===archived)return {success:true,archived,warning:''};
  const state=attendanceStatus_(attendanceSession_(Object.fromEntries(expected.map((k,j)=>[k,r[j]]))),Date.now());
  if(archive&&!['closed','ended'].includes(state))throw Error('Hãy đóng buổi điểm danh trước khi lưu trữ');
  if(sh.getMaxColumns()<12)sh.insertColumnsAfter(sh.getMaxColumns(),12-sh.getMaxColumns());
  if(!h[10])sh.getRange(1,11,1,2).setValues([['TRANG_THAI','LUU_TRU_LUC']]);
  // Keep existing note and all identifiers, force gate closed and hidden even on restoration.
  sh.getRange(i+1,8,1,2).setValues([[false,false]]);sh.getRange(i+1,11,1,2).setValues([[archive?'ARCHIVED':'ACTIVE',archive?new Date():'']]);
  SpreadsheetApp.flush();let warning='';
  if(archive){try{attendanceCancelObsoleteSchedules_(id,true,true);}catch(e){warning='Kiểm tra lại lịch thông báo.';}const retry=attendanceRetrySheet_(false);if(retry){const rows=retry.getDataRange().getValues();for(let j=1;j<rows.length;j++)if(String(rows[j][1])===id&&rows[j][5]==='ACTIVE')retry.getRange(j+1,6,1,3).setValues([['REVOKED',user,new Date()]]);SpreadsheetApp.flush();}}
  try{audit_(user,archive?'ATTENDANCE_ARCHIVE':'ATTENDANCE_RESTORE',id);}catch(e){warning+=' Chưa xác nhận nhật ký.';}
  return {success:true,archived:archive,warning};
 }finally{lock.releaseLock();}
}

/** Export authorization + audit; records contain no image bytes. */
function adminAttendanceExportCheck(token,ids,withImages){const user=auth_(token);if(!Array.isArray(ids)||!ids.length||ids.length>500||ids.some(x=>!String(x).trim()||String(x).length>100))throw Error('Danh sách buổi không hợp lệ');audit_(user,withImages?'ATT_EXPORT_IMAGES':'ATT_EXPORT',JSON.stringify([...new Set(ids)]).slice(0,2000));return {success:true};}
