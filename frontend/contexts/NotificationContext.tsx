import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api, notificationAPI } from '../services/api';
import { io } from 'socket.io-client';

interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationAPI.getAll();
      // Map _id to id for consistency
      const mappedNotifications = data.map((notif: any) => ({
        ...notif,
        id: notif._id || notif.id
      }));
      console.log('📥 Fetched notifications:', mappedNotifications);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationAPI.getUnreadCount();
      const count = response.unreadCount || 0;
      console.log('📊 Unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  const addNotification = useCallback((notification: Notification) => {
    const newNotif = {
      ...notification,
      id: notification._id || notification.id
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (!newNotif.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationAPI.delete(notificationId);
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Set up socket.io connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socketUrl = process.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('📢 Notification socket connected');
      // Notify server of user connection
      socket.emit('user_connect', user.id);
      // Subscribe to this user's notifications
      socket.emit('subscribe_notifications', user.id);
    });

    socket.on('new_notification', (notification: any) => {
      console.log('🔔 New notification received:', notification);
      addNotification({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    });

    socket.on('disconnect', () => {
      console.log('📢 Notification socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id, addNotification]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
