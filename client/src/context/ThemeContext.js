import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const defaultTheme = {
  siteName: '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤', siteLogo: '', favicon: '',
  bgPrimary: '#0a0a14', bgSecondary: '#0f0f1a', bgCard: '#14142a',
  bgCardHover: '#1a1a34', bgInput: '#1a1a30',
  borderColor: '#2a2a4a', borderHover: '#4a4a7a',
  textPrimary: '#f0f0f5', textSecondary: '#8888aa', textMuted: '#666688',
  accent: '#6c5ce7', accentLight: '#a29bfe', accentGlow: 'rgba(108, 92, 231, 0.3)',
  success: '#00b894', warning: '#fdcb6e', danger: '#e17055', info: '#74b9ff',
  fontFamily: 'Inter', headingFont: 'Orbitron', borderRadius: 12,
  heroTitle: '𝕋𝕙𝕖 𝕏 𝔻𝕖𝕤𝕚𝕘𝕟𝕤 • Premium MLOs & Maps', heroSubtitle: '',
  heroBg: '', bgImage: '', bgRepeat: 'repeat', bgSize: 'auto', customCss: '', footerText: '',
};

const lightColors = {
  bgPrimary: '#f5f5fa', bgSecondary: '#eeeef5', bgCard: '#ffffff',
  bgCardHover: '#f0f0ff', bgInput: '#e8eaf0',
  borderColor: '#d0d0e0', borderHover: '#a0a0c0',
  textPrimary: '#1a1a2e', textSecondary: '#555577', textMuted: '#8888aa',
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
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    applyTheme(defaultTheme, mode);
    axios.get(`${API}/theme`).then(({ data }) => {
      const merged = { ...defaultTheme, ...data.theme };
      setTheme(merged);
      applyTheme(merged, mode);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) applyTheme(theme, mode);
  }, [mode, loaded]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loaded, defaultTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function applyTheme(t, mode) {
  try {
    const r = document.documentElement;
    const base = mode === 'light' ? { ...t, ...lightColors } : t;
    const map = {
      '--bg-primary': base.bgPrimary,
      '--bg-secondary': base.bgSecondary,
      '--bg-card': base.bgCard,
      '--bg-card-hover': base.bgCardHover,
      '--bg-input': base.bgInput,
      '--border-color': base.borderColor,
      '--border-hover': base.borderHover,
      '--text-primary': base.textPrimary,
      '--text-secondary': base.textSecondary,
      '--text-muted': base.textMuted,
      '--accent': base.accent,
      '--accent-light': base.accentLight,
      '--accent-glow': hexToRgba(base.accent, 0.3),
      '--success': base.success,
      '--warning': base.warning,
      '--danger': base.danger,
      '--info': base.info,
      '--radius': `${base.borderRadius}px`,
      '--radius-lg': `${base.borderRadius + 4}px`,
      '--radius-xl': `${base.borderRadius + 12}px`,
    };
    for (const [key, val] of Object.entries(map)) {
      if (val) r.style.setProperty(key, val);
    }
    if (base.bgImage) {
      document.body.style.backgroundImage = `url(${base.bgImage})`;
      document.body.style.backgroundRepeat = base.bgRepeat || 'repeat';
      document.body.style.backgroundSize = base.bgSize || 'auto';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
    }
    if (base.favicon) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = base.favicon;
    }
    if (base.customCss) {
      let styleEl = document.getElementById('custom-theme-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-theme-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = base.customCss;
    }
  } catch (e) { /* silent */ }
}
