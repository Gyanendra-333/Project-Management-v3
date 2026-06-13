import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socketRef.current.emit('join', user._id);

    socketRef.current.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnread((prev) => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const markAllRead = () => setUnread(0);
  const clearNotifications = () => {
    setNotifications([]);
    setUnread(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unread, markAllRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
