import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(t('shop.addedToCart'));
  };

  const isOnSale = product.oldPrice && product.oldPrice > product.price;

  return (
    <Link
      to={`/shop/${product.slug}`}
      ref={cardRef}
      className="product-card glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-surface-container-high">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <FiTrendingUp size={48} />
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-error px-2 py-0.5 rounded-md text-xs font-bold text-white">
            {t('product.sale')}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-on-primary rounded-lg py-2.5 font-label-caps text-label-caps text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <FiShoppingCart size={16} /> {t('shop.addToCart')}
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <span className="text-text-muted text-xs uppercase tracking-wider">{product.category}</span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <FiStar key={s} size={14} className="text-accent-electric" fill={s <= 4 ? 'currentColor' : 'none'} />
          ))}
          <span className="text-text-muted text-xs mr-2">(4.0)</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-price-tag text-price-tag text-primary">
            ${product.price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-text-muted text-sm line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
