import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBook, FaClock, FaUser } from "react-icons/fa";

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex items-center gap-4 border-l-4 ${color}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const pieData = [
    { name: 'Pending', value: data?.statusCounts?.Pending || 0 },
    { name: 'In-Progress', value: data?.statusCounts?.['In-Progress'] || 0 },
    { name: 'Completed', value: data?.statusCounts?.Completed || 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={data?.totalUsers || 0} icon={<FaUser />} color="border-indigo-500" />
        <StatCard title="Total Projects" value={data?.totalProjects || 0} icon={<FaBook />} color="border-yellow-500" />
        <StatCard title="Ending Soon" value={data?.endingSoon?.length || 0} icon={<FaClock />} color="border-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Project Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Recent Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-2">Title</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentProjects?.map((p) => (
                <tr key={p._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="py-3 font-medium">{p.title}</td>
                  <td className="py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ending Soon */}
      {data?.endingSoon?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4 text-red-700 dark:text-red-400">⚠️ Projects Ending Soon</h2>
          <div className="space-y-2">
            {data.endingSoon.map((p) => (
              <div key={p._id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3">
                <span className="font-medium">{p.title}</span>
                <span className="text-red-600 text-sm">Due: {new Date(p.endDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'In-Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>
  );
};

export default Dashboard;
