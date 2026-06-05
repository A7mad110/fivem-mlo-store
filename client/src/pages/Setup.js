import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function Setup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError(t('register.passwordsDoNotMatch'));
    setLoading(true);
    try {
      await axios.post('/api/auth/setup', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content min-h-screen flex items-center justify-center px-margin-edge py-20">
      <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-primary" />
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t('setup.title')}</h1>
          <p className="text-text-muted mt-2">{t('setup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.username')}</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" name="username" value={form.username} onChange={handleChange} className="form-input pl-10" required />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.email')}</label>
            <div className="relative">
              <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input pl-10" required />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.password')}</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="form-input pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.confirmPassword')}</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input pl-10 pr-10" required />
            </div>
          </div>
          {error && <div className="text-error text-sm bg-error-container/10 p-3 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary-custom w-full flex items-center justify-center py-3.5 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('setup.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
