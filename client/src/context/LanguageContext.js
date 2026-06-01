import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en';
import ar from '../locales/ar';

const LanguageContext = createContext();
const translations = { en, ar };

const getNested = (obj, path) => {
  const keys = path.split('.');
  let val = obj;
  for (const key of keys) {
    if (val == null || typeof val !== 'object') return null;
    val = val[key];
  }
  return val ?? null;
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.style.setProperty('--direction', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'ar' : 'en'));
  }, []);

  const t = useCallback((path, fallback = '') => {
    const val = getNested(translations[lang], path);
    return val ?? fallback || path;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export { translations };
