import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart, FiShield, FiZap, FiUsers, FiDownload, FiStar, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
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
          <span className="hero-badge">{t('home.hero.badge')}</span>
          <h1 className="hero-title">{theme.heroTitle || t('home.hero.title')}</h1>
          <p className="hero-subtitle">{theme.heroSubtitle || t('home.hero.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary"><FiShoppingCart /> {t('home.hero.browse')} <FiArrowRight /></Link>
            <Link to="/shop?category=mlo" className="btn-secondary">{t('home.hero.viewMlos')}</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">{t('home.stats.products')}</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">{t('home.stats.sales')}</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">{t('home.stats.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>{t('home.features.title')}</h2>
          <p>{t('home.features.subtitle')}</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiZap /></div>
            <h3>{t('home.features.instantDelivery')}</h3>
            <p>{t('home.features.instantDeliveryDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>{t('home.features.securePayments')}</h3>
            <p>{t('home.features.securePaymentsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiDownload /></div>
            <h3>{t('home.features.premiumQuality')}</h3>
            <p>{t('home.features.premiumQualityDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiUsers /></div>
            <h3>{t('home.features.support')}</h3>
            <p>{t('home.features.supportDesc')}</p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <div>
              <h2>{t('home.featured.title')}</h2>
              <p>{t('home.featured.subtitle')}</p>
            </div>
            <Link to="/shop" className="section-link">{t('home.featured.viewAll')} <FiChevronRight /></Link>
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
          <h2>{t('home.categories.title')}</h2>
          <p>{t('home.categories.subtitle')}</p>
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
                {categories.find(c => c._id === cat)?.count || 0} {t('home.categories.products')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.subtitle')}</p>
          <Link to="/shop" className="btn-primary">{t('home.cta.startShopping')} <FiArrowRight /></Link>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2>{t('home.testimonials.title')}</h2>
        </div>
        <div className="testimonials-grid">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, j) => <FiStar key={j} />)}
              </div>
              <p className="testimonial-text">"{t(`home.testimonials.${idx}.text`)}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t(`home.testimonials.${idx}.name`)[0]}</div>
                <div>
                  <strong>{t(`home.testimonials.${idx}.name`)}</strong>
                  <span>{t(`home.testimonials.${idx}.role`)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
