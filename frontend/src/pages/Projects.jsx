import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import debounce from '../utils/debounce';

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'In-Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>;
};

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async (s, st, p) => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects', {
        params: { search: s, status: st, page: p, limit: 8 },
      });
      setProjects(data.projects);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce((s, st, p) => fetchProjects(s, st, p), 400), [fetchProjects]);

  useEffect(() => {
    debouncedFetch(search, status, page);
  }, [search, status, page, debouncedFetch]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects(search, status, page);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'admin' && (
          <Link
            to="/projects/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
          >
            + New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">{total} project{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📁</p>
          <p>No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base truncate flex-1 mr-2">{p.title}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{p.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <span>📅 {new Date(p.endDate).toLocaleDateString()}</span>
                <span>·</span>
                <span>👥 {p.assignedUsers?.length || 0} users</span>
                {p.attachments?.length > 0 && <><span>·</span><span>📎 {p.attachments.length}</span></>}
              </div>
              {user?.role === 'admin' && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/projects/${p._id}/edit`)}
                    className="flex-1 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id, p.title)}
                    className="flex-1 py-1.5 text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50 transition text-sm"
          >
            ← Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50 transition text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;
