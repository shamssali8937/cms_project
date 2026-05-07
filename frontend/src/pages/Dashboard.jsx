import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:4321/api/v1';

    axios.get(`${backendUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData(response.data.data);
      })
      .catch((err) => {
        console.error('Failed to fetch user data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }
        setError('Unable to load user information. Please sign in again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-300/40 text-slate-700">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-8 shadow-lg shadow-slate-300/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Account</h2>
              <p className="text-sm text-slate-600">User ID</p>
              <p className="mt-2 font-medium text-slate-900 break-all">{userData?.id}</p>
              <p className="mt-4 text-sm text-slate-600">Email</p>
              <p className="mt-2 font-medium text-slate-900">{userData?.email}</p>
              <p className="mt-4 text-sm text-slate-600">Display Name</p>
              <p className="mt-2 font-medium text-slate-900">{userData?.displayName}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
              </div>
              <div className="mt-4 space-y-3">
                {userData?.roles?.length ? (
                  userData.roles.map((role) => (
                    <div key={role.name} className="rounded-2xl bg-cyan-50 px-4 py-3 text-slate-900">
                      <p className="text-sm font-semibold">{role.label || role.name}</p>
                      <p className="text-xs text-slate-500">{role.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No roles assigned.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
