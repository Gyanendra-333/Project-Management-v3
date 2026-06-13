import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const entityIcon = { project: '📁', user: '👤', auth: '🔐' };

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/activity', { params: { page, limit: 15, entity } });
        setActivities(data.activities);
        setTotal(data.total);
        setPages(data.pages);
      } catch {
        toast.error('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, entity]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <select
          value={entity}
          onChange={(e) => { setEntity(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="">All</option>
          <option value="project">Projects</option>
          <option value="user">Users</option>
          <option value="auth">Auth</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">{total} activit{total !== 1 ? 'ies' : 'y'}</p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow divide-y dark:divide-gray-700">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>No activity found</p>
          </div>
        ) : (
          activities.map((a) => (
            <div key={a._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <span className="text-2xl">{entityIcon[a.entity] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  by <span className="font-medium">{a.user?.name}</span> · {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${
                a.entity === 'project' ? 'bg-blue-100 text-blue-700' :
                a.entity === 'user' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {a.entity}
              </span>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 disabled:opacity-50 text-sm">← Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm ${p === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 disabled:opacity-50 text-sm">Next →</button>
        </div>
      )}
    </div>
  );
};

export default Activity;
