import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return toast.error('Username must be 3-20 characters (letters, numbers, underscores only)');
    }
    setLoading(true);
    try {
      const data = await register(form.username, form.email, form.password);
      toast.success('Account created! Check your email for verification code.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join thousands of server owners</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Username</label>
              <input type="text" placeholder="3-20 chars (letters, numbers, underscores)" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label><FiMail /> Email</label>
            <input type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label><FiLock /> Password</label>
            <div className="password-input">
              <input type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label><FiLock /> Confirm Password</label>
            <div className="password-input">
              <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? <Link to="/login">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
