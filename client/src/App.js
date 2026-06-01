import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import DiscordSuccess from './pages/DiscordSuccess';
import NotFound from './pages/NotFound';
import Setup from './pages/Setup';

function SimplePage({ titleKey, textKey }) {
  const { t } = useLanguage();
  return (
    <div className="page-header" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <h1>{t(`simplePages.${titleKey}.title`)}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', margin: '16px auto' }}>
        {t(`simplePages.${titleKey}.text`)}
      </p>
      <Link to="/" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>{t('notFound.goHome')}</Link>
    </div>
  );
}

function TermsPage() {
  const { lang, t } = useLanguage();
  return (
    <div className="page-header" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <h1>{t('simplePages.terms.title')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', margin: '16px auto' }}>
        {lang === 'ar' ? t('simplePages.terms.arabicText') : t('simplePages.terms.text')}
      </p>
      <Link to="/" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>{t('notFound.goHome')}</Link>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Login />} />
          <Route path="/auth/discord/success" element={<DiscordSuccess />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
          <Route path="/contact" element={<SimplePage titleKey="contact" />} />
          <Route path="/faq" element={<SimplePage titleKey="faq" />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund" element={<SimplePage titleKey="refund" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </ThemeProvider>
  );
}
