# MeetSport — Arquitectura Modular Dual (React + PHP)

## Descripció
MeetSport és una plataforma interactiva dissenyada per connectar esportistes i organitzar activitats esportives. S'ha evolucionat cap a un model de desenvolupament dual que combina un potent frontend d'última generació basat en **React + Vite** amb un portal d'accés modular basat en **PHP, HTML5, CSS i Vanilla JS**, tot connectat a una API REST centralitzada en **Node.js** i una base de dades **MongoDB**.

## Tecnologies
- **Frontend Principal**: React 19, Vite, TailwindCSS, Lucide Icons, Axios.
- **Portal PHP**: HTML5, CSS3 (Custom Design Tokens), JavaScript (ES6+), Socket.io Client.
- **Backend**: Node.js (Express), Socket.io Server, Stripe SDK, Bcrypt.
- **Base de Dades**: MongoDB (meetsport) via Mongoose.
- **Servidor Web**: Apache (XAMPP) per al portal PHP i Servidor de desenvolupament de Vite per al client React.

---

## Estructura del Projecte (Actualitzada)

```
ProjecteWeb_Joan_Marti/
├── index.php               # Redirigeix al portal PHP (public/inici/inici.php)
├── frontend/               # APLICACIÓ CLIENT PRINCIPAL (React + Vite)
│   ├── src/                # Components de React (layouts, chat, activities)
│   │   ├── components/     # Elements reutilitzables de la interfície
│   │   ├── context/        # Gestió del sistema d'autenticació (AuthContext)
│   │   ├── pages/          # Pàgines principals (Profile, Explore, Matches, etc.)
│   │   └── services/       # Client de connexió amb l'API (Axios API Service)
│   ├── public/             # Recursos estàtics del client
│   └── package.json        # Scripts de Vite i dependències del client React
├── public/                 # PORTAL WEB PHP (Modular)
│   ├── common.css          # Sistema de disseny global
│   ├── partials/           # Header i Footer compartits en PHP
│   ├── inici/              # Pàgina de benvinguda del portal PHP
│   ├── explorar/           # Cerca d'activitats i filtres VIP
│   ├── crear/              # Formulari modular per crear activitats
│   ├── matches/            # Xat en temps real amb Socket.io
│   ├── premium/            # Passarel·la de pagament Stripe
│   ├── admin/              # Estadístiques d'administració (Chart.js)
│   ├── profile/            # Gestió de dades i puntuació de l'usuari
│   └── assets/             # Recursos multimèdia compartits
├── backend/                # API REST I SERVIDORS (Node.js + Express)
│   ├── src/                # Lògica del servidor (models, controladors i rutes)
│   │   ├── models/         # Esquemes de MongoDB (User, Activity, Message, Badge, UserBadge)
│   │   ├── controllers/    # Controladors de la base de dades i de negocis
│   │   └── routes/         # Rutes de l'API REST (/api/users, /api/messages, etc.)
│   └── package.json        # Dependències i scripts de Node.js (dev, db-admin)
├── .htaccess               # Configuració del servidor Apache
└── README.md               # Aquest fitxer
```

---

## Secció d'Insígnies i Gamificació (Nova)
Dins del perfil d'usuari de React s'ha integrat un nou apartat premium d'**Insígnies** dissenyat en HSL Dark-Neon que avalua dinàmicament el progrés del jugador:
1.  🏅 **Medalla d'Organitzador**: Es desbloqueja automàticament en publicar **30 activitats**.
2.  ⭐ **Estrella de Punts**: Es desbloqueja automàticament en aconseguir **8.000 punts**.

### Característiques de la Gamificació:
-   **Estats Reactius**: Les insígnies bloquejades apareixen atenuades i en contorn. En desbloquejar-se, s'il·luminen amb un intens halo de neó (taronja i llima) acompanyat de micro-animacions interactives.
-   **Barres de Progrés Dinàmiques**: Informen detalladament a l'usuari quant li falta per assolir cada insígnia.
-   **Missatges de l'Administració**: En assolir per primera vegada qualsevol dels objectius, l'usuari rep automàticament un missatge privat de felicitació de l'administrador al seu xat. El backend gestiona un sistema de control de duplicats per assegurar que cada notificació s'envia exclusivament una sola vegada.

---
Desenvolupat per **MeetSport Team**