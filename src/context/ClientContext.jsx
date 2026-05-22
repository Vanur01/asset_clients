// context/ClientContext.js - Fixed Version

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useReducer,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContexts";
import * as clientApi from "../services/ClientApi";

// ─── Initial State ──────────────────────────────────────────────────────────
const initialState = {
  clients: [],
  selectedClient: null,
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    expiringSoon: 0,
    byPlan: { free: 0, standard: 0, premium: 0, enterprise: 0 },
  },
  pagination: { page: 1, limit: 12, total: 0, pages: 1 },
  filters: {
    search: "",
    status: "all",
    membershipPlan: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  loading: false,
  initialLoading: true,
  error: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const A = {
  SET_LOADING: "SET_LOADING",
  SET_INITIAL_LOADING: "SET_INITIAL_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CLIENTS: "SET_CLIENTS",
  SET_SELECTED_CLIENT: "SET_SELECTED_CLIENT",
  SET_STATS: "SET_STATS",
  SET_PAGINATION: "SET_PAGINATION",
  SET_FILTERS: "SET_FILTERS",
  UPDATE_CLIENT: "UPDATE_CLIENT",
  ADD_CLIENT: "ADD_CLIENT",
  REMOVE_CLIENT: "REMOVE_CLIENT",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const clientReducer = (state, action) => {
  switch (action.type) {
    case A.SET_LOADING:
      return { ...state, loading: action.payload };
    case A.SET_INITIAL_LOADING:
      return { ...state, initialLoading: action.payload };
    case A.SET_ERROR:
      return { ...state, error: action.payload };
    case A.CLEAR_ERROR:
      return { ...state, error: null };
    case A.SET_CLIENTS:
      return { ...state, clients: action.payload };
    case A.SET_SELECTED_CLIENT:
      return { ...state, selectedClient: action.payload };
    case A.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case A.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    case A.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case A.UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map((c) =>
          c._id === action.payload._id ? action.payload : c,
        ),
        selectedClient:
          state.selectedClient?._id === action.payload._id
            ? action.payload
            : state.selectedClient,
      };
    case A.ADD_CLIENT:
      return {
        ...state,
        clients: [action.payload, ...state.clients],
        stats: {
          ...state.stats,
          total: (state.stats.total || 0) + 1,
          active: (state.stats.active || 0) + 1,
          byPlan: {
            ...state.stats.byPlan,
            [action.payload.membershipPlan]:
              (state.stats.byPlan?.[action.payload.membershipPlan] || 0) + 1,
          },
        },
      };
    case A.REMOVE_CLIENT:
      return {
        ...state,
        clients: state.clients.filter((c) => c._id !== action.payload),
      };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
const ClientContext = createContext();

export const useClient = () => {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
};

// ─── Helper to get valid token ──────────────────────────────────────────────
const getValidToken = () => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) return null;
  // Optional: Check token expiration here if needed
  return token;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const ClientProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const [actionLoading, setActionLoading] = useState(false);

  const filtersRef = useRef(state.filters);
  const paginationRef = useRef(state.pagination);
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    filtersRef.current = state.filters;
  }, [state.filters]);

  useEffect(() => {
    paginationRef.current = state.pagination;
  }, [state.pagination]);

  // ─── fetchClients ─────────────────────────────────────────────────────────
  const fetchClients = useCallback(async (overrides = {}) => {
    const token = getValidToken();
    
    // Enhanced authentication check
    if (!token) {
      console.log("No token found, skipping fetchClients");
      if (isMountedRef.current) {
        dispatch({ type: A.SET_INITIAL_LOADING, payload: false });
        dispatch({ type: A.SET_LOADING, payload: false });
        dispatch({ type: A.SET_ERROR, payload: "Authentication required. Please log in again." });
      }
      return;
    }

    // Don't fetch if already fetching
    if (fetchInProgressRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }

    fetchInProgressRef.current = true;

    if (isMountedRef.current) {
      dispatch({ type: A.SET_LOADING, payload: true });
      dispatch({ type: A.SET_ERROR, payload: null });
    }

    try {
      const activeFilters = { ...filtersRef.current, ...overrides };
      const activePagination = { 
        page: overrides.page ?? paginationRef.current.page,
        limit: paginationRef.current.limit,
      };

      console.log("Fetching clients with params:", { activeFilters, activePagination });

      const result = await clientApi.getAllClients(token, {
        page: activePagination.page,
        limit: activePagination.limit,
        search: activeFilters.search,
        status: activeFilters.status !== "all" ? activeFilters.status : undefined,
        membershipPlan: activeFilters.membershipPlan !== "all" ? activeFilters.membershipPlan : undefined,
        sortBy: activeFilters.sortBy,
        sortOrder: activeFilters.sortOrder,
      });

      if (!isMountedRef.current) return;

      if (result && result.success) {
        // Transform clients to include computed fields
        const clientsWithStats = (result.clients || []).map(client => ({
          ...client,
          usagePercentage: client.usersUsed && client.licenseLimit 
            ? Math.min(100, Math.round((client.usersUsed / client.licenseLimit) * 100))
            : 0,
          daysRemaining: client.subscriptionEndDate
            ? Math.max(0, Math.ceil((new Date(client.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
            : client.daysRemaining || 0,
        }));

        dispatch({ type: A.SET_CLIENTS, payload: clientsWithStats });

        // Update stats from response
        if (result.summary) {
          dispatch({
            type: A.SET_STATS,
            payload: {
              total: result.summary.total || result.summary.totalCustomers || 0,
              active: result.summary.active || result.summary.activeCustomers || 0,
              inactive: (result.summary.total || result.summary.totalCustomers || 0) - (result.summary.active || result.summary.activeCustomers || 0),
              expiringSoon: result.summary.expiringSoon || 0,
              byPlan: result.summary.byPlan || { free: 0, standard: 0, premium: 0, enterprise: 0 },
            },
          });
        }

        // Update pagination
        if (result.pagination) {
          dispatch({ type: A.SET_PAGINATION, payload: result.pagination });
        }
      } else {
        throw new Error(result?.message || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("fetchClients error:", error);
      if (isMountedRef.current) {
        // Handle 403 specifically
        if (error.response?.status === 403) {
          dispatch({ type: A.SET_ERROR, payload: "Access denied. Please check your permissions or log in again." });
          // Optionally trigger logout
          // localStorage.removeItem("accessToken");
          // sessionStorage.removeItem("accessToken");
        } else if (error.response?.status === 401) {
          dispatch({ type: A.SET_ERROR, payload: "Session expired. Please log in again." });
        } else {
          dispatch({ type: A.SET_ERROR, payload: error.message || "Failed to fetch clients" });
        }
        dispatch({ type: A.SET_CLIENTS, payload: [] });
      }
    } finally {
      if (isMountedRef.current) {
        dispatch({ type: A.SET_LOADING, payload: false });
        dispatch({ type: A.SET_INITIAL_LOADING, payload: false });
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  // ─── fetchClientById ───────────────────────────────────────────────────────
  const fetchClientById = useCallback(async (clientId) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    dispatch({ type: A.SET_LOADING, payload: true });
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      const result = await clientApi.getClientById(token, clientId);
      
      if (result?.success && result?.client) {
        const clientWithComputed = {
          ...result.client,
          usagePercentage: result.client.usersUsed && result.client.licenseLimit
            ? Math.min(100, Math.round((result.client.usersUsed / result.client.licenseLimit) * 100))
            : 0,
          daysRemaining: result.client.subscriptionEndDate
            ? Math.max(0, Math.ceil((new Date(result.client.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
            : result.client.daysRemaining || 0,
        };
        dispatch({ type: A.SET_SELECTED_CLIENT, payload: clientWithComputed });
        return clientWithComputed;
      }
      throw new Error(result?.message || "Client not found");
    } catch (error) {
      console.error("fetchClientById error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: A.SET_LOADING, payload: false });
    }
  }, []);

  // ─── addClient ─────────────────────────────────────────────────────────────
  const addClient = useCallback(async (clientData) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      const result = await clientApi.createClient(token, clientData);
      
      if (result?.success && result?.client) {
        const newClient = {
          ...result.client,
          usagePercentage: 0,
          daysRemaining: result.client.subscriptionEndDate
            ? Math.max(0, Math.ceil((new Date(result.client.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
            : 0,
        };
        dispatch({ type: A.ADD_CLIENT, payload: newClient });
        // Refresh list to get updated stats
        await fetchClients({ page: 1 });
        return result;
      }
      throw new Error(result?.message || "Failed to create client");
    } catch (error) {
      console.error("addClient error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClients]);

  // ─── editClient ────────────────────────────────────────────────────────────
  const editClient = useCallback(async (clientId, updateData) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      const result = await clientApi.updateClient(token, clientId, updateData);
      
      if (result?.success && result?.client) {
        const updatedClient = {
          ...result.client,
          usagePercentage: result.client.usersUsed && result.client.licenseLimit
            ? Math.min(100, Math.round((result.client.usersUsed / result.client.licenseLimit) * 100))
            : 0,
          daysRemaining: result.client.subscriptionEndDate
            ? Math.max(0, Math.ceil((new Date(result.client.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
            : result.client.daysRemaining || 0,
        };
        dispatch({ type: A.UPDATE_CLIENT, payload: updatedClient });
        // Refresh list to get updated stats
        await fetchClients();
        return result;
      }
      throw new Error(result?.message || "Failed to update client");
    } catch (error) {
      console.error("editClient error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClients]);

  // ─── changeClientStatus ────────────────────────────────────────────────────
  const changeClientStatus = useCallback(async (clientId, status) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      await clientApi.updateClientStatus(token, clientId, status);
      await fetchClients();
      
      if (state.selectedClient?._id === clientId) {
        await fetchClientById(clientId);
      }
      return { success: true };
    } catch (error) {
      console.error("changeClientStatus error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClients, fetchClientById, state.selectedClient]);

  // ─── removeClient ──────────────────────────────────────────────────────────
  const removeClient = useCallback(async (clientId, permanent = false) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      await clientApi.deleteClient(token, clientId, permanent);
      dispatch({ type: A.REMOVE_CLIENT, payload: clientId });
      await fetchClients();
      return { success: true };
    } catch (error) {
      console.error("removeClient error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClients]);

  // ─── renewClientMembership ─────────────────────────────────────────────────
  const renewClientMembership = useCallback(async (clientId, extendDays) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      const result = await clientApi.renewClientMembership(token, clientId, extendDays);
      
      if (result?.success && result?.client) {
        dispatch({ type: A.UPDATE_CLIENT, payload: result.client });
        await fetchClients();
        
        if (state.selectedClient?._id === clientId) {
          await fetchClientById(clientId);
        }
        return result;
      }
      throw new Error(result?.message || "Failed to renew membership");
    } catch (error) {
      console.error("renewClientMembership error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClients, fetchClientById, state.selectedClient]);

  // ─── updateAutoRenewal ─────────────────────────────────────────────────────
  const updateAutoRenewal = useCallback(async (clientId, enabled) => {
    const token = getValidToken();
    
    if (!token) {
      throw new Error("Authentication required");
    }

    setActionLoading(true);
    dispatch({ type: A.SET_ERROR, payload: null });

    try {
      const result = await clientApi.updateAutoRenewal(token, clientId, enabled);
      
      if (result?.success) {
        await fetchClientById(clientId);
        return result;
      }
      throw new Error(result?.message || "Failed to update auto-renewal");
    } catch (error) {
      console.error("updateAutoRenewal error:", error);
      dispatch({ type: A.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchClientById]);

  // ─── updateFilters ─────────────────────────────────────────────────────────
  const updateFilters = useCallback((newFilters) => {
    const merged = { ...filtersRef.current, ...newFilters };
    filtersRef.current = merged;
    dispatch({ type: A.SET_FILTERS, payload: newFilters });
    
    const newPagination = { ...paginationRef.current, page: 1 };
    paginationRef.current = newPagination;
    dispatch({ type: A.SET_PAGINATION, payload: newPagination });
    
    // Trigger fetch with new filters
    fetchClients({ ...merged, page: 1 });
  }, [fetchClients]);

  // ─── changePage ────────────────────────────────────────────────────────────
  const changePage = useCallback((newPage) => {
    const newPagination = { ...paginationRef.current, page: newPage };
    paginationRef.current = newPagination;
    dispatch({ type: A.SET_PAGINATION, payload: newPagination });
    
    // Trigger fetch with new page
    fetchClients({ page: newPage });
  }, [fetchClients]);

  // ─── resetFilters ──────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      status: "all",
      membershipPlan: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    filtersRef.current = defaultFilters;
    dispatch({ type: A.SET_FILTERS, payload: defaultFilters });
    
    const defaultPagination = { ...paginationRef.current, page: 1, limit: 12 };
    paginationRef.current = defaultPagination;
    dispatch({ type: A.SET_PAGINATION, payload: defaultPagination });
    
    fetchClients(defaultFilters);
  }, [fetchClients]);

  // ─── clearError ────────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: A.CLEAR_ERROR });
  }, []);

  // Initial fetch on mount - only when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && getValidToken()) {
      fetchClients();
    } else if (!authLoading && !isAuthenticated) {
      dispatch({ type: A.SET_INITIAL_LOADING, payload: false });
      dispatch({ type: A.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, authLoading, fetchClients]);

  const value = {
    // State
    clients: state.clients,
    selectedClient: state.selectedClient,
    stats: state.stats,
    pagination: state.pagination,
    filters: state.filters,
    loading: state.loading,
    initialLoading: state.initialLoading || (authLoading && state.initialLoading),
    actionLoading,
    error: state.error,
    // Actions
    fetchClients,
    fetchClientById,
    addClient,
    editClient,
    changeClientStatus,
    removeClient,
    renewClientMembership,
    updateAutoRenewal,
    updateFilters,
    changePage,
    resetFilters,
    clearError,
  };

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
};