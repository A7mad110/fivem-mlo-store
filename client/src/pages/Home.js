import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart, FiShield, FiZap, FiUsers, FiDownload, FiStar, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Home() {
  const { theme } = useTheme();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products/featured`).then(({ data }) => setFeatured(data.products)).catch(() => {});
    axios.get(`${API}/products/categories`).then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const heroStyle = theme.heroBg ? { backgroundImage: `url(${theme.heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" style={heroStyle}></div>
        <div className="hero-content">
          <span className="hero-badge">Premium FiveM Assets</span>
          <h1 className="hero-title">{theme.heroTitle || 'Transform Your Server With Premium MLOs'}</h1>
          <p className="hero-subtitle">{theme.heroSubtitle || 'High-quality maps, interiors, and builds optimized for FiveM. Instant delivery after purchase.'}</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary"><FiShoppingCart /> Browse Store <FiArrowRight /></Link>
            <Link to="/shop?category=mlo" className="btn-secondary">View MLOs</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Sales</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Us?</h2>
          <p>We provide the best FiveM assets with top-notch quality and support</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiZap /></div>
            <h3>Instant Delivery</h3>
            <p>Get your purchased products instantly after payment confirmation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>Secure Payments</h3>
            <p>Protected by Stripe & PayPal encryption. Your data is safe with us.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiDownload /></div>
            <h3>Premium Quality</h3>
            <p>All assets are optimized, tested, and ready for your FiveM server.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiUsers /></div>
            <h3>24/7 Support</h3>
            <p>Our team is always ready to help you with any issues or questions.</p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <div>
              <h2>Featured Products</h2>
              <p>Our most popular premium MLOs and maps</p>
            </div>
            <Link to="/shop" className="section-link">View All <FiChevronRight /></Link>
          </div>
          <div className="products-grid">
            {featured.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="categories-section">
        <div className="section-header">
          <h2>Browse Categories</h2>
          <p>Find exactly what you need for your server</p>
        </div>
        <div className="categories-grid">
          {['maps', 'mlo', 'interior', 'exterior', 'build'].map(cat => (
            <Link to={`/shop?category=${cat}`} key={cat} className="category-card">
              <div className="category-icon">
                {cat === 'maps' && '🗺️'}
                {cat === 'mlo' && '🏗️'}
                {cat === 'interior' && '🏠'}
                {cat === 'exterior' && '🌆'}
                {cat === 'build' && '🏰'}
              </div>
              <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
              <span className="category-count">
                {categories.find(c => c._id === cat)?.count || 0} products
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Upgrade Your Server?</h2>
          <p>Join thousands of satisfied server owners who trust us for their FiveM assets.</p>
          <Link to="/shop" className="btn-primary">Start Shopping <FiArrowRight /></Link>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Ahmed R.', role: 'Server Owner', text: 'Amazing quality MLOs! My players love the new interiors. Fast delivery and great support.', rating: 5 },
            { name: 'Marco T.', role: 'Developer', text: 'Best place for FiveM assets. The optimization is incredible, no FPS drops at all.', rating: 5 },
            { name: 'Lucas K.', role: 'Server Admin', text: 'Been buying from here for months. Consistent quality and always new products.', rating: 5 },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(t.rating)].map((_, j) => <FiStar key={j} />)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name[0]}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
