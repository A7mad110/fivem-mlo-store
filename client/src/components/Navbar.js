import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiPackage, FiLogOut, FiSun, FiMoon, FiGlobe, FiSearch } from 'react-icons/fi';
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
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-md">
      <div className="flex justify-between items-center h-20 px-margin-edge max-w-container-max mx-auto">
        <div className="flex items-center gap-gutter">
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-3">
            {theme.siteLogo ? (
              <img src={theme.siteLogo} alt={theme.siteName} className="h-8" />
            ) : (
              <span className="text-xl">{t('nav.logoFallback')}</span>
            )}
            {theme.siteName || '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤'}
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-200">
              {t('nav.home')}
            </Link>
            <Link to="/shop" className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-200">
              {t('nav.shop')}
            </Link>
            {user && (
              <Link to="/dashboard/orders" className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-200">
                {t('nav.myOrders')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-200">
                {t('nav.admin')}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all duration-300"
              onClick={toggleLang}
              title={lang === 'en' ? t('nav.arabic') : t('nav.english')}
            >
              <FiGlobe size={18} />
            </button>
            <button
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all duration-300"
              onClick={toggleMode}
              title={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {mode === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <Link
              to="/cart"
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-full transition-all duration-300 relative"
            >
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-container text-on-primary-container text-[10px] flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {user ? (
            <div className="relative" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary-container transition-all duration-200"
                onClick={() => setDropdownOpen(o => !o)}
              >
                <img
                  src={user.discordAvatar || user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff&bold=true`}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="hidden md:inline font-label-caps text-label-caps text-sm">{user.username}</span>
              </button>
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 bg-surface-container border border-outline-variant/30 rounded-xl p-2 min-w-[180px] shadow-lg backdrop-blur-xl z-50"
                  onMouseEnter={showDropdown}
                  onMouseLeave={hideDropdown}
                >
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-sm"
                  >
                    <FiPackage size={16} /> {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-sm"
                  >
                    <FiShoppingCart size={16} /> {t('nav.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-all text-sm w-full text-left"
                  >
                    <FiLogOut size={16} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex px-6 py-2.5 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:brightness-110 active:scale-95 transition-all duration-200 neon-glow-primary items-center gap-2"
            >
              <FiUser size={16} /> {t('nav.signIn')}
            </Link>
          )}

          <button className="md:hidden p-2 text-on-surface" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container border-t border-outline-variant/20 px-margin-edge py-4 space-y-2">
          <Link to="/" className="block font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface py-3" onClick={() => setMenuOpen(false)}>
            {t('nav.home')}
          </Link>
          <Link to="/shop" className="block font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface py-3" onClick={() => setMenuOpen(false)}>
            {t('nav.shop')}
          </Link>
          {user && (
            <Link to="/dashboard/orders" className="block font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface py-3" onClick={() => setMenuOpen(false)}>
              {t('nav.myOrders')}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="block font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface py-3" onClick={() => setMenuOpen(false)}>
              {t('nav.admin')}
            </Link>
          )}
          {!user && (
            <Link to="/login" className="block btn-primary-custom text-center mt-4" onClick={() => setMenuOpen(false)}>
              {t('nav.signIn')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
