import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCreditCard, FiUser, FiCheckCircle, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Checkout() {
  const { t } = useLanguage();
  const { items: cart, totalPrice, clearCart } = useCart();
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    try {
      const res = await api.post('/coupons/validate', { code: coupon, totalAmount: totalPrice });
      setCouponDiscount(res.data.discount || 0);
      setCouponMsg(t('checkout.couponSuccess'));
    } catch {
      setCouponDiscount(0);
      setCouponMsg(t('checkout.couponInvalid'));
    }
  };

  const finalTotal = Math.max(0, totalPrice - couponDiscount);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        coupon: coupon || undefined,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        clearCart();
        setSuccess(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <div className="main-content">
        <div className="empty-state min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <FiShoppingCart size={36} className="text-text-muted" />
          </div>
          <h2>{t('cart.empty')}</h2>
          <Link to="/shop" className="btn-primary-custom mt-6">{t('cart.browseProducts')}</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="main-content">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-margin-edge text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center mb-6">
            <FiCheckCircle size={36} className="text-primary" />
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">{t('checkout.successTitle')}</h1>
          <p className="text-text-muted mb-6 max-w-md">{t('checkout.successDesc')}</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/dashboard/orders')} className="btn-primary-custom">{t('checkout.viewOrders')}</button>
            <button onClick={() => navigate('/shop')} className="btn-secondary-custom">{t('checkout.continueShopping')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('checkout.title')}</h1>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Account / Payment section */}
          <div className="flex-1 space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4 flex items-center gap-2">
                <FiUser size={16} /> {t('checkout.account')}
              </h3>
              {user ? (
                <div className="flex items-center gap-3">
                  <img src={user.discordAvatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-on-surface text-sm">{user.username}</div>
                    <div className="text-text-muted text-xs">{user.email}</div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-primary hover:underline text-sm">{t('checkout.loginRequired')}</Link>
              )}
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4 flex items-center gap-2">
                <FiCreditCard size={16} /> {t('checkout.payment')}
              </h3>
              <p className="text-text-muted text-sm">{t('checkout.paymentDesc')}</p>
            </div>

            {/* Coupon */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('checkout.coupon')}</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="form-input flex-1"
                  placeholder={t('checkout.couponPlaceholder')}
                />
                <button onClick={handleApplyCoupon} className="btn-secondary-custom shrink-0">{t('checkout.apply')}</button>
              </div>
              {couponMsg && (
                <p className={`text-sm mt-2 ${couponDiscount ? 'text-accent-electric' : 'text-error'}`}>{couponMsg}</p>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-80">
            <div className="glass-panel rounded-2xl p-6 sticky top-24">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('checkout.summary')}</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-text-muted truncate">{item.name} {t('checkout.itemSeparator')} {item.quantity}</span>
                    <span className="text-on-surface shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-outline-variant/20 pt-3">
                <div className="flex justify-between text-text-muted">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-on-surface">${totalPrice.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-accent-electric">
                    <span>{t('checkout.discount')}</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-outline-variant/20">
                  <span className="text-on-surface">{t('cart.total')}</span>
                  <span className="font-price-tag text-price-tag text-primary">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading || !user}
                className="btn-primary-custom w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>{t('checkout.payButton')} — ${finalTotal.toFixed(2)}</>
                )}
              </button>
              <button onClick={() => navigate('/cart')} className="btn-secondary-custom w-full mt-3 flex items-center justify-center gap-2 text-sm">
                <FiArrowLeft size={16} /> {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
