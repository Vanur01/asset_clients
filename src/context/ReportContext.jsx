// context/ReportContext.js - Updated with Full Role-Based API Integration

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

const API_BASE_URL = "http://localhost:9001/api/v1";

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
  const [initialLoading, setInitialLoading] = useState(false);
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

  // Role check helpers
  const isAdmin = useCallback(() => {
    const role = user?.role;
    return role === 'admin';
  }, [user]);

  const isSuperAdmin = useCallback(() => {
    const role = user?.role;
    return role === 'super_admin' || role === 'superadmin';
  }, [user]);

  // Check if user has access to specific report type
  const hasReportAccess = useCallback((reportType) => {
    if (isSuperAdmin()) {
      const superAdminAccess = ['clients', 'assets', 'team', 'checklists', 'assignments', 'inspections', 'revenue', 'compliance'];
      return superAdminAccess.includes(reportType);
    }
    if (isAdmin()) {
      const adminAccess = ['assets', 'team', 'checklists', 'assignments', 'inspections', 'compliance'];
      return adminAccess.includes(reportType);
    }
    // Team member access
    return ['inspections', 'compliance'].includes(reportType);
  }, [isAdmin, isSuperAdmin]);

  // ==================== CLIENT REPORTS (Super Admin only) ====================
  const getClientReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    
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

      // Handle response structure: { success, message, generatedAt, reportType, filters, summary, data, totalRecords }
      if (response.data.success !== false) {
        // Transform to consistent format
        const transformedData = {
          success: true,
          message: response.data.message || 'Client report generated',
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
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
  }, [isAuthenticated, token]);

  // ==================== ASSET REPORTS ====================
  const getAssetReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('assets')) {
      setError('You do not have permission to access asset reports');
      return null;
    }

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

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
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
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== TEAM PERFORMANCE REPORTS ====================
  const getTeamReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('team')) {
      setError('You do not have permission to access team reports');
      return null;
    }

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

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
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
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== CHECKLIST REPORTS ====================
  const getChecklistReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('checklists')) {
      setError('You do not have permission to access checklist reports');
      return null;
    }

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/checklists?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
      }
      throw new Error(response.data.message || 'Failed to fetch checklist report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== ASSIGNMENT REPORTS ====================
  const getAssignmentReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('assignments')) {
      setError('You do not have permission to access assignment reports');
      return null;
    }

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/assignments?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
      }
      throw new Error(response.data.message || 'Failed to fetch assignment report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== INSPECTION REPORTS ====================
  const getInspectionReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('inspections')) {
      setError('You do not have permission to access inspection reports');
      return null;
    }

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

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
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
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== REVENUE REPORTS (Super Admin only) ====================
  const getRevenueReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!isSuperAdmin()) {
      setError('Revenue reports are only available to super administrators');
      return null;
    }

    cancelPreviousRequest();
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient(token);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (format !== 'json') params.append('format', format);

      const response = await api.get(`/reports/revenue?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        ...(format !== 'json' && { responseType: 'blob' })
      });

      if (format !== 'json') {
        return response.data;
      }

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
      }
      throw new Error(response.data.message || 'Failed to fetch revenue report');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isSuperAdmin]);

  // ==================== COMPLIANCE REPORTS ====================
  const getComplianceReport = useCallback(async (filters = {}, format = 'json') => {
    if (!isAuthenticated || !token) return null;
    if (!hasReportAccess('compliance')) {
      setError('You do not have permission to access compliance reports');
      return null;
    }

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

      if (response.data.success !== false) {
        const transformedData = {
          success: true,
          message: response.data.message,
          data: {
            reportType: response.data.reportType,
            generatedAt: response.data.generatedAt,
            filters: response.data.filters,
            summary: response.data.summary,
            recommendations: response.data.recommendations,
            data: response.data.data,
            totalRecords: response.data.totalRecords
          }
        };
        setReportData(transformedData.data);
        return transformedData;
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
  }, [isAuthenticated, token, hasReportAccess]);

  // ==================== DASHBOARD ANALYTICS ====================
  const getDashboardAnalytics = useCallback(async (dateRange = 30, startDate = null, endDate = null) => {
    if (!isAuthenticated || !token) return null;

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

      // Handle response structure: { success, message, role, clientGrowth, revenueTrend, ... }
      if (response.data.success !== false) {
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
  }, [isAuthenticated, token]);

  // ==================== KPI SUMMARY ====================
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

      if (response.data.success !== false) {
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

  // ==================== BULK EXPORT ====================
  const exportBulkReports = useCallback(async (reportTypes, dateRange, format = 'excel') => {
    if (!isAuthenticated || !token) return null;

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
  }, [isAuthenticated, token]);

  // Clear error and data
  const clearError = useCallback(() => setError(null), []);
  const clearReportData = useCallback(() => setReportData(null), []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const value = {
    // State
    loading,
    initialLoading,
    exporting,
    error,
    reportData,
    analyticsData,
    kpiData,
    // Report Methods
    getClientReport,
    getAssetReport,
    getTeamReport,
    getChecklistReport,
    getAssignmentReport,
    getInspectionReport,
    getRevenueReport,
    getComplianceReport,
    getDashboardAnalytics,
    getKPISummary,
    exportBulkReports,
    // Utility
    clearError,
    clearReportData,
    cleanup,
    // Role Helpers
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    hasReportAccess,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};