import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowRight, FiStar, FiShield, FiZap, FiGlobe, FiCpu, FiShoppingCart, FiLayers, FiEye, FiClock, FiHeart } from 'react-icons/fi';

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
              { value: t('home.statProductsValue'), label: t('home.statProducts') },
              { value: t('home.statCustomersValue'), label: t('home.statCustomers') },
              { value: t('home.statRatingValue'), label: t('home.statRating') },
              { value: t('home.statSupportValue'), label: t('home.statSupport') },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center">
                <div className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary font-bold">{stat.value}</div>
                <div className="text-text-muted text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Design Showcase */}
      <section className="relative px-margin-edge py-section-gap overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/10 via-transparent to-accent-electric/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-electric/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="text-center mb-16 reveal-card">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary-container/30 rounded-full mb-6">
              <FiLayers size={14} className="text-primary" />
              <span className="font-label-caps text-label-caps text-primary text-sm">{t('cinematic.badge')}</span>
            </div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
              {t('cinematic.title1')}{' '}
              <span className="text-primary">{t('cinematic.titleHighlight')}</span>
              <br />
              {t('cinematic.title2')}
            </h2>
            <p className="text-body-lg text-text-muted max-w-3xl mx-auto">
              {t('cinematic.subtitle')}
            </p>
          </div>

          {/* Cinematic stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-16">
            {[
              { value: t('cinematic.stat1Value'), label: t('cinematic.stat1'), desc: t('cinematic.statDesc'), icon: FiEye },
              { value: t('cinematic.stat2Value'), label: t('cinematic.stat2'), desc: t('cinematic.statDesc2'), icon: FiClock },
              { value: t('cinematic.stat3Value'), label: t('cinematic.stat3'), desc: t('cinematic.statDesc3'), icon: FiHeart },
              { value: t('cinematic.stat4Value'), label: t('cinematic.stat4'), desc: t('cinematic.statDesc4'), icon: FiLayers },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center reveal-card group hover:border-primary/30 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container/30 to-accent-electric/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                  <s.icon size={22} className="text-primary" />
                </div>
                <div className="font-price-tag text-price-tag text-primary font-bold">{s.value}</div>
                <div className="font-headline-sm text-headline-sm text-on-surface mt-1">{s.label}</div>
                <div className="text-text-muted text-xs mt-1">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Design showcase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter reveal-card">
            {[
              {
                title: 'Cyber-Nexus',
                desc: 'Material 3 inspired glass morphism with neon accents and deep space gradients.',
                color: 'from-primary/20 to-accent-electric/10',
                border: 'border-primary/20',
              },
              {
                title: 'RTL-First',
                desc: 'Full Arabic support with seamless RTL layout, IBM Plex Sans Arabic typography, and bidirectional design system.',
                color: 'from-accent-electric/20 to-primary/10',
                border: 'border-accent-electric/20',
              },
              {
                title: 'Immersive UX',
                desc: 'Cinematic transitions, parallax effects, mouse-reactive glows, and smooth micro-animations throughout.',
                color: 'from-primary/10 to-accent-electric/20',
                border: 'border-primary/20',
              },
            ].map((card, i) => (
              <div key={i} className={`glass-card rounded-2xl p-8 text-center bg-gradient-to-br ${card.color} border ${card.border} group hover:scale-[1.02] transition-all duration-500`}>
                <div className="w-16 h-1 rounded-full bg-primary mx-auto mb-6 group-hover:w-24 transition-all duration-500" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{card.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 reveal-card">
            <Link to="/shop" className="btn-primary-custom inline-flex items-center gap-2 text-base group">
              {t('cinematic.cta')} <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
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
                  <div className="text-4xl mb-3">{cat.icon || t('home.categoryFallback')}</div>
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
