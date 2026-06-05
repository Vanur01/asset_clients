// context/DashboardContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

const createApiClient = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    timeout: 15000,
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return client;
};

export const DashboardProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [dataLoaded, setDataLoaded]       = useState(false);

  const abortRef   = useRef(null);
  const isMounted  = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const safe = useCallback((setter, val) => {
    if (isMounted.current) setter(val);
  }, []);

  /**
   * Single fetch — hits GET /dashboard with the user's token.
   * The server returns role-specific data automatically.
   */
  const loadDashboard = useCallback(
    async (filters = {}) => {
      if (!isAuthenticated || !token) return null;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      safe(setError, null);
      safe(setLoading, true);

      try {
        const api    = createApiClient(token);
        const params = new URLSearchParams();
        if (filters.dateRange) params.append("dateRange", filters.dateRange);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate)   params.append("endDate",   filters.endDate);

        const res = await api.get(`/dashboard?${params.toString()}`, {
          signal: abortRef.current.signal,
        });

        if (res.data?.success) {
          // Store the full payload exactly as returned by the server.
          // Components read role-specific keys (team, assets, clients, etc.) directly.
          safe(setDashboardData, res.data);
          safe(setDataLoaded, true);
          return res.data;
        }

        throw new Error(res.data?.message || "Failed to fetch dashboard");
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          const msg = err.response?.data?.message || err.message || "Unexpected error";
          console.error("[DashboardContext] loadDashboard error:", msg);
          safe(setError, msg);
        }
        return null;
      } finally {
        safe(setLoading, false);
      }
    },
    [isAuthenticated, token, safe]
  );

  const clearError = useCallback(() => safe(setError, null), [safe]);

  const refresh = useCallback(
    (filters = {}) => {
      safe(setDataLoaded, false);
      return loadDashboard(filters);
    },
    [loadDashboard, safe]
  );

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,   // full server response — keyed by role-specific fields
        loading,
        error,
        dataLoaded,
        loadDashboard,
        refresh,
        clearError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};