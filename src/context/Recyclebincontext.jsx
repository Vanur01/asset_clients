// context/Recyclebincontext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const RecycleBinContext = createContext();

export const useRecycleBin = () => {
  const context = useContext(RecycleBinContext);
  if (!context) {
    throw new Error("useRecycleBin must be used within RecycleBinProvider");
  }
  return context;
};

export const RecycleBinProvider = ({ children }) => {
  const { authRequest, user } = useAuth();

  // Role-based access control
  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super_admin";
  const canAccess = isAdmin || isSuperAdmin; // Only admin and super_admin can access
  const isTeam = user?.role === "team";

  // ── Checklists state ────────────────────────────────────────────────────────
  const [deletedChecklists, setDeletedChecklists] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState(null);
  const [checklistPagination, setChecklistPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // ── Requests state ──────────────────────────────────────────────────────────
  const [deletedRequests, setDeletedRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestPagination, setRequestPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // ── Assignments state ───────────────────────────────────────────────────────
  const [deletedAssignments, setDeletedAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState(null);
  const [assignmentPagination, setAssignmentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    pages: 1,
  });

  const extractError = (err, fallback) => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.data?.error) return err.response.data.error;
    if (err?.response?.data?.details) return err.response.data.details;
    if (err?.message) return err.message;
    return fallback;
  };

  const validatePagination = (page, limit) => {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    return { page: validPage, limit: validLimit };
  };

  // ══════════════════ CHECKLISTS ══════════════════════════════════════════════

  const fetchDeletedChecklists = useCallback(
    async (page = 1, limit = 10) => {
      // Only admin and super_admin can access
      if (!canAccess) {
        console.log("Unauthorized access attempt to deleted checklists");
        setChecklistError(
          "You don't have permission to access deleted checklists",
        );
        return;
      }

      setChecklistLoading(true);
      setChecklistError(null);

      try {
        const { page: validPage, limit: validLimit } = validatePagination(
          page,
          limit,
        );

        console.log(
          `Fetching deleted checklists - Page: ${validPage}, Limit: ${validLimit}`,
        );

        const response = await authRequest(
          "GET",
          `/checklists/deleted/list?page=${validPage}&limit=${validLimit}`,
        );

        console.log("Deleted checklists response:", response);

        if (response?.success) {
          setDeletedChecklists(response.checklists || []);
          const total = response.pagination?.total || 0;
          const pages =
            response.pagination?.pages || Math.ceil(total / validLimit) || 1;
          setChecklistPagination({
            page: response.pagination?.page || validPage,
            limit: response.pagination?.limit || validLimit,
            total,
            pages,
          });
        } else {
          const errorMsg =
            response?.message || "Failed to fetch deleted checklists";
          setChecklistError(errorMsg);
          console.error("API returned error:", errorMsg);
        }
      } catch (err) {
        console.error("Fetch deleted checklists error:", err);

        if (err.response) {
          console.error("Error status:", err.response.status);
          console.error("Error data:", err.response.data);
          console.error("Error headers:", err.response.headers);
        }

        const errorMessage = extractError(
          err,
          "Failed to fetch deleted checklists",
        );
        setChecklistError(errorMessage);

        return { success: false, error: errorMessage };
      } finally {
        setChecklistLoading(false);
      }
    },
    [authRequest, canAccess],
  );

  const restoreChecklist = useCallback(
    async (id) => {
      if (!canAccess) return { success: false, error: "Permission denied" };
      if (!id) return { success: false, error: "Invalid checklist ID" };

      try {
        console.log(`Restoring checklist: ${id}`);
        const response = await authRequest(
          "PATCH",
          `/checklists/${id}/restore`,
        );

        console.log("Restore response:", response);

        if (response?.success) {
          await fetchDeletedChecklists();
          return { success: true };
        }
        return { success: false, error: response?.message || "Restore failed" };
      } catch (err) {
        console.error("Restore checklist error:", err);
        return { success: false, error: extractError(err, "Restore failed") };
      }
    },
    [authRequest, canAccess, fetchDeletedChecklists],
  );

  const permanentDeleteChecklist = useCallback(
    async (id) => {
      // Only super_admin can permanently delete
      if (!isSuperAdmin)
        return {
          success: false,
          error: "Only Super Admin can permanently delete items",
        };
      if (!id) return { success: false, error: "Invalid checklist ID" };

      try {
        console.log(`Permanently deleting checklist: ${id}`);
        const response = await authRequest(
          "DELETE",
          `/checklists/${id}/permanent`,
        );

        console.log("Delete response:", response);

        if (response?.success) {
          await fetchDeletedChecklists();
          return { success: true };
        }
        return { success: false, error: response?.message || "Delete failed" };
      } catch (err) {
        console.error("Permanent delete checklist error:", err);
        return { success: false, error: extractError(err, "Delete failed") };
      }
    },
    [authRequest, isSuperAdmin, fetchDeletedChecklists],
  );

  const bulkRestoreChecklists = useCallback(
    async (ids) => {
      if (!canAccess || !ids.length) {
        return {
          success: false,
          error: "No items selected or permission denied",
        };
      }
      try {
        const results = await Promise.all(
          ids.map((id) => restoreChecklist(id)),
        );
        const failed = results.filter((r) => !r.success);

        if (failed.length) {
          return {
            success: false,
            error: `${failed.length} item(s) failed to restore`,
            failedItems: failed,
          };
        }

        await fetchDeletedChecklists();
        return { success: true };
      } catch (err) {
        console.error("Bulk restore error:", err);
        return {
          success: false,
          error: extractError(err, "Bulk restore failed"),
        };
      }
    },
    [restoreChecklist, canAccess, fetchDeletedChecklists],
  );

  const bulkPermanentDeleteChecklists = useCallback(
    async (ids) => {
      if (!isSuperAdmin || !ids.length) {
        return {
          success: false,
          error: "Only Super Admin can permanently delete items",
        };
      }
      try {
        const results = await Promise.all(
          ids.map((id) => permanentDeleteChecklist(id)),
        );
        const failed = results.filter((r) => !r.success);

        if (failed.length) {
          return {
            success: false,
            error: `${failed.length} item(s) failed to delete`,
            failedItems: failed,
          };
        }

        await fetchDeletedChecklists();
        return { success: true };
      } catch (err) {
        console.error("Bulk delete error:", err);
        return {
          success: false,
          error: extractError(err, "Bulk delete failed"),
        };
      }
    },
    [permanentDeleteChecklist, isSuperAdmin, fetchDeletedChecklists],
  );

  // ══════════════════ REQUESTS ════════════════════════════════════════════════

  const fetchDeletedRequests = useCallback(
    async (page = 1, limit = 10) => {
      if (!canAccess) return;

      setRequestLoading(true);
      setRequestError(null);

      try {
        const { page: validPage, limit: validLimit } = validatePagination(
          page,
          limit,
        );

        const response = await authRequest(
          "GET",
          `/checklist-requests/deleted?page=${validPage}&limit=${validLimit}`,
        );

        if (response?.success) {
          setDeletedRequests(response.requests || []);
          const total = response.pagination?.total || 0;
          const pages =
            response.pagination?.totalPages ||
            Math.ceil(total / validLimit) ||
            1;
          setRequestPagination({
            page: response.pagination?.page || validPage,
            limit: response.pagination?.limit || validLimit,
            total,
            pages,
          });
        } else {
          setRequestError(
            response?.message || "Failed to fetch deleted requests",
          );
        }
      } catch (err) {
        console.error("Fetch deleted requests error:", err);
        setRequestError(extractError(err, "Failed to fetch deleted requests"));
      } finally {
        setRequestLoading(false);
      }
    },
    [authRequest, canAccess],
  );

  const restoreRequest = useCallback(
    async (id) => {
      if (!canAccess) return { success: false, error: "Permission denied" };
      try {
        const response = await authRequest(
          "PATCH",
          `/checklist-requests/${id}/restore`,
        );
        if (response?.success) {
          await fetchDeletedRequests();
          return { success: true };
        }
        return { success: false, error: response?.message || "Restore failed" };
      } catch (err) {
        console.error("Restore request error:", err);
        return { success: false, error: extractError(err, "Restore failed") };
      }
    },
    [authRequest, canAccess, fetchDeletedRequests],
  );

  const permanentDeleteRequest = useCallback(
    async (id) => {
      if (!isSuperAdmin)
        return {
          success: false,
          error: "Only Super Admin can permanently delete items",
        };
      try {
        const response = await authRequest(
          "DELETE",
          `/checklist-requests/${id}/permanent`,
        );
        if (response?.success) {
          await fetchDeletedRequests();
          return { success: true };
        }
        return { success: false, error: response?.message || "Delete failed" };
      } catch (err) {
        console.error("Permanent delete request error:", err);
        return { success: false, error: extractError(err, "Delete failed") };
      }
    },
    [authRequest, isSuperAdmin, fetchDeletedRequests],
  );

  // ══════════════════ ASSIGNMENTS ═════════════════════════════════════════════

  const fetchDeletedAssignments = useCallback(
    async (page = 1, limit = 10) => {
      if (!canAccess) return;

      setAssignmentLoading(true);
      setAssignmentError(null);

      try {
        const { page: validPage, limit: validLimit } = validatePagination(
          page,
          limit,
        );

        const response = await authRequest(
          "GET",
          `/assignments/deleted?page=${validPage}&limit=${validLimit}`,
        );

        if (response?.success) {
          setDeletedAssignments(response.assignments || []);
          const total = response.pagination?.total || 0;
          const totalPages =
            response.pagination?.totalPages ||
            Math.ceil(total / validLimit) ||
            1;
          setAssignmentPagination({
            page: response.pagination?.page || validPage,
            limit: response.pagination?.limit || validLimit,
            total,
            totalPages,
            pages: totalPages,
          });
        } else {
          setAssignmentError(
            response?.message || "Failed to fetch deleted assignments",
          );
        }
      } catch (err) {
        console.error("Fetch deleted assignments error:", err);
        setAssignmentError(
          extractError(err, "Failed to fetch deleted assignments"),
        );
      } finally {
        setAssignmentLoading(false);
      }
    },
    [authRequest, canAccess],
  );

  const restoreAssignment = useCallback(
    async (id) => {
      if (!canAccess) return { success: false, error: "Permission denied" };
      try {
        const response = await authRequest(
          "POST",
          `/assignments/${id}/restore`,
        );
        if (response?.success) {
          await fetchDeletedAssignments();
          return { success: true };
        }
        return { success: false, error: response?.message || "Restore failed" };
      } catch (err) {
        console.error("Restore assignment error:", err);
        return { success: false, error: extractError(err, "Restore failed") };
      }
    },
    [authRequest, canAccess, fetchDeletedAssignments],
  );

  const permanentDeleteAssignment = useCallback(
    async (id) => {
      if (!isSuperAdmin)
        return {
          success: false,
          error: "Only Super Admin can permanently delete items",
        };
      try {
        const response = await authRequest(
          "DELETE",
          `/assignments/${id}/permanent`,
        );
        if (response?.success) {
          await fetchDeletedAssignments();
          return { success: true };
        }
        return { success: false, error: response?.message || "Delete failed" };
      } catch (err) {
        console.error("Permanent delete assignment error:", err);
        return { success: false, error: extractError(err, "Delete failed") };
      }
    },
    [authRequest, isSuperAdmin, fetchDeletedAssignments],
  );

  const bulkRestoreAssignments = useCallback(
    async (ids) => {
      if (!canAccess || !ids.length) {
        return {
          success: false,
          error: "No items selected or permission denied",
        };
      }
      try {
        const results = await Promise.all(
          ids.map((id) => restoreAssignment(id)),
        );
        const failed = results.filter((r) => !r.success);

        if (failed.length) {
          return {
            success: false,
            error: `${failed.length} item(s) failed to restore`,
            failedItems: failed,
          };
        }

        await fetchDeletedAssignments();
        return { success: true };
      } catch (err) {
        console.error("Bulk restore assignments error:", err);
        return {
          success: false,
          error: extractError(err, "Bulk restore failed"),
        };
      }
    },
    [restoreAssignment, canAccess, fetchDeletedAssignments],
  );

  const bulkPermanentDeleteAssignments = useCallback(
    async (ids) => {
      if (!isSuperAdmin || !ids.length) {
        return {
          success: false,
          error: "Only Super Admin can permanently delete items",
        };
      }
      try {
        const results = await Promise.all(
          ids.map((id) => permanentDeleteAssignment(id)),
        );
        const failed = results.filter((r) => !r.success);

        if (failed.length) {
          return {
            success: false,
            error: `${failed.length} item(s) failed to delete`,
            failedItems: failed,
          };
        }

        await fetchDeletedAssignments();
        return { success: true };
      } catch (err) {
        console.error("Bulk delete assignments error:", err);
        return {
          success: false,
          error: extractError(err, "Bulk delete failed"),
        };
      }
    },
    [permanentDeleteAssignment, isSuperAdmin, fetchDeletedAssignments],
  );

  // ── Context value ───────────────────────────────────────────────────────────
  const value = {
    canAccess,
    isAdmin,
    isSuperAdmin,
    isTeam,

    // Checklists
    deletedChecklists,
    checklistLoading,
    checklistError,
    checklistPagination,
    fetchDeletedChecklists,
    restoreChecklist,
    permanentDeleteChecklist,
    bulkRestoreChecklists,
    bulkPermanentDeleteChecklists,

    // Requests
    deletedRequests,
    requestLoading,
    requestError,
    requestPagination,
    fetchDeletedRequests,
    restoreRequest,
    permanentDeleteRequest,

    // Assignments
    deletedAssignments,
    assignmentLoading,
    assignmentError,
    assignmentPagination,
    fetchDeletedAssignments,
    restoreAssignment,
    permanentDeleteAssignment,
    bulkRestoreAssignments,
    bulkPermanentDeleteAssignments,
  };

  return (
    <RecycleBinContext.Provider value={value}>
      {children}
    </RecycleBinContext.Provider>
  );
};
