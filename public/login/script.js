document.addEventListener('DOMContentLoaded', function() {
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

    toggleBtn.onclick = () => {
        isAdminMode = !isAdminMode;
        userInputs.classList.toggle('hidden');
        adminInputs.classList.toggle('hidden');
        registerNote.classList.toggle('hidden');
        
        if (isAdminMode) {
            loginTitle.innerText = "Entrar com a admin";
            loginDesc.classList.add('hidden');
            toggleText.innerText = "Tornar al login normal";
        } else {
            loginTitle.innerText = "Benvingut de nou";
            loginDesc.classList.remove('hidden');
            toggleText.innerText = "Entrar com a admin";
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        errorBox.classList.add('hidden');
        const btn = document.getElementById('submit-btn');
        btn.innerText = 'Carregant...';
        btn.disabled = true;

        const endpoint = isAdminMode ? 'admin-login' : 'login';
        const payload = isAdminMode ? {
            password: document.getElementById('admin-password').value
        } : {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
            btn.innerText = isAdminMode ? 'Entrar com a Admin' : 'Iniciar sessió';
            btn.disabled = false;
        }
    };
});
