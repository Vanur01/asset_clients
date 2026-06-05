// context/RequestChecklistContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const RequestChecklistContext = createContext();

export const useRequestChecklist = () => {
  const context = useContext(RequestChecklistContext);
  if (!context) {
    throw new Error(
      "useRequestChecklist must be used within RequestChecklistProvider",
    );
  }
  return context;
};

export const RequestChecklistProvider = ({ children }) => {
  const { authRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ─── Submit new request with FormData (multipart/form-data) ───────────
  const submitRequest = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest(
          "POST",
          "/checklist-requests",
          formData,
          // Note: authRequest already handles FormData by removing Content-Type header
        );
        if (response?.success) {
          setSuccess("Checklist request submitted successfully!");
          return { success: true, data: response.data };
        }
        throw new Error(response?.message || "Failed to submit request");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit request";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Get all requests with filters/search/pagination ─────────────────
  const getAllRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append("status", filters.status);
        if (filters.urgencyLevel)
          queryParams.append("urgencyLevel", filters.urgencyLevel);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.page) queryParams.append("page", String(filters.page));
        if (filters.limit) queryParams.append("limit", String(filters.limit));
        if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
        if (filters.toDate) queryParams.append("toDate", filters.toDate);
        if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
        if (filters.sortOrder)
          queryParams.append("sortOrder", filters.sortOrder);

        const qs = queryParams.toString();
        const url = `/checklist-requests${qs ? `?${qs}` : ""}`;

        const response = await authRequest("GET", url);
        return { success: true, data: response?.data ?? response };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch requests";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Get my requests (current user only) ─────────────────────────────
  const getMyRequests = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.page) queryParams.append("page", String(filters.page));
        if (filters.limit) queryParams.append("limit", String(filters.limit));

        const qs = queryParams.toString();
        const url = `/checklist-requests/my-requests${qs ? `?${qs}` : ""}`;

        const response = await authRequest("GET", url);
        return { success: true, data: response?.data ?? response };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch your requests";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Get request by ID ────────────────────────────────────────────────
  const getRequestById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("GET", `/checklist-requests/${id}`);
        return { success: true, data: response?.data ?? response };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch request";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Get request statistics ───────────────────────────────────────────
  const getRequestStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest(
        "GET",
        "/checklist-requests/statistics/all",
      );
      return { success: true, data: response?.data ?? response };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch stats";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ─── Review request (Approve / Reject / Under Review) ────────────────
  const reviewRequest = useCallback(
    async (
      id,
      status,
      rejectionReason = null,
      resultingChecklistId = null,
      resultingChecklistName = null,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const body = { status };

        if (status === "rejected" && rejectionReason) {
          body.rejectionReason = rejectionReason;
        }

        if (status === "approved") {
          if (resultingChecklistId)
            body.resultingChecklistId = resultingChecklistId;
          if (resultingChecklistName)
            body.resultingChecklistName = resultingChecklistName;
        }

        const response = await authRequest(
          "PUT",
          `/checklist-requests/${id}/review`,
          body,
        );

        if (response?.success) {
          setSuccess(`Request ${status.replace("_", " ")} successfully!`);
          return { success: true, data: response.data };
        }
        throw new Error(response?.message || "Failed to review request");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to review request";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Bulk review requests ─────────────────────────────────────────────
  const bulkReviewRequests = useCallback(
    async (requestIds, status, rejectionReason = null) => {
      setLoading(true);
      setError(null);
      try {
        const body = { requestIds, status };
        if (rejectionReason) body.rejectionReason = rejectionReason;

        const response = await authRequest(
          "POST",
          "/checklist-requests/bulk/review",
          body,
        );

        if (response?.success) {
          setSuccess("Bulk review completed!");
          return { success: true, data: response.data };
        }
        throw new Error(response?.message || "Failed to bulk review");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to bulk review requests";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Cancel request ───────────────────────────────────────────────────
  const cancelRequest = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest(
          "PUT",
          `/checklist-requests/${id}/cancel`,
        );

        if (response?.success) {
          setSuccess("Request cancelled successfully!");
          return { success: true, data: response.data };
        }
        throw new Error(response?.message || "Failed to cancel request");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to cancel request";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Delete request ───────────────────────────────────────────────────
  const deleteRequest = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest(
          "DELETE",
          `/checklist-requests/${id}`,
        );

        if (response?.success) {
          setSuccess("Request deleted successfully!");
          return { success: true };
        }
        throw new Error(response?.message || "Failed to delete request");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete request";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // ─── Download file from request ───────────────────────────────────────
  const downloadRequestFile = useCallback(
    async (requestId, fileId, fileName) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:9001/api/v1"}/checklist-requests/${requestId}/files/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "file";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
      } catch (err) {
        const errorMsg = err.message || "Failed to download file";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Clear messages ───────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = {
    loading,
    error,
    success,
    submitRequest,
    getAllRequests,
    getMyRequests,
    getRequestById,
    getRequestStats,
    reviewRequest,
    bulkReviewRequests,
    cancelRequest,
    deleteRequest,
    downloadRequestFile,
    clearMessages,
  };

  return (
    <RequestChecklistContext.Provider value={value}>
      {children}
    </RequestChecklistContext.Provider>
  );
};
