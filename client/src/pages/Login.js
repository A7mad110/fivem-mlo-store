import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const API = process.env.REACT_APP_API_URL || '';

export default function Login() {
  const { t } = useLanguage();
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setLocalError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    window.location.href = `${API}/api/auth/discord`;
  };

  return (
    <div className="main-content min-h-screen flex items-center justify-center px-margin-edge py-20">
      <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{t('login.title')}</h1>
          <p className="text-text-muted mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">
              {t('login.email')}
            </label>
            <div className="relative">
              <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">
              {t('login.password')}
            </label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-input pl-10 pr-10"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          {localError && (
            <div className="text-error text-sm bg-error-container/10 p-3 rounded-lg">{localError}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-custom w-full flex items-center justify-center py-3.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t('login.submit')
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20" /></div>
          <div className="relative flex justify-center"><span className="bg-[#0F0F1A] px-4 text-text-muted text-xs">{t('login.or')}</span></div>
        </div>

        <button
          onClick={handleDiscordLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant/30 transition-all duration-200"
        >
          <FaDiscord size={20} className="text-primary" />
          {t('login.discord')}
        </button>

        <p className="text-center mt-6 text-text-muted text-sm">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline">{t('login.signup')}</Link>
        </p>
      </div>
    </div>
  );
}
