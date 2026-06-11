// src/context/TeamAssignmentContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const TeamAssignmentContext = createContext();

export const useTeamAssignment = () => {
  const ctx = useContext(TeamAssignmentContext);
  if (!ctx)
    throw new Error("useTeamAssignment must be used within TeamAssignmentProvider");
  return ctx;
};

export const TeamAssignmentProvider = ({ children }) => {
  const { authRequest } = useAuth();

  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  // ── GET /assignments/my-tasks ─────────────────────────────────────────────
  // Response shape: { success, message, tasks[], pagination, stats? }
  // Each task has: checklists[], assets[], assetIds[], checklistData[], assignedBy, ...
  const fetchMyTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.append("status",   filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.search)   params.append("search",   filters.search);
      if (filters.page)     params.append("page",     String(filters.page));
      if (filters.limit)    params.append("limit",    String(filters.limit || 20));

      const url = `/assignments/my-tasks${params.toString() ? `?${params}` : ""}`;
      const response = await authRequest("GET", url);

      if (response?.success) {
        return {
          success:    true,
          // API key is "tasks" per confirmed response
          tasks:      response.tasks      || response.assignments || [],
          pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
          stats:      response.stats      || null,
        };
      }
      throw new Error(response?.message || "Failed to fetch tasks");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /assignments/my-tasks/:assignmentId ───────────────────────────────
  // API returns the full assignment object directly at the top level.
  // Keys confirmed: _id, checklistIds[], checklistData[], assetIds[], assets[],
  //                 assignedBy, status, priority, dueDate, notes, ...
  // Fields live at: checklistIds[0].fields[]
  // Full asset at:  assetIds[0]
  const fetchTaskById = useCallback(async (assignmentId) => {
    if (!assignmentId || assignmentId === "undefined" || assignmentId === "null") {
      return { success: false, error: "Invalid assignment ID" };
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("GET", `/assignments/my-tasks/${assignmentId}`);

      // The API returns the assignment object directly (success + all fields at root level).
      // Guard: if success is explicitly false, treat as error.
      if (response?.success === false) {
        throw new Error(response?.message || "Failed to fetch task details");
      }

      // Normalise: unwrap if the API ever wraps it, otherwise use root directly.
      const task = response?.assignment ?? response?.task ?? response?.data ?? response;

      // Sanity-check we got an actual task object (must have _id)
      if (!task?._id) {
        throw new Error("Unexpected response format from server");
      }

      return { success: true, task };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── POST /assignments/:assignmentId/submit ────────────────────────────────
  // Body: multipart/form-data
  //   responses   — JSON string of { [fieldId]: value }
  //   notes       — string (optional)
  //   attachments — file(s) (optional)
  //   inspectorName  — string
  //   inspectorEmail — string
  const submitAssignment = useCallback(async (assignmentId, formData) => {
    if (!assignmentId || assignmentId === "undefined" || assignmentId === "null") {
      return { success: false, error: "Invalid assignment ID" };
    }
    setSubmitting(true);
    setError(null);
    try {
      // Accept either a pre-built FormData or a plain object
      const payload = formData instanceof FormData
        ? formData
        : (() => {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            return fd;
          })();

      const response = await authRequest(
        "POST",
        `/assignments/${assignmentId}/submit`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response?.success) {
        return {
          success:    true,
          submission: response.submission || response.data,
          message:    response.message    || "Assignment submitted successfully",
        };
      }
      throw new Error(response?.message || "Failed to submit assignment");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, [authRequest]);

  // ── GET /assignments/my-inspections ──────────────────────────────────────
  const fetchInspectionHistory = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest(
        "GET",
        `/assignments/my-inspections?page=${page}&limit=${limit}`,
      );
      if (response?.success) {
        return {
          success:     true,
          inspections: response.inspections || response.data || [],
          pagination:  response.pagination  || { page: 1, limit: 10, total: 0, totalPages: 1 },
        };
      }
      throw new Error(response?.message || "Failed to fetch inspection history");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /assignments/my-inspections/:submissionId ────────────────────────
  const fetchInspectionById = useCallback(async (submissionId) => {
    if (!submissionId || submissionId === "undefined" || submissionId === "null") {
      return { success: false, error: "Invalid inspection ID" };
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest(
        "GET",
        `/assignments/my-inspections/${submissionId}`,
      );
      if (response?.success) {
        return {
          success:    true,
          inspection: response.inspection || response.data,
          assignment: response.assignment || null,
        };
      }
      throw new Error(response?.message || "Failed to fetch inspection details");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /assignments/my-inspections/:submissionId/export?format=pdf|excel ─
  const exportInspection = useCallback(async (submissionId, format = "pdf") => {
    if (!submissionId || submissionId === "undefined" || submissionId === "null") {
      return { success: false, error: "Invalid inspection ID" };
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest(
        "GET",
        `/assignments/my-inspections/${submissionId}/export?format=${format}`,
      );
      if (response?.success) {
        return { success: true, data: response.data, url: response.url };
      }
      throw new Error(response?.message || "Failed to export inspection");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <TeamAssignmentContext.Provider
      value={{
        loading,
        submitting,
        error,
        clearError,
        fetchMyTasks,
        fetchTaskById,
        submitAssignment,
        fetchInspectionHistory,
        fetchInspectionById,
        exportInspection,
      }}
    >
      {children}
    </TeamAssignmentContext.Provider>
  );
};

export default TeamAssignmentProvider;