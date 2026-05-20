import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MapPin, Users, Calendar, Trophy, Info, ExternalLink, ChevronDown, ChevronUp, X, Check, ShieldCheck, Award, User } from 'lucide-react';
import ActivityCard from '../components/activity/ActivityCard';
import Modal from '../components/ui/Modal';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Explore = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [isSportsDropdownOpen, setIsSportsDropdownOpen] = useState(false);
  
  // NOU: Estats per la cerca d'usuaris
  const [searchMode, setSearchMode] = useState('activities'); // 'activities' o 'users'
  const [usersList, setUsersList] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  useEffect(() => {
    fetchActivities();

    // Comprovar si venim de Stripe (pagament completat)
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('payment') === 'success') {
      const processUpgrade = async () => {
        try {
          // Forcem l'actualització de l'usuari a la base de dades
          await api.post('/users/upgrade');
          // Actualitzem l'estat local perquè l'interfície canviï a l'instant
          updateUser({ isPremium: true });
          alert('🎉 Felicitats! Pagament completat correctament. Ara ets usuari VIP Premium!');
          
          // Netejar la URL perquè no torni a saltar si refresca la pàgina
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error al processar el pagament Premium:', error);
        }
      };
      processUpgrade();
    }
  }, [location.search]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NOU: Cerca d'usuaris amb debounce
  useEffect(() => {
    if (searchMode === 'users') {
      const delayDebounceFn = setTimeout(() => {
        searchUsersAPI();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, searchMode]);

  const searchUsersAPI = async () => {
    if (!search.trim()) {
      setUsersList([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const response = await api.get(`/users/search?query=${search}`);
      setUsersList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleOpenUserProfile = async (userId) => {
    try {
      // Obre modal de càrrega
      setSelectedUserProfile({ _id: userId, loading: true });
      
      // Registra la visita de forma asíncrona (si és Premium ho guardarà al backend)
      api.post(`/users/view/${userId}`).catch(e => console.error(e));

      // Descarrega el perfil sencer (punts i activitats incloses)
      const response = await api.get(`/users/${userId}/profile`);
      setSelectedUserProfile(response.data);
    } catch (err) {
      console.error(err);
      alert('Error al carregar el perfil de l\'usuari');
      setSelectedUserProfile(null);
    }
  };

  const fetchParticipants = async (activityId) => {
    if (!activityId) return;
    setFetchingParticipants(true);
    try {
      const response = await api.get(`/activities/${activityId}/participants`);
      setParticipantsList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setParticipantsList([]);
    } finally {
      setFetchingParticipants(false);
    }
  };

  const handleOpenActivity = (act) => {
    if (!act) return;
    setSelectedActivity(act);
    setShowParticipants(false);
    fetchParticipants(act._id);
  };

  const handleOpenMaps = (url, address) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || 'Barcelona')}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const isFav = user?.favorites?.includes(id);
      const newFavorites = isFav 
        ? (user.favorites || []).filter(favId => favId !== id)
        : [...(user.favorites || []), id];
      
      updateUser({ favorites: newFavorites });
      
      await api.post(`/users/favorites/${id}`);
      
      if (isFav) {
        alert("L'activitat s'ha eliminat de preferits");
      } else {
        alert("L'activitat s'ha afegit a preferits");
      }
    } catch (err) {
      console.error(err);
      alert("Error al gestionar preferits");
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/enrollments/${id}`);
      alert('T\'has apuntat correctament! Ara pots veure aquesta activitat al teu perfil (Inscripcions).');
      setSelectedActivity(null);
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'Error en apuntar-te');
    }
  };

  // Dynamic unique sports list
  const availableSports = Array.from(new Set(activities.map(act => act.sport.toUpperCase()))).sort();

  const filteredActivities = activities.filter(act => {
    // 1. Text Search Filter
    const matchesSearch = 
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.sport.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Premium Filters (only applied if user is premium)
    if (user?.isPremium) {
      // Sport multi-select filter
      if (selectedSports.length > 0) {
        if (!selectedSports.includes(act.sport.toUpperCase())) {
          return false;
        }
      }

      // Difficulty level multi-select filter
      if (selectedLevels.length > 0) {
        // If the activity is set to 'Tots', it counts for any level filter selected.
        // Otherwise, it must match one of the selected levels.
        if (act.level !== 'Tots' && !selectedLevels.includes(act.level)) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className={`explore-page py-10 animate-fade-in w-full mx-auto px-6 ${user?.isPremium ? 'max-w-[1800px]' : 'max-w-[1500px]'}`}>
      {/* Header Section */}
      <header className="flex flex-col items-center justify-center text-center gap-8 mb-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-6xl font-black mb-3 tracking-tighter leading-none uppercase italic">
            EXPLORA <span className="text-lime text-stroke-lime">MEETSPORT</span>
          </h2>
          <p className="text-muted3 text-sm font-medium opacity-60 uppercase tracking-[0.2em]">Connecta, juga i guanya experiència.</p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-2">
          <button 
            onClick={() => { setSearchMode('activities'); setSearch(''); }}
            className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'activities' ? 'bg-lime text-dark shadow-lg shadow-lime/20' : 'text-muted3 hover:text-white'}`}
          >
            Activitats
          </button>
          <button 
            onClick={() => { setSearchMode('users'); setSearch(''); }}
            className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'users' ? 'bg-lime text-dark shadow-lg shadow-lime/20' : 'text-muted3 hover:text-white'}`}
          >
            Usuaris
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-4xl">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted3 group-focus-within:text-lime transition-colors" size={22} />
            <input 
              type="text" 
              placeholder={searchMode === 'activities' ? "Cerca per títol o esport..." : "Cerca usuaris per nom o email..."} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-base text-white outline-none focus:border-lime/40 focus:bg-white/[0.08] transition-all shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {searchMode === 'activities' && (
            <Link to="/create" className="btn-primary flex items-center justify-center gap-3 px-10 py-6 shadow-2xl shadow-lime/20 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
              <Plus size={20} strokeWidth={3} /> Nova Activitat
            </Link>
          )}
        </div>
      </header>

      {/* Main Layout Container (Locked side-by-side sidebar and grid) */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          alignItems: 'flex-start',
          width: '100%',
          marginTop: '20px'
        }}
      >
        
        {/* Left Sidebar for Premium Users (Sleek, Taller & Narrower) */}
        {user?.isPremium && searchMode === 'activities' && (
          <aside 
            style={{
              width: '340px',
              flexShrink: 0,
              backgroundColor: '#15161a',
              padding: '80px 28px',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '54px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: 'rgba(200, 245, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={24} style={{ color: '#c8f542', margin: 'auto' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'inherit', fontSize: '19px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', fontStyle: 'italic' }}>FILTRES VIP</h3>
                <p style={{ fontSize: '10px', fontWeight: '900', color: '#c8f542', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>PREMIUM</p>
              </div>
            </div>

            {/* Sport Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.2em', color: '#a3a3a3', textTransform: 'uppercase' }}>Esport / Activitat</label>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsSportsDropdownOpen(!isSportsDropdownOpen)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '22px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                    {selectedSports.length === 0 
                      ? 'Tots els esports' 
                      : `${selectedSports.length} seleccionats`
                    }
                  </span>
                  <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: isSportsDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {isSportsDropdownOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: '#15161a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      zIndex: 999,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto'
                    }}
                  >
                    {availableSports.map(sport => {
                      const isSelected = selectedSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSports(selectedSports.filter(s => s !== sport));
                            } else {
                              setSelectedSports([...selectedSports, sport]);
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(200, 245, 66, 0.05)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{sport}</span>
                          <div 
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: isSelected ? '1px solid #c8f542' : '1px solid rgba(255, 255, 255, 0.2)',
                              backgroundColor: isSelected ? '#c8f542' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              flexShrink: 0
                            }}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} style={{ color: '#15161a' }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Level Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.2em', color: '#a3a3a3', textTransform: 'uppercase' }}>Dificultat / Nivell</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Principiant', 'Intermedi', 'Avançat', 'Tots'].map(lvl => {
                  const isSelected = selectedLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLevels(selectedLevels.filter(l => l !== lvl));
                        } else {
                          setSelectedLevels([...selectedLevels, lvl]);
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 22px',
                        backgroundColor: isSelected ? 'rgba(200, 245, 66, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid #c8f542' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{lvl}</span>
                      <div 
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: isSelected ? '1px solid #c8f542' : '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: isSelected ? '#c8f542' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} style={{ color: '#15161a' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Button */}
            {(selectedSports.length > 0 || selectedLevels.length > 0) && (
              <button
                onClick={() => {
                  setSelectedSports([]);
                  setSelectedLevels([]);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(200, 245, 66, 0.2)',
                  color: '#c8f542',
                  backgroundColor: 'rgba(200, 245, 66, 0.05)',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c8f542';
                  e.target.style.color = '#15161a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(200, 245, 66, 0.05)';
                  e.target.style.color = '#c8f542';
                }}
              >
                Netejar Filtres
              </button>
            )}
          </aside>
        )}

        {/* Right side: Activities Grid */}
        <div style={{ flex: 1, width: '100%' }}>
          {searchMode === 'users' ? (
            <div className="activities-responsive-grid">
              {searchingUsers ? (
                <div className="col-span-full flex justify-center py-20"><div className="w-10 h-10 border-4 border-lime/20 border-t-lime rounded-full animate-spin"></div></div>
              ) : usersList.length > 0 ? (
                usersList.map(u => (
                  <div key={u._id} className="bg-[#121217] rounded-[32px] p-6 border border-white/5 flex flex-col items-center text-center gap-4 hover:border-lime/30 transition-all duration-300">
                    <div className="relative mt-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#121217] shadow-xl" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime/20 to-lime/5 border-4 border-[#121217] shadow-xl flex items-center justify-center">
                          <User size={36} className="text-lime/50" />
                        </div>
                      )}
                      {u.isPremium && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lime to-[#a3e635] text-dark text-[8px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg shadow-lime/20 border border-lime/50">
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <h3 className="text-xl font-black text-white truncate">{u.name}</h3>
                      <p className="text-xs text-muted3 mt-1 font-medium italic">{u.followersCount} seguidors</p>
                    </div>
                    <button 
                      onClick={() => handleOpenUserProfile(u._id)}
                      className="w-full mt-4 py-3.5 bg-white/5 hover:bg-lime hover:text-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-lime"
                    >
                      Veure Perfil
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center opacity-30">
                  <Search size={64} className="mx-auto mb-6 text-muted3" />
                  <p className="font-black uppercase tracking-[0.3em] text-lg text-muted3">{search ? 'Cap usuari trobat' : 'Escriu per cercar usuaris'}</p>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-48">
              <div className="w-16 h-16 border-4 border-lime/10 border-t-lime rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="activities-responsive-grid">
              {filteredActivities.length > 0 ? (
                filteredActivities.map(act => (
                  <ActivityCard 
                    key={act._id} 
                    activity={act} 
                    onOpen={handleOpenActivity}
                    isPremium={user?.isPremium}
                    isFavorite={user?.favorites?.includes(act._id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="col-span-full py-48 text-center opacity-10">
                  <Trophy size={80} className="mx-auto mb-6" />
                  <p className="font-black uppercase tracking-[0.5em] text-xl">Sense activitats</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* REFINED PREMIUM MODAL */}
      <Modal isOpen={!!selectedActivity} onClose={() => { setSelectedActivity(null); setShowParticipants(false); }} maxWidth="800px">
        {selectedActivity && (
          <div className="activity-modal-premium-final p-0 overflow-hidden font-display bg-[#0c0c10] rounded-[32px] border border-white/10 shadow-2xl relative">
            
            {/* Header */}
            <div className="relative h-[180px] flex items-end p-6 overflow-hidden">
              {selectedActivity.images?.[0] ? (
                <img src={selectedActivity.images[0]} className="absolute inset-0 w-full h-full object-cover scale-110 blur-[1px] opacity-25" alt="BG" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-lime/10 to-transparent"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/85 to-transparent"></div>
              
              <div className="relative z-10 w-full flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-4 py-1 bg-lime text-dark text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-lime/15">
                      {selectedActivity.sport}
                    </span>
                    <span className={`px-4 py-1 border text-[9px] font-black uppercase tracking-widest rounded-lg ${selectedActivity.isFull ? 'border-orange text-orange' : 'border-lime/20 text-lime'}`}>
                      {selectedActivity.isFull ? 'COMPLET' : 'OBERT'}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white uppercase italic">{selectedActivity.title}</h2>
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Details & Address */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-lime mb-3 flex items-center gap-2">
                    <Info size={16} /> Detalls de l'experiència
                  </h4>
                  <p className="text-sm leading-relaxed text-light/80 font-medium italic">
                    "{selectedActivity.description || 'L\'organitzador no ha proporcionat detalls encara.'}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date box */}
                  <div className="flex items-center gap-3.5 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center text-lime shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <span className="text-[8px] font-black tracking-widest text-muted3 block uppercase">HORARI</span>
                      <span className="text-xs font-bold block text-white">{new Date(selectedActivity.date).toLocaleDateString()}</span>
                      <span className="text-xs font-black text-lime">{new Date(selectedActivity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  {/* Location box */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3.5 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-black tracking-widest text-muted3 block uppercase">UBICACIÓ</span>
                        <span className="text-xs font-bold block truncate text-white">{selectedActivity.location?.address || 'Barcelona'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenMaps(selectedActivity.location?.url, selectedActivity.location?.address)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange/10 hover:bg-orange text-orange hover:text-white border border-orange/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      <ExternalLink size={14} /> Maps
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Places, Participants & Join Action */}
              <div className="md:col-span-5 flex flex-col gap-5 justify-between">
                
                {/* Places Card */}
                <div className="bg-[#121217] p-6 rounded-[28px] border border-white/5 shadow-xl flex flex-col justify-between flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-muted3 block uppercase mb-1">PLACES DISPONIBLES</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white leading-none">
                          {selectedActivity.participants?.length || 0}
                        </span>
                        <span className="text-lg font-bold text-muted3">
                          /{selectedActivity.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button 
                      onClick={() => setShowParticipants(!showParticipants)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${showParticipants ? 'bg-lime text-dark border-lime' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em]">Participants</span>
                      </div>
                      <div className={`transition-transform duration-300 ${showParticipants ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} />
                      </div>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showParticipants ? 'max-h-[160px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      {showParticipants && (
                        <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                          {participantsList.length > 0 ? participantsList.map((p, idx) => (
                            <div key={`${p._id || idx}-${idx}`} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-lime/20 transition-all">
                              <div className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center text-lime font-black text-xs shrink-0">
                                {p.name?.[0].toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-light/95 truncate">{p.name}</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-muted3 text-center py-6 opacity-30 italic font-medium">Cap participant encara.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enrollment button */}
                <div className="shrink-0">
                  {selectedActivity.participants?.includes(user?._id) ? (
                    <div className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 shadow-inner">
                      <div className="w-9 h-9 rounded-full bg-lime/15 flex items-center justify-center text-lime shrink-0">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">JA ESTÀS INSCRIT</span>
                      <button 
                        onClick={() => { setSelectedActivity(null); navigate('/profile'); }} 
                        className="text-[9px] font-black text-lime hover:underline cursor-pointer border-none bg-transparent"
                      >
                        VEURE LES MEVES INSCRIPCIONS
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleJoin(selectedActivity._id)}
                      disabled={selectedActivity.isFull}
                      className={`w-full py-4.5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${selectedActivity.isFull ? 'bg-white/5 text-muted3 cursor-not-allowed border border-white/5' : 'bg-lime text-dark hover:scale-[1.03] active:scale-97 shadow-lime/25 border-none'}`}
                    >
                      <Plus size={18} strokeWidth={3} />
                      FER INSCRIPCIÓ
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}
      </Modal>

      {/* NEW MODAL: USER PROFILE PUBLIC VIEW */}
      <Modal isOpen={!!selectedUserProfile} onClose={() => setSelectedUserProfile(null)} maxWidth="500px">
        {selectedUserProfile && (
          <div className="flex flex-col items-center text-center mt-2 relative z-10">
            {selectedUserProfile.loading ? (
              <div className="py-20 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin mb-4"></div>
                <p className="text-lime text-xs font-black tracking-widest uppercase animate-pulse">Carregant Perfil...</p>
              </div>
            ) : (
              <>
                {/* Background glow behind avatar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-lime/10 to-transparent -z-10 rounded-t-[28px] pointer-events-none"></div>
                
                {/* Header */}
                <div className="relative z-20 w-full flex flex-col items-center pt-4">
                  <div className="relative mb-5">
                    {selectedUserProfile.avatar ? (
                      <img src={selectedUserProfile.avatar} alt={selectedUserProfile.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#111116] shadow-2xl" />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-lime/20 to-lime/5 border-4 border-[#111116] shadow-2xl flex items-center justify-center">
                        <User size={48} className="text-lime/50" />
                      </div>
                    )}
                    {selectedUserProfile.isPremium && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lime to-[#a3e635] text-dark text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-lg shadow-lime/20 border border-[#111116] whitespace-nowrap">
                        Premium
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-black text-white tracking-tight">{selectedUserProfile.name}</h2>
                  {selectedUserProfile.bio && (
                    <p className="text-sm text-muted3 mt-3 italic font-medium max-w-sm mx-auto">"{selectedUserProfile.bio}"</p>
                  )}
                  
                  {/* Basic Stats */}
                  <div className="flex items-center gap-4 sm:gap-8 mt-8 bg-white/5 p-4 rounded-2xl border border-white/5 w-full justify-center">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-black text-white">{selectedUserProfile.followersCount}</div>
                      <div className="text-[9px] font-black text-muted3 tracking-[0.2em] uppercase mt-1">Seguidors</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-black text-lime">{selectedUserProfile.total_points}</div>
                      <div className="text-[9px] font-black text-lime/70 tracking-[0.2em] uppercase mt-1">Punts</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-black text-white">{selectedUserProfile.publishedActivitiesCount}</div>
                      <div className="text-[9px] font-black text-muted3 tracking-[0.2em] uppercase mt-1">Activitats</div>
                    </div>
                  </div>
                  
                  {/* Badges Section */}
                  <div className="w-full mt-8 text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted3 mb-4 pl-2 text-center">Insígnies Desbloquejades</h3>
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Medal */}
                      <div className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300 ${selectedUserProfile.publishedActivitiesCount >= 30 ? 'bg-orange/10 border-orange/30' : 'bg-white/5 border-white/5 grayscale opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedUserProfile.publishedActivitiesCount >= 30 ? 'bg-orange/20 text-orange shadow-[0_0_20px_rgba(255,107,43,0.3)]' : 'bg-white/10 text-white'}`}>
                          <Award size={20} />
                        </div>
                        <div>
                          <div className={`text-[10px] font-black tracking-widest uppercase mb-1 ${selectedUserProfile.publishedActivitiesCount >= 30 ? 'text-orange' : 'text-white/60'}`}>Organitzador</div>
                          <div className="text-[9px] text-muted3 font-medium">30 Activitats</div>
                        </div>
                      </div>

                      {/* Star */}
                      <div className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300 ${selectedUserProfile.total_points >= 8000 ? 'bg-lime/10 border-lime/30' : 'bg-white/5 border-white/5 grayscale opacity-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedUserProfile.total_points >= 8000 ? 'bg-lime/20 text-lime shadow-[0_0_20px_rgba(200,245,66,0.3)]' : 'bg-white/10 text-white'}`}>
                          <Trophy size={20} />
                        </div>
                        <div>
                          <div className={`text-[10px] font-black tracking-widest uppercase mb-1 ${selectedUserProfile.total_points >= 8000 ? 'text-lime' : 'text-white/60'}`}>Estrella</div>
                          <div className="text-[9px] text-muted3 font-medium">8000 Punts</div>
                        </div>
                      </div>

                    </div>
                  </div>
                  
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .text-stroke-lime {
          -webkit-text-stroke: 1.5px var(--color-lime);
          color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-lime); }

        .activities-responsive-grid {
          display: grid;
          gap: 32px;
          width: 100%;
          justify-content: center;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .activities-responsive-grid {
            grid-template-columns: repeat(2, minmax(380px, 460px));
          }
        }
        @media (min-width: 1280px) {
          .activities-responsive-grid {
            grid-template-columns: repeat(3, minmax(380px, 460px));
          }
        }
      `}</style>
    </div>
  );
};

export default Explore;
