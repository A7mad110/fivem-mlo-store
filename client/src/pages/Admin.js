import React, { useState, useEffect } from 'react';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiX, FiUserX, FiPercent, FiSettings, FiRotateCcw, FiLink, FiSend } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme, applyTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const { api } = useAuth();
  const { theme: currentTheme, defaultTheme } = useTheme();
  const { t } = useLanguage();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    if (tab === 'dashboard') api.get('/admin/dashboard').then(({ data }) => setDashboard(data)).catch(() => {});
    if (tab === 'products') api.get('/admin/products').then(({ data }) => setProducts(data.products || [])).catch(() => {});
    if (tab === 'orders') api.get('/admin/orders').then(({ data }) => setOrders(data.orders || [])).catch(() => {});
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).catch(() => {});
    if (tab === 'coupons') api.get('/admin/coupons').then(({ data }) => setCoupons(data.coupons || [])).catch(() => {});
    if (tab === 'webhooks') api.get('/admin/webhooks').then(({ data }) => setWebhookForm(data)).catch(() => {});
  }, [tab, api]);

  useEffect(() => {
    setThemeForm(currentTheme);
  }, [currentTheme]);

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
    } catch (err) {
      toast.error(t('admin.themeTab.resetFailed'));
    }
  };

  const uploadImage = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      callback(data.url);
      toast.success(t('admin.upload.uploaded'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.upload.failed'));
    }
    e.target.value = '';
  };

  const FileUpload = ({ onUpload, accept = 'image/*' }) => (
    <label className="file-upload-btn">
      <input type="file" accept={accept} onChange={(e) => uploadImage(e, onUpload)} hidden />
      {t('admin.upload.upload')}
    </label>
  );

  const themeColorInput = (label, key) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="color" value={themeForm[key] || ''} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} style={{ width: '48px', height: '40px', padding: '2px', cursor: 'pointer' }} />
        <input type="text" value={themeForm[key] || ''} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} placeholder="#hex" style={{ flex: 1 }} />
      </div>
    </div>
  );

  const handleDelete = async (id) => {
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
    } catch (err) {
      toast.error(t('admin.order.updateFailed'));
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(u => u.map(x => x._id === id ? { ...x, role } : x));
      toast.success(t('admin.user.roleUpdated'));
    } catch (err) {
      toast.error(t('admin.order.updateFailed'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm(t('admin.user.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
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

  const tabs = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: <FiPackage /> },
    { id: 'products', label: t('admin.products'), icon: <FiPackage /> },
    { id: 'orders', label: t('admin.orders'), icon: <FiShoppingCart /> },
    { id: 'users', label: t('admin.users'), icon: <FiUsers /> },
    { id: 'coupons', label: t('admin.coupons'), icon: <FiPercent /> },
    { id: 'theme', label: t('admin.theme'), icon: <FiSettings /> },
    { id: 'webhooks', label: t('admin.webhooks'), icon: <FiLink /> },
  ];

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>{t('admin.title')}</h2>
        {tabs.map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'dashboard' && dashboard && (
          <>
            <h1>{t('admin.dashboard')}</h1>
            <div className="admin-stats">
              <div className="admin-stat"><FiDollarSign /><div><span>${(dashboard.totalRevenue || 0).toFixed(2)}</span><label>{t('admin.stats.revenue')}</label></div></div>
              <div className="admin-stat"><FiShoppingCart /><div><span>{dashboard.totalOrders || 0}</span><label>{t('admin.stats.orders')}</label></div></div>
              <div className="admin-stat"><FiPackage /><div><span>{dashboard.totalProducts || 0}</span><label>{t('admin.stats.products')}</label></div></div>
              <div className="admin-stat"><FiUsers /><div><span>{dashboard.totalUsers || 0}</span><label>{t('admin.stats.users')}</label></div></div>
            </div>
            <div className="admin-section">
              <h3>{t('admin.recentOrders')}</h3>
              {dashboard.recentOrders?.map(o => (
                <div key={o._id} className="admin-row">
                  <span>#{o._id.toString().slice(-8).toUpperCase()}</span>
                  <span>{o.user?.username || o.user?.email}</span>
                  <span>${o.totalAmount?.toFixed(2)}</span>
                  <span className={`order-status ${o.status}`}>{o.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="admin-header">
              <h1>{t('admin.product.title')} ({products.length})</h1>
              <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                <FiPlus /> {t('admin.product.add')}
              </button>
            </div>
            <div className="admin-table">
              {products.map(p => (
                <div key={p._id} className="admin-row">
                  <div className="admin-row-info">
                    <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt="" className="admin-thumb" />
                    <div><strong>{p.name}</strong><span className="admin-sub">${p.price.toFixed(2)} | {p.category}</span></div>
                  </div>
                  <span className={`badge-${p.inStock ? 'success' : 'muted'}`}>{p.inStock ? t('admin.product.inStock') : t('admin.product.outOfStock')}</span>
                  <div className="admin-actions">
                    <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }}><FiEdit2 /></button>
                    <button onClick={() => handleDelete(p._id)} className="danger"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <h1>{t('admin.order.title')} ({orders.length})</h1>
            <div className="admin-table">
              {orders.map(o => (
                <div key={o._id} className="admin-row">
                  <div>
                    <strong>#{o._id.toString().slice(-8).toUpperCase()}</strong>
                    <span className="admin-sub">{o.user?.username || o.user?.email}</span>
                  </div>
                  <span>${o.totalAmount?.toFixed(2)}</span>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    <option value="pending">{t('admin.order.pending')}</option>
                    <option value="completed">{t('admin.order.completed')}</option>
                    <option value="failed">{t('admin.order.failed')}</option>
                    <option value="refunded">{t('admin.order.refunded')}</option>
                  </select>
                  <span className="admin-date">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'users' && (
          <>
            <div className="admin-header">
              <h1>{t('admin.user.title')} ({users.length})</h1>
            </div>
            <div className="admin-table">
              {users.map(u => (
                <UserRow key={u._id} user={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} t={t} />
              ))}
            </div>
          </>
        )}

        {tab === 'coupons' && (
          <>
            <div className="admin-header">
              <h1>{t('admin.coupon.title')} ({coupons.length})</h1>
              <button className="btn-primary" onClick={() => { setEditingCoupon(null); setShowCouponModal(true); }}>
                <FiPlus /> {t('admin.coupon.add')}
              </button>
            </div>
            <div className="admin-table">
              {coupons.map(c => (
                <div key={c._id} className="admin-row">
                  <div className="admin-row-info">
                    <div>
                      <strong style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px' }}>{c.code}</strong>
                      <span className="admin-sub">
                        {c.type === 'percentage' ? `${c.value}% ${t('admin.coupon.off')}` : `$${c.value} ${t('admin.coupon.off')}`}
                        {c.minAmount > 0 && ` | ${t('admin.coupon.min')} $${c.minAmount}`}
                        {c.maxUses > 0 && ` | ${c.currentUses}/${c.maxUses} ${t('admin.coupon.uses')}`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge-${c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date()) ? 'success' : 'muted'}`}>
                    {c.active ? t('admin.coupon.active') : t('admin.coupon.inactive')}
                  </span>
                  <span className="admin-date">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : t('admin.coupon.noExpiry')}</span>
                  <div className="admin-actions">
                    <button onClick={() => { setEditingCoupon(c); setShowCouponModal(true); }}><FiEdit2 /></button>
                    <button onClick={() => handleDeleteCoupon(c._id)} className="danger"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'webhooks' && (
          <div className="admin-section" style={{ maxWidth: '700px' }}>
            <div className="admin-header">
              <h1>{t('admin.webhook.title')}</h1>
            </div>
            <p style={{ marginBottom: '20px', opacity: 0.7 }}>{t('admin.webhook.desc')}</p>

            <div className="form-group">
              <label>{t('admin.webhook.userWebhook')}</label>
              <p style={{ fontSize: '13px', opacity: 0.5, marginBottom: '6px' }}>{t('admin.webhook.userDesc')}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={webhookForm.userWebhook}
                  onChange={e => setWebhookForm({ ...webhookForm, userWebhook: e.target.value })}
                  placeholder={t('admin.webhook.placeholder')}
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                />
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    setWebhookTesting({ ...webhookTesting, user: true });
                    try {
                      await api.post('/admin/webhooks/test', { webhookUrl: webhookForm.userWebhook, type: 'user' });
                      toast.success(t('admin.webhook.testSent'));
                    } catch { toast.error(t('admin.webhook.testFailed')); }
                    setWebhookTesting({ ...webhookTesting, user: false });
                  }}
                  disabled={webhookTesting.user || !webhookForm.userWebhook}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {webhookTesting.user ? t('admin.webhook.sending') : <><FiSend /> {t('admin.webhook.test')}</>}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{t('admin.webhook.adminWebhook')}</label>
              <p style={{ fontSize: '13px', opacity: 0.5, marginBottom: '6px' }}>{t('admin.webhook.adminDesc')}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={webhookForm.adminWebhook}
                  onChange={e => setWebhookForm({ ...webhookForm, adminWebhook: e.target.value })}
                  placeholder={t('admin.webhook.placeholder')}
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                />
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    setWebhookTesting({ ...webhookTesting, admin: true });
                    try {
                      await api.post('/admin/webhooks/test', { webhookUrl: webhookForm.adminWebhook, type: 'admin' });
                      toast.success(t('admin.webhook.testSent'));
                    } catch { toast.error(t('admin.webhook.testFailed')); }
                    setWebhookTesting({ ...webhookTesting, admin: false });
                  }}
                  disabled={webhookTesting.admin || !webhookForm.adminWebhook}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {webhookTesting.admin ? t('admin.webhook.sending') : <><FiSend /> {t('admin.webhook.test')}</>}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="btn-primary"
                onClick={async () => {
                  setWebhookSaving(true);
                  try {
                    await api.put('/admin/webhooks', webhookForm);
                    toast.success(t('admin.webhook.saved'));
                  } catch (err) {
                    toast.error(err.response?.data?.message || t('admin.webhook.saveFailed'));
                  }
                  setWebhookSaving(false);
                }}
                disabled={webhookSaving}
                style={{ padding: '12px 32px', fontSize: '16px' }}
              >
                {webhookSaving ? t('admin.webhook.saving') : t('admin.webhook.save')}
              </button>
              <button
                className="btn-secondary"
                onClick={() => api.get('/admin/webhooks').then(({ data }) => setWebhookForm(data)).catch(() => {})}
                style={{ padding: '12px 24px' }}
              >
                {t('admin.webhook.reset')}
              </button>
            </div>
          </div>
        )}

        {tab === 'theme' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1>{t('admin.themeTab.title')}</h1>
              <button className="btn-secondary" onClick={handleThemeReset} style={{ padding: '8px 16px' }}>
                <FiRotateCcw /> {t('admin.themeTab.reset')}
              </button>
            </div>

            <div className="theme-section">
              <h3>{t('admin.themeTab.branding')}</h3>
              <div className="form-row">
                <div className="form-group"><label>{t('admin.themeTab.siteName')}</label><input value={themeForm.siteName || ''} onChange={e => setThemeForm({ ...themeForm, siteName: e.target.value })} /></div>
                <div className="form-group"><label>{t('admin.themeTab.siteLogo')}</label>
                  <div className="input-with-upload"><input value={themeForm.siteLogo || ''} onChange={e => setThemeForm({ ...themeForm, siteLogo: e.target.value })} placeholder="https://example.com/logo.png" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, siteLogo: url })} /></div>
                  {themeForm.siteLogo && <img src={themeForm.siteLogo} alt="logo preview" className="upload-preview" />}
                </div>
                <div className="form-group"><label>{t('admin.themeTab.favicon')}</label>
                  <div className="input-with-upload"><input value={themeForm.favicon || ''} onChange={e => setThemeForm({ ...themeForm, favicon: e.target.value })} placeholder="https://example.com/favicon.ico" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, favicon: url })} /></div>
                </div>
              </div>
            </div>

            <div className="theme-section">
              <h3>{t('admin.themeTab.colors')}</h3>
              <div className="form-group">
                <label>{t('admin.themeTab.bgImage')}</label>
                <div className="input-with-upload"><input value={themeForm.bgImage || ''} onChange={e => setThemeForm({ ...themeForm, bgImage: e.target.value })} placeholder="https://example.com/bg.jpg" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, bgImage: url })} /></div>
                {themeForm.bgImage && <img src={themeForm.bgImage} alt="bg preview" className="upload-preview" />}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.themeTab.bgRepeat')}</label>
                  <select value={themeForm.bgRepeat || 'repeat'} onChange={e => setThemeForm({ ...themeForm, bgRepeat: e.target.value })}>
                    <option value="repeat">{t('admin.themeTab.bgRepeatOpts.repeat')}</option>
                    <option value="no-repeat">{t('admin.themeTab.bgRepeatOpts.noRepeat')}</option>
                    <option value="repeat-x">{t('admin.themeTab.bgRepeatOpts.repeatX')}</option>
                    <option value="repeat-y">{t('admin.themeTab.bgRepeatOpts.repeatY')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.themeTab.bgSize')}</label>
                  <select value={themeForm.bgSize || 'auto'} onChange={e => setThemeForm({ ...themeForm, bgSize: e.target.value })}>
                    <option value="auto">{t('admin.themeTab.bgSizeOpts.auto')}</option>
                    <option value="cover">{t('admin.themeTab.bgSizeOpts.cover')}</option>
                    <option value="contain">{t('admin.themeTab.bgSizeOpts.contain')}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                {themeColorInput(t('admin.themeTab.backgrounds.bgPrimary'), 'bgPrimary')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgSecondary'), 'bgSecondary')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgCard'), 'bgCard')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgCardHover'), 'bgCardHover')}
                {themeColorInput(t('admin.themeTab.backgrounds.bgInput'), 'bgInput')}
              </div>
              <div className="form-row">
                {themeColorInput(t('admin.themeTab.borders.borderColor'), 'borderColor')}
                {themeColorInput(t('admin.themeTab.borders.borderHover'), 'borderHover')}
              </div>
              <div className="form-row">
                {themeColorInput(t('admin.themeTab.texts.textPrimary'), 'textPrimary')}
                {themeColorInput(t('admin.themeTab.texts.textSecondary'), 'textSecondary')}
                {themeColorInput(t('admin.themeTab.texts.textMuted'), 'textMuted')}
              </div>
              <div className="form-row">
                {themeColorInput(t('admin.themeTab.accents.accent'), 'accent')}
                {themeColorInput(t('admin.themeTab.accents.accentLight'), 'accentLight')}
              </div>
              <div className="form-row">
                {themeColorInput(t('admin.themeTab.states.success'), 'success')}
                {themeColorInput(t('admin.themeTab.states.warning'), 'warning')}
                {themeColorInput(t('admin.themeTab.states.danger'), 'danger')}
                {themeColorInput(t('admin.themeTab.states.info'), 'info')}
              </div>
            </div>

            <div className="theme-section">
              <h3>{t('admin.themeTab.typography')}</h3>
              <div className="form-row">
                <div className="form-group"><label>{t('admin.themeTab.bodyFont')}</label>
                  <select value={themeForm.fontFamily} onChange={e => setThemeForm({ ...themeForm, fontFamily: e.target.value })}>
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Nunito">Nunito</option>
                  </select>
                </div>
                <div className="form-group"><label>{t('admin.themeTab.headingFont')}</label>
                  <select value={themeForm.headingFont} onChange={e => setThemeForm({ ...themeForm, headingFont: e.target.value })}>
                    <option value="Orbitron">Orbitron</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                  </select>
                </div>
                <div className="form-group"><label>{t('admin.themeTab.borderRadius')}</label>
                  <input type="number" min="0" max="50" value={themeForm.borderRadius} onChange={e => setThemeForm({ ...themeForm, borderRadius: parseInt(e.target.value) || 12 })} />
                </div>
              </div>
            </div>

            <div className="theme-section">
              <h3>{t('admin.themeTab.hero')}</h3>
              <div className="form-row">
                <div className="form-group"><label>{t('admin.themeTab.heroTitle')}</label><input value={themeForm.heroTitle || ''} onChange={e => setThemeForm({ ...themeForm, heroTitle: e.target.value })} /></div>
                <div className="form-group"><label>{t('admin.themeTab.heroSubtitle')}</label><input value={themeForm.heroSubtitle || ''} onChange={e => setThemeForm({ ...themeForm, heroSubtitle: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>{t('admin.themeTab.heroBg')}</label>
                <div className="input-with-upload"><input value={themeForm.heroBg || ''} onChange={e => setThemeForm({ ...themeForm, heroBg: e.target.value })} placeholder="https://example.com/hero-bg.jpg" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, heroBg: url })} /></div>
                {themeForm.heroBg && <img src={themeForm.heroBg} alt="hero preview" className="upload-preview" />}
              </div>
            </div>

            <div className="theme-section">
              <h3>{t('admin.themeTab.extra')}</h3>
              <div className="form-group"><label>{t('admin.themeTab.footerText')}</label><input value={themeForm.footerText || ''} onChange={e => setThemeForm({ ...themeForm, footerText: e.target.value })} placeholder="Custom footer text" /></div>
              <div className="form-group"><label>{t('admin.themeTab.customCss')}</label>
                <textarea rows="6" value={themeForm.customCss || ''} onChange={e => setThemeForm({ ...themeForm, customCss: e.target.value })} placeholder="/* your custom CSS here */" style={{ fontFamily: 'monospace', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn-primary" onClick={handleThemeSave} disabled={themeSaving} style={{ padding: '12px 32px', fontSize: '16px' }}>
                {themeSaving ? t('admin.themeTab.saving') : t('admin.themeTab.save')}
              </button>
              <button className="btn-secondary" onClick={() => { setThemeForm(currentTheme); toast(t('admin.themeTab.changesReverted')); }} style={{ padding: '12px 24px' }}>
                {t('admin.themeTab.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={(product) => {
            if (editingProduct) {
              setProducts(p => p.map(x => x._id === product._id ? product : x));
            } else {
              setProducts(p => [product, ...p]);
            }
            setShowProductModal(false);
          }}
          api={api}
          t={t}
        />
      )}

      {showCouponModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => setShowCouponModal(false)}
          onSave={(coupon) => {
            if (editingCoupon) {
              setCoupons(c => c.map(x => x._id === coupon._id ? coupon : x));
            } else {
              setCoupons(c => [coupon, ...c]);
            }
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
        ...form,
        value: parseFloat(form.value),
        minAmount: parseFloat(form.minAmount) || 0,
        maxUses: parseInt(form.maxUses) || 0,
        categories: form.categories.split(',').map(t => t.trim()).filter(Boolean),
        expiresAt: form.expiresAt || undefined,
      };
      if (coupon) {
        const { data } = await api.put(`/admin/coupons/${coupon._id}`, payload);
        onSave(data.coupon);
        toast.success(t('admin.coupon.update'));
      } else {
        const { data } = await api.post('/admin/coupons', payload);
        onSave(data.coupon);
        toast.success(t('admin.coupon.create'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.product.saveFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{coupon ? t('admin.coupon.edit') : t('admin.coupon.add')}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('admin.coupon.code')}</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" required style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label>{t('admin.coupon.type')}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">{t('admin.coupon.percentage')}</option>
                <option value="fixed">{t('admin.coupon.fixed')}</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{form.type === 'percentage' ? t('admin.coupon.percentageLabel') : t('admin.coupon.amountLabel')}</label>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t('admin.coupon.minOrder')}</label>
              <input type="number" step="0.01" value={form.minAmount} onChange={e => setForm({ ...form, minAmount: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('admin.coupon.maxUses')}</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('admin.coupon.expiryDate')}</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>{t('admin.coupon.categories')}</label>
            <input value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} placeholder="mlo, maps, interior" />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('admin.product.saving') : coupon ? t('admin.coupon.update') : t('admin.coupon.create')}
          </button>
        </form>
      </div>
    </div>
  );
}

function UserRow({ user, onRoleChange, onDelete, t }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="admin-row-wrap">
      <div className="admin-row">
        <div className="admin-row-info" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          <img src={user.discordAvatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`} alt="" className="admin-avatar" />
          <div>
            <strong>{user.username}</strong>
            <span className="admin-sub">{user.email} {user.isVerified ? '✓' : ''} | {user.orders?.length || 0} {t('admin.user.orders')}</span>
            <span className="admin-sub" style={{ display: 'block', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t('admin.user.id')}: {user._id.toString().slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
        <select value={user.role} onChange={(e) => onRoleChange(user._id, e.target.value)} onClick={e => e.stopPropagation()}>
          <option value="user">{t('admin.user.user')}</option>
          <option value="admin">{t('admin.user.admin')}</option>
        </select>
        <span className="admin-date">{new Date(user.createdAt).toLocaleDateString()}</span>
        <div className="admin-actions">
          <button onClick={(e) => { e.stopPropagation(); onDelete(user._id); }} className="danger" title={t('admin.user.delete')}><FiUserX /></button>
        </div>
      </div>
      {expanded && user.orders?.length > 0 && (
        <div className="user-orders">
          {user.orders.map(order => (
            <div key={order._id} className="user-order">
              <div className="user-order-header">
                <span className="admin-sub">{t('admin.order.title')} #{order._id.toString().slice(-8).toUpperCase()}</span>
                <span className="admin-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="badge-success">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="user-order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="user-order-item">
                    {item.product && <img src={item.product.thumbnail || ''} alt="" className="admin-thumb" />}
                    <span>{item.name || item.product?.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {expanded && (!user.orders || user.orders.length === 0) && (
        <div className="user-orders-empty">{t('admin.user.noPurchases')}</div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, api, t }) {
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

  const uploadImage = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (target === 'thumbnail') {
        setForm({ ...form, thumbnail: data.url });
      } else {
        setForm({ ...form, images: [...form.images, data.url] });
      }
      toast.success(t('admin.upload.uploaded'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.upload.failed'));
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const moveImage = (index, dir) => {
    const arr = [...form.images];
    const to = index + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[index], arr[to]] = [arr[to], arr[index]];
    setForm({ ...form, images: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        features: form.features.split('\n').filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (product) {
        const { data } = await api.put(`/admin/products/${product._id}`, payload);
        onSave(data.product);
        toast.success(t('admin.product.update'));
      } else {
        const { data } = await api.post('/admin/products', payload);
        onSave(data.product);
        toast.success(t('admin.product.create'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.product.saveFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? t('admin.product.edit') : t('admin.product.add')}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('admin.product.name')}</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t('admin.product.slug')}</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('admin.product.price')}</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t('admin.product.salePrice')}</label>
              <input type="number" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{t('admin.product.category')}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="maps">Maps</option>
                <option value="mlo">MLO</option>
                <option value="interior">Interior</option>
                <option value="exterior">Exterior</option>
                <option value="build">Build</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>{t('admin.product.description')}</label>
            <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>{t('admin.product.shortDescription')}</label>
            <textarea rows="2" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <div className="form-group">
            <label>{t('admin.product.thumbnail')}</label>
            <div className="input-with-upload"><input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="URL or upload" /><label className="file-upload-btn"><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'thumbnail')} hidden />{uploading ? '...' : t('admin.product.upload')}</label></div>
            {form.thumbnail && <div className="image-preview-single"><img src={form.thumbnail} alt="thumbnail" /><button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} className="img-del-btn"><FiX /></button></div>}
          </div>

          <div className="form-group">
            <label>{t('admin.product.gallery')} ({form.images.length})</label>
            <div className="input-with-upload"><input disabled placeholder="Extra product images" /><label className="file-upload-btn"><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'gallery')} hidden />{uploading ? '...' : t('admin.product.upload')}</label></div>
            {form.images.length > 0 && (
              <div className="image-gallery-admin">
                {form.images.map((img, i) => (
                  <div key={i} className="image-gallery-item">
                    <img src={img} alt={`Gallery ${i+1}`} />
                    <div className="img-actions">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} title="Move left">←</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} title="Move right">→</button>
                      <button type="button" onClick={() => removeImage(i)} className="img-del-btn" title="Delete"><FiX /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>{t('admin.product.features')}</label>
            <textarea rows="3" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
          </div>
          <div className="form-group">
            <label>{t('admin.product.requirements')}</label>
            <textarea rows="3" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <div className="form-group">
            <label>{t('admin.product.tags')}</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} />
              {t('admin.product.inStock')}
            </label>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('admin.product.saving') : product ? t('admin.product.update') : t('admin.product.create')}
          </button>
        </form>
      </div>
    </div>
  );
}
