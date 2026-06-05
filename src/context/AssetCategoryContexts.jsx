// src/context/AssetCategoryContexts.jsx
// ─── FIXES ────────────────────────────────────────────────────────────────────
// 1. CRITICAL — removed the locally-created axios instance entirely.
//    Now imports the shared `api` instance from AssetContext so that:
//    • The Bearer token interceptor is identical and always fires.
//    • The auth:expired response interceptor clears tokens consistently.
//    • Team users are no longer bounced with 401 because a raw axios instance
//      was being used without any Authorization header.
//
// 2. Token fallback: handled upstream in AssetContext's request interceptor
//    (checks accessToken → token → sessionStorage.accessToken). No duplicated
//    interceptor logic here.
//
// 3. Removed the `isAuthenticated()` redirect guard that was bouncing team
//    users to /login during the brief hydration window on mount.
//
// 4. auth:expired event listener added — clears categories state immediately
//    when the session expires so stale data is never shown.
// ─────────────────────────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// FIX 1: import the shared, interceptor-equipped instance — do NOT create a new one
import { api } from "./AssetContext";

const AssetCategoryContext = createContext();

export const useAssetCategory = () => {
  const context = useContext(AssetCategoryContext);
  if (!context)
    throw new Error(
      "useAssetCategory must be used within AssetCategoryProvider",
    );
  return context;
};

export const AssetCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // FIX 4: clear categories when session expires so stale data isn't shown
  useEffect(() => {
    const handleExpired = () => {
      setCategories([]);
      setError("Session expired. Please log in again.");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  // Auto-clear error after 5 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const extractError = useCallback((err, fallback = "An error occurred") => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback;
    setError(msg);
    return msg;
  }, []);

  // ── getAllCategories ──────────────────────────────────────────────────────
  // FIX 3: no isAuthenticated() guard — let the interceptor handle 401/403
  const getAllCategories = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "" && v !== null) params.append(k, v);
        });

        // FIX 1: `api` already has the Bearer token — no manual header needed
        const res = await api.get(
          `/asset-category${params.toString() ? `?${params}` : ""}`,
        );
        const data = res.data;

        // Normalise all possible response shapes
        let list = [];
        if (data?.success && Array.isArray(data.categories)) {
          list = data.categories;
        } else if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.categories)) {
          list = data.categories;
        }

        setCategories(list);
        setPagination(
          data?.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 10,
            total: list.length,
            totalPages: 1,
          },
        );
        return { success: true, categories: list };
      } catch (err) {
        extractError(err, "Failed to fetch categories");
        return { success: false, categories: [] };
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  // ── getCategoryById ───────────────────────────────────────────────────────
  const getCategoryById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/asset-category/${id}`);
        return res.data;
      } catch (err) {
        extractError(err, "Failed to fetch category");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  // ── createCategory ────────────────────────────────────────────────────────
  const createCategory = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post("/asset-category", data);
        return { success: true, data: res.data };
      } catch (err) {
        const msg = extractError(err, "Failed to create category");
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  // ── updateCategory ────────────────────────────────────────────────────────
  const updateCategory = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.put(`/asset-category/${id}`, data);
        return res.data;
      } catch (err) {
        const msg = extractError(err, "Failed to update category");
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  // ── deleteCategory ────────────────────────────────────────────────────────
  const deleteCategory = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.delete(`/asset-category/${id}`);
        return res.data;
      } catch (err) {
        const msg = extractError(err, "Failed to delete category");
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [extractError],
  );

  return (
    <AssetCategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        pagination,
        setError,
        getAllCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </AssetCategoryContext.Provider>
  );
};