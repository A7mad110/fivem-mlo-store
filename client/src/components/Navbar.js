import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiLogOut, FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, mode, toggleMode } = useTheme();
  const { totalItems } = useCart();
  const { t, lang, toggleLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimer = React.useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showDropdown = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setDropdownOpen(true);
  };

  const hideDropdown = () => {
    dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          {theme.siteLogo ? <img src={theme.siteLogo} alt={theme.siteName} className="navbar-logo" /> : <span className="brand-icon">🏙️</span>}
          <span className="brand-text">{theme.siteName || '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤'}</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/shop" className="nav-link" onClick={() => setMenuOpen(false)}>{t('nav.shop')}</Link>
          {user && (
            <Link to="/dashboard/orders" className="nav-link" onClick={() => setMenuOpen(false)}>{t('nav.myOrders')}</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>{t('nav.admin')}</Link>
          )}
        </div>

        <div className="navbar-actions">
          <button className="icon-btn" onClick={toggleLang} title={lang === 'en' ? t('nav.arabic') : t('nav.english')}>
            <FiGlobe size={18} />
          </button>

          <button className="icon-btn" onClick={toggleMode} title={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}>
            {mode === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <Link to="/cart" className="cart-btn">
            <FiShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="user-dropdown" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
              <button className="user-btn" onClick={() => setDropdownOpen(o => !o)}>
                <img
                  src={user.discordAvatar || user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff&bold=true`}
                  alt={user.username}
                  className="user-avatar"
                />
                <span className="user-name">{user.username}</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
                  <Link to="/dashboard" className="dropdown-item"><FiPackage /> {t('nav.dashboard')}</Link>
                  <Link to="/dashboard/orders" className="dropdown-item"><FiShoppingCart /> {t('nav.orders')}</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn"><FiLogOut /> {t('nav.logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn"><FiUser size={18} /> {t('nav.signIn')}</Link>
          )}

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
