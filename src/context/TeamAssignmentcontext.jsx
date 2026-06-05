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

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

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
  critical: { label: "Extremely Critical", bg: "#f472b6", color: "#fff" },
  high:     { label: "High Priority",      bg: "#ef4444", color: "#fff" },
  medium:   { label: "Medium Priority",    bg: "#f97316", color: "#fff" },
  low:      { label: "Low Priority",       bg: "#3b82f6", color: "#fff" },
};

const statusMap = {
  pending:     { label: "Pending",     bg: "#dbeafe", color: "#1d4ed8" },
  assigned:    { label: "Pending",     bg: "#dbeafe", color: "#1d4ed8" },
  in_progress: { label: "In Progress", bg: "#22c55e", color: "#fff"    },
  submitted:   { label: "Submitted",   bg: "#374151", color: "#fff"    },
  completed:   { label: "Completed",   bg: "#16a34a", color: "#fff"    },
  approved:    { label: "Approved",    bg: "#15803d", color: "#fff"    },
  rejected:    { label: "Rejected",    bg: "#dc2626", color: "#fff"    },
  overdue:     { label: "Overdue",     bg: "#9ca3af", color: "#fff"    },
};

export const transformAssignment = (a) => {
  const priority = a.priority || "medium";
  const p = priorityMap[priority] || priorityMap.medium;
  const status = a.status || "pending";
  const s = statusMap[status] || statusMap.pending;

  const checklist = a.checklist || {};
  const assetEntry = Array.isArray(a.assets) && a.assets.length > 0
    ? a.assets[0]
    : {};

  return {
    id: a._id,
    _id: a._id,
    title: checklist.name || checklist.title || a.checklistName || "Inspection Task",
    type: checklist.type || checklist.category || "Inspection",
    location: assetEntry.assetLocation || a.location || "—",
    assetName: assetEntry.assetName || a.assetName || "—",
    assetId: assetEntry.assetId?._id || assetEntry.assetId || "—",
    tagNumber: assetEntry.assetTagNumber || "—",
    category: assetEntry.assetCategory || "—",
    due: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "—",
    priority: p.label,
    priorityBg: p.bg,
    priorityColor: p.color,
    status: s.label,
    statusBg: s.bg,
    statusColor: s.color,
    btn: status === "in_progress" ? "Continue Inspection" : "Start Inspection",
    dot: priority === "high" || priority === "critical",
    critical: priority === "critical",
    customerName: a.customerName || a.customerId?.customerName || "—",
    assignedAt: a.assignedAt,
    submittedAt: a.submittedAt,
    completedAt: a.completedAt,
    completionRate: a.completionRate || 0,
    overallRating: a.overallRating || 0,
    inspectorNotes: a.inspectorNotes || "",
    additionalNotes: a.additionalNotes || a.notes || "",
    isDraft: a.isDraft || false,
    responses: a.responses || [],
    attachments: a.attachments || [],
    uploadedPhotos: a.uploadedPhotos || [],
    signaturePath: a.signaturePath || null,
    checklist,
    rawStatus: status,
    submissionStatus: a.submissionStatus,
  };
};

// Transform inspection history data
export const transformInspectionHistory = (submission) => {
  const asset = submission.assets?.[0]?.assetName || 
                submission.checklist?.name || 
                'N/A';
  
  let score = null;
  if (submission.completionRate) {
    score = Math.round(submission.completionRate);
  } else if (submission.overallRating) {
    score = Math.round(submission.overallRating * 20);
  }
  
  const inspector = submission.assignedToTeamMembers?.[0]?.name || 
                   submission.assignedBy?.name || 
                   'Unknown';
  
  return {
    id: submission._id,
    asset: asset,
    formType: submission.checklistName || 'Inspection Form',
    date: submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A',
    status: submission.submissionStatus || submission.status,
    score: score,
    inspector: inspector,
    rawData: submission
  };
};

/* ═══════════════════ PROVIDER ═══════════════════════════════════════════════ */
export const TeamAssignmentProvider = ({ children }) => {
  const { token } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
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
    limit: 12,
  });

  // Inspection history state
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
    needsRevision: 0,
    avgScore: 0,
  });
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  const abortRef = useRef(null);
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  /* ─── fetch list ─── */
  const fetchAssignments = useCallback(
    async (overrides = {}) => {
      if (!token) return;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const active = { ...filtersRef.current, ...overrides };
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ 
          page: active.page, 
          limit: active.limit 
        });
        if (active.status)   params.append("status",   active.status);
        if (active.priority) params.append("priority", active.priority);

        const response = await getApi(token).get(
          `/assignments?${params.toString()}`,
          { signal: abortRef.current.signal }
        );

        if (response.data?.success) {
          const raw = response.data.assignments || response.data.data || [];
          const transformed = raw.map(transformAssignment);
          setAssignments(transformed);

          const apiStats = response.data.stats || {};
          setStats({
            total:      apiStats.total      ?? transformed.length,
            pending:    apiStats.pending    ?? 0,
            inProgress: apiStats.inProgress ?? apiStats.in_progress ??
              transformed.filter((a) => a.rawStatus === "in_progress").length,
            overdue:    apiStats.overdue    ?? 0,
          });

          const pg = response.data.pagination || {};
          setPagination({
            page:       pg.page       || active.page,
            limit:      pg.limit      || active.limit,
            total:      pg.total      || transformed.length,
            totalPages: pg.totalPages || pg.pages || 1,
          });

          setFilters((prev) => ({
            ...prev,
            page:     active.page,
            status:   active.status,
            priority: active.priority,
          }));
        } else {
          setAssignments([]);
        }
      } catch (e) {
        if (e.name !== "CanceledError" && e.code !== "ERR_CANCELED") {
          setError(e.response?.data?.message || "Failed to fetch assignments");
          setAssignments([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  /* ─── fetch inspection history ─── */
  const fetchInspectionHistory = useCallback(
    async (page = 1, statusFilter = 'all', searchQuery = '') => {
      if (!token) return;

      setHistoryLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page,
          limit: 20,
        });
        
        if (statusFilter && statusFilter !== 'all') {
          params.append("status", statusFilter);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await getApi(token).get(
          `/assignments/history?${params.toString()}`
        );

        if (response.data?.success) {
          const transformed = response.data.submissions.map(transformInspectionHistory);
          setInspectionHistory(transformed);
          setHistoryStats(response.data.stats);
          setHistoryPagination(response.data.pagination);
        } else {
          setInspectionHistory([]);
          setHistoryStats({
            total: 0,
            approved: 0,
            rejected: 0,
            underReview: 0,
            needsRevision: 0,
            avgScore: 0,
          });
        }
      } catch (e) {
        console.error('Error fetching inspection history:', e);
        setError(e.response?.data?.message || "Failed to fetch inspection history");
        setInspectionHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [token],
  );

  /* ─── fetch single detail ─── */
  const fetchAssignmentDetail = useCallback(
    async (id) => {
      if (!token || !id) return null;
      setDetailLoading(true);
      setError(null);
      try {
        const { data } = await getApi(token).get(`/assignments/${id}/details`);
        const transformed = transformAssignment(data);
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

  /* ─── get assignment by id ─── */
  const getAssignmentById = useCallback(
    async (id) => {
      if (!token || !id) return null;
      try {
        const { data } = await getApi(token).get(`/assignments/${id}`);
        return data;
      } catch (e) {
        console.error('Error fetching assignment:', e);
        return null;
      }
    },
    [token],
  );

  /* ─── get checklist analytics ─── */
  const getChecklistAnalytics = useCallback(
    async (checklistId) => {
      if (!token || !checklistId) return null;
      try {
        const { data } = await getApi(token).get(`/assignments/checklist/${checklistId}/analytics`);
        return data;
      } catch (e) {
        console.error('Error fetching analytics:', e);
        return null;
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
        const cleanPayload = {
          responses: payload.responses || [],
          inspectorNotes: payload.inspectorNotes || "",
          notes: payload.additionalNotes || "",
          overallRating: payload.overallRating || 0,
        };
        
        const { data } = await getApi(token).post(`/assignments/${id}/draft`, cleanPayload);
        return { success: true, message: data.message || "Draft saved successfully" };
      } catch (e) {
        return { 
          success: false, 
          error: e.response?.data?.message || "Failed to save draft" 
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
              "Content-Type": "multipart/form-data" 
            },
            withCredentials: true,
          },
        );
        
        if (data.success) {
          await fetchAssignments({});
          return { success: true, message: data.message || "Submitted successfully" };
        }
        return { success: false, error: data.message || "Submission failed" };
      } catch (e) {
        return { 
          success: false, 
          error: e.response?.data?.message || "Failed to submit" 
        };
      } finally {
        setSubmitting(false);
      }
    },
    [token, fetchAssignments],
  );

  /* ─── filter helpers ─── */
  const applyFilters = useCallback(
    (newFilters) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
      fetchAssignments({ ...newFilters, page: 1 });
    },
    [fetchAssignments],
  );

  const changePage = useCallback(
    (page) => {
      setFilters((prev) => ({ ...prev, page }));
      fetchAssignments({ page });
    },
    [fetchAssignments],
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (token) fetchAssignments({ page: 1 });
  }, [token, fetchAssignments]);

  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  return (
    <TeamAssignmentContext.Provider
      value={{
        assignments,
        stats,
        pagination,
        selectedDetail,
        loading,
        detailLoading,
        submitting,
        error,
        filters,
        fetchAssignments,
        fetchAssignmentDetail,
        getAssignmentById,
        getChecklistAnalytics,
        saveDraft,
        submitAssignment,
        applyFilters,
        changePage,
        clearError,
        setSelectedDetail,
        inspectionHistory,
        historyStats,
        historyPagination,
        historyLoading,
        fetchInspectionHistory,
      }}
    >
      {children}
    </TeamAssignmentContext.Provider>
  );
};

export default TeamAssignmentProvider;