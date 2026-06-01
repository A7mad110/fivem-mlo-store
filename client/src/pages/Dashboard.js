import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiMail, FiCheck, FiCopy, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, api, verifyEmail, resendVerification } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ ordersCount: 0, totalSpent: 0 });
  const [verifyCode, setVerifyCode] = useState('');
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      const orders = data.orders || [];
      setStats({
        ordersCount: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.totalAmount : 0), 0),
      });
    }).catch(() => {});
  }, [api]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyEmail(verifyCode);
      toast.success(t('dashboard.emailVerified'));
      setShowVerify(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('dashboard.verificationFailed'));
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success(t('dashboard.codeResent'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('dashboard.resendFailed'));
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.welcome')} {user?.username}</p>
      </div>

      {!user?.isVerified && (
        <div className="verify-banner">
          <div className="verify-banner-content">
            <FiMail size={20} />
            <span>{t('dashboard.verifyBanner')}</span>
          </div>
          <div className="verify-banner-actions">
            {!showVerify ? (
              <>
                <button className="btn-secondary btn-sm" onClick={() => setShowVerify(true)}>{t('dashboard.enterCode')}</button>
                <button className="btn-link" onClick={handleResend}>{t('dashboard.resend')}</button>
              </>
            ) : (
              <form onSubmit={handleVerify} className="verify-form">
                <input type="text" placeholder={t('dashboard.codePlaceholder')} maxLength={6} value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)} required />
                <button type="submit" className="btn-primary btn-sm">{t('dashboard.verify')}</button>
                <button type="button" className="btn-link" onClick={() => setShowVerify(false)}>{t('dashboard.cancel')}</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <FiShoppingCart size={24} />
          <div>
            <span className="stat-value">{stats.ordersCount}</span>
            <span className="stat-label">{t('dashboard.orders')}</span>
          </div>
        </div>
        <div className="stat-card">
          <FiPackage size={24} />
          <div>
            <span className="stat-value">${stats.totalSpent.toFixed(2)}</span>
            <span className="stat-label">{t('dashboard.totalSpent')}</span>
          </div>
        </div>
        <div className="stat-card">
          <FiUser size={24} />
          <div>
            <span className="stat-value">{user?.username}</span>
            <span className="stat-label">{t('dashboard.account')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{t('dashboard.accountInfo')}</h3>
          <div className="info-row"><span>{t('dashboard.email')}</span><span>{user?.email} {user?.isVerified && <FiCheck className="verified" />}</span></div>
          <div className="info-row"><span>{t('dashboard.username')}</span><span>{user?.username}</span></div>
          <div className="info-row"><span>{t('dashboard.role')}</span><span className="role-badge">{user?.role}</span></div>
          <div className="info-row"><span>{t('dashboard.joined')}</span><span>{new Date(user?.createdAt).toLocaleDateString()}</span></div>
          {user?.discordId && (
            <div className="info-row"><span>{t('dashboard.discord')}</span><span><FiCheck className="verified" /> {t('dashboard.connected')}</span></div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>{t('dashboard.quickActions')}</h3>
          <Link to="/shop" className="quick-action"><FiPackage /> {t('dashboard.browseProducts')}</Link>
          <Link to="/dashboard/orders" className="quick-action"><FiShoppingCart /> {t('dashboard.viewOrders')}</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="quick-action"><FiUser /> {t('dashboard.adminPanel')}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
