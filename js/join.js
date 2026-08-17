/* ============================================
   NUMERATES — Join Us JavaScript
   Club membership form → Google Sheets
   ============================================ */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn2l5ibuL0-l6zs-FqH495Bro2RZJ9zCe_dog17N8M52JheosFL7_jNsFXeB-7ji2X/exec';

const form       = document.getElementById('joinForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const spinner    = document.getElementById('spinner');
const successMsg = document.getElementById('successMsg');
const errorMsg   = document.getElementById('errorMsg');

if (!form) { console.warn('Join form not found'); }

// ── Field error helpers ──
function showError(input, message) {
  input.style.borderColor = 'var(--red)';
  let err = input.parentNode.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    err.style.cssText = 'color:var(--red);font-size:12px;margin-top:5px;display:block;';
    input.parentNode.appendChild(err);
  }
  err.textContent = message;
}

function clearError(input) {
  input.style.borderColor = '';
  const err = input.parentNode.querySelector('.field-error');
  if (err) err.remove();
}

function validateForm() {
  let valid = true;

  const fields = [
    { id: 'name',       msg: 'Please enter your full name.' },
    { id: 'email',      msg: 'Please enter your email address.' },
    { id: 'whatsapp',   msg: 'Please enter your WhatsApp number.' },
    { id: 'department', msg: 'Please enter your department.' },
    { id: 'whyjoin',    msg: 'Please tell us why you want to join.' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    clearError(el);
    if (!el.value.trim()) { showError(el, f.msg); valid = false; }
  });

  const emailEl = document.getElementById('email');
  if (emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
    showError(emailEl, 'Please enter a valid email address.');
    valid = false;
  }

  const waEl = document.getElementById('whatsapp');
  if (waEl.value.trim() && !/^[\d\s\+\-]{7,15}$/.test(waEl.value.trim())) {
    showError(waEl, 'Please enter a valid WhatsApp number.');
    valid = false;
  }

  return valid;
}

// Clear errors on input
if (form) {
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';

    if (!validateForm()) return;

    submitBtn.disabled     = true;
    btnText.style.display  = 'none';
    spinner.style.display  = 'block';

    const payload = {
      name:       document.getElementById('name').value.trim(),
      email:      document.getElementById('email').value.trim(),
      whatsapp:   document.getElementById('whatsapp').value.trim(),
      department: document.getElementById('department').value.trim(),
      whyjoin:    document.getElementById('whyjoin').value.trim(),
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode:   'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      successMsg.style.display = 'block';
      form.reset();
      form.querySelectorAll('input, textarea').forEach(el => clearError(el));
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      errorMsg.style.display = 'block';
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled    = false;
      btnText.style.display = 'inline-flex';
      spinner.style.display = 'none';
    }
  });
}