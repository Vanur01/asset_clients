// context/ReportContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContexts';
import axios from 'axios';

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

const getApiClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const ReportProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const abortControllerRef = useRef(null);

  const cancelPreviousRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  };

  // Helper to check role access
  const hasAccess = useCallback((allowedRoles) => {
    return allowedRoles.includes(user?.role) || 
           (user?.role === 'super_admin' && allowedRoles.includes('super_admin')) ||
           (user?.role === 'superadmin' && allowedRoles.includes('super_admin'));
  }, [user]);

  // ==================== CLIENT REPORTS ====================
  
  const getClientReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.membershipPlan) params.append('membershipPlan', filters.membershipPlan);
      if (filters.status) params.append('status', filters.status);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/clients?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch client report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== ASSET REPORTS (Admin Only) ====================
  
  const getAssetReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) params.append('condition', filters.condition);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/assets?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch asset report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== TEAM PERFORMANCE REPORTS (Admin Only) ====================
  
  const getTeamReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.teamRole) params.append('teamRole', filters.teamRole);
      if (filters.status) params.append('status', filters.status);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/team?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch team report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== INSPECTION REPORTS ====================
  
  const getInspectionReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.checklistId) params.append('checklistId', filters.checklistId);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/inspections?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch inspection report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== FINANCIAL REPORTS ====================
  
  const getFinancialReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/financial?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch financial report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== COMPLIANCE REPORTS (Admin Only) ====================
  
  const getComplianceReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/compliance?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch compliance report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== CUSTOM REPORTS ====================
  
  const getCustomReport = useCallback(async (config) => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const response = await api.post('/reports/custom', config, {
        signal: abortControllerRef.current.signal,
        ...(config.format !== 'json' && config.format && { responseType: 'blob' })
      });

      if (config.format !== 'json' && config.format) {
        return response.data;
      }

      if (response.data.success) {
        setReportData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to generate custom report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // ==================== ANALYTICS ====================
  
  const getDashboardAnalytics = useCallback(async (dateRange = 30, startDate = null, endDate = null) => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/reports/analytics/dashboard?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      if (response.data.success) {
        setAnalyticsData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch analytics');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  const getKPISummary = useCallback(async () => {
    if (!isAuthenticated || !token) return null;

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const response = await api.get('/reports/analytics/kpi', {
        signal: abortControllerRef.current.signal
      });

      if (response.data.success) {
        setKpiData(response.data);
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch KPI summary');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // ==================== BULK OPERATIONS ====================
  
  const exportBulkReports = useCallback(async (reportTypes, dateRange, format = 'excel') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    setExporting(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const response = await api.post('/reports/export/bulk', {
        reportTypes,
        dateRange,
        format
      }, {
        responseType: 'blob'
      });

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setExporting(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  const scheduleReport = useCallback(async (reportType, schedule, recipients, format = 'excel') => {
    if (!isAuthenticated || !token) return null;
    if (!hasAccess(['super_admin', 'admin'])) return null;

    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const response = await api.post('/reports/schedule', {
        reportType,
        schedule,
        recipients,
        format
      });

      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to schedule report');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasAccess]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const value = {
    // State
    loading,
    exporting,
    error,
    reportData,
    analyticsData,
    kpiData,
    // Client Reports
    getClientReport,
    // Asset Reports (Admin only)
    getAssetReport,
    // Team Reports (Admin only)
    getTeamReport,
    // Inspection Reports
    getInspectionReport,
    // Financial Reports
    getFinancialReport,
    // Compliance Reports (Admin only)
    getComplianceReport,
    // Custom Reports
    getCustomReport,
    // Analytics
    getDashboardAnalytics,
    getKPISummary,
    // Bulk Operations
    exportBulkReports,
    scheduleReport,
    // Utilities
    clearError,
    cleanup,
    hasAccess: () => hasAccess(['super_admin', 'admin'])
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};