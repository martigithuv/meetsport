<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inicia sessió | MeetSport</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../common.css">
    <link rel="stylesheet" href="style.css">
</head>
<body class="login-body">
    <div class="login-overlay"></div>
    
    <div class="login-card animate-fade-in">
        <div class="login-header">
            <div class="logo">
                <div class="logo-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </div>
                <span>Meet<span class="text-lime">Sport</span></span>
            </div>
            <p class="tagline">Connecta · Fes Esport · Gaudeix</p>
        </div>

        <h1 class="font-display" id="login-title">Benvingut de nou</h1>
        <p class="text-muted3 text-sm mb-8" id="login-desc">Inicia sessió per continuar l'aventura</p>

        <div id="error-msg" class="error-box hidden"></div>

        <form id="login-form" class="space-y-4">
            <div id="user-inputs">
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
                <div class="text-right">
                    <a href="#" class="text-lime text-xs font-bold">Has oblidat la contrasenya?</a>
                </div>
            </div>

            <div id="admin-inputs" class="hidden">
                <div class="form-group">
                    <label>Contrasenya Administrador</label>
                    <div class="input-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <input type="password" id="admin-password">
                    </div>
                </div>
            </div>

            <button type="submit" class="btn-primary w-full" id="submit-btn">Iniciar sessió</button>
        </form>

        <div class="divider"></div>

        <button id="toggle-admin" class="btn-toggle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span id="toggle-text">Entrar com a admin</span>
        </button>

        <div class="footer-note" id="register-note">
            Nou a MeetSport? <a href="../register/register.php" class="text-lime font-bold">Registra't ara</a>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
