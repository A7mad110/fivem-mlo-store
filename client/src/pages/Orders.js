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
    const fetchOrders = () => api.get('/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {});
    fetchOrders().finally(() => setLoading(false));
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [api]);

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheck className="text-accent-electric" size={16} />;
      case 'processing': return <FiClock className="text-primary" size={16} />;
      case 'pending': return <FiClock className="text-yellow-400" size={16} />;
      case 'cancelled': case 'failed': return <FiX className="text-error" size={16} />;
      default: return <FiPackage className="text-text-muted" size={16} />;
    }
  };

  const statusText = (status) => {
    switch (status) {
      case 'completed': return t('orders.status.completed');
      case 'processing': return t('orders.status.processing');
      case 'pending': return t('orders.status.pending');
      case 'cancelled': return t('orders.status.cancelled');
      case 'failed': return t('orders.status.failed');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-screen"><div className="loader" /></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('orders.title')}</h1>
        <p>{orders.length} {orders.length === 1 ? t('orders.order') : t('orders.orders')}</p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        {orders.length === 0 ? (
          <div className="empty-state min-h-[40vh] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
              <FiPackage size={36} className="text-text-muted" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('orders.empty')}</h2>
            <p className="text-text-muted mt-2 mb-6">{t('orders.emptyDesc')}</p>
            <Link to="/shop" className="btn-primary-custom">{t('orders.browseProducts')}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className={`glass-card rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-on-surface font-bold">
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-accent-electric/10 text-accent-electric' :
                      order.status === 'processing' ? 'bg-primary/10 text-primary' :
                      order.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                      order.status === 'cancelled' || order.status === 'failed' ? 'bg-error/10 text-error' :
                      'bg-surface-variant/30 text-text-muted'
                    }`}>
                      {statusIcon(order.status)} {statusText(order.status)}
                    </span>
                  </div>
                  <span className="text-text-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-outline-variant/10 last:border-0">
                      <span className="text-on-surface">{item.name || item.product?.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-text-muted">x{item.quantity}</span>
                        <span className="font-price-tag text-price-tag text-primary text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    {t('orders.total')}: <span className="font-price-tag text-price-tag text-primary">
                      ${(order.totalAmount || order.totalPrice || 0).toFixed(2)}
                    </span>
                  </span>
                  <span className="text-text-muted text-xs">
                    {t('orders.paidVia')} {order.paymentMethod || 'Stripe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
