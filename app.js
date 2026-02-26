/* ── GTM Plan Calendar — app.js ─────────────────────────────
   Data model per story:
   {
     id:         string,
     theme:      string,       // grouping label, e.g. "Summer Launch"
     story:      string,       // campaign story name
     channels:   string[],     // e.g. ["Paid", "Organic Social", "CRM"]
     categories: string[],     // product categories you sell
     startDate:  "YYYY-MM-DD",
     endDate:    "YYYY-MM-DD",
   }
─────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'gtm_stories_v1';

const ALL_CHANNELS = [
  'Paid', 'Organic Social', 'CRM', 'Retail', 'PR', 'Influencer', 'Events',
];

// Eight distinct theme colours (cycled in insertion order)
const THEME_PALETTE = [
  '#C85E18', // burnt orange
  '#3E8CB0', // muted blue
  '#B86A50', // salmon
  '#4A9E6A', // forest green
  '#7B5EA8', // purple
  '#B84878', // rose
  '#2E9AA0', // teal
  '#9A8030', // gold
];

/* ── State ─────────────────────────────────────────────────── */
let state = {
  stories:       loadStories(),
  viewStart:     null,   // YYYY-MM-DD
  viewEnd:       null,   // YYYY-MM-DD
  viewUnit:      'week', // 'week' | 'day'
  channelFilter: 'all',
  themeColorMap: {},     // theme name → hex color
  editingId:     null,
};

// Initialise default view window: today → today + 10 weeks
(function initView() {
  const today = new Date();
  state.viewStart = isoDate(getMondayOf(today));
  const end = addDays(getMondayOf(today), 69); // ~10 weeks
  state.viewEnd = isoDate(end);
})();

/* ── Persistence ───────────────────────────────────────────── */
function loadStories() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedStories(); }
  catch { return seedStories(); }
}
function saveStories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stories));
}

function seedStories() {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  const p = `${y}-${m}`;
  return [
    { id: uid(), theme: 'Theme 1', story: 'Story 1', channels: ['Paid', 'Organic Social', 'CRM'], categories: ['Hair Color', 'Nails'], startDate: `${p}-01`, endDate: `${p}-18` },
    { id: uid(), theme: 'Theme 1', story: 'Story 2', channels: ['Organic Social', 'CRM'],         categories: ['Hair Care'],            startDate: `${p}-01`, endDate: `${p}-10` },
    { id: uid(), theme: 'Theme 2', story: 'Story 1', channels: [],                                categories: [],                       startDate: `${p}-05`, endDate: `${p}-25` },
    { id: uid(), theme: 'Theme 3', story: 'Story 1', channels: ['Paid', 'CRM'],                   categories: ['Clippers / Trimmers', 'Styling Products'], startDate: `${p}-01`, endDate: `${p}-28` },
    { id: uid(), theme: 'Theme 3', story: 'Story 2', channels: [],                                categories: [],                       startDate: `${p}-15`, endDate: `${p}-28` },
  ];
}

/* ── Date utilities ────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function isoDate(d) { return d.toISOString().slice(0, 10); }

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMondayOf(d) {
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0) ? -6 : 1 - day;
  return addDays(d, diff);
}

function formatColHeader(dateStr, unit) {
  const d = parseDate(dateStr);
  if (unit === 'week') {
    return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

function formatDateRange(start, end) {
  const fmt = s => parseDate(s).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/* Build the array of column start-dates */
function buildColumns() {
  const cols = [];
  const end = parseDate(state.viewEnd);
  let cur = parseDate(state.viewStart);
  if (state.viewUnit === 'week') cur = getMondayOf(cur);

  while (cur <= end) {
    cols.push(isoDate(cur));
    cur = addDays(cur, state.viewUnit === 'week' ? 7 : 1);
  }
  return cols;
}

/* Is a story active during a given column? */
function storyActiveForCol(story, colStart) {
  const colEnd = isoDate(addDays(parseDate(colStart),
    state.viewUnit === 'week' ? 6 : 0));
  return story.startDate <= colEnd && story.endDate >= colStart;
}

/* ── Theme colour map ──────────────────────────────────────── */
function rebuildThemeColorMap() {
  // Keep existing assignments; add new themes in palette order
  const used = new Set(Object.values(state.themeColorMap));
  const themes = [...new Set(state.stories.map(s => s.theme))].sort();
  themes.forEach(t => {
    if (!state.themeColorMap[t]) {
      const next = THEME_PALETTE.find(c => !used.has(c)) || THEME_PALETTE[0];
      state.themeColorMap[t] = next;
      used.add(next);
    }
  });
  // Remove orphaned themes
  Object.keys(state.themeColorMap).forEach(t => {
    if (!themes.includes(t)) delete state.themeColorMap[t];
  });
}

/* Slightly darken a hex colour for text-on-colour readability */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Gantt Render ──────────────────────────────────────────── */
function renderGantt() {
  rebuildThemeColorMap();

  const table     = document.getElementById('ganttTable');
  const emptyMsg  = document.getElementById('ganttEmpty');
  const cols      = buildColumns();

  // Filter stories by selected channel
  let stories = state.stories;
  if (state.channelFilter !== 'all') {
    stories = stories.filter(s => s.channels.includes(state.channelFilter));
  }

  // Sort: theme name → story name
  stories = [...stories].sort((a, b) =>
    a.theme.localeCompare(b.theme) || a.story.localeCompare(b.story)
  );

  table.innerHTML = '';

  if (stories.length === 0) {
    emptyMsg.style.display = 'flex';
    return;
  }
  emptyMsg.style.display = 'none';

  /* ── Header row ── */
  const thead = table.createTHead();
  const hRow  = thead.insertRow();
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

    let passedFirstActive = false;

    cols.forEach(col => {
      const td = row.insertCell();

      if (storyActiveForCol(story, col)) {
        td.className = 'gantt-cell active';
        td.style.backgroundColor = color;

        if (!passedFirstActive) {
          passedFirstActive = true;
          td.classList.add('first-active');

          // Build story card
          const card = document.createElement('div');
          card.className = 'story-card';

          const themeLbl = document.createElement('div');
          themeLbl.className = 'story-theme-label';
          themeLbl.textContent = story.theme;

          const storyLbl = document.createElement('div');
          storyLbl.className = 'story-name-label';
          storyLbl.textContent = story.story;

          card.appendChild(themeLbl);
          card.appendChild(storyLbl);

          if (story.channels.length) {
            const chRow = document.createElement('div');
            chRow.className = 'story-channels-row';
            const prefix = document.createElement('span');
            prefix.className = 'ch-prefix';
            prefix.textContent = 'Channel: ';
            chRow.appendChild(prefix);
            story.channels.forEach((ch, i) => {
              const tag = document.createElement('span');
              tag.className = `ch-tag ch-${ch.replace(/\s+/g, '-')}`;
              tag.textContent = ch + (i < story.channels.length - 1 ? ',' : '');
              chRow.appendChild(tag);
            });
            card.appendChild(chRow);
          }

          if (story.categories.length) {
            const catRow = document.createElement('div');
            catRow.className = 'story-categories-row';
            const prefix = document.createElement('span');
            prefix.className = 'cat-prefix';
            prefix.textContent = 'Category: ';
            catRow.appendChild(prefix);
            catRow.appendChild(document.createTextNode(story.categories.join(', ')));
            card.appendChild(catRow);
          }

          td.appendChild(card);
        }

        td.addEventListener('click', () => openEditModal(story.id));
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
    el.innerHTML = '<span style="color:var(--text-muted);font-size:.78rem">No themes yet</span>';
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
    item.addEventListener('click', () => {
      // Filter to just this theme
      state.channelFilter = 'all';
      document.querySelectorAll('input[name="chanFilter"]').forEach(r => r.checked = r.value === 'all');
      document.getElementById('channelDisplay').textContent = 'All';
      renderGantt();
    });
    el.appendChild(item);
  });
}

/* ── Right Panel ───────────────────────────────────────────── */
// Timeframe display
function updateTimeframeDisplay() {
  document.getElementById('timeframeDisplay').textContent =
    formatDateRange(state.viewStart, state.viewEnd);
  document.getElementById('viewStart').value = state.viewStart;
  document.getElementById('viewEnd').value   = state.viewEnd;
}

// Toggle pickers
function setupPanelToggles() {
  // Timeframe
  document.getElementById('timeframeTrigger').addEventListener('click', () => {
    const p = document.getElementById('timeframePicker');
    p.classList.toggle('open');
    document.getElementById('channelPicker').classList.remove('open');
  });

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

  // Channel
  document.getElementById('channelTrigger').addEventListener('click', () => {
    const p = document.getElementById('channelPicker');
    p.classList.toggle('open');
    document.getElementById('timeframePicker').classList.remove('open');
  });

  document.querySelectorAll('input[name="chanFilter"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.channelFilter = radio.value;
      document.getElementById('channelDisplay').textContent =
        radio.value === 'all' ? 'All' : radio.value;
      renderGantt();
    });
  });
}

// View unit toggle (Weekly / Daily)
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

function buildChannelCheckboxes(selected = []) {
  const container = document.getElementById('channelCheckboxes');
  container.innerHTML = '';
  ALL_CHANNELS.forEach(ch => {
    const label = document.createElement('label');
    label.className = 'channel-cb-label' + (selected.includes(ch) ? ' checked' : '');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = ch;
    cb.checked = selected.includes(ch);
    cb.addEventListener('change', () => label.classList.toggle('checked', cb.checked));
    label.appendChild(cb);
    label.appendChild(document.createTextNode(ch));
    container.appendChild(label);
  });
}

function updateThemeDatalist() {
  const dl = document.getElementById('themeDatalist');
  dl.innerHTML = '';
  [...new Set(state.stories.map(s => s.theme))].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    dl.appendChild(opt);
  });
}

function openAddModal() {
  state.editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Story';
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('fieldTheme').value      = '';
  document.getElementById('fieldStory').value      = '';
  document.getElementById('fieldStart').value      = state.viewStart;
  document.getElementById('fieldEnd').value        = state.viewEnd;
  document.getElementById('fieldCategories').value = '';
  buildChannelCheckboxes([]);
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
  document.getElementById('fieldStart').value      = s.startDate;
  document.getElementById('fieldEnd').value        = s.endDate;
  document.getElementById('fieldCategories').value = s.categories.join(', ');
  buildChannelCheckboxes(s.channels);
  updateThemeDatalist();
  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  state.editingId = null;
}

function getCheckedChannels() {
  return [...document.querySelectorAll('#channelCheckboxes input:checked')].map(cb => cb.value);
}

function parseCategories(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

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

  const record = {
    id:         state.editingId || uid(),
    theme, story,
    channels:   getCheckedChannels(),
    categories: parseCategories(document.getElementById('fieldCategories').value),
    startDate:  start,
    endDate:    end,
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

/* ── Keyboard shortcuts ────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Init ──────────────────────────────────────────────────── */
setupPanelToggles();
updateTimeframeDisplay();
renderGantt();
