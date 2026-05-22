// MyTasks.jsx - Fixed Version

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Stack,
  IconButton,
  Skeleton,
  Alert,
  Tooltip,
  Dialog,
  DialogContent,
  Pagination,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import { useAssignment } from "../context/TeamAssignmentcontext";

/* ═══════════════════════════════ THEME ═════════════════════════════════════ */
export const theme = createTheme({
  palette: {
    primary: { main: "#0d3d52" },
    background: { default: "#f5f6f8", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    body2: { fontSize: "0.75rem" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          border: "1.5px solid #e9eaec",
          borderRadius: 14,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, background: "#fff", fontSize: "0.75rem" },
        notchedOutline: { borderColor: "#e5e7eb" },
      },
    },
  },
});

/* ═══════════════ CALENDAR STATIC DATA ═══════════════════════════════════ */
const LEGEND = [
  { color: "#f472b6", label: "Extremely Critical" },
  { color: "#ef4444", label: "High Priority" },
  { color: "#f97316", label: "Medium Priority" },
  { color: "#3b82f6", label: "Low Priority" },
  { color: "#22c55e", label: "In Progress" },
  { color: "#9ca3af", label: "Overdue" },
];

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ═══════════════════════════ HELPERS ═══════════════════════════════════════ */
const Badge = ({ bg, color, children, ml = 0, small = false }) => (
  <Box
    sx={{
      background: bg,
      color,
      borderRadius: "20px",
      px: small ? 0.8 : 1.2,
      py: small ? 0.2 : 0.35,
      fontSize: small ? "0.62rem" : "0.68rem",
      fontWeight: 600,
      display: "inline-block",
      whiteSpace: "nowrap",
      ml,
    }}
  >
    {children}
  </Box>
);

const MetaRow = ({ Icon, text }) => (
  <Box display="flex" alignItems="center" gap={0.8}>
    <Icon sx={{ fontSize: 12, color: "#6b7280", flexShrink: 0 }} />
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: "0.72rem" }}
    >
      {text}
    </Typography>
  </Box>
);

/* ═══════════════════════════ SHARED HEADER ═════════════════════════════════ */
const Header = ({ view, setView, onRefresh, loading }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      px: { xs: 2, md: 3 },
      pt: 2.5,
      pb: 0.5,
    }}
  >
    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1rem", md: "1.2rem" },
          color: "#0d3d52",
        }}
      >
        My Tasks
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.7rem" }}
      >
        Your assigned inspection tasks
      </Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        size="small"
        onClick={onRefresh}
        disabled={loading}
        sx={{
          border: "1.5px solid #e5e7eb",
          borderRadius: "8px",
          width: 32,
          height: 32,
          color: "#6b7280",
        }}
      >
        <RefreshIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          border: "1.5px solid #e5e7eb",
          borderRadius: "10px",
          background: "#fff",
          p: "3px",
          gap: "2px",
        }}
      >
        {[
          {
            val: "list",
            icon: <ViewListIcon sx={{ fontSize: 14 }} />,
            label: "List",
          },
          {
            val: "calendar",
            icon: <CalendarMonthIcon sx={{ fontSize: 14 }} />,
            label: "Calendar",
          },
        ].map(({ val, icon, label }) => (
          <Button
            key={val}
            onClick={() => setView(val)}
            startIcon={icon}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.7rem",
              borderRadius: "8px",
              px: { xs: 1, md: 1.5 },
              py: 0.6,
              minWidth: 0,
              border: "none",
              color: view === val ? "#111827" : "#6b7280",
              background: view === val ? "#fff" : "transparent",
              boxShadow: view === val ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              "&:hover": { background: view === val ? "#fff" : "#f9fafb" },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ═══════════════════════════ FILTERS BAR ═══════════════════════════════════ */
const FiltersBar = ({ showMore = true, onFilter, filters }) => {
  const [status, setStatus] = useState(filters.status || "");
  const [priority, setPriority] = useState(filters.priority || "");
  const [date, setDate] = useState("");

  const apply = (newStatus, newPriority) =>
    onFilter({ status: newStatus, priority: newPriority });

  return (
    <Box
      sx={{
        mx: { xs: 2, md: 3 },
        mb: 2,
        mt: 1,
        border: "1.5px solid #e9eaec",
        borderRadius: "12px",
        background: "#fff",
        px: 1.5,
        py: 1,
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            apply(e.target.value, priority);
          }}
          displayEmpty
          sx={{ fontSize: "0.75rem", borderRadius: "8px" }}
        >
          <MenuItem value="">All Tasks</MenuItem>
          {[
            "pending",
            "assigned",
            "in_progress",
            "submitted",
            "completed",
            "approved",
            "rejected",
            "overdue",
          ].map((s) => (
            <MenuItem
              key={s}
              value={s}
              sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}
            >
              {s.replace("_", " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 110 }}>
        <Select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            apply(status, e.target.value);
          }}
          displayEmpty
          sx={{ fontSize: "0.75rem", borderRadius: "8px" }}
        >
          <MenuItem value="">Priority</MenuItem>
          {["critical", "high", "medium", "low"].map((p) => (
            <MenuItem
              key={p}
              value={p}
              sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}
            >
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "0.75rem",
          },
        }}
      />

      {showMore && (
        <Button
          startIcon={<FilterListIcon sx={{ fontSize: 13 }} />}
          onClick={() => apply(status, priority)}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.72rem",
            color: "#111827",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            px: 1.5,
            py: 0.6,
            background: "#fff",
            "&:hover": { background: "#f9fafb" },
          }}
        >
          Apply
        </Button>
      )}
    </Box>
  );
};

/* ═══════════════════════════ STAT CARDS ════════════════════════════════════ */
const StatCard = ({ label, value, loading }) => (
  <Card sx={{ flex: 1, minWidth: { xs: "calc(50% - 8px)", sm: 0 } }}>
    <CardContent sx={{ px: "14px !important", py: "12px !important" }}>
      <Typography
        variant="body2"
        color="text.secondary"
        mb={0.5}
        sx={{ fontSize: "0.7rem" }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton width={36} height={32} />
      ) : (
        <Typography
          sx={{
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {value ?? 0}
        </Typography>
      )}
    </CardContent>
  </Card>
);

/* ═══════════════════════════ TASK CARD ═════════════════════════════════════ */
const TaskCard = ({ task, onStart }) => (
  <Card sx={{ height: "100%", borderRadius: "16px", width: "360px" }}>
    <CardContent
      sx={{
        p: "14px !important",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1}
        gap={1}
        flexWrap="wrap"
      >
        <Badge bg={task.priorityBg} color={task.priorityColor}>
          {task.priority}
        </Badge>
        <Badge bg={task.statusBg} color={task.statusColor}>
          {task.status}{" "}
        </Badge>
      </Box>

      <Typography
        sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827", mb: 1 }}
      >
        {task.title}
      </Typography>

      <Stack gap={0.6} mb={1.5}>
        <MetaRow Icon={DescriptionOutlinedIcon} text={task.type} />
        <MetaRow Icon={LocationOnOutlinedIcon} text={task.location} />
        <MetaRow Icon={BusinessIcon} text={task.customerName} />
        <MetaRow Icon={CalendarTodayOutlinedIcon} text={`Due: ${task.due}`} />
      </Stack>

      {task.isDraft && (
        <Box mb={1}>
          <Badge bg="#fef3c7" color="#92400e" small>
            Draft saved
          </Badge>
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        startIcon={<PlayArrowIcon sx={{ fontSize: 12 }} />}
        onClick={() => onStart(task)}
        sx={{
          background: "linear-gradient(135deg,#0d3d52 0%,#1a5a78 100%)",
          color: "#fff",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.72rem",
          borderRadius: "8px",
          py: 0.8,
          boxShadow: "0 1px 4px rgba(13,61,82,.2)",
          mt: "auto",
        }}
      >
        {task.btn}
      </Button>
    </CardContent>
  </Card>
);

const TaskCardSkeleton = () => (
  <Card sx={{ height: "100%", borderRadius: "16px" }}>
    <CardContent sx={{ p: "14px !important" }}>
      <Box display="flex" justifyContent="space-between" mb={1.5}>
        <Skeleton width={80} height={20} sx={{ borderRadius: "12px" }} />
        <Skeleton width={70} height={20} sx={{ borderRadius: "12px" }} />
      </Box>
      <Skeleton width="70%" height={22} sx={{ mb: 1.2 }} />
      <Skeleton width="85%" height={14} sx={{ mb: 0.6 }} />
      <Skeleton width="75%" height={14} sx={{ mb: 0.6 }} />
      <Skeleton width="65%" height={14} sx={{ mb: 2 }} />
      <Skeleton width="100%" height={36} sx={{ borderRadius: "8px" }} />
    </CardContent>
  </Card>
);

/* ═══════════════════════ CALENDAR HELPERS ══════════════════════════════════ */
const buildCalendarData = (assignments) => {
  const dotsByDay = {};
  assignments.forEach((a) => {
    if (!a.due || a.due === "—") return;
    const day = parseInt(a.due.split("-")[2], 10);
    if (!dotsByDay[day]) dotsByDay[day] = [];
    dotsByDay[day].push({ color: a.priorityBg, id: a.id, task: a });
  });
  return dotsByDay;
};

const buildCalendarWeeks = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ d: daysInPrev - i, o: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ d, today: isCurrentMonth && d === today.getDate() });
  while (cells.length % 7 !== 0)
    cells.push({ d: cells.length - daysInMonth - firstDay + 1, o: true });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

/* ═══════════════════════ DAY MODAL ═════════════════════════════════════════ */
const DayModal = ({ open, day, month, year, tasks, onClose, onStart }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: { borderRadius: "18px", maxWidth: 520, width: "100%", m: 2 },
    }}
  >
    <DialogContent sx={{ p: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.8,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              background: "#0d3d52",
              borderRadius: "8px",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarMonthIcon sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}
          >
            {day} {MONTHS[month]} {year}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#6b7280" }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
        {tasks.map((t) => (
          <Card
            key={t.id}
            sx={{
              borderRadius: "12px",
              border: "1.5px solid #e9eaec",
              boxShadow: "none",
            }}
          >
            <Box display="flex">
              <Box
                sx={{
                  width: 3,
                  background: t.priorityBg,
                  flexShrink: 0,
                  borderRadius: "12px 0 0 12px",
                }}
              />
              <CardContent sx={{ p: "12px 14px !important", flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#111827",
                    mb: 0.2,
                  }}
                >
                  {t.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.65rem", mb: 0.8 }}
                >
                  {t.assetName}
                </Typography>
                <Stack gap={0.4} mb={1}>
                  <MetaRow Icon={DescriptionOutlinedIcon} text={t.type} />
                  <MetaRow Icon={LocationOnOutlinedIcon} text={t.location} />
                </Stack>
                <Box display="flex" gap={0.8} mb={1.2} flexWrap="wrap">
                  <Badge bg={t.priorityBg} color={t.priorityColor} small>
                    {t.priority}
                  </Badge>
                  <Badge bg={t.statusBg} color={t.statusColor} small>
                    {t.status}{" "}
                  </Badge>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 11 }} />}
                  onClick={() => {
                    onClose();
                    onStart(t);
                  }}
                  sx={{
                    background:
                      "linear-gradient(135deg,#0d3d52 0%,#1a5a78 100%)",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    borderRadius: "8px",
                    py: 0.7,
                  }}
                >
                  {t.btn}
                </Button>
              </CardContent>
            </Box>
          </Card>
        ))}
        {tasks.length === 0 && (
          <Typography
            color="text.secondary"
            textAlign="center"
            py={2}
            sx={{ fontSize: "0.75rem" }}
          >
            No tasks on this day
          </Typography>
        )}
      </Box>
    </DialogContent>
  </Dialog>
);

/* ═══════════════════════ LIST VIEW ═════════════════════════════════════════ */
const ListView = ({ view, setView, onStart }) => {
  const {
    assignments,
    stats,
    loading,
    error,
    filters,
    fetchAssignments,
    applyFilters,
    pagination,
    changePage,
  } = useAssignment();

  return (
    <>
      <Header
        view={view}
        setView={setView}
        onRefresh={() => fetchAssignments({})}
        loading={loading}
      />
      <FiltersBar showMore filters={filters} onFilter={applyFilters} />

      {error && (
        <Box px={3} mb={1.5}>
          <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
            {error}
          </Alert>
        </Box>
      )}

      <Box px={{ xs: 2, md: 3 }} mb={2.5}>
        <Stack direction="row" gap={1.5} flexWrap="wrap">
          <StatCard
            label="Total Tasks"
            value={stats?.total}
            loading={loading}
          />
          <StatCard label="Pending" value={stats?.pending} loading={loading} />
          <StatCard
            label="In Progress"
            value={stats?.inProgress}
            loading={loading}
          />
          <StatCard label="Overdue" value={stats?.overdue} loading={loading} />
        </Stack>
      </Box>

      <Box px={{ xs: 2, md: 3 }}>
        <Grid container spacing={2}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TaskCardSkeleton />
              </Grid>
            ))
          ) : assignments.length > 0 ? (
            assignments.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <TaskCard task={t} onStart={onStart} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={6} color="text.secondary">
                <Typography variant="h6" sx={{ fontSize: "0.9rem", mb: 0.5 }}>
                  No assignments found
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.7rem" }}>
                  Try changing your filters or check back later.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* FIX: use normalised totalPages from context */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3} pb={3}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_, p) => changePage(p)}
              color="primary"
              shape="rounded"
              size="small"
            />
          </Box>
        )}
      </Box>
    </>
  );
};

/* ═══════════════════════ CALENDAR VIEW ═════════════════════════════════════ */
const CalendarView = ({ view, setView, onStart }) => {
  const { assignments, loading, fetchAssignments, filters, applyFilters } =
    useAssignment();
  const now = new Date();
  const [curYear, setCurYear] = useState(now.getFullYear());
  const [curMonth, setCurMonth] = useState(now.getMonth());
  const [modalDay, setModalDay] = useState(null);

  const weeks = buildCalendarWeeks(curYear, curMonth);
  const dotsByDay = buildCalendarData(
    assignments.filter((a) => {
      if (!a.due || a.due === "—") return false;
      const d = new Date(a.due);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    }),
  );

  const prevMonth = () => {
    if (curMonth === 0) {
      setCurYear((y) => y - 1);
      setCurMonth(11);
    } else setCurMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (curMonth === 11) {
      setCurYear((y) => y + 1);
      setCurMonth(0);
    } else setCurMonth((m) => m + 1);
  };

  const modalTasks = modalDay
    ? (dotsByDay[modalDay] || []).map((d) => d.task).filter(Boolean)
    : [];

  return (
    <>
      <Header
        view={view}
        setView={setView}
        onRefresh={() => fetchAssignments({})}
        loading={loading}
      />
      <FiltersBar showMore={false} filters={filters} onFilter={applyFilters} />

      <Box px={{ xs: 2, md: 3 }} pb={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={prevMonth}
              sx={{
                border: "1.5px solid #e5e7eb",
                borderRadius: "6px",
                width: 28,
                height: 28,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                minWidth: 120,
                textAlign: "center",
              }}
            >
              {MONTHS[curMonth]} {curYear}
            </Typography>
            <IconButton
              size="small"
              onClick={nextMonth}
              sx={{
                border: "1.5px solid #e5e7eb",
                borderRadius: "6px",
                width: 28,
                height: 28,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {DAY_HEADERS.map((d) => (
              <Box
                key={d}
                sx={{
                  py: 0.8,
                  textAlign: "center",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  borderBottom: "1.5px solid #e9eaec",
                  background: "#fafafa",
                }}
              >
                {d}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {weeks.flatMap((week, wi) =>
              week.map(({ d, o, today }, ci) => {
                const dots = !o && dotsByDay[d];
                const isClick = !o && dots && dots.length > 0;
                return (
                  <Tooltip
                    key={`${wi}-${ci}`}
                    title={isClick ? `${dots.length} task(s)` : ""}
                    arrow
                  >
                    <Box
                      onClick={() => isClick && setModalDay(d)}
                      sx={{
                        minHeight: { xs: 56, md: 72 },
                        p: 0.8,
                        border: "0.5px solid #e9eaec",
                        background: o ? "#f8f9fa" : "#fff",
                        outline: today ? "1.5px solid #0d3d52" : "none",
                        outlineOffset: "-1px",
                        cursor: isClick ? "pointer" : "default",
                        "&:hover": isClick ? { background: "#f0f9ff" } : {},
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: o ? "#c4c4c4" : today ? "#0d3d52" : "#374151",
                          fontWeight: today ? 600 : 400,
                          mb: 0.4,
                        }}
                      >
                        {d}
                      </Typography>
                      {dots && (
                        <Box display="flex" gap="2px" flexWrap="wrap">
                          {dots.slice(0, 3).map((dot, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: dot.color,
                              }}
                            />
                          ))}
                          {dots.length > 3 && (
                            <Typography
                              sx={{
                                fontSize: "0.55rem",
                                color: "#6b7280",
                                lineHeight: "6px",
                              }}
                            >
                              +{dots.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              }),
            )}
          </Box>
        </Box>

        <Box
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, px: 0.5 }}
        >
          {LEGEND.map(({ color, label }) => (
            <Box key={label} display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                }}
              />
              <Typography sx={{ fontSize: "0.8rem", color: "#374151", ml: 1 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <DayModal
        open={!!modalDay}
        day={modalDay}
        month={curMonth}
        year={curYear}
        tasks={modalTasks}
        onClose={() => setModalDay(null)}
        onStart={onStart}
      />
    </>
  );
};

/* ═══════════════════════ MAIN EXPORT ═══════════════════════════════════════ */
export default function MyTasks() {
  const navigate = useNavigate();
  const [view, setView] = useState("list");

  // FIXED: Properly navigate to task details page with the assignment ID
  const handleStart = useCallback(
    (task) => {
      // Get the assignment ID from the task object
      const assignmentId = task.id || task.assignmentId || task._id;
      
      if (!assignmentId) {
        console.error("No assignment ID found in task:", task);
        return;
      }
      
      // Navigate to task details page with the assignment ID as URL parameter
      navigate(`/team/task-details/${assignmentId}`);
    },
    [navigate],
  );

  return (
    <ThemeProvider theme={theme}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ minHeight: "100vh" }}>
        {view === "list" ? (
          <ListView view={view} setView={setView} onStart={handleStart} />
        ) : (
          <CalendarView view={view} setView={setView} onStart={handleStart} />
        )}
      </Box>
    </ThemeProvider>
  );
}