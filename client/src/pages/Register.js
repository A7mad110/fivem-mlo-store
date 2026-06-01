import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error(t('auth.register.passwordsNoMatch'));
    }
    if (form.password.length < 8) {
      return toast.error(t('auth.register.passwordTooShort'));
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return toast.error(t('auth.register.invalidUsername'));
    }
    setLoading(true);
    try {
      const data = await register(form.username, form.email, form.password);
      toast.success(t('auth.register.accountCreated'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.register.registrationFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> {t('auth.register.username')}</label>
              <input type="text" placeholder={t('auth.register.usernamePlaceholder')} value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label><FiMail /> {t('auth.register.email')}</label>
            <input type="email" placeholder={t('auth.register.emailPlaceholder')} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label><FiLock /> {t('auth.register.password')}</label>
            <div className="password-input">
              <input type={showPassword ? 'text' : 'password'} placeholder={t('auth.register.passwordPlaceholder')}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label><FiLock /> {t('auth.register.confirmPassword')}</label>
            <div className="password-input">
              <input type={showConfirm ? 'text' : 'password'} placeholder={t('auth.register.confirmPlaceholder')} value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('auth.register.creating') : t('auth.register.create')}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.signIn')}</Link></span>
        </div>
      </div>
    </div>
  );
}
