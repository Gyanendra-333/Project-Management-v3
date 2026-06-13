import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', status: 'Pending', assignedUsers: [],
  });
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: uData } = await api.get('/users', { params: { limit: 100 } });
        setUsers(uData.users);

        if (isEdit) {
          const { data: pData } = await api.get(`/projects/${id}`);
          const p = pData.project;
          setForm({
            title: p.title,
            description: p.description,
            startDate: p.startDate?.slice(0, 10),
            endDate: p.endDate?.slice(0, 10),
            status: p.status,
            assignedUsers: p.assignedUsers.map((u) => u._id),
          });
          setExistingAttachments(p.attachments || []);
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const toggleUser = (uid) => {
    setForm((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(uid)
        ? prev.assignedUsers.filter((u) => u !== uid)
        : [...prev.assignedUsers, uid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'assignedUsers') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      files.forEach((f) => fd.append('attachments', f));

      if (isEdit) {
        await api.put(`/projects/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project updated!');
      } else {
        await api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Project created!');
      }
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm mb-4 block">← Back</button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold mb-6">{isEdit ? 'Edit Project' : 'Create New Project'}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Pending</option>
              <option>In-Progress</option>
              <option>Completed</option>
            </select>
          </div>

          {/* Assign Users */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Assign Users ({form.assignedUsers.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 border dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700">
              {users.map((u) => (
                <label key={u._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg px-2 py-1">
                  <input
                    type="checkbox"
                    checked={form.assignedUsers.includes(u._id)}
                    onChange={() => toggleUser(u._id)}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-gray-400 capitalize">({u.role})</span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Attachments (max 3)
            </label>
            {existingAttachments.length > 0 && (
              <div className="mb-2 space-y-1">
                {existingAttachments.map((a, i) => (
                  <p key={i} className="text-xs text-gray-500">📎 {a.originalName}</p>
                ))}
              </div>
            )}
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.zip"
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 3 - existingAttachments.length))}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
            />
            <p className="text-xs text-gray-400 mt-1">Max 3 attachments total</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
