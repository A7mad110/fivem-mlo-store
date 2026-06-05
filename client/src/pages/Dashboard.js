import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiUser, FiMail, FiCalendar, FiShield, FiCheckCircle, FiXCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

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
          <div className="max-w-container-max mx-auto flex items-center justify-between">
            <span className="text-sm text-error">{t('dashboard.verifyBanner')}</span>
            <Link to="/dashboard" className="text-sm text-error hover:underline font-semibold">{t('dashboard.verifyNow')}</Link>
          </div>
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
