// pages/AssignedChecklist.jsx - Updated with Assign Functionality

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,Checkbox,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  Tooltip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  useMediaQuery,
  useTheme as useMuiTheme,
  Stack,
  Button,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TuneIcon from "@mui/icons-material/Tune";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import SendIcon from "@mui/icons-material/Send";
import FlagIcon from "@mui/icons-material/Flag";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import BusinessIcon from "@mui/icons-material/Business";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { useAsset } from "../context/AssetContext";

// ─── Google Fonts injection (Inter for clean modern look) ──────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href =
  "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap";
if (!document.head.querySelector('[href*="Inter"]')) {
  document.head.appendChild(FONT_LINK);
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
   primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#eff6ff",
  success: "#10b981",
  successLight: "#ecfdf5",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  error: "#ef4444",
  errorLight: "#fef2f2",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  gray: "#6b7280",
  grayLight: "#9ca3af",
  grayExtraLight: "#f3f4f6",
  border: "#e5e7eb",
  bg: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
};

// ─── MUI Theme ────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: T.primary },
    background: { default: T.bg, paper: T.surface },
    text: { primary: T.text, secondary: T.textSecondary },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "0.75rem",
          color: T.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: T.grayExtraLight,
          borderBottom: `1px solid ${T.border}`,
          padding: "12px 16px",
          whiteSpace: "nowrap",
        },
        body: {
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.875rem",
          color: T.text,
          padding: "14px 16px",
          borderBottom: `1px solid ${T.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          textTransform: "none",
          letterSpacing: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
          },
        },
      },
    },
  },
});

// ─── Status & Priority Config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: T.warning,
    bg: T.warningLight,
    icon: PendingActionsIcon,
  },
  in_progress: {
    label: "In Progress",
    color: T.primary,
    bg: T.primaryLight,
    icon: HourglassTopOutlinedIcon,
  },
  submitted: {
    label: "Submitted",
    color: T.purple,
    bg: T.purpleLight,
    icon: RateReviewIcon,
  },
  completed: {
    label: "Completed",
    color: T.success,
    bg: T.successLight,
    icon: CheckCircleOutlineIcon,
  },
  approved: {
    label: "Approved",
    color: T.success,
    bg: T.successLight,
    icon: CheckCircleOutlineIcon,
  },
  rejected: {
    label: "Rejected",
    color: T.error,
    bg: T.errorLight,
    icon: CloseIcon,
  },
  overdue: {
    label: "Overdue",
    color: T.error,
    bg: T.errorLight,
    icon: ErrorOutlineIcon,
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: T.success, bg: T.successLight },
  medium: { label: "Medium", color: T.warning, bg: T.warningLight },
  high: { label: "High", color: T.error, bg: T.errorLight },
  critical: { label: "Critical", color: "#7f1d1d", bg: "#fef2f2" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={<Icon sx={{ fontSize: 12 }} />}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 500,
        fontSize: "0.7rem",
        height: 26,
        borderRadius: "6px",
        border: "none",
        "& .MuiChip-icon": {
          color: `${cfg.color} !important`,
          ml: "5px",
          fontSize: 13,
        },
        "& .MuiChip-label": { px: "8px" },
      }}
    />
  );
}

function PriorityChip({ priority }) {
  const cfg =
    PRIORITY_CONFIG[priority?.toLowerCase()] || PRIORITY_CONFIG.medium;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 500,
        fontSize: "0.7rem",
        height: 22,
        borderRadius: "4px",
      }}
    />
  );
}

function DateCell({ date }) {
  if (!date)
    return (
      <Typography sx={{ fontSize: "0.8rem", color: T.textMuted }}>—</Typography>
    );

  const d = new Date(date);
  const now = new Date();
  const isOverdue = d < now && d.toDateString() !== now.toDateString();
  const formattedDate = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <CalendarTodayOutlinedIcon
        sx={{ fontSize: 13, color: isOverdue ? T.error : T.textMuted }}
      />
      <Typography
        sx={{
          fontSize: "0.8rem",
          color: isOverdue ? T.error : T.textSecondary,
          fontWeight: isOverdue ? 600 : 400,
        }}
      >
        {formattedDate}
      </Typography>
      {isOverdue && (
        <Box
          sx={{ px: 0.75, py: 0.2, borderRadius: "3px", bgcolor: T.errorLight }}
        >
          <Typography
            sx={{ fontSize: "0.6rem", color: T.error, fontWeight: 600 }}
          >
            LATE
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function CompletionBar({ rate }) {
  const pct = rate || 0;
  const barColor = pct >= 80 ? T.success : pct >= 50 ? T.warning : T.error;
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 100 }}
    >
      <Box
        sx={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          bgcolor: T.grayExtraLight,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            bgcolor: barColor,
            transition: "width 0.3s",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: barColor,
          minWidth: 32,
        }}
      >
        {pct}%
      </Typography>
    </Box>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accentColor, loading }) {
  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: "12px",
          height: 90,
          border: `1px solid ${T.border}`,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <CircularProgress size={20} sx={{ color: T.primary }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: accentColor,
          boxShadow: `0 4px 12px ${alpha(accentColor, 0.1)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: T.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: alpha(accentColor, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 14, color: accentColor }} />
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: T.text,
            lineHeight: 1.2,
          }}
        >
          {(value ?? 0).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, icon: Icon, danger }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          color: danger ? T.error : T.textSecondary,
          "&:hover": {
            bgcolor: danger ? T.errorLight : T.grayExtraLight,
            color: danger ? T.error : T.text,
          },
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );
}

// ─── Assign to Admin Modal ─────────────────────────────────────────────────
function AssignToAdminModal({
  open,
  onClose,
  assignment,
  onAssign,
  loading,
  admins,
}) {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setSelectedAdmin("");
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setDueDate(defaultDueDate.toISOString().split("T")[0]);
      setPriority("medium");
      setNotes("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (!selectedAdmin) newErrors.selectedAdmin = "Please select an admin";
    if (!dueDate) newErrors.dueDate = "Please select a due date";
    if (!priority) newErrors.priority = "Please select priority";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onAssign({
      checklistId: assignment.checklist?._id || assignment.checklistId,
      adminId: selectedAdmin,
      dueDate,
      priority,
      notes,
    });
  };

  const priorityOptions = [
    { value: "low", label: "Low", color: "#16a34a" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "high", label: "High", color: "#ea580c" },
    { value: "critical", label: "Critical", color: "#dc2626" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: T.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Re-assign to Admin
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {assignment?.checklist?.name || assignment?.checklistName || "—"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Stack spacing={2.5}>
          <FormControl fullWidth error={!!errors.selectedAdmin}>
            <InputLabel>Select Admin *</InputLabel>
            <Select
              value={selectedAdmin}
              onChange={(e) => {
                setSelectedAdmin(e.target.value);
                setErrors({ ...errors, selectedAdmin: "" });
              }}
              label="Select Admin *"
            >
              {admins && admins.length > 0 ? (
                admins.map((admin) => {
                  let displayName =
                    admin.fullName ||
                    admin.name ||
                    admin.customerName ||
                    admin.email?.split("@")[0] ||
                    "Admin User";
                  const initial = displayName.charAt(0).toUpperCase();
                  return (
                    <MenuItem key={admin._id} value={admin._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            bgcolor: alpha(T.primary, 0.15),
                            color: T.primary,
                          }}
                        >
                          {initial}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{ fontSize: "0.85rem", fontWeight: 500 }}
                          >
                            {displayName}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.7rem", color: T.textMuted }}
                          >
                            {admin.email || "No email"}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled>
                  <Typography sx={{ fontSize: "0.82rem", color: T.textMuted }}>
                    No admins available
                  </Typography>
                </MenuItem>
              )}
            </Select>
            {errors.selectedAdmin && (
              <FormHelperText>{errors.selectedAdmin}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            type="date"
            label="Due Date *"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              setErrors({ ...errors, dueDate: "" });
            }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 18, color: T.textMuted }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth error={!!errors.priority}>
            <InputLabel>Priority *</InputLabel>
            <Select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setErrors({ ...errors, priority: "" });
              }}
              label="Priority *"
            >
              {priorityOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FlagIcon sx={{ fontSize: 16, color: opt.color }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {opt.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.priority && (
              <FormHelperText>{errors.priority}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific instructions or notes for the admin..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteAddIcon sx={{ fontSize: 18, color: T.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 1, textTransform: "none", px: 3, py: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{
            bgcolor: T.primary,
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {loading ? "Assigning..." : "Re-assign to Admin"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Assign to Team Modal ───────────────────────────────────────────────────
function AssignToTeamModal({
  open,
  onClose,
  assignment,
  onAssign,
  loading,
  teamMembers,
  assets,
}) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [assetId, setAssetId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setSelectedMembers([]);
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setDueDate(defaultDueDate.toISOString().split("T")[0]);
      setPriority("medium");
      setNotes("");
      setAssetId("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (selectedMembers.length === 0)
      newErrors.selectedMembers = "Please select at least one team member";
    if (!dueDate) newErrors.dueDate = "Please select a due date";
    if (!priority) newErrors.priority = "Please select priority";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onAssign({
      checklistId: assignment.checklist?._id || assignment.checklistId,
      teamMemberIds: selectedMembers,
      dueDate,
      priority,
      notes,
      assetId: assetId || undefined,
    });
  };

  const handleToggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
    setErrors({ ...errors, selectedMembers: "" });
  };

  const priorityOptions = [
    { value: "low", label: "Low", color: "#16a34a" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "high", label: "High", color: "#ea580c" },
    { value: "critical", label: "Critical", color: "#dc2626" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: T.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Re-assign to Team
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {assignment?.checklist?.name || assignment?.checklistName || "—"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.85rem" }}>
              Select Team Members *
            </Typography>
            <Paper
              variant="outlined"
              sx={{ maxHeight: 200, overflow: "auto", p: 1 }}
            >
              {!teamMembers || teamMembers.length === 0 ? (
                <Typography
                  sx={{
                    p: 2,
                    textAlign: "center",
                    color: T.textMuted,
                    fontSize: "0.82rem",
                  }}
                >
                  No team members found. Please add team members first.
                </Typography>
              ) : (
                teamMembers.map((member) => {
                  const memberId = member._id || member.id;
                  const displayName =
                    member.fullName ||
                    member.name ||
                    `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                    member.email ||
                    "Unknown Member";
                  const initial = displayName.charAt(0).toUpperCase();
                  const roleLabel =
                    member.role || member.teamRole || "Team Member";

                  return (
                    <Box
                      key={memberId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: alpha(T.primary, 0.05) },
                      }}
                      onClick={() => handleToggleMember(memberId)}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(memberId)}
                        onChange={() => handleToggleMember(memberId)}
                        size="small"
                      />
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          ml: 0.5,
                          mr: 1.5,
                          bgcolor: alpha(T.success, 0.15),
                          color: T.success,
                        }}
                      >
                        {initial}
                      </Avatar>
                      <Box flex={1}>
                        <Typography
                          sx={{ fontSize: "0.85rem", fontWeight: 500 }}
                        >
                          {displayName}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.7rem", color: T.textMuted }}
                        >
                          {member.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={roleLabel}
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          height: 20,
                          bgcolor: alpha(T.primary, 0.08),
                          color: T.primary,
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </Paper>
            {errors.selectedMembers && (
              <Typography sx={{ fontSize: "0.7rem", color: T.error, mt: 0.5 }}>
                {errors.selectedMembers}
              </Typography>
            )}
            <Typography
              sx={{ fontSize: "0.7rem", color: T.textMuted, mt: 0.5 }}
            >
              Selected: {selectedMembers.length} member(s)
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="date"
            label="Due Date *"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              setErrors({ ...errors, dueDate: "" });
            }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 18, color: T.textMuted }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth error={!!errors.priority}>
            <InputLabel>Priority *</InputLabel>
            <Select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setErrors({ ...errors, priority: "" });
              }}
              label="Priority *"
            >
              {priorityOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FlagIcon sx={{ fontSize: 16, color: opt.color }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {opt.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.priority && (
              <FormHelperText>{errors.priority}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Asset (Optional)</InputLabel>
            <Select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              label="Asset (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {assets && assets.length > 0 ? (
                assets.map((asset) => {
                  const assetDisplayName =
                    asset.name ||
                    asset.assetName ||
                    asset.assetId ||
                    asset.title ||
                    "Unnamed Asset";
                  const assetCode =
                    asset.assetId || asset.code || asset.assetCode || "";
                  return (
                    <MenuItem key={asset._id} value={asset._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon
                          sx={{ fontSize: 16, color: T.textMuted }}
                        />
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem" }}>
                            {assetDisplayName}
                          </Typography>
                          {assetCode && (
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: T.textMuted,
                              }}
                            >
                              {assetCode}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled>
                  <Typography sx={{ fontSize: "0.82rem", color: T.textMuted }}>
                    No assets available
                  </Typography>
                </MenuItem>
              )}
            </Select>
            <FormHelperText>
              Select an asset to associate with this checklist
            </FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific instructions or notes for the team members..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteAddIcon sx={{ fontSize: 18, color: T.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <PeopleIcon />}
          sx={{
            bgcolor: T.success,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {loading ? "Assigning..." : "Re-assign to Team"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Assignment Selection Modal ───────────────────────────────────────────────
function AssignSelectionModal({
  open,
  onClose,
  assignment,
  onAssignToAdmin,
  onAssignToTeam,
}) {
  if (!assignment) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: T.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Re-assign Checklist
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {assignment.checklist?.name || assignment.checklistName || "—"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Stack spacing={2}>
          <Box
            onClick={onAssignToAdmin}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: `1px solid ${T.border}`,
              borderRadius: 2,
              p: 2.5,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: T.primary,
                bgcolor: alpha(T.primary, 0.05),
                transform: "translateX(4px)",
              },
            }}
          >
            <Box
              sx={{
                color: T.primary,
                bgcolor: alpha(T.primary, 0.1),
                borderRadius: 1.5,
                p: 1,
                display: "flex",
              }}
            >
              <PersonAddIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box flex={1}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: T.text,
                }}
              >
                Assign to Admin
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: T.textSecondary }}>
                Re-assign this checklist to an admin user
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={onAssignToTeam}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: `1px solid ${T.border}`,
              borderRadius: 2,
              p: 2.5,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: T.success,
                bgcolor: alpha(T.success, 0.05),
                transform: "translateX(4px)",
              },
            }}
          >
            <Box
              sx={{
                color: T.success,
                bgcolor: alpha(T.success, 0.1),
                borderRadius: 1.5,
                p: 1,
                display: "flex",
              }}
            >
              <PeopleIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box flex={1}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: T.text,
                }}
              >
                Assign to Team Members
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: T.textSecondary }}>
                Re-assign this checklist directly to team members
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Mobile Card ───────────────────────────────────────────────────────────────
function MobileCard({ item, onView, onAnalytics, onAssign, onDelete }) {
  const cfg =
    STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <Paper
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${cfg.color}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: T.text,
              mb: 0.25,
            }}
          >
            {item.checklist?.name || item.checklistName || "—"}
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: T.textMuted }}>
            #{item._id?.slice(-8)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <ActionBtn
            title="View"
            onClick={onView}
            icon={VisibilityOutlinedIcon}
          />
          <ActionBtn
            title="Analytics"
            onClick={onAnalytics}
            icon={BarChartOutlinedIcon}
          />
          <ActionBtn
            title="Re-assign"
            onClick={onAssign}
            icon={PersonAddIcon}
          />
          <ActionBtn
            title="Delete"
            onClick={onDelete}
            icon={DeleteOutlineIcon}
            danger
          />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              mb: 0.3,
            }}
          >
            Customer
          </Typography>
          <Typography
            sx={{ fontSize: "0.8rem", fontWeight: 500, color: T.text }}
          >
            {item.customerName || item.assignedToAdminName || "—"}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              mb: 0.3,
            }}
          >
            Assigned By
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: T.textSecondary }}>
            {item.assignedBy?.name || "—"}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              mb: 0.3,
            }}
          >
            Due Date
          </Typography>
          <DateCell date={item.dueDate} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              mb: 0.3,
            }}
          >
            Priority
          </Typography>
          <PriorityChip priority={item.priority} />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <StatusChip status={item.status} />
        <CompletionBar rate={item.completionRate} />
      </Box>
    </Paper>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AssignedChecklist() {
  const navigate = useNavigate();
  const { authRequest, user } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { fetchTeamMembers, teamMembers } = useTeam();
  const { getAllAssets, assets } = useAsset();

  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // Assignment state
  const [assignSelectionOpen, setAssignSelectionOpen] = useState(false);
  const [assignToAdminOpen, setAssignToAdminOpen] = useState(false);
  const [assignToTeamOpen, setAssignToTeamOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [fetchingTeamMembers, setFetchingTeamMembers] = useState(false);

  const showToast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  // Fetch admins for super admin
  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) {
        setAdminsLoading(false);
        return;
      }

      let adminsData = [];
      try {
        const response = await axios.get(
          `https://assset-management-backend-4.onrender.com/api/v1/user/clients?limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        );
        const allUsers = response.data?.clients || response.data?.users || [];
        adminsData = allUsers.filter(
          (u) => u.role === "admin" || u.role === "super_admin",
        );
      } catch (err) {
        console.error("Admin fetch failed:", err);
      }
      setAdminsList(adminsData);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdminsList([]);
    } finally {
      setAdminsLoading(false);
    }
  }, [isSuperAdmin]);

  // Fetch team members for admin
  const fetchTeamMembersForModal = useCallback(async () => {
    if (!isAdmin) return;
    setFetchingTeamMembers(true);
    try {
      await fetchTeamMembers({ page: 1, limit: 100 }, true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (teamMembers && teamMembers.length > 0) {
        setTeamMembersList(teamMembers);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembersList([]);
    } finally {
      setFetchingTeamMembers(false);
    }
  }, [isAdmin, fetchTeamMembers, teamMembers]);

  const fetchAssetsForModal = useCallback(async () => {
    if (!isAdmin) return;
    try {
      await getAllAssets({ limit: 100, page: 1 });
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  }, [isAdmin, getAllAssets]);

  useEffect(() => {
    if (isAdmin && teamMembers && teamMembers.length > 0) {
      setTeamMembersList(teamMembers);
    }
  }, [isAdmin, teamMembers]);

  useEffect(() => {
    if (assignSelectionOpen) {
      if (isSuperAdmin) fetchAdmins();
      if (isAdmin) {
        fetchTeamMembersForModal();
        fetchAssetsForModal();
      }
    }
  }, [
    assignSelectionOpen,
    isSuperAdmin,
    isAdmin,
    fetchAdmins,
    fetchTeamMembersForModal,
    fetchAssetsForModal,
  ]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authRequest("GET", "/assignments");
      if (response?.success) {
        setAssignments(response.assignments || []);
        setStats(response.stats || {});
      }
    } catch (err) {
      showToast(err.message || "Failed to load assignments", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authRequest]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const handleViewDetails = (a) =>
    navigate(`/admin/assignment-details/${a._id}`);
  const handleViewAnalytics = (a) => {
    const id = a.checklist?._id;
    id
      ? navigate(`/admin/checklist-analytics/${id}`)
      : showToast("Checklist ID not found", "error");
  };

  // Handle assign click
  const handleAssignClick = (assignment) => {
    setSelectedAssignment(assignment);
    setAssignSelectionOpen(true);
  };

  const handleAssignToAdmin = () => {
    setAssignSelectionOpen(false);
    setAssignToAdminOpen(true);
  };

  const handleAssignToTeam = () => {
    setAssignSelectionOpen(false);
    setAssignToTeamOpen(true);
  };

  const handleAssignToAdminSubmit = async (data) => {
    setAssignLoading(true);
    try {
      const response = await authRequest(
        "POST",
        "/assignments/assign-to-admin",
        data,
      );
      if (response?.success) {
        setAssignToAdminOpen(false);
        setSelectedAssignment(null);
        showToast("Checklist re-assigned to admin successfully!");
        fetchAssignments();
      } else {
        showToast(response?.message || "Assignment failed", "error");
      }
    } catch (error) {
      showToast(
        error.message || "An error occurred during assignment",
        "error",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignToTeamSubmit = async (data) => {
    setAssignLoading(true);
    try {
      const response = await authRequest(
        "POST",
        "/assignments/assign-to-team",
        data,
      );
      if (response?.success) {
        setAssignToTeamOpen(false);
        setSelectedAssignment(null);
        showToast("Checklist re-assigned to team members successfully!");
        fetchAssignments();
      } else {
        showToast(response?.message || "Assignment failed", "error");
      }
    } catch (error) {
      showToast(
        error.message || "An error occurred during assignment",
        "error",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteClick = (a) => setDeleteDialog({ open: true, item: a });
  const handleDeleteCancel = () => setDeleteDialog({ open: false, item: null });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      const response = await authRequest(
        "DELETE",
        `/assignments/${deleteDialog.item._id}`,
      );
      if (response?.success) {
        showToast("Assignment deleted successfully", "success");
        await fetchAssignments();
      } else {
        showToast(response?.message || "Failed to delete assignment", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to delete assignment", "error");
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  // Filtering
  const filtered = useMemo(() => {
    let d = [...assignments];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(
        (i) =>
          i.checklist?.name?.toLowerCase().includes(q) ||
          i.customerName?.toLowerCase().includes(q) ||
          i.checklistName?.toLowerCase().includes(q) ||
          i.assignedToAdminName?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      d = d.filter((i) => i.status?.toLowerCase() === statusFilter);
    if (priorityFilter !== "all")
      d = d.filter((i) => i.priority?.toLowerCase() === priorityFilter);
    return d;
  }, [assignments, search, statusFilter, priorityFilter]);

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const hasFilters =
    statusFilter !== "all" || priorityFilter !== "all" || search;

  const statCards = [
    {
      label: "Total",
      value: stats?.total || 0,
      icon: AssignmentOutlinedIcon,
      accentColor: T.primary,
    },
    {
      label: "Pending",
      value: stats?.pending || 0,
      icon: PendingActionsIcon,
      accentColor: T.warning,
    },
    {
      label: "In Progress",
      value: stats?.in_progress || 0,
      icon: HourglassTopOutlinedIcon,
      accentColor: T.primary,
    },
    {
      label: "Submitted",
      value: stats?.submitted || 0,
      icon: RateReviewIcon,
      accentColor: T.purple,
    },
    {
      label: "Completed",
      value: (stats?.completed || 0) + (stats?.approved || 0),
      icon: CheckCircleOutlineIcon,
      accentColor: T.success,
    },
    {
      label: "Overdue",
      value: stats?.overdue || 0,
      icon: ErrorOutlineIcon,
      accentColor: T.error,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ minHeight: "100vh", bgcolor: T.bg, p: { xs: 2, sm: 3, md: 4 } }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                color: T.text,
                letterSpacing: "-0.02em",
              }}
            >
              Assigned Checklists
            </Typography>
            <Typography
              sx={{ color: T.textSecondary, mt: 0.5, fontSize: "0.875rem" }}
            >
              Track, manage, and re-assign checklist assignments
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                border: `1px solid ${T.border}`,
                borderRadius: "10px",
                bgcolor: T.surface,
              }}
            >
              {refreshing ? (
                <CircularProgress size={18} />
              ) : (
                <RefreshIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stat Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(6, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} loading={loading} />
          ))}
        </Box>

        {/* Filter Bar */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "12px",
            border: `1px solid ${T.border}`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              placeholder="Search by checklist or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ flex: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: T.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 140 } }}
            >
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: cfg.color,
                        }}
                      />
                      {cfg.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 130 } }}
            >
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="all">All Priority</MenuItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: cfg.color,
                        }}
                      />
                      {cfg.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasFilters && (
              <Button
                size="small"
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setSearch("");
                  setPage(0);
                }}
                sx={{ color: T.error, px: 2 }}
              >
                Clear
              </Button>
            )}
          </Stack>
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.75rem", color: T.textSecondary }}>
              Showing {Math.min(page * rowsPerPage + 1, filtered.length)}–
              {Math.min(page * rowsPerPage + rowsPerPage, filtered.length)} of{" "}
              {filtered.length} assignments
            </Typography>
          </Box>
        </Paper>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: T.primary }} />
          </Box>
        ) : paginated.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: "12px",
              border: `1px solid ${T.border}`,
            }}
          >
            <AssignmentOutlinedIcon
              sx={{ fontSize: 48, color: T.border, mb: 1.5 }}
            />
            <Typography sx={{ color: T.textSecondary, fontSize: "0.9rem" }}>
              {hasFilters
                ? "No assignments match your filters"
                : "No assignments found"}
            </Typography>
            {hasFilters && (
              <Button
                size="small"
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setSearch("");
                }}
                sx={{ mt: 1.5 }}
              >
                Clear all filters
              </Button>
            )}
          </Paper>
        ) : isMobile ? (
          <Box>
            {paginated.map((item) => (
              <MobileCard
                key={item._id}
                item={item}
                onView={() => handleViewDetails(item)}
                onAnalytics={() => handleViewAnalytics(item)}
                onAssign={() => handleAssignClick(item)}
                onDelete={() => handleDeleteClick(item)}
              />
            ))}
          </Box>
        ) : (
          <Paper
            sx={{
              borderRadius: "12px",
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 1080 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Checklist</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Assigned By</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Completion</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((item) => {
                    const cfg =
                      STATUS_CONFIG[item.status?.toLowerCase()] ||
                      STATUS_CONFIG.pending;
                    return (
                      <TableRow
                        key={item._id}
                        hover
                        sx={{
                          borderLeft: `2px solid transparent`,
                          transition: "all 0.15s",
                          "&:hover": {
                            bgcolor: alpha(T.grayExtraLight, 0.5),
                            "& td:first-of-type": {
                              borderLeft: `2px solid ${cfg.color}`,
                            },
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: T.text,
                            }}
                          >
                            {item.checklist?.name || item.checklistName || "—"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: T.textMuted,
                              mt: 0.25,
                            }}
                          >
                            #{item._id?.slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: "0.75rem",
                                bgcolor: T.primaryLight,
                                color: T.primary,
                              }}
                            >
                              {(item.customerName ||
                                item.assignedToAdminName ||
                                "?")[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  color: T.text,
                                }}
                              >
                                {item.customerName ||
                                  item.assignedToAdminName ||
                                  "—"}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.7rem", color: T.textMuted }}
                              >
                                {item.customerEmail || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontSize: "0.875rem", color: T.text }}
                          >
                            {item.assignedBy?.name || "—"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: T.textMuted,
                              textTransform: "capitalize",
                            }}
                          >
                            {item.assignedByRole || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <DateCell date={item.dueDate} />
                        </TableCell>
                        <TableCell>
                          <PriorityChip priority={item.priority} />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                        <TableCell>
                          <CompletionBar rate={item.completionRate} />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            <ActionBtn
                              title="View Details"
                              onClick={() => handleViewDetails(item)}
                              icon={VisibilityOutlinedIcon}
                            />
                            <ActionBtn
                              title="View Analytics"
                              onClick={() => handleViewAnalytics(item)}
                              icon={BarChartOutlinedIcon}
                            />
                            <ActionBtn
                              title="Re-assign"
                              onClick={() => handleAssignClick(item)}
                              icon={PersonAddIcon}
                            />
                            <ActionBtn
                              title="Delete"
                              onClick={() => handleDeleteClick(item)}
                              icon={DeleteOutlineIcon}
                              danger
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                borderTop: `1px solid ${T.border}`,
                bgcolor: T.grayExtraLight,
              }}
            >
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    fontSize: "0.8rem",
                    minHeight: 48,
                  },
                }}
              />
            </Box>
          </Paper>
        )}
      </Box>

      {/* Assignment Modals */}
      <AssignSelectionModal
        open={assignSelectionOpen}
        assignment={selectedAssignment}
        onClose={() => {
          setAssignSelectionOpen(false);
          setSelectedAssignment(null);
        }}
        onAssignToAdmin={handleAssignToAdmin}
        onAssignToTeam={handleAssignToTeam}
      />

      <AssignToAdminModal
        open={assignToAdminOpen}
        assignment={selectedAssignment}
        admins={adminsList}
        onClose={() => {
          setAssignToAdminOpen(false);
          setSelectedAssignment(null);
        }}
        onAssign={handleAssignToAdminSubmit}
        loading={assignLoading}
      />

      <AssignToTeamModal
        open={assignToTeamOpen}
        assignment={selectedAssignment}
        teamMembers={teamMembersList}
        assets={assets}
        onClose={() => {
          setAssignToTeamOpen(false);
          setSelectedAssignment(null);
        }}
        onAssign={handleAssignToTeamSubmit}
        loading={assignLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: "16px", maxWidth: 420 } }}
      >
        <Box
          sx={{ height: 4, bgcolor: T.error, borderRadius: "16px 16px 0 0" }}
        />
        <DialogTitle sx={{ pt: 2.5, pb: 1, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: T.errorLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningAmberIcon sx={{ color: T.error, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: "1rem", color: T.text }}
              >
                Delete Assignment
              </Typography>
              <Typography
                sx={{ fontSize: "0.7rem", color: T.textMuted, mt: 0.2 }}
              >
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography
            sx={{ fontSize: "0.85rem", color: T.textSecondary, mb: 2 }}
          >
            You are about to permanently delete:
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: T.grayExtraLight,
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.9rem", color: T.text }}
            >
              {deleteDialog.item?.checklist?.name ||
                deleteDialog.item?.checklistName ||
                "—"}
            </Typography>
            <Typography
              sx={{ fontSize: "0.7rem", color: T.textMuted, mt: 0.3 }}
            >
              #{deleteDialog.item?._id?.slice(-8)}
            </Typography>
          </Box>
          <Typography
            sx={{ fontSize: "0.75rem", color: T.textSecondary, mb: 1 }}
          >
            The following data will also be removed:
          </Typography>
          {[
            "All submission responses",
            "Uploaded photos & attachments",
            "Inspection history records",
          ].map((item, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: T.error,
                }}
              />
              <Typography sx={{ fontSize: "0.8rem", color: T.textSecondary }}>
                {item}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            variant="outlined"
            sx={{ borderRadius: "8px", px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            startIcon={
              deleting ? (
                <CircularProgress size={14} />
              ) : (
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              bgcolor: T.error,
              borderRadius: "8px",
              px: 2.5,
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
