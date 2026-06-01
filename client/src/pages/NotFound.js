import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>{t('notFound.title')}</h2>
      <p>{t('notFound.subtitle')}</p>
      <Link to="/" className="btn-primary">{t('notFound.goHome')}</Link>
    </div>
  );
}
