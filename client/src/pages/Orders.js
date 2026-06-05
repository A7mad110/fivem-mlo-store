import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiCheckCircle, FiXCircle, FiClock, FiPackage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const statusIcon = {
  pending: FiClock,
  completed: FiCheckCircle,
  cancelled: FiXCircle,
  processing: FiClock,
};

const statusColor = {
  pending: 'text-yellow-400',
  completed: 'text-accent-electric',
  cancelled: 'text-error',
  processing: 'text-primary',
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('orders.title')}</h1>
        <p>{t('orders.subtitle')}</p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        {loading ? (
          <div className="loading-screen">
            <div className="loader" />
            <p>{t('orders.loading')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state min-h-[40vh] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
              <FiShoppingCart size={36} className="text-text-muted" />
            </div>
            <h2>{t('orders.empty')}</h2>
            <p className="text-text-muted mb-6">{t('orders.emptyDesc')}</p>
            <Link to="/shop" className="btn-primary-custom">{t('orders.browseProducts')}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const StatusIcon = statusIcon[order.status] || FiClock;
              return (
                <div key={order._id} className="glass-card rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="font-label-caps text-label-caps text-xs text-text-muted">{t('orders.orderId')}</span>
                      <div className="font-mono text-sm text-on-surface break-all">{order._id}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1.5 text-sm ${statusColor[order.status] || 'text-text-muted'}`}>
                        <StatusIcon size={16} />
                        {order.status}
                      </span>
                      <span className="font-price-tag text-price-tag text-primary">
                        ${order.totalPrice?.toFixed(2) || order.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item, i) => (
                      <span key={i} className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs text-text-muted">
                        {item.name || item.product?.name || 'Product'} × {item.quantity || 1}
                      </span>
                    ))}
                  </div>
                  <div className="text-text-muted text-xs mt-3">
                    {new Date(order.createdAt).toLocaleDateString()} — {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
