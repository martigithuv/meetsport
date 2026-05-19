<?php 
$pageTitle = "Inici";
$extraCSS = "style.css";
include "../partials/header.php"; 
?>

<main class="inici-main">
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-bg">
            <img src="<?php echo $baseUrl; ?>/public/assets/images/hero.png" alt="Hero" class="hero-img">
            <div class="overlay"></div>
        </div>
        
        <div class="container hero-content animate-fade-in">
            <div class="status-badge">
                <div class="dot"></div>
                <span>Connecta · Juga · Evoluciona</span>
            </div>

            <h1 class="hero-title font-display">
                TROBA EL TEU<br>
                <span class="text-lime">PRÒXIM RIVAL</span><br>
                O COMPANY
            </h1>

            <p class="hero-desc">
                MeetSport, la plataforma per connectar amb esportistes arreu del país.
                Uneix-te a partits, rutes i entrenaments en qüestió de segons.
            </p>

            <div class="hero-actions">
                <a href="#" onclick="handleCategoryClick(event, '')" class="btn-primary">
                    Explorar Activitats
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
                <a href="<?php echo $baseUrl; ?>/public/register/register.php" class="btn-secondary">
                    Començar amb el bàsic
                </a>
            </div>

            <div class="hero-stats">
                <div class="stat">
                    <span class="stat-num">2.4k+</span>
                    <span class="stat-label">Usuaris actius</span>
                </div>
                <div class="stat">
                    <span class="stat-num text-lime">150</span>
                    <span class="stat-label">Partits avui</span>
                </div>
                <div class="stat">
                    <span class="stat-num text-orange">98%</span>
                    <span class="stat-label">Matches exitosos</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section class="categories container">
        <div class="section-header">
            <div>
                <h2 class="font-display">EXPLORA PER <span class="text-lime">ESPORT</span></h2>
                <p class="text-muted3">Fes el que més t'agradi, amb qui més t'agradi</p>
            </div>
            <a href="#" onclick="handleCategoryClick(event, '')" class="see-all">Veure-ho tot →</a>
        </div>

        <div class="category-grid">
            <div class="category-card">
                <img src="<?php echo $baseUrl; ?>/public/assets/images/running.png" alt="Running">
                <div class="card-content">
                    <h3>RUNNING</h3>
                    <p>42 activitats avui</p>
                    <a href="#" onclick="handleCategoryClick(event, 'running')" class="card-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="category-card">
                <img src="<?php echo $baseUrl; ?>/public/assets/images/padel.png" alt="Padel">
                <div class="card-content">
                    <h3>PÀDEL</h3>
                    <p>28 activitats avui</p>
                    <a href="#" onclick="handleCategoryClick(event, 'padel')" class="card-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="category-card">
                <img src="<?php echo $baseUrl; ?>/public/assets/images/cycling.png" alt="Ciclisme">
                <div class="card-content">
                    <h3>CICLISME</h3>
                    <p>15 activitats avui</p>
                    <a href="#" onclick="handleCategoryClick(event, 'cycling')" class="card-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="category-card">
                <img src="<?php echo $baseUrl; ?>/public/assets/images/football.png" alt="Futbol">
                <div class="card-content">
                    <h3>FUTBOL</h3>
                    <p>32 activitats avui</p>
                    <a href="#" onclick="handleCategoryClick(event, 'football')" class="card-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>
</main>

<script src="script.js?v=1.1"></script>

<?php include "../partials/footer.php"; ?>
