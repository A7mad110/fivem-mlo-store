import React, { useState, useEffect } from 'react';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiX, FiUserX, FiPercent, FiSettings, FiRotateCcw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme, applyTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const { api } = useAuth();
  const { theme: currentTheme, defaultTheme } = useTheme();
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

  useEffect(() => {
    if (tab === 'dashboard') api.get('/admin/dashboard').then(({ data }) => setDashboard(data)).catch(() => {});
    if (tab === 'products') api.get('/admin/products').then(({ data }) => setProducts(data.products || [])).catch(() => {});
    if (tab === 'orders') api.get('/admin/orders').then(({ data }) => setOrders(data.orders || [])).catch(() => {});
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).catch(() => {});
    if (tab === 'coupons') api.get('/admin/coupons').then(({ data }) => setCoupons(data.coupons || [])).catch(() => {});
  }, [tab, api]);

  useEffect(() => {
    setThemeForm(currentTheme);
  }, [currentTheme]);

  const handleThemeSave = async () => {
    setThemeSaving(true);
    try {
      const { data } = await api.put('/theme', themeForm);
      applyTheme(data.theme);
      toast.success('Theme saved and applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setThemeSaving(false);
  };

  const handleThemeReset = async () => {
    if (!window.confirm('Reset theme to defaults?')) return;
    try {
      const { data } = await api.post('/theme/reset');
      setThemeForm(data.theme);
      applyTheme(data.theme);
      toast.success('Theme reset');
    } catch (err) {
      toast.error('Reset failed');
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
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    e.target.value = '';
  };

  const FileUpload = ({ onUpload, accept = 'image/*' }) => (
    <label className="file-upload-btn">
      <input type="file" accept={accept} onChange={(e) => uploadImage(e, onUpload)} hidden />
      Upload Image
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders(o => o.map(x => x._id === id ? { ...x, status } : x));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(u => u.map(x => x._id === id ? { ...x, role } : x));
      toast.success('Role updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their orders? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(c => c.filter(x => x._id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiPackage /> },
    { id: 'products', label: 'Products', icon: <FiPackage /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingCart /> },
    { id: 'users', label: 'Users', icon: <FiUsers /> },
    { id: 'coupons', label: 'Coupons', icon: <FiPercent /> },
    { id: 'theme', label: 'Theme', icon: <FiSettings /> },
  ];

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        {tabs.map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'dashboard' && dashboard && (
          <>
            <h1>Dashboard</h1>
            <div className="admin-stats">
              <div className="admin-stat"><FiDollarSign /><div><span>${(dashboard.totalRevenue || 0).toFixed(2)}</span><label>Revenue</label></div></div>
              <div className="admin-stat"><FiShoppingCart /><div><span>{dashboard.totalOrders || 0}</span><label>Orders</label></div></div>
              <div className="admin-stat"><FiPackage /><div><span>{dashboard.totalProducts || 0}</span><label>Products</label></div></div>
              <div className="admin-stat"><FiUsers /><div><span>{dashboard.totalUsers || 0}</span><label>Users</label></div></div>
            </div>
            <div className="admin-section">
              <h3>Recent Orders</h3>
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
              <h1>Products ({products.length})</h1>
              <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                <FiPlus /> Add Product
              </button>
            </div>
            <div className="admin-table">
              {products.map(p => (
                <div key={p._id} className="admin-row">
                  <div className="admin-row-info">
                    <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt="" className="admin-thumb" />
                    <div><strong>{p.name}</strong><span className="admin-sub">${p.price.toFixed(2)} | {p.category}</span></div>
                  </div>
                  <span className={`badge-${p.inStock ? 'success' : 'muted'}`}>{p.inStock ? 'In Stock' : 'Out'}</span>
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
            <h1>Orders ({orders.length})</h1>
            <div className="admin-table">
              {orders.map(o => (
                <div key={o._id} className="admin-row">
                  <div>
                    <strong>#{o._id.toString().slice(-8).toUpperCase()}</strong>
                    <span className="admin-sub">{o.user?.username || o.user?.email}</span>
                  </div>
                  <span>${o.totalAmount?.toFixed(2)}</span>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
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
              <h1>Users ({users.length})</h1>
            </div>
            <div className="admin-table">
              {users.map(u => (
                <UserRow key={u._id} user={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} />
              ))}
            </div>
          </>
        )}

        {tab === 'coupons' && (
          <>
            <div className="admin-header">
              <h1>Coupons ({coupons.length})</h1>
              <button className="btn-primary" onClick={() => { setEditingCoupon(null); setShowCouponModal(true); }}>
                <FiPlus /> Add Coupon
              </button>
            </div>
            <div className="admin-table">
              {coupons.map(c => (
                <div key={c._id} className="admin-row">
                  <div className="admin-row-info">
                    <div>
                      <strong style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px' }}>{c.code}</strong>
                      <span className="admin-sub">
                        {c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`}
                        {c.minAmount > 0 && ` | Min $${c.minAmount}`}
                        {c.maxUses > 0 && ` | ${c.currentUses}/${c.maxUses} uses`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge-${c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date()) ? 'success' : 'muted'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="admin-date">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}</span>
                  <div className="admin-actions">
                    <button onClick={() => { setEditingCoupon(c); setShowCouponModal(true); }}><FiEdit2 /></button>
                    <button onClick={() => handleDeleteCoupon(c._id)} className="danger"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'theme' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1>Theme Customizer</h1>
              <button className="btn-secondary" onClick={handleThemeReset} style={{ padding: '8px 16px' }}>
                <FiRotateCcw /> Reset Defaults
              </button>
            </div>

            <div className="theme-section">
              <h3>Branding</h3>
              <div className="form-row">
                <div className="form-group"><label>Site Name</label><input value={themeForm.siteName || ''} onChange={e => setThemeForm({ ...themeForm, siteName: e.target.value })} /></div>
                <div className="form-group"><label>Site Logo URL</label>
                  <div className="input-with-upload"><input value={themeForm.siteLogo || ''} onChange={e => setThemeForm({ ...themeForm, siteLogo: e.target.value })} placeholder="https://example.com/logo.png" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, siteLogo: url })} /></div>
                  {themeForm.siteLogo && <img src={themeForm.siteLogo} alt="logo preview" className="upload-preview" />}
                </div>
                <div className="form-group"><label>Favicon URL</label>
                  <div className="input-with-upload"><input value={themeForm.favicon || ''} onChange={e => setThemeForm({ ...themeForm, favicon: e.target.value })} placeholder="https://example.com/favicon.ico" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, favicon: url })} /></div>
                </div>
              </div>
            </div>

            <div className="theme-section">
              <h3>Colors & Background</h3>
              <div className="form-group">
                <label>Site Background Image (overrides bg color)</label>
                <div className="input-with-upload"><input value={themeForm.bgImage || ''} onChange={e => setThemeForm({ ...themeForm, bgImage: e.target.value })} placeholder="https://example.com/bg.jpg" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, bgImage: url })} /></div>
                {themeForm.bgImage && <img src={themeForm.bgImage} alt="bg preview" className="upload-preview" />}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Background Repeat</label>
                  <select value={themeForm.bgRepeat || 'repeat'} onChange={e => setThemeForm({ ...themeForm, bgRepeat: e.target.value })}>
                    <option value="repeat">Repeat (تiles)</option>
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat-x">Repeat Horizontally</option>
                    <option value="repeat-y">Repeat Vertically</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Background Size</label>
                  <select value={themeForm.bgSize || 'auto'} onChange={e => setThemeForm({ ...themeForm, bgSize: e.target.value })}>
                    <option value="auto">Auto (original size)</option>
                    <option value="cover">Cover (full screen)</option>
                    <option value="contain">Contain</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                {themeColorInput('Background', 'bgPrimary')}
                {themeColorInput('Background 2', 'bgSecondary')}
                {themeColorInput('Card BG', 'bgCard')}
                {themeColorInput('Card Hover', 'bgCardHover')}
                {themeColorInput('Input BG', 'bgInput')}
              </div>
              <div className="form-row">
                {themeColorInput('Border', 'borderColor')}
                {themeColorInput('Border Hover', 'borderHover')}
              </div>
              <div className="form-row">
                {themeColorInput('Text Primary', 'textPrimary')}
                {themeColorInput('Text Secondary', 'textSecondary')}
                {themeColorInput('Text Muted', 'textMuted')}
              </div>
              <div className="form-row">
                {themeColorInput('Accent', 'accent')}
                {themeColorInput('Accent Light', 'accentLight')}
              </div>
              <div className="form-row">
                {themeColorInput('Success', 'success')}
                {themeColorInput('Warning', 'warning')}
                {themeColorInput('Danger', 'danger')}
                {themeColorInput('Info', 'info')}
              </div>
            </div>

            <div className="theme-section">
              <h3>Typography</h3>
              <div className="form-row">
                <div className="form-group"><label>Body Font</label>
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
                <div className="form-group"><label>Heading Font</label>
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
                <div className="form-group"><label>Border Radius (px)</label>
                  <input type="number" min="0" max="50" value={themeForm.borderRadius} onChange={e => setThemeForm({ ...themeForm, borderRadius: parseInt(e.target.value) || 12 })} />
                </div>
              </div>
            </div>

            <div className="theme-section">
              <h3>Hero Section</h3>
              <div className="form-row">
                <div className="form-group"><label>Hero Title</label><input value={themeForm.heroTitle || ''} onChange={e => setThemeForm({ ...themeForm, heroTitle: e.target.value })} /></div>
                <div className="form-group"><label>Hero Subtitle</label><input value={themeForm.heroSubtitle || ''} onChange={e => setThemeForm({ ...themeForm, heroSubtitle: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Hero Background</label>
                <div className="input-with-upload"><input value={themeForm.heroBg || ''} onChange={e => setThemeForm({ ...themeForm, heroBg: e.target.value })} placeholder="https://example.com/hero-bg.jpg" /><FileUpload onUpload={(url) => setThemeForm({ ...themeForm, heroBg: url })} /></div>
                {themeForm.heroBg && <img src={themeForm.heroBg} alt="hero preview" className="upload-preview" />}
              </div>
            </div>

            <div className="theme-section">
              <h3>Extra</h3>
              <div className="form-group"><label>Footer Text</label><input value={themeForm.footerText || ''} onChange={e => setThemeForm({ ...themeForm, footerText: e.target.value })} placeholder="Custom footer text" /></div>
              <div className="form-group"><label>Custom CSS</label>
                <textarea rows="6" value={themeForm.customCss || ''} onChange={e => setThemeForm({ ...themeForm, customCss: e.target.value })} placeholder="/* your custom CSS here */" style={{ fontFamily: 'monospace', fontSize: '13px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn-primary" onClick={handleThemeSave} disabled={themeSaving} style={{ padding: '12px 32px', fontSize: '16px' }}>
                {themeSaving ? 'Saving...' : 'Save Theme'}
              </button>
              <button className="btn-secondary" onClick={() => { setThemeForm(currentTheme); toast('Changes reverted'); }} style={{ padding: '12px 24px' }}>
                Cancel
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
        />
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSave, api }) {
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
        toast.success('Coupon updated');
      } else {
        const { data } = await api.post('/admin/coupons', payload);
        onSave(data.coupon);
        toast.success('Coupon created');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{coupon ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Code</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" required style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{form.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}</label>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Min Order ($)</label>
              <input type="number" step="0.01" value={form.minAmount} onChange={e => setForm({ ...form, minAmount: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Max Uses (0 = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Categories (comma separated, leave empty for all)</label>
            <input value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} placeholder="mlo, maps, interior" />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      </div>
    </div>
  );
}

function UserRow({ user, onRoleChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="admin-row-wrap">
      <div className="admin-row">
        <div className="admin-row-info" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          <img src={user.discordAvatar || `https://ui-avatars.com/api/?name=${user.username}&background=6c5ce7&color=fff`} alt="" className="admin-avatar" />
          <div>
            <strong>{user.username}</strong>
            <span className="admin-sub">{user.email} {user.isVerified ? '✓' : ''} | {user.orders?.length || 0} orders</span>
          </div>
        </div>
        <select value={user.role} onChange={(e) => onRoleChange(user._id, e.target.value)} onClick={e => e.stopPropagation()}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <span className="admin-date">{new Date(user.createdAt).toLocaleDateString()}</span>
        <div className="admin-actions">
          <button onClick={(e) => { e.stopPropagation(); onDelete(user._id); }} className="danger" title="Delete user"><FiUserX /></button>
        </div>
      </div>
      {expanded && user.orders?.length > 0 && (
        <div className="user-orders">
          {user.orders.map(order => (
            <div key={order._id} className="user-order">
              <div className="user-order-header">
                <span className="admin-sub">Order #{order._id.toString().slice(-8).toUpperCase()}</span>
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
        <div className="user-orders-empty">No purchases yet</div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, api }) {
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
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
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
        toast.success('Product updated');
      } else {
        const { data } = await api.post('/admin/products', payload);
        onSave(data.product);
        toast.success('Product created');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'New Product'}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Sale Price ($)</label>
              <input type="number" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
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
            <label>Description</label>
            <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Short Description</label>
            <textarea rows="2" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Thumbnail (main image)</label>
            <div className="input-with-upload"><input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="URL or upload" /><label className="file-upload-btn"><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'thumbnail')} hidden />{uploading ? '...' : 'Upload'}</label></div>
            {form.thumbnail && <div className="image-preview-single"><img src={form.thumbnail} alt="thumbnail" /><button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} className="img-del-btn"><FiX /></button></div>}
          </div>

          <div className="form-group">
            <label>Gallery Images ({form.images.length})</label>
            <div className="input-with-upload"><input disabled placeholder="Extra product images" /><label className="file-upload-btn"><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'gallery')} hidden />{uploading ? '...' : 'Add Image'}</label></div>
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
            <label>Features (one per line)</label>
            <textarea rows="3" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea rows="3" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} />
              In Stock
            </label>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
