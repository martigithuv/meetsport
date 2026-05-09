<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registra't | MeetSport</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../common.css">
    <link rel="stylesheet" href="../login/style.css"> <!-- Reusing login styles -->
</head>
<body class="login-body">
    <div class="login-overlay"></div>
    
    <div class="login-card animate-fade-in" style="max-width: 480px;">
        <div class="login-header">
            <div class="logo">
                <div class="logo-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </div>
                <span>Meet<span class="text-lime">Sport</span></span>
            </div>
        </div>

        <h1 class="font-display">Crea el teu compte</h1>
        <p class="text-muted3 text-sm mb-8">Uneix-te a la comunitat d'esportistes</p>

        <div id="error-msg" class="error-box hidden"></div>

        <form id="register-form" class="space-y-4">
            <div class="form-group">
                <label>Nom complet</label>
                <div class="input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" id="name" required>
                </div>
            </div>
            <div class="form-group">
                <label>Correu electrònic</label>
                <div class="input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input type="email" id="email" required>
                </div>
            </div>
            <div class="form-group">
                <label>Contrasenya</label>
                <div class="input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input type="password" id="password" required>
                </div>
            </div>

            <button type="submit" class="btn-primary w-full" id="submit-btn">Crear compte</button>
        </form>

        <div class="footer-note">
            Ja tens un compte? <a href="../login/login.php" class="text-lime font-bold">Inicia sessió</a>
        </div>
    </div>

    <script>
        document.getElementById('register-form').onsubmit = async (e) => {
            e.preventDefault();
            const errorBox = document.getElementById('error-msg');
            errorBox.classList.add('hidden');
            const btn = document.getElementById('submit-btn');
            btn.innerText = 'Creant compte...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data));
                    window.location.href = '../inici/inici.php';
                } else {
                    errorBox.innerText = data.message || 'Error en el registre';
                    errorBox.classList.remove('hidden');
                }
            } catch (err) {
                errorBox.innerText = 'Error de connexió amb el servidor';
                errorBox.classList.remove('hidden');
            } finally {
                btn.innerText = 'Crear compte';
                btn.disabled = false;
            }
        };
    </script>
</body>
</html>
