import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiSliders } from 'react-icons/fi';

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (sort) params.sort = sort;
        if (category) params.category = category;
        const res = await axios.get('/api/products', { params });
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error('Shop fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, sort, category]);

  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data?.categories || []))
      .catch(() => {});
  }, []);

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  const sortOptions = [
    { value: 'newest', label: t('shop.sortNewest') },
    { value: 'oldest', label: t('shop.sortOldest') },
    { value: 'price_asc', label: t('shop.sortPriceAsc') },
    { value: 'price_desc', label: t('shop.sortPriceDesc') },
    { value: 'name_asc', label: t('shop.sortNameAsc') },
    { value: 'name_desc', label: t('shop.sortNameDesc') },
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('shop.title')}</h1>
        <p>{t('shop.description')}</p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); updateFilter('search', e.target.value); }}
              placeholder={t('shop.searchPlaceholder')}
              className="form-input pl-12"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); updateFilter('sort', e.target.value); }}
                className="form-input appearance-none pr-10 min-w-[150px]"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <button className="btn-secondary-custom md:hidden" onClick={() => setMobileFilters(true)}>
              <FiSliders size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-gutter">
          {/* Sidebar filters */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="glass-panel rounded-2xl p-5 sticky top-24">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('shop.categories')}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setCategory(''); updateFilter('category', ''); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category ? 'bg-primary-container/20 text-primary' : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/30'
                  }`}
                >
                  {t('shop.allCategories')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => { setCategory(cat.name); updateFilter('category', cat.name); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.name ? 'bg-primary-container/20 text-primary' : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/30'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="loading-screen">
                <div className="loader" />
                <p>{t('shop.loading')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h2>{t('shop.emptyTitle')}</h2>
                <p>{t('shop.emptyDesc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {products.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters modal */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:hidden" onClick={() => setMobileFilters(false)}>
          <div className="w-full bg-surface-container rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('shop.categories')}</h3>
              <button onClick={() => setMobileFilters(false)} className="p-2 text-text-muted"><FiX size={20} /></button>
            </div>
            <div className="space-y-1">
              <button onClick={() => { setCategory(''); updateFilter('category', ''); setMobileFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!category ? 'bg-primary-container/20 text-primary' : 'text-text-muted'}`}>
                {t('shop.allCategories')}
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => { setCategory(cat.name); updateFilter('category', cat.name); setMobileFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${category === cat.name ? 'bg-primary-container/20 text-primary' : 'text-text-muted'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
