// contexts/AssetRequestContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const AssetRequestContext = createContext();

export const useAssetRequest = () => {
  const context = useContext(AssetRequestContext);
  if (!context)
    throw new Error("useAssetRequest must be used within AssetRequestProvider");
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

export const AssetRequestProvider = ({ children }) => {
  const { token, user, isAdmin, isTeam } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState(null);

  const getAuthHeaders = useCallback(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token],
  );

  const getRequestStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/asset-requests/stats`,
        getAuthHeaders(),
      );
      if (response.data.success) {
        setStats(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, getAuthHeaders]);

  const getAllRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.append(key, value);
          }
        });
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests?${params.toString()}`,
          getAuthHeaders(),
        );
        if (response.data.success) {
          setRequests(response.data.requests || []);
          setPagination(response.data.pagination || { limit: 10, total: 0, totalPages: 0 });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching requests:", error);
        if (error.response?.status === 403) {
          setRequests([]);
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
          return { requests: [], pagination: { total: 0 } };
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders],
  );

  const getParentRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") params.append(key, value);
        });
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests/parent?${params.toString()}`,
          getAuthHeaders(),
        );
        if (response.data.success) {
          setRequests(response.data.requests || []);
          setPagination(response.data.pagination || { limit: 10, total: 0, totalPages: 0 });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching parent requests:", error);
        if (error.response?.status === 403) {
          setRequests([]);
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
          return { requests: [], pagination: { total: 0 } };
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders],
  );

  const getChildRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") params.append(key, value);
        });
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests/child?${params.toString()}`,
          getAuthHeaders(),
        );
        if (response.data.success) {
          setRequests(response.data.requests || []);
          setPagination(response.data.pagination || { limit: 10, total: 0, totalPages: 0 });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching child requests:", error);
        if (error.response?.status === 403) {
          setRequests([]);
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
          return { requests: [], pagination: { total: 0 } };
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders],
  );

  const getMyRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            params.append(key, value);
          }
        });
        
        // FIXED: Added getAuthHeaders() to include the authorization token
        const url = `${API_BASE_URL}/asset-requests/my${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url, getAuthHeaders());
        
        if (response.data.success) {
          setRequests(response.data.requests || []);
          setPagination(response.data.pagination || { limit: 10, total: 0, totalPages: 0 });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching my requests:", error);
        if (error.response?.status === 401) {
          console.log("Unauthorized - token may be expired or invalid");
          setRequests([]);
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
          return { requests: [], pagination: { total: 0 } };
        }
        if (error.response?.status === 403) {
          setRequests([]);
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
          return { requests: [], pagination: { total: 0 } };
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders],
  );

  const getRequestById = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests/${id}`,
          getAuthHeaders(),
        );
        if (response.data.success) return response.data.request;
        return null;
      } catch (error) {
        console.error("Error fetching request:", error);
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders],
  );

  const createRequest = useCallback(
    async (requestData) => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset-requests`,
          requestData,
          getAuthHeaders(),
        );
        if (response.data.success) {
          await getMyRequests();
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error creating request:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders, getMyRequests],
  );

  const reviewRequest = useCallback(
    async (id, action, rejectionReason = null) => {
      setLoading(true);
      try {
        let response;
        if (action === "approve") {
          response = await axios.patch(
            `${API_BASE_URL}/asset-requests/${id}/approve`,
            {},
            getAuthHeaders(),
          );
        } else if (action === "reject") {
          response = await axios.patch(
            `${API_BASE_URL}/asset-requests/${id}/reject`,
            { reason: rejectionReason },
            getAuthHeaders(),
          );
        } else {
          throw new Error("Invalid action");
        }
        if (response.data.success) {
          await getRequestStats();
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error reviewing request:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders, getRequestStats],
  );

  const deleteRequest = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/asset-requests/${id}`,
          getAuthHeaders(),
        );
        if (response.data.success) {
          await getMyRequests();
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error deleting request:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, getAuthHeaders, getMyRequests],
  );

  const value = {
    requests,
    loading,
    pagination,
    stats,
    getRequestStats,
    getAllRequests,
    getParentRequests,
    getChildRequests,
    getMyRequests,
    getRequestById,
    createRequest,
    reviewRequest,
    deleteRequest,
    isAdmin: isAdmin?.(),
    isTeam: isTeam?.(),
  };

  return (
    <AssetRequestContext.Provider value={value}>
      {children}
    </AssetRequestContext.Provider>
  );
};