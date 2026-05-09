# MeetSport — Arquitectura Modular Neta

## Descripció
MeetSport és una plataforma per connectar esportistes a Barcelona. S'ha reestructurat completament per utilitzar una arquitectura neta basada en **HTML, CSS, Vanilla JS i PHP**, eliminant la complexitat de React/Next.js per obtenir el màxim rendiment.

## Tecnologies
- **Frontend**: HTML5, CSS3 (Custom Tokens), JavaScript (ES6+), Socket.io Client.
- **Backend**: Node.js (API REST), Socket.io Server, Stripe SDK.
- **Base de Dades**: MongoDB (via el Backend Node.js).
- **Servidor Web**: Apache (XAMPP).

## Estructura del Projecte (Nova)

```
ProjecteWeb_Joan_Marti/
├── index.php               # Redirigeix a l'app (public/inici/inici.php)
├── public/                 # TOTA L'APLICACIÓ FRONTEND
│   ├── common.css          # Sistema de disseny global
│   ├── partials/           # Header i Footer compartits (PHP)
│   ├── inici/              # Pàgina principal
│   ├── explorar/           # Cerca d'activitats i usuaris
│   ├── crear/              # Formulari per crear activitats
│   ├── matches/            # Xat en temps real (Socket.io)
│   ├── premium/            # Gestió de subscripció (Stripe)
│   ├── admin/              # Panell de control (Chart.js)
│   ├── profile/            # Gestió de l'usuari i estadístiques
│   └── assets/             # Multimèdia (Imatges)
├── backend/                # API i Lògica del servidor (Node.js)
├── .htaccess               # Configuració de rutes d'Apache
└── README.md               # Aquest fitxer
```

## Neteja de fitxers antics
Les carpetes `frontend/`, `app/`, `pages/` i `api/` (arrel) han estat eliminades o buidades ja que el seu codi ha estat portat a la nova estructura modular dins de `public/`. Si encara veus la carpeta `frontend/` al teu explorador, és un bloqueig temporal de Windows; ja no conté cap codi i pot ser ignorada.

---
Desenvolupat per **MeetSport Team**