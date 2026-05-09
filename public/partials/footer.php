    <footer class="site-footer">
        <div class="container footer-content">
            <div class="footer-brand">
                <div class="logo">
                    <div class="logo-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <span>Meet<span class="text-lime">Sport</span></span>
                </div>
                <p>MeetSport, la plataforma per connectar amb esportistes arreu del país. Uneix-te a partits, rutes i entrenaments en qüestió de segons.</p>
            </div>
            <div class="footer-links">
                <div class="footer-col">
                    <h4>Plataforma</h4>
                    <a href="/ProjecteWeb_Joan_Marti/public/explorar/explorar.php">Explorar</a>
                    <a href="/ProjecteWeb_Joan_Marti/public/matches/matches.php">Matches</a>
                    <a href="/ProjecteWeb_Joan_Marti/public/crear/crear.php">Crear Activitat</a>
                </div>
                <div class="footer-col">
                    <h4>Suport</h4>
                    <a href="#">PMF</a>
                    <a href="#">Contacte</a>
                    <a href="#">Privacitat</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <?php echo date("Y"); ?> MeetSport. Tots els drets reservats.</p>
        </div>
    </footer>

    <style>
        .site-footer {
            background: var(--color-dark2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 4rem 0 2rem;
            margin-top: 4rem;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-brand p {
            margin-top: 1.5rem;
            color: #ccc;
            font-size: 0.9rem;
            max-width: 350px;
            line-height: 1.6;
        }

        .footer-links {
            display: flex;
            gap: 4rem;
        }

        .footer-col h4 {
            font-family: var(--font-display);
            font-size: 1rem;
            margin-bottom: 1.5rem;
            color: var(--color-light);
        }

        .footer-col a {
            display: block;
            margin-bottom: 0.8rem;
            color: #aaa;
            font-size: 0.85rem;
        }

        .footer-col a:hover {
            color: var(--color-lime);
        }

        .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #777;
            font-size: 0.8rem;
        }
    </style>
</body>
</html>
