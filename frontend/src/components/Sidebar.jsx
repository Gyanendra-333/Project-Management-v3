import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdFolder, MdHistory, MdPeople, MdPerson } from "react-icons/md";

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: <MdDashboard />, adminOnly: true },
    { to: '/projects', label: 'Projects', icon: <MdFolder /> },
    { to: '/users', label: 'Users', icon: <MdPeople />, adminOnly: true },
    { to: '/activity', label: 'Activity Log', icon: <MdHistory />, adminOnly: true },
    { to: '/profile', label: 'Profile', icon: <MdPerson /> },
  ];

  const visible = links.filter((l) => !l.adminOnly || user?.role === 'admin');

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-md flex flex-col py-6 px-4 gap-2">
      {visible.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
