import React, { useState, useEffect } from 'react';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiX, FiUserX, FiPercent, FiSettings, FiRotateCcw, FiLink, FiSend, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme, applyTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const TABS = ['dashboard', 'products', 'orders', 'users', 'coupons', 'theme', 'webhooks'];
const statusColor = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  completed: 'text-accent-electric bg-accent-electric/10',
  cancelled: 'text-error bg-error/10',
  processing: 'text-primary bg-primary-container/20',
  failed: 'text-error bg-error/10',
  refunded: 'text-text-muted bg-surface-variant/30',
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

function UserRow({ user, onRoleChange, onDelete, t }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={user.discordAvatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff&bold=true`} alt="" className="w-10 h-10 rounded-full shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-on-surface truncate">{user.username}</div>
            <div className="text-text-muted text-xs truncate">{user.email} {user.isVerified ? '✓' : ''}</div>
            <div className="text-text-muted text-[11px] font-mono mt-0.5">{t('admin.user.id')}: {user._id.toString().slice(-8).toUpperCase()}</div>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          <select value={user.role} onChange={e => onRoleChange(user._id, e.target.value)} className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-2 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary">
            <option value="user">{t('admin.user.user')}</option>
            <option value="admin">{t('admin.user.admin')}</option>
          </select>
          <span className="text-text-muted text-xs shrink-0">{new Date(user.createdAt).toLocaleDateString()}</span>
          <button onClick={() => onDelete(user._id)} className="p-1.5 text-text-muted hover:text-error transition-colors" title={t('admin.user.delete')}><FiUserX size={14} /></button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-outline-variant/10 px-4 py-3 space-y-2">
          {user.orders?.length > 0 ? user.orders.map(order => (
            <div key={order._id} className="bg-surface-container-low rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">#{order._id.toString().slice(-8).toUpperCase()}</span>
                <span className="text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-price-tag text-price-tag text-primary text-xs">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                    {item.product?.thumbnail && <img src={item.product.thumbnail} alt="" className="w-6 h-6 rounded object-cover" />}
                    <span className="flex-1 truncate">{item.name || item.product?.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-text-muted text-xs text-center py-3">{t('admin.user.noPurchases')}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, api } = useAuth();
  const { theme: currentTheme, defaultTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [themeForm, setThemeForm] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [themeSaving, setThemeSaving] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ userWebhook: '', adminWebhook: '' });
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState({ user: false, admin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    setLoading(true);
    const fetches = {
      dashboard: tab === 'dashboard' ? api.get('/admin/dashboard').then(({ data }) => setDashboard(data)).catch(() => {}) : Promise.resolve(),
      products: tab === 'products' ? api.get('/admin/products').then(({ data }) => setProducts(data.products || [])).catch(() => {}) : Promise.resolve(),
      orders: tab === 'orders' ? api.get('/admin/orders').then(({ data }) => setOrders(data.orders || [])).catch(() => {}) : Promise.resolve(),
      users: tab === 'users' ? api.get('/admin/users').then(({ data }) => setUsersList(data.users || [])).catch(() => {}) : Promise.resolve(),
      coupons: tab === 'coupons' ? api.get('/admin/coupons').then(({ data }) => setCoupons(data.coupons || [])).catch(() => {}) : Promise.resolve(),
      webhooks: tab === 'webhooks' ? api.get('/admin/webhooks').then(({ data }) => setWebhookForm(data)).catch(() => {}) : Promise.resolve(),
    };
    Promise.all(Object.values(fetches)).finally(() => setLoading(false));
  }, [tab, user, navigate, api]);

  useEffect(() => { setThemeForm(currentTheme); }, [currentTheme]);

  const handleThemeSave = async () => {
    setThemeSaving(true);
    try {
      const { data } = await api.put('/theme', themeForm);
      applyTheme(data.theme);
      toast.success(t('admin.themeTab.saved'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.themeTab.saveFailed'));
    }
    setThemeSaving(false);
  };

  const handleThemeReset = async () => {
    if (!window.confirm(t('admin.themeTab.resetConfirm'))) return;
    try {
      const { data } = await api.post('/theme/reset');
      setThemeForm(data.theme);
      applyTheme(data.theme);
      toast.success(t('admin.themeTab.resetSuccess'));
    } catch { toast.error(t('admin.themeTab.resetFailed')); }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.upload.failed'));
      return null;
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(t('admin.product.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success(t('admin.product.deleted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.product.saveFailed'));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders(o => o.map(x => x._id === id ? { ...x, status } : x));
      toast.success(t('admin.order.statusUpdated'));
    } catch { toast.error(t('admin.order.updateFailed')); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsersList(u => u.map(x => x._id === id ? { ...x, role } : x));
      toast.success(t('admin.user.roleUpdated'));
    } catch { toast.error(t('admin.order.updateFailed')); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t('admin.user.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(u => u.filter(x => x._id !== id));
      toast.success(t('admin.user.deleted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.product.saveFailed'));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm(t('admin.coupon.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(c => c.filter(x => x._id !== id));
      toast.success(t('admin.coupon.deleted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.product.saveFailed'));
    }
  };

  if (!user || user.role !== 'admin') return null;

  const themeColorInput = (label, key) => (
    <div>
      <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={themeForm[key] || ''} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} className="w-12 h-10 p-0.5 cursor-pointer rounded-lg border border-outline-variant/30 bg-transparent" />
        <input className="form-input flex-1" value={themeForm[key] || ''} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} placeholder="#hex" />
      </div>
    </div>
  );

  const FileUploadBtn = ({ onUpload, accept = 'image/*' }) => (
    <label className="px-3 py-2 rounded-lg bg-primary-container/20 text-primary text-xs font-label-caps cursor-pointer hover:brightness-110 transition-all">
      <input type="file" accept={accept} onChange={async (e) => { const url = await uploadImage(e.target.files[0]); if (url) onUpload(url); e.target.value = ''; }} hidden />
      {t('admin.upload.upload')}
    </label>
  );

  const tabLabel = (key) => {
    const labels = {
      dashboard: t('admin.dashboard'), products: t('admin.products'), orders: t('admin.orders'),
      users: t('admin.users'), coupons: t('admin.coupons'), theme: t('admin.theme'), webhooks: t('admin.webhooks'),
    };
    return labels[key] || key;
  };

  return (
    <div className="main-content">
      <div className="max-w-container-max mx-auto px-margin-edge py-8">
        {/* Mobile tab selector */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {TABS.map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={`shrink-0 px-5 py-2.5 rounded-lg font-label-caps text-label-caps text-sm transition-all ${
                tab === tabKey ? 'bg-primary-container text-on-primary-container' : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/30'
              }`}>
              {tabLabel(tabKey)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen py-20"><div className="loader" /></div>
        ) : tab === 'dashboard' && dashboard ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              <StatCard icon={FiDollarSign} value={`$${(dashboard.totalRevenue || 0).toFixed(2)}`} label={t('admin.stats.revenue')} />
              <StatCard icon={FiShoppingCart} value={dashboard.totalOrders || 0} label={t('admin.stats.orders')} />
              <StatCard icon={FiPackage} value={dashboard.totalProducts || 0} label={t('admin.stats.products')} />
              <StatCard icon={FiUsers} value={dashboard.totalUsers || 0} label={t('admin.stats.users')} />
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-4">{t('admin.recentOrders')}</h3>
              <div className="space-y-2">
                {dashboard.recentOrders?.map(o => (
                  <div key={o._id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="font-mono text-xs text-text-muted">#{o._id.toString().slice(-8).toUpperCase()}</span>
                    <span className="text-sm text-on-surface">{o.user?.username || o.user?.email}</span>
                    <span className="font-price-tag text-price-tag text-primary text-sm">${(o.totalAmount || 0).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.status] || 'text-text-muted'}`}>{o.status}</span>
                  </div>
                ))}
                {(!dashboard.recentOrders || dashboard.recentOrders.length === 0) && (
                  <div className="text-text-muted text-sm text-center py-4">{t('admin.noOrders')}</div>
                )}
              </div>
            </div>
          </div>
        ) : tab === 'products' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('admin.product.title')} ({products.length})</h1>
              <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="btn-primary-custom flex items-center gap-2">
                <FiPlus size={16} /> {t('admin.product.add')}
              </button>
            </div>
            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noProducts')}</div>
              ) : products.map(p => (
                <div key={p._id} className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt="" className="w-11 h-11 rounded-xl object-cover bg-surface-container-high shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-on-surface truncate">{p.name}</div>
                      <div className="text-text-muted text-xs">${p.price?.toFixed(2)} | {p.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.inStock ? (
                      <span className="text-accent-electric text-xs">{t('admin.product.inStock')}</span>
                    ) : (
                      <span className="text-error text-xs">{t('admin.product.outOfStock')}</span>
                    )}
                    <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-2 text-text-muted hover:text-primary transition-colors"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-text-muted hover:text-error transition-colors"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === 'orders' ? (
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface mb-6">{t('admin.order.title')} ({orders.length})</h1>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noOrders')}</div>
              ) : orders.map(o => (
                <div key={o._id} className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs text-text-muted">#{o._id.toString().slice(-8).toUpperCase()}</div>
                    <div className="text-sm text-on-surface font-semibold">{o.user?.username || o.user?.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-price-tag text-price-tag text-primary">${(o.totalAmount || 0).toFixed(2)}</span>
                    <select value={o.status} onChange={e => handleStatusChange(o._id, e.target.value)}
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-2 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary">
                      <option value="pending">{t('admin.order.pending')}</option>
                      <option value="completed">{t('admin.order.completed')}</option>
                      <option value="failed">{t('admin.order.failed')}</option>
                      <option value="refunded">{t('admin.order.refunded')}</option>
                    </select>
                    <span className="text-text-muted text-xs">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === 'users' ? (
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface mb-6">{t('admin.user.title')} ({usersList.length})</h1>
            <div className="space-y-3">
              {usersList.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noUsers')}</div>
              ) : usersList.map(u => (
                <UserRow key={u._id} user={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} t={t} />
              ))}
            </div>
          </div>
        ) : tab === 'coupons' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('admin.coupon.title')} ({coupons.length})</h1>
              <button onClick={() => { setEditingCoupon(null); setShowCouponModal(true); }} className="btn-primary-custom flex items-center gap-2">
                <FiPlus size={16} /> {t('admin.coupon.add')}
              </button>
            </div>
            <div className="space-y-3">
              {coupons.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{t('admin.noCoupons')}</div>
              ) : coupons.map(c => (
                <div key={c._id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
                      <FiPercent size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-sm text-on-surface tracking-wider">{c.code}</div>
                      <div className="text-text-muted text-xs">
                        {c.type === 'percentage' ? `${c.value}% ${t('admin.coupon.off')}` : `$${c.value} ${t('admin.coupon.off')}`}
                        {c.minAmount > 0 && ` | ${t('admin.coupon.min')} $${c.minAmount}`}
                        {c.maxUses > 0 && ` | ${c.currentUses || 0}/${c.maxUses} ${t('admin.coupon.uses')}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date()) ? 'text-accent-electric' : 'text-text-muted'}`}>
                      {c.active ? t('admin.coupon.active') : t('admin.coupon.inactive')}
                    </span>
                    <span className="text-text-muted text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : t('admin.coupon.noExpiry')}</span>
                    <button onClick={() => { setEditingCoupon(c); setShowCouponModal(true); }} className="p-2 text-text-muted hover:text-primary"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 text-text-muted hover:text-error"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === 'theme' ? (
          <div className="glass-panel rounded-2xl p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('admin.themeTab.title')}</h2>
              <button onClick={handleThemeReset} className="btn-secondary-custom flex items-center gap-2 text-sm">
                <FiRotateCcw size={16} /> {t('admin.themeTab.reset')}
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('admin.themeTab.branding')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.siteName')}</label>
                  <input className="form-input" value={themeForm.siteName || ''} onChange={e => setThemeForm({ ...themeForm, siteName: e.target.value })} />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.siteLogo')}</label>
                  <div className="flex gap-2">
                    <input className="form-input flex-1" value={themeForm.siteLogo || ''} onChange={e => setThemeForm({ ...themeForm, siteLogo: e.target.value })} placeholder="https://example.com/logo.png" />
                    <FileUploadBtn onUpload={(url) => setThemeForm({ ...themeForm, siteLogo: url })} />
                  </div>
                  {themeForm.siteLogo && <img src={themeForm.siteLogo} alt="logo" className="h-12 mt-2 rounded-lg" />}
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.favicon')}</label>
                  <div className="flex gap-2">
                    <input className="form-input flex-1" value={themeForm.favicon || ''} onChange={e => setThemeForm({ ...themeForm, favicon: e.target.value })} placeholder="https://example.com/favicon.ico" />
                    <FileUploadBtn onUpload={(url) => setThemeForm({ ...themeForm, favicon: url })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('admin.themeTab.colors')}</h3>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.bgImage')}</label>
                <div className="flex gap-2">
                  <input className="form-input flex-1" value={themeForm.bgImage || ''} onChange={e => setThemeForm({ ...themeForm, bgImage: e.target.value })} placeholder="https://example.com/bg.jpg" />
                  <FileUploadBtn onUpload={(url) => setThemeForm({ ...themeForm, bgImage: url })} />
                </div>
                {themeForm.bgImage && <img src={themeForm.bgImage} alt="bg" className="h-20 mt-2 rounded-lg object-cover" />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.bgRepeat')}</label>
                  <select className="form-input" value={themeForm.bgRepeat || 'repeat'} onChange={e => setThemeForm({ ...themeForm, bgRepeat: e.target.value })}>
                    <option value="repeat">{t('admin.themeTab.bgRepeatOpts.repeat')}</option>
                    <option value="no-repeat">{t('admin.themeTab.bgRepeatOpts.noRepeat')}</option>
                    <option value="repeat-x">{t('admin.themeTab.bgRepeatOpts.repeatX')}</option>
                    <option value="repeat-y">{t('admin.themeTab.bgRepeatOpts.repeatY')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.bgSize')}</label>
                  <select className="form-input" value={themeForm.bgSize || 'auto'} onChange={e => setThemeForm({ ...themeForm, bgSize: e.target.value })}>
                    <option value="auto">{t('admin.themeTab.bgSizeOpts.auto')}</option>
                    <option value="cover">{t('admin.themeTab.bgSizeOpts.cover')}</option>
                    <option value="contain">{t('admin.themeTab.bgSizeOpts.contain')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themeColorInput(t('admin.themeTab.backgrounds.bgPrimary'), 'bgPrimary')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgSecondary'), 'bgSecondary')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgCard'), 'bgCard')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgCardHover'), 'bgCardHover')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgInput'), 'bgInput')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themeColorInput(t('admin.themeTab.borders.borderColor'), 'borderColor')}
                {themeColorInput(t('admin.themeTab.borders.borderHover'), 'borderHover')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themeColorInput(t('admin.themeTab.texts.textPrimary'), 'textPrimary')}
                {themeColorInput(t('admin.themeTab.texts.textSecondary'), 'textSecondary')}
                {themeColorInput(t('admin.themeTab.texts.textMuted'), 'textMuted')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themeColorInput(t('admin.themeTab.accents.accent'), 'accent')}
                {themeColorInput(t('admin.themeTab.accents.accentLight'), 'accentLight')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themeColorInput(t('admin.themeTab.states.success'), 'success')}
                {themeColorInput(t('admin.themeTab.states.warning'), 'warning')}
                {themeColorInput(t('admin.themeTab.states.danger'), 'danger')}
                {themeColorInput(t('admin.themeTab.states.info'), 'info')}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('admin.themeTab.typography')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.bodyFont')}</label>
                  <select className="form-input" value={themeForm.fontFamily} onChange={e => setThemeForm({ ...themeForm, fontFamily: e.target.value })}>
                    {['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Raleway', 'Nunito'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.headingFont')}</label>
                  <select className="form-input" value={themeForm.headingFont} onChange={e => setThemeForm({ ...themeForm, headingFont: e.target.value })}>
                    {['Orbitron', 'Poppins', 'Montserrat', 'Raleway', 'Bebas Neue', 'Oswald', 'Inter', 'Playfair Display'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.borderRadius')}</label>
                  <input type="number" min="0" max="50" className="form-input" value={themeForm.borderRadius} onChange={e => setThemeForm({ ...themeForm, borderRadius: parseInt(e.target.value) || 12 })} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('admin.themeTab.hero')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.heroTitle')}</label>
                  <input className="form-input" value={themeForm.heroTitle || ''} onChange={e => setThemeForm({ ...themeForm, heroTitle: e.target.value })} />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.heroSubtitle')}</label>
                  <input className="form-input" value={themeForm.heroSubtitle || ''} onChange={e => setThemeForm({ ...themeForm, heroSubtitle: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.heroBg')}</label>
                <div className="flex gap-2">
                  <input className="form-input flex-1" value={themeForm.heroBg || ''} onChange={e => setThemeForm({ ...themeForm, heroBg: e.target.value })} placeholder="https://example.com/hero-bg.jpg" />
                  <FileUploadBtn onUpload={(url) => setThemeForm({ ...themeForm, heroBg: url })} />
                </div>
                {themeForm.heroBg && <img src={themeForm.heroBg} alt="hero" className="h-20 mt-2 rounded-lg object-cover" />}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface">{t('admin.themeTab.extra')}</h3>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.footerText')}</label>
                <input className="form-input" value={themeForm.footerText || ''} onChange={e => setThemeForm({ ...themeForm, footerText: e.target.value })} placeholder="Custom footer text" />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.themeTab.customCss')}</label>
                <textarea rows="6" className="form-input font-mono text-sm" value={themeForm.customCss || ''} onChange={e => setThemeForm({ ...themeForm, customCss: e.target.value })} placeholder="/* your custom CSS here */" />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleThemeSave} disabled={themeSaving} className="btn-primary-custom flex items-center gap-2">
                {themeSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={16} />}
                {themeSaving ? t('admin.themeTab.saving') : t('admin.themeTab.save')}
              </button>
              <button onClick={() => { setThemeForm(currentTheme); toast(t('admin.themeTab.changesReverted')); }} className="btn-secondary-custom">
                {t('admin.themeTab.cancel')}
              </button>
            </div>
          </div>
        ) : tab === 'webhooks' ? (
          <div className="glass-panel rounded-2xl p-6 max-w-2xl space-y-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t('admin.webhook.title')}</h3>
              <p className="text-text-muted text-sm">{t('admin.webhook.desc')}</p>
            </div>

            <div className="space-y-3">
              <label className="font-label-caps text-label-caps text-text-muted text-xs block">{t('admin.webhook.userWebhook')}</label>
              <p className="text-text-muted text-xs">{t('admin.webhook.userDesc')}</p>
              <div className="flex gap-2">
                <input className="form-input flex-1 font-mono text-sm" value={webhookForm.userWebhook} onChange={e => setWebhookForm({ ...webhookForm, userWebhook: e.target.value })} placeholder={t('admin.webhook.placeholder')} />
                <button className="btn-secondary-custom shrink-0 flex items-center gap-1 text-xs" disabled={webhookTesting.user || !webhookForm.userWebhook}
                  onClick={async () => {
                    setWebhookTesting({ ...webhookTesting, user: true });
                    try { await api.post('/admin/webhooks/test', { webhookUrl: webhookForm.userWebhook, type: 'user' }); toast.success(t('admin.webhook.testSent')); }
                    catch { toast.error(t('admin.webhook.testFailed')); }
                    setWebhookTesting({ ...webhookTesting, user: false });
                  }}>
                  {webhookTesting.user ? <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <FiSend size={14} />}
                  {t('admin.webhook.test')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-label-caps text-label-caps text-text-muted text-xs block">{t('admin.webhook.adminWebhook')}</label>
              <p className="text-text-muted text-xs">{t('admin.webhook.adminDesc')}</p>
              <div className="flex gap-2">
                <input className="form-input flex-1 font-mono text-sm" value={webhookForm.adminWebhook} onChange={e => setWebhookForm({ ...webhookForm, adminWebhook: e.target.value })} placeholder={t('admin.webhook.placeholder')} />
                <button className="btn-secondary-custom shrink-0 flex items-center gap-1 text-xs" disabled={webhookTesting.admin || !webhookForm.adminWebhook}
                  onClick={async () => {
                    setWebhookTesting({ ...webhookTesting, admin: true });
                    try { await api.post('/admin/webhooks/test', { webhookUrl: webhookForm.adminWebhook, type: 'admin' }); toast.success(t('admin.webhook.testSent')); }
                    catch { toast.error(t('admin.webhook.testFailed')); }
                    setWebhookTesting({ ...webhookTesting, admin: false });
                  }}>
                  {webhookTesting.admin ? <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <FiSend size={14} />}
                  {t('admin.webhook.test')}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary-custom flex items-center gap-2" disabled={webhookSaving}
                onClick={async () => {
                  setWebhookSaving(true);
                  try { await api.put('/admin/webhooks', webhookForm); toast.success(t('admin.webhook.saved')); }
                  catch (err) { toast.error(err.response?.data?.message || t('admin.webhook.saveFailed')); }
                  setWebhookSaving(false);
                }}>
                {webhookSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={16} />}
                {t('admin.webhook.save')}
              </button>
              <button className="btn-secondary-custom" onClick={() => api.get('/admin/webhooks').then(({ data }) => setWebhookForm(data)).catch(() => {})}>
                {t('admin.webhook.reset')}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={(product) => {
            if (editingProduct) setProducts(p => p.map(x => x._id === product._id ? product : x));
            else setProducts(p => [product, ...p]);
            setShowProductModal(false);
          }}
          api={api}
          t={t}
          uploadImage={uploadImage}
        />
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => setShowCouponModal(false)}
          onSave={(coupon) => {
            if (editingCoupon) setCoupons(c => c.map(x => x._id === coupon._id ? coupon : x));
            else setCoupons(c => [coupon, ...c]);
            setShowCouponModal(false);
          }}
          api={api}
          t={t}
        />
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSave, api, t }) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || '',
    minAmount: coupon?.minAmount || 0,
    maxUses: coupon?.maxUses || 0,
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
    categories: coupon?.categories?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form, value: parseFloat(form.value), minAmount: parseFloat(form.minAmount) || 0,
        maxUses: parseInt(form.maxUses) || 0, categories: form.categories.split(',').map(t => t.trim()).filter(Boolean),
        expiresAt: form.expiresAt || undefined,
      };
      if (coupon) { const { data } = await api.put(`/admin/coupons/${coupon._id}`, payload); onSave(data.coupon); toast.success(t('admin.coupon.update')); }
      else { const { data } = await api.post('/admin/coupons', payload); onSave(data.coupon); toast.success(t('admin.coupon.create')); }
    } catch (err) { toast.error(err.response?.data?.message || t('admin.product.saveFailed')); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-surface-container rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{coupon ? t('admin.coupon.edit') : t('admin.coupon.add')}</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-on-surface"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.code')}</label>
              <input className="form-input uppercase tracking-wider" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" required />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.type')}</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">{t('admin.coupon.percentage')}</option>
                <option value="fixed">{t('admin.coupon.fixed')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{form.type === 'percentage' ? t('admin.coupon.percentageLabel') : t('admin.coupon.amountLabel')}</label>
              <input type="number" step="0.01" className="form-input" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.minOrder')}</label>
              <input type="number" step="0.01" className="form-input" value={form.minAmount} onChange={e => setForm({ ...form, minAmount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.maxUses')}</label>
              <input type="number" className="form-input" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.expiryDate')}</label>
              <input type="date" className="form-input" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.coupon.categories')}</label>
            <input className="form-input" value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} placeholder="mlo, maps, interior" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-custom w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? t('admin.product.saving') : (coupon ? t('admin.coupon.update') : t('admin.coupon.create'))}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSave, api, t, uploadImage }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price || '',
    salePrice: product?.salePrice || '',
    category: product?.category || 'mlo',
    features: product?.features?.join('\n') || '',
    requirements: product?.requirements?.join('\n') || '',
    tags: product?.tags?.join(', ') || '',
    inStock: product?.inStock ?? true,
    thumbnail: product?.thumbnail || '',
    images: product?.images || [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (target === 'thumbnail') setForm({ ...form, thumbnail: data.url });
      else setForm({ ...form, images: [...form.images, data.url] });
      toast.success(t('admin.upload.uploaded'));
    } catch (err) { toast.error(err.response?.data?.message || t('admin.upload.failed')); }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  const moveImage = (index, dir) => {
    const arr = [...form.images]; const to = index + dir;
    if (to < 0 || to >= arr.length) return; [arr[index], arr[to]] = [arr[to], arr[index]];
    setForm({ ...form, images: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form, price: parseFloat(form.price), salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        features: form.features.split('\n').filter(Boolean), requirements: form.requirements.split('\n').filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (product) { const { data } = await api.put(`/admin/products/${product._id}`, payload); onSave(data.product); toast.success(t('admin.product.update')); }
      else { const { data } = await api.post('/admin/products', payload); onSave(data.product); toast.success(t('admin.product.create')); }
    } catch (err) { toast.error(err.response?.data?.message || t('admin.product.saveFailed')); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container rounded-3xl p-6 md:p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{product ? t('admin.product.edit') : t('admin.product.add')}</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-on-surface"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.name')}</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.slug')}</label>
              <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.price')}</label>
              <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.salePrice')}</label>
              <input type="number" step="0.01" className="form-input" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.category')}</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="maps">Maps</option>
                <option value="mlo">MLO</option>
                <option value="interior">Interior</option>
                <option value="exterior">Exterior</option>
                <option value="build">Build</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.description')}</label>
            <textarea rows="4" className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.shortDescription')}</label>
            <textarea rows="2" className="form-input" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.thumbnail')}</label>
            <div className="flex gap-2">
              <input className="form-input flex-1" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="URL or upload" />
              <label className="px-3 py-2.5 rounded-lg bg-primary-container/20 text-primary text-xs font-label-caps cursor-pointer hover:brightness-110 transition-all shrink-0">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'thumbnail')} hidden />{uploading ? '...' : t('admin.product.upload')}
              </label>
            </div>
            {form.thumbnail && (
              <div className="relative inline-block mt-2">
                <img src={form.thumbnail} alt="" className="h-20 rounded-lg object-cover" />
                <button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center"><FiX size={12} /></button>
              </div>
            )}
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.gallery')} ({form.images.length})</label>
            <div className="flex gap-2">
              <input className="form-input flex-1" disabled placeholder="Extra product images" />
              <label className="px-3 py-2.5 rounded-lg bg-primary-container/20 text-primary text-xs font-label-caps cursor-pointer hover:brightness-110 transition-all shrink-0">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'gallery')} hidden />{uploading ? '...' : t('admin.product.upload')}
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 text-white text-xs hover:text-primary disabled:opacity-30">←</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-1 text-white text-xs hover:text-primary disabled:opacity-30">→</button>
                      <button type="button" onClick={() => removeImage(i)} className="p-1 text-white text-xs hover:text-error"><FiX size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.features')}</label>
              <textarea rows="3" className="form-input" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.requirements')}</label>
              <textarea rows="3" className="form-input" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-text-muted text-xs mb-1.5 block">{t('admin.product.tags')}</label>
            <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-on-surface">{t('admin.product.inStock')}</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary-custom w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? t('admin.product.saving') : (product ? t('admin.product.update') : t('admin.product.create'))}
          </button>
        </form>
      </div>
    </div>
  );
}
