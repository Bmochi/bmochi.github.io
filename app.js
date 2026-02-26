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

const STORAGE_KEY = 'gtm_stories_v3';

const THEME_PALETTE = [
  '#C85E18', '#3E8CB0', '#A0584A', '#4A9E6A',
  '#7B5EA8', '#B84878', '#2E9AA0', '#9A8030',
];

/* ── State ─────────────────────────────────────────────────── */
let state = {
  stories:        loadStories(),
  viewStart:      '2026-05-25', // Monday before 5/31
  viewEnd:        '2026-07-12',
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
    // ── CRM · Summer on the go (5/31 – 6/6) ─────────────────
    { id: uid(), theme: 'Summer on the go',   story: 'Story 1', channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go',   story: 'Story 2', channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'BOGO',           categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go',   story: 'Story 3', channel: 'CRM', subChannel: 'Email', startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer on the go',   story: 'Story 4', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'BOGO',           categories: ['Tools'] },
    { id: uid(), theme: 'Summer on the go',   story: 'Story 5', channel: 'CRM', subChannel: 'App',   startDate: '2026-05-31', endDate: '2026-06-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care'] },
    // ── CRM · Celebrating Color (6/7 – 6/13) ────────────────
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 1', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Textured Hair Care'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 2', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'Save up to 50%', categories: ['Cosmetics'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 3', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Nails'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 4', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care', 'Hair Color'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 5', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-07', endDate: '2026-06-13', promo: true,  promoMsg: 'BOGO',           categories: ['Hair Color', 'Nails'] },
    // ── CRM · Summer now trending (6/14 – 6/20) ─────────────
    { id: uid(), theme: 'Summer now trending', story: 'Story 1', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 2', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 3', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '', categories: ['Tools'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 4', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '', categories: ['Hair Care'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 5', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-14', endDate: '2026-06-20', promo: false, promoMsg: '', categories: ['Textured Hair Care'] },
    // ── CRM · Celebrating Color (6/21 – 6/27) ───────────────
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 1', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '', categories: ['Cosmetics'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 2', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '', categories: ['Nails'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 3', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '', categories: ['Hair Care', 'Hair Color'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 4', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '', categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 5', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-21', endDate: '2026-06-27', promo: false, promoMsg: '', categories: ['Hair Color', 'Nails'] },
    // ── CRM · Summer now trending (6/28 – 7/4) ──────────────
    { id: uid(), theme: 'Summer now trending', story: 'Story 1', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '',               categories: ['Hair Color', 'Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 2', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '',               categories: ['Tools'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 3', channel: 'CRM', subChannel: 'Email', startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '',               categories: ['Hair Care'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 4', channel: 'CRM', subChannel: 'SMS',   startDate: '2026-06-28', endDate: '2026-07-04', promo: false, promoMsg: '',               categories: ['Textured Hair Care'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 5', channel: 'CRM', subChannel: 'App',   startDate: '2026-06-28', endDate: '2026-07-04', promo: true,  promoMsg: 'Save up to 50%', categories: ['Cosmetics'] },
    // ── Paid · Summer now trending (7/4 – various) ──────────
    { id: uid(), theme: 'Summer now trending', story: 'Story 1', channel: 'Paid', subChannel: 'Paid Search', startDate: '2026-07-04', endDate: '2026-07-05', promo: false, promoMsg: '',               categories: ['Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 2', channel: 'Paid', subChannel: 'Paid Social', startDate: '2026-07-04', endDate: '2026-07-06', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care', 'Hair Color'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 3', channel: 'Paid', subChannel: 'Paid Search', startDate: '2026-07-04', endDate: '2026-07-07', promo: false, promoMsg: '',               categories: ['Textured Hair Care'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 4', channel: 'Paid', subChannel: 'Paid Social', startDate: '2026-07-04', endDate: '2026-07-08', promo: false, promoMsg: '',               categories: ['Cosmetics'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 5', channel: 'Paid', subChannel: 'Paid Search', startDate: '2026-07-04', endDate: '2026-07-09', promo: true,  promoMsg: 'BOGO',           categories: ['Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 6', channel: 'Paid', subChannel: 'Paid Social', startDate: '2026-07-04', endDate: '2026-07-10', promo: true,  promoMsg: 'Save up to 50%', categories: ['Hair Care', 'Hair Color'] },
    // ── Organic · Celebrating Color (5/31 – 6/6) ────────────
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 1', channel: 'Organic',    subChannel: 'Organic Social', startDate: '2026-05-31', endDate: '2026-06-06', promo: false, promoMsg: '', categories: ['Cosmetics'] },
    // ── Influencer · (5/31 – 7/1) ───────────────────────────
    { id: uid(), theme: 'Celebrating Color',  story: 'Story 2', channel: 'Influencer', subChannel: 'Ambassador',     startDate: '2026-05-31', endDate: '2026-07-01', promo: false, promoMsg: '', categories: ['Nails'] },
    { id: uid(), theme: 'Summer now trending', story: 'Story 3', channel: 'Influencer', subChannel: 'Associate',     startDate: '2026-05-31', endDate: '2026-07-01', promo: false, promoMsg: '', categories: ['Hair Care', 'Hair Color'] },
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

  // Group entries sharing the same theme + story + channel + subChannel into one row
  const groups = new Map();
  stories.forEach(s => {
    const key = `${s.theme}\x00${s.story}\x00${s.channel}\x00${s.subChannel}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  });

  groups.forEach(entries => {
    const rep   = entries[0]; // representative entry for label display
    const color = state.themeColorMap[rep.theme] || THEME_PALETTE[0];
    const tr    = tbody.insertRow();

    /* Sticky label cell */
    const labelTd = document.createElement('td');
    labelTd.className = 'story-label-cell';
    labelTd.style.borderLeft = `4px solid ${color}`;

    const themeLbl = document.createElement('div');
    themeLbl.className = 'label-theme';
    themeLbl.textContent = rep.theme;

    const storyLbl = document.createElement('div');
    storyLbl.className = 'label-story';
    storyLbl.textContent = rep.story;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'label-meta';

    if (rep.subChannel) {
      const sub = document.createElement('span');
      sub.className = `sub-tag sub-${rep.subChannel.replace(/\s+/g, '-')}`;
      sub.textContent = rep.subChannel;
      metaDiv.appendChild(sub);
    }

    if (rep.promo && rep.promoMsg) {
      const badge = document.createElement('span');
      badge.className = 'promo-badge';
      badge.textContent = rep.promoMsg;
      metaDiv.appendChild(badge);
    }

    const catsDiv = document.createElement('div');
    catsDiv.className = 'label-cats';
    catsDiv.textContent = rep.categories.join(', ');

    labelTd.appendChild(themeLbl);
    labelTd.appendChild(storyLbl);
    labelTd.appendChild(metaDiv);
    if (rep.categories.length) labelTd.appendChild(catsDiv);
    labelTd.addEventListener('click', () => openEditModal(rep.id));
    tr.appendChild(labelTd);

    /* Date cells — any entry in the group can activate a column */
    cols.forEach(col => {
      const td          = tr.insertCell();
      const activeEntry = entries.find(s => storyActiveForCol(s, col));
      if (activeEntry) {
        td.className = 'gantt-cell active';
        td.style.backgroundColor = color;
        td.addEventListener('click', () => openEditModal(activeEntry.id));

        const card = document.createElement('div');
        card.className = 'cell-card';

        const t = document.createElement('div');
        t.className = 'cell-theme';
        t.textContent = activeEntry.theme;

        const s = document.createElement('div');
        s.className = 'cell-story';
        s.textContent = activeEntry.story;

        card.appendChild(t);
        card.appendChild(s);

        if (activeEntry.channel) {
          const rowEl = document.createElement('div');
          rowEl.className = 'cell-row';
          const lbl = document.createElement('span');
          lbl.className = 'cell-label';
          lbl.textContent = 'Channel:';
          const val = document.createElement('span');
          val.className = 'cell-value';
          val.textContent = activeEntry.subChannel
            ? `${activeEntry.channel}, ${activeEntry.subChannel}`
            : activeEntry.channel;
          rowEl.appendChild(lbl);
          rowEl.appendChild(val);
          card.appendChild(rowEl);
        }

        if (activeEntry.categories.length) {
          const rowEl = document.createElement('div');
          rowEl.className = 'cell-row';
          const lbl = document.createElement('span');
          lbl.className = 'cell-label';
          lbl.textContent = 'Category:';
          const val = document.createElement('span');
          val.className = 'cell-value cell-value--italic';
          val.textContent = activeEntry.categories.join(', ');
          rowEl.appendChild(lbl);
          rowEl.appendChild(val);
          card.appendChild(rowEl);
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
document.getElementById('resetDataBtn').addEventListener('click', () => {
  if (confirm('Reset to default data? This will clear any stories you have added.')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});
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
