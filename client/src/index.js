import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './styles/App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e2023',
                color: '#e2e2e7',
                borderRadius: '0.5rem',
                border: '1px solid rgba(71, 69, 84, 0.3)',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
