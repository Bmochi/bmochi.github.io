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
  '#CC1230', // Sally primary red
  '#7B0022', // deep burgundy
  '#E04865', // rose
  '#A81230', // crimson
  '#590015', // dark wine
  '#D44060', // hot pink-red
  '#8C1530', // medium wine
  '#F06885', // light coral-rose
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

function fmtShort(s) {
  const d = parseDate(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

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

  // "All" view: no channel or sub-channel filter active → merge rows by theme+story
  const isAllView = state.channelFilter === 'all' && state.subChanFilter === 'all';

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

  const labelTh = document.createElement('th');
  labelTh.className = 'gantt-label-th';
  labelTh.textContent = 'Theme / Story';
  hRow.appendChild(labelTh);

  cols.forEach(col => {
    const th = document.createElement('th');
    th.className = 'gantt-th';
    th.textContent = formatColHeader(col, state.viewUnit);
    hRow.appendChild(th);
  });

  /* ── Story rows ── */
  const tbody = table.createTBody();

  // In all-view: collapse to one row per theme+story, tags show channels
  // In filtered view: one row per theme+story+channel+subChannel (current behaviour)
  const groups = new Map();
  stories.forEach(s => {
    const key = isAllView
      ? `${s.theme}\x00${s.story}`
      : `${s.theme}\x00${s.story}\x00${s.channel}\x00${s.subChannel}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  });

  groups.forEach(entries => {
    const rep   = entries[0];
    const color = state.themeColorMap[rep.theme] || THEME_PALETTE[0];
    const tr    = tbody.insertRow();

    /* ── Sticky label cell ── */
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

    if (isAllView) {
      // One tag per unique parent channel (CRM, Paid, Organic, Influencer…)
      [...new Set(entries.map(e => e.channel).filter(Boolean))].forEach(ch => {
        const tag = document.createElement('span');
        tag.className = `chan-tag chan-${ch.replace(/\s+/g, '-')}`;
        tag.textContent = ch;
        metaDiv.appendChild(tag);
      });
      // Unique promo messages
      [...new Set(entries.filter(e => e.promo && e.promoMsg).map(e => e.promoMsg))].forEach(pm => {
        const badge = document.createElement('span');
        badge.className = 'promo-badge';
        badge.textContent = pm;
        metaDiv.appendChild(badge);
      });
    } else {
      if (rep.subChannel) {
        const tag = document.createElement('span');
        tag.className = `sub-tag sub-${rep.subChannel.replace(/\s+/g, '-')}`;
        tag.textContent = rep.subChannel;
        metaDiv.appendChild(tag);
      }
      if (rep.promo && rep.promoMsg) {
        const badge = document.createElement('span');
        badge.className = 'promo-badge';
        badge.textContent = rep.promoMsg;
        metaDiv.appendChild(badge);
      }
    }

    // Merged unique categories across all entries in the group
    const allCats = isAllView
      ? [...new Set(entries.flatMap(e => e.categories))]
      : rep.categories;

    const catsDiv = document.createElement('div');
    catsDiv.className = 'label-cats';
    catsDiv.textContent = allCats.join(', ');

    labelTd.appendChild(themeLbl);
    labelTd.appendChild(storyLbl);
    labelTd.appendChild(metaDiv);
    if (allCats.length) labelTd.appendChild(catsDiv);
    labelTd.addEventListener('click', () => openEditModal(rep.id));
    tr.appendChild(labelTd);

    /* ── Date cells with colspan merging ── */
    // Pre-compute each column's active entries + a fingerprint for identity comparison
    const colStates = cols.map(col => {
      const ae = entries.filter(s => storyActiveForCol(s, col));
      if (!ae.length) return null;
      return { ae, fp: ae.map(e => e.id).sort().join('|') };
    });

    let ci = 0;
    while (ci < cols.length) {
      const cs = colStates[ci];

      if (!cs) {
        const td = tr.insertCell();
        td.className = 'gantt-cell inactive';
        ci++;
        continue;
      }

      // Count how many consecutive columns share the exact same active-entry set
      let span = 1;
      while (ci + span < cols.length && colStates[ci + span]?.fp === cs.fp) span++;

      const td = tr.insertCell();
      if (span > 1) td.colSpan = span;
      td.className = 'gantt-cell active';
      td.style.backgroundColor = color;
      td.addEventListener('click', () => openEditModal(cs.ae[0].id));

      const card = document.createElement('div');
      card.className = 'cell-card';

      const t = document.createElement('div');
      t.className = 'cell-theme';
      t.textContent = rep.theme;
      card.appendChild(t);

      const s = document.createElement('div');
      s.className = 'cell-story';
      s.textContent = rep.story;
      card.appendChild(s);

      if (isAllView) {
        const activeChans = [...new Set(cs.ae.map(e => e.channel).filter(Boolean))];
        if (activeChans.length) {
          const tagsRow = document.createElement('div');
          tagsRow.className = 'cell-channels';
          activeChans.forEach(ch => {
            const tag = document.createElement('span');
            tag.className = `chan-tag chan-${ch.replace(/\s+/g, '-')}`;
            tag.textContent = ch;
            tagsRow.appendChild(tag);
          });
          card.appendChild(tagsRow);
        }
      } else {
        if (cs.ae[0].channel) {
          const rowEl = document.createElement('div');
          rowEl.className = 'cell-row';
          const lbl = document.createElement('span');
          lbl.className = 'cell-label';
          lbl.textContent = 'Channel:';
          const val = document.createElement('span');
          val.className = 'cell-value';
          val.textContent = cs.ae[0].subChannel
            ? `${cs.ae[0].channel}, ${cs.ae[0].subChannel}`
            : cs.ae[0].channel;
          rowEl.appendChild(lbl);
          rowEl.appendChild(val);
          card.appendChild(rowEl);
        }
      }

      const cellCats = isAllView
        ? [...new Set(cs.ae.flatMap(e => e.categories))]
        : cs.ae[0].categories;
      if (cellCats.length) {
        const rowEl = document.createElement('div');
        rowEl.className = 'cell-row';
        const lbl = document.createElement('span');
        lbl.className = 'cell-label';
        lbl.textContent = 'Category:';
        const val = document.createElement('span');
        val.className = 'cell-value cell-value--italic';
        val.textContent = cellCats.join(', ');
        rowEl.appendChild(lbl);
        rowEl.appendChild(val);
        card.appendChild(rowEl);
      }

      // Promo section — deduplicated by date range + message
      const seen = new Set();
      const promos = cs.ae.filter(e => {
        if (!e.promo || !e.promoMsg) return false;
        const k = `${e.startDate}|${e.endDate}|${e.promoMsg}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (promos.length) {
        const section = document.createElement('div');
        section.className = 'cell-promo-section';
        const hdr = document.createElement('div');
        hdr.className = 'cell-promo-label';
        hdr.textContent = 'Promo';
        section.appendChild(hdr);
        promos.forEach(e => {
          const line = document.createElement('div');
          line.className = 'cell-promo-line';
          line.textContent = `${fmtShort(e.startDate)}–${fmtShort(e.endDate)}: ${e.promoMsg}`;
          section.appendChild(line);
        });
        card.appendChild(section);
      }

      td.appendChild(card);
      ci += span;
    }
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

/* ── Theme toggle ──────────────────────────────────────────── */
(function () {
  const saved = localStorage.getItem('gtm_theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  document.querySelectorAll('#themeToggle .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === saved);
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      document.documentElement.dataset.theme = mode;
      localStorage.setItem('gtm_theme', mode);
      document.querySelectorAll('#themeToggle .toggle-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.mode === mode)
      );
    });
  });
})();

/* ── Init ──────────────────────────────────────────────────── */
setupPanelToggles();
updateTimeframeDisplay();
renderGantt();

/* ═══════════════════════════════════════════════════════════════
   COMPETITOR AD MONITOR
   Uses Firecrawl /v1/extract to pull promotions, pricing, and
   campaigns from competitor pages on a configurable schedule.
═══════════════════════════════════════════════════════════════ */

const COMP_STORAGE_KEY = 'comp_monitor_v1';

function defaultCompState() {
  return { settings: { apiKey: '', scheduleHours: 24 }, competitors: [] };
}

let compState = (() => {
  try { return JSON.parse(localStorage.getItem(COMP_STORAGE_KEY)) || defaultCompState(); }
  catch { return defaultCompState(); }
})();

function saveCompMonitor() {
  const clean = {
    settings: compState.settings,
    competitors: compState.competitors.map(({ _loading, ...c }) => c),
  };
  localStorage.setItem(COMP_STORAGE_KEY, JSON.stringify(clean));
}

/* ── View switching ─────────────────────────────────────────── */
function switchView(view) {
  document.getElementById('viewCalendar').style.display     = view === 'calendar'    ? '' : 'none';
  document.getElementById('viewCompetitors').style.display  = view === 'competitors' ? '' : 'none';
  document.getElementById('calendarControls').style.display = view === 'calendar'    ? 'flex' : 'none';
  document.querySelectorAll('.nav-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === view)
  );
  if (view === 'competitors') {
    renderCompMonitor();
    checkCompSchedule();
  }
}

document.querySelectorAll('.nav-tab').forEach(btn =>
  btn.addEventListener('click', () => switchView(btn.dataset.view))
);

/* ── Firecrawl extraction schema ────────────────────────────── */
const FIRECRAWL_SCHEMA = {
  type: 'object',
  properties: {
    promotions: {
      type: 'array',
      description: 'Current promotions, sales, and discount offers',
      items: {
        type: 'object',
        properties: {
          title:      { type: 'string' },
          discount:   { type: 'string', description: 'e.g. "50% off", "BOGO", "Buy 2 Get 1"' },
          code:       { type: 'string', description: 'Promo or coupon code if shown' },
          validUntil: { type: 'string', description: 'Expiry or end date if mentioned' },
          categories: { type: 'string', description: 'Product categories this applies to' },
        },
        required: ['title'],
      },
    },
    pricing: {
      type: 'array',
      description: 'Pricing tiers, membership plans, or service levels',
      items: {
        type: 'object',
        properties: {
          tier:       { type: 'string' },
          price:      { type: 'string' },
          highlights: { type: 'string' },
        },
        required: ['tier', 'price'],
      },
    },
    activeCampaigns: {
      type: 'array',
      description: 'Active marketing campaigns, seasonal themes, or featured collections',
      items: { type: 'string' },
    },
    featuredCategories: {
      type: 'array',
      description: 'Product or service categories currently featured or highlighted',
      items: { type: 'string' },
    },
    summary: {
      type: 'string',
      description: 'Brief 1-2 sentence summary of the current marketing focus and positioning',
    },
  },
};

/* ── Poll for async extract job ─────────────────────────────── */
async function pollExtract(jobId, apiKey) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const res  = await fetch(`https://api.firecrawl.dev/v1/extract/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();
    if (json.status === 'completed') return json.data;
    if (json.status === 'failed')    throw new Error(json.error || 'Extraction failed');
  }
  throw new Error('Timeout: extraction took too long (60 s)');
}

/* ── Scrape one competitor ──────────────────────────────────── */
async function scrapeCompetitorById(id) {
  const comp = compState.competitors.find(c => c.id === id);
  if (!comp || comp._loading) return;

  const { apiKey } = compState.settings;
  if (!apiKey) {
    document.getElementById('compSettingsPanel').style.display = 'block';
    document.getElementById('firecrawlApiKey').focus();
    return;
  }

  comp._loading = true;
  comp.error    = null;
  renderCompMonitor();

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        urls:   [comp.url],
        prompt: 'Extract all current promotions, sales, discounts, pricing tiers, active marketing campaigns, seasonal themes, and featured product categories. Focus on competitive intelligence useful for a marketing team.',
        schema: FIRECRAWL_SCHEMA,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    let data;
    if (json.status === 'completed') {
      data = json.data;
    } else if (json.id) {
      data = await pollExtract(json.id, apiKey);
    } else {
      data = json.data || json;
    }

    comp.data        = data;
    comp.lastScraped = new Date().toISOString();
    comp.error       = null;
  } catch (e) {
    comp.error = e.message;
    comp.data  = null;
  } finally {
    comp._loading = false;
    saveCompMonitor();
    renderCompMonitor();
  }
}

/* ── Refresh all ────────────────────────────────────────────── */
async function refreshAllCompetitors() {
  const btn = document.getElementById('refreshAllBtn');
  btn.disabled    = true;
  btn.textContent = 'Refreshing…';
  try {
    for (const comp of [...compState.competitors]) {
      await scrapeCompetitorById(comp.id);
    }
  } finally {
    btn.disabled    = false;
    btn.textContent = '↻ Refresh All';
  }
}

/* ── Schedule check (runs on tab open) ──────────────────────── */
function checkCompSchedule() {
  const { scheduleHours, apiKey } = compState.settings;
  if (!scheduleHours || !apiKey) return;
  const threshold = scheduleHours * 3_600_000;
  compState.competitors.forEach(comp => {
    const stale = !comp.lastScraped ||
      Date.now() - new Date(comp.lastScraped).getTime() > threshold;
    if (stale && !comp._loading) scrapeCompetitorById(comp.id);
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Render comparison table ────────────────────────────────── */
function renderCompMonitor() {
  const empty   = document.getElementById('compEmpty');
  const wrapper = document.getElementById('compTableWrap');

  // Sync settings UI
  document.getElementById('firecrawlApiKey').value     = compState.settings.apiKey || '';
  document.getElementById('scheduleHoursSelect').value = String(compState.settings.scheduleHours);
  const sh = compState.settings.scheduleHours;
  document.getElementById('scheduleInfo').textContent  =
    sh ? `Auto-refresh: every ${sh >= 24 ? sh / 24 + 'd' : sh + 'h'}` : 'Manual refresh only';

  if (!compState.competitors.length) {
    empty.style.display   = 'flex';
    wrapper.style.display = 'none';
    return;
  }
  empty.style.display   = 'none';
  wrapper.style.display = 'block';

  wrapper.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'comp-table';

  /* ── Column headers ── */
  const thead = table.createTHead();
  const hRow  = thead.insertRow();

  const lblTh = document.createElement('th');
  lblTh.className = 'comp-row-label-th';
  hRow.appendChild(lblTh);

  compState.competitors.forEach(comp => {
    const th = document.createElement('th');
    th.className = 'comp-col-th';
    th.innerHTML = `
      <div class="comp-col-name">${escHtml(comp.name)}</div>
      <div class="comp-col-url">${escHtml(new URL(comp.url).hostname)}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'comp-col-actions';

    const refreshBtn = document.createElement('button');
    refreshBtn.className   = 'btn btn-secondary btn-sm';
    refreshBtn.textContent = comp._loading ? 'Scraping…' : '↻ Refresh';
    refreshBtn.disabled    = !!comp._loading;
    refreshBtn.addEventListener('click', () => scrapeCompetitorById(comp.id));

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-danger btn-sm';
    delBtn.textContent = '✕';
    delBtn.title       = `Remove ${comp.name}`;
    delBtn.addEventListener('click', () => {
      if (!confirm(`Remove "${escHtml(comp.name)}" from monitoring?`)) return;
      compState.competitors = compState.competitors.filter(c => c.id !== comp.id);
      saveCompMonitor();
      renderCompMonitor();
    });

    actions.appendChild(refreshBtn);
    actions.appendChild(delBtn);
    th.appendChild(actions);
    hRow.appendChild(th);
  });

  /* ── Data rows ── */
  const tbody = table.createTBody();

  function addRow(label, cellFn) {
    const tr  = tbody.insertRow();
    const lTd = tr.insertCell();
    lTd.className   = 'comp-row-label';
    lTd.textContent = label;
    compState.competitors.forEach(comp => {
      const td  = tr.insertCell();
      td.className = 'comp-cell';
      cellFn(td, comp);
    });
  }

  /* Last Updated */
  addRow('Last Updated', (td, comp) => {
    const cls = comp._loading ? 'loading' : comp.error ? 'error' : 'ok';
    const txt = comp._loading
      ? 'Scraping…'
      : comp.error
        ? `⚠ ${comp.error}`
        : timeAgo(comp.lastScraped);
    td.innerHTML = `<span class="comp-status comp-status--${cls}">${escHtml(txt)}</span>`;
  });

  /* Overview */
  addRow('Overview', (td, comp) => {
    if (comp._loading) {
      td.innerHTML = '<span class="comp-skeleton"></span><span class="comp-skeleton" style="width:65%"></span>';
      return;
    }
    td.innerHTML = comp.data?.summary
      ? `<p class="comp-summary">${escHtml(comp.data.summary)}</p>`
      : '—';
  });

  /* Active Promotions */
  addRow('Active Promotions', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton"></span><span class="comp-skeleton" style="width:80%"></span>'; return; }
    const promos = comp.data?.promotions;
    if (!promos?.length) { td.textContent = '—'; return; }
    promos.forEach(p => {
      const meta = [
        p.code       && `Code: ${p.code}`,
        p.validUntil && `Until: ${p.validUntil}`,
        p.categories,
      ].filter(Boolean);
      const card = document.createElement('div');
      card.className = 'comp-promo-card';
      card.innerHTML = `
        <div class="comp-promo-title">${escHtml(p.title)}</div>
        ${p.discount ? `<span class="comp-discount-badge">${escHtml(p.discount)}</span>` : ''}
        ${meta.length ? `<div class="comp-promo-meta">${meta.map(escHtml).join(' · ')}</div>` : ''}
      `;
      td.appendChild(card);
    });
  });

  /* Campaigns */
  addRow('Campaigns', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton"></span>'; return; }
    const list = comp.data?.activeCampaigns;
    if (!list?.length) { td.textContent = '—'; return; }
    const ul = document.createElement('ul');
    ul.className = 'comp-list';
    list.forEach(c => { const li = document.createElement('li'); li.textContent = c; ul.appendChild(li); });
    td.appendChild(ul);
  });

  /* Featured Categories */
  addRow('Featured Categories', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton" style="width:75%"></span>'; return; }
    const cats = comp.data?.featuredCategories;
    if (!cats?.length) { td.textContent = '—'; return; }
    const wrap = document.createElement('div');
    wrap.className = 'comp-tags';
    cats.forEach(c => {
      const span = document.createElement('span');
      span.className   = 'comp-cat-tag';
      span.textContent = c;
      wrap.appendChild(span);
    });
    td.appendChild(wrap);
  });

  /* Pricing / Plans */
  addRow('Pricing / Plans', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton"></span>'; return; }
    const tiers = comp.data?.pricing;
    if (!tiers?.length) { td.textContent = '—'; return; }
    tiers.forEach(tier => {
      const card = document.createElement('div');
      card.className = 'comp-tier-card';
      card.innerHTML = `
        <div class="comp-tier-name">${escHtml(tier.tier)}</div>
        <div class="comp-tier-price">${escHtml(tier.price)}</div>
        ${tier.highlights ? `<div class="comp-tier-hl">${escHtml(tier.highlights)}</div>` : ''}
      `;
      td.appendChild(card);
    });
  });

  wrapper.appendChild(table);
}

/* ── Competitor modal ───────────────────────────────────────── */
const compModalOverlay = document.getElementById('compModalOverlay');

function openAddCompetitorModal() {
  document.getElementById('compName').value = '';
  document.getElementById('compUrl').value  = '';
  compModalOverlay.classList.add('open');
  document.getElementById('compName').focus();
}

function closeAddCompetitorModal() { compModalOverlay.classList.remove('open'); }

document.getElementById('addCompetitorBtn').addEventListener('click', openAddCompetitorModal);
document.getElementById('closeCompModal').addEventListener('click', closeAddCompetitorModal);
document.getElementById('cancelCompetitorBtn').addEventListener('click', closeAddCompetitorModal);
compModalOverlay.addEventListener('click', e => { if (e.target === compModalOverlay) closeAddCompetitorModal(); });

document.getElementById('saveCompetitorBtn').addEventListener('click', () => {
  const name = document.getElementById('compName').value.trim();
  let   url  = document.getElementById('compUrl').value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); } catch { alert('Please enter a valid URL.'); return; }

  const newComp = { id: uid(), name, url, lastScraped: null, data: null, error: null };
  compState.competitors.push(newComp);
  saveCompMonitor();
  closeAddCompetitorModal();
  renderCompMonitor();
  if (compState.settings.apiKey) scrapeCompetitorById(newComp.id);
});

/* ── Settings panel ─────────────────────────────────────────── */
document.getElementById('compSettingsBtn').addEventListener('click', () => {
  const panel = document.getElementById('compSettingsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('saveCompSettings').addEventListener('click', () => {
  compState.settings.apiKey        = document.getElementById('firecrawlApiKey').value.trim();
  compState.settings.scheduleHours = Number(document.getElementById('scheduleHoursSelect').value);
  saveCompMonitor();
  renderCompMonitor();
  document.getElementById('compSettingsPanel').style.display = 'none';
});

/* ── Refresh All button ─────────────────────────────────────── */
document.getElementById('refreshAllBtn').addEventListener('click', refreshAllCompetitors);
