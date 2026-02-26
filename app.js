/* ── GTM Plan Calendar — app.js ─────────────────────────────
   Story data model:
   {
     id:          string,
     theme:       string,       // e.g. "Summer on the go email"
     story:       string,       // e.g. "Story 1"
     channel:     string,       // e.g. "CRM", "Paid"
     subChannel:  string,       // e.g. "Email", "SMS", "App"
     startDate:   "YYYY-MM-DD",
     endDate:     "YYYY-MM-DD",
     promo:       boolean,
     promoMsg:    string,       // e.g. "Save up to 50%", "BOGO"
     categories:  string[],     // product categories
   }
─────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'gtm_stories_v2';

const THEME_PALETTE = [
  '#C85E18', '#3E8CB0', '#A0584A', '#4A9E6A',
  '#7B5EA8', '#B84878', '#2E9AA0', '#9A8030',
];

/* ── State ─────────────────────────────────────────────────── */
let state = {
  stories:        loadStories(),
  viewStart:      '2026-05-25', // Monday before 5/31
  viewEnd:        '2026-07-05',
  viewUnit:       'week',
  channelFilter:  'all',
  subChanFilter:  'all',
  themeColorMap:  {},
  editingId:      null,
};

/* ── Persistence ───────────────────────────────────────────── */
function loadStories() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedStories(); }
  catch { return seedStories(); }
}
function saveStories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stories));
}

/* Seed data from your spreadsheet screenshot */
function seedStories() {
  return [
    // ── Theme: Summer on the go email (5/31 – 6/6) ──────────
    { id: uid(), theme: 'Summer on the go email',     story: 'Story 1',  channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go email',     story: 'Story 2',  channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'BOGO',           categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go email',     story: 'Story 3',  channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go email',     story: 'Story 4',  channel: 'CRM', subChannel: 'SMS',   startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'BOGO',           categories: ['Tools'] },
    { id: uid(), theme: 'Summer on the go email',     story: 'Story 5',  channel: 'CRM', subChannel: 'App',   startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care'] },
    // ── Theme: Celebrating Color email (6/7 – 6/13) ─────────
    { id: uid(), theme: 'Celebrating Color email',    story: 'Story 6',  channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Textured Hair Care'] },
    { id: uid(), theme: 'Celebrating Color email',    story: 'Story 7',  channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'Save up to 50%', categories: ['Cosmetics'] },
    { id: uid(), theme: 'Celebrating Color email',    story: 'Story 8',  channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Nails'] },
    { id: uid(), theme: 'Celebrating Color email',    story: 'Story 9',  channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care', 'Hair Color'] },
    { id: uid(), theme: 'Celebrating Color email',    story: 'Story 10', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Hair Color', 'Nails'] },
    // ── Theme: Summer now trending email (6/14 – 6/20) ──────
    { id: uid(), theme: 'Summer now trending email',  story: 'Story 11', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '',               categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending email',  story: 'Story 12', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '',               categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending email',  story: 'Story 13', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '',               categories: ['Tools'] },
    { id: uid(), theme: 'Summer now trending email',  story: 'Story 14', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '',               categories: ['Hair Care'] },
    { id: uid(), theme: 'Summer now trending email',  story: 'Story 15', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '',               categories: ['Textured Hair Care'] },
    // ── Theme: Celebrating Color SMS (6/21 – 6/27) ──────────
    { id: uid(), theme: 'Celebrating Color SMS',      story: 'Story 16', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '',               categories: ['Cosmetics'] },
    { id: uid(), theme: 'Celebrating Color SMS',      story: 'Story 17', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '',               categories: ['Nails'] },
    { id: uid(), theme: 'Celebrating Color SMS',      story: 'Story 18', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '',               categories: ['Hair Care', 'Hair Color'] },
    { id: uid(), theme: 'Celebrating Color SMS',      story: 'Story 19', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '',               categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Celebrating Color SMS',      story: 'Story 20', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '',               categories: ['Hair Color', 'Nails'] },
    // ── Theme: Summer now trending App push (6/28 – 7/4) ────
    { id: uid(), theme: 'Summer now trending App push', story: 'Story 21', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending App push', story: 'Story 22', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '', categories: ['Tools'] },
  ];
}

/* ── Date utilities ────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function isoDate(d) { return d.toISOString().slice(0, 10); }
function parseDate(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function getMondayOf(d) { const day = d.getDay(); return addDays(d, day === 0 ? -6 : 1 - day); }

function formatColHeader(dateStr, unit) {
  const d = parseDate(dateStr);
  if (unit === 'week') {
    const end = addDays(d, 6);
    const mo  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eo  = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${mo} – ${eo}`;
  }
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

function formatDateRange(start, end) {
  const fmt = s => parseDate(s).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function buildColumns() {
  const cols = [];
  const end  = parseDate(state.viewEnd);
  let cur    = parseDate(state.viewStart);
  if (state.viewUnit === 'week') cur = getMondayOf(cur);
  while (cur <= end) {
    cols.push(isoDate(cur));
    cur = addDays(cur, state.viewUnit === 'week' ? 7 : 1);
  }
  return cols;
}

function storyActiveForCol(story, colStart) {
  const colEnd = isoDate(addDays(parseDate(colStart), state.viewUnit === 'week' ? 6 : 0));
  return story.startDate <= colEnd && story.endDate >= colStart;
}

/* ── Theme colour map ──────────────────────────────────────── */
function rebuildThemeColorMap() {
  const used   = new Set(Object.values(state.themeColorMap));
  const themes = [...new Set(state.stories.map(s => s.theme))].sort();
  themes.forEach(t => {
    if (!state.themeColorMap[t]) {
      const next = THEME_PALETTE.find(c => !used.has(c)) || THEME_PALETTE[0];
      state.themeColorMap[t] = next;
      used.add(next);
    }
  });
  Object.keys(state.themeColorMap).forEach(t => {
    if (!themes.includes(t)) delete state.themeColorMap[t];
  });
}

/* ── Gantt Render ──────────────────────────────────────────── */
function renderGantt() {
  rebuildThemeColorMap();

  const table    = document.getElementById('ganttTable');
  const emptyMsg = document.getElementById('ganttEmpty');
  const cols     = buildColumns();

  let stories = state.stories;
  if (state.channelFilter !== 'all') stories = stories.filter(s => s.channel === state.channelFilter);
  if (state.subChanFilter !== 'all') stories = stories.filter(s => s.subChannel === state.subChanFilter);
  stories = [...stories].sort((a, b) =>
    a.theme.localeCompare(b.theme) || a.story.localeCompare(b.story)
  );

  table.innerHTML = '';

  if (!stories.length) { emptyMsg.style.display = 'flex'; return; }
  emptyMsg.style.display = 'none';

  /* ── Header row ── */
  const thead  = table.createTHead();
  const hRow   = thead.insertRow();

  // Sticky label column header
  const labelTh = document.createElement('th');
  labelTh.className = 'gantt-label-th';
  labelTh.textContent = 'Theme / Story';
  hRow.appendChild(labelTh);

  // Date column headers
  cols.forEach(col => {
    const th = document.createElement('th');
    th.className = 'gantt-th';
    th.textContent = formatColHeader(col, state.viewUnit);
    hRow.appendChild(th);
  });

  /* ── Story rows ── */
  const tbody = table.createTBody();

  stories.forEach(story => {
    const color = state.themeColorMap[story.theme] || THEME_PALETTE[0];
    const row   = tbody.insertRow();

    /* Sticky label cell */
    const labelTd = document.createElement('td');
    labelTd.className = 'story-label-cell';
    labelTd.style.borderLeft = `4px solid ${color}`;

    const themeLbl = document.createElement('div');
    themeLbl.className = 'label-theme';
    themeLbl.textContent = story.theme;

    const storyLbl = document.createElement('div');
    storyLbl.className = 'label-story';
    storyLbl.textContent = story.story;

    const metaRow = document.createElement('div');
    metaRow.className = 'label-meta';

    if (story.subChannel) {
      const sub = document.createElement('span');
      sub.className = `sub-tag sub-${story.subChannel.replace(/\s+/g, '-')}`;
      sub.textContent = story.subChannel;
      metaRow.appendChild(sub);
    }

    if (story.promo && story.promoMsg) {
      const badge = document.createElement('span');
      badge.className = 'promo-badge';
      badge.textContent = story.promoMsg;
      metaRow.appendChild(badge);
    }

    const catsDiv = document.createElement('div');
    catsDiv.className = 'label-cats';
    catsDiv.textContent = story.categories.join(', ');

    labelTd.appendChild(themeLbl);
    labelTd.appendChild(storyLbl);
    labelTd.appendChild(metaRow);
    if (story.categories.length) labelTd.appendChild(catsDiv);
    labelTd.addEventListener('click', () => openEditModal(story.id));
    row.appendChild(labelTd);

    /* Date cells */
    cols.forEach(col => {
      const td = row.insertCell();
      if (storyActiveForCol(story, col)) {
        td.className = 'gantt-cell active';
        td.style.backgroundColor = color;
        td.addEventListener('click', () => openEditModal(story.id));

        const card = document.createElement('div');
        card.className = 'cell-card';

        const t = document.createElement('div');
        t.className = 'cell-theme';
        t.textContent = story.theme;

        const s = document.createElement('div');
        s.className = 'cell-story';
        s.textContent = story.story;

        card.appendChild(t);
        card.appendChild(s);

        if (story.channel) {
          const row = document.createElement('div');
          row.className = 'cell-row';
          const lbl = document.createElement('span');
          lbl.className = 'cell-label';
          lbl.textContent = 'Channel:';
          const val = document.createElement('span');
          val.className = 'cell-value';
          val.textContent = story.subChannel ? `${story.channel}, ${story.subChannel}` : story.channel;
          row.appendChild(lbl);
          row.appendChild(val);
          card.appendChild(row);
        }

        if (story.categories.length) {
          const row = document.createElement('div');
          row.className = 'cell-row';
          const lbl = document.createElement('span');
          lbl.className = 'cell-label';
          lbl.textContent = 'Category:';
          const val = document.createElement('span');
          val.className = 'cell-value cell-value--italic';
          val.textContent = story.categories.join(', ');
          row.appendChild(lbl);
          row.appendChild(val);
          card.appendChild(row);
        }

        td.appendChild(card);
      } else {
        td.className = 'gantt-cell inactive';
      }
    });
  });

  renderLegend();
}

/* ── Legend ────────────────────────────────────────────────── */
function renderLegend() {
  const el = document.getElementById('themeLegend');
  el.innerHTML = '';
  const themes = [...new Set(state.stories.map(s => s.theme))].sort();
  if (!themes.length) {
    el.innerHTML = '<span style="color:var(--text-muted);font-size:.75rem">No themes yet</span>';
    return;
  }
  themes.forEach(t => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const sw = document.createElement('div');
    sw.className = 'legend-swatch';
    sw.style.background = state.themeColorMap[t] || '#888';
    const lbl = document.createElement('span');
    lbl.textContent = t;
    item.appendChild(sw);
    item.appendChild(lbl);
    el.appendChild(item);
  });
}

/* ── Panel controls ────────────────────────────────────────── */
function updateTimeframeDisplay() {
  document.getElementById('timeframeDisplay').textContent = formatDateRange(state.viewStart, state.viewEnd);
  document.getElementById('viewStart').value = state.viewStart;
  document.getElementById('viewEnd').value   = state.viewEnd;
}

function setupPanelToggles() {
  function makeToggle(triggerId, pickerId, ...closeOthers) {
    document.getElementById(triggerId).addEventListener('click', () => {
      const p = document.getElementById(pickerId);
      const wasOpen = p.classList.contains('open');
      closeOthers.forEach(id => document.getElementById(id).classList.remove('open'));
      p.classList.toggle('open', !wasOpen);
    });
  }
  makeToggle('timeframeTrigger', 'timeframePicker', 'channelPicker', 'subChanPicker');
  makeToggle('channelTrigger',   'channelPicker',   'timeframePicker', 'subChanPicker');
  makeToggle('subChanTrigger',   'subChanPicker',   'timeframePicker', 'channelPicker');

  document.getElementById('applyTimeframe').addEventListener('click', () => {
    const s = document.getElementById('viewStart').value;
    const e = document.getElementById('viewEnd').value;
    if (!s || !e || s > e) return;
    state.viewStart = s;
    state.viewEnd   = e;
    document.getElementById('timeframePicker').classList.remove('open');
    updateTimeframeDisplay();
    renderGantt();
  });

  document.querySelectorAll('input[name="chanFilter"]').forEach(r => {
    r.addEventListener('change', () => {
      state.channelFilter = r.value;
      document.getElementById('channelDisplay').textContent = r.value === 'all' ? 'All' : r.value;
      renderGantt();
    });
  });

  document.querySelectorAll('input[name="subChanFilter"]').forEach(r => {
    r.addEventListener('change', () => {
      state.subChanFilter = r.value;
      document.getElementById('subChanDisplay').textContent = r.value === 'all' ? 'All' : r.value;
      renderGantt();
    });
  });
}

// View unit toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.viewUnit = btn.dataset.unit;
    renderGantt();
  });
});

/* ── Modal ─────────────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');

// Promo toggle
document.getElementById('fieldPromo').addEventListener('change', function () {
  const group = document.getElementById('promoMsgGroup');
  const label = document.getElementById('promoLabel');
  group.style.opacity        = this.checked ? '1'    : '.4';
  group.style.pointerEvents  = this.checked ? 'auto' : 'none';
  label.textContent          = this.checked ? 'Yes'  : 'No';
  if (!this.checked) document.getElementById('fieldPromoMsg').value = '';
});

function updateThemeDatalist() {
  const dl = document.getElementById('themeDatalist');
  dl.innerHTML = '';
  [...new Set(state.stories.map(s => s.theme))].sort().forEach(t => {
    const o = document.createElement('option'); o.value = t; dl.appendChild(o);
  });
}

function openAddModal() {
  state.editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Story';
  document.getElementById('deleteBtn').style.display = 'none';
  ['fieldTheme','fieldStory','fieldSubChannel','fieldPromoMsg','fieldCategories']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('fieldChannel').value = 'CRM';
  document.getElementById('fieldStart').value   = state.viewStart;
  document.getElementById('fieldEnd').value     = state.viewEnd;
  const pc = document.getElementById('fieldPromo');
  pc.checked = false; pc.dispatchEvent(new Event('change'));
  updateThemeDatalist();
  modalOverlay.classList.add('open');
  document.getElementById('fieldTheme').focus();
}

function openEditModal(id) {
  const s = state.stories.find(x => x.id === id);
  if (!s) return;
  state.editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Story';
  document.getElementById('deleteBtn').style.display = 'inline-flex';
  document.getElementById('fieldTheme').value      = s.theme;
  document.getElementById('fieldStory').value      = s.story;
  document.getElementById('fieldChannel').value    = s.channel;
  document.getElementById('fieldSubChannel').value = s.subChannel;
  document.getElementById('fieldStart').value      = s.startDate;
  document.getElementById('fieldEnd').value        = s.endDate;
  document.getElementById('fieldPromoMsg').value   = s.promoMsg || '';
  document.getElementById('fieldCategories').value = s.categories.join(', ');
  const pc = document.getElementById('fieldPromo');
  pc.checked = !!s.promo; pc.dispatchEvent(new Event('change'));
  updateThemeDatalist();
  modalOverlay.classList.add('open');
}

function closeModal() { modalOverlay.classList.remove('open'); state.editingId = null; }

function shake(el) {
  el.style.borderColor = '#F46';
  el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
}

document.getElementById('addStoryBtn').addEventListener('click', openAddModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

document.getElementById('saveBtn').addEventListener('click', () => {
  const theme = document.getElementById('fieldTheme').value.trim();
  const story = document.getElementById('fieldStory').value.trim();
  const start = document.getElementById('fieldStart').value;
  const end   = document.getElementById('fieldEnd').value;

  if (!theme) { shake(document.getElementById('fieldTheme')); return; }
  if (!story) { shake(document.getElementById('fieldStory')); return; }
  if (!start) { shake(document.getElementById('fieldStart')); return; }
  if (!end)   { shake(document.getElementById('fieldEnd'));   return; }
  if (end < start) { shake(document.getElementById('fieldEnd')); return; }

  const promo = document.getElementById('fieldPromo').checked;
  const record = {
    id:         state.editingId || uid(),
    theme, story,
    channel:    document.getElementById('fieldChannel').value,
    subChannel: document.getElementById('fieldSubChannel').value.trim(),
    startDate:  start, endDate: end,
    promo,
    promoMsg:   promo ? document.getElementById('fieldPromoMsg').value.trim() : '',
    categories: document.getElementById('fieldCategories').value
                  .split(',').map(s => s.trim()).filter(Boolean),
  };

  if (state.editingId) {
    const idx = state.stories.findIndex(x => x.id === state.editingId);
    state.stories[idx] = record;
  } else {
    state.stories.push(record);
  }

  saveStories();
  closeModal();
  renderGantt();
});

document.getElementById('deleteBtn').addEventListener('click', () => {
  if (!state.editingId) return;
  state.stories = state.stories.filter(x => x.id !== state.editingId);
  saveStories();
  closeModal();
  renderGantt();
});

/* ── Keyboard ──────────────────────────────────────────────── */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Init ──────────────────────────────────────────────────── */
setupPanelToggles();
updateTimeframeDisplay();
renderGantt();
