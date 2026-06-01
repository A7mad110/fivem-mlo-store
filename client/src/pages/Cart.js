import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiArrowLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon"><FiShoppingCart size={64} /></div>
        <h2>{t('cart.empty')}</h2>
        <p>{t('cart.emptyDesc')}</p>
        <Link to="/shop" className="btn-primary">{t('cart.browseProducts')}</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>{t('cart.title')}</h1>
        <p>{totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')}</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image || 'https://via.placeholder.com/120x120/1a1a2e/6c5ce7?text=MLO'} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <Link to={`/shop/${item.slug}`} className="cart-item-name">{item.name}</Link>
                <span className="cart-item-price">${item.price.toFixed(2)}</span>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><FiMinus /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><FiPlus /></button>
              </div>
              <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
              <button className="cart-item-remove" onClick={() => removeItem(item.productId)}>
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>{t('cart.orderSummary')}</h3>
          <div className="summary-row">
            <span>{t('cart.subtotal')} ({totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>{t('cart.tax')}</span>
            <span>{t('cart.calculatedAtCheckout')}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>{t('cart.total')}</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary btn-full">{t('cart.checkout')}</Link>
          <Link to="/shop" className="btn-secondary btn-full"><FiArrowLeft /> {t('cart.continueShopping')}</Link>
        </div>
      </div>
    </div>
  );
}
