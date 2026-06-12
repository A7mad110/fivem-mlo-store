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
import Cinematic from './pages/Cinematic';
import NotFound from './pages/NotFound';
import Setup from './pages/Setup';

function SimplePage({ titleKey, textKey }) {
  const { t } = useLanguage();
  return (
    <div className="main-content flex items-center justify-center px-margin-edge min-h-[60vh]">
      <div className="text-center max-w-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-4">{t(`simplePages.${titleKey}.title`)}</h1>
        <p className="text-text-muted">{t(`simplePages.${titleKey}.text`)}</p>
        <Link to="/" className="btn-primary-custom inline-flex items-center gap-2 mt-8">{t('notFound.home')}</Link>
      </div>
    </div>
  );
}

function TermsPage() {
  const { lang, t } = useLanguage();
  return (
    <div className="main-content flex items-center justify-center px-margin-edge min-h-[60vh]">
      <div className="text-center max-w-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-4">{t('simplePages.terms.title')}</h1>
        <p className="text-text-muted">{lang === 'ar' ? t('simplePages.terms.arabicText') : t('simplePages.terms.text')}</p>
        <Link to="/" className="btn-primary-custom inline-flex items-center gap-2 mt-8">{t('notFound.home')}</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
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
          <Route path="/cinematic" element={<Cinematic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </ThemeProvider>
  );
}
