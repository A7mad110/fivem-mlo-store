import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiDownload } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const price = product.salePrice || product.price || 0;
  const hasDiscount = product.salePrice && product.price && product.salePrice < product.price;

  return (
    <Link to={`/shop/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <img
          src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/400x300/1a1a2e/6c5ce7?text=MLO'}
          alt={product.name}
          loading="lazy"
        />
        {hasDiscount && (
          <span className="product-badge sale">SALE</span>
        )}
        {product.featured && !hasDiscount && (
          <span className="product-badge featured">FEATURED</span>
        )}
        <div className="product-card-overlay">
          <button className="quick-add-btn" onClick={handleAddToCart}>
            <FiShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.shortDescription || product.description?.slice(0, 80) + '...'}</p>
        <div className="product-card-footer">
          <div className="product-price">
            {hasDiscount && <span className="old-price">${(product.price || 0).toFixed(2)}</span>}
            <span className="current-price">${price.toFixed(2)}</span>
          </div>
          <div className="product-meta">
            {product.salesCount > 0 && (
              <span className="product-sales"><FiDownload size={12} /> {product.salesCount}</span>
            )}
            {product.rating > 0 && (
              <span className="product-rating"><FiStar size={12} /> {product.rating}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
