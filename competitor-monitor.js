/* ── Competitor Ad Monitor ───────────────────────────────────
   Scrapes competitor pages via Firecrawl's /v1/extract API and
   displays a side-by-side comparison table of promotions,
   pricing, campaigns, and featured categories.

   Data stored in localStorage under STORAGE_KEY.
─────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'comp_monitor_v1';

/* ── State ──────────────────────────────────────────────────── */
let state = loadState();

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState(); }
  catch { return defaultState(); }
}

function defaultState() {
  return {
    settings:    { apiKey: '', scheduleHours: 24 },
    competitors: [],
  };
}

function saveState() {
  const clean = {
    settings:    state.settings,
    competitors: state.competitors.map(({ _loading, ...c }) => c),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

/* ── Firecrawl extraction schema ────────────────────────────── */
const SCHEMA = {
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

/* ── Firecrawl API calls ─────────────────────────────────────── */
async function pollExtract(jobId, apiKey) {
  for (let i = 0; i < 30; i++) {
    await delay(2000);
    const res  = await fetch(`https://api.firecrawl.dev/v1/extract/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();
    if (json.status === 'completed') return json.data;
    if (json.status === 'failed')    throw new Error(json.error || 'Extraction failed');
  }
  throw new Error('Timeout — extraction took longer than 60 s');
}

async function scrapeOne(id) {
  const comp = state.competitors.find(c => c.id === id);
  if (!comp || comp._loading) return;

  const { apiKey } = state.settings;
  if (!apiKey) {
    openSettings();
    return;
  }

  comp._loading = true;
  comp.error    = null;
  render();

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
        schema: SCHEMA,
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
    saveState();
    render();
  }
}

async function scrapeAll() {
  const btn = document.getElementById('refreshAllBtn');
  btn.disabled    = true;
  btn.textContent = 'Refreshing…';
  try {
    for (const comp of [...state.competitors]) {
      await scrapeOne(comp.id);
    }
  } finally {
    btn.disabled    = false;
    btn.textContent = '↻ Refresh All';
  }
}

function checkSchedule() {
  const { scheduleHours, apiKey } = state.settings;
  if (!scheduleHours || !apiKey) return;
  const threshold = scheduleHours * 3_600_000;
  state.competitors.forEach(comp => {
    const stale = !comp.lastScraped ||
      Date.now() - new Date(comp.lastScraped).getTime() > threshold;
    if (stale && !comp._loading) scrapeOne(comp.id);
  });
}

/* ── Render ─────────────────────────────────────────────────── */
function render() {
  const empty   = document.getElementById('emptyState');
  const wrapper = document.getElementById('tableWrap');
  const bar     = document.getElementById('statusBar');

  // Sync settings UI
  document.getElementById('firecrawlApiKey').value     = state.settings.apiKey || '';
  document.getElementById('scheduleHoursSelect').value = String(state.settings.scheduleHours);

  const sh = state.settings.scheduleHours;
  const schedLabel = sh
    ? `Auto-refresh: every ${sh >= 24 ? sh / 24 + 'd' : sh + 'h'} — data refreshes automatically when stale`
    : 'Manual refresh only — click ↻ Refresh All or per-competitor refresh to update';
  document.getElementById('scheduleInfo').textContent = schedLabel;

  if (!state.competitors.length) {
    empty.style.display   = 'flex';
    wrapper.style.display = 'none';
    bar.style.display     = 'none';
    return;
  }

  empty.style.display   = 'none';
  wrapper.style.display = 'block';
  bar.style.display     = 'flex';

  wrapper.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'comp-table';

  /* ── Column headers ── */
  const thead = table.createTHead();
  const hRow  = thead.insertRow();

  const lblTh = document.createElement('th');
  lblTh.className = 'comp-row-label-th';
  hRow.appendChild(lblTh);

  state.competitors.forEach(comp => {
    const th = document.createElement('th');
    th.className = 'comp-col-th';
    th.innerHTML = `
      <div class="comp-col-name">${esc(comp.name)}</div>
      <div class="comp-col-url">${esc(new URL(comp.url).hostname)}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'comp-col-actions';

    const refreshBtn = document.createElement('button');
    refreshBtn.className   = 'btn btn-secondary btn-sm';
    refreshBtn.textContent = comp._loading ? 'Scraping…' : '↻ Refresh';
    refreshBtn.disabled    = !!comp._loading;
    refreshBtn.addEventListener('click', () => scrapeOne(comp.id));

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-danger btn-sm';
    delBtn.textContent = '✕';
    delBtn.title       = `Remove ${comp.name}`;
    delBtn.addEventListener('click', () => {
      if (!confirm(`Remove "${comp.name}" from monitoring?`)) return;
      state.competitors = state.competitors.filter(c => c.id !== comp.id);
      saveState();
      render();
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
    state.competitors.forEach(comp => {
      const td = tr.insertCell();
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
    td.innerHTML = `<span class="comp-status comp-status--${cls}">${esc(txt)}</span>`;
  });

  /* Overview */
  addRow('Overview', (td, comp) => {
    if (comp._loading) {
      td.innerHTML = '<span class="comp-skeleton"></span><span class="comp-skeleton" style="width:65%"></span>';
      return;
    }
    td.innerHTML = comp.data?.summary
      ? `<p class="comp-summary">${esc(comp.data.summary)}</p>`
      : '<span style="color:var(--text-muted)">—</span>';
  });

  /* Active Promotions */
  addRow('Active Promotions', (td, comp) => {
    if (comp._loading) {
      td.innerHTML = '<span class="comp-skeleton"></span><span class="comp-skeleton" style="width:80%"></span>';
      return;
    }
    const promos = comp.data?.promotions;
    if (!promos?.length) { td.innerHTML = '<span style="color:var(--text-muted)">—</span>'; return; }
    promos.forEach(p => {
      const meta = [
        p.code       && `Code: ${p.code}`,
        p.validUntil && `Until: ${p.validUntil}`,
        p.categories,
      ].filter(Boolean);
      const card = document.createElement('div');
      card.className = 'comp-promo-card';
      card.innerHTML = `
        <div class="comp-promo-title">${esc(p.title)}</div>
        ${p.discount ? `<span class="comp-discount-badge">${esc(p.discount)}</span>` : ''}
        ${meta.length ? `<div class="comp-promo-meta">${meta.map(esc).join(' · ')}</div>` : ''}
      `;
      td.appendChild(card);
    });
  });

  /* Campaigns */
  addRow('Campaigns', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton"></span>'; return; }
    const list = comp.data?.activeCampaigns;
    if (!list?.length) { td.innerHTML = '<span style="color:var(--text-muted)">—</span>'; return; }
    const ul = document.createElement('ul');
    ul.className = 'comp-list';
    list.forEach(c => { const li = document.createElement('li'); li.textContent = c; ul.appendChild(li); });
    td.appendChild(ul);
  });

  /* Featured Categories */
  addRow('Featured Categories', (td, comp) => {
    if (comp._loading) { td.innerHTML = '<span class="comp-skeleton" style="width:75%"></span>'; return; }
    const cats = comp.data?.featuredCategories;
    if (!cats?.length) { td.innerHTML = '<span style="color:var(--text-muted)">—</span>'; return; }
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
    if (!tiers?.length) { td.innerHTML = '<span style="color:var(--text-muted)">—</span>'; return; }
    tiers.forEach(tier => {
      const card = document.createElement('div');
      card.className = 'comp-tier-card';
      card.innerHTML = `
        <div class="comp-tier-name">${esc(tier.tier)}</div>
        <div class="comp-tier-price">${esc(tier.price)}</div>
        ${tier.highlights ? `<div class="comp-tier-hl">${esc(tier.highlights)}</div>` : ''}
      `;
      td.appendChild(card);
    });
  });

  wrapper.appendChild(table);
}

/* ── Settings panel ─────────────────────────────────────────── */
function openSettings() {
  document.getElementById('settingsPanel').style.display = 'block';
  document.getElementById('firecrawlApiKey').focus();
}

document.getElementById('compSettingsBtn').addEventListener('click', () => {
  const panel = document.getElementById('settingsPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('saveSettings').addEventListener('click', () => {
  state.settings.apiKey        = document.getElementById('firecrawlApiKey').value.trim();
  state.settings.scheduleHours = Number(document.getElementById('scheduleHoursSelect').value);
  saveState();
  render();
  document.getElementById('settingsPanel').style.display = 'none';
});

/* ── Add Competitor modal ───────────────────────────────────── */
const addModal = document.getElementById('addModal');

function openAddModal() {
  document.getElementById('compName').value = '';
  document.getElementById('compUrl').value  = '';
  addModal.classList.add('open');
  document.getElementById('compName').focus();
}

function closeAddModal() { addModal.classList.remove('open'); }

document.getElementById('addCompetitorBtn').addEventListener('click', openAddModal);
document.getElementById('closeAddModal').addEventListener('click', closeAddModal);
document.getElementById('cancelAdd').addEventListener('click', closeAddModal);
addModal.addEventListener('click', e => { if (e.target === addModal) closeAddModal(); });

document.getElementById('saveAdd').addEventListener('click', () => {
  const name = document.getElementById('compName').value.trim();
  let   url  = document.getElementById('compUrl').value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); } catch { alert('Please enter a valid URL.'); return; }

  const newComp = { id: uid(), name, url, lastScraped: null, data: null, error: null };
  state.competitors.push(newComp);
  saveState();
  closeAddModal();
  render();
  if (state.settings.apiKey) scrapeOne(newComp.id);
});

/* ── Refresh All ────────────────────────────────────────────── */
document.getElementById('refreshAllBtn').addEventListener('click', scrapeAll);

/* ── Keyboard shortcuts ─────────────────────────────────────── */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAddModal(); });

/* ── Utilities ──────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Init ───────────────────────────────────────────────────── */
render();
checkSchedule();
