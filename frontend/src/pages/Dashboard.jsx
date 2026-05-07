import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import SidePanel from '../components/SidePanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [selectedCuid, setSelectedCuid] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:4321/api/v1';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchRevisions = async (cuid, token) => {
    if (!cuid) {
      setRevisions([]);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/posts/${cuid}/revisions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevisions(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch revisions:', err);
      setRevisions([]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [userResponse, postsResponse] = await Promise.all([
          axios.get(`${backendUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/posts?limit=8`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUserData(userResponse.data.data);
        const returnedPosts = postsResponse.data.data || [];
        setPosts(returnedPosts);

        const firstPostCuid = returnedPosts[0]?.cuid || null;
        setSelectedCuid(firstPostCuid);

        if (firstPostCuid) {
          const revisionsResponse = await axios.get(`${backendUrl}/posts/${firstPostCuid}/revisions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRevisions(revisionsResponse.data.data || []);
        }
      } catch (err) {
        console.error('Dashboard load failed:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }
        setError('Unable to load dashboard data. Please refresh or login again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, backendUrl]);

  const selectedPost = useMemo(
    () => posts.find((post) => post.cuid === selectedCuid) || null,
    [posts, selectedCuid]
  );

  const handleSelectPost = async (cuid) => {
    setSelectedCuid(cuid);
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    await fetchRevisions(cuid, token);
    setActiveSection('posts');
  };

  const stats = useMemo(
    () => ({
      totalPosts: posts.length,
      revisionsLoaded: revisions.length,
      rolesCount: userData?.roles?.length || 0,
    }),
    [posts.length, revisions.length, userData]
  );

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-16">
      <TopBar title="Dashboard" subtitle="Manage users, posts and revisions" onLogout={handleLogout} onToggleSidebar={toggleSidebar} />

      <div className="mx-auto flex max-w-[1400px] px-4 py-6 sm:px-6">
        <SidePanel
          userData={userData}
          posts={posts}
          revisions={revisions}
          selectedCuid={selectedCuid}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onSelectPost={handleSelectPost}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onLogout={handleLogout}
        />

        <main className={`flex-1 space-y-6 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          ) : (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Quick overview</p>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                      Welcome back, {userData?.displayName || userData?.email || 'user'}
                    </h1>
                  </div>
                  <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Active section: <span className="font-semibold text-slate-900">{activeSection}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Posts loaded</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.totalPosts}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Revisions loaded</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.revisionsLoaded}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Assigned roles</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.rolesCount}</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Selected post</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-900">{selectedPost?.title || 'No post selected'}</h2>
                    </div>
                    <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                      {selectedPost?.status || 'empty'}
                    </span>
                  </div>

                  {selectedPost ? (
                    <div className="mt-6 space-y-4 text-slate-700">
                      <div>
                        <p className="text-sm text-slate-500">Post ID</p>
                        <p className="mt-2 font-medium break-all text-slate-900">{selectedPost.cuid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Excerpt</p>
                        <p className="mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                          {selectedPost.excerpt || 'No excerpt available.'}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Created</p>
                          <p className="mt-2 font-medium text-slate-900">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Updated</p>
                          <p className="mt-2 font-medium text-slate-900">{new Date(selectedPost.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                      Select a post from the side panel to view its details and revision history.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Revision feed</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">Latest revisions</p>
                  </div>

                  {revisions.length ? (
                    <div className="mt-5 space-y-3">
                      {revisions.slice(0, 5).map((revision) => (
                        <div key={revision.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">{revision.changeSummary || 'Revision saved'}</p>
                          <p className="mt-2 text-xs text-slate-500">{new Date(revision.createdAt).toLocaleString()}</p>
                          <p className="mt-3 text-sm text-slate-700 overflow-hidden">{revision.excerpt || revision.content || 'No revision details available.'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">No revisions available for the selected post.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
