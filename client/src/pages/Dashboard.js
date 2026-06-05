import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiUser, FiMail, FiCalendar, FiShield, FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiSend } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, verifyEmail, resendVerification } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showVerify, setShowVerify] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleVerify = async () => {
    if (!code) return;
    setVerifying(true);
    try {
      await verifyEmail(code);
      toast.success(t('dashboard.emailVerified'));
      setShowVerify(false);
      setCode('');
    } catch {
      toast.error(t('dashboard.verificationFailed'));
    }
    setVerifying(false);
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success(t('dashboard.codeResent'));
    } catch {
      toast.error(t('dashboard.resendFailed'));
    }
  };

  const stats = [
    { icon: FiPackage, value: user.purchases?.length || 0, label: t('dashboard.totalPurchases') },
    { icon: FiShoppingCart, value: user.orderCount || 0, label: t('dashboard.totalOrders') },
    { icon: FiCalendar, value: new Date(user.createdAt).toLocaleDateString(), label: t('dashboard.memberSince') },
    { icon: FiShield, value: user.role === 'admin' ? t('dashboard.admin') : t('dashboard.user'), label: t('dashboard.role') },
  ];

  return (
    <div className="main-content">
      {/* Verify banner */}
      {!user.verified && (
        <div className="bg-error-container/20 border-b border-error/20 px-margin-edge py-3">
          <div className="max-w-container-max mx-auto flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-error">{t('dashboard.verifyBanner')}</span>
            <button onClick={() => setShowVerify(!showVerify)} className="text-sm text-error hover:underline font-semibold">{t('dashboard.verifyNow')}</button>
          </div>
          {showVerify && (
            <div className="max-w-container-max mx-auto mt-3 flex items-center gap-3">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={t('dashboard.codePlaceholder')}
                className="form-input max-w-[200px] text-center tracking-widest"
                maxLength={6}
              />
              <button onClick={handleVerify} disabled={verifying || !code} className="btn-primary-custom text-sm py-2 px-4 disabled:opacity-50">
                {verifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('dashboard.verify')}
              </button>
              <button onClick={handleResend} className="btn-secondary-custom text-sm py-2 px-4">
                <FiSend size={14} /> {t('dashboard.resend')}
              </button>
              <button onClick={() => { setShowVerify(false); setCode(''); }} className="text-text-muted hover:text-on-surface text-sm">{t('dashboard.cancel')}</button>
            </div>
          )}
        </div>
      )}

      <div className="page-header">
        <div className="flex items-center gap-4 mb-2">
          <img
            src={user.discordAvatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff&bold=true`}
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
          />
          <div>
            <h1>{t('dashboard.welcome')}, {user.username}</h1>
            <p className="text-text-muted mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center mx-auto mb-3">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div className="font-price-tag text-price-tag text-on-surface">{stat.value}</div>
              <div className="text-text-muted text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-label-caps text-label-caps text-on-surface mb-4">{t('dashboard.accountInfo')}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <FiUser size={16} className="text-text-muted" />
              <span className="text-text-muted">{t('dashboard.username')}:</span>
              <span className="text-on-surface">{user.username}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiMail size={16} className="text-text-muted" />
              <span className="text-text-muted">{t('dashboard.email')}:</span>
              <span className="text-on-surface">{user.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiCalendar size={16} className="text-text-muted" />
              <span className="text-text-muted">{t('dashboard.joined')}:</span>
              <span className="text-on-surface">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {user.verified ? (
                <FiCheckCircle size={16} className="text-accent-electric" />
              ) : (
                <FiXCircle size={16} className="text-error" />
              )}
              <span className="text-text-muted">{t('dashboard.status')}:</span>
              <span className={user.verified ? 'text-accent-electric' : 'text-error'}>
                {user.verified ? t('dashboard.verified') : t('dashboard.unverified')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-label-caps text-label-caps text-on-surface mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/dashboard/orders" className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <FiShoppingCart size={18} className="text-primary" />
                <span className="text-sm text-on-surface">{t('dashboard.viewOrders')}</span>
              </div>
              <FiArrowRight size={16} className="text-text-muted" />
            </Link>
            <Link to="/shop" className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <FiPackage size={18} className="text-primary" />
                <span className="text-sm text-on-surface">{t('dashboard.browseProducts')}</span>
              </div>
              <FiArrowRight size={16} className="text-text-muted" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
