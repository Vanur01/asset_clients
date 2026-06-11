// context/AssignmentContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const AssignmentContext = createContext();

export const useAssignment = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx)
    throw new Error("useAssignment must be used within AssignmentProvider");
  return ctx;
};

const useOpState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const clear = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);
  return { loading, setLoading, error, setError, success, setSuccess, clear };
};

export const AssignmentProvider = ({ children }) => {
  const { authRequest } = useAuth();

  const assign = useOpState();
  const fetch = useOpState();
  const del = useOpState();
  const restore = useOpState();
  const stats = useOpState();

  const extractError = (err, fallback) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;

  const fmtDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  };

  // 1. ASSIGN TO ADMIN  POST /assignments/assign-to-admin
  const assignToAdmin = useCallback(
    async (data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!data.checklistIds?.length)
          throw new Error("At least one checklist is required");
        if (!data.adminId) throw new Error("Admin ID is required");
        if (!data.dueDate) throw new Error("Due date is required");
        if (!data.priority) throw new Error("Priority is required");

        const payload = {
          checklistIds: data.checklistIds,
          adminId: data.adminId,
          dueDate: fmtDate(data.dueDate),
          priority: data.priority,
        };
        if (data.notes?.trim()) payload.notes = data.notes.trim();

        const res = await authRequest(
          "POST",
          "/assignments/assign-to-admin",
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Checklist(s) assigned to admin successfully!");
          return {
            success: true,
            data: res.assignment || res.data,
            message: res.message,
          };
        }
        const msg = res?.message || "Assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to assign to admin");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 2. ASSIGN TO TEAM  POST /assignments/assign-to-team
  const assignToTeam = useCallback(
    async (data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!data.teamMemberIds?.length)
          throw new Error("At least one team member is required");
        if (!data.dueDate) throw new Error("Due date is required");
        if (!data.priority) throw new Error("Priority is required");

        const hasChecklists = data.checklistIds?.length > 0;
        const hasAssets = data.assetIds?.length > 0;
        if (!hasChecklists && !hasAssets)
          throw new Error("At least one checklist or asset is required");

        const payload = {
          teamMemberIds: data.teamMemberIds,
          dueDate: fmtDate(data.dueDate),
          priority: data.priority,
        };
        if (hasChecklists) payload.checklistIds = data.checklistIds;
        if (hasAssets) payload.assetIds = data.assetIds;
        if (data.notes?.trim()) payload.notes = data.notes.trim();
        if (data.assignmentType) payload.assignmentType = data.assignmentType;

        const res = await authRequest(
          "POST",
          "/assignments/assign-to-team",
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Assignment created successfully!");
          return {
            success: true,
            data: res.assignment || res.data,
            message: res.message,
          };
        }
        const msg = res?.message || "Assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to assign to team");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 3. BULK ASSIGN TO TEAM
  const bulkAssignToTeam = useCallback(
    async (
      checklistIds,
      assetIds,
      teamMemberIds,
      dueDate,
      priority,
      notes = "",
    ) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        const promises = teamMemberIds.map((memberId) => {
          const payload = {
            teamMemberIds: [memberId],
            dueDate: fmtDate(dueDate),
            priority,
          };
          if (checklistIds?.length) payload.checklistIds = checklistIds;
          if (assetIds?.length) payload.assetIds = assetIds;
          if (notes?.trim()) payload.notes = notes.trim();
          return authRequest("POST", "/assignments/assign-to-team", payload);
        });
        const results = await Promise.all(promises);
        const failed = results.filter((r) => !r?.success);
        if (!failed.length) {
          assign.setSuccess(
            `${results.length} assignment(s) created successfully!`,
          );
          return { success: true, count: results.length };
        }
        const msg = `${failed.length} of ${results.length} assignments failed`;
        assign.setError(msg);
        return { success: false, error: msg, failedCount: failed.length };
      } catch (err) {
        const msg = extractError(err, "Failed to create bulk assignments");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 4. BULK ASSIGN TO ADMIN
  const bulkAssignToAdmin = useCallback(
    async (checklistIds, adminIds, dueDate, priority, notes = "") => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        const promises = adminIds.map((adminId) => {
          const payload = {
            checklistIds,
            adminId,
            dueDate: fmtDate(dueDate),
            priority,
          };
          if (notes?.trim()) payload.notes = notes.trim();
          return authRequest("POST", "/assignments/assign-to-admin", payload);
        });
        const results = await Promise.all(promises);
        const failed = results.filter((r) => !r?.success);
        if (!failed.length) {
          assign.setSuccess(
            `${results.length} assignment(s) created successfully!`,
          );
          return { success: true, count: results.length };
        }
        const msg = `${failed.length} of ${results.length} assignments failed`;
        assign.setError(msg);
        return { success: false, error: msg, failedCount: failed.length };
      } catch (err) {
        const msg = extractError(err, "Failed to create bulk assignments");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 5. GET ALL ASSIGNMENTS
  const getAssignments = useCallback(
    async (filters = {}) => {
      fetch.setLoading(true);
      fetch.setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page);
        if (filters.limit) params.append("limit", filters.limit);
        if (filters.status) params.append("status", filters.status);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.search) params.append("search", filters.search);
        if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
        if (filters.fromDate) params.append("fromDate", filters.fromDate);
        if (filters.toDate) params.append("toDate", filters.toDate);
        if (filters.assignmentType)
          params.append("assignmentType", filters.assignmentType);

        const url = `/assignments`;
        const res = await authRequest("GET", url);
        if (res?.success) {
          return {
            success: true,
            assignments: res.assignments || [],
            pagination: res.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
            stats: res.stats || null,
          };
        }
        const msg = res?.message || "Failed to fetch assignments";
        fetch.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch assignments");
        fetch.setError(msg);
        return { success: false, error: msg };
      } finally {
        fetch.setLoading(false);
      }
    },
    [authRequest],
  );

  // 6. GET BY ID
  const getAssignmentById = useCallback(
    async (assignmentId) => {
      fetch.setLoading(true);
      fetch.setError(null);
      try {
        if (!assignmentId) throw new Error("Assignment ID is required");
        const res = await authRequest("GET", `/assignments/${assignmentId}`);
        if (res?.success)
          return { success: true, assignment: res.assignment || res.data };
        const msg = res?.message || "Failed to fetch assignment";
        fetch.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch assignment details");
        fetch.setError(msg);
        return { success: false, error: msg };
      } finally {
        fetch.setLoading(false);
      }
    },
    [authRequest],
  );

  // 7. UPDATE STATUS
  const updateAssignmentStatus = useCallback(
    async (assignmentId, status) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        const res = await authRequest(
          "PATCH",
          `/assignments/${assignmentId}/status`,
          { status },
        );
        if (res?.success) {
          assign.setSuccess("Assignment status updated!");
          return { success: true, data: res.assignment || res.data };
        }
        const msg = res?.message || "Failed to update status";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to update assignment status");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 8. SOFT DELETE
  const softDeleteAssignment = useCallback(
    async (assignmentId) => {
      del.setLoading(true);
      del.setError(null);
      try {
        const res = await authRequest(
          "DELETE",
          `/assignments/${assignmentId}/soft`,
        );
        if (res?.success) {
          del.setSuccess("Assignment moved to trash!");
          return { success: true };
        }
        const msg = res?.message || "Failed to delete assignment";
        del.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to delete assignment");
        del.setError(msg);
        return { success: false, error: msg };
      } finally {
        del.setLoading(false);
      }
    },
    [authRequest],
  );

  // 9. RESTORE
  const restoreAssignment = useCallback(
    async (assignmentId) => {
      restore.setLoading(true);
      restore.setError(null);
      try {
        const res = await authRequest(
          "POST",
          `/assignments/${assignmentId}/restore`,
        );
        if (res?.success) {
          restore.setSuccess("Assignment restored!");
          return { success: true };
        }
        const msg = res?.message || "Failed to restore assignment";
        restore.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to restore assignment");
        restore.setError(msg);
        return { success: false, error: msg };
      } finally {
        restore.setLoading(false);
      }
    },
    [authRequest],
  );

  // 10. PERMANENT DELETE
  const permanentDeleteAssignment = useCallback(
    async (assignmentId) => {
      del.setLoading(true);
      del.setError(null);
      try {
        const res = await authRequest(
          "DELETE",
          `/assignments/${assignmentId}/permanent`,
        );
        if (res?.success) {
          del.setSuccess("Assignment permanently deleted!");
          return { success: true };
        }
        const msg = res?.message || "Failed to permanently delete assignment";
        del.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(
          err,
          "Failed to permanently delete assignment",
        );
        del.setError(msg);
        return { success: false, error: msg };
      } finally {
        del.setLoading(false);
      }
    },
    [authRequest],
  );

  // 12. DELETED LIST
  const getDeletedAssignments = useCallback(
    async (page = 1, limit = 10) => {
      fetch.setLoading(true);
      fetch.setError(null);
      try {
        const res = await authRequest(
          "GET",
          `/assignments/deleted?page=${page}&limit=${limit}`,
        );
        if (res?.success) {
          return {
            success: true,
            assignments: res.assignments || [],
            pagination: res.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
          };
        }
        const msg = res?.message || "Failed to fetch deleted assignments";
        fetch.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch deleted assignments");
        fetch.setError(msg);
        return { success: false, error: msg };
      } finally {
        fetch.setLoading(false);
      }
    },
    [authRequest],
  );

  // 13. REASSIGN TO ADMIN  PUT /assignments/:id/reassign-to-admin
  // FIX: field renamed from `adminId` → `newAdminId` to match API contract
  const reassignToAdmin = useCallback(
    async (assignmentId, data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!assignmentId) throw new Error("Assignment ID is required");
        if (!data.newAdminId) throw new Error("New Admin ID is required");
        if (!data.reason?.trim()) throw new Error("Reason is required");

        const payload = {
          newAdminId: data.newAdminId,
          reason: data.reason.trim(),
        };
        if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
        if (data.priority) payload.priority = data.priority;
        if (data.notes?.trim()) payload.notes = data.notes.trim();
        // Pass new checklists if provided
        if (data.newChecklistIds?.length)
          payload.newChecklistIds = data.newChecklistIds;

        const res = await authRequest(
          "PUT",
          `/assignments/${assignmentId}/reassign-to-admin`,
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Re-assigned to admin successfully!");
          return { success: true, data: res.assignment || res.data };
        }
        const msg = res?.message || "Re-assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to re-assign to admin");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 14. REASSIGN TO TEAM  PUT /assignments/:id/reassign-to-team
  // FIX: field renamed from `teamMemberIds` → `newTeamMemberIds`; added `newAssetIds` support
  const reassignToTeam = useCallback(
    async (assignmentId, data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!assignmentId) throw new Error("Assignment ID is required");
        if (!data.newTeamMemberIds?.length)
          throw new Error("At least one team member is required");
        if (!data.reason?.trim()) throw new Error("Reason is required");

        const payload = {
          newTeamMemberIds: data.newTeamMemberIds,
          reason: data.reason.trim(),
        };
        if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
        if (data.priority) payload.priority = data.priority;
        if (data.notes?.trim()) payload.notes = data.notes.trim();
        if (data.newAssetIds?.length) payload.newAssetIds = data.newAssetIds;
        if (data.newChecklistIds?.length)
          payload.newChecklistIds = data.newChecklistIds;

        const res = await authRequest(
          "PUT",
          `/assignments/${assignmentId}/reassign-to-team`,
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Re-assigned to team successfully!");
          return { success: true, data: res.assignment || res.data };
        }
        const msg = res?.message || "Re-assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to re-assign to team");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 15. SUMMARY
  const getAssignmentSummary = useCallback(async () => {
    fetch.setLoading(true);
    fetch.setError(null);
    try {
      const res = await authRequest("GET", "/assignments/summary");
      if (res?.success) {
        return {
          success: true,
          summary: res.summary || {
            totalActive: 0,
            overdue: 0,
            dueThisWeek: 0,
            completionRate: 0,
          },
        };
      }
      const msg = res?.message || "Failed to fetch summary";
      fetch.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch assignment summary");
      fetch.setError(msg);
      return { success: false, error: msg };
    } finally {
      fetch.setLoading(false);
    }
  }, [authRequest]);

  const clearAssign = assign.clear;
  const clearFetch = fetch.clear;
  const clearDelete = del.clear;
  const clearRestore = restore.clear;
  const clearStats = stats.clear;

  const clearAllStates = useCallback(() => {
    assign.clear();
    fetch.clear();
    del.clear();
    restore.clear();
    stats.clear();
  }, [assign, fetch, del, restore, stats]);

  const value = {
    assignLoading: assign.loading,
    assignError: assign.error,
    assignSuccess: assign.success,
    fetchLoading: fetch.loading,
    fetchError: fetch.error,
    deleteLoading: del.loading,
    deleteError: del.error,
    restoreLoading: restore.loading,
    restoreError: restore.error,
    statsLoading: stats.loading,
    statsError: stats.error,

    clearAssign,
    clearFetch,
    clearDelete,
    clearRestore,
    clearStats,
    clearAllStates,

    assignToAdmin,
    assignToTeam,
    bulkAssignToAdmin,
    bulkAssignToTeam,
    getAssignments,
    getAssignmentById,
    getDeletedAssignments,
    getAssignmentSummary,
    updateAssignmentStatus,
    softDeleteAssignment,
    restoreAssignment,
    permanentDeleteAssignment,
    reassignToAdmin,
    reassignToTeam,
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};

export default AssignmentContext;
