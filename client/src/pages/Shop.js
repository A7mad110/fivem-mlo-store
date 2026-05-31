import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    axios.get(`${API}/products`, { params })
      .then(({ data }) => {
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const categories = ['', 'maps', 'mlo', 'interior', 'exterior', 'build', 'other'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'sales', label: 'Best Selling' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="shop-page">
      <div className="page-header">
        <h1>Shop {category && <span className="gradient-text">/ {category}</span>}</h1>
        <p>{total} products available</p>
      </div>

      <div className="shop-toolbar">
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateParams('search', e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <select value={category} onChange={(e) => updateParams('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.filter(Boolean).map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => updateParams('sort', e.target.value)}>
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <FiGrid />
            </button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="loader"></div></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {pages > 1 && (
            <div className="pagination">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => updateParams('page', (i + 1).toString())}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
