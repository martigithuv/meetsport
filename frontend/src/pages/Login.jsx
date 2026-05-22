import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const { login, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sessió');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginAdmin(adminPassword);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Contrasenya d\'administrador incorrecta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ padding: '3.5rem', maxWidth: '550px' }}>
        <div className="text-center mb-8">
          <div className="logo-box-large mb-4">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="font-display text-2xl">BENVINGUT DE <span className="text-lime">NOU</span></h1>
          <p className="text-muted3 text-sm">Entra a la comunitat de MeetSport</p>
        </div>

        {error && <div className="error-badge mb-4">{error}</div>}

        {!showAdminLogin ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-4">
                <label className="label-small">Email</label>
                <input 
                  type="email" 
                  className="input-dark" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="El teu nom." 
                  required 
                />
              </div>
              <div className="form-group mb-6">
                <label className="label-small">Contrasenya</label>
                <input 
                  type="password" 
                  className="input-dark" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Iniciant sessió...
                  </>
                ) : (
                  'Inicia sessió'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted3 text-xs mb-4">
                No tens compte? <Link to="/register" className="text-lime font-bold">Registra't aquí</Link>
              </p>
              
              <button 
                type="button"
                onClick={() => { setShowAdminLogin(true); setError(''); }}
                className="text-muted3 text-xs hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ShieldCheck size={14} /> Entrar com a Admin
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group mb-6">
                <label className="label-small">Contrasenya d'Administrador</label>
                <input 
                  type="password" 
                  className="input-dark border-orange focus:border-orange/80" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Introdueix la contrasenya" 
                  required 
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full bg-orange text-white hover:bg-orange/80 shadow-orange/20 flex items-center justify-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Accedint al panell...
                  </>
                ) : (
                  'Accedir al panell d\'Admin'
                )}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => { setShowAdminLogin(false); setError(''); setAdminPassword(''); }}
                className="text-muted3 text-xs hover:text-white transition-colors"
              >
                ← Tornar al login d'usuari
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
