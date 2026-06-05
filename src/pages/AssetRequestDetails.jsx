// pages/AssetRequestDetails.jsx — Fully redesigned + all APIs integrated
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Tooltip,
  Paper,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Link as LinkIcon,
  HourglassEmpty,
  DoneAll,
  ContentCopy,
  ChildCare,
  Email,
  AccountTree,
  Person,
  CalendarToday,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  Inventory2,
  Warning,
} from "@mui/icons-material";
import { useAssetRequest } from "../context/AssetRequestContext";
import { useAuth } from "../context/AuthContexts";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f0f4f7",
  surface: "#ffffff",
  border: "#e2e8ef",
  teal: "#124640",
  tealDark: "#063f38",
  tealLight: "#e6f4f2",
  tealMid: "#cce9e6",
  text: "#0d1b2a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  red: "#dc2626",
  redBg: "#fef2f2",
  green: "#059669",
  greenBg: "#ecfdf5",
  amber: "#d97706",
  amberBg: "#fffbeb",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  orange: "#ea580c",
};

// ─── Styled ───────────────────────────────────────────────────────────────────
const PageWrap = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: C.bg,
  paddingBottom: 60,
  animation: `${fadeUp} 0.3s ease both`,
}));

const TopBar = styled(Box)({
  background: C.surface,
  borderBottom: `1px solid ${C.border}`,
  padding: "12px 28px",
  display: "flex",
  width:"1140px",
  marginLeft:"25px",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  position: "sticky",
  top: 0,
  zIndex: 200,
  backdropFilter: "blur(8px)",
  borderRadius: "12px",
  "@media (max-width:600px)": { padding: "10px 14px" },
});

const ContentWrap = styled(Box)(({ theme }) => ({
  padding: "24px 28px",
  [theme.breakpoints.down("sm")]: { padding: "16px 14px" },
}));

const SectionCard = styled(Paper)({
  borderRadius: 14,
  width:"560px",
  border: `1px solid ${C.border}`,
  overflow: "hidden",
  boxShadow: "none",
  marginBottom: 16,
  background: C.surface,
});

const SectionHead = styled(Box)({
  padding: "12px 18px",
  borderBottom: `1px solid ${C.border}`,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const SectionTitle = ({ icon, children }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: C.textMuted,
      display: "flex",
      alignItems: "center",
      gap: 0.8,
    }}
  >
    {icon && React.cloneElement(icon, { sx: { fontSize: 15 } })}
    {children}
  </Typography>
);

const InfoRow = ({ label, children, noBorder }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      py: 1.75,
      px: 2.25,
      borderBottom: noBorder ? "none" : `1px solid ${C.border}`,
      flexWrap: "wrap",
      gap: 1,
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 700,
        color: C.textMuted,
        minWidth: 140,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        pt: 0.2,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        flex: 1,
        minWidth: 160,
        fontSize: 13.5,
        fontWeight: 500,
        color: C.text,
      }}
    >
      {children}
    </Box>
  </Box>
);

// ─── Status / chip helpers ────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    bg: C.amberBg,
    color: C.amber,
    icon: <HourglassEmpty sx={{ fontSize: 13 }} />,
    label: "Pending",
  },
  approved: {
    bg: C.greenBg,
    color: C.green,
    icon: <CheckCircle sx={{ fontSize: 13 }} />,
    label: "Approved",
  },
  rejected: {
    bg: C.redBg,
    color: C.red,
    icon: <Cancel sx={{ fontSize: 13 }} />,
    label: "Rejected",
  },
  completed: {
    bg: C.blueBg,
    color: C.blue,
    icon: <DoneAll sx={{ fontSize: 13 }} />,
    label: "Completed",
  },
};

const StatusChip = ({ status }) => {
  const c = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  return (
    <Chip
      icon={c.icon}
      label={c.label}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 26,
        "& .MuiChip-icon": { color: c.color },
        borderRadius: "20px",
      }}
    />
  );
};

const TYPE_COLORS = {
  transfer: "#6366f1",
  maintenance: "#f59e0b",
  repair: "#ef4444",
  checkout: "#10b981",
  other: "#94a3b8",
};
const TypeChip = ({ type }) => {
  const color = TYPE_COLORS[type] || "#94a3b8";
  return (
    <Chip
      label={type || "other"}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 26,
        textTransform: "capitalize",
        border: `1px solid ${color}28`,
      }}
    />
  );
};

const URGENCY_CFG = {
  low: { bg: "#f1f5f9", color: "#64748b" },
  medium: { bg: C.amberBg, color: C.amber },
  high: { bg: "#fff7ed", color: C.orange },
  critical: { bg: C.redBg, color: C.red },
};
const UrgencyChip = ({ urgency }) => {
  const c = URGENCY_CFG[urgency] || URGENCY_CFG.medium;
  return (
    <Chip
      label={urgency || "medium"}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: 26,
        textTransform: "capitalize",
      }}
    />
  );
};

// ─── Copyable ID ──────────────────────────────────────────────────────────────
const CopyId = ({ id, full }) => {
  const [copied, setCopied] = useState(false);
  if (!id || id === "—")
    return (
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 13, color: C.textMuted }}
      >
        —
      </Typography>
    );
  const display = full ? id : id?.slice(-12);
  return (
    <Stack direction="row" alignItems="center" spacing={0.8}>
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 13, color: C.textSub }}
      >
        {display}
      </Typography>
      <Tooltip title={copied ? "Copied!" : "Copy ID"}>
        <IconButton
          size="small"
          sx={{ p: 0.4 }}
          onClick={() => {
            navigator.clipboard?.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          <ContentCopy
            sx={{ fontSize: 12, color: copied ? C.green : C.textMuted }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

// ─── Timeline dot ─────────────────────────────────────────────────────────────
const TimelineDot = ({ color, label, date, active }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: active ? color : C.border,
          mt: 0.3,
          boxShadow: active ? `0 0 0 3px ${color}28` : "none",
        }}
      />
    </Box>
    <Box sx={{ pb: 2 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: active ? color : C.textMuted,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, color: C.textMuted }}>{date}</Typography>
    </Box>
  </Stack>
);

// ─── Approve Dialog ───────────────────────────────────────────────────────────
function ApproveDialog({ open, onClose, onSubmit, submitting }) {
  const [notes, setNotes] = useState("");
  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: C.greenBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle sx={{ color: C.green, fontSize: 20 }} />
          </Box>
          Approve Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>
          This will approve the request and notify the requester.
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label="Approval Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for the requester…"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(notes)}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: C.green,
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Approve Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Reject Dialog ────────────────────────────────────────────────────────────
function RejectDialog({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    if (!reason.trim()) {
      setErr("Rejection reason is required");
      return;
    }
    setErr("");
    onSubmit(reason);
  };
  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: C.redBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cancel sx={{ color: C.red, fontSize: 20 }} />
          </Box>
          Reject Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Alert
          severity="warning"
          sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}
        >
          This action cannot be undone. Please provide a clear reason.
        </Alert>
        {err && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
            {err}
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          label="Reason for Rejection *"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setErr("");
          }}
          placeholder="Explain why this request is being rejected…"
          required
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handle}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Reject Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Link Asset Dialog ────────────────────────────────────────────────────────
function LinkAssetDialog({ open, onClose, onSubmit, submitting }) {
  const [assetId, setAssetId] = useState("");
  const [rel, setRel] = useState("accessory");
  const [err, setErr] = useState("");
  const handle = () => {
    if (!assetId.trim()) {
      setErr("Asset ID is required");
      return;
    }
    setErr("");
    onSubmit(assetId.trim(), rel);
  };
  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: C.greenBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinkIcon sx={{ color: C.green, fontSize: 20 }} />
          </Box>
          Link Asset to Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {err && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
            {err}
          </Alert>
        )}
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            size="small"
            label="Child Asset ID *"
            value={assetId}
            onChange={(e) => {
              setAssetId(e.target.value);
              setErr("");
            }}
            placeholder="Enter the MongoDB _id of the asset"
            helperText="You can find the asset ID on the Assets page"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "monospace",
              },
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Relationship Type</InputLabel>
            <Select
              value={rel}
              onChange={(e) => setRel(e.target.value)}
              label="Relationship Type"
              sx={{ borderRadius: 2 }}
            >
              {["accessory", "component", "spare", "dependency"].map((r) => (
                <MenuItem
                  key={r}
                  value={r}
                  sx={{ textTransform: "capitalize" }}
                >
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handle}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: C.green,
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Link Asset"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Create Child Request Dialog ──────────────────────────────────────────────
function CreateChildDialog({ open, onClose, onSubmit, submitting, parentId }) {
  const [form, setForm] = useState({
    requestType: "maintenance",
    description: "",
    urgency: "medium",
  });
  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: C.blueBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountTree sx={{ color: C.blue, fontSize: 20 }} />
          </Box>
          Add Child Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
          Parent:{" "}
          <code style={{ fontFamily: "monospace" }}>
            {parentId?.slice(-12)}
          </code>
        </Alert>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Request Type</InputLabel>
              <Select
                value={form.requestType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, requestType: e.target.value }))
                }
                label="Request Type"
                sx={{ borderRadius: 2 }}
              >
                {["transfer", "maintenance", "repair", "checkout", "other"].map(
                  (t) => (
                    <MenuItem
                      key={t}
                      value={t}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {t}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Urgency</InputLabel>
              <Select
                value={form.urgency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, urgency: e.target.value }))
                }
                label="Urgency"
                sx={{ borderRadius: 2 }}
              >
                {["low", "medium", "high", "critical"].map((u) => (
                  <MenuItem
                    key={u}
                    value={u}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {u}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Describe this child task…"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: C.blue,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Create Child"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getRequestById,
    approveRequest,
    rejectRequest,
    linkAsset,
    createChildRequest,
  } = useAssetRequest();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [request, setRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog states
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [linkedExpanded, setLinkedExpanded] = useState(true);
  const [childrenExpanded, setChildrenExpanded] = useState(true);

  const userIsAdmin = isAdmin?.() || user?.role === "admin";

  const showSnack = (msg, sev = "success") =>
    setSnack({ open: true, message: msg, severity: sev });

  const fmt = (iso, withTime = false) => {
    if (!iso) return "—";
    try {
      const opts = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      };
      return new Date(iso).toLocaleString("en-US", opts);
    } catch {
      return "—";
    }
  };

  const fetchRequest = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const data = await getRequestById(id);
      const req =
        data?.request ||
        data?.data?.request ||
        (data?._id ? data : null) ||
        data?.data;
      if (!req) throw new Error("Request not found");
      setRequest(req);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load request";
      setError(msg);
      showSnack(msg, "error");
    } finally {
      setInitialLoading(false);
    }
  }, [id, getRequestById]);

  useEffect(() => {
    if (id) fetchRequest();
  }, [fetchRequest, id]);

  const handleApprove = async (notes) => {
    setSubmitting(true);
    try {
      await approveRequest(id, notes);
      showSnack("Request approved successfully");
      setApproveOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(err?.response?.data?.message || "Failed to approve", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    setSubmitting(true);
    try {
      await rejectRequest(id, reason);
      showSnack("Request rejected");
      setRejectOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(err?.response?.data?.message || "Failed to reject", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLink = async (childAssetId, relationshipType) => {
    setSubmitting(true);
    try {
      await linkAsset(id, childAssetId, relationshipType);
      showSnack("Asset linked successfully");
      setLinkOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(
        err?.response?.data?.message || "Failed to link asset",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChild = async (formData) => {
    setSubmitting(true);
    try {
      await createChildRequest(id, formData);
      showSnack("Child request created successfully");
      setChildOpen(false);
      await fetchRequest();
    } catch (err) {
      showSnack(
        err?.response?.data?.message || "Failed to create child request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requesterInitial = useMemo(
    () => request?.requestedBy?.email?.charAt(0).toUpperCase() || "?",
    [request],
  );
  const isPending = request?.status?.toLowerCase() === "pending";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <PageWrap>
        <TopBar>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate("/admin/asset-requests")}
              sx={{ border: `1px solid ${C.border}`, borderRadius: 2 }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Skeleton width={200} height={24} />
          </Stack>
        </TopBar>
        <ContentWrap>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={140}
                  sx={{ mb: 2, borderRadius: 2 }}
                />
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={140}
                  sx={{ mb: 2, borderRadius: 2 }}
                />
              ))}
            </Grid>
          </Grid>
        </ContentWrap>
      </PageWrap>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <PageWrap>
        <TopBar>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate("/admin/asset-requests")}
              sx={{ border: `1px solid ${C.border}`, borderRadius: 2 }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Typography fontWeight={700}>Asset Request Details</Typography>
          </Stack>
        </TopBar>
        <ContentWrap>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/asset-requests")}
            sx={{ borderRadius: 2 }}
          >
            Go Back
          </Button>
        </ContentWrap>
      </PageWrap>
    );
  }

  if (!request) return null;

  // ── Asset name helper ────────────────────────────────────────────────────────
  const assetName = request.assetId?.name || request.assetId?.assetName || "—";
  const assetId =
    request.assetId?._id ||
    (typeof request.assetId === "string" ? request.assetId : "—");

  return (
    <>
      {/* ── Top Bar ── */}
      <TopBar>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flex={1}
          minWidth={0}
        >
          <IconButton
            onClick={() => navigate("/admin/asset-requests")}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <ArrowBack sx={{ fontSize: 17 }} />
          </IconButton>
          <Box minWidth={0}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                Request Details
              </Typography>
              <StatusChip status={request.status} />
              {request.isChildRequest && (
                <Chip
                  label="Child"
                  size="small"
                  icon={<ChildCare sx={{ fontSize: 11 }} />}
                  sx={{
                    height: 24,
                    fontSize: 11,
                    bgcolor: C.blueBg,
                    color: C.blue,
                  }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: 11,
                color: C.textMuted,
                mt: 0.3,
              }}
            >
              ID: {request._id}
            </Typography>
          </Box>
        </Stack>

        {/* Admin action buttons */}
        {userIsAdmin && (
          <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
            <Tooltip title="Add Child Request">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AccountTree sx={{ fontSize: 16 }} />}
                onClick={() => setChildOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  borderColor: C.blue,
                  color: C.blue,
                  "&:hover": { borderColor: C.blue, bgcolor: C.blueBg },
                }}
              >
                {!isMobile && "Child"}
              </Button>
            </Tooltip>
            <Tooltip title="Link Asset">
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
                onClick={() => setLinkOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  borderColor: C.green,
                  color: C.green,
                  "&:hover": { borderColor: C.green, bgcolor: C.greenBg },
                }}
              >
                {!isMobile && "Link Asset"}
              </Button>
            </Tooltip>
            {isPending && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<Cancel sx={{ fontSize: 16 }} />}
                  onClick={() => setRejectOpen(true)}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {!isMobile && "Reject"}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                  onClick={() => setApproveOpen(true)}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    bgcolor: C.green,
                    "&:hover": { bgcolor: "#047857" },
                  }}
                >
                  {!isMobile && "Approve"}
                </Button>
              </>
            )}
          </Stack>
        )}
      </TopBar>

      <ContentWrap>
        <Grid container spacing={2}>
          {/* ── Main column ── */}
          <Grid item xs={12} md={8}>
            {/* Requester card */}
            <SectionCard>
              <Box
                sx={{
                  p: 2.5,
                  background: `linear-gradient(135deg, ${C.tealLight} 0%, #f8fffd 100%)`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: C.teal,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {requesterInitial}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={800} fontSize={16} color={C.text}>
                      {request.requestedBy?.email?.split("@")[0] ||
                        "Unknown User"}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                      mt={0.4}
                    >
                      <Email sx={{ fontSize: 13, color: C.textMuted }} />
                      <Typography sx={{ fontSize: 12.5, color: C.textSub }}>
                        {request.requestedBy?.email || "No email provided"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: C.textMuted,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Submitted
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.text,
                        mt: 0.3,
                      }}
                    >
                      {fmt(request.createdAt, true)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </SectionCard>

            {/* Asset info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<Inventory2 />}>
                  Asset Information
                </SectionTitle>
              </SectionHead>
              <InfoRow label="Asset Name">
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  {assetName}
                </Typography>
              </InfoRow>
              <InfoRow label="Asset ID">
                <CopyId id={assetId} />
              </InfoRow>
              <InfoRow label="Asset Status">
                {request.assetId?.status ? (
                  <Chip
                    label={request.assetId.status}
                    size="small"
                    sx={{
                      bgcolor:
                        request.assetId.status === "Active"
                          ? C.greenBg
                          : C.amberBg,
                      color:
                        request.assetId.status === "Active" ? C.green : C.amber,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                    —
                  </Typography>
                )}
              </InfoRow>
              {request.assetId?.serialNumber && (
                <InfoRow label="Serial Number">
                  <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
                    {request.assetId.serialNumber}
                  </Typography>
                </InfoRow>
              )}
              {request.assetId?.currentLocation && (
                <InfoRow label="Location" noBorder>
                  <Typography sx={{ fontSize: 13 }}>
                    {request.assetId.currentLocation}
                  </Typography>
                </InfoRow>
              )}
            </SectionCard>

            {/* Request info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<InfoOutlined />}>
                  Request Information
                </SectionTitle>
              </SectionHead>
              <InfoRow label="Request Type">
                <TypeChip type={request.requestType} />
              </InfoRow>
              <InfoRow label="Urgency">
                <UrgencyChip urgency={request.urgency} />
              </InfoRow>
              <InfoRow label="Status">
                <StatusChip status={request.status} />
              </InfoRow>
              <InfoRow label="Description">
                <Typography
                  sx={{
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: request.description ? C.text : C.textMuted,
                  }}
                >
                  {request.description || "No description provided"}
                </Typography>
              </InfoRow>

              {request.metadata?.approvalNotes && (
                <InfoRow label="Approval Notes">
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: C.greenBg,
                      borderRadius: 2,
                      border: `1px solid ${C.green}28`,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 13, color: "#047857", lineHeight: 1.6 }}
                    >
                      {request.metadata.approvalNotes}
                    </Typography>
                  </Paper>
                </InfoRow>
              )}

              {request.rejectionReason && (
                <InfoRow label="Rejection Reason" noBorder>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: C.redBg,
                      borderRadius: 2,
                      border: `1px solid ${C.red}28`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Warning
                        sx={{
                          fontSize: 16,
                          color: C.red,
                          mt: 0.2,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{ fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}
                      >
                        {request.rejectionReason}
                      </Typography>
                    </Stack>
                  </Paper>
                </InfoRow>
              )}
            </SectionCard>

            {/* Linked Assets */}
            <SectionCard>
              <SectionHead
                sx={{ cursor: "pointer" }}
                onClick={() => setLinkedExpanded((p) => !p)}
              >
                <SectionTitle icon={<LinkIcon />}>
                  Linked Assets
                  {request.metadata?.childAssets?.length > 0 && (
                    <Chip
                      label={request.metadata.childAssets.length}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: 10,
                        bgcolor: C.greenBg,
                        color: C.green,
                      }}
                    />
                  )}
                </SectionTitle>
                <IconButton size="small">
                  {linkedExpanded ? (
                    <ExpandLess sx={{ fontSize: 18 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </SectionHead>
              <Collapse in={linkedExpanded}>
                {!request.metadata?.childAssets?.length ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                      No assets linked yet
                    </Typography>
                    {userIsAdmin && (
                      <Button
                        size="small"
                        startIcon={<LinkIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setLinkOpen(true)}
                        sx={{
                          mt: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: 12,
                          color: C.green,
                          border: `1px solid ${C.green}`,
                          "&:hover": { bgcolor: C.greenBg },
                        }}
                      >
                        Link an Asset
                      </Button>
                    )}
                  </Box>
                ) : (
                  request.metadata.childAssets.map((asset, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        borderBottom:
                          idx < request.metadata.childAssets.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: C.greenBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Inventory2 sx={{ fontSize: 16, color: C.green }} />
                          </Box>
                          <Box>
                            <CopyId
                              id={
                                typeof asset.assetId === "string"
                                  ? asset.assetId
                                  : asset.assetId?._id
                              }
                            />
                            <Typography
                              sx={{ fontSize: 11, color: C.textMuted }}
                            >
                              {fmt(asset.linkedAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={asset.relationshipType || "related"}
                            size="small"
                            sx={{
                              textTransform: "capitalize",
                              fontSize: 11,
                              height: 22,
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Collapse>
            </SectionCard>

            {/* Child Requests */}
            <SectionCard>
              <SectionHead
                sx={{ cursor: "pointer" }}
                onClick={() => setChildrenExpanded((p) => !p)}
              >
                <SectionTitle icon={<AccountTree />}>
                  Child Requests
                  {request.childRequests?.length > 0 && (
                    <Chip
                      label={request.childRequests.length}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: 10,
                        bgcolor: C.blueBg,
                        color: C.blue,
                      }}
                    />
                  )}
                </SectionTitle>
                <IconButton size="small">
                  {childrenExpanded ? (
                    <ExpandLess sx={{ fontSize: 18 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </SectionHead>
              <Collapse in={childrenExpanded}>
                {!request.childRequests?.length ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                      No child requests yet
                    </Typography>
                    {userIsAdmin && (
                      <Button
                        size="small"
                        startIcon={<AccountTree sx={{ fontSize: 14 }} />}
                        onClick={() => setChildOpen(true)}
                        sx={{
                          mt: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: 12,
                          color: C.blue,
                          border: `1px solid ${C.blue}`,
                          "&:hover": { bgcolor: C.blueBg },
                        }}
                      >
                        Add Child Request
                      </Button>
                    )}
                  </Box>
                ) : (
                  request.childRequests.map((child, idx) => {
                    const cId = typeof child === "string" ? child : child._id;
                    const cType =
                      typeof child === "object" ? child.requestType : "—";
                    const cStatus =
                      typeof child === "object" ? child.status : "pending";
                    const cUrgency =
                      typeof child === "object" ? child.urgency : null;
                    return (
                      <Box
                        key={idx}
                        sx={{
                          px: 2.5,
                          py: 1.75,
                          borderBottom:
                            idx < request.childRequests.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                          cursor:
                            typeof child === "object" ? "pointer" : "default",
                          "&:hover": { bgcolor: "#f8fffe" },
                        }}
                        onClick={() =>
                          typeof child === "object" &&
                          navigate(`/admin/asset-requests/${cId}`)
                        }
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: C.blueBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ChildCare sx={{ fontSize: 16, color: C.blue }} />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  color: C.textSub,
                                }}
                              >
                                #{cId?.slice(-12)}
                              </Typography>
                              {typeof child === "object" && (
                                <Typography
                                  sx={{ fontSize: 11, color: C.textMuted }}
                                >
                                  {fmt(child.createdAt)}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            {cType !== "—" && <TypeChip type={cType} />}
                            {cUrgency && <UrgencyChip urgency={cUrgency} />}
                            <StatusChip status={cStatus} />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Collapse>
            </SectionCard>
          </Grid>

          {/* ── Sidebar ── */}
          <Grid item xs={12} md={4}>
            {/* Timeline */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<CalendarToday />}>Timeline</SectionTitle>
              </SectionHead>
              <Box sx={{ p: 2.5 }}>
                <TimelineDot
                  color={C.teal}
                  label="Request Created"
                  date={fmt(request.createdAt, true)}
                  active={true}
                />
                <TimelineDot
                  color={C.green}
                  label="Approved"
                  date={
                    request.approvedAt
                      ? fmt(request.approvedAt, true)
                      : "Not yet"
                  }
                  active={!!request.approvedAt}
                />
                <TimelineDot
                  color={C.blue}
                  label="Completed"
                  date={
                    request.completedAt
                      ? fmt(request.completedAt, true)
                      : "Not yet"
                  }
                  active={!!request.completedAt}
                />
                <TimelineDot
                  color={C.textMuted}
                  label="Last Updated"
                  date={fmt(request.updatedAt, true)}
                  active={true}
                />
              </Box>
            </SectionCard>

            {/* Approval info */}
            {(request.approvedBy || request.approvedAt) && (
              <SectionCard>
                <SectionHead>
                  <SectionTitle icon={<CheckCircle />}>Approval</SectionTitle>
                </SectionHead>
                {request.approvedBy?.email && (
                  <InfoRow label="Approved By">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 26,
                          height: 26,
                          bgcolor: C.teal,
                          fontSize: 11,
                        }}
                      >
                        {request.approvedBy.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontSize: 13 }}>
                        {request.approvedBy.email}
                      </Typography>
                    </Stack>
                  </InfoRow>
                )}
                <InfoRow label="Approved At" noBorder>
                  <Typography
                    sx={{ fontSize: 13, color: C.green, fontWeight: 600 }}
                  >
                    {fmt(request.approvedAt, true)}
                  </Typography>
                </InfoRow>
              </SectionCard>
            )}

            {/* Additional info */}
            <SectionCard>
              <SectionHead>
                <SectionTitle icon={<Person />}>Additional Info</SectionTitle>
              </SectionHead>
              <InfoRow label="Admin ID">
                <CopyId
                  id={
                    typeof request.adminId === "string"
                      ? request.adminId
                      : request.adminId?._id
                  }
                />
              </InfoRow>
              <InfoRow label="Is Child">
                <Chip
                  label={request.isChildRequest ? "Yes" : "No"}
                  size="small"
                  sx={{
                    bgcolor: request.isChildRequest ? C.blueBg : "#f1f5f9",
                    color: request.isChildRequest ? C.blue : C.textMuted,
                    fontSize: 11,
                    height: 22,
                  }}
                />
              </InfoRow>
              <InfoRow label="Parent Request">
                {request.parentRequestId ? (
                  <Box
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const pid =
                        typeof request.parentRequestId === "string"
                          ? request.parentRequestId
                          : request.parentRequestId?._id;
                      navigate(`/admin/asset-requests/${pid}`);
                    }}
                  >
                    <CopyId
                      id={
                        typeof request.parentRequestId === "string"
                          ? request.parentRequestId
                          : request.parentRequestId?._id
                      }
                    />
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                    —
                  </Typography>
                )}
              </InfoRow>
              <InfoRow label="Child Count">
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                  {request.childRequests?.length || 0}
                </Typography>
              </InfoRow>
              <InfoRow label="Linked Assets" noBorder>
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                  {request.metadata?.childAssets?.length || 0}
                </Typography>
              </InfoRow>
            </SectionCard>

            {/* Completion info */}
            {(request.completedAt || request.completionNotes) && (
              <SectionCard>
                <SectionHead>
                  <SectionTitle icon={<DoneAll />}>Completion</SectionTitle>
                </SectionHead>
                {request.completedAt && (
                  <InfoRow label="Completed At">
                    <Typography
                      sx={{ fontSize: 13, color: C.blue, fontWeight: 600 }}
                    >
                      {fmt(request.completedAt, true)}
                    </Typography>
                  </InfoRow>
                )}
                {request.completionNotes && (
                  <InfoRow label="Notes" noBorder>
                    <Typography sx={{ fontSize: 13 }}>
                      {request.completionNotes}
                    </Typography>
                  </InfoRow>
                )}
              </SectionCard>
            )}
          </Grid>
        </Grid>

        {/* Bottom action row */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
          mt={3}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/asset-requests")}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600 }}
          >
            ← Back to List
          </Button>
          {userIsAdmin && isPending && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setRejectOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setApproveOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: C.green,
                  "&:hover": { bgcolor: "#047857" },
                }}
              >
                Approve
              </Button>
            </>
          )}
        </Stack>
      </ContentWrap>

      {/* ── Dialogs ── */}
      <ApproveDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onSubmit={handleApprove}
        submitting={submitting}
      />
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
        submitting={submitting}
      />
      <LinkAssetDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onSubmit={handleLink}
        submitting={submitting}
      />
      <CreateChildDialog
        open={childOpen}
        onClose={() => setChildOpen(false)}
        onSubmit={handleCreateChild}
        submitting={submitting}
        parentId={id}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
