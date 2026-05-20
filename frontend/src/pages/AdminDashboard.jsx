import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Activity, BarChart3, Star, Ban, Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({ users: [], activities: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [deductModal, setDeductModal] = useState({ isOpen: false, user: null });
  const [deductForm, setDeductForm] = useState({ points: '', comment: '' });
  const [editActivityModal, setEditActivityModal] = useState({ isOpen: false, activity: null });
  const [editActivityForm, setEditActivityForm] = useState({
    title: '',
    sport: '',
    description: '',
    date: '',
    maxParticipants: '',
    level: 'Tots',
    address: '',
    url: '',
    status: 'OPEN'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, activitiesRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/activities'),
        api.get('/admin/stats')
      ]);
      setData({
        users: usersRes.data,
        activities: activitiesRes.data,
        stats: statsRes.data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id) => {
    try {
      await api.put(`/admin/users/block/${id}`);
      fetchData();
    } catch (err) { showToast('Error blocking user', 'error'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Eliminar usuari per sempre?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) { showToast('Error deleting user', 'error'); }
  };

  const toggleHide = async (id) => {
    try {
      await api.put(`/admin/activities/hide/${id}`);
      fetchData();
    } catch (err) { showToast('Error hiding activity', 'error'); }
  };

  const deleteActivity = async (id) => {
    if (!confirm('Eliminar activitat i totes les seves inscripcions per sempre?')) return;
    try {
      await api.delete(`/admin/activities/${id}`);
      fetchData();
    } catch (err) { showToast('Error al eliminar l\'activitat', 'error'); }
  };

  const handleEditClick = (activity) => {
    setEditActivityModal({ isOpen: true, activity });
    setEditActivityForm({
      title: activity.title || '',
      sport: activity.sport || '',
      description: activity.description || '',
      date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : '',
      maxParticipants: activity.maxParticipants || '',
      level: activity.level || 'Tots',
      address: activity.location?.address || '',
      url: activity.location?.url || '',
      status: activity.status || 'OPEN'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/activities/${editActivityModal.activity._id}`, editActivityForm);
      showToast('Activitat actualitzada correctament');
      setEditActivityModal({ isOpen: false, activity: null });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualitzar l\'activitat', 'error');
    }
  };

  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/users/deduct-points/${deductModal.user._id}`, {
        points: deductForm.points,
        comment: deductForm.comment
      });
      showToast('Punts restats correctament');
      setDeductModal({ isOpen: false, user: null });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al restar punts', 'error');
    }
  };

  if (loading && !data.stats) {
    return <div className="loader h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  }

  const earningsChartData = {
    labels: data.stats?.earningsHistory?.map(e => e.month) || [],
    datasets: [{
      label: 'Guanys (€)',
      data: data.stats?.earningsHistory?.map(e => e.amount) || [],
      backgroundColor: 'rgba(200, 245, 66, 0.4)',
      borderColor: '#c8f542',
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const growthChartData = {
    labels: data.stats?.userGrowthHistory?.map(m => m.month) || [],
    datasets: [{
      label: 'Usuaris',
      data: data.stats?.userGrowthHistory?.map(m => m.count) || [],
      borderColor: '#ff6b2b',
      backgroundColor: 'rgba(255, 107, 43, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="admin-page py-10 animate-fade-in">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-display text-4xl">ADMIN <span className="text-lime">DASHBOARD</span></h1>
          <p className="text-muted3">Gestió centralitzada de MeetSport</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-lime text-dark shadow-lg' : 'text-muted3'}`}
          >
            Usuaris
          </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'activities' ? 'bg-lime text-dark shadow-lg' : 'text-muted3'}`}
          >
            Activitats
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'stats' ? 'bg-lime text-dark shadow-lg' : 'text-muted3'}`}
          >
            Gràfics
          </button>
        </div>
      </header>

      <div className="tab-container">
        {activeTab === 'users' && (
          <div className="bg-dark2 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-muted3">
                  <th className="px-8 py-4">Usuari</th>
                  <th className="px-8 py-4">Email</th>
                  <th className="px-8 py-4">Pla</th>
                  <th className="px-8 py-4">Estat</th>
                  <th className="px-8 py-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.users.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 font-bold">{u.name}</td>
                    <td className="px-8 py-5 text-sm text-muted3">{u.email}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${u.isPremium ? 'bg-orange/10 text-orange' : 'bg-muted3/10 text-muted3'}`}>
                        {u.isPremium ? 'Premium' : 'Bàsic'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs font-bold ${u.isBlocked ? 'text-red-500' : 'text-lime'}`}>
                        {u.isBlocked ? 'Bloquejat' : 'Actiu'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setDeductModal({ isOpen: true, user: u })} className="p-2 bg-white/5 rounded-lg text-orange hover:bg-orange/20 transition-colors" title="Restar punts">
                          <Star size={16} />
                        </button>
                        <button onClick={() => toggleBlock(u._id)} className="p-2 bg-white/5 rounded-lg text-yellow-500 hover:bg-yellow-500/20 transition-colors" title="Bloquejar">
                          <Ban size={16} />
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-2 bg-white/5 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-dark2 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-muted3">
                  <th className="px-8 py-4">Activitat</th>
                  <th className="px-8 py-4">Creador</th>
                  <th className="px-8 py-4">Esport</th>
                  <th className="px-8 py-4">Visibilitat</th>
                  <th className="px-8 py-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.activities.map(a => (
                  <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 font-bold">{a.title}</td>
                    <td className="px-8 py-5 text-sm text-muted3">{a.creator?.name || 'Anònim'}</td>
                    <td className="px-8 py-5"><span className="tag-sport">{a.sport}</span></td>
                    <td className="px-8 py-5 text-xs">{a.isHidden ? 'Oculta' : 'Visible'}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(a)} className="p-2 bg-white/5 rounded-lg text-lime hover:bg-lime/20 transition-colors" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => toggleHide(a._id)} className="p-2 bg-white/5 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-colors" title="Visibilitat">
                          {a.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => deleteActivity(a._id)} className="p-2 bg-white/5 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && data.stats && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-dark2 p-8 rounded-[32px] border border-white/5 flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted3 tracking-widest uppercase mb-4">Total Usuaris</span>
                <div className="text-5xl font-black">{data.users.length}</div>
              </div>
              <div className="bg-dark2 p-8 rounded-[32px] border border-lime/20 flex flex-col items-center shadow-[0_0_30px_rgba(200,245,66,0.05)]">
                <span className="text-[10px] font-bold text-lime tracking-widest uppercase mb-4">Ingressos Premium</span>
                <div className="text-5xl font-black text-lime">{data.stats.totalEarnings}€</div>
              </div>
              <div className="bg-dark2 p-8 rounded-[32px] border border-white/5 flex flex-col items-center">
                <span className="text-[10px] font-bold text-orange tracking-widest uppercase mb-4">Usuaris Premium</span>
                <div className="text-5xl font-black text-orange">{data.stats.totalPremiumUsers}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-dark2 p-10 rounded-[40px] border border-white/5">
                <h3 className="font-display text-xl mb-10 uppercase tracking-widest">Guanys <span className="text-lime">per mes</span></h3>
                <Bar data={earningsChartData} options={{ responsive: true, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
              </div>
              <div className="bg-dark2 p-10 rounded-[40px] border border-white/5">
                <h3 className="font-display text-xl mb-10 uppercase tracking-widest">Evolució <span className="text-orange">Usuaris</span></h3>
                <Line data={growthChartData} options={{ responsive: true, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deduct Points Modal */}
      <Modal isOpen={deductModal.isOpen} onClose={() => setDeductModal({ isOpen: false, user: null })}>
        <h2 className="font-display text-2xl mb-2">RESTAR <span className="text-orange">PUNTS</span></h2>
        <p className="text-muted3 text-sm mb-6">Usuari: <span className="text-white font-bold">{deductModal.user?.name}</span></p>
        
        <form onSubmit={handleDeductSubmit} className="space-y-6">
          <div className="form-group">
            <label className="label-small">Punts totals actuals</label>
            <div className="text-3xl font-black text-lime">{deductModal.user?.total_points || 0}</div>
          </div>
          
          <div className="form-group">
            <label className="label-small">Punts a restar</label>
            <input 
              type="number" 
              className="input-dark" 
              placeholder="Ex: 50" 
              required 
              min="1"
              value={deductForm.points}
              onChange={e => setDeductForm({...deductForm, points: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="label-small">Motiu / Comentari</label>
            <textarea 
              className="input-dark min-h-[100px]" 
              placeholder="Explica el motiu de la deducció..." 
              required
              value={deductForm.comment}
              onChange={e => setDeductForm({...deductForm, comment: e.target.value})}
            ></textarea>
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={() => setDeductModal({ isOpen: false, user: null })} className="btn-secondary flex-1 py-4">Cancel·lar</button>
            <button type="submit" className="btn-primary flex-1 py-4 bg-orange border-orange">Restar Punts</button>
          </div>
        </form>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal isOpen={editActivityModal.isOpen} onClose={() => setEditActivityModal({ isOpen: false, activity: null })}>
        <h2 className="font-display text-2xl mb-2">EDITAR <span className="text-lime">ACTIVITAT</span></h2>
        <p className="text-muted3 text-sm mb-6">Modifica els detalls de l'activitat</p>
        
        <form onSubmit={handleEditSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label-small">Títol</label>
              <input 
                type="text" 
                className="input-dark" 
                required 
                value={editActivityForm.title}
                onChange={e => setEditActivityForm({...editActivityForm, title: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="label-small">Esport</label>
              <input 
                type="text" 
                className="input-dark" 
                required 
                value={editActivityForm.sport}
                onChange={e => setEditActivityForm({...editActivityForm, sport: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="label-small">Descripció</label>
            <textarea 
              className="input-dark min-h-[100px]" 
              value={editActivityForm.description}
              onChange={e => setEditActivityForm({...editActivityForm, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group">
              <label className="label-small">Data i Hora</label>
              <input 
                type="datetime-local" 
                className="input-dark" 
                required 
                value={editActivityForm.date}
                onChange={e => setEditActivityForm({...editActivityForm, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="label-small">Participants Màxims</label>
              <input 
                type="number" 
                className="input-dark" 
                required 
                min="2"
                value={editActivityForm.maxParticipants}
                onChange={e => setEditActivityForm({...editActivityForm, maxParticipants: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="label-small">Nivell</label>
              <select 
                className="input-dark" 
                value={editActivityForm.level}
                onChange={e => setEditActivityForm({...editActivityForm, level: e.target.value})}
              >
                <option value="Principiant">Principiant</option>
                <option value="Intermedi">Intermedi</option>
                <option value="Avançat">Avançat</option>
                <option value="Tots">Tots</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label-small">Adreça</label>
              <input 
                type="text" 
                className="input-dark" 
                required 
                value={editActivityForm.address}
                onChange={e => setEditActivityForm({...editActivityForm, address: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="label-small">URL de Localització (Maps)</label>
              <input 
                type="url" 
                className="input-dark" 
                value={editActivityForm.url}
                onChange={e => setEditActivityForm({...editActivityForm, url: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label-small">Estat</label>
            <select 
              className="input-dark" 
              value={editActivityForm.status}
              onChange={e => setEditActivityForm({...editActivityForm, status: e.target.value})}
            >
              <option value="OPEN">OPEN</option>
              <option value="FULL">FULL</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="FINALITZADA">FINALITZADA</option>
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setEditActivityModal({ isOpen: false, activity: null })} className="btn-secondary flex-1 py-4">Cancel·lar</button>
            <button type="submit" className="btn-primary flex-1 py-4 bg-lime text-dark">Desar Canvis</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
