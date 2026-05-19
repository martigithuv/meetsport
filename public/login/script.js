document.addEventListener('DOMContentLoaded', function () {
  let isAdminMode = false;

  const form = document.getElementById('login-form');
  const toggleBtn = document.getElementById('toggle-admin');
  const userInputs = document.getElementById('user-inputs');
  const adminInputs = document.getElementById('admin-inputs');
  const loginTitle = document.getElementById('login-title');
  const loginDesc = document.getElementById('login-desc');
  const errorBox = document.getElementById('error-msg');
  const registerNote = document.getElementById('register-note');
  const toggleText = document.getElementById('toggle-text');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const adminPasswordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('submit-btn');

  const applyMode = (adminMode) => {
    userInputs.classList.toggle('hidden', adminMode);
    adminInputs.classList.toggle('hidden', !adminMode);
    registerNote.classList.toggle('hidden', adminMode);

    // Aunque estén ocultos con CSS, los inputs con `required` siguen validando.
    // En modo admin desactivamos email/password y activamos el campo admin (y viceversa).
    emailInput.disabled = adminMode;
    passwordInput.disabled = adminMode;
    emailInput.required = !adminMode;
    passwordInput.required = !adminMode;

    adminPasswordInput.disabled = !adminMode;
    adminPasswordInput.required = adminMode;

    if (adminMode) {
      loginTitle.innerText = 'Entrar com a admin';
      loginDesc.classList.add('hidden');
      toggleText.innerText = 'Tornar al login normal';
      submitBtn.innerText = 'Entrar com a admin';
    } else {
      loginTitle.innerText = 'Benvingut de nou';
      loginDesc.classList.remove('hidden');
      toggleText.innerText = 'Entrar com a admin';
      submitBtn.innerText = 'Iniciar sessió';
    }

    errorBox.classList.add('hidden');
    errorBox.innerText = '';
  };

  toggleBtn.onclick = () => {
    isAdminMode = !isAdminMode;
    applyMode(isAdminMode);
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    if (isAdminMode && !adminPasswordInput.value) {
      errorBox.innerText = "Introdueix la contrasenya d'administrador";
      errorBox.classList.remove('hidden');
      return;
    }

    submitBtn.innerText = 'Carregant...';
    submitBtn.disabled = true;

    const endpoint = isAdminMode ? 'admin-login' : 'login';
    const payload = isAdminMode
      ? { password: adminPasswordInput.value }
      : { email: emailInput.value, password: passwordInput.value };

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.role === 'ADMIN') {
          window.location.href = '../admin/admin.php';
        } else {
          window.location.href = '../inici/inici.php';
        }
      } else {
        errorBox.innerText = data.message || 'Error en iniciar sessió';
        errorBox.classList.remove('hidden');
      }
    } catch (err) {
      errorBox.innerText = 'Error de connexió amb el servidor';
      errorBox.classList.remove('hidden');
    } finally {
      submitBtn.innerText = isAdminMode ? 'Entrar com a admin' : 'Iniciar sessió';
      submitBtn.disabled = false;
    }
  };

  // Estado inicial
  applyMode(false);
});
