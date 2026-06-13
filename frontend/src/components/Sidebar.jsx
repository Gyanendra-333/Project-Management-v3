import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdFolder, MdHistory, MdPeople, MdPerson, MdClose } from "react-icons/md";

const Sidebar = ({ isOpen, onClose }) => {
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
    <aside className={`
      fixed md:static top-0 left-0 h-full md:h-auto z-30
      w-64 min-h-screen bg-white dark:bg-gray-800 shadow-md
      flex flex-col py-6 px-4 gap-2
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      {/* Close button - only mobile */}
      <button
        onClick={onClose}
        className="md:hidden self-end p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
      >
        <MdClose size={20} />
      </button>

      {visible.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          onClick={onClose}
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