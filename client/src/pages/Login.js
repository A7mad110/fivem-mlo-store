import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleDiscordLogin = () => {
    window.location.href = `${API}/auth/discord`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your purchases</p>
        </div>

        <button className="discord-btn" onClick={handleDiscordLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 18.032 18.032 0 001.079-1.767.075.075 0 00-.041-.106 13.11 13.11 0 01-1.63-.786.077.077 0 01-.015-.123c.11-.082.22-.168.325-.253a.076.076 0 01.078-.01c3.408 1.558 7.102 1.558 10.472 0a.076.076 0 01.08.01c.106.085.216.171.325.253a.077.077 0 01-.015.123 12.22 12.22 0 01-1.63.786.075.075 0 00-.04.107c.32.61.69 1.2 1.078 1.766a.078.078 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Continue with Discord
        </button>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail /> Email</label>
            <input type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label><FiLock /> Password</label>
            <div className="password-input">
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>Don't have an account? <Link to="/register">Sign Up</Link></span>
        </div>
      </div>
    </div>
  );
}
