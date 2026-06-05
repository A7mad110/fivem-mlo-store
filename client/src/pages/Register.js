import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
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

    if (form.password !== form.confirmPassword) {
      return setError(t('register.passwordsDoNotMatch'));
    }
    if (form.password.length < 6) {
      return setError(t('register.passwordMin'));
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="main-content min-h-screen flex items-center justify-center px-margin-edge py-20">
      <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t('register.title')}</h1>
          <p className="text-text-muted mt-2">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.username')}</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" name="username" value={form.username} onChange={handleChange} className="form-input pl-10" placeholder={t('register.usernamePlaceholder')} required />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.email')}</label>
            <div className="relative">
              <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input pl-10" placeholder={t('register.emailPlaceholder')} required />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.password')}</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="form-input pl-10 pr-10" placeholder={t('register.passwordPlaceholder')} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('register.confirmPassword')}</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input pl-10 pr-10" placeholder={t('register.confirmPasswordPlaceholder')} required />
            </div>
          </div>
          {error && <div className="text-error text-sm bg-error-container/10 p-3 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary-custom w-full flex items-center justify-center py-3.5 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('register.submit')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20" /></div>
          <div className="relative flex justify-center"><span className="bg-[#0F0F1A] px-4 text-text-muted text-xs">{t('register.or')}</span></div>
        </div>

        <button onClick={handleDiscordLogin} className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant/30 transition-all duration-200">
          <FaDiscord size={20} className="text-primary" />
          {t('register.discord')}
        </button>

        <p className="text-center mt-6 text-text-muted text-sm">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
}
