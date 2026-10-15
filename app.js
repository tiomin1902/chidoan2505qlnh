
'use strict';

const $ = id => document.getElementById(id);
let state = null;
let latestTime = 0;

const interval = Math.max(
  5000,
  Number(window.CLASS_REFRESH_MS) || 15000
);

const API = window.CLASS_API_URL;

document.body.setAttribute('data-current-page', 'home');

const html = v => String(v ?? '').replace(
  /[&<>"']/g,
  c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])
);

const bool = v =>
  v === true || String(v).toLowerCase() === 'true';

// =========================================
// ĐIỀU HƯỚNG WEBSITE
// =========================================

function nav(page) {
  document.querySelectorAll('.page').forEach(n => {
    n.classList.toggle('current', n.id === page);
  });

  document.body.setAttribute(
    'data-current-page',
    page === 'ballot'
      ? (window.activeBallotBranch === 'ChiHoi' ? 'hoi' : 'doan')
      : page
  );

  $('drawer').classList.remove('open');
  $('shade').hidden = true;
  $('menuBtn').setAttribute('aria-expanded', 'false');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('menuBtn').onclick = () => {
  $('drawer').classList.add('open');
  $('shade').hidden = false;
  $('menuBtn').setAttribute('aria-expanded', 'true');
};

$('closeBtn').onclick = () => $('shade').click();

$('shade').onclick = () => nav(
  document.querySelector('.page.current').id
);

document.querySelectorAll('[data-page]').forEach(b => {
  b.onclick = () => nav(b.dataset.page);
});

// =========================================
// KẾT NỐI GOOGLE APPS SCRIPT
// =========================================

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(API)) {
      reject(Error('Chưa cấu hình URL Apps Script mới trong config.js'));
      return;
    }

    const callback =
      'cb_' + Date.now() + '_' +
      Math.random().toString(36).slice(2);

    const script = document.createElement('script');

    const timeout = setTimeout(() => {
      clean();
      reject(Error('Hết thời gian kết nối máy chủ'));
    }, 15000);

    function clean() {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
    }

    window[callback] = data => {
      clean();
      resolve(data);
    };

    script.onerror = () => {
      clean();
      reject(Error('Không thể tải dữ liệu máy chủ'));
    };

    const url = new URL(API);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callback);
    url.searchParams.set('cacheBust', Date.now());

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    script.src = url;
    document.body.append(script);
  });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// =========================================
// GỬI DỮ LIỆU VÀ XÁC NHẬN GIAO DỊCH
// =========================================

async function write(action, payload) {
  const op = (
    crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '')
      : 'op' + Date.now() +
        Math.random().toString(36).slice(2).padEnd(16, '0')
  );

  const body = { ...payload, action, op };

  if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(API)) {
    throw Error('Chưa thiết lập Apps Script mới');
  }

  try {
    await fetch(API, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(body),
      redirect: 'follow'
    });
  } catch (error) {
    throw Error(
      'Không gửi được yêu cầu đến máy chủ. ' +
      'Vui lòng kiểm tra kết nối trước khi thử lại.'
    );
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    await sleep(1100);

    try {
      const result = await jsonp('receipt', { op });

      if (result.done) {
        if (!result.success) {
          throw Error(result.message || 'Giao dịch thất bại');
        }

        return result;
      }
    } catch (error) {
      if (
        error.message !== 'Hết thời gian kết nối máy chủ' &&
        !error.message.includes('Không thể tải')
      ) {
        throw error;
      }
    }
  }

  throw Error(
    'Chưa xác nhận được giao dịch. ' +
    'Vui lòng kiểm tra danh sách trước khi gửi lại để tránh trùng lặp.'
  );
}

// =========================================
// THẺ THÔNG TIN
// =========================================

function info(container, items) {
  $(container).replaceChildren(
    ...items.map(([label, value]) => {
      const card = document.createElement('article');
      card.className = 'infoCard';

      const small = document.createElement('small');
      const strong = document.createElement('strong');

      small.textContent = label;
      strong.textContent = String(value || 'Chưa cập nhật');

      card.append(small, strong);
      return card;
    })
  );
}

// =========================================
// HIỂN THỊ THÔNG TIN TOÀN WEBSITE
// =========================================

function render() {
  if (!state) return;

  const c = state.config || {};

  $('slogan').textContent = c.slogan || '';

  $('banner').style.backgroundImage = c.bannerUrl
    ? `linear-gradient(90deg,#15365c22,#15365c44), url(${JSON.stringify(String(c.bannerUrl))})`
    : '';

  $('banner').classList.toggle('hasBanner', !!c.bannerUrl);

  // Thông tin lớp
  info('classCards', [
    ['Cố vấn học tập', c.coVan],
    ['Lớp trưởng', c.lopTruong],
    ['Lớp phó học tập', c.lopPhoHocTap],
    ['Lớp phó phong trào', c.lopPhoPhongTrao],
    ['Lớp phó đời sống', c.lopPhoDoiSong]
  ]);

  $('classDescription').textContent =
    c.moTaLop || 'Chưa cập nhật';

  // Chi Đoàn
  info('doanCards', [
    ['Nhiệm kỳ', c.cd_nhiemKy],
    ['Bí thư', c.cd_biThu],
    ['Phó Bí thư', c.cd_phoBiThu],
    [
      'Ủy viên Ban Chấp hành Chi Đoàn',
      c.cd_uyVien1 ||
      (c.cd_uyVien !== 'Chưa cập nhật' ? c.cd_uyVien : '')
    ],
    ['Ủy viên Ban Chấp hành Chi Đoàn', c.cd_uyVien2],
    ['Ủy viên Ban Chấp hành Chi Đoàn', c.cd_uyVien3]
  ]);

  $('doanDescription').textContent =
    c.cd_moTa || 'Chưa cập nhật';

  // Chi Hội
  info('hoiCards', [
    ['Nhiệm kỳ', c.ch_nhiemKy],
    ['Chi hội trưởng', c.ch_chiHoiTruong],
    ['Chi hội phó', c.ch_chiHoiPho],
    [
      'Ủy viên Ban Chấp hành Chi Hội',
      c.ch_uyVien1 ||
      (c.ch_uyVien !== 'Chưa cập nhật' ? c.ch_uyVien : '')
    ],
    ['Ủy viên Ban Chấp hành Chi Hội', c.ch_uyVien2],
    ['Ủy viên Ban Chấp hành Chi Hội', c.ch_uyVien3]
  ]);

  $('hoiDescription').textContent =
    c.ch_moTa || 'Chưa cập nhật';

  renderCongress('ChiDoan', 'doanCongress');
  renderCongress('ChiHoi', 'hoiCongress');
  renderActivities();
  renderAttendance();

  $('syncTime').textContent =
    'Cập nhật: ' + new Date().toLocaleTimeString('vi-VN');
}

// =========================================
// CHUẨN HÓA NGÀY GIỜ VIỆT NAM
// =========================================

function prettyDate(value) {
  if (!value) return 'Chưa cập nhật';

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return String(value);
  }

  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const get = type =>
    parts.find(part => part.type === type)?.value || '';

  return `${get('hour')}:${get('minute')}, ngày ${get('day')}/${get('month')}/${get('year')}`;
}

// =========================================
// ĐỒNG HỒ ĐẾM NGƯỢC
// =========================================

function countdown(value) {
  const ms = Date.parse(value) - Date.now();

  if (!Number.isFinite(ms)) {
    return '<span class="muted">Chưa xác định thời gian đại hội</span>';
  }

  if (ms <= 0) {
    return '<span class="muted">Đã đến thời gian diễn ra đại hội</span>';
  }

  let seconds = Math.floor(ms / 1000);

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return [
    [days, 'NGÀY'],
    [hours, 'GIỜ'],
    [minutes, 'PHÚT'],
    [remainingSeconds, 'GIÂY']
  ].map(([number, label]) => `
    <div class="digit">
      ${String(number).padStart(2, '0')}
      <small>${label}</small>
    </div>
  `).join('');
}

// =========================================
// BẢNG DỮ LIỆU
// =========================================

function table(columns, rows) {
  return `
    <div class="scroll">
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${html(col[0])}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows.map(row => `
                <tr>
                  ${columns.map(([, key]) =>
                    `<td>${html(row[key])}</td>`
                  ).join('')}
                </tr>
              `).join('')
              : `<tr>
                  <td colspan="${columns.length}">
                    Chưa có dữ liệu
                  </td>
                </tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

// =========================================
// ĐẠI HỘI CHI ĐOÀN VÀ CHI HỘI
// =========================================

function renderCongress(branch, target) {
  const c = state.config;
  const prefix = branch === 'ChiHoi' ? 'ch' : 'cd';
  const container = $(target);

  if (!bool(c[prefix + '_hienThiDaiHoi'])) {
    container.replaceChildren();
    return;
  }

  const candidates = state.candidates.filter(
    candidate => candidate.branch === branch
  );

  const result = state.results && state.results[branch];

  const open = bool(c[prefix + '_moBauCu']);
  const run = c[prefix + '_dotBauCu'];

  container.innerHTML = `
    <div class="congress">
      <div class="panel">
        <h2>${html(c[prefix + '_tenDaiHoi'] || 'Đại hội')}</h2>

        <div class="eventMeta">
          <p>
            <b>Thời gian:</b>
            ${html(prettyDate(c[prefix + '_thoiGian']))}
          </p>
          <p>
            <b>Địa điểm:</b>
            ${html(c[prefix + '_diaDiem'] || 'Chưa cập nhật')}
          </p>
        </div>

        <h3>Đếm ngược đến Đại hội</h3>

        <div
          class="countdown"
          data-time="${html(c[prefix + '_thoiGian'])}"
        >
          ${countdown(c[prefix + '_thoiGian'])}
        </div>

        <h3>Đề án nhân sự</h3>

        ${table([
          ['Họ và tên', 'name'],
          ['Quê quán', 'home'],
          ['Dân tộc', 'ethnicity'],
          ['Tôn giáo', 'religion'],
          ['Chức vụ hiện tại', 'role']
        ], candidates)}

        <div class="voteEntry">
          ${
            open && candidates.length
              ? `<button class="action voteOpen">
                  BẮT ĐẦU BẦU CỬ →
                </button>`
              : '<p class="muted">Cổng bầu cử chưa mở.</p>'
          }
        </div>
      </div>

      ${
        result
          ? `<div class="panel">
              <h2>Kết quả kiểm phiếu đã công bố</h2>

              <p>
                Tổng phiếu thu:
                <b>${Number(result.total) || 0}</b>
                · Đợt ${html(result.run)}
              </p>

              ${table([
                ['Ứng viên', 'name'],
                ['Tín nhiệm', 'trusted'],
                ['Không tín nhiệm', 'notTrusted'],
                ['Số phiếu xét', 'total'],
                ['Tỷ lệ tín nhiệm (%)', 'percent']
              ], result.results || [])}
            </div>`
          : ''
      }
    </div>
  `;

  const button = container.querySelector('.voteOpen');

  if (button) {
    button.onclick = () => showBallot(branch, run, candidates);
  }
}

// =========================================
// MÀN HÌNH BẦU CỬ RIÊNG
// =========================================

function showBallot(branch, run, candidates) {
  window.activeBallotBranch = branch;

  const panel = $('ballotContent');
  const key = 'voted_' + branch + '_' + run;

  const voted = localStorage.getItem(key) === '1';

  $('ballotTitle').textContent =
    'Bầu cử ' +
    (branch === 'ChiHoi' ? 'Chi Hội' : 'Chi Đoàn') +
    ' 2505QLNH';

  panel.innerHTML = `
    <p class="ballotInstruction">
      Mỗi ứng viên mặc định được <b>Tín nhiệm</b>.
      Nếu không tín nhiệm, đánh dấu ở ô <b>Không tín nhiệm</b>.
      Phiếu hợp lệ cần có ít nhất một lựa chọn Không tín nhiệm.
    </p>

    <div class="ballotCandidates">
      ${candidates.map((candidate, index) => `
        <article class="voteCandidate">
          <div class="votePerson">
            <span class="voteIndex">
              ỨNG VIÊN ${String(index + 1).padStart(2, '0')}
            </span>

            <strong>${html(candidate.name)}</strong>
          </div>

          <div class="voteFacts">
            <div>
              <small>Quê quán</small>
              <strong>
                ${html(candidate.home || 'Chưa cập nhật')}
              </strong>
            </div>

            <div>
              <small>Dân tộc</small>
              <strong>
                ${html(candidate.ethnicity || 'Chưa cập nhật')}
              </strong>
            </div>

            <div>
              <small>Tôn giáo</small>
              <strong>
                ${html(candidate.religion || 'Chưa cập nhật')}
              </strong>
            </div>

            <div>
              <small>Chức vụ hiện tại</small>
              <strong>
                ${html(candidate.role || 'Không')}
              </strong>
            </div>
          </div>

          <div class="voteDecision">
            <span class="trustIndicator">
              ✓ Tín nhiệm
            </span>

            <label class="rejectLabel">
              <input
                type="checkbox"
                value="${html(candidate.id)}"
                ${voted ? 'disabled' : ''}
                aria-label="Không tín nhiệm ${html(candidate.name)}"
              >
              Không tín nhiệm
            </label>
          </div>
        </article>
      `).join('')}
    </div>

    <div class="ballotActions">
      <button
        class="action sendVote"
        ${voted ? 'disabled' : ''}
      >
        ${
          voted
            ? 'THIẾT BỊ ĐÃ GỬI PHIẾU'
            : 'XÁC NHẬN NỘP PHIẾU'
        }
      </button>

      <p class="message" role="status">
        ${
          voted
            ? 'Thiết bị này đã gửi phiếu trong đợt bầu cử này.'
            : ''
        }
      </p>
    </div>
  `;

  const inputs = [
    ...panel.querySelectorAll('input[type="checkbox"]')
  ];

  const update = () => {
    inputs.forEach(input => {
      const row = input.closest('.voteCandidate');

      row.querySelector('.trustIndicator').textContent =
        input.checked ? '— Không tín nhiệm' : '✓ Tín nhiệm';

      row.classList.toggle('rejectedRow', input.checked);
    });
  };

  inputs.forEach(input => {
    input.addEventListener('change', update);
  });

  update();

  panel.querySelector('.sendVote').onclick = async () => {
    const rejected = inputs
      .filter(input => input.checked)
      .map(input => input.value);

    const message = panel.querySelector('.message');

    if (!rejected.length) {
      message.textContent =
        'Bạn phải chọn ít nhất một ô Không tín nhiệm.';
      message.className = 'message red';
      return;
    }

    if (!confirm(
      'Xác nhận nộp phiếu? Không thể sửa phiếu sau khi nộp.'
    )) {
      return;
    }

    const button = panel.querySelector('.sendVote');
    button.disabled = true;

    message.textContent =
      'Đang gửi phiếu và chờ xác nhận...';
    message.className = 'message';

    try {
      await write('vote', {
        branch,
        run,
        notTrusted: rejected
      });

      localStorage.setItem(key, '1');

      message.textContent =
        'Phiếu đã được ghi nhận thành công.';
      message.className = 'message green';

      button.textContent = 'ĐÃ GỬI PHIẾU';

      inputs.forEach(input => {
        input.disabled = true;
      });
    } catch (error) {
      message.textContent = error.message;
      message.className = 'message red';
      button.disabled = false;
    }
  };

  nav('ballot');
}

$('ballotBack').onclick = () => {
  nav(
    window.activeBallotBranch === 'ChiHoi'
      ? 'hoi'
      : 'doan'
  );
};

// =========================================
// ĐĂNG KÝ HOẠT ĐỘNG
// =========================================

const expandedActivities = new Set();
const activityDrafts = new Map();
const activityNotices = new Map();

function activityDate(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return 'Chưa cập nhật';
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return String(value);
  }

  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(timestamp));

  const get = key =>
    parts.find(part => part.type === key)?.value || '';

  return `${get('hour')}:${get('minute')}, ngày ${get('day')}/${get('month')}/${get('year')}`;
}

function activityStatus(activity) {
  const now = Date.now();

  const opens = Date.parse(activity.opensAt);
  const closes = Date.parse(activity.closesAt);

  if (
    !Number.isFinite(opens) ||
    !Number.isFinite(closes)
  ) {
    return ['Chưa xác định thời gian', 'closed', false];
  }

  if (now < opens) {
    return ['Chưa mở', 'closed', false];
  }

  if (now >= closes) {
    return ['Đã đóng', 'closed', false];
  }

  if (
    !activity.unlimited &&
    (!activity.limit || activity.count >= activity.limit)
  ) {
    return ['Đã đủ số lượng', 'closed', false];
  }

  return ['Đang mở đăng ký', '', true];
}

function activityClock(activity) {
  const now = Date.now();
  const start = Date.parse(activity.opensAt);
  const end = Date.parse(activity.closesAt);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  ) {
    return {
      label: 'Chưa xác định thời gian đăng ký',
      count: '--'
    };
  }

  let remaining = 0;
  let label = '';

  if (now < start) {
    label = 'ĐẾM NGƯỢC ĐẾN KHI MỞ ĐĂNG KÝ';
    remaining = start - now;
  } else if (now < end) {
    label = 'ĐẾM NGƯỢC ĐẾN KHI HẾT HẠN ĐĂNG KÝ';
    remaining = end - now;
  } else {
    return {
      label: 'THỜI GIAN ĐĂNG KÝ ĐÃ KẾT THÚC',
      count: 'Đã hết hạn'
    };
  }

  let seconds = Math.max(
    0,
    Math.floor(remaining / 1000)
  );

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return {
    label,
    count:
      `${String(days).padStart(2, '0')} ngày  ` +
      `${String(hours).padStart(2, '0')} giờ  ` +
      `${String(minutes).padStart(2, '0')} phút  ` +
      `${String(seconds).padStart(2, '0')} giây`
  };
}

function syncActivityTimers() {
  if (!state) return;

  const activities = new Map(
    (state.activities || []).map(activity => [
      String(activity.id),
      activity
    ])
  );

  document.querySelectorAll(
    '.activityCard[data-activity-id]'
  ).forEach(card => {
    const activity = activities.get(card.dataset.activityId);
    if (!activity) return;

    const clock = activityClock(activity);
    const status = activityStatus(activity);

    const label = card.querySelector('.activityTimerLabel');
    const time = card.querySelector('.activityTimerValue');
    const badge = card.querySelector('.tag');

    if (label) label.textContent = clock.label;
    if (time) time.textContent = clock.count;

    if (badge) {
      badge.textContent = status[0];
      badge.className = 'tag ' + status[1];
    }

    const form = card.querySelector('.regForm');

    if (form) {
      form.querySelectorAll('input,button').forEach(element => {
        if (!form.dataset.submitting) {
          element.disabled = !status[2];
        }
      });
    }
  });
}

function renderActivities() {
  const list = $('activityList');

  list.querySelectorAll('.regForm').forEach(form => {
    activityDrafts.set(form.dataset.id, {
      name: form.elements.name.value,
      id: form.elements.studentId.value
    });
  });

  const activities = Array.isArray(state.activities)
    ? state.activities
    : [];

  if (!activities.length) {
    expandedActivities.clear();

    list.innerHTML = `
      <div class="panel activityEmpty">
        Hiện tại chưa có hoạt động nào để đăng ký
      </div>
    `;
    return;
  }

  list.replaceChildren();

  const valid = new Set(
    activities.map(activity => String(activity.id))
  );

  for (const id of [...expandedActivities]) {
    if (!valid.has(id)) {
      expandedActivities.delete(id);
    }
  }

  activities.forEach(activity => {
    const id = String(activity.id);
    const status = activityStatus(activity);
    const clock = activityClock(activity);
    const opened = expandedActivities.has(id);

    const card = document.createElement('article');
    card.className = 'itemCard activityCard';
    card.dataset.activityId = id;

    card.innerHTML = `
      <div class="activitySummary">
        <span class="tag ${status[1]}">
          ${html(status[0])}
        </span>

        <h2>${html(activity.title)}</h2>

        <div class="activityTimer" aria-live="off">
          <span class="activityTimerLabel">
            ${html(clock.label)}
          </span>

          <strong class="activityTimerValue">
            ${html(clock.count)}
          </strong>
        </div>

        <button
          type="button"
          class="action activityToggle"
          aria-expanded="${opened}"
          aria-controls="activity-detail-${html(id)}"
        >
          ${
            opened
              ? 'THU GỌN THÔNG TIN ↑'
              : 'BẮT ĐẦU ĐĂNG KÝ →'
          }
        </button>
      </div>

      <div
        class="activityDetail"
        id="activity-detail-${html(id)}"
        ${opened ? '' : 'hidden'}
      >
        <div class="activityMeta">
          <p>${html(activity.description || '')}</p>

          <p>
            <b>Thời gian diễn ra:</b>
            ${html(activityDate(activity.eventTime))}
            <br>

            <b>Địa điểm:</b>
            ${html(activity.location || 'Chưa cập nhật')}
            <br>

            <b>Mở đăng ký:</b>
            ${html(activityDate(activity.opensAt))}
            <br>

            <b>Hạn đăng ký:</b>
            ${html(activityDate(activity.closesAt))}
            <br>

            <b>Số lượng đã đăng ký:</b>
            ${Number(activity.count) || 0}
            ${
              activity.unlimited
                ? ' · Không giới hạn'
                : ' / ' + (Number(activity.limit) || 0)
            }
          </p>

          ${
            activity.note
              ? `<p>${html(activity.note)}</p>`
              : ''
          }
        </div>

        <form class="regForm" data-id="${html(id)}">
          <label>
            Họ và tên
            <input
              name="name"
              autocomplete="name"
              maxlength="150"
              required
              ${status[2] ? '' : 'disabled'}
            >
          </label>

          <label>
            MSSV
            <input
              name="studentId"
              maxlength="30"
              required
              ${status[2] ? '' : 'disabled'}
            >
          </label>

          <button
            class="action"
            ${status[2] ? '' : 'disabled'}
          >
            XÁC NHẬN ĐĂNG KÝ
          </button>
        </form>

        <p class="message" role="status"></p>

        <h3 class="listHeading">
          Danh sách đã đăng ký
          (${Number(activity.count) || 0})
        </h3>

        ${table([
          ['STT', 'index'],
          ['Họ và tên', 'name'],
          ['MSSV', 'studentId'],
          ['Thời gian đăng ký', 'time']
        ], (activity.registrations || []).map((record, index) => ({
          ...record,
          index: index + 1,
          time: activityDate(record.time)
        })))}
      </div>
    `;

    const detail = card.querySelector('.activityDetail');
    const toggle = card.querySelector('.activityToggle');

    toggle.onclick = () => {
      const opening = detail.hidden;

      detail.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));

      toggle.textContent = opening
        ? 'THU GỌN THÔNG TIN ↑'
        : 'BẮT ĐẦU ĐĂNG KÝ →';

      if (opening) {
        expandedActivities.add(id);
      } else {
        expandedActivities.delete(id);
      }
    };

    const form = card.querySelector('.regForm');
    const draft = activityDrafts.get(id);
    const message = card.querySelector('.message');

    if (draft) {
      form.elements.name.value = draft.name;
      form.elements.studentId.value = draft.id;
    }

    if (activityNotices.has(id)) {
      const notice = activityNotices.get(id);

      message.textContent = notice.text;
      message.className = 'message ' + notice.kind;
    }

    form.onsubmit = async event => {
      event.preventDefault();

      if (!activityStatus(activity)[2]) {
        message.textContent =
          'Hoạt động hiện không nhận đăng ký.';
        message.className = 'message red';
        return;
      }

      const name = form.elements.name.value.trim();
      const studentId = form.elements.studentId.value.trim();
      const button = form.querySelector('button');

      if (!name || !studentId) return;

      form.dataset.submitting = 'yes';
      button.disabled = true;

      message.textContent =
        'Đang gửi đăng ký và chờ xác nhận...';
      message.className = 'message';

      try {
        await write('register', {
          activityId: activity.id,
          name,
          studentId
        });

        activityDrafts.delete(id);

        activityNotices.set(id, {
          text: 'Đăng ký thành công!',
          kind: 'green'
        });

        form.reset();

        message.textContent = 'Đăng ký thành công!';
        message.className = 'message green';

        await refresh(true);
      } catch (error) {
        activityNotices.set(id, {
          text: error.message,
          kind: 'red'
        });

        message.textContent = error.message;
        message.className = 'message red';
      } finally {
        delete form.dataset.submitting;
        button.disabled = !activityStatus(activity)[2];
      }
    };

    list.append(card);
  });

  syncActivityTimers();
}

// =========================================
// ĐIỂM DANH TRỰC TUYẾN
// =========================================

function attendanceDate(value) {
  return activityDate(value);
}

function renderAttendance() {
  const root = $('attendanceList');
  if (!root) return;

  const sessions = Array.isArray(state.attendanceSessions)
    ? state.attendanceSessions
    : [];

  if (!sessions.length) {
    root.innerHTML = `
      <div class="panel activityEmpty">
        Hiện tại chưa có buổi điểm danh nào đang mở.
      </div>
    `;
    return;
  }

  root.replaceChildren();

  sessions.forEach(session => {
    const card = document.createElement('article');
    card.className = 'panel attendanceCard';

    const until = Date.parse(session.endsAt);
    const from = Date.parse(session.startsAt);
    const now = Date.now();

    const available =
      session.enabled &&
      Number.isFinite(until) &&
      Number.isFinite(from) &&
      now >= from &&
      now < until;

    card.innerHTML = `
      <h2>${html(session.title)}</h2>

      <p>
        <b>Loại:</b>
        ${html(session.kind === 'DaiHoi' ? 'Đại hội' : 'Hoạt động')}
        ·
        <b>Địa điểm:</b>
        ${html(session.location || 'Chưa cập nhật')}
      </p>

      <p>
        <b>Bắt đầu:</b>
        ${html(attendanceDate(session.startsAt))}
        ·
        <b>Kết thúc:</b>
        ${html(attendanceDate(session.endsAt))}
      </p>

      <p class="muted">
        ${
          available
            ? 'Đang mở điểm danh'
            : now < from
              ? 'Chưa đến thời gian điểm danh'
              : 'Đã đóng điểm danh'
        }
      </p>

      <form class="regForm">
        <label>
          Họ và tên
          <input
            name="name"
            maxlength="150"
            required
            ${available ? '' : 'disabled'}
          >
        </label>

        <label>
          MSSV
          <input
            name="studentId"
            maxlength="30"
            required
            ${available ? '' : 'disabled'}
          >
        </label>

        <button class="action" ${available ? '' : 'disabled'}>
          XÁC NHẬN ĐIỂM DANH
        </button>
      </form>

      <p class="message" role="status"></p>
    `;

    const form = card.querySelector('form');
    const button = form.querySelector('button');
    const message = card.querySelector('.message');

    form.onsubmit = async event => {
      event.preventDefault();

      button.disabled = true;
      message.textContent = 'Đang xác nhận điểm danh...';

      try {
        await write('attendance', {
          sessionId: session.id,
          name: form.elements.name.value.trim(),
          studentId: form.elements.studentId.value.trim()
        });

        message.textContent = 'Điểm danh thành công.';
        message.className = 'message green';

        form.reset();
        await refresh(true);
      } catch (error) {
        message.textContent = error.message;
        message.className = 'message red';
      } finally {
        button.disabled = false;
      }
    };

    root.append(card);
  });
}

// =========================================
// ĐỒNG BỘ WEBSITE
// =========================================

async function refresh(silent = false) {
  try {
    const data = await jsonp('publicData');

    if (!data.success) {
      throw Error(data.message || 'Máy chủ chưa sẵn sàng');
    }

    state = data;
    latestTime = Date.now();

    if (document.querySelector('#ballot.current')) {
      const branch = window.activeBallotBranch;
      const prefix = branch === 'ChiHoi' ? 'ch' : 'cd';

      if (
        !bool(data.config?.[prefix + '_moBauCu']) ||
        !bool(data.config?.[prefix + '_hienThiDaiHoi'])
      ) {
        nav(branch === 'ChiHoi' ? 'hoi' : 'doan');
      }
    }

    if (
      !document.querySelector('.regForm:focus-within') &&
      !document.querySelector('.ballotPanel input:focus')
    ) {
      render();
    } else {
      $('syncTime').textContent = 'Đã có bản cập nhật mới';
    }
  } catch (error) {
    if (!silent) {
      $('syncTime').textContent =
        'Lỗi đồng bộ: ' + error.message;
    }
  }
}

function updateTimers() {
  document.querySelectorAll(
    '.countdown[data-time]'
  ).forEach(element => {
    element.innerHTML = countdown(element.dataset.time);
  });

  syncActivityTimers();
}

// =========================================
// KHỞI ĐỘNG
// =========================================

refresh();

setInterval(() => refresh(true), interval);
setInterval(updateTimers, 1000);
