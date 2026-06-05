// pages/AuditLogs.jsx
// Only two APIs used:
//   GET /audit-logs          — all roles, backend filters by role
//   GET /audit-logs/statistics — super admin only
//
// npm deps: xlsx, jspdf, jspdf-autotable, date-fns, @mui/x-date-pickers

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  LinearProgress,
  Skeleton,
  alpha,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ShieldOutlined as ShieldIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  GridOn as CsvIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAudit } from "../context/AuditContext";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Design tokens ─── */
const T = {
  radius: "10px",
  radiusLg: "14px",
  border: "1px solid",
  borderColor: "#f0f0f0",
  cardBg: "#ffffff",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  accent: "#0f4c61",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

/* ─── Action config ─── */
const ACTION_CONFIG = {
  CREATE: {
    label: "Create",
    bg: "#f0fdf4",
    color: "#16a34a",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  UPDATE: {
    label: "Update",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  DELETE: {
    label: "Delete",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  SOFT_DELETE: {
    label: "Soft Del",
    bg: "#fff7ed",
    color: "#ea580c",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  LOGIN: {
    label: "Login",
    bg: "#f5f3ff",
    color: "#1a5c6b",
    icon: <LoginIcon sx={{ fontSize: 11 }} />,
  },
  LOGOUT: {
    label: "Logout",
    bg: "#f9fafb",
    color: "#6b7280",
    icon: <LogoutIcon sx={{ fontSize: 11 }} />,
  },
  PASSWORD_CHANGE: {
    label: "Pwd Change",
    bg: "#fdf4ff",
    color: "#7c3aed",
    icon: <HistoryIcon sx={{ fontSize: 11 }} />,
  },
  PASSWORD_RESET: {
    label: "Pwd Reset",
    bg: "#fdf4ff",
    color: "#7c3aed",
    icon: <HistoryIcon sx={{ fontSize: 11 }} />,
  },
  STATUS_CHANGE: {
    label: "Status Chg",
    bg: "#fffbeb",
    color: "#d97706",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_CREATED: {
    label: "Asset Created",
    bg: "#f0fdf4",
    color: "#16a34a",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_UPDATED: {
    label: "Asset Updated",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_DELETED: {
    label: "Asset Deleted",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_CLONED: {
    label: "Asset Cloned",
    bg: "#e0e7ff",
    color: "#4f46e5",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_STATUS_UPDATED: {
    label: "Asset Status",
    bg: "#fffbeb",
    color: "#d97706",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  ASSET_REQUEST_CREATED: {
    label: "Asset Req",
    bg: "#d1fae5",
    color: "#059669",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_CREATE: {
    label: "Cat Create",
    bg: "#f0fdf4",
    color: "#16a34a",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_UPDATE: {
    label: "Cat Update",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  CATEGORY_DELETE: {
    label: "Cat Delete",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_CREATED: {
    label: "Loc Created",
    bg: "#f0fdf4",
    color: "#16a34a",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_UPDATED: {
    label: "Loc Updated",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  LOCATION_DELETED: {
    label: "Loc Deleted",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_CREATED: {
    label: "Role Created",
    bg: "#f0fdf4",
    color: "#16a34a",
    icon: <CreateIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_UPDATED: {
    label: "Role Updated",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: <EditIcon sx={{ fontSize: 11 }} />,
  },
  ROLE_DELETED: {
    label: "Role Deleted",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: <DeleteIcon sx={{ fontSize: 11 }} />,
  },
  ASSIGN: {
    label: "Assign",
    bg: "#e0e7ff",
    color: "#4f46e5",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  SUBMIT: {
    label: "Submit",
    bg: "#d1fae5",
    color: "#059669",
    icon: <CheckCircleIcon sx={{ fontSize: 11 }} />,
  },
  default: {
    label: "Event",
    bg: "#f9fafb",
    color: "#6b7280",
    icon: <EventIcon sx={{ fontSize: 11 }} />,
  },
};

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin", bg: "#fef2f2", color: "#dc2626" },
  admin: { label: "Admin", bg: "#fff7ed", color: "#ea580c" },
  team: { label: "Team", bg: "#f0fdf4", color: "#16a34a" },
  default: { label: "Member", bg: "#f9fafb", color: "#6b7280" },
};

const STATUS_CONFIG = {
  success: { label: "Success", bg: "#f0fdf4", color: "#16a34a" },
  failed: { label: "Failed", bg: "#fef2f2", color: "#dc2626" },
};

/* ─── Helpers ─── */
const fmtDisplay = (d) => (d ? format(new Date(d), "MMM dd, yyyy") : "—");
const fmtTime = (d) => (d ? format(new Date(d), "HH:mm:ss") : "");
const fmtFull = (d) =>
  d ? format(new Date(d), "MMM dd, yyyy · HH:mm:ss") : "—";

/* ─── StatCard ─── */
function StatCard({ label, value, icon, color, loading, subtitle }) {
  if (loading)
    return (
      <Skeleton
        variant="rectangular"
        height={88}
        sx={{ borderRadius: T.radius }}
      />
    );
  return (
    <Box
      sx={{
        bgcolor: T.cardBg,
        border: T.border,
        borderColor: T.borderColor,
        borderRadius: T.radius,
        p: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          bgcolor: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          fontSize={11}
          color={T.textMuted}
          fontWeight={500}
          lineHeight={1.2}
        >
          {label}
        </Typography>
        <Typography
          fontSize={22}
          fontWeight={700}
          color={T.textPrimary}
          lineHeight={1.3}
        >
          {(value ?? 0).toLocaleString()}
        </Typography>
        {subtitle && (
          <Typography fontSize={10} color={T.textMuted}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── ActionChip ─── */
function ActionChip({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: "7px",
        py: "2px",
        borderRadius: "6px",
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

/* ─── RoleChip ─── */
function RoleChip({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "6px",
        py: "1px",
        borderRadius: "5px",
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </Box>
  );
}

/* ─── StatusChip ─── */
function StatusChip({ status }) {
  if (!status)
    return (
      <Typography fontSize={12} color={T.textMuted}>
        —
      </Typography>
    );
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: "#f9fafb",
    color: "#6b7280",
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "7px",
        py: "2px",
        borderRadius: "6px",
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </Box>
  );
}

/* ─── RoleHeader ─── */
function RoleHeader({ isSuperAdmin, isAdmin }) {
  if (isSuperAdmin)
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ShieldIcon sx={{ fontSize: 20, color: "#dc2626" }} />
        <Box>
          <Typography fontSize={13} fontWeight={600} color="#dc2626">
            Super Admin Access
          </Typography>
          <Typography fontSize={11} color={T.textMuted}>
            Full system audit trail
          </Typography>
        </Box>
      </Box>
    );
  if (isAdmin)
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BusinessIcon sx={{ fontSize: 20, color: "#ea580c" }} />
        <Box>
          <Typography fontSize={13} fontWeight={600} color="#ea580c">
            Organization Activity
          </Typography>
          <Typography fontSize={11} color={T.textMuted}>
            Activity within your organization
          </Typography>
        </Box>
      </Box>
    );
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <PersonIcon sx={{ fontSize: 20, color: "#16a34a" }} />
      <Box>
        <Typography fontSize={13} fontWeight={600} color="#16a34a">
          My Activity
        </Typography>
        <Typography fontSize={11} color={T.textMuted}>
          Your personal action history
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── ExportButton ─── */
function ExportButton({ onExport, exporting, disabled }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const handleClick = (fmt) => {
    setAnchor(null);
    onExport(fmt);
  };
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ArrowDownIcon sx={{ fontSize: 13 }} />}
        startIcon={
          exporting ? (
            <CircularProgress size={11} />
          ) : (
            <DownloadIcon sx={{ fontSize: 13 }} />
          )
        }
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={exporting || disabled}
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "8px",
        }}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            border: T.border,
            borderColor: T.borderColor,
            borderRadius: T.radius,
            mt: 0.5,
            minWidth: 160,
          },
        }}
      >
        {[
          {
            fmt: "csv",
            label: "Export as CSV",
            Icon: CsvIcon,
            color: "#16a34a",
          },
          {
            fmt: "excel",
            label: "Export as Excel",
            Icon: ExcelIcon,
            color: "#2563eb",
          },
          {
            fmt: "pdf",
            label: "Export as PDF",
            Icon: PdfIcon,
            color: "#dc2626",
          },
        ].map(({ fmt, label, Icon, color }) => (
          <MenuItem
            key={fmt}
            onClick={() => handleClick(fmt)}
            sx={{ fontSize: 12, py: "7px" }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Icon sx={{ fontSize: 16, color }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 12 }}>
              {label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* ─── FilterBar ─── */
function FilterBar({
  filters,
  onChange,
  onReset,
  onExport,
  onRefresh,
  loading,
  exporting,
  dateKey,
  isSuperAdmin,
  isAdmin,
}) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const placeholder = isSuperAdmin
    ? "Search logs…"
    : isAdmin
      ? "Search organization activity…"
      : "Search your activity…";

  return (
    <Box
      sx={{
        bgcolor: T.cardBg,
        border: T.border,
        borderColor: T.borderColor,
        borderRadius: T.radius,
        p: { xs: "12px", sm: "14px 16px" },
        mb: 2,
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <FilterListIcon sx={{ fontSize: 14, color: T.textMuted }} />
          <Typography fontSize={12} fontWeight={600} color={T.textSecondary}>
            Filters
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
          onClick={onReset}
          sx={{ fontSize: 11, color: T.textMuted, textTransform: "none" }}
        >
          Reset
        </Button>
      </Box>

      {/* Controls */}
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder={placeholder}
          value={filters.search || ""}
          onChange={(e) => onChange("search", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 14, color: T.textMuted }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: 12,
              borderRadius: "8px",
              width: isMobile ? "100%" : 220,
            },
          }}
        />

        {/* Action */}
        <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 150 }}>
          <InputLabel sx={{ fontSize: 12 }}>Action</InputLabel>
          <Select
            value={filters.action || ""}
            label="Action"
            onChange={(e) => onChange("action", e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="" sx={{ fontSize: 12 }}>
              All
            </MenuItem>
            {Object.entries(ACTION_CONFIG)
              .filter(([k]) => k !== "default")
              .map(([k, v]) => (
                <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>
                  {v.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Resource */}
        <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 130 }}>
          <InputLabel sx={{ fontSize: 12 }}>Resource</InputLabel>
          <Select
            value={filters.resource || ""}
            label="Resource"
            onChange={(e) => onChange("resource", e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="" sx={{ fontSize: 12 }}>
              All
            </MenuItem>
            {[
              "user",
              "asset",
              "checklist",
              "client",
              "team",
              "assignment",
              "category",
              "location",
              "role",
            ].map((r) => (
              <MenuItem
                key={r}
                value={r}
                sx={{ fontSize: 12, textTransform: "capitalize" }}
              >
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status */}
        <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 120 }}>
          <InputLabel sx={{ fontSize: 12 }}>Status</InputLabel>
          <Select
            value={filters.status || ""}
            label="Status"
            onChange={(e) => onChange("status", e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="" sx={{ fontSize: 12 }}>
              All
            </MenuItem>
            <MenuItem value="success" sx={{ fontSize: 12 }}>
              Success
            </MenuItem>
            <MenuItem value="failed" sx={{ fontSize: 12 }}>
              Failed
            </MenuItem>
          </Select>
        </FormControl>

        {/* Role filter — super admin only */}
        {isSuperAdmin && (
          <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 130 }}>
            <InputLabel sx={{ fontSize: 12 }}>Role</InputLabel>
            <Select
              value={filters.actorRole || ""}
              label="Role"
              onChange={(e) => onChange("actorRole", e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px" }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}>
                All
              </MenuItem>
              <MenuItem value="super_admin" sx={{ fontSize: 12 }}>
                Super Admin
              </MenuItem>
              <MenuItem value="admin" sx={{ fontSize: 12 }}>
                Admin
              </MenuItem>
              <MenuItem value="team" sx={{ fontSize: 12 }}>
                Team
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Date range */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            key={`s-${dateKey}`}
            label="From"
            value={filters.startDate}
            onChange={(d) => onChange("startDate", d)}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  width: isMobile ? "100%" : 140,
                  "& .MuiInputBase-root": { fontSize: 12, borderRadius: "8px" },
                },
              },
            }}
          />
          <DatePicker
            key={`e-${dateKey}`}
            label="To"
            value={filters.endDate}
            onChange={(d) => onChange("endDate", d)}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  width: isMobile ? "100%" : 140,
                  "& .MuiInputBase-root": { fontSize: 12, borderRadius: "8px" },
                },
              },
            }}
          />
        </LocalizationProvider>

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 0.75, ml: "auto", flexShrink: 0 }}>
          <ExportButton onExport={onExport} exporting={exporting} />
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={
              loading ? (
                <CircularProgress size={11} sx={{ color: "#fff" }} />
              ) : (
                <RefreshIcon sx={{ fontSize: 13 }} />
              )
            }
            onClick={onRefresh}
            disabled={loading}
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: T.accent,
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/* ─── DetailDialog ─── */
function DetailDialog({ open, onClose, log, onExportSingle }) {
  if (!log) return null;

  const Field = ({ label, children }) => (
    <Box>
      <Typography
        fontSize={10.5}
        color={T.textMuted}
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing={0.5}
        mb={0.5}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: T.radiusLg,
          border: T.border,
          borderColor: T.borderColor,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: T.border,
          borderColor: T.borderColor,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              bgcolor: alpha(T.accent, 0.08),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
            }}
          >
            <HistoryIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography fontSize={14} fontWeight={700} color={T.textPrimary}>
            Log Details
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: T.textMuted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Timestamp / Action / Status */}
          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            <Field label="Timestamp">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
              >
                {fmtFull(log.createdAt)}
              </Typography>
            </Field>
            <Field label="Action">
              <Box mt={0.25}>
                <ActionChip action={log.action} />
              </Box>
            </Field>
            <Field label="Status">
              <Box mt={0.25}>
                <StatusChip status={log.status} />
              </Box>
            </Field>
          </Box>

          <Divider sx={{ borderColor: T.borderColor }} />

          {/* User / Resource */}
          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            <Field label="User">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
              >
                {log.actor?.email || "Unknown"}
              </Typography>
              <Box mt={0.5}>
                <RoleChip role={log.actorRole} />
              </Box>
            </Field>
            <Field label="Resource">
              <Typography
                fontSize={12.5}
                fontWeight={500}
                color={T.textPrimary}
                textTransform="capitalize"
              >
                {log.resource}
              </Typography>
              {log.resourceId && (
                <Typography
                  fontSize={11}
                  color={T.textMuted}
                  fontFamily={T.fontMono}
                  mt={0.25}
                >
                  {log.resourceId}
                </Typography>
              )}
            </Field>
          </Box>

          {/* Description */}
          <Field label="Description">
            <Box
              sx={{
                bgcolor: "#f9fafb",
                border: T.border,
                borderColor: T.borderColor,
                borderRadius: "8px",
                p: "10px 12px",
              }}
            >
              <Typography
                fontSize={12.5}
                color={T.textPrimary}
                lineHeight={1.6}
              >
                {log.description || "No description provided"}
              </Typography>
            </Box>
          </Field>

          {/* IP / UA */}
          {(log.ipAddress || log.userAgent) && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {log.ipAddress && (
                <Field label="IP Address">
                  <Typography
                    fontSize={12}
                    fontFamily={T.fontMono}
                    color={T.textPrimary}
                  >
                    {log.ipAddress}
                  </Typography>
                </Field>
              )}
              {log.userAgent && (
                <Field label="User Agent">
                  <Typography
                    fontSize={11}
                    fontFamily={T.fontMono}
                    color={T.textSecondary}
                    sx={{ wordBreak: "break-all", lineHeight: 1.5 }}
                  >
                    {log.userAgent}
                  </Typography>
                </Field>
              )}
            </Box>
          )}

          {/* Before / After diffs */}
          {log.oldData && (
            <Field label="Before changes">
              <Box
                sx={{
                  bgcolor: "#fff7ed",
                  border: T.border,
                  borderColor: "#fed7aa",
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#92400e",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(log.oldData, null, 2)}
                </pre>
              </Box>
            </Field>
          )}
          {log.newData && (
            <Field label="After changes">
              <Box
                sx={{
                  bgcolor: "#f0fdf4",
                  border: T.border,
                  borderColor: "#bbf7d0",
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#14532d",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(log.newData, null, 2)}
                </pre>
              </Box>
            </Field>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <Field label="Metadata">
              <Box
                sx={{
                  bgcolor: "#f8faff",
                  border: T.border,
                  borderColor: "#c7d2fe",
                  borderRadius: "8px",
                  p: "10px 12px",
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: T.fontMono,
                    color: "#3730a3",
                    lineHeight: 1.6,
                  }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </Box>
            </Field>
          )}
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: T.border,
          borderColor: T.borderColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ExportButton
          onExport={(fmt) => onExportSingle(log, fmt)}
          exporting={false}
        />
        <Button
          onClick={onClose}
          size="small"
          variant="contained"
          disableElevation
          sx={{
            bgcolor: T.textPrimary,
            color: "#fff",
            borderRadius: "8px",
            fontSize: 12,
            fontWeight: 600,
            px: 2,
            textTransform: "none",
            "&:hover": { bgcolor: "#1f2937" },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

/* ─── Export utilities ─── */
function buildExportRows(logs, includeActor) {
  const header = [
    "Timestamp",
    "Date",
    "Time",
    "Action",
    "Status",
    ...(includeActor ? ["User Email", "User Role"] : []),
    "Resource",
    "Resource ID",
    "Description",
    "IP Address",
  ];
  const rows = logs.map((l) => [
    l.createdAt ? format(new Date(l.createdAt), "MMM dd, yyyy HH:mm:ss") : "",
    l.createdAt ? format(new Date(l.createdAt), "yyyy-MM-dd") : "",
    l.createdAt ? format(new Date(l.createdAt), "HH:mm:ss") : "",
    ACTION_CONFIG[l.action]?.label || l.action,
    l.status || "",
    ...(includeActor ? [l.actor?.email || "Unknown", l.actorRole || ""] : []),
    l.resource || "",
    l.resourceId || "",
    l.description || "",
    l.ipAddress || "",
  ]);
  return { header, rows };
}

function exportCSV(logs, filename, includeActor) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(logs, filename, includeActor, stats) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = header.map((h) => ({
    wch:
      h === "Description"
        ? 50
        : h === "Timestamp"
          ? 24
          : h.includes("Email")
            ? 28
            : 14,
  }));
  XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

  // Summary sheet (includes stats if provided — super admin only)
  const today = format(new Date(), "yyyy-MM-dd");
  const summaryData = [
    ["Metric", "Value"],
    ["Exported records", logs.length],
    ["Export date", today],
    ...(stats
      ? [
          ["Total system actions", stats.total || 0],
          ["Actions today", stats.today || 0],
          ["Action types", stats.byAction?.length || 0],
          ["Resources tracked", stats.byResource?.length || 0],
        ]
      : []),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summaryData),
    "Summary",
  );
  XLSX.writeFile(wb, filename);
}

function exportPDF(logs, filename, includeActor, roleLabel) {
  const { header, rows } = buildExportRows(logs, includeActor);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Audit Logs", 40, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Generated ${format(new Date(), "MMM dd, yyyy · HH:mm")}  ·  ${logs.length} records  ·  ${roleLabel}`,
    40,
    62,
  );
  doc.setTextColor(0);
  autoTable(doc, {
    head: [header],
    body: rows,
    startY: 75,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: header.reduce((acc, h, i) => {
      if (h === "Description") acc[i] = { cellWidth: 120 };
      if (h === "Timestamp") acc[i] = { cellWidth: 80 };
      return acc;
    }, {}),
  });
  doc.save(filename);
}

function exportSingleLog(log, fmt, includeActor) {
  const date = log.createdAt
    ? format(new Date(log.createdAt), "yyyy-MM-dd")
    : "log";
  const base = `audit-log-${log._id || date}`;
  if (fmt === "csv") exportCSV([log], `${base}.csv`, includeActor);
  if (fmt === "excel") exportExcel([log], `${base}.xlsx`, includeActor, null);
  if (fmt === "pdf")
    exportPDF([log], `${base}.pdf`, includeActor, "Single log");
}

/* ═══════════════════════════════════════
   Main Component
═══════════════════════════════════════ */
const AuditLogs = () => {
  const {
    auditLogs,
    loading,
    error,
    stats,
    statsLoading,
    pagination,
    filters,
    isSuperAdmin,
    isAdmin,
    isTeam,
    fetchAuditLogs,
    fetchAuditStats,
    updateFilters,
    resetFilters,
    clearError,
    getPageTitle,
    getPageDescription,
  } = useAudit();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  /* ── Fetch on mount / page / filter change ── */
  useEffect(() => {
    fetchAuditLogs(page + 1, rowsPerPage);
    if (isSuperAdmin) fetchAuditStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters]);

  /* ── Derived stats for non-super-admin (computed from loaded page) ── */
  const derivedStats = useMemo(() => {
    if (isSuperAdmin) return null;
    const today = format(new Date(), "yyyy-MM-dd");
    const todayCount = (auditLogs || []).filter(
      (l) =>
        l.createdAt && format(new Date(l.createdAt), "yyyy-MM-dd") === today,
    ).length;
    const unique = new Set((auditLogs || []).map((l) => l.actor?.email)).size;
    const types = new Set((auditLogs || []).map((l) => l.action)).size;
    return {
      total: pagination?.total || auditLogs?.length || 0,
      today: todayCount,
      unique,
      types,
    };
  }, [isSuperAdmin, auditLogs, pagination]);

  /* ── Stats display values ── */
  // Super admin: real API stats shape → { total, byAction, byResource, today }
  // Others: derived from current page data
  const displayStats = isSuperAdmin
    ? {
        total: stats?.total,
        today: stats?.today,
        // API has no uniqueActors — use resource count as a proxy
        unique: stats?.byResource?.reduce((s, r) => s + r.count, 0),
        types: stats?.byAction?.length,
      }
    : derivedStats;

  /* ── Sort (client-side on current page) ── */
  const handleSort = (col) => {
    setOrder(orderBy === col && order === "asc" ? "desc" : "asc");
    setOrderBy(col);
  };

  const sortedLogs = useMemo(
    () =>
      [...(auditLogs || [])].sort((a, b) => {
        let av = a[orderBy],
          bv = b[orderBy];
        if (orderBy === "createdAt") {
          av = new Date(av);
          bv = new Date(bv);
        }
        return order === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
      }),
    [auditLogs, orderBy, order],
  );

  /* ── Filters ── */
  const handleFilterChange = (field, value) => {
    updateFilters({ [field]: value });
    setPage(0);
  };

  const handleReset = () => {
    resetFilters();
    setPage(0);
    setDatePickerKey((p) => p + 1);
  };

  const handleRefresh = () => {
    fetchAuditLogs(page + 1, rowsPerPage);
    if (isSuperAdmin) fetchAuditStats();
  };

  /* ── Export (client-side, current page data) ── */
  const handleExport = async (fmt) => {
    setExporting(true);
    const date = format(new Date(), "yyyy-MM-dd");
    const roleLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Team";
    const includeActor = !isTeam; // team sees only own logs; omit actor column
    try {
      if (fmt === "csv")
        exportCSV(sortedLogs, `audit-logs-${date}.csv`, includeActor);
      if (fmt === "excel")
        exportExcel(
          sortedLogs,
          `audit-logs-${date}.xlsx`,
          includeActor,
          isSuperAdmin ? stats : null,
        );
      if (fmt === "pdf")
        exportPDF(
          sortedLogs,
          `audit-logs-${date}.pdf`,
          includeActor,
          roleLabel,
        );
      showSnackbar(
        `Exported ${sortedLogs.length} records as ${fmt.toUpperCase()}`,
        "success",
      );
    } catch (err) {
      console.error("Export error:", err);
      showSnackbar("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = (log, fmt) => {
    try {
      exportSingleLog(log, fmt, !isTeam);
      showSnackbar(`Log exported as ${fmt.toUpperCase()}`, "success");
    } catch {
      showSnackbar("Export failed.", "error");
    }
  };

  /* ── Table columns ── */
  const cols = useMemo(() => {
    const base = [
      { id: "createdAt", label: "Timestamp", sortable: true, width: "140px" },
      { id: "action", label: "Action", sortable: false, width: "130px" },
    ];
    if (!isTeam)
      base.push({
        id: "actor",
        label: "User",
        sortable: false,
        width: "170px",
        hideOnMobile: true,
      });
    base.push(
      {
        id: "resource",
        label: "Resource",
        sortable: true,
        width: "110px",
        hideOnMobile: true,
      },
      {
        id: "description",
        label: "Description",
        sortable: false,
        width: "auto",
        hideOnMobile: true,
      },
      { id: "status", label: "Status", sortable: false, width: "90px" },
      { id: "_view", label: "", sortable: false, width: "46px" },
    );
    return base;
  }, [isTeam]);

  const visibleCols = cols.filter((c) => !(isMobile && c.hideOnMobile));

  /* ── Loading skeleton ── */
  if (loading && (auditLogs?.length ?? 0) === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Skeleton height={56} sx={{ mb: 2, borderRadius: T.radius }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 2,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={88} sx={{ borderRadius: T.radius }} />
          ))}
        </Box>
        <Skeleton height={400} sx={{ borderRadius: T.radius }} />
      </Box>
    );
  }

  const cellSx = {
    fontSize: 12,
    py: "10px",
    px: "12px",
    borderBottom: "1px solid #f3f4f6",
    color: T.textPrimary,
  };
  const headCellSx = {
    ...cellSx,
    fontSize: 11,
    fontWeight: 700,
    color: T.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    bgcolor: "#fafafa",
    py: "8px",
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            fontSize={{ xs: 17, sm: 19, md: 21 }}
            fontWeight={800}
            color={T.textPrimary}
            lineHeight={1.2}
          >
            {getPageTitle()}
          </Typography>
          <Typography fontSize={12} color={T.textMuted} mt={0.4}>
            {getPageDescription()}
          </Typography>
        </Box>
        <RoleHeader isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
      </Box>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2, borderRadius: T.radius, fontSize: 12 }}
        >
          {error}
        </Alert>
      )}

      {/* Stats — all roles */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1.25,
          mb: 2,
        }}
      >
        <StatCard
          label="Total Actions"
          value={displayStats?.total}
          icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
          color="#4f46e5"
          loading={isSuperAdmin ? statsLoading : loading}
          subtitle={!isSuperAdmin ? "in current view" : undefined}
        />
        <StatCard
          label="Today"
          value={displayStats?.today}
          icon={<TodayIcon sx={{ fontSize: 16 }} />}
          color="#16a34a"
          loading={isSuperAdmin ? statsLoading : loading}
        />
        <StatCard
          label={isSuperAdmin ? "Total Events" : "Unique Users"}
          value={displayStats?.unique}
          icon={<PeopleIcon sx={{ fontSize: 16 }} />}
          color="#ea580c"
          loading={isSuperAdmin ? statsLoading : loading}
        />
        <StatCard
          label="Action Types"
          value={displayStats?.types}
          icon={<CategoryIcon sx={{ fontSize: 16 }} />}
          color="#d97706"
          loading={isSuperAdmin ? statsLoading : loading}
        />
      </Box>

      {/* Total chip */}
      {pagination && (
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontSize={12} color={T.textSecondary}>
            {isSuperAdmin ? "System" : isAdmin ? "Organization" : "Personal"}{" "}
            activity
          </Typography>
          <Chip
            label={`${(pagination.total || 0).toLocaleString()} total entries`}
            size="small"
            sx={{
              bgcolor: alpha(T.accent, 0.08),
              color: T.accent,
              fontWeight: 600,
              fontSize: 11,
            }}
          />
        </Box>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
        exporting={exporting}
        dateKey={datePickerKey}
        isSuperAdmin={isSuperAdmin}
        isAdmin={isAdmin}
      />

      {/* Table */}
      <Box
        sx={{
          bgcolor: T.cardBg,
          border: T.border,
          borderColor: T.borderColor,
          borderRadius: T.radius,
          overflow: "hidden",
        }}
      >
        {loading && <LinearProgress sx={{ height: 2 }} />}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: isMobile ? 360 : 640 }}>
            <TableHead>
              <TableRow>
                {visibleCols.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ ...headCellSx, width: col.width }}
                    align={col.id === "_view" ? "center" : "left"}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleSort(col.id)}
                        sx={{ fontSize: 11 }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleCols.length}
                    sx={{ py: 6, textAlign: "center" }}
                  >
                    <HistoryIcon
                      sx={{
                        fontSize: 32,
                        color: "#d1d5db",
                        mb: 1,
                        display: "block",
                        mx: "auto",
                      }}
                    />
                    <Typography fontSize={13} color={T.textMuted}>
                      No logs found
                    </Typography>
                    <Typography fontSize={11.5} color={T.textMuted} mt={0.4}>
                      Try adjusting your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((log) => (
                  <TableRow
                    key={log._id}
                    sx={{
                      "&:hover": { bgcolor: "#fafafa" },
                      "&:last-child td": { borderBottom: "none" },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedLog(log);
                      setDetailsOpen(true);
                    }}
                  >
                    {/* Timestamp */}
                    <TableCell sx={cellSx}>
                      <Typography
                        fontSize={11.5}
                        fontWeight={500}
                        color={T.textPrimary}
                        whiteSpace="nowrap"
                      >
                        {fmtDisplay(log.createdAt)}
                      </Typography>
                      <Typography
                        fontSize={10.5}
                        color={T.textMuted}
                        fontFamily={T.fontMono}
                      >
                        {fmtTime(log.createdAt)}
                      </Typography>
                    </TableCell>

                    {/* Action */}
                    <TableCell sx={cellSx} onClick={(e) => e.stopPropagation()}>
                      <ActionChip action={log.action} />
                    </TableCell>

                    {/* User — hidden for team role and on mobile */}
                    {!isTeam && !isMobile && (
                      <TableCell sx={cellSx}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              bgcolor: alpha(T.accent, 0.1),
                              color: T.accent,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(log.actor?.email?.[0] || "U").toUpperCase()}
                          </Box>
                          <Box>
                            <Typography
                              fontSize={11.5}
                              fontWeight={500}
                              color={T.textPrimary}
                              noWrap
                              sx={{ maxWidth: 130 }}
                            >
                              {log.actor?.email || "Unknown"}
                            </Typography>
                            <RoleChip role={log.actorRole} />
                          </Box>
                        </Box>
                      </TableCell>
                    )}

                    {/* Resource */}
                    {!isMobile && (
                      <TableCell sx={cellSx}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: "7px",
                            py: "2px",
                            borderRadius: "6px",
                            bgcolor: "#f3f4f6",
                            color: T.textSecondary,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {log.resource}
                        </Box>
                      </TableCell>
                    )}

                    {/* Description */}
                    {!isMobile && (
                      <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
                        <Typography
                          fontSize={11.5}
                          color={T.textSecondary}
                          noWrap
                          title={log.description}
                        >
                          {log.description || "—"}
                        </Typography>
                      </TableCell>
                    )}

                    {/* Status */}
                    <TableCell sx={cellSx} onClick={(e) => e.stopPropagation()}>
                      <StatusChip status={log.status} />
                    </TableCell>

                    {/* View button */}
                    <TableCell
                      sx={cellSx}
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="View details" arrow>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsOpen(true);
                          }}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "7px",
                            bgcolor: alpha(T.accent, 0.07),
                            color: T.accent,
                          }}
                          aria-label="View log details"
                        >
                          <VisibilityIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <Box sx={{ borderTop: "1px solid #f3f4f6" }}>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={pagination.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                "& .MuiTablePagination-toolbar": { minHeight: 44, px: 1.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: 11.5,
                    color: T.textMuted,
                  },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Detail dialog */}
      <DetailDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        log={selectedLog}
        onExportSingle={handleExportSingle}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: T.radius, fontSize: 12 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogs;
