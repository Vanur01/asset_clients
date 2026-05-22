// pages/admin/ChecklistPage.jsx (Complete Fixed Version)

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  alpha,
  Tooltip,
  Collapse,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import PublicIcon from "@mui/icons-material/Public";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ArchiveIcon from "@mui/icons-material/Archive";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import BusinessIcon from "@mui/icons-material/Business";
import { useNavigate } from "react-router-dom";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useRequestChecklist } from "../context/RequestChecklistContext";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { useAsset } from "../context/AssetContext";
import SubmitRequestModal from "./SubmitRequestModal";
import axios from "axios";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e8f2f5",
  success: "#16a34a",
  successBg: "#dcfce7",
  surface: "#f1f4f8",
  card: "#ffffff",
  border: "#e2e8f0",
  error: "#d32f2f",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  info: "#3b82f6",
  infoBg: "#dbeafe",
  text: { primary: "#1e293b", secondary: "#64748b", disabled: "#94a3b8" },
};

const fz = (s) =>
  ({
    xs: { xs: "0.65rem", sm: "0.7rem" },
    sm: { xs: "0.7rem", sm: "0.75rem" },
    md: { xs: "0.75rem", sm: "0.82rem" },
    lg: { xs: "0.82rem", sm: "0.9rem" },
    xl: { xs: "0.9rem", sm: "1rem" },
  })[s];

// ─── Status chips ─────────────────────────────────────────────────────────────
const statusConfig = {
  active: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
    label: "Active",
  },
  draft: {
    bg: "#fef3c7",
    color: "#f59e0b",
    icon: <PendingIcon sx={{ fontSize: 11 }} />,
    label: "Draft",
  },
  archived: {
    bg: "#f1f5f9",
    color: "#94a3b8",
    icon: <ArchiveIcon sx={{ fontSize: 11 }} />,
    label: "Archived",
  },
};

const StatusChip = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={cfg.icon}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: fz("xs"),
        height: 24,
        borderRadius: "20px",
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

const REQUEST_STATUS_CONFIG = {
  approved: {
    bg: "#ecfdf5",
    color: "#065f46",
    label: "Approved",
    Icon: CheckCircleIcon,
  },
  rejected: {
    bg: "#fef2f2",
    color: "#991b1b",
    label: "Rejected",
    Icon: CloseIcon,
  },
  under_review: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    label: "Under Review",
    Icon: RateReviewIcon,
  },
  pending: {
    bg: "#fff8e1",
    color: "#b45309",
    label: "Pending",
    Icon: PendingIcon,
  },
  cancelled: {
    bg: "#f1f5f9",
    color: "#64748b",
    label: "Cancelled",
    Icon: ArchiveIcon,
  },
};

const RequestStatusChip = ({ status }) => {
  const key = typeof status === "string" ? status : status?.status || "pending";
  const cfg = REQUEST_STATUS_CONFIG[key] || REQUEST_STATUS_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <Chip
      size="small"
      label={cfg.label}
      icon={<Icon sx={{ fontSize: "11px !important" }} />}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: fz("xs"),
        height: 24,
        borderRadius: "6px",
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

const URGENCY_MAP = {
  low: { bg: "#ecfdf5", color: "#065f46", label: "LOW" },
  medium: { bg: "#fff8e1", color: "#b45309", label: "MEDIUM" },
  high: { bg: "#fff3e0", color: "#c2410c", label: "HIGH" },
  critical: { bg: "#fef2f2", color: "#991b1b", label: "CRITICAL" },
};

const UrgencyChip = ({ level }) => {
  const cfg = URGENCY_MAP[level?.toLowerCase()] || URGENCY_MAP.medium;
  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: fz("xs"),
        height: 22,
        borderRadius: "4px",
      }}
    />
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  active,
  onClick,
}) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: "12px",
      border: `1.5px solid ${active ? iconColor : alpha(C.primary, 0.08)}`,
      boxShadow: active ? `0 0 0 3px ${alpha(iconColor, 0.15)}` : "none",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      width: "223px",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${alpha(C.primary, 0.1)}`,
      },
    }}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: fz("xs"),
              fontWeight: 600,
              color: C.text.disabled,
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: fz("xl"),
              fontWeight: 800,
              color: active ? iconColor : C.primary,
            }}
          >
            {value ?? 0}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Action Button Component ─────────────────────────────────────────────────
const ActionBtn = ({ title, onClick, icon, bgColor, color }) => (
  <Tooltip title={title} arrow>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        bgcolor: alpha(bgColor, 0.1),
        color: color,
        borderRadius: 1.5,
        width: 32,
        height: 32,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(bgColor, 0.2),
          transform: "scale(1.05)",
        },
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 16 } })}
    </IconButton>
  </Tooltip>
);

// ─── Create Checklist Modal ───────────────────────────────────────────────────
const CHECKLIST_TYPES = [
  {
    icon: <ArticleOutlinedIcon sx={{ fontSize: 22 }} />,
    label: "Custom Checklist",
    desc: "Create a custom checklist from scratch",
    redirectTo: "/admin/create-checklist/custom",
    color: C.primary,
  },
  {
    icon: <PublicIcon sx={{ fontSize: 22 }} />,
    label: "Global Checklist",
    desc: "Use predefined global templates",
    redirectTo: "/admin/create-checklist/global",
    color: C.info,
  },
  {
    icon: <TableChartIcon sx={{ fontSize: 22 }} />,
    label: "Import from Excel",
    desc: "Upload Excel file to generate checklist",
    redirectTo: "/admin/import-checklist/excel",
    color: C.success,
  },
];

function CreateChecklistModal({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Create New Checklist
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.5,
              }}
            >
              Choose the type of checklist to create
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Stack spacing={2}>
          {CHECKLIST_TYPES.map((item, i) => (
            <Box
              key={i}
              onClick={() => {
                onClose();
                navigate(item.redirectTo);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: `1px solid ${C.border}`,
                borderRadius: 2,
                p: 2.5,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: item.color,
                  bgcolor: C.primaryLight,
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box sx={{ color: item.color }}>{item.icon}</Box>
              <Box flex={1}>
                <Typography
                  sx={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: C.text.primary,
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.72rem", color: C.text.secondary }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </Box>
          ))}
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

// ─── Assign to Admin Modal ─────────────────────────────────────────────────
function AssignToAdminModal({
  open,
  onClose,
  checklist,
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
      setDueDate("");
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
      checklistId: checklist._id,
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
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Assign Checklist to Admin
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {checklist?.name}
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
                            bgcolor: alpha(C.primary, 0.15),
                            color: C.primary,
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
                            sx={{ fontSize: "0.7rem", color: C.text.disabled }}
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
                  <Typography
                    sx={{ fontSize: "0.82rem", color: C.text.disabled }}
                  >
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
                  <CalendarTodayIcon
                    sx={{ fontSize: 18, color: C.text.disabled }}
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
                  <NoteAddIcon sx={{ fontSize: 18, color: C.text.disabled }} />
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
            bgcolor: C.primary,
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {loading ? "Assigning..." : "Assign to Admin"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Assign to Team Modal ───────────────────────────────────────────────────
function AssignToTeamModal({
  open,
  onClose,
  checklist,
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
      setDueDate("");
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
      checklistId: checklist._id,
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
        : [...prev, memberId]
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
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Assign Checklist to Team
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {checklist?.name}
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
                    color: C.text.disabled,
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
                        "&:hover": { bgcolor: alpha(C.primary, 0.05) },
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
                          bgcolor: alpha(C.success, 0.15),
                          color: C.success,
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
                          sx={{ fontSize: "0.7rem", color: C.text.disabled }}
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
                          bgcolor: alpha(C.primary, 0.08),
                          color: C.primary,
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </Paper>
            {errors.selectedMembers && (
              <Typography sx={{ fontSize: "0.7rem", color: C.error, mt: 0.5 }}>
                {errors.selectedMembers}
              </Typography>
            )}
            <Typography
              sx={{ fontSize: "0.7rem", color: C.text.disabled, mt: 0.5 }}
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
                  <CalendarTodayIcon
                    sx={{ fontSize: 18, color: C.text.disabled }}
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
                          sx={{ fontSize: 16, color: C.text.disabled }}
                        />
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem" }}>
                            {assetDisplayName}
                          </Typography>
                          {assetCode && (
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: C.text.disabled,
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
                  <Typography
                    sx={{ fontSize: "0.82rem", color: C.text.disabled }}
                  >
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
                  <NoteAddIcon sx={{ fontSize: 18, color: C.text.disabled }} />
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
            bgcolor: C.success,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {loading ? "Assigning..." : "Assign to Team"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Assignment Selection Modal ───────────────────────────────────────────────
function AssignSelectionModal({
  open,
  onClose,
  checklist,
  onAssignToAdmin,
  onAssignToTeam,
  isSuperAdmin,
}) {
  if (!checklist) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Assign Checklist
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
              noWrap
            >
              {checklist.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Stack spacing={2}>
          {isSuperAdmin ? (
            <Box
              onClick={onAssignToAdmin}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: `1px solid ${C.border}`,
                borderRadius: 2,
                p: 2.5,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: C.primary,
                  bgcolor: alpha(C.primary, 0.05),
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box
                sx={{
                  color: C.primary,
                  bgcolor: alpha(C.primary, 0.1),
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
                    color: C.text.primary,
                  }}
                >
                  Assign to Admin
                </Typography>
                <Typography
                  sx={{ fontSize: "0.7rem", color: C.text.secondary }}
                >
                  Assign checklist to an admin user who will further assign to
                  team members
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={onAssignToTeam}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: `1px solid ${C.border}`,
                borderRadius: 2,
                p: 2.5,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: C.success,
                  bgcolor: alpha(C.success, 0.05),
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box
                sx={{
                  color: C.success,
                  bgcolor: alpha(C.success, 0.1),
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
                    color: C.text.primary,
                  }}
                >
                  Assign to Team Members
                </Typography>
                <Typography
                  sx={{ fontSize: "0.7rem", color: C.text.secondary }}
                >
                  Assign checklist directly to team members
                </Typography>
              </Box>
            </Box>
          )}
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

// ─── Table Header Cell ────────────────────────────────────────────────────────
const TH = ({ children, width }) => (
  <TableCell
    sx={{
      fontWeight: 700,
      fontSize: fz("xs"),
      whiteSpace: "nowrap",
      py: 1.5,
      color: C.text.secondary,
      bgcolor: "#f8fafc",
      ...(width && { width }),
    }}
  >
    {children}
  </TableCell>
);

// ─── Request Filter Bar ───────────────────────────────────────────────────────
function RequestFilterBar({ filters, onChange, onClear, activeCount }) {
  const [expanded, setExpanded] = useState(false);
  const CATEGORIES = [
    "Safety",
    "Equipment",
    "Environmental",
    "Quality",
    "Compliance",
    "Maintenance",
    "Audit",
    "Customer Success",
    "Sales",
    "Development",
    "Marketing",
  ];
  const SORT_OPTIONS = [
    { value: "createdAt_desc", label: "Newest First" },
    { value: "createdAt_asc", label: "Oldest First" },
    { value: "urgencyLevel_desc", label: "Urgency High→Low" },
    { value: "urgencyLevel_asc", label: "Urgency Low→High" },
  ];

  const selectSx = {
    fontSize: "0.78rem",
    "& .MuiSelect-select": { py: 0.9 },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: C.primary,
    },
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={expanded ? 1.5 : 0}>
        <TextField
          size="small"
          placeholder="Search by name, category..."
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value, page: 1 })
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: C.text.disabled }} />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onChange({ ...filters, search: "", page: 1 })}
                >
                  <ClearIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { fontSize: "0.78rem", borderRadius: 1.5 },
          }}
          sx={{ flex: 1, maxWidth: 380 }}
        />
        <Badge badgeContent={activeCount} color="primary">
          <Button
            size="small"
            variant={expanded ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: expanded ? C.primary : undefined,
              borderColor: C.border,
              color: expanded ? "#fff" : C.text.secondary,
            }}
          >
            Filters
          </Button>
        </Badge>
        {activeCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClear}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: "0.75rem",
              color: C.error,
            }}
          >
            Clear
          </Button>
        )}
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => onChange({ ...filters })}>
            <RefreshIcon sx={{ fontSize: 18, color: C.text.secondary }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={expanded}>
        <Grid container spacing={1.5} sx={{ pt: 1.5 }}>
          {[
            {
              label: "Status",
              key: "status",
              items: Object.entries(REQUEST_STATUS_CONFIG).map(([k, v]) => ({
                value: k,
                label: v.label,
              })),
            },
            {
              label: "Urgency",
              key: "urgencyLevel",
              items: Object.entries(URGENCY_MAP).map(([k, v]) => ({
                value: k,
                label: v.label,
              })),
            },
            {
              label: "Category",
              key: "category",
              items: CATEGORIES.map((c) => ({ value: c, label: c })),
            },
          ].map(({ label, key, items }) => (
            <Grid item xs={6} sm={3} key={key}>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: C.text.secondary,
                  mb: 0.5,
                }}
              >
                {label}
              </Typography>
              <Select
                fullWidth
                size="small"
                value={filters[key]}
                displayEmpty
                sx={selectSx}
                onChange={(e) =>
                  onChange({ ...filters, [key]: e.target.value, page: 1 })
                }
              >
                <MenuItem value="">
                  <em style={{ fontSize: "0.78rem" }}>All</em>
                </MenuItem>
                {items.map(({ value, label }) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={{ fontSize: "0.78rem" }}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          ))}
          <Grid item xs={6} sm={3}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: C.text.secondary,
                mb: 0.5,
              }}
            >
              Sort By
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              sx={selectSx}
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("_");
                onChange({ ...filters, sortBy, sortOrder, page: 1 });
              }}
            >
              <MenuItem value="_">
                <em style={{ fontSize: "0.78rem" }}>Default</em>
              </MenuItem>
              {SORT_OPTIONS.map((o) => (
                <MenuItem
                  key={o.value}
                  value={o.value}
                  sx={{ fontSize: "0.78rem" }}
                >
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
}

// ─── Review Request Dialog Component ──────────────────────────────────────────
function ReviewRequestDialog({ open, onClose, request, onReview, loading }) {
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (open) {
      setRejectionReason("");
    }
  }, [open]);

  const handleReview = (action) => {
    onReview(action, action === "rejected" ? rejectionReason : null);
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary, color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Review Request
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
            >
              {request.checklistName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Request Details */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: "0.85rem" }}>
              Request Details
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                  Requested By
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  {request.requestedByName ||
                    request.requestedBy?.name ||
                    request.requestedBy?.email ||
                    "—"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                  Category
                </Typography>
                <Chip
                  label={request.category}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: alpha(C.primary, 0.08),
                    color: C.primary,
                    fontSize: "0.7rem",
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                  Urgency Level
                </Typography>
                <Box mt={0.5}>
                  <UrgencyChip level={request.urgencyLevel} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                  Submission Date
                </Typography>
                <Typography sx={{ fontSize: "0.85rem" }}>
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Request Reason */}
          {request.reason && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.85rem" }}>
                Request Reason
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: C.text.secondary }}>
                {request.reason}
              </Typography>
            </Paper>
          )}

          {/* Reference Files */}
          {request.referenceFiles?.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.85rem" }}>
                Reference Files ({request.referenceFiles.length})
              </Typography>
              <Stack spacing={1}>
                {request.referenceFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1,
                      bgcolor: alpha(C.info, 0.05),
                      borderRadius: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachFileIcon sx={{ fontSize: 16, color: C.text.disabled }} />
                      <Typography sx={{ fontSize: "0.8rem" }}>
                        {file.name || `File ${index + 1}`}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => {
                        if (file.url) {
                          window.open(file.url, "_blank");
                        }
                      }}
                      sx={{ fontSize: "0.7rem", textTransform: "none" }}
                    >
                      Download
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Decision */}
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.85rem" }}>
              Decision
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant={rejectionReason ? "outlined" : "contained"}
                onClick={() => setRejectionReason("")}
                fullWidth
                sx={{
                  bgcolor: !rejectionReason ? C.success : undefined,
                  color: !rejectionReason ? "#fff" : C.success,
                  borderColor: C.success,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: !rejectionReason ? alpha(C.success, 0.8) : undefined,
                  },
                }}
              >
                Approve
              </Button>
              <Button
                variant={rejectionReason ? "contained" : "outlined"}
                onClick={() => setRejectionReason("This request does not meet our current requirements.")}
                fullWidth
                sx={{
                  bgcolor: rejectionReason ? C.error : undefined,
                  color: rejectionReason ? "#fff" : C.error,
                  borderColor: C.error,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: rejectionReason ? alpha(C.error, 0.8) : undefined,
                  },
                }}
              >
                Reject
              </Button>
            </Stack>

            {rejectionReason && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                required
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? "Rejection reason is required" : ""}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleReview(rejectionReason ? "rejected" : "approved")}
          disabled={loading || (rejectionReason && !rejectionReason.trim())}
          variant="contained"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{
            bgcolor: rejectionReason ? C.error : C.success,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              bgcolor: rejectionReason ? alpha(C.error, 0.8) : alpha(C.success, 0.8),
            },
          }}
        >
          {loading
            ? "Processing..."
            : rejectionReason
              ? "Reject Request"
              : "Approve Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  search: "",
  status: "",
  urgencyLevel: "",
  category: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const [tabValue, setTabValue] = useState(0);

  const {
    getAllChecklists,
    deleteChecklist,
    assignChecklistToAdmin,
    assignChecklistToTeam,
    loading: checklistLoading,
    error: checklistError,
    success: checklistSuccess,
    clearMessages: clearChecklistMessages,
  } = useChecklistBuilder();
  const {
    submitRequest,
    getAllRequests,
    getRequestStats,
    reviewRequest,
    deleteRequest,
    downloadRequestFile,
    loading: requestLoading,
    clearMessages: clearRequestMessages,
  } = useRequestChecklist();
  const { fetchTeamMembers, teamMembers: contextTeamMembers } = useTeam();
  const { getAllAssets, assets: assetsList } = useAsset();

  const [checklists, setChecklists] = useState([]);
  const [checklistPagination, setChecklistPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const [assignSelectionOpen, setAssignSelectionOpen] = useState(false);
  const [assignToAdminOpen, setAssignToAdminOpen] = useState(false);
  const [assignToTeamOpen, setAssignToTeamOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [fetchingTeamMembers, setFetchingTeamMembers] = useState(false);

  const [deleteChecklistDialog, setDeleteChecklistDialog] = useState({
    open: false,
    item: null,
    loading: false,
  });

  const [requests, setRequests] = useState([]);
  const [requestPagination, setRequestPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0,
    total: 0,
  });
  const [activeStatFilter, setActiveStatFilter] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    request: null,
  });
  const [viewDialog, setViewDialog] = useState({ open: false, request: null });
  const [deleteReqDialog, setDeleteReqDialog] = useState({
    open: false,
    request: null,
    loading: false,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showToast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const closeToast = () => setSnackbar((p) => ({ ...p, open: false }));

  const activeFilterCount =
    [filters.status, filters.urgencyLevel, filters.category].filter(Boolean)
      .length + (activeStatFilter ? 1 : 0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch admins for super admin
  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
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
          }
        );
        const allUsers = response.data?.clients || response.data?.users || [];
        adminsData = allUsers.filter(
          (u) => u.role === "admin" || u.role === "super_admin"
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
      if (contextTeamMembers && contextTeamMembers.length > 0) {
        setTeamMembersList(contextTeamMembers);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembersList([]);
    } finally {
      setFetchingTeamMembers(false);
    }
  }, [isAdmin, fetchTeamMembers, contextTeamMembers]);

  const fetchAssetsForModal = useCallback(async () => {
    if (!isAdmin) return;
    try {
      await getAllAssets({ limit: 100, page: 1 });
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  }, [isAdmin, getAllAssets]);

  useEffect(() => {
    if (isAdmin && contextTeamMembers && contextTeamMembers.length > 0) {
      setTeamMembersList(contextTeamMembers);
    }
  }, [isAdmin, contextTeamMembers]);

  useEffect(() => {
    if (isSuperAdmin) fetchAdmins();
    if (isAdmin) {
      fetchTeamMembersForModal();
      fetchAssetsForModal();
    }
  }, [
    isSuperAdmin,
    isAdmin,
    fetchAdmins,
    fetchTeamMembersForModal,
    fetchAssetsForModal,
  ]);

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

  const fetchChecklists = useCallback(async () => {
    const params = {
      page: checklistPagination.page,
      limit: checklistPagination.limit,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    const result = await getAllChecklists(params);
    if (result.success && result.data) {
      const arr = Array.isArray(result.data)
        ? result.data
        : result.data.checklists || [];
      setChecklists(arr);
      if (result.data.pagination) {
        setChecklistPagination((p) => ({
          ...p,
          total: result.data.pagination.total || 0,
          totalPages: result.data.pagination.totalPages || 1,
        }));
      }
    }
  }, [
    getAllChecklists,
    debouncedSearch,
    checklistPagination.page,
    checklistPagination.limit,
  ]);

  const fetchStats = useCallback(async () => {
    const result = await getRequestStats();
    if (result.success && result.data) {
      const counts = result.data.counts || result.data.summary || result.data;
      setStats({
        pending: counts.pending || 0,
        approved: counts.approved || 0,
        rejected: counts.rejected || 0,
        under_review: counts.under_review || 0,
        total: counts.total || 0,
      });
    }
  }, [getRequestStats]);

  const fetchRequests = useCallback(
    async (overrideFilters) => {
      const f = overrideFilters || filters;
      const params = {
        page: f.page,
        limit: f.limit,
        ...(f.search && { search: f.search }),
        ...(f.status && { status: f.status }),
        ...(f.urgencyLevel && { urgencyLevel: f.urgencyLevel }),
        ...(f.category && { category: f.category }),
        ...(f.sortBy && { sortBy: f.sortBy }),
        ...(f.sortOrder && { sortOrder: f.sortOrder }),
      };
      const result = await getAllRequests(params);
      if (result.success && result.data) {
        const rows = result.data.requests || result.data || [];
        setRequests(Array.isArray(rows) ? rows : []);
        const pg = result.data.pagination || {};
        setRequestPagination({
          page: pg.page || 1,
          limit: pg.limit || 10,
          total: pg.total || 0,
          totalPages: pg.pages || pg.totalPages || 1,
        });
      } else setRequests([]);
    },
    [getAllRequests, filters]
  );

  useEffect(() => {
    if (tabValue === 0) fetchChecklists();
  }, [tabValue, fetchChecklists]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchStats();
      fetchRequests();
    }
  }, [tabValue]);

  useEffect(() => {
    if (tabValue === 1) fetchRequests();
  }, [filters]);

  useEffect(() => {
    if (checklistSuccess) {
      showToast(checklistSuccess);
      clearChecklistMessages();
      fetchChecklists();
    }
    if (checklistError) {
      showToast(checklistError, "error");
      clearChecklistMessages();
    }
  }, [checklistSuccess, checklistError]);

  const handleAssignClick = (checklist) => {
    setSelectedChecklist(checklist);
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
      const result = await assignChecklistToAdmin(data);
      if (result.success) {
        setAssignToAdminOpen(false);
        setSelectedChecklist(null);
        showToast("Checklist assigned to admin successfully!");
      } else {
        showToast(result.error || "Assignment failed", "error");
      }
    } catch (error) {
      showToast("An error occurred during assignment", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignToTeamSubmit = async (data) => {
    setAssignLoading(true);
    try {
      const result = await assignChecklistToTeam(data);
      if (result.success) {
        setAssignToTeamOpen(false);
        setSelectedChecklist(null);
        showToast("Checklist assigned to team members successfully!");
      } else {
        showToast(result.error || "Assignment failed", "error");
      }
    } catch (error) {
      showToast("An error occurred during assignment", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStatClick = (statusKey) => {
    const newStatus = activeStatFilter === statusKey ? "" : statusKey;
    setActiveStatFilter(newStatus);
    setFilters((f) => ({ ...f, status: newStatus, page: 1 }));
  };

  const handleSubmitRequest = async (formData) => {
    setSubmitLoading(true);
    try {
      const result = await submitRequest(formData);
      if (result.success) {
        setSubmitDialogOpen(false);
        showToast("Request submitted successfully!");
        fetchStats();
        fetchRequests();
      } else {
        showToast(result.error || "Failed to submit request", "error");
      }
    } catch (error) {
      showToast("Unexpected error occurred", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fixed: Handle review request with proper parameters
  const handleReviewRequest = async (action, rejectionReason = null) => {
    if (!reviewDialog.request) return;
    setReviewLoading(true);
    try {
      const result = await reviewRequest(
        reviewDialog.request._id,
        action,
        rejectionReason
      );
      if (result.success) {
        setReviewDialog({ open: false, request: null });
        showToast(`Request ${action.replace(/_/g, " ")} successfully!`);
        fetchStats();
        fetchRequests();
      } else {
        showToast(result.error || "Failed to process request", "error");
      }
    } catch (error) {
      console.error("Review error:", error);
      showToast("Unexpected error occurred", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteReqDialog.request) return;
    setDeleteReqDialog((p) => ({ ...p, loading: true }));
    try {
      const result = await deleteRequest(deleteReqDialog.request._id);
      if (result.success) {
        setDeleteReqDialog({ open: false, request: null, loading: false });
        setViewDialog({ open: false, request: null });
        showToast("Request deleted successfully!");
        fetchStats();
        fetchRequests();
      } else {
        showToast(result.error || "Failed to delete request", "error");
        setDeleteReqDialog((p) => ({ ...p, loading: false }));
      }
    } catch (error) {
      showToast("Unexpected error occurred", "error");
      setDeleteReqDialog((p) => ({ ...p, loading: false }));
    }
  };

  const handleDeleteChecklist = async () => {
    if (!deleteChecklistDialog.item) return;
    setDeleteChecklistDialog((p) => ({ ...p, loading: true }));
    const result = await deleteChecklist(deleteChecklistDialog.item._id);
    if (result.success) {
      setDeleteChecklistDialog({ open: false, item: null, loading: false });
      showToast("Checklist deleted successfully");
      fetchChecklists();
    } else {
      showToast(result.error || "Failed to delete checklist", "error");
      setDeleteChecklistDialog((p) => ({ ...p, loading: false }));
    }
  };

  const isLoading = checklistLoading || requestLoading;

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      {isLoading && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            height: 2,
            bgcolor: alpha(C.primary, 0.15),
            "& .MuiLinearProgress-bar": { bgcolor: C.primary },
          }}
        />
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: fz("xl"), color: C.text.primary }}
          >
            Checklist Management
          </Typography>
          <Typography
            sx={{ fontSize: fz("sm"), color: C.text.secondary, mt: 0.5 }}
          >
            Manage checklists and review requests
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {tabValue === 0 && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigate("/admin/checklists/clone")}
                sx={{
                  borderColor: C.primary,
                  color: C.primary,
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontSize: "0.8rem",
                  px: 2,
                  py: 1,
                }}
              >
                Clone
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  bgcolor: C.primary,
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontSize: "0.8rem",
                  px: 2,
                  py: 1,
                }}
              >
                Create Checklist
              </Button>
            </>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => setSubmitDialogOpen(true)}
            sx={{
              bgcolor: C.primaryDark,
              textTransform: "none",
              borderRadius: 1.5,
              fontSize: "0.8rem",
              px: 2,
              py: 1,
              "&:hover": { bgcolor: C.primary },
            }}
          >
            Request Checklist
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{ border: `1px solid ${C.border}`, borderRadius: 1, mb: 3 }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            setSearch("");
            setFilters(DEFAULT_FILTERS);
            setActiveStatFilter("");
          }}
          sx={{
            borderBottom: `1px solid ${C.border}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              py: 1.5,
              minHeight: 48,
            },
            "& .MuiTabs-indicator": { bgcolor: C.primary },
          }}
        >
          <Tab label={`Checklists (${checklistPagination.total || 0})`} />
          <Tab label={`Requests (${stats.total || 0})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: CHECKLISTS */}
      {tabValue === 0 && (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${C.border}`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${C.border}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search checklists by name, category or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: C.text.disabled }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { fontSize: "0.8rem", borderRadius: 1.5 },
              }}
            />
          </Box>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  {[
                    "#",
                    "Name",
                    "Category",
                    "Type",
                    "Fields",
                    "Status",
                    "Version",
                    "Created By",
                    "Actions",
                  ].map((h) => (
                    <TH key={h}>{h}</TH>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {checklistLoading && checklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} sx={{ color: C.primary }} />
                    </TableCell>
                  </TableRow>
                ) : checklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <AssignmentIcon
                        sx={{
                          fontSize: 40,
                          color: C.text.disabled,
                          mb: 1,
                          display: "block",
                          mx: "auto",
                        }}
                      />
                      <Typography
                        sx={{ color: C.text.disabled, fontSize: "0.85rem" }}
                      >
                        {debouncedSearch
                          ? "No checklists match your search"
                          : "No checklists found"}
                      </Typography>
                      {!debouncedSearch && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setCreateOpen(true)}
                          sx={{
                            mt: 2,
                            bgcolor: C.primary,
                            borderRadius: 2,
                            textTransform: "none",
                          }}
                        >
                          Create Your First Checklist
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  checklists.map((c, idx) => (
                    <TableRow
                      key={c._id}
                      hover
                      sx={{ "&:hover": { bgcolor: alpha(C.primary, 0.02) } }}
                    >
                      <TableCell
                        sx={{
                          fontSize: fz("xs"),
                          color: C.text.disabled,
                          width: 40,
                        }}
                      >
                        {(checklistPagination.page - 1) *
                          checklistPagination.limit +
                          idx +
                          1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: fz("sm"),
                            color: C.primary,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.65rem", color: C.text.disabled }}
                        >
                          ID: {c._id?.slice(-8)}
                        </Typography>
                        {c.description && (
                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              color: C.text.secondary,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.category || "Uncategorized"}
                          size="small"
                          sx={{
                            bgcolor: alpha(C.primary, 0.08),
                            color: C.primary,
                            fontWeight: 600,
                            fontSize: fz("xs"),
                            height: 22,
                            borderRadius: "5px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.type || "custom"}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: fz("xs"),
                            height: 22,
                            borderRadius: "5px",
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: fz("sm"),
                          color: C.text.secondary,
                          textAlign: "center",
                        }}
                      >
                        {c.totalFields ?? 0}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={c.status} />
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: fz("xs"), color: C.text.secondary }}
                      >
                        {c.version || "v1.0"}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <Avatar
                            sx={{
                              width: 22,
                              height: 22,
                              bgcolor: C.primaryLight,
                              fontSize: "0.6rem",
                              color: C.primary,
                            }}
                          >
                            {c.createdBy?.name?.charAt(0) || "U"}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: fz("xs"),
                              color: C.text.secondary,
                              maxWidth: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.createdBy?.name || "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <ActionBtn
                            title="Assign Checklist"
                            icon={<AssignmentIcon />}
                            bgColor={C.success}
                            color={C.success}
                            onClick={() => handleAssignClick(c)}
                          />
                          <ActionBtn
                            title="Clone"
                            icon={<ContentCopyIcon />}
                            bgColor={C.info}
                            color={C.info}
                            onClick={() =>
                              navigate(`/admin/checklists/clone?id=${c._id}`)
                            }
                          />
                          <ActionBtn
                            title="Delete"
                            icon={<DeleteIcon />}
                            bgColor={C.error}
                            color={C.error}
                            onClick={() =>
                              setDeleteChecklistDialog({
                                open: true,
                                item: c,
                                loading: false,
                              })
                            }
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2}
            py={1.5}
            borderTop={`1px solid ${C.border}`}
          >
            <Typography sx={{ fontSize: fz("xs"), color: C.text.secondary }}>
              {checklistPagination.total > 0
                ? `Showing ${(checklistPagination.page - 1) * checklistPagination.limit + 1}–${Math.min(checklistPagination.page * checklistPagination.limit, checklistPagination.total)} of ${checklistPagination.total} checklists`
                : "No checklists"}
            </Typography>
            {checklistPagination.totalPages > 1 && (
              <Pagination
                count={checklistPagination.totalPages}
                page={checklistPagination.page}
                onChange={(_, v) =>
                  setChecklistPagination((p) => ({ ...p, page: v }))
                }
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Paper>
      )}

      {/* TAB 1: REQUESTS */}
      {tabValue === 1 && (
        <>
          <Grid container spacing={2} mb={3}>
            {[
              {
                key: "total",
                label: "Total",
                icon: <AssignmentIcon />,
                iconBg: alpha(C.primary, 0.1),
                iconColor: C.primary,
              },
              {
                key: "pending",
                label: "Pending",
                icon: <PendingIcon />,
                iconBg: alpha("#b45309", 0.1),
                iconColor: "#b45309",
              },
              {
                key: "under_review",
                label: "Under Review",
                icon: <RateReviewIcon />,
                iconBg: alpha("#1d4ed8", 0.1),
                iconColor: "#1d4ed8",
              },
              {
                key: "approved",
                label: "Approved",
                icon: <CheckCircleIcon />,
                iconBg: alpha("#065f46", 0.1),
                iconColor: "#065f46",
              },
              {
                key: "rejected",
                label: "Rejected",
                icon: <CloseIcon />,
                iconBg: alpha(C.error, 0.1),
                iconColor: C.error,
              },
            ].map(({ key, label, icon, iconBg, iconColor }) => (
              <Grid item xs={6} sm={4} md={2.4} key={key}>
                <StatCard
                  label={label}
                  value={stats[key] ?? 0}
                  icon={icon}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  active={activeStatFilter === key && key !== "total"}
                  onClick={
                    key !== "total" ? () => handleStatClick(key) : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>

          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${C.border}` }}>
              <RequestFilterBar
                filters={filters}
                onChange={setFilters}
                onClear={() => {
                  setActiveStatFilter("");
                  setFilters(DEFAULT_FILTERS);
                }}
                activeCount={activeFilterCount}
              />
            </Box>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    {[
                      "#",
                      "Checklist Name",
                      "Requested By",
                      "Category",
                      "Urgency",
                      "Status",
                      "Files",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestLoading && requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} sx={{ color: C.primary }} />
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <AssignmentIcon
                          sx={{
                            fontSize: 36,
                            color: C.text.disabled,
                            mb: 1,
                            display: "block",
                            mx: "auto",
                          }}
                        />
                        <Typography
                          sx={{ color: C.text.disabled, fontSize: "0.85rem" }}
                        >
                          {activeFilterCount > 0
                            ? "No requests match your filters"
                            : "No requests found"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((row, idx) => (
                      <TableRow
                        key={row._id}
                        hover
                        sx={{ "&:hover": { bgcolor: alpha(C.primary, 0.02) } }}
                      >
                        <TableCell
                          sx={{
                            fontSize: fz("xs"),
                            color: C.text.disabled,
                            width: 40,
                          }}
                        >
                          {(filters.page - 1) * filters.limit + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: fz("sm"),
                              color: C.primary,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.checklistName}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.65rem", color: C.text.disabled }}
                          >
                            ID: {row._id?.slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: fz("sm"), whiteSpace: "nowrap" }}
                        >
                          {row.requestedByName ||
                            row.requestedBy?.name ||
                            row.requestedBy?.email ||
                            "—"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.category}
                            size="small"
                            sx={{
                              bgcolor: alpha(C.primary, 0.08),
                              color: C.primary,
                              fontWeight: 600,
                              fontSize: fz("xs"),
                              height: 22,
                              borderRadius: "5px",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <UrgencyChip level={row.urgencyLevel} />
                        </TableCell>
                        <TableCell>
                          <RequestStatusChip status={row.status} />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: fz("xs"),
                            color: C.text.secondary,
                            textAlign: "center",
                          }}
                        >
                          {row.referenceFiles?.length > 0 ? (
                            <Chip
                              label={row.referenceFiles.length}
                              size="small"
                              icon={
                                <AttachFileIcon
                                  sx={{ fontSize: "11px !important" }}
                                />
                              }
                              sx={{
                                bgcolor: alpha(C.info, 0.1),
                                color: C.info,
                                fontWeight: 600,
                                fontSize: fz("xs"),
                                height: 22,
                                borderRadius: "5px",
                                "& .MuiChip-icon": { color: C.info },
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: fz("xs"),
                            color: C.text.secondary,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {row.status === "approved" &&
                              row.resultingChecklist && (
                                <ActionBtn
                                  title="Assign Checklist"
                                  icon={<AssignmentIcon />}
                                  bgColor={C.success}
                                  color={C.success}
                                  onClick={() =>
                                    handleAssignClick({
                                      _id: row.resultingChecklist,
                                      name: row.checklistName,
                                    })
                                  }
                                />
                              )}
                            {isSuperAdmin &&
                              ["pending", "under_review"].includes(
                                row.status
                              ) && (
                                <ActionBtn
                                  title="Review"
                                  icon={<RateReviewIcon />}
                                  bgColor={C.info}
                                  color={C.info}
                                  onClick={() =>
                                    setReviewDialog({
                                      open: true,
                                      request: row,
                                    })
                                  }
                                />
                              )}
                            {isSuperAdmin && (
                              <ActionBtn
                                title="Delete"
                                icon={<DeleteIcon />}
                                bgColor={C.error}
                                color={C.error}
                                onClick={() =>
                                  setDeleteReqDialog({
                                    open: true,
                                    request: row,
                                    loading: false,
                                  })
                                }
                              />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1.5}
              borderTop={`1px solid ${C.border}`}
            >
              <Typography sx={{ fontSize: fz("xs"), color: C.text.secondary }}>
                {requestPagination.total > 0
                  ? `Showing ${(filters.page - 1) * filters.limit + 1}–${Math.min(filters.page * filters.limit, requestPagination.total)} of ${requestPagination.total} requests`
                  : "No requests"}
              </Typography>
              {requestPagination.totalPages > 1 && (
                <Pagination
                  count={requestPagination.totalPages}
                  page={filters.page}
                  onChange={(_, v) => setFilters((p) => ({ ...p, page: v }))}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* ─── Dialogs ─────────────────────────────────────────────────────────── */}
      <CreateChecklistModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <AssignSelectionModal
        open={assignSelectionOpen}
        checklist={selectedChecklist}
        onClose={() => {
          setAssignSelectionOpen(false);
          setSelectedChecklist(null);
        }}
        onAssignToAdmin={handleAssignToAdmin}
        onAssignToTeam={handleAssignToTeam}
        isSuperAdmin={isSuperAdmin}
      />
      <AssignToAdminModal
        open={assignToAdminOpen}
        checklist={selectedChecklist}
        admins={adminsList}
        onClose={() => {
          setAssignToAdminOpen(false);
          setSelectedChecklist(null);
        }}
        onAssign={handleAssignToAdminSubmit}
        loading={assignLoading}
      />
      <AssignToTeamModal
        open={assignToTeamOpen}
        checklist={selectedChecklist}
        teamMembers={teamMembersList}
        assets={assetsList}
        onClose={() => {
          setAssignToTeamOpen(false);
          setSelectedChecklist(null);
        }}
        onAssign={handleAssignToTeamSubmit}
        loading={assignLoading}
      />
      <SubmitRequestModal
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        onSubmit={handleSubmitRequest}
        loading={submitLoading}
      />

      {/* Review Request Dialog */}
      <ReviewRequestDialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, request: null })}
        request={reviewDialog.request}
        onReview={handleReviewRequest}
        loading={reviewLoading}
      />

      {/* Delete Checklist Confirm */}
      <Dialog
        open={deleteChecklistDialog.open}
        onClose={() =>
          setDeleteChecklistDialog({ open: false, item: null, loading: false })
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(C.error, 0.06),
            color: C.error,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Delete Checklist
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: "0.88rem" }}>
            Are you sure you want to delete{" "}
            <strong>{deleteChecklistDialog.item?.name}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() =>
              setDeleteChecklistDialog({
                open: false,
                item: null,
                loading: false,
              })
            }
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteChecklist}
            disabled={deleteChecklistDialog.loading}
            variant="contained"
            size="small"
            startIcon={
              deleteChecklistDialog.loading ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              bgcolor: C.error,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {deleteChecklistDialog.loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Request Confirm */}
      <Dialog
        open={deleteReqDialog.open}
        onClose={() =>
          setDeleteReqDialog({ open: false, request: null, loading: false })
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(C.error, 0.06),
            color: C.error,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Delete Request
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: "0.88rem" }}>
            Are you sure you want to delete the request for{" "}
            <strong>{deleteReqDialog.request?.checklistName}</strong>? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() =>
              setDeleteReqDialog({ open: false, request: null, loading: false })
            }
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRequest}
            disabled={deleteReqDialog.loading}
            variant="contained"
            size="small"
            startIcon={
              deleteReqDialog.loading ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              bgcolor: C.error,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {deleteReqDialog.loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}