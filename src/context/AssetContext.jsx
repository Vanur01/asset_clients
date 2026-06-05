// src/context/AssetContext.jsx
// ─── FIXES ────────────────────────────────────────────────────────────────────
// 1. Token fallback: interceptor now also checks localStorage.getItem("token")
//    so the fallback key written by AuthContext is never missed.
// 2. auth:expired listener: the context now listens for the custom event fired
//    by the response interceptor and clears React state immediately — previously
//    the token was removed from storage but user/token state stayed stale until
//    a hard reload, causing every subsequent API call to silently fail.
// 3. Exported `api` instance is the single source of truth — all other contexts
//    must import THIS instance rather than creating their own.
// ─────────────────────────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import axios from "axios";

const AssetContext = createContext();

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) throw new Error("useAsset must be used within AssetProvider");
  return context;
};

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "https://assset-management-backend-4.onrender.com/api/v1";

// ─── Shared axios instance (exported for all contexts to import) ──────────────
export const api = axios.create({ baseURL: API_BASE_URL });

// ── Request interceptor ───────────────────────────────────────────────────────
// FIX 1: check all three storage keys AuthContext may write to
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||          // ← was missing
      sessionStorage.getItem("accessToken");

    console.log(
      `[API] ${config.method?.toUpperCase()} ${config.url} - Token: ${!!token}`,
    );
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] Response ${response.status} from ${response.config.url}`,
    );
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    console.error(
      `[API] Error ${status} from ${error?.config?.url}`,
      error?.response?.data,
    );

    if (status === 401 || status === 403) {
      console.log("[API] Token expired or invalid, clearing auth data");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      sessionStorage.removeItem("accessToken");
      // FIX 2: dispatch so AssetProvider (and AuthProvider) can clear React state
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    return Promise.reject(error);
  },
);

// De-duplicate by _id or id
const deduplicateAssets = (list = []) => {
  const seen = new Set();
  return list.filter((asset) => {
    const key = asset._id || asset.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [assetStats, setAssetStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const abortRef = useRef(null);

  // FIX 2: listen for auth:expired and clear state so UI reacts immediately
  useEffect(() => {
    const handleExpired = () => {
      setAssets([]);
      setAssetStats(null);
      setError("Session expired. Please log in again.");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const extractError = useCallback((err, fallback = "An error occurred") => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback;
    setError(msg);
    return msg;
  }, []);

  const getAllAssets = useCallback(
    async (filters = {}) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "" && v !== null) params.append(k, v);
        });

        const url = `/assets${params.toString() ? `?${params}` : ""}`;
        const res = await api.get(url, { signal: abortRef.current.signal });

        if (res.data?.success) {
          const deduped = deduplicateAssets(res.data.assets || []);
          setAssets(deduped);

          if (res.data.stats) setAssetStats(res.data.stats);

          const pag = res.data.pagination || {};
          const newPag = {
            page: pag.page || filters.page || 1,
            limit: pag.limit || filters.limit || 12,
            total: pag.total ?? deduped.length,
            pages: pag.pages || 1,
          };
          setPagination(newPag);
          return { ...res.data, assets: deduped, pagination: newPag };
        }
        return null;
      } catch (err) {
        if (axios.isCancel(err) || err?.name === "CanceledError") return null;
        extractError(err, "Failed to fetch assets");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const getAssetById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assets/${id}`);
        return res.data;
      } catch (err) {
        extractError(err, "Failed to fetch asset");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const createAsset = useCallback(
    async (assetData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post("/assets/add", assetData);
        // Return a normalised shape so callers always check res.success
        return { success: true, data: res.data };
      } catch (err) {
        const msg = extractError(err, "Failed to create asset");
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const updateAsset = useCallback(
    async (id, assetData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.put(`/assets/${id}`, assetData);
        return res.data;
      } catch (err) {
        extractError(err, "Failed to update asset");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const deleteAsset = useCallback(
    async (id, reason = "") => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.delete(`/assets/${id}`, { data: { reason } });
        return res.data;
      } catch (err) {
        extractError(err, "Failed to delete asset");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const updateAssetStatus = useCallback(
    async (id, status, reason = "") => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.patch(`/assets/${id}/status`, { status, reason });
        return res.data;
      } catch (err) {
        extractError(err, "Failed to update asset status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const cloneAsset = useCallback(
    async (id, cloneData = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post(`/assets/${id}/clone`, cloneData);
        return res.data;
      } catch (err) {
        extractError(err, "Failed to clone asset");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  const getAssetClones = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assets/clones?page=${page}&limit=${limit}`);
        return res.data;
      } catch (err) {
        extractError(err, "Failed to fetch clones");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  return (
    <AssetContext.Provider
      value={{
        assets,
        assetStats,
        loading,
        pagination,
        error,
        setError,
        getAllAssets,
        getAssetById,
        createAsset,
        updateAsset,
        deleteAsset,
        cloneAsset,
        getAssetClones,
        updateAssetStatus,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};