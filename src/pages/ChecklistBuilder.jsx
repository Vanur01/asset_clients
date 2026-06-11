// pages/ChecklistPage.jsx
// Updated with correct AssignmentModal import and integration

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Modal,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  Stack,
  Avatar,
  InputAdornment,
  ThemeProvider,
  createTheme,
  alpha,
  styled,
  CircularProgress,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Add as AddIcon,
  FileCopy as FileCopyIcon,
  Description as DescriptionIcon,
  Public as PublicIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Archive as ArchiveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckBox as CheckBoxIcon,
  Article as ArticleIcon,
  RequestPage as RequestPageIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useRequestChecklist } from "../context/RequestChecklistContext";
import { useAssignment } from "../context/AssignmentContext";
import { useTeam } from "../context/TeamContext";
import { useAsset } from "../context/AssetContext";
import RequestChecklistModal from "./Requestchecklistmodal";
import AssignmentModal from "./Assignchecklistmodal"; // ✅ Fixed import path

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d4a5c",
      dark: "#092f3a",
      light: "#e3f0f4",
      contrastText: "#fff",
    },
    secondary: { main: "#1a7a9a" },
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
    info: { main: "#0288d1" },
    success: { main: "#2e7d32" },
    text: { primary: "#0d1f26", secondary: "#4a6572", disabled: "#90a4ae" },
    background: { default: "#f0f4f6", paper: "#ffffff" },
    divider: "#dde6ea",
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "7px 18px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        sizeSmall: { padding: "4px 12px", fontSize: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: 11 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: "#e8edf0" } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
  },
});

// ─── Styled ───────────────────────────────────────────────────────────────────
const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 8,
  padding: "8px 22px",
  minHeight: 40,
  fontSize: 13,
  fontWeight: 700,
  color: theme.palette.text.secondary,
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
}));

const TH = styled(TableCell)(({ theme }) => ({
  padding: "11px 16px",
  fontSize: "11px",
  fontWeight: 700,
  color: theme.palette.text.disabled,
  backgroundColor: "#f7f9fa",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  borderBottom: `2px solid ${theme.palette.divider}`,
  whiteSpace: "nowrap",
}));

const TD = styled(TableCell)(() => ({
  padding: "12px 16px",
  fontSize: "13px",
  verticalAlign: "middle",
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 20,
  boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "95vh",
  outline: "none",
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: "24px 28px",
  borderRadius: "20px 20px 0 0",
  flexShrink: 0,
}));

const InfoTile = styled(Box)(({ theme }) => ({
  padding: "12px 14px",
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ─── Status / Type Badges ─────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    color: "warning",
    icon: <PendingIcon sx={{ fontSize: 11 }} />,
    label: "Pending",
  },
  approved: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Approved",
  },
  rejected: {
    color: "error",
    icon: <ErrorIcon sx={{ fontSize: 11 }} />,
    label: "Rejected",
  },
  under_review: {
    color: "info",
    icon: <HourglassIcon sx={{ fontSize: 11 }} />,
    label: "Under Review",
  },
  in_progress: {
    color: "info",
    icon: <HourglassIcon sx={{ fontSize: 11 }} />,
    label: "In Progress",
  },
  published: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Published",
  },
  active: {
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Active",
  },
  draft: { color: "default", icon: null, label: "Draft" },
  archived: {
    color: "default",
    icon: <ArchiveIcon sx={{ fontSize: 11 }} />,
    label: "Archived",
  },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.draft;
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size="small"
      color={cfg.color}
      sx={{ height: 24, "& .MuiChip-label": { fontSize: 11, px: 0.75 } }}
    />
  );
};

const TYPE_CFG = {
  custom: {
    icon: <DescriptionIcon sx={{ fontSize: 11 }} />,
    label: "Custom",
    color: "primary",
  },
  global: {
    icon: <PublicIcon sx={{ fontSize: 11 }} />,
    label: "Global",
    color: "success",
  },
  import: {
    icon: <FileCopyIcon sx={{ fontSize: 11 }} />,
    label: "Imported",
    color: "info",
  },
};
const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type?.toLowerCase()] || TYPE_CFG.custom;
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size="small"
      color={cfg.color}
      variant="outlined"
      sx={{ height: 24, "& .MuiChip-label": { fontSize: 11 } }}
    />
  );
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#52a069", bg: "#e8f5e9" },
  medium: { label: "Medium", color: "#ed6c02", bg: "#fff3e0" },
  high: { label: "High", color: "#d32f2f", bg: "#ffebee" },
  critical: { label: "Critical", color: "#7f1d1d", bg: "#fef2f2" },
};
const PriorityBadge = ({ priority }) => {
  const cfg =
    PRIORITY_CONFIG[priority?.toLowerCase()] || PRIORITY_CONFIG.medium;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: 11,
        height: 24,
      }}
    />
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, icon, loading }) => (
  <Card
    sx={{
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      width: "270px",
    }}
  >
    <CardContent sx={{ p: "16px !important" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
            }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={50} height={36} sx={{ mt: 0.5 }} />
          ) : (
            <Typography
              variant="h5"
              fontWeight={800}
              color={accent || "primary.main"}
              sx={{ mt: 0.5, lineHeight: 1.2 }}
            >
              {value ?? "—"}
            </Typography>
          )}
          {sub && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 0.5, display: "block" }}
            >
              {sub}
            </Typography>
          )}
        </Box>
        {icon && (
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>
        )}
      </Box>
    </CardContent>
  </Card>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ message = "No data found", sub = "", icon }) => (
  <Box sx={{ py: 8, textAlign: "center" }}>
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.07),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
      }}
    >
      {icon || (
        <DescriptionIcon
          sx={{ fontSize: 30, color: "primary.main", opacity: 0.5 }}
        />
      )}
    </Box>
    <Typography fontWeight={700} color="text.secondary" variant="body1">
      {message}
    </Typography>
    {sub && (
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.75 }}
      >
        {sub}
      </Typography>
    )}
  </Box>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const PaginationComponent = ({ pagination, onPageChange }) => {
  if (!pagination?.pages || pagination.pages <= 1) return null;
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button
        size="small"
        variant="outlined"
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
        startIcon={<ChevronLeftIcon />}
      >
        Prev
      </Button>
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        Page <strong>{pagination.page}</strong> of{" "}
        <strong>{pagination.pages}</strong>
        <Typography
          component="span"
          variant="caption"
          color="text.disabled"
          sx={{ ml: 1 }}
        >
          ({pagination.total} total)
        </Typography>
      </Typography>
      <Button
        size="small"
        variant="outlined"
        disabled={pagination.page === pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
        endIcon={<ChevronRightIcon />}
      >
        Next
      </Button>
    </Box>
  );
};

// ─── ViewChecklistModal ───────────────────────────────────────────────────────
const ViewChecklistModal = ({
  open,
  onClose,
  checklist,
  onDelete,
  userRole,
}) => {
  if (!checklist) return null;
  const fields = checklist.fields || [];
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox sx={{ width: { xs: "95vw", sm: 660 } }}>
        <ModalHeader>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography variant="h6" fontWeight={800} color="white">
                {checklist.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha("#fff", 0.65), mt: 0.5, display: "block" }}
              >
                Created {fmt(checklist.createdAt)}
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}
              >
                <StatusBadge status={checklist.status} />
                <TypeBadge type={checklist.checklistType} />
                {checklist.category && (
                  <Chip
                    label={checklist.category}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "white",
                      bgcolor: alpha("#fff", 0.15),
                      border: `1px solid ${alpha("#fff", 0.25)}`,
                    }}
                  />
                )}
              </Stack>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: "white",
                bgcolor: alpha("#fff", 0.12),
                "&:hover": { bgcolor: alpha("#fff", 0.2) },
                width: 36,
                height: 36,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </ModalHeader>
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={3}>
            <Grid container spacing={1.5}>
              {[
                { label: "Version", val: `v${checklist.version || 1}` },
                {
                  label: "Fields",
                  val: checklist.totalFields ?? fields.length,
                },
                { label: "Category", val: checklist.category || "—" },
                { label: "Created", val: fmt(checklist.createdAt) },
                { label: "Updated", val: fmt(checklist.updatedAt) },
                { label: "Is Global", val: checklist.isGlobal ? "Yes" : "No" },
              ].map(({ label, val }) => (
                <Grid item xs={6} sm={4} key={label}>
                  <InfoTile>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                      sx={{ mb: 0.25 }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {val}
                    </Typography>
                  </InfoTile>
                </Grid>
              ))}
            </Grid>
            {checklist.description && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f7f9fa",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.75 }}
                  >
                    {checklist.description}
                  </Typography>
                </Box>
              </Box>
            )}
            {fields.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  Fields ({fields.length})
                </Typography>
                <Stack spacing={1}>
                  {fields.map((field, idx) => (
                    <Box
                      key={field._id || idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                        }}
                      >
                        {idx + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {field.label}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {field.type} ·{" "}
                          {field.required ? "Required" : "Optional"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
        <Box
          sx={{
            p: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            bgcolor: "#fafbfc",
            borderRadius: "0 0 20px 20px",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {(userRole === "super_admin" || userRole === "admin") && (
              <Button
                onClick={() => {
                  onDelete(checklist);
                  onClose();
                }}
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                color="error"
              >
                Delete
              </Button>
            )}
          </Stack>
          <Button onClick={onClose} variant="outlined" size="small">
            Close
          </Button>
        </Box>
      </ModalBox>
    </Modal>
  );
};

// ─── CreateModal ──────────────────────────────────────────────────────────────
const CreateModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const OPTIONS = [
    {
      icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
      label: "Custom Checklist",
      desc: "Build a fully custom checklist with drag-and-drop fields",
      path: "/admin/create-checklist/custom",
      color: "#0d4a5c",
      bg: "#e3f0f4",
    },
    {
      icon: <PublicIcon sx={{ fontSize: 24 }} />,
      label: "Standard Checklist",
      desc: "Submit a standard checklist for super admin approval",
      path: "/admin/create-checklist/global",
      color: "#2e7d32",
      bg: "#e8f5e9",
    },
    {
      icon: <FileCopyIcon sx={{ fontSize: 24 }} />,
      label: "Import from Excel",
      desc: "Auto-generate checklist fields from an Excel spreadsheet",
      path: "/admin/import-checklist/excel",
      color: "#0288d1",
      bg: "#e1f5fe",
    },
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox sx={{ width: { xs: "92vw", sm: 500 } }}>
        <ModalHeader>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="white">
                Create New Checklist
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: alpha("#fff", 0.65), mt: 0.5 }}
              >
                Choose how to build your checklist
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: "white",
                bgcolor: alpha("#fff", 0.12),
                "&:hover": { bgcolor: alpha("#fff", 0.2) },
                width: 36,
                height: 36,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </ModalHeader>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            {OPTIONS.map((opt) => (
              <Box
                key={opt.label}
                onClick={() => {
                  onClose();
                  navigate(opt.path);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: "1.5px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": {
                    borderColor: opt.color,
                    bgcolor: `${opt.bg}80`,
                    transform: "translateX(3px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: opt.bg,
                    color: opt.color,
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                  }}
                >
                  {opt.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} variant="body1">
                    {opt.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.5 }}
                  >
                    {opt.desc}
                  </Typography>
                </Box>
                <ChevronRightIcon
                  sx={{ color: "text.disabled", fontSize: 20 }}
                />
              </Box>
            ))}
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
            <Button onClick={onClose} variant="outlined" size="small">
              Cancel
            </Button>
          </Box>
        </Box>
      </ModalBox>
    </Modal>
  );
};

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  deleting,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha("#d32f2f", 0.1),
            color: "error.main",
            width: 38,
            height: 38,
          }}
        >
          <WarningIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography fontWeight={800} variant="body1">
          {title || "Delete"}
        </Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ fontSize: 14 }}>
        {message || "Are you sure you want to delete this item?"}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        variant="outlined"
        size="small"
        disabled={deleting}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        size="small"
        disabled={deleting}
        startIcon={
          deleting ? (
            <CircularProgress size={13} color="inherit" />
          ) : (
            <DeleteIcon />
          )
        }
      >
        {deleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── ReviewRequestDialog ──────────────────────────────────────────────────────
const ReviewRequestDialog = ({ open, onClose, request, onReview }) => {
  const [action, setAction] = useState("approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  useEffect(() => {
    if (open) {
      setAction("approved");
      setRejectionReason("");
    }
  }, [open]);
  const handleSubmit = async () => {
    setReviewing(true);
    await onReview(
      request?._id,
      action,
      action === "rejected" ? { rejectionReason } : {},
    );
    setReviewing(false);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={700}>Review Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Decision</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              label="Decision"
            >
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
              <MenuItem value="under_review">Mark Under Review</MenuItem>
              <MenuItem value="in_progress">Mark In Progress</MenuItem>
            </Select>
          </FormControl>
          {action === "rejected" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this request is being rejected..."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={reviewing}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            reviewing || (action === "rejected" && !rejectionReason.trim())
          }
          startIcon={
            reviewing ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
        >
          {reviewing ? "Submitting…" : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;
  const isSuperAdmin = userRole === "super_admin" || userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Contexts
  const { getAllChecklists, getChecklistById, deleteChecklist } =
    useChecklistBuilder();
  const {
    getMyRequests,
    getAllRequests,
    getRequestById,
    softDeleteRequest,
    reviewRequest,
  } = useRequestChecklist();
  const { getAssignments } = useAssignment();
  useTeam(); // keep provider in scope
  useAsset(); // keep provider in scope

  // ── Checklists state ────────────────────────────────────────────────────────
  const [checklists, setChecklists] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listPagination, setListPagination] = useState({});
  const [listFilters, setListFilters] = useState({
    search: "",
    status: "",
    checklistType: "",
    page: 1,
    limit: 10,
  });

  // ── Requests state ──────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPagination, setRequestsPagination] = useState({});
  const [requestsFilters, setRequestsFilters] = useState({
    status: "",
    urgencyLevel: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [showDeleted, setShowDeleted] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [viewChecklist, setViewChecklist] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  // ── Assign modal ─────────────────────────────────────────────────────────────
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Snackbar ────────────────────────────────────────────────────────────────
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const showSnack = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  // ── Fetch checklists ────────────────────────────────────────────────────────
  const fetchChecklists = useCallback(async () => {
    setListLoading(true);
    try {
      const params = { page: listFilters.page, limit: listFilters.limit };
      if (listFilters.search) params.search = listFilters.search;
      if (listFilters.status) params.status = listFilters.status;
      if (listFilters.checklistType)
        params.checklistType = listFilters.checklistType;
      const res = await getAllChecklists(params);
      if (res.success) {
        const raw = res.data;
        const list =
          raw?.checklists ||
          raw?.data?.checklists ||
          (Array.isArray(raw) ? raw : []);
        setChecklists(list);
        setListPagination(raw?.pagination || raw?.data?.pagination || {});
      } else {
        showSnack(res.error || "Failed to fetch checklists", "error");
      }
    } catch (err) {
      showSnack(err.message || "Failed to fetch checklists", "error");
    } finally {
      setListLoading(false);
    }
  }, [getAllChecklists, listFilters, showSnack]);

  // ── Fetch requests ──────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const params = { ...requestsFilters };
      if (isSuperAdmin && showDeleted) params.includeDeleted = true;
      const result = isSuperAdmin
        ? await getAllRequests(params)
        : await getMyRequests(params);
      if (result?.success) {
        const list =
          result.requests || result.data?.requests || result.data || [];
        setRequests(Array.isArray(list) ? list : []);
        setRequestsPagination(
          result.pagination || result.data?.pagination || {},
        );
      } else {
        showSnack(result?.error || "Failed to fetch requests", "error");
      }
    } catch (err) {
      showSnack(err.message || "Failed to fetch requests", "error");
    } finally {
      setRequestsLoading(false);
    }
  }, [
    getAllRequests,
    getMyRequests,
    requestsFilters,
    isSuperAdmin,
    showDeleted,
    showSnack,
  ]);

  // ── Open assign ─────────────────────────────────────────────────────────────
  const openAssign = useCallback((row) => {
    setSelectedChecklist(row);
    setAssignModalOpen(true);
  }, []);

  // ── Handle assign success ────────────────────────────────────────────────────
  const handleAssignSuccess = useCallback(
    (data) => {
      showSnack("Assignments created successfully!");
      if (typeof getAssignments === "function") {
        getAssignments({ page: 1, limit: 5 }).catch(() => {});
      }
    },
    [getAssignments, showSnack],
  );

  // ── View handlers ───────────────────────────────────────────────────────────
  const openViewChecklist = useCallback(
    async (row) => {
      setLoadingView(true);
      const res = await getChecklistById(row._id);
      setLoadingView(false);
      if (res.success) {
        const raw = res.data;
        setViewChecklist(raw?.checklist || raw?.data || raw);
      } else {
        showSnack("Failed to load checklist details", "error");
      }
    },
    [getChecklistById, showSnack],
  );

  const openViewRequest = useCallback(
    async (row) => {
      setLoadingView(true);
      const res = await getRequestById(row._id);
      setLoadingView(false);
      if (res.success) {
        setViewRequest(res.data?.request || res.data);
      } else {
        showSnack("Failed to load request details", "error");
      }
    },
    [getRequestById, showSnack],
  );

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((c) => {
    setDeleteTarget(c);
    setDeleteDialogOpen(true);
  }, []);
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    const res = await deleteChecklist(deleteTarget._id);
    if (res.success) {
      showSnack("Checklist deleted successfully");
      fetchChecklists();
    } else showSnack(res.error || "Failed to delete checklist", "error");
    setDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteChecklist, fetchChecklists, showSnack]);

  // ── Request actions ─────────────────────────────────────────────────────────
  const handleSoftDeleteRequest = useCallback(
    async (id) => {
      const res = await softDeleteRequest(id);
      if (res.success) {
        showSnack("Request deleted");
        fetchRequests();
      } else showSnack(res.error || "Failed to delete request", "error");
      setViewRequest(null);
    },
    [softDeleteRequest, fetchRequests, showSnack],
  );

  const handleReviewRequest = useCallback(
    async (id, status, data) => {
      const res = await reviewRequest(id, status, data);
      if (res.success) {
        showSnack(`Request ${status.replace(/_/g, " ")} successfully`);
        fetchRequests();
        setViewRequest(null);
      } else {
        showSnack(res.error || "Failed to review request", "error");
      }
      return res;
    },
    [reviewRequest, fetchRequests, showSnack],
  );

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const stats = {
    total: listPagination.total ?? checklists.length,
    active: checklists.filter(
      (c) => c.status === "published" || c.status === "active",
    ).length,
    fields: checklists.reduce(
      (s, c) => s + (c.totalFields ?? c.fields?.length ?? 0),
      0,
    ),
    pending: checklists.filter(
      (c) => c.status === "pending" || c.status === "draft",
    ).length,
  };
  const reqStats = {
    total: requestsPagination.total ?? requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const updateListFilter = (k, v) =>
    setListFilters((p) => ({ ...p, [k]: v, page: 1 }));
  const updateReqFilter = (k, v) =>
    setRequestsFilters((p) => ({ ...p, [k]: v, page: 1 }));

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        <Container
          maxWidth="xl"
          sx={{ py: { xs: 2, md: 3.5 }, px: { xs: 1.5, md: 3 } }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={800}
                color="text.primary"
                sx={{ letterSpacing: "-0.02em" }}
              >
                Checklist Management
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Build, manage, and assign inspection checklists for your team
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<FileCopyIcon sx={{ fontSize: 13 }} />}
                onClick={() => navigate("/admin/checklists/clone")}
                sx={{ fontSize: 13 }}
              >
                Clone Checklist
              </Button>
              <Button
                variant="outlined"
                startIcon={<RequestPageIcon />}
                onClick={() => setRequestOpen(true)}
                sx={{
                  fontSize: 13,
                  borderColor: "primary.main",
                  color: "primary.main",
                }}
              >
                Request Checklist
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{ fontSize: 13 }}
              >
                Create Checklist
              </Button>
            </Stack>
          </Box>

          {/* Stats */}
          {tab === 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                {
                  label: "Total Checklists",
                  value: stats.total,
                  sub: "All types",
                  accent: "primary.main",
                  icon: <ArticleIcon />,
                },
                {
                  label: "Published",
                  value: stats.active,
                  sub: "Currently active",
                  accent: "success.main",
                  icon: <CheckCircleIcon />,
                },
                {
                  label: "Total Fields",
                  value: stats.fields,
                  sub: "Across all lists",
                  accent: "info.main",
                  icon: <CheckBoxIcon />,
                },
                {
                  label: "Draft / Pending",
                  value: stats.pending,
                  sub: "Awaiting action",
                  accent: "warning.main",
                  icon: <PendingIcon />,
                },
              ].map((s) => (
                <Grid item xs={6} sm={3} key={s.label}>
                  <StatCard {...s} loading={listLoading} />
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                {
                  label: "Total Requests",
                  value: reqStats.total,
                  sub: "All requests",
                  accent: "primary.main",
                  icon: <RequestPageIcon />,
                },
                {
                  label: "Pending",
                  value: reqStats.pending,
                  sub: "Awaiting review",
                  accent: "warning.main",
                  icon: <PendingIcon />,
                },
                {
                  label: "Approved",
                  value: reqStats.approved,
                  sub: "Completed",
                  accent: "success.main",
                  icon: <CheckCircleIcon />,
                },
                {
                  label: "Rejected",
                  value: reqStats.rejected,
                  sub: "Not approved",
                  accent: "error.main",
                  icon: <ErrorIcon />,
                },
              ].map((s) => (
                <Grid item xs={6} sm={3} key={s.label}>
                  <StatCard {...s} loading={requestsLoading} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 2.5, p: 0.75, display: "inline-flex" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                minHeight: "auto",
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              <StyledTab
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <ArticleIcon sx={{ fontSize: 16 }} />
                    <span>Checklists</span>
                    {!listLoading && (
                      <Chip
                        label={listPagination.total ?? checklists.length}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          ml: 0.5,
                          bgcolor:
                            tab === 0
                              ? alpha("#fff", 0.25)
                              : alpha(theme.palette.primary.main, 0.12),
                          color: tab === 0 ? "white" : "primary.main",
                        }}
                      />
                    )}
                  </Stack>
                }
              />
              <StyledTab
                label={
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <RequestPageIcon sx={{ fontSize: 16 }} />
                    <span>Requests</span>
                    {reqStats.pending > 0 && (
                      <Chip
                        label={reqStats.pending}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          ml: 0.5,
                          bgcolor:
                            tab === 1 ? alpha("#fff", 0.25) : "#ed6c0220",
                          color: tab === 1 ? "white" : "warning.main",
                        }}
                      />
                    )}
                  </Stack>
                }
              />
            </Tabs>
          </Paper>

          {/* Table container */}
          <Paper
            sx={{
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* ── Checklists Tab ────────────────────────────────────────────── */}
            {tab === 0 && (
              <>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    bgcolor: "#fafbfc",
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search checklists…"
                    value={listFilters.search}
                    onChange={(e) => updateListFilter("search", e.target.value)}
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            fontSize="small"
                            sx={{ color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={listFilters.status}
                      onChange={(e) =>
                        updateListFilter("status", e.target.value)
                      }
                      label="Status"
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={listFilters.checklistType}
                      onChange={(e) =>
                        updateListFilter("checklistType", e.target.value)
                      }
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                      <MenuItem value="global">Global</MenuItem>
                      <MenuItem value="import">Imported</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={fetchChecklists}
                      disabled={listLoading}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: "auto" }}
                  >
                    {listPagination.total ?? checklists.length} result
                    {(listPagination.total ?? checklists.length) !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {[
                          "Name",
                          "Type",
                          "Category",
                          "Fields",
                          "Version",
                          "Status",
                          "Created",
                          "Actions",
                        ].map((h) => (
                          <TH key={h}>{h}</TH>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listLoading &&
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(8)].map((__, j) => (
                              <TD key={j}>
                                <Skeleton height={20} />
                              </TD>
                            ))}
                          </TableRow>
                        ))}
                      {!listLoading &&
                        checklists.map((row) => (
                          <TableRow
                            key={row._id}
                            hover
                            sx={{ "&:hover": { bgcolor: "#f7f9fa" } }}
                          >
                            <TD>
                              <Typography fontWeight={700} variant="body2">
                                {row.name}
                              </Typography>
                              {row.description && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  noWrap
                                  sx={{ maxWidth: 200, display: "block" }}
                                >
                                  {row.description}
                                </Typography>
                              )}
                            </TD>
                            <TD>
                              <TypeBadge type={row.checklistType} />
                            </TD>
                            <TD>
                              {row.category ? (
                                <Chip
                                  label={row.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 22, fontSize: 11 }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  —
                                </Typography>
                              )}
                            </TD>
                            <TD>
                              <Chip
                                label={
                                  row.totalFields ?? row.fields?.length ?? 0
                                }
                                size="small"
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.08,
                                  ),
                                  color: "primary.main",
                                  fontWeight: 700,
                                }}
                              />
                            </TD>
                            <TD>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                v{row.version || 1}
                              </Typography>
                            </TD>
                            <TD>
                              <StatusBadge status={row.status} />
                            </TD>
                            <TD>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {fmt(row.createdAt)}
                              </Typography>
                            </TD>
                            <TD>
                              <Stack
                                direction="row"
                                spacing={0.75}
                                flexWrap="wrap"
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={
                                    <VisibilityIcon sx={{ fontSize: 13 }} />
                                  }
                                  onClick={() => openViewChecklist(row)}
                                  disabled={loadingView}
                                  sx={{ fontSize: 12 }}
                                >
                                  View
                                </Button>
                                {(isSuperAdmin || isAdmin) && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                      <AssignmentIcon sx={{ fontSize: 13 }} />
                                    }
                                    onClick={() => openAssign(row)}
                                    sx={{ fontSize: 12 }}
                                  >
                                    Assign
                                  </Button>
                                )}
                                {(isSuperAdmin || isAdmin) && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={
                                      <DeleteIcon sx={{ fontSize: 13 }} />
                                    }
                                    onClick={() => handleDeleteClick(row)}
                                    sx={{ fontSize: 12 }}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </Stack>
                            </TD>
                          </TableRow>
                        ))}
                      {!listLoading && checklists.length === 0 && (
                        <TableRow>
                          <TD colSpan={8} align="center" sx={{ py: 6 }}>
                            <EmptyState
                              message="No checklists found"
                              sub="Create your first checklist to get started"
                              icon={
                                <ArticleIcon
                                  sx={{
                                    fontSize: 32,
                                    color: "primary.main",
                                    opacity: 0.4,
                                  }}
                                />
                              }
                            />
                          </TD>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <PaginationComponent
                  pagination={listPagination}
                  onPageChange={(p) =>
                    setListFilters((f) => ({ ...f, page: p }))
                  }
                />
              </>
            )}

            {/* ── Requests Tab ─────────────────────────────────────────────── */}
            {tab === 1 && (
              <>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    bgcolor: "#fafbfc",
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search requests…"
                    value={requestsFilters.search}
                    onChange={(e) => updateReqFilter("search", e.target.value)}
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            fontSize="small"
                            sx={{ color: "text.disabled" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={requestsFilters.status}
                      onChange={(e) =>
                        updateReqFilter("status", e.target.value)
                      }
                      label="Status"
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="under_review">Under Review</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Urgency</InputLabel>
                    <Select
                      value={requestsFilters.urgencyLevel}
                      onChange={(e) =>
                        updateReqFilter("urgencyLevel", e.target.value)
                      }
                      label="Urgency"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                  {isSuperAdmin && (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={showDeleted}
                          onChange={(e) => {
                            setShowDeleted(e.target.checked);
                            setRequestsFilters((f) => ({ ...f, page: 1 }));
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" fontWeight={600}>
                          Show Deleted
                        </Typography>
                      }
                    />
                  )}
                  <Tooltip title="Refresh">
                    <IconButton
                      size="small"
                      onClick={fetchRequests}
                      disabled={requestsLoading}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: "auto" }}
                  >
                    {requestsPagination.total ?? requests.length} result
                    {(requestsPagination.total ?? requests.length) !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {[
                          "Checklist Name",
                          "Category",
                          "Urgency",
                          "Status",
                          "Submitted",
                          ...(isSuperAdmin ? ["Requested By"] : []),
                          "Actions",
                        ].map((h) => (
                          <TH key={h}>{h}</TH>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requestsLoading &&
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(6)].map((__, j) => (
                              <TD key={j}>
                                <Skeleton height={20} />
                              </TD>
                            ))}
                          </TableRow>
                        ))}
                      {!requestsLoading &&
                        requests.map((row) => (
                          <TableRow
                            key={row._id}
                            hover
                            sx={{
                              "&:hover": { bgcolor: "#f7f9fa" },
                              opacity: row.isDeleted ? 0.6 : 1,
                            }}
                          >
                            <TD>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {row.isDeleted && (
                                  <Chip
                                    label="Deleted"
                                    size="small"
                                    color="error"
                                    sx={{ height: 18, fontSize: 10 }}
                                  />
                                )}
                                <Box>
                                  <Typography fontWeight={700} variant="body2">
                                    {row.checklistName}
                                  </Typography>
                                  {row.message && (
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      noWrap
                                      sx={{ maxWidth: 180, display: "block" }}
                                    >
                                      {row.message}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TD>
                            <TD>
                              {row.category ? (
                                <Chip
                                  label={row.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 22, fontSize: 11 }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  —
                                </Typography>
                              )}
                            </TD>
                            <TD>
                              <PriorityBadge priority={row.urgencyLevel} />
                            </TD>
                            <TD>
                              <StatusBadge status={row.status} />
                            </TD>
                            <TD>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {fmt(row.requestDate || row.createdAt)}
                              </Typography>
                            </TD>
                            {isSuperAdmin && (
                              <TD>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {row.requestedByName ||
                                    row.requestedBy?.email ||
                                    "—"}
                                </Typography>
                              </TD>
                            )}
                            <TD>
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={
                                    <VisibilityIcon sx={{ fontSize: 13 }} />
                                  }
                                  onClick={() => openViewRequest(row)}
                                  disabled={loadingView}
                                  sx={{ fontSize: 12 }}
                                >
                                  View
                                </Button>
                                {(isSuperAdmin || isAdmin) &&
                                  !row.isDeleted && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={
                                        <DeleteIcon sx={{ fontSize: 13 }} />
                                      }
                                      onClick={() =>
                                        handleSoftDeleteRequest(row._id)
                                      }
                                      sx={{ fontSize: 12 }}
                                    >
                                      Delete
                                    </Button>
                                  )}
                              </Stack>
                            </TD>
                          </TableRow>
                        ))}
                      {!requestsLoading && requests.length === 0 && (
                        <TableRow>
                          <TD colSpan={7} align="center" sx={{ py: 6 }}>
                            <EmptyState
                              message="No requests found"
                              sub='Click "Request Checklist" to submit your first request'
                              icon={
                                <RequestPageIcon
                                  sx={{
                                    fontSize: 32,
                                    color: "primary.main",
                                    opacity: 0.4,
                                  }}
                                />
                              }
                            />
                          </TD>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <PaginationComponent
                  pagination={requestsPagination}
                  onPageChange={(p) =>
                    setRequestsFilters((f) => ({ ...f, page: p }))
                  }
                />
              </>
            )}
          </Paper>
        </Container>

        {/* ── Modals ──────────────────────────────────────────────────────────── */}

        <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />

        <RequestChecklistModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          onSuccess={() => {
            showSnack("Checklist request submitted successfully!");
            setTab(1);
            fetchRequests();
          }}
        />

        {/* ─── Assignment Modal (Unified) ───────────────────────────────────── */}
        <AssignmentModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedChecklist(null);
          }}
          onSuccess={handleAssignSuccess}
          mode="assign"
          preselectedChecklist={selectedChecklist}
        />

        <ViewChecklistModal
          open={!!viewChecklist}
          onClose={() => setViewChecklist(null)}
          checklist={viewChecklist}
          userRole={userRole}
          onDelete={handleDeleteClick}
        />

        {/* View request dialog */}
        <Dialog
          open={!!viewRequest}
          onClose={() => setViewRequest(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ bgcolor: "#0d4a5c", color: "white" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight={700}>
                  {viewRequest?.checklistName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha("#fff", 0.6) }}
                >
                  Submitted{" "}
                  {fmt(viewRequest?.requestDate || viewRequest?.createdAt)}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setViewRequest(null)}
                size="small"
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Status
                  </Typography>
                  <StatusBadge status={viewRequest?.status} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Urgency
                  </Typography>
                  <PriorityBadge priority={viewRequest?.urgencyLevel} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Category
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {viewRequest?.category || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Usage Frequency
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {viewRequest?.expectedUsageFrequency || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Detailed Description
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f7f9fa",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2">
                      {viewRequest?.detailedDescription || "—"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Business Justification
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f7f9fa",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2">
                      {viewRequest?.businessJustification || "—"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {viewRequest?.status === "rejected" &&
                viewRequest?.rejectionReason && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      display="block"
                    >
                      Rejection Reason
                    </Typography>
                    <Typography variant="body2">
                      {viewRequest.rejectionReason}
                    </Typography>
                  </Alert>
                )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            {isSuperAdmin &&
              !["approved", "rejected"].includes(viewRequest?.status) &&
              !viewRequest?.isDeleted && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setReviewDialogOpen(true)}
                >
                  Review Request
                </Button>
              )}
            <Button onClick={() => setViewRequest(null)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <ReviewRequestDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          request={viewRequest}
          onReview={handleReviewRequest}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            if (!deleting) {
              setDeleteDialogOpen(false);
              setDeleteTarget(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Checklist"
          message={`Delete "${deleteTarget?.name}"? This action can be reversed from the admin panel.`}
          deleting={deleting}
        />

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((p) => ({ ...p, open: false }))}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
