import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationAlert from '../components/NotificationAlert';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); 

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:4321/api/v1';

    axios.post(`${backendUrl}/auth/login`, { email, password })
      .then(response => {
        const payload = response.data.data;
        if (response.status === 200 && payload?.accessToken) {
          localStorage.setItem('accessToken', payload.accessToken);
          if (payload.refreshToken) {
            localStorage.setItem('refreshToken', payload.refreshToken);
          }
          setNotificationMessage('Login successful!');
          setNotificationType('success');
          setOpenNotification(true);
          setTimeout(() => navigate('/dashboard'), 300);
          return;
        }

        setNotificationMessage('Login successful, but no token received.');
        setNotificationType('warning');
        setOpenNotification(true);
      })
      .catch(error => {
        console.error('Login failed', error);
        const status = error.response?.status;
        const apiErrorTitle = error.response?.data?.errors?.[0]?.title;
        if (status === 429) {
          setNotificationMessage(apiErrorTitle || 'Too many login attempts. Please try again later.');
          setNotificationType('error');
          setOpenNotification(true);
          return;
        }

        setError('Invalid email or password.');
        setNotificationMessage(apiErrorTitle || 'Login failed. Please check your credentials.');
        setNotificationType('error');
        setOpenNotification(true);
      });
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-8 shadow-md shadow-slate-300/40">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Welcome back</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Login</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in with your email and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-700 hover:to-sky-700 cursor-pointer">
              Sign In
            </button>
          </form>
        </div>
      </div>

      <NotificationAlert
        open={openNotification}
        message={notificationMessage}
        onClose={() => setOpenNotification(false)}
        severity={notificationType}
      />
    </>
  );
};

export default LoginPage;
