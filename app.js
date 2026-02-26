/* ── GTM Plan Calendar — app.js ─────────────────────────── */

const STORAGE_KEY = 'gtm_events_v1';

const CATEGORY_LABELS = {
  launch:      'Product Launch',
  marketing:   'Marketing',
  sales:       'Sales',
  content:     'Content',
  pr:          'PR & Comms',
  partnership: 'Partnership',
  milestone:   'Milestone',
};

/* ── State ─────────────────────────────────────────────────── */
let state = {
  currentYear:  new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  events:       loadEvents(),
  activeFilters: new Set(['all', 'launch', 'marketing', 'sales', 'content', 'pr', 'partnership', 'milestone']),
  editingId:     null,
  selectedDate:  null,
};

/* ── Persistence ───────────────────────────────────────────── */
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedEvents();
  } catch {
    return seedEvents();
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

/* Seed with demo GTM events so the calendar isn't empty */
function seedEvents() {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  return [
    { id: uid(), title: 'Q1 Strategy Kickoff',      category: 'milestone',   start: `${y}-${m}-01`, end: `${y}-${m}-01`, owner: 'Leadership',      notes: 'Set priorities and OKRs for the quarter.' },
    { id: uid(), title: 'Blog Post: Product Intro',  category: 'content',     start: `${y}-${m}-05`, end: `${y}-${m}-05`, owner: 'Content Team',    notes: 'SEO-optimised intro article.' },
    { id: uid(), title: 'Paid Social Campaign',      category: 'marketing',   start: `${y}-${m}-08`, end: `${y}-${m}-22`, owner: 'Paid Media',      notes: 'Facebook & Instagram retargeting.' },
    { id: uid(), title: 'Sales Deck Update',         category: 'sales',       start: `${y}-${m}-10`, end: `${y}-${m}-11`, owner: 'Sales Team',      notes: 'Refresh slide deck with new case studies.' },
    { id: uid(), title: 'Press Release',             category: 'pr',          start: `${y}-${m}-14`, end: `${y}-${m}-14`, owner: 'PR Agency',       notes: 'Coordinate with TechCrunch.' },
    { id: uid(), title: 'Partner Webinar',           category: 'partnership', start: `${y}-${m}-18`, end: `${y}-${m}-18`, owner: 'Partnerships',    notes: 'Co-host with Strategic Partner Inc.' },
    { id: uid(), title: 'v2.0 Product Launch',       category: 'launch',      start: `${y}-${m}-21`, end: `${y}-${m}-21`, owner: 'Product + Mktg', notes: 'Full launch across all channels.' },
    { id: uid(), title: 'Email Nurture Sequence',    category: 'marketing',   start: `${y}-${m}-21`, end: `${y}-${m}-28`, owner: 'CRM Team',        notes: '5-email drip campaign post-launch.' },
    { id: uid(), title: 'Monthly Review',            category: 'milestone',   start: `${y}-${m}-28`, end: `${y}-${m}-28`, owner: 'All Leads',       notes: 'Review metrics and adjust plan.' },
  ];
}

/* ── Utilities ─────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(str) {
  // Parse YYYY-MM-DD without timezone shift
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(str) {
  const d = parseDate(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(str) {
  const d = parseDate(str);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function eventsForDate(dateStr) {
  return state.events.filter(ev => {
    const start = ev.start;
    const end   = ev.end || ev.start;
    return dateStr >= start && dateStr <= end;
  });
}

function visibleEvents() {
  if (state.activeFilters.has('all') &&
      state.activeFilters.size === Object.keys(CATEGORY_LABELS).length + 1) {
    return state.events;
  }
  return state.events.filter(ev => state.activeFilters.has(ev.category));
}

/* ── DOM Refs ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const monthLabel    = $('monthLabel');
const calGrid       = document.querySelector('.calendar-grid');
const prevBtn       = $('prevMonth');
const nextBtn       = $('nextMonth');
const todayBtn      = $('todayBtn');
const addEventBtn   = $('addEventBtn');
const modalOverlay  = $('modalOverlay');
const modalTitle    = $('modalTitle');
const modalClose    = $('modalClose');
const cancelBtn     = $('cancelBtn');
const saveEventBtn  = $('saveEventBtn');
const deleteEventBtn= $('deleteEventBtn');
const eventTitle    = $('eventTitle');
const eventStart    = $('eventStart');
const eventEnd      = $('eventEnd');
const eventCategory = $('eventCategory');
const eventOwner    = $('eventOwner');
const eventNotes    = $('eventNotes');
const upcomingList  = $('upcomingList');
const dayPanelOverlay = $('dayPanelOverlay');
const dayPanelTitle = $('dayPanelTitle');
const dayPanelBody  = $('dayPanelBody');
const dayPanelClose = $('dayPanelClose');
const dayPanelAddBtn= $('dayPanelAddBtn');

/* ── Render Calendar ───────────────────────────────────────── */
function renderCalendar() {
  const { currentYear: yr, currentMonth: mo } = state;

  monthLabel.textContent = new Date(yr, mo, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });

  // Remove existing day cells (keep headers)
  const headers = calGrid.querySelectorAll('.day-header');
  calGrid.innerHTML = '';
  headers.forEach(h => calGrid.appendChild(h));

  const firstDay  = new Date(yr, mo, 1).getDay();
  const daysInMo  = new Date(yr, mo + 1, 0).getDate();
  const daysInPrev= new Date(yr, mo, 0).getDate();
  const todayStr  = isoDate(new Date());
  const visible   = new Set(visibleEvents().map(e => e.id));

  // Cells: prev month overflow
  for (let i = 0; i < firstDay; i++) {
    const day = daysInPrev - firstDay + 1 + i;
    const dateStr = isoDate(new Date(yr, mo - 1, day));
    calGrid.appendChild(buildCell(day, dateStr, true, todayStr, visible));
  }

  // Current month
  for (let d = 1; d <= daysInMo; d++) {
    const dateStr = isoDate(new Date(yr, mo, d));
    calGrid.appendChild(buildCell(d, dateStr, false, todayStr, visible));
  }

  // Next month overflow
  const total = firstDay + daysInMo;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= remaining; d++) {
    const dateStr = isoDate(new Date(yr, mo + 1, d));
    calGrid.appendChild(buildCell(d, dateStr, true, todayStr, visible));
  }

  renderUpcoming();
}

function buildCell(dayNum, dateStr, otherMonth, todayStr, visibleIds) {
  const cell = document.createElement('div');
  cell.className = 'day-cell' +
    (otherMonth ? ' other-month' : '') +
    (dateStr === todayStr ? ' today' : '');
  cell.dataset.date = dateStr;

  const num = document.createElement('div');
  num.className = 'day-num';
  num.textContent = dayNum;
  cell.appendChild(num);

  const dayEvents = eventsForDate(dateStr).filter(e => visibleIds.has(e.id));
  const MAX_CHIPS = 3;
  dayEvents.slice(0, MAX_CHIPS).forEach(ev => {
    const chip = document.createElement('div');
    chip.className = `event-chip cat-${ev.category}`;
    chip.textContent = ev.title;
    chip.dataset.id = ev.id;
    chip.addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(ev.id);
    });
    cell.appendChild(chip);
  });

  if (dayEvents.length > MAX_CHIPS) {
    const more = document.createElement('div');
    more.className = 'event-more';
    more.textContent = `+${dayEvents.length - MAX_CHIPS} more`;
    cell.appendChild(more);
  }

  cell.addEventListener('click', () => openDayPanel(dateStr));
  return cell;
}

/* ── Upcoming Sidebar ──────────────────────────────────────── */
function renderUpcoming() {
  const todayStr = isoDate(new Date());
  const upcoming = state.events
    .filter(ev => ev.start >= todayStr)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 6);

  upcomingList.innerHTML = '';
  if (!upcoming.length) {
    upcomingList.innerHTML = '<div class="upcoming-empty">No upcoming events</div>';
    return;
  }
  upcoming.forEach(ev => {
    const item = document.createElement('div');
    item.className = 'upcoming-item';
    item.style.borderLeftColor = getCatColor(ev.category);
    item.innerHTML = `
      <div class="upcoming-item-title">${escHtml(ev.title)}</div>
      <div class="upcoming-item-date">${formatDateShort(ev.start)}${ev.end && ev.end !== ev.start ? ' – ' + formatDateShort(ev.end) : ''}</div>
    `;
    item.addEventListener('click', () => openEditModal(ev.id));
    upcomingList.appendChild(item);
  });
}

/* ── Day Panel ─────────────────────────────────────────────── */
function openDayPanel(dateStr) {
  state.selectedDate = dateStr;
  dayPanelTitle.textContent = formatDateFull(dateStr);

  const events = eventsForDate(dateStr);
  dayPanelBody.innerHTML = '';

  if (!events.length) {
    dayPanelBody.innerHTML = '<div class="no-events">No events scheduled</div>';
  } else {
    events.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'day-event-card';
      card.style.borderLeftColor = getCatColor(ev.category);
      card.innerHTML = `
        <div class="day-event-card-title">${escHtml(ev.title)}</div>
        <div class="day-event-card-meta">${CATEGORY_LABELS[ev.category] || ev.category}${ev.owner ? ' · ' + escHtml(ev.owner) : ''}</div>
      `;
      card.addEventListener('click', () => openEditModal(ev.id));
      dayPanelBody.appendChild(card);
    });
  }

  dayPanelOverlay.classList.add('open');
}

function closeDayPanel() {
  dayPanelOverlay.classList.remove('open');
  state.selectedDate = null;
}

dayPanelClose.addEventListener('click', closeDayPanel);
dayPanelOverlay.addEventListener('click', e => {
  if (e.target === dayPanelOverlay) closeDayPanel();
});
dayPanelAddBtn.addEventListener('click', () => {
  const date = state.selectedDate;
  closeDayPanel();
  openAddModal(date);
});

/* ── Modal ─────────────────────────────────────────────────── */
function openAddModal(prefillDate) {
  state.editingId = null;
  modalTitle.textContent = 'Add Event';
  deleteEventBtn.style.display = 'none';
  clearForm();
  if (prefillDate) {
    eventStart.value = prefillDate;
    eventEnd.value   = prefillDate;
  }
  modalOverlay.classList.add('open');
  eventTitle.focus();
}

function openEditModal(id) {
  const ev = state.events.find(e => e.id === id);
  if (!ev) return;
  state.editingId = id;
  modalTitle.textContent = 'Edit Event';
  deleteEventBtn.style.display = 'inline-flex';
  eventTitle.value    = ev.title;
  eventStart.value    = ev.start;
  eventEnd.value      = ev.end || '';
  eventCategory.value = ev.category;
  eventOwner.value    = ev.owner || '';
  eventNotes.value    = ev.notes || '';
  modalOverlay.classList.add('open');
  eventTitle.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  state.editingId = null;
}

function clearForm() {
  eventTitle.value    = '';
  eventStart.value    = '';
  eventEnd.value      = '';
  eventCategory.value = 'launch';
  eventOwner.value    = '';
  eventNotes.value    = '';
}

function validateForm() {
  if (!eventTitle.value.trim()) { shake(eventTitle); return false; }
  if (!eventStart.value)        { shake(eventStart); return false; }
  if (eventEnd.value && eventEnd.value < eventStart.value) {
    shake(eventEnd);
    return false;
  }
  return true;
}

function shake(el) {
  el.style.borderColor = 'var(--c-launch)';
  el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
}

saveEventBtn.addEventListener('click', () => {
  if (!validateForm()) return;

  const ev = {
    id:       state.editingId || uid(),
    title:    eventTitle.value.trim(),
    start:    eventStart.value,
    end:      eventEnd.value || eventStart.value,
    category: eventCategory.value,
    owner:    eventOwner.value.trim(),
    notes:    eventNotes.value.trim(),
  };

  if (state.editingId) {
    const idx = state.events.findIndex(e => e.id === state.editingId);
    state.events[idx] = ev;
  } else {
    state.events.push(ev);
  }

  saveEvents();
  closeModal();
  renderCalendar();
});

deleteEventBtn.addEventListener('click', () => {
  if (!state.editingId) return;
  state.events = state.events.filter(e => e.id !== state.editingId);
  saveEvents();
  closeModal();
  renderCalendar();
});

addEventBtn.addEventListener('click', () => openAddModal(null));
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

/* ── Navigation ────────────────────────────────────────────── */
prevBtn.addEventListener('click', () => {
  state.currentMonth--;
  if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  state.currentMonth++;
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  renderCalendar();
});

todayBtn.addEventListener('click', () => {
  state.currentYear  = new Date().getFullYear();
  state.currentMonth = new Date().getMonth();
  renderCalendar();
});

/* ── Filters ───────────────────────────────────────────────── */
document.querySelectorAll('.filter-check').forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.value === 'all') {
      const all = cb.checked;
      document.querySelectorAll('.filter-check:not([value="all"])').forEach(c => {
        c.checked = all;
        all ? state.activeFilters.add(c.value) : state.activeFilters.delete(c.value);
      });
      all ? state.activeFilters.add('all') : state.activeFilters.delete('all');
    } else {
      cb.checked ? state.activeFilters.add(cb.value) : state.activeFilters.delete(cb.value);
      const allCheck = document.querySelector('.filter-check[value="all"]');
      const allCats  = [...document.querySelectorAll('.filter-check:not([value="all"])')];
      const allOn    = allCats.every(c => c.checked);
      allCheck.checked = allOn;
      allOn ? state.activeFilters.add('all') : state.activeFilters.delete('all');
    }
    renderCalendar();
  });
});

/* ── Helpers ───────────────────────────────────────────────── */
function getCatColor(cat) {
  const map = {
    launch:      '#f45d6e',
    marketing:   '#f9a825',
    sales:       '#26c6da',
    content:     '#66bb6a',
    pr:          '#ab47bc',
    partnership: '#ff7043',
    milestone:   '#5b6ef5',
  };
  return map[cat] || '#5b6ef5';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Keyboard shortcuts ────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('open'))    closeModal();
    if (dayPanelOverlay.classList.contains('open')) closeDayPanel();
  }
  if ((e.key === 'ArrowLeft')  && !modalOverlay.classList.contains('open')) prevBtn.click();
  if ((e.key === 'ArrowRight') && !modalOverlay.classList.contains('open')) nextBtn.click();
});

/* ── Init ──────────────────────────────────────────────────── */
renderCalendar();
