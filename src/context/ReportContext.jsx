// context/ReportContext.js  — Fixed & Enhanced
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context)
    throw new Error("useReport must be used within a ReportProvider");
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

const getApiClient = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    timeout: 20000,
  });
  // Auto-redirect on 401
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    },
  );
  return client;
};

// ─── FIX: Normalise preserves summary object AND extracts array data ──────────
const normaliseReport = (raw, fallbackType = "") => {
  if (!raw) return null;

  // The API wraps everything in { success, message, data: { summary, clients/team/etc } }
  // raw here is already res.data (the full response body)
  const inner = raw.data ?? raw;

  // Extract the array rows from whichever key holds them
  const dataArray =
    inner.clients ??
    inner.team ??
    inner.assets ??
    inner.checklists ??
    inner.assignments ??
    inner.inspections ??
    inner.auditLogs ??
    inner.logs ??
    inner.records ??
    inner.inquiries ??
    inner.contacts ??
    inner.revenue ??
    inner.compliance ??
    [];

  return {
    reportType: inner.reportType ?? fallbackType,
    generatedAt: inner.generatedAt ?? new Date().toISOString(),
    filters: inner.filters ?? {},
    // FIX: summary lives on inner, not raw
    summary: inner.summary ?? raw.summary ?? {},
    recommendations: inner.recommendations ?? [],
    planDistribution: inner.planDistribution ?? {},
    data: Array.isArray(dataArray) ? dataArray : [],
    totalRecords:
      inner.totalRecords ?? (Array.isArray(dataArray) ? dataArray.length : 0),
  };
};

export const ReportProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const abortMap = useRef({});

  const cancelKey = useCallback((key) => {
    abortMap.current[key]?.abort();
    const ctrl = new AbortController();
    abortMap.current[key] = ctrl;
    return ctrl.signal;
  }, []);

  // ── Role helpers ─────────────────────────────────────────────────────────────
  const isAdminFn = useCallback(() => user?.role === "admin", [user]);

  const isSuperAdminFn = useCallback(
    () => user?.role === "super_admin" || user?.role === "superadmin",
    [user],
  );

  const hasReportAccess = useCallback(
    (reportType) => {
      if (isSuperAdminFn()) return true;
      if (isAdminFn()) {
        return [
          "assets",
          "team",
          "checklists",
          "assignments",
          "inspections",
          "compliance",
        ].includes(reportType);
      }
      return ["inspections", "compliance"].includes(reportType);
    },
    [isAdminFn, isSuperAdminFn],
  );

  // ── Generic fetch helper ──────────────────────────────────────────────────────
  const fetchReport = useCallback(
    async ({
      endpoint,
      reportType,
      filters = {},
      format = "json",
      accessCheck,
    }) => {
      if (!isAuthenticated || !token) return null;
      if (accessCheck && !accessCheck()) {
        setError(`You do not have permission to access ${reportType} reports`);
        return null;
      }

      const signal = cancelKey(reportType);
      setError(null);
      setLoading(true);

      try {
        const api = getApiClient(token);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") params.append(k, v);
        });
        if (format !== "json") params.append("format", format);

        const response = await api.get(`${endpoint}?${params.toString()}`, {
          signal,
          ...(format !== "json" && { responseType: "blob" }),
        });

        if (format !== "json") return response.data;

        const raw = response.data;
        if (raw?.success === false)
          throw new Error(
            raw.message || `Failed to fetch ${reportType} report`,
          );

        // FIX: pass the full raw response to normaliser so it can find .data.summary
        const normalised = normaliseReport(raw, reportType);
        setReportData(normalised);
        return { success: true, message: raw.message, data: normalised };
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          const msg =
            err.response?.data?.message || err.message || "Unexpected error";
          console.error(`[ReportContext] ${reportType} error:`, msg);
          setError(msg);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, cancelKey],
  );

  // ── Report methods ────────────────────────────────────────────────────────────
  const getClientReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/clients",
        reportType: "clients",
        filters,
        format,
        accessCheck: () => isSuperAdminFn(),
      }),
    [fetchReport, isSuperAdminFn],
  );

  const getAssetReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/assets",
        reportType: "assets",
        filters,
        format,
        accessCheck: () => hasReportAccess("assets"),
      }),
    [fetchReport, hasReportAccess],
  );

  // FIX: team report uses /reports/individual-team only when teamId provided; else falls back to a summary
  const getTeamReport = useCallback(
    (filters = {}, format = "json") => {
      const endpoint = filters.teamId
        ? "/reports/individual-team"
        : "/reports/assets";
      return fetchReport({
        endpoint,
        reportType: "team",
        filters,
        format,
        accessCheck: () => hasReportAccess("team"),
      });
    },
    [fetchReport, hasReportAccess],
  );

  const getChecklistReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/checklists",
        reportType: "checklists",
        filters,
        format,
        accessCheck: () => hasReportAccess("checklists"),
      }),
    [fetchReport, hasReportAccess],
  );

  const getAssignmentReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/assignments",
        reportType: "assignments",
        filters,
        format,
        accessCheck: () => hasReportAccess("assignments"),
      }),
    [fetchReport, hasReportAccess],
  );

  const getInspectionReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/audit-logs",
        reportType: "inspections",
        filters,
        format,
        accessCheck: () => hasReportAccess("inspections"),
      }),
    [fetchReport, hasReportAccess],
  );

  const getRevenueReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/financial",
        reportType: "revenue",
        filters,
        format,
        accessCheck: () => isSuperAdminFn(),
      }),
    [fetchReport, isSuperAdminFn],
  );

  const getComplianceReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/contact-inquiries",
        reportType: "compliance",
        filters,
        format,
        accessCheck: () => hasReportAccess("compliance"),
      }),
    [fetchReport, hasReportAccess],
  );

  const getIndividualClientReport = useCallback(
    (clientId, filters = {}) =>
      fetchReport({
        endpoint: "/reports/individual-client",
        reportType: "individual_client",
        filters: { clientId, ...filters },
        accessCheck: () => isSuperAdminFn(),
      }),
    [fetchReport, isSuperAdminFn],
  );

  // ── Analytics — with graceful fallback if endpoint doesn't exist ──────────────
  const getDashboardAnalytics = useCallback(
    async (dateRange = 30, startDate = null, endDate = null) => {
      if (!isAuthenticated || !token) return null;

      const signal = cancelKey("analytics");
      setError(null);
      setLoading(true);

      try {
        const api = getApiClient(token);
        const params = new URLSearchParams();
        if (dateRange) params.append("dateRange", dateRange);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await api.get(
          `/reports/analytics/dashboard?${params.toString()}`,
          { signal },
        );

        if (response.data?.success !== false) {
          setAnalyticsData(response.data?.data ?? response.data);
          return response.data;
        }
        throw new Error(response.data?.message || "Failed to fetch analytics");
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          // FIX: 404 on analytics is non-fatal — set empty object so page still renders
          if (err.response?.status === 404) {
            setAnalyticsData({});
            return {};
          }
          setError(err.response?.data?.message || err.message);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, cancelKey],
  );

  const getKPISummary = useCallback(async () => {
    if (!isAuthenticated || !token) return null;
    const signal = cancelKey("kpi");
    setLoading(true);
    try {
      const api = getApiClient(token);
      const response = await api.get("/reports/analytics/kpi", { signal });
      if (response.data?.success !== false) {
        setKpiData(response.data);
        return response.data;
      }
      throw new Error(response.data?.message || "Failed to fetch KPI");
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        if (err.response?.status === 404) return {};
        setError(err.response?.data?.message || err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, cancelKey]);

  // ── Bulk export ───────────────────────────────────────────────────────────────
  const exportBulkReports = useCallback(
    async (reportTypes, dateRange, format = "excel") => {
      if (!isAuthenticated || !token) return null;
      setExporting(true);
      setError(null);
      try {
        const api = getApiClient(token);
        const response = await api.post(
          "/reports/export/bulk",
          { reportTypes, dateRange, format },
          { responseType: "blob" },
        );
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        return null;
      } finally {
        setExporting(false);
      }
    },
    [isAuthenticated, token],
  );

  const cleanup = useCallback(() => {
    Object.values(abortMap.current).forEach((ctrl) => ctrl.abort());
    abortMap.current = {};
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearReportData = useCallback(() => setReportData(null), []);

  return (
    <ReportContext.Provider
      value={{
        loading,
        initialLoading,
        exporting,
        error,
        reportData,
        analyticsData,
        kpiData,
        getClientReport,
        getAssetReport,
        getTeamReport,
        getChecklistReport,
        getAssignmentReport,
        getInspectionReport,
        getRevenueReport,
        getComplianceReport,
        getIndividualClientReport,
        getDashboardAnalytics,
        getKPISummary,
        exportBulkReports,
        clearError,
        clearReportData,
        cleanup,
        isAdmin: isAdminFn(),
        isSuperAdmin: isSuperAdminFn(),
        hasReportAccess,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
