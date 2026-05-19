import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Camera, X, Plus, Calendar, MapPin, Info } from 'lucide-react';

const CreateActivity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    level: '',
    maxParticipants: 4,
    date: '',
    address: '',
    locationUrl: '',
    description: ''
  });
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      location: {
        address: formData.address,
        url: formData.locationUrl
      },
      images
    };

    try {
      await api.post('/activities', payload);
      alert('Activitat creada correctament!');
      navigate('/explore');
    } catch (err) {
      alert(err.response?.data?.message || 'Error en crear l\'activitat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-activity-page py-10">
      <div className="form-container max-w-[1050px] w-full mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl mb-2">Crea una nova <span className="text-lime">activitat</span></h1>
          <p className="text-muted3">Organitza el teu propi esdeveniment esportiu</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-dark2 p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="form-group md:col-span-2">
              <label className="label-small">Títol de l'activitat</label>
              <input 
                type="text" 
                className="input-dark" 
                placeholder="Ex: Partit de Pàdel 2vs2" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="label-small">Esport</label>
              <select 
                className="input-dark" 
                required
                value={formData.sport}
                onChange={e => setFormData({...formData, sport: e.target.value})}
              >
                <option value="">Selecciona un esport</option>
                <option value="padel">Pàdel</option>
                <option value="tennis">Tennis</option>
                <option value="football">Futbol</option>
                <option value="futsal">Futbol Sala</option>
                <option value="basketball">Bàsquet</option>
                <option value="volleyball">Voleibol</option>
                <option value="running">Running</option>
                <option value="cycling">Ciclisme</option>
                <option value="swimming">Natació</option>
                <option value="gym">Gimnàs / Fitness</option>
                <option value="yoga">Ioga</option>
                <option value="hiking">Senderisme</option>
                <option value="climbing">Escalada</option>
                <option value="surf">Surf / Paddle surf</option>
                <option value="skiing">Esquí / Snowboard</option>
                <option value="boxing">Boxa / Arts Marcials</option>
                <option value="golf">Golf</option>
                <option value="altres">Altres</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label-small">Nivell</label>
              <select 
                className="input-dark" 
                required
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
              >
                <option value="">Selecciona un nivell</option>
                <option value="Principiant">Principiant</option>
                <option value="Intermedi">Intermedi</option>
                <option value="Avançat">Avançat</option>
                <option value="Tots">Tots els nivells</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label-small">Màxim de participants</label>
              <input 
                type="number" 
                className="input-dark" 
                min="2" 
                required
                value={formData.maxParticipants}
                onChange={e => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
              />
            </div>

            <div className="form-group">
              <label className="label-small">Data i Hora</label>
              <input 
                type="datetime-local" 
                className="input-dark" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="label-small">Adreça</label>
              <input 
                type="text" 
                className="input-dark" 
                placeholder="Ex: Carrer de l'Esport, 123" 
                required
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="label-small">Enllaç Google Maps (Opcional)</label>
              <input 
                type="url" 
                className="input-dark" 
                placeholder="Ex: https://maps.google.com/..." 
                value={formData.locationUrl}
                onChange={e => setFormData({...formData, locationUrl: e.target.value})}
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="label-small">Descripció</label>
              <textarea 
                className="input-dark min-h-[100px]" 
                placeholder="Explica els detalls de l'activitat..." 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group md:col-span-2">
              <label className="label-small">Imatges (Opcional)</label>
              <div className="image-upload-area border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-lime/50 transition-colors cursor-pointer relative">
                <Camera size={40} className="mx-auto mb-3 text-lime" />
                <p className="text-muted3 text-sm">Arrossega o prem per pujar imatges</p>
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ maxWidth: '180px', width: '100%', padding: '12px 20px', fontSize: '16px', fontWeight: '900' }}
              disabled={loading}
            >
              {loading ? 'Publicant...' : 'Publicar Activitat'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CreateActivity;
