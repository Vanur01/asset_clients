// context/ContactInquiryContext.jsx
// API endpoints aligned with Postman spec:
//   POST   /contact              – public, no auth
//   GET    /contact/             – admin, bearer token
//   GET    /contact/:id          – admin, bearer token
//   DELETE /contact/:id          – admin, bearer token

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const ContactInquiryContext = createContext();

export const useContactInquiry = () => {
  const ctx = useContext(ContactInquiryContext);
  if (!ctx)
    throw new Error(
      "useContactInquiry must be used within a ContactInquiryProvider",
    );
  return ctx;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9001/api/v1";

export const ContactInquiryProvider = ({ children }) => {
  const { token } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const cache = useRef(new Map());

  /* ── Auth headers ── */
  const authHeaders = useCallback(() => {
    const t =
      token ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");
    return {
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    };
  }, [token]);

  /* ───────────────────────────────────────────
   * PUBLIC – Submit contact inquiry
   * POST /contact
   * ─────────────────────────────────────────── */
  const submitContactInquiry = useCallback(async (formData) => {
    setActionLoading(true);
    setError(null);
    try {
      const { data, status } = await axios.post(
        `${API_BASE_URL}/contact`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\s/g, ""),
          message: formData.message.trim(),
        },
        { headers: { "Content-Type": "application/json" }, timeout: 30_000 },
      );

      if (data?.success || status === 200 || status === 201) {
        return {
          success: true,
          message:
            data.message ||
            "Inquiry submitted! A confirmation email has been sent.",
          data,
        };
      }
      return {
        success: false,
        error: data?.message || "Failed to submit inquiry",
      };
    } catch (err) {
      const msg = networkErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ───────────────────────────────────────────
   * ADMIN – Fetch all inquiries
   * GET /contact/
   * ─────────────────────────────────────────── */
  const fetchInquiries = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page, limit, ...filters });
        const { data } = await axios.get(
          `${API_BASE_URL}/contact/?${params}`,
          authHeaders(),
        );

        // Handle both possible response shapes
        const contacts =
          data?.pagination?.contacts ?? data?.data ?? data?.contacts ?? [];

        const total = data?.pagination?.total ?? data?.total ?? contacts.length;

        const totalPages =
          data?.pagination?.totalPages ?? Math.ceil(total / limit);

        setInquiries(contacts);
        setPagination({
          total,
          page: data?.pagination?.page ?? page,
          limit,
          totalPages,
        });
        return { success: true, data };
      } catch (err) {
        const msg = networkErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [authHeaders],
  );

  /* ───────────────────────────────────────────
   * ADMIN – Fetch single inquiry
   * GET /contact/:id
   * ─────────────────────────────────────────── */
  const fetchInquiryById = useCallback(
    async (id) => {
      if (cache.current.has(id)) {
        const cached = cache.current.get(id);
        setSelectedInquiry(cached);
        return { success: true, data: cached };
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/contact/${id}`,
          authHeaders(),
        );

        const inquiry = data?.data ?? data;
        setSelectedInquiry(inquiry);
        cache.current.set(id, inquiry);
        return { success: true, data: inquiry };
      } catch (err) {
        const msg = networkErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [authHeaders],
  );

  /* ───────────────────────────────────────────
   * ADMIN – Delete inquiry
   * DELETE /contact/:id
   * ─────────────────────────────────────────── */
  const deleteInquiry = useCallback(
    async (id) => {
      setActionLoading(true);
      setError(null);
      try {
        const { data, status } = await axios.delete(
          `${API_BASE_URL}/contact/${id}`,
          authHeaders(),
        );

        if (data?.success || status === 200) {
          setInquiries((prev) => prev.filter((i) => i._id !== id));
          cache.current.delete(id);
          setSelectedInquiry((prev) => (prev?._id === id ? null : prev));
          return {
            success: true,
            message: data?.message || "Inquiry deleted successfully",
          };
        }
        return {
          success: false,
          error: data?.message || "Failed to delete inquiry",
        };
      } catch (err) {
        const msg = networkErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setActionLoading(false);
      }
    },
    [authHeaders],
  );

  /* ───────────────────────────────────────────
   * ADMIN – Bulk delete (parallel)
   * DELETE /contact/:id × N
   * ─────────────────────────────────────────── */
  const bulkDeleteInquiries = useCallback(
    async (ids) => {
      setActionLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled(
          ids.map((id) =>
            axios.delete(`${API_BASE_URL}/contact/${id}`, authHeaders()),
          ),
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const bad = results.filter((r) => r.status === "rejected").length;

        setInquiries((prev) => prev.filter((i) => !ids.includes(i._id)));
        ids.forEach((id) => cache.current.delete(id));

        if (bad > 0) {
          return {
            success: false,
            partial: true,
            message: `Deleted ${ok}/${ids.length} inquiries. ${bad} failed.`,
          };
        }
        return {
          success: true,
          message: `Successfully deleted ${ok} inquiries`,
        };
      } catch (err) {
        const msg = networkErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setActionLoading(false);
      }
    },
    [authHeaders],
  );

  /* ── Utilities ── */
  const clearSelectedInquiry = useCallback(() => setSelectedInquiry(null), []);
  const clearError = useCallback(() => setError(null), []);
  const clearCache = useCallback(() => cache.current.clear(), []);

  const value = {
    inquiries,
    selectedInquiry,
    pagination,
    loading,
    actionLoading,
    error,

    submitContactInquiry,
    fetchInquiries,
    fetchInquiryById,
    deleteInquiry,
    bulkDeleteInquiries,

    clearSelectedInquiry,
    clearError,
    clearCache,
  };

  return (
    <ContactInquiryContext.Provider value={value}>
      {children}
    </ContactInquiryContext.Provider>
  );
};

/* ── Shared error helper ── */
function networkErrorMessage(err) {
  if (err.code === "ECONNABORTED")
    return "Request timed out. Please try again.";
  if (err.response)
    return err.response.data?.message || "Server error. Please try again.";
  if (err.request) return "Cannot reach server. Check your connection.";
  return err.message || "An unexpected error occurred.";
}
