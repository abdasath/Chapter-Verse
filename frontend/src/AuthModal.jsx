import React, { useState } from 'react';
import './style-v2.css';
import { X, CheckCircle2, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const AuthModal = ({ onClose, onLogin, prompt }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [animDirection, setAnimDirection] = useState('forward');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = (targetMode) => {
    setAnimDirection(targetMode ? 'backward' : 'forward');
    setIsLoginMode(targetMode);
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[0-9]/.test(pass)) score++;
    if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 1) return { score: 1, label: 'Weak', color: '#f87171' };
    if (score === 2) return { score: 2, label: 'Good', color: '#c084fc' };
    return { score: 3, label: 'Strong', color: '#34d399' };
  };

  const passwordStrength = !isLoginMode ? calculatePasswordStrength(formData.password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLoginMode && !formData.username.trim()) {
      setError('Please choose a username for your profile.');
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
      if (!res.ok) throw new Error(data.message || 'Authentication failed. Please verify your details.');

      if (isLoginMode) {
        onLogin(data.token, data.username, data.email);
        onClose();
      } else {
        if (data.token) {
          onLogin(data.token, data.username, data.email);
          onClose();
        } else {
          setSuccessMsg('Account created successfully! Preparing your library…');
          setFormData({ username: '', email: '', password: '' });
          setTimeout(() => {
            toggleMode(true);
            setSuccessMsg('');
          }, 1800);
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
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Equal spacing close button */}
        <button className="close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={17} />
        </button>

        {/* Animated Container for Smooth Mode Transitions */}
        <div
          key={isLoginMode ? 'mode-login' : 'mode-register'}
          className={`auth-flow-wrapper ${animDirection === 'forward' ? 'auth-flow-forward' : 'auth-flow-backward'}`}
        >
          {/* Header */}
          <div className="auth-card-header">
            <h2 className="auth-brand-title">
              {isLoginMode ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="auth-brand-subtitle">
              {isLoginMode
                ? 'Sign in to access your digital bookshelf and downloads'
                : 'Join ChapterVerse to discover, read, and save books'}
            </p>
          </div>

          {/* Prompt banner if redirected from download gate */}
          {prompt && (
            <div className="auth-prompt-pill">
              <Lock size={15} />
              <span>{prompt}</span>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-success-banner">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Focused Form */}
          <form onSubmit={handleSubmit} className="auth-form-body">
            {!isLoginMode && (
              <div className="auth-input-group auth-field-fade">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><User size={16} /></span>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose your reader handle"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                {!isLoginMode && passwordStrength && passwordStrength.score > 0 && (
                  <span className="auth-strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength progress bar for registration */}
              {!isLoginMode && formData.password.length > 0 && (
                <div className="auth-strength-meter">
                  <div
                    className="auth-strength-bar"
                    style={{
                      width: `${(passwordStrength.score / 3) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-btn-spinner" />
              ) : (
                <>
                  <span>{isLoginMode ? 'Sign In to ChapterVerse' : 'Complete Registration'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Dedicated Interactive Bottom Dock */}
        <div className="auth-bottom-dock">
          <div className="auth-dock-inner">
            <span className="auth-dock-question">
              {isLoginMode ? 'New to ChapterVerse?' : 'Already have an account?'}
            </span>
            <button
              type="button"
              className="auth-dock-action-pill"
              onClick={() => toggleMode(!isLoginMode)}
            >
              <span>{isLoginMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={14} className="dock-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;