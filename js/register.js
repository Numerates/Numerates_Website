/* ============================================
   NUMERATES — Register Page JavaScript
   Workshop registration form → Google Sheets
   ============================================ */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIuoZ-FB8fisuZriWPUXyJjHL8AK1jdqd-4-c3WVuPHV06qyzdx6I6STR-JMH1YicM/exec';

const form       = document.getElementById('registerForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const spinner    = document.getElementById('spinner');
const successMsg = document.getElementById('successMsg');
const errorMsg   = document.getElementById('errorMsg');

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
    { id: 'course',     msg: 'Please enter your course or class.' },
    { id: 'college',    msg: 'Please enter your institution name.' },
    { id: 'city',       msg: 'Please enter your city or town.' },
    { id: 'whatsapp',   msg: 'Please enter your WhatsApp number.' },
    { id: 'email',      msg: 'Please enter your email address.' },
    { id: 'motivation', msg: 'Please tell us what motivates you.' },
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

form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => clearError(el));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  successMsg.style.display = 'none';
  errorMsg.style.display   = 'none';

  if (!validateForm()) return;

  submitBtn.disabled    = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  const payload = {
    name:       document.getElementById('name').value.trim(),
    course:     document.getElementById('course').value.trim(),
    college:    document.getElementById('college').value.trim(),
    city:       document.getElementById('city').value.trim(),
    whatsapp:   document.getElementById('whatsapp').value.trim(),
    email:      document.getElementById('email').value.trim(),
    motivation: document.getElementById('motivation').value.trim(),
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
