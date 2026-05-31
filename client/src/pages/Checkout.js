import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiCheck, FiCreditCard, FiUser, FiPercent } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { api, user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
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
      toast.success(`Coupon applied! You saved $${data.discount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
      setDiscount(0);
    }
    setCouponLoading(false);
  };

  if (items.length === 0 && !completed) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
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
      toast.success('Order completed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
    setLoading(false);
  };

  if (completed) {
    return (
      <div className="checkout-success">
        <div className="success-icon"><FiCheck /></div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. You can download your products from your dashboard.</p>
        <div className="success-actions">
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
          <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-grid">
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h3><FiUser /> Account</h3>
            <p>{user?.email} {user?.isVerified && <FiCheck className="verified-icon" />}</p>
          </div>

          <div className="checkout-card">
            <h3><FiCreditCard /> Payment</h3>
            <div className="payment-methods">
              <label className="payment-option selected">
                <input type="radio" name="payment" defaultChecked />
                <span className="payment-label">
                  <FiCreditCard /> Credit / Debit Card
                </span>
                <span className="payment-badges">Visa MC AMEX</span>
              </label>
              <div className="payment-note">
                <FiLock /> Your payment is secured with 256-bit SSL encryption
              </div>
            </div>
          </div>

          <button className="btn-primary btn-large btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
          </button>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-coupon">
            {appliedCoupon ? (
              <div className="applied-coupon">
                <span><FiPercent /> {appliedCoupon.code}</span>
                <span>-${discount.toFixed(2)}</span>
                <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} className="remove-coupon">×</button>
              </div>
            ) : (
              <div className="coupon-input">
                <input type="text" placeholder="Coupon code" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                  {couponLoading ? '...' : 'Apply'}
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
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="checkout-total checkout-discount">
              <span>Discount</span>
              <span style={{ color: '#10b981' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="checkout-divider"></div>
          <div className="checkout-total">
            <span>Total</span>
            <span className="checkout-total-price">${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
