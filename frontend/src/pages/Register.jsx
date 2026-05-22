import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error en el registre');
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
          <h1 className="font-display text-2xl">CREA EL TEU <span className="text-lime">COMPTE</span></h1>
          <p className="text-muted3 text-sm">Uneix-te a la comunitat d'esportistes</p>
        </div>

        {error && <div className="error-badge mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="label-small">Nom complet</label>
            <div className="input-with-icon">
              <User size={18} className="icon" />
              <input
                type="text"
                className="input-dark"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="El teu nom"
                required
              />
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="label-small">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="icon" />
              <input
                type="email"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="El teu email"
                required
              />
            </div>
          </div>
          <div className="form-group mb-6">
            <label className="label-small">Contrasenya</label>
            <div className="input-with-icon">
              <Lock size={18} className="icon" />
              <input
                type="password"
                className="input-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Creant compte...
              </>
            ) : (
              'Crear compte'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-muted3 text-xs">
            Ja tens un compte? <Link to="/login" className="text-lime font-bold">Inicia sessió</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
