/* ============================================
   NUMERATES — Central Data Configuration
   Edit only this file to update data sources
   ============================================ */

const SHEETS = {
  events:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Lp3PptEdyJHbvP_1IVLVPf9Rmm9Rl3bQv_CQYzgFSOWqXnUAw6hkiPwcBidFTD8eIQ3Oh5f_4LXA/pub?gid=0&single=true&output=csv',
  alumni:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtneEGfZi2QObWh11TOYhCl-0YRbBvFSqdio6o1Wv2gMY2RGG7w1zt3ATmJrUMxwCYt84Qo3FlOX7M/pub?output=csv',
  team:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSnGSQnr5hBNgmh2fMM9YKvZzjoO7sbBE-4cmYexkfE65ialfZQywhZS36uSYDh1JFcxG9rCKS2xQ/pub?output=csv',
  gallery: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSz5rzgk-6m25VC8kXW5_IK1Rmso7EKlvGOco0tmfHh3R8h-Hhs5o4r02VaUNrz9cYI_IWaR78woDDe/pub?output=csv',
};

/* ── Google Drive URL converter ── */
function driveUrl(raw) {
  if (!raw || !raw.trim()) return '';

  const url = raw.trim();

  if (url.includes('lh3.googleusercontent.com')) return url;
  if (url.includes('uc?export=view')) return url;

  const openMatch = url.match(/open\?id=([^&\s,]+)/);
  if (openMatch)
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;

  const fileMatch = url.match(/\/file\/d\/([^\/\s]+)/);
  if (fileMatch)
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;

  const dMatch = url.match(/\/d\/([^\/\s\n"]+)/);
  if (dMatch)
    return `https://drive.google.com/uc?export=view&id=${dMatch[1]}`;

  return url;
}

/* ── CSV Parser ── */
function parseCSV(text) {

  const lines = text.trim().split('\n');

  const headers = parseCSVLine(lines[0]).map(h =>
    h.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
  );

  return lines.slice(1).map(line => {

    const values = parseCSVLine(line);

    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').trim();
    });

    return obj;

  }).filter(row =>
    Object.values(row).some(v => v !== '')
  );
}

function parseCSVLine(line) {

  const result = [];

  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {

    const ch = line[i];

    if (ch === '"') {

      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }

    } else if (ch === ',' && !inQuotes) {

      result.push(current);
      current = '';

    } else {

      current += ch;

    }
  }

  result.push(current);

  return result;
}

/* ── Fetch Sheet ── */
async function fetchSheet(url) {

  const res = await fetch(url);

  if (!res.ok)
    throw new Error('Sheet fetch failed');

  const text = await res.text();

  return parseCSV(text);
}

/* ── Time Helpers ── */

function nowIST() {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata'
    })
  );
}

function parseDate(str) {

  if (!str) return null;

  const d = new Date(str.trim());

  if (isNaN(d.getTime()))
    return null;

  return d;
}

function formatDateShort(str) {

  const d = parseDate(str);

  if (!d) return '';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/* ============================================
   EVENT STATUS
   ============================================ */

function getEventStatus(event) {

  const now = nowIST();

  const start = parseDate(event.startdate);

  const end = parseDate(event.enddate);

  if (!start && !end)
    return 'soon';

  if (end) {

    const endDay = new Date(end);

    endDay.setHours(23,59,59,999);

    if (now > endDay)
      return 'past';
  }

  if (start && now >= start)
    return 'live';

  return 'upcoming';
}

/* ============================================
   REGISTRATION STATUS
   ============================================ */

function isRegistrationOpen(event) {

  const now = nowIST();

  // No registration link
  const link = (event.registerationlink || '').trim();

  if (!link)
    return false;

  // No registration deadline
  const deadline = parseDate(event.registrationdeadline);

  if (!deadline)
    return false;

  deadline.setHours(23,59,59,999);

  return now <= deadline;
}

/* ============================================
   Gallery
   ============================================ */

function hasGallery(event) {

  return !!(
    event.gallerylink &&
    event.gallerylink.trim()
  );
}

/* ============================================
   Fix URL
   ============================================ */

function fixUrl(url) {

  if (!url)
    return '';

  url = url.trim();

  if (!url.startsWith('http'))
    url = 'https://' + url;

  return url;
}