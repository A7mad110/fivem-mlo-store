import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiDownload, FiStar, FiShield, FiClock, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

const API = process.env.REACT_APP_API_URL || '/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        setSelectedImage(0);
        return axios.get(`${API}/products`, { params: { category: data.product.category, limit: 4 } });
      })
      .then(({ data }) => setRelated(data.products.filter(p => p.slug !== slug).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  if (!product) return <div className="empty-state"><h2>{t('product.notFound')}</h2><Link to="/shop">{t('product.backToShop')}</Link></div>;

  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const allImages = [];
  if (product.thumbnail) allImages.push(product.thumbnail);
  if (product.images?.length) allImages.push(...product.images);
  const images = allImages.length > 0 ? allImages : ['https://via.placeholder.com/800x600/1a1a2e/6c5ce7?text=MLO'];

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} ${t('product.addedToCart')}`);
  };

  return (
    <div className="product-detail">
      <Link to="/shop" className="back-link"><FiArrowLeft /> {t('product.backToShop')}</Link>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="main-image">
            <img src={images[selectedImage]} alt={product.name} />
            {hasDiscount && <span className="product-badge sale">-{Math.round((1 - product.salePrice / product.price) * 100)}%</span>}
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, i) => (
                <button key={i} className={`thumb-btn ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-rating-row">
            {product.rating > 0 && (
              <span className="rating"><FiStar /> {product.rating}</span>
            )}
            <span className="sales-count"><FiDownload /> {product.salesCount} {t('product.sold')}</span>
            <span className="version">v{product.version}</span>
          </div>
          <div className="product-price-section">
            {hasDiscount ? (
              <>
                <span className="current-price-large">${product.salePrice.toFixed(2)}</span>
                <span className="old-price-large">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="current-price-large">${product.price.toFixed(2)}</span>
            )}
          </div>
          <p className="product-description">{product.description}</p>

          {product.features?.length > 0 && (
            <div className="product-features">
              <h3>{t('product.features')}</h3>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}><FiCheck /> {f}</li>
                ))}
              </ul>
            </div>
          )}

          {product.requirements?.length > 0 && (
            <div className="product-requirements">
              <h3>{t('product.requirements')}</h3>
              <ul>
                {product.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="product-meta-info">
            {product.fileSize && <span><FiDownload /> {t('product.fileSize')}: {product.fileSize}</span>}
            <span><FiClock /> {t('product.updated')}: {new Date(product.updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="product-actions">
            <button className="btn-primary btn-large" onClick={handleAddToCart} disabled={!product.inStock}>
              <FiShoppingCart /> {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
            </button>
          </div>

          <div className="product-guarantee">
            <FiShield /> {t('product.secureCheckout')}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2>{t('product.related')}</h2>
          <div className="products-grid">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
