import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShoppingCart, FiShield, FiHeadphones } from 'react-icons/fi';
import { FaInstagram, FaYoutube, FaTiktok, FaDiscord } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-brand">{theme.siteLogo ? <img src={theme.siteLogo} alt={theme.siteName} style={{ height: '32px' }} /> : 'Ⓧ'} {theme.siteName || '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤'}</h3>
            <p className="footer-desc">{theme.footerText || t('footer.description')}</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/xds.3d/" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCJJqt2YogJEiJFwuVeH6qhg" className="social-link" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
              <a href="https://www.tiktok.com/@_x.d.s_?lang=en" className="social-link" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
              <a href="https://discord.gg/YcWzvXsvbX" className="social-link" target="_blank" rel="noopener noreferrer" title="Discord"><FaDiscord /></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>{t('footer.quickLinks')}</h4>
            <Link to="/shop">{t('footer.allProducts')}</Link>
            <Link to="/shop?category=maps">Maps</Link>
            <Link to="/shop?category=mlo">MLOs</Link>
            <Link to="/shop?category=interior">{t('footer.allProducts') === 'All Products' ? 'Interiors' : 'ديكورات'}</Link>
          </div>
          <div className="footer-section">
            <h4>{t('footer.support')}</h4>
            <Link to="/contact">{t('footer.contact')}</Link>
            <Link to="/faq">{t('footer.faq')}</Link>
            <Link to="/terms">{t('footer.termsOfService')}</Link>
            <Link to="/refund">{t('footer.refundPolicy')}</Link>
          </div>
          <div className="footer-section">
            <h4>{t('footer.features')}</h4>
            <div className="footer-feature"><FiShoppingCart /> {t('footer.instantDelivery')}</div>
            <div className="footer-feature"><FiShield /> {t('footer.securePayment')}</div>
            <div className="footer-feature"><FiHeadphones /> {t('footer.support247')}</div>
            <div className="footer-feature"><FiMail /> {t('footer.emailUpdates')}</div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} 𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤. جميع الحقوق محفوظة &bull; {t('footer.copyright')}</p>
          <div className="footer-payments">
            <span className="payment-badge">Visa</span>
            <span className="payment-badge">MC</span>
            <span className="payment-badge">PP</span>
            <span className="payment-badge">BTC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
