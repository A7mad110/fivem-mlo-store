import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="main-content min-h-screen flex items-center justify-center px-margin-edge">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/30 mb-4">404</div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-4">{t('notFound.title')}</h1>
        <p className="text-text-muted mb-8">{t('notFound.desc')}</p>
        <Link to="/" className="btn-primary-custom inline-flex items-center gap-2">
          <FiArrowLeft size={18} /> {t('notFound.home')}
        </Link>
      </div>
    </div>
  );
}
