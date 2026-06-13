import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In-Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status]}`}>{status}</span>;
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(({ data }) => {
        setProject(data.project);
        setNewStatus(data.project.status);
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/projects/${id}/status`, { status: newStatus });
      setProject(data.project);
      toast.success('Status updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!project) return <div className="text-center py-16 text-gray-400">Project not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">← Back</button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{project.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Start Date</p>
            <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">End Date</p>
            <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Assigned Users */}
        {project.assignedUsers?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-gray-600 dark:text-gray-400">ASSIGNED USERS</h3>
            <div className="flex flex-wrap gap-2">
              {project.assignedUsers.map((u) => (
                <span key={u._id} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {project.attachments?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-gray-600 dark:text-gray-400">ATTACHMENTS</h3>
            <div className="space-y-2">
              {project.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url || a.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <span>📎</span>
                  <span className="text-sm truncate">{a.originalName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{(a.size / 1024).toFixed(1)} KB</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold mb-3">Update Status</h3>
          <div className="flex gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Pending</option>
              <option>In-Progress</option>
              <option>Completed</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === project.status}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="mt-4 w-full py-2 border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900 transition text-sm font-medium"
          >
            Edit Project
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
