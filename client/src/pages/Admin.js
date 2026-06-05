import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiPackage, FiShoppingCart, FiUsers, FiTag, FiSettings, FiSend, FiPlus, FiEdit2, FiTrash2,
  FiSave, FiX, FiImage, FiDollarSign, FiPercent, FiCalendar, FiShield, FiCheckCircle,
  FiXCircle, FiClock, FiStar, FiGlobe, FiSun, FiMoon, FiRefreshCw, FiLink,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const TABS = ['dashboard', 'products', 'orders', 'users', 'coupons', 'theme', 'webhooks'];

const statusIcon = {
  pending: FiClock,
  completed: FiCheckCircle,
  cancelled: FiXCircle,
  processing: FiClock,
};
const statusColor = {
  pending: 'text-yellow-400',
  completed: 'text-accent-electric',
  cancelled: 'text-error',
  processing: 'text-primary',
};

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
      <div className="font-price-tag text-price-tag text-on-surface">{value}</div>
      <div className="text-text-muted text-xs mt-1">{label}</div>
    </div>
  );
}

function ProductRow({ product, onEdit, onDelete, t }) {
  const isOnSale = product.oldPrice && product.oldPrice > product.price;
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-xl bg-surface-container-high shrink-0 overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted"><FiPackage size={20} /></div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-on-surface truncate">{product.name}</div>
          <div className="text-text-muted text-xs">{product.category}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-price-tag text-price-tag text-primary">${product.price?.toFixed(2)}</div>
          {isOnSale && <div className="text-text-muted text-xs line-through">${product.oldPrice?.toFixed(2)}</div>}
        </div>
        <button onClick={() => onEdit(product)} className="p-2 text-text-muted hover:text-primary transition-colors"><FiEdit2 size={16} /></button>
        <button onClick={() => onDelete(product._id)} className="p-2 text-text-muted hover:text-error transition-colors"><FiTrash2 size={16} /></button>
      </div>
    </div>
  );
}

function UserRow({ user: u, t }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={u.discordAvatar || `https://ui-avatars.com/api/?name=${u.username}&background=6c5ce7&color=fff&bold=true`}
          alt=""
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold text-sm text-on-surface">{u.username}</div>
          <div className="text-text-muted text-xs">{u.email || ''} <span className="text-primary">🆔 {u._id}</span></div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-text-muted">{u.purchases?.length || 0} {t('admin.purchases')}</span>
        {u.role === 'admin' && <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-xs">{t('admin.admin')}</span>}
        <span className={u.verified ? 'text-accent-electric' : 'text-error'}>
          {u.verified ? t('admin.verified') : t('admin.unverified')}
        </span>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, mode, toggleMode } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ products: [], orders: [], users: [], coupons: [] });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState({ admin: '', user: '' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', category: '', price: '', oldPrice: '', images: '', features: '', requirements: '', inStock: true });
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', expiresAt: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchData();
    fetchWebhooks();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [prodRes, ordRes, userRes, coupRes] = await Promise.all([
        axios.get('/api/admin/products', { headers }),
        axios.get('/api/admin/orders', { headers }),
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/coupons', { headers }),
      ]);
      setData({
        products: prodRes.data?.products || prodRes.data || [],
        orders: ordRes.data?.orders || ordRes.data || [],
        users: userRes.data?.users || userRes.data || [],
        coupons: coupRes.data?.coupons || coupRes.data || [],
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data: res } = await axios.get('/api/admin/webhooks', { headers: { Authorization: `Bearer ${token}` } });
      setWebhookUrl({
        admin: res?.adminWebhook || '',
        user: res?.userWebhook || '',
      });
    } catch { }
  };

  const saveWebhooks = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/admin/webhooks', webhookUrl, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('admin.webhookSaved'));
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const testWebhook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/webhooks/test', {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('admin.webhookTestSent'));
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        oldPrice: product.oldPrice?.toString() || '',
        images: (product.images || []).join('\n'),
        features: (product.features || []).join('\n'),
        requirements: (product.requirements || []).join('\n'),
        inStock: product.inStock ?? true,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', category: '', price: '', oldPrice: '', images: '', features: '', requirements: '', inStock: true });
    }
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    const token = localStorage.getItem('token');
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      oldPrice: productForm.oldPrice ? parseFloat(productForm.oldPrice) : undefined,
      images: productForm.images.split('\n').filter(Boolean),
      features: productForm.features.split('\n').filter(Boolean),
      requirements: productForm.requirements.split('\n').filter(Boolean),
    };
    try {
      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('admin.productUpdated'));
      } else {
        await axios.post('/api/admin/products', payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('admin.productCreated'));
      }
      setShowProductModal(false);
      fetchData();
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('admin.productDeleted'));
      fetchData();
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const openCouponModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code || '',
        discount: coupon.discount?.toString() || '',
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({ code: '', discount: '', expiresAt: '' });
    }
    setShowCouponModal(true);
  };

  const saveCoupon = async () => {
    const token = localStorage.getItem('token');
    const payload = { ...couponForm, discount: parseFloat(couponForm.discount) };
    try {
      if (editingCoupon) {
        await axios.put(`/api/admin/coupons/${editingCoupon._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('admin.couponUpdated'));
      } else {
        await axios.post('/api/admin/coupons', payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('admin.couponCreated'));
      }
      setShowCouponModal(false);
      fetchData();
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('admin.couponDeleted'));
      fetchData();
    } catch {
      toast.error(t('admin.error'));
    }
  };

  const stats = {
    totalProducts: data.products.length,
    totalOrders: data.orders.length,
    totalUsers: data.users.length,
    totalRevenue: data.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    pendingOrders: data.orders.filter(o => o.status === 'pending').length,
    completedOrders: data.orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{t('admin.title')}</h1>
        <p>{t('admin.subtitle')}</p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-edge pb-20">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {TABS.map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`shrink-0 px-5 py-2.5 rounded-lg font-label-caps text-label-caps text-sm transition-all ${
                tab === tabKey
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              {t(`admin.tab${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen py-20"><div className="loader" /></div>
        ) : tab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
              <StatCard icon={FiPackage} value={stats.totalProducts} label={t('admin.totalProducts')} />
              <StatCard icon={FiShoppingCart} value={stats.totalOrders} label={t('admin.totalOrders')} />
              <StatCard icon={FiUsers} value={stats.totalUsers} label={t('admin.totalUsers')} />
              <StatCard icon={FiDollarSign} value={`$${stats.totalRevenue.toFixed(2)}`} label={t('admin.totalRevenue')} />
              <StatCard icon={FiClock} value={stats.pendingOrders} label={t('admin.pendingOrders')} />
              <StatCard icon={FiCheckCircle} value={stats.completedOrders} label={t('admin.completedOrders')} />
            </div>
          </div>
        ) : tab === 'products' ? (
          <div>
            <button onClick={() => openProductModal()} className="btn-primary-custom flex items-center gap-2 mb-6">
              <FiPlus size={16} /> {t('admin.addProduct')}
            </button>
            <div className="space-y-3">
              {data.products.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noProducts')}</div>
              ) : (
                data.products.map(p => (
                  <ProductRow key={p._id} product={p} onEdit={openProductModal} onDelete={deleteProduct} t={t} />
                ))
              )}
            </div>
          </div>
        ) : tab === 'orders' ? (
          <div className="space-y-3">
            {data.orders.length === 0 ? (
              <div className="text-center py-12 text-text-muted">{t('admin.noOrders')}</div>
            ) : (
              data.orders.map(order => {
                const SIcon = statusIcon[order.status] || FiClock;
                return (
                  <div key={order._id} className="glass-card rounded-2xl p-5">
                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                      <div>
                        <span className="font-mono text-xs text-text-muted">{order._id}</span>
                        <div className="text-sm text-on-surface font-semibold">{order.user?.username || order.username || '—'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-sm ${statusColor[order.status] || 'text-text-muted'}`}>
                          <SIcon size={14} /> {order.status}
                        </span>
                        <span className="font-price-tag text-price-tag text-primary">${(order.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-surface-container-high rounded-lg text-xs text-text-muted">
                          {item.name || item.product?.name || 'Product'} × {item.quantity || 1}
                        </span>
                      ))}
                    </div>
                    <div className="text-text-muted text-xs mt-2">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                );
              })
            )}
          </div>
        ) : tab === 'users' ? (
          <div className="space-y-3">
            {data.users.length === 0 ? (
              <div className="text-center py-12 text-text-muted">{t('admin.noUsers')}</div>
            ) : (
              data.users.map(u => <UserRow key={u._id} user={u} t={t} />)
            )}
          </div>
        ) : tab === 'coupons' ? (
          <div>
            <button onClick={() => openCouponModal()} className="btn-primary-custom flex items-center gap-2 mb-6">
              <FiPlus size={16} /> {t('admin.addCoupon')}
            </button>
            <div className="space-y-3">
              {data.coupons.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noCoupons')}</div>
              ) : (
                data.coupons.map(c => (
                  <div key={c._id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
                        <FiPercent size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-on-surface">{c.code}</div>
                        <div className="text-text-muted text-xs">{c.discount}% {c.expiresAt ? `— ${new Date(c.expiresAt).toLocaleDateString()}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => openCouponModal(c)} className="p-2 text-text-muted hover:text-primary"><FiEdit2 size={16} /></button>
                      <button onClick={() => deleteCoupon(c._id)} className="p-2 text-text-muted hover:text-error"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : tab === 'theme' ? (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('admin.themeAppearance')}</h3>
              <button onClick={toggleMode} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20">
                {mode === 'dark' ? <FiSun size={20} className="text-primary" /> : <FiMoon size={20} className="text-primary" />}
                <span className="text-sm text-on-surface">{mode === 'dark' ? t('admin.themeLight') : t('admin.themeDark')}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeSiteName')}</label>
                <input className="form-input" value={theme.siteName || ''} readOnly />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeSiteLogo')}</label>
                <input className="form-input" value={theme.siteLogo || ''} readOnly />
              </div>
            </div>
            {theme.siteLogo && (
              <img src={theme.siteLogo} alt="Logo preview" className="h-12 rounded-lg" />
            )}
          </div>
        ) : tab === 'webhooks' ? (
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('admin.webhookSettings')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block flex items-center gap-2">
                    <FiShield size={14} className="text-primary" /> {t('admin.webhookAdmin')}
                  </label>
                  <input className="form-input" value={webhookUrl.admin} onChange={e => setWebhookUrl(p => ({ ...p, admin: e.target.value }))} placeholder={t('admin.webhookPlaceholder')} />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block flex items-center gap-2">
                    <FiUsers size={14} className="text-primary" /> {t('admin.webhookUser')}
                  </label>
                  <input className="form-input" value={webhookUrl.user} onChange={e => setWebhookUrl(p => ({ ...p, user: e.target.value }))} placeholder={t('admin.webhookPlaceholder')} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={saveWebhooks} className="btn-primary-custom flex items-center gap-2">
                  <FiSave size={16} /> {t('admin.webhookSave')}
                </button>
                <button onClick={testWebhook} className="btn-secondary-custom flex items-center gap-2">
                  <FiSend size={16} /> {t('admin.webhookTest')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Product modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container rounded-3xl p-6 md:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-2 text-text-muted hover:text-on-surface"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productName')}</label>
                  <input className="form-input" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productCategory')}</label>
                  <input className="form-input" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productDescription')}</label>
                <textarea className="form-input min-h-[80px]" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productPrice')}</label>
                  <div className="relative">
                    <FiDollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="number" step="0.01" className="form-input pl-10" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productOldPrice')}</label>
                  <div className="relative">
                    <FiDollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="number" step="0.01" className="form-input pl-10" value={productForm.oldPrice} onChange={e => setProductForm(p => ({ ...p, oldPrice: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productImages')}</label>
                <textarea className="form-input min-h-[60px]" value={productForm.images} onChange={e => setProductForm(p => ({ ...p, images: e.target.value }))} placeholder={t('admin.imagesPlaceholder')} />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productFeatures')}</label>
                <textarea className="form-input min-h-[60px]" value={productForm.features} onChange={e => setProductForm(p => ({ ...p, features: e.target.value }))} placeholder={t('admin.featuresPlaceholder')} />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.productRequirements')}</label>
                <textarea className="form-input min-h-[60px]" value={productForm.requirements} onChange={e => setProductForm(p => ({ ...p, requirements: e.target.value }))} placeholder={t('admin.requirementsPlaceholder')} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm(p => ({ ...p, inStock: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-on-surface">{t('admin.productInStock')}</span>
              </label>
              <button onClick={saveProduct} className="btn-primary-custom w-full flex items-center justify-center gap-2 mt-4">
                <FiSave size={16} /> {editingProduct ? t('admin.update') : t('admin.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCouponModal(false)}>
          <div className="w-full max-w-md bg-surface-container rounded-3xl p-6 md:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {editingCoupon ? t('admin.editCoupon') : t('admin.addCoupon')}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="p-2 text-text-muted hover:text-on-surface"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.couponCode')}</label>
                <input className="form-input" value={couponForm.code} onChange={e => setCouponForm(p => ({ ...p, code: e.target.value }))} placeholder="SAVE20" />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.couponDiscount')}</label>
                <div className="relative">
                  <FiPercent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="number" className="form-input pl-10" value={couponForm.discount} onChange={e => setCouponForm(p => ({ ...p, discount: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.couponExpires')}</label>
                <input type="date" className="form-input" value={couponForm.expiresAt} onChange={e => setCouponForm(p => ({ ...p, expiresAt: e.target.value }))} />
              </div>
              <button onClick={saveCoupon} className="btn-primary-custom w-full flex items-center justify-center gap-2">
                <FiSave size={16} /> {editingCoupon ? t('admin.update') : t('admin.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
