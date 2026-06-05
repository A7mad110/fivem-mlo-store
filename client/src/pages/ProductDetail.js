import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiArrowLeft, FiStar, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/products/${slug}`)
      .then(res => setProduct(res.data.product || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product);
    toast.success(t('shop.addedToCart'));
  };

  if (loading) {
    return (
      <div className="main-content min-h-[60vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="main-content min-h-[60vh] flex items-center justify-center px-margin-edge">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t('productDetail.notFound')}</h2>
          <Link to="/shop" className="btn-primary-custom inline-flex items-center gap-2 mt-4">
            <FiArrowLeft size={16} /> {t('productDetail.backToShop')}
          </Link>
        </div>
      </div>
    );
  }

  const isOnSale = product.oldPrice && product.oldPrice > product.price;

  return (
    <div className="main-content">
      <div className="max-w-container-max mx-auto px-margin-edge py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-text-muted hover:text-on-surface mb-6 transition-colors text-sm">
          <FiArrowLeft size={16} /> {t('productDetail.backToShop')}
        </Link>

        <div className="flex flex-col lg:flex-row gap-gutter mb-12">
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="glass-card rounded-3xl overflow-hidden aspect-[4/3] bg-surface-container-high">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <FiTrendingUp size={64} />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/20 hover:border-primary transition-colors cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:w-1/2">
            <span className="font-label-caps text-label-caps text-xs text-primary uppercase tracking-wider">{product.category}</span>
            <h1 className="font-headline-md text-headline-md text-on-surface mt-2 mb-4 font-bold">{product.name}</h1>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <FiStar key={s} size={16} className="text-accent-electric" fill={s <= 4 ? 'currentColor' : 'none'} />
              ))}
              <span className="text-text-muted text-sm mr-2">(4.0)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-price-tag text-price-tag text-primary">${product.price.toFixed(2)}</span>
              {isOnSale && (
                <span className="text-text-muted text-lg line-through">${product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-text-muted text-body-md leading-relaxed mb-8">{product.description}</p>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-label-caps text-label-caps text-on-surface mb-3">{t('productDetail.features')}</h3>
                <ul className="space-y-2">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                      <FiCheck size={14} className="text-accent-electric shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {product.requirements?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-label-caps text-label-caps text-on-surface mb-3">{t('productDetail.requirements')}</h3>
                <ul className="space-y-2">
                  {product.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                      <FiX size={14} className="text-error shrink-0" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-accent-electric' : 'bg-error'}`} />
              <span className={`text-sm ${product.inStock ? 'text-accent-electric' : 'text-error'}`}>
                {product.inStock ? t('productDetail.inStock') : t('productDetail.outOfStock')}
              </span>
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-primary-custom w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50"
            >
              <FiShoppingCart size={18} /> {t('productDetail.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
