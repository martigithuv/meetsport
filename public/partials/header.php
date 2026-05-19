<?php
// Calcular la ruta base del proyecto de forma dinámica
$scriptPath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$baseUrl = preg_replace('/\/public.*/', '', $scriptPath);
if ($baseUrl === '/') $baseUrl = '';
?>
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . " | MeetSport" : "MeetSport"; ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="<?php echo $baseUrl; ?>/public/assets/images/favicon.svg">
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>/public/common.css?v=1.6">
    <?php if (isset($extraCSS)): ?>
    <link rel="stylesheet" href="<?php echo $extraCSS; ?>?v=1.6">
    <?php endif; ?>
</head>
<body>
    <nav class="fixed-nav">
        <div class="nav-container">
            <a href="<?php echo $baseUrl; ?>/public/inici/inici.php" class="logo">
                <div class="logo-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </div>
                <span>Meet<span class="text-lime">Sport</span></span>
            </a>

            <div class="nav-links-wrapper">
                <div class="nav-links" id="main-nav-links">
                    <!-- Links will be injected here by JS based on role -->
                </div>
            </div>

            <div class="nav-auth" id="nav-auth-section">
                <!-- Auth state will be injected here by JS -->
            </div>
        </div>
    </nav>

    <style>
        .fixed-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            height: 58px;
            overflow: hidden;
            background: rgba(6, 6, 8, 0.9);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
        }

        .nav-container {
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-family: var(--font-display);
            font-size: 1.5rem;
            letter-spacing: 0.1em;
            font-weight: 600;
        }

        .logo-box {
            width: 30px;
            height: 30px;
            background: var(--color-lime);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(200, 245, 66, 0.25);
        }

        .logo-box svg {
            width: 15px;
            height: 15px;
            color: var(--color-dark);
        }

        .nav-links-wrapper {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 100px;
            padding: 4px;
        }

        .nav-links {
            display: flex;
            gap: 4px;
        }

        .nav-link {
            padding: 6px 16px;
            border-radius: 100px;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--color-muted3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .nav-link:hover {
            color: var(--color-light);
        }

        .nav-link.active {
            background: var(--color-lime);
            color: var(--color-dark);
            font-weight: 700;
        }

        .badge {
            background: var(--color-lime);
            color: var(--color-dark);
            font-size: 0.6rem;
            font-weight: 800;
            padding: 0 5px;
            border-radius: 10px;
            min-width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .active .badge {
            background: rgba(0, 0, 0, 0.2);
        }

        .nav-auth {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .btn-login {
            font-size: 0.78rem;
            font-weight: 700;
            color: var(--color-light);
        }

        .btn-register {
            background: var(--color-lime);
            color: var(--color-dark);
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 700;
        }

        .profile-link {
            position: relative;
        }

        .profile-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .profile-icon.premium {
            background: linear-gradient(135deg, #FF6B2B, #FF8E53);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .profile-icon.regular {
            background: linear-gradient(135deg, rgba(200, 245, 66, 0.2), rgba(200, 245, 66, 0.05));
            border: 1px solid rgba(200, 245, 66, 0.2);
        }

        .pro-tag {
            position: absolute;
            top: -4px;
            right: -4px;
            background: white;
            color: var(--color-orange);
            font-size: 0.5rem;
            font-weight: 800;
            padding: 2px 4px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-logout {
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--color-muted3);
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 0.72rem;
            font-weight: 500;
        }

        .btn-logout:hover {
            color: #ff4b4b;
            border-color: rgba(255, 75, 75, 0.2);
            background: rgba(255, 75, 75, 0.05);
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const baseUrl = '<?php echo $baseUrl; ?>';
            const currentPath = window.location.pathname;

            // Páginas protegidas (todas menos inici, login y register)
            const isPublicPage = currentPath.includes('inici.php') || 
                                 currentPath.includes('login.php') || 
                                 currentPath.includes('register.php') ||
                                 currentPath.endsWith('ProjecteWeb_Joan_Marti/') ||
                                 currentPath.endsWith('ProjecteWeb_Joan_Marti/index.php');

            if (!user && !isPublicPage) {
                window.location.href = baseUrl + '/public/login/login.php';
                return;
            }
            const pathname = window.location.pathname;

            const navLinksContainer = document.getElementById('main-nav-links');
            const authSection = document.getElementById('nav-auth-section');

            let navLinks = [];
            
            if (!user) {
                // Solo Inici si no hay sesión
                navLinks = [
                    { name: "Inici", path: baseUrl + "/public/inici/inici.php" }
                ];
            } else if (user.role === "ADMIN") {
                navLinks = [{ name: "Admin", path: baseUrl + "/public/admin/admin.php" }];
            } else {
                navLinks = [
                    { name: "Inici", path: baseUrl + "/public/inici/inici.php" },
                    { name: "Explorar", path: baseUrl + "/public/explorar/explorar.php" },
                    { name: "Matches", path: baseUrl + "/public/matches/matches.php", badge: 3 },
                    { name: "Crear", path: baseUrl + "/public/crear/crear.php" },
                    { name: "Premium", path: baseUrl + "/public/premium/premium.php" },
                ];
            }

            navLinks.forEach(link => {
                const isActive = pathname.includes(link.path);
                const a = document.createElement('a');
                a.href = link.path;
                a.className = `nav-link ${isActive ? 'active' : ''}`;
                a.innerHTML = `${link.name} ${link.badge ? `<span class="badge">${link.badge}</span>` : ''}`;
                navLinksContainer.appendChild(a);
            });

            if (user) {
                authSection.innerHTML = `
                    <a href="${baseUrl}/public/profile/profile.php" class="profile-link">
                        <div class="profile-icon ${user.isPremium ? 'premium' : 'regular'}">
                            ${user.isPremium ? 
                                '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width:20px;height:20px;"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>' : 
                                '<svg viewBox="0 0 24 24" fill="none" stroke="#c8f542" stroke-width="2" style="width:20px;height:20px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
                            }
                        </div>
                        ${user.isPremium ? '<div class="pro-tag">PRO</div>' : ''}
                    </a>
                    <button id="logout-btn" class="btn-logout">Sortir</button>
                `;

                document.getElementById('logout-btn').addEventListener('click', function() {
                    localStorage.removeItem('user');
                    window.location.href = baseUrl + '/public/inici/inici.php';
                });
            } else {
                authSection.innerHTML = `
                    <a href="${baseUrl}/public/login/login.php" class="btn-login">Inicia sessió</a>
                    <a href="${baseUrl}/public/register/register.php" class="btn-register">Registra't</a>
                `;
            }
        });
    </script>
