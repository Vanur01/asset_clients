// context/AssetRequestContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const AssetRequestContext = createContext();

export const useAssetRequest = () => {
  const context = useContext(AssetRequestContext);
  if (!context) {
    throw new Error(
      "useAssetRequest must be used within an AssetRequestProvider",
    );
  }
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

export const AssetRequestProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const currentToken =
      token ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    };
  }, [token]);

  // Fetch all requests with filters
  const fetchRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const { page = 1, limit = 10, type = "all", status, search } = filters;
        let url = `${API_BASE_URL}/asset-requests?page=${page}&limit=${limit}`;

        if (type && type !== "all") {
          url += `&type=${type}`;
        }
        if (status && status !== "all") {
          url += `&status=${status}`;
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await axios.get(url, {
          headers: getAuthHeaders(),
        });

        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to fetch requests";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Fetch single request by ID
  const getRequestById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests/${id}`,
          {
            headers: getAuthHeaders(),
          },
        );
        console.log("API Response from getRequestById:", response.data);
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to fetch request details";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Fetch requests by asset ID
  const getRequestsByAsset = useCallback(
    async (assetId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/asset-requests/asset/${assetId}`,
          {
            headers: getAuthHeaders(),
          },
        );
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to fetch asset requests";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Create new request
  const createRequest = useCallback(
    async (requestData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset-requests`,
          requestData,
          {
            headers: getAuthHeaders(),
          },
        );
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to create request";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Create parent request (alias for createRequest)
  const createParentRequest = useCallback(
    async (requestData) => {
      return createRequest(requestData);
    },
    [createRequest],
  );

  // Create child request
  const createChildRequest = useCallback(
    async (parentId, childData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset-requests/${parentId}/child`,
          childData,
          {
            headers: getAuthHeaders(),
          },
        );
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to create child request";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Approve request
  const approveRequest = useCallback(
    async (id, notes = "") => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/asset-requests/${id}/approve`,
          { notes },
          { headers: getAuthHeaders() },
        );
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to approve request";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Reject request
  const rejectRequest = useCallback(
    async (id, reason) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/asset-requests/${id}/reject`,
          { reason },
          { headers: getAuthHeaders() },
        );
        return response.data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to reject request";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Link child asset to request
  const linkAsset = useCallback(
    async (requestId, childAssetId, relationshipType = "accessory") => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset-requests/${requestId}/link-asset`,
          { childAssetId, relationshipType },
          { headers: getAuthHeaders() },
        );
        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to link asset";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  const value = {
    loading,
    error,
    fetchRequests,
    getRequestById,
    getRequestsByAsset,
    createRequest,
    createParentRequest,
    createChildRequest,
    approveRequest,
    rejectRequest,
    linkAsset,
  };

  return (
    <AssetRequestContext.Provider value={value}>
      {children}
    </AssetRequestContext.Provider>
  );
};
