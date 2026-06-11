// src/pages/MyTask.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Container, Typography, Paper, Button, IconButton, TextField,
  Select, MenuItem, FormControl, Chip, Avatar, Stack, CircularProgress,
  Alert, Snackbar, InputAdornment, Tooltip, useMediaQuery, Pagination,
  Skeleton, Fade, Grid, LinearProgress, Popover, List, ListItem,
  ListItemText, Divider,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon, Refresh as RefreshIcon, Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon, ErrorOutline as ErrorOutlineIcon,
  HourglassTop as HourglassTopIcon, CalendarMonth as CalendarMonthIcon,
  Clear as ClearIcon, PendingActions as PendingIcon, DoneAll as DoneAllIcon,
  Warning as WarningIcon, ViewList as ViewListIcon,
  CalendarViewWeek as CalendarViewIcon, NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon, Today as TodayIcon, Circle as CircleIcon,
  PlayArrow as PlayArrowIcon, Refresh as ContinueIcon,
  LocationOn as LocationIcon, Description as DescriptionIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentContext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#0d3d52", dark: "#072535", light: "#e6f3f8", contrastText: "#fff" },
    success: { main: "#0ea472" },
    warning: { main: "#e09b2d" },
    error: { main: "#d94f4f" },
    background: { default: "#f4f6f9", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h5: { fontWeight: 800, letterSpacing: "-0.5px" },
    h6: { fontWeight: 700, letterSpacing: "-0.3px" },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)" } } },
    MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)" } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } } },
  },
});

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { label: "Pending",     color: "#b45309", bg: "#fef9ee", icon: HourglassTopIcon },
  in_progress: { label: "In Progress", color: "#1d4ed8", bg: "#eff6ff", icon: HourglassTopIcon },
  submitted:   { label: "Submitted",   color: "#6d28d9", bg: "#f5f3ff", icon: AssignmentIcon   },
  completed:   { label: "Completed",   color: "#047857", bg: "#ecfdf5", icon: CheckCircleIcon  },
  approved:    { label: "Approved",    color: "#047857", bg: "#ecfdf5", icon: CheckCircleIcon  },
  rejected:    { label: "Rejected",    color: "#b91c1c", bg: "#fef2f2", icon: ErrorOutlineIcon },
  overdue:     { label: "Overdue",     color: "#b91c1c", bg: "#fef2f2", icon: ErrorOutlineIcon },
};

const PRIORITY_CFG = {
  low:      { label: "Low Priority",      color: "#fff", bg: "#3b82f6" },
  medium:   { label: "Medium Priority",   color: "#fff", bg: "#0d3d52" },
  high:     { label: "High Priority",     color: "#fff", bg: "#ef4444" },
  critical: { label: "Critical Priority", color: "#fff", bg: "#991b1b" },
};

const PRIORITY_DOT_COLOR = {
  low: "#3b82f6", medium: "#b45309", high: "#b91c1c", critical: "#7f1d1d",
};

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  return <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontSize: 11 }} />;
};

// ─── Task Card (Grid View) ────────────────────────────────────────────────────
const TaskCard = ({ task, onView }) => {
  const prKey = task.priority?.toLowerCase() || "medium";
  const prCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
  const stKey = task.status?.toLowerCase() || "pending";
  const stCfg = STATUS_CFG[stKey] || STATUS_CFG.pending;
  const StIcon = stCfg.icon;

  const checklistName = task.checklists?.[0]?.name || task.checklistData?.[0]?.name || "—";
  const assetName = task.assets?.[0]?.assetName || task.assets?.[0]?.tagNumber || "—";
  const assetLocation = task.assetIds?.[0]?.currentLocation || task.assets?.[0]?.currentLocation || "";

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();
  const completionRate = task.checklistData?.[0]?.completionRate ?? task.completionRate ?? 0;

  const btnLabel = stKey === "in_progress" ? "Continue Inspection" : "Start Inspection";

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.15s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", transform: "translateY(-1px)" },
      }}
    >
      {/* Card Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Chip
            label={prCfg.label}
            size="small"
            sx={{ bgcolor: prCfg.bg, color: prCfg.color, fontSize: 11, height: 22, fontWeight: 700 }}
          />
          <Chip
            label={stCfg.label}
            size="small"
            icon={<StIcon sx={{ fontSize: "12px !important", color: `${stCfg.color} !important` }} />}
            sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontSize: 11, height: 22 }}
          />
        </Box>

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
          {assetName}
        </Typography>

        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <DescriptionIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
            <Typography variant="caption" color="text.secondary">{checklistName}</Typography>
          </Box>
          {assetLocation && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <LocationIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
              <Typography variant="caption" color="text.secondary">{assetLocation}</Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarMonthIcon sx={{ fontSize: 14, color: isOverdue ? "#d94f4f" : "#9ca3af" }} />
            <Typography variant="caption" sx={{ color: isOverdue ? "#d94f4f" : "text.secondary", fontWeight: isOverdue ? 600 : 400 }}>
              Due: {dueDate ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </Typography>
          </Box>
        </Stack>

        {completionRate > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 4, borderRadius: 2,
                bgcolor: alpha("#0d3d52", 0.08),
                "& .MuiLinearProgress-bar": { bgcolor: "#0d3d52", borderRadius: 2 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: "block" }}>
              {completionRate}% complete
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Button */}
      <Box sx={{ px: 2.5, pb: 2.5, mt: "auto" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onView(task._id)}
          startIcon={stKey === "in_progress" ? <ContinueIcon /> : <PlayArrowIcon />}
          sx={{
            bgcolor: "#0d3d52",
            "&:hover": { bgcolor: "#0a2f40" },
            borderRadius: 2,
            py: 1,
            fontSize: 13,
          }}
        >
          {btnLabel}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <Box sx={{ bgcolor: "white", borderRadius: 2.5, p: 2.5, border: "1px solid rgba(0,0,0,0.06)", flex: 1 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{label}</Typography>
      </Box>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
    </Box>
  </Box>
);

// ─── Calendar View ────────────────────────────────────────────────────────────
const CalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverTasks, setPopoverTasks] = useState([]);
  const [popoverDate, setPopoverDate] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build day grid
  const firstDOW  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const prevLast  = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDOW - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, prevLast - i), cur: false });
  for (let d = 1; d <= daysInMon; d++)
    cells.push({ date: new Date(year, month, d), cur: true });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ date: new Date(year, month + 1, d), cur: false });

  // Map tasks by date string
  const taskMap = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const k = new Date(t.dueDate).toDateString();
    if (!taskMap[k]) taskMap[k] = [];
    taskMap[k].push(t);
  });

  const today = new Date().toDateString();

  const handleCellClick = (e, cell) => {
    const k = cell.date.toDateString();
    const ts = taskMap[k] || [];
    if (!ts.length) return;
    setPopoverTasks(ts);
    setPopoverDate(cell.date);
    setPopoverAnchor(e.currentTarget);
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <NavigateNextIcon />
          </IconButton>
          <Button size="small" startIcon={<TodayIcon />} onClick={() => setCurrentDate(new Date())} variant="outlined" sx={{ ml: 1 }}>
            Today
          </Button>
        </Box>
        <Typography variant="h6">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </Typography>
        {/* Legend */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {[
            { label: "Critical", color: "#7f1d1d" },
            { label: "High", color: "#b91c1c" },
            { label: "Medium", color: "#b45309" },
            { label: "Low", color: "#3b82f6" },
            { label: "In Progress", color: "#10b981" },
            { label: "Pending", color: "#9ca3af" },
          ].map((l) => (
            <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <CircleIcon sx={{ fontSize: 9, color: l.color }} />
              <Typography variant="caption" sx={{ color: "#6b7280", fontSize: 11 }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* Weekday Row */}
        <Grid container sx={{ bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
            <Grid key={d} item xs={12/7} sx={{ py: 1.5, textAlign: "center" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#6b7280", letterSpacing: "0.05em" }}>{d}</Typography>
            </Grid>
          ))}
        </Grid>

        {/* Day Cells */}
        <Grid container>
          {cells.map((cell, idx) => {
            const k = cell.date.toDateString();
            const dayTasks = taskMap[k] || [];
            const isToday = k === today;

            return (
              <Grid
                key={idx}
                item
                xs={12/7}
                onClick={(e) => handleCellClick(e, cell)}
                sx={{
                  minHeight: 90,
                  p: 0.75,
                  border: "1px solid #f0f0f0",
                  bgcolor: isToday ? alpha("#0d3d52", 0.04) : cell.cur ? "white" : "#fafafa",
                  cursor: dayTasks.length > 0 ? "pointer" : "default",
                  "&:hover": dayTasks.length > 0 ? { bgcolor: alpha("#0d3d52", 0.06) } : {},
                  outline: isToday ? `2px solid #0d3d52` : "none",
                  outlineOffset: -2,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    width: 26, height: 26, borderRadius: "50%",
                    bgcolor: isToday ? "#0d3d52" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? "white" : cell.cur ? "#374151" : "#c0c0c0",
                      fontSize: 12,
                    }}
                  >
                    {cell.date.getDate()}
                  </Typography>
                </Box>
                <Stack spacing={0.3}>
                  {dayTasks.slice(0, 3).map((t, ti) => {
                    const prColor = PRIORITY_DOT_COLOR[t.priority?.toLowerCase()] || "#9ca3af";
                    const stKey = t.status?.toLowerCase();
                    const dotColor = stKey === "in_progress" ? "#10b981" : stKey === "pending" ? "#9ca3af" : prColor;
                    return (
                      <Tooltip key={ti} title={t.checklists?.[0]?.name || t.assets?.[0]?.assetName || "Task"}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <CircleIcon sx={{ fontSize: 8, color: dotColor, flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            sx={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "#374151" }}
                          >
                            {(t.assets?.[0]?.assetName || t.checklists?.[0]?.name || "Task")?.slice(0, 14)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <Typography variant="caption" sx={{ fontSize: 9, color: "#9ca3af", pl: 0.3 }}>
                      +{dayTasks.length - 3} more
                    </Typography>
                  )}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Popover */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{ sx: { width: 300, borderRadius: 2.5, p: 1 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 1.5, pt: 1.5, pb: 1, fontWeight: 700 }}>
          {popoverDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </Typography>
        <Divider />
        <List dense>
          {popoverTasks.map((t) => {
            const prKey = t.priority?.toLowerCase() || "medium";
            const prCfg = PRIORITY_CFG[prKey] || PRIORITY_CFG.medium;
            return (
              <ListItem
                key={t._id}
                onClick={() => { setPopoverAnchor(null); onTaskClick(t._id); }}
                sx={{ borderRadius: 1.5, cursor: "pointer", "&:hover": { bgcolor: alpha("#0d3d52", 0.05) }, mb: 0.5 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {t.assets?.[0]?.assetName || t.checklists?.[0]?.name || "—"}
                      </Typography>
                      <Chip label={prCfg.label.replace(" Priority","")} size="small"
                        sx={{ bgcolor: prCfg.bg, color: prCfg.color, height: 18, fontSize: 10 }} />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {t.checklists?.[0]?.name || "—"}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </Box>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyTask() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { fetchMyTasks, loading } = useTeamAssignment();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));
  const mountedRef = useRef(true);

  const [viewMode, setViewMode] = useState("list");
  const [tasks, setTasks]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats]       = useState(null);
  const [filters, setFilters]   = useState({ status: "", priority: "", search: "", page: 1, limit: 20 });
  const [snack, setSnack]       = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const toast = useCallback((msg, severity = "success") => setSnack({ open: true, msg, severity }), []);

  const loadTasks = useCallback(async () => {
    const result = await fetchMyTasks(filters);
    if (!mountedRef.current) return;
    if (result.success) {
      setTasks(result.tasks);
      setPagination(result.pagination);
      setStats(result.stats);
    } else {
      toast(result.error || "Failed to load tasks", "error");
    }
  }, [fetchMyTasks, filters, toast]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () =>
    setFilters({ status: "", priority: "", search: "", page: 1, limit: 20 });

  const hasFilters = !!(filters.status || filters.priority || filters.search);

  const handleViewTask = (taskId) => {
    if (!taskId || taskId === "undefined" || taskId === "null") {
      toast("Invalid task ID", "error");
      return;
    }
    navigate(`/team/task/${taskId}`);
  };

  const firstName = (user?.name || user?.fullName || "Team Member").split(" ")[0];

  const statCards = [
    { label: "Total Tasks",  value: stats?.total      || tasks.length, icon: AssignmentIcon,    color: "#0d3d52", bg: "#e6f3f8" },
    { label: "Pending",      value: stats?.pending     || 0,           icon: PendingIcon,       color: "#b45309", bg: "#fef9ee" },
    { label: "In Progress",  value: stats?.in_progress || 0,           icon: HourglassTopIcon,  color: "#1d4ed8", bg: "#eff6ff" },
    { label: "Completed",    value: stats?.completed   || 0,           icon: DoneAllIcon,       color: "#047857", bg: "#ecfdf5" },
    { label: "Overdue",      value: stats?.overdue     || 0,           icon: WarningIcon,       color: "#b91c1c", bg: "#fef2f2" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f9" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>

          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} color="#0d3d52">My Tasks</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Your assigned inspection tasks
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* View Toggle */}
              <Paper sx={{ borderRadius: 2, overflow: "hidden", display: "flex", border: "1px solid rgba(0,0,0,0.08)" }}>
                <Button
                  size="small"
                  onClick={() => setViewMode("list")}
                  startIcon={<ViewListIcon fontSize="small" />}
                  sx={{
                    borderRadius: 0, px: 2, py: 1,
                    bgcolor: viewMode === "list" ? "#0d3d52" : "transparent",
                    color: viewMode === "list" ? "white" : "text.secondary",
                    "&:hover": { bgcolor: viewMode === "list" ? "#0a2f40" : alpha("#0d3d52", 0.05) },
                  }}
                >
                  List View
                </Button>
                <Box sx={{ width: 1, bgcolor: "rgba(0,0,0,0.08)" }} />
                <Button
                  size="small"
                  onClick={() => setViewMode("calendar")}
                  startIcon={<CalendarViewIcon fontSize="small" />}
                  sx={{
                    borderRadius: 0, px: 2, py: 1,
                    bgcolor: viewMode === "calendar" ? "#0d3d52" : "transparent",
                    color: viewMode === "calendar" ? "white" : "text.secondary",
                    "&:hover": { bgcolor: viewMode === "calendar" ? "#0a2f40" : alpha("#0d3d52", 0.05) },
                  }}
                >
                  Calendar View
                </Button>
              </Paper>
              <Tooltip title="Refresh">
                <IconButton
                  size="small" onClick={loadTasks} disabled={loading}
                  sx={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 2, bgcolor: "white", width: 38, height: 38 }}
                >
                  {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filters Row */}
          <Paper sx={{ mb: 2.5, p: 2, borderRadius: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} flexWrap="wrap">
              <TextField
                size="small" placeholder="Search tasks…" value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                sx={{ flex: 2, minWidth: 220 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9ca3af" }} /></InputAdornment>,
                  endAdornment: filters.search ? (
                    <IconButton size="small" onClick={() => handleFilterChange("search", "")}>
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  ) : null,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} displayEmpty>
                  <MenuItem value="">All Tasks</MenuItem>
                  {Object.entries(STATUS_CFG).map(([k, cfg]) => (
                    <MenuItem key={k} value={k}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: cfg.color }} />
                        {cfg.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} displayEmpty>
                  <MenuItem value="">Priority</MenuItem>
                  {Object.entries(PRIORITY_DOT_COLOR).map(([k, c]) => (
                    <MenuItem key={k} value={k}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c }} />
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasFilters && (
                <Button size="small" onClick={clearFilters} startIcon={<ClearIcon />} sx={{ color: "#d94f4f" }}>
                  Clear Filters
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Stat Cards */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
            {statCards.map((c, i) => <StatCard key={i} {...c} />)}
          </Stack>

          {/* Content */}
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid key={i} item xs={12} sm={6} md={4}>
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === "calendar" ? (
            <CalendarView tasks={tasks} onTaskClick={handleViewTask} />
          ) : tasks.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
              <Fade in>
                <Box>
                  <Avatar sx={{ width: 72, height: 72, bgcolor: alpha("#0d3d52", 0.07), mx: "auto", mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 36, color: "#0d3d52", opacity: 0.4 }} />
                  </Avatar>
                  <Typography fontWeight={700} variant="h6" color="text.secondary">
                    {hasFilters ? "No matching tasks" : "No tasks assigned"}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                    {hasFilters ? "Try adjusting your filters." : "You have no assigned tasks at the moment."}
                  </Typography>
                  {hasFilters && (
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={clearFilters}>Clear Filters</Button>
                  )}
                </Box>
              </Fade>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {tasks.map((task, idx) => (
                  <Fade in timeout={100 + idx * 50} key={task._id}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TaskCard task={task} onView={handleViewTask} />
                    </Grid>
                  </Fade>
                ))}
              </Grid>
              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page}
                    onChange={(_, p) => handleFilterChange("page", p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        <Snackbar
          open={snack.open} autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}