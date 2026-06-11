// pages/TeamManagement.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
  alpha,
  Grid,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PersonAddOutlined,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  HomeWork as WorkIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../context/TeamContext";
import AddMemberModal from "./AddMemberModal";
import EditMemberModal from "./EditMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ─── Google Font ──────────────────────────────────────────────────────────────
if (!document.head.querySelector('[href*="Inter"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap";
  document.head.appendChild(link);
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#eff6ff",
  primaryBg: alpha("#0a3a49", 0.08),
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  error: "#ef4444",
  errorBg: "#fef2f2",
  info: "#8b5cf6",
  infoBg: "#f5f3ff",
  surface: "#ffffff",
  bg: "#f9fafb",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    muted: "#9ca3af",
    disabled: "#d1d5db",
  },
};

const ROLE_OPTIONS = [
  "Inspector",
  "Senior Inspector",
  "Supervisor",
  "Manager",
  "Admin",
];
const STATUS_OPTIONS = ["active", "inactive", "onLeave"];

const EMPTY_FILTERS = {
  role: "",
  status: "",
  performanceMin: "",
  performanceMax: "",
};

// Single unified search term
const EMPTY_SEARCH = "";

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        bg: C.successBg,
        color: C.success,
        label: "Active",
        Icon: CheckCircleIcon,
      };
    case "inactive":
      return {
        bg: C.border,
        color: C.text.muted,
        label: "Inactive",
        Icon: CloseIcon,
      };
    case "onleave":
    case "on leave":
      return { bg: C.infoBg, color: C.info, label: "On Leave", Icon: WorkIcon };
    default:
      return {
        bg: C.border,
        color: C.text.muted,
        label: status || "—",
        Icon: null,
      };
  }
};

const getPerformanceColor = (score) => {
  if (score >= 80) return C.success;
  if (score >= 60) return C.primary;
  if (score >= 40) return C.warning;
  return C.error;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "14px",
        width: "270px",
        border: `1px solid ${C.border}`,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: color,
          boxShadow: `0 4px 12px ${alpha(color, 0.1)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: C.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 16, color }} />
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: C.text.primary,
            lineHeight: 1.2,
          }}
        >
          {value?.toLocaleString() ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── No Results State ─────────────────────────────────────────────────────────
function NoResultsState({
  searchTerm,
  hasFilters,
  onClearSearch,
  onClearAll,
  onAddMember,
}) {
  const isSearching = !!searchTerm || hasFilters;

  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: "center",
        py: { xs: 6, md: 10 },
        px: 3,
        borderRadius: "16px",
        border: `1px solid ${C.border}`,
        bgcolor: C.surface,
      }}
    >
      {isSearching ? (
        <>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(C.primary, 0.06),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
              position: "relative",
            }}
          >
            <SearchOffIcon
              sx={{ fontSize: 36, color: alpha(C.primary, 0.35) }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: C.error,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseIcon sx={{ fontSize: 12, color: "#fff" }} />
            </Box>
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color: C.text.primary,
              mb: 0.75,
            }}
          >
            No results found
          </Typography>

          {searchTerm && (
            <Typography
              sx={{ fontSize: "0.85rem", color: C.text.secondary, mb: 0.5 }}
            >
              No team members match{" "}
              <Box component="span" sx={{ fontWeight: 600, color: C.primary }}>
                "{searchTerm}"
              </Box>
            </Typography>
          )}

          <Typography
            sx={{
              fontSize: "0.82rem",
              color: C.text.muted,
              mb: 3,
              maxWidth: 360,
              mx: "auto",
            }}
          >
            Try different keywords, check for typos, or remove some filters to
            see more results.
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              flexDirection: "column",
              gap: 0.8,
              mb: 3,
              textAlign: "left",
              bgcolor: C.bg,
              borderRadius: "10px",
              px: 2.5,
              py: 1.5,
              border: `1px solid ${C.border}`,
            }}
          >
            {[
              "Search by first name, last name, or full name",
              "Try a partial email address",
              "Use a role keyword like Inspector or Admin",
            ].map((tip) => (
              <Box
                key={tip}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: C.text.muted,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{ fontSize: "0.78rem", color: C.text.secondary }}
                >
                  {tip}
                </Typography>
              </Box>
            ))}
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            flexWrap="wrap"
          >
            {searchTerm && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                onClick={onClearSearch}
                sx={{
                  textTransform: "none",
                  fontSize: "0.82rem",
                  borderRadius: "10px",
                  borderColor: C.border,
                  color: C.text.secondary,
                  "&:hover": {
                    borderColor: C.primary,
                    color: C.primary,
                    bgcolor: alpha(C.primary, 0.04),
                  },
                }}
              >
                Clear Search
              </Button>
            )}
            {hasFilters && (
              <Button
                variant="outlined"
                startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
                onClick={onClearAll}
                sx={{
                  textTransform: "none",
                  fontSize: "0.82rem",
                  borderRadius: "10px",
                  borderColor: C.border,
                  color: C.text.secondary,
                  "&:hover": {
                    borderColor: C.primary,
                    color: C.primary,
                    bgcolor: alpha(C.primary, 0.04),
                  },
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
              onClick={onClearAll}
              sx={{
                textTransform: "none",
                fontSize: "0.82rem",
                borderRadius: "10px",
                bgcolor: C.primary,
                "&:hover": { bgcolor: C.primaryDark },
              }}
            >
              Clear All & Show Everyone
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(C.primary, 0.06),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <PersonAddOutlined
              sx={{ fontSize: 36, color: alpha(C.primary, 0.35) }}
            />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color: C.text.primary,
              mb: 0.75,
            }}
          >
            No team members yet
          </Typography>
          <Typography
            sx={{ fontSize: "0.85rem", color: C.text.secondary, mb: 3 }}
          >
            Add your first team member to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddMember}
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              borderRadius: "10px",
              bgcolor: C.primary,
              "&:hover": { bgcolor: C.primaryDark },
              px: 3,
            }}
          >
            Add Team Member
          </Button>
        </>
      )}
    </Paper>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filters, onFilterChange, activeFilterCount }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(local);
    setAnchorEl(null);
  };
  const handleReset = () => {
    setLocal(EMPTY_FILTERS);
    onFilterChange(EMPTY_FILTERS);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant={activeFilterCount > 0 ? "contained" : "outlined"}
        startIcon={
          <Badge
            badgeContent={activeFilterCount}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                height: 16,
                minWidth: 16,
              },
            }}
          >
            <FilterIcon sx={{ fontSize: 18 }} />
          </Badge>
        }
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: "none",
          fontSize: "0.85rem",
          fontWeight: 500,
          borderRadius: "10px",
          borderColor: C.border,
          color: activeFilterCount > 0 ? "#fff" : C.text.primary,
          bgcolor: activeFilterCount > 0 ? C.primary : "transparent",
          "&:hover": {
            bgcolor:
              activeFilterCount > 0 ? C.primaryDark : alpha(C.primary, 0.05),
            borderColor: C.primary,
          },
          px: 2,
          py: 0.75,
          whiteSpace: "nowrap",
        }}
      >
        Filters
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 280,
            p: 2.5,
            borderRadius: "14px",
            mt: 1,
            border: `1px solid ${C.border}`,
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.9rem",
            mb: 2,
            color: C.text.primary,
          }}
        >
          Filter Team Members
        </Typography>

        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
          <Select
            value={local.role}
            label="Role"
            onChange={(e) => setLocal({ ...local, role: e.target.value })}
            sx={{ fontSize: "0.85rem", borderRadius: "8px" }}
          >
            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
              All Roles
            </MenuItem>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: "0.85rem" }}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
          <Select
            value={local.status}
            label="Status"
            onChange={(e) => setLocal({ ...local, status: e.target.value })}
            sx={{ fontSize: "0.85rem", borderRadius: "8px" }}
          >
            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
              All Statuses
            </MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                {s === "active"
                  ? "Active"
                  : s === "inactive"
                    ? "Inactive"
                    : "On Leave"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          fullWidth
          type="number"
          label="Min Performance (%)"
          value={local.performanceMin}
          onChange={(e) =>
            setLocal({ ...local, performanceMin: e.target.value })
          }
          sx={{
            mb: 2,
            "& input": { fontSize: "0.85rem" },
            "& label": { fontSize: "0.8rem" },
          }}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
        />
        <TextField
          size="small"
          fullWidth
          type="number"
          label="Max Performance (%)"
          value={local.performanceMax}
          onChange={(e) =>
            setLocal({ ...local, performanceMax: e.target.value })
          }
          sx={{
            mb: 2,
            "& input": { fontSize: "0.85rem" },
            "& label": { fontSize: "0.8rem" },
          }}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
        />

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
            startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              borderRadius: "8px",
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              borderRadius: "8px",
              bgcolor: C.primary,
            }}
          >
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ member, onView, onEdit, onDelete }) {
  const { bg, color, label, Icon } = getStatusStyle(member.status);
  const perfColor = getPerformanceColor(member.performanceScore);

  // Use firstName and lastName for display
  const displayName =
    member.firstName && member.lastName
      ? `${member.firstName} ${member.lastName}`
      : member.name || "Unknown";

  const displayInitials =
    member.firstName && member.lastName
      ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
      : member.initials || member.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <TableRow
      hover
      sx={{
        "&:hover": { bgcolor: alpha(C.primary, 0.02) },
        transition: "background 0.15s",
      }}
    >
      <TableCell sx={{ py: 1.8, pl: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: C.primaryBg,
              color: C.primary,
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {displayInitials}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: C.text.primary,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: C.text.secondary }}>
              {member.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={member.roleDisplay || member.role}
          size="small"
          sx={{
            bgcolor: alpha(C.primary, 0.08),
            color: C.primary,
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 24,
            borderRadius: "6px",
          }}
        />
      </TableCell>
      <TableCell>
        <Typography
          sx={{ fontSize: "0.85rem", fontWeight: 500, color: C.text.primary }}
        >
          {member.assignedCount ?? "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          sx={{ fontSize: "0.85rem", fontWeight: 500, color: C.text.primary }}
        >
          {member.completedCount ?? "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 110,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={member.performanceScore ?? 0}
            sx={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              bgcolor: C.border,
              "& .MuiLinearProgress-bar": {
                bgcolor: perfColor,
                borderRadius: 3,
              },
            }}
          />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              color: perfColor,
              minWidth: 35,
            }}
          >
            {member.performanceScore ?? 0}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={label}
          size="small"
          icon={Icon ? <Icon sx={{ fontSize: 12 }} /> : undefined}
          sx={{
            bgcolor: bg,
            color,
            fontWeight: 500,
            fontSize: "0.7rem",
            height: 26,
            borderRadius: "6px",
            "& .MuiChip-icon": { fontSize: 12, color },
          }}
        />
      </TableCell>
      <TableCell align="center" sx={{ pr: 2.5 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          {[
            {
              title: "View Details",
              icon: VisibilityIcon,
              onClick: () => onView(member),
              hoverColor: C.primary,
            },
            {
              title: "Edit Member",
              icon: EditIcon,
              onClick: () => onEdit(member),
              hoverColor: C.primary,
            },
            {
              title: "Delete",
              icon: DeleteIcon,
              onClick: () => onDelete(member),
              hoverColor: C.error,
            },
          ].map(({ title, icon: Ic, onClick, hoverColor }) => (
            <Tooltip key={title} title={title} arrow>
              <IconButton
                size="small"
                onClick={onClick}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  color: C.text.secondary,
                  "&:hover": {
                    bgcolor: alpha(hoverColor, 0.08),
                    color: hoverColor,
                  },
                }}
              >
                <Ic sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────
function MobileMemberCard({ member, onView, onEdit, onDelete }) {
  const { bg, color, label, Icon } = getStatusStyle(member.status);
  const perfColor = getPerformanceColor(member.performanceScore);

  const displayName =
    member.firstName && member.lastName
      ? `${member.firstName} ${member.lastName}`
      : member.name || "Unknown";

  const displayInitials =
    member.firstName && member.lastName
      ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
      : member.initials || member.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: "14px",
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${perfColor}`,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: C.primaryBg,
              color: C.primary,
              fontWeight: 600,
            }}
          >
            {displayInitials}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.95rem",
                color: C.text.primary,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: C.text.secondary }}>
              {member.email}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => onView(member)}
            sx={{ color: C.text.secondary }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onEdit(member)}
            sx={{ color: C.text.secondary }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(member)}
            sx={{ color: C.error }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
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
        {[
          {
            label: "Role",
            content: (
              <Chip
                label={member.roleDisplay || member.role}
                size="small"
                sx={{
                  bgcolor: alpha(C.primary, 0.08),
                  color: C.primary,
                  fontSize: "0.7rem",
                }}
              />
            ),
          },
          {
            label: "Status",
            content: (
              <Chip
                label={label}
                size="small"
                icon={Icon ? <Icon sx={{ fontSize: 12 }} /> : undefined}
                sx={{ bgcolor: bg, color }}
              />
            ),
          },
          {
            label: "Assigned",
            content: (
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {member.assignedCount ?? "—"}
              </Typography>
            ),
          },
          {
            label: "Completed",
            content: (
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {member.completedCount ?? "—"}
              </Typography>
            ),
          },
        ].map(({ label: l, content }) => (
          <Box key={l}>
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontWeight: 600,
                color: C.text.muted,
                textTransform: "uppercase",
                mb: 0.3,
              }}
            >
              {l}
            </Typography>
            {content}
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />
      <Box sx={{ mt: 1 }}>
        <Typography
          sx={{
            fontSize: "0.6rem",
            fontWeight: 600,
            color: C.text.muted,
            textTransform: "uppercase",
            mb: 0.8,
          }}
        >
          Performance
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={member.performanceScore ?? 0}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: C.border,
              "& .MuiLinearProgress-bar": { bgcolor: perfColor },
            }}
          />
          <Typography
            sx={{ fontWeight: 600, fontSize: "0.8rem", color: perfColor }}
          >
            {member.performanceScore ?? 0}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamManagement() {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const {
    teamMembers,
    loading,
    actionLoading,
    error,
    pagination,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    updateFilters,
    clearError,
  } = useTeam();

    console.log("user...........", teamMembers)

  // ── Single unified search term ──
  const [searchTerm, setSearchTerm] = useState(EMPTY_SEARCH);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const mountedRef = useRef(false);
  const debounceTimerRef = useRef(null);

  const showToast = (msg, sev = "success") =>
    setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // ── Debounced search + filter effect ──
  useEffect(() => {
    if (!mountedRef.current) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateFilters({
        search: searchTerm,
        role: filters.role || "all",
        status: filters.status || "all",
        page: currentPage + 1,
        limit: rowsPerPage,
      });
    }, 350);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchTerm, filters, currentPage, rowsPerPage, updateFilters]);

  const totalMembers = teamMembers?.length || 0;
  const activeMembers =
    teamMembers?.filter((m) => m.status === "active").length || 0;
  const onLeaveMembers =
    teamMembers?.filter((m) => m.status === "onLeave").length || 0;
  const avgPerformance =
    teamMembers?.length > 0
      ? Math.round(
          teamMembers.reduce((sum, m) => sum + (m.performanceScore || 0), 0) /
            teamMembers.length,
        )
      : 0;

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "" && v !== null && v !== undefined,
  ).length;
  const hasAnySearch = searchTerm.trim() !== "";

  const handleClearSearch = useCallback(() => {
    setSearchTerm(EMPTY_SEARCH);
    setCurrentPage(0);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm(EMPTY_SEARCH);
    setFilters(EMPTY_FILTERS);
    setCurrentPage(0);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const handleAddMember = async (formData) => {
    const result = await addTeamMember(formData);
    if (result.success) {
      showToast(result.message);
      setAddModalOpen(false);
    } else showToast(result.error, "error");
    return result;
  };

  const handleEditMember = async (memberId, updateData) => {
    const result = await updateTeamMember(memberId, updateData);
    if (result.success) {
      showToast(result.message);
      setEditModalOpen(false);
      setSelectedMember(null);
    } else showToast(result.error, "error");
    return result;
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    const result = await deleteTeamMember(selectedMember.id, true);
    if (result.success) {
      showToast(result.message);
      setDeleteModalOpen(false);
      setSelectedMember(null);
    } else showToast(result.error, "error");
    return result;
  };

  const handleViewMember = (m) => navigate(`/admin/team-details/${m.id}`);
  const handleEditClick = (m) => {
    setSelectedMember(m);
    setEditModalOpen(true);
  };
  const handleDeleteClick = (m) => {
    setSelectedMember(m);
    setDeleteModalOpen(true);
  };

  const statCards = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: PersonAddOutlined,
      color: C.primary,
    },
    {
      title: "Active Members",
      value: activeMembers,
      icon: CheckCircleIcon,
      color: C.success,
    },
    {
      title: "On Leave",
      value: onLeaveMembers,
      icon: WorkIcon,
      color: C.warning,
    },
    {
      title: "Avg Performance",
      value: avgPerformance ? `${avgPerformance}%` : "—",
      icon: BarChartIcon,
      color: C.info,
    },
  ];

  const TABLE_HEADERS = [
    "Member",
    "Role",
    "Assigned",
    "Completed",
    "Performance",
    "Status",
    "Actions",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.bg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  color: C.text.primary,
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                Team Management
              </Typography>
              <Typography sx={{ color: C.text.secondary, fontSize: "0.85rem" }}>
                Manage your inspection team and track performance
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                bgcolor: C.primary,
                "&:hover": { bgcolor: C.primaryDark },
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 2.5,
                py: 0.8,
                whiteSpace: "nowrap",
              }}
            >
              Add Team Member
            </Button>
          </Box>

          {/* Management Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Manage Roles", icon: BadgeIcon, path: "/admin/roles" },
              {
                label: "Manage Departments",
                icon: BusinessIcon,
                path: "/admin/departments",
              },
              {
                label: "Manage Locations",
                icon: LocationOnIcon,
                path: "/admin/locations",
              },
            ].map(({ label, icon: Icon, path }) => (
              <Button
                key={label}
                variant="contained"
                startIcon={<Icon />}
                onClick={() => navigate(path)}
                sx={{
                  bgcolor: C.primary,
                  "&:hover": { bgcolor: C.primaryDark },
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  px: 2.5,
                  py: 0.8,
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map((card, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Search + Filter Panel */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            border: `1px solid ${C.border}`,
            mb: 2.5,
            p: 1.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              placeholder="Search by name, email, role, or department…"
              variant="standard"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: searchTerm ? C.primary : C.text.muted,
                        fontSize: 20,
                        transition: "color 0.2s",
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear search" arrow>
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ p: 0.4 }}
                      >
                        <CloseIcon sx={{ fontSize: 15, color: C.text.muted }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : null,
                sx: {
                  fontSize: "0.9rem",
                  color: C.text.primary,
                  py: 0.8,
                  px: 1,
                },
              }}
              sx={{ flex: 2, minWidth: 200 }}
            />

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", sm: "block" },
                borderColor: C.border,
              }}
            />

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              activeFilterCount={activeFilterCount}
            />

            {(hasAnySearch || activeFilterCount > 0) && (
              <Button
                variant="text"
                startIcon={<ClearIcon sx={{ fontSize: 15 }} />}
                onClick={handleClearAll}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  color: C.text.secondary,
                  whiteSpace: "nowrap",
                  borderRadius: "8px",
                  px: 1.5,
                  "&:hover": { color: C.error, bgcolor: alpha(C.error, 0.05) },
                }}
              >
                Clear All
              </Button>
            )}
          </Stack>

          {/* Active search/filter pills */}
          {(hasAnySearch || activeFilterCount > 0) && (
            <Box
              sx={{
                display: "flex",
                gap: 0.8,
                flexWrap: "wrap",
                mt: 1.2,
                pt: 1.2,
                borderTop: `1px solid ${C.borderLight}`,
              }}
            >
              {hasAnySearch && (
                <Chip
                  size="small"
                  icon={<SearchIcon sx={{ fontSize: "13px !important" }} />}
                  label={`"${searchTerm}"`}
                  onDelete={handleClearSearch}
                  sx={{
                    fontSize: "0.72rem",
                    height: 24,
                    bgcolor: alpha(C.primary, 0.08),
                    color: C.primary,
                    "& .MuiChip-icon": { color: C.primary },
                  }}
                />
              )}
              {filters.status && (
                <Chip
                  size="small"
                  label={`Status: ${filters.status}`}
                  onDelete={() => setFilters((f) => ({ ...f, status: "" }))}
                  sx={{
                    fontSize: "0.72rem",
                    height: 24,
                    bgcolor: alpha(C.success, 0.08),
                    color: C.success,
                  }}
                />
              )}
              {filters.role && (
                <Chip
                  size="small"
                  label={`Role: ${filters.role}`}
                  onDelete={() => setFilters((f) => ({ ...f, role: "" }))}
                  sx={{
                    fontSize: "0.72rem",
                    height: 24,
                    bgcolor: alpha(C.info, 0.08),
                    color: C.info,
                  }}
                />
              )}
              {filters.performanceMin && (
                <Chip
                  size="small"
                  label={`Perf ≥ ${filters.performanceMin}%`}
                  onDelete={() =>
                    setFilters((f) => ({ ...f, performanceMin: "" }))
                  }
                  sx={{
                    fontSize: "0.72rem",
                    height: 24,
                    bgcolor: alpha(C.warning, 0.08),
                    color: C.warning,
                  }}
                />
              )}
              {filters.performanceMax && (
                <Chip
                  size="small"
                  label={`Perf ≤ ${filters.performanceMax}%`}
                  onDelete={() =>
                    setFilters((f) => ({ ...f, performanceMax: "" }))
                  }
                  sx={{
                    fontSize: "0.72rem",
                    height: 24,
                    bgcolor: alpha(C.warning, 0.08),
                    color: C.warning,
                  }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        {loading && !teamMembers?.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: C.primary }} />
          </Box>
        ) : !teamMembers?.length ? (
          <NoResultsState
            searchTerm={searchTerm}
            hasFilters={activeFilterCount > 0}
            onClearSearch={handleClearSearch}
            onClearAll={handleClearAll}
            onAddMember={() => setAddModalOpen(true)}
          />
        ) : isMobile ? (
          <Box>
            {teamMembers.map((m) => (
              <MobileMemberCard
                key={m.id}
                member={m}
                onView={handleViewMember}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <TablePagination
                component="div"
                count={pagination?.total || teamMembers.length}
                page={currentPage}
                onPageChange={(_, p) => setCurrentPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20]}
                sx={{ border: "none" }}
              />
            </Box>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            {loading && (
              <LinearProgress
                sx={{ "& .MuiLinearProgress-bar": { bgcolor: C.primary } }}
              />
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.bg }}>
                    {TABLE_HEADERS.map((h) => (
                      <TableCell
                        key={h}
                        align={h === "Actions" ? "center" : "left"}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: C.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          py: 1.8,
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((m) => (
                    <MemberRow
                      key={m.id}
                      member={m}
                      onView={handleViewMember}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{ borderTop: `1px solid ${C.border}`, bgcolor: C.surface }}
            >
              <TablePagination
                component="div"
                count={pagination?.total || teamMembers.length}
                page={currentPage}
                onPageChange={(_, p) => setCurrentPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    fontSize: "0.8rem",
                    minHeight: 52,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.75rem", color: C.text.secondary },
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>

      {/* Modals */}
      <AddMemberModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddMember}
        loading={actionLoading}
      />
      <EditMemberModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSubmit={handleEditMember}
        loading={actionLoading}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onConfirm={handleDeleteMember}
        loading={actionLoading}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
