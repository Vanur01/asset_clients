// context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

const API_BASE_URL = "http://localhost:9001/api/v1";

export const NotificationProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const getAuthHeaders = useCallback(() => {
    const currentToken = token || localStorage.getItem("accessToken") || localStorage.getItem("token");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`
      }
    };
  }, [token]);

  const fetchNotifications = useCallback(async (page = 1, limit = 20, unreadOnly = false) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (unreadOnly) params.append("unreadOnly", "true");

      const response = await axios.get(
        `${API_BASE_URL}/notifications/?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        if (page === 1) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications]);
        }
        setUnreadCount(response.data.unreadCount);
        setPagination(response.data.pagination);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread-count`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
        return response.data.unreadCount;
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [isAuthenticated, getAuthHeaders]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        getAuthHeaders()
      );

      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }, [getAuthHeaders]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        getAuthHeaders()
      );

      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      return false;
    }
  }, [getAuthHeaders]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        const deletedNotif = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }, [getAuthHeaders, notifications]);

  const fetchClientNotifications = useCallback(async (filters = {}) => {
    if (!isAuthenticated || user?.role !== "super_admin") return;

    try {
      const params = new URLSearchParams({
        limit: filters.limit || 50,
        ...(filters.type && { type: filters.type }),
        ...(filters.unreadOnly && { unreadOnly: "true" })
      });

      const response = await axios.get(
        `${API_BASE_URL}/notifications/clients?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        return response.data.notifications;
      }
    } catch (error) {
      console.error("Error fetching client notifications:", error);
      return [];
    }
  }, [isAuthenticated, user, getAuthHeaders]);

  const fetchTeamNotifications = useCallback(async (filters = {}) => {
    if (!isAuthenticated || user?.role !== "admin") return;

    try {
      const params = new URLSearchParams({
        limit: filters.limit || 50,
        ...(filters.type && { type: filters.type }),
        ...(filters.unreadOnly && { unreadOnly: "true" })
      });

      const response = await axios.get(
        `${API_BASE_URL}/notifications/team?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        return response.data.notifications;
      }
    } catch (error) {
      console.error("Error fetching team notifications:", error);
      return [];
    }
  }, [isAuthenticated, user, getAuthHeaders]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchClientNotifications,
    fetchTeamNotifications
  }), [
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchClientNotifications,
    fetchTeamNotifications
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};