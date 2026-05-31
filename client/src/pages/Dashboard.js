import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiMail, FiCheck, FiCopy, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, api, verifyEmail, resendVerification } = useAuth();
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
      toast.success('Email verified!');
      setShowVerify(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success('Verification code resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      {!user?.isVerified && (
        <div className="verify-banner">
          <div className="verify-banner-content">
            <FiMail size={20} />
            <span>Please verify your email address to access all features.</span>
          </div>
          <div className="verify-banner-actions">
            {!showVerify ? (
              <>
                <button className="btn-secondary btn-sm" onClick={() => setShowVerify(true)}>Enter Code</button>
                <button className="btn-link" onClick={handleResend}>Resend</button>
              </>
            ) : (
              <form onSubmit={handleVerify} className="verify-form">
                <input type="text" placeholder="6-digit code" maxLength={6} value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)} required />
                <button type="submit" className="btn-primary btn-sm">Verify</button>
                <button type="button" className="btn-link" onClick={() => setShowVerify(false)}>Cancel</button>
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
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <FiPackage size={24} />
          <div>
            <span className="stat-value">${stats.totalSpent.toFixed(2)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
        <div className="stat-card">
          <FiUser size={24} />
          <div>
            <span className="stat-value">{user?.username}</span>
            <span className="stat-label">Account</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Account Info</h3>
          <div className="info-row"><span>Email</span><span>{user?.email} {user?.isVerified && <FiCheck className="verified" />}</span></div>
          <div className="info-row"><span>Username</span><span>{user?.username}</span></div>
          <div className="info-row"><span>Role</span><span className="role-badge">{user?.role}</span></div>
          <div className="info-row"><span>Joined</span><span>{new Date(user?.createdAt).toLocaleDateString()}</span></div>
          {user?.discordId && (
            <div className="info-row"><span>Discord</span><span><FiCheck className="verified" /> Connected</span></div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <Link to="/shop" className="quick-action"><FiPackage /> Browse Products</Link>
          <Link to="/dashboard/orders" className="quick-action"><FiShoppingCart /> View Orders</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="quick-action"><FiUser /> Admin Panel</Link>
          )}
        </div>
      </div>
    </div>
  );
}
