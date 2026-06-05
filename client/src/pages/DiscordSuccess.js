import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function DiscordSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const cookieToken = document.cookie
      ?.split('; ')
      ?.find(r => r.startsWith('token='))
      ?.split('=')[1];
    const finalToken = token || cookieToken || localStorage.getItem('token');

    if (finalToken) {
      localStorage.setItem('token', finalToken);
      fetchUser().then(() => {
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      }).catch(() => {
        setStatus('error');
      });
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate, fetchUser]);

  return (
    <div className="main-content min-h-screen flex items-center justify-center px-margin-edge">
      <div className="glass-card rounded-3xl p-12 text-center max-w-sm w-full">
        {status === 'loading' ? (
          <div className="loader mx-auto mb-4" />
        ) : status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-accent-electric/20 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} className="text-accent-electric" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Login Successful</h2>
            <p className="text-text-muted mt-2">Redirecting...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <FiXCircle size={32} className="text-error" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Login Failed</h2>
            <p className="text-text-muted mt-2">Could not authenticate with Discord.</p>
            <button onClick={() => navigate('/login')} className="btn-primary-custom mt-6">Try Again</button>
          </>
        )}
      </div>
    </div>
  );
}
