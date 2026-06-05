import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowRight, FiStar, FiShield, FiZap, FiGlobe, FiCpu, FiShoppingCart } from 'react-icons/fi';

export default function Home() {
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          axios.get('/api/products?featured=true&limit=3'),
          axios.get('/api/categories'),
        ]);
        setFeatured(featRes.data?.products || []);
        setCategories(catRes.data?.categories || []);
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
      document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const features = [
    { icon: FiShield, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: FiZap, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: FiGlobe, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: FiCpu, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ];

  const testimonials = [
    { name: t('home.testimonial1Name'), role: t('home.testimonial1Role'), text: t('home.testimonial1Text'), rating: 5 },
    { name: t('home.testimonial2Name'), role: t('home.testimonial2Role'), text: t('home.testimonial2Text'), rating: 5 },
    { name: t('home.testimonial3Name'), role: t('home.testimonial3Role'), text: t('home.testimonial3Text'), rating: 4 },
  ];

  return (
    <div className="main-content">
      {/* Mouse glow */}
      <div id="mouse-glow" />

      {/* Hero */}
      <section className="relative px-margin-edge py-20 hero-gradient overflow-hidden">
        <div className="max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary-container/30 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-electric animate-pulse" />
              <span className="font-label-caps text-label-caps text-primary text-sm">{t('home.heroBadge')}</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">
              {t('home.heroTitle1')}{' '}
              <span className="text-primary">{t('home.heroTitleHighlight')}</span>
              <br />
              {t('home.heroTitle2')}
            </h1>
            <p className="text-body-lg text-text-muted mb-8 max-w-xl mx-auto lg:mx-0">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="btn-primary-custom flex items-center gap-2 text-base">
                <FiShoppingCart size={18} /> {t('home.heroCta')}
              </Link>
              <Link to="/shop?category=mlo" className="btn-secondary-custom flex items-center gap-2 text-base">
                {t('home.heroCta2')} <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 max-w-md">
            {[
              { value: '150+', label: t('home.statProducts') },
              { value: '2.3k+', label: t('home.statCustomers') },
              { value: '4.9', label: t('home.statRating') },
              { value: '24/7', label: t('home.statSupport') },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center">
                <div className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary font-bold">{stat.value}</div>
                <div className="text-text-muted text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-margin-edge py-section-gap">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-12 reveal-card">
            <span className="font-label-caps text-label-caps text-primary text-sm">{t('home.featuresBadge')}</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-2 mb-4">{t('home.featuresTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {features.map((feat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center reveal-card">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-5">
                  <feat.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{feat.title}</h3>
                <p className="text-text-muted text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!loading && featured.length > 0 && (
        <section className="px-margin-edge py-section-gap">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="font-label-caps text-label-caps text-primary text-sm">{t('home.featuredBadge')}</span>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-2">{t('home.featuredTitle')}</h2>
              </div>
              <Link to="/shop" className="btn-secondary-custom text-sm flex items-center gap-2">
                {t('home.viewAll')} <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {featured.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <section className="px-margin-edge py-section-gap">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-12">
              <span className="font-label-caps text-label-caps text-primary text-sm">{t('home.categoriesBadge')}</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-2 mb-4">{t('home.categoriesTitle')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
              {categories.slice(0, 5).map(cat => (
                <Link key={cat._id} to={`/shop?category=${cat.name}`} className="glass-card rounded-2xl p-6 text-center reveal-card">
                  <div className="text-4xl mb-3">{cat.icon || '🏙️'}</div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-base">{cat.name}</h3>
                  <p className="text-text-muted text-xs mt-1">{cat.productCount || 0} {t('home.products')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-margin-edge py-section-gap">
        <div className="max-w-container-max mx-auto relative overflow-hidden rounded-3xl p-12 md:p-20 text-center bg-gradient-to-br from-primary-container/20 via-surface-container to-accent-electric/5 border border-outline-variant/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(108,92,231,0.15),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-8">{t('home.ctaDesc')}</p>
            <Link to="/shop" className="btn-primary-custom inline-flex items-center gap-2 text-base">
              <FiShoppingCart size={18} /> {t('home.ctaButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-margin-edge py-section-gap">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-12">
            <span className="font-label-caps text-label-caps text-primary text-sm">{t('home.testimonialsBadge')}</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-2 mb-4">{t('home.testimonialsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {testimonials.map((tItem, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 reveal-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <FiStar key={s} size={16} className="text-accent-electric" fill={s < tItem.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="text-text-muted text-sm mb-6 italic">"{tItem.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center font-bold text-sm text-primary">
                    {tItem.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-on-surface">{tItem.name}</div>
                    <div className="text-text-muted text-xs">{tItem.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
