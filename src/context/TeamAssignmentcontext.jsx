import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const TeamAssignmentContext = createContext();

export const useAssignment = () => {
  const ctx = useContext(TeamAssignmentContext);
  if (!ctx)
    throw new Error("useAssignment must be used within TeamAssignmentProvider");
  return ctx;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://assset-management-backend-4.onrender.com/api/v1";

const getApi = (token) =>
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

/* ─── helpers ─── */
const priorityMap = {
  high: { label: "High Priority", bg: "#ef4444", color: "#fff" },
  medium: { label: "Medium Priority", bg: "#0d3d52", color: "#fff" },
  low: { label: "Low Priority", bg: "#3b82f6", color: "#fff" },
  critical: { label: "Critical Priority", bg: "#7c3aed", color: "#fff" },
};

const statusMap = {
  pending: { label: "Pending", bg: "#dbeafe", color: "#1d4ed8" },
  assigned: { label: "Pending", bg: "#dbeafe", color: "#1d4ed8" },
  in_progress: { label: "In Progress", bg: "#0d3d52", color: "#fff" },
  submitted: { label: "Submitted", bg: "#374151", color: "#fff" },
  completed: { label: "Completed", bg: "#16a34a", color: "#fff" },
  approved: { label: "Approved", bg: "#15803d", color: "#fff" },
  rejected: { label: "Rejected", bg: "#dc2626", color: "#fff" },
  overdue: { label: "Overdue", bg: "#b91c1c", color: "#fff" },
};

export const transformAssignment = (a) => {
  const p = priorityMap[a.priority] || priorityMap.medium;
  const s = statusMap[a.status] || statusMap.pending;
  const checklist = a.checklist || {};
  const asset = a.assetDetails || {};

  return {
    id: a._id,
    _id: a._id,
    title: checklist.name || a.assetName || "Inspection Task",
    type: checklist.category || "Inspection",
    location: asset.location || "—",
    due: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "—",
    priority: p.label,
    priorityBg: p.bg,
    priorityColor: p.color,
    status: s.label,
    statusBg: s.bg,
    statusColor: s.color,
    btn:
      a.status === "in_progress" ? "Continue Inspection" : "Start Inspection",
    dot: a.priority === "high" || a.priority === "critical",
    critical: a.priority === "critical",
    assetName: a.assetName || "—",
    assetId: asset.assetId || "—",
    tagNumber: asset.tagNumber || "—",
    category: asset.category || "—",
    customerName: a.customerName || "—",
    assignedAt: a.assignedAt,
    submittedAt: a.submittedAt,
    completedAt: a.completedAt,
    completionRate: a.completionRate || 0,
    overallRating: a.overallRating || 0,
    inspectorNotes: a.inspectorNotes || "",
    additionalNotes: a.additionalNotes || "",
    isDraft: a.isDraft || false,
    responses: a.responses || [],
    attachments: a.attachments || [],
    uploadedPhotos: a.uploadedPhotos || [],
    signaturePath: a.signaturePath || null,
    checklist: checklist,
    rawStatus: a.status,
    submissionStatus: a.submissionStatus,
  };
};

/* ═══════════════════ PROVIDER ═══════════════════════════════════════════════ */
export const TeamAssignmentProvider = ({ children }) => {
  const { token } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    page: 1,
    limit: 20,
  });

  const abortRef = useRef(null);
  const mounted = useRef(false);

  /* ─── fetch list ─── */
  const fetchAssignments = useCallback(
    async (overrides = {}, force = false) => {
      if (!token) {
        console.log("No token available");
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const active = { ...filters, ...overrides };
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching assignments with params:", active);

        const params = new URLSearchParams({
          page: active.page,
          limit: active.limit,
        });
        if (active.status) params.append("status", active.status);
        if (active.priority) params.append("priority", active.priority);

        const response = await getApi(token).get(
          `/assignments`,
          {
            signal: abortRef.current.signal,
          },
        );

        console.log("Full API Response:", response);
        console.log("Response data:", response.data);
        console.log("Assignments array:", response.data?.assignments);

        if (response.data?.success) {
          const transformedAssignments = (response.data.assignments || []).map(
            transformAssignment,
          );
          console.log("Transformed assignments:", transformedAssignments);

          setAssignments(transformedAssignments);
          setStats(response.data.stats || null);
          setPagination(response.data.pagination || {});
          setFilters((prev) => ({
            ...prev,
            page: active.page,
            status: active.status,
            priority: active.priority,
          }));
        } else {
          console.log("API returned success false:", response.data);
        }
      } catch (e) {
        console.error("Fetch error:", e);
        if (e.name !== "CanceledError" && e.code !== "ERR_CANCELED") {
          setError(e.response?.data?.message || "Failed to fetch assignments");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, filters],
  );

  /* ─── fetch single detail ─── */
  const fetchAssignmentDetail = useCallback(
    async (id) => {
      if (!token || !id) return null;
      setDetailLoading(true);
      setError(null);
      try {
        const { data } = await getApi(token).get(`/assignments/${id}/details`);
        const raw = data._doc || data;
        const merged = {
          ...raw,
          checklist: raw.checklist?._doc || raw.checklist || {},
        };
        const transformed = transformAssignment(merged);
        setSelectedDetail(transformed);
        return transformed;
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch details");
        return null;
      } finally {
        setDetailLoading(false);
      }
    },
    [token],
  );

  /* ─── save draft ─── */
  const saveDraft = useCallback(
    async (id, payload) => {
      if (!token) return { success: false, error: "Not authenticated" };
      setSubmitting(true);
      try {
        const { data } = await getApi(token).post(
          `/assignments/${id}/draft`,
          payload,
        );
        return { success: data.success, message: data.message };
      } catch (e) {
        return {
          success: false,
          error: e.response?.data?.message || "Failed to save draft",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [token],
  );

  /* ─── submit (multipart) ─── */
  const submitAssignment = useCallback(
    async (id, formData) => {
      if (!token) return { success: false, error: "Not authenticated" };
      setSubmitting(true);
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/assignments/${id}/submit`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          },
        );
        if (data.success) {
          fetchAssignments({}, true);
        }
        return { success: data.success, message: data.message };
      } catch (e) {
        return {
          success: false,
          error: e.response?.data?.message || "Failed to submit",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [token, fetchAssignments],
  );

  /* ─── filter helpers ─── */
  const applyFilters = useCallback(
    (newFilters) => fetchAssignments({ ...newFilters, page: 1 }, true),
    [fetchAssignments],
  );

  const changePage = useCallback(
    (page) => fetchAssignments({ page }, true),
    [fetchAssignments],
  );

  const clearError = useCallback(() => setError(null), []);

  /* ─── initial load ─── */
  useEffect(() => {
    if (token && !mounted.current) {
      mounted.current = true;
      fetchAssignments({ page: 1 }, true);
    }
  }, [token, fetchAssignments]);

  useEffect(
    () => () => {
      if (abortRef.current) abortRef.current.abort();
    },
    [],
  );

  /* ─── computed stats for UI cards ─── */
  const uiStats = {
    total: stats?.total || assignments.length,
    pending: stats?.pending || 0,
    inProgress: stats?.inProgress || 0,
    overdue: stats?.overdue || 0,
    completed: stats?.completed || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0,
  };

  return (
    <TeamAssignmentContext.Provider
      value={{
        assignments,
        stats: uiStats,
        pagination,
        selectedDetail,
        loading,
        detailLoading,
        submitting,
        error,
        filters,
        fetchAssignments,
        fetchAssignmentDetail,
        saveDraft,
        submitAssignment,
        applyFilters,
        changePage,
        clearError,
        setSelectedDetail,
      }}
    >
      {children}
    </TeamAssignmentContext.Provider>
  );
};

// Also export default for convenience
export default TeamAssignmentProvider;
