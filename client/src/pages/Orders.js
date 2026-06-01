import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDownload, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Orders() {
  const { api } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheck className="status-completed" />;
      case 'pending': return <FiClock className="status-pending" />;
      case 'failed': return <FiX className="status-failed" />;
      default: return <FiPackage />;
    }
  };

  const statusText = (status) => {
    switch (status) {
      case 'completed': return t('orders.status.completed');
      case 'pending': return t('orders.status.pending');
      case 'failed': return t('orders.status.failed');
      default: return status;
    }
  };

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>{t('orders.title')}</h1>
        <p>{orders.length} {orders.length === 1 ? t('orders.order') : t('orders.orders')}</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} />
          <h2>{t('orders.empty')}</h2>
          <p>{t('orders.emptyDesc')}</p>
          <Link to="/shop" className="btn-primary">{t('orders.browseProducts')}</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className={`order-card status-${order.status}`}>
              <div className="order-header">
                <div className="order-id">
                  <span className="order-number">#{order._id.toString().slice(-8).toUpperCase()}</span>
                  <span className={`order-status ${order.status}`}>
                    {statusIcon(order.status)} {statusText(order.status)}
                  </span>
                </div>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="order-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span className="order-total">{t('orders.total')}: ${order.totalAmount.toFixed(2)}</span>
                <span className="order-payment">{t('orders.paidVia')} {order.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
