import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiArrowLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const { items: cart, removeItem: removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="main-content">
        <div className="empty-state min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
            <FiShoppingCart size={36} className="text-text-muted" />
          </div>
          <h2>{t('cart.empty')}</h2>
          <p className="text-text-muted mb-6">{t('cart.emptyDesc')}</p>
          <Link to="/shop" className="btn-primary-custom">{t('cart.browseProducts')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('cart.title')} ({totalItems})</h1>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
              {cart.map(item => (
                  <div key={item.productId} className="glass-card rounded-2xl p-4 flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-surface-container-high shrink-0 overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted"><FiShoppingCart size={24} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${item.slug || item._id}`} className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors block truncate">
                    {item.name}
                  </Link>
                  <p className="text-text-muted text-xs mt-0.5 capitalize">{item.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-1.5 rounded-lg border border-outline-variant/30 text-text-muted hover:text-on-surface hover:border-text-muted transition-colors">
                        <FiMinus size={14} />
                      </button>
                      <span className="font-label-caps text-label-caps text-on-surface min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 rounded-lg border border-outline-variant/30 text-text-muted hover:text-on-surface hover:border-text-muted transition-colors">
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-price-tag text-price-tag text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="p-2 text-text-muted hover:text-error transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:w-80">
            <div className="glass-panel rounded-2xl p-6 sticky top-24">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('cart.summary')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-on-surface">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-3 flex justify-between font-semibold">
                  <span className="text-on-surface">{t('cart.total')}</span>
                  <span className="font-price-tag text-price-tag text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary-custom w-full mt-6 flex items-center justify-center gap-2">
                <FiShoppingCart size={16} /> {t('cart.checkout')}
              </Link>
              <Link to="/shop" className="btn-secondary-custom w-full mt-3 flex items-center justify-center gap-2 text-sm">
                <FiArrowLeft size={16} /> {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
