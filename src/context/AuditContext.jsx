// context/AuditContext.jsx
// Only two APIs integrated:
//   GET /audit-logs          → { success, logs: [...], pagination: { page, limit, total, totalPages } }
//   GET /audit-logs/statistics → { success, stats: { total, byAction:[{_id,count}], byResource:[{_id,count}], today } }
//
// All roles (super_admin, admin, team) hit the same /audit-logs endpoint.
// Backend is responsible for filtering results based on the authenticated user's role.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const AuditContext = createContext();

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context)
    throw new Error("useAudit must be used within an AuditProvider");
  return context;
};

const API_BASE_URL = "http://localhost:9001/api/v1";

export const AuditProvider = ({ children }) => {
  const { token, user } = useAuth();

  /* ── Shared state (all roles use same endpoint) ── */
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    actorRole: "",
    status: "",
    startDate: null,
    endDate: null,
    search: "",
  });

  /* ── Role checks ── */
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isTeam = user?.role === "team";

  /* ── Auth headers ── */
  const getAuthHeaders = useCallback(() => {
    const currentToken =
      token ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    };
  }, [token]);

  /* ══════════════════════════════════════════
     fetchAuditLogs — used by ALL roles.
     Backend filters results by role automatically.
     Super admin gets everything; admin gets org;
     team gets own activity — same endpoint.
  ══════════════════════════════════════════ */
  const fetchAuditLogs = useCallback(
    async (page = 1, limit = 20, appliedFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (appliedFilters.action)
          params.append("action", appliedFilters.action);
        if (appliedFilters.resource)
          params.append("resource", appliedFilters.resource);
        if (appliedFilters.actorRole)
          params.append("actorRole", appliedFilters.actorRole);
        if (appliedFilters.status)
          params.append("status", appliedFilters.status);
        if (appliedFilters.startDate)
          params.append("startDate", appliedFilters.startDate.toISOString());
        if (appliedFilters.endDate)
          params.append("endDate", appliedFilters.endDate.toISOString());
        if (appliedFilters.search)
          params.append("search", appliedFilters.search);

        const response = await axios.get(
          `${API_BASE_URL}/audit-logs?${params.toString()}`,
          getAuthHeaders(),
        );

        if (response.data.success) {
          setAuditLogs(response.data.logs || []);
          setPagination(response.data.pagination);
          return response.data;
        } else {
          throw new Error(
            response.data.message || "Failed to fetch audit logs",
          );
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch audit logs";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, filters],
  );

  /* ══════════════════════════════════════════
     fetchAuditStats — super admin only.
     stats shape: { total, byAction:[{_id,count}], byResource:[{_id,count}], today }
  ══════════════════════════════════════════ */
  const fetchAuditStats = useCallback(async () => {
    if (!isSuperAdmin) return null;
    setStatsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/audit-logs/statistics`,
        getAuthHeaders(),
      );
      if (response.data.success) {
        setStats(response.data.stats);
        return response.data.stats;
      } else {
        throw new Error(response.data.message || "Failed to fetch statistics");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch statistics";
      setError(msg);
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, [isSuperAdmin, getAuthHeaders]);

  /* ══════════════ FILTERS ══════════════ */

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      action: "",
      resource: "",
      actorRole: "",
      status: "",
      startDate: null,
      endDate: null,
      search: "",
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  /* ══════════════ UI HELPERS ══════════════ */

  const getPageTitle = useCallback(() => {
    if (isSuperAdmin) return "System Audit Logs";
    if (isAdmin) return "Organization Activity";
    return "My Activity";
  }, [isSuperAdmin, isAdmin]);

  const getPageDescription = useCallback(() => {
    if (isSuperAdmin)
      return "Complete audit trail of all activities across the entire system";
    if (isAdmin)
      return "Monitor activity within your organization (your actions + team members)";
    return "Track your own personal activity and actions within the system";
  }, [isSuperAdmin, isAdmin]);

  const canSeeAdvancedFilters = useMemo(() => isSuperAdmin, [isSuperAdmin]);

  /* ══════════════ CONTEXT VALUE ══════════════ */

  const value = useMemo(
    () => ({
      // Data
      auditLogs,
      loading,
      error,
      stats,
      statsLoading,
      pagination,
      filters,

      // Role flags
      isSuperAdmin,
      isAdmin,
      isTeam,

      // Permissions
      canExport: true,       // all roles export client-side
      canSeeStats: true,     // all roles see stats (SA: API; others: derived)
      canSeeAdvancedFilters,

      // API methods
      fetchAuditLogs,
      fetchAuditStats,

      // Filter helpers
      updateFilters,
      resetFilters,
      clearError,

      // UI helpers
      getPageTitle,
      getPageDescription,
    }),
    [
      auditLogs,
      loading,
      error,
      stats,
      statsLoading,
      pagination,
      filters,
      isSuperAdmin,
      isAdmin,
      isTeam,
      canSeeAdvancedFilters,
      fetchAuditLogs,
      fetchAuditStats,
      updateFilters,
      resetFilters,
      clearError,
      getPageTitle,
      getPageDescription,
    ],
  );

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  );
};