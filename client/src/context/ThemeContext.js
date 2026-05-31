import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const defaultTheme = {
  siteName: 'MLO Store', siteLogo: '', favicon: '',
  bgPrimary: '#0a0a14', bgSecondary: '#0f0f1a', bgCard: '#14142a',
  bgCardHover: '#1a1a34', bgInput: '#1a1a30',
  borderColor: '#2a2a4a', borderHover: '#4a4a7a',
  textPrimary: '#f0f0f5', textSecondary: '#8888aa', textMuted: '#666688',
  accent: '#6c5ce7', accentLight: '#a29bfe', accentGlow: 'rgba(108, 92, 231, 0.3)',
  success: '#00b894', warning: '#fdcb6e', danger: '#e17055', info: '#74b9ff',
  fontFamily: 'Inter', headingFont: 'Orbitron', borderRadius: 12,
  heroTitle: 'Premium FiveM MLOs & Maps', heroSubtitle: '',
  heroBg: '', bgImage: '', bgRepeat: 'repeat', bgSize: 'auto', customCss: '', footerText: '',
};

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(108, 92, 231, ${alpha})`;
  const c = hex.replace('#', '');
  if (c.length < 6) return `rgba(108, 92, 231, ${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(108, 92, 231, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axios.get(`${API}/theme`).then(({ data }) => {
      const merged = { ...defaultTheme, ...data.theme };
      if (data.theme) {
        setTheme(merged);
        applyTheme(merged);
      }
    }).catch(() => {
      applyTheme(defaultTheme);
    }).finally(() => setLoaded(true));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loaded, defaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function applyTheme(t) {
  try {
  const r = document.documentElement;
  const map = {
    '--bg-primary': t.bgPrimary,
    '--bg-secondary': t.bgSecondary,
    '--bg-card': t.bgCard,
    '--bg-card-hover': t.bgCardHover,
    '--bg-input': t.bgInput,
    '--border-color': t.borderColor,
    '--border-hover': t.borderHover,
    '--text-primary': t.textPrimary,
    '--text-secondary': t.textSecondary,
    '--text-muted': t.textMuted,
    '--accent': t.accent,
    '--accent-light': t.accentLight,
    '--accent-glow': hexToRgba(t.accent, 0.3),
    '--success': t.success,
    '--warning': t.warning,
    '--danger': t.danger,
    '--info': t.info,
    '--radius': `${t.borderRadius}px`,
    '--radius-lg': `${t.borderRadius + 4}px`,
    '--radius-xl': `${t.borderRadius + 12}px`,
  };
  for (const [key, val] of Object.entries(map)) {
    if (val) r.style.setProperty(key, val);
  }
  if (t.bgImage) {
    const repeat = t.bgRepeat || 'repeat';
    const size = t.bgSize || 'auto';
    document.body.style.backgroundImage = `url(${t.bgImage})`;
    document.body.style.backgroundRepeat = repeat;
    document.body.style.backgroundSize = size;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundSize = '';
  }
  if (t.favicon) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = t.favicon;
  }
  if (t.customCss) {
    let styleEl = document.getElementById('custom-theme-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = t.customCss;
  }
  } catch (e) { /* silent */ }
}
