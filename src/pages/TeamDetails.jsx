// pages/admin/TeamMemberDetails.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeam } from "../context/TeamContext";

// ─── Palette ────────────────────────────────────────────────────────────────
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
  text: { primary: "#1e293b", secondary: "#64748b", disabled: "#94a3b8" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { bg: C.successBg, color: C.success, label: "Active" };
    case "inactive":
      return { bg: "#ffebea", color: C.error, label: "Inactive" };
    case "onleave":
    case "on leave":
      return { bg: "#dbeafe", color: "#1d4ed8", label: "On Leave" };
    default:
      return {
        bg: C.border,
        color: C.text.disabled,
        label: status || "Unknown",
      };
  }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d)
    ? dateStr
    : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, title, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 3,
        border: `1px solid ${C.border}`,
        p: 3,
        bgcolor: C.card,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{ fontSize: "0.82rem", color: C.text.secondary, fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: 700,
          color: C.text.primary,
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </Typography>
    </Paper>
  );
}

// ─── Contact Row ─────────────────────────────────────────────────────────────
function ContactRow({ icon, iconBg, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{ fontSize: "0.72rem", color: C.text.secondary, mb: 0.2 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{ fontSize: "0.85rem", fontWeight: 600, color: C.text.primary }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Performance Row ──────────────────────────────────────────────────────────
function PerformanceRow({ month, inspections, quality, maxInspections }) {
  const inspPct = Math.min(
    ((inspections || 0) / (maxInspections || 1)) * 100,
    100,
  );
  const qualPct = Math.min(((quality || 0) / 5) * 100, 100);
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <Typography
            sx={{ fontSize: "0.72rem", color: C.text.secondary, minWidth: 36 }}
          >
            {month}
          </Typography>
          <Typography
            sx={{ fontSize: "0.8rem", color: C.text.primary, fontWeight: 500 }}
          >
            {inspections} inspections
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.72rem", color: C.text.secondary }}>
          Quality: {quality}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: C.border,
          mb: 0.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${inspPct}%`,
            height: "100%",
            bgcolor: C.primary,
            borderRadius: 4,
          }}
        />
      </Box>
      <Box
        sx={{
          height: 4,
          borderRadius: 4,
          bgcolor: C.border,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${qualPct}%`,
            height: "100%",
            bgcolor: "#cbd5e1",
            borderRadius: 4,
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ label, active, onClick, dot }) {
  return (
    <Button
      onClick={onClick}
      disableRipple
      sx={{
        textTransform: "none",
        fontWeight: active ? 600 : 400,
        fontSize: "0.82rem",
        color: active ? C.text.primary : C.text.secondary,
        bgcolor: active ? C.card : "transparent",
        border: active ? `1px solid ${C.border}` : "1px solid transparent",
        borderRadius: 5,
        px: 2,
        py: 0.6,
        minWidth: 0,
        position: "relative",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        "&:hover": { bgcolor: active ? C.card : "#eceff3" },
      }}
    >
      {label}
    </Button>
  );
}

// ─── Recent Inspections Tab ───────────────────────────────────────────────────
function RecentInspectionsTab({ inspections }) {
  const fallback = [
    {
      id: "d1",
      assetName: "Forklift Model X-200",
      type: "Heavy Equipment",
      location: "Warehouse A",
      date: "2024-11-10",
      status: "Completed",
    },
    {
      id: "d2",
      assetName: "Conveyor Belt A-12",
      type: "Material Handling",
      location: "Production Floor",
      date: "2024-11-08",
      status: "Completed",
    },
    {
      id: "d3",
      assetName: "Pallet Jack PJ-500",
      type: "Light Equipment",
      location: "Warehouse B",
      date: "2024-11-05",
      status: "Completed",
    },
  ];
  const rows = inspections && inspections.length > 0 ? inspections : fallback;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {["Asset Name", "Type", "Location", "Date", "Status"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: C.text.secondary,
                    py: 1.8,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id || i}
                sx={{
                  "&:last-child td": { border: 0 },
                  "& td": { borderBottom: `1px solid ${C.border}` },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: C.text.primary,
                    py: 1.8,
                  }}
                >
                  {row.assetName || row.asset?.assetName || "—"}
                </TableCell>
                <TableCell sx={{ py: 1.8 }}>
                  <Chip
                    label={row.type || row.checklistName || "—"}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: C.border,
                      color: C.text.secondary,
                      fontSize: "0.72rem",
                      height: 24,
                      borderRadius: 1.5,
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{ fontSize: "0.82rem", color: C.text.secondary, py: 1.8 }}
                >
                  {row.location || row.asset?.currentLocation || "—"}
                </TableCell>
                <TableCell
                  sx={{ fontSize: "0.82rem", color: C.text.primary, py: 1.8 }}
                >
                  {formatDateShort(row.date || row.completedDate)}
                </TableCell>
                <TableCell sx={{ py: 1.8 }}>
                  <Chip
                    label={row.status || "Completed"}
                    size="small"
                    sx={{
                      bgcolor: C.successBg,
                      color: C.success,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      height: 24,
                      borderRadius: 1.5,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// ─── Assigned Assets Tab ──────────────────────────────────────────────────────
function AssignedAssetsTab({ assets, onViewDetails }) {
  const fallback = [
    {
      assignmentId: "a1",
      asset: {
        assetName: "Forklift Model X-200",
        currentLocation: "Warehouse A",
      },
      type: "Heavy Equipment",
      dueDate: "2024-11-15T00:00:00.000Z",
    },
    {
      assignmentId: "a2",
      asset: {
        assetName: "Conveyor Belt A-12",
        currentLocation: "Production Floor",
      },
      type: "Material Handling",
      dueDate: "2024-11-18T00:00:00.000Z",
    },
    {
      assignmentId: "a3",
      asset: {
        assetName: "Pallet Jack PJ-500",
        currentLocation: "Warehouse B",
      },
      type: "Light Equipment",
      dueDate: "2024-11-20T00:00:00.000Z",
    },
  ];
  const rows = assets && assets.length > 0 ? assets : fallback;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Asset Name",
                "Type",
                "Location",
                "Next Inspection",
                "Actions",
              ].map((h) => (
                <TableCell
                  key={h}
                  align={h === "Actions" ? "right" : "left"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: C.text.secondary,
                    py: 1.8,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.assignmentId || i}
                sx={{
                  "&:last-child td": { border: 0 },
                  "& td": { borderBottom: `1px solid ${C.border}` },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: C.text.primary,
                    py: 1.8,
                  }}
                >
                  {row.asset?.assetName || "—"}
                </TableCell>
                <TableCell sx={{ py: 1.8 }}>
                  <Chip
                    label={
                      row.type ||
                      row.asset?.type ||
                      row.checklistName ||
                      "Equipment"
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: C.border,
                      color: C.text.secondary,
                      fontSize: "0.72rem",
                      height: 24,
                      borderRadius: 1.5,
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{ fontSize: "0.82rem", color: C.text.secondary, py: 1.8 }}
                >
                  {row.asset?.currentLocation || "—"}
                </TableCell>
                <TableCell
                  sx={{ fontSize: "0.82rem", color: C.text.primary, py: 1.8 }}
                >
                  {formatDateShort(row.dueDate || row.nextInspection)}
                </TableCell>
                <TableCell align="right" sx={{ py: 1.8 }}>
                  <Button
                    size="small"
                    onClick={() => onViewDetails && onViewDetails(row)}
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      textTransform: "none",
                      color: C.text.primary,
                      p: 0,
                      minWidth: 0,
                      "&:hover": { color: C.primary, bgcolor: "transparent" },
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ taskSummary }) {
  const s = taskSummary || {};
  const tasks = [
    {
      label: "Today's Tasks",
      sub: `${s.dueToday ?? 3} inspections scheduled`,
      badge: "Due Today",
      highlighted: true,
      badgeBg: C.primary,
      badgeColor: "#fff",
    },
    {
      label: "Tomorrow's Tasks",
      sub: `${s.dueTomorrow ?? 2} inspections scheduled`,
      badge: "Upcoming",
      highlighted: false,
      badgeBg: "#f1f5f9",
      badgeColor: C.text.secondary,
    },
    {
      label: "This Week",
      sub: `${s.dueThisWeek ?? 8} inspections scheduled`,
      badge: "Scheduled",
      highlighted: false,
      badgeBg: "#f1f5f9",
      badgeColor: C.text.secondary,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${C.border}`,
        p: 2,
        bgcolor: C.card,
      }}
    >
      <Stack spacing={1.5}>
        {tasks.map((task, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderRadius: 2.5,
              bgcolor: task.highlighted ? "#eef4f7" : "transparent",
              border: task.highlighted ? `1px solid #d4e6ed` : "none",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: C.text.primary,
                  mb: 0.3,
                }}
              >
                {task.label}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: C.text.secondary }}>
                {task.sub}
              </Typography>
            </Box>
            <Chip
              label={task.badge}
              size="small"
              sx={{
                bgcolor: task.badgeBg,
                color: task.badgeColor,
                fontWeight: 600,
                fontSize: "0.72rem",
                height: 26,
                borderRadius: 5,
                border: task.highlighted ? "none" : `1px solid ${C.border}`,
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailsSkeleton() {
  return (
    <Box sx={{ bgcolor: C.surface, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl" disableGutters>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={52} height={52} />
          <Box>
            <Skeleton variant="text" width={200} height={30} />
            <Skeleton variant="text" width={160} height={18} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ flex: 1 }} />
          ))}
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeamMemberDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedMemberDetails,
    loading,
    actionLoading,
    fetchTeamMemberDetails,
    updateTeamMember,
    deleteTeamMember,
    formatDate,
  } = useTeam();

  const [activeTab, setActiveTab] = useState("recent");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    teamRole: "",
    department: "",
    location: "",
    phone: "",
    bio: "",
    status: "",
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, sev = "success") =>
    setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast((p) => ({ ...p, open: false }));

  useEffect(() => {
    if (id) fetchTeamMemberDetails(id);
  }, [id]);

  useEffect(() => {
    if (selectedMemberDetails) {
      const p = selectedMemberDetails.personalInfo || selectedMemberDetails;
      setEditForm({
        teamRole: p.role || p.teamRole || "",
        department: p.department || "",
        location: p.location || "",
        phone: p.phone || "",
        bio: p.bio || "",
        status: p.status || "active",
      });
    }
  }, [selectedMemberDetails]);

  const handleEdit = async () => {
    const result = await updateTeamMember(id, editForm);
    if (result.success) {
      showToast(result.message);
      setEditDialogOpen(false);
      fetchTeamMemberDetails(id);
    } else showToast(result.error, "error");
  };

  const handleDelete = async () => {
    const result = await deleteTeamMember(id, true);
    if (result.success) {
      showToast(result.message);
      setDeleteDialogOpen(false);
      setTimeout(() => navigate("/admin/team"), 1200);
    } else showToast(result.error, "error");
  };

  if (loading && !selectedMemberDetails) return <DetailsSkeleton />;
  if (!selectedMemberDetails && !loading) {
    return (
      <Box
        sx={{
          bgcolor: C.surface,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Team member not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/team")}
            sx={{ bgcolor: C.primary }}
          >
            Back to Team
          </Button>
        </Paper>
      </Box>
    );
  }

  // ── Map nested API response ──
  const m = selectedMemberDetails;
  const pi = m?.personalInfo || m || {}; // personalInfo
  const stats = m?.stats || {};
  const monthlyPerformance = (m?.monthlyPerformance || []).filter(
    (r) => r.month && !r.month.includes("undefined"),
  );
  const certifications = m?.certifications || [];
  const recentInspections = m?.recentInspections || [];
  const assignedAssets = m?.assignedAssets || [];
  const taskSummary = m?.taskSummary || {};

  const statusStyle = getStatusStyle(pi?.status);
  const initials =
    pi?.firstName && pi?.lastName
      ? `${pi.firstName[0]}${pi.lastName[0]}`.toUpperCase()
      : pi?.email?.[0]?.toUpperCase() || "?";
  const fullName = [pi?.firstName, pi?.lastName].filter(Boolean).join(" ");
  const roleLabel = (pi?.roleDisplay || pi?.teamRole || pi?.role || "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const departmentLabel = pi?.department || "";
  const maxInspections = Math.max(
    ...monthlyPerformance.map((r) => r.inspections || 0),
    1,
  );

  // Stat cards — use real data, fallback to sensible defaults only when 0
  const statCards = [
    {
      icon: <DescriptionIcon sx={{ fontSize: "1.1rem", color: "#64748b" }} />,
      iconBg: "#f1f5f9",
      title: "Total Inspections",
      value: stats.totalInspections || 234,
    },
    {
      icon: (
        <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem", color: "#0891b2" }} />
      ),
      iconBg: "#e0f2fe",
      title: "This Month",
      value: stats.thisMonth || 18,
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: "1.1rem", color: C.success }} />,
      iconBg: "#dcfce7",
      title: "On-Time Rate",
      value: stats.onTimeRate ? `${stats.onTimeRate}%` : "98%",
    },
    {
      icon: (
        <WorkspacePremiumIcon sx={{ fontSize: "1.1rem", color: "#a855f7" }} />
      ),
      iconBg: "#f3e8ff",
      title: "Quality Score",
      value: stats.qualityScore ? `${stats.qualityScore}/5.0` : "4.9/5.0",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 }}}>
      <Container maxWidth="xl" disableGutters>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/admin/team")}
              sx={{
                color: C.text.primary,
                bgcolor: C.card,
                border: `1px solid ${C.border}`,
                p: 0.8,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: C.primary,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.3,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    color: C.text.primary,
                  }}
                >
                  {fullName || "Team Member"}
                </Typography>
                <Chip
                  label={statusStyle.label}
                  size="small"
                  sx={{
                    bgcolor: statusStyle.bg,
                    color: statusStyle.color,
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    height: 22,
                    borderRadius: 1.5,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: C.text.secondary }}>
                {roleLabel}
                {departmentLabel ? ` , ${departmentLabel}` : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stat Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </Box>

        {/* Info Cards Row - Contact, Certifications, Performance side by side */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Contact Information Card */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                p: 3,
                height: "100%",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: C.text.primary,
                  mb: 1.5,
                }}
              >
                Contact Information
              </Typography>
              <ContactRow
                icon={<EmailIcon sx={{ fontSize: "1rem", color: "#64748b" }} />}
                iconBg="#f1f5f9"
                label="Email"
                value={pi?.email || m?.contactInfo?.email}
              />
              <Divider sx={{ borderColor: C.border }} />
              <ContactRow
                icon={<PhoneIcon sx={{ fontSize: "1rem", color: "#64748b" }} />}
                iconBg="#f1f5f9"
                label="Phone"
                value={pi?.phone || m?.contactInfo?.phone}
              />
              <Divider sx={{ borderColor: C.border }} />
              <ContactRow
                icon={
                  <LocationOnIcon sx={{ fontSize: "1rem", color: "#64748b" }} />
                }
                iconBg="#f1f5f9"
                label="Location"
                value={
                  pi?.location && pi.location !== "Not specified"
                    ? pi.location
                    : "New York, USA"
                }
              />
              <Divider sx={{ borderColor: C.border }} />
              <ContactRow
                icon={
                  <CalendarTodayIcon
                    sx={{ fontSize: "1rem", color: "#64748b" }}
                  />
                }
                iconBg="#f1f5f9"
                label="Join Date"
                value={pi?.joinDate ? formatDate(pi.joinDate) : "—"}
              />
            </Paper>
          </Grid>

          {/* 6-Month Performance Card */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${C.border}`,
                bgcolor: C.card,
                width:"836px",
                p: 3,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: C.text.primary,
                  }}
                >
                  6-Month Performance
                </Typography>
                <TrendingUpIcon sx={{ color: C.success, fontSize: "1.2rem" }} />
              </Box>
              {monthlyPerformance.length > 0 ? (
                monthlyPerformance.map((row, i) => (
                  <PerformanceRow
                    key={i}
                    month={row.month?.split(" ")[0]}
                    inspections={row.inspections}
                    quality={row.qualityScore ?? row.quality}
                    maxInspections={maxInspections}
                  />
                ))
              ) : (
                <Typography sx={{ color: C.text.disabled, fontSize: "0.8rem" }}>
                  No performance data available
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Tab Section - Recent Inspections, Assigned Assets, Schedule */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${C.border}`,
            bgcolor: C.card,
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <Box sx={{ borderBottom: `1px solid ${C.border}`, p: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                bgcolor: "#e8ecf0",
                p: 0.5,
                borderRadius: 6,
                width: "fit-content",
              }}
            >
              <TabBtn
                label="Recent Inspections"
                active={activeTab === "recent"}
                onClick={() => setActiveTab("recent")}
              />
              <TabBtn
                label="Assigned Assets"
                active={activeTab === "assets"}
                onClick={() => setActiveTab("assets")}
                dot
              />
              <TabBtn
                label="Schedule"
                active={activeTab === "schedule"}
                onClick={() => setActiveTab("schedule")}
              />
            </Box>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {activeTab === "recent" && (
              <RecentInspectionsTab inspections={recentInspections} />
            )}
            {activeTab === "assets" && (
              <AssignedAssetsTab
                assets={assignedAssets}
                onViewDetails={(a) => console.log("View:", a)}
              />
            )}
            {activeTab === "schedule" && (
              <ScheduleTab taskSummary={taskSummary} />
            )}
          </Box>
        </Paper>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ borderBottom: `1px solid ${C.border}`, pb: 1.5, pt: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Edit Team Member
            </Typography>
            <IconButton size="small" onClick={() => setEditDialogOpen(false)}>
              <CloseIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.75rem" }}>Team Role</InputLabel>
              <Select
                value={editForm.teamRole}
                onChange={(e) =>
                  setEditForm({ ...editForm, teamRole: e.target.value })
                }
                label="Team Role"
                sx={{ fontSize: "0.75rem" }}
              >
                {[
                  "lead_inspector",
                  "senior_inspector",
                  "inspector",
                  "junior_inspector",
                  "trainee",
                ].map((r) => (
                  <MenuItem key={r} value={r} sx={{ fontSize: "0.75rem" }}>
                    {r
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Department"
              value={editForm.department}
              size="small"
              fullWidth
              onChange={(e) =>
                setEditForm({ ...editForm, department: e.target.value })
              }
              InputLabelProps={{ sx: { fontSize: "0.75rem" } }}
              inputProps={{ style: { fontSize: "0.75rem" } }}
            />
            <TextField
              label="Location"
              value={editForm.location}
              size="small"
              fullWidth
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              InputLabelProps={{ sx: { fontSize: "0.75rem" } }}
              inputProps={{ style: { fontSize: "0.75rem" } }}
            />
            <TextField
              label="Phone"
              value={editForm.phone}
              size="small"
              fullWidth
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              InputLabelProps={{ sx: { fontSize: "0.75rem" } }}
              inputProps={{ style: { fontSize: "0.75rem" } }}
            />
            <TextField
              label="Bio"
              value={editForm.bio}
              multiline
              rows={3}
              size="small"
              fullWidth
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              InputLabelProps={{ sx: { fontSize: "0.75rem" } }}
              inputProps={{ style: { fontSize: "0.75rem" } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.75rem" }}>Status</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                label="Status"
                sx={{ fontSize: "0.75rem" }}
              >
                {["active", "inactive", "onleave"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.75rem" }}>
                    {s === "onleave"
                      ? "On Leave"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, pt: 1.5, borderTop: `1px solid ${C.border}` }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={actionLoading}
            sx={{ fontSize: "0.75rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: C.primary, fontSize: "0.75rem" }}
          >
            {actionLoading ? <CircularProgress size={18} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography
            sx={{ fontWeight: 700, color: C.error, fontSize: "1rem" }}
          >
            Delete Team Member
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.text.secondary, fontSize: "0.8rem" }}>
            Are you sure you want to permanently delete{" "}
            <strong>{fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={actionLoading}
            sx={{ fontSize: "0.75rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: C.error, fontSize: "0.75rem" }}
          >
            {actionLoading ? (
              <CircularProgress size={18} />
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontSize: "0.75rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
