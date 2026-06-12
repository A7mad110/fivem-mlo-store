import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowRight, FiLayers, FiEye, FiClock, FiHeart, FiGrid, FiMoon, FiSun, FiType, FiLayout, FiBox, FiCamera, FiDroplet, FiTarget } from 'react-icons/fi';

const designPrinciples = [
  {
    icon: FiEye,
    title: 'Visual Hierarchy',
    en: 'Every element is placed with intent — guiding the eye through a deliberate visual flow.',
    ar: 'كل عنصر موضوع بقصد — لتوجيه العين عبر تدفق بصري مدروس.',
  },
  {
    icon: FiDroplet,
    title: 'Color System',
    en: 'Material 3 palette with neon accents and deep gradients for a cyber-nexus atmosphere.',
    ar: 'لوحة Material 3 مع لمسات نيون وتدرجات عميقة لأجواء سايبر-نيكسس.',
  },
  {
    icon: FiType,
    title: 'Typography',
    en: 'IBM Plex Sans Arabic for elegant Arabic readability, Space Grotesk for modern pricing.',
    ar: 'IBM Plex Sans Arabic للقراءة العربية الأنيقة، Space Grotesk للأسعار العصرية.',
  },
  {
    icon: FiLayout,
    title: 'RTL/LTR Harmony',
    en: 'Seamless bidirectional layout — Arabic RTL and English LTR without breaking the design.',
    ar: 'تخطيط ثنائي الاتجاه سلس — عربي RTL وإنجليزي LTR دون كسر التصميم.',
  },
  {
    icon: FiBox,
    title: 'Glass Morphism',
    en: 'Frosted glass panels with backdrop blur create depth and a premium tactile feel.',
    ar: 'ألواح زجاجية مع ضبابية الخلفية تخلق عمقاً وإحساساً ممتازاً.',
  },
  {
    icon: FiTarget,
    title: 'Micro Animations',
    en: 'Subtle hover effects, smooth transitions, and parallax motion for immersive UX.',
    ar: 'تأثيرات hover خفيفة، انتقالات سلسة، وحركة parallax لتجربة غامرة.',
  },
];

export default function Cinematic() {
  const { t, lang } = useLanguage();

  return (
    <div className="main-content">
      <div id="mouse-glow" />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-margin-edge py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-container to-primary-container/10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-electric/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />

        <div className="max-w-container-max mx-auto relative z-10 w-full">
          <div className="text-center lg:text-left lg:max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary-container/30 rounded-full mb-6 reveal-card">
              <FiCamera size={14} className="text-primary" />
              <span className="font-label-caps text-label-caps text-primary text-sm">{t('cinematic.badge')}</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
              {t('cinematic.title1')}{' '}
              <span className="text-primary">{t('cinematic.titleHighlight')}</span>
              <br />
              {t('cinematic.title2')}
            </h1>
            <p className="text-body-lg text-text-muted max-w-2xl mb-10 leading-relaxed">
              {t('cinematic.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="btn-primary-custom flex items-center gap-2 text-base group">
                {t('cinematic.cta')} <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/shop?category=mlo" className="btn-secondary-custom flex items-center gap-2 text-base">
                {t('home.heroCta2')} <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-text-muted text-xs font-label-caps text-label-caps">{lang === 'ar' ? 'اسفل' : 'Scroll'}</span>
          <div className="w-5 h-8 rounded-full border border-outline-variant/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Design Stats */}
      <section className="relative px-margin-edge py-section-gap overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/5 via-transparent to-accent-electric/5" />
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="text-center mb-16 reveal-card">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              {lang === 'ar' ? 'الأرقام تتحدث' : 'The Numbers Speak'}
            </h2>
            <p className="text-text-muted max-w-lg mx-auto">
              {lang === 'ar' ? 'إحصائيات تعكس التفاني في كل تصميم' : 'Statistics that reflect the dedication in every design'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {[
              { value: t('cinematic.stat1Value'), label: t('cinematic.stat1'), desc: t('cinematic.statDesc'), icon: FiEye, color: 'from-violet-500/20 to-blue-500/10' },
              { value: t('cinematic.stat2Value'), label: t('cinematic.stat2'), desc: t('cinematic.statDesc2'), icon: FiClock, color: 'from-blue-500/20 to-cyan-500/10' },
              { value: t('cinematic.stat3Value'), label: t('cinematic.stat3'), desc: t('cinematic.statDesc3'), icon: FiHeart, color: 'from-pink-500/20 to-rose-500/10' },
              { value: t('cinematic.stat4Value'), label: t('cinematic.stat4'), desc: t('cinematic.statDesc4'), icon: FiLayers, color: 'from-amber-500/20 to-orange-500/10' },
            ].map((s, i) => (
              <div key={i} className={`glass-card rounded-2xl p-8 text-center bg-gradient-to-br ${s.color} group hover:scale-[1.03] transition-all duration-500 reveal-card`}>
                <div className="w-14 h-14 rounded-2xl bg-surface/50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500">
                  <s.icon size={24} className="text-primary" />
                </div>
                <div className="font-price-tag text-price-tag text-primary font-bold">{s.value}</div>
                <div className="font-headline-sm text-headline-sm text-on-surface mt-2">{s.label}</div>
                <div className="text-text-muted text-sm mt-2 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="relative px-margin-edge py-section-gap overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-electric/5 via-transparent to-primary-container/5" />
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="text-center mb-16 reveal-card">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary-container/30 rounded-full mb-6">
              <FiGrid size={14} className="text-primary" />
              <span className="font-label-caps text-label-caps text-primary text-sm">
                {lang === 'ar' ? 'فلسفة التصميم' : 'Design Philosophy'}
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              {lang === 'ar' ? 'مبادئ التصميم' : 'Design Principles'}
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              {lang === 'ar' ? 'كل قرار تصميمي مبني على هذه المبادئ' : 'Every design decision is built on these principles'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {designPrinciples.map((p, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 reveal-card group hover:border-primary/30 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <p.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{p.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {lang === 'ar' ? p.ar : p.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme showcase */}
      <section className="relative px-margin-edge py-section-gap overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/10 via-transparent to-accent-electric/5" />
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="text-center mb-16 reveal-card">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              {lang === 'ar' ? 'تبديل المظهر' : 'Theme Toggle'}
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              {lang === 'ar' ? 'تجربة بصرية كاملة في الوضعين الداكن والفاتح' : 'Full visual experience in both dark and light modes'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="glass-card rounded-2xl p-10 text-center bg-gradient-to-br from-surface to-primary-container/10 border border-outline-variant/20 reveal-card group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-surface/80 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <FiMoon size={28} className="text-primary" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                {lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {lang === 'ar'
                  ? 'سطح داكن #111317 مع نصوص فضية وألوان نيون متوهجة. مثالي للجلسات الليلية.'
                  : 'Dark surface #111317 with silver text and glowing neon accents. Perfect for late-night sessions.'}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {['#111317', '#1a1d23', '#2a2d35', '#c6bfff', '#00D1FF'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg border border-outline-variant/30" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-10 text-center bg-gradient-to-br from-surface to-accent-electric/5 border border-outline-variant/20 reveal-card group hover:scale-[1.02] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-surface/80 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <FiSun size={28} className="text-accent-electric" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                {lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode'}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {lang === 'ar'
                  ? 'سطح فاتح نظيف مع ألوان مريحة، تصميم أنيق وواضح يناسب جميع الأوقات.'
                  : 'Clean light surface with comfortable colors, elegant and clear design suitable for all times.'}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {['#f5f5f7', '#e8e8ed', '#d1d1d6', '#7c5cfc', '#00B4D8'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg border border-outline-variant/30" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-margin-edge py-section-gap">
        <div className="max-w-container-max mx-auto relative overflow-hidden rounded-3xl p-12 md:p-20 text-center bg-gradient-to-br from-primary-container/20 via-surface-container to-accent-electric/5 border border-outline-variant/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,92,231,0.15),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              {lang === 'ar' ? 'جاهز لتجربة التصميم؟' : 'Ready to Experience the Design?'}
            </h2>
            <p className="text-text-muted max-w-lg mx-auto mb-8">
              {lang === 'ar'
                ? 'تصفح مجموعتنا من MLOs واكتشف الفرق في الجودة والتفاصيل.'
                : 'Browse our MLO collection and discover the difference in quality and detail.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop" className="btn-primary-custom inline-flex items-center gap-2 text-base group">
                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> {lang === 'ar' ? 'تصفح المتجر' : 'Browse Store'}
              </Link>
              <Link to="/register" className="btn-secondary-custom inline-flex items-center gap-2 text-base">
                {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
