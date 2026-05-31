import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DiscordSuccess() {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const match = document.cookie.match(/(^| )discord_token=([^;]+)/);
    const t = match ? decodeURIComponent(match[2]) : localStorage.getItem('token');
    if (t) {
      localStorage.setItem('token', t);
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
