import React, { useState } from 'react';
import './style-v2.css';
import { X, CheckCircle2 } from 'lucide-react';

const AuthModal = ({ onClose, onLogin, prompt }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : formData;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      if (isLoginMode) {
        onLogin(data.token, data.username, data.email);
        onClose();
      } else {
        if (data.token) {
          onLogin(data.token, data.username, data.email);
          onClose();
        } else {
          setSuccessMsg('Account created! You can now log in.');
          setFormData({ username: '', email: '', password: '' });
          setTimeout(() => {
            setIsLoginMode(true);
            setSuccessMsg('');
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>

        <div className="modal-content">
          <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
          {prompt && <p style={{ color: 'var(--purple-400)', fontSize: '0.9rem', marginBottom: '14px', textAlign: 'center' }}>{prompt}</p>}

          {error && <div className="auth-error">{error}</div>}

          {successMsg && <div className="auth-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircle2 size={16} /> {successMsg}</div>}

          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="form-group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? '...' : isLoginMode ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </form>

          <p style={{ marginTop: '18px', textAlign: 'center', color: 'var(--color-text-2)', fontSize: '0.875rem' }}>
            {isLoginMode ? 'New here? ' : 'Already have an account? '}
            <span className="auth-switch-text" onClick={switchMode}>
              {isLoginMode ? 'Create Account' : 'Log In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;