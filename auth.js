// ============================================================
// AUTH — Login, Register, Forgot Password, Toggle Password
// ============================================================

function showAuthError(msg) {
  var e = document.getElementById('authError');
  var m = document.getElementById('authMsg');
  if (m) { m.style.display = 'none'; m.textContent = ''; }
  if (e) { e.textContent = msg; e.style.display = 'block'; }
}

function showAuthMsg(msg) {
  var m = document.getElementById('authMsg');
  var e = document.getElementById('authError');
  if (e) { e.style.display = 'none'; e.textContent = ''; }
  if (m) { m.textContent = msg; m.style.display = 'block'; }
}

function togglePassword(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = 'Sembunyikan';
  } else {
    inp.type = 'password';
    btn.textContent = 'Lihat';
  }
}

function handleLogin(e) {
  if (e) e.preventDefault();
  var email = (document.getElementById('loginEmail').value || '').trim();
  var pass  = document.getElementById('loginPassword').value || '';
  if (!email || !pass) { showAuthError('Email & password wajib diisi.'); return false; }
  var btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Memproses...';

  google.script.run
    .withSuccessHandler(function (res) {
      btn.disabled = false;
      btn.textContent = 'Masuk';
      if (!res || !res.success) {
        showAuthError((res && res.message) || 'Login gagal.');
        return;
      }
      sessionToken = res.sessionToken;
      currentUser  = res.user;
      try { localStorage.setItem('qccms_session', sessionToken); } catch (err) {}
      document.getElementById('loginForm').reset();
      showAuthForm('login');
      enterApp();
    })
    .withFailureHandler(function (err) {
      btn.disabled = false;
      btn.textContent = 'Masuk';
      showAuthError('Gagal: ' + (err && err.message ? err.message : 'Unknown'));
    })
    .login(email, pass);

  return false;
}

function handleRegister(e) {
  if (e) e.preventDefault();
  var fullName = (document.getElementById('regFullName').value || '').trim();
  var email    = (document.getElementById('regEmail').value || '').trim();
  var password = document.getElementById('regPassword').value || '';
  var role     = document.getElementById('regRole').value || 'Inspector';

  if (!fullName || !email || !password) {
    showAuthError('Semua field wajib diisi.');
    return false;
  }
  if (password.length < 8) {
    showAuthError('Password minimal 8 karakter.');
    return false;
  }

  var btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Mendaftar...';

  google.script.run
    .withSuccessHandler(function (res) {
      btn.disabled = false;
      btn.textContent = 'Daftar';
      if (res && res.success) {
        document.getElementById('registerForm').reset();
        showAuthForm('login');
        showAuthMsg(res.message || 'Pendaftaran berhasil. Silakan masuk.');
      } else {
        showAuthError((res && res.message) || 'Pendaftaran gagal.');
      }
    })
    .withFailureHandler(function (err) {
      btn.disabled = false;
      btn.textContent = 'Daftar';
      showAuthError('Gagal: ' + (err && err.message ? err.message : 'Unknown'));
    })
    .registerUser({ fullName: fullName, email: email, password: password, role: role });

  return false;
}

function handleForgotPassword(e) {
  if (e) e.preventDefault();
  var email = (document.getElementById('forgotEmail').value || '').trim();
  if (!email) { showAuthError('Email wajib diisi.'); return false; }
  var btn = document.getElementById('forgotBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Mengirim...';

  google.script.run
    .withSuccessHandler(function (res) {
      btn.disabled = false;
      btn.textContent = 'Kirim Tautan Reset';
      document.getElementById('forgotForm').reset();
      showAuthForm('login');
      if (res && res.success) showAuthMsg(res.message || 'Tautan reset telah dikirim.');
      else showAuthError((res && res.message) || 'Gagal mengirim tautan reset.');
    })
    .withFailureHandler(function (err) {
      btn.disabled = false;
      btn.textContent = 'Kirim Tautan Reset';
      showAuthError('Gagal: ' + (err && err.message ? err.message : 'Unknown'));
    })
    .requestPasswordReset(email);

  return false;
}
