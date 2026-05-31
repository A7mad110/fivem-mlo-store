import React, { useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function DiscordSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const temp = params.get('temp');
    if (!temp) { window.location.href = '/login'; return; }
    axios.post(`${API}/auth/discord/exchange`, { temp })
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      })
      .catch(() => { window.location.href = '/login'; });
  }, []);

  return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Authenticating with Discord...</p>
    </div>
  );
}
