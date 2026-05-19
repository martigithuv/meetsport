import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MapPin, Users, Calendar, Trophy, Info, ExternalLink, ChevronDown, ChevronUp, X, Check, ShieldCheck } from 'lucide-react';
import ActivityCard from '../components/activity/ActivityCard';
import Modal from '../components/ui/Modal';
import { Link, useNavigate } from 'react-router-dom';

const Explore = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchActivities();
  }, []);

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
        
        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-4xl">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted3 group-focus-within:text-lime transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Cerca per títol o esport..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-base text-white outline-none focus:border-lime/40 focus:bg-white/[0.08] transition-all shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/create" className="btn-primary flex items-center justify-center gap-3 px-10 py-6 shadow-2xl shadow-lime/20 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
            <Plus size={20} strokeWidth={3} /> Nova Activitat
          </Link>
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
        {user?.isPremium && (
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
          {loading ? (
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
