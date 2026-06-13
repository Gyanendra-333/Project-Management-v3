import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { notifications, unread, markAllRead, clearNotifications } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotifs = () => {
    setShowNotifs((p) => !p);
    if (!showNotifs) markAllRead();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
        ProjectHub
      </Link>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          title="Toggle theme"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifs}
            className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button
                  onClick={clearNotifications}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-6">No notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
          >
            <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <Link
                to="/profile"
                className="block px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                onClick={() => setShowMenu(false)}
              >
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
