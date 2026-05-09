import React from 'react';

const SidePanel = ({
  userData,
  posts,
  revisions,
  selectedCuid,
  activeSection,
  onSelectSection,
  onSelectPost,
  isOpen,
  onClose,
  onLogout,
}) => {
  const postCounts = {
    total: posts.length,
    published: posts.filter((post) => post.status === 'published').length,
    draft: posts.filter((post) => post.status === 'draft').length,
  };

  return (
    <>
      <style>
        {`
          .sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-black bg-opacity-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 sm:w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={onClose}
      >
        <div className="sidebar-scroll flex h-full flex-col overflow-y-auto">
          <div className="mb-6 rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600">Navigation</p>
            <nav className="mt-4 space-y-2">
              {[
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'posts', label: 'Posts' },
                { key: 'revisions', label: 'Revisions' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent closing sidebar
                    onSelectSection(item.key);
                  }}
                  className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === item.key
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">User overview</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{userData?.displayName || userData?.email || 'Anonymous'}</p>
              <p className="text-sm text-slate-600">{userData?.email || 'No email available'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {userData?.roles?.length ? (
                  userData.roles.map((role) => (
                    <span key={role.name} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">
                      {role.label || role.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">No roles</span>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Post summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span>Total posts</span>
                  <strong>{postCounts.total}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span>Published</span>
                  <strong>{postCounts.published}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span>Draft</span>
                  <strong>{postCounts.draft}</strong>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Recent posts</p>
                <span className="text-xs text-slate-400">Tap to view</span>
              </div>

              <div className="mt-4 space-y-2">
                {posts.length ? (
                  posts.slice(0, 5).map((post) => (
                    <button
                      key={post.cuid}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPost(post.cuid);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selectedCuid === post.cuid
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-semibold truncate">{post.title || 'Untitled post'}</p>
                      <p className="text-xs text-slate-500">{post.status || 'unknown'}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No posts found yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Revision details</p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-slate-500">Loaded revisions</span>
                  <strong className="mt-1 block text-lg text-slate-900">{revisions?.length ?? 0}</strong>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-slate-500">Selected post</span>
                  <strong className="mt-1 block text-slate-900">{posts.find((post) => post.cuid === selectedCuid)?.title || 'None selected'}</strong>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-auto px-4 pb-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogout?.();
              }}
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidePanel;
