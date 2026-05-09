import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import SidePanel from '../components/SidePanel';
import NotificationAlert from '../components/NotificationAlert';


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
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  // Store content as a plain string for the textarea
  const [formData, setFormData] = useState({ title: '', contentString: '', excerpt: '', status: 'draft' });
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4321/api/v1';

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

  const handleCreatePost = () => {
    setFormData({ title: '', contentString: '', excerpt: '', status: 'draft' });
    setEditingPost(null);
    setIsCreating(true);
  };
  const stringToContentJson = (text) => {
  if (!text || text.trim() === '') return { blocks: [] };
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const blocks = lines.map(line => ({
    type: 'paragraph',
    data: { text: line }
  }));
  return { blocks };
};

const contentJsonToString = (contentObj) => {
  // If it's a string, try to parse it
  if (typeof contentObj === 'string') {
    try {
      contentObj = JSON.parse(contentObj);
    } catch (e) {
      return contentObj; // fallback to raw string
    }
  }
  if (!contentObj || !contentObj.blocks || !Array.isArray(contentObj.blocks)) return '';
  return contentObj.blocks.map(block => block.data?.text || '').join('\n');
};


  const handleEditPost = (post) => {
    setFormData({
      title: post.title || '',
      contentString: contentJsonToString(post.content),
      excerpt: post.excerpt || '',
      status: post.status || 'draft'
    });
    setEditingPost(post);
    setIsCreating(true);
  };

  const handleSavePost = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Convert the textarea content to the JSON structure expected by the API
    const payload = {
      title: formData.title,
      content: stringToContentJson(formData.contentString),
      excerpt: formData.excerpt,
      status: formData.status
    };

    try {
      if (editingPost) {
        await axios.patch(`${backendUrl}/posts/${editingPost.cuid}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification({ open: true, message: 'Post updated successfully!', type: 'success' });
      } else {
        await axios.post(`${backendUrl}/posts`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification({ open: true, message: 'Post created successfully!', type: 'success' });
      }
      // Reload posts
      const postsResponse = await axios.get(`${backendUrl}/posts?limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(postsResponse.data.data || []);
      setIsCreating(false);
      setEditingPost(null);
    } catch (err) {
      console.error('Failed to save post:', err);
      const message = err.response?.data?.errors?.[0]?.title || 'Failed to save post.';
      setNotification({ open: true, message, type: 'error' });
    }
  };

  const handleDeletePost = async (cuid) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${backendUrl}/posts/${cuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification({ open: true, message: 'Post deleted successfully!', type: 'success' });
      // Reload posts
      const postsResponse = await axios.get(`${backendUrl}/posts?limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(postsResponse.data.data || []);
      if (selectedCuid === cuid) {
        setSelectedCuid(null);
        setRevisions([]);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      setNotification({ open: true, message: 'Failed to delete post.', type: 'error' });
    }
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
          ) : isCreating ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSavePost(); }} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Content</label>
                  <textarea
                    value={formData.contentString}
                    onChange={(e) => setFormData({ ...formData, contentString: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    rows="10"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500">Each line will become a paragraph block.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-700 hover:to-sky-700"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </form>
            </section>
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
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreatePost}
                      className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                    >
                      Create Post
                    </button>
                    <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Active section: <span className="font-semibold text-slate-900">{activeSection}</span>
                    </div>
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
                    <div className="flex gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                        {selectedPost?.status || 'empty'}
                      </span>
                      {selectedPost && (
                        <>
                          <button
                            onClick={() => handleEditPost(selectedPost)}
                            className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(selectedPost.cuid)}
                            className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
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
                      <div>
                        <p className="text-sm text-slate-500">Content preview</p>
                        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700 whitespace-pre-wrap">
                          {contentJsonToString(selectedPost.content) || 'No content provided.'}
                        </div>
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
                          <p className="mt-3 text-sm text-slate-700 overflow-hidden">
                            {revision.excerpt || contentJsonToString(revision.content) || 'No revision details available.'}
                          </p>
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
      <NotificationAlert
        open={notification.open}
        message={notification.message}
        severity={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </div>
  );
};

export default Dashboard;