import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  const categories = [
    { name: 'Pàdel', activities: 28, img: '/assets/images/padel_new.png', link: 'padel' },
    { name: 'Running', activities: 42, img: '/assets/images/running_new.png', link: 'running' },
    { name: 'Ciclisme', activities: 15, img: '/assets/images/cycling_new.png', link: 'cycling' },
    { name: 'Futbol', activities: 32, img: '/assets/images/football.png', link: 'football' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section v2 */}
      <section className="hero-v2">
        <div className="hero-v2-bg">
          <img src="/assets/images/hero_new.png" alt="MeetSport Hero" />
        </div>
        
        <div className="hero-v2-content animate-fade-in">
          <div className="label-tiny text-lime mb-4">Connecta · Juga · Evoluciona</div>
          <h1 className="text-5xl md:text-7xl font-display mb-6">
            L'ESPORT ÉS MILLOR <br />
            <span className="text-gradient">EN COMPANYIA</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto mb-10">
            Uneix-te a la comunitat esportiva més activa. Troba companys de nivell, 
            reserva activitats i millora les teves estadístiques cada dia.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {!user ? (
              <>
                <Link to="/register" className="btn-primary px-10 py-4 text-lg">Comença Gratis</Link>
                <Link to="/explore" className="btn-secondary px-10 py-4 text-lg">Explorar ara</Link>
              </>
            ) : (
              <Link to="/explore" className="btn-primary px-12 py-4 text-lg">Trobar Activitats</Link>
            )}
          </div>

          <div className="hero-v2-stats">
            <div className="stat-item">
              <span className="stat-value">2.4k+</span>
              <span className="stat-label">Esportistes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">150+</span>
              <span className="stat-label">Activitats/dia</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">98%</span>
              <span className="stat-label">Èxit Match</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className="py-20 container">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-display mb-2">EXPLORA PER <span className="text-lime">ESPORT</span></h2>
            <p className="text-muted">Troba el que t'apassiona, a prop teu.</p>
          </div>
          <Link to="/explore" className="text-lime font-bold hover:underline">Veure-ho tot →</Link>
        </div>

        <div className="carousel-container">
          {categories.map((cat, idx) => (
            <Link to={`/explore?category=${cat.link}`} key={idx} className="category-card-v2">
              <img src={cat.img} alt={cat.name} />
              <div className="category-card-overlay">
                <h4>{cat.name}</h4>
                <p>{cat.activities} activitats</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Improved Features Section */}
      <section className="py-20 bg-dark2/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display mb-4">PER QUÈ <span className="text-lime">MEETSPORT</span>?</h2>
            <p className="text-muted max-w-2xl mx-auto">La plataforma dissenyada per fer que fer esport sigui més fàcil, social i divertit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card-v2">
              <div className="feature-icon mb-6 bg-lime/10 w-14 h-14 rounded-2xl flex items-center justify-center text-lime">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Comunitat Activa</h3>
              <p className="text-muted">No tornis a jugar sol. Conecta amb persones del teu nivell i zona en qüestió de minuts.</p>
            </div>
            
            <div className="feature-card-v2">
              <div className="feature-icon mb-6 bg-orange/10 w-14 h-14 rounded-2xl flex items-center justify-center text-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Sistema de Punts</h3>
              <p className="text-muted">Guanya punts per cada activitat finalitzada, millora el teu rang i desbloqueja avantatges exclusius.</p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon mb-6 bg-lime/10 w-14 h-14 rounded-2xl flex items-center justify-center text-lime">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Xat en Temps Real</h3>
              <p className="text-muted">Organitza els detalls, comparteix ubicacions i comenta les jugades amb el teu equipo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section v2 */}
      <section className="cta-section-v2 container">
        <div className="cta-card-v2 animate-fade-in">
          <h2 className="font-display">LLEST PER COMENÇAR EL <br /> TEU PRÒXIM REPTE?</h2>
          <Link to="/register" className="btn-cta-v2">
            Uneix-te a la Comunitat
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
