<?php
$pageTitle = "Matches";
$extraCSS = "style.css";
include "../partials/header.php";
?>





<main class="matches-main pt-nav">
    <div class="matches-header container">
        <h1 class="font-display">Els teus <span class="text-lime" id="matches-title">matches</span></h1>
        <p class="text-muted3">Xateja i organitza les teves activitats <span id="premium-tag"
                class="hidden text-orange font-bold ml-2">PRO MODE</span></p>
    </div>

    <div class="matches-container container animate-fade-in">
        <!-- Sidebar: Conversations -->
        <aside class="conversations-sidebar">
            <div class="search-box">
                <input type="text" id="user-search" placeholder="Busca un usuari...">
            </div>
            <div class="conversations-list" id="conversations-list">
                <!-- Conversations injected here -->
            </div>
        </aside>

        <!-- Chat Area -->
        <section class="chat-area" id="chat-area">
            <div class="no-chat-selected">
                <h2 class="font-display">Selecciona una conversa</h2>
            </div>
        </section>
    </div>
    <input type="file" id="chat-file-input" hidden accept="image/*">
</main>

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script src="script.js"></script>

<?php include "../partials/footer.php"; ?>