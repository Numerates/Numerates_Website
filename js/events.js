/* ============================================
   NUMERATES — Events Page JavaScript
   Reads from Google Sheet, auto lifecycle
   ============================================ */

const FILTER_TABS   = document.querySelectorAll('.filter-tab');
const EVENTS_WRAP   = document.getElementById('eventsWrap');
const EMPTY_STATE   = document.getElementById('emptyState');
const LOADING_STATE = document.getElementById('loadingState');

let allEvents = [];
let activeFilter = 'all';

// ── Status label & badge HTML ──
function statusBadge(event, status) {

  if (status === 'live')
    return `<span class="event-status live">🔴 Live Now</span>`;

  if (status === 'past')
    return `<span class="event-status past">Completed</span>`;

  if (status === 'soon')
    return `<span class="event-status soon">Coming Soon</span>`;

  if (status === 'upcoming') {
    if (isRegistrationOpen(event))
      return `<span class="event-status upcoming">Registrations Open</span>`;

    return `<span class="event-status soon">Upcoming Event</span>`;
  }

  return '';
}

// ── Parse topics ──
function topicTags(str, dim = false) {
  if (!str) return '';
  return str.split(',').map(t => t.trim()).filter(Boolean)
    .map(t => `<span class="event-topic${dim ? ' dim' : ''}">${t}</span>`).join('');
}

// ── Date box ──
function dateBox(event) {
  const start = parseDate(event.startdate);
  const end   = parseDate(event.enddate);
  if (!start) {
    return `<div class="event-date-box">
      <span class="month">TBA</span>
      <span class="day" style="font-size:18px;color:var(--text-muted);padding:6px 0;">?</span>
      <span class="range">Stay tuned</span>
    </div>`;
  }
  const month = start.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
  const day   = start.getDate();
  const range = end && end.getDate() !== start.getDate()
    ? `– ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
    : '';
  return `<div class="event-date-box">
    <span class="month">${month}</span>
    <span class="day">${day}</span>
    ${range ? `<span class="range">${range}</span>` : ''}
  </div>`;
}

// ── Action button ──
function actionButton(event, status) {
  const regOpen = isRegistrationOpen(event);
  const link    = (event.registerationlink || '').trim();

  if (status === 'past') {
    if (hasGallery(event)) {
      return `<a href="${event.gallerylink.trim()}" class="btn-outline" style="white-space:nowrap;">View Gallery <i class="fa-solid fa-images"></i></a>`;
    }
    return `<span class="btn-disabled"><i class="fa-solid fa-check"></i> Completed</span>`;
  }

  if (status === 'live') {
    if (regOpen && link) return `<a href="${link}" class="btn-primary" style="white-space:nowrap;">Register Now <i class="fa-solid fa-arrow-right"></i></a>`;
    return `<span class="btn-disabled">Registrations Closed</span>`;
  }

  if (status === 'upcoming') {
    if (regOpen && link) return `<a href="${link}" class="btn-primary" style="white-space:nowrap;">Register Now <i class="fa-solid fa-arrow-right"></i></a>`;
    return `<span class="btn-disabled">Registrations Closed</span>`;
  }

  // soon
  return `<span class="btn-disabled"><i class="fa-regular fa-clock"></i> Coming Soon</span>`;
}

// ── Build one card ──
function buildCard(event, index) {
  const status = getEventStatus(event);
  const isDim  = (status === 'soon' || status === 'past');

  return `
    <div class="event-card ${status === 'soon' ? 'soon-card' : ''} ${status === 'past' ? 'past-card' : ''} fade-up"
         data-category="${status}" style="animation-delay:${index * 0.08}s;">
      <div class="event-card-inner">
        <div class="event-card-left">
          <div class="event-card-meta">
            ${statusBadge(event, status)}
            <span class="event-type-badge">${event.type || 'Event'}</span>
          </div>
          <h3>${event.name}</h3>
          <p class="event-desc">${event.description || ''}</p>
          <div class="event-info-row">
            ${event.startdate ? `<div class="event-info-item"><i class="fa-regular fa-calendar"></i><span>${formatDateShort(event.startdate)}${event.enddate && event.enddate !== event.startdate ? ' – ' + formatDateShort(event.enddate) : ''}</span></div>` : '<div class="event-info-item"><i class="fa-regular fa-calendar"></i><span>Date to be announced</span></div>'}
            ${event.timings ? `<div class="event-info-item"><i class="fa-regular fa-clock"></i><span>${event.timings}</span></div>` : ''}
            ${event.venue ? `<div class="event-info-item"><i class="fa-solid fa-location-dot"></i><span>${event.venue}</span></div>` : ''}
          </div>
          ${event.topics ? `<div class="event-topics">${topicTags(event.topics, isDim)}</div>` : ''}
        </div>
        <div class="event-card-right">
          ${dateBox(event)}
          ${actionButton(event, status)}
        </div>
      </div>
    </div>`;
}

// ── Render events ──
function renderEvents(filter) {
  activeFilter = filter;
  EVENTS_WRAP.innerHTML = '';

  const groups = { live: [], soon: [], past: [] };
  allEvents.forEach(e => {
    const s = getEventStatus(e);
    if (groups[s]) groups[s].push(e);
  });

  const order = filter === 'all'
    ? ['live','soon', 'past']
    : [filter];

  const labels = {
    live:     '🔴 Happening Now',
    soon:     'Coming Soon',
    past:     'Past Events',
  };

  let totalShown = 0;
  order.forEach(key => {
    const items = groups[key] || [];
    if (!items.length) return;
    totalShown += items.length;

    const group = document.createElement('div');
    group.className = 'events-group';
    group.innerHTML = `<div class="group-label"><h2>${labels[key]}</h2><div class="line"></div></div>`;
    items.forEach((ev, i) => { group.innerHTML += buildCard(ev, i); });
    EVENTS_WRAP.appendChild(group);
  });

  EMPTY_STATE.style.display = totalShown === 0 ? 'block' : 'none';
  initFadeUp();
}

// ── Filter tabs ──
FILTER_TABS.forEach(tab => {
  tab.addEventListener('click', () => {
    FILTER_TABS.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderEvents(tab.getAttribute('data-filter'));
  });
});

// ── Init ──
async function initEvents() {
  try {
    allEvents = await fetchSheet(SHEETS.events);
    LOADING_STATE.style.display = 'none';
    renderEvents('all');
  } catch (e) {
    LOADING_STATE.innerHTML = '<p style="color:var(--red);">Failed to load events. Please refresh.</p>';
  }
}

initEvents();