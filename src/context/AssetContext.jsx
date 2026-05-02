// context/AssetContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const AssetContext = createContext();

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) throw new Error("useAsset must be used within AssetProvider");
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  // Get user role from token or localStorage
  const getUserRole = useCallback(() => {
    try {
      const token = getToken();
      if (!token) return null;

      // Decode JWT token to get role
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || payload.userRole;
    } catch (error) {
      // Fallback to localStorage
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user?.role;
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  }, []);

  // Check if user has access to Asset Management (Admin or Team only, NOT Super Admin)
  const hasAssetAccess = useCallback(() => {
    const role = getUserRole();
    return role === "admin" || role === "team";
  }, [getUserRole]);

  // Check if user can perform write operations (Admin only)
  const canWriteAssets = useCallback(() => {
    const role = getUserRole();
     return role === "admin" || role === "team";
  }, [getUserRole]);

  const getAuthHeaders = () => {
    const token = getToken();
    const role = getUserRole();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-User-Role": role || "",
      },
    };
  };

  // Clear error helper
  const clearError = () => setError(null);

  // Get all assets with filters (Accessible by Admin & Team)
  const getAllAssets = useCallback(
    async (filters = {}) => {
      // Check access before making request
      if (!hasAssetAccess()) {
        const err = new Error(
          "Access denied: Only Admin and Team roles can view assets",
        );
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.keys(filters).forEach((key) => {
          if (
            filters[key] !== undefined &&
            filters[key] !== "" &&
            filters[key] !== null
          ) {
            params.append(key, filters[key]);
          }
        });

        const url = `${API_BASE_URL}/asset${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await axios.get(url, getAuthHeaders());

        if (response.data && response.data.success !== false) {
          const assetData = response.data.assets || response.data.data || [];
          setAssets(assetData);
          setPagination(
            response.data.pagination || {
              page: filters.page || 1,
              limit: filters.limit || 10,
              total: assetData.length,
              totalPages: Math.ceil(assetData.length / (filters.limit || 10)),
            },
          );
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching assets:", error);
        setError(error.response?.data?.message || error.message);
        setAssets([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [hasAssetAccess],
  );

  // Get single asset by ID (Accessible by Admin & Team)
  const getAssetById = useCallback(
    async (id) => {
      if (!hasAssetAccess()) {
        const err = new Error(
          "Access denied: Only Admin and Team roles can view assets",
        );
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/asset/${id}`,
          getAuthHeaders(),
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching asset:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [hasAssetAccess],
  );

  // Create new asset (Admin only)
  const createAsset = useCallback(
    async (assetData) => {
      if (!canWriteAssets()) {
        const err = new Error("Access denied: Only Admin can create assets");
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset`,
          assetData,
          getAuthHeaders(),
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error creating asset:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [canWriteAssets],
  );

  // Update asset (Admin only)
  const updateAsset = useCallback(
    async (id, assetData) => {
      if (!canWriteAssets()) {
        const err = new Error("Access denied: Only Admin can update assets");
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/asset/${id}`,
          assetData,
          getAuthHeaders(),
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error updating asset:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [canWriteAssets],
  );

  // Delete asset (soft or permanent) - Admin only
  const deleteAsset = useCallback(
    async (id, permanent = false) => {
      if (!canWriteAssets()) {
        const err = new Error("Access denied: Only Admin can delete assets");
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/asset/${id}?permanent=${permanent}`,
          getAuthHeaders(),
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error deleting asset:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [canWriteAssets],
  );

  // Clone asset - Admin only
  const cloneAsset = useCallback(
    async (id, cloneData = {}) => {
      if (!canWriteAssets()) {
        const err = new Error("Access denied: Only Admin can clone assets");
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const payload = {
          assetName: cloneData.assetName || undefined,
          description: cloneData.description || undefined,
          serialNumber: cloneData.serialNumber || undefined,
          currentLocation: cloneData.currentLocation || undefined,
          status: cloneData.status || undefined,
          ...cloneData,
        };

        // Remove undefined values
        Object.keys(payload).forEach((key) => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        const response = await axios.post(
          `${API_BASE_URL}/asset/${id}/clone`,
          payload,
          getAuthHeaders(),
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error cloning asset:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [canWriteAssets],
  );

  // Get asset clones (Accessible by Admin & Team)
  const getAssetClones = useCallback(
    async (id, page = 1, limit = 10) => {
      if (!hasAssetAccess()) {
        const err = new Error(
          "Access denied: Only Admin and Team roles can view asset clones",
        );
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/asset/${id}/clones?page=${page}&limit=${limit}`,
          getAuthHeaders(),
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching clones:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [hasAssetAccess],
  );

  // Link child assets (Admin only)
  const linkChildAssets = useCallback(
    async (id, childAssetIds) => {
      if (!canWriteAssets()) {
        const err = new Error(
          "Access denied: Only Admin can link child assets",
        );
        setError(err);
        throw err;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/asset/${id}/link-children`,
          { childAssetIds },
          getAuthHeaders(),
        );
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error linking child assets:", error);
        setError(error.response?.data?.message || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [canWriteAssets],
  );


  const value = {
    assets,
    loading,
    uploadProgress,
    pagination,
    error,
    clearError,
    getAllAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    cloneAsset,
    getAssetClones,
    linkChildAssets,
    // Helper methods for UI components
    canViewAssets: hasAssetAccess(),
    canWriteAssets: canWriteAssets(),
    userRole: getUserRole(),
    hasAssetAccess: hasAssetAccess(),
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
};
