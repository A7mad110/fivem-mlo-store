import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const features = [
    { icon: '🏙️', title: t('footer.feature1Title'), desc: t('footer.feature1Desc') },
    { icon: '☁️', title: t('footer.feature2Title'), desc: t('footer.feature2Desc') },
    { icon: '🔒', title: t('footer.feature3Title'), desc: t('footer.feature3Desc') },
    { icon: '⚡', title: t('footer.feature4Title'), desc: t('footer.feature4Desc') },
  ];

  return (
    <footer className="bg-surface-deep mt-section-gap bg-surface-container-lowest border-t border-outline-variant/20">
      <div className="max-w-container-max mx-auto px-margin-edge py-section-gap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-12">
          {features.map((f, i) => (
            <div key={i}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{f.title}</h4>
              <p className="text-text-muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-outline-variant/10">
          <div>
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4">{t('footer.companyTitle')}</h5>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.home')}</Link>
              <Link to="/shop" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.shop')}</Link>
              <Link to="/contact" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.contact')}</Link>
              <Link to="/faq" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.faq')}</Link>
            </div>
          </div>
          <div>
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4">{t('footer.supportTitle')}</h5>
            <div className="flex flex-col gap-3">
              <Link to="/terms" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.terms')}</Link>
              <Link to="/refund" className="text-text-muted hover:text-on-surface text-sm transition-colors">{t('footer.refund')}</Link>
            </div>
          </div>
          <div>
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4">{t('footer.paymentsTitle')}</h5>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-semibold">{t('footer.paymentVisa')}</span>
              <span className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-semibold">{t('footer.paymentMc')}</span>
              <span className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-semibold">{t('footer.paymentPp')}</span>
              <span className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-semibold">{t('footer.paymentCb')}</span>
            </div>
          </div>
          <div>
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4">{t('footer.socialTitle')}</h5>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 bg-surface-container-high rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-higher transition-all text-sm">
                <FaDiscord size={18} />
              </a>
              <a href="#" className="p-2.5 bg-surface-container-high rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-higher transition-all text-sm">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="p-2.5 bg-surface-container-high rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-higher transition-all text-sm">
                <FiMail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/10 py-8 px-margin-edge">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {theme.siteName || '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤'}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
