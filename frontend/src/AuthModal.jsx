// src/AuthModal.jsx
import React, { useState } from 'react';
import './style-v2.css';

const AuthModal = ({ onClose, onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const payload = isLoginMode
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
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
                alert("Account created! Please log in.");
                setIsLoginMode(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">

                {/* --- X BUTTON ADDED HERE --- */}
                {/* This uses your existing .close-btn class from style-v2.css */}
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="modal-content">
                    <h2>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>

                    {error && (
                        <div style={{ color: '#ff2e2e', marginBottom: '10px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLoginMode && (
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
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
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="submit" className="btn-primary">
                                {isLoginMode ? 'Log In' : 'Sign Up'}
                            </button>
                            {/* Optional: You can keep the bottom Cancel button or remove it since you have the X now */}
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>

                    <p style={{ marginTop: '15px', textAlign: 'center', color: '#ccc', fontSize: '0.9rem' }}>
                        {isLoginMode ? "New here? " : "Already have an account? "}
                        <span
                            className="auth-switch-text"
                            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                            // ADD THIS LINE BELOW:
                            style={{ color: '#BB86FC', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                        >
                            {isLoginMode ? "Create Account" : "Log In"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;