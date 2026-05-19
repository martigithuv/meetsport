<?php 
$pageTitle = "Explorar";
$extraCSS = "style.css";
include "../partials/header.php"; 
?>

<main class="explore-main pt-nav container animate-fade-in">
    <header class="explore-header">
        <div class="header-text">
            <h1 class="font-display">Explorar <span class="text-lime" id="view-title">activitats</span></h1>
            <p class="text-muted3">Troba el que busques a MeetSport</p>
        </div>
        
        <div class="view-selector">
            <button class="view-btn active" data-view="Activitats">Activitats</button>
            <button class="view-btn" data-view="Usuaris">Usuaris</button>
        </div>
    </header>

    <div class="search-bar">
        <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="explore-search" placeholder="Busca per títol...">
        </div>
        <a href="<?php echo $baseUrl; ?>/public/crear/crear.php" class="btn-new">
            <span>Nova activitat</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </a>
    </div>

    <div id="explore-grid" class="explore-grid">
        <!-- Cards will be injected here -->
        <div class="loader">
            <div class="spinner"></div>
        </div>
    </div>
</main>

<!-- Modals -->
<div id="modal-container" class="modal-overlay hidden">
    <!-- Modal content injected here -->
</div>

<script src="rating.js?v=1.7"></script>
<script src="script.js?v=1.7"></script>

<?php include "../partials/footer.php"; ?>
