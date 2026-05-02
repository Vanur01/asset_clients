// context/DashboardContext.js - Optimized with Error Handling
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContexts';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

// Create API client with interceptors
const createApiClient = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    withCredentials: true,
    timeout: 15000, // 15 second timeout
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const DashboardProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const abortControllerRef = useRef(null);
  const isMounted = useRef(true);
  const retryTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cancelPreviousRequest();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Cancel previous requests
  const cancelPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // Safe state setter
  const safeSetState = useCallback((setter, value) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  // Generic fetch function with retry logic
  const fetchWithRetry = useCallback(async (fetchFn, maxRetries = 2) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fetchFn();
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries && error.response?.status >= 500) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          break;
        }
      }
    }
    throw lastError;
  }, []);

  // Fetch Super Admin Dashboard
  const fetchSuperAdminDashboard = useCallback(async (filters = {}) => {
    if (!isAuthenticated || !token || !user?.role?.includes('super_admin')) {
      return null;
    }

    cancelPreviousRequest();
    safeSetState(setError, null);

    try {
      const api = createApiClient(token);
      const params = new URLSearchParams();
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetchWithRetry(() =>
        api.get(`/dashboard/super-admin?${params.toString()}`, {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        const data = response.data;
        safeSetState(setDashboardData, data);
        return data;
      }
      throw new Error(response.data?.message || 'Failed to fetch super admin dashboard');
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        console.error('Super admin dashboard error:', errorMessage);
        safeSetState(setError, errorMessage);
      }
      return null;
    }
  }, [isAuthenticated, token, user, fetchWithRetry, cancelPreviousRequest, safeSetState]);

  // Fetch Admin Dashboard
  const fetchAdminDashboard = useCallback(async (filters = {}) => {
    if (!isAuthenticated || !token || user?.role !== 'admin') {
      return null;
    }

    cancelPreviousRequest();
    safeSetState(setError, null);

    try {
      const api = createApiClient(token);
      const params = new URLSearchParams();
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetchWithRetry(() =>
        api.get(`/dashboard/admin?${params.toString()}`, {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        const data = response.data;
        safeSetState(setDashboardData, data);
        return data;
      }
      throw new Error(response.data?.message || 'Failed to fetch admin dashboard');
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        console.error('Admin dashboard error:', errorMessage);
        safeSetState(setError, errorMessage);
      }
      return null;
    }
  }, [isAuthenticated, token, user, fetchWithRetry, cancelPreviousRequest, safeSetState]);

  // Fetch Team Dashboard
  const fetchTeamDashboard = useCallback(async () => {
    if (!isAuthenticated || !token || user?.role !== 'team') {
      return null;
    }

    cancelPreviousRequest();
    safeSetState(setError, null);

    try {
      const api = createApiClient(token);
      const response = await fetchWithRetry(() =>
        api.get('/dashboard/team', {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        const data = response.data;
        safeSetState(setDashboardData, data);
        safeSetState(setStatsData, data);
        return data;
      }
      throw new Error(response.data?.message || 'Failed to fetch team dashboard');
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
        console.error('Team dashboard error:', errorMessage);
        safeSetState(setError, errorMessage);
      }
      return null;
    }
  }, [isAuthenticated, token, user, fetchWithRetry, cancelPreviousRequest, safeSetState]);

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    if (!isAuthenticated || !token) return null;

    try {
      const api = createApiClient(token);
      const response = await fetchWithRetry(() =>
        api.get('/dashboard/stats', {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        safeSetState(setStatsData, response.data);
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch stats');
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Fetch stats error:', err);
      }
      return null;
    }
  }, [isAuthenticated, token, fetchWithRetry, safeSetState]);

  // Fetch Chart Data
  const fetchChartData = useCallback(async (chartType = null) => {
    if (!isAuthenticated || !token || user?.role === 'team') return null;

    try {
      const api = createApiClient(token);
      const url = chartType ? `/dashboard/charts?chartType=${chartType}` : '/dashboard/charts';
      const response = await fetchWithRetry(() =>
        api.get(url, {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        safeSetState(setChartData, response.data);
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch chart data');
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Fetch chart data error:', err);
      }
      return null;
    }
  }, [isAuthenticated, token, user, fetchWithRetry, safeSetState]);

  // Fetch Recent Activities
  const fetchRecentActivities = useCallback(async (limit = 10) => {
    if (!isAuthenticated || !token) return [];

    try {
      const api = createApiClient(token);
      const response = await fetchWithRetry(() =>
        api.get(`/dashboard/activities?limit=${limit}`, {
          signal: abortControllerRef.current?.signal
        })
      );

      if (response.data?.success) {
        const activitiesList = Object.keys(response.data)
          .filter(key => !isNaN(parseInt(key)))
          .map(key => response.data[key]);
        safeSetState(setActivities, activitiesList);
        return activitiesList;
      }
      // Return empty array for empty response instead of throwing
      safeSetState(setActivities, []);
      return [];
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Fetch activities error:', err);
        safeSetState(setActivities, []);
      }
      return [];
    }
  }, [isAuthenticated, token, fetchWithRetry, safeSetState]);

  // Export Dashboard Report
  const exportDashboardReport = useCallback(async () => {
    if (!isAuthenticated || !token) {
      throw new Error('Not authenticated');
    }

    try {
      const api = createApiClient(token);
      const response = await api.get('/dashboard/export', {
        responseType: 'blob',
        signal: abortControllerRef.current?.signal
      });

      if (!response.data) {
        throw new Error('No data received from export');
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to export dashboard';
      console.error('Export dashboard error:', errorMessage);
      safeSetState(setError, errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, token, safeSetState]);

  // Load dashboard based on user role
  const loadDashboard = useCallback(async (filters = {}) => {
    if (!isAuthenticated || !token) {
      return;
    }

    safeSetState(setLoading, true);
    safeSetState(setError, null);
    
    try {
      const userRole = user?.role;
      
      // Fetch data in parallel
      const dashboardPromise = (() => {
        if (userRole?.includes('super_admin')) return fetchSuperAdminDashboard(filters);
        if (userRole === 'admin') return fetchAdminDashboard(filters);
        if (userRole === 'team') return fetchTeamDashboard();
        return Promise.resolve(null);
      })();

      const [dashboardResult, statsResult, activitiesResult] = await Promise.allSettled([
        dashboardPromise,
        fetchDashboardStats(),
        fetchRecentActivities(),
      ]);

      // Handle dashboard result
      if (dashboardResult.status === 'rejected') {
        console.error('Dashboard fetch failed:', dashboardResult.reason);
        safeSetState(setError, 'Failed to load dashboard data');
      }

      // Handle stats result
      if (statsResult.status === 'rejected') {
        console.error('Stats fetch failed:', statsResult.reason);
      }

      // Handle activities result
      if (activitiesResult.status === 'rejected') {
        console.error('Activities fetch failed:', activitiesResult.reason);
      }

      // Fetch chart data for admin/super admin
      if (userRole !== 'team') {
        await fetchChartData();
      }

      safeSetState(setDataLoaded, true);
    } catch (err) {
      console.error('Load dashboard error:', err);
      safeSetState(setError, 'An unexpected error occurred while loading the dashboard');
    } finally {
      safeSetState(setLoading, false);
    }
  }, [
    isAuthenticated,
    token,
    user,
    fetchSuperAdminDashboard,
    fetchAdminDashboard,
    fetchTeamDashboard,
    fetchDashboardStats,
    fetchRecentActivities,
    fetchChartData,
    safeSetState,
  ]);

  // Clear error with auto-retry option
  const clearError = useCallback(() => {
    safeSetState(setError, null);
  }, [safeSetState]);

  const value = {
    dashboardData,
    statsData,
    chartData,
    activities,
    loading,
    error,
    dataLoaded,
    fetchSuperAdminDashboard,
    fetchAdminDashboard,
    fetchTeamDashboard,
    fetchDashboardStats,
    fetchChartData,
    fetchRecentActivities,
    exportDashboardReport,
    loadDashboard,
    clearError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};