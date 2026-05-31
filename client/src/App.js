import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
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

function SimplePage({ title, children }) {
  return (
    <div className="page-header" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <h1>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', margin: '16px auto' }}>{children}</p>
      <Link to="/" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Go Home</Link>
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
          <Route path="/contact" element={<SimplePage title="Contact Us">Get in touch with our support team. We typically respond within 24 hours. Email: support@mlostore.com</SimplePage>} />
          <Route path="/faq" element={<SimplePage title="FAQ">Find answers to common questions about our products, delivery, and support.</SimplePage>} />
          <Route path="/terms" element={<SimplePage title="Terms of Service">By purchasing from MLO Store, you agree to our terms. All digital products are non-refundable after download.</SimplePage>} />
          <Route path="/refund" element={<SimplePage title="Refund Policy">We offer a 14-day refund policy for unused products. Contact support for assistance.</SimplePage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </ThemeProvider>
  );
}
