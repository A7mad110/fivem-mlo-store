import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DiscordSuccess() {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      fetchUser().then((ok) => {
        navigate(ok ? '/dashboard' : '/login', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [fetchUser, navigate]);

  return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Authenticating with Discord...</p>
    </div>
  );
}
