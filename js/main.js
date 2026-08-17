/* ============================================
   NUMERATES — Main JavaScript
   Shared across all pages
   ============================================ */

// ── Mobile Nav ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

// ── Navbar shadow on scroll ──
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 32px rgba(0,0,0,0.4)' : 'none';
  });
}

// ── Fade-up scroll animations ──
function initFadeUp() {
  const fadeEls = document.querySelectorAll('.fade-up');
  if (!fadeEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 90);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  fadeEls.forEach(el => obs.observe(el));
}
initFadeUp();

// ── Stat counter animation ──
const statNums = document.querySelectorAll('.stat-number[data-count]');
if (statNums.length) {
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const step = Math.ceil(target / 45);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 28);
        countObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => countObs.observe(el));
}

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Active nav link ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ── Format date short ──
function formatDateShort(str) {
  if (!str) return '';
  const d = parseDate(str);
  if (!d) return str;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Dynamic Announcement Bar ──
async function loadAnnouncement() {
  const bar = document.getElementById('announcementBar');
  if (!bar) return;

  try {
    const events = await fetchSheet(SHEETS.events);

    const live = events.filter(e => getEventStatus(e) === 'live');

const upcoming = events.filter(e =>
    getEventStatus(e) === 'upcoming' &&
    isRegistrationOpen(e) &&
    (e.registerationlink || '').trim() !== ''
);

    let chosen = null;
    if (live.length) {
      chosen = live[0];
    } else if (upcoming.length) {
      chosen = upcoming.sort((a, b) => {
        const da = parseDate(a.startdate);
        const db = parseDate(b.startdate);
        if (!da) return 1; if (!db) return -1;
        return da - db;
      })[0];
    }

    if (!chosen) {
      bar.innerHTML = `<div class="dot"></div><span>Join <strong>Numerates</strong> — MIT-WPU's math and tech club. Be part of the next event!</span><a href="join.html">Join us →</a>`;
      return;
    }

    const status  = getEventStatus(chosen);
    const regOpen = isRegistrationOpen(chosen);
    const label = status === 'live'
    ? '🔴 Live now'
    : '📅 Upcoming Event';

    const link = 'events.html';

    const linkTxt = 'View Events →';

    bar.innerHTML = `<div class="dot"></div><span>${label} — <strong>${chosen.name}</strong>${chosen.startdate ? ' · ' + formatDateShort(chosen.startdate) : ''}</span><a href="${link}">${linkTxt}</a>`;
  } catch (e) {
    bar.innerHTML = `<div class="dot"></div><span>Join <strong>Numerates</strong> — MIT-WPU's math and tech club!</span><a href="join.html">Join us →</a>`;
  }
}

if (typeof fetchSheet !== 'undefined') { loadAnnouncement(); }