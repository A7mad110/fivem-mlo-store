import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShoppingCart, FiShield, FiHeadphones } from 'react-icons/fi';
import { FaInstagram, FaYoutube, FaTiktok, FaDiscord } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-brand">{theme.siteLogo ? <img src={theme.siteLogo} alt={theme.siteName} style={{ height: '32px' }} /> : 'Ⓧ'} {theme.siteName || '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤'}</h3>
            <p className="footer-desc">{theme.footerText || 'Premium FiveM MLOs, maps, and interiors for your server. Quality assets with fast delivery.'}</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/xds.3d/" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCJJqt2YogJEiJFwuVeH6qhg" className="social-link" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
              <a href="https://www.tiktok.com/@_x.d.s_?lang=en" className="social-link" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
              <a href="https://discord.gg/YcWzvXsvbX" className="social-link" target="_blank" rel="noopener noreferrer" title="Discord"><FaDiscord /></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?category=maps">Maps</Link>
            <Link to="/shop?category=mlo">MLOs</Link>
            <Link to="/shop?category=interior">Interiors</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/refund">Refund Policy</Link>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <div className="footer-feature"><FiShoppingCart /> Instant Delivery</div>
            <div className="footer-feature"><FiShield /> Secure Payment</div>
            <div className="footer-feature"><FiHeadphones /> 24/7 Support</div>
            <div className="footer-feature"><FiMail /> Email Updates</div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} 𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤. جميع الحقوق محفوظة • All rights reserved.</p>
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
