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

/* ── Google Drive URL converter ──
   Converts any Drive sharing link to a direct embeddable image URL */
function driveUrl(raw) {
  if (!raw || !raw.trim()) return '';
  const url = raw.trim();
  // Already a direct lh3 link
  if (url.includes('lh3.googleusercontent.com')) return url;
  // uc?export=view format
  if (url.includes('uc?export=view')) return url;
  // open?id= format
  const openMatch = url.match(/open\?id=([^&\s,]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  // /file/d/ID/view format
  const fileMatch = url.match(/\/file\/d\/([^\/\s]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  // /d/ID format (lh3 style)
  const dMatch = url.match(/\/d\/([^\/\s\n"]+)/);
  if (dMatch) return `https://drive.google.com/uc?export=view&id=${dMatch[1]}`;
  return url;
}

/* ── CSV Parser — handles quoted fields with commas ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const rawHeaders = lines[0];
  const headers = parseCSVLine(rawHeaders).map(h =>
    h.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
  );

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || '').trim(); });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ''));
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
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
  if (!res.ok) throw new Error('Sheet fetch failed: ' + url);
  const text = await res.text();
  return parseCSV(text);
}

/* ── IST Date Helpers ── */
function nowIST() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function parseDate(str) {
  if (!str) return null;
  const cleaned = str.replace(/\s*-\s*/g, '-').trim();
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateShort(str) {
  const d = parseDate(str);
  if (!d) return str || '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Event Status Engine (IST-aware) ── */
function getEventStatus(event) {
  const now      = nowIST();
  const start    = parseDate(event.startdate);
  const end      = parseDate(event.enddate);

  if (!start && !end) return 'soon';
  if (end) {
    const endOfDay = new Date(end); endOfDay.setHours(23, 59, 59);
    if (now > endOfDay) return 'past';
  }
  if (start && now >= start) return 'live';
  return 'upcoming';
}

function isRegistrationOpen(event) {
  const now      = nowIST();
  const deadline = parseDate(event.registrationdeadline);
  const end      = parseDate(event.enddate);
  if (deadline) { const dl = new Date(deadline); dl.setHours(23,59,59); if (now > dl) return false; }
  if (end)      { const ed = new Date(end);      ed.setHours(23,59,59); if (now > ed) return false; }
  return true;
}

function hasGallery(event) {
  return !!(event.gallerylink && event.gallerylink.trim());
}

/* ── Ensure LinkedIn URL is absolute ── */
function fixUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url.startsWith('http')) return 'https://' + url;
  return url;
}