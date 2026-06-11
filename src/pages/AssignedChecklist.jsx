// pages/AssignmentChecklist.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Radio,
  Pagination,
  Skeleton,
  Fade,
  Zoom,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  alpha,
  styled,
} from "@mui/material/styles";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassTop as HourglassTopIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  CalendarMonth as CalendarMonthIcon,
  SwapHoriz as SwapHorizIcon,
  Clear as ClearIcon,
  Restore as RestoreIcon,
  Inventory2 as InventoryIcon,
  FlagOutlined as FlagIcon,
  NotesOutlined as NotesIcon,
  PersonSearch as PersonSearchIcon,
  GroupAdd as GroupAddIcon,
  PendingActions as PendingActionsIcon,
  RateReview as ReviewIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";
import { useAssignment } from "../context/AssignmentContext";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d4a5c",
      dark: "#072e3a",
      light: "#e3f0f4",
      contrastText: "#fff",
    },
    secondary: { main: "#1a7a9a" },
    success: { main: "#10b981", light: "#ecfdf5", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fffbeb" },
    error: { main: "#ef4444", light: "#fef2f2" },
    info: { main: "#3b82f6", light: "#eff6ff" },
    text: { primary: "#111827", secondary: "#6b7280", disabled: "#9ca3af" },
    background: { default: "#f0f4f8", paper: "#ffffff" },
    divider: "#e5e7eb",
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: 11 } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
  },
});

// ─── Config ─────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: HourglassTopIcon,
  },
  in_progress: {
    label: "In Progress",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: HourglassTopIcon,
  },
  submitted: {
    label: "Submitted",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: AssignmentIcon,
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: CheckCircleIcon,
  },
  approved: {
    label: "Approved",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: CheckCircleIcon,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: ErrorOutlineIcon,
  },
  overdue: {
    label: "Overdue",
    color: "#ef4444",
    bg: "#fef2f2",
    icon: ErrorOutlineIcon,
  },
};

const PRIORITY_CFG = {
  low: { label: "Low", color: "#10b981", bg: "#ecfdf5" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  high: { label: "High", color: "#ef4444", bg: "#fef2f2" },
  critical: { label: "Critical", color: "#7f1d1d", bg: "#fee2e2" },
};

// ─── Styled Components ──────────────────────────────────────────────────────────
const HoverCard = styled(Card)(() => ({
  transition: "transform 0.18s, box-shadow 0.18s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.11)",
  },
}));

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  loading,
  subtitle,
}) => (
  <Zoom in timeout={300}>
    <HoverCard
      sx={{
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        width: "270px",
      }}
    >
      <CardContent sx={{ p: "20px !important" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                display: "block",
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={56} height={40} />
            ) : (
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color, lineHeight: 1.15 }}
              >
                {value ?? 0}
              </Typography>
            )}
            {subtitle && !loading && (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ mt: 0.5, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: bg ?? alpha(color, 0.12),
              color,
              width: 48,
              height: 48,
              ml: 1,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Avatar>
        </Box>
      </CardContent>
    </HoverCard>
  </Zoom>
);

const StatusChip = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={<Icon sx={{ fontSize: 13 }} />}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

const PriorityChip = ({ priority }) => {
  const cfg = PRIORITY_CFG[priority?.toLowerCase()] ?? PRIORITY_CFG.medium;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }}
    />
  );
};

const DateCell = ({ date }) => {
  if (!date)
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date(d);
  dayStart.setHours(0, 0, 0, 0);
  const isPast = dayStart < today;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <CalendarMonthIcon
        sx={{ fontSize: 13, color: isPast ? "#ef4444" : "#9ca3af" }}
      />
      <Typography
        variant="body2"
        sx={{
          color: isPast ? "#ef4444" : "inherit",
          fontWeight: isPast ? 600 : 400,
        }}
      >
        {d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </Typography>
    </Box>
  );
};

const CompletionBar = ({ rate }) => {
  const pct = Math.min(100, Math.max(0, rate ?? 0));
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 90 }}>
      <Box
        sx={{
          flex: 1,
          height: 5,
          borderRadius: 3,
          bgcolor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            bgcolor: color,
            borderRadius: 3,
            transition: "width 0.5s ease",
          }}
        />
      </Box>
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{ color, minWidth: 32 }}
      >
        {pct}%
      </Typography>
    </Box>
  );
};

const TH = ({ children, align }) => (
  <TableCell
    align={align}
    sx={{
      fontWeight: 700,
      fontSize: 11,
      color: "#9ca3af",
      bgcolor: "#f9fafb",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      borderBottom: "2px solid #e5e7eb",
      py: "10px",
      px: 2,
    }}
  >
    {children}
  </TableCell>
);

const SectionLabel = ({ icon: Icon, children, required }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.75 }}>
    {Icon && <Icon sx={{ fontSize: 15, color: "#0d4a5c" }} />}
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
    >
      {children}
      {required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
    </Typography>
  </Box>
);

// ─── Selection Modal ─────────────────────────────────────────────────────────────
const SelectionModal = ({
  open,
  onClose,
  title,
  items,
  loading,
  selectedIds,
  onToggle,
  onDone,
  multiSelect = true,
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const name = (
        item.name ||
        item.customerName ||
        item.fullName ||
        item.email ||
        ""
      ).toLowerCase();
      const email = (item.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [items, search]);

  const isSelected = (id) =>
    Array.isArray(selectedIds) ? selectedIds.includes(id) : selectedIds === id;

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <Box sx={{ bgcolor: "#0d4a5c", p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography fontWeight={700} color="white" variant="subtitle1">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "white", bgcolor: alpha("#fff", 0.1) }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            bgcolor: "white",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": { borderRadius: 1 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ maxHeight: 360, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              No items found
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filtered.map((item) => {
              const id = item._id || item.id;
              const name =
                item.name ||
                item.customerName ||
                item.fullName ||
                item.email ||
                "Unknown";
              const sub = item.email !== name ? item.email : item.role || "";
              const selected = isSelected(id);
              return (
                <ListItem
                  key={id}
                  divider
                  onClick={() => onToggle(id)}
                  sx={{
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: alpha("#0d4a5c", 0.04) },
                    bgcolor: selected ? alpha("#0d4a5c", 0.04) : "transparent",
                  }}
                >
                  {multiSelect ? (
                    <Checkbox
                      checked={selected}
                      size="small"
                      sx={{ mr: 0.5 }}
                      onChange={() => {}}
                    />
                  ) : (
                    <Radio
                      checked={selected}
                      size="small"
                      sx={{ mr: 0.5 }}
                      onChange={() => {}}
                    />
                  )}
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: selected ? "#0d4a5c" : alpha("#0d4a5c", 0.08),
                        color: selected ? "white" : "#0d4a5c",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {name}
                      </Typography>
                    }
                    secondary={
                      sub ? (
                        <Typography variant="caption" color="text.secondary">
                          {sub}
                        </Typography>
                      ) : undefined
                    }
                  />
                  {selected && (
                    <CheckCircleIcon
                      sx={{ fontSize: 16, color: "#10b981", ml: 1 }}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {Array.isArray(selectedIds)
            ? `${selectedIds.length} selected`
            : selectedIds
              ? "1 selected"
              : "None selected"}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" variant="contained" onClick={onDone}>
            Done
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

// ─── Default Form Values ──────────────────────────────────────────────────────────
const defaultAssignForm = () => ({
  checklistIds: [],
  adminId: "",
  teamMemberIds: [],
  assetIds: [],
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  priority: "medium",
  notes: "",
});

const defaultReassignForm = () => ({
  newAdminId: "",
  newTeamMemberIds: [],
  newAssetIds: [],
  newChecklistIds: [],
  dueDate: "",
  priority: "medium",
  reason: "",
  notes: "",
});

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function AssignmentChecklist() {
  const { authRequest, user } = useAuth();
  const {
    assignToAdmin,
    assignToTeam,
    reassignToAdmin,
    reassignToTeam,
    softDeleteAssignment,
    restoreAssignment,
    assignLoading,
  } = useAssignment();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const canManage = isSuperAdmin || isAdmin;

  // ── Core State ──────────────────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const [deletedAssignments, setDeletedAssignments] = useState([]);
  const [deletedPagination, setDeletedPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // ── Dialog State ────────────────────────────────────────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // ── Data State ──────────────────────────────────────────────────────────────────
  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // ── Forms ───────────────────────────────────────────────────────────────────────
  const [assignForm, setAssignForm] = useState(defaultAssignForm);
  const [reassignForm, setReassignForm] = useState(defaultReassignForm);

  const [modalStates, setModalStates] = useState({
    checklist: false,
    admin: false,
    team: false,
    asset: false,
    reassignChecklist: false,
    reassignAdmin: false,
    reassignTeam: false,
    reassignAsset: false,
  });
  const openModal = (key) => setModalStates((p) => ({ ...p, [key]: true }));
  const closeModal = (key) => setModalStates((p) => ({ ...p, [key]: false }));

  // ── Toast ───────────────────────────────────────────────────────────────────────
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const toast = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );
  const closeSnack = useCallback(
    () => setSnack((p) => ({ ...p, open: false })),
    [],
  );

  // ── API Helpers ─────────────────────────────────────────────────────────────────
  const fetchAssignments = useCallback(
    async (f) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (f.status && f.status !== "all") params.append("status", f.status);
        if (f.priority) params.append("priority", f.priority);
        if (f.search) params.append("search", f.search);
        params.append("page", f.page);
        params.append("limit", f.limit);

        const res = await authRequest("GET", `/assignments?${params}`);
        if (res?.success) {
          setAssignments(res.assignments || []);
          setPagination(
            res.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          );
        } else {
          toast(res?.message || "Failed to fetch assignments", "error");
        }
      } catch (err) {
        toast(err?.message || "Failed to fetch assignments", "error");
      } finally {
        setLoading(false);
      }
    },
    [authRequest, toast],
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await authRequest("GET", "/assignments/stats");
      if (res?.success) {
        setStats(res.stats || res.data || {});
      }
    } catch (err) {
      console.error("Stats fetch failed:", err?.message);
    } finally {
      setStatsLoading(false);
    }
  }, [authRequest]);

  const fetchDeletedAssignments = useCallback(
    async (page = 1) => {
      setDeletedLoading(true);
      try {
        const res = await authRequest(
          "GET",
          `/assignments/deleted?page=${page}&limit=10`,
        );
        if (res?.success) {
          setDeletedAssignments(res.assignments || []);
          setDeletedPagination(
            res.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          );
        } else {
          toast(res?.message || "Failed to fetch deleted assignments", "error");
        }
      } catch (err) {
        toast(err?.message || "Failed to fetch deleted assignments", "error");
      } finally {
        setDeletedLoading(false);
      }
    },
    [authRequest, toast],
  );

  const fetchChecklists = useCallback(async () => {
    setChecklistsLoading(true);
    try {
      const res = await authRequest(
        "GET",
        "/checklists?limit=100&status=published",
      );
      setChecklists(res?.checklists ?? res?.data?.checklists ?? []);
    } catch (err) {
      console.error("fetchChecklists:", err?.message);
    } finally {
      setChecklistsLoading(false);
    }
  }, [authRequest]);

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try {
      const res = await authRequest("GET", "/clients");
      setAdmins(res?.clients ?? []);
    } catch (err) {
      console.error("fetchAdmins:", err?.message);
    } finally {
      setAdminsLoading(false);
    }
  }, [authRequest, isSuperAdmin]);

  const fetchTeamMembers = useCallback(async () => {
    if (!isAdmin) return;
    setTeamLoading(true);
    try {
      const res = await authRequest("GET", "/team");
      setTeamMembers(res?.members ?? []);
    } catch (err) {
      console.error("fetchTeamMembers:", err?.message);
    } finally {
      setTeamLoading(false);
    }
  }, [authRequest, isAdmin]);

  const fetchAssets = useCallback(async () => {
    if (!isAdmin) return;
    setAssetsLoading(true);
    try {
      const res = await authRequest("GET", "/assets");
      setAssets(res?.assets ?? []);
    } catch (err) {
      console.error("fetchAssets:", err?.message);
    } finally {
      setAssetsLoading(false);
    }
  }, [authRequest, isAdmin]);

  // ── Initial Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAssignments(filters);
    fetchStats();
    fetchChecklists();
    if (isSuperAdmin) fetchAdmins();
    if (isAdmin) {
      fetchTeamMembers();
      fetchAssets();
    }
  }, []);

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedAssignments(1);
    }
  }, [showDeleted, fetchDeletedAssignments]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchAssignments(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: "",
      priority: "",
      search: "",
      page: 1,
      limit: 10,
    };
    setFilters(defaultFilters);
    fetchAssignments(defaultFilters);
  };

  // ── Stats Cards Data ────────────────────────────────────────────────────────────
  const statCards = useMemo(
    () => [
      {
        label: "Total Assignments",
        value: stats?.total ?? stats?.totalAssignments ?? 0,
        icon: AssignmentIcon,
        color: "#0d4a5c",
        bg: "#e3f0f4",
        subtitle: "All active records",
      },
      {
        label: "Pending",
        value: stats?.pending ?? stats?.byStatus?.pending ?? 0,
        icon: PendingActionsIcon,
        color: "#f59e0b",
        bg: "#fffbeb",
        subtitle: "Awaiting action",
      },
      {
        label: "Completed",
        value: (stats?.completed ?? 0) + (stats?.approved ?? 0),
        icon: CheckCircleIcon,
        color: "#10b981",
        bg: "#ecfdf5",
        subtitle: "Completed + Approved",
      },
      {
        label: "Overdue",
        value: stats?.overdue ?? stats?.byStatus?.overdue ?? 0,
        icon: ErrorOutlineIcon,
        color: "#ef4444",
        bg: "#fef2f2",
        subtitle: "Past due date",
      },
    ],
    [stats],
  );

  // ── Assign Handler ──────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignForm.checklistIds.length) {
      toast("Select at least one checklist", "error");
      return;
    }
    if (isSuperAdmin && !assignForm.adminId) {
      toast("Select an admin", "error");
      return;
    }
    if (!isSuperAdmin && !assignForm.teamMemberIds.length) {
      toast("Select at least one team member", "error");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (isSuperAdmin) {
        result = await assignToAdmin({
          checklistIds: assignForm.checklistIds,
          adminId: assignForm.adminId,
          dueDate: assignForm.dueDate,
          priority: assignForm.priority,
          notes: assignForm.notes,
        });
      } else {
        result = await assignToTeam({
          checklistIds: assignForm.checklistIds,
          assetIds: assignForm.assetIds,
          teamMemberIds: assignForm.teamMemberIds,
          dueDate: assignForm.dueDate,
          priority: assignForm.priority,
          notes: assignForm.notes,
        });
      }
      if (result?.success) {
        toast("Checklist assigned successfully!");
        setAssignOpen(false);
        setAssignForm(defaultAssignForm());
        fetchAssignments(filters);
        fetchStats();
      } else {
        toast(result?.error || "Assignment failed", "error");
      }
    } catch (err) {
      toast(err?.message || "Assignment failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reassign Handler ────────────────────────────────────────────────────────────
  const handleReassign = async () => {
    if (!selected) return;
    if (!reassignForm.reason.trim()) {
      toast("Provide a reason for re-assignment", "error");
      return;
    }
    if (isSuperAdmin && !reassignForm.newAdminId) {
      toast("Select a new admin", "error");
      return;
    }
    if (!isSuperAdmin && !reassignForm.newTeamMemberIds.length) {
      toast("Select at least one team member", "error");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (isSuperAdmin) {
        result = await reassignToAdmin(selected._id, {
          newAdminId: reassignForm.newAdminId,
          dueDate: reassignForm.dueDate,
          priority: reassignForm.priority,
          reason: reassignForm.reason,
          notes: reassignForm.notes,
        });
      } else {
        result = await reassignToTeam(selected._id, {
          newTeamMemberIds: reassignForm.newTeamMemberIds,
          newAssetIds: reassignForm.newAssetIds,
          dueDate: reassignForm.dueDate,
          reason: reassignForm.reason,
          notes: reassignForm.notes,
        });
      }
      if (result?.success) {
        toast("Re-assigned successfully!");
        setReassignOpen(false);
        setSelected(null);
        setReassignForm(defaultReassignForm());
        fetchAssignments(filters);
        fetchStats();
        if (showDeleted) fetchDeletedAssignments(deletedPagination.page);
      } else {
        toast(result?.error || "Re-assignment failed", "error");
      }
    } catch (err) {
      toast(err?.message || "Re-assignment failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete/Restore Handlers ─────────────────────────────────────────────────────
  const handleSoftDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const result = await softDeleteAssignment(selected._id);
      if (result?.success) {
        toast("Assignment deleted");
        setDeleteOpen(false);
        setSelected(null);
        fetchAssignments(filters);
        fetchStats();
        if (showDeleted) fetchDeletedAssignments(deletedPagination.page);
      } else {
        toast(result?.error || "Delete failed", "error");
      }
    } catch (err) {
      toast(err?.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!selected) return;
    setRestoring(true);
    try {
      const result = await restoreAssignment(selected._id);
      if (result?.success) {
        toast("Assignment restored");
        setRestoreOpen(false);
        setSelected(null);
        fetchAssignments(filters);
        fetchStats();
        fetchDeletedAssignments(deletedPagination.page);
      } else {
        toast(result?.error || "Restore failed", "error");
      }
    } catch (err) {
      toast(err?.message || "Restore failed", "error");
    } finally {
      setRestoring(false);
    }
  };

  const hasFilters = !!(filters.status || filters.priority || filters.search);

  // ── Render ───────────────────────────────────────────────────────────────────────
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
                Assignment Management
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {isSuperAdmin
                  ? "Assign checklists to admins and track progress"
                  : isAdmin
                    ? "Assign checklists to your team and track progress"
                    : "View your assigned checklists"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (showDeleted) {
                      fetchDeletedAssignments(deletedPagination.page);
                    } else {
                      fetchAssignments(filters);
                      fetchStats();
                    }
                  }}
                  disabled={loading || deletedLoading}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "white",
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {canManage && !showDeleted && (
                <Button
                  variant="contained"
                  startIcon={
                    isSuperAdmin ? <PersonAddIcon /> : <GroupAddIcon />
                  }
                  onClick={() => setAssignOpen(true)}
                  size="small"
                >
                  {isSuperAdmin ? "Assign to Admin" : "Assign to Team"}
                </Button>
              )}
            </Stack>
          </Box>

          {/* Stats Cards - Only show in Active View */}
          {!showDeleted && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {statCards.map((card, i) => (
                <Grid item xs={12} sm={6} md={3} lg={1.7} key={i}>
                  <StatCard {...card} loading={statsLoading} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Filters (only for active view) */}
          {!showDeleted && (
            <Paper sx={{ mb: 2, p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                flexWrap="wrap"
              >
                <TextField
                  size="small"
                  placeholder="Search assignments…"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  sx={{ flex: 2, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search && (
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">
                        All Status
                      </Typography>
                    </MenuItem>
                    {Object.entries(STATUS_CFG).map(([k, cfg]) => (
                      <MenuItem key={k} value={k}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">
                        All Priority
                      </Typography>
                    </MenuItem>
                    {Object.entries(PRIORITY_CFG).map(([k, cfg]) => (
                      <MenuItem key={k} value={k}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    sx={{ color: "#ef4444", whiteSpace: "nowrap" }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ ml: "auto", whiteSpace: "nowrap" }}
                >
                  {assignments.length} of {pagination.total} results
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Table */}
          {showDeleted ? (
            // Deleted View
            <Paper sx={{ overflow: "hidden" }}>
              {deletedLoading ? (
                <Box sx={{ p: 4 }}>
                  <CircularProgress
                    size={40}
                    sx={{ display: "block", mx: "auto" }}
                  />
                  <Skeleton height={52} sx={{ mt: 2 }} />
                  <Skeleton height={52} />
                  <Skeleton height={52} />
                </Box>
              ) : deletedAssignments.length === 0 ? (
                <Box sx={{ p: 8, textAlign: "center" }}>
                  <Fade in>
                    <Box>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha("#ef4444", 0.07),
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <DeleteIcon
                          sx={{ fontSize: 40, color: "#ef4444", opacity: 0.4 }}
                        />
                      </Avatar>
                      <Typography
                        fontWeight={700}
                        color="text.secondary"
                        variant="h6"
                      >
                        No deleted assignments
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Soft-deleted items appear here and can be restored
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow>
                          <TH>Checklist</TH>
                          <TH>Assigned To</TH>
                          <TH>Deleted At</TH>
                          <TH>Status</TH>
                          <TH>Priority</TH>
                          <TH align="center">Actions</TH>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deletedAssignments.map((asgn, idx) => (
                          <Fade in timeout={200 + idx * 40} key={asgn._id}>
                            <TableRow hover>
                              <TableCell sx={{ py: "12px", px: 2 }}>
                                <Typography fontWeight={700} variant="body2">
                                  {asgn.checklistData?.[0]?.name ??
                                    asgn.checklistIds?.[0]?.name ??
                                    "—"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  #{asgn._id?.slice(-8)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: "12px", px: 2 }}>
                                {asgn.assignedToAdmin?.email ??
                                  (asgn.assignedToTeamMembers?.length
                                    ? `${asgn.assignedToTeamMembers.length} member(s)`
                                    : "—")}
                              </TableCell>
                              <TableCell sx={{ py: "12px", px: 2 }}>
                                <DateCell date={asgn.deletedAt} />
                              </TableCell>
                              <TableCell sx={{ py: "12px", px: 2 }}>
                                <StatusChip status={asgn.status} />
                              </TableCell>
                              <TableCell sx={{ py: "12px", px: 2 }}>
                                <PriorityChip priority={asgn.priority} />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ py: "12px", px: 2 }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="center"
                                >
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      sx={{ borderRadius: 1.5 }}
                                      onClick={() => {
                                        setSelected(asgn);
                                        setDetailsOpen(true);
                                      }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Restore">
                                    <IconButton
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        color: "#10b981",
                                      }}
                                      onClick={() => {
                                        setSelected(asgn);
                                        setRestoreOpen(true);
                                      }}
                                    >
                                      <RestoreIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {deletedPagination.totalPages > 1 && (
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "center",
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Pagination
                        count={deletedPagination.totalPages}
                        page={deletedPagination.page}
                        onChange={(_, p) => fetchDeletedAssignments(p)}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          ) : loading ? (
            // Loading View
            <Paper sx={{ p: 4 }}>
              <CircularProgress
                size={40}
                sx={{ display: "block", mx: "auto" }}
              />
              <Skeleton height={52} sx={{ mt: 2 }} />
              <Skeleton height={52} />
              <Skeleton height={52} />
            </Paper>
          ) : assignments.length === 0 ? (
            // Empty View
            <Paper sx={{ p: 8, textAlign: "center" }}>
              <Fade in>
                <Box>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: alpha("#0d4a5c", 0.07),
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <AssignmentIcon
                      sx={{ fontSize: 40, color: "#0d4a5c", opacity: 0.4 }}
                    />
                  </Avatar>
                  <Typography
                    fontWeight={700}
                    color="text.secondary"
                    variant="h6"
                  >
                    No assignments found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {hasFilters
                      ? "Try adjusting your filters"
                      : canManage
                        ? "Create your first assignment using the button above"
                        : "You have no assignments yet"}
                  </Typography>
                </Box>
              </Fade>
            </Paper>
          ) : (
            // Active View Table
            <Paper sx={{ overflow: "hidden" }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TH>Checklist</TH>
                      <TH>Assigned To</TH>
                      <TH>Due Date</TH>
                      <TH>Priority</TH>
                      <TH>Status</TH>
                      <TH>Progress</TH>
                      <TH align="center">Actions</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((asgn, idx) => {
                      const statusCfg =
                        STATUS_CFG[asgn.status?.toLowerCase()] ??
                        STATUS_CFG.pending;
                      const assignedTo =
                        asgn.assignedToAdmin?.email ??
                        (asgn.assignedToTeamMembers?.length
                          ? `${asgn.assignedToTeamMembers.length} member(s)`
                          : "—");
                      const completionRate =
                        asgn.summary?.completionRate ??
                        asgn.checklistData?.[0]?.completionRate ??
                        0;
                      return (
                        <Fade in timeout={200 + idx * 40} key={asgn._id}>
                          <TableRow
                            hover
                            sx={{
                              "&:hover td:first-of-type": {
                                borderLeft: `3px solid ${statusCfg.color}`,
                              },
                            }}
                          >
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <Typography fontWeight={700} variant="body2">
                                {asgn.checklistData?.[0]?.name ??
                                  asgn.checklistIds?.[0]?.name ??
                                  "—"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                #{asgn._id?.slice(-8)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {assignedTo}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {asgn.assignedByRole ?? "—"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <DateCell date={asgn.dueDate} />
                            </TableCell>
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <PriorityChip priority={asgn.priority} />
                            </TableCell>
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <StatusChip status={asgn.status} />
                            </TableCell>
                            <TableCell sx={{ py: "12px", px: 2 }}>
                              <CompletionBar rate={completionRate} />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ py: "12px", px: 2 }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="center"
                              >
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    sx={{ borderRadius: 1.5 }}
                                    onClick={() => {
                                      setSelected(asgn);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                                {canManage && (
                                  <Tooltip title="Re-assign">
                                    <IconButton
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        color: "#f59e0b",
                                      }}
                                      onClick={() => {
                                        setSelected(asgn);
                                        setReassignForm({
                                          ...defaultReassignForm(),
                                          dueDate:
                                            asgn.dueDate?.split("T")[0] ?? "",
                                          priority: asgn.priority ?? "medium",
                                        });
                                        setReassignOpen(true);
                                      }}
                                    >
                                      <SwapHorizIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canManage && (
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      sx={{
                                        borderRadius: 1.5,
                                        color: "#ef4444",
                                      }}
                                      onClick={() => {
                                        setSelected(asgn);
                                        setDeleteOpen(true);
                                      }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.totalPages > 1 && (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    onChange={(_, p) => handleFilterChange("page", p)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* Details, Delete, Restore, Assign, Reassign Dialogs remain the same... */}
      {/* ── Details Dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelected(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selected && (
          <>
            <Box
              sx={{
                bgcolor:
                  STATUS_CFG[selected.status?.toLowerCase()]?.color ??
                  "#0d4a5c",
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography color="white" fontWeight={800} variant="h6">
                    {selected.checklistData?.[0]?.name ??
                      selected.checklistIds?.[0]?.name ??
                      "Assignment"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: alpha("#fff", 0.75) }}
                  >
                    #{selected._id?.slice(-8)}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    setDetailsOpen(false);
                    setSelected(null);
                  }}
                  size="small"
                  sx={{ color: "white", bgcolor: alpha("#fff", 0.2) }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Status",
                      content: <StatusChip status={selected.status} />,
                    },
                    {
                      label: "Priority",
                      content: <PriorityChip priority={selected.priority} />,
                    },
                    {
                      label: "Due Date",
                      content: <DateCell date={selected.dueDate} />,
                    },
                    {
                      label: "Progress",
                      content: (
                        <CompletionBar
                          rate={selected.summary?.completionRate}
                        />
                      ),
                    },
                  ].map(({ label, content }) => (
                    <Grid item xs={6} sm={3} key={label}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        {label}
                      </Typography>
                      {content}
                    </Grid>
                  ))}
                </Grid>
                <Paper sx={{ p: 2, bgcolor: "#f9fafb" }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      display: "block",
                      mb: 1.5,
                    }}
                  >
                    Assignment Info
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography fontWeight={500} variant="body2">
                        {selected.customerName ?? "—"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Assigned By
                      </Typography>
                      <Typography fontWeight={500} variant="body2">
                        {selected.assignedBy?.email ?? "—"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Typography
                        fontWeight={500}
                        variant="body2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {selected.assignedByRole ?? "—"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {selected.notes ?? "—"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                {selected.assignedToTeamMembers?.length > 0 && (
                  <Paper sx={{ p: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      Team Members ({selected.assignedToTeamMembers.length})
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {selected.assignedToTeamMembers.map((m, i) => (
                        <Typography key={i} variant="body2">
                          • {m.name ?? m.email}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  setSelected(null);
                }}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha("#ef4444", 0.1),
                color: "#ef4444",
                width: 36,
                height: 36,
              }}
            >
              <WarningIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography fontWeight={800}>Delete Assignment</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this assignment? It can be restored
            from the Deleted tab.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setSelected(null);
            }}
            variant="outlined"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSoftDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={15} /> : <DeleteIcon />
            }
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Restore Confirm ─────────────────────────────────────────────────────── */}
      <Dialog
        open={restoreOpen}
        onClose={() => {
          setRestoreOpen(false);
          setSelected(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha("#10b981", 0.1),
                color: "#10b981",
                width: 36,
                height: 36,
              }}
            >
              <RestoreIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography fontWeight={800}>Restore Assignment</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This assignment will be moved back to Active Assignments.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              setRestoreOpen(false);
              setSelected(null);
            }}
            variant="outlined"
            disabled={restoring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            variant="contained"
            color="success"
            disabled={restoring}
            startIcon={
              restoring ? <CircularProgress size={15} /> : <RestoreIcon />
            }
          >
            {restoring ? "Restoring…" : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign Modal ────────────────────────────────────────────────────────── */}
      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box
          sx={{
            bgcolor: "#0d4a5c",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isSuperAdmin ? (
              <PersonSearchIcon sx={{ color: "#fff", fontSize: 22 }} />
            ) : (
              <GroupAddIcon sx={{ color: "#fff", fontSize: 22 }} />
            )}
            <Typography color="white" fontWeight={800} variant="h6">
              {isSuperAdmin ? "Assign to Admin" : "Assign to Team"}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setAssignOpen(false)}
            size="small"
            sx={{ color: "white", bgcolor: alpha("#fff", 0.1) }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <SectionLabel icon={DescriptionIcon} required>
                Checklists
              </SectionLabel>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => openModal("checklist")}
                startIcon={<DescriptionIcon />}
              >
                {assignForm.checklistIds.length === 0
                  ? "Select Checklists"
                  : `${assignForm.checklistIds.length} selected`}
              </Button>
            </Box>
            {isSuperAdmin && (
              <Box>
                <SectionLabel icon={PersonSearchIcon} required>
                  Admin
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("admin")}
                  startIcon={<PersonAddIcon />}
                >
                  {assignForm.adminId ? "Admin selected ✓" : "Select Admin"}
                </Button>
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <SectionLabel icon={PeopleIcon} required>
                  Team Members
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("team")}
                  startIcon={<PeopleIcon />}
                >
                  {assignForm.teamMemberIds.length === 0
                    ? "Select Team Members"
                    : `${assignForm.teamMemberIds.length} selected`}
                </Button>
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <SectionLabel icon={InventoryIcon}>
                  Assets (optional)
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("asset")}
                  startIcon={<InventoryIcon />}
                >
                  {assignForm.assetIds.length === 0
                    ? "Select Assets"
                    : `${assignForm.assetIds.length} selected`}
                </Button>
              </Box>
            )}
            <Box>
              <SectionLabel icon={CalendarMonthIcon} required>
                Due Date
              </SectionLabel>
              <TextField
                fullWidth
                type="date"
                value={assignForm.dueDate}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <SectionLabel icon={FlagIcon} required>
                Priority
              </SectionLabel>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                  <Box
                    key={k}
                    onClick={() =>
                      setAssignForm((p) => ({ ...p, priority: k }))
                    }
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: `2px solid ${assignForm.priority === k ? v.color : "#e5e7eb"}`,
                      bgcolor: assignForm.priority === k ? v.bg : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      transition: "all 0.15s",
                      "&:hover": { borderColor: v.color },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: v.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={assignForm.priority === k ? 700 : 400}
                      sx={{
                        color:
                          assignForm.priority === k
                            ? v.color
                            : "text.secondary",
                      }}
                    >
                      {v.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box>
              <SectionLabel icon={NotesIcon}>Notes</SectionLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={assignForm.notes}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Add instructions or context…"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setAssignOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            disabled={submitting || assignLoading}
            startIcon={
              submitting ? <CircularProgress size={15} /> : <SendIcon />
            }
          >
            {submitting ? "Assigning…" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reassign Modal ──────────────────────────────────────────────────────── */}
      <Dialog
        open={reassignOpen}
        onClose={() => {
          setReassignOpen(false);
          setSelected(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box
          sx={{
            bgcolor: "#0d4a5c",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SwapHorizIcon sx={{ color: "#fff", fontSize: 22 }} />
            <Typography color="white" fontWeight={800} variant="h6">
              Re-assign Assignment
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setReassignOpen(false);
              setSelected(null);
            }}
            size="small"
            sx={{ color: "white", bgcolor: alpha("#fff", 0.15) }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <SectionLabel icon={WarningIcon} required>
                Reason
              </SectionLabel>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={reassignForm.reason}
                onChange={(e) =>
                  setReassignForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="Why is this being re-assigned?"
                required
              />
            </Box>
            {isSuperAdmin && (
              <Box>
                <SectionLabel icon={PersonSearchIcon} required>
                  New Admin
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("reassignAdmin")}
                  startIcon={<PersonAddIcon />}
                >
                  {reassignForm.newAdminId
                    ? "Admin selected ✓"
                    : "Select Admin"}
                </Button>
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <SectionLabel icon={PeopleIcon} required>
                  New Team Members
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("reassignTeam")}
                  startIcon={<PeopleIcon />}
                >
                  {reassignForm.newTeamMemberIds.length === 0
                    ? "Select Team Members"
                    : `${reassignForm.newTeamMemberIds.length} selected`}
                </Button>
              </Box>
            )}
            {!isSuperAdmin && (
              <Box>
                <SectionLabel icon={InventoryIcon}>
                  New Assets (optional)
                </SectionLabel>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => openModal("reassignAsset")}
                  startIcon={<InventoryIcon />}
                >
                  {reassignForm.newAssetIds.length === 0
                    ? "Select Assets"
                    : `${reassignForm.newAssetIds.length} selected`}
                </Button>
              </Box>
            )}
            <Box>
              <SectionLabel icon={CalendarMonthIcon}>New Due Date</SectionLabel>
              <TextField
                fullWidth
                type="date"
                value={reassignForm.dueDate}
                onChange={(e) =>
                  setReassignForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <SectionLabel icon={FlagIcon}>Priority</SectionLabel>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                  <Box
                    key={k}
                    onClick={() =>
                      setReassignForm((p) => ({ ...p, priority: k }))
                    }
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: `2px solid ${reassignForm.priority === k ? v.color : "#e5e7eb"}`,
                      bgcolor: reassignForm.priority === k ? v.bg : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      transition: "all 0.15s",
                      "&:hover": { borderColor: v.color },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: v.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={reassignForm.priority === k ? 700 : 400}
                      sx={{
                        color:
                          reassignForm.priority === k
                            ? v.color
                            : "text.secondary",
                      }}
                    >
                      {v.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box>
              <SectionLabel icon={NotesIcon}>Additional Notes</SectionLabel>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={reassignForm.notes}
                onChange={(e) =>
                  setReassignForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Extra instructions…"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => {
              setReassignOpen(false);
              setSelected(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            variant="contained"
            color="warning"
            disabled={submitting || assignLoading}
            startIcon={
              submitting ? <CircularProgress size={15} /> : <SwapHorizIcon />
            }
            sx={{ color: "#fff" , backgroundColor:"#0d4a5c" }}
          >
            {submitting ? "Re-assigning…" : "Re-assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Selection Modals ────────────────────────────────────────────────────── */}
      <SelectionModal
        open={modalStates.checklist}
        onClose={() => closeModal("checklist")}
        title="Select Checklists"
        items={checklists}
        loading={checklistsLoading}
        selectedIds={assignForm.checklistIds}
        onToggle={(id) =>
          setAssignForm((p) => ({
            ...p,
            checklistIds: p.checklistIds.includes(id)
              ? p.checklistIds.filter((i) => i !== id)
              : [...p.checklistIds, id],
          }))
        }
        onDone={() => closeModal("checklist")}
      />

      <SelectionModal
        open={modalStates.admin}
        onClose={() => closeModal("admin")}
        title="Select Admin"
        items={admins}
        loading={adminsLoading}
        selectedIds={assignForm.adminId}
        onToggle={(id) => setAssignForm((p) => ({ ...p, adminId: id }))}
        onDone={() => closeModal("admin")}
        multiSelect={false}
      />

      <SelectionModal
        open={modalStates.team}
        onClose={() => closeModal("team")}
        title="Select Team Members"
        items={teamMembers}
        loading={teamLoading}
        selectedIds={assignForm.teamMemberIds}
        onToggle={(id) =>
          setAssignForm((p) => ({
            ...p,
            teamMemberIds: p.teamMemberIds.includes(id)
              ? p.teamMemberIds.filter((i) => i !== id)
              : [...p.teamMemberIds, id],
          }))
        }
        onDone={() => closeModal("team")}
      />

      <SelectionModal
        open={modalStates.asset}
        onClose={() => closeModal("asset")}
        title="Select Assets"
        items={assets}
        loading={assetsLoading}
        selectedIds={assignForm.assetIds}
        onToggle={(id) =>
          setAssignForm((p) => ({
            ...p,
            assetIds: p.assetIds.includes(id)
              ? p.assetIds.filter((i) => i !== id)
              : [...p.assetIds, id],
          }))
        }
        onDone={() => closeModal("asset")}
      />

      <SelectionModal
        open={modalStates.reassignAdmin}
        onClose={() => closeModal("reassignAdmin")}
        title="Select Admin"
        items={admins}
        loading={adminsLoading}
        selectedIds={reassignForm.newAdminId}
        onToggle={(id) => setReassignForm((p) => ({ ...p, newAdminId: id }))}
        onDone={() => closeModal("reassignAdmin")}
        multiSelect={false}
      />

      <SelectionModal
        open={modalStates.reassignTeam}
        onClose={() => closeModal("reassignTeam")}
        title="Select Team Members"
        items={teamMembers}
        loading={teamLoading}
        selectedIds={reassignForm.newTeamMemberIds}
        onToggle={(id) =>
          setReassignForm((p) => ({
            ...p,
            newTeamMemberIds: p.newTeamMemberIds.includes(id)
              ? p.newTeamMemberIds.filter((i) => i !== id)
              : [...p.newTeamMemberIds, id],
          }))
        }
        onDone={() => closeModal("reassignTeam")}
      />

      <SelectionModal
        open={modalStates.reassignAsset}
        onClose={() => closeModal("reassignAsset")}
        title="Select Assets"
        items={assets}
        loading={assetsLoading}
        selectedIds={reassignForm.newAssetIds}
        onToggle={(id) =>
          setReassignForm((p) => ({
            ...p,
            newAssetIds: p.newAssetIds.includes(id)
              ? p.newAssetIds.filter((i) => i !== id)
              : [...p.newAssetIds, id],
          }))
        }
        onDone={() => closeModal("reassignAsset")}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={closeSnack}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
