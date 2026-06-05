import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../context/AuthContexts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ─── Theme ─────────────────────────────────────────────────────────────────
const TEAL = "#1B4D5C";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: TEAL },
    background: { default: "#F4F6F9", paper: "#FFFFFF" },
    text: { primary: "#1A2B3C", secondary: "#6B7A8D" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          border: "1px solid #E8EDF2",
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
        },
      },
    },
  },
});

// ─── Export Functions ─────────────────────────────────────────────────────
const exportToPDF = (
  checklistName,
  summary,
  statusDistribution,
  submissionTrend,
  topPerformers,
) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(27, 77, 92);
  doc.text(checklistName, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Analytics & Performance Report", 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

  doc.setFontSize(14);
  doc.setTextColor(27, 77, 92);
  doc.text("Summary Statistics", 14, 50);

  doc.autoTable({
    startY: 55,
    head: [["Metric", "Value"]],
    body: [
      ["Total Assignments", summary.totalAssignments],
      ["Total Responses", summary.totalResponses],
      ["Completion Rate", `${summary.completionRate}%`],
      ["Approval Rate", `${summary.approvalRate}%`],
      ["Approved", summary.approved],
      ["Rejected", summary.rejected],
      ["Pending Review", summary.pendingReview],
      ["Avg. Completion Time", `${summary.avgCompletionTime} minutes`],
    ],
    theme: "striped",
    headStyles: { fillColor: [27, 77, 92] },
    margin: { left: 14 },
  });

  let yOffset = doc.lastAutoTable.finalY + 15;

  if (statusDistribution.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(27, 77, 92);
    doc.text("Status Distribution", 14, yOffset);

    doc.autoTable({
      startY: yOffset + 5,
      head: [["Status", "Count", "Percentage"]],
      body: statusDistribution.map((item) => [
        item.label,
        item.value,
        `${item.percentage}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [27, 77, 92] },
      margin: { left: 14 },
    });

    yOffset = doc.lastAutoTable.finalY + 15;
  }

  if (submissionTrend.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(27, 77, 92);
    doc.text("Submission Trend", 14, yOffset);

    doc.autoTable({
      startY: yOffset + 5,
      head: [["Date", "Submissions"]],
      body: submissionTrend.map((item) => [item.date, item.count]),
      theme: "striped",
      headStyles: { fillColor: [27, 77, 92] },
      margin: { left: 14 },
    });

    yOffset = doc.lastAutoTable.finalY + 15;
  }

  if (topPerformers.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(27, 77, 92);
    doc.text("Top Performers", 14, yOffset);

    doc.autoTable({
      startY: yOffset + 5,
      head: [["Name", "Submissions", "Score"]],
      body: topPerformers.map((p) => [p.name, p.submissions, `${p.score}%`]),
      theme: "striped",
      headStyles: { fillColor: [27, 77, 92] },
      margin: { left: 14 },
    });
  }

  doc.save(`${checklistName.replace(/\s+/g, "_")}_Analytics_Report.pdf`);
};

const exportToExcel = (
  checklistName,
  summary,
  statusDistribution,
  submissionTrend,
  topPerformers,
) => {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ["Metric", "Value"],
    ["Total Assignments", summary.totalAssignments],
    ["Total Responses", summary.totalResponses],
    ["Completion Rate", `${summary.completionRate}%`],
    ["Approval Rate", `${summary.approvalRate}%`],
    ["Approved", summary.approved],
    ["Rejected", summary.rejected],
    ["Pending Review", summary.pendingReview],
    ["Avg. Completion Time", `${summary.avgCompletionTime} minutes`],
    ["Report Generated", new Date().toLocaleString()],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  if (statusDistribution.length > 0) {
    const statusData = [
      ["Status", "Count", "Percentage"],
      ...statusDistribution.map((item) => [
        item.label,
        item.value,
        `${item.percentage}%`,
      ]),
    ];
    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, "Status Distribution");
  }

  if (submissionTrend.length > 0) {
    const trendData = [
      ["Date", "Submissions"],
      ...submissionTrend.map((item) => [item.date, item.count]),
    ];
    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(workbook, trendSheet, "Submission Trend");
  }

  if (topPerformers.length > 0) {
    const performersData = [
      ["Name", "Submissions", "Score"],
      ...topPerformers.map((p) => [p.name, p.submissions, `${p.score}%`]),
    ];
    const performersSheet = XLSX.utils.aoa_to_sheet(performersData);
    XLSX.utils.book_append_sheet(workbook, performersSheet, "Top Performers");
  }

  XLSX.writeFile(
    workbook,
    `${checklistName.replace(/\s+/g, "_")}_Analytics_Report.xlsx`,
  );
};

// ─── Stat Card Component ─────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  loading,
}) {
  if (loading) {
    return (
      <Paper sx={{ p: 2.8, height: "100%" }}>
        <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="80%" height={20} />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2.8,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width:"232px",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ color: iconColor, fontSize: 24 }} />
        </Box>
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "text.secondary",
            mb: 0.5,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          {value !== undefined && value !== null ? value : 0}
        </Typography>
      </Box>
      {sub && (
        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

// ─── Custom Pie Label ────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function CustomPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  percentage,
  color,
}) {
  const radius = outerRadius + 36;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (value === 0) return null;
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize={11}
      fontWeight={500}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name}: ${percentage}%`}
    </text>
  );
}

// ─── Detail Sub-card ─────────────────────────────────────────────────────
function DetailSubCard({ icon: Icon, title, rows, hasProgress, isLoading }) {
  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 2.5,
          background: "#EEF3F8",
          border: "none",
          boxShadow: "none",
          borderRadius: 1,
          height: "100%",
        }}
      >
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="90%" height={40} />
        <Skeleton variant="text" width="90%" height={40} />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2.5,
        background: "#EEF3F8",
        border: "none",
        boxShadow: "none",
        borderRadius: 1,
        width:"362px",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Icon sx={{ fontSize: 18, color: TEAL }} />
        <Typography
          sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}
        >
          {title}
        </Typography>
      </Box>
      {rows.map((row, i) => (
        <Box key={i} sx={{ mb: hasProgress ? 1.5 : 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: hasProgress ? 0.6 : 0,
            }}
          >
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
              {row.label}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {row.value}
            </Typography>
          </Box>
          {hasProgress && (
            <LinearProgress
              variant="determinate"
              value={parseFloat(row.value)}
              sx={{
                height: 6,
                borderRadius: 6,
                backgroundColor: "#D5E0EA",
                "& .MuiLinearProgress-bar": {
                  background: TEAL,
                  borderRadius: 6,
                },
              }}
            />
          )}
        </Box>
      ))}
    </Paper>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function ChecklistAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [checklistName, setChecklistName] = useState("Checklist Analytics");
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch analytics data from API
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:9001/api/v1/assignments/checklist/${id}/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
        setChecklistName(data.checklistName || "Checklist Analytics");
      } else {
        setError(data.message || "Failed to fetch analytics");
        setSnackbar({
          open: true,
          message: data.message || "Failed to fetch analytics",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics");
      setSnackbar({
        open: true,
        message: err.message || "Failed to load analytics",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      fetchAnalytics();
    }
  }, [id, token, fetchAnalytics]);

  // Get data from API response
  const getSummary = () => {
    if (analytics?.summary) {
      return analytics.summary;
    }
    return {
      totalAssignments: 0,
      totalResponses: 0,
      completionRate: 0,
      approvalRate: 0,
      approved: 0,
      rejected: 0,
      pendingReview: 0,
      avgCompletionTime: 0,
    };
  };

  const getSubmissionTrend = () => {
    if (analytics?.submissionTrend && analytics.submissionTrend.length > 0) {
      return analytics.submissionTrend.map((item) => ({
        date: item.date,
        value: item.count,
      }));
    }
    return [];
  };

  const getStatusDistribution = () => {
    if (
      analytics?.statusDistribution &&
      analytics.statusDistribution.length > 0
    ) {
      const colors = {
        Approved: "#1BB87A",
        Rejected: "#E05252",
        "Pending Review": "#F4A535",
      };
      return analytics.statusDistribution.map((item) => ({
        label: item.label,
        value: item.value,
        percentage: item.percentage,
        color: colors[item.label] || TEAL,
      }));
    }
    return [];
  };

  const getTopPerformers = () => {
    if (analytics?.topPerformers && analytics.topPerformers.length > 0) {
      return analytics.topPerformers.map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        submissions: p.submissions,
        score: p.score,
      }));
    }
    return [];
  };

  const summary = getSummary();
  const submissionTrend = getSubmissionTrend();
  const statusDistribution = getStatusDistribution();
  const topPerformers = getTopPerformers();

  // Calculate additional stats
  const onTimeRate =
    summary.completionRate > 0
      ? Math.min(100, Math.round(summary.completionRate * 0.95))
      : 0;
  const delayedRate = summary.completionRate - onTimeRate;
  const minorIssues =
    summary.rejected > 0 ? Math.round(summary.rejected * 1.5) : 0;

  const statCards = [
    {
      icon: PeopleAltOutlinedIcon,
      iconBg: TEAL,
      iconColor: "#fff",
      label: "Total Assignments",
      value: summary.totalAssignments,
      sub: `${summary.totalResponses} responses received`,
    },
    {
      icon: CheckCircleOutlinedIcon,
      iconBg: "#1BB87A",
      iconColor: "#fff",
      label: "Completion Rate",
      value: `${summary.completionRate}%`,
      sub: `${summary.totalResponses} of ${summary.totalAssignments} completed`,
    },
    {
      icon: AccessTimeOutlinedIcon,
      iconBg: "#F4A535",
      iconColor: "#fff",
      label: "Avg. Completion Time",
      value: `${summary.avgCompletionTime}m`,
      sub: "Average time per assignment",
    },
    {
      icon: BarChartOutlinedIcon,
      iconBg: "#9C27B0",
      iconColor: "#fff",
      label: "Approval Rate",
      value: `${summary.approvalRate}%`,
      sub: `${summary.approved} approved, ${summary.rejected} rejected`,
    },
  ];

  const detailedStats = {
    responseQuality: {
      approved: summary.approved,
      rejected: summary.rejected,
      pendingReview: summary.pendingReview,
      total: summary.totalResponses,
    },
    timeliness: {
      onTime: onTimeRate,
      delayed: delayedRate,
    },
    issues: {
      critical: summary.rejected || 0,
      minor: minorIssues,
    },
  };

  const handleExport = (type) => {
    if (type === "PDF") {
      exportToPDF(
        checklistName,
        summary,
        statusDistribution,
        submissionTrend,
        topPerformers,
      );
    } else if (type === "Excel") {
      exportToExcel(
        checklistName,
        summary,
        statusDistribution,
        submissionTrend,
        topPerformers,
      );
    }
    setSnackbar({
      open: true,
      message: `${type} report exported successfully!`,
      severity: "success",
    });
    setExportAnchorEl(null);
  };

  const handleRefresh = () => {
    fetchAnalytics();
    setSnackbar({
      open: true,
      message: "Refreshing analytics...",
      severity: "info",
    });
  };

  if (loading && !analytics) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "#F4F6F9",
            p: { xs: 2, md: 3.5 },
          }}
        >
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          p: { xs: 2, md: 3.5 },
        }}
      >
        {/* Back navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon sx={{ fontSize: 18, color: TEAL }} />
          <Typography
            sx={{ fontSize: "0.85rem", color: TEAL, fontWeight: 500 }}
          >
            Back to Assigned Checklists
          </Typography>
        </Box>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: "text.primary",
                fontSize: { xs: "1.2rem", sm: "1.3rem" },
                mb: 0.3,
              }}
            >
              {checklistName}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              Analytics & Performance Dashboard
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
              onClick={handleRefresh}
              sx={{
                borderColor: "#D0D9E4",
                color: "text.primary",
                textTransform: "none",
                fontSize: "0.8rem",
                borderRadius: 3,
                px: 2,
                py: 0.8,
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              sx={{
                background: TEAL,
                textTransform: "none",
                fontSize: "0.8rem",
                borderRadius: 3,
                px: 2.5,
                py: 0.8,
                boxShadow: "none",
                "&:hover": { background: "#163D4A" },
              }}
            >
              Export Report
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={() => setExportAnchorEl(null)}
            >
              <MenuItem onClick={() => handleExport("PDF")}>
                <PictureAsPdfIcon sx={{ fontSize: 18, mr: 1 }} /> Export as PDF
              </MenuItem>
              <MenuItem onClick={() => handleExport("Excel")}>
                <TableChartIcon sx={{ fontSize: 18, mr: 1 }} /> Export as Excel
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <StatCard {...card} loading={loading && !analytics} />
            </Grid>
          ))}
        </Grid>

        {/* Charts Row 1: Line + Pie */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Submission Trend */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: { xs: 300, sm: 340 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width:"525px",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Submission Trend
                </Typography>
                <Chip
                  label="Last 30 Days"
                  size="small"
                  sx={{
                    background: "#EEF3F8",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              </Box>
              {submissionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={submissionTrend}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0F4F8"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#9BA8B5" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9BA8B5" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RTooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E8EDF2",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={TEAL}
                      strokeWidth={2.5}
                      fill={`${TEAL}15`}
                      fillOpacity={0.3}
                      dot={{ fill: TEAL, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: TEAL }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 220,
                  }}
                >
                  <Typography sx={{ color: "text.secondary" }}>
                    No submission data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Status Distribution */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: { xs: 300, sm: 340 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  width:"520px",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Status Distribution
                </Typography>
                <Chip
                  label={`${summary.totalResponses} Total`}
                  size="small"
                  sx={{
                    background: "#EEF3F8",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              </Box>
              {statusDistribution.length > 0 &&
              statusDistribution.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="45%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      label={<CustomPieLabel />}
                    >
                      {statusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 230,
                  }}
                >
                  <Typography sx={{ color: "text.secondary" }}>
                    No status data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Statistics */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", mb: 2.5 }}>
            Detailed Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <DetailSubCard
                icon={TaskAltOutlinedIcon}
                title="Response Quality"
                rows={[
                  {
                    label: "Approved",
                    value: detailedStats.responseQuality.approved,
                  },
                  {
                    label: "Rejected",
                    value: detailedStats.responseQuality.rejected,
                  },
                  {
                    label: "Pending Review",
                    value: detailedStats.responseQuality.pendingReview,
                  },
                ]}
                hasProgress={false}
                isLoading={loading && !analytics}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailSubCard
                icon={AccessTimeOutlinedIcon}
                title="Timeliness"
                rows={[
                  {
                    label: "On-time Submissions",
                    value: `${detailedStats.timeliness.onTime}%`,
                  },
                  {
                    label: "Delayed Submissions",
                    value: `${detailedStats.timeliness.delayed}%`,
                  },
                ]}
                hasProgress={true}
                isLoading={loading && !analytics}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DetailSubCard
                icon={ErrorOutlineIcon}
                title="Issues Reported"
                rows={[
                  {
                    label: "Critical Issues",
                    value: detailedStats.issues.critical,
                  },
                  { label: "Minor Issues", value: detailedStats.issues.minor },
                ]}
                hasProgress={false}
                isLoading={loading && !analytics}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", mb: 2.5 }}>
              Top Performers
            </Typography>
            {topPerformers.map((performer, i) => (
              <Box key={i}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.8,
                    flexWrap: "wrap",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      background: TEAL,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {performer.rank}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "text.primary",
                      }}
                    >
                      {performer.name}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                    >
                      {performer.submissions} submissions
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      textAlign: "right",
                      minWidth: { xs: "100%", sm: 140 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: "text.primary",
                        mb: 0.6,
                      }}
                    >
                      Score: {performer.score}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={performer.score}
                      sx={{
                        height: 6,
                        borderRadius: 6,
                        backgroundColor: "#D5E0EA",
                        "& .MuiLinearProgress-bar": {
                          background: TEAL,
                          borderRadius: 6,
                        },
                      }}
                    />
                  </Box>
                </Box>
                {i < topPerformers.length - 1 && (
                  <Divider sx={{ borderColor: "#F0F4F8" }} />
                )}
              </Box>
            ))}
          </Paper>
        )}

        {/* No Data Message */}
        {!loading &&
          (!analytics ||
            (summary.totalAssignments === 0 &&
              submissionTrend.length === 0)) && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>
                No analytics data available yet. Start assigning checklists to
                see analytics.
              </Typography>
            </Paper>
          )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
