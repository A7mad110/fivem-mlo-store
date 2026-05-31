import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Setup() {
  const { user, api, setUser } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [message, setMessage] = useState(null);
  const [emailForm, setEmailForm] = useState({ host: '', port: '587', user: 'alriyadh1city@gmail.com', pass: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const { data } = await api.post('/setup/verify-email');
      if (data.user) setUser(data.user);
      setMessage({ type: 'success', text: data.message });
      toast.success(data.message);
    } catch (err) {
      const text = err.response?.data?.message || 'Failed';
      setMessage({ type: 'error', text });
      toast.error(text);
    }
    setVerifying(false);
  };

  const handleMakeAdmin = async () => {
    setMakingAdmin(true);
    setMessage(null);
    try {
      const { data } = await api.post('/setup/first-admin');
      if (data.user) setUser(data.user);
      setMessage({ type: 'success', text: data.message + ' You can now access the admin panel.' });
      toast.success(data.message);
    } catch (err) {
      const text = err.response?.data?.message || 'Failed';
      setMessage({ type: 'error', text });
      toast.error(text);
    }
    setMakingAdmin(false);
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    setMessage(null);
    try {
      const { data } = await api.post('/setup/email-config', emailForm);
      setMessage({ type: 'success', text: data.message });
      toast.success(data.message);
    } catch (err) {
      const text = err.response?.data?.message || 'Failed';
      setMessage({ type: 'error', text });
      toast.error(text);
    }
    setSavingEmail(false);
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setMessage(null);
    try {
      const { data } = await api.post('/setup/test-email');
      setMessage({ type: 'success', text: data.message });
      toast.success(data.message);
    } catch (err) {
      const text = err.response?.data?.message || 'Failed';
      setMessage({ type: 'error', text });
      toast.error(text);
    }
    setTestingEmail(false);
  };

  return (
    <div className="setup-page">
      <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️ Setup</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Use these buttons if you're having trouble with email verification or need to set up the first admin account.
        </p>

        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
            background: message.type === 'success' ? '#065f46' : '#7f1d1d',
            color: '#fff', border: `1px solid ${message.type === 'success' ? '#059669' : '#dc2626'}`,
          }}>
            {message.text}
          </div>
        )}

        <div className="setup-card" style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid var(--border)' }}>
          <h3>Verify Email</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 16px' }}>
            {user?.isVerified
              ? '✓ Your email is already verified!'
              : 'If the verification email didn\'t arrive, click here to verify your email directly.'}
          </p>
          {!user?.isVerified && (
            <button className="btn-primary" onClick={handleVerify} disabled={verifying}>
              {verifying ? 'Verifying...' : 'Verify My Email'}
            </button>
          )}
        </div>

        <div className="setup-card" style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' }}>
          <h3>Become Admin</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 16px' }}>
            {user?.role === 'admin'
              ? '✓ You are already an admin! Log out and log back in to see the Admin link.'
              : 'If no admin account exists yet, click here to make your account an admin.'}
          </p>
          {user?.role !== 'admin' && (
            <button className="btn-primary" onClick={handleMakeAdmin} disabled={makingAdmin}>
              {makingAdmin ? 'Processing...' : 'Make Me Admin'}
            </button>
          )}
        </div>

        {user?.role === 'admin' && (
          <div className="setup-card" style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '24px', marginTop: '16px', border: '1px solid var(--border)' }}>
            <h3>SendGrid Email Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 16px' }}>
              Paste your SendGrid API Key and enter the verified sender email.
            </p>
            <form onSubmit={handleSaveEmail} className="modal-form">
              <div className="form-group">
                <label>Sender Email (verified in SendGrid)</label>
                <input type="email" value={emailForm.user} onChange={e => setEmailForm({ ...emailForm, user: e.target.value })} placeholder="alriyadh1city@gmail.com" required />
              </div>
              <div className="form-group">
                <label>SendGrid API Key</label>
                <input type="password" value={emailForm.pass} onChange={e => setEmailForm({ ...emailForm, pass: e.target.value })} placeholder="SG.xxxxxxxxxxxxxxxx" required />
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={savingEmail}>
                {savingEmail ? 'Saving...' : 'Save Email Settings'}
              </button>
              <button type="button" className="btn-primary btn-full" style={{ marginTop: '8px', background: 'var(--accent-secondary)' }} onClick={handleTestEmail} disabled={testingEmail}>
                {testingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
