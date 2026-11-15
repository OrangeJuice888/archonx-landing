/* Sign-in page. Posts to /api/admin/login and moves to /admin on success. One generic error line. */
(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var errorLine = document.getElementById('loginError');
  var button = document.getElementById('loginButton');

  function showError(message) {
    errorLine.textContent = message || '';
    errorLine.hidden = !message;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');
    var email = form.elements.email.value.trim();
    var password = form.elements.password.value;
    if (!email || !password) { showError('Enter your email and password.'); return; }
    button.disabled = true;

    fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'ax-admin' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) { return { status: res.status, data: data }; });
    }).then(function (r) {
      if (r.status === 200 && r.data && r.data.ok) { location.replace('/admin'); return; }
      if (r.status === 429) showError('Too many attempts. Wait 15 minutes and try again.');
      else if (r.status === 401) showError('Invalid email or password.');
      else showError('Sign-in failed. Try again.');
      button.disabled = false;
    }).catch(function () {
      showError('Could not reach the server. Try again.');
      button.disabled = false;
    });
  });
})();
