// pages/AssetRequests.jsx — Fully redesigned + all APIs integrated (No delete/update)
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Avatar,
  Skeleton,
  Card,
  CardContent,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  DoneAll,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Add,
  AccountTree,
  Link as LinkIcon,
  FiberNew,
  TrendingUp,
  Inventory2,
  DevicesOther,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAssetRequest } from "../context/AssetRequestContext";
import { useAuth } from "../context/AuthContexts";
import { useAsset } from "../context/AssetContext";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  teal: "#0c4740",
  tealDark: "#063f38",
  tealLight: "#e6f4f2",
  tealMid: "#cce9e6",
  bg: "#f0f4f7",
  surface: "#ffffff",
  border: "#e2e8ef",
  text: "#0d1b2a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  amber: "#d97706",
  amberBg: "#fffbeb",
  green: "#059669",
  greenBg: "#ecfdf5",
  red: "#dc2626",
  redBg: "#fef2f2",
  blue: "#0e4a43",
  blueBg: "#eff6ff",
  orange: "#ea580c",
  orangeBg: "#fff7ed",
};

// ─── Styled components ────────────────────────────────────────────────────────
const PageWrap = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  padding: "28px 32px 60px",
  animation: `${fadeSlideIn} 0.3s ease both`,
  [theme.breakpoints.down("sm")]: { padding: "16px 12px 40px" },
}));

const PageTitle = styled(Typography)({
  fontWeight: 800,
  color: T.text,
  letterSpacing: "-0.3px",
});

const StatCard = styled(Card)(({ accent }) => ({
  borderRadius: 14,
  border: `1px solid ${T.border}`,
  boxShadow: "none",
  borderTop: accent ? `3px solid ${accent}` : `1px solid ${T.border}`,
  transition: "transform 0.18s, box-shadow 0.18s",
  cursor: "default",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
  },
}));

const ActionBtn = styled(Button)(({ variant: v }) => ({
  borderRadius: 10,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
  padding: "8px 18px",
  ...(v === "contained" && {
    background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 100%)`,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(10,97,87,0.25)",
    "&:hover": {
      background: `linear-gradient(135deg, ${T.tealDark} 0%, #042922 100%)`,
    },
  }),
}));

const FilterPaper = styled(Paper)({
  borderRadius: 12,
  border: `1px solid ${T.border}`,
  boxShadow: "none",
  padding: "14px 18px",
  marginBottom: 20,
  background: T.surface,
});

const StyledTable = styled(TableContainer)({
  borderRadius: 12,
  border: `1px solid ${T.border}`,
  boxShadow: "none",
  background: T.surface,
});

// ─── Status chips ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    bg: T.amberBg,
    color: T.amber,
    icon: <HourglassEmpty sx={{ fontSize: 13 }} />,
    label: "Pending",
  },
  approved: {
    bg: T.greenBg,
    color: T.green,
    icon: <CheckCircle sx={{ fontSize: 13 }} />,
    label: "Approved",
  },
  rejected: {
    bg: T.redBg,
    color: T.red,
    icon: <Cancel sx={{ fontSize: 13 }} />,
    label: "Rejected",
  },
  completed: {
    bg: T.blueBg,
    color: T.blue,
    icon: <DoneAll sx={{ fontSize: 13 }} />,
    label: "Completed",
  },
};

const StatusChip = ({ status }) => {
  const c = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
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
      }}
    />
  );
};

const URGENCY_CONFIG = {
  low: { bg: "#f1f5f9", color: "#64748b" },
  medium: { bg: T.amberBg, color: T.amber },
  high: { bg: T.orangeBg, color: T.orange },
  critical: { bg: T.redBg, color: T.red },
};
const UrgencyChip = ({ urgency }) => {
  const c = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.medium;
  return (
    <Chip
      label={urgency || "medium"}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        textTransform: "capitalize",
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
const RequestTypeChip = ({ type }) => {
  const color = TYPE_COLORS[type] || "#94a3b8";
  return (
    <Chip
      label={type || "other"}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
        textTransform: "capitalize",
        border: `1px solid ${color}28`,
      }}
    />
  );
};

// ─── Asset Status color helper ─────────────────────────────────────────────────
const assetStatusColor = (status) => {
  const map = {
    Available: T.green,
    "In Use": T.blue,
    "In Maintenance": T.amber,
    Retired: T.red,
    Lost: T.red,
    Disposed: "#94a3b8",
  };
  return map[status] || "#94a3b8";
};

// ─── Create Parent Request Dialog ─────────────────────────────────────────────
function CreateParentDialog({ open, onClose, onSuccess }) {
  const { createParentRequest } = useAssetRequest();
  const { getAllAssets, assets, loading: assetsLoading } = useAsset();
  const [form, setForm] = useState({
    assetId: "",
    requestType: "transfer",
    description: "",
    urgency: "medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assetSearch, setAssetSearch] = useState("");

  useEffect(() => {
    if (open) {
      getAllAssets({ limit: 200 });
      setAssetSearch("");
      setError("");
    }
  }, [open]);

  // Filter assets by search term
  const filteredAssets = assets.filter((a) => {
    const name = (a.name || a.assetName || "").toLowerCase();
    const tag = (a.assetTag || a.serialNumber || "").toLowerCase();
    const q = assetSearch.toLowerCase();
    return name.includes(q) || tag.includes(q) || a._id?.includes(q);
  });

  const selectedAsset = assets.find((a) => a._id === form.assetId);

  const handleSubmit = async () => {
    if (!form.assetId) {
      setError("Please select an asset");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createParentRequest(form);
      onSuccess("Parent request created successfully");
      onClose();
      setForm({
        assetId: "",
        requestType: "transfer",
        description: "",
        urgency: "medium",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create request"
      );
    } finally {
      setSubmitting(false);
    }
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
              bgcolor: T.tealLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Add sx={{ color: T.teal, fontSize: 20 }} />
          </Box>
          New Asset Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2.5}>
          {/* Asset selector with search */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color={T.textSub}
              sx={{ display: "block", mb: 0.75 }}
            >
              Select Asset *
            </Typography>

            {/* Search box */}
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name, tag, or ID..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 17, color: T.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Asset list */}
            <Box
              sx={{
                border: `1px solid ${T.border}`,
                borderRadius: 2,
                maxHeight: 220,
                overflowY: "auto",
                bgcolor: T.surface,
              }}
            >
              {assetsLoading ? (
                <Stack spacing={1} p={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={44} sx={{ borderRadius: 1.5 }} />
                  ))}
                </Stack>
              ) : filteredAssets.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <DevicesOther sx={{ fontSize: 32, color: T.textMuted, mb: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    {assetSearch ? "No assets match your search" : "No assets found"}
                  </Typography>
                </Box>
              ) : (
                filteredAssets.map((a) => {
                  const name = a.name || a.assetName || "Unnamed Asset";
                  const tag = a.assetTag || a.serialNumber || "";
                  const statusColor = assetStatusColor(a.status);
                  const isSelected = form.assetId === a._id;

                  return (
                    <Box
                      key={a._id}
                      onClick={() => setForm((p) => ({ ...p, assetId: a._id }))}
                      sx={{
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        borderBottom: `1px solid ${T.border}`,
                        bgcolor: isSelected ? T.tealLight : "transparent",
                        borderLeft: isSelected
                          ? `3px solid ${T.teal}`
                          : "3px solid transparent",
                        transition: "all 0.15s",
                        "&:hover": {
                          bgcolor: isSelected ? T.tealLight : "#f8fffe",
                        },
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          bgcolor: isSelected ? T.tealMid : T.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Inventory2
                          sx={{
                            fontSize: 16,
                            color: isSelected ? T.teal : T.textMuted,
                          }}
                        />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="body2"
                          fontWeight={isSelected ? 700 : 600}
                          color={isSelected ? T.teal : T.text}
                          noWrap
                        >
                          {name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {tag && (
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: T.textMuted,
                                fontFamily: "monospace",
                              }}
                            >
                              {tag}
                            </Typography>
                          )}
                          <Typography
                            sx={{
                              fontSize: 10,
                              color: T.textMuted,
                              fontFamily: "monospace",
                            }}
                          >
                            #{a._id?.slice(-8)}
                          </Typography>
                        </Stack>
                      </Box>
                      <Chip
                        label={a.status || "Unknown"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          color: statusColor,
                          bgcolor: `${statusColor}18`,
                          border: `1px solid ${statusColor}28`,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Selected asset summary */}
            {selectedAsset && (
              <Box
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: T.tealLight,
                  border: `1px solid ${T.tealMid}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircle sx={{ fontSize: 15, color: T.teal }} />
                <Typography variant="caption" fontWeight={600} color={T.teal}>
                  Selected:{" "}
                  {selectedAsset.name ||
                    selectedAsset.assetName ||
                    "Unnamed Asset"}
                </Typography>
              </Box>
            )}
          </Box>

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
                  )
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
            placeholder="Describe the reason for this request..."
            inputProps={{ maxLength: 1000 }}
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
        <ActionBtn
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Create Request"
          )}
        </ActionBtn>
      </DialogActions>
    </Dialog>
  );
}

// ─── Create Child Request Dialog ──────────────────────────────────────────────
function CreateChildDialog({ open, onClose, onSuccess, parentId: defaultParentId }) {
  const { createChildRequest, fetchRequests } = useAssetRequest();
  const [form, setForm] = useState({
    requestType: "maintenance",
    description: "",
    urgency: "medium",
  });
  const [selectedParentId, setSelectedParentId] = useState(defaultParentId || "");
  const [parentRequests, setParentRequests] = useState([]);
  const [parentLoading, setParentLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch parent requests when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedParentId(defaultParentId || "");
      setParentSearch("");
      setError("");
      loadParentRequests();
    }
  }, [open, defaultParentId]);

  const loadParentRequests = async () => {
    setParentLoading(true);
    try {
      const data = await fetchRequests({ type: "parent", limit: 100 });
      if (data?.success) {
        setParentRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load parent requests:", err);
      setParentRequests([]);
    } finally {
      setParentLoading(false);
    }
  };

  // Filter parent requests by search
  const filteredParents = parentRequests.filter((r) => {
    const q = parentSearch.toLowerCase();
    const desc = (r.description || "").toLowerCase();
    const type = (r.requestType || "").toLowerCase();
    return (
      r._id?.toLowerCase().includes(q) ||
      desc.includes(q) ||
      type.includes(q) ||
      r.requestedBy?.email?.toLowerCase().includes(q)
    );
  });

  const selectedParent = parentRequests.find((r) => r._id === selectedParentId);

  const handleSubmit = async () => {
    if (!selectedParentId) {
      setError("Please select a parent request");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createChildRequest(selectedParentId, form);
      onSuccess("Child request created successfully");
      onClose();
      setForm({
        requestType: "maintenance",
        description: "",
        urgency: "medium",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create child request"
      );
    } finally {
      setSubmitting(false);
    }
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
              bgcolor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountTree sx={{ color: "#14636a", fontSize: 20 }} />
          </Box>
          Add Child Request
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* Parent Request Selector */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.75}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color={T.textSub}
              >
                Select Parent Request *
              </Typography>
              <Tooltip title="Refresh parent list">
                <IconButton
                  size="small"
                  onClick={loadParentRequests}
                  disabled={parentLoading}
                  sx={{ color: T.textMuted, p: 0.25 }}
                >
                  <Refresh sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Search */}
            <TextField
              size="small"
              fullWidth
              placeholder="Search by ID, description, type..."
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 17, color: T.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Parent list */}
            <Box
              sx={{
                border: `1px solid ${T.border}`,
                borderRadius: 2,
                maxHeight: 220,
                overflowY: "auto",
                bgcolor: T.surface,
              }}
            >
              {parentLoading ? (
                <Stack spacing={1} p={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={52} sx={{ borderRadius: 1.5 }} />
                  ))}
                </Stack>
              ) : filteredParents.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <AccountTree sx={{ fontSize: 32, color: T.textMuted, mb: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    {parentSearch
                      ? "No parent requests match your search"
                      : "No parent requests found"}
                  </Typography>
                  {!parentSearch && (
                    <Typography variant="caption" color="textSecondary">
                      Create a parent request first
                    </Typography>
                  )}
                </Box>
              ) : (
                filteredParents.map((r) => {
                  const isSelected = selectedParentId === r._id;
                  const statusConf =
                    STATUS_CONFIG[r.status?.toLowerCase()] ||
                    STATUS_CONFIG.pending;

                  return (
                    <Box
                      key={r._id}
                      onClick={() => setSelectedParentId(r._id)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        borderBottom: `1px solid ${T.border}`,
                        bgcolor: isSelected ? "#eff6ff" : "transparent",
                        borderLeft: isSelected
                          ? `3px solid #1e6774`
                          : "3px solid transparent",
                        transition: "all 0.15s",
                        "&:hover": {
                          bgcolor: isSelected ? "#eff6ff" : "#f8fafc",
                        },
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          bgcolor: isSelected ? "#dbeafe" : T.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        <AccountTree
                          sx={{
                            fontSize: 16,
                            color: isSelected ? "#1e6774" : T.textMuted,
                          }}
                        />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        {/* ID + type row */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            sx={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              color: isSelected ? "#1e6774" : T.textMuted,
                              fontWeight: isSelected ? 700 : 400,
                            }}
                          >
                            #{r._id?.slice(-10)}
                          </Typography>
                          <RequestTypeChip type={r.requestType} />
                          <UrgencyChip urgency={r.urgency} />
                        </Stack>
                        {/* Description */}
                        {r.description && (
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: T.textSub,
                              mt: 0.25,
                              lineHeight: 1.4,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {r.description}
                          </Typography>
                        )}
                        {/* Requester */}
                        {r.requestedBy?.email && (
                          <Typography
                            sx={{ fontSize: 10, color: T.textMuted, mt: 0.25 }}
                          >
                            by {r.requestedBy.email}
                          </Typography>
                        )}
                      </Box>
                      {/* Status */}
                      <Chip
                        label={statusConf.label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          color: statusConf.color,
                          bgcolor: statusConf.bg,
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Selected parent summary */}
            {selectedParent && (
              <Box
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircle sx={{ fontSize: 15, color: "#1e6774" }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="#1e6774"
                  sx={{ fontFamily: "monospace" }}
                >
                  Parent: #{selectedParent._id?.slice(-10)} —{" "}
                  {selectedParent.description?.slice(0, 50) ||
                    selectedParent.requestType}
                </Typography>
              </Box>
            )}
          </Box>

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
                  )
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
            placeholder="Describe this child task..."
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
          onClick={handleSubmit}
          disabled={submitting || !selectedParentId}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#1e6774",
            "&:hover": { bgcolor: "#1e6774" },
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

// ─── Link Asset Dialog ────────────────────────────────────────────────────────
function LinkAssetDialog({ open, onClose, onSuccess, requestId }) {
  const { linkAsset } = useAssetRequest();
  const [childAssetId, setChildAssetId] = useState("");
  const [relationshipType, setRelationshipType] = useState("accessory");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!childAssetId.trim()) {
      setError("Child Asset ID is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await linkAsset(requestId, childAssetId.trim(), relationshipType);
      onSuccess("Asset linked successfully");
      onClose();
      setChildAssetId("");
      setRelationshipType("accessory");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to link asset");
    } finally {
      setSubmitting(false);
    }
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
              bgcolor: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinkIcon sx={{ color: T.green, fontSize: 20 }} />
          </Box>
          Link Asset
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            size="small"
            label="Child Asset ID *"
            value={childAssetId}
            onChange={(e) => setChildAssetId(e.target.value)}
            placeholder="Enter the MongoDB asset ID"
            helperText="The full _id of the asset to link"
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
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              label="Relationship Type"
              sx={{ borderRadius: 2 }}
            >
              {["accessory", "component", "spare", "dependency"].map((r) => (
                <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>
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
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: T.green,
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetRequests() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { fetchRequests, loading } = useAssetRequest();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  });
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialogs
  const [createParentOpen, setCreateParentOpen] = useState(false);
  const [createChildOpen, setCreateChildOpen] = useState(false);
  const [linkAssetOpen, setLinkAssetOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const searchTimer = useRef(null);
  const userIsAdmin = isAdmin?.() || user?.role === "admin";

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchRequests({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type,
        status: filters.status,
        search: filters.search,
      });
      if (data?.success) {
        setRequests(data.requests || []);
        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
          }
        );
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }, [fetchRequests, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearchChange = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((p) => ({ ...p, search: val }));
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortField === field)
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let av = sortField === "createdAt" ? new Date(a.createdAt) : a[sortField];
    let bv = sortField === "createdAt" ? new Date(b.createdAt) : b[sortField];
    return sortOrder === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
  });

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";
  const initials = (email) => email?.charAt(0).toUpperCase() || "?";

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortOrder === "asc" ? (
        <ArrowUpward sx={{ fontSize: 14, ml: 0.5 }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 14, ml: 0.5 }} />
      )
    ) : null;

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const StatCards = () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
        gap: 2,
        mb: 3,
      }}
    >
      {[
        {
          key: "total",
          label: "Total",
          accent: T.teal,
          icon: <TrendingUp sx={{ fontSize: 18, color: T.teal }} />,
        },
        {
          key: "pending",
          label: "Pending",
          accent: T.amber,
          icon: <HourglassEmpty sx={{ fontSize: 18, color: T.amber }} />,
        },
        {
          key: "approved",
          label: "Approved",
          accent: T.green,
          icon: <CheckCircle sx={{ fontSize: 18, color: T.green }} />,
        },
        {
          key: "rejected",
          label: "Rejected",
          accent: T.red,
          icon: <Cancel sx={{ fontSize: 18, color: T.red }} />,
        },
        {
          key: "completed",
          label: "Completed",
          accent: T.blue,
          icon: <DoneAll sx={{ fontSize: 18, color: T.blue }} />,
        },
      ].map(({ key, label, accent, icon }) => (
        <StatCard key={key} accent={accent}>
          <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: T.textMuted,
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: key === "total" ? T.teal : accent,
                    lineHeight: 1.1,
                    mt: 0.5,
                  }}
                >
                  {loading && requests.length === 0 ? (
                    <Skeleton width={40} />
                  ) : (
                    stats[key]
                  )}
                </Typography>
              </Box>
              <Box sx={{ opacity: 0.7, mt: 0.5 }}>{icon}</Box>
            </Stack>
          </CardContent>
        </StatCard>
      ))}
    </Box>
  );

  // ── Filters bar ─────────────────────────────────────────────────────────────
  const FiltersBar = () => (
    <FilterPaper>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems={isMobile ? "stretch" : "center"}
      >
        <TextField
          size="small"
          placeholder="Search requests, assets, or requesters..."
          defaultValue={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            flex: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2.5, background: T.bg },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 19, color: T.textMuted }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            label="Type"
            sx={{ borderRadius: 2.5 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="parent">Parent Requests</MenuItem>
            <MenuItem value="child">Child Requests</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            label="Status"
            sx={{ borderRadius: 2.5 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Refresh data">
          <IconButton
            onClick={loadRequests}
            sx={{
              bgcolor: T.tealLight,
              color: T.teal,
              borderRadius: 2,
              "&:hover": { bgcolor: T.tealMid },
            }}
          >
            <Refresh sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </FilterPaper>
  );

  // ── Mobile card ─────────────────────────────────────────────────────────────
  const MobileCard = ({ request }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        border: `1px solid ${T.border}`,
        boxShadow: "none",
        cursor: "pointer",
        "&:hover": { borderColor: T.teal },
      }}
      onClick={() => navigate(`/admin/asset-requests/${request._id}`)}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Box>
            <Typography
              sx={{ fontFamily: "monospace", fontSize: 11, color: T.textMuted }}
            >
              #{request._id?.slice(-10)}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color={T.text}
              mt={0.5}
            >
              {request.assetId?.name ||
                request.assetId?.assetName ||
                `Asset ${request.assetId?._id?.slice(-6) || "N/A"}`}
            </Typography>
          </Box>
          <StatusChip status={request.status} />
        </Stack>
        <Stack direction="row" spacing={1} mb={1.5}>
          <RequestTypeChip type={request.requestType} />
          <UrgencyChip urgency={request.urgency} />
          {request.isChildRequest && (
            <Chip
              label="Child"
              size="small"
              sx={{
                height: 24,
                fontSize: 10,
                bgcolor: T.blueBg,
                color: T.blue,
              }}
            />
          )}
        </Stack>
        {request.description && (
          <Typography
            sx={{ fontSize: 12, color: T.textSub, mb: 1.5, lineHeight: 1.5 }}
          >
            {request.description.length > 90
              ? `${request.description.slice(0, 90)}…`
              : request.description}
          </Typography>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{ width: 26, height: 26, bgcolor: T.teal, fontSize: 11 }}
            >
              {initials(request.requestedBy?.email)}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: T.textMuted }}>
              {request.requestedBy?.email?.split("@")[0] || "Unknown"}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 11, color: T.textMuted }}>
            {fmt(request.createdAt)}
          </Typography>
        </Stack>
        {userIsAdmin && (
          <Stack
            direction="row"
            spacing={1}
            mt={1.5}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequestId(request._id);
                setCreateChildOpen(true);
              }}
              startIcon={<AccountTree sx={{ fontSize: 13 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: 11,
                py: 0.5,
                color: "#3b82f6",
                borderColor: "#3b82f6",
                border: "1px solid",
              }}
            >
              Child
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequestId(request._id);
                setLinkAssetOpen(true);
              }}
              startIcon={<LinkIcon sx={{ fontSize: 13 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: 11,
                py: 0.5,
                color: T.green,
                borderColor: T.green,
                border: "1px solid",
              }}
            >
              Link
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const TH = ({ children, sortKey, width }) => (
    <TableCell
      sx={{
        fontWeight: 700,
        fontSize: "0.78rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: T.textMuted,
        bgcolor: "#f8fafc",
        py: 1.5,
        width,
      }}
    >
      {sortKey ? (
        <Box
          onClick={() => handleSort(sortKey)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
            "&:hover": { color: T.teal },
          }}
        >
          {children}
          <SortIcon field={sortKey} />
        </Box>
      ) : (
        children
      )}
    </TableCell>
  );

  if (loading && requests.length === 0) {
    return (
      <PageWrap>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <PageTitle variant="h5">Asset Requests</PageTitle>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={90}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={56}
            sx={{ mb: 1, borderRadius: 2 }}
          />
        ))}
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {/* ── Header ── */}
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb={3}
        gap={2}
      >
        <Box>
          <PageTitle variant="h5">Asset Requests</PageTitle>
          <Typography
            sx={{ fontSize: "0.875rem", color: T.textMuted, mt: 0.5 }}
          >
            Manage all asset-related requests — transfers, maintenance, repairs
            &amp; more
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <ActionBtn
            variant="outlined"
            startIcon={<AccountTree sx={{ fontSize: 17 }} />}
            onClick={() => {
              setSelectedRequestId(null);
              setCreateChildOpen(true);
            }}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              borderColor: T.teal,
              color: T.teal,
              "&:hover": { borderColor: T.tealDark, bgcolor: T.tealLight },
            }}
          >
            Child Request
          </ActionBtn>
          <ActionBtn
            variant="contained"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={() => setCreateParentOpen(true)}
          >
            New Request
          </ActionBtn>
        </Stack>
      </Stack>

      <StatCards />
      <FiltersBar />

      {/* ── Content ── */}
      {isMobile ? (
        <Box>
          {sortedRequests.length === 0 && !loading ? (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 3,
                border: `1px solid ${T.border}`,
                boxShadow: "none",
              }}
            >
              <FiberNew sx={{ fontSize: 40, color: T.textMuted, mb: 1 }} />
              <Typography color="textSecondary" fontWeight={600}>
                No requests found
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Adjust your filters or create a new request
              </Typography>
            </Paper>
          ) : (
            sortedRequests.map((r) => <MobileCard key={r._id} request={r} />)
          )}
        </Box>
      ) : (
        <StyledTable component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TH width={150}>Request ID</TH>
                <TH width={200}>Asset</TH>
                <TH width={190}>Requester</TH>
                <TH width={120}>Type</TH>
                <TH width={100}>Urgency</TH>
                <TH width={110}>Status</TH>
                <TH sortKey="createdAt" width={120}>
                  Created
                </TH>
                <TH width={120}>Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 6 }}>
                    <Typography
                      color="textSecondary"
                      fontWeight={600}
                      gutterBottom
                    >
                      No requests found
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Adjust filters or create a new request
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRequests.map((request) => (
                  <TableRow
                    key={request._id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover td": { bgcolor: "#f8fffe" },
                    }}
                  >
                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: T.textSub,
                        }}
                      >
                        #{request._id?.slice(-10)}
                      </Typography>
                      {request.isChildRequest && (
                        <Chip
                          label="Child"
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 18,
                            fontSize: 10,
                            bgcolor: T.blueBg,
                            color: T.blue,
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={T.text}
                        noWrap
                      >
                        {request.assetId?.name ||
                          request.assetId?.assetName ||
                          "—"}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: T.textMuted,
                        }}
                      >
                        {request.assetId?._id?.slice(-10) ||
                          request.assetId?.slice?.(-10) ||
                          "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: T.teal,
                            fontSize: 12,
                          }}
                        >
                          {initials(request.requestedBy?.email)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {request.requestedBy?.email?.split("@")[0] ||
                              "Unknown"}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.textMuted }}>
                            {request.requestedBy?.email || "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <RequestTypeChip type={request.requestType} />
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <UrgencyChip urgency={request.urgency} />
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <StatusChip status={request.status} />
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        navigate(`/admin/asset-requests/${request._id}`)
                      }
                    >
                      <Typography variant="body2" color={T.textSub}>
                        {fmt(request.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/admin/asset-requests/${request._id}`)
                            }
                            sx={{
                              color: T.teal,
                              bgcolor: T.tealLight,
                              borderRadius: 1.5,
                              "&:hover": { bgcolor: T.tealMid },
                            }}
                          >
                            <Visibility sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {userIsAdmin && (
                          <>
                            <Tooltip title="Add Child Request">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRequestId(request._id);
                                  setCreateChildOpen(true);
                                }}
                                sx={{
                                  color: "#3b82f6",
                                  bgcolor: "#eff6ff",
                                  borderRadius: 1.5,
                                  "&:hover": { bgcolor: "#dbeafe" },
                                }}
                              >
                                <AccountTree sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Link Asset">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRequestId(request._id);
                                  setLinkAssetOpen(true);
                                }}
                                sx={{
                                  color: T.green,
                                  bgcolor: T.greenBg,
                                  borderRadius: 1.5,
                                  "&:hover": { bgcolor: "#d1fae5" },
                                }}
                              >
                                <LinkIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTable>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <Stack direction="row" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, p) => setPagination((prev) => ({ ...prev, page: p }))}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}

      {/* ── Dialogs ── */}
      <CreateParentDialog
        open={createParentOpen}
        onClose={() => setCreateParentOpen(false)}
        onSuccess={(msg) => {
          showSnack(msg);
          loadRequests();
        }}
      />

      <CreateChildDialog
        open={createChildOpen}
        onClose={() => {
          setCreateChildOpen(false);
          setSelectedRequestId(null);
        }}
        onSuccess={(msg) => {
          showSnack(msg);
          loadRequests();
        }}
        parentId={selectedRequestId}
      />

      <LinkAssetDialog
        open={linkAssetOpen}
        onClose={() => {
          setLinkAssetOpen(false);
          setSelectedRequestId(null);
        }}
        onSuccess={(msg) => {
          showSnack(msg);
          loadRequests();
        }}
        requestId={selectedRequestId}
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
    </PageWrap>
  );
}