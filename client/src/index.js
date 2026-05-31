import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './styles/App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1a1a2e', color: '#e0e0e0', border: '1px solid #2a2a3e', borderRadius: '12px' },
            success: { iconTheme: { primary: '#00b894', secondary: '#fff' } },
            error: { iconTheme: { primary: '#e17055', secondary: '#fff' } },
          }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
