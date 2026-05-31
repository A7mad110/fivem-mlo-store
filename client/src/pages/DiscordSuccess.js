import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DiscordSuccess() {
  const [searchParams] = useSearchParams();
  const { fetchUser, setAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setAuthToken(t);
      fetchUser().then((ok) => {
        navigate(ok ? '/dashboard' : '/login', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, setAuthToken, fetchUser, navigate]);

  return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Authenticating with Discord...</p>
    </div>
  );
}
