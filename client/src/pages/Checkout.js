import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiCheck, FiCreditCard, FiUser, FiPercent } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { api, user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const finalTotal = Math.max(0, totalPrice - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        totalAmount: totalPrice,
        productCategories: categories.length > 0 ? categories : undefined,
      });
      setAppliedCoupon(data.coupon);
      setDiscount(data.discount);
      toast.success(`${t('checkout.couponApplied')}${data.discount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.invalidCoupon'));
      setAppliedCoupon(null);
      setDiscount(0);
    }
    setCouponLoading(false);
  };

  if (items.length === 0 && !completed) {
    return (
      <div className="empty-cart">
        <h2>{t('checkout.empty')}</h2>
        <Link to="/shop" className="btn-primary">{t('cart.browseProducts')}</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ productId: i.productId, quantity: i.quantity }));
      const { data } = await api.post('/orders', { items: orderItems, paymentMethod: 'stripe' });

      if (data.clientSecret) {
        toast.success('Payment processing (demo mode)');
      }

      await api.post('/orders/confirm', { paymentId: data.order.paymentId || 'demo_' + Date.now() });
      clearCart();
      setCompleted(true);
      toast.success(t('checkout.orderSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.checkoutFailed'));
    }
    setLoading(false);
  };

  if (completed) {
    return (
      <div className="checkout-success">
        <div className="success-icon"><FiCheck /></div>
        <h1>{t('checkout.success.title')}</h1>
        <p>{t('checkout.success.subtitle')}</p>
        <div className="success-actions">
          <Link to="/dashboard/orders" className="btn-primary">{t('checkout.success.viewOrders')}</Link>
          <Link to="/shop" className="btn-secondary">{t('checkout.success.continueShopping')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>{t('checkout.title')}</h1>
      </div>

      <div className="checkout-grid">
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h3><FiUser /> {t('checkout.account')}</h3>
            <p>{user?.email} {user?.isVerified && <FiCheck className="verified-icon" />}</p>
          </div>

          <div className="checkout-card">
            <h3><FiCreditCard /> {t('checkout.payment')}</h3>
            <div className="payment-methods">
              <label className="payment-option selected">
                <input type="radio" name="payment" defaultChecked />
                <span className="payment-label">
                  <FiCreditCard /> {t('checkout.creditCard')}
                </span>
                <span className="payment-badges">Visa MC AMEX</span>
              </label>
              <div className="payment-note">
                <FiLock /> {t('checkout.securePayment')}
              </div>
            </div>
          </div>

          <button className="btn-primary btn-large btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? t('checkout.processing') : `${t('checkout.pay')} $${finalTotal.toFixed(2)}`}
          </button>
        </div>

        <div className="checkout-summary">
          <h3>{t('checkout.orderSummary')}</h3>
          <div className="checkout-coupon">
            {appliedCoupon ? (
              <div className="applied-coupon">
                <span><FiPercent /> {appliedCoupon.code}</span>
                <span>-${discount.toFixed(2)}</span>
                <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} className="remove-coupon">×</button>
              </div>
            ) : (
              <div className="coupon-input">
                <input type="text" placeholder={t('checkout.couponCode')} value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                  {couponLoading ? '...' : t('checkout.apply')}
                </button>
              </div>
            )}
          </div>
          {items.map(item => (
            <div key={item.productId} className="checkout-item">
              <div className="checkout-item-info">
                <span className="checkout-item-name">{item.name}</span>
                <span className="checkout-item-qty">x{item.quantity}</span>
              </div>
              <span className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-divider"></div>
          <div className="checkout-total">
            <span>{t('checkout.subtotal')}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="checkout-total checkout-discount">
              <span>{t('checkout.discount')}</span>
              <span style={{ color: '#10b981' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="checkout-divider"></div>
          <div className="checkout-total">
            <span>{t('checkout.total')}</span>
            <span className="checkout-total-price">${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
